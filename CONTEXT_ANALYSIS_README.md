# 🧠 WetHelder Advanced Context Analysis System

## 🎯 Overzicht

Het nieuwe Context Analysis System implementeert **multi-step reasoning** en **sector-specifieke kennismodules** om juridische vragen veel intelligenter te beantwoorden. Het systeem herkent automatisch bijzondere juridische contexten en past de analyse daarop aan.

## 🚀 Wat is er Nieuw?

### **Fase 2: Advanced Implementation**
✅ **Multi-step reasoning** - Twee-fase analyse  
✅ **Sector knowledge base** - Uitgebreide kennismodules  
✅ **Dynamic prompt building** - Intelligente prompt samenstelling  

## 🔍 Hoe het Werkt

### **Stap 1: Context Detection**
Het systeem scant de vraag op keywords die wijzen op bijzondere juridische sectoren:

```typescript
// Voorbeeld: "Ik werk in een ziekenhuis. De politie wilt camerabeelden vorderen"
// → Detecteert: HEALTHCARE context
```

### **Stap 2: Deep Analysis** 
Voor elke gedetecteerde sector wordt een uitgebreide analyse uitgevoerd:

- **Speciale regels** (bijv. medisch beroepsgeheim)
- **Juridische principes** (bijv. proportionaliteit)
- **Verplichte overwegingen** (bijv. subsidiariteit)
- **Relevante wetgeving** (bijv. WGBO, AVG art. 9)

### **Stap 3: Enhanced Prompt Building**
De AI krijgt een uitgebreide, sector-specifieke prompt met:

- Alle relevante wetten en artikelen
- Speciale regels met prioriteit (🔴 hoog, 🟡 medium, 🟢 laag)
- Verplichte analysepunten
- Gestructureerde antwoordvereisten

## 🏥 Sector Knowledge Base

### **HEALTHCARE (Zorg)**
**Keywords**: ziekenhuis, arts, dokter, medisch, patiënt, zorg, behandeling, dossier

**Speciale Regels**:
- 🔴 Medisch beroepsgeheim (art. 7:457 BW, 218 Sv)
- 🔴 Bijzondere categorieën persoonsgegevens (AVG art. 9)
- 🔴 Proportionaliteit en subsidiariteit (8 EVRM, Sv art. 96a)

**Verplichte Overwegingen**:
- Is er sprake van een spoedgeval of ernstig misdrijf?
- Kunnen de gegevens op andere wijze worden verkregen?
- Is de vordering proportioneel ten opzichte van het onderzoek?
- Welke specifieke gegevens worden gevorderd?
- Is er toestemming van de patiënt?

### **LEGAL_PROFESSION (Advocatuur)**
**Keywords**: advocaat, kantoor, cliënt, verschoningsrecht, beroepsgeheim

**Speciale Regels**:
- 🔴 Verschoningsrecht advocaten (218 Sv)

### **EDUCATION (Onderwijs)**
**Keywords**: school, student, onderwijs, leerling, docent

**Speciale Regels**:
- 🔴 Meldcode kindermishandeling (Jeugdwet art. 4.1.1)

### **FINANCIAL (Financiële Sector)**
**Keywords**: bank, financieel, rekening, transactie

**Speciale Regels**:
- 🔴 Bankgeheim (Wft art. 1:89)

## 🧪 Testing & Demo

### **Test API Endpoint**: `/api/test-context`

**GET Request** - Test ziekenhuis vraag:
```bash
curl http://localhost:3000/api/test-context
```

**POST Request** - Test eigen vraag:
```bash
curl -X POST http://localhost:3000/api/test-context \
  -H "Content-Type: application/json" \
  -d '{"question": "Uw vraag hier", "mode": "demo"}'
```

**Modes**:
- `analyze` - Basis context analyse
- `demo` - Uitgebreide analyse met details
- `test` - Volledige test suite (check server logs)

### **Voorbeeld Output**:
```json
{
  "question": "Ik werk in een ziekenhuis. De politie wilt camerabeelden vorderen van mij. Mag dat?",
  "contexts": ["HEALTHCARE"],
  "analysis": {
    "specialRulesCount": 3,
    "legalPrinciplesCount": 7,
    "requiredConsiderationsCount": 6,
    "specialRules": [
      {
        "rule": "Medisch beroepsgeheim",
        "articles": ["7:457 BW", "218 Sv"],
        "priority": "high"
      }
    ]
  },
  "enhancedPromptActivated": true
}
```

## 📊 Resultaat voor Ziekenhuis Vraag

**Voor de implementatie**:
- Algemeen antwoord over camerabeelden vorderen
- Geen aandacht voor medisch beroepsgeheim
- Geen vermelding van verschoningsrecht
- Geen proportionaliteitstoets

**Na de implementatie**:
- ✅ Detecteert HEALTHCARE context
- ✅ Activeert 3 speciale regels (hoge prioriteit)
- ✅ Verplicht 6 specifieke overwegingen
- ✅ Gestructureerd antwoord met alle aspecten:
  1. Algemene juridische positie
  2. Ziekenhuis-specifieke overwegingen  
  3. Medisch beroepsgeheim en verschoningsrecht
  4. Proportionaliteits- en subsidiariteitstoets
  5. Praktische toepassing
  6. Volledige conclusie

## 🔧 Technische Implementatie

### **Nieuwe Bestanden**:
- `lib/contextAnalysis.ts` - Hoofdsysteem
- `lib/contextAnalysisTest.ts` - Test suite
- `app/api/test-context/route.ts` - Test endpoint

### **Aangepaste Bestanden**:
- `lib/openai.ts` - Integratie met OpenAI

### **Architectuur**:
```
Question → Context Detection → Deep Analysis → Enhanced Prompt → AI Response
    ↓              ↓                ↓              ↓            ↓
Keywords    Sector Match    Special Rules    Dynamic Build   Comprehensive
Scanning    Algorithm       Collection       Multi-step      Legal Analysis
```

## 🎯 Impact

### **Verbeterde Antwoorden voor**:
- 🏥 Zorgverleners (medisch beroepsgeheim, WGBO, AVG)
- ⚖️ Advocaten (verschoningsrecht, beroepsgeheim)
- 🏫 Onderwijspersoneel (meldplicht, privacy leerlingen)
- 🏦 Financiële sector (bankgeheim, Wwft)

### **Technische Voordelen**:
- **Modulair**: Eenvoudig nieuwe sectoren toevoegen
- **Schaalbaar**: Knowledge base kan worden uitgebreid
- **Testbaar**: Uitgebreide test suite
- **Transparant**: Duidelijke logging van detectie en analyse

## 🚀 Toekomstige Uitbreidingen

### **Nieuwe Sectoren**:
- Politie & Handhaving
- Gemeenten & Bestuur  
- ICT & Privacy
- Vastgoed & Bouw
- Transport & Logistiek

### **Advanced Features**:
- Cross-sector analysis (meerdere contexten tegelijk)
- Confidence scoring voor context detectie
- Machine learning voor keyword optimalisatie
- Jurisprudentie-specifieke regels

## 📝 Conclusie

Het nieuwe Context Analysis System zorgt ervoor dat WetHelder nu **intelligente, sector-specifieke juridische analyses** kan geven die rekening houden met alle relevante bijzondere regels en overwegingen. 

**Voor de ziekenhuis camerabeelden vraag betekent dit**: Een volledig juridisch advies dat zowel de algemene regels over vordering van camerabeelden behandelt als de specifieke bescherming die geldt voor ziekenhuizen, medische gegevens en het verschoningsrecht van zorgverleners.

🎉 **Het systeem is nu live en actief!** 