import { NextRequest, NextResponse } from 'next/server'
import { validateResetToken } from '@/lib/mock-users'

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json()

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token en e-mailadres zijn verplicht' },
        { status: 400 }
      )
    }

    const isValid = validateResetToken(token, email)

    if (isValid) {
      return NextResponse.json(
        { message: 'Token is geldig' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'Token is verlopen of ongeldig' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Validate reset token error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
} 