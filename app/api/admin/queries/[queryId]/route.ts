import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ queryId: string }> }
) {
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

    const { queryId } = await params

    if (!queryId) {
      return NextResponse.json({ error: 'Query ID is required' }, { status: 400 })
    }

    // Check if query exists
    const existingQuery = await prisma.query.findUnique({
      where: { id: queryId }
    })

    if (!existingQuery) {
      return NextResponse.json({ error: 'Query not found' }, { status: 404 })
    }

    // Delete the query
    await prisma.query.delete({
      where: { id: queryId }
    })

    return NextResponse.json({ 
      message: 'Query deleted successfully',
      queryId 
    })

  } catch (error) {
    console.error('Admin query delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete query' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ queryId: string }> }
) {
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

    const { queryId } = await params

    if (!queryId) {
      return NextResponse.json({ error: 'Query ID is required' }, { status: 400 })
    }

    // Get query with user info
    const query = await prisma.query.findUnique({
      where: { id: queryId },
      select: {
        id: true,
        question: true,
        answer: true,
        profession: true,
        userId: true,
        sources: true,
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

    if (!query) {
      return NextResponse.json({ error: 'Query not found' }, { status: 404 })
    }

    // Format response
    const formattedQuery = {
      id: query.id,
      question: query.question,
      fullQuestion: query.question,
      answer: query.answer,
      fullAnswer: query.answer,
      profession: query.profession,
      userType: query.userId ? 'logged' : 'anonymous',
      userEmail: query.user?.email || 'Anoniem',
      userName: query.user?.name || 'Anonieme gebruiker',
      userRole: query.user?.role || 'ANONYMOUS',
      sources: query.sources ? JSON.parse(query.sources) : null,
      createdAt: query.createdAt.toISOString()
    }

    return NextResponse.json({ query: formattedQuery })

  } catch (error) {
    console.error('Admin query get error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch query' },
      { status: 500 }
    )
  }
} 