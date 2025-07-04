import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { getBrancheAdvies, zoekBrancheRegels } from '@/lib/brancheRegels'
import { searchPriorityJsonSources, formatJsonSourcesForDirectAnswer, JsonBron } from '@/lib/jsonSources'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Rate limiting voor anonieme gebruikers
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimits = new Map<string, RateLimitEntry>()
const DAILY_LIMIT = 4
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000 // 24 uur

// Add database logging function
async function saveQueryToDatabase(
  question: string, 
  answer: string, 
  profession: string, 
  userId: string | null,
  clientIp: string | null = null,
  userAgent: string | null = null
) {
  try {
    await prisma.query.create({
      data: {
        question,
        answer,
        profession,
        userId,
        // Store tracking info for anonymous users in sources field
        sources: JSON.stringify({
          clientIp: clientIp || 'unknown',
          userAgent: userAgent || 'unknown',
          apiEndpoint: 'wetuitleg',
          timestamp: new Date().toISOString()
        }),
      }
    })
    console.log(`📝 Query saved to database (userId: ${userId || 'anonymous'})`)
  } catch (error) {
    console.error('❌ Error saving query to database:', error)
    // Don't throw error to avoid breaking the response
  }
}

function getClientIP(request: NextRequest): string {
  // Try multiple headers commonly used in corporate environments
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  const clientIp = request.headers.get('cf-connecting-ip') // Cloudflare
  const xForwardedHost = request.headers.get('x-forwarded-host')
  
  if (forwarded) {
    // Take the first IP from comma-separated list
    const firstIP = forwarded.split(',')[0].trim()
    if (firstIP !== '127.0.0.1' && firstIP !== 'localhost') {
      return firstIP
    }
  }
  
  if (real && real !== '127.0.0.1') {
    return real.trim()
  }
  
  if (clientIp) {
    return clientIp.trim()
  }
  
  // Fallback to a more unique identifier for corporate environments
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const acceptLanguage = request.headers.get('accept-language') || 'unknown'
  
  // Create a hash-like identifier from headers for better tracking
  const fingerprint = `${userAgent}-${acceptLanguage}-${xForwardedHost || 'unknown'}`
    .replace(/[^a-zA-Z0-9-]/g, '')
    .substring(0, 50)
  
  return `corp-${fingerprint}`
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimits.get(ip)
  
  if (!entry || now > entry.resetTime) {
    rateLimits.set(ip, { count: 0, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: DAILY_LIMIT - 1 }
  }
  
  if (entry.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 }
  }
  
  return { allowed: true, remaining: DAILY_LIMIT - entry.count - 1 }
}

function incrementRateLimit(ip: string): void {
  const entry = rateLimits.get(ip)
  if (entry) {
    entry.count++
  }
}

