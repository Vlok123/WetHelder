import fs from 'fs'
import path from 'path'

// Type definitions for optimized format
interface OptimizedArtikel {
  nr?: string
  nummer?: string  // Support both formats
  titel: string
  tekst: string
  boek?: string | null
  titeldeel?: string | null
  hoofdstuk?: string | null
  paragraaf?: string | null
  leden?: Array<{nr: number, tekst: string}>
  keywords?: string[]
  gerelateerdeArtikelen?: string[]
  toelichting?: string | null
  strafmaat?: {
    gevangenisstraf?: string
    geldboete?: string
  }
  // Support old format fields
  wet?: string
  wetAfkorting?: string
  type?: string
  bron?: string
  url?: string
  laatstGewijzigd?: string
}

interface OptimizedWet {
  wetNaam: string
  citeertitel?: string
  intitule?: string
  url?: string
  categorie?: string
  scope?: string
  laatstGewijzigd?: string
  artikelen: OptimizedArtikel[]
  metadata?: {
    aantalArtikelen?: number
    bronFormaat?: string
    verwerkingsDatum?: string
    optimizedVersion?: string
  }
}

interface OptimizedSource {
  'Categorie': string
  'Topic': string
  'Bron (naam)': string
  'URL': string
  'Omschrijving': string
  'Scope': string
}

// Cache for loaded sources
let cachedSources: OptimizedSource[] | null = null
let lastLoadTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Fast loader for optimized JSON files
export async function loadOptimizedJsonSources(): Promise<OptimizedSource[]> {
  const now = Date.now()
  
  // Return cached data if still valid
  if (cachedSources && (now - lastLoadTime) < CACHE_DURATION) {
    console.log(`🚀 Using cached optimized sources: ${cachedSources.length} items`)
    return cachedSources
  }
  
  console.log('📂 Loading optimized JSON sources...')
  const sources: OptimizedSource[] = []
  
  const dataDir = path.join(process.cwd(), 'data')
  const optimizedDir = path.join(dataDir, 'optimized')
  
  // Check if optimized directory exists
  if (!fs.existsSync(optimizedDir)) {
    console.log('⚠️  No optimized directory found, falling back to regular loading')
    return []
  }
  
  try {
    const files = fs.readdirSync(optimizedDir)
    const optimizedFiles = files.filter(file => file.endsWith('_optimized.json'))
    
    console.log(`📊 Found ${optimizedFiles.length} optimized files`)
    
    for (const filename of optimizedFiles) {
      const filePath = path.join(optimizedDir, filename)
      
      try {
        console.log(`⚡ Loading: ${filename}`)
        const rawData = fs.readFileSync(filePath, 'utf8')
        const wetData: OptimizedWet = JSON.parse(rawData)
        
        // Convert each artikel to source format - support both old and new format
        wetData.artikelen.forEach((artikel) => {
          // Get article number from either 'nr' or 'nummer' field
          const articleNumber = artikel.nr || artikel.nummer || 'Unknown'
          
          const beschrijving = artikel.titeldeel 
            ? `${artikel.titeldeel} - Artikel ${articleNumber}: ${artikel.tekst}`
            : `Artikel ${articleNumber}: ${artikel.tekst}`
          
          sources.push({
            'Categorie': wetData.categorie || 'Wetgeving – nationaal',
            'Topic': artikel.wet || wetData.wetNaam || 'Unknown',
            'Bron (naam)': `${artikel.wet || wetData.wetNaam} - Artikel ${articleNumber}`,
            'URL': artikel.url || wetData.url || 'https://wetten.overheid.nl/',
            'Omschrijving': beschrijving,
            'Scope': wetData.scope || 'NL'
          })
        })
        
        console.log(`  ✅ ${wetData.artikelen.length} artikelen van ${wetData.wetNaam || filename}`)
        
      } catch (error) {
        console.error(`❌ Error loading ${filename}:`, error)
      }
    }
    
    // Cache the results
    cachedSources = sources
    lastLoadTime = now
    
    console.log(`🎉 Total optimized sources loaded: ${sources.length}`)
    return sources
    
  } catch (error) {
    console.error('❌ Error loading optimized sources:', error)
    return []
  }
}

