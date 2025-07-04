/**
 * JSON Sources Integration
 * 
 * Dit bestand beheert de integratie van officiële bronnen uit het JSON bestand.
 * Het JSON bestand wordt geplaatst in de /data directory en hier geïntegreerd.
 */

import fs from 'fs'
import path from 'path'

export interface JsonBron {
  id: string
  naam: string
  url: string
  beschrijving: string
  categorie: string
  betrouwbaarheid: 'hoog' | 'middel' | 'laag'
  trefwoorden: string[]
  type: 'wetgeving' | 'jurisprudentie' | 'cao' | 'beleid' | 'overig'
  organisatie?: string
  laatstGecontroleerd?: Date
  topic: string
  scope: string
}

// Automatisch alle JSON bestanden in de data directory laden
function getJsonSourcesPaths(): string[] {
  const dataDir = path.join(process.cwd(), 'data')
  
  try {
    const files = fs.readdirSync(dataDir)
    return files
      .filter(file => {
        // Alleen .json bestanden laden (case insensitive)
        const isJsonFile = file.toLowerCase().endsWith('.json')
        // Sla specifieke bestanden over die geen wetgeving bevatten
        const isExcluded = [
          'custom-sources-example.json',
          '.DS_Store'
        ].includes(file)
        
        return isJsonFile && !isExcluded
      })
      .map(file => path.join(dataDir, file))
      .sort() // Alfabetisch sorteren voor consistentie
  } catch (error) {
    console.warn('❌ Fout bij lezen data directory:', error)
    // Fallback naar de oorspronkelijke bestanden
    return [
      path.join(process.cwd(), 'data', 'officiele_bronnen.json'),
      path.join(process.cwd(), 'data', 'custom-sources.json')
    ]
  }
}

/**
 * Bepaalt het type op basis van de categorie
 */
function categorizeType(categorie: string): 'wetgeving' | 'jurisprudentie' | 'cao' | 'beleid' | 'overig' {
  const lowerCategorie = categorie.toLowerCase()
  
  if (lowerCategorie.includes('wetgeving')) return 'wetgeving'
  if (lowerCategorie.includes('jurisprudentie')) return 'jurisprudentie'
  if (lowerCategorie.includes('cao')) return 'cao'
  if (lowerCategorie.includes('beleid') || lowerCategorie.includes('handhaving') || lowerCategorie.includes('inspecties')) return 'beleid'
  
  return 'overig'
}

/**
 * Extraheert de artikeltekst uit een BWB artikel structuur
 */
function extractBWBArtikelTekst(artikel: any): string {
  if (!artikel.lid) return ''
  
  // BWB artikelen hebben leden met tekst
  const leden = Array.isArray(artikel.lid) ? artikel.lid : [artikel.lid]
  
  let tekst = ''
  leden.forEach((lid: any, lidIndex: number) => {
    if (lid.al) {
      // Al-element bevat de tekst (kan string of object met __text zijn)
      const alTekst = typeof lid.al === 'string' ? lid.al : lid.al.__text || ''
      if (alTekst.trim()) {
        if (lidIndex > 0) tekst += ' '
        tekst += alTekst.trim()
      }
    }
    
    // Kijk ook naar lijsten binnen leden
    if (lid.lijst?.li) {
      const lijstItems = Array.isArray(lid.lijst.li) ? lid.lijst.li : [lid.lijst.li]
      lijstItems.forEach((item: any) => {
        if (item.al) {
          const itemTekst = typeof item.al === 'string' ? item.al : item.al.__text || ''
          if (itemTekst.trim()) {
            tekst += ` ${item['li.nr'] || ''} ${itemTekst.trim()}`
          }
        }
      })
    }
  })
  
  return tekst.trim().substring(0, 300) // Limiteer tot 300 karakters voor beschrijving
}

/**
 * Extraheert organisatie uit de bron naam
 */
function extractOrganization(bronNaam: string): string | undefined {
  const lowerNaam = bronNaam.toLowerCase()
  
  if (lowerNaam.includes('politie')) return 'Politie'
  if (lowerNaam.includes('rechtspraak')) return 'Rechtspraak'
  if (lowerNaam.includes('belastingdienst')) return 'Belastingdienst'
  if (lowerNaam.includes('uwv')) return 'UWV'
  if (lowerNaam.includes('svb')) return 'SVB'
  if (lowerNaam.includes('cao')) return 'Sociale Partners'
  if (lowerNaam.includes('overheid')) return 'Overheid'
  if (lowerNaam.includes('ministerie') || lowerNaam.includes('minszw')) return 'Ministerie'
  if (lowerNaam.includes('cbs')) return 'CBS'
  if (lowerNaam.includes('kvk')) return 'KVK'
  if (lowerNaam.includes('afm')) return 'AFM'
  if (lowerNaam.includes('dnb')) return 'DNB'
  if (lowerNaam.includes('acm')) return 'ACM'
  
  return undefined
}

