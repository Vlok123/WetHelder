import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { findLocalLegalText, LocalLegalText } from '@/lib/localLegalTexts'

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

// 🔍 JURIDISCHE VRAAG ANALYSE (VERBETERD)
async function analyzeJuridicalQuestion(query: string): Promise<{
  legalConcepts: string[]
  articleReferences: string[]
  lawBooks: string[]
  complexity: 'simple' | 'complex'
  requiresValidation: boolean
}> {
  console.log('🧠 Analyseren juridische vraag...')
  
  // Eerst lokale pattern matching voor bekende artikelen
  const localPatterns = [
    { pattern: /artikel\s*8\s*wet\s*politiegegevens/i, ref: 'artikel 8 Wet politiegegevens' },
    { pattern: /artikel\s*8\s*wpg/i, ref: 'artikel 8 Wet politiegegevens' },
    { pattern: /artikel\s*27\s*(sv|strafvordering)/i, ref: 'artikel 27 Wetboek van Strafvordering' },
    { pattern: /artikel\s*8a?\s*politiewet/i, ref: 'artikel 8a Politiewet 2012' },
    { pattern: /artikel\s*2\s*identificatieplicht/i, ref: 'artikel 2 Wet op de identificatieplicht' }
  ]
  
  const foundArticles: string[] = []
  for (const { pattern, ref } of localPatterns) {
    if (pattern.test(query)) {
      foundArticles.push(ref)
      console.log(`🎯 Lokaal artikel gedetecteerd: ${ref}`)
    }
  }
  
  const analysisPrompt = `Analyseer deze juridische vraag: "${query}"

Identificeer:
1. Juridische concepten (bijv. aanhouding, huiszoeking, politiegegevens, etc.)
2. Artikelverwijzingen (bijv. artikel 27 Sr, art 8a Politiewet, artikel 8 Wet politiegegevens)
3. Wetboeken (bijv. Strafrecht, Strafvordering, Politiewet, Wet politiegegevens)
4. Complexiteit (simple/complex)
5. Of dit een high-risk vraag is die extra validatie vereist

LET OP: Als de vraag gaat over "artikel 8 Wet politiegegevens" of soortgelijke specifieke artikelen, zorg ervoor dat deze exact worden opgenomen in articleReferences.

Geef je antwoord in dit exacte JSON formaat:
{
  "legalConcepts": ["concept1", "concept2"],
  "articleReferences": ["artikel X wetboek", "art Y"],
  "lawBooks": ["wetboek1", "wetboek2"],
  "complexity": "simple",
  "requiresValidation": true
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.1,
      max_tokens: 500
    })

    const analysis = JSON.parse(response.choices[0]?.message?.content || '{}')
    
    // Voeg lokaal gevonden artikelen toe
    if (foundArticles.length > 0) {
      analysis.articleReferences = [...new Set([...foundArticles, ...(analysis.articleReferences || [])])]
    }
    
    console.log('✅ Vraag geanalyseerd:', analysis)
    return analysis
  } catch (error) {
    console.error('❌ Fout bij vraag analyse:', error)
    return {
      legalConcepts: [],
      articleReferences: foundArticles, // Gebruik lokaal gevonden artikelen als fallback
      lawBooks: [],
      complexity: 'complex',
      requiresValidation: true
    }
  }
}

// 🔍 SPECIFIEKE WETTEKST ZOEKER (LOKAAL + GOOGLE)
async function findExactLegalTexts(articleRefs: string[]): Promise<Array<{
  article: string
  text: string
  source: string
  verified: boolean
}>> {
  console.log('📖 Zoeken naar exacte wetteksten...')
  
  const legalTexts: Array<{
    article: string
    text: string
    source: string
    verified: boolean
  }> = []

  for (const articleRef of articleRefs) {
    let found = false
    
    // STAP 1: Zoek eerst in lokale database
    console.log(`🏠 Zoeken lokaal naar: ${articleRef}`)
    const localResults = findLocalLegalText(articleRef)
    
    if (localResults.length > 0) {
      const localText = localResults[0]
      legalTexts.push({
        article: articleRef,
        text: localText.fullText,
        source: localText.source,
        verified: true // Lokale teksten zijn altijd geverifieerd
      })
      console.log(`✅ Lokale wettekst gevonden voor ${articleRef}`)
      found = true
    }
    
    // STAP 2: Als niet lokaal gevonden, zoek via Google
    if (!found) {
      const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
      const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID
      
      if (GOOGLE_API_KEY && GOOGLE_CSE_ID) {
        try {
          console.log(`🔍 Google zoeken naar: ${articleRef}`)
          const query = `"${articleRef}" exacte tekst site:wetten.overheid.nl`
          const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}&num=3`
          
          const response = await fetch(url)
          const data = await response.json()
          
          if (data.items?.length > 0) {
            const item = data.items[0]
            legalTexts.push({
              article: articleRef,
              text: item.snippet || '',
              source: item.link || '',
              verified: item.link?.includes('wetten.overheid.nl') || false
            })
            console.log(`✅ Google wettekst gevonden voor ${articleRef}`)
            found = true
          }
        } catch (error) {
          console.error(`❌ Fout bij Google zoeken naar ${articleRef}:`, error)
        }
      }
    }
    
    if (!found) {
      console.log(`❌ Geen wettekst gevonden voor ${articleRef}`)
      // Voeg een fallback toe met verwijzing naar de officiële bron
      legalTexts.push({
        article: articleRef,
        text: `Volledige tekst niet beschikbaar in bronnen. Raadpleeg de complete tekst op: https://wetten.overheid.nl`,
        source: 'https://wetten.overheid.nl',
        verified: false
      })
    }
  }

  return legalTexts
}