// Fast search function for optimized sources
export async function searchOptimizedJsonSources(query: string): Promise<{
  foundInJson: boolean,
  sources: OptimizedSource[],
  recommendation: 'use_json' | 'use_google' | 'use_both',
  suggestion?: string
}> {
  console.log(`🔍 Optimized search voor: "${query}"`)
  
  try {
    const optimizedSources = await loadOptimizedJsonSources()
    console.log(`🚀 Using cached optimized sources: ${optimizedSources.length} items`)
    
    const queryLower = query.toLowerCase()
    
    // ENHANCED: Check for Boek 6 patterns first (6:x:x format)
    const boek6Match = queryLower.match(/artikel\s*6:(\d+):(\d+[a-z]*)\s*(?:lid\s*\d+[a-z]*)?\s*(sr|strafrecht|sv|strafvordering|wetboek\s+van\s+strafvordering)?/i)
    
    if (boek6Match) {
      const boek6Number = `6:${boek6Match[1]}:${boek6Match[2]}`
      console.log(`🔍 Detected Boek 6 article search: ${boek6Number}`)
      
      // Search specifically for Boek 6 sources
      const boek6Sources = optimizedSources.filter(source => {
        const content = source['Omschrijving'].toLowerCase()
        const sourceName = source['Bron (naam)'].toLowerCase()
        
        // Check if it's a Boek 6 source
        const isBoek6Source = sourceName.includes('boek6') || sourceName.includes('strafvordering_boek6') || sourceName.includes('wvsv_boek6')
        
        if (isBoek6Source) {
          // Check if the content contains the exact article number
          const articlePattern = new RegExp(`artikel\\s*${boek6Number.replace(/:/g, ':')}`, 'i')
          return articlePattern.test(content)
        }
        
        return false
      })
      
      if (boek6Sources.length > 0) {
        console.log(`⚡ Found ${boek6Sources.length} Boek 6 sources in optimized format`)
        return {
          foundInJson: true,
          sources: boek6Sources,
          recommendation: 'use_json'
        }
      }
    }
    
    // Enhanced article references for better matching - comprehensive patterns
    let articleMatch = queryLower.match(/artikel\s*(\d+[a-z]*)\s*(?:lid\s*\d+[a-z]*)?\s*(sr|strafrecht|sv|strafvordering|wvw|wegenverkeerswet|politiewet|grondwet|awb|awbi|wet|opiumwet|jeugdwet|wet\s+dieren|wet\s+publieke\s+gezondheid|wwm|wapens|munitie|wed|economische\s+delicten|rvv|verkeer|forensische\s+zorg|lijkbezorging|wetggz|geestelijke\s+gezondheid)/i)
    
    if (!articleMatch) {
      // Check for full law names with more variations
      articleMatch = queryLower.match(/artikel\s*(\d+[a-z]*)\s*(?:lid\s*\d+[a-z]*)?\s*(wetboek\s+van\s+strafrecht|wetboek\s+van\s+strafvordering|wegenverkeerswet|algemene\s+wet\s+bestuursrecht|algemene\s+wet\s+op\s+het\s+binnentreden|burgerlijk\s+wetboek|bw|ambtsinstructie|politiewet|grondwet)/i)
    }
    
    if (!articleMatch) {
      // Compact format (number + law without spaces)
      articleMatch = queryLower.match(/(\d+[a-z]*)\s*(sr|strafrecht|sv|strafvordering|wvw|awb|awbi|bw|opiumwet|jeugdwet|wwm|wed|rvv)/i)
    }
    
    if (!articleMatch) {
      // Even more compact (numbers stuck to law names)
      articleMatch = queryLower.match(/(\d+[a-z]*)(sr|strafrecht|sv|strafvordering|wvw|awb|awbi|bw)/i)
    }
    
    if (!articleMatch) {
      // Just article number
      articleMatch = queryLower.match(/artikel\s*(\d+[a-z]*)/i)
    }
    
    let articleNumber = ''
    let lawHint = ''
    
    if (articleMatch) {
      articleNumber = articleMatch[1]
      lawHint = articleMatch[2] || ''
      console.log(`🔍 Detected article: ${articleNumber}, law: ${lawHint}`)
    }
    
    // Search with scoring
    const scoredResults = optimizedSources.map(source => {
      let score = 0
      const sourceText = `${source['Bron (naam)']} ${source['Omschrijving']} ${source['Topic']}`.toLowerCase()
      
      // Direct article number match (highest priority)
      if (articleNumber && source['Bron (naam)'].toLowerCase().includes(`artikel ${articleNumber.toLowerCase()}`)) {
        score += 100
        
        // Enhanced law type bonus with comprehensive synonyms
        if (lawHint) {
          const lawSynonyms = getLawSynonyms(lawHint)
          if (lawSynonyms.some(synonym => sourceText.includes(synonym.toLowerCase()))) {
            score += 50
          }
        }
      }
      
      // Keyword matching with weights
      const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2)
      queryWords.forEach(word => {
        if (sourceText.includes(word)) {
          score += word.length // Longer words get higher scores
        }
      })
      
      // Topic relevance
      if (source['Topic'] && queryWords.some(word => source['Topic'].toLowerCase().includes(word))) {
        score += 20
      }
      
      return { source, score }
    }).filter(result => result.score > 0)
    
    // Sort by score (descending)
    scoredResults.sort((a, b) => b.score - a.score)
    
    // Take top 10 results
    const topResults = scoredResults.slice(0, 10).map(result => result.source)
    
    // Enhanced suggestions for non-existent articles
    let suggestion = ''
    if (articleMatch && topResults.length === 0) {
      const article = articleMatch[1]
      const law = lawHint
      
      if (queryLower.includes('id') || queryLower.includes('identiteit')) {
        if (law !== 'sr' && law !== 'strafrecht') {
          suggestion = 'Voor ID-plicht zie ook artikel 447e Wetboek van Strafrecht of artikel 8 Politiewet 2012.'
        }
      }
    }
    
    console.log(`ℹ️ Found ${topResults.length} optimized sources`)
    
    if (topResults.length > 0) {
      return {
        foundInJson: true,
        sources: topResults,
        recommendation: 'use_json',
        suggestion
      }
    }
    
    return {
      foundInJson: false,
      sources: [],
      recommendation: 'use_google',
      suggestion
    }
    
  } catch (error) {
    console.error('❌ Error in searchOptimizedJsonSources:', error)
    return {
      foundInJson: false,
      sources: [],
      recommendation: 'use_google'
    }
  }
}

