'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Scale, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

function ResetPasswordContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  
  console.log('URL params:', { token, email })

  const validateToken = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email }),
      })

      if (response.ok) {
        setIsValidToken(true)
      } else {
        setError('Reset link is verlopen of ongeldig')
      }
    } catch (error) {
      setError('Er is een fout opgetreden bij het valideren van de link')
    }
  }, [token, email])

  useEffect(() => {
    // Validate token on component mount
    if (!token || !email) {
      setError('Ongeldige reset link')
      return
    }

    validateToken()
  }, [token, email, validateToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validate passwords
    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 karakters bevatten')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Wachtwoord succesvol bijgewerkt! U wordt doorgestuurd naar de inlogpagina.')
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      } else {
        setError(data.error || 'Er is een fout opgetreden')
      }
    } catch (error) {
      setError('Er is een fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidToken && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <Scale className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">WetHelder</h1>
          <p className="text-gray-600">Link wordt gevalideerd...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/auth/signin" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar inloggen
          </Link>
          
          <div className="flex items-center justify-center mb-4">
            <Scale className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">WetHelder</h1>
          <p className="text-gray-600">Nieuw wachtwoord instellen</p>
        </div>

        {/* Reset Password Form */}
        <Card>
          <CardHeader>
            <CardTitle>Nieuw wachtwoord</CardTitle>
            <CardDescription>
              Voer een nieuw wachtwoord in voor uw account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                {success}
              </div>
            )}

            {isValidToken && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1 block">
                    Nieuw wachtwoord
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Nieuw wachtwoord"
                      required
                      disabled={isLoading || !!success}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-1 block">
                    Wachtwoord bevestigen
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Bevestig wachtwoord"
                      required
                      disabled={isLoading || !!success}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                  <p className="font-medium mb-1">Wachtwoord eisen:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Minimaal 6 karakters</li>
                    <li>Beide velden moeten identiek zijn</li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !!success}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Wachtwoord bijwerken...
                    </div>
                  ) : (
                    'Wachtwoord bijwerken'
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Weet u uw wachtwoord weer?{' '}
                <Link 
                  href="/auth/signin" 
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Inloggen
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <Scale className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">WetHelder</h1>
          <p className="text-gray-600">Pagina wordt geladen...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
} 