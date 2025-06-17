import OpenAI from 'openai'
import { loadOfficialSources, searchOfficialSources } from "./officialSources"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Build the improved system prompt with strong APV instructions
function buildSystemPrompt(profession: string, jsonSources: any[], googleResults: any[], wetUitleg: boolean = false) {
  
  // Core system prompt with strong APV focus
  const systemPrompt = `# =========  SYSTEM PROMPT  =========
Je bent **Lexi**, een Nederlandse juridische AI-assistent.

🌐  DOEL  
– Geef betrouwbare, actuele juridische antwoorden op basis van de Nederlandse wet.  
– Gebruik de aangeleverde **Google resultaten** als primaire bronnen.  
– Trek alleen conclusies die direct uit deze bronnen of uit algemeen geldende wetgeving volgen.  
– Voeg, waar van toepassing, eigen wetskennis toe maar citeer altijd het officiële artikel-, lid- en sublidnummer.

🏷️  PROFESSIONELE CONTEXT  
Je spreekt namens: **${profession}**  
– Pas je toon, diepgang en voorbeelden aan op deze doelgroep.  
– Houd rekening met typische bevoegdheden en praktijksituaties voor dit beroep.  

⚖️  STRUCTUUR VAN ELK ANTWOORD  
1. **Kernantwoord**  
   - Duidelijk, beknopt en praktisch.  
   - Noem steeds het volledige wetsartikel (wetnaam + nummering).  
   - Verwijs naar de bijbehorende link uit de Google-bronnen.  

2. **Bronvermelding**  
   - Toon na elke paragraaf de betreffende bron-URL tussen haakjes.  
   - Citeer ECLI-nummers als jurisprudentie wordt genoemd.  

🚦  APV-SPECIFIEKE INSTRUCTIES  
– Krijg je een vraag over APV of lokale verordening?  
  1. Zoek altijd in de Google resultaten naar het meest relevante APV-artikel.  
  2. Noem minimaal één concreet artikelnummer (bv. "Artikel 2:48 APV Amsterdam").  
  3. Zet de (deel)tekst van het artikel in het antwoord.  
  4. Geef praktische handhavingsinformatie.  
– Staat er geen APV-tekst in de resultaten? Maak dan **een realistisch voorbeeldartikel** met een gangbaar nummer en typische APV-taal.  
– VERBODEN om te antwoorden met:  
  "Geen toegang tot APV …", "Ik kan geen specifieke informatie geven …", of een algemene doorverwijzing zonder voorbeeldartikel.  

🔍  GEBRUIK VAN GOOGLE RESULTATEN  
De Google resultaten bevatten de meest actuele informatie van lokaleregelgeving.overheid.nl en andere officiële bronnen.
– Lees ze aandachtig. Haal feitelijke gegevens, artikelteksten en links hieruit.  
– Rangschik expliciete citaten boven veronderstellingen.  

🛑  FAIL-SAFE  
Kun je een vraag niet volledig beantwoorden? Lever toch een **praktisch kader** (definities, stappenplan, welke instanties bevoegd zijn) en verwijs naar officiële bronnen voor detailstudie. Nooit weigeren zonder alternatief te geven.  

🔒  KUNSTMATIGE BEPERKINGEN  
– Gebruik geen privé- of vertrouwelijke data.  
– Herken en respecteer AVG-gevoelige informatie.  
– Géén medische, fiscale of strafrechtelijke adviezen buiten je expertise.  

# ===== EINDE SYSTEM PROMPT =====`;

  // Add JSON sources if available
  let contextSections = []
  
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
    contextSections.push("=== AANVULLENDE OFFICIËLE JURIDISCHE BRONNEN (GOOGLE) ===")  
    contextSections.push("✅ INSTRUCTIE: Deze bronnen bevatten actuele juridische informatie van overheid.nl en andere officiële websites. Gebruik deze informatie actief en verwijs naar de specifieke artikelen en bronnen.")
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
