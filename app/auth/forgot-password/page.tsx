'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Scale, Mail, AlertCircle, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Als dit e-mailadres bekend is, hebben we een reset link verstuurd.')
        // In een echte implementatie zou hier een email worden verstuurd
        // Voor de demo sturen we direct door naar reset pagina
        setTimeout(() => {
          router.push(`/auth/reset-password?token=${data.resetToken}&email=${email}`)
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
          <p className="text-gray-600">Wachtwoord opnieuw instellen</p>
        </div>

        {/* Forgot Password Form */}
        <Card>
          <CardHeader>
            <CardTitle>Wachtwoord vergeten?</CardTitle>
            <CardDescription>
              Voer uw e-mailadres in en we sturen u een link om uw wachtwoord opnieuw in te stellen
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
                    disabled={isLoading || !!success}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !!success}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Reset link versturen...
                  </div>
                ) : (
                  'Reset link versturen'
                )}
              </Button>
            </form>

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

        {/* Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="font-medium mb-2">Beschikbare test accounts:</p>
          <ul className="space-y-1">
            <li>test@wethelder.nl</li>
            <li>sanderhelmink@gmail.com (admin)</li>
            <li>demo@wethelder.nl</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 