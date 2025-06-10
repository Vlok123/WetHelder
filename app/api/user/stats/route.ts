import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get total queries count
    const totalQueries = await prisma.query.count({
      where: { userId }
    })

    // Get today's usage
    const today = new Date().toISOString().split('T')[0]
    const dailyUsage = await prisma.dailyUsage.findUnique({
      where: {
        userId_date: {
          userId,
          date: today
        }
      },
      select: { count: true }
    })

    const todayUsage = dailyUsage?.count || 0
    const limit = user.role === 'PREMIUM' ? -1 : 3
    const remainingToday = user.role === 'PREMIUM' ? -1 : Math.max(0, limit - todayUsage)

    return NextResponse.json({
      totalQueries,
      todayUsage,
      remainingToday,
      role: user.role
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
} 