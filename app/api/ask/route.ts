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
  checkActualiteit,
  type BijzondereWet,
  type WetUpdate,
  type ActualiteitsWaarschuwing
} from '@/lib/officialSources'

import { streamingCompletion } from '@/lib/openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  validateLegalInformation, 
  generateValidationDisclaimer, 
  getReliabilityIndicator,
  type LegalQuery 
} from '@/lib/validation'

// Import article extraction functions from wetuitleg (for consistency)
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
  
  // Pattern 3: "304 sr" (short format)
  const shortMatch = lowerQuery.match(/\b(\d+[a-z]*)\s+(sr|sv|bw|awb|wvw|politiewet|rv)\b/i)
  if (shortMatch) {
    references.push(`artikel ${shortMatch[1]} ${shortMatch[2].toUpperCase()}`)
  }
  
  // Pattern 4: "447e strafrecht" (infer law code)
  const inferMatch = lowerQuery.match(/\b(\d+[a-z]*)\s+(?:wetboek\s+van\s+)?(?:strafrecht|strafvordering|burgerlijk\s+wetboek|awb|wegenverkeerswet|politiewet)/i)
  if (inferMatch) {
    if (lowerQuery.includes('strafrecht')) {
      references.push(`artikel ${inferMatch[1]} Sr`)
    } else if (lowerQuery.includes('strafvordering')) {
      references.push(`artikel ${inferMatch[1]} Sv`)
    }
  }
  
  // Pattern 5: Special handling for "wat zegt 447e strafrecht" type questions
  const whatSaysMatch = lowerQuery.match(/(?:wat\s+zegt|inhoud\s+van|tekst\s+van)?\s*(\d+[a-z]*)\s+(?:wetboek\s+van\s+)?strafrecht/i)
  if (whatSaysMatch) {
    references.push(`artikel ${whatSaysMatch[1]} Sr`)
  }
  
  console.log(`🔍 Article extraction from "${query}":`, references)
  
  // Remove duplicates
  return Array.from(new Set(references))
}

