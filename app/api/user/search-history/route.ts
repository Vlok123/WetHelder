import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Haal zoekgeschiedenis op
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')

    // Haal echte query geschiedenis op uit de Query tabel
    const queries = await prisma.query.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        question: true,
        answer: true,
        profession: true,
        sources: true,
        createdAt: true
      }
    })

    // Transform queries to search history format
    const searchHistory = queries.map(query => {
      let sources = []
      try {
        sources = JSON.parse(query.sources || '[]')
      } catch (e) {
        sources = []
      }

      return {
        id: query.id,
        searchTerm: query.question,
        profession: query.profession || 'algemeen',
        resultCount: sources.length,
        createdAt: query.createdAt.toISOString(),
        hasAnswer: !!query.answer && query.answer.length > 0
      }
    })

    return NextResponse.json({ 
      searchHistory
    })

  } catch (error) {
    console.error('Search history GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch search history' },
      { status: 500 }
    )
  }
}

// POST - Niet meer nodig omdat queries automatisch worden opgeslagen
export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Search history is automatically saved with queries' 
  })
}

// DELETE - Verwijder query uit geschiedenis
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const queryId = url.searchParams.get('id')
    const clearAll = url.searchParams.get('clearAll') === 'true'

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (clearAll) {
      // Clear all queries for user
      const result = await prisma.query.deleteMany({
        where: { userId: user.id }
      })

      return NextResponse.json({ 
        message: 'All search history cleared',
        deletedCount: result.count
      })
    } else if (queryId) {
      // Delete specific query
      const deletedItem = await prisma.query.delete({
        where: {
          id: queryId,
          userId: user.id // Ensure user can only delete their own items
        }
      })

      return NextResponse.json({ 
        message: 'Search history item deleted',
        deletedId: deletedItem.id
      })
    } else {
      return NextResponse.json({ error: 'Query ID or clearAll parameter required' }, { status: 400 })
    }

  } catch (error) {
    console.error('Search history DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete search history' },
      { status: 500 }
    )
  }
} 