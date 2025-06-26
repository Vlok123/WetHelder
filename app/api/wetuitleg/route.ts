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

// Enhanced article extraction using Google Search - now supports RV (Reglement Voertuigen)
function extractArticleReferences(query: string): string[] {
  const references: string[] = []
  const lowerQuery = query.toLowerCase()
  
  // Pattern 1: "artikel 304 sr" or "art 304 sr"
  const artikelMatch = lowerQuery.match(/(?:artikel|art\.?)\s+(\d+[a-z]*)\s+(sr|sv|bw|awb|wvw|politiewet|rv)/i)
  if (artikelMatch) {
    references.push(`artikel ${artikelMatch[1]} ${artikelMatch[2].toUpperCase()}`)
  }
  
  // Pattern 2: "304 sr" (short format)
  const shortMatch = lowerQuery.match(/\b(\d+[a-z]*)\s+(sr|sv|bw|awb|wvw|politiewet|rv)\b/i)
  if (shortMatch) {
    references.push(`artikel ${shortMatch[1]} ${shortMatch[2].toUpperCase()}`)
  }
  
  // Pattern 3: NEW - Vehicle regulation patterns like "5.2.42 RV" or "artikel 5.2.42 RV"
  const vehicleMatch = lowerQuery.match(/(?:artikel\s+)?(\d+\.\d+\.\d+)\s+(rv|reglement\s+voertuigen)/i)
  if (vehicleMatch) {
    references.push(`artikel ${vehicleMatch[1]} RV`)
  }
  
  // Pattern 4: NEW - Extended format like "5.2.42 van het RV" 
  const extendedVehicleMatch = lowerQuery.match(/(?:artikel\s+)?(\d+\.\d+\.\d+)\s+(?:van\s+het\s+)?(rv|reglement\s+voertuigen)/i)
  if (extendedVehicleMatch) {
    references.push(`artikel ${extendedVehicleMatch[1]} RV`)
  }
  
  // Pattern 5: NEW - Questions about specific RV articles like "wat zegt 5.2.42 RV"
  const questionMatch = lowerQuery.match(/(?:wat\s+zegt|inhoud\s+van|tekst\s+van)?\s*(\d+\.\d+\.\d+)\s+(rv|reglement\s+voertuigen)/i)
  if (questionMatch) {
    references.push(`artikel ${questionMatch[1]} RV`)
  }
  
  // Pattern 6: "304 strafrecht" (infer law code)
  const inferMatch = lowerQuery.match(/\b(\d+[a-z]*)\s+(?:wetboek\s+van\s+)?(?:strafrecht|strafvordering|burgerlijk\s+wetboek|awb|wegenverkeerswet|politiewet)/i)
  if (inferMatch) {
    if (lowerQuery.includes('strafrecht')) {
      references.push(`artikel ${inferMatch[1]} Sr`)
    } else if (lowerQuery.includes('strafvordering')) {
      references.push(`artikel ${inferMatch[1]} Sv`)
    }
  }
  
  console.log(`🔍 Article extraction from "${query}":`, references)
  
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
    console.log('⚠️ Google API credentials not available for APV search')
    return []
  }
  
  try {
    const queryLower = query.toLowerCase()
    let searchQuery = query
    
    // Enhanced search query specifically for APV content - similar to /ask route
    const apvKeywords = [
      'apv', 'gemeentelijk', 'lokaal', 'gemeente', 'plaatselijk', 'verordening',
      'alcohol', 'drinken', 'straat', 'openbaar', 'park', 'plein', 'evenement',
      'geluid', 'overlast', 'terras', 'vergunning', 'handhaving', 'boa',
      'camper', 'parkeren', 'kamperen', 'hondenpoep', 'hond', 'vuur', 'barbecue',
      'muziek', 'lawaai', 'reclame', 'uithangbord', 'standplaats', 'markt',
      'laadkabel', 'stoep', 'openbare ruimte', 'weggebruik'
    ]
    
    const gemeenten = [
      'amsterdam', 'rotterdam', 'den haag', 'utrecht', 'eindhoven', 'tilburg',
      'groningen', 'almere', 'breda', 'nijmegen', 'apeldoorn', 'haarlem', 'arnhem',
      'enschede', 'haarlemmermeer', 'zaanstad', 'amersfoort', 'hertogenbosch'
    ]
    
    const hasApvKeyword = apvKeywords.some(keyword => queryLower.includes(keyword))
    const hasGemeenteNaam = gemeenten.some(gemeente => queryLower.includes(gemeente))
    
    if (hasApvKeyword || hasGemeenteNaam) {
      // Use the same approach as /ask route for better results
      searchQuery = `${query} site:lokaleregelgeving.overheid.nl OR site:overheid.nl APV "Algemene Plaatselijke Verordening"`
      console.log('🏛️ Enhanced APV-specifieke zoekopdracht:', searchQuery)
    } else {
      // Fallback to the original query format
      searchQuery = `${query} site:lokaleregelgeving.overheid.nl OR (${query} "APV" OR "algemene plaatselijke verordening" OR "gemeenteverordening" site:overheid.nl)`
    }
    
    console.log('🔎 APV Search query:', searchQuery)
    
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(searchQuery)}&num=10`
    
    const response = await fetch(searchUrl)
    const data = await response.json()
    
    if (!data.items) {
      console.log('ℹ️ Geen APV zoekresultaten gevonden')
      return []
    }
    
    const results = data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: extractSourceFromUrl(item.link)
    }))
    
    console.log(`📚 Found ${results.length} APV search results`)
    return results
    
  } catch (error) {
    console.error('❌ APV Google Search API error:', error)
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
      
      let searchQuery = `${ref} site:wetten.overheid.nl`
      
      // Enhanced search for RV (Reglement Voertuigen) articles
      if (ref.includes('RV')) {
        searchQuery = `"${ref}" OR "artikel ${ref.replace('artikel ', '').replace(' RV', '')}" site:wetten.overheid.nl "reglement voertuigen" OR "voertuigreglement"`
        console.log(`🚗 Enhanced RV search query: ${searchQuery}`)
      }
      
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
        
        // For RV articles, try alternative search strategy
        if (ref.includes('RV')) {
          console.log(`🔄 Trying alternative RV search for: ${ref}`)
          const altQuery = `"${ref.replace('artikel ', '').replace(' RV', '')}" "voorruit" OR "zijruit" OR "beschadiging" OR "verkleuring" site:wetten.overheid.nl`
          const altResults = await searchVerifiedJuridicalSources(altQuery)
          
          const altResult = altResults.results.find(result => 
            result.link.includes('wetten.overheid.nl')
          )
          
          if (altResult) {
            console.log(`✅ Found alternative result for ${ref}`)
            articleTexts.push({
              ref,
              text: altResult.snippet,
              url: altResult.link
            })
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error searching for article ${ref}:`, error)
    }
  }
  
  return articleTexts
}

