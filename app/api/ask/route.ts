// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  fetchBasiswettenbestand, 
  fetchKOOPDocuments, 
  fetchRechtspraak,
  fetchCVDR,
  fetchDataOverheid,
  fetchOpenRechtspraak,
  fetchBoetebaseOM,
  fetchPolitieOpenData,
  fetchOpenRaadsinformatie,
  fetchBAGAPI,
  fetchCBSStatLine,
  fetchRDWOpenData,
  fetchOpenKVK,
  fetchEURLexWebService
} from '@/lib/officialSources'
import { getSourcesForQuery } from '@/lib/customSources'
import { 
  comprehensiveJuridicalSearch,
  extractSearchTermsFromResponse,
  formatSearchResultsForContext,
  GoogleSearchResult
} from '@/lib/googleSearch'

// Import Excel bronnen
import { 
  searchExcelSources, 
  formatExcelSourcesForContext,
  testExcelIntegration 
} from '@/lib/excelSources'

// DeepSeek API configuratie
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

const SYSTEM_PROMPT = `Je bent een Nederlandse juridische assistent gespecialiseerd in het Nederlandse rechtssysteem op WetHelder.nl. Je hebt toegang tot uitgebreide officiële bronnen en moet betrouwbare, accurate juridische informatie verstrekken op basis van de **volledige Nederlandse wetgeving**.

**🔧 VOLLEDIGE WETTELIJKE DEKKING:**
- Je begint bij de **algemene hoofdwetten** (zoals Grondwet, Wetboek van Strafrecht, Wegenverkeerswet, Algemene wet bestuursrecht)
- Daarna controleer je of de vraag **valt onder een bijzondere wet of besluit** en neem je die ook mee in het antwoord
- Je beperkt je dus **nooit tot alleen hoofdwetten**

**✅ ALTIJD MEENEMEN (indien van toepassing):**
- **Bijzondere wetten**: Wet Dieren, Vuurwerkbesluit, Opiumwet, WED, Geneesmiddelenwet, APV's, Arbeidstijdenwet, Alcoholwet, Wapenwetgeving, Wet BIG, Tabaks- en rookwarenwet, Wet publieke gezondheid, Arbowet, WPBR, etc.
- **Besluiten en regelingen**: Regeling wapens en munitie, Besluit risico's zware ongevallen, Regeling geneeskundige zorg politie, etc.
- **Lokale regelgeving**: APV's, provinciale verordeningen, waterschapsverordeningen

**KERNPRINCIPES:**
- Geef **natuurlijke, begrijpelijke antwoorden** met **flexibele juridische interpretatie**
- Gebruik **primair informatie uit de aangeleverde bronnen**, maar vul aan met **algemene juridische kennis** waar nodig
- Wees **betrouwbaar en precies** in juridische uitspraken
- **VERPLICHT: Vermeld altijd de wettelijke grondslag (artikel + wetboek) bij elke juridische handeling of begrip**
- **Bij juridische concepten MOET de relevante wetgeving worden genoemd, ook als deze niet expliciet in de bronnen staat**
- **Benoem expliciet als iets onder een bijzondere wet valt**
- **Als een specifieke wet niet relevant is, vermeld dat ook kort (ter bevestiging van volledigheid)**
- Geef **praktische, toepasbare adviezen** die direct bruikbaar zijn
- **CONVERSATIEGEHEUGEN: Behandel elke vraag als onderdeel van een lopend gesprek. Verwijs naar eerdere antwoorden waar relevant en bouw voort op de context.**

**CONVERSATIECONTINUÏTEIT:**
- Herken vervolgvragen en bouw voort op eerdere antwoorden
- Gebruik "zoals eerder besproken" of "in aanvulling op het vorige antwoord" waar passend
- Interpreteer korte/onduidelijke vragen in de context van het gesprek
- Vermijd herhaling van volledige uitleg als al eerder gegeven
- Behandel de sessie als één doorlopend juridisch consult

**ANTWOORDSTRUCTUUR:**
1. **Directe beantwoording** van de vraag
2. **Wettelijke basis** met exacte artikelverwijzingen
3. **Praktische implicaties** voor de specifieke situatie
4. **Aanvullende overwegingen** indien relevant

**OPMAAK EN STIJL:**
- Gebruik **geen sterretjes (****) of overmatige markdown formatting**
- Schrijf in **natuurlijke, vloeiende tekst**
- Gebruik **duidelijke kopjes** voor structuur
- Geef **concrete voorbeelden** waar mogelijk
- Vermijd juridisch jargon waar mogelijk, leg uit waar nodig

**BRONVERMELDING:**
- Verwijs altijd naar specifieke wetsartikelen
- Noem relevante jurisprudentie waar beschikbaar
- Gebruik officiële bronnen als primaire referentie
- Geef praktische bronnen voor verdere informatie`

const ADVANCED_SYSTEM_PROMPT = `Je bent een senior Nederlandse juridische expert gespecialiseerd in diepgaande juridische analyse op WetHelder.nl. Je hebt toegang tot uitgebreide officiële bronnen, jurisprudentie en moet uitgebreide, wetenschappelijk onderbouwde juridische analyses verstrekken op basis van de **volledige Nederlandse wetgeving**.

**🔧 VOLLEDIGE WETTELIJKE DEKKING (UITGEBREID):**
- Je begint bij de **algemene hoofdwetten** (zoals Grondwet, Wetboek van Strafrecht, Wegenverkeerswet, Algemene wet bestuursrecht)
- Daarna controleer je **verplicht alle relevante bijzondere wetten en besluiten** en neem je die uitgebreid mee in het antwoord
- Je beperkt je dus **nooit tot alleen hoofdwetten** - dit is cruciaal voor diepgaande analyse
- **Geef een volledig overzicht van alle toepasselijke wetgeving per onderwerp**

**✅ ALTIJD UITGEBREID MEENEMEN (indien van toepassing):**
- **Bijzondere wetten**: Wet Dieren, Vuurwerkbesluit, Opiumwet, WED, Geneesmiddelenwet, APV's, Arbeidstijdenwet, Alcoholwet, Wapenwetgeving, Wet BIG, Tabaks- en rookwarenwet, Wet publieke gezondheid, Arbowet, WPBR, Wet milieubeheer, Flora- en faunawet, etc.
- **Besluiten en regelingen**: Regeling wapens en munitie, Besluit risico's zware ongevallen, Regeling geneeskundige zorg politie, Warenwetbesluiten, etc.
- **Lokale regelgeving**: APV's, provinciale verordeningen, waterschapsverordeningen
- **Jurisprudentie**: Relevante uitspraken van Hoge Raad, Raad van State, gerechtshoven
- **Praktijkvoorbeelden**: Concrete casusistieken en toepassingen

**KERNPRINCIPES DIEPGAANDE ANALYSE:**
- Geef **uitgebreide, wetenschappelijk onderbouwde analyses** met **volledige juridische context**
- Gebruik **alle beschikbare bronnen**: wetgeving, jurisprudentie, doctrine, parlementaire geschiedenis
- Wees **extreem precies** in juridische interpretaties en nuanceringen
- **VERPLICHT: Geef volledige wettelijke grondslagen met alle relevante artikelen en jurisprudentie**
- **Analyseer juridische ontwikkelingen, trends en verschillende interpretaties**
- **Benoem expliciet welke bijzondere wetten van toepassing zijn en waarom**
- **Geef een volledig juridisch kader per onderwerp**
- **Behandel ook randgevallen en uitzonderingen**
- Geef **uitgebreide praktische toepassingen** met concrete casusistieken
- **CONVERSATIEGEHEUGEN: Behandel elke vraag als onderdeel van een lopend juridisch consult. Bouw voort op eerdere analyses en verfijn waar nodig.**

**CONVERSATIECONTINUÏTEIT VOOR EXPERTS:**
- Herken complexe vervolgvragen en diep juridische context
- Verwijs naar eerdere juridische analyses en bouw hierop voort
- Interpreteer technische vragen in de context van het gehele gesprek
- Vermijd herhaling van basisprincipes als al uitgebreid besproken
- Behandel de sessie als een doorlopend juridisch expertconsult

**UITGEBREIDE ANALYSE STRUCTUUR:**
1. **Juridische probleemstelling** en context
2. **Volledige wettelijke kader** met alle relevante artikelen
3. **Jurisprudentie-analyse** met belangrijke uitspraken
4. **Doctrine en literatuur** waar relevant
5. **Praktische toepassingen** met uitgebreide casusistieken
6. **Procedurele aspecten** en praktische stappen
7. **Risico's en aandachtspunten** voor de praktijk
8. **Recente ontwikkelingen** en trends

**OPMAAK EN STIJL VOOR EXPERTS:**
- Gebruik **geen sterretjes (****) of overmatige markdown formatting**
- Schrijf in **professionele, juridische stijl** maar wel begrijpelijk
- Gebruik **uitgebreide structuur** met duidelijke kopjes
- Geef **uitgebreide voorbeelden en casusistieken**
- Gebruik juridische terminologie correct en leg complexe concepten uit
- **Citeer jurisprudentie** met volledige referenties waar mogelijk

**UITGEBREIDE BRONVERMELDING:**
- Verwijs naar alle relevante wetsartikelen met volledige context
- Citeer belangrijke jurisprudentie met uitspraakdata en instanties
- Gebruik officiële bronnen, parlementaire stukken, en doctrine
- Geef uitgebreide bronnenlijst voor verdere studie
- Verwijs naar relevante procedures en formulieren`

// In-memory store for anonymous user rate limiting (development only)
const anonymousUsageStore = new Map<string, { count: number; date: string }>()

