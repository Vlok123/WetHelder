// Verbeterde Google Search service voor betrouwbare juridische antwoorden
// Workflow: Vraag → Zoeken op geverifieerde bronnen → Strikte datumvalidatie → Filteren → ChatGPT met strikte instructies

import { 
  validateSourceActuality, 
  isHistoricalQuery, 
  generateOutdatedMessage,
  filterCurrentYearResults,
  getCurrentYear,
  type SourceValidation
} from './dateValidation'

export interface GoogleSearchResult {
  title: string
  link: string
  snippet: string
  displayLink: string
  formattedUrl: string
  source: 'wetten.overheid.nl' | 'rechtspraak.nl' | 'tuchtrecht.overheid.nl' | 'boetebase.om.nl' | 'overheid.nl' | 'apv'
  validation?: SourceValidation
  isCurrentYear?: boolean
}

export interface VerifiedSearchResults {
  query: string
  totalResults: number
  currentYearResults: number
  outdatedResults: number
  isHistoricalQuery: boolean
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
  validationSummary: string
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
  
  const isHistorical = isHistoricalQuery(query)
  
  const results: VerifiedSearchResults = {
    query,
    totalResults: 0,
    currentYearResults: 0,
    outdatedResults: 0,
    isHistoricalQuery: isHistorical,
    sources: {
      wetten: [],
      rechtspraak: [],
      tuchtrecht: [],
      boetes: [],
      overheid: [],
      apv: []
    },
    combinedSnippets: '',
    sourceUrls: [],
    validationSummary: ''
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

    // STAP 3: Valideer alle resultaten op actualiteit
    const validateAndCategorize = (sourceResults: any[], sourceName: string) => {
      return sourceResults.map(r => {
        const validation = validateSourceActuality(r.snippet || '', r.title || '', r.link || '')
        return { 
          ...r, 
          source: sourceName,
          validation,
          isCurrentYear: validation.isCurrentYear
        }
      })
    }

    results.sources.wetten = validateAndCategorize(wettenResults, 'wetten.overheid.nl')
    results.sources.rechtspraak = validateAndCategorize(rechtspraakResults, 'rechtspraak.nl')
    results.sources.tuchtrecht = validateAndCategorize(tuchtrechtResults, 'tuchtrecht.overheid.nl')
    results.sources.boetes = validateAndCategorize(boetesResults, 'boetebase.om.nl')
    results.sources.overheid = validateAndCategorize(overheidResults, 'overheid.nl')
    results.sources.apv = validateAndCategorize(apvResults, 'apv')

    // STAP 4: Filter en combineer resultaten
    const allResults = [
      ...results.sources.wetten,
      ...results.sources.rechtspraak,
      ...results.sources.tuchtrecht,
      ...results.sources.boetes,
      ...results.sources.overheid,
      ...results.sources.apv
    ]

    // Bereken statistieken
    results.totalResults = allResults.length
    results.currentYearResults = allResults.filter(r => r.isCurrentYear).length
    results.outdatedResults = allResults.filter(r => !r.isCurrentYear).length

    // STRIKTE REGEL: Voor niet-historische vragen, gebruik alleen actuele bronnen
    const finalResults = isHistorical ? allResults : allResults.filter(r => r.isCurrentYear)
    
    // Genereer validatie samenvatting
    results.validationSummary = `Gevonden: ${results.totalResults} bronnen (${results.currentYearResults} actueel, ${results.outdatedResults} verouderd). ${isHistorical ? 'Historische vraag: alle bronnen toegestaan.' : 'Alleen actuele bronnen gebruikt.'}`
    
    // Als geen actuele bronnen en niet-historische vraag: weiger antwoord
    if (!isHistorical && results.currentYearResults === 0 && results.totalResults > 0) {
      results.combinedSnippets = generateOutdatedMessage(
        `Alle gevonden bronnen (${results.totalResults}) bevatten verouderde informatie`
      )
    } else {
      results.combinedSnippets = formatSnippetsForChatGPT(finalResults)
    }
    
    results.sourceUrls = [...new Set(finalResults.map(r => r.link))]

    console.log(`✅ ${results.totalResults} totale resultaten, ${results.currentYearResults} actueel, ${results.outdatedResults} verouderd`)
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

    // Voeg actuele datum filtering toe voor specifieke onderwerpen
    const currentYear = new Date().getFullYear()
    const isTimeFrequentTopic = /belasting|fiscaal|jubelton|schenkingsrecht|erfenis|tarieven|premie|uitkering/i.test(query)
    
    const params = new URLSearchParams({
      key: apiKey,
      cx: cseId,
      q: `site:${site} ${query}`,
      num: '5', // Max 5 per bron voor snelheid
      safe: 'active',
      lr: 'lang_nl',
      gl: 'nl',
      // Voeg datum filter toe voor tijd-afhankelijke onderwerpen
      ...(isTimeFrequentTopic && {
        dateRestrict: 'm12', // Alleen resultaten van afgelopen 12 maanden
        sort: 'date' // Sorteer op datum (nieuwste eerst)
      })
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
    
    // Extra filtering voor actuele informatie
    const results = data.items || []
    
    // Filter op recente informatie voor tijd-kritieke onderwerpen
    if (isTimeFrequentTopic) {
      return results.filter((item: any) => {
        // Check of het snippet recente jaartallen bevat
        const snippet = item.snippet?.toLowerCase() || ''
        const title = item.title?.toLowerCase() || ''
        const combined = `${snippet} ${title}`
        
        // Zoek naar huidige en vorig jaar
        const hasRecentYear = combined.includes(currentYear.toString()) || 
                              combined.includes((currentYear - 1).toString())
        
        // Exclusief verouderde termen - filter jubelton informatie die niet expliciet vermeldt dat het is afgeschaft
        const hasOutdatedTerms = /jubelton|jubeltoeslag/i.test(combined) && 
                                !/afgeschaft|beëindigd|vervallen|niet meer|sinds 2023|per 2023|vanaf 2023/i.test(combined)
        
        return hasRecentYear || !hasOutdatedTerms
      })
    }
    
    return results

  } catch (error) {
    console.warn(`Search error voor ${site}:`, error)
    return []
  }
}

/**
 * STAP 3: Formatteert snippets voor ChatGPT met strikte bronverwijzing en datumvalidatie
 */
function formatSnippetsForChatGPT(results: GoogleSearchResult[]): string {
  if (results.length === 0) {
    return 'Geen relevante informatie gevonden in de geverifieerde juridische bronnen.'
  }

  const currentYear = getCurrentYear()
  let formattedText = `GEVERIFIEERDE JURIDISCHE INFORMATIE (${currentYear}):\n\n`

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
      
      // Voeg validatie-informatie toe
      if (result.validation) {
        formattedText += `Actualiteit: ${result.validation.reason}\n`
        if (result.validation.extractedDates.length > 0) {
          formattedText += `Gevonden jaartallen: ${result.validation.extractedDates.join(', ')}\n`
        }
      }
      
      formattedText += `Inhoud: ${result.snippet}\n`
    })
    
