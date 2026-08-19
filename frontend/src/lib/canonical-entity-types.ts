export type TechnologyKey =
  | 'MACROCORE'
  | 'MICROKAPPA'
  | 'DRYCORE'
  | 'INTEKCORE'
  | 'SYNTAPORE'
  | 'HYDROCORE'
  | 'SYNTRAX'
  | 'NANOFORCE'
  | 'THERMACORE';

export type EcosystemKey = 'MARINECLEAN' | 'DURATECH';

export type SystemKey =
  | 'AIRFILTER'
  | 'CABIN'
  | 'COOLANT'
  | 'DRYER'
  | 'FUEL'
  | 'HOUSING'
  | 'HYDRAULIC'
  | 'KITS'
  | 'MARINE_SYSTEM'
  | 'OIL'
  | 'WATER';

export const CANONICAL_TECHNOLOGY_KEYS: ReadonlySet<TechnologyKey> = new Set<TechnologyKey>([
  'MACROCORE',
  'MICROKAPPA',
  'DRYCORE',
  'INTEKCORE',
  'SYNTAPORE',
  'HYDROCORE',
  'SYNTRAX',
  'NANOFORCE',
  'THERMACORE',
]);
