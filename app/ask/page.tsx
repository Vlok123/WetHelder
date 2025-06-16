'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
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
  ChevronDown,
  Settings,
  BookOpen,
  Gavel,
  Building,
  MapPin,
  Calculator,
  Home,
  Users,
  CheckCircle,
  Heart,
  Quote,
  History,
  Loader2,
  Trash2,
  RefreshCw,
  Clock,
  RotateCcw,
  Copy,
  Share2,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Bookmark
} from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'

interface Message {
  id: string
  question: string
  answer: string
  sources: string[]
  isLoading?: boolean
  profession?: string
  timestamp: Date
  queryId?: string
  type: 'user' | 'assistant'
}

type Profession = 'aspirant' | 'student' | 'politieagent' | 'advocaat' | 'algemeen' | 'boa' | 'rechter' | 'notaris' | 'deurwaarder' | 'bedrijfsjurist' | 'gemeenteambtenaar' | 'belastingadviseur' | 'accountant' | 'makelaar' | 'verzekeringsagent' | 'hr-medewerker' | 'compliance-officer' | 'veiligheidsbeambte' | 'beveiliger' | 'gemeentejurist' | 'trainer' | 'vervoersmedewerker' | 'zorgprofessional'

const professionConfig = {
  algemeen: {
    icon: Info,
    label: 'Algemeen',
    color: 'text-gray-700 bg-gray-50 border-gray-200',
    description: 'Volledig juridisch antwoord zonder specialisatie'
  },
  advocaat: {
    icon: Scale,
    label: 'Advocaat',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    description: 'Procesrecht, verdedigingsstrategieën, jurisprudentie en ECLI-nummers'
  },
  politieagent: {
    icon: Shield,
    label: 'Politieagent',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    description: 'Praktische bevoegdheden, dwangmiddelen, aanhoudingsrecht en doorzoekingsprocedures'
  },
  boa: {
    icon: Shield,
    label: 'BOA / Handhaver',
    color: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    description: 'Domeinspecifieke bevoegdheden, APV-handhaving en verschil met politiebevoegdheden'
  },
  rechter: {
    icon: Gavel,
    label: 'Rechter',
    color: 'text-red-700 bg-red-50 border-red-200',
    description: 'Procesrecht, bewijsrecht, motiveringsplicht en uitspraakvorming'
  },
  notaris: {
    icon: FileText,
    label: 'Notaris',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    description: 'Burgerlijk recht en notariële praktijk'
  },
  deurwaarder: {
    icon: FileText,
    label: 'Deurwaarder',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    description: 'Executierecht en beslagprocedures'
  },
  bedrijfsjurist: {
    icon: Building,
    label: 'Bedrijfsjurist',
    color: 'text-slate-700 bg-slate-50 border-slate-200',
    description: 'Ondernemingsrecht en compliance'
  },
  gemeenteambtenaar: {
    icon: MapPin,
    label: 'Gemeenteambtenaar',
    color: 'text-green-700 bg-green-50 border-green-200',
    description: 'Bestuursrecht en lokale verordeningen'
  },
  gemeentejurist: {
    icon: Building,
    label: 'Gemeentejurist',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    description: 'APVs, Gemeentewet, Omgevingswet, bestuurlijke sancties'
  },
  belastingadviseur: {
    icon: Calculator,
    label: 'Belastingadviseur',
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    description: 'Fiscaal recht en belastingwetgeving'
  },
  accountant: {
    icon: Calculator,
    label: 'Accountant',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    description: 'Financieel recht en verslaggeving'
  },
  makelaar: {
    icon: Home,
    label: 'Makelaar',
    color: 'text-teal-700 bg-teal-50 border-teal-200',
    description: 'Vastgoedrecht en makelaarsrecht'
  },
  verzekeringsagent: {
    icon: Shield,
    label: 'Verzekeringsagent',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    description: 'Verzekeringsrecht en aansprakelijkheid'
  },
  'hr-medewerker': {
    icon: Users,
    label: 'HR-medewerker',
    color: 'text-pink-700 bg-pink-50 border-pink-200',
    description: 'Arbeidsrecht en personeelsbeleid'
  },
  'compliance-officer': {
    icon: CheckCircle,
    label: 'Compliance Officer',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    description: 'Toezichtrecht en compliance'
  },
  veiligheidsbeambte: {
    icon: Shield,
    label: 'Veiligheidsbeambte',
    color: 'text-red-700 bg-red-50 border-red-200',
    description: 'Veiligheidsrecht en preventie'
  },
  beveiliger: {
    icon: Shield,
    label: 'Beveiliger',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    description: 'WPBR, APVs, onderscheid publieke/private bevoegdheden'
  },
  trainer: {
    icon: GraduationCap,
    label: 'Trainer / Opleider',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    description: 'Volledig gestructureerde antwoorden voor educatief gebruik'
  },
  vervoersmedewerker: {
    icon: Users,
    label: 'Vervoersmedewerker',
    color: 'text-green-700 bg-green-50 border-green-200',
    description: 'Wet personenvervoer, Spoorwegwet, OV-bevoegdheden'
  },
  zorgprofessional: {
    icon: Heart,
    label: 'Zorgprofessional',
    color: 'text-pink-700 bg-pink-50 border-pink-200',
    description: 'Wvggz, Wzd, AVG/WGBO bij gegevensuitwisseling'
  },
  aspirant: {
    icon: UserCheck,
    label: 'Aspirant',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    description: 'Uitgebreide uitleg met praktijkvoorbeelden'
  },
  student: {
    icon: GraduationCap,
    label: 'Student',
    color: 'text-green-700 bg-green-50 border-green-200',
    description: 'Stapsgewijze uitleg, structuur voor verslagen en uitgebreide bronvermelding'
  }
}

