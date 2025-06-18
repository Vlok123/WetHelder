// Cache system for Google search results
// Redis in production, in-memory Map for development

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

class SearchCache {
  private memoryCache = new Map<string, CacheEntry>()
  private readonly TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  private generateKey(site: string, query: string): string {
    return `search:${site}:${Buffer.from(query).toString('base64')}`
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl
  }

  async get(site: string, query: string): Promise<any | null> {
    const key = this.generateKey(site, query)
    
    // Try Redis first (if available)
    if (process.env.REDIS_URL && typeof window === 'undefined') {
      try {
        // TODO: Implement Redis client when needed
        // const redis = new Redis(process.env.REDIS_URL)
        // const cached = await redis.get(key)
        // if (cached) return JSON.parse(cached)
      } catch (error) {
        console.warn('Redis cache miss:', error)
      }
    }

    // Fallback to memory cache
    const entry = this.memoryCache.get(key)
    if (entry && !this.isExpired(entry)) {
      return entry.data
    }

    // Clean up expired entry
    if (entry && this.isExpired(entry)) {
      this.memoryCache.delete(key)
    }

    return null
  }

  async set(site: string, query: string, data: any): Promise<void> {
    const key = this.generateKey(site, query)
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: this.TTL
    }

    // Try Redis first (if available)
    if (process.env.REDIS_URL && typeof window === 'undefined') {
      try {
        // TODO: Implement Redis client when needed
        // const redis = new Redis(process.env.REDIS_URL)
        // await redis.setex(key, Math.floor(this.TTL / 1000), JSON.stringify(data))
      } catch (error) {
        console.warn('Redis cache write failed:', error)
      }
    }

    // Always store in memory cache as backup
    this.memoryCache.set(key, entry)

    // Clean up old entries periodically
    if (this.memoryCache.size > 1000) {
      this.cleanup()
    }
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key)
      }
    }
  }

  clear(): void {
    this.memoryCache.clear()
  }
}

export const searchCache = new SearchCache() 