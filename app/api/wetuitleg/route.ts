import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Rate limiting voor anonieme gebruikers
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimits = new Map<string, RateLimitEntry>()
const DAILY_LIMIT = 4
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000 // 24 uur

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (real) {
    return real.trim()
  }
  
  return 'unknown'
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimits.get(ip)
  
  if (!entry || now > entry.resetTime) {
    rateLimits.set(ip, { count: 0, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: DAILY_LIMIT - 1 }
  }
  
  if (entry.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 }
  }
  
  return { allowed: true, remaining: DAILY_LIMIT - entry.count - 1 }
}

function incrementRateLimit(ip: string): void {
  const entry = rateLimits.get(ip)
  if (entry) {
    entry.count++
  }
}

// Nederlandse wetgeving kennisbank
const LEGAL_KNOWLEDGE = `
Je bent een Nederlandse juridische expert. Je geeft uitgebreide, accurate uitleg over Nederlandse wetgeving.

BELANGRIJKE INSTRUCTIES:
- Geef altijd uitgebreide antwoorden (minimaal 200 woorden)
- Begin met de letterlijke wettekst als er naar een specifiek artikel wordt gevraagd
- Gebruik het format: **WETTEKST:** [letterlijke tekst] gevolgd door uitgebreide uitleg
- Verwijs naar gerelateerde artikelen waar relevant
- Geef praktische voorbeelden en toepassingen
- Leg juridische concepten helder uit
- Gebruik geen externe bronnen - werk vanuit je juridische kennis

ANTWOORD STRUCTUUR:
1. **WETTEKST:** [letterlijke artikeltekst indien van toepassing]
2. **UITLEG:** Uitgebreide juridische analyse
3. **PRAKTIJK:** Hoe dit in de praktijk werkt
4. **GERELATEERD:** Verwante artikelen en bepalingen

Geef altijd professionele, accurate en uitgebreide juridische uitleg.
`

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const clientIP = getClientIP(request)
  
  if (!session) {
    const rateLimit = checkRateLimit(clientIP)
    return NextResponse.json({ 
      remainingQuestions: rateLimit.remaining,
      message: 'WetUitleg API - Snelle juridische analyse' 
    })
  }
  
  return NextResponse.json({ 
    message: 'WetUitleg API - Snelle juridische analyse' 
  })
}

export async function POST(request: NextRequest) {
  try {
    const { query, history } = await request.json()
    
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
    }

    // Bouw gesprekgeschiedenis
    let conversationContext = ''
    if (history && history.length > 0) {
      conversationContext = `
      
GESPREKGESCHIEDENIS:
${history.slice(-4).map((msg: any, i: number) => 
  `${i % 2 === 0 ? 'Gebruiker' : 'Assistent'}: ${msg.content.substring(0, 300)}...`
).join('\n')}

LET OP: Houd rekening met de vorige vragen en antwoorden.`
    }

    // Stream response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        try {
          console.log('🤖 Genereren juridische analyse...')
          
          const prompt = `${LEGAL_KNOWLEDGE}${conversationContext}

VRAAG: "${query}"

Geef een uitgebreide, goed gestructureerde juridische analyse.`

          const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            max_tokens: 2000,
            stream: true
          })

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              const data = JSON.stringify({ content })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()

        } catch (error) {
          console.error('❌ Fout bij genereren analyse:', error)
          const errorMessage = JSON.stringify({ 
            content: 'Er is een fout opgetreden bij het genereren van de analyse. Probeer het opnieuw.' 
          })
          controller.enqueue(encoder.encode(`data: ${errorMessage}\n\n`))
          controller.close()
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
    console.error('❌ Server fout:', error)
    return NextResponse.json(
      { error: 'Server fout' },
      { status: 500 }
    )
  }
}