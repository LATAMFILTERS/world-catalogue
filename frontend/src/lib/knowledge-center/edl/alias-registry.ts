/**
 * edl/alias-registry.ts
 * Engineering Data Layer — Alias Registry
 *
 * Semantic normalisation: maps common user search terms, colloquial names,
 * and variant spellings to canonical permanent identifiers in the EDL.
 *
 * Purpose: when a user or AI system uses any alias, it resolves to a single
 * canonical entity — preventing fragmented knowledge retrieval and enabling
 * consistent cross-linking.
 *
 * ID format: ALIAS-{CONCEPT}-{VARIANT} (uppercase, hyphenated)
 * Confidence:
 *   'exact'       — alias IS the canonical term (alternate official notation)
 *   'common'      — widely used synonym with clear single referent
 *   'colloquial'  — informal/regional term with context-dependent referent
 */

export interface AliasEntry {
  readonly id: string;                // ALIAS-xxx permanent ID
  readonly alias: string;             // The alias as typed by users or LLMs
  readonly canonicalId: string;       // Permanent ID this alias resolves to
  readonly canonicalType: 'STD' | 'TECH' | 'SYS' | 'FAM' | 'PROB' | 'TERM' | 'IND';
  readonly confidence: 'exact' | 'common' | 'colloquial';
  readonly notes?: string;            // Disambiguation note where needed
}

export type AliasRegistry = Record<string, AliasEntry>;

