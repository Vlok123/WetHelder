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
        console.log(`Found ${queries.length} queries for user ID: ${session.user.id}`)
      }
      
      // Als geen queries gevonden met session.user.id, probeer via email
      if (queries.length === 0 && session.user.email) {
        console.log('No queries found with user ID, trying email lookup...')
        
        // Zoek eerst de user in de database
        const user = await prisma.user.findUnique({
          where: { email: session.user.email }
        })
        
        if (user) {
          console.log(`Found user in database: ${user.id}`)
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
          console.log(`Found ${queries.length} queries for database user ID: ${user.id}`)
        } else {
          console.log('User not found in database, this might be a mock user')
        }
      }
      
      // Als nog steeds geen queries, probeer alle queries voor debugging
      if (queries.length === 0) {
        console.log('Still no queries found, checking all queries in database...')
        const allQueries = await prisma.query.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            userId: true,
            question: true,
            createdAt: true
          }
        })
        console.log('Recent queries in database:', allQueries.map(q => ({ 
          id: q.id, 
          userId: q.userId, 
          question: q.question.substring(0, 50) + '...',
          createdAt: q.createdAt
        })))
      }

    } catch (dbError) {
      console.error('Database error in chat history:', dbError)
      return NextResponse.json({ 
        error: 'Database error', 
        message: 'Er is een probleem met de database verbinding.',
        queries: [],
        debug: {
          userEmail: session.user.email,
          userId: session.user.id,
          error: dbError instanceof Error ? dbError.message : 'Unknown error'
        }
      }, { status: 500 })
    }

    console.log(`Returning ${queries.length} queries for user`)
    
    return NextResponse.json({ 
      queries,
      debug: {
        userEmail: session.user.email,
        userId: session.user.id,
        totalFound: queries.length
      }
    })

  } catch (error) {
    console.error('Chat history API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Er is een onverwachte fout opgetreden.',
      queries: []
    }, { status: 500 })
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