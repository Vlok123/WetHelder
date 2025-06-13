'use client'

import React, { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Scale, 
  Search,
  BookOpen, 
  Shield,
  Gavel,
  FileText,
  Users,
  ChevronRight,
  LogIn,
  Star,
  CheckCircle,
  ArrowRight,
  Zap,
  Clock,
  Lock,
  User,
  Building,
  MapPin,
  Calculator,
  Home,
  HelpCircle,
  X
} from 'lucide-react'
import Link from 'next/link'

// Professional feature cards - zonder boetes
const MAIN_FEATURES = [
  {
    title: "Juridische Vragen",
    description: "Stel vragen over Nederlandse wetgeving en krijg uitleg gebaseerd op officiële bronnen",
    icon: BookOpen,
    href: "/ask",
    badge: "Populair",
    badgeVariant: "default" as const
  },
  {
    title: "Rechtspraak & Jurisprudentie", 
    description: "Zoek in Nederlandse rechtspraak en belangrijke uitspraken",
    icon: Gavel,
    href: "/ask",
    badge: null,
    badgeVariant: null
  }
]

// Juridische voorbeeldvragen
const JURIDISCHE_VRAGEN = [
  "Wat zijn mijn rechten bij een politiecontrole?",
  "Kan mijn werkgever mij zonder reden ontslaan?",
  "Wanneer mag de politie mijn huis doorzoeken?",
  "Wat moet ik weten over huurrechten en opzegging?",
  "Hoe werkt de Nederlandse rechtspraak?",
  "Welke regels gelden voor online privacy en AVG?"
]

// Platform stats - aangepast zonder feitcodes/boetes
const PLATFORM_STATS = [
  { label: "Wetsartikelen", value: "15.000+" },
  { label: "Wetboeken", value: "25+" },
  { label: "Rechtspraak", value: "100.000+" },
  { label: "Actualiteit", value: "100%" }
]

// Target audience
const TARGET_AUDIENCE = [
  {
    title: "Burgers & Particulieren",
    description: "Begrijpelijke uitleg van wetten en rechten voor iedere Nederlandse burger",
    icon: Users
  },
  {
    title: "Politie & Handhaving", 
    description: "Snel toegang tot relevante wetgeving tijdens handhaving",
    icon: Shield
  },
  {
    title: "Juristen & Advocaten",
    description: "Uitgebreide jurisprudentie en wetsartikelen voor juridische ondersteuning",
    icon: Scale
  },
  {
    title: "Studenten & Onderwijs",
    description: "Studiemateriaal en praktijkvoorbeelden voor juridische opleiding",
    icon: BookOpen
  }
]

