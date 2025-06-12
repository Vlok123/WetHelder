/**
 * Officiële Juridische Bronnen Integratie
 * 
 * Dit bestand implementeert de integratie met alle Nederlandse officiële juridische bronnen
 * zoals beschreven in het integratiedocument.
 */

import { prisma } from './prisma'

// Types voor verschillende bronnen
export interface WetgevingDocument {
  id: string
  titel: string
  tekst: string
  uri: string
  datum?: Date
  artikelNr?: string
  wetboek?: string
  status: 'ACTIVE' | 'SUPERSEDED' | 'DELETED'
}

export interface JurisprudentieDocument {
  ecli: string
  titel: string
  samenvatting?: string
  volledigeTekst: string
  instantie: string
  datum: Date
  uitspraakType: string
  rechtsgebied: string[]
  trefwoorden: string[]
  wetsartikelen: string[]
}

export interface BoeteDocument {
  feitcode: string
  omschrijving: string
  categorie: string
  bedrag: number
  punten?: number
  wetsartikel?: string
  wetboek?: string
  geldigVan: Date
  geldigTot?: Date
}

// === 1. WETTENBANK (Basiswettenbestand) ===

export async function fetchBasiswettenbestand(): Promise<WetgevingDocument[]> {
  console.log('🏛️ Fetching Basiswettenbestand...')
  
  try {
    // Download het basiswettenbestand
    const response = await fetch('https://wetten.overheid.nl/BWB/Basiswettenbestand.zip')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    // In een echte implementatie zou je hier de ZIP uitpakken en XML parsen
    // Voor nu simuleren we dit met een API call naar de zoekfunctie
    const searchResponse = await fetch('https://wetten.overheid.nl/zoeken?type=wet&format=json&limit=100')
    
    if (!searchResponse.ok) {
      console.warn('Wettenbank API niet beschikbaar, gebruik fallback')
      return []
    }
    
    const data = await searchResponse.json()
    
    return data.results?.map((item: any) => ({
      id: item.identifier || item.uri,
      titel: item.title || item.naam,
      tekst: item.content || item.tekst || '',
      uri: item.uri || item.url,
      datum: item.datum ? new Date(item.datum) : undefined,
      artikelNr: extractArtikelNummer(item.title),
      wetboek: extractWetboek(item.title),
      status: 'ACTIVE' as const
    })) || []
    
  } catch (error) {
    console.error('Error fetching Basiswettenbestand:', error)
    return []
  }
}

// === 2. KOOP ZOEKDIENST (Officiële Bekendmakingen) ===

export async function fetchKOOPDocuments(query: string = '', limit: number = 50): Promise<WetgevingDocument[]> {
  console.log('📰 Fetching KOOP documents...')
  
  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `https://zoek.officielebekendmakingen.nl/zoeken/api?zoekterm=${encodedQuery}&facet=type:Staatsblad&start=0&count=${limit}&format=json`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WetHelder/1.0 (https://wethelder.nl)',
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.warn('KOOP API niet beschikbaar')
      return []
    }
    
    const data = await response.json()
    
    return data.results?.map((item: any) => ({
      id: item.identifier,
      titel: item.title,
      tekst: item.content || '',
      uri: item.uri,
      datum: item.publicatiedatum ? new Date(item.publicatiedatum) : undefined,
      wetboek: extractWetboek(item.title),
      status: 'ACTIVE' as const
    })) || []
    
  } catch (error) {
    console.error('Error fetching KOOP documents:', error)
    return []
  }
}

// === 3. RECHTSPRAAK (ECLI Feed) ===

export async function fetchRechtspraak(limit: number = 100): Promise<JurisprudentieDocument[]> {
  console.log('⚖️ Fetching Rechtspraak...')
  
  try {
    // RSS feed van rechtspraak.nl
    const response = await fetch('https://data.rechtspraak.nl/uitspraken/feed/uitspraken.rss')
    
    if (!response.ok) {
      console.warn('Rechtspraak RSS niet beschikbaar, gebruik API fallback')
      return await fetchRechtspraakAPI(limit)
    }
    
    const rssText = await response.text()
    
    // Parse RSS (in echte implementatie zou je een XML parser gebruiken)
    // Voor nu gebruiken we de API fallback
    return await fetchRechtspraakAPI(limit)
    
  } catch (error) {
    console.error('Error fetching Rechtspraak:', error)
    return []
  }
}

