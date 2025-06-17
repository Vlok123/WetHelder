import { NextRequest, NextResponse } from 'next/server'
import { searchJsonSources, formatJsonSourcesForContext } from '@/lib/jsonSources'

// Copy the searchGoogleCustomAPI function from ask/route.ts for testing
async function searchGoogleCustomAPI(query: string): Promise<any[]> {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
  const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID
  
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    return []
  }
  
  try {
    const queryLower = query.toLowerCase()
    
    // Detecteer APV-gerelateerde vragen
    const apvKeywords = [
      'apv', 'gemeentelijk', 'lokaal', 'gemeente', 'plaatselijk', 'verordening',
      'alcohol', 'drinken', 'straat', 'openbare', 'park', 'plein', 'evenement',
      'geluid', 'overlast', 'terras', 'vergunning', 'handhaving'
    ]
    
    const gemeenten = [
      'amsterdam', 'rotterdam', 'den haag', 'utrecht', 'eindhoven', 'tilburg',
      'groningen', 'almere', 'breda', 'nijmegen', 'apeldoorn', 'haarlem', 'arnhem',
      'enschede', 'haarlemmermeer', 'zaanstad', 'amersfoort', 'hertogenbosch'
    ]
    
    const hasApvKeyword = apvKeywords.some(keyword => queryLower.includes(keyword))
    const hasGemeenteNaam = gemeenten.some(gemeente => queryLower.includes(gemeente))
    
    let searchQuery = query
    if (hasApvKeyword || hasGemeenteNaam) {
      searchQuery = `${query} site:lokaleregelgeving.overheid.nl OR site:overheid.nl APV "Algemene Plaatselijke Verordening"`
    }
    
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(searchQuery)}&num=10`
    
    const response = await fetch(searchUrl)
    const data = await response.json()
    
    if (!data.items) {
      return []
    }
    
    return data.items.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      source: 'Google'
    }))
    
  } catch (error) {
    return []
  }
}

function formatGoogleResultsForContext(results: any[]): string {
  if (results.length === 0) {
    return ''
  }
  
  return results.map(result => {
    return `**${result.title}** (${result.source})
URL: ${result.link}
Samenvatting: ${result.snippet}
---`
  }).join('\n\n')
}

export async function POST(request: NextRequest) {
  try {
    const { question = "APV Nijmegen alcohol verbod" } = await request.json()
    
    // Test JSON sources
    const jsonSources = await searchJsonSources(question, 10)
    const jsonContext = jsonSources.length > 0 ? formatJsonSourcesForContext(jsonSources) : ''
    
    // Test Google Search
    const googleSearchResults = await searchGoogleCustomAPI(question)
    const googleResults = formatGoogleResultsForContext(googleSearchResults)
    
    // Build the system prompt (simplified version)
    const systemPrompt = [
      "Je bent een Nederlandse juridische expert.",
      "",
      "STRIKTE REGELS VOOR JURIDISCHE ANTWOORDEN:",
      "",
      "🚨 **VERBODEN ANTWOORDEN - NOOIT GEBRUIKEN:**",
      "❌ 'Het spijt me, maar ik kan geen specifieke informatie geven...'",
      "❌ 'Ik heb geen toegang tot de actuele APV van [gemeente]...'",
      "",
      "✅ **VERPLICHTE WERKWIJZE:**",
      "1. Als er Google resultaten zijn met APV artikelen → GEBRUIK DEZE DIRECT",
      "2. Citeer ALTIJD specifieke artikelnummers uit de gevonden bronnen",
      "",
      jsonContext ? "=== OFFICIËLE JURIDISCHE BRONNEN ===" : "=== GEEN OFFICIËLE JURIDISCHE BRONNEN ===",
      jsonContext || "Geen JSON bronnen gevonden",
      "",
      googleResults ? "=== AANVULLENDE OFFICIËLE JURIDISCHE BRONNEN ===" : "",
      googleResults || "Geen Google resultaten gevonden",
    ].filter(line => line !== "").join('\n')
    
    const debugInfo = {
      question,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? 'SET' : 'MISSING',
        GOOGLE_CSE_ID: process.env.GOOGLE_CSE_ID ? 'SET' : 'MISSING'
      },
      jsonSources: {
        count: jsonSources.length,
        sources: jsonSources.map(s => s.naam)
      },
      googleSearch: {
        count: googleSearchResults.length,
        results: googleSearchResults.slice(0, 3).map(r => ({
          title: r.title,
          snippet: r.snippet.substring(0, 100) + '...'
        }))
      },
      promptLength: systemPrompt.length,
      promptPreview: systemPrompt.substring(0, 500) + '...'
    }
    
    return NextResponse.json(debugInfo, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 