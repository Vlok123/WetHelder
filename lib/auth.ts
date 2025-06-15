import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          let user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          // If user doesn't exist and it's the admin email, create admin user
          if (!user && credentials.email === 'sanderhelmink@gmail.com') {
            const hashedPassword = await bcrypt.hash(credentials.password, 12)
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                name: 'Sander Helmink',
                password: hashedPassword,
                role: 'ADMIN'
              }
            })
          }

          // If user doesn't exist, create new user with default role
          if (!user) {
            const hashedPassword = await bcrypt.hash(credentials.password, 12)
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                name: credentials.email.split('@')[0], // Use email prefix as name
                password: hashedPassword,
                role: 'FREE'
              }
            })
          }

          if (user && user.password) {
            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              user.password
            )

            if (isPasswordValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isBlocked: user.isBlocked || false,
              }
            }
          }
        } catch (error) {
          console.error('Database auth error:', error)
          
          // Fallback to mock users only if database is completely unavailable
          try {
            const { findUser } = await import('./mock-users')
            const mockUser = findUser(credentials.email)
            
            if (mockUser && mockUser.password === credentials.password) {
              return {
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name || mockUser.email.split('@')[0],
                role: mockUser.role === 'admin' ? 'ADMIN' : 'USER',
                isBlocked: false,
              }
            }
          } catch (mockError) {
            console.error('Mock auth error:', mockError)
          }
        }

        return null
      }
    })
    // Temporarily disable EmailProvider to avoid configuration issues
    // EmailProvider({
    //   server: {
    //     host: process.env.EMAIL_SERVER_HOST,
    //     port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    //     auth: {
    //       user: process.env.EMAIL_SERVER_USER,
    //       pass: process.env.EMAIL_SERVER_PASSWORD,
    //     },
    //   },
    //   from: process.env.EMAIL_FROM,
    // })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && token.sub) {
        session.user.id = token.sub
        session.user.role = token.role || 'FREE'
        
        // Ensure admin role for sanderhelmink@gmail.com
        if (session.user.email === 'sanderhelmink@gmail.com') {
          session.user.role = 'ADMIN'
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Auto-create or update admin user for sanderhelmink@gmail.com
      if (user.email === 'sanderhelmink@gmail.com') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })
          
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || 'Sander Helmink',
                role: 'ADMIN'
              }
            })
          } else if (existingUser.role !== 'ADMIN') {
            // Update to admin if not already
            await prisma.user.update({
              where: { email: user.email },
              data: { role: 'ADMIN' }
            })
          }
        } catch (error) {
          console.error('Error creating/updating admin user:', error)
        }
      }
      return true
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET || 'local-development-secret-key-change-in-production',
  debug: process.env.NODE_ENV === 'development',
}
