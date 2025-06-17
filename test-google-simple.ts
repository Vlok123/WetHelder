console.log('=== Environment Variables Test ===');
console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? 'SET (' + process.env.GOOGLE_API_KEY.substring(0, 20) + '...)' : 'MISSING');
console.log('GOOGLE_CSE_ID:', process.env.GOOGLE_CSE_ID ? 'SET (' + process.env.GOOGLE_CSE_ID + ')' : 'MISSING');

async function testGoogleAPI() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cx) {
    console.error('❌ Missing API credentials');
    return;
  }

  const query = 'APV Nijmegen alcohol verbod';
  console.log(`\n🔍 Testing Google Custom Search for: "${query}"`);

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=3`;
    console.log('API URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));

    const response = await fetch(url);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\n✅ API Response:');
    console.log('Total results:', data.searchInformation?.totalResults || 'Unknown');
    console.log('Found items:', data.items?.length || 0);
    
    if (data.items && data.items.length > 0) {
      console.log('\nFirst result:');
      console.log('Title:', data.items[0].title);
      console.log('URL:', data.items[0].link);
      console.log('Snippet:', data.items[0].snippet.substring(0, 100) + '...');
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

testGoogleAPI(); 