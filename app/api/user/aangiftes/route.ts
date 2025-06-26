import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      delictType, 
      antwoorden, 
      vrijeTekst, 
      gegenereerdeAangifte, 
      isCustomType, 
      zoekopdracht 
    } = await request.json()

    // Zoek de user op
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Sla de aangifte op
    const savedAangifte = await prisma.savedAangifte.create({
      data: {
        userId: user.id,
        delictType: delictType || 'onbekend',
        antwoorden: JSON.stringify(antwoorden),
        vrijeTekst: vrijeTekst || '',
        gegenereerdeAangifte: gegenereerdeAangifte || '',
        isCustomType: isCustomType || false,
        zoekopdracht: zoekopdracht || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      aangifteId: savedAangifte.id 
    })
  } catch (error) {
    console.error('Error saving aangifte:', error)
    return NextResponse.json(
      { error: 'Failed to save aangifte' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Zoek de user op
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Haal alle aangiftes van de user op
    const aangiftes = await prisma.savedAangifte.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ aangiftes })
  } catch (error) {
    console.error('Error fetching aangiftes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch aangiftes' },
      { status: 500 }
    )
  }
} 