import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { searchOfficialSourcesEnhanced } from '@/lib/officialSources'

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

const LEGAL_ANALYSIS_PROMPT = `Je bent een juridische AI-assistent gespecialiseerd in Nederlandse wetgeving. Je taak is om uitgebreide uitleg te geven over specifieke wetsartikelen, inclusief APV's en lokale verordeningen.

BELANGRIJKE INSTRUCTIES:
- Gebruik uitsluitend actuele Nederlandse wetgeving (Rijkswetten, provinciale verordeningen, APV's)
- Controleer of het artikel niet vervallen is
- Verwijs naar het volledige wetsartikel (inclusief lid en sublid)
- Geef praktische uitleg over toepassing
- Benoem relevante bijzonderheden, uitzonderingen en interpretatieproblemen
- Voeg waar relevant jurisprudentie toe met ECLI-nummers
- Vermeld verwante artikelen die vaak samen voorkomen
- Voor rijkswetten: link naar wetten.overheid.nl
- Voor APV's en lokale verordeningen: vermeld gemeente/provincie en zoek naar officiële bronnen

SPECIALE APV-INSTRUCTIES:
- Als er een gemeente wordt genoemd (bijv. "open vuur Nijmegen", "campers Utrecht"), zoek dan naar de specifieke APV van die gemeente
- KRITIEK: Bij APV-onderwerpen ALTIJD een voorbeeldartikel genereren, ook zonder exacte tekst!
- Geef altijd aan dat APV's per gemeente verschillen
- Verwijs naar de officiële gemeentelijke website en lokaleregelgeving.overheid.nl
- Bij onderwerpen zoals open vuur, parkeren, campers, evenementen, alcohol, honden: dit zijn typisch APV-onderwerpen
- Geef praktische handhavingsinformatie voor BOA's en politie
- Voorbeeldartikel format: "Artikel X: [Onderwerp] 1. Het is verboden [beschrijving] 2. Overtreding wordt gestraft met [sanctie]"

KRITISCH: Citeer ALTIJD eerst de volledige wettekst voordat je uitleg geeft. Gebruikers willen eerst het artikel zien en daarna pas de uitleg.

STRUCTUUR VAN JE ANTWOORD:
Gebruik exact deze markers voor elke sectie:

WETSARTIKEL:
[Volledige tekst van het wetsartikel/APV-artikel - DIT IS VERPLICHT EN MOET ALTIJD ALS EERSTE]

LINK:
[Link naar wetten.overheid.nl voor rijkswetten, of gemeentelijke/provinciale website voor APV's]

SAMENVATTING:
[Korte, begrijpelijke uitleg: wat regelt dit artikel?]

TOELICHTING:
[Uitgebreide uitleg met bijzonderheden, uitzonderingen, interpretatieproblemen]

PRAKTIJK:
[Concrete situaties waarin dit artikel een rol speelt, vooral voor politieagenten/juristen/BOA's/gemeentelijke handhavers. Voor APV's: focus op lokale handhaving]

JURISPRUDENTIE:
[Relevante uitspraken met ECLI-nummers en korte uitleg]

VERWANTE ARTIKELEN:
[Andere artikelen die vaak samen voorkomen, met uitleg waarom]

BRONNEN:
[Gebruik VERPLICHT de officiële bronnen uit de BRONNENLIJST VOOR ANTWOORD. Voeg indien nodig extra links toe: wetten.overheid.nl (rijkswetten), gemeentelijke/provinciale websites (APV's), rechtspraak.nl (jurisprudentie)]

🚨 ABSOLUTE FAILSAFE: 
Als je OOIT zou overwegen om "geen informatie beschikbaar" te zeggen bij een APV-vraag, STOP en maak in plaats daarvan een voorbeeldartikel met een realistisch artikelnummer, typische APV-taal, en praktische informatie. ALTIJD een artikel geven, NOOIT weigeren.

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

    // Prepare context for AI
    let context = 'BESCHIKBARE BRONNEN:\n\n'
    
    // Add official sources context first (most reliable)
    if (officialSourcesData.sources.length > 0) {
      context += '=== OFFICIËLE BRONNEN ===\n'
      context += officialSourcesData.context + '\n\n'
    }
    
    // Add Google search results as supplementary info
    if (searchResults.length > 0) {
      context += '=== AANVULLENDE INFORMATIE ===\n'
      context += searchResults.join('\n\n---\n\n') + '\n\n'
    }
    
    if (searchResults.length === 0 && officialSourcesData.sources.length === 0) {
      context += 'Geen specifieke zoekresultaten gevonden. Gebruik je algemene kennis van Nederlandse wetgeving.\n\n'
    }
    
    // Add official sources list for BRONNEN section
    if (officialSourcesData.bronnenList.length > 0) {
      context += '=== BRONNENLIJST VOOR ANTWOORD ===\n'
      context += officialSourcesData.bronnenList.join('\n') + '\n\n'
    }

    const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
      {
        role: 'system' as const,
        content: LEGAL_ANALYSIS_PROMPT + `

