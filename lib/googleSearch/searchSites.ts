import { SourceTag } from './enums'
import { limit } from './limiter'
import { searchCache } from './cache'
import { validateSourceActuality, type SourceValidation } from '../dateValidation'

export interface GoogleSearchResult {
  title: string
  link: string
  snippet: string
  displayLink: string
  formattedUrl: string
  source: SourceTag
  validation?: SourceValidation
  isCurrentYear?: boolean
}

interface RawGoogleResult {
  title: string
  link: string
  snippet: string
  displayLink?: string
  formattedUrl?: string
}

/**
 * Converts raw Google CSE result to our standardized format
 */
function toGoogleResult(raw: RawGoogleResult, tag: SourceTag): GoogleSearchResult {
  const validation = validateSourceActuality(raw.snippet || '', raw.title || '', raw.link || '')
  
  return {
    title: raw.title,
    link: raw.link,
    snippet: raw.snippet,
    displayLink: raw.displayLink || new URL(raw.link).hostname,
    formattedUrl: raw.formattedUrl || raw.link,
    source: tag,
    validation,
    isCurrentYear: validation.isCurrentYear
  }
}

/**
 * Enhanced Google Custom Search with comprehensive wetten.overheid.nl coverage
 */
async function googleCSEEnhanced(query: string, site?: string): Promise<RawGoogleResult[]> {
  const apiKey = process.env.GOOGLE_API_KEY
  const searchEngineId = process.env.GOOGLE_CSE_ID

  if (!apiKey || !searchEngineId) {
    console.warn('Google CSE credentials not configured')
    return []
  }

  try {
    let searchQuery = query
    
    // For wetten.overheid.nl searches, add comprehensive legal terms
    if (site === 'wetten.overheid.nl') {
      // Check for vehicle-related queries specifically
      const vehicleTerms = ['voertuig', 'auto', 'motor', 'fiets', 'regelement', 'verkeer', 'rdw', 'kenteken', 'rijbewijs', 'wegenverkeer']
      const hasVehicleTerms = vehicleTerms.some(term => query.toLowerCase().includes(term))
      
      if (hasVehicleTerms) {
        // Enhanced search for vehicle regulations
        searchQuery = `${query} (wegenverkeerswet OR voertuigreglement OR wegenwet OR rdw OR verkeerswet OR motorvoertuig OR kenteken OR rijbewijs)`
      } else {
        // General enhanced search for wetten.overheid.nl
        searchQuery = `${query} (wet OR artikel OR wetboek OR reglement OR besluit OR ministeriële OR koninklijk)`
      }
    }
    
    const finalQuery = site ? `site:${site} ${searchQuery}` : searchQuery
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(finalQuery)}&num=10`
    
    console.log(`🔍 Enhanced search query: ${finalQuery}`)
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Google CSE API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.items) {
      console.log(`ℹ️ No results for: ${finalQuery}`)
      return []
    }

    const results = data.items.map((item: any) => ({
      title: item.title || '',
      link: item.link || '',
      snippet: item.snippet || '',
      displayLink: item.displayLink,
      formattedUrl: item.formattedUrl
    }))
    
    console.log(`✅ Found ${results.length} results for: ${finalQuery}`)
    return results
  } catch (error) {
    console.error('Google CSE search failed:', error)
    return []
  }
}

/**
 * Performs Google Custom Search API call with error handling
 */
async function googleCSE(query: string): Promise<RawGoogleResult[]> {
  // Use the enhanced version for all searches
  return googleCSEEnhanced(query)
}

/**
 * Enhanced search for specific sites with multiple search strategies
 */
export async function searchSites(
  query: string,
  tag: SourceTag,
  sites: string[]
): Promise<GoogleSearchResult[]> {
  const calls = sites.map(site =>
    limit(async () => {
      // Check cache first
      const cached = await searchCache.get(site, query)
      if (cached) {
        return cached.map((result: RawGoogleResult) => toGoogleResult(result, tag))
      }

      // For wetten.overheid.nl, perform multiple search strategies
      if (site === 'wetten.overheid.nl') {
        console.log(`🏛️ Enhanced wetten.overheid.nl search for: "${query}"`)
        
        // Strategy 1: Enhanced search with legal terms
        const enhancedResults = await googleCSEEnhanced(query, site)
        
        // Strategy 2: If few results, try broader search
        let allResults = enhancedResults
        if (enhancedResults.length < 3) {
          console.log('🔍 Limited results, trying broader search...')
          const broaderQuery = `${query} wetgeving regelgeving`
          const broaderResults = await googleCSEEnhanced(broaderQuery, site)
          allResults = [...enhancedResults, ...broaderResults]
        }
        
        // Strategy 3: For vehicle queries, also search specific vehicle regulations
        const vehicleTerms = ['voertuig', 'auto', 'motor', 'fiets', 'regelement', 'verkeer', 'rdw', 'kenteken', 'rijbewijs']
        if (vehicleTerms.some(term => query.toLowerCase().includes(term))) {
          console.log('🚗 Vehicle-related query detected, searching specific regulations...')
          const vehicleSpecificQuery = `${query} (wegenverkeerswet OR voertuigreglement OR wegenwet)`
          const vehicleResults = await googleCSEEnhanced(vehicleSpecificQuery, site)
          allResults = [...allResults, ...vehicleResults]
        }
        
        // Remove duplicates based on URL
        const uniqueResults = allResults.filter((result, index, self) => 
          index === self.findIndex(r => r.link === result.link)
        )
        
        // Cache the combined results
        await searchCache.set(site, query, uniqueResults)
        
        console.log(`✅ Total unique results for wetten.overheid.nl: ${uniqueResults.length}`)
        return uniqueResults.map(result => toGoogleResult(result, tag))
      }

      // For other sites, use standard search
      const siteQuery = `site:${site} ${query}`
      const rawResults = await googleCSE(siteQuery)
      
      // Cache the raw results
      await searchCache.set(site, query, rawResults)
      
      // Convert to our format
      return rawResults.map(result => toGoogleResult(result, tag))
    })
  )

  const results = await Promise.all(calls)
  return results.flat()
} 