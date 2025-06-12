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

    const searchHistory = await prisma.userSearchHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return NextResponse.json({ 
      searchHistory: searchHistory.map(item => ({
        id: item.id,
        searchTerm: item.searchTerm,
        profession: item.profession,
        resultCount: item.resultCount,
        createdAt: item.createdAt.toISOString()
      }))
    })

  } catch (error) {
    console.error('Search history GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch search history' },
      { status: 500 }
    )
  }
}

// POST - Voeg zoekterm toe aan geschiedenis
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchTerm, profession = 'algemeen', resultCount = 0 } = await request.json()

    if (!searchTerm || searchTerm.trim().length === 0) {
      return NextResponse.json({ error: 'Search term is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if this exact search was done recently (within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentSearch = await prisma.userSearchHistory.findFirst({
      where: {
        userId: user.id,
        searchTerm: searchTerm.trim(),
        profession: profession,
        createdAt: {
          gte: oneHourAgo
        }
      }
    })

    // If found recent duplicate, don't add again
    if (recentSearch) {
      return NextResponse.json({ 
        message: 'Search already recorded recently',
        searchHistoryId: recentSearch.id
      })
    }

    // Create search history entry
    const searchHistory = await prisma.userSearchHistory.create({
      data: {
        userId: user.id,
        searchTerm: searchTerm.trim(),
        profession: profession,
        resultCount: resultCount
      }
    })

    return NextResponse.json({ 
      searchHistory: {
        id: searchHistory.id,
        searchTerm: searchHistory.searchTerm,
        profession: searchHistory.profession,
        resultCount: searchHistory.resultCount,
        createdAt: searchHistory.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Search history POST error:', error)
    return NextResponse.json(
      { error: 'Failed to add search history' },
      { status: 500 }
    )
  }
}

// DELETE - Verwijder zoekgeschiedenis item
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const searchHistoryId = url.searchParams.get('id')
    const clearAll = url.searchParams.get('clearAll') === 'true'

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (clearAll) {
      // Clear all search history for user
      const result = await prisma.userSearchHistory.deleteMany({
        where: { userId: user.id }
      })

      return NextResponse.json({ 
        message: 'All search history cleared',
        deletedCount: result.count
      })
    } else if (searchHistoryId) {
      // Delete specific search history item
      const deletedItem = await prisma.userSearchHistory.delete({
        where: {
          id: searchHistoryId,
          userId: user.id // Ensure user can only delete their own items
        }
      })

      return NextResponse.json({ 
        message: 'Search history item deleted',
        deletedId: deletedItem.id
      })
    } else {
      return NextResponse.json({ error: 'Search history ID or clearAll parameter required' }, { status: 400 })
    }

  } catch (error) {
    console.error('Search history DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete search history' },
      { status: 500 }
    )
  }
} 