'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  User,
  Crown,
  Gift,
  Star,
  CheckCircle,
  Bot,
  Menu,
  X,
  History,
  Bookmark,
  Settings,
  Sun,
  Moon,
  Mic,
  Plus,
  ChevronRight,
  LogIn,
  LogOut,
  Trash2,
  Loader2,
  UserCheck
} from 'lucide-react'
import { formatTextWithLinks, formatSourcesWithLinks } from '@/lib/textFormatter'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Available professions with their specific contexts
const PROFESSIONS = [
  { value: 'algemeen', label: 'Algemeen publiek', icon: '👤', description: 'Begrijpelijke uitleg voor iedereen' },
  { value: 'advocaat', label: 'Advocaat/Jurist', icon: '⚖️', description: 'Juridische precisie en jurisprudentie' },
  { value: 'politieagent', label: 'Politieagent', icon: '👮', description: 'Praktische handhaving en procedures' },
  { value: 'boa', label: 'BOA (Buitengewoon Opsporingsambtenaar)', icon: '🚔', description: 'APV-handhaving en specifieke BOA-bevoegdheden' },
  { value: 'beveiliger', label: 'Beveiliger', icon: '🛡️', description: 'Beveiligingsprotocollen en private handhaving' },
  { value: 'aspirant', label: 'Aspirant (Politie/Justitie)', icon: '👨‍🎓', description: 'Uitgebreide uitleg met praktijkvoorbeelden' },
  { value: 'student', label: 'Student (Rechten)', icon: '📚', description: 'Studiegericht met bronverwijzingen' },
  { value: 'ondernemer', label: 'Ondernemer/MKB', icon: '💼', description: 'Bedrijfsrechtelijke focus' },
  { value: 'hr', label: 'HR Professional', icon: '👥', description: 'Arbeidsrecht en personeelszaken' },
  { value: 'rechter', label: 'Rechter/Magistraat', icon: '⚖️', description: 'Jurisprudentie en rechterlijke besluitvorming' },
  { value: 'ovj', label: 'Officier van Justitie', icon: '🏛️', description: 'Vervolging en strafrecht' },
  { value: 'notaris', label: 'Notaris', icon: '📋', description: 'Notarieel recht en akten' },
  { value: 'deurwaarder', label: 'Gerechtsdeurwaarder', icon: '⚡', description: 'Executierecht en invordering' },
  { value: 'mediator', label: 'Mediator', icon: '🤝', description: 'Conflictoplossing en bemiddeling' },
  { value: 'ambtenaar', label: 'Ambtenaar', icon: '🏢', description: 'Bestuursrecht en overheidsprocessen' }
]

interface Message {
  id: string
  question: string
  answer: string
  sources: string[]
  profession: string
  isLoading?: boolean
  timestamp?: Date
}

interface ChatHistory {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
  answer?: string
  profession?: string
}

// Quick action suggestions
const QUICK_ACTIONS = [
  { text: "Wat zijn mijn rechten als huurder?", category: "Huurrecht" },
  { text: "Hoe stel ik een arbeidscontract op?", category: "Arbeidsrecht" },
  { text: "Wat is het verschil tussen eigendom en erfpacht?", category: "Vastgoedrecht" },
  { text: "Wanneer is er sprake van mishandeling volgens de wet?", category: "Strafrecht" },
]

// Feature cards
const FEATURE_CARDS = [
  {
    title: "Boetes & Feitcodes",
    description: "Zoek feitcodes of stel vragen over Nederlandse boetes en overtredingen",
    icon: "⚖️",
    href: "/boetes",
    badge: "Nieuw"
  }
]

