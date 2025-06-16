/**
 * 🧠 WetHelder Context Analysis Engine
 * Advanced multi-step reasoning and sector-specific knowledge base
 */

export interface ContextAnalysis {
  sectors: string[]
  specialRules: SpecialRule[]
  legalPrinciples: string[]
  requiredConsiderations: string[]
  additionalSources: string[]
  promptEnhancements: string[]
}

export interface SpecialRule {
  rule: string
  articles: string[]
  description: string
  priority: 'high' | 'medium' | 'low'
}

export interface SectorKnowledge {
  name: string
  keywords: string[]
  laws: string[]
  principles: string[]
  specialRules: SpecialRule[]
  considerations: string[]
  commonIssues: string[]
  relatedSectors: string[]
}

/**
 * 🏥 Comprehensive Sector Knowledge Base
 */
const SECTOR_KNOWLEDGE: Record<string, SectorKnowledge> = {
  HEALTHCARE: {
    name: "Zorg en Gezondheidszorg",
    keywords: [
      "ziekenhuis", "arts", "dokter", "medisch", "patiënt", "zorg", "behandeling", 
      "dossier", "medische gegevens", "zorgverlener", "verpleegkundige", "specialist",
      "huisarts", "tandarts", "fysiotherapeut", "psycholoog", "psychiater",
      "medisch centrum", "kliniek", "polikliniek", "zorginstelling"
    ],
    laws: [
      "WGBO (Wet op de geneeskundige behandelingsovereenkomst)",
      "BW Boek 7 Titel 7 (Opdracht tot het verrichten van handelingen op het gebied van de geneeskunst)",
      "Sv art. 218 (Verschoningsrecht)",
      "AVG/GDPR (Bijzondere categorieën persoonsgegevens)",
      "Wet BIG (Beroepen in de individuele gezondheidszorg)",
      "Kwaliteitswet zorginstellingen",
      "Wet medezeggenschap cliënten zorginstellingen"
    ],
    principles: [
      "Medisch beroepsgeheim",
      "Verschoningsrecht zorgverleners", 
      "Informed consent",
      "Proportionaliteit bij gegevensverstrekking",
      "Subsidiariteit (eerst andere bronnen proberen)",
      "Patiëntautonomie",
      "Zorgvuldigheidsbeginsel"
    ],
    specialRules: [
      {
        rule: "Medisch beroepsgeheim",
        articles: ["7:457 BW", "218 Sv"],
        description: "Zorgverleners hebben verschoningsrecht en mogen niet gedwongen worden medische gegevens prijs te geven",
        priority: "high"
      },
      {
        rule: "Bijzondere categorieën persoonsgegevens",
        articles: ["AVG art. 9"],
        description: "Medische gegevens zijn extra beschermd onder de AVG",
        priority: "high"
      },
      {
        rule: "Proportionaliteit en subsidiariteit",
        articles: ["8 EVRM", "Sv art. 96a"],
        description: "Vordering van medische gegevens moet proportioneel zijn en andere bronnen moeten eerst worden geprobeerd",
        priority: "high"
      }
    ],
    considerations: [
      "Is er sprake van een spoedgeval of ernstig misdrijf?",
      "Kunnen de gegevens op andere wijze worden verkregen?",
      "Is de vordering proportioneel ten opzichte van het onderzoek?",
      "Welke specifieke gegevens worden gevorderd?",
      "Is er toestemming van de patiënt?",
      "Betreft het identificeerbare patiëntgegevens?"
    ],
    commonIssues: [
      "Camerabeelden in ziekenhuizen",
      "Medische dossiers vorderen",
      "Getuigenverklaringen van zorgpersoneel",
      "Toegang tot patiëntgegevens",
      "Meldplicht bij strafbare feiten"
    ],
    relatedSectors: ["PRIVACY", "CRIMINAL_LAW"]
  },

  LEGAL_PROFESSION: {
    name: "Advocatuur en Juridische Beroepen",
    keywords: [
      "advocaat", "kantoor", "cliënt", "verschoningsrecht", "beroepsgeheim",
      "juridisch adviseur", "rechtsbijstand", "advocatenkantoor", "juridische hulp",
      "procesvertegenwoordiging", "rechtshulp", "advocatenorde"
    ],
    laws: [
      "Advocatenwet",
      "Sv art. 218 (Verschoningsrecht)",
      "Verordening op de advocatuur",
      "Gedragsregels advocaten"
    ],
    principles: [
      "Verschoningsrecht",
      "Beroepsgeheim",
      "Vertrouwelijkheid advocaat-cliënt relatie",
      "Onafhankelijkheid van de advocatuur",
      "Zorgvuldigheidsplicht"
    ],
    specialRules: [
      {
        rule: "Verschoningsrecht advocaten",
        articles: ["218 Sv"],
        description: "Advocaten kunnen zich beroepen op verschoningsrecht en hoeven geen getuigenis af te leggen",
        priority: "high"
      }
    ],
    considerations: [
      "Betreft het communicatie tussen advocaat en cliënt?",
      "Is er sprake van een advocaat-cliënt relatie?",
      "Valt de informatie onder het beroepsgeheim?"
    ],
    commonIssues: [
      "Huiszoeking bij advocatenkantoor",
      "Vordering van cliëntdossiers",
      "Getuigplicht advocaten"
    ],
    relatedSectors: ["PRIVACY", "CRIMINAL_LAW"]
  },

  EDUCATION: {
    name: "Onderwijs",
    keywords: [
      "school", "student", "onderwijs", "leerling", "docent", "leraar",
      "universiteit", "hogeschool", "onderwijsinstelling", "mbo", "hbo",
      "basisschool", "middelbare school", "gymnasium", "vmbo"
    ],
    laws: [
      "Wet op het primair onderwijs (WPO)",
      "Wet op het voortgezet onderwijs (WVO)", 
      "Wet op het hoger onderwijs en wetenschappelijk onderzoek (WHW)",
      "AVG (Privacy van leerlingen/studenten)"
    ],
    principles: [
      "Zorgplicht onderwijsinstelling",
      "Privacy van leerlingen/studenten",
      "Meldplicht kindermishandeling",
      "Leerplicht"
    ],
    specialRules: [
      {
        rule: "Meldcode kindermishandeling",
        articles: ["Jeugdwet art. 4.1.1"],
        description: "Onderwijspersoneel heeft meldplicht bij vermoedens van kindermishandeling",
        priority: "high"
      }
    ],
    considerations: [
      "Betreft het minderjarige leerlingen?",
      "Is er sprake van kindermishandeling?",
      "Welke privacy rechten zijn van toepassing?"
    ],
    commonIssues: [
      "Cameratoezicht op scholen",
      "Toegang tot leerlingdossiers",
      "Meldplicht bij strafbare feiten"
    ],
    relatedSectors: ["PRIVACY", "YOUTH_LAW"]
  },

  FINANCIAL: {
    name: "Financiële Sector",
    keywords: [
      "bank", "financieel", "rekening", "transactie", "betaling",
      "krediet", "hypotheek", "verzekering", "belegging", "pensioen"
    ],
    laws: [
      "Wet ter voorkoming van witwassen en financieren van terrorisme (Wwft)",
      "Wet op het financieel toezicht (Wft)",
      "Bankwet"
    ],
    principles: [
      "Bankgeheim",
      "Meldplicht ongebruikelijke transacties",
      "Know Your Customer (KYC)"
    ],
    specialRules: [
      {
        rule: "Bankgeheim",
        articles: ["Wft art. 1:89"],
        description: "Financiële instellingen hebben geheimhoudingsplicht",
        priority: "high"
      }
    ],
    considerations: [
      "Is er sprake van witwassen of terrorismefinanciering?",
      "Betreft het een ongebruikelijke transactie?"
    ],
    commonIssues: [
      "Vordering banktransacties",
      "Toegang tot rekeninggegevens"
    ],
    relatedSectors: ["PRIVACY", "CRIMINAL_LAW"]
  }
}

