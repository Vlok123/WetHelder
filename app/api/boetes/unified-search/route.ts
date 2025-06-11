import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Mock boetebase data - in production this would connect to the actual API
const boetebaseData = [
  {
    feitcode: "W010a",
    omschrijving: "Rechts inhalen van een ander voertuig",
    juridischeGrondslag: "Art. 18 lid 1 RVV 1990",
    standaardboete: 290,
    type: "overtreding",
    toelichting: "Het is verboden om rechts in te halen, behalve in specifieke situaties zoals aangegeven in de verkeersregels.",
    bronUrl: "https://boetebase.om.nl/details/W010a"
  },
  {
    feitcode: "V100",
    omschrijving: "Snelheidsovertreding 1-5 km/h te hard binnen bebouwde kom",
    juridischeGrondslag: "Art. 20 RVV 1990",
    standaardboete: 36,
    type: "overtreding",
    toelichting: "Snelheidsovertreding binnen de bebouwde kom tussen 1 en 5 km/h boven de toegestane snelheid.",
    bronUrl: "https://boetebase.om.nl/details/V100"
  },
  {
    feitcode: "V101",
    omschrijving: "Snelheidsovertreding 6-10 km/h te hard binnen bebouwde kom",
    juridischeGrondslag: "Art. 20 RVV 1990",
    standaardboete: 62,
    type: "overtreding",
    toelichting: "Snelheidsovertreding binnen de bebouwde kom tussen 6 en 10 km/h boven de toegestane snelheid.",
    bronUrl: "https://boetebase.om.nl/details/V101"
  },
  {
    feitcode: "V102",
    omschrijving: "Snelheidsovertreding 11-15 km/h te hard binnen bebouwde kom",
    juridischeGrondslag: "Art. 20 RVV 1990",
    standaardboete: 95,
    type: "overtreding",
    toelichting: "Snelheidsovertreding binnen de bebouwde kom tussen 11 en 15 km/h boven de toegestane snelheid.",
    bronUrl: "https://boetebase.om.nl/details/V102"
  },
  {
    feitcode: "V200",
    omschrijving: "Snelheidsovertreding 1-5 km/h te hard buiten bebouwde kom",
    juridischeGrondslag: "Art. 20 RVV 1990",
    standaardboete: 36,
    type: "overtreding",
    toelichting: "Snelheidsovertreding buiten de bebouwde kom tussen 1 en 5 km/h boven de toegestane snelheid.",
    bronUrl: "https://boetebase.om.nl/details/V200"
  },
  {
    feitcode: "V210",
    omschrijving: "Snelheidsovertreding 11-15 km/h te hard op snelweg",
    juridischeGrondslag: "Art. 20 RVV 1990", 
    standaardboete: 95,
    type: "overtreding",
    toelichting: "Snelheidsovertreding op snelweg tussen 11 en 15 km/h boven de toegestane snelheid.",
    bronUrl: "https://boetebase.om.nl/details/V210"
  },
  {
    feitcode: "M001",
    omschrijving: "Gebruik mobiele telefoon tijdens het besturen van een voertuig",
    juridischeGrondslag: "Art. 61a RVV 1990",
    standaardboete: 350,
    type: "overtreding",
    toelichting: "Het is verboden om tijdens het besturen van een voertuig een mobiele telefoon vast te houden of te bedienen.",
    bronUrl: "https://boetebase.om.nl/details/M001"
  },
  {
    feitcode: "A001",
    omschrijving: "Rijden onder invloed van alcohol (0,5-0,8 promille)",
    juridischeGrondslag: "Art. 8 WVW 1994",
    standaardboete: 550,
    type: "overtreding",
    toelichting: "Besturen van een motorvoertuig onder invloed van alcohol met een ademalcoholgehalte tussen 220-350 µg/l.",
    bronUrl: "https://boetebase.om.nl/details/A001"
  },
  {
    feitcode: "P001",
    omschrijving: "Parkeren op een plaats bestemd voor gehandicapten",
    juridischeGrondslag: "Art. 25 RVV 1990",
    standaardboete: 390,
    type: "overtreding",
    toelichting: "Parkeren op een parkeerplaats die specifiek is bestemd voor gehandicapten zonder geldige vergunning.",
    bronUrl: "https://boetebase.om.nl/details/P001"
  },
  {
    feitcode: "L001",
    omschrijving: "Door rood licht rijden",
    juridischeGrondslag: "Art. 68 RVV 1990",
    standaardboete: 280,
    type: "overtreding",
    toelichting: "Het negeren van een rood verkeerslicht en doorrijden terwijl het licht op rood staat.",
    bronUrl: "https://boetebase.om.nl/details/L001"
  }
]

