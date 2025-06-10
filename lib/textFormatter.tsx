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