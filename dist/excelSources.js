"use strict";
/**
 * Excel Sources Integration
 *
 * Dit bestand beheert de integratie van officiële bronnen uit het Excel bestand.
 * Het Excel bestand wordt geplaatst in de /data directory en hier geïntegreerd.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadExcelSources = loadExcelSources;
exports.searchExcelSources = searchExcelSources;
exports.getExcelSourcesByCategory = getExcelSourcesByCategory;
exports.getExcelSourcesByType = getExcelSourcesByType;
exports.formatExcelSourcesForContext = formatExcelSourcesForContext;
exports.getAvailableCategories = getAvailableCategories;
exports.getAvailableTypes = getAvailableTypes;
exports.testExcelIntegration = testExcelIntegration;
const XLSX = __importStar(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Pad naar het Excel bestand in de data directory
const EXCEL_SOURCES_PATH = path_1.default.join(process.cwd(), 'data', 'officiele_bronnen.xlsx');
/**
 * Laadt de officiële bronnen uit het Excel bestand
 */
async function loadExcelSources() {
    try {
        if (!fs_1.default.existsSync(EXCEL_SOURCES_PATH)) {
            console.warn(`⚠️ Excel bestand niet gevonden: ${EXCEL_SOURCES_PATH}`);
            return [];
        }
        console.log('📊 Loading Excel sources...');
        // Lees het Excel bestand
        const workbook = XLSX.readFile(EXCEL_SOURCES_PATH);
        const sheetName = workbook.SheetNames[0]; // Eerste sheet
        const worksheet = workbook.Sheets[sheetName];
        // Converteer naar JSON
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (rawData.length < 2) {
            console.warn('⚠️ Excel bestand bevat geen data');
            return [];
        }
        // Eerste rij zijn de headers
        const headers = rawData[0];
        const dataRows = rawData.slice(1);
        console.log(`📋 Headers gevonden: ${headers.join(', ')}`);
        // Map de data naar onze interface
        const sources = dataRows
            .filter(row => row && row.length > 0 && row[0]) // Filter lege rijen
            .map((row, index) => {
            try {
                const source = {
                    id: `excel-${index + 1}`,
                    naam: String(row[0] || '').trim(),
                    url: String(row[1] || '').trim(),
                    beschrijving: String(row[2] || '').trim(),
                    categorie: String(row[3] || 'Overig').trim(),
                    betrouwbaarheid: validateBetrouwbaarheid(String(row[4] || 'hoog').trim().toLowerCase()),
                    trefwoorden: String(row[5] || '').split(',').map(k => k.trim()).filter(k => k),
                    type: validateType(String(row[6] || 'overig').trim().toLowerCase()),
                    organisatie: String(row[7] || '').trim() || undefined,
                    laatstGecontroleerd: new Date()
                };
                return source;
            }
            catch (error) {
                console.warn(`⚠️ Fout bij verwerken rij ${index + 2}:`, error);
                return null;
            }
        })
            .filter((source) => source !== null);
        console.log(`✅ ${sources.length} bronnen geladen uit Excel bestand`);
        // Log categorieën
        const categories = [...new Set(sources.map(s => s.categorie))];
        console.log(`📂 Categorieën: ${categories.join(', ')}`);
        return sources;
    }
    catch (error) {
        console.error('❌ Fout bij laden Excel bronnen:', error);
        return [];
    }
}
/**
 * Valideert en normaliseert betrouwbaarheid
 */
function validateBetrouwbaarheid(value) {
    switch (value) {
        case 'hoog':
        case 'high':
            return 'hoog';
        case 'middel':
        case 'medium':
        case 'gemiddeld':
            return 'middel';
        case 'laag':
        case 'low':
            return 'laag';
        default:
            return 'hoog'; // Default naar hoog voor officiële bronnen
    }
}
/**
 * Valideert en normaliseert type
 */
