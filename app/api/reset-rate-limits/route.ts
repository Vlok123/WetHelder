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

    console.log(' Admin rate limit reset initiated by:', session.user.email)

    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      console.log(' DATABASE_URL not configured - simulating rate limit reset')
      return NextResponse.json({
        success: true,
        message: 'Rate limits reset simulated (no database configured). In-memory limits will reset on server restart.',
        resetTime: new Date().toISOString(),
        note: 'Database not configured - only in-memory reset'
      })
    }

    // Clear all anonymous queries from the last 24 hours to reset rate limits
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    // First, check for rate limit messages that may be causing issues
    const rateLimitMessages = await prisma.query.count({
      where: {
        userId: null,
        createdAt: { gte: twentyFourHoursAgo },
        answer: { contains: 'Dagelijkse limiet bereikt' }
      }
    })
    
    console.log(` Found ${rateLimitMessages} rate limit messages in database`)
    
    const deletedQueries = await prisma.query.deleteMany({
      where: {
        userId: null,
        createdAt: {
          gte: twentyFourHoursAgo
        }
      }
    })

    console.log(` Deleted ${deletedQueries.count} anonymous queries to reset rate limits (including ${rateLimitMessages} rate limit messages)`)

    // Clear in-memory rate limits from wetuitleg route
    try {
      // Call the globally available reset function if it exists
      const resetFn = (globalThis as any).resetWetuitlegRateLimits
      if (typeof resetFn === 'function') {
        resetFn()
        console.log(' Wetuitleg in-memory rate limits cleared')
      } else {
        console.log(' Wetuitleg rate limits will reset on server restart')
      }
    } catch (error) {
      console.log(' Wetuitleg rate limits will reset on server restart')
    }
    
    // Note: In-memory rate limit maps will automatically reset on server restart
    console.log('Note: All rate limits have been reset')
    
    return NextResponse.json({
      success: true,
      message: `Rate limits reset successfully. Deleted ${deletedQueries.count} anonymous queries (including ${rateLimitMessages} rate limit messages).`,
      resetTime: new Date().toISOString(),
      details: {
        deletedQueries: deletedQueries.count,
        rateLimitMessages: rateLimitMessages
      }
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

    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        anonymousQueries: 0,
        totalQueries: 0,
        rateLimitWindow: '24 hours',
        maxAnonymousRequests: 4,
        note: 'Database not configured - showing simulated data'
      })
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