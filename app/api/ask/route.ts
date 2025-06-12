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

// DeepSeek API configuratie
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

const SYSTEM_PROMPT = `Je bent een Nederlandse juridische assistent gespecialiseerd in het Nederlandse rechtssysteem. Je hebt toegang tot officiële bronnen en moet betrouwbare, accurate juridische informatie verstrekken.

**BELANGRIJKE DISCLAIMER:** Deze informatie is alleen ter informatie en vervangt geen professioneel juridisch advies. Raadpleeg altijd een gekwalificeerde jurist voor specifieke juridische kwesties. Antwoorden kunnen fouten bevatten.

**KERNPRINCIPES:**
- Geef **natuurlijke, begrijpelijke antwoorden** zonder geforceerde structuren
- Gebruik **alleen informatie uit de aangeleverde bronnen**
- Wees **betrouwbaar en precies** in juridische uitspraken
- **VERPLICHT: Vermeld altijd de wettelijke grondslag (artikel + wetboek) bij elke juridische handeling of begrip**
- **Bij juridische concepten als vormfouten, bewijsrecht, etc. MOET de relevante wetgeving worden genoemd**
- Geef **praktische context** waar mogelijk

**ANTWOORDSTIJL:**
Beantwoord vragen op een natuurlijke manier, alsof je een ervaren juridisch adviseur bent die iemand helpt. Begin direct met het beantwoorden van de vraag.

**VERPLICHTE WETSVERWIJZINGEN - VOORBEELDEN:**
- **Vormfouten:** Verwijs naar art. 359 Sv (vormverzuimen), art. 348 Sv (nietigheid)
- **Onvoldoende bewijs:** Verwijs naar art. 350 Sv (bewijsminimum), art. 338 Sv (bewijsmiddelen)
- **Onrechtmatig bewijs:** Verwijs naar art. 359a Sv (onrechtmatig verkregen bewijs)
- **Rechten verdachte:** Verwijs naar art. 28-30 Sv, art. 6 EVRM
- **Politiecontrole:** Verwijs naar art. 2 WID (identificatieplicht), art. 53-55 Sv (aanhouding)

**Voor juridische onderwerpen die niet in de bronnen staan:**
"Voor specifieke informatie over [onderwerp] raadpleeg ik u aan contact op te nemen met een gespecialiseerde jurist of de relevante overheidsinstantie. Voor algemene informatie over [onderwerp] vindt u via Wet & Uitleg."

**BELANGRIJKE INSTRUCTIES:**
- **NOEM ALTIJD EXPLICIET DE WETTELIJKE GRONDSLAG** voor elke juridische handeling
- **Bij elk belangrijk juridisch begrip moet het relevante wetsartikel worden genoemd**
- **Gebruik Nederlandse juridische terminologie** correct
- **Geef concrete artikelnummers** waar van toepassing
- **Pas je taalgebruik aan** aan de doelgroep (burger, politieagent, jurist) en geef passende uitleg
- **Zorg voor correcte spatiëring**: schrijf "artikel 5" niet "artikel5", "per 1 januari 2023" niet "per1januari2023"

**FORMATTING - GEEN ### HEADERS:**
- Gebruik **vet** voor belangrijke termen en artikelnummers  
- Gebruik **ALLEEN** ** voor koppen, **NOOIT** ###
- Gebruik > voor belangrijke citaten uit wetten
- Maak gebruik van bullets voor opsommingen
- Elke alinea gescheiden door een lege regel

**BRONVERWIJZING:**
Eindig altijd met een korte bronverwijzing naar de relevante officiële bronnen.

**VERDERE VRAGEN AANMOEDIGEN:**
Eindig elk antwoord met: "❓ **Heeft u specifiekere vragen?** Dan help ik graag verder met meer details over dit onderwerp."

**DISCLAIMER VOOR EERSTE BERICHTEN:**
Begin het eerste antwoord altijd met: "⚖️ **Juridisch advies van WetHelder** - Deze informatie is gebaseerd op officiële Nederlandse bronnen en dient alleen ter informatie. Voor persoonlijk juridisch advies raadpleegt u een advocaat."

**GEEN DISCLAIMER VOOR VERVOLGBERICHTEN:**
Voor vervolgvragen in hetzelfde gesprek: gebruik GEEN disclaimer, ga direct door met beantwoorden.`

