const { loadJsonSources, searchJsonSources } = require('../lib/jsonSources.ts')

async function testPolitiewetJson() {
  console.log('🧪 Testing Politiewet JSON Loading...\n')
  
  try {
    // Test algemene loading
    console.log('1️⃣ Loading all JSON sources...')
    const allSources = await loadJsonSources()
    console.log(`✅ Total sources loaded: ${allSources.length}`)
    
    // Test politiewet specifiek
    console.log('\n2️⃣ Searching for politiewet...')
    const politiewetResults = await searchJsonSources('politiewet', 10)
    console.log(`✅ Politiewet sources found: ${politiewetResults.length}`)
    
    if (politiewetResults.length > 0) {
      console.log('\n📄 First 3 politiewet results:')
      politiewetResults.slice(0, 3).forEach((source, index) => {
        console.log(`\n${index + 1}. ${source.naam}`)
        console.log(`   Topic: ${source.topic}`)
        console.log(`   Categorie: ${source.categorie}`)
        console.log(`   URL: ${source.url}`)
        console.log(`   Beschrijving: ${source.beschrijving.substring(0, 100)}...`)
      })
    }
    
    // Test artikel 7 specifiek
    console.log('\n3️⃣ Searching for "artikel 7 politiewet"...')
    const artikel7Results = await searchJsonSources('artikel 7 politiewet', 5)
    console.log(`✅ Artikel 7 results found: ${artikel7Results.length}`)
    
    if (artikel7Results.length > 0) {
      console.log('\n📜 Artikel 7 results:')
      artikel7Results.forEach((source, index) => {
        console.log(`\n${index + 1}. ${source.naam}`)
        console.log(`   Beschrijving: ${source.beschrijving.substring(0, 200)}...`)
      })
    }
    
    // Test categorieën
    console.log('\n4️⃣ Available categories:')
    const categories = [...new Set(allSources.map(s => s.categorie))]
    categories.forEach(cat => {
      const count = allSources.filter(s => s.categorie === cat).length
      console.log(`   ${cat}: ${count} sources`)
    })
    
    console.log('\n🎉 Test completed successfully!')
    
  } catch (error) {
    console.error('💥 Test failed:', error)
    process.exit(1)
  }
}

testPolitiewetJson() 