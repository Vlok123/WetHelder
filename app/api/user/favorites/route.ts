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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const favorites = await prisma.userFavorite.findMany({
      where: { userId: user.id },
      include: {
        query: {
          select: {
            id: true,
            question: true,
            answer: true,
            profession: true,
            sources: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      favorites: favorites.map(fav => ({
        id: fav.id,
        queryId: fav.queryId,
        createdAt: fav.createdAt.toISOString(),
        query: {
          ...fav.query,
          createdAt: fav.query.createdAt.toISOString()
        }
      }))
    })

  } catch (error) {
    console.error('Favorites GET error:', error)
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if query exists
    const query = await prisma.query.findUnique({
      where: { id: queryId }
    })

    if (!query) {
      return NextResponse.json({ error: 'Query not found' }, { status: 404 })
    }

    // Check if already favorited
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_queryId: {
          userId: user.id,
          queryId: queryId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json({ error: 'Already favorited' }, { status: 400 })
    }

    // Create favorite
    const favorite = await prisma.userFavorite.create({
      data: {
        userId: user.id,
        queryId: queryId
      },
      include: {
        query: {
          select: {
            id: true,
            question: true,
            answer: true,
            profession: true,
            sources: true,
            createdAt: true
          }
        }
      }
    })

    return NextResponse.json({ 
      favorite: {
        id: favorite.id,
        queryId: favorite.queryId,
        createdAt: favorite.createdAt.toISOString(),
        query: {
          ...favorite.query,
          createdAt: favorite.query.createdAt.toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Favorites POST error:', error)
    return NextResponse.json(
      { error: 'Failed to add favorite' },
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

    const url = new URL(request.url)
    const queryId = url.searchParams.get('queryId')

    if (!queryId) {
      return NextResponse.json({ error: 'Query ID is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete favorite
    const deletedFavorite = await prisma.userFavorite.delete({
      where: {
        userId_queryId: {
          userId: user.id,
          queryId: queryId
        }
      }
    })

    return NextResponse.json({ 
      message: 'Favorite removed',
      favoriteId: deletedFavorite.id
    })

  } catch (error) {
    console.error('Favorites DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
} 