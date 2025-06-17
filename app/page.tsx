'use client'

import { useState, useEffect } from 'react'
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
    name: 'Algemeen/Burger',
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

  // Load selected profile from localStorage on mount for persistence
  useEffect(() => {
    const savedProfile = localStorage.getItem('wetHelder_selected_profile')
    if (savedProfile) {
      setSelectedRole(savedProfile)
    }
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    
    const query = searchQuery.trim()
    
    // Clear any existing auto-submit data to prevent conflicts
    localStorage.removeItem('wetHelder_mainscreen_question')
    
    // Build URL parameters for navigation
    const params = new URLSearchParams({
      q: query,
      profile: selectedRole,
      autoSubmit: 'true' // Add flag to indicate this should auto-submit
    })
    
    // Add Wet & Uitleg parameter if enabled
    if (wetUitlegEnabled) {
      params.set('wetuitleg', 'true')
    }
    
    // Navigate directly with URL parameters - this is more reliable than localStorage
    router.push(`/ask?${params.toString()}`)
  }

  const handleProfileSelect = (profileId: string) => {
    // Update the selected role
    setSelectedRole(profileId)
    
    // Store the selected profile for persistence
    localStorage.setItem('wetHelder_selected_profile', profileId)
    
    // Navigate to chat with the selected profile
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
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Extra uitleg</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">+Artikelen</Badge>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-600 text-center">
                    💡 <strong>Tip:</strong> Selecteer eerst uw functie, schakel eventueel Wet & Uitleg in voor <strong>uitgebreide artikelanalyses</strong> en extra jurisprudentie
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

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Hoe Werkt WetHelder?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              WetHelder combineert officiële juridische bronnen met geavanceerde AI om u accurate en betrouwbare juridische informatie te bieden.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <div className="bg-blue-50 rounded-lg p-6 h-full">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">1. Stel Uw Vraag</h3>
                  <p className="text-gray-600 mb-4">
                    Typ uw juridische vraag in gewone taal. Kies eventueel uw professionele achtergrond voor gespecialiseerde antwoorden.
                  </p>
                  <div className="text-sm text-blue-600 font-medium">
                    Bijvoorbeeld: &quot;Wat zijn mijn rechten als huurder?&quot;
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Bot className="h-8 w-8 text-green-600" />
                </div>
                <div className="bg-green-50 rounded-lg p-6 h-full">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">2. AI Analyse</h3>
                  <p className="text-gray-600 mb-4">
                    Onze AI doorzoekt duizenden officiële bronnen: wetten, jurisprudentie, APV&apos;s en actuele regelgeving.
                  </p>
                  <div className="text-sm text-green-600 font-medium">
                    66+ officiële bronnen • Real-time updates
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
                <div className="bg-purple-50 rounded-lg p-6 h-full">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">3. Betrouwbaar Antwoord</h3>
                  <p className="text-gray-600 mb-4">
                    Ontvang een compleet antwoord met wetsartikelen, jurisprudentie en directe links naar officiële bronnen.
                  </p>
                  <div className="text-sm text-purple-600 font-medium">
                    Altijd met bronvermelding • Actuele informatie
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Features */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Waarom WetHelder?</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Officiële Bronnen</h4>
                  <p className="text-sm text-gray-600">Alleen betrouwbare, officiële juridische bronnen</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Altijd Actueel</h4>
                  <p className="text-sm text-gray-600">Real-time updates van nieuwe wetten en regelgeving</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Voor Professionals</h4>
                  <p className="text-sm text-gray-600">Gespecialiseerde antwoorden per beroepsgroep</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
                    <Zap className="h-6 w-6 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Snel & Accuraat</h4>
                  <p className="text-sm text-gray-600">Binnen seconden een compleet juridisch antwoord</p>
                </div>
              </div>
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
                    // Clear any existing data to prevent conflicts
                    localStorage.removeItem('wetHelder_mainscreen_question')
                    
                    const params = new URLSearchParams({
                      q: example.question,
                      profile: example.profile,
                      autoSubmit: 'true'
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

      {/* Wetteksten Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Wetteksten</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Ontdek onze geavanceerde Wetteksten functie voor uitgebreide juridische analyses van Nederlandse wetsartikelen
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <BookOpen className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Wetteksten Analyse</h3>
                  <p className="text-gray-600">Diepgaande uitleg van Nederlandse wetsartikelen</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Volledige Wetsartikel Teksten</h4>
                      <p className="text-sm text-gray-600">Exacte tekst van wetsartikelen uit officiële bronnen</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Praktische Toepassingen</h4>
                      <p className="text-sm text-gray-600">Concrete voorbeelden van hoe artikelen worden toegepast</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Relevante Jurisprudentie</h4>
                      <p className="text-sm text-gray-600">Belangrijke uitspraken met ECLI-nummers</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Verwante Artikelen</h4>
                      <p className="text-sm text-gray-600">Gerelateerde wetsartikelen die vaak samen voorkomen</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Officiële Bronverwijzingen</h4>
                      <p className="text-sm text-gray-600">Directe links naar wetten.overheid.nl</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Uitgebreide Analyses</h4>
                      <p className="text-sm text-gray-600">Gedetailleerde uitleg en interpretatie van complexe artikelen</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/wetuitleg">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Probeer Wetteksten
                  </Link>
                </Button>
                <p className="text-sm text-gray-600 mt-3">
                  Perfect voor juristen, advocaten, studenten en iedereen die diepgaande wetsuitleg nodig heeft
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Jurisprudentie Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Jurisprudentie Zoeken</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Doorzoek relevante rechtspraak en uitspraken per wetsartikel of onderwerp
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Gavel className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Jurisprudentie Database</h3>
                  <p className="text-gray-600">Zoek relevante uitspraken van Nederlandse rechters</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Zoek op Wetsartikel</h4>
                      <p className="text-sm text-gray-600">Bijv. &quot;96b Sv&quot;, &quot;95 Sv&quot;, &quot;8 EVRM&quot; - vind alle relevante uitspraken</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Zoek op Onderwerp</h4>
                      <p className="text-sm text-gray-600">Bijv. &quot;doorzoeken voertuig&quot;, &quot;fouillering&quot;, &quot;privacy rechten&quot;</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Uitspraken in Begrijpelijke Taal</h4>
                      <p className="text-sm text-gray-600">Samenvattingen die ook voor niet-juristen duidelijk zijn</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Officiële ECLI-nummers</h4>
                      <p className="text-sm text-gray-600">Directe links naar volledige uitspraken op rechtspraak.nl</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Geavanceerde Filters</h4>
                      <p className="text-sm text-gray-600">Filter op jaar, type rechter, rechtsgebied en meer</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Hoge Raad tot Rechtbank</h4>
                      <p className="text-sm text-gray-600">Uitspraken van alle Nederlandse rechtsniveaus</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Voorbeelden van zoekopdrachten:</h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white">96b Sv</Badge>
                    <span className="text-gray-600">→ Doorzoeken voertuigen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white">95 Sv</Badge>
                    <span className="text-gray-600">→ Fouillering personen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white">8 EVRM</Badge>
                    <span className="text-gray-600">→ Privacy rechten</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white">huiszoeking</Badge>
                    <span className="text-gray-600">→ Alle huiszoeking cases</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Button size="lg" asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/jurisprudentie">
                    <Gavel className="h-5 w-5 mr-2" />
                    Doorzoek Jurisprudentie
                  </Link>
                </Button>
                <p className="text-sm text-gray-600 mt-3">
                  Perfect voor advocaten, rechtenstudenten, politieagenten en iedereen die rechtspraak wil begrijpen
                </p>
              </div>
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

            {/* Wetteksten Feature */}
            <Card className="p-6 hover:shadow-lg transition-shadow border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Scale className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Wetteksten</h3>
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
                  Probeer Wetteksten
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
                Wetteksten
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