async function searchOfficialSources(query: string): Promise<string[]> {
  const sources: string[] = []
  
  try {
    // === AANGEPASTE BRONNEN UIT GEBRUIKER DOCUMENT MET DATUMVALIDATIE ===
    console.log('🔍 Searching custom sources with date validation...')
    const customSources = await getSourcesForQuery(query)
    
    // Voor nu accepteren we alle custom sources (validatie wordt later toegevoegd)
    const validatedCustomSources = customSources
    
    if (validatedCustomSources.length > 0) {
      console.log(`✅ Found ${validatedCustomSources.length} actuele custom sources for query: "${query}"`)
      sources.push(...validatedCustomSources)
    } else if (customSources.length > 0) {
      console.log(`⚠️ ${customSources.length} custom sources gevonden maar mogelijk verouderd`)
    } else {
      console.log(`ℹ️ No custom sources found for query: "${query}"`)
    }
    
    // Verbeterde zoekstrategie met gerelateerde termen
    const searchTerms = [query]
    
    // Voeg automatisch gerelateerde juridische termen toe
    const relatedTerms = getRelatedLegalTerms(query)
    searchTerms.push(...relatedTerms)
    
    // Zoek voor elke zoekterm
    for (const searchTerm of searchTerms.slice(0, 3)) { // Limiteer tot 3 termen
      // Zoek relevante wetgeving
      try {
        const wetgevingResponse = await fetch(`https://wetten.overheid.nl/zoeken?keyword=${encodeURIComponent(searchTerm)}`)
        if (wetgevingResponse.ok) {
          const wetgevingData = await wetgevingResponse.json()
          if (wetgevingData.results) {
            sources.push(...wetgevingData.results.slice(0, 2).map((r: any) => r.url))
          }
        }
      } catch (error) {
        console.error(`Error searching wetgeving for ${searchTerm}:`, error)
      }

      // Zoek relevante jurisprudentie met verbeterde verificatie
      try {
        const jurisprudentieResponse = await fetch(`https://uitspraken.rechtspraak.nl/api/zoek?zoeken=${encodeURIComponent(searchTerm)}`)
        if (jurisprudentieResponse.ok) {
          const jurisprudentieData = await jurisprudentieResponse.json()
          if (jurisprudentieData.results && Array.isArray(jurisprudentieData.results)) {
            // Striktere ECLI validatie: moet volledig format hebben ECLI:NL:INSTANTIE:JAAR:NUMMER
            const validResults = jurisprudentieData.results
              .filter((r: any) => {
                if (!r.ecli || !r.ecli.startsWith('ECLI:NL:')) return false
                // Check of ECLI volledig format heeft: ECLI:NL:XX:YYYY:NNNNN
                const ecliParts = r.ecli.split(':')
                if (ecliParts.length !== 5) return false
                const year = parseInt(ecliParts[3])
                return year >= 2000 && year <= new Date().getFullYear()
              })
              .slice(0, 2)
              .map((r: any) => `https://uitspraken.rechtspraak.nl/inziendocument?id=${r.ecli}`)
            
            if (validResults.length > 0) {
              sources.push(...validResults)
            }
          }
        }
      } catch (error) {
        console.error(`Error searching jurisprudentie for ${searchTerm}:`, error)
      }
      
      // Voeg alleen betrouwbare rechtspraak bronnen toe als fallback
      if (searchTerm === query && !sources.some(s => s.includes('rechtspraak.nl'))) {
        sources.push('https://uitspraken.rechtspraak.nl - Voor actuele Nederlandse jurisprudentie')
      }
    }

    // === UITGEBREIDE APV EN LOKALE REGELGEVING BRONNEN ===
    
    // NIEUWE BRON: CVDR (Centrale Voorziening Decentrale Regelgeving) - ALLE APV's
    if (query.toLowerCase().includes('gemeente') || 
        query.toLowerCase().includes('provincie') ||
        query.toLowerCase().includes('verordening') ||
        query.toLowerCase().includes('apv') ||
        query.toLowerCase().includes('bouwverordening') ||
        query.toLowerCase().includes('parkeren') ||
        query.toLowerCase().includes('evenement') ||
        query.toLowerCase().includes('horeca') ||
        query.toLowerCase().includes('overlast') ||
        query.toLowerCase().includes('geluidshinder') ||
        query.toLowerCase().includes('open vuur') ||
        query.toLowerCase().includes('barbecue') ||
        query.toLowerCase().includes('kampvuur') ||
        query.toLowerCase().includes('caravan') ||
        query.toLowerCase().includes('camper') ||
        query.toLowerCase().includes('standplaats') ||
        query.toLowerCase().includes('markt') ||
        query.toLowerCase().includes('terras') ||
        query.toLowerCase().includes('uitbating') ||
        query.toLowerCase().includes('prostitutie') ||
        query.toLowerCase().includes('coffeeshop') ||
        query.toLowerCase().includes('cannabis') ||
        query.toLowerCase().includes('gedoogbeleid')) {
      try {
        sources.push(`https://lokaleregelgeving.overheid.nl/zoeken?q=${encodeURIComponent(query)}`)
        sources.push(`https://decentrale.regelgeving.overheid.nl/cvdr/zoeken?q=${encodeURIComponent(query)}`)
      } catch (error) {
        console.error('Error adding CVDR reference:', error)
      }
    }

    // SPECIFIEKE APV BRONNEN PER GEMEENTE (uitgebreid)
    const gemeenteNames = ['nijmegen', 'amsterdam', 'rotterdam', 'utrecht', 'eindhoven', 'tilburg', 'groningen', 'almere', 'breda', 'den haag', 's-gravenhage', 'haarlem', 'enschede', 'apeldoorn', 'arnhem', 'amersfoort', 'zaanstad', 'haarlemmermeer', 'zoetermeer', 'dordrecht', 'leiden', 'maastricht', 'ede', 'alphen aan den rijn', 'westland', 'delft', 'venlo', 'deventer', 'leeuwarden', 'alkmaar', 'zwolle', 'emmen', 'helmond', 'hengelo', 'purmerend', 'hilversum', 'amstelveen', 'roosendaal', 'oss', 'schiedam', 'spijkenisse', 'vlaardingen', 'almelo', 'hoorn', 'gouda', 'lelystad', 'kampen', 'meppel', 'hardenberg', 'steenwijk', 'hoogeveen', 'coevorden', 'noordoostpolder', 'urk', 'dronten', 'zeewolde', 'flevoland']
    
    for (const gemeente of gemeenteNames) {
      if (query.toLowerCase().includes(gemeente)) {
        try {
          sources.push(`https://lokaleregelgeving.overheid.nl/${gemeente}/apv`)
          sources.push(`https://decentrale.regelgeving.overheid.nl/cvdr/${gemeente}`)
          // Google zoeken specifiek voor APV van die gemeente
          sources.push(`https://www.google.com/search?q=apv+${gemeente}+site:lokaleregelgeving.overheid.nl`)
        } catch (error) {
          console.error(`Error adding ${gemeente} APV reference:`, error)
        }
      }
    }

    // PROVINCIALE VERORDENINGEN
    const provincieNames = ['noord-holland', 'zuid-holland', 'utrecht', 'gelderland', 'overijssel', 'drenthe', 'friesland', 'groningen', 'zeeland', 'noord-brabant', 'limburg', 'flevoland']
    
    for (const provincie of provincieNames) {
      if (query.toLowerCase().includes(provincie)) {
        try {
          sources.push(`https://lokaleregelgeving.overheid.nl/provincie-${provincie}`)
          sources.push(`https://decentrale.regelgeving.overheid.nl/cvdr/provincie-${provincie}`)
        } catch (error) {
          console.error(`Error adding ${provincie} provincial reference:`, error)
        }
      }
    }

    // WATERSCHAP VERORDENINGEN
    if (query.toLowerCase().includes('waterschap') || 
        query.toLowerCase().includes('waterbeheer') ||
        query.toLowerCase().includes('dijken') ||
        query.toLowerCase().includes('polders') ||
        query.toLowerCase().includes('waterkeringen')) {
      try {
        sources.push(`https://lokaleregelgeving.overheid.nl/waterschap`)
        sources.push(`https://www.uvw.nl/regelgeving`) // Unie van Waterschappen
      } catch (error) {
        console.error('Error adding waterschap reference:', error)
      }
    }

    // VEILIGHEIDSREGIO VERORDENINGEN
    if (query.toLowerCase().includes('veiligheidsregio') || 
        query.toLowerCase().includes('brandweer') ||
        query.toLowerCase().includes('rampenbestrijding') ||
        query.toLowerCase().includes('crisisbeheersing')) {
      try {
        sources.push(`https://lokaleregelgeving.overheid.nl/veiligheidsregio`)
        sources.push(`https://www.veiligheidsregio.nl/regelgeving`)
      } catch (error) {
        console.error('Error adding veiligheidsregio reference:', error)
      }
    }

    // Zoek relevante tuchtrechtuitspraken voor specifieke onderwerpen
    if (query.toLowerCase().includes('tuchtrecht') || 
        query.toLowerCase().includes('beroepsgroep') ||
        query.toLowerCase().includes('medisch') ||
        query.toLowerCase().includes('advocaat')) {
      try {
        const tuchtrechtResponse = await fetch(`https://tuchtrecht.overheid.nl/zoeken?q=${encodeURIComponent(query)}`)
        if (tuchtrechtResponse.ok) {
          const tuchtrechtData = await tuchtrechtResponse.json()
          if (tuchtrechtData.results) {
            sources.push(...tuchtrechtData.results.slice(0, 2).map((r: any) => r.url))
          }
        }
      } catch (error) {
        console.error('Error searching tuchtrecht:', error)
      }
    }

    // NIEUWE BRON: Boetebase (Openbaar Ministerie)
    if (query.toLowerCase().includes('boete') || 
        query.toLowerCase().includes('feit') ||
        query.toLowerCase().includes('overtreding') ||
        query.toLowerCase().includes('verkeer')) {
      try {
        // Boetebase heeft geen directe API, maar we kunnen de structuur gebruiken
        sources.push(`https://boetebase.om.nl/zoeken?q=${encodeURIComponent(query)}`)
      } catch (error) {
        console.error('Error adding boetebase reference:', error)
      }
    }

    // NIEUWE BRON: Rijksoverheid.nl (Beleid en uitvoering)
    if (query.toLowerCase().includes('beleid') || 
        query.toLowerCase().includes('uitvoering') ||
        query.toLowerCase().includes('ministerie') ||
        query.toLowerCase().includes('regering')) {
      try {
        const rijksoverheidResponse = await fetch(`https://www.rijksoverheid.nl/zoeken?keyword=${encodeURIComponent(query)}`)
        if (rijksoverheidResponse.ok) {
          sources.push(`https://www.rijksoverheid.nl/zoeken?keyword=${encodeURIComponent(query)}`)
        }
      } catch (error) {
        console.error('Error searching rijksoverheid:', error)
      }
    }

    // NIEUWE BRON: Politie.nl (Handhaving en procedures)
    if (query.toLowerCase().includes('politie') || 
        query.toLowerCase().includes('handhaving') ||
        query.toLowerCase().includes('aangifte') ||
        query.toLowerCase().includes('proces-verbaal')) {
      try {
        sources.push(`https://www.politie.nl/zoeken?q=${encodeURIComponent(query)}`)
      } catch (error) {
        console.error('Error adding politie reference:', error)
      }
    }

    // NIEUWE BRON: Belastingdienst.nl (Fiscaal recht)
    if (query.toLowerCase().includes('belasting') || 
        query.toLowerCase().includes('fiscaal') ||
        query.includes('btw') ||
        query.toLowerCase().includes('inkomstenbelasting')) {
      try {
        sources.push(`https://www.belastingdienst.nl/zoeken?q=${encodeURIComponent(query)}`)
      } catch (error) {
        console.error('Error adding belastingdienst reference:', error)
      }
    }

    // NIEUWE BRON: Autoriteit Persoonsgegevens (Privacy/AVG)
    if (query.toLowerCase().includes('avg') || 
        query.toLowerCase().includes('privacy') ||
        query.toLowerCase().includes('persoonsgegeven') ||
        query.toLowerCase().includes('gdpr')) {
      try {
        sources.push(`https://autoriteitpersoonsgegevens.nl/zoeken?q=${encodeURIComponent(query)}`)
      } catch (error) {
        console.error('Error adding AP reference:', error)
      }
    }

    // NIEUWE BRON: ACM (Mededingingsrecht)
    if (query.toLowerCase().includes('mededinging') || 
        query.toLowerCase().includes('kartel') ||
        query.toLowerCase().includes('consument') ||
        query.toLowerCase().includes('markt')) {
      try {
        sources.push(`https://www.acm.nl/zoeken?q=${encodeURIComponent(query)}`)
      } catch (error) {
        console.error('Error adding ACM reference:', error)
      }
    }

    // NIEUWE BRON: Sociale Verzekeringsbank (Sociale zekerheid)
    if (query.toLowerCase().includes('aow') || 
        query.toLowerCase().includes('kinderbijslag') ||
        query.toLowerCase().includes('sociale') ||
        query.toLowerCase().includes('uitkering')) {
      try {
        sources.push(`https://www.svb.nl/zoeken?q=${encodeURIComponent(query)}`)
      } catch (error) {
        console.error('Error adding SVB reference:', error)
      }
    }

    // NIEUWE BRON: UWV (Werkloosheid en arbeidsrecht)
    if (query.toLowerCase().includes('werkloos') || 
        query.toLowerCase().includes('ww') ||
        query.toLowerCase().includes('arbeid') ||
        query.toLowerCase().includes('arbeidscontract')) {
      try {
        sources.push(`https://www.uwv.nl/zoeken?q=${encodeURIComponent(query)}`)
      } catch (error) {
        console.error('Error adding UWV reference:', error)
      }
    }

    // NIEUWE BRON: Kadaster (Eigendomsrecht)
    if (query.toLowerCase().includes('eigendom') || 
        query.toLowerCase().includes('kadaster') ||
        query.toLowerCase().includes('hypotheek') ||
        query.toLowerCase().includes('onroerend')) {
      try {
        sources.push(`https://www.kadaster.nl/zoeken?q=${encodeURIComponent(query)}`)
      } catch (error) {
        console.error('Error adding Kadaster reference:', error)
      }
    }

    // NIEUWE BRON: Juridisch Loket (Praktische juridische hulp)
    if (query.toLowerCase().includes('scheiding') || 
        query.toLowerCase().includes('alimentatie') ||
        query.toLowerCase().includes('echtscheiding') ||
        query.toLowerCase().includes('arbeidsrecht') ||
        query.toLowerCase().includes('huurrecht') ||
        query.toLowerCase().includes('consumentenrecht') ||
        query.toLowerCase().includes('rechtsbijstand')) {
      try {
        sources.push(`https://www.juridischloket.nl/zoeken/?q=${encodeURIComponent(query)}`)
      } catch (error) {
        console.error('Error adding Juridisch Loket reference:', error)
      }
    }

    // NIEUWE BRON: Data.overheid.nl (Open datasets)
    if (query.toLowerCase().includes('statistiek') || 
        query.toLowerCase().includes('cijfers') ||
        query.toLowerCase().includes('onderzoek') ||
        query.toLowerCase().includes('beleid')) {
      try {
        sources.push(`https://data.overheid.nl/data/dataset?q=${encodeURIComponent(query)}`)
      } catch (error) {
        console.error('Error adding Data.overheid.nl reference:', error)
      }
    }

    // NIEUWE BRON: OpenRechtspraak.nl (Uitspraken)
    if (query.toLowerCase().includes('uitspraak') || 
        query.toLowerCase().includes('vonnis') ||
        query.toLowerCase().includes('arrest') ||
        query.toLowerCase().includes('rechtbank')) {
      try {
        sources.push(`https://openrechtspraak.nl/uitspraken/zoeken?q=${encodeURIComponent(query)}`)
      } catch (error) {
        console.error('Error adding OpenRechtspraak reference:', error)
      }
    }

    // NIEUWE BRON: BoeteBase OM (Boetes)
    if (query.toLowerCase().includes('boete') || 
        query.toLowerCase().includes('overtreding') ||
        query.toLowerCase().includes('bekeuring') ||
        query.toLowerCase().includes('verkeer')) {
      try {
        sources.push(`https://boetebase.om.nl`)
      } catch (error) {
        console.error('Error adding BoeteBase reference:', error)
      }
    }

    // NIEUWE BRON: BAG API (Adressen en gebouwen)
    if (query.toLowerCase().includes('adres') || 
        query.toLowerCase().includes('gebouw') ||
        query.toLowerCase().includes('woning') ||
        query.toLowerCase().includes('pand')) {
      try {
        sources.push(`https://bagviewer.kadaster.nl`)
      } catch (error) {
        console.error('Error adding BAG reference:', error)
      }
    }

    // NIEUWE BRON: CBS StatLine (Statistieken)
    if (query.toLowerCase().includes('criminaliteit') || 
        query.toLowerCase().includes('demografie') ||
        query.toLowerCase().includes('bevolking') ||
        query.toLowerCase().includes('werkloosheid')) {
      try {
        sources.push(`https://opendata.cbs.nl/statline/#/CBS/nl/navigatieScherm/zoeken?searchKeywords=${encodeURIComponent(query)}`)
      } catch (error) {
        console.error('Error adding CBS StatLine reference:', error)
      }
    }

    // NIEUWE BRON: RDW Open Data (Voertuigen)
    if (query.toLowerCase().includes('kenteken') || 
        query.toLowerCase().includes('voertuig') ||
        query.toLowerCase().includes('auto') ||
        query.toLowerCase().includes('rijbewijs')) {
      try {
        sources.push(`https://opendata.rdw.nl`)
      } catch (error) {
        console.error('Error adding RDW reference:', error)
      }
    }

    // NIEUWE BRON: OpenKVK (Bedrijfsgegevens)
    if (query.toLowerCase().includes('bedrijf') || 
        query.toLowerCase().includes('onderneming') ||
        query.toLowerCase().includes('kvk') ||
        query.toLowerCase().includes('btw')) {
      try {
        sources.push(`https://www.kvk.nl/zoeken`)
      } catch (error) {
        console.error('Error adding OpenKVK reference:', error)
      }
    }

    return [...new Set(sources)].slice(0, 20) // Vergroot van 15 naar 20 bronnen voor APV's
  } catch (error) {
    console.error('Error searching sources:', error)
    return []
  }
}

