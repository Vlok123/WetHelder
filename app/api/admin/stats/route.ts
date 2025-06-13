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

    // Check if user is admin - allow sanderhelmink@gmail.com or users with ADMIN role
    if (session.user.email === 'sanderhelmink@gmail.com') {
      // Auto-admin access for sanderhelmink@gmail.com
    } else {
      // Check database role for other users
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
      })

      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
      }
    }

    // Get total users
    const totalUsers = await prisma.user.count()

    // Get users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    })

    const premiumUsers = usersByRole.find(r => r.role === 'PREMIUM')?._count || 0
    const freeUsers = usersByRole.find(r => r.role === 'FREE')?._count || 0
    const adminUsers = usersByRole.find(r => r.role === 'ADMIN')?._count || 0

    // Get active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const activeUsers = await prisma.user.count({
      where: {
        sessions: {
          some: {
            expires: {
              gte: thirtyDaysAgo
            }
          }
        }
      }
    })

    // Get total queries
    const totalQueries = await prisma.query.count()

    // Get today's queries
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayQueries = await prisma.query.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // Calculate average queries per user
    const avgQueriesPerUser = totalUsers > 0 ? (totalQueries / totalUsers).toFixed(1) : '0'

    // System health check (simplified)
    let systemHealth: 'healthy' | 'warning' | 'error' = 'healthy'
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (error) {
      systemHealth = 'error'
    }

    // Mock database size and backup info (would need actual implementation)
    const databaseSize = '2.3 GB'
    const lastBackup = new Date().toISOString()

    const stats = {
      totalUsers,
      activeUsers,
      premiumUsers,
      freeUsers,
      adminUsers,
      totalQueries,
      todayQueries,
      avgQueriesPerUser,
      systemHealth,
      databaseSize,
      lastBackup
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
}

// Also support POST for refresh functionality
export async function POST(request: NextRequest) {
  return GET(request)
} 