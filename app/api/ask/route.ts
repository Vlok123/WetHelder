// Force dynamic rendering for Vercel
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

const SYSTEM_PROMPT = `Je bent een professionele Nederlandse juridische AI-assistent. Je doel is het geven van heldere, goed gestructureerde antwoorden op juridische vragen.

VERPLICHTE REGELS:
- Antwoord ALTIJD in correct, professioneel Nederlands
- Gebruik ALLEEN officiële Nederlandse bronnen (wetten.overheid.nl, rechtspraak.nl)
- Geef concrete wetsartikelen met exacte bronvermelding
- Structureer je antwoord met duidelijke koppen en paragrafen
- Geen interpretaties of juridisch advies, alleen feitelijke informatie
- Bij onzekerheid: verwijs naar officiële bronnen voor verificatie

ANTWOORDSTRUCTUUR:
1. **Direct antwoord** met relevant wetsartikel
2. **Wettelijke grondslag** (exacte wet + artikel + link indien mogelijk)
3. **Relevante jurisprudentie** (indien van toepassing)
4. **Belangrijke punten** in bulletpoints
5. **Bronvermelding** voor verdere verificatie

VOORBEELDFORMAT:
## Artikel [nummer] [Wetnaam]

**Artikel [nummer] [Wetnaam] bepaalt:**
[Exacte wettekst of samenvatting]

**Bron:** [Wetnaam], artikel [nummer] - [URL indien beschikbaar]

**Belangrijke punten:**
- [Punt 1]
- [Punt 2]

**Verificatie:** Raadpleeg altijd de actuele wettekst op wetten.overheid.nl`

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