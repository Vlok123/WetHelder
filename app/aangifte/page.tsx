'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { 
  FileText, 
  Shield, 
  Download, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Eye,
  Clock,
  Trash2,
  Info,
  Loader2,
  Search
} from 'lucide-react'
import Link from 'next/link'

// Types
interface DelictType {
  id: string
  naam: string
  beschrijving: string
  categorie: string
  juridischeBasis: string
  bestanddelen: string[]
}

interface Vraag {
  id: string
  tekst: string
  hint?: string
  verplicht: boolean
  type: 'tekst' | 'langeTekst' | 'datum' | 'tijd'
}

interface AnalyseResultaat {
  ontbrekendeElementen: string[]
  aanvullendeVragen: string[]
  aanbevelingen: string[]
  juridischeKwaliteit: 'goed' | 'voldoende' | 'onvoldoende'
}

interface AngifteGegevens {
  delictType?: DelictType
  antwoorden: Record<string, string>
  vrijeTekst: string
  voltooideStappen: number
  gegenereerdeAangifte?: string
  isGenererend?: boolean
  aangepastDelict?: DelictType
  aangepassteVragen?: Vraag[]
  zoekopdracht?: string
  analyseResultaat?: AnalyseResultaat
  isAnalyseren?: boolean
}

// Nederlandse delicttypen met juridische basis
const delictTypen: DelictType[] = [
  {
    id: 'diefstal',
    naam: 'Diefstal',
    beschrijving: 'Het wegnemen van een goed dat geheel of ten dele aan een ander toebehoort',
    categorie: 'vermogensdelict',
    juridischeBasis: 'Artikel 310 Wetboek van Strafrecht',
    bestanddelen: ['wegneming', 'goed van een ander', 'oogmerk van wederrechtelijke toeëigening']
  },
  {
    id: 'oplichting',
    naam: 'Oplichting',
    beschrijving: 'Het door misleiding bewegen van iemand tot de afgifte van een goed',
    categorie: 'vermogensdelict',
    juridischeBasis: 'Artikel 326 Wetboek van Strafrecht',
    bestanddelen: ['misleiding', 'bewegen tot afgifte', 'goed', 'opzet tot wederrechtelijk voordeel']
  },
  {
    id: 'vernieling',
    naam: 'Vernieling',
    beschrijving: 'Het opzettelijk en wederrechtelijk vernielen van een goed van een ander',
    categorie: 'vermogensdelict',
    juridischeBasis: 'Artikel 350 Wetboek van Strafrecht',
    bestanddelen: ['opzet', 'vernieling/beschadiging', 'goed van een ander', 'wederrechtelijkheid']
  },
  {
    id: 'mishandeling',
    naam: 'Mishandeling',
    beschrijving: 'Het opzettelijk toebrengen van lichamelijk letsel',
    categorie: 'geweldsdelict',
    juridischeBasis: 'Artikel 300 Wetboek van Strafrecht',
    bestanddelen: ['opzet', 'lichamelijk letsel', 'toebrengen van geweld']
  },
  {
    id: 'bedreiging',
    naam: 'Bedreiging',
    beschrijving: 'Het bedreigen met geweld tegen persoon of eigendom',
    categorie: 'geweldsdelict',
    juridischeBasis: 'Artikel 285 Wetboek van Strafrecht',
    bestanddelen: ['bedreiging', 'geweld tegen persoon of goed', 'voorwaardelijk opzet']
  },
  {
    id: 'anders',
    naam: 'Anders / Zelf opzoeken',
    beschrijving: 'Het delict staat niet in de lijst hierboven',
    categorie: 'overig',
    juridischeBasis: 'Wordt automatisch opgezocht',
    bestanddelen: ['wordt automatisch bepaald']
  }
]

// Nederlandse vragen per delicttype
const vragenPerDelict: Record<string, Vraag[]> = {
  diefstal: [
    {
      id: 'wanneer',
      tekst: 'Wanneer vond de diefstal plaats?',
      hint: 'Datum en tijdstip zo nauwkeurig mogelijk (bijv. 15 januari 2024, tussen 14:00 en 16:00)',
      verplicht: true,
      type: 'tekst'
    },
    {
      id: 'waar',
      tekst: 'Waar vond de diefstal plaats?',
      hint: 'Volledig adres of locatiebeschrijving (bijv. Hoofdstraat 123, 1234 AB Amsterdam)',
      verplicht: true,
      type: 'tekst'
    },
    {
      id: 'wat_gestolen',
      tekst: 'Wat is er gestolen?',
      hint: 'Beschrijf alle gestolen voorwerpen met merk, model, kleur en waarde indien bekend',
      verplicht: true,
      type: 'langeTekst'
    },
    {
      id: 'hoe_weggenomen',
      tekst: 'Hoe zijn de spullen weggenomen?',
      hint: 'Beschrijf de manier waarop de diefstal plaatsvond (bijv. inbraak, zakkenrollerij, etc.)',
      verplicht: true,
      type: 'langeTekst'
    },
    {
      id: 'verdachte',
      tekst: 'Kunt u de verdachte beschrijven?',
      hint: 'Geslacht, geschatte leeftijd, lengte, kleding, bijzondere kenmerken',
      verplicht: false,
      type: 'langeTekst'
    },
    {
      id: 'getuigen',
      tekst: 'Waren er getuigen aanwezig?',
      hint: 'Namen en contactgegevens van eventuele getuigen',
      verplicht: false,
      type: 'langeTekst'
    }
  ],
  oplichting: [
    {
      id: 'wanneer',
      tekst: 'Wanneer vond de oplichting plaats?',
      hint: 'Datum en tijdstip van eerste contact en/of betalingsmoment',
      verplicht: true,
      type: 'tekst'
    },
    {
      id: 'waar',
      tekst: 'Waar vond het contact plaats?',
      hint: 'Online platform, telefonisch, fysieke locatie, etc.',
      verplicht: true,
      type: 'tekst'
    },
    {
      id: 'misleiding',
      tekst: 'Hoe werd u misleid?',
      hint: 'Beschrijf de valse voorwendsels, leugens of misleidende informatie',
      verplicht: true,
      type: 'langeTekst'
    },
    {
      id: 'schade',
      tekst: 'Wat is uw financiële schade?',
      hint: 'Bedrag en wat u heeft afgestaan (geld, goederen, bankgegevens)',
      verplicht: true,
      type: 'langeTekst'
    },
    {
      id: 'verdachte_contact',
      tekst: 'Hoe nam de verdachte contact op?',
      hint: 'Telefoonnummer, e-mailadres, website, sociale media, etc.',
      verplicht: false,
      type: 'langeTekst'
    }
  ],
  vernieling: [
    {
      id: 'wanneer',
      tekst: 'Wanneer werd uw eigendom vernield?',
      hint: 'Datum en tijdstip van de vernieling',
      verplicht: true,
      type: 'tekst'
    },
    {
      id: 'waar',
      tekst: 'Waar gebeurde de vernieling?',
      hint: 'Exacte locatie waar uw eigendom werd beschadigd',
      verplicht: true,
      type: 'tekst'
    },
    {
      id: 'wat_vernield',
      tekst: 'Wat is er vernield of beschadigd?',
      hint: 'Beschrijf alle beschadigde voorwerpen en de aard van de schade',
      verplicht: true,
      type: 'langeTekst'
    },
    {
      id: 'hoe_vernield',
      tekst: 'Hoe werd uw eigendom vernield?',
      hint: 'Beschrijf hoe de vernieling tot stand kwam',
      verplicht: true,
      type: 'langeTekst'
    },
    {
      id: 'reparatiekosten',
      tekst: 'Wat zijn de geschatte reparatiekosten?',
      hint: 'Bedrag voor herstel of vervanging indien bekend',
      verplicht: false,
      type: 'tekst'
    }
  ],
  mishandeling: [
    {
      id: 'wanneer',
      tekst: 'Wanneer vond de mishandeling plaats?',
      hint: 'Datum en tijdstip van het incident',
      verplicht: true,
      type: 'tekst'
    },
    {
      id: 'waar',
      tekst: 'Waar vond de mishandeling plaats?',
      hint: 'Exacte locatie van het incident',
      verplicht: true,
      type: 'tekst'
    },
    {
      id: 'wat_gebeurd',
      tekst: 'Wat is er precies gebeurd?',
      hint: 'Beschrijf hoe het geweld werd toegepast',
      verplicht: true,
      type: 'langeTekst'
    },
    {
      id: 'letsel',
      tekst: 'Welk letsel heeft u opgelopen?',
      hint: 'Beschrijf alle verwondingen en pijn',
      verplicht: true,
      type: 'langeTekst'
    },
    {
      id: 'medische_hulp',
      tekst: 'Heeft u medische hulp gezocht?',
      hint: 'Ziekenhuis, huisarts, ambulance, etc.',
      verplicht: false,
      type: 'tekst'
    },
    {
      id: 'verdachte',
      tekst: 'Kunt u de verdachte beschrijven?',
      hint: 'Signalement en eventuele relatie tot u',
      verplicht: false,
      type: 'langeTekst'
    }
  ],
  bedreiging: [
    {
      id: 'wanneer',
      tekst: 'Wanneer werd u bedreigd?',
      hint: 'Datum en tijdstip van de bedreiging',
      verplicht: true,
      type: 'tekst'
    },
    {
      id: 'waar',
      tekst: 'Waar vond de bedreiging plaats?',
      hint: 'Locatie of communicatiemiddel (telefoon, internet, etc.)',
      verplicht: true,
      type: 'tekst'
    },
    {
      id: 'bedreiging_inhoud',
      tekst: 'Wat werd er precies gezegd of gedaan?',
      hint: 'Woordelijke bedreigingen of dreigende handelingen',
      verplicht: true,
      type: 'langeTekst'
    },
    {
      id: 'ernst',
      tekst: 'Hoe serieus nam u de bedreiging?',
      hint: 'Uw gevoelens van angst en waarom u de bedreiging serieus nam',
      verplicht: true,
      type: 'langeTekst'
    },
    {
      id: 'verdachte_bekend',
      tekst: 'Kent u de persoon die u bedreigde?',
      hint: 'Relatie tot verdachte en eventuele voorgeschiedenis',
      verplicht: false,
      type: 'langeTekst'
    }
  ],

}

