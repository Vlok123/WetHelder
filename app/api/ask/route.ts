// Force dynamic rendering for Vercel
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

const SYSTEM_PROMPT = `Je bent WetHelder, een professionele Nederlandse juridische AI-assistent.

HOOFDREGEL: Schrijf ALTIJD in correct, helder Nederlands met volledige zinnen.

JE DOEL:
- Geef accurate, begrijpelijke antwoorden op Nederlandse juridische vragen
- Gebruik uitsluitend officiële Nederlandse bronnen
- Structureer antwoorden duidelijk en logisch

VEREISTE ANTWOORDFORMAT:
## [Hoofdonderwerp]

**Kort antwoord:**
[Direct antwoord in 1-2 zinnen]

**Wettelijke basis:**
- [Relevant wetsartikel met exacte bronvermelding]
- [Link naar wetten.overheid.nl indien beschikbaar]

**Belangrijke punten:**
- [Kernpunt 1]
- [Kernpunt 2]
- [Kernpunt 3]

**Bronnen:**
- [Officiële bronvermelding]

SCHRIJFREGELS:
✓ Gebruik complete, grammaticaal correcte zinnen
✓ Vermijd afkortingen en samenvoegingen
✓ Gebruik duidelijke koppen en bullet points
✓ Schrijf voor mensen, niet voor machines
✓ Controleer spelfouten en interpunctie

✗ NOOIT fragmenten of gebroken tekst
✗ NOOIT samenvoegingen zoals "artikel159V199"
✗ NOOIT weggelaten spaties of leestekens
✗ NOOIT onduidelijke afkortingen

BRONNEN:
- Alleen wetten.overheid.nl en rechtspraak.nl
- Vermeld altijd exacte artikelnummers
- Geef werkende links waar mogelijk`

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

// GET handler for Vercel build compatibility
export async function GET() {
  return new Response(JSON.stringify({ 
    message: 'WetHelder API is running',
    version: '1.0.0',
    endpoints: {
      POST: 'Send a legal question in JSON format: { "question": "your question" }'
    }
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('DEEPSEEK_API_KEY not configured')
      return new Response(JSON.stringify({ error: 'API configuration error' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { question, profession = 'burger' } = await request.json()
    
    if (!question || typeof question !== 'string') {
      return new Response(JSON.stringify({ error: 'Ongeldige vraag' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Customize system prompt based on profession
    const getProfessionPrompt = (prof: string) => {
      const basePrompt = SYSTEM_PROMPT;
      
      switch (prof) {
        case 'advocaat':
          return basePrompt + '\n\nSPECIFIEK VOOR ADVOCATEN:\n- Focus op procedurele aspecten en procesrecht\n- Vermeld relevante termijnen en formaliteiten\n- Geef jurisprudentie met ECLI-nummers waar mogelijk\n- Bekijk mogelijke rechtsmiddelen en beroepsprocedures'
        
        case 'politie':
          return basePrompt + '\n\nSPECIFIEK VOOR POLITIE:\n- Focus op handhaving en opsporingsbevoegdheden\n- Vermeld relevante artikelen uit Wetboek van Strafvordering\n- Geef duidelijke procedures voor verschillende situaties\n- Bekijk dwangmiddelen en hun voorwaarden'
        
        case 'boa':
          return basePrompt + '\n\nSPECIFIEK VOOR BOA\'s:\n- Focus op bijzondere opsporingsbevoegdheden\n- Vermeld welke overtredingen u kunt bekeuren\n- Geef duidelijke procedures en bevoegdheidsgrenzen\n- Bekijk samenwerking met politie en OM'
        
        case 'rechter':
          return basePrompt + '\n\nSPECIFIEK VOOR RECHTERS:\n- Focus op jurisprudentie en rechtsontwikkeling\n- Geef uitgebreide bronvermelding met ECLI-nummers\n- Vermeld verschillende rechtspraak en trends\n- Bekijk hogere rechtspraak en cassatie'
        
        case 'notaris':
          return basePrompt + '\n\nSPECIFIEK VOOR NOTARISSEN:\n- Focus op civielrecht en vermogensrecht\n- Vermeld relevante artikelen uit BW en registratiewetten\n- Geef praktische aspecten voor aktes en procedures\n- Bekijk fiscale implicaties waar relevant'
        
        case 'juridisch_adviseur':
          return basePrompt + '\n\nSPECIFIEK VOOR JURIDISCH ADVISEURS:\n- Focus op bedrijfsjuridische aspecten\n- Vermeld compliance en risicomanagement aspecten\n- Geef praktische implementatieadviezen\n- Bekijk zowel juridische als business impact'
        
        case 'student':
          return basePrompt + '\n\nSPECIFIEK VOOR RECHTENSTUDENTEN:\n- Geef uitgebreide uitleg van juridische concepten\n- Vermeld de achtergrond en ontwikkeling van de wet\n- Leg verbanden met andere rechtsgebieden\n- Geef voorbeelden ter verduidelijking'
        
        default: // burger
          return basePrompt + '\n\nSPECIFIEK VOOR BURGERS:\n- Gebruik begrijpelijke, niet-juridische taal\n- Leg juridische termen uit\n- Focus op praktische gevolgen en vervolgstappen\n- Verwijs naar relevante instanties voor hulp'
      }
    }

    const customPrompt = getProfessionPrompt(profession)
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
                  content: customPrompt,
                },
                {
                  role: 'user',
                  content: `Beantwoord deze juridische vraag in helder Nederlands: ${question}`,
                },
              ],
              stream: true,
              max_tokens: 1500,
              temperature: 0.0,
              top_p: 0.8,
              frequency_penalty: 0.0,
              presence_penalty: 0.0,
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
            buffer = lines.pop() || '' // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                if (data === '[DONE]') continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content || ''
                  
                  if (content) {
                    // Clean and validate content before adding
                    const cleanContent = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
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

          // Save to database (with safe error handling)
          try {
            if (prisma && prisma.query) {
              await prisma.query.create({
                data: {
                  question,
                  answer: fullAnswer,
                  sources: JSON.stringify(sources),
                } as any,
              })
            }
          } catch (dbError) {
            console.error('Database error (non-critical):', dbError)
            // Don't fail the request if database save fails
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
    return new Response(JSON.stringify({ error: 'Server error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 