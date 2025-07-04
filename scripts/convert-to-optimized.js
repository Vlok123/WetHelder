const fs = require('fs');
const path = require('path');

// Function to extract artikel text from BWB format
function extractBWBArtikelTekst(artikel) {
  let tekst = '';
  
  // Check for direct 'al' element first (for articles like 447e)
  if (artikel.al) {
    if (typeof artikel.al === 'string') {
      tekst += artikel.al + ' ';
    } else if (artikel.al.__text) {
      tekst += artikel.al.__text + ' ';
    } else if (Array.isArray(artikel.al)) {
      artikel.al.forEach(al => {
        if (typeof al === 'string') {
          tekst += al + ' ';
        } else if (al.__text) {
          tekst += al.__text + ' ';
        } else if (al.text) {
          // Handle RVV/traffic law structure with al[].text
          tekst += al.text + ' ';
        }
      });
    }
  }
  
  // Handle 'lijst' structure for traffic laws (RVV, etc.)
  if (artikel.lijst) {
    if (artikel.lijst.li && Array.isArray(artikel.lijst.li)) {
      artikel.lijst.li.forEach(li => {
        if (li.al && Array.isArray(li.al)) {
          li.al.forEach(al => {
            if (al.text) {
              tekst += al.text + ' ';
            } else if (al.__text) {
              tekst += al.__text + ' ';
            }
          });
        }
      });
    }
  }
  
  // Then check for 'lid' structure
  if (artikel.lid) {
    const leden = Array.isArray(artikel.lid) ? artikel.lid : [artikel.lid];
    leden.forEach((lid) => {
      if (lid.al) {
        if (typeof lid.al === 'string') {
          tekst += lid.al + ' ';
        } else if (lid.al.__text) {
          tekst += lid.al.__text + ' ';
        } else if (Array.isArray(lid.al)) {
          lid.al.forEach(al => {
            if (typeof al === 'string') {
              tekst += al + ' ';
            } else if (al.__text) {
              tekst += al.__text + ' ';
            } else if (al.text) {
              // Handle RVV/traffic law structure
              tekst += al.text + ' ';
            }
          });
        }
      }
      
      // Check for nested lists in leden
      if (lid.lijst && lid.lijst.li && Array.isArray(lid.lijst.li)) {
        lid.lijst.li.forEach(li => {
          if (li.al && Array.isArray(li.al)) {
            li.al.forEach(al => {
              if (al.text) {
                tekst += al.text + ' ';
              } else if (al.__text) {
                tekst += al.__text + ' ';
              }
            });
          }
        });
      }
    });
  }
  
  // Check for other text structures
  if (artikel.__text) {
    tekst += artikel.__text + ' ';
  }
  
  if (artikel.tekst) {
    tekst += artikel.tekst + ' ';
  }
  
  // Check for 'inhoud' structure (common in BWB)
  if (artikel.inhoud) {
    if (typeof artikel.inhoud === 'string') {
      tekst += artikel.inhoud + ' ';
    } else if (artikel.inhoud.__text) {
      tekst += artikel.inhoud.__text + ' ';
    }
  }
  
  // Advanced BWB structure extraction
  const tryExtractFromStructure = (obj, maxDepth = 3) => {
    if (maxDepth <= 0) return '';
    let result = '';
    
    if (typeof obj === 'string') return obj;
    if (obj?.__text) return obj.__text;
    
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        result += tryExtractFromStructure(item, maxDepth - 1) + ' ';
      });
    } else if (typeof obj === 'object' && obj !== null) {
      // Look for common BWB text containers
      const textKeys = ['al', 'lid', 'tekst', 'inhoud', '__text', 'content'];
      for (const key of textKeys) {
        if (obj[key]) {
          result += tryExtractFromStructure(obj[key], maxDepth - 1) + ' ';
        }
      }
    }
    
    return result;
  };
  
  // If still no text, try aggressive extraction
  if (!tekst.trim() && artikel) {
    tekst = tryExtractFromStructure(artikel, 3);
  }
  
  const finalText = tekst.trim();
  console.log(`      🔍 Artikel tekst extracted: "${finalText.substring(0, 100)}..." (${finalText.length} chars)`);
  
  // Return empty string if no meaningful text found
  return finalText.length > 10 ? finalText : '';
}