function validateType(value) {
    switch (value) {
        case 'wetgeving':
        case 'wet':
        case 'wetten':
            return 'wetgeving';
        case 'jurisprudentie':
        case 'rechtspraak':
        case 'uitspraak':
        case 'uitspraken':
            return 'jurisprudentie';
        case 'cao':
        case 'arbeidsvoorwaarden':
            return 'cao';
        case 'beleid':
        case 'beleidsregel':
        case 'beleidsregels':
            return 'beleid';
        default:
            return 'overig';
    }
}
/**
 * Zoekt in de Excel bronnen op basis van query
 */
async function searchExcelSources(query, limit = 10) {
    const sources = await loadExcelSources();
    if (!query.trim()) {
        return sources.slice(0, limit);
    }
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    const scoredSources = sources.map(source => {
        let score = 0;
        const searchableText = [
            source.naam,
            source.beschrijving,
            source.categorie,
            source.organisatie || '',
            ...source.trefwoorden
        ].join(' ').toLowerCase();
        // Score op basis van matches
        searchTerms.forEach(term => {
            if (source.naam.toLowerCase().includes(term))
                score += 10;
            if (source.trefwoorden.some(keyword => keyword.toLowerCase().includes(term)))
                score += 8;
            if (source.beschrijving.toLowerCase().includes(term))
                score += 5;
            if (source.categorie.toLowerCase().includes(term))
                score += 3;
            if (searchableText.includes(term))
                score += 1;
        });
        return { source, score };
    });
    return scoredSources
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.source);
}
/**
 * Haalt bronnen op per categorie
 */
async function getExcelSourcesByCategory(categorie) {
    const sources = await loadExcelSources();
    return sources.filter(source => source.categorie.toLowerCase().includes(categorie.toLowerCase()));
}
/**
 * Haalt bronnen op per type
 */
async function getExcelSourcesByType(type) {
    const sources = await loadExcelSources();
    return sources.filter(source => source.type.toLowerCase() === type.toLowerCase());
}
/**
 * Formatteert Excel bronnen voor gebruik in de zoekcontext
 */
function formatExcelSourcesForContext(sources) {
    if (sources.length === 0) {
        return 'Geen specifieke Excel bronnen gevonden.';
    }
    return sources.map(source => {
        return `**${source.naam}** (${source.categorie})
Beschrijving: ${source.beschrijving}
URL: ${source.url}
Type: ${source.type}
${source.organisatie ? `Organisatie: ${source.organisatie}` : ''}
Betrouwbaarheid: ${source.betrouwbaarheid}
Trefwoorden: ${source.trefwoorden.join(', ')}
---`;
    }).join('\n\n');
}
/**
 * Krijgt alle beschikbare categorieën
 */
async function getAvailableCategories() {
    const sources = await loadExcelSources();
    return [...new Set(sources.map(s => s.categorie))].sort();
}
/**
 * Krijgt alle beschikbare types
 */
async function getAvailableTypes() {
    const sources = await loadExcelSources();
    return [...new Set(sources.map(s => s.type))].sort();
}
/**
 * Test functie om de Excel integratie te testen
 */
async function testExcelIntegration() {
    console.log('🧪 Testing Excel integration...');
    const sources = await loadExcelSources();
    console.log(`📊 Totaal bronnen: ${sources.length}`);
    const categories = await getAvailableCategories();
    console.log(`📂 Categorieën: ${categories.join(', ')}`);
    const types = await getAvailableTypes();
    console.log(`🏷️ Types: ${types.join(', ')}`);
    // Test zoeken
    const searchResults = await searchExcelSources('politie', 5);
    console.log(`🔍 Zoekresultaten voor 'politie': ${searchResults.length}`);
    if (searchResults.length > 0) {
        console.log('📋 Eerste resultaat:');
        console.log(`   Naam: ${searchResults[0].naam}`);
        console.log(`   URL: ${searchResults[0].url}`);
        console.log(`   Categorie: ${searchResults[0].categorie}`);
    }
    console.log('✅ Excel integration test completed');
}
