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
]

// Function to detect APV context words and municipality names
function detectAPVContext(query: string) {
  const apvKeywords = ['barbecue', 'park', 'open vuur', 'bbq', 'gemeente'];
  const municipalities = ['Nijmegen', 'Amsterdam', 'Rotterdam']; // Example list, should be expanded
  const detectedKeywords = apvKeywords.filter(keyword => query.toLowerCase().includes(keyword));
  const detectedMunicipalities = municipalities.filter(municipality => query.toLowerCase().includes(municipality.toLowerCase()));
  return { detectedKeywords, detectedMunicipalities };
}

// Enhance the search logic
export async function POST(request: NextRequest) {
  try {
    const { query } = (await request.json()) as { query: string };
    const { detectedKeywords, detectedMunicipalities } = detectAPVContext(query);
    let results = mockBoeteData.filter(boete =>
      boete.feitcode.toLowerCase().includes(query.toLowerCase()) ||
      boete.omschrijving.toLowerCase().includes(query.toLowerCase())
    );

    // If APV context is detected, filter results accordingly
    if (detectedKeywords.length > 0) {
      results = results.filter(boete => boete.juridischeGrondslag.includes('APV'));
    }

    // If a municipality is detected, add municipality-specific logic
    if (detectedMunicipalities.length > 0) {
      // Example: Add logic to fetch municipality-specific APV rules
      // This is a placeholder for actual implementation
      console.log(`Detected municipality: ${detectedMunicipalities.join(', ')}`);
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Error processing search query' }, { status: 500 });
  }
} 