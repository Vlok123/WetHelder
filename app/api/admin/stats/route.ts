import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.email !== 'sanderhelmink@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const startTime = Date.now()

    // Get current date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    try {
      // Get total users count
      const totalUsers = await prisma.user.count()

      // Get user growth stats
      const newUsersToday = await prisma.user.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      })

      const newUsersThisWeek = await prisma.user.count({
        where: {
          createdAt: {
            gte: weekAgo
          }
        }
      })

      const newUsersThisMonth = await prisma.user.count({
        where: {
          createdAt: {
            gte: monthAgo
          }
        }
      })

      // Calculate growth rate (simplified)
      const previousMonthUsers = await prisma.user.count({
        where: {
          createdAt: {
            lt: monthAgo
          }
        }
      })
      
      const growthRate = previousMonthUsers > 0 
        ? Math.round(((newUsersThisMonth / previousMonthUsers) * 100))
        : 100

      // Get question statistics (mock data since we don't have a questions table yet)
      const totalQuestions = Math.floor(Math.random() * 5000) + 1000 // Mock data
      const questionsToday = Math.floor(Math.random() * 50) + 10
      const questionsThisWeek = Math.floor(Math.random() * 200) + 50
      const questionsThisMonth = Math.floor(Math.random() * 800) + 200
      const anonymousQuestions = Math.floor(questionsToday * 0.6)
      const registeredUserQuestions = questionsToday - anonymousQuestions
      const averageQuestionsPerDay = Math.floor(totalQuestions / 365)

      // Mock profession data
      const topProfessions = [
        { name: 'Algemeen', count: Math.floor(totalQuestions * 0.35) },
        { name: 'Politieagent', count: Math.floor(totalQuestions * 0.25) },
        { name: 'Advocaat', count: Math.floor(totalQuestions * 0.15) },
        { name: 'Student', count: Math.floor(totalQuestions * 0.12) },
        { name: 'BOA', count: Math.floor(totalQuestions * 0.08) },
        { name: 'Juridisch Expert', count: Math.floor(totalQuestions * 0.05) }
      ]

      // Mock recent questions
      const recentQuestions = [
        {
          id: '1',
          question: 'Wat zijn mijn rechten bij een politiecontrole?',
          profession: 'Algemeen',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          user: 'gebruiker@example.com',
          isAnonymous: false
        },
        {
          id: '2',
          question: 'Mag ik iemand aanhouden zonder bewijs?',
          profession: 'Politieagent',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          isAnonymous: true
        },
        {
          id: '3',
          question: 'Hoe lang duurt een strafprocedure gemiddeld?',
          profession: 'Advocaat',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          user: 'advocaat@kantoor.nl',
          isAnonymous: false
        },
        {
          id: '4',
          question: 'Wat is het verschil tussen art. 300 en 302 Sr?',
          profession: 'Student',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          isAnonymous: true
        },
        {
          id: '5',
          question: 'Welke bevoegdheden heeft een BOA bij verkeersovertredingen?',
          profession: 'BOA',
          timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          user: 'boa@gemeente.nl',
          isAnonymous: false
        }
      ]

      // System health check
      const responseTime = Date.now() - startTime
      const systemHealth = {
        apiStatus: 'healthy' as const,
        dbStatus: 'healthy' as const,
        responseTime,
        uptime: '99.9%'
      }

      // Mock traffic stats (would come from analytics in production)
      const trafficStats = {
        totalPageViews: Math.floor(Math.random() * 50000) + 10000,
        uniqueVisitors: Math.floor(Math.random() * 15000) + 3000,
        bounceRate: Math.floor(Math.random() * 30) + 25,
        averageSessionDuration: '3m 45s'
      }

      const userGrowth = {
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        growthRate
      }

      const stats = {
        totalUsers,
        totalQuestions,
        questionsToday,
        questionsThisWeek,
        questionsThisMonth,
        anonymousQuestions,
        registeredUserQuestions,
        averageQuestionsPerDay,
        topProfessions,
        recentQuestions,
        systemHealth,
        trafficStats,
        userGrowth
      }

      return NextResponse.json(stats)

    } catch (dbError) {
      console.error('Database error in admin stats:', dbError)
      
      // Return mock data if database fails
      const mockStats = {
        totalUsers: 0,
        totalQuestions: 0,
        questionsToday: 0,
        questionsThisWeek: 0,
        questionsThisMonth: 0,
        anonymousQuestions: 0,
        registeredUserQuestions: 0,
        averageQuestionsPerDay: 0,
        topProfessions: [
          { name: 'Algemeen', count: 0 },
          { name: 'Politieagent', count: 0 },
          { name: 'Advocaat', count: 0 }
        ],
        recentQuestions: [],
        systemHealth: {
          apiStatus: 'healthy' as const,
          dbStatus: 'error' as const,
          responseTime: Date.now() - startTime,
          uptime: '99.9%'
        },
        trafficStats: {
          totalPageViews: 0,
          uniqueVisitors: 0,
          bounceRate: 0,
          averageSessionDuration: '0m 0s'
        },
        userGrowth: {
          newUsersToday: 0,
          newUsersThisWeek: 0,
          newUsersThisMonth: 0,
          growthRate: 0
        }
      }

      return NextResponse.json(mockStats)
    }

  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Also support POST for refresh functionality
export async function POST(request: NextRequest) {
  return GET(request)
} 