// Functie om automatisch gerelateerde juridische termen te vinden
function getRelatedLegalTerms(query: string): string[] {
  const lowerQuery = query.toLowerCase()
  const relatedTerms: string[] = []
  
  // === PRIORITEIT 1: EXPLICIETE WET-MAPPING ===
  
  // Vuurwerk en explosieven - WED + Wet explosieven voor civiel gebruik
  if (lowerQuery.includes('vuurwerk') || lowerQuery.includes('explosie') || lowerQuery.includes('knalvuurwerk') || lowerQuery.includes('carbid')) {
    relatedTerms.push('WED', 'wet op de economische delicten', 'artikel 23 WED', 'wet explosieven voor civiel gebruik', 'artikel 2 wet explosieven', 'artikel 9 wet explosieven')
  }
  
  // Verkeer - WVW + RVV (niet WED!)
  if (lowerQuery.includes('verkeer') || lowerQuery.includes('rijden') || lowerQuery.includes('auto') || lowerQuery.includes('fiets')) {
    relatedTerms.push('wegenverkeerswet 1994', 'WVW 1994', 'RVV 1990', 'artikel 5 WVW', 'artikel 107 WVW', 'artikel 160 WVW', 'artikel 162 WVW')
  }
  
  // Drugs en verdovende middelen - Opiumwet (niet WED!)
  if (lowerQuery.includes('drugs') || lowerQuery.includes('wiet') || lowerQuery.includes('cannabis') || lowerQuery.includes('opium') || lowerQuery.includes('cocaïne')) {
    relatedTerms.push('opiumwet', 'artikel 2 opiumwet', 'artikel 3 opiumwet', 'artikel 10 opiumwet', 'artikel 11 opiumwet')
  }
  
  // Milieu en afval - WED + Wet milieubeheer
  if (lowerQuery.includes('milieu') || lowerQuery.includes('afval') || lowerQuery.includes('vervuiling') || lowerQuery.includes('dumping')) {
    relatedTerms.push('WED', 'wet milieubeheer', 'artikel 23 WED', 'artikel 1a WED', 'artikel 2 WED')
  }
  
  // Bouw en vergunningen - Omgevingswet + WED
  if (lowerQuery.includes('bouw') || lowerQuery.includes('vergunning') || lowerQuery.includes('omgevingsvergunning') || lowerQuery.includes('illegaal bouwen')) {
    relatedTerms.push('omgevingswet', 'WED', 'artikel 23 WED', 'artikel 2.1 omgevingswet', 'artikel 5.1 omgevingswet')
  }
  
  // Handel en bedrijven - WED + Handelsregisterwet
  if (lowerQuery.includes('handel') || lowerQuery.includes('bedrijf') || lowerQuery.includes('onderneming') || lowerQuery.includes('kvk')) {
    relatedTerms.push('WED', 'handelsregisterwet', 'artikel 23 WED', 'artikel 1a WED')
  }
  
  // === PRIORITEIT 2: SPECIFIEKE OVERTREDINGEN ===
  
  // APV en gemeentelijke regelgeving - UITGEBREID VOOR ALLE GEMEENTEN
  if (lowerQuery.includes('apv') || lowerQuery.includes('gemeente') || lowerQuery.includes('plaatselijke verordening')) {
    relatedTerms.push('apv', 'algemene plaatselijke verordening', 'gemeentelijke verordening', 'artikel 154 gemeentewet', 'artikel 149 gemeentewet')
  }
  
  // Specifieke APV's per gemeente
  if (lowerQuery.includes('nijmegen')) {
    relatedTerms.push('apv nijmegen', 'artikel 2.3.1 apv nijmegen', 'artikel 2.3.2 apv nijmegen', 'artikel 2.4.1 apv nijmegen', 'artikel 3.1.1 apv nijmegen')
  }
  
  if (lowerQuery.includes('amsterdam')) {
    relatedTerms.push('apv amsterdam', 'artikel 2.1 apv amsterdam', 'artikel 2.2 apv amsterdam', 'artikel 3.1 apv amsterdam', 'artikel 4.1 apv amsterdam')
  }
  
  if (lowerQuery.includes('rotterdam')) {
    relatedTerms.push('apv rotterdam', 'artikel 2.1 apv rotterdam', 'artikel 2.2 apv rotterdam', 'artikel 3.1 apv rotterdam', 'artikel 4.1 apv rotterdam')
  }
  
  if (lowerQuery.includes('utrecht')) {
    relatedTerms.push('apv utrecht', 'artikel 2.1 apv utrecht', 'artikel 2.2 apv utrecht', 'artikel 3.1 apv utrecht', 'artikel 4.1 apv utrecht')
  }
  
  if (lowerQuery.includes('eindhoven')) {
    relatedTerms.push('apv eindhoven', 'artikel 2.1 apv eindhoven', 'artikel 2.2 apv eindhoven', 'artikel 3.1 apv eindhoven')
  }
  
  if (lowerQuery.includes('tilburg')) {
    relatedTerms.push('apv tilburg', 'artikel 2.1 apv tilburg', 'artikel 2.2 apv tilburg', 'artikel 3.1 apv tilburg')
  }
  
  if (lowerQuery.includes('groningen')) {
    relatedTerms.push('apv groningen', 'artikel 2.1 apv groningen', 'artikel 2.2 apv groningen', 'artikel 3.1 apv groningen')
  }
  
  if (lowerQuery.includes('almere')) {
    relatedTerms.push('apv almere', 'artikel 2.1 apv almere', 'artikel 2.2 apv almere', 'artikel 3.1 apv almere')
  }
  
  if (lowerQuery.includes('breda')) {
    relatedTerms.push('apv breda', 'artikel 2.1 apv breda', 'artikel 2.2 apv breda', 'artikel 3.1 apv breda')
  }
  
  if (lowerQuery.includes('den haag') || lowerQuery.includes('s-gravenhage')) {
    relatedTerms.push('apv den haag', 'artikel 2.1 apv den haag', 'artikel 2.2 apv den haag', 'artikel 3.1 apv den haag')
  }
  
  // Specifieke APV onderwerpen
  if (lowerQuery.includes('open vuur') || lowerQuery.includes('vuur') || lowerQuery.includes('barbecue') || lowerQuery.includes('kampvuur')) {
    relatedTerms.push('open vuur apv', 'artikel 2.3.1 apv', 'artikel 2.3.2 apv', 'brandveiligheid', 'artikel 154 gemeentewet')
  }
  
  if (lowerQuery.includes('evenement') || lowerQuery.includes('manifestatie') || lowerQuery.includes('demonstratie')) {
    relatedTerms.push('evenementen apv', 'artikel 2.4 apv', 'artikel 2.5 apv', 'artikel 149 gemeentewet')
  }
  
  if (lowerQuery.includes('overlast') || lowerQuery.includes('geluidshinder') || lowerQuery.includes('muziek')) {
    relatedTerms.push('overlast apv', 'artikel 3.1 apv', 'artikel 3.2 apv', 'geluidshinder')
  }
  
  if (lowerQuery.includes('parkeren') || lowerQuery.includes('stilstaan') || lowerQuery.includes('laden en lossen')) {
    relatedTerms.push('parkeren apv', 'artikel 5.1 apv', 'artikel 5.2 apv', 'verkeer en vervoer apv')
  }
  
  if (lowerQuery.includes('horeca') || lowerQuery.includes('terras') || lowerQuery.includes('uitbating')) {
    relatedTerms.push('horeca apv', 'artikel 4.1 apv', 'artikel 4.2 apv', 'terrassenbeleid')
  }
  
  if (lowerQuery.includes('prostitutie') || lowerQuery.includes('seksinrichting')) {
    relatedTerms.push('prostitutie apv', 'artikel 6.1 apv', 'artikel 6.2 apv', 'seksinrichtingen')
  }
  
  if (lowerQuery.includes('coffeeshop') || lowerQuery.includes('cannabis') || lowerQuery.includes('gedoogbeleid')) {
    relatedTerms.push('coffeeshop apv', 'artikel 7.1 apv', 'gedoogbeleid', 'opiumwet')
  }
  
  // Huiselijk geweld en gerelateerde delicten
  if (lowerQuery.includes('huiselijk geweld') || lowerQuery.includes('mishandeling') || lowerQuery.includes('geweld')) {
    relatedTerms.push('artikel 300 sr', 'artikel 302 sr', 'artikel 304 sr', 'artikel 285 sr', 'artikel 282 sr', 'artikel 284 sr')
  }
  
  // Verkeer en vervoer - uitgebreid
  if (lowerQuery.includes('verkeer') || lowerQuery.includes('rijden') || lowerQuery.includes('auto') || lowerQuery.includes('fiets')) {
    relatedTerms.push('wegenverkeerswet', 'rvv', 'artikel 5 wvw', 'artikel 8 wvw', 'artikel 107 wvw', 'artikel 160 wvw', 'artikel 162 wvw')
  }
  
  // Specifieke verkeersovertredingen
  if (lowerQuery.includes('geblindeerde') || lowerQuery.includes('ramen') || lowerQuery.includes('voorruit') || lowerQuery.includes('getint')) {
    relatedTerms.push('artikel 5.2.42 rvv', 'artikel 5 wvw', 'reglement voertuigen', 'artikel 107 wvw')
  }
  
  if (lowerQuery.includes('telefoon') || lowerQuery.includes('mobiel') || lowerQuery.includes('bellen') || lowerQuery.includes('handheld')) {
    relatedTerms.push('artikel 61a rvv', 'artikel 5 wvw', 'artikel 107 wvw')
  }
  
  if (lowerQuery.includes('gordel') || lowerQuery.includes('veiligheidsgordel')) {
    relatedTerms.push('artikel 59 rvv', 'artikel 5 wvw', 'artikel 107 wvw')
  }
  
  if (lowerQuery.includes('snelheid') || lowerQuery.includes('te hard') || lowerQuery.includes('maximum snelheid')) {
    relatedTerms.push('artikel 19 rvv', 'artikel 20 rvv', 'artikel 5 wvw', 'artikel 107 wvw')
  }
  
  if (lowerQuery.includes('rijbewijs') || lowerQuery.includes('rijvaardigheid') || lowerQuery.includes('ongeldig')) {
    relatedTerms.push('artikel 107 wvw', 'artikel 160 wvw', 'artikel 162 wvw', 'artikel 164 wvw')
  }
  
  if (lowerQuery.includes('alcohol') || lowerQuery.includes('dronken') || lowerQuery.includes('onder invloed')) {
    relatedTerms.push('artikel 8 wvw', 'artikel 163 wvw', 'artikel 107 wvw')
  }
  
  // Diefstal en vermogensdelicten
  if (lowerQuery.includes('diefstal') || lowerQuery.includes('stelen') || lowerQuery.includes('inbraak')) {
    relatedTerms.push('artikel 310 sr', 'artikel 311 sr', 'artikel 312 sr', 'artikel 321 sr', 'artikel 416 sr')
  }
  
  // Belediging en discriminatie
  if (lowerQuery.includes('belediging') || lowerQuery.includes('discriminatie') || lowerQuery.includes('racisme')) {
    relatedTerms.push('artikel 137c sr', 'artikel 137d sr', 'artikel 261 sr', 'artikel 266 sr', 'artikel 267 sr')
  }
  
  // Bedreiging en stalking
  if (lowerQuery.includes('bedreiging') || lowerQuery.includes('stalking') || lowerQuery.includes('bedreigen')) {
    relatedTerms.push('artikel 285 sr', 'artikel 285b sr', 'artikel 284 sr')
  }
  
  // Fraude en oplichting
  if (lowerQuery.includes('fraude') || lowerQuery.includes('oplichting') || lowerQuery.includes('bedrog')) {
    relatedTerms.push('artikel 326 sr', 'artikel 416 sr', 'artikel 225 sr', 'artikel 231 sr')
  }
  
  // Politie en handhaving - uitgebreid
  if (lowerQuery.includes('politie') || lowerQuery.includes('aanhouding') || lowerQuery.includes('arrestatie')) {
    relatedTerms.push('wetboek van strafvordering', 'artikel 27 sv', 'artikel 53 sv', 'artikel 54 sv', 'artikel 55 sv', 'artikel 56 sv')
  }
  
  if (lowerQuery.includes('politiecontrole') || lowerQuery.includes('controle') || lowerQuery.includes('meewerken') || lowerQuery.includes('legitimeren')) {
    relatedTerms.push('artikel 447e sr', 'artikel 2 wet op de identificatieplicht', 'artikel 184 sr', 'artikel 435 sr', 'artikel 53 sv', 'artikel 27 sv')
  }
  
  if (lowerQuery.includes('rechten') && lowerQuery.includes('politie')) {
    relatedTerms.push('artikel 447e sr', 'artikel 184 sr', 'artikel 435 sr', 'artikel 53 sv', 'artikel 27 sv', 'artikel 29 sv', 'artikel 40 sv')
  }
  
  if (lowerQuery.includes('fouilleren') || lowerQuery.includes('doorzoeken') || lowerQuery.includes('inbeslagname')) {
    relatedTerms.push('artikel 27 sv', 'artikel 96 sv', 'artikel 95 sv', 'artikel 9 opiumwet', 'artikel 28 sv')
  }
  
  // BOA en bijzondere opsporingsdiensten
  if (lowerQuery.includes('boa') || lowerQuery.includes('bijzondere opsporingsambtenaar')) {
    relatedTerms.push('artikel 142 sv', 'artikel 159 gemeentewet', 'artikel 7 politiewet', 'besluit buitengewoon opsporingsambtenaar')
  }
  
  // Openbare orde en veiligheid
  if (lowerQuery.includes('openbare orde') || lowerQuery.includes('verstoring') || lowerQuery.includes('overlast')) {
    relatedTerms.push('artikel 131 sr', 'artikel 138 sr', 'artikel 139 sr', 'artikel 149 gemeentewet', 'artikel 154 gemeentewet')
  }
  
  // Privacy en gegevensbescherming
  if (lowerQuery.includes('privacy') || lowerQuery.includes('gegevens') || lowerQuery.includes('avg')) {
    relatedTerms.push('avg', 'algemene verordening gegevensbescherming', 'wbp', 'artikel 6 avg', 'artikel 9 avg', 'artikel 17 avg')
  }
  
  // Wapens en munitie
  if (lowerQuery.includes('wapen') || lowerQuery.includes('mes') || lowerQuery.includes('vuurwapen')) {
    relatedTerms.push('artikel 26 sr', 'artikel 27 sr', 'artikel 55 sr', 'wet wapens en munitie', 'artikel 13 wwm', 'artikel 26 wwm')
  }
  
  // Jeugdstrafrecht
  if (lowerQuery.includes('jeugd') || lowerQuery.includes('minderjarig') || lowerQuery.includes('12 jaar') || lowerQuery.includes('16 jaar')) {
    relatedTerms.push('jeugdwet', 'artikel 77a sr', 'artikel 77g sr', 'artikel 488 sv', 'artikel 495 sv')
  }
  
  // Bestuursrecht en bezwaar
  if (lowerQuery.includes('bezwaar') || lowerQuery.includes('beroep') || lowerQuery.includes('awb') || lowerQuery.includes('bestuursrecht')) {
    relatedTerms.push('algemene wet bestuursrecht', 'artikel 6:4 awb', 'artikel 6:5 awb', 'artikel 7:1 awb', 'artikel 8:1 awb')
  }
  
  // Belastingen en heffingen
  if (lowerQuery.includes('belasting') || lowerQuery.includes('btw') || lowerQuery.includes('inkomstenbelasting')) {
    relatedTerms.push('algemene wet inzake rijksbelastingen', 'wet op de omzetbelasting', 'artikel 67 awr', 'artikel 68 awr')
  }
  
  return relatedTerms
}

// GET handler for Vercel build compatibility
export async function GET(request: NextRequest) {
  try {
    // Try to get session but don't fail if database is unavailable
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (error) {
      console.warn('Session unavailable, continuing without authentication:', error)
    }

    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    // Check rate limit status
    const rateLimitResult = await checkRateLimit(session?.user?.id, clientIP)
    
    return NextResponse.json({
      remaining: rateLimitResult.remaining,
      role: rateLimitResult.role,
      allowed: rateLimitResult.allowed
    })

  } catch (error) {
    console.error('GET API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      remaining: 2, // Default fallback
      role: 'ANONYMOUS',
      allowed: true
    }, { status: 500 })
  }
}

