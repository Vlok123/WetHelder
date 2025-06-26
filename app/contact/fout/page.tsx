'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Send, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Label } from '@/components/ui/label'

export default function FoutMeldenPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Fout antwoord gerapporteerd',
    message: '',
    type: 'fout'
  })
  const [error, setError] = useState('')
  
  // URL parameters voor fout meldingen
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const vraag = urlParams.get('vraag')
    const antwoord = urlParams.get('antwoord')
    
    if (vraag) {
      setFormData(prev => ({
        ...prev,
        message: `Oorspronkelijke vraag: ${decodeURIComponent(vraag)}\n\nOntvangen antwoord: ${antwoord ? decodeURIComponent(antwoord) : 'Niet beschikbaar'}\n\nReden waarom dit antwoord fout is:\n`
      }))
    }
  }, [])

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
          subject: 'Fout antwoord gerapporteerd',
          message: '',
          type: 'fout'
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
                Bedankt voor je melding!
              </h1>
              <p className="text-gray-600 mb-6">
                We hebben je foutmelding ontvangen en zullen deze zo spoedig mogelijk onderzoeken.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => setIsSubmitted(false)}
                  className="bg-blue-600 hover:bg-blue-700 mr-3"
                >
                  Nieuwe melding maken
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.close()}
                >
                  Sluiten
                </Button>
              </div>
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Onjuist Antwoord Melden
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Heeft u een fout of onvolledig antwoord ontvangen? Help ons WetHelder te verbeteren door dit te melden.
            </p>
          </div>

          {/* Disclaimer */}
          <Card className="shadow-lg border-orange-200 bg-orange-50 mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-orange-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Waarom kunnen er fouten optreden?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-orange-800">
                             <div>
                 <h4 className="font-medium mb-2">Meerdere interpretaties mogelijk</h4>
                 <p className="text-sm">
                   Voor complexe juridische vraagstukken kunnen meerdere benaderingen bestaan. WetHelder geeft vaak één richting, 
                   terwijl andere interpretaties eveneens geldig kunnen zijn. <strong>Tip:</strong> Hoe meer specifieke informatie 
                   u geeft, hoe beter en gerichtter het antwoord zal zijn.
                 </p>
               </div>

               <div>
                 <h4 className="font-medium mb-2">Gedachte achter de vraag mist</h4>
                 <p className="text-sm">
                   Het antwoord kan technisch correct zijn, maar uw eigenlijke vraag niet beantwoorden. Bijvoorbeeld: 
                   "Mag je ter aanhouding een woning betreden?" vs "Mag je iemand in een woning aanhouden?" lijken vergelijkbaar, 
                   maar hebben verschillende antwoorden. Wees specifiek over uw situatie en wat u precies wilt weten.
                 </p>
               </div>
              
              <div>
                <h4 className="font-medium mb-2">Algemene vs. specifieke wetgeving</h4>
                <p className="text-sm">
                  Bij zeer specifieke wetgeving kan algemene wetgeving de boventoon voeren om een duidelijker antwoord te geven. 
                  <strong> Tip:</strong> Benoem de specifieke wetgeving waar u het over wilt hebben in uw vraag.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Chat vs. Wet & Uitleg</h4>
                <p className="text-sm">
                  Voor vragen over specifieke wetsartikelen en diepgaande analyse raden wij aan om de 
                  <Link href="/wetuitleg" className="underline font-medium hover:text-orange-900"> Wet & Uitleg</Link> functie te gebruiken 
                  in plaats van de algemene chat.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Zoekmachine beperkingen</h4>
                <p className="text-sm">
                  De zoekmachine kan soms verouderde informatie gebruiken of context missen. 
                  Controleer altijd belangrijke juridische informatie via officiële bronnen.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Actualiteit van bronnen</h4>
                <p className="text-sm">
                  Wetgeving verandert regelmatig. Een antwoord kan correct zijn geweest op moment van indexering, 
                  maar inmiddels achterhaald door nieuwe regelgeving. <strong>Help ons:</strong> Meld recente wetwijzigingen 
                  zodat we onze bronnen kunnen bijwerken.
                </p>
              </div>

              <div className="bg-orange-100 p-3 rounded-lg border border-orange-300">
                <p className="text-sm font-medium">
                  <strong>Belangrijk:</strong> WetHelder biedt informatie, geen juridisch advies. 
                  Voor bindende juridische stappen raadpleegt u altijd een gekwalificeerde professional.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-gray-900">Foutmelding insturen</CardTitle>
              <CardDescription className="text-lg">
                Beschrijf wat er fout was aan het antwoord en wij onderzoeken dit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      className="mt-2 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
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
                      className="mt-2 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-sm font-semibold text-gray-700">Onderwerp</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Onderwerp van uw melding"
                    className="mt-2 h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    disabled
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-semibold text-gray-700">Details van de fout *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Beschrijf wat er fout was aan het antwoord..."
                    rows={8}
                    className="mt-2 border-gray-300 focus:border-orange-500 focus:ring-orange-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Voeg eventueel correcte bronnen of referenties toe om ons te helpen het probleem op te lossen.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Verzenden...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      Foutmelding Verzenden
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 