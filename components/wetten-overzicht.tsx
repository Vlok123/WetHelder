'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, FileText, Scale, Shield, Building, CheckCircle, Mail } from 'lucide-react'

interface WetInfo {
  naam: string
  afkorting: string
  artikelen: number
  categorie: 'Strafrecht' | 'Bestuursrecht' | 'Burgerlijk recht' | 'Verkeerswet' | 'Speciale wetten' | 'Lokaal recht'
  beschrijving: string
  volledigBeschikbaar: boolean
}

const wettenDatabase: WetInfo[] = [
  // Strafrecht
  {
    naam: 'Wetboek van Strafrecht',
    afkorting: 'Sr',
    artikelen: 685,
    categorie: 'Strafrecht',
    beschrijving: 'Alle strafbare feiten, straffen en strafmaten',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wetboek van Strafvordering',
    afkorting: 'Sv',
    artikelen: 892,
    categorie: 'Strafrecht',
    beschrijving: 'Strafprocesrecht, opsporing, vervolging, tenuitvoerlegging',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wetboek van Strafvordering Boek 6',
    afkorting: 'Sv Boek 6',
    artikelen: 386,
    categorie: 'Strafrecht',
    beschrijving: 'Tenuitvoerlegging strafvonnissen, voorwaardelijke invrijheidstelling',
    volledigBeschikbaar: true
  },
  
  // Bestuursrecht
  {
    naam: 'Algemene wet bestuursrecht',
    afkorting: 'Awb',
    artikelen: 109,
    categorie: 'Bestuursrecht',
    beschrijving: 'Algemene regels voor bestuursorganen',
    volledigBeschikbaar: true
  },
  {
    naam: 'Algemene wet op het binnentreden',
    afkorting: 'AWBI',
    artikelen: 15,
    categorie: 'Bestuursrecht',
    beschrijving: 'Regels voor binnentreden in woningen',
    volledigBeschikbaar: true
  },
  {
    naam: 'Grondwet',
    afkorting: 'Gw',
    artikelen: 147,
    categorie: 'Bestuursrecht',
    beschrijving: 'Grondwet voor het Koninkrijk der Nederlanden',
    volledigBeschikbaar: true
  },
  {
    naam: 'Politiewet 2012',
    afkorting: 'Politiewet',
    artikelen: 144,
    categorie: 'Bestuursrecht',
    beschrijving: 'Organisatie en taken van de politie',
    volledigBeschikbaar: true
  },
  {
    naam: 'Ambtsinstructie',
    afkorting: 'AI',
    artikelen: 62,
    categorie: 'Bestuursrecht',
    beschrijving: 'Instructies voor politie en opsporingsambtenaren',
    volledigBeschikbaar: true
  },
  {
    naam: 'Gemeentewet',
    afkorting: 'Gemeentewet',
    artikelen: 279,
    categorie: 'Bestuursrecht',
    beschrijving: 'Organisatie en bevoegdheden van gemeenten',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet veiligheidsregio\'s',
    afkorting: 'Wvr',
    artikelen: 62,
    categorie: 'Bestuursrecht',
    beschrijving: 'Organisatie van veiligheidsregio\'s en rampenbestrijding',
    volledigBeschikbaar: true
  },
  {
    naam: 'Vreemdelingenwet 2000',
    afkorting: 'Vw 2000',
    artikelen: 150,
    categorie: 'Bestuursrecht',
    beschrijving: 'Toelating, verblijf en uitzetting van vreemdelingen',
    volledigBeschikbaar: true
  },
  
  // Burgerlijk recht  
  {
    naam: 'Burgerlijk Wetboek Boek 1',
    afkorting: 'BW 1',
    artikelen: 495,
    categorie: 'Burgerlijk recht',
    beschrijving: 'Personen- en familierecht',
    volledigBeschikbaar: true
  },
  {
    naam: 'Burgerlijk Wetboek Boek 2',
    afkorting: 'BW 2',
    artikelen: 618,
    categorie: 'Burgerlijk recht',
    beschrijving: 'Rechtspersonen',
    volledigBeschikbaar: true
  },
  {
    naam: 'Burgerlijk Wetboek Boek 3',
    afkorting: 'BW 3',
    artikelen: 305,
    categorie: 'Burgerlijk recht',
    beschrijving: 'Vermogensrecht algemeen',
    volledigBeschikbaar: true
  },
  {
    naam: 'Burgerlijk Wetboek Boek 4',
    afkorting: 'BW 4',
    artikelen: 233,
    categorie: 'Burgerlijk recht',
    beschrijving: 'Erfrecht',
    volledigBeschikbaar: true
  },
  {
    naam: 'Burgerlijk Wetboek Boek 5',
    afkorting: 'BW 5',
    artikelen: 146,
    categorie: 'Burgerlijk recht',
    beschrijving: 'Zakelijke rechten',
    volledigBeschikbaar: true
  },
  {
    naam: 'Burgerlijk Wetboek Boek 7',
    afkorting: 'BW 7',
    artikelen: 850,
    categorie: 'Burgerlijk recht',
    beschrijving: 'Bijzondere overeenkomsten',
    volledigBeschikbaar: true
  },
  {
    naam: 'Burgerlijk Wetboek Boek 7a',
    afkorting: 'BW 7a',
    artikelen: 47,
    categorie: 'Burgerlijk recht',
    beschrijving: 'Bijzondere overeenkomsten vervolg',
    volledigBeschikbaar: true
  },
  {
    naam: 'Burgerlijk Wetboek Boek 8',
    afkorting: 'BW 8',
    artikelen: 832,
    categorie: 'Burgerlijk recht',
    beschrijving: 'Vervoer en verzekering',
    volledigBeschikbaar: true
  },
  {
    naam: 'Burgerlijk Wetboek Boek 10',
    afkorting: 'BW 10',
    artikelen: 135,
    categorie: 'Burgerlijk recht',
    beschrijving: 'Internationaal privaatrecht',
    volledigBeschikbaar: true
  },
  
  // Verkeerswet
  {
    naam: 'Wegenverkeerswet 1994',
    afkorting: 'WVW',
    artikelen: 596,
    categorie: 'Verkeerswet',
    beschrijving: 'Verkeerswetgeving en voertuigregels',
    volledigBeschikbaar: true
  },
  {
    naam: 'Reglement verkeersregels en verkeerstekens',
    afkorting: 'RVV',
    artikelen: 120,
    categorie: 'Verkeerswet',
    beschrijving: 'Verkeersregels en verkeersborden',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet administratiefrechtelijke handhaving',
    afkorting: 'Wahv',
    artikelen: 52,
    categorie: 'Verkeerswet',
    beschrijving: 'Boetes en administratieve handhaving',
    volledigBeschikbaar: true
  },
  {
    naam: 'Reglement voertuigen',
    afkorting: 'RV',
    artikelen: 60,
    categorie: 'Verkeerswet',
    beschrijving: 'Technische eisen aan voertuigen',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wegenwet',
    afkorting: 'Wegenwet',
    artikelen: 45,
    categorie: 'Verkeerswet',
    beschrijving: 'Aanleg en beheer van wegen',
    volledigBeschikbaar: true
  },
  {
    naam: 'Spoorwegwet',
    afkorting: 'Spoorwegwet',
    artikelen: 75,
    categorie: 'Verkeerswet',
    beschrijving: 'Spoorwegvervoer en spoorbeheer',
    volledigBeschikbaar: true
  },
  {
    naam: 'Scheepvaartverkeerswet',
    afkorting: 'Svw',
    artikelen: 55,
    categorie: 'Verkeerswet',
    beschrijving: 'Scheepvaartverkeer en binnenvaartwegen',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet personenvervoer 2000',
    afkorting: 'Wp 2000',
    artikelen: 80,
    categorie: 'Verkeerswet',
    beschrijving: 'Taxi- en busvervoer',
    volledigBeschikbaar: true
  },
  
  // Speciale wetten
  {
    naam: 'Opiumwet',
    afkorting: 'Opiumwet',
    artikelen: 41,
    categorie: 'Speciale wetten',
    beschrijving: 'Drugswetgeving',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet wapens en munitie',
    afkorting: 'WWM',
    artikelen: 124,
    categorie: 'Speciale wetten',
    beschrijving: 'Wapenwetgeving',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet op de economische delicten',
    afkorting: 'WED',
    artikelen: 57,
    categorie: 'Speciale wetten',
    beschrijving: 'Economische strafbaarstellingen',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet op de identificatieplicht',
    afkorting: 'WID',
    artikelen: 5,
    categorie: 'Speciale wetten',
    beschrijving: 'Verplichting tot identificatie',
    volledigBeschikbaar: true
  },
  {
    naam: 'Jeugdwet',
    afkorting: 'Jeugdwet',
    artikelen: 155,
    categorie: 'Speciale wetten',
    beschrijving: 'Jeugdhulp en jeugdbescherming',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet forensische zorg',
    afkorting: 'Wfz',
    artikelen: 34,
    categorie: 'Speciale wetten',
    beschrijving: 'Forensische geestelijke gezondheidszorg',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet verplichte geestelijke gezondheidszorg',
    afkorting: 'Wvggz',
    artikelen: 136,
    categorie: 'Speciale wetten',
    beschrijving: 'Gedwongen opname en behandeling',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet op de lijkbezorging',
    afkorting: 'Wlb',
    artikelen: 82,
    categorie: 'Speciale wetten',
    beschrijving: 'Overlijden, lijkschouwing en begrafenis',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet dieren',
    afkorting: 'Wd',
    artikelen: 159,
    categorie: 'Speciale wetten',
    beschrijving: 'Dierenwelzijn en diergeneeskunde',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet publieke gezondheid',
    afkorting: 'Wpg',
    artikelen: 106,
    categorie: 'Speciale wetten',
    beschrijving: 'Infectieziekten en gevaarlijke stoffen',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet Bibob',
    afkorting: 'Bibob',
    artikelen: 35,
    categorie: 'Speciale wetten',
    beschrijving: 'Bevordering integriteitsbeoordelingen openbaar bestuur',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet openbare manifestaties',
    afkorting: 'Wom',
    artikelen: 25,
    categorie: 'Speciale wetten',
    beschrijving: 'Demonstraties en bijeenkomsten',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet ter voorkoming van witwassen en financiering van terrorisme',
    afkorting: 'Wwft',
    artikelen: 30,
    categorie: 'Speciale wetten',
    beschrijving: 'Anti-witwas en terrorismefinanciering',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet maatschappelijke ondersteuning',
    afkorting: 'Wmo',
    artikelen: 45,
    categorie: 'Speciale wetten',
    beschrijving: 'Maatschappelijke ondersteuning en zorg',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet middelen gebruik',
    afkorting: 'Wmg',
    artikelen: 15,
    categorie: 'Speciale wetten',
    beschrijving: 'Genotmiddelen en middelenmisbruik',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet particuliere beveiliging',
    afkorting: 'Wpb',
    artikelen: 20,
    categorie: 'Speciale wetten',
    beschrijving: 'Particuliere beveiligingsorganisaties',
    volledigBeschikbaar: true
  },
  {
    naam: 'AVG',
    afkorting: 'AVG',
    artikelen: 99,
    categorie: 'Speciale wetten',
    beschrijving: 'Algemene Verordening Gegevensbescherming',
    volledigBeschikbaar: true
  },
  
  // Belastingrecht
  {
    naam: 'Algemene wet inzake rijksbelastingen',
    afkorting: 'AWR',
    artikelen: 80,
    categorie: 'Speciale wetten',
    beschrijving: 'Algemene regels voor belastingen',
    volledigBeschikbaar: true
  },
  {
    naam: 'Invorderingswet 1990',
    afkorting: 'IW 1990',
    artikelen: 70,
    categorie: 'Speciale wetten',
    beschrijving: 'Invordering van belastingen',
    volledigBeschikbaar: true
  },
  {
    naam: 'Toeslagenwet',
    afkorting: 'TW',
    artikelen: 35,
    categorie: 'Speciale wetten',
    beschrijving: 'Zorgtoeslag, huurtoeslag en kinderopvangtoeslag',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet op belastingen van rechtsverkeer',
    afkorting: 'WBR',
    artikelen: 25,
    categorie: 'Speciale wetten',
    beschrijving: 'Overdrachtsbelasting en registratierecht',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet op de accijns',
    afkorting: 'Wet Accijns',
    artikelen: 45,
    categorie: 'Speciale wetten',
    beschrijving: 'Accijnzen op alcohol, tabak en energie',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet op de belasting van personenauto\'s en motorrijwielen',
    afkorting: 'BPM',
    artikelen: 30,
    categorie: 'Speciale wetten',
    beschrijving: 'Belasting op nieuwe personenauto\'s',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet op de dividendbelasting 1965',
    afkorting: 'Wet DB 1965',
    artikelen: 20,
    categorie: 'Speciale wetten',
    beschrijving: 'Belasting op dividenden',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet op de inkomstenbelasting 2001',
    afkorting: 'Wet IB 2001',
    artikelen: 85,
    categorie: 'Speciale wetten',
    beschrijving: 'Inkomstenbelasting voor natuurlijke personen',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet op de kansspelbelasting',
    afkorting: 'Wet KSB',
    artikelen: 25,
    categorie: 'Speciale wetten',
    beschrijving: 'Belasting op kansspelen',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet op de loonbelasting 1964',
    afkorting: 'Wet LB 1964',
    artikelen: 40,
    categorie: 'Speciale wetten',
    beschrijving: 'Loonbelasting en premies volksverzekeringen',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet op de motorrijtuigenbelasting',
    afkorting: 'Wet MRB',
    artikelen: 35,
    categorie: 'Speciale wetten',
    beschrijving: 'Motorrijtuigenbelasting',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet op de omzetbelasting 1968',
    afkorting: 'Wet OB 1968',
    artikelen: 55,
    categorie: 'Speciale wetten',
    beschrijving: 'BTW (omzetbelasting)',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet waardering onroerende zaken',
    afkorting: 'Wet WOZ',
    artikelen: 30,
    categorie: 'Speciale wetten',
    beschrijving: 'Waardering van onroerende zaken voor belasting',
    volledigBeschikbaar: true
  },
  
  // Politie & Handhaving
  {
    naam: 'Aanwijzing handelwijze geweldsaanwending politieambtenaar',
    afkorting: 'Aanwijzing Geweld',
    artikelen: 15,
    categorie: 'Speciale wetten',
    beschrijving: 'Geweldsaanwending door politie',
    volledigBeschikbaar: true
  },
  {
    naam: 'Aanwijzing opsporingsbevoegdheden',
    afkorting: 'Aanwijzing OB',
    artikelen: 20,
    categorie: 'Speciale wetten',
    beschrijving: 'Opsporingsbevoegdheden en -methoden',
    volledigBeschikbaar: true
  },
  {
    naam: 'Aanwijzing rechtsbijstand politieverhoor',
    afkorting: 'Aanwijzing RB',
    artikelen: 12,
    categorie: 'Speciale wetten',
    beschrijving: 'Rechtsbijstand tijdens verhoor',
    volledigBeschikbaar: true
  },
  {
    naam: 'Besluit alcohol',
    afkorting: 'Besluit Alcohol',
    artikelen: 25,
    categorie: 'Speciale wetten',
    beschrijving: 'Alcoholonderzoeken en ademtests',
    volledigBeschikbaar: true
  },
  {
    naam: 'Besluit bewapening en uitrusting politie',
    afkorting: 'BBUP',
    artikelen: 18,
    categorie: 'Speciale wetten',
    beschrijving: 'Bewapening en uitrusting van politie',
    volledigBeschikbaar: true
  },
  {
    naam: 'Besluit buitengewoon opsporingsambtenaar',
    afkorting: 'Besluit BOA',
    artikelen: 30,
    categorie: 'Speciale wetten',
    beschrijving: 'Buitengewoon opsporingsambtenaren (BOA\'s)',
    volledigBeschikbaar: true
  },
  {
    naam: 'Besluit politiegegevens',
    afkorting: 'BPG',
    artikelen: 22,
    categorie: 'Speciale wetten',
    beschrijving: 'Verwerking van politiegegevens',
    volledigBeschikbaar: true
  },
  {
    naam: 'Regeling politieklachtenprocedure',
    afkorting: 'RPP',
    artikelen: 15,
    categorie: 'Speciale wetten',
    beschrijving: 'Klachten tegen politie',
    volledigBeschikbaar: true
  },
  {
    naam: 'Regeling wapens en munitie',
    afkorting: 'RWM',
    artikelen: 40,
    categorie: 'Speciale wetten',
    beschrijving: 'Uitvoeringsregels wapenwetgeving',
    volledigBeschikbaar: true
  },
  {
    naam: 'Regeling bloed- en urineonderzoek',
    afkorting: 'Regeling BUO',
    artikelen: 10,
    categorie: 'Speciale wetten',
    beschrijving: 'Bloed- en urineonderzoek bij verdachten',
    volledigBeschikbaar: true
  },
  {
    naam: 'Richtlijn artikel 8 WVW',
    afkorting: 'Richtlijn art. 8',
    artikelen: 8,
    categorie: 'Speciale wetten',
    beschrijving: 'Rijvaardigheid en geschiktheid',
    volledigBeschikbaar: true
  },
  {
    naam: 'Arbeidsomstandighedenwet',
    afkorting: 'Arbo-wet',
    artikelen: 1,
    categorie: 'Speciale wetten',
    beschrijving: 'Veiligheid en gezondheid op de werkplek',
    volledigBeschikbaar: true
  },
  {
    naam: 'Elektriciteitswet 1998',
    afkorting: 'E-wet 1998',
    artikelen: 1,
    categorie: 'Speciale wetten',
    beschrijving: 'Elektriciteitsvoorziening en energiemarkt',
    volledigBeschikbaar: true
  },
  {
    naam: 'Faillissementswet',
    afkorting: 'Fw',
    artikelen: 1,
    categorie: 'Speciale wetten',
    beschrijving: 'Faillissement en surseance van betaling',
    volledigBeschikbaar: true
  },
  {
    naam: 'Geneesmiddelenwet',
    afkorting: 'Gnw',
    artikelen: 1,
    categorie: 'Speciale wetten',
    beschrijving: 'Regulering van geneesmiddelen',
    volledigBeschikbaar: true
  },
  {
    naam: 'Gezondheidswet',
    afkorting: 'Gw',
    artikelen: 1,
    categorie: 'Speciale wetten',
    beschrijving: 'Gezondheidszorg en volksgezondheid',
    volledigBeschikbaar: true
  },
  {
    naam: 'Visserijwet 1963',
    afkorting: 'Visserijwet',
    artikelen: 1,
    categorie: 'Speciale wetten',
    beschrijving: 'Visserij en aquacultuur',
    volledigBeschikbaar: true
  },
  {
    naam: 'Vuurwerkbesluit',
    afkorting: 'VWB',
    artikelen: 1,
    categorie: 'Speciale wetten',
    beschrijving: 'Vuurwerk en pyrotechnische artikelen',
    volledigBeschikbaar: true
  },
  {
    naam: 'Wet milieubeheer',
    afkorting: 'Wm',
    artikelen: 1,
    categorie: 'Speciale wetten',
    beschrijving: 'Milieubescherming en -regulering',
    volledigBeschikbaar: true
  },
  
  // Lokaal recht
  {
    naam: 'APV Nijmegen',
    afkorting: 'APV Nijmegen',
    artikelen: 377,
    categorie: 'Lokaal recht',
    beschrijving: 'Algemene Plaatselijke Verordening gemeente Nijmegen',
    volledigBeschikbaar: true
  }
]

