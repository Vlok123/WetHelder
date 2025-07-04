const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

async function convertWvsvXmlToJson() {
    try {
        console.log('🔄 Converting Wvsv.xml to JSON format...');
        
        // Read the XML file
        const xmlPath = path.join(__dirname, '..', 'data', 'Wvsv.xml');
        const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
        
        console.log('📖 XML file read successfully');
        console.log(`📏 File size: ${(xmlContent.length / 1024 / 1024).toFixed(2)} MB`);
        
        // Parse XML to JavaScript object
        const parser = new xml2js.Parser({
            explicitArray: false,
            mergeAttrs: true,
            ignoreAttrs: false
        });
        
        console.log('⚙️ Parsing XML...');
        const result = await parser.parseStringPromise(xmlContent);
        
        console.log('🔍 XML structure analysis:');
        console.log('Root keys:', Object.keys(result));
        
        // Look for the main structure
        let mainData = result;
        if (result.toestand) {
            console.log('Found toestand structure');
            mainData = result.toestand;
            if (mainData.wetgeving) {
                console.log('Found wetgeving within toestand');
                mainData = mainData.wetgeving;
            }
            if (mainData['wet-besluit']) {
                console.log('Found wet-besluit within structure');
                mainData = mainData['wet-besluit'];
            }
        } else if (result.wetgeving) {
            mainData = result.wetgeving;
            console.log('Found wetgeving structure');
        } else if (result['wet-besluit']) {
            mainData = result['wet-besluit'];
            console.log('Found wet-besluit structure');
        }
        
        console.log('Main data keys:', Object.keys(mainData));
        
        // Find articles structure
        let articles = [];
        let wetInfo = {
            title: 'Wetboek van Strafvordering',
            short: 'Sv'
        };
        
        // Try different possible structures for BWB XML format
        if (mainData.wettekst && mainData.wettekst.boek) {
            console.log('📚 Found boek structure');
            const boeken = Array.isArray(mainData.wettekst.boek) ? mainData.wettekst.boek : [mainData.wettekst.boek];
            
            boeken.forEach((boek, boekIndex) => {
                console.log(`📖 Processing boek ${boekIndex + 1}`);
                console.log(`Boek keys:`, Object.keys(boek));
                
                if (boek.kop) {
                    console.log(`Boek kop:`, boek.kop);
                }
                
                // Check for different possible structures
                if (boek.titel) {
                    console.log(`Found titel structure with keys:`, Object.keys(boek.titel));
                    
                    // Process title sections
                    if (boek.titel.artikel) {
                        const artikelen = Array.isArray(boek.titel.artikel) ? boek.titel.artikel : [boek.titel.artikel];
                        console.log(`Found ${artikelen.length} articles in titel`);
                        
                        artikelen.forEach(artikel => {
                            const articleData = extractArticleData(artikel, wetInfo);
                            if (articleData) {
                                articles.push(articleData);
                            }
                        });
                    }
                    
                    // Check for nested structure in titel
                    if (Array.isArray(boek.titel)) {
                        boek.titel.forEach((titel, titelIndex) => {
                            console.log(`Processing titel ${titelIndex + 1} with keys:`, Object.keys(titel));
                            if (titel.artikel) {
                                const artikelen = Array.isArray(titel.artikel) ? titel.artikel : [titel.artikel];
                                console.log(`Found ${artikelen.length} articles in titel ${titelIndex + 1}`);
                                
                                artikelen.forEach(artikel => {
                                    const articleData = extractArticleData(artikel, wetInfo);
                                    if (articleData) {
                                        articles.push(articleData);
                                    }
                                });
                            }
                        });
                    }
                }
                
                // Check for direct articles in boek
                if (boek.artikel) {
                    const artikelen = Array.isArray(boek.artikel) ? boek.artikel : [boek.artikel];
                    console.log(`Found ${artikelen.length} direct articles in boek`);
                    
                    artikelen.forEach(artikel => {
                        const articleData = extractArticleData(artikel, wetInfo);
                        if (articleData) {
                            articles.push(articleData);
                        }
                    });
                }
                
                // Process titeldeel
                if (boek.titeldeel) {
                    console.log('Found titeldeel structure');
                    const titeldelenArray = Array.isArray(boek.titeldeel) ? boek.titeldeel : [boek.titeldeel];
                    
                    titeldelenArray.forEach((titeldeel, titeldeelIndex) => {
                        console.log(`Processing titeldeel ${titeldeelIndex + 1}`);
                        console.log(`Titeldeel keys:`, Object.keys(titeldeel));
                        
                        // Check for articles in titeldeel
                        if (titeldeel.artikel) {
                            const artikelen = Array.isArray(titeldeel.artikel) ? titeldeel.artikel : [titeldeel.artikel];
                            console.log(`Found ${artikelen.length} articles in titeldeel`);
                            
                            artikelen.forEach(artikel => {
                                const articleData = extractArticleData(artikel, wetInfo);
                                if (articleData) {
                                    articles.push(articleData);
                                }
                            });
                        }
                        
                        // Check for titel in titeldeel
                        if (titeldeel.titel) {
                            console.log('Found titel in titeldeel');
                            const titels = Array.isArray(titeldeel.titel) ? titeldeel.titel : [titeldeel.titel];
                            
                            titels.forEach(titel => {
                                if (titel.artikel) {
                                    const artikelen = Array.isArray(titel.artikel) ? titel.artikel : [titel.artikel];
                                    console.log(`Found ${artikelen.length} articles in titel within titeldeel`);
                                    
                                    artikelen.forEach(artikel => {
                                        const articleData = extractArticleData(artikel, wetInfo);
                                        if (articleData) {
                                            articles.push(articleData);
                                        }
                                    });
                                }
                            });
                        }
                        
                        // Check for afdeling in titeldeel (NIEUW!)
                        if (titeldeel.afdeling) {
                            console.log('Found afdeling in titeldeel');
                            const afdelingen = Array.isArray(titeldeel.afdeling) ? titeldeel.afdeling : [titeldeel.afdeling];
                            
                            afdelingen.forEach((afdeling, afdelingIndex) => {
                                console.log(`Processing afdeling ${afdelingIndex + 1} in titeldeel`);
                                
                                if (afdeling.artikel) {
                                    const artikelen = Array.isArray(afdeling.artikel) ? afdeling.artikel : [afdeling.artikel];
                                    console.log(`Found ${artikelen.length} articles in afdeling within titeldeel`);
                                    
                                    artikelen.forEach(artikel => {
                                        const articleData = extractArticleData(artikel, wetInfo);
                                        if (articleData) {
                                            articles.push(articleData);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                
                // Process hoofdstuk
                if (boek.hoofdstuk) {
                    console.log('Found hoofdstuk structure');
                    const hoofdstukkenArray = Array.isArray(boek.hoofdstuk) ? boek.hoofdstuk : [boek.hoofdstuk];
                    
                    hoofdstukkenArray.forEach((hoofdstuk, hoofdstukIndex) => {
                        console.log(`Processing hoofdstuk ${hoofdstukIndex + 1}`);
                        console.log(`Hoofdstuk keys:`, Object.keys(hoofdstuk));
                        
                        // Check for articles in hoofdstuk
                        if (hoofdstuk.artikel) {
                            const artikelen = Array.isArray(hoofdstuk.artikel) ? hoofdstuk.artikel : [hoofdstuk.artikel];
                            console.log(`Found ${artikelen.length} articles in hoofdstuk`);
                            
                            artikelen.forEach(artikel => {
                                const articleData = extractArticleData(artikel, wetInfo);
                                if (articleData) {
                                    articles.push(articleData);
                                }
                            });
                        }
                        
                        // Check for afdeling in hoofdstuk
                        if (hoofdstuk.afdeling) {
                            console.log('Found afdeling in hoofdstuk');
                            const afdelingen = Array.isArray(hoofdstuk.afdeling) ? hoofdstuk.afdeling : [hoofdstuk.afdeling];
                            
                            afdelingen.forEach(afdeling => {
                                if (afdeling.artikel) {
                                    const artikelen = Array.isArray(afdeling.artikel) ? afdeling.artikel : [afdeling.artikel];
                                    console.log(`Found ${artikelen.length} articles in afdeling`);
                                    
                                    artikelen.forEach(artikel => {
                                        const articleData = extractArticleData(artikel, wetInfo);
                                        if (articleData) {
                                            articles.push(articleData);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                
                // Debug: Show first few keys of boek to understand structure
                if (boekIndex === 0) {
                    console.log(`🔍 First boek detailed structure:`);
                    const keys = Object.keys(boek);
                    keys.slice(0, 5).forEach(key => {
                        console.log(`  ${key}:`, typeof boek[key], Array.isArray(boek[key]) ? `Array(${boek[key].length})` : '');
                    });
                }
            });
        }
        
        // Alternative structure check
        if (mainData.artikel) {
            console.log('📝 Found direct artikel structure');
            const artikelen = Array.isArray(mainData.artikel) ? mainData.artikel : [mainData.artikel];
            console.log(`Found ${artikelen.length} articles`);
            
            artikelen.forEach(artikel => {
                const articleData = extractArticleData(artikel, wetInfo);
                if (articleData) {
                    articles.push(articleData);
                }
            });
        }
        
        console.log(`✅ Extracted ${articles.length} articles`);
        
        if (articles.length > 0) {
            console.log('📝 Sample articles:');
            articles.slice(0, 3).forEach(art => {
                console.log(`- Artikel ${art.number}: ${art.title?.substring(0, 100)}...`);
            });
        }
        
        // Create the final JSON structure
        const jsonData = {
            data: {
                wetgeving: {
                    'wet-besluit': {
                        wettekst: {
                            meta: {
                                title: wetInfo.title,
                                short: wetInfo.short
                            },
                            artikelen: articles
                        }
                    }
                }
            }
        };
        
        // Save to JSON file
        const outputPath = path.join(__dirname, '..', 'data', 'wetboek_strafvordering.json');
        fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf-8');
        
        console.log(`💾 Saved to ${outputPath}`);
        console.log(`📊 Total articles: ${articles.length}`);
        
        return articles.length;
        
    } catch (error) {
        console.error('❌ Error converting XML:', error);
        throw error;
    }
}

function extractArticleData(artikel, wetInfo) {
    try {
        let nummer = '';
        let titel = '';
        let inhoud = '';
        
        // Extract article number
        if (artikel.kop && artikel.kop.nr) {
            nummer = typeof artikel.kop.nr === 'object' ? artikel.kop.nr['#text'] || artikel.kop.nr._ : artikel.kop.nr;
        } else if (artikel.nr) {
            nummer = typeof artikel.nr === 'object' ? artikel.nr['#text'] || artikel.nr._ : artikel.nr;
        }
        
        // Extract title
        if (artikel.kop && artikel.kop.titel) {
            titel = typeof artikel.kop.titel === 'object' ? artikel.kop.titel['#text'] || artikel.kop.titel._ : artikel.kop.titel;
        } else if (artikel.titel) {
            titel = typeof artikel.titel === 'object' ? artikel.titel['#text'] || artikel.titel._ : artikel.titel;
        }
        
        // Extract content (al, lid, etc.)
        let contentParts = [];
        
        if (artikel.al) {
            const als = Array.isArray(artikel.al) ? artikel.al : [artikel.al];
            als.forEach((al, index) => {
                let alText = '';
                if (typeof al === 'string') {
                    alText = al;
                } else if (al['#text']) {
                    alText = al['#text'];
                } else if (al._) {
                    alText = al._;
                } else if (typeof al === 'object') {
                    // Try to extract text from nested structure
                    alText = JSON.stringify(al);
                }
                
                if (alText && alText.trim()) {
                    if (als.length > 1) {
                        contentParts.push(`${index + 1}. ${alText.trim()}`);
                    } else {
                        contentParts.push(alText.trim());
                    }
                }
            });
        }
        
        if (artikel.lid) {
            const leden = Array.isArray(artikel.lid) ? artikel.lid : [artikel.lid];
            leden.forEach((lid, index) => {
                let lidText = '';
                if (lid.al) {
                    const als = Array.isArray(lid.al) ? lid.al : [lid.al];
                    const alTexts = als.map(al => {
                        if (typeof al === 'string') return al;
                        if (al['#text']) return al['#text'];
                        if (al._) return al._;
                        return '';
                    }).filter(t => t.trim());
                    lidText = alTexts.join(' ');
                }
                
                if (lidText && lidText.trim()) {
                    contentParts.push(`Lid ${index + 1}: ${lidText.trim()}`);
                }
            });
        }
        
        inhoud = contentParts.join('\n\n');
        
        if (!nummer) {
            return null; // Skip if no article number
        }
        
        return {
            number: nummer.toString(),
            title: titel || `Artikel ${nummer}`,
            content: inhoud || 'Geen inhoud beschikbaar',
            law: wetInfo.title,
            law_short: wetInfo.short,
            type: 'artikel',
            source: 'BWB'
        };
        
    } catch (error) {
        console.error('Error extracting article data:', error);
        return null;
    }
}

// Run the conversion
if (require.main === module) {
    convertWvsvXmlToJson()
        .then(count => {
            console.log(`🎉 Successfully converted ${count} articles!`);
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Conversion failed:', error);
            process.exit(1);
        });
}

module.exports = { convertWvsvXmlToJson }; 