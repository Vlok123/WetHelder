// Test the exact Google Search function from /api/ask/route.ts

interface GoogleSearchResult {
  title: string
  link: string
  snippet: string
  source: string
}

function extractSourceFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    
    if (domain.includes('wetten.overheid.nl')) return 'Wetten.overheid.nl'
    if (domain.includes('lokaleregelgeving.overheid.nl')) return 'LokaleRegelgeving.Overheid.nl'
    if (domain.includes('rechtspraak.nl')) return 'Rechtspraak.nl'
    if (domain.includes('overheid.nl')) return 'Overheid.nl'
    if (domain.includes('officielebekendmakingen.nl')) return 'OfficiëleBekendemakingen.nl'
    if (domain.includes('belastingdienst.nl')) return 'Belastingdienst'
    if (domain.includes('uwv.nl')) return 'UWV'
    if (domain.includes('politie.nl')) return 'Politie.nl'
    if (domain.includes('rijksoverheid.nl')) return 'Rijksoverheid'
    if (domain.includes('cbr.nl')) return 'CBR'
    if (domain.includes('cbs.nl')) return 'CBS'
    if (domain.includes('juridischloket.nl')) return 'Juridisch Loket'
    
    return domain
  } catch {
    return 'Onbekende bron'
  }
}

async function searchGoogleCustomAPI(query: string): Promise<GoogleSearchResult[]> {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
  const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID
  
  console.log('=== GOOGLE API TEST ===')
  console.log('API Key:', GOOGLE_API_KEY ? 'SET (' + GOOGLE_API_KEY.substring(0, 20) + '...)' : 'MISSING')
  console.log('CSE ID:', GOOGLE_CSE_ID ? 'SET (' + GOOGLE_CSE_ID + ')' : 'MISSING')
  
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    console.log('⚠️ Google API credentials niet geconfigureerd')
    return []
  }
  
  try {
    console.log('🌐 Searching Google Custom Search API for:', query)
    
    // Verbeter zoekterm voor APV vragen
    let searchQuery = query
    const queryLower = query.toLowerCase()
    
    if (queryLower.includes('apv') || queryLower.includes('gemeentelijk') || queryLower.includes('lokaal')) {
      // Voor APV vragen: voeg specifieke zoektermen toe
      searchQuery = `${query} site:lokaleregelgeving.overheid.nl OR site:overheid.nl APV verordening`
      console.log('🏛️ APV-specifieke zoekopdracht:', searchQuery)
    }
    
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(searchQuery)}&num=10`
    console.log('🔗 Search URL:', searchUrl.replace(GOOGLE_API_KEY, 'API_KEY_HIDDEN'))
    
    const response = await fetch(searchUrl)
    console.log('📡 Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error response:', errorText)
      return []
    }
    
    const data = await response.json()
    console.log('📊 Raw API response keys:', Object.keys(data))
    console.log('📊 Items found:', data.items?.length || 0)
    console.log('📊 Search info:', data.searchInformation)
    
    if (!data.items) {
      console.log('ℹ️ Geen Google zoekresultaten gevonden')
      return []
    }
    
    const results: GoogleSearchResult[] = data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: extractSourceFromUrl(item.link)
    }))
    
    console.log(`✅ ${results.length} Google zoekresultaten gevonden`)
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.title}`)
      console.log(`   Source: ${result.source}`)
      console.log(`   URL: ${result.link}`)
      console.log(`   Snippet: ${result.snippet.substring(0, 100)}...`)
      console.log('')
    })
    
    return results
    
  } catch (error) {
    console.error('❌ Google Custom Search API error:', error)
    return []
  }
}

// Test with APV question
searchGoogleCustomAPI('APV Nijmegen alcohol verbod'); 