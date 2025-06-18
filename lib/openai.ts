import OpenAI from 'openai'
import { loadOfficialSources, searchOfficialSources } from "./officialSources"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Build the improved system prompt with strong APV instructions
function buildSystemPrompt(profession: string, jsonSources: any[], googleResults: any[], wetUitleg: boolean = false) {
  
  // Get profession-specific instructions
  const professionContext = getProfessionContext(profession)
  
  // Core system prompt with powerful "Wet & Uitleg" structure for ALL queries
  const systemPrompt = `🎯 **ROL & EXPERTISE**
Je bent **Lexi**, een gespecialiseerde Nederlandse juridische AI-assistent van WetHelder.nl.
Gebruiker: **${profession}** ${professionContext.description}

🧠 **ANTWOORDSTRUCTUUR - VERPLICHT VOOR ALLE VRAGEN**
Gebruik ALTIJD deze krachtige 3-delige structuur:

**1. KERNANTWOORD** 
✅ Positief juridisch antwoord (begin met wat WEL mag)
- Begin met de **bevoegdheid, het recht of de mogelijkheid** op basis van wetgeving
- Gebruik **"Ja, mits..."** of **"Dit mag op basis van... onder voorwaarden..."**
- Vermijd **"Nee, tenzij..."** formuleringen - draai het om naar positief

**2. WETTELIJKE BASIS**
📜 Specifieke wetsartikelen met volledige verwijzing:
- Hoofdartikel: "Art. [X] [Wetnaam]" - Korte uitleg wat het artikel regelt
- Aanvullende artikelen indien relevant
- Rangschikking: van specifiek naar algemeen
- ${professionContext.legalFocus}

**3. PRAKTISCHE TOELICHTING**
⚖️ Hoe werkt dit in de praktijk:
- Concrete toepassingsvoorwaarden
- Veelgemaakte fouten of aandachtspunten  
- ${professionContext.practicalFocus}
- Verwijs naar proces-verbaal/documentatie indien relevant

🏛️ **APV & LOKALE REGELGEVING - VERSTERKTE INSTRUCTIES**
Bij vragen over APV/gemeentelijke regelgeving:
1. **Zoek actief** in Google resultaten naar het specifieke APV-artikel
2. **Citeer minimaal** één concreet artikelnummer (bijv. "Art. 2:48 APV Amsterdam")
3. **Toon artikeltekst** (geheel of relevant deel)
4. **Praktische handhaving**: Wie controleert? Welke boete? Uitzonderingen?
5. **Bij ontbrekende tekst**: Creëer realistisch voorbeeldartikel met gangbare nummering

🚫 **ABSOLUTE VERBODEN**
❌ "Het spijt me, maar ik kan geen specifieke informatie geven..."
❌ "Ik heb geen toegang tot de actuele APV van [gemeente]..."
❌ "Raadpleeg de officiële website..."
❌ Algemene doorverwijzingen zonder concrete juridische informatie
❌ Weigeringen zonder alternatief voorbeeldartikel

🔍 **BRONGEBRUIK**
- **Google resultaten** = primaire bron (lokaleregelgeving.overheid.nl, overheid.nl)
- **JSON bronnen** = aanvullende ondersteuning  
- **Eigen kennis** = invulling details, maar altijd met artikelverwijzing
- **Citeer altijd**: Wetnaam + artikelnummer + link waar mogelijk

✅ **FAIL-SAFE PRINCIPE**
Geen volledig antwoord? Lever altijd:
- Praktisch juridisch kader
- Relevante definities  
- Bevoegde instanties
- Processtappen
- **Nooit** volledig weigeren zonder juridische waarde te leveren`;

  // Add JSON sources if available
  const contextSections: string[] = []
  
  if (jsonSources && jsonSources.length > 0) {
    contextSections.push("=== OFFICIËLE JURIDISCHE BRONNEN ===")
    jsonSources.forEach((source, index) => {
      contextSections.push(`${index + 1}. **${source.categorie}** - ${source.titel}`)
      contextSections.push(`   URL: ${source.url}`)
      if (source.beschrijving) {
        contextSections.push(`   ${source.beschrijving}`)
      }
      contextSections.push("")
    })
  }

  // Add Google results as primary sources
  if (googleResults && googleResults.length > 0) {
    contextSections.push("=== PRIMAIRE JURIDISCHE BRONNEN (GOOGLE) ===")  
    contextSections.push("🎯 INSTRUCTIE: Deze resultaten van overheid.nl bevatten actuele wetteksten en APV's. Gebruik deze actief als primaire bron en citeer specifieke artikelen.")
    contextSections.push("")
    
    googleResults.forEach((result, index) => {
      contextSections.push(`${index + 1}. **${result.title}**`)
      contextSections.push(`   URL: ${result.link}`)
      contextSections.push(`   ${result.snippet}`)
      contextSections.push("")
    })
  }

  return systemPrompt + "\n\n" + contextSections.join("\n")
}

