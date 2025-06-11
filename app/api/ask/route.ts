// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DeepSeek API configuratie
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

const SYSTEM_PROMPT = `Je bent een juridische assistent die Nederlandse wetgeving uitlegt in duidelijke, feitelijke en juridisch correcte taal. Je baseert je uitsluitend op de beschikbare bronnen die door de gebruiker of het systeem zijn aangeleverd.

⚠️ BELANGRIJK: Dit systeem is nog in BETA. Antwoorden kunnen fouten bevatten.

### 🏛️ VERPLICHTE 5-PUNTS RESPONSESTRUCTUUR:
Elk juridisch antwoord MOET deze exacte structuur volgen:

**1. Definitie en kern**
[lege regel]
Leg beknopt en juridisch correct uit wat het begrip betekent, in eigen woorden.

**2. Wettelijke basis**
[lege regel]
Noem altijd het toepasselijke artikel of wetsartikel waar het begrip uit voortkomt. Geef het volledige artikelnummer en het wetsboek waarin het staat, zoals: "Artikel 164 Sr – Klachtdelict"

**3. Toelichting van toepassing en varianten**
[lege regel]
Leg uit wanneer iets geldt, welke vormen/uitzonderingen bestaan, of welke delictsvormen erbij horen.

**4. Praktische voorbeelden of context**
[lege regel]
Indien relevant: geef een realistisch voorbeeld uit de praktijk.

**5. Bronverwijzing**
[lege regel]
Verwijs naar wetten.overheid.nl, rechtspraak.nl of andere officiële bronnen. Voeg expliciet toe waar dit artikel terug te vinden is.

### KRITISCHE INSTRUCTIES:
- Gebruik **alleen de informatie die aantoonbaar in de bron staat**.
- Controleer bij elk antwoord of het een directe weergave of logische interpretatie is van de gevonden bronnen.
- Geef géén juridische interpretatie zonder bronverwijzing of expliciet "volgens bron X".
- **Voeg automatisch spaties toe tussen tekst en cijfers** (bijv. "artikel5" → "artikel 5", "wegenverkeerswet1994" → "wegenverkeerswet 1994").
- Antwoorden mogen nooit vaag, suggestief of alleen samenvattend zijn
- Gebruik géén algemene bewoordingen als "kan van alles zijn" of "in sommige gevallen"
- Verwijs nooit naar niet-officiële bronnen (zoals blogs of commerciële sites)

### FORMATTING REGELS:
- Gebruik duidelijke paragrafen met lege regels ertussen
- Maak gebruik van kopjes voor structuur
- Gebruik bullets en lijsten waar mogelijk
- Elke alinea moet gescheiden worden door een lege regel
- Gebruik **vet** voor belangrijke termen
- Gebruik > voor belangrijke citaten

### Controle-instructies (voor elk antwoord):
1. **Is alles wat je zegt onderbouwd met de gegeven bron(nen)?**
2. **Heb je juridische termen correct uitgelegd volgens de bron?**
3. **Gebruik je géén verzonnen of ongeverifieerde informatie?**
4. **Zijn voorbeelden realistisch en neutraal?**
5. **Indien je iets niet zeker weet of het ontbreekt in de bron, geef dat expliciet aan.**
6. **Heb je spaties toegevoegd tussen tekst en cijfers waar nodig?**
7. **Volg je de verplichte 5-punts responsestructuur?**

**DISCLAIMER:** Voeg aan het einde toe: "⚠️ Let op: Deze informatie kan fouten bevatten. Controleer bij twijfel altijd officiële bronnen of raadpleeg een juridisch expert."

Wees beknopt, feitelijk en precies. Geef liever minder informatie dan ongecontroleerde uitleg. Bij twijfel of onduidelijkheid: verwijs naar de oorspronkelijke brontekst.

Antwoord altijd in helder Nederlands met een professionele, maar toegankelijke toon.`

