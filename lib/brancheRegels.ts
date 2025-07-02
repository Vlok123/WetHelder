// 🏢 Branche Regels Database - WetHelder

export interface BrancheRegel {
  id: string
  branche: string
  organisatie: string
  regel: string
  omschrijving: string
  gevolgen: string
  bron: string
  laatstBijgewerkt: Date
  trefwoorden: string[]
}

export interface BrancheAdvies {
  wettelijkePositie: string
  brancheRegels: BrancheRegel[]
  advies: string
  conflicten?: string[]
}

// Database van brancheregels
const BRANCHE_REGELS: BrancheRegel[] = [
  // MAKELAARDIJ
  {
    id: 'nvm-biedingen-1',
    branche: 'makelaardij',
    organisatie: 'NVM',
    regel: 'Verbod op prijsinformatie concurrent',
    omschrijving: 'Een NVM-makelaar mag geen informatie geven over biedingen van andere geïnteresseerden, ook niet op verzoek van de bieder.',
    gevolgen: 'Tuchtrechtelijke maatregelen, boetes, schorsing of royement uit NVM',
    bron: 'NVM Gedragscode, artikel 3.2.4',
    laatstBijgewerkt: new Date('2024-01-01'),
    trefwoorden: ['bieding', 'concurrent', 'prijsinformatie', 'makelaar', 'verkoop', 'huis']
  },
  {
    id: 'nvm-transparantie-1',
    branche: 'makelaardij',
    organisatie: 'NVM',
    regel: 'Transparantie verplichtingen',
    omschrijving: 'Makelaar moet wel transparant zijn over het verkoopproces en criteria, maar niet over specifieke biedingen.',
    gevolgen: 'Bij onduidelijkheid kunnen kopers een klacht indienen',
    bron: 'NVM Gedragscode, artikel 2.1',
    laatstBijgewerkt: new Date('2024-01-01'),
    trefwoorden: ['transparantie', 'verkoopproces', 'criteria', 'makelaar']
  },
  
  // ADVOCATUUR
  {
    id: 'nova-geheimhouding-1',
    branche: 'advocatuur',
    organisatie: 'Nederlandse Orde van Advocaten',
    regel: 'Verschoningsrecht en geheimhouding',
    omschrijving: 'Advocaten hebben een absolute geheimhoudingsplicht tegenover cliënten, ook na beëindiging van de opdracht.',
    gevolgen: 'Tuchtrechtelijke vervolging, schorsing of doorhaling',
    bron: 'Advocatenwet artikel 37, Gedragsregels',
    laatstBijgewerkt: new Date('2024-01-01'),
    trefwoorden: ['geheimhouding', 'verschoningsrecht', 'cliënt', 'vertrouwelijk']
  },
  {
    id: 'nova-belangenconflict-1',
    branche: 'advocatuur',
    organisatie: 'Nederlandse Orde van Advocaten',
    regel: 'Belangenconflict vermijden',
    omschrijving: 'Een advocaat mag niet optreden bij tegenstrijdige belangen en moet dit van tevoren onderzoeken.',
    gevolgen: 'Tuchtmaatregel, claim van cliënt',
    bron: 'Gedragsregels advocatuur, regel 3',
    laatstBijgewerkt: new Date('2024-01-01'),
    trefwoorden: ['belangenconflict', 'tegenstrijdig', 'optreden', 'onderzoek']
  },

  // ACCOUNTANCY
  {
    id: 'nba-onafhankelijkheid-1',
    branche: 'accountancy',
    organisatie: 'NBA',
    regel: 'Onafhankelijkheid en objectiviteit',
    omschrijving: 'Accountants moeten onafhankelijk zijn van hun cliënten en mogen geen financiële belangen hebben.',
    gevolgen: 'Tuchtmaatregel, intrekking certificering',
    bron: 'NBA Verordening Gedragscode',
    laatstBijgewerkt: new Date('2024-01-01'),
    trefwoorden: ['onafhankelijkheid', 'objectiviteit', 'financieel belang', 'accountant']
  },

  // NOTARIAAT
  {
    id: 'knn-onpartijdigheid-1',
    branche: 'notariaat',
    organisatie: 'KNB',
    regel: 'Onpartijdige rechtshulp',
    omschrijving: 'Notarissen moeten alle partijen gelijkwaardig behandelen en mogen geen partij bevoordelen.',
    gevolgen: 'Tuchtrechtelijke maatregel, aansprakelijkheid',
    bron: 'Notariswet, KNB Gedragscode',
    laatstBijgewerkt: new Date('2024-01-01'),
    trefwoorden: ['onpartijdig', 'gelijkwaardig', 'partijen', 'bevoordelen']
  },

  // GEZONDHEIDSZORG
  {
    id: 'knmg-beroepsgeheim-1',
    branche: 'gezondheidszorg',
    organisatie: 'KNMG',
    regel: 'Medisch beroepsgeheim',
    omschrijving: 'Artsen hebben een strikte geheimhoudingsplicht tegenover patiënten, ook tegenover familie.',
    gevolgen: 'Tuchtmaatregel, strafrechtelijke vervolging',
    bron: 'WGBO, KNMG Gedragscode',
    laatstBijgewerkt: new Date('2024-01-01'),
    trefwoorden: ['beroepsgeheim', 'geheimhouding', 'patiënt', 'familie', 'arts']
  },

  // FINANCIËLE DIENSTVERLENING
  {
    id: 'afm-zorgplicht-1',
    branche: 'financiële dienstverlening',
    organisatie: 'AFM',
    regel: 'Zorgplicht financieel adviseur',
    omschrijving: 'Financiële adviseurs moeten handelen in het belang van de cliënt en passende producten adviseren.',
    gevolgen: 'AFM-sanctie, boete, intrekking vergunning',
    bron: 'Wft, AFM Gedragscode',
    laatstBijgewerkt: new Date('2024-01-01'),
    trefwoorden: ['zorgplicht', 'belang cliënt', 'passend product', 'adviseren']
  },

  // JOURNALISTIEK
  {
    id: 'nvj-waarheidsgetrouwheid-1',
    branche: 'journalistiek',
    organisatie: 'NVJ',
    regel: 'Waarheidsgetrouwheid en verificatie',
    omschrijving: 'Journalisten moeten informatie verifiëren en correcties plaatsen bij onjuistheden.',
    gevolgen: 'Tuchtmaatregel NVJ, reputatieschade',
    bron: 'NVJ Leidraad',
    laatstBijgewerkt: new Date('2024-01-01'),
    trefwoorden: ['waarheidsgetrouw', 'verificatie', 'correctie', 'onjuistheid']
  },

  // BOUW
  {
    id: 'bouwend-nederland-1',
    branche: 'bouw',
    organisatie: 'Bouwend Nederland',
    regel: 'Kwaliteitsborging en garantie',
    omschrijving: 'Aangesloten bedrijven moeten zich houden aan kwaliteitseisen en garantievoorwaarden.',
    gevolgen: 'Uitsluiting lidmaatschap, verlies certificering',
    bron: 'Bouwend Nederland Gedragscode',
    laatstBijgewerkt: new Date('2024-01-01'),
    trefwoorden: ['kwaliteit', 'garantie', 'bouw', 'certificering']
  }
]

