// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getBrancheAdvies, zoekBrancheRegels } from '@/lib/brancheRegels'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Store conversation context temporarily (in production, use Redis or database)
const conversationCache = new Map<string, ConversationContext>()

interface ConversationContext {
  lastQuery: string
  lastTopics: string[]
  timestamp: number
  questionCount: number
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Enhanced IP detection for corporate/Citrix environments
function getEnhancedClientIP(request: NextRequest): string {
  // Try multiple headers commonly used in corporate environments
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  const clientIp = request.headers.get('cf-connecting-ip') // Cloudflare
  const xForwardedHost = request.headers.get('x-forwarded-host')
  
  if (forwarded) {
    // Take the first IP from comma-separated list
    const firstIP = forwarded.split(',')[0].trim()
    if (firstIP !== '127.0.0.1' && firstIP !== 'localhost') {
      return firstIP
    }
  }
  
  if (real && real !== '127.0.0.1') {
    return real.trim()
  }
  
  if (clientIp) {
    return clientIp.trim()
  }
  
  // Fallback to a more unique identifier for corporate environments
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const acceptLanguage = request.headers.get('accept-language') || 'unknown'
  
  // Create a hash-like identifier from headers for better tracking
  const fingerprint = `${userAgent}-${acceptLanguage}-${xForwardedHost || 'unknown'}`
    .replace(/[^a-zA-Z0-9-]/g, '')
    .substring(0, 50)
  
  return `corp-${fingerprint}`
}

function getSessionId(userId: string | null, request: NextRequest): string {
  if (userId) {
    return `user-${userId}`
  }
  
  // Enhanced session identification for anonymous users in corporate environments
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            request.headers.get('cf-connecting-ip') || // Cloudflare
            'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const acceptLanguage = request.headers.get('accept-language') || 'unknown'
  const xForwardedHost = request.headers.get('x-forwarded-host') || 'unknown'
  
  // Enhanced fingerprinting for corporate/Citrix environments
  // These environments often have similar IPs but different session characteristics
  const sessionData = `${ip}-${userAgent}-${acceptLanguage}-${xForwardedHost}`
  const sessionId = sessionData.replace(/[^a-zA-Z0-9-]/g, '').substring(0, 50)
  return `anon-${sessionId}`
}

// Check if a question is legally relevant - much more permissive approach
function checkLegalRelevance(question: string, conversationHistory: any[] = []): boolean {
  const lowerQuestion = question.toLowerCase()
  
  // If there's conversation history, assume follow-up questions are relevant
  if (conversationHistory && conversationHistory.length > 0) {
    return true
  }
  
  // Always allow questions with legal keywords or procedural terms
  const legalKeywords = [
    'wet', 'artikel', 'recht', 'juridisch', 'advocaat', 'rechter', 'politie', 'boa',
    'contract', 'aansprakelijk', 'straf', 'boete', 'procedure', 'aangifte', 'bezwaar',
    'beroep', 'vonnis', 'uitspraak', 'rechtbank', 'hof', 'cassatie', 'wetboek',
    'grondwet', 'wetgeving', 'regelgeving', 'verordening', 'besluit', 'ministerieel',
    'gemeente', 'provincie', 'staat', 'overheid', 'bestuur', 'handhaving',
    'dwangsom', 'executie', 'beslag', 'faillissement', 'surseance', 'schuldsanering',
    'alimentatie', 'echtscheiding', 'erfenis', 'testament', 'notaris', 'hypotheek',
    'huur', 'koop', 'eigendom', 'bezit', 'pacht', 'erfpacht', 'opstal',
    'arbeid', 'ontslag', 'cao', 'werkgever', 'werknemer', 'vakbond',
    'btw', 'belasting', 'fiscaal', 'douane', 'accijns', 'successie',
    'verzekering', 'schade', 'letselschade', 'smartengeld', 'schadevergoeding',
    'privacy', 'avg', 'gdpr', 'persoonsgegevens', 'toestemming',
    'intellectueel', 'auteursrecht', 'patent', 'merk', 'octrooi',
    'milieurecht', 'omgevingsrecht', 'bestemmingsplan', 'vergunning',
    'vreemdelingenrecht', 'naturalisatie', 'verblijfsvergunning', 'asiel',
    // Common follow-up question words
    'stappen', 'procedure', 'voldoet', 'handhaven', 'naleven', 'overtreding',
    'sanctie', 'maatregel', 'verbod', 'gebod', 'voorschrift', 'norm',
    'vervolgstappen', 'wat nu', 'verder', 'volgende', 'daarna', 'dan',
    'gevolgen', 'consequenties', 'kan ik', 'moet ik', 'mag ik'
  ]
  
  // Check if question contains legal keywords
  if (legalKeywords.some(keyword => lowerQuestion.includes(keyword))) {
    return true
  }
  
  // Block only very obvious non-legal questions
  const obviousNonLegal = [
    'appeltaart bakken', 'hoe bak je', 'recept voor', 'ingrediënten',
    'voetbal wedstrijd', 'sport uitslagen', 'spelregels voetbal',
    'weer vandaag', 'temperatuur', 'gaat het regenen',
    'vakantie boeken', 'hotel reserveren', 'vliegtickets',
    'computer installeren', 'software downloaden', 'programmeren',
    'medicijn nemen', 'symptomen ziekte', 'medisch advies'
  ]
  
  // Only block if it's clearly about these non-legal topics AND not a follow-up
  const isObviouslyNonLegal = obviousNonLegal.some(term => lowerQuestion.includes(term))
  
  // Be very permissive - only block obvious non-legal standalone questions
  return !isObviouslyNonLegal
}

export async function POST(request: NextRequest) {
  try {
    const { question, profession = 'algemeen', history = [] } = await request.json()

    if (!question) {
      return NextResponse.json({ error: 'Vraag is verplicht' }, { status: 400 })
    }

    console.log('WetHelder.nl Ask gestart voor vraag:', question)

    // Get user session (optional for anonymous users)
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || null

    // Enhanced IP detection for corporate/Citrix environments
    const clientIp = getEnhancedClientIP(request)
    let recentQuestions = 0

    if (!session?.user) {
      // Enhanced rate limiting with better corporate environment support
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      
      recentQuestions = await prisma.query.count({
        where: {
          userId: null,
          createdAt: {
            gte: twentyFourHoursAgo
          },
          // Enhanced search in sources field for IP tracking
          OR: [
            {
              sources: {
                contains: clientIp
              }
            },
            // Also check for the old format for backwards compatibility
            {
              sources: clientIp
            }
          ],
          // Exclude rate limit messages from counting towards rate limit
          answer: {
            not: {
              contains: 'Dagelijkse limiet bereikt'
            }
          }
        }
      })

      console.log(` Enhanced tracking - Anonymous user (IP: ${clientIp}) has asked ${recentQuestions} questions in last 24h`)

      if (recentQuestions >= 4) {
        console.log(' Rate limit exceeded for anonymous user')
        
        // Return rate limit message as stream
        const rateLimitMessage = `**Dagelijkse limiet bereikt!**

Je hebt vandaag al **4 gratis vragen** gesteld zonder account.

Maak een gratis account aan voor:

 **Onbeperkt vragen stellen** - Geen limiet meer!  
 **Vraaggeschiedenis bewaren** - Bekijk eerdere gesprekken  
 **Snellere antwoorden** - Prioriteit in de wachtrij  
 **Uitgebreide analyses** - Meer gedetailleerde juridische adviezen  
 **Persoonlijke instellingen** - Stel je profiel in (advocaat, BOA, etc.)

Snel registreren:

**[→ Account aanmaken - 100% Gratis](/auth/signup)**

**[→ Al een account? Inloggen](/auth/signin)**

---

Waarom een account?
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

    // Get conversation context
    const sessionId = getSessionId(userId, request)
    const existingContext = conversationCache.get(sessionId)

    // Check for relevant branch/industry rules
    const relevanteRegels = zoekBrancheRegels(question)
    
    // Build conversation history from the request
    const conversationHistory: ChatMessage[] = []
    
    // Add system message with profession context
    const professionContext = getProfessionContext(profession)
    
    // Enhanced system prompt with branch rules capability
    let systemPrompt = `Je bent WetHelder, een Nederlandse juridische AI-assistent gespecialiseerd in het beantwoorden van juridische vragen.

${professionContext}

ANTWOORDSTIJL:
- Geef altijd concrete, praktische juridische adviezen
- Verwijs naar specifieke wetsartikelen met precieze cijfers (bijv. "artikel 318 Sr")
- Leg juridische begrippen helder uit
- Geef praktische stappen en handelingsperspectieven
- Gebruik Nederlandse wetgeving en jurisprudentie
- Verwijs naar eerdere gesprekspunten wanneer relevant
- **BELANGRIJK: Controleer altijd op brancheregels die kunnen afwijken van wettelijke bepalingen**

STRUCTUUR:
Gebruik deze structuur voor je antwoorden:

**JURIDISCHE BASIS:**
[Relevante wetsartikelen en juridische grondslag]

**PRAKTISCHE BETEKENIS:**
[Wat dit concreet betekent voor de vraagsteller]`

    // Add branch rules section if relevant rules found
    if (relevanteRegels.length > 0) {
      systemPrompt += `

**BRANCHEREGELS:**
[Specifieke regels van brancheorganisaties die van toepassing kunnen zijn]`
      
      // Add found rules to prompt context
      systemPrompt += `

BESCHIKBARE BRANCHEREGELS VOOR DEZE VRAAG:
${relevanteRegels.map(regel => 
  `- ${regel.organisatie}: ${regel.regel}\n  ${regel.omschrijving}\n  Gevolgen: ${regel.gevolgen}`
).join('\n\n')}`
    }

    systemPrompt += `

**HANDELINGSPERSPECTIEF:**
[Concrete stappen en adviezen]

**AANDACHTSPUNTEN:**
[Belangrijke juridische overwegingen${relevanteRegels.length > 0 ? ' en mogelijke conflicten tussen wet en brancheregels' : ''}]

Wees altijd accuraat, concreet en praktisch gericht. Bouw voort op eerdere vragen in het gesprek.${relevanteRegels.length > 0 ? ' Let op mogelijke verschillen tussen wettelijke bepalingen en brancheregels!' : ''}`

    conversationHistory.push({
      role: 'system',
      content: systemPrompt
    })
    
    // Add conversation history if provided
    if (history && history.length > 0) {
      // Take last 8 messages to keep more context
      const recentHistory = history.slice(-8)
      conversationHistory.push(...recentHistory.map((msg: any) => ({
        role: msg.role || (msg.isUser ? 'user' : 'assistant'),
        content: msg.content || msg.text || msg.question || msg.answer || ''
      })))
    }

    // Add current question
    conversationHistory.push({
      role: 'user',
      content: question
    })

    // First check if the question is legally relevant - but be much more permissive for follow-up questions
    const isLegallyRelevant = checkLegalRelevance(question, history)
    
    if (!isLegallyRelevant) {
      // Create a polite response for non-legal questions
      const nonLegalResponse = `Bedankt voor je vraag! 

WetHelder is gespecialiseerd in het beantwoorden van **juridische vragen** over Nederlandse wetgeving, zoals:

🏛️ **Strafrecht** - Aangifte, boetes, strafbare feiten  
🏠 **Burgerlijk recht** - Contracten, aansprakelijkheid, schade  
💼 **Arbeidsrecht** - Ontslag, arbeidsovereenkomsten, rechten  
🚗 **Verkeersrecht** - Verkeersovertredingen, schade, verzekering  
🏘️ **Bestuursrecht** - Bezwaar, beroep, vergunningen  

Voor andere vragen raad ik je aan om te zoeken op **Google** of andere gespecialiseerde bronnen te raadplegen.

**Heb je wel een juridische vraag?** Stel deze gerust! Bijvoorbeeld:
- "Mag mijn werkgever me zonder reden ontslaan?"
- "Wat moet ik doen na een verkeersongeval?"
- "Hoe dien ik bezwaar in tegen een boete?"

Ik help je graag met alle juridische vraagstukken! 🏛️⚖️`

      // Create streaming response for non-legal questions
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder()
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: nonLegalResponse })}\n\n`))
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

    // System message is already added to conversationHistory above

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder()
          
          // Create OpenAI stream
          const openaiStream = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: conversationHistory,
            temperature: 0.3,
            max_tokens: 2000,
            stream: true,
          })

