'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Gavel, 
  ExternalLink, 
  Calendar, 
  Building, 
  Filter, 
  FileText,
  Scale,
  Info,
  BookOpen
} from 'lucide-react'

type Ruling = {
  ecli: string;
  title: string;
  summary: string;
  date: string;
  court: string;
  article: string;
  topic: string;
  link: string;
  year: number;
  caseType: string;
};

const dummyRulings: Ruling[] = [
  {
    ecli: "ECLI:NL:HR:2004:AO2832",
    title: "Onrechtmatig doorzoeken voertuig zonder verdenking",
    summary: "De Hoge Raad oordeelde dat een voertuig niet zonder verdenking doorzocht mag worden. Bewijs werd uitgesloten omdat er geen sprake was van heterdaad of een gegronde verdenking.",
    date: "2004-05-04",
    court: "Hoge Raad",
    article: "96b Sv",
    topic: "doorzoeken voertuig",
    link: "https://uitspraken.rechtspraak.nl/#!/details?id=ECLI:NL:HR:2004:AO2832",
    year: 2004,
    caseType: "Strafrecht"
  },
  {
    ecli: "ECLI:NL:HR:2015:2246",
    title: "Gerechtvaardigd doorzoeken bij verdenking van drugsbezit",
    summary: "De politie mocht het voertuig doorzoeken wegens concrete aanwijzingen voor drugshandel. Het hof verklaarde dit rechtmatig vanwege de urgentie en concrete verdenkingen.",
    date: "2015-07-14",
    court: "Hoge Raad",
    article: "96b Sv",
    topic: "doorzoeken voertuig",
    link: "https://uitspraken.rechtspraak.nl/#!/details?id=ECLI:NL:HR:2015:2246",
    year: 2015,
    caseType: "Strafrecht"
  },
  {
    ecli: "ECLI:NL:GHDHA:2023:1145",
    title: "Fouillering zonder toestemming rechter bij heterdaad",
    summary: "Gerechtshof Den Haag bevestigde dat bij heterdaad een fouillering zonder rechterlijke toestemming is toegestaan onder strikte voorwaarden.",
    date: "2023-03-15",
    court: "Gerechtshof Den Haag",
    article: "95 Sv",
    topic: "fouillering",
    link: "https://uitspraken.rechtspraak.nl/#!/details?id=ECLI:NL:GHDHA:2023:1145",
    year: 2023,
    caseType: "Strafrecht"
  },
  {
    ecli: "ECLI:NL:RBAMS:2022:3456",
    title: "Huiszoeking zonder toestemming rechter nietig verklaard",
    summary: "Rechtbank Amsterdam verklaarde huiszoeking nietig omdat er geen sprake was van spoedgevallen en geen rechterlijke machtiging was verkregen.",
    date: "2022-11-20",
    court: "Rechtbank Amsterdam",
    article: "97 Sv",
    topic: "huiszoeking",
    link: "https://uitspraken.rechtspraak.nl/#!/details?id=ECLI:NL:RBAMS:2022:3456",
    year: 2022,
    caseType: "Strafrecht"
  },
  {
    ecli: "ECLI:NL:HR:2021:1789",
    title: "Privacy rechten versus opsporingsbevoegdheden",
    summary: "Hoge Raad maakte duidelijke afweging tussen privacy rechten (artikel 8 EVRM) en opsporingsbevoegdheden. Proportionaliteit is essentieel.",
    date: "2021-09-12",
    court: "Hoge Raad",
    article: "8 EVRM",
    topic: "privacy",
    link: "https://uitspraken.rechtspraak.nl/#!/details?id=ECLI:NL:HR:2021:1789",
    year: 2021,
    caseType: "Grondrechten"
  }
];

