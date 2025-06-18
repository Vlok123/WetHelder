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
 * Performs Google Custom Search API call with error handling
 */
async function googleCSE(query: string): Promise<RawGoogleResult[]> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY
  const searchEngineId = process.env.GOOGLE_CSE_ID

  if (!apiKey || !searchEngineId) {
    console.warn('Google CSE credentials not configured')
    return []
  }

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=10`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Google CSE API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.items) {
      return []
    }

    return data.items.map((item: any) => ({
      title: item.title || '',
      link: item.link || '',
      snippet: item.snippet || '',
      displayLink: item.displayLink,
      formattedUrl: item.formattedUrl
    }))
  } catch (error) {
    console.error('Google CSE search failed:', error)
    return []
  }
}

/**
 * Generic function to search specific sites with caching and rate limiting
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

      // Perform actual search
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