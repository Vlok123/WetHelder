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

// === 15. JURIDISCH LOKET (JURIDISCHE HULP) ===

export async function fetchJuridischLoket(query: string = ''): Promise<WetgevingDocument[]> {
  console.log('⚖️ Fetching Juridisch Loket documents...')
  
  try {
    // Juridisch Loket heeft geen publieke API, maar we kunnen de inhoud structureel benaderen
    // We implementeren een gestructureerde benadering van hun informatie
    const encodedQuery = encodeURIComponent(query)
    
    // Juridisch Loket structuur mapping
    const juridischLoketTopics = getJuridischLoketTopics(query)
    
    const documents: WetgevingDocument[] = []
    
    // Voor elke relevante topic, maak een referentie naar Juridisch Loket
    for (const topic of juridischLoketTopics) {
      documents.push({
        id: `juridischloket-${topic.id}`,
        titel: `Juridisch Loket: ${topic.titel}`,
        tekst: `${topic.beschrijving} Voor uitgebreide informatie en praktische stappen: ${topic.url}`,
        uri: topic.url,
        datum: new Date(),
        wetboek: 'Juridische Hulp',
        status: 'ACTIVE' as const
      })
    }
    
    // Algemene verwijzing naar zoekfunctie van Juridisch Loket
    if (query && documents.length === 0) {
      documents.push({
        id: `juridischloket-search-${Date.now()}`,
        titel: `Juridisch Loket: Informatie over ${query}`,
        tekst: `Voor praktische juridische informatie en stap-voor-stap uitleg over ${query}, inclusief kostenloze rechtshulp en doorverwijzing naar rechtsbijstand. Het Juridisch Loket biedt gratis juridisch advies voor burgers met lagere inkomens.`,
        uri: `https://www.juridischloket.nl/zoeken/?q=${encodedQuery}`,
        datum: new Date(),
        wetboek: 'Juridische Hulp',
        status: 'ACTIVE' as const
      })
    }
    
    return documents
    
  } catch (error) {
    console.error('Error fetching Juridisch Loket:', error)
    return []
  }
}

// === 16. KOOP SRU - CVDR (DECENTRALE REGELGEVING) ===

export async function fetchCVDR(query: string = '', limit: number = 50): Promise<WetgevingDocument[]> {
  console.log('🏛️ Fetching CVDR (gemeentelijke/provinciale verordeningen)...')
  
  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `https://zoekservice.overheid.nl/sru/Search?version=1.2&operation=searchRetrieve&x-connection=CVDR&query=title=${encodedQuery}&startRecord=1&maximumRecords=${limit}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WetHelder/1.0 (https://wethelder.nl)',
        'Accept': 'application/xml'
      }
    })
    
    if (!response.ok) {
      console.warn('CVDR SRU API niet beschikbaar')
      return []
    }
    
    const xmlData = await response.text()
    
    // Voor nu retourneren we een placeholder - in productie zou je XML parsen
    // TODO: Implementeer XML parsing voor CVDR SRU response
    console.log('CVDR XML response ontvangen, parsing required')
    
    return [{
      id: `cvdr-search-${Date.now()}`,
      titel: `CVDR: Decentrale regelgeving voor "${query}"`,
      tekst: `Gemeentelijke en provinciale verordeningen. Voor volledige resultaten zie: https://lokaleregelgeving.overheid.nl/zoeken?q=${encodedQuery}`,
      uri: `https://lokaleregelgeving.overheid.nl/zoeken?q=${encodedQuery}`,
      datum: new Date(),
      wetboek: 'Decentrale Regelgeving',
      status: 'ACTIVE' as const
    }]
    
  } catch (error) {
    console.error('Error fetching CVDR:', error)
    return []
  }
}

// === 17. DATA.OVERHEID.NL CKAN API ===

export async function fetchDataOverheid(query: string = '', limit: number = 10): Promise<WetgevingDocument[]> {
  console.log('📊 Fetching Data.overheid.nl datasets...')
  
  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `https://data.overheid.nl/data/api/3/action/package_search?q=${encodedQuery}&rows=${limit}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WetHelder/1.0 (https://wethelder.nl)',
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.warn('Data.overheid.nl API niet beschikbaar')
      return []
    }
    
    const data = await response.json()
    
    if (!data.success || !data.result?.results) {
      return []
    }
    
    return data.result.results.map((dataset: any) => ({
      id: dataset.id,
      titel: `Dataset: ${dataset.title}`,
      tekst: `${dataset.notes || 'Geen beschrijving'} Organisatie: ${dataset.organization?.title || 'Onbekend'}. Tags: ${dataset.tags?.map((t: any) => t.display_name).join(', ') || 'Geen tags'}`,
      uri: `https://data.overheid.nl/data/dataset/${dataset.name}`,
      datum: dataset.metadata_created ? new Date(dataset.metadata_created) : new Date(),
      wetboek: 'Open Data',
      status: 'ACTIVE' as const
    }))
    
  } catch (error) {
    console.error('Error fetching Data.overheid.nl:', error)
    return []
  }
}

