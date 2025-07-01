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
type Profession = 'aspirant' | 'student' | 'politieagent' | 'advocaat' | 'algemeen' | 'boa' | 'rechter' | 'notaris' | 'deurwaarder' | 'bedrijfsjurist' | 'gemeenteambtenaar' | 'belastingadviseur' | 'accountant' | 'makelaar' | 'verzekeringsagent' | 'hr-medewerker' | 'compliance-officer' | 'veiligheidsbeambte' | 'beveiliger' | 'gemeentejurist' | 'trainer' | 'vervoersmedewerker' | 'zorgprofessional' | 'ovj' | 'juridisch-medewerker' | 'parkeercontroleur'

const professionConfig = {
  algemeen: {
    icon: Info,
    label: 'Algemeen/Burger',
    color: 'text-gray-700 bg-gray-50 border-gray-200',
    description: 'Begrijpelijke uitleg van juridische begrippen en praktische toepassingen voor burgers'
  },
  advocaat: {
    icon: Scale,
    label: 'Advocaat',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    description: 'Diepgaande juridische analyse, processtrategieën, jurisprudentie en verweersmogelijkheden'
  },
  politieagent: {
    icon: Shield,
    label: 'Politieagent',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    description: 'Concrete bevoegdheden, handhavingsprocedures, arrestatieprocedures en praktische toepassingen'
  },
  boa: {
    icon: Shield,
    label: 'BOA / Handhaver',
    color: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    description: 'Specifieke BOA-bevoegdheden per domein, APV-handhaving en toezichtsprocedures'
  },
  ovj: {
    icon: Gavel,
    label: 'Officier van Justitie',
    color: 'text-red-700 bg-red-50 border-red-200',
    description: 'Vervolgingsbeleid, strafvordering, sepots en strategische juridische besluitvorming'
  },
  rechter: {
    icon: Gavel,
    label: 'Rechter',
    color: 'text-red-700 bg-red-50 border-red-200',
    description: 'Procesrechtelijke aspecten, bewijswaardering, vonnis-motivering en rechtspraak'
  },
  notaris: {
    icon: FileText,
    label: 'Notaris',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    description: 'Burgerlijk recht, aktes, registratie en notariële waarborgen en procedures'
  },
  deurwaarder: {
    icon: FileText,
    label: 'Deurwaarder',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    description: 'Executierecht, beslagprocedures, dwangbevelen en invorderingsstrategieën'
  },
  'bedrijfsjurist': {
    icon: Building,
    label: 'Bedrijfsjurist',
    color: 'text-slate-700 bg-slate-50 border-slate-200',
    description: 'Ondernemingsrecht, contractenrecht, compliance en bedrijfsrechtelijke risico-analyse'
  },
  'juridisch-medewerker': {
    icon: FileText,
    label: 'Juridisch Medewerker',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    description: 'Praktische ondersteuning, documentvoorbereiding en procedurele werkzaamheden'
  },
  gemeenteambtenaar: {
    icon: MapPin,
    label: 'Gemeenteambtenaar',
    color: 'text-green-700 bg-green-50 border-green-200',
    description: 'Bestuursrecht, vergunningverlening, lokale verordeningen en gemeentelijke procedures'
  },
  gemeentejurist: {
    icon: Building,
    label: 'Gemeentejurist',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    description: 'Bestuurlijk sanctierecht, bezwaar en beroep, gemeentelijke rechtspositie'
  },
  belastingadviseur: {
    icon: Calculator,
    label: 'Belastingadviseur',
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    description: 'Fiscaal recht, belastingwetgeving, heffingen en belastingprocedures'
  },
  accountant: {
    icon: Calculator,
    label: 'Accountant',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    description: 'Financieel toezichtrecht, verslaggevingskaders en accountancy-regelgeving'
  },
  makelaar: {
    icon: Home,
    label: 'Makelaar',
    color: 'text-teal-700 bg-teal-50 border-teal-200',
    description: 'Vastgoedrecht, makelaarsrecht, kooprecht en vastgoedtransacties'
  },
  verzekeringsagent: {
    icon: Shield,
    label: 'Verzekeringsagent',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    description: 'Verzekeringsrecht, aansprakelijkheidsrecht en schadeafwikkeling'
  },
  'hr-medewerker': {
    icon: Users,
    label: 'HR-medewerker',
    color: 'text-pink-700 bg-pink-50 border-pink-200',
    description: 'Arbeidsrecht, CAO-bepalingen, personeelsbeleid en arbeidsconflicten'
  },
  'compliance-officer': {
    icon: CheckCircle,
    label: 'Compliance Officer',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    description: 'Toezichtrecht, nalevingsprocedures, integriteitskaders en risicomanagement'
  },
  veiligheidsbeambte: {
    icon: Shield,
    label: 'Veiligheidsbeambte',
    color: 'text-red-700 bg-red-50 border-red-200',
    description: 'Veiligheidsrecht, crisisbeheersing, toegangscontrole en beveiligingsprocedures'
  },
  beveiliger: {
    icon: Shield,
    label: 'Beveiliger',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    description: 'Private veiligheid, eigendomsbescherming, particuliere recherche en beveiliging'
  },
  trainer: {
    icon: GraduationCap,
    label: 'Trainer / Opleider',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    description: 'Educatieve juridische uitleg, trainingsmateriaal en gestructureerde kennisoverdracht'
  },
  vervoersmedewerker: {
    icon: Users,
    label: 'Vervoersmedewerker',
    color: 'text-green-700 bg-green-50 border-green-200',
    description: 'Vervoersrecht, OV-bevoegdheden, controle en handhaving in het openbaar vervoer'
  },
  parkeercontroleur: {
    icon: MapPin,
    label: 'Parkeercontroleur',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    description: 'RVV-regelgeving, parkeerrecht, boeteprocedures en verkeersovertredingen'
  },
  zorgprofessional: {
    icon: Heart,
    label: 'Zorgprofessional',
    color: 'text-pink-700 bg-pink-50 border-pink-200',
    description: 'Zorgrecht, privacy-wetgeving (AVG), patiëntenrechten en medische procedures'
  },
  aspirant: {
    icon: UserCheck,
    label: 'Aspirant',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    description: 'Uitgebreide begeleiding met praktijkvoorbeelden, voorbereiding op de functie'
  },
  student: {
    icon: GraduationCap,
    label: 'Student',
    color: 'text-green-700 bg-green-50 border-green-200',
    description: 'Gestructureerde uitleg voor studie, tentamenvoorbereiding en juridisch begrip'
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
      // Build conversation history for API (last 10 analyses) - chronological order
      const conversationHistory = []
      const recentAnalyses = analyses.slice(-5) // Last 5 conversations (10 messages)
      
      for (const analysis of recentAnalyses) {
        // Add user message
        conversationHistory.push({
          role: 'user' as const,
          content: analysis.query
        })
        
        // Add assistant response if available
        if (analysis.fullResponse) {
          conversationHistory.push({
            role: 'assistant' as const,
            content: analysis.fullResponse
          })
        }
      }

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
            // Parse Server-Sent Events properly
            const lines = chunk.split('\n')
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.substring(6) // Remove 'data: '
                if (dataStr === '[DONE]') {
                  break
                }
                try {
                  const data = JSON.parse(dataStr)
                  if (data.content) {
                    accumulatedContent += data.content
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
            
            // Only update UI every 100ms to avoid too many re-renders
            const now = Date.now()
            if (now - lastUpdateTime > 100) {
              lastUpdateTime = now
              
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
          }
        } catch (timeoutError) {
          console.error(' Stream timeout:', timeoutError)
          if (accumulatedContent.length === 0) {
            throw new Error('No response received - request timed out')
          }
          break // If we have some content, continue with what we have
        }
      }

      // Final update with the complete accumulated content
      if (accumulatedContent) {
        // Parse content to extract structured sections
        const parsedContent = parseAnalysisContent(accumulatedContent)
        
        setAnalyses(prev => prev.map(analysis => 
          analysis.id === tempAnalysis.id 
            ? { 
                ...analysis, 
                isLoading: false, 
                fullResponse: accumulatedContent,
                articleText: parsedContent.articleText,
                summary: parsedContent.summary || accumulatedContent,
                explanation: parsedContent.explanation,
                officialLink: parsedContent.officialLink,
                practicalApplication: parsedContent.practicalApplication,
                jurisprudence: parsedContent.jurisprudence,
                relatedArticles: parsedContent.relatedArticles,
                sources: parsedContent.sources
              }
            : analysis
        ))
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
    // Extract exact legal text from various patterns
    let exactText = ''
    
    // Look for **WETTEKST:** pattern first (from new API response)
    const wettekstMatch = content.match(/\*\*WETTEKST:\*\*([\s\S]*?)(?=\n\n|\*\*|$)/)
    if (wettekstMatch) {
      exactText = wettekstMatch[1].trim()
    } else {
      // Fallback patterns for other formats
      const patterns = [
        /\*\*EXACTE WETTEKST\*\*[\s\S]*?(?=\*\*|$)/gi,
        /EXACTE WETTEKST:?([\s\S]*?)(?=JURIDISCHE ANALYSE|TOELICHTING|$)/gi,
        /WETTEKST:?([\s\S]*?)(?=ANALYSE|UITLEG|$)/gi
      ]
      
      for (const pattern of patterns) {
        const matches = content.match(pattern)
        if (matches && matches.length > 0) {
          exactText = matches[0].replace(/\*\*(EXACTE )?WETTEKST:?\*\*/gi, '').trim()
          break
        }
      }
    }
    
    // Extract sources from content
    const sources = extractSources(content)
    
    // For now, use the full content as summary (the AI will provide structured responses)
    const sections = {
      articleText: exactText,
      summary: content,
      explanation: '',
      officialLink: '',
      practicalApplication: '',
      jurisprudence: '',
      relatedArticles: '',
      sources: sources
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

        {/* Chat Berichten */}
        <div className="space-y-4 mb-6">
          {analyses.map((analysis) => (
            <div key={analysis.id} className="space-y-3">
              {/* User Message */}
              <div className="flex items-start gap-3 justify-end">
                <div className="max-w-[80%] bg-blue-500 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs opacity-80">
                      {analysis.profession && professionConfig[analysis.profession as keyof typeof professionConfig]?.label} • 
                      {new Date(analysis.timestamp).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{analysis.query}</p>
                </div>
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                  <Search className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* WetHelder Response */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                  <Scale className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 max-w-[85%]">
                  <div className="bg-white rounded-2xl rounded-tl-md shadow-sm border border-gray-200">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">WetHelder</span>
                        <span className="text-xs text-gray-500">
                          {new Date(analysis.timestamp).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(analysis.fullResponse || analysis.summary)}
                          className="h-7 w-7 p-0"
                          title="Kopieer"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/contact/fout?vraag=${encodeURIComponent(analysis.query)}&antwoord=${encodeURIComponent((analysis.fullResponse || analysis.summary).substring(0, 200))}...`, '_blank')}
                          className="h-7 px-2 text-xs"
                          title="Meld fout"
                        >
                          <span className="text-orange-600 hover:text-orange-700">Onjuist?</span>
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {analysis.isLoading ? (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Analyseren van wetsartikel...</span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Exacte Wettekst - Als beschikbaar */}
                          {analysis.articleText && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <h4 className="font-medium text-blue-900">Exacte Wettekst</h4>
                              </div>
                              <div className="text-sm text-blue-800 font-mono bg-white p-3 rounded border">
                                {formatText(analysis.articleText)}
                              </div>
                            </div>
                          )}

                          {/* Hoofdantwoord */}
                          {analysis.summary && (
                            <div className="text-sm text-gray-800 leading-relaxed">
                              {formatText(analysis.summary)}
                            </div>
                          )}

                          {/* Bronnen - Compact */}
                          {analysis.sources.length > 0 && (
                            <div className="pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500 mb-2">Bronnen:</p>
                              <div className="flex flex-wrap gap-2">
                                {analysis.sources.slice(0, 3).map((source, index) => (
                                  <a 
                                    key={index}
                                    href={source} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    {source.includes('wetten.overheid.nl') ? 'Wetten.nl' : 
                                     source.includes('rechtspraak.nl') ? 'Rechtspraak.nl' : 
                                     'Officiële bron'}
                                  </a>
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
        </div>

        {/* Input Form - Mobile Optimized */}
        <Card className="sticky bottom-4 md:bottom-6 shadow-lg border-2 bg-white/95 backdrop-blur mx-2 md:mx-0">
          <CardContent className="p-3 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              {/* Question Input */}
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      submitQuery(input)
                    }
                  }}
                  placeholder="Voer een artikel nummer in (bijv. artikel 96b Sv) of stel een juridische vraag..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={() => submitQuery(input)} 
                  disabled={!input.trim() || isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Enter om te analyseren • Shift+Enter voor nieuwe regel
                {analyses.length > 0 && " • Uw gesprekgeschiedenis wordt meegenomen"}
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