/**
 * Laadt de officiële bronnen uit meerdere JSON bestanden
 */
export async function loadJsonSources(): Promise<JsonBron[]> {
  try {
    console.log(' Loading JSON sources from multiple files...')
    
    let allSources: JsonBron[] = []
    
    // Haal automatisch alle JSON bestanden op
    const jsonPaths = getJsonSourcesPaths()
    
    console.log(`📂 Gevonden JSON bestanden: ${jsonPaths.map(p => path.basename(p)).join(', ')}`)
    
    // Laad elk JSON bestand
    for (const jsonPath of jsonPaths) {
      if (!fs.existsSync(jsonPath)) {
        console.warn(` JSON bestand niet gevonden: ${jsonPath}`)
        continue
      }

      try {
        console.log(` Loading: ${path.basename(jsonPath)}`)
        
        const rawData = fs.readFileSync(jsonPath, 'utf-8')
        const jsonData = JSON.parse(rawData)
        
        let sourceData: any[] = []
        
        // Automatische detectie van JSON formaat
        if (jsonData.Sheet1) {
          // Excel export formaat (officiele_bronnen.json)
          sourceData = jsonData.Sheet1
          console.log(`  📊 Excel formaat: ${sourceData.length} rijen`)
        } else if (Array.isArray(jsonData)) {
          // Array formaat (custom-sources.json)
          sourceData = jsonData.map(item => ({
            'Categorie': item.categorie || 'Overig',
            'Topic': item.naam || item.id || '',
            'Bron (naam)': item.naam || item.id || '',
            'URL': item.url || '',
            'Omschrijving': item.beschrijving || '',
            'Scope': 'NL'
          }))
          console.log(`  📋 Array formaat: ${sourceData.length} items`)
        } else if (jsonData.artikelen || jsonData.articles) {
          // Wetgeving JSON formaat (wetteksten met artikelen)
          const artikelen = jsonData.artikelen || jsonData.articles || []
          const wetNaam = jsonData.naam || jsonData.title || jsonData.wet || path.basename(jsonPath, '.json')
          
          sourceData = artikelen.map((artikel: any, index: number) => ({
            'Categorie': 'Wetgeving – nationaal',
            'Topic': wetNaam,
            'Bron (naam)': `${wetNaam} - ${artikel.nummer || artikel.articleNumber || `Artikel ${index + 1}`}`,
            'URL': artikel.url || jsonData.url || `https://wetten.overheid.nl`,
            'Omschrijving': artikel.tekst || artikel.text || artikel.inhoud || artikel.content || '',
            'Scope': 'NL'
          }))
          console.log(`  📜 Wetgeving formaat: ${artikelen.length} artikelen van ${wetNaam}`)
        } else if (jsonData.hoofdstukken || jsonData.chapters) {
          // Gestructureerde wetgeving met hoofdstukken
          const hoofdstukken = jsonData.hoofdstukken || jsonData.chapters || []
          const wetNaam = jsonData.naam || jsonData.title || path.basename(jsonPath, '.json')
          
          sourceData = []
          hoofdstukken.forEach((hoofdstuk: any) => {
            const artikelen = hoofdstuk.artikelen || hoofdstuk.articles || []
            artikelen.forEach((artikel: any) => {
              sourceData.push({
                'Categorie': 'Wetgeving – nationaal',
                'Topic': wetNaam,
                'Bron (naam)': `${wetNaam} - ${artikel.nummer || artikel.articleNumber || 'Artikel'}`,
                'URL': artikel.url || jsonData.url || `https://wetten.overheid.nl`,
                'Omschrijving': artikel.tekst || artikel.text || artikel.inhoud || '',
                'Scope': 'NL'
              })
            })
          })
          console.log(`  📚 Hoofdstukken formaat: ${sourceData.length} artikelen van ${wetNaam}`)
        } else if (jsonData.toestand?.wetgeving?.['wet-besluit']?.wettekst?.hoofdstuk) {
          // BWB (Basis Wetten Bestand) formaat van wetten.overheid.nl
          const hoofdstukken = jsonData.toestand.wetgeving['wet-besluit'].wettekst.hoofdstuk || []
          const wetNaam = jsonData.toestand?.wetgeving?.citeertitel?.__text || 
                          jsonData.toestand?.wetgeving?.intitule?.__text || 
                          path.basename(jsonPath, '.json')
          
          sourceData = []
          
          // Loop door hoofdstukken (kan array of enkel object zijn)
          const hoofdstukkenArray = Array.isArray(hoofdstukken) ? hoofdstukken : [hoofdstukken]
          
          hoofdstukkenArray.forEach((hoofdstuk: any, hIndex: number) => {
            const hoofdstukTitel = hoofdstuk.kop?.titel?.__text || `Hoofdstuk ${hIndex + 1}`
            const hoofdstukNr = hoofdstuk.kop?.nr?.__text || (hIndex + 1)
            
            // Function to process artikelen from any level
            const processArtikelen = (artikelen: any[], context: string = '') => {
              const artikelenArray = Array.isArray(artikelen) ? artikelen : [artikelen]
              
              artikelenArray.forEach((artikel: any) => {
                if (!artikel.kop?.nr?.__text) return
                
                const artikelNr = artikel.kop.nr.__text
                const artikelTekst = extractBWBArtikelTekst(artikel)
                
                sourceData.push({
                  'Categorie': 'Wetgeving – nationaal',
                  'Topic': wetNaam,
                  'Bron (naam)': `${wetNaam} - Artikel ${artikelNr}`,
                  'URL': `https://wetten.overheid.nl/BWBR0031788/2024-08-01#Hoofdstuk${hoofdstukNr}_Artikel${artikelNr}`,
                  'Omschrijving': `Hoofdstuk ${hoofdstukNr} (${hoofdstukTitel})${context} - Artikel ${artikelNr}: ${artikelTekst}`,
                  'Scope': 'NL'
                })
              })
            }
            
            // Check for direct articles under hoofdstuk
            if (hoofdstuk.artikel) {
              processArtikelen(hoofdstuk.artikel)
            }
            
            // Check for articles in paragrafen
            if (hoofdstuk.paragraaf) {
              const paragrafen = Array.isArray(hoofdstuk.paragraaf) ? hoofdstuk.paragraaf : [hoofdstuk.paragraaf]
              paragrafen.forEach((paragraaf: any, pIndex: number) => {
                const paragraafTitel = paragraaf.kop?.titel?.__text || `Paragraaf ${pIndex + 1}`
                const paragraafNr = paragraaf.kop?.nr?.__text || `${hIndex + 1}.${pIndex + 1}`
                
                if (paragraaf.artikel) {
                  processArtikelen(paragraaf.artikel, ` → ${paragraafTitel}`)
                }
              })
            }
            
            // Check for articles in afdelingen
            if (hoofdstuk.afdeling) {
              const afdelingen = Array.isArray(hoofdstuk.afdeling) ? hoofdstuk.afdeling : [hoofdstuk.afdeling]
              afdelingen.forEach((afdeling: any, aIndex: number) => {
                const afdelingTitel = afdeling.kop?.titel?.__text || `Afdeling ${aIndex + 1}`
                
                if (afdeling.artikel) {
                  processArtikelen(afdeling.artikel, ` → ${afdelingTitel}`)
                }
                
                // Check for articles in paragrafen within afdelingen
                if (afdeling.paragraaf) {
                  const paragrafen = Array.isArray(afdeling.paragraaf) ? afdeling.paragraaf : [afdeling.paragraaf]
                  paragrafen.forEach((paragraaf: any, pIndex: number) => {
                    const paragraafTitel = paragraaf.kop?.titel?.__text || `Paragraaf ${pIndex + 1}`
                    
                    if (paragraaf.artikel) {
                      processArtikelen(paragraaf.artikel, ` → ${afdelingTitel} → ${paragraafTitel}`)
                    }
                  })
                }
              })
            }
          })
          console.log(`  🏛️ BWB formaat: ${sourceData.length} artikelen van ${wetNaam}`)
        } else if (jsonData.toestand?.wetgeving?.['wet-besluit']?.wettekst?.artikel) {
          // BWB formaat zonder hoofdstukken - artikelen direct onder wettekst (zoals Opiumwet)
          const artikelen = jsonData.toestand.wetgeving['wet-besluit'].wettekst.artikel || []
          const wetNaam = jsonData.toestand?.wetgeving?.citeertitel?.__text || 
                          jsonData.toestand?.wetgeving?.intitule?.__text || 
                          path.basename(jsonPath, '.json')
          
          sourceData = []
          
          // Loop door artikelen (kan array of enkel object zijn)
          const artikelenArray = Array.isArray(artikelen) ? artikelen : [artikelen]
          
          artikelenArray.forEach((artikel: any) => {
            if (!artikel.kop?.nr?.__text) return
            
            const artikelNr = artikel.kop.nr.__text
            const artikelTekst = extractBWBArtikelTekst(artikel)
            
            sourceData.push({
              'Categorie': 'Wetgeving – nationaal',
              'Topic': wetNaam,
              'Bron (naam)': `${wetNaam} - Artikel ${artikelNr}`,
              'URL': `https://wetten.overheid.nl/`,
              'Omschrijving': `Artikel ${artikelNr}: ${artikelTekst}`,
              'Scope': 'NL'
            })
          })
          console.log(`  🏛️ BWB formaat (direct): ${sourceData.length} artikelen van ${wetNaam}`)
        } else if (jsonData.toestand?.wetgeving?.['wet-besluit']?.wettekst?.titeldeel) {
          // BWB formaat met titeldelen (zoals WED)
          const titeldelen = jsonData.toestand.wetgeving['wet-besluit'].wettekst.titeldeel || []
          const wetNaam = jsonData.toestand?.wetgeving?.citeertitel?.__text || 
                          jsonData.toestand?.wetgeving?.intitule?.__text || 
                          path.basename(jsonPath, '.json')
          
          sourceData = []
          const titeldelenArray = Array.isArray(titeldelen) ? titeldelen : [titeldelen]
          
          titeldelenArray.forEach((titeldeel: any, tIndex: number) => {
            const titeldeelTitel = titeldeel.kop?.titel?.__text || `Titeldeel ${tIndex + 1}`
            const titeldeelNr = titeldeel.kop?.nr?.__text || (tIndex + 1)
            
            // Check titeldeel voor artikelen en hoofdstukken
            if (titeldeel.artikel) {
              const artikelenArray = Array.isArray(titeldeel.artikel) ? titeldeel.artikel : [titeldeel.artikel]
              artikelenArray.forEach((artikel: any) => {
                if (!artikel.kop?.nr?.__text) return
                const artikelNr = artikel.kop.nr.__text
                const artikelTekst = extractBWBArtikelTekst(artikel)
                
                sourceData.push({
                  'Categorie': 'Wetgeving – nationaal',
                  'Topic': wetNaam,
                  'Bron (naam)': `${wetNaam} - Artikel ${artikelNr}`,
                  'URL': `https://wetten.overheid.nl/`,
                  'Omschrijving': `${titeldeelTitel} - Artikel ${artikelNr}: ${artikelTekst}`,
                  'Scope': 'NL'
                })
              })
            }
            
            // Check voor hoofdstukken binnen titeldeel
            if (titeldeel.hoofdstuk) {
              const hoofdstukkenArray = Array.isArray(titeldeel.hoofdstuk) ? titeldeel.hoofdstuk : [titeldeel.hoofdstuk]
              hoofdstukkenArray.forEach((hoofdstuk: any) => {
                if (hoofdstuk.artikel) {
                  const artikelenArray = Array.isArray(hoofdstuk.artikel) ? hoofdstuk.artikel : [hoofdstuk.artikel]
                  artikelenArray.forEach((artikel: any) => {
                    if (!artikel.kop?.nr?.__text) return
                    const artikelNr = artikel.kop.nr.__text
                    const artikelTekst = extractBWBArtikelTekst(artikel)
                    
                    sourceData.push({
                      'Categorie': 'Wetgeving – nationaal',
                      'Topic': wetNaam,
                      'Bron (naam)': `${wetNaam} - Artikel ${artikelNr}`,
                      'URL': `https://wetten.overheid.nl/`,
                      'Omschrijving': `${titeldeelTitel} - Artikel ${artikelNr}: ${artikelTekst}`,
                      'Scope': 'NL'
                    })
                  })
                }
              })
            }
          })
          console.log(`  🏛️ BWB formaat (titeldeel): ${sourceData.length} artikelen van ${wetNaam}`)
        } else if (jsonData.toestand?.wetgeving?.['wet-besluit']?.wettekst?.boek) {
          // BWB formaat met boeken (zoals Wetboek van Strafrecht)
          const boeken = jsonData.toestand.wetgeving['wet-besluit'].wettekst.boek || []
          const wetNaam = jsonData.toestand?.wetgeving?.citeertitel?.__text || 
                          jsonData.toestand?.wetgeving?.intitule?.__text || 
                          path.basename(jsonPath, '.json')
          
          sourceData = []
          const boekenArray = Array.isArray(boeken) ? boeken : [boeken]
          
          boekenArray.forEach((boek: any, bIndex: number) => {
            const boekTitel = boek.kop?.titel?.__text || `Boek ${bIndex + 1}`
            
            // Check boek voor titeldelen/hoofdstukken/artikelen  
            if (boek.titeldeel) {
              const titeldelenArray = Array.isArray(boek.titeldeel) ? boek.titeldeel : [boek.titeldeel]
              titeldelenArray.forEach((titeldeel: any) => {
                const titeldeelTitel = titeldeel.kop?.titel?.__text || 'Titeldeel'
                
                // Check titeldeel direct voor artikelen (meest voorkomend in Wetboek van Strafrecht)
                if (titeldeel.artikel) {
                  const artikelenArray = Array.isArray(titeldeel.artikel) ? titeldeel.artikel : [titeldeel.artikel]
                  artikelenArray.forEach((artikel: any) => {
                    if (!artikel.kop?.nr?.__text) return
                    const artikelNr = artikel.kop.nr.__text
                    const artikelTekst = extractBWBArtikelTekst(artikel)
                    
                    sourceData.push({
                      'Categorie': 'Wetgeving – nationaal',
                      'Topic': wetNaam,
                      'Bron (naam)': `${wetNaam} - Artikel ${artikelNr}`,
                      'URL': `https://wetten.overheid.nl/`,
                      'Omschrijving': `${boekTitel} - ${titeldeelTitel} - Artikel ${artikelNr}: ${artikelTekst}`,
                      'Scope': 'NL'
                    })
                  })
                }
                
                // Check titeldeel voor hoofdstukken (backup)
                if (titeldeel.hoofdstuk) {
                  const hoofdstukkenArray = Array.isArray(titeldeel.hoofdstuk) ? titeldeel.hoofdstuk : [titeldeel.hoofdstuk]
                  hoofdstukkenArray.forEach((hoofdstuk: any) => {
                    if (hoofdstuk.artikel) {
                      const artikelenArray = Array.isArray(hoofdstuk.artikel) ? hoofdstuk.artikel : [hoofdstuk.artikel]
                      artikelenArray.forEach((artikel: any) => {
                        if (!artikel.kop?.nr?.__text) return
                        const artikelNr = artikel.kop.nr.__text
                        const artikelTekst = extractBWBArtikelTekst(artikel)
                        
                        sourceData.push({
                          'Categorie': 'Wetgeving – nationaal',
                          'Topic': wetNaam,
                          'Bron (naam)': `${wetNaam} - Artikel ${artikelNr}`,
                          'URL': `https://wetten.overheid.nl/`,
                          'Omschrijving': `${boekTitel} - ${titeldeelTitel} - Artikel ${artikelNr}: ${artikelTekst}`,
                          'Scope': 'NL'
                        })
                      })
                    }
                  })
                }
              })
            }
          })
          console.log(`  🏛️ BWB formaat (boek): ${sourceData.length} artikelen van ${wetNaam}`)
        } else if (jsonData.toestand?.wetgeving?.['wet-besluit']?.wettekst?.paragraaf) {
          // BWB formaat met alleen paragrafen (zoals AWBI)
          const paragrafen = jsonData.toestand.wetgeving['wet-besluit'].wettekst.paragraaf || []
          const wetNaam = jsonData.toestand?.wetgeving?.citeertitel?.__text || 
                          jsonData.toestand?.wetgeving?.intitule?.__text || 
                          path.basename(jsonPath, '.json')
          
          sourceData = []
          const paragraafArray = Array.isArray(paragrafen) ? paragrafen : [paragrafen]
          
          paragraafArray.forEach((paragraaf: any, pIndex: number) => {
            const paragraafTitel = paragraaf.kop?.titel?.__text || `Paragraaf ${pIndex + 1}`
            
            if (paragraaf.artikel) {
              const artikelenArray = Array.isArray(paragraaf.artikel) ? paragraaf.artikel : [paragraaf.artikel]
              artikelenArray.forEach((artikel: any) => {
                if (!artikel.kop?.nr?.__text) return
                const artikelNr = artikel.kop.nr.__text
                const artikelTekst = extractBWBArtikelTekst(artikel)
                
                sourceData.push({
                  'Categorie': 'Wetgeving – nationaal',
                  'Topic': wetNaam,
                  'Bron (naam)': `${wetNaam} - Artikel ${artikelNr}`,
                  'URL': `https://wetten.overheid.nl/`,
                  'Omschrijving': `${paragraafTitel} - Artikel ${artikelNr}: ${artikelTekst}`,
                  'Scope': 'NL'
                })
              })
            }
          })
          console.log(`  🏛️ BWB formaat (paragraaf): ${sourceData.length} artikelen van ${wetNaam}`)
        } else {
          // Generiek object formaat - probeer te mappen
          const wetNaam = jsonData.naam || jsonData.title || jsonData.wet || path.basename(jsonPath, '.json')
          console.log(`  🔍 Onbekend formaat, probeer generieke mapping voor: ${wetNaam}`)
          
          // Zoek naar mogelijke artikelen in het object
          const mogelijkeArtikelen = Object.values(jsonData).find(val => Array.isArray(val)) as any[]
          
          if (mogelijkeArtikelen && mogelijkeArtikelen.length > 0) {
            sourceData = mogelijkeArtikelen.map((item: any, index: number) => ({
              'Categorie': 'Wetgeving – nationaal', 
              'Topic': wetNaam,
              'Bron (naam)': `${wetNaam} - Item ${index + 1}`,
              'URL': `https://wetten.overheid.nl`,
              'Omschrijving': typeof item === 'string' ? item : JSON.stringify(item).substring(0, 200),
              'Scope': 'NL'
            }))
            console.log(`  ✅ Generieke mapping: ${sourceData.length} items`)
          } else {
            console.warn(`  ⚠️  Kan geen bruikbare data vinden in ${path.basename(jsonPath)}`)
          }
        }
        
        if (sourceData.length === 0) {
          console.warn(` JSON bestand ${path.basename(jsonPath)} bevat geen data`)
          continue
        }
        
        console.log(` ${sourceData.length} rijen gevonden in ${path.basename(jsonPath)}`)
        
        // Map de data naar onze interface
        const sources: JsonBron[] = sourceData
          .filter((row: any) => row && (row['Bron (naam)'] || row.naam)) // Filter lege rijen
          .map((row: any, index: number) => {
            try {
              const source: JsonBron = {
                id: `${path.basename(jsonPath, '.json')}-${index + 1}`,
                naam: String(row['Bron (naam)'] || row.naam || '').trim(),
                url: String(row['URL'] || row.url || '').trim(),
                beschrijving: String(row['Omschrijving'] || row.beschrijving || '').trim(),
                categorie: String(row['Categorie'] || row.categorie || 'Overig').trim(),
                betrouwbaarheid: 'hoog', // Alle JSON bronnen zijn hoog betrouwbaar
                trefwoorden: [
                  String(row['Topic'] || row.topic || row.naam || '').trim(),
                  String(row['Scope'] || row.scope || '').trim(),
                  String(row['Categorie'] || row.categorie || '').trim(),
                  ...(row.trefwoorden || [])
                ].filter(k => k),
                type: categorizeType(String(row['Categorie'] || row.categorie || '').trim()),
                organisatie: extractOrganization(String(row['Bron (naam)'] || row.naam || '').trim()),
                laatstGecontroleerd: new Date(),
                topic: String(row['Topic'] || row.topic || row.naam || '').trim(),
                scope: String(row['Scope'] || row.scope || '').trim()
              }
              
              return source
            } catch (error) {
              console.warn(` Fout bij verwerken rij ${index + 1} in ${path.basename(jsonPath)}:`, error)
              return null
            }
          })
          .filter((source: JsonBron | null): source is JsonBron => source !== null)
        
        allSources = [...allSources, ...sources]
        console.log(` ${sources.length} bronnen geladen uit ${path.basename(jsonPath)}`)
        
      } catch (fileError) {
        console.warn(` Fout bij laden ${path.basename(jsonPath)}:`, fileError)
      }
    }
    
    console.log(` ${allSources.length} bronnen geladen uit JSON bestanden`)
    
    // Log categorieën
    const categories = [...new Set(allSources.map(s => s.categorie))]
    console.log(`Categorieën: ${categories.join(', ')}`)
    
    return allSources
    
  } catch (error) {
    console.error(' Fout bij laden JSON bronnen:', error)
    return []
  }
}

