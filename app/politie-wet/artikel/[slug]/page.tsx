'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Clock, Calendar, Tags, Share2, BookOpen, MessageSquare, FileText, Eye, ThumbsUp, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { politieWetData } from '@/lib/politie-wet-data'
import { formatPolitieWetContent } from '@/lib/textFormatter'

// Articles lookup object
const articlesLookup = politieWetData.articles.reduce((acc, article) => {
  acc[article.slug] = article
  return acc
}, {} as Record<string, typeof politieWetData.articles[0]>)

// Legacy sample articles for fallback
const legacySampleArticles = {
  'id-fouillering-op-straat': {
    title: 'Mag de politie mij zomaar fouilleren op straat?',
    category: 'Identificatie & Fouilleren',
    categorySlug: 'id-fouilleren',
    seoTitle: 'Mag de politie mij zomaar fouilleren op straat?',
    seoDescription: 'Uitleg in heldere taal over momenten waarop de politie een veiligheidsfouillering of preventief fouilleren mag toepassen.',
    readTime: '3 min lezen',
    lastUpdated: '2025-01-15',
    views: 2847,
    tags: ['fouilleren', 'veiligheidsfouillering', 'preventief'],
    content: `## Kort antwoord

Nee, fouilleren op straat mag alleen onder specifieke voorwaarden. De politie heeft een wettelijke grondslag nodig en moet kunnen uitleggen waarom zij jou willen fouilleren.

## Wanneer is fouilleren toegestaan?

### 1. Veiligheidsfouillering (art. 8 Politiewet 2012)
De politie mag een veiligheidsfouillering uitvoeren wanneer:
- Er een redelijk vermoeden bestaat dat je gevaarlijke voorwerpen bij je draagt
- Dit nodig is ter bescherming van de veiligheid van de politieambtenaar of anderen
- Bijvoorbeeld voorafgaand aan een aanhouding of bij het betreden van een politiebureau

### 2. Preventief fouilleren (art. 8a Politiewet 2012)
Preventief fouilleren is toegestaan:
- In aangewezen veiligheidsrisicogebieden
- Wanneer de burgemeester hiervoor een besluit heeft genomen
- Ook zonder concreet vermoeden tegen een specifiek persoon
- Dit moet wel proportioneel zijn en mag niet discriminerend plaatsvinden

### 3. Fouillering bij aanhouding
Bij een rechtmatige aanhouding mag de politie altijd fouilleren om:
- Gevaarlijke voorwerpen weg te nemen
- Bewijsmateriaal veilig te stellen
- Te voorkomen dat je vlucht

## Wat zijn jouw rechten?

### Informatieplicht politie
De politie moet je vertellen:
- Waarom zij je fouilleren
- Op welke wettelijke grondslag
- Wat zij zoeken

### Jouw wettelijke rechten
- Vraag naar de reden: Je mag altijd vragen waarom je gefouilleerd wordt
- Vraag om identificatie: De agent moet zich legitimeren als je daarom vraagt  
- Recht op respect: De fouillering moet respectvol gebeuren
- Geslacht: Zo mogelijk door agent van hetzelfde geslacht (behalve bij spoed)
- Locatie: Bij voorkeur niet in het openbaar, tenzij dit niet anders kan

### Mag je weigeren?
- Veiligheidsfouillering: Nee, als er een wettelijke grondslag is
- Preventief fouilleren: Nee, in aangewezen gebieden
- Zonder grondslag: Ja, je mag vragen naar de wettelijke basis

## Wat mag de politie tijdens fouillering?

### Toegestaan
- Aftasten van kleding en lichaam
- Legen van zakken
- Onderzoek van tassen en voorwerpen die je bij je draagt
- Tijdelijk wegnemen van gevaarlijke voorwerpen

### Niet toegestaan zonder extra bevoegdheid
- Uitkleden (daarvoor zijn strengere regels)
- Inwendig onderzoek
- Onderzoek van lichaamsopeningen
- Langdurig vasthouden zonder arrestatie

## Wat te doen bij problemen?

### Tijdens de fouillering
- Blijf kalm en werk mee
- Stel je vragen op respectvolle wijze
- Onthoud details: naam agent, tijdstip, locatie
- Protesteer niet fysiek, dit kan leiden tot aanhouding

### Na de fouillering
- Klacht indienen: Bij de politie zelf of bij de Nationale ombudsman
- Advocaat: Bij ernstige problemen kun je juridische bijstand zoeken
- Getuigen: Vraag contactgegevens van eventuele getuigen

## Samenvatting

- Politie moet duidelijke reden hebben voor fouillering
- Burger mag vragen naar grondslag en uitleg
- Respectvolle behandeling is verplicht
- Klachtrecht bestaat altijd bij onrechtmatige fouillering

Heb je een andere situatie?
Iedere situatie is anders. Voor specifiek juridisch advies over jouw situatie kun je contact opnemen via ons contactformulier.`
  },
  'verkeerscontrole-bevoegdheden': {
    title: 'Wat mag de politie bij een verkeerscontrole?',
    category: 'Verkeer',
    categorySlug: 'verkeer',
    seoTitle: 'Wat mag de politie bij een verkeerscontrole?',
    seoDescription: 'Overzicht van politiebevoegdheden tijdens verkeerscontroles, van stopteken tot voertuigdoorzoeken.',
    readTime: '5 min lezen',
    lastUpdated: '2025-01-12',
    views: 1654,
    tags: ['verkeerscontrole', 'stopteken', 'doorzoeken'],
    content: `## Kort antwoord

De politie heeft uitgebreide bevoegdheden bij verkeerscontroles, maar deze moeten wel proportioneel zijn en er moet een wettelijke grondslag zijn voor elke handeling.

## Stopteken geven

### Wanneer mag de politie je laten stoppen?
- Algemene verkeerscontrole: Altijd toegestaan voor controle rijbewijs, kentekenbewijs en verzekering
- Verkeersovertreding: Bij observatie van verkeersovertredingen
- Verdachte situaties: Bij redelijke vermoedens van strafbare feiten
- Grootschalige controles: Bij verkeersacties en alcohol/drugscontroles

### Moet je altijd stoppen?
Ja, altijd. Het negeren van een stopteken is een strafbaar feit (art. 179 Wegenverkeerswet).

## Documenten controleren

### Welke documenten mag de politie vragen?
- Rijbewijs: Verplicht bij besturen van motorvoertuigen
- Kentekenbewijs: Moet in het voertuig aanwezig zijn
- Verzekeringsbewijs: Bewijs van WA-verzekering
- Identiteitsbewijs: In bepaalde situaties (identificatieplicht)

### Wat als je documenten vergeten bent?
- Je kunt een boete krijgen
- De politie kan het voertuig stilzetten
- Soms krijg je de kans documenten binnen 24 uur te tonen

## Alcohol- en drugscontroles

### Blaastest
- Verplichte medewerking: Je moet meewerken aan een blaastest
- Weigering: Is strafbaar en leidt tot rijontzegging
- Positieve uitslag: Kan leiden tot bloedonderzoek

### Drugstest
- Speekseltest: Politie mag drugstest afnemen
- Verplichte medewerking: Ook hier geldt medewerkingsplicht
- Weigering: Is strafbaar`
  }
}

