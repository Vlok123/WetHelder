import { NextRequest, NextResponse } from 'next/server'
// import bcrypt from 'bcryptjs'
// import { prisma } from '@/lib/prisma'
import { addUser, userExists, registeredUsers, type MockUser } from '@/lib/mock-users'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email en wachtwoord zijn verplicht' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Wachtwoord moet minimaal 6 karakters bevatten' },
        { status: 400 }
      )
    }

    // Check if user already exists
    if (userExists(email)) {
      return NextResponse.json(
        { error: 'Gebruiker bestaat al' },
        { status: 400 }
      )
    }

    // Create user in mock storage
    const user: MockUser = {
      id: (registeredUsers.length + 10).toString(),
      email,
      password, // In production, this should be hashed
      name: name || null,
      role: 'user',
      createdAt: new Date().toISOString()
    }

    addUser(user)

    return NextResponse.json(
      { 
        message: 'Gebruiker succesvol aangemaakt',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      },
      { status: 201 }
    )

    // Original database code - uncomment when database is working
    /*
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Gebruiker bestaat al' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: 'FREE'
      }
    })

    return NextResponse.json(
      { 
        message: 'Gebruiker aangemaakt',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      },
      { status: 201 }
    )
    */
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
} 