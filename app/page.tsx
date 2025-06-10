'use client'

import { useState, useRef, useEffect } from 'react'
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
  ChevronRight
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
}

// Quick action suggestions
const QUICK_ACTIONS = [
  { text: "Wat zijn mijn rechten als huurder?", category: "Huurrecht" },
  { text: "Hoe stel ik een arbeidscontract op?", category: "Arbeidsrecht" },
  { text: "Wat is het verschil tussen eigendom en erfpacht?", category: "Vastgoedrecht" },
  { text: "Welke stappen moet ik nemen bij echtscheiding?", category: "Familierecht" },
]

const LEGAL_CATEGORIES = [
  { name: "Arbeidsrecht", icon: "👔", count: 245 },
  { name: "Huurrecht", icon: "🏠", count: 189 },
  { name: "Familierecht", icon: "👨‍👩‍👧‍👦", count: 156 },
  { name: "Strafrecht", icon: "⚖️", count: 134 },
  { name: "Ondernemingsrecht", icon: "💼", count: 98 },
  { name: "Vastgoedrecht", icon: "🏢", count: 87 },
]

export default function ModernLegalChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [selectedProfession, setSelectedProfession] = useState('algemeen')
  const [isLoading, setIsLoading] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
      isLoading: true
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
            
            <Button variant="ghost" size="sm" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
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
              onClick={() => {
                setMessages([])
                setCurrentQuestion('')
                inputRef.current?.focus()
              }}
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
              <Button variant="ghost" className="w-full justify-start">
                <History className="h-4 w-4 mr-3" />
                Geschiedenis
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Bookmark className="h-4 w-4 mr-3" />
                Opgeslagen
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-3" />
                Instellingen
              </Button>
            </nav>

            {/* Legal Categories */}
            <div>
              <h3 className={`text-sm font-medium mb-3 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Rechtsgebieden
              </h3>
              <div className="space-y-1">
                {LEGAL_CATEGORIES.map((category) => (
                  <Button
                    key={category.name}
                    variant="ghost"
                    className="w-full justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
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
                    ref={inputRef}
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    placeholder="Stel uw juridische vraag..."
                    disabled={isLoading}
                    className={`pr-12 py-3 text-base ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
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
    </div>
  )
} 