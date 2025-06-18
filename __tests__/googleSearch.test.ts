import { searchSites } from '../lib/googleSearch/searchSites'
import { searchCache } from '../lib/googleSearch/cache'
import { limit } from '../lib/googleSearch/limiter'
import { SourceTag } from '../lib/googleSearch/enums'
import { SITE_GROUPS } from '../lib/googleSearch/sites'
import { searchVerifiedJuridicalSources, calculateMetrics } from '../lib/googleSearch'

// Mock fetch globally
global.fetch = jest.fn()

// Mock environment variables
process.env.GOOGLE_CSE_API_KEY = 'test-api-key'
process.env.GOOGLE_CSE_ID = 'test-cse-id'

describe('Google Search Refactor Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    searchCache.clear()
  })

  describe('Cache System', () => {
    it('should cache and retrieve search results', async () => {
      const testData = [{ title: 'Test Result', link: 'https://test.com', snippet: 'Test snippet' }]
      
      // Set cache
      await searchCache.set('test-site.com', 'test query', testData)
      
      // Get from cache
      const cached = await searchCache.get('test-site.com', 'test query')
      
      expect(cached).toEqual(testData)
    })

    it('should return null for non-existent cache entries', async () => {
      const result = await searchCache.get('non-existent.com', 'non-existent query')
      expect(result).toBeNull()
    })

    it('should handle cache expiration', async () => {
      const testData = [{ title: 'Test Result' }]
      
      // Mock Date.now to simulate expired entry
      const originalNow = Date.now
      Date.now = jest.fn(() => 0)
      
      await searchCache.set('test-site.com', 'test query', testData)
      
      // Fast forward time beyond TTL
      Date.now = jest.fn(() => 25 * 60 * 60 * 1000) // 25 hours
      
      const result = await searchCache.get('test-site.com', 'test query')
      expect(result).toBeNull()
      
      // Restore Date.now
      Date.now = originalNow
    })
  })

  describe('Concurrency Limiter', () => {
    it('should limit concurrent operations', async () => {
      let concurrent = 0
      let maxConcurrent = 0
      
      const mockOperation = jest.fn(async () => {
        concurrent++
        maxConcurrent = Math.max(maxConcurrent, concurrent)
        await new Promise(resolve => setTimeout(resolve, 10))
        concurrent--
        return 'result'
      })

      // Start 10 operations
      const promises = Array(10).fill(null).map(() => limit(mockOperation))
      
      await Promise.all(promises)
      
      expect(maxConcurrent).toBeLessThanOrEqual(5)
      expect(mockOperation).toHaveBeenCalledTimes(10)
    })
  })

  describe('Site Groups Configuration', () => {
    it('should have all required source tags', () => {
      const expectedTags = Object.values(SourceTag)
      const actualTags = Object.keys(SITE_GROUPS)
      
      expect(actualTags.sort()).toEqual(expectedTags.sort())
    })

    it('should have non-empty site arrays', () => {
      Object.entries(SITE_GROUPS).forEach(([tag, sites]) => {
        expect(sites.length).toBeGreaterThan(0)
        expect(sites.every(site => typeof site === 'string')).toBe(true)
      })
    })
  })

  describe('Search Sites Function', () => {
    beforeEach(() => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              title: 'Test Result',
              link: 'https://test.com/page',
              snippet: 'Test snippet with 2025 information',
              displayLink: 'test.com',
              formattedUrl: 'https://test.com/page'
            }
          ]
        })
      })
    })

    it('should search multiple sites and return results', async () => {
      const sites = ['test1.com', 'test2.com']
      const results = await searchSites('test query', SourceTag.WETTEN, sites)
      
      expect(results).toHaveLength(2) // One result per site
      expect(results[0]).toHaveProperty('title', 'Test Result')
      expect(results[0]).toHaveProperty('source', SourceTag.WETTEN)
      expect(results[0]).toHaveProperty('validation')
      expect(results[0]).toHaveProperty('isCurrentYear')
    })

    it('should handle API errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403
      })

      const results = await searchSites('test query', SourceTag.WETTEN, ['test.com'])
      
      expect(results).toHaveLength(0)
    })

    it('should use cache when available', async () => {
      const cachedData = [{
        title: 'Cached Result',
        link: 'https://cached.com',
        snippet: 'Cached snippet'
      }]
      
      await searchCache.set('test.com', 'cached query', cachedData)
      
      const results = await searchSites('cached query', SourceTag.WETTEN, ['test.com'])
      
      expect(results[0].title).toBe('Cached Result')
      expect(fetch).not.toHaveBeenCalled()
    })
  })

  describe('Main Search Pipeline', () => {
    beforeEach(() => {
      // Mock successful API responses
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              title: 'Legal Document 2025',
              link: 'https://wetten.overheid.nl/test',
              snippet: 'This document is from 2025 and contains current legal information',
              displayLink: 'wetten.overheid.nl'
            }
          ]
        })
      })
    })

    it('should perform comprehensive search across all source types', async () => {
      const results = await searchVerifiedJuridicalSources('test legal query')
      
      expect(results).toHaveProperty('results')
      expect(results).toHaveProperty('totalResults')
      expect(results).toHaveProperty('currentYearResults')
      expect(results).toHaveProperty('combinedSnippets')
      expect(results).toHaveProperty('timestamp')
      expect(results).toHaveProperty('sources')
      
      expect(results.timestamp).toBeInstanceOf(Date)
      expect(typeof results.combinedSnippets).toBe('string')
    })

    it('should filter historical vs current results correctly', async () => {
      const historicalResults = await searchVerifiedJuridicalSources('historical legal case from 1990')
      const currentResults = await searchVerifiedJuridicalSources('current legal regulations')
      
      expect(historicalResults.isHistoricalQuery).toBe(true)
      expect(currentResults.isHistoricalQuery).toBe(false)
    })

    it('should handle search failures gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
      
      const results = await searchVerifiedJuridicalSources('test query')
      
      expect(results.results).toHaveLength(0)
      expect(results.totalResults).toBe(0)
      expect(results.combinedSnippets).toBe('')
    })
  })

  describe('Date Validation Integration', () => {
    it('should validate source actuality correctly', async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              title: 'Document from 2025',
              link: 'https://test.com',
              snippet: 'This is current information from 2025',
              displayLink: 'test.com'
            },
            {
              title: 'Old Document from 2020',
              link: 'https://test.com/old',
              snippet: 'This is outdated information from 2020',
              displayLink: 'test.com'
            }
          ]
        })
      })

      const results = await searchSites('test query', SourceTag.WETTEN, ['test.com'])
      
      expect(results).toHaveLength(2)
      
      // Check that validation was applied
      results.forEach(result => {
        expect(result.validation).toBeDefined()
        expect(typeof result.isCurrentYear).toBe('boolean')
      })
    })
  })

  describe('Performance Metrics', () => {
    it('should complete search within reasonable time', async () => {
      const startTime = Date.now()
      
      await searchVerifiedJuridicalSources('quick test')
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should complete within 10 seconds (generous for testing)
      expect(duration).toBeLessThan(10000)
    })

    it('should limit API calls as specified', async () => {
      let apiCallCount = 0
      
      (fetch as jest.Mock).mockImplementation(async () => {
        apiCallCount++
        return {
          ok: true,
          json: async () => ({ items: [] })
        }
      })

      await searchVerifiedJuridicalSources('test query')
      
      // Should be significantly less than the old ~60 calls
      expect(apiCallCount).toBeLessThan(25)
    })
  })
})

// Helper function tests
describe('Utility Functions', () => {
  describe('calculateMetrics', () => {
    it('should calculate metrics correctly', () => {
      const mockResults = [
        { isCurrentYear: true, validation: { isOutdated: false } },
        { isCurrentYear: true, validation: { isOutdated: false } },
        { isCurrentYear: false, validation: { isOutdated: true } }
      ] as any[]

      const metrics = calculateMetrics(mockResults)
      
      expect(metrics.total).toBe(3)
      expect(metrics.currentYear).toBe(2)
      expect(metrics.outdated).toBe(1)
    })

    it('should handle empty results array', () => {
      const metrics = calculateMetrics([])
      
      expect(metrics.total).toBe(0)
      expect(metrics.currentYear).toBe(0)
      expect(metrics.outdated).toBe(0)
    })
  })
}) 