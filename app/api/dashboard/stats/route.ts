import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Get this week's queries
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const weekQueries = await prisma.query.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: oneWeekAgo
        }
      }
    })

    // Get profession breakdown
    const professionStats = await prisma.query.groupBy({
      by: ['profession'],
      where: { userId: user.id },
      _count: true
    })

    const mostUsedProfession = professionStats.length > 0 
      ? professionStats.reduce((max, current) => 
          current._count > max._count ? current : max
        ).profession
      : 'algemeen'

    // Get recent activity (last 10 queries)
    const recentQueries = await prisma.query.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        question: true,
        profession: true,
        createdAt: true
      }
    })

    const stats = {
      totalQueries,
      weekQueries,
      mostUsedProfession,
      memberSince: user.createdAt.toISOString(),
      role: user.role,
      recentActivity: recentQueries.map(query => ({
        id: query.id,
        question: query.question.substring(0, 100) + (query.question.length > 100 ? '...' : ''),
        profession: query.profession,
        createdAt: query.createdAt.toISOString()
      })),
      professionBreakdown: professionStats.map(stat => ({
        profession: stat.profession,
        count: stat._count
      }))
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Server fout bij ophalen dashboard statistieken' },
      { status: 500 }
    )
  }
} 