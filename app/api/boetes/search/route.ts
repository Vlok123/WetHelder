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
  }
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Zoekterm is vereist' },
        { status: 400 }
      )
    }

    // Zoek in feitcode, omschrijving en juridische grondslag
    const searchTerm = query.toLowerCase().trim()
    const results = mockBoeteData.filter(boete => 
      boete.feitcode.toLowerCase().includes(searchTerm) ||
      boete.omschrijving.toLowerCase().includes(searchTerm) ||
      boete.juridischeGrondslag.toLowerCase().includes(searchTerm) ||
      searchTerm.includes(boete.feitcode.toLowerCase())
    )

    // Sorteer resultaten: exacte feitcode matches eerst
    results.sort((a, b) => {
      const aExact = a.feitcode.toLowerCase() === searchTerm
      const bExact = b.feitcode.toLowerCase() === searchTerm
      
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      
      // Dan op boetebedrag (hoogste eerst)
      return b.standaardboete - a.standaardboete
    })

    return NextResponse.json({
      results,
      total: results.length,
      query: searchTerm,
      disclaimer: 'Gebaseerd op officiële Boetebase OM. Controleer altijd boetebase.om.nl voor actuele informatie.'
    })

  } catch (error) {
    console.error('Boetes search error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het zoeken' },
      { status: 500 }
    )
  }
} 