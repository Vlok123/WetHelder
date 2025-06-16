import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow admin users to reset rate limits
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    console.log('🔄 Admin rate limit reset initiated by:', session.user.email)

    // Clear all anonymous queries from the last 24 hours to reset rate limits
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const deletedQueries = await prisma.query.deleteMany({
      where: {
        userId: null,
        createdAt: {
          gte: twentyFourHoursAgo
        }
      }
    })

    console.log(`✅ Deleted ${deletedQueries.count} anonymous queries to reset rate limits`)

    // Also clear in-memory rate limit maps
    try {
      // Import and call reset functions from API routes
      const { resetRateLimits: resetWetuitlegLimits } = await import('../wetuitleg/route')
      resetWetuitlegLimits()
    } catch (error) {
      console.log('Note: In-memory rate limits will reset on server restart')
    }
    
    return NextResponse.json({
      success: true,
      message: `Rate limits reset successfully. Deleted ${deletedQueries.count} anonymous queries.`,
      resetTime: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error resetting rate limits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get current rate limit statistics
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const anonymousQueries = await prisma.query.count({
      where: {
        userId: null,
        createdAt: {
          gte: twentyFourHoursAgo
        }
      }
    })

    const totalQueries = await prisma.query.count({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo
        }
      }
    })

    return NextResponse.json({
      anonymousQueries,
      totalQueries,
      rateLimitWindow: '24 hours',
      maxAnonymousRequests: 4
    })

  } catch (error) {
    console.error('Error getting rate limit stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 