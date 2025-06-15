'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

import { 
  Scale, 
  MessageSquare, 
  Search, 
  BookOpen, 
  Users, 
  Shield, 
  GraduationCap, 
  Briefcase,
  ArrowRight,
  Star,
  Zap,
  Globe,
  Lock,
  Clock,
  CheckCircle2,
  Check
} from 'lucide-react'

const professionProfiles = [
  {
    id: 'algemeen',
    name: 'Burger/Algemeen',
    description: 'Voor alle burgers met juridische vragen',
    icon: Users,
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    id: 'advocaat',
    name: 'Advocaat/Jurist',
    description: 'Juridische professionals',
    icon: Scale,
    color: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    id: 'politieagent',
    name: 'Politieagent',
    description: 'Handhaving en strafrecht',
    icon: Shield,
    color: 'bg-green-50 text-green-700 border-green-200'
  },
  {
    id: 'boa',
    name: 'BOA/Handhaver',
    description: 'Buitengewoon opsporingsambtenaar',
    icon: Shield,
    color: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  {
    id: 'student',
    name: 'Student',
    description: 'Rechtenstudenten en onderzoek',
    icon: GraduationCap,
    color: 'bg-pink-50 text-pink-700 border-pink-200'
  },
  {
    id: 'gemeentejurist',
    name: 'Gemeentejurist',
    description: 'Bestuursrecht en lokale verordeningen',
    icon: Briefcase,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  {
    id: 'beveiliger',
    name: 'Beveiliger',
    description: 'Private beveiliging en toezicht',
    icon: Shield,
    color: 'bg-red-50 text-red-700 border-red-200'
  },
  {
    id: 'zorgprofessional',
    name: 'Zorgprofessional',
    description: 'Gezondheidszorg en psychiatrie',
    icon: Users,
    color: 'bg-teal-50 text-teal-700 border-teal-200'
  }
]

const features = [
  {
    icon: MessageSquare,
    title: 'Juridische Chat',
    description: 'Stel juridische vragen en krijg direct professionele antwoorden gebaseerd op Nederlandse wetgeving.',
    href: '/ask'
  },
  {
    icon: Search,
    title: 'Wetgeving Zoeken',
    description: 'Doorzoek 15.000+ wetsartikelen, rechtspraak en jurisprudentie met geavanceerde zoekfuncties.',
    href: '/search'
  },
  {
    icon: BookOpen,
    title: 'Wet & Uitleg',
    description: 'Krijg uitgebreide uitleg bij complexe wetsartikelen met praktische voorbeelden.',
    href: '/uitleg'
  },
  {
    icon: Scale,
    title: 'Rechtspraak Database',
    description: 'Toegang tot uitspraken van Nederlandse rechtbanken en gerechtshoven.',
    href: '/rechtspraak'
  }
]

const stats = [
  { number: '56+', label: 'Officiële bronnen' },
  { number: '22', label: 'Beroepsprofielen' },
  { number: '8', label: 'Hoofddoelgroepen' },
  { number: '24/7', label: 'Beschikbaar' }
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSearch = async () => {
    if (!searchQuery.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    
    // Store query in sessionStorage
    const query = searchQuery.trim()
    sessionStorage.setItem('autoSubmitQuery', query)
    
    // Navigate to /ask with query parameters
    const params = new URLSearchParams({
      q: query
    })
    
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
                Intelligente Juridische Assistent • Nederlandse Wetgeving
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="text-blue-600">WetHelder</span>
              <br />
              <span className="text-3xl md:text-5xl">Nederlandse Juridische Assistent</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Krijg direct antwoord op juridische vragen, doorzoek Nederlandse wetgeving en 
              ontvang professionele uitleg. Voor burgers, juristen, handhaving en studenten.
            </p>

            {/* Quick Search */}
            <Card className="max-w-2xl mx-auto mb-8 shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Stel uw juridische vraag..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 text-base"
                      disabled={isSubmitting}
                    />
                    <Button 
                      size="lg" 
                      onClick={handleSearch}
                      disabled={!searchQuery.trim() || isSubmitting}
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      {isSubmitting ? 'Bezig...' : 'Vraag stellen'}
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-600 text-center">
                    💡 <strong>Tip:</strong> In het chatvenster kun je je functieprofiel instellen voor een beter antwoord op maat
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

      {/* Profession Profiles */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kies Uw Profiel</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Selecteer uw beroep voor aangepaste juridische antwoorden. Klik op een profiel om direct te beginnen met chatten.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {professionProfiles.map((profile) => {
              const IconComponent = profile.icon
              return (
                <Card 
                  key={profile.id} 
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-105"
                  onClick={() => handleProfileSelect(profile.id)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${profile.color} group-hover:scale-110 transition-transform`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {profile.name}
                        </CardTitle>
                        <CardDescription>{profile.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" size="sm" className="w-full justify-between group-hover:bg-blue-50 group-hover:text-blue-600">
                      Start chat met dit profiel
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Krachtige Functies</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Alles wat u nodig heeft voor juridische research en advies in één platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-200 group">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link href={feature.href}>
                        Proberen
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
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
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Lock className="h-4 w-4" />
                  <span>Gratis te gebruiken • Geen registratie vereist</span>
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
            Krijg direct antwoord op uw juridische vragen met WetHelder's intelligente assistent.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/ask">
                <MessageSquare className="h-5 w-5 mr-2" />
                Start Gratis Chat
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent" asChild>
              <Link href="/auth/signin">
                Account Aanmaken
              </Link>
            </Button>
          </div>
          
          <div className="mt-6 text-sm opacity-75">
            Geen creditcard vereist • Direct beginnen
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">WetHelder</span>
              </div>
              <p className="text-gray-400 text-sm">
                Nederlandse juridische assistent voor iedereen. Betrouwbare juridische informatie op basis van officiële bronnen.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/ask" className="hover:text-white transition-colors">Juridische Chat</Link></li>
                <li><Link href="/search" className="hover:text-white transition-colors">Wetgeving Zoeken</Link></li>
                <li><Link href="/uitleg" className="hover:text-white transition-colors">Wet & Uitleg</Link></li>
                <li><Link href="/rechtspraak" className="hover:text-white transition-colors">Rechtspraak</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Doelgroepen</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/ask?profile=algemeen" className="hover:text-white transition-colors">Burgers</Link></li>
                <li><Link href="/ask?profile=advocaat" className="hover:text-white transition-colors">Juristen</Link></li>
                <li><Link href="/ask?profile=politieagent" className="hover:text-white transition-colors">Handhaving</Link></li>
                <li><Link href="/ask?profile=student" className="hover:text-white transition-colors">Studenten</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Ondersteuning</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Voorwaarden</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 WetHelder. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 