// Helper function to get law synonyms - comprehensive mapping for Dutch legal system
function getLawSynonyms(lawHint: string): string[] {
  const synonymsMap: { [key: string]: string[] } = {
    // Strafrecht
    'sr': ['Wetboek van Strafrecht', 'strafrecht', 'sr'],
    'strafrecht': ['Wetboek van Strafrecht', 'sr'],
    'wetboek van strafrecht': ['Wetboek van Strafrecht', 'sr', 'strafrecht'],
    
    // Strafvordering  
    'sv': ['Wetboek van Strafvordering', 'strafvordering', 'sv', 'wetboek_strafvordering'],
    'strafvordering': ['Wetboek van Strafvordering', 'sv', 'wetboek_strafvordering'],
    'wetboek van strafvordering': ['Wetboek van Strafvordering', 'sv', 'strafvordering', 'wetboek_strafvordering'],
    'wetboek_strafvordering': ['Wetboek van Strafvordering', 'sv', 'strafvordering'],
    
    // Wegenverkeerswet
    'wvw': ['Wegenverkeerswet', 'wegenverkeerswet', 'wvw', 'Wegenverkeerswet 1994'],
    'wegenverkeerswet': ['Wegenverkeerswet', 'wvw', 'Wegenverkeerswet 1994'],
    'wegenverkeerswet 1994': ['Wegenverkeerswet', 'wvw', 'Wegenverkeerswet 1994'],
    
    // Politiewet
    'politiewet': ['Politiewet', 'politiewet 2012', 'Politiewet 2012'],
    'politiewet 2012': ['Politiewet', 'Politiewet 2012'],
    
    // Grondwet
    'grondwet': ['Grondwet', 'grondwet voor het koninkrijk'],
    'grondwet voor het koninkrijk': ['Grondwet'],
    
    // Bestuursrecht
    'awb': ['Algemene wet bestuursrecht', 'awb'],
    'algemene wet bestuursrecht': ['Algemene wet bestuursrecht', 'awb'],
    
    // Binnentreden
    'awbi': ['Algemene wet op het binnentreden', 'awbi'],
    'algemene wet op het binnentreden': ['Algemene wet op het binnentreden', 'awbi'],
    
    // Burgerlijk Wetboek
    'bw': ['Burgerlijk Wetboek', 'bw'],
    'burgerlijk wetboek': ['Burgerlijk Wetboek', 'bw'],
    
    // Specifieke wetten
    'opiumwet': ['Opiumwet'],
    'jeugdwet': ['Jeugdwet'],
    'ambtsinstructie': ['Ambtsinstructie voor de politie, de Koninklijke marechaussee en andere opsporingsambtenaren'],
    
    // Wapens en munitie
    'wwm': ['Wet wapens en munitie', 'wwm'],
    'wapens': ['Wet wapens en munitie', 'wwm'],
    'munitie': ['Wet wapens en munitie', 'wwm'],
    'wet wapens en munitie': ['Wet wapens en munitie', 'wwm'],
    
    // Economische delicten
    'wed': ['Wet op de economische delicten', 'wed'],
    'economische delicten': ['Wet op de economische delicten', 'wed'],
    'wet op de economische delicten': ['Wet op de economische delicten', 'wed'],
    
    // Verkeer
    'rvv': ['Reglement verkeersregels en verkeerstekens', 'rvv', 'RVV 1990'],
    'verkeer': ['Reglement verkeersregels en verkeerstekens', 'rvv'],
    'reglement verkeersregels en verkeerstekens': ['Reglement verkeersregels en verkeerstekens', 'rvv'],
    'rvv 1990': ['Reglement verkeersregels en verkeerstekens', 'rvv'],
    
    // Overige wetten
    'forensische zorg': ['Wet forensische zorg'],
    'wet forensische zorg': ['Wet forensische zorg'],
    'lijkbezorging': ['Wet op de lijkbezorging'],
    'wet op de lijkbezorging': ['Wet op de lijkbezorging'],
    'wetggz': ['Wet verplichte geestelijke gezondheidszorg', 'wetggz'],
    'geestelijke gezondheid': ['Wet verplichte geestelijke gezondheidszorg', 'wetggz'],
    'wet verplichte geestelijke gezondheidszorg': ['Wet verplichte geestelijke gezondheidszorg', 'wetggz'],
    'wet dieren': ['Wet dieren'],
    'wet publieke gezondheid': ['Wet publieke gezondheid']
  }
  
  const normalized = lawHint.toLowerCase().trim()
  return synonymsMap[normalized] || [lawHint]
}