// Function to extract keywords from article text
function extractKeywords(tekst, artikelNr) {
  const keywords = [];
  
  // Add article number
  keywords.push(`artikel ${artikelNr}`);
  
  // Common legal terms
  const legalTerms = [
    'strafbaar', 'gevangenisstraf', 'geldboete', 'opzet', 'schuld',
    'overtreding', 'misdrijf', 'poging', 'medeplegen', 'uitlokken',
    'hechtenis', 'taakstraf', 'voorwaardelijk', 'recidive'
  ];
  
  legalTerms.forEach(term => {
    if (tekst.toLowerCase().includes(term)) {
      keywords.push(term);
    }
  });
  
  return keywords;
}

// Function to detect penalty information
function extractStrafmaat(tekst) {
  const strafmaat = {};
  
  // Extract prison sentences
  const gevangenisMatch = tekst.match(/gevangenisstraf.*?(\d+)\s*jaren?/i);
  if (gevangenisMatch) {
    strafmaat.gevangenisstraf = `maximaal ${gevangenisMatch[1]} jaar`;
  }
  
  if (tekst.includes('levenslange gevangenisstraf')) {
    strafmaat.gevangenisstraf = 'levenslang of ' + (strafmaat.gevangenisstraf || '');
  }
  
  // Extract fines
  const boeteMatch = tekst.match(/geldboete.*?(eerste|tweede|derde|vierde|vijfde|zesde)\s*categorie/i);
  if (boeteMatch) {
    strafmaat.geldboete = `categorie ${boeteMatch[1]}`;
  }
  
  return Object.keys(strafmaat).length > 0 ? strafmaat : null;
}

