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

  const handleOAuthSignIn = async (provider: string) => {
    console.log('Starting OAuth sign in with provider:', provider)
    setIsLoading(true)
    setError('')
    
    try {
      console.log('Calling signIn with provider:', provider)
      const result = await signIn(provider, { 
        callbackUrl: '/dashboard',
        redirect: false 
      })
      
      console.log('SignIn result:', result)
      
      if (result?.error) {
        console.error('SignIn error:', result.error)
        setError('Er ging iets mis bij het inloggen met ' + provider + ': ' + result.error)
        setIsLoading(false)
      } else if (result?.url) {
        console.log('Redirecting to:', result.url)
        window.location.href = result.url
      } else {
        console.log('No URL in result, trying direct redirect')
        // Fallback: try direct redirect
        await signIn(provider, { callbackUrl: '/dashboard' })
      }
    } catch (error) {
      console.error('OAuth sign in error:', error)
      setError('Er ging iets mis bij het inloggen: ' + (error as Error).message)
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

            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-3 py-6"
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Inloggen met Google
              </Button>

              {/* Facebook login tijdelijk uitgeschakeld */}
              {/* <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-3 py-6"
                onClick={() => handleOAuthSignIn('facebook')}
                disabled={isLoading}
              >
                <svg className="h-5 w-5" fill="#1877f2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Inloggen met Facebook
              </Button> */}
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Of log in met email</span>
              </div>
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