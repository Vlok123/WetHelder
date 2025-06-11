import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

// Mock data om ChatGPT context te geven
const mockBoeteData = [
  {
    feitcode: 'R614',
    omschrijving: 'Rechts inhalen op autosnelweg',
    juridischeGrondslag: 'Art. 19 lid 1 RVV 1990',
    standaardboete: 239,
    type: 'overtreding'
  },
  {
    feitcode: 'W010a',
    omschrijving: 'Rijden onder invloed van alcohol (130-220 µg/l)',
    juridischeGrondslag: 'Art. 8 lid 1 WVW 1994',
    standaardboete: 350,
    type: 'misdrijf'
  },
  {
    feitcode: 'S099',
    omschrijving: 'Te hard rijden 21-30 km/h binnen bebouwde kom',
    juridischeGrondslag: 'Art. 20 RVV 1990',
    standaardboete: 165,
    type: 'overtreding'
  },
  {
    feitcode: 'G101',
    omschrijving: 'Niet dragen van gordel als bestuurder',
    juridischeGrondslag: 'Art. 59 RVV 1990',
    standaardboete: 95,
    type: 'overtreding'
  },
  {
    feitcode: 'M089',
    omschrijving: 'Gebruik mobiele telefoon tijdens het rijden',
    juridischeGrondslag: 'Art. 61a RVV 1990',
    standaardboete: 350,
    type: 'overtreding'
  },
  {
    feitcode: 'P201',
    omschrijving: 'Parkeren in gehandicaptenparkeerplaats',
    juridischeGrondslag: 'Art. 24 lid 3 RVV 1990',
    standaardboete: 370,
    type: 'overtreding'
  },
  {
    feitcode: 'L015',
    omschrijving: 'Rijden door rood licht',
    juridischeGrondslag: 'Art. 68 lid 1 RVV 1990',
    standaardboete: 260,
    type: 'overtreding'
  },
  {
    feitcode: 'E340',
    omschrijving: 'Milieusticker ontbreekt',
    juridischeGrondslag: 'Art. 9.2.2.9 Wabo',
    standaardboete: 150,
    type: 'overtreding'
  },
  {
    feitcode: 'V045',
    omschrijving: 'Voorrang verlenen negeren',
    juridischeGrondslag: 'Art. 15 RVV 1990',
    standaardboete: 230,
    type: 'overtreding'
  },
  {
    feitcode: 'A120',
    omschrijving: 'APV overtreding - wildplassen',
    juridischeGrondslag: 'Gemeentelijke APV',
    standaardboete: 140,
    type: 'overtreding'
  }
]

