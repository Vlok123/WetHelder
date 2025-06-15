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
  thisWeekQueries: number
  totalNotes: number
  totalCategories: number
  favoriteQueries: number
  averageResponseTime: string
  mostUsedProfession: string
  recentActivity: Array<{
    id: string
    type: 'query' | 'note' | 'category'
    title: string
    timestamp: string
    details?: string
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

const mockChatSessions: ChatSession[] = [
  {
    id: '1',
    title: 'Arbeidsrecht ontslagbescherming',
    messages: 12,
    lastActivity: '2 uur geleden',
    profession: 'algemeen',
    tags: ['arbeidsrecht', 'ontslag']
  },
  {
    id: '2',
    title: 'Huurrecht opzegging',
    messages: 8,
    lastActivity: '1 dag geleden',
    profession: 'algemeen',
    tags: ['huurrecht', 'opzegging']
  },
  {
    id: '3',
    title: 'Verkeersrecht boete betwisten',
    messages: 15,
    lastActivity: '3 dagen geleden',
    profession: 'algemeen',
    tags: ['verkeersrecht', 'boete']
  }
]

const mockFavorites: Favorite[] = [
  {
    id: '1',
    title: 'Burgerlijk Wetboek Artikel 7:611',
    type: 'article',
    content: 'Arbeidsovereenkomst ontslagbescherming...',
    date: '2024-01-15',
    url: 'https://wetten.overheid.nl'
  },
  {
    id: '2',
    title: 'Chat: Kan mijn werkgever mij ontslaan?',
    type: 'chat',
    content: 'Uitgebreide chat over ontslagrecht...',
    date: '2024-01-10'
  }
]

const mockRecentSearches: RecentSearch[] = [
  {
    id: '1',
    query: 'arbeidsovereenkomst ontslag',
    category: 'wetgeving',
    results: 45,
    date: '2024-01-15'
  },
  {
    id: '2',
    query: 'huurrecht opzegging',
    category: 'jurisprudentie',
    results: 23,
    date: '2024-01-14'
  }
]

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
      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        const formattedQueries = (historyData.queries || []).map((query: any) => ({
          id: query.id,
          question: query.question,
          answer: query.answer || 'Antwoord wordt geladen...',
          profession: query.profession,
          createdAt: query.createdAt,
          isFavorite: false, // Would need to implement favorites in database
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
        thisWeekQueries: 0,
        totalNotes: 0,
        totalCategories: 0,
        favoriteQueries: 0,
        averageResponseTime: '0s',
        mostUsedProfession: 'Algemeen',
        recentActivity: []
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
    setQueries(queries.map(q => 
      q.id === queryId ? { ...q, isFavorite: !q.isFavorite } : q
    ))
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
      case 'jurist': return '⚖️'
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
      <Navigation />
      
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
                <User className="h-4 w-4 mr-1" />
                Premium Account
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Instellingen
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
                      <p className="text-sm font-medium text-gray-600">Chat Sessies</p>
                      <p className="text-2xl font-bold text-gray-900">{mockChatSessions.length}</p>
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
                      <p className="text-2xl font-bold text-gray-900">{mockFavorites.length}</p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Zoekopdrachten</p>
                      <p className="text-2xl font-bold text-gray-900">{mockRecentSearches.length}</p>
                    </div>
                    <Search className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Deze Maand</p>
                      <p className="text-2xl font-bold text-gray-900">47</p>
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
                    Recente Chat Sessies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockChatSessions.slice(0, 3).map((chat) => (
                      <div key={chat.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{chat.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {getProfessionIcon(chat.profession)} {chat.profession}
                            </Badge>
                            <span className="text-xs text-gray-500">{chat.messages} berichten</span>
                            <span className="text-xs text-gray-500">• {chat.lastActivity}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Favorieten
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockFavorites.map((favorite) => (
                      <div key={favorite.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3 flex-1">
                          {getTypeIcon(favorite.type)}
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">{favorite.title}</h4>
                            <p className="text-xs text-gray-500">{favorite.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Share2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
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
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporteren
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {mockChatSessions.map((chat) => (
                <Card key={chat.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{chat.title}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {getProfessionIcon(chat.profession)} {chat.profession}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{chat.messages} berichten</span>
                          <span>•</span>
                          <span>{chat.lastActivity}</span>
                          <span>•</span>
                          <div className="flex gap-1">
                            {chat.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm">
                          Hervatten
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Favorieten</h2>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter op type
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {mockFavorites.map((favorite) => (
                <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(favorite.type)}
                        <Badge variant="secondary" className="text-xs capitalize">
                          {favorite.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{favorite.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{favorite.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Opgeslagen op {new Date(favorite.date).toLocaleDateString('nl-NL')}
                      </span>
                      <Button size="sm" variant="outline">
                        Bekijken
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search History Tab */}
        {activeTab === 'searches' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Zoekgeschiedenis</h2>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Wis geschiedenis
              </Button>
            </div>

            <div className="space-y-3">
              {mockRecentSearches.map((search) => (
                <Card key={search.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Search className="h-5 w-5 text-gray-400" />
                        <div>
                          <h3 className="font-medium text-gray-900">"{search.query}"</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {search.category}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {search.results} resultaten
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">
                              {new Date(search.date).toLocaleDateString('nl-NL')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Opnieuw zoeken
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Gebruiksstatistieken</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activiteit per Maand</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-40 flex items-center justify-center bg-gray-50 rounded">
                    <p className="text-gray-500">Grafiek wordt geladen...</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Meest Gebruikte Categorieën</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Arbeidsrecht', percentage: 45, color: 'bg-blue-500' },
                      { name: 'Huurrecht', percentage: 25, color: 'bg-green-500' },
                      { name: 'Verkeersrecht', percentage: 20, color: 'bg-yellow-500' },
                      { name: 'Strafrecht', percentage: 10, color: 'bg-red-500' }
                    ].map((category) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${category.color}`}
                              style={{ width: `${category.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{category.percentage}%</span>
                        </div>
                      </div>
                    ))}
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