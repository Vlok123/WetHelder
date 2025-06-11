import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
    const { boete, context = {} } = await request.json()
    
    if (!boete) {
      return NextResponse.json(
        { error: 'Boete object is required' },
        { status: 400 }
      )
    }

    // Create context-aware prompt
    const contextInfo = context.voertuigType || context.situatie || context.locatie 
      ? `
Context van de gebruiker:
- Voertuig: ${context.voertuigType || 'niet gespecificeerd'}
- Situatie: ${context.situatie || 'niet gespecificeerd'}  
- Locatie: ${context.locatie || 'niet gespecificeerd'}
      ` : ''

    const systemPrompt = `Je bent een juridische expert gespecialiseerd in Nederlandse verkeersovertredingen.
Geef een uitgebreide, praktische uitleg over de volgende overtreding.

${contextInfo}

Overtreding details:
- Feitcode: ${boete.feitcode}
- Omschrijving: ${boete.omschrijving}
- Juridische grondslag: ${boete.juridischeGrondslag}
- Standaard boete: €${boete.standaardboete}
- Type: ${boete.type}
${boete.toelichting ? `- Toelichting: ${boete.toelichting}` : ''}

Behandel de volgende aspecten in je uitleg:
1. Wat houdt deze overtreding precies in?
2. Wanneer wordt deze feitcode toegepast?
3. Zijn er uitzonderingen of bijzondere omstandigheden?
4. Wat zijn de gevolgen (boete, punten, etc.)?
5. Praktische tips om dit te voorkomen
6. Hoe wordt dit gehandhaafd?
${contextInfo ? '7. Specifiek advies gebaseerd op de context van de gebruiker' : ''}

Houd je antwoord praktisch, begrijpelijk en accuraat. Verwijs naar de officiele feitcode ${boete.feitcode}.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Leg feitcode ${boete.feitcode} uit met alle relevante details en praktische informatie.`
        }
      ],
      max_tokens: 1200,
      temperature: 0.3,
    })

    const explanation = completion.choices[0]?.message?.content || 
      'Kon geen uitleg genereren. Raadpleeg de officiële Boetebase voor meer informatie.'

    return NextResponse.json({
      explanation,
      feitcode: boete.feitcode,
      context: context
    })

  } catch (error) {
    console.error('Explanation error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het genereren van de uitleg' },
      { status: 500 }
    )
  }
} 