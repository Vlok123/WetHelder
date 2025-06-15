'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Scale, 
  BookOpen, 
  Calendar,
  ExternalLink,
  Download,
  Star,
  Clock
} from 'lucide-react'

interface SearchResult {
  id: string
  title: string
  type: 'wet' | 'jurisprudentie' | 'verdrag'
  source: string
  date: string
  excerpt: string
  url: string
  relevance: number
}

const searchCategories = [
  { id: 'alle', name: 'Alles', description: 'Zoek in alle bronnen' },
  { id: 'wetgeving', name: 'Wetgeving', description: 'Wetten en regelgeving' },
  { id: 'jurisprudentie', name: 'Jurisprudentie', description: 'Rechtspraak en uitspraken' },
  { id: 'verdragen', name: 'Verdragen', description: 'Internationale verdragen' },
  { id: 'kamerstukken', name: 'Kamerstukken', description: 'Parlementaire stukken' }
]

const timeFilters = [
  { id: 'alle', name: 'Alle periodes' },
  { id: '2024', name: '2024' },
  { id: '2023', name: '2023' },
  { id: '5jaar', name: 'Laatste 5 jaar' },
  { id: '10jaar', name: 'Laatste 10 jaar' }
]

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Burgerlijk Wetboek Boek 7 - Bijzondere overeenkomsten',
    type: 'wet',
    source: 'wetten.overheid.nl',
    date: '2024-01-01',
    excerpt: 'Dit boek van het Burgerlijk Wetboek bevat bepalingen over bijzondere overeenkomsten, waaronder koop, huur, arbeidsovereenkomst...',
    url: 'https://wetten.overheid.nl',
    relevance: 95
  },
  {
    id: '2',
    title: 'HR 15 december 2023, ECLI:NL:HR:2023:1891',
    type: 'jurisprudentie',
    source: 'rechtspraak.nl',
    date: '2023-12-15',
    excerpt: 'Hoge Raad uitspraak betreffende arbeidsrecht en ontslagbescherming. Cassatie in het belang der wet...',
    url: 'https://rechtspraak.nl',
    relevance: 88
  },
  {
    id: '3',
    title: 'Wet op de arbeidsovereenkomst',
    type: 'wet',
    source: 'wetten.overheid.nl',
    date: '2023-07-01',
    excerpt: 'De Wet op de arbeidsovereenkomst regelt de rechtsbetrekking tussen werkgever en werknemer...',
    url: 'https://wetten.overheid.nl',
    relevance: 82
  }
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('alle')
  const [timeFilter, setTimeFilter] = useState('alle')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [exactMatch, setExactMatch] = useState(false)
  const [includeArchived, setIncludeArchived] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setHasSearched(true)

    // Simulate API call
    setTimeout(() => {
      setResults(mockResults)
      setIsLoading(false)
    }, 1000)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wet': return <BookOpen className="h-4 w-4" />
      case 'jurisprudentie': return <Scale className="h-4 w-4" />
      case 'verdrag': return <ExternalLink className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'wet': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'jurisprudentie': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'verdrag': return 'bg-green-50 text-green-700 border-green-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Nederlandse Wetgeving Zoeken
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Doorzoek 15.000+ wetsartikelen, rechtspraak en jurisprudentie met geavanceerde zoekfuncties.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Search and Filters */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Zoekfilters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">Zoekterm</label>
                  <div className="flex gap-2">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Zoek in wetgeving..."
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Categorie</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {searchCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Periode</label>
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeFilters.map((filter) => (
                        <SelectItem key={filter.id} value={filter.id}>
                          {filter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Advanced Options */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <Checkbox 
                      checked={exactMatch} 
                      onCheckedChange={setExactMatch}
                    />
                    <div>
                      <div className="text-sm font-medium">Exacte overeenkomst</div>
                      <div className="text-xs text-gray-500">Zoek naar exacte woordcombinaties</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <Checkbox 
                      checked={includeArchived} 
                      onCheckedChange={setIncludeArchived}
                    />
                    <div>
                      <div className="text-sm font-medium">Inclusief gearchiveerd</div>
                      <div className="text-xs text-gray-500">Toon ook vervallen wetgeving</div>
                    </div>
                  </label>
                </div>

                {/* Search Button */}
                <Button 
                  onClick={handleSearch} 
                  className="w-full"
                  disabled={!searchQuery.trim() || isLoading}
                >
                  <Search className="h-4 w-4 mr-2" />
                  {isLoading ? 'Zoeken...' : 'Zoeken'}
                </Button>

                {/* Quick Searches */}
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Populaire zoekopdrachten</h4>
                  <div className="space-y-1">
                    {[
                      'Arbeidsovereenkomst',
                      'Huurrecht',
                      'Belastingrecht',
                      'Strafrecht',
                      'Verkeersrecht'
                    ].map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="block text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {!hasSearched ? (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">Begin met zoeken</h3>
                  <p className="text-gray-600 max-w-md">
                    Gebruik de zoekfuncties aan de linkerkant om door Nederlandse wetgeving en jurisprudentie te zoeken.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Results Header */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">Zoekresultaten</h2>
                        {results.length > 0 && (
                          <p className="text-sm text-gray-600">
                            {results.length} resultaten gevonden voor "{searchQuery}"
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {category === 'alle' ? 'Alle categorieën' : searchCategories.find(c => c.id === category)?.name}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {timeFilter === 'alle' ? 'Alle periodes' : timeFilters.find(t => t.id === timeFilter)?.name}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Loading State */}
                {isLoading ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Zoeken in Nederlandse wetgeving...</p>
                    </CardContent>
                  </Card>
                ) : results.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold mb-2">Geen resultaten gevonden</h3>
                      <p className="text-gray-600 mb-4">
                        Probeer andere zoektermen of pas uw filters aan.
                      </p>
                      <Button variant="outline" onClick={() => {
                        setSearchQuery('')
                        setCategory('alle')
                        setTimeFilter('alle')
                      }}>
                        Filters wissen
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  /* Results List */
                  results.map((result) => (
                    <Card key={result.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className={getTypeColor(result.type)}>
                              {getTypeIcon(result.type)}
                              <span className="ml-1 capitalize">{result.type}</span>
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {new Date(result.date).toLocaleDateString('nl-NL')}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Star className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                          {result.title}
                        </h3>

                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {result.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Bron: {result.source}</span>
                            <span>Relevantie: {result.relevance}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={result.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Bekijk origineel
                              </a>
                            </Button>
                            <Button size="sm">
                              Analyseer
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 