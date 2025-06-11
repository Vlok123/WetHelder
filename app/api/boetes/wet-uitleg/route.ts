import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Define proper types for the legal database
interface LegalArticle {
  title: string
  content: string
  related: string[]
}

interface LegalLaw {
  name: string
  url: string
  keyArticles: Record<string, LegalArticle>
}

// Legal database with key Dutch traffic laws
const legalDatabase: Record<string, LegalLaw> = {
  "RVV 1990": {
    name: "Reglement verkeersregels en verkeerstekens 1990",
    url: "https://wetten.overheid.nl/BWBR0004825",
    keyArticles: {
      "artikel 20": {
        title: "Snelheidsbepalingen",
        content: "Bepaalt de maximumsnelheden binnen en buiten bebouwde kom, op autowegen en autosnelwegen.",
        related: ["V100-serie", "V200-serie", "snelheidsboetes"]
      },
      "artikel 18": {
        title: "Inhaalverbod en inhaalregels",
        content: "Regelt wanneer en hoe ingehaald mag worden, inclusief het verbod op rechts inhalen.",
        related: ["W010a", "inhalen"]
      },
      "artikel 61a": {
        title: "Mobiele telefoon",
        content: "Verbiedt het vasthouden of bedienen van mobiele apparaten tijdens het besturen.",
        related: ["M001", "M002", "telefoongebruik"]
      },
      "artikel 61": {
        title: "Veiligheidsgordel",
        content: "Verplicht het dragen van veiligheidsgordels voor alle inzittenden.",
        related: ["G001", "gordel"]
      },
      "artikel 5.5": {
        title: "Getinte ruiten",
        content: "Regelt de toegestane lichttransmissie van voertuigruiten voor verkeersveiligheid.",
        related: ["N420", "N421", "getinte ramen"]
      },
      "artikel 68": {
        title: "Verkeerslichten",
        content: "Bepaalt de verplichtingen bij verkeerslichten en de betekenis van signalen.",
        related: ["L001", "L002", "rood licht"]
      }
    }
  },
  "WVW 1994": {
    name: "Wegenverkeerswet 1994",
    url: "https://wetten.overheid.nl/BWBR0006622",
    keyArticles: {
      "artikel 8": {
        title: "Rijden onder invloed",
        content: "Strafbaarstelling van rijden onder invloed van alcohol, drugs of medicijnen.",
        related: ["A001", "A002", "alcohol", "drugs"]
      },
      "artikel 5": {
        title: "Rijbevoegdheid en rijbewijsplicht",
        content: "Regelt de vereisten voor het besturen van voertuigen en rijbewijsplicht.",
        related: ["rijbewijs", "bestuurders"]
      },
      "artikel 6": {
        title: "Verkeersovertredingen",
        content: "Algemene bepalingen over verkeersovertredingen en sancties.",
        related: ["boetes", "sancties"]
      }
    }
  },
  "Wetboek van Strafrecht": {
    name: "Wetboek van Strafrecht - Verkeersmisdrijven",
    url: "https://wetten.overheid.nl/BWBR0001854",
    keyArticles: {
      "artikel 6": {
        title: "Dood door schuld in verkeer",
        content: "Strafbaarstelling van het veroorzaken van de dood door schuld in het verkeer.",
        related: ["dodelijk ongeval", "schuld"]
      },
      "artikel 307": {
        title: "Zware lichamelijke mishandeling in verkeer",
        content: "Strafbaarstelling van het veroorzaken van zwaar lichamelijk letsel in het verkeer.",
        related: ["zwaar letsel", "verkeersongeval"]
      }
    }
  }
}