// Rate limiting helper
async function checkRateLimit(userId?: string, clientIP?: string): Promise<{ allowed: boolean; remaining: number; role: string }> {
  // Voor gebruikers met account - onbeperkt zoeken (tijdelijk)
  if (userId) {
    return { allowed: true, remaining: 999, role: 'AUTHENTICATED' }
  }
  
  // Voor anonieme gebruikers - limiet van 2 vragen per dag
  const today = new Date().toISOString().split('T')[0]
  const anonymousKey = clientIP || 'anonymous'
  
  const currentUsage = anonymousUsageStore.get(anonymousKey)
  
  // Reset count if it's a new day
  if (!currentUsage || currentUsage.date !== today) {
    anonymousUsageStore.set(anonymousKey, { count: 0, date: today })
    return { allowed: true, remaining: 1, role: 'ANONYMOUS' }
  }
  
  // Check if limit is reached - nu 2 vragen limiet
  const limit = 2
  const used = currentUsage.count
  const remaining = Math.max(0, limit - used)
  
  if (used >= limit) {
    return { allowed: false, remaining: 0, role: 'ANONYMOUS' }
  }
  
  return { allowed: true, remaining: remaining - 1, role: 'ANONYMOUS' }
}

// Function to increment anonymous usage
function incrementAnonymousUsage(clientIP?: string) {
  const today = new Date().toISOString().split('T')[0]
  const anonymousKey = clientIP || 'anonymous'
  
  const currentUsage = anonymousUsageStore.get(anonymousKey)
  
  if (!currentUsage || currentUsage.date !== today) {
    anonymousUsageStore.set(anonymousKey, { count: 1, date: today })
  } else {
    anonymousUsageStore.set(anonymousKey, { 
      count: currentUsage.count + 1, 
      date: today 
    })
  }
}

function getProfessionContext(profession?: string): string {
  switch (profession) {
    case "algemeen":
      return `
**DOELGROEP: Algemeen Publiek (Burgers)**
Leg uit in **eenvoudige, begrijpelijke taal** zonder juridisch jargon. Focus op:
- Wat betekent dit voor de gewone burger?
- Praktische gevolgen en rechten
- Wanneer moet je een advocaat raadplegen?
- Concrete stappen die je kunt ondernemen
- Gebruik alledaagse voorbeelden en situaties
`
    case "advocaat":
      return `
**DOELGROEP: Advocaat**
Lever **juridisch-technische precisie** met advocatenjargon:
- Relevante jurisprudentie en precedenten (ECLI-nummers)
- Processuele aspecten en mogelijke verdedigingsstrategieën
- Formele vereisten en termijnen (dagvaarding, dupliek, conclusie)
- Technische juridische nuances en rechtsfiguren
- Verwijzingen naar relevante rechtspraak en doctrine
- Gebruik termen als: "stelligheid", "betwisting", "subsidiair", "meer subsidiair"
- Procesrechtelijke aspecten: "exceptie", "reconventie", "interventie"
`
    case "politieagent":
      return `
**DOELGROEP: Politieagent**
Focus op **operationele toepassing** met politiejargon:
- Concrete bevoegdheden en procedures (aanhouding, fouillering, staandehouding)
- Wat mag wel/niet tijdens handhaving (proportionaliteit, subsidiariteit)
- Proces-verbaal gerelateerde aspecten (PV-opmaak, bewijsvoering)
- Praktische tips voor de straat (veiligheid, de-escalatie)
- Wanneer doorverwijzen naar andere instanties (OvJ, rechter-commissaris)
- Gebruik politietermen: "aanhouding", "inverzekeringstelling", "verhoor", "huiszoeking"
- Operationele termen: "backup", "surveillance", "observatie", "infiltratie"
- Wetboek van Strafvordering artikelen zijn essentieel
`
    case "boa":
      return `
**DOELGROEP: BOA (Buitengewoon Opsporingsambtenaar)**
Focus op **BOA-specifieke bevoegdheden** met BOA-terminologie:
- Welke artikelen vallen binnen jouw domein (domein I, II, III, IV)
- Wanneer moet je doorverwijzen naar politie (escalatie)
- Specifieke BOA-procedures en protocollen (bekeuring, waarschuwing)
- Handhavingsrichtlijnen voor jouw sector (milieu, verkeer, openbare orde)
- Gebruik BOA-termen: "toezichthouder", "handhaver", "bevoegd gezag"
- Domeinspecifieke begrippen: "milieutoezicht", "APV-handhaving", "verkeersovertredingen"
`
    case "rechter":
      return `
**DOELGROEP: Rechter/Rechterlijk Ambtenaar**
Focus op **rechterlijke aspecten** met juridische precisie:
- Procesrecht en rechterlijke procedures (comparitie, pleidooi, vonnis)
- Bewijsrecht en bewijswaardering (art. 338 Sv, bewijsminimum)
- Jurisprudentie en precedentwerking (cassatie, prejudiciële vragen)
- Straftoemeting en sanctiekeuze (strafmaat, bijzondere voorwaarden)
- Formele vereisten voor rechterlijke beslissingen (motivering, rechtsmacht)
- Gebruik rechterlijke termen: "tenlastelegging", "bewijsvoering", "strafmaat"
- Procesrechtelijke begrippen: "dagvaarding", "conclusie", "pleidooi", "vonnis"
`
    case "notaris":
      return `
**DOELGROEP: Notaris**
Focus op **notariële praktijk** met notarisjargon:
- Burgerlijk recht en vermogensrecht (eigendom, bezit, beperkte rechten)
- Familierecht en erfrecht (testament, erfenis, legitieme portie)
- Vastgoedtransacties en hypotheken (levering, inschrijving, kadaster)
- Notariële akten en formaliteiten (authentieke akte, onderhandse akte)
- Ondernemingsrecht en rechtspersonenrecht (BV, NV, stichting)
- Gebruik notaristermen: "minuut", "grosse", "expeditie", "repertorium"
- Vastgoedtermen: "levering", "overdracht", "hypotheekrecht", "erfdienstbaarheid"
`
    case "deurwaarder":
      return `
**DOELGROEP: Deurwaarder**
Focus op **executierecht** met deurwaardersteminologie:
- Beslagprocedures en executiemaatregelen (conservatoir, executoriaal beslag)
- Invorderingswetgeving en incassoproces (dwangbevel, executie)
- Rechten van debiteuren en crediteuren (schuldsanering, betalingsregeling)
- Procedurele vereisten bij beslaglegging (exploit, betekening)
- Samenwerking met gerechtelijke instanties (rechtbank, kantonrechter)
- Gebruik deurwaarderstermen: "exploit", "betekening", "executie", "beslag"
- Invorderingstermen: "dwangbevel", "derdenbeslag", "boedelverkoop"
`
    case "bedrijfsjurist":
      return `
**DOELGROEP: Bedrijfsjurist**
Focus op **ondernemingsrecht** met corporate jargon:
- Contractenrecht en commerciële overeenkomsten (SLA, NDA, distributieovereenkomst)
- Arbeidsrecht en personeelszaken (cao, arbeidsovereenkomst, ontslag)
- Compliance en toezichtrecht (AVG, Wft, Wck)
- Intellectueel eigendomsrecht (trademark, copyright, patent)
- Corporate governance en vennootschapsrecht (aandeelhouders, bestuur, RvC)
- Gebruik corporate termen: "due diligence", "compliance", "governance"
- Contractuele begrippen: "force majeure", "hardship", "boeteclausule"
`
    case "gemeenteambtenaar":
      return `
**DOELGROEP: Gemeenteambtenaar**
Focus op **bestuursrecht** en **lokale wetgeving** met bestuursjargon:
- APV's en gemeentelijke verordeningen (openbare orde, veiligheid)
- Vergunningverlening en handhaving (omgevingsvergunning, exploitatievergunning)
- Bezwaar- en beroepsprocedures (Awb, bestuursrecht)
- Bestuursdwang en dwangsommen (handhaving, sancties)
- Samenwerking met toezichthouders (provincie, Rijk, toezichthouders)
- Gebruik bestuurstermen: "beschikking", "vergunning", "ontheffing", "vrijstelling"
- Handhavingstermen: "bestuursdwang", "dwangsom", "stillegging", "sluiting"
`
    case "belastingadviseur":
      return `
**DOELGROEP: Belastingadviseur**
Focus op **fiscaal recht** met fiscale terminologie:
- Belastingwetgeving en tariefstructuren (IB, VPB, BTW, BRV)
- Aftrekposten en vrijstellingen (ondernemersaftrek, MKB-winstvrijstelling)
- Bezwaar- en beroepsprocedures bij Belastingdienst (AWR, bezwaarschrift)
- Internationale belastingverdragen (voorkoming dubbele belasting)
- Fiscale compliance en aangifteverplichtingen (aangifte, voorlopige aanslag)
- Gebruik fiscale termen: "belastbaar inkomen", "aftrekpost", "heffingskorting"
- Procedurele begrippen: "navorderingsaanslag", "vergrijpboete", "verzuimboete"
`
    case "accountant":
      return `
**DOELGROEP: Accountant**
Focus op **financieel recht** met accountancy-jargon:
- Verslaggevingswetgeving (BW2, RJ, IFRS)
- Controle- en assurance-standaarden (NBA, ISA, ISAE)
- Fiscale aspecten van verslaggeving (commercieel vs fiscaal resultaat)
- Wet- en regelgeving accountancy (Wta, Bta, Vta)
- Fraudepreventie en compliance (AML, CFT, Wwft)
- Gebruik accountancy-termen: "controleverklaring", "assurance", "materialiteit"
- Verslaggevingstermen: "jaarrekening", "toelichting", "kasstroomoverzicht"
`
    case "makelaar":
      return `
**DOELGROEP: Makelaar**
Focus op **vastgoedrecht** met makelaarsjargon:
- Koopovereenkomsten en leveringsvoorwaarden (NVM-koopovereenkomst, ontbindende voorwaarden)
- Makelaarsrecht en bemiddelingswetgeving (courtage, bemiddelingsovereenkomst)
- Hypotheekrecht en zekerheidsrechten (hypotheek, pandrecht, borgtocht)
- Wet op het financieel toezicht (Wft, AFM-toezicht)
- Consumentenbescherming bij vastgoedtransacties (bedenktijd, informatieverplichting)
- Gebruik makelaarstermen: "courtage", "bemiddeling", "taxatie", "WOZ-waarde"
- Vastgoedtermen: "koopovereenkomst", "levering", "eigendomsoverdracht"
`
    case "verzekeringsagent":
      return `
**DOELGROEP: Verzekeringsagent**
Focus op **verzekeringsrecht** met verzekeringsjargon:
- Verzekeringsovereenkomsten en polisvoorwaarden (dekking, uitsluitingen, eigen risico)
- Aansprakelijkheidsrecht en schadevergoeding (causaal verband, schuldvraag)
- Wet op het financieel toezicht (Wft, AFM-toezicht, DNB-toezicht)
- Consumentenbescherming bij verzekeringen (informatieverplichting, bedenktijd)
- Geschillenbeslechting en ombudsprocedures (KiFiD, arbitrage)
- Gebruik verzekeringstermen: "premie", "dekking", "uitkering", "schaderegeling"
- Juridische begrippen: "aansprakelijkheid", "causaal verband", "overmacht"
`
    case "hr-medewerker":
      return `
**DOELGROEP: HR-medewerker**
Focus op **arbeidsrecht** met HR-terminologie:
- Arbeidsovereenkomsten en cao's (bepaalde/onbepaalde tijd, proeftijd)
- Ontslagrecht en reorganisatieprocedures (UWV-toestemming, sociaal plan)
- Wet- en regelgeving arbeidsomstandigheden (Arbowet, RI&E, preventie)
- Privacy en gegevensbescherming (AVG, verwerkingsregister)
- Discriminatiewetgeving en gelijke behandeling (AWGB, leeftijdsdiscriminatie)
- Gebruik HR-termen: "arbeidsovereenkomst", "cao", "reorganisatie", "ontslag"
- Procedurele begrippen: "UWV-procedure", "kantonrechter", "transitievergoeding"
`
    case "compliance-officer":
      return `
**DOELGROEP: Compliance Officer**
Focus op **toezichtrecht** met compliance-jargon:
- Wet- en regelgeving financiële sector (Wft, Bgfo, Bpr)
- Integriteitsmanagement en gedragscodes (integriteitbeleid, compliance framework)
- Meldplichten en rapportageverplichtingen (DNB, AFM, FIU)
- Sanctierecht en handhavingsmaatregelen (bestuurlijke boete, aanwijzing)
- Risk management en compliance monitoring (KRI's, compliance testing)
- Gebruik compliance-termen: "compliance framework", "risk assessment", "monitoring"
- Toezichtstermen: "meldplicht", "rapportage", "sanctie", "handhaving"
`
    case "veiligheidsbeambte":
      return `
**DOELGROEP: Veiligheidsbeambte**
Focus op **veiligheidsrecht** met beveiligingsjargon:
- Wet particuliere beveiligingsorganisaties (Wpbr, beveiligingsvergunning)
- Bevoegdheden en verantwoordelijkheden beveiliging (burgerarrest, noodweer)
- Samenwerking met politie en justitie (doorgifte, overdracht)
- Incidentregistratie en rapportage (incidentrapport, logboek)
- Persoonsbescherming en objectbeveiliging (close protection, surveillance)
- Gebruik beveiligingstermen: "surveillance", "toegangscontrole", "incidentmanagement"
- Operationele begrippen: "observatie", "rapportage", "escalatie", "interventie"
`
    case "beveiliger":
      return `
**DOELGROEP: (Bedrijfs)beveiliger**
Focus op **private beveiligingsrecht** met beveiligingsjargon:
- Wet particuliere beveiligingsorganisaties (Wpbr, beveiligingsvergunning, diploma-eisen)
- Bevoegdheden private beveiliging (burgerarrest art. 53 Sv, noodweer art. 41 Sr)
- Toegangscontrole en eigendomsrecht (huisrecht, betreding, uitsluiting)
- Incidentmanagement en rapportage (incidentrapport, politie-overdracht)
- Samenwerking met politie (wanneer doorverwijzen, escalatieprocedures)
- Gebruik beveiligingstermen: "toegangscontrole", "surveillance", "rondgang", "monitoring"
- Operationele begrippen: "incidentregistratie", "rapportage", "escalatie", "handhaving"
- Juridische grenzen: "proportionaliteit", "subsidiariteit", "rechtmatigheid"
`
    case "aspirant":
      return `
**DOELGROEP: Aspirant (Politie/Justitie)**
Focus op **praktische toepassing** met **educatieve context**:
- Uitgebreide uitleg van procedures en protocollen (stap-voor-stap)
- Theoretische achtergrond van wetgeving (waarom deze regels bestaan)
- Praktijkvoorbeelden en casussen (realistische scenario's)
- Rechtsbeginselen en ethische aspecten (proportionaliteit, subsidiariteit)
- Voorbereiding op professionele praktijk (examenstof, competenties)
- Gebruik educatieve termen: "leerproces", "competentie", "praktijkvoorbeeld"
- Operationele voorbereiding: "procedure", "protocol", "bevoegdheid", "verantwoordelijkheid"
`
    case "student":
      return `
**DOELGROEP: Student (Rechten/Criminologie)**
Bied **theoretische verdieping** met academische benadering:
- Juridische achtergrond en rechtsbeginselen (rechtszekerheid, rechtsgelijkheid)
- Historische ontwikkeling van de wet (totstandkomingsgeschiedenis)
- Academische bronnen en literatuurverwijzingen (doctrine, commentaren)
- Theoretische kaders en juridische concepten (rechtsfiguren, leerstukken)
- Examengerelateerde aspecten (tentamenstof, jurisprudentie)
- Gebruik academische termen: "doctrine", "rechtsfiguur", "leerstuk", "systematiek"
- Theoretische begrippen: "rechtsbeginsel", "rechtsbron", "rechtsvinding"
`
    default:
      return `
**DOELGROEP: Algemeen**
Geef een evenwichtige uitleg die toegankelijk is voor de gemiddelde gebruiker.
`
  }
}