// Convert BWB to optimized format
async function convertBWBToOptimized(inputPath, outputPath) {
  console.log(`\n🔄 Converting ${path.basename(inputPath)}...`);
  
  try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const jsonData = JSON.parse(rawData);
    
    // Extract metadata
    const wetNaam = jsonData.toestand?.wetgeving?.citeertitel?.__text || 
                    jsonData.toestand?.wetgeving?.intitule?.__text || 
                    jsonData.wetgeving?.[0]?.citeertitel?.__text ||
                    jsonData.wetgeving?.[0]?.intitule?.[0]?.text ||
                    path.basename(inputPath, '.json');
    
    const intitule = jsonData.toestand?.wetgeving?.intitule?.__text || 
                     jsonData.wetgeving?.[0]?.intitule?.[0]?.text || '';
    const bwbId = jsonData.toestand?.wetgeving?.bwb_id || 
                  jsonData['bwb-id'] || '';
    
    const optimized = {
      wetNaam: wetNaam,
      citeertitel: wetNaam,
      intitule: intitule,
      url: bwbId ? `https://wetten.overheid.nl/${bwbId}/` : 'https://wetten.overheid.nl/',
      categorie: 'Wetgeving – nationaal',
      scope: 'NL',
      laatstGewijzigd: new Date().toISOString().split('T')[0],
      artikelen: [],
      metadata: {
        bronFormaat: 'BWB',
        verwerkingsDatum: new Date().toISOString().split('T')[0],
        optimizedVersion: '1.0'
      }
    };
    
    // Special handling for different BWB structures
    if (jsonData.wetgeving?.wet) {
      // Standard BWB format with wetgeving wrapper
      const wetData = jsonData.wetgeving.wet;
      const wetTitel = wetData.intitule?.__text || wetData.intitule || 'Onbekende wet';
      console.log(`  🏛️ BWB formaat: Processing ${wetTitel}`);
      
      // Handle main structure
      if (wetData.body) {
        console.log(`    📖 Processing body structure`);
        processBWBStructure(wetData.body, optimized.artikelen, wetTitel);
      }
      
      // Additional fallback processing
      if (wetData.artikel && Array.isArray(wetData.artikel)) {
        console.log(`    📋 Found direct artikel array with ${wetData.artikel.length} items`);
        processArtikelen(wetData.artikel, optimized.artikelen, wetTitel);
      }
      
    } else if (jsonData.wetgeving && Array.isArray(jsonData.wetgeving)) {
      // Array-based wetgeving structure (for RVV, Wegenverkeerswet, etc.)
      console.log(`  🏛️ BWB formaat (array): Processing ${jsonData.wetgeving.length} items`);
      
      jsonData.wetgeving.forEach((wetItem, index) => {
        const wetTitel = wetItem.intitule?.__text || wetItem.intitule || `Wet ${index + 1}`;
        console.log(`    📋 Processing wetgeving[${index}]: ${wetTitel}`);
        
        if (wetItem['wet-besluit']) {
          console.log(`      🔍 Found wet-besluit structure`);
          const wetBesluit = wetItem['wet-besluit'];
          
          // Handle array-based wet-besluit
          let actualWetBesluit = wetBesluit;
          if (Array.isArray(wetBesluit) && wetBesluit.length > 0) {
            actualWetBesluit = wetBesluit[0];
            console.log(`      🔄 Using wet-besluit[0] for processing`);
          }
          
          // Handle wettekst structure
          if (actualWetBesluit && actualWetBesluit.wettekst) {
            let wettekst = actualWetBesluit.wettekst;
            
            // Handle array-based wettekst
            if (Array.isArray(wettekst) && wettekst.length > 0) {
              wettekst = wettekst[0];
              console.log(`      🔄 Using wettekst[0] for processing`);
            }
            
            processBWBStructure(wettekst, optimized.artikelen, wetTitel);
          } else {
            console.log(`      ⚠️ No wettekst found in wet-besluit`);
          }
        }
      });
      
    } else if (jsonData.wet) {
      // Root level wet structure
      const wetData = jsonData.wet;
      const wetTitel = wetData.intitule?.__text || wetData.intitule || 'Onbekende wet';
      console.log(`  🏛️ BWB formaat (root): Processing ${wetTitel}`);
      
      if (wetData.body) {
        processBWBStructure(wetData.body, optimized.artikelen, wetTitel);
      }
      
    } else if (jsonData.body) {
      // Direct body structure
      console.log(`  🏛️ BWB formaat (direct body)`);
      processBWBStructure(jsonData.body, optimized.artikelen, wetNaam);
      
    } else if (jsonData.besluit) {
      // BWB besluit format (for regulations like RVV)
      const besluitData = jsonData.besluit;
      const titel = besluitData.intitule?.__text || besluitData.intitule || 'Onbekend besluit';
      console.log(`  📜 BWB besluit formaat: Processing ${titel}`);
      
      if (besluitData.body) {
        processBWBStructure(besluitData.body, optimized.artikelen, titel);
      }
      
    } else if (jsonData.regeling) {
      // BWB regeling format
      const regelingData = jsonData.regeling;
      const titel = regelingData.intitule?.__text || regelingData.intitule || 'Onbekende regeling';
      console.log(`  📃 BWB regeling formaat: Processing ${titel}`);
      
      if (regelingData.body) {
        processBWBStructure(regelingData.body, optimized.artikelen, titel);
      }
      
    } else if (jsonData.toestand?.wetgeving?.['wet-besluit']?.wettekst) {
      // Special handling for toestand structure (like Wetboek van Strafvordering)
      const wettekst = jsonData.toestand.wetgeving['wet-besluit'].wettekst;
      const titel = jsonData.toestand.wetgeving.citeertitel?.__text || 
                   jsonData.toestand.wetgeving.intitule?.__text || 
                   'Onbekende wet (toestand format)';
      console.log(`  ⚖️ BWB toestand formaat: Processing ${titel} with wettekst structure`);
      
      if (wettekst.boek) {
        console.log(`    📚 Found boek structure in toestand format`);
        processBoeken(wettekst.boek, optimized.artikelen, titel);
      } else {
        processBWBStructure(wettekst, optimized.artikelen, titel);
      }
      
    } else if (jsonData.data?.wetgeving?.['wet-besluit']?.wettekst?.artikelen) {
      // Special handling for our converted XML structure (Wetboek van Strafvordering)
      const artikelen = jsonData.data.wetgeving['wet-besluit'].wettekst.artikelen;
      const titel = jsonData.data.wetgeving['wet-besluit'].wettekst.meta?.title || 
                   'Onbekende wet (converted XML format)';
      console.log(`  📜 BWB converted XML formaat: Processing ${titel} with ${artikelen.length} artikelen`);
      
      // Process each article directly as they're already in our target format
      artikelen.forEach(artikel => {
        if (artikel.number && artikel.content) {
          const optimizedArtikel = {
            nummer: artikel.number,
            titel: artikel.title || `Artikel ${artikel.number}`,
            tekst: artikel.content,
            wet: titel,
            wetAfkorting: artikel.law_short || 'Sv',
            type: artikel.type || 'artikel',
            bron: artikel.source || 'BWB',
            url: `https://wetten.overheid.nl/BWBR0001903/artikel${artikel.number}`,
            keywords: extractKeywords(artikel.content, artikel.number),
            laatstGewijzigd: new Date().toISOString().split('T')[0]
          };
          
          const strafmaat = extractStrafmaat(artikel.content);
          if (strafmaat) {
            optimizedArtikel.strafmaat = strafmaat;
          }
          
          optimized.artikelen.push(optimizedArtikel);
        }
      });
      
    } else {
      // Try to find articles anywhere in the structure
      console.log(`  🔍 Unknown BWB structure, searching for artikelen...`);
      const foundArticles = findArtikelenRecursive(jsonData);
      if (foundArticles.length > 0) {
        console.log(`    ✅ Found ${foundArticles.length} articles via recursive search`);
        processArtikelen(foundArticles, optimized.artikelen, wetNaam);
      } else {
        console.log(`    ❌ No articles found in ${wetNaam}`);
      }
    }
    
    optimized.metadata.aantalArtikelen = optimized.artikelen.length;
    
    // Write optimized file
    fs.writeFileSync(outputPath, JSON.stringify(optimized, null, 2), 'utf8');
    console.log(`✅ ${optimized.artikelen.length} artikelen geconverteerd naar ${path.basename(outputPath)}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Fout bij converteren ${inputPath}:`, error.message);
    return false;
  }
}