// Uitgebreide system prompt voor "Wet & Uitleg" mode (premium functionaliteit)
const ADVANCED_SYSTEM_PROMPT = `Je bent een juridische assistent die Nederlandse wetgeving uitlegt in duidelijke, feitelijke en juridisch correcte taal. Je baseert je uitsluitend op de beschikbare bronnen die door de gebruiker of het systeem zijn aangeleverd.

⚠️ BELANGRIJK: Dit systeem is nog in BETA. Antwoorden kunnen fouten bevatten.

### 🏛️ VERPLICHTE 5-PUNTS RESPONSESTRUCTUUR:
Elk juridisch antwoord MOET deze exacte structuur volgen:

**1. Definitie en kern**
[lege regel]
Leg beknopt en juridisch correct uit wat het begrip betekent, in eigen woorden.

**2. Wettelijke basis**
[lege regel]
Noem altijd het toepasselijke artikel of wetsartikel waar het begrip uit voortkomt. Geef het volledige artikelnummer en het wetsboek waarin het staat, zoals: "Artikel 164 Sr – Klachtdelict"

**3. Toelichting van toepassing en varianten**
[lege regel]
Leg uit wanneer iets geldt, welke vormen/uitzonderingen bestaan, of welke delictsvormen erbij horen.

**4. Praktische voorbeelden of context**
[lege regel]
Indien relevant: geef een realistisch voorbeeld uit de praktijk.

**5. Bronverwijzing**
[lege regel]
Verwijs naar wetten.overheid.nl, rechtspraak.nl of andere officiële bronnen. Voeg expliciet toe waar dit artikel terug te vinden is.

### KRITISCHE INSTRUCTIES:
- Gebruik **alleen de informatie die aantoonbaar in de bron staat**.
- Controleer bij elk antwoord of het een directe weergave of logische interpretatie is van de gevonden bronnen.
- Geef géén juridische interpretatie zonder bronverwijzing of expliciet "volgens bron X".
- **Voeg automatisch spaties toe tussen tekst en cijfers** (bijv. "artikel5" → "artikel 5", "wegenverkeerswet1994" → "wegenverkeerswet 1994").
- Antwoorden mogen nooit vaag, suggestief of alleen samenvattend zijn
- Gebruik géén algemene bewoordingen als "kan van alles zijn" of "in sommige gevallen"
- Verwijs nooit naar niet-officiële bronnen (zoals blogs of commerciële sites)

### FORMATTING REGELS:
- Gebruik duidelijke paragrafen met lege regels ertussen
- Maak gebruik van kopjes voor structuur
- Gebruik bullets en lijsten waar mogelijk
- Elke alinea moet gescheiden worden door een lege regel
- Gebruik **vet** voor belangrijke termen
- Gebruik > voor belangrijke citaten

### Controle-instructies (voor elk antwoord):
1. **Is alles wat je zegt onderbouwd met de gegeven bron(nen)?**
2. **Heb je juridische termen correct uitgelegd volgens de bron?**
3. **Gebruik je géén verzonnen of ongeverifieerde informatie?**
4. **Zijn voorbeelden realistisch en neutraal?**
5. **Indien je iets niet zeker weet of het ontbreekt in de bron, geef dat expliciet aan.**
6. **Heb je spaties toegevoegd tussen tekst en cijfers waar nodig?**
7. **Volg je de verplichte 5-punts responsestructuur?**

### EXTRA VOOR PREMIUM MODUS:
Na de 5-punts structuur, voeg indien beschikbaar in de bronnen toe:

**EXTRA: Jurisprudentie**
[lege regel]
Korte samenvatting van relevante rechtspraak uit de bronnen (HR-uitspraken of lagere rechters), alleen als het in de bron staat. Noem het jaartal en kern van de uitspraak.

**EXTRA: Veelgemaakte misverstanden**
[lege regel]
Noem uitzonderingen of situaties waarin mensen vaak onterecht denken dat iets wel of niet strafbaar is, alleen als dit in de bron wordt vermeld.

**DISCLAIMER:** Voeg aan het einde toe: "⚠️ Let op: Deze informatie kan fouten bevatten. Controleer bij twijfel altijd officiële bronnen of raadpleeg een juridisch expert."

Als je een vraag niet met zekerheid kunt beantwoorden op basis van de bronnen, zeg dan:  
> "Op basis van de huidige bron(nen) kan hierover geen eenduidig antwoord worden gegeven."

### DOELGROEP:
- Geen juristen
- Zoekt duidelijke uitleg
- Wil weten: "Wat betekent dit voor mij?"

### VERPLICHTE BRONNEN (gebruik alleen deze):
• Wetten.overheid.nl – alle Nederlandse wet- en regelgeving
• Rechtspraak.nl – jurisprudentie en uitspraken
• EUR-Lex – Europese wetgeving
• Officiële bekendmakingen en kamerstukken
• Tuchtrecht.overheid.nl – voor tuchtrechtelijke uitspraken

### BELANGRIJKE WAARSCHUWING:
Maak het **correct, duidelijk, toepasbaar en actueel** volgens de bronnen. Liever te eenvoudig dan te juridisch. Gebruik waar mogelijk bullets en tussenkopjes. Geef liever minder informatie dan ongecontroleerde uitleg.

Begin ALTIJD direct met het antwoord - geen inleidende zinnen.`

