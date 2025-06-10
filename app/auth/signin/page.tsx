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
      } else {
        const session = await getSession()
        if (session) {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      setError('Er is een fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar homepage
          </Link>
          
          <div className="flex items-center justify-center mb-4">
            <Scale className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">WetHelder</h1>
          <p className="text-gray-600">Inloggen op uw account</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Inloggen</CardTitle>
            <CardDescription>
              Voer uw gegevens in om toegang te krijgen tot uw account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">
                  E-mailadres
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="uw@email.nl"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 block">
                  Wachtwoord
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Inloggen...
                  </div>
                ) : (
                  'Inloggen'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Nog geen account?{' '}
                <Link 
                  href="/auth/signup" 
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Registreren
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="font-medium mb-2">Met een account krijgt u:</p>
          <ul className="space-y-1">
            <li>✓ Gratis: 3 vragen per dag</li>
            <li>✓ Toegang tot vraaggeschiedenis</li>
            <li>✓ Beroep-specifieke antwoorden</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 