/**
 * Zoekt in de JSON bronnen op basis van query
 */
export async function searchJsonSources(query: string, limit: number = 10): Promise<JsonBron[]> {
  const sources = await loadJsonSources()
  
  if (!query.trim()) {
    return sources.slice(0, limit)
  }
  
  // Belangrijke juridische afkortingen die niet gefilterd moeten worden
  const importantLegalTerms = [
    'apv', 'bw', 'sr', 'sv', 'wvsr', 'wvw', 'awb', 'atw', 'cao', 'eu', 'gdpr', 'avg',
    'ilo', 'kvk', 'afm', 'dnb', 'acm', 'cbp', 'ap', 'rvs', 'rvd', 'ovj', 'om', 'rv'
  ]
  
  // Enhanced vehicle-related terms for RV (Reglement Voertuigen) recognition
  const vehicleTerms = [
    'voertuig', 'auto', 'personenauto', 'motor', 'fiets', 'voorruit', 'zijruit',
    'beschadiging', 'verkleuring', 'constructie', 'carrosserie', 'verlichting',
    'reglement voertuigen', 'voertuigreglement', 'technische eisen'
  ]
  
  // Filter zoektermen: behoud termen > 2 karakters OF belangrijke juridische termen OF voertuig termen
  const searchTerms = query.toLowerCase().split(' ').filter(term => 
    term.length > 2 || 
    importantLegalTerms.includes(term.toLowerCase()) ||
    vehicleTerms.some(vTerm => vTerm.includes(term) || term.includes(vTerm))
  )
  
  // Special handling for RV article patterns like "5.2.42"
  const rvArticleMatch = query.match(/(\d+\.\d+\.\d+)/);
  if (rvArticleMatch) {
    searchTerms.push(rvArticleMatch[1]); // Add the article number
    searchTerms.push('rv', 'reglement', 'voertuigen'); // Add RV-related terms
    console.log(`Detected RV article pattern: ${rvArticleMatch[1]}`);
  }
  
  const scoredSources = sources.map(source => {
    let score = 0
    const searchableText = [
      source.naam,
      source.beschrijving,
      source.categorie,
      source.topic,
      source.organisatie || '',
      ...source.trefwoorden
    ].join(' ').toLowerCase()
    
    // Score op basis van matches
    searchTerms.forEach(term => {
      const lowerTerm = term.toLowerCase()
      
      // Exacte matches krijgen hogere score
      if (source.naam.toLowerCase().includes(lowerTerm)) score += 10
      if (source.topic.toLowerCase().includes(lowerTerm)) score += 8
      if (source.trefwoorden.some(keyword => keyword.toLowerCase().includes(lowerTerm))) score += 8
      if (source.beschrijving.toLowerCase().includes(lowerTerm)) score += 5
      if (source.categorie.toLowerCase().includes(lowerTerm)) score += 3
      if (searchableText.includes(lowerTerm)) score += 1
      
      // Extra score voor belangrijke juridische termen
      if (importantLegalTerms.includes(lowerTerm)) {
        if (source.topic.toLowerCase().includes(lowerTerm)) score += 15
        if (source.naam.toLowerCase().includes(lowerTerm)) score += 12
      }
    })
    
    return { source, score }
  })
  
  return scoredSources
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.source)
}

