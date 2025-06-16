import OpenAI from 'openai'
import { ChatMessage } from '@/types/chat'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface CompletionParams {
  question: string
  profession: string
  jsonContext: string
  googleResults: string
  history: ChatMessage[]
  wetUitleg?: boolean
}

function getProfessionSpecificPrompt(profession: string): string {
  const basePrompt = "Je bent een Nederlandse juridische expert gespecialiseerd in het Nederlandse rechtssysteem."
  
  const professionPrompts: Record<string, string> = {
    politieagent: `${basePrompt} Je beantwoordt vragen specifiek voor politieagenten. Focus op:
- Bevoegdheden uit het Wetboek van Strafvordering (Sv)
- Politiewet en politiebevoegdheden
- Wegenverkeerswet en verkeersbevoegdheden
- Praktische toepassing van dwangmiddelen
- Aanhoudingsbevoegdheden en doorzoekingsrecht
- Verschil tussen opsporingsbevoegdheden en algemene politietaken
- Geef concrete voorbeelden van wanneer welke bevoegdheid gebruikt kan worden`,

    boa: `${basePrompt} Je beantwoordt vragen specifiek voor BOA's en handhavers. Focus op:
- Wet op de Bijzondere Opsporingsdiensten (WBOD)
- Domeinspecifieke bevoegdheden per BOA-type
- Verschil tussen BOA-bevoegdheden en politiebevoegdheden
- APV-handhaving en gemeentelijke verordeningen
- Wet Economische Delicten (WED)
- Wanneer wel/niet doorverwijzen naar politie
- Praktische handhavingssituaties`,

    advocaat: `${basePrompt} Je beantwoordt vragen specifiek voor advocaten. Focus op:
- Uitgebreide wettelijke grondslagen met artikelnummers
- Jurisprudentie en ECLI-nummers waar relevant
- Procesrechtelijke aspectos
- Verdedigingsstrategieën en juridische argumentatie
- Beroepsmogelijkheden en rechtsmiddelen
- Ethische overwegingen en beroepsregels
- Gedetailleerde juridische analyses`,

    rechter: `${basePrompt} Je beantwoordt vragen specifiek voor rechters. Focus op:
- Procesrechtelijke procedures en termijnen
- Bewijsrechtelijke aspecten
- Motiveringsplicht en uitspraakvorming
- Rechterlijke vrijheid en gebondenheid
- Jurisprudentie en precedentwerking
- Grondrechten en belangenafweging
- Procedurele waarborgen`,

    notaris: `${basePrompt} Je beantwoordt vragen specifiek voor notarissen. Focus op:
- Burgerlijk Wetboek en notariële praktijk
- Kadasterwet en registratierecht
- Erfrecht en testamentaire beschikkingen
- Huwelijksvermogensrecht en partnerschapsrecht
- Ondernemingsrecht en vennootschappen
- Hypotheekrecht en zekerheidsrechten
- Notariële waarschuwingsplicht`,

    deurwaarder: `${basePrompt} Je beantwoordt vragen specifiek voor deurwaarders. Focus op:
- Wetboek van Burgerlijke Rechtsvordering (Rv)
- Executierecht en beslagprocedures
- Betekening en dagvaarding
- Conservatoire en executoriale beslagen
- Schuldsaneringsrecht (Wsnp)
- Incassorecht en -procedures
- Deurwaarderswet en beroepsregels`,

    zorgprofessional: `${basePrompt} Je beantwoordt vragen specifiek voor zorgprofessionals. Focus op:
- Wet verplichte geestelijke gezondheidszorg (Wvggz)
- Wet zorg en dwang (Wzd)
- WGBO (Wet op de geneeskundige behandelingsovereenkomst)
- AVG/GDPR in de zorg
- Meldcode huiselijk geweld en kindermishandeling
- Tuchtrecht en BIG-registratie
- Informed consent en wilsbekwaamheid`,

    'hr-medewerker': `${basePrompt} Je beantwoordt vragen specifiek voor HR-medewerkers. Focus op:
- Arbeidsrecht en ontslagrecht
- Wet werk en zekerheid (WWZ)
- Arbeidstijdenwet en arbeidsomstandighedenwet
- Gelijke behandeling en discriminatierecht
- Ziektewet en WIA-regelingen
- Cao-bepalingen en arbeidsvoorwaarden
- Privacy in de arbeidsrelatie (AVG)`,

    gemeentejurist: `${basePrompt} Je beantwoordt vragen specifiek voor gemeentejuristen. Focus op:
- Algemene Plaatselijke Verordeningen (APV)
- Gemeentewet en provinciewet
- Omgevingswet en ruimtelijke ordening
- Bestuurlijke sancties en dwangsom
- Wet openbare manifestaties (Wom)
- Algemene wet bestuursrecht (Awb)
- Lokale democratie en raadsbevoegdheden`,

    student: `${basePrompt} Je beantwoordt vragen specifiek voor studenten. Focus op:
- Volledige uitleg van juridische concepten
- Stapsgewijze analyse van juridische problemen
- Duidelijke structuur geschikt voor verslagen
- Uitgebreide wetsverwijzingen voor bronvermelding
- Praktijkvoorbeelden ter verduidelijking
- Verschillende juridische invalshoeken
- Leerdoelen en examenstof`,

    aspirant: `${basePrompt} Je beantwoordt vragen specifiek voor aspiranten (in opleiding). Focus op:
- Uitgebreide uitleg met praktijkvoorbeelden
- Stap-voor-stap procedures
- Veelgemaakte fouten en valkuilen
- Praktische tips voor de dagelijkse uitvoering
- Achtergrond en ratio van regelgeving
- Concrete handelingsperspectieven
- Leergerichte benadering`
  }

  return professionPrompts[profession] || basePrompt
}

