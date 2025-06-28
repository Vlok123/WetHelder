'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, ChevronUp, Shield, Users, Car, Eye, FileText, AlertCircle, Construction } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { politieWetData } from '@/lib/politie-wet-data'

export default function PolitieWetPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log('Zoeken naar:', searchQuery)
  }

  // Get icon component for each category
  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Shield,
      Users,
      Car,
      AlertCircle,
      Eye,
      FileText
    }
    return icons[iconName] || Shield
  }

  // Filter featured articles (only show articles that actually exist)
  const featuredArticles = politieWetData.articles.filter(article => article.featured)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Shield className="h-12 w-12 text-blue-600 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Politie & Wet
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              Duidelijke antwoorden op veelgestelde vragen over politiewetgeving en jouw rechten als burger
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Zoek bijvoorbeeld: 'fouilleren', 'aanhouding', 'verkeerscontrole'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-4 text-lg border-2 border-gray-200 focus:border-blue-500"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  Zoeken
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Content Development Notice */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <Construction className="h-5 w-5 mr-2" />
              Content in ontwikkeling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 leading-relaxed">
              Er wordt hard gewerkt aan het uitbreiden van de Politie & Wet sectie met meer artikelen en onderwerpen. 
              Nieuwe content komt snel online! Heb je een specifieke vraag? Stel deze via ons{' '}
              <Link href="/contact" className="text-blue-800 underline hover:text-blue-900">
                contactformulier
              </Link>
              .
            </p>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="mb-12 border-orange-200 bg-orange-50">
          <CardHeader>
            <button
              onClick={() => setIsDisclaimerOpen(!isDisclaimerOpen)}
              className="flex items-center justify-between w-full text-left"
            >
              <CardTitle className="text-orange-800 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Belangrijke disclaimer
              </CardTitle>
              {isDisclaimerOpen ? (
                <ChevronUp className="h-5 w-5 text-orange-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-orange-600" />
              )}
            </button>
          </CardHeader>
          {isDisclaimerOpen && (
            <CardContent className="pt-0">
              <p className="text-orange-700 leading-relaxed">
                De antwoorden op deze pagina zijn gebaseerd op <strong>algemene situaties</strong> en op de wet- en regelgeving zoals die <strong>nu</strong> geldt.
                Bijzondere of uitzonderlijke omstandigheden kunnen tot een andere uitkomst leiden, omdat wetgeving soms via meerdere bepalingen of procedures kan verlopen.
                Heb je een <strong>specifieke vraag</strong> of lijkt jouw situatie af te wijken? Stel je vraag via het{' '}
                <Link href="/contact" className="text-orange-800 underline hover:text-orange-900">
                  contactformulier
                </Link>
                . Je ontvangt dan een maatwerk-uitwerking.
              </p>
            </CardContent>
          )}
        </Card>

        {/* Categories Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Onderwerpen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {politieWetData.categories.map((category) => {
              const IconComponent = getIconComponent(category.icon)
              return (
                <Card key={category.slug} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <Link href={`/politie-wet/${category.slug}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-lg ${category.color}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {category.articleCount} artikel{category.articleCount !== 1 ? 'en' : ''}
                        </Badge>
                      </div>
                      <CardTitle className="group-hover:text-blue-600 transition-colors">
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {category.description}
                      </CardDescription>
                    </CardContent>
                  </Link>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Beschikbare artikelen</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredArticles.map((article) => (
                <Card key={article.slug} className="hover:shadow-lg transition-shadow">
                  <Link href={`/politie-wet/artikel/${article.slug}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Eye className="h-4 w-4 mr-1" />
                          {article.views.toLocaleString()}
                        </div>
                      </div>
                      <CardTitle className="text-lg hover:text-blue-600 transition-colors">
                        {article.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{article.readTime}</p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Vraag niet gevonden?</h2>
          <p className="text-gray-600 mb-6">
            Kon je niet vinden wat je zocht? Stel je vraag via ons contactformulier en ontvang een persoonlijk antwoord van onze juridische experts.
          </p>
          <Button size="lg" asChild>
            <Link href="/contact">
              <FileText className="h-5 w-5 mr-2" />
              Stel je vraag
            </Link>
          </Button>
        </section>
      </div>
    </div>
  )
} 