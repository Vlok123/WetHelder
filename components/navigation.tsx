'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Scale, 
  MessageSquare, 
  User, 
  LogIn, 
  LogOut, 
  Settings,
  Crown,
  Star,
  Gift
} from 'lucide-react'

export function Navigation() {
  const { data: session, status } = useSession()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Scale className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">WetHelder</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session ? (
              // Logged in user
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground">Welkom,</span>
                  <span className="font-medium">{session.user.name}</span>
                  {session.user.role === 'PREMIUM' ? (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                      <Gift className="h-3 w-3 mr-1" />
                      Gratis
                    </Badge>
                  )}
                </div>

                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Button>
                </Link>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Uitloggen</span>
                </Button>
              </>
            ) : (
              // Not logged in
              <>
                <div className="hidden md:flex items-center text-xs text-muted-foreground mr-2">
                  <Gift className="h-3 w-3 mr-1" />
                  Tijdelijk gratis onbeperkt!
                </div>

                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Inloggen</span>
                  </Button>
                </Link>

                <Link href="/auth/signup">
                  <Button size="sm" className="flex items-center space-x-2 bg-green-600 hover:bg-green-700">
                    <Star className="h-4 w-4" />
                    <span>Gratis Account</span>
                  </Button>
                </Link>
              </>
            )}

            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
} 