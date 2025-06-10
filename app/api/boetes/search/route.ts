import { NextRequest, NextResponse } from 'next/server'

// Mock data gebaseerd op officiële Boetebase OM structuur
const mockBoeteData = [
  {
    feitcode: 'R614',
    omschrijving: 'Rechts inhalen op autosnelweg',
    juridischeGrondslag: 'Art. 19 lid 1 RVV 1990',
    standaardboete: 239,
    type: 'overtreding',
    toelichting: 'Het is verboden om rechts in te halen op autowegen, tenzij specifiek toegestaan.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'W010a',
    omschrijving: 'Rijden onder invloed van alcohol (130-220 µg/l)',
    juridischeGrondslag: 'Art. 8 lid 1 WVW 1994',
    standaardboete: 350,
    type: 'misdrijf',
    toelichting: 'Alcoholpromillage tussen 0,54‰ en 0,8‰ (130-220 µg/l uitgeademde lucht).',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'S099',
    omschrijving: 'Te hard rijden 21-30 km/h binnen bebouwde kom',
    juridischeGrondslag: 'Art. 20 RVV 1990',
    standaardboete: 165,
    type: 'overtreding',
    toelichting: 'Snelheidsovertreding van 21 tot 30 km/h te hard binnen de bebouwde kom.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'G101',
    omschrijving: 'Niet dragen van gordel als bestuurder',
    juridischeGrondslag: 'Art. 59 RVV 1990',
    standaardboete: 95,
    type: 'overtreding',
    toelichting: 'Bestuurder draagt geen veiligheidsgordel.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'M089',
    omschrijving: 'Gebruik mobiele telefoon tijdens het rijden',
    juridischeGrondslag: 'Art. 61a RVV 1990',
    standaardboete: 350,
    type: 'overtreding',
    toelichting: 'Vasthouden van mobiele telefoon of ander elektronisch apparaat tijdens het rijden.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'P201',
    omschrijving: 'Parkeren in gehandicaptenparkeerplaats',
    juridischeGrondslag: 'Art. 24 lid 3 RVV 1990',
    standaardboete: 370,
    type: 'overtreding',
    toelichting: 'Parkeren op een plaats bestemd voor gehandicapten zonder geldige parkeerkaart.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'L015',
    omschrijving: 'Rijden door rood licht',
    juridischeGrondslag: 'Art. 68 lid 1 RVV 1990',
    standaardboete: 260,
    type: 'overtreding',
    toelichting: 'Niet stoppen voor rood verkeerslicht.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'E340',
    omschrijving: 'Milieusticker ontbreekt',
    juridischeGrondslag: 'Art. 9.2.2.9 Wabo',
    standaardboete: 150,
    type: 'overtreding',
    toelichting: 'Geen geldige milieusticker in een milieuzone.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'V045',
    omschrijving: 'Voorrang verlenen negeren',
    juridischeGrondslag: 'Art. 15 RVV 1990',
    standaardboete: 230,
    type: 'overtreding',
    toelichting: 'Niet verlenen van voorrang aan verkeer dat voorrang heeft.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'A120',
    omschrijving: 'APV overtreding - wildplassen',
    juridischeGrondslag: 'Gemeentelijke APV',
    standaardboete: 140,
    type: 'overtreding',
    toelichting: 'Urineren op openbare plaatsen (varieert per gemeente).',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'K055',
    omschrijving: 'Rijden zonder rijbewijs',
    juridischeGrondslag: 'Art. 107 WVW 1994',
    standaardboete: 370,
    type: 'overtreding',
    toelichting: 'Rijden zonder geldig rijbewijs.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'A089',
    omschrijving: 'Open vuur/BBQ op openbare plaats',
    juridischeGrondslag: 'Gemeentelijke APV',
    standaardboete: 160,
    type: 'overtreding',
    toelichting: 'Het is verboden om open vuur te maken of te barbecueën op openbare plaatsen zonder toestemming.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'S089',
    omschrijving: 'Snelheidsovertreding 1-10 km/h binnen bebouwde kom',
    juridischeGrondslag: 'Art. 20 RVV 1990',
    standaardboete: 30,
    type: 'overtreding',
    toelichting: 'Te hard rijden binnen de bebouwde kom.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'S099',
    omschrijving: 'Snelheidsovertreding 11-20 km/h binnen bebouwde kom',
    juridischeGrondslag: 'Art. 20 RVV 1990',
    standaardboete: 70,
    type: 'overtreding',
    toelichting: 'Te hard rijden binnen de bebouwde kom.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'M089',
    omschrijving: 'Mobiel bellen tijdens rijden',
    juridischeGrondslag: 'Art. 61a RVV 1990',
    standaardboete: 350,
    type: 'overtreding',
    toelichting: 'Vasthouden van mobiele telefoon tijdens het rijden.',
    bronUrl: 'https://boetebase.om.nl'
  },
  // Uitgebreide APV overtredingen
  {
    feitcode: 'A001',
    omschrijving: 'Hinderlijk gedrag op openbare plaats',
    juridischeGrondslag: 'Gemeentelijke APV',
    standaardboete: 95,
    type: 'overtreding',
    toelichting: 'Gedragingen die andere personen hinderen of overlast veroorzaken.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'A025',
    omschrijving: 'Kamperen op niet-toegestane plaats',
    juridischeGrondslag: 'Gemeentelijke APV',
    standaardboete: 230,
    type: 'overtreding',
    toelichting: 'Overnachten in tent, caravan of voertuig op openbare grond zonder vergunning.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'A050',
    omschrijving: 'Venten zonder vergunning',
    juridischeGrondslag: 'Gemeentelijke APV',
    standaardboete: 325,
    type: 'overtreding',
    toelichting: 'Handelen in goederen op openbare plaatsen zonder vereiste vergunning.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'A075',
    omschrijving: 'Hondenpoep niet opruimen',
    juridischeGrondslag: 'Gemeentelijke APV',
    standaardboete: 75,
    type: 'overtreding',
    toelichting: 'Eigenaar laat uitwerpselen van hond achter op openbare plaats.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'A095',
    omschrijving: 'Parkeren in park/plantsoen',
    juridischeGrondslag: 'Gemeentelijke APV',
    standaardboete: 90,
    type: 'overtreding',
    toelichting: 'Motorvoertuig parkeren in park, plantsoen of groenstrook.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'A110',
    omschrijving: 'Afval dumpen/zwerfvuil',
    juridischeGrondslag: 'Gemeentelijke APV',
    standaardboete: 140,
    type: 'overtreding',
    toelichting: 'Afval achterlaten op openbare plaatsen buiten daarvoor bestemde voorzieningen.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'A135',
    omschrijving: 'Hond los lopen in verboden gebied',
    juridischeGrondslag: 'Gemeentelijke APV',
    standaardboete: 140,
    type: 'overtreding',
    toelichting: 'Hond niet aangelijnd houden waar dit verplicht is.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'A150',
    omschrijving: 'Geluidshinder/geluidsoverlast',
    juridischeGrondslag: 'Gemeentelijke APV',
    standaardboete: 160,
    type: 'overtreding',
    toelichting: 'Veroorzaken van hinderlijk geluid voor omwonenden.',
    bronUrl: 'https://boetebase.om.nl'
  },
  {
    feitcode: 'A175',
    omschrijving: 'Klimmen op monumenten/gebouwen',
    juridischeGrondslag: 'Gemeentelijke APV',
    standaardboete: 95,
    type: 'overtreding',
    toelichting: 'Klimmen op of betreden van monumenten, standbeelden of openbare gebouwen.',
    bronUrl: 'https://boetebase.om.nl'
  }
]

