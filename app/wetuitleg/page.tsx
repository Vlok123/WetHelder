'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Scale, Search, Send, Loader2, Trash2, Copy, FileText, User, Shield, Gavel, Building, Info } from 'lucide-react'
import { BetaDisclaimer } from '@/components/ui/beta-disclaimer'
import Link from 'next/link'

type Profession = 'algemeen' | 'advocaat' | 'politieagent' | 'boa' | 'rechter' | 'notaris' | 'bedrijfsjurist' | 'gemeenteambtenaar'

const professionConfig = {
  algemeen: { label: 'Algemeen/Burger', icon: Info },
  advocaat: { label: 'Advocaat', icon: Scale },
  politieagent: { label: 'Politieagent', icon: Shield },
  boa: { label: 'BOA/Handhaver', icon: Shield },
  rechter: { label: 'Rechter/Magistraat', icon: Gavel },
  notaris: { label: 'Notaris', icon: FileText },
  bedrijfsjurist: { label: 'Bedrijfsjurist', icon: Building },
  gemeenteambtenaar: { label: 'Gemeenteambtenaar', icon: Building }
}

interface ChatMessage {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
  isLoading?: boolean
}

function WetUitlegPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [profession, setProfession] = useState<Profession>('algemeen')
  const [isLoading, setIsLoading] = useState(false)
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wetHelder_wetuitleg_messages')
    if (saved) {
      try {
        const parsedMessages = JSON.parse(saved).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(parsedMessages)
      } catch (error) {
        console.error('Error loading messages:', error)
        localStorage.removeItem('wetHelder_wetuitleg_messages')
      }
    }
  }, [])

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('wetHelder_wetuitleg_messages', JSON.stringify(messages))
    }
  }, [messages])

  // Check rate limit
  useEffect(() => {
    const checkRateLimit = async () => {
      if (!session) {
        try {
          const response = await fetch('/api/wetuitleg')
          if (response.ok) {
            const data = await response.json()
            setRemainingQuestions(data.remainingQuestions)
          }
        } catch (error) {
          console.error('Error checking rate limit:', error)
        }
      }
    }
    checkRateLimit()
  }, [session])

  const submitQuery = useCallback(async (query: string) => {
    if (!query.trim() || isLoading) return

    const trimmedQuery = query.trim()
    setInput('')
    setIsLoading(true)

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString() + '_user',
      text: trimmedQuery,
      isUser: true,
      timestamp: new Date()
    }

    // Add loading assistant message
    const assistantMessage: ChatMessage = {
      id: Date.now().toString() + '_assistant',
      text: '',
      isUser: false,
      timestamp: new Date(),
      isLoading: true
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])

    try {
      // Build conversation history
      const history = messages.slice(-8).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }))

      const response = await fetch('/api/wetuitleg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: trimmedQuery,
          history: history,
          profession: profession
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      let accumulatedContent = ''
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6)
            if (dataStr === '[DONE]') break
            
            try {
              const data = JSON.parse(dataStr)
              if (data.content) {
                accumulatedContent += data.content
                
                // Update assistant message
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessage.id 
                    ? { ...msg, text: accumulatedContent, isLoading: false }
                    : msg
                ))
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Update rate limit for anonymous users
      if (!session) {
        setRemainingQuestions(prev => prev !== null ? Math.max(0, prev - 1) : null)
      }

    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { 
              ...msg, 
              text: 'Er is een fout opgetreden. Probeer het opnieuw.',
              isLoading: false
            }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, messages, session, profession])

  // Handle URL query
  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery && messages.length === 0) {
      setInput(urlQuery)
      setTimeout(() => {
        if (!isLoading) {
          submitQuery(urlQuery)
        }
      }, 500)
    }
  }, [searchParams, messages.length, isLoading, submitQuery])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitQuery(input)
  }

  const clearMessages = () => {
    setMessages([])
    localStorage.removeItem('wetHelder_wetuitleg_messages')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatMessage = (text: string) => {
    // Detect **WETTEKST:** pattern and format it nicely
    const wettekstMatch = text.match(/\*\*WETTEKST:\*\*([\s\S]*?)(?=\n\n|\*\*|$)/)
    
    if (wettekstMatch) {
      const wettekstContent = wettekstMatch[1].trim()
      const restContent = text.replace(wettekstMatch[0], '').trim()
      
      return (
        <div className="space-y-4">
          {/* Wettekst box */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-900 text-sm">Wettekst</span>
            </div>
            <div className="bg-white p-3 rounded border text-sm font-mono text-gray-900 whitespace-pre-line leading-relaxed">
              {wettekstContent}
            </div>
          </div>
          
          {/* Rest of content */}
          {restContent && (
            <div className="text-sm text-gray-800 space-y-3 leading-relaxed">
              {restContent.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>
      )
    }
    
    // Regular message formatting
    return (
      <div className="text-sm text-gray-800 space-y-3 leading-relaxed">
        {text.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2 flex items-center gap-3">
            <Scale className="h-8 w-8 text-blue-600" />
            Wetuitleg
          </h1>
          <p className="text-gray-600">
            Snelle juridische uitleg van Nederlandse wetsartikelen
          </p>
        </div>

        {/* Rate limit info */}
        {!session && remainingQuestions !== null && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              {remainingQuestions === 0 ? (
                <>
                  Je hebt het maximum aantal gratis vragen (4 per dag) bereikt.{' '}
                  <Link href="/auth/signin" className="underline hover:no-underline">
                    Log in voor onbeperkt gebruik
                  </Link>
                </>
              ) : (
                <>
                  Nog {remainingQuestions} gratis {remainingQuestions === 1 ? 'vraag' : 'vragen'} over.{' '}
                  <Link href="/auth/signin" className="underline hover:no-underline">
                    Log in voor onbeperkt gebruik
                  </Link>
                </>
              )}
            </p>
          </div>
        )}

        {/* Chat Messages */}
        <div className="space-y-4 mb-6 min-h-[400px]">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Stel een vraag over Nederlandse wetgeving</p>
              <p className="text-sm text-gray-400 mt-2">
                Bijvoorbeeld: &quot;Wat zegt artikel 318 Sr?&quot; of &quot;Leg artikel 27 Sv uit&quot;
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                {!message.isUser && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Scale className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.isUser 
                    ? 'bg-blue-500 text-white rounded-br-md' 
                    : 'bg-white border border-gray-200 rounded-tl-md shadow-sm'
                }`}>
                  {message.isUser ? (
                    <div>
                      <div className="text-xs opacity-75 mb-1">
                        {message.timestamp.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <p className="text-sm">{message.text}</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">WetHelder</span>
                          <span className="text-xs text-gray-500">
                            {message.timestamp.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {!message.isLoading && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(message.text)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      
                      {message.isLoading ? (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Analyseren...</span>
                        </div>
                      ) : (
                        formatMessage(message.text)
                      )}
                    </div>
                  )}
                </div>

                {message.isUser && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <Card className="sticky bottom-4 shadow-lg">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Profession Selector */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Profiel:
                </label>
                <Select value={profession} onValueChange={(value: Profession) => setProfession(value)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue>
                      {(() => {
                        const IconComponent = professionConfig[profession].icon
                        return (
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {professionConfig[profession].label}
                          </div>
                        )
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(professionConfig).map(([key, config]) => {
                      const IconComponent = config.icon
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {messages.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearMessages}
                    className="ml-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Wissen
                  </Button>
                )}
              </div>
              
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Bijv: Wat zegt artikel 318 Sr? of Leg artikel 27 Sv uit..."
                  className="flex-1"
                  disabled={isLoading || (!session && remainingQuestions === 0)}
                />
                <Button 
                  type="submit" 
                  disabled={!input.trim() || isLoading || (!session && remainingQuestions === 0)}
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              {messages.length > 0 && (
                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearMessages}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Wis gesprek
                  </Button>
                  
                  <p className="text-xs text-gray-500">
                    Voor uitgebreide uitleg van Nederlandse wetsartikelen
                  </p>
                </div>
              )}
            </form>
            
            {/* Beta Disclaimer */}
            <div className="mt-4">
              <BetaDisclaimer variant="wetuitleg" />
            </div>
            
            {/* Juridische Informatie Disclaimer */}
            <div className="mt-3 px-3 py-2 bg-blue-50/30 rounded-lg border border-blue-100">
              <div className="flex items-start gap-2 text-xs text-blue-700">
                <Info className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="leading-relaxed">
                  <span className="font-medium">Juridische Informatie:</span>
                  <span className="ml-1">
                    WetHelder biedt juridische informatie, maar vervangt geen persoonlijk advies van een juridisch professional. Voor complexe casussen raadpleeg altijd een advocaat, notaris of andere gekwalificeerde professional.
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function WetUitlegPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">WetUitleg wordt geladen...</p>
        </div>
      </div>
    }>
      <WetUitlegPage />
    </Suspense>
  )
} 