// EU regulations and international standards
const internationalRegulations = {
  "EU Richtlijn 2008/96/EG": {
    name: "EU Wegveiligheidsrichtlijn",
    content: "Europese standaarden voor wegveiligheid en verkeersveiligheidsmanagement."
  },
  "VN/ECE Reglement 43": {
    name: "UN/ECE Regulation 43 - Safety glazing",
    content: "Internationale standaarden voor veiligheidsglas in voertuigen, inclusief lichttransmissie."
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface SearchContext {
  voertuigType?: string
  situatie?: string
  locatie?: string
}

function searchLegalDatabase(query: string): any {
  const queryLower = query.toLowerCase()
  const results: any = {
    laws: [],
    articles: [],
    regulations: []
  }
  
  // Search through legal database
  Object.entries(legalDatabase).forEach(([lawKey, lawData]) => {
    // Check if law name is mentioned
    if (queryLower.includes(lawKey.toLowerCase()) || 
        queryLower.includes(lawData.name.toLowerCase())) {
      results.laws.push({
        key: lawKey,
        name: lawData.name,
        url: lawData.url
      })
    }
    
    // Search through articles
    Object.entries(lawData.keyArticles).forEach(([articleKey, articleData]) => {
      if (queryLower.includes(articleKey.toLowerCase()) ||
          queryLower.includes(articleData.title.toLowerCase()) ||
          articleData.related.some(term => queryLower.includes(term.toLowerCase()))) {
        results.articles.push({
          law: lawKey,
          article: articleKey,
          title: articleData.title,
          content: articleData.content,
          related: articleData.related,
          url: lawData.url
        })
      }
    })
  })
  
  // Keyword-based search for common terms
  const legalKeywords: Record<string, string[]> = {
    'snelheid': ['RVV 1990 artikel 20'],
    'alcohol': ['WVW 1994 artikel 8'],
    'telefoon': ['RVV 1990 artikel 61a'],
    'inhalen': ['RVV 1990 artikel 18'],
    'gordel': ['RVV 1990 artikel 61'],
    'ramen': ['RVV 1990 artikel 5.5'],
    'getint': ['RVV 1990 artikel 5.5'],
    'verkeerslicht': ['RVV 1990 artikel 68'],
    'rood licht': ['RVV 1990 artikel 68'],
    'parkeren': ['RVV 1990 artikel 23-25'],
    'voorrang': ['RVV 1990 artikel 15-17']
  }
  
  Object.entries(legalKeywords).forEach(([keyword, references]) => {
    if (queryLower.includes(keyword)) {
      references.forEach(ref => {
        if (!results.articles.find((a: any) => a.article === ref)) {
          // Add reference to search if not already found
          const [law, article] = ref.split(' artikel ')
          if (legalDatabase[law]) {
            const lawData = legalDatabase[law]
            const articleData = lawData.keyArticles[`artikel ${article}`]
            if (articleData) {
              results.articles.push({
                law: law,
                article: `artikel ${article}`,
                title: articleData.title,
                content: articleData.content,
                related: articleData.related,
                url: lawData.url
              })
            }
          }
        }
      })
    }
  })
  
  return results
}

async function generateLegalExplanation(query: string, searchResults: any, context: SearchContext): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return "Wetgeving uitleg tijdelijk niet beschikbaar."
  }
  
  try {
    const prompt = `
Je bent een Nederlandse juridisch expert gespecialiseerd in verkeersrecht. Een gebruiker vraagt naar: "${query}"

Context:
- Voertuig: ${context.voertuigType || 'niet gespecificeerd'}
- Situatie: ${context.situatie || 'niet gespecificeerd'}
- Locatie: ${context.locatie || 'niet gespecificeerd'}

Gevonden wetgeving:
${searchResults.laws.map((l: any) => `- ${l.key}: ${l.name}`).join('\n')}

Relevante artikelen:
${searchResults.articles.map((a: any) => `- ${a.law} ${a.article}: ${a.title} - ${a.content}`).join('\n')}

Geef een uitgebreide, professionele uitleg over:
1. De relevante wetgeving en artikelen
2. Juridische achtergrond en betekenis
3. Praktische toepassing
4. Gerelateerde regelgeving
5. Recente wijzigingen of jurisprudentie (indien relevant)

Gebruik een heldere structuur met koppen. Verwijs naar specifieke wetsartikelen met de juiste bronnen. 
Vermeld GEEN "AI" maar presenteer als professionele juridische informatie.
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system", 
          content: "Je bent een expert in Nederlandse verkeersrecht en wetgeving. Geef uitgebreide, accurate juridische informatie met bronvermelding."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.1
    })

    return response.choices[0]?.message?.content || "Juridische uitleg niet beschikbaar."
  } catch (error) {
    console.error('Legal explanation error:', error)
    return "Juridische uitleg tijdelijk niet beschikbaar."
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

    // Search legal database
    const searchResults = searchLegalDatabase(query)
    
    // Generate comprehensive legal explanation
    const legalExplanation = await generateLegalExplanation(query, searchResults, context)
    
    return NextResponse.json({
      explanation: legalExplanation,
      searchResults: searchResults,
      query: query,
      context: context
    })

  } catch (error) {
    console.error('Legal search error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het opzoeken van wetgeving' },
      { status: 500 }
    )
  }
} 