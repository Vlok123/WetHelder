'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, X, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function LegalDisclaimer() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAcknowledged, setHasAcknowledged] = useState(false)

  useEffect(() => {
    // Check if user has already acknowledged disclaimer
    const acknowledged = localStorage.getItem('wethelder-disclaimer-acknowledged')
    if (!acknowledged) {
      setIsVisible(true)
    } else {
      setHasAcknowledged(true)
    }
  }, [])

  const handleAcknowledge = () => {
    localStorage.setItem('wethelder-disclaimer-acknowledged', 'true')
    setHasAcknowledged(true)
    setIsVisible(false)
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  // Always show compact disclaimer for acknowledged users
  if (hasAcknowledged) {
    return (
      <div className="bg-amber-50 border-t border-amber-200 py-2 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center gap-2 text-sm text-amber-800">
            <Info className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">Informatie ≠ juridisch advies</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Raadpleeg een professional voor bindende stappen</span>
            <Button 
              variant="link" 
              size="sm" 
              className="text-amber-700 hover:text-amber-900 p-0 h-auto font-medium underline"
              onClick={() => setIsVisible(true)}
            >
              Meer info
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Belangrijke Juridische Disclaimer
              </h2>
              
              <div className="space-y-4 text-gray-700">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Informatie ≠ Juridisch Advies
                  </h3>
                  <p className="text-amber-800">
                    De informatie op WetHelder is <strong>richtinggevend</strong> en vormt 
                    <strong> geen juridisch advies</strong>. Voor bindende juridische stappen 
                    raadpleegt u altijd een gekwalificeerde juridische professional.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Wat betekent dit?</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span><strong>Algemene informatie:</strong> Onze antwoorden zijn gebaseerd op algemene wetgeving en kunnen niet alle specifieke omstandigheden dekken</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span><strong>Geen advocaat-cliënt relatie:</strong> Er ontstaat geen juridische vertegenwoordiging door gebruik van dit platform</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span><strong>Actualiteit:</strong> Wetgeving kan wijzigen; controleer altijd de meest recente bronnen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span><strong>Geen aansprakelijkheid:</strong> WetHelder is niet aansprakelijk voor gevolgen van beslissingen gebaseerd op deze informatie</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Wanneer een professional raadplegen?
                  </h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Bij juridische procedures of rechtszaken</li>
                    <li>• Voor contracten of belangrijke juridische documenten</li>
                    <li>• Bij complexe of specifieke juridische situaties</li>
                    <li>• Wanneer u juridische vertegenwoordiging nodig heeft</li>
                    <li>• Voor definitieve juridische zekerheid</li>
                  </ul>
                </div>

                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <p>
                    <strong>Contact voor juridische hulp:</strong> Neem contact op met een advocaat, 
                    het Juridisch Loket (0900-8020), of andere gekwalificeerde juridische professionals 
                    voor persoonlijk advies dat past bij uw specifieke situatie.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button 
                  onClick={handleAcknowledge}
                  className="flex-1"
                >
                  Ik begrijp het - Ga door naar WetHelder
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDismiss}
                  className="px-4"
                >
                  Sluiten
                </Button>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 