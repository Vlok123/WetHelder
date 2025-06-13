#!/usr/bin/env node

/**
 * Test script voor Excel bronnen integratie
 * 
 * Gebruik:
 * node scripts/test-excel-integration.js
 * node scripts/test-excel-integration.js --search="politie"
 */

const { testExcelIntegration, searchExcelSources, loadExcelSources } = require('../lib/excelSources')

async function main() {
  const args = process.argv.slice(2)
  const searchTerm = args.find(arg => arg.startsWith('--search='))?.split('=')[1]

  console.log('🧪 WetHelder Excel Bronnen Test')
  console.log('================================')

  try {
    if (searchTerm) {
      console.log(`\n🔍 Zoeken naar: "${searchTerm}"`)
      const results = await searchExcelSources(searchTerm, 10)
      
      console.log(`\n📊 Gevonden: ${results.length} resultaten`)
      
      results.forEach((result, index) => {
        console.log(`\n[${index + 1}] ${result.naam}`)
        console.log(`    URL: ${result.url}`)
        console.log(`    Categorie: ${result.categorie}`)
        console.log(`    Type: ${result.type}`)
        console.log(`    Betrouwbaarheid: ${result.betrouwbaarheid}`)
        console.log(`    Beschrijving: ${result.beschrijving.substring(0, 100)}...`)
        console.log(`    Trefwoorden: ${result.trefwoorden.join(', ')}`)
      })
    } else {
      // Volledige test
      await testExcelIntegration()
      
      // Toon alle bronnen
      console.log('\n📋 Alle beschikbare bronnen:')
      const allSources = await loadExcelSources()
      
      const categorieGroups = allSources.reduce((acc, source) => {
        if (!acc[source.categorie]) {
          acc[source.categorie] = []
        }
        acc[source.categorie].push(source)
        return acc
      }, {})
      
      Object.entries(categorieGroups).forEach(([categorie, sources]) => {
        console.log(`\n📂 ${categorie} (${sources.length} bronnen):`)
        sources.forEach(source => {
          console.log(`   • ${source.naam} - ${source.url}`)
        })
      })
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

main() 