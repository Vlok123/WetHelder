import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { getBrancheAdvies, zoekBrancheRegels } from '@/lib/brancheRegels'

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

// Add database logging function
async function saveQueryToDatabase(
  question: string, 
  answer: string, 
  profession: string, 
  userId: string | null,
  clientIp: string | null = null,
  userAgent: string | null = null
) {
  try {
    await prisma.query.create({
      data: {
        question,
        answer,
        profession,
        userId,
        // Store tracking info for anonymous users in sources field
        sources: JSON.stringify({
          clientIp: clientIp || 'unknown',
          userAgent: userAgent || 'unknown',
          apiEndpoint: 'wetuitleg',
          timestamp: new Date().toISOString()
        }),
      }
    })
    console.log(`📝 Query saved to database (userId: ${userId || 'anonymous'})`)
  } catch (error) {
    console.error('❌ Error saving query to database:', error)
    // Don't throw error to avoid breaking the response
  }
}

function getClientIP(request: NextRequest): string {
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

function getProfessionContext(profession: string): string {
  switch (profession) {
    case 'advocaat':
      return `Je beantwoordt vragen voor een advocaat. Focus op:
- Diepgaande juridische analyse en jurisprudentie
- Processtrategieën en verweersmogelijkheden
- Relevante rechtspraak en precedenten
- Strategische processtappen en argumentatie`

    case 'politieagent':
      return `Je beantwoordt vragen voor een politieagent. Focus op:
- Concrete bevoegdheden en procedures
- Handhavingsaspecten en praktische toepassing
- Arrestatie- en aanhoudinsprocedures
- Operationele juridische aspecten`

    case 'boa':
      return `Je beantwoordt vragen voor een BOA/handhaver. Focus op:
- Specifieke BOA-bevoegdheden per domein
- APV-handhaving en bestuurlijke procedures
- Processenverbaal opstellen
- Praktische handhavingssituaties`

    case 'rechter':
      return `Je beantwoordt vragen voor een rechter/magistraat. Focus op:
- Juridische grondslag voor uitspraken
- Bewijswaardering en motivering
- Straftoemeting en sancties
- Procesrechtelijke aspecten`

    case 'notaris':
      return `Je beantwoordt vragen voor een notaris. Focus op:
- Burgerlijk recht en familierecht
- Contractenrecht en vastgoedrecht
- Notariële praktijk en procedures
- Authentieke akten en registers`

    case 'bedrijfsjurist':
      return `Je beantwoordt vragen voor een bedrijfsjurist. Focus op:
- Ondernemingsrecht en compliance
- Contractenrecht en aansprakelijkheid
- AVG en privacy-wetgeving
- Bedrijfsrechtelijke procedures`

    case 'gemeenteambtenaar':
      return `Je beantwoordt vragen voor een gemeenteambtenaar. Focus op:
- Bestuurlijke procedures en vergunningen
- APV-toepassing en gemeentelijke bevoegdheden
- Bezwaar en beroepsprocedures
- Praktische gemeentelijke vraagstukken`

    default:
      return `Je beantwoordt vragen voor een burger/algemeen publiek. Focus op:
- Begrijpelijke uitleg van juridische begrippen
- Praktische toepassingen en gevolgen
- Concrete stappen en handelingsperspectieven
- Toegankelijke juridische informatie`
  }
}

// Nederlandse wetgeving kennisbank
const LEGAL_KNOWLEDGE = `
Je bent een Nederlandse juridische expert. Je geeft uitgebreide, accurate uitleg over Nederlandse wetgeving.

BELANGRIJKE WETSWIJZIGING (SINDS 1 JULI 2024):
STRAATINTIMIDATIE valt vanaf 1 juli 2024 onder het NIEUWE artikel 429ter Sr (NIET meer artikel 266 Sr):

**ARTIKEL 429ter Sr - STRAATINTIMIDATIE (vanaf 1 juli 2024):**
"Degene die in het openbaar een ander indringend seksueel benadert door middel van opmerkingen, gebaren, geluiden of aanrakingen op een wijze die vreesaanjagend, vernederend, kwetsend of onterend is te achten, wordt gestraft met hechtenis van ten hoogste drie maanden of geldboete van de derde categorie."

BELANGRIJKE INSTRUCTIES:
- Geef altijd uitgebreide antwoorden (minimaal 200 woorden)
- Begin met de letterlijke wettekst als er naar een specifiek artikel wordt gevraagd
- Gebruik het format: **WETTEKST:** [letterlijke tekst] gevolgd door uitgebreide uitleg
- Verwijs naar gerelateerde artikelen waar relevant
- Geef praktische voorbeelden en toepassingen
- Leg juridische concepten helder uit
- Gebruik geen externe bronnen - werk vanuit je juridische kennis
- **BELANGRIJK: Controleer altijd op brancheregels die kunnen afwijken van wettelijke bepalingen**
- **Bij vragen over straatintimidatie: Verwijs ALTIJD naar artikel 429ter Sr (vanaf 1 juli 2024)**

ANTWOORD STRUCTUUR:
1. **WETTEKST:** [letterlijke artikeltekst indien van toepassing]
2. **UITLEG:** Uitgebreide juridische analyse
3. **PRAKTIJK:** Hoe dit in de praktijk werkt
4. **BRANCHEREGELS:** [indien van toepassing - specifieke regels van brancheorganisaties]
5. **GERELATEERD:** Verwante artikelen en bepalingen

AANDACHT VOOR BRANCHEREGELS:
- Veel sectoren hebben eigen regels die strenger kunnen zijn dan de wet
- Bijvoorbeeld: NVM-regels voor makelaars, NBA-regels voor advocaten, etc.
- Wijs altijd op mogelijke conflicten tussen wet en brancheregels
- Adviseer om de strengste regel te volgen

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
    const { query, history, profession = 'algemeen' } = await request.json()
    
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
    const userAgent = request.headers.get('user-agent')

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

    // Profession-specific context
    const professionContext = getProfessionContext(profession)
    
    // Check for relevant branch/industry rules
    const relevanteRegels = zoekBrancheRegels(query)
    
    // Bouw gesprekgeschiedenis
    let conversationHistory = ''
    if (history && history.length > 0) {
      const recentHistory = history.slice(-6) // Keep last 6 messages for better context
      conversationHistory = `

GESPREKGESCHIEDENIS:
${recentHistory.map((msg: any) => 
  `${msg.role === 'user' ? 'Gebruiker' : 'Assistent'}: ${msg.content.substring(0, 400)}`
).join('\n\n')}

CONTEXT: Dit is een doorlopend gesprek. Verwijs naar eerdere punten waar relevant en bouw voort op de context.`
    }

    // Variable to collect the complete response for database storage
    let completeResponse = ''

    // Stream response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        try {
          console.log('🤖 Genereren juridische analyse...')
          
          // Enhanced conversation context with legal AI
          const systemPrompt = `Je bent een gespecialiseerde Nederlandse juridische AI-assistent.

KRITIEKE WETSWIJZIGING (SINDS 1 JULI 2024):
STRAATINTIMIDATIE valt vanaf 1 juli 2024 onder het NIEUWE artikel 429ter Sr (NIET meer artikel 266 Sr):

**ARTIKEL 429ter Sr - STRAATINTIMIDATIE (vanaf 1 juli 2024):**
"Degene die in het openbaar een ander indringend seksueel benadert door middel van opmerkingen, gebaren, geluiden of aanrakingen op een wijze die vreesaanjagend, vernederend, kwetsend of onterend is te achten, wordt gestraft met hechtenis van ten hoogste drie maanden of geldboete van de derde categorie."

**SPECIFIEKE FRAUDETYPEN:**
**BANKHELPDESKFRAUDE** - Dit is oplichting (artikel 326 Sr) waarbij criminelen zich voordoen als bankmedewerkers. Kenmerken: contact via telefoon/e-mail/sms, beweren van verdachte transacties, vragen om software te installeren (AnyDesk/TeamViewer), of het delen van persoonlijke gegevens/codes. Valt onder oplichting maar heeft specifieke modus operandi.

**BELANGRIJKE INSTRUCTIES:**
- Geef altijd uitgebreide antwoorden (minimaal 200 woorden)
- Begin met de letterlijke wettekst als er naar een specifiek artikel wordt gevraagd
- Gebruik het format: **WETTEKST:** [letterlijke tekst] gevolgd door uitgebreide uitleg
- Verwijs naar gerelateerde artikelen waar relevant
- Geef praktische voorbeelden en toepassingen
- Leg juridische concepten helder uit
- Gebruik geen externe bronnen - werk vanuit je juridische kennis
- **BELANGRIJK: Controleer altijd op brancheregels die kunnen afwijken van wettelijke bepalingen**
- **Bij vragen over straatintimidatie: Verwijs ALTIJD naar artikel 429ter Sr (vanaf 1 juli 2024)**

ANTWOORD STRUCTUUR:
1. **WETTEKST:** [letterlijke artikeltekst indien van toepassing]
2. **UITLEG:** Uitgebreide juridische analyse
3. **PRAKTIJK:** Hoe dit in de praktijk werkt
4. **BRANCHEREGELS:** [indien van toepassing - specifieke regels van brancheorganisaties]
5. **GERELATEERD:** Verwante artikelen en bepalingen

AANDACHT VOOR BRANCHEREGELS:
- Veel sectoren hebben eigen regels die strenger kunnen zijn dan de wet
- Bijvoorbeeld: NVM-regels voor makelaars, NBA-regels voor advocaten, etc.
- Wijs altijd op mogelijke conflicten tussen wet en brancheregels
- Adviseer om de strengste regel te volgen

Geef altijd professionele, accurate en uitgebreide juridische uitleg.
`

          // Enhanced prompt with branch rules
          let prompt = `${systemPrompt}

${professionContext}

${conversationHistory}`

          // Add branch rules section if relevant rules found
          if (relevanteRegels.length > 0) {
            prompt += `

BRANCHEREGELS BESCHIKBAAR:
De volgende brancheregels zijn relevant voor deze vraag:
${relevanteRegels.map(regel => 
  `- ${regel.organisatie}: ${regel.regel}
  Omschrijving: ${regel.omschrijving}
  Gevolgen bij overtreding: ${regel.gevolgen}
  Bron: ${regel.bron}`
).join('\n\n')}

BELANGRIJK: Let goed op mogelijke verschillen tussen wettelijke bepalingen en brancheregels. Behandel beide in je antwoord.`
          }

          prompt += `

VRAAG: "${query}"

Geef een uitgebreide, goed gestructureerde juridische analyse die aansluit bij het profiel van de gebruiker.${relevanteRegels.length > 0 ? ' Integreer relevante brancheregels in je antwoord en wijs op eventuele conflicten met wettelijke bepalingen.' : ''}`

          const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
            temperature: 0.1,
            max_tokens: 2000,
            stream: true
          })

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              completeResponse += content // Collect response for database
              const data = JSON.stringify({ content })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          // Save to database after streaming is complete
          if (completeResponse.trim()) {
            await saveQueryToDatabase(
              query,
              completeResponse,
              profession,
              session?.user?.id || null,
              clientIP,
              userAgent
            )
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