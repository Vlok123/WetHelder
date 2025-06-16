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
  History,
  Search,
  BookOpen,
  Users,
  GraduationCap,
  Briefcase,
  Menu,
  ChevronDown,
  Gavel
} from 'lucide-react'

const professionProfiles = [
  { id: 'algemeen', name: 'Burger/Algemeen', icon: Users },
  { id: 'jurist', name: 'Jurist/Advocaat', icon: Scale },
  { id: 'politieagent', name: 'Politieagent', icon: Shield },
  { id: 'boa', name: 'BOA', icon: Shield },
  { id: 'student', name: 'Student', icon: GraduationCap },
  { id: 'ondernemer', name: 'Ondernemer', icon: Briefcase }
]

export function Navigation() {
  const { data: session, status } = useSession()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="text-lg sm:text-xl font-bold">WetHelder</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/ask" className="text-sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/wetuitleg" className="text-sm">
                  <Scale className="h-4 w-4 mr-2" />
                  Wetteksten
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/jurisprudentie" className="text-sm">
                  <Gavel className="h-4 w-4 mr-2" />
                  Jurisprudentie
                </Link>
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden flex items-center space-x-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/ask">
                  <MessageSquare className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/wetuitleg">
                  <Scale className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/jurisprudentie">
                  <Gavel className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Status indicator */}
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs hidden sm:inline-flex">
              LIVE
            </Badge>

            {/* Authentication */}
            {status === 'loading' ? (
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted animate-pulse" />
            ) : session ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                  <Link href="/dashboard" className="flex items-center">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden md:inline">Dashboard</span>
                  </Link>
                </Button>
                
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Uitloggen</span>
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