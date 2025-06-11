#!/usr/bin/env node

/**
 * Test script voor officiële juridische bronnen integratie
 * 
 * Gebruik:
 * node scripts/ingest-test.js --source=wettenbank --keyword="politie"
 * node scripts/ingest-test.js --source=all
 * node scripts/ingest-test.js --search="artikel 300 sr"
 */

const { 
  fetchBasiswettenbestand,
  fetchKOOPDocuments,
  fetchRechtspraak,
  fetchTweedeKamer,
  fetchEURLex,
  searchOfficialSources,
  runFullDataSync
} = require('../lib/officialSources')

async function main() {
  const args = process.argv.slice(2)
  const source = args.find(arg => arg.startsWith('--source='))?.split('=')[1]
  const keyword = args.find(arg => arg.startsWith('--keyword='))?.split('=')[1] || ''
  const search = args.find(arg => arg.startsWith('--search='))?.split('=')[1]

  console.log('🧪 WetHelder Data Ingestie Test')
  console.log('================================')

  try {
    if (search) {
      console.log(`🔍 Testing search: "${search}"`)
      const results = await searchOfficialSources(search, 5)
      console.log(`✅ Found ${results.length} results:`)
      results.forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.titel} (${doc.bron || doc.type})`)
        if (doc.uri || doc.ecli) {
          console.log(`   URI: ${doc.uri || doc.ecli}`)
        }
        console.log('')
      })
      return
    }

    switch (source) {
      case 'wettenbank':
        console.log('📚 Testing Wettenbank...')
        const wetgeving = await fetchBasiswettenbestand()
        console.log(`✅ Fetched ${wetgeving.length} documents from Wettenbank`)
        if (wetgeving.length > 0) {
          console.log('Sample document:', wetgeving[0])
        }
        break

      case 'koop':
        console.log('📰 Testing KOOP...')
        const koop = await fetchKOOPDocuments(keyword, 10)
        console.log(`✅ Fetched ${koop.length} documents from KOOP`)
        if (koop.length > 0) {
          console.log('Sample document:', koop[0])
        }
        break

      case 'rechtspraak':
        console.log('⚖️ Testing Rechtspraak...')
        const rechtspraak = await fetchRechtspraak(10)
        console.log(`✅ Fetched ${rechtspraak.length} documents from Rechtspraak`)
        if (rechtspraak.length > 0) {
          console.log('Sample document:', rechtspraak[0])
        }
        break

      case 'tweedekamer':
        console.log('🏛️ Testing Tweede Kamer...')
        const tk = await fetchTweedeKamer(10)
        console.log(`✅ Fetched data from Tweede Kamer:`, tk)
        break

      case 'eurlex':
        console.log('🇪🇺 Testing EUR-Lex...')
        const eurlex = await fetchEURLex(keyword)
        console.log(`✅ Fetched ${eurlex.length} documents from EUR-Lex`)
        break

      case 'all':
        console.log('🔄 Testing full data sync...')
        await runFullDataSync()
        console.log('✅ Full sync completed')
        break

      default:
        console.log('❌ Unknown source. Available sources:')
        console.log('  --source=wettenbank')
        console.log('  --source=koop')
        console.log('  --source=rechtspraak')
        console.log('  --source=tweedekamer')
        console.log('  --source=eurlex')
        console.log('  --source=all')
        console.log('')
        console.log('Search test:')
        console.log('  --search="artikel 300 sr"')
        process.exit(1)
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
} 