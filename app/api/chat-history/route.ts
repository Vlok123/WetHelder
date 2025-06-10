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

    // Haal de user op uit de database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Haal de query geschiedenis op
    const queries = await prisma.query.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limiteer tot de laatste 50 queries
      select: {
        id: true,
        question: true,
        answer: true,
        profession: true,
        createdAt: true
      }
    })

    return NextResponse.json({ 
      queries: queries.map(query => ({
        ...query,
        createdAt: query.createdAt.toISOString()
      }))
    })

  } catch (error) {
    console.error('Chat history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    )
  }
} 