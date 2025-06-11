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
  Shield,
  History
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
            
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/ask" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Stel vraag
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Status indicator */}
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs hidden sm:inline-flex">
              BETA
            </Badge>

            {/* Authentication */}
            {status === 'loading' ? (
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted animate-pulse" />
            ) : session ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                  <Link href="/chat-history" className="flex items-center">
                    <History className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden md:inline">Geschiedenis</span>
                  </Link>
                </Button>
                
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline ml-1">Uitloggen</span>
                </Button>
              </div>
            ) : (
              <Button size="sm" asChild>
                <Link href="/auth/signin">
                  <LogIn className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Inloggen</span>
                </Link>
              </Button>
            )}
            
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
} 