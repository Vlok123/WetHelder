import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface QueryResult {
  id: string
  question: string
  answer: string
  profession: string
  createdAt: Date
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Chat history request for user:', session.user.email, 'ID:', session.user.id)

    // Probeer eerst met session.user.id (voor mock users)
    let queries: QueryResult[] = []
    
    try {
      if (session.user.id) {
        // Probeer direct met session.user.id
        queries = await prisma.query.findMany({
          where: { userId: session.user.id },
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
        
        console.log(`Found ${queries.length} queries with session.user.id`)
      }
      
      // Als geen queries gevonden, probeer via email lookup
      if (queries.length === 0) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true }
        })

        if (user) {
          queries = await prisma.query.findMany({
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
          
          console.log(`Found ${queries.length} queries with database user.id`)
        }
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Return empty array if database is not available
      return NextResponse.json({ 
        queries: [],
        message: 'Database temporarily unavailable'
      })
    }

    return NextResponse.json({ 
      queries: queries.map(query => ({
        ...query,
        createdAt: query.createdAt.toISOString()
      })),
      total: queries.length
    })

  } catch (error) {
    console.error('Chat history error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch chat history',
        queries: [],
        message: 'Er is een fout opgetreden bij het ophalen van de geschiedenis'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let deletedCount = 0

    try {
      // Probeer eerst met session.user.id
      if (session.user.id) {
        const result = await prisma.query.deleteMany({
          where: { userId: session.user.id }
        })
        deletedCount = result.count
      }
      
      // Als geen queries verwijderd, probeer via email lookup
      if (deletedCount === 0) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true }
        })

        if (user) {
          const result = await prisma.query.deleteMany({
            where: { userId: user.id }
          })
          deletedCount = result.count
        }
      }
    } catch (dbError) {
      console.error('Database error during deletion:', dbError)
      return NextResponse.json(
        { error: 'Database temporarily unavailable' },
        { status: 503 }
      )
    }

    return NextResponse.json({ 
      message: 'Chat history cleared successfully',
      deletedCount
    })

  } catch (error) {
    console.error('Clear chat history error:', error)
    return NextResponse.json(
      { error: 'Failed to clear chat history' },
      { status: 500 }
    )
  }
} 