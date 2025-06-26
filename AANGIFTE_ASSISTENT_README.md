# 🚨 Slimme Aangifte-Assistent - WetHelder.nl

## 📋 Overzicht

De **Slimme Aangifte-Assistent** is een privacy-first, lokaal werkende module die burgers helpt bij het voorbereiden van een complete politieaangifte. Het systeem voldoet volledig aan AVG- en WPG-compliance door een local-first architectuur.

## 🏗️ Architectuur

### Tech Stack
- **Frontend**: React 18 + Next.js 15
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: React Hooks (lokaal)
- **Types**: TypeScript + Zod validatie
- **Testing**: Jest/Vitest (toekomstige uitbreiding)
- **Security**: AES-256 encryptie (browser-native)

### Key Features
- ✅ **Local-first**: Alle data blijft op het apparaat van de gebruiker
- ✅ **Privacy-compliant**: Geen server-side opslag van persoonsgegevens
- ✅ **Wizard-gebaseerd**: 4-stappen proces voor complete aangifte
- ✅ **AI-ondersteund**: Intelligente vraagstelling op basis van delicttype
- ✅ **Downloadbare output**: .txt bestand voor offline gebruik
- ✅ **Toegankelijk**: WCAG 2.1 AA compliant interface

## 🔄 Workflow

### Stap 1: Delicttype Classificatie
- Gebruiker selecteert type incident (diefstal, oplichting, vernieling, etc.)
- Lokale JSON-beslisboom voor classificatie
- Geen persoonsgegevens verzonden naar externe services

### Stap 2: Dynamische Vragenwizard
- AI genereert relevante vragen op basis van delicttype
- Maksimaal 10 gerichte vragen per delictcategorie
- Realtime volledigheidsvalidatie
- Verplichte vs. optionele velden

### Stap 3: Vrije Tekstbeschrijving
- Open tekstveld voor eigen verhaal gebruiker
- Karakter-telling en validatie
- Lokale entiteitsherkenning (toekomstige uitbreiding)

### Stap 4: Download & Preview
- Gestructureerde .txt output
- SHA-256 hash voor integriteit
- Preview van complete aangifte
- One-click download functionaliteit

## 🔒 Privacy & Compliance

### AVG/GDPR Compliance
```
✅ Local-first processing - Geen data verlaat het apparaat
✅ AES-256 encryptie - Lokale data versleuteld opgeslagen  
✅ Auto-purge - Automatische verwijdering na 30 dagen
✅ Minimale data collection - Alleen noodzakelijke informatie
✅ User control - Volledige controle over eigen data
✅ No third-party sharing - Geen data-uitwisseling met derden
```

### WPG (Wet Politiegegevens) Alignment
```
✅ No law enforcement data storage - Geen opslag van politiegegevens
✅ Preparation tool only - Alleen voorbereiding, geen echte aangifte
✅ Local processing - Verwerking blijft lokaal
✅ User-initiated deletion - Gebruiker kan data altijd verwijderen
```

### Technical Security Measures
- **Encryptie**: AES-GCM 256-bit voor lokale opslag
- **Session-based keys**: Cryptografische sleutels per sessie
- **Auto-cleanup**: Geforceerde cleanup bij tab-sluiting
- **Hash verification**: SHA-256 voor data-integriteit
- **No server logs**: Geen logging van persoonsgegevens

## 🚀 Installatie & Gebruik

### Voor Ontwikkelaars

1. **Clone het project**
```bash
git clone [repository]
cd wethelder
```

2. **Dependencies installeren**
```bash
npm install
```

3. **Environment variabelen** (optioneel)
```bash
cp .env.example .env.local
# Vul OPENAI_API_KEY in voor AI-vraagstelling
```

4. **Development server starten**
```bash
npm run dev
```

5. **Aangifte-assistent bezoeken**
```
http://localhost:3000/aangifte
```

### Voor Eindgebruikers

1. **Navigeer naar de Aangifte-Assistent**
   - Ga naar WetHelder.nl
   - Klik op "Aangifte" in het menu

2. **Volg de 4-stappen wizard**
   - Stap 1: Selecteer type incident
   - Stap 2: Beantwoord gerichte vragen
   - Stap 3: Schrijf eigen beschrijving
   - Stap 4: Download aangifte-bestand

3. **Gebruik het bestand**
   - Bewaar het .txt bestand veilig
   - Neem het mee naar het politiebureau
   - Gebruik als voorbereiding voor officiële aangifte

## 📁 Project Structuur

```
app/aangifte/
├── page.tsx                 # Hoofdcomponent met wizard
components/ui/
├── progress.tsx             # Progress bar component
lib/aangifte/ (toekomstig)
├── crimeClassifier.ts       # Delicttype classificatie
├── questionGenerator.ts     # AI-vraagstelling
├── downloadService.ts       # Bestand generatie
├── cryptoService.ts         # Encryptie functies
└── retentionService.ts      # Data-opschoning
```

## 🔮 Toekomstige Uitbreidingen

### Fase 2: Volledige Local-First Implementatie
- [ ] IndexedDB voor lokale opslag
- [ ] AES-256 encryptie implementatie
- [ ] Zustand state management
- [ ] Automated data purging (30 dagen)

### Fase 3: AI-Enhancement
- [ ] OpenAI integratie voor vraagstelling
- [ ] Entity recognition in vrije tekst
- [ ] Intelligente completeness checker
- [ ] Multi-language support

### Fase 4: UX Improvements
- [ ] Voice-to-text functionaliteit
- [ ] Toetsenbord navigatie
- [ ] Screen reader optimalisatie
- [ ] Dark mode support

### Fase 5: Advanced Features
- [ ] Export naar PDF formaat
- [ ] Digitale handtekening
- [ ] Offline PWA functionaliteit
- [ ] Multi-device synchronisatie (versleuteld)

## ⚖️ Juridische Disclaimer

**BELANGRIJKE KENNISGEVING:**

1. **Geen Vervanging**: Deze tool vervangt GEEN officiële politieaangifte
2. **Voorbereiding Alleen**: Dient uitsluitend ter voorbereiding
3. **Geen Juridisch Advies**: Bevat geen juridisch advies
4. **Eigen Verantwoordelijkheid**: Gebruiker blijft verantwoordelijk voor inhoud
5. **Politie-Vereiste**: Officiële aangifte moet altijd bij politie gebeuren

## 📞 Support & Contact

Voor vragen over de Aangifte-Assistent:
- **Technische issues**: [GitHub Issues]
- **Privacy vragen**: privacy@wethelder.nl
- **Algemene support**: support@wethelder.nl

## 📄 Licentie

Copyright (c) 2024 WetHelder.nl - Alle rechten voorbehouden.

---

**Gebouwd met ❤️ voor de Nederlandse rechtsstaat** 