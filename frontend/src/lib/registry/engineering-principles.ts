/**
 * engineering-principles.ts
 * ELIMFILTERS Engineering Intelligence Platform — Phase 1: Engineering Foundation
 *
 * Governed Engineering Principles Registry.
 * These are the physical/chemical/informational phenomena that
 * ELIMFILTERS Technology Architectures implement.
 *
 * EDR: EDR-B-001 — Why Engineering Principles Replaced Separation Mechanisms
 * EDR: EDR-B-002 — Why Five Engineering Science Domains Were Defined
 *
 * All entries at Maturity Level 3 (PUBLISHED) have been validated against
 * their referenced standards and are the authoritative definitions.
 * Same term, same definition — on every page that references it.
 */

import { MATURITY, type EngineeringPrinciple } from './registry-types';

export const ENGINEERING_PRINCIPLES: Record<string, EngineeringPrinciple> = {

  // ── SEPARATION SCIENCE ──────────────────────────────────────────────────

  'EP-SEP-001': {
    entityType: 'ENGINEERING_PRINCIPLE',
    id: 'EP-SEP-001',
    code: 'EP-SEP-001',
    name: 'Mechanical Filtration — Depth',
    scienceDomain: 'Separation Science',
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    definition:
      'Particle capture within the three-dimensional volume of a filter medium by interception, inertial impaction, and diffusion. Particles are retained throughout the medium depth — not only at the surface — enabling high dirt-holding capacity relative to surface filtration. Efficiency is characterized by Beta ratio (βx) per ISO 16889: the ratio of upstream to downstream particle counts at a given particle size x.',
    phenomenonDescription:
      'Three capture mechanisms operate simultaneously: (1) Interception — particles following a fluid streamline contact a fiber and adhere; (2) Inertial impaction — heavier particles deviate from streamlines due to inertia and impact fibers; (3) Diffusion — sub-micron Brownian-motion particles contact fibers through random displacement. Depth media leverages all three across multiple fiber layers.',
    standardRefs: ['ISO 16889', 'ISO 4406', 'SAE J1858'],
    implementedByTechnologies: [
      'TECH-MACROCORE', 'TECH-SYNTRAX', 'TECH-NANOFORCE',
      'TECH-HYDROCORE', 'TECH-MICROKAPPA', 'TECH-SYNTEPORE',
      'TECH-TURBOCORE', 'TECH-THERMACORE', 'TECH-DRYCORE',
      'TECH-INTEKCORE', 'TECH-MARINECLEAN',
    ],
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Engineering Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-B-001-v1.0',
      },
    ],
  },

  'EP-SEP-002': {
    entityType: 'ENGINEERING_PRINCIPLE',
    id: 'EP-SEP-002',
    code: 'EP-SEP-002',
    name: 'Mechanical Filtration — Surface',
    scienceDomain: 'Separation Science',
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    definition:
      'Particle capture at the upstream face of a filter medium where pore geometry prevents passage of particles larger than the rated pore size. Efficiency approaches 100% for particles above the absolute rating but dirt-holding capacity is limited to the surface area. Characterized by absolute micron rating and initial pressure drop per ISO 2941.',
    phenomenonDescription:
      'The medium acts as a mechanical sieve. Particles larger than the pore opening are physically blocked at the surface. Surface loading increases pressure drop and eventually reaches terminal differential pressure, requiring element replacement. Suitable when particle distribution is narrow and above the surface rating.',
    standardRefs: ['ISO 2941', 'ISO 3723', 'ISO 3724'],
    implementedByTechnologies: ['TECH-NANOFORCE', 'TECH-SYNTEPORE'],
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Engineering Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-B-001-v1.0',
      },
    ],
  },

  'EP-SEP-003': {
    entityType: 'ENGINEERING_PRINCIPLE',
    id: 'EP-SEP-003',
    code: 'EP-SEP-003',
    name: 'Inertial Separation',
    scienceDomain: 'Separation Science',
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    definition:
      'Separation of particles or liquid droplets from a carrier fluid by exploiting the difference in inertia between the fluid and its contaminants. When the fluid path changes direction, lower-inertia fluid molecules follow the streamline while higher-inertia contaminants continue on their prior trajectory, separating from the flow. No filter medium is required — the geometry of the housing produces the separation.',
    phenomenonDescription:
      'In cyclonic or turbine-rotation configurations, the fluid is set into rotational motion. Centrifugal acceleration drives denser contaminants (particles, water droplets) radially outward against the collection chamber wall, where they accumulate and settle. The clean fluid exits from the center of the rotation pattern. Separation efficiency increases with rotational velocity and contaminant-to-fluid density ratio.',
    standardRefs: ['ISO 16332', 'SAE J905'],
    implementedByTechnologies: ['TECH-MARINECLEAN'],
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Engineering Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-B-001-v1.0',
      },
    ],
  },

  'EP-SEP-004': {
    entityType: 'ENGINEERING_PRINCIPLE',
    id: 'EP-SEP-004',
    code: 'EP-SEP-004',
    name: 'Progressive Density Architecture',
    scienceDomain: 'Separation Science',
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    definition:
      'A multi-stage filter medium configuration in which fiber density increases from the fluid entry surface toward the fluid exit surface. Coarse particles are captured at the low-density outer zones; finer particles penetrate deeper and are captured at progressively denser inner zones. This distributes the particle load across the full medium depth, maximizing dirt-holding capacity while maintaining efficiency for fine particles.',
    phenomenonDescription:
      'Single-density media concentrates particle loading at the upstream face, causing rapid pressure-drop rise and premature blinding. Progressive density spreads capture events volumetrically: each zone captures the size class it is optimized for without exposing inner precision zones to macro-particles that the outer zones should intercept. Result: longer service life and more stable differential pressure profile over the service interval.',
    standardRefs: ['ISO 16889', 'ISO 19438', 'SAE J1858'],
    implementedByTechnologies: ['TECH-MACROCORE', 'TECH-SYNTRAX', 'TECH-TURBOCORE'],
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Engineering Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-B-001-v1.0',
      },
    ],
  },

  // ── PHASE SCIENCE ────────────────────────────────────────────────────────

  'EP-PHS-001': {
    entityType: 'ENGINEERING_PRINCIPLE',
    id: 'EP-PHS-001',
    code: 'EP-PHS-001',
    name: 'Coalescence',
    scienceDomain: 'Phase Science',
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    definition:
      'The process by which dispersed liquid droplets suspended in an immiscible carrier fluid are caused to merge into larger droplets through repeated surface contact with a coalescing medium, then separate from the carrier fluid by gravity or centrifugal force. Coalescence addresses emulsified and finely dispersed water in fuel where particle-size filtration alone is insufficient because the contaminant is liquid, not solid.',
    phenomenonDescription:
      'Dispersed water droplets (<20 µm) in diesel fuel cannot settle by gravity alone in normal service conditions — surface tension and flow turbulence keep them suspended. A coalescing medium provides high surface area where droplets repeatedly contact fibers. Each contact event causes partial merging (coalescence). As merged droplets grow above ~100 µm, gravitational settling force exceeds suspension forces and water drops fall to the collection sump. The principle operates independently of flow rate within design limits.',
    standardRefs: ['ASTM D6304', 'ISO 12937', 'ISO 16332'],
    implementedByTechnologies: ['TECH-HYDROCORE', 'TECH-TURBOCORE', 'TECH-SYNTEPORE', 'TECH-DRYCORE', 'TECH-MARINECLEAN'],
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Engineering Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-B-001-v1.0',
      },
    ],
  },

  'EP-PHS-002': {
    entityType: 'ENGINEERING_PRINCIPLE',
    id: 'EP-PHS-002',
    code: 'EP-PHS-002',
    name: 'Hydrophobic Repulsion',
    scienceDomain: 'Phase Science',
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    definition:
      'The property of a medium whose surface energy is sufficiently low that water molecules cannot wet or penetrate it regardless of differential pressure within design limits. Water contacts the hydrophobic surface, forms a bead, and cannot pass through — while hydrocarbon fuel molecules, being non-polar, pass freely. A passive water barrier requiring no active separation mechanism.',
    phenomenonDescription:
      'Surface energy of the medium is below the surface tension of water (~72 mN/m at 20°C). Water droplets arriving at the hydrophobic surface form high-contact-angle beads (>90°) and cannot spread or penetrate. The critical breakthrough pressure — the minimum differential pressure required to force water through — exceeds design operating pressures. At higher differential pressures, the barrier integrity must be verified by the manufacturer against operating conditions.',
    standardRefs: ['ASTM D6304', 'ISO 16332'],
    implementedByTechnologies: ['TECH-HYDROCORE', 'TECH-TURBOCORE'],
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Engineering Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-B-001-v1.0',
      },
    ],
  },

  // ── CHEMICAL ENGINEERING ─────────────────────────────────────────────────

  'EP-CHE-001': {
    entityType: 'ENGINEERING_PRINCIPLE',
    id: 'EP-CHE-001',
    code: 'EP-CHE-001',
    name: 'Adsorption',
    scienceDomain: 'Chemical Engineering',
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    definition:
      'The adhesion of gas molecules, dissolved contaminants, or moisture vapor to the surface of a solid adsorbent material through van der Waals forces (physisorption) or chemical bonding (chemisorption). Unlike absorption, adsorption is a surface phenomenon — contaminants accumulate on the adsorbent surface without penetrating its bulk. Applied to compressed air systems for moisture and oil vapor removal.',
    phenomenonDescription:
      'Desiccant materials (activated alumina, silica gel, molecular sieves) present enormous internal surface area (hundreds of m²/g). Gas molecules passing through the adsorbent bed contact the surface and adhere. Adsorption capacity is finite — breakthrough occurs when the adsorbent is saturated and additional contaminant molecules pass through unimpeded. Thermal regeneration or pressure swing restores capacity.',
    standardRefs: ['ISO 8573-1', 'ISO 8573-2', 'ISO 8573-3'],
    implementedByTechnologies: ['TECH-DRYCORE', 'TECH-MICROKAPPA', 'TECH-THERMACORE', 'TECH-MARINECLEAN'],
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Engineering Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-B-001-v1.0',
      },
    ],
  },

  'EP-CHE-002': {
    entityType: 'ENGINEERING_PRINCIPLE',
    id: 'EP-CHE-002',
    code: 'EP-CHE-002',
    name: 'Filtration Media Chemistry — Synthetic Fiber Engineering',
    scienceDomain: 'Chemical Engineering',
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    definition:
      'The design of filter media fiber composition, surface chemistry, and fiber geometry to achieve specific capture efficiency, dirt-holding capacity, and fluid compatibility targets. Synthetic fibers (polyester, glass microfiber, melt-blown polypropylene) are engineered at the fiber level — diameter, cross-section, surface treatment — to produce media characteristics that natural cellulose cannot achieve.',
    phenomenonDescription:
      'Fiber diameter directly controls particle capture efficiency for diffusion-dominated submicron capture (finer fibers increase capture probability). Fiber surface treatments modify hydrophilicity/hydrophobicity, chemical compatibility with specific fluids, and resistance to fiber migration under flow. Glass microfiber media achieves stable Beta ratios under high-temperature, high-differential-pressure conditions where cellulose media undergoes structural collapse.',
    standardRefs: ['ISO 16889', 'ISO 3968', 'ISO 3724'],
    implementedByTechnologies: ['TECH-SYNTRAX', 'TECH-NANOFORCE', 'TECH-SYNTEPORE'],
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Engineering Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-B-001-v1.0',
      },
    ],
  },

  // ── INSTRUMENTATION SCIENCE ──────────────────────────────────────────────

  'EP-INS-001': {
    entityType: 'ENGINEERING_PRINCIPLE',
    id: 'EP-INS-001',
    code: 'EP-INS-001',
    name: 'Particle Counting — Cleanliness Code Classification',
    scienceDomain: 'Instrumentation Science',
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    definition:
      'Quantification of particle concentration in hydraulic and lubricating fluids using automatic particle counting instruments, with results expressed as ISO 4406 cleanliness codes. The code format X/Y/Z represents the particle count ranges per milliliter at ≥4 µm, ≥6 µm, and ≥14 µm thresholds. Each ISO 4406 code number represents a particle count range that doubles with each increment.',
    phenomenonDescription:
      'Optical particle counters illuminate a fluid sample and detect light extinction events caused by particles passing through the measurement zone. The counter tallies particles by size class. The ISO 4406 reporting format compresses raw counts into codes: code 17 = 640–1,300 particles/mL; code 16 = 320–640 particles/mL, etc. The three-code format enables specification of cleanliness targets for different system sensitivities. Proportional valve systems targeting ISO 17/15/12 require finer filtration than systems tolerating ISO 19/17/14.',
    standardRefs: ['ISO 4406', 'ISO 11500', 'ISO 16889'],
    implementedByTechnologies: ['TECH-NANOFORCE', 'TECH-SYNTRAX', 'TECH-SYNTEPORE', 'TECH-DURATECH'],
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Engineering Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-B-001-v1.0',
      },
    ],
  },

  // ── TRIBOCHEMISTRY ───────────────────────────────────────────────────────

  'EP-TRB-001': {
    entityType: 'ENGINEERING_PRINCIPLE',
    id: 'EP-TRB-001',
    code: 'EP-TRB-001',
    name: 'Abrasive Wear Mechanism',
    scienceDomain: 'Tribochemistry',
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    definition:
      'The progressive removal of material from bearing and sliding surfaces by hard particles that are harder than the surface being abraded, creating micro-cutting or micro-plowing grooves on the softer surface. Two-body abrasion occurs when a hard particle is embedded in one surface and acts as a fixed cutting tool against the opposing surface. Three-body abrasion occurs when the particle is free to roll between both surfaces, causing damage to both.',
    phenomenonDescription:
      'Hard particles (silica, iron oxides, carbides) suspended in lubrication or hydraulic fluid transit bearing clearances. When a particle diameter approaches or exceeds the bearing oil film thickness (typically 2–8 µm for engine bearings, 0.5–3 µm for hydraulic valve bores), it contacts both bearing surfaces. Each contact event removes a microscopic volume of material. Cumulative material loss increases bearing clearance, reduces oil film integrity, accelerates wear rate non-linearly, and eventually causes bearing failure. Particle contamination above the ISO 4406 target is the primary controllable variable in abrasive wear rate.',
    standardRefs: ['ISO 4406', 'ASTM G40', 'ISO 15243'],
    implementedByTechnologies: ['TECH-SYNTRAX', 'TECH-NANOFORCE', 'TECH-MACROCORE', 'TECH-MARINECLEAN'],
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Engineering Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-B-001-v1.0',
      },
    ],
  },

  'EP-TRB-002': {
    entityType: 'ENGINEERING_PRINCIPLE',
    id: 'EP-TRB-002',
    code: 'EP-TRB-002',
    name: 'Cabin Air Filtration — Particulate and Chemical Protection',
    scienceDomain: 'Separation Science',
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    definition:
      'Removal of airborne particulate matter (PM10, PM2.5, PM1) and chemical contaminants from operator cabin air supply. Particulate removal uses mechanical filtration at defined ISO 11155-1 efficiency classes. Chemical protection uses activated carbon adsorption for gaseous contaminants (NOx, SOx, hydrocarbons, pesticides). Operator health protection is the governing design objective, not equipment protection.',
    phenomenonDescription:
      'PM10 particles (≤10 µm aerodynamic diameter) penetrate the upper respiratory tract. PM2.5 reaches the lower airways. PM1 and below reaches alveolar regions where gas exchange occurs. In mining and agricultural environments, respirable crystalline silica (RCS) — predominantly 0.5–5 µm — causes irreversible silicosis at chronic exposure levels above 0.05 mg/m³ (occupational exposure limit). Cabin air filtration at ISO 11155 Class E efficiency (>80% at 0.4 µm) intercepts RCS before operator inhalation. Chemical layer (activated carbon) adsorbs pesticide vapors in agricultural applications.',
    standardRefs: ['ISO 11155-1', 'ISO 11155-2', 'DIN 71220', 'EN 779'],
    implementedByTechnologies: ['TECH-MICROKAPPA'],
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Engineering Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-B-001-v1.0',
      },
    ],
  },

} as const;

/**
 * Returns all Engineering Principles at a given maturity level.
 * Platform surfaces must only consume Level 3 (PUBLISHED) principles.
 */
export function getPrinciplesByMaturity(
  level: (typeof MATURITY)[keyof typeof MATURITY]
): EngineeringPrinciple[] {
  return Object.values(ENGINEERING_PRINCIPLES).filter((p) => p.maturity === level);
}

/**
 * Returns Engineering Principles by science domain.
 */
export function getPrinciplesByDomain(domain: string): EngineeringPrinciple[] {
  return Object.values(ENGINEERING_PRINCIPLES).filter((p) => p.scienceDomain === domain);
}

/**
 * Returns the Engineering Principle that implements a given technology.
 * Used by Technology Architecture pages to generate principle links.
 */
export function getPrinciplesForTechnology(technologyId: string): EngineeringPrinciple[] {
  return Object.values(ENGINEERING_PRINCIPLES).filter((p) =>
    p.implementedByTechnologies.includes(technologyId)
  );
}
