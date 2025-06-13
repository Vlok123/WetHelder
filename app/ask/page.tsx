'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/navigation'
import { 
  Send, 
  MessageSquare, 
  Bot, 
  User, 
  FileText, 
  Shield,
  Scale,
  UserCheck,
  GraduationCap,
  Info,
  ChevronDown,
  Settings,
  BookOpen,
  Gavel,
  Briefcase,
  Building,
  MapPin,
  Calculator,
  Home,
  Users,
  CheckCircle,
  Heart,
  Quote,
  History,
  Loader2,
  Trash2,
  RefreshCw,
  Clock,
  RotateCcw,
  PanelRight
} from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FavoriteButton } from '@/components/favorite-button'
import { CitationGenerator } from '@/components/citation-generator'
import { SearchHistory } from '@/components/search-history'
import { Favorites } from '@/components/favorites'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  question: string
  answer: string
  sources: string[]
  isLoading?: boolean
  profession?: string
  timestamp: Date
  queryId?: string
}

type Profession = 'aspirant' | 'student' | 'politieagent' | 'advocaat' | 'algemeen' | 'boa' | 'rechter' | 'notaris' | 'deurwaarder' | 'bedrijfsjurist' | 'gemeenteambtenaar' | 'belastingadviseur' | 'accountant' | 'makelaar' | 'verzekeringsagent' | 'hr-medewerker' | 'compliance-officer' | 'veiligheidsbeambte' | 'beveiliger'

const professionConfig = {
  algemeen: {
    icon: Info,
    label: 'Algemeen',
    color: 'text-gray-700 bg-gray-50 border-gray-200',
    description: 'Begrijpelijke uitleg in toegankelijke taal'
  },
  advocaat: {
    icon: Scale,
    label: 'Advocaat',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    description: 'Juridische feiten en jurisprudentie'
  },
  politieagent: {
    icon: Shield,
    label: 'Politieagent',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    description: 'Praktische kernpunten voor handhaving'
  },
  boa: {
    icon: Shield,
    label: 'BOA',
    color: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    description: 'Handhaving binnen bevoegdheden'
  },
  rechter: {
    icon: Gavel,
    label: 'Rechter',
    color: 'text-red-700 bg-red-50 border-red-200',
    description: 'Procesrecht en jurisprudentie'
  },
  notaris: {
    icon: FileText,
    label: 'Notaris',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    description: 'Burgerlijk recht en notariële praktijk'
  },
  deurwaarder: {
    icon: FileText,
    label: 'Deurwaarder',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    description: 'Executierecht en beslagprocedures'
  },
  bedrijfsjurist: {
    icon: Building,
    label: 'Bedrijfsjurist',
    color: 'text-slate-700 bg-slate-50 border-slate-200',
    description: 'Ondernemingsrecht en compliance'
  },
  gemeenteambtenaar: {
    icon: MapPin,
    label: 'Gemeenteambtenaar',
    color: 'text-green-700 bg-green-50 border-green-200',
    description: 'Bestuursrecht en lokale verordeningen'
  },
  belastingadviseur: {
    icon: Calculator,
    label: 'Belastingadviseur',
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    description: 'Fiscaal recht en belastingwetgeving'
  },
  accountant: {
    icon: Calculator,
    label: 'Accountant',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    description: 'Financieel recht en verslaggeving'
  },
  makelaar: {
    icon: Home,
    label: 'Makelaar',
    color: 'text-teal-700 bg-teal-50 border-teal-200',
    description: 'Vastgoedrecht en makelaarsrecht'
  },
  verzekeringsagent: {
    icon: Shield,
    label: 'Verzekeringsagent',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    description: 'Verzekeringsrecht en aansprakelijkheid'
  },
  'hr-medewerker': {
    icon: Users,
    label: 'HR-medewerker',
    color: 'text-pink-700 bg-pink-50 border-pink-200',
    description: 'Arbeidsrecht en personeelsbeleid'
  },
  'compliance-officer': {
    icon: CheckCircle,
    label: 'Compliance Officer',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    description: 'Toezichtrecht en compliance'
  },
  veiligheidsbeambte: {
    icon: Shield,
    label: 'Veiligheidsbeambte',
    color: 'text-red-700 bg-red-50 border-red-200',
    description: 'Veiligheidsrecht en preventie'
  },
  beveiliger: {
    icon: Shield,
    label: '(Bedrijfs)beveiliger',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    description: 'Beveiligingsrecht en private beveiliging'
  },
  aspirant: {
    icon: UserCheck,
    label: 'Aspirant',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    description: 'Uitgebreide uitleg met praktijkvoorbeelden'
  },
  student: {
    icon: GraduationCap,
    label: 'Student',
    color: 'text-green-700 bg-green-50 border-green-200',
    description: 'Educatieve uitleg met leerdoelen'
  }
}

