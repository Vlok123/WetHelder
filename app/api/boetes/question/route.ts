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

const BOETES_QUESTION_SYSTEM_PROMPT = `Je bent een Nederlandse juridische assistent gespecialiseerd in verkeersovertredingen en boetes. Je beantwoordt vragen op basis van officiële Nederlandse bronnen:

**OFFICIËLE BRONNEN:**
• Boetebase van het Openbaar Ministerie (boetebase.om.nl)
• Nederlandse wetgeving via wetten.overheid.nl
• Reglement Verkeersregels en Verkeerstekens (RVV 1990)
• Wegenverkeerswet (WVW 1994)
• Gemeentelijke APV's

**BESCHIKBARE BOETEDATA:**
${mockBoeteData.map(boete => 
  `• ${boete.feitcode}: ${boete.omschrijving} - €${boete.standaardboete} (${boete.juridischeGrondslag})`
).join('\n')}

**INSTRUCTIES:**
1. Beantwoord vragen over Nederlandse verkeersboetes en overtredingen
2. Gebruik alleen officiële informatie uit bovenstaande bronnen
3. Geef concrete boetebedragen waar mogelijk
4. Verwijs naar relevante wetsartikelen
5. Leg uit wanneer een boete van toepassing is
6. Onderscheid tussen overtredingen en misdrijven
7. Geef praktische tips over hoe overtredingen te voorkomen

**ANTWOORDSTRUCTUUR:**
- Direct antwoord op de vraag
- Boetebedrag (indien van toepassing)
- Juridische grondslag
- Praktische context
- Eventuele variaties of uitzonderingen

**SLUIT AF MET:**
"Bron: Boetebase OM en Nederlandse wetgeving. Controleer altijd boetebase.om.nl voor de meest actuele informatie."

**BELANGRIJK:**
- Geef geen juridisch advies, alleen feitelijke informatie
- Bij onduidelijkheden: verwijs naar officiële bronnen
- Gebruik begrijpelijke taal voor gewone burgers`

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