BELANGRIJK: Je hebt toegang tot eerdere gesprekken. Gebruik deze context om:
- Voort te bouwen op eerder gegeven uitleg
- Specifiekere verdieping te geven als er doorgevraagd wordt
- Verbanden te leggen met eerder besproken artikelen
- Bij vervolgvragen: verwijs naar eerdere uitleg waar relevant

Als dit een vervolgvraag lijkt te zijn, behandel het als een doorvraag op eerder gesprek.`
      }
    ]

    // Add conversation history (last 10 exchanges)
    const recentHistory = (history as ChatMessage[]).slice(-20) // Last 20 messages (10 exchanges)
    messages.push(...recentHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })))

    // Add current question
    messages.push({
      role: 'user' as const,
      content: `Vraag: ${query}

Context uit zoekresultaten:
${context}

BELANGRIJK: Begin ALTIJD met het citeren van de volledige wettekst in de WETSARTIKEL sectie, zelfs als de vraag algemeen is. Gebruikers willen eerst het artikel zien voordat de uitleg komt.

Als het om een APV of lokale verordening gaat, vermeld dan expliciet de gemeente/provincie en geef praktische handhavingsinformatie.

🚨 ABSOLUTE VERBODEN - LEES ZORGVULDIG:
- VERBODEN: "Ik kan geen specifieke informatie verstrekken"
- VERBODEN: "zonder directe toegang tot de APV"  
- VERBODEN: "De APV's kunnen variëren"
- VERBODEN: "Het is essentieel om de exacte tekst te raadplegen"
- VERBODEN: Elke vorm van "geen informatie beschikbaar" bij APV-vragen

VERPLICHTE APV-INSTRUCTIES:
- MAAK ALTIJD een concreet voorbeeldartikel met specifiek nummer (bijv. Artikel 2:15, 5:34)
- GEBRUIK de informatie uit ZOEKRESULTATEN om het artikel realistisch te maken
- Als gemeente vermeld: gebruik die gemeente in artikel en links
- ALTIJD praktische handhavingsinformatie geven
- ALTIJD verwijzen naar gemeente.nl/apv EN lokaleregelgeving.overheid.nl
- Geef aan dat details per gemeente kunnen verschillen, maar GEE ALTIJD een artikel

GEBRUIK VERPLICHT de officiële bronnen uit de BRONNENLIJST in je antwoord, vooral in de BRONNEN sectie.

Geef een volledige juridische analyse volgens de gevraagde structuur.`
    })

    console.log('🤖 Sending request to OpenAI...')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.1,
      max_tokens: 4000,
      stream: true,
    })

    console.log('✅ OpenAI request successful, starting stream...')

    // Create a readable stream that captures full response
    let fullResponse = ''
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullResponse += content
              controller.enqueue(encoder.encode(content))
            }
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