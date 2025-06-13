/**
 * Custom Sources Integration
 * 
 * Dit bestand beheert de integratie van aangepaste bronnen uit het gebruiker document.
 * Het Word document wordt geplaatst in de /data directory en hier geïntegreerd.
 */

import fs from 'fs'
import path from 'path'

export interface CustomSource {
  id: string
  naam: string
  url: string
  beschrijving: string
  categorie: string
  betrouwbaarheid: 'hoog' | 'middel' | 'laag'
  laatstGecontroleerd?: Date
  trefwoorden: string[]
}

// Pad naar het bronnen document in de data directory
const SOURCES_DOCUMENT_PATH = path.join(process.cwd(), 'data', 'bronnen-document.docx')
const SOURCES_JSON_PATH = path.join(process.cwd(), 'data', 'custom-sources.json')

/**
 * Laadt de aangepaste bronnen uit het JSON bestand
 * (Dit JSON bestand wordt gegenereerd uit het Word document)
 */
export async function loadCustomSources(): Promise<CustomSource[]> {
  try {
    if (fs.existsSync(SOURCES_JSON_PATH)) {
      const jsonContent = fs.readFileSync(SOURCES_JSON_PATH, 'utf-8')
      const sources = JSON.parse(jsonContent) as CustomSource[]
      console.log(`📚 Loaded ${sources.length} custom sources`)
      return sources
    } else {
      console.warn('⚠️ Custom sources JSON file not found. Please convert your Word document.')
      return getDefaultSources()
    }
  } catch (error) {
    console.error('Error loading custom sources:', error)
    return getDefaultSources()
  }
}

/**
 * Zoekt in de aangepaste bronnen op basis van query met strikte datumvalidatie
 */
export async function searchCustomSources(query: string, limit: number = 5): Promise<CustomSource[]> {
  const allSources = await loadCustomSources()
  const queryLower = query.toLowerCase()
  const currentYear = new Date().getFullYear()
  
  console.log(`🔍 Zoeken in custom sources voor: "${query}" met strikte ${currentYear} validatie`)
  
  // Verbeterde zoekfunctie: zoek ook op losse woorden
  const queryWords = queryLower.split(' ').filter(word => word.length > 2)
  
  // Filter bronnen op basis van trefwoorden, naam of beschrijving
  const relevantSources = allSources.filter(source => {
    // Exacte match in trefwoorden, naam of beschrijving
    const exactMatch = source.trefwoorden.some(keyword => keyword.toLowerCase().includes(queryLower)) ||
                      source.naam.toLowerCase().includes(queryLower) ||
                      source.beschrijving.toLowerCase().includes(queryLower)
    
    // Speciale matching voor schenkingsvragen
    const isGiftQuery = queryLower.includes('schenk') || queryLower.includes('ton') || 
                       (queryLower.includes('kind') && (queryLower.includes('geld') || queryLower.includes('geven')))
    const isGiftSource = source.trefwoorden.some(keyword => 
      keyword.toLowerCase().includes('schenking') || keyword.toLowerCase().includes('ton schenken')
    )
    
    // Gedeeltelijke match op individuele woorden
    const partialMatch = queryWords.some(word => 
      source.trefwoorden.some(keyword => keyword.toLowerCase().includes(word)) ||
      source.naam.toLowerCase().includes(word) ||
      source.beschrijving.toLowerCase().includes(word)
    )
    
    return exactMatch || partialMatch || (isGiftQuery && isGiftSource)
  })
  
  // STRIKTE DATUMVALIDATIE: Filter bronnen op actualiteit
  const validatedSources = relevantSources.filter(source => {
    // Check of de bron recent is gecontroleerd (binnen 1 jaar)
    if (!source.laatstGecontroleerd) {
      console.log(`⚠️ Custom source zonder controle datum: ${source.naam} - wordt uitgesloten`)
      return false
    }
    
    const lastChecked = new Date(source.laatstGecontroleerd)
    const isRecent = (Date.now() - lastChecked.getTime()) < (365 * 24 * 60 * 60 * 1000)
    
    if (!isRecent) {
      console.log(`⚠️ Custom source verouderd: ${source.naam} (laatst gecontroleerd: ${source.laatstGecontroleerd})`)
      return false // Strikte regel: verouderde bronnen worden uitgesloten
    }
    
    return true
  })
  
  // Sorteer op betrouwbaarheid (hoog eerst)
  const sorted = validatedSources.sort((a, b) => {
    const betrouwbaarheidScore = { 'hoog': 3, 'middel': 2, 'laag': 1 }
    return betrouwbaarheidScore[b.betrouwbaarheid] - betrouwbaarheidScore[a.betrouwbaarheid]
  })
  
  // Log voor debugging
  console.log(`📊 Zoekresultaat: ${relevantSources.length} relevante bronnen, ${validatedSources.length} actueel voor ${currentYear}`)
  
  if (sorted.length > 0) {
    console.log(`✅ Gevalideerde aangepaste bronnen voor query: "${query}"`)
    sorted.slice(0, limit).forEach(source => {
      console.log(`   📚 ${source.naam} (${source.betrouwbaarheid}) - Gecontroleerd: ${source.laatstGecontroleerd}`)
    })
  } else if (relevantSources.length > 0) {
    console.log(`❌ Alle ${relevantSources.length} relevante bronnen zijn verouderd voor ${currentYear}`)
  } else {
    console.log(`🔍 Geen aangepaste bronnen gevonden voor query: "${query}"`)
  }
  
  return sorted.slice(0, limit)
}

