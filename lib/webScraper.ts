/**
 * Web scraper voor juridische websites
 * Haalt volledige tekst op van rechtspraak.nl en andere juridische bronnen
 */

interface ScrapedContent {
  success: boolean
  fullText: string
  title?: string
  ecli?: string
  error?: string
}

/**
 * Haalt volledige tekst op van een rechtspraak.nl uitspraak pagina
 */
export async function scrapeRechtspraakNl(url: string): Promise<ScrapedContent> {
  try {
    console.log(' Scraping rechtspraak.nl URL:', url)

    // Haal de HTML op
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WetHelder/1.0 (https://wethelder.nl; juridische samenvatting service)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    
    // Parse de HTML voor rechtspraak.nl specifieke structuur
    const result = parseRechtspraakHtml(html, url)
    
    console.log(' Successfully scraped content:', result.fullText.length, 'characters')
    
    return result

  } catch (error) {
    console.error(' Error scraping rechtspraak.nl:', error)
    return {
      success: false,
      fullText: '',
      error: error instanceof Error ? error.message : 'Unknown scraping error'
    }
  }
}

/**
 * Parse HTML van rechtspraak.nl pagina en extracteer de relevante content
 */
function parseRechtspraakHtml(html: string, url: string): ScrapedContent {
  try {
    // Verschillende selectors voor rechtspraak.nl content
    const contentSelectors = [
      // Moderne rechtspraak.nl structuur
      '.uitspraak-content',
      '.content-body', 
      '.document-content',
      '#content',
      '.main-content',
      
      // Fallback selectors
      'article',
      '.article-content',
      '[role="main"]',
      'main'
    ]

    // Zoek naar ECLI in de URL of HTML
    const ecliMatch = url.match(/ECLI[:\.]([A-Z]{2}[:\.]?[A-Z]+[:\.]?\d{4}[:\.]?\d+)/i) || 
                     html.match(/ECLI[:\.]([A-Z]{2}[:\.]?[A-Z]+[:\.]?\d{4}[:\.]?\d+)/i)
    const ecli = ecliMatch ? ecliMatch[0].replace(/\./g, ':') : undefined

    // Zoek naar titel
    const titleSelectors = [
      /<title[^>]*>([^<]+)<\/title>/i,
      /<h1[^>]*>([^<]+)<\/h1>/i,
      /<h2[^>]*>([^<]+)<\/h2>/i
    ]
    
    let title = ''
    for (const selector of titleSelectors) {
      const match = html.match(selector)
      if (match && match[1] && !match[1].includes('DOCTYPE')) {
        title = cleanText(match[1])
        break
      }
    }

    // Probeer eerst moderne selectors
    let fullText = ''
    
    for (const selector of contentSelectors) {
      const regex = new RegExp(`<[^>]*class="[^"]*${selector.replace('.', '')}[^"]*"[^>]*>(.*?)</[^>]+>`, 'is')
      const match = html.match(regex)
      
      if (match && match[1]) {
        fullText = cleanHtmlText(match[1])
        if (fullText.length > 200) break // Voldoende content gevonden
      }
    }

    // Fallback: zoek naar typische rechtspraak content markers
    if (!fullText || fullText.length < 200) {
      const contentMarkers = [
        /Uitspraak([\s\S]*?)(?:<\/div>|<\/article>|<\/section>|$)/i,
        /Vonnis([\s\S]*?)(?:<\/div>|<\/article>|<\/section>|$)/i,
        /Arrest([\s\S]*?)(?:<\/div>|<\/article>|<\/section>|$)/i,
        /Beschikking([\s\S]*?)(?:<\/div>|<\/article>|<\/section>|$)/i,
        /ECLI[^<]*<[^>]*>([\s\S]*?)(?:<\/div>|<\/article>|<\/section>|$)/i
      ]

      for (const marker of contentMarkers) {
        const match = html.match(marker)
        if (match && match[1]) {
          const content = cleanHtmlText(match[1])
          if (content.length > fullText.length) {
            fullText = content
          }
        }
      }
    }

    // Als nog steeds geen goede content, probeer body content maar filter noise
    if (!fullText || fullText.length < 200) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
      if (bodyMatch) {
        fullText = cleanHtmlText(bodyMatch[1])
        // Filter common navigation en footer tekst
        fullText = filterNavigationText(fullText)
      }
    }

    // Minimale content check
    if (!fullText || fullText.length < 100) {
      throw new Error('Onvoldoende content gevonden op de pagina')
    }

    return {
      success: true,
      fullText: fullText.trim(),
      title: title || undefined,
      ecli: ecli || undefined
    }

  } catch (error) {
    return {
      success: false,
      fullText: '',
      error: error instanceof Error ? error.message : 'HTML parsing error'
    }
  }
}

/**
 * Reinigt HTML tekst door tags te verwijderen en tekst op te schonen
 */
function cleanHtmlText(html: string): string {
  return html
    // Verwijder script en style tags met inhoud
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    
    // Verwijder alle HTML tags
    .replace(/<[^>]+>/g, ' ')
    
    // Decodeer HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (match, num) => String.fromCharCode(parseInt(num)))
    .replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
    
    // Normaliseer whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Reinigt gewone tekst
 */
function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Filtert navigatie en footer tekst uit de content
 */
function filterNavigationText(content: string): string {
  const navigationPatterns = [
    /menu|navigatie|zoeken|contact|sitemap|cookies|privacy|disclaimer/gi,
    /home\s*>.*?>/gi,
    /^\s*(menu|nav|footer|header).*$/gim,
    /^\s*©.*$/gim,
    /^\s*\d{4}\s*rechtspraak\.nl.*$/gim
  ]

  let filtered = content
  for (const pattern of navigationPatterns) {
    filtered = filtered.replace(pattern, '')
  }

  return filtered
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Algemene functie om content te scrapen van verschillende juridische websites
 */
export async function scrapeJuridicalContent(url: string): Promise<ScrapedContent> {
  const hostname = new URL(url).hostname.toLowerCase()
  
  // Route naar specifieke scrapers
  if (hostname.includes('rechtspraak.nl') || hostname.includes('uitspraken.rechtspraak.nl')) {
    return scrapeRechtspraakNl(url)
  }
  
  // Fallback voor andere juridische sites
  return scrapeGenericContent(url)
}

/**
 * Generieke scraper voor andere juridische websites
 */
async function scrapeGenericContent(url: string): Promise<ScrapedContent> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WetHelder/1.0 (https://wethelder.nl)',
        'Accept': 'text/html,application/xhtml+xml',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    
    if (!bodyMatch) {
      throw new Error('Geen body content gevonden')
    }

    const fullText = cleanHtmlText(bodyMatch[1])
    
    if (fullText.length < 100) {
      throw new Error('Onvoldoende content gevonden')
    }

    return {
      success: true,
      fullText: fullText.trim()
    }

  } catch (error) {
    return {
      success: false,
      fullText: '',
      error: error instanceof Error ? error.message : 'Scraping error'
    }
  }
} 