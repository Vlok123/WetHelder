import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Niet geautoriseerd' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        role: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      )
    }

    // Get total queries for this user
    const totalQueries = await prisma.query.count({
      where: { userId: user.id }
    })

    // Get this week's queries
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const weekQueries = await prisma.query.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: oneWeekAgo
        }
      }
    })

    // Get today's queries
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayQueries = await prisma.query.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: today
        }
      }
    })

    // Get this month's queries
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const monthQueries = await prisma.query.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: oneMonthAgo
        }
      }
    })

    // Get profession breakdown
    const professionStats = await prisma.query.groupBy({
      by: ['profession'],
      where: { userId: user.id },
      _count: true
    })

    const mostUsedProfession = professionStats.length > 0 
      ? professionStats.reduce((max, current) => 
          current._count > max._count ? current : max
        ).profession
      : 'algemeen'

    // Get user favorites count
    const favoritesCount = await prisma.userFavorite.count({
      where: { userId: user.id }
    })

    // Get user notes count
    const notesCount = await prisma.userNote.count({
      where: { userId: user.id }
    })

    // Get user categories count
    const categoriesCount = await prisma.userCategory.count({
      where: { userId: user.id }
    })

    // Calculate average response time (mock for now, would need to track this)
    const averageResponseTime = totalQueries > 0 ? '2.3s' : '0s'

    // Get recent activity (last 10 queries with more details)
    const recentQueries = await prisma.query.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        question: true,
        answer: true,
        profession: true,
        createdAt: true,
        sources: true
      }
    })

    // Get daily query counts for the last 7 days
    const dailyStats = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)
      
      const count = await prisma.query.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: date,
            lt: nextDay
          }
        }
      })
      
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        count
      })
    }

    const stats = {
      totalQueries,
      todayQueries,
      weekQueries,
      monthQueries,
      favoritesCount,
      notesCount,
      categoriesCount,
      averageResponseTime,
      mostUsedProfession,
      memberSince: user.createdAt.toISOString(),
      role: user.role,
      dailyStats,
      recentActivity: recentQueries.map(query => ({
        id: query.id,
        type: 'query' as const,
        title: query.question.substring(0, 100) + (query.question.length > 100 ? '...' : ''),
        details: query.answer ? query.answer.substring(0, 150) + (query.answer.length > 150 ? '...' : '') : 'Geen antwoord beschikbaar',
        profession: query.profession,
        timestamp: query.createdAt.toISOString(),
        sources: query.sources ? JSON.parse(query.sources) : []
      })),
      professionBreakdown: professionStats.map(stat => ({
        profession: stat.profession,
        count: stat._count
      }))
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Server fout bij ophalen dashboard statistieken' },
      { status: 500 }
    )
  }
} 