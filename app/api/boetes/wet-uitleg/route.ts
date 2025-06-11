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

function getProfileContextForBoetes(profile?: string): string {
  switch (profile) {
    case 'burger':
      return `
DOELGROEP: Burger/Particulier

ANTWOORDSTIJL:
- Begrijpelijke uitleg zonder juridisch jargon
- Focus op praktische gevolgen voor dagelijks leven
- Concrete voorbeelden en situaties
- Wat betekent dit voor u als automobilist/weggebruiker?
- Heldere uitleg van rechten en plichten
- Praktische tips voor naleving

STRUCTUUR:
1. Wat zegt de wet in gewone woorden?
2. Wat betekent dit voor u als weggebruiker?
3. Concrete voorbeelden
4. Wat kunt u doen bij overtredingen?
5. Waar vindt u hulp?

TOON: Toegankelijk, behulpzaam, empathisch`

    case 'politie':
      return `
DOELGROEP: Politieagent

ANTWOORDSTIJL:
- Kernpunten voor directe handhaving
- Praktische bevoegdheden en grenzen
- Operationele procedures bij overtredingen
- Wat wel/niet toegestaan is tijdens controle
- Bewijslast en procesverbaal
- Doorverwijzing naar andere autoriteiten

STRUCTUUR:
1. Wettelijke basis en handhavingsbevoegdheden
2. Praktische controle en vaststelling
3. Proces-verbaal en bewijsvoering
4. Doorverwijzing en vervolgstappen
5. Aandachtspunten bij handhaving

TOON: Direct, praktisch, operationeel gericht`

    case 'jurist':
      return `
DOELGROEP: Jurist/Advocaat

ANTWOORDSTIJL:
- Juridische precisie en volledigheid
- Relevante jurisprudentie en rechtsgrond
- Processuele aspecten en termijnen
- Verdedigingsstrategieën en juridische lacunes
- Verwijzingen naar specifieke artikelen
- Rechtsmacht en bevoegdheidsverdeling

STRUCTUUR:
1. Juridische grondslag en wetshistorie
2. Relevante jurisprudentie
3. Processuele aspecten en verweer
4. Praktische juridische gevolgen
5. Strategische overwegingen

TOON: Precies, professioneel, strategisch`

    case 'boa':
      return `
DOELGROEP: BOA (Buitengewoon Opsporingsambtenaar)

ANTWOORDSTIJL:
- Focus op BOA-bevoegdheden binnen specifiek domein
- Duidelijke grenzen van eigen handhavingsmogelijkheden
- Wanneer doorverwijzen naar politie/andere autoriteiten
- APV-handhaving en lokale verordeningen
- Procedurele aspecten binnen BOA-kaders
- Rapportage en proces-verbaal voor BOA's

STRUCTUUR:
1. BOA-bevoegdheid binnen relevant domein
2. Wettelijke basis en handhavingsruimte
3. Praktische uitvoering binnen BOA-taken
4. Grenzen en doorverwijzing
5. Rapportage en administratie

TOON: Praktisch, duidelijk over bevoegdheidsgrenzen, procedureel`

    case 'student':
      return `
DOELGROEP: Student

ANTWOORDSTIJL:
- Theoretische achtergrond en wetshistorie
- Rechtsprincipes en dogmatiek
- Academische bronnen en literatuur
- Rechtsvergelijking en kritische analyse
- Discussiepunten en verschillende interpretaties
- Studie-ondersteunende informatie

STRUCTUUR:
1. Theoretische basis en rechtsprincipes
2. Wetshistorie en ontwikkeling
3. Academische discussie en interpretatie
4. Praktische toepassingen en cases
5. Vervolgonderzoek en bronnen

TOON: Academisch, analytisch, onderzoekend`

    default:
      return `
DOELGROEP: Algemeen publiek

ANTWOORDSTIJL:
- Begrijpelijke taal zonder juridisch jargon
- Focus op praktische gevolgen voor dagelijks leven
- Concrete voorbeelden en situaties
- Wat betekent dit voor mij?
- Heldere uitleg van complexe juridische concepten
- Praktische tips en vervolgstappen

STRUCTUUR:
1. Wat betekent dit in gewone woorden?
2. Praktische gevolgen voor u
3. Concrete voorbeelden
4. Wat kunt u doen?
5. Waar kunt u terecht voor hulp?

TOON: Toegankelijk, behulpzaam, empathisch`
  }
}

