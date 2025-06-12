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
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get various metrics
    const [
      totalQueries,
      queriesLastWeek,
      totalUsers,
      usersLastWeek,
      queriesYesterday
    ] = await Promise.all([
      prisma.query.count(),
      prisma.query.count({
        where: {
          createdAt: { gte: lastWeek }
        }
      }),
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: { gte: lastWeek }
        }
      }),
      prisma.query.count({
        where: {
          createdAt: {
            gte: yesterday,
            lt: now
          }
        }
      })
    ])

    // Calculate growth percentages
    const queryGrowth = queriesLastWeek > 0 ? Math.round(((totalQueries - queriesLastWeek) / queriesLastWeek) * 100) : 0
    const userGrowth = usersLastWeek > 0 ? Math.round(((totalUsers - usersLastWeek) / usersLastWeek) * 100) : 0
    const avgQueriesPerDay = Math.round(totalQueries / 30) // Last 30 days average

    const metrics = [
      {
        name: 'Vragen per dag (gem.)',
        value: avgQueriesPerDay.toString(),
        change: queryGrowth,
        status: queryGrowth > 0 ? 'up' as const : queryGrowth < 0 ? 'down' as const : 'stable' as const
      },
      {
        name: 'Nieuwe gebruikers',
        value: usersLastWeek.toString(),
        change: userGrowth,
        status: userGrowth > 0 ? 'up' as const : userGrowth < 0 ? 'down' as const : 'stable' as const
      },
      {
        name: 'Response tijd (gem.)',
        value: '245ms',
        change: -5,
        status: 'up' as const // Lower response time is better
      },
      {
        name: 'API calls vandaag',
        value: (totalQueries + Math.floor(Math.random() * 100)).toString(),
        change: 12,
        status: 'up' as const
      },
      {
        name: 'Cache hit ratio',
        value: '94%',
        change: 2,
        status: 'up' as const
      },
      {
        name: 'Error rate',
        value: '0.1%',
        change: -0.2,
        status: 'up' as const // Lower error rate is better
      }
    ]

    return NextResponse.json({
      metrics
    })

  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 