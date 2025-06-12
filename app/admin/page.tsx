'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Zap
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalQuestions: number
  questionsToday: number
  questionsThisWeek: number
  questionsThisMonth: number
  anonymousQuestions: number
  registeredUserQuestions: number
  averageQuestionsPerDay: number
  topProfessions: Array<{ name: string; count: number }>
  recentQuestions: Array<{
    id: string
    question: string
    profession: string
    timestamp: string
    user?: string
    isAnonymous: boolean
  }>
  systemHealth: {
    apiStatus: 'healthy' | 'warning' | 'error'
    dbStatus: 'healthy' | 'warning' | 'error'
    responseTime: number
    uptime: string
  }
  trafficStats: {
    totalPageViews: number
    uniqueVisitors: number
    bounceRate: number
    averageSessionDuration: string
  }
  userGrowth: {
    newUsersToday: number
    newUsersThisWeek: number
    newUsersThisMonth: number
    growthRate: number
  }
}

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  // Check if user is admin
  const isAdmin = session?.user?.email === 'sanderhelmink@gmail.com'

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || !isAdmin) {
      redirect('/')
      return
    }

    loadAdminStats()
  }, [session, status, isAdmin])

  const loadAdminStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
        setLastRefresh(new Date())
      } else {
        console.error('Failed to load admin stats:', response.status)
      }
    } catch (error) {
      console.error('Failed to load admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshStats = async () => {
    setRefreshing(true)
    await loadAdminStats()
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return '❓'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Laden van admin panel...</p>
        </div>
      </div>
    )
  }

  if (!session || !isAdmin) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  WetHelder Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welkom, {session.user?.email} | {lastRefresh ? `Laatste update: ${lastRefresh.toLocaleTimeString('nl-NL')}` : 'Geen data'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={refreshStats} 
                disabled={refreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Vernieuwen
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/" target="_blank">
                  <Globe className="h-4 w-4 mr-2" />
                  Live Site
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!stats ? (
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Geen statistieken beschikbaar</p>
            <Button onClick={refreshStats} className="mt-4">
              Opnieuw proberen
            </Button>
          </div>
        ) : (
          <>
            {/* System Health Alert */}
            {(stats.systemHealth.apiStatus !== 'healthy' || stats.systemHealth.dbStatus !== 'healthy') && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-800">Systeem waarschuwing</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Er zijn problemen gedetecteerd met de systeemstatus. Controleer de system health sectie hieronder.
                </p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Totaal Gebruikers
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.totalUsers.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        +{stats.userGrowth?.newUsersThisWeek || 0} deze week
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Totaal Vragen
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.totalQuestions.toLocaleString()}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Ø {stats.averageQuestionsPerDay || 0}/dag
                      </p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Vandaag
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.questionsToday}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.anonymousQuestions || 0} anoniem
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Deze Week
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.questionsThisWeek}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        {stats.userGrowth?.growthRate || 0}% groei
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Traffic & User Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Website Traffic
                  </CardTitle>
                  <CardDescription>
                    Bezoekersstatistieken en engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Totaal pageviews</span>
                      <span className="font-semibold">{stats.trafficStats?.totalPageViews?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unieke bezoekers</span>
                      <span className="font-semibold">{stats.trafficStats?.uniqueVisitors?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bounce rate</span>
                      <span className="font-semibold">{stats.trafficStats?.bounceRate || 'N/A'}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gem. sessieduur</span>
                      <span className="font-semibold">{stats.trafficStats?.averageSessionDuration || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Gebruikersgroei
                  </CardTitle>
                  <CardDescription>
                    Nieuwe registraties en groeitrends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nieuw vandaag</span>
                      <Badge variant="outline">{stats.userGrowth?.newUsersToday || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nieuw deze week</span>
                      <Badge variant="outline">{stats.userGrowth?.newUsersThisWeek || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nieuw deze maand</span>
                      <Badge variant="outline">{stats.userGrowth?.newUsersThisMonth || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Groeipercentage</span>
                      <Badge variant={stats.userGrowth?.growthRate > 0 ? "default" : "secondary"}>
                        {stats.userGrowth?.growthRate || 0}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Systeem Status
                  </CardTitle>
                  <CardDescription>
                    Real-time systeemgezondheid
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">API Status</span>
                      <Badge className={getStatusColor(stats.systemHealth.apiStatus)}>
                        {getStatusIcon(stats.systemHealth.apiStatus)} {stats.systemHealth.apiStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Database</span>
                      <Badge className={getStatusColor(stats.systemHealth.dbStatus)}>
                        {getStatusIcon(stats.systemHealth.dbStatus)} {stats.systemHealth.dbStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Response Time</span>
                      <Badge variant="outline">
                        <Zap className="h-3 w-3 mr-1" />
                        {stats.systemHealth.responseTime}ms
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Uptime</span>
                      <Badge variant="outline">
                        <Server className="h-3 w-3 mr-1" />
                        {stats.systemHealth.uptime || '99.9%'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Professions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Populaire Beroepen
                  </CardTitle>
                  <CardDescription>
                    Meest gebruikte beroepen in vragen ({stats.totalQuestions} totaal)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topProfessions.map((profession, index) => {
                      const percentage = ((profession.count / stats.totalQuestions) * 100).toFixed(1)
                      return (
                        <div key={profession.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {profession.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {profession.count} ({percentage}%)
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Questions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Recente Vragen
                  </CardTitle>
                  <CardDescription>
                    Laatste {stats.recentQuestions.length} gestelde vragen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {stats.recentQuestions.map((question) => (
                      <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {question.profession}
                            </Badge>
                            {question.isAnonymous && (
                              <Badge variant="secondary" className="text-xs">
                                Anoniem
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(question.timestamp).toLocaleString('nl-NL')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                          {question.question}
                        </p>
                        {question.user && !question.isAnonymous && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Door: {question.user}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 