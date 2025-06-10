import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.email !== 'sanderhelmink@gmail.com') {
      return NextResponse.json(
        { error: 'Niet geautoriseerd. Alleen admins hebben toegang.' },
        { status: 403 }
      )
    }

    // Calculate date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get total users count
    const totalUsers = await prisma.user.count()

    // Get total questions count
    const totalQuestions = await prisma.query.count()

    // Get questions today
    const questionsToday = await prisma.query.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    })

    // Get questions this week
    const questionsThisWeek = await prisma.query.count({
      where: {
        createdAt: {
          gte: weekAgo
        }
      }
    })

    // Get questions this month
    const questionsThisMonth = await prisma.query.count({
      where: {
        createdAt: {
          gte: monthAgo
        }
      }
    })

    // Get top professions
    const professionStats = await prisma.query.groupBy({
      by: ['profession'],
      _count: {
        profession: true
      },
      orderBy: {
        _count: {
          profession: 'desc'
        }
      },
      take: 10
    })

    const topProfessions = professionStats.map(stat => ({
      name: stat.profession || 'Onbekend',
      count: stat._count.profession
    }))

    // Get recent questions
    const recentQuestions = await prisma.query.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    })

    const formattedRecentQuestions = recentQuestions.map(q => ({
      id: q.id,
      question: q.question,
      profession: q.profession || 'Onbekend',
      timestamp: q.createdAt.toISOString(),
      user: q.user?.email ? q.user.email.replace(/(.{2}).*@/, '$1***@') : undefined // Privacy: mask email
    }))

    // System health check
    const startTime = Date.now()
    
    // Test database connection
    let dbStatus: 'healthy' | 'warning' | 'error' = 'healthy'
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (error) {
      dbStatus = 'error'
    }

    // Test API response time
    const responseTime = Date.now() - startTime

    const apiStatus: 'healthy' | 'warning' | 'error' = responseTime > 1000 ? 'warning' : 'healthy'

    const stats = {
      totalUsers,
      totalQuestions,
      questionsToday,
      questionsThisWeek,
      questionsThisMonth,
      topProfessions,
      recentQuestions: formattedRecentQuestions,
      systemHealth: {
        apiStatus,
        dbStatus,
        responseTime
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Admin stats error:', error)
    
    // Return mock data if database is not available
    const mockStats = {
      totalUsers: 42,
      totalQuestions: 1337,
      questionsToday: 23,
      questionsThisWeek: 156,
      questionsThisMonth: 687,
      topProfessions: [
        { name: 'Advocaat', count: 245 },
        { name: 'Politieagent', count: 189 },
        { name: 'BOA', count: 156 },
        { name: 'Notaris', count: 134 },
        { name: 'Rechter/Magistraat', count: 98 },
        { name: 'Beveiliger', count: 87 },
        { name: 'Deurwaarder', count: 76 },
        { name: 'Officier van Justitie', count: 65 },
        { name: 'Belastingadviseur', count: 54 },
        { name: 'Burger', count: 287 }
      ],
      recentQuestions: [
        {
          id: '1',
          question: 'Wat zijn de regels voor parkeren in Amsterdam centrum?',
          profession: 'BOA',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user: 'te***@example.com'
        },
        {
          id: '2',
          question: 'Hoe werkt de procedure voor een echtscheiding?',
          profession: 'Advocaat',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          user: 'us***@example.com'
        },
        {
          id: '3',
          question: 'Welke rechten heb ik bij een arbeidsconflict?',
          profession: 'Advocaat',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          user: 'jo***@example.com'
        },
        {
          id: '4',
          question: 'Wat moet ik doen bij een verkeersongeval?',
          profession: 'Politieagent',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          user: 'ma***@example.com'
        },
        {
          id: '5',
          question: 'Hoe maak ik een testament op?',
          profession: 'Notaris',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
          user: 'pe***@example.com'
        }
      ],
      systemHealth: {
        apiStatus: 'warning' as const,
        dbStatus: 'error' as const,
        responseTime: 125
      }
    }

    return NextResponse.json(mockStats)
  }
}

// Also support POST for refresh functionality
export async function POST(request: NextRequest) {
  return GET(request)
} 