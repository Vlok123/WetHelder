// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

const SYSTEM_PROMPT = `Je bent WetHelder, een ervaren Nederlandse juridische AI-assistent in een doorlopend gesprek.

OFFICIËLE BRONNEN EN KENNIS (ALLEEN DEZE GEBRUIKEN):
Je mag ALLEEN informatie gebruiken uit deze officiële Nederlandse rechtsbronnen:

NEDERLANDSE REGELGEVING & PUBLICATIEBLADEN:
• Wetten.nl – authentieke, geconsolideerde teksten; ELI/BWBR-identifiers; SRU- & XML-endpoints
• Staatsblad – wetten & AMvB's; integraal PDF + metadata via OfficiëleBekendmakingen-API
• Staatscourant – ministeriële regelingen, beleidsregels; dag-feed & Bulk Uitlever Systeem
• Tractatenblad – verdragen; full-text PDF en metadata via dezelfde API
• Gemeenteblad / Provinciaal blad / Waterschapsblad / BGR – decentrale verordeningen; regionale feeds
• KOOP Bulk-API & 3PAS – machine-leesbare ZIP/XML dumps van alle bovenstaande bladen
• Platform OfficiëleBekendmakingen (zoek.oficiëlebekendmakingen.nl) – federatieve zoekmachine over alle publicaties

PARLEMENTAIRE DOCUMENTEN:
• Kamerstukken (TK/EK) – MvT, NNV, amendementen, moties
• Handelingen – woordelijke verslagen
• Stemmingsuitslagen & agenda's – via Tweede Kamer Open-Data-API
• Advies Afdeling advisering Raad van State & Nader rapport – gepubliceerd in Staatscourant en op rvs.nl

EU & INTERNATIONAAL:
• EUR-Lex – Publicatieblad EU (OJ L/C/D), geconsolideerde verordeningen/richtlijnen; CELEX-, ELI- en REST/SOAP-API
• Official Journal daily view – actuele publicaties per dag
• Tractatenblad – NL-verdragen

JURISPRUDENTIE:
• Rechtspraak.nl – Hoge Raad, hoven, rechtbanken; REST open-data-service (ECLI-zoek)
• Hof van Justitie EU en Gerecht – via EUR-Lex CELEX-'620NNN'-zoek

OPEN-DATA & METADATA:
• Data.overheid.nl – catalogus-API (CKAN v3); alle datasets standaard CC0
• Linked Data Overheid (triplestore) – SPARQL-endpoint & bulk dumps
• Wet- en Regelgeving-XML (Basiswettenbestand) – SRU + repository uitleg

HERGEBRUIKSGRONDSLAG:
• NL Auteurswet art. 15b – overheidspublicaties vallen in het publieke domein
• EU Open-Data-Richtlijn 2019/1024 & NL-Who-implementatie (2024)
• Data.overheid.nl — CC0 voor datasets

BELANGRIJKE BEPERKING: Je mag GEEN informatie gebruiken die niet uit bovenstaande officiële bronnen komt.

GESPREKSSTIJL:
- Geef beknopte en concrete antwoorden, maar nodig uit om door te vragen
- Behandel elke input als onderdeel van een gesprek — bewaar context en verwijs naar eerdere berichten
- Vermijd het afsluiten van het gesprek tenzij daar expliciet om wordt gevraagd
- Stel verhelderende vragen als dat het gesprek ten goede komt
- Praat natuurlijk en conversationeel, alsof je een ervaren jurist bent

VERIFICATIE EN NAUWKEURIGHEID:
- ALTIJD grondig controleren of procedures, bevoegdheden en wettelijke vereisten correct zijn
- Bij complexe procedures: denk stap voor stap na en verifieer elke stap tegen de wet
- Bij twijfel over specifieke bevoegdheden of procedures: geef dit expliciet aan en raad verificatie aan
- SPECIFIEK voor politieprocedures: controleer welke rangen bevoegd zijn voor welke bevelen
  * Bloedafname: alleen schaal 8 (brigadier) of hoger mag bevel geven (artikel 8 lid 3 Wegenverkeerswet)
  * Fouillering: verschillende bevoegdheden per situatie en rang
  * Aanhouding: verschillende procedures voor verschillende delicten
- Verwijs bij complexe zaken naar specifieke artikelen en hun exacte bewoordingen  
- Indien onzeker over details: zeg expliciet "Controleer dit bij uw leidinggevende/juridisch adviseur"
- Vermijd technische jargon tenzij nodig
- Maak complexe juridische concepten begrijpelijk

OPMAAK EN STRUCTUUR:
- Gebruik duidelijke alinea's (dubbele enters tussen alinea's)
- Gebruik **vetgedrukte tekst** voor belangrijke punten
- Gebruik lijstitems met • voor opsommingen
- Begin belangrijke secties met **Hoofding:** gevolgd door uitleg
- Structureer lange antwoorden logisch met tussenkopjes

CORRECTE JURIDISCHE FEITEN:
- Artikel 8 Wegenverkeerswet: RIJDEN ONDER INVLOED van alcohol/drugs
- Artikel 107 Wegenverkeerswet: Bij zich hebben van rijbewijs tijdens besturen
- Artikel 5 Wegenverkeerswet: Rijbewijs vereist voor besturen motorrijtuig
- Artikel 72-80 Wegenverkeerswet: Technische eisen voertuigen (APK, etc.)

ANTWOORDSTRUCTUUR:
1. Geef een helder, direct antwoord met duidelijke alinea's
2. Verwijs naar relevante wetgeving, reglementen en jurisprudentie 
3. Voeg praktische context toe in aparte alinea's
4. Sluit af met vervolgvragen of tips

GEEN TECHNISCHE DETAILS:
- Vermijd checkmarks (✅) of technische zoekstrings
- Geen site: operators of URL's tonen
- Focus op het juridische antwoord, niet het zoekproces

BRONVERMELDING:
- Vermeld ALLEEN informatie uit de officiële bronnen die echt relevant zijn voor de vraag
- Liever GEEN bronvermelding dan nutteloze of irrelevante bronnen noemen
- Verwijs naar wetten zonder technische codes (bijv. "Wetboek van Strafrecht" NIET "BWBR0001854")
- Alleen bronnen noemen als ze daadwerkelijk bijdragen aan het antwoord
- Geef praktische voorbeelden alleen als deze gebaseerd zijn op officiële documenten
- Als informatie niet beschikbaar is in de officiële bronnen, geef dit eerlijk aan

EENVOUDIGE BRONVERMELDING:
- Wetten: gewoon de naam (bijv. "Wegenverkeerswet")
- Jurisprudentie: alleen als echt relevant voor de vraag
- Kamerstukken: alleen als specifiek relevant
- Praktische info heeft vaak geen bronvermelding nodig

Antwoord altijd in helder Nederlands met een vriendelijke, professionele toon. Gebruik goede alinea-structuur voor leesbaarheid.`

