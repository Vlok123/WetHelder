'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Crown, 
  Shield, 
  Home, 
  Settings,
  Clock,
  ArrowRight,
  BarChart3,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Activity,
  Database,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  X,
  User,
  FileText
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  premiumUsers: number
  freeUsers: number
  totalQueries: number
  loggedInQueries: number
  anonymousQueries: number
  todayQueries: number
  todayLoggedInQueries: number
  todayAnonymousQueries: number
  avgQueriesPerUser: number
  anonymousQueriesByProfession: Array<{ profession: string; count: number }>
  totalAangifteDownloads: number
  aangifteDownloadsToday: number
  aangifteDownloadsByType: Array<{ delictType: string; count: number }>
  systemHealth: 'healthy' | 'warning' | 'error'
  databaseSize: string
  lastBackup: string
  diagnostics?: {
    corporateQueries: number
    citrixQueries: number
    askApiQueries: number
    wetuitlegApiQueries: number
    queriesWithoutProperSources: number
    rateLimitMessages: number
    querySourceDistribution: Array<{ source: string; detail: string; count: number }>
  }
}

interface UserData {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  lastActive: string
  totalQueries: number
  todayQueries: number
  status: 'active' | 'suspended'
}

interface QueryData {
  id: string
  question: string
  fullQuestion: string
  answer: string
  fullAnswer: string
  profession: string
  userType: 'logged' | 'anonymous'
  userEmail: string
  userName: string
  userRole: string
  createdAt: string
}

interface SystemMetric {
  name: string
  value: string
  change: number
  status: 'up' | 'down' | 'stable'
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [queries, setQueries] = useState<QueryData[]>([])
  const [metrics, setMetrics] = useState<SystemMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('overview') // overview, users, queries
  const [queryUserTypeFilter, setQueryUserTypeFilter] = useState('all')
  const [queryProfessionFilter, setQueryProfessionFilter] = useState('all')
  const [selectedQuery, setSelectedQuery] = useState<QueryData | null>(null)
  const [showQueryModal, setShowQueryModal] = useState(false)
  const [querySearchTerm, setQuerySearchTerm] = useState('')
  const [queryPage, setQueryPage] = useState(1)
  const [queryLimit] = useState(100)

