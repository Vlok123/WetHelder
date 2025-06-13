#!/usr/bin/env node

/**
 * Eenvoudige test voor Excel bestand lezen
 */

const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')

async function testExcelFile() {
  console.log('🧪 Testing Excel file reading...')
  
  const excelPath = path.join(__dirname, '..', 'data', 'officiele_bronnen.xlsx')
  
  if (!fs.existsSync(excelPath)) {
    console.error(`❌ Excel bestand niet gevonden: ${excelPath}`)
    return
  }
  
  console.log(`📊 Reading Excel file: ${excelPath}`)
  
  try {
    // Lees het Excel bestand
    const workbook = XLSX.readFile(excelPath)
    console.log(`📋 Sheets found: ${workbook.SheetNames.join(', ')}`)
    
    // Lees de eerste sheet
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Converteer naar JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    console.log(`📊 Total rows: ${rawData.length}`)
    
    if (rawData.length > 0) {
      console.log(`📋 Headers: ${rawData[0].join(', ')}`)
    }
    
    if (rawData.length > 1) {
      console.log(`📄 Sample data (first 3 rows):`)
      rawData.slice(1, 4).forEach((row, index) => {
        console.log(`   Row ${index + 2}: ${row.slice(0, 3).join(' | ')}`)
      })
    }
    
    console.log('✅ Excel file test completed successfully')
    
  } catch (error) {
    console.error('❌ Error reading Excel file:', error)
  }
}

testExcelFile() 