// Analyseer juridische volledigheid van de aangifte
  const analyseJuridischeVolledigheid = async (gegevens: AngifteGegevens): Promise<AnalyseResultaat> => {
    const effectiefDelict = gegevens.aangepastDelict || gegevens.delictType
    const effectieveVragen = gegevens.aangepassteVragen || 
      (gegevens.delictType ? vragenPerDelict[gegevens.delictType.id] || [] : [])
    
    // Verzamel alle beschikbare informatie
    const alleInformatie = {
      delictType: effectiefDelict?.naam,
      juridischeBasis: effectiefDelict?.juridischeBasis,
      bestanddelen: effectiefDelict?.bestanddelen,
      antwoorden: gegevens.antwoorden,
      vrijeTekst: gegevens.vrijeTekst,
      vragen: effectieveVragen.map(v => ({ tekst: v.tekst, antwoord: gegevens.antwoorden[v.id] }))
    }

    try {
      const response = await fetch('/api/debug-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Analyseer de juridische volledigheid van deze aangifte. Controleer ALLE beschikbare informatie uit zowel de beantwoorde vragen als de vrije tekst. Beoordeel of alle belangrijke juridische elementen aanwezig zijn en stel concrete aanvullende vragen voor waar informatie ontbreekt.

DELICTTYPE: ${alleInformatie.delictType}
JURIDISCHE BASIS: ${alleInformatie.juridischeBasis}
BESTANDDELEN: ${alleInformatie.bestanddelen?.join(', ')}

ALLE BEANTWOORDE VRAGEN (gebruik deze informatie!):
${alleInformatie.vragen.map(v => `${v.tekst}: ${v.antwoord || '[Niet beantwoord]'}`).join('\n')}

AANVULLENDE VRIJE TEKST:
${alleInformatie.vrijeTekst}

INSTRUCTIES:
- Bekijk ALLE informatie hierboven (zowel vragen als vrije tekst)
- Vraag ALLEEN naar informatie die NERGENS te vinden is
- Als informatie al ergens genoemd wordt, markeer dit NIET als ontbrekend
- Focus op juridisch essentiële elementen voor een sterke aangifte

Geef een analyse in exact dit JSON formaat (geen extra tekst):
{
  "ontbrekendeElementen": ["alleen elementen die NERGENS in de hele aangifte te vinden zijn"],
  "aanvullendeVragen": ["alleen vragen over informatie die NERGENS genoemd wordt"],
  "aanbevelingen": ["concrete tips om de aangifte te verbeteren"],
  "juridischeKwaliteit": "goed|voldoende|onvoldoende"
}

SPECIFIEKE AANDACHTSPUNTEN PER DELICTTYPE:
- Bij WhatsApp/telefoonfraude: telefoonnummer verdachte, screenshots, betalingsgegevens
- Bij mishandeling: aard en ernst letsel, medische behandeling, getuigen, relatie tot dader
- Bij vernieling: staat van het goed vóór beschadiging, reparatiekosten/waarde, fotobewijs
- Bij diefstal: exacte waarde gestolen goederen, serienummers, beveiligingsmaatregelen
- Bij oplichting: exacte misleiding, betalingsmethode, communicatiekanalen
- Bij bedreiging: exacte bewoordingen, context, ernst van dreiging

Beoordeel de juridische kwaliteit realistisch: 
- "goed" alleen als alle essentiële elementen aanwezig zijn EN geen verdere verbeteringen nodig
- "voldoende" als essentiële elementen aanwezig maar er nog verbeteringen mogelijk zijn
- "onvoldoende" als belangrijke juridische elementen ontbreken`
          }]
        }),
      })

      const data = await response.json()
      
      if (data.response) {
        try {
          // Probeer JSON te parseren uit de respons
          const jsonMatch = data.response.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const analyseData = JSON.parse(jsonMatch[0])
            return {
              ontbrekendeElementen: analyseData.ontbrekendeElementen || [],
              aanvullendeVragen: analyseData.aanvullendeVragen || [],
              aanbevelingen: analyseData.aanbevelingen || [],
              juridischeKwaliteit: analyseData.juridischeKwaliteit || 'voldoende'
            }
          }
        } catch (parseError) {
          console.error('Fout bij parseren analyse:', parseError)
        }
      }
      
      // Fallback analyse op basis van delicttype
      return generateFallbackAnalyse(gegevens)
      
    } catch (error) {
      console.error('Fout bij juridische analyse:', error)
      return generateFallbackAnalyse(gegevens)
    }
  }

  // Analyseer "Anders" zoekopdracht en genereer aangepast delicttype + vragen
  const analyseAndersZoekopdracht = async (zoekopdracht: string): Promise<{ aangepastDelict: DelictType; aangepassteVragen: Vraag[] }> => {
    try {
      const response = await fetch('/api/debug-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Analyseer deze beschrijving van een mogelijk strafbaar feit en bepaal het juiste delicttype met aangepaste vragen.

BESCHRIJVING VAN GEBRUIKER:
"${zoekopdracht}"

BELANGRIJKE WETSWIJZIGING (SINDS 1 JULI 2024):
STRAATINTIMIDATIE valt vanaf 1 juli 2024 onder het NIEUWE artikel 429ter Sr (NIET meer artikel 266 Sr):
"Degene die in het openbaar een ander indringend seksueel benadert door middel van opmerkingen, gebaren, geluiden of aanrakingen op een wijze die vreesaanjagend, vernederend, kwetsend of onterend is te achten, wordt gestraft met hechtenis van ten hoogste drie maanden of geldboete van de derde categorie."

SPECIFIEKE FRAUDETYPEN:
BANKHELPDESKFRAUDE: Dit is een vorm van oplichting (artikel 326 Sr) waarbij criminelen zich voordoen als bankmedewerkers. Ze benaderen slachtoffers telefonisch, via e-mail, sms of pop-ups en beweren dat er verdachte transacties zijn of dat de rekening beveiligd moet worden. Vaak vragen ze om software te installeren (AnyDesk, TeamViewer) of om persoonlijke gegevens/codes te delen. Dit valt onder oplichting maar vereist specifieke vragen over de modus operandi.

VRIEND-IN-NOOD FRAUDE: Dit is oplichting (artikel 326 Sr) waarbij criminelen zich voordoen als bekenden (zoon, dochter, vriend, familie). Ze benaderen via WhatsApp/SMS met onbekend nummer, beweren telefoon kwijt te zijn, en vragen dringend om geld. Ze misbruiken emotionele band en vertrouwen. Vereist specifieke vragen over identiteitsmisleiding en het misbruik van de vertrouwensrelatie.

INSTRUCTIES:
- Identificeer het meest waarschijnlijke strafbare feit op basis van de beschrijving
- Bepaal de juridische basis (welk wetsartikel)
- Bij straatintimidatie: Gebruik ALTIJD artikel 429ter Sr (vanaf 1 juli 2024)
- Bij bankhelpdeskfraude: Gebruik artikel 326 Sr (oplichting) maar stel specifieke vragen over de fraudemethode
- Bij vriend-in-nood fraude: Gebruik artikel 326 Sr (oplichting) maar focus op identiteitsmisleiding en vertrouwensrelatie
- Bedenk de juridische bestanddelen die bewezen moeten worden
- Genereer ALLE relevante vragen die nodig zijn om alle juridische elementen te verzamelen
- Voor bankhelpdeskfraude: genereer exact 12 specifieke vragen
- Voor vriend-in-nood fraude: genereer exact 10 specifieke vragen  
- Voor straatintimidatie: genereer exact 8 specifieke vragen
- Voor andere delicten: 6-10 vragen afhankelijk van complexiteit

Geef het resultaat in exact dit JSON formaat (geen extra tekst):
{
  "aangepastDelict": {
    "id": "aangepast_delict",
    "naam": "[Naam van het delict, bijv. 'Vriend-in-nood fraude', 'Bankhelpdeskfraude', 'Straatintimidatie', 'Computervredebreuk', 'Huisvredebreuk', 'Stalking']",
    "beschrijving": "[Korte beschrijving van het delict]",
    "categorie": "[vermogensdelict/geweldsdelict/zedenfeit/overig]",
    "juridischeBasis": "[Welk artikel uit welk wetboek, bijv. 'Artikel 429ter Wetboek van Strafrecht (sinds 1 juli 2024)' voor straatintimidatie]",
    "bestanddelen": ["[lijst van juridische bestanddelen die bewezen moeten worden]"]
  },
  "aangepassteVragen": [
    {
      "id": "vraag1",
      "tekst": "[Specifieke vraag over tijd/plaats]",
      "hint": "[Uitleg waarom dit belangrijk is]",
      "verplicht": true,
      "type": "tekst"
    },
    {
      "id": "vraag2", 
      "tekst": "[Specifieke vraag over de handeling/gedraging]",
      "hint": "[Uitleg over juridische relevantie]",
      "verplicht": true,
      "type": "langeTekst"
    },
    {
      "id": "vraag3",
      "tekst": "[Vraag over schade/gevolgen]",
      "hint": "[Waarom dit relevant is voor het delict]",
      "verplicht": true,
      "type": "langeTekst"
    },
    {
      "id": "vraag4",
      "tekst": "[Vraag over verdachte/dader]",
      "hint": "[Belang van daderidentificatie]",
      "verplicht": false,
      "type": "langeTekst"
    },
    {
      "id": "vraag5",
      "tekst": "[Extra relevante vraag indien nodig]",
      "hint": "[Juridische relevantie]",
      "verplicht": false,
      "type": "langeTekst"
    },
    // Voor bankhelpdeskfraude: voeg vraag 6-12 toe
    // Voor vriend-in-nood fraude: voeg vraag 6-10 toe
    // Voor straatintimidatie: voeg vraag 6-8 toe
  ]
}

LET OP:
- Maak de vragen specifiek voor dit delicttype
- Zorg dat alle juridische bestanddelen gedekt worden
- Gebruik begrijpelijke taal, geen juridisch jargon
- Geef praktische hints bij elke vraag
- Voor straatintimidatie: Focus op openbare ruimte, indringend seksueel gedrag, impact op slachtoffer
- Voor bankhelpdeskfraude: Focus op contactwijze, misleiding, software/toegang, gedeelde gegevens, financiële schade
- Voor vriend-in-nood fraude: Focus op contactplatform, identiteitsmisleiding, vertrouwensrelatie, urgentie, financiële schade`
          }]
        }),
      })

      const data = await response.json()
      
      if (data.response) {
        try {
          const jsonMatch = data.response.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const analyseData = JSON.parse(jsonMatch[0])
            return {
              aangepastDelict: analyseData.aangepastDelict,
              aangepassteVragen: analyseData.aangepassteVragen
            }
          }
        } catch (parseError) {
          console.error('Fout bij parseren anders-analyse:', parseError)
        }
      }
      
      // Fallback bij falen van API
      return generateFallbackAndersAnalyse(zoekopdracht)
      
    } catch (error) {
      console.error('Fout bij anders-analyse:', error)
      return generateFallbackAndersAnalyse(zoekopdracht)
    }
  }

  // Fallback voor "anders" analyse
  const generateFallbackAndersAnalyse = (zoekopdracht: string): { aangepastDelict: DelictType; aangepassteVragen: Vraag[] } => {
    // Eenvoudige keyword detectie voor fallback
    const beschrijving = zoekopdracht.toLowerCase()
    
    let delictNaam = 'Onbekend delict'
    let juridischeBasis = 'Nader te bepalen'
    let categorie = 'overig'
    let bestanddelen = ['Strafbaar feit', 'Opzet of schuld', 'Geen rechtvaardigingsgrond']
    
    // Probeer delicttype te raden op basis van keywords
    if (beschrijving.includes('vriend in nood') || beschrijving.includes('vriendinnood') || beschrijving.includes('vriend-in-nood') ||
        (beschrijving.includes('whatsapp') && (beschrijving.includes('oplichting') || beschrijving.includes('fraude') || beschrijving.includes('nep'))) ||
        (beschrijving.includes('whatsapp') && (beschrijving.includes('zoon') || beschrijving.includes('dochter') || beschrijving.includes('kind') || beschrijving.includes('familie'))) ||
        (beschrijving.includes('sms') && (beschrijving.includes('bekende') || beschrijving.includes('familie') || beschrijving.includes('vriend'))) ||
        (beschrijving.includes('nieuw nummer') || beschrijving.includes('telefoon kwijt') || beschrijving.includes('nieuwe telefoon')) && beschrijving.includes('geld') ||
        (beschrijving.includes('dringend') && beschrijving.includes('geld') && (beschrijving.includes('whatsapp') || beschrijving.includes('sms')))) {
      delictNaam = 'Vriend-in-nood fraude'
      juridischeBasis = 'Artikel 326 Wetboek van Strafrecht (Oplichting)'
      categorie = 'vermogensdelict'
      bestanddelen = ['misleiding', 'voorwenden van bekende identiteit', 'bewegen tot afgifte', 'geld/goed', 'opzet tot wederrechtelijk voordeel']
    } else if (beschrijving.includes('bankhelpdeskfraude') || beschrijving.includes('bank helpdesk fraude') ||
        (beschrijving.includes('bank') && (beschrijving.includes('helpdesk') || beschrijving.includes('medewerker') || beschrijving.includes('bellen'))) ||
        (beschrijving.includes('phishing') && beschrijving.includes('bank')) ||
        (beschrijving.includes('nep') && (beschrijving.includes('bank') || beschrijving.includes('medewerker'))) ||
        (beschrijving.includes('teamviewer') || beschrijving.includes('anydesk') || beschrijving.includes('toegang op afstand')) ||
        (beschrijving.includes('software') && beschrijving.includes('installeren') && beschrijving.includes('bank')) ||
        (beschrijving.includes('verdachte transacties') || beschrijving.includes('beveiliging') || beschrijving.includes('veiligstellen'))) {
      delictNaam = 'Bankhelpdeskfraude'
      juridischeBasis = 'Artikel 326 Wetboek van Strafrecht (Oplichting)'
      categorie = 'vermogensdelict'
      bestanddelen = ['misleiding', 'bewegen tot afgifte', 'goed/geld', 'opzet tot wederrechtelijk voordeel', 'gebruik van bankidentiteit']
    } else if (beschrijving.includes('straatintimidatie') || beschrijving.includes('straat intimidatie') || 
        (beschrijving.includes('straat') && (beschrijving.includes('seksueel') || beschrijving.includes('aanranding') || 
        beschrijving.includes('lastigvallen') || beschrijving.includes('nafluiten') || beschrijving.includes('naroepen') ||
        beschrijving.includes('betasten') || beschrijving.includes('intimideren')))) {
      delictNaam = 'Straatintimidatie'
      juridischeBasis = 'Artikel 429ter Wetboek van Strafrecht (sinds 1 juli 2024)'
      categorie = 'zedenfeit'
      bestanddelen = ['in het openbaar', 'indringend seksueel benaderen', 'via opmerkingen/gebaren/geluiden/aanrakingen', 'vreesaanjagend/vernederend/kwetsend/onterend']
    } else if (beschrijving.includes('computer') || beschrijving.includes('internet') || beschrijving.includes('hack')) {
      delictNaam = 'Computervredebreuk'
      juridischeBasis = 'Artikel 138a Wetboek van Strafrecht'
      categorie = 'overig'
      bestanddelen = ['Opzettelijk inbreuk maken', 'Geautomatiseerd werk', 'Wederrechtelijk']
    } else if (beschrijving.includes('stal') || beschrijving.includes('volgen') || beschrijving.includes('achtervolgen')) {
      delictNaam = 'Stalking'
      juridischeBasis = 'Artikel 285b Wetboek van Strafrecht'
      categorie = 'geweldsdelict'
      bestanddelen = ['Wederrechtelijk', 'Stelselmatig', 'Belagen', 'Dwingend gedrag']
    } else if (beschrijving.includes('thuis') || beschrijving.includes('huis') || beschrijving.includes('woning') || beschrijving.includes('binnen')) {
      delictNaam = 'Huisvredebreuk'
      juridischeBasis = 'Artikel 138 Wetboek van Strafrecht'
      categorie = 'overig'
      bestanddelen = ['Wederrechtelijk', 'Binnentreden', 'Besloten plaats', 'Tegen de wil']
    }
    
    const aangepastDelict: DelictType = {
      id: 'aangepast_delict',
      naam: delictNaam,
      beschrijving: `Aangepast delicttype op basis van: ${zoekopdracht.substring(0, 100)}...`,
      categorie,
      juridischeBasis,
      bestanddelen
    }
    
    // Genereer delict-specifieke vragen
    let aangepassteVragen: Vraag[] = []
    
    if (delictNaam === 'Vriend-in-nood fraude') {
      aangepassteVragen = [
        { id: 'hoe_benaderd_bekende', tekst: 'Hoe werd u benaderd door de zogenaamde bekende?', hint: 'Bijv. via WhatsApp, sms, e-mail, Instagram, Facebook', verplicht: true, type: 'langeTekst' },
        { id: 'verhaal_afzender', tekst: 'Wat was het verhaal dat de afzender vertelde?', hint: 'Bijv. telefoon kwijt, betaalpas kapot, spoedbetaling nodig, medische noodsituatie', verplicht: true, type: 'langeTekst' },
        { id: 'dacht_echte_bekende', tekst: 'Dacht u dat u echt met een bekende sprak? Zo ja, met wie dacht u contact te hebben?', hint: 'Naam en relatie: zoon, dochter, vriend, collega', verplicht: true, type: 'langeTekst' },
        { id: 'druk_spoed', tekst: 'Werd er druk uitgeoefend of spoed gesuggereerd bij het overmaken van geld?', hint: 'Bijv. "het moet echt vandaag", "ik zit in nood", "ik kan niemand anders vragen"', verplicht: true, type: 'langeTekst' },
        { id: 'contact_ander_kanaal', tekst: 'Heeft u geprobeerd contact op te nemen met de persoon zelf via een ander kanaal?', hint: 'Bijv. gebeld, voicemail ingesproken, geappt op het oude nummer', verplicht: true, type: 'langeTekst' },
        { id: 'rekeningnummer_bedrag', tekst: 'Op welk rekeningnummer heeft u geld overgemaakt en welk bedrag ging het om?', hint: 'Noteer zoveel mogelijk: rekeningnummer, tenaamstelling, bedrag, datum, tijdstip', verplicht: true, type: 'langeTekst' },
        { id: 'meerdere_keren', tekst: 'Heeft u meerdere keren geld overgemaakt of alleen één keer?', hint: 'Zo ja: geef per transactie details', verplicht: true, type: 'langeTekst' },
        { id: 'wanneer_ontdekt', tekst: 'Wanneer kwam u erachter dat het om oplichting ging? En hoe?', hint: 'Bijv. echte persoon nam contact op, bank waarschuwde, u werd zelf achterdochtig', verplicht: true, type: 'langeTekst' },
        { id: 'account_bekijken', tekst: 'Heeft u het account nog kunnen bekijken nadat u wist dat het nep was?', hint: 'Bijv. profielfoto of naamgebruik noteren, of een screenshot gemaakt?', verplicht: false, type: 'langeTekst' },
        { id: 'melding_bank_persoon', tekst: 'Heeft u inmiddels melding gedaan bij uw bank of de echte persoon ingelicht?', hint: 'Reactie van bank en echte persoon, vervolgacties', verplicht: false, type: 'langeTekst' }
      ]
    } else if (delictNaam === 'Bankhelpdeskfraude') {
      aangepassteVragen = [
        { id: 'hoe_benaderd', tekst: 'Hoe werd u benaderd door de zogenaamde bankmedewerker?', hint: 'Bijvoorbeeld telefonisch, via sms, e-mail of een pop-up op uw computer', verplicht: true, type: 'langeTekst' },
        { id: 'wat_beweerd', tekst: 'Wat werd er precies gezegd of beweerd door de oplichter?', hint: 'Bijv. verdachte transacties, hulp bij \'beveiliging\', melding dat uw geld \'veiliggesteld\' moest worden', verplicht: true, type: 'langeTekst' },
        { id: 'software_toegang', tekst: 'Heeft u op verzoek software geïnstalleerd of iemand op afstand toegang gegeven tot uw apparaat?', hint: 'Bijv. via AnyDesk, TeamViewer, etc.', verplicht: true, type: 'langeTekst' },
        { id: 'gegevens_gedeeld', tekst: 'Heeft u persoonlijke gegevens of beveiligingscodes gedeeld?', hint: 'Bijvoorbeeld bankpasnummer, inloggegevens, TAN-codes, QR-codes, of pincode', verplicht: true, type: 'langeTekst' },
        { id: 'wat_gedaan', tekst: 'Wat heeft u zelf gedaan nadat u werd benaderd?', hint: 'Bijv. overgemaakt, toestemming gegeven, bankpas gegeven, app geïnstalleerd', verplicht: true, type: 'langeTekst' },
        { id: 'bedragen_verdwenen', tekst: 'Welke bedragen zijn verdwenen en op welke manier?', hint: 'Bijvoorbeeld via overboeking, via pintransacties met een opgestuurde pas', verplicht: true, type: 'langeTekst' },
        { id: 'contact_bank', tekst: 'Heeft u later contact opgenomen met uw echte bank? Zo ja, wanneer en wat zeiden zij?', hint: 'Reactie van de bank en eventuele vervolgacties', verplicht: true, type: 'langeTekst' },
        { id: 'verdachte_transacties', tekst: 'Heeft u verdachte transacties of geldstromen gezien op uw rekening?', hint: 'Zo ja: noteer tijdstip, bedragen en eventueel rekeningnummers', verplicht: true, type: 'langeTekst' },
        { id: 'aangifte_melding', tekst: 'Heeft u aangifte gedaan bij uw bank of melding gemaakt bij een ander meldpunt?', hint: 'Zoals de Fraudehelpdesk of andere instanties - welke reactie kreeg u en welke stappen zijn ondernomen?', verplicht: false, type: 'langeTekst' },
        { id: 'totaal_schade', tekst: 'Kunt u een schatting geven van het totaal verloren bedrag en/of geleden schade?', hint: 'Directe financiële schade en eventuele vervolgschade', verplicht: true, type: 'langeTekst' },
        { id: 'tijdlijn', tekst: 'Kunt u een tijdlijn geven van alle gebeurtenissen?', hint: 'Van eerste contact tot ontdekking van de fraude', verplicht: false, type: 'langeTekst' },
        { id: 'bewijs', tekst: 'Welk bewijs heeft u van de fraude?', hint: 'Screenshots, e-mails, telefoonnummers, bankafschriften', verplicht: false, type: 'langeTekst' }
      ]
    } else if (delictNaam === 'Straatintimidatie') {
      aangepassteVragen = [
        { id: 'wanneer', tekst: 'Wanneer vond de straatintimidatie plaats?', hint: 'Datum en tijdstip van het incident', verplicht: true, type: 'tekst' },
        { id: 'waar_openbaar', tekst: 'Waar in de openbare ruimte gebeurde dit?', hint: 'Straat, plein, park, openbaar vervoer, winkelcentrum, etc.', verplicht: true, type: 'tekst' },
        { id: 'wat_gedaan', tekst: 'Wat deed de dader precies?', hint: 'Beschrijf de seksuele opmerkingen, gebaren, geluiden of aanrakingen', verplicht: true, type: 'langeTekst' },
        { id: 'hoe_indringend', tekst: 'Hoe was het gedrag indringend en seksueel van aard?', hint: 'Waarom ervaarde u dit als indringend seksueel gedrag?', verplicht: true, type: 'langeTekst' },
        { id: 'impact_gevoel', tekst: 'Hoe heeft dit u geraakt?', hint: 'Voelde u zich vreesaanjagend, vernederd, gekwetst of onterend behandeld?', verplicht: true, type: 'langeTekst' },
        { id: 'verdachte_beschrijving', tekst: 'Kunt u de dader beschrijven?', hint: 'Geslacht, geschatte leeftijd, lengte, kleding, bijzondere kenmerken', verplicht: false, type: 'langeTekst' },
        { id: 'getuigen', tekst: 'Waren er getuigen aanwezig?', hint: 'Namen en contactgegevens van eventuele getuigen', verplicht: false, type: 'langeTekst' },
        { id: 'eerder_gebeurd', tekst: 'Is dit eerder gebeurd door dezelfde persoon?', hint: 'Eventuele eerdere incidenten of patroon van gedrag', verplicht: false, type: 'langeTekst' }
      ]
    } else if (delictNaam === 'Computervredebreuk') {
      aangepassteVragen = [
        { id: 'wanneer_waar', tekst: 'Wanneer en waar vond de computervredebreuk plaats?', hint: 'Datum, tijd en welk systeem werd gehackt', verplicht: true, type: 'tekst' },
        { id: 'hoe_ingebroken', tekst: 'Hoe werd er ingebroken in het systeem?', hint: 'Via e-mail, phishing, directe hack, malware, etc.', verplicht: true, type: 'langeTekst' },
        { id: 'wat_gedaan', tekst: 'Wat heeft de dader gedaan nadat hij toegang had?', hint: 'Bestanden bekeken, gedownload, gewijzigd, verwijderd', verplicht: true, type: 'langeTekst' },
        { id: 'schade', tekst: 'Welke schade is er ontstaan?', hint: 'Financiële schade, datalek, reputatieschade, uitvaltijd', verplicht: true, type: 'langeTekst' },
        { id: 'bewijs', tekst: 'Welk bewijs heeft u van de inbraak?', hint: 'Logbestanden, screenshots, e-mails, getuigen', verplicht: false, type: 'langeTekst' },
        { id: 'verdachte', tekst: 'Heeft u een vermoeden wie de dader is?', hint: 'Ex-medewerker, concurrent, onbekende, etc.', verplicht: false, type: 'langeTekst' }
      ]
    } else if (delictNaam === 'Stalking') {
      aangepassteVragen = [
        { id: 'wanneer_begonnen', tekst: 'Wanneer begon de stalking?', hint: 'Eerste incident en periode van stalking', verplicht: true, type: 'tekst' },
        { id: 'hoe_belagen', tekst: 'Hoe wordt u belaagd?', hint: 'Volgen, bellen, berichten, opwachten, etc.', verplicht: true, type: 'langeTekst' },
        { id: 'frequentie', tekst: 'Hoe vaak gebeurt dit?', hint: 'Dagelijks, wekelijks, aantal keren per dag', verplicht: true, type: 'tekst' },
        { id: 'locaties', tekst: 'Waar vindt de stalking plaats?', hint: 'Thuis, werk, onderweg, online', verplicht: true, type: 'langeTekst' },
        { id: 'relatie_dader', tekst: 'Wat is uw relatie tot de stalker?', hint: 'Ex-partner, collega, onbekende, etc.', verplicht: true, type: 'langeTekst' },
        { id: 'impact', tekst: 'Welke impact heeft dit op uw leven?', hint: 'Angst, gedragsverandering, slaapproblemen', verplicht: true, type: 'langeTekst' },
        { id: 'bewijs_stalking', tekst: 'Welk bewijs heeft u van de stalking?', hint: 'Berichten, foto\'s, getuigen, video\'s', verplicht: false, type: 'langeTekst' },
        { id: 'maatregelen', tekst: 'Welke maatregelen heeft u al genomen?', hint: 'Contactverbod gevraagd, route veranderd, beveiligingsmaatregelen', verplicht: false, type: 'langeTekst' }
      ]
    } else if (delictNaam === 'Huisvredebreuk') {
      aangepassteVragen = [
        { id: 'wanneer_waar', tekst: 'Wanneer en waar vond de huisvredebreuk plaats?', hint: 'Datum, tijd en exacte locatie', verplicht: true, type: 'tekst' },
        { id: 'wat_voor_plaats', tekst: 'Wat voor besloten plaats betreft het?', hint: 'Woning, tuin, bedrijfspand, kantoor', verplicht: true, type: 'tekst' },
        { id: 'hoe_binnengetreden', tekst: 'Hoe is de dader binnengetreden?', hint: 'Door deur, raam, over hek, met geweld', verplicht: true, type: 'langeTekst' },
        { id: 'toestemming', tekst: 'Had de dader toestemming om binnen te komen?', hint: 'Expliciet verboden, nooit toegestaan, toegang ingetrokken', verplicht: true, type: 'langeTekst' },
        { id: 'wat_gedaan_binnen', tekst: 'Wat heeft de dader gedaan nadat hij binnen was?', hint: 'Rondgelopen, spullen aangeraakt, gedreigd, gestolen', verplicht: true, type: 'langeTekst' },
        { id: 'getuigen', tekst: 'Waren er getuigen aanwezig?', hint: 'Namen en contactgegevens van getuigen', verplicht: false, type: 'langeTekst' },
        { id: 'schade', tekst: 'Is er schade ontstaan?', hint: 'Braakschade, kapotte spullen, vervuiling', verplicht: false, type: 'langeTekst' },
        { id: 'relatie_dader', tekst: 'Kent u de dader?', hint: 'Ex-partner, buur, collega, onbekende', verplicht: false, type: 'langeTekst' }
      ]
    } else {
      // Algemene fallback vragen voor onbekende delicten
      aangepassteVragen = [
        { id: 'wanneer_waar', tekst: 'Wanneer en waar vond het incident plaats?', hint: 'Datum, tijd en locatie zo nauwkeurig mogelijk', verplicht: true, type: 'tekst' },
        { id: 'wat_gebeurde', tekst: 'Wat is er precies gebeurd?', hint: 'Beschrijf stap voor stap wat er gebeurde', verplicht: true, type: 'langeTekst' },
        { id: 'hoe_ontdekt', tekst: 'Hoe heeft u het incident ontdekt?', hint: 'Direct gezien, later bemerkt, door anderen verteld', verplicht: true, type: 'langeTekst' },
        { id: 'schade_gevolgen', tekst: 'Welke schade of gevolgen heeft u ondervonden?', hint: 'Materiële schade, emotionele impact, kosten', verplicht: true, type: 'langeTekst' },
        { id: 'verdachte_info', tekst: 'Wat weet u over de verdachte/dader?', hint: 'Signalement, naam, relatie tot u, contactgegevens', verplicht: false, type: 'langeTekst' },
        { id: 'bewijs', tekst: 'Welk bewijs heeft u?', hint: 'Foto\'s, berichten, getuigen, documenten', verplicht: false, type: 'langeTekst' },
        { id: 'eerder_gebeurd', tekst: 'Is dit eerder gebeurd?', hint: 'Eerdere incidenten, patroon, escalatie', verplicht: false, type: 'langeTekst' },
        { id: 'maatregelen', tekst: 'Welke maatregelen heeft u al genomen?', hint: 'Politie geïnformeerd, beveiligingsmaatregelen, juridische stappen', verplicht: false, type: 'langeTekst' }
      ]
    }
    
    return { aangepastDelict, aangepassteVragen }
  }

  // Fallback analyse voor als API faalt
  const generateFallbackAnalyse = (gegevens: AngifteGegevens): AnalyseResultaat => {
    const effectiefDelict = gegevens.aangepastDelict || gegevens.delictType
    const ontbrekendeElementen: string[] = []
    const aanvullendeVragen: string[] = []
    const aanbevelingen: string[] = []
    
    if (!effectiefDelict) {
      return {
        ontbrekendeElementen: ['Delicttype niet bepaald'],
        aanvullendeVragen: [],
        aanbevelingen: ['Bepaal eerst het juiste delicttype'],
        juridischeKwaliteit: 'onvoldoende'
      }
    }
    
    // Verzamel alle tekst voor controle
    const alleTekst = Object.values(gegevens.antwoorden).join(' ').toLowerCase() + ' ' + gegevens.vrijeTekst.toLowerCase()
    
    // Basis controles per delicttype - controleer ALLE beschikbare informatie
    switch (effectiefDelict.id) {
      case 'vriend-in-nood fraude':
        // Specifieke controles voor vriend-in-nood fraude (artikel 326 Sr - oplichting)
        if (!alleTekst.includes('whatsapp') && !alleTekst.includes('sms') && !alleTekst.includes('bericht') && !alleTekst.includes('contact')) {
          ontbrekendeElementen.push('Contactwijze (WhatsApp/SMS/etc.) niet duidelijk')
          aanvullendeVragen.push('Via welk platform werd u benaderd (WhatsApp, SMS, etc.)?')
        }
        if (!alleTekst.includes('zoon') && !alleTekst.includes('dochter') && !alleTekst.includes('vriend') && !alleTekst.includes('familie') && !alleTekst.includes('bekende') && !alleTekst.includes('relatie')) {
          ontbrekendeElementen.push('Wie de oplichter beweerde te zijn ontbreekt')
          aanvullendeVragen.push('Voor wie deed de oplichter zich uit (zoon, dochter, vriend, etc.)?')
        }
        if (!alleTekst.includes('telefoon kwijt') && !alleTekst.includes('nieuw nummer') && !alleTekst.includes('verhaal') && !alleTekst.includes('smoes') && !alleTekst.includes('reden')) {
          ontbrekendeElementen.push('Het verhaal/de smoes van de oplichter ontbreekt')
          aanvullendeVragen.push('Wat was het verhaal dat de oplichter vertelde (telefoon kwijt, spoedbetaling, etc.)?')
        }
        if (!alleTekst.includes('dringend') && !alleTekst.includes('spoed') && !alleTekst.includes('snel') && !alleTekst.includes('nood') && !alleTekst.includes('haast')) {
          ontbrekendeElementen.push('Druk/spoed-element niet beschreven')
          aanvullendeVragen.push('Werd er druk uitgeoefend of spoed gesuggereerd?')
        }
        if (!alleTekst.includes('bedrag') && !alleTekst.includes('euro') && !alleTekst.includes('€') && !alleTekst.includes('geld') && !alleTekst.includes('overgemaakt')) {
          ontbrekendeElementen.push('Overgemaakt bedrag niet gespecificeerd')
          aanvullendeVragen.push('Welk bedrag heeft u overgemaakt?')
        }
        if (!alleTekst.includes('rekening') && !alleTekst.includes('iban') && !alleTekst.includes('rekeningnummer')) {
          ontbrekendeElementen.push('Rekeningnummer van oplichter ontbreekt')
          aanvullendeVragen.push('Op welk rekeningnummer heeft u geld overgemaakt?')
        }
        if (!alleTekst.includes('ontdekt') && !alleTekst.includes('doorhad') && !alleTekst.includes('besefte') && !alleTekst.includes('oplichting') && !alleTekst.includes('fraude')) {
          ontbrekendeElementen.push('Hoe u de fraude ontdekte ontbreekt')
          aanvullendeVragen.push('Hoe kwam u erachter dat het om oplichting ging?')
        }
        break
        
      case 'bankhelpdeskfraude':
        // Specifieke controles voor bankhelpdeskfraude (artikel 326 Sr - oplichting)
        // Alleen vragen als echt kritieke informatie ontbreekt
        if (!alleTekst.includes('bank') && !alleTekst.includes('medewerker') && !alleTekst.includes('helpdesk') && !alleTekst.includes('klantenservice')) {
          ontbrekendeElementen.push('Niet duidelijk dat daders zich voordeden als bank')
          aanvullendeVragen.push('Hoe deden de daders zich voor als bankmedewerkers?')
        }
        if (!alleTekst.includes('bel') && !alleTekst.includes('telefoon') && !alleTekst.includes('mail') && !alleTekst.includes('sms') && !alleTekst.includes('contact') && !alleTekst.includes('app')) {
          ontbrekendeElementen.push('Contactwijze volledig onduidelijk')
          aanvullendeVragen.push('Hoe werd u benaderd door de zogenaamde bankmedewerker?')
        }
        // Alleen vragen naar software als er geen enkele vermelding is van computer/toegang/software
        if (!alleTekst.includes('software') && !alleTekst.includes('toegang') && !alleTekst.includes('teamviewer') && !alleTekst.includes('anydesk') && !alleTekst.includes('installeren') && !alleTekst.includes('computer') && !alleTekst.includes('scherm') && !alleTekst.includes('afstand')) {
          aanvullendeVragen.push('Heeft u software geïnstalleerd of toegang op afstand gegeven?')
        }
        // Alleen vragen naar schade als echt geen enkele financiële impact genoemd is
        if (!alleTekst.includes('bedrag') && !alleTekst.includes('euro') && !alleTekst.includes('€') && !alleTekst.includes('schade') && !alleTekst.includes('verlies') && !alleTekst.includes('geld') && !alleTekst.includes('kosten')) {
          ontbrekendeElementen.push('Financiële schade volledig onbekend')
          aanvullendeVragen.push('Wat is het totale verloren bedrag en financiële schade?')
        }
        break
        
      case 'straatintimidatie':
        // Specifieke controles voor straatintimidatie (artikel 429ter Sr)
        if (!alleTekst.includes('openbaar') && !alleTekst.includes('straat') && !alleTekst.includes('publiek')) {
          ontbrekendeElementen.push('Locatie in openbare ruimte niet duidelijk')
          aanvullendeVragen.push('Waar precies in de openbare ruimte vond dit plaats?')
        }
        if (!alleTekst.includes('seksueel') && !alleTekst.includes('indringend') && !alleTekst.includes('intimiderend')) {
          ontbrekendeElementen.push('Seksuele aard van het gedrag niet beschreven')
          aanvullendeVragen.push('Wat maakte het gedrag seksueel en indringend?')
        }
        if (!alleTekst.includes('vreesaanjagend') && !alleTekst.includes('vernederend') && !alleTekst.includes('kwetsend') && !alleTekst.includes('onterend') && !alleTekst.includes('impact') && !alleTekst.includes('gevoel')) {
          ontbrekendeElementen.push('Impact op slachtoffer (vreesaanjagend/vernederend/kwetsend/onterend) ontbreekt')
          aanvullendeVragen.push('Hoe heeft dit gedrag u geraakt - voelde u zich vreesaanjagend, vernederd, gekwetst of onterend behandeld?')
        }
        if (!alleTekst.includes('opmerking') && !alleTekst.includes('gebaar') && !alleTekst.includes('geluid') && !alleTekst.includes('aanraking') && !alleTekst.includes('zei') && !alleTekst.includes('deed')) {
          ontbrekendeElementen.push('Concrete gedragingen (opmerkingen/gebaren/geluiden/aanrakingen) ontbreken')
          aanvullendeVragen.push('Wat deed of zei de dader precies? Welke opmerkingen, gebaren, geluiden of aanrakingen?')
        }
        break
        
      case 'diefstal':
        // Specifieke controles voor diefstal
        if (!alleTekst.includes('gestolen') && !alleTekst.includes('weggenomen') && !alleTekst.includes('meegenomen')) {
          ontbrekendeElementen.push('Duidelijke beschrijving van wegneming ontbreekt')
          aanvullendeVragen.push('Wat precies is er weggenomen en hoe?')
        }
        if (!alleTekst.includes('waarde') && !alleTekst.includes('euro') && !alleTekst.includes('€') && !alleTekst.includes('prijs')) {
          ontbrekendeElementen.push('Waarde van gestolen goederen onbekend')
          aanvullendeVragen.push('Wat is de geschatte waarde van de gestolen spullen?')
        }
        break
        
      case 'mishandeling':
        // Check letsel in alle informatie
        if (!alleTekst.includes('letsel') && !alleTekst.includes('pijn') && !gegevens.antwoorden.letsel) {
          ontbrekendeElementen.push('Beschrijving van letsel of pijn')
          aanvullendeVragen.push('Heeft u letsel opgelopen? Beschrijf aard en ernst van het letsel.')
        }
        // Check medische hulp
        if (!gegevens.antwoorden.medische_hulp && !alleTekst.includes('dokter') && !alleTekst.includes('medisch') && !alleTekst.includes('ziekenhuis')) {
          aanvullendeVragen.push('Heeft u medische hulp gezocht na de mishandeling?')
        }
        break
        
      case 'vernieling':
        // Check staat voor beschadiging
        if (!alleTekst.includes('heel') && !alleTekst.includes('intact') && !alleTekst.includes('onbeschadigd')) {
          aanvullendeVragen.push('Was het beschadigde goed voor het incident nog heel en onbeschadigd?')
        }
        // Check reparatiekosten - controleer alle velden
        const heeftKosten = gegevens.antwoorden.reparatiekosten || 
                           alleTekst.includes('€') || alleTekst.includes('euro') ||
                           alleTekst.includes('kosten') || alleTekst.includes('waarde')
        if (!heeftKosten) {
          aanvullendeVragen.push('Wat zijn de reparatiekosten of vervangingswaarde van het beschadigde goed?')
        }
        break
        
      case 'oplichting':
        // Check contactgegevens verdachte
        if (!gegevens.antwoorden.verdachte_contact && !alleTekst.includes('telefoonnummer') && !alleTekst.includes('telefoon') && !alleTekst.includes('nummer')) {
          aanvullendeVragen.push('Heeft u contactgegevens van de verdachte (telefoonnummer, e-mail, website)?')
        }
        // Check whatsapp bewijs
        if (alleTekst.includes('whatsapp') && !alleTekst.includes('screenshot') && !alleTekst.includes('bewijs')) {
          aanbevelingen.push('Maak screenshots van WhatsApp-berichten als bewijs')
        }
        break
    }
    
    // Algemene controles en specifieke aanbevelingen
    if (gegevens.vrijeTekst.length < 200) {
      const effectiefDelict = gegevens.aangepastDelict || gegevens.delictType
      let specifiekAdvies = 'Uw verhaal kan uitgebreider. Meer details helpen de politie bij het onderzoek.'
      
      // Geef delict-specifieke suggesties
      if (effectiefDelict) {
        switch (effectiefDelict.id) {
          case 'diefstal':
            specifiekAdvies = 'Uw verhaal kan uitgebreider. Voeg toe: hoe u de diefstal ontdekte, waar precies de spullen lagen, of er beveiligingsmaatregelen waren, en of u verdachte personen heeft opgemerkt.'
            break
          case 'mishandeling':
            specifiekAdvies = 'Uw verhaal kan uitgebreider. Beschrijf meer details over: wat er precies werd gezegd, hoe de mishandeling plaatsvond, of er getuigen waren, en hoe u zich daarna voelde.'
            break
          case 'vernieling':
            specifiekAdvies = 'Uw verhaal kan uitgebreider. Voeg toe: hoe u de schade ontdekte, of u de dader heeft gezien, of er getuigen waren, en of het eerder is gebeurd.'
            break
          case 'oplichting':
            specifiekAdvies = 'Uw verhaal kan uitgebreider. Beschrijf meer over: hoe het contact tot stand kwam, wat er precies werd beloofd, wanneer u doorhad dat het oplichting was, en welke bewijzen u heeft.'
            break
          case 'bedreiging':
            specifiekAdvies = 'Uw verhaal kan uitgebreider. Voeg toe: in welke context de bedreiging werd geuit, of er eerder bedreigingen waren, of er getuigen waren, en hoe serieus u de dreiging inschat.'
            break
          default:
            specifiekAdvies = 'Uw verhaal kan uitgebreider. Beschrijf meer over: de exacte toedracht, tijdlijn van gebeurtenissen, betrokken personen, en impact op u.'
        }
      }
      
      aanbevelingen.push(specifiekAdvies)
    }
    
    // Aangepaste kwaliteitsbeoordeling: als er aanbevelingen zijn, kan het niet "goed" zijn
    const kwaliteit = ontbrekendeElementen.length > 2 ? 'onvoldoende' : 
                     ontbrekendeElementen.length > 0 || aanbevelingen.length > 0 ? 'voldoende' : 'goed'
    
    return {
      ontbrekendeElementen,
      aanvullendeVragen,
      aanbevelingen,
      juridischeKwaliteit: kwaliteit
    }
  }

