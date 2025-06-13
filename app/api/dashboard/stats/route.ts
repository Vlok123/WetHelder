import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's queries
    const queries = await prisma.query.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        question: true,
        profession: true,
        createdAt: true
      }
    })

    // Get user's notes
    const notes = await prisma.userNote.findMany({
      where: { userId: user.id },
      select: { id: true }
    })

    // Get user's categories
    const categories = await prisma.userCategory.findMany({
      where: { userId: user.id },
      select: { id: true }
    })

    // Get user's favorites
    const favorites = await prisma.userFavorite.findMany({
      where: { userId: user.id },
      select: { id: true }
    })

    // Calculate this week's queries
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const thisWeekQueries = queries.filter(q => q.createdAt >= oneWeekAgo).length

    // Calculate most used profession
    const professionCounts = queries.reduce((acc, query) => {
      acc[query.profession] = (acc[query.profession] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostUsedProfession = Object.entries(professionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Algemeen'

    // Generate recent activity
    const recentActivity = queries.slice(0, 5).map(query => ({
      id: query.id,
      type: 'query' as const,
      title: query.question.length > 50 ? query.question.substring(0, 50) + '...' : query.question,
      timestamp: query.createdAt.toISOString(),
      details: `Vraag gesteld als ${query.profession}`
    }))

    const stats = {
      totalQueries: queries.length,
      thisWeekQueries,
      totalNotes: notes.length,
      totalCategories: categories.length,
      favoriteQueries: favorites.length,
      averageResponseTime: '2.1s', // This would need to be calculated from actual response times
      mostUsedProfession,
      recentActivity
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
} 