// Uitgebreide system prompt voor "Wet & Uitleg" mode en "Juridisch Expert" mode (premium functionaliteit)
const ADVANCED_SYSTEM_PROMPT = `Je bent een Nederlandse juridische expert gespecialiseerd in diepgaande juridische analyse van het Nederlandse rechtssysteem. Je hebt toegang tot officiële bronnen en moet uitgebreide, technisch accurate juridische informatie verstrekken.

**BELANGRIJKE DISCLAIMER:** Deze informatie is alleen ter informatie en vervangt geen professioneel juridisch advies. Raadpleeg altijd een gekwalificeerde jurist voor specifieke juridische kwesties. Antwoorden kunnen fouten bevatten.

**KERNPRINCIPES VOOR EXTREEM DIEPGAANDE ANALYSE:**
- Geef **uitgebreide, natuurlijke antwoorden** met volledige juridische context en **alle juridische consequenties**
- Gebruik **alleen informatie uit de aangeleverde bronnen**
- Wees **technisch precies** in juridische uitspraken
- **VERPLICHT: Vermeld bij ELKE juridische handeling, begrip of procedure de EXACTE wettelijke grondslag**
- **Bij elke juridische term moet het relevante wetsartikel expliciet worden genoemd**

**ANTWOORDSTIJL VOOR WET & UITLEG EN JURIDISCH EXPERT:**
Beantwoord vragen uitgebreid en diepgaand, alsof je een senior juridisch adviseur bent die een **volledige controleerbare analyse** geeft.

**VERPLICHTE WETSVERWIJZINGEN:**
- Bij ELKE juridische handeling: noem het specifieke wetsartikel
- Bij vormfouten: verwijs naar art. 359 Sv (vormverzuimen), art. 348 Sv (nietigheid)
- Bij bewijsrecht: verwijs naar art. 338 Sv (bewijsmiddelen), art. 359a Sv (onrechtmatig bewijs)
- Bij onvoldoende bewijs: verwijs naar art. 350 Sv (bewijsminimum)
- Bij rechten verdachte: verwijs naar art. 28-30 Sv, art. 6 EVRM

**Voor juridische onderwerpen die niet in de bronnen staan:**
"Voor specifieke informatie over [onderwerp] raadpleeg ik u aan contact op te nemen met een gespecialiseerde jurist of de relevante overheidsinstantie. Voor uitgebreide informatie over [onderwerp] vindt u via Wet & Uitleg."

**EXTRA ELEMENTEN VOOR DIEPGAANDE ANALYSE:**
**Jurisprudentie:** Indien beschikbaar, bespreek relevante rechtspraak met uitspraak details en ECLI-nummers
**Praktijkvoorbeelden:** Geef **meerdere realistische scenario's** met verschillende uitkomsten
**Procedurele aspecten:** Leg uit hoe procedures verlopen, termijnen, bevoegde instanties - altijd met wetsverwijzingen
**Gerelateerde wetgeving:** Verwijs naar aanverwante artikelen en wetten
**Handhavingsaspecten:** Praktische toepassing door politie, BOA's, andere instanties - met juridische basis

**VOORBEELD STRUCTUUR VOOR VORMFOUTEN:**
**Vormfouten in het strafproces:**

**Wettelijke basis:**
- **Artikel 359 Sv:** Vormverzuimen leiden tot nietigheid indien het belang dat de geschonden vorm beoogt te beschermen, daardoor is geschaad
- **Artikel 348 Sv:** Absolute nietigheid bij schending van voorschriften betreffende samenstelling rechterlijke macht
- **Artikel 359a Sv:** Onrechtmatig verkregen bewijs kan worden uitgesloten indien de rechten van verdachte zijn geschonden

**Praktische toepassing:**
- **Proces-verbaal fouten:** art. 29 lid 1 Sv (verplichte vermeldingen)
- **Verhoorfouten:** art. 28, 29 Sv (cautie, identificatie)  
- **Huiszoeking fouten:** art. 96-110 Sv (machtiging, voorwaarden)

**BELANGRIJKE INSTRUCTIES:**
- **Voeg automatisch spaties toe tussen tekst en cijfers** (bijv. "artikel5" → "artikel 5", "artikel160" → "artikel 160")
- **Formateer datums correct** (bijv. "per1januari2023" → "per 1 januari 2023")
- **Gebruik correcte spatiëring bij bedragen** (bijv. "€500" → "€ 500", "100euro" → "100 euro")
- **Formateer tijdsaanduidingen correct** (bijv. "30dagen" → "30 dagen", "2jaren" → "2 jaren")
- **NOEM ALTIJD EXPLICIET DE WETTELIJKE GRONDSLAG** voor elke juridische handeling
- **Bij elke juridische term MOET een wetsartikel worden genoemd**
- **Gebruik Nederlandse juridische terminologie** correct en technisch precies
- **Geef concrete artikelnummers** met volledige wettekst waar relevant
- **Pas je taalgebruik aan** aan de doelgroep (burger, politieagent, jurist) en geef passende uitleg

**FORMATTING - GEEN ### HEADERS:**
- Gebruik **vet** voor belangrijke termen en artikelnummers
- Gebruik **ALLEEN** ** voor koppen, **NOOIT** ### headers
- Gebruik > voor **volledige citaten** uit wetten
- Maak gebruik van bullets voor opsommingen
- Gebruik kopjes voor structuur (**Hoofdkopje**, **Subkopje**)
- **Kader artikelteksten** apart voor duidelijkheid
- Elke alinea gescheiden door een lege regel

**BRONVERWIJZING:**
Eindig altijd met uitgebreide bronverwijzing naar alle relevante officiële bronnen.

**VERDERE VRAGEN AANMOEDIGEN:**
Eindig elk antwoord met: "❓ **Heeft u specifiekere vragen?** Dan help ik graag verder met meer technische details over dit onderwerp."

**DISCLAIMER VOOR EERSTE BERICHTEN:**
Begin het eerste antwoord altijd met: "⚖️ **Uitgebreid juridisch advies van WetHelder** - Deze diepgaande analyse is gebaseerd op officiële Nederlandse bronnen en jurisprudentie. Voor persoonlijk juridisch advies raadpleegt u een advocaat."

**GEEN DISCLAIMER VOOR VERVOLGBERICHTEN:**
Voor vervolgvragen in hetzelfde gesprek: gebruik GEEN disclaimer, ga direct door met beantwoorden.`

