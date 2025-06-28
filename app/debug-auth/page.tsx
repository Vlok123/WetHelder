'use client'

import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, User, Settings } from 'lucide-react'

export default function DebugAuthPage() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar homepage
          </Link>
          <h1 className="text-3xl font-bold">🔧 Authentication Debug</h1>
          <p className="text-gray-600">Controleer de authentication status</p>
        </div>

        <div className="grid gap-6">
          {/* Authentication Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {status === 'authenticated' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Authentication Status
              </CardTitle>
              <CardDescription>
                Huidige status van de NextAuth sessie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    status === 'authenticated' ? 'bg-green-100 text-green-800' :
                    status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {status}
                  </span>
                </div>
                
                {session?.user && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">User ID:</span>
                      <span className="text-sm">{session.user.id}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Email:</span>
                      <span className="text-sm">{session.user.email}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Name:</span>
                      <span className="text-sm">{session.user.name || 'Niet ingesteld'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Role:</span>
                      <span className="text-sm">{session.user.role || 'Niet ingesteld'}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Environment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Environment Info
              </CardTitle>
              <CardDescription>
                Informatie over de huidige environment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">NEXTAUTH_URL:</span>
                  <span className="text-sm">{process.env.NEXTAUTH_URL || 'http://localhost:3000'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">NODE_ENV:</span>
                  <span className="text-sm">{process.env.NODE_ENV || 'development'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">URL:</span>
                  <span className="text-sm">{typeof window !== 'undefined' ? window.location.origin : 'Server-side'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Snelle acties voor testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {!session ? (
                  <Button asChild>
                    <Link href="/auth/signin">
                      Naar Login Pagina
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline">
                      <Link href="/dashboard">
                        Dashboard
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/ask">
                        Stel een vraag
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Demo Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>💡 Demo Accounts</CardTitle>
              <CardDescription>
                Beschikbare test accounts voor development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium">Test User</div>
                  <div className="text-gray-600">Email: test@wethelder.nl</div>
                  <div className="text-gray-600">Password: test</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium">Admin User</div>
                  <div className="text-gray-600">Email: sanderhelmink@gmail.com</div>
                  <div className="text-gray-600">Password: admin123</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium">Demo User</div>
                  <div className="text-gray-600">Email: demo@wethelder.nl</div>
                  <div className="text-gray-600">Password: demo</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Raw Session Data */}
          {session && (
            <Card>
              <CardHeader>
                <CardTitle> Raw Session Data</CardTitle>
                <CardDescription>
                  Complete session object voor debugging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 