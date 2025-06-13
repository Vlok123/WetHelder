import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Niet geautoriseerd' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        role: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      )
    }

    // Get total queries for this user
    const totalQueries = await prisma.query.count({
      where: { userId: user.id }
    })

    // Get today's queries
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayUsage = await prisma.query.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // Calculate remaining queries (unlimited for authenticated users)
    const remainingToday = user.role === 'FREE' ? Math.max(0, 10 - todayUsage) : 999

    const stats = {
      totalQueries,
      todayUsage,
      remainingToday,
      role: user.role,
      memberSince: user.createdAt.toISOString()
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Server fout bij ophalen statistieken' },
      { status: 500 }
    )
  }
} 