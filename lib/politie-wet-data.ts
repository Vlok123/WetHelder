// Data structure for Police Law articles
// In a real implementation, this would come from a database or CMS

export interface PolitieWetArticle {
  slug: string
  title: string
  description: string
  content: string
  category: string
  categorySlug: string
  seoTitle: string
  seoDescription: string
  readTime: string
  lastUpdated: string
  views: number
  tags: string[]
  featured?: boolean
}

export interface PolitieWetCategory {
  slug: string
  title: string
  description: string
  icon: string
  color: string
  articleCount: number
}

export const politieWetData = {
  categories: [
    {
      slug: 'bevoegdheden',
      title: 'Algemene Bevoegdheden',
      description: 'Welke handelingen mag de politie verrichten?',
      icon: 'Shield',
      color: 'bg-blue-100 text-blue-800',
      articleCount: 0
    },
    {
      slug: 'id-fouilleren',
      title: 'Identificatie & Fouilleren',
      description: 'Alles over ID-plicht, fouilleren, veiligheidsfouillering',
      icon: 'Users',
      color: 'bg-green-100 text-green-800',
      articleCount: 1
    },
    {
      slug: 'verkeer',
      title: 'Verkeer',
      description: 'Politiebevoegdheden op de weg, blaastest, stopteken',
      icon: 'Car',
      color: 'bg-orange-100 text-orange-800',
      articleCount: 1
    },
    {
      slug: 'opsporing',
      title: 'Opsporing & Aanhouding',
      description: 'Wanneer en hoe mag iemand worden aangehouden?',
      icon: 'AlertCircle',
      color: 'bg-red-100 text-red-800',
      articleCount: 0
    },
    {
      slug: 'privacy',
      title: 'Privacy & Informatie',
      description: 'Camerabeelden, persoonsgegevens, inzagerecht',
      icon: 'Eye',
      color: 'bg-purple-100 text-purple-800',
      articleCount: 0
    },
    {
      slug: 'klacht',
      title: 'Klacht & Bezwaar',
      description: 'Hoe dien ik een klacht of bezwaar in tegen de politie?',
      icon: 'FileText',
      color: 'bg-yellow-100 text-yellow-800',
      articleCount: 0
    }
  ] as PolitieWetCategory[],

  articles: [
    {
      slug: 'id-controle-politie',
      title: 'Mag de politie mijn identiteit controleren?',
      description: 'Wanneer mag een agent je identiteitsbewijs vragen en wat zijn je rechten en plichten bij een ID-controle.',
      category: 'Identificatie & Fouilleren',
      categorySlug: 'id-fouilleren',
      seoTitle: 'Mag de politie mijn identiteit controleren?',
      seoDescription: 'Wanneer mag een agent je identiteitsbewijs vragen en wat zijn je rechten en plichten bij een ID-controle.',
      readTime: '4 min lezen',
      lastUpdated: '2025-06-28',
      views: 3247,
      tags: ['identificatie', 'ID-controle', 'rechten', 'plichten'],
      featured: true,
      content: `## Kort antwoord

Ja, een agent mag jouw identiteit controleren als dit nodig is voor zijn werk. Je bent verplicht om mee te werken en je ID-bewijs te tonen, maar de politie hoeft je niet te overtuigen waarom precies.

---

## Uitgebreide uitleg

### Wanneer mag de politie je identiteit controleren?

Een politieagent mag alleen om jouw identiteitsbewijs vragen als dit echt nodig is voor zijn taak. Dit kan niet zomaar altijd, maar alleen in specifieke situaties zoals beschreven in artikel 8 Politiewet 2012 en artikel 2 Wet op de identificatieplicht.

De belangrijkste situaties zijn:

* Als je verdacht wordt van een strafbaar feit (art. 27 lid 1 Wetboek van Strafvordering).
* Om ordeverstoring of gevaar te voorkomen (art. 8a Politiewet 2012).
* Bij verkeerscontroles (art. 160 Wegenverkeerswet 1994).
* Bij controles op bijvoorbeeld alcoholgebruik op straat (art. 20 Drank- en Horecawet).

### Praktijkvoorbeeld

Je loopt rond middernacht door een woonwijk. De politie krijgt een melding dat een persoon met een donkere jas en capuchon net gezien is bij een poging tot woninginbraak. Jij draagt exact die kleding en bevindt je bovendien vlakbij de woning waar de melding vandaan komt. De politieagent spreekt jou hierop aan en vraagt direct om je identiteitsbewijs om te controleren wie je bent en mogelijk verband te kunnen leggen met de poging tot inbraak.

### Wat als je geen ID kunt of wilt laten zien?

Als je geen identiteitsbewijs bij je hebt wanneer een agent hierom vraagt, riskeer je een boete. Dit is strafbaar volgens artikel 447e Wetboek van Strafrecht. Weiger je mee te werken, dan kun je zelfs worden aangehouden en meegenomen naar het politiebureau.

---

## Rechten & plichten van de burger

* Rechten:
  * Je hebt recht op correcte behandeling en uitleg door de politie, maar ze hoeven je niet uitgebreid te overtuigen van hun reden.

* Plichten:
  * Je bent verplicht om een geldig identiteitsbewijs te laten zien als hierom gevraagd wordt.
  * Je moet meewerken aan de controle.

---

## Wat kun je doen?

Als je twijfelt aan de reden van de controle of je voelt je onjuist behandeld, kun je:

* De agent ter plekke vragen waarom je gecontroleerd wordt (vriendelijk en rustig).
* Klacht indienen via [www.politie.nl](http://www.politie.nl).
* Advies vragen bij het Juridisch Loket.

---

## Gerelateerde regelgeving

* Wet op de identificatieplicht – Wanneer en hoe identificatie verplicht is.
* Politiewet 2012 – Algemene bevoegdheden politie.
* Wegenverkeerswet 1994 – Identificatie bij verkeerscontroles.
* Drank- en Horecawet – Identificatie bij alcoholcontroles.

---

## Belangrijke rechtspraak en beleid

* Hoge Raad, ECLI:NL:HR:2004:AO6092 – Identificatieplicht bij verdenking vereist duidelijke aanleiding.
* Raad van State, ECLI:NL:RVS:2016:2188 – Identiteitscontroles moeten redelijk en zorgvuldig zijn.

---

Laatst gecheckt: 28 juni 2025  
Disclaimer: Je mag vragen waarom je identiteit wordt gecontroleerd, maar de politie hoeft je niet te overtuigen van hun redenen. Dit is algemene informatie; uitzonderingen zijn mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'algemene-verkeerscontrole',
      title: 'Moet ik meewerken aan een algemene verkeerscontrole en wat kan er allemaal onderdeel van zijn?',
      description: 'Alles over je rechten en plichten bij algemene verkeerscontroles door de politie.',
      category: 'Verkeer',
      categorySlug: 'verkeer',
      seoTitle: 'Moet ik meewerken aan een algemene verkeerscontrole?',
      seoDescription: 'Uitleg over verplichtingen bij verkeerscontroles, wat er gecontroleerd kan worden en je rechten als bestuurder.',
      readTime: '6 min lezen',
      lastUpdated: '2025-06-28',
      views: 1247,
      tags: ['verkeerscontrole', 'meewerken', 'rijbewijs', 'alcohol', 'drugs'],
      featured: true,
      content: `## Vraag:

**Moet ik meewerken aan een algemene verkeerscontrole en wat kan er allemaal onderdeel van zijn?**

---

## Kort antwoord

Ja, je bent verplicht mee te werken aan een algemene verkeerscontrole. De politie kan hierbij onder andere je rijbewijs, kentekenbewijs, voertuigconditie en zaken **in** je voertuig controleren, evenals controles uitvoeren op alcohol en drugs.

---

## Uitgebreide uitleg

### Wanneer moet je meewerken?

Als bestuurder ben je wettelijk verplicht mee te werken aan een algemene verkeerscontrole. De politie mag deze controles uitvoeren zonder dat daarvoor een specifieke reden of verdenking nodig is. Dit gebeurt om de verkeersveiligheid te verbeteren en overtredingen op te sporen. De wettelijke basis hiervoor is **artikel 160 lid 1 en lid 5 van de Wegenverkeerswet 1994**.

### Wat kan worden gecontroleerd?

Bij een algemene verkeerscontrole kan de politie het volgende controleren:

* **Identiteit** (identiteitsbewijs)
* **Rijbewijs**
* **Kentekenbewijs** (deel IA, IB, deel II of kentekencard)
* **Technische staat van het voertuig** (zoals banden, verlichting, remmen, spiegels)
* **Verplichte uitrusting in je voertuig** (zoals gordels, gevarendriehoek, verbanddoos en brandblusser volgens het **Reglement voertuigen**)
* **Alcoholgebruik** (blaastest)
* **Drugsgebruik** (speekseltest)

Deze bevoegdheden helpen de politie om de verkeersveiligheid te bewaken en mogelijke overtredingen te ontdekken en voorkomen.

### Controle van zaken ín het voertuig

Op grond van het **Reglement voertuigen** mag de politie ook controleren of zaken binnen jouw voertuig aanwezig en in goede staat zijn. Denk hierbij aan:

* Veiligheidsgordels en kinderzitjes (**Reglement voertuigen, hoofdstuk 5, afdeling 1**)
* Gevarendriehoek en eventueel veiligheidsvest (**Reglement voertuigen, art. 5.18.42 en 5.18.43**)
* Verbanddoos (voor bedrijfsvoertuigen verplicht, zie **Reglement voertuigen art. 5.18.45**)
* Brandblusser (voor bepaalde voertuigen verplicht, zie **Reglement voertuigen art. 5.18.47**)

---

## Praktijkvoorbeeld

Stel: je rijdt terug van je werk en ziet een bord "algemene verkeerscontrole". Een agent geeft aan dat je moet stoppen. Hij vraagt je rijbewijs, kentekenbewijs en identiteitsbewijs te tonen en controleert vervolgens de banden en verlichting van je auto. Daarna kijkt hij in de auto of de veiligheidsgordels goed werken en of je een gevarendriehoek bij je hebt. Tot slot moet je meewerken aan een blaastest. Al deze controles zijn wettelijk toegestaan en verplicht om aan mee te werken.

---

## Rechten & plichten van de burger

**Plichten**:

* Meewerken aan aanwijzingen van de politie tijdens de controle (**Wegenverkeerswet 1994, art. 160 lid 5**).
* Rijbewijs, identiteitsbewijs en kentekenbewijs tonen wanneer hierom wordt gevraagd (**Wegenverkeerswet 1994, art. 160 lid 1**).
* Verplichte veiligheidsmiddelen en uitrusting in goede staat in je auto hebben (**Reglement voertuigen, art. 5.18.42 t/m 5.18.47**).

**Rechten**:

* Je mag vragen waarom je bent aangehouden, maar een uitgebreide reden hoeft niet per se gegeven te worden.
* Als je vindt dat er onrechtmatig gehandeld is, heb je achteraf het recht om een klacht in te dienen.

---

## Wat kun je doen?

* Heb je klachten over de uitvoering van de controle? Dan kun je een klacht indienen bij de politie via [politie.nl](https://www.politie.nl/klachten).
* Heb je twijfels over de rechtmatigheid van de controle of wil je juridisch advies? Neem contact op met het Juridisch Loket, een advocaat, of je rechtsbijstandverzekeraar.

---

## Gerelateerde regelgeving

* **Regeling voertuigen**: technische voorschriften voor voertuigen, bijvoorbeeld eisen aan verlichting, banden en remmen.
* **Besluit alcohol, drugs en geneesmiddelen in het verkeer**: regels voor het testen van alcohol- en drugsgebruik bij bestuurders.
* **Besluit administratieve bepalingen inzake het wegverkeer (BABW)**: voorwaarden waaronder verkeerscontroles worden uitgevoerd, zoals plaatsing van verkeersborden bij controles.

---

## Belangrijke rechtspraak of beleidsdocumenten

* **Hoge Raad 19 december 1995, NJ 1996, 249 (verkeerscontrole-arrest)**: bevestigt dat algemene, willekeurige verkeerscontroles zonder verdenking toegestaan zijn, mits duidelijk herkenbaar als controle.

---

**Laatst gecheckt:** 28 juni 2025
*Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.*`
    }
  ] as PolitieWetArticle[]
} 