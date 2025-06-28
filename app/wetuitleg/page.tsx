'use client'

import React, { useState, useRef, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Info,
  Shield,
  UserCheck,
  GraduationCap,
  Building,
  MapPin,
  Calculator,
  Home,
  Users,
  Heart,
  Trash2,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'

// Add profession types and config
type Profession = 'aspirant' | 'student' | 'politieagent' | 'advocaat' | 'algemeen' | 'boa' | 'rechter' | 'notaris' | 'deurwaarder' | 'bedrijfsjurist' | 'gemeenteambtenaar' | 'belastingadviseur' | 'accountant' | 'makelaar' | 'verzekeringsagent' | 'hr-medewerker' | 'compliance-officer' | 'veiligheidsbeambte' | 'beveiliger' | 'gemeentejurist' | 'trainer' | 'vervoersmedewerker' | 'zorgprofessional'

const professionConfig = {
  algemeen: {
    icon: Info,
    label: 'Algemeen/Burger',
    color: 'text-gray-700 bg-gray-50 border-gray-200',
    description: 'Gericht op begrijpelijke juridische informatie voor iedereen'
  },
  advocaat: {
    icon: Scale,
    label: 'Advocaat',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    description: 'Gericht op procesrecht, verdedigingsstrategieën en jurisprudentie'
  },
  politieagent: {
    icon: Shield,
    label: 'Politieagent',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    description: 'Gericht op praktische bevoegdheden en handhavingsprocedures'
  },
  boa: {
    icon: Shield,
    label: 'BOA / Handhaver',
    color: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    description: 'Gericht op toezichtsbevoegdheden en APV-handhaving'
  },
  rechter: {
    icon: Gavel,
    label: 'Rechter',
    color: 'text-red-700 bg-red-50 border-red-200',
    description: 'Gericht op procesrecht, bewijsrecht en uitspraakvorming'
  },
  notaris: {
    icon: FileText,
    label: 'Notaris',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    description: 'Gericht op burgerlijk recht en notariële praktijk'
  },
  deurwaarder: {
    icon: FileText,
    label: 'Deurwaarder',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    description: 'Gericht op executierecht en beslagprocedures'
  },
  bedrijfsjurist: {
    icon: Building,
    label: 'Bedrijfsjurist',
    color: 'text-slate-700 bg-slate-50 border-slate-200',
    description: 'Gericht op ondernemingsrecht en compliance-vraagstukken'
  },
  gemeenteambtenaar: {
    icon: MapPin,
    label: 'Gemeenteambtenaar',
    color: 'text-green-700 bg-green-50 border-green-200',
    description: 'Gericht op bestuursrecht en lokale verordeningen'
  },
  gemeentejurist: {
    icon: Building,
    label: 'Gemeentejurist',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    description: 'Gericht op gemeentelijk recht en bestuurlijke sancties'
  },
  belastingadviseur: {
    icon: Calculator,
    label: 'Belastingadviseur',
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    description: 'Gericht op fiscaal recht en belastingwetgeving'
  },
  accountant: {
    icon: Calculator,
    label: 'Accountant',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    description: 'Gericht op financieel recht en verslaggeving'
  },
  makelaar: {
    icon: Home,
    label: 'Makelaar',
    color: 'text-teal-700 bg-teal-50 border-teal-200',
    description: 'Gericht op vastgoedrecht en makelaarsrecht'
  },
  verzekeringsagent: {
    icon: Shield,
    label: 'Verzekeringsagent',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    description: 'Gericht op verzekeringsrecht en aansprakelijkheid'
  },
  'hr-medewerker': {
    icon: Users,
    label: 'HR-medewerker',
    color: 'text-pink-700 bg-pink-50 border-pink-200',
    description: 'Gericht op arbeidsrecht en personeelsbeleid'
  },
  'compliance-officer': {
    icon: CheckCircle,
    label: 'Compliance Officer',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    description: 'Gericht op toezichtrecht en compliance-procedures'
  },
  veiligheidsbeambte: {
    icon: Shield,
    label: 'Veiligheidsbeambte',
    color: 'text-red-700 bg-red-50 border-red-200',
    description: 'Gericht op veiligheidsrecht en preventieve maatregelen'
  },
  beveiliger: {
    icon: Shield,
    label: 'Beveiliger',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    description: 'Gericht op private beveiliging en eigendomsbescherming'
  },
  trainer: {
    icon: GraduationCap,
    label: 'Trainer / Opleider',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    description: 'Gericht op educatieve en gestructureerde juridische uitleg'
  },
  vervoersmedewerker: {
    icon: Users,
    label: 'Vervoersmedewerker',
    color: 'text-green-700 bg-green-50 border-green-200',
    description: 'Gericht op vervoersrecht en OV-bevoegdheden'
  },
  zorgprofessional: {
    icon: Heart,
    label: 'Zorgprofessional',
    color: 'text-pink-700 bg-pink-50 border-pink-200',
    description: 'Gericht op zorgrecht en privacy-regelgeving'
  },
  aspirant: {
    icon: UserCheck,
    label: 'Aspirant',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    description: 'Gericht op uitgebreide uitleg met praktijkvoorbeelden'
  },
  student: {
    icon: GraduationCap,
    label: 'Student',
    color: 'text-green-700 bg-green-50 border-green-200',
    description: 'Gestructureerde uitleg met tentamentips'
  }
}

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
  profession?: string // Add profession to interface
}

function WetUitlegPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [analyses, setAnalyses] = useState<LegalAnalysis[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [profession, setProfession] = useState<Profession>('algemeen') // Add profession state
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null)
  const [hasProcessedUrlQuery, setHasProcessedUrlQuery] = useState(false) // Track if we've processed URL query
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

  // Load profession from localStorage
  useEffect(() => {
    let savedProfession = localStorage.getItem('wetHelder_profession')
    
    // Also check for the main screen selected profile for consistency
    if (!savedProfession) {
      savedProfession = localStorage.getItem('wetHelder_selected_profile')
    }
    
    if (savedProfession && savedProfession in professionConfig) {
      console.log('Loading profession from localStorage for wetuitleg:', savedProfession)
      setProfession(savedProfession as Profession)
    } else {
      // Ensure we always have a valid profession set
      console.log('Setting default profession: algemeen')
      setProfession('algemeen')
    }
  }, [])

  // Save profession to localStorage whenever it changes (both keys for consistency)
  useEffect(() => {
    localStorage.setItem('wetHelder_profession', profession)
    localStorage.setItem('wetHelder_selected_profile', profession)
  }, [profession])

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

  // Handle URL query parameter for automatic question submission
  useEffect(() => {
    const urlQuery = searchParams.get('q')
    
    if (urlQuery && !hasProcessedUrlQuery && !isLoading) {
      console.log(' Processing URL query:', urlQuery)
      
      // Set the input field value
      setInput(urlQuery)
      if (inputRef.current) {
        inputRef.current.value = urlQuery
      }
      
      // Automatically submit the query after a brief delay to ensure everything is loaded
      const timer = setTimeout(() => {
        if (!isLoading) {
          submitQuery(urlQuery)
        }
      }, 500)
      
      setHasProcessedUrlQuery(true)
      
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, hasProcessedUrlQuery, isLoading])

  const submitQuery = async (query: string) => {
    if (!query.trim() || isLoading) return

    const trimmedQuery = query.trim()
    setInput('')
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    setIsLoading(true)

    // Create temporary analysis with loading state
    const tempAnalysis: LegalAnalysis = {
      id: Date.now().toString(),
      query: trimmedQuery,
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
      fullResponse: '',
      profession: profession // Add profession to analysis
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
          query: trimmedQuery,
          history: conversationHistory,
          profession: profession // Add profession to API call
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
            console.log(' Stream completed, total time:', Date.now() - startTime, 'ms')
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          if (chunk) {
            accumulatedContent += chunk
            lastUpdateTime = Date.now()

            // Update the analysis with accumulated content
            setAnalyses(prev => prev.map(analysis => 
              analysis.id === tempAnalysis.id 
                ? { 
                    ...analysis, 
                    isLoading: false, 
                    fullResponse: accumulatedContent,
                    summary: accumulatedContent, // Show the full response as summary
                    explanation: '', // Clear other fields since we're showing everything in summary
                    articleText: '',
                    officialLink: '',
                    practicalApplication: '',
                    jurisprudence: '',
                    relatedArticles: '',
                    sources: []
                  }
                : analysis
            ))
          }
        } catch (timeoutError) {
          console.error(' Stream timeout:', timeoutError)
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

  // Ensure handleSubmit is properly defined
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    await submitQuery(input)
  }

  const parseAnalysisContent = (content: string) => {
    // Extract exact legal text from markdown code blocks, emoji sections or specific markers
    const patterns = [
      /[\s\S]*?(?=|||||$)/g,
      /\*\* EXACTE WETTEKST\*\*[\s\S]*?(?=\*\*|$)/g,
      /EXACTE WETTEKST[\s\S]*?(?=JURIDISCHE ANALYSE|$)/g
    ]
    
    let exactText = ''
    for (const pattern of patterns) {
      const matches = content.match(pattern)
      if (matches && matches.length > 0) {
        exactText = matches.join('\n\n')
        break
      }
    }
    
    const sections = {
      articleText: exactText || extractSection(content, '', '') || extractSection(content, 'EXACTE WETTEKST', 'JURIDISCHE ANALYSE'),
      summary: extractSection(content, '', '') || extractSection(content, 'JURIDISCHE ANALYSE', 'JURISPRUDENTIE') || content, // Fallback to full content
      explanation: extractSection(content, '', '') || extractSection(content, 'PRAKTISCHE TOEPASSING', 'GERELATEERDE ARTIKELEN'),
      practicalApplication: extractSection(content, '', '') || extractSection(content, 'PRAKTISCHE TOEPASSING', 'GERELATEERDE ARTIKELEN'),
      jurisprudence: extractSection(content, '', '') || extractSection(content, 'JURISPRUDENTIE', 'PRAKTISCHE TOEPASSING'),
      relatedArticles: extractSection(content, '', '') || extractSection(content, 'GERELATEERDE ARTIKELEN', 'BELANGRIJKE AANDACHTSPUNTEN'),
      officialLink: extractSection(content, 'LINK:', '') || extractSection(content, 'URL:', '') || extractSection(content, 'Bron:', ''),
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

    // Handle HTML details blocks first (from API responses that still contain them)
    const detailsPattern = /<details[^>]*>([\s\S]*?)<\/details>/g
    let processedText = text
    const detailsBlocks: Array<{ content: string; summary: string }> = []
    
    let match
    while ((match = detailsPattern.exec(text)) !== null) {
      const fullMatch = match[0]
      const content = match[1]
      
      // Extract summary
      const summaryMatch = content.match(/<summary[^>]*>(.*?)<\/summary>([\s\S]*)/)
      if (summaryMatch) {
        detailsBlocks.push({
          summary: summaryMatch[1].trim(),
          content: summaryMatch[2].trim()
        })
        // Remove the details block from processed text
        processedText = processedText.replace(fullMatch, `\n\n**${summaryMatch[1]}**\n${summaryMatch[2]}\n\n`)
      }
    }

    // Check if this is a legal text that starts with **WETTEKST:**
    const wettekstMatch = processedText.match(/^\*\*WETTEKST:\*\*([\s\S]*?)(?=\*\*[A-Z\s]+:\*\*|\n###|$)/i)
    
    if (wettekstMatch) {
      const wettekstContent = wettekstMatch[1].trim()
      const restOfText = processedText.replace(wettekstMatch[0], '').trim()
      
      return (
        <div className="space-y-6">
          {/* Prominent Legal Text Frame */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-md">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-blue-900 mb-1">
                  OFFICIËLE WETTEKST
                </h3>
                <p className="text-sm text-blue-700">
                  Exacte tekst zoals vastgesteld door de wetgever
                </p>
              </div>
            </div>
            
            <details className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-lg shadow-sm">
              <summary className="p-4 cursor-pointer font-medium text-blue-900 hover:bg-blue-50 rounded-t-lg">
                Officiële tekst (klik om te tonen/verbergen)
              </summary>
              <div className="p-4 pt-0 font-mono text-gray-900 leading-relaxed whitespace-pre-wrap text-sm border-t border-blue-200">
                {wettekstContent}
              </div>
            </details>
            
            <div className="flex items-center gap-2 mt-3 text-xs text-blue-600">
              <ExternalLink className="h-3 w-3" />
              <span>Bron: wetten.overheid.nl</span>
            </div>
          </div>
          
          {/* Rest of the analysis */}
          {restOfText && formatTextContent(restOfText)}
        </div>
      )
    }
    
    return formatTextContent(processedText)
  }

  const formatTextContent = (text: string): React.ReactElement => {
    // Clean up the text and split into paragraphs
    const cleanText = text
      // Remove code block markers
      .replace(/```[\w]*\n?/g, '')
      .replace(/```/g, '')
      // Clean up common formatting issues
      .replace(/\*\*\s*\*\*/g, '') // Remove empty ** pairs
      // Remove section headers that might appear in content (don't make these bold)
      .replace(/\*\*(SAMENVATTING|WETSARTIKEL|LINK|TOELICHTING|PRAKTIJK|JURISPRUDENTIE|VERWANTE ARTIKELEN|BRONNEN|EXACTE WETTEKST|JURIDISCHE ANALYSE|KERN IN ÉÉN ZIN|WAT BETEKENT DIT|HOE PAS JE DIT TOE|LET OP):\*\*/g, '$1:') 
      // Remove ** around headers that end with : (but keep the colon)
      .replace(/\*\*([^*\n]+):\*\*/g, '$1:')
      .trim()
    
    // Split into paragraphs (double newlines)
    const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim())
    
    return (
      <div className="text-sm max-w-none">
        {paragraphs.map((paragraph, index) => {
          const trimmedParagraph = paragraph.trim()
          
          // Check if it's a header (starts with ### or is an all-caps section title)
          if (trimmedParagraph.startsWith('###')) {
            const headerText = trimmedParagraph.replace(/^###\s*/, '').replace(/\*\*/g, '')
            return (
              <h3 key={index} className="text-base font-medium text-gray-900 mt-6 mb-4 border-b border-gray-200 pb-2">
                {headerText}
              </h3>
            )
          }
          
          // Check for section headers (like "Kern in één zin:", "Wat betekent dit?", etc.)
          if (trimmedParagraph.match(/^(Kern in één zin|Wat betekent dit|Hoe pas je dit toe|Let op|KERN IN ÉÉN ZIN|WAT BETEKENT DIT|HOE PAS JE DIT TOE|LET OP):/i)) {
            const headerText = trimmedParagraph.split(':')[0].trim()
            const contentText = trimmedParagraph.substring(trimmedParagraph.indexOf(':') + 1).trim()
            
            return (
              <div key={index} className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3 text-blue-800">
                  {headerText}
                </h4>
                {contentText && (
                  <div className="text-gray-800 leading-relaxed">
                    {formatInlineText(contentText)}
                  </div>
                )}
              </div>
            )
          }
          
          // Check if it's a list (contains bullet points or numbers)
          if (trimmedParagraph.includes('\n- ') || trimmedParagraph.includes('\n• ') || trimmedParagraph.match(/\n\d+\./)) {
            const lines = trimmedParagraph.split('\n')
            const listItems: React.ReactNode[] = []
            let currentParagraph = ''
            
            lines.forEach((line, lineIndex) => {
              const trimmedLine = line.trim()
              if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
                // Add any accumulated paragraph before the list
                if (currentParagraph) {
                  listItems.push(
                    <p key={`p-${lineIndex}`} className="text-gray-800 leading-relaxed mb-4 text-sm">
                      {formatInlineText(currentParagraph)}
                    </p>
                  )
                  currentParagraph = ''
                }
                // Add list item
                listItems.push(
                  <li key={`li-${lineIndex}`} className="text-gray-800 leading-relaxed mb-2 text-sm">
                    {formatInlineText(trimmedLine.substring(2))}
                  </li>
                )
              } else if (trimmedLine.match(/^\d+\./)) {
                // Add any accumulated paragraph before the list
                if (currentParagraph) {
                  listItems.push(
                    <p key={`p-${lineIndex}`} className="text-gray-800 leading-relaxed mb-4 text-sm">
                      {formatInlineText(currentParagraph)}
                    </p>
                  )
                  currentParagraph = ''
                }
                // Add numbered list item
                listItems.push(
                  <li key={`li-${lineIndex}`} className="text-gray-800 leading-relaxed mb-2 text-sm">
                    {formatInlineText(trimmedLine.replace(/^\d+\.\s*/, ''))}
                  </li>
                )
              } else if (trimmedLine) {
                currentParagraph += (currentParagraph ? ' ' : '') + trimmedLine
              }
            })
            
            // Add any remaining paragraph
            if (currentParagraph) {
              listItems.push(
                <p key={`p-final`} className="text-gray-800 leading-relaxed mb-4 text-sm">
                  {formatInlineText(currentParagraph)}
                </p>
              )
            }
            
            return (
              <div key={index} className="mb-6">
                {listItems.some(item => React.isValidElement(item) && item.type === 'li') ? (
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {listItems}
                  </ul>
                ) : (
                  <div>{listItems}</div>
                )}
              </div>
            )
          }
          
          // Regular paragraph
          return (
            <p key={index} className="text-gray-800 leading-relaxed mb-4 text-sm">
              {formatInlineText(trimmedParagraph)}
            </p>
          )
        })}
      </div>
    )
  }

  // Helper function to format inline text (bold, links, article references)
  const formatInlineText = (text: string): React.ReactNode => {
    // First clean up excessive ** markers and malformed bold text
    const cleaned = text
      // Remove isolated ** markers
      .replace(/\*\*\s*\*\*/g, '')
      // Fix malformed patterns like **text** **more:** 
      .replace(/\*\*([^*]*?)\*\*\s*\*\*([^*]*?):\*\*/g, '**$1** $2:')
      // Remove ** around section headers that end with :
      .replace(/\*\*([A-Z\s]+):\*\*/g, '$1:')
      // Remove ** from start/end of text
      .replace(/^\*\*|\*\*$/g, '')
      .trim()
    
    // Convert only well-formed **text** to bold (avoid single words in sentences)
    let formatted = cleaned.replace(/\*\*([^*\n]{2,}?)\*\*/g, (match, content) => {
      // Only make bold if it's a meaningful phrase (not just punctuation or single chars)
      if (content.trim().length < 2 || /^[^a-zA-Z]*$/.test(content.trim())) {
        return content
      }
      return `<strong class="font-medium text-gray-900">${content}</strong>`
    })
    
    // Remove any remaining isolated ** markers
    formatted = formatted.replace(/\*\*/g, '')
    
    // Convert markdown links - enhanced to handle various URL formats better
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
    
    // Convert plain URLs to clickable links (http, https, www) - simplified classes
    formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
    formatted = formatted.replace(/(www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)/g, '<a href="https://$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
    
    // Fix malformed link text that shows HTML as text (multiple patterns)
    formatted = formatted.replace(/LINK:\s*Raadpleeg de officiële tekst van ([^"]+)"\s*target="_blank"\s*rel="noopener noreferrer"\s*class="[^"]*">([^<]+)/g, 
      'LINK: <a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">Raadpleeg de officiële tekst van $1</a>')
    
    // Fix malformed links with missing opening tag (more general pattern)
    formatted = formatted.replace(/([^<])(https?:\/\/[^\s"]+)"\s*target="_blank"\s*rel="noopener noreferrer"\s*class="[^"]*">([^<]+)/g, 
      '$1<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$3</a>')
    
    // Fix isolated URLs that appear as broken HTML
    formatted = formatted.replace(/([^href="])(https?:\/\/[^\s"]+)"\s*target="_blank"/g, 
      '$1<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$2</a>')
    
    // Convert email addresses to clickable links
    formatted = formatted.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1" class="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors">$1</a>')
    
    // Create clickable links for article references with numbers that include dots (like 5.2.60)
    // Updated pattern to handle decimals and remove trailing commas from article references
    formatted = formatted.replace(/\b(artikel\s+\d+(?:\.\d+)*(?:\s+lid\s+\d+)?(?:\s+onder\s+[a-z])?)\s*,?\s*([A-Z][a-zA-Z\s&]+(?:voertuigen|1994|wetboek|wet|reglement))/gi, 
      (match, article, source) => {
        // Clean up the source by removing trailing punctuation
        const cleanSource = source.replace(/[,\s]+$/, '')
        return `${article} ${cleanSource}`
      })
    
    // Keep article references and legal codes as plain text without highlighting
    
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
                          <h1 className="text-3xl font-medium text-gray-900 mb-2 flex items-center gap-3">
              <Scale className="h-8 w-8 text-blue-600" />
              Wetuitleg
            </h1>
              <p className="text-gray-600">
                Uitgebreide juridische uitleg van Nederlandse wetsartikelen
              </p>
            </div>
          </div>

          {/* Disclaimer - aligned with chat bubbles */}
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              {/* Spacer to align with chat icons */}
            </div>
            <div className="flex-1 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-900 mb-1">Gebruik van Wetuitleg</h3>
                  <p className="text-sm text-blue-800 leading-relaxed mb-3">
                    Deze functie is specifiek ontworpen voor het bevragen van <strong>losse wetsartikelen</strong> (bijv. &quot;Wat zegt artikel 318 Sr?&quot; of &quot;Leg artikel 96b Sv uit&quot;). 
                    Voor <strong>complexe casussen of situaties</strong> die via meerdere wetten kunnen lopen, raadpleeg een <strong>juridisch professional</strong> voor persoonlijk advies.
                  </p>
                  <div className="flex items-center gap-3 pt-2 border-t border-blue-200">
                                         <p className="text-sm text-blue-800 flex-1">
                       <strong>Algemene vragen</strong> of situaties die om duiding vragen? Gebruik onze chat:
                     </p>
                    <Link href="/ask">
                      <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-100">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Naar Chat
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rate limit info for anonymous users - aligned with chat bubbles */}
          {!session && remainingQuestions !== null && (
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {/* Spacer to align with chat icons */}
              </div>
              <div className={`flex-1 p-3 border rounded-lg ${
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
                    {analysis.profession && (
                      <Badge variant="secondary" className="text-xs">
                        {professionConfig[analysis.profession as keyof typeof professionConfig]?.label}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      Wetuitleg
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
                        onClick={() => copyToClipboard(analysis.fullResponse || analysis.summary)}
                        className="h-8 w-8 p-0"
                        title="Kopieer analyse"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                                             <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => window.open(`/contact/fout?vraag=${encodeURIComponent(analysis.query)}&antwoord=${encodeURIComponent((analysis.fullResponse || analysis.summary).substring(0, 200))}...`, '_blank')}
                         className="h-auto px-2 py-1 text-xs"
                         title="Fout antwoord melden"
                       >
                         <span className="text-orange-600 hover:text-orange-700">Onjuist?</span>
                       </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => shareAnalysis(analysis.query, analysis.summary)}
                        className="h-8 w-8 p-0"
                        title="Deel analyse"
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
                      {/* Article Text - Premium Legal Text Frame */}
                      {analysis.articleText && (
                        <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                          {/* Decorative elements */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 rounded-t-xl"></div>
                          <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-600 rounded-full shadow-sm"></div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full shadow-sm"></div>
                          
                          <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                              <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-medium text-blue-900 mb-2 flex items-center gap-2">
                                 Exacte Wettekst
                              </h3>
                              <p className="text-sm text-blue-700 bg-blue-100/50 px-3 py-1 rounded-full inline-block">
                                Officiële tekst zoals gepubliceerd op wetten.overheid.nl
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-white border-2 border-blue-200 rounded-lg p-5 shadow-inner relative overflow-hidden">
                            {/* Paper texture effect */}
                            <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-gray-100 to-transparent"></div>
                            <div className="relative z-10">
                              <div className="font-serif text-base text-gray-900 leading-relaxed space-y-3">
                                {formatText(analysis.articleText)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-blue-600">
                              <ExternalLink className="h-3 w-3" />
                              <span className="font-medium">Bron: Officiële Nederlandse wetgeving</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-blue-500">
                              <CheckCircle className="h-3 w-3" />
                              <span>Geverifieerd</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Official Link - Enhanced */}
                      {analysis.officialLink && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                              <ExternalLink className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Officiële Bron</h3>
                          </div>
                          <div className="text-gray-800 leading-relaxed">
                            {formatText(analysis.officialLink)}
                          </div>
                        </div>
                      )}

                      {/* Main Response - Enhanced */}
                      {analysis.summary && (
                        <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-5 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                              <Scale className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Juridische Analyse</h3>
                          </div>
                          <div className="text-sm max-w-none">
                            {formatText(analysis.summary)}
                          </div>
                        </div>
                      )}

                      {/* Explanation - Enhanced */}
                      {analysis.explanation && (
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-5 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Toelichting & Bijzonderheden</h3>
                          </div>
                          <div className="text-sm max-w-none">
                            {formatText(analysis.explanation)}
                          </div>
                        </div>
                      )}

                      {/* Practical Application - Enhanced */}
                      {analysis.practicalApplication && (
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-5 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                              <AlertCircle className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Toepassing in de Praktijk</h3>
                          </div>
                          <div className="text-sm max-w-none">
                            {formatText(analysis.practicalApplication)}
                          </div>
                        </div>
                      )}

                      {/* Jurisprudence - Enhanced */}
                      {analysis.jurisprudence && (
                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-5 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
                              <Gavel className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Relevante Jurisprudentie</h3>
                          </div>
                          <div className="text-sm max-w-none">
                            {formatText(analysis.jurisprudence)}
                          </div>
                        </div>
                      )}

                      {/* Related Articles - Enhanced */}
                      {analysis.relatedArticles && (
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-5 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
                              <FileText className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Verwante Wetsartikelen</h3>
                          </div>
                          <div className="text-sm max-w-none">
                            {formatText(analysis.relatedArticles)}
                          </div>
                        </div>
                      )}

                      {/* Sources - Enhanced */}
                      {analysis.sources.length > 0 && (
                        <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-lg p-5 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-gray-600 rounded-full flex items-center justify-center">
                              <ExternalLink className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Geraadpleegde Bronnen</h3>
                          </div>
                          <div className="space-y-3">
                            {analysis.sources.map((source, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                                </div>
                                <ExternalLink className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                <a 
                                  href={source} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors flex-1 break-all"
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

        {/* Input Form - Mobile Optimized */}
        <Card className="sticky bottom-4 md:bottom-6 shadow-lg border-2 bg-white/95 backdrop-blur mx-2 md:mx-0">
          <CardContent className="p-3 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              {/* Question Input */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Bijv: Wat zegt artikel 318 Sr?"
                  className="flex-1 h-12 text-base"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim() || (!session && remainingQuestions === 0)}
                  className="h-12 px-4 md:px-6 w-full sm:w-auto"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span className="hidden sm:inline">Bezig...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      <span className="hidden sm:inline">Analyseer</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-3 pt-1">
                {/* Profession Selector */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      <span className="hidden sm:inline">Functieprofiel / Beroep</span>
                      <span className="sm:hidden">Profiel</span>
                    </div>
                  </label>
                  <Select 
                    value={profession} 
                    onValueChange={(value) => setProfession(value as Profession)}
                    defaultValue="algemeen"
                  >
                    <SelectTrigger className="w-full h-11 text-base">
                      <SelectValue placeholder="Selecteer je profiel..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(professionConfig).map(([key, config]) => {
                        const IconComponent = config.icon
                        return (
                          <SelectItem key={key} value={key} className="py-3">
                            <div className="flex items-center gap-3">
                              <IconComponent className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{config.label}</div>
                                <div className="text-xs text-muted-foreground max-w-[250px] truncate md:max-w-none md:whitespace-normal">
                                  {config.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Button & Mobile tip */}
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                  {analyses.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearAnalyses}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 w-full sm:w-auto"
                      title="Wis alle analyses van dit gesprek"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Wis gesprek
                    </Button>
                  )}
                  
                  {/* Mobile tip */}
                  <p className="text-xs text-gray-500 text-center w-full sm:w-auto sm:text-right">
                     Voor uitgebreide uitleg van specifieke wetsartikelen
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default function WetUitlegPageWithSuspense() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
        <p className="mt-4 text-gray-600">WetUitleg wordt geladen...</p>
      </div>
    </div>}>
      <WetUitlegPage />
    </Suspense>
  )
} 