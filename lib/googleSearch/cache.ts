// Cache system for Google search results
// Redis in production, in-memory Map for development

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number // Time to live in milliseconds
}

const cache = new Map<string, CacheEntry>()

// Enhanced TTL based on source type - wetten.overheid.nl gets longer cache time
function getTTL(site: string): number {
  // Legal content from wetten.overheid.nl changes less frequently - 4 hours cache
  if (site.includes('wetten.overheid.nl') || site.includes('lokaleregelgeving.overheid.nl')) {
    return 4 * 60 * 60 * 1000 // 4 hours
  }
  
  // News/policy sites change more frequently - 1 hour cache
  if (site.includes('rijksoverheid.nl') || site.includes('belastingdienst.nl')) {
    return 60 * 60 * 1000 // 1 hour
  }
  
  // Jurisprudence is fairly stable - 2 hours cache
  if (site.includes('rechtspraak.nl') || site.includes('tuchtrecht.overheid.nl')) {
    return 2 * 60 * 60 * 1000 // 2 hours
  }
  
  // Default cache time for other sources - 30 minutes
  return 30 * 60 * 1000 // 30 minutes
}

function isExpired(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp > entry.ttl
}

export const searchCache = {
  async get(site: string, query: string): Promise<any> {
    const key = `${site}:${query}`
    const entry = cache.get(key)
    
    if (!entry || isExpired(entry)) {
      cache.delete(key)
      return null
    }
    
    console.log(`📋 Cache hit for ${site}: ${query}`)
    return entry.data
  },

  async set(site: string, query: string, data: any): Promise<void> {
    const key = `${site}:${query}`
    const ttl = getTTL(site)
    
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
    
    console.log(`💾 Cached results for ${site} (TTL: ${Math.round(ttl / 60000)}min): ${query}`)
  },

  clear(): void {
    cache.clear()
    console.log('🧹 Cache cleared')
  },

  // New method to get cache statistics
  getStats(): { size: number; wettenEntries: number; otherEntries: number } {
    let wettenEntries = 0
    let otherEntries = 0
    
    for (const [key] of cache) {
      if (key.includes('wetten.overheid.nl') || key.includes('lokaleregelgeving.overheid.nl')) {
        wettenEntries++
      } else {
        otherEntries++
      }
    }
    
    return {
      size: cache.size,
      wettenEntries,
      otherEntries
    }
  }
} 