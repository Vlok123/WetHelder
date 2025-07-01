import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

interface ValidationResult {
  isValid: boolean
  confidence: 'high' | 'medium' | 'low'
  warnings: string[]
  verifiedFacts: string[]
  potentialErrors: string[]
}

interface LegalSource {
  title: string
  snippet: string
  link: string
  source: string
  domain: string
  verified: boolean
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
    rateLimitMap.set(ip, { count: 0, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: MAX_ANONYMOUS_REQUESTS - 1 }
  }
  
  if (entry.count >= MAX_ANONYMOUS_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }
  
  return { allowed: true, remaining: MAX_ANONYMOUS_REQUESTS - entry.count - 1 }
}

function incrementRateLimit(ip: string): void {
  const entry = rateLimitMap.get(ip)
  if (entry) {
    entry.count++
  }
}

// 🔍 SLIMME JURIDISCHE VRAAG ANALYSE
async function analyzeJuridicalQuestion(query: string): Promise<{
  legalConcepts: string[]
  articleReferences: string[]
  lawBooks: string[]
  searchTerms: string[]
  complexity: 'simple' | 'complex'
  requiresValidation: boolean
}> {
  console.log('🧠 Analyseren juridische vraag...')
  
  const analysisPrompt = `Analyseer deze juridische vraag: "${query}"

Identificeer zeer zorgvuldig:
1. Juridische concepten (bijv. aanhouding, huiszoeking, politiegegevens, valsheid in geschrifte)
2. Artikelverwijzingen (bijv. artikel 27 Sr, art 8a Politiewet, artikel 8 Wet politiegegevens, 318 Sr)
3. Wetboeken (bijv. Strafrecht, Strafvordering, Politiewet, Wet politiegegevens)
4. Zoektermen voor internet search (extra variaties en synoniemen)
5. Complexiteit en validatie-behoefte

BELANGRIJK: Herken ook verkorte notaties zoals "318sr", "27sv", "8wpg".

Geef je antwoord in dit exacte JSON formaat:
{
  "legalConcepts": ["concept1", "concept2"],
  "articleReferences": ["artikel X wetboek", "art Y"],
  "lawBooks": ["wetboek1", "wetboek2"], 
  "searchTerms": ["zoekterm1", "zoekterm2", "synoniem1"],
  "complexity": "simple",
  "requiresValidation": true
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.1,
      max_tokens: 800
    })

    const analysis = JSON.parse(response.choices[0]?.message?.content || '{}')
    console.log('✅ Vraag geanalyseerd:', analysis)
    return analysis
  } catch (error) {
    console.error('❌ Fout bij vraag analyse:', error)
    return {
      legalConcepts: [],
      articleReferences: [],
      lawBooks: [],
      searchTerms: [query],
      complexity: 'complex',
      requiresValidation: true
    }
  }
}

// 🌐 MULTI-SOURCE INTERNET ZOEKSTRATEGIE
async function comprehensiveLegalSearch(query: string, analysis: any): Promise<LegalSource[]> {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
  const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID
  
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    console.log('❌ Google API credentials niet beschikbaar')
    return []
  }

  console.log(`🔍 Uitgebreide multi-source zoekactie voor: "${query}"`)
  
  const allResults: LegalSource[] = []
  
  // 1. PRIORITEIT: Officiële Nederlandse rechtsbronnen
  const officialSites = [
    { site: 'wetten.overheid.nl', priority: 10, description: 'Officiële Nederlandse wetgeving' },
    { site: 'rechtspraak.nl', priority: 9, description: 'Nederlandse jurisprudentie' },
    { site: 'rijksoverheid.nl', priority: 8, description: 'Overheidsbeleid en uitleg' },
    { site: 'om.nl', priority: 7, description: 'Openbaar Ministerie richtlijnen' },
    { site: 'politie.nl', priority: 6, description: 'Politie informatie' }
  ]
  
  // 2. SLIMME ZOEKVARIATIES GENEREREN
  const searchVariations = generateSmartSearchQueries(query, analysis)
  
  // 3. ZOEK PER OFFICIËLE BRON
  for (const { site, priority, description } of officialSites) {
    for (const searchQuery of searchVariations.slice(0, 3)) { // Top 3 variaties per site
      try {
        console.log(`🏛️ Zoeken op ${site}: "${searchQuery}"`)
        
        const siteQuery = `${searchQuery} site:${site}`
        const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(siteQuery)}&num=5`
        
        const response = await fetch(url)
        const data = await response.json()
        
        if (data.items?.length > 0) {
          console.log(`✅ ${data.items.length} resultaten gevonden op ${site}`)
          
          data.items.forEach((item: any) => {
            allResults.push({
              title: item.title || '',
              snippet: item.snippet || '',
              link: item.link || '',
              source: description,
              domain: site,
              verified: priority >= 8 // Hoge prioriteit = geverifieerd
            })
          })
        }
        
        // Kleine delay om rate limits te voorkomen
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.log(`❌ Fout bij zoeken op ${site}:`, error)
      }
    }
  }
  
  // 4. AANVULLENDE ACADEMISCHE/JURIDISCHE BRONNEN
  const additionalSources = [
    'navigator.nl', 'iuscommune.eu', 'rechtsorde.nl'
  ]
  
  for (const site of additionalSources) {
    try {
      const academicQuery = `${query} site:${site}`
      const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(academicQuery)}&num=3`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.items?.length > 0) {
        data.items.forEach((item: any) => {
          allResults.push({
            title: item.title || '',
            snippet: item.snippet || '',
            link: item.link || '',
            source: `Juridische database (${site})`,
            domain: site,
            verified: false
          })
        })
      }
    } catch (error) {
      console.log(`❌ Fout bij zoeken op ${site}:`, error)
    }
  }
  
  // 5. RESULTATEN FILTEREN EN RANGSCHIKKEN
  const uniqueResults = removeDuplicateSources(allResults)
  const rankedResults = rankSourcesByRelevance(uniqueResults, query, analysis)
  
  console.log(`✅ Totaal ${rankedResults.length} unieke bronnen gevonden`)
  return rankedResults.slice(0, 15) // Top 15 resultaten
}

// 🎯 SLIMME ZOEKVARIATIES GENEREREN
function generateSmartSearchQueries(query: string, analysis: any): string[] {
  const variations = [query]
  
  // Voeg artikel-specifieke zoekopdrachten toe
  if (analysis.articleReferences?.length > 0) {
    analysis.articleReferences.forEach((article: string) => {
      variations.push(article)
      variations.push(`"${article}" volledig`)
      variations.push(`${article} betekenis uitleg`)
    })
  }
  
  // Voeg wetboek-specifieke zoekopdrachten toe
  if (analysis.lawBooks?.length > 0) {
    analysis.lawBooks.forEach((lawBook: string) => {
      variations.push(`${query} ${lawBook}`)
    })
  }
  
  // Juridische synoniemen en variaties
  const legalSynonyms: { [key: string]: string[] } = {
    'artikel': ['art', 'art.', 'artikel'],
    'strafrecht': ['sr', 'wetboek van strafrecht', 'strafrecht'],
    'strafvordering': ['sv', 'wetboek van strafvordering'],
    'politiegegevens': ['wpg', 'wet politiegegevens'],
    'politiewet': ['politiewet 2012'],
    'aanhouding': ['arrestatie', 'inhechtenisneming'],
    'fouilleren': ['fouillering', 'veiligheidsfouillering'],
    'huiszoeking': ['doorzoeking', 'huiszoekingsbevel']
  }
  
  // Genereer synoniemvariaties
  const queryLower = query.toLowerCase()
  for (const [term, synonyms] of Object.entries(legalSynonyms)) {
    if (queryLower.includes(term)) {
      synonyms.forEach(synonym => {
        if (synonym !== term) {
          variations.push(query.replace(new RegExp(term, 'gi'), synonym))
        }
      })
    }
  }
  
  // Voeg zoektermen uit analyse toe
  if (analysis.searchTerms?.length > 0) {
    variations.push(...analysis.searchTerms)
  }
  
  return [...new Set(variations)].slice(0, 8) // Max 8 unieke variaties
}

// 🔄 DUPLICATEN VERWIJDEREN
function removeDuplicateSources(sources: LegalSource[]): LegalSource[] {
  const seen = new Set<string>()
  return sources.filter(source => {
    const key = `${source.link}_${source.title.slice(0, 50)}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

// 📊 BRONNEN RANGSCHIKKEN OP RELEVANTIE
function rankSourcesByRelevance(sources: LegalSource[], query: string, analysis: any): LegalSource[] {
  return sources.sort((a, b) => {
    let scoreA = 0
    let scoreB = 0
    
    // Prioriteit voor geverifieerde bronnen
    if (a.verified) scoreA += 50
    if (b.verified) scoreB += 50
    
    // Prioriteit voor officiële domeinen
    const officialDomains = ['wetten.overheid.nl', 'rechtspraak.nl', 'rijksoverheid.nl']
    if (officialDomains.includes(a.domain)) scoreA += 30
    if (officialDomains.includes(b.domain)) scoreB += 30
    
    // Relevantie op basis van titel en snippet
    const queryTerms = query.toLowerCase().split(' ')
    queryTerms.forEach(term => {
      if (a.title.toLowerCase().includes(term)) scoreA += 10
      if (a.snippet.toLowerCase().includes(term)) scoreA += 5
      if (b.title.toLowerCase().includes(term)) scoreB += 10
      if (b.snippet.toLowerCase().includes(term)) scoreB += 5
    })
    
    // Extra punten voor artikelverwijzingen
    if (analysis.articleReferences?.length > 0) {
      analysis.articleReferences.forEach((article: string) => {
        if (a.title.toLowerCase().includes(article.toLowerCase())) scoreA += 15
        if (b.title.toLowerCase().includes(article.toLowerCase())) scoreB += 15
      })
    }
    
    return scoreB - scoreA
  })
}

// ⚖️ GEAVANCEERDE JURIDISCHE VALIDATIE
async function validateLegalAnswer(
  question: string, 
  proposedAnswer: string, 
  sources: LegalSource[]
): Promise<ValidationResult> {
  console.log('⚖️ Valideren juridisch antwoord met officiële bronnen...')
  
  const officialSources = sources.filter(s => s.verified).slice(0, 5)
  
  const validationPrompt = `Je bent een Nederlandse juridische fact-checker met toegang tot officiële bronnen.

VRAAG: "${question}"

VOORGESTELD ANTWOORD:
"${proposedAnswer}"

OFFICIËLE BRONNEN:
${officialSources.map(s => `- ${s.title} (${s.domain}): "${s.snippet}"`).join('\n')}

Controleer het antwoord zorgvuldig op:
1. Juistheid van artikelverwijzingen en wetteksten
2. Correcte interpretatie van Nederlandse wetgeving
3. Betrouwbaarheid van bronnen
4. Actualiteit van informatie
5. Mogelijke juridische fouten

Geef je validatie in dit exacte JSON formaat:
{
  "isValid": true/false,
  "confidence": "high/medium/low", 
  "warnings": ["waarschuwing1", "waarschuwing2"],
  "verifiedFacts": ["feit1", "feit2"],
  "potentialErrors": ["fout1", "fout2"]
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: validationPrompt }],
      temperature: 0.0,
      max_tokens: 1000
    })

    const validation = JSON.parse(response.choices[0]?.message?.content || '{}')
    console.log('✅ Validatie resultaat:', validation)
    return validation
  } catch (error) {
    console.error('❌ Fout bij validatie:', error)
    return {
      isValid: false,
      confidence: 'low',
      warnings: ['Validatie kon niet worden uitgevoerd'],
      verifiedFacts: [],
      potentialErrors: ['Onzekere informatie - wees voorzichtig']
    }
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return 'onbekend'
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'WetUitleg API - Krachtige internet-gebaseerde juridische analyse. Gebruik POST voor vragen.' 
  })
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is vereist' },
        { status: 400 }
      )
    }

    console.log(`📝 WetUitleg vraag: "${query}"`)

    // Session check
    const session = await getServerSession(authOptions)
    const clientIP = getClientIP(request)

    // Rate limiting voor anonieme gebruikers
    if (!session) {
      const rateLimit = checkRateLimit(clientIP)
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: 'Te veel verzoeken. Probeer het later opnieuw.' },
          { status: 429 }
        )
      }
      incrementRateLimit(clientIP)
      console.log(`🔒 Anonieme gebruiker (IP: ${clientIP}) - ${rateLimit.remaining} verzoeken over`)
    }

    // 🧠 STAP 1: ANALYSEER DE JURIDISCHE VRAAG
    const questionAnalysis = await analyzeJuridicalQuestion(query)
    
    // 🔍 STAP 2: UITGEBREIDE INTERNET SEARCH
    const legalSources = await comprehensiveLegalSearch(query, questionAnalysis)
    
    // Stream response met INTERNET-BASED VALIDATION
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        try {
          console.log('🤖 Starten internet-gebaseerde juridische analyse...')
          
          // Bouw context met alle internet bronnen
          const context = `Je bent een Nederlandse juridische expert. Beantwoord de vraag accuraat gebaseerd op de verstrekte internetbronnen.

BELANGRIJKE INSTRUCTIES:
- Gebruik ALLEEN de officiële bronnen die zijn gevonden via internet
- Verwijs naar specifieke artikelen en wetten waar van toepassing
- Vermeld altijd de bron van je informatie
- Als informatie ontbreekt, zeg dit expliciet
- Geef wettelijke onderbouwing voor alle beweringen

OFFICIËLE INTERNETBRONNEN:
${legalSources.map(source => 
  `📖 ${source.title} (${source.domain}):\n"${source.snippet}"\nBron: ${source.link}\n`
).join('\n')}

VRAAG: "${query}"

Geef een accurate, wettelijk onderbouwde analyse met bronvermelding.`

          const messages = [
            {
              role: 'system',
              content: context
            },
            {
              role: 'user', 
              content: query
            }
          ]

          // Genereer antwoord op basis van internet bronnen
          const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: messages as any,
            stream: false,
            temperature: 0.1,
            max_tokens: 2500,
          })

          const initialAnswer = response.choices[0]?.message?.content || ''
          
          // ⚖️ STAP 3: VALIDEER MET INTERNET BRONNEN
          const validation = await validateLegalAnswer(query, initialAnswer, legalSources)
          
          // Bepaal output gebaseerd op validatie
          if (!validation.isValid && validation.confidence === 'low') {
            console.log('❌ Antwoord faalde validatie')
            
            const warningMessage = `⚠️ **ONVOLLEDIGE INFORMATIE**

Gebaseerd op de beschikbare internetbronnen kan ik geen volledig betrouwbaar antwoord geven omdat:
${validation.warnings.map(w => `• ${w}`).join('\n')}

**Beschikbare bronnen:**
${legalSources.slice(0, 3).map(s => `• ${s.title} - ${s.link}`).join('\n')}

**Aanbeveling:**
• Raadpleeg de volledige wettekst op wetten.overheid.nl
• Neem contact op met een juridisch adviseur
• Bekijk de specifieke overheidswebsite voor actuele informatie

**Dit is geen juridisch advies.**`

            // Stream de waarschuwing
            const chunks = warningMessage.match(/.{1,50}/g) || [warningMessage]
            for (const chunk of chunks) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
              await new Promise(resolve => setTimeout(resolve, 50))
            }
          } else {
            console.log('✅ Antwoord goedgekeurd door validatie')
            
            // Voeg bronvermelding en validatie-info toe
            const validatedAnswer = `${initialAnswer}

---
**📚 BRONVERMELDING:**
${legalSources.filter(s => s.verified).slice(0, 5).map(s => 
  `• ${s.title} - ${s.link}`
).join('\n')}

✅ **Betrouwbaarheid: ${validation.confidence.toUpperCase()}**
${validation.verifiedFacts.length > 0 ? `\n🔍 **Geverifieerde feiten:**\n${validation.verifiedFacts.map(f => `• ${f}`).join('\n')}` : ''}
${validation.warnings.length > 0 ? `\n⚠️ **Let op:**\n${validation.warnings.map(w => `• ${w}`).join('\n')}` : ''}

**Dit is geen juridisch advies. Raadpleeg altijd een professionele juridisch adviseur voor uw specifieke situatie.**`

            // Stream het gevalideerde antwoord
            const chunks = validatedAnswer.match(/.{1,50}/g) || [validatedAnswer]
            for (const chunk of chunks) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
              await new Promise(resolve => setTimeout(resolve, 50))
            }
          }
          
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
          controller.close()
          
        } catch (error) {
          console.error('❌ Streaming error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Er ging iets mis bij het analyseren van internetbronnen.' })}\n\n`))
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
          controller.close()
        }
      }
    })

    // Sla query op in database
    try {
      await prisma.query.create({
        data: {
          question: query,
          answer: `Internet-gebaseerde analyse met ${legalSources.length} bronnen`,
          sources: JSON.stringify(legalSources.map(s => s.link)),
          userId: session?.user?.id || null,
          profession: 'algemeen'
        }
      })
    } catch (dbError) {
      console.error('Database save error:', dbError)
    }

    console.log(`✅ Internet-gebaseerde WetUitleg antwoord gestream voor: "${query}"`)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('❌ WetUitleg error:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het verwerken van je vraag.' },
      { status: 500 }
    )
  }
}