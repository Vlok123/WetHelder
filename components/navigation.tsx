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
  Gift,
  Shield
} from 'lucide-react'

export function Navigation() {
  const { data: session, status } = useSession()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="text-lg sm:text-xl font-bold">WetHelder</span>
            </Link>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            {status === 'loading' ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session ? (
              // Logged in user
              <>
                <div className="hidden sm:flex items-center space-x-2 text-sm mr-2">
                  <span className="text-muted-foreground hidden lg:inline">Welkom,</span>
                  <span className="font-medium truncate max-w-20 sm:max-w-none">{session.user.name}</span>
                  {session.user.role === 'PREMIUM' ? (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Premium</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                      <Gift className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Gratis</span>
                    </Badge>
                  )}
                </div>

                {/* Mobile user indicator */}
                <div className="sm:hidden flex items-center">
                  {session.user.role === 'PREMIUM' ? (
                    <Crown className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <Gift className="h-4 w-4 text-green-600" />
                  )}
                </div>

                <Link href="/dashboard" className="shrink-0">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1 sm:space-x-2 h-9 px-2 sm:px-3">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>

                {session.user?.email === 'sanderhelmink@gmail.com' && (
                  <Link href="/admin" className="shrink-0">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1 sm:space-x-2 h-9 px-2 sm:px-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      <Shield className="h-4 w-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </Button>
                  </Link>
                )}

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center space-x-1 sm:space-x-2 h-9 px-2 sm:px-3 shrink-0"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Uitloggen</span>
                </Button>
              </>
            ) : (
              // Not logged in
              <>
                <div className="hidden lg:flex items-center text-xs text-muted-foreground mr-2">
                  <Gift className="h-3 w-3 mr-1" />
                  Tijdelijk gratis onbeperkt!
                </div>

                <Link href="/auth/signin" className="shrink-0">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1 sm:space-x-2 h-9 px-2 sm:px-3">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Inloggen</span>
                  </Button>
                </Link>

                <Link href="/auth/signup" className="shrink-0">
                  <Button size="sm" className="flex items-center space-x-1 sm:space-x-2 bg-green-600 hover:bg-green-700 h-9 px-2 sm:px-3">
                    <Star className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">Account</span>
                  </Button>
                </Link>
              </>
            )}

            <div className="shrink-0">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 