'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, MapPin, Phone, Send, CheckCircle, Clock, Users, MessageCircle, ExternalLink, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Label } from '@/components/ui/label'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'vraag' // vraag of suggestie
  })
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

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
          subject: '',
          message: '',
          type: 'vraag'
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Er is een fout opgetreden bij het verzenden.')
      }
    } catch (error) {
      setError('Er is een fout opgetreden bij het verzenden. Probeer het later opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Bedankt voor je bericht!
              </h1>
              <p className="text-gray-600 mb-6">
                We hebben je {formData.type} ontvangen en zullen zo spoedig mogelijk reageren.
              </p>
              <Button 
                onClick={() => setIsSubmitted(false)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Nieuw bericht versturen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-lg">
                <Mail className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Contact
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Heeft u vragen over WetHelder, suggesties voor verbetering, of wilt u feedback geven? 
              Wij staan klaar om u te helpen en waarderen uw input enorm!
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl">Vragen Stellen</CardTitle>
                <CardDescription className="text-base">
                  Heeft u vragen over het gebruik van WetHelder, juridische bronnen, 
                  of hoe de AI-assistent werkt? Stel ze gerust!
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl">Suggesties Delen</CardTitle>
                <CardDescription className="text-base">
                  Heeft u ideeën om WetHelder te verbeteren? Mist u bepaalde functionaliteiten 
                  of bronnen? Deel uw suggesties met ons!
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl">Feedback Geven</CardTitle>
                <CardDescription className="text-base">
                  Uw feedback helpt ons WetHelder continu te verbeteren. 
                  Deel uw ervaring en help ons de beste juridische assistent te bouwen.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-gray-900">Stuur ons een bericht</CardTitle>
              <CardDescription className="text-lg">
                Vul het formulier in en wij nemen zo spoedig mogelijk contact met u op.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Naam *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Uw volledige naam"
                      className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">E-mail *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="uw@email.nl"
                      className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="type" className="text-sm font-semibold text-gray-700">Type bericht</Label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="mt-2 w-full h-12 px-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="vraag">Vraag</option>
                    <option value="suggestie">Suggestie</option>
                    <option value="feedback">Feedback</option>
                    <option value="bug">Bug melding</option>
                    <option value="anders">Anders</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-sm font-semibold text-gray-700">Onderwerp *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Korte beschrijving van uw bericht"
                    className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-semibold text-gray-700">Bericht *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Beschrijf uw vraag of suggestie in detail..."
                    rows={6}
                    className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Verzenden...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      Bericht Verzenden
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Veelgestelde Vragen</CardTitle>
              <CardDescription>
                Bekijk eerst onze veelgestelde vragen voor snelle antwoorden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Hoe actueel is de juridische informatie?</h3>
                <p className="text-sm text-muted-foreground">
                  Onze database wordt regelmatig bijgewerkt met de meest recente wetgeving en rechtspraak. 
                  Controleer altijd de datum van publicatie voor de meest actuele informatie.
                </p>
              </div>
              
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Kan ik juridisch advies krijgen?</h3>
                <p className="text-sm text-muted-foreground">
                  Deze platform biedt informatieve content, geen juridisch advies. Voor specifieke juridische 
                  problemen raadpleegt u altijd een gekwalificeerde jurist of advocaat.
                </p>
              </div>
              
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Is deze service gratis?</h3>
                <p className="text-sm text-muted-foreground">
                  Ja, de basisservice is gratis toegankelijk voor alle gebruikers. Sommige premium functies 
                  kunnen in de toekomst beschikbaar komen voor geregistreerde gebruikers.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded-r-lg">
                <h3 className="font-semibold mb-2 text-blue-900">Wie staat achter dit platform?</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Dit platform is ontwikkeld door <strong>CalmPoint</strong>, een gespecialiseerd bureau voor 
                  de-escalatie trainings en advies. De ontwikkeling kwam voort uit een concrete behoefte aan 
                  een goede juridische kennisbasis voor professionals die dagelijks te maken hebben met complexe situaties.
                </p>
                <p className="text-sm text-blue-800 mb-3">
                  Of het nu gaat om ambtenaren, klantenservice medewerkers, of andere professionals - iedereen 
                  heeft baat bij toegankelijke en betrouwbare juridische informatie om hun werk beter te kunnen doen.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-sm text-blue-800">Meer informatie:</span>
                  <a 
                    href="https://www.calmpoint.nl" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    www.calmpoint.nl
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Hoe kan ik feedback geven?</h3>
                <p className="text-sm text-muted-foreground">
                  We waarderen uw feedback! Gebruik het contactformulier hierboven om suggesties, 
                  verbeterpunten of complimenten door te geven. Uw input helpt ons het platform te verbeteren.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 