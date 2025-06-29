# 📋 WetHelder Artikel Criteria & Eisen

**Dit document beschrijft alle criteria waaraan artikelen in de Politie & Wet sectie moeten voldoen.**

---

## 🎯 HOOFD-CRITERIA

### 1. **Juridische Criteria**
- ✅ **Brongebaseerde informatie**: Alleen informatie uit officiële bronnen (wetten.overheid.nl, rechtspraak.nl)
- ✅ **Verplichte bronvermelding**: Elke bewering moet een exacte bron hebben
- ✅ **Wettelijke basis eerst**: Begin altijd met de juridische grondslag
- ✅ **Positieve formulering**: "Dit mag mits..." ipv "Dit mag niet tenzij..."
- ✅ **Geen eigen interpretaties**: Alleen directe weergave van bronnen

### 2. **Structuur Criteria**
- ✅ **Duidelijke titel als vraag**: Bijvoorbeeld "Mag de politie mijn identiteit controleren?"
- ✅ **Kort antwoord sectie**: Direct praktisch antwoord bovenaan
- ✅ **Uitgebreide uitleg**: Gedetailleerde juridische basis
- ✅ **Praktisch voorbeeld**: Concreet scenario uit de praktijk
- ✅ **Rechten & plichten**: Wat kan de burger doen
- ✅ **Gerelateerde regelgeving**: Relevante wetten en artikelen
- ✅ **Klachtmogelijkheden**: Waar kan de burger terecht

### 3. **Technische Criteria**
- ✅ **SEO-vriendelijke slug**: Korte, beschrijvende URL
- ✅ **Juiste metadata**: Titel, beschrijving, keywords
- ✅ **Correcte categorisatie**: Juiste Politie & Wet categorie
- ✅ **Responsive design**: Werkt op alle apparaten
- ✅ **"Fout gevonden?" knop**: Contactmogelijkheid onderaan

---

## 📝 VERPLICHTE STRUCTUUR

```markdown
# [Titel als vraag]

## Kort antwoord
[Direct praktisch antwoord in 1-2 zinnen]

## Uitgebreide uitleg
### [Subkopje situatie 1]
[Uitleg met wettelijke basis]

### [Praktijkvoorbeeld]
[Concreet scenario]

### [Wat als situatie X]
[Uitleg consequenties]

## Rechten & plichten van de burger
* Rechten:
  * [Recht 1]
  * [Recht 2]

* Plichten:
  * [Plicht 1]
  * [Plicht 2]

## Wat kun je doen?
[Praktische stappen voor de burger]

## Gerelateerde regelgeving
* [Wet 1] – [Korte uitleg]
* [Wet 2] – [Korte uitleg]

## Belangrijke rechtspraak en beleid
* [Uitspraak 1 met ECLI] – [Uitleg]
* [Uitspraak 2 met ECLI] – [Uitleg]

[Metadata sectie]
```

---

## 🔧 TECHNISCHE VEREISTEN

### 1. **Hyperlinks**
- ✅ **Alleen wetgeving/regelgeving**: Hyperlinks uitsluitend voor artikel- en wetnamen
- ❌ **Geen losse teksten**: Geen hyperlinks voor gewone woorden of zinsdelen
- ✅ **Correcte patronen**: "Artikel 8 Politiewet 2012", "Wetboek van Strafvordering"
- ⚠️ **KRITIEK: Artikel-volgorde NOOIT veranderen**: Altijd "artikel [nummer] [wetboek]" - NOOIT omdraaien naar "[wetboek] artikel [nummer]"! Dit breekt hyperlinks!

### 2. **Opmaak & Styling**
- ❌ **Geen ** tekens**: Alle markdown ** formatting automatisch verwijderen
- ✅ **Schone opmaak**: Gebruik HTML tags of component styling
- ✅ **Consistente formatting**: Dezelfde styling door alle artikelen

### 3. **Layout Optimalisatie**
- ❌ **Geen onnodige witregels**: Maximaal 1 witregel tussen secties
- ✅ **Compacte layout**: Efficiënt gebruik van ruimte
- ✅ **Leesbare structuur**: Duidelijke hiërarchie

---

## 📋 METADATA VEREISTEN

### Verplichte velden:
```typescript
{
  id: "artikel-slug",
  title: "Titel als vraag",
  category: "Juiste categorie",
  description: "SEO beschrijving 150-160 karakters",
  legalBasis: ["Artikel X", "Wet Y"],
  lastUpdated: "DD-MM-YYYY",
  readingTime: "X min lezen"
}
```

### SEO Optimalisatie:
- ✅ **Keywords in titel**: Relevante zoektermen
- ✅ **Meta description**: Beknopte samenvatting
- ✅ **Schema markup**: Juridische artikel structuur

---

## 🎨 CONTENT RICHTLIJNEN

### Toon & Stijl:
- ✅ **Professioneel maar toegankelijk**: Geen juridisch jargon zonder uitleg
- ✅ **Burger-gericht**: Vanuit perspectief van de burger
- ✅ **Objectief en feitelijk**: Geen meningen of interpretaties
- ✅ **Empathisch**: Begripvol voor burger situaties

### Praktische Voorbeelden:
- ✅ **Realistische scenarios**: Herkenbare situaties
- ✅ **Neutrale voorbeelden**: Geen politieke of gevoelige onderwerpen
- ✅ **Concrete details**: Specifieke omstandigheden
- ✅ **Duidelijke uitkomst**: Wat er gebeurt in het voorbeeld

---

## ⚠️ BELANGRIJKE DISCLAIMERS

### Verplichte teksten:
```markdown
**Disclaimer:** Dit artikel bevat algemene juridische informatie en vervangt geen persoonlijk juridisch advies. Voor specifieke situaties raden wij aan om contact op te nemen met een gekwalificeerde jurist of gebruik te maken van ons contactformulier.
```

### BETA Waarschuwing:
```markdown
⚠️ Let op: Deze informatie kan fouten bevatten. Controleer bij twijfel altijd officiële bronnen of raadpleeg een juridisch expert.
```

---

## 🔍 KWALITEITSCONTROLE

### Voor publicatie controleren:
1. ✅ **Juridische correctheid**: Alle bronnen gecontroleerd
2. ✅ **Hyperlink functionaliteit**: Alle links werken
3. ✅ **Opmaak consistentie**: Geen ** tekens of onnodige witregels
4. ✅ **Mobile responsiveness**: Goed leesbaar op telefoon
5. ✅ **SEO optimalisatie**: Meta tags en keywords correct
6. ✅ **Categorisatie**: Juist ingedeeld in Politie & Wet structuur

### Post-publicatie monitoring:
- 📊 **Gebruiksfeedback**: "Fout gevonden?" responses
- 🔄 **Regelmatige updates**: Minimaal jaarlijks reviewen
- 📈 **Performance tracking**: Leestijd en engagement

---

## 📁 BESTANDSSTRUCTUUR

```
app/politie-wet/artikel/[slug]/
├── page.tsx (artikel content)
├── metadata.ts (SEO data)
└── components/ (specifieke componenten)

lib/politie-wet-data.ts (artikel database)
components/ui/ (herbruikbare componenten)
```

---

**Laatste update:** 28 december 2024  
**Versie:** 1.0  
**Status:** Actief - toegepast op alle Politie & Wet artikelen 