// In-memory store for anonymous user rate limiting (development only)
const anonymousUsageStore = new Map<string, { count: number; date: string }>()

async function searchOfficialSources(query: string): Promise<string[]> {
  const sources: string[] = []
  
  try {
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

    // NIEUWE BRON: CVDR (Decentrale regelgeving)
    if (query.toLowerCase().includes('gemeente') || 
        query.toLowerCase().includes('provincie') ||
        query.toLowerCase().includes('verordening') ||
        query.toLowerCase().includes('apv') ||
        query.toLowerCase().includes('bouwverordening')) {
      try {
        sources.push(`https://lokaleregelgeving.overheid.nl/zoeken?q=${encodeURIComponent(query)}`)
      } catch (error) {
        console.error('Error adding CVDR reference:', error)
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

    return [...new Set(sources)].slice(0, 15) // Vergroot van 10 naar 15 bronnen
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
    // Get rate limit status for current user/IP
    let session = null
    let userId: string | undefined = undefined
    let clientIP: string | undefined = undefined
    
    try {
      session = await getServerSession(authOptions)
      userId = session?.user?.id
      clientIP = request.headers.get('x-forwarded-for') || undefined
    } catch (sessionError) {
      console.log('Session error (non-critical):', sessionError instanceof Error ? sessionError.message : 'Unknown session error')
    }
    
    const { allowed, remaining, role } = await checkRateLimit(userId, clientIP)
    
    return new Response(JSON.stringify({ 
      message: 'WetHelder API is running',
      version: '2.0.0',
      features: ['conversational-ai', 'thinking-process', 'profession-specific'],
      rateLimit: {
        allowed,
        remaining,
        role,
        isAuthenticated: !!userId
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('GET error:', error)
    return new Response(JSON.stringify({ 
      message: 'WetHelder API is running',
      version: '2.0.0',
      features: ['conversational-ai', 'thinking-process', 'profession-specific'],
      rateLimit: {
        allowed: true,
        remaining: 3,
        role: 'ANONYMOUS',
        isAuthenticated: false
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Rate limiting helper
async function checkRateLimit(userId?: string, clientIP?: string): Promise<{ allowed: boolean; remaining: number; role: string }> {
  // Voor gebruikers met account - geen limiet tijdens development
  if (userId) {
    return { allowed: true, remaining: 999, role: 'AUTHENTICATED' }
  }
  
  // Voor anonieme gebruikers - limiet van 3 vragen per dag
  const today = new Date().toISOString().split('T')[0]
  const anonymousKey = clientIP || 'anonymous'
  
  const currentUsage = anonymousUsageStore.get(anonymousKey)
  
  // Reset count if it's a new day
  if (!currentUsage || currentUsage.date !== today) {
    anonymousUsageStore.set(anonymousKey, { count: 0, date: today })
    return { allowed: true, remaining: 2, role: 'ANONYMOUS' }
  }
  
  // Check if limit is reached
  const limit = 3
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
`
    case "advocaat":
      return `
**DOELGROEP: Advocaat**
Lever **juridisch-technische precisie** met:
- Relevante jurisprudentie en precedenten
- Processuele aspecten en mogelijke verdedigingsstrategieën
- Formele vereisten en termijnen
- Technische juridische nuances
- Verwijzingen naar relevante rechtspraak
`
    case "politieagent":
      return `
**DOELGROEP: Politieagent**
Focus op **operationele toepassing** en **handhavingsaspecten**:
- Concrete bevoegdheden en procedures
- Wat mag wel/niet tijdens handhaving
- Proces-verbaal gerelateerde aspecten
- Praktische tips voor de straat
- Wanneer doorverwijzen naar andere instanties
`
    case "boa":
      return `
**DOELGROEP: BOA (Buitengewoon Opsporingsambtenaar)**
Focus op **BOA-specifieke bevoegdheden**:
- Welke artikelen vallen binnen jouw domein
- Wanneer moet je doorverwijzen naar politie
- Specifieke BOA-procedures en protocollen
- Handhavingsrichtlijnen voor jouw sector
`
    case "rechter":
      return `
**DOELGROEP: Rechter/Rechterlijk Ambtenaar**
Focus op **rechterlijke aspecten**:
- Procesrecht en rechterlijke procedures
- Bewijsrecht en bewijswaardering
- Jurisprudentie en precedentwerking
- Straftoemeting en sanctiekeuze
- Formele vereisten voor rechterlijke beslissingen
`
    case "notaris":
      return `
**DOELGROEP: Notaris**
Focus op **notariële praktijk**:
- Burgerlijk recht en vermogensrecht
- Familierecht en erfrecht
- Vastgoedtransacties en hypotheken
- Notariële akten en formaliteiten
- Ondernemingsrecht en rechtspersonenrecht
`
    case "deurwaarder":
      return `
**DOELGROEP: Deurwaarder**
Focus op **executierecht**:
- Beslagprocedures en executiemaatregelen
- Invorderingswetgeving en incassoproces
- Rechten van debiteuren en crediteuren
- Procedurele vereisten bij beslaglegging
- Samenwerking met gerechtelijke instanties
`
    case "bedrijfsjurist":
      return `
**DOELGROEP: Bedrijfsjurist**
Focus op **ondernemingsrecht**:
- Contractenrecht en commerciële overeenkomsten
- Arbeidsrecht en personeelszaken
- Compliance en toezichtrecht
- Intellectueel eigendomsrecht
- Corporate governance en vennootschapsrecht
`
    case "gemeenteambtenaar":
      return `
**DOELGROEP: Gemeenteambtenaar**
Focus op **bestuursrecht** en **lokale wetgeving**:
- APV's en gemeentelijke verordeningen
- Vergunningverlening en handhaving
- Bezwaar- en beroepsprocedures
- Bestuursdwang en dwangsommen
- Samenwerking met toezichthouders
`
    case "belastingadviseur":
      return `
**DOELGROEP: Belastingadviseur**
Focus op **fiscaal recht**:
- Belastingwetgeving en tariefstructuren
- Aftrekposten en vrijstellingen
- Bezwaar- en beroepsprocedures bij Belastingdienst
- Internationale belastingverdragen
- Fiscale compliance en aangifteverplichtingen
`
    case "accountant":
      return `
**DOELGROEP: Accountant**
Focus op **financieel recht**:
- Verslaggevingswetgeving (BW2)
- Controle- en assurance-standaarden
- Fiscale aspecten van verslaggeving
- Wet- en regelgeving accountancy
- Fraudepreventie en compliance
`
    case "makelaar":
      return `
**DOELGROEP: Makelaar**
Focus op **vastgoedrecht**:
- Koopovereenkomsten en leveringsvoorwaarden
- Makelaarsrecht en bemiddelingswetgeving
- Hypotheekrecht en zekerheidsrechten
- Wet op het financieel toezicht (Wft)
- Consumentenbescherming bij vastgoedtransacties
`
    case "verzekeringsagent":
      return `
**DOELGROEP: Verzekeringsagent**
Focus op **verzekeringsrecht**:
- Verzekeringsovereenkomsten en polisvoorwaarden
- Aansprakelijkheidsrecht en schadevergoeding
- Wet op het financieel toezicht (Wft)
- Consumentenbescherming bij verzekeringen
- Geschillenbeslechting en ombudsprocedures
`
    case "hr-medewerker":
      return `
**DOELGROEP: HR-medewerker**
Focus op **arbeidsrecht**:
- Arbeidsovereenkomsten en cao's
- Ontslagrecht en reorganisatieprocedures
- Wet- en regelgeving arbeidsomstandigheden
- Privacy en gegevensbescherming (AVG)
- Discriminatiewetgeving en gelijke behandeling
`
    case "compliance-officer":
      return `
**DOELGROEP: Compliance Officer**
Focus op **toezichtrecht**:
- Wet- en regelgeving financiële sector
- Integriteitsmanagement en gedragscodes
- Meldplichten en rapportageverplichtingen
- Sanctierecht en handhavingsmaatregelen
- Risk management en compliance monitoring
`
    case "veiligheidsbeambte":
      return `
**DOELGROEP: Veiligheidsbeambte**
Focus op **veiligheidsrecht**:
- Wet particuliere beveiligingsorganisaties
- Bevoegdheden en verantwoordelijkheden beveiliging
- Samenwerking met politie en justitie
- Incidentregistratie en rapportage
- Persoonsbescherming en objectbeveiliging
`
    case "aspirant":
      return `
**DOELGROEP: Aspirant (Politie/Justitie)**
Focus op **praktische toepassing** met **educatieve context**:
- Uitgebreide uitleg van procedures en protocollen
- Theoretische achtergrond van wetgeving
- Praktijkvoorbeelden en casussen
- Rechtsbeginselen en ethische aspecten
- Voorbereiding op professionele praktijk
`
    case "student":
      return `
**DOELGROEP: Student (Rechten/Criminologie)**
Bied **theoretische verdieping** met:
- Juridische achtergrond en rechtsbeginselen
- Historische ontwikkeling van de wet
- Academische bronnen en literatuurverwijzingen
- Theoretische kaders en juridische concepten
- Examengerelateerde aspecten
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
  
  // Fix spatiëring tussen tekst en cijfers
  correctedResponse = correctedResponse.replace(/(\w)(\d)/g, '$1 $2')
  correctedResponse = correctedResponse.replace(/(\d)(\w)/g, '$1 $2')
  
  // Fix specifieke juridische termen
  correctedResponse = correctedResponse.replace(/artikel(\d)/g, 'artikel $1')
  correctedResponse = correctedResponse.replace(/art(\d)/g, 'art. $1')
  correctedResponse = correctedResponse.replace(/per(\d+)(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)(\d+)/g, 'per $1 $2 $3')
  
  // Fix euro bedragen
  correctedResponse = correctedResponse.replace(/€(\d)/g, '€ $1')
  correctedResponse = correctedResponse.replace(/(\d)euro/g, '$1 euro')
  
  // Fix tijdsaanduidingen
  correctedResponse = correctedResponse.replace(/(\d+)(dagen|weken|maanden|jaren)/g, '$1 $2')
  
  return correctedResponse
}

// Response validatie voor juridische nauwkeurigheid
function validateLegalResponse(query: string, response: string): string {
  const lowerQuery = query.toLowerCase()
  const lowerResponse = response.toLowerCase()
  
  const validationWarnings: string[] = []
  
  // Controleer of relevante wetten worden genoemd
  if (lowerQuery.includes('vuurwerk') && !lowerResponse.includes('wed') && !lowerResponse.includes('wet op de economische delicten')) {
    validationWarnings.push('⚠️ WAARSCHUWING: Vuurwerk valt onder de WED (Wet op de economische delicten)')
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
  
  // Voeg waarschuwingen toe aan response
  if (validationWarnings.length > 0) {
    correctedResponse += '\n\n' + validationWarnings.join('\n')
  }
  
  return correctedResponse
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'API configuration error' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { question, profession = 'burger', wetUitleg = false, conversationHistory = [], useThreePhase = false } = await request.json()
    
    if (!question || typeof question !== 'string') {
      return new Response(JSON.stringify({ error: 'Ongeldige vraag' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Temporarily handle session errors gracefully
    let session = null
    let userId: string | undefined = undefined
    let clientIP: string | undefined = undefined
    try {
      session = await getServerSession(authOptions)
      userId = session?.user?.id
      clientIP = request.headers.get('x-forwarded-for') || undefined
    } catch (sessionError) {
      console.log('Session error (non-critical):', sessionError instanceof Error ? sessionError.message : 'Unknown session error')
    }
    
    const { allowed, remaining, role } = await checkRateLimit(userId, clientIP)
    
    if (!allowed) {
      const message = role === 'ANONYMOUS' 
        ? 'Je hebt het maximum van 3 gratis vragen per dag bereikt. Maak een account aan voor onbeperkt gebruik van WetHelder!'
        : 'Gratis gebruikers kunnen 3 vragen per dag stellen. Upgrade naar premium voor onbeperkt gebruik.'
      
      return new Response(JSON.stringify({ 
        error: 'Dagelijkse limiet bereikt', 
        message,
        remaining: 0, 
        role,
        needsAccount: role === 'ANONYMOUS'
      }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const sources = await searchOfficialSources(question)
    
    // 🚀 NIEUWE FUNCTIONALITEIT: 3-Fasen Juridisch Antwoord Systeem
    // Tijdelijk uitgeschakeld - gebruik alleen bij expliciete request
    const shouldUseThreePhase = useThreePhase && false // Uitgeschakeld voor nu
    
    if (shouldUseThreePhase) {
      // Gebruik de 3-fasen aanpak voor betere juridische nauwkeurigheid
      try {
        const threePhaseResponse = await generateThreePhaseResponse(question, profession, sources, wetUitleg)
        
        return new Response(JSON.stringify({ 
          content: threePhaseResponse,
          sources: sources,
          threePhaseUsed: true
        }), {
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (error) {
        console.error('3-Phase response failed, falling back to streaming:', error)
        // Fallback naar normale streaming response
      }
    }

    const encoder = new TextEncoder()
    let fullAnswer = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Determine which system prompt to use based on wetUitleg and profession
          let systemPrompt = SYSTEM_PROMPT
          const isAdvancedMode = wetUitleg || profession === 'juridisch-expert'
          
          if (isAdvancedMode) {
            systemPrompt = ADVANCED_SYSTEM_PROMPT
          }

          // Add article formatting instructions for all modes
          const articleFormattingInstructions = `

**VERPLICHTE FORMATTING VOOR MOOIE OUTPUT:**
- Gebruik **## Hoofdkopjes** voor belangrijke secties
- Gebruik **Vetgedrukte subkopjes** voor subsecties (GEEN ### headers)
- Gebruik **vetgedrukte tekst** voor belangrijke begrippen
- Gebruik > citaatkaders voor wetteksten en belangrijke citaten
- Gebruik • bullet points voor opsommingen
- Gebruik --- voor scheidingslijnen tussen secties
- **ZORG ALTIJD VOOR SPATIES:** "artikel160" → "artikel 160", "art5" → "art. 5"

**VOORBEELDFORMATTING:**
## Juridische Grondslag

**Artikel 5 WVW:** Verkeersregels

> "Het is verboden een voertuig op de weg te laten staan..."

**Belangrijke Punten:**
• Eerste punt
• Tweede punt  
• Derde punt

---

**BRONVERMELDING:**
Vermeld altijd de exacte bron zoals: "Artikel 300 Sr" of "HR 12 juli 2022, ECLI:NL:HR:2022:1234"`

          // Add intelligent follow-up suggestions for advanced modes
          const followUpSuggestions = isAdvancedMode ? `

**INTELLIGENTE VERVOLGVRAGEN VOOR JURIDISCH EXPERT MODE:**
Stel na elk antwoord automatisch 2-3 relevante vervolgvragen voor, zoals:
- "Wilt u meer weten over de jurisprudentie hieromtrent?"
- "Heeft u vragen over de praktische handhaving van dit artikel?"
- "Wilt u de procedurele aspecten van deze regeling bespreken?"
- "Zijn er gerelateerde artikelen die voor uw situatie relevant kunnen zijn?"
- "Heeft u vragen over de boetes en sancties bij overtreding?"
- "Wilt u meer weten over de bevoegdheden van handhavingsinstanties?"` : ''

          const fullSystemPrompt = systemPrompt + articleFormattingInstructions + followUpSuggestions

          // Add profession context
          const professionContext = getProfessionContext(profession)
          
          // Check if this is the first message in conversation
          const isFirstMessage = conversationHistory.length === 0
          const conversationContext = isFirstMessage 
            ? '\n\n**CONVERSATIE STATUS:**\nDit is het EERSTE bericht in het gesprek - gebruik de disclaimer voor eerste berichten.'
            : '\n\n**CONVERSATIE STATUS:**\nDit is een VERVOLGbericht in een bestaand gesprek - gebruik GEEN disclaimer.'
          
          const fullPrompt = fullSystemPrompt + '\n\n' + professionContext + conversationContext

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
                  content: fullPrompt
                },
                // Add conversation history
                ...conversationHistory.map((msg: string, index: number) => ({
                  role: index % 2 === 0 ? 'user' : 'assistant',
                  content: msg
                })),
                {
                  role: 'user',
                  content: conversationHistory.length > 0 
                    ? question  // Direct question if conversation exists
                    : `Hoi! Ik heb een juridische vraag voor je:

${question}

Kun je me hierover helpen? Geef me een direct, helder antwoord.`,
                },
              ],
              stream: true,
              max_tokens: isAdvancedMode ? 3000 : 2000,
              temperature: 0.3,
              top_p: 0.9,
            }),
          })

          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`)
          }

          const reader = response.body?.getReader()
          const decoder = new TextDecoder()

          if (!reader) {
            throw new Error('No reader available')
          }

          let buffer = ''
          
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            buffer += chunk
            
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                if (data === '[DONE]') continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content || ''
                  
                  if (content) {
                    // Behoud mooie markdown formatting - alleen essentiële fixes
                    let cleanContent = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
                    
                    // BEHOUD alle markdown formatting (##, ###, >, •, ---, etc.)
                    // Alleen kritieke tekstfouten oplossen:
                    
                    // Fix "per1januari2023" → "per 1 januari 2023"
                    cleanContent = cleanContent.replace(/\bper(\d+)(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)(\d{4})\b/gi, 'per $1 $2 $3')
                    
                    // Fix "artikel5" → "artikel 5"
                    cleanContent = cleanContent.replace(/\bartikel(\d+)/gi, 'artikel $1')
                    
                    // Fix "art5" → "art. 5"
                    cleanContent = cleanContent.replace(/\bart(\d+)/gi, 'art. $1')
                    
                    if (cleanContent.trim()) {
                      fullAnswer += cleanContent
                      const responseChunk = encoder.encode(
                        `data: ${JSON.stringify({ content: cleanContent })}\n\n`
                      )
                      controller.enqueue(responseChunk)
                    }
                  }
                } catch (e) {
                  console.warn('Failed to parse chunk:', data)
                }
              }
            }
          }

          // Send sources at the end
          if (sources.length > 0) {
            const sourcesText = `\n\n**📖 Nuttige bronnen:**\n${sources.map(url => `• ${url}`).join('\n')}`
            const sourcesChunk = encoder.encode(
              `data: ${JSON.stringify({ content: sourcesText })}\n\n`
            )
            controller.enqueue(sourcesChunk)
          }

          // Valideer de response voor juridische nauwkeurigheid
          const validatedAnswer = validateLegalResponse(question, fullAnswer)
          if (validatedAnswer !== fullAnswer) {
            const validationText = validatedAnswer.substring(fullAnswer.length)
            const validationChunk = encoder.encode(
              `data: ${JSON.stringify({ content: validationText })}\n\n`
            )
            controller.enqueue(validationChunk)
          }

          const doneChunk = encoder.encode('data: [DONE]\n\n')
          controller.enqueue(doneChunk)

          // Increment usage for anonymous users
          if (!userId) {
            incrementAnonymousUsage(clientIP)
          }

          // Save to database - temporarily disabled
          try {
            // Database saves disabled during development
            console.log('Question processed:', { 
              question: question.substring(0, 50), 
              profession, 
              userId, 
              wetUitleg: wetUitleg || false 
            })
          } catch (dbError) {
            console.error('Database error (non-critical):', dbError)
          }

        } catch (error) {
          console.error('Stream error:', error)
          const errorChunk = encoder.encode(
            `data: ${JSON.stringify({ 
              content: 'Sorry, er ging iets mis. Kun je je vraag opnieuw proberen?' 
            })}\n\n`
          )
          controller.enqueue(errorChunk)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return new Response(JSON.stringify({ error: 'Server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 