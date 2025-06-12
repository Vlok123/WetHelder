import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  runFullDataSync,
  fetchBasiswettenbestand,
  fetchKOOPDocuments,
  fetchRechtspraak,
  fetchTweedeKamer,
  fetchBelastingdienst,
  fetchAutoriteitPersoonsgegevens,
  fetchACM,
  fetchSVB,
  fetchUWV,
  fetchKadaster,
  fetchPolitie,
  fetchRijksoverheid,
  fetchJuridischLoket,
  fetchCVDR,
  fetchDataOverheid,
  fetchOpenRechtspraak,
  fetchBoetebaseOM,
  fetchPolitieOpenData,
  fetchOpenRaadsinformatie,
  fetchBAGAPI,
  fetchCBSStatLine,
  fetchRDWOpenData,
  fetchOpenKVK,
  fetchEURLexWebService,
  searchOfficialSources as searchOfficialSourcesLib
} from '@/lib/officialSources'

// GET - Status van data ingestie
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Alleen admins kunnen ingestie status bekijken
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // TODO: Implementeer status check wanneer database modellen beschikbaar zijn
    return NextResponse.json({
      status: 'ready',
      message: 'Data ingestie systeem is gereed',
      sources: {
        wettenbank: 'configured',
        rechtspraak: 'configured', 
        koop: 'configured',
        tweedekamer: 'configured',
        belastingdienst: 'configured',
        autoriteitpersoonsgegevens: 'configured',
        acm: 'configured',
        svb: 'configured',
        uwv: 'configured',
        kadaster: 'configured',
        politie: 'configured',
        rijksoverheid: 'configured',
        juridischloket: 'configured',
        cvdr: 'configured',
        dataoverheid: 'configured',
        openrechtspraak: 'configured',
        boetebaseom: 'configured',
        politieopendata: 'configured',
        openraadsinformatie: 'configured',
        bagapi: 'configured',
        cbsstatline: 'configured',
        rdwopendata: 'configured',
        openkvk: 'configured',
        eurlexwebservice: 'configured',
        eurlex: 'planned'
      }
    })

  } catch (error) {
    console.error('Error getting ingest status:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Start data ingestie
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Alleen admins kunnen data ingestie starten
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { source, type = 'incremental', keyword = '' } = await request.json()

    if (!source) {
      return NextResponse.json({ error: 'Source parameter required' }, { status: 400 })
    }

    // Start ingestie in background
    switch (source) {
      case 'all':
        // Full sync van alle bronnen
        runFullDataSync().catch(error => {
          console.error('Background sync failed:', error)
        })
        break
        
      case 'wettenbank':
        fetchBasiswettenbestand().then(docs => {
          console.log(`Fetched ${docs.length} documents from Wettenbank`)
        }).catch(error => {
          console.error('Wettenbank fetch failed:', error)
        })
        break
        
      case 'rechtspraak':
        fetchRechtspraak(100).then(docs => {
          console.log(`Fetched ${docs.length} documents from Rechtspraak`)
        }).catch(error => {
          console.error('Rechtspraak fetch failed:', error)
        })
        break
        
      case 'koop':
        fetchKOOPDocuments('', 100).then(docs => {
          console.log(`Fetched ${docs.length} documents from KOOP`)
        }).catch(error => {
          console.error('KOOP fetch failed:', error)
        })
        break
        
      case 'tweedekamer':
        fetchTweedeKamer(50).then(docs => {
          console.log(`Fetched documents from Tweede Kamer`)
        }).catch(error => {
          console.error('Tweede Kamer fetch failed:', error)
        })
        break

      case 'belastingdienst':
        fetchBelastingdienst(keyword).then(docs => {
          console.log(`Fetched ${docs.length} documents from Belastingdienst`)
        }).catch(error => {
          console.error('Belastingdienst fetch failed:', error)
        })
        break

      case 'autoriteitpersoonsgegevens':
        fetchAutoriteitPersoonsgegevens(keyword).then(docs => {
          console.log(`Fetched ${docs.length} documents from AP`)
        }).catch(error => {
          console.error('AP fetch failed:', error)
        })
        break

      case 'acm':
        fetchACM(keyword).then(docs => {
          console.log(`Fetched ${docs.length} documents from ACM`)
        }).catch(error => {
          console.error('ACM fetch failed:', error)
        })
        break

      case 'svb':
        fetchSVB(keyword).then(docs => {
          console.log(`Fetched ${docs.length} documents from SVB`)
        }).catch(error => {
          console.error('SVB fetch failed:', error)
        })
        break

      case 'uwv':
        fetchUWV(keyword).then(docs => {
          console.log(`Fetched ${docs.length} documents from UWV`)
        }).catch(error => {
          console.error('UWV fetch failed:', error)
        })
        break

      case 'kadaster':
        fetchKadaster(keyword).then(docs => {
          console.log(`Fetched ${docs.length} documents from Kadaster`)
        }).catch(error => {
          console.error('Kadaster fetch failed:', error)
        })
        break

      case 'politie':
        fetchPolitie(keyword).then(docs => {
          console.log(`Fetched ${docs.length} documents from Politie`)
        }).catch(error => {
          console.error('Politie fetch failed:', error)
        })
        break

      case 'rijksoverheid':
        fetchRijksoverheid(keyword).then(docs => {
          console.log(`Fetched ${docs.length} documents from Rijksoverheid`)
        }).catch(error => {
          console.error('Rijksoverheid fetch failed:', error)
        })
        break

      case 'juridischloket':
        fetchJuridischLoket().then(docs => {
          console.log(`Fetched ${docs.length} documents from Juridisch Loket`)
        }).catch(error => {
          console.error('Juridisch Loket fetch failed:', error)
        })
        break
        
      case 'cvdr':
        fetchCVDR('').then(docs => {
          console.log(`Fetched ${docs.length} documents from CVDR`)
        }).catch(error => {
          console.error('CVDR fetch failed:', error)
        })
        break
        
      case 'dataoverheid':
        fetchDataOverheid('').then(docs => {
          console.log(`Fetched ${docs.length} documents from Data.overheid.nl`)
        }).catch(error => {
          console.error('Data.overheid.nl fetch failed:', error)
        })
        break
        
      case 'openrechtspraak':
        fetchOpenRechtspraak('').then(docs => {
          console.log(`Fetched ${docs.length} documents from OpenRechtspraak`)
        }).catch(error => {
          console.error('OpenRechtspraak fetch failed:', error)
        })
        break
        
      case 'boetebaseom':
        fetchBoetebaseOM('').then(docs => {
          console.log(`Fetched ${docs.length} documents from BoeteBase OM`)
        }).catch(error => {
          console.error('BoeteBase OM fetch failed:', error)
        })
        break
        
      case 'politieopendata':
        fetchPolitieOpenData('').then(docs => {
          console.log(`Fetched ${docs.length} documents from Politie Open Data`)
        }).catch(error => {
          console.error('Politie Open Data fetch failed:', error)
        })
        break
        
      case 'openraadsinformatie':
        fetchOpenRaadsinformatie('').then(docs => {
          console.log(`Fetched ${docs.length} documents from Open Raadsinformatie`)
        }).catch(error => {
          console.error('Open Raadsinformatie fetch failed:', error)
        })
        break
        
      case 'bagapi':
        fetchBAGAPI('').then(docs => {
          console.log(`Fetched ${docs.length} documents from BAG API`)
        }).catch(error => {
          console.error('BAG API fetch failed:', error)
        })
        break
        
      case 'cbsstatline':
        fetchCBSStatLine('').then(docs => {
          console.log(`Fetched ${docs.length} documents from CBS StatLine`)
        }).catch(error => {
          console.error('CBS StatLine fetch failed:', error)
        })
        break
        
      case 'rdwopendata':
        fetchRDWOpenData('').then(docs => {
          console.log(`Fetched ${docs.length} documents from RDW Open Data`)
        }).catch(error => {
          console.error('RDW Open Data fetch failed:', error)
        })
        break
        
      case 'openkvk':
        fetchOpenKVK('').then(docs => {
          console.log(`Fetched ${docs.length} documents from OpenKVK`)
        }).catch(error => {
          console.error('OpenKVK fetch failed:', error)
        })
        break
        
      case 'eurlexwebservice':
        fetchEURLexWebService('').then(docs => {
          console.log(`Fetched ${docs.length} documents from EUR-Lex Web Service`)
        }).catch(error => {
          console.error('EUR-Lex Web Service fetch failed:', error)
        })
        break
        
      default:
        return NextResponse.json({ 
          error: `Onbekende bron: ${source}. Beschikbare bronnen: wettenbank, rechtspraak, koop, cvdr, dataoverheid, openrechtspraak, boetebaseom, politieopendata, openraadsinformatie, bagapi, cbsstatline, rdwopendata, openkvk, eurlexwebservice` 
        }, { status: 400 })
    }

    return NextResponse.json({
      message: `Data ingestie gestart voor ${source}`,
      source,
      type,
      status: 'started'
    })

  } catch (error) {
    console.error('Error starting ingest:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT - Test search functionaliteit
export async function PUT(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
    }

    const results = await searchOfficialSourcesLib(query, 10)

    return NextResponse.json({
      query,
      results: results.length,
      documents: results.map(doc => ({
        id: doc.id,
        titel: doc.titel,
        bron: doc.bron || doc.type,
        uri: doc.uri || doc.ecli,
        datum: doc.datum
      }))
    })

  } catch (error) {
    console.error('Error testing search:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
} 