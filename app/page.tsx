'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// Select component replaced with native HTML select for better compatibility
import { Navigation } from '@/components/navigation'
import { 
  Scale, 
  MessageSquare, 
  BookOpen, 
  Shield,
  Users,
  Gavel,
  FileText,
  Search,
  Send,
  Clock,
  AlertTriangle,
  User,
  Crown,
  Gift,
  Star,
  CheckCircle,
  Bot
} from 'lucide-react'

interface Message {
  id: string
  question: string
  answer: string
  sources: string[]
  profession: string
  isLoading?: boolean
}

// Available professions with their specific contexts
const PROFESSIONS = [
  { value: 'algemeen', label: 'Algemeen publiek', icon: '👤', description: 'Begrijpelijke uitleg voor iedereen' },
  { value: 'advocaat', label: 'Advocaat/Jurist', icon: '⚖️', description: 'Juridische precisie en jurisprudentie' },
  { value: 'politieagent', label: 'Politieagent', icon: '👮', description: 'Praktische handhaving en procedures' },
  { value: 'boa', label: 'BOA (Buitengewoon Opsporingsambtenaar)', icon: '🚔', description: 'APV-handhaving en specifieke BOA-bevoegdheden' },
  { value: 'beveiliger', label: 'Beveiliger', icon: '🛡️', description: 'Beveiligingsprotocollen en private handhaving' },
  { value: 'aspirant', label: 'Aspirant (Politie/Justitie)', icon: '👮‍♂️', description: 'Uitgebreide uitleg met praktijkvoorbeelden' },
  { value: 'student', label: 'Student (Rechten/Criminologie)', icon: '🎓', description: 'Theoretische achtergrond en bronnen' },
  { value: 'rechter', label: 'Rechter/Magistraat', icon: '⚖️', description: 'Jurisprudentie en rechterlijke besluitvorming' },
  { value: 'officier', label: 'Officier van Justitie', icon: '🏛️', description: 'Vervolging en strafvordering' },
  { value: 'notaris', label: 'Notaris', icon: '📋', description: 'Notarieel recht en authentieke akten' },
  { value: 'deurwaarder', label: 'Gerechtsdeurwaarder', icon: '📑', description: 'Executie en betekening' },
  { value: 'belastingadviseur', label: 'Belastingadviseur', icon: '💰', description: 'Fiscaal recht en belastingwetgeving' },
  { value: 'gemeenteambtenaar', label: 'Gemeenteambtenaar', icon: '🏛️', description: 'Bestuursrecht en lokale regelgeving' },
  { value: 'verzekeringsexpert', label: 'Verzekeringsexpert', icon: '🛡️', description: 'Verzekeringsrecht en claimbeoordeling' },
  { value: 'hrprofessional', label: 'HR Professional', icon: '👥', description: 'Arbeidsrecht en personeelsbeleid' }
]

// Markdown-like text parser for better formatting
const formatText = (text: string) => {
  if (!text) return null
  
  // Split text by lines and process each
  const lines = text.split('\n')
  const elements = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (!line) {
      elements.push(<br key={i} />)
      continue
    }
    
    // Headers (## or ###)
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="text-lg font-semibold mt-6 mb-3 text-primary">
          {line.replace('### ', '')}
        </h4>
      )
    } else if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="text-xl font-semibold mt-6 mb-4 text-primary">
          {line.replace('## ', '')}
        </h3>
      )
    }
    // Bold text (**text**)
    else if (line.includes('**')) {
      const parts = line.split('**')
      const formatted = parts.map((part, idx) => 
        idx % 2 === 1 ? <strong key={idx} className="font-semibold text-foreground">{part}</strong> : part
      )
      elements.push(<p key={i} className="mb-2">{formatted}</p>)
    }
    // Links (detect URLs)
    else if (line.includes('http')) {
      const urlRegex = /(https?:\/\/[^\s]+)/g
      const parts = line.split(urlRegex)
      const formatted = parts.map((part, idx) => 
        urlRegex.test(part) 
          ? <a key={idx} href={part} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{part}</a>
          : part
      )
      elements.push(<p key={i} className="mb-2">{formatted}</p>)
    }
    // List items (starting with -)
    else if (line.startsWith('- ')) {
      elements.push(
        <li key={i} className="ml-4 mb-1">
          {line.replace('- ', '')}
        </li>
      )
    }
    // Regular paragraphs
    else {
      elements.push(<p key={i} className="mb-2">{line}</p>)
    }
  }
  
  return <div className="prose prose-sm max-w-none text-foreground">{elements}</div>
}

