'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, MapPin, Phone, Send, CheckCircle, Clock, Users, MessageCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
          subject: '',
          message: ''
        })
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Er is een fout opgetreden bij het verzenden van uw bericht. Probeer het opnieuw.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-1 via-surface-2 to-surface-3">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">Bericht Verzonden!</h1>
              <p className="text-lg text-muted-foreground">
                Bedankt voor uw bericht. We nemen zo spoedig mogelijk contact met u op.
              </p>
            </div>
            <Button asChild>
              <Link href="/">Terug naar Homepage</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-1 via-surface-2 to-surface-3">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Contact
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Heeft u vragen, feedback of suggesties? We helpen u graag verder. 
              Vul het onderstaande formulier in en we nemen zo spoedig mogelijk contact met u op.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card>
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3 mx-auto">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Snelle Response</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  We streven ernaar om binnen 24 uur te reageren op uw bericht
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3 mx-auto">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Persoonlijke Aanpak</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Elk bericht wordt persoonlijk behandeld door ons ervaren team
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3 mx-auto">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Betrouwbaar</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Uw gegevens worden vertrouwelijk behandeld volgens onze privacy policy
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Contactformulier
              </CardTitle>
              <CardDescription>
                Vul onderstaand formulier in voor vragen, feedback of ondersteuning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                      Naam <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Uw volledige naam"
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      E-mailadres <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="uw.email@voorbeeld.nl"
                      required
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-foreground">
                    Onderwerp <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Korte omschrijving van uw vraag"
                    required
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">
                    Bericht <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Beschrijf uw vraag of feedback in detail..."
                    required
                    rows={6}
                    className="w-full resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs text-muted-foreground">
                    <span className="text-red-500">*</span> Verplichte velden
                  </p>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verzenden...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Verzenden
                      </div>
                    )}
                  </Button>
                </div>
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