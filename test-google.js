const { searchGoogleCustom } = require('./lib/googleSearch.js');

console.log('Testing Google Search...');
console.log('API Key:', process.env.GOOGLE_API_KEY ? 'SET' : 'MISSING');
console.log('CSE ID:', process.env.GOOGLE_CSE_ID ? 'SET' : 'MISSING');

async function testSearch() {
  try {
    const results = await searchGoogleCustom('APV Nijmegen alcohol verbod');
    console.log('Results:', results.length, 'items found');
    if (results.length > 0) {
      console.log('First result:', results[0].title);
      console.log('URL:', results[0].link);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testSearch(); 