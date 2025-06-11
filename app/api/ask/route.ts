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

### KERNPRINCIPES:
- Geef **natuurlijke, begrijpelijke antwoorden** zonder geforceerde structuren
- Gebruik **alleen informatie uit de aangeleverde bronnen**
- Wees **betrouwbaar en precies** in juridische uitleg
- Verwijs **altijd naar relevante wetsartikelen** wanneer van toepassing
- Geef **praktische context** waar mogelijk

### ANTWOORDSTIJL:
Beantwoord vragen op een natuurlijke manier, alsof je een ervaren juridisch adviseur bent die iemand helpt. Begin direct met het beantwoorden van de vraag.

**Voor juridische onderwerpen:**
- Noem altijd relevante wetsartikelen (bijv. "Dit valt onder artikel 300 Wetboek van Strafrecht")
- Leg uit wat het praktisch betekent
- Geef context over wanneer het van toepassing is
- Verwijs naar gerelateerde artikelen indien relevant

**Voor specifieke delicten of juridische begrippen:**
- Zoek automatisch naar gerelateerde artikelen (bijv. bij "huiselijk geweld" ook artikel 304 Sr meenemen)
- Leg het verschil uit tussen verschillende vormen
- Geef praktische voorbeelden waar gepast

### BELANGRIJKE INSTRUCTIES:
- **Voeg automatisch spaties toe tussen tekst en cijfers** (bijv. "artikel5" → "artikel 5")
- Gebruik **alleen officiële bronnen**: wetten.overheid.nl, rechtspraak.nl, EUR-Lex
- Bij onzekerheid: verwijs naar de oorspronkelijke brontekst
- Geef **geen juridisch advies**, alleen uitleg van wetgeving
- Gebruik duidelijke paragrafen met lege regels ertussen

### FORMATTING:
- Gebruik **vet** voor belangrijke termen en artikelnummers
- Gebruik > voor belangrijke citaten uit wetten
- Maak gebruik van bullets voor opsommingen
- Elke alinea gescheiden door een lege regel

### BRONVERWIJZING:
Eindig altijd met een korte bronverwijzing naar de relevante officiële bronnen.

**DISCLAIMER:** Voeg aan het einde toe: "⚠️ Let op: Deze informatie kan fouten bevatten. Controleer bij twijfel altijd officiële bronnen of raadpleeg een juridisch expert."

Antwoord altijd in helder Nederlands met een professionele, maar toegankelijke toon. Wees beknopt maar volledig.`

// Uitgebreide system prompt voor "Wet & Uitleg" mode (premium functionaliteit)
const ADVANCED_SYSTEM_PROMPT = `Je bent een juridische assistent die Nederlandse wetgeving uitlegt in duidelijke, feitelijke en juridisch correcte taal. Je baseert je uitsluitend op de beschikbare bronnen die door de gebruiker of het systeem zijn aangeleverd.

⚠️ BELANGRIJK: Dit systeem is nog in BETA. Antwoorden kunnen fouten bevatten.

### KERNPRINCIPES VOOR DIEPGAANDE ANALYSE:
- Geef **uitgebreide, natuurlijke antwoorden** met volledige juridische context
- Gebruik **alleen informatie uit de aangeleverde bronnen**
- Wees **zeer betrouwbaar en precies** in juridische uitleg
- Verwijs **altijd naar alle relevante wetsartikelen** en gerelateerde bepalingen
- Geef **uitgebreide praktische context** en jurisprudentie

### ANTWOORDSTIJL VOOR WET & UITLEG:
Beantwoord vragen uitgebreid en diepgaand, alsof je een senior juridisch adviseur bent die een volledige analyse geeft.

**Voor juridische onderwerpen:**
- Noem alle relevante wetsartikelen met volledige tekst waar mogelijk
- Leg de juridische geschiedenis en ontwikkeling uit
- Geef uitgebreide context over toepassing en interpretatie
- Verwijs naar alle gerelateerde artikelen en bepalingen
- Bespreek uitzonderingen en bijzondere gevallen

