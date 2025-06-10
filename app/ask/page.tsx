'use client'

import { useState, useRef, useEffect } from 'react'
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
  Settings
} from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  question: string
  answer: string
  sources: string[]
  isLoading?: boolean
  profession?: string
}

type Profession = 'aspirant' | 'student' | 'politieagent' | 'advocaat' | 'algemeen'

const professionConfig = {
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
  },
  politieagent: {
    icon: Shield,
    label: 'Politieagent',
    fullLabel: 'Politieagent',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    description: 'Praktische kernpunten voor handhaving',
    detailedExplanation: 'Voor politieagenten worden praktische aspecten, handhavingsmogelijkheden en operationele procedures benadrukt.'
  },
  advocaat: {
    icon: Scale,
    label: 'Advocaat/Jurist',
    fullLabel: 'Advocaat/Jurist',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    description: 'Juridische feiten en jurisprudentie',
    detailedExplanation: 'Voor advocaten/juristen wordt gefocust op juridische precisie, relevante jurisprudentie en processuele aspecten.'
  },
  algemeen: {
    icon: Info,
    label: 'Algemeen',
    fullLabel: 'Algemeen publiek',
    color: 'text-gray-700 bg-gray-50 border-gray-200',
    description: 'Begrijpelijke uitleg in toegankelijke taal',
    detailedExplanation: 'Voor het algemene publiek wordt juridische informatie in begrijpelijke taal uitgelegd zonder jargon.'
  }
}

// Enhanced text formatter
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

export default function AskPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [profession, setProfession] = useState<Profession>('algemeen')
  const [showProfessionDetails, setShowProfessionDetails] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      profession
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
        body: JSON.stringify({ 
          question: input.trim(),
          profession: profession
        }),
      })

      if (!response.ok) throw new Error('Network response was not ok')

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
    }
  }

  const ProfessionIcon = professionConfig[profession].icon

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      {/* Professional Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">WetHelder Consultatieplatform</h1>
                <p className="text-sm text-slate-600">Nederlandse juridische kennisbank</p>
              </div>
            </div>
            
            {/* Professional Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative">
                <select 
                  value={profession} 
                  onChange={(e) => setProfession(e.target.value as Profession)}
                  className="appearance-none bg-white border border-slate-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {(Object.entries(professionConfig) as [Profession, typeof professionConfig[Profession]][]).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.fullLabel}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
              </div>
              
              <button
                onClick={() => setShowProfessionDetails(!showProfessionDetails)}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Eye className="h-4 w-4" />
                Uitleg verschillen
              </button>
              
              <Link 
                href="/contact" 
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Contact & Suggesties
              </Link>
            </div>
          </div>
          
          {/* Current profession info */}
          <div className={`mt-3 p-3 rounded-lg border ${professionConfig[profession].color}`}>
            <div className="flex items-center gap-2">
              <ProfessionIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Modus: {professionConfig[profession].label}</span>
              <span className="text-sm text-slate-600">— {professionConfig[profession].description}</span>
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

      {/* Chat Container */}
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex flex-col h-[calc(100vh-280px)]">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-6 mb-6">
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
                  <p>Voorbeelden: &ldquo;Artikel 8 WVW uitleg&rdquo; • &ldquo;Procedure bij rijden onder invloed&rdquo;</p>
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
                      <p className="text-sm leading-relaxed">{message.question}</p>
                    </div>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="max-w-[90%]">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1 bg-blue-100 rounded">
                            <Bot className="h-4 w-4 text-blue-700" />
                          </div>
                          <span className="text-sm font-medium text-slate-900">WetHelder</span>
                          {message.profession && (
                            <Badge variant="outline" className={`text-xs ${professionConfig[message.profession as Profession].color}`}>
                              {professionConfig[message.profession as Profession].label}
                            </Badge>
                          )}
                        </div>
                        
                        {message.isLoading ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              <span>Raadpleging Nederlandse wetgeving...</span>
                            </div>
                            <div className="space-y-2">
                              <div className="h-3 bg-slate-200 rounded animate-pulse" />
                              <div className="h-3 bg-slate-200 rounded w-4/5 animate-pulse" />
                              <div className="h-3 bg-slate-200 rounded w-3/5 animate-pulse" />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {formatText(message.answer)}
                            {message.sources && message.sources.length > 0 && (
                              <div className="border-t border-slate-200 pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="h-4 w-4 text-slate-500" />
                                  <span className="text-xs font-medium text-slate-700 uppercase tracking-wider">Juridische Bronnen</span>
                                </div>
                                <div className="space-y-1">
                                  {message.sources.map((source, idx) => (
                                    <p key={idx} className="text-xs text-slate-600 leading-relaxed pl-6">
                                      • {source}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-4">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Stel uw juridische vraag..."
                  disabled={isLoading}
                  className="flex-1 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  maxLength={500}
                />
                <Button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              
              {/* Status bar */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <div>
                  {session ? (
                    <span>Ingelogd • Onbeperkt gebruik</span>
                  ) : (
                    <span>Anoniem • Beperkt tot 3 vragen per dag</span>
                  )}
                </div>
                <div>
                  Antwoorden aangepast voor: {professionConfig[profession].label}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 