/**
 * Excel Sources Integration
 * 
 * Dit bestand beheert de integratie van officiële bronnen uit het Excel bestand.
 * Het Excel bestand wordt geplaatst in de /data directory en hier geïntegreerd.
 */

import * as XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'

export interface ExcelBron {
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
}

// Pad naar het Excel bestand in de data directory
const EXCEL_SOURCES_PATH = path.join(process.cwd(), 'data', 'officiele_bronnen.xlsx')

/**
 * Laadt de officiële bronnen uit het Excel bestand
 */
export async function loadExcelSources(): Promise<ExcelBron[]> {
  try {
    if (!fs.existsSync(EXCEL_SOURCES_PATH)) {
      console.warn(`⚠️ Excel bestand niet gevonden: ${EXCEL_SOURCES_PATH}`)
      return []
    }

    console.log('📊 Loading Excel sources...')
    
    // Lees het Excel bestand
    const workbook = XLSX.readFile(EXCEL_SOURCES_PATH)
    const sheetName = workbook.SheetNames[0] // Eerste sheet
    const worksheet = workbook.Sheets[sheetName]
    
    // Converteer naar JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    if (rawData.length < 2) {
      console.warn('⚠️ Excel bestand bevat geen data')
      return []
    }
    
    // Eerste rij zijn de headers
    const headers = rawData[0] as string[]
    const dataRows = rawData.slice(1) as any[][]
    
    console.log(`📋 Headers gevonden: ${headers.join(', ')}`)
    
    // Map de data naar onze interface
    const sources: ExcelBron[] = dataRows
      .filter(row => row && row.length > 0 && row[0]) // Filter lege rijen
      .map((row, index) => {
        try {
          const source: ExcelBron = {
            id: `excel-${index + 1}`,
            naam: String(row[0] || '').trim(),
            url: String(row[1] || '').trim(),
            beschrijving: String(row[2] || '').trim(),
            categorie: String(row[3] || 'Overig').trim(),
            betrouwbaarheid: validateBetrouwbaarheid(String(row[4] || 'hoog').trim().toLowerCase()),
            trefwoorden: String(row[5] || '').split(',').map(k => k.trim()).filter(k => k),
            type: validateType(String(row[6] || 'overig').trim().toLowerCase()),
            organisatie: String(row[7] || '').trim() || undefined,
            laatstGecontroleerd: new Date()
          }
          
          return source
        } catch (error) {
          console.warn(`⚠️ Fout bij verwerken rij ${index + 2}:`, error)
          return null
        }
      })
      .filter((source): source is ExcelBron => source !== null)
    
    console.log(`✅ ${sources.length} bronnen geladen uit Excel bestand`)
    
    // Log categorieën
    const categories = [...new Set(sources.map(s => s.categorie))]
    console.log(`📂 Categorieën: ${categories.join(', ')}`)
    
    return sources
    
  } catch (error) {
    console.error('❌ Fout bij laden Excel bronnen:', error)
    return []
  }
}

/**
 * Valideert en normaliseert betrouwbaarheid
 */
function validateBetrouwbaarheid(value: string): 'hoog' | 'middel' | 'laag' {
  switch (value) {
    case 'hoog':
    case 'high':
      return 'hoog'
    case 'middel':
    case 'medium':
    case 'gemiddeld':
      return 'middel'
    case 'laag':
    case 'low':
      return 'laag'
    default:
      return 'hoog' // Default naar hoog voor officiële bronnen
  }
}

/**
 * Valideert en normaliseert type
 */
function validateType(value: string): 'wetgeving' | 'jurisprudentie' | 'cao' | 'beleid' | 'overig' {
  switch (value) {
    case 'wetgeving':
    case 'wet':
    case 'wetten':
      return 'wetgeving'
    case 'jurisprudentie':
    case 'rechtspraak':
    case 'uitspraak':
    case 'uitspraken':
      return 'jurisprudentie'
    case 'cao':
    case 'arbeidsvoorwaarden':
      return 'cao'
    case 'beleid':
    case 'beleidsregel':
    case 'beleidsregels':
      return 'beleid'
    default:
      return 'overig'
  }
}

