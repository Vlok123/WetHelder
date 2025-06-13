# 📚 Bronnen Document Upload Instructies

## Overzicht

WetHelder ondersteunt nu aangepaste bronnen uit je eigen Word document. Dit document wordt geïntegreerd in het systeem en gebruikt als aanvullende bron voor juridische vragen.

## 🎯 Waar plaats je je bronnen document?

### Optie 1: Data Directory (Aanbevolen)
```
/data/bronnen-document.docx
```

**Stappen:**
1. Plaats je Word document in de `data/` directory
2. Hernoem het bestand naar `bronnen-document.docx`
3. Het systeem detecteert automatisch het document

### Optie 2: Handmatige JSON Conversie
```
/data/custom-sources.json
```

## 📋 Vereiste Structuur van je Word Document

Je Word document moet de volgende structuur hebben:

### Voorbeeld Structuur:
```
BRON 1: Wetten.overheid.nl
URL: https://wetten.overheid.nl
Beschrijving: Officiële Nederlandse wetgeving
Categorie: Wetgeving
Betrouwbaarheid: Hoog
Trefwoorden: wet, wetgeving, artikel, burgerlijk wetboek, strafrecht

BRON 2: Rechtspraak.nl
URL: https://uitspraken.rechtspraak.nl
Beschrijving: Nederlandse jurisprudentie en uitspraken
Categorie: Jurisprudentie
Betrouwbaarheid: Hoog
Trefwoorden: uitspraak, vonnis, arrest, rechtbank, hof

BRON 3: [Naam van je bron]
URL: [URL van de bron]
Beschrijving: [Korte beschrijving van wat deze bron bevat]
Categorie: [Wetgeving/Jurisprudentie/Beleid/Praktijk/etc.]
Betrouwbaarheid: [Hoog/Middel/Laag]
Trefwoorden: [komma gescheiden lijst van relevante zoektermen]
```

## 🔧 Handmatige JSON Conversie

Als je direct een JSON bestand wilt maken, gebruik dan deze structuur:

```json
[
  {
    "id": "unieke-id-1",
    "naam": "Naam van de Bron",
    "url": "https://example.com",
    "beschrijving": "Beschrijving van wat deze bron bevat",
    "categorie": "Wetgeving",
    "betrouwbaarheid": "hoog",
    "laatstGecontroleerd": "2024-01-01T00:00:00.000Z",
    "trefwoorden": ["trefwoord1", "trefwoord2", "trefwoord3"]
  }
]
```

### Betrouwbaarheidsniveaus:
- **"hoog"** 🟢 - Officiële overheidsbronnen, wetgeving
- **"middel"** 🟡 - Professionele juridische websites, vakbladen
- **"laag"** 🔴 - Algemene informatiesites, blogs

## 🚀 Hoe het systeem je bronnen gebruikt

### Automatische Integratie
1. **Zoekfunctie**: Het systeem zoekt automatisch in je aangepaste bronnen
2. **Relevantie**: Bronnen worden gesorteerd op betrouwbaarheid en relevantie
3. **Weergave**: Bronnen worden getoond met betrouwbaarheidsindicatoren

### Voorbeeld Output:
```
🟢 Wetten.overheid.nl: https://wetten.overheid.nl - Officiële Nederlandse wetgeving
🟡 Juridisch Vakblad: https://example.com - Professionele juridische artikelen
🔴 Algemene Info: https://example.com - Algemene juridische informatie
```

## 📁 Bestandslocaties

```
WetHelder/
├── data/
│   ├── bronnen-document.docx    # Je Word document hier plaatsen
│   ├── custom-sources.json      # Automatisch gegenereerd JSON bestand
│   └── bonnenboekje.pdf         # Bestaand bestand
├── lib/
│   ├── customSources.ts         # Nieuwe bronnen integratie
│   └── officialSources.ts       # Bestaande officiële bronnen
└── app/api/ask/route.ts         # Hoofdsysteem (aangepast)
```

## 🔄 Bronnen Beheer

### Bronnen Validatie
Het systeem controleert automatisch:
- ✅ Of URLs bereikbaar zijn
- ✅ Of de JSON structuur correct is
- ✅ Of alle vereiste velden aanwezig zijn

### Bronnen Updaten
1. **Word Document**: Bewerk je Word document en plaats het opnieuw
2. **JSON Direct**: Bewerk het `custom-sources.json` bestand direct
3. **Automatische Reload**: Het systeem laadt nieuwe bronnen automatisch

## 🛠️ Technische Details

### API Integratie
Je bronnen worden geïntegreerd in:
- `/api/ask` - Hoofdvraag endpoint
- Zoekfunctionaliteit
- Bronverificatie systeem

### Performance
- Bronnen worden gecached voor snelle toegang
- Validatie gebeurt asynchroon
- Fallback naar standaard bronnen bij problemen

## 📞 Support

### Problemen met Upload?
1. **Controleer bestandsnaam**: Moet exact `bronnen-document.docx` zijn
2. **Controleer locatie**: Moet in `/data/` directory staan
3. **Controleer structuur**: Volg de voorgeschreven format
4. **Check logs**: Kijk in de console voor foutmeldingen

### Veelgestelde Vragen

**Q: Kan ik meerdere Word documenten uploaden?**
A: Momenteel ondersteunt het systeem één hoofddocument. Je kunt wel meerdere bronnen in één document plaatsen.

**Q: Worden mijn bronnen automatisch gevalideerd?**
A: Ja, het systeem controleert automatisch of URLs bereikbaar zijn en toont waarschuwingen bij problemen.

**Q: Kan ik de betrouwbaarheid van bronnen aanpassen?**
A: Ja, bewerk het `betrouwbaarheid` veld in je document of JSON bestand.

**Q: Hoe vaak worden bronnen geüpdatet?**
A: Bronnen worden geladen bij elke vraag. Voor performance wordt er gecached, maar updates zijn direct zichtbaar.

## 🎉 Klaar!

Je aangepaste bronnen zijn nu geïntegreerd in WetHelder en worden automatisch gebruikt bij het beantwoorden van juridische vragen. Het systeem geeft prioriteit aan betrouwbare bronnen en toont duidelijk welke bronnen zijn gebruikt. 