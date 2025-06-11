'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, ExternalLink, MessageCircle, Scale, Euro, FileText, Upload, File, Check, ChevronDown, Eye } from 'lucide-react'

interface BoeteResult {
  feitcode: string
  omschrijving: string
  juridischeGrondslag: string
  standaardboete: number
  type: string
  toelichting?: string
  bronUrl?: string
}

export default function BoetesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<BoeteResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBoete, setSelectedBoete] = useState<BoeteResult | null>(null)
  const [chatResponse, setChatResponse] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [searchMode, setSearchMode] = useState<'search' | 'question'>('search')
  const [questionResponse, setQuestionResponse] = useState('')
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  
  // PDF Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 640)
    }
    
    checkIsDesktop()
    window.addEventListener('resize', checkIsDesktop)
    
    return () => window.removeEventListener('resize', checkIsDesktop)
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    setResults([])
    setQuestionResponse('')
    
    try {
      if (searchMode === 'search') {
        // Zoek naar specifieke feitcodes
        const response = await fetch('/api/boetes/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery })
        })
        
        if (response.ok) {
          const data = await response.json()
          setResults(data.results || [])
        }
      } else {
        // Stel een vraag aan ChatGPT over boetes
        const response = await fetch('/api/boetes/question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: searchQuery })
        })
        
        if (response.ok) {
          const data = await response.json()
          setQuestionResponse(data.answer || '')
        }
      }
    } catch (error) {
      console.error('Search/Question error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChatExplanation = async (boete: BoeteResult) => {
    setSelectedBoete(boete)
    setIsChatLoading(true)
    setChatResponse('')
    
    try {
      const response = await fetch('/api/boetes/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boete })
      })
      
      if (response.ok) {
        const data = await response.json()
        setChatResponse(data.explanation)
      }
    } catch (error) {
      console.error('Chat error:', error)
      setChatResponse('Er is een fout opgetreden bij het ophalen van de uitleg.')
    } finally {
      setIsChatLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Navigation />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        {/* Header - Mobiel-geoptimaliseerd */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Boetes & Feitcodes
            </h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
            Zoek officiële boetes en feitcodes uit de Boetebase van het Openbaar Ministerie. 
            Inclusief juridische grondslag en geautomatiseerde uitleg.
          </p>
        </div>

        {/* Juridische bronvermelding - Compacter voor mobiel */}
        <Card className="mb-4 sm:mb-6 border-blue-200 bg-blue-50">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-800 text-sm sm:text-base">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Officiële Bronnen
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs sm:text-sm text-blue-700 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div>
                <strong>Boetebase OM:</strong>
                <br />
                <a href="https://boetebase.om.nl" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-1 text-blue-600 hover:underline break-all">
                  boetebase.om.nl <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </div>
              <div>
                <strong>Wetten.nl:</strong>
                <br />
                <a href="https://wetten.overheid.nl" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1 text-blue-600 hover:underline break-all">
                  wetten.overheid.nl <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PDF Bonnenboekje - Mobiel-geoptimaliseerd */}
        <Card className="mb-4 sm:mb-6 border-green-200 bg-green-50">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-green-800 text-sm sm:text-base">
              <File className="h-4 w-4 sm:h-5 sm:w-5" />
              Officieel Bonnenboekje
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 sm:space-y-4">
              <p className="text-green-700 text-sm sm:text-base">
                Download het officiële PDF bonnenboekje met alle feitcodes en boetebedragen. 
                Vul je feitcode in onderstaand veld om direct te zien wat de boete inhoudt.
              </p>
              
              {/* Buttons - Stack op mobiel */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  variant="outline" 
                  className="border-green-600 text-green-700 hover:bg-green-100 w-full sm:w-auto touch-manipulation py-3"
                  onClick={() => window.open('/documents/bonnenboekje.pdf', '_blank')}
                >
                  <File className="h-4 w-4 mr-2" />
                  Bekijk PDF
                </Button>
                <Button 
                  variant="outline" 
                  className="border-green-600 text-green-700 hover:bg-green-100 w-full sm:w-auto touch-manipulation py-3"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = '/documents/bonnenboekje.pdf'
                    link.download = 'bonnenboekje.pdf'
                    link.click()
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {!isDesktop && (
                  <Button 
                    variant="outline" 
                    className="border-green-600 text-green-700 hover:bg-green-100 w-full touch-manipulation py-3"
                    onClick={() => setShowPdfPreview(!showPdfPreview)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPdfPreview ? 'Verberg' : 'Toon'} Preview
                  </Button>
                )}
              </div>
              
              {/* PDF Preview - Verborgen op mobiel tenzij aangeklikt */}
              {(showPdfPreview || isDesktop) && (
                <div className="w-full">
                  <iframe 
                    src="/documents/bonnenboekje.pdf" 
                    className="w-full h-32 sm:h-40 border border-green-300 rounded"
                    title="Bonnenboekje Preview"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Zoek/Vraag sectie - Mobiel-geoptimaliseerd */}
        <Card className="mb-4 sm:mb-6 shadow-md">
          <CardContent className="pt-4 sm:pt-6">
            {/* Mode selector - Volledig scherm op mobiel */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                variant={searchMode === 'search' ? 'default' : 'outline'}
                onClick={() => setSearchMode('search')}
                className="w-full py-3 touch-manipulation text-sm sm:text-base"
              >
                <Search className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Zoek </span>Feitcode
              </Button>
              <Button
                variant={searchMode === 'question' ? 'default' : 'outline'}
                onClick={() => setSearchMode('question')}
                className="w-full py-3 touch-manipulation text-sm sm:text-base"
              >
                <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Stel </span>Vraag
              </Button>
            </div>
            
            {/* Search input - Stack op mobiel */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={searchMode === 'search' 
                    ? "Zoek feitcode of omschrijving..."
                    : "Stel je vraag over boetes..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="text-base sm:text-lg py-3 touch-manipulation"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 touch-manipulation"
              >
                {searchMode === 'search' ? (
                  <>
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    {isLoading ? 'Zoeken...' : 'Zoek'}
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    {isLoading ? 'Beantwoorden...' : 'Vraag'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Snelle Feitcode Lookup - Compacter voor mobiel */}
        <Card className="mb-4 sm:mb-6 border-orange-200 bg-orange-50">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-orange-800 text-sm sm:text-base">
              <Scale className="h-4 w-4 sm:h-5 sm:w-5" />
              Snelle Feitcode Lookup
            </CardTitle>
            <CardDescription className="text-orange-700 text-xs sm:text-sm">
              Vul direct een feitcode in voor een snelle opzoeking uit het bonnenboekje
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Input
                type="text"
                placeholder="Bijv. W010a, V100, M001"
                className="flex-1 font-mono text-base sm:text-lg py-3 touch-manipulation"
                maxLength={10}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement
                  const value = target.value.toUpperCase()
                  target.value = value
                  if (value.length >= 3) {
                    // Auto-search when 3+ characters
                    setSearchQuery(value)
                    setSearchMode('search')
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement
                    setSearchQuery(target.value)
                    setSearchMode('search')
                    handleSearch()
                  }
                }}
              />
              <Button 
                variant="outline" 
                className="border-orange-600 text-orange-700 hover:bg-orange-100 w-full sm:w-auto py-3 touch-manipulation"
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="W010a"]') as HTMLInputElement
                  if (input?.value) {
                    setSearchQuery(input.value)
                    setSearchMode('search')
                    handleSearch()
                  }
                }}
              >
                <Search className="h-4 w-4 mr-2" />
                Zoek
              </Button>
            </div>
            <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-orange-600">
              <strong>Tip:</strong> Gebruik de exacte feitcode zoals deze in het bonnenboekje staat (bijv. W010a voor rechts inhalen)
            </div>
          </CardContent>
        </Card>

        {/* Vraag Antwoord - Mobiel-geoptimaliseerd */}
        {questionResponse && searchMode === 'question' && (
          <Card className="mb-4 sm:mb-6 border-blue-200 bg-blue-50">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-blue-800 text-sm sm:text-base">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                Antwoord op je vraag
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="prose prose-blue max-w-none text-sm sm:text-base">
                <div className="whitespace-pre-wrap text-blue-800 leading-relaxed">
                  {questionResponse}
                </div>
                <div className="mt-3 sm:mt-4 p-3 bg-blue-100 rounded-lg text-xs sm:text-sm text-blue-700">
                  <strong>Bronnen:</strong> Gebaseerd op officiële Boetebase OM en Nederlandse wetgeving. 
                  Controleer altijd <a href="https://boetebase.om.nl" className="underline">Boetebase.om.nl</a> voor actuele details.
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Zoekresultaten - Mobiel-geoptimaliseerd */}
        {results.length > 0 && searchMode === 'search' && (
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 px-1">
              Zoekresultaten ({results.length})
            </h2>
            {results.map((boete, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2 sm:pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm sm:text-base">
                        <Badge variant="outline" className="font-mono text-xs sm:text-sm w-fit">
                          {boete.feitcode}
                        </Badge>
                        <span className="text-sm sm:text-base leading-tight break-words">
                          {boete.omschrijving}
                        </span>
                      </CardTitle>
                      <CardDescription className="mt-2 text-xs sm:text-sm">
                        <strong>Juridische grondslag:</strong> {boete.juridischeGrondslag}
                      </CardDescription>
                    </div>
                    <div className="flex sm:flex-col items-start sm:items-end sm:text-right gap-2">
                      <div className="flex items-center text-xl sm:text-2xl font-bold text-green-600">
                        <Euro className="h-5 w-5 sm:h-6 sm:w-6 mr-1" />
                        {boete.standaardboete}
                      </div>
                      <Badge variant={boete.type === 'misdrijf' ? 'destructive' : 'secondary'} className="text-xs">
                        {boete.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {boete.toelichting && (
                    <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
                      {boete.toelichting}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-4">
                      {boete.bronUrl && (
                        <a 
                          href={boete.bronUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline text-xs sm:text-sm touch-manipulation"
                        >
                          Officiële bron <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => handleChatExplanation(boete)}
                      className="flex items-center gap-2 w-full sm:w-auto touch-manipulation py-2.5"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Vraag uitleg
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ChatGPT Uitleg - Mobiel-geoptimaliseerd */}
        {selectedBoete && (
          <Card className="border-green-200 bg-green-50 mb-4 sm:mb-6">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-green-800 text-sm sm:text-base">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="break-words">
                  Juridische Uitleg voor {selectedBoete.feitcode}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isChatLoading ? (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  Uitleg wordt gegenereerd...
                </div>
              ) : chatResponse ? (
                <div className="prose prose-green max-w-none text-sm sm:text-base">
                  <div className="whitespace-pre-wrap text-green-800 leading-relaxed">
                    {chatResponse}
                  </div>
                  <div className="mt-3 sm:mt-4 p-3 bg-green-100 rounded-lg text-xs sm:text-sm text-green-700">
                    <strong>Let op:</strong> Dit is algemene informatie gebaseerd op officiële bronnen. 
                    Raadpleeg <a href="https://boetebase.om.nl" className="underline">Boetebase.om.nl</a> voor actuele details.
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Geen resultaten - Mobiel-geoptimaliseerd */}
        {!isLoading && searchMode === 'search' && results.length === 0 && searchQuery && (
          <Card className="text-center py-6 sm:py-8">
            <CardContent>
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                Geen resultaten gevonden voor &quot;{searchQuery}&quot;
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Probeer een andere zoekterm of controleer de officiële Boetebase handmatig.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Geen antwoord bij vraag - Mobiel-geoptimaliseerd */}
        {!isLoading && searchMode === 'question' && !questionResponse && searchQuery && (
          <Card className="text-center py-6 sm:py-8">
            <CardContent>
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                Kon geen antwoord vinden op je vraag
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Probeer je vraag anders te formuleren of controleer de officiële Boetebase handmatig.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
} 