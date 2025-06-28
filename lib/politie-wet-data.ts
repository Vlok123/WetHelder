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
      articleCount: 2
    },
    {
      slug: 'verkeer',
      title: 'Verkeer',
      description: 'Politiebevoegdheden op de weg, blaastest, stopteken',
      icon: 'Car',
      color: 'bg-orange-100 text-orange-800',
      articleCount: 2
    },
    {
      slug: 'opsporing',
      title: 'Opsporing & Aanhouding',
      description: 'Wanneer en hoe mag iemand worden aangehouden?',
      icon: 'AlertCircle',
      color: 'bg-red-100 text-red-800',
      articleCount: 2
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
      description: 'Uitgebreide gids over verplichtingen bij verkeerscontroles, wat de politie mag controleren binnen en buiten je voertuig.',
      category: 'Verkeer',
      categorySlug: 'verkeer',
      seoTitle: 'Moet ik meewerken aan een algemene verkeerscontrole?',
      seoDescription: 'Volledige uitleg over verkeerscontroles: wat mag de politie controleren, je rechten en plichten, wetgeving en praktijkvoorbeelden.',
      readTime: '12 min lezen',
      lastUpdated: '2025-06-28',
      views: 1247,
      tags: ['verkeerscontrole', 'wegenverkeerswet', 'reglement voertuigen', 'rijbewijs', 'alcohol', 'drugs', 'technische controle'],
      featured: true,
      content: `## Kort antwoord

Ja, je bent verplicht mee te werken aan een algemene verkeerscontrole. De politie mag je rijbewijs, kentekenbewijs, identiteitsbewijs en de technische staat van je voertuig controleren, net als alcohol- of drugsgebruik.

---

## Uitgebreide uitleg

### Wettelijke basis: artikel 160 Wegenverkeerswet 1994

De politie mag je tijdens een verkeerscontrole laten stoppen en controleren op grond van artikel 160 van de Wegenverkeerswet 1994. Dit artikel geeft agenten de bevoegdheid om:

* Je te laten stoppen (lid 1).
* Te vragen naar je rijbewijs, kentekenbewijs en identiteitsbewijs (lid 1).
* Jou te verplichten mee te werken aan onderzoeken, bijvoorbeeld een blaastest (lid 5).

Er hoeft geen sprake te zijn van een verdenking. Het mag gaan om een algemene controle, bijvoorbeeld op snelheid, voertuigveiligheid of alcoholgebruik.

### Wat kan de politie controleren?

Tijdens een algemene verkeerscontrole kunnen de volgende zaken aan bod komen:

* Identiteitsbewijs
* Rijbewijs
* Kentekenbewijs
* Verzekeringsstatus (via kentekencontrole)
* Alcohol- of drugsgebruik (blaastest of speekseltest)
* Technische staat van het voertuig (banden, remmen, verlichting)
* Verplichte uitrusting en functies in je voertuig

### Wat mag de politie controleren in je auto?

De politie mag op basis van het Reglement voertuigen ook controleren of onderdelen in je auto aanwezig zijn en voldoen aan de zogenoemde permanente eisen. Dit zijn eisen die altijd gelden – ook als je auto recent is goedgekeurd voor de APK.

Voorbeelden van wat de politie mag controleren binnen je voertuig:

* Rubberlaag op rem- en gaspedaal – mag niet glad of versleten zijn (artikel 5.2.45 lid 1 onder d Reglement voertuigen).
* Spiegels (binnen en/of buiten) – moeten voldoende zicht bieden (artikel 5.2.49 Reglement voertuigen).
* Vrij zicht naar voren en opzij – geen belemmering door folie of voorwerpen (artikel 5.2.47 en artikel 5.2.48 Reglement voertuigen).
* Dashboardverlichting en controlelampjes – moeten leesbaar en werkend zijn (artikel 5.2.55 Reglement voertuigen).
* Claxon – moet goed hoorbaar en correct werkend zijn (artikel 5.2.60 Reglement voertuigen).
* Stoelen en bevestiging daarvan – moeten stevig vastzitten (artikel 5.2.50 Reglement voertuigen).
* Gordels en bevestigingssystemen – moeten functioneren en aanwezig zijn (artikel 5.2.51 Reglement voertuigen).

Als één van deze zaken niet in orde is, kan de politie een waarschuwing geven of proces-verbaal opmaken – zelfs als je auto eerder dat jaar door de APK is gekomen.

### Praktijkvoorbeeld

Je rijdt op een vrijdagmiddag richting huis en ziet een politiecontrole bij een afrit. Je wordt naar een controleplek geleid. Een agent vraagt je rijbewijs, kentekenbewijs en ID-kaart. Daarna controleert hij je banden, verlichting en vraagt of je claxon werkt. Hij kijkt naar de gordels, de spiegels en merkt op dat het rubber op je rempedaal glad is. Tot slot moet je een blaastest doen. Alles wat hier gebeurt is wettelijk toegestaan – je bent verplicht om hieraan mee te werken.

---

## Rechten & plichten van de burger

* Plichten:
  * Je moet je rijbewijs, kentekenbewijs en ID tonen op verzoek (artikel 160 lid 1 Wegenverkeerswet 1994).
  * Je moet aanwijzingen opvolgen en meewerken aan controles (artikel 160 lid 5 Wegenverkeerswet 1994).
  * Je voertuig moet voldoen aan de technische en functionele eisen (hoofdstuk 5.2 Reglement voertuigen).

* Rechten:
  * Je mag vragen waarom je wordt gecontroleerd, maar de politie hoeft geen specifieke verdenking te hebben.
  * Je mag achteraf een klacht indienen als je vindt dat de controle niet correct is verlopen.

---

## Wat kun je doen?

Als je twijfelt aan de controle of je voelt je onjuist behandeld, kun je:

* Klacht indienen bij de politie via [politie.nl/klachten](https://politie.nl/klachten).
* Juridisch advies inwinnen via het Juridisch Loket, een advocaat of je rechtsbijstand.
* Bezwaar maken tegen een boete bij de officier van justitie (zie instructies op de boetebrief).

---

## Gerelateerde regelgeving

* Wegenverkeerswet 1994 artikel 160 – Bevoegdheden politie bij verkeerscontrole.
* Reglement voertuigen hoofdstuk 5.2 – Eisen aan voertuigonderdelen en functies.
* Besluit alcohol, drugs en geneesmiddelen in het verkeer – Regels voor testmethodes.
* Besluit administratieve bepalingen inzake het wegverkeer (BABW) – Inrichting van verkeerscontroles.

---

## Belangrijke rechtspraak en beleid

* Hoge Raad 19 december 1995, NJ 1996, 249 (verkeerscontrole-arrest) – De Hoge Raad oordeelde dat verkeerscontroles zonder verdenking zijn toegestaan, mits duidelijk herkenbaar en binnen de wettelijke kaders.

---

Laatst gecheckt: 28 juni 2025  
Disclaimer: Dit is algemene informatie; uitzonderingen zijn mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'door-rood-licht-zonder-sirene',
      title: 'Mag de politie door rood licht rijden zonder zwaailicht en sirene?',
      description: 'Alles over wanneer de politie van verkeersregels mag afwijken zonder optische en geluidssignalen.',
      category: 'Verkeer',
      categorySlug: 'verkeer',
      seoTitle: 'Mag de politie door rood licht rijden zonder zwaailicht en sirene?',
      seoDescription: 'Uitleg over artikel 91 RVV 1990: wanneer politie van verkeersregels mag afwijken zonder signalen, je rechten en klachtmogelijkheden.',
      readTime: '8 min lezen',
      lastUpdated: '2025-06-28',
      views: 892,
      tags: ['verkeersregels', 'politie', 'RVV 1990', 'artikel 91', 'artikel 29', 'hulpdiensten', 'spoedeisend'],
      featured: true,
      content: `## Kort antwoord

Ja, dat mag. De wet staat het toe dat de politie zonder zwaailicht en sirene van verkeersregels afwijkt als dat noodzakelijk is voor het uitvoeren van hun taak.

---

## Uitgebreide uitleg

### Uitzondering op de regel: artikel 91 RVV 1990

Artikel 91 Reglement verkeersregels en verkeerstekens 1990 (RVV 1990) geeft politievoertuigen de ruimte om van verkeersregels af te wijken, ook zonder optische en geluidssignalen, als dat nodig is voor het uitvoeren van hun taak.

Daar staat letterlijk:

"De artikelen 5 tot en met 89 zijn niet van toepassing op bestuurders van voertuigen van de politie, brandweer of ambulance die een taak uitoefenen waarvoor een uitzondering van die bepalingen noodzakelijk is."

Dit betekent dat de politie ook zonder zwaailicht en sirene bijvoorbeeld door rood mag rijden – mits dat noodzakelijk is voor het uitoefenen van hun taak.

### Uitleg: verschil met artikel 29 RVV 1990

Artikel 29 RVV 1990 zegt dat hulpdiensten alleen van verkeersregels mogen afwijken met zwaailicht en sirene. Maar dat geldt voor alle gewone hulpdiensten die deelnemen aan het verkeer.

Artikel 91 RVV 1990 is een bijzondere uitzondering die alleen geldt voor:

* Politie
* Brandweer  
* Ambulancedienst

Zij mogen dus – als het noodzakelijk is voor hun werk – van verkeersregels afwijken, ook als ze geen zwaailicht en sirene gebruiken. Het moet dan gaan om een taak waarbij het gebruik van die signalen niet wenselijk of mogelijk is, bijvoorbeeld bij:

* een stille observatie
* het ongezien naderen van een verdachte
* een ongeplande situatie waarbij snel optreden nodig is, maar sirene/zwaailicht de inzet zou verstoren

### Praktijkvoorbeeld

Een politiebusje rijdt zonder zwaailicht of sirene door rood. In het voertuig zitten agenten in burger, op weg naar een heterdaadmelding van huiselijk geweld waarbij de verdachte mogelijk vluchtgevaarlijk is.

In deze situatie mogen zij door rood rijden zonder signalen, omdat de inzet spoedeisend is en onopvallend moet blijven.

---

## Rechten & plichten van de burger

* Rechten:
  * Je hebt het recht om je af te vragen of het rijgedrag van de politie verantwoord is en kunt dit melden (gebaseerd op Politiewet 2012 artikel 13: klachtrecht).

* Plichten:
  * Je hebt de plicht om geen hinder te veroorzaken bij het uitvoeren van een politie-inzet, ook als die onopvallend is (gebaseerd op artikel 5 Wegenverkeerswet 1994).

---

## Wat kun je doen?

### Heb je zorgen over verkeersgedrag van de politie?

Dien een klacht in via politie.nl > 'Klacht indienen'.

### Twijfel je of het terecht was?

Je kunt het ook melden bij de Nationale Ombudsman als je klacht niet serieus genomen wordt.

---

## Gerelateerde regelgeving

* Artikel 91 RVV 1990 – Politie mag van verkeersregels afwijken als dat nodig is voor hun taak, ook zonder signalen.
* Artikel 29 RVV 1990 – Regelt de algemene plicht voor zwaailicht en sirene bij hulpdiensten (maar artikel 91 gaat hier dus boven).
* Besluit optische en geluidssignalen 2009 – Geeft aan welke voertuigen signalen mogen gebruiken en wanneer.

---

## Belangrijke rechtspraak

* ECLI:NL:HR:2009:BH4266 – Bevestigt dat politie onder voorwaarden verkeersregels mag negeren, mits noodzakelijk en met zorgvuldigheid.

---

Laatst gecheckt: 28 juni 2025  
Disclaimer: Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'betreden-tuin-zonder-machtiging',
      title: 'Mag een agent zonder machtiging een tuin betreden voor onderzoek of inbeslagname?',
      description: 'Wanneer mag de politie tuinen, schuren en andere niet-woningen betreden zonder machtiging voor onderzoek of inbeslagname.',
      category: 'Opsporing & Aanhouding',
      categorySlug: 'opsporing',
      seoTitle: 'Mag politie zonder machtiging een tuin betreden voor onderzoek?',
      seoDescription: 'Uitleg over wanneer de politie tuinen, schuren en bijgebouwen mag betreden zonder machtiging, wettelijke basis en je rechten.',
      readTime: '6 min lezen',
      lastUpdated: '2025-06-28',
      views: 0,
      tags: ['binnentreden', 'woning', 'tuin', 'onderzoek', 'inbeslagname', 'awbi', 'machtiging'],
      featured: true,
      content: `## Kort antwoord

Ja, een agent mag **zonder machtiging** een terrein betreden dat **geen woning is**, bijvoorbeeld een tuin, schuur of garage, **om bewijs veilig te stellen of onderzoek te doen**. Gaat het echter om een **besloten erf dat als woning geldt**, dan is **wél een machtiging tot binnentreden nodig**, behalve bij spoed of heterdaad.

---

## Uitgebreide uitleg

### Wat zegt de wet?

Een **woning** is extra beschermd in de wet. Maar veel andere plekken – zoals een tuin, schuurtje, bedrijfshal of auto – **vallen daar niet standaard onder**. Voor het betreden van die plekken geldt dus **een lagere drempel**.

De politie mag deze plekken betreden in het kader van hun taken, zoals:

* **Aanhouding van een verdachte**
* **Inbeslagname van voorwerpen**
* **Doorzoeking in het belang van een onderzoek**

### Maar let op: "woning" wordt breed geïnterpreteerd

Volgens de **Algemene wet op het binnentreden (Awbi)** kan een **besloten erf of bijgebouw** óók een 'woning' zijn, als het gebruikt wordt als privéruimte. Denk aan:

* Een **ommuurde achtertuin** waar mensen vaak zitten
* Een **tuinhuisje** dat als logeerkamer wordt gebruikt
* Een **garage** die direct toegang geeft tot een huis

Daarvoor is dan **toch een machtiging nodig**.

### Wettelijke basis

* **Artikel 1 lid 1 sub b Algemene wet op het binnentreden (Awbi)** – definitie van woning, inclusief besloten erven die als woonruimte fungeren.
* **Artikel 2 Awbi** – machtiging verplicht voor binnentreden van woning.
* **Artikel 96b Wetboek van Strafvordering (Sv)** – politie mag zonder machtiging plaatsen betreden **die geen woning zijn**, bij ontdekking op heterdaad of verdenking van een strafbaar feit.
* **Artikel 96c Sv** – doorzoeking ter inbeslagneming in niet-woning mag ook zonder machtiging.
* **Artikel 55 Sv** – bevoegdheid om voorwerpen in beslag te nemen die voor het onderzoek van belang zijn.

---

## Praktijkvoorbeeld

Stel: de politie verdenkt iemand van hennepteelt. Ze ruiken vanaf de straat een sterke geur.

De **voortuin is open**, dus daar mogen ze gewoon in.

In de **achtertuin staat een afgesloten schuur**.

Als die schuur niet als woning wordt gebruikt, mogen ze daar zonder machtiging in – **mits er sprake is van verdenking**.

Is die schuur echter ingericht als slaapkamer of woonkamer? Dan **is het een woning** en is er **een machtiging tot binnentreden nodig**.

---

## Rechten & plichten van de burger

* **Je mag vragen op basis waarvan de politie binnentreedt** (Artikel 9 Awbi).
* **Je hebt geen toestemming nodig te geven** als er een geldige reden is voor binnentreden zonder machtiging (Artikel 96b Sv).
* **Je bent verplicht toegang te geven** bij een geldige machtiging of wettige bevoegdheid.
* **Je hebt recht op een bewijs van binnentreden** (bijvoorbeeld een formulier of uitleg achteraf).

---

## Wat kun je doen?

* **Vraag altijd** of je met een woning of niet-woning te maken hebt.
* Twijfel je of binnentreden rechtmatig was? Dien dan een **klacht in bij de politie** of de **Nationale Ombudsman**.
* Bij schade of onrechtmatige inbeslagname kun je naar een **advocaat of het Juridisch Loket** stappen.
* Vraag eventueel om **inzage in het proces-verbaal van binnentreden**.

---

## Gerelateerde regelgeving

* **Algemene wet op het binnentreden (Awbi)** – regels over machtigingen en woningbegrip.
* **Wetboek van Strafvordering artikelen 96b t/m 96g** – bevoegdheden voor inbeslagname en betreden niet-woningen.
* **Politiewet 2012 artikel 3** – taakomschrijving politie (waaronder opsporing en handhaving).

---

## Belangrijke rechtspraak

* **HR 10-11-2009, ECLI:NL:HR:2009:BI7099** – schuur op erf werd aangemerkt als woning, binnentreden zonder machtiging was onrechtmatig.
* **HR 27-10-2015, ECLI:NL:HR:2015:3122** – doorzoeking bedrijfspand zonder machtiging was toegestaan.

---

Laatst gecheckt: 28 juni 2025  
Disclaimer: Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'politie-verplicht-aangifte-opnemen',
      title: 'Is de politie verplicht om een aangifte van mij op te nemen als ik dat wil?',
      description: 'Alles over je recht om aangifte te doen en de plicht van de politie om deze op te nemen volgens artikel 163 Wetboek van Strafvordering.',
      category: 'Opsporing & Aanhouding',
      categorySlug: 'opsporing',
      seoTitle: 'Is de politie verplicht om een aangifte op te nemen? - WetHelder',
      seoDescription: 'Uitleg over je recht om aangifte te doen en de plicht van de politie om deze op te nemen volgens artikel 163 Wetboek van Strafvordering.',
      readTime: '7 min lezen',
      lastUpdated: '2025-01-11',
      views: 0,
      tags: ['aangifte', 'politie', 'proces-verbaal', 'artikel 163', 'wetboek van strafvordering', 'rechten', 'plichten'],
      featured: true,
      content: `## Kort antwoord

Ja, de politie is verplicht om jouw aangifte op te nemen als je slachtoffer of getuige bent van een strafbaar feit. Dat staat in artikel 163 lid 1 van het Wetboek van Strafvordering.

---

## Uitgebreide uitleg

### Wat zegt de wet?

Volgens **artikel 163 lid 1 Wetboek van Strafvordering** is de politie verplicht om proces-verbaal op te maken als iemand melding doet van een strafbaar feit. Dit betekent dat zij jouw aangifte niet zomaar mogen weigeren.

> **Artikel 163 lid 1 Wetboek van Strafvordering:**
> "Iedereen die kennis draagt van een strafbaar feit kan daarvan aangifte doen. Ambtenaren van politie zijn verplicht tot het opmaken van proces-verbaal."

Let op: dit geldt voor **strafbare feiten**. Bij civiele zaken (zoals burenruzies of contractproblemen) is dit niet van toepassing.

---

### Wat betekent dit in de praktijk?

Als jij naar het politiebureau gaat, of via internet aangifte wilt doen, moet de politie jouw aangifte aannemen als je iets strafbaars meldt. Ze mogen jou niet wegsturen met de mededeling "dit is geen prioriteit" of "we doen er toch niks mee". De beoordeling of het strafbaar is, mag pas **na** de aangifte volgen, niet ervoor.

---

### Praktijkvoorbeeld

Je fiets wordt gestolen bij het station. Je loopt naar het politiebureau om aangifte te doen. De agent zegt: "We hebben het druk, doe maar geen aangifte, dit gebeurt toch dagelijks."

Dat mag dus niet. Jij hebt recht op het doen van aangifte, en de politie is verplicht dit op te nemen – óók als ze er op dat moment weinig mee kunnen.

---

## Rechten & plichten van de burger

**Bron:** Wetboek van Strafvordering artikel 163

* ✅ Je hebt **het recht om aangifte te doen** van een strafbaar feit.
* ✅ De politie heeft **de plicht om je aangifte op te nemen**.
* ❌ De politie mag **niet weigeren** omdat iets "te klein" of "geen prioriteit" zou zijn.
* ✅ Je mag vragen om een **afschrift van je aangifte** (artikel 163 lid 5 Wetboek van Strafvordering).

---

## Wat kun je doen?

Als de politie weigert jouw aangifte op te nemen:

1. **Vraag beleefd om de reden** van weigering – leg uit dat jij recht hebt op het doen van aangifte.
2. **Noteer naam en nummer** van de agent en meld het bij een leidinggevende.
3. **Dien een klacht in** via [www.politie.nl/klacht](https://www.politie.nl/klacht).
4. **Neem contact op met het Juridisch Loket** voor advies.
5. Je kunt ook **aangifte doen via internet** bij eenvoudige zaken: [www.politie.nl/aangifte](https://www.politie.nl/aangifte)

---

## Gerelateerde regelgeving

* **Artikel 163 Wetboek van Strafvordering** – aangifteplicht politie
* **Artikel 164 Wetboek van Strafvordering** – opmaken proces-verbaal
* **Politiewet 2012 artikel 3** – taak van de politie (waaronder opsporing)
* **Wet politiegegevens artikel 8** – registratie van aangiften en klachten

---

## Belangrijke rechtspraak of beleidsdocumenten

1. **Kamerbrief over aangifteweigering (2019)** – Minister van Justitie bevestigt: *aangifte mag niet geweigerd worden zonder juridische reden.*
2. **Inspectie Justitie en Veiligheid (2015)** – signaleert dat sommige politie-eenheden onterecht aangiftes weigeren.
3. **Rapport Nationale Ombudsman "Geen aangifte doen is geen optie" (2020)** – bekritiseert het weren van burgers met een legitieme klacht.

---

Laatst gecheckt: 11 januari 2025  
Disclaimer: Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'fouilleren-transport-insluiting',
      title: 'Wanneer mag de politie mij fouilleren – inclusief bij transport en insluiting?',
      description: 'Uitgebreide uitleg over alle soorten fouilleringen: veiligheidsfouillering, aanhouding, transport, insluiting en lichamelijk onderzoek.',
      category: 'Identificatie & Fouilleren',
      categorySlug: 'id-fouilleren',
      seoTitle: 'Wanneer mag de politie mij fouilleren bij transport en insluiting?',
      seoDescription: 'Complete uitleg over alle soorten fouilleringen door de politie: wanneer het mag, wettelijke basis en je rechten bij transport en insluiting.',
      readTime: '8 min lezen',
      lastUpdated: '2025-01-11',
      views: 0,
      tags: ['fouilleren', 'veiligheidsfouillering', 'transport', 'insluiting', 'lichamelijk onderzoek', 'politiewet', 'strafvordering'],
      featured: true,
      content: `## Kort antwoord

De politie mag je fouilleren als je wordt aangehouden, vervoerd of ingesloten, maar dit moet wel passen binnen de wet. Er zijn verschillende soorten fouilleringen met elk hun eigen regels en voorwaarden.

---

## Uitgebreide uitleg: soorten fouillering en wanneer het mag

Fouilleren is een inbreuk op jouw privacy en lichamelijke integriteit, dus mag alleen als de wet het toestaat. Er zijn verschillende vormen van fouillering, afhankelijk van de situatie. Hieronder leggen we ze uit, inclusief wat geldt bij vervoer (transport) en insluiting op het politiebureau.

---

### 1. **Veiligheidsfouillering – bij dreiging van gevaar**

De politie mag je fouilleren als zij denken dat je een wapen of gevaarlijk voorwerp bij je hebt.

* Dit mag zonder dat je bent aangehouden.
* Alleen bij een **concrete aanleiding**, bijvoorbeeld als je dreigend gedrag vertoont.
* **Alleen over de kleding heen**, tenzij er meer aanleiding is.

📘 *artikel 7 lid 3 Politiewet 2012*

---

### 2. **Fouillering na aanhouding – op zoek naar bewijs of gevaarlijke voorwerpen**

Ben je aangehouden? Dan mag de politie je fouilleren om:

* **bewijsmateriaal** te vinden,
* te voorkomen dat je **iets wegmaakt**,
* of om **gevaarlijke spullen** weg te nemen.

Let op: dit is uitgebreider dan een veiligheidsfouillering.

* Je kleding mag worden doorzocht.
* Soms wordt ook je lichaam onderzocht (zie punt 5).

📘 *artikel 56 lid 4 Wetboek van Strafvordering*

---

### 3. **Insluitingsfouillering – bij opsluiting op het bureau**

Word je ingesloten op het politiebureau (in een cel)? Dan volgt vaak een **insluitingsfouillering**.

* Deze mag **standaard** worden uitgevoerd bij insluiting.
* Doel: veiligheid van jou, agenten en anderen in de cel.
* Hierbij mogen ook persoonlijke spullen worden ingenomen (zoals riemen, veters, sieraden).

Er is meestal geen aparte toestemming voor nodig als de fouillering beperkt blijft tot kleding.
Bij verder onderzoek gelden zwaardere regels (zie punt 5).

📘 *Gebaseerd op praktijk en interne richtlijnen politie, steunend op artikel 9 lid 1 Politiewet 2012*

---

### 4. **Transportfouillering – vóór vervoer naar cel of rechtbank**

Word je vervoerd door de politie (bijvoorbeeld van bureau naar rechtbank of cellencomplex)? Dan mag een **transportfouillering** worden uitgevoerd.

* Dit is bedoeld om te voorkomen dat je wapens, drugs of andere verboden voorwerpen meeneemt.
* Deze mag **voor en na transport** worden gedaan.

De wet noemt dit niet letterlijk, maar de bevoegdheid komt voort uit het belang van veiligheid tijdens vervoer.

📘 *Afgeleid van artikel 9 lid 1 Politiewet 2012 (taakuitvoering) en jurisprudentie*

---

### 5. **Lichamelijk onderzoek – verder dan kleding, zoals lichaamsholtes**

Soms is er aanleiding om dieper te fouilleren: ondergoed, lichaamsholtes of medische onderzoeken.

* Hiervoor is **altijd toestemming nodig** van een **officier van justitie** of **rechter-commissaris**.
* Dit gebeurt vaak in het bijzijn van een arts of medisch deskundige.
* Het mag **alleen als het echt nodig is** voor bewijs of veiligheid.

📘 *artikel 61a en 62 Wetboek van Strafvordering*

---

## Praktijkvoorbeeld

Een persoon wordt aangehouden wegens het dragen van een mes. De agenten doen een veiligheidsfouillering op straat. Daarna volgt bij aankomst op het bureau een **insluitingsfouillering** om te controleren of de persoon geen andere wapens bij zich draagt. Voor het transport naar de rechtbank gebeurt een korte **transportfouillering**, opnieuw om de veiligheid te waarborgen. Als er een vermoeden is dat de persoon drugs heeft ingeslikt, moet de politie eerst toestemming vragen voor een **lichamelijk onderzoek** door een arts.

---

## Rechten & plichten van de burger

**Bron:** Politiewet 2012, Wetboek van Strafvordering

* ✅ Je **moet meewerken** aan een rechtmatige fouillering.
* ✅ Je mag **vragen naar de reden** van de fouillering.
* ❌ Je mag je **niet verzetten**, ook niet als je het er niet mee eens bent.
* ✅ Je mag **een klacht indienen** als je vindt dat het onterecht of onzorgvuldig is gedaan.
* ✅ Je hebt recht op een **behoorlijke behandeling**, zeker bij lichamelijk onderzoek.

---

## Wat kun je doen?

* Vraag **waarom** je gefouilleerd wordt en **op basis van welke wet**.
* Noteer indien mogelijk de **naam of het nummer van de agent**.
* Word je dieper onderzocht? Vraag dan wie de toestemming heeft gegeven.
* Klacht indienen:
  * bij de **politie** zelf,
  * of bij de **Nationale Ombudsman**.
* Overweeg advies van het **Juridisch Loket** of een advocaat.

---

## Gerelateerde regelgeving

* **artikel 7 lid 3 Politiewet 2012** – Veiligheidsfouillering bij dreiging
* **artikel 9 lid 1 Politiewet 2012** – Bevoegdheid uitvoering politietaak (o.a. transport)
* **artikel 151b Gemeentewet** – Preventief fouilleren in risicogebied
* **artikel 56 lid 4 Wetboek van Strafvordering** – Fouillering na aanhouding
* **artikel 61a en 62 Wetboek van Strafvordering** – Lichamelijk onderzoek

---

## Belangrijke rechtspraak en documenten

* **ECLI:NL:HR:2008:BC7947** – Hoge Raad stelt: er moet altijd sprake zijn van concrete aanleiding bij veiligheidsfouillering.
* **Richtlijn Insluiting Politie (Landelijke Politie)** – Interne procedure voor fouillering bij insluiting.
* **Handleiding Strafvordering 2024** – Geeft richtlijnen voor fouilleren bij vervoer en insluiting.

---

Laatst gecheckt: 11 januari 2025  
Disclaimer: Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    }
  ] as PolitieWetArticle[]
} 