/**
 * Haalt bronnen op per categorie
 */
export async function getJsonSourcesByCategory(categorie: string): Promise<JsonBron[]> {
  const sources = await loadJsonSources()
  return sources.filter(source => 
    source.categorie.toLowerCase().includes(categorie.toLowerCase())
  )
}

/**
 * Haalt bronnen op per type
 */
export async function getJsonSourcesByType(type: string): Promise<JsonBron[]> {
  const sources = await loadJsonSources()
  return sources.filter(source => 
    source.type.toLowerCase() === type.toLowerCase()
  )
}

/**
 * Formatteert JSON bronnen voor gebruik in de zoekcontext
 */
export function formatJsonSourcesForContext(sources: JsonBron[]): string {
  if (sources.length === 0) {
    return 'Geen specifieke JSON bronnen gevonden.'
  }
  
  return sources.map(source => {
    return `**${source.naam}** (${source.categorie})
Topic: ${source.topic}
Beschrijving: ${source.beschrijving}
URL: ${source.url}
Type: ${source.type}
${source.organisatie ? `Organisatie: ${source.organisatie}` : ''}
Betrouwbaarheid: ${source.betrouwbaarheid}
Scope: ${source.scope}
Trefwoorden: ${source.trefwoorden.join(', ')}
---`
  }).join('\n\n')
}

