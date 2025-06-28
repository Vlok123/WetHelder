/**
 * WetHelder Legal Information Validation Library
 * Ensures reliability and accuracy of legal information provided to users
 */

export interface ValidationResult {
  isReliable: boolean
  confidence: 'high' | 'medium' | 'low'
  warnings: string[]
  recommendations: string[]
  sourceVerification: {
    hasOfficialSources: boolean
    sourcesUsed: string[]
    missingValidation: string[]
  }
}

export interface LegalQuery {
  query: string
  foundSources: any[]
  googleResults: string | null
  articleReferences: string[]
}

/**
 * Validates legal information reliability based on available sources
 */
export function validateLegalInformation(input: LegalQuery): ValidationResult {
  const warnings: string[] = []
  const recommendations: string[] = []
  const sourcesUsed: string[] = []
  const missingValidation: string[] = []
  
  let confidence: 'high' | 'medium' | 'low' = 'high'
  let hasOfficialSources = false

  // Check if Google API is configured and working
  if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_CSE_ID) {
    warnings.push("Google API niet geconfigureerd - geen validatie tegen officiële bronnen mogelijk")
    recommendations.push("Configureer Google Custom Search API volgens GOOGLE_API_SETUP_QUICK.md")
    confidence = 'low'
  }

  // Check if specific legal articles are referenced
  if (input.articleReferences.length > 0) {
    missingValidation.push(...input.articleReferences.map(ref => 
      `Artikel ${ref} - controleer altijd op wetten.overheid.nl`
    ))
    
    if (!input.googleResults) {
      warnings.push("Specifieke artikelen genoemd maar geen validatie via officiële bronnen")
      confidence = confidence === 'high' ? 'medium' : 'low'
    }
  }

  // Check Google results quality
  if (input.googleResults) {
    hasOfficialSources = true
    sourcesUsed.push("Google Custom Search (overheid.nl)")
    
    // Check if results contain official government sources
    const hasWettenOverheid = input.googleResults.includes('wetten.overheid.nl')
    const hasRechtspraak = input.googleResults.includes('rechtspraak.nl')
    const hasLokaleregelgeving = input.googleResults.includes('lokaleregelgeving.overheid.nl')
    
    if (hasWettenOverheid || hasRechtspraak || hasLokaleregelgeving) {
      confidence = 'high'
    } else {
      warnings.push("Google resultaten bevatten mogelijk geen officiële overheidsbronnen")
      confidence = 'medium'
    }
  } else {
    warnings.push("Geen Google validatie uitgevoerd - informatie gebaseerd op AI training data")
    confidence = 'low'
  }

  // Check JSON sources
  if (input.foundSources.length > 0) {
    sourcesUsed.push(`${input.foundSources.length} JSON bronnen`)
    hasOfficialSources = true
  } else {
    warnings.push("Geen JSON bronnen gevonden in lokale database")
    if (confidence === 'high') confidence = 'medium'
  }

  // Additional warnings for specific query types
  const queryLower = input.query.toLowerCase()
  
  if (queryLower.includes('actueel') || queryLower.includes('nieuw') || queryLower.includes('recent')) {
    warnings.push("Query vraagt om actuele informatie - controleer altijd de meest recente versie")
    recommendations.push("Raadpleeg wetten.overheid.nl voor de meest actuele wetgeving")
  }

  if (queryLower.includes('boete') || queryLower.includes('straf') || queryLower.includes('sanctie')) {
    warnings.push("Sanctie-informatie kan snel wijzigen - verifieer via officiële kanalen")
    recommendations.push("Controleer actuele boetetarieven bij relevante handhavingsinstantie")
  }

  // APV queries need special attention
  if (queryLower.includes('apv') || queryLower.includes('gemeente')) {
    warnings.push("APV-informatie is gemeente-specifiek en wijzigt regelmatig")
    recommendations.push("Raadpleeg de officiële gemeentelijke APV voor zekerheid")
  }

  const isReliable = confidence !== 'low' && warnings.length < 3

  return {
    isReliable,
    confidence,
    warnings,
    recommendations,
    sourceVerification: {
      hasOfficialSources,
      sourcesUsed,
      missingValidation
    }
  }
}

/**
 * Generates disclaimer text based on validation results
 */
export function generateValidationDisclaimer(validation: ValidationResult): string {
  const disclaimers: string[] = []

  if (!validation.isReliable) {
    disclaimers.push(" BETROUWBAARHEIDSMELDING: Deze informatie kan niet volledig worden geverifieerd tegen officiële bronnen.")
  }

  if (validation.confidence === 'low') {
    disclaimers.push(" VERIFICATIE AANBEVOLEN: Controleer deze informatie altijd via wetten.overheid.nl voordat u erop vertrouwt.")
  }

  if (validation.confidence === 'medium') {
    disclaimers.push(" GEDEELTELIJKE VERIFICATIE: Deze informatie is gebaseerd op beschikbare bronnen, maar controleer voor zekerheid de officiële wetgeving.")
  }

  if (validation.sourceVerification.missingValidation.length > 0) {
    disclaimers.push("ARTIKEL VERIFICATIE: " + validation.sourceVerification.missingValidation.join(", "))
  }

  if (validation.recommendations.length > 0) {
    disclaimers.push("AANBEVELINGEN: " + validation.recommendations.join("; "))
  }

  return disclaimers.join("\n\n")
}

/**
 * Creates standardized reliability indicators for responses
 */
export function getReliabilityIndicator(confidence: 'high' | 'medium' | 'low'): string {
  switch (confidence) {
    case 'high':
      return "HOGE BETROUWBAARHEID (Geverifieerd via officiële bronnen)"
    case 'medium':
      return "GEMIDDELDE BETROUWBAARHEID (Gedeeltelijke verificatie)"
    case 'low':
      return "LAGE BETROUWBAARHEID (Geen officiële bronverificatie)"
  }
}

/**
 * Checks if environment is properly configured for reliable operation
 */
export function checkEnvironmentReliability(): {
  isConfigured: boolean
  missingComponents: string[]
  recommendations: string[]
} {
  const missing: string[] = []
  const recommendations: string[] = []

  if (!process.env.OPENAI_API_KEY) {
    missing.push("OpenAI API Key")
    recommendations.push("Configureer OPENAI_API_KEY voor AI functionaliteit")
  }

  if (!process.env.GOOGLE_API_KEY) {
    missing.push("Google API Key")
    recommendations.push("Configureer GOOGLE_API_KEY voor bronvalidatie")
  }

  if (!process.env.GOOGLE_CSE_ID) {
    missing.push("Google Custom Search Engine ID")
    recommendations.push("Configureer GOOGLE_CSE_ID voor juridische zoekmachine")
  }

  if (!process.env.DATABASE_URL) {
    missing.push("Database URL")
    recommendations.push("Configureer DATABASE_URL voor lokale bronnen")
  }

  return {
    isConfigured: missing.length === 0,
    missingComponents: missing,
    recommendations
  }
} 