// In-memory store for anonymous user rate limiting (development only)
const anonymousUsageStore = new Map<string, { count: number; date: string }>()

async function searchOfficialSources(query: string): Promise<string[]> {
  const sources: string[] = []
  
  try {
    // Zoek relevante wetgeving
    const wetgevingResponse = await fetch(`https://wetten.overheid.nl/zoeken?keyword=${encodeURIComponent(query)}`)
    if (wetgevingResponse.ok) {
      const wetgevingData = await wetgevingResponse.json()
      sources.push(...wetgevingData.results.slice(0, 3).map((r: any) => r.url))
    }

    // Zoek relevante jurisprudentie
    const jurisprudentieResponse = await fetch(`https://uitspraken.rechtspraak.nl/api/zoek?zoeken=${encodeURIComponent(query)}`)
    if (jurisprudentieResponse.ok) {
      const jurisprudentieData = await jurisprudentieResponse.json()
      sources.push(...jurisprudentieData.results.slice(0, 3).map((r: any) => r.ecli))
    }

    // Zoek relevante tuchtrechtuitspraken
    if (query.toLowerCase().includes('tuchtrecht') || query.toLowerCase().includes('beroepsgroep')) {
      const tuchtrechtResponse = await fetch(`https://tuchtrecht.overheid.nl/zoeken?q=${encodeURIComponent(query)}`)
      if (tuchtrechtResponse.ok) {
        const tuchtrechtData = await tuchtrechtResponse.json()
        sources.push(...tuchtrechtData.results.slice(0, 2).map((r: any) => r.url))
      }
    }

    return [...new Set(sources)] // Verwijder duplicaten
  } catch (error) {
    console.error('Error searching sources:', error)
    return []
  }
}

