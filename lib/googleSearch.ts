// Verbeterde Google Search service voor betrouwbare juridische antwoorden
// Workflow: JSON bronnen (primair) → Google Search (verificatie) → Strikte datumvalidatie → Filteren → ChatGPT met strikte instructies

import { 
  validateSourceActuality, 
  isHistoricalQuery, 
  generateOutdatedMessage,
  filterCurrentYearResults,
  type SourceValidation
} from './dateValidation'

// Import JSON bronnen
import { 
  searchJsonSources, 
  formatJsonSourcesForContext, 
  type JsonBron 
} from './jsonSources'

export interface GoogleSearchResult {
  title: string
  link: string
  snippet: string
  displayLink: string
  formattedUrl: string
  source: 'json' | 'wetten.overheid.nl' | 'rechtspraak.nl' | 'tuchtrecht.overheid.nl' | 'boetebase.om.nl' | 'overheid.nl' | 'apv' | 'cao' | 'politiebond' | 'fnv' | 'barp' | 'officiele_documenten' | 'internet'
  validation?: SourceValidation
  isCurrentYear?: boolean
}

export interface VerifiedSearchResults {
  results: GoogleSearchResult[]
  combinedSnippets: string
  totalResults: number
  currentYearResults: number
  outdatedResults: number
  excelResults: number
  jsonResults: number
  internetResults: number
  isHistoricalQuery: boolean
  searchTerms: string[]
  timestamp: Date
  sources?: {
    wetten?: GoogleSearchResult[]
    rechtspraak?: GoogleSearchResult[]
    tuchtrecht?: GoogleSearchResult[]
    boetes?: GoogleSearchResult[]
    overheid?: GoogleSearchResult[]
    apv?: GoogleSearchResult[]
  }
}

// UITGEBREIDE geverifieerde juridische bronnen - inclusief vakbonden, CAO's en officiële documenten
const VERIFIED_SOURCES = [
  // Primaire juridische bronnen
  'wetten.overheid.nl',
  'uitspraken.rechtspraak.nl', 
  'tuchtrecht.overheid.nl',
  'boetebase.om.nl',
  'overheid.nl',
  
  // Politie en handhaving
  'politie.nl',
  'om.nl',
  'rijksoverheid.nl',
  
  // Vakbonden en arbeidsrecht
  'politiebond.nl',
  'fnv.nl',
  'cnv.nl',
  'vcp.nl',
  
  // CAO's en arbeidsvoorwaarden
  'cao-politie.nl',
  'arbeidsvoorwaarden.overheid.nl',
  
  // Gemeenten (APV's)
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
  'haarlemmermeer.nl',
  
  // Ministeries en officiële instanties
  'minvenj.nl',
  'minbzk.nl',
  'belastingdienst.nl',
  'cbr.nl',
  'rdw.nl',
  'igj.nl',
  'acm.nl',
  'afm.nl',
  
  // Juridische organisaties
  'advocatenorde.nl',
  'kbn.nl', // Koninklijke Beroepsorganisatie van Gerechtsdeurwaarders
  'notaris.nl',
  
  // Veiligheid en beveiliging
  'veiligheidsregio.nl',
  'nctv.nl',
  'wodc.nl'
] as const

// Utility functions
function getCurrentYear(): number {
  return new Date().getFullYear()
}

/**
 * Valideert en categoriseert zoekresultaten
 */
function validateAndCategorize(sourceResults: any[], sourceName: string): GoogleSearchResult[] {
  return sourceResults.map(r => {
    const validation = validateSourceActuality(r.snippet || '', r.title || '', r.link || '')
    return { 
      ...r, 
      source: sourceName as any,
      validation,
      isCurrentYear: validation.isCurrentYear
    }
  })
}

function formatCombinedSnippetsForChatGPT(results: GoogleSearchResult[], jsonSources: JsonBron[]): string {
  let snippets = ''
  
  // Voeg JSON bronnen toe
  if (jsonSources.length > 0) {
    snippets += '=== OFFICIËLE JSON BRONNEN ===\n\n'
    jsonSources.forEach((source, index) => {
      snippets += `${index + 1}. ${source.naam}\n`
      snippets += `   URL: ${source.url}\n`
      snippets += `   Beschrijving: ${source.beschrijving}\n`
      snippets += `   Categorie: ${source.categorie}\n\n`
    })
  }
  
  // Voeg internet resultaten toe
  if (results.length > 0) {
    snippets += '=== INTERNET BRONNEN ===\n\n'
    results.forEach((result, index) => {
      snippets += `${index + 1}. ${result.title}\n`
      snippets += `   URL: ${result.link}\n`
      snippets += `   Snippet: ${result.snippet}\n\n`
    })
  }
  
  return snippets
}

