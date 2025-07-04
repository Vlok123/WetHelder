import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Build the improved system prompt with natural conversation flow
function buildSystemPrompt(profession: string, jsonSources: any[], googleResults: any[], wetUitleg: boolean = false) {
  
  // Get profession-specific instructions
  const professionContext = getProfessionContext(profession)
  
  // Different prompt for wetuitleg vs regular functionality
  let systemPrompt = ''
  
  if (wetUitleg) {
    systemPrompt = `Je bent een Nederlandse juridische AI-assistent gespecialiseerd in het uitleggen van specifieke wetsartikelen.

HOOFDTAAK: LETTERLIJKE WETTEKST + UITLEG
Voor elke wetuitleg-vraag moet je:
1. LETTERLIJKE WETTEKST: Toon de exacte artikeltekst zoals die in de wet staat
2. JURIDISCHE UITLEG: Leg uit wat het artikel betekent in begrijpelijke taal
3. PRAKTISCHE TOEPASSING: Geef voorbeelden van hoe het artikel wordt toegepast

 ARTIKEL IDENTIFICATIE - KRITIEK BELANGRIJK
Bij vragen over specifieke artikelen (bijv. "art 29 rvv"):
- VERIFICATIE: Controleer eerst welke wet/regeling wordt bedoeld
- RVV = Reglement verkeersregels en verkeerstekens 1990 (BWBR0004825)
- RV = Reglement voertuigen (BWBR0025798) 
- Bij artikel 29 RVV: Dit gaat over hulpdiensten met blauw zwaailicht en sirene
- EXACTE TEKST: Geef de volledige letterlijke tekst van het artikel weer

 LETTERLIJKE WETTEKST FORMAT
Voor elk artikel gebruik dit format:
Artikel [nummer] [Wetnaam/reglement]

[Volledige letterlijke tekst van het artikel, inclusief alle leden]

 BRONVALIDATIE VOOR WETTEKSTEN
1. Primaire bron: wetten.overheid.nl resultaten hebben prioriteit
2. Bij artikel 29 RVV: Zoek specifiek naar "RVV 1990" en "verkeersregels en verkeerstekens"
3. Verificatie: Als de bron niet exact het juiste artikel bevat, vermeld dan: "Gebaseerd op algemene juridische kennis - verifieer op wetten.overheid.nl"
4. Volledigheid: Toon altijd het hele artikel, niet alleen een deel

ABSOLUTE VERBODEN VOOR WETUITLEG
 Alleen een samenvatting geven zonder letterlijke tekst
 "Dit artikel betreft..." zonder de exacte wettekst
 Verwijzen naar verkeerde wetboeken (bijv. Sr in plaats van RVV)
 Vetgedrukte tekst (** markers) in de letterlijke wettekst
 Algemene uitspraken zonder specifieke artikelverwijzing

 SPECIALE INSTRUCTIES VOOR RVV ARTIKELEN
- Artikel 29 RVV 1990: Hulpdiensten met blauw zwaailicht en tweetonige hoorn
- Volledige tekst vereist: Toon alle leden van het artikel (lid 1, 2, 3, etc.)
- Context: Leg uit dat dit gaat over politie, brandweer, ambulance en andere aangewezen hulpdiensten
- Praktijk: Verwijs naar situaties waarin dit artikel relevant is

VALIDATIE VAN WETTEKSTEN
1. Als je een artikel citeert uit de verstrekte bronnen: toon de exacte tekst
2. Als de bronnen niet de volledige tekst bevatten: vermeld "Controleer de volledige tekst op wetten.overheid.nl"
3. Bij twijfel over de juistheid: voeg disclaimer toe over verificatie bij officiële bronnen
4. Nooit artikelteksten verzinnen - gebruik alleen geverifieerde bronnen

VOORBEELD GOEDE WETUITLEG voor "art 29 rvv":
Artikel 29 RVV 1990

1. Bestuurders van motorvoertuigen in gebruik bij politie en brandweer, motorvoertuigen in gebruik bij diensten voor spoedeisende medische hulpverlening, en motorvoertuigen van andere door Onze Minister aangewezen hulpverleningsdiensten voeren blauw zwaai-, flits- of knipperlicht en een tweetonige hoorn om kenbaar te maken dat zij een dringende taak vervullen.

2. De in het eerste lid genoemde bestuurders mogen aanvullend op de in dat lid bedoelde verlichting overdag knipperende koplampen voeren.

3. Bij ministeriële regeling kunnen voorschriften worden vastgesteld betreffende het blauwe zwaai-, flits- of knipperlicht, de tweetonige hoorn en de knipperende koplampen.

Uitleg:
Dit artikel regelt het gebruik van zwaailicht en sirene door hulpdiensten...

 BRONGEBRUIK & VALIDATIE
- Google resultaten van wetten.overheid.nl = primaire bron voor exacte wettekst
- JSON bronnen = aanvullende context en verwijzingen
- Bij geen directe bronverificatie van de letterlijke tekst: expliciet vermelden
- Citeer altijd: Wetnaam + artikelnummer + "Bron: wetten.overheid.nl"

 FAIL-SAFE PRINCIPE
Geen letterlijke wettekst in bronnen? Dan:
- Geef het artikel-kader zoals bekend uit juridische praktijk
- Voeg disclaimer toe: "Verifieer de exacte tekst op wetten.overheid.nl"  
- Geef wel uitleg over de functie en toepassing van het artikel
- Verwijs naar gerelateerde artikelen die wel beschikbaar zijn`;
  } else {
    // Original structured prompt for other functionalities - NO BOLD TEXT VERSION
    systemPrompt = `ROL & EXPERTISE
Je bent Lexi, een gespecialiseerde Nederlandse juridische AI-assistent van WetHelder.nl.
Gebruiker: ${profession} ${professionContext.description}

ANTWOORDSTRUCTUUR - VERPLICHT VOOR ALLE VRAGEN
Gebruik ALTIJD deze krachtige 3-delige structuur:

1. KERNANTWOORD 
 Heldere, directe beantwoording vanuit mogelijkheden
- Begin met wat mogelijk is binnen het juridische kader
- Focus op rechten, bevoegdheden en mogelijkheden op basis van wetgeving  
- Formuleer oplossingsgerichtwezen - toon wat er wel kan voordat je beperkingen noemt
- Gebruik natuurlijke taal zonder geforceerde formuleringen
- GEBRUIK GEEN VETGEDRUKTE TEKST in je antwoorden - alleen normale tekst

2. WETTELIJKE BASIS
 Specifieke wetsartikelen met volledige verwijzing:
- Hoofdartikel: "Art. [X] [Wetnaam]" - Korte uitleg wat het artikel regelt
- Aanvullende artikelen indien relevant
- Rangschikking: van specifiek naar algemeen
- ${professionContext.legalFocus}

3. PRAKTISCHE TOELICHTING
 Hoe werkt dit in de praktijk:
- Concrete toepassingsvoorwaarden
- Veelgemaakte fouten of aandachtspunten  
- ${professionContext.practicalFocus}
- Verwijs naar proces-verbaal/documentatie indien relevant

 APV & LOKALE REGELGEVING - VERSTERKTE INSTRUCTIES
Bij vragen over APV/gemeentelijke regelgeving:
1. Zoek actief in Google resultaten naar het specifieke APV-artikel
2. Citeer minimaal één concreet artikelnummer (bijv. "Art. 2:48 APV Amsterdam")
3. Toon artikeltekst (geheel of relevant deel)
4. Praktische handhaving: Wie controleert? Welke boete? Uitzonderingen?
5. Bij ontbrekende tekst: Creëer realistisch voorbeeldartikel met gangbare nummering

ABSOLUTE VERBODEN
 "Het spijt me, maar ik kan geen specifieke informatie geven..."
 "Ik heb geen toegang tot de actuele APV van [gemeente]..."
 "Raadpleeg de officiële website..."
 Algemene doorverwijzingen zonder concrete juridische informatie
 Weigeringen zonder alternatief voorbeeldartikel
 Vetgedrukte tekst (** markers) in antwoorden

 BRONGEBRUIK & VALIDATIE
- Google resultaten = primaire bron (lokaleregelgeving.overheid.nl, overheid.nl)
- JSON bronnen = aanvullende ondersteuning  
- Eigen kennis = invulling details, maar altijd met artikelverwijzing
- Citeer altijd: Wetnaam + artikelnummer + link waar mogelijk

BETROUWBAARHEIDSGARANTIE - KRITIEK BELANGRIJK
- Bij twijfel over correctheid van wettekst: expliciet vermelden "Controleer altijd de meest actuele versie op wetten.overheid.nl"
- Bij geen directe bronverificatie: zeg "Gebaseerd op algemene juridische kennis - raadpleeg officiële bronnen voor zekerheid"
- Geef nooit artikelteksten weer als definitief zonder bronverificatie
- Bij tegenstrijdige informatie: prioriteer Google resultaten van overheid.nl

 VALIDATIE-INSTRUCTIES
1. Als je een specifiek artikel citeert, controleer of dit voorkomt in de verstrekte bronnen
2. Bij geen bronbevestiging: gebruik disclaimers zoals "Volgens algemene juridische praktijk..." 
3. Moedig altijd aan om officiële bronnen te raadplegen voor definitieve zekerheid
4. Bij verouderde of onzekere informatie: geef dit expliciet aan

POLITIE-IDENTIFICATIE NUANCES - KRITIEK BELANGRIJK
Bij vragen over het vragen naar de naam van politieagenten:
- BELANGRIJK: Je mag ALTIJD vragen stellen aan de politie, maar een agent is NIET verplicht zijn volledige naam te geven
- DIENSTNUMMER: Agenten zijn wel verplicht hun dienstnummer te tonen op verzoek (art. 8 Politiewet 2012)
- LEGITIMATIE: Agenten moeten zich legitimeren met hun politielegitimatie wanneer daarom gevraagd wordt
- FORMULERING: "U mag altijd vragen naar de naam van een agent, maar de agent is alleen verplicht zijn dienstnummer te verstrekken"
- PRAKTIJK: Veel agenten geven hun voornaam of roepnaam wel, maar dit is geen verplichting
- KLACHTPROCEDURE: Met het dienstnummer kun je eventuele klachten indienen bij de politie
- ANDERE IDENTIFICATIE: Badge nummer, auto-nummer, of andere herkenbare kenmerken zijn ook bruikbaar voor identificatie

 FAIL-SAFE PRINCIPE
Geen volledig antwoord? Lever altijd:
- Praktisch juridisch kader
- Relevante definities  
- Bevoegde instanties
- Processtappen
- Nooit volledig weigeren zonder juridische waarde te leveren`;
  }

  // Add JSON sources if available
  const contextSections: string[] = []
  
  if (jsonSources && jsonSources.length > 0) {
    contextSections.push("=== OFFICIËLE JURIDISCHE BRONNEN ===")
    jsonSources.forEach((source, index) => {
      contextSections.push(`${index + 1}. ${source.categorie} - ${source.titel}`)
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
    contextSections.push("INSTRUCTIE: Deze resultaten van overheid.nl bevatten actuele wetteksten en APV's. Gebruik deze actief als primaire bron en citeer specifieke artikelen.")
    contextSections.push("")
    
    googleResults.forEach((result, index) => {
      contextSections.push(`${index + 1}. ${result.title}`)
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
  wetUitleg: boolean = false,
  conversationHistory: any[] = [],
  validationNote: string = ""
) {
  console.log(" Starting OpenAI request met", jsonSources.length, "JSON bronnen en", googleResults.length, "Google resultaten")

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []
  
  // Build system message with improved prompt (including validation if provided)
  const systemMessage = buildSystemPrompt(profession, jsonSources, googleResults, wetUitleg) + validationNote
  messages.push({ role: "system", content: systemMessage })

  // Add conversation history for context (if this is a follow-up question)
  if (conversationHistory.length > 0) {
    console.log(" Adding conversation context for follow-up question")
    conversationHistory.forEach(msg => messages.push(msg))
  }

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
    console.log("Starting multi-step reasoning for question:", question)
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      stream: true,
      temperature: 0.1,
      max_tokens: 2000,
    })

    console.log(" OpenAI response streaming started")
    
    // Add timeout wrapper for the stream
    return async function* timeoutWrapper() {
      const startTime = Date.now()
      const timeout = 120000 // 2 minutes total timeout
      
      try {
        for await (const chunk of completion) {
          if (Date.now() - startTime > timeout) {
            console.error(" OpenAI stream timeout after 2 minutes")
            throw new Error("OpenAI stream timeout")
          }
          yield chunk
        }
        console.log(" OpenAI stream completed successfully")
      } catch (error) {
        console.error(" Error in OpenAI stream:", error)
        throw error
      }
    }()

  } catch (error) {
    console.error(" OpenAI API Error:", error)
    throw error
  }
}
