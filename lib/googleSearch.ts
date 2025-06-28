// Refactored Google Search Pipeline - Faster, Cheaper, More Maintainable
// Workflow: JSON sources (primary) → Parallel Google Search → Validation → Filtering → ChatGPT

import fs from 'fs'
import path from 'path'
import { SourceTag } from './googleSearch/enums'
import { SITE_GROUPS } from './googleSearch/sites'
import { searchSites, type GoogleSearchResult } from './googleSearch/searchSites'
import { 
  validateSourceActuality, 
  isHistoricalQuery, 
  generateOutdatedMessage,
  filterCurrentYearResults,
  type SourceValidation
} from './dateValidation'
import { 
  searchJsonSources, 
  formatJsonSourcesForContext, 
  type JsonBron 
} from './jsonSources'

export interface VerifiedSearchResults {
  results: GoogleSearchResult[]
  combinedSnippets: string
  totalResults: number
  currentYearResults: number
  outdatedResults: number
  jsonResults: number
  internetResults: number
  isHistoricalQuery: boolean
  searchTerms: string[]
  timestamp: Date
  sources?: Partial<Record<SourceTag, GoogleSearchResult[]>>
}

/**
 * Load legal answer prompt template from file
 */
function loadLegalPrompt(): string {
  try {
    const promptPath = path.join(process.cwd(), 'prompts', 'legalAnswer.md')
    return fs.readFileSync(promptPath, 'utf-8')
  } catch (error) {
    console.warn('Could not load legal prompt template, using fallback')
    return `Je bent een Nederlandse juridische AI-assistent die uitsluitend baseert op geverifieerde bronnen.

STRIKTE REGELS:
1. Gebruik ALLEEN informatie uit de beschikbare bronnen
2. Vermeld bij elke bewering de exacte bron (URL)
3. Als informatie niet in de bronnen staat, zeg dan "Deze informatie is niet beschikbaar in de geraadpleegde bronnen"
4. Geef wetsartikelen exact weer zoals vermeld in de bronnen
5. Voeg GEEN eigen kennis of interpretaties toe`
  }
}

/**
 * Calculate metrics in a single reduce operation
 */
export function calculateMetrics(results: GoogleSearchResult[]): {
  total: number
  currentYear: number
  outdated: number
} {
  return results.reduce(
    (acc, result) => ({
      total: acc.total + 1,
      currentYear: acc.currentYear + (result.isCurrentYear ? 1 : 0),
      outdated: acc.outdated + (!result.isCurrentYear ? 1 : 0)
    }),
    { total: 0, currentYear: 0, outdated: 0 }
  )
}

/**
 * Format combined snippets for ChatGPT
 */