// Function to detect APV context words and municipality names
function detectAPVContext(query: string) {
  const apvKeywords = [
    'barbecue', 'bbq', 'park', 'open vuur', 'gemeente', 'wildplassen', 
    'hond', 'hondenpoep', 'kamperen', 'venten', 'afval', 'zwerfvuil',
    'geluidshinder', 'overlast', 'hinderlijk', 'klimmen', 'monument',
    'plantsoen', 'groenstrook', 'openbare plaats', 'apv'
  ];
  const municipalities = ['amsterdam', 'rotterdam', 'den haag', 'utrecht', 'eindhoven', 'tilburg', 'groningen', 'nijmegen'];
  
  const detectedKeywords = apvKeywords.filter(keyword => 
    query.toLowerCase().includes(keyword.toLowerCase())
  );
  const detectedMunicipalities = municipalities.filter(municipality => 
    query.toLowerCase().includes(municipality.toLowerCase())
  );
  
  return { detectedKeywords, detectedMunicipalities };
}

// Enhance the search logic
export async function POST(request: NextRequest) {
  try {
    const { query } = (await request.json()) as { query: string };
    const { detectedKeywords, detectedMunicipalities } = detectAPVContext(query);
    
    let results = mockBoeteData.filter(boete =>
      boete.feitcode.toLowerCase().includes(query.toLowerCase()) ||
      boete.omschrijving.toLowerCase().includes(query.toLowerCase()) ||
      boete.toelichting?.toLowerCase().includes(query.toLowerCase())
    );

    // If APV context is detected, prioritize and filter APV results
    if (detectedKeywords.length > 0) {
      const apvResults = results.filter(boete => boete.juridischeGrondslag.includes('APV'));
      const nonApvResults = results.filter(boete => !boete.juridischeGrondslag.includes('APV'));
      
      // Prioritize APV results when APV keywords are detected
      results = [...apvResults, ...nonApvResults];
      
      // Add municipality context information if detected
      if (detectedMunicipalities.length > 0) {
        console.log(`APV zoekopdracht voor gemeente(n): ${detectedMunicipalities.join(', ')}`);
        // In a real implementation, you would fetch municipality-specific APV rules here
      }
    }

    // Sort results by relevance (exact matches first, then partial matches)
    results.sort((a, b) => {
      const aExactMatch = a.feitcode.toLowerCase() === query.toLowerCase() ||
                         a.omschrijving.toLowerCase() === query.toLowerCase();
      const bExactMatch = b.feitcode.toLowerCase() === query.toLowerCase() ||
                         b.omschrijving.toLowerCase() === query.toLowerCase();
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // APV results get priority when APV keywords are detected
      if (detectedKeywords.length > 0) {
        const aIsApv = a.juridischeGrondslag.includes('APV');
        const bIsApv = b.juridischeGrondslag.includes('APV');
        
        if (aIsApv && !bIsApv) return -1;
        if (!aIsApv && bIsApv) return 1;
      }
      
      return 0;
    });

    return NextResponse.json({ 
      results,
      searchContext: {
        detectedKeywords,
        detectedMunicipalities,
        isApvSearch: detectedKeywords.length > 0
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Error processing search query' }, { status: 500 });
  }
} 