// Wetuitleg systeemprompt versie 25-06-2025 met streng vetgedrukt tekst beleid
const WETUITLEG_SYSTEM_PROMPT = `Je bent Wetuitleg, een Nederlandse juridische uitleg-assistent op wethelder.nl. Je taak is om begrijpelijke toelichtingen te geven op wet- en regelgeving uit officiële bronnen.

### 1 – Slim omgaan met officiële tekst
1. CONTROLEER EERST de gespreksgeschiedenis: Is de exacte wettekst van dit artikel al eerder in dit gesprek getoond?
2. Als JA → Verwijs kort naar de eerder getoonde tekst: "Zoals hierboven getoond in de officiële tekst van artikel X..."  
3. Als NEE → Toon de volledige, letterlijke wettekst in een WETTEKST-sectie (geen HTML tags gebruiken!)
4. Gebruik ALTIJD alleen platte tekst, geen <details> of andere HTML codes
5. Plaats een duidelijke bron-URL na de wettekst

### 2 – Ontleed het artikel in vier vaste secties  
Gebruik ### koppen. GEBRUIK GEEN VETGEDRUKTE TEKST (**) IN DE INHOUD - alleen normale tekst.

| Sectie-kop      | Inhoud                                                                                                                  |
|-----------------|-------------------------------------------------------------------------------------------------------------------------|
| Kern in één zin | Een ultrakorte samenvatting van het artikel in B1-taal.                                                            |
| Wat betekent dit? | Een begrijpelijke zin-voor-zin uitleg van de wettekst.                                                           |
| Hoe pas je dit toe? | Praktische voorbeelden of scenario's waarin het artikel gebruikt wordt.                                         |
| Let op!         | Pitfalls, uitzonderingen en mogelijke sancties. Gebruik - als opsommingsteken.                                     |

### 3 – Profession-specifieke benadering
Pas je antwoord aan op de doelgroep:

Voor politie/BOA/handhaving:
- Focus op praktische handhaving en bevoegdheden
- Concrete procedures en protocol-tips
- Relevante sancties en boetebedragen
- Juridische valkuilen bij handhaving

Voor advocaten/juristen:
- Juridische dogmatiek en rechtsbronnen
- Relevante jurisprudentie en doctrine
- Procesrechtelijke aspecten
- Verdedigingsstrategieën en excepties

Voor studenten:
- Systematische opbouw van begrippen
- Relatie met andere wetsartikelen
- Voorbeelden en casus voor begrip
- Examentips en kernpunten

Voor algemeen publiek:
- Praktische gevolgen voor burger
- Begrijpelijke taal zonder teveel jargon
- Concrete voorbeelden uit dagelijks leven
- Wanneer juridische hulp zoeken

### 4 – Stijl & toon
* Schrijf vriendelijk, neutraal en actief
* Juridisch jargon met artikelverwijzing: verdachte (art. 27 Sv)
* Korte alinea's en opsommingen voor leesbaarheid  
* GEEN vetgedrukte tekst (**) gebruiken - schrijf gewoon normale tekst
* Geen HTML tags gebruiken, alleen platte tekst met markdown
* Eindig met: "Dit is algemene informatie en geen juridisch advies."

### 5 – Bronvermelding
* Uitsluitend officiële overheidsbronnen
* Voetnoot-nummers [1], [2] naar exacte pagina

Eindig met: "Nog iets onduidelijk? Laat het weten."`

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
    const { query, history = [], profession = 'algemeen' } = await request.json()

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
    console.log('👤 Profession/doelgroep:', profession)

    // Check if this is an APV-related query
    const isAPV = isAPVQuery(query)
    console.log(`🏛️ APV query detected: ${isAPV}`)

    // Extract article references from query
    const articleReferences = extractArticleReferences(query)
    console.log('📖 Detected article references:', articleReferences)

    // Search for complete article texts via Google API (for specific articles)
    let articleTexts: Array<{ ref: string; text: string; url: string }> = []
    if (articleReferences.length > 0) {
      console.log('🔍 Searching for complete article texts via Google API...')
      articleTexts = await searchArticleTextsViaGoogle(articleReferences)
      console.log(`✅ Found ${articleTexts.length} complete articles via Google`)
    }

    // Search JSON sources for additional context
    let jsonSources: JsonBron[] = []
    let googleResults: any[] = []
    
    try {
      console.log('📚 Loading JSON sources from officiele_bronnen.json...')
      jsonSources = await searchJsonSources(query, 10)
      console.log(`📖 Found ${jsonSources.length} relevant official sources`)
      
      // For APV queries, always search Google for lokaleregelgeving.overheid.nl
      if (isAPV) {
        console.log('🏛️ APV query detected - searching lokaleregelgeving.overheid.nl...')
        googleResults = await searchGoogleForAPV(query)
        console.log(`📚 APV search results: ${googleResults.length} results from lokaleregelgeving.overheid.nl`)
        
        // If APV search yields few results, try a broader search
        if (googleResults.length < 3) {
          console.log('🔍 Limited APV results - performing broader legal search...')
          try {
            const broaderQuery = `${query} APV gemeenteverordening`
            const additionalResults = await searchGoogleForAPV(broaderQuery)
            if (additionalResults.length > 0) {
              googleResults = [...googleResults, ...additionalResults]
              console.log(`📚 Added ${additionalResults.length} additional results from broader search`)
            }
          } catch (error) {
            console.error('❌ Error in broader APV search:', error)
          }
        }
      } else if (jsonSources.length < 3) {
        // For non-APV queries with limited JSON sources, use general Google search
        console.log('🔍 Limited sources - performing general legal search...')
        googleResults = await searchGoogleForAPV(query) // Reuse function but with different query
        console.log(`📚 General search results: ${googleResults.length} results`)
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
      // Prioritize APV sources if this is an APV query
      if (isAPV) {
        const apvSources = jsonSources.filter(source => 
          source.categorie.toLowerCase().includes('apv') || 
          source.naam.toLowerCase().includes('apv') ||
          source.naam.toLowerCase().includes('algemene plaatselijke verordening')
        )
        const otherSources = jsonSources.filter(source => 
          !source.categorie.toLowerCase().includes('apv') && 
          !source.naam.toLowerCase().includes('apv') &&
          !source.naam.toLowerCase().includes('algemene plaatselijke verordening')
        )
        
        if (apvSources.length > 0) {
          officialTextsSection += '\n\n## RELEVANTE APV BRONNEN:\n\n'
          apvSources.forEach((source, index) => {
            officialTextsSection += `### ${source.categorie} - ${source.naam}\n`
            officialTextsSection += `**URL:** ${source.url}\n`
            if (source.beschrijving) {
              officialTextsSection += `**Beschrijving:** ${source.beschrijving}\n`
            }
            officialTextsSection += '\n'
          })
        }
        
        if (otherSources.length > 0) {
          officialTextsSection += '\n\n## AANVULLENDE JURIDISCHE BRONNEN:\n\n'
          otherSources.forEach((source, index) => {
            officialTextsSection += `### ${source.categorie} - ${source.naam}\n`
            officialTextsSection += `**URL:** ${source.url}\n`
            if (source.beschrijving) {
              officialTextsSection += `**Beschrijving:** ${source.beschrijving}\n`
            }
            officialTextsSection += '\n'
          })
        }
      } else {
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
    }
    
    // Add Google search results (using EXACT same format as /ask route)
    if (googleResults.length > 0) {
      if (isAPV) {
        officialTextsSection += '\n\n## APV BRONNEN VAN LOKALEREGELGEVING.OVERHEID.NL:\n\n'
      } else {
        officialTextsSection += '\n\n## AANVULLENDE JURIDISCHE BRONNEN:\n\n'
      }
      
      googleResults.forEach((result, index) => {
        officialTextsSection += `**${result.title}** (${result.source})\n`
        officialTextsSection += `URL: ${result.link}\n`
        officialTextsSection += `Samenvatting: ${result.snippet}\n`
        officialTextsSection += '---\n\n'
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
      officialTextsSection += `\n**BELANGRIJKE INSTRUCTIES:**
1. Gebruik de bovenstaande officiële bronnen voor je antwoord
2. Begin met exacte wetteksten waar beschikbaar
3. Voor APV-vragen: zoek naar specifieke artikelnummers in de bronnen
4. Geef praktische juridische uitleg
5. Verwijs naar concrete wetsartikelen
6. Gebruik geen emoji's in kopjes\n\n`
    }

    // Add profession context to system prompt
    let professionContext = ""
    if (profession && profession !== 'algemeen') {
      professionContext = `\n\nJe beantwoordt deze vraag specifiek voor: ${profession}. Pas je antwoord aan op deze doelgroep volgens de profession-specifieke richtlijnen.`
    }

    // Prepare conversation history with new Wetuitleg system prompt
    const conversationHistory: ChatMessage[] = [
      { 
        role: 'system', 
        content: WETUITLEG_SYSTEM_PROMPT + professionContext + (officialTextsSection || "")
      },
      ...(history as ChatMessage[]).slice(-8), // Keep last 8 messages for context
      { role: 'user', content: query }
    ]

    console.log('🤖 Starting comprehensive legal analysis with APV support')

    // Create OpenAI completion stream
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: conversationHistory,
      stream: true,
      temperature: 0.2, // Even lower temperature for maximum precision
      max_tokens: 4000, // Higher token limit for comprehensive analysis
      presence_penalty: 0.1, // Encourage more detailed responses
      frequency_penalty: 0.1, // Prevent repetitive content
    })

    // Create a readable stream that captures full response
    let fullResponse = ''
    let streamClosed = false
    
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        try {
          for await (const chunk of completion) {
            if (streamClosed) break
            
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullResponse += content
              controller.enqueue(encoder.encode(content))
            }
          }
          
          if (!streamClosed) {
            console.log('✅ Comprehensive legal analysis completed')
             
            // Save to database
            try {
              await prisma.query.create({
                data: {
                  question: query,
                  answer: fullResponse,
                  userId: session?.user?.id || null,
                  profession: profession,
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
            
            streamClosed = true
            controller.close()
          }
        } catch (error) {
          if (!streamClosed) {
            console.error('❌ Error in wetuitleg stream:', error)
            streamClosed = true
            controller.error(error)
          }
        }
      },
      
      cancel() {
        console.log('🔄 Wetuitleg stream cancelled')
        streamClosed = true
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