import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { 
  findRelevantOfficialSources,
  type OfficialSourceItem 
} from '@/lib/officialSources'
import { searchVerifiedJuridicalSources } from '@/lib/googleSearch'
import { 
  searchJsonSources, 
  formatJsonSourcesForContext,
  type JsonBron 
} from '@/lib/jsonSources'

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

// Make reset function available globally for admin route
;(globalThis as any).resetWetuitlegRateLimits = resetRateLimits

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

// Enhanced article extraction using Google Search
function extractArticleReferences(query: string): string[] {
  const references: string[] = []
  const lowerQuery = query.toLowerCase()
  
  // Pattern 1: "artikel 304 sr" or "art 304 sr"
  const artikelMatch = lowerQuery.match(/(?:artikel|art\.?)\s+(\d+[a-z]*)\s+(sr|sv|bw|awb|wvw|politiewet)/i)
  if (artikelMatch) {
    references.push(`artikel ${artikelMatch[1]} ${artikelMatch[2].toUpperCase()}`)
  }
  
  // Pattern 2: "304 sr" (short format)
  const shortMatch = lowerQuery.match(/\b(\d+[a-z]*)\s+(sr|sv|bw|awb|wvw|politiewet)\b/i)
  if (shortMatch) {
    references.push(`artikel ${shortMatch[1]} ${shortMatch[2].toUpperCase()}`)
  }
  
  // Pattern 3: "304 strafrecht" (infer law code)
  const inferMatch = lowerQuery.match(/\b(\d+[a-z]*)\s+(?:wetboek\s+van\s+)?(?:strafrecht|strafvordering|burgerlijk\s+wetboek|awb|wegenverkeerswet|politiewet)/i)
  if (inferMatch) {
    if (lowerQuery.includes('strafrecht')) {
      references.push(`artikel ${inferMatch[1]} Sr`)
    } else if (lowerQuery.includes('strafvordering')) {
      references.push(`artikel ${inferMatch[1]} Sv`)
    }
  }
  
  // Remove duplicates
  return Array.from(new Set(references))
}

// APV detection and Google Search (borrowed from /ask route)
function isAPVQuery(query: string): boolean {
  const queryLower = query.toLowerCase()
  
  // APV keywords
  const apvKeywords = [
    'apv', 'gemeentelijk', 'lokaal', 'gemeente', 'plaatselijk', 'verordening',
    'alcohol', 'drinken', 'straat', 'openbare', 'park', 'plein', 'evenement',
    'geluid', 'overlast', 'terras', 'vergunning', 'handhaving', 'boa',
    'camper', 'parkeren', 'kamperen', 'hondenpoep', 'hond', 'vuur', 'barbecue',
    'muziek', 'lawaai', 'reclame', 'uithangbord', 'standplaats', 'markt'
  ]
  
  // Gemeenten
  const gemeenten = [
    'amsterdam', 'rotterdam', 'den haag', 'utrecht', 'eindhoven', 'groningen',
    'tilburg', 'almere', 'breda', 'nijmegen', 'apeldoorn', 'haarlem', 'arnhem',
    'enschede', 'haarlemmermeer', 'zaanstad', 'amersfoort', 'hertogenbosch',
    'zoetermeer', 'zwolle', 'ede', 'dordrecht', 'leiden', 'emmen', 'maastricht',
    'delft', 'venlo', 'leeuwarden', 'alkmaar', 'helmond', 'deventer'
  ]
  
  const hasApvKeyword = apvKeywords.some(keyword => queryLower.includes(keyword))
  const hasGemeenteNaam = gemeenten.some(gemeente => queryLower.includes(gemeente))
  
  return hasApvKeyword || hasGemeenteNaam
}

