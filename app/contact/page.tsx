'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, MapPin, Phone, Send, CheckCircle, Scale, Clock, Users, MessageCircle } from 'lucide-react'

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
              <a href="/">Terug naar Homepage</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-1 via-surface-2 to-surface-3">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Scale className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Contact</h1>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                IN ONTWIKKELING
              </Badge>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Heeft u vragen over WetHelder, suggesties voor verbetering, of wilt u samenwerken? 
              Neem gerust contact met ons op.
            </p>
            
            {/* Development Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-3xl mx-auto">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Platform in ontwikkeling</p>
                  <p>WetHelder is nog in actieve ontwikkeling. Uw feedback helpt ons het platform te verbeteren voor alle gebruikers. AI-antwoorden kunnen fouten bevatten - controleer belangrijke informatie altijd zelf.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Stuur ons een bericht
                </CardTitle>
                <CardDescription>
                  We beantwoorden uw bericht binnen 24 uur tijdens werkdagen.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Naam *
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Uw volledige naam"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        E-mailadres *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="uw.email@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Onderwerp *
                    </label>
                    <Input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder="Waar gaat uw bericht over?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Bericht *
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      placeholder="Beschrijf uw vraag, suggestie of opmerking..."
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Bezig met verzenden...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Bericht Versturen
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              
              {/* Contact Details */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contactgegevens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">E-mail</p>
                      <p className="text-muted-foreground">info@calmpoint.nl</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Reactietijd</p>
                      <p className="text-muted-foreground">Binnen 24 uur (werkdagen)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Veelgestelde vragen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Is WetHelder gratis te gebruiken?</h4>
                    <p className="text-sm text-muted-foreground">
                      Ja, WetHelder is volledig gratis toegankelijk voor alle Nederlandse burgers.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Hoe actueel is de informatie?</h4>
                    <p className="text-sm text-muted-foreground">
                      Onze database wordt dagelijks geüpdatet met de nieuwste wetgeving en feitcodes.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Kan ik WetHelder professioneel gebruiken?</h4>
                    <p className="text-sm text-muted-foreground">
                      Ja, politie, juristen en andere professionals kunnen WetHelder gebruiken als referentietool.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Stats */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Platform Statistieken
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">2.500+</div>
                      <div className="text-sm text-muted-foreground">Feitcodes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">25+</div>
                      <div className="text-sm text-muted-foreground">Wetboeken</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">15.000+</div>
                      <div className="text-sm text-muted-foreground">Wetsartikelen</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">100%</div>
                      <div className="text-sm text-muted-foreground">Actualiteit</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 