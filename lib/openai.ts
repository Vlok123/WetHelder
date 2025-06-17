import OpenAI from 'openai'
import { ChatMessage } from '@/types/chat'
import { performContextAnalysis } from './contextAnalysis'
import type { ActualiteitsWaarschuwing, WetUpdate } from './officialSources'

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
  actualiteitsWaarschuwingen?: ActualiteitsWaarschuwing[]
  wetUpdates?: WetUpdate[]
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
- Wet op de Bijzondere Opsporingsdiensten (WBOD) - bevoegdheden en grenzen
- Domeinspecifieke bevoegdheden per BOA-type - welke bevoegdheden bij welk domein
- Verschil tussen BOA-bevoegdheden en politiebevoegdheden - wanneer doorverwijzen
- APV-handhaving en gemeentelijke verordeningen - praktische toepassing
- Wet Economische Delicten (WED) - economische overtredingen
- Wanneer wel/niet doorverwijzen naar politie - escalatieprocedures
- Praktische handhavingssituaties - concrete voorbeelden
- Proces-verbaal opmaken - vereisten en procedures
- Bestuurlijke sancties vs strafrechtelijke vervolging
- Voor specifieke APV-bepalingen: raadpleeg LokaleRegelgeving.Overheid.nl`,

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
- Algemene Plaatselijke Verordeningen (APV) - structuur, bevoegdheden en handhaving
- Gemeentewet en provinciewet - bestuurlijke organisatie en bevoegdheden
- Omgevingswet en ruimtelijke ordening - vergunningen en handhaving
- Bestuurlijke sancties en dwangsom - procedures en rechtsbescherming
- Wet openbare manifestaties (Wom) - demonstratierecht en openbare orde
- Algemene wet bestuursrecht (Awb) - bestuursprocedures en rechtsbescherming
- Lokale democratie en raadsbevoegdheden - besluitvorming en controle
- APV-handhaving door BOA's en politie - bevoegdheidsverdeling
- Bestuursdwang en last onder dwangsom - toepassing en procedures
- Voor specifieke APV-bepalingen: verwijs naar LokaleRegelgeving.Overheid.nl`,

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
  wetUitleg = false,
  actualiteitsWaarschuwingen = [],
  wetUpdates = []
}: CompletionParams) {
  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key-here') {
    console.error('❌ OpenAI API key not configured')
    throw new Error('OpenAI API key is niet geconfigureerd. Neem contact op met de beheerder.')
  }
  // Phase 1: Perform advanced context analysis
  console.log('🧠 Starting multi-step reasoning for question:', question)
  const contextAnalysis = performContextAnalysis(question)
  
  if (contextAnalysis.contexts.length > 0) {
    console.log('🎯 Detected specialized contexts:', contextAnalysis.contexts)
    console.log('📋 Special rules identified:', contextAnalysis.analysis.specialRules.length)
    console.log('⚖️ Legal principles:', contextAnalysis.analysis.legalPrinciples.length)
  } else {
    console.log('ℹ️ No specialized contexts detected, using standard processing')
  }

  // Build profession-specific system prompt
  const professionPrompt = getProfessionSpecificPrompt(profession)
  
  const wetUitlegInstructions = wetUitleg ? `

📌 **WET & UITLEG MODUS ACTIEF** - Geef uitgebreide juridische onderbouwing

**STRUCTUUR VAN JE ANTWOORD:**

1. **STANDAARD ANTWOORD** (zoals normaal)
   - Geef eerst het volledige, normale juridische antwoord
   - Gebruik dezelfde kwaliteit en diepgang als zonder Wet & Uitleg
   - Beantwoord de vraag volledig zoals gebruikelijk

2. **AANVULLENDE WET & UITLEG SECTIE**
   
   Voeg daarna toe:
   
   ---
   
   ## 📚 **UITGEBREIDE WET & UITLEG**
   
   ### **Gedetailleerde Artikelanalyse:**
   Voor elk gebruikt artikel:
   - **[Wetnaam] artikel [volledige nummering]**: Volledige tekst van het artikel
   - **Uitleg**: Gedetailleerde uitleg van elk lid en onderdeel
   - **Link**: https://wetten.overheid.nl/[exacte-link]
   - **Interpretatie**: Hoe dit artikel in de praktijk wordt toegepast
   
   ### **Aanvullende Juridische Aspecten:**
   - **Procesrecht**: Relevante procedurele bepalingen
   - **Uitzonderingen**: Specifieke uitzonderingen en bijzondere gevallen
   - **Samenloop**: Hoe artikelen op elkaar inwerken
   - **Bevoegdheden**: Wie is bevoegd en onder welke voorwaarden
   
   ### **Jurisprudentie & Praktijkvoorbeelden:**
   - **Belangrijke uitspraken**: ECLI-nummers met korte uitleg
   - **Praktijkcasus**: Concrete voorbeelden uit de rechtspraktijk
   - **Veelgemaakte fouten**: Wat vaak misgaat in de praktijk
   
   ### **Vervolgstappen & Aandachtspunten:**
   - **Procedurele vereisten**: Wat moet er allemaal gebeuren
   - **Termijnen**: Relevante termijnen en deadlines
   - **Rechtsmiddelen**: Mogelijke bezwaar- en beroepsprocedures
   
   **BELANGRIJK:** Het standaard antwoord blijft leidend. Deze sectie is puur aanvullend en verdiepend.` : ""

  // Build actualiteitscontrole section
  let actualiteitsSection = ""
  if (actualiteitsWaarschuwingen.length > 0 || wetUpdates.length > 0) {
    const actualiteitsLines = ["🚨 **KRITIEKE ACTUALITEITSCONTROLE** - VERPLICHT TE VERMELDEN:", ""]
    
    if (actualiteitsWaarschuwingen.length > 0) {
      actualiteitsLines.push("**ACTUELE WIJZIGINGEN:**")
      actualiteitsWaarschuwingen.forEach(waarschuwing => {
        actualiteitsLines.push(`⚠️ ${waarschuwing.urgentie}: ${waarschuwing.onderwerp}`)
        actualiteitsLines.push(`   Status: ${waarschuwing.huidigeStatus}`)
        actualiteitsLines.push(`   Datum wijziging: ${waarschuwing.wijzigingsDatum.toLocaleDateString('nl-NL')}`)
        if (waarschuwing.bronUrl) {
          actualiteitsLines.push(`   Bron: ${waarschuwing.bronUrl}`)
        }
        actualiteitsLines.push("")
      })
    }
    
    if (wetUpdates.length > 0) {
      actualiteitsLines.push("**VEROUDERDE INFORMATIE GEDETECTEERD:**")
      wetUpdates.forEach(update => {
        actualiteitsLines.push(`❌ FOUT: "${update.oudArtikel}"`)
        actualiteitsLines.push(`✅ CORRECT: "${update.nieuwArtikel}"`)
        actualiteitsLines.push(`   Datum wijziging: ${update.datumWijziging.toLocaleDateString('nl-NL')}`)
        if (update.toelichting) {
          actualiteitsLines.push(`   Toelichting: ${update.toelichting}`)
        }
        actualiteitsLines.push("")
      })
    }
    
    actualiteitsLines.push("**INSTRUCTIE: GEBRUIK ALTIJD DE ACTUELE INFORMATIE HIERBOVEN. Vermeld expliciet als er recente wijzigingen zijn geweest.**")
    actualiteitsLines.push("")
    
    actualiteitsSection = actualiteitsLines.join('\n')
  }

  // Phase 2: Build base system prompt
  const baseSystemPrompt = [
    professionPrompt,
    wetUitlegInstructions,
    "",
    actualiteitsSection,
    "Gebruik UITSLUITEND de volgende bronnen voor je antwoord.",
    "Baseer elk onderdeel van je antwoord op de juridische gegevens uit deze context.",
    "",
    "STRIKTE REGELS VOOR JURIDISCHE ANTWOORDEN:",
    "",
    "🚨 **VERBODEN ANTWOORDEN - NOOIT GEBRUIKEN:**",
    "❌ 'Het spijt me, maar ik kan geen specifieke informatie geven...'",
    "❌ 'Ik heb geen toegang tot de actuele APV van [gemeente]...'", 
    "❌ 'Raadpleeg de officiële website van de gemeente...'",
    "❌ 'Neem contact op met de gemeente voor actuele informatie...'",
    "",
    "✅ **VERPLICHTE WERKWIJZE:**",
    "1. Als er Google resultaten zijn met APV artikelen → GEBRUIK DEZE DIRECT",
    "2. Citeer ALTIJD specifieke artikelnummers uit de gevonden bronnen",
    "3. Voor APV vragen: Noem MINIMAAL 2-3 relevante artikelen met nummers",
    "4. Geef de VOLLEDIGE artikeltekst of relevante delen daarvan",
    "5. Verwijs naar de exacte bron-URL uit de aangeleverde resultaten",
    "",
    "⚡ **VOORBEELD CORRECT ANTWOORD:**",
    "'Volgens artikel 2:48 van de APV Nijmegen is het verboden om alcoholhoudende drank te nuttigen op openbare plaatsen...'",
    "",
    "- Gebruik ALLEEN informatie uit de aangeleverde OFFICIËLE JURIDISCHE BRONNEN sectie",
    "- BELANGRIJK: Voor APV-vragen en lokale regelgeving, gebruik actief de gevonden bronnen van lokaleregelgeving.overheid.nl",
    "- Verwijs specifiek naar artikelnummers en wettelijke bepalingen uit de aangeleverde bronnen",
    "- Als er actualiteitscontrole informatie is: vermeld dit PROMINENTAAL in je antwoord",
    wetUitleg ? "- WET & UITLEG ACTIEF: Vermeld meer artikelnummers, specifieke juridische details en praktijkvoorbeelden" : "",
    wetUitleg ? "- Geef volledige artikelteksten waar relevant" : "",
    wetUitleg ? "- Voeg extra jurisprudentie toe (ECLI-nummers)" : "",
    wetUitleg ? "- Benoem verwante artikelen en procedurele aspecten" : "",
    "",
    jsonContext ? "=== OFFICIËLE JURIDISCHE BRONNEN (GEBRUIK ALLEEN DEZE BRONNEN) ===" : "=== GEEN OFFICIËLE JURIDISCHE BRONNEN BESCHIKBAAR ===",
    jsonContext || "⚠️ INSTRUCTIE: Gebruik algemene juridische kennis uit Nederlandse wetgeving, maar vermeld GEEN specifieke websites of externe bronnen.",
    "",
    googleResults ? "=== AANVULLENDE OFFICIËLE JURIDISCHE BRONNEN ===" : "",
    googleResults ? `${googleResults}\n\n✅ INSTRUCTIE: Deze bronnen bevatten actuele juridische informatie van overheid.nl en andere officiële websites. Gebruik deze informatie actief en verwijs naar de specifieke artikelen en bronnen.` : "",
  ].filter(line => line !== "").join('\n')

  // Phase 3: Apply context analysis and build enhanced prompt
  const systemPrompt = contextAnalysis.contexts.length > 0 
    ? contextAnalysis.enhancedPrompt(baseSystemPrompt)
    : baseSystemPrompt

  if (contextAnalysis.contexts.length > 0) {
    console.log('🚀 Enhanced prompt activated with specialized context analysis')
  }

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
        let errorMessage = "Er is een fout opgetreden bij het verwerken van je vraag. Probeer het opnieuw."
        
        if (error instanceof Error) {
          if (error.message.includes('API key')) {
            errorMessage = "⚠️ **Configuratiefout**: De OpenAI API key is niet correct geconfigureerd. Neem contact op met de beheerder."
          } else if (error.message.includes('quota')) {
            errorMessage = "⚠️ **API Limiet**: De API limiet is bereikt. Probeer het later opnieuw."
          } else if (error.message.includes('rate limit')) {
            errorMessage = "⚠️ **Te veel verzoeken**: Wacht even en probeer het opnieuw."
          } else {
            errorMessage = `⚠️ **Fout**: ${error.message}`
          }
        }
        
        const errorData = JSON.stringify({ content: errorMessage })
        controller.enqueue(`data: ${errorData}\n\n`)
        controller.close()
      }
    }
  })
} 