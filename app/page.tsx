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
  Loader2,
  UserPlus,
  Eye,
  EyeOff
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
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1.5">
                <Zap className="h-4 w-4 mr-2" />
                Nederlandse Juridische AI • Beta
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              <span className="text-blue-600">WetHelder</span>
              <br />
              <span className="text-2xl md:text-4xl">Juridische Hulp op Maat</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Stel juridische vragen of analyseer specifieke wetsartikelen. 
              Aangepast aan uw beroep voor de meest relevante antwoorden.
            </p>
            
            {/* Two Main Options */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
              {/* Chat Option */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200 cursor-pointer" onClick={() => router.push('/ask')}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900">Juridische Chat</h3>
                    <p className="text-sm text-gray-600">Voor algemene juridische vragen</p>
                  </div>
                </div>
                
                <div className="text-left mb-4">
                  <p className="text-gray-700 mb-3">
                    <strong>Wanneer te gebruiken:</strong> Voor praktische juridische vragen, situaties, procedures of algemene uitleg.
                  </p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>• &quot;Wat zijn mijn rechten als huurder?&quot;</p>
                    <p>• &quot;Hoe regel ik een echtscheiding?&quot;</p>
                    <p>• &quot;Welke bevoegdheden heeft een BOA?&quot;</p>
                  </div>
                </div>
                
                <Button className="w-full" asChild>
                  <Link href="/ask">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start Chat
                  </Link>
                </Button>
              </Card>

              {/* Wetuitleg Option */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200 cursor-pointer" onClick={() => router.push('/wetuitleg')}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Scale className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900">Wetuitleg</h3>
                    <p className="text-sm text-gray-600">Voor specifieke wetsartikelen</p>
                  </div>
                </div>
                
                <div className="text-left mb-4">
                  <p className="text-gray-700 mb-3">
                    <strong>Wanneer te gebruiken:</strong> Voor uitgebreide uitleg van specifieke wetsartikelen met volledige tekst en jurisprudentie.
                  </p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>• &quot;Wat zegt artikel 318 Sr?&quot;</p>
                    <p>• &quot;Leg artikel 96b Sv uit&quot;</p>
                    <p>• &quot;Analyseer artikel 8 EVRM&quot;</p>
                  </div>
                </div>
                
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/wetuitleg">
                    <Scale className="h-4 w-4 mr-2" />
                    Probeer Wetuitleg
                  </Link>
                </Button>
              </Card>
            </div>

            {/* Quick Search */}
            <Card className="max-w-2xl mx-auto mb-6 shadow-md bg-gray-50/50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Of stel direct een vraag..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 text-base h-10"
                      disabled={isSubmitting}
                    />
                    <Button 
                      onClick={handleSearch}
                      disabled={!searchQuery.trim() || isSubmitting}
                      className="w-full sm:w-auto h-10"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Bezig...' : 'Zoek'}
                    </Button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
                    <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value)}>
                      <SelectTrigger className="w-full sm:w-48 h-9 text-sm">
                        <SelectValue placeholder="Selecteer uw functie" />
                      </SelectTrigger>
                      <SelectContent>
                        {professionProfiles.slice(0, 8).map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-blue-600">{stat.number}</div>
                  <div className="text-xs md:text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Compact */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Waarom WetHelder?
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Officiële Bronnen</h4>
                <p className="text-sm text-gray-600">66+ betrouwbare juridische bronnen</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Altijd Actueel</h4>
                <p className="text-sm text-gray-600">Real-time updates van wetgeving</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Voor Professionals</h4>
                <p className="text-sm text-gray-600">23 beroepsprofielen beschikbaar</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Snel & Accuraat</h4>
                <p className="text-sm text-gray-600">Binnen seconden een antwoord</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Example Questions Section - Compact */}
      <section className="py-12 bg-gradient-to-br from-gray-50 to-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Populaire Vragen
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              {
                question: "Wat zijn mijn rechten als huurder?",
                category: "Huurrecht",
                icon: Home,
                color: "bg-blue-50 text-blue-700 border-blue-200",
                profile: "algemeen"
              },
              {
                question: "Wanneer mag een BOA aanhouden?",
                category: "Handhaving",
                icon: Shield,
                color: "bg-orange-50 text-orange-700 border-orange-200",
                profile: "boa"
              },
              {
                question: "Hoe werk echtscheiding bij kinderen?",
                category: "Familierecht",
                icon: Heart,
                color: "bg-pink-50 text-pink-700 border-pink-200",
                profile: "algemeen"
              }
            ].map((example, index) => {
              const IconComponent = example.icon
              return (
                <Card 
                  key={index}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  onClick={() => {
                    const params = new URLSearchParams({
                      q: example.question,
                      profile: example.profile,
                      autoSubmit: 'true'
                    })
                    router.push(`/ask?${params.toString()}`)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${example.color} flex-shrink-0`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge variant="secondary" className="text-xs mb-1">
                          {example.category}
                        </Badge>
                        <p className="text-sm font-medium leading-tight group-hover:text-blue-600 transition-colors">
                          {example.question}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/ask">
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Chat
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Additional Links Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Jurisprudentie Card */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => router.push('/jurisprudentie')}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Gavel className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Jurisprudentie</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Doorzoek rechtspraak en uitspraken per wetsartikel of onderwerp.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/jurisprudentie">
                  <Gavel className="h-4 w-4 mr-2" />
                  Zoek Rechtspraak
                </Link>
              </Button>
            </Card>

            {/* About Card */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Info className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Over WetHelder</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                WetHelder is in bèta. Vragen of opmerkingen? Neem contact op.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/contact">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact
                </Link>
              </Button>
            </Card>

            {/* Profiles Card */}
            <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => router.push('/ask')}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">23 Beroepsprofielen</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Van politie tot advocaat: aangepaste antwoorden per beroep.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/ask">
                  <Users className="h-4 w-4 mr-2" />
                  Bekijk Profielen
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Begin met uw juridische vraag
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              66+ officiële bronnen • 23 beroepsprofielen • 24/7 beschikbaar • Direct resultaat
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                <Link href="/ask">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Start Juridische Chat
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
                <Link href="/wetuitleg">
                  <Scale className="h-5 w-5 mr-2" />
                  Analyseer Wetsartikel
                </Link>
              </Button>
            </div>
            
            <div className="text-sm opacity-90 space-y-2">
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Geen account verplicht
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Officiële Nederlandse bronnen
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Direct resultaat
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
} 