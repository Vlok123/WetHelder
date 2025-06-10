'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Trash2
} from 'lucide-react'
import { formatTextWithLinks, formatSourcesWithLinks } from '@/lib/textFormatter'

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
  { text: "Welke stappen moet ik nemen bij echtscheiding?", category: "Familierecht" },
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (question: string = currentQuestion) => {
    if (!question.trim() || isLoading) return

    const questionToSubmit = question.trim()
    setCurrentQuestion('')
    setIsLoading(true)

    const newMessage: Message = {
      id: Date.now().toString(),
      question: questionToSubmit,
      answer: '',
      sources: [],
      profession: selectedProfession,
      isLoading: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionToSubmit,
          profession: selectedProfession,
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      let answer = ''
      let sources: string[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                answer += data.content
                setMessages(prev => prev.map(msg => 
                  msg.id === newMessage.id 
                    ? { ...msg, answer, isLoading: false }
                    : msg
                ))
              }
              if (data.sources) {
                sources = data.sources
              }
            } catch (e) {
              // Ignore JSON parsing errors
            }
          }
        }
      }

      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { ...msg, answer, sources, isLoading: false }
          : msg
      ))

    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { ...msg, answer: 'Er is een fout opgetreden. Probeer het opnieuw.', isLoading: false }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (action: string) => {
    setCurrentQuestion(action)
    handleSubmit(action)
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
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Scale className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                WetHelder
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-full"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {session ? (
              <div className="flex items-center gap-2">
                <span className={`text-sm hidden sm:block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {session.user?.email}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full"
                  onClick={() => signOut()}
                  title="Uitloggen"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full"
                onClick={() => signIn()}
                title="Inloggen"
              >
                <LogIn className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar */}
        <aside className={`${
          leftSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-80 transition-transform duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-r overflow-y-auto`}>
          
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Navigatie
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLeftSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* New Chat Button */}
            <Button 
              className={`w-full mb-6 ${
                darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              onClick={newChat}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Chat
            </Button>

            {/* Profession Selector */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Ik ben een:
              </label>
              <Select value={selectedProfession} onValueChange={setSelectedProfession}>
                <SelectTrigger className={`${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'
                }`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={darkMode ? 'bg-gray-700 border-gray-600' : ''}>
                  {PROFESSIONS.map((profession) => (
                    <SelectItem key={profession.value} value={profession.value}>
                      <div className="flex items-center gap-2">
                        <span>{profession.icon}</span>
                        <span>{profession.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-2 mb-6">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4 mr-3" />
                Instellingen
              </Button>
              {session && (
                <Button variant="ghost" className="w-full justify-start">
                  <Bookmark className="h-4 w-4 mr-3" />
                  Opgeslagen
                </Button>
              )}
            </nav>

            {/* Chat History - Only show when logged in */}
            {session ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Chatgeschiedenis
                  </h3>
                  {chatHistory.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearChatHistory}
                      className="h-6 w-6 p-0"
                      title="Geschiedenis wissen"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {chatHistory.length === 0 ? (
                    <p className={`text-xs ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      Nog geen chatgeschiedenis
                    </p>
                  ) : (
                    chatHistory.map((chat) => (
                      <Button
                        key={chat.id}
                        variant="ghost"
                        className={`w-full justify-start text-left h-auto p-3 ${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => continueChat(chat)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm truncate ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {chat.title}
                          </p>
                          <p className={`text-xs truncate ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {chat.lastMessage}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs ${
                              darkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {formatRelativeTime(chat.timestamp)}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {chat.messageCount}
                            </Badge>
                          </div>
                        </div>
                      </Button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className={`font-medium mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Log in voor meer functies
                </h3>
                <p className={`text-sm mb-3 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  • Chatgeschiedenis opslaan
                  • Vragen bookmarken  
                  • Persoonlijke instellingen
                </p>
                <Button 
                  onClick={() => signIn()}
                  className="w-full"
                  size="sm"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Inloggen
                </Button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto">
              {messages.length === 0 ? (
                // Welcome Screen
                <div className="text-center py-12">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
                    darkMode ? 'bg-blue-600' : 'bg-blue-100'
                  }`}>
                    <Scale className={`h-8 w-8 ${darkMode ? 'text-white' : 'text-blue-600'}`} />
                  </div>
                  
                  <h1 className={`text-3xl font-bold mb-3 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Welkom bij WetHelder
                  </h1>
                  
                  <p className={`text-lg mb-8 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Uw persoonlijke juridische AI-assistent voor betrouwbare juridische informatie
                  </p>

                  {/* Feature Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="text-left flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{feature.icon}</span>
                                <h3 className={`text-xl font-bold ${
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
                              <p className={`text-sm ${
                                darkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {feature.description}
                              </p>
                            </div>
                            <ChevronRight className={`h-6 w-6 ml-4 ${
                              darkMode ? 'text-gray-400' : 'text-gray-400'
                            }`} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {QUICK_ACTIONS.map((action, index) => (
                      <Card
                        key={index}
                        className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                            : 'bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => handleQuickAction(action.text)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-left">
                              <p className={`font-medium ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {action.text}
                              </p>
                              <Badge variant="secondary" className="mt-2 text-xs">
                                {action.category}
                              </Badge>
                            </div>
                            <ChevronRight className={`h-5 w-5 ${
                              darkMode ? 'text-gray-400' : 'text-gray-400'
                            }`} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                // Messages
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div key={message.id} className="space-y-4">
                      {/* User Question */}
                      <div className="flex justify-end">
                        <Card className={`max-w-2xl ${
                          darkMode 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-blue-600 text-white'
                        }`}>
                          <CardContent className="p-4">
                            <p>{message.question}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs opacity-80">
                              <Clock className="h-3 w-3" />
                              <span>Zojuist</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* AI Response */}
                      <div className="flex justify-start">
                        <Card className={`max-w-4xl ${
                          darkMode 
                            ? 'bg-gray-800 border-gray-700' 
                            : 'bg-white'
                        }`}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                darkMode ? 'bg-blue-600' : 'bg-blue-100'
                              }`}>
                                <Bot className={`h-4 w-4 ${
                                  darkMode ? 'text-white' : 'text-blue-600'
                                }`} />
                              </div>
                              
                              <div className="flex-1">
                                {message.isLoading ? (
                                  <div className="flex items-center gap-2">
                                    <div className="flex space-x-1">
                                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                                        darkMode ? 'bg-gray-400' : 'bg-gray-400'
                                      }`} style={{ animationDelay: '0ms' }}></div>
                                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                                        darkMode ? 'bg-gray-400' : 'bg-gray-400'
                                      }`} style={{ animationDelay: '150ms' }}></div>
                                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                                        darkMode ? 'bg-gray-400' : 'bg-gray-400'
                                      }`} style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                    <span className={`text-sm ${
                                      darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                      WetHelder denkt na...
                                    </span>
                                  </div>
                                ) : (
                                  <>
                                    <div className="max-w-none">
                                      {formatTextWithLinks(message.answer, darkMode)}
                                    </div>
                                    
                                    {message.sources.length > 0 && (
                                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <p className={`text-sm font-medium mb-2 ${
                                          darkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                          📖 Nuttige bronnen:
                                        </p>
                                        {formatSourcesWithLinks(message.sources, darkMode)}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className={`border-t ${
            darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}>
            <div className="max-w-4xl mx-auto p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSubmit()
                }}
                className="flex gap-3"
              >
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef as any}
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit()
                      }
                    }}
                    placeholder="Stel uw juridische vraag... (Enter = verzenden)"
                    disabled={isLoading}
                    className={`pr-12 min-h-[44px] text-base ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-2"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button
                  type="submit"
                  disabled={!currentQuestion.trim() || isLoading}
                  className={`px-6 ${
                    darkMode 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              
              <p className={`text-xs text-center mt-2 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Instellingen
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Theme Setting */}
                <div>
                  <h3 className={`font-medium mb-3 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Thema
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant={!darkMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDarkMode(false)}
                      className="flex-1"
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Licht
                    </Button>
                    <Button
                      variant={darkMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDarkMode(true)}
                      className="flex-1"
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Donker
                    </Button>
                  </div>
                </div>

                {/* Default Profession */}
                <div>
                  <h3 className={`font-medium mb-3 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Standaard beroep
                  </h3>
                  <Select value={selectedProfession} onValueChange={setSelectedProfession}>
                    <SelectTrigger className={`${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={darkMode ? 'bg-gray-700 border-gray-600' : ''}>
                      {PROFESSIONS.map((profession) => (
                        <SelectItem key={profession.value} value={profession.value}>
                          <div className="flex items-center gap-2">
                            <span>{profession.icon}</span>
                            <span>{profession.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className={`text-sm mt-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Dit bepaalt hoe WetHelder antwoordt op uw vragen
                  </p>
                </div>

                {/* Account Section */}
                {session ? (
                  <div>
                    <h3 className={`font-medium mb-3 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Account
                    </h3>
                    <div className={`p-3 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Ingelogd als: {session.user?.email}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          signOut()
                          setShowSettings(false)
                        }}
                        className="mt-2"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Uitloggen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className={`font-medium mb-3 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Account
                    </h3>
                    <div className={`p-3 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <p className={`text-sm mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Log in om uw instellingen en geschiedenis op te slaan
                      </p>
                      <Button
                        onClick={() => {
                          signIn()
                          setShowSettings(false)
                        }}
                        size="sm"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Inloggen
                      </Button>
                    </div>
                  </div>
                )}

                {/* Data Management */}
                {session && (
                  <div>
                    <h3 className={`font-medium mb-3 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Gegevens
                    </h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          clearChatHistory()
                          setShowSettings(false)
                        }}
                        className="w-full justify-start"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Chatgeschiedenis wissen
                      </Button>
                    </div>
                  </div>
                )}

                {/* App Info */}
                <div className={`pt-4 border-t ${
                  darkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <p className={`text-xs ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    WetHelder v2.0 - Juridische AI-assistent voor Nederlandse wetgeving
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={() => setShowSettings(false)}
                  className="flex-1"
                >
                  Sluiten
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 