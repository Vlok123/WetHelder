const { PrismaClient } = require('@prisma/client')
const bcryptjs = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  const email = 'sanderhelmink@gmail.com'
  const password = 'Beheerder123'
  const name = 'Sander Helmink'
  
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
    
    console.log('✅ Admin gebruiker aangemaakt:')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 Wachtwoord: ${password}`)
    console.log(`👤 Naam: ${name}`)
    console.log(`🔒 Admin: ${user.isAdmin}`)
    console.log(`👔 Rol: ${user.role}`)
    
  } catch (error) {
    console.error('❌ Fout bij aanmaken admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin() 