const formatText = (text: string): React.ReactElement => {
  if (!text) return <div></div>
  
  // Step 1: Clean markdown syntax but preserve and enhance links
  const processedText = text
    // Remove AI references
    .replace(/\b(AI|artificial intelligence|machine learning|ML|chatbot|bot|assistant|model)\b/gi, 'systeem')
    // Remove most markdown formatting but preserve links
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold - remove asterisks
    .replace(/\*(.*?)\*/g, '$1')      // Italic - remove asterisks  
    .replace(/`([^`]*)`/g, '$1')      // Inline code - remove backticks
    .replace(/```[\s\S]*?```/g, '')   // Code blocks - remove completely
    // Keep markdown links for processing later: [text](url) stays as is
    .replace(/^>\s*/gm, '')           // Blockquotes - remove > symbols
    .replace(/^#{1,6}\s*/gm, '')      // Headers - remove # symbols completely
    .replace(/^[\*\-\+]\s+/gm, '• ')  // Convert bullet points to simple bullets
    .replace(/^\d+\.\s+/gm, '')       // Remove numbered list markers
    .replace(/---+/g, '')             // Remove horizontal rules
    .replace(/\n{3,}/g, '\n\n')       // Clean excessive whitespace
    .trim()

  const elements: React.ReactElement[] = []
  let key = 0

  // Helper function to process text and make links clickable
  const processLinksInText = (text: string): React.ReactNode => {
    // First handle markdown links [text](url)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    // Then handle plain URLs
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g
    // Handle wetten.overheid.nl specific links
    const wettenRegex = /(wetten\.overheid\.nl[^\s<>"{}|\\^`[\]]*)/g
    
    let lastIndex = 0
    const parts: React.ReactNode[] = []
    let partKey = 0
    
    // Process markdown links first
    const allMatches: Array<{start: number, end: number, text: string, url: string, type: 'markdown' | 'url' | 'wetten'}> = []
    
    // Find markdown links
    let markdownMatch: RegExpExecArray | null
    while ((markdownMatch = markdownLinkRegex.exec(text)) !== null) {
      allMatches.push({
        start: markdownMatch.index,
        end: markdownMatch.index + markdownMatch[0].length,
        text: markdownMatch[1],
        url: markdownMatch[2],
        type: 'markdown'
      })
    }
    
    // Find plain URLs (but not those already in markdown links)
    markdownLinkRegex.lastIndex = 0 // Reset regex
    let urlMatch: RegExpExecArray | null
    while ((urlMatch = urlRegex.exec(text)) !== null) {
      const isInMarkdownLink = allMatches.some(m => 
        urlMatch!.index >= m.start && urlMatch!.index < m.end
      )
      if (!isInMarkdownLink) {
        allMatches.push({
          start: urlMatch.index,
          end: urlMatch.index + urlMatch[0].length,
          text: urlMatch[1],
          url: urlMatch[1],
          type: 'url'
        })
      }
    }
    
    // Find wetten.overheid.nl links (but not those already found)
    urlRegex.lastIndex = 0 // Reset regex
    let wettenMatch: RegExpExecArray | null
    while ((wettenMatch = wettenRegex.exec(text)) !== null) {
      const isAlreadyFound = allMatches.some(m => 
        wettenMatch!.index >= m.start && wettenMatch!.index < m.end
      )
      if (!isAlreadyFound) {
        const fullUrl = wettenMatch[1].startsWith('http') ? wettenMatch[1] : `https://${wettenMatch[1]}`
        allMatches.push({
          start: wettenMatch.index,
          end: wettenMatch.index + wettenMatch[0].length,
          text: wettenMatch[1],
          url: fullUrl,
          type: 'wetten'
        })
      }
    }
    
    // Sort matches by position
    allMatches.sort((a, b) => a.start - b.start)
    
    // Build the result with clickable links
    allMatches.forEach(linkMatch => {
      // Add text before the link
      if (linkMatch.start > lastIndex) {
        const beforeText = text.slice(lastIndex, linkMatch.start)
        if (beforeText) {
          parts.push(<span key={partKey++}>{beforeText}</span>)
        }
      }
      
      // Add the clickable link
      const linkText = linkMatch.text
      const linkUrl = linkMatch.url
      
      // Ensure URL has protocol
      const finalUrl = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
      
      parts.push(
        <a
          key={partKey++}
          href={finalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors inline-flex items-center gap-1"
        >
          {linkText}
          <ExternalLink className="h-3 w-3" />
        </a>
      )
      
      lastIndex = linkMatch.end
    })
    
    // Add remaining text after the last link
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex)
      if (remainingText) {
        parts.push(<span key={partKey++}>{remainingText}</span>)
      }
    }
    
    // If no links were found, return the original text
    if (parts.length === 0) {
      return text
    }
    
    return <>{parts}</>
  }

  // Step 2: Split into logical sections by double newlines for natural reading
  const sections = processedText.split(/\n\n+/).filter(s => s.trim())

  sections.forEach((section) => {
    const trimmedSection = section.trim()
    if (!trimmedSection) return

    // Detect wettelijke grondslag formatting: "De verdachte (art. 47 Sr)"
    const hasLegalReference = /\b(art\.?\s*\d+|artikel\s*\d+|wetboek|BW|Sr|Sv|AWR|Grondwet|ECLI)\b/i.test(trimmedSection)
    
    // Apply natural formatting with wettelijke grondslag integration
    if (hasLegalReference) {
      // Enhanced legal text with integrated references
      const formattedText = trimmedSection.replace(
        /\b(De\s+(?:verdachte|politie|rechter|officier|deurwaarder|notaris|gemeente|werkgever|werknemer|huurder|verhuurder|eigenaar|bestuur|minister|burgemeester))\s*\(([^)]+)\)/gi,
        '<span class="font-semibold text-blue-800">$1 ($2)</span>'
      )
      
      elements.push(
        <div key={key++} className="my-6 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 rounded-r-lg shadow-sm">
          <div className="flex items-start gap-4">
            <span className="text-amber-600 text-2xl flex-shrink-0 mt-1">⚖️</span>
            <div className="text-gray-800 leading-relaxed">
              <div className="space-y-2">
                {processLinksInText(formattedText.replace(/<span class="[^"]*">([^<]*)<\/span>/g, '$1'))}
              </div>
            </div>
          </div>
        </div>
      )
      return
    }

    // Detect section headers (natural titles ending with colon)
    if (trimmedSection.endsWith(':') && trimmedSection.length < 100 && !trimmedSection.includes('.')) {
      elements.push(
        <div key={key++} className="mt-8 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-blue-300 pb-2 mb-4">
            {processLinksInText(trimmedSection.replace(/:$/, ''))}
          </h3>
        </div>
      )
      return
    }

    // Detect bullet points - create natural list without excessive styling
    const lines = trimmedSection.split('\n').filter(l => l.trim())
    const bulletLines = lines.filter(line => line.trim().startsWith('•'))
    
    if (bulletLines.length > 0 && bulletLines.length === lines.length) {
      elements.push(
        <div key={key++} className="my-4">
          <ul className="space-y-2 ml-4">
            {lines.map((line, idx) => {
              const cleanLine = line.replace(/^•\s*/, '').trim()
              return (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 text-sm flex-shrink-0 mt-2">•</span>
                  <span className="text-gray-800 leading-relaxed">
                    {processLinksInText(cleanLine)}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )
      return
    }

    // Detect important notes - subtle highlighting without excessive decoration
    if (/^(let op|belangrijk|n\.?b\.?|opmerking|waarschuwing|attentie|nota bene)/i.test(trimmedSection)) {
      elements.push(
        <div key={key++} className="my-5 p-4 bg-blue-50 border-l-3 border-blue-400 rounded-r">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 text-lg flex-shrink-0 mt-1">ℹ️</span>
            <div className="text-blue-900 leading-relaxed">
              {processLinksInText(trimmedSection)}
            </div>
          </div>
        </div>
      )
      return
    }

    // Detect conclusions - minimal styling for natural flow
    if (/^(conclusie|samenvatting|kortom|samenvattend|tot slot|in conclusie)/i.test(trimmedSection)) {
      elements.push(
        <div key={key++} className="my-5 p-4 bg-green-50 border-l-3 border-green-400 rounded-r">
          <div className="flex items-start gap-3">
            <span className="text-green-600 text-lg flex-shrink-0 mt-1">✅</span>
            <div className="text-green-900 leading-relaxed">
              {processLinksInText(trimmedSection)}
            </div>
          </div>
        </div>
      )
      return
    }

    // Regular paragraphs - natural reading flow with proper spacing
    // Split long sections into readable paragraphs
    const sentences = trimmedSection.split(/(?<=[.!?])\s+(?=[A-Z])/)
    
    if (sentences.length > 3) {
      // Group sentences into natural paragraphs
      const paragraphs: string[] = []
      let currentPara = ''
      
      sentences.forEach((sentence, idx) => {
        currentPara += sentence + ' '
        // Create new paragraph every 2-3 sentences for readability
        if ((idx + 1) % 3 === 0 || idx === sentences.length - 1) {
          if (currentPara.trim()) {
            paragraphs.push(currentPara.trim())
            currentPara = ''
          }
        }
      })
      
      paragraphs.forEach(para => {
        elements.push(
          <p key={key++} className="text-gray-800 leading-relaxed text-base mb-4">
            {processLinksInText(para)}
          </p>
        )
      })
    } else {
      // Short section - single paragraph with natural spacing
      elements.push(
        <p key={key++} className="text-gray-800 leading-relaxed text-base mb-4">
          {processLinksInText(trimmedSection)}
        </p>
      )
    }
  })

  // Fallback for edge cases
  if (elements.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-gray-800 leading-relaxed text-base">
          {processLinksInText(processedText)}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {elements}
    </div>
  )
}

const mapProfileToProfession = (profile: string): Profession => {
  const mapping: Record<string, Profession> = {
    // Backwards compatibility mappings
    'juridisch-expert': 'advocaat',
    'handhaving': 'politieagent',
    'student': 'student',
    'algemeen': 'algemeen',
    'jurist': 'advocaat',
    'politie': 'politieagent',
    'boa': 'boa',
    'overig': 'algemeen',
    // Direct mappings for all new profession values
    'advocaat': 'advocaat',
    'politieagent': 'politieagent',
    'rechter': 'rechter',
    'notaris': 'notaris',
    'deurwaarder': 'deurwaarder',
    'bedrijfsjurist': 'bedrijfsjurist',
    'gemeenteambtenaar': 'gemeenteambtenaar',
    'gemeentejurist': 'gemeentejurist',
    'belastingadviseur': 'belastingadviseur',
    'accountant': 'accountant',
    'makelaar': 'makelaar',
    'verzekeringsagent': 'verzekeringsagent',
    'hr-medewerker': 'hr-medewerker',
    'compliance-officer': 'compliance-officer',
    'veiligheidsbeambte': 'veiligheidsbeambte',
    'trainer': 'trainer',
    'vervoersmedewerker': 'vervoersmedewerker',
    'zorgprofessional': 'zorgprofessional',
    'aspirant': 'aspirant',
    'beveiliger': 'beveiliger'
  }
  return mapping[profile] || 'algemeen'
}

function AskPageContent() {
  const { data: session, status } = useSession()
  const isDevelopment = process.env.NODE_ENV === 'development'
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [profession, setProfession] = useState<Profession>('algemeen')
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null)
  const [userRole, setUserRole] = useState<string>('ANONYMOUS')
  const [selectedCitationQuery, setSelectedCitationQuery] = useState<{queryId: string, question: string} | null>(null)
  const [wetUitlegEnabled, setWetUitlegEnabled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasAutoSubmitted = useRef(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversation from localStorage on mount
  useEffect(() => {
    const savedConversation = localStorage.getItem('wetHelder_conversation')
    const savedProfession = localStorage.getItem('wetHelder_profession')
    
    if (savedConversation) {
      try {
        const parsedMessages = JSON.parse(savedConversation)
        // Validate and restore messages
        const validMessages = parsedMessages.filter((msg: any) => 
          msg.id && msg.question && msg.answer && msg.timestamp
        ).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(validMessages)
      } catch (error) {
        console.error('Error loading conversation:', error)
        localStorage.removeItem('wetHelder_conversation')
      }
    }
    
    if (savedProfession) {
      setProfession(savedProfession as Profession)
    }
  }, [])

  // Save conversation to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('wetHelder_conversation', JSON.stringify(messages))
    }
  }, [messages])

  // Save profession to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wetHelder_profession', profession)
  }, [profession])

  // Check for Wet & Uitleg preference from localStorage and URL parameters
  useEffect(() => {
    // Check URL parameter first
    const wetuitlegParam = searchParams.get('wetuitleg')
    if (wetuitlegParam === 'true') {
      setWetUitlegEnabled(true)
      return
    }
    
    // Fall back to localStorage
    const wetUitlegPref = localStorage.getItem('wetUitlegEnabled')
    if (wetUitlegPref === 'true') {
      setWetUitlegEnabled(true)
      // Clear the preference after using it
      localStorage.removeItem('wetUitlegEnabled')
    }
  }, [searchParams])

  // Check rate limit status on page load
  useEffect(() => {
    const checkRateLimit = async () => {
      if (!session) {
        try {
          const response = await fetch('/api/ask', {
            method: 'GET',
          })
          
          if (response.ok) {
            const data = await response.json()
            setRemainingQuestions(data.remainingQuestions)
            setUserRole(data.userRole)
          }
        } catch (error) {
          console.error('Error checking rate limit:', error)
        }
      }
    }

    checkRateLimit()
  }, [session])

  // Set profession from URL parameter on page load (without auto-submit)
  useEffect(() => {
    const profile = searchParams.get('profile')
    if (profile && !hasAutoSubmitted.current) {
      const mappedProfession = mapProfileToProfession(profile)
      setProfession(mappedProfession)
    }
  }, [searchParams])

  // Auto-submit from URL parameters or sessionStorage
  useEffect(() => {
    if (hasAutoSubmitted.current) return
    
    // Check sessionStorage first
    const storedQuery = sessionStorage.getItem('autoSubmitQuery')
    const storedProfile = sessionStorage.getItem('autoSubmitProfile')
    
    if (storedQuery) {
      hasAutoSubmitted.current = true
      setInput(storedQuery)
      
      if (storedProfile) {
        const mappedProfession = mapProfileToProfession(storedProfile)
        setProfession(mappedProfession)
      }
      
      // Wacht even tot states zijn bijgewerkt
      setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent
        // Inline submit logic to avoid circular dependency
        if (storedQuery.trim() && !isLoading) {
          const question = storedQuery.trim()
          const currentProfession = storedProfile ? mapProfileToProfession(storedProfile) : profession
          setInput('')
          setIsLoading(true)

          const newMessage: Message = {
            id: Date.now().toString(),
            question,
            answer: '',
            sources: [],
            isLoading: true,
            profession: currentProfession,
            timestamp: new Date(),
            type: 'user'
          }

          setMessages(prev => [...prev, newMessage])
          
          // Continue with API call...
          fetch('/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question,
              profession: currentProfession,
              history: messages.slice(-10).map(m => ({
                role: m.type === 'user' ? 'user' as const : 'assistant' as const,
                content: m.type === 'user' ? m.question : m.answer
              }))
            })
          }).then(response => {
            if (!response.ok) throw new Error('API error')
            return response.body?.getReader()
          }).then(reader => {
            if (!reader) return
            const decoder = new TextDecoder()
            let answer = ''
            
            const readStream = () => {
              reader.read().then(({ done, value }) => {
                if (done) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === newMessage.id ? { ...msg, answer, isLoading: false } : msg
                  ))
                  setIsLoading(false)
                  return
                }
                
                const chunk = decoder.decode(value)
                const lines = chunk.split('\n')
                
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const data = JSON.parse(line.slice(6))
                      if (data.content) {
                        answer += data.content
                        setMessages(prev => prev.map(msg => 
                          msg.id === newMessage.id ? { ...msg, answer, isLoading: false } : msg
                        ))
                      }
                      if (data.remainingQuestions !== undefined) {
                        setRemainingQuestions(data.remainingQuestions)
                      }
                    } catch (e) {
                      // Ignore parsing errors
                    }
                  }
                }
                readStream()
              })
            }
            readStream()
          }).catch(error => {
            setMessages(prev => prev.map(msg => 
              msg.id === newMessage.id ? { 
                ...msg, 
                answer: error instanceof Error ? error.message : 'Er is een onbekende fout opgetreden.',
                isLoading: false 
              } : msg
            ))
            setIsLoading(false)
          })
        }
        
        // Clear sessionStorage
        sessionStorage.removeItem('autoSubmitQuery')
        sessionStorage.removeItem('autoSubmitProfile')
      }, 100)
      return
    }
    
    // Fall back to URL parameters if no sessionStorage
    const q = searchParams.get('q')
    const profile = searchParams.get('profile')
    
    if (q && q.trim()) {
      hasAutoSubmitted.current = true
      setInput(q)
      
      if (profile) {
        const mappedProfession = mapProfileToProfession(profile)
        setProfession(mappedProfession)
      }
      
      // Similar inline logic for URL params
      setTimeout(() => {
        if (q.trim() && !isLoading) {
          // Inline submit logic here too...
        }
      }, 100)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Auto-submit from main screen
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wetHelder_mainscreen_question') {
        const data = e.newValue ? JSON.parse(e.newValue) : null
        if (data && data.question && !hasAutoSubmitted.current) {
          hasAutoSubmitted.current = true
          setInput(data.question)
          
          if (data.profile) {
            setProfession(mapProfileToProfession(data.profile))
          }
          
          // Auto-submit the question
          setTimeout(() => {
            handleSubmit(new Event('submit') as any)
          }, 100)
          
          // Clear the storage
          localStorage.removeItem('wetHelder_mainscreen_question')
        }
      }
    }

    // Check if there's already a question waiting
    const savedQuestion = localStorage.getItem('wetHelder_mainscreen_question')
    if (savedQuestion && !hasAutoSubmitted.current) {
      const data = JSON.parse(savedQuestion)
      hasAutoSubmitted.current = true
      setInput(data.question)
      
      if (data.profile) {
        setProfession(mapProfileToProfession(data.profile))
      }
      
      // Auto-submit the question
      setTimeout(() => {
        handleSubmit(new Event('submit') as any)
      }, 100)
      
      // Clear the storage
      localStorage.removeItem('wetHelder_mainscreen_question')
    }

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent, overrideProfession?: Profession) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const question = input.trim()
    const currentProfession = overrideProfession || profession
    setInput('')
    setIsLoading(true)

    const newMessage: Message = {
      id: Date.now().toString(),
      question,
      answer: '',
      sources: [],
      isLoading: true,
      profession: currentProfession,
      timestamp: new Date(),
      type: 'user'
    }

    setMessages(prev => [...prev, newMessage])

    try {
      // Build conversation history for API
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.type === 'user' ? 'user' as const : 'assistant' as const,
        content: m.type === 'user' ? m.question : m.answer
      }))

      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          profession: currentProfession,
          history: conversationHistory,
          wetUitleg: wetUitlegEnabled
        }),
      })

      if (!response.ok) {
        throw new Error('Er is een fout opgetreden bij het verwerken van je vraag.')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let answer = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
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
                if (data.remainingQuestions !== undefined) {
                  setRemainingQuestions(data.remainingQuestions)
                }
              } catch (e) {
                // Ignore parsing errors for incomplete JSON
              }
            }
          }
        }
      }

      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { ...msg, answer, isLoading: false }
          : msg
      ))

    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { 
              ...msg, 
              answer: error instanceof Error ? error.message : 'Er is een onbekende fout opgetreden.',
              isLoading: false 
            }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, profession, messages, setMessages, setInput, setIsLoading, setRemainingQuestions, wetUitlegEnabled])

  const clearConversation = () => {
    setMessages([])
    localStorage.removeItem('wetHelder_conversation')
  }

  const handleSearchSelect = (searchTerm: string, profession: string) => {
    setInput(searchTerm)
    setProfession(mapProfileToProfession(profession))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const shareResponse = (question: string, answer: string) => {
    const shareText = `Vraag: ${question}\n\nAntwoord: ${answer}\n\nVia WetHelder.nl`
    navigator.clipboard.writeText(shareText)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Main Content */}
        <div className="w-full">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Juridische Assistent
                </h1>
                <p className="text-gray-600">
                  Stel je juridische vraag en krijg direct een betrouwbaar antwoord
                </p>
              </div>
            </div>

            {/* Rate limit info */}
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
                      Je hebt het maximum aantal gratis vragen bereikt.{' '}
                      <Link href="/auth/signin" className={`ml-1 underline hover:no-underline ${
                        remainingQuestions === 0 ? 'text-red-900' : 'text-amber-900'
                      }`}>
                        Maak een gratis account aan voor onbeperkte vragen
                      </Link>
                    </>
                  ) : (
                    <>
                      Je hebt nog {remainingQuestions} gratis vragen over.{' '}
                      <Link href="/auth/signin" className="ml-1 text-amber-900 underline hover:no-underline">
                        Log in voor onbeperkte vragen
                      </Link>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Chat Messages */}
          <div className="space-y-6 mb-6">
            {messages.map((message) => (
              <div key={message.id} className="space-y-4">
                {/* User Question */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 bg-white rounded-lg p-4 shadow-sm border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">Je vraag</span>
                      {message.profession && (
                        <Badge variant="secondary" className="text-xs">
                          {professionConfig[message.profession as keyof typeof professionConfig]?.label}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-800">{message.question}</p>
                  </div>
                </div>

                {/* WetHelder Response */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 bg-white rounded-lg p-4 shadow-sm border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900">WetHelder</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(message.answer)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => shareResponse(message.question, message.answer)}
                          className="h-8 w-8 p-0"
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Favoriet toevoegen"
                        >
                          <Heart className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {message.isLoading ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Aan het denken...</span>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        {formatText(message.answer)}
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
              <form onSubmit={(e) => handleSubmit(e, profession)} className="space-y-4">
                {/* Question Input */}
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Stel je juridische vraag..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading || !input.trim() || (!session && remainingQuestions === 0)}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Options */}
                <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
                  {/* Profession Selector */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Functieprofiel
                    </label>
                    <Select value={profession} onValueChange={(value) => setProfession(value as Profession)}>
                      <SelectTrigger className="w-full h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(professionConfig).map(([key, config]) => {
                          const IconComponent = config.icon
                          return (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                <span>{config.label}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Wet & Uitleg Toggle */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={wetUitlegEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setWetUitlegEnabled(!wetUitlegEnabled)}
                      className="h-9 flex items-center gap-2"
                    >
                      {wetUitlegEnabled ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                      <span className="text-xs">Wet & Uitleg</span>
                    </Button>
                  </div>

                  {/* Clear Button */}
                  {messages.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearConversation}
                      className="h-9"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Wissen
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Citation Generator Modal - Placeholder for future implementation */}
      {selectedCitationQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Citatie Generator</h3>
            <p className="text-gray-600 mb-4">
              Citatie functionaliteit voor: {selectedCitationQuery.question}
            </p>
            <Button onClick={() => setSelectedCitationQuery(null)}>
              Sluiten
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AskPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Laden...</p>
      </div>
    </div>}>
      <AskPageContent />
    </Suspense>
  )
}