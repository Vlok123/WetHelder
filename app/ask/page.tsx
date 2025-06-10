'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Navigation } from '@/components/navigation'
import { Send, Clock, AlertTriangle, FileText } from 'lucide-react'

interface Message {
  id: string
  question: string
  answer: string
  sources: string[]
  isLoading?: boolean
}

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

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
        body: JSON.stringify({ question: input.trim() }),
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
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Navigation />
      
      <main className="mt-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Nederlandse wetgeving doorzoeken</h1>
          
          {isLoading && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="font-medium text-blue-900">Bezig met zoeken in Nederlandse wetgeving...</p>
                    <p className="text-sm text-blue-700 flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      Dit kan 10-30 seconden duren voor een volledig antwoord
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="space-y-6 mb-8">
            {messages.map((message) => (
              <Card key={message.id} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Vraag:</h3>
                      <p className="text-muted-foreground">{message.question}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Antwoord:</h3>
                      {message.isLoading ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-muted-foreground">Zoeken in wetgeving...</span>
                          </div>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                              <div className="text-sm text-yellow-800">
                                <p className="font-medium">Een moment geduld</p>
                                <p>We doorzoeken Nederlandse wetten en jurisprudentie voor een compleet antwoord. Dit proces kan 10-30 seconden duren.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        formatText(message.answer)
                      )}
                    </div>
                    
                    {message.sources.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Bronnen:</h3>
                        <ul className="space-y-1">
                          {message.sources.map((source, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <a 
                                href={source} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline break-all"
                              >
                                {source}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Stel een vraag over Nederlandse wetgeving..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
} 