import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { scrapeJuridicalContent } from '@/lib/webScraper'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Functie om een gestructureerde samenvatting van een jurisprudentie uitspraak te genereren
async function generateJurisprudentieSummary(fullText: string): Promise<string> {
  const systemPrompt = `🎯 **ROL**: Je bent een gespecialiseerde juridische AI die uitspraken samenvat voor professionals en geïnteresseerden.

📋 **INSTRUCTIES**: 
Maak een samenvatting van deze juridische uitspraak volgens de opgegeven structuur.
Gebruik alleen informatie uit de uitspraak zelf.
Maak het helder en begrijpelijk voor niet-juristen.
Vermijd vakjargon, tenzij onvermijdelijk (leg dan kort uit).
Geef geen oordeel, wees feitelijk.
Maximaal 200 woorden.

🧾 **VERPLICHTE STRUCTUUR**:

**Kernvraag**: Wat was het juridische geschil?

**Feiten in het kort**: Wat speelde er feitelijk?

**Beslissing**: Wat heeft de rechter beslist?

**Relevantie**: Wat is belangrijk aan deze uitspraak? (bijv. toepasbare norm, uitleg van een wetsartikel)

Gebruik markdown formatting met ** voor vetgedrukte headers.`

  const userMessage = `Maak een samenvatting van deze uitspraak:

${fullText}`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.1,
      max_tokens: 500,
    })

    const summary = completion.choices[0]?.message?.content
    if (!summary) {
      throw new Error('Geen samenvatting gegenereerd')
    }

    return summary

  } catch (error) {
    console.error('❌ Error generating summary:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fullText, ecli, link } = await request.json()

    console.log('🔍 Generating summary for ECLI:', ecli)
    
    let textToSummarize = fullText

    // Als er geen fullText is, probeer de volledige tekst te scrapen van de link
    if (!textToSummarize || textToSummarize.trim().length === 0) {
      if (!link) {
        return NextResponse.json({ 
          error: 'Geen volledige tekst en geen link beschikbaar om tekst op te halen' 
        }, { status: 400 })
      }

      console.log('📄 Geen fullText beschikbaar, scraping van link:', link)
      
      try {
        const scrapedContent = await scrapeJuridicalContent(link)
        
        if (scrapedContent.success && scrapedContent.fullText.length > 100) {
          textToSummarize = scrapedContent.fullText
          console.log('✅ Successfully scraped content:', textToSummarize.length, 'characters')
        } else {
          throw new Error(scrapedContent.error || 'Scraping failed - insufficient content')
        }
      } catch (scrapingError) {
        console.error('❌ Scraping error:', scrapingError)
        return NextResponse.json({ 
          error: `Kon geen volledige tekst ophalen van de website: ${scrapingError instanceof Error ? scrapingError.message : 'Unknown scraping error'}`,
          suggestion: 'Probeer de volledige uitspraak direct te bekijken via de officiële link.'
        }, { status: 422 })
      }
    }

    // Controleer of we nu genoeg tekst hebben
    if (!textToSummarize || textToSummarize.trim().length < 100) {
      return NextResponse.json({ 
        error: 'Onvoldoende tekst beschikbaar voor een zinvolle samenvatting (minimum 100 karakters vereist)' 
      }, { status: 400 })
    }
    
    // Genereer de samenvatting
    const summary = await generateJurisprudentieSummary(textToSummarize)
    
    console.log('✅ Summary generated successfully')
    
    return NextResponse.json({
      success: true,
      summary,
      ecli,
      wasScraped: !fullText || fullText.trim().length === 0,
      scrapedFrom: (!fullText || fullText.trim().length === 0) ? link : undefined,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Summary generation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 