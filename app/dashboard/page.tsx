'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  MessageSquare, 
  Calendar, 
  Crown, 
  LogOut, 
  Home, 
  Settings,
  Clock,
  ArrowRight,
  BarChart3
} from 'lucide-react'

interface Query {
  id: string
  question: string
  answer: string
  profession: string
  createdAt: string
}

interface DashboardStats {
  totalQueries: number
  todayUsage: number
  remainingToday: number
  role: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [queries, setQueries] = useState<Query[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session) {
      fetchDashboardData()
    }
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      const [queriesRes, statsRes] = await Promise.all([
        fetch('/api/user/queries'),
        fetch('/api/user/stats')
      ])

      if (queriesRes.ok) {
        const queriesData = await queriesRes.json()
        setQueries(queriesData.queries || [])
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'PREMIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'FREE':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getRoleIcon = (role: string) => {
    return role === 'PREMIUM' ? <Crown className="h-3 w-3" /> : <User className="h-3 w-3" />
  }

  if (status === 'loading' || isLoading) {
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
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">{session.user.name}</p>
                <div className="flex items-center gap-1">
                  {getRoleIcon(stats?.role || 'FREE')}
                  <Badge variant="outline" className={getRoleColor(stats?.role || 'FREE')}>
                    {stats?.role === 'PREMIUM' ? 'Premium' : 'Gratis'}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Totaal vragen</p>
                    <p className="text-2xl font-bold">{stats?.totalQueries || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Vandaag gebruikt</p>
                    <p className="text-2xl font-bold">{stats?.todayUsage || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Resterend vandaag</p>
                    <p className="text-2xl font-bold">
                      {stats?.role === 'PREMIUM' ? '∞' : (stats?.remainingToday || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  {getRoleIcon(stats?.role || 'FREE')}
                  <div>
                    <p className="text-sm text-muted-foreground">Account type</p>
                    <Badge className={getRoleColor(stats?.role || 'FREE')}>
                      {stats?.role === 'PREMIUM' ? 'Premium' : 'Gratis'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Snelle acties</CardTitle>
              <CardDescription>Veelgebruikte functies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Link href="/">
                  <Button className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Nieuwe vraag stellen
                  </Button>
                </Link>
                
                {stats?.role === 'FREE' && (
                  <Button variant="outline" className="flex items-center gap-2">
                    <Crown className="h-4 w-4" />
                    Upgrade naar Premium
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Query History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Vraaggeschiedenis
              </CardTitle>
              <CardDescription>
                Uw recente juridische vragen en antwoorden
              </CardDescription>
            </CardHeader>
            <CardContent>
              {queries.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Nog geen vragen gesteld</p>
                  <Link href="/">
                    <Button>Eerste vraag stellen</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {queries.map((query) => (
                    <Card key={query.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1">
                                {truncateText(query.question, 100)}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDate(query.createdAt)}
                                <Badge variant="secondary" className="text-xs">
                                  {query.profession}
                                </Badge>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                              <ArrowRight className="h-3 w-3" />
                              Bekijken
                            </Button>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            {truncateText(query.answer, 200)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 