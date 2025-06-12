import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - Genereer citatie voor een query
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { queryId, citationStyle = 'apa' } = await request.json()

    if (!queryId) {
      return NextResponse.json({ error: 'Query ID is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Haal de query op
    const query = await prisma.query.findUnique({
      where: { id: queryId },
      select: {
        id: true,
        question: true,
        answer: true,
        sources: true,
        profession: true,
        createdAt: true
      }
    })

    if (!query) {
      return NextResponse.json({ error: 'Query not found' }, { status: 404 })
    }

    // Parse sources if they exist
    let parsedSources = []
    try {
      if (query.sources && query.sources.trim() !== '') {
        parsedSources = JSON.parse(query.sources)
      }
    } catch (e) {
      // If sources is not valid JSON, treat as plain text
      if (query.sources && query.sources.trim() !== '') {
        parsedSources = [{ title: 'Juridische Bron', url: query.sources }]
      }
    }

    // Genereer citaties gebaseerd op stijl
    const citations = generateCitations(query, parsedSources, citationStyle)

    return NextResponse.json({ 
      citations,
      query: {
        id: query.id,
        question: query.question,
        createdAt: query.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Citations POST error:', error)
    return NextResponse.json(
      { error: 'Failed to generate citations' },
      { status: 500 }
    )
  }
}

function generateCitations(query: any, sources: any[], style: string) {
  const currentDate = new Date()
  const accessDate = currentDate.toLocaleDateString('nl-NL')
  const year = currentDate.getFullYear()

  const citations = {
    apa: generateAPACitation(query, sources, accessDate, year),
    mla: generateMLACitation(query, sources, accessDate, year),
    chicago: generateChicagoCitation(query, sources, accessDate, year),
    harvard: generateHarvardCitation(query, sources, accessDate, year),
    vancouver: generateVancouverCitation(query, sources, accessDate, year)
  }

  return {
    style,
    citation: citations[style as keyof typeof citations] || citations.apa,
    allStyles: citations,
    metadata: {
      queryId: query.id,
      question: query.question,
      accessDate,
      generatedAt: currentDate.toISOString()
    }
  }
}

function generateAPACitation(query: any, sources: any[], accessDate: string, year: number) {
  const baseText = `WetHelder AI. (${year}). Juridisch advies betreffende: "${query.question}". Geraadpleegd op ${accessDate}, van https://wethelder.nl`
  
  if (sources.length === 0) {
    return baseText
  }

  const sourceCitations = sources.map((source, index) => {
    if (source.url && source.url.includes('wetten.overheid.nl')) {
      return `Overheid.nl. (${year}). ${source.title || 'Wetgeving'}. Geraadpleegd op ${accessDate}, van ${source.url}`
    } else if (source.url && source.url.includes('rechtspraak.nl')) {
      return `Rechtspraak.nl. (${year}). ${source.title || 'Jurisprudentie'}. Geraadpleegd op ${accessDate}, van ${source.url}`
    } else {
      return `${source.title || 'Juridische bron'}. (${year}). Geraadpleegd op ${accessDate}${source.url ? `, van ${source.url}` : ''}`
    }
  }).join('\n\n')

  return `${baseText}\n\nBronnen:\n${sourceCitations}`
}

function generateMLACitation(query: any, sources: any[], accessDate: string, year: number) {
  const baseText = `WetHelder AI. "Juridisch advies betreffende: ${query.question}." WetHelder, ${year}, wethelder.nl. Geraadpleegd ${accessDate}.`
  
  if (sources.length === 0) {
    return baseText
  }

  const sourceCitations = sources.map((source, index) => {
    if (source.url && source.url.includes('wetten.overheid.nl')) {
      return `"${source.title || 'Wetgeving'}." Overheid.nl, ${year}, ${source.url}. Geraadpleegd ${accessDate}.`
    } else if (source.url && source.url.includes('rechtspraak.nl')) {
      return `"${source.title || 'Jurisprudentie'}." Rechtspraak.nl, ${year}, ${source.url}. Geraadpleegd ${accessDate}.`
    } else {
      return `"${source.title || 'Juridische bron'}." ${year}${source.url ? `, ${source.url}` : ''}. Geraadpleegd ${accessDate}.`
    }
  }).join('\n\n')

  return `${baseText}\n\nBronnen:\n${sourceCitations}`
}

function generateChicagoCitation(query: any, sources: any[], accessDate: string, year: number) {
  const baseText = `WetHelder AI. "Juridisch advies betreffende: ${query.question}." WetHelder. Geraadpleegd ${accessDate}. https://wethelder.nl.`
  
  if (sources.length === 0) {
    return baseText
  }

  const sourceCitations = sources.map((source, index) => {
    if (source.url && source.url.includes('wetten.overheid.nl')) {
      return `Overheid.nl. "${source.title || 'Wetgeving'}." Geraadpleegd ${accessDate}. ${source.url}.`
    } else if (source.url && source.url.includes('rechtspraak.nl')) {
      return `Rechtspraak.nl. "${source.title || 'Jurisprudentie'}." Geraadpleegd ${accessDate}. ${source.url}.`
    } else {
      return `"${source.title || 'Juridische bron'}." Geraadpleegd ${accessDate}${source.url ? `. ${source.url}` : ''}.`
    }
  }).join('\n\n')

  return `${baseText}\n\nBronnen:\n${sourceCitations}`
}

function generateHarvardCitation(query: any, sources: any[], accessDate: string, year: number) {
  const baseText = `WetHelder AI (${year}) 'Juridisch advies betreffende: ${query.question}', WetHelder, geraadpleegd ${accessDate}, <https://wethelder.nl>.`
  
  if (sources.length === 0) {
    return baseText
  }

  const sourceCitations = sources.map((source, index) => {
    if (source.url && source.url.includes('wetten.overheid.nl')) {
      return `Overheid.nl (${year}) '${source.title || 'Wetgeving'}', geraadpleegd ${accessDate}, <${source.url}>.`
    } else if (source.url && source.url.includes('rechtspraak.nl')) {
      return `Rechtspraak.nl (${year}) '${source.title || 'Jurisprudentie'}', geraadpleegd ${accessDate}, <${source.url}>.`
    } else {
      return `'${source.title || 'Juridische bron'}' (${year}), geraadpleegd ${accessDate}${source.url ? `, <${source.url}>` : ''}.`
    }
  }).join('\n\n')

  return `${baseText}\n\nBronnen:\n${sourceCitations}`
}

function generateVancouverCitation(query: any, sources: any[], accessDate: string, year: number) {
  const baseText = `1. WetHelder AI. Juridisch advies betreffende: ${query.question} [Internet]. WetHelder; ${year} [geraadpleegd ${accessDate}]. Beschikbaar op: https://wethelder.nl`
  
  if (sources.length === 0) {
    return baseText
  }

  const sourceCitations = sources.map((source, index) => {
    const num = index + 2
    if (source.url && source.url.includes('wetten.overheid.nl')) {
      return `${num}. Overheid.nl. ${source.title || 'Wetgeving'} [Internet]. [geraadpleegd ${accessDate}]. Beschikbaar op: ${source.url}`
    } else if (source.url && source.url.includes('rechtspraak.nl')) {
      return `${num}. Rechtspraak.nl. ${source.title || 'Jurisprudentie'} [Internet]. [geraadpleegd ${accessDate}]. Beschikbaar op: ${source.url}`
    } else {
      return `${num}. ${source.title || 'Juridische bron'}. [geraadpleegd ${accessDate}]${source.url ? `. Beschikbaar op: ${source.url}` : ''}`
    }
  }).join('\n\n')

  return `${baseText}\n\n${sourceCitations}`
} 