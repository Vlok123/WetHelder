import { NextRequest, NextResponse } from 'next/server'
import { userExists, generateResetToken } from '@/lib/mock-users'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'E-mailadres is verplicht' },
        { status: 400 }
      )
    }

    // Check if user exists
    const exists = userExists(email)
    
    if (!exists) {
      // Voor beveiliging geven we altijd hetzelfde bericht terug
      // ongeacht of het account bestaat of niet
      return NextResponse.json(
        { 
          message: 'Als dit e-mailadres bekend is, hebben we een reset link verstuurd.',
          resetToken: null
        },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = generateResetToken(email)

    // In een echte implementatie zou hier een email worden verstuurd
    // Voor nu returneren we de token voor demo doeleinden
    return NextResponse.json(
      { 
        message: 'Reset link verstuurd',
        resetToken: resetToken // In productie zou dit NIET worden teruggegeven
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
} 