          let fullResponse = ''

          for await (const chunk of openaiStream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullResponse += content
              
              // Send content to client
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }

          // Update rate limit for anonymous users
          if (!session) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ remainingQuestions: Math.max(0, 3 - (recentQuestions || 0)) })}\n\n`))
          }

          // Save to database
          try {
            await saveQueryToDatabase(
              question,
              fullResponse,
              profession,
              userId,
              clientIp || null
            )
          } catch (dbError) {
            console.error('Error saving to database:', dbError)
          }

          // Update conversation cache
          conversationCache.set(sessionId, {
            lastQuery: question,
            lastTopics: extractTopics(question),
            timestamp: Date.now(),
            questionCount: (existingContext?.questionCount || 0) + 1
          })

          // Clean up old cache entries (older than 1 hour)
          const oneHourAgo = Date.now() - 60 * 60 * 1000
          for (const [key, context] of conversationCache.entries()) {
            if (context.timestamp < oneHourAgo) {
              conversationCache.delete(key)
            }
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
          controller.close()

        } catch (error) {
          console.error('Error in streaming:', error)
          const encoder = new TextEncoder()
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            content: 'Er is een fout opgetreden bij het verwerken van uw vraag. Probeer het opnieuw.' 
          })}\n\n`))
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
          controller.close()
        }
      }
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })

  } catch (error) {
    console.error('Error in ask API:', error)
    return NextResponse.json({ 
      error: 'Er is een fout opgetreden',
      message: 'Probeer het opnieuw'
    }, { status: 500 })
  }
}