function getProfileContextForBoetes(profile?: string): string {
  switch (profile) {
    case 'burger':
      return `
DOELGROEP: Burger/Particulier

ANTWOORDSTIJL:
- Begrijpelijke uitleg zonder juridisch jargon
- Focus op praktische gevolgen voor dagelijks leven
- Concrete voorbeelden en situaties
- Wat betekent dit voor u als automobilist/weggebruiker?
- Heldere uitleg van rechten en plichten
- Praktische tips voor naleving

STRUCTUUR:
1. Wat zegt de wet in gewone woorden?
2. Wat betekent dit voor u als weggebruiker?
3. Concrete voorbeelden
4. Wat kunt u doen bij overtredingen?
5. Waar vindt u hulp?

TOON: Toegankelijk, behulpzaam, empathisch`

    case 'politie':
      return `
DOELGROEP: Politieagent

ANTWOORDSTIJL:
- Kernpunten voor directe handhaving
- Praktische bevoegdheden en grenzen
- Operationele procedures bij overtredingen
- Wat wel/niet toegestaan is tijdens controle
- Bewijslast en procesverbaal
- Doorverwijzing naar andere autoriteiten

STRUCTUUR:
1. Wettelijke basis en handhavingsbevoegdheden
2. Praktische controle en vaststelling
3. Proces-verbaal en bewijsvoering
4. Doorverwijzing en vervolgstappen
5. Aandachtspunten bij handhaving

TOON: Direct, praktisch, operationeel gericht`

    case 'jurist':
      return `
DOELGROEP: Jurist/Advocaat

ANTWOORDSTIJL:
- Juridische precisie en volledigheid
- Relevante jurisprudentie en rechtsgrond
- Processuele aspecten en termijnen
- Verdedigingsstrategieën en juridische lacunes
- Verwijzingen naar specifieke artikelen
- Rechtsmacht en bevoegdheidsverdeling

STRUCTUUR:
1. Juridische grondslag en wetshistorie
2. Relevante jurisprudentie
3. Processuele aspecten en verweer
4. Praktische juridische gevolgen
5. Strategische overwegingen

TOON: Precies, professioneel, strategisch`

    case 'boa':
      return `
DOELGROEP: BOA (Buitengewoon Opsporingsambtenaar)

ANTWOORDSTIJL:
- Focus op BOA-bevoegdheden binnen specifiek domein
- Duidelijke grenzen van eigen handhavingsmogelijkheden
- Wanneer doorverwijzen naar politie/andere autoriteiten
- APV-handhaving en lokale verordeningen
- Procedurele aspecten binnen BOA-kaders
- Rapportage en proces-verbaal voor BOA's

STRUCTUUR:
1. BOA-bevoegdheid binnen relevant domein
2. Wettelijke basis en handhavingsruimte
3. Praktische uitvoering binnen BOA-taken
4. Grenzen en doorverwijzing
5. Rapportage en administratie

TOON: Praktisch, duidelijk over bevoegdheidsgrenzen, procedureel`

    case 'student':
      return `
DOELGROEP: Student

ANTWOORDSTIJL:
- Theoretische achtergrond en wetshistorie
- Rechtsprincipes en dogmatiek
- Academische bronnen en literatuur
- Rechtsvergelijking en kritische analyse
- Discussiepunten en verschillende interpretaties
- Studie-ondersteunende informatie

STRUCTUUR:
1. Theoretische basis en rechtsprincipes
2. Wetshistorie en ontwikkeling
3. Academische discussie en interpretatie
4. Praktische toepassingen en cases
5. Vervolgonderzoek en bronnen

TOON: Academisch, analytisch, onderzoekend`

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

STRUCTUUR:
1. Wat betekent dit in gewone woorden?
2. Praktische gevolgen voor u
3. Concrete voorbeelden
4. Wat kunt u doen?
5. Waar kunt u terecht voor hulp?

TOON: Toegankelijk, behulpzaam, empathisch`
  }
}

function getBoetesSystemPrompt(profile?: string): string {
  const profileContext = getProfileContextForBoetes(profile)
  
  return `Je bent een juridisch AI-assistent die Nederlandse boetes en overtredingen uitlegt in duidelijke, feitelijke en juridisch correcte taal. Je baseert je uitsluitend op de beschikbare bronnen die door de gebruiker of het systeem zijn aangeleverd.

${profileContext}

⚠️ BELANGRIJK: Dit systeem is nog in BETA. Antwoorden kunnen fouten bevatten.

### KRITISCHE INSTRUCTIES:
- Gebruik **alleen de informatie die aantoonbaar in de bron staat**.
- Controleer bij elk antwoord of het een directe weergave of logische interpretatie is van de gevonden bronnen.
- Geef géén juridische interpretatie zonder bronverwijzing of expliciet "volgens bron X".
- **Voeg automatisch spaties toe tussen tekst en cijfers** (bijv. "artikel5" → "artikel 5", "wegenverkeerswet1994" → "wegenverkeerswet 1994", "N420" blijft "N420").

### Controle-instructies (voor elk antwoord):
1. **Is alles wat je zegt onderbouwd met de gegeven bron(nen)?**
2. **Heb je juridische termen correct uitgelegd volgens de bron?**
3. **Gebruik je géén verzonnen of ongeverifieerde informatie?**
4. **Zijn voorbeelden realistisch en neutraal?**
5. **Indien je iets niet zeker weet of het ontbreekt in de bron, geef dat expliciet aan.**
6. **Heb je spaties toegevoegd tussen tekst en cijfers waar nodig?**

### Structuur van je output:
- **Feitcode en overtreding** (met correcte spatiëring)
- **Boetebedrag** (indien beschikbaar in bronnen)
- **Wettelijke basis** (artikel + wet)
- **Uitleg in gewone taal** (alleen op basis van de bron)
- **Voorbeeldsituatie** (duidelijk aangeven dat het een voorbeeld is)
- **Bronverwijzing** (bijv. "volgens artikel 5 WVW 1994" of "feitcode N420")

**DISCLAIMER:** Voeg aan het einde toe: "⚠️ Let op: Deze informatie kan fouten bevatten. Controleer bij twijfel altijd officiële bronnen of raadpleeg een juridisch expert."

Als je een vraag niet met zekerheid kunt beantwoorden op basis van de bronnen, zeg dan:  
> "Op basis van de huidige bron(nen) kan hierover geen eenduidig antwoord worden gegeven."

Wees beknopt, feitelijk en precies. Geef liever minder informatie dan ongecontroleerde uitleg.`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, profile } = body

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Vraag is vereist' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key niet geconfigureerd' },
        { status: 500 }
      )
    }

    const systemPrompt = getBoetesSystemPrompt(profile)

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        max_tokens: 1000,
        temperature: 0.3,
        stream: false
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', response.status, errorData)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const completion = await response.json()
    const answer = completion.choices?.[0]?.message?.content

    if (!answer) {
      return NextResponse.json(
        { error: 'Geen antwoord gegenereerd' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      answer,
      question,
      profile,
      disclaimer: 'Gebaseerd op officiële Boetebase OM en Nederlandse wetgeving. Controleer altijd boetebase.om.nl voor actuele informatie.'
    })

  } catch (error) {
    console.error('Boetes question error:', error)
    
    // Specifieke error handling voor OpenAI
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI configuratiefout' },
          { status: 500 }
        )
      }
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'Te veel verzoeken. Probeer het later opnieuw.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het beantwoorden van je vraag' },
      { status: 500 }
    )
  }
} 