'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  User, 
  MessageSquare, 
  Clock,
  TrendingUp,
  Activity,
  BarChart3,
  Settings,
  Shield,
  RefreshCw,
  Calendar,
  Star,
  AlertTriangle,
  Database,
  Server,
  Globe,
  Eye,
  UserCheck,
  Zap,
  Home,
  BookOpen,
  Heart,
  FolderPlus,
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  Archive,
  Tag,
  Filter,
  SortAsc,
  Download,
  Upload,
  Share2,
  History,
  PieChart,
  Bookmark,
  Lightbulb,
  Target,
  Folder,
  Save,
  X,
  ChevronRight,
  MoreHorizontal,
  Crown,
  LogOut
} from 'lucide-react'
import { Navigation } from '@/components/navigation'

interface DashboardStats {
  totalQueries: number
  todayQueries: number
  weekQueries: number
  monthQueries: number
  favoritesCount: number
  notesCount: number
  categoriesCount: number
  averageResponseTime: string
  mostUsedProfession: string
  memberSince: string
  role: string
  dailyStats: Array<{
    date: string
    count: number
  }>
  recentActivity: Array<{
    id: string
    type: 'query' | 'note' | 'category'
    title: string
    timestamp: string
    details?: string
    profession?: string
    sources?: string[]
  }>
  professionBreakdown: Array<{
    profession: string
    count: number
  }>
}

interface UserQuery {
  id: string
  question: string
  answer: string
  profession: string
  createdAt: string
  isFavorite: boolean
  categories: string[]
  sources: string[]
}

interface UserNote {
  id: string
  title: string
  content: string
  color: string
  tags: string[]
  queryId?: string
  createdAt: string
  updatedAt: string
}

interface UserCategory {
  id: string
  name: string
  description: string
  color: string
  icon: string
  queryCount: number
  createdAt: string
}

interface ChatSession {
  id: string
  title: string
  messages: number
  lastActivity: string
  profession: string
  tags: string[]
}

interface Favorite {
  id: string
  title: string
  type: 'chat' | 'search' | 'article'
  content: string
  date: string
  url?: string
}

interface RecentSearch {
  id: string
  query: string
  category: string
  results: number
  date: string
}



