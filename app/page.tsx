'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Scale, 
  FileText, 
  Shield, 
  Zap, 
  Globe, 
  Clock, 
  Lock,
  BookOpen,
  Check,
  UserCheck,
  GraduationCap,
  Gavel,
  Building,
  MapPin,
  Calculator,
  Home,
  Heart,
  Briefcase,
  Search,
  Mail,
  Info,
  CheckCircle,
  Bot,
  Menu,
  X,
  History,
  Bookmark,
  Settings,
  Sun,
  Moon,
  Mic,
  Plus,
  ChevronRight,
  LogIn,
  LogOut,
  Trash2,
  Loader2
} from 'lucide-react'

const professionProfiles = [
  {
    id: 'algemeen',
    name: 'Algemeen',
    description: 'Volledig juridisch antwoord zonder specialisatie',
    icon: Info,
    color: 'bg-gray-50 text-gray-700 border-gray-200'
  },
  {
    id: 'advocaat',
    name: 'Advocaat',
    description: 'Procesrecht, verdedigingsstrategieën, jurisprudentie en ECLI-nummers',
    icon: Scale,
    color: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    id: 'politieagent',
    name: 'Politieagent',
    description: 'Praktische bevoegdheden, dwangmiddelen, aanhoudingsrecht en doorzoekingsprocedures',
    icon: Shield,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  {
    id: 'boa',
    name: 'BOA / Handhaver',
    description: 'Domeinspecifieke bevoegdheden, APV-handhaving en verschil met politiebevoegdheden',
    icon: Shield,
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200'
  },
  {
    id: 'rechter',
    name: 'Rechter',
    description: 'Procesrecht, bewijsrecht, motiveringsplicht en uitspraakvorming',
    icon: Gavel,
    color: 'bg-red-50 text-red-700 border-red-200'
  },
  {
    id: 'notaris',
    name: 'Notaris',
    description: 'Burgerlijk recht en notariële praktijk',
    icon: FileText,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    id: 'deurwaarder',
    name: 'Deurwaarder',
    description: 'Executierecht en beslagprocedures',
    icon: FileText,
    color: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  {
    id: 'bedrijfsjurist',
    name: 'Bedrijfsjurist',
    description: 'Ondernemingsrecht en compliance',
    icon: Building,
    color: 'bg-slate-50 text-slate-700 border-slate-200'
  },
  {
    id: 'gemeenteambtenaar',
    name: 'Gemeenteambtenaar',
    description: 'Bestuursrecht en lokale verordeningen',
    icon: MapPin,
    color: 'bg-green-50 text-green-700 border-green-200'
  },
  {
    id: 'gemeentejurist',
    name: 'Gemeentejurist',
    description: 'APVs, Gemeentewet, Omgevingswet, bestuurlijke sancties',
    icon: Building,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    id: 'belastingadviseur',
    name: 'Belastingadviseur',
    description: 'Fiscaal recht en belastingwetgeving',
    icon: Calculator,
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200'
  },
  {
    id: 'accountant',
    name: 'Accountant',
    description: 'Financieel recht en verslaggeving',
    icon: Calculator,
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    id: 'makelaar',
    name: 'Makelaar',
    description: 'Vastgoedrecht en makelaarsrecht',
    icon: Home,
    color: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  {
    id: 'verzekeringsagent',
    name: 'Verzekeringsagent',
    description: 'Verzekeringsrecht en aansprakelijkheid',
    icon: Shield,
    color: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    id: 'hr-medewerker',
    name: 'HR-medewerker',
    description: 'Arbeidsrecht en personeelsbeleid',
    icon: Users,
    color: 'bg-pink-50 text-pink-700 border-pink-200'
  },
  {
    id: 'compliance-officer',
    name: 'Compliance Officer',
    description: 'Toezichtrecht en compliance',
    icon: CheckCircle,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  {
    id: 'veiligheidsbeambte',
    name: 'Veiligheidsbeambte',
    description: 'Veiligheidsrecht en preventie',
    icon: Shield,
    color: 'bg-red-50 text-red-700 border-red-200'
  },
  {
    id: 'beveiliger',
    name: 'Beveiliger',
    description: 'WPBR, APVs, onderscheid publieke/private bevoegdheden',
    icon: Shield,
    color: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  {
    id: 'trainer',
    name: 'Trainer / Opleider',
    description: 'Volledig gestructureerde antwoorden voor educatief gebruik',
    icon: GraduationCap,
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    id: 'vervoersmedewerker',
    name: 'Vervoersmedewerker',
    description: 'Wet personenvervoer, Spoorwegwet, OV-bevoegdheden',
    icon: Users,
    color: 'bg-green-50 text-green-700 border-green-200'
  },
  {
    id: 'zorgprofessional',
    name: 'Zorgprofessional',
    description: 'Wvggz, Wzd, AVG/WGBO bij gegevensuitwisseling',
    icon: Heart,
    color: 'bg-pink-50 text-pink-700 border-pink-200'
  },
  {
    id: 'aspirant',
    name: 'Aspirant',
    description: 'Uitgebreide uitleg met praktijkvoorbeelden',
    icon: UserCheck,
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    id: 'student',
    name: 'Student',
    description: 'Stapsgewijze uitleg, structuur voor verslagen en uitgebreide bronvermelding',
    icon: GraduationCap,
    color: 'bg-green-50 text-green-700 border-green-200'
  }
]

const stats = [
  { number: '56+', label: 'Officiële bronnen' },
  { number: '23', label: 'Beroepsprofielen' },
  { number: '8', label: 'Hoofddoelgroepen' },
  { number: '24/7', label: 'Beschikbaar' }
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('algemeen')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [wetUitlegEnabled, setWetUitlegEnabled] = useState(false)
  const router = useRouter()

  const handleSearch = async () => {
    if (!searchQuery.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    
    // Store query in localStorage with the key that ask page listens for
    const query = searchQuery.trim()
    const questionData = {
      question: query,
      profile: selectedRole
    }
    
    localStorage.setItem('wetHelder_mainscreen_question', JSON.stringify(questionData))
    
    // Also store in sessionStorage as backup
    sessionStorage.setItem('autoSubmitQuery', query)
    sessionStorage.setItem('autoSubmitProfile', selectedRole)
    
    // Navigate to /ask with query and profile parameters as additional backup
    const params = new URLSearchParams({
      q: query,
      profile: selectedRole
    })
    
    // Add Wet & Uitleg parameter if enabled
    if (wetUitlegEnabled) {
      params.set('wetuitleg', 'true')
      localStorage.setItem('wetUitlegEnabled', 'true')
    }
    
    // Use router.push for better navigation
    router.push(`/ask?${params.toString()}`)
  }

  const handleProfileSelect = (profileId: string) => {
    // Navigate directly to /ask with the selected profile
    router.push(`/ask?profile=${profileId}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                Intelligente Juridische Assistent • Nederlandse Wetgeving • Beta
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="text-blue-600">WetHelder</span>
              <br />
              <span className="text-3xl md:text-5xl">Nederlandse Juridische Assistent</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              Krijg direct antwoord op juridische vragen, doorzoek Nederlandse wetgeving en 
              ontvang professionele uitleg. Voor burgers, juristen, handhaving en studenten.
            </p>
            
            {/* Beta Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">WetHelder is momenteel in bèta</span>
                </div>
                <span className="text-amber-600 text-sm">•</span>
                <span className="text-amber-700 text-sm">Vragen of opmerkingen?</span>
                <Button variant="outline" size="sm" asChild className="border-amber-300 text-amber-700 hover:bg-amber-100">
                  <Link href="/contact">
                    <Mail className="h-3 w-3 mr-1" />
                    Contact
                  </Link>
                </Button>
              </div>
            </div>

            {/* Quick Search */}
            <Card className="max-w-2xl mx-auto mb-8 shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Search input with submit button */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="Stel uw juridische vraag..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 text-base h-12"
                      disabled={isSubmitting}
                    />
                    <Button 
                      size="lg" 
                      onClick={handleSearch}
                      disabled={!searchQuery.trim() || isSubmitting}
                      className="w-full sm:w-auto h-12 px-6"
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      {isSubmitting ? 'Bezig...' : 'Vraag stellen'}
                    </Button>
                  </div>
                  
                  {/* Role selector and Wet & Uitleg button */}
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center">
                    <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value)}>
                      <SelectTrigger className="w-full sm:w-auto h-10 min-w-[200px]">
                        <SelectValue placeholder="Selecteer uw functie" />
                      </SelectTrigger>
                      <SelectContent>
                        {professionProfiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant={wetUitlegEnabled ? "default" : "outline"}
                      size="sm"
                      className={`flex items-center gap-2 text-sm h-10 w-full sm:w-auto transition-all ${
                        wetUitlegEnabled 
                          ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setWetUitlegEnabled(!wetUitlegEnabled)}
                    >
                      <BookOpen className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {wetUitlegEnabled ? 'Wet & Uitleg: AAN' : 'Wet & Uitleg modus'}
                      </span>
                      <span className="sm:hidden">
                        {wetUitlegEnabled ? 'W&U: AAN' : 'Wet & Uitleg'}
                      </span>
                      {wetUitlegEnabled ? (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Actief</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Nieuw</Badge>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-600 text-center">
                    💡 <strong>Tip:</strong> Selecteer eerst uw functie, schakel eventueel Wet & Uitleg in voor diepgaande analyses, stel dan uw vraag
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Example Questions Section */}
      <section className="py-12 bg-gradient-to-br from-gray-50 to-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Inspiratie voor Uw Vraag
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Populaire juridische vragen uit verschillende rechtsgebieden. Klik op een vraag om direct een antwoord te krijgen.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {[
              {
                question: "Wat zijn mijn rechten als huurder bij geluidsoverlast?",
                category: "Huurrecht",
                icon: Home,
                color: "bg-blue-50 text-blue-700 border-blue-200",
                profile: "algemeen"
              },
              {
                question: "Wanneer mag ik iemand aanhouden als BOA?",
                category: "Handhaving",
                icon: Shield,
                color: "bg-orange-50 text-orange-700 border-orange-200",
                profile: "boa"
              },
              {
                question: "Hoe stel ik een arbeidscontract juist op?",
                category: "Arbeidsrecht",
                icon: Briefcase,
                color: "bg-purple-50 text-purple-700 border-purple-200",
                profile: "advocaat"
              },
              {
                question: "Welke stappen bij echtscheiding met kinderen?",
                category: "Familierecht",
                icon: Heart,
                color: "bg-pink-50 text-pink-700 border-pink-200",
                profile: "algemeen"
              },
              {
                question: "Wat is het verschil tussen eigendom en erfpacht?",
                category: "Vastgoedrecht",
                icon: Building,
                color: "bg-green-50 text-green-700 border-green-200",
                profile: "algemeen"
              },
              {
                question: "Hoe bereken ik schadevergoeding bij verkeersongeluk?",
                category: "Verkeersrecht",
                icon: Calculator,
                color: "bg-indigo-50 text-indigo-700 border-indigo-200",
                profile: "advocaat"
              }
            ].map((example, index) => {
              const IconComponent = example.icon
              return (
                <Card 
                  key={index}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-105"
                  onClick={() => {
                    const questionData = {
                      question: example.question,
                      profile: example.profile
                    }
                    localStorage.setItem('wetHelder_mainscreen_question', JSON.stringify(questionData))
                    sessionStorage.setItem('autoSubmitQuery', example.question)
                    sessionStorage.setItem('autoSubmitProfile', example.profile)
                    
                    const params = new URLSearchParams({
                      q: example.question,
                      profile: example.profile
                    })
                    router.push(`/ask?${params.toString()}`)
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${example.color} group-hover:scale-110 transition-transform flex-shrink-0`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge variant="secondary" className="text-xs mb-2">
                          {example.category}
                        </Badge>
                        <CardTitle className="text-sm leading-tight group-hover:text-blue-600 transition-colors">
                          {example.question}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Klik voor antwoord</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600 mb-4">
              Niet uw vraag erbij? Stel gewoon uw eigen juridische vraag hierboven.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/ask">
                <Search className="h-4 w-4 mr-2" />
                Alle vragen stellen
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Hoe Werkt WetHelder?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Drie eenvoudige stappen naar betrouwbare juridische informatie
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1: Ask Questions */}
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-200">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Stel Juridische Vragen</h3>
              <p className="text-gray-600 mb-4">
                Stel juridische vragen en krijg antwoord op grond van <strong>officiële bronnen</strong>. 
                Onze AI doorzoekt 56+ betrouwbare juridische databases voor actuele informatie.
              </p>
              <div className="text-sm text-blue-600 font-medium">
                ✓ Wetgeving • Rechtspraak • Jurisprudentie
              </div>
            </Card>

            {/* Step 2: Choose Profile */}
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-200">
              <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Gebruik Een Functieprofiel</h3>
              <p className="text-gray-600 mb-4">
                Gebruik een functieprofiel voor <strong>gerichte antwoorden</strong>. 
                Een advocaat krijgt een ander antwoord dan een politieagent - aangepast aan uw werkcontext.
              </p>
              <div className="text-sm text-purple-600 font-medium">
                ✓ 8 Hoofdprofielen • Aangepaste Antwoorden
              </div>
            </Card>

            {/* Step 3: Wet & Uitleg */}
            <Card className="text-center p-6 hover:shadow-lg transition-all duration-200">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Wet & Uitleg Voor Diepgang</h3>
              <p className="text-gray-600 mb-4">
                <strong>Wet & Uitleg gaat de diepte in</strong> - gebruik dit enkel wanneer je diepgang wilt. 
                Niet voor overige vragen. Krijg uitgebreide juridische analyses met artikelverwijzingen.
              </p>
              <div className="text-sm text-green-600 font-medium">
                ✓ Diepgaande Analyse • Artikelverwijzingen
              </div>
            </Card>
          </div>

          {/* Usage Tips */}
          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">💡 Gebruikstips</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Voor snelle vragen:</strong> Gebruik het standaard chatvenster zonder Wet & Uitleg</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Voor complexe analyses:</strong> Schakel Wet & Uitleg in voor uitgebreide uitleg</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Kies het juiste profiel:</strong> Politieagent, advocaat, burger - elk krijgt passende antwoorden</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Alle antwoorden:</strong> Gebaseerd op officiële Nederlandse wetgeving en rechtspraak</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Profession Profiles */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kies Uw Profiel</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Selecteer uw beroep voor aangepaste juridische antwoorden. Klik op een profiel om direct te beginnen met chatten.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {professionProfiles.map((profile) => {
              const IconComponent = profile.icon
              return (
                <Card 
                  key={profile.id} 
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-105"
                  onClick={() => handleProfileSelect(profile.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${profile.color} group-hover:scale-110 transition-transform flex-shrink-0`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-semibold group-hover:text-blue-600 transition-colors leading-tight">
                          {profile.name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1 overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {profile.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-blue-50 group-hover:text-blue-600 text-xs h-8">
                      Start chat
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Twee Manieren om Juridische Hulp te Krijgen</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Kies de methode die het beste bij uw vraag past
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Chat Feature */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Juridische Chat</h3>
                  <p className="text-sm text-gray-600">Voor snelle vragen en directe antwoorden</p>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Snelle antwoorden op juridische vragen</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Aangepast per beroepsprofiel</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Bronvermelding en citaten</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>4 gratis vragen per dag</span>
                </li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/ask">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Chat
                </Link>
              </Button>
            </Card>

            {/* Wet & Uitleg Feature */}
            <Card className="p-6 hover:shadow-lg transition-shadow border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Scale className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Wet & Uitleg</h3>
                  <p className="text-sm text-gray-600">Voor uitgebreide wetsartikel analyses</p>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Volledige wetsartikel teksten</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Praktische toepassingen</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Relevante jurisprudentie</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Verwante artikelen</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/wetuitleg">
                  <Scale className="h-4 w-4 mr-2" />
                  Probeer Wet & Uitleg
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Waarom WetHelder?
              </h2>
              <div className="space-y-4">
                {[
                  'Actuele Nederlandse wetgeving en rechtspraak',
                  'Intelligente juridische analyses',
                  'Aangepaste antwoorden per doelgroep',
                  'Citaten met bronvermelding',
                  '24/7 beschikbaar',
                  'Veilig en betrouwbaar'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 space-y-3">
                <Button size="lg" asChild>
                  <Link href="/ask">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Start Chat
                  </Link>
                </Button>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Accounts zijn tijdelijk helemaal gratis!</span>
                </div>
              </div>
            </div>
            
            <div className="lg:text-right">
              <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">Nederlandse Focus</div>
                      <div className="text-sm text-gray-600">Specifiek voor NL wetgeving</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">Intelligent Systeem</div>
                      <div className="text-sm text-gray-600">Geavanceerde taalmodellen</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">Altijd Actueel</div>
                      <div className="text-sm text-gray-600">Real-time updates</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Klaar om te beginnen?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Krijg direct antwoord op uw juridische vragen met WetHelder&apos;s intelligente assistent.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/ask">
                <MessageSquare className="h-5 w-5 mr-2" />
                Start Gratis Chat
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/wetuitleg">
                <Scale className="h-5 w-5 mr-2" />
                Wet & Uitleg
              </Link>
            </Button>
          </div>
          
          <div className="mt-6 text-sm opacity-90">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">Accounts zijn tijdelijk helemaal gratis!</span>
            </div>
            <div className="mt-1 opacity-75">
              Geen creditcard vereist • Direct beginnen
            </div>
          </div>
        </div>
      </section>

    </div>
  )
} 