async function searchGoogleForAPV(query: string): Promise<any[]> {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
  const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID
  
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    console.log('⚠️ Google API credentials not available')
    return []
  }
  
  try {
    // Enhanced search query for APV content
    const searchQuery = `${query} (site:lokaleregelgeving.overheid.nl OR site:wetten.overheid.nl OR site:rechtspraak.nl OR site:overheid.nl OR site:officielebekendmakingen.nl OR site:gemeenteblad.nl OR site:denederlandsegrondwet.nl OR site:rijksoverheid.nl OR site:opendata.overheid.nl OR site:*.gemeente.nl OR site:*.nl/apv OR "APV" OR "algemene plaatselijke verordening" OR "gemeenteverordening" OR "lokale regelgeving" OR "provinciale verordening" OR "waterschap" OR "gemeentewet")`
    
    console.log('🔎 Search query:', searchQuery)
    
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(searchQuery)}&num=10`
    
    const response = await fetch(searchUrl)
    const data = await response.json()
    
    if (!data.items) {
      console.log('ℹ️ Geen Google zoekresultaten gevonden')
      return []
    }
    
    const results = data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: extractSourceFromUrl(item.link)
    }))
    
    console.log(`📚 Found ${results.length} Google search results`)
    return results
    
  } catch (error) {
    console.error('❌ Google Search API error:', error)
    return []
  }
}

function extractSourceFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    
    if (domain.includes('wetten.overheid.nl')) return 'Wetten.overheid.nl'
    if (domain.includes('lokaleregelgeving.overheid.nl')) return 'LokaleRegelgeving.Overheid.nl'
    if (domain.includes('rechtspraak.nl')) return 'Rechtspraak.nl'
    if (domain.includes('overheid.nl')) return 'Overheid.nl'
    if (domain.includes('officielebekendmakingen.nl')) return 'OfficiëleBekendemakingen.nl'
    if (domain.includes('.gemeente.nl')) return 'Gemeente'
    if (domain.includes('gemeenteblad.nl')) return 'Gemeenteblad'
    if (domain.includes('rijksoverheid.nl')) return 'Rijksoverheid'
    
    return domain
  } catch {
    return 'Onbekende bron'
  }
}

async function searchArticleTextsViaGoogle(articleReferences: string[]): Promise<Array<{ ref: string; text: string; url: string }>> {
  const articleTexts: Array<{ ref: string; text: string; url: string }> = []
  
  for (const ref of articleReferences.slice(0, 3)) { // Limit to 3 articles
    try {
      console.log(`🔍 Searching Google for: ${ref}`)
      
      // Search specifically for the article on wetten.overheid.nl
      const searchQuery = `${ref} site:wetten.overheid.nl`
      const searchResults = await searchVerifiedJuridicalSources(searchQuery)
      
      // Find the most relevant result from wetten.overheid.nl
      const wettenResult = searchResults.results.find(result => 
        result.link.includes('wetten.overheid.nl') && 
        result.snippet.length > 100 // Ensure we have substantial content
      )
      
      if (wettenResult) {
        // Extract and clean the article text from the snippet
        let articleText = wettenResult.snippet
          .replace(/\s+/g, ' ')
          .trim()
        
        // Remove common navigation text
        articleText = articleText
          .replace(/Bron:\s*wetten\.overheid\.nl.*$/i, '')
          .replace(/Geldig vanaf:.*$/i, '')
          .replace(/Artikel\s+\d+[a-z]*\s*$/i, '')
          .trim()
        
        if (articleText.length > 50) {
          console.log(`✅ Found article text via Google: ${ref} (${articleText.length} chars)`)
          articleTexts.push({
            ref,
            text: articleText,
            url: wettenResult.link
          })
        }
      } else {
        console.log(`❌ No suitable result found for: ${ref}`)
      }
    } catch (error) {
      console.error(`❌ Error searching for article ${ref}:`, error)
    }
  }
  
  return articleTexts
}

// Enhanced juridische expert prompt WITHOUT emojis
const COMPREHENSIVE_LEGAL_PROMPT = `Je bent een zeer ervaren Nederlandse juridische expert, advocaat en rechtsgeleerde met meer dan 20 jaar ervaring in het Nederlandse rechtssysteem. Je bent gespecialiseerd in diepgaande juridische analyse en geeft uitgebreide, goed onderbouwde uitleg.