/**
 * STAP 2: Zoekt op geverifieerde juridische bronnen via Google Custom Search
 */
export async function searchVerifiedJuridicalSources(query: string): Promise<VerifiedSearchResults> {
  console.log(`🔍 Zoeken op geverifieerde bronnen voor: "${query}"`)
  
  const isHistorical = isHistoricalQuery(query)
  
  const results: VerifiedSearchResults = {
    results: [],
    combinedSnippets: '',
    totalResults: 0,
    currentYearResults: 0,
    outdatedResults: 0,
    excelResults: 0,
    jsonResults: 0,
    internetResults: 0,
    isHistoricalQuery: isHistorical,
    searchTerms: [],
    timestamp: new Date()
  }

  try {
    // Zoek parallel op alle geverifieerde bronnen
    const [
      wettenResults, 
      rechtspraakResults, 
      tuchtrechtResults, 
      boetesResults, 
      overheidResults, 
      apvResults,
      caoResults,
      politiebondResults,
      fnvResults,
      barpResults,
      officieleDocumentenResults
    ] = await Promise.all([
      searchSpecificSource(query, 'wetten.overheid.nl'),
      searchSpecificSource(query, 'uitspraken.rechtspraak.nl'),
      searchSpecificSource(query, 'tuchtrecht.overheid.nl'),
      searchSpecificSource(query, 'boetebase.om.nl'),
      searchSpecificSource(query, 'overheid.nl'),
      searchAPVSources(query),
      searchCAOSources(query),
      searchPolitiebondSources(query),
      searchFNVSources(query),
      searchBARPSources(query),
      searchOfficieleDocumenten(query)
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

    const categorizedWetten = validateAndCategorize(wettenResults, 'wetten.overheid.nl')
    const categorizedRechtspraak = validateAndCategorize(rechtspraakResults, 'rechtspraak.nl')
    const categorizedTuchtrecht = validateAndCategorize(tuchtrechtResults, 'tuchtrecht.overheid.nl')
    const categorizedBoetes = validateAndCategorize(boetesResults, 'boetebase.om.nl')
    const categorizedOverheid = validateAndCategorize(overheidResults, 'overheid.nl')
    const categorizedAPV = validateAndCategorize(apvResults, 'apv')

    results.results = [
      ...categorizedWetten,
      ...categorizedRechtspraak,
      ...categorizedTuchtrecht,
      ...categorizedBoetes,
      ...categorizedOverheid,
      ...categorizedAPV,
      ...validateAndCategorize(caoResults, 'cao'),
      ...validateAndCategorize(politiebondResults, 'politiebond'),
      ...validateAndCategorize(fnvResults, 'fnv'),
      ...validateAndCategorize(barpResults, 'barp'),
      ...validateAndCategorize(officieleDocumentenResults, 'officiele_documenten')
    ]

    // Vul de sources property
    results.sources = {
      wetten: categorizedWetten,
      rechtspraak: categorizedRechtspraak,
      tuchtrecht: categorizedTuchtrecht,
      boetes: categorizedBoetes,
      overheid: categorizedOverheid,
      apv: categorizedAPV
    }

    // STAP 4: Filter en combineer resultaten
    const allResults = results.results

    // Bereken statistieken
    results.totalResults = allResults.length
    results.currentYearResults = allResults.filter(r => r.isCurrentYear).length
    results.outdatedResults = allResults.filter(r => !r.isCurrentYear).length

    // STRIKTE REGEL: Voor niet-historische vragen, gebruik alleen actuele bronnen
    const finalResults = isHistorical ? allResults : allResults.filter(r => r.isCurrentYear)
    
    // Genereer validatie samenvatting
    results.combinedSnippets = formatSnippetsForChatGPT(finalResults)
    
    results.searchTerms = extractSearchTermsFromResponse(results.combinedSnippets)

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
        results: [],
        combinedSnippets: '',
        totalResults: 0,
        currentYearResults: 0,
        outdatedResults: 0,
        excelResults: 0,
        jsonResults: 0,
        internetResults: 0,
        isHistoricalQuery: false,
        searchTerms: [],
        timestamp: new Date()
      },
      chatGPTPrompt: '',
      success: false
    }
  }
}

// Legacy functies voor backwards compatibility
export async function searchJuridicalSources(query: string): Promise<any[]> {
  const results = await searchVerifiedJuridicalSources(query)
  return results.results
}

export function extractSearchTermsFromResponse(response: string): string[] {
  // Simpele extractie voor backwards compatibility
  const terms = response.match(/artikel\s+\d+[a-z]?\s+[A-Z][a-z]*/gi) || []
  return [...new Set(terms)]
}