const formatText = (text: string) => {
  if (!text) return null
  
  // Enhanced text preprocessing for better formatting
  const processedText = text
    // Convert quoted text to blockquotes for citations
    .replace(/"([^"]+)"/g, (match, citation) => `> ${citation}`)
    // Enhance bold text patterns - detect common Dutch legal terms and important concepts
    .replace(/\b(Artikel \d+[a-z]?)\b/g, '**$1**')
    .replace(/\b(Wet op de|Wetboek van|Burgerlijk Wetboek|Strafwetboek|Grondwet)\b/gi, '**$1**')
    .replace(/\b(Conclusie|Belangrijk|Let op|Samenvatting|Kernpunten?|Hoofdpunten?)\s*:/gi, '**$1:**')
    .replace(/\b(Voorwaarden?|Gevolgen?|Rechten?|Plichten?|Procedures?)\s*:/gi, '**$1:**')
    // Enhance section headers
    .replace(/^([A-Z][^.!?]*):$/gm, '### $1')
    .replace(/^(\d+\.\s+[A-Z][^.!?]*):?$/gm, '### $1')
    // Format numbered lists better
    .replace(/^(\d+\.\s+)/gm, '**$1**')
    // Format bullet points
    .replace(/^[-•]\s+/gm, '- ')
  
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mb-6 text-slate-900 border-b-2 border-blue-200 pb-3 mt-8 first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold mb-5 text-slate-800 mt-8 first:mt-0 border-l-4 border-blue-400 pl-4 bg-blue-50 py-2 rounded-r">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold mb-4 text-slate-800 mt-6 first:mt-0 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-base font-semibold mb-3 text-slate-700 mt-5 first:mt-0">
            {children}
          </h4>
        ),
        p: ({ children }) => (
          <p className="mb-4 text-slate-700 leading-relaxed text-base">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="list-none mb-6 space-y-3 text-slate-700">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-6 space-y-3 text-slate-700 ml-2">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-slate-700 leading-relaxed flex items-start">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
            <span className="flex-1">{children}</span>
          </li>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-slate-900">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic text-slate-800 font-medium bg-slate-50 px-1 rounded">
            {children}
          </em>
        ),
        blockquote: ({ children }) => (
          <div className="my-6 border-l-4 border-blue-400 bg-gradient-to-r from-blue-50 to-blue-25 rounded-r-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="pl-6 pr-4 py-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <Quote className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-blue-800 mb-2 uppercase tracking-wide">Citaat uit officiële bron</div>
                  <div className="text-slate-700 italic leading-relaxed font-medium">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
        code: ({ children }) => (
          <code className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-sm font-mono border border-slate-300 shadow-sm">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="bg-slate-100 p-4 rounded-lg mb-6 overflow-x-auto border border-slate-200 shadow-sm">
            <code className="text-sm font-mono text-slate-800">{children}</code>
          </pre>
        ),
        a: ({ href, children }) => (
          <a 
            href={href} 
            className="text-blue-600 hover:text-blue-800 underline decoration-2 underline-offset-2 transition-colors font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-6 shadow-md rounded-lg border border-slate-200">
            <table className="min-w-full">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-slate-100 border-b-2 border-slate-300">
            {children}
          </thead>
        ),
        tbody: ({ children }) => <tbody className="bg-white">{children}</tbody>,
        tr: ({ children }) => (
          <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th className="px-6 py-4 text-left font-bold text-slate-900 border-r border-slate-200 last:border-r-0">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-6 py-4 text-slate-700 border-r border-slate-100 last:border-r-0 leading-relaxed">
            {children}
          </td>
        )
      }}
    >
      {processedText}
    </ReactMarkdown>
  )
}

