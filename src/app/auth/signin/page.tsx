'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Scale, Mail, Lock, AlertCircle } from 'lucide-react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Ongeldige inloggegevens')
        setIsLoading(false)
        return
      }

      // Check if sign in was successful
      const session = await getSession()
      if (session) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setError('Er ging iets mis bij het inloggen')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError('Er ging iets mis bij het inloggen')
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 justify-center w-full"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar homepage
        </Link>
        
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">WetHelder</span>
          </div>
        </div>
        
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Inloggen
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Toegang tot uw juridische dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              <Mail className="h-6 w-6 mx-auto mb-2 text-primary" />
              Login met uw account
            </CardTitle>
            <CardDescription className="text-center">
              Voer uw inloggegevens in om toegang te krijgen tot WetHelder
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Gratis account notice */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Accounts zijn tijdelijk helemaal gratis!</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Maak nu een gratis account aan en krijg volledige toegang tot alle functies van WetHelder.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="uw.email@voorbeeld.nl"
                    className="pl-10"
                    required
                  />
                  <Mail className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Wachtwoord
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Uw wachtwoord"
                    className="pl-10"
                    required
                  />
                  <Lock className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Bezig met inloggen...' : 'Inloggen'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Nog geen account?{' '}
                <Link href="/auth/signup" className="font-medium text-primary hover:text-primary/80">
                  Registreer hier
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Development info - alleen zichtbaar in development mode */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">🔧 Development Mode</h3>
            <p className="text-sm text-blue-700 mb-2">
              Voor development testing zijn er demo accounts beschikbaar:
            </p>
            <div className="space-y-1 text-xs text-blue-600">
              <div>test@wethelder.nl / test</div>
              <div>sanderhelmink@gmail.com / admin123</div>
              <div>demo@wethelder.nl / demo</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 