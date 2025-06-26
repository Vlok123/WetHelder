import { SourceTag } from './enums'

export const SITE_GROUPS: Record<SourceTag, string[]> = {
  [SourceTag.WETTEN]: [
    'wetten.overheid.nl',
    'lokaleregelgeving.overheid.nl',
    'zoekservice.overheid.nl',
    'cvdr.nl',
    'officielebekendmakingen.nl'
  ],
  [SourceTag.RECHTSPRAAK]: [
    'uitspraken.rechtspraak.nl',
    'rechtspraak.nl'
  ],
  [SourceTag.TUCHTRECHT]: [
    'tuchtrecht.overheid.nl'
  ],
  [SourceTag.BOETES]: [
    'boetebase.om.nl',
    'om.nl'
  ],
  [SourceTag.APV]: [
    'amsterdam.nl',
    'rotterdam.nl',
    'denhaag.nl',
    'utrecht.nl',
    'eindhoven.nl',
    'tilburg.nl',
    'groningen.nl',
    'almere.nl',
    'breda.nl',
    'nijmegen.nl',
    'enschede.nl',
    'haarlem.nl',
    'arnhem.nl',
    'zaanstad.nl',
    'haarlemmermeer.nl'
  ],
  [SourceTag.CAO]: [
    'cao-politie.nl',
    'arbeidsvoorwaarden.overheid.nl',
    'overheid.nl'
  ],
  [SourceTag.POLITIEBOND]: [
    'politiebond.nl',
    'politie.nl'
  ],
  [SourceTag.VAKBOND]: [
    'fnv.nl',
    'cnv.nl',
    'vcp.nl'
  ],
  [SourceTag.OVERHEID]: [
    'overheid.nl',
    'rijksoverheid.nl',
    'minvenj.nl',
    'minbzk.nl',
    'belastingdienst.nl',
    'cbr.nl',
    'rdw.nl',
    'igj.nl',
    'acm.nl',
    'afm.nl',
    'ienw.nl',
    'ilent.nl',
    'minbza.nl'
  ],
  [SourceTag.OFFICIEEL]: [
    'advocatenorde.nl',
    'kbn.nl',
    'notaris.nl',
    'veiligheidsregio.nl',
    'nctv.nl',
    'wodc.nl'
  ]
} 