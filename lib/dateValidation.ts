/**
 * Strikte datumvalidatie voor WetHelder
 * Weigert categorisch verouderde informatie
 */

export interface DateValidationResult {
  isValid: boolean;
  reason?: string;
  extractedYear?: number;
  currentYear: number;
}

export interface SourceValidation {
  isCurrentYear: boolean;
  hasValidDate: boolean;
  extractedDates: number[];
  reason: string;
  isReliable?: boolean;
  severity?: 'info' | 'warning' | 'error';
}

/**
 * Huidige jaar voor validatie
 */
export const getCurrentYear = (): number => new Date().getFullYear();

/**
 * Extracteert jaren uit tekst (2020-2030 range)
 */
export const extractYearsFromText = (text: string): number[] => {
  const currentYear = getCurrentYear();
  const yearRegex = /\b(20[2-3][0-9])\b/g;
  const matches = text.match(yearRegex);
  
  if (!matches) return [];
  
  return [...new Set(matches.map(Number))]
    .filter(year => year >= 2020 && year <= currentYear + 1)
    .sort((a, b) => b - a); // Nieuwste eerst
};

/**
 * Controleert of tekst verwijst naar verouderde regelgeving
 */
export const detectOutdatedReferences = (text: string): string[] => {
  const outdatedTerms = [
    'jubelton',
    'jubeltoeslag', 
    'afgeschaft per 2023',
    'tot en met 2022',
    'geldig tot 2022',
    'vervallen per 2023'
  ];
  
  return outdatedTerms.filter(term => 
    text.toLowerCase().includes(term.toLowerCase())
  );
};

/**
 * Strikte validatie van bron actualiteit
 */
export const validateSourceActuality = (
  content: string, 
  title: string = '',
  url: string = ''
): SourceValidation => {
  const currentYear = getCurrentYear();
  const extractedYears = extractYearsFromText(content + ' ' + title);
  const outdatedRefs = detectOutdatedReferences(content + ' ' + title);
  
  // Directe afwijzing bij verouderde termen
  if (outdatedRefs.length > 0) {
    return {
      isCurrentYear: false,
      hasValidDate: false,
      extractedDates: extractedYears,
      reason: `Bevat verouderde informatie: ${outdatedRefs.join(', ')}`
    };
  }
  
  // Geen jaartallen gevonden
  if (extractedYears.length === 0) {
    return {
      isCurrentYear: false,
      hasValidDate: false,
      extractedDates: [],
      reason: 'Geen geldig jaartal gevonden in bron'
    };
  }
  
  // Controleer of het meest recente jaar actueel is
  const mostRecentYear = Math.max(...extractedYears);
  
  if (mostRecentYear < currentYear) {
    return {
      isCurrentYear: false,
      hasValidDate: true,
      extractedDates: extractedYears,
      reason: `Bron is van ${mostRecentYear}, maar we zijn nu in ${currentYear}`
    };
  }
  
  // Bron is actueel
  return {
    isCurrentYear: true,
    hasValidDate: true,
    extractedDates: extractedYears,
    reason: `Actuele bron (${mostRecentYear})`
  };
};

/**
 * Controleert of een vraag specifiek naar het verleden verwijst
 */
export const isHistoricalQuery = (question: string): boolean => {
  const historicalIndicators = [
    'wat was',
    'hoe was het',
    'in het verleden',
    'vroeger',
    'destijds',
    'toen',
    'in 20', // gevolgd door jaar
    'geschiedenis van',
    'ontwikkeling van'
  ];
  
  const lowerQuestion = question.toLowerCase();
  return historicalIndicators.some(indicator => 
    lowerQuestion.includes(indicator)
  );
};

/**
 * Genereert een standaard afwijzingsbericht voor verouderde informatie
 */
export const generateOutdatedMessage = (reason: string): string => {
  return ` **Deze informatie is mogelijk verouderd.**

**Reden:** ${reason}

Ik kan dit pas beantwoorden met een actuele bron uit ${getCurrentYear()}. Voor betrouwbare en actuele informatie raadpleeg je:

- **Belastingdienst.nl** voor fiscale zaken
- **Wetten.overheid.nl** voor wetgeving  
- **Rechtspraak.nl** voor jurisprudentie

**Let op:** Gebruik alleen bronnen die expliciet vermelden dat ze geldig zijn voor ${getCurrentYear()}.`;
};

/**
 * Filtert zoekresultaten op actualiteit
 */
export const filterCurrentYearResults = (
  results: Array<{title: string, content: string, url?: string}>,
  allowHistorical: boolean = false
): Array<{title: string, content: string, url?: string, validation: SourceValidation}> => {
  return results
    .map(result => ({
      ...result,
      validation: validateSourceActuality(result.content, result.title, result.url)
    }))
    .filter(result => allowHistorical || result.validation.isCurrentYear);
}; 