// Type definitions
interface BonnenboekjeItem {
  feitcode: string
  boete: number | string
  range?: string
  situatie?: string
}

interface SearchContext {
  voertuigType?: string
  situatie?: string
  locatie?: string
}

// Enhanced bonnenboekje data with context mapping
const bonnenboekjeData: Record<string, any> = {
  snelheid: {
    auto: {
      snelweg: [
        { range: "1-5 km/h", feitcode: "V200", boete: 36 },
        { range: "6-10 km/h", feitcode: "V201", boete: 62 },
        { range: "11-15 km/h", feitcode: "V210", boete: 95 },
        { range: "16-20 km/h", feitcode: "V211", boete: 188 },
        { range: "21-25 km/h", feitcode: "V212", boete: 282 },
      ] as BonnenboekjeItem[],
      stad: [
        { range: "1-5 km/h", feitcode: "V100", boete: 36 },
        { range: "6-10 km/h", feitcode: "V101", boete: 62 },
        { range: "11-15 km/h", feitcode: "V102", boete: 95 },
        { range: "16-20 km/h", feitcode: "V103", boete: 188 },
        { range: "21-25 km/h", feitcode: "V104", boete: 282 },
      ] as BonnenboekjeItem[]
    },
    fiets: {
      stad: [
        { range: "Te hard fietsen", feitcode: "F001", boete: 95 }
      ] as BonnenboekjeItem[]
    }
  },
  telefoon: {
    auto: [
      { situatie: "Vasthouden/bedienen", feitcode: "M001", boete: 350 }
    ] as BonnenboekjeItem[],
    fiets: [
      { situatie: "Vasthouden/bedienen", feitcode: "M002", boete: 140 }
    ] as BonnenboekjeItem[]
  },
  alcohol: {
    auto: [
      { range: "0.5-0.8 promille", feitcode: "A001", boete: 550 },
      { range: "0.8+ promille", feitcode: "A002", boete: "Strafrecht" }
    ] as BonnenboekjeItem[],
    fiets: [
      { range: "Dronken fietsen", feitcode: "A003", boete: 95 }
    ] as BonnenboekjeItem[]
  },
  parkeren: {
    auto: [
      { situatie: "Gehandicaptenplek", feitcode: "P001", boete: 390 },
      { situatie: "Dubbel parkeren", feitcode: "P002", boete: 140 },
      { situatie: "Te lang parkeren", feitcode: "P003", boete: 69 }
    ] as BonnenboekjeItem[]
  },
  verkeerslicht: {
    auto: [
      { situatie: "Rood licht", feitcode: "L001", boete: 280 }
    ] as BonnenboekjeItem[],
    fiets: [
      { situatie: "Rood licht", feitcode: "L002", boete: 95 }
    ] as BonnenboekjeItem[]
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function searchBoetebase(query: string): any[] {
  const searchTerms = query.toLowerCase().split(' ')
  
  return boetebaseData.filter(boete => {
    const searchText = `${boete.feitcode} ${boete.omschrijving} ${boete.toelichting}`.toLowerCase()
    return searchTerms.some(term => searchText.includes(term))
  })
}

function searchBonnenboekje(context: SearchContext): BonnenboekjeItem[] {
  const results: BonnenboekjeItem[] = []
  
  // Map context to bonnenboekje data
  if (context.situatie && context.voertuigType) {
    const situatieData = bonnenboekjeData[context.situatie]
    
    if (situatieData && typeof situatieData === 'object') {
      const voertuigData = situatieData[context.voertuigType]
      
      if (voertuigData) {
        if (context.locatie && voertuigData[context.locatie]) {
          // Handle nested structure like snelheid -> auto -> snelweg
          const locatieData = voertuigData[context.locatie]
          if (Array.isArray(locatieData)) {
            results.push(...locatieData)
          }
        } else if (Array.isArray(voertuigData)) {
          results.push(...voertuigData)
        }
      }
    }
  }
  
  return results
}

function extractFeitcodes(text: string): string[] {
  // Extract feitcode patterns (e.g., W010a, V100, M001)
  const feitcodePattern = /[A-Z]\d{2,3}[a-z]?/g
  const matches = text.match(feitcodePattern) || []
  return [...new Set(matches)] // Remove duplicates
}

export async function POST(request: NextRequest) {
  try {
    const { query, context = {} } = await request.json()
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      )
    }

    // Extract feitcodes from query
    const detectedFeitcodes = extractFeitcodes(query)
    
    // Search in boetebase
    const boetebaseResults = searchBoetebase(query)
    
    // Search in bonnenboekje using context
    const bonnenboekjeResults = searchBonnenboekje(context)
    
    // Create comprehensive prompt for AI analysis
    const contextInfo = `
Voertuig: ${context.voertuigType || 'niet gespecificeerd'}
Situatie: ${context.situatie || 'niet gespecificeerd'}  
Locatie: ${context.locatie || 'niet gespecificeerd'}
Gedetecteerde feitcodes: ${detectedFeitcodes.join(', ') || 'geen'}
`

    const boetebaseInfo = boetebaseResults.length > 0 
      ? `Gevonden in Boetebase:\n${boetebaseResults.map(b => 
          `- ${b.feitcode}: ${b.omschrijving} (€${b.standaardboete})`
        ).join('\n')}`
      : ''

    const bonnenboekjeInfo = bonnenboekjeResults.length > 0
      ? `Gevonden in Bonnenboekje:\n${bonnenboekjeResults.map(b => 
          `- ${b.feitcode}: ${b.range || b.situatie} (€${b.boete})`
        ).join('\n')}`
      : ''

    const systemPrompt = `Je bent een juridische assistent gespecialiseerd in Nederlandse verkeersovertredingen. 
Je hebt toegang tot de officiële Boetebase OM en het bonnenboekje.

Instructies:
1. Geef ALTIJD concrete feitcodes in je antwoord wanneer mogelijk
2. Verwijs naar specifieke boetebedragen
3. Leg uit wat de overtreding inhoudt
4. Geef context-specifiek advies gebaseerd op voertuigtype en situatie
5. Wees altijd accuraat en verwijs naar officiële bronnen
6. Als je geen exacte match vindt, geef dan gerelateerde informatie

Gebruik deze brongegevens:
${contextInfo}
${boetebaseInfo}
${bonnenboekjeInfo}

Vraag van gebruiker: ${query}`

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: query
        }
      ],
      max_tokens: 1000,
      temperature: 0.2, // Lower temperature for more consistent, factual responses
    })

    const aiAnswer = completion.choices[0]?.message?.content || 
      'Kon geen specifiek antwoord genereren. Controleer de officiële Boetebase voor actuele informatie.'

    // Combine and deduplicate results
    const allResults = [...boetebaseResults]
    
    // Add feitcode-specific results if found
    for (const feitcode of detectedFeitcodes) {
      const specificResult = boetebaseData.find(b => b.feitcode === feitcode)
      if (specificResult && !allResults.some(r => r.feitcode === feitcode)) {
        allResults.push(specificResult)
      }
    }

    return NextResponse.json({
      answer: aiAnswer,
      results: allResults,
      feitcodes: detectedFeitcodes,
      context: context,
      sources: {
        boetebase: boetebaseResults.length,
        bonnenboekje: bonnenboekjeResults.length,
        detectedFeitcodes: detectedFeitcodes.length
      }
    })

  } catch (error) {
    console.error('Unified search error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het zoeken' },
      { status: 500 }
    )
  }
} 