// Format sources for AI context
export function formatOptimizedSourcesForDirectAnswer(searchResult: {
  foundInJson: boolean
  sources: OptimizedSource[]
  recommendation: string
}): string {
  if (!searchResult.foundInJson || searchResult.sources.length === 0) {
    return ''
  }
  
  const sourceTexts = searchResult.sources.map(source => {
    return `**BRON: ${source['Bron (naam)']}**\n${source['Omschrijving']}\n`
  }).join('\n')
  
  return `**JURIDISCHE BRONNEN:**\n${sourceTexts}`
}

// Performance comparison helper
export function getOptimizedPerformanceStats(): {
  cacheHit: boolean
  sourcesCount: number
  lastLoadTime: Date | null
} {
  return {
    cacheHit: cachedSources !== null && (Date.now() - lastLoadTime) < CACHE_DURATION,
    sourcesCount: cachedSources?.length || 0,
    lastLoadTime: lastLoadTime > 0 ? new Date(lastLoadTime) : null
  }
}

// NEW: Exact Boek 6 article lookup function
export async function getExactBoek6Article(boek6Number: string, lawType?: string): Promise<{
  found: boolean
  article?: OptimizedSource
  exactText?: string
  lawName?: string
}> {
  try {
    const optimizedSources = await loadOptimizedJsonSources()
    
    // Search for Boek 6 articles in the optimized sources
    // Look for both the number format and in the content
    const boek6Sources = optimizedSources.filter(source => {
      const content = source['Omschrijving'].toLowerCase()
      const sourceName = source['Bron (naam)'].toLowerCase()
      
      // Check if it's a Boek 6 source (Strafvordering_Boek6 or WvSv_Boek6)
      const isBoek6Source = sourceName.includes('boek6') || sourceName.includes('strafvordering_boek6') || sourceName.includes('wvsv_boek6')
      
      if (isBoek6Source) {
        // Check if the content contains the exact article number
        const articlePattern = new RegExp(`artikel\\s*${boek6Number.replace(/:/g, ':')}`, 'i')
        return articlePattern.test(content)
      }
      
      return false
    })
    
    if (boek6Sources.length > 0) {
      const bestMatch = boek6Sources[0]
      console.log(`✅ Exact Boek 6 article found: ${bestMatch['Bron (naam)']}`)
      return {
        found: true,
        article: bestMatch,
        exactText: bestMatch['Omschrijving'],
        lawName: bestMatch['Topic']
      }
    }
    
    console.log(`❌ Boek 6 Article ${boek6Number} not found in law type: ${lawType || 'any'}`)
    return { found: false }
    
  } catch (error) {
    console.error('❌ Error in getExactBoek6Article:', error)
    return { found: false }
  }
}

