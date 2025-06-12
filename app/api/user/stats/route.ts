import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niet geautoriseerd' },
        { status: 401 }
      )
    }

    // Mock data voor development - in productie zou dit uit een database komen
    const mockStats = {
      totalQueries: 15,
      todayUsage: 3,
      remainingToday: 997, // Unlimited voor authenticated users in development
      role: session.user.email === 'test@wethelder.nl' ? 'FREE' : 'PREMIUM'
    }

    return NextResponse.json(mockStats)

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Server fout bij ophalen statistieken' },
      { status: 500 }
    )
  }
} 