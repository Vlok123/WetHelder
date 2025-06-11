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
  Eye,
  ChevronDown,
  Settings,
  AlertTriangle,
  BookOpen,
  Gavel,
  Briefcase
} from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface Message {
  id: string
  question: string
  answer: string
  sources: string[]
  isLoading?: boolean
  profession?: string
  timestamp: Date
}

type Profession = 'aspirant' | 'student' | 'politieagent' | 'advocaat' | 'algemeen' | 'wetuitleg' | 'juridisch-expert'

const professionConfig = {
  algemeen: {
    icon: Info,
    label: 'Algemeen',
    fullLabel: 'Algemeen publiek',
    color: 'text-gray-700 bg-gray-50 border-gray-200',
    description: 'Begrijpelijke uitleg in toegankelijke taal',
    detailedExplanation: 'Voor het algemene publiek wordt juridische informatie in begrijpelijke taal uitgelegd zonder jargon.'
  },
  wetuitleg: {
    icon: BookOpen,
    label: 'Wet & Uitleg',
    fullLabel: 'Wet & Uitleg (Diepgaand)',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    description: 'Uitgebreide wetteksten met jurisprudentie en praktijkvoorbeelden',
    detailedExplanation: 'Diepgaande juridische analyse met volledige wetteksten, relevante jurisprudentie, praktijkvoorbeelden en achtergrondcontext.'
  },
  'juridisch-expert': {
    icon: Gavel,
    label: 'Juridisch Expert',
    fullLabel: 'Juridisch Expert',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    description: 'Hoogst professionele juridische analyse met volledige bronvermelding',
    detailedExplanation: 'Voor juridische experts: technische precisie, uitgebreide jurisprudentie, procedurele details en strategische overwegingen.'
  },
  advocaat: {
    icon: Scale,
    label: 'Advocaat/Jurist',
    fullLabel: 'Advocaat/Jurist',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    description: 'Juridische feiten en jurisprudentie',
    detailedExplanation: 'Voor advocaten/juristen wordt gefocust op juridische precisie, relevante jurisprudentie en processuele aspecten.'
  },
  politieagent: {
    icon: Shield,
    label: 'Politieagent',
    fullLabel: 'Politieagent',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    description: 'Praktische kernpunten voor handhaving',
    detailedExplanation: 'Voor politieagenten worden praktische aspecten, handhavingsmogelijkheden en operationele procedures benadrukt.'
  },
  aspirant: {
    icon: UserCheck,
    label: 'Aspirant',
    fullLabel: 'Aspirant (Politie/Justitie)',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    description: 'Uitgebreide uitleg met praktijkvoorbeelden',
    detailedExplanation: 'Voor aspiranten wordt extra aandacht besteed aan praktische toepassing, procedures en context binnen de rechtsstaat.'
  },
  student: {
    icon: GraduationCap,
    label: 'Student',
    fullLabel: 'Student (Rechten/Criminologie)',
    color: 'text-green-700 bg-green-50 border-green-200',
    description: 'Theoretische achtergrond en verwijzingen',
    detailedExplanation: 'Voor studenten wordt gefocust op juridische theorie, bronnen, rechtsprincipes en academische context.'
  }
}

interface MarkdownProps {
  node?: any
  children?: React.ReactNode
  [key: string]: any
}

