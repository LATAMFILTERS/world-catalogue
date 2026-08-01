/**
 * article-registry.ts
 * ELIMFILTERS Engineering Knowledge Platform — Article Registry
 *
 * KC-00 Governance: Master registry mapping all KC content entities to their
 * permanent identifiers, URL slugs, and section routing.
 *
 * This file is the single source of truth for:
 *   - Section definitions (key → route prefix, ID prefix)
 *   - Problem Graph stubs (PROB-xxx → slug → display metadata)
 *   - Glossary slug utilities (TERM-xxx ↔ URL slug)
 *
 * Engineering content (definitions, failure progressions, evidence) is
 * populated in Phase 3 (Engineering Data Layer). This registry provides
 * structural metadata only.
 */

import type { EntityStatus } from './governance';
import type { ProblemCategory, CanonicalProblemId } from './problem-types';
import { CANONICAL_PROBLEM_IDS } from './problem-types';

// ── Section Definitions ───────────────────────────────────────────────────────

export type KCSectionKey =
  | 'engineering'
  | 'engineering-reference'
  | 'standards'
  | 'systems'
  | 'technologies'
  | 'industries'
  | 'problems'
  | 'glossary';

export interface KCSectionDefinition {
  key: KCSectionKey;
  title: string;
  navLabel: string;
  description: string;
  routePrefix: string;
  idPrefix: 'ARTICLE' | 'STD' | 'SYS' | 'TECH' | 'IND' | 'PROB' | 'TERM';
}

export const KC_SECTION_DEFINITIONS: Record<KCSectionKey, KCSectionDefinition> = {
  engineering: {
    key: 'engineering',
    title: 'Engineering Articles',
    navLabel: 'Engineering',
    description: 'Technical articles on filtration engineering principles and applications.',
    routePrefix: '/knowledge-center/engineering',
    idPrefix: 'ARTICLE',
  },
  'engineering-reference': {
    key: 'engineering-reference',
    title: 'Engineering Reference Library',
    navLabel: 'Reference',
    description: 'Structured reference sections covering filtration science fundamentals.',
    routePrefix: '/knowledge-center/engineering-reference',
    idPrefix: 'ARTICLE',
  },
  standards: {
    key: 'standards',
    title: 'Industrial Standards',
    navLabel: 'Standards',
    description: 'ISO, ASTM, SAE, and NAS filtration standards with test methodology and application context.',
    routePrefix: '/knowledge-center/standards',
    idPrefix: 'STD',
  },
  systems: {
    key: 'systems',
    title: 'Protection Systems',
    navLabel: 'Systems',
    description: 'Asset protection system domains covering all major fluid and air filtration circuits.',
    routePrefix: '/knowledge-center/systems',
    idPrefix: 'SYS',
  },
  technologies: {
    key: 'technologies',
    title: 'Filtration Technologies',
    navLabel: 'Technologies',
    description: 'ELIMFILTERS proprietary filtration technology architectures and performance specifications.',
    routePrefix: '/knowledge-center/technologies',
    idPrefix: 'TECH',
  },
  industries: {
    key: 'industries',
    title: 'Industry Profiles',
    navLabel: 'Industries',
    description: 'Contamination exposure profiles and filtration requirements by industrial sector.',
    routePrefix: '/knowledge-center/industries',
    idPrefix: 'IND',
  },
  problems: {
    key: 'problems',
    title: 'Problem Graph',
    navLabel: 'Problems',
    description: 'Knowledge Graph of 15 canonical industrial equipment failure problems caused by contamination.',
    routePrefix: '/knowledge-center/problems',
    idPrefix: 'PROB',
  },
  glossary: {
    key: 'glossary',
    title: 'Terminology Glossary',
    navLabel: 'Glossary',
    description: 'Canonical definitions for engineering terms referenced across all Knowledge Center content.',
    routePrefix: '/knowledge-center/glossary',
    idPrefix: 'TERM',
  },
};

export function buildRoute(section: KCSectionKey, slug: string): string {
  return `${KC_SECTION_DEFINITIONS[section].routePrefix}/${slug}`;
}

// ── Problem Stub Registry ─────────────────────────────────────────────────────
// Structural metadata for all 15 canonical Problem entities (KC-11).
// Name, category, severity are KC-00 governance metadata — not engineering content.
// Full Problem entity data (definition, failureProgression, etc.) is Phase 3.

export interface ProblemSection {
  heading: string;
  body: string;
}

export interface ProblemFaqItem {
  question: string;
  answer: string;
}

export interface ProblemStub {
  id: CanonicalProblemId;
  slug: string;
  name: string;
  category: ProblemCategory;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: EntityStatus;
  relatedSystems?: string[];
  metaDescription?: string;
  definition?: string;
  sections?: ProblemSection[];
  faqs?: ProblemFaqItem[];
  relatedStandards?: string[];
  relatedTechnologies?: string[];
  keyParameters?: Array<{ label: string; value: string }>;
}

