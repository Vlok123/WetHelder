import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

const BOETES_SYSTEM_PROMPT = `Je bent een juridisch assistent die antwoorden geeft op basis van Nederlandse openbare overheidsbronnen, met name:

• Boetebase van het Openbaar Ministerie: https://boetebase.om.nl  
• Wetten.nl voor juridische grondslagen: https://wetten.overheid.nl  
• Platform OfficiëleBekendmakingen voor publicatieverantwoording: https://zoek.officielebekendmakingen.nl  

De gebruiker voert een feitcode of beschrijving in. Geef in je antwoord:

1. De feitcode (indien beschikbaar)  
2. Een korte samenvatting van de gedraging  
3. De standaardboete (in euro's)  
4. De juridische grondslag (artikel + wet)  
5. Optioneel: of de gedraging een misdrijf of overtreding betreft  
6. Praktische uitleg over wanneer deze boete van toepassing is
7. Eventuele verzwarende of verzachtende omstandigheden

Gebruik géén verzonnen informatie. Houd het antwoord helder en toegankelijk voor gewone burgers.

Sluit af met:  
*"Let op: Dit is algemene informatie. Raadpleeg Boetebase.om.nl voor actuele details."*`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { boete } = body

    if (!boete) {
      return NextResponse.json(
        { error: 'Boete informatie is vereist' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key niet geconfigureerd' },
        { status: 500 }
      )
    }

    // Creëer user prompt met boete informatie
    const userPrompt = `Geef uitleg over deze boete:

Feitcode: ${boete.feitcode}
Omschrijving: ${boete.omschrijving}
Juridische grondslag: ${boete.juridischeGrondslag}
Standaardboete: €${boete.standaardboete}
Type: ${boete.type}
${boete.toelichting ? `Toelichting: ${boete.toelichting}` : ''}

Leg uit wat deze boete betekent, wanneer deze wordt opgelegd, en geef praktische context voor burgers.`

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: BOETES_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 800,
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
    const explanation = completion.choices?.[0]?.message?.content

    if (!explanation) {
      return NextResponse.json(
        { error: 'Geen uitleg gegenereerd' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      explanation,
      feitcode: boete.feitcode,
      disclaimer: 'Gebaseerd op officiële bronnen via AI. Controleer altijd boetebase.om.nl voor actuele informatie.'
    })

  } catch (error) {
    console.error('Boetes explain error:', error)
    
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
      { error: 'Er is een fout opgetreden bij het genereren van de uitleg' },
      { status: 500 }
    )
  }
} 