const mapProfileToProfession = (profile: string): Profession => {
  const mapping: Record<string, Profession> = {
    'juridisch-expert': 'advocaat',
    'handhaving': 'politieagent',
    'student': 'student',
    'algemeen': 'algemeen',
    'jurist': 'advocaat',
    'politie': 'politieagent',
    'boa': 'boa',
    'overig': 'algemeen',
    // Nieuwe professies - directe mapping
    'advocaat': 'advocaat',
    'politieagent': 'politieagent',
    'rechter': 'rechter',
    'notaris': 'notaris',
    'deurwaarder': 'deurwaarder',
    'bedrijfsjurist': 'bedrijfsjurist',
    'gemeenteambtenaar': 'gemeenteambtenaar',
    'belastingadviseur': 'belastingadviseur',
    'accountant': 'accountant',
    'makelaar': 'makelaar',
    'verzekeringsagent': 'verzekeringsagent',
    'hr-medewerker': 'hr-medewerker',
    'compliance-officer': 'compliance-officer',
    'veiligheidsbeambte': 'veiligheidsbeambte',
    'aspirant': 'aspirant'
  }
  return mapping[profile] || 'algemeen'
}

export default function AskPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [profession, setProfession] = useState<Profession>('algemeen')
  const [wetUitlegEnabled, setWetUitlegEnabled] = useState(false)
  const [wetgevingEnabled, setWetgevingEnabled] = useState(false)
  const [selectedCitationQuery, setSelectedCitationQuery] = useState<{queryId: string, question: string} | null>(null)
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history')
  const [showSidebar, setShowSidebar] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasAutoSubmitted = useRef(false)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmitDirectly = useCallback(async (question: string) => {
    if (!question.trim() || isLoading) return

    const questionId = crypto.randomUUID()
    const newMessage: Message = {
      id: questionId,
      question: question.trim(),
      answer: '',
      sources: [],
      isLoading: true,
      profession,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')
    setIsLoading(true)

    try {
      const conversationHistory: string[] = []
      messages.forEach(msg => {
        conversationHistory.push(msg.question)
        conversationHistory.push(msg.answer)
      })

      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          profession,
          wetUitleg: wetUitlegEnabled,
          wetgeving: wetgevingEnabled,
          useGoogleSearch: true,
          conversationHistory
        }),
      })

      if (response.status === 429) {
        const errorData = await response.json()
        setMessages(prev => prev.map(msg => 
          msg.id === questionId 
            ? { 
                ...msg, 
                answer: `**⚠️ Gratis vragen gebruikt**

${errorData.message}

**Waarom een account aanmaken?**
- **Onbeperkt zoeken** in Nederlandse wetgeving
- **Zoekgeschiedenis** bewaren en terugvinden
- **Favorieten** opslaan voor later
- **Persoonlijke dashboard** met overzicht

[**Maak hier gratis een account aan →**](/auth/signup)

Of [**log in**](/auth/signin) als u al een account heeft.`,
                isLoading: false 
              }
            : msg
        ))
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      let accumulatedAnswer = ''
      let queryId = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'content') {
                accumulatedAnswer += data.content
                setMessages(prev => prev.map(msg => 
                  msg.id === questionId 
                    ? { ...msg, answer: accumulatedAnswer }
                    : msg
                ))
              } else if (data.type === 'queryId') {
                queryId = data.queryId
                setMessages(prev => prev.map(msg => 
                  msg.id === questionId 
                    ? { ...msg, queryId: data.queryId }
                    : msg
                ))
              } else if (data.type === 'sources') {
                setMessages(prev => prev.map(msg => 
                  msg.id === questionId 
                    ? { ...msg, sources: data.sources }
                    : msg
                ))
              } else if (data.type === 'done') {
                setMessages(prev => prev.map(msg => 
                  msg.id === questionId 
                    ? { ...msg, isLoading: false }
                    : msg
                ))
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => prev.map(msg => 
        msg.id === questionId 
          ? { 
              ...msg, 
              answer: 'Er is een fout opgetreden bij het verwerken van uw vraag. Probeer het opnieuw.',
              isLoading: false 
            }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }, [profession, wetUitlegEnabled, wetgevingEnabled, messages, isLoading])

  // Handle URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const questionParam = urlParams.get('q')
    const profileParam = urlParams.get('profile')
    const wetUitlegParam = urlParams.get('wetuitleg')
    const wetgevingParam = urlParams.get('wetgeving')
    
    if (profileParam) {
      setProfession(mapProfileToProfession(profileParam))
      if (profileParam === 'juridisch-expert') {
        setWetUitlegEnabled(true)
      }
    }
    
    if (wetUitlegParam === 'true') {
      setWetUitlegEnabled(true)
    }
    
    if (wetgevingParam === 'true') {
      setWetgevingEnabled(true)
    }
    
    if (questionParam && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true
      setInput(questionParam)
      
      // Auto-submit after a short delay
      setTimeout(() => {
        handleSubmitDirectly(questionParam)
      }, 500)
    }
  }, [handleSubmitDirectly])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    await handleSubmitDirectly(input)
  }

  const clearConversation = () => {
    setMessages([])
    setInput('')
  }

  const handleSearchSelect = (searchTerm: string, profession: string) => {
    setInput(searchTerm)
    setProfession(profession as Profession)
  }

  const ProfessionIcon = professionConfig[profession].icon

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 p-3 md:p-4 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Logo en profiel info */}
            <div className="flex items-center gap-3">
              {/* WetHelder Logo */}
              <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 mr-4">
                <Scale className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-bold text-slate-900">WetHelder</span>
              </Link>
              
              <div className="flex items-center gap-2">
                <ProfessionIcon className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">
                  {professionConfig[profession].label}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${professionConfig[profession].color}`}
                >
                  {professionConfig[profession].description}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Dashboard link voor ingelogde gebruikers */}
              {session && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="shrink-0"
                >
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                </Button>
              )}
              
              {/* Mobile: Hide some buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={clearConversation}
                className="shrink-0"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:ml-2 sm:inline">Nieuw</span>
              </Button>
              
              {/* Desktop only sidebar toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className="hidden lg:flex shrink-0"
              >
                <PanelRight className="h-4 w-4" />
                <span className="ml-2">
                  {showSidebar ? 'Verberg' : 'Toon'} Zijbalk
                </span>
              </Button>

              {/* Mobile: Show history as overlay */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab(activeTab === 'history' ? 'favorites' : 'history')}
                className="lg:hidden shrink-0"
              >
                <History className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Functieprofiel en opties sectie - verbeterde uitlijning */}
          <div className="mt-4 space-y-4">
            {/* Functieprofiel selector en knoppen in één rij */}
            <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Functieprofiel
                </label>
                <Select value={profession} onValueChange={(value) => setProfession(value as Profession)}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(professionConfig).map(([key, config]) => {
                      const Icon = config.icon
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Wet & Uitleg en Wetgeving knoppen - uitgelijnde hoogte */}
              <div className="flex gap-2">
                <div className="flex flex-col">
                  <label className="block text-xs font-medium text-slate-600 mb-1 lg:invisible">
                    Opties
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={wetUitlegEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setWetUitlegEnabled(!wetUitlegEnabled)}
                      className="flex items-center gap-2 h-9"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">Wet & Uitleg</span>
                      <span className="sm:hidden">W&U</span>
                    </Button>
                    
                    <Button
                      variant={wetgevingEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setWetgevingEnabled(!wetgevingEnabled)}
                      className="flex items-center gap-2 h-9"
                    >
                      <Scale className="h-4 w-4" />
                      <span className="hidden sm:inline">Wetgeving</span>
                      <span className="sm:hidden">Wet</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Uitleg van actieve opties */}
            {(wetUitlegEnabled || wetgevingEnabled) && (
              <div className="flex flex-wrap gap-2">
                {wetUitlegEnabled && (
                  <div className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-200">
                    📚 Diepgaande analyse met jurisprudentie
                  </div>
                )}
                {wetgevingEnabled && (
                  <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                    ⚖️ Exacte wetsartikelen en bronverwijzingen
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-8 md:py-12">
              <div className="inline-flex p-3 md:p-4 bg-blue-100 rounded-full mb-4 md:mb-6">
                <Bot className="h-6 w-6 md:h-8 md:w-8 text-blue-700" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-slate-900">WetHelder Consultatie</h3>
              <p className="text-slate-600 mb-4 md:mb-6 max-w-md mx-auto px-4">
                Stel uw juridische vraag over Nederlandse wetgeving. 
                Antwoorden worden aangepast aan uw professie.
              </p>
              <div className="text-sm text-slate-500 px-4">
                <p>Voorbeelden: &quot;Artikel 8 WVW uitleg&quot; • &quot;Procedure bij rijden onder invloed&quot;</p>
              </div>
              
              {/* Wachttijd informatie */}
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto">
                <div className="flex items-center gap-2 text-amber-800 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Verwachte wachttijd</span>
                </div>
                <p className="text-xs text-amber-700">
                  Antwoorden kunnen 10-30 seconden duren, afhankelijk van de complexiteit van uw vraag en de hoeveelheid bronnen die worden geraadpleegd.
                </p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="space-y-4">
              {/* User Question */}
              <div className="flex justify-end">
                <div className="max-w-[85%] md:max-w-[75%] bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-90" />
                    <p className="text-sm leading-relaxed break-words">{message.question}</p>
                  </div>
                </div>
              </div>

              {/* Bot Response */}
              <div className="flex justify-start">
                <div className="w-full max-w-[95%] md:max-w-[85%]">
                  <div className="bg-white rounded-2xl rounded-bl-md border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-4 md:p-6">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
                          {message.isLoading ? (
                            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                          ) : (
                            <Scale className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {message.isLoading ? (
                            <div className="space-y-3">
                              <div className="text-sm text-slate-600 flex items-center gap-2">
                                <span className="font-medium">Bezig met het formuleren van een antwoord</span>
                                <div className="flex space-x-1">
                                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                </div>
                              </div>
                              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="h-3 w-3" />
                                  <span className="font-medium">Verwachte wachttijd: 10-30 seconden</span>
                                </div>
                                <p>Afhankelijk van de complexiteit van uw vraag en de hoeveelheid bronnen die worden geraadpleegd.</p>
                              </div>
                              {message.answer && (
                                <div className="prose prose-sm md:prose-base max-w-none">
                                  {formatText(message.answer)}
                                  <div className="inline-block w-2 h-5 bg-blue-600 animate-pulse ml-1 rounded-sm"></div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="prose prose-sm md:prose-base max-w-none">
                              {formatText(message.answer)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    {!message.isLoading && message.queryId && (
                      <div className="border-t border-slate-100 px-4 md:px-6 py-3 bg-slate-50/50 rounded-b-2xl rounded-bl-md">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <CheckCircle className="h-3 w-3" />
                            <span>Antwoord gebaseerd op officiële bronnen</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FavoriteButton queryId={message.queryId} />
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedCitationQuery({ queryId: message.queryId!, question: message.question })}
                              className="h-8 px-3 text-xs"
                            >
                              <Quote className="h-3 w-3 mr-1" />
                              Citeer
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 p-3 md:p-4 bg-white">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Stel uw juridische vraag..."
                disabled={false}
                className="flex-1 h-12 md:h-12 text-base"
              />
              <Button 
                type="submit" 
                disabled={!input.trim()}
                className="px-6 h-12 w-full md:w-auto"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span className="ml-2 md:hidden">Versturen</span>
                  </>
                )}
              </Button>
            </div>
            {/* Subtiele disclaimer */}
            <p className="text-xs text-slate-500 mt-2 text-center">
              Deze informatie dient alleen ter informatie. Voor persoonlijk juridisch advies raadpleegt u een advocaat.
            </p>
          </form>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <>
          {/* Mobile overlay */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowSidebar(false)}
          />
          
          {/* Sidebar content */}
          <div className="fixed lg:relative right-0 top-0 lg:top-auto h-full lg:h-auto w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col z-50 lg:z-auto">
            <div className="border-b p-4">
              <div className="flex items-center justify-between mb-2 lg:mb-0">
                <h3 className="font-semibold lg:hidden">Menu</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowSidebar(false)}
                  className="lg:hidden"
                >
                  ✕
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={activeTab === 'history' ? 'default' : 'outline'} 
                  className="flex-1"
                  onClick={() => setActiveTab('history')}
                >
                  <History className="h-4 w-4 mr-2" />
                  Geschiedenis
                </Button>
                <Button 
                  variant={activeTab === 'favorites' ? 'default' : 'outline'} 
                  className="flex-1"
                  onClick={() => setActiveTab('favorites')}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Favorieten
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'history' && <SearchHistory onSearchSelect={handleSearchSelect} />}
              {activeTab === 'favorites' && <Favorites onQuerySelect={(q) => {
                const selectedMessage: Message = {
                  id: q.id,
                  question: q.question,
                  answer: q.answer,
                  sources: JSON.parse(q.sources),
                  profession: q.profession as Profession,
                  timestamp: new Date(q.createdAt),
                  queryId: q.id
                };
                setMessages(prev => [...prev, selectedMessage]);
                // Close sidebar on mobile after selection
                if (window.innerWidth < 1024) {
                  setShowSidebar(false);
                }
              }} />}
            </div>
          </div>
        </>
      )}

      {/* Citation Modal */}
      {selectedCitationQuery && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Citatie Generator</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedCitationQuery(null)}
              >
                ✕
              </Button>
            </div>
            <div className="p-4">
              <CitationGenerator
                queryId={selectedCitationQuery.queryId}
                question={selectedCitationQuery.question}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}