export default function MemberDashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [queries, setQueries] = useState<UserQuery[]>([])
  const [notes, setNotes] = useState<UserNote[]>([])
  const [categories, setCategories] = useState<UserCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'queries' | 'notes' | 'categories' | 'chats' | 'favorites' | 'searches' | 'stats'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)

  // Modal states - simplified without Dialog component for now
  const [showNewNote, setShowNewNote] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [editingNote, setEditingNote] = useState<UserNote | null>(null)
  const [editingCategory, setEditingCategory] = useState<UserCategory | null>(null)

  // Form states
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    color: 'blue',
    tags: '',
    queryId: ''
  })

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: 'gray',
    icon: 'folder'
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      redirect('/auth/signin')
      return
    }

    loadDashboardData()
  }, [session, status])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load dashboard stats from API
      const statsResponse = await fetch('/api/dashboard/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Load chat history (queries)
      const historyResponse = await fetch('/api/chat-history')
      let userFavorites: string[] = []
      
      // Load user favorites
      try {
        const favoritesResponse = await fetch('/api/user/favorites')
        if (favoritesResponse.ok) {
          const favoritesData = await favoritesResponse.json()
          userFavorites = favoritesData.favorites.map((fav: any) => fav.queryId)
        }
      } catch (favError) {
        console.log('Could not load favorites:', favError)
      }

      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        const formattedQueries = (historyData.queries || []).map((query: any) => ({
          id: query.id,
          question: query.question,
          answer: query.answer || 'Antwoord wordt geladen...',
          profession: query.profession,
          createdAt: query.createdAt,
          isFavorite: userFavorites.includes(query.id),
          categories: [], // Would need to implement categories in database
          sources: query.sources ? JSON.parse(query.sources) : []
        }))
        setQueries(formattedQueries)
      }
      
      // For now, use empty arrays for notes and categories until we implement these features
      setNotes([])
      setCategories([])
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Fallback to empty data
      setStats({
        totalQueries: 0,
        todayQueries: 0,
        weekQueries: 0,
        monthQueries: 0,
        favoritesCount: 0,
        notesCount: 0,
        categoriesCount: 0,
        averageResponseTime: '0s',
        mostUsedProfession: 'Algemeen',
        memberSince: new Date().toISOString(),
        role: 'FREE',
        dailyStats: [],
        recentActivity: [],
        professionBreakdown: []
      })
      setQueries([])
      setNotes([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const saveNote = async () => {
    // Mock save for now
    console.log('Saving note:', noteForm)
    setShowNewNote(false)
    setEditingNote(null)
    setNoteForm({ title: '', content: '', color: 'blue', tags: '', queryId: '' })
  }

  const saveCategory = async () => {
    // Mock save for now
    console.log('Saving category:', categoryForm)
    setShowNewCategory(false)
    setEditingCategory(null)
    setCategoryForm({ name: '', description: '', color: 'gray', icon: 'folder' })
  }

  const toggleFavorite = async (queryId: string) => {
    try {
      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queryId }),
      })

      if (response.ok) {
        const result = await response.json()
        // Update local state
        setQueries(queries.map(q => 
          q.id === queryId ? { ...q, isFavorite: result.isFavorite } : q
        ))
        
        // Reload stats to update favorites count
        const statsResponse = await fetch('/api/dashboard/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }
      } else {
        console.error('Failed to toggle favorite')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const deleteNote = async (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId))
  }

  const deleteCategory = async (categoryId: string) => {
    setCategories(categories.filter(cat => cat.id !== categoryId))
  }

  const filteredQueries = queries.filter(query => {
    const matchesSearch = query.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || query.categories.includes(selectedCategory)
    const matchesFavorites = !showOnlyFavorites || query.isFavorite
    
    return matchesSearch && matchesCategory && matchesFavorites
  })

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const colorOptions = [
    { value: 'blue', label: 'Blauw', class: 'bg-blue-100 border-blue-300' },
    { value: 'green', label: 'Groen', class: 'bg-green-100 border-green-300' },
    { value: 'yellow', label: 'Geel', class: 'bg-yellow-100 border-yellow-300' },
    { value: 'red', label: 'Rood', class: 'bg-red-100 border-red-300' },
    { value: 'purple', label: 'Paars', class: 'bg-purple-100 border-purple-300' },
    { value: 'gray', label: 'Grijs', class: 'bg-gray-100 border-gray-300' }
  ]

  const iconOptions = [
    { value: 'folder', label: 'Map', icon: Folder },
    { value: 'book', label: 'Boek', icon: BookOpen },
    { value: 'star', label: 'Ster', icon: Star },
    { value: 'heart', label: 'Hart', icon: Heart },
    { value: 'target', label: 'Doel', icon: Target },
    { value: 'lightbulb', label: 'Idee', icon: Lightbulb }
  ]

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Onbekende datum'
      }
      return date.toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Onbekende datum'
    }
  }

  const getColorClass = (color: string) => {
    const colorMap: any = {
      blue: 'bg-blue-100 border-blue-300 text-blue-800',
      green: 'bg-green-100 border-green-300 text-green-800',
      yellow: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      red: 'bg-red-100 border-red-300 text-red-800',
      purple: 'bg-purple-100 border-purple-300 text-purple-800',
      gray: 'bg-gray-100 border-gray-300 text-gray-800'
    }
    return colorMap[color] || colorMap.gray
  }

  const getIcon = (iconName: string) => {
    const iconMap: any = {
      folder: Folder,
      book: BookOpen,
      star: Star,
      heart: Heart,
      target: Target,
      lightbulb: Lightbulb
    }
    const IconComponent = iconMap[iconName] || Folder
    return <IconComponent className="h-4 w-4" />
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Dashboard laden...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  // Check if user is admin and redirect to admin dashboard
  if (session.user?.role === 'ADMIN') {
    redirect('/admin')
    return null
  }

  const getProfessionIcon = (profession: string) => {
    switch (profession) {
      case 'jurist': return ''
      case 'politieagent': return '🚔'
      case 'student': return '🎓'
      case 'ondernemer': return '💼'
      default: return '👤'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chat': return <MessageSquare className="h-4 w-4" />
      case 'search': return <Search className="h-4 w-4" />
      case 'article': return <BookOpen className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welkom terug, {session?.user?.name || 'Gebruiker'}!
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Uw persoonlijke juridische dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                <Crown className="h-4 w-4 mr-1" />
                {stats?.role === 'ADMIN' ? 'Admin Account' : 'Gratis Account'}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Uitloggen
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'overview', name: 'Overzicht', icon: BarChart3 },
            { id: 'chats', name: 'Chat Geschiedenis', icon: MessageSquare },
            { id: 'favorites', name: 'Favorieten', icon: Star },
            { id: 'searches', name: 'Zoekgeschiedenis', icon: Search },
            { id: 'stats', name: 'Statistieken', icon: TrendingUp }
          ].map((tab) => {
            const IconComponent = tab.icon
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className="whitespace-nowrap"
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {tab.name}
              </Button>
            )
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Totaal Vragen</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalQueries || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats?.todayQueries || 0} vandaag
                      </p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Favorieten</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.favoritesCount || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Opgeslagen items
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Deze Week</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.weekQueries || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Vragen gesteld
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Deze Maand</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.monthQueries || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Totaal activiteit
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recente Activiteit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.recentActivity?.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex-shrink-0 mt-1">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{activity.title}</h4>
                          {activity.details && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{activity.details}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {activity.profession && (
                              <Badge variant="secondary" className="text-xs">
                                {getProfessionIcon(activity.profession)} {activity.profession}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatDate(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Nog geen activiteit</p>
                        <p className="text-sm">Begin met het stellen van een vraag!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Gebruiksstatistieken
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Meest gebruikt profiel</span>
                      <Badge variant="secondary" className="text-xs">
                        {getProfessionIcon(stats?.mostUsedProfession || 'algemeen')} {stats?.mostUsedProfession || 'Algemeen'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Gemiddelde responstijd</span>
                      <span className="text-sm text-gray-600">{stats?.averageResponseTime || '0s'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Lid sinds</span>
                      <span className="text-sm text-gray-600">
                        {stats?.memberSince ? new Date(stats.memberSince).toLocaleDateString('nl-NL', {
                          month: 'long',
                          year: 'numeric'
                        }) : 'Onbekend'}
                      </span>
                    </div>

                    {stats?.professionBreakdown && stats.professionBreakdown.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Profiel verdeling</h4>
                        <div className="space-y-2">
                          {stats.professionBreakdown.slice(0, 3).map((prof) => (
                            <div key={prof.profession} className="flex items-center justify-between">
                              <span className="text-xs text-gray-600 capitalize">{prof.profession}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500"
                                    style={{ 
                                      width: `${Math.min(100, (prof.count / (stats?.totalQueries || 1)) * 100)}%` 
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">{prof.count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Chat History Tab */}
        {activeTab === 'chats' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Chat Geschiedenis</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}>
                  <Star className={`h-4 w-4 mr-2 ${showOnlyFavorites ? 'fill-current text-yellow-500' : ''}`} />
                  {showOnlyFavorites ? 'Alle' : 'Favorieten'}
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Vernieuwen
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredQueries.length > 0 ? (
                filteredQueries.map((query) => (
                  <Card key={query.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 truncate">{query.question}</h3>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {getProfessionIcon(query.profession)} {query.profession}
                            </Badge>
                            {query.isFavorite && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {query.answer}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{formatDate(query.createdAt)}</span>
                            {query.sources.length > 0 && (
                              <>
                                <span>•</span>
                                <span>{query.sources.length} bronnen</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleFavorite(query.id)}
                          >
                            <Star className={`h-4 w-4 ${query.isFavorite ? 'fill-current text-yellow-500' : ''}`} />
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/ask?resume=${query.id}`}>
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Hervatten
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {showOnlyFavorites ? 'Geen favoriete vragen' : 'Nog geen chat geschiedenis'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {showOnlyFavorites 
                      ? 'Markeer vragen als favoriet om ze hier te zien.'
                      : 'Begin met het stellen van een juridische vraag om uw geschiedenis op te bouwen.'
                    }
                  </p>
                  <Button asChild>
                    <Link href="/ask">
                      <Plus className="h-4 w-4 mr-2" />
                      Nieuwe vraag stellen
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Favorieten</h2>
              <Button variant="outline" size="sm" onClick={loadDashboardData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Vernieuwen
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {queries.filter(q => q.isFavorite).length > 0 ? (
                queries.filter(q => q.isFavorite).map((favorite) => (
                  <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          <Badge variant="secondary" className="text-xs">
                            {getProfessionIcon(favorite.profession)} {favorite.profession}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleFavorite(favorite.id)}
                          >
                            <Star className="h-3 w-3 fill-current text-yellow-500" />
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/ask?resume=${favorite.id}`}>
                              <MessageSquare className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{favorite.question}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">{favorite.answer}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatDate(favorite.createdAt)}
                        </span>
                        <div className="flex items-center gap-2">
                          {favorite.sources.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {favorite.sources.length} bronnen
                            </Badge>
                          )}
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/ask?resume=${favorite.id}`}>
                              Bekijken
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nog geen favorieten</h3>
                  <p className="text-gray-600 mb-4">
                    Markeer vragen als favoriet door op de ster te klikken in uw chat geschiedenis.
                  </p>
                  <Button asChild>
                    <Link href="/ask">
                      <Plus className="h-4 w-4 mr-2" />
                      Nieuwe vraag stellen
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search History Tab */}
        {activeTab === 'searches' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Zoekgeschiedenis</h2>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Vernieuwen
              </Button>
            </div>

            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Zoekgeschiedenis komt binnenkort</h3>
              <p className="text-gray-600 mb-4">
                Deze functie wordt binnenkort toegevoegd om uw zoekgeschiedenis bij te houden.
              </p>
              <Button asChild>
                <Link href="/ask">
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe vraag stellen
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Gebruiksstatistieken</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Activiteit Overzicht</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Totaal vragen</span>
                      <span className="font-semibold">{stats?.totalQueries || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Deze week</span>
                      <span className="font-semibold">{stats?.weekQueries || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Deze maand</span>
                      <span className="font-semibold">{stats?.monthQueries || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Favorieten</span>
                      <span className="font-semibold">{stats?.favoritesCount || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Profiel Gebruik</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.professionBreakdown && stats.professionBreakdown.length > 0 ? (
                      stats.professionBreakdown.map((prof) => {
                        const percentage = Math.round((prof.count / (stats?.totalQueries || 1)) * 100)
                        return (
                          <div key={prof.profession} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{getProfessionIcon(prof.profession)}</span>
                              <span className="text-sm font-medium capitalize">{prof.profession}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-8 text-right">{prof.count}</span>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">Nog geen data beschikbaar</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Laatste 7 Dagen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.dailyStats && stats.dailyStats.length > 0 ? (
                      stats.dailyStats.map((day) => {
                        const date = new Date(day.date)
                        const dayName = date.toLocaleDateString('nl-NL', { weekday: 'short' })
                        const maxCount = Math.max(...stats.dailyStats.map(d => d.count), 1)
                        const percentage = (day.count / maxCount) * 100
                        
                        return (
                          <div key={day.date} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 w-8">{dayName}</span>
                            <div className="flex-1 mx-3">
                              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-medium w-6 text-right">{day.count}</span>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">Nog geen activiteit</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Account Informatie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Account type</span>
                      <Badge variant="secondary">{stats?.role || 'FREE'}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Lid sinds</span>
                      <span className="text-sm">
                        {stats?.memberSince ? new Date(stats.memberSince).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : 'Onbekend'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Meest gebruikt profiel</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{getProfessionIcon(stats?.mostUsedProfession || 'algemeen')}</span>
                        <span className="text-sm capitalize">{stats?.mostUsedProfession || 'Algemeen'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Gem. responstijd</span>
                      <span className="text-sm">{stats?.averageResponseTime || '0s'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Snelle Acties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" asChild>
                      <Link href="/ask">
                        <Plus className="h-4 w-4 mr-2" />
                        Nieuwe vraag stellen
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href="/chat-history">
                        <History className="h-4 w-4 mr-2" />
                        Volledige geschiedenis
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={loadDashboardData}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Data vernieuwen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 