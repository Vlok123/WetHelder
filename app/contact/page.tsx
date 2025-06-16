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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contact
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Heb je vragen over WetHelder of suggesties voor verbetering? 
              We horen graag van je!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Vragen stellen
                </CardTitle>
                <CardDescription>
                  Heb je vragen over het gebruik van WetHelder, juridische bronnen, 
                  of hoe de AI-assistent werkt? Stel ze gerust!
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-green-600" />
                  Suggesties delen
                </CardTitle>
                <CardDescription>
                  Heb je ideeën om WetHelder te verbeteren? Mis je bepaalde functionaliteiten 
                  of bronnen? Deel je suggesties met ons!
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Over WetHelder</CardTitle>
                <CardDescription>
                  WetHelder is een AI-gestuurde juridische assistent die professionals 
                  helpt bij het vinden van relevante wetgeving, jurisprudentie en 
                  officiële bronnen. We streven ernaar om de tool continu te verbeteren 
                  op basis van gebruikersfeedback.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Stuur ons een bericht</CardTitle>
              <CardDescription>
                Vul het formulier in en we nemen zo spoedig mogelijk contact met je op.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Naam *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Je volledige naam"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="je@email.nl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="type">Type bericht</Label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="vraag">Vraag</option>
                    <option value="suggestie">Suggestie</option>
                    <option value="feedback">Feedback</option>
                    <option value="bug">Bug melding</option>
                    <option value="anders">Anders</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="subject">Onderwerp *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Korte beschrijving van je bericht"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Bericht *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Beschrijf je vraag of suggestie in detail..."
                    rows={6}
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
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verzenden...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Bericht verzenden
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