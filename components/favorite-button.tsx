'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Heart, RefreshCw } from 'lucide-react'

interface FavoriteButtonProps {
  queryId: string
  className?: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  showText?: boolean
}

export function FavoriteButton({ 
  queryId, 
  className, 
  size = 'sm', 
  variant = 'ghost',
  showText = false 
}: FavoriteButtonProps) {
  const { data: session } = useSession()
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  const checkFavoriteStatus = useCallback(async () => {
    try {
      setIsChecking(true)
      const response = await fetch('/api/user/favorites')
      if (response.ok) {
        const data = await response.json()
        const favorites = data.favorites || []
        setIsFavorited(favorites.some((fav: any) => fav.queryId === queryId))
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
    } finally {
      setIsChecking(false)
    }
  }, [queryId])

  useEffect(() => {
    if (session && queryId) {
      checkFavoriteStatus()
    }
  }, [session, queryId, checkFavoriteStatus])

  const toggleFavorite = async () => {
    if (!session) {
      // Could show a login prompt here
      return
    }

    try {
      setIsLoading(true)
      
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/user/favorites?queryId=${queryId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setIsFavorited(false)
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/user/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ queryId })
        })
        
        if (response.ok) {
          setIsFavorited(true)
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return null // Don't show favorite button for non-logged-in users
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleFavorite}
      disabled={isLoading || isChecking}
      className={className}
    >
      {isLoading || isChecking ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Heart 
          className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
        />
      )}
      {showText && (
        <span className="ml-2">
          {isFavorited ? 'Favoriet' : 'Favoriet maken'}
        </span>
      )}
    </Button>
  )
} 