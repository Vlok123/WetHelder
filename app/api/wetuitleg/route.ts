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
import { 
  validateLegalInformation, 
  generateValidationDisclaimer, 
  getReliabilityIndicator,
  type LegalQuery 
} from '@/lib/validation'

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
  
  // Pattern 1: "artikel 8 Politiewet 2012" - Enhanced for full law names with years
  const fullLawMatch = lowerQuery.match(/(?:artikel|art\.?)\s+(\d+[a-z]*(?::\d+)?(?:\s+lid\s+\d+)?)\s+(politiewet\s*\d{4}|wetboek\s+van\s+strafrecht|wetboek\s+van\s+strafvordering|burgerlijk\s+wetboek|algemene\s+wet\s+bestuursrecht|wegenverkeerswet\s*\d{4}?|wet\s+op\s+de\s+identificatieplicht)/i)
  if (fullLawMatch) {
    references.push(`artikel ${fullLawMatch[1]} ${fullLawMatch[2]}`)
  }
  
  // Pattern 2: "artikel 304 sr" or "art 304 sr" - Short codes
  const artikelMatch = lowerQuery.match(/(?:artikel|art\.?)\s+(\d+[a-z]*(?::\d+)?(?:\s+lid\s+\d+)?)\s+(sr|sv|bw|awb|wvw|politiewet|rv)\b/i)
  if (artikelMatch) {
    references.push(`artikel ${artikelMatch[1]} ${artikelMatch[2].toUpperCase()}`)
  }
  
  // Pattern 3: Special handling for RVV (Reglement verkeersregels en verkeerstekens)
  const rvvMatch = lowerQuery.match(/(?:artikel|art\.?)?\s*(\d+)\s+(?:rvv|reglement\s+verkeersregels)/i)
  if (rvvMatch) {
    const articleNum = rvvMatch[1]
    references.push(`artikel ${articleNum} RVV 1990`)
    console.log(`🚦 Detected RVV artikel ${articleNum} - adding specific RVV 1990 reference`)
  }
  
  // Pattern 4: "29 rvv" (short format for RVV)
  const shortRvvMatch = lowerQuery.match(/\b(\d+)\s+rvv\b/i)
  if (shortRvvMatch && !references.some(ref => ref.includes('RVV'))) {
    references.push(`artikel ${shortRvvMatch[1]} RVV 1990`)
    console.log(`🚦 Detected short RVV format: artikel ${shortRvvMatch[1]} RVV 1990`)
  }
  
  // Pattern 5: "304 sr" (short format for other laws)
  const shortMatch = lowerQuery.match(/\b(\d+[a-z]*)\s+(sr|sv|bw|awb|wvw|politiewet|rv)\b/i)
  if (shortMatch && !references.some(ref => ref.includes(shortMatch[1]))) {
    references.push(`artikel ${shortMatch[1]} ${shortMatch[2].toUpperCase()}`)
  }
  
  // Pattern 6: Vehicle regulation patterns like "5.2.42 RV" or "artikel 5.2.42 RV"
  const vehicleMatch = lowerQuery.match(/(?:artikel\s+)?(\d+\.\d+\.\d+)\s+(rv|reglement\s+voertuigen)/i)
  if (vehicleMatch) {
    references.push(`artikel ${vehicleMatch[1]} RV`)
  }
  
  // Pattern 7: Extended format like "5.2.42 van het RV" 
  const extendedVehicleMatch = lowerQuery.match(/(?:artikel\s+)?(\d+\.\d+\.\d+)\s+(?:van\s+het\s+)?(rv|reglement\s+voertuigen)/i)
  if (extendedVehicleMatch && !references.some(ref => ref.includes(extendedVehicleMatch[1]))) {
    references.push(`artikel ${extendedVehicleMatch[1]} RV`)
  }
  
  // Pattern 8: Questions about specific RV articles like "wat zegt 5.2.42 RV"
  const questionMatch = lowerQuery.match(/(?:wat\s+zegt|inhoud\s+van|tekst\s+van)?\s*(\d+\.\d+\.\d+)\s+(rv|reglement\s+voertuigen)/i)
  if (questionMatch && !references.some(ref => ref.includes(questionMatch[1]))) {
    references.push(`artikel ${questionMatch[1]} RV`)
  }
  
  // Pattern 9: "304 strafrecht" (infer law code)
  const inferMatch = lowerQuery.match(/\b(\d+[a-z]*)\s+(?:wetboek\s+van\s+)?(?:strafrecht|strafvordering|burgerlijk\s+wetboek|awb|wegenverkeerswet|politiewet)/i)
  if (inferMatch && !references.some(ref => ref.includes(inferMatch[1]))) {
    if (lowerQuery.includes('strafrecht')) {
      references.push(`artikel ${inferMatch[1]} Sr`)
    } else if (lowerQuery.includes('strafvordering')) {
      references.push(`artikel ${inferMatch[1]} Sv`)
    }
  }
  
  // Pattern 10: Special handling for "wat zegt 447e strafrecht" type questions
  const whatSaysMatch = lowerQuery.match(/(?:wat\s+zegt|inhoud\s+van|tekst\s+van)?\s*(\d+[a-z]*)\s+(?:wetboek\s+van\s+)?strafrecht/i)
  if (whatSaysMatch && !references.some(ref => ref.includes(whatSaysMatch[1]))) {
    references.push(`artikel ${whatSaysMatch[1]} Sr`)
  }
  
  // Pattern 11: Direct "447e sr" pattern without artikel prefix
  const directCodeMatch = lowerQuery.match(/\b(\d+[a-z]*)\s+(sr|sv|bw|awb|wvw)\b/i)
  if (directCodeMatch && !references.some(ref => ref.includes(directCodeMatch[1]))) {
    references.push(`artikel ${directCodeMatch[1]} ${directCodeMatch[2].toUpperCase()}`)
  }
  
  console.log(`🔍 Article extraction from "${query}":`, references)
  
  // Remove duplicates
  return Array.from(new Set(references))
}

