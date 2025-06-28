'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Download, 
  Trash2,
  Calendar,
  Eye,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface SavedAangifte {
  id: string
  delictType: string
  vrijeTekst: string
  gegenereerdeAangifte: string
  isCustomType: boolean
  createdAt: string
  updatedAt: string
}

export default function SavedAangiftesPage() {
  const { data: session, status } = useSession()
  const [aangiftes, setAangiftes] = useState<SavedAangifte[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchAangiftes()
    } else if (status !== 'loading') {
      setIsLoading(false)
    }
  }, [session, status])

  const fetchAangiftes = async () => {
    try {
      const response = await fetch('/api/user/aangiftes')
      if (response.ok) {
        const data = await response.json()
        setAangiftes(data.aangiftes)
      }
    } catch (error) {
      console.error('Error fetching aangiftes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadAangifte = (aangifte: SavedAangifte) => {
    const datum = new Date(aangifte.createdAt).toLocaleDateString('nl-NL')
    const bestandsnaam = `aangifte_${aangifte.delictType.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${datum.replace(/\//g, '-')}.txt`
    
    const blob = new Blob([aangifte.gegenereerdeAangifte], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = bestandsnaam
    a.click()
    URL.revokeObjectURL(url)
  }

  const deleteAangifte = async (id: string) => {
    if (!confirm('Weet u zeker dat u deze aangifte wilt verwijderen?')) {
      return
    }

    try {
      const response = await fetch(`/api/user/aangiftes/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setAangiftes(prev => prev.filter(a => a.id !== id))
      } else {
        alert('Fout bij verwijderen aangifte')
      }
    } catch (error) {
      console.error('Error deleting aangifte:', error)
      alert('Fout bij verwijderen aangifte')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-8">
            <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Aangiftes laden...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Inloggen vereist</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                U moet ingelogd zijn om uw opgeslagen aangiftes te bekijken.
              </p>
              <div className="flex gap-4">
                <Link href="/auth/signin">
                  <Button>Inloggen</Button>
                </Link>
                <Link href="/aangifte">
                  <Button variant="outline">Nieuwe Aangifte</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mijn Aangiftes
          </h1>
          <p className="text-gray-600 text-lg">
            Bekijk en download uw opgeslagen aangiftes
          </p>
        </div>

        {/* Nieuwe aangifte knop */}
        <div className="mb-6">
          <Link href="/aangifte">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nieuwe Aangifte Maken
            </Button>
          </Link>
        </div>

        {/* Aangiftes lijst */}
        {aangiftes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Geen aangiftes gevonden
              </h3>
              <p className="text-gray-600 mb-4">
                U heeft nog geen aangiftes opgeslagen.
              </p>
              <Link href="/aangifte">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Eerste Aangifte Maken
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {aangiftes.map((aangifte) => (
              <Card key={aangifte.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {aangifte.delictType}
                        </h3>
                        {aangifte.isCustomType && (
                          <Badge variant="secondary" className="text-xs">
                            Aangepast delicttype
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {aangifte.vrijeTekst.substring(0, 150)}
                        {aangifte.vrijeTekst.length > 150 && '...'}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(aangifte.createdAt).toLocaleDateString('nl-NL')}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {aangifte.gegenereerdeAangifte.length} karakters
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadAangifte(aangifte)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAangifte(aangifte.id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 