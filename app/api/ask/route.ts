// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { 
  searchJsonSources, 
  formatJsonSourcesForContext,
  type JsonBron 
} from '@/lib/jsonSources'
import {
  checkBijzondereWetgeving,
  checkActueleWetgeving,
  type BijzondereWet,
  type WetUpdate
} from '@/lib/officialSources'
import { searchGoogleCustom } from '@/lib/googleSearch'
import { streamingCompletion } from '@/lib/openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface GoogleSearchResult {
  title: string
  link: string
  snippet: string
  source: string
}

/**
 * STAP 3: Google Custom Search API integratie
 * Zoekt uitsluitend binnen vooraf ingestelde officiële bronnen
 */
async function searchGoogleCustomAPI(query: string): Promise<GoogleSearchResult[]> {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
  const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID
  
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    console.log('⚠️ Google API credentials niet geconfigureerd')
    return []
  }
  
  try {
    console.log('🌐 Searching Google Custom Search API for:', query)
    
    // Verbeter zoekterm voor APV vragen
    let searchQuery = query
    const queryLower = query.toLowerCase()
    
    if (queryLower.includes('apv') || queryLower.includes('gemeentelijk') || queryLower.includes('lokaal')) {
      // Voor APV vragen: voeg specifieke zoektermen toe
      searchQuery = `${query} site:lokaleregelgeving.overheid.nl OR site:overheid.nl APV verordening`
      console.log('🏛️ APV-specifieke zoekopdracht:', searchQuery)
    }
    
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(searchQuery)}&num=10`
    
    const response = await fetch(searchUrl)
    const data = await response.json()
    
    if (!data.items) {
      console.log('ℹ️ Geen Google zoekresultaten gevonden')
      return []
    }
    
    const results: GoogleSearchResult[] = data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: extractSourceFromUrl(item.link)
    }))
    
    console.log(`✅ ${results.length} Google zoekresultaten gevonden`)
    return results
    
  } catch (error) {
    console.error('❌ Google Custom Search API error:', error)
    return []
  }
}

/**
 * Extraheert de bron uit een URL voor identificatie
 */
function extractSourceFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    
    if (domain.includes('wetten.overheid.nl')) return 'Wetten.overheid.nl'
    if (domain.includes('lokaleregelgeving.overheid.nl')) return 'LokaleRegelgeving.Overheid.nl'
    if (domain.includes('rechtspraak.nl')) return 'Rechtspraak.nl'
    if (domain.includes('overheid.nl')) return 'Overheid.nl'
    if (domain.includes('officielebekendmakingen.nl')) return 'OfficiëleBekendemakingen.nl'
    if (domain.includes('belastingdienst.nl')) return 'Belastingdienst'
    if (domain.includes('uwv.nl')) return 'UWV'
    if (domain.includes('politie.nl')) return 'Politie.nl'
    if (domain.includes('rijksoverheid.nl')) return 'Rijksoverheid'
    if (domain.includes('cbr.nl')) return 'CBR'
    if (domain.includes('cbs.nl')) return 'CBS'
    if (domain.includes('juridischloket.nl')) return 'Juridisch Loket'
    
    return domain
  } catch {
    return 'Onbekende bron'
  }
}

/**
 * Formatteert Google zoekresultaten voor context
 */
function formatGoogleResultsForContext(results: GoogleSearchResult[]): string {
  if (results.length === 0) {
    return ''
  }
  
  return results.map(result => {
    return `**${result.title}** (${result.source})