// VOLLEDIGE ROUTING LOGICA VAN /ASK - EXACTE KOPIE
interface GoogleSearchResult {
  title: string
  link: string
  snippet: string
  source: string
}

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
    
    // Detecteer APV-gerelateerde vragen (ook zonder expliciet "APV" te noemen)
    const apvKeywords = [
      'apv', 'gemeentelijk', 'lokaal', 'gemeente', 'plaatselijk', 'verordening',
      'alcohol', 'drinken', 'straat', 'openbaar', 'park', 'plein', 'evenement',
      'geluid', 'overlast', 'terras', 'vergunning', 'handhaving', 'boa',
      'camper', 'parkeren', 'kamperen', 'hondenpoep', 'hond', 'vuur', 'barbecue',
      'muziek', 'lawaai', 'reclame', 'uithangbord', 'standplaats', 'markt',
      'amsterdam', 'rotterdam', 'den haag', 'utrecht', 'eindhoven', 'groningen',
      'tilburg', 'almere', 'breda', 'nijmegen', 'apeldoorn', 'haarlem', 'arnhem',
      'enschede', 'haarlemmermeer', 'zaanstad', 'amersfoort', 'hertogenbosch',
      'zoetermeer', 'zwolle', 'ede', 'dordrecht', 'leiden', 'emmen', 'maastricht',
      'delft', 'venlo', 'leeuwarden', 'alkmaar', 'helmond', 'deventer',
      'ijsselstreek', 'oude ijssel', 'ijssel',
      'nieuw beleid', 'recent', 'actueel', 'jurisprudentie', 'uitspraak', 'vonnis', 'arrest'
    ]
    
    // Check for gemeente names
    const gemeenten = [
      'amsterdam', 'rotterdam', 'den haag', 'utrecht', 'eindhoven', 'tilburg',
      'groningen', 'almere', 'breda', 'nijmegen', 'apeldoorn', 'haarlem', 'arnhem',
      'enschede', 'haarlemmermeer', 'zaanstad', 'amersfoort', 'hertogenbosch'
    ]
    
    const hasApvKeyword = apvKeywords.some(keyword => queryLower.includes(keyword))
    const hasGemeenteNaam = gemeenten.some(gemeente => queryLower.includes(gemeente))
    
    if (hasApvKeyword || hasGemeenteNaam) {
      // Voor APV vragen: voeg specifieke zoektermen toe
      searchQuery = `${query} site:lokaleregelgeving.overheid.nl OR site:overheid.nl APV "Algemene Plaatselijke Verordening"`
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
 * Formatteert Google zoekresultaten voor context - NO BOLD TEXT VERSION
 */
function formatGoogleResultsForContext(results: GoogleSearchResult[]): string {
  if (results.length === 0) {
    return ''
  }
  
  return results.map(result => {
    return `${result.title} (${result.source})
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
    'apv', 'gemeentelijk', 'lokaal', 'gemeente', 'plaatselijk', 'verordening',
    'alcohol', 'drinken', 'straat', 'openbaar', 'park', 'plein', 'evenement',
    'geluid', 'overlast', 'terras', 'vergunning', 'handhaving', 'boa',
    'camper', 'parkeren', 'kamperen', 'hondenpoep', 'hond', 'vuur', 'barbecue',
    'muziek', 'lawaai', 'reclame', 'uithangbord', 'standplaats', 'markt',
    'amsterdam', 'rotterdam', 'den haag', 'utrecht', 'eindhoven', 'groningen',
    'tilburg', 'almere', 'breda', 'nijmegen', 'apeldoorn', 'haarlem', 'arnhem',
    'enschede', 'haarlemmermeer', 'zaanstad', 'amersfoort', 'hertogenbosch',
    'zoetermeer', 'zwolle', 'ede', 'dordrecht', 'leiden', 'emmen', 'maastricht',
    'delft', 'venlo', 'leeuwarden', 'alkmaar', 'helmond', 'deventer',
    'ijsselstreek', 'oude ijssel', 'ijssel',
    'nieuw beleid', 'recent', 'actueel', 'jurisprudentie', 'uitspraak', 'vonnis', 'arrest'
  ]
  
  const needsGoogle = needsGoogleKeywords.some(keyword => queryLower.includes(keyword))
  if (needsGoogle) {
    console.log('🔍 Query bevat keywords die Google API vereisen')
    return true
  }
  
  console.log('✅ Voldoende JSON dekking - Google API niet nodig')
  return false
}

// Enhanced function to search for literal law text on wetten.overheid.nl
async function searchLiteralLawText(articleReferences: string[]): Promise<Array<{ ref: string; text: string; url: string }>> {
  const results: Array<{ ref: string; text: string; url: string }> = []
  
  for (const ref of articleReferences) {
    console.log(`📖 Searching for literal text of: ${ref}`)
    
    // HARDCODED VALIDATION FOR ARTIKEL 29 RVV 1990
    if (ref.toLowerCase().includes('artikel 29') && (ref.toLowerCase().includes('rvv') || ref.toLowerCase().includes('reglement verkeersregels'))) {
      console.log('🚦 HARDCODED: Found artikel 29 RVV - returning correct text about emergency services')
      results.push({
        ref: ref,
        text: `Artikel 29 RVV 1990

1. Bestuurders van motorvoertuigen in gebruik bij politie en brandweer, motorvoertuigen in gebruik bij diensten voor spoedeisende medische hulpverlening, en motorvoertuigen van andere door Onze Minister aangewezen hulpverleningsdiensten voeren blauw zwaai-, flits- of knipperlicht en een tweetonige hoorn om kenbaar te maken dat zij een dringende taak vervullen.

2. De in het eerste lid genoemde bestuurders mogen aanvullend op de in dat lid bedoelde verlichting overdag knipperende koplampen voeren.

3. Bij ministeriële regeling kunnen voorschriften worden vastgesteld betreffende het blauwe zwaai-, flits- of knipperlicht, de tweetonige hoorn en de knipperende koplampen.`,
        url: 'https://wetten.overheid.nl/BWBR0004825/2021-07-01#Hoofdstuk2_Paragraaf6_Artikel29'
      })
      continue
    }
    
    // Extract article number and law code
    const match = ref.match(/artikel\\s+(\\d+[a-z]*)\\s+(.+)/i)
    if (!match) continue
    
    const articleNum = match[1]
    const lawCode = match[2].trim()
    
    // Build specific search queries for wetten.overheid.nl
    let searchQueries: string[] = []
    
    if (lawCode.includes('RVV') || lawCode.includes('1990')) {
      // Special handling for other RVV articles (not artikel 29)
      searchQueries = [
        `"artikel ${articleNum}" site:wetten.overheid.nl "BWBR0004825"`,
        `"artikel ${articleNum}" site:wetten.overheid.nl "reglement verkeersregels"`,
        `"artikel ${articleNum}" site:wetten.overheid.nl RVV`
      ]
    } else if (lawCode.includes('politiewet')) {
      searchQueries = [
        `"artikel ${articleNum}" site:wetten.overheid.nl politiewet`,
        `"artikel ${articleNum}" site:wetten.overheid.nl "BWBR0031788"`
      ]
    } else if (lawCode.includes('sr') || lawCode.includes('strafrecht')) {
      searchQueries = [
        `"artikel ${articleNum}" site:wetten.overheid.nl "wetboek van strafrecht"`,
        `"artikel ${articleNum}" site:wetten.overheid.nl "BWBR0001854"`
      ]
    } else {
      // Generic search for other laws
      searchQueries = [
        `"artikel ${articleNum}" "${lawCode}" site:wetten.overheid.nl`,
        `"artikel ${articleNum}" site:wetten.overheid.nl`
      ]
    }
    
    // Perform the searches
    for (const query of searchQueries) {
      try {
        console.log(`🔍 Searching for literal law text: ${query}`)
        const searchResults = await searchGoogleCustomAPI(query)
        
        if (searchResults && searchResults.length > 0) {
          const lawResult = searchResults.find((result: GoogleSearchResult) => 
            result.link?.includes('wetten.overheid.nl') &&
            result.snippet?.toLowerCase().includes(`artikel ${articleNum.toLowerCase()}`)
          )
          
          if (lawResult && lawResult.snippet) {
            console.log(`✅ Found validated law text for ${ref}`)
            results.push({
              ref: ref,
              text: lawResult.snippet,
              url: lawResult.link || 'https://wetten.overheid.nl'
            })
            break // Stop searching once we found a match
          }
        }
      } catch (error) {
        console.error(`❌ Error searching for ${ref}:`, error)
      }
    }
  }
  
  return results
}

// Enhanced article search with comprehensive politiewet mapping and local fallback
async function searchArticleTextsViaGoogle(articleReferences: string[]): Promise<Array<{ ref: string; text: string; url: string }>> {
  const articleTexts: Array<{ ref: string; text: string; url: string }> = []
  
  // Direct mapping of actual Politiewet 2012 article texts (from official law text)
  const politiewetArticleTexts: Record<string, { text: string; url: string }> = {
    'artikel 1 politiewet 2012': {
      text: 'In deze wet en de daarop berustende bepalingen wordt verstaan onder: a. Onze Minister: Onze Minister van Justitie en Veiligheid; b. politie: het landelijke politiekorps, bedoeld in artikel 25, eerste lid; c. korpschef: de korpschef, bedoeld in artikel 27; d. eenheid: een regionale of landelijke eenheid; e. regionale eenheid: een regionale eenheid van de politie als bedoeld in artikel 25, eerste lid, onder a; f. landelijke eenheid: een landelijke eenheid van de politie als bedoeld in artikel 25, eerste lid, onder b.',
      url: 'https://wetten.overheid.nl/BWBR0031788/2024-08-01#Artikel1'
    },
    'artikel 3 politiewet 2012': {
      text: 'De politie heeft tot taak in ondergeschiktheid aan het bevoegd gezag en in overeenstemming met de geldende rechtsregels te zorgen voor de daadwerkelijke handhaving van de rechtsorde en het verlenen van hulp aan hen die deze behoeven.',
      url: 'https://wetten.overheid.nl/BWBR0031788/2024-08-01#Artikel3'
    },
    'artikel 7 politiewet 2012': {
      text: 'De ambtenaar van politie die is aangesteld voor de uitvoering van de politietaak, is bevoegd in de rechtmatige uitoefening van zijn bediening geweld of vrijheidsbeperkende middelen te gebruiken, wanneer het daarmee beoogde doel dit, mede gelet op de aan het gebruik hiervan verbonden gevaren, rechtvaardigt en dat doel niet op een andere wijze kan worden bereikt. Aan het gebruik van geweld gaat zo mogelijk een waarschuwing vooraf.',
      url: 'https://wetten.overheid.nl/BWBR0031788/2024-08-01#Artikel7'
    },
    'artikel 8 politiewet 2012': {
      text: 'Een ambtenaar van politie die is aangesteld voor de uitvoering van de politietaak, is bevoegd tot het vorderen van inzage van een identiteitsbewijs als bedoeld in artikel 1 van de Wet op de identificatieplicht van personen, voor zover dat redelijkerwijs noodzakelijk is voor de uitvoering van de politietaak.',
      url: 'https://wetten.overheid.nl/BWBR0031788/2024-08-01#Artikel8'
    },
    // Short form references
    'artikel 1 POLITIEWET': {
      text: 'In deze wet en de daarop berustende bepalingen wordt verstaan onder: a. Onze Minister: Onze Minister van Justitie en Veiligheid; b. politie: het landelijke politiekorps, bedoeld in artikel 25, eerste lid; c. korpschef: de korpschef, bedoeld in artikel 27; d. eenheid: een regionale of landelijke eenheid; e. regionale eenheid: een regionale eenheid van de politie als bedoeld in artikel 25, eerste lid, onder a; f. landelijke eenheid: een landelijke eenheid van de politie als bedoeld in artikel 25, eerste lid, onder b.',
      url: 'https://wetten.overheid.nl/BWBR0031788/2024-08-01#Artikel1'
    },
    'artikel 3 POLITIEWET': {
      text: 'De politie heeft tot taak in ondergeschiktheid aan het bevoegd gezag en in overeenstemming met de geldende rechtsregels te zorgen voor de daadwerkelijke handhaving van de rechtsorde en het verlenen van hulp aan hen die deze behoeven.',
      url: 'https://wetten.overheid.nl/BWBR0031788/2024-08-01#Artikel3'
    },
    'artikel 7 POLITIEWET': {
      text: 'De ambtenaar van politie die is aangesteld voor de uitvoering van de politietaak, is bevoegd in de rechtmatige uitoefening van zijn bediening geweld of vrijheidsbeperkende middelen te gebruiken, wanneer het daarmee beoogde doel dit, mede gelet op de aan het gebruik hiervan verbonden gevaren, rechtvaardigt en dat doel niet op een andere wijze kan worden bereikt. Aan het gebruik van geweld gaat zo mogelijk een waarschuwing vooraf.',
      url: 'https://wetten.overheid.nl/BWBR0031788/2024-08-01#Artikel7'
    },
    'artikel 8 POLITIEWET': {
      text: 'Een ambtenaar van politie die is aangesteld voor de uitvoering van de politietaak, is bevoegd tot het vorderen van inzage van een identiteitsbewijs als bedoeld in artikel 1 van de Wet op de identificatieplicht van personen, voor zover dat redelijkerwijs noodzakelijk is voor de uitvoering van de politietaak.',
      url: 'https://wetten.overheid.nl/BWBR0031788/2024-08-01#Artikel8'
    }
  }

  // Comprehensive mapping for politiewet articles with specific search terms
  const articleSearchTerms: Record<string, string> = {
    // Politiewet 2012 articles - specific search terms for accurate results
    'artikel 1 politiewet 2012': '"artikel 1" "politiewet 2012" "begripsbepalingen" site:wetten.overheid.nl',
    'artikel 2 politiewet 2012': '"artikel 2" "politiewet 2012" "nationale politie" site:wetten.overheid.nl', 
    'artikel 3 politiewet 2012': '"artikel 3" "politiewet 2012" "taak politie" "handhaving rechtsorde" site:wetten.overheid.nl',
    'artikel 4 politiewet 2012': '"artikel 4" "politiewet 2012" "regionale eenheden" site:wetten.overheid.nl',
    'artikel 5 politiewet 2012': '"artikel 5" "politiewet 2012" "landelijke eenheid" site:wetten.overheid.nl',
    'artikel 6 politiewet 2012': '"artikel 6" "politiewet 2012" "centrale en landelijke" site:wetten.overheid.nl',
    'artikel 7 politiewet 2012': '"artikel 7" "politiewet 2012" "politie ondersteunende" site:wetten.overheid.nl',
    'artikel 8 politiewet 2012': '"artikel 8" "politiewet 2012" "identiteitsbewijs" "identificatieplicht" site:wetten.overheid.nl',
    'artikel 8a politiewet 2012': '"artikel 8a" "politiewet 2012" "preventief fouilleren" site:wetten.overheid.nl',
    'artikel 9 politiewet 2012': '"artikel 9" "politiewet 2012" "geweld" "aanwending" site:wetten.overheid.nl',
    'artikel 10 politiewet 2012': '"artikel 10" "politiewet 2012" "handboeien" "vervoer" site:wetten.overheid.nl',
    'artikel 11 politiewet 2012': '"artikel 11" "politiewet 2012" "surveillance" site:wetten.overheid.nl',
    'artikel 12 politiewet 2012': '"artikel 12" "politiewet 2012" "toegang woningen" site:wetten.overheid.nl',
    
    // Short form references
    'artikel 1 POLITIEWET': '"artikel 1" "politiewet 2012" "begripsbepalingen" site:wetten.overheid.nl',
    'artikel 2 POLITIEWET': '"artikel 2" "politiewet 2012" "nationale politie" site:wetten.overheid.nl',
    'artikel 3 POLITIEWET': '"artikel 3" "politiewet 2012" "taak politie" "handhaving rechtsorde" site:wetten.overheid.nl',
    'artikel 8 POLITIEWET': '"artikel 8" "politiewet 2012" "identiteitsbewijs" "identificatieplicht" site:wetten.overheid.nl',
    'artikel 8a POLITIEWET': '"artikel 8a" "politiewet 2012" "preventief fouilleren" site:wetten.overheid.nl',
    'artikel 9 POLITIEWET': '"artikel 9" "politiewet 2012" "geweld" "aanwending" site:wetten.overheid.nl',
    
    // Other common references - Enhanced for 447e Sr
    'artikel 447e SR': '"artikel 447e" "wetboek van strafrecht" site:wetten.overheid.nl',
    'artikel 447e sr': '"artikel 447e" "wetboek van strafrecht" site:wetten.overheid.nl',
    'artikel 447e Sr': '"artikel 447e" "wetboek van strafrecht" site:wetten.overheid.nl',
    'artikel 447e strafrecht': '"artikel 447e" "wetboek van strafrecht" site:wetten.overheid.nl',
    'artikel 447e wetboek van strafrecht': '"artikel 447e" "wetboek van strafrecht" site:wetten.overheid.nl',
    '447e sr': '"artikel 447e" "wetboek van strafrecht" site:wetten.overheid.nl',
    '447e Sr': '"artikel 447e" "wetboek van strafrecht" site:wetten.overheid.nl',
    '447e SR': '"artikel 447e" "wetboek van strafrecht" site:wetten.overheid.nl',
    'artikel 2 wet op de identificatieplicht': '"artikel 2" "wet op de identificatieplicht" site:wetten.overheid.nl',
    
    // Vehicle regulations (WVW)
    'artikel 5 WVW': '"artikel 5" "wegenverkeerswet" "bestuurder" site:wetten.overheid.nl',
    'artikel 8 WVW': '"artikel 8" "wegenverkeerswet" "alcohol" "drugs" site:wetten.overheid.nl',
    'artikel 107 WVW': '"artikel 107" "wegenverkeerswet" "alcohol" "promillage" site:wetten.overheid.nl',
    'artikel 160 WVW': '"artikel 160" "wegenverkeerswet" "documenten" "legitimatie" site:wetten.overheid.nl',
    'artikel 179 WVW': '"artikel 179" "wegenverkeerswet" "stopteken" site:wetten.overheid.nl'
  }

  // Note: Relying on GPT-4o-mini's built-in legal knowledge and Google search
  
  for (const ref of articleReferences.slice(0, 3)) { // Limit to 3 articles
    try {
      console.log(`🔍 Searching for: ${ref}`)
      
      // First try: Check direct politiewet mapping for exact texts
      const normalizedRef = ref.toLowerCase().trim()
      if (politiewetArticleTexts[normalizedRef]) {
        console.log(`✅ Found direct politiewet text for: ${ref}`)
        articleTexts.push({
          ref,
          text: politiewetArticleTexts[normalizedRef].text,
          url: politiewetArticleTexts[normalizedRef].url
        })
        continue
      }
      
      // Try alternative forms for politiewet
      if (ref.toLowerCase().includes('politiewet') && !ref.includes('2012')) {
        const alternativeRef = ref.toLowerCase().replace('politiewet', 'politiewet 2012')
        if (politiewetArticleTexts[alternativeRef]) {
          console.log(`✅ Found direct politiewet text (alt form) for: ${ref}`)
          articleTexts.push({
            ref,
            text: politiewetArticleTexts[alternativeRef].text,
            url: politiewetArticleTexts[alternativeRef].url
          })
          continue
        }
      }
      
      // Fallback to Google search - Use specific search terms if available, otherwise fallback to enhanced generic
      let searchQuery = articleSearchTerms[ref.toLowerCase()]
      
      if (!searchQuery) {
        // Enhanced fallback search for politiewet articles
        if (ref.toLowerCase().includes('politiewet')) {
          const articleNumber = ref.match(/\d+[a-z]*/)?.[0]
          if (articleNumber) {
            searchQuery = `"artikel ${articleNumber}" "politiewet 2012" site:wetten.overheid.nl`
          } else {
            searchQuery = `"${ref}" "politiewet 2012" site:wetten.overheid.nl`
          }
        } else {
          searchQuery = `"${ref}" site:wetten.overheid.nl`
        }
      }
      
      console.log(`🎯 Using search query: ${searchQuery}`)
      
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
        console.log(`❌ No suitable Google result found for: ${ref}`)
      }
    } catch (error) {
      console.error(`❌ Error searching for article ${ref}:`, error)
    }
  }
  
  return articleTexts
}

// Wetuitleg systeemprompt versie 28-06-2025 - verbeterde wettekst handling
const WETUITLEG_SYSTEM_PROMPT = `🎯 ROL & EXPERTISE
Je bent Lexi, een gespecialiseerde Nederlandse juridische AI-assistent van WetHelder.nl die UITSLUITEND betrouwbare, gevalideerde juridische informatie verstrekt.

🛡️ BETROUWBAARHEIDSGARANTIE - ABSOLUTE PRIORITEIT
⚠️ KRITIEKE REGEL: Bij het citeren van wetteksten ALTIJD een van deze opties:
1. "Volgens de verstrekte officiële bronnen..." (bij bronbevestiging)
2. "Op basis van algemene juridische kennis - controleer altijd wetten.overheid.nl voor de actuele versie" (zonder bronbevestiging)
3. "Raadpleeg wetten.overheid.nl voor de exacte en meest actuele tekst van dit artikel"

🔍 VALIDATIEVERPLICHTINGEN
- Citeer NOOIT een artikel als definitief zonder bronverificatie
- Bij twijfel: gebruik disclaimers en verwijs naar officiële bronnen
- Prioriteer Google resultaten van overheid.nl boven eigen kennis
- Vermeld altijd onzekerheid over actualiteit van informatie

📋 VERPLICHTE STRUCTUUR - Gebruik EXACT deze markers voor elke vraag:

SAMENVATTING:
[Begin hier met een heldere, directe beantwoording van de vraag. Gebruik ALTIJD een disclaimer als er geen directe bronverificatie is]

WETSARTIKEL:
[Citeer hier de relevante wetsartikelen met hun VOLLEDIGE tekst. VERPLICHT: Start met "Volgens de verstrekte bronnen..." of "Op basis van algemene juridische kennis - controleer wetten.overheid.nl..."]

LINK:
[Geef hier de officiële link naar de wet op wetten.overheid.nl - ALTIJD aanbevelen om hier te controleren]

TOELICHTING:
[Leg hier uit wat de wetsartikelen betekenen. Vermeld indien van toepassing: "Deze uitleg is gebaseerd op algemene juridische interpretatie"]

PRAKTIJK:
[Beschrijf concrete voorbeelden. Vermeld: "Voor actuele handhavingsrichtlijnen, raadpleeg lokale autoriteiten"]

JURISPRUDENTIE:
[Noem relevante rechtspraak of vermeld: "Voor actuele jurisprudentie, raadpleeg rechtspraak.nl"]

VERWANTE ARTIKELEN:
[Verwijs naar gerelateerde regelgeving met disclaimer over actualiteit]

BRONNEN:
[Lijst gebruikte bronnen + ALTIJD: "Controleer altijd de meest actuele versie op wetten.overheid.nl"]

🚫 ABSOLUTE VERBODEN
❌ Definitieve uitspraken over wetteksten zonder bronverificatie
❌ "Dit artikel luidt..." zonder disclaimer
❌ Presenteren van mogelijk verouderde informatie als actueel
❌ Weglatingen van onzekerheidsvermeldingen

✅ FAIL-SAFE PRINCIPE
- Transparantie over bronnen en beperkingen
- Stimuleer verificatie via officiële kanalen
- Erken onzekerheid waar van toepassing
- Juridische waarde leveren met eerlijkheid over betrouwbaarheid`

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

    console.log('🚀 WetHelder.nl Routing gestart voor vraag:', query)

    // STAP 1: Bronnen bepalen 
    let jsonSources: JsonBron[] = []
    let googleResults: string = ''
    
    console.log('📋 STAP 1: Controle officiele_bronnen.json')
    try {
      jsonSources = await searchJsonSources(query, 10)
      if (jsonSources.length > 0) {
        console.log(`✅ ${jsonSources.length} relevante JSON bronnen gevonden`)
      } else {
        console.log('ℹ️ Geen relevante JSON bronnen gevonden')
      }
    } catch (error) {
      console.error('❌ Fout bij JSON bronnen zoeken:', error)
    }

    // STAP 2: Evaluatie Google API noodzaak 
    console.log('🔍 STAP 2: Evaluatie Google API noodzaak')
    
    const needsGoogle = needsGoogleSearch(jsonSources, query)
    
    if (needsGoogle) {
      console.log('🌐 STAP 3: Google Custom Search API wordt geraadpleegd')
      console.log('🌐 Searching Google Custom Search API for:', query)
      
      try {
        const results = await searchGoogleCustomAPI(query)
        if (results.length > 0) {
          googleResults = formatGoogleResultsForContext(results)
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
    console.log(`🤖 Starting OpenAI request met ${jsonSources.length} JSON bronnen en ${googleResults ? 'Google resultaten' : 'geen Google resultaten'}`)

    // Extract article references for specialized wetuitleg handling
    const articleReferences = extractArticleReferences(query)
    console.log('📖 Detected article references:', articleReferences)

    // Validate information reliability
    const validationInput: LegalQuery = {
      query,
      foundSources: jsonSources,
      googleResults,
      articleReferences
    }
    
    const validation = validateLegalInformation(validationInput)
    console.log('🛡️ Validation result:', {
      reliable: validation.isReliable,
      confidence: validation.confidence,
      warnings: validation.warnings.length,
      sources: validation.sourceVerification.sourcesUsed
    })

    // Generate validation disclaimer
    const validationDisclaimer = generateValidationDisclaimer(validation)
    const reliabilityIndicator = getReliabilityIndicator(validation.confidence)

    // Search for literal law texts with enhanced validation (for specific articles)
    let articleTexts: Array<{ ref: string; text: string; url: string }> = []
    if (articleReferences.length > 0) {
      console.log('🔍 Searching for literal law texts with enhanced validation...')
      articleTexts = await searchLiteralLawText(articleReferences)
      console.log(`✅ Found ${articleTexts.length} validated articles from wetten.overheid.nl`)
      
      // If no results from enhanced search, fall back to original method
      if (articleTexts.length === 0) {
        console.log('🔄 Falling back to general article search...')
        articleTexts = await searchArticleTextsViaGoogle(articleReferences)
        console.log(`✅ Found ${articleTexts.length} articles via fallback search`)
      }
    }

    // Find relevant official sources for additional context
    const officialSources = findRelevantOfficialSources(query, 3)
    console.log(`📖 Found ${officialSources.length} additional official sources`)

    // Prepare official legal texts section - WETUITLEG SPECIFIC FORMAT
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
    
    // Add JSON sources 
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
    
    // Add Google search results if available
    if (googleResults) {
      officialTextsSection += '\n\n## AANVULLENDE JURIDISCHE BRONNEN:\n\n'
      officialTextsSection += googleResults
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

    // Add validation information to prompt
    const validationSection = `\n\n🛡️ BETROUWBAARHEIDSSTATUS VOOR DEZE VRAAG:
${reliabilityIndicator}

Gedetecteerde validatiepunten:
${validation.warnings.length > 0 ? validation.warnings.map(w => `⚠️ ${w}`).join('\n') : '✅ Geen specifieke waarschuwingen'}

${validation.recommendations.length > 0 ? `\nAanbevelingen:
${validation.recommendations.map(r => `💡 ${r}`).join('\n')}` : ''}

VERPLICHTE DISCLAIMER VOOR JE ANTWOORD:
${validationDisclaimer}

INSTRUCTIE: Integreer deze betrouwbaarheidsinformatie natuurlijk in je antwoord. Gebruik vooral de BRONNEN sectie om de disclaimers op te nemen.`

    // Prepare conversation history with enhanced Wetuitleg system prompt
    const conversationHistory: ChatMessage[] = [
      { 
        role: 'system', 
        content: WETUITLEG_SYSTEM_PROMPT + professionContext + (officialTextsSection || "") + validationSection
      },
      ...(history as ChatMessage[]).slice(-8), // Keep last 8 messages for context
      { role: 'user', content: query }
    ]

    console.log('🤖 Starting comprehensive legal analysis with APV support')

    // Create OpenAI completion stream with GPT-4o for better juridical accuracy
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: conversationHistory,
      stream: true,
      temperature: 0.05, // Even lower temperature for maximum precision
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
                    googleResults: googleResults ? 'Used Google API' : 'No Google API used',
                    officialSources: officialSources.length,
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