function getProfessionContext(profession: string): string {
  switch (profession) {
    case 'advocaat':
      return `Je beantwoordt vragen voor een advocaat. Focus op:
- Diepgaande juridische analyse
- Processtrategieën en verweersmogelijkheden
- Relevante jurisprudentie
- Praktische processtappen`

    case 'politieagent':
      return `Je beantwoordt vragen voor een politieagent. Focus op:
- Concrete bevoegdheden en procedures
- Handhavingsaspekten
- Arrestatie- en aanhoudinsprocedures
- Praktische uitvoering`

    case 'boa':
      return `Je beantwoordt vragen voor een BOA/handhaver. Focus op:
- Specifieke BOA-bevoegdheden
- APV-handhaving
- Processenverbaal opstellen
- Bestuurlijke procedures`

    case 'rechter':
      return `Je beantwoordt vragen voor een rechter/magistraat. Focus op:
- Juridische grondslag voor uitspraken
- Bewijswaardering
- Straftoemeting
- Procesrecht`

    case 'notaris':
      return `Je beantwoordt vragen voor een notaris. Focus op:
- Burgerlijk recht
- Contractenrecht
- Familierecht
- Vastgoedrecht en notariële praktijk`

    case 'bedrijfsjurist':
      return `Je beantwoordt vragen voor een bedrijfsjurist. Focus op:
- Ondernemingsrecht
- Contractenrecht
- Compliance
- AVG en bedrijfsrechtelijke kwesties`

    default:
      return `Je beantwoordt vragen voor een burger/algemeen publiek. Focus op:
- Begrijpelijke uitleg van juridische begrippen
- Praktische toepassingen
- Concrete stappen en adviezen
- Toegankelijke juridische informatie`
  }
}

