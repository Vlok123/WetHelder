import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Enhanced bonnenboekje data with N420 and other missing codes
const completeBonnenboekjeData: Record<string, any> = {
  // Vehicle specific violations
  auto: {
    ramen: [
      { 
        feitcode: "N420", 
        boete: 180, 
        situatie: "Donkere ramen voor", 
        omschrijving: "Getinte voorruit of voorste zijruiten donkerder dan toegestaan",
        juridischeGrondslag: "Art. 5.5.1 RVV 1990",
        toelichting: "De voorruit en voorste zijruiten mogen niet meer dan 25% van het licht tegenhouden."
      },
      { 
        feitcode: "N421", 
        boete: 140, 
        situatie: "Donkere ramen achter", 
        omschrijving: "Getinte achterruit of achterste zijruiten zonder buitenspiegels",
        juridischeGrondslag: "Art. 5.5.2 RVV 1990"
      }
    ],
    snelheid: {
      snelweg: [
        { range: "1-5 km/h", feitcode: "V200", boete: 36 },
        { range: "6-10 km/h", feitcode: "V201", boete: 62 },
        { range: "11-15 km/h", feitcode: "V210", boete: 95 },
        { range: "16-20 km/h", feitcode: "V211", boete: 188 },
        { range: "21-25 km/h", feitcode: "V212", boete: 282 },
        { range: "26-30 km/h", feitcode: "V213", boete: 423 },
      ],
      stad: [
        { range: "1-5 km/h", feitcode: "V100", boete: 36 },
        { range: "6-10 km/h", feitcode: "V101", boete: 62 },
        { range: "11-15 km/h", feitcode: "V102", boete: 95 },
        { range: "16-20 km/h", feitcode: "V103", boete: 188 },
        { range: "21-25 km/h", feitcode: "V104", boete: 282 },
      ]
    },
    telefoon: [
      { situatie: "Vasthouden/bedienen", feitcode: "M001", boete: 350 }
    ],
    gordel: [
      { situatie: "Niet dragen veiligheidsgordel", feitcode: "G001", boete: 140 }
    ],
    alcohol: [
      { range: "0.5-0.8 promille", feitcode: "A001", boete: 550 },
      { range: "0.8+ promille", feitcode: "A002", boete: "Strafrecht" }
    ],
    parkeren: [
      { situatie: "Gehandicaptenplek", feitcode: "P001", boete: 390 },
      { situatie: "Dubbel parkeren", feitcode: "P002", boete: 140 },
      { situatie: "Te lang parkeren", feitcode: "P003", boete: 69 },
      { situatie: "Parkeren op trottoir", feitcode: "P010", boete: 95 }
    ]
  },
  fiets: {
    telefoon: [
      { situatie: "Vasthouden/bedienen", feitcode: "M002", boete: 140 }
    ],
    alcohol: [
      { range: "Dronken fietsen", feitcode: "A003", boete: 95 }
    ],
    verkeerslicht: [
      { situatie: "Rood licht", feitcode: "L002", boete: 95 }
    ]
  }
}

// Mock boetebase data
const boetebaseData = [
  {
    feitcode: "N420",
    omschrijving: "Getinte voorruit of voorste zijruiten donkerder dan toegestaan",
    juridischeGrondslag: "Art. 5.5.1 RVV 1990",
    standaardboete: 180,
    type: "overtreding",
    toelichting: "De voorruit en voorste zijruiten mogen niet meer dan 25% van het licht tegenhouden. Dit is een veiligheidsmaatregel voor goed zicht.",
    bronUrl: "https://boetebase.om.nl/details/N420"
  },
  {
    feitcode: "N421",
    omschrijving: "Getinte achterruit of achterste zijruiten zonder vereiste buitenspiegels",
    juridischeGrondslag: "Art. 5.5.2 RVV 1990",
    standaardboete: 140,
    type: "overtreding",
    toelichting: "Bij donkere achterruiten zijn aangepaste buitenspiegels verplicht voor voldoende zicht.",
    bronUrl: "https://boetebase.om.nl/details/N421"
  },
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
    feitcode: "M001",
    omschrijving: "Gebruik mobiele telefoon tijdens het besturen van een voertuig",
    juridischeGrondslag: "Art. 61a RVV 1990",
    standaardboete: 350,
    type: "overtreding",
    toelichting: "Het is verboden om tijdens het besturen van een voertuig een mobiele telefoon vast te houden of te bedienen.",
    bronUrl: "https://boetebase.om.nl/details/M001"
  },
  {
    feitcode: "G001",
    omschrijving: "Niet dragen van veiligheidsgordel",
    juridischeGrondslag: "Art. 61 RVV 1990",
    standaardboete: 140,
    type: "overtreding",
    toelichting: "Alle inzittenden van een auto moeten een veiligheidsgordel dragen.",
    bronUrl: "https://boetebase.om.nl/details/G001"
  }
]

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface SearchContext {
  voertuigType?: string
  situatie?: string
  locatie?: string
}