function getProfessionContext(profession: string): string {
  switch (profession) {
    case 'aspirant':
      return `Je beantwoordt vragen voor een aspirant-agent. Focus op:
- Uitgebreide uitleg van politiebevoegdheden met praktijkvoorbeelden
- Stapsgewijze procedures en protocollen  
- Leerdoelen en examenstof voor politieopleidingen
- Theoretische onderbouwing van handhavingsacties
- Casusgerichte oefeningen en voorbeelden`

    case 'student':
      return `Je beantwoordt vragen voor een student/stagiair. Focus op:
- Theoretische juridische grondslagen en leermaterialen
- Begrippenuitleg met definities en voorbeelden
- Structuur voor verslagen en juridische analyses
- Uitgebreide bronvermelding en jurisprudentie
- Examengericht materiaal en casussen`

    case 'politieagent':
      return `Je beantwoordt vragen voor een politieagent. Focus op:
- Concrete bevoegdheden en dwangmiddelen (Politiewet 2012)
- Handhavingsprocedures en arrestatie-aanhouding
- Ambtsinstructie en operationele protocollen
- Proces-verbaal en rapportage
- Praktische toepassingen in het dagelijkse werk`

    case 'advocaat':
      return `Je beantwoordt vragen voor een advocaat. Focus op:
- Diepgaande juridische analyse en jurisprudentie
- Processtrategieën en verweersmogelijkheden  
- Relevante rechtspraak en ECLI-nummers
- Strategische processtappen en argumentatie
- Termijnen, rechtsmiddelen en cliëntadvies`

    case 'boa':
      return `Je beantwoordt vragen voor een BOA/handhaver. Focus op:
- Specifieke BOA-bevoegdheden per domein (I-V)
- APV-handhaving en bestuurlijke procedures
- Processenverbaal opstellen en rapportage
- Praktische handhavingssituaties en escalatie
- Verschil met politiebevoegdheden`

    case 'rechter':
      return `Je beantwoordt vragen voor een rechter/magistraat. Focus op:
- Juridische grondslag voor uitspraken en motivering
- Bewijswaardering en procesbeslissingen
- Straftoemeting en sanctiebeleid
- Procesrechtelijke aspecten en vormvoorschriften
- Jurisprudentie en precedentwerking`

    case 'notaris':
      return `Je beantwoordt vragen voor een notaris. Focus op:
- Burgerlijk recht, familierecht en erfrecht
- Contractenrecht en vastgoedtransacties
- Notariële praktijk en authentieke akten
- Kadaster, hypotheken en eigendomsoverdracht
- Notariswet en tuchtrecht`

    case 'deurwaarder':
      return `Je beantwoordt vragen voor een gerechtsdeurwaarder. Focus op:
- Executierecht en beslagprocedures
- Dwangsom en gedwongen tenuitvoerlegging
- Betekening en gerechtelijke procedures
- Gerechtsdeurwaarderswet en tarieven
- Praktische invorderingsstappen`

    case 'bedrijfsjurist':
      return `Je beantwoordt vragen voor een bedrijfsjurist. Focus op:
- Ondernemingsrecht en corporate governance
- Contractenrecht en aansprakelijkheid
- Compliance en risicobeheersing
- AVG/GDPR en privacy-wetgeving
- Arbeidsrecht en bedrijfsrechtelijke procedures`

    case 'gemeenteambtenaar':
      return `Je beantwoordt vragen voor een gemeenteambtenaar. Focus op:
- Bestuurlijke procedures en vergunningverlening
- APV-toepassing en gemeentelijke bevoegdheden
- Bezwaar en beroepsprocedures (Awb)
- Praktische gemeentelijke vraagstukken
- Omgevingswet en lokale regelgeving`

    case 'gemeentejurist':
      return `Je beantwoordt vragen voor een gemeentejurist. Focus op:
- Bestuursrecht en bestuurlijke sancties
- APVs, verordeningen en Gemeentewet
- Bezwaar & beroep en bestuurlijke handhaving
- Omgevingswet en ruimtelijke ordening
- Bestuursdwang en dwangsom`

    case 'belastingadviseur':
      return `Je beantwoordt vragen voor een belastingadviseur. Focus op:
- Fiscaal recht en belastingwetgeving
- Procedures bij de Belastingdienst
- Bezwaar en beroep in belastingzaken
- Wet IB 2001, Wet VPB 1969, Wet OB 1968
- Fiscale compliance en planning`

    case 'accountant':
      return `Je beantwoordt vragen voor een accountant. Focus op:
- Financieel recht en verslaggevingswetgeving
- Boekhoudwetgeving (Boek 2 BW)
- Wet op het accountantsberoep (Wab)
- Fiscale aspecten van bedrijfsvoering
- Controle en assurance werkzaamheden`

    case 'makelaar':
      return `Je beantwoordt vragen voor een makelaar. Focus op:
- Vastgoedrecht en eigendomsoverdracht
- Makelaarsrecht en NVM-regels
- Koopcontracten en leveringsvoorwaarden
- Hypotheekrecht en financieringsvoorwaarden
- Wft en zorgplicht makelaars`

    case 'verzekeringsagent':
      return `Je beantwoordt vragen voor een verzekeringsagent. Focus op:
- Verzekeringsrecht en verzekeringscontracten
- Aansprakelijkheid en schadeafhandeling
- Wft en zorgplicht verzekeraars
- Wet op het financieel toezicht
- Claims en uitkeringsprocedures`

    case 'hr-medewerker':
      return `Je beantwoordt vragen voor een HR-medewerker. Focus op:
- Arbeidsrecht en personeelsbeleid
- Ontslag, reorganisatie en arbeidsvoorwaarden
- AVG-privacy en personeelsadministratie
- Wet gelijke behandeling en discriminatie
- CAO's en individuele arbeidscontracten`

    case 'compliance-officer':
      return `Je beantwoordt vragen voor een compliance officer. Focus op:
- Toezichtrecht en compliance procedures
- Risicobeheersing en interne controle
- Wwb, Wft en sectorspecifieke regelgeving
- Meldingsverplichtingen en incidentrapportage
- Corporate governance en integriteit`

    case 'veiligheidsbeambte':
      return `Je beantwoordt vragen voor een veiligheidsbeambte. Focus op:
- Veiligheidsrecht en preventieve maatregelen
- Incidentmanagement en crisisbeheersing
- Veiligheidsprocedures en risico-analyse
- Wet veiligheidsregio's en rampenbestrijding
- Evenementenbeveiliging en crowd control`

    case 'beveiliger':
      return `Je beantwoordt vragen voor een beveiliger. Focus op:
- Wet particuliere beveiligingsorganisaties (WPBR)
- Private beveiliging en eigendomsbescherming
- Arrestatiebevoegdheden en burgerarrest (art. 53 Sv)
- Proportionaliteit en zelfverdediging
- Verschil publieke en private handhaving`

    case 'trainer':
      return `Je beantwoordt vragen voor een trainer/opleider. Focus op:
- Educatieve juridische uitleg met voorbeelden
- Gestructureerde leermaterialen en casussen
- Praktijkgerichte training en oefeningen
- Verschillende leerstijlen en didactiek
- Volledig uitgewerkte antwoorden voor cursisten`

    case 'vervoersmedewerker':
      return `Je beantwoordt vragen voor een vervoersmedewerker. Focus op:
- Wet personenvervoer 2000 en Spoorwegwet
- OV-bevoegdheden en controle in openbaar vervoer
- Vervoersvoorwaarden en sanctiebeleid
- Incidentafhandeling en conflictdeëscalatie
- Samenwerking met politie en BOA's`

    case 'zorgprofessional':
      return `Je beantwoordt vragen voor een zorgprofessional. Focus op:
- Wet verplichte geestelijke gezondheidszorg (Wvggz)
- Wet zorg en dwang (Wzd) en dwangtoepassing
- AVG/WGBO bij gegevensuitwisseling in de zorg
- Tuchtrecht en beroepsuitoefening
- Meldcode huiselijk geweld en kindermishandeling`

    case 'officier':
      return `Je beantwoordt vragen voor een officier van justitie. Focus op:
- Strafrecht en vervolgingsbeleid
- Sepot-gronden en transactievoorstellen
- Strafrechtelijke procedures en bewijsvoering
- Aanwijzingen van het College van PG's
- Internationale rechtshulp en uitlevering`

    case 'juridischmedewerker':
      return `Je beantwoordt vragen voor een juridisch medewerker. Focus op:
- Juridische ondersteuning en procesvoering
- Dossiervoorbereiding en processtukken
- Rechtsbijstand en cliëntencontact
- Wet op de rechtsbijstand (Wrb)
- Praktische juridische werkzaamheden`

    case 'parkeercontroleur':
      return `Je beantwoordt vragen voor een parkeercontroleur. Focus op:
- Wegenverkeerswet en verkeersvoorschriften
- Parkeerregulering en naheffingsaanslagen
- APV-bepalingen over parkeren
- Bezwaar en beroepsprocedures verkeer
- Praktische handhaving parkeerbeleid`

    case 'algemeen':
    default:
      return `Je beantwoordt vragen voor een burger/algemeen publiek. Focus op:
- Begrijpelijke uitleg van juridische begrippen zonder jargon
- Praktische toepassingen en concrete gevolgen
- Stapsgewijze handelingsperspectieven en vervolgacties
- Toegankelijke juridische informatie met voorbeelden
- Rechten en plichten van burgers in het dagelijks leven`
  }
}