function extractTopics(query: string): string[] {
  const legalTopics = [
    'strafrecht', 'civiel recht', 'bestuursrecht', 'arbeidsrecht', 
    'familierecht', 'vastgoedrecht', 'fiscaal recht', 'europees recht'
  ]
  
  const topics: string[] = []
  const lowerQuery = query.toLowerCase()
  
  for (const topic of legalTopics) {
    if (lowerQuery.includes(topic.toLowerCase())) {
      topics.push(topic)
    }
  }
  
  return topics
}

async function saveQueryToDatabase(
  question: string, 
  answer: string, 
  profession: string, 
  userId: string | null,
  clientIp: string | null = null
) {
  try {
    await prisma.query.create({
      data: {
        question,
        answer,
        profession,
        userId,
        // Enhanced tracking info - use sources field to store metadata
        sources: JSON.stringify({
          clientIp: clientIp || 'unknown',
          apiEndpoint: 'ask',
          timestamp: new Date().toISOString(),
          environment: clientIp?.startsWith('corp-') ? 'corporate' : 'standard'
        }),
      }
    })
    console.log(`📝 Query saved to database (userId: ${userId || 'anonymous'}, ip: ${clientIp})`)
  } catch (error) {
    console.error('❌ Error saving query to database:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    // Rate limit check for anonymous users
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
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
          },
          answer: {
            not: {
              contains: 'Dagelijkse limiet bereikt'
            }
          }
        }
      })

      return NextResponse.json({
        remainingQuestions: Math.max(0, 4 - recentQuestions),
        isAnonymous: true
      })
    }

    return NextResponse.json({
      remainingQuestions: null, // No limit for logged-in users
      isAnonymous: false
    })

  } catch (error) {
    console.error('Error checking rate limit:', error)
    return NextResponse.json({ 
      remainingQuestions: 0,
      isAnonymous: true 
    })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}