async function fetchRechtspraakAPI(limit: number): Promise<JurisprudentieDocument[]> {
  try {
    const response = await fetch(`https://uitspraken.rechtspraak.nl/api/uitspraken?limit=${limit}&format=json`)
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    
    return data.results?.map((item: any) => ({
      ecli: item.ecli,
      titel: item.titel || item.title,
      samenvatting: item.samenvatting || item.inhoudsindicatie,
      volledigeTekst: item.tekst || item.content || '',
      instantie: item.instantie || extractInstantie(item.ecli),
      datum: new Date(item.datum || item.uitspraakdatum),
      uitspraakType: item.type || 'uitspraak',
      rechtsgebied: item.rechtsgebieden || [],
      trefwoorden: item.trefwoorden || [],
      wetsartikelen: extractWetsartikelen(item.tekst || '')
    })) || []
    
  } catch (error) {
    console.error('Error fetching Rechtspraak API:', error)
    return []
  }
}

// === 4. BOETEBASE ===

export async function fetchBoetebase(): Promise<BoeteDocument[]> {
  console.log('🚔 Fetching Boetebase...')
  
  try {
    // Boetebase heeft geen officiële API, dus we simuleren dit
    // In een echte implementatie zou je de HTML scrapen en naar CSV converteren
    
    // Voor nu retourneren we een lege array
    // TODO: Implementeer HTML scraping van boetebase.om.nl
    console.warn('Boetebase scraping nog niet geïmplementeerd')
    return []
    
  } catch (error) {
    console.error('Error fetching Boetebase:', error)
    return []
  }
}

// === 5. TWEEDE KAMER GRAPHQL ===

export async function fetchTweedeKamer(limit: number = 50): Promise<any[]> {
  console.log('🏛️ Fetching Tweede Kamer data...')
  
  try {
    const query = `
      query {
        vergadering(paging: {limit: ${limit}}) {
          id
          titel
          datum
          documentUrl
          onderwerp
          status
        }
        kamerstuk(paging: {limit: ${limit}}) {
          nummer
          titel
          type
          datum
          tekst
          indieners
          status
        }
      }
    `
    
    const response = await fetch('https://api.tweedekamer.nl/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WetHelder/1.0'
      },
      body: JSON.stringify({ query })
    })
    
    if (!response.ok) {
      console.warn('Tweede Kamer GraphQL niet beschikbaar')
      return []
    }
    
    const data = await response.json()
    return data.data || {}
    
  } catch (error) {
    console.error('Error fetching Tweede Kamer:', error)
    return []
  }
}

// === 6. EUR-LEX ===

export async function fetchEURLex(query: string = ''): Promise<WetgevingDocument[]> {
  console.log('🇪🇺 Fetching EUR-Lex...')
  
  try {
    // EUR-Lex heeft een SOAP API, maar voor nu gebruiken we de REST interface
    const encodedQuery = encodeURIComponent(query)
    const url = `https://eur-lex.europa.eu/search.html?type=quick&text=${encodedQuery}&qid=1&format=json`
    
    // EUR-Lex API is complex, voor nu retourneren we lege array
    // TODO: Implementeer volledige EUR-Lex SOAP/Cellar API integratie
    console.warn('EUR-Lex integratie nog niet volledig geïmplementeerd')
    return []
    
  } catch (error) {
    console.error('Error fetching EUR-Lex:', error)
    return []
  }
}

// === 7. BELASTINGDIENST ===

export async function fetchBelastingdienst(query: string = ''): Promise<WetgevingDocument[]> {
  console.log('💰 Fetching Belastingdienst documents...')
  
  try {
    // Belastingdienst heeft geen publieke API, maar we kunnen de zoek URL gebruiken
    const encodedQuery = encodeURIComponent(query)
    console.log(`Belastingdienst search: https://www.belastingdienst.nl/zoeken?q=${encodedQuery}`)
    
    // Voor nu retourneren we een referentie naar de zoekpagina
    // TODO: Implementeer web scraping van belastingdienst.nl voor relevante informatie
    return []
    
  } catch (error) {
    console.error('Error fetching Belastingdienst:', error)
    return []
  }
}