export default function HomePage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProfession, setSelectedProfession] = useState('algemeen')
  const [userStats, setUserStats] = useState<{ remainingToday: number; role: string } | null>(null)

  useEffect(() => {
    if (session) {
      fetch('/api/user/stats')
        .then(res => res.json())
        .then(data => setUserStats(data))
        .catch(err => console.error('Error fetching user stats:', err))
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const questionId = crypto.randomUUID()
    const newMessage: Message = {
      id: questionId,
      question: input.trim(),
      answer: '',
      sources: [],
      profession: selectedProfession,
      isLoading: true,
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input.trim(), profession: selectedProfession }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json()
          setMessages(prev =>
            prev.map(msg =>
              msg.id === questionId
                ? { ...msg, answer: errorData.message || 'Dagelijkse limiet bereikt', isLoading: false }
                : msg
            )
          )
          return
        }
        throw new Error('Network response was not ok')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader available')

      let accumulatedAnswer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                accumulatedAnswer += parsed.content
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === questionId
                      ? { 
                          ...msg, 
                          answer: accumulatedAnswer, 
                        }
                      : msg
                  )
                )
              }
              if (parsed.sources) {
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === questionId
                      ? { ...msg, sources: parsed.sources }
                      : msg
                  )
                )
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev =>
        prev.map(msg =>
          msg.id === questionId
            ? { ...msg, answer: 'Er is een fout opgetreden. Probeer opnieuw.', isLoading: false }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
      setMessages(prev =>
        prev.map(msg =>
          msg.id === questionId ? { ...msg, isLoading: false } : msg
        )
      )
      
      // Update user stats after successful question
      if (session) {
        fetch('/api/user/stats')
          .then(res => res.json())
          .then(data => setUserStats(data))
          .catch(err => console.error('Error fetching user stats:', err))
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <Scale className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent px-2">
              WetHelder
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
              Uw intelligente juridische assistent voor helder inzicht in Nederlandse wetgeving
            </p>

            {/* Account CTA for anonymous users */}
            {!session && (
              <Card className="max-w-lg mx-auto mb-6 sm:mb-8 border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50 mx-4 sm:mx-auto">
                <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                    </div>
                    <h3 className="font-bold text-base sm:text-lg mb-2 text-green-900">Tijdelijk Gratis Account!</h3>
                    <p className="text-sm text-green-700 mb-4">
                      Zonder account: <strong>3 vragen per dag</strong><br/>
                      Met gratis account: <strong>Onbeperkt vragen</strong> 🎉
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button asChild className="bg-green-600 hover:bg-green-700 h-10 sm:h-9">
                        <Link href="/auth/signup">
                          <Star className="h-4 w-4 mr-2" />
                          Account Aanmaken
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="h-10 sm:h-9">
                        <Link href="/auth/signin">Inloggen</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Usage Status */}
          {session && userStats && (
            <Card className="mb-4 sm:mb-6 border-2 mx-4 sm:mx-0">
              <CardContent className="pt-3 sm:pt-4 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {userStats.role === 'PREMIUM' ? (
                      <>
                        <Crown className="h-5 w-5 text-amber-500 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-amber-700 text-sm sm:text-base">Premium Account</p>
                          <p className="text-xs sm:text-sm text-amber-600">Onbeperkt gebruik - Geen limieten!</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-green-700 text-sm sm:text-base">Gratis Account</p>
                          <p className="text-xs sm:text-sm text-green-600">Tijdelijk onbeperkt gebruik 🎉</p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs sm:text-sm text-muted-foreground">Welkom terug!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!session && (
            <Card className="mb-4 sm:mb-6 border-amber-200 bg-amber-50 mx-4 sm:mx-0">
              <CardContent className="pt-3 sm:pt-4 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-800 text-sm sm:text-base">Anonieme Toegang</p>
                      <p className="text-xs sm:text-sm text-amber-700">Maximaal 3 vragen per dag</p>
                    </div>
                  </div>
                  <Button size="sm" asChild className="bg-amber-600 hover:bg-amber-700 h-9 w-full sm:w-auto">
                    <Link href="/auth/signup">
                      Gratis Account
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conversation Area - Only show if there are messages */}
          {messages.length > 0 && (
            <div className="mb-6 sm:mb-8 mx-4 sm:mx-0">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
                Gesprek
              </h2>
              <div className="space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                {messages.map((message, index) => (
                  <Card key={message.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-3 sm:pt-4 px-4 sm:px-6">
                      <div className="space-y-3">
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h4 className="font-semibold text-primary text-sm sm:text-base">Vraag {index + 1}:</h4>
                            <Badge variant="secondary" className="text-xs self-start sm:self-center">
                              {PROFESSIONS.find(p => p.value === message.profession)?.icon} {PROFESSIONS.find(p => p.value === message.profession)?.label}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground italic text-sm sm:text-base">{message.question}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Bot className="h-4 w-4 text-primary" />
                            <h4 className="font-semibold text-primary text-sm sm:text-base">WetHelder:</h4>
                          </div>
                          {message.isLoading ? (
                            <div className="bg-muted/30 p-3 rounded-md">
                              <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                </div>
                                <span className="text-xs sm:text-sm text-muted-foreground italic">WetHelder denkt na...</span>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-muted/30 p-3 rounded-md text-sm sm:text-base border-l-4 border-l-primary">
                              {formatText(message.answer)}
                            </div>
                          )}
                        </div>
                        
                        {message.sources.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Bronnen:</h4>
                            <div className="grid gap-1">
                              {message.sources.map((source, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <FileText className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                                  <a 
                                    href={source} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline break-all"
                                  >
                                    {source}
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Question Input Area */}
          <Card className="mb-6 sm:mb-8 mx-4 sm:mx-0">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                {messages.length > 0 ? 'Volgende vraag stellen' : 'Stel uw juridische vraag'}
              </CardTitle>
              <CardDescription className="text-sm">
                {messages.length > 0 
                  ? 'U kunt doorvragen over het bovenstaande antwoord of een nieuwe vraag stellen'
                  : 'Krijg direct toegang tot relevante wetsartikelen en jurisprudentie'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Uw functie:</span>
                </div>
                <select 
                  value={selectedProfession} 
                  onChange={(e) => setSelectedProfession(e.target.value)}
                  className="flex h-11 sm:h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {PROFESSIONS.map((profession) => (
                    <option key={profession.value} value={profession.value}>
                      {profession.icon} {profession.label}
                    </option>
                  ))}
                </select>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={messages.length > 0 
                    ? "Bijvoorbeeld: Kun je dit verder uitleggen?"
                    : "Bijvoorbeeld: Wat zijn de regels voor opzegging van een arbeidscontract?"
                  }
                  className="flex-1 h-11 sm:h-10 text-base sm:text-sm"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="h-11 sm:h-10 w-full sm:w-auto"
                >
                  <Send className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Versturen</span>
                </Button>
              </form>

              {isLoading && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-blue-600" />
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-blue-900 text-sm sm:text-base mb-1">
                        WetHelder analyseert je vraag...
                      </p>
                      <p className="text-xs sm:text-sm text-blue-700 mb-2">
                        🔍 Zoeken in Nederlandse wetgeving<br/>
                        ⚖️ Controleren jurisprudentie<br/>
                        📝 Samenstellen antwoord
                      </p>
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Clock className="h-3 w-3" />
                        <span>Gemiddeld 10-20 seconden</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features Grid - Only show when no conversation */}
          {messages.length === 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 mx-4 sm:mx-0">
                <Card className="text-center">
                  <CardHeader className="px-4 sm:px-6">
                    <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                    <CardTitle className="text-lg sm:text-xl">Nederlandse Wetgeving</CardTitle>
                    <CardDescription className="text-sm">
                      Toegang tot alle officiele Nederlandse wetten via wetten.overheid.nl
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="text-center">
                  <CardHeader className="px-4 sm:px-6">
                    <Gavel className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                    <CardTitle className="text-lg sm:text-xl">Jurisprudentie</CardTitle>
                    <CardDescription className="text-sm">
                      Rechtspraak van Nederlandse rechtbanken via rechtspraak.nl
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="text-center">
                  <CardHeader className="px-4 sm:px-6">
                    <Search className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                    <CardTitle className="text-lg sm:text-xl">AI-Zoekfunctie</CardTitle>
                    <CardDescription className="text-sm">
                      Intelligente zoekfunctie die relevante artikelen vindt
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              {/* Rechtsgebieden */}
              <div className="mb-8 sm:mb-12 mx-4 sm:mx-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Rechtsgebieden</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Card className="p-3 sm:p-4 text-center hover:shadow-md transition-shadow">
                    <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Strafrecht</h3>
                    <Badge variant="secondary" className="text-xs">Wetboek van Strafrecht</Badge>
                  </Card>
                  
                  <Card className="p-3 sm:p-4 text-center hover:shadow-md transition-shadow">
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Burgerlijk Recht</h3>
                    <Badge variant="secondary" className="text-xs">BW Boek 3 & 6</Badge>
                  </Card>
                  
                  <Card className="p-3 sm:p-4 text-center hover:shadow-md transition-shadow">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Arbeidsrecht</h3>
                    <Badge variant="secondary" className="text-xs">Arbeidsomstandighedenwet</Badge>
                  </Card>
                  
                  <Card className="p-3 sm:p-4 text-center hover:shadow-md transition-shadow">
                    <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Bestuursrecht</h3>
                    <Badge variant="secondary" className="text-xs">Algemene wet bestuursrecht</Badge>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
} 