// Enhanced text formatter with law article detection
const formatText = (text: string) => {
  if (!text) return null
  
  const lines = text.split('\n')
  const elements = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (!line) {
      elements.push(<br key={i} />)
      continue
    }
    
    // Detect article references (e.g., "Artikel 5 WVW:", "Artikel 300 Sr:")
    const articleMatch = line.match(/^(Artikel\s+\d+[a-z]?\s+(?:Sr|WVW|RVV|BW|AWB|Gw)[^:]*):?\s*(.*)$/i)
    if (articleMatch) {
      const [, articleTitle, articleContent] = articleMatch
      elements.push(
        <div key={i} className="my-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {articleTitle}
          </h4>
          {articleContent && (
            <p className="text-sm text-blue-800 leading-relaxed">{articleContent}</p>
          )}
        </div>
      )
      continue
    }
    
    // Detect full law text blocks (lines starting with quotes or containing "luidt:")
    if (line.includes('"') || line.toLowerCase().includes('luidt:') || line.toLowerCase().includes('bepaalt:')) {
      elements.push(
        <div key={i} className="my-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-sm text-slate-700 italic leading-relaxed">{line}</p>
        </div>
      )
      continue
    }
    
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="text-base font-semibold mt-4 mb-2 text-slate-800">
          {line.replace('### ', '')}
        </h4>
      )
    } else if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="text-lg font-semibold mt-5 mb-3 text-slate-800">
          {line.replace('## ', '')}
        </h3>
      )
    } else if (line.includes('**')) {
      const parts = line.split('**')
      const formatted = parts.map((part, idx) => 
        idx % 2 === 1 ? <strong key={idx} className="font-semibold text-slate-900">{part}</strong> : part
      )
      elements.push(<p key={i} className="mb-2 text-sm leading-relaxed text-slate-700">{formatted}</p>)
    } else if (line.includes('http')) {
      const urlRegex = /(https?:\/\/[^\s]+)/g
      const parts = line.split(urlRegex)
      const formatted = parts.map((part, idx) => 
        urlRegex.test(part) 
          ? <a key={idx} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline break-all text-xs">{part}</a>
          : part
      )
      elements.push(<p key={i} className="mb-2 text-sm leading-relaxed text-slate-700">{formatted}</p>)
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={i} className="ml-4 mb-1 text-sm leading-relaxed text-slate-700">
          {line.replace('- ', '')}
        </li>
      )
    } else {
      elements.push(<p key={i} className="mb-2 text-sm leading-relaxed text-slate-700">{line}</p>)
    }
  }
  
  return <div className="max-w-none">{elements}</div>
}

// Map homepage profile selection to ask page profession types
const mapProfileToProfession = (profile: string): Profession => {
  switch (profile) {
    case 'burger':
      return 'algemeen'
    case 'politie':
      return 'politieagent'
    case 'jurist':
      return 'advocaat'
    case 'boa':
      return 'politieagent' // BOA maps to politieagent for now
    case 'student':
      return 'student'
    case 'wetuitleg':
      return 'wetuitleg'
    case 'juridisch-expert':
      return 'juridisch-expert'
    default:
      return 'algemeen'
  }
}

