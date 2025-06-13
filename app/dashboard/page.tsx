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
  Users, 
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

export default function MemberDashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [queries, setQueries] = useState<UserQuery[]>([])
  const [notes, setNotes] = useState<UserNote[]>([])
  const [categories, setCategories] = useState<UserCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'queries' | 'notes' | 'categories'>('overview')
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Dashboard laden...</p>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
                <Home className="h-5 w-5" />
                WetHelder
              </Link>
              <div className="h-4 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold">Mijn Dashboard</h1>
              {session.user?.role === 'PREMIUM' && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={loadDashboardData}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Vernieuwen
              </Button>
              <Link href="/ask">
                <Button>Nieuwe Vraag</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 mb-8 bg-muted rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overzicht', icon: PieChart },
              { id: 'queries', label: 'Mijn Vragen', icon: MessageSquare },
              { id: 'notes', label: 'Notities', icon: FileText },
              { id: 'categories', label: 'Categorieën', icon: Folder }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              )
            })}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Welcome Section */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        Welkom terug, {session.user?.name || 'Gebruiker'}!
                      </h2>
                      <p className="text-muted-foreground">
                        Hier is een overzicht van uw juridische activiteiten en verzamelde kennis.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Lid sinds</p>
                      <p className="font-medium">
                        {formatDate(new Date().toISOString())}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Totaal Vragen</p>
                        <p className="text-2xl font-bold">{stats?.totalQueries || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Notities</p>
                        <p className="text-2xl font-bold">{stats?.totalNotes || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Folder className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Categorieën</p>
                        <p className="text-2xl font-bold">{stats?.totalCategories || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Heart className="h-8 w-8 text-red-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Favorieten</p>
                        <p className="text-2xl font-bold">{stats?.favoriteQueries || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Recente Activiteit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.recentActivity?.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'query' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'note' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {activity.type === 'query' ? <MessageSquare className="h-4 w-4" /> :
                           activity.type === 'note' ? <FileText className="h-4 w-4" /> :
                           <Folder className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.title}</p>
                          {activity.details && (
                            <p className="text-sm text-muted-foreground">{activity.details}</p>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    )) || (
                      <p className="text-muted-foreground text-center py-4">
                        Nog geen activiteit beschikbaar
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Queries Tab */}
          {activeTab === 'queries' && (
            <div className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Zoek in uw vragen..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter op categorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle categorieën</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant={showOnlyFavorites ? 'default' : 'outline'}
                      onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                      className="flex items-center gap-2"
                    >
                      <Heart className="h-4 w-4" />
                      Alleen favorieten
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Queries List */}
              <div className="space-y-4">
                {filteredQueries.map((query) => (
                  <Card key={query.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium line-clamp-2">{query.question}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(query.id)}
                              className={query.isFavorite ? 'text-red-600' : 'text-gray-400'}
                            >
                              <Heart className="h-4 w-4" fill={query.isFavorite ? 'currentColor' : 'none'} />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline">{query.profession}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(query.createdAt)}
                            </span>
                            {query.categories.map((category) => (
                              <Badge key={category} variant="secondary" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {query.answer.substring(0, 200)}...
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {query.sources.length} bronnen
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredQueries.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">Geen vragen gevonden</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm || selectedCategory !== 'all' || showOnlyFavorites
                          ? 'Probeer uw filters aan te passen'
                          : 'Begin met het stellen van uw eerste juridische vraag'}
                      </p>
                      <Link href="/ask">
                        <Button>Stel een vraag</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Notes Tab - Simplified for now */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Mijn Notities</h2>
                  <p className="text-muted-foreground">
                    Organiseer uw juridische kennis met persoonlijke notities
                  </p>
                </div>
                <Button onClick={() => setShowNewNote(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nieuwe Notitie
                </Button>
              </div>

              {/* Notes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotes.map((note) => (
                  <Card key={note.id} className={`hover:shadow-md transition-shadow ${getColorClass(note.color)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium line-clamp-2">{note.title}</h3>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingNote(note)
                              setNoteForm({
                                title: note.title,
                                content: note.content,
                                color: note.color,
                                tags: note.tags.join(', '),
                                queryId: note.queryId || ''
                              })
                              setShowNewNote(true)
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm mb-3 line-clamp-4">
                        {note.content}
                      </div>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {note.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-white/50 rounded-full text-xs">
                              <Tag className="h-3 w-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {formatDate(note.updatedAt)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredNotes.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Geen notities gevonden</h3>
                    <p className="text-muted-foreground mb-4">
                      Begin met het maken van uw eerste notitie
                    </p>
                    <Button onClick={() => setShowNewNote(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Eerste Notitie Maken
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Categories Tab - Simplified for now */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Mijn Categorieën</h2>
                  <p className="text-muted-foreground">
                    Organiseer uw vragen en kennis in aangepaste categorieën
                  </p>
                </div>
                <Button onClick={() => setShowNewCategory(true)} className="flex items-center gap-2">
                  <FolderPlus className="h-4 w-4" />
                  Nieuwe Categorie
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className={`hover:shadow-md transition-shadow ${getColorClass(category.color)}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white/50">
                            {getIcon(category.icon)}
                          </div>
                          <div>
                            <h3 className="font-medium">{category.name}</h3>
                            <p className="text-sm opacity-75">{category.queryCount} vragen</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCategory(category.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {category.description && (
                        <p className="text-sm mb-4 opacity-75">{category.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs opacity-75">
                        <span>Aangemaakt</span>
                        <span>{formatDate(category.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {categories.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Geen categorieën gevonden</h3>
                    <p className="text-muted-foreground mb-4">
                      Begin met het maken van uw eerste categorie om uw vragen te organiseren
                    </p>
                    <Button onClick={() => setShowNewCategory(true)}>
                      <FolderPlus className="h-4 w-4 mr-2" />
                      Eerste Categorie Maken
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 