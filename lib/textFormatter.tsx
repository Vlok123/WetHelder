import React from 'react'

// Functie om URLs te detecteren en om te zetten naar klikbare links
export function linkifyText(text: string): React.ReactNode[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors"
        >
          {part}
        </a>
      )
    }
    return part
  })
}

// Functie om markdown-style formatting te verwerken
function formatMarkdown(text: string): React.ReactNode[] {
  // Verwerk **vetgedrukte** tekst
  const boldRegex = /\*\*(.*?)\*\*/g
  const parts = text.split(boldRegex)
  
  return parts.map((part, index) => {
    if (index % 2 === 1) { // Oneven indices zijn de vetgedrukte delen
      return <strong key={index}>{linkifyText(part)}</strong>
    }
    return linkifyText(part)
  })
}

// Functie om text te formatteren met alinea's en klikbare links
export function formatTextWithLinks(text: string, darkMode: boolean = false): React.ReactNode {
  if (!text) return null

  // Split op dubbele newlines voor alinea's
  const paragraphs = text.split(/\n\s*\n/)
  
  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, paragraphIndex) => {
        // Skip lege alinea's
        if (!paragraph.trim()) return null
        
        // Split op enkele newlines binnen alinea's
        const lines = paragraph.split('\n').filter(line => line.trim())
        
        return (
          <div key={paragraphIndex} className="space-y-2">
            {lines.map((line, lineIndex) => {
              const trimmedLine = line.trim()
              if (!trimmedLine) return null
              
              // Check of het een lijst item is
              const isListItem = /^[•\-\*]\s/.test(trimmedLine) || /^\d+\.\s/.test(trimmedLine)
              
              // Check of het een heading is (met ** of ### aan het begin)
              const isHeading = /^(\*\*.*?\*\*:?|###.*|##.*)/.test(trimmedLine)
              
              if (isListItem) {
                const formattedContent = formatMarkdown(trimmedLine)
                return (
                  <div key={lineIndex} className={`ml-4 leading-relaxed ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    {formattedContent}
                  </div>
                )
              }
              
              if (isHeading) {
                // Verwijder markdown indicators voor headings
                const cleanHeading = trimmedLine.replace(/^(\*\*|\#+\s*)/g, '').replace(/\*\*$/g, '')
                const formattedContent = formatMarkdown(cleanHeading)
                return (
                  <h3 key={lineIndex} className={`font-semibold text-lg mt-6 mb-3 ${
                    darkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    {formattedContent}
                  </h3>
                )
              }
              
              const formattedContent = formatMarkdown(trimmedLine)
              return (
                <p key={lineIndex} className={`leading-relaxed ${
                  darkMode ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  {formattedContent}
                </p>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// Functie om bronnen te formatteren met klikbare links
export function formatSourcesWithLinks(sources: string[], darkMode: boolean = false): React.ReactNode {
  if (!sources || sources.length === 0) return null
  
  return (
    <div className="space-y-2">
      {sources.map((source, index) => {
        const urlRegex = /(https?:\/\/[^\s]+)/
        const match = source.match(urlRegex)
        
        if (match) {
          const [url] = match
          const beforeUrl = source.substring(0, source.indexOf(url))
          const afterUrl = source.substring(source.indexOf(url) + url.length)
          
          return (
            <div key={index} className={`text-sm flex items-start gap-2 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span className="text-blue-500">•</span>
              <div>
                {beforeUrl}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors break-all"
                >
                  {url}
                </a>
                {afterUrl}
              </div>
            </div>
          )
        }
        
        return (
          <div key={index} className={`text-sm flex items-start gap-2 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <span className="text-blue-500">•</span>
            <span>{source}</span>
          </div>
        )
      })}
    </div>
  )
}

// Herbruikbare functie voor alle politie-wet content formatting
export const formatPolitieWetContent = (text: string): string => {
  // Eerst alle ** markers verwijderen en content opruimen
  let processedText = text
    // Verwijder alle ** markers (dit was de oude manier van formatteren)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Verwijder overmatige witregels en normaliseer spacing
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  
  // Process markdown links first to preserve them
  processedText = processedText.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g, 
    '|||MARKDOWN_LINK|||$1|||$2|||'
  )
  
    // ULTRA SIMPLE: Use unique placeholders then replace
  
  // 1. Replace ALLEEN complete article + law combinations (NIET standalone artikelen)
  const articleLawReplacements: Array<{placeholder: string, text: string, type: string}> = []
  let counter = 1000
  
  // Verbeterde regex voor artikel + wet/reglement combinaties (inclusief lange wet namen met voorzetsels en volledige afkortingen)
  processedText = processedText.replace(
    /(artikel|art\.)\s+(\d+(?:\.\d+)*[a-z]*(?::\d+)?(?:\s+lid\s+\d+[a-z]*)?(?:\s+sub\s+[a-z])?)\s+((?:[A-Z][\w\s&-]*?(?:wet|wetboek|reglement|code|verdrag|richtlijn)[\w\s\d\(\)]*?(?:op\s+het\s+\w+)?(?:\s*\([A-Z\w\s\d]+\))?)|(?:Sr|Sv|BW|Awbi?|WVW|RVV|Politiewet|Wegenverkeerswet|Reglement\s+voertuigen)(?:\s+\d{4})?)/gi,
    (match) => {
      const cleanMatch = match.replace(/[).,;]*$/, '').trim()
      const placeholder = `__PLACEHOLDER_${counter}__`
      articleLawReplacements.push({
        placeholder,
        text: cleanMatch,
        type: 'FULL_ARTICLE_LINK'
      })
      counter++
      return placeholder
    }
  )
  
  // GEEN standalone artikel links meer - alleen volledige combinaties!
  
  // 3. Replace standalone laws
  processedText = processedText.replace(
    /\b([A-Z][\w\s&-]*(?:wet|wetboek)[\w\s\d]*)\b/g,
    (match) => {
      if (match.length < 6) return match
      const cleanMatch = match.replace(/[).,;]*$/, '').trim()
      const placeholder = `__PLACEHOLDER_${counter}__`
      articleLawReplacements.push({
        placeholder,
        text: cleanMatch,
        type: 'LAW_LINK'
      })
      counter++
      return placeholder
    }
  )
  
  // 4. Convert all placeholders to actual links
  articleLawReplacements.forEach(replacement => {
    const encodedQuery = encodeURIComponent(replacement.text)
    const linkHtml = replacement.type === 'FULL_ARTICLE_LINK'
      ? `<a href="/wetuitleg?q=${encodedQuery}" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 cursor-pointer transition-colors">${replacement.text}</a>`
      : `<a href="/wetuitleg?q=${encodedQuery}" class="font-semibold text-indigo-700 bg-indigo-50 px-1 rounded hover:bg-indigo-100 cursor-pointer transition-colors">${replacement.text}</a>`
    
         processedText = processedText.replace(replacement.placeholder, linkHtml)
   })
   
   // Convert markdown links to actual HTML links
   processedText = processedText
     .replace(/\|\|\|MARKDOWN_LINK\|\|\|(.*?)\|\|\|(.*?)\|\|\|/g, 
       '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
  
  // Apply other legal formatting
  return processedText
    // ECLI codes
    .replace(/(ECLI:[A-Z]{2}:[A-Z]+:\d{4}:[A-Z0-9]+)/g, '<span class="font-mono text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700 border rounded">$1</span>')
    
    // Juridische termen tussen haakjes
    .replace(/\(([^)]*(?:art\.|artikel|wet|wetboek|ECLI)[^)]*)\)/g, '<span class="text-sm text-gray-600 italic">($1)</span>')
    
    // Belangrijke concepten (Rechten, Plichten, NIET, etc.)
    .replace(/\b(Rechten|Plichten|NIET|Veiligheidsfouillering|Preventief fouilleren|Fouillering bij aanhouding|Algemene verkeerscontrole|Laatst gecheckt|Disclaimer):/g, '<span class="font-semibold text-gray-900">$1:</span>')
} 