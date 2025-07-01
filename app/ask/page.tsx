'use client'

import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  Bookmark,
  AlertTriangle,
  Sparkles,
  Zap,
  Plus,
  MoreHorizontal
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

type Profession = 'aspirant' | 'student' | 'politieagent' | 'advocaat' | 'algemeen' | 'boa' | 'rechter' | 'notaris' | 'deurwaarder' | 'bedrijfsjurist' | 'gemeenteambtenaar' | 'belastingadviseur' | 'accountant' | 'makelaar' | 'verzekeringsagent' | 'hr-medewerker' | 'compliance-officer' | 'veiligheidsbeambte' | 'beveiliger' | 'gemeentejurist' | 'trainer' | 'vervoersmedewerker' | 'zorgprofessional' | 'officier' | 'juridischmedewerker' | 'parkeercontroleur'

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
    description: 'Specifieke BOA-bevoegdheden, APV-handhaving, processenverbaal en bestuurlijke procedures'
  },
  rechter: {
    icon: Gavel,
    label: 'Rechter/Magistraat',
    color: 'text-red-700 bg-red-50 border-red-200',
    description: 'Juridische grondslag voor uitspraken, bewijswaardering, straftoemeting en procesrecht'
  },
  notaris: {
    icon: FileText,
    label: 'Notaris',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    description: 'Burgerlijk recht, contractenrecht, familierecht, vastgoedrecht en notariële praktijk'
  },
  deurwaarder: {
    icon: FileText,
    label: 'Gerechtsdeurwaarder',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    description: 'Executierecht, beslagprocedures, dwangsom, betekening en gerechtelijke procedures'
  },
  bedrijfsjurist: {
    icon: Building,
    label: 'Bedrijfsjurist',
    color: 'text-slate-700 bg-slate-50 border-slate-200',
    description: 'Ondernemingsrecht, contractenrecht, compliance, AVG en bedrijfsrechtelijke kwesties'
  },
  gemeenteambtenaar: {
    icon: MapPin,
    label: 'Gemeenteambtenaar',
    color: 'text-green-700 bg-green-50 border-green-200',
    description: 'Bestuurlijke procedures, vergunningen, APV-toepassing en gemeentelijke bevoegdheden'
  },
  gemeentejurist: {
    icon: Building,
    label: 'Gemeentejurist',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    description: 'Bestuursrecht, bestuurlijke sancties, bezwaar & beroep en gemeentelijke wetgeving'
  },
  belastingadviseur: {
    icon: Calculator,
    label: 'Belastingadviseur',
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    description: 'Fiscaal recht, belastingwetgeving, procedures bij de Belastingdienst en belastingzaken'
  },
  accountant: {
    icon: Calculator,
    label: 'Accountant',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    description: 'Financieel recht, verslaggeving, boekhoudwetgeving en fiscale aspecten'
  },
  makelaar: {
    icon: Home,
    label: 'Makelaar',
    color: 'text-teal-700 bg-teal-50 border-teal-200',
    description: 'Vastgoedrecht, makelaarsrecht, koopcontracten en eigendomsoverdracht'
  },
  verzekeringsagent: {
    icon: Shield,
    label: 'Verzekeringsagent',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    description: 'Verzekeringsrecht, aansprakelijkheid, schadeafhandeling en verzekeringscontracten'
  },
  'hr-medewerker': {
    icon: Users,
    label: 'HR-medewerker',
    color: 'text-pink-700 bg-pink-50 border-pink-200',
    description: 'Arbeidsrecht, personeelsbeleid, ontslag, AVG-privacy en arbeidsvoorwaarden'
  },
  'compliance-officer': {
    icon: CheckCircle,
    label: 'Compliance Officer',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    description: 'Toezichtrecht, compliance-procedures, risicobeheersing en regelgeving'
  },
  veiligheidsbeambte: {
    icon: Shield,
    label: 'Veiligheidsbeambte',
    color: 'text-red-700 bg-red-50 border-red-200',
    description: 'Veiligheidsrecht, preventieve maatregelen, incidentmanagement en veiligheidsprocedures'
  },
  beveiliger: {
    icon: Shield,
    label: 'Beveiliger',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    description: 'Private beveiliging, eigendomsbescherming, arrestatiebevoegdheden en bewakingswet'
  },
  trainer: {
    icon: GraduationCap,
    label: 'Trainer/Opleider',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    description: 'Educatieve juridische uitleg, voorbeelden en casus voor training en onderwijs'
  },
  vervoersmedewerker: {
    icon: Users,
    label: 'Vervoersmedewerker',
    color: 'text-green-700 bg-green-50 border-green-200',
    description: 'Vervoersrecht, OV-bevoegdheden, controle en handhaving in openbaar vervoer'
  },
  zorgprofessional: {
    icon: Heart,
    label: 'Zorgprofessional',
    color: 'text-pink-700 bg-pink-50 border-pink-200',
    description: 'Zorgrecht, medische privacy, tuchtrecht en patiëntrechten'
  },
  aspirant: {
    icon: UserCheck,
    label: 'Aspirant-agent',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    description: 'Uitgebreide uitleg van politiebevoegdheden met praktijkvoorbeelden en leerdoelen'
  },
  student: {
    icon: GraduationCap,
    label: 'Student/Stagiair',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    description: 'Theoretische juridische grondslagen, leermaterialen en begrippenuitleg'
  },
  officier: {
    icon: Shield,
    label: 'Officier van Justitie',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    description: 'Strafrecht, vervolgingsbeleid, sepot-gronden en strafrechtelijke procedures'
  },
  juridischmedewerker: {
    icon: FileText,
    label: 'Juridisch Medewerker',
    color: 'text-slate-700 bg-slate-50 border-slate-200',
    description: 'Praktische juridische ondersteuning, dossiervoorbereiding en procedurele aspecten'
  },
  parkeercontroleur: {
    icon: MapPin,
    label: 'Parkeercontroleur',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
    description: 'Parkeerreglement, RVV-bepalingen, parkeerboetes en handhavingsprocedures'
  }
}