function formatCombinedSnippets(results: GoogleSearchResult[], jsonSources: JsonBron[]): string {
  let snippets = ''
  
  // Add JSON sources
  if (jsonSources.length > 0) {
    snippets += '=== OFFICIËLE JSON BRONNEN ===\n\n'
    jsonSources.forEach((source, index) => {
      snippets += `${index + 1}. ${source.naam}\n`
      snippets += `   URL: ${source.url}\n`
      snippets += `   Beschrijving: ${source.beschrijving}\n`
      snippets += `   Categorie: ${source.categorie}\n\n`
    })
  }
  
  // Add internet results
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
 * Main search pipeline - replaces multiple specific search functions
 */
export async function searchVerifiedJuridicalSources(query: string): Promise<VerifiedSearchResults> {
  console.log(`🔍 Starting refactored search pipeline for: "${query}"`)
  
  const isHistorical = isHistoricalQuery(query)
  const timestamp = new Date()
  
  // Special handling for RV (Reglement Voertuigen) articles
  const isRVQuery = /(\d+\.\d+\.\d+)\s*rv/i.test(query) || query.toLowerCase().includes('reglement voertuigen')
  if (isRVQuery) {
    console.log('🚗 Detected RV (Reglement Voertuigen) query - prioritizing vehicle regulations')
  }
  
  try {
    // For RV queries, prioritize WETTEN sources and add specific RV search terms
    let searchPromises;
    
    if (isRVQuery) {
      // Enhanced RV search strategy
      const rvEnhancedGroups = {
        ...SITE_GROUPS,
        [SourceTag.WETTEN]: [
          'wetten.overheid.nl',
          'lokaleregelgeving.overheid.nl',
          'zoekservice.overheid.nl'
        ]
      }
      
      searchPromises = Object.entries(rvEnhancedGroups).map(([tag, sites]) => {
        if (tag === SourceTag.WETTEN) {
          // Enhanced search query for RV articles
          const enhancedQuery = `${query} "reglement voertuigen" OR "voertuigreglement" OR "BWBR0025798"`
          console.log(`🚗 Enhanced RV search: ${enhancedQuery}`)
          return searchSites(enhancedQuery, tag as SourceTag, sites)
        }
        return searchSites(query, tag as SourceTag, sites)
      })
    } else {
      // Standard parallel search across all site groups
      searchPromises = Object.entries(SITE_GROUPS).map(([tag, sites]) =>
      searchSites(query, tag as SourceTag, sites)
    )
    }
    
    // Execute all searches in parallel
    const allResults = await Promise.all(searchPromises)
    
    // Flatten and validate results
    const flatResults = allResults
      .flat()
      .map(result => ({
        ...result,
        validation: validateSourceActuality(result.snippet, result.title, result.link)
      }))
      .filter(result => isHistorical || result.isCurrentYear)
    
    // For RV queries, boost results from wetten.overheid.nl that contain RV content
    if (isRVQuery) {
      flatResults.sort((a, b) => {
        const aIsWetten = a.link.includes('wetten.overheid.nl')
        const bIsWetten = b.link.includes('wetten.overheid.nl')
        const aHasRV = a.snippet.toLowerCase().includes('reglement') || a.snippet.toLowerCase().includes('voertuig')
        const bHasRV = b.snippet.toLowerCase().includes('reglement') || b.snippet.toLowerCase().includes('voertuig')
        
        // Prioritize wetten.overheid.nl results with RV content
        if (aIsWetten && aHasRV && !(bIsWetten && bHasRV)) return -1
        if (bIsWetten && bHasRV && !(aIsWetten && aHasRV)) return 1
        return 0
      })
      console.log(`🚗 Sorted ${flatResults.length} results for RV query`)
    }
    
    // Calculate metrics in single pass
    const metrics = calculateMetrics(flatResults)
    
         // Group results by source tag
     const sourceGroups: Partial<Record<SourceTag, GoogleSearchResult[]>> = flatResults.reduce((acc, result) => {
       if (!acc[result.source]) acc[result.source] = []
       acc[result.source]!.push(result)
       return acc
     }, {} as Partial<Record<SourceTag, GoogleSearchResult[]>>)
    
    // Search JSON sources (enhanced for RV articles)
    const jsonSources = await searchJsonSources(query)
    
    const results: VerifiedSearchResults = {
      results: flatResults,
      combinedSnippets: formatCombinedSnippets(flatResults, jsonSources),
      totalResults: metrics.total,
      currentYearResults: metrics.currentYear,
      outdatedResults: metrics.outdated,
      jsonResults: jsonSources.length,
      internetResults: flatResults.length,
      isHistoricalQuery: isHistorical,
      searchTerms: [query], // Simplified - can be enhanced later
      timestamp,
      sources: sourceGroups
    }
    
    console.log(`✅ Search completed: ${metrics.total} results, ${metrics.currentYear} current year`)
    if (isRVQuery) {
      console.log(`🚗 RV-specific results found: ${flatResults.filter(r => r.link.includes('wetten.overheid.nl')).length}`)
    }
    return results
    
  } catch (error) {
    console.error('❌ Search pipeline failed:', error)
    
    // Return empty results on failure
    return {
      results: [],
      combinedSnippets: '',
      totalResults: 0,
      currentYearResults: 0,
      outdatedResults: 0,
      jsonResults: 0,
      internetResults: 0,
      isHistoricalQuery: isHistorical,
      searchTerms: [query],
      timestamp,
      sources: {}
    }
  }
}

/**
 * Generate ChatGPT prompt with loaded template
 */
export function generateStrictChatGPTPrompt(question: string, verifiedResults: VerifiedSearchResults): string {
  const promptTemplate = loadLegalPrompt()
  
  return `${promptTemplate}

## VRAAG:
${question}

## BESCHIKBARE BRONNEN:
${verifiedResults.combinedSnippets}

## ZOEKSTATISTIEKEN:
- Totaal resultaten: ${verifiedResults.totalResults}
- Actuele resultaten: ${verifiedResults.currentYearResults}
- JSON bronnen: ${verifiedResults.jsonResults}
- Timestamp: ${verifiedResults.timestamp.toISOString()}

Geef een compleet antwoord volgens de bovenstaande structuur.`
}

/**
 * Complete search workflow
 */
export async function executeVerifiedSearchWorkflow(question: string): Promise<{
  searchResults: VerifiedSearchResults
  chatGPTPrompt: string
  success: boolean
}> {
  try {
    const searchResults = await searchVerifiedJuridicalSources(question)
    const chatGPTPrompt = generateStrictChatGPTPrompt(question, searchResults)
    
    return {
      searchResults,
      chatGPTPrompt,
      success: true
    }
  } catch (error) {
    console.error('❌ Search workflow failed:', error)
    return {
      searchResults: {
        results: [],
        combinedSnippets: '',
        totalResults: 0,
        currentYearResults: 0,
        outdatedResults: 0,
        jsonResults: 0,
        internetResults: 0,
        isHistoricalQuery: false,
        searchTerms: [question],
        timestamp: new Date(),
        sources: {}
      },
      chatGPTPrompt: '',
      success: false
    }
  }
}

// Legacy compatibility exports
export type { GoogleSearchResult } from './googleSearch/searchSites'
export const comprehensiveJuridicalSearch = searchVerifiedJuridicalSources
export const searchJuridicalSources = searchVerifiedJuridicalSources

/**
 * Extract search terms from response (simplified)
 */
export function extractSearchTermsFromResponse(response: string): string[] {
  const terms = response.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || []
  return [...new Set(terms)].slice(0, 10) // Dedupe and limit
}

/**
 * Format search results for context (legacy compatibility)
 */
export function formatSearchResultsForContext(results: any): string {
  if (Array.isArray(results)) {
    return results.map((r, i) => `${i + 1}. ${r.title}\n   ${r.snippet}\n   ${r.link}`).join('\n\n')
  }
  return results?.combinedSnippets || ''
}