// === 18. OPENRECHTSPRAAK.NL API ===

export async function fetchOpenRechtspraak(query: string = '', limit: number = 20): Promise<JurisprudentieDocument[]> {
  console.log('⚖️ Fetching OpenRechtspraak.nl...')
  
  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `https://openrechtspraak.nl/api/v1/uitspraken?q=${encodedQuery}&size=${limit}&format=json`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WetHelder/1.0 (https://wethelder.nl)',
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.warn('OpenRechtspraak.nl API niet beschikbaar')
      return []
    }
    
    const data = await response.json()
    
    if (!data.results) {
      return []
    }
    
    return data.results.map((item: any) => ({
      ecli: item.ecli,
      titel: item.titel || `Uitspraak ${item.ecli}`,
      samenvatting: item.samenvatting || item.inhoudsindicatie || '',
      volledigeTekst: item.tekst || '',
      instantie: item.instantie || extractInstantie(item.ecli),
      datum: new Date(item.datum || item.uitspraakdatum || Date.now()),
      uitspraakType: item.type || 'uitspraak',
      rechtsgebied: item.rechtsgebieden || [],
      trefwoorden: item.trefwoorden || [],
      wetsartikelen: extractWetsartikelen(item.tekst || '')
    }))
    
  } catch (error) {
    console.error('Error fetching OpenRechtspraak.nl:', error)
    return []
  }
}

// === 19. BOETEBASE OM (ENHANCED) ===

export async function fetchBoetebaseOM(query: string = ''): Promise<BoeteDocument[]> {
  console.log('🚔 Fetching BoeteBase OM...')
  
  try {
    // BoeteBase heeft geen API, maar we kunnen de zoek-URL genereren
    const encodedQuery = encodeURIComponent(query)
    const baseUrl = 'https://boetebase.om.nl'
    
    // Voor nu genereren we een referentie naar de zoekpagina
    // TODO: Implementeer web scraping voor feitcodes en bedragen
    console.log(`BoeteBase search URL: ${baseUrl}?q=${encodedQuery}`)
    
    // Placeholder implementatie - in productie zou je HTML scrapen
    const placeholderDocs: BoeteDocument[] = []
    
    if (query.toLowerCase().includes('snelheid') || query.toLowerCase().includes('te hard')) {
      placeholderDocs.push({
        feitcode: 'R001',
        omschrijving: 'Te hard rijden - zie BoeteBase voor exacte bedragen',
        categorie: 'Verkeer',
        bedrag: 0, // Variabel
        wetsartikel: 'Artikel 20 RVV 1990',
        wetboek: 'Reglement Verkeersregels en Verkeerstekens',
        geldigVan: new Date('2024-01-01')
      })
    }
    
    return placeholderDocs
    
  } catch (error) {
    console.error('Error fetching BoeteBase OM:', error)
    return []
  }
}

// === 20. POLITIE OPEN DATA API ===

export async function fetchPolitieOpenData(query: string = '', limit: number = 10): Promise<WetgevingDocument[]> {
  console.log('👮 Fetching Politie Open Data...')
  
  try {
    // Politie heeft verschillende datasets beschikbaar
    const datasets = [
      'vermiste-personen',
      'gezochte-personen', 
      'wijkagenten',
      'politiebureaus'
    ]
    
    const results: WetgevingDocument[] = []
    
    for (const dataset of datasets.slice(0, 2)) { // Limiteer tot 2 datasets
      try {
        const url = `https://data.politie.nl/api/${dataset}?limit=${Math.floor(limit/2)}`
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'WetHelder/1.0 (https://wethelder.nl)',
            'Accept': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.results) {
            results.push({
              id: `politie-${dataset}-${Date.now()}`,
              titel: `Politie Data: ${dataset.replace('-', ' ')}`,
              tekst: `Actuele ${dataset.replace('-', ' ')} informatie van de Nederlandse Politie. Aantal resultaten: ${data.results.length}`,
              uri: `https://data.politie.nl/${dataset}`,
              datum: new Date(),
              wetboek: 'Politie Informatie',
              status: 'ACTIVE' as const
            })
          }
        }
      } catch (error) {
        console.error(`Error fetching politie dataset ${dataset}:`, error)
      }
    }
    
    return results
    
  } catch (error) {
    console.error('Error fetching Politie Open Data:', error)
    return []
  }
}

// === 21. OPEN RAADSINFORMATIE ===

