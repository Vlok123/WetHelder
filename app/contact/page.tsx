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
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Contact WetHelder
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Heeft u vragen over juridische informatie, technische ondersteuning nodig, 
              of wilt u feedback geven? Wij helpen u graag verder.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Algemene Vragen
                </CardTitle>
                <CardDescription>
                  Voor algemene vragen over WetHelder en juridische informatie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">info@wethelder.nl</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Reactie binnen 24 uur</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Technische Ondersteuning
                </CardTitle>
                <CardDescription>
                  Voor technische problemen en account-gerelateerde vragen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">support@wethelder.nl</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Ma-Vr 9:00-17:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Veelgestelde Vragen</CardTitle>
              <CardDescription>
                Bekijk eerst onze veelgestelde vragen voor snelle antwoorden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-1">Is WetHelder gratis te gebruiken?</h3>
                <p className="text-sm text-muted-foreground">
                  Ja, WetHelder is gratis toegankelijk voor alle gebruikers. Sommige premium functies 
                  kunnen in de toekomst beschikbaar komen.
                </p>
              </div>
              
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-1">Hoe actueel is de juridische informatie?</h3>
                <p className="text-sm text-muted-foreground">
                  Onze database wordt regelmatig bijgewerkt met de meest recente wetgeving en rechtspraak. 
                  Controleer altijd de datum van publicatie.
                </p>
              </div>
              
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-1">Kan ik juridisch advies krijgen via WetHelder?</h3>
                <p className="text-sm text-muted-foreground">
                  WetHelder biedt informatieve content, geen juridisch advies. Voor specifieke juridische 
                  problemen raadpleegt u een gekwalificeerde jurist.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Over WetHelder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                WetHelder is een Nederlandse juridische informatieplatform dat zich richt op het 
                toegankelijk maken van wetgeving en rechtspraak voor iedereen. Ons doel is om 
                betrouwbare juridische informatie te bieden in begrijpelijke taal.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Disclaimer:</strong> WetHelder is momenteel in beta-ontwikkeling. 
                  Controleer belangrijke informatie altijd via officiële bronnen.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 