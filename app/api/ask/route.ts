import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

const SYSTEM_PROMPT = `Je bent een juridische AI die alleen mag antwoorden op basis van officiële Nederlandse wetten en jurisprudentie. Gebruik uitsluitend informatie van wetten.overheid.nl, zoek.officielebekendmakingen.nl, rechtspraak.nl en linkeddata.overheid.nl. Antwoorden zonder bronvermelding zijn niet toegestaan. Geen interpretaties, samenvattingen of adviezen geven buiten deze bronnen.

VERPLICHTE REGELS:
- Alleen concrete wetsartikelen en jurisprudentie citeren
- Altijd specifieke bronnen vermelden (wetsnummer, artikel, datum uitspraak)
- Bij onzekerheid: verwijs naar de officiële bron voor verificatie
- Geen juridisch advies geven, alleen feitelijke informatie
- Vermeld expliciet als informatie recent gewijzigd kan zijn

ANTWOORD STRUCTUUR:
1. Direct antwoord met wetsartikel
2. Exacte bron (wet + artikel + url indien mogelijk)
3. Relevante jurisprudentie (indien van toepassing)
4. Verwijzing naar officiële bron voor verificatie`

async function searchSources(question: string): Promise<string[]> {
  const sources: string[] = []
  const lowerQuestion = question.toLowerCase()
  
  // Verkeer en voertuigen
  if (lowerQuestion.includes('verkeer') || lowerQuestion.includes('auto') || lowerQuestion.includes('rijden') || lowerQuestion.includes('snelheid') || lowerQuestion.includes('overtreding')) {
    sources.push('https://wetten.overheid.nl/BWBR0006622/') // Wegenverkeerswet
    sources.push('https://wetten.overheid.nl/BWBR0004825/') // Reglement verkeersregels en verkeerstekens
  }
  
  // Strafrecht
  if (lowerQuestion.includes('strafrecht') || lowerQuestion.includes('misdaad') || lowerQuestion.includes('delict') || lowerQuestion.includes('gevangenis') || lowerQuestion.includes('boete')) {
    sources.push('https://wetten.overheid.nl/BWBR0001854/') // Wetboek van Strafrecht
    sources.push('https://wetten.overheid.nl/BWBR0001903/') // Wetboek van Strafvordering
  }
  
  // Burgerlijk recht
  if (lowerQuestion.includes('eigendom') || lowerQuestion.includes('contract') || lowerQuestion.includes('huur') || lowerQuestion.includes('koop') || lowerQuestion.includes('schade')) {
    sources.push('https://wetten.overheid.nl/BWBR0005289/') // Burgerlijk Wetboek Boek 3
    sources.push('https://wetten.overheid.nl/BWBR0005290/') // Burgerlijk Wetboek Boek 6
  }
  
  // Arbeidsrecht
  if (lowerQuestion.includes('werk') || lowerQuestion.includes('ontslag') || lowerQuestion.includes('arbeids') || lowerQuestion.includes('loon') || lowerQuestion.includes('vakantie')) {
    sources.push('https://wetten.overheid.nl/BWBR0024821/') // Arbeidsomstandighedenwet
    sources.push('https://wetten.overheid.nl/BWBR0011823/') // Arbeidstijdenwet
  }
  
  // Belastingrecht
  if (lowerQuestion.includes('belasting') || lowerQuestion.includes('btw') || lowerQuestion.includes('inkomsten') || lowerQuestion.includes('aangifte')) {
    sources.push('https://wetten.overheid.nl/BWBR0002471/') // Wet inkomstenbelasting
    sources.push('https://wetten.overheid.nl/BWBR0002629/') // Wet op de omzetbelasting
  }
  
  // Bestuurrecht
  if (lowerQuestion.includes('gemeente') || lowerQuestion.includes('vergunning') || lowerQuestion.includes('bezwaar') || lowerQuestion.includes('awb')) {
    sources.push('https://wetten.overheid.nl/BWBR0005537/') // Algemene wet bestuursrecht
  }
  
  // Politie en handhaving
  if (lowerQuestion.includes('politie') || lowerQuestion.includes('aanhouding') || lowerQuestion.includes('handhaving')) {
    sources.push('https://wetten.overheid.nl/BWBR0011468/') // Politiewet
    sources.push('https://www.politie.nl/informatie/')
  }
  
  // Grondwet en grondrechten
  if (lowerQuestion.includes('grondrecht') || lowerQuestion.includes('vrijheid') || lowerQuestion.includes('discriminatie') || lowerQuestion.includes('privacy')) {
    sources.push('https://wetten.overheid.nl/BWBR0001840/') // Grondwet
  }
  
  // Altijd rechtspraak.nl toevoegen voor jurisprudentie
  sources.push('https://www.rechtspraak.nl/')
  
  // Algemene wettendatabase
  sources.push('https://wetten.overheid.nl/')
  
  return Array.from(new Set(sources)) // Remove duplicates
}

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()
    
    if (!question || typeof question !== 'string') {
      return new Response('Ongeldige vraag', { status: 400 })
    }

    const sources = await searchSources(question)

    const encoder = new TextEncoder()
    let fullAnswer = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                {
                  role: 'system',
                  content: SYSTEM_PROMPT,
                },
                {
                  role: 'user',
                  content: question,
                },
              ],
              stream: true,
              max_tokens: 1200,
              temperature: 0.1,
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

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                if (data === '[DONE]') continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content || ''
                  
                  if (content) {
                    fullAnswer += content
                    const chunk = encoder.encode(
                      `data: ${JSON.stringify({ content })}\n\n`
                    )
                    controller.enqueue(chunk)
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }

          // Send sources
          if (sources.length > 0) {
            const sourcesChunk = encoder.encode(
              `data: ${JSON.stringify({ sources })}\n\n`
            )
            controller.enqueue(sourcesChunk)
          }

          // Send done signal
          const doneChunk = encoder.encode('data: [DONE]\n\n')
          controller.enqueue(doneChunk)

          // Save to database (without user association)
          try {
            await prisma.query.create({
              data: {
                question,
                answer: fullAnswer,
                sources: JSON.stringify(sources),
              },
            })
          } catch (dbError) {
            console.error('Database error:', dbError)
          }

        } catch (error) {
          console.error('Stream error:', error)
          const errorChunk = encoder.encode(
            `data: ${JSON.stringify({ 
              content: 'Er is een fout opgetreden. Probeer opnieuw.' 
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
    return new Response('Server error', { status: 500 })
  }
} 