export async function fetchOpenRaadsinformatie(query: string = '', gemeente: string = 'amsterdam'): Promise<WetgevingDocument[]> {
  console.log('🏛️ Fetching Open Raadsinformatie...')
  
  try {
    const encodedQuery = encodeURIComponent(query)
    const url = `https://${gemeente}.raadsinformatie.nl/api/v2/events?search=${encodedQuery}&limit=10`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WetHelder/1.0 (https://wethelder.nl)',
        'Accept': 'application/hal+json'
      }
    })
    
    if (!response.ok) {
      console.warn(`Open Raadsinformatie API niet beschikbaar voor ${gemeente}`)
      return []
    }
    
    const data = await response.json()
    
    if (!data._embedded?.events) {
      return []
    }
    
    return data._embedded.events.map((event: any, index: number) => ({
      id: `raad-${gemeente}-${event.id || index}`,
      titel: `${gemeente}: ${event.name || 'Raadsstuk'}`,
      tekst: `${event.description || 'Geen beschrijving'} Datum: ${event.start_date || 'Onbekend'}`,
      uri: event._links?.self?.href || `https://${gemeente}.raadsinformatie.nl`,
      datum: event.start_date ? new Date(event.start_date) : new Date(),
      wetboek: 'Gemeentelijke Besluitvorming',
      status: 'ACTIVE' as const
    }))
    
  } catch (error) {
    console.error('Error fetching Open Raadsinformatie:', error)
    return []
  }
}

// === 22. BAG API V2 (KADASTER) ===

export async function fetchBAGAPI(query: string = ''): Promise<WetgevingDocument[]> {
  console.log('🏠 Fetching BAG API v2...')
  
  try {
    // BAG API vereist een API key, voor demo purposes gebruiken we de openbare endpoints
    const encodedQuery = encodeURIComponent(query)
    
    // Voor nu retourneren we een referentie naar de BAG API
    return [{
      id: `bag-api-${Date.now()}`,
      titel: 'BAG API v2: Basisregistratie Adressen en Gebouwen',
      tekst: `Voor adres- en gebouwinformatie gerelateerd aan "${query}". De BAG bevat alle officieel geregistreerde adressen en gebouwen in Nederland.`,
      uri: `https://api.bag.v2.kadaster.nl/lvbag/individuelebevragingen/v2/adressen?zoekterm=${encodedQuery}`,
      datum: new Date(),
      wetboek: 'Basisregistraties',
      status: 'ACTIVE' as const
    }]
    
  } catch (error) {
    console.error('Error fetching BAG API:', error)
    return []
  }
}

// === 23. CBS STATLINE ODATA ===

export async function fetchCBSStatLine(query: string = ''): Promise<WetgevingDocument[]> {
  console.log('📊 Fetching CBS StatLine...')
  
  try {
    // CBS StatLine heeft een OData interface
    const url = 'https://opendata.cbs.nl/ODataApi/odata/84287NED/$metadata'
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WetHelder/1.0 (https://wethelder.nl)',
        'Accept': 'application/xml'
      }
    })
    
    if (!response.ok) {
      console.warn('CBS StatLine API niet beschikbaar')
      return []
    }
    
    // Voor nu retourneren we een referentie naar CBS Open Data
    return [{
      id: `cbs-statline-${Date.now()}`,
      titel: 'CBS StatLine: Statistische gegevens',
      tekst: `Officiële Nederlandse statistieken gerelateerd aan "${query}". Inclusief demografische gegevens, criminaliteitsstatistieken en maatschappelijke indicatoren.`,
      uri: `https://opendata.cbs.nl/statline/#/CBS/nl/navigatieScherm/zoeken?searchKeywords=${encodeURIComponent(query)}`,
      datum: new Date(),
      wetboek: 'Statistische Gegevens',
      status: 'ACTIVE' as const
    }]
    
  } catch (error) {
    console.error('Error fetching CBS StatLine:', error)
    return []
  }
}

// === 24. RDW OPEN DATA ===

export async function fetchRDWOpenData(query: string = ''): Promise<WetgevingDocument[]> {
  console.log('🚗 Fetching RDW Open Data...')
  
  try {
    // RDW heeft verschillende datasets via Socrata
    const datasets = [
      'gekentekende-voertuigen',
      'geregistreerde-voertuigen'
    ]
    
    const results: WetgevingDocument[] = []
    
    for (const dataset of datasets.slice(0, 1)) { // Limiteer tot 1 dataset
      try {
        const url = `https://opendata.rdw.nl/resource/${dataset.replace('-', '_')}.json?$limit=5`
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'WetHelder/1.0 (https://wethelder.nl)',
            'Accept': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          
          results.push({
            id: `rdw-${dataset}-${Date.now()}`,
            titel: `RDW Open Data: ${dataset.replace('-', ' ')}`,
            tekst: `Voertuig- en kentekengegevens uit de RDW database. Voor uitgebreide voertuiggegevens en kentekeninformatie.`,
            uri: `https://opendata.rdw.nl/browse?q=${encodeURIComponent(query)}`,
            datum: new Date(),
            wetboek: 'Voertuigregistratie',
            status: 'ACTIVE' as const
          })
        }
      } catch (error) {
        console.error(`Error fetching RDW dataset ${dataset}:`, error)
      }
    }
    
    return results
    
  } catch (error) {
    console.error('Error fetching RDW Open Data:', error)
    return []
  }
}