export const EDL_ALIASES: AliasRegistry = {

  // ── ISO 16889 Aliases ────────────────────────────────────────────────────

  'ALIAS-ISO16889-MULTIPASS': {
    id: 'ALIAS-ISO16889-MULTIPASS',
    alias: 'Multipass test',
    canonicalId: 'STD-ISO-16889',
    canonicalType: 'STD',
    confidence: 'common',
    notes: 'ISO 16889 is universally known in the industry as "the multi-pass test"',
  },

  'ALIAS-ISO16889-MULTIPASS-ALT': {
    id: 'ALIAS-ISO16889-MULTIPASS-ALT',
    alias: 'Multi-pass method',
    canonicalId: 'STD-ISO-16889',
    canonicalType: 'STD',
    confidence: 'common',
  },

  'ALIAS-ISO16889-BETA-TEST': {
    id: 'ALIAS-ISO16889-BETA-TEST',
    alias: 'Beta test',
    canonicalId: 'STD-ISO-16889',
    canonicalType: 'STD',
    confidence: 'colloquial',
    notes: 'Colloquially refers to ISO 16889 because it is the test that produces Beta ratio data',
  },

  'ALIAS-ISO16889-BETA-RATIO-TEST': {
    id: 'ALIAS-ISO16889-BETA-RATIO-TEST',
    alias: 'Beta ratio test',
    canonicalId: 'STD-ISO-16889',
    canonicalType: 'STD',
    confidence: 'common',
  },

  'ALIAS-ISO16889-FILTER-PERFORMANCE-TEST': {
    id: 'ALIAS-ISO16889-FILTER-PERFORMANCE-TEST',
    alias: 'Filter performance test (hydraulic)',
    canonicalId: 'STD-ISO-16889',
    canonicalType: 'STD',
    confidence: 'common',
  },

  // ── ISO 4406 Aliases ─────────────────────────────────────────────────────

  'ALIAS-ISO4406-CLEANLINESS-CODE': {
    id: 'ALIAS-ISO4406-CLEANLINESS-CODE',
    alias: 'ISO cleanliness code',
    canonicalId: 'STD-ISO-4406',
    canonicalType: 'STD',
    confidence: 'exact',
    notes: 'The formal descriptor for the ISO 4406 three-number code system',
  },

  'ALIAS-ISO4406-FLUID-CLEANLINESS': {
    id: 'ALIAS-ISO4406-FLUID-CLEANLINESS',
    alias: 'Fluid cleanliness code',
    canonicalId: 'STD-ISO-4406',
    canonicalType: 'STD',
    confidence: 'common',
  },

  'ALIAS-ISO4406-NAS-CODE': {
    id: 'ALIAS-ISO4406-NAS-CODE',
    alias: 'NAS code',
    canonicalId: 'STD-NAS-1638',
    canonicalType: 'STD',
    confidence: 'exact',
    notes: 'NAS codes come from NAS 1638, not ISO 4406; they are related but distinct systems',
  },

  'ALIAS-ISO4406-PARTICLE-CODE': {
    id: 'ALIAS-ISO4406-PARTICLE-CODE',
    alias: 'Particle cleanliness code',
    canonicalId: 'STD-ISO-4406',
    canonicalType: 'STD',
    confidence: 'common',
  },

  'ALIAS-ISO4406-CONTAMINATION-CODE': {
    id: 'ALIAS-ISO4406-CONTAMINATION-CODE',
    alias: 'Contamination class',
    canonicalId: 'STD-ISO-4406',
    canonicalType: 'STD',
    confidence: 'colloquial',
  },

  // ── ISO 5011 Aliases ─────────────────────────────────────────────────────

  'ALIAS-ISO5011-AIR-FILTER-TEST': {
    id: 'ALIAS-ISO5011-AIR-FILTER-TEST',
    alias: 'Air filter performance test',
    canonicalId: 'STD-ISO-5011',
    canonicalType: 'STD',
    confidence: 'common',
  },

  'ALIAS-ISO5011-INTAKE-TEST': {
    id: 'ALIAS-ISO5011-INTAKE-TEST',
    alias: 'Intake filter test',
    canonicalId: 'STD-ISO-5011',
    canonicalType: 'STD',
    confidence: 'common',
  },

  // ── Hydraulic Fluid Aliases → SYS-HYDRAULIC ─────────────────────────────

  'ALIAS-HYDRAULIC-OIL': {
    id: 'ALIAS-HYDRAULIC-OIL',
    alias: 'Hydraulic oil',
    canonicalId: 'SYS-HYDRAULIC',
    canonicalType: 'SYS',
    confidence: 'common',
    notes: '"Hydraulic oil" most commonly refers to the fluid and by extension the system it protects',
  },

  'ALIAS-HYDRAULIC-FLUID': {
    id: 'ALIAS-HYDRAULIC-FLUID',
    alias: 'Hydraulic fluid',
    canonicalId: 'SYS-HYDRAULIC',
    canonicalType: 'SYS',
    confidence: 'exact',
    notes: 'Preferred technical term for the working medium in hydraulic systems',
  },

  'ALIAS-HYDRAULIC-LUBRICANT': {
    id: 'ALIAS-HYDRAULIC-LUBRICANT',
    alias: 'Hydraulic lubricant',
    canonicalId: 'SYS-HYDRAULIC',
    canonicalType: 'SYS',
    confidence: 'colloquial',
    notes: 'Used in some regional contexts; preferred term is hydraulic fluid',
  },

  'ALIAS-HYDRAULIC-PRESSURE-FLUID': {
    id: 'ALIAS-HYDRAULIC-PRESSURE-FLUID',
    alias: 'Pressure fluid',
    canonicalId: 'SYS-HYDRAULIC',
    canonicalType: 'SYS',
    confidence: 'colloquial',
    notes: 'European (DIN) terminology for hydraulic fluid',
  },

  // ── HPCR / Common Rail Aliases → TECH-SYNTAPORE ────────────────────────

  'ALIAS-HPCR': {
    id: 'ALIAS-HPCR',
    alias: 'HPCR',
    canonicalId: 'TECH-SYNTAPORE',
    canonicalType: 'TECH',
    confidence: 'common',
    notes: 'High-Pressure Common Rail; the filtration technology protecting HPCR injectors is SYNTAPORE',
  },

  'ALIAS-COMMON-RAIL': {
    id: 'ALIAS-COMMON-RAIL',
    alias: 'Common rail',
    canonicalId: 'TECH-SYNTAPORE',
    canonicalType: 'TECH',
    confidence: 'common',
    notes: 'Common rail injection system filtration is the SYNTAPORE domain',
  },

  'ALIAS-HIGH-PRESSURE-COMMON-RAIL': {
    id: 'ALIAS-HIGH-PRESSURE-COMMON-RAIL',
    alias: 'High pressure common rail',
    canonicalId: 'TECH-SYNTAPORE',
    canonicalType: 'TECH',
    confidence: 'exact',
    notes: 'Full form of HPCR; the primary contamination protection technology is SYNTAPORE',
  },

  'ALIAS-HPCR-INJECTOR': {
    id: 'ALIAS-HPCR-INJECTOR',
    alias: 'HPCR injector protection',
    canonicalId: 'TECH-SYNTAPORE',
    canonicalType: 'TECH',
    confidence: 'exact',
  },

  'ALIAS-COMMON-RAIL-FUEL-FILTER': {
    id: 'ALIAS-COMMON-RAIL-FUEL-FILTER',
    alias: 'Common rail fuel filter',
    canonicalId: 'TECH-SYNTAPORE',
    canonicalType: 'TECH',
    confidence: 'common',
  },

  // ── Beta Ratio Aliases → TERM-BETA-RATIO ────────────────────────────────

  'ALIAS-BETA-RATIO-SYMBOL': {
    id: 'ALIAS-BETA-RATIO-SYMBOL',
    alias: 'ß ratio',
    canonicalId: 'TERM-BETA-RATIO',
    canonicalType: 'TERM',
    confidence: 'exact',
    notes: 'German symbol variant (ß) used interchangeably with β in older European documentation',
  },

  'ALIAS-BETA-VALUE': {
    id: 'ALIAS-BETA-VALUE',
    alias: 'Beta value',
    canonicalId: 'TERM-BETA-RATIO',
    canonicalType: 'TERM',
    confidence: 'exact',
  },

  'ALIAS-FILTRATION-RATIO': {
    id: 'ALIAS-FILTRATION-RATIO',
    alias: 'Filtration ratio',
    canonicalId: 'TERM-BETA-RATIO',
    canonicalType: 'TERM',
    confidence: 'exact',
    notes: 'Older formal term for Beta ratio; mathematically identical',
  },

  'ALIAS-BETA-X': {
    id: 'ALIAS-BETA-X',
    alias: 'Beta-x',
    canonicalId: 'TERM-BETA-RATIO',
    canonicalType: 'TERM',
    confidence: 'exact',
  },

  'ALIAS-BETA-10': {
    id: 'ALIAS-BETA-10',
    alias: 'Beta 10',
    canonicalId: 'TERM-BETA-RATIO',
    canonicalType: 'TERM',
    confidence: 'common',
    notes: 'Beta ratio at 10 µm particle size — the most commonly cited single value',
  },

  // ── Servo Valve Aliases → TERM-SERVO-VALVE ──────────────────────────────

  'ALIAS-PROPORTIONAL-VALVE': {
    id: 'ALIAS-PROPORTIONAL-VALVE',
    alias: 'Proportional valve',
    canonicalId: 'TERM-SERVO-VALVE',
    canonicalType: 'TERM',
    confidence: 'common',
    notes: 'Proportional valves have slightly wider clearances than servo valves but same contamination sensitivity classification',
  },

  'ALIAS-EHSV': {
    id: 'ALIAS-EHSV',
    alias: 'EHSV',
    canonicalId: 'TERM-SERVO-VALVE',
    canonicalType: 'TERM',
    confidence: 'exact',
    notes: 'Electrohydraulic servo valve — abbreviation used in aerospace and precision hydraulics',
  },

  // ── Varnish Aliases → TERM-VARNISH ──────────────────────────────────────

  'ALIAS-LACQUER-DEPOSITS': {
    id: 'ALIAS-LACQUER-DEPOSITS',
    alias: 'Lacquer deposits',
    canonicalId: 'TERM-VARNISH',
    canonicalType: 'TERM',
    confidence: 'exact',
    notes: 'European terminology for varnish deposits on hydraulic surfaces',
  },

  'ALIAS-OIL-VARNISH': {
    id: 'ALIAS-OIL-VARNISH',
    alias: 'Oil varnish',
    canonicalId: 'TERM-VARNISH',
    canonicalType: 'TERM',
    confidence: 'exact',
  },

  // ── Dust Holding Capacity Aliases → TERM-DUST-HOLDING-CAPACITY ──────────

  'ALIAS-DHC': {
    id: 'ALIAS-DHC',
    alias: 'DHC',
    canonicalId: 'TERM-DUST-HOLDING-CAPACITY',
    canonicalType: 'TERM',
    confidence: 'exact',
    notes: 'Standard abbreviation for Dust Holding Capacity',
  },

  'ALIAS-DIRT-HOLDING-CAPACITY': {
    id: 'ALIAS-DIRT-HOLDING-CAPACITY',
    alias: 'Dirt holding capacity',
    canonicalId: 'TERM-DUST-HOLDING-CAPACITY',
    canonicalType: 'TERM',
    confidence: 'exact',
  },

  'ALIAS-DUST-CAPACITY': {
    id: 'ALIAS-DUST-CAPACITY',
    alias: 'Dust capacity',
    canonicalId: 'TERM-DUST-HOLDING-CAPACITY',
    canonicalType: 'TERM',
    confidence: 'common',
  },

  // ── Restriction Aliases → TERM-RESTRICTION ──────────────────────────────

  'ALIAS-PRESSURE-DROP-AIR': {
    id: 'ALIAS-PRESSURE-DROP-AIR',
    alias: 'Pressure drop (air filter)',
    canonicalId: 'TERM-RESTRICTION',
    canonicalType: 'TERM',
    confidence: 'exact',
    notes: 'Pressure drop across an air filter element is the definition of restriction',
  },

  'ALIAS-INTAKE-RESTRICTION': {
    id: 'ALIAS-INTAKE-RESTRICTION',
    alias: 'Intake restriction',
    canonicalId: 'TERM-RESTRICTION',
    canonicalType: 'TERM',
    confidence: 'exact',
  },

  'ALIAS-DELTA-P-AIR': {
    id: 'ALIAS-DELTA-P-AIR',
    alias: 'ΔP (air filter)',
    canonicalId: 'TERM-RESTRICTION',
    canonicalType: 'TERM',
    confidence: 'exact',
  },

  // ── Karl Fischer Aliases → STD-ASTM-D6304 ───────────────────────────────

  'ALIAS-KARL-FISCHER-FUEL': {
    id: 'ALIAS-KARL-FISCHER-FUEL',
    alias: 'Karl Fischer titration',
    canonicalId: 'STD-ASTM-D6304',
    canonicalType: 'STD',
    confidence: 'common',
    notes: 'The KFT method is primarily identified with ASTM D6304 in petroleum/fuel context',
  },

  'ALIAS-KFT': {
    id: 'ALIAS-KFT',
    alias: 'KFT',
    canonicalId: 'STD-ASTM-D6304',
    canonicalType: 'STD',
    confidence: 'common',
    notes: 'Karl Fischer Titration abbreviation; ASTM D6304 is the petroleum industry standard',
  },

  // ── Mining Industry Aliases → IND-MINING ────────────────────────────────

  'ALIAS-MINING-EQUIPMENT': {
    id: 'ALIAS-MINING-EQUIPMENT',
    alias: 'Mining equipment filtration',
    canonicalId: 'IND-MINING',
    canonicalType: 'IND',
    confidence: 'common',
  },

  'ALIAS-OPEN-PIT-MINING': {
    id: 'ALIAS-OPEN-PIT-MINING',
    alias: 'Open pit mining',
    canonicalId: 'IND-MINING',
    canonicalType: 'IND',
    confidence: 'common',
  },

};

// ── Registry helpers ──────────────────────────────────────────────────────

/** Look up a canonical permanent ID by alias (case-insensitive). */
export function resolveAlias(alias: string): AliasEntry | undefined {
  const normalised = alias.toLowerCase().trim();
  return Object.values(EDL_ALIASES).find(
    e => e.alias.toLowerCase() === normalised
  );
}

/** Return all aliases that resolve to a given permanent ID. */
export function getAliasesFor(canonicalId: string): AliasEntry[] {
  return Object.values(EDL_ALIASES).filter(e => e.canonicalId === canonicalId);
}

/** Return all aliases with a given confidence level. */
export function getAliasesByConfidence(confidence: AliasEntry['confidence']): AliasEntry[] {
  return Object.values(EDL_ALIASES).filter(e => e.confidence === confidence);
}
