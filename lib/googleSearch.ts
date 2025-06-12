// Verbeterde Google Search service voor betrouwbare juridische antwoorden
// Workflow: Vraag → Zoeken op geverifieerde bronnen → Filteren → ChatGPT met strikte instructies

export interface GoogleSearchResult {
  title: string
  link: string
  snippet: string
  displayLink: string
  formattedUrl: string
  source: 'wetten.overheid.nl' | 'rechtspraak.nl' | 'tuchtrecht.overheid.nl' | 'boetebase.om.nl' | 'overheid.nl' | 'apv'
}

export interface VerifiedSearchResults {
  query: string
  totalResults: number
  sources: {
    wetten: GoogleSearchResult[]
    rechtspraak: GoogleSearchResult[]
    tuchtrecht: GoogleSearchResult[]
    boetes: GoogleSearchResult[]
    overheid: GoogleSearchResult[]
    apv: GoogleSearchResult[]
  }
  combinedSnippets: string
  sourceUrls: string[]
}

// Geverifieerde juridische bronnen - UITGEBREID MET APV's
const VERIFIED_SOURCES = [
  'wetten.overheid.nl',
  'uitspraken.rechtspraak.nl', 
  'tuchtrecht.overheid.nl',
  'boetebase.om.nl',
  'overheid.nl',
  // APV's en gemeentelijke verordeningen
  'amsterdam.nl',
  'rotterdam.nl',
  'denhaag.nl',
  'utrecht.nl',
  'eindhoven.nl',
  'tilburg.nl',
  'groningen.nl',
  'almere.nl',
  'breda.nl',
  'nijmegen.nl',
  'enschede.nl',
  'haarlem.nl',
  'arnhem.nl',
  'zaanstad.nl',
  'haarlemmermeer.nl'
] as const

/**
 * STAP 2: Zoekt op geverifieerde juridische bronnen via Google Custom Search
 */
export async function searchVerifiedJuridicalSources(query: string): Promise<VerifiedSearchResults> {
  console.log(`🔍 Zoeken op geverifieerde bronnen voor: "${query}"`)
  
  const results: VerifiedSearchResults = {
    query,
    totalResults: 0,
    sources: {
      wetten: [],
      rechtspraak: [],
      tuchtrecht: [],
      boetes: [],
      overheid: [],
      apv: []
    },
    combinedSnippets: '',
    sourceUrls: []
  }

  try {
    // Zoek parallel op alle geverifieerde bronnen + APV's
    const [wettenResults, rechtspraakResults, tuchtrechtResults, boetesResults, overheidResults, apvResults] = 
      await Promise.all([
        searchSpecificSource(query, 'wetten.overheid.nl'),
        searchSpecificSource(query, 'uitspraken.rechtspraak.nl'),
        searchSpecificSource(query, 'tuchtrecht.overheid.nl'),
        searchSpecificSource(query, 'boetebase.om.nl'),
        searchSpecificSource(query, 'overheid.nl'),
        searchAPVSources(query)
      ])

    // Categoriseer resultaten
    results.sources.wetten = wettenResults.map(r => ({ ...r, source: 'wetten.overheid.nl' as const }))
    results.sources.rechtspraak = rechtspraakResults.map(r => ({ ...r, source: 'rechtspraak.nl' as const }))
    results.sources.tuchtrecht = tuchtrechtResults.map(r => ({ ...r, source: 'tuchtrecht.overheid.nl' as const }))
    results.sources.boetes = boetesResults.map(r => ({ ...r, source: 'boetebase.om.nl' as const }))
    results.sources.overheid = overheidResults.map(r => ({ ...r, source: 'overheid.nl' as const }))
    results.sources.apv = apvResults.map(r => ({ ...r, source: 'apv' as const }))

    // STAP 3: Filter en combineer resultaten
    const allResults = [
      ...results.sources.wetten,
      ...results.sources.rechtspraak,
      ...results.sources.tuchtrecht,
      ...results.sources.boetes,
      ...results.sources.overheid,
      ...results.sources.apv
    ]

    results.totalResults = allResults.length
    results.combinedSnippets = formatSnippetsForChatGPT(allResults)
    results.sourceUrls = [...new Set(allResults.map(r => r.link))]

    console.log(`✅ ${results.totalResults} geverifieerde resultaten gevonden`)
    return results

  } catch (error) {
    console.error('Error in verified search:', error)
    return results
  }
}

/**
 * Zoekt op een specifieke geverifieerde bron
 */