// Helper function to process BWB body structure
function processBWBStructure(body, targetArray, wetNaam) {
  if (!body) return;
  
  console.log(`    🔄 Processing BWB body structure for ${wetNaam}`);
  
  // Handle different BWB body structures
  if (body.hoofdstuk) {
    processHoofdstukken(body.hoofdstuk, targetArray, wetNaam);
  } else if (body.artikel) {
    processArtikelen(body.artikel, targetArray, wetNaam);
  } else if (body.titeldeel) {
    processTiteldelen(body.titeldeel, targetArray, wetNaam);
  } else if (body.boek) {
    processBoeken(body.boek, targetArray, wetNaam);
  } else if (body.paragraaf) {
    processParagrafen(body.paragraaf, targetArray, wetNaam);
  } else if (body.deel) {
    // Handle 'deel' structure
    const delen = Array.isArray(body.deel) ? body.deel : [body.deel];
    delen.forEach(deel => {
      if (deel.artikel) {
        processArtikelen(deel.artikel, targetArray, wetNaam);
      }
      if (deel.hoofdstuk) {
        processHoofdstukken(deel.hoofdstuk, targetArray, wetNaam);
      }
    });
  } else {
    // Try to find any articles in the body
    const foundArticles = findArtikelenRecursive(body);
    if (foundArticles.length > 0) {
      console.log(`    ✅ Found ${foundArticles.length} articles in body via recursive search`);
      processArtikelen(foundArticles, targetArray, wetNaam);
    }
  }
}