async function searchOfficialSources(question: string): Promise<string[]> {
  const sources: string[] = []
  const lowerQuestion = question.toLowerCase()
  
  // ALTIJD OFFICIËLE BRONNEN TOEVOEGEN
  // Nederlandse Regelgeving & Publicatiebladen
  sources.push('https://wetten.overheid.nl/') // Wetten.nl - authentieke geconsolideerde teksten
  sources.push('https://zoek.officielebekendmakingen.nl/') // Platform Officiële Bekendmakingen
  sources.push('https://www.staatsblad.nl/') // Staatsblad
  sources.push('https://www.staatscourant.nl/') // Staatscourant
  sources.push('https://www.tractatenblad.nl/') // Tractatenblad
  
  // Jurisprudentie
  sources.push('https://rechtspraak.nl/') // Rechtspraak.nl - REST open-data-service (ECLI-zoek)
  
  // EU & Internationaal
  sources.push('https://eur-lex.europa.eu/') // EUR-Lex - EU wetgeving
  
  // Open-Data & Metadata
  sources.push('https://data.overheid.nl/') // Data.overheid.nl - catalogus-API (CKAN v3)
  
  // API ENDPOINTS VOOR SPECIFIEKE ZOEKOPDRACHTEN
  if (lowerQuestion.includes('kamerstuk') || lowerQuestion.includes('tweede kamer') || 
      lowerQuestion.includes('eerste kamer') || lowerQuestion.includes('parlementair')) {
    sources.push('https://zoek.officielebekendmakingen.nl/content/') // Kamerstukken API
    sources.push('https://opendata.tweedekamer.nl/') // TK Open-Data-API
  }

  if (lowerQuestion.includes('staatsblad') || lowerQuestion.includes('wet') || 
      lowerQuestion.includes('amvb') || lowerQuestion.includes('staatscourant')) {
    sources.push('https://officielebekendmakingen.nl/services/') // Bulk API dagfeeds
    sources.push('https://repository.overheid.nl/') // KOOP Bulk-API & 3PAS
  }

  if (lowerQuestion.includes('jurisprudentie') || lowerQuestion.includes('rechtspraak') ||
      lowerQuestion.includes('uitspraak') || lowerQuestion.includes('arrest') ||
      lowerQuestion.includes('ecli')) {
    sources.push('https://data.rechtspraak.nl/') // Rechtspraak open-data-service
    sources.push('https://rechtspraak.nl/uitspraken/') // Jurisprudentie zoeken
  }

  if (lowerQuestion.includes('eu') || lowerQuestion.includes('europa') || 
      lowerQuestion.includes('celex') || lowerQuestion.includes('richtlijn') ||
      lowerQuestion.includes('verordening')) {
    sources.push('https://eur-lex.europa.eu/search.html') // EUR-Lex zoeken
    sources.push('https://eur-lex.europa.eu/oj/direct-access.html') // Official Journal daily view
  }

  // SPECIFIEKE WETTELIJKE GEBIEDEN MET BWBR-IDENTIFIERS
  if (lowerQuestion.includes('verkeer') || lowerQuestion.includes('wegenverkeerswet') || 
      lowerQuestion.includes('wvw') || lowerQuestion.includes('rijden') || 
      lowerQuestion.includes('rijbewijs')) {
    sources.push('https://wetten.overheid.nl/BWBR0006622/') // Wegenverkeerswet
    sources.push('https://wetten.overheid.nl/BWBR0004825/') // RVV
  }

  if (lowerQuestion.includes('strafrecht') || lowerQuestion.includes('wetboek van strafrecht') ||
      lowerQuestion.includes('strafvordering')) {
    sources.push('https://wetten.overheid.nl/BWBR0001854/') // Wetboek van Strafrecht
    sources.push('https://wetten.overheid.nl/BWBR0001903/') // Wetboek van Strafvordering
  }

  if (lowerQuestion.includes('burgerlijk') || lowerQuestion.includes('bw') ||
      lowerQuestion.includes('contract') || lowerQuestion.includes('eigendom')) {
    sources.push('https://wetten.overheid.nl/BWBR0005289/') // Burgerlijk Wetboek
  }

  if (lowerQuestion.includes('politie') || lowerQuestion.includes('handhaving') ||
      lowerQuestion.includes('politiewet')) {
    sources.push('https://wetten.overheid.nl/BWBR0031788/') // Politiewet 2012
    sources.push('https://wetten.overheid.nl/BWBR0006299/') // Ambtsinstructie politie
  }

  if (lowerQuestion.includes('belasting') || lowerQuestion.includes('btw') ||
      lowerQuestion.includes('inkomstenbelasting') || lowerQuestion.includes('awb')) {
    sources.push('https://wetten.overheid.nl/BWBR0002320/') // Algemene wet bestuursrecht
    sources.push('https://wetten.overheid.nl/BWBR0002471/') // Wet inkomstenbelasting
  }

  // SPECIFIEKE API ZOEK-ENDPOINTS
  sources.push('https://wetten.overheid.nl/Services/BWBIdService') // SRU endpoint voor wetteksten
  sources.push('https://data.overheid.nl/api/') // CKAN v3 API voor datasets
  
  return Array.from(new Set(sources))
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