// User profile options - uitgebreid met alle professies uit ask pagina
const USER_PROFILES = [
  { 
    value: "algemeen", 
    label: "Algemeen publiek",
    description: "Voor burgers die juridische informatie zoeken",
    icon: Users
  },
  { 
    value: "juridisch-expert", 
    label: "Juridisch Expert",
    description: "Voor ervaren juristen en rechtsgeleerden",
    icon: Scale
  },
  { 
    value: "advocaat", 
    label: "Advocaat",
    description: "Voor praktiserende advocaten",
    icon: Scale
  },
  { 
    value: "politieagent", 
    label: "Politieagent",
    description: "Voor politieagenten en opsporingsambtenaren",
    icon: Shield
  },
  { 
    value: "boa", 
    label: "BOA/Toezichthouder",
    description: "Voor buitengewoon opsporingsambtenaren",
    icon: Shield
  },
  { 
    value: "rechter", 
    label: "Rechter",
    description: "Voor rechters en rechterlijke macht",
    icon: Gavel
  },
  { 
    value: "notaris", 
    label: "Notaris",
    description: "Voor notarissen en notariële praktijk",
    icon: FileText
  },
  { 
    value: "deurwaarder", 
    label: "Deurwaarder",
    description: "Voor deurwaarders en executierecht",
    icon: FileText
  },
  { 
    value: "bedrijfsjurist", 
    label: "Bedrijfsjurist",
    description: "Voor bedrijfsjuristen en compliance",
    icon: Building
  },
  { 
    value: "gemeenteambtenaar", 
    label: "Gemeenteambtenaar",
    description: "Voor gemeentelijke ambtenaren",
    icon: MapPin
  },
  { 
    value: "belastingadviseur", 
    label: "Belastingadviseur",
    description: "Voor belastingadviseurs en fiscalisten",
    icon: Calculator
  },
  { 
    value: "accountant", 
    label: "Accountant",
    description: "Voor accountants en financiële experts",
    icon: Calculator
  },
  { 
    value: "makelaar", 
    label: "Makelaar",
    description: "Voor makelaars en vastgoedrecht",
    icon: Home
  },
  { 
    value: "verzekeringsagent", 
    label: "Verzekeringsagent",
    description: "Voor verzekeringsagenten",
    icon: Shield
  },
  { 
    value: "hr-medewerker", 
    label: "HR-medewerker",
    description: "Voor HR-medewerkers en arbeidsrecht",
    icon: Users
  },
  { 
    value: "compliance-officer", 
    label: "Compliance Officer",
    description: "Voor compliance officers",
    icon: CheckCircle
  },
  { 
    value: "veiligheidsbeambte", 
    label: "Veiligheidsbeambte",
    description: "Voor veiligheidsbeambten",
    icon: Shield
  },
  { 
    value: "beveiliger", 
    label: "(Bedrijfs)beveiliger",
    description: "Voor beveiligers en bedrijfsbeveiliging",
    icon: Shield
  },
  { 
    value: "aspirant", 
    label: "Aspirant",
    description: "Voor aspiranten in juridische functies",
    icon: User
  },
  { 
    value: "student", 
    label: "Student",
    description: "Voor studenten rechten en gerelateerde studies",
    icon: BookOpen
  }
]