// Nederlandse wetgeving kennisbank
const LEGAL_KNOWLEDGE = `
Je bent een Nederlandse juridische expert. Je geeft uitgebreide, accurate uitleg over Nederlandse wetgeving.

BELANGRIJKE WETSWIJZIGING (SINDS 1 JULI 2024):
STRAATINTIMIDATIE valt vanaf 1 juli 2024 onder het NIEUWE artikel 429ter Sr (NIET meer artikel 266 Sr):

**ARTIKEL 429ter Sr - STRAATINTIMIDATIE (vanaf 1 juli 2024):**
"Degene die in het openbaar een ander indringend seksueel benadert door middel van opmerkingen, gebaren, geluiden of aanrakingen op een wijze die vreesaanjagend, vernederend, kwetsend of onterend is te achten, wordt gestraft met hechtenis van ten hoogste drie maanden of geldboete van de derde categorie."

BELANGRIJKE INSTRUCTIES:
- Geef altijd uitgebreide antwoorden (minimaal 200 woorden)
- Begin met de letterlijke wettekst als er naar een specifiek artikel wordt gevraagd
- Gebruik het format: **WETTEKST:** [letterlijke tekst] gevolgd door uitgebreide uitleg
- **KRITIEK: VERMELD ALTIJD SPECIFIEKE WETSARTIKELEN MET EXACTE NUMMERS**
- Als je zegt "de politie heeft de bevoegdheid", MOET je zeggen "artikel 96b Sv" erbij
- Als je zegt "dit is strafbaar", MOET je het exacte artikel noemen (bijv. "artikel 326 Sr")
- Als je zegt "er geldt een boete", MOET je het artikel noemen (bijv. "artikel 62 WVW")
- Verwijs naar gerelateerde artikelen waar relevant
- Geef praktische voorbeelden en toepassingen
- Leg juridische concepten helder uit
- Gebruik geen externe bronnen - werk vanuit je juridische kennis
- **BELANGRIJK: Controleer altijd op brancheregels die kunnen afwijken van wettelijke bepalingen**
- **Bij vragen over straatintimidatie: Verwijs ALTIJD naar artikel 429ter Sr (vanaf 1 juli 2024)**

ANTWOORD STRUCTUUR:
1. **WETTEKST:** [letterlijke artikeltekst indien van toepassing]
2. **UITLEG:** Uitgebreide juridische analyse MET SPECIFIEKE ARTIKELNUMMERS
3. **PRAKTIJK:** Hoe dit in de praktijk werkt MET VERWIJZING NAAR RELEVANTE ARTIKELEN
4. **BRANCHEREGELS:** [indien van toepassing - specifieke regels van brancheorganisaties]
5. **GERELATEERD:** Verwante artikelen en bepalingen MET EXACTE NUMMERS

AANDACHT VOOR BRANCHEREGELS:
- Veel sectoren hebben eigen regels die strenger kunnen zijn dan de wet
- Bijvoorbeeld: NVM-regels voor makelaars, NBA-regels voor advocaten, etc.
- Wijs altijd op mogelijke conflicten tussen wet en brancheregels
- Adviseer om de strengste regel te volgen

Geef altijd professionele, accurate en uitgebreide juridische uitleg.
`

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const clientIP = getClientIP(request)
  
  if (!session) {
    const rateLimit = checkRateLimit(clientIP)
    return NextResponse.json({ 
      remainingQuestions: rateLimit.remaining,
      message: 'WetUitleg API - Snelle juridische analyse' 
    })
  }
  
  return NextResponse.json({ 
    message: 'WetUitleg API - Snelle juridische analyse' 
  })
}