// NEW: Exact article lookup function
export async function getExactArticle(articleNumber: string, lawType?: string): Promise<{
  found: boolean
  article?: OptimizedSource
  exactText?: string
  lawName?: string
}> {
  try {
    const optimizedSources = await loadOptimizedJsonSources()
    
    // Create exact search patterns for different law types
    const searchPatterns = []
    
    if (lawType) {
      const lawNames = getLawSynonyms(lawType)
      lawNames.forEach(lawName => {
        searchPatterns.push(`${lawName} - Artikel ${articleNumber}`)
      })
    } else {
      // If no law type specified, search all
      searchPatterns.push(`Artikel ${articleNumber}`)
    }
    
    // Find exact match
    for (const pattern of searchPatterns) {
      const exactMatch = optimizedSources.find(source => 
        source['Bron (naam)'].toLowerCase().includes(pattern.toLowerCase())
      )
      
      if (exactMatch) {
        console.log(`✅ Exact article found: ${exactMatch['Bron (naam)']}`)
        return {
          found: true,
          article: exactMatch,
          exactText: exactMatch['Omschrijving'],
          lawName: exactMatch['Topic']
        }
      }
    }
    
    console.log(`❌ Article ${articleNumber} not found in specified law type: ${lawType || 'any'}`)
    return { found: false }
    
  } catch (error) {
    console.error('❌ Error in getExactArticle:', error)
    return { found: false }
  }
}