// Recursive function to find all articles in any structure
function findArtikelenRecursive(obj, articles = []) {
  if (!obj || typeof obj !== 'object') return articles;
  
  // If we find an 'artikel' property, add it
  if (obj.artikel) {
    const artikelen = Array.isArray(obj.artikel) ? obj.artikel : [obj.artikel];
    articles.push(...artikelen);
  }
  
  // Recursively search all properties
  Object.values(obj).forEach(value => {
    if (typeof value === 'object' && value !== null) {
      findArtikelenRecursive(value, articles);
    }
  });
  
  return articles;
}

function processHoofdstukken(hoofdstukken, artikelen, wetNaam) {
  const hoofdstukkenArray = Array.isArray(hoofdstukken) ? hoofdstukken : [hoofdstukken];
  
  console.log(`🔍 Processing ${hoofdstukkenArray.length} hoofdstukken for ${wetNaam}`);
  
  hoofdstukkenArray.forEach((hoofdstuk, hIndex) => {
    const hoofdstukTitel = hoofdstuk.kop?.titel?.__text || `Hoofdstuk ${hIndex + 1}`;
    console.log(`  📖 Hoofdstuk ${hIndex + 1}: ${hoofdstukTitel}, keys:`, Object.keys(hoofdstuk));
    
    if (hoofdstuk.artikel) {
      console.log(`    ✅ Found ${Array.isArray(hoofdstuk.artikel) ? hoofdstuk.artikel.length : 1} articles in hoofdstuk`);
      processArtikelen(hoofdstuk.artikel, artikelen, wetNaam, null, hoofdstukTitel, null);
    }
    
    // Check for paragrafen in hoofdstuk
    if (hoofdstuk.paragraaf) {
      const paragrafen = Array.isArray(hoofdstuk.paragraaf) ? hoofdstuk.paragraaf : [hoofdstuk.paragraaf];
      console.log(`    🔍 Found ${paragrafen.length} paragrafen in hoofdstuk`);
      paragrafen.forEach((paragraaf) => {
        const paragraafTitel = paragraaf.kop?.titel?.__text || 'Paragraaf';
        if (paragraaf.artikel) {
          console.log(`      ✅ Found ${Array.isArray(paragraaf.artikel) ? paragraaf.artikel.length : 1} articles in paragraaf`);
          processArtikelen(paragraaf.artikel, artikelen, wetNaam, null, hoofdstukTitel, paragraafTitel);
        }
      });
    }
  });
}

function processTiteldelen(titeldelen, artikelen, wetNaam) {
  const titeldelenArray = Array.isArray(titeldelen) ? titeldelen : [titeldelen];
  
  titeldelenArray.forEach((titeldeel) => {
    const titeldeelTitel = titeldeel.kop?.titel?.__text || 'Titeldeel';
    
    if (titeldeel.artikel) {
      processArtikelen(titeldeel.artikel, artikelen, wetNaam, null, titeldeelTitel, null);
    }
    
    if (titeldeel.hoofdstuk) {
      const hoofdstukken = Array.isArray(titeldeel.hoofdstuk) ? titeldeel.hoofdstuk : [titeldeel.hoofdstuk];
      hoofdstukken.forEach((hoofdstuk) => {
        const hoofdstukTitel = hoofdstuk.kop?.titel?.__text || 'Hoofdstuk';
        if (hoofdstuk.artikel) {
          processArtikelen(hoofdstuk.artikel, artikelen, wetNaam, null, titeldeelTitel, null);
        }
      });
    }
  });
}

