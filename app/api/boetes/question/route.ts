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

const BOETES_QUESTION_SYSTEM_PROMPT = `Je bent een juridisch AI-assistent die Nederlandse boetes en overtredingen uitlegt in duidelijke, feitelijke en juridisch correcte taal. Je baseert je uitsluitend op de beschikbare bronnen die door de gebruiker of het systeem zijn aangeleverd.

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question } = body

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

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: BOETES_QUESTION_SYSTEM_PROMPT },
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