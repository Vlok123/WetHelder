'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Scale, 
  Search, 
  Send, 
  Loader2, 
  ExternalLink, 
  BookOpen, 
  Gavel, 
  FileText, 
  Copy, 
  Share2,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'
import Link from 'next/link'

interface LegalAnalysis {
  id: string
  query: string
  articleText: string
  officialLink: string
  summary: string
  explanation: string
  practicalApplication: string
  jurisprudence: string
  relatedArticles: string
  sources: string[]
  timestamp: Date
  isLoading?: boolean
  type: 'user' | 'assistant'
  fullResponse?: string // Store the complete response for conversation context
}

export default function WetUitlegPage() {
  const { data: session } = useSession()
  const [analyses, setAnalyses] = useState<LegalAnalysis[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [analyses])

  // Load conversation from localStorage on mount
  useEffect(() => {
    const savedAnalyses = localStorage.getItem('wetHelder_wetuitleg_conversation')
    
    if (savedAnalyses) {
      try {
        const parsedAnalyses = JSON.parse(savedAnalyses)
        // Validate and restore analyses
        const validAnalyses = parsedAnalyses.filter((analysis: any) => 
          analysis.id && analysis.query && analysis.timestamp
        ).map((analysis: any) => ({
          ...analysis,
          timestamp: new Date(analysis.timestamp)
        }))
        setAnalyses(validAnalyses)
      } catch (error) {
        console.error('Error loading wetuitleg conversation:', error)
        localStorage.removeItem('wetHelder_wetuitleg_conversation')
      }
    }
  }, [])

  // Save conversation to localStorage whenever analyses change
  useEffect(() => {
    if (analyses.length > 0) {
      localStorage.setItem('wetHelder_wetuitleg_conversation', JSON.stringify(analyses))
    }
  }, [analyses])

  // Check rate limit status on page load
  useEffect(() => {
    const checkRateLimit = async () => {
      if (!session) {
        try {
          const response = await fetch('/api/wetuitleg', {
            method: 'GET',
          })
          
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const query = input.trim()
    setInput('')
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    setIsLoading(true)

    // Create temporary analysis with loading state
    const tempAnalysis: LegalAnalysis = {
      id: Date.now().toString(),
      query,
      articleText: '',
      officialLink: '',
      summary: '',
      explanation: '',
      practicalApplication: '',
      jurisprudence: '',
      relatedArticles: '',
      sources: [],
      timestamp: new Date(),
      isLoading: true,
      type: 'assistant',
      fullResponse: ''
    }

    setAnalyses(prev => [...prev, tempAnalysis])

    try {
      // Build conversation history for API (last 10 analyses)
      const userMessages = analyses.slice(-10).map(analysis => ({
        role: 'user' as const,
        content: analysis.query
      }))
      
      const assistantMessages = analyses.slice(-10).filter(analysis => analysis.fullResponse).map(analysis => ({
        role: 'assistant' as const,
        content: analysis.fullResponse || ''
      }))
      
      const conversationHistory = [...userMessages, ...assistantMessages]

      // Add timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        throw new Error('Request timeout - response took too long')
      }, 30000) // 30 second timeout

      const response = await fetch('/api/wetuitleg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          history: conversationHistory 
        }),
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error('Failed to get analysis')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      let accumulatedContent = ''
      let lastUpdateTime = Date.now()
      const decoder = new TextDecoder()
      const readerTimeout = 45000 // 45 seconds for reading

      const startTime = Date.now()
      
      while (true) {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Stream reading timeout')), readerTimeout)
        })
        
        const readPromise = reader.read()
        
        try {
          const { done, value } = await Promise.race([readPromise, timeoutPromise]) as any
          
          if (done) {
            console.log('✅ Stream completed, total time:', Date.now() - startTime, 'ms')
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          if (chunk) {
            accumulatedContent += chunk
            lastUpdateTime = Date.now()

            // Update the analysis with accumulated content
            setAnalyses(prev => prev.map(analysis => 
              analysis.id === tempAnalysis.id 
                ? { ...analysis, isLoading: false, fullResponse: accumulatedContent, ...parseAnalysisContent(accumulatedContent) }
                : analysis
            ))
          }
        } catch (timeoutError) {
          console.error('❌ Stream timeout:', timeoutError)
          if (accumulatedContent.length === 0) {
            throw new Error('No response received - request timed out')
          }
          break // If we have some content, continue with what we have
        }
      }

      // Update remaining questions if not logged in
      if (!session) {
        setRemainingQuestions(prev => prev !== null ? Math.max(0, prev - 1) : null)
      }

    } catch (error) {
      console.error('Error:', error)
      setAnalyses(prev => prev.map(analysis => 
        analysis.id === tempAnalysis.id 
          ? { 
              ...analysis, 
              isLoading: false,
              summary: 'Er is een fout opgetreden bij het ophalen van de wetsuitleg. Probeer het opnieuw.',
              sources: []
            }
          : analysis
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const parseAnalysisContent = (content: string) => {
    // Parse the structured response from the API with fallbacks
    const sections = {
      articleText: extractSection(content, 'WETSARTIKEL:', 'LINK:') || extractSection(content, '**WETSARTIKEL:**', '**LINK:**'),
      officialLink: extractSection(content, 'LINK:', 'SAMENVATTING:') || extractSection(content, '**LINK:**', '**SAMENVATTING:**'),
      summary: extractSection(content, 'SAMENVATTING:', 'TOELICHTING:') || extractSection(content, '**SAMENVATTING:**', '**TOELICHTING:**'),
      explanation: extractSection(content, 'TOELICHTING:', 'PRAKTIJK:') || extractSection(content, '**TOELICHTING:**', '**PRAKTIJK:**'),
      practicalApplication: extractSection(content, 'PRAKTIJK:', 'JURISPRUDENTIE:') || extractSection(content, '**PRAKTIJK:**', '**JURISPRUDENTIE:**'),
      jurisprudence: extractSection(content, 'JURISPRUDENTIE:', 'VERWANTE ARTIKELEN:') || extractSection(content, '**JURISPRUDENTIE:**', '**VERWANTE ARTIKELEN:**'),
      relatedArticles: extractSection(content, 'VERWANTE ARTIKELEN:', 'BRONNEN:') || extractSection(content, '**VERWANTE ARTIKELEN:**', '**BRONNEN:**'),
      sources: extractSources(content)
    }

    return sections
  }

  const extractSection = (content: string, startMarker: string, endMarker: string): string => {
    const startIndex = content.indexOf(startMarker)
    if (startIndex === -1) return ''
    
    const contentStart = startIndex + startMarker.length
    const endIndex = content.indexOf(endMarker, contentStart)
    
    let extractedContent = ''
    if (endIndex === -1) {
      extractedContent = content.substring(contentStart).trim()
    } else {
      extractedContent = content.substring(contentStart, endIndex).trim()
    }
    
         // Clean up any remaining **markers that weren't part of proper formatting
     extractedContent = extractedContent
       .replace(/^\*\*|\*\*$/g, '') // Remove ** at start/end
       .replace(/\*\*\s*\*\*/g, '') // Remove empty ** pairs
       .replace(/\*\*([A-Z\s]+):\*\*/g, '') // Remove section headers like **TITEL:**
       .trim()
     
     return extractedContent
  }

  const extractSources = (content: string): string[] => {
    const sourcesSection = extractSection(content, 'BRONNEN:', '')
    if (!sourcesSection) return []
    
    return sourcesSection.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && (line.startsWith('http') || line.includes('wetten.overheid.nl') || line.includes('rechtspraak.nl')))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const shareAnalysis = (query: string, content: string) => {
    if (navigator.share) {
      navigator.share({
        title: `WetHelder - ${query}`,
        text: content,
        url: window.location.href
      })
    }
  }

  const clearAnalyses = () => {
    setAnalyses([])
    localStorage.removeItem('wetHelder_wetuitleg_conversation')
  }

  const formatText = (text: string): React.ReactElement => {
    if (!text) return <div></div>

         // Clean up and preprocess the text  
     const processedText = text
       // Remove all section headers that might appear in content
       .replace(/\*\*(SAMENVATTING|WETSARTIKEL|LINK|TOELICHTING|PRAKTIJK|JURISPRUDENTIE|VERWANTE ARTIKELEN|BRONNEN):\*\*/g, '') 
       // Remove standalone ** without content
       .replace(/\*\*\s*\*\*/g, '')
       // Remove ** at start/end of lines
       .replace(/^\*\*|\*\*$/gm, '')
       // Convert remaining **text** to bold
       .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>') 
       // Convert headers
       .replace(/### (.*?)(?=\n|$)/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900">$1</h3>') 
       // Convert markdown links
       .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline hover:no-underline">$1</a>') 
       // Clean up any remaining double spaces
       .replace(/\s+/g, ' ')
       .trim()
    
    const lines = processedText.split('\n')
    const elements: React.ReactNode[] = []
    let key = 0

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      if (trimmedLine) {
        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
          // List items with rich formatting
          const listContent = trimmedLine.substring(2)
          elements.push(
            <div key={key++} className="flex items-start gap-3 mb-2">
              <span className="text-blue-600 text-sm flex-shrink-0 mt-2">•</span>
              <div 
                className="text-gray-800 leading-relaxed flex-1" 
                dangerouslySetInnerHTML={{ __html: listContent }}
              />
            </div>
          )
        } else if (trimmedLine.includes('<h3') || trimmedLine.includes('<strong>') || trimmedLine.includes('<a href')) {
          // Lines with HTML formatting
          elements.push(
            <div 
              key={key++} 
              className="mb-3 leading-relaxed" 
              dangerouslySetInnerHTML={{ __html: trimmedLine }} 
            />
          )
        } else {
          // Regular paragraphs
          elements.push(
            <p key={key++} className="text-gray-800 leading-relaxed mb-3">
              {trimmedLine}
            </p>
          )
        }
      } else if (index < lines.length - 1) {
        // Add spacing for empty lines
        elements.push(<div key={key++} className="h-2" />)
      }
    })

    return <div className="space-y-1">{elements}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Scale className="h-8 w-8 text-blue-600" />
                Wetteksten
              </h1>
              <p className="text-gray-600">
                Uitgebreide juridische uitleg van Nederlandse wetsartikelen
              </p>
            </div>
          </div>

          {/* Rate limit info for anonymous users */}
          {!session && remainingQuestions !== null && (
            <div className={`mb-4 p-3 border rounded-lg ${
              remainingQuestions === 0 
                ? 'bg-red-50 border-red-200' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <p className={`text-sm ${
                remainingQuestions === 0 ? 'text-red-800' : 'text-amber-800'
              }`}>
                <Info className="h-4 w-4 inline mr-1" />
                {remainingQuestions === 0 ? (
                  <>
                    Je hebt het maximum aantal gratis analyses (4 per dag) bereikt.{' '}
                    <Link href="/auth/signin" className={`ml-1 underline hover:no-underline ${
                      remainingQuestions === 0 ? 'text-red-900' : 'text-amber-900'
                    }`}>
                      Log in voor onbeperkt gebruik
                    </Link>
                  </>
                ) : (
                  <>
                    Nog {remainingQuestions} gratis {remainingQuestions === 1 ? 'analyse' : 'analyses'} over.{' '}
                    <Link href="/auth/signin" className="ml-1 text-amber-900 underline hover:no-underline">
                      Log in voor onbeperkt gebruik
                    </Link>
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Analyses */}
        <div className="space-y-6 mb-6">
          {analyses.map((analysis) => (
            <div key={analysis.id} className="space-y-4">
              {/* User Query */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Search className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 bg-white rounded-lg p-4 shadow-sm border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">Je vraag</span>
                    <Badge variant="secondary" className="text-xs">
                      Wetteksten
                    </Badge>
                  </div>
                  <p className="text-gray-800">{analysis.query}</p>
                </div>
              </div>

              {/* WetHelder Analysis */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Scale className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 bg-white rounded-lg p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-gray-900">WetHelder Analyse</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${analysis.summary}\n\n${analysis.explanation}`)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => shareAnalysis(analysis.query, analysis.summary)}
                        className="h-8 w-8 p-0"
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {analysis.isLoading ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Analyseren van wetsartikel...</span>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Article Text */}
                      {analysis.articleText && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="font-semibold text-blue-900 mb-2">Wetsartikel</h3>
                              <div className="text-blue-800 leading-relaxed">
                                {formatText(analysis.articleText)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Official Link */}
                      {analysis.officialLink && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-blue-600" />
                            <div className="text-gray-800 leading-relaxed">
                              {formatText(analysis.officialLink)}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Summary */}
                      {analysis.summary && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Samenvatting
                          </h3>
                          <div className="prose prose-sm max-w-none">
                            {formatText(analysis.summary)}
                          </div>
                        </div>
                      )}

                      {/* Explanation */}
                      {analysis.explanation && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                            Toelichting & Bijzonderheden
                          </h3>
                          <div className="prose prose-sm max-w-none">
                            {formatText(analysis.explanation)}
                          </div>
                        </div>
                      )}

                      {/* Practical Application */}
                      {analysis.practicalApplication && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-orange-600" />
                            Toepassing in de Praktijk
                          </h3>
                          <div className="prose prose-sm max-w-none">
                            {formatText(analysis.practicalApplication)}
                          </div>
                        </div>
                      )}

                      {/* Jurisprudence */}
                      {analysis.jurisprudence && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Gavel className="h-5 w-5 text-purple-600" />
                            Relevante Jurisprudentie
                          </h3>
                          <div className="prose prose-sm max-w-none">
                            {formatText(analysis.jurisprudence)}
                          </div>
                        </div>
                      )}

                      {/* Related Articles */}
                      {analysis.relatedArticles && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            Verwante Wetsartikelen
                          </h3>
                          <div className="prose prose-sm max-w-none">
                            {formatText(analysis.relatedArticles)}
                          </div>
                        </div>
                      )}

                      {/* Sources */}
                      {analysis.sources.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Bronnen</h3>
                          <div className="space-y-1">
                            {analysis.sources.map((source, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <ExternalLink className="h-3 w-3 text-gray-400" />
                                <a 
                                  href={source} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800 underline hover:no-underline"
                                >
                                  {source}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <Card className="sticky bottom-6 shadow-lg border-2">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Question Input */}
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Bijvoorbeeld: Geef mij een volledige juridische uitleg van artikel 96b van het Wetboek van Strafvordering. Stel ook vervolgvragen!"
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim() || (!session && remainingQuestions === 0)}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Clear Button */}
              {analyses.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAnalyses}
                    className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    title="Wis alle analyses van dit gesprek"
                  >
                    <Scale className="h-4 w-4 mr-1" />
                    Wis gesprek
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
} 