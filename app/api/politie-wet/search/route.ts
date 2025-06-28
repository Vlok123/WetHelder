import { NextRequest, NextResponse } from 'next/server'
import { politieWetData, PolitieWetArticle } from '@/lib/politie-wet-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase().trim()
    const category = searchParams.get('category')

    if (!query) {
      return NextResponse.json({ articles: [], total: 0 })
    }

    // Filter articles based on search query
    let filteredArticles = politieWetData.articles.filter((article: PolitieWetArticle) => {
      const matchesTitle = article.title.toLowerCase().includes(query)
      const matchesDescription = article.description.toLowerCase().includes(query)
      const matchesContent = article.content.toLowerCase().includes(query)
      const matchesTags = article.tags.some((tag: string) => tag.toLowerCase().includes(query))
      
      const searchMatch = matchesTitle || matchesDescription || matchesContent || matchesTags

      // Filter by category if specified
      if (category && category !== 'all') {
        return searchMatch && article.categorySlug === category
      }

      return searchMatch
    })

    // Sort by relevance (title matches first, then description, then content)
    filteredArticles.sort((a: PolitieWetArticle, b: PolitieWetArticle) => {
      const aTitle = a.title.toLowerCase().includes(query) ? 1 : 0
      const bTitle = b.title.toLowerCase().includes(query) ? 1 : 0
      
      if (aTitle !== bTitle) return bTitle - aTitle
      
      const aDesc = a.description.toLowerCase().includes(query) ? 1 : 0
      const bDesc = b.description.toLowerCase().includes(query) ? 1 : 0
      
      if (aDesc !== bDesc) return bDesc - aDesc
      
      return 0
    })

    // Limit results to 20
    filteredArticles = filteredArticles.slice(0, 20)

    return NextResponse.json({
      articles: filteredArticles,
      total: filteredArticles.length,
      query: query
    })

  } catch (error) {
    console.error('Error searching politie-wet articles:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het zoeken' },
      { status: 500 }
    )
  }
} 