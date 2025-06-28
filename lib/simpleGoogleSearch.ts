/**
 * Eenvoudige Google Custom Search implementatie
 * Volgt de 6-stappen aanpak voor betrouwbare juridische antwoorden
 */

export interface SimpleSearchResult {
  title: string
  snippet: string
  url: string
  source: string
}

export interface SearchBundle {
  query: string
  results: SimpleSearchResult[]
  totalFound: number
}

/**
 * STAP 2 & 3: Zoek via Google Custom Search API
 */
export async function searchOfficialSites(query: string): Promise<SearchBundle> {
  const apiKey = process.env.GOOGLE_API_KEY
  const cseId = process.env.GOOGLE_CSE_ID
  
  if (!apiKey || !cseId) {
    console.log('Google API credentials niet geconfigureerd')
    return { query, results: [], totalFound: 0 }
  }

  // Enhanced search specifically for wetten.overheid.nl comprehensive coverage
  const enhancedQuery = `${query} (site:wetten.overheid.nl OR site:lokaleregelgeving.overheid.nl) OR (${query} site:belastingdienst.nl OR site:rijksoverheid.nl OR site:rechtspraak.nl)`
  
  console.log(' Enhanced search query for comprehensive wetten.overheid.nl coverage:', enhancedQuery)
  
  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(enhancedQuery)}&num=10`
    
    console.log(` Google zoeken: "${enhancedQuery}"`)
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (!response.ok) {
      console.error('Google API error:', data)
      return { query, results: [], totalFound: 0 }
    }

    const results: SimpleSearchResult[] = (data.items || []).map((item: any) => ({
      title: item.title || '',
      snippet: item.snippet || '',
      url: item.link || '',
      source: extractSourceName(item.link || '')
    }))

    console.log(` ${results.length} resultaten gevonden`)
    
    return {
      query,
      results,
      totalFound: data.searchInformation?.totalResults || 0
    }
    
  } catch (error) {
    console.error('Fout bij Google zoeken:', error)
    return { query, results: [], totalFound: 0 }
  }
}

/**
 * STAP 4: Maak een bundle van relevante tekstfragmenten
 */
export function createTextBundle(searchBundle: SearchBundle): string {
  if (searchBundle.results.length === 0) {
    return 'Geen relevante informatie gevonden in officiële bronnen.'
  }

  let bundle = ` Beschikbare informatie uit officiële bronnen:\n\n`
  
  searchBundle.results.forEach((result, index) => {
    bundle += `${index + 1}. [${result.source}]\n`
    bundle += `"${result.snippet}"\n`
    bundle += `URL: ${result.url}\n\n`
  })
  
  return bundle
}

/**
 * STAP 5: Genereer ChatGPT prompt met strikte instructies
 */
export function createChatGPTPrompt(originalQuery: string, textBundle: string): string {
  const currentYear = new Date().getFullYear()
  
  return `Je bent een juridisch assistent. Beantwoord onderstaande vraag uitsluitend op basis van de fragmenten uit officiële bronnen.

📌 **JURIDISCH ANTWOORDMODEL - POSITIEVE BENADERING**
KRITISCH: Vooral bij bevoegdheidsvragen:
-  Begin met wat juridisch gezien **wel mag** op basis van wetgeving
-  Gebruik **"Ja, mits..."** of **"Dit mag op basis van... onder voorwaarden..."**
-  Gebruik GEEN **"Nee, tenzij..."** formuleringen

❓ Vraag:
${originalQuery}

${textBundle}

 Strikte richtlijnen:
- Gebruik UITSLUITEND bovenstaande tekstfragmenten
- Noem altijd de exacte bron bij het antwoord
- Zeg het eerlijk als de informatie niet actueel is voor ${currentYear}
- Zeg het eerlijk als de informatie onvolledig is
- RAAD NIETS - gebruik alleen wat er letterlijk staat
- Als er tegenstrijdige informatie is, vermeld dit expliciet
- Geef bij bedragen en data altijd het jaar erbij

**BELANGRIJK:** Als de informatie verouderd is (niet van ${currentYear}), vermeld dit expliciet en adviseer om de meest recente informatie te controleren.`
}

/**
 * STAP 6: Verstuur naar ChatGPT en krijg antwoord
 */
export async function getAnswerFromChatGPT(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OpenAI API key niet geconfigureerd')
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Je bent een juridisch assistent die alleen antwoordt op basis van verstrekte bronnen.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // Lage temperatuur voor consistente antwoorden
        max_tokens: 1500
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    return data.choices[0]?.message?.content || 'Geen antwoord ontvangen van ChatGPT'
    
  } catch (error) {
    console.error('ChatGPT API error:', error)
    throw error
  }
}

/**
 * Hoofdfunctie: Volledige 6-stappen workflow
 */
export async function executeSimpleSearchWorkflow(userQuery: string): Promise<string> {
  console.log(' Start eenvoudige zoekworkflow')
  console.log(`📝 Gebruikersvraag: "${userQuery}"`)
  
  try {
    // STAP 2 & 3: Zoek via Google
    const searchBundle = await searchOfficialSites(userQuery)
    
    if (searchBundle.results.length === 0) {
      return ` **Geen informatie gevonden**

Ik kon geen relevante informatie vinden in de officiële bronnen (belastingdienst.nl, rijksoverheid.nl, wetten.overheid.nl, rechtspraak.nl) voor uw vraag: "${userQuery}"

**Suggestie:** Probeer uw vraag anders te formuleren of zoek direct op de officiële websites.`
    }
    
    // STAP 4: Maak tekstbundle
    const textBundle = createTextBundle(searchBundle)
    console.log(`📦 Tekstbundle gemaakt met ${searchBundle.results.length} fragmenten`)
    
    // STAP 5: Maak ChatGPT prompt
    const chatGPTPrompt = createChatGPTPrompt(userQuery, textBundle)
    
    // STAP 6: Krijg antwoord van ChatGPT
    console.log(' Versturen naar ChatGPT...')
    const answer = await getAnswerFromChatGPT(chatGPTPrompt)
    
    console.log(' Antwoord ontvangen van ChatGPT')
    return answer
    
  } catch (error) {
    console.error('Fout in zoekworkflow:', error)
    return ` **Fout opgetreden**

Er is een fout opgetreden bij het zoeken naar informatie voor uw vraag: "${userQuery}"

**Foutmelding:** ${error instanceof Error ? error.message : 'Onbekende fout'}

**Suggestie:** Probeer het later opnieuw of zoek direct op de officiële websites.`
  }
}

/**
 * Helper functie: Haal bronnaam uit URL
 */
function extractSourceName(url: string): string {
  try {
    const domain = new URL(url).hostname
    
    if (domain.includes('belastingdienst.nl')) return 'Belastingdienst'
    if (domain.includes('rijksoverheid.nl')) return 'Rijksoverheid'
    if (domain.includes('wetten.overheid.nl')) return 'Wetten.overheid.nl'
    if (domain.includes('rechtspraak.nl')) return 'Rechtspraak.nl'
    if (domain.includes('tuchtrecht.overheid.nl')) return 'Tuchtrecht'
    if (domain.includes('boetebase.om.nl')) return 'OM Boetebase'
    
    return domain
  } catch {
    return 'Onbekende bron'
  }
} 