async function searchSpecificSource(query: string, site: string): Promise<Omit<GoogleSearchResult, 'source'>[]> {
  try {
    const apiKey = process.env.GOOGLE_API_KEY
    const cseId = process.env.GOOGLE_CSE_ID

    if (!apiKey || !cseId) {
      console.warn('Google API credentials niet geconfigureerd')
      return []
    }

    const params = new URLSearchParams({
      key: apiKey,
      cx: cseId,
      q: `site:${site} ${query}`,
      num: '5', // Max 5 per bron voor snelheid
      safe: 'active',
      lr: 'lang_nl',
      gl: 'nl',
    })

    const url = `https://www.googleapis.com/customsearch/v1?${params.toString()}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WetHelder/1.0 (https://wethelder.nl)',
      }
    })

    if (!response.ok) {
      console.warn(`API error voor ${site}: ${response.status}`)
      return []
    }

    const data = await response.json()
    return data.items || []

  } catch (error) {
    console.warn(`Search error voor ${site}:`, error)
    return []
  }
}

/**
 * STAP 3: Formatteert snippets voor ChatGPT met strikte bronverwijzing
 */
function formatSnippetsForChatGPT(results: GoogleSearchResult[]): string {
  if (results.length === 0) {
    return 'Geen relevante informatie gevonden in de geverifieerde juridische bronnen.'
  }

  let formattedText = 'GEVERIFIEERDE JURIDISCHE INFORMATIE:\n\n'

  // Groepeer per bron voor duidelijkheid
  const groupedBySources = results.reduce((acc, result) => {
    if (!acc[result.source]) {
      acc[result.source] = []
    }
    acc[result.source].push(result)
    return acc
  }, {} as Record<string, GoogleSearchResult[]>)

  Object.entries(groupedBySources).forEach(([source, sourceResults]) => {
    formattedText += `=== ${source.toUpperCase()} ===\n`
    
    sourceResults.forEach((result, index) => {
      formattedText += `\n[${index + 1}] ${result.title}\n`
      formattedText += `Bron: ${result.link}\n`
      formattedText += `Inhoud: ${result.snippet}\n`
    })
    
    formattedText += '\n'
  })

  formattedText += '\nINSTRUCTIE: Beantwoord de vraag UITSLUITEND op basis van bovenstaande fragmenten. '
  formattedText += 'Vermeld bij elk punt de exacte bron. Voeg NIETS toe dat niet uit de tekst blijkt.'

  return formattedText
}

/**
 * STAP 4: Genereert de strikte ChatGPT prompt
 */
export function generateStrictChatGPTPrompt(question: string, verifiedResults: VerifiedSearchResults): string {
  return `Je bent een Nederlandse juridische assistent. Beantwoord de vraag UITSLUITEND op basis van de onderstaande geverifieerde fragmenten van officiële Nederlandse juridische bronnen.

**STRIKTE REGELS:**
1. Gebruik ALLEEN informatie uit de onderstaande fragmenten
2. Vermeld bij elke bewering de exacte bron (URL)
3. Als informatie niet in de fragmenten staat, zeg dan "Deze informatie is niet beschikbaar in de geraadpleegde bronnen"
4. Geef wetsartikelen exact weer zoals vermeld in de bronnen
5. Voeg GEEN eigen kennis of interpretaties toe

**VRAAG:** ${question}

**GEVERIFIEERDE BRONNEN:**
${verifiedResults.combinedSnippets}

**ANTWOORD:**
Beantwoord nu de vraag op basis van uitsluitend bovenstaande informatie, met bronverwijzingen bij elke bewering.`
}

/**
 * STAP 5: Hoofdfunctie voor de nieuwe workflow
 */
export async function executeVerifiedSearchWorkflow(question: string): Promise<{
  searchResults: VerifiedSearchResults
  chatGPTPrompt: string
  success: boolean
}> {
  try {
    console.log(`🚀 Start geverifieerde zoekworkflow voor: "${question}"`)
    
    // STAP 2: Zoek op geverifieerde bronnen
    const searchResults = await searchVerifiedJuridicalSources(question)
    
    // STAP 4: Genereer strikte prompt
    const chatGPTPrompt = generateStrictChatGPTPrompt(question, searchResults)
    
    return {
      searchResults,
      chatGPTPrompt,
      success: searchResults.totalResults > 0
    }
    
  } catch (error) {
    console.error('Error in verified search workflow:', error)
    return {
      searchResults: {
        query: question,
        totalResults: 0,
        sources: { wetten: [], rechtspraak: [], tuchtrecht: [], boetes: [], overheid: [], apv: [] },
        combinedSnippets: '',
        sourceUrls: []
      },
      chatGPTPrompt: '',
      success: false
    }
  }
}

// Legacy functies voor backwards compatibility
export async function searchJuridicalSources(query: string): Promise<any[]> {
  const results = await searchVerifiedJuridicalSources(query)
  return Object.values(results.sources).flat()
}

export function extractSearchTermsFromResponse(response: string): string[] {
  // Simpele extractie voor backwards compatibility
  const terms = response.match(/artikel\s+\d+[a-z]?\s+[A-Z][a-z]*/gi) || []
  return [...new Set(terms)]
}

export async function comprehensiveJuridicalSearch(query: string): Promise<any> {
  return await searchVerifiedJuridicalSources(query)
}

export function formatSearchResultsForContext(results: any): string {
  if (results.combinedSnippets) {
    return results.combinedSnippets
  }
  return 'Geen resultaten gevonden.'
}

/**
 * Zoekt specifiek op APV bronnen van verschillende gemeenten
 */
async function searchAPVSources(query: string): Promise<Omit<GoogleSearchResult, 'source'>[]> {
  const apvSites = [
    'amsterdam.nl',
    'rotterdam.nl', 
    'denhaag.nl',
    'utrecht.nl',
    'eindhoven.nl',
    'tilburg.nl',
    'groningen.nl',
    'almere.nl',
    'breda.nl',
    'nijmegen.nl'
  ]
  
  try {
    // Zoek op alle APV sites parallel
    const apvSearches = apvSites.map(site => 
      searchSpecificSource(`${query} APV algemene plaatselijke verordening`, site)
    )
    
    const allAPVResults = await Promise.all(apvSearches)
    
    // Combineer alle resultaten
    return allAPVResults.flat().slice(0, 10) // Max 10 APV resultaten
    
  } catch (error) {
    console.warn('Error searching APV sources:', error)
    return []
  }
}
