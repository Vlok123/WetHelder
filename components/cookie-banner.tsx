'use client'

import { useState, useEffect } from 'react'
import { Cookie, Settings, X, Shield, BarChart3, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

interface CookieConsent {
  necessary: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
  timestamp: number
}

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true, // Always required
    functional: false,
    analytics: false,
    marketing: false,
    timestamp: 0
  })

  useEffect(() => {
    // Check if user has already given consent
    const existingConsent = localStorage.getItem('wethelder-cookie-consent')
    if (!existingConsent) {
      setIsVisible(true)
    } else {
      const parsedConsent = JSON.parse(existingConsent)
      setConsent(parsedConsent)
      // Apply consent settings
      applyCookieConsent(parsedConsent)
    }
  }, [])

  const applyCookieConsent = (consentData: CookieConsent) => {
    // Apply analytics consent
    if (consentData.analytics) {
      // Enable analytics tracking (e.g., Google Analytics, Vercel Analytics)
      console.log('Analytics cookies enabled')
      // Here you would initialize your analytics scripts
    } else {
      // Disable analytics tracking
      console.log('Analytics cookies disabled')
      // Here you would disable/remove analytics scripts
    }

    // Apply marketing consent
    if (consentData.marketing) {
      // Enable marketing cookies (e.g., Facebook Pixel, Google Ads)
      console.log('Marketing cookies enabled')
    } else {
      console.log('Marketing cookies disabled')
    }

    // Apply functional consent
    if (consentData.functional) {
      // Enable functional cookies (e.g., chat widgets, video players)
      console.log('Functional cookies enabled')
    } else {
      console.log('Functional cookies disabled')
    }
  }

  const saveConsent = (consentData: CookieConsent) => {
    const consentWithTimestamp = {
      ...consentData,
      timestamp: Date.now()
    }
    localStorage.setItem('wethelder-cookie-consent', JSON.stringify(consentWithTimestamp))
    setConsent(consentWithTimestamp)
    applyCookieConsent(consentWithTimestamp)
    setIsVisible(false)
    setShowSettings(false)
  }

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now()
    })
  }

  const handleAcceptNecessary = () => {
    saveConsent({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: Date.now()
    })
  }

  const handleSaveSettings = () => {
    saveConsent(consent)
  }

  const updateConsent = (category: keyof Omit<CookieConsent, 'timestamp'>, value: boolean) => {
    setConsent(prev => ({
      ...prev,
      [category]: value
    }))
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {!showSettings ? (
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Cookie className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Cookie-instellingen
                </h2>
                
                <p className="text-gray-700 mb-4">
                  Wij gebruiken cookies om uw ervaring te verbeteren en onze diensten te optimaliseren. 
                  U kunt uw voorkeuren hieronder instellen. Noodzakelijke cookies zijn altijd actief voor 
                  de basisfunctionaliteit van de website.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Privacy-vriendelijk</h3>
                      <p className="text-blue-800 text-sm">
                        Wij respecteren uw privacy. Cookies worden alleen geplaatst na uw toestemming, 
                        behalve noodzakelijke cookies voor de werking van de website.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleAcceptAll}
                    className="flex-1"
                  >
                    Alle cookies accepteren
                  </Button>
                  <Button 
                    onClick={handleAcceptNecessary}
                    variant="outline"
                    className="flex-1"
                  >
                    Alleen noodzakelijke
                  </Button>
                  <Button 
                    onClick={() => setShowSettings(true)}
                    variant="outline"
                    className="flex-1 sm:flex-none"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Instellingen
                  </Button>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Door deze website te gebruiken gaat u akkoord met ons{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline">privacybeleid</a> en{' '}
                  <a href="/cookies" className="text-blue-600 hover:underline">cookiebeleid</a>.
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        ) : (
          <>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Cookie-instellingen
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Necessary Cookies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Noodzakelijke cookies</h3>
                      <p className="text-sm text-gray-600">Vereist voor de basisfunctionaliteit</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Altijd actief</Badge>
                    <Switch checked={true} disabled />
                  </div>
                </div>
                <p className="text-xs text-gray-500 ml-8">
                  Deze cookies zijn essentieel voor de werking van de website, zoals inloggen, 
                  navigatie en toegang tot beveiligde gebieden.
                </p>
              </div>

              {/* Functional Cookies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Functionele cookies</h3>
                      <p className="text-sm text-gray-600">Verbeterde functionaliteit en personalisatie</p>
                    </div>
                  </div>
                  <Switch 
                    checked={consent.functional}
                    onCheckedChange={(checked: boolean) => updateConsent('functional', checked)}
                  />
                </div>
                <p className="text-xs text-gray-500 ml-8">
                  Deze cookies onthouden uw voorkeuren en instellingen om uw ervaring te personaliseren, 
                  zoals taalvoorkeur en zoekgeschiedenis.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Analytische cookies</h3>
                      <p className="text-sm text-gray-600">Inzicht in websitegebruik en prestaties</p>
                    </div>
                  </div>
                  <Switch 
                    checked={consent.analytics}
                    onCheckedChange={(checked: boolean) => updateConsent('analytics', checked)}
                  />
                </div>
                <p className="text-xs text-gray-500 ml-8">
                  Deze cookies helpen ons begrijpen hoe bezoekers de website gebruiken door 
                  anonieme statistieken te verzamelen over paginabezoeken en gebruikersgedrag.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-orange-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Marketing cookies</h3>
                      <p className="text-sm text-gray-600">Gepersonaliseerde advertenties</p>
                    </div>
                  </div>
                  <Switch 
                    checked={consent.marketing}
                    onCheckedChange={(checked: boolean) => updateConsent('marketing', checked)}
                  />
                </div>
                <p className="text-xs text-gray-500 ml-8">
                  Deze cookies worden gebruikt om relevante advertenties te tonen op andere websites 
                  en om de effectiviteit van onze marketingcampagnes te meten.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Uw rechten</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• U kunt uw cookievoorkeuren altijd wijzigen</li>
                  <li>• U kunt cookies verwijderen via uw browserinstellingen</li>
                  <li>• Sommige functies werken mogelijk niet zonder cookies</li>
                  <li>• Uw gegevens worden niet verkocht aan derden</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={handleSaveSettings}
                  className="flex-1"
                >
                  Instellingen opslaan
                </Button>
                <Button 
                  onClick={() => setShowSettings(false)}
                  variant="outline"
                >
                  Annuleren
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
} 