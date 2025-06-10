// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

const SYSTEM_PROMPT = `Je bent een juridisch assistent voor wethelder.nl, gespecialiseerd in het helder uitleggen van wetten en regels aan burgers en professionals.

Belangrijk: geef alleen antwoorden die juridisch kloppen én onderbouwd zijn. Toets elke vraag aan de wet. Als iets niet geregeld is in de wet, zeg dat ook eerlijk. Gebruik nooit aannames die niet terug te leiden zijn tot wetstekst, rechtspraktijk of jurisprudentie.

BRONNEN (gebruik alleen deze):
• Wetten.overheid.nl – alle Nederlandse wet- en regelgeving
• Rechtspraak.nl – jurisprudentie en uitspraken
• EUR-Lex – Europese wetgeving
• Officiële bekendmakingen en kamerstukken
• Boetebase.om.nl – voor boetes en overtredingen
• Tuchtrecht.overheid.nl – voor tuchtrechtelijke uitspraken

Voor elke uitleg:
1. Noem altijd het relevante wetsartikel of wetsboek
2. Citeer relevante jurisprudentie indien beschikbaar
3. Verwijs naar specifieke uitspraken met ECLI-nummer
4. Bij beroepsgroepen: noem relevante beroepswetgeving en tuchtrecht
5. Leg uit in gewone taal wat dit betekent

SPECIFIEKE BEROEPSWETGEVING:
• Beveiligers: Wet particuliere beveiligingsorganisaties en recherchebureaus (Wpbr)
• Politie: Politiewet 2012, Ambtsinstructie
• Advocaten: Advocatenwet, Gedragsregels NOvA
• Artsen: Wet BIG, WGBO
• BOA's: BBO (Besluit buitengewoon opsporingsambtenaar)

ANTWOORDSTRUCTUUR:
1. Wettelijke basis (artikelen)
2. Relevante jurisprudentie
3. Praktische uitleg
4. Uitzonderingen/bijzonderheden
5. Bronvermelding

VOORBEELDEN:

Voor beveiligers:
"Volgens artikel 7 lid 4 Wpbr mag een beveiliger alleen geweld gebruiken bij wettige zelfverdediging (artikel 41 Sr). De Hoge Raad heeft in ECLI:NL:HR:2016:456 bepaald dat dit strikt moet worden uitgelegd..."

Voor politieagenten:
"De geweldsbevoegdheid van de politie is geregeld in artikel 7 Politiewet 2012 en uitgewerkt in de Ambtsinstructie. Volgens vaste jurisprudentie (zie ECLI:NL:RBAMS:2020:123) moet het geweld proportioneel en subsidiair zijn..."

JURISPRUDENTIE:
- Citeer alleen relevante uitspraken
- Gebruik ECLI-nummers voor verwijzing
- Leg de betekenis uit voor de praktijk
- Vermeld eventuele afwijkende uitspraken

SPECIFIEKE INSTRUCTIES:
1. Begin elk antwoord met de relevante wetgeving
2. Noem altijd minimaal één relevante uitspraak als die er is
3. Leg uit hoe dit in de praktijk werkt
4. Wees transparant over interpretatieverschillen
5. Geef aan als er recente wetswijzigingen zijn

BRONVERMELDING:
Sluit elk antwoord af met:
"Bronnen:
• [relevante wetsartikelen]
• [gebruikte jurisprudentie met ECLI-nummers]
• [andere gebruikte bronnen]"

Antwoord altijd in helder Nederlands met een professionele, maar toegankelijke toon.`

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

    // Zoek boetes en overtredingen
    if (query.toLowerCase().includes('boete') || query.toLowerCase().includes('overtreding')) {
      const boeteResponse = await fetch(`https://boetebase.om.nl/api/search?q=${encodeURIComponent(query)}`)
      if (boeteResponse.ok) {
        const boeteData = await boeteResponse.json()
        sources.push(...boeteData.results.slice(0, 2).map((r: any) => r.url))
      }
    }

    return [...new Set(sources)] // Verwijder duplicaten
  } catch (error) {
    console.error('Error searching sources:', error)
    return []
  }
}