// Functie om aangifte te genereren met ChatGPT
  const genereerAangifte = async (gegevens: AngifteGegevens): Promise<string> => {
  const { delictType, antwoorden, vrijeTekst, aangepastDelict, aangepassteVragen } = gegevens

  const effectiefDelict = aangepastDelict || delictType
  const effectieveVragen = aangepassteVragen || (delictType ? vragenPerDelict[delictType.id] || [] : [])

  if (!effectiefDelict) {
    throw new Error('Geen delicttype geselecteerd')
  }

  const prompt = `Je bent een ervaren juridisch medewerker die professionele politieaangiftes opstelt. 

TAAK: Stel een complete, professionele aangifte op op basis van de verstrekte informatie.

BELANGRIJKE WETSWIJZIGING (SINDS 1 JULI 2024):
STRAATINTIMIDATIE valt vanaf 1 juli 2024 onder het NIEUWE artikel 429ter Sr (NIET meer artikel 266 Sr):
"Degene die in het openbaar een ander indringend seksueel benadert door middel van opmerkingen, gebaren, geluiden of aanrakingen op een wijze die vreesaanjagend, vernederend, kwetsend of onterend is te achten, wordt gestraft met hechtenis van ten hoogste drie maanden of geldboete van de derde categorie."

SPECIFIEKE FRAUDETYPEN:
BANKHELPDESKFRAUDE: Dit is een vorm van oplichting (artikel 326 Sr) waarbij criminelen zich voordoen als bankmedewerkers. Ze benaderen slachtoffers telefonisch, via e-mail, sms of pop-ups en beweren dat er verdachte transacties zijn of dat de rekening beveiligd moet worden. Vaak vragen ze om software te installeren (AnyDesk, TeamViewer) of om persoonlijke gegevens/codes te delen. Dit valt onder oplichting maar vereist specifieke vragen over de modus operandi.

VRIEND-IN-NOOD FRAUDE: Dit is oplichting (artikel 326 Sr) waarbij criminelen zich voordoen als bekenden (zoon, dochter, vriend, familie). Kenmerken: contact via WhatsApp/SMS met onbekend nummer, beweren telefoon kwijt te zijn, dringend verzoek om geld, emotionele manipulatie door vertrouwde relatie te misbruiken.

DELICTTYPE: ${effectiefDelict.naam}
JURIDISCHE BASIS: ${effectiefDelict.juridischeBasis}
BESTANDDELEN: ${effectiefDelict.bestanddelen.join(', ')}

BEANTWOORDE VRAGEN:
${Object.entries(antwoorden).map(([vraagId, antwoord]) => {
  const vraag = effectieveVragen.find(v => v.id === vraagId)
  return `${vraag?.tekst}: ${antwoord}`
}).join('\n')}

UITGEBREIDE BESCHRIJVING VAN AANGEVER (ZEER BELANGRIJK - GEBRUIK ALLE DETAILS):
${vrijeTekst}

INSTRUCTIES:
1. Schrijf een professionele aangifte in lopende tekst in de IK-VORM
2. **BELANGRIJK: Integreer ALLE details uit de "Uitgebreide beschrijving" in de aangifte**
3. **Combineer informatie uit zowel de vragen als de vrije tekst tot één samenhangende aangifte**
4. **Zorg dat belangrijke details uit de vrije tekst NIET verloren gaan - gebruik ze actief**
5. Gebruik juridisch correcte terminologie
6. Zorg dat alle wettelijke bestanddelen van ${effectiefDelict.naam} aan bod komen
7. Bij straatintimidatie: Gebruik artikel 429ter Sr (vanaf 1 juli 2024) als juridische basis
8. Bij bankhelpdeskfraude: Gebruik artikel 326 Sr (oplichting) en vermeld de specifieke fraudemethode
9. Bij vriend-in-nood fraude: Gebruik artikel 326 Sr (oplichting) en vermeld specifiek de identiteitsmisleiding
10. Structureer als: introductie, feitelijke omschrijving, schade/gevolgen, conclusie
11. Gebruik de 1e persoon ("Ik doe hierbij aangifte..." "Ik verklaar dat...")
12. Schrijf in correct Nederlands zonder jargon
13. Vermeld specifieke details zoals datum, tijd, plaats, bedragen
14. Maak het geschikt voor kopiëren en plakken in de online aangifte van politie.nl

Begin de aangifte met: "Ik doe hierbij aangifte van ${effectiefDelict.naam.toLowerCase()} en verklaar het volgende:"`

      try {
      const response = await fetch('/api/debug-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        }),
      })

      if (!response.ok) {
        throw new Error('Fout bij genereren aangifte')
      }

      const data = await response.json()
      const aangifteTekst = data.response || 'Er ging iets mis bij het genereren van de aangifte.'
      
      // Voeg disclaimer toe
      const disclaimer = `

================================================================================
DISCLAIMER - BELANGRIJK OM TE LEZEN
================================================================================

Deze aangifte is gegenereerd door WetHelder als hulpmiddel. 

BELANGRIJK:
• Controleer en pas de tekst aan zodat deze volledig klopt met uw verhaal
• Het doen van een valse of onjuiste aangifte is strafbaar (art. 188 Sr)
• WetHelder is een hulpmiddel en geen vervanging van professioneel juridisch advies
• Raadpleeg bij twijfel altijd een advocaat of juridisch adviseur

Voor vragen over deze aangifte kunt u contact opnemen met de politie of een juridische professional.

Gegenereerd door: WetHelder Aangifte-Assistent
Datum: ${new Date().toLocaleDateString('nl-NL')}
Tijd: ${new Date().toLocaleTimeString('nl-NL')}`

      return aangifteTekst + disclaimer
    } catch (error) {
      console.error('Error generating aangifte:', error)
      const fallbackTekst = `AANGIFTE VAN ${effectiefDelict.naam.toUpperCase()}

Ik doe hierbij aangifte van ${effectiefDelict.naam.toLowerCase()} en verklaar het volgende:

${Object.entries(antwoorden).map(([vraagId, antwoord]) => {
  const vraag = effectieveVragen.find(v => v.id === vraagId)
  return `${vraag?.tekst}: ${antwoord}`
}).join('\n\n')}

Aanvullende toelichting:
${vrijeTekst}

Deze aangifte is opgesteld met behulp van de WetHelder Aangifte-Assistent.`

      // Voeg disclaimer toe aan fallback
      const disclaimer = `

================================================================================
DISCLAIMER - BELANGRIJK OM TE LEZEN
================================================================================

Deze aangifte is gegenereerd door WetHelder als hulpmiddel. 

BELANGRIJK:
• Controleer en pas de tekst aan zodat deze volledig klopt met uw verhaal
• Het doen van een valse of onjuiste aangifte is strafbaar (art. 188 Sr)
• WetHelder is een hulpmiddel en geen vervanging van professioneel juridisch advies
• Raadpleeg bij twijfel altijd een advocaat of juridisch adviseur

Voor vragen over deze aangifte kunt u contact opnemen met de politie of een juridische professional.

Gegenereerd door: WetHelder Aangifte-Assistent
Datum: ${new Date().toLocaleDateString('nl-NL')}
Tijd: ${new Date().toLocaleTimeString('nl-NL')}`

      return fallbackTekst + disclaimer
    }
}

