# Google Custom Search API Setup voor WetHelder.nl

## Overzicht
WetHelder.nl gebruikt een intelligente routing-strategie die eerst zoekt in lokale JSON bronnen en vervolgens Google Custom Search API raadpleegt voor aanvullende officiële bronnen.

## Benodigde Environment Variables

```bash
# Google Custom Search API
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_custom_search_engine_id_here
```

## Setup Instructies

### Stap 1: Google API Key aanmaken
1. Ga naar [Google Cloud Console](https://console.developers.google.com/)
2. Maak een nieuw project of selecteer bestaand project
3. Ga naar "APIs & Services" > "Library"
4. Zoek naar "Custom Search API" en activeer deze
5. Ga naar "APIs & Services" > "Credentials"
6. Klik "Create Credentials" > "API Key"
7. Kopieer de API Key naar `GOOGLE_API_KEY`

### Stap 2: Custom Search Engine aanmaken
1. Ga naar [Google Custom Search Engine](https://cse.google.com/)
2. Klik "Add" om een nieuwe search engine te maken
3. Voeg de volgende officiële Nederlandse bronnen toe:

#### Verplichte Bronnen:
- `wetten.overheid.nl` - Nederlandse wetgeving
- `rechtspraak.nl` - Nederlandse jurisprudentie  
- `overheid.nl` - Algemene overheidsinformatie
- `belastingdienst.nl` - Belastingwetgeving
- `uwv.nl` - Sociale zekerheid
- `politie.nl` - Politie informatie
- `rijksoverheid.nl` - Rijksoverheid
- `cbr.nl` - Verkeerswetgeving
- `cbs.nl` - Statistieken

#### Optionele Aanvullende Bronnen:
- `acm.nl` - Autoriteit Consument & Markt
- `afm.nl` - Autoriteit Financiële Markten
- `dnb.nl` - De Nederlandsche Bank
- `kvk.nl` - Kamer van Koophandel
- `autoriteitpersoonsgegevens.nl` - Privacy wetgeving

4. Stel de search engine in op "Search the entire web but emphasize included sites"
5. Kopieer de Search Engine ID naar `GOOGLE_SEARCH_ENGINE_ID`

## Routing Logica

### STAP 1: JSON Bronnen Check
Het systeem controleert eerst `data/officiele_bronnen.json` voor directe matches.

### STAP 2: Google API Beslissing
Google API wordt geraadpleegd als:
- Geen JSON matches gevonden
- Minder dan 3 relevante JSON bronnen
- Query bevat keywords: `apv`, `gemeentelijk`, `lokaal`, `nieuw beleid`, `recent`, `actueel`, `jurisprudentie`, `uitspraak`, `vonnis`, `arrest`

### STAP 3: Google Custom Search
Zoekt uitsluitend binnen de geconfigureerde officiële bronnen.

### STAP 4: ChatGPT Input
Combineert JSON bronnen + Google resultaten voor accurate, brongestuurde antwoorden.

## Voordelen van deze Aanpak

1. **Snelheid**: Lokale JSON bronnen worden eerst gecontroleerd
2. **Nauwkeurigheid**: Alleen officiële bronnen worden geraadpleegd
3. **Volledigheid**: Google API vult gaten op in lokale bronnen
4. **Kostenefficiëntie**: Google API alleen wanneer nodig
5. **Bronverificatie**: Alle antwoorden zijn gebaseerd op officiële bronnen

## Testing

Test de configuratie met:
```bash
# In de browser console of via API test
POST /api/ask
{
  "question": "Wat zijn de bevoegdheden van de politie?",
  "profession": "politieagent"
}
```

De logs tonen welke stappen worden doorlopen:
- `📋 STAP 1: Controle officiele_bronnen.json`
- `🔍 STAP 2: Evaluatie Google API noodzaak`
- `🌐 STAP 3: Google Custom Search API wordt geraadpleegd` (indien nodig)
- `🤖 STAP 4: Input samenstelling voor ChatGPT`

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
GOOGLE_SEARCH_ENGINE_ID=your_custom_search_engine_id_here
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
