import { NextRequest, NextResponse } from 'next/server'
import { consumeResetToken, updateUserPassword } from '@/lib/mock-users'

export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json()

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: 'Token, e-mailadres en wachtwoord zijn verplicht' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Wachtwoord moet minimaal 6 karakters bevatten' },
        { status: 400 }
      )
    }

    // Use the reset token (this validates and removes it)
    const tokenUsed = consumeResetToken(token, email)

    if (!tokenUsed) {
      return NextResponse.json(
        { error: 'Token is verlopen of ongeldig' },
        { status: 400 }
      )
    }

    // Update the user's password
    const passwordUpdated = updateUserPassword(email, password)

    if (!passwordUpdated) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Wachtwoord succesvol bijgewerkt' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
} 