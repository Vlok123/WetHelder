'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Send, RotateCcw, Settings, Users, Scale, Shield, GraduationCap, Briefcase } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatSettings {
  profession: string
  wetUitleg: boolean
  wetgeving: boolean
}

const professionProfiles = [
  {
    id: 'algemeen',
    name: 'Algemeen/Burger',
    description: 'Voor alle burgers met juridische vragen',
    icon: Users,
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    id: 'jurist',
    name: 'Jurist/Advocaat',
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
    name: 'BOA',
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
    id: 'ondernemer',
    name: 'Ondernemer',
    description: 'Ondernemingsrecht en compliance',
    icon: Briefcase,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  }
]

// localStorage key for chat history
const CHAT_HISTORY_KEY = 'wethelder-chat-history'

// Save messages to localStorage
const saveChatHistory = (messages: ChatMessage[]) => {
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages))
  } catch (error) {
    console.error('Failed to save chat history:', error)
  }
}

// Load messages from localStorage
const loadChatHistory = (): ChatMessage[] => {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Convert timestamp strings back to Date objects
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }
  } catch (error) {
    console.error('Failed to load chat history:', error)
  }
  return []
}

// Advanced text formatter designed for legal content
const formatLegalText = (text: string) => {
  if (!text?.trim()) return null

  // Split into logical sections
  const sections = text
    .split(/\n\s*\n+/)
    .filter(section => section.trim().length > 0)
    .map(section => section.trim())

  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        // Check for different content types
        if (section.length < 100) {
          // Short section - likely a header or key point
          return (
            <div key={index} className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
              <p className="font-semibold text-blue-900">{section}</p>
            </div>
          )
        }
        
        // Check if this is a legal article or reference
        if (section.includes('artikel') || section.includes('wet') || section.includes('BW') || section.includes('Awb')) {
          return (
            <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⚖️</span>
                <span className="font-semibold text-yellow-800">Wettelijke Bepaling</span>
              </div>
              <p className="text-gray-800 leading-relaxed">{section}</p>
            </div>
          )
        }
        
        // Check if this is a numbered list or steps
        if (section.match(/^\d+\./)) {
          const items = section.split(/(?=\d+\.)/g).filter(item => item.trim())
          return (
            <div key={index} className="space-y-3">
              {items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-1">
                    {itemIndex + 1}
                  </div>
                  <p className="text-gray-800 leading-relaxed flex-1">{item.replace(/^\d+\.\s*/, '')}</p>
                </div>
              ))}
            </div>
          )
        }
        
        // Regular paragraph
        return (
          <p key={index} className="text-gray-800 leading-relaxed text-lg">
            {section}
          </p>
        )
      })}
    </div>
  )
}