async function generateLegalExplanation(query: string, searchResults: any, context: SearchContext, profile?: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return "Wetgeving uitleg tijdelijk niet beschikbaar."
  }
  
  try {
    // Get profile-specific context
    const profileContext = getProfileContextForBoetes(profile)
    
    const prompt = `
Je bent een juridisch AI-assistent die Nederlandse wetgeving uitlegt in duidelijke, feitelijke en juridisch correcte taal. Je baseert je uitsluitend op de beschikbare bronnen die door de gebruiker of het systeem zijn aangeleverd.

${profileContext}

⚠️ BELANGRIJK: Dit systeem is nog in BETA. Antwoorden kunnen fouten bevatten.

### KRITISCHE INSTRUCTIES:
- Gebruik **alleen de informatie die aantoonbaar in de bron staat**.
- Controleer bij elk antwoord of het een directe weergave of logische interpretatie is van de gevonden bronnen.
- Geef géén juridische interpretatie zonder bronverwijzing of expliciet "volgens bron X".
- **Voeg automatisch spaties toe tussen tekst en cijfers** (bijv. "artikel5" → "artikel 5", "wegenverkeerswet1994" → "wegenverkeerswet 1994").

### Controle-instructies (voor elk antwoord):
1. **Is alles wat je zegt onderbouwd met de gegeven bron(nen)?**
2. **Heb je juridische termen correct uitgelegd volgens de bron?**
3. **Gebruik je géén verzonnen of ongeverifieerde informatie?**
4. **Zijn voorbeelden realistisch en neutraal?**
5. **Indien je iets niet zeker weet of het ontbreekt in de bron, geef dat expliciet aan.**
6. **Heb je spaties toegevoegd tussen tekst en cijfers waar nodig?**

### Structuur van je output:
- **Wettelijke basis (artikel + samenvatting)**  
- **Uitleg in gewone taal (alleen op basis van de bron)**  
- **Voorbeeldsituatie (duidelijk aangeven dat het een voorbeeld is)**  
- **Bronverwijzing** (bijv. "volgens artikel 5 WVW 1994" of "volgens artikel 20 RVV 1990")  
- **Let op / twijfelgevallen**: geef aan waar interpretatie of context belangrijk is

**DISCLAIMER:** Voeg aan het einde toe: "⚠️ Let op: Deze informatie kan fouten bevatten. Controleer bij twijfel altijd officiële bronnen of raadpleeg een juridisch expert."

Als je een vraag niet met zekerheid kunt beantwoorden op basis van de bronnen, zeg dan:  
> "Op basis van de huidige bron(nen) kan hierover geen eenduidig antwoord worden gegeven."

Wees beknopt, feitelijk en precies. Geef liever minder informatie dan ongecontroleerde uitleg.

Vraag: ${query}
Context: ${context ? JSON.stringify(context) : 'Geen specifieke context'}
Zoekresultaten: ${JSON.stringify(searchResults)}

Geef een duidelijke uitleg over de relevante wetgeving op basis van de gevonden informatie.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system", 
          content: `Je bent een juridisch AI-assistent die Nederlandse wetgeving uitlegt in duidelijke, feitelijke en juridisch correcte taal. Je baseert je uitsluitend op de beschikbare bronnen die door de gebruiker of het systeem zijn aangeleverd.

KRITISCHE INSTRUCTIES:
- Gebruik alleen de informatie die aantoonbaar in de bron staat
- Controleer bij elk antwoord of het een directe weergave of logische interpretatie is van de gevonden bronnen
- Geef géén juridische interpretatie zonder bronverwijzing
- Bij twijfel: vermeld dat informatie ontbreekt in de bronnen

Wees beknopt, feitelijk en precies. Geef liever minder informatie dan ongecontroleerde uitleg.`
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.1
    })

    return response.choices[0]?.message?.content || "Juridische uitleg niet beschikbaar op basis van de beschikbare bronnen."
  } catch (error) {
    console.error('Legal explanation error:', error)
    return "Juridische uitleg tijdelijk niet beschikbaar."
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, context = {}, profile } = await request.json()
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      )
    }

    // Search legal database
    const searchResults = searchLegalDatabase(query)
    
    // Generate comprehensive legal explanation with profile context
    const legalExplanation = await generateLegalExplanation(query, searchResults, context, profile)
    
    return NextResponse.json({
      explanation: legalExplanation,
      searchResults: searchResults,
      query: query,
      context: context,
      profile: profile
    })

  } catch (error) {
    console.error('Legal search error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het opzoeken van wetgeving' },
      { status: 500 }
    )
  }
} 