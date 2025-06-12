import { NextRequest, NextResponse } from 'next/server'
import { 
  comprehensiveJuridicalSearch,
  extractSearchTermsFromResponse,
  formatSearchResultsForContext
} from '@/lib/googleSearch'

export async function POST(request: NextRequest) {
  try {
    const { query, extractFrom } = await request.json()
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Check if Google API is configured
    if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_CSE_ID) {
      return NextResponse.json({ 
        error: 'Google API not configured',
        message: 'GOOGLE_API_KEY and GOOGLE_CSE_ID environment variables are required'
      }, { status: 500 })
    }

    let extractedTerms: string[] = []
    
    // If extractFrom is provided, extract search terms from it
    if (extractFrom && typeof extractFrom === 'string') {
      extractedTerms = extractSearchTermsFromResponse(extractFrom)
    }

    // Perform comprehensive search
    const results = await comprehensiveJuridicalSearch(query)
    
    // Format results for context
    const formattedContext = formatSearchResultsForContext(results)
    
    // Calculate totals
    const totals = {
      wetten: results.sources?.wetten?.length || 0,
      rechtspraak: results.sources?.rechtspraak?.length || 0,
      tuchtrecht: results.sources?.tuchtrecht?.length || 0,
      boetes: results.sources?.boetes?.length || 0,
      overheid: results.sources?.overheid?.length || 0,
      apv: results.sources?.apv?.length || 0,
      total: results.totalResults || 0
    }

    return NextResponse.json({
      success: true,
      query,
      extractedTerms,
      results,
      formattedContext,
      totals,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Google Search API error:', error)
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

  try {
    // Simple search test
    const results = await comprehensiveJuridicalSearch(query)
    
    return NextResponse.json({
      success: true,
      query,
      results,
      totals: {
        wetten: results.sources?.wetten?.length || 0,
        rechtspraak: results.sources?.rechtspraak?.length || 0,
        tuchtrecht: results.sources?.tuchtrecht?.length || 0,
        boetes: results.sources?.boetes?.length || 0,
        overheid: results.sources?.overheid?.length || 0,
        apv: results.sources?.apv?.length || 0,
        total: results.totalResults || 0
      }
    })
  } catch (error) {
    console.error('Google Search API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 