export default function ModernLegalChat() {
  const { data: session, status } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [selectedProfession, setSelectedProfession] = useState('algemeen')
  const [isLoading, setIsLoading] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [rateLimitStatus, setRateLimitStatus] = useState<{
    remaining: number;
    role: string;
  } | null>(null)
  const [advancedMode, setAdvancedMode] = useState(false) // Voor "Wet & Uitleg" functionaliteit
  const [conversationHistory, setConversationHistory] = useState<string[]>([]) // Voor conversatie context
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Check for continued chat from sessionStorage
  useEffect(() => {
    const continueChat = sessionStorage.getItem('continueChat')
    if (continueChat) {
      try {
        const chatData = JSON.parse(continueChat)
        
        // Add the previous conversation to messages
        const previousMessage: Message = {
          id: 'continued-' + Date.now().toString(),
          question: chatData.question,
          answer: chatData.answer,
          sources: [],
          profession: chatData.profession || 'algemeen',
          timestamp: new Date()
        }
        
        setMessages([previousMessage])
        setSelectedProfession(chatData.profession || 'algemeen')
        
        // Clear the sessionStorage after using it
        sessionStorage.removeItem('continueChat')
        
        // Focus input for immediate continuation
        setTimeout(() => {
          inputRef.current?.focus()
        }, 100)
        
      } catch (error) {
        console.error('Error parsing continue chat data:', error)
        sessionStorage.removeItem('continueChat')
      }
    }
  }, [])

  // Fetch real chat history from database
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!session?.user?.email) return
      
      try {
        const response = await fetch('/api/chat-history')
        if (response.ok) {
          const data = await response.json()
          setChatHistory(data.queries.map((q: any) => ({
            id: q.id,
            title: q.question.length > 50 ? q.question.substring(0, 50) + '...' : q.question,
            lastMessage: q.question,
            timestamp: new Date(q.createdAt),
            messageCount: 1,
            answer: q.answer,
            profession: q.profession
          })))
        }
      } catch (error) {
        console.error('Failed to fetch chat history:', error)
        // Fallback to mock data during development/database issues
        const mockHistory: ChatHistory[] = [
          {
            id: '1',
            title: 'Huurrecht vraag',
            lastMessage: 'Wat zijn mijn rechten als huurder?',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            messageCount: 3
          }
        ]
        setChatHistory(mockHistory)
      }
    }

    fetchChatHistory()
  }, [session])

  // Check rate limit status
  useEffect(() => {
    const checkRateLimit = async () => {
      try {
        const response = await fetch('/api/ask')
        if (response.ok) {
          const data = await response.json()
          setRateLimitStatus(data.rateLimit)
        }
      } catch (error) {
        console.error('Failed to check rate limit:', error)
      }
    }
    
    checkRateLimit()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentQuestion.trim() || isLoading) return

    const questionToSubmit = currentQuestion.trim()
    
    const userMessage: Message = {
      id: Date.now().toString(),
      question: questionToSubmit,
      answer: '',
      sources: [],
      profession: selectedProfession,
      timestamp: new Date(),
      ...(advancedMode && { advancedMode: true })
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentQuestion('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionToSubmit,
          profession: selectedProfession,
          advancedMode: advancedMode,
          conversationHistory: conversationHistory,
        }),
      })

      if (response.status === 429) {
        const errorData = await response.json()
        // Update rate limit status
        setRateLimitStatus({ remaining: 0, role: errorData.role })
        
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, answer: errorData.message || 'U heeft uw dagelijkse limiet bereikt.' }
            : msg
        ))
        return
      }

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullAnswer = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                const content = parsed.content || ''
                
                if (content) {
                  fullAnswer += content
                  setMessages(prev => prev.map(msg => 
                    msg.id === userMessage.id 
                      ? { ...msg, answer: fullAnswer }
                      : msg
                  ))
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      // Update conversation history
      setConversationHistory(prev => [...prev, questionToSubmit, fullAnswer])

      // Update rate limit status after successful question
      if (rateLimitStatus) {
        setRateLimitStatus({
          ...rateLimitStatus,
          remaining: Math.max(0, rateLimitStatus.remaining - 1)
        })
      }

    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, answer: 'Er is een fout opgetreden. Probeer het opnieuw.' }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (action: string) => {
    setCurrentQuestion(action)
    // Trigger submit with synthetic event
    const syntheticEvent = {
      preventDefault: () => {},
      target: null,
      currentTarget: null
    } as unknown as React.FormEvent
    
    setTimeout(() => {
      handleSubmit(syntheticEvent)
    }, 100)
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m geleden`
    if (hours < 24) return `${hours}u geleden`
    return `${days}d geleden`
  }

  const clearChatHistory = () => {
    setChatHistory([])
  }

  const newChat = () => {
    setMessages([])
    setCurrentQuestion('')
    setConversationHistory([])
    inputRef.current?.focus()
  }

  const continueChat = (chat: ChatHistory) => {
    // Add the previous Q&A to messages
    const previousMessage: Message = {
      id: 'continued-' + Date.now().toString(),
      question: chat.lastMessage,
      answer: (chat as any).answer || '',
      sources: [],
      profession: (chat as any).profession || selectedProfession,
      timestamp: chat.timestamp
    }
    
    setMessages([previousMessage])
    setSelectedProfession((chat as any).profession || selectedProfession)
    
    // Focus input for immediate continuation
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Top Navigation Bar */}
      <header className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="lg:hidden p-1 sm:p-2"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <Scale className={`h-6 w-6 sm:h-8 sm:w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                WetHelder
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Rate Limit Status */}
            {rateLimitStatus && (
              <div className={`text-xs sm:text-sm px-2 py-1 rounded ${
                rateLimitStatus.remaining <= 1 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
              }`}>
                <span className="hidden sm:inline">Gratis: </span>{rateLimitStatus.remaining} vragen
              </div>
            )}

            {/* Admin Panel Link */}
            {session?.user?.email === 'sanderhelmink@gmail.com' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open('/admin', '_blank')}
                className="p-1 sm:p-2 text-blue-600 hover:text-blue-700"
              >
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline ml-1">Admin</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="p-1 sm:p-2"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-57px)] sm:h-[calc(100vh-73px)]">
        {/* Left Sidebar */}
        <aside className={`${
          leftSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 sm:w-80 transition-transform duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-r overflow-y-auto`}>
          
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className={`text-base sm:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Navigatie
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLeftSidebarOpen(false)}
                className="lg:hidden p-1"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            {/* New Chat Button */}
            <Button 
              className={`w-full mb-4 sm:mb-6 ${
                darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              onClick={newChat}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Chat
            </Button>

            {/* Profession Selector */}
            <div className="mb-4 sm:mb-6">
              <label className={`block text-xs sm:text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Uw professie
              </label>
              <Select value={selectedProfession} onValueChange={setSelectedProfession}>
                <SelectTrigger className={`w-full ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}>
                  <SelectValue placeholder="Selecteer professie" />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSIONS.map((prof) => (
                    <SelectItem key={prof.value} value={prof.value}>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{prof.icon}</span>
                        <span className="text-xs sm:text-sm">{prof.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Premium Mode Toggle (alleen voor ingelogde gebruikers) */}
            {session && (
              <div className={`mb-4 sm:mb-6 p-3 rounded-lg border ${
                darkMode ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-600' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🧠</span>
                    <span className={`text-xs sm:text-sm font-medium ${
                      darkMode ? 'text-blue-200' : 'text-blue-800'
                    }`}>
                      Wet & Uitleg
                    </span>
                    <Badge variant="outline" className={`text-xs ${
                      darkMode ? 'border-purple-300 text-purple-200' : 'border-purple-500 text-purple-700'
                    }`}>
                      Premium
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAdvancedMode(!advancedMode)}
                    className={`p-1 ${
                      advancedMode 
                        ? darkMode ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
                        : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <span className="text-xs font-medium">
                      {advancedMode ? 'AAN' : 'UIT'}
                    </span>
                  </Button>
                </div>
                <p className={`text-xs ${
                  darkMode ? 'text-blue-100' : 'text-blue-700'
                }`}>
                  Voor complexe juridische diepgang met jurisprudentie. Niet voor algemene vragen.
                </p>
              </div>
            )}

            {/* Quick Links */}
            <div className="space-y-2">
              <h3 className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Snel naar
              </h3>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs sm:text-sm"
                  onClick={() => window.location.href = '/boetes'}
                >
                  <Scale className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Boetes & Feitcodes
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs sm:text-sm"
                  onClick={() => handleQuickAction('Wat zijn mijn rechten bij een politiecontrole?')}
                >
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Rechten bij controle
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs sm:text-sm"
                  onClick={() => handleQuickAction('Procedure bij aanhouding door beveiliger')}
                >
                  <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Beveiligingsprocedures
                </Button>
                
                {/* Admin Panel Link voor Sander */}
                {session?.user?.email === 'sanderhelmink@gmail.com' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs sm:text-sm text-blue-600 hover:text-blue-700"
                    onClick={() => window.open('/admin', '_blank')}
                  >
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Admin Panel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            <div className="max-w-4xl mx-auto">
              {messages.length === 0 ? (
                // Welcome Screen
                <div className="text-center py-6 sm:py-12">
                  <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-4 sm:mb-6 ${
                    darkMode ? 'bg-blue-600' : 'bg-blue-100'
                  }`}>
                    <Scale className={`h-6 w-6 sm:h-8 sm:w-8 ${darkMode ? 'text-white' : 'text-blue-600'}`} />
                  </div>
                  
                  <h1 className={`text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Welkom bij WetHelder
                  </h1>
                  
                  <p className={`text-base sm:text-lg mb-6 sm:mb-8 px-4 ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Uw persoonlijke juridische kennisplatform voor betrouwbare juridische informatie
                  </p>

                  {/* Account Benefits Section */}
                  {!session && (
                    <div className={`mx-4 mb-8 p-6 rounded-lg border ${
                      darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
                    }`}>
                      <h3 className={`text-lg font-semibold mb-4 ${
                        darkMode ? 'text-blue-300' : 'text-blue-800'
                      }`}>
                        ✅ Waarom een gratis account aanmaken?
                      </h3>
                      <div className={`grid md:grid-cols-2 gap-3 text-sm ${
                        darkMode ? 'text-blue-200' : 'text-blue-700'
                      }`}>
                        <div className="flex items-start gap-2">
                          <span>🔍</span>
                          <span><strong>Diepgaande juridische uitleg</strong> bij wetgeving, inclusief voorbeelden uit de praktijk</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span>⚖️</span>
                          <span><strong>Jurisprudentie en toelichtingen</strong> van rechters en instanties, vertaald naar gewone taal</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span>🧠</span>
                          <span><strong>Slimme zoekfunctie</strong> op thema&apos;s als &apos;mishandeling&apos;, &apos;ontslag&apos; of &apos;huurproblemen&apos;</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span>🛠️</span>
                          <span><strong>Persoonlijke vragen stellen</strong> over jouw situatie – direct zoeken in de wet</span>
                        </div>
                      </div>
                      <p className={`mt-4 text-sm ${
                        darkMode ? 'text-blue-300' : 'text-blue-800'
                      }`}>
                        Je hoeft geen jurist te zijn – wij maken wetten begrijpelijk.<br/>
                        <strong>Meld je gratis aan</strong> en ontdek wat de wet echt zegt – in gewone taal.
                      </p>
                    </div>
                  )}

                  {/* Feature Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 px-4">
                    {FEATURE_CARDS.map((feature, index) => (
                      <Card
                        key={index}
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 border-2 ${
                          darkMode 
                            ? 'bg-gradient-to-r from-blue-800 to-indigo-800 border-blue-600 hover:from-blue-700 hover:to-indigo-700' 
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100'
                        }`}
                        onClick={() => window.location.href = feature.href}
                      >
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-start justify-between">
                            <div className="text-left flex-1">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                <span className="text-xl sm:text-2xl">{feature.icon}</span>
                                <h3 className={`text-base sm:text-xl font-bold ${
                                  darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {feature.title}
                                </h3>
                                {feature.badge && (
                                  <Badge variant="default" className="bg-green-500 text-white text-xs">
                                    {feature.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className={`text-xs sm:text-sm ${
                                darkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {feature.description}
                              </p>
                            </div>
                            <ChevronRight className={`h-5 w-5 sm:h-6 sm:w-6 ml-2 sm:ml-4 ${
                              darkMode ? 'text-gray-400' : 'text-gray-400'
                            }`} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>


                </div>
              ) :
                // Messages
                <div className="space-y-4 sm:space-y-6">
                  {messages.map((message) => (
                    <div key={message.id} className="space-y-3 sm:space-y-4">
                      {/* User Question */}
                      <div className="flex justify-end">
                        <Card className={`max-w-[90%] sm:max-w-2xl ${
                          darkMode 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-blue-600 text-white'
                        }`}>
                          <CardContent className="p-3 sm:p-4">
                            <p className="text-sm sm:text-base">{message.question}</p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2 text-xs opacity-80">
                                <Clock className="h-3 w-3" />
                                <span>{formatRelativeTime(message.timestamp || new Date())}</span>
                              </div>
                              {(message as any).advancedMode && (
                                <Badge variant="outline" className="text-xs border-white/30 text-white/90">
                                  🧠 Wet & Uitleg
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Response */}
                      <div className="flex justify-start">
                        <Card className={`max-w-[95%] sm:max-w-4xl ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-700' 
                            : 'bg-white'
                        }`}>
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                                darkMode ? 'bg-blue-600' : 'bg-blue-100'
                              }`}>
                                <Bot className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                  darkMode ? 'text-white' : 'text-blue-600'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`prose prose-sm sm:prose max-w-none ${
                                  darkMode ? 'prose-invert' : ''
                                }`}>
                                  <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      p: ({ children }) => <p className="mb-4 leading-relaxed whitespace-pre-wrap break-words">{children}</p>,
                                      br: () => <br className="mb-2" />,
                                      h1: ({ children }) => <h1 className="text-xl font-bold mb-4 mt-6">{children}</h1>,
                                      h2: ({ children }) => <h2 className="text-lg font-semibold mb-3 mt-5">{children}</h2>,
                                      h3: ({ children }) => <h3 className="text-base font-medium mb-2 mt-4">{children}</h3>,
                                      ul: ({ children }) => <ul className="mb-4 pl-4 space-y-1">{children}</ul>,
                                      ol: ({ children }) => <ol className="mb-4 pl-4 space-y-1">{children}</ol>,
                                      li: ({ children }) => <li className="mb-1">{children}</li>,
                                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                      em: ({ children }) => <em className="italic">{children}</em>
                                    }}
                                  >
                                    {message.answer}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              }
            </div>
          </div>

          {/* Input Area */}
          <div className={`border-t p-3 sm:p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="max-w-4xl mx-auto space-y-4">
              <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
                <div className="flex-1">
                  <Input
                    ref={inputRef}
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    placeholder={
                      advancedMode 
                        ? `🧠 Wet & Uitleg: Krijg diepgaande juridische analyse met jurisprudentie...`
                        : `Stel uw vraag over Nederlandse wetgeving...`
                    }
                    disabled={isLoading}
                    className={`w-full text-sm sm:text-base py-3 sm:py-4 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                
                {/* Wet & Uitleg Toggle Button */}
                {session && (
                  <Button
                    type="button"
                    variant={advancedMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAdvancedMode(!advancedMode)}
                    className={`px-3 py-3 sm:py-4 whitespace-nowrap ${
                      advancedMode 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0' 
                        : darkMode 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">🧠</span>
                    <span className="hidden sm:inline ml-1 text-xs">Wet & Uitleg</span>
                  </Button>
                )}
                
                <Button 
                  type="submit" 
                  disabled={isLoading || !currentQuestion.trim()}
                  className="px-4 sm:px-6 py-3 sm:py-4"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>

              {/* Quick Actions below input - only when no messages */}
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className={`text-xs text-center ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Of kies een van deze voorbeeldvragen:
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {QUICK_ACTIONS.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action.text)}
                        className={`text-left p-3 rounded-lg border text-sm transition-all duration-200 hover:scale-[1.02] ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-650' 
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium">{action.text}</div>
                        <div className={`text-xs mt-1 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {action.category}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Wet & Uitleg Info */}
              {session && advancedMode && (
                <div className={`text-xs p-3 rounded-lg ${
                  darkMode ? 'bg-blue-900/30 text-blue-200 border border-blue-700' : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>🧠</span>
                    <span className="font-medium">Wet & Uitleg modus actief</span>
                  </div>
                  <p>Voor diepgaande juridische analyse met jurisprudentie. Ideaal voor complexe rechtsvragen en professioneel gebruik.</p>
                </div>
              )}
              
              <p className={`text-xs text-center px-4 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                WetHelder kan fouten maken. Controleer belangrijke informatie altijd.
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {leftSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setLeftSidebarOpen(false)}
        />
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className={`w-full max-w-lg ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={darkMode ? 'text-white' : 'text-gray-900'}>
                  Instellingen
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Donkere modus
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                  className="flex items-center gap-2"
                >
                  {darkMode ? (
                    <>
                      <Sun className="h-4 w-4" />
                      Licht
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      Donker
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 