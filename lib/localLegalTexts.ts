/**
 * Lokale Wetteksten Database
 * 
 * Deze file bevat veelgevraagde wetteksten om de snelheid te verbeteren
 * en ervoor te zorgen dat belangrijke artikelen altijd beschikbaar zijn.
 */

export interface LocalLegalText {
  article: string
  fullText: string
  source: string
  lawBook: string
  lastUpdated: string
}

export const localLegalTexts: LocalLegalText[] = [
  {
    article: "artikel 8 Wet politiegegevens",
    fullText: `Artikel 8 Wet politiegegevens (Wpg)

1. Politiegegevens kunnen door de politie worden verstrekt aan:
   a. een bestuursorgaan, voor zover dit noodzakelijk is voor de vervulling van de aan dat orgaan opgedragen taak;
   b. een derde, voor zover dit noodzakelijk is ter afwending van ernstig gevaar voor de veiligheid van personen of goederen of ter voorkoming, opsporing, vervolging of berechting van strafbare feiten;
   c. een ander onderdeel van de politie of de Koninklijke marechaussee.

2. De verstrekking, bedoeld in het eerste lid, onderdeel a, vindt slechts plaats voor zover de gegevens betrekking hebben op:
   a. de uitvoering van de politietaak;
   b. de handhaving van de openbare orde of de rechtsorde.

3. Politiegegevens kunnen voorts worden verstrekt aan de autoriteiten van andere mogendheden en aan internationale organisaties, voor zover dit voortvloeit uit een ieder verbindend verdrag of een besluit van een volkenrechtelijke organisatie.

4. Bij of krachtens algemene maatregel van bestuur kunnen nadere regels worden gesteld met betrekking tot de verstrekking van politiegegevens.`,
    source: "https://wetten.overheid.nl/BWBR0022463/2024-07-01#Hoofdstuk2_Paragraaf1_Artikel8",
    lawBook: "Wet politiegegevens",
    lastUpdated: "2024-07-01"
  },
  {
    article: "artikel 27 Wetboek van Strafvordering",
    fullText: `Artikel 27 Wetboek van Strafvordering (Sv)

1. Ieder die wordt verdacht van het plegen van een strafbaar feit, is verplicht zijn naam, voornamen, geboortedatum en geboorteplaats, adres en woon- of verblijfplaats op te geven aan een opsporingsambtenaar die hem daarom verzoekt. Bij ontstentenis van een adres geeft hij de plaats op waar hij feitelijk verblijft of het laatst heeft verbleven.

2. Een opsporingsambtenaar die de verdachte daarom verzoekt, is bevoegd inzage te vorderen van een geldig identiteitsbewijs als bedoeld in artikel 1 van de Wet op de identificatieplicht ter vaststelling van de juistheid van de opgegeven gegevens.

3. Indien de verdachte niet voldoet aan de verplichting, bedoeld in het eerste lid, of weigert medewerking te verlenen aan de uitoefening van de bevoegdheid, bedoeld in het tweede lid, dan is de opsporingsambtenaar bevoegd hem aan te houden.`,
    source: "https://wetten.overheid.nl/BWBR0001903/2024-07-01#Boek1_TitelIV_Artikel27",
    lawBook: "Wetboek van Strafvordering",
    lastUpdated: "2024-07-01"
  },
  {
    article: "artikel 8 Politiewet 2012",
    fullText: `Artikel 8 Politiewet 2012

Een politieambtenaar draagt, voor zover het een ambtenaar van politie betreft, zorg voor de veiligheid van personen en goederen en handhaaft de rechtsorde.`,
    source: "https://wetten.overheid.nl/BWBR0031788/2024-01-01#Hoofdstuk2_Artikel8",
    lawBook: "Politiewet 2012",
    lastUpdated: "2024-01-01"
  },
  {
    article: "artikel 8a Politiewet 2012",
    fullText: `Artikel 8a Politiewet 2012

1. Een ambtenaar van politie kan van personen inzage vorderen van een geldig identiteitsbewijs als bedoeld in artikel 1 van de Wet op de identificatieplicht, indien dit redelijkerwijs noodzakelijk is voor de uitvoering van de politietaak.

2. Een persoon die wordt aangesproken op grond van het eerste lid, is verplicht een geldig identiteitsbewijs ter inzage aan te bieden.

3. Een ambtenaar van politie kan een persoon die niet voldoet aan de verplichting, bedoeld in het tweede lid, of ten aanzien van wie de identiteit niet op andere wijze kan worden vastgesteld, aanhouden tot het tijdstip waarop zijn identiteit is vastgesteld. Die aanhouding duurt ten hoogste zes uren en kan eenmaal voor ten hoogste zes uren worden verlengd.`,
    source: "https://wetten.overheid.nl/BWBR0031788/2024-01-01#Hoofdstuk2_Artikel8a",
    lawBook: "Politiewet 2012",
    lastUpdated: "2024-01-01"
  },
  {
    article: "artikel 2 Wet op de identificatieplicht",
    fullText: `Artikel 2 Wet op de identificatieplicht

1. Een ieder van twaalf jaren en ouder is verplicht te allen tijde een geldig identiteitsbewijs bij zich te hebben en dit op vordering van een daartoe bevoegde opsporingsambtenaar dan wel van een daartoe bevoegde ambtenaar terstond ter inzage aan te bieden.

2. De verplichting geldt niet indien redelijkerwijs moet worden aangenomen dat betrokkene zijn identiteit reeds voldoende kenbaar heeft gemaakt.`,
    source: "https://wetten.overheid.nl/BWBR0006297/2024-01-01#Artikel2",
    lawBook: "Wet op de identificatieplicht",
    lastUpdated: "2024-01-01"
  }
]

/**
 * Zoek naar lokale wetteksten
 */
export function findLocalLegalText(query: string): LocalLegalText[] {
  const queryLower = query.toLowerCase().trim()
  
  return localLegalTexts.filter(text => {
    const articleLower = text.article.toLowerCase()
    const lawBookLower = text.lawBook.toLowerCase()
    
    // Exacte match op artikel
    if (articleLower.includes(queryLower)) {
      return true
    }
    
    // Match op artikel nummer + wetboek
    const articleMatch = queryLower.match(/artikel\s*(\d+[a-z]*)\s*(.*)/i)
    if (articleMatch) {
      const articleNum = articleMatch[1]
      const lawRef = articleMatch[2]
      
      if (articleLower.includes(`artikel ${articleNum}`) && 
          (lawRef === '' || lawBookLower.includes(lawRef.toLowerCase()))) {
        return true
      }
    }
    
    return false
  })
}

/**
 * Haal specifiek artikel op
 */
export function getLocalLegalText(article: string, lawBook?: string): LocalLegalText | null {
  const results = localLegalTexts.filter(text => {
    const articleMatch = text.article.toLowerCase().includes(article.toLowerCase())
    const lawBookMatch = !lawBook || text.lawBook.toLowerCase().includes(lawBook.toLowerCase())
    return articleMatch && lawBookMatch
  })
  
  return results.length > 0 ? results[0] : null
} 