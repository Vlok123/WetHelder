import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { searchOfficialSourcesEnhanced } from '@/lib/officialSources'
import { streamingCompletion } from '@/lib/openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Rate limiting for anonymous users
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000 // 24 hours
const MAX_ANONYMOUS_REQUESTS = 4

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

// Internal function to reset rate limits (for admin use)
function resetRateLimits(): void {
  rateLimitMap.clear()
  console.log('🔄 Wetuitleg rate limits cleared')
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  
  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitMap.set(ip, {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return { allowed: true, remaining: MAX_ANONYMOUS_REQUESTS }
  }
  
  if (entry.count >= MAX_ANONYMOUS_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }
  
  return { allowed: true, remaining: MAX_ANONYMOUS_REQUESTS - entry.count }
}

function incrementRateLimit(ip: string): void {
  const entry = rateLimitMap.get(ip)
  if (entry) {
    entry.count++
  }
}

// Detecteer gemeente in query
function detectGemeente(query: string): string | null {
  const queryLower = query.toLowerCase()
  
  // Lijst van grote Nederlandse gemeentes
  const gemeentes = [
    'amsterdam', 'rotterdam', 'den haag', 'utrecht', 'eindhoven', 'groningen', 'tilburg', 
    'almere', 'breda', 'nijmegen', 'enschede', 'haarlem', 'arnhem', 'zaanstad', 'amersfoort',
    'apeldoorn', 'zwolle', 'ede', 'dordrecht', 'leiden', 'haarlemmermeer', 'zoetermeer', 
    'emmen', 'maastricht', 'delft', 'venlo', 'leeuwarden', 'alkmaar', 'helmond', 'deventer'
  ]
  
  for (const gemeente of gemeentes) {
    if (queryLower.includes(gemeente)) {
      return gemeente
    }
  }
  
  return null
}

async function searchGoogle(query: string): Promise<string[]> {
  try {
    const gemeente = detectGemeente(query)
    let searchQuery = ''
    
    if (gemeente) {
      // Gemeente-specifieke FANATIEKE zoekopdracht op ALLE relevante overheidsites
      searchQuery = `${query} "${gemeente}" (site:${gemeente}.nl OR site:www.${gemeente}.nl OR site:lokaleregelgeving.overheid.nl OR site:wetten.overheid.nl OR site:rechtspraak.nl OR site:overheid.nl OR site:officielebekendmakingen.nl OR site:gemeenteblad.nl OR "APV ${gemeente}" OR "algemene plaatselijke verordening ${gemeente}" OR "${gemeente} verordening" OR "${gemeente} gemeentewet")`
    } else {
      // FANATIEKE APV-zoekopdracht op ALLE Nederlandse overheidsites
      searchQuery = `${query} (site:lokaleregelgeving.overheid.nl OR site:wetten.overheid.nl OR site:rechtspraak.nl OR site:overheid.nl OR site:officielebekendmakingen.nl OR site:gemeenteblad.nl OR site:denederlandsegrondwet.nl OR site:rijksoverheid.nl OR site:opendata.overheid.nl OR site:*.gemeente.nl OR site:*.nl/apv OR "APV" OR "algemene plaatselijke verordening" OR "gemeenteverordening" OR "lokale regelgeving" OR "provinciale verordening" OR "waterschap" OR "gemeentewet")`
    }
    
    console.log('🔎 Search query:', searchQuery)
    
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_CSE_ID}&q=${encodeURIComponent(searchQuery)}&num=10&lr=lang_nl&gl=nl`
    )
    
    if (!response.ok) {
      console.error('Google Search API error:', response.status)
      return []
    }
    
    const data = await response.json()
    const results: string[] = []
    
    if (data.items) {
      for (const item of data.items) {
        results.push(`${item.title}\n${item.snippet}\nBron: ${item.link}`)
      }
    }
    
    return results
  } catch (error) {
    console.error('Error searching Google:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      const ip = getClientIP(request)
      const { remaining } = checkRateLimit(ip)
      
      return NextResponse.json({
        remainingQuestions: remaining,
        userRole: 'ANONYMOUS'
      })
    }
    
    return NextResponse.json({
      remainingQuestions: null,
      userRole: session.user?.role || 'USER'
    })
  } catch (error) {
    console.error('Error in GET /api/wetuitleg:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { query, history = [] } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Rate limiting for anonymous users
    if (!session) {
      const ip = getClientIP(request)
      const { allowed, remaining } = checkRateLimit(ip)
      
      if (!allowed) {
        const rateLimitMessage = `🔒 **Limiet bereikt**

Je hebt het maximum aantal gratis wetsanalyses (4 per dag) bereikt.

**Wat kun je doen?**
- [Maak een gratis account aan](/auth/signin) voor onbeperkt gebruik
- Kom morgen terug voor nieuwe gratis analyses
- Upgrade naar een premium account voor extra functies

**Waarom een account?**
- ✅ Onbeperkte wetsanalyses
- ✅ Geschiedenis van je vragen
- ✅ Favorieten opslaan
- ✅ Prioritaire ondersteuning

[**Gratis account aanmaken →**](/auth/signin)`

        return new Response(rateLimitMessage, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        })
      }
      
      // Increment rate limit
      incrementRateLimit(ip)
    }

    console.log('🔍 Starting legal analysis for:', query)
    console.log('🏛️ Gemeente gedetecteerd:', detectGemeente(query) || 'geen')

    // Search for relevant information from multiple sources
    const searchResults = await searchGoogle(query)
    console.log(`📚 Found ${searchResults.length} Google search results`)

    // Get official sources from our JSON database  
    const officialSourcesData = searchOfficialSourcesEnhanced(query)
    console.log(`📖 Found ${officialSourcesData.sources.length} official sources`)

    // Convert search results to the format expected by streamingCompletion
    const googleResultsFormatted = searchResults.map(result => {
      const lines = result.split('\n')
      return {
        title: lines[0] || 'Geen titel',
        snippet: lines.slice(1, -1).join(' ') || 'Geen beschrijving',
        link: lines[lines.length - 1]?.replace('Bron: ', '') || 'Geen link'
      }
    })

    // Prepare conversation history for streamingCompletion
    const conversationHistory = (history as ChatMessage[]).slice(-20).map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    console.log('🤖 Using streamingCompletion with wetUitleg=true...')

    // Use the streamingCompletion function with wetUitleg=true for natural responses
    const completion = await streamingCompletion(
      query,
      officialSourcesData.sources, // JSON sources
      googleResultsFormatted, // Google results
      'Algemeen', // profession
      true, // wetUitleg = true for natural conversation
      conversationHistory
    )

    console.log('✅ OpenAI request successful, starting stream...')

    // Create a readable stream that captures full response
    let fullResponse = ''
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let hasContent = false
          
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              hasContent = true
              fullResponse += content
              controller.enqueue(encoder.encode(content))
            }
            
            // Check if the completion is done
            if (chunk.choices[0]?.finish_reason) {
              console.log('✅ Completion finished with reason:', chunk.choices[0].finish_reason)
              break
            }
          }
          
          // Ensure we always have some content
          if (!hasContent) {
            const fallbackMessage = "Er is een probleem opgetreden bij het genereren van de response. Probeer het opnieuw."
            fullResponse = fallbackMessage
            controller.enqueue(encoder.encode(fallbackMessage))
          }
          
          // Save query to database with full response
          try {
            await prisma.query.create({
              data: {
                question: query,
                answer: fullResponse,
                profession: 'wetteksten', // Special identifier for wetuitleg queries
                userId: session?.user?.id || null,
                sources: JSON.stringify({
                  type: 'wetuitleg',
                  searchResults: searchResults.length,
                  hasGoogleResults: searchResults.length > 0
                })
              }
            })
            console.log('✅ Wetuitleg query saved to database')
          } catch (dbError) {
            console.error('❌ Error saving wetuitleg query to database:', dbError)
          }
          
          console.log('✅ Stream completed successfully')
          controller.close()
        } catch (error) {
          console.error('❌ Error in stream:', error)
          const errorContent = "Er is een fout opgetreden. Probeer het opnieuw."
          controller.enqueue(encoder.encode(errorContent))
          controller.close()
        }
      },
      
      cancel() {
        console.log('🔄 Stream cancelled by client')
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Error in POST /api/wetuitleg:', error)
    
    const errorMessage = `❌ **Fout bij wetsanalyse**

Er is een technische fout opgetreden bij het analyseren van je vraag.

**Mogelijke oorzaken:**
- Tijdelijke serverprobleem
- API-limiet bereikt
- Netwerkverbinding onderbroken

**Wat kun je doen?**
- Probeer het over een paar minuten opnieuw
- Controleer je internetverbinding
- Neem contact op met ondersteuning als het probleem aanhoudt

**Tips voor betere resultaten:**
- Wees specifiek in je vraag (bijv. "artikel 96b Wetboek van Strafvordering")
- Vermeld de volledige naam van de wet
- Gebruik officiële terminologie`

    return new Response(errorMessage, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }
} 