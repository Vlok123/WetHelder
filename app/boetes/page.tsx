'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, ExternalLink, MessageCircle, Scale, Euro, FileText } from 'lucide-react'

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/boetes/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      })
      
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || [])
      }
    } catch (error) {
      console.error('Search error:', error)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Boetes & Feitcodes
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Zoek officiële boetes en feitcodes uit de Boetebase van het Openbaar Ministerie. 
            Inclusief juridische grondslag en uitleg via AI.
          </p>
        </div>

        {/* Juridische bronvermelding */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <FileText className="h-5 w-5" />
              Officiële Bronnen
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-700">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <strong>Boetebase OM:</strong>
                <br />
                <a href="https://boetebase.om.nl" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-1 text-blue-600 hover:underline">
                  boetebase.om.nl <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div>
                <strong>Wetten.nl:</strong>
                <br />
                <a href="https://wetten.overheid.nl" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1 text-blue-600 hover:underline">
                  wetten.overheid.nl <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div>
                <strong>Hergebruik:</strong>
                <br />
                Art. 15b Auteurswet & EU Open Data Richtlijn
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zoekbalk */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Zoek op feitcode of omschrijving (bijv. 'rechtsinhalen', 'W010a', 'alcohol')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="text-lg py-3"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                className="px-8 py-3"
              >
                <Search className="h-5 w-5 mr-2" />
                {isLoading ? 'Zoeken...' : 'Zoek'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Zoekresultaten */}
        {results.length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Zoekresultaten ({results.length})
            </h2>
            {results.map((boete, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {boete.feitcode}
                        </Badge>
                        <span>{boete.omschrijving}</span>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        <strong>Juridische grondslag:</strong> {boete.juridischeGrondslag}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-2xl font-bold text-green-600">
                        <Euro className="h-6 w-6 mr-1" />
                        {boete.standaardboete}
                      </div>
                      <Badge variant={boete.type === 'misdrijf' ? 'destructive' : 'secondary'}>
                        {boete.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {boete.toelichting && (
                    <p className="text-gray-600 mb-4">{boete.toelichting}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {boete.bronUrl && (
                        <a 
                          href={boete.bronUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                        >
                          Officiële bron <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => handleChatExplanation(boete)}
                      className="flex items-center gap-2"
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

        {/* ChatGPT Uitleg */}
        {selectedBoete && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <MessageCircle className="h-5 w-5" />
                AI Uitleg voor {selectedBoete.feitcode}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isChatLoading ? (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  Uitleg wordt gegenereerd...
                </div>
              ) : chatResponse ? (
                <div className="prose prose-green max-w-none">
                  <div className="whitespace-pre-wrap text-green-800">
                    {chatResponse}
                  </div>
                  <div className="mt-4 p-3 bg-green-100 rounded-lg text-sm text-green-700">
                    <strong>Let op:</strong> Dit is algemene informatie gebaseerd op officiële bronnen. 
                    Raadpleeg <a href="https://boetebase.om.nl" className="underline">Boetebase.om.nl</a> voor actuele details.
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Geen resultaten */}
        {!isLoading && results.length === 0 && searchQuery && (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-gray-600 mb-4">
                Geen resultaten gevonden voor "{searchQuery}"
              </p>
              <p className="text-sm text-gray-500">
                Probeer een andere zoekterm of controleer de officiële Boetebase handmatig.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
} 