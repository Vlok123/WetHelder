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
    if (session.user.email === 'sanderhelmink@gmail.com') {
      // Auto-admin access for sanderhelmink@gmail.com
    } else {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
      })

      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
      }
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const search = url.searchParams.get('search') || ''
    const role = url.searchParams.get('role') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }
    if (role && role !== 'all') {
      where.role = role
    }

    // Get users with query counts
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            queries: true
          }
        }
      }
    })

    // Get total count
    const totalUsers = await prisma.user.count({ where })

    // Format response
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      totalQueries: user._count.queries,
      createdAt: user.createdAt.toISOString(),
      lastActive: user.updatedAt.toISOString(),
      status: 'active' // For now, all users are active
    }))

    // Create response with no-cache headers
    const response = NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    })
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response

  } catch (error) {
    console.error('Admin users error:', error)
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
    errorResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    return errorResponse
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.email === 'sanderhelmink@gmail.com') {
      // Auto-admin access for sanderhelmink@gmail.com
    } else {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
      })

      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
      }
    }

    const { userId, updates } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
} 