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

// Professional feature cards
const MAIN_FEATURES = [
  {
    title: "Boetes & Feitcodes",
    description: "Doorzoek Nederlandse feitcodes, boetebedragen en verkeersovertredingen",
    icon: Gavel,
    href: "/boetes",
    badge: "Populair",
    badgeVariant: "default" as const
  },
  {
    title: "Wet & Uitleg",
    description: "Officiële wetteksten uit RVV 1990, WVW 1994 en het Wetboek van Strafrecht",
    icon: FileText,
    href: "/boetes?mode=wet",
    badge: "Officieel",
    badgeVariant: "secondary" as const
  },
  {
    title: "Juridische Vragen",
    description: "Stel vragen over Nederlandse wetgeving aan onze juridische assistent",
    icon: BookOpen,
    href: "/ask",
    badge: null,
    badgeVariant: null
  }
]

// Quick search suggestions
const QUICK_SEARCHES = [
  "Donkere ramen auto",
  "N420 feitcode", 
  "Snelheidsovertredingen",
  "Artikel 5 WVW",
  "Parkeerboetes",
  "RVV 1990 teksten"
]

// Platform stats - Real and achievable numbers
const PLATFORM_STATS = [
  { label: "Feitcodes", value: "2.500+" },
  { label: "Wetsartikelen", value: "15.000+" },
  { label: "Wetboeken", value: "25+" },
  { label: "Actualiteit", value: "100%" }
]

// Target audience - including citizens
const TARGET_AUDIENCE = [
  {
    title: "Burgers & Particulieren",
    description: "Begrijpelijke uitleg van wetten en boetes voor iedere Nederlandse burger",
    icon: Users
  },
  {
    title: "Politie & Handhaving", 
    description: "Snel toegang tot feitcodes en boetebedragen tijdens handhaving",
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
  { value: "burger", label: "Burger/Particulier" },
  { value: "politie", label: "Politie" },
  { value: "jurist", label: "Jurist/Advocaat" },
  { value: "boa", label: "BOA/Toezichthouder" },
  { value: "student", label: "Student" },
  { value: "overig", label: "Overig" }
]

export default function HomePage() {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [userProfile, setUserProfile] = useState('')

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Build profile parameter
      const profileParam = userProfile ? `&profile=${encodeURIComponent(userProfile)}` : ''
      
      // Determine search type and redirect with search execution
      if (searchQuery.toLowerCase().includes('feit') || 
          searchQuery.toLowerCase().includes('boete') || 
          /^[A-Z]\d+/.test(searchQuery)) {
        // Direct redirect to boetes with query and auto-search
        window.location.href = `/boetes?q=${encodeURIComponent(searchQuery)}&search=true${profileParam}`
      } else if (searchQuery.toLowerCase().includes('artikel') ||
                 searchQuery.toLowerCase().includes('rvv') ||
                 searchQuery.toLowerCase().includes('wvw') ||
                 searchQuery.toLowerCase().includes('wet')) {
        // Direct redirect to wet mode with query and auto-search
        window.location.href = `/boetes?mode=wet&q=${encodeURIComponent(searchQuery)}&search=true${profileParam}`
      } else {
        // Direct redirect to ask with query and auto-search
        window.location.href = `/ask?q=${encodeURIComponent(searchQuery)}&search=true${profileParam}`
      }
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
              <Link href="/boetes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Boetes & Feitcodes
              </Link>
              <Link href="/boetes?mode=wet" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Wet & Uitleg
              </Link>
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
            
            <h1 className="text-hero mb-6 text-balance">
              Nederlandse wetgeving
              <span className="text-primary block">doorzoeken en begrijpen</span>
            </h1>
            
            <p className="text-subtitle mb-6 text-pretty max-w-2xl mx-auto">
              Betrouwbare juridische zoektool voor iedereen die officiële informatie zoekt over Nederlandse wetgeving.
              Speciaal ontwikkeld voor mensen die enkel en alleen informatie willen met officiële bronnen.
            </p>

            {/* Beta Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-3xl mx-auto mb-12">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">⚠️ BETA-versie in ontwikkeling</p>
                  <p>Deze applicatie is nog in ontwikkeling. AI-antwoorden kunnen fouten bevatten. Controleer belangrijke informatie altijd via officiële bronnen of raadpleeg een juridisch expert wanneer noodzakelijk.</p>
                </div>
              </div>
            </div>

            {/* User Profile Selection */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex items-center gap-3 mb-2">
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
            </div>

            {/* Main Search */}
            <div className="max-w-2xl mx-auto mb-8">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Zoek feitcodes, wetsartikelen, of stel een juridische vraag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-12 pr-32 h-14 text-lg shadow-medium"
                  />
                  <Button 
                    type="submit" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10"
                    disabled={!searchQuery.trim()}
                  >
                    Zoeken
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </form>
            </div>

            {/* Quick Search Tags */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              <span className="text-sm text-muted-foreground mr-2">Populaire zoekopdrachten:</span>
              {QUICK_SEARCHES.map((query) => (
                <button
                  key={query}
                  onClick={() => handleQuickSearch(query)}
                  className="text-sm px-3 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {PLATFORM_STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="section-padding">
        <div className="container-fluid">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Krachtige juridische tools</h2>
            <p className="text-subtitle max-w-2xl mx-auto">
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
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Voor iedereen die betrouwbare juridische informatie zoekt</h2>
            <p className="text-subtitle max-w-2xl mx-auto">
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
                    <p className="text-muted-foreground">Vind binnen seconden de juiste feitcode, wetsartikel of jurisprudentie.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Altijd actuele informatie</h3>
                    <p className="text-muted-foreground">Onze database wordt regelmatig bijgewerkt met de laatste wetswijzigingen.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Voor iedereen toegankelijk</h3>
                    <p className="text-muted-foreground">Complexe juridische informatie begrijpelijk gemaakt voor burgers en professionals.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:text-center">
              <div className="card-elevated p-8">
                <h3 className="text-2xl font-bold mb-4">Start vandaag nog</h3>
                <p className="text-muted-foreground mb-6">
                  Krijg direct toegang tot betrouwbare juridische informatie
                </p>
                {session ? (
                  <Button asChild size="lg" className="w-full">
                    <Link href="/dashboard">
                      Ga naar Dashboard
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                ) : (
                  <Button onClick={() => signIn()} size="lg" className="w-full">
                    <LogIn className="h-4 w-4 mr-2" />
                    Gratis Account Aanmaken
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
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
                <li><Link href="/boetes" className="text-muted-foreground hover:text-foreground transition-colors">Boetes & Feitcodes</Link></li>
                <li><Link href="/boetes?mode=wet" className="text-muted-foreground hover:text-foreground transition-colors">Wet & Uitleg</Link></li>
                <li><Link href="/ask" className="text-muted-foreground hover:text-foreground transition-colors">Juridische Vragen</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="/disclaimer" className="text-muted-foreground hover:text-foreground transition-colors">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 WetHelder. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 