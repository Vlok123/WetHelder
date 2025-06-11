'use client'

import React, { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Lock
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
    title: "Juridische Vragen",
    description: "Stel vragen over Nederlandse wetgeving aan onze juridische assistent",
    icon: BookOpen,
    href: "/ask",
    badge: "Nieuw",
    badgeVariant: "secondary" as const
  },
  {
    title: "RVV & WVW",
    description: "Gespecialiseerde zoekfunctie voor verkeersreglement en wegenverkeerswet",
    icon: Shield,
    href: "/verkeer",
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

// Professional stats
const PLATFORM_STATS = [
  { label: "Feitcodes", value: "2500+" },
  { label: "Wetsartikelen", value: "15.000+" },
  { label: "Professionals", value: "5.000+" },
  { label: "Zoekacties/maand", value: "100.000+" }
]

// Target audience
const TARGET_AUDIENCE = [
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
    title: "BOA & Toezichthouders",
    description: "Gespecialiseerde tools voor buitengewoon opsporingsambtenaren",
    icon: Users
  },
  {
    title: "Rechtenstudenten",
    description: "Studiemateriaal en praktijkvoorbeelden voor juridische opleiding",
    icon: BookOpen
  }
]

export default function HomePage() {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Redirect to appropriate search page based on query
      if (searchQuery.toLowerCase().includes('feit') || searchQuery.toLowerCase().includes('boete') || /^[A-Z]\d+/.test(searchQuery)) {
        window.location.href = `/boetes?q=${encodeURIComponent(searchQuery)}`
      } else {
        window.location.href = `/ask?q=${encodeURIComponent(searchQuery)}`
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
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">
                    Dashboard
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
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
            <Badge variant="secondary" className="mb-6">
              <Star className="h-3 w-3 mr-1" />
              Vertrouwd door 5.000+ rechtsprofessionals
            </Badge>
            
            <h1 className="text-hero mb-6 text-balance">
              Nederlandse wetgeving
              <span className="text-primary block">doorzoeken en begrijpen</span>
            </h1>
            
            <p className="text-subtitle mb-12 text-pretty max-w-2xl mx-auto">
              Professionele juridische zoektool voor feitcodes, boetebedragen en Nederlandse wetgeving. 
              Speciaal ontwikkeld voor politie, juristen, handhavers en rechtsprofessionals.
            </p>

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
              Alles wat u nodig heeft voor professioneel juridisch onderzoek en handhaving
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
            <h2 className="text-3xl font-bold mb-4">Voor professionals in de rechtspraak</h2>
            <p className="text-subtitle max-w-2xl mx-auto">
              WetHelder is speciaal ontwikkeld voor professionals die dagelijks werken met Nederlandse wetgeving
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
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Razendsnelle zoekresultaten</h3>
                    <p className="text-muted-foreground">Vind binnen seconden de juiste feitcode, wetsartikel of jurisprudentie.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Altijd actuele informatie</h3>
                    <p className="text-muted-foreground">Onze database wordt dagelijks bijgewerkt met de laatste wetswijzigingen.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Veilig en betrouwbaar</h3>
                    <p className="text-muted-foreground">Professionele juridische informatie van officiële bronnen.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">24/7 beschikbaar</h3>
                    <p className="text-muted-foreground">Toegang tot juridische informatie wanneer u het nodig heeft.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:text-center">
              <div className="card-elevated p-8">
                <h3 className="text-2xl font-bold mb-4">Start vandaag nog</h3>
                <p className="text-muted-foreground mb-6">
                  Sluit je aan bij duizenden professionals die dagelijks vertrouwen op WetHelder
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
                Professionele juridische zoektool voor Nederlandse wetgeving. 
                Vertrouwd door duizenden rechtsprofessionals.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/boetes" className="text-muted-foreground hover:text-foreground transition-colors">Boetes & Feitcodes</Link></li>
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