export default function HomePage() {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [userProfile, setUserProfile] = useState('algemeen')
  const [wetUitlegEnabled, setWetUitlegEnabled] = useState(false)
  const [wetgevingEnabled, setWetgevingEnabled] = useState(false)
  const [showProfileExplanation, setShowProfileExplanation] = useState(false)

  const handleQuickSearch = (query: string) => {
    // Build profile parameter - map all profession values correctly
    let profileParam = ''
    if (userProfile) {
      // Direct mapping for most values, special cases for backwards compatibility
      const mappedProfile = userProfile === 'juridisch-expert' ? 'juridisch-expert' : userProfile
      profileParam = `&profile=${encodeURIComponent(mappedProfile)}`
    }
    
    const wetUitlegParam = wetUitlegEnabled ? '&wetuitleg=true' : ''
    const wetgevingParam = wetgevingEnabled ? '&wetgeving=true' : ''
    
    // Navigate directly without setting input field
    window.location.href = `/ask?q=${encodeURIComponent(query)}${profileParam}${wetUitlegParam}${wetgevingParam}`
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Build profile parameter - map all profession values correctly
      let profileParam = ''
      if (userProfile) {
        // Direct mapping for most values, special cases for backwards compatibility
        const mappedProfile = userProfile === 'juridisch-expert' ? 'juridisch-expert' : userProfile
        profileParam = `&profile=${encodeURIComponent(mappedProfile)}`
      }
      
      // Add Wet & Uitleg and Wetgeving parameters if enabled
      const wetUitlegParam = wetUitlegEnabled ? '&wetuitleg=true' : ''
      const wetgevingParam = wetgevingEnabled ? '&wetgeving=true' : ''
      
      // Clear the search input immediately after submission
      setSearchQuery('')
      
      // Use Next.js router for better navigation without auto-search
      window.location.href = `/ask?q=${encodeURIComponent(searchQuery)}${profileParam}${wetUitlegParam}${wetgevingParam}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-1 via-surface-2 to-surface-3">
      {/* Professional Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="container-fluid">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Scale className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <span className="text-lg md:text-xl font-bold text-foreground">WetHelder</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/ask" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Juridische Vragen
              </Link>
              <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </nav>

            <div className="flex items-center space-x-2 md:space-x-3">
              {status === 'loading' ? (
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-muted animate-pulse" />
              ) : session ? (
                <div className="flex items-center space-x-2 md:space-x-3">
                  <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                    <Link href="/chat-history">
                      Geschiedenis
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard">
                      <span className="hidden sm:inline">Dashboard</span>
                      <span className="sm:hidden">Menu</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <Button onClick={() => signIn()} size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Inloggen</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-padding-lg">
        <div className="container-narrow text-center">
          <div className="animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Badge variant="secondary">
                <Star className="h-3 w-3 mr-1" />
                Officiële Nederlandse wetgeving
              </Badge>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                IN ONTWIKKELING
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-balance leading-tight">
              Nederlandse wetgeving
              <span className="text-primary block">doorzoeken en begrijpen</span>
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
              Betrouwbare juridische zoektool voor iedereen die officiële informatie zoekt over Nederlandse wetgeving.
              Speciaal ontwikkeld voor mensen die enkel en alleen informatie willen met officiële bronnen.
            </p>

            {/* Beta Warning - zonder AI verwijzing */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-3xl mx-auto mb-8">
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">⚠️ BETA-versie in ontwikkeling</p>
                  <p className="text-xs">Deze applicatie is nog in ontwikkeling. Informatie kan fouten bevatten. Controleer belangrijke informatie altijd via officiële bronnen of raadpleeg een juridisch expert wanneer noodzakelijk.</p>
                </div>
              </div>
            </div>

            {/* User Profile Selection */}
            <div className="max-w-md mx-auto mb-6">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Ik ben:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProfileExplanation(true)}
                  className="h-6 w-6 p-0 rounded-full hover:bg-primary/10"
                >
                  <HelpCircle className="h-4 w-4 text-primary" />
                </Button>
              </div>
              <Select value={userProfile} onValueChange={setUserProfile}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecteer uw functie/profiel" />
                </SelectTrigger>
                <SelectContent>
                  {USER_PROFILES.map((profile) => (
                    <SelectItem key={profile.value} value={profile.value}>
                      {profile.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {userProfile && (
                <p className="text-xs text-muted-foreground mt-2">
                  Dit helpt ons de zoekresultaten beter af te stemmen op uw behoeften
                </p>
              )}
              
              {/* Wet & Uitleg en Wetgeving Extra Features */}
              {userProfile && (
                <div className="mt-3 space-y-3">
                  {/* Wet & Uitleg optie */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wetUitlegEnabled}
                        onChange={(e) => setWetUitlegEnabled(e.target.checked)}
                        className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-700" />
                        <span className="text-sm font-medium text-emerald-800">Wet & Uitleg (Diepgaand)</span>
                      </div>
                    </label>
                    <p className="text-xs text-emerald-700 mt-1 ml-7">
                      Uitgebreide wetteksten, jurisprudentie en praktijkvoorbeelden voor diepere analyse
                    </p>
                  </div>

                  {/* Wetgeving optie */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wetgevingEnabled}
                        onChange={(e) => setWetgevingEnabled(e.target.checked)}
                        className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-blue-700" />
                        <span className="text-sm font-medium text-blue-800">Wetgeving (Artikelverwijzingen)</span>
                      </div>
                    </label>
                    <p className="text-xs text-blue-700 mt-1 ml-7">
                      Alle wettelijke handelingen worden ondersteund met exacte wetsartikelen en bronverwijzingen
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Main Search - Prominenter gemaakt */}
            <div className="max-w-3xl mx-auto mb-10">
              <div className="bg-white/80 backdrop-blur-sm border border-border/60 rounded-2xl p-4 md:p-6 shadow-medium">
                <h2 className="text-lg font-semibold text-center mb-4 text-foreground">
                  Stel uw juridische vraag
                </h2>
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Stel een juridische vraag of zoek in wetsartikelen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field pl-4 pr-4 md:pr-32 h-14 md:h-16 text-base md:text-lg shadow-medium border-2 focus:border-primary/50"
                    />
                    <Button 
                      type="submit" 
                      size="lg"
                      className="w-full mt-3 md:w-auto md:mt-0 md:absolute md:right-2 md:top-1/2 md:transform md:-translate-y-1/2 h-12 px-6"
                      disabled={!searchQuery.trim()}
                    >
                      Zoeken
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Juridische Voorbeeldvragen - Compacter */}
            <div className="max-w-4xl mx-auto mb-8">
              <h3 className="text-base font-medium mb-3 text-muted-foreground text-center">Juridische voorbeeldvragen:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-4 md:px-0">
                {JURIDISCHE_VRAGEN.map((vraag) => (
                  <button
                    key={vraag}
                    onClick={() => handleQuickSearch(vraag)}
                    className="text-left p-3 bg-white/60 hover:bg-white/80 border border-border/40 rounded-lg transition-all hover:shadow-sm text-sm text-muted-foreground hover:text-foreground"
                  >
                    {vraag}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Stats - Compacter */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {PLATFORM_STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-lg font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Juridische Tools & Zoekfuncties</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Toegang tot officiële Nederlandse juridische bronnen en zoektools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {MAIN_FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <Link key={feature.title} href={feature.href}>
                  <Card className="card-hover h-full p-6">
                    <CardContent className="p-0">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{feature.title}</h3>
                            {feature.badge && (
                              <Badge variant={feature.badgeVariant}>{feature.badge}</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                          <div className="flex items-center text-primary font-medium text-sm mt-3">
                            Proberen
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="section-padding-sm bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-2">Uitgebreide Juridische Database</h2>
            <p className="text-muted-foreground">Toegang tot de meest complete Nederlandse juridische informatie</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto">
            {PLATFORM_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Voor wie is WetHelder geschikt?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Onze platform is ontworpen voor iedereen die betrouwbare juridische informatie nodig heeft
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TARGET_AUDIENCE.map((audience) => {
              const Icon = audience.icon
              return (
                <Card key={audience.title} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{audience.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{audience.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Function Profiles Selection */}
      <section className="section-padding">
        <div className="container-fluid">
          <div className="text-center mb-12">
            <h2 className="text-xl md:text-2xl font-bold mb-3">Kies uw functie voor gepersonaliseerde resultaten</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Selecteer uw profiel om zoekresultaten en uitleg af te stemmen op uw specifieke behoeften en expertise niveau
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {USER_PROFILES.map((profile) => (
              <Card 
                key={profile.value} 
                className={`card-interactive cursor-pointer transition-all duration-200 ${
                  userProfile === profile.value 
                    ? 'ring-2 ring-primary bg-primary/5 border-primary' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setUserProfile(profile.value)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto mb-3 p-3 rounded-xl w-fit transition-colors ${
                    userProfile === profile.value 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    <profile.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-base mb-2">{profile.label}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {profile.description}
                  </CardDescription>
                  {userProfile === profile.value && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-primary">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">Geselecteerd</span>
                    </div>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>

          {userProfile && (
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Profiel geselecteerd: {USER_PROFILES.find(p => p.value === userProfile)?.label}
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  Uw zoekresultaten worden nu afgestemd op uw functie en expertise niveau
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Overview */}
      <section className="section-padding">
        <div className="container-fluid">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Waarom WetHelder?</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Officiële bronnen</h3>
                    <p className="text-muted-foreground">Alle informatie komt direct uit officiële Nederlandse wetgeving en jurisprudentie.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Razendsnelle zoekresultaten</h3>
                    <p className="text-muted-foreground">Vind binnen seconden wat u zoekt in duizenden wetsartikelen en uitspraken.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Altijd actueel</h3>
                    <p className="text-muted-foreground">Automatische updates zorgen ervoor dat u altijd de meest recente wetgeving raadpleegt.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Veilig en betrouwbaar</h3>
                    <p className="text-muted-foreground">Uw zoekopdrachten zijn privé en alle data wordt veilig verwerkt volgens Nederlandse standaarden.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 text-center">
              <div className="space-y-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Scale className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Nederlandse Wetgeving</h3>
                  <p className="text-muted-foreground mb-6">
                    Toegang tot alle Nederlandse wetten, rechtspraak en jurisprudentie op één centrale plek.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Wetboek van Strafrecht</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Burgerlijk Wetboek</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Wegenverkeerswet</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>RVV 1990</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary/5">
        <div className="container-narrow text-center">
          <h2 className="text-3xl font-bold mb-4">Begin met zoeken in Nederlandse wetgeving</h2>
          <p className="text-subtitle mb-8">
            Stel uw eerste juridische vraag en ontdek hoe eenvoudig het is om betrouwbare informatie te vinden
          </p>
          <Button size="lg" asChild>
            <Link href="/ask">
              Start nu
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 section-padding-sm">
        <div className="container-fluid">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Scale className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">WetHelder</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Betrouwbare juridische zoektool voor Nederlandse wetgeving. 
                Officiële bronnen, begrijpelijk voor iedereen.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/ask" className="text-muted-foreground hover:text-foreground transition-colors">Juridische Vragen</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Juridisch</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Algemene Voorwaarden</Link></li>
                <li><Link href="/disclaimer" className="text-muted-foreground hover:text-foreground transition-colors">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 WetHelder. Alle rechten voorbehouden. Nederlandse wetgeving toegankelijk voor iedereen.
            </p>
          </div>
        </div>
      </footer>

      {/* Functieprofiel uitleg modal */}
      {showProfileExplanation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Functieprofiel Uitleg
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProfileExplanation(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Waarom een functieprofiel kiezen?</h4>
                  <p className="text-sm text-blue-800">
                    WetHelder past de antwoorden aan op uw specifieke rol en expertise niveau. 
                    Dit zorgt voor relevantere informatie en de juiste diepgang.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-900 mb-2">🔄 Tip: Switch van profiel!</h4>
                  <p className="text-sm text-amber-800">
                    Voor het beste resultaat kunt u tijdens het gebruik switchen tussen profielen. 
                    Bijvoorbeeld: start als &apos;Algemeen&apos; voor basisuitleg, schakel dan over naar &apos;Advocaat&apos; voor juridische diepgang.
                  </p>
                </div>

                <div className="grid gap-3">
                  <h4 className="font-medium text-gray-900">📋 Overzicht van profielen:</h4>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {USER_PROFILES.map((profile) => {
                      const Icon = profile.icon
                      return (
                        <div key={profile.value} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="font-medium text-sm">{profile.label}</h5>
                            <p className="text-xs text-gray-600">{profile.description}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">🎯 Extra diepgang gewenst?</h4>
                  <p className="text-sm text-green-800 mb-2">
                    Gebruik functieprofiel voor verschillende invalshoeken:
                  </p>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• <strong>Agent:</strong> Praktische handhaving en procedures</li>
                    <li>• <strong>Advocaat:</strong> Juridische strategie en jurisprudentie</li>
                    <li>• <strong>Belastingadviseur:</strong> Fiscale aspecten en gevolgen</li>
                    <li>• <strong>Student:</strong> Theoretische achtergrond en leerdoelen</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setShowProfileExplanation(false)}>
                    Begrepen!
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 