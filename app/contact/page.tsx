'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/navigation'
import { 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  ArrowLeft,
  User,
  Building,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    subject: '',
    message: '',
    type: 'suggestion'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({
          name: '',
          email: '',
          organization: '',
          subject: '',
          message: '',
          type: 'suggestion'
        })
      } else {
        throw new Error('Er is iets misgegaan')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Er is een fout opgetreden. Probeer het opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="text-center">
            <div className="inline-flex p-4 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-8 w-8 text-green-700" />
            </div>
            <h1 className="text-2xl font-semibold mb-4 text-slate-900">Bericht Verzonden</h1>
            <p className="text-slate-600 mb-8">
              Bedankt voor uw bericht. We zullen zo spoedig mogelijk reageren.
            </p>
            <div className="space-y-3">
              <Link 
                href="/ask" 
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Terug naar WetHelder
              </Link>
              <br />
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Nog een bericht versturen
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl">
            <Link 
              href="/ask" 
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Terug naar WetHelder
            </Link>
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">Contact & Suggesties</h1>
            <p className="text-slate-600">
              Help ons WetHelder te verbeteren met uw feedback en suggesties
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Neem Contact Op
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-2">
                  Type Bericht
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="suggestion">Suggestie voor verbetering</option>
                  <option value="bug">Bug/technisch probleem</option>
                  <option value="feature">Nieuwe functie aanvraag</option>
                  <option value="content">Inhoudelijke feedback</option>
                  <option value="general">Algemene vraag</option>
                  <option value="partnership">Samenwerking</option>
                </select>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Naam *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    E-mail *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-slate-700 mb-2">
                  <Building className="inline h-4 w-4 mr-1" />
                  Organisatie (optioneel)
                </label>
                <Input
                  id="organization"
                  name="organization"
                  type="text"
                  value={formData.organization}
                  onChange={handleInputChange}
                  placeholder="Politie, advocatenkantoor, rechtenfaculteit, etc."
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                  Onderwerp *
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Korte beschrijving van uw bericht"
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                  <MessageCircle className="inline h-4 w-4 mr-1" />
                  Bericht *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Beschrijf uw suggestie, probleem of vraag in detail..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                  required
                />
              </div>

              {/* Privacy Notice */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-slate-800 mb-2">Privacy & Verwerking</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Uw gegevens worden gebruikt om contact met u op te nemen over uw bericht. 
                  We delen uw informatie niet met derden en verwijderen deze na afhandeling van uw verzoek.
                  Door dit formulier te versturen gaat u akkoord met deze verwerking.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name || !formData.email || !formData.subject || !formData.message}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Versturen...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    <span>Bericht Versturen</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Voor Organisaties</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Bent u geïnteresseerd in een samenwerking of aangepaste versie van WetHelder 
                voor uw organisatie? Neem contact met ons op voor de mogelijkheden.
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Technische Problemen</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Bij technische problemen, vermeld dan uw browser, besturingssysteem en 
                beschrijf de exacte stappen om het probleem te reproduceren.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 