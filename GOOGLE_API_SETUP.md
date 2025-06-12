# 🔍 Google Custom Search API Setup voor WetHelder

## 🚀 Nieuwe Geverifieerde Bronnen Workflow

WetHelder gebruikt nu een verbeterde workflow voor betrouwbare juridische antwoorden:

### **Workflow Stappen:**

1️⃣ **Gebruiker stelt vraag**
   - Vraag wordt ontvangen via de `/ask` interface

2️⃣ **Zoeken op geverifieerde bronnen**
   - Google Custom Search API zoekt parallel op:
     - `wetten.overheid.nl` (Nederlandse wetgeving)
     - `uitspraken.rechtspraak.nl` (Jurisprudentie)
     - `tuchtrecht.overheid.nl` (Tuchtrecht)
     - `boetebase.om.nl` (Boetes en sancties)
     - `overheid.nl` (Algemene overheidsinformatie)

3️⃣ **Filteren van resultaten**
   - Alleen resultaten van geverifieerde bronnen
   - Snippets en samenvattingen worden geëxtraheerd
   - Duplicaten worden verwijderd

4️⃣ **ChatGPT met strikte instructies**
   - Prompt: "Beantwoord uitsluitend op basis van onderstaande fragmenten"
   - Verplichte bronverwijzingen bij elke bewering
   - Geen toevoeging van eigen kennis

5️⃣ **Betrouwbaar, snel, up-to-date antwoord**
   - Antwoord gebaseerd op officiële bronnen
   - Expliciete bronverwijzingen
   - Disclaimer over professioneel juridisch advies

## 🔧 Google Cloud Console Setup

### Stap 1: Google Cloud Project
1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Maak een nieuw project of selecteer bestaand project
3. Noteer je **Project ID**

### Stap 2: Custom Search Engine (CSE)
1. Ga naar [Google Custom Search](https://cse.google.com/cse/)
2. Klik "Add" om nieuwe search engine te maken
3. **Sites to search:** Voeg toe:
   ```
   wetten.overheid.nl
   uitspraken.rechtspraak.nl
   tuchtrecht.overheid.nl
   boetebase.om.nl
   overheid.nl
   ```
4. **Name:** WetHelder Juridische Bronnen
5. Klik "Create"
6. Noteer je **Search Engine ID** (cx parameter)

### Stap 3: API Key
1. Ga naar [Google Cloud Console APIs](https://console.cloud.google.com/apis/)
2. Klik "Enable APIs and Services"
3. Zoek en enable "Custom Search API"
4. Ga naar "Credentials" → "Create Credentials" → "API Key"
5. **Restrict API Key:**
   - Application restrictions: None (of HTTP referrers voor productie)
   - API restrictions: Custom Search API
6. Noteer je **API Key**

## 🔐 Environment Variables

Voeg toe aan je `.env.local`:

```bash
# Google Custom Search API
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CSE_ID=your_custom_search_engine_id_here
```

## 📊 Usage & Limits

- **Gratis tier:** 100 zoekopdrachten per dag
- **Betaald:** $5 per 1000 extra zoekopdrachten
- **Rate limit:** 10 queries per seconde
- **Resultaten:** Max 10 per zoekopdracht

## 🧪 Testing

### Test de API direct:
```bash
curl -X POST "http://localhost:3000/api/ask" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Wat is artikel 6:162 BW?",
    "profession": "algemeen",
    "useGoogleSearch": true
  }'
```

### Test via UI:
1. Ga naar `http://localhost:3000/ask`
2. Stel een juridische vraag
3. Controleer of bronverwijzingen worden getoond

## 🔍 Workflow Details

### Geverifieerde Bronnen
- **wetten.overheid.nl**: Nederlandse wetgeving en regelgeving
- **rechtspraak.nl**: Uitspraken van Nederlandse rechtbanken
- **tuchtrecht.overheid.nl**: Tuchtrechtelijke uitspraken
- **boetebase.om.nl**: Informatie over boetes en sancties
- **overheid.nl**: Algemene overheidsinformatie

### Kwaliteitscontrole
- Alleen officiële Nederlandse juridische bronnen
- Strikte ChatGPT instructies tegen hallucinatie
- Verplichte bronverwijzingen
- Fallback naar normale workflow bij geen resultaten

### Performance
- Parallelle zoekopdrachten voor snelheid
- Max 5 resultaten per bron
- Timeout van 5 seconden per bron
- Graceful fallback bij API problemen

## 🚨 Troubleshooting

### Geen resultaten
- Controleer API key en CSE ID
- Verificeer dat Custom Search API is enabled
- Check quota limits in Google Cloud Console

### API Errors
- 403: API key incorrect of quota exceeded
- 400: Malformed request
- 429: Rate limit exceeded

### Fallback Behavior
- Bij Google API problemen: normale ChatGPT response
- Bij geen zoekresultaten: normale ChatGPT response
- Bij timeout: normale ChatGPT response

## 📈 Monitoring

Monitor je usage in:
- [Google Cloud Console](https://console.cloud.google.com/apis/dashboard)
- [Custom Search Console](https://cse.google.com/cse/)

## 🔄 Updates

De workflow is ontworpen voor:
- **Betrouwbaarheid**: Alleen geverifieerde bronnen
- **Snelheid**: Parallelle zoekopdrachten
- **Accuraatheid**: Strikte ChatGPT instructies
- **Transparantie**: Expliciete bronverwijzingen

---

**Gemaakt voor WetHelder - Nederlandse Juridische AI Assistent**
