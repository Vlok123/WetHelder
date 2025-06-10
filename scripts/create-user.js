const { PrismaClient } = require('@prisma/client')
const bcryptjs = require('bcryptjs')

const prisma = new PrismaClient()

async function createUser() {
  const email = 'test@wethelder.nl'
  const password = 'password123'
  const name = 'Test Gebruiker'
  
  // Hash het wachtwoord
  const hashedPassword = await bcryptjs.hash(password, 12)
  
  try {
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        password: hashedPassword,
        name,
        isAdmin: true,
        role: 'ADVOCAAT',
      },
      update: {
        password: hashedPassword,
        name,
        isAdmin: true,
        role: 'ADVOCAAT',
      },
    })
    
    console.log('✅ Test gebruiker aangemaakt:')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Wachtwoord: ${password}`)
    console.log(`👤 Naam: ${name}`)
    console.log(`🔒 Admin: ${user.isAdmin}`)
    
  } catch (error) {
    console.error('❌ Fout bij aanmaken gebruiker:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createUser() 