const { testJsonSourcesLoading } = require('../lib/jsonSources.ts')

async function runTest() {
  console.log('🚀 Starting JSON Sources Test\n')
  
  try {
    await testJsonSourcesLoading()
    console.log('\n🎉 Test geslaagd!')
    process.exit(0)
  } catch (error) {
    console.error('\n💥 Test gefaald:', error)
    process.exit(1)
  }
}

runTest() 