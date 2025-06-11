'use client'

import { useState, useEffect, useCallback } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, ExternalLink, MessageCircle, Scale, Euro, FileText, Car, Bike, Truck, MapPin, Clock, AlertTriangle, BookOpen, Gavel } from 'lucide-react'

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
  const [systemResponse, setSystemResponse] = useState('')
  const [wetResponse, setWetResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isWetLoading, setIsWetLoading] = useState(false)
  const [selectedBoete, setSelectedBoete] = useState<BoeteResult | null>(null)
  const [searchMode, setSearchMode] = useState<'boete' | 'wet'>('boete')
  
  // Context variabelen voor betere zoekresultaten
  const [voertuigType, setVoertuigType] = useState<string>('alle_voertuigen')
  const [situatie, setSituatie] = useState<string>('alle_situaties')
  const [locatie, setLocatie] = useState<string>('alle_locaties')

  const handleUnifiedSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    setResults([])
    setSystemResponse('')
    setSelectedBoete(null)
    
    try {
      // Enhanced search that combines bonnenboekje data with web verification
      const response = await fetch('/api/boetes/enhanced-search', {
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
          setSystemResponse(data.answer)
        }
      }
    } catch (error) {
      console.error('Enhanced search error:', error)
      setSystemResponse('Er is een fout opgetreden bij het zoeken. Probeer het opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, voertuigType, situatie, locatie])

  const handleWetSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    
    setIsWetLoading(true)
    setWetResponse('')
    
    try {
      const response = await fetch('/api/boetes/wet-uitleg', {
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
        const data = await response.json()
        if (data.explanation) {
          setWetResponse(data.explanation)
        }
      }
    } catch (error) {
      console.error('Wet search error:', error)
      setWetResponse('Er is een fout opgetreden bij het opzoeken van wetgeving. Probeer het opnieuw.')
    } finally {
      setIsWetLoading(false)
    }
  }, [searchQuery, voertuigType, situatie, locatie])

  // Check URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const queryParam = urlParams.get('q')
    const modeParam = urlParams.get('mode')
    const searchParam = urlParams.get('search')
    
    if (queryParam) {
      setSearchQuery(queryParam)
    }
    
    if (modeParam === 'wet') {
      setSearchMode('wet')
    }
    
    // Auto-search if search=true parameter is present
    if (searchParam === 'true' && queryParam) {
      setTimeout(() => {
        if (modeParam === 'wet') {
          handleWetSearch()
        } else {
          handleUnifiedSearch()
        }
      }, 100)
    }
  }, [handleUnifiedSearch, handleWetSearch])

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
        setSystemResponse(data.explanation)
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
    { value: 'ramen', label: 'Getinte ramen', icon: Car },
    { value: 'gordel', label: 'Veiligheidsgordel', icon: AlertTriangle },
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
            <div className="flex items-center gap-2 justify-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Boetes & Feitcodes Zoeker
              </h1>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                BETA
              </Badge>
            </div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Zoek in officiële Boetebase OM en bonnenboekje met geïntegreerde wetgeving verificatie
          </p>
          
          {/* Beta Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-2xl mx-auto">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <div className="text-xs text-yellow-800">
                <p className="font-medium">⚠️ BETA-versie in ontwikkeling</p>
                <p>AI-antwoorden kunnen fouten bevatten. Controleer belangrijke informatie altijd zelf.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setSearchMode('boete')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                searchMode === 'boete'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Boetes & Feitcodes
              </div>
            </button>
            <button
              onClick={() => setSearchMode('wet')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                searchMode === 'wet'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Gavel className="h-4 w-4" />
                Wet & Uitleg
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Search Interface */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
              {searchMode === 'boete' ? (
                <>
                  <Search className="h-6 w-6 text-blue-600" />
                  Geavanceerde Boete Zoeker
                </>
              ) : (
                <>
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  Wetgeving & Uitleg Zoeker
                </>
              )}
            </CardTitle>
            <CardDescription>
              {searchMode === 'boete' 
                ? "Stel een vraag, zoek op feitcode, of beschrijf je situatie. Het systeem zoekt automatisch in het bonnenboekje en verifieert met online bronnen."
                : "Zoek uitleg bij wetgeving, regelgeving en verkeersregels. Inclusief RVV 1990, WVW 1994 en gerelateerde regelgeving."
              }
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
                    <SelectValue placeholder="Selecteer situatie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alle_situaties">Alle situaties</SelectItem>
                    {situaties.map((situatie) => {
                      const IconComponent = situatie.icon
                      return (
                        <SelectItem key={situatie.value} value={situatie.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {situatie.label}
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
                    <SelectValue placeholder="Selecteer locatie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alle_locaties">Alle locaties</SelectItem>
                    {locaties.map((locatie) => (
                      <SelectItem key={locatie.value} value={locatie.value}>
                        {locatie.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Input */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={
                    searchMode === 'boete' 
                      ? "Bijv: 'donkere ramen auto', 'N420', 'te hard rijden 80 zone'" 
                      : "Bijv: 'artikel 20 RVV 1990', 'snelheidslimiet wetgeving', 'WVW 1994'"
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      searchMode === 'boete' ? handleUnifiedSearch() : handleWetSearch()
                    }
                  }}
                  className="h-12 text-base"
                />
              </div>
              <Button 
                onClick={searchMode === 'boete' ? handleUnifiedSearch : handleWetSearch}
                disabled={searchMode === 'boete' ? isLoading : isWetLoading}
                size="lg"
                className="px-8 bg-blue-600 hover:bg-blue-700"
              >
                {(searchMode === 'boete' ? isLoading : isWetLoading) ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Zoeken...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Zoeken
                  </div>
                )}
              </Button>
            </div>
            
            {/* Example Queries */}
            <div className="text-sm text-gray-600">
              <span className="font-medium">Voorbeelden: </span>
              {searchMode === 'boete' ? (
                <>
                  <button 
                    onClick={() => setSearchQuery('donkere ramen auto')}
                    className="text-blue-600 hover:underline mr-2"
                  >
                    &quot;donkere ramen auto&quot;
                  </button>
                  <button 
                    onClick={() => setSearchQuery('N420')}
                    className="text-blue-600 hover:underline mr-2"
                  >
                    &quot;N420&quot;
                  </button>
                  <button 
                    onClick={() => setSearchQuery('te hard rijden 80 zone')}
                    className="text-blue-600 hover:underline"
                  >
                    &quot;te hard rijden 80 zone&quot;
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setSearchQuery('artikel 20 RVV 1990')}
                    className="text-blue-600 hover:underline mr-2"
                  >
                    &quot;artikel 20 RVV 1990&quot;
                  </button>
                  <button 
                    onClick={() => setSearchQuery('WVW 1994 snelheid')}
                    className="text-blue-600 hover:underline mr-2"
                  >
                    &quot;WVW 1994 snelheid&quot;
                  </button>
                  <button 
                    onClick={() => setSearchQuery('Reglement verkeersregels')}
                    className="text-blue-600 hover:underline"
                  >
                    &quot;Reglement verkeersregels&quot;
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Response */}
        {systemResponse && searchMode === 'boete' && (
          <Card className="mb-8 border-blue-200 bg-blue-50/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <MessageCircle className="h-5 w-5" />
                Zoekresultaat & Bonnenboekje Analyse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-blue max-w-none">
                <div className="whitespace-pre-wrap text-blue-900 leading-relaxed">
                  {systemResponse}
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded-lg text-sm text-blue-700">
                  <strong>Bronnen:</strong> Officiële Boetebase OM, Nederlandse wetgeving en bonnenboekje. 
                  Voor de meest actuele informatie: <a href="https://boetebase.om.nl" className="underline font-medium">boetebase.om.nl</a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wet Response */}
        {wetResponse && searchMode === 'wet' && (
          <Card className="mb-8 border-green-200 bg-green-50/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <BookOpen className="h-5 w-5" />
                Wetgeving & Uitleg
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-green max-w-none">
                <div className="whitespace-pre-wrap text-green-900 leading-relaxed">
                  {wetResponse}
                </div>
                <div className="mt-4 p-3 bg-green-100 rounded-lg text-sm text-green-700">
                  <strong>Bronnen:</strong> Nederlandse Wetgeving, RVV 1990, WVW 1994, Reglement verkeersregels en verkeerstekens 1990. 
                  Voor officiële teksten: <a href="https://wetten.overheid.nl" className="underline font-medium">wetten.overheid.nl</a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {results.length > 0 && searchMode === 'boete' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Gevonden Feitcodes ({results.length})
              </h2>
              <Badge variant="outline" className="px-3 py-1">
                Officië Boetebase OM
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
                        <CardTitle className="text-lg leading-tight mb-2 text-gray-900">
                          {boete.omschrijving}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {boete.juridischeGrondslag}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">
                            €{typeof boete.standaardboete === 'number' ? boete.standaardboete : boete.standaardboete}
                          </div>
                          <div className="text-xs text-gray-500">
                            standaardboete
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {boete.toelichting && (
                    <CardContent className="pt-0 pb-3">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {boete.toelichting}
                      </p>
                    </CardContent>
                  )}
                  
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDetailExplanation(boete)}
                        className="text-xs"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Meer uitleg
                      </Button>
                      
                      {boete.bronUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(boete.bronUrl, '_blank')}
                          className="text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Officiële bron
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !isWetLoading && results.length === 0 && !systemResponse && !wetResponse && searchQuery && (
          <Card className="text-center py-12 bg-white/60 backdrop-blur-sm">
            <CardContent>
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Geen resultaten gevonden</h3>
              <p className="text-gray-600 mb-4">
                Probeer je zoekopdracht anders te formuleren of gebruik specifiekere termen.
              </p>
              <div className="text-sm text-gray-500">
                <strong>Tips:</strong> Gebruik concrete termen zoals &quot;donkere ramen&quot;, feitcodes zoals &quot;N420&quot;, 
                of beschrijf de situatie duidelijk.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-12 bg-gray-50/50 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <FileText className="h-5 w-5" />
              Hoe werkt de zoekfunctie?
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Boetes & Feitcodes</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Zoek op specifieke feitcodes (bijv: N420, V100)</li>
                <li>• Beschrijf je situatie in gewone taal</li>
                <li>• Het systeem doorzoekt het bonnenboekje en verifieert online</li>
                <li>• Resultaten worden gecontroleerd met officiële bronnen</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Wet & Uitleg</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Zoek uitleg bij wetartikelen</li>
                <li>• RVV 1990, WVW 1994 en gerelateerde regelgeving</li>
                <li>• Reglement verkeersregels en verkeerstekens 1990</li>
                <li>• Juridische achtergrond en uitleg</li>
              </ul>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
} 