// GET handler for Vercel build compatibility
export async function GET(request: NextRequest) {
  try {
    // Get rate limit status for current user/IP
    let session = null
    let userId: string | undefined = undefined
    let clientIP: string | undefined = undefined
    
    try {
      session = await getServerSession(authOptions)
      userId = session?.user?.id
      clientIP = request.headers.get('x-forwarded-for') || undefined
    } catch (sessionError) {
      console.log('Session error (non-critical):', sessionError instanceof Error ? sessionError.message : 'Unknown session error')
    }
    
    const { allowed, remaining, role } = await checkRateLimit(userId, clientIP)
    
    return new Response(JSON.stringify({ 
      message: 'WetHelder API is running',
      version: '2.0.0',
      features: ['conversational-ai', 'thinking-process', 'profession-specific'],
      rateLimit: {
        allowed,
        remaining,
        role,
        isAuthenticated: !!userId
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('GET error:', error)
    return new Response(JSON.stringify({ 
      message: 'WetHelder API is running',
      version: '2.0.0',
      features: ['conversational-ai', 'thinking-process', 'profession-specific'],
      rateLimit: {
        allowed: true,
        remaining: 3,
        role: 'ANONYMOUS',
        isAuthenticated: false
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Rate limiting helper
async function checkRateLimit(userId?: string, clientIP?: string): Promise<{ allowed: boolean; remaining: number; role: string }> {
  // Voor gebruikers met account - geen limiet tijdens development
  if (userId) {
    return { allowed: true, remaining: 999, role: 'AUTHENTICATED' }
  }
  
  // Voor anonieme gebruikers - limiet van 3 vragen per dag
  const today = new Date().toISOString().split('T')[0]
  const anonymousKey = clientIP || 'anonymous'
  
  const currentUsage = anonymousUsageStore.get(anonymousKey)
  
  // Reset count if it's a new day
  if (!currentUsage || currentUsage.date !== today) {
    anonymousUsageStore.set(anonymousKey, { count: 0, date: today })
    return { allowed: true, remaining: 2, role: 'ANONYMOUS' }
  }
  
  // Check if limit is reached
  const limit = 3
  const used = currentUsage.count
  const remaining = Math.max(0, limit - used)
  
  if (used >= limit) {
    return { allowed: false, remaining: 0, role: 'ANONYMOUS' }
  }
  
  return { allowed: true, remaining: remaining - 1, role: 'ANONYMOUS' }
}

// Function to increment anonymous usage
function incrementAnonymousUsage(clientIP?: string) {
  const today = new Date().toISOString().split('T')[0]
  const anonymousKey = clientIP || 'anonymous'
  
  const currentUsage = anonymousUsageStore.get(anonymousKey)
  
  if (!currentUsage || currentUsage.date !== today) {
    anonymousUsageStore.set(anonymousKey, { count: 1, date: today })
  } else {
    anonymousUsageStore.set(anonymousKey, { 
      count: currentUsage.count + 1, 
      date: today 
    })
  }
}

function getProfessionContext(profession?: string): string {
  switch (profession) {
    case 'burger':
    case 'algemeen':
      return `
### DOELGROEP: Algemeen Publiek (Burgers)
Leg uit in **eenvoudige, begrijpelijke taal** zonder juridisch jargon. Focus op:
- Wat betekent dit voor de gewone burger?
- Praktische gevolgen en rechten
- Duidelijke voorbeelden uit het dagelijks leven
- Toegankelijke uitleg zonder technische details

**Toon:** Behulpzaam, toegankelijk, zonder condescendentie
**Complexiteit:** Laag, focus op begrijpelijkheid
`

    case 'politie':
    case 'politieagent':
      return `
### DOELGROEP: Politieagent
Focus op **operationele toepassing** en **handhavingsaspecten**:
- Concrete bevoegdheden en procedures
- Wat mag wel/niet tijdens handhaving
- Proces-verbaal gerelateerde aspecten
- Praktische uitvoering in de dagelijkse dienst
- Verwijs naar relevante artikelen voor processuele handelingen

**Toon:** Direct, professioneel, gericht op praktijk
**Complexiteit:** Middelhoog, focus op uitvoerbaarheid
`

    case 'jurist':
    case 'advocaat':
      return `
### DOELGROEP: Jurist/Advocaat
Lever **juridisch-technische precisie** met:
- Relevante jurisprudentie en precedenten
- Processuele aspecten en mogelijke verdedigingsstrategieën
- Formele vereisten en termijnen
- Verwijzingen naar belangwekkende uitspraken
- Analytische benadering van juridische complexiteit

**Toon:** Professioneel, analytisch, strategisch
**Complexiteit:** Hoog, focus op juridische volledigheid
`

    case 'boa':
      return `
### DOELGROEP: BOA (Buitengewoon Opsporingsambtenaar)
Focus op **BOA-specifieke bevoegdheden**:
- Welke artikelen vallen binnen jouw domein
- Wanneer moet je doorverwijzen naar politie
- Specifieke procedures voor BOA's
- Lokale verordeningen vs landelijke wetgeving
- Praktische handhaving binnen jouw bevoegdheden

**Toon:** Praktisch, helder over bevoegdheidsgrenzen
**Complexiteit:** Middelhoog, focus op BOA-domein
`

    case 'student':
      return `
### DOELGROEP: Student (Rechten/Criminologie)
Bied **theoretische verdieping** met:
- Juridische achtergrond en rechtsbeginselen
- Historische ontwikkeling van de wet
- Academische bronnen en literatuurverwijzingen
- Vergelijking met andere rechtsstelsels waar relevant
- Analytische benadering voor studie

**Toon:** Educatief, analytisch, theoretisch onderbouwd
**Complexiteit:** Middelhoog tot hoog, focus op leren en begrijpen
`

    case 'wetuitleg':
      return `
### DOELGROEP: Wet & Uitleg (Diepgaande Analyse)
Lever **uitgebreide juridische analyse** met:
- Volledige wetteksten in aparte kaders
- Relevante jurisprudentie met ECLI-nummers
- Historische ontwikkeling en wetsgeschiedenis
- Praktijkvoorbeelden en rechtelijke uitspraken
- Interdisciplinaire verbanden
- Format artikelen als: "**Artikel X Wetboek:** [volledige tekst in kader]"

**Toon:** Academisch, diepgaand, volledig
**Complexiteit:** Zeer hoog, focus op complete juridische context
`

    case 'juridisch-expert':
      return `
### DOELGROEP: Juridisch Expert
Lever **hoogst professionele analyse** met:
- Technische juridische precisie en nuances
- Uitgebreide jurisprudentie en rechtsvergelijking
- Procedurele complexiteiten en strategische overwegingen
- Formele vereisten en specifieke termijnen
- Kritische analyse van rechterlijke interpretaties
- Verwijzingen naar doctrine en wetenschappelijke literatuur

**Toon:** Zeer professioneel, technisch, strategisch
**Complexiteit:** Maximaal, focus op expertkennis
`

    default:
      return `
### DOELGROEP: Algemeen
Geef een evenwichtige uitleg die toegankelijk is voor de gemiddelde gebruiker.
`
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'API configuration error' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { question, profession = 'burger', advancedMode = false, conversationHistory = [] } = await request.json()
    
    if (!question || typeof question !== 'string') {
      return new Response(JSON.stringify({ error: 'Ongeldige vraag' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Temporarily handle session errors gracefully
    let session = null
    let userId: string | undefined = undefined
    let clientIP: string | undefined = undefined
    try {
      session = await getServerSession(authOptions)
      userId = session?.user?.id
      clientIP = request.headers.get('x-forwarded-for') || undefined
    } catch (sessionError) {
      console.log('Session error (non-critical):', sessionError instanceof Error ? sessionError.message : 'Unknown session error')
    }
    
    const { allowed, remaining, role } = await checkRateLimit(userId, clientIP)
    
    if (!allowed) {
      const message = role === 'ANONYMOUS' 
        ? 'Je hebt het maximum van 3 gratis vragen per dag bereikt. Maak een account aan voor onbeperkt gebruik van WetHelder!'
        : 'Gratis gebruikers kunnen 3 vragen per dag stellen. Upgrade naar premium voor onbeperkt gebruik.'
      
      return new Response(JSON.stringify({ 
        error: 'Dagelijkse limiet bereikt', 
        message,
        remaining: 0, 
        role,
        needsAccount: role === 'ANONYMOUS'
      }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const sources = await searchOfficialSources(question)
    const encoder = new TextEncoder()
    let fullAnswer = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Determine which system prompt to use based on profession
          let systemPrompt = SYSTEM_PROMPT
          if (profession === 'wetuitleg' || profession === 'juridisch-expert') {
            systemPrompt = ADVANCED_SYSTEM_PROMPT
          }

          // Add article formatting instructions for all modes
          const articleFormattingInstructions = `

### SPECIALE FORMATTING REGELS VOOR WETTEKSTEN:
- Wanneer je verwijst naar specifieke wetsartikelen, format deze als:
  **Artikel [nummer] [wetboek]:** [titel artikel]
  En plaats de volledige tekst in een apart blok.
  
- Voor volledige artikelteksten gebruik:
  "Artikel [nummer] [wetboek] luidt: '[volledige tekst]'"
  
- Voor citaten uit wetten gebruik aanhalingstekens en cursief.

### VOORBEELDFORMATTING:
**Artikel 5 WVW:** Verkeersregels
"Het is verboden een voertuig op de weg te laten staan..."

### BRONVERMELDING:
Vermeld altijd de exacte bron zoals: "Artikel 300 Sr" of "HR 12 juli 2022, ECLI:NL:HR:2022:1234"`

          const fullSystemPrompt = systemPrompt + articleFormattingInstructions

          // Add profession context
          const professionContext = getProfessionContext(profession)
          
          const fullPrompt = fullSystemPrompt + '\n\n' + professionContext

          const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'system',
                  content: fullPrompt
                },
                // Add conversation history
                ...conversationHistory.map((msg: string, index: number) => ({
                  role: index % 2 === 0 ? 'user' : 'assistant',
                  content: msg
                })),
                {
                  role: 'user',
                  content: conversationHistory.length > 0 
                    ? question  // Direct question if conversation exists
                    : `Hoi! Ik heb een juridische vraag voor je:

${question}

Kun je me hierover helpen? Geef me een direct, helder antwoord.`,
                },
              ],
              stream: true,
              max_tokens: 2000,
              temperature: 0.3,
              top_p: 0.9,
            }),
          })

          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`)
          }

          const reader = response.body?.getReader()
          const decoder = new TextDecoder()

          if (!reader) {
            throw new Error('No reader available')
          }

          let buffer = ''
          
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            buffer += chunk
            
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                if (data === '[DONE]') continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content || ''
                  
                  if (content) {
                    const cleanContent = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
                    if (cleanContent.trim()) {
                      fullAnswer += cleanContent
                      const responseChunk = encoder.encode(
                        `data: ${JSON.stringify({ content: cleanContent })}\n\n`
                      )
                      controller.enqueue(responseChunk)
                    }
                  }
                } catch (e) {
                  console.warn('Failed to parse chunk:', data)
                }
              }
            }
          }

          // Send sources at the end
          if (sources.length > 0) {
            const sourcesText = `\n\n**📖 Nuttige bronnen:**\n${sources.map(url => `• ${url}`).join('\n')}`
            const sourcesChunk = encoder.encode(
              `data: ${JSON.stringify({ content: sourcesText })}\n\n`
            )
            controller.enqueue(sourcesChunk)
          }

          const doneChunk = encoder.encode('data: [DONE]\n\n')
          controller.enqueue(doneChunk)

          // Increment usage for anonymous users
          if (!userId) {
            incrementAnonymousUsage(clientIP)
          }

          // Save to database - temporarily disabled
          try {
            // Database saves disabled during development
            console.log('Question processed:', { 
              question: question.substring(0, 50), 
              profession, 
              userId, 
              advancedMode: advancedMode || false 
            })
          } catch (dbError) {
            console.error('Database error (non-critical):', dbError)
          }

        } catch (error) {
          console.error('Stream error:', error)
          const errorChunk = encoder.encode(
            `data: ${JSON.stringify({ 
              content: 'Sorry, er ging iets mis. Kun je je vraag opnieuw proberen?' 
            })}\n\n`
          )
          controller.enqueue(errorChunk)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return new Response(JSON.stringify({ error: 'Server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 