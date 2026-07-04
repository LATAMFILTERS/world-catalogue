/**
 * terminology-registry.ts
 * ELIMFILTERS Engineering Knowledge Platform — Terminology Registry
 *
 * One registry. One definition per term. Every article references TERM-xxx
 * identifiers — no inline definitions are written in articles.
 *
 * Architecture reference: KC-PLAN-002 v1.1 — KC-00 Terminology Registry
 *
 * Rule: If a term does not exist in this registry, it must be added and
 * approved here before any article referencing it can reach 'engineering-approved'.
 */

import type { TerminologyEntry } from './governance';

export const TERMINOLOGY_REGISTRY: Record<string, TerminologyEntry> = {

  'TERM-BETA-RATIO': {
    id: 'TERM-BETA-RATIO',
    term: 'Beta Ratio',
    definition:
      'The ratio of the number of particles of a given size (x µm) upstream of a filter to the number of the same-sized particles downstream, as measured by the multi-pass test per ISO 16889. Expressed as β_x(c), where x is the particle size in micrometres and c denotes the counting method. A Beta ratio of 200 at 10 µm (β₁₀(c) = 200) means 200 upstream particles for every 1 downstream particle, corresponding to 99.5% single-pass efficiency.',
    aliases: ['ß ratio', 'filtration ratio', 'Beta-x', 'beta_x(c)'],
    applicableStandards: ['STD-ISO-16889'],
    relatedTerms: ['TERM-ABSOLUTE-EFFICIENCY', 'TERM-NOMINAL-EFFICIENCY'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-04',
  },

  'TERM-ABSOLUTE-EFFICIENCY': {
    id: 'TERM-ABSOLUTE-EFFICIENCY',
    term: 'Absolute Efficiency',
    definition:
      'Filter efficiency expressed as the percentage of particles of a specified size removed in a single pass through the filter element, derived from the Beta ratio. Absolute efficiency = (1 − 1/β_x(c)) × 100%. A β₁₀(c) of 200 corresponds to 99.5% absolute efficiency at 10 µm. Absolute efficiency ratings are measured under standardised multi-pass test conditions per ISO 16889.',
    aliases: ['single-pass efficiency', 'absolute filtration efficiency'],
    applicableStandards: ['STD-ISO-16889'],
    relatedTerms: ['TERM-BETA-RATIO', 'TERM-NOMINAL-EFFICIENCY'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-04',
  },

  'TERM-NOMINAL-EFFICIENCY': {
    id: 'TERM-NOMINAL-EFFICIENCY',
    term: 'Nominal Efficiency',
    definition:
      'A non-standardised efficiency rating indicating that a filter removes a stated percentage of particles at a stated size under single-pass conditions, without defining the specific test method used. Unlike absolute efficiency (ISO 16889 multi-pass), nominal efficiency ratings are not comparable across manufacturers because test conditions vary. Nominal ratings are not used in ELIMFILTERS engineering documentation; all efficiency claims reference ISO 16889 Beta ratio.',
    aliases: ['nominal filtration rating', 'nominal micron rating'],
    applicableStandards: ['STD-ISO-16889'],
    relatedTerms: ['TERM-BETA-RATIO', 'TERM-ABSOLUTE-EFFICIENCY'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-04',
  },

  'TERM-RESTRICTION': {
    id: 'TERM-RESTRICTION',
    term: 'Restriction',
    definition:
      'The pressure drop (ΔP) across an air filter element at a given airflow rate, measured in millibar (mbar) or inches of water column (inH₂O). Restriction increases as the filter element loads with contaminant. Service limits are reached when restriction exceeds the engine manufacturer\'s threshold — typically 25 mbar for naturally aspirated engines and 37.5–62.5 mbar for turbocharged engines. Measured per ISO 5011 and SAE J1539.',
    aliases: ['pressure drop', 'ΔP', 'intake restriction', 'air restriction'],
    applicableStandards: ['STD-ISO-5011', 'STD-SAE-J1539'],
    relatedTerms: ['TERM-DUST-HOLDING-CAPACITY'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-04',
  },

  'TERM-DUST-HOLDING-CAPACITY': {
    id: 'TERM-DUST-HOLDING-CAPACITY',
    term: 'Dust Holding Capacity',
    definition:
      'The total mass of standardised test dust (ISO 12103-1 A2 Fine) that a filter element retains before reaching its defined service restriction limit. Measured in grams (g) per ISO 5011 test protocol. Higher dust holding capacity at equivalent restriction extends service intervals. A primary performance metric for air intake filter selection alongside initial restriction and filtration efficiency.',
    aliases: ['DHC', 'dirt holding capacity', 'dust capacity'],
    applicableStandards: ['STD-ISO-5011', 'STD-SAE-J726'],
    relatedTerms: ['TERM-RESTRICTION'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-04',
  },

  'TERM-PROGRESSIVE-DENSITY-GRADIENT': {
    id: 'TERM-PROGRESSIVE-DENSITY-GRADIENT',
    term: 'Progressive Density Gradient',
    definition:
      'A filter media construction in which the fibre packing density increases progressively from the upstream (dirty) face to the downstream (clean) face of the filter element. The outer, lower-density zones capture large particles and act as pre-filters; the inner, higher-density zones capture fine particles at high efficiency. This gradient maximises dust holding capacity while maintaining low initial restriction and high overall filtration efficiency — the opposite of surface filtration, which loads rapidly at a single capture plane.',
    aliases: ['graded density', 'density gradient media', 'depth gradient construction'],
    applicableStandards: ['STD-ISO-16889', 'STD-ISO-5011'],
    relatedTerms: ['TERM-RESTRICTION', 'TERM-DUST-HOLDING-CAPACITY', 'TERM-BETA-RATIO'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-04',
  },

  'TERM-SERVO-VALVE': {
    id: 'TERM-SERVO-VALVE',
    term: 'Servo Valve',
    definition:
      'A high-precision hydraulic control valve that modulates hydraulic flow in proportion to an electrical input signal. Servo valves operate with internal clearances of 1–5 µm between spool and bore. Particle contamination above 3–5 µm in hydraulic fluid causes stiction, scoring of spool surfaces, and flow control degradation. ISO 16/14/11 or tighter cleanliness codes are required to protect servo valve performance and lifespan.',
    aliases: ['electrohydraulic servo valve', 'EHSV', 'proportional valve'],
    applicableStandards: ['STD-ISO-16889', 'STD-ISO-4406', 'STD-NFPA-T2-14'],
    relatedTerms: ['TERM-ISO-CLEANLINESS-CODE'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-04',
  },

  'TERM-VARNISH': {
    id: 'TERM-VARNISH',
    term: 'Varnish',
    definition:
      'An insoluble, soft to hard deposit formed on hydraulic and lubrication system surfaces when oil degradation products — oxidation byproducts, thermal breakdown products, and dissolved metals — precipitate out of solution. Varnish deposits appear as thin, lacquer-like films (0.1–5 µm thick) on valve spools, pump components, and heat exchanger surfaces. Varnish formation is accelerated by high temperatures (>80°C), aeration, and extended oil service intervals. It increases valve stiction, reduces heat transfer efficiency, and is a principal cause of proportional valve failure.',
    aliases: ['lacquer deposits', 'oil varnish', 'sludge precursors'],
    applicableStandards: [],
    relatedTerms: ['TERM-SERVO-VALVE'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-04',
  },

  'TERM-WATER-INGRESS': {
    id: 'TERM-WATER-INGRESS',
    term: 'Water Ingress',
    definition:
      'The entry of free water or emulsified water into a fuel, hydraulic, or lubrication system. Water ingress occurs through condensation in vented reservoirs, breather contamination, seal degradation, heat exchanger failure, and improper maintenance procedures. Water concentrations above 200 ppm in hydraulic fluid cause cavitation, accelerate bearing corrosion, reduce film strength, and enable microbial growth. In diesel fuel, water above 200 ppm causes injector stiction, corrosion, and microbial contamination. Measured by Karl Fischer titration per ASTM D6304 or ISO 12937.',
    aliases: ['water contamination', 'free water', 'dissolved water', 'emulsified water'],
    applicableStandards: ['STD-ASTM-D6304', 'STD-ISO-12937'],
    relatedTerms: [],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-04',
  },

  'TERM-ISO-CLEANLINESS-CODE': {
    id: 'TERM-ISO-CLEANLINESS-CODE',
    term: 'ISO Cleanliness Code',
    definition:
      'A three-number code defined by ISO 4406 that quantifies the particle contamination level in a fluid sample. Each number represents the quantity of particles per millilitre in a specific size range: the first number covers particles ≥4 µm(c), the second ≥6 µm(c), and the third ≥14 µm(c). Each code number represents a particle count range — code 16 = 320–640 particles/mL, code 14 = 80–160 particles/mL. A cleanliness code of 16/14/11 means: 320–640 particles ≥4 µm, 80–160 particles ≥6 µm, and 10–20 particles ≥14 µm per millilitre. Tighter codes (lower numbers) indicate cleaner fluid and reduce the risk of abrasive wear, valve stiction, and bearing failure.',
    aliases: ['ISO 4406 code', 'NAS code', 'fluid cleanliness target', 'cleanliness class'],
    applicableStandards: ['STD-ISO-4406'],
    relatedTerms: ['TERM-BETA-RATIO', 'TERM-SERVO-VALVE'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-04',
  },

};

// ── Registry helpers ──────────────────────────────────────────────────────────

/** Resolve a term by its permanent identifier. Returns undefined if not found. */
export function getTerm(id: string): TerminologyEntry | undefined {
  return TERMINOLOGY_REGISTRY[id];
}

/** Return all published terms. */
export function getPublishedTerms(): TerminologyEntry[] {
  return Object.values(TERMINOLOGY_REGISTRY).filter(t => t.status === 'published');
}

/** Resolve multiple term IDs to their entries (skips unknown IDs). */
export function resolveTerms(ids: string[]): TerminologyEntry[] {
  return ids.flatMap(id => {
    const t = TERMINOLOGY_REGISTRY[id];
    return t ? [t] : [];
  });
}