// === 25. OPENKVK API ===

export async function fetchOpenKVK(query: string = ''): Promise<WetgevingDocument[]> {
  console.log('🏢 Fetching OpenKVK...')
  
  try {
    // OpenKVK vereist een API key - voor demo purposes gebruiken we een referentie
    const encodedQuery = encodeURIComponent(query)
    
    return [{
      id: `openkvk-${Date.now()}`,
      titel: 'OpenKVK: Bedrijfsgegevens Kamer van Koophandel',
      tekst: `Basis bedrijfsinformatie en SBI-codes voor "${query}". Voor volledige bedrijfsgegevens uit de KvK registratie.`,
      uri: `https://api.overheid.io/openkvk?q=${encodedQuery}`,
      datum: new Date(),
      wetboek: 'Bedrijfsregistratie',
      status: 'ACTIVE' as const
    }]
    
  } catch (error) {
    console.error('Error fetching OpenKVK:', error)
    return []
  }
}

// === 26. EUR-LEX WEB SERVICE (ENHANCED) ===

export async function fetchEURLexWebService(query: string = ''): Promise<WetgevingDocument[]> {
  console.log('🇪🇺 Fetching EUR-Lex Web Service...')
  
  try {
    // EUR-Lex Web Service vereist registratie, voor nu gebruiken we de publieke interface
    const encodedQuery = encodeURIComponent(query)
    const url = `https://eur-lex.europa.eu/search.html?qid=1&text=${encodedQuery}&scope=EURLEX&type=quick&lang=nl`
    
    return [{
      id: `eurlex-webservice-${Date.now()}`,
      titel: 'EUR-Lex: Europese wetgeving',
      tekst: `Europese richtlijnen, verordeningen en arresten gerelateerd aan "${query}". Voor volledige EU-wetgeving en jurisprudentie van het Europees Hof van Justitie.`,
      uri: url,
      datum: new Date(),
      wetboek: 'Europese Wetgeving',
      status: 'ACTIVE' as const
    }]
    
  } catch (error) {
    console.error('Error fetching EUR-Lex Web Service:', error)
    return []
  }
}

