import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ 
        error: 'Invalid request format',
        response: 'Er ging iets mis bij het verwerken van de aanvraag.'
      }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      max_tokens: 2000,
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content || 'Er ging iets mis bij het genereren van de aangifte.'

    return NextResponse.json({ 
      response: content
    })
    
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json({ 
      error: 'OpenAI API error',
      response: 'Er ging iets mis bij het genereren van de aangifte. Probeer het opnieuw.'
    }, { status: 500 })
  }
} 