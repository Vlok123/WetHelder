'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Search, ArrowLeft, Shield, Users, Car, Eye, FileText, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { politieWetData, PolitieWetArticle } from '@/lib/politie-wet-data'

// Icon mapping
const iconMap = {
  Shield, Users, Car, AlertCircle, Eye, FileText
}

// Categories data converted to lookup object
const categories = politieWetData.categories.reduce((acc, cat) => {
  acc[cat.slug] = {
    title: cat.title,
    description: cat.description,
    icon: iconMap[cat.icon as keyof typeof iconMap],
    color: cat.color
  }
  return acc
}, {} as Record<string, any>)

// Articles grouped by category
const articlesByCategory = politieWetData.articles.reduce((acc, article) => {
  if (!acc[article.categorySlug]) {
    acc[article.categorySlug] = []
  }
  acc[article.categorySlug].push(article)
  return acc
}, {} as Record<string, any>)

// Legacy categories format
const legacyCategories = {
  'bevoegdheden': {
    title: 'Algemene Bevoegdheden',
    description: 'Welke handelingen mag de politie verrichten?',
    icon: Shield,
    color: 'bg-blue-100 text-blue-800'
  },
  'id-fouilleren': {
    title: 'Identificatie & Fouilleren',
    description: 'Alles over ID-plicht, fouilleren, veiligheidsfouillering',
    icon: Users,
    color: 'bg-green-100 text-green-800'
  },
  'verkeer': {
    title: 'Verkeer',
    description: 'Politiebevoegdheden op de weg, blaastest, stopteken',
    icon: Car,
    color: 'bg-orange-100 text-orange-800'
  },
  'opsporing': {
    title: 'Opsporing & Aanhouding',
    description: 'Wanneer en hoe mag iemand worden aangehouden?',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-800'
  },
  'privacy': {
    title: 'Privacy & Informatie',
    description: 'Camerabeelden, persoonsgegevens, inzagerecht',
    icon: Eye,
    color: 'bg-purple-100 text-purple-800'
  },
  'klacht': {
    title: 'Klacht & Bezwaar',
    description: 'Hoe dien ik een klacht of bezwaar in tegen de politie?',
    icon: FileText,
    color: 'bg-yellow-100 text-yellow-800'
  }
}

// Sample articles data (in real implementation, this would come from a database or CMS)
const sampleArticles = {
  'id-fouilleren': [
    {
      slug: 'id-fouillering-op-straat',
      title: 'Mag de politie mij zomaar fouilleren op straat?',
      description: 'Uitleg over wanneer de politie een veiligheidsfouillering of preventief fouilleren mag toepassen.',
      readTime: '3 min lezen',
      lastUpdated: '2025-01-15',
      tags: ['fouilleren', 'veiligheidsfouillering', 'preventief']
    },
    {
      slug: 'id-plicht-nederland',
      title: 'Wanneer moet ik mijn ID tonen aan de politie?',
      description: 'Alles over de identificatieplicht in Nederland en wanneer je verplicht bent je ID te tonen.',
      readTime: '4 min lezen',
      lastUpdated: '2025-01-10',
      tags: ['identificatie', 'ID-plicht', 'legitimatie']
    }
  ],
  'verkeer': [
    {
      slug: 'verkeerscontrole-bevoegdheden',
      title: 'Wat mag de politie bij een verkeerscontrole?',
      description: 'Overzicht van politiebevoegdheden tijdens verkeerscontroles, van stopteken tot voertuigdoorzoeken.',
      readTime: '5 min lezen',
      lastUpdated: '2025-01-12',
      tags: ['verkeerscontrole', 'stopteken', 'doorzoeken']
    },
    {
      slug: 'blaastest-rechten',
      title: 'Moet ik meewerken aan een blaastest?',
      description: 'Uitleg over je rechten en plichten bij een alcoholcontrole en blaastest.',
      readTime: '3 min lezen',
      lastUpdated: '2025-01-08',
      tags: ['blaastest', 'alcohol', 'medewerkingsplicht']
    }
  ]
  // Add more categories as needed
}

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params.category as string
  const [searchQuery, setSearchQuery] = useState('')

  const category = categories[categorySlug] || legacyCategories[categorySlug as keyof typeof legacyCategories]
  const articles = articlesByCategory[categorySlug] || []

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Categorie niet gevonden</h1>
          <Button asChild>
            <Link href="/politie-wet">Terug naar overzicht</Link>
          </Button>
        </div>
      </div>
    )
  }

  const IconComponent = category.icon
  const filteredArticles = articles.filter((article: PolitieWetArticle) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" className="mb-4" asChild>
              <Link href="/politie-wet">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug naar overzicht
              </Link>
            </Button>
            
            <div className="flex items-center mb-6">
              <div className={`p-4 rounded-lg ${category.color} mr-4`}>
                <IconComponent className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {category.title}
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  {category.description}
                </p>
              </div>
            </div>

            {/* Search within category */}
            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder={`Zoek binnen ${category.title.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-3 border-2 border-gray-200 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Articles Grid */}
        <div className="max-w-4xl mx-auto">
          {filteredArticles.length > 0 ? (
            <div className="space-y-6">
              {filteredArticles.map((article: PolitieWetArticle) => (
                <Card key={article.slug} className="hover:shadow-lg transition-shadow">
                  <Link href={`/politie-wet/artikel/${article.slug}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl hover:text-blue-600 transition-colors mb-2">
                            {article.title}
                          </CardTitle>
                          <CardDescription className="text-base mb-3">
                            {article.description}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {article.readTime}
                          </div>
                          <span>Bijgewerkt: {new Date(article.lastUpdated).toLocaleDateString('nl-NL')}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {article.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Geen artikelen gevonden</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? `Geen resultaten voor "${searchQuery}" in deze categorie.`
                  : 'Er zijn nog geen artikelen in deze categorie.'
                }
              </p>
              {searchQuery && (
                <Button onClick={() => setSearchQuery('')} variant="outline">
                  Wis zoekopdracht
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Niet gevonden wat je zocht?</h3>
              <p className="text-gray-600 mb-6">
                Stel je specifieke vraag over {category.title.toLowerCase()} via ons contactformulier.
              </p>
              <Button size="lg" asChild>
                <Link href="/contact">
                  <FileText className="h-5 w-5 mr-2" />
                  Stel je vraag
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 