  const fetchAdminData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true)
      setRefreshError(null)
    }
    
    try {
      // Add timestamp to force fresh data and prevent any caching
      const timestamp = Date.now()
      const fetchOptions = {
        cache: 'no-store' as RequestCache,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
      
      const [statsRes, usersRes, metricsRes, queriesRes] = await Promise.all([
        fetch(`/api/admin/stats?_t=${timestamp}`, fetchOptions),
        fetch(`/api/admin/users?_t=${timestamp}`, fetchOptions),
        fetch(`/api/admin/metrics?_t=${timestamp}`, fetchOptions),
        fetch(`/api/admin/queries?limit=${queryLimit}&page=${queryPage}&search=${encodeURIComponent(querySearchTerm)}&userType=${queryUserTypeFilter}&profession=${queryProfessionFilter}&_t=${timestamp}`, fetchOptions)
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      } else {
        throw new Error('Failed to fetch stats')
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      } else {
        console.warn('Failed to fetch users data')
      }

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json()
        setMetrics(metricsData.metrics || [])
      } else {
        console.warn('Failed to fetch metrics data')
      }

      if (queriesRes.ok) {
        const queriesData = await queriesRes.json()
        setQueries(queriesData.queries || [])
      } else {
        console.warn('Failed to fetch queries data')
      }

      setLastRefresh(new Date())
      setRefreshError(null)
    } catch (error) {
      console.error('Error fetching admin data:', error)
      setRefreshError('Fout bij het ophalen van gegevens. Probeer het opnieuw.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [queryLimit, queryPage, querySearchTerm, queryUserTypeFilter, queryProfessionFilter])

  const fetchQueries = useCallback(async () => {
    try {
      const timestamp = Date.now()
      const response = await fetch(`/api/admin/queries?limit=${queryLimit}&page=${queryPage}&search=${encodeURIComponent(querySearchTerm)}&userType=${queryUserTypeFilter}&profession=${queryProfessionFilter}&_t=${timestamp}`, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setQueries(data.queries || [])
      }
    } catch (error) {
      console.error('Error fetching queries:', error)
    }
  }, [queryLimit, queryPage, querySearchTerm, queryUserTypeFilter, queryProfessionFilter])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user) {
      // Check if user is admin
      if (session.user.role !== 'ADMIN') {
        router.push('/dashboard')
        return
      }
      fetchAdminData()
    }
  }, [session, status, router, fetchAdminData])

  // Auto-refresh functionality with more frequent updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (autoRefresh && !isLoading) {
      interval = setInterval(() => {
        console.log(' Auto-refreshing admin data...')
        fetchAdminData(false) // Silent refresh
      }, 15000) // Refresh every 15 seconds (more frequent)
    }
    
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [autoRefresh, isLoading, fetchAdminData])

  // Keyboard shortcut for refresh (Ctrl+R or Cmd+R)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault()
        if (!isRefreshing) {
          console.log('⌨ Keyboard shortcut refresh triggered')
          fetchAdminData(true)
        }
      }
      // Add F5 as additional refresh shortcut
      if (event.key === 'F5') {
        event.preventDefault()
        if (!isRefreshing) {
          console.log('⌨ F5 refresh triggered')
          fetchAdminData(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRefreshing, fetchAdminData])

  // Fetch queries when filters change
  useEffect(() => {
    if (activeTab === 'queries') {
      fetchQueries()
    }
  }, [querySearchTerm, queryUserTypeFilter, queryProfessionFilter, queryPage, activeTab, fetchQueries])

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const response = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      })

      if (response.ok) {
        await fetchAdminData() // Refresh data
      }
    } catch (error) {
      console.error('Error performing user action:', error)
    }
  }

  const handleQueryAction = async (queryId: string, action: string) => {
    if (action === 'view') {
      const query = queries.find(q => q.id === queryId)
      if (query) {
        setSelectedQuery(query)
        setShowQueryModal(true)
      }
    } else if (action === 'delete') {
      if (confirm('Weet je zeker dat je deze vraag wilt verwijderen?')) {
        try {
          const response = await fetch(`/api/admin/queries/${queryId}`, {
            method: 'DELETE'
          })
          if (response.ok) {
            await fetchQueries()
          }
        } catch (error) {
          console.error('Error deleting query:', error)
        }
      }
    }
  }

  const exportData = async () => {
    try {
      const response = await fetch('/api/admin/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wethelder-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const resetRateLimits = async () => {
    if (!confirm('Weet je zeker dat je alle rate limits wilt resetten? Alle anonieme gebruikers krijgen weer 4 gratis vragen.')) {
      return
    }

    try {
      setIsRefreshing(true)
      const response = await fetch('/api/reset-rate-limits', {
        method: 'POST',
      })
      
      if (response.ok) {
        const data = await response.json()
        alert(`Rate limits succesvol gereset! ${data.message}`)
        // Refresh the admin data to show updated stats
        await fetchAdminData(true)
      } else {
        const error = await response.json()
        alert(`Fout bij resetten: ${error.error}`)
      }
    } catch (error) {
      console.error('Rate limit reset error:', error)
      alert('Er is een fout opgetreden bij het resetten van rate limits.')
    } finally {
      setIsRefreshing(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'PREMIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'FREE':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-red-100 text-red-800 border-red-300'
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Admin dashboard laden...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Toegang Geweigerd
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              U heeft geen toegang tot het admin dashboard.
            </p>
            <Link href="/dashboard">
              <Button>Terug naar Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
                <Home className="h-5 w-5" />
                WetHelder
              </Link>
              <div className="h-4 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Refresh Status */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {lastRefresh && (
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span>
                      {lastRefresh.toLocaleTimeString('nl-NL')}
                    </span>
                  </div>
                )}
                {autoRefresh && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    Live (15s)
                  </Badge>
                )}
                {!autoRefresh && (
                  <Badge variant="outline" className="text-xs">
                    Handmatig
                  </Badge>
                )}
              </div>
              
              {/* Auto Refresh Toggle */}
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                {autoRefresh ? 'Auto aan' : 'Auto uit'}
              </Button>
              
              {/* Manual Refresh */}
              <Button
                variant="outline"
                onClick={() => {
                  console.log(' Manual refresh triggered')
                  fetchAdminData(true)
                }}
                disabled={isRefreshing}
                className="flex items-center gap-2"
                title="Vernieuwen (Ctrl+R / Cmd+R) - Force refresh alle data"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Vernieuwen...' : 'Force Refresh'}
              </Button>
              
              <Button
                variant="outline"
                onClick={exportData}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              
              <Button
                variant="outline"
                onClick={resetRateLimits}
                disabled={isRefreshing}
                className="flex items-center gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Reset Rate Limits
              </Button>
              
              <Link href="/dashboard">
                <Button variant="secondary">User Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Refresh Error Alert */}
          {refreshError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <p className="text-red-800 font-medium">Refresh Error</p>
                    <p className="text-red-700 text-sm">{refreshError}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRefreshError(null)}
                    className="text-red-600 border-red-300 hover:bg-red-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Health */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Systeemstatus
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchAdminData(true)}
                  disabled={isRefreshing}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="text-xs">Refresh</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  {getHealthIcon(stats?.systemHealth || 'healthy')}
                  <div>
                    <p className="text-sm text-muted-foreground">Systeem</p>
                    <p className="font-medium capitalize">{stats?.systemHealth || 'Healthy'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Database</p>
                    <p className="font-medium">{stats?.databaseSize || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Laatste Backup</p>
                    <p className="font-medium">{stats?.lastBackup || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                    <p className="font-medium">99.9%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Totaal Gebruikers</p>
                    <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Actieve Gebruikers</p>
                    <p className="text-2xl font-bold">{stats?.activeUsers || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Crown className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Premium Gebruikers</p>
                    <p className="text-2xl font-bold">{stats?.premiumUsers || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Totaal Vragen</p>
                    <p className="text-2xl font-bold">{stats?.totalQueries || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Query Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ingelogde Vragen</p>
                    <p className="text-2xl font-bold">{stats?.loggedInQueries || 0}</p>
                    <p className="text-xs text-muted-foreground">Vandaag: {stats?.todayLoggedInQueries || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <UserX className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Anonieme Vragen</p>
                    <p className="text-2xl font-bold">{stats?.anonymousQueries || 0}</p>
                    <p className="text-xs text-muted-foreground">Vandaag: {stats?.todayAnonymousQueries || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Vandaag Totaal</p>
                    <p className="text-2xl font-bold">{stats?.todayQueries || 0}</p>
                    <p className="text-xs text-muted-foreground">Gem. per gebruiker: {stats?.avgQueriesPerUser || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aangifte Downloads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Download className="h-8 w-8 text-emerald-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Totaal Aangiftes</p>
                    <p className="text-2xl font-bold">{stats?.totalAangifteDownloads || 0}</p>
                    <p className="text-xs text-muted-foreground">Vandaag: {stats?.aangifteDownloadsToday || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Meest populaire delicten</p>
                    <div className="text-sm">
                      {stats?.aangifteDownloadsByType?.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="truncate mr-2">{item.delictType || 'Onbekend'}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                      )) || <span className="text-muted-foreground">Geen data</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aangifte Downloads by Type */}
          {stats?.aangifteDownloadsByType && stats.aangifteDownloadsByType.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Aangifte Downloads per Delicttype
                </CardTitle>
                <CardDescription>
                  Overzicht van gedownloade aangiftes per type delict
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.aangifteDownloadsByType.map((item, index) => (
                    <div key={index} className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-2xl font-bold text-emerald-600">{item.count}</p>
                      <p className="text-sm text-muted-foreground">{item.delictType || 'Onbekend'}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Anonymous Queries by Profession */}
          {stats?.anonymousQueriesByProfession && stats.anonymousQueriesByProfession.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Anonieme Vragen per Profiel
                </CardTitle>
                <CardDescription>
                  Verdeling van anonieme vragen over verschillende beroepsprofielen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.anonymousQueriesByProfession.map((item, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{item.count}</p>
                      <p className="text-sm text-muted-foreground capitalize">{item.profession}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Diagnostics Section */}
          {stats?.diagnostics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Tracking Diagnostics
                </CardTitle>
                <CardDescription>
                  Gedetailleerde analyse van verkeersregistratie en mogelijke tracking problemen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground">API GEBRUIK</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Ask API:</span>
                        <Badge variant="secondary">{stats.diagnostics.askApiQueries}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">WetUitleg API:</span>
                        <Badge variant="secondary">{stats.diagnostics.wetuitlegApiQueries}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Rate Limits:</span>
                        <Badge variant={stats.diagnostics.rateLimitMessages > 0 ? "destructive" : "secondary"}>
                          {stats.diagnostics.rateLimitMessages}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground">OMGEVING DETECTIE</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Corporate/Citrix:</span>
                        <Badge variant="outline">{stats.diagnostics.corporateQueries}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Citrix Specifiek:</span>
                        <Badge variant="outline">{stats.diagnostics.citrixQueries}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Zonder Tracking:</span>
                        <Badge variant={stats.diagnostics.queriesWithoutProperSources > 0 ? "destructive" : "outline"}>
                          {stats.diagnostics.queriesWithoutProperSources}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground">POTENTIËLE PROBLEMEN</h4>
                    <div className="space-y-2">
                      {stats.diagnostics.queriesWithoutProperSources > 0 && (
                        <div className="text-sm text-orange-600">
                          ⚠️ {stats.diagnostics.queriesWithoutProperSources} vragen zonder juiste tracking
                        </div>
                      )}
                      {stats.diagnostics.rateLimitMessages > 50 && (
                        <div className="text-sm text-red-600">
                          🚫 Veel rate limiting ({stats.diagnostics.rateLimitMessages})
                        </div>
                      )}
                      {stats.diagnostics.corporateQueries > 0 && (
                        <div className="text-sm text-blue-600">
                          🏢 Corporate omgevingen gedetecteerd
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground">AANBEVELINGEN</h4>
                    <div className="space-y-2 text-sm">
                      {stats.diagnostics.queriesWithoutProperSources > 0 && (
                        <div className="text-orange-600">
                          • Check tracking implementatie
                        </div>
                      )}
                      {stats.diagnostics.corporateQueries > 0 && (
                        <div className="text-blue-600">
                          • Corporate tracking werkt goed
                        </div>
                      )}
                      {stats.diagnostics.citrixQueries > 0 && (
                        <div className="text-green-600">
                          • Citrix detectie actief
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Source Distribution */}
                {stats.diagnostics.querySourceDistribution.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold mb-4">Top 10 Query Sources (Gecategoriseerd)</h4>
                    <div className="space-y-3">
                      {stats.diagnostics.querySourceDistribution.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {item.source}
                              </Badge>
                              <span className="text-sm font-bold text-gray-900">
                                {item.count} vragen
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 truncate">
                              {item.detail}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-mono font-bold text-blue-600">
                              {item.count}
                            </div>
                            <div className="text-xs text-gray-500">
                              #{index + 1}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tabbed Interface */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Button
                  variant={activeTab === 'overview' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('overview')}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Overzicht
                </Button>
                <Button
                  variant={activeTab === 'users' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('users')}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Gebruikers
                </Button>
                <Button
                  variant={activeTab === 'queries' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('queries')}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Alle Vragen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* System Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Systeemmetrieken</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {metrics.map((metric, index) => (
                        <div key={index} className="text-center">
                          <p className="text-2xl font-bold">{metric.value}</p>
                          <p className="text-sm text-muted-foreground">{metric.name}</p>
                          <div className={`text-xs mt-1 ${
                            metric.status === 'up' ? 'text-green-600' : 
                            metric.status === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {metric.change > 0 ? '+' : ''}{metric.change}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Gebruikersbeheer</h3>
                  {/* Filters */}
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Zoek gebruikers..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter op rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle rollen</SelectItem>
                        <SelectItem value="FREE">Gratis</SelectItem>
                        <SelectItem value="PREMIUM">Premium</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter op status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle statussen</SelectItem>
                        <SelectItem value="active">Actief</SelectItem>
                        <SelectItem value="suspended">Geschorst</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Users Table */}
                  <div className="overflow-x-auto">
                    <div className="space-y-4">
                      {filteredUsers.map((user) => (
                        <Card key={user.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-medium">{user.name}</h4>
                                  <Badge variant="outline" className={getRoleColor(user.role)}>
                                    {user.role}
                                  </Badge>
                                  <Badge variant="outline" className={getStatusColor(user.status)}>
                                    {user.status === 'active' ? 'Actief' : 'Geschorst'}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p>{user.email}</p>
                                  <div className="flex items-center gap-4">
                                    <span>Aangemeld: {formatDate(user.createdAt)}</span>
                                    <span>Laatst actief: {formatDate(user.lastActive)}</span>
                                    <span>Vragen: {user.totalQueries}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUserAction(user.id, 'view')}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUserAction(user.id, 'edit')}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                                >
                                  {user.status === 'active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'queries' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                    <h3 className="text-lg font-semibold">Alle Vragen & Antwoorden</h3>
                      <p className="text-sm text-gray-600 mt-1">Toont de laatste 100 vragen (was 20)</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => fetchQueries()}
                      disabled={isRefreshing}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Vernieuwen
                    </Button>
                  </div>
                  
                  {/* Query Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="md:col-span-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Zoek in vragen en antwoorden..."
                          value={querySearchTerm}
                          onChange={(e) => setQuerySearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={queryUserTypeFilter} onValueChange={setQueryUserTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Gebruikerstype" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle types</SelectItem>
                        <SelectItem value="logged">Ingelogde gebruikers</SelectItem>
                        <SelectItem value="anonymous">Anonieme gebruikers</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={queryProfessionFilter} onValueChange={setQueryProfessionFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Beroep" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle beroepen</SelectItem>
                        <SelectItem value="politieagent">Politieagent</SelectItem>
                        <SelectItem value="boa">BOA</SelectItem>
                        <SelectItem value="advocaat">Advocaat</SelectItem>
                        <SelectItem value="beveiliger">Beveiliger</SelectItem>
                        <SelectItem value="rechter">Rechter</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="burger">Burger</SelectItem>
                        <SelectItem value="algemeen">Algemeen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Queries List */}
                  <div className="space-y-4">
                    {queries.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Geen vragen gevonden</h3>
                          <p className="text-gray-600">
                            Er zijn geen vragen die voldoen aan de huidige filters.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      queries.map((query) => (
                        <Card key={query.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-3">
                                  <h4 className="font-semibold text-gray-900 truncate">{query.question}</h4>
                                  <Badge variant="outline" className={getRoleColor(query.userRole)}>
                                    {query.userRole}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {query.userType === 'logged' ? 'Ingelogd' : 'Anoniem'}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                  <div className="text-sm text-gray-600">
                                    <strong>Volledige vraag:</strong>
                                    <p className="mt-1 line-clamp-3">{query.fullQuestion}</p>
                                  </div>
                                  
                                  <div className="text-sm text-gray-600">
                                    <strong>Antwoord:</strong>
                                    <p className="mt-1 line-clamp-4">{query.fullAnswer}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {query.userName} ({query.userEmail})
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(query.createdAt)}
                                  </span>
                                  <span className="flex items-center gap-1 capitalize">
                                    <Settings className="h-3 w-3" />
                                    {query.profession}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQueryAction(query.id, 'view')}
                                  title="Bekijk volledige vraag en antwoord"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQueryAction(query.id, 'delete')}
                                  title="Verwijder vraag"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Query Detail Modal */}
      {showQueryModal && selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Vraag Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQueryModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Query Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Gebruiker:</span>
                    <p className="text-sm">{selectedQuery.userName} ({selectedQuery.userEmail})</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Type:</span>
                    <p className="text-sm">{selectedQuery.userType === 'logged' ? 'Ingelogde gebruiker' : 'Anonieme gebruiker'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Beroep:</span>
                    <p className="text-sm capitalize">{selectedQuery.profession}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Datum:</span>
                    <p className="text-sm">{formatDate(selectedQuery.createdAt)}</p>
                  </div>
                </div>

                {/* Question */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-blue-600">Vraag</h3>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedQuery.fullQuestion}</p>
                  </div>
                </div>

                {/* Answer */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-green-600">Antwoord</h3>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="prose max-w-none">
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedQuery.fullAnswer}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`Vraag: ${selectedQuery.fullQuestion}\n\nAntwoord: ${selectedQuery.fullAnswer}`)
                    }}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Kopieer naar klembord
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowQueryModal(false)
                      handleQueryAction(selectedQuery.id, 'delete')
                    }}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Verwijder vraag
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 