/**
 * Voegt aangepaste bronnen toe aan de standaard bronnenlijst
 */
export async function getSourcesForQuery(query: string): Promise<string[]> {
  const customSources = await searchCustomSources(query)
  
  if (customSources.length > 0) {
    console.log(`📋 Aangepaste bronnen toegevoegd aan zoekresultaten:`)
    customSources.forEach(source => {
      console.log(`   ${source.betrouwbaarheid === 'hoog' ? '🟢' : source.betrouwbaarheid === 'middel' ? '🟡' : '🔴'} ${source.naam}`)
    })
  }
  
  return customSources.map(source => {
    const betrouwbaarheidIcon = source.betrouwbaarheid === 'hoog' ? '🟢' : 
                               source.betrouwbaarheid === 'middel' ? '🟡' : '🔴'
    return `📚 AANGEPASTE BRON: ${betrouwbaarheidIcon} ${source.naam}: ${source.url} - ${source.beschrijving} (Categorie: ${source.categorie})`
  })
}

/**
 * Standaard bronnen als fallback
 */
function getDefaultSources(): CustomSource[] {
  return [
    {
      id: 'wetten-overheid',
      naam: 'Wetten.overheid.nl',
      url: 'https://wetten.overheid.nl',
      beschrijving: 'Officiële Nederlandse wetgeving',
      categorie: 'Wetgeving',
      betrouwbaarheid: 'hoog',
      trefwoorden: ['wet', 'wetgeving', 'artikel', 'burgerlijk wetboek', 'strafrecht']
    },
    {
      id: 'rechtspraak-nl',
      naam: 'Rechtspraak.nl',
      url: 'https://uitspraken.rechtspraak.nl',
      beschrijving: 'Nederlandse jurisprudentie en uitspraken',
      categorie: 'Jurisprudentie',
      betrouwbaarheid: 'hoog',
      trefwoorden: ['uitspraak', 'vonnis', 'arrest', 'rechtbank', 'hof']
    }
  ]
}

/**
 * Converteert Word document naar JSON (placeholder functie)
 * In de praktijk zou je hier een Word-to-JSON converter implementeren
 */
export async function convertWordDocumentToJSON(): Promise<void> {
  console.log('📄 Converting Word document to JSON...')
  
  // Check of Word document bestaat
  if (!fs.existsSync(SOURCES_DOCUMENT_PATH)) {
    console.error(`❌ Word document not found at: ${SOURCES_DOCUMENT_PATH}`)
    console.log('📝 Please place your "bronnen-document.docx" file in the /data directory')
    return
  }
  
  // TODO: Implementeer Word document parsing
  // Voor nu maken we een voorbeeld JSON structuur
  const exampleSources: CustomSource[] = [
    {
      id: 'example-1',
      naam: 'Voorbeeld Bron 1',
      url: 'https://example.com/bron1',
      beschrijving: 'Dit is een voorbeeld van hoe je bronnen worden gestructureerd',
      categorie: 'Voorbeeld',
      betrouwbaarheid: 'hoog',
      laatstGecontroleerd: new Date(),
      trefwoorden: ['voorbeeld', 'test', 'demo']
    }
  ]
  
  // Schrijf naar JSON bestand
  fs.writeFileSync(SOURCES_JSON_PATH, JSON.stringify(exampleSources, null, 2))
  console.log(`✅ Custom sources saved to: ${SOURCES_JSON_PATH}`)
}

/**
 * Valideert en update aangepaste bronnen
 */
export async function validateCustomSources(): Promise<void> {
  const sources = await loadCustomSources()
  
  console.log('🔍 Validating custom sources...')
  
  for (const source of sources) {
    try {
      // Test of URL bereikbaar is
      const response = await fetch(source.url, { method: 'HEAD' })
      if (!response.ok) {
        console.warn(`⚠️ Source "${source.naam}" may be unreachable: ${source.url}`)
      }
    } catch (error) {
      console.warn(`⚠️ Could not validate source "${source.naam}": ${source.url}`)
    }
  }
  
  console.log('✅ Source validation completed')
} 