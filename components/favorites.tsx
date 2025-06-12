'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Search, 
  Trash2, 
  Clock, 
  Filter,
  X,
  RefreshCw,
  ExternalLink,
  Copy,
  Share2
} from 'lucide-react'

interface FavoriteQuery {
  id: string
  queryId: string
  createdAt: string
  query: {
    id: string
    question: string
    answer: string
    profession: string
    sources: string
    createdAt: string
  }
}

interface FavoritesProps {
  onQuerySelect?: (query: FavoriteQuery['query']) => void
  className?: string
}

export function Favorites({ onQuerySelect, className }: FavoritesProps) {
  const { data: session } = useSession()
  const [favorites, setFavorites] = useState<FavoriteQuery[]>([])
  const [loading, setLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState('')
  const [professionFilter, setProfessionFilter] = useState('all')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [expandedAnswer, setExpandedAnswer] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      fetchFavorites()
    }
  }, [session])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/favorites')
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (queryId: string) => {
    try {
      setIsDeleting(queryId)
      const response = await fetch(`/api/user/favorites?queryId=${queryId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setFavorites(prev => prev.filter(fav => fav.queryId !== queryId))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
    } finally {
      setIsDeleting(null)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const shareQuery = async (query: FavoriteQuery['query']) => {
    const shareText = `Juridische vraag: ${query.question}\n\nAntwoord: ${query.answer.substring(0, 200)}...\n\nVia WetHelder`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Juridische vraag - WetHelder',
          text: shareText
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      copyToClipboard(shareText)
    }
  }

  const handleQuerySelect = (query: FavoriteQuery['query']) => {
    if (onQuerySelect) {
      onQuerySelect(query)
    }
  }

  const toggleAnswerExpansion = (queryId: string) => {
    setExpandedAnswer(expandedAnswer === queryId ? null : queryId)
  }

  const filteredFavorites = favorites.filter(fav => {
    const matchesSearch = 
      fav.query.question.toLowerCase().includes(searchFilter.toLowerCase()) ||
      fav.query.answer.toLowerCase().includes(searchFilter.toLowerCase())
    const matchesProfession = professionFilter === 'all' || fav.query.profession === professionFilter
    return matchesSearch && matchesProfession
  })

  const professions = Array.from(new Set(favorites.map(fav => fav.query.profession)))

  if (!session) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Favorieten
          </CardTitle>
          <CardDescription>
            Log in om je favoriete vragen te bekijken
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
            <Heart className="h-5 w-5 text-red-500" />
            Favorieten
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFavorites}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          Je favoriete juridische vragen en antwoorden ({favorites.length} items)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek in favorieten..."
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

        {/* Favorites List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {favorites.length === 0 ? (
              <>
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nog geen favorieten</p>
                <p className="text-sm">Markeer vragen als favoriet om ze hier te bewaren</p>
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
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredFavorites.map((favorite) => (
              <Card key={favorite.id} className="border-l-4 border-l-red-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 
                        className="font-medium text-sm cursor-pointer hover:text-primary line-clamp-2"
                        onClick={() => handleQuerySelect(favorite.query)}
                      >
                        {favorite.query.question}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(favorite.createdAt).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                        <Badge variant="outline" className="text-xs">
                          {favorite.query.profession}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(favorite.query.question + '\n\n' + favorite.query.answer)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => shareQuery(favorite.query)}
                        className="h-8 w-8 p-0"
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFavorite(favorite.queryId)}
                        disabled={isDeleting === favorite.queryId}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        {isDeleting === favorite.queryId ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="text-sm text-muted-foreground">
                    <p className={`${expandedAnswer === favorite.query.id ? '' : 'line-clamp-3'}`}>
                      {favorite.query.answer}
                    </p>
                    {favorite.query.answer.length > 200 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAnswerExpansion(favorite.query.id)}
                        className="mt-2 h-auto p-0 text-xs text-primary"
                      >
                        {expandedAnswer === favorite.query.id ? 'Minder tonen' : 'Meer tonen'}
                      </Button>
                    )}
                  </div>
                  
                  {favorite.query.sources && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Bronnen:</p>
                      <div className="text-xs text-muted-foreground">
                        {JSON.parse(favorite.query.sources).slice(0, 2).map((source: string, index: number) => (
                          <div key={index} className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            <span className="truncate">{source}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 