// === 8. AUTORITEIT PERSOONSGEGEVENS ===

export async function fetchAutoriteitPersoonsgegevens(query: string = ''): Promise<WetgevingDocument[]> {
  console.log('🔒 Fetching Autoriteit Persoonsgegevens documents...')
  
  try {
    // AP heeft geen publieke API, maar wel een uitgebreide kennisbank
    const encodedQuery = encodeURIComponent(query)
    console.log(`AP search: https://autoriteitpersoonsgegevens.nl/zoeken?q=${encodedQuery}`)
    
    // Voor nu retourneren we een referentie naar de zoekpagina
    // TODO: Implementeer web scraping van AP kennisbank
    return []
    
  } catch (error) {
    console.error('Error fetching AP:', error)
    return []
  }
}

// === 9. ACM (AUTORITEIT CONSUMENT & MARKT) ===

export async function fetchACM(query: string = ''): Promise<WetgevingDocument[]> {
  console.log('⚖️ Fetching ACM documents...')
  
  try {
    // ACM heeft geen publieke API voor zoeken
    const encodedQuery = encodeURIComponent(query)
    console.log(`ACM search: https://www.acm.nl/zoeken?q=${encodedQuery}`)
    
    // Voor nu retourneren we een referentie naar de zoekpagina
    // TODO: Implementeer web scraping van ACM beslissingen en publicaties
    return []
    
  } catch (error) {
    console.error('Error fetching ACM:', error)
    return []
  }
}

// === 10. SOCIALE VERZEKERINGSBANK (SVB) ===

export async function fetchSVB(query: string = ''): Promise<WetgevingDocument[]> {
  console.log('👥 Fetching SVB documents...')
  
  try {
    // SVB heeft geen publieke API voor zoeken
    const encodedQuery = encodeURIComponent(query)
    console.log(`SVB search: https://www.svb.nl/zoeken?q=${encodedQuery}`)
    
    // Voor nu retourneren we een referentie naar de zoekpagina
    // TODO: Implementeer web scraping van SVB regelgeving en uitleg
    return []
    
  } catch (error) {
    console.error('Error fetching SVB:', error)
    return []
  }
}

// === 11. UWV (UITVOERINGSINSTITUUT WERKNEMERSVERZEKERINGEN) ===

export async function fetchUWV(query: string = ''): Promise<WetgevingDocument[]> {
  console.log('💼 Fetching UWV documents...')
  
  try {
    // UWV heeft geen publieke API voor zoeken
    const encodedQuery = encodeURIComponent(query)
    console.log(`UWV search: https://www.uwv.nl/zoeken?q=${encodedQuery}`)
    
    // Voor nu retourneren we een referentie naar de zoekpagina
    // TODO: Implementeer web scraping van UWV regelgeving en werkloosheidswetten
    return []
    
  } catch (error) {
    console.error('Error fetching UWV:', error)
    return []
  }
}

// === 12. KADASTER ===

export async function fetchKadaster(query: string = ''): Promise<WetgevingDocument[]> {
  console.log('🏠 Fetching Kadaster documents...')
  
  try {
    // Kadaster heeft geen publieke API voor zoeken in regelgeving
    const encodedQuery = encodeURIComponent(query)
    console.log(`Kadaster search: https://www.kadaster.nl/zoeken?q=${encodedQuery}`)
    
    // Voor nu retourneren we een referentie naar de zoekpagina
    // TODO: Implementeer web scraping van Kadaster wet- en regelgeving
    return []
    
  } catch (error) {
    console.error('Error fetching Kadaster:', error)
    return []
  }
}

// === 13. POLITIE.NL (HANDHAVING) ===

export async function fetchPolitie(query: string = ''): Promise<WetgevingDocument[]> {
  console.log('👮 Fetching Politie.nl documents...')
  
  try {
    // Politie.nl heeft geen publieke API maar wel uitgebreide informatiebank
    const encodedQuery = encodeURIComponent(query)
    console.log(`Politie search: https://www.politie.nl/zoeken?q=${encodedQuery}`)
    
    // Voor nu retourneren we een referentie naar de zoekpagina
    // TODO: Implementeer web scraping van politie.nl procedure-informatie
    return []
    
  } catch (error) {
    console.error('Error fetching Politie:', error)
    return []
  }
}

