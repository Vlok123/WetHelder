import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import NextAuth, { AuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vul alstublieft beide velden in");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          throw new Error("Email of wachtwoord is onjuist");
        }

        if (user.isBlocked) {
          throw new Error("Dit account is geblokkeerd");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Email of wachtwoord is onjuist");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isBlocked: user.isBlocked
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dagen
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string;
        session.user.id = token.sub as string;
        session.user.isBlocked = token.isBlocked as boolean;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.isBlocked = user.isBlocked;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      if (!user.email) return false
      
      try {
        // Check if user exists in database
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        })
        
        // If user doesn't exist, create them
        if (!existingUser) {
          // Determine role - admin for sanderhelmink@gmail.com, otherwise FREE
          const role = user.email === 'sanderhelmink@gmail.com' ? 'ADMIN' : 'FREE'
          
          existingUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || user.email.split('@')[0],
              role: role,
              // OAuth users don't have passwords
              password: null
            }
          })
        } else {
          // Update admin role for sanderhelmink@gmail.com if needed
          if (user.email === 'sanderhelmink@gmail.com' && existingUser.role !== 'ADMIN') {
            await prisma.user.update({
              where: { email: user.email },
              data: { role: 'ADMIN' }
            })
          }
        }
        
        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return false
      }
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    signOut: "/"
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 