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
    const mockQueries = [
      {
        id: '1',
        question: 'Wat zijn mijn rechten bij een politiecontrole?',
        answer: '**Artikel 447e Sr (niet-meewerken politiecontrole)** - Bij een politiecontrole heeft u bepaalde rechten en plichten...',
        profession: 'burger',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 dagen geleden
      },
      {
        id: '2',
        question: 'Mag ik geblindeerde ramen hebben?',
        answer: '**Artikel 5.2.42 RVV** - Geblindeerde ramen zijn onder bepaalde voorwaarden toegestaan...',
        profession: 'burger',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 dag geleden
      },
      {
        id: '3',
        question: 'Wat is de maximale boete voor snelheidsovertreding?',
        answer: '**Artikel 19-20 RVV** - De boetes voor snelheidsovertredingen variëren...',
        profession: 'politie',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 uur geleden
      }
    ]

    return NextResponse.json({
      queries: mockQueries,
      total: mockQueries.length
    })

  } catch (error) {
    console.error('Error fetching user queries:', error)
    return NextResponse.json(
      { error: 'Server fout bij ophalen queries' },
      { status: 500 }
    )
  }
} 