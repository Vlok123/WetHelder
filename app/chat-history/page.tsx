'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  MessageSquare, 
  Search,
  ChevronRight,
  Calendar,
  User
} from 'lucide-react'

interface Query {
  id: string
  question: string
  answer: string
  profession: string
  createdAt: string
}

export default function ChatHistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [queries, setQueries] = useState<Query[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchChatHistory()
    }
  }, [status, router])

  const fetchChatHistory = async () => {
    try {
      const response = await fetch('/api/chat-history')
      if (response.ok) {
        const data = await response.json()
        setQueries(data.queries || [])
      }
    } catch (error) {
      console.error('Error fetching chat history:', error)
    } finally {
      setLoading(false)
    }
  }

  const continueChat = (query: Query) => {
    // Opslaan van de query context en navigeren naar chat pagina
    sessionStorage.setItem('continueChat', JSON.stringify({
      question: query.question,
      answer: query.answer,
      profession: query.profession
    }))
    router.push('/')
  }

  const filteredQueries = queries.filter(query =>
    query.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    query.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return `Vandaag ${date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays === 1) {
      return `Gisteren ${date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays < 7) {
      return `${diffDays} dagen geleden`
    } else {
      return date.toLocaleDateString('nl-NL', { 
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }

  const getProfessionColor = (profession: string) => {
    const colors: Record<string, string> = {
      'politieagent': 'bg-blue-100 text-blue-800',
      'boa': 'bg-green-100 text-green-800',
      'advocaat': 'bg-purple-100 text-purple-800',
      'beveiliger': 'bg-orange-100 text-orange-800',
      'rechter': 'bg-red-100 text-red-800',
      'student': 'bg-indigo-100 text-indigo-800',
      'burger': 'bg-gray-100 text-gray-800'
    }
    return colors[profession] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              Chatgeschiedenis
            </h1>
            <p className="text-gray-600">
              Bekijk je eerdere vragen en ga verder waar je gebleven was
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek in je chatgeschiedenis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Chat History */}
          {filteredQueries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Geen resultaten gevonden' : 'Nog geen chatgeschiedenis'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Probeer andere zoektermen' 
                    : 'Start je eerste gesprek met WetHelder'
                  }
                </p>
                <Button onClick={() => router.push('/')}>
                  Nieuwe chat starten
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredQueries.map((query) => (
                <Card key={query.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 line-clamp-2">
                          {query.question}
                        </CardTitle>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDate(query.createdAt)}
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={getProfessionColor(query.profession)}
                          >
                            <User className="h-3 w-3 mr-1" />
                            {query.profession.charAt(0).toUpperCase() + query.profession.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => continueChat(query)}
                        className="ml-4 hover:bg-blue-50"
                      >
                        Verder chatten
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <CardDescription className="line-clamp-3">
                      {query.answer.substring(0, 200)}...
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 