function processBoeken(boeken, artikelen, wetNaam) {
  const boekenArray = Array.isArray(boeken) ? boeken : [boeken];
  
  boekenArray.forEach((boek) => {
    const boekTitel = boek.kop?.titel?.__text || 'Boek';
    
    // Handle articles directly under boek
    if (boek.artikel) {
      processArtikelen(boek.artikel, artikelen, wetNaam, boekTitel, null, null);
    }
    
    // Handle titeldelen under boek
    if (boek.titeldeel) {
      const titeldelen = Array.isArray(boek.titeldeel) ? boek.titeldeel : [boek.titeldeel];
      titeldelen.forEach((titeldeel) => {
        const titeldeelTitel = titeldeel.kop?.titel?.__text || 'Titeldeel';
        
        // Articles directly under titeldeel
        if (titeldeel.artikel) {
          processArtikelen(titeldeel.artikel, artikelen, wetNaam, boekTitel, titeldeelTitel, null);
        }
        
        // Handle hoofdstukken under titeldeel
        if (titeldeel.hoofdstuk) {
          const hoofdstukken = Array.isArray(titeldeel.hoofdstuk) ? titeldeel.hoofdstuk : [titeldeel.hoofdstuk];
          hoofdstukken.forEach((hoofdstuk) => {
            const hoofdstukTitel = hoofdstuk.kop?.titel?.__text || 'Hoofdstuk';
            
            // Articles directly under hoofdstuk
            if (hoofdstuk.artikel) {
              processArtikelen(hoofdstuk.artikel, artikelen, wetNaam, boekTitel, `${titeldeelTitel} - ${hoofdstukTitel}`, null);
            }
            
            // Handle afdelingen under hoofdstuk
            if (hoofdstuk.afdeling) {
              const afdelingen = Array.isArray(hoofdstuk.afdeling) ? hoofdstuk.afdeling : [hoofdstuk.afdeling];
              afdelingen.forEach((afdeling) => {
                const afdelingTitel = afdeling.kop?.titel?.__text || 'Afdeling';
                if (afdeling.artikel) {
                  processArtikelen(afdeling.artikel, artikelen, wetNaam, boekTitel, `${titeldeelTitel} - ${hoofdstukTitel} - ${afdelingTitel}`, null);
                }
                
                // Handle paragrafen under afdeling
                if (afdeling.paragraaf) {
                  const paragrafen = Array.isArray(afdeling.paragraaf) ? afdeling.paragraaf : [afdeling.paragraaf];
                  paragrafen.forEach((paragraaf) => {
                    const paragraafTitel = paragraaf.kop?.titel?.__text || 'Paragraaf';
                    if (paragraaf.artikel) {
                      processArtikelen(paragraaf.artikel, artikelen, wetNaam, boekTitel, `${titeldeelTitel} - ${hoofdstukTitel} - ${afdelingTitel}`, paragraafTitel);
                    }
                  });
                }
              });
            }
            
            // Handle paragrafen directly under hoofdstuk
            if (hoofdstuk.paragraaf) {
              const paragrafen = Array.isArray(hoofdstuk.paragraaf) ? hoofdstuk.paragraaf : [hoofdstuk.paragraaf];
              paragrafen.forEach((paragraaf) => {
                const paragraafTitel = paragraaf.kop?.titel?.__text || 'Paragraaf';
                if (paragraaf.artikel) {
                  processArtikelen(paragraaf.artikel, artikelen, wetNaam, boekTitel, `${titeldeelTitel} - ${hoofdstukTitel}`, paragraafTitel);
                }
              });
            }
          });
        }
        
        // Handle afdelingen directly under titeldeel
        if (titeldeel.afdeling) {
          const afdelingen = Array.isArray(titeldeel.afdeling) ? titeldeel.afdeling : [titeldeel.afdeling];
          afdelingen.forEach((afdeling) => {
            const afdelingTitel = afdeling.kop?.titel?.__text || 'Afdeling';
            if (afdeling.artikel) {
              processArtikelen(afdeling.artikel, artikelen, wetNaam, boekTitel, `${titeldeelTitel} - ${afdelingTitel}`, null);
            }
          });
        }
      });
    }
    
    // Handle hoofdstukken directly under boek
    if (boek.hoofdstuk) {
      const hoofdstukken = Array.isArray(boek.hoofdstuk) ? boek.hoofdstuk : [boek.hoofdstuk];
      hoofdstukken.forEach((hoofdstuk) => {
        const hoofdstukTitel = hoofdstuk.kop?.titel?.__text || 'Hoofdstuk';
        if (hoofdstuk.artikel) {
          processArtikelen(hoofdstuk.artikel, artikelen, wetNaam, boekTitel, hoofdstukTitel, null);
        }
      });
    }
  });
}

