'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, ExternalLink, MessageCircle, Scale, Euro, FileText, Car, Bike, Truck, MapPin, Clock, AlertTriangle } from 'lucide-react'

interface BoeteResult {
  feitcode: string
  omschrijving: string
  juridischeGrondslag: string
  standaardboete: number
  type: string
  toelichting?: string
  bronUrl?: string
}

interface SearchResponse {
  answer?: string
  results?: BoeteResult[]
  feitcodes?: string[]
  suggestions?: string[]
}

export default function BoetesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<BoeteResult[]>([])
  const [aiResponse, setAiResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBoete, setSelectedBoete] = useState<BoeteResult | null>(null)
  
  // Context variabelen voor betere zoekresultaten
  const [voertuigType, setVoertuigType] = useState<string>('alle_voertuigen')
  const [situatie, setSituatie] = useState<string>('alle_situaties')
  const [locatie, setLocatie] = useState<string>('alle_locaties')

  const handleUnifiedSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    setResults([])
    setAiResponse('')
    setSelectedBoete(null)
    
    try {
      // Unified search that combines AI analysis with bonnenboekje data
      const response = await fetch('/api/boetes/unified-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: searchQuery,
          context: {
            voertuigType: voertuigType === 'alle_voertuigen' ? '' : voertuigType,
            situatie: situatie === 'alle_situaties' ? '' : situatie,
            locatie: locatie === 'alle_locaties' ? '' : locatie
          }
        })
      })
      
      if (response.ok) {
        const data: SearchResponse = await response.json()
        
        if (data.results) {
          setResults(data.results)
        }
        
        if (data.answer) {
          setAiResponse(data.answer)
        }
      }
    } catch (error) {
      console.error('Unified search error:', error)
      setAiResponse('Er is een fout opgetreden bij het zoeken. Probeer het opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDetailExplanation = async (boete: BoeteResult) => {
    setSelectedBoete(boete)
    
    try {
      const response = await fetch('/api/boetes/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          boete,
          context: {
            voertuigType: voertuigType === 'alle_voertuigen' ? '' : voertuigType,
            situatie: situatie === 'alle_situaties' ? '' : situatie,
            locatie: locatie === 'alle_locaties' ? '' : locatie
          }
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setAiResponse(data.explanation)
      }
    } catch (error) {
      console.error('Detail explanation error:', error)
    }
  }

  const voertuigTypes = [
    { value: 'auto', label: 'Auto', icon: Car },
    { value: 'motor', label: 'Motor', icon: Car },
    { value: 'fiets', label: 'Fiets', icon: Bike },
    { value: 'bromfiets', label: 'Bromfiets', icon: Bike },
    { value: 'vrachtwagen', label: 'Vrachtwagen', icon: Truck },
    { value: 'bus', label: 'Bus', icon: Truck },
  ]

  const situaties = [
    { value: 'snelheid', label: 'Te hard rijden', icon: AlertTriangle },
    { value: 'inhalen', label: 'Inhalen', icon: Car },
    { value: 'parkeren', label: 'Parkeren', icon: MapPin },
    { value: 'verkeerslicht', label: 'Verkeerslicht', icon: Clock },
    { value: 'alcohol', label: 'Alcohol/drugs', icon: AlertTriangle },
    { value: 'telefoon', label: 'Mobiele telefoon', icon: MessageCircle },
    { value: 'voorrang', label: 'Voorrang', icon: Car },
    { value: 'wegmarkering', label: 'Wegmarkering', icon: MapPin },
  ]

  const locaties = [
    { value: 'snelweg', label: 'Snelweg' },
    { value: 'stad', label: 'Binnenstad' },
    { value: 'woonwijk', label: 'Woonwijk' },
    { value: 'school', label: 'Schoolzone' },
    { value: 'kruising', label: 'Kruising' },
    { value: 'rotonde', label: 'Rotonde' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Scale className="h-10 w-10 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <FileText className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Boetes & Feitcodes Assistent
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Intelligente zoekassistent met officiële Boetebase OM en bonnenboekje integratie
          </p>
        </div>

        {/* Unified Search Interface */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
              <Search className="h-6 w-6 text-blue-600" />
              Intelligente Boete Zoeker
            </CardTitle>
            <CardDescription>
              Stel een vraag, zoek op feitcode, of beschrijf je situatie. De AI zoekt automatisch in het bonnenboekje en officiële databases.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Context Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Voertuig Type</label>
                <Select value={voertuigType} onValueChange={setVoertuigType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecteer voertuig" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alle_voertuigen">Alle voertuigen</SelectItem>
                    {voertuigTypes.map((type) => {
                      const IconComponent = type.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Situatie</label>
                <Select value={situatie} onValueChange={setSituatie}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Type overtreding" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alle_situaties">Alle situaties</SelectItem>
                    {situaties.map((sit) => {
                      const IconComponent = sit.icon
                      return (
                        <SelectItem key={sit.value} value={sit.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {sit.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Locatie</label>
                <Select value={locatie} onValueChange={setLocatie}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Waar gebeurde het?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alle_locaties">Alle locaties</SelectItem>
                    {locaties.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {loc.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Main Search */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Bijvoorbeeld: 'Hoeveel boete voor 10 km/h te hard op snelweg met auto?', 'W010a', 'rood licht door'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUnifiedSearch()}
                  className="text-lg py-3 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                />
              </div>
              <Button 
                onClick={handleUnifiedSearch} 
                disabled={isLoading}
                size="lg"
                className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Zoeken...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Zoek
                  </div>
                )}
              </Button>
            </div>

            {/* Quick Examples */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Voorbeelden:</span>
              {[
                "Te hard rijden auto",
                "Parkeren fiets",
                "W010a",
                "Rood licht",
                "Telefoon auto"
              ].map((example) => (
                <Button
                  key={example}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(example)
                    handleUnifiedSearch()
                  }}
                  className="text-xs h-7 px-3 text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  {example}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Response */}
        {aiResponse && (
          <Card className="mb-8 border-blue-200 bg-blue-50/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <MessageCircle className="h-5 w-5" />
                AI Analyse & Bonnenboekje Resultaat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-blue max-w-none">
                <div className="whitespace-pre-wrap text-blue-900 leading-relaxed">
                  {aiResponse}
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded-lg text-sm text-blue-700">
                  <strong>Bronnen:</strong> Officiële Boetebase OM, Nederlandse wetgeving en bonnenboekje. 
                  Voor de meest actuele informatie: <a href="https://boetebase.om.nl" className="underline font-medium">boetebase.om.nl</a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Gevonden Feitcodes ({results.length})
              </h2>
              <Badge variant="outline" className="px-3 py-1">
                Officële Boetebase OM
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {results.map((boete, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-200 border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="font-mono text-sm px-2 py-1 bg-gray-100">
                            {boete.feitcode}
                          </Badge>
                          <Badge 
                            variant={boete.type === 'misdrijf' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {boete.type}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg leading-tight text-gray-900">
                          {boete.omschrijving}
                        </CardTitle>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center text-2xl font-bold text-green-600 mb-1">
                          <Euro className="h-6 w-6 mr-1" />
                          {boete.standaardboete}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <strong>Juridische grondslag:</strong> {boete.juridischeGrondslag}
                      </div>
                      
                      {boete.toelichting && (
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {boete.toelichting}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          {boete.bronUrl && (
                            <a 
                              href={boete.bronUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Officiële bron <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDetailExplanation(boete)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Uitleg
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && results.length === 0 && !aiResponse && searchQuery && (
          <Card className="text-center py-12 bg-white/60 backdrop-blur-sm">
            <CardContent>
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Geen resultaten gevonden
              </h3>
              <p className="text-gray-600 mb-4">
                Geen specifieke feitcodes gevonden voor &quot;{searchQuery}&quot;
              </p>
              <p className="text-sm text-gray-500">
                Probeer andere zoektermen of controleer de officiële Boetebase handmatig.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Legal Footer */}
        <Card className="mt-8 border-gray-200 bg-gray-50/80 backdrop-blur-sm">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <strong className="text-gray-800">Officiële Bronnen:</strong>
                <br />
                <a href="https://boetebase.om.nl" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-1 text-blue-600 hover:underline">
                  Boetebase OM <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div>
                <strong className="text-gray-800">Wetgeving:</strong>
                <br />
                <a href="https://wetten.overheid.nl" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1 text-blue-600 hover:underline">
                  Wetten.nl <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div>
                <strong className="text-gray-800">Disclaimer:</strong>
                <br />
                <span className="text-xs">
                  Gebaseerd op officiële bronnen. Controleer altijd actuele details.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 