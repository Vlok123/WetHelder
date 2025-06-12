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
  Clock
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

type Profession = 'aspirant' | 'student' | 'politieagent' | 'advocaat' | 'algemeen' | 'boa' | 'rechter' | 'notaris' | 'deurwaarder' | 'bedrijfsjurist' | 'gemeenteambtenaar' | 'belastingadviseur' | 'accountant' | 'makelaar' | 'verzekeringsagent' | 'hr-medewerker' | 'compliance-officer' | 'veiligheidsbeambte'

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
  
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="text-xl font-bold mb-4 text-slate-900">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-semibold mb-3 text-slate-800">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-medium mb-2 text-slate-700">{children}</h3>,
        p: ({ children }) => <p className="mb-3 text-slate-700 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 text-slate-700">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-slate-700">{children}</ol>,
        li: ({ children }) => <li className="text-slate-700">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
        em: ({ children }) => <em className="italic text-slate-800">{children}</em>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-200 pl-4 py-2 mb-3 bg-blue-50 text-slate-700 italic">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-sm font-mono">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="bg-slate-100 p-3 rounded-lg mb-3 overflow-x-auto">
            <code className="text-sm font-mono text-slate-800">{children}</code>
          </pre>
        ),
        a: ({ href, children }) => (
          <a 
            href={href} 
            className="text-blue-600 hover:text-blue-800 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-3">
            <table className="min-w-full border border-slate-200 rounded-lg">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => <tr className="border-b border-slate-200">{children}</tr>,
        th: ({ children }) => (
          <th className="px-4 py-2 text-left font-semibold text-slate-900 border-r border-slate-200 last:border-r-0">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 text-slate-700 border-r border-slate-200 last:border-r-0">
            {children}
          </td>
        )
      }}
    >
      {text}
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
  }, [])

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
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto flex h-[calc(100vh-64px)]">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Scale className="h-6 w-6 text-blue-600" />
                  <h1 className="text-xl font-semibold text-slate-900">WetHelder</h1>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    BETA
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">Professie:</label>
                  <Select value={profession} onValueChange={(value) => setProfession(value as Profession)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(professionConfig) as [Profession, typeof professionConfig[Profession]][]).map(([key, config]) => {
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
              </div>
              
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <Button onClick={clearConversation} variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Nieuw gesprek
                  </Button>
                )}
                <Button 
                  onClick={() => setShowSidebar(!showSidebar)} 
                  variant="outline" 
                  size="sm"
                >
                  <History className="h-4 w-4 mr-2" />
                  Geschiedenis
                </Button>
              </div>
            </div>
            
            {/* Profession Info */}
            <div className={`mt-3 p-3 rounded-lg border ${professionConfig[profession].color}`}>
              <div className="flex items-center gap-2">
                <ProfessionIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{professionConfig[profession].label}</span>
                <span className="text-sm text-slate-600">— {professionConfig[profession].description}</span>
              </div>
              
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wetUitlegEnabled}
                    onChange={(e) => setWetUitlegEnabled(e.target.checked)}
                    className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <FileText className="h-4 w-4 text-emerald-700" />
                  <span className="text-sm font-medium text-emerald-800">Wet & Uitleg (Diepgaand)</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wetgevingEnabled}
                    onChange={(e) => setWetgevingEnabled(e.target.checked)}
                    className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Scale className="h-4 w-4 text-blue-700" />
                  <span className="text-sm font-medium text-blue-800">Wetgeving (Artikelverwijzingen)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex p-4 bg-blue-100 rounded-full mb-6">
                  <Bot className="h-8 w-8 text-blue-700" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">WetHelder Consultatie</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Stel uw juridische vraag over Nederlandse wetgeving. 
                  Antwoorden worden aangepast aan uw professie.
                </p>
                <div className="text-sm text-slate-500">
                  <p>Voorbeelden: "Artikel 8 WVW uitleg" • "Procedure bij rijden onder invloed"</p>
                </div>
                
                {/* Wachttijd informatie */}
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg max-w-md mx-auto">
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
                  <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl px-4 py-3">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{message.question}</p>
                    </div>
                  </div>
                </div>

                {/* Bot Response */}
                <div className="flex justify-start">
                  <div className="max-w-[90%]">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            {message.isLoading ? (
                              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                            ) : (
                              <Scale className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {message.isLoading ? (
                              <div className="space-y-2">
                                <div className="text-sm text-slate-600 flex items-center gap-2">
                                  <span>Bezig met het formuleren van een antwoord</span>
                                  <div className="flex space-x-1">
                                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                  </div>
                                </div>
                                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
                                  💡 Wachttijd kan variëren van 10-30 seconden afhankelijk van de complexiteit van uw vraag
                                </div>
                                {message.answer && (
                                  <div className="prose prose-sm max-w-none">
                                    {formatText(message.answer)}
                                    <div className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1"></div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="prose prose-sm max-w-none">
                                {formatText(message.answer)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      {!message.isLoading && message.queryId && (
                        <div className="border-t border-slate-200 px-4 py-2 flex items-center justify-end gap-2">
                          <FavoriteButton queryId={message.queryId} />
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedCitationQuery({ queryId: message.queryId!, question: message.question })}
                          >
                            <Quote className="h-4 w-4" />
                          </Button>
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
          <div className="border-t border-slate-200 p-4 bg-white">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Stel uw juridische vraag..."
                  disabled={isLoading}
                  className="flex-1 h-12"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="px-6 h-12"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="w-96 bg-white border-l border-slate-200 flex flex-col">
            <div className="border-b p-4">
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
              }} />}
            </div>
          </div>
        )}
      </div>

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