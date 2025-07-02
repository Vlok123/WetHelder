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

    // Get aangifte downloads
    const totalAangifteDownloads = await prisma.downloadTracking.count({
      where: { type: 'aangifte' }
    })

    const aangifteDownloadsToday = await prisma.downloadTracking.count({
      where: {
        type: 'aangifte',
        timestamp: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    const aangifteDownloadsByType = await prisma.downloadTracking.groupBy({
      by: ['delictType'],
      where: { type: 'aangifte' },
      _count: true,
      orderBy: {
        _count: {
          delictType: 'desc'
        }
      },
      take: 10
    })

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

    // Get total queries (including anonymous)
    const totalQueries = await prisma.query.count()

    // Get queries by user type
    const loggedInQueries = await prisma.query.count({
      where: {
        userId: {
          not: null
        }
      }
    })

    const anonymousQueries = await prisma.query.count({
      where: {
        userId: null
      }
    })

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

    const todayLoggedInQueries = await prisma.query.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        },
        userId: {
          not: null
        }
      }
    })

    const todayAnonymousQueries = await prisma.query.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        },
        userId: null
      }
    })

    // Calculate average queries per user (only for logged in users)
    const avgQueriesPerUser = totalUsers > 0 ? (loggedInQueries / totalUsers).toFixed(1) : '0'

    // Get queries by profession for anonymous users
    const anonymousQueriesByProfession = await prisma.query.groupBy({
      by: ['profession'],
      where: {
        userId: null
      },
      _count: true
    })

    // Enhanced diagnostics for traffic visibility issues
    // Check for different source patterns to identify potential tracking gaps
    const corporateQueries = await prisma.query.count({
      where: {
        userId: null,
        sources: {
          contains: 'corp-'
        }
      }
    })

    const citrixQueries = await prisma.query.count({
      where: {
        userId: null,
        OR: [
          { sources: { contains: 'citrix' } },
          { sources: { contains: 'ica-tcp' } },
          { sources: { contains: 'receiver' } }
        ]
      }
    })

    const askApiQueries = await prisma.query.count({
      where: {
        sources: {
          contains: 'apiEndpoint":"ask'
        }
      }
    })

    const wetuitlegApiQueries = await prisma.query.count({
      where: {
        sources: {
          contains: 'apiEndpoint":"wetuitleg'
        }
      }
    })

    // Check for potential gaps in logging
    const queriesWithoutProperSources = await prisma.query.count({
      where: {
        userId: null,
        sources: {
          not: {
            contains: 'apiEndpoint'
          }
        }
      }
    })

    // Rate limit analysis
    const rateLimitMessages = await prisma.query.count({
      where: {
        answer: {
          contains: 'Dagelijkse limiet bereikt'
        }
      }
    })

    // Get distribution of query sources for diagnostics
    const querySourceDistribution = await prisma.query.groupBy({
      by: ['sources'],
      _count: true,
      orderBy: {
        _count: {
          sources: 'desc'
        }
      },
      take: 10
    })

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
      loggedInQueries,
      anonymousQueries,
      todayQueries,
      todayLoggedInQueries,
      todayAnonymousQueries,
      avgQueriesPerUser,
      anonymousQueriesByProfession: anonymousQueriesByProfession.map(item => ({
        profession: item.profession,
        count: item._count
      })),
      // Aangifte downloads
      totalAangifteDownloads,
      aangifteDownloadsToday,
      aangifteDownloadsByType: aangifteDownloadsByType.map(item => ({
        delictType: item.delictType,
        count: item._count
      })),
      // Enhanced diagnostics
      diagnostics: {
        corporateQueries,
        citrixQueries,
        askApiQueries,
        wetuitlegApiQueries,
        queriesWithoutProperSources,
        rateLimitMessages,
        querySourceDistribution: querySourceDistribution.map(item => ({
          source: item.sources?.substring(0, 100) || 'null', // Truncate for readability
          count: item._count
        }))
      },
      systemHealth,
      databaseSize,
      lastBackup
    }

    // Create response with no-cache headers
    const response = NextResponse.json(stats)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response

  } catch (error) {
    console.error('Admin stats error:', error)
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
    errorResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    return errorResponse
  }
}

// Also support POST for refresh functionality
export async function POST(request: NextRequest) {
  console.log(' Admin stats POST request - force refresh')
  return GET(request)
} 