export function zoekBrancheRegels(query: string, branche?: string): BrancheRegel[] {
  const queryLower = query.toLowerCase()
  
  return BRANCHE_REGELS.filter(regel => {
    // Filter op branche als opgegeven
    if (branche && regel.branche !== branche.toLowerCase()) {
      return false
    }
    
    // Zoek in trefwoorden, regel en omschrijving
    return (
      regel.trefwoorden.some(keyword => queryLower.includes(keyword.toLowerCase())) ||
      regel.regel.toLowerCase().includes(queryLower) ||
      regel.omschrijving.toLowerCase().includes(queryLower)
    )
  })
}

export function getBrancheAdvies(query: string, wettelijkePositie: string): BrancheAdvies {
  const relevanteRegels = zoekBrancheRegels(query)
  
  let advies = ''
  const conflicten: string[] = []
  
  if (relevanteRegels.length > 0) {
    advies = `**WETTELIJKE POSITIE:** ${wettelijkePositie}\n\n**BRANCHEREGELS:**\n\n`
    
    relevanteRegels.forEach(regel => {
      advies += `**${regel.organisatie} - ${regel.regel}:**\n`
      advies += `${regel.omschrijving}\n\n`
      advies += `*Gevolgen bij overtreding:* ${regel.gevolgen}\n`
      advies += `*Bron:* ${regel.bron}\n\n`
      
      // Detecteer mogelijke conflicten
      if (wettelijkePositie.toLowerCase().includes('mag') && 
          regel.omschrijving.toLowerCase().includes('mag niet')) {
        conflicten.push(`Conflict: Wettelijk toegestaan maar ${regel.organisatie} verbiedt dit`)
      }
    })
    
    if (conflicten.length > 0) {
      advies += `**⚠️ CONFLICTEN GEDETECTEERD:**\n`
      conflicten.forEach(conflict => {
        advies += `- ${conflict}\n`
      })
      advies += `\n**ADVIES:** Houd je aan de strengste regel. Brancheregels zijn vaak bindend voor leden en kunnen leiden tot sancties, ook als iets wettelijk toegestaan is.\n`
    }
  } else {
    advies = `**WETTELIJKE POSITIE:** ${wettelijkePositie}\n\n*Geen specifieke brancheregels gevonden voor deze vraag.*`
  }
  
  return {
    wettelijkePositie,
    brancheRegels: relevanteRegels,
    advies,
    conflicten: conflicten.length > 0 ? conflicten : undefined
  }
}

export function getAlleBranches(): string[] {
  return [...new Set(BRANCHE_REGELS.map(regel => regel.branche))]
}

export function getBrancheRegelsVoorBranche(branche: string): BrancheRegel[] {
  return BRANCHE_REGELS.filter(regel => regel.branche.toLowerCase() === branche.toLowerCase())
} 