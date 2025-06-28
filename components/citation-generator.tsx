'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Quote, 
  Copy, 
  Download, 
  RefreshCw,
  Check,
  BookOpen,
  FileText
} from 'lucide-react'

interface CitationData {
  style: string
  citation: string
  allStyles: {
    apa: string
    mla: string
    chicago: string
    harvard: string
    vancouver: string
  }
  metadata: {
    queryId: string
    question: string
    accessDate: string
    generatedAt: string
  }
}

interface CitationGeneratorProps {
  queryId: string
  question: string
  className?: string
}

const citationStyles = [
  { key: 'apa', name: 'APA', description: 'American Psychological Association' },
  { key: 'mla', name: 'MLA', description: 'Modern Language Association' },
  { key: 'chicago', name: 'Chicago', description: 'Chicago Manual of Style' },
  { key: 'harvard', name: 'Harvard', description: 'Harvard Referencing' },
  { key: 'vancouver', name: 'Vancouver', description: 'Vancouver System' }
]

export function CitationGenerator({ queryId, question, className }: CitationGeneratorProps) {
  const [citationData, setCitationData] = useState<CitationData | null>(null)
  const [selectedStyle, setSelectedStyle] = useState('apa')
  const [loading, setLoading] = useState(false)
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null)

  const generateCitation = async (style: string = selectedStyle) => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/citations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          queryId,
          citationStyle: style
        })
      })

      if (response.ok) {
        const data = await response.json()
        setCitationData(data.citations)
        setSelectedStyle(style)
      }
    } catch (error) {
      console.error('Error generating citation:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, style: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStyle(style)
      setTimeout(() => setCopiedStyle(null), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const downloadCitation = (text: string, style: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `citatie-${style}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAllCitations = () => {
    if (!citationData) return

    const allCitations = Object.entries(citationData.allStyles)
      .map(([style, citation]) => `${style.toUpperCase()} CITATIE:\n${citation}\n\n`)
      .join('---\n\n')

    const fullText = `CITATIES VOOR JURIDISCHE VRAAG
Vraag: ${citationData.metadata.question}
Gegenereerd op: ${new Date(citationData.metadata.generatedAt).toLocaleString('nl-NL')}

${allCitations}

Gegenereerd door WetHelder - https://wethelder.nl`

    const blob = new Blob([fullText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `alle-citaties-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Quote className="h-5 w-5" />
          Citatie Generator
        </CardTitle>
        <CardDescription>
          Genereer academische citaties voor deze juridische vraag
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Question Preview */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-start gap-2">
            <BookOpen className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Vraag:</p>
              <p className="text-sm text-muted-foreground line-clamp-2">{question}</p>
            </div>
          </div>
        </div>

        {/* Citation Style Selection */}
        <div>
          <p className="text-sm font-medium mb-2">Selecteer citatiestijl:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {citationStyles.map((style) => (
              <Button
                key={style.key}
                variant={selectedStyle === style.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStyle(style.key)}
                className="justify-start"
              >
                {style.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={() => generateCitation()}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Genereren...
            </>
          ) : (
            <>
              <Quote className="h-4 w-4 mr-2" />
              Genereer Citatie
            </>
          )}
        </Button>

        {/* Citation Results */}
        {citationData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Gegenereerde Citaties</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadAllCitations}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Alle
              </Button>
            </div>

            {/* All Citation Styles */}
            <div className="space-y-3">
              {Object.entries(citationData.allStyles).map(([style, citation]) => (
                <Card key={style} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {citationStyles.find(s => s.key === style)?.name || style.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {citationStyles.find(s => s.key === style)?.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(citation, style)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedStyle === style ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadCitation(citation, style)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="p-3 bg-muted rounded text-sm font-mono whitespace-pre-wrap">
                      {citation}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Metadata */}
            <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-3 w-3" />
                <span className="font-medium">Citatie informatie:</span>
              </div>
              <p>Gegenereerd op: {new Date(citationData.metadata.generatedAt).toLocaleString('nl-NL')}</p>
              <p>Toegangsdatum: {citationData.metadata.accessDate}</p>
              <p className="mt-2 text-xs">
                 <strong>Tip:</strong> Controleer altijd de citatie-eisen van je instelling en pas indien nodig aan.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 