/**
 * Krijgt alle beschikbare categorieën
 */
export async function getAvailableCategories(): Promise<string[]> {
  const sources = await loadJsonSources()
  return [...new Set(sources.map(s => s.categorie))].sort()
}

/**
 * Krijgt alle beschikbare types
 */
export async function getAvailableTypes(): Promise<string[]> {
  const sources = await loadJsonSources()
  return [...new Set(sources.map(s => s.type))].sort()
}

/**
 * Test functie om de JSON integratie te testen
 */
export async function testJsonIntegration(): Promise<void> {
  console.log('Testing JSON integration...')
  
  const sources = await loadJsonSources()
  console.log(` Totaal bronnen: ${sources.length}`)
  
  const categories = await getAvailableCategories()
  console.log(`Categorieën: ${categories.join(', ')}`)
  
  const types = await getAvailableTypes()
  console.log(` Types: ${types.join(', ')}`)
  
  // Test zoeken
  const searchResults = await searchJsonSources('politie', 5)
  console.log(` Zoekresultaten voor 'politie': ${searchResults.length}`)
  
  if (searchResults.length > 0) {
    console.log(' Eerste resultaat:')
    console.log(`   Naam: ${searchResults[0].naam}`)
    console.log(`   URL: ${searchResults[0].url}`)
    console.log(`   Categorie: ${searchResults[0].categorie}`)
    console.log(`   Topic: ${searchResults[0].topic}`)
  }
  
  console.log(' JSON integration test completed')
}