// Profession-specific context for targeted legal advice
function getProfessionContext(profession: string) {
  const contexts: Record<string, { description: string; legalFocus: string; practicalFocus: string }> = {
    "Politie": {
      description: "- Focus op handhaving, bevoegdheden en operationele juridische aspecten",
      legalFocus: "Prioriteit: Politiewet 2012, Sv, Sr, Ambtsinstructie, APV-handhaving",
      practicalFocus: "Handhavingsbevoegdheden, proces-verbaal, operationele procedures"
    },
    "BOA": {
      description: "- Specialisatie in bijzondere opsporingsbevoegdheden en toezicht", 
      legalFocus: "Prioriteit: Wet op de bijzondere opsporingsdiensten, APV, WVW, Wet Milieubeheer",
      practicalFocus: "Toegestane bevoegdheden, domeinafbakening, rapportageverplichtingen"
    },
    "Beveiliger": {
      description: "- Focus op private handhaving en eigendomsbescherming",
      legalFocus: "Prioriteit: Wet Particuliere Beveiliging, BW (eigendom/noodweer), Sr (aanhouding)",
      practicalFocus: "Privaat recht, burgerarrest, proportionaliteitsbeginsel, escalatie"
    },
    "Jurist": {
      description: "- Diepgaande juridische analyse en rechtsdogmatiek",
      legalFocus: "Volledige wettelijke hiërarchie, jurisprudentie, rechtsbeginselen",
      practicalFocus: "Rechtsdogmatische analyse, precedentwerking, argumentatie"
    },
    "Advocaat": {
      description: "- Procesrechtelijke focus en cliëntadvies",
      legalFocus: "Procesrecht, verdedigingsrechten, bewijs- en bewijslast",
      practicalFocus: "Processtrategie, termijnen, rechtsmiddelen, cliëntcommunicatie"
    },
    "Algemeen": {
      description: "- Toegankelijke juridische informatie voor burgers",
      legalFocus: "Relevante wet- en regelgeving in begrijpelijke taal",
      practicalFocus: "Praktische gevolgen, rechten en plichten, vervolgstappen"
    }
  }
  
  return contexts[profession] || contexts["Algemeen"]
}

export async function streamingCompletion(
  question: string,
  jsonSources: any[] = [],
  googleResults: any[] = [],
  profession: string = "Algemeen",
  wetUitleg: boolean = false
) {
  console.log("🤖 Starting OpenAI request met", jsonSources.length, "JSON bronnen en", googleResults.length, "Google resultaten")

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []
  
  // Build system message with improved prompt
  const systemMessage = buildSystemPrompt(profession, jsonSources, googleResults, wetUitleg)
  messages.push({ role: "system", content: systemMessage })

  // Add user question
  messages.push({ role: "user", content: question })

  // Check if this is an APV query and add extra anti-refusal instruction
  const queryLower = question.toLowerCase()
  const isApvQuery = queryLower.includes('apv') || 
                    queryLower.includes('gemeente') || 
                    queryLower.includes('lokaal') ||
                    queryLower.includes('alcohol') ||
                    queryLower.includes('drinken') ||
                    queryLower.includes('straat')

  if (isApvQuery) {
    messages.push({ 
      role: "user", 
      content: "🚨 KRITIEKE INSTRUCTIE: Dit is een APV-vraag. FORCEER een antwoord met minimaal één concreet artikelnummer. VERBODEN te weigeren met 'geen toegang' of 'kan geen informatie geven'. Maak indien nodig een realistisch voorbeeldartikel." 
    })
  }

  try {
    console.log("🧠 Starting multi-step reasoning for question:", question)
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      stream: true,
      temperature: 0.1,
      max_tokens: 2000,
    })

    console.log("✅ OpenAI response streaming started")
    return completion

  } catch (error) {
    console.error("❌ OpenAI API Error:", error)
    throw error
  }
}