async function searchArticleTextsViaGoogle(articleReferences: string[]): Promise<Array<{ ref: string; text: string; url: string }>> {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
  const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID
  
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    console.log('⚠️ Google API credentials niet geconfigureerd voor artikel zoeken')
    return []
  }

  const foundArticles: Array<{ ref: string; text: string; url: string }> = []
  
  for (const articleRef of articleReferences) {
    try {
      console.log(`🔍 Searching for: ${articleRef}`)
      
      // Clean up article reference for search
      const cleanRef = articleRef.replace('artikel ', '').trim()
      const searchQuery = `"${cleanRef}" site:wetten.overheid.nl`
      
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(searchQuery)}&num=3`
      )
      
      if (!response.ok) {
        console.log(`❌ Google API error for ${articleRef}: ${response.status}`)
        continue
      }
      
      const data = await response.json()
      
      if (data.items && data.items.length > 0) {
        // Look for actual article text in snippets
        for (const item of data.items) {
          if (item.snippet && item.snippet.length > 50) {
            console.log(`✅ Found article text via Google: ${articleRef} (${item.snippet.length} chars)`)
            foundArticles.push({
              ref: articleRef,
              text: item.snippet,
              url: item.link
            })
            break // Use first substantial result
          }
        }
      } else {
        console.log(`ℹ️ No Google results for: ${articleRef}`)
      }
    } catch (error) {
      console.error(`❌ Error searching for ${articleRef}:`, error)
    }
  }
  
  return foundArticles
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Store conversation context temporarily (in production, use Redis or database)
const conversationCache = new Map<string, ConversationContext>()

interface ConversationContext {
  lastQuery: string
  lastSources: JsonBron[]
  lastGoogleResults: string
  lastTopics: string[]
  timestamp: number
  questionCount: number
}

/**
 * Cleanup oude conversatie contexten (elke 30 minuten)
 */
setInterval(() => {
  const now = Date.now()
  const expired: string[] = []
  
  conversationCache.forEach((context, sessionId) => {
    if (now - context.timestamp > 30 * 60 * 1000) { // 30 minuten
      expired.push(sessionId)
    }
  })
  
  expired.forEach(sessionId => conversationCache.delete(sessionId))
  
  if (expired.length > 0) {
    console.log(`🧹 Cleaned up ${expired.length} expired conversation contexts`)
  }
}, 30 * 60 * 1000) // Run every 30 minutes

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
 * Detecteert of de huidige vraag een vervolgvraag is over hetzelfde onderwerp
 */
function isFollowUpQuestion(currentQuery: string, context: ConversationContext | undefined): boolean {
  if (!context || Date.now() - context.timestamp > 30 * 60 * 1000) { // 30 minuten timeout
    return false
  }

  const currentLower = currentQuery.toLowerCase()
  const lastLower = context.lastQuery.toLowerCase()

  // Extract key topics from both queries
  const currentTopics = extractLegalTopics(currentQuery)
  const lastTopics = context.lastTopics

  // Check for overlap in legal topics
  const topicOverlap = currentTopics.filter(topic => 
    lastTopics.some(lastTopic => 
      topic.includes(lastTopic) || lastTopic.includes(topic) || 
      levenshteinDistance(topic, lastTopic) < 3
    )
  )

  // Check for follow-up patterns
  const followUpPatterns = [
    'en als ik', 'maar wat als', 'en dan', 'maar dan', 'wat gebeurt als',
    'mag ik ook', 'en dan ook', 'geldt dat ook', 'en in het geval',
    'maar dan moet', 'en als dat', 'wat als ik dan', 'en wanneer',
    'hoe zit het met', 'en voor', 'geldt hetzelfde', 'dezelfde wet',
    'dat artikel', 'die wet', 'die regel', 'dit geval', 'hierbij',
    'verder nog', 'ook nog', 'andere vraag', 'vervolgvraag',
    'kan je uitleggen', 'wat betekent dat', 'hoe werkt dat'
  ]

  const hasFollowUpPattern = followUpPatterns.some(pattern => 
    currentLower.includes(pattern)
  )

  // Check for question continuation indicators
  const continuationWords = ['ook', 'verder', 'daarnaast', 'tevens', 'bovendien', 'extra', 'aanvullend']
  const hasContinuation = continuationWords.some(word => currentLower.includes(word))

  // Beslissingslogica
  const isFollowUp = (
    topicOverlap.length > 0 || // Overlap in juridische onderwerpen
    hasFollowUpPattern || // Expliciete vervolgvraag patronen  
    (hasContinuation && context.questionCount < 5) // Continuation woorden binnen 5 vragen
  )

  console.log(`🔍 Follow-up detectie: ${isFollowUp ? 'JA' : 'NEE'}`)
  if (isFollowUp) {
    console.log(`📚 Topic overlap: ${topicOverlap.join(', ')}`)
    console.log(`🔗 Follow-up pattern: ${hasFollowUpPattern}`)
    console.log(`➡️ Hergebruik van ${context.lastSources.length} bronnen`)
  }

  return isFollowUp
}

/**
 * Extraheert juridische onderwerpen uit een vraag
 */
function extractLegalTopics(query: string): string[] {
  const topics: string[] = []
  const queryLower = query.toLowerCase()

  // Wetten en wetboeken
  const juridischeWetten = [
    'strafrecht', 'burgerlijk recht', 'bestuursrecht', 'arbeidsrecht',
    'huurrecht', 'verkeersrecht', 'milieurecht', 'belastingrecht',
    'apv', 'algemene plaatselijke verordening', 'gemeentewet',
    'politiewet', 'opiumwet', 'wegenverkeerswet', 'burgerlijk wetboek',
    'wetboek van strafrecht', 'awb', 'algemene wet bestuursrecht'
  ]

  // Specifieke onderwerpen
  const juridischeOnderwerpen = [
    'alcohol', 'parkeren', 'geluid', 'overlast', 'vergunning',
    'handhaving', 'boete', 'dwangsom', 'eigendom', 'huur',
    'contract', 'arbeidsovereenkomst', 'ontslag', 'discriminatie',
    'privacy', 'belasting', 'uitkering', 'pensioen'
  ]

  // Gemeenten (voor APV)
  const juridischeGemeenten = [
    'amsterdam', 'rotterdam', 'den haag', 'utrecht', 'eindhoven',
    'tilburg', 'groningen', 'almere', 'breda', 'nijmegen'
  ]

  // Check voor matches
  const allTopics = [...juridischeWetten, ...juridischeOnderwerpen, ...juridischeGemeenten]
  allTopics.forEach(topic => {
    if (queryLower.includes(topic)) {
      topics.push(topic)
    }
  })

  return topics
}

/**
 * Berekent Levenshtein distance voor topic vergelijking
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[str2.length][str1.length]
}

/**
 * Genereert een sessie-ID voor conversatie tracking
 */
function getSessionId(userId: string | null, request: NextRequest): string {
  if (userId) {
    return `user_${userId}`
  }
  
  // Voor anonieme gebruikers: gebruik IP + User-Agent hash
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  // Simpele hash functie
  const hash = Buffer.from(ip + userAgent).toString('base64').slice(0, 10)
  return `anon_${hash}`
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

    // Get conversation context
    const sessionId = getSessionId(userId, request)
    const existingContext = conversationCache.get(sessionId)
    const isFollowUp = isFollowUpQuestion(question, existingContext)

    if (isFollowUp && existingContext) {
      console.log('🔗 VERVOLGVRAAG GEDETECTEERD - Hergebruik bestaande bronnen')
      console.log(`📚 Hergebruik: ${existingContext.lastSources.length} JSON bronnen`)
      console.log(`🌐 Hergebruik: ${existingContext.lastGoogleResults ? 'Google resultaten' : 'Geen Google resultaten'}`)
    }

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
          },
          // Exclude rate limit messages from counting towards rate limit
          answer: {
            not: {
              contains: 'Dagelijkse limiet bereikt'
            }
          }
        }
      })

      console.log(`🔍 Anonymous user (IP: ${clientIp}) has asked ${recentQuestions} questions in last 24h`)
      
      // Debug: Show what queries were found for this IP
      if (process.env.NODE_ENV === 'development') {
        const debugQueries = await prisma.query.findMany({
          where: {
            userId: null,
            createdAt: { gte: twentyFourHoursAgo },
            sources: { contains: clientIp }
          },
          select: { question: true, answer: true, createdAt: true },
          take: 5
        })
        console.log('🔍 Recent queries for this IP:', debugQueries.map(q => ({
          question: q.question.substring(0, 50) + '...',
          isRateLimit: q.answer.includes('Dagelijkse limiet bereikt'),
          createdAt: q.createdAt
        })))
      }

      if (recentQuestions >= 4) {
        console.log('❌ Rate limit exceeded for anonymous user')
        
        // Instead of returning an error, return a friendly rate limit message as a stream
        const rateLimitMessage = `🚨 **Dagelijkse limiet bereikt!**

Je hebt vandaag al **4 gratis vragen** gesteld zonder account.

## 🎯 Maak een gratis account aan voor:

✅ **Onbeperkt vragen stellen** - Geen limiet meer!  
✅ **Vraaggeschiedenis bewaren** - Bekijk eerdere gesprekken  
✅ **Snellere antwoorden** - Prioriteit in de wachtrij  
✅ **Uitgebreide analyses** - Meer gedetailleerde juridische adviezen  
✅ **Persoonlijke instellingen** - Stel je profiel in (advocaat, BOA, etc.)

## 🚀 Snel registreren:

**[→ Account aanmaken - 100% Gratis](/auth/signup)**

**[→ Al een account? Inloggen](/auth/signin)**

---

### 💡 Waarom een account?
WetHelder blijft **volledig gratis** te gebruiken! We vragen alleen een account aan om misbruik te voorkomen en om je de best mogelijke juridische ondersteuning te bieden.

**Registreren duurt slechts 30 seconden en je kunt direct weer vragen stellen!**`

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

        return new NextResponse(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          }
        })
      }
    }

    // STAP 1: Bronnen bepalen (hergebruik bij vervolgvragen)
    let jsonSources: JsonBron[] = []
    let jsonContext = ''
    
    if (isFollowUp && existingContext) {
      // HERVOLGVRAAG: Hergebruik bestaande bronnen
      console.log('📋 STAP 1: Hergebruik bestaande JSON bronnen voor vervolgvraag')
      jsonSources = existingContext.lastSources
      if (jsonSources.length > 0) {
        jsonContext = formatJsonSourcesForContext(jsonSources)
        console.log(`✅ ${jsonSources.length} JSON bronnen hergebruikt uit vorige vraag`)
      }
      
      // Voeg eventueel extra bronnen toe als nieuwe onderwerpen worden gedetecteerd
      const currentTopics = extractLegalTopics(question)
      const lastTopics = existingContext.lastTopics
      const newTopics = currentTopics.filter(topic => !lastTopics.includes(topic))
      
      if (newTopics.length > 0) {
        console.log(`🔍 Nieuwe onderwerpen gedetecteerd: ${newTopics.join(', ')} - Zoek aanvullende bronnen`)
        try {
          const additionalSources = await searchJsonSources(question, 5)
          const uniqueAdditionalSources = additionalSources.filter(newSource => 
            !jsonSources.some(existingSource => existingSource.url === newSource.url)
          )
          
          if (uniqueAdditionalSources.length > 0) {
            jsonSources = [...jsonSources, ...uniqueAdditionalSources]
            jsonContext = formatJsonSourcesForContext(jsonSources)
            console.log(`✅ ${uniqueAdditionalSources.length} aanvullende JSON bronnen toegevoegd`)
          }
        } catch (error) {
          console.error('❌ Fout bij zoeken aanvullende bronnen:', error)
        }
      }
    } else {
      // NIEUWE VRAAG: Normale bronnen zoeken
      console.log('📋 STAP 1: Controle officiele_bronnen.json')
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
    }

    // STAP 1.5: Actualiteitscontrole
    console.log('🔍 STAP 1.5: Actualiteitscontrole')
    let actualiteitsWaarschuwingen: ActualiteitsWaarschuwing[] = []
    let wetUpdates: WetUpdate[] = []
    
    try {
      actualiteitsWaarschuwingen = await checkActualiteit(question)
      wetUpdates = await checkActueleWetgeving(question)
      
      if (actualiteitsWaarschuwingen.length > 0) {
        console.log(`⚠️ ${actualiteitsWaarschuwingen.length} actualiteitswaarschuwingen gevonden`)
        actualiteitsWaarschuwingen.forEach(waarschuwing => {
          console.log(`⚠️ ${waarschuwing.urgentie}: ${waarschuwing.onderwerp}`)
        })
      }
      
      if (wetUpdates.length > 0) {
        console.log(`📝 ${wetUpdates.length} wetsupdates gevonden`)
        wetUpdates.forEach(update => {
          console.log(`📝 Update: ${update.oudArtikel} → ${update.nieuwArtikel}`)
        })
      }
    } catch (error) {
      console.error('❌ Fout bij actualiteitscontrole:', error)
    }

    // STAP 2: Google API bepalen (hergebruik bij vervolgvragen)
    let googleResults: string = ''
    
    if (isFollowUp && existingContext) {
      // VERVOLGVRAAG: Hergebruik Google resultaten
      console.log('🔍 STAP 2: Hergebruik Google resultaten voor vervolgvraag')
      googleResults = existingContext.lastGoogleResults
      if (googleResults) {
        console.log('✅ Google resultaten hergebruikt uit vorige vraag')
        console.log('⏭️ STAP 3: Google API overgeslagen - hergebruik bestaande resultaten')
      } else {
        console.log('ℹ️ Geen Google resultaten om te hergebruiken')
      }
      
      // Check of nieuwe vraag nieuwe Google zoeking vereist
      const currentTopics = extractLegalTopics(question)
      const lastTopics = existingContext.lastTopics
      const hasNewLegalTopics = currentTopics.some(topic => !lastTopics.includes(topic))
      
      const queryLower = question.toLowerCase()
      const needsNewGoogleKeywords = [
        'nieuw artikel', 'ander artikel', 'andere wet', 'andere gemeente', 
        'andere regel', 'ander geval', 'uitzondering', 'anders'
      ]
      const needsNewGoogleSearch = needsNewGoogleKeywords.some(keyword => queryLower.includes(keyword))
      
      if (hasNewLegalTopics || needsNewGoogleSearch) {
        console.log('🔍 Nieuwe context vereist aanvullende Google zoeking')
        try {
          const results = await searchGoogleCustomAPI(question)
          if (results.length > 0) {
            const newGoogleResults = formatGoogleResultsForContext(results)
            // Combineer met bestaande resultaten (vermijd duplicaten)
            googleResults = googleResults ? `${googleResults}\n\n=== AANVULLENDE BRONNEN ===\n\n${newGoogleResults}` : newGoogleResults
            console.log(`✅ ${results.length} aanvullende Google zoekresultaten toegevoegd`)
          }
        } catch (error) {
          console.error('❌ Fout bij aanvullende Google zoeken:', error)
        }
      }
    } else {
      // NIEUWE VRAAG: Gebruik geavanceerde needsGoogleSearch functie (zoals /wetuitleg)
      console.log('🔍 STAP 2: Evaluatie Google API noodzaak')
      
      const needsGoogle = needsGoogleSearch(jsonSources, question)
      
      if (needsGoogle) {
        console.log('🌐 STAP 3: Google Custom Search API wordt geraadpleegd')
        console.log('🌐 Searching Google Custom Search API for:', question)
        
        try {
          const results = await searchGoogleCustomAPI(question)
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
    }

    // STAP 4: Samenstellen input voor ChatGPT (met conversatie context)
    console.log('🤖 STAP 4: Input samenstelling voor ChatGPT')
    console.log(`🤖 Starting OpenAI request met ${jsonSources.length} JSON bronnen en ${googleResults ? 'Google resultaten' : 'geen Google resultaten'}`)
    
    // Extract article references for specialized ask handling (COPIED FROM WETUITLEG)
    const articleReferences = extractArticleReferences(question)
    console.log('📖 Detected article references:', articleReferences)

    // Search for complete article texts via Google API (for specific articles)
    let articleTexts: Array<{ ref: string; text: string; url: string }> = []
    if (articleReferences.length > 0) {
      console.log('🔍 Searching for complete article texts via Google API...')
      articleTexts = await searchArticleTextsViaGoogle(articleReferences)
      console.log(`✅ Found ${articleTexts.length} complete articles via Google`)
    }

    // Validate information reliability for ask endpoint as well
    const validationInput: LegalQuery = {
      query: question,
      foundSources: jsonSources,
      googleResults,
      articleReferences: articleReferences // Now we properly extract articles
    }
    
    const validation = validateLegalInformation(validationInput)
    console.log('🛡️ Ask validation result:', {
      reliable: validation.isReliable,
      confidence: validation.confidence,
      warnings: validation.warnings.length
    })

    // Include validation info in the response context
    const validationNote = validation.confidence === 'low' ? 
      "\n\n🔍 BELANGRIJK: Deze informatie kon niet volledig worden geverifieerd tegen officiële bronnen. Controleer altijd via wetten.overheid.nl voor definitieve zekerheid." : ""

    // Prepare enhanced Google results including article texts (COPIED FROM WETUITLEG LOGIC)
    let enhancedGoogleResults = googleResults
    
    // Add extracted article texts to context (most important for accuracy)
    if (articleTexts.length > 0) {
      let articleSection = '\n\n## VOLLEDIGE WETTEKSTEN:\n\n'
      articleTexts.forEach((article, index) => {
        articleSection += `### ARTIKEL ${article.ref}\n`
        articleSection += `**Volledige tekst:** ${article.text}\n`
        articleSection += `**Bron:** ${article.url}\n\n`
      })
      enhancedGoogleResults = articleSection + (enhancedGoogleResults || '')
    }

    // Voeg conversatie context toe voor betere vervolgvragen
    const conversationHistory = isFollowUp && existingContext ? [{
      role: 'user' as const,
      content: `Vorige vraag: "${existingContext.lastQuery}"`
    }] : []

    // Create a stream that captures the response for database storage
    let fullResponse = ''

    const responseStream = await streamingCompletion(
      question, 
      jsonSources, 
      enhancedGoogleResults ? [{ title: "Enhanced Google Results with Article Texts", content: enhancedGoogleResults }] : [],
      profession,
      false, // wetUitleg = false for ask endpoint
      conversationHistory,
      validationNote
    )

    const transformedStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            if (chunk.choices[0]?.delta?.content) {
              const content = chunk.choices[0].delta.content
              fullResponse += content
              
              // Send to client in the expected format
              const data = JSON.stringify({ content })
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
            }
          }
          
          // Save query to database with full response
          const clientIp = !session?.user ? (request.headers.get('x-forwarded-for') || 
                           request.headers.get('x-real-ip') || 'unknown') : null
          saveQueryToDatabase(question, fullResponse, profession, userId, jsonSources, enhancedGoogleResults, clientIp)
            .catch(error => console.error('❌ Error saving query to database:', error))
          
          // Update conversation context for future follow-up questions
          const currentTopics = extractLegalTopics(question)
          const newContext: ConversationContext = {
            lastQuery: question,
            lastSources: jsonSources,
            lastGoogleResults: enhancedGoogleResults,
            lastTopics: currentTopics,
            timestamp: Date.now(),
            questionCount: existingContext ? existingContext.questionCount + 1 : 1
          }
          conversationCache.set(sessionId, newContext)
          console.log(`💾 Conversatie context opgeslagen voor sessie: ${sessionId}`)
          
          controller.close()
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
        // Use IP-based tracking (storing in sources field for now)
        sources: {
          contains: clientIp
        },
        // Exclude rate limit messages from counting towards rate limit
        answer: {
          not: {
            contains: 'Dagelijkse limiet bereikt'
          }
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