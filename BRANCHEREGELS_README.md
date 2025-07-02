# 🏢 Brancheregels Systeem - WetHelder

## 🎯 **Probleem Opgelost**

**Voor:** Alleen wettelijke bepalingen, geen brancheregels  
**Nu:** Complete analyse inclusief brancheorganisatie regels

### **Voorbeeld Makgelaars:**
- **Wettelijk:** Makelaar mag biedingsinformatie delen
- **NVM-regel:** Verbiedt dit expliciet voor leden
- **Resultaat:** Conflict gedetecteerd + advies: volg strengste regel

---

## ✅ **Nieuwe Functionaliteiten**

### **1. Automatische Detectie**
```typescript
// Detecteert relevante regels per vraag
const relevanteRegels = zoekBrancheRegels("makelaar bieding")
// → Vindt NVM-regels over prijsinformatie
```

### **2. Conflict Waarschuwing**
```
⚠️ CONFLICTEN GEDETECTEERD:
- Conflict: Wettelijk toegestaan maar NVM verbiedt dit

ADVIES: Houd je aan de strengste regel. Brancheregels zijn 
vaak bindend voor leden en kunnen leiden tot sancties.
```

### **3. Uitgebreide Database**
- **Makelaardij:** NVM-regels (biedingen, transparantie)
- **Advocatuur:** Nederlandse Orde (geheimhouding, belangenconflict)
- **Accountancy:** NBA (onafhankelijkheid, objectiviteit)
- **Notariaat:** KNB (onpartijdigheid, rechtshulp)
- **Gezondheidszorg:** KNMG (beroepsgeheim)
- **Financiële dienstverlening:** AFM (zorgplicht)
- **Journalistiek:** NVJ (waarheidsgetrouwheid)
- **Bouw:** Bouwend Nederland (kwaliteitsborging)

---

## 🔧 **Technische Implementatie**

### **API Integratie**
```typescript
// In ask/route.ts & wetuitleg/route.ts
const relevanteRegels = zoekBrancheRegels(question)

if (relevanteRegels.length > 0) {
  systemPrompt += `
  **BRANCHEREGELS:**
  ${relevanteRegels.map(regel => 
    `${regel.organisatie}: ${regel.regel}`
  ).join('\n')}
  `
}
```

### **Enhanced Prompts**
- ✅ Automatische detectie van brancheregels
- ✅ Conflict waarschuwingen
- ✅ Profession-specific context
- ✅ Comprehensive analysis

---

## 📝 **Praktijkvoorbeelden**

### **1. Makelaar Vraag:**
```
Vraag: "Mag een makelaar vertellen welke biedingen er zijn?"

Antwoord:
🏛️ JURIDISCHE BASIS:
Wettelijk is er geen verbod op het delen van biedingsinformatie...

🏢 BRANCHEREGELS:
NVM - Verbod op prijsinformatie concurrent:
Een NVM-makelaar mag geen informatie geven over biedingen 
van andere geïnteresseerden...

⚠️ CONFLICTEN GEDETECTEERD:
- Conflict: Wettelijk toegestaan maar NVM verbiedt dit

💡 ADVIES: Houd je aan de strengste regel...
```

### **2. Advocaat Geheimhouding:**
```
Vraag: "Wanneer mag een advocaat informatie delen?"

Antwoord:
🏛️ JURIDISCHE BASIS:
Verschoningsrecht artikel 37 Advocatenwet...

🏢 BRANCHEREGELS:
Nederlandse Orde van Advocaten - Absolute geheimhoudingsplicht:
Ook na beëindiging van de opdracht...

📋 HANDELINGSPERSPECTIEF:
Zeer beperkte uitzonderingen, altijd tuchtrechtcheck...
```

---

## 🚀 **Voordelen voor Gebruikers**

### **Advocates/Juristen:**
- Volledige compliance check
- Tuchtrechtelijke risico's
- Profession-specific analysis

### **Makelaars:**
- NVM-regels vs wettelijke ruimte
- Transparantie verplichtingen
- Klachtrisico's

### **Bedrijven:**
- AFM/NBA/KNMG regels
- Compliance strategieën
- Sanctierisico's

### **Algemeen Publiek:**
- Begrijpelijke uitleg verschillen
- Praktische gevolgen
- Duidelijke stappen

---

## 🔄 **Workflow**

1. **Vraag ingediend** → Automatische scanning op keywords
2. **Regels detectie** → Zoekt in database naar relevante regels
3. **Conflict analyse** → Vergelijkt wettelijke vs branche bepalingen  
4. **Enhanced prompt** → AI krijgt beide perspectieven
5. **Comprehensive antwoord** → Gebruiker krijgt volledige analyse

---

## 📊 **Meetbare Verbeteringen**

- **✅ Chat geheugen:** 6-8 berichten context (was 4-6)
- **✅ Conversation flow:** Beter begrip follow-up vragen
- **✅ Professional context:** Specifiek per beroep
- **✅ Conflict detection:** Automatische waarschuwingen
- **✅ Comprehensive answers:** Wet + branche + praktijk

---

## 🎯 **Use Cases Opgelost**

| **Sector** | **Probleem Voor** | **Oplossing Nu** |
|------------|-------------------|-------------------|
| **Makelaardij** | Alleen wettelijke info | NVM-regels + conflict warning |
| **Advocatuur** | Basis verschoningsrecht | Tuchtregels + praktijk |
| **Zorg** | Algemeen beroepsgeheim | KNMG-specifieke regels |
| **Financieel** | Basis zorgplicht | AFM-compliance details |

---

## 🔮 **Toekomstige Uitbreidingen**

- **Meer branches:** VVAA, VEB, NVWA regels
- **Real-time updates:** Automatische regel updates
- **AI learning:** Betere detectie complexe conflicts
- **Jurisprudentie:** Tuchtrechtelijke uitspraken
- **Regional rules:** Gemeentelijke/provinciale regels

---

*Dit systeem zorgt ervoor dat WetHelder nu de meest complete juridische AI-assistent is voor Nederlandse professional markets.* 