/**
 * 🔍 Phase 1: Context Detection and Analysis
 */
export function detectContexts(question: string): string[] {
  const questionLower = question.toLowerCase()
  const detectedContexts: string[] = []

  for (const [sectorKey, sector] of Object.entries(SECTOR_KNOWLEDGE)) {
    const keywordMatches = sector.keywords.filter(keyword => 
      questionLower.includes(keyword.toLowerCase())
    ).length

    // Detect sector if multiple keywords match or specific high-value keywords
    if (keywordMatches >= 2 || 
        sector.keywords.some(keyword => 
          questionLower.includes(keyword.toLowerCase()) && keyword.length > 6
        )) {
      detectedContexts.push(sectorKey)
    }
  }

  return detectedContexts
}

/**
 * 🧠 Phase 2: Deep Context Analysis
 */
export function analyzeContext(question: string, detectedSectors: string[]): ContextAnalysis {
  const analysis: ContextAnalysis = {
    sectors: detectedSectors,
    specialRules: [],
    legalPrinciples: [],
    requiredConsiderations: [],
    additionalSources: [],
    promptEnhancements: []
  }

  for (const sectorKey of detectedSectors) {
    const sector = SECTOR_KNOWLEDGE[sectorKey]
    if (!sector) continue

    // Collect special rules
    analysis.specialRules.push(...sector.specialRules)
    
    // Collect legal principles
    analysis.legalPrinciples.push(...sector.principles)
    
    // Collect considerations
    analysis.requiredConsiderations.push(...sector.considerations)

    // Generate sector-specific prompt enhancement
    const enhancement = generateSectorPrompt(sector, question)
    analysis.promptEnhancements.push(enhancement)
  }

  // Remove duplicates and sort by priority
  analysis.specialRules = analysis.specialRules
    .filter((rule, index, self) => self.findIndex(r => r.rule === rule.rule) === index)
    .sort((a, b) => a.priority === 'high' ? -1 : 1)

  analysis.legalPrinciples = [...new Set(analysis.legalPrinciples)]
  analysis.requiredConsiderations = [...new Set(analysis.requiredConsiderations)]

  return analysis
}