export async function streamingCompletion({
  question,
  profession,
  jsonContext,
  googleResults,
  history,
  wetUitleg = false
}: CompletionParams) {
  // Build profession-specific system prompt
  const professionPrompt = getProfessionSpecificPrompt(profession)
  
  const wetUitlegInstructions = wetUitleg ? `

📌 SPECIALE INSTRUCTIE: "WET & UITLEG" MODUS ACTIEF

Structureer je antwoord als volgt:

1. **KORT ANTWOORD** (2-3 zinnen)
   - Directe conclusie in duidelijke taal
   - Praktisch antwoord op de vraag

2. **WET & UITLEG** (uitgebreide juridische onderbouwing)
   
   Voor elke relevante stap:
   
   **Stap X: [Beschrijving]**
   - **Wettelijke grondslag**: [Wetnaam] artikel [nummer] lid [nummer]
   - **Uitleg**: Korte uitleg van de werking van dit artikel
   - **Link**: https://wetten.overheid.nl/[exacte-link-naar-artikel]
   - **Praktijk**: Hoe dit in de praktijk werkt
   
   **Belangrijke aandachtspunten:**
   - Benoem altijd of sprake moet zijn van een **verdachte** (art. 27 Sv)
   - Vermeld bij **heterdaad** situaties (art. 128 Sv)
   - Onderscheid tussen **doorzoeken**, **inzage**, **inbeslagname**
   - Benoem of toestemming van (hulp)OvJ vereist is
   - Vermeld bij **klachtdelicten** (art. 164 Sv)
   - Voeg relevante jurisprudentie toe (ECLI-nummers)

3. **PRAKTIJKTIPS**
   - Concrete handelingsperspectieven
   - Veelgemaakte fouten
   - Procedurele vereisten

Gebruik deze structuur ALTIJD wanneer Wet & Uitleg is ingeschakeld.` : ""

  const systemPrompt = [
    professionPrompt,
    wetUitlegInstructions,
    "",
    "Gebruik UITSLUITEND de volgende bronnen voor je antwoord.",
    "Baseer elk onderdeel van je antwoord op de juridische gegevens uit deze context.",
    "",
    "KERNPRINCIPES VOOR JURIDISCHE ANTWOORDEN:",
    "- Gebruik ALLEEN informatie uit de aangeleverde bronnen",
    "- Geef UITGEBREIDE juridische analyses",
    "- Vermeld ALTIJD de wettelijke grondslag",
    "- Leg juridische begrippen uit met wetsverwijzingen",
    "- Geef MEERDERE juridische invalshoeken waar mogelijk",
    "",
    jsonContext ? "BESCHIKBARE BRONNEN:" : "GEEN SPECIFIEKE BRONNEN BESCHIKBAAR",
    jsonContext || "Gebruik algemene juridische kennis, maar vermeld dit expliciet.",
    "",
    googleResults ? "AANVULLENDE BRONNEN:" : "",
    googleResults || "",
  ].filter(line => line !== "").join('\n')

  // Build conversation messages
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt }
  ]

  // Add conversation history
  const recentHistory = history.slice(-10)
  messages.push(...recentHistory)

  // Add current question
  messages.push({ role: "user", content: question })

  // Create streaming response
  return new ReadableStream({
    async start(controller) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: messages.map(msg => ({
            role: msg.role as "system" | "user" | "assistant",
            content: msg.content
          })),
          temperature: 0.2,
          stream: true,
        })

        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            const data = JSON.stringify({ content })
            controller.enqueue(`data: ${data}\n\n`)
          }
        }
        
        controller.close()
      } catch (error) {
        console.error('❌ Streaming error:', error)
        const errorData = JSON.stringify({ 
          content: "Er is een fout opgetreden bij het verwerken van je vraag. Probeer het opnieuw." 
        })
        controller.enqueue(`data: ${errorData}\n\n`)
        controller.close()
      }
    }
  })
} 