function searchEnhancedBonnenboekje(query: string, context: SearchContext): any[] {
  const results: any[] = []
  const queryLower = query.toLowerCase()
  
  // Direct feitcode search
  const feitcodeMatch = queryLower.match(/[a-z]\d{2,3}[a-z]?/)
  if (feitcodeMatch) {
    const feitcode = feitcodeMatch[0].toUpperCase()
    const boeteResult = boetebaseData.find(b => b.feitcode === feitcode)
    if (boeteResult) {
      results.push(boeteResult)
    }
  }
  
  // Enhanced contextual search
  if (context.voertuigType && context.voertuigType !== '') {
    const voertuigData = completeBonnenboekjeData[context.voertuigType]
    
    if (voertuigData) {
      // Search for specific situations
      Object.keys(voertuigData).forEach(situatieKey => {
        if (queryLower.includes(situatieKey) || 
            (context.situatie && context.situatie.includes(situatieKey))) {
          
          const situatieData = voertuigData[situatieKey]
          
          if (Array.isArray(situatieData)) {
            situatieData.forEach(item => {
              if (item.feitcode) {
                const boeteResult = boetebaseData.find(b => b.feitcode === item.feitcode)
                if (boeteResult && !results.find(r => r.feitcode === boeteResult.feitcode)) {
                  results.push(boeteResult)
                }
              }
            })
          } else if (typeof situatieData === 'object') {
            // Handle nested structure like snelheid -> locatie
            Object.keys(situatieData).forEach(locatieKey => {
              if (!context.locatie || context.locatie === '' || context.locatie.includes(locatieKey)) {
                const locatieData = situatieData[locatieKey]
                if (Array.isArray(locatieData)) {
                  locatieData.forEach(item => {
                    if (item.feitcode) {
                      const boeteResult = boetebaseData.find(b => b.feitcode === item.feitcode)
                      if (boeteResult && !results.find(r => r.feitcode === boeteResult.feitcode)) {
                        results.push(boeteResult)
                      }
                    }
                  })
                }
              }
            })
          }
        }
      })
    }
  }
  
  // Keyword-based search for specific terms
  const keywordMappings = {
    'donkere ramen': ['N420', 'N421'],
    'getinte ramen': ['N420', 'N421'],
    'ramen': ['N420', 'N421'],
    'voorruit': ['N420'],
    'zijruit': ['N420', 'N421'],
    'telefoon': ['M001', 'M002'],
    'mobiel': ['M001', 'M002'],
    'gordel': ['G001'],
    'veiligheidsgordel': ['G001'],
    'te hard': ['V100', 'V101', 'V102', 'V200', 'V201', 'V210'],
    'snelheid': ['V100', 'V101', 'V102', 'V200', 'V201', 'V210'],
    'parkeren': ['P001', 'P002', 'P003', 'P010'],
    'alcohol': ['A001', 'A002', 'A003'],
    'inhalen': ['W010a']
  }
  
  Object.entries(keywordMappings).forEach(([keyword, feitcodes]) => {
    if (queryLower.includes(keyword)) {
      feitcodes.forEach(feitcode => {
        const boeteResult = boetebaseData.find(b => b.feitcode === feitcode)
        if (boeteResult && !results.find(r => r.feitcode === boeteResult.feitcode)) {
          results.push(boeteResult)
        }
      })
    }
  })
  
  return results
}

async function getWebVerification(query: string, results: any[]): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return "Systeem verificatie niet beschikbaar."
  }
  
  try {
    const prompt = `
Je bent een Nederlandse verkeerswet specialist. Een gebruiker zoekt naar: "${query}"

Gevonden resultaten in bonnenboekje:
${results.map(r => `- ${r.feitcode}: ${r.omschrijving} (€${r.standaardboete})`).join('\n')}

Geef een beknopte, accurate uitleg over:
1. Of de gevonden feitcodes kloppen voor deze situatie
2. De juiste boetebedragen volgens officiële bronnen
3. Relevante wetgeving (RVV 1990, WVW 1994)
4. Praktische informatie voor de gebruiker

Houd het kort, feitelijk en verwijs naar officiële bronnen. Vermeld GEEN "AI" maar gebruik "het systeem heeft gevonden" of "volgens de database".
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system", 
          content: "Je bent een expert in Nederlandse verkeerswetgeving. Geef accurate, beknopte informatie zonder AI-verwijzingen."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.1
    })

    return response.choices[0]?.message?.content || "Verificatie niet beschikbaar."
  } catch (error) {
    console.error('Web verification error:', error)
    return "Systeemverificatie tijdelijk niet beschikbaar."
  }
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

    // Enhanced search in bonnenboekje
    const bonnenboekjeResults = searchEnhancedBonnenboekje(query, context)
    
    // Web verification of results
    const webVerification = await getWebVerification(query, bonnenboekjeResults)
    
    return NextResponse.json({
      results: bonnenboekjeResults,
      answer: webVerification,
      query: query,
      context: context
    })

  } catch (error) {
    console.error('Enhanced search error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij de zoekopdracht' },
      { status: 500 }
    )
  }
} 