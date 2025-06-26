import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Zoek de user op
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verwijder de aangifte (alleen als het van de ingelogde user is)
    const deletedAangifte = await prisma.savedAangifte.deleteMany({
      where: {
        id: id,
        userId: user.id
      }
    })

    if (deletedAangifte.count === 0) {
      return NextResponse.json({ error: 'Aangifte not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting aangifte:', error)
    return NextResponse.json(
      { error: 'Failed to delete aangifte' },
      { status: 500 }
    )
  }
} 