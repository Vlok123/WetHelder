// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getBrancheAdvies, zoekBrancheRegels } from '@/lib/brancheRegels'
import { searchPriorityJsonSources } from '@/lib/jsonSources'

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

    console.log(`WetHelder.nl Ask gestart voor vraag: "${question}" (Beroep: ${profession})`)

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
    
    // 🔍 HYBRIDE PRIORITAIRE JSON SEARCH - Snelheid + Betrouwbaarheid (same as wetuitleg)
    console.log('🔍 Ask: Checking priority JSON sources (hybrid approach)...')
    
    // STAP 1: Probeer eerst geoptimaliseerde bestanden (95% sneller)
    let jsonSearchResult: {
      foundInJson: boolean,
      sources: any[],
      recommendation: 'use_json' | 'use_google' | 'use_both',
      suggestion?: string
    }
    try {
      const { searchOptimizedJsonSourcesWithVerification } = await import('../../../lib/optimizedJsonSources')
      const optimizedResult = await searchOptimizedJsonSourcesWithVerification(question)
      
      if (optimizedResult.foundInJson && optimizedResult.sources.length > 0) {
        console.log(`⚡ Found ${optimizedResult.sources.length} sources in optimized format (fast path)`)
        
        // Convert optimized format to BWB format for consistency
        const convertedSources = optimizedResult.sources.map(source => ({
          id: source['Bron (naam)'],
          naam: source['Bron (naam)'],
          url: source['URL'],
          beschrijving: source['Omschrijving'],
          categorie: source['Categorie'],
          betrouwbaarheid: 'hoog' as const,
          trefwoorden: [source['Topic']],
          type: 'wetgeving' as const,
          topic: source['Topic'],
          scope: source['Scope']
        }))
        
        jsonSearchResult = {
          foundInJson: true,
          sources: convertedSources,
          recommendation: optimizedResult.recommendation,
          suggestion: optimizedResult.suggestion
        }
      } else {
        console.log('ℹ️  No matches in optimized sources, falling back to full BWB parsing...')
        
        // Add suggestion to fallback result if we have one
        if (optimizedResult.suggestion) {
          console.log(`💡 Suggestion: ${optimizedResult.suggestion}`)
        }
        
        // STAP 2: Fall back naar volledige BWB parsing (betrouwbaarheid)
        const { searchPriorityJsonSources } = await import('../../../lib/jsonSources')
        const bwbResult = await searchPriorityJsonSources(question)
        jsonSearchResult = {
          ...bwbResult,
          suggestion: optimizedResult.suggestion
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.log('⚠️  Optimized sources not available, using BWB parsing:', errorMessage)
      // STAP 2: Fall back naar volledige BWB parsing als backup
      const { searchPriorityJsonSources } = await import('../../../lib/jsonSources')
      jsonSearchResult = await searchPriorityJsonSources(question)
    }
    
    let jsonSourcesContext = ''
    
    if (jsonSearchResult.foundInJson && jsonSearchResult.sources.length > 0) {
      console.log(`✅ Ask: Found ${jsonSearchResult.sources.length} priority JSON sources`)
      const { formatJsonSourcesForDirectAnswer } = await import('../../../lib/jsonSources')
      jsonSourcesContext = formatJsonSourcesForDirectAnswer(jsonSearchResult.sources)
      
      // Add suggestion context if available
      if (jsonSearchResult?.suggestion) {
        jsonSourcesContext += `\n\n**BELANGRIJKE OPMERKING**: ${jsonSearchResult.suggestion}\n`
      }
    } else {
      console.log('ℹ️ Ask: No priority JSON sources found, will use general knowledge')
      
      // Even if no sources found, include suggestion if available
      if (jsonSearchResult?.suggestion) {
        jsonSourcesContext = `**BELANGRIJKE OPMERKING**: ${jsonSearchResult.suggestion}\n\n`
      }
    }

    // Build conversation history from the request
    const conversationHistory: ChatMessage[] = []
    
    // Add system message with profession context
    const professionContext = getProfessionContext(profession)
    
    // Enhanced conversation context with legal AI
    let systemPrompt = `Je bent een gespecialiseerde Nederlandse juridische AI-assistent.

**🎯 BEROEPSPECIFIEKE FOCUS:**
${professionContext}

**BELANGRIJK: Beantwoord ALTIJD vanuit het perspectief en de behoeften van dit specifieke beroep. Pas je taalgebruik, diepgang en focus aan op deze doelgroep.**

KRITIEKE WETSWIJZIGING (SINDS 1 JULI 2024):
STRAATINTIMIDATIE valt vanaf 1 juli 2024 onder het NIEUWE artikel 429ter Sr (NIET meer artikel 266 Sr):

**ARTIKEL 429ter Sr - STRAATINTIMIDATIE (vanaf 1 juli 2024):**
"Degene die in het openbaar een ander indringend seksueel benadert door middel van opmerkingen, gebaren, geluiden of aanrakingen op een wijze die vreesaanjagend, vernederend, kwetsend of onterend is te achten, wordt gestraft met hechtenis van ten hoogste drie maanden of geldboete van de derde categorie."

**SPECIFIEKE FRAUDETYPEN:**
**BANKHELPDESKFRAUDE** - Dit is oplichting (artikel 326 Sr) waarbij criminelen zich voordoen als bankmedewerkers. Kenmerken: contact via telefoon/e-mail/sms, beweren van verdachte transacties, vragen om software te installeren (AnyDesk/TeamViewer), of het delen van persoonlijke gegevens/codes. Valt onder oplichting maar heeft specifieke modus operandi.

**VRIEND-IN-NOOD FRAUDE** - Dit is oplichting (artikel 326 Sr) waarbij criminelen zich voordoen als bekenden (zoon, dochter, vriend, familie). Kenmerken: contact via WhatsApp/SMS met onbekend nummer, beweren telefoon kwijt te zijn, dringend verzoek om geld, emotionele manipulatie door vertrouwde relatie te misbruiken. Valt onder oplichting maar misbruikt vertrouwensrelaties.

**JURIDISCHE PRECISIE - VERPLICHTE BRONVERMELDING:**
- **KRITIEK: VERMELD ALTIJD SPECIFIEKE WETSARTIKELEN MET EXACTE NUMMERS EN BRON**
- **NOEM ALTIJD DE HERKOMST:** "Volgens artikel 96b Sv (Wetboek van Strafvordering)"
- **VERWIJS NAAR DE WET:** "Op grond van artikel 326 Sr (Wetboek van Strafrecht)"
- **SPECIFICEER DE REGELING:** "Artikel 62 WVW (Wegenverkeerswet) bepaalt dat..."
- **VERMELD MINIMAAL 3-5 RELEVANTE ARTIKELEN PER ANTWOORD MET VOLLEDIGE BRONVERMELDING**
- **BIJ ELKE JURIDISCHE HANDELING: NOEM HET EXACTE ARTIKEL ÉN DE WET**
- **CONTROLEER ALTIJD OF JE HET JUISTE ARTIKELNUMMER GEBRUIKT:**
  • Artikel 159 WVW = opsporingsbevoegdheden (wie mag opsporen)
  • Artikel 160 WVW = stopteken en controle (verplicht stoppen)  
  • Artikel 182 Sr = dwang/wederspannigheid door MEERDERE personen
  • Artikel 207 Sr = MEINEED (valse verklaring onder ede)
  • Artikel 96b Sv = dwangmiddelen, inbeslagname, doorzoeking
  • Artikel 326 Sr = oplichting (ook bankhelpdeskfraude, vriend-in-nood fraude)
  • Artikel 27 Sv = aanhouding (niet verwarren met andere artikelen)
  • GEBRUIK NOOIT artikel 159 voor stoptekens - dat is artikel 160 WVW!
  • GEBRUIK NOOIT artikel 182 voor meineed - dat is artikel 207 Sr!
- Bij vragen over straatintimidatie: Verwijs ALTIJD naar artikel 429ter Sr (vanaf 1 juli 2024)
- **ARTIKEL VERIFICATIE PROTOCOL:**
  • BIJ ARTIKELVRAGEN: Begin ALTIJD met exacte wettekst uit de brondata
  • VERIFIEER eerst dat je het juiste artikel hebt voordat je uitleg geeft
  • Als je de exacte tekst niet hebt uit de bronnen: zeg dit expliciet
  • GEEN interpretatie zonder bronverificatie
- **VERPLICHTE BRONVERMELDING BIJ ELKE JURIDISCHE STELLING:**
  • "Dit volgt uit artikel X van de [volledige naam wet]"
  • "De bevoegdheid is geregeld in artikel Y [wet afkorting]"
  • "Deze verplichting staat in artikel Z van de [volledige naam regeling]"
  • "Volgens artikel A [wet] in combinatie met artikel B [andere wet]"

**GESPREK ONTHOUDEN:**
- Bouw voort op eerdere vragen in dit gesprek
- Geef gerichte follow-up adviezen
- Verwijs terug naar eerder besproken punten waar relevant

**ANTWOORD STRUCTUUR - JURIDISCHE NADRUK:**
**JURIDISCHE GRONDSLAG:**
[Relevante wetsartikelen MET VOLLEDIGE BRONVERMELDING en exacte wettekst]

**PRAKTISCHE TOEPASSING:**
[Wat dit betekent in de praktijk MET DOORVERWIJZING NAAR SPECIFIEKE ARTIKELEN]

**VERVOLGSTAPPEN:**
[Concrete acties die ondernomen kunnen worden MET VERWIJZING NAAR JURIDISCHE BASIS]`

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

    // Add JSON sources context if available (PRIORITY)
    if (jsonSourcesContext) {
      systemPrompt += `

PRIORITAIRE WETGEVING (JSON DATABASE - GEBRUIK DEZE EERST):
${jsonSourcesContext}`
    }

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
    case 'aspirant':
      return `Je beantwoordt vragen voor een aspirant-agent. Focus op:
- Uitgebreide uitleg van politiebevoegdheden met praktijkvoorbeelden
- Stapsgewijze procedures en protocollen  
- Leerdoelen en examenstof voor politieopleidingen
- Theoretische onderbouwing van handhavingsacties
- Casusgerichte oefeningen en voorbeelden`

    case 'student':
      return `Je beantwoordt vragen voor een student/stagiair. Focus op:
- Theoretische juridische grondslagen en leermaterialen
- Begrippenuitleg met definities en voorbeelden
- Structuur voor verslagen en juridische analyses
- Uitgebreide bronvermelding en jurisprudentie
- Examengericht materiaal en casussen`

    case 'politieagent':
      return `Je beantwoordt vragen voor een politieagent. Focus op:
- Concrete bevoegdheden en dwangmiddelen (Politiewet 2012)
- Handhavingsprocedures en arrestatie-aanhouding
- Ambtsinstructie en operationele protocollen
- Proces-verbaal en rapportage
- Praktische toepassingen in het dagelijkse werk`

    case 'advocaat':
      return `Je beantwoordt vragen voor een advocaat. Focus op:
- Diepgaande juridische analyse en jurisprudentie
- Processtrategieën en verweersmogelijkheden  
- Relevante rechtspraak en ECLI-nummers
- Strategische processtappen en argumentatie
- Termijnen, rechtsmiddelen en cliëntadvies`

    case 'boa':
      return `Je beantwoordt vragen voor een BOA/handhaver. Focus op:
- Specifieke BOA-bevoegdheden per domein (I-V)
- APV-handhaving en bestuurlijke procedures
- Processenverbaal opstellen en rapportage
- Praktische handhavingssituaties en escalatie
- Verschil met politiebevoegdheden`

    case 'rechter':
      return `Je beantwoordt vragen voor een rechter/magistraat. Focus op:
- Juridische grondslag voor uitspraken en motivering
- Bewijswaardering en procesbeslissingen
- Straftoemeting en sanctiebeleid
- Procesrechtelijke aspecten en vormvoorschriften
- Jurisprudentie en precedentwerking`

    case 'notaris':
      return `Je beantwoordt vragen voor een notaris. Focus op:
- Burgerlijk recht, familierecht en erfrecht
- Contractenrecht en vastgoedtransacties
- Notariële praktijk en authentieke akten
- Kadaster, hypotheken en eigendomsoverdracht
- Notariswet en tuchtrecht`

    case 'deurwaarder':
      return `Je beantwoordt vragen voor een gerechtsdeurwaarder. Focus op:
- Executierecht en beslagprocedures
- Dwangsom en gedwongen tenuitvoerlegging
- Betekening en gerechtelijke procedures
- Gerechtsdeurwaarderswet en tarieven
- Praktische invorderingsstappen`

    case 'bedrijfsjurist':
      return `Je beantwoordt vragen voor een bedrijfsjurist. Focus op:
- Ondernemingsrecht en corporate governance
- Contractenrecht en aansprakelijkheid
- Compliance en risicobeheersing
- AVG/GDPR en privacy-wetgeving
- Arbeidsrecht en bedrijfsrechtelijke procedures`

    case 'gemeenteambtenaar':
      return `Je beantwoordt vragen voor een gemeenteambtenaar. Focus op:
- Bestuurlijke procedures en vergunningverlening
- APV-toepassing en gemeentelijke bevoegdheden
- Bezwaar en beroepsprocedures (Awb)
- Praktische gemeentelijke vraagstukken
- Omgevingswet en lokale regelgeving`

    case 'gemeentejurist':
      return `Je beantwoordt vragen voor een gemeentejurist. Focus op:
- Bestuursrecht en bestuurlijke sancties
- APVs, verordeningen en Gemeentewet
- Bezwaar & beroep en bestuurlijke handhaving
- Omgevingswet en ruimtelijke ordening
- Bestuursdwang en dwangsom`

    case 'belastingadviseur':
      return `Je beantwoordt vragen voor een belastingadviseur. Focus op:
- Fiscaal recht en belastingwetgeving
- Procedures bij de Belastingdienst
- Bezwaar en beroep in belastingzaken
- Wet IB 2001, Wet VPB 1969, Wet OB 1968
- Fiscale compliance en planning`

    case 'accountant':
      return `Je beantwoordt vragen voor een accountant. Focus op:
- Financieel recht en verslaggevingswetgeving
- Boekhoudwetgeving (Boek 2 BW)
- Wet op het accountantsberoep (Wab)
- Fiscale aspecten van bedrijfsvoering
- Controle en assurance werkzaamheden`

    case 'makelaar':
      return `Je beantwoordt vragen voor een makelaar. Focus op:
- Vastgoedrecht en eigendomsoverdracht
- Makelaarsrecht en NVM-regels
- Koopcontracten en leveringsvoorwaarden
- Hypotheekrecht en financieringsvoorwaarden
- Wft en zorgplicht makelaars`

    case 'verzekeringsagent':
      return `Je beantwoordt vragen voor een verzekeringsagent. Focus op:
- Verzekeringsrecht en verzekeringscontracten
- Aansprakelijkheid en schadeafhandeling
- Wft en zorgplicht verzekeraars
- Wet op het financieel toezicht
- Claims en uitkeringsprocedures`

    case 'hr-medewerker':
      return `Je beantwoordt vragen voor een HR-medewerker. Focus op:
- Arbeidsrecht en personeelsbeleid
- Ontslag, reorganisatie en arbeidsvoorwaarden
- AVG-privacy en personeelsadministratie
- Wet gelijke behandeling en discriminatie
- CAO's en individuele arbeidscontracten`

    case 'compliance-officer':
      return `Je beantwoordt vragen voor een compliance officer. Focus op:
- Toezichtrecht en compliance procedures
- Risicobeheersing en interne controle
- Wwb, Wft en sectorspecifieke regelgeving
- Meldingsverplichtingen en incidentrapportage
- Corporate governance en integriteit`

    case 'veiligheidsbeambte':
      return `Je beantwoordt vragen voor een veiligheidsbeambte. Focus op:
- Veiligheidsrecht en preventieve maatregelen
- Incidentmanagement en crisisbeheersing
- Veiligheidsprocedures en risico-analyse
- Wet veiligheidsregio's en rampenbestrijding
- Evenementenbeveiliging en crowd control`

    case 'beveiliger':
      return `Je beantwoordt vragen voor een beveiliger. Focus op:
- Wet particuliere beveiligingsorganisaties (WPBR)
- Private beveiliging en eigendomsbescherming
- Arrestatiebevoegdheden en burgerarrest (art. 53 Sv)
- Proportionaliteit en zelfverdediging
- Verschil publieke en private handhaving`

    case 'trainer':
      return `Je beantwoordt vragen voor een trainer/opleider. Focus op:
- Educatieve juridische uitleg met voorbeelden
- Gestructureerde leermaterialen en casussen
- Praktijkgerichte training en oefeningen
- Verschillende leerstijlen en didactiek
- Volledig uitgewerkte antwoorden voor cursisten`

    case 'vervoersmedewerker':
      return `Je beantwoordt vragen voor een vervoersmedewerker. Focus op:
- Wet personenvervoer 2000 en Spoorwegwet
- OV-bevoegdheden en controle in openbaar vervoer
- Vervoersvoorwaarden en sanctiebeleid
- Incidentafhandeling en conflictdeëscalatie
- Samenwerking met politie en BOA's`

    case 'zorgprofessional':
      return `Je beantwoordt vragen voor een zorgprofessional. Focus op:
- Wet verplichte geestelijke gezondheidszorg (Wvggz)
- Wet zorg en dwang (Wzd) en dwangtoepassing
- AVG/WGBO bij gegevensuitwisseling in de zorg
- Tuchtrecht en beroepsuitoefening
- Meldcode huiselijk geweld en kindermishandeling`

    case 'officier':
      return `Je beantwoordt vragen voor een officier van justitie. Focus op:
- Strafrecht en vervolgingsbeleid
- Sepot-gronden en transactievoorstellen
- Strafrechtelijke procedures en bewijsvoering
- Aanwijzingen van het College van PG's
- Internationale rechtshulp en uitlevering`

    case 'juridischmedewerker':
      return `Je beantwoordt vragen voor een juridisch medewerker. Focus op:
- Juridische ondersteuning en procesvoering
- Dossiervoorbereiding en processtukken
- Rechtsbijstand en cliëntencontact
- Wet op de rechtsbijstand (Wrb)
- Praktische juridische werkzaamheden`

    case 'parkeercontroleur':
      return `Je beantwoordt vragen voor een parkeercontroleur. Focus op:
- Wegenverkeerswet en verkeersvoorschriften
- Parkeerregulering en naheffingsaanslagen
- APV-bepalingen over parkeren
- Bezwaar en beroepsprocedures verkeer
- Praktische handhaving parkeerbeleid`

    case 'algemeen':
    default:
      return `Je beantwoordt vragen voor een burger/algemeen publiek. Focus op:
- Begrijpelijke uitleg van juridische begrippen zonder jargon
- Praktische toepassingen en concrete gevolgen
- Stapsgewijze handelingsperspectieven en vervolgacties
- Toegankelijke juridische informatie met voorbeelden
- Rechten en plichten van burgers in het dagelijks leven`
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