// Enhanced search with mandatory article verification
export async function searchOptimizedJsonSourcesWithVerification(query: string): Promise<{
  foundInJson: boolean,
  sources: OptimizedSource[],
  recommendation: 'use_json' | 'use_google' | 'use_both',
  suggestion?: string,
  exactArticle?: {
    found: boolean
    article?: OptimizedSource
    exactText?: string
    lawName?: string
  }
}> {
  console.log(`🔍 Enhanced search with verification voor: "${query}"`)
  
  const queryLower = query.toLowerCase()
  
  // Extract article references - ENHANCED WITH BOEK 6 SUPPORT
  // First check for Boek 6 patterns (6:x:x format)
  let articleMatch = queryLower.match(/artikel\s*6:(\d+):(\d+[a-z]*)\s*(?:lid\s*\d+[a-z]*)?\s*(sr|strafrecht|sv|strafvordering|wetboek\s+van\s+strafvordering)/i)
  
  if (articleMatch) {
    console.log(`🔍 Detected Boek 6 article: ${articleMatch[1]}:${articleMatch[2]}, law: ${articleMatch[3] || 'unknown'}`)
    // Handle Boek 6 articles differently - they use 6:x:x format
    const boek6Number = `6:${articleMatch[1]}:${articleMatch[2]}`
    const lawType = articleMatch[3] || 'sv'
    
    // Search for exact Boek 6 article
    const exactResult = await getExactBoek6Article(boek6Number, lawType)
    
    if (exactResult.found) {
      console.log(`✅ VERIFICATION PASSED: Boek 6 Article ${boek6Number} found exactly`)
      return {
        foundInJson: true,
        sources: [exactResult.article!],
        recommendation: 'use_json',
        exactArticle: exactResult
      }
    } else {
      console.log(`❌ VERIFICATION FAILED: Boek 6 Article ${boek6Number} not found`)
      const suggestion = `Boek 6 artikel ${boek6Number} kon niet worden gevonden in ${lawType}. Controleer het artikelnummer.`
      return {
        foundInJson: false,
        sources: [],
        recommendation: 'use_google',
        suggestion
      }
    }
  }
  
  // Regular article patterns (non-Boek 6)
  articleMatch = queryLower.match(/artikel\s*(\d+[a-z]*)\s*(?:lid\s*\d+[a-z]*)?\s*(sr|strafrecht|sv|strafvordering|wvw|wegenverkeerswet|politiewet|grondwet|awb|awbi|wet|opiumwet|jeugdwet|wet\s+dieren|wet\s+publieke\s+gezondheid|wwm|wapens|munitie|wed|economische\s+delicten|rvv|verkeer|forensische\s+zorg|lijkbezorging|wetggz|geestelijke\s+gezondheid)/i)
  
  if (!articleMatch) {
    // Check for full law names with more variations
    articleMatch = queryLower.match(/artikel\s*(\d+[a-z]*)\s*(?:lid\s*\d+[a-z]*)?\s*(wetboek\s+van\s+strafrecht|wetboek\s+van\s+strafvordering|wegenverkeerswet|algemene\s+wet\s+bestuursrecht|algemene\s+wet\s+op\s+het\s+binnentreden|burgerlijk\s+wetboek|bw|ambtsinstructie|politiewet|grondwet)/i)
  }
  
  if (!articleMatch) {
    // Compact format (number + law without spaces)
    articleMatch = queryLower.match(/(\d+[a-z]*)\s*(sr|strafrecht|sv|strafvordering|wvw|awb|awbi|bw|opiumwet|jeugdwet|wwm|wed|rvv)/i)
  }
  
  if (!articleMatch) {
    // Even more compact (numbers stuck to law names)
    articleMatch = queryLower.match(/(\d+[a-z]*)(sr|strafrecht|sv|strafvordering|wvw|awb|awbi|bw)/i)
  }
  
  if (!articleMatch) {
    // Just article number
    articleMatch = queryLower.match(/artikel\s*(\d+[a-z]*)/i)
  }
  
  let exactArticle = undefined
  
  // STEP 1: If article detected, do EXACT lookup first
  if (articleMatch) {
    const articleNumber = articleMatch[1]
    const lawHint = articleMatch[2] || ''
    console.log(`🔍 Detected article: ${articleNumber}, law: ${lawHint}`)
    
    exactArticle = await getExactArticle(articleNumber, lawHint)
    
    if (exactArticle.found) {
      console.log(`✅ VERIFICATION PASSED: Article ${articleNumber} found exactly`)
      return {
        foundInJson: true,
        sources: [exactArticle.article!],
        recommendation: 'use_json',
        exactArticle
      }
    } else {
      console.log(`❌ VERIFICATION FAILED: Article ${articleNumber} not found`)
      return {
        foundInJson: false,
        sources: [],
        recommendation: 'use_google',
        suggestion: `Artikel ${articleNumber} kon niet worden gevonden in ${lawHint || 'de database'}. Controleer het artikelnummer.`,
        exactArticle
      }
    }
  }
  
  // STEP 2: Fall back to regular search for non-article queries
  return await searchOptimizedJsonSources(query)
} 