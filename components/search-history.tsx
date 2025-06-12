'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  History, 
  Search, 
  Trash2, 
  Clock, 
  Filter,
  X,
  RefreshCw
} from 'lucide-react'

interface SearchHistoryItem {
  id: string
  searchTerm: string
  profession: string
  resultCount: number
  createdAt: string
}

interface SearchHistoryProps {
  onSearchSelect?: (searchTerm: string, profession: string) => void
  className?: string
}

export function SearchHistory({ onSearchSelect, className }: SearchHistoryProps) {
  const { data: session } = useSession()
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState('')
  const [professionFilter, setProfessionFilter] = useState('all')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      fetchSearchHistory()
    }
  }, [session])

  const fetchSearchHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/search-history')
      if (response.ok) {
        const data = await response.json()
        setSearchHistory(data.searchHistory || [])
      }
    } catch (error) {
      console.error('Error fetching search history:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteSearchItem = async (id: string) => {
    try {
      setIsDeleting(id)
      const response = await fetch(`/api/user/search-history?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setSearchHistory(prev => prev.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error('Error deleting search item:', error)
    } finally {
      setIsDeleting(null)
    }
  }

  const clearAllHistory = async () => {
    try {
      const response = await fetch('/api/user/search-history?clearAll=true', {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setSearchHistory([])
      }
    } catch (error) {
      console.error('Error clearing search history:', error)
    }
  }

  const handleSearchSelect = (item: SearchHistoryItem) => {
    if (onSearchSelect) {
      onSearchSelect(item.searchTerm, item.profession)
    }
  }

  const filteredHistory = searchHistory.filter(item => {
    const matchesSearch = item.searchTerm.toLowerCase().includes(searchFilter.toLowerCase())
    const matchesProfession = professionFilter === 'all' || item.profession === professionFilter
    return matchesSearch && matchesProfession
  })

  const professions = Array.from(new Set(searchHistory.map(item => item.profession)))

  if (!session) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Zoekgeschiedenis
          </CardTitle>
          <CardDescription>
            Log in om je zoekgeschiedenis te bekijken
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Zoekgeschiedenis
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSearchHistory}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            {searchHistory.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllHistory}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Alles wissen
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Je recente juridische zoekopdrachten ({searchHistory.length} items)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek in geschiedenis..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-10"
            />
            {searchFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchFilter('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {professions.length > 1 && (
            <select
              value={professionFilter}
              onChange={(e) => setProfessionFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Alle beroepen</option>
              {professions.map(profession => (
                <option key={profession} value={profession}>
                  {profession.charAt(0).toUpperCase() + profession.slice(1)}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Search History Items */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchHistory.length === 0 ? (
              <>
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nog geen zoekgeschiedenis</p>
                <p className="text-sm">Je zoekopdrachten worden hier bewaard</p>
              </>
            ) : (
              <>
                <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Geen resultaten gevonden</p>
                <p className="text-sm">Probeer een andere zoekterm</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => handleSearchSelect(item)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm line-clamp-2 group-hover:text-primary">
                      {item.searchTerm}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(item.createdAt).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.profession}
                    </Badge>
                    {item.resultCount > 0 && (
                      <span className="text-xs">
                        {item.resultCount} bronnen
                      </span>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSearchItem(item.id)}
                  disabled={isDeleting === item.id}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  {isDeleting === item.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 