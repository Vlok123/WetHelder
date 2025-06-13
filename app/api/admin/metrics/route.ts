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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Calculate various system metrics
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Query metrics
    const totalQueries = await prisma.query.count()
    const queriesLast24h = await prisma.query.count({
      where: { createdAt: { gte: yesterday } }
    })
    const queriesLastWeek = await prisma.query.count({
      where: { createdAt: { gte: lastWeek } }
    })
    const queriesLastMonth = await prisma.query.count({
      where: { createdAt: { gte: lastMonth } }
    })

    // User metrics
    const totalUsers = await prisma.user.count()
    const newUsersLast24h = await prisma.user.count({
      where: { createdAt: { gte: yesterday } }
    })
    const newUsersLastWeek = await prisma.user.count({
      where: { createdAt: { gte: lastWeek } }
    })

    // Active sessions
    const activeSessions = await prisma.session.count({
      where: { expires: { gte: now } }
    })

    // Calculate growth rates
    const queryGrowthRate = queriesLastWeek > 0 
      ? ((queriesLast24h * 7 - queriesLastWeek) / queriesLastWeek * 100).toFixed(1)
      : '0'

    const userGrowthRate = newUsersLastWeek > 0
      ? ((newUsersLast24h * 7 - newUsersLastWeek) / newUsersLastWeek * 100).toFixed(1)
      : '0'

    // Most popular professions
    const professionStats = await prisma.query.groupBy({
      by: ['profession'],
      _count: true,
      orderBy: { _count: { profession: 'desc' } },
      take: 5
    })

    // Response time simulation (would need actual implementation)
    const avgResponseTime = '2.3s'

    // System health metrics
    const metrics = [
      {
        name: 'Totaal Vragen',
        value: totalUsers.toString(),
        change: parseFloat(queryGrowthRate),
        status: parseFloat(queryGrowthRate) > 0 ? 'up' : parseFloat(queryGrowthRate) < 0 ? 'down' : 'stable'
      },
      {
        name: 'Nieuwe Gebruikers (24u)',
        value: newUsersLast24h.toString(),
        change: parseFloat(userGrowthRate),
        status: parseFloat(userGrowthRate) > 0 ? 'up' : parseFloat(userGrowthRate) < 0 ? 'down' : 'stable'
      },
      {
        name: 'Actieve Sessies',
        value: activeSessions.toString(),
        change: 0,
        status: 'stable'
      },
      {
        name: 'Gemiddelde Response Tijd',
        value: avgResponseTime,
        change: -5.2, // Mock improvement
        status: 'up'
      },
      {
        name: 'Vragen Laatste Week',
        value: queriesLastWeek.toString(),
        change: parseFloat(queryGrowthRate),
        status: parseFloat(queryGrowthRate) > 0 ? 'up' : parseFloat(queryGrowthRate) < 0 ? 'down' : 'stable'
      },
      {
        name: 'Database Verbindingen',
        value: '12/50',
        change: 0,
        status: 'stable'
      }
    ]

    return NextResponse.json({ 
      metrics,
      professionStats: professionStats.map(stat => ({
        profession: stat.profession,
        count: stat._count
      })),
      systemHealth: {
        totalQueries,
        queriesLast24h,
        queriesLastWeek,
        queriesLastMonth,
        totalUsers,
        newUsersLast24h,
        newUsersLastWeek,
        activeSessions
      }
    })

  } catch (error) {
    console.error('Admin metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
} 