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
  User
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

// User profile options
const USER_PROFILES = [
  { value: "algemeen", label: "Algemeen publiek" },
  { value: "juridisch-expert", label: "Juridisch Expert" },
  { value: "jurist", label: "Jurist/Advocaat" },
  { value: "politie", label: "Politie" },
  { value: "boa", label: "BOA/Toezichthouder" },
  { value: "student", label: "Student" },
  { value: "overig", label: "Overig" }
  ]

export default function HomePage() {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [userProfile, setUserProfile] = useState('')
  const [wetUitlegEnabled, setWetUitlegEnabled] = useState(false)

  const handleQuickSearch = (query: string) => {
    // Build profile parameter
    let profileParam = ''
    if (userProfile) {
      const mappedProfile = userProfile === 'algemeen' ? 'algemeen' : 
                           userProfile === 'juridisch-expert' ? 'juridisch-expert' :
                           userProfile === 'jurist' ? 'advocaat' :
                           userProfile === 'politie' ? 'politieagent' :
                           userProfile === 'boa' ? 'politieagent' :
                           userProfile === 'student' ? 'student' : 'algemeen'
      profileParam = `&profile=${encodeURIComponent(mappedProfile)}`
    }
    
    const wetUitlegParam = wetUitlegEnabled ? '&wetuitleg=true' : ''
    
    // Navigate directly without setting input field
    window.location.href = `/ask?q=${encodeURIComponent(query)}${profileParam}${wetUitlegParam}`
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Build profile parameter - map the new profile values
      let profileParam = ''
      if (userProfile) {
        const mappedProfile = userProfile === 'algemeen' ? 'algemeen' : 
                             userProfile === 'juridisch-expert' ? 'juridisch-expert' :
                             userProfile === 'jurist' ? 'advocaat' :
                             userProfile === 'politie' ? 'politieagent' :
                             userProfile === 'boa' ? 'politieagent' :
                             userProfile === 'student' ? 'student' : 'algemeen'
        profileParam = `&profile=${encodeURIComponent(mappedProfile)}`
      }
      
      // Add Wet & Uitleg parameter if enabled
      const wetUitlegParam = wetUitlegEnabled ? '&wetuitleg=true' : ''
      
      // Clear the search input immediately after submission
      setSearchQuery('')
      
      // Use Next.js router for better navigation without auto-search
      window.location.href = `/ask?q=${encodeURIComponent(searchQuery)}${profileParam}${wetUitlegParam}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-1 via-surface-2 to-surface-3">
      {/* Professional Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="container-fluid">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Scale className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">WetHelder</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/ask" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Juridische Vragen
              </Link>
              <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </nav>

            <div className="flex items-center space-x-3">
              {status === 'loading' ? (
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              ) : session ? (
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/chat-history">
                      Geschiedenis
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard">
                      Dashboard
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <Button onClick={() => signIn()} size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  Inloggen
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
              
              {/* Wet & Uitleg Extra Feature */}
              {userProfile && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
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
              )}
            </div>

            {/* Main Search - Prominenter gemaakt */}
            <div className="max-w-3xl mx-auto mb-10">
              <div className="bg-white/80 backdrop-blur-sm border border-border/60 rounded-2xl p-6 shadow-medium">
                <h2 className="text-lg font-semibold text-center mb-4 text-foreground">
                  <Search className="h-5 w-5 inline mr-2 text-primary" />
                  Stel uw juridische vraag
                </h2>
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
                    <Input
                      type="text"
                      placeholder="Stel een juridische vraag of zoek in wetsartikelen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field pl-14 pr-32 h-16 text-lg shadow-medium border-2 focus:border-primary/50"
                    />
                    <Button 
                      type="submit" 
                      size="lg"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-12 px-6"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {JURIDISCHE_VRAGEN.map((vraag) => (
                  <button
                    key={vraag}
                    onClick={() => handleQuickSearch(vraag)}
                    className="text-left p-3 rounded-lg bg-muted/40 hover:bg-muted/70 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border/30 hover:border-border/60"
                  >
                    <BookOpen className="h-3 w-3 inline mr-2 text-primary" />
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

      {/* Main Features */}
      <section className="section-padding">
        <div className="container-fluid">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Krachtige juridische tools</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Alles wat u nodig heeft voor betrouwbaar juridisch onderzoek met officiële bronnen
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {MAIN_FEATURES.map((feature) => (
              <Link key={feature.title} href={feature.href}>
                <Card className="card-interactive h-full hover-lift">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 p-3 rounded-xl bg-primary/10 w-fit">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      {feature.badge && (
                        <Badge variant={feature.badgeVariant}>{feature.badge}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="section-padding bg-muted/30">
        <div className="container-fluid">
          <div className="text-center mb-12">
            <h2 className="text-xl md:text-2xl font-bold mb-3">Voor iedereen die betrouwbare juridische informatie zoekt</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              WetHelder is ontwikkeld voor burgers, professionals en studenten die toegang willen tot officiële Nederlandse wetgeving
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TARGET_AUDIENCE.map((audience) => (
              <Card key={audience.title} className="card-elevated text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 rounded-xl bg-accent/10 w-fit">
                    <audience.icon className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">{audience.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {audience.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
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
    </div>
  )
} 