export const PROBLEM_STUBS: ProblemStub[] = [
  // Mechanical Wear (4)
  {
    id: CANONICAL_PROBLEM_IDS.ABRASIVE_WEAR,
    slug: 'abrasive-wear',
    name: 'Abrasive Wear',
    category: 'mechanical-wear',
    severity: 'critical',
    status: 'published',
    relatedSystems: ['lubrication-protection', 'hydraulic-protection', 'air-intake-protection'],
    metaDescription: 'Abrasive wear from hard particle contamination. Component sensitivity hierarchy, particle size damage thresholds, ISO 16889 filtration specifications.',
    definition: 'Abrasive wear is surface material removal caused by hard contaminant particles (silica, iron oxide, ceramic debris) trapped between moving surfaces under load. Particles >4 µm diameter indenting surfaces at contact stresses >1 GPa create micro-cutting grooves, generating wear debris particles and accelerating surface degradation. Wear rate increases exponentially with particle size and load.',
    relatedStandards: ['ISO 16889', 'ISO 4406', 'ISO 5011', 'SAE J1539', 'ISO 19438'],
    relatedTechnologies: ['MACROCORE', 'SYNTRAX', 'NANOFORCE', 'DURATECH'],
    sections: [
      {
        heading: 'Particle Size Damage Thresholds by Component',
        body: 'Different equipment components have specific particle size damage thresholds below which particles pass harmlessly and above which wear accelerates: (1) Proportional & servo control valves (spool clearances 1–4 µm) — particles >3–5 µm cause stiction and loss of control precision within 500–1000 hours; (2) Hydraulic motors & pumps (port clearances 10–15 µm) — particles >10–15 µm cause erosion of port plates and reduced volumetric efficiency, life reduced 50–70%; (3) Cylinders (rod seal clearances 20–50 µm) — particles >20–50 µm cause rod surface erosion and seal wear, though cylinders are most forgiving component; (4) Bearings (rolling element clearances 5–10 µm) — particles >4–6 µm directly enter bearing film, causing spalling and life reduction 70–90%; (5) Piston rings (gap clearances 0.05–0.15 mm) — particles >10 µm cause blow-by and compression loss. ISO 16889 filter specifications must target the most sensitive component in the system.',
      },
      {
        heading: 'Abrasive Wear Mechanisms Under Load',
        body: 'Three primary abrasive wear mechanisms cause surface damage: (1) Two-body abrasion — hard particle pressed between moving surfaces and one fixed surface, cutting both; wear rate ∝ normal load × particle size × distance traveled; (2) Three-body abrasion — hard particles rolling/sliding freely between surfaces, grinding both like sandpaper; less aggressive than two-body but volume of wear greater due to many particles involved simultaneously; (3) Erosive wear — high-velocity particle stream impacting surfaces at oblique angles, removing material by plastic deformation and fatigue; common in valves experiencing pressure transients. Ferrous particle generation rate increases exponentially once wear initiates — initial wear produces Fe particles which then cause secondary wear, creating a destructive positive feedback loop.',
      },
      {
        heading: 'Component Sensitivity Hierarchy',
        body: 'Industrial systems contain components with vastly different contamination sensitivity: CRITICAL sensitivity (must maintain 16/14/11 or tighter): proportional valves, servo control valves, variable displacement pumps, pressure-compensated units; HIGH sensitivity (18/16/13 acceptable): standard directional control valves, hydraulic motors, gear pumps, pressure relief valves; MODERATE sensitivity (20/18/15 acceptable): cylinders, accumulators, flow control valves; LOW sensitivity (21/19/16+ acceptable): suction strainers, reservoir breathers, return line filters. System cleanliness target is set by the MOST SENSITIVE component in that system. Adding a proportional valve to an otherwise simple cylinder system forces the entire system to maintain proportional valve cleanliness (16/14/11). Filter selection must be based on the system\'s most demanding component, not the average.',
      },
      {
        heading: 'Filtration Strategy: Stage-by-Stage Particle Removal',
        body: 'Total system abrasive wear prevention requires multi-stage filtration removing progressively smaller particles: (1) Air intake filtration — SAE J1539 or ISO 5011 filter capturing 99.5% of particles >25 µm before entering engine air intake; (2) Fuel filtration — 10 µm absolute (Beta 1000) water separator removing particulates and water before fuel injection; (3) Engine return line filtration — return to oil sump through 10 µm absolute filter (ISO 16/14/11 equivalent), cleaning all wear debris generated during operation; (4) Kidney-loop offline circulation — separate low-flow pump circulating lube oil through 3 µm absolute filter continuously, maintaining cleanliness indefinitely regardless of engine load; (5) Hydraulic system supply filtration — 10 µm absolute (Beta 1000) high-flow filter at pump inlet, protecting all valves and motors. Compounding effect: Each stage removes 99.5% of filtered-size particles, resulting in cumulative 99.5%^n contamination removal (for 5 stages, 99.97% total exclusion of >3 µm particles).',
      },
      {
        heading: 'Real-World Case: Mobile Equipment Abrasive Wear Prevention',
        body: 'Agricultural fleet, 12 combine harvesters, dusty environment (harvest season 6 months/year). Baseline: OEM commodity filtration (standard air filter + engine oil filter only). Problem: Extremely dusty harvest conditions (visible dust clouds during operation) causing accelerated engine wear. Engine teardowns after 4000 operating hours showed 300–400 µm piston ring wear (normal: 50 µm), piston scoring, bearing surface erosion. Oil analysis showed ISO 22/20/17 cleanliness (target should be 18/16/13 for mobile equipment). Implementation: (1) Upgraded air intake to ISO 5011 absolute filter (99.5% at 5 µm vs. 25 µm OEM spec); (2) Added return line 10 µm filter with kidney-loop offline circulation (MACROCORE + SYNTRAX combination); (3) Oil sampling every 250 hours during harvest season (normally every 500 hrs); (4) Preventive filter changes when ISO cleanliness approaches target + 1 level. Results: Oil cleanliness improved to 18/16/13 (within acceptable range). Engine teardowns at 4000 hrs showed <50 µm ring wear (normal wear rate restored). Bearing surface maintained baseline finish (no erosion). Extended engine overhaul interval from 4,000 hours to 10,000 hours (2.5× longer). Cost per engine hour reduced 58% through elimination of unscheduled repairs.',
      },
    ],
    faqs: [
      {
        question: 'Why does abrasive wear accelerate exponentially with particle size?',
        answer: 'Wear volume removed is proportional to particle diameter to the power of 2–3 (W ∝ d^2.2, per Archard wear model). A 10 µm particle causes ~100× more wear than a 1 µm particle. Additionally, large particles (>10 µm) penetrate lubrication films more easily, increasing direct surface-to-surface contact stress. This cubic relationship explains why reducing max particle size from 25 µm (OEM filter) to 5 µm (ISO 5011 filter) reduces wear by 125×.',
      },
      {
        question: 'How should system cleanliness targets be determined?',
        answer: 'Target cleanliness must be set by the system\'s MOST SENSITIVE component. If a hydraulic system contains a proportional control valve (requires 16/14/11), all other components in that system must be designed/filtered to maintain 16/14/11, even though cylinders could tolerate 21/19/16. Specifying cleanliness based on average component sensitivity guarantees premature failure of the most sensitive component. ISO 19438 provides component-specific cleanliness requirements.',
      },
      {
        question: 'What is the difference between two-body and three-body abrasive wear?',
        answer: 'Two-body abrasion: hard particle fixed against one surface (e.g., trapped in bearing raceway groove), cutting the opposing surface; causes deep gouges and severe localized wear. Three-body abrasion: hard particles rolling freely between two surfaces, grinding both like sandpaper; causes shallower wear over larger areas. Three-body wear is less localized but often more damaging overall due to volume of particles involved. Most industrial wear involves both mechanisms simultaneously.',
      },
      {
        question: 'Why is kidney-loop offline circulation more effective than relying on return-line filtration alone?',
        answer: 'Return-line filters clean oil only AFTER it circulates through the engine/system (contamination already present). Kidney-loop continuously circulates a portion of system fluid (5–10% of total volume per hour) through an independent high-efficiency filter, removing contamination regardless of system demand. This maintains target cleanliness indefinitely even under continuous dust ingression. Return-line filtering only prevents cleanliness from degrading FURTHER; kidney-loop actually improves cleanliness progressively.',
      },
      {
        question: 'How do particle size distributions change during operation?',
        answer: 'Initially, contamination is predominantly large particles (>10 µm) from dust ingression and assembly residue. As operation continues and two-body/three-body abrasive wear generates metal particles, distribution shifts toward fine particles (1–10 µm), which are MORE damaging to precision components. This is why oil analysis should track ISO 4406 codes across multiple size channels (>4 µm, >6 µm, >14 µm) — a shift toward larger numbers at smaller size thresholds indicates active abrasive wear generating fine debris.',
      },
    ],
    keyParameters: [
      { label: 'Critical particle size (bearings)', value: '>4 µm' },
      { label: 'Critical particle size (proportional valves)', value: '>3–5 µm' },
      { label: 'Optimal system cleanliness', value: 'ISO 18/16/13 minimum' },
      { label: 'Wear reduction (25µm→5µm filter)', value: '125× improvement' },
    ],
  },
  {
    id: CANONICAL_PROBLEM_IDS.ADHESIVE_WEAR,
    slug: 'adhesive-wear',
    name: 'Adhesive Wear',
    category: 'mechanical-wear',
    severity: 'high',
    status: 'draft',
    relatedSystems: ['lubrication-protection', 'hydraulic-protection'],
  },
  {
    id: CANONICAL_PROBLEM_IDS.BEARING_WEAR,
    slug: 'bearing-wear',
    name: 'Bearing Wear',
    category: 'mechanical-wear',
    severity: 'critical',
    status: 'published',
    relatedSystems: ['lubrication-protection', 'hydraulic-protection'],
    metaDescription: 'Bearing wear caused by contamination-accelerated abrasive wear. ISO 4406 cleanliness correlation and lifespan prediction.',
    definition: 'Bearing wear is the accelerated reduction in bearing clearance due to abrasive particle contamination in lubricating oil. Hard particles (silica, oxides, wear debris) trapped between bearing surfaces create micro-cutting action, leading to surface roughness increase, dimensional changes, and eventual seizure.',
    relatedStandards: ['ISO 16889', 'ISO 4406', 'SAE J1211', 'ISO 19438'],
    relatedTechnologies: ['SYNTRAX', 'MACROCORE', 'DURATECH'],
    sections: [
      {
        heading: 'Contamination-Wear Mechanism',
        body: 'Bearing wear accelerates in direct proportion to contamination levels. Hard particles (>4 µm) enter the bearing film and create micro-cutting grooves on both raceway and rolling element surfaces. This increases surface roughness from Ra 0.1 µm (new bearing) to 0.4–0.6 µm under heavy contamination. Cumulative wear reduces bearing internal radial clearance (typically 10–20 µm nominal) until contact stresses exceed material yield, causing spalling and seizure. The wear rate doubles for every step of ISO 4406 cleanliness code degradation (e.g., 16/14/11 → 17/15/12 doubles wear rate).',
      },
      {
        heading: 'ISO 4406 Cleanliness Correlation',
        body: 'Bearing lifespan depends critically on oil cleanliness measured by ISO 4406 codes. Industry empirical data shows: ISO 16/14/11 (optimal for bearings) → 15,000–25,000 operating hours; ISO 19/17/14 (acceptable) → 8,000–10,000 hours; ISO 22/20/17 (poor) → 2,000–3,000 hours. Each step tighter in cleanliness code extends bearing life 2–3 times. New oil from drums typically measures ISO 21/19/16; if motor target is 16/14/11, new oil must be filtered before use. The correlation is: Bearing Life = Base Life × (Cleanliness Factor) × (Load Factor) × (Speed Factor), where Cleanliness Factor ranges from 0.1 (contaminated) to 3.5 (optimal).',
      },
      {
        heading: 'Commodity vs. System Approach',
        body: 'Commodity approach: OEM specifies filter grade, operator installs commodity replacement and monitors oil change interval only. Typical result: ISO 22/20/17 oil condition after 500 hours, bearing life halved to 8,000 hours, unplanned overhauls every 3–4 years. System approach: Specify target cleanliness (16/14/11), install multi-stage filtration (air + fuel + return + kidney-loop offline), conduct quarterly ISO 4406 analysis, change filters preventively when code reaches target + 1 level. Typical result: Sustained 16/14/11, bearing life extended to 20,000+ hours, planned overhauls every 8–10 years, total cost 60% lower over equipment lifespan.',
      },
      {
        heading: 'Prevention: Multi-Stage Filtration',
        body: 'Bearing wear prevention requires controlling contamination entry at ALL points: (1) Air intake filtration (ISO 5011) removes 99.9% of dust before entering crankcase; (2) Fuel filtration (ASTM D6304 with water separator) prevents water and fuel particulates from reaching injectors and lube oil; (3) Return line filtration before reservoir (Beta 1000 @ 10 µm equivalent to ISO 16/14/11 cleanliness); (4) Kidney-loop offline circulation through high-efficiency filter (Beta 1000 @ 3 µm) maintains target cleanliness indefinitely even under continuous contamination ingression. Each stage removes progressively smaller contamination, achieving compounding effect: 99.9% × 99.5% × 99.5% × 99.9% = 99.97% total contamination exclusion.',
      },
      {
        heading: 'Real-World Case Study: Fleet Bearing Failure Prevention',
        body: 'Mining fleet, 10 haul trucks, Cummins QSL9 engines. Baseline: Commodity filtration, planned overhauls every 3 years ($8,500 per engine × 10 trucks × 1 event = $85,000 every 3 years). Bearing failure rate: 2–3 unplanned failures per year per truck (20–30 events fleet-wide). Implementation: Multi-stage filtration (SYNTRAX + MACROCORE + DURATECH), quarterly ISO 4406 sampling, kidney-loop offline circuit. Result: Oil cleanliness maintained 15/13/10 (tighter than OEM spec). Bearing failures: 0 in first 2 years. Planned overhauls extended to 8 years ($85,000 once per 8 years instead of every 3). Downtime reduction: 500+ unplanned hours/year → 20 hours/year. Cost impact: $250,000 annual savings per 10-truck fleet ($17,500 per truck/year) from reduced overhauls, downtime prevention, and extended equipment life.',
      },
    ],
    faqs: [
      {
        question: 'What is the relationship between oil cleanliness (ISO 4406 code) and bearing lifespan?',
        answer: 'Bearing life is exponentially dependent on oil cleanliness. Empirical bearing wear models (SKF, FAG, Timken) show that each step tighter in ISO 4406 code extends bearing life 2–3×. Example: ISO 16/14/11 oil yields 20,000 hrs bearing life; ISO 19/17/14 yields 8,000 hrs; ISO 22/20/17 yields 2,000–3,000 hrs. The difference between optimal (16/14/11) and poor (22/20/17) is a 7–10× reduction in bearing life. This relationship is quantified in ISO 19438 bearing life calculation methodology.',
      },
      {
        question: 'How do hard particles cause bearing wear?',
        answer: 'Hard contaminant particles (silica, iron oxide, wear debris >4 µm) are carried in the bearing lubricant film and become trapped between raceway and rolling element surfaces during rotation. Under load (bearing radial force typically 5–20 kN), the particle indents both surfaces, creating micro-cutting grooves. After millions of bearing cycles, cumulative grooves increase surface roughness (Ra 0.1 µm → 0.4–0.6 µm), which increases friction and wear rate exponentially. Eventually bearing clearance (nominal 10–20 µm) is consumed, leading to metal-to-metal contact, spalling, and seizure.',
      },
      {
        question: 'Why must new oil be filtered before adding to an engine?',
        answer: 'New hydraulic oil from drums typically measures ISO 21/19/16 or worse, contaminated during manufacturing, transport, and drum handling. If an engine targets ISO 16/14/11 for bearing protection, adding unfiltered new oil directly contaminates the system and negates weeks of filtration efforts. A 40-liter oil change at ISO 21/19/16 can increase system average cleanliness by 2–3 code levels. Best practice: Filter new oil through a portable transfer unit (10 µm absolute filter, equivalent to ISO 16 target) before introducing into the engine.',
      },
      {
        question: 'What is the difference between bearing life in lab tests vs. real-world operation?',
        answer: 'Lab bearing life (per ISO 281 basic dynamic load rating calculation) assumes consistent lubrication film, steady load, and negligible contamination. Real-world bearing life (actual hours to failure) is 30–70% shorter due to contamination particles disrupting the film, load transients (acceleration, braking) spiking contact stresses, and water/corrosive acids in oil. The "contamination factor" in ISO 19438 bearing life model (0.1–3.5) accounts for this gap. Optimal oil cleanliness brings real-world bearing life close to lab predictions; poor cleanliness drops it to 10–20% of lab life.',
      },
      {
        question: 'Can bearing wear be detected before catastrophic failure?',
        answer: 'Yes. Three methods: (1) Oil analysis — ferrous wear metals (Fe, Fe₂O₃) measured by ICP-OES increase 5–10× before bearing seizure, rising from baseline 10–20 ppm to 100–500 ppm over weeks; (2) Ultrasonic monitoring — early spalling produces high-frequency stress waves (>10 kHz) audible via ultrasonic meter before metal particles appear in oil; (3) Vibration analysis — bearing spall frequency increases from baseline <2 mm/s to >7–10 mm/s in ISO 20816 velocity spectrum. Condition-based maintenance programs monitor all three and trigger bearing replacement when trends accelerate.',
      },
    ],
    keyParameters: [
      { label: 'Optimal cleanliness', value: 'ISO 16/14/11' },
      { label: 'Bearing life (optimal)', value: '15,000–25,000 hrs' },
      { label: 'Bearing life (poor)', value: '2,000–3,000 hrs' },
      { label: 'Critical particle size', value: '>4 µm' },
    ],
  },
  {
    id: CANONICAL_PROBLEM_IDS.INJECTOR_WEAR,
    slug: 'injector-wear',
    name: 'Injector Wear',
    category: 'mechanical-wear',
    severity: 'high',
    status: 'draft',
    relatedSystems: ['fuel-cleanliness-protection'],
  },
  // Contamination (4)
  {
    id: CANONICAL_PROBLEM_IDS.SILICON_DUST,
    slug: 'silicon-dust-ingestion',
    name: 'Silicon Dust Ingestion',
    category: 'contamination',
    severity: 'critical',
    status: 'published',
    relatedSystems: ['air-intake-protection', 'lubrication-protection'],
  },
  {
    id: CANONICAL_PROBLEM_IDS.WATER_INGRESS,
    slug: 'water-ingress',
    name: 'Water Ingress',
    category: 'contamination',
    severity: 'high',
    status: 'published',
    relatedSystems: ['fuel-cleanliness-protection', 'lubrication-protection', 'hydraulic-protection'],
    metaDescription: 'Water contamination in fuel and oil systems. Microbial growth, corrosion, Karl Fischer testing (ASTM D6304).',
    definition: 'Water ingress is the entry and accumulation of water (free, emulsified, or dissolved) in fuel, lubricating oil, or hydraulic fluid systems. Water promotes microbial growth at fluid-water interfaces, accelerates oxidation and acid formation, corrodes fuel injectors and valve components, and reduces viscosity. Critical threshold: >200 ppm free water triggers exponential microbial growth and component damage.',
    relatedStandards: ['ASTM D6304', 'ISO 12937', 'ASTM D4378', 'ISO 3448'],
    relatedTechnologies: ['HYDROCORE', 'SYNTEPORE', 'TURBOCORE', 'DRYCORE'],
    sections: [
      {
        heading: 'Water Entry Pathways',
        body: 'Water enters fluid systems through multiple routes: (1) Tank breathing during temperature cycles and pressure changes — moisture-laden air enters tanks during cool-down; (2) Precipitation — rain water seeps through breather caps, filler access ports, or corroded tank seams; (3) Seal degradation — worn shaft seals and O-rings allow condensed water to enter hydraulic pump housing; (4) Humidity in new oil — drums packaged in humid environments absorb moisture through cardboard or vent holes; (5) Washdown — high-pressure water spray on equipment penetrates mechanical seals and breather systems. Tropical and coastal environments experience 10–20× higher water ingression rates due to humidity and salt spray.',
      },
      {
        heading: 'Microbial Growth at Water-Diesel Interface',
        body: 'Water-diesel mixtures create interfaces where microorganisms thrive. Three pathogenic families dominate fuel tanks: (1) Bacillus — aerobic bacteria forming biofilms at air-water interface, producing corrosive fatty acids and hydrogen sulfide; (2) Clostridium — anaerobic bacteria active in stagnant tank bottoms, consuming diesel and producing acids and methane; (3) Aspergillus — fungi forming visible black/brown slime, secreting mycotoxins that degrade elastomers and corrode steel. Microbial timeline: 100 ppm water → detectable microbial growth within 3–7 days; 200 ppm → exponential growth and visible biofouling within 2 weeks; 500+ ppm → thick biofilm deposits, filter clogging, and system contamination within 3–5 days.',
      },
      {
        heading: 'Failure Cascade: Injector & Component Damage',
        body: 'Water contamination progresses through a predictable 600-hour failure cascade: (1) 100–200 ppm water: Microbial growth initiates, biofouling begins at tank surfaces, subjective fuel smell changes (slight sulfur odor); (2) 200–300 ppm water: Microbial acid production increases, fuel pH drops to 4.5–5.0 (normal diesel pH 6.5–7.5), corrosion pitting on fuel system steel begins; (3) 300–500 ppm water: Emulsion forms (water suspended in fuel), filter bypass pressure increases, first injector deposits noticed, performance degradation begins (1–3% power loss); (4) 500–1000 ppm water: Complete emulsion, injector stiction common, fuel pressure control valve coking begins, fuel consumption increases 5–15%; (5) >1000 ppm water: System catastrophic failure within 2–5 days—injector needle seizure, fuel rail pressure collapse, complete loss of engine power. Microbial biomass visibly blocks fuel filters and screen elements.',
      },
      {
        heading: 'Karl Fischer Testing (ASTM D6304)',
        body: 'Karl Fischer coulometric titration is the ISO/ASTM standard for quantifying water in diesel fuel. The reaction: water (H₂O) + SO₂ + I₂ → H₂SO₄ + 2HI releases iodine equivalently to water content, measured by coulometric detector. Critical parameters: (1) Method — coulometric (ASTM D6304-A for <10 ppm accuracy) vs. titration (less accurate, ±5 ppm); (2) Sample handling — fuel samples must be sealed immediately after collection (exposure to air increases measured water by 50–100 ppm); (3) Calibration — instrument must be calibrated daily with known water standards (10 ppm, 50 ppm, 200 ppm); (4) Analysis frequency — quarterly baseline, monthly during rainy season, immediately after suspected water ingress event. Detection limit: 50–100 ppm threshold above which microbial activity becomes measurable. Action level: >200 ppm triggers immediate fuel system inspection and microbial treatment.',
      },
      {
        heading: 'Prevention: Multi-Layer Water Control',
        body: 'Water ingress prevention requires blocking entry routes and removing ingressed water: (1) Desiccant breathers (silica-gel type) replace standard air breathers, absorbing atmospheric moisture before humid air enters tank—reduces ingression 50–70%; (2) Water separator filters (HYDROCORE technology with coalescing media) capture free water at fuel filter stage, gravity-draining 95%+ of separated water before reaching injectors; (3) Fuel polishing units (portable or skid-mounted) with 3-micron particulate filter + water separator for proactive tank treatment; (4) Sealed fuel caps and inspection covers to minimize tank opening and moisture entry; (5) Regular tank cleaning every 2–3 years in humid climates, removing accumulated microbiota and sediment. Combined approach: desiccant breather + water separator filter + quarterly Karl Fischer testing reduces water-related failures to near zero.',
      },
      {
        heading: 'Tropical Fleet Operations Case Study',
        body: 'Tropical shipping fleet, 8 vessels, heavy fuel oil + diesel auxiliary engines. Baseline: Standard tank breathers, no water monitoring. Problem: 60% unplanned engine shutdowns per year due to fuel system contamination (suspected water ingress). Failure pattern: Every 4–6 weeks, 1–2 vessels experience fuel starvation caused by injector stiction, requiring 2–3 day port time for injector replacement ($18,000 per event). Implementation: (1) Desiccant breathers on all 16 fuel tanks (main + auxiliary); (2) Water separator filters (HYDROCORE dual-stage) on all fuel systems; (3) Monthly Karl Fischer testing on samples from each tank; (4) Annual fuel polishing service at major ports. Results: After 6 months, detected water levels <50 ppm on all tanks (vs. baseline 300–800 ppm during rainy season). Zero fuel-related shutdowns in year 1. Maintenance cost: $50,000 (breathers, filters, testing, polishing) reduced failures by ~$432,000 (8 vessels × 6 events/year × $9,000 per event). Net 6-month payback, 10-year savings: $4.3M+ per fleet.',
      },
    ],
    faqs: [
      {
        question: 'What water content level triggers microbial growth in diesel fuel?',
        answer: 'Microbial growth begins at 50–100 ppm free water and becomes exponential above 200 ppm. At 200 ppm, visible biofouling (biofilm, slime deposits) appears within 2 weeks. At 500+ ppm, thick microbial mats completely block fuel filters and cause system failure within days. Karl Fischer testing should trigger investigation at >100 ppm and immediate intervention (tank treatment, fuel polishing) at >200 ppm.',
      },
      {
        question: 'What is the 600-hour water contamination failure cascade?',
        answer: 'Water ingress progresses: 100 ppm (microbial growth initiation) → 200 ppm (emulsion forms, pH drops) → 300 ppm (injector deposits, performance loss) → 500 ppm (fuel control valve coking, consumption +15%) → 1000 ppm (system failure in 2–5 days). The cascade timeline depends on water ingression rate and tank volume, but system damage typically goes unnoticed until 300–500 ppm, when injector stiction becomes apparent.',
      },
      {
        question: 'How does Karl Fischer testing detect water in diesel?',
        answer: 'Karl Fischer coulometric titration (ASTM D6304) measures water by reacting it with iodine solution—the iodine consumption is proportional to water content. Coulometric detection provides ±0.5 ppm accuracy. Samples must be sealed immediately after collection and analyzed within 24 hours (fuel absorbs atmospheric moisture, creating false high readings). Calibration with known standards is required daily.',
      },
      {
        question: 'Can water separators remove all water from contaminated fuel?',
        answer: 'Water separator filters (coalescing media type like HYDROCORE) capture 95–98% of free and emulsified water. Dissolved water (molecular water in fuel solution, <50 ppm) passes through. For heavily contaminated fuel (>500 ppm water), a two-stage approach works best: (1) Primary water separator removes bulk free water, (2) Fuel polishing unit (portable filtration + water separation) removes remaining emulsion and dissolved water over several circulation cycles.',
      },
      {
        question: 'Why do tropical regions experience more water ingress failures?',
        answer: 'Tropical climates (high humidity, 70–95% relative humidity) cause: (1) rapid temperature-driven tank breathing cycles pulling moisture-laden air into tanks; (2) condensation on tank walls during cool-night cycles; (3) precipitation penetrating aged breather systems; (4) microorganism growth rate 3–5× faster due to heat and humidity. Desiccant breathers are 3–4× more critical in tropical regions than temperate climates.',
      },
    ],
    keyParameters: [
      { label: 'Critical water threshold', value: '200 ppm' },
      { label: 'Microbial growth onset', value: '50–100 ppm' },
      { label: 'System failure timeline', value: '500–1000 ppm → 2–5 days' },
      { label: 'Testing standard', value: 'ASTM D6304 (Karl Fischer)' },
    ],
  },
  {
    id: CANONICAL_PROBLEM_IDS.FUEL_CONTAMINATION,
    slug: 'fuel-contamination',
    name: 'Fuel Contamination',
    category: 'contamination',
    severity: 'high',
    status: 'published',
    relatedSystems: ['fuel-cleanliness-protection'],
    metaDescription: 'Fuel contamination: HPCR injector damage, particulate & water ingress, biodiesel compatibility. ASTM D6304 water testing.',
    definition: 'Fuel contamination refers to solid particles (>4 µm), water (free or emulsified), and microorganisms suspended in diesel or biodiesel fuel. Modern high-pressure common rail (HPCR) injectors with 0.1–0.15 mm nozzle orifices and 0.5–1 µm valve seats are extremely sensitive to particulate and water contamination, failing catastrophically within 500–1000 hours of exposure to contaminated fuel.',
    relatedStandards: ['ASTM D6304', 'ISO 12937', 'ASTM D4378', 'ISO 16332'],
    relatedTechnologies: ['HYDROCORE', 'SYNTEPORE', 'TURBOCORE', 'DRYCORE'],
    sections: [
      {
        heading: 'HPCR Injector Design & Contamination Sensitivity',
        body: 'High-pressure common rail (HPCR) injectors operate at 1600–2000 bar (vs. 200–400 bar in legacy systems). This extreme pressure requires microscopic orifice dimensions: nozzle tip holes 0.1–0.15 mm diameter, pilot valve spool clearances 0.5–1 µm, needle valve seats shaped to ±0.05 mm tolerance. These tolerances are 10–100× tighter than other fuel system components. A single hard particle >4 µm entering a 0.1 mm orifice becomes a "stone in a dam" — blocking fuel flow and causing misfires or complete injector shutdown. Water droplets coalescing into slug flow can jam needle valves in milliseconds.',
      },
      {
        heading: 'Particle Damage Modes in HPCR Injectors',
        body: 'Three failure modes result from particulate contamination: (1) Orifice blockage — particles >4 µm lodging in 0.1–0.15 mm nozzle holes, restricting spray pattern and causing uneven fuel distribution, rough idle, visible white smoke (unburned fuel); (2) Stiction (stick-slip) — particles embedding in needle valve seat surfaces, creating micro-friction spikes that seize the valve intermittently; stiction causes delayed fuel delivery (injection timing wander), extended cranking times, harder starting; (3) Erosion/pitting — particles striking needle valve surfaces during high-speed needle motion (opening/closing 25,000 cycles/second), micro-cutting valve seat surface and destroying sealing geometry. Pitting depth >10 µm on a 0.5 µm seat is total valve destruction. All three modes cause injector replacement ($800–1200 per injector × 6–8 injectors per engine = $4800–9600 per failure event). Modern OEM warranties void coverage for contaminated fuel failures.',
      },
      {
        heading: 'Water Contamination in HPCR Systems',
        body: 'Water in HPCR fuel causes four failure mechanisms: (1) Corrosion of injector components — free water reacts with acidic compounds in diesel (sulfuric acid from fuel oxidation), pitting injector bore and needle valve surfaces within 100–200 operating hours; (2) Microorganism growth — water-diesel interfaces host Bacillus and Clostridium bacteria, producing corrosive organic acids (acetate, butyrate) that accelerate corrosion 3–5×; (3) Emulsion formation — water suspended in diesel as tiny droplets blocks capillary fuel passages (pilot fuel drain lines 0.5–1 mm diameter), causing injector pressure starvation and malfunction; (4) Cavitation in high-pressure fuel rail — water vapor bubbles form during fuel expansion through injector orifices, collapsing violently and damaging orifice walls. Critical threshold: >100 ppm water triggers measurable corrosion; >200 ppm initiates microorganism growth; >300 ppm causes visible performance degradation (rough idle, white smoke, injector knock); >500 ppm system failure within 1–2 weeks.',
      },
      {
        heading: 'Biodiesel-Specific Contamination Sensitivity',
        body: 'Biodiesel blends (B5–B100) increase fuel contamination sensitivity 2–3×: (1) Hygroscopicity — biodiesel absorbs atmospheric moisture 2–3× faster than conventional diesel; tanks storing B20+ must use desiccant breathers and sealed access caps; (2) Microorganism preference — Bacillus and Aspergillus proliferate faster in biodiesel fuel than conventional diesel, with growth rates 3–5× higher at equivalent water levels; (3) Injector corrosion — biodiesel-compatible elastomers (nitrile, EPDM) in HPCR injectors swell slightly in biodiesel, reducing needle valve clearances and increasing stiction risk from particles >2 µm (vs. >4 µm in conventional diesel injectors); (4) Oxidative instability — biodiesel oxidizes faster than conventional diesel, producing polar oxidation products that promote water absorption and microorganism growth. ASTM D6304 water testing is MANDATORY for biodiesel-blended fuel every 100 operating hours (vs. quarterly for conventional diesel).',
      },
      {
        heading: 'Fuel Filtration & Protection Strategy',
        body: 'HPCR fuel protection requires multiple filtration stages: (1) Bulk fuel storage filtration — 25 µm particle filter + water separator tank-inlet filter preventing new oil contamination during transfer into vehicle tanks; (2) Primary fuel filter (main filter) — 10 µm absolute (Beta 1000 @ 10 µm) removing particles and 90–95% free water before fuel reaches fuel pump; (3) Secondary fuel filter (fine filter) — 4 µm absolute or tighter (Beta 1000 @ 4 µm), protecting HPCR fuel rail and injectors from finer particles; (4) Pilot fuel drain filtration — 10 µm filter on injector pilot fuel return circuit, preventing wear particles from pilot spool degradation from re-circulating into main fuel rail. Modern ELIMFILTERS SYNTEPORE + HYDROCORE combination provides sequential 10 µm + 4 µm particle removal + water separation (95%+ efficiency at free water level) in a single cartridge, meeting HPCR protection requirements. Fuel polishing of existing tanks (portable 3 µm filter + water separator cart) required when transitioning to biodiesel blends.',
      },
      {
        heading: 'Heavy-Duty Diesel Fleet Fuel Contamination Prevention',
        body: 'Regional distribution fleet, 25 class-8 trucks, fuel stored in on-site 5000-gallon bulk tank. Problem: Frequent injector failures (2–3 failures per truck per year, total 50–75 injector replacements annually at $800 each = $40K–60K/year). Investigation: Fuel samples showed 300–500 ppm water (from tank venting, precipitation), ISO cleanliness 22/20/16. Implementation: (1) Desiccant breather on bulk tank (prevents rain water and humid air ingress); (2) 25 µm pre-filter on fuel transfer pump (vehicle fill-up line); (3) Dual-stage in-vehicle filtration — SYNTEPORE 10 µm primary + HYDROCORE 4 µm secondary with integrated water separator; (4) Monthly Karl Fischer testing on bulk tank; (5) Annual fuel polishing service when water exceeded 50 ppm. Results: Fuel water reduced from 300–500 ppm to <50 ppm (below microbial growth threshold). Injector failures dropped to 0–1 per truck per year (92% reduction). Maintenance cost savings: $38K–60K annually. ROI: Equipment investment ($3K per truck × 25 = $75K) recovered in 1.5 years, then $40K+ annual savings. 5-year savings: $175K+ per fleet.',
      },
    ],
    faqs: [
      {
        question: 'Why are HPCR injectors so sensitive to fuel contamination compared to older fuel systems?',
        answer: 'HPCR injectors operate at 1600–2000 bar (vs. 200–400 bar in legacy systems) and have microscopic clearances: 0.1–0.15 mm nozzle orifices, 0.5–1 µm needle valve seats. These tolerances are 10–100× tighter than older systems. A 4 µm particle blocking a 0.1 mm orifice is relatively larger than a boulder in a tunnel, whereas older systems with 0.3–0.5 mm injector passages are more forgiving.',
      },
      {
        question: 'What is injector stiction and how does contamination cause it?',
        answer: 'Stiction (stick-slip) occurs when particles embed in needle valve seat surfaces, creating intermittent friction that causes needle valves to jam momentarily during opening/closing. This delays fuel injection timing by 1–5 milliseconds, causing rough idle, white smoke (unburned fuel), and hard starting. Stiction worsens until particles wear grooves into valve seats, causing permanent seal damage and injector replacement.',
      },
      {
        question: 'Why must biodiesel blends receive more frequent fuel testing than conventional diesel?',
        answer: 'Biodiesel is hygroscopic (absorbs moisture 2–3× faster than conventional diesel) and supports faster microorganism growth (3–5× rate increase). Additionally, biodiesel-compatible elastomers in HPCR injectors swell slightly, reducing needle valve clearances from 1–2 µm to 0.5–1 µm, increasing sensitivity to particles >2 µm. ASTM D6304 testing recommended every 100 hours for biodiesel vs. every 500 hours for conventional diesel.',
      },
      {
        question: 'How do water separators prevent injector water damage?',
        answer: 'Coalescing water separator filters (HYDROCORE technology) use oleophobic (water-attracting) media that allows diesel to pass while capturing water droplets. Captured water droplets coalesce into larger drops that sink and drain by gravity at the bottom of the filter bowl. This removes 90–95% of free water before fuel reaches the HPCR fuel rail. Emulsified water (tiny droplets dispersed throughout fuel) requires additional fuel polishing via portable tank treatment systems.',
      },
      {
        question: 'What is the critical water level that causes HPCR injector corrosion?',
        answer: 'Free water >100 ppm begins measurable corrosion of HPCR injector components within 100–200 operating hours. Microorganism growth (which accelerates corrosion via organic acid production) initiates at 50–100 ppm and becomes aggressive at >200 ppm. Action level: >100 ppm requires investigation; >200 ppm triggers immediate fuel system treatment (water separation + tank polishing); >500 ppm system should not be operated until fuel is cleaned.',
      },
    ],
    keyParameters: [
      { label: 'HPCR injector orifice size', value: '0.1–0.15 mm' },
      { label: 'Needle valve seat clearance', value: '0.5–1 µm' },
      { label: 'Critical water threshold', value: '100 ppm' },
      { label: 'HPCR protection target', value: '<4 µm particles' },
    ],
  },
  {
    id: CANONICAL_PROBLEM_IDS.AIR_RESTRICTION,
    slug: 'air-restriction',
    name: 'Air Restriction',
    category: 'contamination',
    severity: 'high',
    status: 'published',
    relatedSystems: ['air-intake-protection'],
    metaDescription: 'Air intake filter restriction: bypass valve activation, volumetric efficiency loss, ISO 5011 testing. Premium air filter life extension.',
    definition: 'Air restriction occurs when air intake filters become saturated with dust, increasing pressure differential across the filter beyond bypass valve setpoint (typically 60–80 mbar). When bypass activates, unfiltered air bypasses the filter element and enters the engine, reintroducing contamination directly into the intake manifold and cylinders.',
    relatedStandards: ['ISO 5011', 'SAE J1539', 'SAE J726', 'ISO 5636'],
    relatedTechnologies: ['MACROCORE', 'DRYCORE', 'DURATECH'],
    sections: [
      {
        heading: 'Air Intake Filter Bypass Mechanism',
        body: 'Air intake filters are equipped with pressure relief bypass valves that open when filter restriction exceeds 60–80 mbar (typical setpoint). The bypass is a safety feature preventing engine starvation if the filter becomes completely blocked. However, bypass activation means unfiltered air containing 100% of ambient dust contamination enters the engine directly. Modern engines with mass airflow (MAF) sensors and intake air temperature sensors detect bypass activation as a sudden drop in inlet air density and adjust fuel injection, but they cannot prevent the physical damage from abrasive particles. Bypass activation is a FAILURE indicator, not normal operation. Most OEM warranties do NOT cover damage from bypass activation — it is considered operator negligence (failure to change filter on schedule).',
      },
      {
        heading: 'Volumetric Efficiency Loss from Restriction',
        body: 'Engine power and fuel consumption are directly affected by air intake restriction: (1) Clean filter (0–20 mbar): 100% volumetric efficiency, rated power output, baseline fuel consumption; (2) Moderate restriction (20–40 mbar): Volumetric efficiency drops to 95–98%, power output reduced 2–5%, fuel consumption increases 1–3% (engine works harder to pull air through restriction); (3) High restriction (40–60 mbar): Volumetric efficiency 85–92%, power reduced 8–15%, fuel consumption increases 5–12%, visible torque loss on acceleration; (4) Critical restriction (>60–80 mbar, bypass imminent): Volumetric efficiency <80%, power reduced >15%, fuel consumption increases >15%, bypass valve may activate intermittently creating surging sensation. Extended operation at high restriction (40–60 mbar) increases fuel cost by $2–3 per gallon equivalent — on 200,000 annual miles at 6 MPG, an extra $2000–3000 per year fuel cost. Premium air filter life extension (150%+ intervals) pays for itself through fuel savings alone.',
      },
      {
        heading: 'Dust Ingestion Damage Without Bypass',
        body: 'When bypass valve activates due to filter saturation, unfiltered dust enters cylinders directly. Dust particle size distribution in outdoor air: 60–70% between 2–10 µm (respirable particle size), 20–30% between 10–50 µm, remainder >50 µm. The 2–10 µm fraction is most damaging — particles small enough to penetrate the oil film and land on piston crown and cylinder walls. Damage mechanisms: (1) Piston crown erosion — dust particles at combustion chamber temperatures (2000+ K) oxidize and create micro-indentations on piston crown surface, increasing surface roughness and heat transfer to oil film; (2) Piston ring stiction — dust accumulation in ring grooves increases friction and reduces ring sealing pressure; (3) Cylinder wall glazing loss — abrasive particles wear the fine cross-hatch finish required for oil film attachment, degrading ring sealing and increasing blow-by; (4) Valve seat wear — dust particles entering exhaust flow strike valve seats and stems, causing erosion and stiction. Cumulative effect of even 100 hours of bypass operation (dust ingestion): piston ring wear rate increases 5–10×, engine oil cleanliness degrades to ISO 22/20/17, bearing life reduced 50%. A single bypass event from a clogged filter can shorten remaining engine life by 20–30%.',
      },
      {
        heading: 'ISO 5011 Air Filter Testing & Rating',
        body: 'ISO 5011 is the international standard for air intake filter testing. Test procedure: (1) Dust challenge — standardized Arizona test dust (A2 medium, ISO 12103-1) is injected into airstream feeding through the filter element; (2) Efficiency measurement — upstream and downstream dust concentration measured at ≥4 µm size range via automatic particle counters (ISO 11171-calibrated); (3) Dirt holding capacity — test continues until terminal differential pressure (3 kPa, equivalent to ~30 mbar) is reached, measuring total dust mass captured; (4) Reporting — Beta ratio reported at 4 µm (efficiency), 14 µm (larger particle efficiency), and 21 µm (coarse efficiency); dirt holding capacity in grams. Example: MACROCORE air filter achieves β4 = 1000 (99.9% @ 4 µm) and holds 300 grams dust before reaching 30 mbar vs. standard OEM filter β4 = 75 (98.7%) holding 100 grams. Result: MACROCORE provides 2× efficiency at smaller particle size and 3× dirt capacity, enabling 150–200% interval extension (change every 15,000 miles instead of 10,000).',
      },
      {
        heading: 'Air Filter Interval Extension & Cost Analysis',
        body: 'Premium air filters with higher dirt capacity (MACROCORE technology) enable extended change intervals: Standard OEM filter (100 gram capacity): change every 10,000 miles, cost $35 per filter × 20 changes per 200,000 miles = $700. Premium MACROCORE filter (300 gram capacity, 99.9% efficiency @ 4 µm): change every 15,000 miles, cost $65 per filter × 13 changes per 200,000 miles = $845. Additional cost: $145 for 200,000 miles. Fuel efficiency gain: Premium filter maintains <20 mbar restriction (vs. OEM reaching 50+ mbar by end of interval) → fuel consumption stays within 1% of clean filter vs. 10% penalty with OEM filter → additional fuel cost OEM = 200,000 miles ÷ 6 MPG × $2 extra fuel efficiency loss ÷ 4 = $16,700 additional fuel cost. Net benefit premium filter: $16,700 fuel savings - $145 additional filter cost = $16,555 savings over 200,000 miles ($0.083 per mile).',
      },
      {
        heading: 'Desert & Dusty Environment Air Filtration Case Study',
        body: 'Mining haul truck fleet, 8 vehicles, open-pit copper mine in Arizona (extremely dusty environment). Baseline: OEM standard air filters changed every 5000 miles due to heavy dust ingestion (vs. 10,000 miles in normal environments). Problem: Frequent bypass activation (20+ times per month per vehicle), recirculated unfiltered dust increasing wear debris in lube oil to ISO 23/21/18 levels, engine overhauls required every 8000 hours instead of 12,000 hours planned. Implementation: Upgrade to MACROCORE premium air filter (3× dirt capacity, 99.9% @ 4 µm efficiency) with extended change interval to 7500 miles. Install kidney-loop offline lube oil filtration (SYNTRAX + DURATECH) to clean oil from bypass events. Results: Bypass activations dropped from 20/month to 0/month (eliminated by higher capacity filter maintaining <30 mbar even in heavy dust). Oil cleanliness improved from ISO 23/21/18 to ISO 18/16/13 (maintained by kidney-loop). Engine overhaul interval extended to 12,000 hours as designed. Annual savings per fleet: 8 vehicles × ($8500 overhaul - no longer needed) × 1 overhaul prevented = $68,000 eliminated. Filter cost increase: negligible (premium filter offsets by 1.5× interval extension). Net benefit: $68,000/year from prevented overhauls.',
      },
    ],
    faqs: [
      {
        question: 'When does an air intake filter bypass valve activate and what happens then?',
        answer: 'Bypass valve activates when filter differential pressure exceeds 60–80 mbar (typical setpoint). This occurs when accumulated dust saturates the filter media and creates excessive airflow resistance. Once bypass activates, unfiltered ambient air (100% of dust contamination) bypasses the element and enters the engine directly. Bypass activation indicates the filter is overdue for replacement — continuing operation with bypass active causes rapid increase in engine wear particles and lube oil contamination.',
      },
      {
        question: 'How does air filter restriction increase fuel consumption?',
        answer: 'Air filter restriction reduces volumetric efficiency — the engine must work harder to pull air through the clogged filter. This reduces oxygen availability for combustion, so the engine compensates by injecting more fuel to maintain power. At 40–60 mbar restriction, fuel consumption increases 5–12%. An engine burning 100 gallons per 10,000 miles with a clean filter may burn 105–112 gallons with a clogged filter — costing $10–24 extra per 10,000 miles. Over a vehicle lifespan (200,000 miles), accumulated fuel cost penalty from running restricted air filters is $200–480.',
      },
      {
        question: 'What damage occurs when unfiltered dust enters cylinders?',
        answer: 'Unfiltered dust (2–50 µm particles) entering cylinders causes: (1) piston crown erosion — dust at combustion temperatures oxidizes and micro-cuts piston surface; (2) cylinder wall wear — abrasive particles wear the cross-hatch honing finish, degrading oil film retention and ring sealing; (3) piston ring stiction — dust accumulation in ring grooves increases friction; (4) valve seat erosion — dust particles in exhaust flow strike valve seats and stems. A single 100-hour period of bypass operation (dust ingestion) can reduce remaining engine life by 20–30%.',
      },
      {
        question: 'Why do premium air filters with higher dirt capacity reduce bypass risk?',
        answer: 'Premium filters (MACROCORE technology) hold 2–3× more dust mass before reaching bypass pressure (e.g., 300 grams vs. 100 grams). Higher dirt capacity means the filter does not saturate and activate bypass as quickly. Additionally, premium filters have more efficient media (99.9% @ 4 µm vs. 98–99%) capturing finer particles that would otherwise cause faster restriction buildup. Extended intervals (150%+ longer) reflect the combination of higher capacity + efficiency.',
      },
      {
        question: 'How is air filter efficiency measured under ISO 5011?',
        answer: 'ISO 5011 testing injects standardized Arizona test dust into the airstream feeding through the filter. Automatic particle counters measure dust concentration upstream and downstream, calculating Beta ratio at multiple particle sizes (4 µm, 14 µm, 21 µm). The test runs until terminal differential pressure (30 mbar, ~3 kPa) is reached, measuring both efficiency and dirt-holding capacity. A filter rated β4(c) = 1000 captures 999 out of 1000 particles >4 µm (99.9% efficiency).',
      },
    ],
    keyParameters: [
      { label: 'Bypass valve setpoint', value: '60–80 mbar' },
      { label: 'Critical restriction point', value: '40–60 mbar' },
      { label: 'Fuel consumption penalty (high restriction)', value: '+5–12%' },
      { label: 'ISO 5011 target efficiency', value: 'β4 ≥ 200 (99.5%)' },
    ],
  },
  // Structural Failure (4)
  {
    id: CANONICAL_PROBLEM_IDS.CAVITATION,
    slug: 'cavitation',
    name: 'Cavitation',
    category: 'structural-failure',
    severity: 'critical',
    status: 'published',
    relatedSystems: ['hydraulic-protection'],
  },
  {
    id: CANONICAL_PROBLEM_IDS.PUMP_FAILURE,
    slug: 'pump-failure',
    name: 'Pump Failure',
    category: 'structural-failure',
    severity: 'critical',
    status: 'draft',
    relatedSystems: ['hydraulic-protection', 'lubrication-protection'],
  },
  {
    id: CANONICAL_PROBLEM_IDS.FILTER_COLLAPSE,
    slug: 'filter-collapse',
    name: 'Filter Collapse',
    category: 'structural-failure',
    severity: 'high',
    status: 'published',
    relatedSystems: ['hydraulic-protection', 'lubrication-protection', 'air-intake-protection'],
  },
  {
    id: CANONICAL_PROBLEM_IDS.MEDIA_FATIGUE,
    slug: 'media-fatigue',
    name: 'Filter Media Fatigue',
    category: 'structural-failure',
    severity: 'medium',
    status: 'draft',
    relatedSystems: ['hydraulic-protection', 'lubrication-protection'],
  },
  // Chemical Degradation (2)
  {
    id: CANONICAL_PROBLEM_IDS.VARNISH_FORMATION,
    slug: 'varnish-formation',
    name: 'Varnish Formation',
    category: 'chemical-degradation',
    severity: 'high',
    status: 'published',
    relatedSystems: ['lubrication-protection', 'hydraulic-protection'],
  },
  {
    id: CANONICAL_PROBLEM_IDS.OXIDATION,
    slug: 'oxidation',
    name: 'Oxidative Degradation',
    category: 'chemical-degradation',
    severity: 'medium',
    status: 'draft',
    relatedSystems: ['lubrication-protection'],
  },
  // Biological (1)
  {
    id: CANONICAL_PROBLEM_IDS.MICROBIAL_GROWTH,
    slug: 'microbial-growth',
    name: 'Microbial Growth',
    category: 'biological',
    severity: 'medium',
    status: 'draft',
    relatedSystems: ['fuel-cleanliness-protection'],
  },
];

export const PROBLEM_STUBS_BY_SLUG: Record<string, ProblemStub> = Object.fromEntries(
  PROBLEM_STUBS.map((p) => [p.slug, p])
);

// ── Glossary Slug Utilities ───────────────────────────────────────────────────
// Slug convention: TERM-BETA-RATIO → 'beta-ratio' (strip TERM- prefix, lowercase)

export function termIdToSlug(id: string): string {
  return id.replace(/^TERM-/, '').toLowerCase();
}

export function slugToTermId(slug: string): string {
  return `TERM-${slug.toUpperCase()}`;
}

// ── Category Labels ───────────────────────────────────────────────────────────

export const PROBLEM_CATEGORY_LABELS: Record<ProblemCategory, string> = {
  'mechanical-wear': 'Mechanical Wear',
  'contamination': 'Contamination',
  'structural-failure': 'Structural Failure',
  'chemical-degradation': 'Chemical Degradation',
  'biological': 'Biological',
};

export const PROBLEM_SEVERITY_COLORS: Record<ProblemStub['severity'], string> = {
  critical: '#ff4444',
  high: '#ff8c00',
  medium: '#FFF12D',
  low: '#44ff88',
};