export default function AngifteAssistentPage() {
  const { data: session } = useSession()
  const [toonIntro, setToonIntro] = useState(true)
  const [huidigeStap, setHuidigeStap] = useState(1)
  const [angifteGegevens, setAngifteGegevens] = useState<AngifteGegevens>({
    antwoorden: {},
    vrijeTekst: '',
    voltooideStappen: 0
  })

  const totaalStappen = 4
  const voortgang = (huidigeStap / totaalStappen) * 100

  const updateAngifteGegevens = (updates: Partial<AngifteGegevens>) => {
    setAngifteGegevens(prev => ({ ...prev, ...updates }))
  }

  const startAnalyse = async () => {
    updateAngifteGegevens({ isAnalyseren: true })
    try {
      const analyseResultaat = await analyseJuridischeVolledigheid(angifteGegevens)
      updateAngifteGegevens({ 
        analyseResultaat,
        isAnalyseren: false 
      })
    } catch (error) {
      console.error('Fout bij juridische analyse:', error)
      updateAngifteGegevens({ isAnalyseren: false })
    }
  }

  const volgendeStap = async () => {
    if (huidigeStap < totaalStappen) {
      if (huidigeStap === 3) {
        // Voor stap 4: genereer de aangifte
        updateAngifteGegevens({ isGenererend: true })
        try {
          const gegenereerdeAangifte = await genereerAangifte(angifteGegevens)
          updateAngifteGegevens({ 
            gegenereerdeAangifte,
            isGenererend: false 
          })
        } catch (error) {
          console.error('Fout bij genereren aangifte:', error)
          updateAngifteGegevens({ isGenererend: false })
        }
      }
      setHuidigeStap(prev => prev + 1)
      updateAngifteGegevens({ voltooideStappen: Math.max(angifteGegevens.voltooideStappen, huidigeStap) })
    }
  }

  const vorigeStap = () => {
    if (huidigeStap > 1) {
      setHuidigeStap(prev => prev - 1)
    }
  }

  const isStapCompleet = (stap: number): boolean => {
    switch (stap) {
      case 1: {
        if (!angifteGegevens.delictType) return false
        if (angifteGegevens.delictType.id === 'anders') {
          // Voor "Anders" optie: controleer of er een zoekopdracht is EN deze is geanalyseerd
          return !!(angifteGegevens.zoekopdracht && 
                   (angifteGegevens.zoekopdracht?.length || 0) >= 20 && 
                   angifteGegevens.aangepastDelict && 
                   angifteGegevens.aangepassteVragen)
        }
        return true
      }
      case 2: {
        const vragen = angifteGegevens.aangepassteVragen || 
          (angifteGegevens.delictType ? vragenPerDelict[angifteGegevens.delictType.id] || [] : [])
        const verplichteVragen = vragen.filter(v => v.verplicht)
        return verplichteVragen.every(v => angifteGegevens.antwoorden[v.id]?.trim())
      }
      case 3: return angifteGegevens.vrijeTekst.length > 50
      case 4: return true
      default: return false
    }
  }

  const kanDoorgaan = isStapCompleet(huidigeStap)
  const huidigeVragen = angifteGegevens.aangepassteVragen || 
    (angifteGegevens.delictType ? vragenPerDelict[angifteGegevens.delictType.id] || [] : [])

  const downloadAangifte = async () => {
    const aangifteTekst = angifteGegevens.gegenereerdeAangifte || 'Geen aangifte beschikbaar'
    const datum = new Date().toLocaleDateString('nl-NL')
    const effectiefDelict = angifteGegevens.aangepastDelict || angifteGegevens.delictType
    const bestandsnaam = `aangifte_${effectiefDelict?.naam.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${datum.replace(/\//g, '-')}.txt`
    
    // Track de download in de database
    try {
      await fetch('/api/admin/stats/aangifte-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          delictType: effectiefDelict?.naam,
          isCustomType: !!angifteGegevens.aangepastDelict,
          timestamp: new Date().toISOString()
        }),
      })
    } catch (error) {
      console.error('Fout bij tracken download:', error)
      // Ga door met download ook als tracking faalt
    }
    
    const blob = new Blob([aangifteTekst], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = bestandsnaam
    a.click()
    URL.revokeObjectURL(url)
  }

  // Toon introductiepagina als eerste
  if (toonIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Slimme Aangifte-Assistent
            </h1>
            <p className="text-gray-600 text-base sm:text-lg px-4 sm:px-0">
              Hulp bij het opstellen van een complete politieaangifte
            </p>
          </div>

          {/* Introductie Content */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-8">
              <div className="prose prose-blue max-w-none">
                <p className="text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                  Steeds meer aangiftes bij de politie kunnen – of moeten zelfs – via internet worden gedaan. In de basis maakt dit voor het strafproces weinig verschil. Toch blijkt in de praktijk dat internetaangiftes regelmatig cruciale informatie missen, vooral in het vrije tekstgedeelte waarin u zelf het verhaal moet doen.
                </p>
                
                <p className="text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                  Deze module helpt u stap voor stap om een heldere, complete en juridisch sterke aangifte op te stellen. De uitkomst kunt u gebruiken als aanvulling bij uw aangifte via <a href="https://www.politie.nl/aangifte" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">www.politie.nl/aangifte</a>.
                </p>
                
                <p className="text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                  Niet alle aangiftes kunnen digitaal: bij bijvoorbeeld concrete daderinformatie of bijzondere omstandigheden moet u soms aangifte doen op het bureau. Ook dan kan deze module u helpen als leidraad om goed voorbereid het gesprek aan te gaan.
                </p>
                
                <p className="text-base sm:text-lg leading-relaxed font-semibold text-blue-800">
                  Zo vergroot u de kans dat uw zaak volledig en met succes wordt opgepakt.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Juridische informatie */}
          <Card className="mb-4 sm:mb-8 border-green-200 bg-green-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2 text-sm sm:text-base">Wat gebeurt er met uw aangifte?</h3>
                  <p className="text-green-800 mb-2 sm:mb-3 text-sm sm:text-base">
                    Bij het doen van aangifte verzoekt u de Officier van Justitie om strafvervolging. Om uw zaak juridisch goed rond te krijgen, bevat de gegenereerde aangifte alle juridische aspecten die nodig zijn voor een succesvol onderzoek, zodat er achteraf minder vragen gesteld hoeven te worden.
                  </p>
                  <p className="text-green-800 text-xs sm:text-sm">
                    Het kan nog steeds zijn dat de politie of de Officier van Justitie later extra vragen wil stellen. Dit is normaal en deel van het proces.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Dummy gegevens informatie */}
          <Card className="mb-4 sm:mb-8 border-amber-200 bg-amber-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2 text-sm sm:text-base">Privacy-tip: Gebruik dummy gegevens</h3>
                  <p className="text-amber-800 mb-2 sm:mb-3 text-sm sm:text-base">
                    Vanwege AVG/GDPR gevoelige informatie raden wij aan om <strong>dummy gegevens</strong> te gebruiken tijdens het opstellen van uw aangifte. U kunt de gegenereerde aangifte later handmatig invullen met de juiste persoonsgegevens voordat u deze indient bij de politie.
                  </p>
                  <p className="text-amber-800 text-xs sm:text-sm">
                    Bijvoorbeeld: gebruik &quot;Jan Jansen&quot; in plaats van uw echte naam, &quot;Voorbeeldstraat 1&quot; in plaats van uw echte adres, etc.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Contact informatie */}
          <Card className="mb-4 sm:mb-8 border-blue-200 bg-blue-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <Info className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Vragen over uw zaak?</h3>
                  <p className="text-blue-800 text-sm sm:text-base">
                    Voor vragen over uw specifieke zaak na het indienen van de aangifte kunt u contact opnemen met de politie via <strong>0900-8844</strong>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inlog informatie */}
          <Card className="mb-6 sm:mb-8 border-slate-200 bg-slate-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <Info className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Inloggen niet verplicht</h3>
                  <p className="text-slate-800 text-sm sm:text-base">
                    U kunt de aangifte-assistent gebruiken zonder in te loggen. Door in te loggen kunt u wel uw aangiftes opslaan en later terugkeren om deze te bewerken of opnieuw te downloaden.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start knop */}
          <div className="text-center">
            <Button 
              size="lg" 
              onClick={() => setToonIntro(false)}
              className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
            >
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Begin met Aangifte-Assistent
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Slimme Aangifte-Assistent
          </h1>
          <p className="text-gray-600 text-base sm:text-lg px-4 sm:px-0">
            Professionele hulp bij het opstellen van een complete politieaangifte
          </p>
        </div>

        {/* Privacy Notice */}
        <Card className="mb-6 sm:mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Privacy & Beveiliging</h3>
                <p className="text-xs sm:text-sm text-blue-800 mb-2 sm:mb-3">
                  Uw gegevens blijven 100% lokaal op uw apparaat. Alleen voor het genereren van de professionele 
                  aangiftetekst wordt gebruik gemaakt van kunstmatige intelligentie, waarbij geen persoonlijke 
                  identificeerbare informatie wordt opgeslagen.
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-blue-700">
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Lokale verwerking
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Geen permanente opslag
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Direct wissen na download
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Stap {huidigeStap} van {totaalStappen}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(voortgang)}% voltooid
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${voortgang}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {[
                { nummer: 1, titel: 'Delicttype', icon: FileText },
                { nummer: 2, titel: 'Vragen', icon: CheckCircle },
                { nummer: 3, titel: 'Beschrijving', icon: FileText },
                { nummer: 4, titel: 'Download', icon: Download }
              ].map(({ nummer, titel, icon: Icon }) => (
                <div 
                  key={nummer}
                  className={`flex flex-col items-center p-3 rounded-lg text-center ${
                    nummer === huidigeStap
                      ? 'bg-blue-100 text-blue-700'
                      : nummer <= angifteGegevens.voltooideStappen
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{titel}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {huidigeStap === 1 && (
                <>
                  <FileText className="h-5 w-5" />
                  Stap 1: Selecteer het type delict
                </>
              )}
              {huidigeStap === 2 && (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Stap 2: Beantwoord de vragen
                </>
              )}
              {huidigeStap === 3 && (
                <>
                  <FileText className="h-5 w-5" />
                  Stap 3: Uw eigen beschrijving
                </>
              )}
              {huidigeStap === 4 && (
                <>
                  <Download className="h-5 w-5" />
                  Stap 4: Download uw aangifte
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step 1: Crime Type Selection */}
            {huidigeStap === 1 && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-6">
                  Selecteer het type delict waarvan u aangifte wilt doen. Dit bepaalt welke specifieke vragen 
                  we stellen om een complete aangifte op te kunnen stellen.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {delictTypen.map((delict) => (
                    <div
                      key={delict.id}
                                             onClick={() => updateAngifteGegevens({ delictType: delict })}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        delict.categorie === 'vermogensdelict' ? 'border-blue-200 hover:border-blue-400 hover:bg-blue-50' :
                        delict.categorie === 'geweldsdelict' ? 'border-red-200 hover:border-red-400 hover:bg-red-50' :
                        delict.categorie === 'zedenfeit' ? 'border-purple-200 hover:border-purple-400 hover:bg-purple-50' :
                        'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <h3 className="font-semibold text-lg mb-2">{delict.naam}</h3>
                      <p className="text-gray-600 text-sm mb-2">{delict.beschrijving}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          delict.categorie === 'vermogensdelict' ? 'bg-blue-100 text-blue-800' :
                          delict.categorie === 'geweldsdelict' ? 'bg-red-100 text-red-800' :
                          delict.categorie === 'zedenfeit' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {delict.categorie === 'vermogensdelict' ? 'Vermogensdelict' :
                           delict.categorie === 'geweldsdelict' ? 'Geweldsdelict' :
                           delict.categorie === 'zedenfeit' ? 'Zedenfeit' :
                           'Overig'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{delict.juridischeBasis}</p>
                    </div>
                  ))}
                </div>
                
                {/* Zoekfunctie voor andere delicten */}
                {angifteGegevens.delictType?.id === 'anders' && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-3">Beschrijf uw situatie</h4>
                    <p className="text-sm text-yellow-800 mb-3">
                      Beschrijf kort wat er is gebeurd (minimaal 20 karakters). Het systeem analyseert uw situatie en stelt de juiste vragen op.
                    </p>
                    <div className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded mb-3">
                      Beschrijf uw situatie in gewone taal, bijvoorbeeld: &quot;Ik werd gebeld door de bank, dit bleek een oplichter&quot; of &quot;Iemand reed tegen mijn auto aan en is doorgereden&quot;
                    </div>
                    <textarea
                      className="w-full p-3 border border-yellow-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      rows={3}
                      value={angifteGegevens.zoekopdracht || ''}
                      onChange={(e) => updateAngifteGegevens({ zoekopdracht: e.target.value })}
                      placeholder="Bijvoorbeeld: 'Iemand heeft ingebroken in mijn auto en mijn laptop gestolen' of 'Ik ben lastiggevallen op straat door een onbekende'"
                    />
                    
                    {/* Tekenteller en status */}
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className={`${(angifteGegevens.zoekopdracht?.length || 0) >= 20 ? 'text-green-600' : 'text-yellow-700'}`}>
                        {angifteGegevens.zoekopdracht?.length || 0} / 20 karakters minimum
                      </span>
                      {angifteGegevens.zoekopdracht && (angifteGegevens.zoekopdracht?.length || 0) >= 20 && !angifteGegevens.aangepastDelict && (
                        <span className="text-blue-600 text-xs">
                          ⏱ Analyse duurt ca. 20 seconden
                        </span>
                      )}
                    </div>
                    
                    {angifteGegevens.zoekopdracht && (angifteGegevens.zoekopdracht?.length || 0) >= 20 && (
                      <div className="mt-3">
                        <Button
                          onClick={async () => {
                            if (!angifteGegevens.zoekopdracht) return
                            
                            updateAngifteGegevens({ isGenererend: true })
                            try {
                              const result = await analyseAndersZoekopdracht(angifteGegevens.zoekopdracht)
                              updateAngifteGegevens({
                                aangepastDelict: result.aangepastDelict,
                                aangepassteVragen: result.aangepassteVragen,
                                isGenererend: false
                              })
                            } catch (error) {
                              console.error('Fout bij analyse:', error)
                              updateAngifteGegevens({ isGenererend: false })
                            }
                          }}
                          disabled={angifteGegevens.isGenererend || !angifteGegevens.zoekopdracht || (angifteGegevens.zoekopdracht?.length || 0) < 20}
                          className="w-full"
                        >
                          {angifteGegevens.isGenererend ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                              Analyseren...
                            </>
                          ) : (
                            <>
                              <Search className="h-4 w-4 mr-2" />
                              Analyseer situatie
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {/* Weergave van geanalyseerd delicttype */}
                    {angifteGegevens.aangepastDelict && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h5 className="font-semibold text-green-900">Geïdentificeerd delicttype:</h5>
                            <p className="font-medium text-green-800">{angifteGegevens.aangepastDelict.naam}</p>
                            <p className="text-sm text-green-700 mt-1">{angifteGegevens.aangepastDelict.beschrijving}</p>
                            <p className="text-xs text-green-600 mt-1">{angifteGegevens.aangepastDelict.juridischeBasis}</p>
                            {angifteGegevens.aangepassteVragen && (
                              <p className="text-xs text-green-600 mt-2">
                                {angifteGegevens.aangepassteVragen.length} aangepaste vragen opgesteld voor stap 2
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Questions */}
            {huidigeStap === 2 && (
              <div className="space-y-6">
                                 <div className="bg-blue-50 p-4 rounded-lg">
                   <h3 className="font-semibold text-blue-900 mb-2">
                     Vragen voor: {angifteGegevens.aangepastDelict?.naam || angifteGegevens.delictType?.naam}
                   </h3>
                   <p className="text-sm text-blue-800 mb-2">
                     De volgende vragen zijn specifiek samengesteld om alle juridische bestanddelen van 
                     {' '}<strong>{(angifteGegevens.aangepastDelict?.naam || angifteGegevens.delictType?.naam)?.toLowerCase()}</strong> te dekken volgens 
                     {' '}{angifteGegevens.aangepastDelict?.juridischeBasis || angifteGegevens.delictType?.juridischeBasis}.
                   </p>
                   <p className="text-xs text-blue-700 bg-blue-100 p-2 rounded mb-2">
                     <strong>Debug info:</strong> Aantal vragen geladen: {huidigeVragen.length}
                   </p>
                   <p className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                     <strong>Tip:</strong> Geef korte, bondige antwoorden. Bij stap 3 krijgt u de gelegenheid om uw volledige verhaal te vertellen.
                   </p>
                 </div>
                
                {huidigeVragen.map((vraag, index) => (
                  <div key={vraag.id} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {index + 1}
                      </span>
                      {vraag.tekst}
                      {vraag.verplicht && <span className="text-red-500">*</span>}
                    </label>
                    {vraag.hint && (
                      <p className="text-xs text-gray-500 ml-8">{vraag.hint}</p>
                    )}
                    {vraag.type === 'langeTekst' ? (
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ml-8"
                        rows={4}
                        value={angifteGegevens.antwoorden[vraag.id] || ''}
                        onChange={(e) => updateAngifteGegevens({
                          antwoorden: { ...angifteGegevens.antwoorden, [vraag.id]: e.target.value },
                          analyseResultaat: undefined
                        })}
                        placeholder={vraag.hint}
                        required={vraag.verplicht}
                      />
                    ) : (
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ml-8"
                        value={angifteGegevens.antwoorden[vraag.id] || ''}
                        onChange={(e) => updateAngifteGegevens({
                          antwoorden: { ...angifteGegevens.antwoorden, [vraag.id]: e.target.value },
                          analyseResultaat: undefined
                        })}
                        placeholder={vraag.hint}
                        required={vraag.verplicht}
                      />
                    )}
                  </div>
                ))}
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Let op:</strong> Velden gemarkeerd met * zijn verplicht voor een volledige aangifte. 
                    Hoe meer details u verstrekt, hoe beter de politie u kan helpen.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Free Text with Analysis */}
            {huidigeStap === 3 && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Uw eigen verhaal</h3>
                  <p className="text-sm text-green-800">
                    Vertel in uw eigen woorden wat er is gebeurd. Voeg details toe die u belangrijk vindt 
                    en die nog niet aan bod zijn gekomen in de vorige vragen. Dit helpt om een compleet beeld te schetsen.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Tips voor een betere aangifte
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li><strong>Vertel duidelijk wat er gebeurd is:</strong> Beschrijf de gebeurtenis stap voor stap in chronologische volgorde</li>
                    <li><strong>Benoem de verdachte goed:</strong> Als u de dader kent, geef dan naam, adres en relatie tot u. Bij onbekenden: signalement, kleding, bijzonderheden</li>
                    <li><strong>Voeg details toe:</strong> Datum, tijd, exacte locatie, getuigen, schade, gevoel van bedreiging</li>
                    <li><strong>Vermeld gevolgen:</strong> Letsel, financiële schade, emotionele impact, vervolgacties die u heeft ondernomen</li>
                  </ul>
                  <p className="text-xs text-blue-700 mt-2 font-medium">
                    Hoe meer relevante details u verstrekt, hoe beter de politie u kan helpen en hoe sterker uw aangifte wordt.
                  </p>
                </div>
                
                <textarea
                  className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={10}
                  value={angifteGegevens.vrijeTekst}
                  onChange={(e) => updateAngifteGegevens({ vrijeTekst: e.target.value, analyseResultaat: undefined })}
                  placeholder="Beschrijf hier uw verhaal in eigen woorden. Denk aan: wat gebeurde er voor en na het incident? Hoe voelde u zich? Waren er bijzondere omstandigheden? Heeft u verdere actie ondernomen?"
                />
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{angifteGegevens.vrijeTekst.length} karakters</span>
                  <span className={angifteGegevens.vrijeTekst.length >= 50 ? 'text-green-600' : 'text-red-500'}>
                    Minimaal 50 karakters vereist
                  </span>
                </div>

                {/* Juridische Controle Button */}
                {angifteGegevens.vrijeTekst.length >= 50 && (
                  <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-purple-900 mb-2">Juridische Controle</h4>
                          <p className="text-sm text-purple-800 mb-3">
                            Laat het systeem controleren of uw aangifte alle juridisch belangrijke elementen bevat. 
                            Dit kan u helpen om cruciale details toe te voegen voordat u de definitieve aangifte genereert.
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={startAnalyse}
                            disabled={angifteGegevens.isAnalyseren}
                            className="text-purple-700 border-purple-300 hover:bg-purple-100"
                          >
                            {angifteGegevens.isAnalyseren ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Analyseren...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Controleer Volledigheid
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Analyse Resultaten */}
                {angifteGegevens.analyseResultaat && (
                  <Card className={`border-2 ${
                    angifteGegevens.analyseResultaat.juridischeKwaliteit === 'goed' ? 'border-green-300 bg-green-50' :
                    angifteGegevens.analyseResultaat.juridischeKwaliteit === 'voldoende' ? 'border-yellow-300 bg-yellow-50' :
                    'border-red-300 bg-red-50'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          angifteGegevens.analyseResultaat.juridischeKwaliteit === 'goed' ? 'bg-green-100' :
                          angifteGegevens.analyseResultaat.juridischeKwaliteit === 'voldoende' ? 'bg-yellow-100' :
                          'bg-red-100'
                        }`}>
                          {angifteGegevens.analyseResultaat.juridischeKwaliteit === 'goed' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : angifteGegevens.analyseResultaat.juridischeKwaliteit === 'voldoende' ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold mb-2 ${
                            angifteGegevens.analyseResultaat.juridischeKwaliteit === 'goed' ? 'text-green-900' :
                            angifteGegevens.analyseResultaat.juridischeKwaliteit === 'voldoende' ? 'text-yellow-900' :
                            'text-red-900'
                          }`}>
                            Juridische Kwaliteit: {
                              angifteGegevens.analyseResultaat.juridischeKwaliteit === 'goed' ? 'Uitstekend' :
                              angifteGegevens.analyseResultaat.juridischeKwaliteit === 'voldoende' ? 'Voldoende' :
                              'Kan verbeterd worden'
                            }
                          </h4>

                          {/* Ontbrekende Elementen */}
                          {angifteGegevens.analyseResultaat.ontbrekendeElementen.length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-medium text-red-800 mb-2">Ontbrekende juridische elementen:</h5>
                              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                                {angifteGegevens.analyseResultaat.ontbrekendeElementen.map((element, index) => (
                                  <li key={index}>{element}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Aanvullende Vragen */}
                          {angifteGegevens.analyseResultaat.aanvullendeVragen.length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-medium text-blue-800 mb-2">Aanbevolen aanvullende informatie:</h5>
                              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                                {angifteGegevens.analyseResultaat.aanvullendeVragen.map((vraag, index) => (
                                  <li key={index}>{vraag}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Aanbevelingen */}
                          {angifteGegevens.analyseResultaat.aanbevelingen.length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-medium text-purple-800 mb-2">Aanbevelingen:</h5>
                              <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
                                {angifteGegevens.analyseResultaat.aanbevelingen.map((aanbeveling, index) => (
                                  <li key={index}>{aanbeveling}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex gap-2 mt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={startAnalyse}
                              disabled={angifteGegevens.isAnalyseren}
                            >
                              {angifteGegevens.isAnalyseren ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Analyseren...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Opnieuw Controleren
                                </>
                              )}
                            </Button>
                            {angifteGegevens.analyseResultaat.juridischeKwaliteit === 'goed' && (
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                ✓ Juridisch compleet
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 4: Download */}
            {huidigeStap === 4 && (
              <div className="space-y-6">
                {angifteGegevens.isGenererend ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Uw aangifte wordt gegenereerd...
                    </h3>
                    <p className="text-gray-600">
                      Er wordt een professionele aangifte voor u samengesteld met alle juridische bestanddelen.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Uw aangifte is klaar!
                      </h3>
                      <p className="text-gray-600">
                        Download het bestand en gebruik het als ondersteuning bij uw online aangifte of neem het mee naar het politiebureau.
                      </p>
                    </div>

                    {angifteGegevens.gegenereerdeAangifte && (
                      <Card className="bg-gray-50 max-h-96 overflow-y-auto">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-3">Voorvertoning van uw aangifte:</h4>
                          <div className="text-sm whitespace-pre-wrap text-gray-800 mb-3">
                            {angifteGegevens.gegenereerdeAangifte.substring(0, 500)}
                            {angifteGegevens.gegenereerdeAangifte.length > 500 && '...'}
                          </div>
                          {angifteGegevens.gegenereerdeAangifte.length > 500 && (
                            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border">
                              <Info className="h-3 w-3 inline mr-1" />
                              Dit is slechts een voorvertoning. Download het volledige bestand voor de gehele aangifte.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                                         <Card className="bg-blue-50">
                       <CardContent className="p-4">
                         <h4 className="font-semibold mb-2 text-blue-900">Samenvatting van uw aangifte:</h4>
                         <div className="text-sm space-y-2 text-blue-800">
                           <p><strong>Type delict:</strong> {angifteGegevens.aangepastDelict?.naam || angifteGegevens.delictType?.naam}</p>
                           <p><strong>Juridische basis:</strong> {angifteGegevens.aangepastDelict?.juridischeBasis || angifteGegevens.delictType?.juridischeBasis}</p>
                           <p><strong>Beantwoorde vragen:</strong> {Object.keys(angifteGegevens.antwoorden).length}</p>
                           <p><strong>Eigen beschrijving:</strong> {angifteGegevens.vrijeTekst.length} karakters</p>
                           {angifteGegevens.aangepastDelict && (
                             <p className="text-xs bg-blue-100 p-2 rounded"><strong>Opmerking:</strong> Dit delicttype is automatisch bepaald op basis van uw beschrijving</p>
                           )}
                         </div>
                       </CardContent>
                     </Card>

                    <Button 
                      size="lg" 
                      className="w-full"
                      onClick={downloadAangifte}
                      disabled={!angifteGegevens.gegenereerdeAangifte}
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download Aangifte (.txt)
                    </Button>

                    {/* Directe link naar politie.nl */}
                    <Card className="mt-4 border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <ArrowRight className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-blue-900 mb-1">Klaar om aangifte te doen?</h4>
                            <p className="text-sm text-blue-800 mb-3">
                              Ga direct naar de officiële website van de politie om uw aangifte in te dienen.
                            </p>
                            <a 
                              href="https://www.politie.nl/aangifte" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-block"
                            >
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-blue-700 border-blue-300 hover:bg-blue-100"
                              >
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Ga naar Politie.nl/aangifte
                              </Button>
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Banner voor opslaan */}
                    <Card className="mt-4 border-amber-200 bg-amber-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-amber-900 mb-1">Aangifte opslaan</h4>
                            <p className="text-sm text-amber-800 mb-3">
                              Voor het opslaan van uw aangiftes moet u ingelogd zijn. Hierdoor kunt u later terugkeren om uw aangifte te bewerken of opnieuw te downloaden.
                            </p>
                            {session ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={async () => {
                                  // Opslaan functionaliteit
                                  try {
                                    const response = await fetch('/api/user/aangiftes', {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({
                                        delictType: angifteGegevens.aangepastDelict?.naam || angifteGegevens.delictType?.naam,
                                        antwoorden: angifteGegevens.antwoorden,
                                        vrijeTekst: angifteGegevens.vrijeTekst,
                                        gegenereerdeAangifte: angifteGegevens.gegenereerdeAangifte,
                                        isCustomType: !!angifteGegevens.aangepastDelict,
                                        zoekopdracht: angifteGegevens.zoekopdracht
                                      }),
                                    })
                                    
                                    if (response.ok) {
                                      alert('Aangifte succesvol opgeslagen!')
                                    } else {
                                      alert('Fout bij opslaan aangifte')
                                    }
                                  } catch (error) {
                                    console.error('Error saving aangifte:', error)
                                    alert('Fout bij opslaan aangifte')
                                  }
                                }}
                                className="text-amber-700 border-amber-300 hover:bg-amber-100"
                              >
                                <Lock className="h-4 w-4 mr-2" />
                                Aangifte Opslaan
                              </Button>
                            ) : (
                              <Link href="/auth/signin">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-amber-700 border-amber-300 hover:bg-amber-100"
                                >
                                  <Lock className="h-4 w-4 mr-2" />
                                  Inloggen om op te slaan
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={vorigeStap}
            disabled={huidigeStap === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Vorige
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAngifteGegevens({ 
                  antwoorden: {}, 
                  vrijeTekst: '', 
                  voltooideStappen: 0,
                  gegenereerdeAangifte: undefined,
                  aangepastDelict: undefined,
                  aangepassteVragen: undefined,
                  zoekopdracht: undefined
                })
                setHuidigeStap(1)
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Opnieuw beginnen
            </Button>

            <Button
              onClick={volgendeStap}
              disabled={!kanDoorgaan || huidigeStap === totaalStappen || angifteGegevens.isGenererend}
            >
              {angifteGegevens.isGenererend ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Genereren...
                </>
              ) : huidigeStap === totaalStappen ? (
                'Voltooid'
              ) : (
                <>
                  Volgende
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Footer Info */}
        <Card className="mt-8 border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Belangrijk te weten:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Dit is een hulpmiddel voor het voorbereiden van uw aangifte</li>
                  <li>De daadwerkelijke aangifte moet worden gedaan bij de politie</li>
                  <li>Bewaar het gegenereerde bestand als voorbereiding voor uw bezoek</li>
                  <li>Bij spoed of direct gevaar: bel altijd 112</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 