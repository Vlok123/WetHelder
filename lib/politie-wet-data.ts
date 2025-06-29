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
      articleCount: 1
    },
    {
      slug: 'id-fouilleren',
      title: 'Identificatie & Fouilleren',
      description: 'Alles over ID-plicht, fouilleren, veiligheidsfouillering',
      icon: 'Users',
      color: 'bg-green-100 text-green-800',
      articleCount: 3
    },
    {
      slug: 'verkeer',
      title: 'Verkeer',
      description: 'Politiebevoegdheden op de weg, blaastest, stopteken',
      icon: 'Car',
      color: 'bg-orange-100 text-orange-800',
      articleCount: 10
    },
    {
      slug: 'opsporing',
      title: 'Opsporing & Aanhouding',
      description: 'Wanneer en hoe mag iemand worden aangehouden?',
      icon: 'AlertCircle',
      color: 'bg-red-100 text-red-800',
      articleCount: 4
    },
    {
      slug: 'privacy',
      title: 'Privacy & Informatie',
      description: 'Camerabeelden, persoonsgegevens, inzagerecht',
      icon: 'Eye',
      color: 'bg-purple-100 text-purple-800',
      articleCount: 7
    },
    {
      slug: 'slachtoffer',
      title: 'Slachtoffer & Rechten',
      description: 'Rechten als slachtoffer van een misdrijf',
      icon: 'Shield',
      color: 'bg-teal-100 text-teal-800',
      articleCount: 1
    },
    {
      slug: 'burgerrecht',
      title: 'Civielrecht',
      description: 'Huisrecht van winkels, winkelverboden en burgerlijke geschillen',
      icon: 'Store',
      color: 'bg-indigo-100 text-indigo-800',
      articleCount: 1
    },
    {
      slug: 'jeugdstrafrecht',
      title: 'Jeugdstrafrecht',
      description: 'Rechten van minderjarigen, HALT-afdoening en jeugdstrafrechtprocedures',
      icon: 'Users',
      color: 'bg-pink-100 text-pink-800',
      articleCount: 2
    },
    {
      slug: 'geweld',
      title: 'Geweld & Handhaving',
      description: 'Wanneer mag de politie geweld gebruiken en welke middelen mogen zij inzetten?',
      icon: 'Zap',
      color: 'bg-red-100 text-red-800',
      articleCount: 1
    },
    {
      slug: 'klacht',
      title: 'Klacht & Bezwaar',
      description: 'Hoe dien ik een klacht of bezwaar in tegen de politie?',
      icon: 'FileText',
      color: 'bg-yellow-100 text-yellow-800',
      articleCount: 3
    }
  ] as PolitieWetCategory[],

  articles: [
    {
      slug: 'id-controle-politie',
      title: 'Mag de politie mijn identiteit controleren?',
      description: '',
      category: 'Identificatie & Fouilleren',
      categorySlug: 'id-fouilleren',
      seoTitle: 'Mag de politie mijn identiteit controleren?',
      seoDescription: 'Wanneer mag een agent je identiteitsbewijs vragen en wat zijn je rechten en plichten bij een ID-controle.',
      readTime: '',
      lastUpdated: '2025-06-28',
      views: 3247,
      tags: ['identificatie', 'ID-controle', 'rechten', 'plichten'],
      featured: true,
      content: `## Kort antwoord

Ja, een agent mag jouw identiteit controleren als dit nodig is voor zijn werk. Je bent verplicht om mee te werken en je ID-bewijs te tonen, maar de politie hoeft je niet te overtuigen waarom precies.

Uitgebreide uitleg

Wanneer mag de politie je identiteit controleren?

Een politieagent mag alleen om jouw identiteitsbewijs vragen als dit echt nodig is voor zijn taak. Dit kan niet zomaar altijd, maar alleen in specifieke situaties zoals beschreven in artikel 8 Politiewet 2012 en artikel 2 Wet op de identificatieplicht.

De belangrijkste situaties zijn:

* Als je verdacht wordt van een strafbaar feit (art. 27 lid 1 Wetboek van Strafvordering).
* Om ordeverstoring of gevaar te voorkomen (art. 8a Politiewet 2012).
* Bij verkeerscontroles (art. 160 Wegenverkeerswet 1994).
* Bij controles op bijvoorbeeld alcoholgebruik op straat (art. 20 Drank- en Horecawet).

Praktijkvoorbeeld

Je loopt rond middernacht door een woonwijk. De politie krijgt een melding dat een persoon met een donkere jas en capuchon net gezien is bij een poging tot woninginbraak. Jij draagt exact die kleding en bevindt je bovendien vlakbij de woning waar de melding vandaan komt. De politieagent spreekt jou hierop aan en vraagt direct om je identiteitsbewijs om te controleren wie je bent en mogelijk verband te kunnen leggen met de poging tot inbraak.

Wat als je geen ID kunt of wilt laten zien?

Als je geen identiteitsbewijs bij je hebt wanneer een agent hierom vraagt, riskeer je een boete. Dit is strafbaar volgens artikel 447e Wetboek van Strafrecht (Sr). Weiger je mee te werken, dan kun je zelfs worden aangehouden en meegenomen naar het politiebureau.

Rechten & plichten van de burger

* Rechten:
  * Je hebt recht op correcte behandeling en uitleg door de politie, maar ze hoeven je niet uitgebreid te overtuigen van hun reden.

* Plichten:
  * Je bent verplicht om een geldig identiteitsbewijs te laten zien als hierom gevraagd wordt.
  * Je moet meewerken aan de controle.

Wat kun je doen?

Als je twijfelt aan de reden van de controle of je voelt je onjuist behandeld, kun je:

* De agent ter plekke vragen waarom je gecontroleerd wordt (vriendelijk en rustig).
* Klacht indienen via www.politie.nl.
* Advies vragen bij het Juridisch Loket.

Gerelateerde regelgeving

* Wet op de identificatieplicht – Wanneer en hoe identificatie verplicht is.
* Politiewet 2012 – Algemene bevoegdheden politie.
* Wegenverkeerswet 1994 – Identificatie bij verkeerscontroles.
* Drank- en Horecawet – Identificatie bij alcoholcontroles.

Belangrijke rechtspraak en beleid

* Hoge Raad, ECLI:NL:HR:2004:AO6092 – Identificatieplicht bij verdenking vereist duidelijke aanleiding.
* Raad van State, ECLI:NL:RVS:2016:2188 – Identiteitscontroles moeten redelijk en zorgvuldig zijn.

Laatst gecheckt: 28 juni 2025  
Disclaimer: Je mag vragen waarom je identiteit wordt gecontroleerd, maar de politie hoeft je niet te overtuigen van hun redenen. Dit is algemene informatie; uitzonderingen zijn mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'algemene-verkeerscontrole',
      title: 'Moet ik meewerken aan een algemene verkeerscontrole en wat kan er allemaal onderdeel van zijn?',
      description: '',
      category: 'Verkeer',
      categorySlug: 'verkeer',
      seoTitle: 'Moet ik meewerken aan een algemene verkeerscontrole?',
      seoDescription: 'Volledige uitleg over verkeerscontroles: wat mag de politie controleren, je rechten en plichten, wetgeving en praktijkvoorbeelden.',
      readTime: '',
      lastUpdated: '2025-06-28',
      views: 1247,
      tags: ['verkeerscontrole', 'wegenverkeerswet', 'reglement voertuigen', 'rijbewijs', 'alcohol', 'drugs', 'technische controle'],
      featured: true,
      content: `## Kort antwoord

Ja, je bent verplicht mee te werken aan een algemene verkeerscontrole. De politie mag je rijbewijs, kentekenbewijs, identiteitsbewijs en de technische staat van je voertuig controleren, net als alcohol- of drugsgebruik.


Uitgebreide uitleg

Wettelijke basis: artikel 160 Wegenverkeerswet 1994 (WVW 1994)

De politie mag je tijdens een verkeerscontrole laten stoppen en controleren op grond van artikel 160 Wegenverkeerswet 1994 (WVW 1994) (WVW 1994). Dit artikel geeft agenten de bevoegdheid om:

* Je te laten stoppen (lid 1).
* Te vragen naar je rijbewijs, kentekenbewijs en identiteitsbewijs (lid 1).
* Jou te verplichten mee te werken aan onderzoeken, bijvoorbeeld een blaastest (lid 5).

Er hoeft geen sprake te zijn van een verdenking. Het mag gaan om een algemene controle, bijvoorbeeld op snelheid, voertuigveiligheid of alcoholgebruik.

Wat kan de politie controleren?

Tijdens een algemene verkeerscontrole kunnen de volgende zaken aan bod komen:

* Identiteitsbewijs
* Rijbewijs
* Kentekenbewijs
* Verzekeringsstatus (via kentekencontrole)
* Alcohol- of drugsgebruik (blaastest of speekseltest)
* Technische staat van het voertuig (banden, remmen, verlichting)
* Verplichte uitrusting en functies in je voertuig

Wat mag de politie controleren in je auto?

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

Praktijkvoorbeeld

Je rijdt op een vrijdagmiddag richting huis en ziet een politiecontrole bij een afrit. Je wordt naar een controleplek geleid. Een agent vraagt je rijbewijs, kentekenbewijs en ID-kaart. Daarna controleert hij je banden, verlichting en vraagt of je claxon werkt. Hij kijkt naar de gordels, de spiegels en merkt op dat het rubber op je rempedaal glad is. Tot slot moet je een blaastest doen. Alles wat hier gebeurt is wettelijk toegestaan – je bent verplicht om hieraan mee te werken.


Rechten & plichten van de burger

* Plichten:
  * Je moet je rijbewijs, kentekenbewijs en ID tonen op verzoek (artikel 160 lid 1 Wegenverkeerswet 1994).
  * Je moet aanwijzingen opvolgen en meewerken aan controles (artikel 160 lid 5 Wegenverkeerswet 1994).
  * Je voertuig moet voldoen aan de technische en functionele eisen (hoofdstuk 5.2 Reglement voertuigen).

* Rechten:
  * Je mag vragen waarom je wordt gecontroleerd, maar de politie hoeft geen specifieke verdenking te hebben.
  * Je mag achteraf een klacht indienen als je vindt dat de controle niet correct is verlopen.


Wat kun je doen?

Als je twijfelt aan de controle of je voelt je onjuist behandeld, kun je:

* Klacht indienen bij de politie via [politie.nl/klachten](https://politie.nl/klachten).
* Juridisch advies inwinnen via het Juridisch Loket, een advocaat of je rechtsbijstand.
* Bezwaar maken tegen een boete bij de officier van justitie (zie instructies op de boetebrief).


Gerelateerde regelgeving

* Artikel 160 Wegenverkeerswet 1994 – Bevoegdheden politie bij verkeerscontrole.
* Reglement voertuigen hoofdstuk 5.2 – Eisen aan voertuigonderdelen en functies.
* Besluit alcohol, drugs en geneesmiddelen in het verkeer – Regels voor testmethodes.
* Besluit administratieve bepalingen inzake het wegverkeer (BABW) – Inrichting van verkeerscontroles.


Belangrijke rechtspraak en beleid

* Hoge Raad 19 december 1995, NJ 1996, 249 (verkeerscontrole-arrest) – De Hoge Raad oordeelde dat verkeerscontroles zonder verdenking zijn toegestaan, mits duidelijk herkenbaar en binnen de wettelijke kaders.


Laatst gecheckt: 28 juni 2025  
Disclaimer: Dit is algemene informatie; uitzonderingen zijn mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'door-rood-licht-zonder-sirene',
      title: 'Mag de politie door rood licht rijden zonder zwaailicht en sirene?',
      description: '',
      category: 'Verkeer',
      categorySlug: 'verkeer',
      seoTitle: 'Mag de politie door rood licht rijden zonder zwaailicht en sirene?',
      seoDescription: 'Uitleg over artikel 91 RVV 1990: wanneer politie van verkeersregels mag afwijken zonder signalen, je rechten en klachtmogelijkheden.',
      readTime: '',
      lastUpdated: '2025-06-28',
      views: 892,
      tags: ['verkeersregels', 'politie', 'RVV 1990', 'artikel 91', 'artikel 29', 'hulpdiensten', 'spoedeisend'],
      featured: true,
      content: `## Kort antwoord

Ja, dat mag. De wet staat het toe dat de politie zonder zwaailicht en sirene van verkeersregels afwijkt als dat noodzakelijk is voor het uitvoeren van hun taak.


Uitgebreide uitleg

Uitzondering op de regel: artikel 91 RVV 1990

Artikel 91 Reglement verkeersregels en verkeerstekens 1990 (RVV 1990) geeft politievoertuigen de ruimte om van verkeersregels af te wijken, ook zonder optische en geluidssignalen, als dat nodig is voor het uitvoeren van hun taak.

Daar staat letterlijk:

"De artikelen 5 tot en met 89 zijn niet van toepassing op bestuurders van voertuigen van de politie, brandweer of ambulance die een taak uitoefenen waarvoor een uitzondering van die bepalingen noodzakelijk is."

Dit betekent dat de politie ook zonder zwaailicht en sirene bijvoorbeeld door rood mag rijden – mits dat noodzakelijk is voor het uitoefenen van hun taak.

Uitleg: verschil met artikel 29 RVV 1990

Artikel 29 RVV 1990 zegt dat hulpdiensten alleen van verkeersregels mogen afwijken met zwaailicht en sirene. Maar dat geldt voor alle gewone hulpdiensten die deelnemen aan het verkeer.

Artikel 91 RVV 1990 is een bijzondere uitzondering die alleen geldt voor:

* Politie
* Brandweer  
* Ambulancedienst

Zij mogen dus – als het noodzakelijk is voor hun werk – van verkeersregels afwijken, ook als ze geen zwaailicht en sirene gebruiken. Het moet dan gaan om een taak waarbij het gebruik van die signalen niet wenselijk of mogelijk is, bijvoorbeeld bij:

* een stille observatie
* het ongezien naderen van een verdachte
* een ongeplande situatie waarbij snel optreden nodig is, maar sirene/zwaailicht de inzet zou verstoren

Praktijkvoorbeeld

Een politiebusje rijdt zonder zwaailicht of sirene door rood. In het voertuig zitten agenten in burger, op weg naar een heterdaadmelding van huiselijk geweld waarbij de verdachte mogelijk vluchtgevaarlijk is.

In deze situatie mogen zij door rood rijden zonder signalen, omdat de inzet spoedeisend is en onopvallend moet blijven.


Rechten & plichten van de burger

* Rechten:
  * Je hebt het recht om je af te vragen of het rijgedrag van de politie verantwoord is en kunt dit melden (gebaseerd op artikel 13 Politiewet 2012: klachtrecht).

* Plichten:
  * Je hebt de plicht om geen hinder te veroorzaken bij het uitvoeren van een politie-inzet, ook als die onopvallend is (gebaseerd op artikel 5 Wegenverkeerswet 1994).


Wat kun je doen?

Heb je zorgen over verkeersgedrag van de politie?

Dien een klacht in via politie.nl > 'Klacht indienen'.

Twijfel je of het terecht was?

Je kunt het ook melden bij de Nationale Ombudsman als je klacht niet serieus genomen wordt.


Gerelateerde regelgeving

* Artikel 91 RVV 1990 – Politie mag van verkeersregels afwijken als dat nodig is voor hun taak, ook zonder signalen.
* Artikel 29 RVV 1990 – Regelt de algemene plicht voor zwaailicht en sirene bij hulpdiensten (maar artikel 91 gaat hier dus boven).
* Besluit optische en geluidssignalen 2009 – Geeft aan welke voertuigen signalen mogen gebruiken en wanneer.


Belangrijke rechtspraak

* ECLI:NL:HR:2009:BH4266 – Bevestigt dat politie onder voorwaarden verkeersregels mag negeren, mits noodzakelijk en met zorgvuldigheid.


Laatst gecheckt: 28 juni 2025  
Disclaimer: Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'betreden-tuin-zonder-machtiging',
      title: 'Mag een agent zonder machtiging een tuin betreden voor onderzoek of inbeslagname?',
      description: '',
      category: 'Opsporing & Aanhouding',
      categorySlug: 'opsporing',
      seoTitle: 'Mag politie zonder machtiging een tuin betreden voor onderzoek?',
      seoDescription: 'Uitleg over wanneer de politie tuinen, schuren en bijgebouwen mag betreden zonder machtiging, wettelijke basis en je rechten.',
      readTime: '',
      lastUpdated: '2025-06-28',
      views: 0,
      tags: ['binnentreden', 'woning', 'tuin', 'onderzoek', 'inbeslagname', 'awbi', 'machtiging'],
      featured: true,
      content: `## Kort antwoord

Ja, een agent mag zonder machtiging een terrein betreden dat geen woning is, bijvoorbeeld een tuin, schuur of garage, om bewijs veilig te stellen of onderzoek te doen. Gaat het echter om een besloten erf dat als woning geldt, dan is wél een machtiging tot binnentreden nodig, behalve bij spoed of heterdaad.

Uitgebreide uitleg

Wat zegt de wet?

Een woning is extra beschermd in de wet. Maar veel andere plekken – zoals een tuin, schuurtje, bedrijfshal of auto – vallen daar niet standaard onder. Voor het betreden van die plekken geldt dus een lagere drempel.

De politie mag deze plekken betreden in het kader van hun taken, zoals:

* Aanhouding van een verdachte
* Inbeslagname van voorwerpen
* Doorzoeking in het belang van een onderzoek

Maar let op: "woning" wordt breed geïnterpreteerd

Volgens de Algemene wet op het binnentreden (Awbi) kan een besloten erf of bijgebouw óók een 'woning' zijn, als het gebruikt wordt als privéruimte. Denk aan:

* Een ommuurde achtertuin waar mensen vaak zitten
* Een tuinhuisje dat als logeerkamer wordt gebruikt
* Een garage die direct toegang geeft tot een huis

Daarvoor is dan toch een machtiging nodig.

Wettelijke basis

* Artikel 1 lid 1 sub b Algemene wet op het binnentreden (Awbi) – definitie van woning, inclusief besloten erven die als woonruimte fungeren.
* Artikel 2 Awbi – machtiging verplicht voor binnentreden van woning.
* Artikel 96 Wetboek van Strafvordering (Sv) – politie mag zonder machtiging plaatsen betreden die geen woning zijn, bij ontdekking op heterdaad of verdenking van een strafbaar feit.
* Artikel 96c Sv – doorzoeking ter inbeslagneming in niet-woning mag ook zonder machtiging.
* Artikel 55 Sv – bevoegdheid om voorwerpen in beslag te nemen die voor het onderzoek van belang zijn.

Praktijkvoorbeeld

Stel: de politie verdenkt iemand van hennepteelt. Ze ruiken vanaf de straat een sterke geur.

De voortuin is open, dus daar mogen ze gewoon in.

In de achtertuin staat een afgesloten schuur.

Als die schuur niet als woning wordt gebruikt, mogen ze daar zonder machtiging in – mits er sprake is van verdenking.

Is die schuur echter ingericht als slaapkamer of woonkamer? Dan is het een woning en is er een machtiging tot binnentreden nodig.

Rechten & plichten van de burger

* Je mag vragen op basis waarvan de politie binnentreedt (Artikel 9 Awbi).
* Je hebt geen toestemming nodig te geven als er een geldige reden is voor binnentreden zonder machtiging (Artikel 96b Sv).
* Je bent verplicht toegang te geven bij een geldige machtiging of wettige bevoegdheid.
* Je hebt recht op een bewijs van binnentreden (bijvoorbeeld een formulier of uitleg achteraf).

Wat kun je doen?

* Vraag altijd of je met een woning of niet-woning te maken hebt.
* Twijfel je of binnentreden rechtmatig was? Dien dan een klacht in bij de politie of de Nationale Ombudsman.
* Bij schade of onrechtmatige inbeslagname kun je naar een advocaat of het Juridisch Loket stappen.
* Vraag eventueel om inzage in het proces-verbaal van binnentreden.

Gerelateerde regelgeving

* Algemene wet op het binnentreden (Awbi) – regels over machtigingen en woningbegrip.
* Wetboek van Strafvordering artikelen 96b t/m 96g – bevoegdheden voor inbeslagname en betreden niet-woningen.
* Artikel 3 Politiewet 2012 – taakomschrijving politie (waaronder opsporing en handhaving).

Belangrijke rechtspraak

* HR 10-11-2009, ECLI:NL:HR:2009:BI7099 – schuur op erf werd aangemerkt als woning, binnentreden zonder machtiging was onrechtmatig.
* HR 27-10-2015, ECLI:NL:HR:2015:3122 – doorzoeking bedrijfspand zonder machtiging was toegestaan.

Laatst gecheckt: 28 juni 2025
Disclaimer: Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'politie-verplicht-aangifte-opnemen',
      title: 'Is de politie verplicht om een aangifte van mij op te nemen als ik dat wil?',
      description: '',
      category: 'Opsporing & Aanhouding',
      categorySlug: 'opsporing',
      seoTitle: 'Is de politie verplicht om een aangifte op te nemen? - WetHelder',
      seoDescription: 'Uitleg over je recht om aangifte te doen en de plicht van de politie om deze op te nemen volgens artikel 163 Wetboek van Strafvordering (Sv).',
      readTime: '',
      lastUpdated: '2025-01-11',
      views: 0,
      tags: ['aangifte', 'politie', 'proces-verbaal', 'artikel 163', 'wetboek van strafvordering', 'rechten', 'plichten'],
      featured: true,
      content: `## Kort antwoord

Ja, de politie is verplicht om jouw aangifte op te nemen als je slachtoffer of getuige bent van een strafbaar feit. Dat staat in artikel 163 lid 1 Wetboek van Strafvordering (Sv).


Uitgebreide uitleg

Wat zegt de wet?

Volgens artikel 163 lid 1 Wetboek van Strafvordering is de politie verplicht om proces-verbaal op te maken als iemand melding doet van een strafbaar feit. Dit betekent dat zij jouw aangifte niet zomaar mogen weigeren.

> Artikel 163 lid 1 Wetboek van Strafvordering:
> "Iedereen die kennis draagt van een strafbaar feit kan daarvan aangifte doen. Ambtenaren van politie zijn verplicht tot het opmaken van proces-verbaal."

Let op: dit geldt voor strafbare feiten. Bij civiele zaken (zoals burenruzies of contractproblemen) is dit niet van toepassing.


Wat betekent dit in de praktijk?

Als jij naar het politiebureau gaat, of via internet aangifte wilt doen, moet de politie jouw aangifte aannemen als je iets strafbaars meldt. Ze mogen jou niet wegsturen met de mededeling "dit is geen prioriteit" of "we doen er toch niks mee". De beoordeling of het strafbaar is, mag pas na de aangifte volgen, niet ervoor.


Praktijkvoorbeeld

Je fiets wordt gestolen bij het station. Je loopt naar het politiebureau om aangifte te doen. De agent zegt: "We hebben het druk, doe maar geen aangifte, dit gebeurt toch dagelijks."

Dat mag dus niet. Jij hebt recht op het doen van aangifte, en de politie is verplicht dit op te nemen – óók als ze er op dat moment weinig mee kunnen.


Rechten & plichten van de burger

Bron: artikel 163 Wetboek van Strafvordering (Sv)

*  Je hebt het recht om aangifte te doen van een strafbaar feit.
*  De politie heeft de plicht om je aangifte op te nemen.
*  De politie mag niet weigeren omdat iets "te klein" of "geen prioriteit" zou zijn.
*  Je mag vragen om een afschrift van je aangifte (artikel 163 lid 5 Wetboek van Strafvordering).


Wat kun je doen?

Als de politie weigert jouw aangifte op te nemen:

1. Vraag beleefd om de reden van weigering – leg uit dat jij recht hebt op het doen van aangifte.
2. Noteer naam en nummer van de agent en meld het bij een leidinggevende.
3. Dien een klacht in via www.politie.nl/klacht.
4. Neem contact op met het Juridisch Loket voor advies.
5. Je kunt ook aangifte doen via internet bij eenvoudige zaken: www.politie.nl/aangifte


Gerelateerde regelgeving

* artikel 163 Wetboek van Strafvordering (Sv) – aangifteplicht politie
* artikel 164 Wetboek van Strafvordering (Sv) – opmaken proces-verbaal
* Artikel 3 Politiewet 2012 – taak van de politie (waaronder opsporing)
* Wet politiegegevens artikel 8 – registratie van aangiften en klachten


Belangrijke rechtspraak of beleidsdocumenten

1. Kamerbrief over aangifteweigering (2019) – Minister van Justitie bevestigt: aangifte mag niet geweigerd worden zonder juridische reden.
2. Inspectie Justitie en Veiligheid (2015) – signaleert dat sommige politie-eenheden onterecht aangiftes weigeren.
3. Rapport Nationale Ombudsman "Geen aangifte doen is geen optie" (2020) – bekritiseert het weren van burgers met een legitieme klacht.


Laatst gecheckt: 11 januari 2025  
Disclaimer: Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'fouilleren-transport-insluiting',
      title: 'Wanneer mag de politie mij fouilleren – inclusief bij transport en insluiting?',
      description: '',
      category: 'Identificatie & Fouilleren',
      categorySlug: 'id-fouilleren',
      seoTitle: 'Wanneer mag de politie mij fouilleren bij transport en insluiting?',
      seoDescription: 'Complete uitleg over alle soorten fouilleringen door de politie: wanneer het mag, wettelijke basis en je rechten bij transport en insluiting.',
      readTime: '',
      lastUpdated: '2025-01-11',
      views: 0,
      tags: ['fouilleren', 'veiligheidsfouillering', 'transport', 'insluiting', 'lichamelijk onderzoek', 'politiewet', 'strafvordering'],
      featured: true,
      content: `## Kort antwoord

De politie mag je fouilleren als je wordt aangehouden, vervoerd of ingesloten, maar dit moet wel passen binnen de wet. Er zijn verschillende soorten fouilleringen met elk hun eigen regels en voorwaarden.


Uitgebreide uitleg: soorten fouillering en wanneer het mag

Fouilleren is een inbreuk op jouw privacy en lichamelijke integriteit, dus mag alleen als de wet het toestaat. Er zijn verschillende vormen van fouillering, afhankelijk van de situatie. Hieronder leggen we ze uit, inclusief wat geldt bij vervoer (transport) en insluiting op het politiebureau.


1. Veiligheidsfouillering – bij dreiging van gevaar

De politie mag je fouilleren als zij denken dat je een wapen of gevaarlijk voorwerp bij je hebt.

* Dit mag zonder dat je bent aangehouden.
* Alleen bij een concrete aanleiding, bijvoorbeeld als je dreigend gedrag vertoont.
* Alleen over de kleding heen, tenzij er meer aanleiding is.

📘 *artikel 7 lid 3 Politiewet 2012*


2. Fouillering na aanhouding – op zoek naar bewijs of gevaarlijke voorwerpen

Ben je aangehouden? Dan mag de politie je fouilleren om:

* bewijsmateriaal te vinden,
* te voorkomen dat je iets wegmaakt,
* of om gevaarlijke spullen weg te nemen.

Let op: dit is uitgebreider dan een veiligheidsfouillering.

* Je kleding mag worden doorzocht.
* Soms wordt ook je lichaam onderzocht (zie punt 5).

📘 *artikel 56 lid 4 Wetboek van Strafvordering*


3. Insluitingsfouillering – bij opsluiting op het bureau

Word je ingesloten op het politiebureau (in een cel)? Dan volgt vaak een insluitingsfouillering.

* Deze mag standaard worden uitgevoerd bij insluiting.
* Doel: veiligheid van jou, agenten en anderen in de cel.
* Hierbij mogen ook persoonlijke spullen worden ingenomen (zoals riemen, veters, sieraden).

Er is meestal geen aparte toestemming voor nodig als de fouillering beperkt blijft tot kleding.
Bij verder onderzoek gelden zwaardere regels (zie punt 5).

📘 *Gebaseerd op praktijk en interne richtlijnen politie, steunend op artikel 9 lid 1 Politiewet 2012*


4. Transportfouillering – vóór vervoer naar cel of rechtbank

Word je vervoerd door de politie (bijvoorbeeld van bureau naar rechtbank of cellencomplex)? Dan mag een transportfouillering worden uitgevoerd.

* Dit is bedoeld om te voorkomen dat je wapens, drugs of andere verboden voorwerpen meeneemt.
* Deze mag voor en na transport worden gedaan.

De wet noemt dit niet letterlijk, maar de bevoegdheid komt voort uit het belang van veiligheid tijdens vervoer.

📘 *Afgeleid van artikel 9 lid 1 Politiewet 2012 (taakuitvoering) en jurisprudentie*


5. Lichamelijk onderzoek – verder dan kleding, zoals lichaamsholtes

Soms is er aanleiding om dieper te fouilleren: ondergoed, lichaamsholtes of medische onderzoeken.

* Hiervoor is altijd toestemming nodig van een officier van justitie of rechter-commissaris.
* Dit gebeurt vaak in het bijzijn van een arts of medisch deskundige.
* Het mag alleen als het echt nodig is voor bewijs of veiligheid.

📘 *artikel 61a en 62 Wetboek van Strafvordering*


Praktijkvoorbeeld

Een persoon wordt aangehouden wegens het dragen van een mes. De agenten doen een veiligheidsfouillering op straat. Daarna volgt bij aankomst op het bureau een insluitingsfouillering om te controleren of de persoon geen andere wapens bij zich draagt. Voor het transport naar de rechtbank gebeurt een korte transportfouillering, opnieuw om de veiligheid te waarborgen. Als er een vermoeden is dat de persoon drugs heeft ingeslikt, moet de politie eerst toestemming vragen voor een lichamelijk onderzoek door een arts.


Rechten & plichten van de burger

Bron: Politiewet 2012, Wetboek van Strafvordering

*  Je moet meewerken aan een rechtmatige fouillering.
*  Je mag vragen naar de reden van de fouillering.
*  Je mag je niet verzetten, ook niet als je het er niet mee eens bent.
*  Je mag een klacht indienen als je vindt dat het onterecht of onzorgvuldig is gedaan.
*  Je hebt recht op een behoorlijke behandeling, zeker bij lichamelijk onderzoek.


Wat kun je doen?

* Vraag waarom je gefouilleerd wordt en op basis van welke wet.
* Noteer indien mogelijk het dienstnummer van de agent.
* Word je dieper onderzocht? Vraag dan wie de toestemming heeft gegeven.
* Klacht indienen:
  * bij de politie zelf,
  * of bij de Nationale Ombudsman.
* Overweeg advies van het Juridisch Loket of een advocaat.


Gerelateerde regelgeving

* artikel 7 lid 3 Politiewet 2012 – Veiligheidsfouillering bij dreiging
* artikel 9 lid 1 Politiewet 2012 – Bevoegdheid uitvoering politietaak (o.a. transport)
* artikel 151b Gemeentewet – Preventief fouilleren in risicogebied
* artikel 56 lid 4 Wetboek van Strafvordering – Fouillering na aanhouding
* artikel 61a en 62 Wetboek van Strafvordering – Lichamelijk onderzoek


Belangrijke rechtspraak en documenten

* ECLI:NL:HR:2008:BC7947 – Hoge Raad stelt: er moet altijd sprake zijn van concrete aanleiding bij veiligheidsfouillering.
* Richtlijn Insluiting Politie (Landelijke Politie) – Interne procedure voor fouillering bij insluiting.
* Handleiding Strafvordering 2024 – Geeft richtlijnen voor fouilleren bij vervoer en insluiting.


Laatst gecheckt: 11 januari 2025  
Disclaimer: Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'auto-doorzoeken',
      title: 'Mag de politie mijn auto doorzoeken?',
      description: 'Wanneer mag de politie jouw auto doorzoeken en wat zijn je rechten en plichten als automobilist?',
      category: 'Verkeer',
      categorySlug: 'verkeer',
      seoTitle: 'Mag de politie mijn auto doorzoeken?',
      seoDescription: 'Uitleg over wanneer de politie jouw auto mag doorzoeken: wettelijke basis, situaties, rechten en plichten bij autodoorzoeken.',
      readTime: '',
      lastUpdated: '2025-01-11',
      views: 0,
      tags: ['autodoorzoeken', 'voertuigdoorzoeking', 'verkeerscontrole', 'strafvordering', 'rechten'],
      featured: false,
      content: `## Kort antwoord

De politie mag jouw auto alleen doorzoeken als daar een wettelijke reden voor is, zoals een verdenking van een strafbaar feit, direct gevaar of binnen een veiligheidsrisicogebied. Je mag toestemming weigeren, maar dat betekent niet dat de politie dan moet stoppen – in veel gevallen mogen ze tóch zoeken, ook zonder jouw instemming.


Uitgebreide uitleg

Mag de politie zomaar je auto doorzoeken?

Een auto valt onder jouw persoonlijke levenssfeer, dus daar mag de politie niet zomaar in zoeken. Toch zijn er situaties waarin dat wél mag. Soms is jouw toestemming nodig, soms juist niet. Hieronder zie je de 5 belangrijkste situaties waarin de politie je auto mag doorzoeken.


1. Bij verdenking van een strafbaar feit

Als je verdacht wordt van een strafbaar feit, mag de politie je auto onderzoeken op spullen die belangrijk kunnen zijn voor het onderzoek, zoals drugs, wapens of gestolen goederen.

Meestal is hiervoor een bevel van de officier van justitie nodig. Alleen bij spoed mag een hulpofficier van justitie dit zelfstandig beslissen.

Let op: Je mag weigeren toestemming te geven, maar als de politie een geldige wettelijke basis heeft, mogen ze toch doorzoeken. Je mag je hier niet fysiek tegen verzetten.

2. Bij preventief fouilleren in een veiligheidsrisicogebied

De burgemeester kan een gebied aanwijzen als veiligheidsrisicogebied als er risico is op geweld of wapenbezit. Dit gebeurt bijvoorbeeld bij voetbalwedstrijden, demonstraties of na geweldsincidenten.

In zo'n gebied mag de politie – op bevel van een (hulp)officier van justitie – mensen preventief fouilleren én voertuigen doorzoeken op wapens. Je hoeft dan geen verdachte te zijn. De bevoegdheid geldt tijdelijk en alleen binnen het aangewezen gebied.

3. Bij verkeerscontroles

De politie mag je staande houden voor een reguliere verkeerscontrole. Ze mogen je rijbewijs, kentekenbewijs, verzekering en technische staat van het voertuig controleren.

Ze mogen echter niet zomaar je auto doorzoeken. Daarvoor moet sprake zijn van een concreet vermoeden van een strafbaar feit, zoals de geur van drugs of zichtbare wapens.

4. Als jij vrijwillig toestemming geeft

Als er geen wettelijke grond is om te doorzoeken, mag de politie je vragen of ze tóch mogen kijken.

Jij hebt dan het recht om ja of nee te zeggen. Die toestemming moet vrijwillig zijn en mag je op elk moment intrekken.

Maar: als er wél een wettelijke bevoegdheid bestaat (zoals bij verdenking of gevaar), dan is jouw toestemming niet nodig. Je mag je dan ook niet fysiek verzetten tegen de doorzoeking.

5. Bij direct gevaar voor de veiligheid

Als er sprake is van acuut gevaar – bijvoorbeeld een melding over een vuurwapen of explosieven in een voertuig – mag de politie direct optreden.

Ze mogen de auto dan zonder toestemming doorzoeken, om dreigend gevaar weg te nemen. Dit valt onder hun algemene taak tot handhaving van de veiligheid.


Exacte wetsartikelen

* artikel 96b Wetboek van Strafvordering – Onderzoek in voertuigen bij verdenking
* artikel 151b lid 1 Gemeentewet – Aanwijzen veiligheidsrisicogebied
* artikel 174b lid 1 Gemeentewet – Aanwijzing bij spoedeisende situaties
* artikelen 50 lid 3, 51 lid 3 en 52 lid 3 Wet wapens en munitie – Bevoegdheid tot voertuigonderzoek bij preventief fouilleren
* artikel 160 Wegenverkeerswet 1994 (WVW 1994) – Verkeerscontrole
* artikel 3 Politiewet 2012 – Optreden bij acuut gevaar of dreiging


Praktijkvoorbeeld

Je rijdt op de snelweg en wordt aangehouden voor een verkeerscontrole. Terwijl je je rijbewijs geeft, ruikt de agent een sterke wietlucht. Je weigert toestemming voor doorzoeking. Omdat er sprake is van een concreet vermoeden van een strafbaar feit, mag de politie tóch zoeken op basis van artikel 96b Wetboek van Strafvordering (Sv) – jouw weigering verandert daar niets aan. Fysiek verzet is dan strafbaar.


Rechten & plichten van de burger

* Rechten:
  * Je mag vragen op basis van welk wetsartikel de politie wil doorzoeken
  * Je mag toestemming weigeren als er geen wettelijke grond is
  * Je hebt recht op uitleg van wat er gebeurt
  * Je mag achteraf een klacht indienen of juridische hulp inschakelen

* Plichten:
  * Je mag je niet fysiek verzetten als de politie wél bevoegd is


Wat kun je doen?

* Vraag: "Op basis van welk artikel wilt u mijn auto doorzoeken?"
* Geef alleen toestemming als je dat echt wil
* Verzet je nooit fysiek – dat kan strafbaar zijn
* Dien eventueel een klacht in bij de politie of Nationale Ombudsman
* Neem contact op met een advocaat als er spullen in beslag zijn genomen


Gerelateerde regelgeving

* Wet wapens en munitie – Verbod op wapens en regeling doorzoeking
* Opiumwet – Grondslag voor optreden bij drugsbezit
* Wet politiegegevens – Regels over wat de politie mag bewaren na doorzoeking
* Reglement verkeersregels en verkeerstekens 1990 – Verkeersregels en controlebevoegdheden
* Wet op de economische delicten – Bijvoorbeeld bij illegaal vuurwerk of verboden handel
* Vuurwerkbesluit – Doorzoeking bij verdenking van verboden vuurwerk


Belangrijke rechtspraak en beleid

* HR 22-03-2011, ECLI:NL:HR:2011:BO8067 – Onrechtmatige doorzoeking auto is schending van privacy
* HR 18-02-2020, ECLI:NL:HR:2020:276 – Alleen bij concrete aanwijzingen mag auto worden onderzocht
* Aanwijzing Opsporingsbevoegdheden (OM) – Interne richtlijnen over inzet bevoegdheden zoals doorzoeking


Laatst gecheckt: 28 juni 2025  
Disclaimer: Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'stopteken-verplicht-stoppen',
      title: 'Moet ik altijd stoppen als een agent me een stopteken geeft?',
      description: '',
      category: 'Verkeer',
      categorySlug: 'verkeer',
      seoTitle: 'Moet ik altijd stoppen als een agent me een stopteken geeft?',
      seoDescription: 'Uitleg over de stopverplichting bij politiebevel: wanneer je moet stoppen, wettelijke basis en gevolgen van doorrijden.',
      readTime: '',
      lastUpdated: '2025-01-11',
      views: 0,
      tags: ['stopteken', 'stopplicht', 'verkeerscontrole', 'aanwijzingen', 'politiebevel'],
      featured: false,
      content: `## Kort antwoord

Ja, je bent verplicht om direct te stoppen als een politieagent jou een stopteken geeft. Negeer je dit, dan pleeg je een strafbaar feit en kan dit leiden tot vervolging of gevaarlijke situaties.


Uitgebreide uitleg

Wanneer geldt de stopverplichting?

Een politieagent mag jou als verkeersdeelnemer een stopteken geven. Dit geldt voor alle bestuurders: auto's, motoren, bromfietsen, fietsen, vrachtwagens én ruiters of menners van paard-en-wagen.

Je moet altijd stoppen als:

* Een agent je een duidelijk stopteken geeft (bijv. met armgebaar, stopbord of zwaailicht).
* De agent in uniform is of herkenbaar als politie (burgerkleding mag ook als hij zich identificeert).
* Het stopteken komt van een agent te voet, op de fiets, motor, in een auto of vanuit een politiehelikopter.

Let op: je moet ook altijd stoppen als een verkeersregelaar of ander bevoegd persoon je een stopteken geeft. Dit is wettelijk gelijkgesteld aan een politiebevel.


Wettelijke basis

De verplichting om te stoppen staat in:

* artikel 160 lid 1 Wegenverkeerswet 1994 – verplichting om medewerking te verlenen bij een controle, inclusief stoppen.
* artikel 160 lid 5 Wegenverkeerswet 1994 – je moet aanwijzingen van een politieambtenaar opvolgen.
* artikel 82 RVV 1990 – regelt dat een bevoegd persoon (zoals politie of verkeersregelaar) een stopteken mag geven.


Praktijkvoorbeeld

Een agent in uniform staat langs de weg en steekt zijn arm op naar een automobilist om hem te laten stoppen voor een verkeerscontrole. De bestuurder ziet het teken, maar rijdt door. De automobilist heeft zich in deze situatie schuldig gemaakt aan het negeren van een wettelijk bevel.


Plichten van de burger

Je bent wettelijk verplicht om:

* Te stoppen bij een stopteken van een politieagent of bevoegd persoon  
  *(Artikel 160 lid 1 Wegenverkeerswet 1994 en Artikel 82 RVV 1990)*
* Aanwijzingen van de politie op te volgen  
  *(Artikel 160 lid 5 Wegenverkeerswet 1994)*
* Medewerking te verlenen aan controle, bijvoorbeeld het tonen van rijbewijs of kentekenbewijs  
  *(Artikel 160 lid 1 Wegenverkeerswet 1994)*


Wat kun je doen?

* Stop direct zodra je een stopteken krijgt, ook als je twijfelt aan de reden.
* Vraag rustig naar de reden van de controle zodra je stilstaat.
* Denk je dat het stopteken onterecht of gevaarlijk was? Dan kun je:

  * Een klacht indienen bij de politie
  * Een melding doen bij de Nationale Ombudsman
  * Juridisch advies vragen via een advocaat, vooral als je een proces-verbaal hebt ontvangen.


Gerelateerde regelgeving

* artikel 5 Wegenverkeerswet 1994 – verbod op gevaarlijk rijgedrag (zoals doorrijden na stopteken).
* artikel 84 RVV 1990 – regels over opvolgen van aanwijzingen van bevoegde personen.
* Reglement voertuigen – technische eisen die kunnen worden gecontroleerd bij staandehouding.


Belangrijke rechtspraak of beleid

* HR 13-06-2000, ECLI:NL:HR:2000:AA6086 – bevestigt dat het negeren van een stopteken strafbaar is.
* Landelijk verkeershandhavingsbeleid – benadrukt dat het opvolgen van politieaanwijzingen actief wordt gecontroleerd.


Laatst gecheckt: 28 juni 2025  
Disclaimer: Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'boa-bevoegdheden-vs-politie',
      title: 'Hebben BOA\'s dezelfde bevoegdheden als politieagenten?',
      description: '',
      category: 'Algemene Bevoegdheden',
      categorySlug: 'bevoegdheden',
      seoTitle: 'Hebben BOA\'s dezelfde bevoegdheden als politieagenten?',
      seoDescription: 'Verschillen tussen BOA en politie bevoegdheden: wat mag een BOA wel en niet, rechten burger, wettelijke basis.',
      readTime: '',
      lastUpdated: '2025-06-28',
      views: 0,
      tags: ['BOA', 'bevoegdheden', 'politie', 'handhaving', 'legitimatie'],
      featured: false,
      content: `## Kort antwoord

Nee, een BOA mag minder dan de politie. De bevoegdheden van een BOA zijn beperkt tot een specifiek werkgebied en minder ingrijpend dan die van een politieambtenaar.


Uitgebreide uitleg

Wat doet een BOA?

Een BOA (Buitengewoon Opsporingsambtenaar) controleert of mensen zich aan bepaalde regels houden. Denk aan foutparkeren, afval op straat of zwartrijden in de tram. BOA's werken bijvoorbeeld voor een gemeente, openbaar vervoerbedrijf of natuurorganisatie. Ze mogen alleen handhaven binnen hun taakgebied, zoals 'openbare ruimte' of 'milieu'.

Een BOA is géén volwaardige politiefunctionaris. De bevoegdheden zijn beperkt en staan in artikel 142 Wetboek van Strafvordering (Sv). Iedere BOA heeft een legitimatiepas waarop staat in welk domein hij of zij mag optreden.


Wat mag de politie méér?

De politie heeft veel ruimere bevoegdheden. Die mag bijvoorbeeld:

* alle strafbare feiten opsporen (niet alleen binnen een bepaald domein);
* geweld gebruiken als dat nodig is;
* handboeien of een wapen dragen;
* woningen betreden met toestemming van een officier van justitie.

Deze bevoegdheden staan onder meer in artikel 141 Wetboek van Strafvordering (Sv) en de Politiewet 2012.


Mag een BOA je tuin of erf op?

Ja, dat mag – zonder toestemming of machtiging, zolang het geen woning is. Dit staat in artikel 5:15 van de Algemene wet bestuursrecht.

Een BOA mag:

* een voortuin, oprit of zijpad betreden als dat nodig is voor controle;
* ook een achtertuin betreden, mits deze niet is afgesloten en redelijk toegankelijk is (bijvoorbeeld via een open poort).

Een BOA mag geen woning betreden. Daarvoor is altijd een aparte machtiging nodig van de burgemeester of officier van justitie.

Is de tuin volledig afgesloten en moet er iets geforceerd worden om binnen te komen? Dan is het betreden in de praktijk vaak niet toegestaan. Er is dan geen sprake meer van "redelijk betreden", zoals bedoeld in de wet.

Let op: de politie mag in strafrechtelijke situaties wél besloten of afgesloten terreinen betreden, maar dan alleen met toestemming van de officier van justitie of rechter-commissaris.


Praktijkvoorbeeld

Een BOA van de gemeente controleert of bewoners hun afvalcontainer op tijd binnenhalen. Als er een container al dagen op de oprit staat, mag de BOA de oprit of open voortuin betreden om te controleren. Staat de container achter een afgesloten poort in de achtertuin? Dan mag de BOA daar niet zomaar naartoe, tenzij het terrein open en bereikbaar is.


Wat zijn jouw rechten?

* Je moet je legitimeren als een BOA daarom vraagt binnen zijn taakgebied (Wet op de identificatieplicht artikel 8 lid 1).
* Je mag vragen naar de legitimatiekaart van de BOA (Besluit BOA artikel 5).
* Je mag vragen op welk wettelijk artikel de BOA zich beroept als deze je erf opkomt.
* Je mag een klacht indienen als een BOA zijn bevoegdheden overschrijdt.


Wat kun je doen?

* Vraag rustig om de legitimatie van de BOA.
* Twijfel je of het mag? Vraag naar de wettelijke basis van het optreden.
* Ontevreden over de manier van handhaven? Dien een klacht in bij de gemeente of werkgever van de BOA.
* Bij ernstigere situaties kun je ook juridisch advies vragen of terecht bij het Juridisch Loket.


Gerelateerde regelgeving

* artikel 142 Wetboek van Strafvordering (Sv) – Bevoegdheden BOA.
* artikel 141 Wetboek van Strafvordering (Sv) – Bevoegdheden politie.
* Artikel 5:15 Algemene wet bestuursrecht – BOA mag erf of tuin betreden.
* Artikel 8 lid 1 Wet op de identificatieplicht – ID-plicht voor burgers.
* Politiewet 2012 – Politietaak en geweldsbevoegdheden.
* Besluit buitengewoon opsporingsambtenaar – Regelt aanstelling en domein BOA.
* Ambtsinstructie voor politie en BOA's met geweldsbevoegdheid – Regels voor geweldstoepassing.


Laatst gecheckt: 28 juni 2025
Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'rechten-vh-feit-aanhouding',
      title: 'Waar heb je recht op als je bent aangehouden als verdachte van een VH-feit?',
      description: '',
      category: 'Opsporing & Aanhouding',
      categorySlug: 'opsporing',
      seoTitle: 'Rechten bij aanhouding voor VH-feit (voorlopige hechtenis)',
      seoDescription: 'Volledige uitleg over je rechten bij aanhouding voor VH-feit: termijnen, advocaat, zwijgrecht, inverzekeringstelling.',
      readTime: '',
      lastUpdated: '2025-06-28',
      views: 0,
      tags: ['VH-feit', 'aanhouding', 'voorlopige hechtenis', 'advocaat', 'zwijgrecht', 'inverzekeringstelling'],
      featured: false,
      content: `## Kort antwoord

Als je wordt aangehouden voor een VH-feit, mag de politie je maximaal 9 uur ophouden voor onderzoek, waarbij de tijd pas telt vanaf 09:00 uur 's ochtends. Daarna kun je in verzekering worden gesteld voor maximaal 3 dagen als verder onderzoek nodig is.


Uitgebreide uitleg

Wat is een VH-feit?

Een VH-feit is een strafbaar feit waarvoor voorlopige hechtenis is toegestaan. Dat staat in artikel 67 lid 1 van het Wetboek van Strafvordering. Het gaat meestal om misdrijven waarvoor 4 jaar of meer gevangenisstraf geldt, zoals diefstal met geweld, zware mishandeling of drugshandel.


De fasen na aanhouding

1. Ophouden voor onderzoek – maximaal 9 uur vanaf 09:00 uur

Als je wordt aangehouden, mag de politie je maximaal 9 uur ophouden voor verhoor en onderzoek. Let op: deze 9 uur gaan pas tellen vanaf 09:00 uur 's ochtends. De uren tussen 00:00 en 09:00 uur tellen dus niet mee. Dit staat in artikel 61 lid 2 Wetboek van Strafvordering.

Voorbeeld: als je om 03:00 uur 's nachts wordt aangehouden, start de 9-uurstermijn pas om 09:00 uur en loopt dan tot 18:00 uur.

2. Inverzekeringstelling (IVS) – maximaal 3 dagen

Is er na het eerste onderzoek meer tijd nodig? Dan kan de officier van justitie besluiten je in verzekering te stellen. Dit mag alleen bij VH-feiten en is geregeld in artikel 57 lid 1 Wetboek van Strafvordering. De inverzekeringstelling duurt maximaal 3 dagen.

3. Voorlopige hechtenis

Na de IVS kan de rechter-commissaris bepalen dat je langer vast moet blijven (bijvoorbeeld via bewaring van 14 dagen – zie artikel 63 Wetboek van Strafvordering (Sv)). Daarna kan eventueel gevangenhouding volgen, opnieuw op last van een rechter.


Rechten vanaf het moment van aanhouding

* Recht op een advocaat – vóór en tijdens het politieverhoor. (Artikel 28c en 28d Wetboek van Strafvordering)
* Zwijgrecht – je bent niet verplicht iets te zeggen. (Artikel 29 lid 1 Sv)
* Recht op informatie over de verdenking (Artikel 27c lid 1 Sv)
* Recht op een tolk of vertaling (Artikel 28b Sv)
* Recht dat een familielid of bekende op de hoogte wordt gebracht (Artikel 27c lid 2 Sv)
* Recht op inzage in processtukken via je advocaat (Artikel 30 Sv)


Praktijkvoorbeeld

Stel: je wordt om 04:00 uur 's nachts aangehouden op verdenking van zware mishandeling. Je wordt naar het bureau gebracht. De politie mag je pas vanaf 09:00 uur vasthouden voor maximaal 9 uur onderzoek. Rond 18:00 uur moet beslist worden of je wordt vrijgelaten of dat de officier van justitie je in verzekering stelt voor verder onderzoek.


Wat kun je doen?

* Vraag direct een advocaat – dit is gratis bij het eerste verhoor
* Maak gebruik van je zwijgrecht als je twijfelt
* Vraag de politie of ze iemand in je omgeving informeren
* Vraag je advocaat of je in bezwaar kunt tegen je vrijheidsbeneming (artikel 59a Sv)
* Overleg over de inzichtelijkheid van het dossier en je procespositie


Gerelateerde regelgeving

* Artikel 61 lid 2 Wetboek van Strafvordering – starttermijn ophouden voor onderzoek (09:00 uur)
* Artikel 57 lid 1 Wetboek van Strafvordering – inverzekeringstelling (max. 3 dagen)
* Artikel 67 lid 1 Wetboek van Strafvordering – voorlopige hechtenis bij bepaalde feiten
* Artikel 28b t/m 30 Sv – rechten rond advocaat, informatie, tolk en stukken
* Artikel 29 lid 1 Sv – zwijgrecht
* Artikel 63 Sv – voorlopige hechtenis (bewaring)


Belangrijke rechtspraak / documenten

* HvJ EU, Salduz – recht op advocaat vanaf eerste verhoor
* HR 30 juni 2009, ECLI:NL:HR:2009:BH3081 – uitleg bijstand advocaat
* Aanwijzing rechtsbijstand politieverhoor – OM-beleid


Laatst gecheckt: 28 juni 2025
Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'klachtencommissie-politie',
      title: 'Hoe zit het met de klachtencommissie bij de politie?',
      description: '',
      category: 'Klacht & Bezwaar',
      categorySlug: 'klacht',
      seoTitle: 'Klachtencommissie politie: procedure en rechten',
      seoDescription: 'Alles over de onafhankelijke klachtencommissie bij de politie: wanneer, hoe, procedure, rechten en plichten.',
      readTime: '',
      lastUpdated: '2025-06-28',
      views: 0,
      tags: ['klacht', 'klachtencommissie', 'politie', 'onafhankelijk', 'procedure'],
      featured: false,
      content: `## Kort antwoord

Als je het niet eens bent met hoe de politie jouw klacht heeft behandeld, kun je vragen om een beoordeling door een onafhankelijke klachtencommissie. Die commissie hoort beide partijen, onderzoekt de situatie en adviseert daarna de korpschef, die een definitief oordeel geeft.


Uitgebreide uitleg

Wat is de klachtencommissie?

Elke politie-eenheid in Nederland heeft een onafhankelijke klachtencommissie. Die commissie bestaat uit leden die niet bij de politie werken en dus onafhankelijk kunnen oordelen.

De klachtencommissie:

* hoort beide partijen: jij én de politieambtenaar over wie je klaagt
* onderzoekt of de politie zorgvuldig en correct heeft gehandeld
* adviseert de korpschef over het uiteindelijke oordeel

De korpschef neemt het besluit, maar moet het advies van de commissie serieus meewegen. Hij mag alleen gemotiveerd afwijken.


Wanneer komt je klacht daar terecht?

De klachtencommissie wordt ingeschakeld als:

* je niet tevreden bent over de formele afhandeling van je klacht
* je vindt dat de klacht niet objectief is onderzocht
* je vraagt om een onafhankelijke herbeoordeling

In sommige gevallen kan de politie ook zélf besluiten om de klacht meteen naar de commissie te sturen, bijvoorbeeld als het gaat om ernstige of gevoelige kwesties (zoals geweld of discriminatie).


Hoe werkt de procedure?

1. Je dient een klacht in bij de politie.
2. Er wordt eerst geprobeerd om de klacht informeel op te lossen met een gesprek.
3. Als dat niet lukt, volgt een formele beoordeling.
4. Ben je daarna niet tevreden? Dan kun je vragen om een onderzoek door de klachtencommissie.
5. De commissie organiseert een hoorzitting, waarbij jij en de agent worden uitgenodigd.
6. Na het horen van beide partijen schrijft de commissie een advies aan de korpschef.
7. De korpschef neemt een definitief besluit over jouw klacht.


Wetsartikelen en regels

* Artikel 9:17 Algemene wet bestuursrecht – bepaalt dat je recht hebt op behandeling door een onafhankelijke commissie.
* Artikel 61 Politiewet 2012 – verplicht elke politie-eenheid tot het instellen van een onafhankelijke klachtencommissie.
* Artikel 9:10 Algemene wet bestuursrecht – regelt hoor en wederhoor bij klachtbehandeling.
* Artikel 9:12 Algemene wet bestuursrecht – regelt dat je het oordeel van de korpschef schriftelijk moet ontvangen.
* Interne klachtenregeling politie – geeft nadere regels over de inrichting en werkwijze van de klachtencommissie.


Praktijkvoorbeeld

Je wordt op straat staandegehouden omdat je volgens een agent 'verdacht gedrag' vertoonde. Je vindt dat hij zich agressief gedroeg en onduidelijk bleef over waarom je moest stoppen. Je dient een klacht in via politie.nl.

Na een formele klachtbehandeling krijg je te horen dat de klacht ongegrond is, omdat de agent volgens de politie juist handelde. Jij bent het hier niet mee eens en vraagt om doorverwijzing naar de klachtencommissie.

Tijdens de hoorzitting bij de commissie mag jij je verhaal doen. De betrokken agent wordt ook gehoord. De commissie komt tot het oordeel dat de agent formele bevoegdheden correct gebruikte, maar dat zijn manier van communiceren te kort schoot. De commissie adviseert om de klacht gedeeltelijk gegrond te verklaren. De korpschef volgt dit advies.


Rechten & plichten van de burger

Op basis van de Algemene wet bestuursrecht en de Politiewet 2012:

* Recht op onafhankelijke klachtbehandeling (artikel 9:17 Algemene wet bestuursrecht)
* Recht op hoor en wederhoor (artikel 9:10 Algemene wet bestuursrecht)
* Recht op inzage in stukken die voor het oordeel belangrijk zijn
* Recht op een gemotiveerde reactie van de korpschef (artikel 9:12 Algemene wet bestuursrecht)
* Recht op doorverwijzing naar de klachtencommissie (artikel 61 Politiewet 2012)
* Je hebt geen plicht om bewijs te leveren, maar dit kan je zaak wel sterker maken


Wat kun je doen?

* Vraag na een afwijzing om een doorverwijzing naar de klachtencommissie
* Bereid je goed voor op de hoorzitting (schrijf je verhaal uit, neem evt. een getuige mee)
* Raadpleeg de Nationale Ombudsman als je het niet eens bent met het uiteindelijke besluit
* Vraag zo nodig advies aan een jurist of een vertrouwenspersoon
* Bekijk de politie-informatie op: politie.nl/klacht


Gerelateerde regelgeving

* Artikel 9:1 t/m 9:17 Algemene wet bestuursrecht – algemene regels voor klachtbehandeling
* Artikel 61 Politiewet 2012 – verplichting tot onafhankelijke klachtencommissie
* Interne klachtenregeling politie – hoe klachtencommissies zijn ingericht en functioneren
* Gedragscode politie – normen voor professioneel gedrag van politieambtenaren


Belangrijke rechtspraak / beleid

* Nationale Ombudsman rapport 2019/003 – kritiek op gebrek aan onafhankelijkheid in klachtbehandeling
* Politievisie klachtbehandeling 2022 – benadrukt belang van transparantie en herstelgericht handelen
* ECLI:NL:HR:2021:983 – uitspraak over de klachtplicht bij handelen door ambtenaren


Laatst gecheckt: 28 juni 2025
Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'slachtofferrechten-misdrijf',
      title: 'Wat zijn je rechten als slachtoffer van een misdrijf?',
      description: '',
      category: 'Slachtoffer & Rechten',
      categorySlug: 'slachtoffer',
      seoTitle: 'Rechten als slachtoffer van een misdrijf',
      seoDescription: 'Volledige uitleg over slachtofferrechten: bescherming, informatie, ondersteuning, schadevergoeding en deelname aan strafproces.',
      readTime: '',
      lastUpdated: '2025-06-29',
      views: 0,
      tags: ['slachtoffer', 'rechten', 'strafproces', 'schadevergoeding', 'slachtofferhulp'],
      featured: true,
      content: `## Kort antwoord

Als slachtoffer van een misdrijf heb je recht op bescherming, informatie en ondersteuning. Je mag soms ook actief deelnemen aan het strafproces, bijvoorbeeld door een verklaring af te leggen of een schadevergoeding te vragen.


Uitgebreide uitleg

Slachtoffer zijn – wat betekent dat eigenlijk?

Wanneer je slachtoffer wordt van een misdrijf – bijvoorbeeld geweld, diefstal, seksueel geweld of een ernstig verkeersdelict – staat je leven vaak even stil. Het strafproces lijkt soms vooral te draaien om de verdachte, maar als slachtoffer heb je wél degelijk rechten. In Nederland zijn die rechten wettelijk vastgelegd en worden ze steeds beter beschermd.

De overheid vindt het belangrijk dat jij je als slachtoffer gezien, gehoord en serieus genomen voelt. Daarom zijn er wettelijke regels die ervoor zorgen dat je weet wat je rechten zijn, hoe je hulp kunt krijgen en hoe je eventueel invloed kunt uitoefenen op de strafzaak.


Recht op informatie en ondersteuning

Als slachtoffer mag je verwachten dat je goed geïnformeerd wordt. Dat begint al bij de aangifte. Je moet duidelijk uitgelegd krijgen wat er met jouw melding gebeurt, hoe het strafproces in elkaar zit en wat jouw rol daarin kan zijn.

Ook heb je recht op ondersteuning. Denk aan juridische hulp, emotionele steun of praktische begeleiding. Vaak wordt die hulp geboden door Slachtofferhulp Nederland, die jou kosteloos kan helpen bij:
* het opstellen van een slachtofferverklaring,
* het regelen van schadevergoeding,
* of het omgaan met de emotionele impact.

Je hoeft het dus niet alleen te doen.


Meedoen in het strafproces

Sommige slachtoffers mogen ook actief meedoen in de rechtszaak. Dit hangt af van het soort misdrijf. Als je bijvoorbeeld slachtoffer bent van een ernstig geweldsdelict of zedenmisdrijf, kun je gebruikmaken van een slachtofferverklaring.

Daarin vertel je de rechter, de officier van justitie en de verdachte wat het misdrijf met jou heeft gedaan. Deze verklaring mag je schriftelijk indienen, maar je kunt die ook zelf voorlezen tijdens de zitting. Veel slachtoffers vinden dat belangrijk voor hun verwerking.

Als je schade hebt geleden, zoals kapotte spullen of medische kosten, dan kun je vragen of de dader die kosten terugbetaalt. Dat doe je via een verzoek tot schadevergoeding. Dit kan vaak al tijdens het strafproces zelf, zodat je niet apart naar de civiele rechter hoeft.


Bescherming en veiligheid

De overheid neemt ook je veiligheid serieus. Als slachtoffer kun je bescherming krijgen, bijvoorbeeld als je bang bent dat de verdachte contact met je zoekt. In sommige gevallen kun je anoniem blijven in het strafdossier, of gescheiden van de verdachte wachten bij de rechtbank.

Er zijn ook extra maatregelen mogelijk, zoals een contactverbod of een straatverbod via de rechter. Dit wordt per zaak bekeken.


Inzicht in het dossier

Je mag in bepaalde gevallen (gedeeltelijk) het strafdossier inzien. Bijvoorbeeld als je schadevergoeding vraagt of een verklaring wilt afleggen. Dit dossier bevat informatie over het onderzoek en de stand van zaken. De officier van justitie beslist of je toegang krijgt, soms met hulp van een advocaat of juridisch adviseur.


Voorbeeld uit de praktijk

Stel je voor: je fiets wordt gestolen, maar je raakt ook gewond doordat je omver wordt geduwd. Je doet aangifte bij de politie en krijgt hulp van Slachtofferhulp Nederland. Tijdens het strafproces lees je zelf je slachtofferverklaring voor in de rechtszaal. Je vraagt ook vergoeding van je medische kosten. De rechter neemt jouw verhaal serieus en veroordeelt de dader. De schadevergoeding wordt toegewezen.


Meer weten?

Op de website van de Rijksoverheid vind je een duidelijk overzicht van alle rechten voor slachtoffers en nabestaanden: 👉 www.rijksoverheid.nl/slachtofferrechten

Daar vind je onder andere informatie over:
* het verschil tussen slachtoffer en nabestaande;
* de hulp die je kunt krijgen;
* wat je mag verwachten tijdens het strafproces.


Wetten waarop dit gebaseerd is

* Wetboek van Strafvordering, artikel 51a t/m 51h
* Wet ter versterking van de positie van het slachtoffer in het strafproces
* Besluit schadefonds geweldsmisdrijven (voor vergoeding via de overheid als de dader onbekend of onvermogend is)


Wat kun je doen?

* Neem contact op met Slachtofferhulp Nederland via 0900-0101 of slachtofferhulp.nl
* Vraag hulp bij het opstellen van een slachtofferverklaring of schadevergoeding
* Bespreek met de officier van justitie of je mag deelnemen aan de zitting
* Raadpleeg een advocaat bij complexe zaken


Laatst gecheckt: 29 juni 2025
Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'politie-persoonsgegevens',
      title: 'Hoe gaat de politie om met mijn persoonsgegevens?',
      description: '',
      category: 'Privacy & Informatie',
      categorySlug: 'privacy',
      seoTitle: 'Politie en persoonsgegevens: rechten en regels',
      seoDescription: 'Alles over persoonsgegevens bij de politie: Wet politiegegevens, je rechten, inzage, correctie en bescherming.',
      readTime: '',
      lastUpdated: '2025-06-29',
      views: 0,
      tags: ['persoonsgegevens', 'privacy', 'wet politiegegevens', 'inzage', 'AVG'],
      featured: true,
      content: `## Kort antwoord

De politie mag jouw persoonsgegevens verwerken, maar alleen als dat noodzakelijk is voor hun werk. Ze moeten zich daarbij houden aan strenge regels uit de Wet politiegegevens.


Hoe werkt dit precies?

De politie werkt met eigen privacyregels

De politie gebruikt persoonsgegevens, bijvoorbeeld om misdrijven op te sporen of orde te handhaven. Maar dat mag niet zomaar. De regels hiervoor staan in de Wet politiegegevens (Wpg). Deze wet is speciaal gemaakt voor de politie en lijkt op de AVG (privacywet), maar is strenger door het soort werk dat de politie doet.


Wanneer mag de politie gegevens verwerken?

Volgens artikel 3 Wet politiegegevens mag de politie persoonsgegevens verwerken als dat nodig is voor:
* opsporing van strafbare feiten
* handhaving van de openbare orde en veiligheid
* het verlenen van hulp aan mensen die dat nodig hebben
* uitvoering van taken in het kader van vreemdelingencontrole of bewaking en beveiliging

De gegevens mogen niet langer bewaard worden dan nodig is voor het doel waarvoor ze zijn verzameld (artikel 8 lid 1 Wpg).


Welke gegevens gaat het om?

Het kan gaan om allerlei soorten gegevens:
* naam, adres, geboortedatum
* foto's, camerabeelden, kentekens
* informatie over contacten met de politie (zoals aangiften of staandehoudingen)

Soms worden ook bijzondere persoonsgegevens verwerkt (bijvoorbeeld over gezondheid of etniciteit), maar dat mag alleen als er een wettelijke reden voor is (artikel 9 Wpg).


Praktijkvoorbeeld

Je wordt staande gehouden omdat je zonder licht fietst. De politieagent noteert je naam en geboortedatum om een waarschuwing of boete op te maken. Deze gegevens komen in een politiebestand, maar mogen niet eindeloos worden bewaard. Als je geen verdachte bent van iets ernstigs, worden ze na een bepaalde tijd automatisch verwijderd.


Wat zijn jouw rechten?

Volgens de artikelen 25 t/m 32 Wet politiegegevens heb je als burger rechten, zoals:
* Recht op inzage: je mag vragen of en welke gegevens de politie over jou heeft.
* Recht op correctie: als gegevens niet kloppen, mag je vragen om aanpassing.
* Recht op verwijdering: als gegevens onterecht zijn vastgelegd.
* Recht op informatie: je mag weten waarvoor je gegevens worden gebruikt, behalve als dat het werk van de politie zou verstoren.

Je kunt dit regelen via de politie via www.politie.nl/privacy


Wat kun je doen?

* Inzageverzoek indienen bij de politie: ga naar politie.nl/privacy.
* Klacht indienen bij de politie als je denkt dat jouw gegevens verkeerd gebruikt zijn.
* Naar de Autoriteit Persoonsgegevens stappen als je klacht niet goed is afgehandeld: autoriteitpersoonsgegevens.nl


Gerelateerde regelgeving

* Wet politiegegevens (Wpg) – speciale privacywet voor politiegegevens
* AVG (Algemene Verordening Gegevensbescherming) – geldt niet direct, maar wel als achtergrond
* Besluit politiegegevens – bevat nadere regels, zoals bewaartermijnen en beveiliging


Belangrijke rechtspraak en beleidsdocumenten

1. ECLI:NL:HR:2020:1725 – Hoge Raad over bewaartermijnen bij politiegegevens
2. Beleidsregel politiegegevens (ministerie van Justitie & Veiligheid) – geeft uitleg over hoe de politie de Wpg toepast
3. Toezichtsrapporten Autoriteit Persoonsgegevens – geven inzicht in waar het soms misgaat


Laatst gecheckt: 29 juni 2025
Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'camerabeelden-126nda-bevel',
      title: 'Wat moet ik doen als de politie om camerabeelden vraagt van de beveiligingscamera aan mijn woning?',
      description: '',
      category: 'Privacy & Informatie',
      categorySlug: 'privacy',
      seoTitle: 'Politie vraagt camerabeelden: 126nda bevel uitgelegd',
      seoDescription: 'Alles over het delen van camerabeelden met politie: artikel 126nda Sv, verplichtingen, rechten en praktische tips.',
      readTime: '',
      lastUpdated: '2025-06-29',
      views: 0,
      tags: ['camerabeelden', '126nda', 'bevel', 'privacy', 'bewakingscamera', 'strafvordering'],
      featured: true,
      content: `## 1. Kort antwoord in 2 zinnen

Als je geen slachtoffer bent, vraagt de politie tegenwoordig meestal om camerabeelden via een officieel bevel op basis van artikel 126nda Wetboek van Strafvordering (Sv). Zo'n bevel is verplicht bij bepaalde strafbare feiten, en weigeren kan – in uitzonderlijke gevallen – strafbaar zijn.


## 2. Uitgebreide uitleg

Jij bent verantwoordelijk voor je camerabeelden

Heb je een beveiligingscamera aan je woning die ook de openbare ruimte filmt? Dan ben jij verantwoordelijk voor de opslag en het beheer van die beelden. De politie mag daar niet zomaar bij, maar kan ze wel opvragen via duidelijke procedures.


Vrijwillig delen mag, maar hoeft niet

Soms vraagt de politie of je vrijwillig beelden wilt delen, bijvoorbeeld als getuige. Je bent dan vrij om ja of nee te zeggen. Als je zélf slachtoffer bent (bijvoorbeeld na vandalisme aan je auto), mag je beelden op basis van artikel 6 AVG vrijwillig geven, omdat je dan een gerechtvaardigd belang hebt.


Steeds vaker: formeel bevel via artikel 126nda Sv

In de praktijk vraagt de politie bijna standaard beelden via een formeel bevel op basis van artikel 126nda Wetboek van Strafvordering (Sv). Dit bevel kan worden opgelegd door een politieagent zelf (opsporingsambtenaar), zonder tussenkomst van een (hulp)officier van justitie.

Dit bevel mag alleen worden gegeven bij strafbare feiten waarvoor voorlopige hechtenis is toegestaan. Dat staat in artikel 67 Wetboek van Strafvordering (Sv). Voorbeelden zijn:
* Mishandeling
* Diefstal
* Inbraak
* Vernieling
* Bedreiging
* Zedendelicten
* Zware verkeersdelicten

De gedachte hierachter is dat er sprake moet zijn van een zwaarder feit, voordat de politie een bevel tot gegevensafgifte mag inzetten.


Wat houdt zo'n bevel in?

Een 126nda-bevel moet altijd:
* Schriftelijk zijn (of bij spoed: mondeling, gevolgd door schriftelijke bevestiging)
* Duidelijk vermelden: welke gegevens worden gevorderd (zoals de datum en tijd van de beelden)
* Afkomstig zijn van een bevoegde opsporingsambtenaar

Als je zo'n bevel krijgt, ben je wettelijk verplicht om de gevraagde beelden aan te leveren.


Wat als je niet meewerkt?

In eerste instantie gaat de politie uit van medewerking. Maar als je opzettelijk weigert om aan een geldig bevel te voldoen, dan kun je strafbaar zijn op grond van artikel 184 Wetboek van Strafrecht (Sr). Dat artikel stelt dat wie een wettelijk gegeven ambtelijk bevel negeert, strafbaar is.

Dit wordt doorgaans niet direct toegepast, maar het kan wel – zeker als je zonder geldige reden tegenwerkt.


## 3. Exacte wetsartikelen

* Artikel 126nda Wetboek van Strafvordering – Bevel tot uitlevering van opgeslagen gegevens
* Artikel 67 lid 1 Wetboek van Strafvordering – Strafbare feiten waarvoor voorlopige hechtenis mogelijk is
* Artikel 184 lid 1 sub 1 Wetboek van Strafrecht – Niet voldoen aan wettelijk bevel is strafbaar
* Artikel 6 lid 1 sub f AVG – Vrijwillige verwerking bij gerechtvaardigd belang


## 4. Praktijkvoorbeeld

Op vrijdagavond vindt een zware mishandeling plaats op straat. De politie vermoedt dat jouw beveiligingscamera het incident heeft vastgelegd. Jij bent geen slachtoffer. Een agent overhandigt een 126nda-bevel, waarin gevraagd wordt om beelden van 21.00 tot 22.00 uur. Omdat mishandeling een feit is waarvoor voorlopige hechtenis geldt (artikel 67 Sv), is het bevel wettelijk toegestaan. Jij levert de beelden aan, waarmee de politie verder kan in het onderzoek.


## 5. Rechten & plichten van de burger

Bron: Wetboek van Strafvordering, Strafrecht, AVG
* Je mag vragen of het gaat om een verzoek of een bevel
* Je hebt recht op een schriftelijke kopie van het bevel
* Je bent verplicht mee te werken aan een geldig 126nda-bevel bij een strafbaar feit uit artikel 67 Sv
* De politie mag je woning of systemen niet binnengaan zonder aparte machtiging
* Weigeren zonder geldige reden kan strafbaar zijn op grond van artikel 184 Sr


## 6. Wat kun je doen?

* Vraag altijd om verduidelijking: verzoek of bevel?
* Controleer of het bevel schriftelijk, specifiek en onderbouwd is
* Lever de beelden correct aan of bewaar een kopie voor jezelf
* Twijfel je? Vraag advies bij een advocaat of het Juridisch Loket


## 7. Gerelateerde regelgeving

* AVG (Algemene Verordening Gegevensbescherming) – regels voor delen van persoonsgegevens
* Wet politiegegevens – hoe de politie met persoonsgegevens moet omgaan
* Besluit politiegegevens – nadere uitwerking van bewaartermijnen en verwerking


## 8. Belangrijke rechtspraak of beleid

* HR 30-11-1999, NJ 2000/204 – Rechtmatigheid van gegevensinbeslagname
* Politiehandleiding camerabeelden bij opsporing (intern) – Adviseert standaard gebruik 126nda bij derden


## 9. Laatst gecheckt

29 juni 2025 Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'inzage-politiegegevens',
      title: 'Mag ik weten wat de politie over mij weet?',
      description: '',
      category: 'Privacy & Informatie',
      categorySlug: 'privacy',
      seoTitle: 'Inzagerecht politiegegevens: wat mag ik weten?',
      seoDescription: 'Alles over inzage in politiegegevens: Wet politiegegevens, uitzonderingen, procedure en je rechten op correctie.',
      readTime: '',
      lastUpdated: '2025-06-29',
      views: 0,
      tags: ['inzagerecht', 'politiegegevens', 'wet politiegegevens', 'privacy', 'dossier'],
      featured: true,
      content: `## Kort antwoord

Ja, je mag opvragen welke persoonsgegevens de politie van jou heeft opgeslagen. Dit heet een inzageverzoek op basis van de Wet politiegegevens (Wpg).


## Uitgebreide uitleg

Je mag jouw gegevens inzien

Iedere burger heeft het recht om te weten welke persoonsgegevens de politie over hem of haar verwerkt. Dit staat in artikel 25 lid 1 van de Wet politiegegevens (Wpg). Je kunt daarvoor een verzoek indienen bij de politie – digitaal of schriftelijk.

Het gaat hier dus niet om een volledig strafdossier, maar om gegevens die bijvoorbeeld in meldingen, politiesystemen of contactmomenten zijn geregistreerd.


Wat valt onder 'politiegegevens'?

Bijvoorbeeld:
* Vermelding in een aangifte of melding.
* Notities over overlast, signaleringen of controles.
* Gesprekken of waarnemingen door de politie.
* Gegevens in systemen zoals BVH, Summ-IT of HKS.


Uitzonderingen op inzage

De politie mag jouw inzageverzoek weigeren of beperken in bepaalde situaties:

Volgens artikel 25 lid 2 Wpg:
* Als inzage de veiligheid van de staat schaadt.
* Als dit de opsporing van strafbare feiten belemmert.
* Of: ter bescherming van de rechten en vrijheden van anderen.

Volgens artikel 27 Wpg:
* Mag de politie inzage uitstellen, beperken, of zelfs verzwijgen dat er gegevens zijn, als dat nodig is voor:
    * Een lopend onderzoek;
    * De bescherming van derden;
    * Of de rechtsorde.


Praktijkvoorbeeld

Je bent drie jaar geleden betrokken geweest bij een burenruzie waarbij de politie is langsgekomen. Je vraagt je af of je naam nog ergens geregistreerd staat. Je dient een inzageverzoek in. De politie laat weten dat er een melding is waarin jouw naam genoemd wordt, maar sommige gegevens zijn afgeschermd omdat deze betrekking hebben op de buurman (bescherming rechten van anderen – artikel 27 Wpg).


Rechten & plichten van de burger

Op basis van de Wet politiegegevens heb je recht op:
* Inzage in je persoonsgegevens (artikel 25 lid 1 Wpg).
* Correctie of verwijdering van onjuiste of onrechtmatige gegevens (artikel 28 Wpg).
* Beperking of verzet tegen verwerking in bepaalde gevallen (artikel 29 Wpg).

Let op: de politie mag inzage weigeren of beperken op basis van artikel 25 lid 2 en artikel 27.


Wat kun je doen?

1. Inzageverzoek indienen bij de politie
2. Reactietermijn: binnen 6 weken.
3. Niet eens met het antwoord?
    * Vraag om correctie of verwijdering (artikel 28).
    * Dien een klacht in bij de politie.
    * Of stap naar de Autoriteit Persoonsgegevens.


Gerelateerde regelgeving

* Wet politiegegevens (Wpg) – regelt verwerking van persoonsgegevens bij de politie.
* Beleidsregels verwerking politiegegevens (Korpschef) – geeft uitleg over hoe de politie dit uitvoert.
* AVG (voor zover van toepassing) – vult de Wpg in beperkte gevallen aan.


Belangrijke rechtspraak / documenten

* ECLI:NL:CBB:2020:497 – bevestigt dat inzage beperkt mag worden bij opsporingsbelang.
* Handleiding Inzageverzoeken Politie (interne werkinstructie) – bepaalt hoe de politie met jouw verzoek omgaat.


Laatst gecheckt: 29 juni 2025
Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'snelheidsmeting-politie',
      title: 'Op welke wijze kan de politie een snelheidsmeting doen en moeten zij dit aan mij kunnen bewijzen?',
      description: '',
      category: 'Verkeer',
      categorySlug: 'verkeer',
      seoTitle: 'Snelheidsmeting politie: methoden en bewijsvoering',
      seoDescription: 'Alles over politie snelheidsmetingen: radar, laser, ProVida, uitloopmeting, bewijsplicht en je rechten bij bezwaar.',
      readTime: '',
      lastUpdated: '2025-06-29',
      views: 0,
      tags: ['snelheidsmeting', 'radar', 'laser', 'uitloopmeting', 'provida', 'bewijsvoering', 'verkeer'],
      featured: true,
      content: `## 1. Kort antwoord

De politie mag je snelheid meten met o.a. radar, laser of door je te volgen met een dienstvoertuig (uitloopmeting). Ze hoeven dit ter plekke niet te bewijzen, maar jij mag later de gegevens opvragen.


## 2. Uitgebreide uitleg

Hoe meet de politie snelheid?

De politie gebruikt verschillende methoden om snelheid vast te stellen:
* Radar of laser: Bekend van flitspalen of handbediende laserguns.
* Trajectcontrole: Je gemiddelde snelheid wordt automatisch berekend tussen twee vaste punten.
* ProVida-systeem: Vanuit een politievoertuig wordt je snelheid gemeten en vastgelegd op video.
* Uitloopmeting: Een agent rijdt achter je en gebruikt de snelheidsmeter van het dienstvoertuig om jouw snelheid vast te stellen. Dit gebeurt zonder foto of digitale registratie.


Wat is een uitloopmeting?

Bij een uitloopmeting volgt de agent jouw voertuig, vaak als je wegrijdt van de politie. De agent houdt een constante afstand en kijkt naar de snelheid van de dienstauto, die volgens de wet gekalibreerd moet zijn. Die snelheid geldt dan als minimale gereden snelheid van jouw voertuig. Dit is toegestaan, ook zonder opname of meetrapport.

Belangrijk:
* De dienstauto moet voorzien zijn van een goedgekeurde en recent gekalibreerde snelheidsmeter.
* De afstand en duur van de meting moeten voldoende zijn voor een betrouwbare inschatting.
* De politieagent moet dit duidelijk vastleggen in het proces-verbaal.


Moet de politie dit direct bewijzen?

Nee. Agenten hoeven je op straat geen meetgegevens te tonen. Je krijgt meestal later een beschikking of proces-verbaal thuis. Als je het er niet mee eens bent, mag je in bezwaar gaan en daarbij inzage vragen in de meetgegevens, zoals:
* Het type meting.
* Kalibratiegegevens van het gebruikte apparaat of voertuig.
* De observatie en verklaring van de agent.


## 3. Wetsartikelen

* Artikel 160 Wegenverkeerswet 1994: politie mag voertuigen stilhouden en controleren.
* Artikel 5.1 Reglement verkeersregels en verkeerstekens 1990 (RVV 1990): verbiedt overschrijding van maximumsnelheid.
* Artikel 8 Wet administratiefrechtelijke handhaving verkeersvoorschriften (Wet Mulder): boete via administratiefrechtelijke weg.
* Artikel 7 lid 1 Politiewet 2012: toezicht op naleving van verkeersregels.
* Artikel 152 Wegenverkeerswet 1994: verklaring van een opsporingsambtenaar geldt als bewijsmiddel.


## 4. Praktijkvoorbeeld

Een automobilist rijdt weg bij een verkeerslicht. Een agent vermoedt dat de bestuurder te hard rijdt. Hij volgt hem met de politieauto op constante afstand over een afstand van ongeveer 700 meter. De snelheidsmeter van de politieauto, die recent is gekalibreerd, geeft 104 km/u aan op een weg waar 80 is toegestaan. De agent noteert dit in het proces-verbaal. De bestuurder krijgt een boete op basis van deze uitloopmeting. Ook zonder foto is dit geldig bewijs.


## 5. Rechten en plichten van de burger

Plichten:
* Stoppen bij een controle (artikel 160 WVW).
* Je identificeren en rijbewijs tonen.

Rechten:
* Je mag bezwaar maken tegen de boete (artikel 6:4 Algemene wet bestuursrecht).
* Je hebt recht op inzage in:
    * Het proces-verbaal.
    * De gebruikte meetmethode.
    * Kalibratiegegevens (Regeling meetmiddelen politie 2022).


## 6. Wat kun je doen?

* Maak bezwaar als je twijfelt aan de juistheid van de meting.
* Vraag om het proces-verbaal en kalibratiegegevens, vooral bij uitloopmetingen.
* Schakel juridisch advies in bij twijfel of onduidelijkheid.
* Controleer of het meetmiddel is toegestaan, bijvoorbeeld via de Regeling meetmiddelen politie 2022.


## 7. Gerelateerde regelgeving

* Regeling meetmiddelen politie 2022: bepaalt welke snelheidsmeetinstrumenten de politie mag gebruiken en hoe vaak deze gekalibreerd moeten worden.
* Wet Mulder: regelt de administratieve afhandeling van verkeersboetes.
* Besluit administratiefrechtelijke handhaving verkeersvoorschriften: geeft aan hoe bezwaar- en beroepsprocedures verlopen.


## 8. Belangrijke rechtspraak

* HR 29 juni 1999, ECLI:NL:HR:1999:ZD1490: verklaring van agent mag als bewijs dienen bij juiste toepassing van meetmethode.
* RB Midden-Nederland 2021, ECLI:NL:RBMNE:2021:1534: uitloopmeting is geldig als het voertuig gekalibreerd is en de observatie goed is vastgelegd.


## 9. Laatst gecheckt

29 juni 2025 – Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'winkelverbod-huisrecht',
      title: 'Mag een winkel mij zomaar een winkelverbod opleggen?',
      description: '',
      category: 'Civielrecht',
      categorySlug: 'burgerrecht',
      seoTitle: 'Winkelverbod en huisrecht: mag dit zomaar?',
      seoDescription: 'Alles over winkelverboden: huisrecht van winkels, discriminatieverbod, je rechten en wat je kunt doen bij onterecht verbod.',
      readTime: '',
      lastUpdated: '2025-06-29',
      views: 0,
      tags: ['winkelverbod', 'huisrecht', 'discriminatie', 'burgerrecht', 'winkels'],
      featured: true,
      content: `## Kort antwoord

Ja, een winkel mag in principe zelf bepalen wie zij wel of niet toelaat. Maar er zijn grenzen: het verbod mag niet discrimineren en moet redelijk zijn.

## Uitgebreide uitleg

Een winkel is privéterrein

Winkels zijn juridisch gezien geen openbare ruimtes, maar privéterreinen die openstaan voor publiek. De eigenaar of beheerder heeft daarom het recht om te bepalen wie toegang krijgt. Dit heet het huisrecht.

Dat betekent dat een winkel een klant mag weigeren of de toegang mag ontzeggen, ook zonder strafbaar feit. Denk aan iemand die zich onbeleefd gedraagt, medewerkers lastigvalt, of herhaaldelijk problemen veroorzaakt.

Geen strafbaar feit nodig

Je hoeft dus niet iets strafbaars te hebben gedaan om een winkelverbod te krijgen. Ook ongewenst gedrag of herhaalde conflicten kunnen reden zijn. Het verbod kan mondeling of schriftelijk worden opgelegd. Bij een schriftelijk winkelverbod staat vaak ook voor hoelang het geldt en waarom het is opgelegd.

Toch zijn er grenzen

Een winkelverbod mag niet in strijd zijn met de wet, zoals:
* Discriminatieverbod: Een verbod mag niet gebaseerd zijn op afkomst, huidskleur, geslacht, religie, etc. (artikel 1 Grondwet).
* Misbruik van recht: Als het verbod puur bedoeld is om te pesten of onder druk te zetten, kan dat onder omstandigheden als onrechtmatig gelden (artikel 162 Burgerlijk Wetboek – onrechtmatige daad).

Als je het gevoel hebt dat het verbod nergens op slaat of discriminerend is, kun je hier iets tegen doen (zie onder).

## Wetsartikelen waarop dit is gebaseerd

* Artikel 1 Grondwet – Gelijkheidsbeginsel en verbod op discriminatie.
* Artikel 162 Burgerlijk Wetboek – Onrechtmatige daad.
* Huisrecht (juridisch leerstuk, niet één artikel) – Recht van een eigenaar om iemand toegang tot privéterrein te weigeren.

## Praktijkvoorbeeld

Je komt vaak in een winkel en maakt wel eens een sarcastische opmerking richting personeel. Op een dag zegt een medewerker dat je niet meer welkom bent vanwege "onprettig gedrag". Je hebt niks gestolen of iets kapotgemaakt. Toch mag de winkel dit doen, zolang het niet op discriminatie gebaseerd is of onredelijk escaleert.

## Rechten en plichten van de burger

Je rechten (o.a. volgens BW en Grondwet):
* Je mag bezwaar maken tegen een winkelverbod als dit in strijd is met de wet, bijvoorbeeld vanwege discriminatie.
* Je mag de reden van het verbod vragen, maar de winkel is niet verplicht daar uitgebreid op in te gaan.

Je plichten:
* Je moet je aan het winkelverbod houden, ook als je het onterecht vindt. Doorgaan met binnenkomen kan worden gezien als huisvredebreuk (artikel 138 Wetboek van Strafrecht (Sr)).

## Wat kun je doen?

* Vraag om de reden van het verbod en laat eventueel schriftelijk bevestigen.
* Maak bezwaar bij de winkel zelf (bijvoorbeeld via een e-mail aan de manager).
* Vraag juridisch advies als je denkt dat het verbod discriminerend of onrechtmatig is.
* Ga niet terug de winkel in, anders riskeer je een strafbaar feit.

## Gerelateerde regelgeving

* Artikel 138 Wetboek van Strafrecht – Huisvredebreuk: als je een winkel betreedt terwijl je daar niet mag zijn.
* Artikel 1 Grondwet – Discriminatieverbod.
* Artikel 162 Burgerlijk Wetboek – Onrechtmatige daad bij misbruik van bevoegdheid.

## Belangrijke rechtspraak of beleid

* HR 29 maart 1991, NJ 1991, 668 (Woningbouwvereniging/Huurder) – over grenzen aan huisrecht.
* HR 18 januari 2013, ECLI:NL:HR:2013:BY0550 – over onrechtmatige daad bij buitensluiting.

Laatst gecheckt: 29 juni 2025. Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'minderjarige-verdachte-rechten',
      title: 'Welke rechten heeft een minderjarige verdachte bij politieonderzoek en strafproces?',
      description: '',
      category: 'Jeugdstrafrecht',
      categorySlug: 'jeugdstrafrecht',
      seoTitle: 'Rechten minderjarige verdachte bij politie en strafproces',
      seoDescription: 'Alles over rechten van minderjarige verdachten: zwijgrecht, advocaat, vertrouwenspersoon aanwezig bij verhoor.',
      readTime: '',
      lastUpdated: '2025-12-29',
      views: 0,
      tags: ['minderjarigen', 'jeugdstrafrecht', 'verdachte', 'zwijgrecht', 'advocaat', 'vertrouwenspersoon'],
      featured: true,
      content: `## Kort antwoord

Een minderjarige verdachte heeft recht op duidelijke informatie over de verdenking, op zwijgrecht en op juridische bijstand met een advocaat én een vertrouwenspersoon (bijvoorbeeld een ouder). Tijdens verhoor moet bovendien een ouder, voogd of andere – wettelijk erkende – vertrouwenspersoon aanwezig zijn.

## Uitgebreide uitleg

Rechten bij aanhouding en verhoor

Iedere verdachte krijgt bij aanhouding direct te horen waarom hij is opgepakt en welke rechten hij heeft. Dit geldt ook voor minderjarigen. Zo moet de politie de verdachte informeren over:
* de aard van de verdenking;
* het zwijgrecht (niet meewerken aan vragen) (artikel 28 Wetboek van Strafvordering);
* het recht op rechtsbijstand (artikel 29 Wetboek van Strafvordering).

Minderjarigen krijgen deze informatie in begrijpelijke bewoordingen, aangepast aan hun leeftijd, zodat ze écht begrijpen wat er speelt.

Specifieke rechten voor minderjarigen

Minderjarige verdachten (< 18 jaar) hebben extra waarborgen in het jeugdstrafrecht:

1. Vertrouwenspersoon aanwezig Voor, tijdens en na het verhoor moet er een vertrouwenspersoon aanwezig zijn, vaak een ouder of voogd. Deze persoon ondersteunt de jongere en kan helpen door uitleg te geven of gerust te stellen.

2. Eigen advocaat Een minderjarige kan altijd een eigen advocaat kiezen en kosteloos een pro-Deo-advocaat krijgen als de financiële situatie daartoe aanleiding geeft. De advocaat bereidt het verhoor voor en kan meeluisteren en adviseren.

3. Interpreter of tolk Spreekt de minderjarige de taal niet goed, dan is er recht op een tolk zodat alle informatie helder is.

4. Privacy en omgangsvormen Onderzoek en verhoor vinden plaats op een kindvriendelijke locatie, gescheiden van volwassen verdachten.

## Praktijkvoorbeeld

Een 16-jarige wordt opgepakt voor winkeldiefstal. Bij aankomst legt de agent uit waarom hij is aangehouden en dat hij niet verplicht is te praten (zwijgrecht). Zijn moeder wordt gebeld en aanwezig vóór het verhoor, samen met een advocaat. De advocaat legt uit welke vragen er komen en waarschuwt voor valkuilen; de moeder biedt emotionele steun. Na afloop krijgen zij een gescheiden bijstandslocatie aangeboden, zodat de jongere niet tussen volwassen verdachten zit.

## Rechten en plichten in lopende tekst

Een minderjarige verdachte moet zich aan de aanwijzingen van de politie houden (bijvoorbeeld om mee te gaan naar het politiebureau). Hij is verplicht zich te identificeren als daarom wordt gevraagd. Tegelijkertijd mag hij altijd gebruikmaken van zijn zwijgrecht en hoeft hij geen belastende verklaringen af te leggen.

## Wat kun je doen?

Als (verzorgende van) een minderjarige verdachte kun je:
* contact opnemen met het Juridisch Loket voor gratis eerste advies;
* een gespecialiseerde jeugdstrafrechtadvocaat inschakelen via de orde van advocaten;
* bij onduidelijkheden of klachten de Nationale Ombudsman of het Kinderombudsteam benaderen.

Laatst gecheckt: december 2025. Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'halt-afdoening-jongeren',
      title: 'Hoe werkt de Halt-afdoening voor jongeren die een licht strafbaar feit plegen?',
      description: '',
      category: 'Jeugdstrafrecht',
      categorySlug: 'jeugdstrafrecht',
      seoTitle: 'HALT-afdoening jongeren: procedure en voorwaarden',
      seoDescription: 'Alles over HALT voor jongeren: wat is het, hoe werkt het, welke maatregelen en wat zijn de gevolgen.',
      readTime: '',
      lastUpdated: '2025-12-29',
      views: 0,
      tags: ['HALT', 'jongeren', 'jeugdstrafrecht', 'lichte delicten', 'maatregel', 'strafblad'],
      featured: true,
      content: `## Kort antwoord

HALT is een extra-justitiële regeling voor jongeren van 12 tot 18 jaar met een licht delict. De jongere volgt een maatregel (bijvoorbeeld een gesprek, taakstraf of herstelgesprek) waarna de zaak meestal wordt afgesloten zonder strafblad.

## Wat is HALT?

HALT is geen strafrechtelijke veroordeling, maar een voorwaardelijke afdoening voor jongeren die een eerste of eenmalige lichte overtreding begaan. Het doel is hen te laten leren van hun fout en verdere herhaling te voorkomen.

## Voorwaarden en procedure

Een HALT-afdoening kan wanneer:
* De jongere tussen 12 en 18 jaar is.
* Het gaat om een licht feit (bijvoorbeeld winkeldiefstal, vandalisme, vechtpartij zonder ernstig letsel).
* Er geen eerder vergelijkbare HALT-afdoening of strafbare feiten zijn geweest.

Procedure:
1. Overtreding en intake De politie of het Openbaar Ministerie verwijst de jongere door naar HALT.
2. Verkennend gesprek Een HALT-medewerker gaat in gesprek met de jongere en eventueel de ouders.
3. Maatregel kiezen Afhankelijk van het delict kan de jongere bijvoorbeeld een taakstraf doen, excuses aanbieden aan het slachtoffer of deelnemen aan een groepsgesprek.
4. Uitvoering en afronding Na goede uitvoering van de maatregel wordt de zaak gesloten; er volgt geen vermelding in justitiële documentatie.

## Praktijkvoorbeeld

Een 15-jarige steelt een reep chocola in de supermarkt. De politie schakelt HALT in. De jongere komt langs bij HALT, biedt schriftelijk excuses aan en helpt tijdens een middag mee met het opruimen van de winkel. Na afloop is de zaak afgedaan en heeft hij geen strafblad.

## Rechten en plichten van de jongere

Jongeren hebben het recht op een eerlijk gesprek en duidelijke uitleg over de HALT-regeling. Ze zijn verplicht de maatregel, zoals afgesproken, volledig uit te voeren. Niet-nakomen kan alsnog leiden tot een officier van justitie-zaak.

## Wat kun je doen?

Voor vragen of ondersteuning kun je terecht bij:
* HALT-locatie bij jou in de buurt (via halt.nl).
* Juridisch Loket voor gratis advies over je rechten.
* Advocaat jeugdrecht bij twijfel over de procedure.

Laatst gecheckt: december 2025. Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'telefoon-vasthouden-fietsen',
      title: 'Is het strafbaar om tijdens het fietsen alleen een telefoon vast te houden?',
      description: '',
      category: 'Verkeer',
      categorySlug: 'verkeer',
      seoTitle: 'Telefoon vasthouden tijdens fietsen: wat is toegestaan?',
      seoDescription: 'Alles over het verbod op telefoon vasthouden tijdens fietsen: regels, boetes en wat wel mag.',
      readTime: '',
      lastUpdated: '2025-12-29',
      views: 0,
      tags: ['fietsen', 'telefoon', 'mobiel apparaat', 'verkeer', 'RVV 1990', 'boete'],
      featured: true,
      content: `## Kort antwoord

Ja. Het is verboden om tijdens het fietsen een mobiel apparaat zoals een telefoon in de hand te houden, ongeacht of je ernaar kijkt.

## Uitgebreide uitleg

Wettelijke grondslag

Artikel 61a Reglement verkeersregels en verkeerstekens 1990 verbiedt het vasthouden van een mobiel elektronisch apparaat tijdens het rijden. Onder "rijden" valt elke beweging op de fiets. Dit verbod geldt voor onder andere mobiele telefoons, tablets en mediaspelers.

## Wat betekent dat in de praktijk?

Je mag je telefoon niet in de hand hebben terwijl je fietst, ook niet wanneer je – bijvoorbeeld bij een verkeerslicht – alleen even in je hand houdt zonder naar het scherm te kijken. Pas wanneer je volledig stilstaat en niet meer "rijdt", mag je het apparaat vasthouden en gebruiken. Een telefoon veilig in een houder op het stuur of in een tasje bevestigd is wél toegestaan.

## Praktijkvoorbeeld

Je wilt onderweg je route controleren. Als je de telefoon in een houder op het stuur plaatst, mag de navigatie-app zichtbaar blijven; je hebt dan geen handvrije overtreding. Houd je de telefoon echter in je hand terwijl je doorfietst, dan overtreed je artikel 61a RVV 1990.

## Rechten en plichten van burgers

Fietsers moeten dit verbod naleven om verkeersveiligheid te bevorderen. Bij overtreding kan de politie een boete opleggen. Betaling of verzet via de kantonrechter is de enige manier om hiertegen op te komen.

## Wat kunt u doen?

U kunt uw telefoon in een houder op het stuur of in een fietstas plaatsen om veilig te navigeren zonder de regels te overtreden. Heeft u een boete gekregen die u onterecht vindt, dan kunt u binnen zes weken bezwaar maken bij de officier van justitie of gratis juridisch advies inwinnen bij het Juridisch Loket.

Laatst gecheckt: december 2025. Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor uw eigen situatie.`
    },
    {
      slug: 'agent-filmen-straat',
      title: 'Mag ik een agent op straat filmen?',
      description: '',
      category: 'Privacy & Informatie',
      categorySlug: 'privacy',
      seoTitle: 'Mag ik een agent op straat filmen? | Rechten en regels',
      seoDescription: 'Alles over het filmen van politieagenten: wanneer mag het, welke regels gelden en wat zijn je rechten volgens de wet.',
      readTime: '',
      lastUpdated: '2025-06-01',
      views: 0,
      tags: ['filmen', 'privacy', 'rechten', 'artikel 184 sr', 'portretrecht', 'informatievrijheid'],
      featured: true,
      content: `## Kort antwoord

Ja, u mag in de openbare ruimte een politieagent filmen; de wet verbiedt dit niet. Alleen als uw opname de uitvoering van zijn taak belemmert, kan de agent u op grond van artikel 184 Sr een wettig bevel geven om te stoppen.

## Uitgebreide uitleg

### Wettelijke basis

Filmen in de openbare ruimte valt onder de informatievrijheid (artikel 10 EVRM) en de vrijheid van meningsuiting. U mag optredens van politie vastleggen zolang u de orde en veiligheid niet verstoort.

### artikel 184 Wetboek van Strafrecht (Sr)

**Tekst:**
"Hij die opzettelijk niet voldoet aan een bevel of vordering (...) krachtens wettelijk voorschrift gedaan door een ambtenaar (...) belet, belemmert of verijdelt, wordt gestraft met (...) gevangenisstraf (...) of geldboete."

Dit artikel ziet op het hinderen van een ambtenaar bij de uitoefening van zijn taak, niet op het filmen op gepaste afstand.

### Portretrecht

Het portretrecht (Auteurswet art. 19–21) staat het opnemen van ambtenaren in functie niet in de weg. Wel geldt: als u beelden publiceert met het doel iemands reputatie te schaden (bijvoorbeeld in een negatief artikel of via doxing), kan dit leiden tot civielrechtelijke claims (onrechtmatige daad) of strafrechtelijke vervolging voor belediging (bijv. artikel 261 Sr).

## Praktijkvoorbeeld

U filmt een aanhouding vanaf enkele meters afstand zonder de agent te hinderen. Dit is toegestaan. Publiceert u de beelden echter online met denigrerende of lasterlijke bijschriften, dan kan de agent u laten vervolgen voor bv belediging.

## Rechten en plichten van burgers

Burgers mogen filmen zolang zij:
1. op voldoende afstand blijven en de politie niet hinderen,
2. de opname zichtbaar en niet heimelijk maken,  
3. een wettig bevel om te stoppen of te vertrekken opvolgen,
4. de beelden niet gebruiken voor onrechtmatige of beledigende publicatie.

## Wat kunt u doen?

1. **Houd afstand** – film vanuit enkele meters zodat u de agent niet in de weg loopt.
2. **Volg bevelen op** – voorkomt eventuele strafrechtelijke gevolgen.
3. **Juridisch Loket** – gratis advies via juridischloket.nl.
4. **Nationale Ombudsman** – klacht indienen via nationaleombudsman.nl.

## Gerelateerde regelgeving

* artikel 10 EVRM – Informatievrijheid en vrijheid van meningsuiting
* artikel 184 Wetboek van Strafrecht (Sr) – Niet voldoen aan wettig bevel ambtenaar
* artikel 261 Wetboek van Strafrecht (Sr) – Belediging
* Auteurswet artikelen 19-21 – Portretrecht

Laatst gecheckt: juni 2025. Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor uw eigen situatie.`
    },
    {
      slug: 'persoonsgegevens-agent-legitimatie',
      title: 'Welke persoonsgegevens moet een agent mij geven als ik erom vraag?',
      description: '',
      category: 'Privacy & Informatie',
      categorySlug: 'privacy',
      seoTitle: 'Persoonsgegevens agent: wat moet hij mij geven?',
      seoDescription: 'Alles over identificatie van politieagenten: legitimatiebewijs, dienstnummer en wat wel/niet gedeeld moet worden.',
      readTime: '',
      lastUpdated: '2025-06-01',
      views: 0,
      tags: ['legitimatie', 'persoonsgegevens', 'dienstnummer', 'identificatie', 'ambtsinstructie'],
      featured: true,
      content: `## Kort antwoord

Een politieagent is verplicht op verzoek zijn politielegitimatiebewijs te tonen. Hierop staat een foto en een dienstnummer; de naam hoeft niet getoond of genoemd te worden.

## Uitgebreide uitleg

### Wat zegt de wet?

Volgens artikel 2 van de Ambtsinstructie moet elke politieambtenaar in functie een officieel legitimatiebewijs bij zich dragen. Dit legitimatiebewijs moet worden getoond als een burger daar om vraagt. De wet spreekt niet over het geven van naam of andere persoonsgegevens.

Op het legitimatiebewijs staan in ieder geval:
* een pasfoto van de agent,
* een dienstnummer.

De naam van de agent hoeft niet te worden vermeld of mondeling gedeeld. Dat is wettelijk niet verplicht.

### Wat is een dienstnummer?

Een dienstnummer is een uniek nummer waarmee een agent binnen de politieorganisatie geïdentificeerd kan worden. Dit nummer kan bestaan uit:

* drie letters (van het vroegere district) met een volgnummer, bijvoorbeeld "ABC12345",
* of een nieuw zescijferig nummer, bijvoorbeeld "123456".

Beide varianten zijn geldig.

### Waarom geen naam?

De wet beschermt politieambtenaren tegen persoonlijke benadering of risico's buiten werktijd. Daarom is het dienstnummer voldoende om een agent te kunnen identificeren binnen de organisatie. Burgers kunnen via dat nummer navraag doen of een klacht indienen.

## Praktijkvoorbeeld

U wordt op straat aangesproken door een persoon in burgerkleding die zegt van de politie te zijn. U vraagt om legitimatie. De persoon toont een legitimatiebewijs met foto en dienstnummer "456789". U heeft daarmee voldaan aan uw recht op inzage, en de agent aan zijn plicht tot legitimatie.

## Rechten en plichten van burgers

Als burger heeft u het recht om:
* te vragen om het politielegitimatiebewijs van een agent;
* het dienstnummer en de foto te zien;
* géén genoegen te nemen met een mondelinge uitleg zonder pas.

U heeft geen recht op de naam van de agent.

## Wat kunt u doen?

Twijfelt u aan het optreden van een agent of is legitimatie geweigerd? Dan kunt u:
* contact opnemen met de politie via 0900-8844 (vraag naar de dienstdoende teamchef of leidinggevende),
* een klacht indienen via www.politie.nl/klacht,
* advies vragen bij het Juridisch Loket via www.juridischloket.nl,
* of contact opnemen met de Nationale ombudsman als u vindt dat uw klacht onjuist is afgehandeld.

## Gerelateerde regelgeving

* artikel 2 Ambtsinstructie – Legitimatieplicht politieambtenaren
* Politiewet 2012 – Algemene bevoegdheden en plichten van de politie
* Wet politiegegevens – Bescherming persoonsgegevens politieambtenaren

Laatst gecheckt: juni 2025. Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor uw eigen situatie.`
    },
    {
      slug: 'stroomstootwapen-gebruik-politie',
      title: 'Wanneer mag de politie een stroomstootwapen gebruiken?',
      description: '',
      category: 'Geweld & Handhaving',
      categorySlug: 'geweld',
      seoTitle: 'Wanneer mag de politie een stroomstootwapen gebruiken?',
      seoDescription: 'Alles over stroomstootwapen gebruik door politie: wanneer toegestaan, regels uit Ambtsinstructie en wat je kunt doen.',
      readTime: '',
      lastUpdated: '2025-06-01',
      views: 0,
      tags: ['stroomstootwapen', 'taser', 'geweld', 'ambtsinstructie', 'artikel 12c', 'politiegeweld'],
      featured: true,
      content: `## Kort antwoord

De politie mag een stroomstootwapen gebruiken bij verzet of gevaarlijke situaties, zoals vlucht bij aanhouding of dreiging met geweld. Ze hoeven daarbij niet eerst andere geweldsmiddelen zoals pepperspray te gebruiken.

## Uitgebreide uitleg

### Wanneer mag de politie een stroomstootwapen inzetten?

**Duidelijke regels met ruime toepassing**

In artikel 12c van de Ambtsinstructie voor de politie staat precies omschreven wanneer een stroomstootwapen mag worden gebruikt. De voorwaarden zijn duidelijk, maar in de praktijk bieden ze relatief veel ruimte voor gebruik – vooral bij actief verzet of dreiging met geweld.

### Inzet in schietmodus (pijltjes op afstand)

De politie mag het stroomstootwapen in schietmodus gebruiken in de volgende situaties:

1. **Aanhouding van een gewapend persoon:** Als iemand een wapen gereed heeft om direct te gebruiken tegen een ander, of direct ander geweld dreigt te gebruiken.

2. **Bij verzet tegen aanhouding:** Als iemand zich verzet tegen een rechtmatige aanhouding of zich daaraan probeert te onttrekken.

3. **Tegen agressieve dieren:** Als een dier direct gevaar oplevert.

4. **Om ernstig letsel of levensgevaar af te wenden.**

Dit middel is bedoeld om snel en gericht in te grijpen bij gevaarlijke of onhoudbare situaties.

### Inzet in schokmodus (direct contact)

De schokmodus, waarbij het apparaat rechtstreeks op het lichaam wordt geplaatst, mag alleen worden gebruikt:

* tegen agressieve dieren, of
* om direct gevaar voor het leven of zwaar lichamelijk letsel te voorkomen.

### Geen verplichte volgorde van geweldsmiddelen

De politie hoeft niet eerst pepperspray, wapenstok of andere lichtere middelen te gebruiken. Ze mogen direct kiezen voor het stroomstootwapen als dat het meest geschikte middel is in de situatie. Wel gelden de algemene geweldsregels uit:

* artikel 7 Politiewet 2012, en
* artikel 7 Ambtsinstructie

Deze schrijven voor dat geweld altijd:
* noodzakelijk moet zijn (geen andere manier),
* proportioneel moet zijn (niet meer dan nodig), en  
* gericht moet worden ingezet.

### Waarschuwen is in principe verplicht

Volgens artikel 12d Ambtsinstructie moet de politie het gebruik van een stroomstootwapen altijd vooraf aankondigen, tenzij de situatie dat niet toelaat.

De waarschuwing bestaat uit:
* een duidelijke verbale aankondiging, zoals "Politie, stroomstootwapen!", en
* het zichtbaar richten van het rode richtpunt (laser) op de persoon.

Is er sprake van acuut gevaar of snelle escalatie, dan mag de waarschuwing worden overgeslagen.

## Praktijkvoorbeelden

### 1. Aanhouding met verzet

Een man is staande gehouden op verdenking van mishandeling. Tijdens de aanhouding begint hij te duwen, te schoppen en probeert hij te vluchten. Omdat hij zich actief verzet tegen een rechtmatige aanhouding en het risico op letsel toeneemt, mag de politie het stroomstootwapen in schietmodus gebruiken.

### 2. Dreigende houding en vechtpositie

Een persoon reageert agressief, schreeuwt bedreigingen en neemt een gevechtshouding aan tegenover agenten. Hij balt zijn vuisten en stapt op hen af. De politie mag het stroomstootwapen inzetten om het dreigende geweld direct te stoppen. Ze moeten het gebruik aankondigen, tenzij dat door de ernst van de situatie niet veilig is.

## Rechten van burgers

Als burger heb je bij het gebruik van een stroomstootwapen recht op:

* **Inzage in het geweldsrapport** dat is opgemaakt
* **Medische zorg**, als je letsel hebt opgelopen  
* **Uitleg** over de reden van geweldgebruik
* **Klacht indienen**, als je vindt dat het middel onterecht is ingezet

## Wat kun je doen?

* **Laat je medisch onderzoeken** als je bent geraakt door een stroomstootwapen.
* **Dien een klacht in** via politie.nl/klacht als je het optreden onterecht vindt.
* **Neem contact op** met het Juridisch Loket voor gratis advies.
* **Meld het incident** bij de Nationale Ombudsman als je er met de politie niet uitkomt.

## Gerelateerde regelgeving

* artikel 12c Ambtsinstructie – Gebruik stroomstootwapen
* artikel 12d Ambtsinstructie – Waarschuwingsplicht
* artikel 7 Politiewet 2012 – Algemene geweldsregels
* artikel 7 Ambtsinstructie – Proportionaliteit en noodzaak

Laatst gecheckt: juni 2025. Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'zorgmelding-politie-hulpverlening',
      title: 'De politie zegt dat ze een zorgmelding op gaan maken. Wat houdt dit in?',
      description: '',
      category: 'Privacy & Informatie',
      categorySlug: 'privacy',
      seoTitle: 'Zorgmelding politie: wat betekent dit en wat zijn je rechten?',
      seoDescription: 'Alles over zorgmeldingen door politie: wanneer ze worden gemaakt, welke gegevens gedeeld worden en wat je rechten zijn.',
      readTime: '',
      lastUpdated: '2025-06-01',
      views: 0,
      tags: ['zorgmelding', 'hulpverlening', 'GGD', 'GGZ', 'Veilig Thuis', 'persoonsgegevens', 'artikel 8 wet politiegegevens'],
      featured: true,
      content: `## Kort antwoord

Een zorgmelding betekent dat de politie zorgen over iemands veiligheid of gezondheid doorgeeft aan een hulpinstantie. Dit gebeurt bijvoorbeeld bij psychische problemen, verwaarlozing of gevaarlijk gedrag.

## Uitgebreide uitleg

### Wat is een zorgmelding?

Een **zorgmelding** is een melding die de politie doet bij een hulpverlenende organisatie als zij zich zorgen maakt over iemand. Het gaat dan om situaties waarin er (nog) geen strafbaar feit is, maar wel risico's voor de persoon zelf of de omgeving. De melding is bedoeld om hulpverlening op gang te brengen.

De melding wordt meestal gedaan aan organisaties zoals de GGD, GGZ, Veilig Thuis of het wijkteam van de gemeente.

### Wanneer doet de politie een zorgmelding?

De politie doet een zorgmelding als zij signalen ziet die duiden op:

* verward gedrag of psychische problemen;
* mogelijk huiselijk geweld of verwaarlozing;
* zelfverwaarlozing of gevaar voor eigen leven;
* zorgen over kinderen of gezinnen;
* terugkerende conflicten of overlast waarbij hulp nodig lijkt.

De politie maakt dan een registratie aan met informatie over wat zij hebben gezien of gehoord.

### Wat gebeurt er ná de zorgmelding?

De instantie die de melding ontvangt, beoordeelt of actie nodig is. Mogelijke vervolgstappen zijn:

* contact opnemen met de persoon of het gezin;
* inschakelen van hulpverleners;
* overleg met andere instanties (bijvoorbeeld het wijkteam);
* in ernstige gevallen: gedwongen hulp of opname (via de Wet verplichte ggz of Wet zorg en dwang).

De politie zelf is daarna meestal niet meer actief betrokken, tenzij er opnieuw incidenten zijn.

### Worden je gegevens gedeeld?

Ja. De politie mag in een zorgmelding persoonsgegevens vermelden, zoals:

* naam en adresgegevens;
* een omschrijving van de situatie;
* de aanleiding voor de melding.

Dat mag volgens **artikel 8 Wet politiegegevens**, als dit nodig is om schade aan personen te voorkomen. De ontvangende instantie moet zorgvuldig omgaan met deze gegevens en mag ze alleen gebruiken voor hulpverlening.

## Praktijkvoorbeeld

De politie treft een vrouw aan die verward over straat loopt en zegt dat ze niet meer verder wil leven. Ze heeft geen misdrijf gepleegd, maar de agenten maken zich zorgen. Ze brengen haar thuis en maken een zorgmelding bij de GGZ. Een dag later neemt een sociaalpsychiatrisch verpleegkundige contact op voor hulp.

## Rechten van burgers

Als burger heb je de volgende rechten:

* Je hoeft **geen toestemming** te geven voor een zorgmelding.
* Je mag **navragen** bij de politie of de instantie welke informatie is gemeld (dit hangt af van de situatie).
* Je mag **inzage vragen** in je gegevens via een verzoek op grond van de Wet politiegegevens.
* Je mag **klagen** of bezwaar maken als je vindt dat de melding onterecht is.

## Wat kun je doen?

* **Vraag de politie** om uitleg: waarom wordt de melding gedaan, aan wie, en met welke informatie?
* **Neem contact op** met de instantie die de melding ontvangt om uitleg of correctie te vragen.
* **Dien een klacht in** bij de politie via [www.politie.nl](https://www.politie.nl) als je het oneens bent met de melding.
* **Vraag juridisch advies** via [www.juridischloket.nl](https://www.juridischloket.nl).
* Bij zorgen over je privacy kun je terecht bij de **Autoriteit Persoonsgegevens**: [www.autoriteitpersoonsgegevens.nl](https://www.autoriteitpersoonsgegevens.nl).

## Gerelateerde regelgeving

* artikel 8 Wet politiegegevens – Verstrekking gegevens voor hulpverlening
* Wet verplichte ggz – Gedwongen opname bij psychische problemen  
* Wet zorg en dwang – Zorgdwang bij dementie
* Jeugdwet – Zorg voor minderjarigen
* Wet maatschappelijke ondersteuning – Hulp bij zelfredzaamheid

Laatst gecheckt: juni 2025. Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'bloedproef-weigering-rijden-onder-invloed',
      title: 'Ben je verplicht om mee te werken aan een bloedproef na verdenking van rijden onder invloed?',
      description: '',
      category: 'Verkeer',
      categorySlug: 'verkeer',
      seoTitle: 'Ben je verplicht om mee te werken aan een bloedproef na verdenking van rijden onder invloed?',
      seoDescription: 'Alles over bloedproef bij rijden onder invloed: verplichtingen, aanhouding, weigering en je rechten volgens artikel 163 Wegenverkeerswet.',
      readTime: '',
      lastUpdated: '2025-06-01',
      views: 0,
      tags: ['bloedproef', 'rijden onder invloed', 'artikel 163 wegenverkeerswet', 'speekseltest', 'aanhouding', 'drugs', 'alcohol'],
      featured: true,
      content: `## Kort antwoord

Ja, je bent verplicht mee te werken aan een bloedproef als je wordt verdacht van rijden onder invloed. Vaak word je daarbij ook aangehouden, zodat je rechten en plichten duidelijk zijn geregeld.

## Uitgebreide uitleg

### Bloedproef na verdenking: ben je verplicht mee te werken?

**Verdenking van rijden onder invloed**

Als de politie vermoedt dat je onder invloed van alcohol, drugs of medicijnen hebt gereden, mogen ze je laten testen. Bij drugs of medicijnen gebeurt dit meestal met een speekseltest. Als die positief is, of als testen niet lukt, kan een bloedproef volgen.

Het bevel tot bloedafname moet worden gegeven door een opsporingsambtenaar van ten minste de rang brigadier. Dit staat in **artikel 163 Wegenverkeerswet 1994**. Het is dus een formeel besluit binnen de regels van de wet.

### Waarom word je vaak aangehouden?

**Juridische bescherming en bevoegdheden**

In de praktijk word je bij een bloedproef meestal aangehouden. Dat is belangrijk, want aanhouding geeft jou én de politie duidelijke rechten en plichten.

Door de aanhouding:
* Heb je recht op bijstand van een advocaat.
* Mag je alleen onder voorwaarden worden vastgehouden.
* Wordt duidelijk dat het om een strafrechtelijk onderzoek gaat.
* Mag de politie je (onder voorwaarden) laten onderzoeken of vasthouden.
* Wordt het bevel tot bloedafname onderdeel van een strafproces.

De aanhouding vindt vaak plaats op grond van **artikel 61 Wetboek van Strafvordering**, omdat er een redelijk vermoeden is van een strafbaar feit. Na aanhouding word je meegenomen naar het politiebureau of een arts.

### Wat als je weigert?

**Weigeren is strafbaar**

Als je weigert mee te werken aan een bloedproef, is dat strafbaar. Je overtreedt dan **artikel 163 lid 6 Wegenverkeerswet 1994**. Zelfs als je niets hebt gebruikt, kan je straf krijgen voor de weigering alleen.

Je wordt dan ook als verdachte behandeld, en de politie kan:
* Je aanhouden of vasthouden.
* Je alsnog verplichten tot bloedafname via een arts.
* Een proces-verbaal opmaken voor weigering.

Fysiek verzet tegen bloedafname kan leiden tot extra strafbare feiten, zoals wederspannigheid (**artikel 180 Wetboek van Strafrecht (Sr)**).

## Praktijkvoorbeeld

Je rijdt 's avonds en wordt staande gehouden na een melding. De politie ziet dat je wankel loopt en traag reageert. Een speekseltest mislukt, en de hulpofficier geeft het bevel voor een bloedproef. Je wordt aangehouden, naar het bureau gebracht, en een arts neemt bloed af. Omdat je bent aangehouden, heb je recht op een advocaat. De uitslag blijkt positief op drugs. Je krijgt een proces-verbaal en mogelijk een rijontzegging.

### Wat zijn je rechten bij aanhouding?

Bij aanhouding in het kader van een bloedproef heb je recht op:
* Duidelijke uitleg over de verdenking en het bevel.
* Bijstand van een advocaat, meestal via de piketdienst.
* Informatie over hoe lang je mag worden vastgehouden.
* Inzage in het bloedonderzoeksrapport.
* Klachtmogelijkheden bij onjuist optreden van de politie.

## Wat kun je doen?

* **Werk altijd mee** aan een bloedproef als daarom wordt gevraagd.
* **Vraag uitleg** over het bevel en de aanhouding.
* **Neem bij twijfel** contact op met een advocaat of het Juridisch Loket.
* **Wil je achteraf klagen?** Dien dan een klacht in via het klachtenloket politie.

## Gerelateerde regelgeving

* artikel 163 Wegenverkeerswet 1994 – Bevel tot bloedafname
* artikel 61 Wetboek van Strafvordering – Aanhouding bij verdenking
* artikel 180 Wetboek van Strafrecht (Sr) – Wederspannigheid
* Opiumwet – Strafbare feiten betreffende drugs
* Wegenverkeerswet 1994 – Rijden onder invloed

Laatst gecheckt: juni 2025. Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'vingerafdrukken-afnemen-aanhouding',
      title: 'Ben ik verplicht mijn vingerafdruk af te staan nadat ik door de politie ben aangehouden?',
      description: '',
      category: 'Identificatie & Fouilleren',
      categorySlug: 'id-fouilleren',
      seoTitle: 'Ben ik verplicht mijn vingerafdruk af te staan nadat ik door de politie ben aangehouden?',
      seoDescription: 'Complete gids over vingerafdrukken na aanhouding: wanneer verplicht, artikel 55c Wetboek van Strafvordering, bewaartermijnen en je rechten.',
      readTime: '',
      lastUpdated: '2025-06-01',
      views: 0,
      tags: ['vingerafdrukken', 'aanhouding', 'artikel 55c Sv', 'identificatie', 'wet politiegegevens', 'bewaartermijn', 'persoonsgegevens'],
      featured: true,
      content: `## Kort antwoord

Ja, de politie mag na een aanhouding je vingerafdrukken afnemen om je identiteit vast te stellen of te controleren of je voorkomt in politie- of justitiesystemen. Je bent wettelijk verplicht hieraan mee te werken.

## Uitgebreide uitleg

### Wanneer mag de politie vingerafdrukken afnemen?

De politie mag vingerafdrukken afnemen als je bent aangehouden op verdenking van een strafbaar feit. Dit is geregeld in **artikel 55c van het Wetboek van Strafvordering**. De afname is toegestaan wanneer:

* je je identiteit niet kunt of wilt aantonen;
* er aanwijzingen zijn dat je een valse identiteit gebruikt;
* je wordt verdacht van een strafbaar feit waarvoor voorlopige hechtenis is toegestaan (zoals diefstal, mishandeling of zwaardere delicten).

De afdrukken mogen worden gebruikt om je identiteit vast te stellen, om te controleren of je voorkomt in het systeem, en om sporen op plaatsen delict te vergelijken.

### Ben ik verplicht om mee te werken?

Ja, je bent wettelijk verplicht om mee te werken aan het afnemen van vingerafdrukken. Weigeren is niet toegestaan. Als je niet vrijwillig meewerkt, mag de politie dwang toepassen om de afdrukken toch af te nemen. Dit valt binnen hun bevoegdheid.

### Wat gebeurt er met mijn vingerafdrukken?

De politie bewaart je vingerafdrukken volgens de regels van de **Wet politiegegevens**. Hoe lang ze bewaard worden, hangt af van wat er verder gebeurt in je strafzaak:

* **Geen vervolging of vrijspraak**: de gegevens moeten binnen drie maanden worden verwijderd.
* **Veroordeling**: de bewaartermijn is afhankelijk van de ernst van het strafbaar feit. Voor ernstige misdrijven kan dit tot 20 jaar zijn.

Je vingerafdrukken kunnen worden opgenomen in een databank en vergeleken worden met sporen van andere zaken, zolang de bewaartermijn loopt.

## Praktijkvoorbeeld

Je wordt op straat aangehouden omdat je verdacht wordt van een poging tot inbraak. Je hebt geen identiteitsbewijs bij je. De politie mag dan je vingerafdrukken nemen om te controleren wie je bent en of je al eerder met de politie in aanraking bent geweest. Ook kunnen ze controleren of jouw afdrukken overeenkomen met sporen die eerder zijn gevonden bij andere inbraken.

### Wat zijn je rechten?

Als verdachte heb je ook rechten, zoals:
* het recht om een advocaat te spreken, zeker als je ook wordt verhoord;
* het recht op inzage in je persoonsgegevens, waaronder vingerafdrukken, via een inzageverzoek bij de politie.

## Wat kun je doen?

* **Heb je klachten** over de wijze van afname of verwerking van je vingerafdrukken? Dien dan een klacht in bij de politie of bij de Nationale Ombudsman via [www.nationaleombudsman.nl](https://www.nationaleombudsman.nl).
* **Wil je weten** welke gegevens over jou zijn vastgelegd? Je kunt een inzageverzoek doen via [www.politie.nl](https://www.politie.nl).
* **Heb je juridisch advies** nodig? Neem dan contact op met het Juridisch Loket of je advocaat.

## Gerelateerde regelgeving

* artikel 55c Wetboek van Strafvordering – Afname vingerafdrukken
* Wet politiegegevens – Verwerking en bewaring van politiegegevens
* artikel 61 Wetboek van Strafvordering – Aanhouding van verdachten
* Wet op de identificatieplicht – Identificatieverplichtingen
* AVG (Algemene Verordening Gegevensbescherming) – Bescherming persoonsgegevens

Laatst gecheckt: juni 2025. Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'woning-betreden-verdachte',
      title: 'Wanneer mag de politie een woning betreden van een verdachte?',
      description: '',
      category: 'Opsporing & Aanhouding',
      categorySlug: 'opsporing',
      seoTitle: 'Wanneer mag de politie een woning betreden van een verdachte?',
      seoDescription: 'Alles over het betreden van woningen door politie: toestemming, machtiging, noodsituaties, Algemene wet binnentreden en je rechten als burger.',
      readTime: '',
      lastUpdated: '2025-06-01',
      views: 0,
      tags: ['woning betreden', 'algemene wet binnentreden', 'artikel 3 politiewet', 'machtiging', 'huisrecht', 'noodsituatie'],
      featured: true,
      content: `## Kort antwoord

De politie mag een woning betreden met toestemming van de bewoner of met een machtiging van een (hulp)officier van justitie. Alleen bij een acute noodsituatie – zoals levensgevaar – mag dit ook zonder toestemming of machtiging, op basis van artikel 3 Politiewet 2012; strafrechtelijk optreden mag dan volgen, maar mag niet het doel van het binnengaan zijn.

## Wettelijke regels voor binnentreden van een woning

Woningen zijn grondwettelijk beschermd (**artikel 12 Grondwet**). Binnentreden zonder toestemming is alleen toegestaan op basis van een wettelijk vastgelegde bevoegdheid. Die zijn te vinden in:

* De **Algemene wet op het binnentreden (Awbi)**
* Het **Wetboek van Strafvordering (Sv)**
* De **Politiewet 2012**
* Eventueel in bijzondere wetten (zoals de Opiumwet of de Wet publieke gezondheid)

### 1. Met toestemming van de bewoner

De politie mag de woning binnengaan als een meerderjarige bewoner uitdrukkelijk toestemming geeft, vrijwillig en zonder druk. Dit is geregeld in **artikel 1 lid 2 Awbi**.

### 2. Met machtiging tot binnentreden

Zonder toestemming is een schriftelijke machtiging tot binnentreden nodig van een (hulp)officier van justitie, op basis van **artikel 2 Algemene wet op het binnentreden (Awbi)**. Dit is bijvoorbeeld vereist bij:

* Aanhouding in een woning,
* Inbeslagnames,
* Observatie of opsporing.

Voorafgaand aan het binnentreden moet de machtiging worden getoond en moet de ambtenaar zich legitimeren (**artikel 1 lid 1 Awbi**).

### 3. In acute noodsituaties – artikel 3 Politiewet 2012

De enige uitzondering waarbij binnentreden zonder toestemming én zonder machtiging is toegestaan, is bij directe hulpverlening aan personen in nood, op grond van **artikel 3 Politiewet 2012**.

**Voorwaarden:**

* Er is sprake van direct en ernstig gevaar voor leven of gezondheid.
* De politie treedt binnen uitsluitend om hulp te verlenen (bijvoorbeeld bij mishandeling, reanimatie of zelfbeschadiging).
* Strafrechtelijk optreden (zoals aanhouding of bewijs veiligstellen) mag pas daarna, en mag niet de reden zijn voor het binnengaan.

**Wat mag wel en niet?**

* **Wel toegestaan**: woning binnengaan om iemand van mishandeling te redden, en als de situatie veilig is, de verdachte aanhouden.
* **Niet toegestaan**: woning binnengaan zonder machtiging, alleen om iemand aan te houden of bewijs te zoeken, onder het mom van "hulpverlening".

Deze beperking voorkomt misbruik van artikel 3 Politiewet als verkapte opsporingsbevoegdheid.

## Praktijkvoorbeeld

Agenten krijgen een melding dat iemand ernstig wordt mishandeld in een woning. Ze horen geschreeuw en zien geweld door het raam. Ze treden binnen op grond van artikel 3 Politiewet 2012 om het slachtoffer te beschermen. Nadat de situatie is gestabiliseerd, houden ze de dader aan en leggen verklaringen vast.

Dit is rechtmatig, omdat de eerste handeling gericht was op hulpverlening. Strafrechtelijk optreden volgt daar logisch op.

Zouden ze echter zonder machtiging naar binnen zijn gegaan puur om de verdachte aan te houden, dan zou dat onrechtmatig zijn.

## Rechten van burgers

* Je hebt recht op bescherming van je woning: binnentreden mag alleen met een geldige wettelijke grond.
* Je mag vragen naar legitimatie en een machtiging als agenten je woning willen betreden.
* Als het binnentreden onterecht was, kun je hiertegen in bezwaar of klacht indienen.

## Wat kun je doen?

* Vraag bij twijfel advies bij het **Juridisch Loket** via [www.juridischloket.nl](https://www.juridischloket.nl).
* Je kunt een klacht indienen bij de politie of bij de **Nationale Ombudsman**.
* In ernstige gevallen (bijvoorbeeld schade of schending van rechten) kun je een advocaat inschakelen en eventueel een civiele procedure starten.

## Gerelateerde regelgeving

* artikel 12 Grondwet – Onaantastbaarheid van de woning
* Algemene wet op het binnentreden – Voorwaarden voor binnentreden
* artikel 3 Politiewet 2012 – Hulpverlening in noodsituaties
* Wetboek van Strafvordering – Opsporingsbevoegdheden
* artikel 1 lid 1 en 2 Awbi – Legitimatie en toestemming

Laatst gecheckt: juni 2025. Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'klacht-politiegeweld-buitensporig',
      title: 'Wat kun je doen als je vindt dat de politie buitensporig geweld heeft gebruikt bij een aanhouding?',
      description: '',
      category: 'Klacht & Bezwaar',
      categorySlug: 'klacht',
      seoTitle: 'Wat kun je doen als je vindt dat de politie buitensporig geweld heeft gebruikt?',
      seoDescription: 'Stap-voor-stap uitleg over klachten tegen politiegeweld: klachtprocedure, aangifte mishandeling, Nationale Ombudsman en schadevergoeding.',
      readTime: '',
      lastUpdated: '2025-06-01',
      views: 0,
      tags: ['politiegeweld', 'klacht politie', 'artikel 61 politiewet', 'aangifte mishandeling', 'nationale ombudsman', 'schadevergoeding'],
      featured: true,
      content: `## Kort antwoord

Als je denkt dat de politie buitensporig geweld heeft gebruikt bij een aanhouding, kun je een klacht indienen bij de politie of aangifte doen van mishandeling. Ook kun je een letselschadeprocedure starten of melding maken bij de Nationale ombudsman.

## Wat betekent buitensporig geweld?

De politie mag alleen geweld gebruiken als het noodzakelijk en proportioneel is. Dat staat in **artikel 7 Politiewet 2012** en **artikel 1 t/m 12f Ambtsinstructie voor de politie**. Geweld moet dus in verhouding staan tot het doel (proportioneel), en er moet geen minder ingrijpende manier zijn (subsidiariteit). Elk gebruik van geweld moet achteraf worden gemeld, beoordeeld en vastgelegd.

Als je vindt dat die grenzen zijn overschreden – bijvoorbeeld als je onnodig geslagen bent terwijl je je al had overgegeven – dan kun je actie ondernemen.

### Hoe wordt politiegeweld beoordeeld?

Bij elk geweldsgebruik moet de politie zelf rapporteren wat er is gebeurd. Een leidinggevende beoordeelt of het geweld rechtmatig was. Dat gebeurt aan de hand van:

* de regels uit de Ambtsinstructie,
* camerabeelden (bijv. bodycam, beveiliging),
* verklaringen van betrokkenen.

Als iemand daartegen bezwaar heeft, zijn er verschillende mogelijkheden.

## Mogelijkheden om in actie te komen

### 1. Dien een klacht in bij de politie

Je kunt een klacht indienen op basis van **artikel 61 Politiewet 2012**. De klacht wordt eerst intern behandeld door de politie. Als je het niet eens bent met het resultaat, kun je vragen of de klacht wordt beoordeeld door een onafhankelijke klachtencommissie.

Klachten kunnen gaan over gedrag, bejegening of inzet van geweld.

**Hoe dien je een klacht in?**

* Via [politie.nl](https://www.politie.nl)
* Schriftelijk per post
* Of aan de balie van een politiebureau

### 2. Doe aangifte van mishandeling

Als het geweld echt buiten proportie was, kun je ook aangifte doen van een strafbaar feit, bijvoorbeeld mishandeling. Dat kan bij elk politiebureau. De aangifte wordt dan strafrechtelijk onderzocht, eventueel door de Rijksrecherche als het ernstig is.

De **Rijksrecherche** onderzoekt politiegeweld in ernstige gevallen, bijvoorbeeld als iemand zwaar gewond is geraakt of is overleden.

### 3. Meld je bij de Nationale ombudsman

Als je het gevoel hebt dat je klacht niet serieus wordt genomen of onpartijdig is afgehandeld, kun je terecht bij de **Nationale ombudsman**. Die kan onderzoek doen naar hoe de politie jouw klacht heeft behandeld.

Zie: [www.nationaleombudsman.nl](https://www.nationaleombudsman.nl)

### 4. Start een letselschadeprocedure

Als je gewond bent geraakt door het geweld, kun je ook civiel rechtelijk een schadevergoeding eisen van de politie. Daarvoor kun je het beste een letselschadeadvocaat inschakelen.

## Concreet praktijkvoorbeeld

Je wordt aangehouden op straat omdat je wordt verdacht van diefstal. Je werkt mee, maar een agent slaat je meerdere keren hard met een wapenstok, terwijl je op de grond ligt en al geboeid bent. Je loopt blauwe plekken en een gebroken rib op.

In dat geval kun je:

* aangifte doen van mishandeling,
* klacht indienen bij de politie over de inzet van geweld,
* en/of schadevergoeding eisen voor je verwondingen.

## Rechten en plichten van burgers

Als burger mag je de inzet van geweld altijd laten toetsen. Je hebt het recht om:

* een klacht in te dienen over politieoptreden;
* aangifte te doen van strafbaar politiegedrag;
* bewijs te verzamelen (zoals medische verklaringen of getuigenissen);
* juridische hulp in te schakelen.

**Let op**: je bent verplicht om aanwijzingen van de politie op te volgen, maar je mag wel achteraf bezwaar maken of een klacht indienen. Het is dus niet verstandig om ter plekke te weigeren of fysiek te reageren.

## Wat kun je doen?

* **Verzamel bewijs**: maak foto's van letsel, zoek getuigen, bewaar medische stukken.
* **Dien een klacht in** via [politie.nl](https://www.politie.nl) of op het bureau.
* **Doe aangifte** bij het politiebureau (je mag aangeven dat het om politiegeweld gaat).
* **Neem contact op** met het **Juridisch Loket** voor gratis juridisch advies: [www.juridischloket.nl](https://www.juridischloket.nl)
* **Overweeg een melding** bij de **Nationale ombudsman** als je klacht niet goed is afgehandeld.

## Gerelateerde regelgeving

* artikel 7 Politiewet 2012 – Geweldsgebruik door politie
* artikel 1 t/m 12f Ambtsinstructie voor de politie – Regels geweldsgebruik
* artikel 61 Politiewet 2012 – Klachtrecht
* Wetboek van Strafrecht – Mishandeling door ambtenaren
* Burgerlijk Wetboek – Onrechtmatige daad en schadevergoeding

Laatst gecheckt: juni 2025. Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'telecom-gegevens-opvragen-politie',
      title: 'Mag de politie telefoon- en internetgegevens opvragen bij telecomproviders zonder tussenkomst van de officier van justitie?',
      description: '',
      category: 'Privacy & Informatie',
      categorySlug: 'privacy',
      seoTitle: 'Mag de politie telefoon- en internetgegevens opvragen zonder officier van justitie?',
      seoDescription: 'Alles over opvragen telecomgegevens: artikel 126nc Wetboek van Strafvordering (Sv), identificerende gegevens, verkeersgegevens, rechten en wanneer rechterlijke toestemming nodig is.',
      readTime: '',
      lastUpdated: '2025-06-01',
      views: 0,
      tags: ['telecomgegevens', 'artikel 126nc sv', 'identificerende gegevens', 'verkeersgegevens', 'rechter-commissaris', 'privacy'],
      featured: true,
      content: `## Kort antwoord

Ja, de politie mag bepaalde beperkte gegevens direct opvragen bij telecomproviders zonder toestemming van de officier van justitie. Dit geldt alleen voor zogenoemde identificerende gegevens, zoals op basis van artikel 126nc Wetboek van Strafvordering.

## Welke gegevens mag de politie opvragen zonder tussenkomst van de officier van justitie?

De wet maakt onderscheid tussen verschillende soorten gegevens. Sommige gegevens mag de politie zelfstandig vorderen, andere alleen met toestemming van de officier van justitie of zelfs de rechter-commissaris. De minst ingrijpende categorie zijn de identificerende gegevens.

### 1. Identificerende gegevens – zonder tussenkomst OVJ

Op basis van **artikel 126nc Wetboek van Strafvordering** (en het vergelijkbare artikel 126uc voor onderzoeken naar bepaalde misdrijven zoals terrorisme), mag een bevoegd opsporingsambtenaar zelfstandig gegevens vorderen die noodzakelijk zijn om een persoon te identificeren. Dit kan bij een redelijk vermoeden van een strafbaar feit.

**Voorbeelden:**

* Naam, adres en woonplaats (NAW-gegevens)
* Gebruikersnaam of klantnummer
* Telefoonnummer of e-mailadres
* IP-adres dat hoort bij een gebruiker

Dit betekent dat de politie in dit soort gevallen geen toestemming van een officier van justitie nodig heeft. Wel moet de vordering schriftelijk zijn en gericht op een concreet onderzoek.

### 2. Verkeers- en locatiegegevens – mét toestemming OVJ

Zodra de politie meer wil dan alleen identificerende informatie, bijvoorbeeld:

* wanneer iemand belde,
* met wie,
* hoelang een verbinding duurde,
* of waar iemand was,

dan is toestemming van de officier van justitie nodig. Dit staat geregeld in **artikel 126n Wetboek van Strafvordering**.

### 3. Inhoud van communicatie – alleen met rechterlijke machtiging

Bij gegevens over de inhoud van communicatie (zoals telefoongesprekken, e-mails, berichten), moet de officier van justitie eerst een machtiging vragen aan de rechter-commissaris. Zonder die toestemming mag dit niet. Dit valt onder **artikel 126m lid 5 Wetboek van Strafvordering**.

## Praktijkvoorbeeld

Stel: iemand plaatst anonieme haatberichten via een forum. De politie wil weten wie dit doet.

* Ze vorderen op basis van artikel 126nc Wetboek van Strafvordering (Sv) bij de forumbeheerder het IP-adres dat gebruikt is. Hiervoor is geen officier van justitie nodig.
* Daarna vragen ze aan de internetprovider welk account bij dat IP-adres hoort. Ook dat mag op basis van artikel 126nc Wetboek van Strafvordering (Sv), zonder tussenkomst van de OVJ.
* Als ze willen weten waar die persoon zich op dat moment bevond, is dat een locatiegegeven. Daarvoor is wel toestemming van de officier van justitie nodig (artikel 126n Sv).
* Willen ze toekomstige communicatie meelezen? Dan moet de rechter-commissaris dit goedkeuren (artikel 126m lid 5 Sv).

## Wat zijn je rechten als burger?

De politie mag alleen gegevens opvragen als er een concreet strafrechtelijk onderzoek loopt en aan de voorwaarden is voldaan. Als burger heb je daarbij de volgende rechten:

* **Recht op informatie en inzage**: Je mag weten of jouw gegevens door de politie zijn verwerkt (tenzij het onderzoek dat verhindert).
* **Recht op correctie**: Onjuiste gegevens kun je laten aanpassen.
* **Recht op bezwaar of klacht**: Je kunt bezwaar maken tegen het opvragen of gebruiken van je gegevens.

Deze rechten zijn geregeld in de **Wet politiegegevens (Wpg)** en de **AVG**.

## Wat kun je doen?

* **Vraag inzage aan** bij de politie: Ga naar [politie.nl/privacyrechten](https://www.politie.nl/privacyrechten) om te zien of jouw gegevens zijn opgevraagd.
* **Dien een klacht in** bij de politie of **Nationale Ombudsman**: Als je vermoedt dat jouw gegevens onterecht zijn opgevraagd.
* **Dien een melding in** bij de **Autoriteit Persoonsgegevens**: Als je denkt dat jouw privacyrechten zijn geschonden.
* **Zoek juridisch advies**: Bijvoorbeeld via het **Juridisch Loket** of een gespecialiseerde advocaat.

## Gerelateerde regelgeving

* artikel 126nc Wetboek van Strafvordering – Identificerende gegevens
* artikel 126n Wetboek van Strafvordering – Verkeers- en locatiegegevens
* artikel 126m lid 5 Wetboek van Strafvordering – Inhoud communicatie
* Wet politiegegevens – Verwerking politiegegevens
* AVG – Algemene Verordening Gegevensbescherming
* artikel 126uc Wetboek van Strafvordering – Bijzondere onderzoeken

Laatst gecheckt: juni 2025. Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'boete-zonder-staandehouding-mulder',
      title: 'Kan een agent een boete geven zonder dat je bent staande gehouden, en hoe zit dat bij Mulder-feiten zoals inhalen bij een doorgetrokken streep?',
      description: '',
      category: 'Verkeer',
      categorySlug: 'verkeer',
      seoTitle: 'Boete zonder staandehouding: wanneer mag dat bij Mulder-feiten?',
      seoDescription: 'Uitleg over wanneer politie boetes mag geven zonder staandehouding, Mulder-feiten, Wahv-wetgeving en je rechten als kentekenhouder.',
      readTime: '',
      lastUpdated: '2025-01-17',
      views: 0,
      tags: ['mulder-feiten', 'staandehouding', 'wahv', 'boete', 'kenteken', 'doorgetrokken streep'],
      featured: true,
      content: `## Kort antwoord

In principe moet een agent je staande houden om een boete te geven, zodat je weet waarvoor je wordt aangesproken. Alleen bij specifieke uitzonderingen, zoals Mulder-feiten (bijvoorbeeld inhalen bij een doorgetrokken streep), mag een boete ook zonder staandehouding worden opgelegd, op basis van kenteken.

## Staandehouding is in principe verplicht

De hoofdregel is dat een politieagent iemand staande houdt voordat hij een boete oplegt. Dit staat in **artikel 52 Wetboek van Strafvordering (Sv)**. De staandehouding is bedoeld om:

* je identiteit vast te stellen
* je te informeren over de overtreding
* eventueel je kant van het verhaal te horen

Zonder staandehouding is er vaak geen geldige koppeling tussen het feit en een verdachte persoon. Daarom is het in de meeste gevallen een noodzakelijke stap in de afhandeling van strafbare feiten.

## Uitzondering: geen staandehouding bij Mulder-feiten

Op deze hoofdregel bestaat een wettelijk vastgelegde uitzondering: de zogenaamde **Mulder-feiten**. Dit zijn lichte verkeersovertredingen die vallen onder de **Wet administratiefrechtelijke handhaving verkeersvoorschriften (Wahv)**.

Bij deze feiten mag de boete worden opgelegd op basis van het kenteken, zonder dat de bestuurder zelf is aangesproken of staande is gehouden. Dit mag alleen als:

* het feit objectief en duidelijk vaststaat (bijvoorbeeld waargenomen door een agent of met camera);
* de overtreding valt onder de Wahv (zoals inhalen bij een doorgetrokken streep);
* het voertuig geïdentificeerd kan worden via kenteken.

De boete wordt dan gestuurd aan de kentekenhouder, die verantwoordelijk is tenzij anders bewezen.

## Voorbeeld: inhalen bij een doorgetrokken streep

Inhalen bij een doorgetrokken streep is een Mulder-feit. Stel: een agent ziet vanuit een surveillancevoertuig een auto een andere auto inhalen waar dat niet mag, maar kan de auto niet staande houden door verkeersdrukte of veiligheid.

De agent noteert het kenteken en meldt het feit. Ook wordt de reden genoteerd waarom er geen staandehouding heeft plaatsgevonden. De boete wordt vervolgens via het CJIB naar de kentekenhouder gestuurd. Dit mag, ook al is er geen staandehouding geweest.

## Wanneer is staandehouding echt nodig?

Voor feiten die niet onder de Wahv vallen – zoals rijden onder invloed, gevaarlijk rijgedrag of rijden zonder rijbewijs – is een persoonlijke identificatie noodzakelijk. Zonder staandehouding is het dan meestal niet mogelijk om iemand te beboeten, tenzij er andere bewijsmiddelen zijn én de persoon alsnog duidelijk in beeld komt als verdachte.

## Belang van onderscheid

Het onderscheid is dus:

* **Mulder-feiten (Wahv)**: mogen zonder staandehouding op kenteken, omdat de wet dat toestaat.
* **Strafrechtelijke feiten**: vereisen in beginsel een verdachte persoon, dus ook een staandehouding of ander middel om de identiteit vast te stellen.

Een boete zonder staandehouding is alleen toegestaan als de wet dat nadrukkelijk mogelijk maakt – zoals bij de Wahv – of als er dwingende omstandigheden zijn waardoor staandehouding onmogelijk was, én de identiteit van de overtreder alsnog vaststaat.

## Wat kun je doen als je zo'n boete krijgt?

Ontvang je een boete zonder dat je bent staande gehouden?

1. **Controleer of het een Mulder-feit is** (zoals inhalen bij een doorgetrokken streep).
2. **Vraag zo nodig het proces-verbaal op** via het CJIB of politie.
3. **Maak bezwaar bij de officier van justitie** als je het niet eens bent – doe dit binnen 6 weken.
4. **Neem contact op met Het Juridisch Loket** voor gratis juridisch advies.

Let op: bij Mulder-feiten ben je als kentekenhouder aansprakelijk, tenzij je overtuigend aantoont dat je het voertuig niet bestuurde op dat moment.

## Gerelateerde regelgeving

* artikel 52 Wetboek van Strafvordering – Staandehouding verdachte
* Wet administratiefrechtelijke handhaving verkeersvoorschriften (Wahv) – Mulder-feiten
* artikel 1 Besluit administratiefrechtelijke handhaving verkeersvoorschriften – Lijst Wahv-feiten
* Wegenverkeerswet 1994 – Verkeersvoorschriften

Laatst gecheckt: januari 2025. Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'verlopen-rijbewijs-rijden',
      title: 'Mag je met een verlopen rijbewijs rijden?',
      description: '',
      category: 'Verkeer',
      categorySlug: 'verkeer',
      seoTitle: 'Mag je rijden met een verlopen rijbewijs?',
      seoDescription: 'Alles over rijden met verlopen rijbewijs: wettelijke gevolgen, boetes, verzekeringsproblemen en hoe je je rijbewijs kunt verlengen.',
      readTime: '',
      lastUpdated: '2025-01-17',
      views: 0,
      tags: ['verlopen rijbewijs', 'wegenverkeerswet', 'rijbevoegdheid', 'verzekering', 'cbr'],
      featured: true,
      content: `## Kort antwoord

Nee, rijden met een verlopen rijbewijs is verboden. Je bent dan niet langer bevoegd om een motorvoertuig te besturen en riskeert een boete én verdere gevolgen.

## Rijden met een verlopen rijbewijs: hoe zit het?

### Wat zegt de wet?

Volgens **artikel 107 Wegenverkeerswet 1994** moet je een geldig rijbewijs hebben om een motorrijtuig te mogen besturen. Zodra de geldigheidsduur van je rijbewijs is verlopen, ben je wettelijk niet langer bevoegd om te rijden. Het maakt daarbij niet uit hoe lang je rijbewijs al verlopen is.

De geldigheidsduur van een rijbewijs staat vermeld op het document zelf. Voor de meeste mensen is dat 10 jaar, maar voor ouderen of mensen met een medische indicatie kan dit korter zijn.

### Wat zijn de gevolgen?

Rijd je toch met een verlopen rijbewijs, dan gelden de volgende regels:

* Je begaat een strafbaar feit (overtreding).
* Je kunt een boete krijgen.
* **Je bent niet verzekerd bij een ongeluk** – je verzekeraar mag de schade weigeren te vergoeden.
* De politie kan je staande houden en eventueel verbieden om verder te rijden.

Let op: een verlopen rijbewijs is niet hetzelfde als een ongeldig verklaard rijbewijs (bijvoorbeeld na alcoholgebruik). Bij een verlopen rijbewijs ben je "je bevoegdheid verloren"; bij ongeldigverklaring is het document niet meer rechtsgeldig vanwege een sanctie.

## Praktijkvoorbeeld

Je rijbewijs is op 1 juni verlopen, maar je hebt het nog niet verlengd. Op 15 juni wordt je staande gehouden bij een verkeerscontrole. De agent controleert je gegevens en ziet dat je rijbewijs is verlopen. Je krijgt dan een bekeuring voor het rijden zonder geldig rijbewijs. Afhankelijk van de situatie mag je daarna niet verder rijden. Als je toch doorrijdt, riskeer je extra straf.

## Rechten en plichten van burgers

### Als je rijbewijs verloopt:

* **Je hebt de plicht** het rijbewijs tijdig te verlengen via je gemeente.
* **Je hebt geen recht** om in de tussentijd door te rijden, ook niet als je "nog weet hoe het moet".
* **Je hebt wél het recht** om een nieuw rijbewijs aan te vragen, mits je aan de eisen voldoet (zoals een medische keuring bij bepaalde leeftijden of categorieën).

## Wat kun je doen?

* **Rijbewijs verlopen?** Maak direct een afspraak bij je gemeente om het te vernieuwen. Doe dit online of telefonisch.
* **Is je rijbewijs kort geleden verlopen (maximaal 5 jaar)?** Dan kun je meestal zonder opnieuw examen te doen verlengen.
* **Moet je nog rijden (bijvoorbeeld voor werk)?** Regel vervangend vervoer totdat je rijbewijs weer geldig is.
* **Heb je medische vragen over verlengen?** Raadpleeg het CBR of je arts.

### Voor hulp of vragen kun je terecht bij:

* **Rijksoverheid** – Rijbewijs verlopen
* **RDW.nl** – Rijbewijs verlengen
* Of bel je gemeente voor een afspraak of uitleg.

## Gerelateerde regelgeving

* artikel 107 Wegenverkeerswet 1994 – Rijbevoegdheid
* Regeling rijbewijzen – Geldigheidsduur rijbewijzen
* artikel 123 lid 1 Wegenverkeerswet 1994 – Strafbaarstelling rijden zonder geldig rijbewijs
* Wet aansprakelijkheidsverzekering motorrijtuigen – Verzekeringsdekking

Laatst gecheckt: januari 2025. Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'wok-melding-betekenis',
      title: 'Wat is een WOK-melding?',
      description: '',
      category: 'Verkeer',
      categorySlug: 'verkeer',
      seoTitle: 'Wat is een WOK-melding? Uitleg Wacht Op Keuren status',
      seoDescription: 'Alles over WOK-meldingen: wanneer wordt deze afgegeven, wat zijn de gevolgen, hoe kom je er vanaf en wat zijn je rechten als eigenaar.',
      readTime: '',
      lastUpdated: '2025-01-17',
      views: 0,
      tags: ['wok-melding', 'wacht op keuren', 'rdw', 'voertuigkeuring', 'kenteken'],
      featured: true,
      content: `## Kort antwoord

Een WOK-melding betekent dat een voertuig niet op de openbare weg mag rijden totdat het is goedgekeurd door de RDW. Deze melding wordt geregistreerd als het voertuig niet aan de wettelijke eisen voldoet, bijvoorbeeld na schade of een controle.

## Wat is een WOK-melding?

Een **WOK-melding** staat voor **Wacht Op Keuren**. Het is een officiële aantekening bij het kenteken van een voertuig die aangeeft dat het voertuig op dat moment niet voldoet aan de eisen voor toelating tot het verkeer. De melding wordt opgenomen in het kentekenregister van de RDW (Rijksdienst voor het Wegverkeer).

Zolang deze melding actief is, **mag het voertuig niet op de openbare weg rijden**. Pas nadat de RDW het voertuig opnieuw heeft goedgekeurd, vervalt de WOK-status.

## Wanneer wordt een WOK-melding afgegeven?

Een WOK-melding kan worden afgegeven in verschillende situaties:

* Als een voertuig zwaar beschadigd is, bijvoorbeeld na een ongeval, waardoor de veiligheid of constructie niet meer is gegarandeerd.
* Bij een controle langs de weg, als blijkt dat het voertuig technisch in slechte staat is of ondeugdelijke aanpassingen heeft.
* Bij de invoer van een buitenlands voertuig, zolang het nog niet technisch is goedgekeurd voor gebruik op Nederlandse wegen.
* Als een voertuig is verbouwd of getuned op een manier die niet is toegestaan.

De politie, RDW of andere bevoegde instanties kunnen zo'n melding registreren na beoordeling.

## Wettelijke basis

De WOK-melding is geregeld in de **Regeling voertuigen**, onder verantwoordelijkheid van het Ministerie van Infrastructuur en Waterstaat. De basis voor toezicht op voertuigveiligheid ligt in de **Wegenverkeerswet 1994**, met name in:

* **Artikel 72 Wegenverkeerswet 1994**: voertuigen mogen alleen op de weg worden gebruikt als ze aan de wettelijke eisen voldoen.
* **Artikel 73 Wegenverkeerswet 1994**: het kentekenbewijs kan worden ingetrokken bij overtreding van de technische eisen.

## Wat zijn de gevolgen van een WOK-melding?

Een voertuig met een WOK-status:

* **Mag niet rijden** op de openbare weg.
* **Moet opnieuw worden gekeurd** bij een keuringsstation van de RDW.
* **Kan alleen via een trailer of transportmiddel** naar de keuringslocatie worden gebracht.

Tot de RDW het voertuig heeft goedgekeurd, blijft de WOK-melding actief. De kentekenregistratie blijft bestaan, maar het voertuig is feitelijk geschorst voor gebruik op de weg.

## Praktijkvoorbeeld

Een motorrijder wordt staande gehouden bij een verkeerscontrole. De agent constateert dat er aan het frame is gelast en dat essentiële onderdelen, zoals de verlichting en remmen, niet functioneren. Hij meldt dit bij de RDW, die een WOK-melding op het kenteken registreert. De motorrijder mag nu niet meer de weg op totdat het voertuig technisch is hersteld en opnieuw is goedgekeurd. Pas dan vervalt de melding.

## Rechten en plichten van de eigenaar

Als eigenaar van een voertuig met WOK-melding heb je de volgende verplichtingen:

* Je moet het voertuig laten herstellen zodat het aan de technische eisen voldoet.
* Je moet een herkeuring aanvragen bij de RDW.
* **Je mag het voertuig niet gebruiken** op de openbare weg, ook niet voor korte ritten.

Rijd je toch met een WOK-voertuig? Dan kun je een proces-verbaal krijgen, en in sommige gevallen kan het voertuig zelfs in beslag worden genomen.

## Wat kun je doen?

1. **Controleer de WOK-status** van je voertuig via de RDW-voertuigcontrole.
2. **Laat het voertuig herstellen** bij een erkende garage of specialist.
3. **Maak een afspraak voor herkeuring** bij de RDW via rdw.nl.
4. **Vervoer het voertuig** op een aanhanger of laat het ophalen door een transportbedrijf.
5. **Heb je vragen of twijfel je** of de melding terecht is? Neem contact op met de RDW of vraag juridisch advies bij het Juridisch Loket.

## Gerelateerde regelgeving

* artikel 72 Wegenverkeerswet 1994 – Eisen voertuigen
* artikel 73 Wegenverkeerswet 1994 – Intrekking kentekenbewijs
* Regeling voertuigen – Technische eisen
* Wegenverkeerswet 1994 – Algemene verkeersregels
* Kentekenwet – Kentekenregistratie

Laatst gecheckt: januari 2025. Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    },
    {
      slug: 'gijzeling-overheid-betekenis',
      title: 'Wat is gijzeling door de overheid?',
      description: '',
      category: 'Klacht & Bezwaar',
      categorySlug: 'klacht',
      seoTitle: 'Wat is gijzeling door de overheid? Uitleg dwangmiddel',
      seoDescription: 'Alles over gijzeling als dwangmiddel: Mulder-boetes, getuigen, rechten, procedure en hoe je gijzeling kunt voorkomen.',
      readTime: '',
      lastUpdated: '2025-01-17',
      views: 0,
      tags: ['gijzeling', 'mulder-boete', 'dwangmiddel', 'wahv', 'cjib', 'getuige'],
      featured: true,
      content: `## Kort antwoord

De overheid kan iemand gijzelen als dwangmiddel om te zorgen dat diegene iets doet wat verplicht is, zoals betalen van een boete of verschijnen bij de rechter. Het is géén straf, maar een laatste middel om medewerking af te dwingen.

## Wat is gijzeling precies?

Gijzeling is in dit geval een juridisch middel waarbij iemand tijdelijk wordt opgesloten, omdat diegene weigert te voldoen aan een wettelijke verplichting. Dit gebeurt niet zomaar, en alleen als alle andere mogelijkheden zijn geprobeerd. De bedoeling is om druk uit te oefenen, niet om iemand te straffen.

Gijzeling wordt geregeld in verschillende wetten, afhankelijk van de situatie. De bekendste vormen zijn:

* **Strafvorderlijke gijzeling**: bijvoorbeeld bij een getuige die weigert te verschijnen.
* **Civiele gijzeling**: bijv. bij het niet betalen van een dwangsom of boete, zoals bij een Wet Mulder-boete.

## Wettelijke basis van gijzeling

### Gijzeling bij Mulder-boetes

Bij verkeersboetes op grond van de **Wet administratiefrechtelijke handhaving verkeersvoorschriften (Wahv)** kan iemand die niet betaalt uiteindelijk gegijzeld worden. Dit staat in **artikel 28 Wahv**. Hierin staat dat het CJIB een rechter kan vragen om gijzeling toe te staan, als:

1. De boete is opgelegd en onherroepelijk (niet meer aan te vechten).
2. Betaling uitblijft, ondanks herinneringen en aanmaningen.
3. Andere manieren van innen niet zijn gelukt (zoals loonbeslag).
4. De rechter oordeelt dat gijzeling nog zinvol is.

De gijzeling mag **maximaal 7 dagen per openstaande boete** duren en eindigt direct als er betaald wordt.

### Gijzeling van een getuige

Volgens **artikel 221 Wetboek van Strafvordering (Sv)** kan een getuige die is opgeroepen door de rechter, maar zonder goede reden weigert te verschijnen, door de politie worden opgehaald of gegijzeld worden totdat hij of zij wel verklaart. Ook hier gaat het niet om straf, maar om het afdwingen van aanwezigheid.

## Gijzeling is geen straf

Gijzeling mag **nooit als straf** worden opgelegd. Het is alleen een drukmiddel om iets gedaan te krijgen. De gijzeling heft de verplichting niet op: als iemand na afloop nog steeds niet betaald heeft, blijft de boete openstaan en kan alsnog ander beslag volgen.

## Voorbeeld uit de praktijk

Een man heeft een verkeersboete van €450 gekregen. Hij weigert te betalen en reageert nergens op. Het CJIB probeert beslag te leggen, maar hij heeft geen loon of bezittingen. De rechter beslist dat gijzeling nodig is. De man wordt door de politie opgehaald en moet 7 dagen de cel in. Op dag 3 betaalt een familielid de boete. De man wordt dan direct vrijgelaten.

## Wat zijn je rechten?

Wie met gijzeling wordt bedreigd of vastgezet, heeft recht op:

* **Een beslissing van de rechter**, je wordt dus niet zomaar opgepakt.
* **Inzage in de reden** van gijzeling.
* **Vrijlating zodra** aan de verplichting is voldaan.
* **Behandeling volgens de regels** van vrijheidsbeneming, dus humaan en met toegang tot juridische hulp.

## Wat kun je doen?

Als je een brief krijgt over mogelijke gijzeling:

1. **Betaal de boete of schuld** zo snel mogelijk om gijzeling te voorkomen.
2. **Neem contact op met het CJIB** als je denkt dat er een fout is gemaakt.
3. **Vraag juridische hulp** via het Juridisch Loket of een advocaat.
4. **Dien bezwaar in**, als dat nog kan en je reden hebt om aan te nemen dat de boete onterecht is.
5. **Als je echt niet kunt betalen**, vraag een betalingsregeling aan.

Let op: Als de rechter eenmaal heeft beslist, kan de politie op elk moment overgaan tot gijzeling.

## Gerelateerde regelgeving

* artikel 28 Wet administratiefrechtelijke handhaving verkeersvoorschriften (Wahv) – Gijzeling bij Mulder-boetes
* artikel 221 Wetboek van Strafvordering (Sv) – Gijzeling getuigen
* artikel 585 Wetboek van Burgerlijke Rechtsvordering – Civiele gijzeling
* Penitentiaire beginselenwet – Behandeling gedetineerden
* Grondwet artikel 15 – Vrijheidsbeneming

Laatst gecheckt: januari 2025. Algemene informatie; uitzonderingen mogelijk – vraag deskundig advies voor je eigen situatie.`
    }
  ] as PolitieWetArticle[]
} 