export async function POST(request: NextRequest) {
  try {
    const { query, history, profession = 'algemeen' } = await request.json()
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is vereist' },
        { status: 400 }
      )
    }

    console.log(`📝 WetUitleg vraag: "${query}" (Beroep: ${profession})`)

    // Session check
    const session = await getServerSession(authOptions)
    const clientIP = getClientIP(request)
    const userAgent = request.headers.get('user-agent')

    // Rate limiting voor anonieme gebruikers
    if (!session) {
      const rateLimit = checkRateLimit(clientIP)
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: 'Te veel verzoeken. Probeer het later opnieuw.' },
          { status: 429 }
        )
      }
      incrementRateLimit(clientIP)
    }

    // Profession-specific context
    const professionContext = getProfessionContext(profession)
    
    // 🔍 HYBRIDE PRIORITAIRE JSON SEARCH - Snelheid + Betrouwbaarheid
    console.log('🔍 WetUitleg: Checking priority JSON sources (hybrid approach)...')
    
    // STAP 1: Probeer eerst geoptimaliseerde bestanden met ARTIKEL VERIFICATIE
    let jsonSearchResult: {
      foundInJson: boolean,
      sources: JsonBron[],
      recommendation: 'use_json' | 'use_google' | 'use_both',
      suggestion?: string
    }
    try {
      const { searchOptimizedJsonSourcesWithVerification } = await import('../../../lib/optimizedJsonSources')
      const optimizedResult = await searchOptimizedJsonSourcesWithVerification(query)
      
      if (optimizedResult.foundInJson && optimizedResult.sources.length > 0) {
        console.log(`⚡ Found ${optimizedResult.sources.length} sources in optimized format (fast path)`)
        
        // Convert optimized format to BWB format for consistency
        const convertedSources = optimizedResult.sources.map(source => ({
          id: source['Bron (naam)'],
          naam: source['Bron (naam)'],
          url: source['URL'],
          beschrijving: source['Omschrijving'],
          categorie: source['Categorie'],
          betrouwbaarheid: 'hoog' as const,
          trefwoorden: [source['Topic']],
          type: 'wetgeving' as const,
          topic: source['Topic'],
          scope: source['Scope']
        }))
        
        jsonSearchResult = {
          foundInJson: true,
          sources: convertedSources,
          recommendation: optimizedResult.recommendation,
          suggestion: optimizedResult.suggestion
        }
      } else {
        console.log('ℹ️  No matches in optimized sources, falling back to full BWB parsing...')
        
        // Add suggestion to fallback result if we have one
        if (optimizedResult.suggestion) {
          console.log(`💡 Suggestion: ${optimizedResult.suggestion}`)
        }
        
        // STAP 2: Fall back naar volledige BWB parsing (betrouwbaarheid)
        const bwbResult = await searchPriorityJsonSources(query)
        jsonSearchResult = {
          ...bwbResult,
          suggestion: optimizedResult.suggestion
        } as typeof jsonSearchResult
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.log('⚠️  Optimized sources not available, using BWB parsing:', errorMessage)
      // STAP 2: Fall back naar volledige BWB parsing als backup
      jsonSearchResult = await searchPriorityJsonSources(query)
    }
    
    let jsonSourcesContext = ''
    let sourcesList: JsonBron[] = []
    
    if (jsonSearchResult.foundInJson && jsonSearchResult.sources.length > 0) {
      console.log(`✅ WetUitleg: Found ${jsonSearchResult.sources.length} priority JSON sources`)
      sourcesList = jsonSearchResult.sources
      jsonSourcesContext = formatJsonSourcesForDirectAnswer(jsonSearchResult.sources)
      
      // Add suggestion context if available
      if (jsonSearchResult?.suggestion) {
        jsonSourcesContext += `\n\n**BELANGRIJKE OPMERKING**: ${jsonSearchResult.suggestion}\n`
      }
    } else {
      console.log('ℹ️ WetUitleg: No priority JSON sources found, will use general knowledge')
      
      // Even if no sources found, include suggestion if available
      if (jsonSearchResult?.suggestion) {
        jsonSourcesContext = `**BELANGRIJKE OPMERKING**: ${jsonSearchResult.suggestion}\n\n`
      }
    }
    
    // Check for relevant branch/industry rules
    const relevanteRegels = zoekBrancheRegels(query)
    
    // Bouw gesprekgeschiedenis
    let conversationHistory = ''
    if (history && history.length > 0) {
      const recentHistory = history.slice(-6) // Keep last 6 messages for better context
      conversationHistory = `

GESPREKGESCHIEDENIS:
${recentHistory.map((msg: any) => 
  `${msg.role === 'user' ? 'Gebruiker' : 'Assistent'}: ${msg.content.substring(0, 400)}`
).join('\n\n')}

CONTEXT: Dit is een doorlopend gesprek. Verwijs naar eerdere punten waar relevant en bouw voort op de context.`
    }

    // Variable to collect the complete response for database storage
    let completeResponse = ''

    // Stream response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        try {
          console.log('🤖 Genereren juridische analyse...')
          
          // Enhanced conversation context with legal AI
          const systemPrompt = `Je bent een gespecialiseerde Nederlandse juridische AI-assistent.

**🎯 BEROEPSPECIFIEKE FOCUS:**
${professionContext}

**BELANGRIJK: Beantwoord ALTIJD vanuit het perspectief en de behoeften van dit specifieke beroep. Pas je taalgebruik, diepgang en focus aan op deze doelgroep.**

KRITIEKE WETSWIJZIGING (SINDS 1 JULI 2024):
STRAATINTIMIDATIE valt vanaf 1 juli 2024 onder het NIEUWE artikel 429ter Sr (NIET meer artikel 266 Sr):

**ARTIKEL 429ter Sr - STRAATINTIMIDATIE (vanaf 1 juli 2024):**
"Degene die in het openbaar een ander indringend seksueel benadert door middel van opmerkingen, gebaren, geluiden of aanrakingen op een wijze die vreesaanjagend, vernederend, kwetsend of onterend is te achten, wordt gestraft met hechtenis van ten hoogste drie maanden of geldboete van de derde categorie."

**KRITIEKE JURIDISCHE TERMINOLOGIE (ZEER BELANGRIJK):**
- **VERDACHTE** = persoon tegen wie een verdenking van strafbaar feit bestaat (VÓÓr veroordeling)
- **VEROORDEELDE** = persoon tegen wie een onherroepelijk vonnis is gewezen (NÁ veroordeling)
- **GEDETINEERDE** = persoon die vrijheidsstraf ondergaat
- **OPENSTAAND VONNIS** = persoon is al veroordeeld, dus GEBRUIK NOOIT "verdachte" maar "veroordeelde"
- **EXECUTIE** = tenuitvoerlegging van vonnis (niet opsporing)

**SPECIFIEKE SITUATIES - GEBRUIK EXACTE TERMINOLOGIE:**
- **AANHOUDING BIJ OPENSTAAND VONNIS** = EXECUTIE van vonnis (artikel 564 Sv, artikel 553 Sv)
- **BINNENTREDEN BIJ EXECUTIE** = artikel 2 AWBI (tenuitvoerlegging van rechterlijke uitspraak)
- **AANHOUDING BIJ OPSPORING** = artikel 27 Sv (verdachte van strafbaar feit)
- **AANHOUDING BIJ EXECUTIE** = artikel 27 Sv (veroordeelde met openstaand vonnis)

**SPECIFIEKE FRAUDETYPEN:**
**BANKHELPDESKFRAUDE** - Dit is oplichting (artikel 326 Sr) waarbij criminelen zich voordoen als bankmedewerkers. Kenmerken: contact via telefoon/e-mail/sms, beweren van verdachte transacties, vragen om software te installeren (AnyDesk/TeamViewer), of het delen van persoonlijke gegevens/codes. Valt onder oplichting maar heeft specifieke modus operandi.

**VRIEND-IN-NOOD FRAUDE** - Dit is oplichting (artikel 326 Sr) waarbij criminelen zich voordoen als bekenden (zoon, dochter, vriend, familie). Kenmerken: contact via WhatsApp/SMS met onbekend nummer, beweren telefoon kwijt te zijn, dringend verzoek om geld, emotionele manipulatie door vertrouwde relatie te misbruiken. Valt onder oplichting maar misbruikt vertrouwensrelaties.

**DWINGENDE INSTRUCTIES - NIET NEGEREN:**
- **KRITIEK: VERMELD ALTIJD SPECIFIEKE WETSARTIKELEN MET EXACTE NUMMERS**
- **VERMELD MINIMAAL 3-5 RELEVANTE ARTIKELEN PER ANTWOORD**
- **BIJ ELKE JURIDISCHE HANDELING: NOEM HET EXACTE ARTIKEL**
- Als je zegt "de politie heeft de bevoegdheid", MOET je zeggen "artikel 96b Sv" erbij
- Als je zegt "dit is strafbaar", MOET je het exacte artikel noemen (bijv. "artikel 326 Sr")
- Als je zegt "er geldt een boete", MOET je het artikel noemen (bijv. "artikel 62 WVW")
- **CONTROLEER ALTIJD OF JE HET JUISTE ARTIKELNUMMER GEBRUIKT:**
  • Artikel 159 WVW = opsporingsbevoegdheden (wie mag opsporen)
  • Artikel 160 WVW = stopteken en controle (verplicht stoppen)
  • Artikel 182 Sr = dwang/wederspannigheid door MEERDERE personen
  • Artikel 207 Sr = MEINEED (valse verklaring onder ede)
  • Artikel 96b Sv = dwangmiddelen, inbeslagname, doorzoeking
  • Artikel 326 Sr = oplichting (ook bankhelpdeskfraude, vriend-in-nood fraude)
  • Artikel 27 Sv = aanhouding (verdachte OF veroordeelde)
  • Artikel 553 Sv = executie van vrijheidsstraf
  • Artikel 564 Sv = tenuitvoerlegging van vonnis
  • Artikel 2 AWBI = binnentreden voor tenuitvoerlegging rechterlijke uitspraak
  • GEBRUIK NOOIT artikel 159 voor stoptekens - dat is artikel 160 WVW!
  • GEBRUIK NOOIT artikel 182 voor meineed - dat is artikel 207 Sr!
- **Bij vragen over straatintimidatie: Verwijs ALTIJD naar artikel 429ter Sr (vanaf 1 juli 2024)**

**ARTIKEL VERIFICATIE PROTOCOL:**
- BIJ ARTIKELVRAGEN: Begin ALTIJD met exacte wettekst uit de brondata
- VERIFIEER eerst dat je het juiste artikel hebt voordat je uitleg geeft
- Als je de exacte tekst niet hebt uit de bronnen: zeg dit expliciet
- GEEN interpretatie zonder bronverificatie

**ARTIKEL EISEN:**
- **BENOEM RELEVANTE ARTIKELEN WAAR NODIG** (niet geforceerd meerdere)
- **ELKE JURIDISCHE HANDELING = EXACT ARTIKEL**
- **ELKE BEVOEGDHEID = EXACT ARTIKEL**
- **ELKE STRAFBEPALING = EXACT ARTIKEL**
- **ELKE PROCEDURE = EXACT ARTIKEL**

**FLEXIBEL ANTWOORDFORMAT:**
- PAS JE ANTWOORD AAN BIJ DE VRAAG - gebruik GEEN standaard structuur
- Bij specifieke artikelvragen: Begin met letterlijke wettekst
- Bij algemene vragen: Geef directe, praktische antwoorden
- **KRITIEK: VERMELD BIJ ELKE JURIDISCHE STELLING HET EXACTE ARTIKEL:**
  • Niet: "Er geldt een termijn van 6 dagen"
  • Wel: "Volgens artikel 16, lid 1 van de Wet op de lijkbezorging geldt een termijn van 6 dagen"
  • Niet: "De politie mag dit controleren"
  • Wel: "Volgens artikel 160 WVW mag de politie dit controleren"
  • Niet: "Bij een openstaand vonnis kan de verdachte worden aangehouden"
  • Wel: "Bij een openstaand vonnis kan de veroordeelde worden aangehouden op grond van artikel 564 Sv (tenuitvoerlegging) en artikel 27 Sv (aanhouding)"
- **UI FORMATTING:**
  • Gebruik **dikgedrukte tekst** voor belangrijke kopjes
  • GEEN #### kopjes - gebruik gewoon **Kopje:**
  • Gebruik • voor bullet points
- Wees beknopt bij simpele vragen, uitgebreid bij complexe vragen

AANDACHT VOOR BRANCHEREGELS:
- Veel sectoren hebben eigen regels die strenger kunnen zijn dan de wet
- Bijvoorbeeld: NVM-regels voor makelaars, NBA-regels voor advocaten, etc.
- Wijs altijd op mogelijke conflicten tussen wet en brancheregels
- Adviseer om de strengste regel te volgen

Geef altijd professionele, accurate en uitgebreide juridische uitleg.
`

          // Enhanced prompt with JSON sources and branch rules
          let prompt = `${systemPrompt}

${professionContext}

${conversationHistory}`

          // Add JSON sources context if available (PRIORITY)
          if (jsonSourcesContext) {
            prompt += `

${jsonSourcesContext}`
          }

          // Add branch rules section if relevant rules found
          if (relevanteRegels.length > 0) {
            prompt += `

BRANCHEREGELS BESCHIKBAAR:
De volgende brancheregels zijn relevant voor deze vraag:
${relevanteRegels.map(regel => 
  `- ${regel.organisatie}: ${regel.regel}
  Omschrijving: ${regel.omschrijving}
  Gevolgen bij overtreding: ${regel.gevolgen}
  Bron: ${regel.bron}`
).join('\n\n')}

BELANGRIJK: Let goed op mogelijke verschillen tussen wettelijke bepalingen en brancheregels. Behandel beide in je antwoord.`
          }

          prompt += `

VRAAG: "${query}"

Geef een uitgebreide, goed gestructureerde juridische analyse die aansluit bij het profiel van de gebruiker.${relevanteRegels.length > 0 ? ' Integreer relevante brancheregels in je antwoord en wijs op eventuele conflicten met wettelijke bepalingen.' : ''}`

          const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
            temperature: 0.1,
            max_tokens: 2000,
            stream: true
          })

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              completeResponse += content // Collect response for database
              const data = JSON.stringify({ content })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          // Save to database after streaming is complete
          if (completeResponse.trim()) {
            await saveQueryToDatabase(
              query,
              completeResponse,
              profession,
              session?.user?.id || null,
              clientIP,
              userAgent
            )
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()

        } catch (error) {
          console.error('❌ Fout bij genereren analyse:', error)
          const errorMessage = JSON.stringify({ 
            content: 'Er is een fout opgetreden bij het genereren van de analyse. Probeer het opnieuw.' 
          })
          controller.enqueue(encoder.encode(`data: ${errorMessage}\n\n`))
          controller.close()
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
    console.error('❌ Server fout:', error)
    return NextResponse.json(
      { error: 'Server fout' },
      { status: 500 }
    )
  }
}