**Voor specifieke delicten of juridische begrippen:**
- Geef volledige wettekst van relevante artikelen
- Zoek naar alle gerelateerde artikelen (bijv. bij "huiselijk geweld" ook artikel 304 Sr, 300 Sr, 302 Sr)
- Leg verschillen uit tussen alle varianten en gradaties
- Geef uitgebreide praktijkvoorbeelden
- Bespreek jurisprudentie indien beschikbaar in bronnen

### EXTRA ELEMENTEN VOOR DIEPGAANDE ANALYSE:
**Jurisprudentie:** Indien beschikbaar in bronnen, bespreek relevante rechtspraak
**Praktijkvoorbeelden:** Geef meerdere realistische scenario's
**Gerelateerde bepalingen:** Verwijs naar aanverwante artikelen
**Procedurele aspecten:** Leg uit hoe het juridisch proces verloopt
**Veelgemaakte misverstanden:** Corrigeer veel voorkomende denkfouten

### BELANGRIJKE INSTRUCTIES:
- **Voeg automatisch spaties toe tussen tekst en cijfers** (bijv. "artikel5" → "artikel 5")
- Gebruik **alleen officiële bronnen**: wetten.overheid.nl, rechtspraak.nl, EUR-Lex
- Bij onzekerheid: verwijs naar de oorspronkelijke brontekst
- Geef **geen juridisch advies**, alleen uitleg van wetgeving
- Gebruik duidelijke paragrafen met lege regels ertussen

### FORMATTING:
- Gebruik **vet** voor belangrijke termen en artikelnummers
- Gebruik > voor belangrijke citaten uit wetten
- Maak gebruik van bullets voor opsommingen
- Gebruik kopjes voor structuur (## Hoofdkopje, ### Subkopje)
- Elke alinea gescheiden door een lege regel

### BRONVERWIJZING:
Eindig altijd met uitgebreide bronverwijzing naar alle relevante officiële bronnen.

**DISCLAIMER:** Voeg aan het einde toe: "⚠️ Let op: Deze informatie kan fouten bevatten. Controleer bij twijfel altijd officiële bronnen of raadpleeg een juridisch expert."

Antwoord altijd in helder Nederlands met een professionele, maar toegankelijke toon. Wees uitgebreid en volledig in je analyse.`

// In-memory store for anonymous user rate limiting (development only)
const anonymousUsageStore = new Map<string, { count: number; date: string }>()

async function searchOfficialSources(query: string): Promise<string[]> {
  const sources: string[] = []
  
  try {
    // Verbeterde zoekstrategie met gerelateerde termen
    const searchTerms = [query]
    
    // Voeg automatisch gerelateerde juridische termen toe
    const relatedTerms = getRelatedLegalTerms(query)
    searchTerms.push(...relatedTerms)
    
    // Zoek voor elke zoekterm
    for (const searchTerm of searchTerms.slice(0, 3)) { // Limiteer tot 3 termen
      // Zoek relevante wetgeving
      try {
        const wetgevingResponse = await fetch(`https://wetten.overheid.nl/zoeken?keyword=${encodeURIComponent(searchTerm)}`)
        if (wetgevingResponse.ok) {
          const wetgevingData = await wetgevingResponse.json()
          if (wetgevingData.results) {
            sources.push(...wetgevingData.results.slice(0, 2).map((r: any) => r.url))
          }
        }
      } catch (error) {
        console.error(`Error searching wetgeving for ${searchTerm}:`, error)
      }

      // Zoek relevante jurisprudentie
      try {
        const jurisprudentieResponse = await fetch(`https://uitspraken.rechtspraak.nl/api/zoek?zoeken=${encodeURIComponent(searchTerm)}`)
        if (jurisprudentieResponse.ok) {
          const jurisprudentieData = await jurisprudentieResponse.json()
          if (jurisprudentieData.results) {
            sources.push(...jurisprudentieData.results.slice(0, 2).map((r: any) => r.ecli))
          }
        }
      } catch (error) {
        console.error(`Error searching jurisprudentie for ${searchTerm}:`, error)
      }
    }

    // Zoek relevante tuchtrechtuitspraken voor specifieke onderwerpen
    if (query.toLowerCase().includes('tuchtrecht') || 
        query.toLowerCase().includes('beroepsgroep') ||
        query.toLowerCase().includes('medisch') ||
        query.toLowerCase().includes('advocaat')) {
      try {
        const tuchtrechtResponse = await fetch(`https://tuchtrecht.overheid.nl/zoeken?q=${encodeURIComponent(query)}`)
        if (tuchtrechtResponse.ok) {
          const tuchtrechtData = await tuchtrechtResponse.json()
          if (tuchtrechtData.results) {
            sources.push(...tuchtrechtData.results.slice(0, 2).map((r: any) => r.url))
          }
        }
      } catch (error) {
        console.error('Error searching tuchtrecht:', error)
      }
    }

    return [...new Set(sources)].slice(0, 10) // Verwijder duplicaten en limiteer tot 10 bronnen
  } catch (error) {
    console.error('Error searching sources:', error)
    return []
  }
}

