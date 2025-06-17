import { NextRequest, NextResponse } from 'next/server'
import { fetchRechtspraak, fetchOpenRechtspraak, type JurisprudentieDocument } from '@/lib/officialSources'

interface JurisprudentieSearchResult {
  ecli: string
  title: string
  summary: string
  date: string
  court: string
  article: string
  topic: string
  link: string
  year: number
  caseType: string
  fullText?: string
}

interface GoogleJurisprudentieResult {
  title: string
  snippet: string
  link: string
  displayLink: string
}

/**
 * Zoek jurisprudentie via Google Custom Search API
 */
async function searchJurisprudentieGoogle(query: string): Promise<GoogleJurisprudentieResult[]> {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
  const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID
  
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    console.log('⚠️ Google API credentials niet geconfigureerd')
    return []
  }
  
  try {
    console.log('🔍 Searching jurisprudentie via Google API for:', query)
    
    // Zoek specifiek op rechtspraak.nl en gerelateerde jurisprudentie sites
    const searchQuery = `${query} site:rechtspraak.nl OR site:uitspraken.rechtspraak.nl OR site:tuchtrecht.overheid.nl ecli uitspraak vonnis arrest`
    
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(searchQuery)}&num=10&dateRestrict=m60`
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'WetHelder/1.0 (https://wethelder.nl)',
      }
    })
    
    if (!response.ok) {
      console.error('Google API error:', response.status, response.statusText)
      return []
    }
    
    const data = await response.json()
    
    if (!data.items || data.items.length === 0) {
      console.log('ℹ️ Geen Google jurisprudentie resultaten gevonden')
      return []
    }
    
    const results: GoogleJurisprudentieResult[] = data.items.map((item: any) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
      displayLink: item.displayLink
    }))
    
    console.log(`✅ ${results.length} Google jurisprudentie resultaten gevonden`)
    return results
    
  } catch (error) {
    console.error('❌ Google jurisprudentie search error:', error)
    return []
  }
}

/**
 * Converteer Google resultaten naar gestandaardiseerd formaat
 */
function convertGoogleToJurisprudentieResult(googleResult: GoogleJurisprudentieResult): JurisprudentieSearchResult {
  // Probeer ECLI uit de title of snippet te extraheren
  const ecliMatch = (googleResult.title + ' ' + googleResult.snippet).match(/ECLI:[A-Z]{2}:[A-Z]+:\d{4}:\d+/i)
  const ecli = ecliMatch ? ecliMatch[0] : `GOOGLE-${Date.now()}`
  
  // Probeer jaar uit ECLI te extraheren
  const yearMatch = ecli.match(/:(\d{4}):/)
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear()
  
  // Probeer rechtbank uit ECLI te extraheren
  let court = 'Onbekend'
  if (ecli.includes(':HR:')) court = 'Hoge Raad'
  else if (ecli.includes(':GH') || ecli.includes(':HOF')) court = 'Gerechtshof'
  else if (ecli.includes(':RB')) court = 'Rechtbank'
  else if (ecli.includes(':CTG')) court = 'Centrale Raad van Beroep'
  
  // Probeer datum uit snippet te extraheren
  const dateMatch = googleResult.snippet.match(/(\d{1,2})\s+(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)\s+(\d{4})/i)
  let dateString = new Date().toISOString().split('T')[0]
  
  if (dateMatch) {
    const months: { [key: string]: string } = {
      'januari': '01', 'februari': '02', 'maart': '03', 'april': '04',
      'mei': '05', 'juni': '06', 'juli': '07', 'augustus': '08',
      'september': '09', 'oktober': '10', 'november': '11', 'december': '12'
    }
    const day = dateMatch[1].padStart(2, '0')
    const month = months[dateMatch[2].toLowerCase()] || '01'
    const year = dateMatch[3]
    dateString = `${year}-${month}-${day}`
  }
  
  // Bepaal case type
  let caseType = 'Onbekend'
  const snippetLower = googleResult.snippet.toLowerCase()
  if (snippetLower.includes('straf') || snippetLower.includes('vervolg')) caseType = 'Strafrecht'
  else if (snippetLower.includes('civiel') || snippetLower.includes('burgerlijk')) caseType = 'Civielrecht'
  else if (snippetLower.includes('bestuurs') || snippetLower.includes('bezwaar')) caseType = 'Bestuursrecht'
  else if (snippetLower.includes('belasting') || snippetLower.includes('fiscaal')) caseType = 'Belastingrecht'
  
  // Probeer wetsartikel te extraheren
  const articleMatch = googleResult.snippet.match(/artikel\s+(\d+[a-z]?\s*[A-Z][a-z]*)/i)
  const article = articleMatch ? articleMatch[1] : 'Onbekend'
  
  return {
    ecli,
    title: googleResult.title,
    summary: googleResult.snippet,
    date: dateString,
    court,
    article,
    topic: extractTopic(googleResult.snippet),
    link: googleResult.link,
    year,
    caseType
  }
}

/**
 * Extraheer hoofdonderwerp uit snippet
 */
function extractTopic(snippet: string): string {
  const topics = [
    'doorzoeken', 'fouillering', 'huiszoeking', 'privacy', 'aanhouding',
    'vordering', 'inbeslagname', 'observatie', 'infiltratie', 'dwangmiddel',
    'verhoor', 'bekentenis', 'bewijsmiddel', 'getuige', 'deskundige'
  ]
  
  const snippetLower = snippet.toLowerCase()
  const foundTopic = topics.find(topic => snippetLower.includes(topic))
  
  return foundTopic || 'algemeen'
}

/**
 * Converteer rechtspraak.nl API resultaat naar gestandaardiseerd formaat
 */
function convertRechtspraakToResult(doc: JurisprudentieDocument): JurisprudentieSearchResult {
  return {
    ecli: doc.ecli,
    title: doc.titel,
    summary: doc.samenvatting || doc.volledigeTekst.substring(0, 200) + '...',
    date: doc.datum.toISOString().split('T')[0],
    court: doc.instantie,
    article: doc.wetsartikelen.length > 0 ? doc.wetsartikelen[0] : 'Onbekend',
    topic: doc.trefwoorden.length > 0 ? doc.trefwoorden[0] : 'algemeen', 
    link: `https://uitspraken.rechtspraak.nl/#!/details?id=${doc.ecli}`,
    year: doc.datum.getFullYear(),
    caseType: doc.rechtsgebied.length > 0 ? doc.rechtsgebied[0] : doc.uitspraakType,
    fullText: doc.volledigeTekst
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, filters } = await request.json()
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }
    
    console.log('🔍 Jurisprudentie search request:', { query, filters })
    
    const results: JurisprudentieSearchResult[] = []
    
    // STAP 1: Zoek via Google Custom Search API
    console.log('🌐 Stap 1: Google Custom Search API')
    try {
      const googleResults = await searchJurisprudentieGoogle(query)
      const convertedGoogleResults = googleResults.map(convertGoogleToJurisprudentieResult)
      results.push(...convertedGoogleResults)
      console.log(`✅ ${convertedGoogleResults.length} Google resultaten toegevoegd`)
    } catch (error) {
      console.error('Error in Google search:', error)
    }
    
    // STAP 2: Zoek via rechtspraak.nl API als backup/aanvulling
    console.log('⚖️ Stap 2: Rechtspraak.nl API')
    try {
      const rechtspraakResults = await fetchRechtspraak(20, query)
      const relevantResults = rechtspraakResults.filter(doc => {
        if (!query) return true
        const searchText = (doc.titel + ' ' + doc.samenvatting + ' ' + doc.volledigeTekst).toLowerCase()
        return searchText.includes(query.toLowerCase())
      })
      
      const convertedRechtspraakResults = relevantResults.map(convertRechtspraakToResult)
      results.push(...convertedRechtspraakResults)
      console.log(`✅ ${convertedRechtspraakResults.length} Rechtspraak.nl resultaten toegevoegd`)
    } catch (error) {
      console.error('Error in rechtspraak.nl search:', error)
    }
    
    // STAP 3: Zoek via OpenRechtspraak.nl als aanvulling
    console.log('📖 Stap 3: OpenRechtspraak.nl API')
    try {
      const openRechtspraakResults = await fetchOpenRechtspraak(query, 10)
      const convertedOpenResults = openRechtspraakResults.map(convertRechtspraakToResult)
      results.push(...convertedOpenResults)
      console.log(`✅ ${convertedOpenResults.length} OpenRechtspraak.nl resultaten toegevoegd`)
    } catch (error) {
      console.error('Error in OpenRechtspraak search:', error)
    }
    
    // STAP 4: Dedupliceer resultaten op ECLI
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => r.ecli === result.ecli)
    )
    
    // STAP 5: Pas filters toe
    let filteredResults = uniqueResults
    
    if (filters?.year) {
      filteredResults = filteredResults.filter(r => r.year.toString() === filters.year)
    }
    
    if (filters?.court) {
      filteredResults = filteredResults.filter(r => r.court.includes(filters.court))
    }
    
    if (filters?.caseType) {
      filteredResults = filteredResults.filter(r => r.caseType === filters.caseType)
    }
    
    // STAP 6: Sorteer op relevantie en datum
    filteredResults.sort((a, b) => {
      // Eerst op jaar (nieuwer = hoger)
      if (a.year !== b.year) {
        return b.year - a.year
      }
      // Dan op court prioriteit (HR > Hof > Rechtbank)
      const courtPriority = (court: string) => {
        if (court.includes('Hoge Raad')) return 3
        if (court.includes('Gerechtshof') || court.includes('Hof')) return 2
        if (court.includes('Rechtbank')) return 1
        return 0
      }
      return courtPriority(b.court) - courtPriority(a.court)
    })
    
    // Limiteer tot 50 resultaten voor performance
    const limitedResults = filteredResults.slice(0, 50)
    
    console.log(`✅ Jurisprudentie search completed: ${limitedResults.length} final results`)
    
    return NextResponse.json({
      success: true,
      query,
      results: limitedResults,
      totalFound: limitedResults.length,
      sources: {
        google: results.filter(r => r.ecli.startsWith('GOOGLE-')).length,
        rechtspraak: results.filter(r => !r.ecli.startsWith('GOOGLE-')).length
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Jurisprudentie search error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
  }
  
  // Eenvoudige GET request - gebruik POST body voor filters
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ query, filters: {} }),
    headers: { 'Content-Type': 'application/json' }
  }))
} 