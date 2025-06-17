'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ExternalLink, FileText, Calendar, Building, Loader2, AlertCircle } from 'lucide-react'

interface JurisprudentieSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  ruling: {
    ecli: string
    title: string
    summary: string
    date: string
    court: string
    article: string
    topic: string
    link: string
    year: number
    caseType: string
    fullText?: string
  } | null
}

interface SummaryResponse {
  success: boolean
  summary: string
  ecli: string
  timestamp: string
  wasScraped?: boolean
  scrapedFrom?: string
}

export default function JurisprudentieSummaryModal({ 
  isOpen, 
  onClose, 
  ruling 
}: JurisprudentieSummaryModalProps) {
  const [summary, setSummary] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && ruling) {
      setSummary('')
      setError(null)
      generateSummary()
    } else {
      setSummary('')
      setError(null)
      setIsLoading(false)
    }
  }, [isOpen, ruling])

  const generateSummary = async () => {
    if (!ruling) return

    setIsLoading(true)
    setError(null)

    // Voor nu: gebruik gewoon de bestaande summary uit de ruling
    // Dit zorgt ervoor dat we altijd iets kunnen tonen
    setTimeout(() => {
      if (ruling.summary && ruling.summary.trim().length > 0) {
        setSummary(ruling.summary)
        console.log('✅ Using existing summary from search results')
      } else {
        setSummary('Geen samenvatting beschikbaar voor deze uitspraak.')
        console.log('⚠️ No summary available')
      }
      setIsLoading(false)
    }, 300) // Korte delay voor UX
  }

  const getCourtColor = (court: string) => {
    switch (court) {
      case 'Hoge Raad':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Gerechtshof Den Haag':
      case 'Gerechtshof':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Rechtbank Amsterdam':
      case 'Rechtbank':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCaseTypeColor = (caseType: string) => {
    switch (caseType) {
      case 'Strafrecht':
        return 'bg-purple-100 text-purple-800'
      case 'Grondrechten':
        return 'bg-orange-100 text-orange-800'
      case 'Civielrecht':
        return 'bg-blue-100 text-blue-800'
      case 'Bestuursrecht':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!ruling) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-gray-900 pr-8 leading-tight">
            {ruling.title}
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            Samenvatting van de juridische uitspraak
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="outline" className={`${getCourtColor(ruling.court)} text-sm px-3 py-1`}>
                <Building className="h-4 w-4 mr-2" />
                {ruling.court}
              </Badge>
              <Badge variant="outline" className="text-gray-600 text-sm px-3 py-1">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(ruling.date).toLocaleDateString('nl-NL')}
              </Badge>
              <Badge variant="secondary" className={`${getCaseTypeColor(ruling.caseType)} text-sm px-3 py-1`}>
                {ruling.caseType}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-sm px-3 py-1">
                <FileText className="h-4 w-4 mr-2" />
                {ruling.article}
              </Badge>
            </div>

            <div className="text-base text-gray-700">
              <span className="font-semibold">ECLI:</span> <span className="font-mono">{ruling.ecli}</span>
            </div>
          </div>

          {/* Summary Section */}
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Samenvatting Uitspraak
              </h3>

              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Samenvatting wordt geladen...</span>
                </div>
              )}

              {summary && !isLoading && (
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="text-gray-800 leading-relaxed text-base space-y-4"
                    style={{ 
                      lineHeight: '1.7',
                      fontSize: '16px'
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: summary
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                        .replace(/\n\n/g, '</p><p class="mb-4">')
                        .replace(/\n/g, '<br/>')
                        .replace(/^/, '<p class="mb-4">')
                        .replace(/$/, '</p>')
                    }}
                  />
                </div>
              )}

              {!isLoading && !summary && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Geen samenvatting beschikbaar
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Voor deze uitspraak is geen samenvatting beschikbaar.
                  </p>
                  <p className="text-sm text-gray-500">
                    Klik op "Volledige uitspraak" om de uitspraak direct te bekijken.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t-2 border-gray-200 mt-8">
            <Button variant="outline" size="lg" onClick={onClose}>
              Sluiten
            </Button>
            <Button variant="default" size="lg" asChild>
              <a
                href={ruling.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-5 w-5" />
                Volledige uitspraak bekijken
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 