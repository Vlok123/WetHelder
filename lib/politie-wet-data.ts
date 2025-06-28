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
      articleCount: 2
    },
    {
      slug: 'verkeer',
      title: 'Verkeer',
      description: 'Politiebevoegdheden op de weg, blaastest, stopteken',
      icon: 'Car',
      color: 'bg-orange-100 text-orange-800',
      articleCount: 4
    },
    {
      slug: 'opsporing',
      title: 'Opsporing & Aanhouding',
      description: 'Wanneer en hoe mag iemand worden aangehouden?',
      icon: 'AlertCircle',
      color: 'bg-red-100 text-red-800',
      articleCount: 3
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
      articleCount: 1
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

Als je geen identiteitsbewijs bij je hebt wanneer een agent hierom vraagt, riskeer je een boete. Dit is strafbaar volgens artikel 447e Wetboek van Strafrecht. Weiger je mee te werken, dan kun je zelfs worden aangehouden en meegenomen naar het politiebureau.

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


Uitgebreide uitleg

Wettelijke basis: artikel 160 Wegenverkeerswet 1994

De politie mag je tijdens een verkeerscontrole laten stoppen en controleren op grond van artikel 160 van de Wegenverkeerswet 1994. Dit artikel geeft agenten de bevoegdheid om:

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

* Wegenverkeerswet 1994 artikel 160 – Bevoegdheden politie bij verkeerscontrole.
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
  * Je hebt het recht om je af te vragen of het rijgedrag van de politie verantwoord is en kunt dit melden (gebaseerd op Politiewet 2012 artikel 13: klachtrecht).

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
* Politiewet 2012 artikel 3 – taakomschrijving politie (waaronder opsporing en handhaving).

Belangrijke rechtspraak

* HR 10-11-2009, ECLI:NL:HR:2009:BI7099 – schuur op erf werd aangemerkt als woning, binnentreden zonder machtiging was onrechtmatig.
* HR 27-10-2015, ECLI:NL:HR:2015:3122 – doorzoeking bedrijfspand zonder machtiging was toegestaan.

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

Bron: Wetboek van Strafvordering artikel 163

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

* Artikel 163 Wetboek van Strafvordering – aangifteplicht politie
* Artikel 164 Wetboek van Strafvordering – opmaken proces-verbaal
* Politiewet 2012 artikel 3 – taak van de politie (waaronder opsporing)
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
      readTime: '8 min lezen',
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
* artikel 160 Wegenverkeerswet 1994 – Verkeerscontrole
* artikel 3 Politiewet 2012 – Optreden bij acuut gevaar of dreiging


Praktijkvoorbeeld

Je rijdt op de snelweg en wordt aangehouden voor een verkeerscontrole. Terwijl je je rijbewijs geeft, ruikt de agent een sterke wietlucht. Je weigert toestemming voor doorzoeking. Omdat er sprake is van een concreet vermoeden van een strafbaar feit, mag de politie tóch zoeken op basis van artikel 96b Sv – jouw weigering verandert daar niets aan. Fysiek verzet is dan strafbaar.


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
      description: 'Wanneer ben je verplicht te stoppen voor een politieagent en wat zijn de gevolgen van doorrijden?',
      category: 'Verkeer',
      categorySlug: 'verkeer',
      seoTitle: 'Moet ik altijd stoppen als een agent me een stopteken geeft?',
      seoDescription: 'Uitleg over de stopverplichting bij politiebevel: wanneer je moet stoppen, wettelijke basis en gevolgen van doorrijden.',
      readTime: '6 min lezen',
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
* artikel 82 Reglement verkeersregels en verkeerstekens 1990 (RVV 1990) – regelt dat een bevoegd persoon (zoals politie of verkeersregelaar) een stopteken mag geven.


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
      description: 'Uitleg over het verschil tussen bevoegdheden van BOA\'s en politieagenten, inclusief wat BOA\'s wel en niet mogen.',
      category: 'Algemene Bevoegdheden',
      categorySlug: 'bevoegdheden',
      seoTitle: 'Hebben BOA\'s dezelfde bevoegdheden als politieagenten?',
      seoDescription: 'Verschillen tussen BOA en politie bevoegdheden: wat mag een BOA wel en niet, rechten burger, wettelijke basis.',
      readTime: '7 min lezen',
      lastUpdated: '2025-06-28',
      views: 0,
      tags: ['BOA', 'bevoegdheden', 'politie', 'handhaving', 'legitimatie'],
      featured: false,
      content: `## Kort antwoord

Nee, een BOA mag minder dan de politie. De bevoegdheden van een BOA zijn beperkt tot een specifiek werkgebied en minder ingrijpend dan die van een politieambtenaar.


Uitgebreide uitleg

Wat doet een BOA?

Een BOA (Buitengewoon Opsporingsambtenaar) controleert of mensen zich aan bepaalde regels houden. Denk aan foutparkeren, afval op straat of zwartrijden in de tram. BOA's werken bijvoorbeeld voor een gemeente, openbaar vervoerbedrijf of natuurorganisatie. Ze mogen alleen handhaven binnen hun taakgebied, zoals 'openbare ruimte' of 'milieu'.

Een BOA is géén volwaardige politiefunctionaris. De bevoegdheden zijn beperkt en staan in artikel 142 van het Wetboek van Strafvordering. Iedere BOA heeft een legitimatiepas waarop staat in welk domein hij of zij mag optreden.


Wat mag de politie méér?

De politie heeft veel ruimere bevoegdheden. Die mag bijvoorbeeld:

* alle strafbare feiten opsporen (niet alleen binnen een bepaald domein);
* geweld gebruiken als dat nodig is;
* handboeien of een wapen dragen;
* woningen betreden met toestemming van een officier van justitie.

Deze bevoegdheden staan onder meer in artikel 141 van het Wetboek van Strafvordering en de Politiewet 2012.


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

* Artikel 142 Wetboek van Strafvordering – Bevoegdheden BOA.
* Artikel 141 Wetboek van Strafvordering – Bevoegdheden politie.
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
      description: 'Uitgebreide gids over je rechten bij aanhouding voor een VH-feit: ophouden, inverzekeringstelling, advocaat, zwijgrecht.',
      category: 'Opsporing & Aanhouding',
      categorySlug: 'opsporing',
      seoTitle: 'Rechten bij aanhouding voor VH-feit (voorlopige hechtenis)',
      seoDescription: 'Volledige uitleg over je rechten bij aanhouding voor VH-feit: termijnen, advocaat, zwijgrecht, inverzekeringstelling.',
      readTime: '10 min lezen',
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

Na de IVS kan de rechter-commissaris bepalen dat je langer vast moet blijven (bijvoorbeeld via bewaring van 14 dagen – zie artikel 63 Sv). Daarna kan eventueel gevangenhouding volgen, opnieuw op last van een rechter.


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
      description: 'Uitleg over wanneer een klacht bij de onafhankelijke klachtencommissie terechtkomt en wat die commissie precies doet.',
      category: 'Klacht & Bezwaar',
      categorySlug: 'klacht',
      seoTitle: 'Klachtencommissie politie: procedure en rechten',
      seoDescription: 'Alles over de onafhankelijke klachtencommissie bij de politie: wanneer, hoe, procedure, rechten en plichten.',
      readTime: '8 min lezen',
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
    }
  ] as PolitieWetArticle[]
} 