// === 14. RIJKSOVERHEID.NL (BELEID) ===

export async function fetchRijksoverheid(query: string = ''): Promise<WetgevingDocument[]> {
  console.log('🏛️ Fetching Rijksoverheid.nl documents...')
  
  try {
    // Rijksoverheid heeft wel een zoek-API
    const encodedQuery = encodeURIComponent(query)
    const url = `https://www.rijksoverheid.nl/zoeken?keyword=${encodedQuery}&format=json`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WetHelder/1.0 (https://wethelder.nl)',
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.warn('Rijksoverheid API niet beschikbaar')
      return []
    }
    
    const data = await response.json()
    
    return data.results?.map((item: any) => ({
      id: item.id || item.url,
      titel: item.title || item.naam,
      tekst: item.content || item.samenvatting || '',
      uri: item.url,
      datum: item.datum ? new Date(item.datum) : undefined,
      wetboek: 'Beleid',
      status: 'ACTIVE' as const
    })) || []
    
  } catch (error) {
    console.error('Error fetching Rijksoverheid:', error)
    return []
  }
}

// === UTILITY FUNCTIES ===

function extractArtikelNummer(titel: string): string | undefined {
  const match = titel.match(/artikel\s+(\d+[a-z]?)/i)
  return match ? match[1] : undefined
}

function extractWetboek(titel: string): string | undefined {
  const wetboeken = {
    'strafrecht': 'Sr',
    'burgerlijk wetboek': 'BW',
    'wegenverkeerswet': 'WVW',
    'reglement verkeersregels': 'RVV',
    'algemene wet bestuursrecht': 'AWB',
    'grondwet': 'Gw'
  }
  
  for (const [naam, code] of Object.entries(wetboeken)) {
    if (titel.toLowerCase().includes(naam)) {
      return code
    }
  }
  
  return undefined
}

function extractInstantie(ecli: string): string {
  // ECLI format: ECLI:NL:HR:2023:123
  const parts = ecli.split(':')
  if (parts.length >= 3) {
    return parts[2] // HR, GHAMS, RBAMS, etc.
  }
  return 'Onbekend'
}

function extractWetsartikelen(tekst: string): string[] {
  const artikelen: string[] = []
  const regex = /artikel\s+(\d+[a-z]?)\s+([A-Z][a-z]*)/gi
  let match
  
  while ((match = regex.exec(tekst)) !== null) {
    artikelen.push(`${match[1]} ${match[2]}`)
  }
  
  return [...new Set(artikelen)] // Remove duplicates
}

