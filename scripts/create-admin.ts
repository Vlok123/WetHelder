import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    const email = 'sanderhelmink@gmail.com'
    const password = 'Beheerder123'
    const name = 'Sander Helmink'

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('❌ Admin gebruiker bestaat al!')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'PREMIUM' // PREMIUM gives unlimited access
      }
    })

    console.log('✅ Admin gebruiker aangemaakt!')
    console.log('📧 Email:', admin.email)
    console.log('👤 Naam:', admin.name)
    console.log('🔑 Role:', admin.role)
    console.log('🆔 ID:', admin.id)

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin() 