/**
 * 🎯 Dynamic Prompt Building
 */
function generateSectorPrompt(sector: SectorKnowledge, question: string): string {
  return `
🎯 ${sector.name.toUpperCase()} CONTEXT GEDETECTEERD:

**Relevante Wetgeving:**
${sector.laws.map(law => `• ${law}`).join('\n')}

**Juridische Principes:**
${sector.principles.map(principle => `• ${principle}`).join('\n')}

**Speciale Regels:**
${sector.specialRules.map(rule => 
  `• ${rule.rule} (${rule.articles.join(', ')}): ${rule.description}`
).join('\n')}

**Verplichte Overwegingen:**
${sector.considerations.map(consideration => `• ${consideration}`).join('\n')}

**INSTRUCTIE:** Behandel ALLE bovenstaande aspecten in je antwoord. Geef een volledig juridisch beeld dat rekening houdt met de bijzondere positie van ${sector.name.toLowerCase()}.
`
}

/**
 * 🔄 Multi-Step Reasoning Engine
 */
export function buildEnhancedPrompt(
  basePrompt: string, 
  question: string, 
  contextAnalysis: ContextAnalysis
): string {
  if (contextAnalysis.sectors.length === 0) {
    return basePrompt // No special context detected
  }

  const enhancedPrompt = `
${basePrompt}

🧠 MULTI-STEP REASONING ACTIVATED:

STAP 1: CONTEXT ANALYSE VOLTOOID
Gedetecteerde sectoren: ${contextAnalysis.sectors.join(', ')}
Aantal speciale regels: ${contextAnalysis.specialRules.length}
Aantal juridische principes: ${contextAnalysis.legalPrinciples.length}

STAP 2: SECTOR-SPECIFIEKE KENNIS
${contextAnalysis.promptEnhancements.join('\n')}

STAP 3: VERPLICHTE ANALYSE PUNTEN
Bij het beantwoorden van deze vraag MOET je de volgende punten behandelen:
${contextAnalysis.requiredConsiderations.map((consideration, index) => 
  `${index + 1}. ${consideration}`
).join('\n')}

STAP 4: SPECIALE JURIDISCHE REGELS (PRIORITEIT)
${contextAnalysis.specialRules
  .filter(rule => rule.priority === 'high')
  .map(rule => `🔴 HOGE PRIORITEIT: ${rule.rule} (${rule.articles.join(', ')})
   ${rule.description}`)
  .join('\n')}

${contextAnalysis.specialRules
  .filter(rule => rule.priority !== 'high')
  .map(rule => `🟡 ${rule.rule} (${rule.articles.join(', ')})
   ${rule.description}`)
  .join('\n')}

STAP 5: GESTRUCTUREERD ANTWOORD VEREIST
Structureer je antwoord als volgt:
1. **Algemene juridische positie** (basis regels)
2. **Sector-specifieke overwegingen** (${contextAnalysis.sectors.join(', ')})
3. **Speciale regels en uitzonderingen** (verschoningsrecht, beroepsgeheim, etc.)
4. **Praktische toepassing** (hoe werkt dit in de praktijk?)
5. **Conclusie** (volledig juridisch advies)

⚠️ KRITIEK: Geef GEEN antwoord dat alleen de algemene regels behandelt. Je MOET alle sector-specifieke aspecten meenemen.
`

  return enhancedPrompt
}

/**
 * 🎯 Main Context Analysis Function
 */
export function performContextAnalysis(question: string): {
  contexts: string[]
  analysis: ContextAnalysis
  enhancedPrompt: (basePrompt: string) => string
} {
  // Phase 1: Detect contexts
  const contexts = detectContexts(question)
  
  // Phase 2: Deep analysis
  const analysis = analyzeContext(question, contexts)
  
  // Phase 3: Dynamic prompt builder
  const enhancedPrompt = (basePrompt: string) => 
    buildEnhancedPrompt(basePrompt, question, analysis)

  return {
    contexts,
    analysis,
    enhancedPrompt
  }
} 