    formattedText += '\n'
  })

  formattedText += `\n**STRIKTE ACTUALITEITSREGELS:**\n`
  formattedText += `- Het is nu ${currentYear}\n`
  formattedText += `- Gebruik ALLEEN informatie die geldig is voor ${currentYear}\n`
  formattedText += `- Als informatie verouderd is, vermeld dit EXPLICIET\n`
  formattedText += `- Voor belasting/subsidies: toon VERPLICHT het geldige jaar bij elk bedrag\n`
  formattedText += `- Jubelton is AFGESCHAFT per 1 januari 2023\n\n`

  formattedText += 'INSTRUCTIE: Beantwoord de vraag UITSLUITEND op basis van bovenstaande fragmenten. '
  formattedText += 'Vermeld bij elk punt de exacte bron EN het geldige jaar. Voeg NIETS toe dat niet uit de tekst blijkt.'

  return formattedText
}

/**
 * STAP 4: Genereert de strikte ChatGPT prompt
 */
export function generateStrictChatGPTPrompt(question: string, verifiedResults: VerifiedSearchResults): string {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
  
  return `Je bent een Nederlandse juridische assistent. Beantwoord de vraag UITSLUITEND op basis van de onderstaande geverifieerde fragmenten van officiële Nederlandse juridische bronnen.

**STRIKTE REGELS:**
1. Gebruik ALLEEN informatie uit de onderstaande fragmenten
2. Vermeld bij elke bewering de exacte bron (URL)
3. Als informatie niet in de fragmenten staat, zeg dan "Deze informatie is niet beschikbaar in de geraadpleegde bronnen"
4. Geef wetsartikelen exact weer zoals vermeld in de bronnen
5. Voeg GEEN eigen kennis of interpretaties toe

**ACTUALITEIT CONTROLE (BELANGRIJK):**
- Het is nu ${currentMonth}
- Controleer of de informatie actueel is voor ${currentYear}
- Let specifiek op verouderde regelingen zoals de "jubelton" (afgeschaft per 1 januari 2023)
- WAARSCHUWING: Veel bronnen bevatten nog verouderde informatie over de jubelton - deze is NIET meer van toepassing
- Vermeld expliciet als regelgeving is gewijzigd, afgeschaft of vervangen
- Geef alleen actuele tarieven, bedragen en procedures voor ${currentYear}
- Voor schenkingen: alleen de gewone jaarlijkse vrijstelling van €6.739 (2025) geldt nog
- Als je verouderde informatie tegenkomt, vermeld dan expliciet dat deze niet meer geldig is

**VRAAG:** ${question}

**GEVERIFIEERDE BRONNEN:**
${verifiedResults.combinedSnippets}

**ANTWOORD:**
Beantwoord nu de vraag op basis van uitsluitend bovenstaande informatie, met bronverwijzingen bij elke bewering. Zorg ervoor dat alle informatie actueel is voor ${currentYear} en vermeld expliciet als bepaalde regelgeving is gewijzigd of afgeschaft.`
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
        currentYearResults: 0,
        outdatedResults: 0,
        isHistoricalQuery: false,
        sources: { wetten: [], rechtspraak: [], tuchtrecht: [], boetes: [], overheid: [], apv: [] },
        combinedSnippets: '',
        sourceUrls: [],
        validationSummary: 'Error occurred during search'
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
  // Handle both VerifiedSearchResults and GoogleSearchResult[] formats
  if (results && results.combinedSnippets) {
    return results.combinedSnippets
  }
  
  // Handle array of GoogleSearchResult
  if (Array.isArray(results) && results.length > 0) {
    let formattedText = 'ZOEKRESULTATEN:\n\n'
    
    results.forEach((result, index) => {
      formattedText += `[${index + 1}] ${result.title || 'Geen titel'}\n`
      formattedText += `Bron: ${result.link || result.url || 'Geen URL'}\n`
      formattedText += `Inhoud: ${result.snippet || result.content || 'Geen inhoud'}\n\n`
    })
    
    return formattedText
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