function processParagrafen(paragrafen, artikelen, wetNaam) {
  const paragraafArray = Array.isArray(paragrafen) ? paragrafen : [paragrafen];
  
  paragraafArray.forEach((paragraaf) => {
    const paragraafTitel = paragraaf.kop?.titel?.__text || 'Paragraaf';
    if (paragraaf.artikel) {
      processArtikelen(paragraaf.artikel, artikelen, wetNaam, null, null, paragraafTitel);
    }
  });
}

function processArtikelen(artikelen, targetArray, wetNaam, titeldeel = null, hoofdstuk = null, paragraaf = null) {
  const artikelenArray = Array.isArray(artikelen) ? artikelen : [artikelen];
  console.log(`    🔄 Processing ${artikelenArray.length} artikelen from ${wetNaam}`);
  
  let addedCount = 0;
  
  artikelenArray.forEach((artikel) => {
    const artikelNr = artikel.kop?.nr?.['#text'] || 
                     artikel.kop?.nr?.__text || 
                     artikel.kop?.nr || 
                     artikel.nr?.__text || 
                     artikel.nr?.['#text'] ||
                     artikel.nr || 
                     artikel['_nr'] ||
                     artikel.label ||
                     'Onbekend';
    
    const artikelTekst = extractBWBArtikelTekst(artikel);
    
    // Skip articles without meaningful text
    if (!artikelTekst || artikelTekst.length < 10) {
      console.log(`      ⚠️  Skipping artikel ${artikelNr}: insufficient text (${artikelTekst.length} chars)`);
      return;
    }
    
    // Use consistent field names for optimized format
    const optimizedArtikel = {
      artikelNr: artikelNr,
      tekst: artikelTekst,
      wetNaam: wetNaam,
      bron: wetNaam
    };
    
    // Add context information if available
    if (titeldeel) optimizedArtikel.titeldeel = titeldeel;
    if (hoofdstuk) optimizedArtikel.hoofdstuk = hoofdstuk;
    if (paragraaf) optimizedArtikel.paragraaf = paragraaf;
    
    targetArray.push(optimizedArtikel);
    console.log(`      ✅ Added artikel ${artikelNr} (${artikelTekst.length} chars)`);
    addedCount++;
  });
  
  console.log(`    📊 Successfully added ${addedCount}/${artikelenArray.length} artikelen`);
  return addedCount;
}

// Main conversion function
async function convertAllBWBFiles() {
  const dataDir = path.join(__dirname, '../data');
  const outputDir = path.join(__dirname, '../data/optimized');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const files = fs.readdirSync(dataDir);
  const bwbFiles = files.filter(file => 
    file.endsWith('.json') && 
    !file.includes('optimized') &&
    !file.includes('custom-sources') &&
    !file.includes('officiele_bronnen') &&
    !file.includes('wetten-custom')
  );
  
  console.log(`🚀 Starting conversion of ${bwbFiles.length} BWB files...\n`);
  
  let successCount = 0;
  
  for (const file of bwbFiles) {
    const inputPath = path.join(dataDir, file);
    const outputPath = path.join(outputDir, file.replace('.json', '_optimized.json'));
    
    const success = await convertBWBToOptimized(inputPath, outputPath);
    if (success) successCount++;
  }
  
  console.log(`\n🎉 Conversion complete! ${successCount}/${bwbFiles.length} files converted successfully.`);
  console.log(`📁 Optimized files saved to: ${outputDir}`);
}

// Run conversion if called directly
if (require.main === module) {
  convertAllBWBFiles().catch(console.error);
}

module.exports = { convertBWBToOptimized, convertAllBWBFiles }; 