const formatText = (text: string): React.ReactElement => {
  if (!text) return <div></div>
  
  const processLinksInText = (text: string): React.ReactNode => {
    const urlRegex = /(https?:\/\/[^\s)]+(?:\([^\s)]*\))?[^\s.,;!?)]*)(?![^<]*>)/g
    const parts = text.split(urlRegex)
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const cleanUrl = part.replace(/[.,;!?]*$/, '')
        return (
          <a
            key={index}
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all"
          >
            {cleanUrl}
          </a>
        )
      }
      return part
    })
  }

  try {
    return (
      <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <h1 className="text-lg font-semibold text-gray-900 mt-4 mb-2 first:mt-0">{children}</h1>,
            h2: ({ children }) => <h2 className="text-base font-semibold text-gray-900 mt-3 mb-2 first:mt-0">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-900 mt-3 mb-1 first:mt-0">{children}</h3>,
            h4: ({ children }) => <h4 className="text-sm font-medium text-gray-800 mt-2 mb-1 first:mt-0">{children}</h4>,
            p: ({ children }) => (
              <p className="mb-3 last:mb-0 text-gray-800 leading-relaxed">
                {typeof children === 'string' ? processLinksInText(children) : children}
              </p>
            ),
            ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 text-gray-800">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-800">{children}</ol>,
            li: ({ children }) => <li className="text-gray-800">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
            em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-3 border-blue-300 pl-4 py-2 bg-blue-50 rounded-r-md mb-3 text-gray-700 italic">
                {children}
              </blockquote>
            ),
            code: ({ children, className }) => {
              const isInline = !className
              if (isInline) {
                return <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
              }
              return (
                <pre className="bg-gray-100 text-gray-800 p-3 rounded-md overflow-x-auto mb-3">
                  <code className="text-sm font-mono">{children}</code>
                </pre>
              )
            },
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-words"
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto mb-3">
                <table className="min-w-full border border-gray-300 text-sm">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-left font-semibold text-gray-900">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-gray-300 px-3 py-2 text-gray-800">
                {children}
              </td>
            ),
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    )
  } catch (error) {
    console.error('Markdown rendering error:', error)
    return (
      <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
        {text.split('\n').map((line, index) => (
          <p key={index} className="mb-2 last:mb-0">
            {typeof line === 'string' ? processLinksInText(line) : line}
          </p>
        ))}
      </div>
    )
  }
}

const mapProfileToProfession = (profile: string): Profession => {
  const profileMapping: Record<string, Profession> = {
    'ASPIRANT': 'aspirant',
    'POLITIEAGENT': 'politieagent',
    'ADVOCAAT': 'advocaat',
    'RECHTER': 'rechter',
    'STUDENT': 'student',
    'BOA': 'boa',
    'NOTARIS': 'notaris',
    'DEURWAARDER': 'deurwaarder',
    'BEDRIJFSJURIST': 'bedrijfsjurist',
    'GEMEENTEAMBTENAAR': 'gemeenteambtenaar',
    'BELASTINGADVISEUR': 'belastingadviseur',
    'ACCOUNTANT': 'accountant',
    'MAKELAAR': 'makelaar',
    'VERZEKERINGSAGENT': 'verzekeringsagent',
    'HR_MEDEWERKER': 'hr-medewerker',
    'COMPLIANCE_OFFICER': 'compliance-officer',
    'VEILIGHEIDSBEAMBTE': 'veiligheidsbeambte',
    'BEVEILIGER': 'beveiliger',
    'GEMEENTEJURIST': 'gemeentejurist',
    'TRAINER': 'trainer',
    'VERVOERSMEDEWERKER': 'vervoersmedewerker',
    'ZORGPROFESSIONAL': 'zorgprofessional',
    'OFFICIER': 'officier',
    'JURIDISCHMEDEWERKER': 'juridischmedewerker',
    'PARKEERCONTROLEUR': 'parkeercontroleur'
  }
  
  return profileMapping[profile.toUpperCase()] || 'algemeen'
}

