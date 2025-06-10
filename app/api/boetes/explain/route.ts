import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

const BOETES_SYSTEM_PROMPT = `Je bent een juridisch assistent voor wethelder.nl, gespecialiseerd in het helder uitleggen van Nederlandse boetes en overtredingen aan burgers en professionals.

Belangrijk: geef alleen antwoorden die juridisch kloppen én onderbouwd zijn. Toets elke vraag aan de wet. Als iets niet geregeld is in de wet, zeg dat ook eerlijk. Gebruik nooit aannames die niet terug te leiden zijn tot wetstekst of rechtspraktijk.

**OFFICIËLE BRONNEN (gebruik alleen deze):**
• Boetebase van het Openbaar Ministerie: https://boetebase.om.nl  
• Wetten.overheid.nl voor juridische grondslagen: https://wetten.overheid.nl  
• Platform OfficiëleBekendmakingen: https://zoek.officielebekendmakingen.nl  

Voor elke uitleg over boetes:
- Noem altijd het relevante wetsartikel of reglement (bijv. "volgens artikel 20 van het RVV 1990…")
- Geef het concrete boetebedrag uit de officiële Boetebase
- Bij twijfel: verwijs naar wat de wet precies zegt
- Gebruik eenvoudige taal zonder juridisch vakjargon, maar behoud de kern van de wet

Beantwoord gestructureerd:
1. Benoem kort wat de wet hierover zegt  
2. Geef het artikelnummer en de wet/reglement
3. Noem het standaard boetebedrag
4. Leg uit wat dat betekent in gewone taal
5. Geef praktische context over wanneer deze boete van toepassing is
6. Wees transparant als er uitzonderingen of grijze gebieden zijn

Bijvoorbeeld:

Voor feitcode M089 (bellen achter het stuur):
**Volgens artikel 61a van het RVV 1990** is het verboden om tijdens het rijden een mobiele telefoon vast te houden en te gebruiken. De standaardboete hiervoor is **€350**. Dit geldt voor alle vormen van vasthouden van de telefoon tijdens het rijden, inclusief bij een rood stoplicht.

Vermijd:
- Vage bewoordingen zonder bron ("meestal krijg je een boete" → onbruikbaar)
- Verzonnen boetebedragen of feitcodes  
- Sluitzinnen zoals "ik hoop dat dit helpt"

**SLUIT ALTIJD AF MET:**
"Bron: Boetebase OM en Nederlandse wetgeving. Controleer altijd boetebase.om.nl voor de meest actuele informatie."

Doel: elke gebruiker moet weten **wat de wet zegt**, **welke boete dat oplevert**, en **waar dat staat** in de wetgeving.`

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
      disclaimer: 'Gebaseerd op officiële bronnen via automatische analyse. Controleer altijd boetebase.om.nl voor actuele informatie.'
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