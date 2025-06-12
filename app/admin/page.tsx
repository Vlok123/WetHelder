'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  Unlock
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  premiumUsers: number
  freeUsers: number
  totalQueries: number
  todayQueries: number
  avgQueriesPerUser: number
  systemHealth: 'healthy' | 'warning' | 'error'
  databaseSize: string
  lastBackup: string
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
  const [metrics, setMetrics] = useState<SystemMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

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
  }, [session, status, router])

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, metricsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/metrics')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json()
        setMetrics(metricsData.metrics || [])
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
              <Button
                variant="outline"
                onClick={fetchAdminData}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Vernieuwen
              </Button>
              <Button
                variant="outline"
                onClick={exportData}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Data
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
          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Systeemstatus
              </CardTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gebruikersbeheer
              </CardTitle>
              <CardDescription>
                Beheer alle gebruikers en hun toegangsniveaus
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* System Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Systeemmetrieken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {metrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-sm text-muted-foreground">{metric.name}</p>
                    <div className={`text-xs mt-1 ${
                      metric.status === 'up' ? 'text-green-600' : 
                      metric.status === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.change !== 0 && (
                        <>
                          {metric.change > 0 ? '+' : ''}{metric.change}%
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 