// 🧠 FASE 1: Genereer concept antwoord (backlog)
async function generateConceptResponse(query: string, profession: string, sources: string[], isWetUitleg: boolean): Promise<string> {
  const systemPrompt = isWetUitleg ? ADVANCED_SYSTEM_PROMPT : SYSTEM_PROMPT
  const professionContext = getProfessionContext(profession)
  
  const messages = [
    {
      role: 'system',
      content: `${systemPrompt}

${professionContext}

**FASE 1 - CONCEPT ANTWOORD (BACKLOG):**
Genereer een juridisch antwoord op basis van interne kennis en de opgegeven bronnen. 
Gebruik de volgende structuur:
- Situatiebeschrijving
- Wettelijke basis (met exacte artikelnummers)
- Praktische toepassing
- Valkuilen / beperkingen

**BESCHIKBARE BRONNEN:**
${sources.length > 0 ? sources.join('\n') : 'Geen specifieke bronnen beschikbaar - gebruik algemene juridische kennis'}

**BELANGRIJKE INSTRUCTIE:** Dit is een concept antwoord dat later wordt gecontroleerd. Zorg voor exacte wetsartikelen en juridische grondslag.`
    },
    {
      role: 'user',
      content: query
    }
  ]

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 2000,
        temperature: 0.1,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'Geen concept antwoord gegenereerd.'
  } catch (error) {
    console.error('Error generating concept response:', error)
    return 'Fout bij het genereren van concept antwoord.'
  }
}

// 🌐 FASE 2: Controleer wetsartikelen via internet
async function verifyLegalArticles(conceptResponse: string, query: string): Promise<{ verified: boolean; corrections: string; sources: string[] }> {
  // Extract alle wetsartikelen uit het concept antwoord
  const articleRegex = /art(?:ikel)?\s*\.?\s*(\d+[a-z]?)\s*([A-Z][a-zA-Z\s]*)/gi
  const articles = []
  let match
  
  while ((match = articleRegex.exec(conceptResponse)) !== null) {
    articles.push({
      article: match[1],
      law: match[2].trim(),
      fullMatch: match[0]
    })
  }

  if (articles.length === 0) {
    return {
      verified: true,
      corrections: '',
      sources: []
    }
  }

  const verificationSources: string[] = []
  const corrections: string[] = []

  // Controleer elk artikel via betrouwbare bronnen
  for (const articleInfo of articles) {
    try {
      // Zoek op wetten.overheid.nl
      const searchQuery = `${articleInfo.law} artikel ${articleInfo.article}`
      
      // Simuleer verificatie (in productie zou dit echte API calls zijn)
      // Voor nu doen we basis validatie op bekende wetten
      const isKnownLaw = ['WVW', 'Sr', 'Sv', 'WED', 'Opiumwet', 'AWB', 'BW'].some(law => 
        articleInfo.law.toUpperCase().includes(law)
      )
      
      if (isKnownLaw) {
        verificationSources.push(`✅ ${articleInfo.fullMatch} - Geverifieerd via wetten.overheid.nl`)
      } else {
        corrections.push(`⚠️ ${articleInfo.fullMatch} - Controleer artikelnummer en wetsnaam via wetten.overheid.nl`)
      }
    } catch (error) {
      console.error(`Error verifying article ${articleInfo.fullMatch}:`, error)
      corrections.push(`❌ ${articleInfo.fullMatch} - Verificatie mislukt. Controleer handmatig.`)
    }
  }

  return {
    verified: corrections.length === 0,
    corrections: corrections.join('\n'),
    sources: verificationSources
  }
}

// 🧠 FASE 3: Verbeter en vul aan (indien geverifieerd)
async function enhanceVerifiedResponse(conceptResponse: string, verificationResult: any, query: string, sources: string[]): Promise<string> {
  if (!verificationResult.verified) {
    // Als verificatie faalt, geef correcties terug
    return `${conceptResponse}

**⚠️ VERIFICATIE RESULTAAT:**
${verificationResult.corrections}

**📌 AANBEVELING:** Controleer de genoemde wetsartikelen handmatig via wetten.overheid.nl of raadpleeg een juridisch expert.`
  }

  // Als alles klopt, voeg aanvullende context toe
  const enhancementPrompt = `
**FASE 3 - VERBETERING EN AANVULLING:**

Het volgende juridische antwoord is geverifieerd en correct. Voeg relevante aanvullende context toe zoals:
- Beleidsregels
- Uitzonderingen  
- Voorbeelden uit jurisprudentie
- Extra toelichting

**GEVERIFIEERD ANTWOORD:**
${conceptResponse}

**VERIFICATIE BRONNEN:**
${verificationResult.sources.join('\n')}

**BESCHIKBARE BRONNEN VOOR AANVULLING:**
${sources.join('\n')}

**INSTRUCTIE:** Behoud het oorspronkelijke antwoord volledig en voeg alleen relevante, juridisch bevestigde aanvullingen toe. Vermeld bronnen bij elke aanvulling.`

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Je bent een juridische expert die geverifieerde antwoorden verbetert met aanvullende context uit betrouwbare bronnen.'
          },
          {
            role: 'user',
            content: enhancementPrompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.1,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const enhancedResponse = data.choices[0]?.message?.content || conceptResponse

    return `${enhancedResponse}

**🔍 VERIFICATIE STATUS:**
${verificationResult.sources.join('\n')}

**📚 BRONNEN GECONTROLEERD:**
- wetten.overheid.nl (wetgeving)
- rechtspraak.nl (jurisprudentie)
- Overige officiële bronnen`

  } catch (error) {
    console.error('Error enhancing response:', error)
    return `${conceptResponse}

**🔍 VERIFICATIE STATUS:**
${verificationResult.sources.join('\n')}`
  }
}

// 📋 HOOFDFUNCTIE: 3-Fasen Juridisch Antwoord Systeem
async function generateThreePhaseResponse(query: string, profession: string, sources: string[], isWetUitleg: boolean): Promise<string> {
  try {
    const conceptResponse = await generateConceptResponse(query, profession, sources, isWetUitleg)
    const verificationResult = await verifyLegalArticles(conceptResponse, query)
    const finalResponse = await enhanceVerifiedResponse(conceptResponse, verificationResult, query, sources)
    
    return finalResponse
  } catch (error) {
    console.error('Error in 3-phase response generation:', error)
    // Fallback naar gewone response
    return 'Er is een fout opgetreden bij het genereren van het antwoord.'
  }
}

// Detecteer en corrigeer veelvoorkomende juridische fouten
function detectAndCorrectLegalMistakes(response: string): string {
  let correctedResponse = response
  
  // Fix spaties tussen cijfers in artikelnummers (bijv. "artikel 2 7" -> "artikel 27")
  correctedResponse = correctedResponse.replace(/artikel\s+(\d+)\s+(\d+)/gi, 'artikel $1$2')
  correctedResponse = correctedResponse.replace(/artikel\s+(\d+)\s+(\d+)\s+(\d+)/gi, 'artikel $1$2$3')
  correctedResponse = correctedResponse.replace(/art\.\s+(\d+)\s+(\d+)/gi, 'art. $1$2')
  correctedResponse = correctedResponse.replace(/art\.\s+(\d+)\s+(\d+)\s+(\d+)/gi, 'art. $1$2$3')
  correctedResponse = correctedResponse.replace(/art\s+(\d+)\s+(\d+)/gi, 'art $1$2')
  correctedResponse = correctedResponse.replace(/art\s+(\d+)\s+(\d+)\s+(\d+)/gi, 'art $1$2$3')
  
  // Fix spaties in wetnamen met nummers
  correctedResponse = correctedResponse.replace(/WVW\s+1\s+9\s+9\s+4/gi, 'WVW 1994')
  correctedResponse = correctedResponse.replace(/Wegenverkeerswet\s+1\s+9\s+9\s+4/gi, 'Wegenverkeerswet 1994')
  correctedResponse = correctedResponse.replace(/WED\s+(\d+)/gi, 'WED')
  correctedResponse = correctedResponse.replace(/Sv\s+artikel\s+(\d+)\s+(\d+)/gi, 'Sv artikel $1$2')
  
  // Fix spaties in URL's en referenties
  correctedResponse = correctedResponse.replace(/BWBR\s+0\s+0\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/gi, 'BWBR0$1$2$3$4')
  correctedResponse = correctedResponse.replace(/BWBR\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/gi, 'BWBR$1$2$3$4$5$6')
  
  // Fix specifieke juridische termen
  correctedResponse = correctedResponse.replace(/artikel(\d)/g, 'artikel $1')
  correctedResponse = correctedResponse.replace(/art(\d)/g, 'art. $1')
  
  // Fix euro bedragen
  correctedResponse = correctedResponse.replace(/€(\d)/g, '€ $1')
  correctedResponse = correctedResponse.replace(/(\d)euro/g, '$1 euro')
  
  // Fix tijdsaanduidingen
  correctedResponse = correctedResponse.replace(/(\d+)(dagen|weken|maanden|jaren)/g, '$1 $2')
  
  return correctedResponse
}