export default function AskPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [profession, setProfession] = useState<Profession>('algemeen')
  const [showProfessionDetails, setShowProfessionDetails] = useState(false)
  const [rateLimit, setRateLimit] = useState<{remaining: number, role: string} | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasAutoSubmitted = useRef<boolean>(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Direct submit function for auto-submit from homepage
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

    // Build conversation history for API
    const conversationHistory: string[] = []
    messages.forEach(msg => {
      conversationHistory.push(msg.question)
      conversationHistory.push(msg.answer)
    })

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: question.trim(),
          profession: profession,
          conversationHistory: conversationHistory
        }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json()
          if (errorData.needsAccount) {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === questionId
                  ? { 
                      ...msg, 
                      answer: `❌ **${errorData.error}**\n\n${errorData.message}\n\n[🔐 **Account aanmaken →**](/auth/signin)\n\nMet een gratis account krijg je:\n• Onbeperkt vragen stellen\n• Persoonlijke vraaghistorie\n• Geavanceerde juridische filters`, 
                      isLoading: false 
                    }
                  : msg
              )
            )
            setIsLoading(false)
            return
          }
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
                      ? { ...msg, answer: accumulatedAnswer }
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
            ? { ...msg, answer: 'Er is een fout opgetreden. Probeer het opnieuw.', isLoading: false }
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
      
      // Update rate limit for anonymous users
      if (!session && rateLimit && rateLimit.role === 'ANONYMOUS') {
        setRateLimit(prev => prev ? {
          ...prev,
          remaining: Math.max(0, prev.remaining - 1)
        } : null)
      }

      // Clear URL parameters after successful auto-submit
      if (window.location.search.includes('search=true')) {
        window.history.replaceState({}, '', '/ask')
      }
    }
  }, [isLoading, profession, messages, session, rateLimit])

  // Handle URL parameters and auto-search
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const queryParam = urlParams.get('q')
    const profileParam = urlParams.get('profile')
    
    if (profileParam) {
      const mappedProfession = mapProfileToProfession(profileParam)
      setProfession(mappedProfession)
    }
    
    if (queryParam && queryParam.trim()) {
      setInput(queryParam.trim())
      
      // Only auto-submit if there are no existing messages and we haven't auto-submitted yet
      if (messages.length === 0 && !hasAutoSubmitted.current) {
        hasAutoSubmitted.current = true
        // Small delay to ensure state is set
        setTimeout(() => {
          handleSubmitDirectly(queryParam.trim())
        }, 100)
      }
    }
  }, [handleSubmitDirectly, messages.length])

  // Fetch rate limit status
  useEffect(() => {
    const fetchRateLimit = async () => {
      try {
        const response = await fetch('/api/ask')
        if (response.ok) {
          const data = await response.json()
          if (data.rateLimit) {
            setRateLimit({
              remaining: data.rateLimit.remaining,
              role: data.rateLimit.role
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch rate limit:', error)
      }
    }

    fetchRateLimit()
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
      isLoading: true,
      profession,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    const currentQuestion = input.trim()
    setInput('')
    setIsLoading(true)

    // Build conversation history for API (include previous messages for context)
    const conversationHistory: string[] = []
    messages.forEach(msg => {
      conversationHistory.push(msg.question)
      conversationHistory.push(msg.answer)
    })

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: currentQuestion,
          profession: profession,
          conversationHistory: conversationHistory
        }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json()
          if (errorData.needsAccount) {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === questionId
                  ? { 
                      ...msg, 
                      answer: `❌ **${errorData.error}**\n\n${errorData.message}\n\n[🔐 **Account aanmaken →**](/auth/signin)\n\nMet een gratis account krijg je:\n• Onbeperkt vragen stellen\n• Persoonlijke vraaghistorie\n• Geavanceerde juridische filters`, 
                      isLoading: false 
                    }
                  : msg
              )
            )
            setIsLoading(false)
            return
          }
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
                      ? { ...msg, answer: accumulatedAnswer }
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
            ? { ...msg, answer: 'Er is een fout opgetreden. Probeer het opnieuw.', isLoading: false }
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
      
      // Update rate limit for anonymous users
      if (!session && rateLimit && rateLimit.role === 'ANONYMOUS') {
        setRateLimit(prev => prev ? {
          ...prev,
          remaining: Math.max(0, prev.remaining - 1)
        } : null)
      }
    }
  }

  const ProfessionIcon = professionConfig[profession].icon

  // Function to clear conversation
  const clearConversation = () => {
    setMessages([])
    setInput('')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      {/* Professional Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-blue-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-semibold text-slate-900">WetHelder Consultatieplatform</h1>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                    BETA
                  </Badge>
                  {messages.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {messages.length} {messages.length === 1 ? 'bericht' : 'berichten'}
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-600">Nederlandse juridische kennisbank</p>
              </div>
            </div>
            
            {/* Professional Selector and Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              {messages.length > 0 && (
                <Button
                  onClick={clearConversation}
                  variant="outline"
                  size="sm"
                  className="text-xs border-slate-300 hover:border-slate-400"
                >
                  🆕 Nieuw gesprek
                </Button>
              )}
              <div className="flex items-center gap-2">
                <label className="text-xs sm:text-sm font-medium text-slate-700 whitespace-nowrap">
                  Uw professie:
                </label>
                <Select value={profession} onValueChange={(value) => setProfession(value as Profession)}>
                  <SelectTrigger className="w-full sm:w-48 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(professionConfig) as [Profession, typeof professionConfig[Profession]][]).map(([key, config]) => {
                      const Icon = config.icon
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="text-xs sm:text-sm">{config.fullLabel}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Current profession info */}
          <div className={`mt-3 p-3 rounded-lg border ${professionConfig[profession].color}`}>
            <div className="flex items-center gap-2">
              <ProfessionIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Modus: {professionConfig[profession].label}</span>
              <span className="text-sm text-slate-600">— {professionConfig[profession].description}</span>
              {messages.length > 0 && (
                <span className="text-xs text-slate-500 ml-auto">
                  📝 Gesprek actief - berichten worden onthouden
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profession Details Modal */}
      {showProfessionDetails && (
        <div className="bg-white border-b border-slate-200 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-4xl">
              <h3 className="text-lg font-semibold mb-4 text-slate-900">Uitlegverschillen per Professie</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Object.entries(professionConfig) as [Profession, typeof professionConfig[Profession]][]).map(([key, config]) => {
                  const Icon = config.icon
                  return (
                    <div key={key} className={`p-4 rounded-lg border ${config.color}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{config.label}</span>
                      </div>
                      <p className="text-sm text-slate-700">{config.detailedExplanation}</p>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowProfessionDetails(false)}
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  Sluiten
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rate Limit Warning */}
      {rateLimit && rateLimit.remaining <= 1 && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm font-medium">
                {rateLimit.remaining === 0 
                  ? 'Geen gratis vragen meer vandaag - Maak een account aan voor onbeperkt gebruik!'
                  : `Nog ${rateLimit.remaining} gratis vraag vandaag - Maak een account aan voor onbeperkt gebruik!`
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-5xl">
        <div className="flex flex-col h-[calc(100vh-280px)] sm:h-[calc(100vh-280px)]">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 mb-4 sm:mb-6">
            {messages.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="inline-flex p-3 sm:p-4 bg-blue-100 rounded-full mb-4 sm:mb-6">
                  <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-blue-700" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-slate-900">WetHelder Consultatie</h3>
                <p className="text-slate-600 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
                  Stel uw juridische vraag over Nederlandse wetgeving. 
                  Antwoorden worden aangepast aan uw professie.
                </p>
                
                {/* New conversation explanation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto mb-4 sm:mb-6">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <h4 className="font-semibold text-blue-900 mb-2">💬 Intelligente gesprekken</h4>
                      <p className="text-sm text-blue-800 mb-3">
                        WetHelder onthoudt uw hele gesprek en kan doorvragen beantwoorden. 
                        Stel gerust vervolgvragen zoals &ldquo;Leg dat eens anders uit&rdquo; of &ldquo;Wat zijn de uitzonderingen?&rdquo;.
                      </p>
                      <p className="text-xs text-blue-700">
                        💡 Tip: Start een nieuw gesprek voor een ander onderwerp via de &ldquo;🆕 Nieuw gesprek&rdquo; knop.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs sm:text-sm text-slate-500 px-4">
                  <p>Voorbeelden: &ldquo;Artikel 8 WVW uitleg&rdquo; • &ldquo;Procedure bij rijden onder invloed&rdquo;</p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className="space-y-3 sm:space-y-4">
                {/* User Question */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] sm:max-w-[80%] bg-blue-600 text-white rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
                    <div className="flex items-start gap-2">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                      <p className="text-xs sm:text-sm leading-relaxed">{message.question}</p>
                    </div>
                  </div>
                </div>

                {/* Systeem Response */}
                <div className="flex justify-start">
                  <div className="max-w-[95%] sm:max-w-[90%]">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                      <div className="p-3 sm:p-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Scale className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="prose prose-sm sm:prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ children }) => <p className="whitespace-pre-wrap break-words">{children}</p>
                                }}
                              >
                                {message.answer}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t border-slate-200 pt-3 sm:pt-4">
            <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
              <div className="flex gap-2 sm:gap-3">
                <div className="flex-1">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Stel uw juridische vraag..."
                    disabled={isLoading}
                    className="w-full text-sm sm:text-base py-2 sm:py-3 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="px-3 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
              </div>

              {/* Rate Limit Status */}
              {rateLimit && (
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500">
                  <span>
                    {rateLimit.role === 'ANONYMOUS' 
                      ? `Gratis: ${rateLimit.remaining} vragen van 3 over vandaag`
                      : 'Onbeperkt gebruik met account'
                    }
                  </span>
                  {rateLimit.role === 'ANONYMOUS' && (
                    <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 underline">
                      Account aanmaken
                    </Link>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 