// ⚖️ FACT-CHECKING EN VALIDATIE
async function validateLegalAnswer(
  question: string, 
  proposedAnswer: string, 
  officialSources: Array<{article: string, text: string, source: string}>
): Promise<ValidationResult> {
  console.log('⚖️ Valideren juridisch antwoord...')
  
  const validationPrompt = `Je bent een juridische fact-checker. 

VRAAG: "${question}"

VOORGESTELD ANTWOORD:
"${proposedAnswer}"

OFFICIËLE BRONNEN:
${officialSources.map(s => `- ${s.article}: "${s.text}" (Bron: ${s.source})`).join('\n')}

Controleer het antwoord zorgvuldig op:
1. Juistheid van artikelverwijzingen
2. Correcte interpretatie van wetteksten
3. Mogelijke juridische fouten
4. Betrouwbaarheid van de informatie

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
      temperature: 0.0, // Zeer conservatief voor validatie
      max_tokens: 800
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

// 🚀 UITGEBREIDE MULTI-SOURCE ZOEKSTRATEGIE (aangepast)
async function comprehensiveSearch(query: string): Promise<Array<{ title: string; snippet: string; link: string; source: string }>> {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
  const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID
  
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    console.log('❌ Google API credentials niet beschikbaar')
    return []
  }

  console.log(`🔍 Uitgebreide zoekactie voor: "${query}"`)
  
  const allResults: Array<{ title: string; snippet: string; link: string; source: string }> = []
  
  // 1. PRIORITEIT: Officiële bronnen eerst
  const prioritySites = [
    'wetten.overheid.nl',
    'rechtspraak.nl', 
    'rijksoverheid.nl'
  ]
  
  for (const site of prioritySites) {
    try {
      const siteQuery = `${query} site:${site}`
      console.log(`🏛️ Zoeken op ${site}: "${query}"`)
      
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
            source: site
          })
        })
      }
    } catch (error) {
      console.log(`❌ Fout bij zoeken op ${site}:`, error)
    }
  }
  
  return allResults.slice(0, 10) // Beperkt aantal voor betere kwaliteit
}

function generateSearchVariations(query: string): string[] {
  const variations = [query]
  
  const synonyms: { [key: string]: string[] } = {
    'artikel': ['art', 'art.', 'artikel'],
    'wetboek': ['wb', 'wetboek van'],
    'strafrecht': ['sr', 'strafrecht', 'wetboek van strafrecht'],
    'strafvordering': ['sv', 'strafvordering', 'wetboek van strafvordering'],
  }
  
  let expandedQuery = query.toLowerCase()
  for (const [key, values] of Object.entries(synonyms)) {
    if (expandedQuery.includes(key.toLowerCase())) {
      values.forEach(synonym => {
        if (synonym !== key) {
          variations.push(query.replace(new RegExp(key, 'gi'), synonym))
        }
      })
    }
  }
  
  return [...new Set(variations)]
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
    message: 'WetUitleg API endpoint met uitgebreide validatie. Gebruik POST voor vragen.' 
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
    
    // 📖 STAP 2: ZOEK EXACTE WETTEKSTEN
    const exactLegalTexts = await findExactLegalTexts(questionAnalysis.articleReferences)
    
    // 🔍 STAP 3: ZOEK AANVULLENDE CONTEXT
    const searchResults = await comprehensiveSearch(query)
    
    // Stream response met TRIPLE VALIDATION
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        try {
          console.log('🤖 Starten gevalideerde OpenAI response...')
          
          // Bouw uitgebreide, gevalideerde context
          let context = `Je bent een Nederlandse juridische expert. Beantwoord de vraag zeer zorgvuldig en accuraat.

BELANGRIJKE INSTRUCTIES:
- Gebruik ALLEEN de officiële bronnen die zijn verstrekt
- Als je niet zeker bent, vermeld dit expliciet
- Verwijs NOOIT naar artikelen als je de exacte tekst niet hebt
- Geef alleen informatie waar je 100% zeker van bent
- Vermeld geen bronnen of websites in je antwoord

OFFICIËLE WETTEKSTEN:
${exactLegalTexts.map(text => `${text.article}: "${text.text}"`).join('\n\n')}

AANVULLENDE CONTEXT:
${searchResults.map(r => `${r.title}: ${r.snippet}`).join('\n\n')}

VRAAG: "${query}"

Geef een accuraat, betrouwbaar antwoord gebaseerd ALLEEN op de verstrekte officiële informatie.`

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

          // Genereer het initiële antwoord
          const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: messages as any,
            stream: false, // Eerst compleet antwoord voor validatie
            temperature: 0.1,
            max_tokens: 2000,
          })

          const initialAnswer = response.choices[0]?.message?.content || ''
          
          // ⚖️ STAP 4: VALIDEER HET ANTWOORD
          const validation = await validateLegalAnswer(query, initialAnswer, exactLegalTexts)
          
          // Bepaal of we het antwoord kunnen geven
          if (!validation.isValid || validation.confidence === 'low') {
            console.log('❌ Antwoord faalde validatie')
            
            const warningMessage = `⚠️ **WAARSCHUWING: Onzekere Informatie**

Ik kan geen betrouwbaar antwoord geven op deze vraag omdat:
${validation.warnings.map(w => `• ${w}`).join('\n')}

Voor deze specifieke juridische vraag raad ik aan:
• Raadpleeg een advocaat of juridisch adviseur
• Bekijk de officiële wetteksten op wetten.overheid.nl
• Neem contact op met de relevante overheidsinstantie

**Dit is geen juridisch advies. Bij twijfel altijd professioneel juridisch advies inwinnen.**`

            // Stream de waarschuwing
            const chunks = warningMessage.match(/.{1,50}/g) || [warningMessage]
            for (const chunk of chunks) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
              await new Promise(resolve => setTimeout(resolve, 50))
            }
          } else {
            console.log('✅ Antwoord goedgekeurd door validatie')
            
            // Voeg validatie-informatie toe aan het antwoord
            const validatedAnswer = `${initialAnswer}

---
✅ **Betrouwbaarheid: ${validation.confidence.toUpperCase()}**
${validation.verifiedFacts.length > 0 ? `\n🔍 **Geverifieerde feiten:**\n${validation.verifiedFacts.map(f => `• ${f}`).join('\n')}` : ''}
${validation.warnings.length > 0 ? `\n⚠️ **Let op:**\n${validation.warnings.map(w => `• ${w}`).join('\n')}` : ''}

**Dit is geen juridisch advies. Bij twijfel altijd professioneel juridisch advies inwinnen.**`

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
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Er ging iets mis bij het genereren van het antwoord.' })}\n\n`))
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
          answer: `Gevalideerd antwoord - betrouwbaarheid gecontroleerd`,
          sources: JSON.stringify([...new Set(searchResults.map(r => r.source))]),
          userId: session?.user?.id || null,
          profession: 'algemeen'
        }
      })
    } catch (dbError) {
      console.error('Database save error:', dbError)
    }

    console.log(`✅ Gevalideerd WetUitleg antwoord gestream voor: "${query}"`)

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