// Helper functie voor Juridisch Loket topic mapping
function getJuridischLoketTopics(query: string): Array<{id: string, titel: string, beschrijving: string, url: string}> {
  const lowerQuery = query.toLowerCase()
  const topics: Array<{id: string, titel: string, beschrijving: string, url: string}> = []
  
  // Scheiding en echtscheiding
  if (lowerQuery.includes('scheiding') || lowerQuery.includes('echtscheiding') || lowerQuery.includes('alimentatie')) {
    topics.push({
      id: 'scheiding',
      titel: 'Scheiding en Echtscheiding',
      beschrijving: 'Praktische informatie over scheidingsprocedure, alimentatie, verdeling vermogen, omgangsregeling kinderen, en juridische stappen.',
      url: 'https://www.juridischloket.nl/familie-en-relaties/scheiding/'
    })
  }
  
  // Arbeidsrecht
  if (lowerQuery.includes('ontslag') || lowerQuery.includes('werk') || lowerQuery.includes('arbeidsrecht') || lowerQuery.includes('werkgever')) {
    topics.push({
      id: 'arbeidsrecht',
      titel: 'Arbeidsrecht en Ontslag',
      beschrijving: 'Informatie over ontslagrecht, arbeidscontracten, loon, werktijden, discriminatie op werk, en rechten van werknemers.',
      url: 'https://www.juridischloket.nl/werk-en-inkomen/'
    })
  }
  
  // Huurrecht
  if (lowerQuery.includes('huur') || lowerQuery.includes('verhuurder') || lowerQuery.includes('woning') || lowerQuery.includes('huurverhoging')) {
    topics.push({
      id: 'huurrecht',
      titel: 'Huurrecht en Wonen',
      beschrijving: 'Praktische hulp bij huurproblemen, huurverhoging, onderhoud, opzegging huurcontract, en geschillen met verhuurders.',
      url: 'https://www.juridischloket.nl/wonen-en-buren/'
    })
  }
  
  // Schulden en incasso
  if (lowerQuery.includes('schuld') || lowerQuery.includes('incasso') || lowerQuery.includes('deurwaarder') || lowerQuery.includes('beslag')) {
    topics.push({
      id: 'schulden',
      titel: 'Schulden en Incasso',
      beschrijving: 'Hulp bij schuldenproblematiek, betalingsregelingen, deurwaarders, beslag, en schuldsanering.',
      url: 'https://www.juridischloket.nl/geld-en-schulden/'
    })
  }
  
  // Consumentenrecht
  if (lowerQuery.includes('consument') || lowerQuery.includes('koop') || lowerQuery.includes('garantie') || lowerQuery.includes('herroeping')) {
    topics.push({
      id: 'consumentenrecht',
      titel: 'Consumentenrecht',
      beschrijving: 'Informatie over koopovereenkomsten, garantierechten, herroepingsrecht, online aankopen, en geschillen met bedrijven.',
      url: 'https://www.juridischloket.nl/consumenten/'
    })
  }
  
  // Letselschade
  if (lowerQuery.includes('letsel') || lowerQuery.includes('schade') || lowerQuery.includes('ongeval') || lowerQuery.includes('schadevergoeding')) {
    topics.push({
      id: 'letselschade',
      titel: 'Letselschade en Schadevergoeding',
      beschrijving: 'Praktische stappen bij letselschade, schadevergoeding, medische kosten, en aansprakelijkheid na ongevallen.',
      url: 'https://www.juridischloket.nl/letsel-en-schade/'
    })
  }
  
  // Erfrecht
  if (lowerQuery.includes('erfenis') || lowerQuery.includes('testament') || lowerQuery.includes('nalatenschap') || lowerQuery.includes('overlijden')) {
    topics.push({
      id: 'erfrecht',
      titel: 'Erfrecht en Testament',
      beschrijving: 'Informatie over erfenissen, testamenten, verdeling nalatenschap, en juridische procedures na overlijden.',
      url: 'https://www.juridischloket.nl/familie-en-relaties/overlijden/'
    })
  }
  
  // Burenrecht
  if (lowerQuery.includes('buren') || lowerQuery.includes('overlast') || lowerQuery.includes('geluidsoverlast') || lowerQuery.includes('buurman')) {
    topics.push({
      id: 'burenrecht',
      titel: 'Burenrecht en Overlast',
      beschrijving: 'Praktische hulp bij burenruzies, geluidsoverlast, erfafscheiding, en andere geschillen met buren.',
      url: 'https://www.juridischloket.nl/wonen-en-buren/overlast/'
    })
  }
  
  // Verkeer en vervoer
  if (lowerQuery.includes('verkeersboete') || lowerQuery.includes('rijbewijs') || lowerQuery.includes('verkeersongeval')) {
    topics.push({
      id: 'verkeer',
      titel: 'Verkeer en Vervoer',
      beschrijving: 'Informatie over verkeersboetes, bezwaar tegen boetes, rijbewijskwesties, en procedures bij verkeersovertredingen.',
      url: 'https://www.juridischloket.nl/verkeer/'
    })
  }
  
  // Rechtsbijstand en rechtshulp
  if (lowerQuery.includes('rechtsbijstand') || lowerQuery.includes('advocaat') || lowerQuery.includes('rechtshulp') || lowerQuery.includes('toevoeging')) {
    topics.push({
      id: 'rechtsbijstand',
      titel: 'Rechtsbijstand en Rechtshulp',
      beschrijving: 'Informatie over gratis rechtshulp, toevoeging, rechtsbijstandverzekering, en wanneer u recht heeft op kostenloze juridische bijstand.',
      url: 'https://www.juridischloket.nl/juridische-hulp/'
    })
  }
  
  return topics
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
        rechtsgebied: JSON.stringify(doc.rechtsgebied),
        trefwoorden: JSON.stringify(doc.trefwoorden),
        wetsartikelen: JSON.stringify(doc.wetsartikelen),
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
        rechtsgebied: JSON.stringify(doc.rechtsgebied),
        trefwoorden: JSON.stringify(doc.trefwoorden),
        wetsartikelen: JSON.stringify(doc.wetsartikelen),
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
    
    // 4. Juridisch Loket
    console.log('⚖️ Syncing Juridisch Loket...')
    const juridischLoket = await fetchJuridischLoket('')
    for (const doc of juridischLoket) {
      await saveDocumentToDatabase(doc)
      totalProcessed++
      totalAdded++
    }
    
    // 5. CVDR
    console.log('🏛️ Syncing CVDR...')
    const cvdr = await fetchCVDR('')
    for (const doc of cvdr) {
      await saveDocumentToDatabase(doc)
      totalProcessed++
      totalAdded++
    }
    
    // 6. Data.overheid.nl
    console.log('📊 Syncing Data.overheid.nl...')
    const dataOverheid = await fetchDataOverheid('')
    for (const doc of dataOverheid) {
      await saveDocumentToDatabase(doc)
      totalProcessed++
      totalAdded++
    }
    
    // 7. OpenRechtspraak.nl
    console.log('⚖️ Syncing OpenRechtspraak.nl...')
    const openRechtspraak = await fetchOpenRechtspraak('')
    for (const doc of openRechtspraak) {
      await saveJurisprudentieToDatabase(doc)
      totalProcessed++
      totalAdded++
    }
    
    // 8. BAG API
    console.log('🏠 Syncing BAG API...')
    const bagAPI = await fetchBAGAPI('')
    for (const doc of bagAPI) {
      await saveDocumentToDatabase(doc)
      totalProcessed++
      totalAdded++
    }
    
    // 9. CBS StatLine
    console.log('📊 Syncing CBS StatLine...')
    const cbsStatLine = await fetchCBSStatLine('')
    for (const doc of cbsStatLine) {
      await saveDocumentToDatabase(doc)
      totalProcessed++
      totalAdded++
    }
    
    // 10. RDW Open Data
    console.log('🚗 Syncing RDW Open Data...')
    const rdwOpenData = await fetchRDWOpenData('')
    for (const doc of rdwOpenData) {
      await saveDocumentToDatabase(doc)
      totalProcessed++
      totalAdded++
    }
    
    // 11. OpenKVK
    console.log('🏢 Syncing OpenKVK...')
    const openKVK = await fetchOpenKVK('')
    for (const doc of openKVK) {
      await saveDocumentToDatabase(doc)
      totalProcessed++
      totalAdded++
    }
    
    // 12. EUR-Lex Web Service
    console.log('🇪🇺 Syncing EUR-Lex Web Service...')
    const eurLexWS = await fetchEURLexWebService('')
    for (const doc of eurLexWS) {
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

// === JURIDISCHE FOUT-CORRECTIE DATABASE ===

export interface LegalCorrection {
  incorrectTerm: string
  correctTerm: string
  explanation: string
  sourceArticle: string
}

export const COMMON_LEGAL_MISTAKES: LegalCorrection[] = [
  {
    incorrectTerm: 'WED artikel 18 bevoegdheden',
    correctTerm: 'WED artikel 23 bevoegdheden',
    explanation: 'Artikel 23 WED regelt de bevoegdheden van opsporingsambtenaren, niet artikel 18',
    sourceArticle: 'Artikel 23 Wet op de economische delicten'
  },
  {
    incorrectTerm: 'WED betekent Wet Explosieven Delicten',
    correctTerm: 'WED betekent Wet op de Economische Delicten',
    explanation: 'WED staat voor Wet op de Economische Delicten, niet Wet Explosieven Delicten',
    sourceArticle: 'Wet van 22 juni 1950, Stb. K 258'
  },
  {
    incorrectTerm: 'verkeersovertredingen vallen onder WED',
    correctTerm: 'verkeersovertredingen vallen onder WVW 1994',
    explanation: 'Verkeersovertredingen worden geregeld door de Wegenverkeerswet 1994, niet de WED',
    sourceArticle: 'Wegenverkeerswet 1994'
  },
  {
    incorrectTerm: 'drugs vallen onder WED',
    correctTerm: 'drugs vallen onder Opiumwet',
    explanation: 'Verdovende middelen worden geregeld door de Opiumwet, niet de WED',
    sourceArticle: 'Opiumwet'
  },
  {
    incorrectTerm: 'lachgas is niet strafbaar',
    correctTerm: 'lachgas valt onder de Opiumwet sinds 1 januari 2023',
    explanation: 'Lachgas (N2O) is per 1 januari 2023 toegevoegd aan lijst II van de Opiumwet en is dus strafbaar',
    sourceArticle: 'Opiumwet artikel 2 en 3, Besluit van 9 december 2022, Stb. 2022, 564'
  },
  {
    incorrectTerm: 'lachgas vervoer is toegestaan',
    correctTerm: 'lachgas vervoer is strafbaar onder de Opiumwet',
    explanation: 'Het vervoeren van lachgas voor menselijke consumptie is strafbaar sinds 1 januari 2023',
    sourceArticle: 'Opiumwet artikel 2 lid 1 en artikel 10'
  },
  {
    incorrectTerm: 'lachgas verkoop is legaal',
    correctTerm: 'lachgas verkoop voor menselijke consumptie is verboden',
    explanation: 'De verkoop van lachgas voor menselijke consumptie is verboden sinds 1 januari 2023',
    sourceArticle: 'Opiumwet artikel 2 lid 1 en artikel 10'
  },
  {
    incorrectTerm: 'N2O is vrij verkrijgbaar',
    correctTerm: 'N2O (lachgas) valt onder de Opiumwet',
    explanation: 'Distikstofmonoxide (N2O/lachgas) staat sinds 1 januari 2023 op lijst II van de Opiumwet',
    sourceArticle: 'Opiumwet bijlage II, gewijzigd bij Besluit van 9 december 2022'
  },
  {
    incorrectTerm: 'artikel160',
    correctTerm: 'artikel 160',
    explanation: 'Voeg altijd een spatie toe tussen "artikel" en het nummer',
    sourceArticle: 'Algemene schrijfregels juridische teksten'
  }
]

export function detectAndCorrectLegalMistakes(text: string): string {
  let correctedText = text
  
  // Doorloop alle bekende fouten en corrigeer ze
  COMMON_LEGAL_MISTAKES.forEach(mistake => {
    const regex = new RegExp(mistake.incorrectTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    correctedText = correctedText.replace(regex, mistake.correctTerm)
  })
  
  // Extra tekstcorrecties voor veelvoorkomende fouten
  
  // Datum formatting
  correctedText = correctedText.replace(/\bper(\d+)(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)(\d{4})\b/gi, 'per $1 $2 $3')
  correctedText = correctedText.replace(/\b(\d+)(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)(\d{4})\b/gi, '$1 $2 $3')
  correctedText = correctedText.replace(/\bvan(\d+)(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)(\d{4})\b/gi, 'van $1 $2 $3')
  correctedText = correctedText.replace(/\btot(\d+)(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)(\d{4})\b/gi, 'tot $1 $2 $3')
  
  // Artikel nummering
  correctedText = correctedText.replace(/\bartikel(\d+)/gi, 'artikel $1')
  correctedText = correctedText.replace(/\bart\.?(\d+)/gi, 'art. $1')
  
  // Wetboek afkortingen
  correctedText = correctedText.replace(/\b(WVW|Sr|Sv|BW|AWB|RVV)(\d+)/gi, '$1 $2')
  
  // Bedragen en percentages
  correctedText = correctedText.replace(/\b(\d+)(euro|EUR)\b/gi, '$1 $2')
  correctedText = correctedText.replace(/\b€(\d+)/g, '€ $1')
  correctedText = correctedText.replace(/\b(\d+)(procent|%)/gi, '$1 $2')
  
  // Tijdsaanduidingen
  correctedText = correctedText.replace(/\b(\d+)(dagen|maanden|jaren|weken|uur|minuten)\b/gi, '$1 $2')
  
  // Veelvoorkomende juridische termen
  correctedText = correctedText.replace(/\bopsporing(\w+)/gi, 'opsporing $1')
  correctedText = correctedText.replace(/\bvervolging(\w+)/gi, 'vervolging $1')
  
  return correctedText
}

// === BIJZONDERE WETGEVING CONTROLE ===
export interface BijzondereWet {
  naam: string;
  trefwoorden: string[];
  url: string;
  categorie: string;
}

const BIJZONDERE_WETGEVING: BijzondereWet[] = [
  {
    naam: "Opiumwet",
    trefwoorden: ["opium", "drugs", "verdovende middelen", "softdrugs", "harddrugs", "cannabis", "cocaïne", "heroïne", "xtc", "mdma", "lsd", "lachgas", "n2o", "distikstofmonoxide", "ballonnetjes", "whippets", "drugshandel", "drugsvervoer", "drugsbezit"],
    url: "https://wetten.overheid.nl/BWBR0001941",
    categorie: "Drugswetgeving"
  },
  {
    naam: "Wet op de economische delicten",
    trefwoorden: ["economisch delict", "wed", "vuurwerk", "milieu", "economische overtreding"],
    url: "https://wetten.overheid.nl/BWBR0002063",
    categorie: "Economisch strafrecht"
  },
  {
    naam: "Wet wapens en munitie",
    trefwoorden: ["wapen", "vuurwapen", "munitie", "wwm", "mes", "verboden wapenbezit"],
    url: "https://wetten.overheid.nl/BWBR0008804",
    categorie: "Wapenwetgeving"
  },
  {
    naam: "Wet dieren",
    trefwoorden: ["dier", "dierenwelzijn", "huisdier", "veehouderij", "dierenmishandeling"],
    url: "https://wetten.overheid.nl/BWBR0030250",
    categorie: "Dierenwetgeving"
  },
  {
    naam: "Drank- en Horecawet",
    trefwoorden: ["alcohol", "horeca", "drank", "café", "restaurant", "slijterij"],
    url: "https://wetten.overheid.nl/BWBR0002458",
    categorie: "Horecawetgeving"
  },
  {
    naam: "Geneesmiddelenwet",
    trefwoorden: ["medicijn", "geneesmiddel", "apotheek", "medicatie", "farmaceutisch"],
    url: "https://wetten.overheid.nl/BWBR0021505",
    categorie: "Gezondheidswetgeving"
  },
  {
    naam: "Arbeidsomstandighedenwet",
    trefwoorden: ["arbo", "werkplek", "arbeidsomstandigheden", "veiligheid", "gezondheid"],
    url: "https://wetten.overheid.nl/BWBR0010346",
    categorie: "Arbeidswetgeving"
  }
];

export async function checkBijzondereWetgeving(vraag: string): Promise<BijzondereWet[]> {
  const vraagLowerCase = vraag.toLowerCase();
  const relevanteWetten = BIJZONDERE_WETGEVING.filter(wet => 
    wet.trefwoorden.some(trefwoord => vraagLowerCase.includes(trefwoord))
  );
  
  return relevanteWetten;
}

// === ACTUELE WETGEVING CONTROLE ===
export interface WetUpdate {
  oudArtikel: string;
  nieuwArtikel: string;
  datumWijziging: Date;
  toelichting?: string;
}

const WETSUPDATES: WetUpdate[] = [
  {
    oudArtikel: "artikel 36 Wet dieren",
    nieuwArtikel: "artikel 2.1 Wet dieren",
    datumWijziging: new Date("2022-01-01"),
    toelichting: "Hernummering bij Wet dieren modernisering"
  },
  {
    oudArtikel: "lachgas is niet strafbaar",
    nieuwArtikel: "lachgas valt onder de Opiumwet (lijst II)",
    datumWijziging: new Date("2023-01-01"),
    toelichting: "Lachgas (N2O/distikstofmonoxide) is per 1 januari 2023 toegevoegd aan lijst II van de Opiumwet bij Besluit van 9 december 2022, Stb. 2022, 564"
  },
  {
    oudArtikel: "N2O vervoer vrij toegestaan",
    nieuwArtikel: "N2O vervoer strafbaar onder Opiumwet artikel 2/10",
    datumWijziging: new Date("2023-01-01"),
    toelichting: "Het vervoeren van lachgas voor menselijke consumptie is strafbaar geworden onder artikel 2 en 10 van de Opiumwet"
  },
  {
    oudArtikel: "ballonnetjes lachgas legaal",
    nieuwArtikel: "ballonnetjes lachgas illegaal onder Opiumwet",
    datumWijziging: new Date("2023-01-01"),
    toelichting: "Het gebruik van ballonnetjes voor lachgasconsumptie valt nu onder de strafbare feiten van de Opiumwet"
  }
];

export async function checkActueleWetgeving(tekst: string): Promise<WetUpdate[]> {
  const tekstLowerCase = tekst.toLowerCase();
  const relevantUpdates = WETSUPDATES.filter(update => 
    tekstLowerCase.includes(update.oudArtikel.toLowerCase()) ||
    // Check voor gerelateerde termen
    (update.oudArtikel.toLowerCase().includes('lachgas') && 
     (tekstLowerCase.includes('lachgas') || tekstLowerCase.includes('n2o') || tekstLowerCase.includes('distikstofmonoxide')))
  );
  
  return relevantUpdates;
}

// Nieuwe functie voor uitgebreide actualiteitscontrole
export interface ActualiteitsWaarschuwing {
  onderwerp: string;
  huidigeStatus: string;
  wijzigingsDatum: Date;
  bronUrl?: string;
  urgentie: 'LAAG' | 'MEDIUM' | 'HOOG' | 'KRITIEK';
}

const ACTUALITEITS_DATABASE: ActualiteitsWaarschuwing[] = [
  {
    onderwerp: "Lachgas/N2O regelgeving",
    huidigeStatus: "Lachgas valt sinds 1 januari 2023 onder de Opiumwet (lijst II). Verkoop, vervoer en bezit voor menselijke consumptie is strafbaar.",
    wijzigingsDatum: new Date("2023-01-01"),
    bronUrl: "https://wetten.overheid.nl/BWBR0001941",
    urgentie: "KRITIEK"
  },
  {
    onderwerp: "Vuurwerkregels",
    huidigeStatus: "Vuurwerkregels worden jaarlijks aangepast. Controleer altijd de meest recente regels via de gemeente.",
    wijzigingsDatum: new Date("2023-12-01"),
    bronUrl: "https://www.rijksoverheid.nl/onderwerpen/vuurwerk",
    urgentie: "MEDIUM"
  },
  {
    onderwerp: "COVID-19 maatregelen",
    huidigeStatus: "COVID-19 maatregelen zijn grotendeels opgeheven. Controleer voor actuele informatie de rijksoverheid.",
    wijzigingsDatum: new Date("2023-03-01"),
    bronUrl: "https://www.rijksoverheid.nl/onderwerpen/coronavirus-covid-19",
    urgentie: "LAAG"
  }
];

export async function checkActualiteit(vraag: string): Promise<ActualiteitsWaarschuwing[]> {
  const vraagLowerCase = vraag.toLowerCase();
  
  return ACTUALITEITS_DATABASE.filter(item => {
    const onderwerp = item.onderwerp.toLowerCase();
    const trefwoorden = onderwerp.split(/[\s\/\-]+/);
    
    return trefwoorden.some(trefwoord => 
      trefwoord.length > 2 && vraagLowerCase.includes(trefwoord)
    );
  }).sort((a, b) => {
    // Sorteer op urgentie (KRITIEK eerst)
    const urgentieOrder = { 'KRITIEK': 4, 'HOOG': 3, 'MEDIUM': 2, 'LAAG': 1 };
    return urgentieOrder[b.urgentie] - urgentieOrder[a.urgentie];
  });
} 