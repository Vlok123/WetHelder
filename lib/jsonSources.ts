/**
 * JSON Sources Integration
 * 
 * Dit bestand beheert de integratie van officiële bronnen uit het JSON bestand.
 * Het JSON bestand wordt geplaatst in de /data directory en hier geïntegreerd.
 */

import fs from 'fs'
import path from 'path'

export interface JsonBron {
  id: string
  naam: string
  url: string
  beschrijving: string
  categorie: string
  betrouwbaarheid: 'hoog' | 'middel' | 'laag'
  trefwoorden: string[]
  type: 'wetgeving' | 'jurisprudentie' | 'cao' | 'beleid' | 'overig'
  organisatie?: string
  laatstGecontroleerd?: Date
  topic: string
  scope: string
}

// Pad naar het JSON bestand in de data directory
const JSON_SOURCES_PATH = path.join(process.cwd(), 'data', 'officiele_bronnen.json')

/**
 * Bepaalt het type op basis van de categorie
 */
function categorizeType(categorie: string): 'wetgeving' | 'jurisprudentie' | 'cao' | 'beleid' | 'overig' {
  const lowerCategorie = categorie.toLowerCase()
  
  if (lowerCategorie.includes('wetgeving')) return 'wetgeving'
  if (lowerCategorie.includes('jurisprudentie')) return 'jurisprudentie'
  if (lowerCategorie.includes('cao')) return 'cao'
  if (lowerCategorie.includes('beleid') || lowerCategorie.includes('handhaving') || lowerCategorie.includes('inspecties')) return 'beleid'
  
  return 'overig'
}

/**
 * Extraheert organisatie uit de bron naam
 */
function extractOrganization(bronNaam: string): string | undefined {
  const lowerNaam = bronNaam.toLowerCase()
  
  if (lowerNaam.includes('politie')) return 'Politie'
  if (lowerNaam.includes('rechtspraak')) return 'Rechtspraak'
  if (lowerNaam.includes('belastingdienst')) return 'Belastingdienst'
  if (lowerNaam.includes('uwv')) return 'UWV'
  if (lowerNaam.includes('svb')) return 'SVB'
  if (lowerNaam.includes('cao')) return 'Sociale Partners'
  if (lowerNaam.includes('overheid')) return 'Overheid'
  if (lowerNaam.includes('ministerie') || lowerNaam.includes('minszw')) return 'Ministerie'
  if (lowerNaam.includes('cbs')) return 'CBS'
  if (lowerNaam.includes('kvk')) return 'KVK'
  if (lowerNaam.includes('afm')) return 'AFM'
  if (lowerNaam.includes('dnb')) return 'DNB'
  if (lowerNaam.includes('acm')) return 'ACM'
  
  return undefined
}

/**
 * Laadt de officiële bronnen uit het JSON bestand
 */
export async function loadJsonSources(): Promise<JsonBron[]> {
  try {
    if (!fs.existsSync(JSON_SOURCES_PATH)) {
      console.warn(`⚠️ JSON bestand niet gevonden: ${JSON_SOURCES_PATH}`)
      return []
    }

    console.log('📊 Loading JSON sources...')
    
    // Lees het JSON bestand
    const rawData = fs.readFileSync(JSON_SOURCES_PATH, 'utf-8')
    const jsonData = JSON.parse(rawData)
    
    // Haal de data uit de Sheet1 array
    const sourceData = jsonData.Sheet1 || []
    
    if (sourceData.length === 0) {
      console.warn('⚠️ JSON bestand bevat geen data')
      return []
    }
    
    console.log(`📋 ${sourceData.length} rijen gevonden in JSON`)
    
    // Map de data naar onze interface
    const sources: JsonBron[] = sourceData
      .filter((row: any) => row && row['Bron (naam)']) // Filter lege rijen
      .map((row: any, index: number) => {
        try {
          const source: JsonBron = {
            id: `json-${index + 1}`,
            naam: String(row['Bron (naam)'] || '').trim(),
            url: String(row['URL'] || '').trim(),
            beschrijving: String(row['Omschrijving'] || '').trim(),
            categorie: String(row['Categorie'] || 'Overig').trim(),
            betrouwbaarheid: 'hoog', // Alle JSON bronnen zijn hoog betrouwbaar
            trefwoorden: [
              String(row['Topic'] || '').trim(),
              String(row['Scope'] || '').trim(),
              String(row['Categorie'] || '').trim()
            ].filter(k => k),
            type: categorizeType(String(row['Categorie'] || '').trim()),
            organisatie: extractOrganization(String(row['Bron (naam)'] || '').trim()),
            laatstGecontroleerd: new Date(),
            topic: String(row['Topic'] || '').trim(),
            scope: String(row['Scope'] || '').trim()
          }
          
          return source
        } catch (error) {
          console.warn(`⚠️ Fout bij verwerken rij ${index + 1}:`, error)
          return null
        }
      })
      .filter((source: JsonBron | null): source is JsonBron => source !== null)
    
    console.log(`✅ ${sources.length} bronnen geladen uit JSON bestand`)
    
    // Log categorieën
    const categories = [...new Set(sources.map(s => s.categorie))]
    console.log(`📂 Categorieën: ${categories.join(', ')}`)
    
    return sources
    
  } catch (error) {
    console.error('❌ Fout bij laden JSON bronnen:', error)
    return []
  }
}

/**
 * Zoekt in de JSON bronnen op basis van query
 */
