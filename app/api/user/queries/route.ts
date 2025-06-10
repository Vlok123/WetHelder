import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const queries = await prisma.query.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20, // Last 20 queries
      select: {
        id: true,
        question: true,
        answer: true,
        profession: true,
        createdAt: true
      }
    })

    return NextResponse.json({ queries })
  } catch (error) {
    console.error('Error fetching user queries:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
} 