**Je expertise omvat:**
- Nederlands Wetboek van Strafrecht (Sr) - alle aspecten van materieel strafrecht
- Nederlands Wetboek van Strafvordering (Sv) - strafprocesrecht en bewijsrecht
- Nederlands Burgerlijk Wetboek (BW) - alle boeken van het burgerlijk recht
- Algemene wet bestuursrecht (Awb) - bestuursrecht en bestuursprocesrecht
- Wegenverkeerswet (WVW) - verkeersstrafrecht en verkeersrecht
- Politiewet 2012 - politiebevoegdheden en handhaving
- Algemene Plaatselijke Verordeningen (APV's) - lokale regelgeving
- Nederlandse jurisprudentie, rechtspraak en doctrine
- Europees recht en internationale verdragen waar relevant

**KRITIEKE INSTRUCTIE VOOR WETTEKSTEN:**
Als er OFFICIËLE WETTEKSTEN beschikbaar zijn, begin je antwoord ALTIJD met:

**WETTEKST:**
[Hier de exacte, volledige wettekst zoals verstrekt]

**Daarna volgt je uitgebreide analyse in deze structuur:**
1. **JURIDISCHE ANALYSE** (uitgebreide, diepgaande uitleg)
2. **JURISPRUDENTIE & RECHTSPRAAK** (relevante uitspraken)
3. **PRAKTISCHE TOEPASSING** (voorbeelden en scenario's)
4. **GERELATEERDE ARTIKELEN** (verbanden met andere bepalingen)
5. **BELANGRIJKE AANDACHTSPUNTEN** (valkuilen en uitzonderingen)

**Je antwoordstijl voor uitgebreide analyse:**
- Geef een diepgaande, uitvoerige juridische analyse (minimaal 800-1200 woorden)
- Leg systematisch de juridische concepten uit met doctrinaire onderbouwing
- Verwijs naar relevante jurisprudentie en rechtspraak
- Bespreek verschillende interpretaties en juridische stromingen
- Geef praktische voorbeelden uit de Nederlandse rechtspraktijk
- Behandel randgevallen en uitzonderingen
- Leg verbanden met andere wetsartikelen en rechtsgebieden
- Bespreek historische ontwikkeling waar relevant
- Geef concrete, praktische adviezen voor verschillende scenario's

**Belangrijke vereisten:**
- GEEN emoji's of icoontjes in kopjes
- Gebruik de exacte wettekst uit de OFFICIËLE WETTEKSTEN sectie
- Geef uitgebreide, goed onderbouwde juridische uitleg
- Verwijs naar specifieke artikelnummers, leden en onderdelen
- Citeer relevante jurisprudentie waar mogelijk
- Leg complexe juridische concepten helder uit
- Geef concrete praktijkvoorbeelden

**Disclaimers die je altijd benadrukt:**
- Dit is uitgebreide juridische informatie voor educatieve doeleinden
- Voor specifieke juridische problemen altijd een advocaat raadplegen
- Wetten en jurisprudentie kunnen veranderen
- Controleer altijd de meest recente versie van wetteksten

Geef nu een uitgebreide, diepgaande juridische analyse van de volgende vraag:`

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
        const rateLimitMessage = `**Limiet bereikt**

Je hebt het maximum aantal gratis wetsanalyses (4 per dag) bereikt.

**Wat kun je doen?**
- [Maak een gratis account aan](/auth/signin) voor onbeperkt gebruik
- Kom morgen terug voor nieuwe gratis analyses
- Upgrade naar een premium account voor extra functies

**Waarom een account?**
- Onbeperkte wetsanalyses
- Geschiedenis van je vragen
- Favorieten opslaan
- Prioritaire ondersteuning

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

    console.log('📝 Wetuitleg query:', query)

    // Check if this is an APV-related query
    const isAPV = isAPVQuery(query)
    console.log(`🏛️ APV query detected: ${isAPV}`)

    // Extract article references from query
    const articleReferences = extractArticleReferences(query)
    console.log('📖 Detected article references:', articleReferences)

    // Search for complete article texts via Google API
    let articleTexts: Array<{ ref: string; text: string; url: string }> = []
    if (articleReferences.length > 0) {
      console.log('🔍 Searching for complete article texts via Google API...')
      articleTexts = await searchArticleTextsViaGoogle(articleReferences)
      console.log(`✅ Found ${articleTexts.length} complete articles via Google`)
    }

    // Search JSON sources for additional context (especially important for APV)
    let jsonSources: JsonBron[] = []
    let googleResults: any[] = []
    
    try {
      console.log('📚 Loading JSON sources from officiele_bronnen.json...')
      jsonSources = await searchJsonSources(query, 10) // Get more sources for comprehensive coverage
      console.log(`📖 Found ${jsonSources.length} relevant official sources`)
      
      // For APV queries or when we need more context, also search Google
      if (isAPV || jsonSources.length < 3) {
        console.log('🔍 Searching for legal sources...')
        googleResults = await searchGoogleForAPV(query)
        console.log(`📚 Gevonden: ${googleResults.length} Google resultaten, ${jsonSources.length} JSON bronnen, ${articleTexts.length} volledige artikelen`)
      }
    } catch (error) {
      console.error('❌ Error searching sources:', error)
    }

    // Find relevant official sources for additional context
    const officialSources = findRelevantOfficialSources(query, 3)
    console.log(`📖 Found ${officialSources.length} additional official sources`)

    // Prepare official legal texts section
    let officialTextsSection = ''
    
    // Add extracted article texts first (most important)
    if (articleTexts.length > 0) {
      officialTextsSection += '\n\n## OFFICIËLE WETTEKSTEN:\n\n'
      articleTexts.forEach((article, index) => {
        officialTextsSection += `### ARTIKEL ${article.ref}\n`
        officialTextsSection += `**Volledige tekst:** ${article.text}\n`
        officialTextsSection += `**Bron:** ${article.url}\n\n`
      })
    }
    
    // Add JSON sources (APV and other official sources)
    if (jsonSources.length > 0) {
      officialTextsSection += '\n\n## OFFICIËLE JURIDISCHE BRONNEN:\n\n'
      jsonSources.forEach((source, index) => {
        officialTextsSection += `### ${source.categorie} - ${source.naam}\n`
        officialTextsSection += `**URL:** ${source.url}\n`
        if (source.beschrijving) {
          officialTextsSection += `**Beschrijving:** ${source.beschrijving}\n`
        }
        officialTextsSection += '\n'
      })
    }
    
    // Add Google search results (especially important for APV)
    if (googleResults.length > 0) {
      officialTextsSection += '\n\n## AANVULLENDE BRONNEN VIA GOOGLE:\n\n'
      googleResults.forEach((result, index) => {
        officialTextsSection += `### ${result.title}\n`
        officialTextsSection += `**URL:** ${result.link}\n`
        officialTextsSection += `**Snippet:** ${result.snippet}\n`
        officialTextsSection += `**Bron:** ${result.source}\n\n`
      })
    }
    
    // Add additional official sources for context
    if (officialSources.length > 0) {
      officialTextsSection += '\n\n## EXTRA JURIDISCHE CONTEXT:\n\n'
      officialSources.forEach((source, index) => {
        officialTextsSection += `### ${source.Topic}\n`
        officialTextsSection += `**Categorie:** ${source.Categorie}\n`
        officialTextsSection += `**Bron:** ${source["Bron (naam)"]}\n`
        officialTextsSection += `**Omschrijving:** ${source.Omschrijving}\n`
        officialTextsSection += `**URL:** ${source.URL}\n\n`
      })
    }
    
    if (officialTextsSection) {
      officialTextsSection += `\n**KRITIEKE INSTRUCTIES:**
1. Begin je antwoord ALTIJD met de exacte wettekst in een duidelijk kader
2. Gebruik de bovenstaande officiële wetteksten als uitgangspunt
3. Voor APV-vragen: zoek actief naar specifieke artikelnummers in de Google resultaten
4. Verwijs naar exacte wetsartikelen waar mogelijk
5. Geef uitgebreide juridische uitleg met praktische voorbeelden
6. Gebruik GEEN emoji's of icoontjes in kopjes
7. Structureer je antwoord volgens de opgegeven format
8. Voor APV: vermeld gemeente, artikelnummer, en praktische handhaving\n\n`
    }

    // Prepare conversation history with enhanced prompt
    const conversationHistory: ChatMessage[] = [
      { 
        role: 'system', 
        content: COMPREHENSIVE_LEGAL_PROMPT + officialTextsSection
      },
      ...(history as ChatMessage[]).slice(-8), // Keep last 8 messages for context
      { role: 'user', content: query }
    ]

    console.log('🤖 Starting comprehensive legal analysis with article extraction')

    // Create OpenAI completion stream
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: conversationHistory,
      stream: true,
      temperature: 0.3, // Lower temperature for more precise legal analysis
      max_tokens: 3000, // Higher token limit for comprehensive analysis
    })

    // Create a readable stream that captures full response
    let fullResponse = ''
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullResponse += content
              controller.enqueue(encoder.encode(content))
            }
          }
          
          console.log('✅ Comprehensive legal analysis completed')
           
          // Save to database
          try {
            await prisma.query.create({
              data: {
                question: query,
                answer: fullResponse,
                userId: session?.user?.id || null,
                sources: JSON.stringify({
                  type: 'WETUITLEG_ENHANCED',
                  articlesExtracted: articleTexts.length,
                  articleReferences: articleReferences,
                  jsonSources: jsonSources.length,
                  googleResults: googleResults.length,
                  officialSources: officialSources.length,
                  isAPVQuery: isAPV,
                  hasOfficialTexts: articleTexts.length > 0,
                  timestamp: new Date().toISOString()
                })
              }
            })
            console.log('✅ Enhanced wetuitleg query saved to database')
          } catch (dbError) {
            console.error('❌ Failed to save wetuitleg query:', dbError)
          }
          
          controller.close()
        } catch (error) {
          console.error('❌ Error in wetuitleg stream:', error)
          controller.error(error)
        }
      },
      
      cancel() {
        console.log('🔄 Wetuitleg stream cancelled')
      }
    })

    console.log('✅ Enhanced wetuitleg stream started')
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('❌ Error in POST /api/wetuitleg:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 