// === EMBEDDINGS GENERATIE ===

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key niet beschikbaar voor embeddings')
      return []
    }
    
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.substring(0, 8000) // Limit text length
      })
    })
    
    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status}`)
    }
    
    const data = await response.json()
    return data.data[0]?.embedding || []
    
  } catch (error) {
    console.error('Error generating embedding:', error)
    return []
  }
}

// === DATABASE OPERATIES ===

export async function saveDocumentToDatabase(doc: WetgevingDocument): Promise<void> {
  try {
    const embedding = await generateEmbedding(`${doc.titel} ${doc.tekst}`)
    
    await prisma.legalDocument.upsert({
      where: { uri: doc.uri },
      update: {
        titel: doc.titel,
        tekst: doc.tekst,
        datum: doc.datum,
        artikelNr: doc.artikelNr,
        wetboek: doc.wetboek,
        status: doc.status,
        embedding: JSON.stringify(embedding),
        lastFetched: new Date()
      },
      create: {
        bron: 'wettenbank',
        type: 'wet',
        titel: doc.titel,
        tekst: doc.tekst,
        uri: doc.uri,
        datum: doc.datum,
        artikelNr: doc.artikelNr,
        wetboek: doc.wetboek,
        status: doc.status,
        embedding: JSON.stringify(embedding)
      }
    })
  } catch (error) {
    console.error('Error saving document to database:', error)
  }
}

export async function saveJurisprudentieToDatabase(doc: JurisprudentieDocument): Promise<void> {
  try {
    const embedding = await generateEmbedding(`${doc.titel} ${doc.samenvatting || ''} ${doc.volledigeTekst}`)
    
    await prisma.jurisprudentie.upsert({
      where: { ecli: doc.ecli },
      update: {
        titel: doc.titel,
        samenvatting: doc.samenvatting,
        volledigeTekst: doc.volledigeTekst,
        instantie: doc.instantie,
        datum: doc.datum,
        uitspraakType: doc.uitspraakType,
        rechtsgebied: doc.rechtsgebied,
        trefwoorden: doc.trefwoorden,
        wetsartikelen: doc.wetsartikelen,
        embedding: JSON.stringify(embedding)
      },
      create: {
        ecli: doc.ecli,
        titel: doc.titel,
        samenvatting: doc.samenvatting,
        volledigeTekst: doc.volledigeTekst,
        instantie: doc.instantie,
        datum: doc.datum,
        uitspraakType: doc.uitspraakType,
        rechtsgebied: doc.rechtsgebied,
        trefwoorden: doc.trefwoorden,
        wetsartikelen: doc.wetsartikelen,
        embedding: JSON.stringify(embedding)
      }
    })
  } catch (error) {
    console.error('Error saving jurisprudentie to database:', error)
  }
}

// === SEMANTIC SEARCH ===

export async function searchOfficialSources(query: string, limit: number = 5): Promise<any[]> {
  try {
    // Voor nu gebruiken we full-text search, later vector similarity
    const documents = await prisma.legalDocument.findMany({
      where: {
        OR: [
          { titel: { contains: query, mode: 'insensitive' } },
          { tekst: { contains: query, mode: 'insensitive' } }
        ],
        status: 'ACTIVE'
      },
      take: limit,
      orderBy: { datum: 'desc' }
    })
    
    const jurisprudentie = await prisma.jurisprudentie.findMany({
      where: {
        OR: [
          { titel: { contains: query, mode: 'insensitive' } },
          { samenvatting: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit,
      orderBy: { datum: 'desc' }
    })
    
    return [
      ...documents.map(doc => ({ ...doc, type: 'wetgeving' })),
      ...jurisprudentie.map(doc => ({ ...doc, type: 'jurisprudentie' }))
    ]
    
  } catch (error) {
    console.error('Error searching official sources:', error)
    return []
  }
}

// === BULK IMPORT FUNCTIES ===

export async function runFullDataSync(): Promise<void> {
  console.log('🔄 Starting full data sync...')
  
  const logEntry = await prisma.dataIngestLog.create({
    data: {
      bron: 'all',
      type: 'full_sync',
      status: 'running'
    }
  })
  
  try {
    let totalProcessed = 0
    let totalAdded = 0
    
    // 1. Wettenbank
    console.log('📚 Syncing Wettenbank...')
    const wetgeving = await fetchBasiswettenbestand()
    for (const doc of wetgeving) {
      await saveDocumentToDatabase(doc)
      totalProcessed++
      totalAdded++
    }
    
    // 2. Rechtspraak
    console.log('⚖️ Syncing Rechtspraak...')
    const rechtspraak = await fetchRechtspraak(100)
    for (const doc of rechtspraak) {
      await saveJurisprudentieToDatabase(doc)
      totalProcessed++
      totalAdded++
    }
    
    // 3. KOOP
    console.log('📰 Syncing KOOP...')
    const koop = await fetchKOOPDocuments('', 100)
    for (const doc of koop) {
      await saveDocumentToDatabase(doc)
      totalProcessed++
      totalAdded++
    }
    
    // Update log
    await prisma.dataIngestLog.update({
      where: { id: logEntry.id },
      data: {
        status: 'completed',
        documentsProcessed: totalProcessed,
        documentsAdded: totalAdded,
        completedAt: new Date(),
        duration: Math.floor((Date.now() - logEntry.startedAt.getTime()) / 1000)
      }
    })
    
    console.log(`✅ Full sync completed: ${totalProcessed} documents processed, ${totalAdded} added`)
    
  } catch (error) {
    console.error('❌ Full sync failed:', error)
    
    await prisma.dataIngestLog.update({
      where: { id: logEntry.id },
      data: {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      }
    })
  }
} 