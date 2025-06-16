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
    const userType = url.searchParams.get('userType') || 'all' // all, logged, anonymous
    const profession = url.searchParams.get('profession') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { answer: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (userType === 'logged') {
      where.userId = { not: null }
    } else if (userType === 'anonymous') {
      where.userId = null
    }

    if (profession && profession !== 'all') {
      where.profession = profession
    }

    // Get queries with user info
    const queries = await prisma.query.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        question: true,
        answer: true,
        profession: true,
        userId: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            name: true,
            role: true
          }
        }
      }
    })

    // Get total count
    const totalQueries = await prisma.query.count({ where })

    // Format response
    const formattedQueries = queries.map(query => ({
      id: query.id,
      question: query.question.substring(0, 100) + (query.question.length > 100 ? '...' : ''),
      fullQuestion: query.question,
      answer: query.answer.substring(0, 200) + (query.answer.length > 200 ? '...' : ''),
      fullAnswer: query.answer,
      profession: query.profession,
      userType: query.userId ? 'logged' : 'anonymous',
      userEmail: query.user?.email || 'Anoniem',
      userName: query.user?.name || 'Anonieme gebruiker',
      userRole: query.user?.role || 'ANONYMOUS',
      createdAt: query.createdAt.toISOString()
    }))

    return NextResponse.json({
      queries: formattedQueries,
      pagination: {
        page,
        limit,
        total: totalQueries,
        pages: Math.ceil(totalQueries / limit)
      }
    })

  } catch (error) {
    console.error('Admin queries error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch queries' },
      { status: 500 }
    )
  }
} 