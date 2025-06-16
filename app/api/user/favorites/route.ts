import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Haal favorieten op
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user favorites with related query data
    const favorites = await prisma.userFavorite.findMany({
      where: { userId: user.id },
      include: {
        query: {
          select: {
            id: true,
            question: true,
            answer: true,
            profession: true,
            createdAt: true,
            sources: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedFavorites = favorites.map(fav => ({
      id: fav.id,
      title: fav.query.question.substring(0, 100) + (fav.query.question.length > 100 ? '...' : ''),
      type: 'query' as const,
      content: fav.query.answer || 'Geen antwoord beschikbaar',
      profession: fav.query.profession,
      date: fav.createdAt.toISOString(),
      queryId: fav.query.id,
      sources: fav.query.sources ? JSON.parse(fav.query.sources) : []
    }))

    return NextResponse.json({ favorites: formattedFavorites })

  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

// POST - Voeg favoriet toe
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { queryId } = await request.json()

    if (!queryId) {
      return NextResponse.json({ error: 'Query ID is required' }, { status: 400 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if favorite already exists
    const existingFavorite = await prisma.userFavorite.findFirst({
      where: {
        userId: user.id,
        queryId: queryId
      }
    })

    if (existingFavorite) {
      // Remove from favorites
      await prisma.userFavorite.delete({
        where: { id: existingFavorite.id }
      })
      return NextResponse.json({ message: 'Removed from favorites', isFavorite: false })
    } else {
      // Add to favorites
      await prisma.userFavorite.create({
        data: {
          userId: user.id,
          queryId: queryId
        }
      })
      return NextResponse.json({ message: 'Added to favorites', isFavorite: true })
    }

  } catch (error) {
    console.error('Error toggling favorite:', error)
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    )
  }
}

// DELETE - Verwijder favoriet
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const favoriteId = searchParams.get('id')

    if (!favoriteId) {
      return NextResponse.json({ error: 'Favorite ID is required' }, { status: 400 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete the favorite
    await prisma.userFavorite.deleteMany({
      where: {
        id: favoriteId,
        userId: user.id // Ensure user can only delete their own favorites
      }
    })

    return NextResponse.json({ message: 'Favorite deleted successfully' })

  } catch (error) {
    console.error('Error deleting favorite:', error)
    return NextResponse.json(
      { error: 'Failed to delete favorite' },
      { status: 500 }
    )
  }
} 