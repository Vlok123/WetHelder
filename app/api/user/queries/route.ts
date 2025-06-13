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
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      )
    }

    // Get user's queries from database
    const queries = await prisma.query.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        question: true,
        answer: true,
        profession: true,
        createdAt: true
      }
    })

    // Transform to match expected format
    const formattedQueries = queries.map(query => ({
      id: query.id,
      question: query.question,
      answer: query.answer,
      profession: query.profession,
      createdAt: query.createdAt.toISOString()
    }))

    return NextResponse.json({
      queries: formattedQueries,
      total: formattedQueries.length
    })

  } catch (error) {
    console.error('Error fetching user queries:', error)
    return NextResponse.json(
      { error: 'Server fout bij ophalen queries' },
      { status: 500 }
    )
  }
} 