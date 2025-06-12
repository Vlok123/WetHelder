import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get user statistics
    const totalUsers = await prisma.user.count()
    
    const activeUsers = await prisma.user.count({
      where: {
        queries: {
          some: {
            createdAt: {
              gte: thirtyDaysAgo
            }
          }
        }
      }
    })
    
    const premiumUsers = await prisma.user.count({ 
      where: { role: 'PREMIUM' } 
    })
    
    const freeUsers = await prisma.user.count({ 
      where: { role: 'FREE' } 
    })
    
    const totalQueries = await prisma.query.count()
    
    const todayQueries = await prisma.query.count({
      where: {
        createdAt: {
          gte: new Date(today + 'T00:00:00.000Z'),
          lt: new Date(today + 'T23:59:59.999Z')
        }
      }
    })

    // Calculate average queries per user
    const avgQueriesPerUser = totalUsers > 0 ? Math.round((totalQueries / totalUsers) * 100) / 100 : 0

    // Get database size estimate (rough calculation)
    const estimatedSize = Math.round((totalQueries * 2 + totalUsers * 0.5) / 1024) // Rough estimate in MB

    // System health check
    let systemHealth: 'healthy' | 'warning' | 'error' = 'healthy'
    
    if (totalUsers > 10000 || totalQueries > 100000) {
      systemHealth = 'warning'
    }

    const stats = {
      totalUsers,
      activeUsers,
      premiumUsers,
      freeUsers,
      totalQueries,
      todayQueries,
      avgQueriesPerUser,
      systemHealth,
      databaseSize: `${estimatedSize} MB`,
      lastBackup: '2024-12-08 03:00:00' // This would come from actual backup system
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also support POST for refresh functionality
export async function POST(request: NextRequest) {
  return GET(request)
} 