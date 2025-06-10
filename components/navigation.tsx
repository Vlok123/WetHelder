'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Scale, MessageSquare } from 'lucide-react'

export function Navigation() {
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
            <Link href="/ask">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Stel een vraag</span>
              </Button>
            </Link>
            
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
} 