export default function JurisprudentiePage() {
  const [query, setQuery] = useState("")
  const [filtered, setFiltered] = useState<Ruling[]>(dummyRulings)
  const [yearFilter, setYearFilter] = useState("")
  const [courtFilter, setCourtFilter] = useState("")
  const [caseTypeFilter, setCaseTypeFilter] = useState("")
  const [isSearched, setIsSearched] = useState(false)

  const handleSearch = () => {
    if (!query.trim()) {
      setFiltered(dummyRulings)
      setIsSearched(false)
      return
    }

    const q = query.toLowerCase()
    const searchResults = dummyRulings.filter(
      (r) =>
        r.article.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q)
    )
    
    setFiltered(searchResults)
    setIsSearched(true)
  }

  const applyFilters = () => {
    let results = [...dummyRulings]
    
    if (query.trim()) {
      const q = query.toLowerCase()
      results = results.filter(
        (r) =>
          r.article.toLowerCase().includes(q) ||
          r.topic.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q)
      )
    }
    
    if (yearFilter) {
      results = results.filter(r => r.year.toString() === yearFilter)
    }
    
    if (courtFilter) {
      results = results.filter(r => r.court === courtFilter)
    }
    
    if (caseTypeFilter) {
      results = results.filter(r => r.caseType === caseTypeFilter)
    }
    
    setFiltered(results)
    setIsSearched(true)
  }

  const clearFilters = () => {
    setQuery("")
    setYearFilter("")
    setCourtFilter("")
    setCaseTypeFilter("")
    setFiltered(dummyRulings)
    setIsSearched(false)
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
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Gavel className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Jurisprudentie Zoeken</h1>
              <p className="text-gray-600">
                Zoek relevante uitspraken per wetsartikel of onderwerp
              </p>
            </div>
          </div>
          
          {/* Info Card */}
          <Card className="bg-blue-50 border-blue-200 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-5 w-5 text-blue-600" />
                Hoe te gebruiken
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <strong>Zoek op wetsartikel:</strong> bijv. &quot;96b Sv&quot;, &quot;95 Sv&quot;, &quot;8 EVRM&quot;
                </div>
                <div>
                  <strong>Zoek op onderwerp:</strong> bijv. &quot;doorzoeken&quot;, &quot;fouillering&quot;, &quot;privacy&quot;
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Zoeken in jurisprudentie
            </CardTitle>
            <CardDescription>
              Zoek op wetsartikel, onderwerp, of trefwoorden
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Search */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Bijv. &apos;96b Sv&apos; of &apos;doorzoeken voertuig&apos;"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} className="px-6">
                <Search className="h-4 w-4 mr-2" />
                Zoeken
              </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Jaar</label>
                <Input
                  type="number"
                  placeholder="bijv. 2023"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  min="1950"
                  max="2024"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Rechter</label>
                <select
                  value={courtFilter}
                  onChange={(e) => setCourtFilter(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Alle rechters</option>
                  <option value="Hoge Raad">Hoge Raad</option>
                  <option value="Gerechtshof">Gerechtshof</option>
                  <option value="Rechtbank">Rechtbank</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Rechtsgebied</label>
                <select
                  value={caseTypeFilter}
                  onChange={(e) => setCaseTypeFilter(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Alle gebieden</option>
                  <option value="Strafrecht">Strafrecht</option>
                  <option value="Grondrechten">Grondrechten</option>
                </select>
              </div>
              
              <div className="flex gap-2 items-end">
                <Button onClick={applyFilters} variant="outline" className="flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button onClick={clearFilters} variant="ghost" size="sm">
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isSearched ? (
                filtered.length === 0 ? 'Geen uitspraken gevonden' : 
                `${filtered.length} uitspraak${filtered.length !== 1 ? 'en' : ''} gevonden`
              ) : (
                `Alle uitspraken (${filtered.length})`
              )}
            </h2>
          </div>

          {/* Results List */}
          {filtered.length === 0 && isSearched ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Scale className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Geen uitspraken gevonden
                </h3>
                <p className="text-gray-600 mb-4">
                  Probeer andere zoektermen of pas de filters aan.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Alle uitspraken tonen
                </Button>
              </CardContent>
            </Card>
          ) : (
            filtered.map((ruling) => (
              <Card key={ruling.ecli} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {ruling.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="outline" className={getCourtColor(ruling.court)}>
                          <Building className="h-3 w-3 mr-1" />
                          {ruling.court}
                        </Badge>
                        <Badge variant="outline" className="text-gray-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(ruling.date).toLocaleDateString('nl-NL')}
                        </Badge>
                        <Badge variant="secondary" className={getCaseTypeColor(ruling.caseType)}>
                          {ruling.caseType}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <FileText className="h-3 w-3 mr-1" />
                          {ruling.article}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {ruling.summary}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">ECLI:</span> {ruling.ecli}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={ruling.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Volledige uitspraak
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer Info */}
        <Card className="mt-8 bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Over deze jurisprudentie</h4>
                <p className="text-sm text-gray-600">
                  Deze uitspraken zijn afkomstig van rechtspraak.nl en worden gebruikt ter illustratie. 
                  Voor actuele en volledige informatie raadpleeg altijd de officiële bronnen.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 