/**
 * Zoekt in de Excel bronnen op basis van query
 */
export async function searchExcelSources(query: string, limit: number = 10): Promise<ExcelBron[]> {
  const sources = await loadExcelSources()
  
  if (!query.trim()) {
    return sources.slice(0, limit)
  }
  
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2)
  
  const scoredSources = sources.map(source => {
    let score = 0
    const searchableText = [
      source.naam,
      source.beschrijving,
      source.categorie,
      source.organisatie || '',
      ...source.trefwoorden
    ].join(' ').toLowerCase()
    
    // Score op basis van matches
    searchTerms.forEach(term => {
      if (source.naam.toLowerCase().includes(term)) score += 10
      if (source.trefwoorden.some(keyword => keyword.toLowerCase().includes(term))) score += 8
      if (source.beschrijving.toLowerCase().includes(term)) score += 5
      if (source.categorie.toLowerCase().includes(term)) score += 3
      if (searchableText.includes(term)) score += 1
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
export async function getExcelSourcesByCategory(categorie: string): Promise<ExcelBron[]> {
  const sources = await loadExcelSources()
  return sources.filter(source => 
    source.categorie.toLowerCase().includes(categorie.toLowerCase())
  )
}

/**
 * Haalt bronnen op per type
 */
export async function getExcelSourcesByType(type: string): Promise<ExcelBron[]> {
  const sources = await loadExcelSources()
  return sources.filter(source => 
    source.type.toLowerCase() === type.toLowerCase()
  )
}

/**
 * Formatteert Excel bronnen voor gebruik in de zoekcontext
 */
export function formatExcelSourcesForContext(sources: ExcelBron[]): string {
  if (sources.length === 0) {
    return 'Geen specifieke Excel bronnen gevonden.'
  }
  
  return sources.map(source => {
    return `**${source.naam}** (${source.categorie})
Beschrijving: ${source.beschrijving}
URL: ${source.url}
Type: ${source.type}
${source.organisatie ? `Organisatie: ${source.organisatie}` : ''}
Betrouwbaarheid: ${source.betrouwbaarheid}
Trefwoorden: ${source.trefwoorden.join(', ')}
---`
  }).join('\n\n')
}

/**
 * Krijgt alle beschikbare categorieën
 */
export async function getAvailableCategories(): Promise<string[]> {
  const sources = await loadExcelSources()
  return [...new Set(sources.map(s => s.categorie))].sort()
}

/**
 * Krijgt alle beschikbare types
 */
export async function getAvailableTypes(): Promise<string[]> {
  const sources = await loadExcelSources()
  return [...new Set(sources.map(s => s.type))].sort()
}

/**
 * Test functie om de Excel integratie te testen
 */
export async function testExcelIntegration(): Promise<void> {
  console.log('🧪 Testing Excel integration...')
  
  const sources = await loadExcelSources()
  console.log(`📊 Totaal bronnen: ${sources.length}`)
  
  const categories = await getAvailableCategories()
  console.log(`📂 Categorieën: ${categories.join(', ')}`)
  
  const types = await getAvailableTypes()
  console.log(`🏷️ Types: ${types.join(', ')}`)
  
  // Test zoeken
  const searchResults = await searchExcelSources('politie', 5)
  console.log(`🔍 Zoekresultaten voor 'politie': ${searchResults.length}`)
  
  if (searchResults.length > 0) {
    console.log('📋 Eerste resultaat:')
    console.log(`   Naam: ${searchResults[0].naam}`)
    console.log(`   URL: ${searchResults[0].url}`)
    console.log(`   Categorie: ${searchResults[0].categorie}`)
  }
  
  console.log('✅ Excel integration test completed')
} 