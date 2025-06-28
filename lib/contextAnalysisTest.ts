/**
 * 🧪 Context Analysis Test Suite
 * Demonstrates the multi-step reasoning capabilities
 */

import { performContextAnalysis } from './contextAnalysis'

export function testContextAnalysis() {
  console.log('🧪 Testing WetHelder Context Analysis Engine\n')

  const testCases = [
    {
      name: "Ziekenhuis Camerabeelden",
      question: "Ik werk in een ziekenhuis. De politie wilt camerabeelden vorderen van mij. Mag dat? Het is een ziekenhuis tenslotte.",
      expectedContexts: ["HEALTHCARE"]
    },
    {
      name: "Advocatenkantoor Huiszoeking", 
      question: "De politie wil mijn advocatenkantoor doorzoeken en cliëntdossiers inzien. Wat zijn mijn rechten?",
      expectedContexts: ["LEGAL_PROFESSION"]
    },
    {
      name: "School Cameratoezicht",
      question: "Mogen we als school camerabeelden van leerlingen aan de politie geven?",
      expectedContexts: ["EDUCATION"]
    },
    {
      name: "Bank Transactiegegevens",
      question: "De politie vraagt onze bank om transactiegegevens van een klant. Moeten we die verstrekken?",
      expectedContexts: ["FINANCIAL"]
    },
    {
      name: "Algemene Vraag (geen speciale context)",
      question: "Wat is het verschil tussen eigendom en erfpacht?",
      expectedContexts: []
    }
  ]

  testCases.forEach((testCase, index) => {
    console.log(`\n Test ${index + 1}: ${testCase.name}`)
    console.log(`❓ Vraag: "${testCase.question}"`)
    
    const result = performContextAnalysis(testCase.question)
    
    console.log(`🎯 Gedetecteerde contexten: [${result.contexts.join(', ')}]`)
    console.log(` Verwachte contexten: [${testCase.expectedContexts.join(', ')}]`)
    
    const isCorrect = JSON.stringify(result.contexts.sort()) === JSON.stringify(testCase.expectedContexts.sort())
    console.log(` Correct: ${isCorrect ? 'JA' : 'NEE'}`)
    
    if (result.contexts.length > 0) {
      console.log(` Speciale regels: ${result.analysis.specialRules.length}`)
      console.log(` Juridische principes: ${result.analysis.legalPrinciples.length}`)
      console.log(` Verplichte overwegingen: ${result.analysis.requiredConsiderations.length}`)
      
      // Show high priority rules
      const highPriorityRules = result.analysis.specialRules.filter(rule => rule.priority === 'high')
      if (highPriorityRules.length > 0) {
        console.log(`🔴 Hoge prioriteit regels:`)
        highPriorityRules.forEach(rule => {
          console.log(`   • ${rule.rule} (${rule.articles.join(', ')})`)
        })
      }
    }
    
    console.log('─'.repeat(80))
  })

  console.log('\n🎉 Context Analysis Test Suite Completed!')
}

/**
 *  Detailed Analysis Demo
 */
export function demoDetailedAnalysis(question: string) {
  console.log('\n🔬 DETAILED CONTEXT ANALYSIS DEMO')
  console.log('═'.repeat(80))
  console.log(`📝 Question: "${question}"`)
  console.log('═'.repeat(80))

  const result = performContextAnalysis(question)

  console.log('\n🎯 PHASE 1: CONTEXT DETECTION')
  console.log(`Detected Sectors: ${result.contexts.length > 0 ? result.contexts.join(', ') : 'None'}`)

  if (result.contexts.length > 0) {
    console.log('\n🧠 PHASE 2: DEEP ANALYSIS')
    console.log(`Special Rules: ${result.analysis.specialRules.length}`)
    console.log(`Legal Principles: ${result.analysis.legalPrinciples.length}`)
    console.log(`Required Considerations: ${result.analysis.requiredConsiderations.length}`)

    console.log('\n SPECIAL RULES:')
    result.analysis.specialRules.forEach((rule, index) => {
      const priority = rule.priority === 'high' ? '🔴' : rule.priority === 'medium' ? '🟡' : '🟢'
      console.log(`${index + 1}. ${priority} ${rule.rule}`)
      console.log(`   Articles: ${rule.articles.join(', ')}`)
      console.log(`   Description: ${rule.description}`)
    })

    console.log('\n LEGAL PRINCIPLES:')
    result.analysis.legalPrinciples.forEach((principle, index) => {
      console.log(`${index + 1}. ${principle}`)
    })

    console.log('\n REQUIRED CONSIDERATIONS:')
    result.analysis.requiredConsiderations.forEach((consideration, index) => {
      console.log(`${index + 1}. ${consideration}`)
    })

    console.log('\n PHASE 3: ENHANCED PROMPT PREVIEW')
    const sampleBasePrompt = "Je bent een Nederlandse juridische expert."
    const enhancedPrompt = result.enhancedPrompt(sampleBasePrompt)
    
    // Show first 500 characters of enhanced prompt
    const preview = enhancedPrompt.substring(0, 500) + '...'
    console.log('Enhanced Prompt Preview:')
    console.log(preview)
  } else {
    console.log('\n No specialized context detected - standard processing will be used')
  }

  console.log('\n═'.repeat(80))
  console.log('🎉 DETAILED ANALYSIS COMPLETE')
}

// Example usage for the hospital camera question
export function demoHospitalQuestion() {
  const question = "Ik werk in een ziekenhuis. De politie wilt camerabeelden vorderen van mij. Mag dat? Het is een ziekenhuis tenslotte."
  demoDetailedAnalysis(question)
} 