// Functie om automatisch gerelateerde juridische termen te vinden
function getRelatedLegalTerms(query: string): string[] {
  const lowerQuery = query.toLowerCase()
  const relatedTerms: string[] = []
  
  // Huiselijk geweld en gerelateerde delicten
  if (lowerQuery.includes('huiselijk geweld') || lowerQuery.includes('mishandeling') || lowerQuery.includes('geweld')) {
    relatedTerms.push('artikel 300 sr', 'artikel 302 sr', 'artikel 304 sr', 'artikel 285 sr')
  }
  
  // Verkeer en vervoer
  if (lowerQuery.includes('verkeer') || lowerQuery.includes('rijden') || lowerQuery.includes('auto') || lowerQuery.includes('fiets')) {
    relatedTerms.push('wegenverkeerswet', 'rvv', 'artikel 5 wvw', 'artikel 8 wvw')
  }
  
  // Diefstal en vermogensdelicten
  if (lowerQuery.includes('diefstal') || lowerQuery.includes('stelen') || lowerQuery.includes('inbraak')) {
    relatedTerms.push('artikel 310 sr', 'artikel 311 sr', 'artikel 312 sr')
  }
  
  // Drugs en verdovende middelen
  if (lowerQuery.includes('drugs') || lowerQuery.includes('wiet') || lowerQuery.includes('cannabis') || lowerQuery.includes('opium')) {
    relatedTerms.push('opiumwet', 'artikel 2 opiumwet', 'artikel 3 opiumwet')
  }
  
  // Belediging en discriminatie
  if (lowerQuery.includes('belediging') || lowerQuery.includes('discriminatie') || lowerQuery.includes('racisme')) {
    relatedTerms.push('artikel 137c sr', 'artikel 137d sr', 'artikel 261 sr')
  }
  
  // Bedreiging en stalking
  if (lowerQuery.includes('bedreiging') || lowerQuery.includes('stalking') || lowerQuery.includes('bedreigen')) {
    relatedTerms.push('artikel 285 sr', 'artikel 285b sr')
  }
  
  // Fraude en oplichting
  if (lowerQuery.includes('fraude') || lowerQuery.includes('oplichting') || lowerQuery.includes('bedrog')) {
    relatedTerms.push('artikel 326 sr', 'artikel 416 sr')
  }
  
  // Politie en handhaving
  if (lowerQuery.includes('politie') || lowerQuery.includes('aanhouding') || lowerQuery.includes('arrestatie')) {
    relatedTerms.push('wetboek van strafvordering', 'artikel 27 sv', 'artikel 53 sv')
  }
  
  // Privacy en gegevensbescherming
  if (lowerQuery.includes('privacy') || lowerQuery.includes('gegevens') || lowerQuery.includes('avg')) {
    relatedTerms.push('avg', 'algemene verordening gegevensbescherming', 'wbp')
  }
  
  return relatedTerms
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