export default function ArticlePage() {
  const params = useParams()
  const articleSlug = params.slug as string
  const [liked, setLiked] = useState(false)

  const article = articlesLookup[articleSlug] || legacySampleArticles[articleSlug as keyof typeof legacySampleArticles]

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Artikel niet gevonden</h1>
          <Button asChild>
            <Link href="/politie-wet">Terug naar overzicht</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.seoDescription,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link gekopieerd naar klembord!')
    }
  }

  const formatContent = (content: string) => {
    // Split content into paragraphs first
    const paragraphs = content.split('\n\n').filter(p => p.trim())
    
    return paragraphs.map(paragraph => {
      // Process headers
      if (paragraph.startsWith('## ')) {
        return `<h2 class="text-2xl font-bold mt-8 mb-6 text-gray-900 border-b border-gray-200 pb-2">${paragraph.replace('## ', '')}</h2>`
      }
      
      if (paragraph.startsWith('### ')) {
        return `<h3 class="text-xl font-semibold mt-6 mb-4 text-gray-800">${paragraph.replace('### ', '')}</h3>`
      }
      
      // Process horizontal rules
      if (paragraph.trim() === '---') {
        return '<hr class="my-8 border-gray-300">'
      }
      
      // Process bullet lists
      if (paragraph.includes('\n* ')) {
        const items = paragraph.split('\n').filter(line => line.startsWith('* '))
          .map(item => {
            let itemContent = item.replace('* ', '')
            itemContent = formatPolitieWetContent(itemContent)
            return `<li class="mb-1">${itemContent}</li>`
          })
          .join('')
        return `<ul class="list-disc pl-6 mb-6 space-y-1">${items}</ul>`
      }
      
      // Process regular paragraphs
      let processed = paragraph
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
        .replace(/\n/g, '<br>')
      
      // Apply comprehensive politie-wet content formatting
      processed = formatPolitieWetContent(processed)
      
      return `<p class="mb-6 leading-relaxed text-gray-700">${processed}</p>`
    }).join('')
  }

  // Legacy alias voor backwards compatibility - nu gebruikt de shared functie
  const formatLegalTerms = formatPolitieWetContent

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb and back button */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/politie-wet" className="hover:text-blue-600">
              Politie & Wet
            </Link>
            <span>/</span>
            <Link href={`/politie-wet/${article.categorySlug}`} className="hover:text-blue-600">
              {article.category}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{article.title}</span>
          </div>

          <Button variant="ghost" className="mb-6" asChild>
            <Link href={`/politie-wet/${article.categorySlug}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar {article.category}
            </Link>
          </Button>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center mb-4">
              <Badge variant="secondary" className="mr-3">
                {article.category}
              </Badge>
              <div className="flex items-center text-sm text-gray-600 space-x-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {article.readTime}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Bijgewerkt: {new Date(article.lastUpdated).toLocaleDateString('nl-NL')}
                </div>

              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tags className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLiked(!liked)}
                  className={liked ? 'text-red-600 border-red-200' : ''}
                >
                  <ThumbsUp className={`h-4 w-4 mr-1 ${liked ? 'fill-current' : ''}`} />
                  Nuttig
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Delen
                </Button>
              </div>
            </div>
          </header>

          <hr className="mb-8 border-gray-200" />

          {/* Article Content */}
          <article className="prose prose-lg max-w-none">
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ 
                __html: formatContent(article.content)
              }}
            />
          </article>

          <hr className="my-12 border-gray-200" />

          {/* Fout gevonden knop */}
          <div className="flex justify-end mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="text-gray-600 hover:text-gray-800"
            >
              <Link href="/contact">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Fout gevonden?
              </Link>
            </Button>
          </div>

          {/* Call to Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Nog vragen?
                </CardTitle>
                <CardDescription>
                  Voor specifieke situaties of aanvullende vragen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/contact">
                    Stel je vraag
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Meer weten?
                </CardTitle>
                <CardDescription>
                  Bekijk meer artikelen in deze categorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/politie-wet/${article.categorySlug}`}>
                    Bekijk {article.category}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Footer disclaimer */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <p className="text-orange-700 text-sm leading-relaxed">
                <strong>Disclaimer:</strong> Dit artikel bevat algemene juridische informatie en vervangt geen persoonlijk juridisch advies. 
                Voor specifieke situaties raden wij aan om contact op te nemen met een gekwalificeerde jurist of gebruik te maken van ons{' '}
                <Link href="/contact" className="text-orange-800 underline hover:text-orange-900">
                  contactformulier
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 