/**
 * HOOFDFUNCTIE: Uitgebreide juridische zoekopdracht met JSON bronnen als primaire bron
 * 
 * Workflow:
 * 1. Zoek eerst in JSON bronnen (primair)
 * 2. Zoek op internet voor verificatie en aanvulling
 * 3. Combineer en valideer resultaten
 * 4. Prioriteer JSON bronnen in de output
 */
export async function comprehensiveJuridicalSearch(query: string): Promise<VerifiedSearchResults> {
  console.log(`🔍 Starting comprehensive search for: "${query}"`)
  
  const results: VerifiedSearchResults = {
    results: [],
    combinedSnippets: '',
    totalResults: 0,
    currentYearResults: 0,
    outdatedResults: 0,
    excelResults: 0,
    jsonResults: 0,
    internetResults: 0,
    isHistoricalQuery: false,
    searchTerms: [],
    timestamp: new Date()
  }

  // STAP 1: Zoek in JSON bronnen (primair)
  console.log('📊 Searching JSON sources (primary)...')
  console.log('📊 Loading JSON sources...')
  
  let jsonSources: JsonBron[] = []
  try {
    jsonSources = await searchJsonSources(query, 20)
    console.log(`✅ Found ${jsonSources.length} JSON sources`)
  } catch (error) {
    console.log(`⚠️  JSON bronnen konden niet geladen worden: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  
  if (jsonSources.length > 0) {
    console.log(`✅ Found ${jsonSources.length} JSON sources`)
    
    // Converteer JSON bronnen naar GoogleSearchResult format
    const jsonResults: GoogleSearchResult[] = jsonSources.map(source => ({
      title: source.naam,
      link: source.url,
      snippet: source.beschrijving,
      displayLink: new URL(source.url).hostname,
      formattedUrl: source.url,
      source: 'json' as const,
      validation: {
        isCurrentYear: true,
        yearFound: getCurrentYear(),
        isReliable: source.betrouwbaarheid === 'hoog',
        hasValidDate: true,
        extractedDates: [getCurrentYear()],
        reason: 'JSON database bron',
        severity: 'info' as const
      },
      isCurrentYear: true
    }))
    
    results.results.push(...jsonResults)
    results.jsonResults = jsonResults.length
    results.currentYearResults += jsonResults.length
  }

  // STAP 2: Zoek op internet voor verificatie en aanvulling
  console.log('🌐 Searching internet sources (verification)...')
  
  // Parallel zoeken op alle internet bronnen
  const [
    wettenResults,
    rechtspraakResults,
    tuchtrechtResults,
    boetesResults,
    overheidResults,
    apvResults,
    caoResults,
    politiebondResults,
    fnvResults,
    barpResults,
    officieleDocumentenResults
  ] = await Promise.all([
    searchSpecificSource(query, 'wetten.overheid.nl'),
    searchSpecificSource(query, 'rechtspraak.nl'),
    searchSpecificSource(query, 'tuchtrecht.overheid.nl'),
    searchSpecificSource(query, 'boetebase.om.nl'),
    searchSpecificSource(query, 'overheid.nl'),
    searchAPVSources(query),
    searchCAOSources(query),
    searchPolitiebondSources(query),
    searchFNVSources(query),
    searchBARPSources(query),
    searchOfficieleDocumenten(query)
  ])

  // Combineer alle resultaten
  const allInternetResults = [
    ...wettenResults,
    ...rechtspraakResults,
    ...tuchtrechtResults,
    ...boetesResults,
    ...overheidResults,
    ...apvResults,
    ...caoResults,
    ...politiebondResults,
    ...fnvResults,
    ...barpResults,
    ...officieleDocumentenResults
  ]

  // Valideer en filter resultaten
  const validatedInternetResults = validateAndCategorize(allInternetResults, 'internet')
  
  results.results.push(...validatedInternetResults)
  results.internetResults = validatedInternetResults.length
  
  // Update totalen
  results.totalResults = results.jsonResults + results.internetResults
  results.currentYearResults += validatedInternetResults.filter(r => r.isCurrentYear).length
  results.outdatedResults = results.totalResults - results.currentYearResults
  
  // Genereer combined snippets
  results.combinedSnippets = formatCombinedSnippetsForChatGPT(results.results, jsonSources)
  
  console.log(`✅ Search completed: ${results.totalResults} total (${results.jsonResults} JSON, ${results.internetResults} internet), ${results.currentYearResults} current, ${results.outdatedResults} outdated`)
  
  return results
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

/**
 * Zoekt specifiek op CAO bronnen en arbeidsvoorwaarden
 */
async function searchCAOSources(query: string): Promise<Omit<GoogleSearchResult, 'source'>[]> {
  const caoSites = [
    'cao-politie.nl',
    'arbeidsvoorwaarden.overheid.nl',
    'rijksoverheid.nl'
  ]
  
  try {
    const caoSearches = caoSites.map(site => 
      searchSpecificSource(`${query} CAO arbeidsvoorwaarden`, site)
    )
    
    const allCAOResults = await Promise.all(caoSearches)
    return allCAOResults.flat().slice(0, 8) // Max 8 CAO resultaten
    
  } catch (error) {
    console.warn('Error searching CAO sources:', error)
    return []
  }
}

/**
 * Zoekt specifiek op Politiebond bronnen
 */
async function searchPolitiebondSources(query: string): Promise<Omit<GoogleSearchResult, 'source'>[]> {
  try {
    const results = await searchSpecificSource(`${query} politiebond arbeidsrecht`, 'politiebond.nl')
    return results.slice(0, 5) // Max 5 politiebond resultaten
    
  } catch (error) {
    console.warn('Error searching Politiebond sources:', error)
    return []
  }
}

/**
 * Zoekt specifiek op FNV bronnen
 */
async function searchFNVSources(query: string): Promise<Omit<GoogleSearchResult, 'source'>[]> {
  const fnvSites = [
    'fnv.nl',
    'cnv.nl',
    'vcp.nl'
  ]
  
  try {
    const fnvSearches = fnvSites.map(site => 
      searchSpecificSource(`${query} vakbond arbeidsrecht`, site)
    )
    
    const allFNVResults = await Promise.all(fnvSearches)
    return allFNVResults.flat().slice(0, 6) // Max 6 vakbond resultaten
    
  } catch (error) {
    console.warn('Error searching FNV sources:', error)
    return []
  }
}

/**
 * Zoekt specifiek op BARP (Basisboek Aanhouding, Rechtsmacht en Politiebevoegdheden) en politie-specifieke bronnen
 */
async function searchBARPSources(query: string): Promise<Omit<GoogleSearchResult, 'source'>[]> {
  const barpSites = [
    'politie.nl',
    'om.nl',
    'rijksoverheid.nl'
  ]
  
  try {
    const barpSearches = barpSites.map(site => 
      searchSpecificSource(`${query} BARP politiebevoegdheden aanhouding`, site)
    )
    
    const allBARPResults = await Promise.all(barpSearches)
    return allBARPResults.flat().slice(0, 6) // Max 6 BARP resultaten
    
  } catch (error) {
    console.warn('Error searching BARP sources:', error)
    return []
  }
}

/**
 * Zoekt op officiële documenten van ministeries en instanties
 */
async function searchOfficieleDocumenten(query: string): Promise<Omit<GoogleSearchResult, 'source'>[]> {
  const officieleInstanties = [
    'minvenj.nl',
    'minbzk.nl',
    'belastingdienst.nl',
    'cbr.nl',
    'rdw.nl',
    'igj.nl',
    'acm.nl',
    'afm.nl',
    'advocatenorde.nl',
    'kbn.nl',
    'notaris.nl',
    'veiligheidsregio.nl',
    'nctv.nl',
    'wodc.nl'
  ]
  
  try {
    // Zoek op de belangrijkste instanties parallel
    const instantieSearches = officieleInstanties.slice(0, 8).map(site => 
      searchSpecificSource(`${query} officieel document`, site)
    )
    
    const allInstantieResults = await Promise.all(instantieSearches)
    return allInstantieResults.flat().slice(0, 12) // Max 12 officiële documenten
    
  } catch (error) {
    console.warn('Error searching officiële documenten:', error)
    return []
  }
}

/**
 * Formatteert zoekresultaten voor gebruik in context
 * Ondersteunt zowel VerifiedSearchResults als GoogleSearchResult[] formats
 */
export function formatSearchResultsForContext(results: any): string {
  // Handle VerifiedSearchResults format
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

interface GoogleResult {
  title: string;
  snippet: string;
  link: string;
}

export async function searchGoogleCustom(query: string): Promise<GoogleResult[]> {
  const apiKey = process.env.GOOGLE_API_KEY
  const cx = process.env.GOOGLE_CSE_ID

  if (!apiKey || !cx) {
    console.warn('Google API key of CSE ID ontbreekt')
    return []
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=10`
    )

    if (!response.ok) {
      throw new Error('Google API response was not ok')
    }

    const data = await response.json()
    return data.items?.map((item: any) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link
    })) || []
  } catch (error) {
    console.error('Error searching Google:', error)
    return []
  }
}