/**
 * Test functie om te controleren of alle JSON bestanden correct worden geladen
 */
export async function testJsonSourcesLoading(): Promise<void> {
  console.log('🧪 Testing JSON sources loading...')
  
  try {
    // Test automatische file discovery
    const jsonPaths = getJsonSourcesPaths()
    console.log(`📂 Automatisch gevonden bestanden: ${jsonPaths.length}`)
    jsonPaths.forEach(p => console.log(`   - ${path.basename(p)}`))
    
    // Test het laden van alle bronnen
    const sources = await loadJsonSources()
    console.log(`📊 Totaal geladen bronnen: ${sources.length}`)
    
    // Groepeer per categorie
    const categorieën = sources.reduce((acc, source) => {
      acc[source.categorie] = (acc[source.categorie] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('📂 Bronnen per categorie:')
    Object.entries(categorieën).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`)
    })
    
    console.log('✅ JSON sources loading test completed')
  } catch (error) {
    console.error('💥 JSON sources test failed:', error)
  }
}

/**
 * PRIORITAIRE ZOEKFUNCTIE - Checkt eerst JSON sources voor specifieke wetten
 * 
 * Deze functie kijkt eerst of er een specifieke wet als JSON bestand beschikbaar is
 * voordat er naar externe bronnen wordt gezocht.
 */
export async function searchPriorityJsonSources(query: string): Promise<{
  foundInJson: boolean,
  sources: JsonBron[],
  recommendation: 'use_json' | 'use_google' | 'use_both'
}> {
  console.log(`🔍 Prioritaire JSON search voor: "${query}"`)
  
  try {
    const allSources = await loadJsonSources()
    
    // Detecteer specifieke wetten uit de query
    const wetPatterns = [
      { pattern: /politiewet|artikel\s*(\d+)\s*politiewet|politie wet/i, wet: 'politiewet' },
      { pattern: /reglement\s*voertuigen|artikel\s*(\d+\.?\d*\.?\d*)\s*rv\b|rv\s*artikel|\brvv\b/i, wet: 'reglement voertuigen' },
      { pattern: /strafrecht|artikel\s*(\d+)\s*sr\b|sr\s*artikel|\bsr\b/i, wet: 'strafrecht' },
      { pattern: /burgerlijk\s*wetboek|artikel\s*(\d+)\s*bw\b|bw\s*artikel|\bbw\b/i, wet: 'burgerlijk wetboek' },
      { pattern: /apv|plaatselijke\s*verordening|gemeenteverordening/i, wet: 'apv' },
      { pattern: /strafvordering|artikel\s*(\d+)\s*sv\b|sv\s*artikel|\bsv\b/i, wet: 'strafvordering' },
      { pattern: /opiumwet|artikel\s*(\d+)\s*opiumwet/i, wet: 'opiumwet' },
      { pattern: /wegenwet|wegenverkeerswet|artikel\s*(\d+)\s*wvw\b|wvw\s*artikel/i, wet: 'wegenverkeerswet' }
    ]
    
    let detectedWet = null
    let artikelNummer = null
    
    for (const wetPattern of wetPatterns) {
      const match = query.match(wetPattern.pattern)
      if (match) {
        detectedWet = wetPattern.wet
        artikelNummer = match[1] // Eventueel artikelnummer
        break
      }
    }
    
    if (detectedWet) {
      console.log(`🎯 Gedetecteerde wet: ${detectedWet}${artikelNummer ? ` artikel ${artikelNummer}` : ''}`)
      
      // Zoek in JSON sources naar deze specifieke wet
      const relevantSources = allSources.filter(source => {
        const sourceText = [
          source.naam,
          source.topic,
          source.beschrijving,
          source.categorie,
          ...source.trefwoorden
        ].join(' ').toLowerCase()
        
        const wetTerms = detectedWet.toLowerCase().split(' ')
        return wetTerms.some(term => sourceText.includes(term))
      })
      
      // Als er een artikelnummer is, filter verder
      if (artikelNummer && relevantSources.length > 0) {
        const artikelSources = relevantSources.filter(source => {
          const sourceText = [source.naam, source.beschrijving].join(' ').toLowerCase()
          return sourceText.includes(artikelNummer) || sourceText.includes(`artikel ${artikelNummer}`)
        })
        
        if (artikelSources.length > 0) {
          console.log(`✅ Gevonden ${artikelSources.length} JSON bronnen voor ${detectedWet} artikel ${artikelNummer}`)
          return {
            foundInJson: true,
            sources: artikelSources,
            recommendation: 'use_json'
          }
        }
      }
      
      if (relevantSources.length > 0) {
        console.log(`✅ Gevonden ${relevantSources.length} JSON bronnen voor ${detectedWet}`)
        return {
          foundInJson: true,
          sources: relevantSources.slice(0, 5), // Max 5 meest relevante
          recommendation: 'use_both' // Gebruik JSON + Google voor volledigheid
        }
      }
    }
    
    // Geen specifieke wet gedetecteerd of geen JSON bronnen gevonden
    console.log(`ℹ️  Geen specifieke JSON bronnen gevonden voor: "${query}"`)
    
    // Doe alsnog een algemene zoektocht
    const generalResults = await searchJsonSources(query, 3)
    
    if (generalResults.length > 0) {
      console.log(`📋 Gevonden ${generalResults.length} algemene JSON bronnen`)
      return {
        foundInJson: true,
        sources: generalResults,
        recommendation: 'use_both'
      }
    }
    
    return {
      foundInJson: false,
      sources: [],
      recommendation: 'use_google'
    }
    
  } catch (error) {
    console.error('❌ Fout bij prioritaire JSON search:', error)
    return {
      foundInJson: false,
      sources: [],
      recommendation: 'use_google'
    }
  }
}

/**
 * Formatteert JSON bronnen specifiek voor directe juridische antwoorden
 */
export function formatJsonSourcesForDirectAnswer(sources: JsonBron[]): string {
  if (sources.length === 0) {
    return ''
  }
  
  return `
=== DIRECTE JSON BRONNEN ===
${sources.map((source, index) => {
    let formattedSource = `${index + 1}. ${source.naam}
   URL: ${source.url}
   Beschrijving: ${source.beschrijving}`
    
    if (source.beschrijving.length > 100) {
      formattedSource += `
   Volledige context: ${source.beschrijving}`
    }
    
    formattedSource += `
   Categorie: ${source.categorie}
   Type: ${source.type}
   Betrouwbaarheid: ${source.betrouwbaarheid}
   ---`
    
    return formattedSource
  }).join('\n\n')}

INSTRUCTIE: Gebruik bovenstaande JSON bronnen als primaire informatie voor je antwoord. Deze bronnen zijn direct uit officiële wetteksten geëxtraheerd en hebben voorrang boven algemene kennis.
`
} 