URL: ${result.link}
Samenvatting: ${result.snippet}
---`
  }).join('\n\n')
}

/**
 * ROUTING LOGICA: Bepaalt of Google API nodig is
 */
function needsGoogleSearch(jsonSources: JsonBron[], query: string): boolean {
  // Als er geen directe match is in JSON bronnen
  if (jsonSources.length === 0) {
    console.log('🔍 Geen JSON matches - Google API wordt geraadpleegd')
    return true
  }
  
  // Als de dekking twijfelachtig is (minder dan 3 relevante bronnen)
  if (jsonSources.length < 3) {
    console.log('🔍 Beperkte JSON dekking - Google API wordt geraadpleegd voor aanvulling')
    return true
  }
  
  // Specifieke gevallen waar Google altijd wordt geraadpleegd
  const queryLower = query.toLowerCase()
  const needsGoogleKeywords = [
    'apv', 'gemeentelijk', 'lokaal', 'nieuw beleid', 'recent', 'actueel',
    'jurisprudentie', 'uitspraak', 'vonnis', 'arrest'
  ]
  
  const needsGoogle = needsGoogleKeywords.some(keyword => queryLower.includes(keyword))
  if (needsGoogle) {
    console.log('🔍 Query bevat keywords die Google API vereisen')
    return true
  }
  
  console.log('✅ Voldoende JSON dekking - Google API niet nodig')
  return false
}

export async function POST(request: NextRequest) {
  try {
    const { question, profession = 'algemeen', history = [], wetUitleg = false } = await request.json()

    if (!question) {
      return NextResponse.json({ error: 'Vraag is verplicht' }, { status: 400 })
    }

    console.log('🚀 WetHelder.nl Routing gestart voor vraag:', question)

    // Get user session (optional for anonymous users)
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    // Rate limit check for anonymous users
    if (!session?.user) {
      const clientIp = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'

      // Check how many questions this IP has asked in the last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      
      const recentQuestions = await prisma.query.count({
        where: {
          userId: null,
          createdAt: {
            gte: twentyFourHoursAgo
          },
          // Use IP-based tracking (storing in sources field for now)
          sources: {
            contains: clientIp
          }
        }
      })

      console.log(`🔍 Anonymous user (IP: ${clientIp}) has asked ${recentQuestions} questions in last 24h`)

      if (recentQuestions >= 4) {
        console.log('❌ Rate limit exceeded for anonymous user')
        
        // Instead of returning an error, return a friendly rate limit message as a stream
        const rateLimitMessage = `🔒 **Limiet bereikt**

Je hebt het maximum aantal gratis vragen (4 per dag) bereikt. 

**Maak een gratis account aan om:**
• Onbeperkt vragen te stellen
• Je vraaggeschiedenis te bewaren
• Snellere antwoorden te krijgen

**Registreren is gratis en duurt slechts 30 seconden!**

[→ Account aanmaken](/auth/signup)
[→ Inloggen](/auth/signin)

