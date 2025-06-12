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

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const search = url.searchParams.get('search') || ''
    const role = url.searchParams.get('role') || 'all'
    const status = url.searchParams.get('status') || 'all'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (role !== 'all') {
      where.role = role
    }

    // Get users with query count
    const users = await prisma.user.findMany({
      where,
      include: {
        _count: {
          select: {
            queries: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Get total count for pagination
    const totalUsers = await prisma.user.count({ where })

    // Transform data for frontend
    const userData = users.map(user => ({
      id: user.id,
      name: user.name || 'Geen naam',
      email: user.email,
      role: user.role || 'FREE',
      createdAt: user.createdAt.toISOString(),
      lastActive: user.updatedAt.toISOString(), // Using updatedAt as proxy for last active
      totalQueries: user._count.queries,
      todayQueries: 0, // Would need separate query for today's count
      status: 'active' // Default for now, would be actual status field
    }))

    return NextResponse.json({
      users: userData,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 