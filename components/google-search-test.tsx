'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, ExternalLink } from 'lucide-react'

interface GoogleSearchResult {
  title: string
  link: string
  snippet: string
  displayLink: string
  formattedUrl: string
}

interface SearchResults {
  wetten: GoogleSearchResult[]
  rechtspraak: GoogleSearchResult[]
  tuchtrecht: GoogleSearchResult[]
  boetes: GoogleSearchResult[]
  algemeen: GoogleSearchResult[]
}

export function GoogleSearchTest() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResults | null>(null)
  const [totals, setTotals] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('/api/google-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Search failed')
      }

      setResults(data.results)
      setTotals(data.totals)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const renderResults = (title: string, items: GoogleSearchResult[], color: string) => {
    if (!items || items.length === 0) return null

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {title}
            <Badge variant="secondary" className={color}>
              {items.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.slice(0, 3).map((item, index) => (
              <div key={index} className="border-l-2 border-blue-200 pl-4">
                <h4 className="font-medium text-sm mb-1">
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {item.title}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </h4>
                <p className="text-xs text-gray-600 mb-1">{item.displayLink}</p>
                <p className="text-sm text-gray-700">{item.snippet}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🔍 Google Search API Test</CardTitle>
          <CardDescription>
            Test de Google Custom Search API voor juridische bronnen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Voer een juridische zoekterm in..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={loading || !query.trim()}
              className="min-w-[100px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Zoeken...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Zoeken
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 border-red-200">
          <CardContent className="pt-6">
            <div className="text-red-600">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {totals && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>📊 Zoekresultaten Overzicht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totals.wetten}</div>
                <div className="text-sm text-gray-600">Wetgeving</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totals.rechtspraak}</div>
                <div className="text-sm text-gray-600">Rechtspraak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totals.tuchtrecht}</div>
                <div className="text-sm text-gray-600">Tuchtrecht</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{totals.boetes}</div>
                <div className="text-sm text-gray-600">Boetes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{totals.algemeen}</div>
                <div className="text-sm text-gray-600">Algemeen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{totals.total}</div>
                <div className="text-sm text-gray-600">Totaal</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {results && (
        <div className="space-y-4">
          {renderResults('📜 Wetgeving (wetten.overheid.nl)', results.wetten, 'bg-blue-100 text-blue-800')}
          {renderResults('⚖️ Jurisprudentie (rechtspraak.nl)', results.rechtspraak, 'bg-green-100 text-green-800')}
          {renderResults('🏛️ Tuchtrecht', results.tuchtrecht, 'bg-purple-100 text-purple-800')}
          {renderResults('🚔 Boetes & Sancties', results.boetes, 'bg-red-100 text-red-800')}
          {renderResults('🔍 Algemene Resultaten', results.algemeen, 'bg-gray-100 text-gray-800')}
        </div>
      )}
    </div>
  )
}
