# 🚨 KRITIEKE GOOGLE API SETUP VOOR BETROUWBAARHEID

## ❌ Huidige Status: "Google CSE credentials not configured"

Zonder Google API kan WetHelder **GEEN** wetteksten valideren tegen officiële bronnen zoals wetten.overheid.nl. Dit is de hoofdoorzaak van onbetrouwbare antwoorden.

## ⚡ SNELLE OPLOSSING (15 minuten)

### STAP 1: Google Cloud Project
1. Ga naar: https://console.cloud.google.com/
2. Maak nieuw project: "WetHelder-Validation"
3. Noteer **Project ID**

### STAP 2: Custom Search API Activeren
1. In Google Cloud Console → APIs & Services → Library
2. Zoek: "Custom Search API" 
3. Klik **ENABLE**

### STAP 3: API Key Maken
1. APIs & Services → Credentials
2. **+ CREATE CREDENTIALS** → API Key
3. Kopieer de key (begint met `AIza...`)

### STAP 4: Custom Search Engine
1. Ga naar: https://cse.google.com/cse/
2. **Add** nieuwe search engine
3. **Sites to search:**
   ```
   wetten.overheid.nl
   uitspraken.rechtspraak.nl
   lokaleregelgeving.overheid.nl
   ```
4. **Name:** WetHelder Juridische Bronnen
5. **Create** → Kopieer **Search Engine ID** (cx-parameter)

### STAP 5: Environment Configuratie
Maak `.env` bestand in root directory:
```bash
# Vul in met jouw waardes:
GOOGLE_API_KEY=AIza...your-api-key-here
GOOGLE_CSE_ID=c6739...your-search-engine-id

# Overige vereiste variabelen:
OPENAI_API_KEY=sk-your-openai-api-key
DATABASE_URL=postgresql://username:password@localhost:5432/wethelder
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-random-secret
```

### STAP 6: Test
Herstart de applicatie en test met: "artikel 447e strafrecht"

Je zou deze logs moeten zien:
```
🌐 Searching Google Custom Search API for: artikel 447e strafrecht
✅ X Google zoekresultaten gevonden
```

## 🎯 WAAROM DIT KRITIEK IS

**ZONDER Google API:**
- ❌ Geen validatie tegen officiële bronnen
- ❌ Verouderde of incorrecte wetteksten mogelijk
- ❌ Onbetrouwbare juridische informatie

**MET Google API:**
- ✅ Automatische validatie tegen wetten.overheid.nl
- ✅ Actuele wetteksten en jurisprudentie
- ✅ Betrouwbare juridische antwoorden

## 💰 Kosten

Google Custom Search API:
- Gratis: 100 zoekopdrachten/dag
- Betaald: $5 per 1000 extra zoekopdrachten

Voor normale ontwikkeling is gratis voldoende.

## 🔧 Troubleshooting

**"API key invalid":** Controleer of Custom Search API enabled is
**"Search engine not found":** Controleer GOOGLE_CSE_ID
**"Quota exceeded":** Wacht tot volgende dag of upgrade naar betaald plan

## ⚡ SNELLE VERIFICATIE

Na setup, run dit in terminal:
```bash
curl "https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_CSE_ID&q=artikel%20447e%20strafrecht"
```

Als dit JSON resultaten geeft, werkt de configuratie! 