export async function searchJsonSources(query: string, limit: number = 10): Promise<JsonBron[]> {
  const sources = await loadJsonSources()
  
  if (!query.trim()) {
    return sources.slice(0, limit)
  }
  
  // Belangrijke juridische afkortingen die niet gefilterd moeten worden
  const importantLegalTerms = [
    'apv', 'bw', 'sr', 'sv', 'wvsr', 'wvw', 'awb', 'atw', 'cao', 'eu', 'gdpr', 'avg',
    'ilo', 'kvk', 'afm', 'dnb', 'acm', 'cbp', 'ap', 'rvs', 'rvd', 'ovj', 'om', 'rv'
  ]
  
  // Enhanced vehicle-related terms for RV (Reglement Voertuigen) recognition
  const vehicleTerms = [
    'voertuig', 'auto', 'personenauto', 'motor', 'fiets', 'voorruit', 'zijruit',
    'beschadiging', 'verkleuring', 'constructie', 'carrosserie', 'verlichting',
    'reglement voertuigen', 'voertuigreglement', 'technische eisen'
  ]
  
  // Filter zoektermen: behoud termen > 2 karakters OF belangrijke juridische termen OF voertuig termen
  const searchTerms = query.toLowerCase().split(' ').filter(term => 
    term.length > 2 || 
    importantLegalTerms.includes(term.toLowerCase()) ||
    vehicleTerms.some(vTerm => vTerm.includes(term) || term.includes(vTerm))
  )
  
  // Special handling for RV article patterns like "5.2.42"
  const rvArticleMatch = query.match(/(\d+\.\d+\.\d+)/);
  if (rvArticleMatch) {
    searchTerms.push(rvArticleMatch[1]); // Add the article number
    searchTerms.push('rv', 'reglement', 'voertuigen'); // Add RV-related terms
    console.log(`🚗 Detected RV article pattern: ${rvArticleMatch[1]}`);
  }
  
  const scoredSources = sources.map(source => {
    let score = 0
    const searchableText = [
      source.naam,
      source.beschrijving,
      source.categorie,
      source.topic,
      source.organisatie || '',
      ...source.trefwoorden
    ].join(' ').toLowerCase()
    
    // Score op basis van matches
    searchTerms.forEach(term => {
      const lowerTerm = term.toLowerCase()
      
      // Exacte matches krijgen hogere score
      if (source.naam.toLowerCase().includes(lowerTerm)) score += 10
      if (source.topic.toLowerCase().includes(lowerTerm)) score += 8
      if (source.trefwoorden.some(keyword => keyword.toLowerCase().includes(lowerTerm))) score += 8
      if (source.beschrijving.toLowerCase().includes(lowerTerm)) score += 5
      if (source.categorie.toLowerCase().includes(lowerTerm)) score += 3
      if (searchableText.includes(lowerTerm)) score += 1
      
      // Extra score voor belangrijke juridische termen
      if (importantLegalTerms.includes(lowerTerm)) {
        if (source.topic.toLowerCase().includes(lowerTerm)) score += 15
        if (source.naam.toLowerCase().includes(lowerTerm)) score += 12
      }
    })
    
    return { source, score }
  })
  
  return scoredSources
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.source)
}

/**
 * Haalt bronnen op per categorie
 */
export async function getJsonSourcesByCategory(categorie: string): Promise<JsonBron[]> {
  const sources = await loadJsonSources()
  return sources.filter(source => 
    source.categorie.toLowerCase().includes(categorie.toLowerCase())
  )
}

/**
 * Haalt bronnen op per type
 */
export async function getJsonSourcesByType(type: string): Promise<JsonBron[]> {
  const sources = await loadJsonSources()
  return sources.filter(source => 
    source.type.toLowerCase() === type.toLowerCase()
  )
}

/**
 * Formatteert JSON bronnen voor gebruik in de zoekcontext
 */
export function formatJsonSourcesForContext(sources: JsonBron[]): string {
  if (sources.length === 0) {
    return 'Geen specifieke JSON bronnen gevonden.'
  }
  
  return sources.map(source => {
    return `**${source.naam}** (${source.categorie})
Topic: ${source.topic}
Beschrijving: ${source.beschrijving}
URL: ${source.url}
Type: ${source.type}
${source.organisatie ? `Organisatie: ${source.organisatie}` : ''}
Betrouwbaarheid: ${source.betrouwbaarheid}
Scope: ${source.scope}
Trefwoorden: ${source.trefwoorden.join(', ')}
---`
  }).join('\n\n')
}

/**
 * Krijgt alle beschikbare categorieën
 */
export async function getAvailableCategories(): Promise<string[]> {
  const sources = await loadJsonSources()
  return [...new Set(sources.map(s => s.categorie))].sort()
}

/**
 * Krijgt alle beschikbare types
 */
export async function getAvailableTypes(): Promise<string[]> {
  const sources = await loadJsonSources()
  return [...new Set(sources.map(s => s.type))].sort()
}

/**
 * Test functie om de JSON integratie te testen
 */
export async function testJsonIntegration(): Promise<void> {
  console.log('🧪 Testing JSON integration...')
  
  const sources = await loadJsonSources()
  console.log(`📊 Totaal bronnen: ${sources.length}`)
  
  const categories = await getAvailableCategories()
  console.log(`📂 Categorieën: ${categories.join(', ')}`)
  
  const types = await getAvailableTypes()
  console.log(`🏷️ Types: ${types.join(', ')}`)
  
  // Test zoeken
  const searchResults = await searchJsonSources('politie', 5)
  console.log(`🔍 Zoekresultaten voor 'politie': ${searchResults.length}`)
  
  if (searchResults.length > 0) {
    console.log('📋 Eerste resultaat:')
    console.log(`   Naam: ${searchResults[0].naam}`)
    console.log(`   URL: ${searchResults[0].url}`)
    console.log(`   Categorie: ${searchResults[0].categorie}`)
    console.log(`   Topic: ${searchResults[0].topic}`)
  }
  
  console.log('✅ JSON integration test completed')
} 