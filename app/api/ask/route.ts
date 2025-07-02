// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

function getSessionId(userId: string | null, request: NextRequest): string {
  if (userId) {
    return `user-${userId}`
  }
  
  // For anonymous users, create session based on IP + User-Agent
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  // Create a simple hash-like ID
  const sessionData = `${ip}-${userAgent}`
  const sessionId = sessionData.replace(/[^a-zA-Z0-9-]/g, '').substring(0, 50)
  return `anon-${sessionId}`
}

// Check if a question is legally relevant using a quick OpenAI call
async function checkLegalRelevance(question: string): Promise<boolean> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Use the high-accuracy model for better legal relevance detection
      messages: [{
        role: 'system',
        content: `Je bent een filter die bepaalt of vragen juridisch relevant zijn voor een Nederlandse juridische AI-assistent.

JURIDISCH RELEVANT zijn vragen over:
- Nederlandse wetten en regelgeving
- Strafrecht, burgerlijk recht, arbeidsrecht, verkeersrecht, bestuursrecht
- Juridische procedures, aangifte, rechtszaken
- Contracten, aansprakelijkheid, rechten en plichten
- Boetes, overtredingen, juridische gevolgen
- Echtscheiding, erfrecht, huurrecht
- Bedrijfsrecht, btw, belastingen (juridische aspecten)

NIET JURIDISCH RELEVANT zijn vragen over:
- Koken, recepten, voeding
- Sport, entertainment, hobby's
- Technologie (tenzij juridische aspecten)
- Medische adviezen
- Reisadviezen
- Algemene levensvragen
- Weersomstandigheden
- Educatie (tenzij juridische rechten)

Antwoord alleen met "JA" als de vraag juridisch relevant is, of "NEE" als dit niet het case is.`
      }, {
        role: 'user',
        content: question
      }],
      temperature: 0.1,
      max_tokens: 5,
    })

    const answer = response.choices[0]?.message?.content?.trim().toLowerCase()
    return answer === 'ja' || answer === 'yes'
    
  } catch (error) {
    console.error('Error checking legal relevance:', error)
    // If there's an error, err on the side of allowing the question
    return true
  }
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

    // Rate limit check for anonymous users
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    let recentQuestions = 0

    if (!session?.user) {
      // Check how many questions this IP has asked in the last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      
      recentQuestions = await prisma.query.count({
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

      console.log(` Anonymous user (IP: ${clientIp}) has asked ${recentQuestions} questions in last 24h`)

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

    // Build conversation history from the request
    const conversationHistory: ChatMessage[] = []
    
    // Add conversation history if provided
    if (history && history.length > 0) {
      // Take last 6 messages to keep context manageable
      const recentHistory = history.slice(-6)
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

    // First check if the question is legally relevant
    const isLegallyRelevant = await checkLegalRelevance(question)
    
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

    // Create profession-specific system message
    const professionContext = getProfessionContext(profession)
    
    const systemMessage = {
      role: 'system' as const,
      content: `Je bent WetHelder, een Nederlandse juridische AI-assistent gespecialiseerd in het beantwoorden van juridische vragen.

${professionContext}

ANTWOORDSTIJL:
- Geef altijd concrete, praktische juridische adviezen
- Verwijs naar specifieke wetsartikelen met precieze cijfers (bijv. "artikel 318 Sr")
- Leg juridische begrippen helder uit
- Geef praktische stappen en handelingsperspectieven
- Gebruik Nederlandse wetgeving en jurisprudentie

STRUCTUUR:
Gebruik deze structuur voor je antwoorden:

**JURIDISCHE BASIS:**
[Relevante wetsartikelen en juridische grondslag]

**PRAKTISCHE BETEKENIS:**
[Wat dit concreet betekent voor de vraagsteller]

**HANDELINGSPERSPECTIEF:**
[Concrete stappen en adviezen]

**AANDACHTSPUNTEN:**
[Belangrijke juridische overwegingen]

Wees altijd accuraat, concreet en praktisch gericht.`
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder()
          
          // Create OpenAI stream
          const openaiStream = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [systemMessage, ...conversationHistory],
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
        sources: clientIp || 'unknown', // Store IP for rate limiting
      }
    })
  } catch (error) {
    console.error('Error saving query to database:', error)
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