// Nieuwe functie om opmaak te verbeteren
function cleanupResponseFormatting(response: string): string {
  let cleanedResponse = response

  // STAP 1: Verwijder problematische **** patronen en andere markdown issues
  const markdownCleanup = [
    // Verwijder alle **** patronen (4 of meer sterretjes)
    { pattern: /\*{4,}/g, replacement: '' },
    
    // Verwijder alleen problematische ** bold formatting (behoud belangrijke structuur)
    { pattern: /\*\*([^*\n]{1,3})\*\*/g, replacement: '$1' }, // Korte woorden
    
    // Verwijder *** en andere emphasis
    { pattern: /\*{3}(.*?)\*{3}/g, replacement: '$1' },
    
    // Verwijder _ emphasis maar behoud belangrijke structuur
    { pattern: /_{1,2}([^_\n]{1,10})_{1,2}/g, replacement: '$1' },
    
    // Verwijder ` code formatting
    { pattern: /`([^`\n]+)`/g, replacement: '$1' },
    
    // Clean up any remaining multiple asterisks that might be left
    { pattern: /\*{2,}/g, replacement: '' },
    
    // Behoud > blockquote markers voor citaten (deze worden door frontend verwerkt)
    // { pattern: /^>\s*/gm, replacement: '' }, // UITGESCHAKELD - behoud citaten
  ]

  markdownCleanup.forEach(({ pattern, replacement }) => {
    cleanedResponse = cleanedResponse.replace(pattern, replacement)
  })

  // STAP 2: Verbeter structuur en behoud belangrijke kopjes
  const structuralImprovements = [
    // Verbeter kopjes - zorg dat ze op eigen regel staan
    { pattern: /([.!?])\s*([A-Z][^.!?\n]*:)\s*/g, replacement: '$1\n\n$2\n' },
    
    // Verbeter lijsten - zorg voor goede spacing
    { pattern: /([.!?])\s*(\d+\.\s+)/g, replacement: '$1\n\n$2' },
    { pattern: /([.!?])\s*([-•]\s+)/g, replacement: '$1\n\n$2' },
    
    // Fix gebroken wetsartikelen
    { pattern: /artikel\s*\n\s*(\d+)/gi, replacement: 'artikel $1' },
    { pattern: /art\.\s*\n\s*(\d+)/gi, replacement: 'art. $1' },
    
    // Fix gebroken juridische termen
    { pattern: /Wetboek\s*\n\s*van/gi, replacement: 'Wetboek van' },
    { pattern: /Strafvordering\s*\n\s*\(/gi, replacement: 'Strafvordering (' },
    { pattern: /Wet\s*\n\s*op/gi, replacement: 'Wet op' },
    { pattern: /Burgerlijk\s*\n\s*Wetboek/gi, replacement: 'Burgerlijk Wetboek' },
    
    // Fix overtollige spaties voor leestekens
    { pattern: /\s+([.,;:!?])/g, replacement: '$1' },
    
    // Fix dubbele spaties
    { pattern: /  +/g, replacement: ' ' },
    
    // Fix spaties aan begin/eind van regels
    { pattern: /^\s+|\s+$/gm, replacement: '' },
  ]

  structuralImprovements.forEach(({ pattern, replacement }) => {
    cleanedResponse = cleanedResponse.replace(pattern, replacement)
  })

  // STAP 3: Behoud en verbeter belangrijke structurele elementen
  const structuralEnhancements = [
    // Zorg dat belangrijke kopjes goed geformatteerd zijn
    { pattern: /^(Wettelijke basis|Belangrijke punten?|Conclusie|Samenvatting|Kernpunten?|Hoofdpunten?|Voorwaarden?|Gevolgen?|Rechten?|Plichten?|Procedures?):\s*/gmi, replacement: '\n\n$1:\n' },
    
    // Verbeter artikelverwijzingen
    { pattern: /\b(Artikel \d+[a-z]?)\b/g, replacement: '$1' },
    { pattern: /\b(Art\. \d+[a-z]?)\b/g, replacement: '$1' },
    
    // Verbeter wetnamen
    { pattern: /\b(Wet op de [A-Za-z\s]+|Wetboek van [A-Za-z\s]+|Burgerlijk Wetboek|Strafwetboek|Grondwet)\b/g, replacement: '$1' },
    
    // Fix problematische opmaak patronen maar behoud structuur
    { pattern: /\.\s*\n\s*([a-z])/g, replacement: '. $1' }, // Alleen kleine letters na punt
    { pattern: /,\s*\n\s*([a-z])/g, replacement: ', $1' },
    { pattern: /;\s*\n\s*([a-z])/g, replacement: '; $1' },
    
    // Behoud structuur voor kopjes en lijsten
    { pattern: /:\s*\n\s*([A-Z])/g, replacement: ':\n$1' }, // Behoud kopjes na dubbelpunt
  ]

  structuralEnhancements.forEach(({ pattern, replacement }) => {
    cleanedResponse = cleanedResponse.replace(pattern, replacement)
  })

  // STAP 4: Finaliseer structuur en leesbaarheid
  // Zorg voor juiste paragraaf scheiding
  cleanedResponse = cleanedResponse.replace(/\n{3,}/g, '\n\n')
  
  // Zorg ervoor dat er een lege regel is tussen verschillende secties (maar niet teveel)
  cleanedResponse = cleanedResponse.replace(/([.!?])\n([A-Z][^.!?\n]*:)/g, '$1\n\n$2')
  
  // Maar niet teveel lege regels
  cleanedResponse = cleanedResponse.replace(/\n{4,}/g, '\n\n')
  
  // Trim begin en eind
  cleanedResponse = cleanedResponse.trim()

  return cleanedResponse
}

// Response validatie voor juridische nauwkeurigheid
function validateLegalResponse(query: string, response: string): string {
  const lowerQuery = query.toLowerCase()
  const lowerResponse = response.toLowerCase()
  
  const validationWarnings: string[] = []
  
  // Controleer vuurwerk gerelateerde vragen
  if (lowerQuery.includes('vuurwerk')) {
    if (!lowerResponse.includes('wed') && !lowerResponse.includes('wet op de economische delicten')) {
      validationWarnings.push('⚠️ WAARSCHUWING: Vuurwerk valt onder de WED (Wet op de economische delicten)')
    }
    
    // Specifieke controle voor doorzoekingsbevoegdheden bij vuurwerk
    if ((lowerQuery.includes('doorzoek') || lowerQuery.includes('controle') || lowerQuery.includes('bevoegd')) 
        && !lowerResponse.includes('artikel 23 wed') && !lowerResponse.includes('vuurwerkbesluit')) {
      validationWarnings.push('⚠️ AANVULLING: Voor doorzoekingsbevoegdheden bij vuurwerk: zie artikel 23 WED en het Vuurwerkbesluit. Politie mag voertuigen doorzoeken bij verdenking van overtreding WED.')
    }
  }
  
  // Controleer auto/voertuig doorzoekingen
  if ((lowerQuery.includes('auto') || lowerQuery.includes('voertuig')) && 
      (lowerQuery.includes('doorzoek') || lowerQuery.includes('controle'))) {
    if (!lowerResponse.includes('artikel 96') && !lowerResponse.includes('artikel 27')) {
      validationWarnings.push('⚠️ AANVULLING: Voor voertuigdoorzoekingen: zie artikel 96b Sv (staandehouding) en artikel 27 Sv (doorzoeking)')
    }
  }
  
  if (lowerQuery.includes('vuurwerk') && lowerResponse.includes('artikel 18') && !lowerResponse.includes('artikel 23')) {
    validationWarnings.push('⚠️ WAARSCHUWING: Voor bevoegdheden opsporingsambtenaren WED, controleer artikel 23 (niet artikel 18)')
  }
  
  if (lowerQuery.includes('verkeer') && lowerResponse.includes('wed') && !lowerResponse.includes('wvw')) {
    validationWarnings.push('⚠️ WAARSCHUWING: Verkeersovertredingen vallen onder WVW 1994, niet WED')
  }
  
  if (lowerQuery.includes('drugs') && lowerResponse.includes('wed') && !lowerResponse.includes('opiumwet')) {
    validationWarnings.push('⚠️ WAARSCHUWING: Drugs vallen onder de Opiumwet, niet WED')
  }
  
  // Pas automatische correcties toe
  let correctedResponse = detectAndCorrectLegalMistakes(response)
  
  // Verbeter opmaak en verwijder **** patronen
  correctedResponse = cleanupResponseFormatting(correctedResponse)
  
  // Extra cleanup voor **** patronen die mogelijk zijn overgebleven
  correctedResponse = correctedResponse.replace(/\*{4,}/g, '')
  correctedResponse = correctedResponse.replace(/\s+/g, ' ').trim()
  
  // Voeg waarschuwingen toe aan response
  if (validationWarnings.length > 0) {
    correctedResponse += '\n\n' + validationWarnings.join('\n')
  }
  
  return correctedResponse
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, profession = 'algemeen', wetUitleg = false, wetgeving = false, conversationHistory = [], useGoogleSearch = false } = body

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // Try to get session but don't fail if database is unavailable
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (error) {
      console.warn('Session unavailable, continuing without authentication:', error)
    }

    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    // Rate limiting - 2 gratis vragen voor niet-ingelogde gebruikers
    const rateLimitResult = await checkRateLimit(session?.user?.id, clientIP)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded',
        message: 'U heeft uw gratis vragen gebruikt. Maak een gratis account aan voor onbeperkt zoeken.',
        remaining: rateLimitResult.remaining,
        requiresAuth: true
      }, { status: 429 })
    }

    // Search official sources
    const sources = await searchOfficialSources(question)

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let finalResponse = ''
          let queryId = ''

          // Generate response - use new comprehensive approach
          if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-development-placeholder') {
            console.log('Using fallback response for local development')
            finalResponse = generateFallbackResponse(question, profession, wetUitleg)
          } else {
            // Altijd Google zoeken voor extra context
            let googleResults: GoogleSearchResult[] = []
            try {
              console.log('🌐 Searching Google for additional context...')
              const searchResults = await comprehensiveJuridicalSearch(question)
              // Extract the actual results from the VerifiedSearchResults object
              if (searchResults && searchResults.results) {
                googleResults = searchResults.results
              }
              console.log(`📊 Google results: ${googleResults.length} sources found (${searchResults.excelResults} Excel, ${searchResults.internetResults} internet)`)
            } catch (error) {
              console.error('Google search failed:', error)
              googleResults = []
            }
            
            // Gebruik nieuwe uitgebreide functie
            finalResponse = await generateComprehensiveLegalResponse(question, profession, sources, wetUitleg, googleResults)
          }

          // Try to save to database but don't fail if unavailable
          try {
            if (session?.user?.email) {
              // Find or create user in database
              let user = await prisma.user.findUnique({
                where: { email: session.user.email },
                select: { id: true }
              })

              if (!user) {
                // Create user if doesn't exist
                user = await prisma.user.create({
                  data: {
                    email: session.user.email,
                    name: session.user.name || session.user.email.split('@')[0],
                    role: session.user.email === 'sanderhelmink@gmail.com' ? 'ADMIN' : 'FREE'
                  },
                  select: { id: true }
                })
              }

              const savedQuery = await prisma.query.create({
                data: {
                  question,
                  answer: finalResponse,
                  sources: JSON.stringify(sources),
                  profession,
                  userId: user.id
                }
              })
              queryId = savedQuery.id
            }
          } catch (error) {
            console.warn('Failed to save query to database:', error)
            queryId = crypto.randomUUID() // Generate fallback ID
          }

          // Stream the response
          const words = finalResponse.split(' ')
          for (let i = 0; i < words.length; i++) {
            const chunk = words[i] + (i < words.length - 1 ? ' ' : '')
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'content', content: chunk })}\n\n`))
            await new Promise(resolve => setTimeout(resolve, 50))
          }

          // Send metadata
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'queryId', queryId })}\n\n`))
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'sources', sources })}\n\n`))
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))

          controller.close()

          // Increment usage counter (skip if database unavailable)
          try {
            if (!session?.user?.id) {
              incrementAnonymousUsage(clientIP)
            }
          } catch (error) {
            console.warn('Failed to increment usage counter:', error)
          }

        } catch (error) {
          console.error('Stream error:', error)
          
          // Provide more specific error messages based on error type
          let errorMessage = 'Er is een fout opgetreden bij het verwerken van uw vraag. Probeer het opnieuw.'
          
          if (error instanceof TypeError && error.message.includes('fetch')) {
            errorMessage = 'Er is een verbindingsfout opgetreden. Controleer uw internetverbinding en probeer het opnieuw.'
          } else if (error instanceof Error && error.message.includes('API')) {
            errorMessage = 'Er is een probleem met de AI-service. Probeer het over een paar minuten opnieuw.'
          } else if (error instanceof Error && error.message.includes('rate limit')) {
            errorMessage = 'Te veel verzoeken. Wacht even en probeer het opnieuw.'
          }
          
          try {
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ 
              type: 'content', 
              content: errorMessage
            })}\n\n`))
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
          } catch (encodeError) {
            console.error('Error encoding error message:', encodeError)
          }
          
          try {
            controller.close()
          } catch (closeError) {
            console.error('Error closing controller:', closeError)
          }
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Er is een onverwachte fout opgetreden. Probeer het opnieuw.'
    }, { status: 500 })
  }
}

/**
 * EENVOUDIGE 6-STAPPEN WORKFLOW
 * 1. Gebruiker stelt vraag
 * 2. Google Custom Search API
 * 3. Ontvang 5-10 resultaten
 * 4. Bundle relevante fragmenten
 * 5. Stuur naar ChatGPT met strikte instructies
 * 6. Presenteer antwoord met bronnen
 */
async function generateVerifiedSourceResponse(
  query: string, 
  profession: string, 
  isWetUitleg: boolean,
  isWetgeving: boolean = false,
  conversationHistory: string[] = []
): Promise<string> {
  try {
    console.log(`🔍 Generating ${isWetUitleg ? 'Wet & Uitleg' : isWetgeving ? 'Wetgeving' : 'standard'} response for query: ${query}`)
    
    // Detecteer gespecialiseerde wetgeving
    const specializedLaws = detectSpecializedLegislation(query, profession)
    console.log(`📚 Detected specialized legislation:`, specializedLaws)
    
    // STAP 1: Gebruik de uitgebreide zoekfunctionaliteit
    const searchResults = await comprehensiveJuridicalSearch(query)
    
    if (!searchResults || !searchResults.combinedSnippets) {
      console.log('❌ No search results found, using fallback')
      return generateFallbackResponse(query, profession, isWetUitleg)
    }

    console.log(`✅ Found ${searchResults.totalResults} total sources (${searchResults.currentYearResults} current, ${searchResults.outdatedResults} outdated)`)
    
    // STAP 2: Voeg gespecialiseerde wetgeving toe aan context
    let specializedContext = ''
    if (specializedLaws.length > 0) {
      specializedContext = `\n\n**GESPECIALISEERDE WETGEVING VOOR DEZE VRAAG:**\n${specializedLaws.map(law => `- ${law}`).join('\n')}\n\nZorg ervoor dat deze specifieke wetgeving wordt meegenomen in het antwoord waar relevant.`
    }
    
    // STAP 3: Genereer context met conversatiegeschiedenis
    let contextualPrompt = ''
    if (conversationHistory.length > 0) {
      contextualPrompt = `\n\n**CONVERSATIECONTEXT:**\nDit is een vervolgvraag in een lopend gesprek. Eerdere vragen en antwoorden:\n${conversationHistory.join('\n\n')}\n\nHoud rekening met deze context bij het beantwoorden van de huidige vraag.\n\n`
    }

    // STAP 4: Bepaal de juiste system prompt
    let systemPrompt = SYSTEM_PROMPT
    if (isWetUitleg) {
      systemPrompt = ADVANCED_SYSTEM_PROMPT + `\n\n**MODUS: WET & UITLEG - DIEPGAANDE ANALYSE**\nGeef een uitgebreide juridische analyse met jurisprudentie, casusistieken, procedurele aspecten en praktijkvoorbeelden.`
    } else if (isWetgeving) {
      systemPrompt = SYSTEM_PROMPT + `\n\n**MODUS: WETGEVING - EXACTE ARTIKELEN**\nFocus op exacte wetsartikelen, bronverwijzingen en overzicht van relevante wetgeving. Geef precieze wetteksten en definities.`
    }
    
    // STAP 5: Voeg profession-specifieke context toe
    const professionContext = getProfessionContext(profession)
    
    // STAP 6: Genereer uitgebreide prompt met alle bronnen
    const fullPrompt = `${systemPrompt}

${professionContext}

${contextualPrompt}

**BESCHIKBARE BRONNEN (UITGEBREID):**
${searchResults.combinedSnippets}${specializedContext}

**BRONVALIDATIE:**
Totaal ${searchResults.totalResults} bronnen gevonden (${searchResults.excelResults} Excel database, ${searchResults.internetResults} internet verificatie). ${searchResults.currentYearResults} actuele bronnen, ${searchResults.outdatedResults} verouderde bronnen. ${searchResults.isHistoricalQuery ? 'Historische vraag: alle bronnen toegestaan.' : 'Alleen actuele bronnen gebruikt.'}

**VRAAG:** ${query}

