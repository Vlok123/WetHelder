import { NextRequest, NextResponse } from 'next/server'
import { performContextAnalysis } from '@/lib/contextAnalysis'
import { testContextAnalysis, demoDetailedAnalysis } from '@/lib/contextAnalysisTest'

export async function POST(request: NextRequest) {
  try {
    const { question, mode = 'analyze' } = await request.json()

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    if (mode === 'test') {
      // Run full test suite
      console.log('🧪 Running Context Analysis Test Suite')
      testContextAnalysis()
      
      return NextResponse.json({
        message: 'Test suite completed - check server logs for results',
        mode: 'test'
      })
    }

    if (mode === 'demo') {
      // Run detailed demo for specific question
      console.log('🔬 Running Detailed Analysis Demo')
      demoDetailedAnalysis(question)
      
      const result = performContextAnalysis(question)
      return NextResponse.json({
        question,
        contexts: result.contexts,
        analysis: {
          specialRulesCount: result.analysis.specialRules.length,
          legalPrinciplesCount: result.analysis.legalPrinciples.length,
          requiredConsiderationsCount: result.analysis.requiredConsiderations.length,
          specialRules: result.analysis.specialRules,
          legalPrinciples: result.analysis.legalPrinciples,
          requiredConsiderations: result.analysis.requiredConsiderations
        },
        mode: 'demo'
      })
    }

    // Default: analyze mode
    const result = performContextAnalysis(question)
    
    return NextResponse.json({
      question,
      contexts: result.contexts,
      analysis: {
        specialRulesCount: result.analysis.specialRules.length,
        legalPrinciplesCount: result.analysis.legalPrinciples.length,
        requiredConsiderationsCount: result.analysis.requiredConsiderations.length,
        hasSpecializedContext: result.contexts.length > 0
      },
      mode: 'analyze'
    })

  } catch (error) {
    console.error(' Context Analysis Test Error:', error)
    return NextResponse.json({ 
      error: 'Er is een fout opgetreden bij de context analyse test' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Quick test with predefined hospital question
  const hospitalQuestion = "Ik werk in een ziekenhuis. De politie wilt camerabeelden vorderen van mij. Mag dat? Het is een ziekenhuis tenslotte."
  
  console.log('🏥 Testing Hospital Question Context Analysis')
  const result = performContextAnalysis(hospitalQuestion)
  
  return NextResponse.json({
    testQuestion: hospitalQuestion,
    contexts: result.contexts,
    analysis: {
      specialRulesCount: result.analysis.specialRules.length,
      legalPrinciplesCount: result.analysis.legalPrinciples.length,
      requiredConsiderationsCount: result.analysis.requiredConsiderations.length,
      specialRules: result.analysis.specialRules.map(rule => ({
        rule: rule.rule,
        articles: rule.articles,
        priority: rule.priority
      })),
      legalPrinciples: result.analysis.legalPrinciples,
      requiredConsiderations: result.analysis.requiredConsiderations
    },
    enhancedPromptActivated: result.contexts.length > 0
  })
} 