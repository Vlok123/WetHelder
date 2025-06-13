#!/usr/bin/env node

/**
 * Setup script voor aangepaste bronnen
 * 
 * Dit script helpt bij het opzetten van aangepaste bronnen voor WetHelder
 */

const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'data')
const EXAMPLE_FILE = path.join(DATA_DIR, 'custom-sources-example.json')
const TARGET_FILE = path.join(DATA_DIR, 'custom-sources.json')
const WORD_DOC_PATH = path.join(DATA_DIR, 'bronnen-document.docx')

console.log('🚀 WetHelder Custom Sources Setup')
console.log('==================================')

// Check of data directory bestaat
if (!fs.existsSync(DATA_DIR)) {
  console.log('📁 Creating data directory...')
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Check of er al een custom-sources.json bestaat
if (fs.existsSync(TARGET_FILE)) {
  console.log('✅ Custom sources file already exists!')
  console.log(`📍 Location: ${TARGET_FILE}`)
  
  // Lees en toon aantal bronnen
  try {
    const sources = JSON.parse(fs.readFileSync(TARGET_FILE, 'utf-8'))
    console.log(`📚 Current sources: ${sources.length}`)
    
    // Toon bronnen per categorie
    const categories = {}
    sources.forEach(source => {
      if (!categories[source.categorie]) {
        categories[source.categorie] = []
      }
      categories[source.categorie].push(source.naam)
    })
    
    console.log('\n📋 Sources by category:')
    Object.entries(categories).forEach(([category, sourceNames]) => {
      console.log(`  ${category}: ${sourceNames.join(', ')}`)
    })
    
  } catch (error) {
    console.error('❌ Error reading existing sources file:', error.message)
  }
} else {
  // Kopieer voorbeeld bestand
  if (fs.existsSync(EXAMPLE_FILE)) {
    console.log('📋 Setting up default sources from example...')
    fs.copyFileSync(EXAMPLE_FILE, TARGET_FILE)
    console.log('✅ Default sources installed!')
    console.log(`📍 Location: ${TARGET_FILE}`)
  } else {
    console.error('❌ Example file not found!')
    process.exit(1)
  }
}

// Check voor Word document
console.log('\n📄 Checking for Word document...')
if (fs.existsSync(WORD_DOC_PATH)) {
  console.log('✅ Word document found!')
  console.log(`📍 Location: ${WORD_DOC_PATH}`)
  console.log('💡 You can convert this to JSON using the conversion function')
} else {
  console.log('📝 No Word document found')
  console.log(`💡 Place your document at: ${WORD_DOC_PATH}`)
  console.log('   Or edit the JSON file directly')
}

// Instructies
console.log('\n🎯 Next Steps:')
console.log('==============')
console.log('1. 📝 Edit your sources:')
console.log(`   - JSON file: ${TARGET_FILE}`)
console.log(`   - Word doc:  ${WORD_DOC_PATH}`)
console.log('')
console.log('2. 🔧 Customize sources:')
console.log('   - Add your own legal sources')
console.log('   - Set reliability levels (hoog/middel/laag)')
console.log('   - Add relevant keywords')
console.log('')
console.log('3. 🚀 Restart WetHelder:')
console.log('   - Sources are loaded automatically')
console.log('   - Check console for loading messages')
console.log('')
console.log('📚 For detailed instructions, see: BRONNEN_UPLOAD_INSTRUCTIES.md')

console.log('\n✨ Setup complete!') 