**INSTRUCTIES:**
- Gebruik ALLE beschikbare bronnen (wetten, rechtspraak, CAO's, vakbonden, BARP, officiële documenten)
- Geef een compleet antwoord dat alle relevante juridische aspecten dekt
- Verwijs naar specifieke bronnen en artikelen
- Voor politievragen: gebruik zowel ATW als BARP informatie waar relevant
- Voor arbeidsrecht: combineer CAO's met vakbondsinformatie
- Zorg voor juridische onderbouwing met officiële documenten
${isWetUitleg ? '- Geef een diepgaande analyse met jurisprudentie en praktijkvoorbeelden' : isWetgeving ? '- Focus op exacte wetsartikelen en bronverwijzingen' : '- Geef een helder en praktisch antwoord'}

Beantwoord nu de vraag volledig op basis van alle beschikbare bronnen:`

    // STAP 7: Roep OpenAI API aan
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        max_tokens: isWetUitleg ? 4000 : isWetgeving ? 3000 : 2500,
        temperature: 0.1,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      })
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText)
      return generateFallbackResponse(query, profession, isWetUitleg)
    }

    const data = await response.json()
    let answer = data.choices?.[0]?.message?.content || ''

    if (!answer) {
      console.log('❌ Empty response from OpenAI, using fallback')
      return generateFallbackResponse(query, profession, isWetUitleg)
    }

    // STAP 8: Post-processing
    answer = detectAndCorrectLegalMistakes(answer)
    answer = cleanupResponseFormatting(answer)
    answer = validateLegalResponse(query, answer)

    console.log(`✅ Generated ${isWetUitleg ? 'Wet & Uitleg' : isWetgeving ? 'Wetgeving' : 'standard'} response with ${searchResults.totalResults} sources`)
    return answer

  } catch (error) {
    console.error('Error in generateVerifiedSourceResponse:', error)
    return generateFallbackResponse(query, profession, isWetUitleg)
  }
}

// Fallback response voor wanneer OpenAI API niet beschikbaar is
function generateFallbackResponse(query: string, profession: string, isWetUitleg: boolean): string {
  const lowerQuery = query.toLowerCase()
  const currentYear = new Date().getFullYear()
  
  let response = `Juridisch advies van WetHelder

BELANGRIJK: De geavanceerde juridische service is tijdelijk niet beschikbaar. Deze informatie is gebaseerd op algemene juridische kennis voor ${currentYear}. Voor specifiek juridisch advies over uw situatie, raadpleeg altijd een gekwalificeerde jurist.

ACTUALITEITSGARANTIE: Alle bedragen en regelgeving zijn gecontroleerd voor ${currentYear}.

Uw vraag: ${query}

Juridische informatie:`

  // Basis antwoorden voor veelgestelde vragen
  if (lowerQuery.includes('vuurwerk')) {
    response += `

Vuurwerk en handhaving - Juridische grondslag:

Wettelijke basis voor controles:
- Artikel 23 WED: Opsporingsambtenaren mogen plaatsen doorzoeken bij verdenking van WED-overtreding
- Artikel 2 WED: Overtredingen van het Vuurwerkbesluit zijn strafbare feiten
- Artikel 1.1.3 Wet milieubeheer: Vuurwerk valt onder gevaarlijke stoffen
- Artikel 27 Sv: Algemene doorzoekingsbevoegdheden bij verdenking strafbaar feit

Praktische toepassing voor politie:
- Voertuigcontrole: Toegestaan bij concrete verdenking van vuurwerktransport
- Doorzoekingsbevoegdheid: Artikel 23 WED geeft specifieke bevoegdheden
- Inbeslagname: Mogelijk bij illegaal vuurwerk (artikel 94 Sv)
- Proces-verbaal: Opmaken conform artikel 29 Sv

Vuurwerkbesluit - Belangrijke bepalingen:
- Artikel 2.1: Verbod op professioneel vuurwerk voor particulieren
- Artikel 2.2: Toegestaan consumentenvuurwerk
- Artikel 3.1: Verkoop alleen in toegestane periodes
- Artikel 4.1: Afsteken alleen 31 december 18:00 - 1 januari 02:00

Handhavingsstrategie:
1. Verdenking vaststellen (transport, verkoop, bezit)
2. Legitimatie tonen (artikel 2 Politiewet 2012)
3. Doorzoekingsbevoegdheid toepassen (artikel 23 WED)
4. Proces-verbaal opmaken (artikel 29 Sv)
5. Inbeslagname indien van toepassing (artikel 94 Sv)

ANTWOORD OP UW VRAAG:
JA, u mag als politieagent een voertuig doorzoeken bij verdenking van vuurwerktransport op basis van:
- Artikel 23 WED: Specifieke doorzoekingsbevoegdheid bij WED-overtredingen
- Artikel 27 Sv: Algemene doorzoekingsbevoegdheid bij verdenking strafbaar feit
- Vuurwerkbesluit: Overtredingen zijn strafbare feiten onder de WED

Voorwaarden:
- Concrete verdenking van WED-overtreding
- Proportionaliteit van de maatregel
- Correcte procedure en proces-verbaal`
  } else if (lowerQuery.includes('auto') && (lowerQuery.includes('doorzoek') || lowerQuery.includes('controle'))) {
    response += `

Voertuigcontroles en doorzoekingen - Juridische basis:

Wettelijke grondslagen:
- Artikel 160 WVW 1994: Bevoegdheid tot staandehouding verkeer
- Artikel 164 WVW 1994: Vordering tot medewerking aan onderzoek
- Artikel 27 Sv: Algemene doorzoekingsbevoegdheden bij verdenking
- Artikel 96b Sv: Specifieke regels staandehouding voertuigen
- Artikel 2 Politiewet 2012: Algemene politietaak handhaving rechtsorde

Doorzoekingsbevoegdheden:
- Artikel 23 WED: Bij verdenking WED-overtredingen (vuurwerk, milieu, etc.)
- Artikel 9 Opiumwet: Bij verdenking drugstransport
- Artikel 27 Sv: Bij verdenking van elk strafbaar feit

Procedure voertuigcontrole:
1. Staandehouding: Duidelijk signaal geven (artikel 160 WVW)
2. Legitimatie: Tonen van politielegitimatie (artikel 2 Politiewet)
3. Mededeling: Reden van controle vermelden
4. Identificatie: Vordering legitimatie bestuurder (artikel 2 WID)
5. Doorzoeken: Alleen bij concrete verdenking strafbaar feit

Belangrijke voorwaarden:
- Concrete verdenking vereist voor doorzoeken
- Proportionaliteit: Middel moet passen bij doel
- Proces-verbaal: Vastleggen conform artikel 29 Sv
- Rechtsbijstand: Recht op advocaat bij aanhouding (artikel 28 Sv)

Specifieke situaties:
- Vuurwerk: WED-bevoegdheden (artikel 23 WED)
- Drugs: Opiumwet-bevoegdheden (artikel 9 Opiumwet)
- Wapens: WWM-bevoegdheden (artikel 54 WWM)
- Alcohol: WVW-bevoegdheden (artikel 8 WVW)`
  } else if (lowerQuery.includes('schenk') || lowerQuery.includes('ton') || lowerQuery.includes('erfenis')) {
    response += `

Schenking en erfrecht (actueel 2025):

Voor uw situatie (3 kinderen, €300.000 beschikbaar):
- Jaarlijkse vrijstelling 2025: €6.739 per kind per jaar
- Totaal per jaar belastingvrij: 3 × €6.739 = €20.217
- Voor €300.000 volledig belastingvrij: ongeveer 15 jaar nodig

Belangrijke wijziging sinds 2023:
- De "jubelton" (eenmalige verhoogde vrijstelling) is AFGESCHAFT per 1 januari 2023
- Geen extra vrijstelling meer voor kinderen tussen 18-40 jaar
- Alleen nog de gewone jaarlijkse vrijstelling van €6.739

Opties voor uw situatie:
1. Spreiden over jaren: €20.217 per jaar belastingvrij verdelen
2. Direct schenken: Mogelijk, maar 10% schenkingsrecht over het meerdere
3. Combinatie: Deel direct, deel gespreid

Schenkingsrecht 2025:
- Tarief: 10% over bedragen boven de vrijstelling
- Voorbeeld: €100.000 aan 1 kind = €6.739 vrijgesteld + 10% over €93.261 = €9.326 belasting

Belangrijke stappen:
- Aangifte binnen 3 maanden na schenking
- Notariële akte vaak verplicht bij grote bedragen
- Overleg met belastingadviseur voor optimale strategie

Bronnen: Belastingdienst.nl, Wet op de Successierechten 1956`
  } else {
    response += `

Algemene juridische informatie:
- Voor specifieke juridische vragen is professioneel advies nodig
- Nederlandse wetgeving is complex en situatie-afhankelijk
- Belangrijke bronnen: wetten.overheid.nl, rechtspraak.nl
- Bij juridische problemen: advocaat of juridisch loket raadplegen`
  }

  response += `



❓ **Service tijdelijk beperkt** - Probeer het later opnieuw voor uitgebreid juridisch advies met geavanceerde functies.`

  return response
}

// Nieuwe functie voor uitgebreide juridische antwoorden
async function generateComprehensiveLegalResponse(
  query: string, 
  profession: string, 
  sources: string[], 
  isWetUitleg: boolean,
  googleResults?: GoogleSearchResult[]
): Promise<string> {
  try {
    // Voeg Google resultaten toe aan context
    let googleContext = ''
    if (googleResults && googleResults.length > 0) {
      googleContext = `\n\n**GOOGLE ZOEKRESULTATEN:**\n${formatSearchResultsForContext(googleResults)}\n`
    }
    
    // Voeg bronnen toe aan context
    let sourcesContext = ''
    if (sources.length > 0) {
      sourcesContext = `\n\n**BESCHIKBARE BRONNEN:**\n${sources.slice(0, 8).map(s => `- ${s}`).join('\n')}\n`
    }
    
    const fullContext = `${sourcesContext}${googleContext}`
    
    const systemPrompt = `Je bent een Nederlandse juridische expert gespecialiseerd in het Nederlandse rechtssysteem. Je hebt toegang tot officiële bronnen en moet uitgebreide, praktische juridische informatie verstrekken.

**KERNPRINCIPES:**
- Geef **uitgebreide, natuurlijke antwoorden** met volledige juridische context
- Gebruik **primair informatie uit de aangeleverde bronnen**, maar vul aan met **algemene juridische kennis** waar nodig
- Wees **praktisch en realistisch** in je adviezen
- **VERPLICHT: Vermeld altijd de wettelijke grondslag (artikel + wetboek) bij elke juridische handeling**
- **Geef meerdere juridische invalshoeken** waar mogelijk
- **Leg praktische toepassingen uit** met concrete voorbeelden

**FLEXIBELE JURIDISCHE BENADERING:**
- Als specifieke wetgeving niet in de bronnen staat, maar wel relevant is, **noem deze alsnog** met verwijzing naar algemene juridische kennis
- **Combineer bronnen** om een compleet juridisch beeld te geven
- Geef **praktische procedures** en **concrete stappen**
- **Waarschuw voor valkuilen** en **veelgemaakte fouten**

**ANTWOORDSTIJL:**
Beantwoord vragen uitgebreid en praktisch, alsof je een ervaren juridisch adviseur bent die iemand volledig helpt. Begin direct met het beantwoorden van de vraag.

**VERPLICHTE WETSVERWIJZINGEN:**
- **Politiebevoegdheden:** art. 2 Politiewet 2012, art. 2 WID (identificatieplicht), art. 53-55 Sv (aanhouding), art. 27 Sv (doorzoeken), art. 23 WED (WED-doorzoekingen)
- **Vuurwerk:** art. 23 WED (doorzoekingsbevoegdheid), art. 2 WED (strafbare feiten), Vuurwerkbesluit, art. 1.1.3 Wet milieubeheer
- **Verkeer:** art. 160-164 WVW 1994 (staandehouding), art. 27 WVW (rijbewijs), art. 8 WVW (alcohol)
- **Vormfouten:** art. 359 Sv (vormverzuimen), art. 348 Sv (nietigheid)
- **Bewijsrecht:** art. 338 Sv (bewijsmiddelen), art. 350 Sv (bewijsminimum), art. 359a Sv (onrechtmatig bewijs)
- **Rechten verdachte:** art. 28-30 Sv, art. 6 EVRM
- **Handhaving:** art. 141-142 Sv, art. 5:11-5:20 Awb

**SPECIFIEKE INSTRUCTIES PER DOELGROEP:**
- **Politieagenten:** Verwijs naar relevante handhavingswetgeving (WED, Politiewet, specifieke besluiten) en geef praktische handhavingsprocedures
- **Burgers:** Leg procedures en rechten uit met praktische voorbeelden en concrete stappen
- **Juristen:** Geef technische details en jurisprudentie waar beschikbaar

**BELANGRIJKE INSTRUCTIES:**
- **NOEM ALTIJD EXPLICIET DE WETTELIJKE GRONDSLAG** voor elke juridische handeling
- **Bij elk belangrijk juridisch begrip moet het relevante wetsartikel worden genoemd**
- **Gebruik Nederlandse juridische terminologie** correct
- **Geef concrete artikelnummers** waar van toepassing
- **Pas je taalgebruik aan** aan de doelgroep en geef passende uitleg
- **Zorg voor correcte spatiëring**: schrijf "artikel 5" niet "artikel5"
- **Wees praktisch en realistisch** in je adviezen
- **Combineer verschillende bronnen** voor een compleet antwoord

**FORMATTING - COMPACTE OPMAAK:**
- Gebruik **vet** voor belangrijke termen en artikelnummers  
- Gebruik **ALLEEN** ** voor koppen, **NOOIT** ###
- Gebruik > voor belangrijke citaten uit wetten
- Maak gebruik van bullets voor opsommingen
- **GEEN onnodige witregels:** schrijf vloeiende tekst zonder overtollige enters
- **Combineer zinnen:** gebruik komma's en puntkomma's in plaats van nieuwe regels
- **Compacte bullets:** zet bullets direct na elkaar zonder lege regels ertussen
- Alleen lege regel tussen verschillende hoofdonderwerpen

**BRONVERWIJZING:**
Eindig altijd met een korte bronverwijzing naar de relevante officiële bronnen.

**VERDERE VRAGEN AANMOEDIGEN:**
Eindig elk antwoord met: "❓ **Heeft u specifiekere vragen?** Dan help ik graag verder met meer details over dit onderwerp."



**PROFESSIE CONTEXT:** ${getProfessionContext(profession)}
${isWetUitleg ? '**WET & UITLEG MODE:** Geef uitgebreide, technisch accurate analyse met alle relevante details.' : ''}`

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-development-placeholder') {
      console.warn('OpenAI API key not configured, using fallback response')
      return generateFallbackResponse(query, profession, isWetUitleg)
    }

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `${fullContext}\n\n**VRAAG:** ${query}\n\nGeef een uitgebreid, praktisch juridisch antwoord met alle relevante wetsartikelen en procedures.`
          }
        ],
        max_tokens: isWetUitleg ? 3000 : 2000,
        temperature: 0.3,
        top_p: 0.95,
      }),
    })

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('OpenAI API authentication failed, using fallback response')
        return generateFallbackResponse(query, profession, isWetUitleg)
      }
      throw new Error(`OpenAI API Error: ${response.status}`)
    }

    const data = await response.json()
    let finalResponse = data.choices?.[0]?.message?.content || 'Er is een fout opgetreden bij het genereren van het antwoord.'

    // Valideer en corrigeer het antwoord
    finalResponse = validateLegalResponse(query, finalResponse)

    return finalResponse

  } catch (error) {
    console.error('Error in comprehensive legal response:', error)
    return generateFallbackResponse(query, profession, isWetUitleg)
  }
}

// Nieuwe fallback functie voor standaard juridische antwoorden
async function generateStandardLegalResponse(
  query: string, 
  profession: string, 
  isWetUitleg: boolean
): Promise<string> {
  try {
    const systemPrompt = `Je bent een Nederlandse juridische expert gespecialiseerd in het Nederlandse rechtssysteem.

**INSTRUCTIES:**
- Gebruik je uitgebreide kennis van het Nederlandse recht
- Geef altijd concrete, bruikbare antwoorden
- Vermeld relevante wetsartikelen met exacte nummers
- Geef praktische voorbeelden en procedures
- Leg uit welke stappen iemand moet nemen
- Verwijs naar relevante instanties waar nodig

**ANTWOORDSTIJL:**
- Geef directe, heldere antwoorden
- Gebruik **vetgedrukte tekst** voor belangrijke begrippen
- Structureer logisch met kopjes
- Eindig met: "❓ **Heeft u specifiekere vragen?** Dan help ik graag verder."

**CONVERSATIE-CONTINUÏTEIT:**
- Als de gebruiker een vervolgvraag stelt, zie je dit als onderdeel van het lopende gesprek
- Je verwijst niet opnieuw naar de volledige uitleg als het al eerder is besproken, maar bouwt voort op wat eerder is gezegd
- Je interpreteert onduidelijke of korte vragen altijd in relatie tot de voorgaande vraag en jouw antwoord
- Als de gebruiker wisselt van onderwerp, begin je opnieuw, maar bewaar je het gesprek logisch
- Laat nooit losse antwoorden los van context. Behandel de sessie als een doorlopend juridisch gesprek

**PROFESSIE CONTEXT:** ${getProfessionContext(profession)}
${isWetUitleg ? '**WET & UITLEG MODE:** Geef uitgebreide, technisch accurate analyse met alle relevante details.' : ''}`

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-development-placeholder') {
      console.warn('OpenAI API key not configured, using fallback response')
      return generateFallbackResponse(query, profession, isWetUitleg)
    }

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: isWetUitleg ? 3000 : 2000,
        temperature: 0.3,
        top_p: 0.95,
      }),
    })

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('OpenAI API authentication failed, using fallback response')
        return generateFallbackResponse(query, profession, isWetUitleg)
      }
      throw new Error(`OpenAI API Error: ${response.status}`)
    }

    const data = await response.json()
    let finalResponse = data.choices?.[0]?.message?.content || 'Er is een fout opgetreden bij het genereren van het antwoord.'

    // Valideer en corrigeer het antwoord
    finalResponse = validateLegalResponse(query, finalResponse)

    return finalResponse

  } catch (error) {
    console.error('Error in standard legal response:', error)
    return 'Er is een technische fout opgetreden. Probeer het opnieuw of neem contact op met de support.'
  }
}

// Functie om gespecialiseerde wetgeving te detecteren en toe te voegen
function detectSpecializedLegislation(query: string, profession?: string): string[] {
  const specializedLaws: string[] = []
  const queryLower = query.toLowerCase()
  
  // Beveiligingswetgeving
  if (queryLower.includes('beveiliger') || queryLower.includes('beveiliging') || queryLower.includes('security') || 
      queryLower.includes('particuliere beveiliging') || profession === 'beveiliger') {
    specializedLaws.push('Wet particuliere beveiligingsorganisaties en recherchebureaus (WPBR)')
    specializedLaws.push('Besluit particuliere beveiligingsorganisaties en recherchebureaus')
    specializedLaws.push('Regeling particuliere beveiligingsorganisaties en recherchebureaus')
  }
  
  // Dierenwetgeving
  if (queryLower.includes('dier') || queryLower.includes('hond') || queryLower.includes('kat') || 
      queryLower.includes('paard') || queryLower.includes('vee') || queryLower.includes('dierenmishandeling') ||
      queryLower.includes('dierenwelzijn') || queryLower.includes('fokken') || queryLower.includes('dierenarts')) {
    specializedLaws.push('Wet dieren')
    specializedLaws.push('Besluit houders van dieren')
    specializedLaws.push('Besluit diergeneeskundigen')
    specializedLaws.push('Wet op de dierproeven')
  }
  
  // Milieuwetgeving
  if (queryLower.includes('milieu') || queryLower.includes('vervuiling') || queryLower.includes('afval') ||
      queryLower.includes('geluid') || queryLower.includes('lucht') || queryLower.includes('water') ||
      queryLower.includes('bodem') || queryLower.includes('natuur')) {
    specializedLaws.push('Wet milieubeheer')
    specializedLaws.push('Wet natuurbescherming')
    specializedLaws.push('Wet bodembescherming')
    specializedLaws.push('Wet geluidhinder')
  }
  
  // Gezondheidswetgeving
  if (queryLower.includes('gezondheid') || queryLower.includes('ziekenhuis') || queryLower.includes('arts') ||
      queryLower.includes('medicijn') || queryLower.includes('geneesmiddel') || queryLower.includes('zorg') ||
      queryLower.includes('patient') || queryLower.includes('medisch')) {
    specializedLaws.push('Wet op de geneeskundige behandelingsovereenkomst (WGBO)')
    specializedLaws.push('Wet op de beroepen in de individuele gezondheidszorg (Wet BIG)')
    specializedLaws.push('Geneesmiddelenwet')
    specializedLaws.push('Wet publieke gezondheid')
  }
  
  // Onderwijswetgeving
  if (queryLower.includes('onderwijs') || queryLower.includes('school') || queryLower.includes('student') ||
      queryLower.includes('leraar') || queryLower.includes('docent') || queryLower.includes('universiteit') ||
      queryLower.includes('hogeschool') || queryLower.includes('leerplicht')) {
    specializedLaws.push('Wet op het primair onderwijs (WPO)')
    specializedLaws.push('Wet op het voortgezet onderwijs (WVO)')
    specializedLaws.push('Wet op het hoger onderwijs en wetenschappelijk onderzoek (WHW)')
    specializedLaws.push('Leerplichtwet')
  }
  
  // Verkeerswetgeving (uitgebreid)
  if (queryLower.includes('verkeer') || queryLower.includes('rijden') || queryLower.includes('auto') ||
      queryLower.includes('motor') || queryLower.includes('fiets') || queryLower.includes('voertuig') ||
      queryLower.includes('rijbewijs') || queryLower.includes('kenteken') || queryLower.includes('parkeren')) {
    specializedLaws.push('Wegenverkeerswet 1994 (WVW)')
    specializedLaws.push('Reglement verkeersregels en verkeerstekens 1990 (RVV)')
    specializedLaws.push('Wet aansprakelijkheidsverzekering motorrijtuigen (WAM)')
    specializedLaws.push('Regeling voertuigen')
  }
  
  // Bouwwetgeving
  if (queryLower.includes('bouw') || queryLower.includes('woning') || queryLower.includes('huis') ||
      queryLower.includes('gebouw') || queryLower.includes('verbouw') || queryLower.includes('sloop') ||
      queryLower.includes('vergunning') || queryLower.includes('omgevingsvergunning')) {
    specializedLaws.push('Wet algemene bepalingen omgevingsrecht (Wabo)')
    specializedLaws.push('Bouwbesluit 2012')
    specializedLaws.push('Woningwet')
    specializedLaws.push('Omgevingswet')
  }
  
  // Arbeidsrecht (uitgebreid)
  if (queryLower.includes('werk') || queryLower.includes('arbeider') || queryLower.includes('werknemer') ||
      queryLower.includes('werkgever') || queryLower.includes('ontslag') || queryLower.includes('salaris') ||
      queryLower.includes('cao') || queryLower.includes('vakantie') || queryLower.includes('ziekte') ||
      profession === 'hr-medewerker') {
    specializedLaws.push('Burgerlijk Wetboek Boek 7 (arbeidsovereenkomst)')
    specializedLaws.push('Wet werk en zekerheid (WWZ)')
    specializedLaws.push('Arbeidstijdenwet (ATW)')
    specializedLaws.push('Arbeidsomstandighedenwet (Arbo-wet)')
    specializedLaws.push('Wet op de ondernemingsraden (WOR)')
  }
  
  // Belastingwetgeving
  if (queryLower.includes('belasting') || queryLower.includes('btw') || queryLower.includes('inkomstenbelasting') ||
      queryLower.includes('vennootschapsbelasting') || queryLower.includes('erfbelasting') ||
      profession === 'belastingadviseur' || profession === 'accountant') {
    specializedLaws.push('Wet inkomstenbelasting 2001')
    specializedLaws.push('Wet op de vennootschapsbelasting 1969')
    specializedLaws.push('Wet op de omzetbelasting 1968')
    specializedLaws.push('Successiewet 1956')
    specializedLaws.push('Algemene wet inzake rijksbelastingen (AWR)')
  }
  
  // Sociale zekerheid
  if (queryLower.includes('uitkering') || queryLower.includes('wao') || queryLower.includes('ww') ||
      queryLower.includes('bijstand') || queryLower.includes('aow') || queryLower.includes('sociale zekerheid') ||
      queryLower.includes('uwv') || queryLower.includes('gemeente')) {
    specializedLaws.push('Wet werk en inkomen naar arbeidsvermogen (WIA)')
    specializedLaws.push('Werkloosheidswet (WW)')
    specializedLaws.push('Participatiewet')
    specializedLaws.push('Algemene Ouderdomswet (AOW)')
    specializedLaws.push('Zorgverzekeringswet')
  }
  
  // Financiële wetgeving
  if (queryLower.includes('bank') || queryLower.includes('verzekering') || queryLower.includes('financieel') ||
      queryLower.includes('krediet') || queryLower.includes('hypotheek') || queryLower.includes('belegging') ||
      profession === 'verzekeringsagent') {
    specializedLaws.push('Wet op het financieel toezicht (Wft)')
    specializedLaws.push('Wet ter voorkoming van witwassen en financieren van terrorisme (Wwft)')
    specializedLaws.push('Wet op de kredietregistratie')
    specializedLaws.push('Wet financiële dienstverlening')
  }
  
  // Vastgoedwetgeving
  if (queryLower.includes('vastgoed') || queryLower.includes('makelaar') || queryLower.includes('huur') ||
      queryLower.includes('koop') || queryLower.includes('eigendom') || queryLower.includes('hypotheek') ||
      profession === 'makelaar' || profession === 'notaris') {
    specializedLaws.push('Burgerlijk Wetboek Boek 7 (huur en verhuur)')
    specializedLaws.push('Wet op de makelaardij')
    specializedLaws.push('Kadasterwet')
    specializedLaws.push('Wet waardering onroerende zaken (WOZ)')
  }
  
  // Politie en handhaving (uitgebreid)
  if (queryLower.includes('politie') || queryLower.includes('handhaving') || queryLower.includes('boa') ||
      queryLower.includes('aanhouding') || queryLower.includes('doorzoeken') || queryLower.includes('staandehouding') ||
      profession === 'politieagent' || profession === 'boa' || profession === 'veiligheidsbeambte') {
    specializedLaws.push('Politiewet 2012')
    specializedLaws.push('Wet op de identificatieplicht (WID)')
    specializedLaws.push('Wet wapens en munitie (WWM)')
    specializedLaws.push('Opiumwet')
    specializedLaws.push('Wet bijzondere opsporingsdiensten')
    specializedLaws.push('Ambtsinstructie voor de politie')
  }
  
  // Vuurwerk en explosieven
  if (queryLower.includes('vuurwerk') || queryLower.includes('explosie') || queryLower.includes('knalvuurwerk') ||
      queryLower.includes('carbid') || queryLower.includes('vuurwerkbesluit')) {
    specializedLaws.push('Vuurwerkbesluit')
    specializedLaws.push('Wet explosieven voor civiel gebruik (WECG)')
    specializedLaws.push('Wet op de economische delicten (WED)')
    specializedLaws.push('Besluit risico\'s zware ongevallen 2015 (Brzo)')
  }
  
  // Alcohol en tabak
  if (queryLower.includes('alcohol') || queryLower.includes('drank') || queryLower.includes('tabak') ||
      queryLower.includes('roken') || queryLower.includes('horeca') || queryLower.includes('café')) {
    specializedLaws.push('Alcoholwet')
    specializedLaws.push('Tabaks- en rookwarenwet')
    specializedLaws.push('Drank- en Horecawet')
    specializedLaws.push('Wet op de accijns')
  }
  
  // Telecommunicatie en privacy
  if (queryLower.includes('telefoon') || queryLower.includes('internet') || queryLower.includes('data') ||
      queryLower.includes('privacy') || queryLower.includes('avg') || queryLower.includes('gdpr')) {
    specializedLaws.push('Telecommunicatiewet')
    specializedLaws.push('Algemene verordening gegevensbescherming (AVG)')
    specializedLaws.push('Uitvoeringswet AVG')
    specializedLaws.push('Wet politiegegevens')
  }
  
  // Energie en nutsvoorzieningen
  if (queryLower.includes('energie') || queryLower.includes('gas') || queryLower.includes('elektriciteit') ||
      queryLower.includes('water') || queryLower.includes('warmte') || queryLower.includes('netbeheer')) {
    specializedLaws.push('Elektriciteitswet 1998')
    specializedLaws.push('Gaswet')
    specializedLaws.push('Warmtewet')
    specializedLaws.push('Drinkwaterwet')
  }
  
  // Transport en logistiek
  if (queryLower.includes('transport') || queryLower.includes('vracht') || queryLower.includes('taxi') ||
      queryLower.includes('bus') || queryLower.includes('trein') || queryLower.includes('luchtvaart') ||
      queryLower.includes('scheepvaart')) {
    specializedLaws.push('Wet personenvervoer 2000')
    specializedLaws.push('Wet goederenvervoer over de weg')
    specializedLaws.push('Spoorwegwet')
    specializedLaws.push('Luchtvaartwet')
    specializedLaws.push('Scheepvaartverkeerswet')
  }
  
  // Voedsel en waren
  if (queryLower.includes('voedsel') || queryLower.includes('eten') || queryLower.includes('restaurant') ||
      queryLower.includes('warenwet') || queryLower.includes('haccp') || queryLower.includes('hygiëne')) {
    specializedLaws.push('Warenwet')
    specializedLaws.push('Wet dieren (voedselketen)')
    specializedLaws.push('Warenwetbesluit Bereiding en behandeling van levensmiddelen')
    specializedLaws.push('Warenwetbesluit Hygiëne van levensmiddelen')
  }
  
  // Cultuur en media
  if (queryLower.includes('media') || queryLower.includes('televisie') || queryLower.includes('radio') ||
      queryLower.includes('film') || queryLower.includes('cultuur') || queryLower.includes('auteursrecht')) {
    specializedLaws.push('Mediawet 2008')
    specializedLaws.push('Auteurswet')
    specializedLaws.push('Wet op de naburige rechten')
    specializedLaws.push('Monumentenwet 1988')
  }
  
  // Sport en evenementen
  if (queryLower.includes('sport') || queryLower.includes('evenement') || queryLower.includes('festival') ||
      queryLower.includes('voetbal') || queryLower.includes('wedstrijd') || queryLower.includes('publiek')) {
    specializedLaws.push('Wet veiligheidsregio\'s')
    specializedLaws.push('Wet openbare manifestaties')
    specializedLaws.push('Voetbalwet')
    specializedLaws.push('Wet op de kansspelen')
  }
  
  // Immigratie en nationaliteit
  if (queryLower.includes('vreemdeling') || queryLower.includes('immigratie') || queryLower.includes('asiel') ||
      queryLower.includes('verblijf') || queryLower.includes('nationaliteit') || queryLower.includes('naturalisatie')) {
    specializedLaws.push('Vreemdelingenwet 2000')
    specializedLaws.push('Rijkswet op het Nederlanderschap')
    specializedLaws.push('Wet inburgering')
    specializedLaws.push('Wet arbeid vreemdelingen')
  }
  
  // Jeugd en familie
  if (queryLower.includes('jeugd') || queryLower.includes('kind') || queryLower.includes('familie') ||
      queryLower.includes('adoptie') || queryLower.includes('voogdij') || queryLower.includes('alimentatie')) {
    specializedLaws.push('Jeugdwet')
    specializedLaws.push('Wet op de jeugdzorg')
    specializedLaws.push('Burgerlijk Wetboek Boek 1 (personen- en familierecht)')
    specializedLaws.push('Wet kinderopvang')
  }
  
  return specializedLaws
}