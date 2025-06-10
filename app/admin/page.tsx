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
  AlertTriangle
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalQuestions: number
  questionsToday: number
  questionsThisWeek: number
  questionsThisMonth: number
  topProfessions: Array<{ name: string; count: number }>
  recentQuestions: Array<{
    id: string
    question: string
    profession: string
    timestamp: string
    user?: string
  }>
  systemHealth: {
    apiStatus: 'healthy' | 'warning' | 'error'
    dbStatus: 'healthy' | 'warning' | 'error'
    responseTime: number
  }
}

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

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
                  WetHelder Admin Panel
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welkom, {session.user?.email}
                </p>
              </div>
            </div>
            <Button 
              onClick={refreshStats} 
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Vernieuwen
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!stats ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Geen statistieken beschikbaar</p>
          </div>
        ) : (
          <>
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
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-500" />
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
                    Meest gebruikte beroepen in vragen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topProfessions.map((profession, index) => (
                      <div key={profession.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {profession.name}
                          </span>
                        </div>
                        <Badge variant="secondary">
                          {profession.count} vragen
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Systeem Status
                  </CardTitle>
                  <CardDescription>
                    Actuele status van systeem componenten
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">API Status</span>
                      <Badge 
                        variant={stats.systemHealth.apiStatus === 'healthy' ? 'default' : 'destructive'}
                      >
                        {stats.systemHealth.apiStatus === 'healthy' ? '✅ Gezond' : '❌ Problemen'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Database Status</span>
                      <Badge 
                        variant={stats.systemHealth.dbStatus === 'healthy' ? 'default' : 'destructive'}
                      >
                        {stats.systemHealth.dbStatus === 'healthy' ? '✅ Gezond' : '❌ Problemen'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Response Time</span>
                      <Badge variant="outline">
                        {stats.systemHealth.responseTime}ms
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Questions */}
            <Card className="mt-8">
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
                <div className="space-y-4">
                  {stats.recentQuestions.map((question) => (
                    <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {question.profession}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(question.timestamp).toLocaleString('nl-NL')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                        {question.question}
                      </p>
                      {question.user && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Door: {question.user}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
} 