const categorieIcons = {
  'Strafrecht': Scale,
  'Bestuursrecht': Shield,
  'Burgerlijk recht': FileText,
  'Verkeerswet': Building,
  'Speciale wetten': BookOpen,
  'Lokaal recht': Building
}

const categorieColors = {
  'Strafrecht': 'bg-red-100 text-red-800',
  'Bestuursrecht': 'bg-blue-100 text-blue-800',
  'Burgerlijk recht': 'bg-green-100 text-green-800',
  'Verkeerswet': 'bg-yellow-100 text-yellow-800',
  'Speciale wetten': 'bg-purple-100 text-purple-800',
  'Lokaal recht': 'bg-gray-100 text-gray-800'
}

export function WettenOverzicht() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  
  const totalArtikelen = wettenDatabase.reduce((sum, wet) => sum + wet.artikelen, 0)
  const totalWetten = wettenDatabase.length
  
  const gegroepeerdeWetten = wettenDatabase.reduce((acc, wet) => {
    if (!acc[wet.categorie]) {
      acc[wet.categorie] = []
    }
    acc[wet.categorie].push(wet)
    return acc
  }, {} as Record<string, WetInfo[]>)
  
  const gefilterdWetten = selectedCategory 
    ? gegroepeerdeWetten[selectedCategory] || []
    : wettenDatabase
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-blue-600 hover:text-blue-700"
        onClick={() => setIsOpen(true)}
      >
        <BookOpen className="h-4 w-4 mr-2" />
        Beschikbare wetten
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Beschikbare Nederlandse Wetgeving
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Statistieken */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Database Overzicht</h3>
                <p className="text-sm text-blue-700">
                  {totalWetten} wetten • {totalArtikelen.toLocaleString()} artikelen beschikbaar
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          {/* Categorie filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="mb-2"
            >
              Alle categorieën
            </Button>
            {Object.keys(gegroepeerdeWetten).map(categorie => (
              <Button
                key={categorie}
                variant={selectedCategory === categorie ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(categorie)}
                className="mb-2"
              >
                {categorie} ({gegroepeerdeWetten[categorie].length})
              </Button>
            ))}
          </div>
          
          {/* Wetten overzicht */}
          <div className="grid gap-4 md:grid-cols-2">
            {gefilterdWetten.map((wet, index) => {
              const IconComponent = categorieIcons[wet.categorie]
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                        <div>
                          <CardTitle className="text-lg">{wet.naam}</CardTitle>
                          <p className="text-sm text-gray-500 font-mono">{wet.afkorting}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={categorieColors[wet.categorie]}>
                          {wet.categorie}
                        </Badge>
                        {wet.volledigBeschikbaar && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">{wet.beschrijving}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {wet.artikelen} artikelen
                      </span>
                      <span className="text-xs text-green-600 font-medium">
                        ✓ Volledig beschikbaar
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          {/* Ontbrekende wetgeving melding */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Mis je een wet of regeling?</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Laat het ons weten via het{' '}
                  <a href="/contact" className="underline hover:no-underline font-medium">
                    contactformulier
                  </a>
                  . We voegen regelmatig nieuwe wetgeving toe aan het systeem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
} 