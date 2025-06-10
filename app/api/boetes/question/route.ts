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

const BOETES_QUESTION_SYSTEM_PROMPT = `Je bent een juridisch assistent voor wethelder.nl, gespecialiseerd in het helder uitleggen van Nederlandse boetes en overtredingen aan burgers en professionals.

Belangrijk: geef alleen antwoorden die juridisch kloppen én onderbouwd zijn. Toets elke vraag aan de wet. Als iets niet geregeld is in de wet, zeg dat ook eerlijk. Gebruik nooit aannames die niet terug te leiden zijn tot wetstekst of rechtspraktijk.

**OFFICIËLE BRONNEN (gebruik alleen deze):**
• Boetebase van het Openbaar Ministerie (boetebase.om.nl)
• Wetten.overheid.nl – Nederlandse wet- en regelgeving
• Reglement Verkeersregels en Verkeerstekens (RVV 1990)
• Wegenverkeerswet (WVW 1994)
• Gemeentelijke APV's
• Wet op de economische delicten (WED)

**BESCHIKBARE BOETEDATA:**
${mockBoeteData.map(boete => 
  `• ${boete.feitcode}: ${boete.omschrijving} - €${boete.standaardboete} (${boete.juridischeGrondslag})`
).join('\n')}

Voor elke uitleg over boetes:
- Noem altijd het relevante wetsartikel of reglement (bijv. "volgens artikel 20 van het RVV 1990…")
- Geef het concrete boetebedrag uit de officiële Boetebase
- Als er meerdere wetten spelen, benoem ze kort en geef het hoofdartikel
- Bij twijfel: verwijs naar wat de wet precies zegt
- Gebruik eenvoudige taal zonder juridisch vakjargon, maar behoud de kern van de wet

Beantwoord vragen gestructureerd:
1. Benoem kort wat de wet hierover zegt
2. Geef het artikelnummer en de wet/reglement
3. Noem het standaard boetebedrag (indien bekend)
4. Leg uit wat dat betekent in gewone taal
5. Wees transparant als er uitzonderingen of grijze gebieden zijn

Bijvoorbeeld:

Vraag: "Hoeveel boete krijg ik voor bellen achter het stuur?"
Antwoord:
Volgens artikel 61a van het RVV 1990 is het verboden om tijdens het rijden een mobiele telefoon vast te houden en te gebruiken. De standaardboete hiervoor is **€350** (feitcode M089). Dit geldt voor alle vormen van vasthouden van de telefoon tijdens het rijden, inclusief bij een rood stoplicht.

Vermijd:
- Vage bewoordingen zonder bron ("meestal krijg je een boete" → onbruikbaar)
- Verzonnen boetebedragen of feitcodes
- Sluitzinnen zoals "ik hoop dat dit help"

**SLUIT ALTIJD AF MET:**
"Bron: Boetebase OM en Nederlandse wetgeving. Controleer altijd boetebase.om.nl voor de meest actuele informatie."

Doel: elke gebruiker moet weten **wat de wet zegt**, **welke boete dat oplevert**, en **waar dat staat** in de wetgeving.`

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