---
*WetHelder blijft volledig gratis te gebruiken met een account.*`

        // Create a ReadableStream to simulate the normal response format
        const stream = new ReadableStream({
          start(controller) {
            // Send the rate limit message in the expected streaming format
            const encoder = new TextEncoder()
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: rateLimitMessage })}\n\n`))
            // Send a signal to update remaining questions to 0
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ remainingQuestions: 0 })}\n\n`))
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
            controller.close()
          }
        })

        // Save the rate limit "query" to database for tracking
        const clientIp = request.headers.get('x-forwarded-for') || 
                         request.headers.get('x-real-ip') || 'unknown'
        saveQueryToDatabase(question, rateLimitMessage, profession, null, [], '', clientIp)
          .catch(error => console.error('❌ Error saving rate limit query:', error))

        return new NextResponse(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          }
        })
      }
    }

    // STAP 1: Eerste controle via officiele_bronnen.json
    console.log('📋 STAP 1: Controle officiele_bronnen.json')
    let jsonSources: JsonBron[] = []
    let jsonContext = ''
    
    try {
      jsonSources = await searchJsonSources(question, 10)
      if (jsonSources.length > 0) {
        jsonContext = formatJsonSourcesForContext(jsonSources)
        console.log(`✅ ${jsonSources.length} relevante JSON bronnen gevonden`)
      } else {
        console.log('ℹ️ Geen relevante JSON bronnen gevonden')
      }
    } catch (error) {
      console.error('❌ Fout bij JSON bronnen zoeken:', error)
    }

    // STAP 2: Evalueer of Google API nodig is
    console.log('🔍 STAP 2: Evaluatie Google API noodzaak')
    let googleResults: string = ''
    
    // Check if query needs Google API
    const queryLower = question.toLowerCase()
    const needsGoogleKeywords = [
      'apv', 'gemeentelijk', 'lokaal', 'gemeente', 'plaatselijk', 'verordening',
      'nieuw beleid', 'recent', 'actueel', 'jurisprudentie', 'uitspraak', 'vonnis', 'arrest'
    ]
    
    const needsGoogle = needsGoogleKeywords.some(keyword => queryLower.includes(keyword)) || jsonSources.length < 3
    
    if (needsGoogle) {
      if (needsGoogleKeywords.some(keyword => queryLower.includes(keyword))) {
        console.log('🔍 Query bevat keywords die Google API vereisen (APV/lokaal/actueel)')
      } else {
        console.log('🔍 Beperkte JSON dekking - Google API wordt geraadpleegd')
      }
      
      console.log('🌐 STAP 3: Google Custom Search API wordt geraadpleegd')
      console.log('🌐 Searching Google Custom Search API for:', question)
      
      try {
        const results = await searchGoogleCustomAPI(question)
        if (results.length > 0) {
          googleResults = results.map(r => `${r.title}\n${r.snippet}\nBron: ${r.link}`).join('\n\n')
          console.log(`✅ ${results.length} Google zoekresultaten gevonden`)
          console.log(`✅ ${results.length} Google resultaten toegevoegd`)
        } else {
          console.log('ℹ️ Geen Google zoekresultaten gevonden')
        }
      } catch (error) {
        console.error('❌ Fout bij Google zoeken:', error)
      }
    } else {
      console.log('✅ Voldoende JSON dekking - Google API niet nodig')
      console.log('⏭️ STAP 3: Google API overgeslagen - voldoende JSON dekking')
    }

    // STAP 4: Samenstellen input voor ChatGPT
    console.log('🤖 STAP 4: Input samenstelling voor ChatGPT')
    console.log(`🤖 Starting OpenAI request met ${jsonSources.length} JSON bronnen en ${googleResults ? '10' : '0'} Google resultaten`)

    // Create a stream that captures the response for database storage
    let fullResponse = ''
    const originalStream = await streamingCompletion({
      question,
      profession,
      jsonContext,
      googleResults,
      history,
      wetUitleg
    })

    const transformedStream = new ReadableStream({
      async start(controller) {
        const reader = originalStream.getReader()
        
        try {
          while (true) {
            const { done, value } = await reader.read()
            
            if (done) {
              // Save query to database with full response
              const clientIp = !session?.user ? (request.headers.get('x-forwarded-for') || 
                               request.headers.get('x-real-ip') || 'unknown') : null
              saveQueryToDatabase(question, fullResponse, profession, userId, jsonSources, googleResults, clientIp)
                .catch(error => console.error('❌ Error saving query to database:', error))
              
              controller.close()
              break
            }
            
            // Decode and collect the response content
            let chunk = ''
            if (value instanceof Uint8Array) {
              chunk = new TextDecoder().decode(value)
            } else if (typeof value === 'string') {
              chunk = value
            } else {
              // Skip processing if value is not in expected format
              controller.enqueue(value)
              continue
            }
            
            // Extract content from data: {content: "..."} format
            const matches = chunk.match(/data: ({.*?})/g)
            if (matches) {
              for (const match of matches) {
                try {
                  const data = JSON.parse(match.replace('data: ', ''))
                  if (data.content) {
                    fullResponse += data.content
                  }
                } catch (e) {
                  // Ignore parsing errors for non-JSON chunks
                }
              }
            }
            
            // Forward the chunk to the client
            controller.enqueue(value)
          }
        } catch (error) {
          console.error('❌ Stream error:', error)
          controller.error(error)
        }
      }
    })

    console.log('✅ OpenAI response streaming started')

    return new NextResponse(transformedStream)

  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json({ 
      error: 'Er is een fout opgetreden bij het verwerken van je vraag. Probeer het opnieuw.' 
    }, { status: 500 })
  }
}

/**
 * Save query to database for admin analytics
 */
async function saveQueryToDatabase(
  question: string, 
  answer: string, 
  profession: string, 
  userId: string | null,
  jsonSources: JsonBron[],
  googleResults: string,
  clientIp: string | null = null
) {
  try {
    const sources = JSON.stringify({
      jsonSources: jsonSources.map(s => ({ naam: s.naam, url: s.url })),
      googleResults: googleResults ? 'Used Google API' : 'No Google API used',
      clientIp: clientIp || 'N/A'
    })

    await prisma.query.create({
      data: {
        question,
        answer: answer || 'Geen antwoord beschikbaar',
        profession,
        userId,
        sources
      }
    })

    console.log('✅ Query saved to database')
  } catch (error) {
    console.error('❌ Error saving query to database:', error)
  }
}

// Handle GET request for rate limit info
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user) {
      return NextResponse.json({
        remainingQuestions: -1, // Unlimited for logged in users
        userRole: session.user.role || 'USER'
      })
    }

    // For anonymous users, check actual usage
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const recentQuestions = await prisma.query.count({
      where: {
        userId: null,
        createdAt: {
          gte: twentyFourHoursAgo
        },
        sources: {
          contains: clientIp
        }
      }
    })

    const remaining = Math.max(0, 4 - recentQuestions)

    return NextResponse.json({
      remainingQuestions: remaining,
      userRole: 'ANONYMOUS',
      questionsUsed: recentQuestions
    })
  } catch (error) {
    console.error('❌ GET Error:', error)
    return NextResponse.json({ 
      error: 'Er is een fout opgetreden' 
    }, { status: 500 })
  }
}

// Handle OPTIONS request
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'GET, POST'
    }
  })
}