function AskPageContent() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [profession, setProfession] = useState<Profession>('algemeen')
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null)
  const [selectedCitationQuery, setSelectedCitationQuery] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const searchQuery = searchParams.get('q')
    const searchProfession = searchParams.get('profession')
    
    if (searchQuery) {
      setInput(searchQuery)
      if (searchProfession && professionConfig[searchProfession as keyof typeof professionConfig]) {
        setProfession(searchProfession as Profession)
      }
      
      // Clear URL parameters after setting the form
      if (window.history?.replaceState) {
        window.history.replaceState({}, '', '/ask')
      }
    }
  }, [searchParams])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    if (!session) {
      const checkRateLimit = async () => {
        try {
          const response = await fetch('/api/ask')
          if (response.ok) {
            const data = await response.json()
            setRemainingQuestions(data.remainingQuestions)
          }
        } catch (error) {
          console.error('Error checking rate limit:', error)
        }
      }
      
      checkRateLimit()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent, selectedProfession: Profession) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    if (!session && remainingQuestions === 0) return

    const question = input.trim()
    setInput('')
    setIsLoading(true)

    // Create temporary message with loading state
    const tempMessage: Message = {
      id: Date.now().toString(),
      question,
      answer: '',
      sources: [],
      isLoading: true,
      profession: selectedProfession,
      timestamp: new Date(),
      type: 'assistant'
    }

    setMessages(prev => [...prev, tempMessage])

    // Update remaining questions immediately for anonymous users
    if (!session && remainingQuestions !== null) {
      setRemainingQuestions(prev => prev !== null ? Math.max(0, prev - 1) : null)
    }

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question,
          profession: selectedProfession 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Er is iets misgegaan')
      }

      const data = await response.json()
      
      // Update the message with actual response
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? {
              ...msg,
              answer: data.answer,
              sources: data.sources || [],
              isLoading: false,
              queryId: data.queryId
            }
          : msg
      ))

      // Update remaining questions for anonymous users
      if (!session && data.remainingQuestions !== undefined) {
        setRemainingQuestions(data.remainingQuestions)
      }

    } catch (error) {
      console.error('Error:', error)
      
      // Update message with error
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? {
              ...msg,
              answer: `Sorry, er is een fout opgetreden: ${error instanceof Error ? error.message : 'Onbekende fout'}. Probeer het opnieuw.`,
              sources: [],
              isLoading: false
            }
          : msg
      ))

      // Restore remaining questions on error for anonymous users
      if (!session && remainingQuestions !== null) {
        setRemainingQuestions(prev => prev !== null ? prev + 1 : null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const clearConversation = () => {
    setMessages([])
  }

  const handleSearchSelect = (searchTerm: string, profession: string) => {
    setInput(searchTerm)
    setProfession(profession as Profession)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const shareResponse = (question: string, answer: string) => {
    const shareText = `Vraag: ${question}\n\nAntwoord: ${answer}\n\nVia WetHelder.nl`
    navigator.clipboard.writeText(shareText)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Juridische Assistent
              </h1>
              <p className="text-sm text-gray-600 mt-1">Stel je juridische vraag en krijg direct een betrouwbaar antwoord</p>
            </div>
            
            {/* Quick actions */}
            <div className="flex items-center gap-2">
              <Link href="/wetuitleg">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Scale className="h-4 w-4 mr-2" />
                  Wetuitleg
                </Button>
              </Link>
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearConversation}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-32">
        
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="py-12">
            {/* Rate limit notification */}
            {!session && remainingQuestions !== null && (
              <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                remainingQuestions === 0 
                  ? 'bg-red-50/50 border-l-red-400 border-red-100' 
                  : 'bg-slate-50/50 border-l-slate-400 border-slate-100'
              }`}>
                <div className="flex items-start gap-3">
                  <Info className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                    remainingQuestions === 0 ? 'text-red-600' : 'text-slate-600'
                  }`} />
                  <div>
                    {remainingQuestions === 0 ? (
                      <div>
                        <p className="font-medium text-red-900">Gratis vragen gebruikt</p>
                        <p className="text-sm mt-1 text-red-800">
                          Je hebt het maximum aantal gratis vragen bereikt.{' '}
                          <Link href="/auth/signin" className="underline font-medium hover:no-underline text-red-700">
                            Maak een gratis account aan voor onbeperkte vragen
                          </Link>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-slate-900">Nog {remainingQuestions} gratis vragen</p>
                        <p className="text-sm mt-1 text-slate-700">
                          <Link href="/auth/signin" className="underline font-medium hover:no-underline text-slate-800">
                            Log in voor onbeperkte vragen
                          </Link>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Welcome message */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Hoe kan ik je helpen?</h2>
              <p className="text-gray-600 max-w-lg mx-auto">
                Stel je juridische vraag en krijg direct een betrouwbaar antwoord op basis van Nederlandse wetgeving.
              </p>
            </div>

            {/* Quick starter questions */}
            <div className="grid gap-3 max-w-2xl mx-auto mb-8">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Populaire vragen:</h3>
              {[
                { question: "Mag de politie mijn telefoon controleren?", profession: "algemeen" },
                { question: "Wat is het verschil tussen aanhouding en arrestatie?", profession: "politieagent" },
                { question: "Wanneer mag ik als BOA een boete uitschrijven?", profession: "boa" },
                { question: "Hoe lang duurt een strafrechtelijke procedure?", profession: "advocaat" }
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchSelect(item.question, item.profession)}
                  className="text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 group-hover:text-blue-700">{item.question}</span>
                    <Send className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                  </div>
                </button>
              ))}
            </div>

            {/* Disclaimer - Subtiel ontwerp */}
            <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-200/50">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Info className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Juridische Informatie</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    WetHelder biedt juridische informatie, maar vervangt geen persoonlijk advies van een 
                    juridisch professional. Voor complexe casussen raadpleeg altijd een advocaat, 
                    notaris of andere gekwalificeerde professional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.length > 0 && (
          <div className="py-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="space-y-4">
                {/* User Question */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-blue-50 rounded-2xl rounded-tl-md p-4 max-w-3xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-blue-900">Je vraag</span>
                        {message.profession && (
                          <Badge variant="secondary" className="text-xs bg-white/80">
                            {professionConfig[message.profession as keyof typeof professionConfig]?.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-blue-900 leading-relaxed">{message.question}</p>
                    </div>
                  </div>
                </div>

                {/* WetHelder Response */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-2xl rounded-tl-md p-4 max-w-3xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-900">WetHelder</span>
                        {!message.isLoading && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(message.answer)}
                              className="h-8 w-8 p-0 hover:bg-gray-200"
                              title="Kopieer antwoord"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => shareResponse(message.question, message.answer)}
                              className="h-8 w-8 p-0 hover:bg-gray-200"
                              title="Deel antwoord"
                            >
                              <Share2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/contact/fout?vraag=${encodeURIComponent(message.question)}&antwoord=${encodeURIComponent(message.answer.substring(0, 200))}...`, '_blank')}
                              className="h-8 w-8 p-0 hover:bg-gray-200 text-orange-600"
                              title="Fout melden"
                            >
                              <AlertTriangle className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {message.isLoading ? (
                        <div className="flex items-center gap-3 text-gray-600 py-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Aan het denken...</span>
                        </div>
                      ) : (
                        <div className="text-sm">
                          {formatText(message.answer)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Form */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 backdrop-blur-md bg-white/95">
        <div className="max-w-4xl mx-auto p-4">
          <form onSubmit={(e) => handleSubmit(e, profession)} className="space-y-3">
            {/* Main input row */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      const form = e.currentTarget.closest('form')
                      if (form) {
                        const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
                        form.dispatchEvent(submitEvent)
                      }
                    }
                  }}
                  placeholder="Stel je juridische vraag... (Shift+Enter voor nieuwe regel)"
                  className="min-h-[56px] resize-none rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  rows={1}
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim() || (!session && remainingQuestions === 0)}
                className="h-14 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Options row */}
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <Select value={profession} onValueChange={(value) => setProfession(value as Profession)}>
                  <SelectTrigger className="h-9 bg-gray-50 border-gray-200 rounded-lg">
                    <SelectValue placeholder="Selecteer je beroep" />
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
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">Enter</kbd>
                <span>verzenden</span>
                <span>•</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">Shift+Enter</kbd>
                <span>nieuwe regel</span>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Citation Generator Modal - Placeholder for future implementation */}
      {selectedCitationQuery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Citatie Generator</h3>
            <p className="text-gray-600 mb-4">
              Citatie functionaliteit voor: {selectedCitationQuery.question}
            </p>
            <Button onClick={() => setSelectedCitationQuery(null)} className="w-full">
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
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Laden...</p>
      </div>
    </div>}>
      <AskPageContent />
    </Suspense>
  )
}