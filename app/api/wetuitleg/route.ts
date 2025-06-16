import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

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

async function searchGoogle(query: string): Promise<string[]> {
  try {
    const searchQuery = `${query} site:wetten.overheid.nl OR site:rechtspraak.nl`
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}&num=5`
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

const LEGAL_ANALYSIS_PROMPT = `Je bent een juridische AI-assistent gespecialiseerd in Nederlandse wetgeving. Je taak is om uitgebreide uitleg te geven over specifieke wetsartikelen.

BELANGRIJKE INSTRUCTIES:
- Gebruik uitsluitend actuele Nederlandse wetgeving
- Controleer of het artikel niet vervallen is
- Verwijs naar het volledige wetsartikel (inclusief lid en sublid)
- Geef praktische uitleg over toepassing
- Benoem relevante bijzonderheden, uitzonderingen en interpretatieproblemen
- Voeg waar relevant jurisprudentie toe met ECLI-nummers
- Vermeld verwante artikelen die vaak samen voorkomen
- Voeg altijd een link toe naar wetten.overheid.nl

STRUCTUUR VAN JE ANTWOORD:
Gebruik exact deze markers voor elke sectie:

WETSARTIKEL:
[Volledige tekst van het wetsartikel]

LINK:
[Link naar wetten.overheid.nl]

SAMENVATTING:
[Korte, begrijpelijke uitleg: wat regelt dit artikel?]

TOELICHTING:
[Uitgebreide uitleg met bijzonderheden, uitzonderingen, interpretatieproblemen]

PRAKTIJK:
[Concrete situaties waarin dit artikel een rol speelt, vooral voor politieagenten/juristen/handhavers]

JURISPRUDENTIE:
[Relevante uitspraken met ECLI-nummers en korte uitleg]

VERWANTE ARTIKELEN:
[Andere artikelen die vaak samen voorkomen, met uitleg waarom]

BRONNEN:
[Links naar officiële bronnen zoals wetten.overheid.nl, rechtspraak.nl]

Zorg ervoor dat je antwoord compleet, accuraat en praktisch bruikbaar is voor juridische professionals.`

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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { query } = await request.json()

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

    // Search for relevant information
    const searchResults = await searchGoogle(query)
    console.log(`📚 Found ${searchResults.length} search results`)

    // Prepare context for AI
    let context = 'Zoekresultaten:\n\n'
    if (searchResults.length > 0) {
      context += searchResults.join('\n\n---\n\n')
    } else {
      context += 'Geen specifieke zoekresultaten gevonden. Gebruik je algemene kennis van Nederlandse wetgeving.'
    }

    const messages = [
      {
        role: 'system' as const,
        content: LEGAL_ANALYSIS_PROMPT
      },
      {
        role: 'user' as const,
        content: `Vraag: ${query}

Context uit zoekresultaten:
${context}

Geef een volledige juridische analyse volgens de gevraagde structuur.`
      }
    ]

    console.log('🤖 Sending request to OpenAI...')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.1,
      max_tokens: 4000,
      stream: true,
    })

    console.log('✅ OpenAI request successful, starting stream...')

    // Create a readable stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }
          controller.close()
        } catch (error) {
          console.error('Error in stream:', error)
          controller.error(error)
        }
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