function ChatPageContent() {
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null)
  const [userRole, setUserRole] = useState<string>('ANONYMOUS')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize settings from URL parameters
  const [settings, setSettings] = useState<ChatSettings>({
    profession: searchParams.get('profile') || 'algemeen',
    wetUitleg: searchParams.get('wetuitleg') === 'true',
    wetgeving: searchParams.get('wetgeving') === 'true'
  })

  // Load chat history on mount
  useEffect(() => {
    const history = loadChatHistory()
    setMessages(history)
  }, [])

  // Check rate limit status
  useEffect(() => {
    const checkRateLimit = async () => {
      try {
        const response = await fetch('/api/ask', { method: 'GET' })
        const data = await response.json()
        setRemainingQuestions(data.remainingQuestions)
        setUserRole(data.userRole)
      } catch (error) {
        console.error('Failed to check rate limit:', error)
      }
    }
    checkRateLimit()
  }, [])

  // Save chat history whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages)
    }
  }, [messages])

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Process initial query from URL if present
  useEffect(() => {
    const initialQuery = searchParams.get('q')
    if (initialQuery && messages.length === 0) {
      setInput(initialQuery)
    }
  }, [searchParams, messages.length])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Prepare conversation history for API (only role and content, no timestamp/id)
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage.content,
          profession: settings.profession,
          wetUitleg: settings.wetUitleg,
          wetgeving: settings.wetgeving,
          history: conversationHistory
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMessage.id
                    ? { ...msg, content: msg.content + data.content }
                    : msg
                ))
              }
              // Update remaining questions if provided
              if (data.remainingQuestions !== undefined) {
                setRemainingQuestions(data.remainingQuestions)
              }
            } catch (e) {
              console.error('Error parsing streaming data:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, er is een fout opgetreden bij het verwerken van uw vraag. Probeer het opnieuw.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
      // Refresh rate limit status after question
      if (userRole === 'ANONYMOUS') {
        try {
          const response = await fetch('/api/ask', { method: 'GET' })
          const data = await response.json()
          setRemainingQuestions(data.remainingQuestions)
        } catch (error) {
          console.error('Failed to refresh rate limit:', error)
        }
      }
    }
  }

  const clearChat = () => {
    setMessages([])
    // Also clear from localStorage
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY)
    } catch (error) {
      console.error('Failed to clear chat history:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const currentProfile = professionProfiles.find(p => p.id === settings.profession) || professionProfiles[0]
  const ProfileIcon = currentProfile.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Settings Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" />
                  Chat Instellingen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Profile */}
                <div>
                  <label className="block text-sm font-medium mb-2">Actief Profiel</label>
                  <div className={`p-3 rounded-lg ${currentProfile.color} border`}>
                    <div className="flex items-center gap-2">
                      <ProfileIcon className="h-5 w-5" />
                      <div>
                        <div className="font-semibold text-sm">{currentProfile.name}</div>
                        <div className="text-xs opacity-75">{currentProfile.description}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profession Selector */}
                <div>
                  <label className="block text-sm font-medium mb-2">Wijzig Profiel</label>
                  <Select value={settings.profession} onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, profession: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {professionProfiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Feature toggles */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <Checkbox 
                      checked={settings.wetUitleg} 
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, wetUitleg: checked }))
                      }
                    />
                    <div>
                      <div className="text-sm font-medium">Wet & Uitleg</div>
                      <div className="text-xs text-gray-500">Uitgebreide uitleg bij wetsartikelen</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3">
                    <Checkbox 
                      checked={settings.wetgeving} 
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, wetgeving: checked }))
                      }
                    />
                    <div>
                      <div className="text-sm font-medium">Wetteksten zoeken</div>
                      <div className="text-xs text-gray-500">Zoek in officiële wetteksten</div>
                    </div>
                  </label>
                </div>

                {/* Rate Limit Status */}
                {userRole === 'ANONYMOUS' && remainingQuestions !== null && (
                  <div className="p-3 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">👤</span>
                      <span className="font-semibold text-sm text-blue-800">Gastgebruiker</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-blue-700">Vragen over:</span>
                        <span className="font-bold text-sm text-blue-800">
                          {remainingQuestions} van 4
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                          style={{ width: `${(remainingQuestions / 4) * 100}%` }}
                        ></div>
                      </div>
                      {remainingQuestions <= 1 && (
                        <div className="text-xs text-blue-700 mt-2">
                          💡 <strong>Maak een gratis account</strong> aan voor onbeperkt vragen!
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {userRole !== 'ANONYMOUS' && (
                  <div className="p-3 rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✅</span>
                      <span className="font-semibold text-sm text-green-800">Account gebruiker</span>
                    </div>
                    <div className="text-xs text-green-700 mt-1">
                      Onbeperkt vragen stellen!
                    </div>
                  </div>
                )}

                {/* Chat actions */}
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearChat}
                    className="w-full"
                    disabled={messages.length === 0}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Chat wissen
                  </Button>
                  {messages.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {messages.length} berichten in gesprek
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-200px)] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">⚖️</span>
                    WetHelder Chat
                    {messages.length > 0 && (
                      <Badge variant="outline" className="ml-2">
                        Gesprek actief
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {settings.wetUitleg && (
                      <Badge variant="secondary" className="text-xs">
                        Wet & Uitleg
                      </Badge>
                    )}
                    {settings.wetgeving && (
                      <Badge variant="secondary" className="text-xs">
                        Wetteksten
                      </Badge>
                    )}
                    <Badge className={currentProfile.color}>
                      <ProfileIcon className="h-3 w-3 mr-1" />
                      {currentProfile.name}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <div className="text-6xl mb-4">⚖️</div>
                    <h3 className="text-xl font-semibold mb-2">Welkom bij WetHelder Chat</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Stel uw juridische vraag en krijg direct professioneel antwoord gebaseerd op Nederlandse wetgeving.
                    </p>
                    <div className="mt-6 text-sm text-gray-500">
                      <p>Configuratie: <strong>{currentProfile.name}</strong></p>
                      {settings.wetUitleg && <p>✓ Met uitgebreide uitleg</p>}
                      {settings.wetgeving && <p>✓ Met wetteksten zoeken</p>}
                      <p className="mt-2 text-xs">💡 Uw gesprekgeschiedenis wordt automatisch bewaard</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-4xl ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'} rounded-2xl p-4 shadow-sm`}>
                        {message.role === 'user' ? (
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        ) : (
                          <div className="prose prose-sm max-w-none">
                            {formatLegalText(message.content)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {messages.length > 0 ? 'WetHelder analyseert uw vervolgvraag...' : 'WetHelder analyseert uw vraag...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={messages.length > 0 ? "Stel een vervolgvraag..." : "Stel uw juridische vraag..."}
                    className="flex-1 text-base"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!input.trim() || isLoading}
                    size="lg"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Press Enter om te verzenden • Shift+Enter voor nieuwe regel
                  {messages.length > 0 && " • Uw gesprekgeschiedenis wordt meegenomen"}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Laden...</p>
      </div>
    </div>}>
      <ChatPageContent />
    </Suspense>
  )
} 