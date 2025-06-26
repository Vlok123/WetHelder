import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { delictType, isCustomType, timestamp } = await request.json()

    // Sla download tracking op in de database
    // We gebruiken een eenvoudige tracking tabel
    await prisma.downloadTracking.create({
      data: {
        type: 'aangifte',
        delictType: delictType || 'onbekend',
        isCustomType: isCustomType || false,
        timestamp: new Date(timestamp),
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking aangifte download:', error)
    // Return success anyway om download niet te blokkeren
    return NextResponse.json({ success: true })
  }
} 