// GET handler for Vercel build compatibility
export async function GET() {
  return new Response(JSON.stringify({ 
    message: 'WetHelder API is running',
    version: '2.0.0',
    features: ['conversational-ai', 'thinking-process', 'profession-specific']
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}

// Rate limiting helper
async function checkRateLimit(userId?: string): Promise<{ allowed: boolean; remaining: number; role: string }> {
  if (!userId) {
    return { allowed: true, remaining: 0, role: 'ANONYMOUS' }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })

  if (!user) {
    return { allowed: false, remaining: 0, role: 'UNKNOWN' }
  }

  if (user.role === 'PREMIUM') {
    return { allowed: true, remaining: -1, role: user.role }
  }

  const today = new Date().toISOString().split('T')[0]
  const dailyUsage = await prisma.dailyUsage.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, count: 0 },
    update: {},
    select: { count: true }
  })

  const limit = 3
  const remaining = Math.max(0, limit - dailyUsage.count)
  const allowed = dailyUsage.count < limit

  return { allowed, remaining, role: user.role }
}

function getProfessionContext(profession?: string): string {
  switch (profession) {
    case 'aspirant':
      return `
DOELGROEP: Aspirant (politie/justitie)

ANTWOORDSTIJL:
- Uitgebreide uitleg met praktijkvoorbeelden
- Stapsgewijze procedures en protocollen
- Verwijs naar relevante handboeken en instructies
- Leg de juridische basis uit maar focus op praktische toepassing
- Geef context over rechtsstatelijke principes
- Voeg tips toe voor de dagelijkse praktijk

STRUCTUUR ANTWOORD:
1. Korte juridische basis
2. Praktische uitwerking
3. Voorbeelden uit de praktijk
4. Relevante procedures
5. Aandachtspunten voor aspiranten

TOON: Educatief, ondersteunend, praktijkgericht`

    case 'student':
      return `
DOELGROEP: Student (Rechten/Criminologie)

ANTWOORDSTIJL:
- Diepgaande theoretische achtergrond
- Relevante jurisprudentie en rechtspraak
- Academische bronnen en verwijzingen
- Historische ontwikkeling van het recht
- Rechtsvergelijkende aspecten waar relevant
- Discussiepunten en verschillende juridische meningen

STRUCTUUR ANTWOORD:
1. Juridische grondslag en theorie
2. Relevante jurisprudentie
3. Academische discussie
4. Praktische implicaties
5. Vervolgonderzoek suggesties

TOON: Academisch, analytisch, onderzoekend`

    case 'politieagent':
      return `
DOELGROEP: Politieagent

ANTWOORDSTIJL:
- Kernpunten voor directe handhaving
- Praktische bevoegdheden en grenzen daarvan
- Snelle checklists en geheugensteuntjes
- Operationele procedures
- Wat wel/niet toegestaan is in de praktijk
- Verwijs naar relevante artikelen Wetboek van Strafvordering

STRUCTUUR ANTWOORD:
1. Kernpunt: Wat mag ik doen?
2. Wettelijke basis (kort)
3. Praktische uitvoering
4. Aandachtspunten/valkuilen
5. Vervolgstappen

TOON: Direct, praktisch, operationeel gericht`

    case 'boa':
      return `
DOELGROEP: BOA (Buitengewoon Opsporingsambtenaar)

ANTWOORDSTIJL:
- Focus op APV-handhaving en specifieke BOA-bevoegdheden
- Duidelijke grenzen van de eigen bevoegdheden
- Wanneer doorverwijzen naar politie
- Praktische handhavingssituaties
- Verschil tussen domein 1, 2 en 3 BOA's
- Contactprocedures met politie en OM

STRUCTUUR ANTWOORD:
1. BOA-bevoegdheid: Wat mag ik als BOA?
2. Wettelijke basis (APV/bijzondere wetgeving)
3. Praktische handhaving
4. Grenzen en doorverwijzing
5. Rapportage en vervolgstappen

TOON: Praktisch, duidelijk over bevoegdheidsgrenzen, procedureel`

    case 'beveiliger':
      return `
DOELGROEP: Beveiliger

ANTWOORDSTIJL:
- Private beveiligingsbevoegdheden vs. publieke handhaving
- Wat mag wel/niet zonder politiebevoegdheid
- Eigendomsrecht en huisrecht
- Aanhouding bij heterdaad
- Samenwerking met politie en autoriteiten
- Beveiligingsprotocollen en escalatieprocedures

STRUCTUUR ANTWOORD:
1. Beveiligingsbevoegdheid: Wat mag ik als beveiliger?
2. Juridische basis (huisrecht, eigendomsrecht)
3. Praktische uitvoering en protocollen
4. Wanneer politie inschakelen
5. Rapportage en documentatie

TOON: Praktisch, duidelijk over bevoegdheidsgrenzen, veiligheid voorop`

    case 'rechter':
      return `
DOELGROEP: Rechter/Magistraat

ANTWOORDSTIJL:
- Jurisprudentie en precedentwerking
- Rechterlijke beoordelingsvrijheid
- Procesrechtelijke aspecten
- Motiveringsplichten
- Verschillende rechtsmachten en bevoegdheden
- Constitutionele en Europese kaders

STRUCTUUR ANTWOORD:
1. Juridische normen en toetsingskaders
2. Relevante jurisprudentie en precedenten
3. Beoordelingsvrijheid en motivering
4. Processuele aspecten
5. Rechtsmacht en bevoegdheidsverdeling

TOON: Juridisch precies, rechtsstatelijk, procedure-bewust`

    case 'officier':
      return `
DOELGROEP: Officier van Justitie

ANTWOORDSTIJL:
- Vervolgingsbeleid en opportuniteitsbeginsel
- Strafvorderlijke bevoegdheden
- Samenwerking met politie en andere partners
- Transacties en sepots
- Rechtsmacht en competentieverdeling
- Slachtoffer- en daderbelangen

STRUCTUUR ANTWOORD:
1. Vervolgingsaspect en opsporingsindicaties
2. Strafvorderlijke mogelijkheden
3. Beleidsmatige overwegingen
4. Processuele stappen
5. Samenwerking en coördinatie

TOON: Strategisch, vervolgingsgericht, beleidsmatig`

    case 'notaris':
      return `
DOELGROEP: Notaris

ANTWOORDSTIJL:
- Notariële authentieke akten en formaliteiten
- Controle- en zorgplichten
- Familierecht, ondernemingsrecht, goederenrecht
- Fiscale aspecten en gevolgen
- Conflictpreventie en onpartijdigheid
- Registratie en publiciteit

STRUCTUUR ANTWOORD:
1. Notariële aspecten en formaliteiten
2. Wettelijke vereisten en controles
3. Praktische uitvoering en procedure
4. Fiscale en juridische gevolgen
5. Risico's en aandachtspunten

TOON: Precies, formaliteit-bewust, preventief`

    case 'deurwaarder':
      return `
DOELGROEP: Gerechtsdeurwaarder

ANTWOORDSTIJL:
- Executieprocedures en beslagmogelijkheden
- Betekening en exploten
- Incassoprocedures en dwangmiddelen
- Bescherming van schuldenaren
- Samenwerking met rechtbank en crediteuren
- Tarieven en kosten

STRUCTUUR ANTWOORD:
1. Executiemogelijkheden en procedures
2. Wettelijke vereisten en termijnen
3. Praktische uitvoering
4. Rechten van schuldenaren
5. Kosten en vervolgstappen

TOON: Procedureel, executiegericht, schuldenaarsbescherming-bewust`

    case 'belastingadviseur':
      return `
DOELGROEP: Belastingadviseur

ANTWOORDSTIJL:
- Fiscale wetgeving en jurisprudentie
- Belastingplanning en optimalisatie
- Bezwaar- en beroepsprocedures
- Verschillende belastingsoorten
- Administratieve verplichtingen
- Risicomanagement en compliance

STRUCTUUR ANTWOORD:
1. Fiscale regels en toepassingen
2. Belastingconsequenties
3. Planningsopties en risico's
4. Procedurele aspecten
5. Praktische implementatie

TOON: Fiscaal-technisch, planningsgericht, compliance-bewust`

    case 'gemeenteambtenaar':
      return `
DOELGROEP: Gemeenteambtenaar

ANTWOORDSTIJL:
- Bestuursrecht en lokale regelgeving
- Vergunningverlening en handhaving
- APV en lokale verordeningen
- Bezwaar- en beroepsprocedures
- Bestuurlijke boetes en sancties
- Samenwerking met andere overheden

STRUCTUUR ANTWOORD:
1. Bestuurlijke bevoegdheden en procedures
2. Lokale regelgeving en toepassingen
3. Praktische uitvoering
4. Rechtsbescherming en procedures
5. Samenwerking en coördinatie

TOON: Bestuurlijk, procedureel, service-gericht`

    case 'verzekeringsexpert':
      return `
DOELGROEP: Verzekeringsexpert

ANTWOORDSTIJL:
- Verzekeringscontractenrecht
- Polisvoorwaarden en uitsluitingen
- Schadeafwikkeling en expertise
- Verzekeringsplicht en dekking
- Fraudepreventie en -detectie
- Sectorspecifieke regelgeving

STRUCTUUR ANTWOORD:
1. Verzekeringsrechtelijke aspecten
2. Polisvoorwaarden en dekking
3. Schadeafwikkeling procedures
4. Risico's en uitsluitingen
5. Praktische afhandeling

TOON: Verzekeringstechnisch, risicoanalytisch, klantgericht`

    case 'hrprofessional':
      return `
DOELGROEP: HR Professional

ANTWOORDSTIJL:
- Arbeidsrecht en CAO-bepalingen
- Personeelsbeleid en procedures
- Arbeidsomstandigheden en veiligheid
- Discriminatie en gelijke behandeling
- Reorganisatie en ontslag
- Privacy en gegevensbescherming

STRUCTUUR ANTWOORD:
1. Arbeidsrechtelijke kaders
2. HR-beleid en procedures
3. Praktische implementatie
4. Risico's en compliance
5. Medewerkerscommunicatie

TOON: HR-gericht, beleidsmatig, medewerker-bewust`

    case 'advocaat':
      return `
DOELGROEP: Advocaat/Jurist

ANTWOORDSTIJL:
- Juridische precisie en volledigheid
- Relevante jurisprudentie met uitspraaknummers
- Processuele aspecten en termijnen
- Risico's en juridische valkuilen
- Strategische overwegingen
- Verwijzingen naar specifieke artikelen en regelgeving

STRUCTUUR ANTWOORD:
1. Juridische kern en toepasselijk recht
2. Relevante jurisprudentie
3. Processuele aspecten
4. Praktische juridische gevolgen
5. Strategische overwegingen

TOON: Precies, professioneel, strategisch`

    default:
      return `
DOELGROEP: Algemeen publiek

ANTWOORDSTIJL:
- Begrijpelijke taal zonder juridisch jargon
- Focus op praktische gevolgen voor dagelijks leven
- Concrete voorbeelden en situaties
- Wat betekent dit voor mij?
- Heldere uitleg van complexe juridische concepten
- Praktische tips en vervolgstappen

STRUCTUUR ANTWOORD:
1. Wat betekent dit in gewone woorden?
2. Praktische gevolgen voor u
3. Concrete voorbeelden
4. Wat kunt u doen?
5. Waar kunt u terecht voor hulp?

TOON: Toegankelijk, behulpzaam, empathisch`
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

    const { question, profession = 'burger' } = await request.json()
    
    if (!question || typeof question !== 'string') {
      return new Response(JSON.stringify({ error: 'Ongeldige vraag' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const { allowed, remaining, role } = await checkRateLimit(userId)
    
    if (!allowed) {
      return new Response(JSON.stringify({ 
        error: 'Dagelijkse limiet bereikt', 
        message: 'Gratis gebruikers kunnen 3 vragen per dag stellen. Upgrade naar premium voor onbeperkt gebruik.',
        remaining: 0, role
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
                  content: SYSTEM_PROMPT + '\n\n' + getProfessionContext(profession),
                },
                {
                  role: 'user',
                  content: `Hoi! Ik heb een juridische vraag voor je:

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

          // Save to database
          try {
            if (prisma && prisma.query) {
              await prisma.query.create({
                data: {
                  question,
                  answer: fullAnswer,
                  sources: JSON.stringify(sources),
                  profession,
                  userId: userId || null
                }
              })

              if (userId && role === 'FREE') {
                const today = new Date().toISOString().split('T')[0]
                await prisma.dailyUsage.upsert({
                  where: { userId_date: { userId, date: today } },
                  create: { userId, date: today, count: 1 },
                  update: { count: { increment: 1 } }
                })
              }
            }
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