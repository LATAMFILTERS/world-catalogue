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
    status: 'published',
    relatedSystems: ['lubrication-protection', 'hydraulic-protection'],
    metaDescription: 'Adhesive wear caused by metal-to-metal contact and oil film breakdown. Temperature, pressure, and filtration effects.',
    definition: 'Adhesive wear occurs when the lubricating oil film between moving surfaces breaks down, causing direct metal-to-metal contact. When surfaces slide under load without adequate lubrication, localized pressure and temperature spikes (>150°C) cause microscopic welding and shearing of surface asperities. Material transfers from one surface to the other, creating rough spots that accelerate wear exponentially.',
    relatedStandards: ['ISO 16889', 'ISO 4406', 'ASTM D4378'],
    relatedTechnologies: ['SYNTRAX', 'DURATECH'],
    sections: [
      {
        heading: 'Metal-to-Metal Contact Mechanism',
        body: 'Adhesive wear initiates when oil film thickness drops below 0.1 µm (film thickness depends on viscosity, load, and speed per Stribeck curve). Once film breaks: (1) Surface asperities (micro-peaks 0.1–1 µm height) contact directly under load; (2) Localized contact pressure exceeds 2–5 GPa (at 1 cm² contact area with 10 kN load); (3) Temperature at asperity contact rises to 150–300°C from friction; (4) Surface material softens, asperities weld together and shear as relative motion continues; (5) Transferred material builds up on one surface, then shears off as a particle (10–100 µm), leaving a crater. Adhesive wear rate accelerates exponentially once initiated — initial wear creates rough spots that increase contact pressure further.',
      },
      {
        heading: 'Oil Film Breakdown Triggers',
        body: 'Five conditions cause film breakdown: (1) Contaminating particles >3 µm breaking film by acting as "micro-gears" forcing surfaces together; (2) Insufficient oil viscosity — low viscosity oil cannot maintain film thickness under load; viscosity drop from 46 cSt (nominal) to 30 cSt reduces film thickness 30–40%; (3) Extreme pressure/temperature — shock loads exceeding design envelope collapse film temporarily; high temperatures (>80°C) reduce oil viscosity 5–10% per 10°C; (4) Oil oxidation and additive depletion — aged oil loses anti-wear additives (zinc, molybdenum) that normally create protective boundary films; (5) Moisture and corrosive acids — water and oxidation acids reduce oil film strength and promote micro-corrosion pitting, reducing surface smoothness and film carrying capacity.',
      },
      {
        heading: 'Hydraulic System Vulnerability to Adhesive Wear',
        body: 'Hydraulic systems are particularly susceptible to adhesive wear in proportional valves, spool-bore assemblies, and pump port plates where clearances are tight (1–5 µm) and pressures extreme (200–350 bar). A proportional valve spool maintains hydraulic control through a precise 2–4 µm gap between spool and bore. Any particle >3 µm increases spool contact pressure; combined with pressure spikes (300 bar × 10 cm² spool = 30,000 N force) and temperature rises from proportional valve throttling action, adhesive wear initiates rapidly. Spool wear increases clearance from 3 µm to 5–10 µm within 500–1000 hours, destroying precision control and causing loss of proportional response (pilot pressure no longer controls main spool position reliably).',
      },
      {
        heading: 'Contamination + Temperature Synergy',
        body: 'Adhesive wear is a synergistic effect of contamination AND temperature: contaminating particles reduce effective oil film (by being trapped in film gaps), AND elevated temperature reduces viscosity and film strength. In high-temperature operations (desert mining, tropical climates), baseline oil temperature rises 60–70°C; this alone reduces viscosity 30–40%, thinning film. Adding particle contamination (ISO 19/17/14 vs. target 16/14/11) further reduces film thickness 20–30%, resulting in cumulative 50–70% film reduction. The combined effect accelerates adhesive wear 10–20×. Prevention requires BOTH temperature control (adequate cooling) AND contamination control (multi-stage filtration).',
      },
      {
        heading: 'Prevention: Anti-Wear Additives + Filtration',
        body: 'Two-part adhesive wear prevention: (1) Oil anti-wear (AW) additives — zinc dialkyldithiophosphate (ZDDP) and molybdenum form protective boundary films under extreme pressure, allowing film to recover after pressure spikes; premium synthetic oils (SYNTRAX) contain enhanced AW packages; (2) Contamination control — particle removal prevents mechanical film breakdown; clean ISO 16/14/11 oil maintains film thickness 0.5–1 µm even under 200 bar pressure and 70°C temperature. Operating margins improve dramatically: oil film becomes resilient, can recover after transient pressure spikes, accommodates micro-asperities without welding. Result: Adhesive wear rate drops 10–50× compared to commodity oil + poor filtration approach.',
      },
    ],
    faqs: [
      {
        question: 'What is the difference between adhesive and abrasive wear?',
        answer: 'Abrasive wear: hard particles (silica, oxides) act as grinding tools cutting surfaces; wear is proportional to particle size and quantity; prevention is particle removal via filtration. Adhesive wear: metal surfaces directly contact under load; material transfers between surfaces and shears off; wear rate increases exponentially once initiated. Prevention requires both adequate film thickness (viscosity, cleanliness, cooling) and anti-wear additives. Abrasive wear is "slow grinding"; adhesive wear is "rapid welding and material loss".',
      },
      {
        question: 'Why do contaminating particles trigger adhesive wear if they are smaller than the load?',
        answer: 'Particles don\'t need to "break" the film by force; they act as "spacers" in the oil gap. A 3 µm particle in a 4 µm film gap forces the particle into the asperity peaks, acting as a micro-gear that increases local contact pressure 10–50×. This localized pressure spike causes micro-welding at the particle-surface interface. Additionally, particle presence disrupts hydrodynamic film formation — the particle creates eddy currents and turbulence that prevent smooth oil flow, thinning the film around the particle location.',
      },
      {
        question: 'Can adhesive wear be reversed once started?',
        answer: 'Not fully. Once adhesive wear initiates, surface roughness increases (from Ra 0.1 µm to Ra 0.5–1.5 µm), and rough surfaces are mechanically locked (high friction angles prevent smooth sliding). Even if contamination is removed and oil replaced, rough surfaces continue to generate adhesive wear at accelerated rate due to increased contact pressures. Prevention is far superior to cure: maintain clean oil (ISO 16/14/11), adequate viscosity (46 cSt nominal), and anti-wear additives from the start. Early detection (ferrous wear particles rising in oil analysis) allows component replacement before permanent surface damage.',
      },
      {
        question: 'How does temperature increase adhesive wear risk?',
        answer: 'Temperature affects viscosity (film thickness) and anti-wear additive stability. At +10°C temperature rise: viscosity drops 10–15% (reducing film thickness proportionally), anti-wear additive effectiveness decreases 5–10% (less protection at pressure spikes), oxidation rate doubles (aged oil loses additives faster). In a hot climate (ambient 40°C) with inadequate cooling (oil temp 85°C vs. 65°C nominal), combined viscosity loss is 30–40%, film thickness drops 30–40%, and additive protection is 20–30% lower. This creates "perfect storm" for adhesive wear: thin film + weak chemical protection + high contact pressures. Solution: Active oil cooling (thermostat-controlled) + premium high-viscosity-index oil (SYNTRAX) + multi-stage filtration.',
      },
      {
        question: 'Why is adhesive wear common in proportional valves but rare in cylinders?',
        answer: 'Proportional valve spools operate at: (1) tight clearances (2–4 µm spool-bore gap) where even 1 µm particles force metal contact; (2) high pressure differentials (200–300 bar across spool) creating 20,000–30,000 N forces on small spool area; (3) high fluid velocity (5–10 m/sec) creating high shear stress. Cylinders, by contrast, operate at: (1) loose clearances (20–50 µm rod seal gaps); (2) lower pressure (100–150 bar); (3) slower fluid velocity. The same oil cleanliness level (ISO 19/17/14) is catastrophic for proportional valves but tolerable for cylinders. This is why system cleanliness targets must be set by the MOST SENSITIVE component (proportional valve at 16/14/11), not the average.',
      },
    ],
    keyParameters: [
      { label: 'Critical film thickness', value: '0.1–1 µm' },
      { label: 'Asperity contact temperature', value: '150–300°C' },
      { label: 'Proportional valve spool clearance', value: '2–4 µm' },
      { label: 'Wear rate increase (per temp +10°C)', value: '+50–100%' },
    ],
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
    status: 'published',
    relatedSystems: ['fuel-cleanliness-protection'],
    metaDescription: 'HPCR injector wear from particulate contamination and water corrosion. Orifice blockage, needle stiction, erosion mechanisms.',
    definition: 'Injector wear is the degradation of high-pressure common rail (HPCR) injector needle valves and nozzle orifices caused by particulate contamination and water corrosion. The microscopic tolerances (0.1 mm nozzle holes, 0.5–1 µm needle seat) cannot tolerate contamination >2 µm. Wear manifests as erosion, stiction (stick-slip), and orifice blockage, causing injection timing errors, uneven fuel distribution, and complete injector failure.',
    relatedStandards: ['ASTM D6304', 'ISO 12937', 'SAE J1739'],
    relatedTechnologies: ['SYNTAPORE', 'HYDROCORE', 'HYDROCORE'],
    sections: [
      {
        heading: 'HPCR Injector Design and Failure Sensitivity',
        body: 'HPCR injectors operate at 1600–2000 bar (160–200 MPa) pressure, 10× higher than legacy fuel systems. Nozzle tip orifices are 0.1–0.15 mm diameter (100–150 µm); pilot valve spool clearances are 0.5–1 µm (micron-scale). These tolerances create "stone in a dam" failure mode: a single hard particle >4 µm entering a 0.1 mm orifice blocks fuel flow. Multiple needle valve cycles (25,000 cycles/second at 1500 RPM) generate high-frequency stress that propagates into micro-cracks in valve seats and orifice walls. Modern OEM fuel systems have zero tolerance for contamination; even "clean" commodity diesel at 4 µm particle size is destructive to HPCR systems.',
      },
      {
        heading: 'Three Injector Failure Mechanisms',
        body: 'Mode 1 — Orifice blockage: particle >3 µm lodges in nozzle hole, restricting spray pattern and causing uneven fuel distribution; result is rough idle, white smoke (unburned fuel), misfires. Mode 2 — Needle stiction (stick-slip): particles embed in valve seat surface (0.5 µm seat width), creating micro-friction spikes that seize needle valve intermittently; stiction causes erratic injection timing, delayed fuel delivery (100–500 microseconds timing variance), extended cranking. Mode 3 — Erosion/pitting: particles striking needle valve during 25,000 cycles/sec motion micro-cut valve seat, destroying sealing geometry; pitting depth >10 µm on a 0.5 µm seat completely destroys seal. All three modes require full injector replacement ($800–1200 per injector × 6–8 injectors per engine = $4800–9600 per failure event).',
      },
      {
        heading: 'Water Contamination and HPCR Corrosion',
        body: 'Water in diesel fuel causes four HPCR-specific failure mechanisms: (1) Corrosion of injector bore and needle valve surfaces — free water reacts with acidic compounds in diesel (sulfuric acid from fuel oxidation, organic acids from microbial growth), pitting injector components within 100–200 operating hours; corrosion depth >50 µm in critical areas destroys sealing geometry; (2) Microorganism-accelerated corrosion — water-diesel interfaces host Bacillus and Clostridium bacteria, producing organic acids (acetate, butyrate) that accelerate corrosion 3–5×; biofilm deposits block fuel passages; (3) Emulsion formation — water suspended as tiny droplets in diesel creates slug flow, jamming needle valves and blocking pilot fuel drain lines (0.5–1 mm diameter); (4) Cavitation in high-pressure fuel rail — water vapor bubbles form during fuel expansion through injector orifices, collapsing violently and damaging orifice walls (pressure pulses >2000 bar for 1–10 microseconds). Critical water thresholds: >100 ppm triggers corrosion pitting; >200 ppm initiates microbial growth; >300 ppm causes visible performance degradation; >500 ppm system failure within 1–2 weeks.',
      },
      {
        heading: 'Detection and Prevention Strategy',
        body: 'Injector wear detection: (1) ISO 4406 fuel analysis for particle counts (target <4 µm particles for HPCR); (2) Karl Fischer testing for water content (critical threshold >200 ppm); (3) Injector performance testing — modern OBD-II systems detect injection timing variance (>50 microseconds); rough idle and white smoke indicate stiction/blockage. Prevention requires staged fuel protection: (1) SYNTAPORE particulate fuel filtration capturing particulates before fuel rail; (2) HYDROCORE water separator preventing corrosion; (3) regular fuel polishing for proactive tank treatment. Regular Karl Fischer testing (monthly during rainy season, quarterly otherwise) allows early detection of water ingress before corroded fuel reaches injectors.',
      },
      {
        heading: 'Real-World Case Study: Commercial Fleet Fuel System Protection',
        body: 'Heavy-duty truck fleet, 25 vehicles, tropical climate (coastal Malaysia). Baseline: Commodity fuel filters + standard tank breathers. Problem: 8–10 injector failures per year across fleet ($96K–120K annual cost). Failure pattern: Every 4–6 weeks, 1–2 vehicles experience rough idle and white smoke, requiring injector removal and replacement. Root cause analysis: Fuel samples showed ISO 6/4/2 particle cleanliness (HPCR target: <2/0/0, essentially "clean") and 400–800 ppm water during rainy season (monsoon moisture ingress through breather). Implementation: (1) Desiccant breathers on all 25 fuel tanks (silica-gel, rechargeable); (2) HYDROCORE water separator filters on all fuel systems (dual-stage coalescing); (3) Monthly Karl Fischer testing on fuel samples; (4) Annual fuel polishing service at regional depot. Results after 12 months: Water levels maintained <50 ppm year-round (vs. baseline 400–800 ppm); fuel cleanliness improved to <4/2/0; zero injector failures in year 1 (vs. baseline 8–10/year). Cost impact: Equipment investment $35K (breathers, filters, testing equipment), maintenance $12K/year (fuel polishing, testing) = $47K total first-year cost. Savings: 8 injector replacements avoided × $8K average cost = $64K first-year savings, plus improved fuel economy (+2–3% from cleaner combustion), plus eliminated downtime. 18-month payback, 10-year fleet savings: $480K+.',
      },
    ],
    faqs: [
      {
        question: 'Why can\'t commodity diesel filters protect HPCR injectors?',
        answer: 'Commodity diesel filters are rated 20–25 µm absolute (Beta 200 @ 20 µm), allowing 50% of particles >20 µm to pass. HPCR injectors fail at >4 µm particles. A commodity filter allowing even 1% of 5 µm particles to pass is catastrophic — 100 µm³ of fuel passing through 0.1 mm nozzle orifices at 1000 liters/hour = millions of 5 µm particles per minute reaching injectors. SYNTAPORE particulate media is engineered for the finer particle-size range relevant to HPCR orifice protection, matched to the approved fuel-filtration stage rather than a universal rating. The particle size threshold is the critical difference.',
      },
      {
        question: 'How is water detected in diesel before it damages injectors?',
        answer: 'Karl Fischer coulometric titration (ASTM D6304) is the standard method. Procedure: (1) Fuel sample collected in sealed container immediately after tank sampling (prevents air exposure, which artificially increases measured water); (2) 100–500 mL sample injected into Karl Fischer titration cell; (3) Water reacts with reagent producing measurable electrical signal proportional to water content; (4) Result: ppm water (50–2000 ppm range). Critical thresholds: <50 ppm (safe); 50–100 ppm (monitor closely); 100–200 ppm (activate water separator immediately); >200 ppm (microbial growth likely, emergency action). Frequency: monthly baseline, weekly during rainy season, immediately after suspected water ingress event.',
      },
      {
        question: 'Can corroded injectors be repaired or must they be replaced?',
        answer: 'Corroded HPCR injectors cannot be repaired. Corrosion pitting in critical areas (needle valve seat, orifice wall) destroys precision geometry. Even after removing corrosion deposits and polishing surfaces, pitting remains and leakage results. OEM guidance: replace immediately upon detection of corrosion (verified by white smoke, rough idle, fuel pressure variance, or injector removal inspection). Some shops attempt "cleaning" with ultrasonic solvents, but this only removes loose deposits, not embedded pitting. Full replacement ($800–1200 per injector) is required; preventive water separation avoids this cost.',
      },
      {
        question: 'How do desiccant breathers prevent water ingress in fuel tanks?',
        answer: 'Tank breathing occurs during temperature cycles: cool overnight (tank contracts, draws air in through breather); warm daytime (tank expands, pushes air out). Standard breathers allow ambient air to enter; if relative humidity is 80%+ (tropical climates), ambient air at 25°C and 80% RH contains ~13 grams water per cubic meter. Over 6 months (rainy season), 1000 m³ of humid air entering tank = ~13 kg water accumulation. Desiccant breathers use silica-gel or molecular sieve material that absorbs moisture from incoming air, reducing humidity from 80% to 5–10%. Breather cartridges are rechargeable (silica-gel returns to blue color when charged); typical recharge interval is 6–12 months depending on climate. Net effect: tank water ingress drops from 100–500 ppm to <20 ppm during high-humidity seasons.',
      },
      {
        question: 'Why does microbial growth accelerate fuel system corrosion?',
        answer: 'Fuel-water interface bacteria (Bacillus, Clostridium) consume diesel hydrocarbons and water, producing organic acids (acetate, butyrate, propionic acid). These acids lower fuel pH from neutral (6.5–7.5) to acidic (4.0–5.0). Acidic fuel aggressively corrodes injector bore steel, needle valve surface, and fuel rail components. Additionally, bacterial biofilm deposits (dark slime visible on tank bottom and fuel filters) contain dissolved salts and organic acids that are highly corrosive. One month of heavy microbial growth (>1 million CFU/mL) can generate corrosion depth of 50–100 µm, destroying critical sealing surfaces. Prevention: (1) maintain water <100 ppm to prevent bacterial colonies; (2) biocide treatment if microbial contamination is detected (bacterial count >10,000 CFU/mL); (3) regular fuel polishing removes accumulated biofilm.',
      },
    ],
    keyParameters: [
      { label: 'HPCR operating pressure', value: '1600–2000 bar' },
      { label: 'Nozzle orifice diameter', value: '0.1–0.15 mm' },
      { label: 'Needle valve spool clearance', value: '0.5–1 µm' },
      { label: 'Critical water threshold', value: '>200 ppm (microbial growth)' },
    ],
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
    relatedTechnologies: ['HYDROCORE', 'DRYCORE'],
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
        body: 'Water ingress prevention requires blocking entry routes and removing ingressed water: (1) Desiccant breathers (silica-gel type) replace standard air breathers, absorbing atmospheric moisture before humid air enters tank—reduces ingression 50–70%; (2) Water separator filters (HYDROCORE technology with coalescing media) capture free water at fuel filter stage, gravity-draining separated water before reaching injectors; (3) Fuel polishing units (portable or skid-mounted) with 3-micron particulate filter + water separator for proactive tank treatment; (4) Sealed fuel caps and inspection covers to minimize tank opening and moisture entry; (5) Regular tank cleaning every 2–3 years in humid climates, removing accumulated microbiota and sediment. Combined approach: desiccant breather + water separator filter + quarterly Karl Fischer testing reduces water-related failures to near zero.',
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
        answer: 'Water separator filters (coalescing media type like HYDROCORE) capture free and emulsified water at the rated performance of the approved element. Dissolved water (molecular water in fuel solution, <50 ppm) passes through. For heavily contaminated fuel (>500 ppm water), a two-stage approach works best: (1) Primary water separator removes bulk free water, (2) Fuel polishing unit (portable filtration + water separation) removes remaining emulsion and dissolved water over several circulation cycles.',
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
    relatedTechnologies: ['HYDROCORE', 'SYNTAPORE', 'HYDROCORE', 'DRYCORE'],
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
        body: 'HPCR fuel protection requires multiple filtration stages: (1) Bulk fuel storage filtration — particle filter + water separator tank-inlet filter preventing new contamination during transfer into vehicle tanks; (2) Primary fuel filter (main filter) — particulate removal (SYNTAPORE) ahead of the fuel pump, paired with a dedicated water separator (HYDROCORE) for free water removal; (3) Secondary fuel filter (fine filter) — finer particulate removal (SYNTAPORE), protecting HPCR fuel rail and injectors; (4) Pilot fuel drain filtration — filtration on injector pilot fuel return circuit, preventing wear particles from pilot spool degradation from re-circulating into main fuel rail. Modern ELIMFILTERS SYNTAPORE (particulate) + HYDROCORE (water separation) combination provides staged particle removal and water separation across the fuel circuit, meeting HPCR protection requirements. Fuel polishing of existing tanks (portable particulate filter + water separator cart) required when transitioning to biodiesel blends.',
      },
      {
        heading: 'Heavy-Duty Diesel Fleet Fuel Contamination Prevention',
        body: 'Regional distribution fleet, 25 class-8 trucks, fuel stored in on-site 5000-gallon bulk tank. Problem: Frequent injector failures (2–3 failures per truck per year, total 50–75 injector replacements annually at $800 each = $40K–60K/year). Investigation: Fuel samples showed 300–500 ppm water (from tank venting, precipitation), ISO cleanliness 22/20/16. Implementation: (1) Desiccant breather on bulk tank (prevents rain water and humid air ingress); (2) 25 µm pre-filter on fuel transfer pump (vehicle fill-up line); (3) Dual-stage in-vehicle filtration — SYNTAPORE particulate primary filter + HYDROCORE water separator secondary stage; (4) Monthly Karl Fischer testing on bulk tank; (5) Annual fuel polishing service when water exceeded 50 ppm. Results: Fuel water reduced from 300–500 ppm to <50 ppm (below microbial growth threshold). Injector failures dropped to 0–1 per truck per year (92% reduction). Maintenance cost savings: $38K–60K annually. ROI: Equipment investment ($3K per truck × 25 = $75K) recovered in 1.5 years, then $40K+ annual savings. 5-year savings: $175K+ per fleet.',
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
        answer: 'Coalescing water separator filters (HYDROCORE technology) use oleophobic (water-attracting) media that allows diesel to pass while capturing water droplets. Captured water droplets coalesce into larger drops that sink and drain by gravity at the bottom of the filter bowl, removing free water before fuel reaches the HPCR fuel rail at the rated performance of the approved element. Emulsified water (tiny droplets dispersed throughout fuel) requires additional fuel polishing via portable tank treatment systems.',
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
    metaDescription: 'Cavitation in hydraulic systems: vapor bubble formation, cavity collapse erosion, pump damage, prevention through pressure control.',
    definition: 'Cavitation is the rapid formation and collapse of vapor bubbles (cavities) in flowing liquid, occurring when local pressure drops below the liquid\'s vapor pressure. In hydraulic systems, cavitation happens in pump inlet lines, proportional valve spools, and orifice restrictions. Cavity collapse creates violent pressure waves (>2000 bar for microseconds) that damage component surfaces through erosion, pitting, and material loss.',
    relatedStandards: ['ISO 16889', 'ISO 4413', 'NFPA T2.14'],
    relatedTechnologies: ['NANOFORCE'],
    sections: [
      {
        heading: 'Cavitation Physics in Hydraulic Systems',
        body: 'Cavitation initiates when local pressure at a point in flowing fluid drops below vapor pressure (0.5–1 bar absolute for hydraulic oil at 60°C). Three conditions trigger this: (1) Rapid pressure drop — proportional valve spools create 200 bar pressure differential across 1 mm orifice, local velocity reaches 15–25 m/sec, pressure drops to <0.5 bar (Bernoulli equation); (2) Suction pressure drop — pump inlet line restriction (clogged filter, kinked line) creates suction below 0.3 bar absolute, triggering cavitation; (3) Rapid decompression — pilot line exhausts creating sudden pressure drops in proportional valve pilot cavity. When pressure drops below vapor pressure, dissolved air comes out of solution AND liquid vaporizes, forming vapor bubbles 0.1–10 mm diameter. As flow continues downstream and pressure recovers (>1 bar), bubbles collapse violently in ~1 microsecond, creating pressure shockwaves 2000–4000 bar.',
      },
      {
        heading: 'Erosion Damage from Cavity Collapse',
        body: 'Cavity collapse generates three damage mechanisms: (1) Pressure wave — 3000 bar shockwave lasting 1–10 microseconds creates localized stress exceeding material yield strength; surface material (steel, aluminum) plastically deforms, creating dimple craters 10–100 µm deep; repeated collapse creates overlapping craters with jagged edges; (2) Microjet formation — asymmetrical bubble collapse creates focused liquid jets at 100+ m/sec impacting surface, punching microscopic holes; (3) Free radical and cavitation erosion byproducts — oxygen radicals and reactive species from liquid vaporization/condensation chemically attack surfaces in addition to mechanical damage. Cumulative erosion rate in cavitating hydraulic systems is 0.1–0.5 mm depth per 1000 hours of operation. Pump outlet port plates (normal 3–5 mm thickness) can be perforated within 2000–3000 hours of continuous cavitation.',
      },
      {
        heading: 'System-Level Cavitation Signatures and Detection',
        body: 'Three indicators of active cavitation: (1) Audible noise — cavitation produces high-frequency grinding/crackling sound (20–50 kHz ultrasonic, but 500–5000 Hz audible component); manifold sounds like "marbles in a grinder"; (2) Pressure pulsation — cavitation creates pressure spikes (100–200 bar amplitude, 1–10 kHz frequency) visible on pressure transducers; smooth pressure traces become oscillatory with high-frequency noise; (3) Hydraulic fluid condition — cavitation generates heat and oxidizes oil, increasing acid number (TAN) by 0.5–1.0 ppm/hour in cavitating system vs. 0.01 ppm/hour in normal system; fluid also foams, loses viscosity 10–20%, becomes discolored dark brown/black. Oil analysis detecting elevated TAN + particle count spike indicates active cavitation damage.',
      },
      {
        heading: 'Prevention: Inlet Pressure, Oil Cleanliness, and Air Release',
        body: 'Three-part cavitation prevention: (1) Maintain inlet pressure — pump suction should be 0.2–0.5 bar above atmospheric (positive head); avoid restriction at suction line (use large-diameter line, low-resistance inlet filter Beta 100 @ 100 µm only); suction filter should have bypass valve set <0.3 bar differential to prevent starvation; (2) Air release control — ISO 16889 filters remove air trapped in oil; air-saturated oil has lower vapor pressure, cavitates more readily; clean oil (ISO 16/14/11) releases air faster than contaminated oil; kidney-loop offline filtration with NANOFORCE (3 µm filter) removes microscopic air bubbles; (3) Proportional valve pressure drop design — manifold engineers should minimize pressure differential across proportional valve spools (<50 bar pilot stage, <100 bar main stage); excessive throttling increases local velocity and cavitation risk. Combined approach: positive suction pressure + clean oil + proper valve design eliminates cavitation.',
      },
      {
        heading: 'Real-World Case Study: Mining Wheel Loader Cavitation Damage',
        body: 'Mobile equipment fleet, 12 wheel loaders, hydraulic system deterioration after 8000 hours. Symptom: Progressive noise increase, rough proportional control, erratic bucket movement. Diagnosis: Pump outlet noise (cavitation), high TAN in oil (3.5 ppm vs. baseline 0.5 ppm), pressure pulsation +150 bar spikes. Root cause: Inlet suction line partially kinked (pinched during hose replacement), creating <0.1 bar suction (cavitation threshold). Additionally, original filtration (Beta 1000 @ 10 µm lube filter only) left 15–20 µm particles in hydraulic fluid, degrading proportional valve cleanliness to 19/17/14 (target 17/15/12). Implementation: (1) Replaced suction line with new low-restriction design, verified suction pressure 0.3 bar positive head; (2) Installed NANOFORCE offline kidney-loop (3 µm filter, 5–10 gal/min circulation) running 8 hours/day during field work; (3) Added high-efficiency inlet pre-filter (Beta 100 @ 100 µm only, prevents suction restriction); (4) Upgraded lube filter to DURATECH return filter (Beta 1000 @ 10 µm). Results: Cavitation noise ceased immediately after suction line replacement. Oil TAN stabilized to 0.8 ppm (normal range). Proportional valve control smoothed within 2 weeks of kidney-loop operation. No further pump degradation in subsequent 4000 hours. Cost: $18K equipment investment, $2K/year kidney-loop maintenance. Avoided pump replacement: $45K+.',
      },
    ],
    faqs: [
      {
        question: 'Can cavitation damage be repaired or must components be replaced?',
        answer: 'Cavitation erosion is permanent. Pitted surfaces cannot be repaired to original precision. Port plates and pump outlet faces eroded by cavitation must be replaced. Proportional valve spools with cavitation pitting develop leakage paths and lose control authority — replacement required. The only "repair" is prevention: eliminate cavitation source and replace damaged components. Attempting to re-machine pitted port plates usually fails because pitting is too deep and damage pattern irregular; final product still leaks. Replace-and-prevent is far more cost-effective than repair attempts.',
      },
      {
        question: 'Why is cavitation worse in mobile equipment (loaders, excavators) than stationary hydraulic systems?',
        answer: 'Mobile equipment experiences transient pressure spikes (acceleration, deceleration, shock loads) that momentarily lower suction pressure or spike pressure differentials across proportional valves. Additionally, field hoses are subject to kinking, crushing, vibration-induced partial blockage — risk of suction line restriction is 10× higher than stationary systems with rigid piping. Mobile equipment proportional valves also operate at higher flow rates (50–100 gal/min) with tighter spools (1–2 µm clearance), creating higher local velocity and cavitation susceptibility. Stationary systems have stable inlet pressure, rigid suction lines, and lower flow rates — cavitation risk is inherently lower.',
      },
      {
        question: 'Does air release additive in hydraulic oil prevent cavitation?',
        answer: 'Air release additives (silicone-based) reduce FOAMING (air bubbles floating at oil surface) but do not prevent cavitation (dissolved air coming out of solution under pressure drop). Foam is undesirable (reduces heat transfer), but cavitation is destructive (erodes components). These are separate phenomena. High-quality synthetic hydraulic oils (NANOFORCE-compatible formulations) include air release additives, but cavitation prevention requires system design changes (positive suction pressure, cleanliness, valve throttling) not fluid additives.',
      },
      {
        question: 'How do I know if my system is cavitating or just noisy from other sources?',
        answer: 'Diagnostic procedure: (1) Listen — true cavitation produces distinctive high-frequency "marbles in a grinder" grinding noise, not just pump whine or motor noise; (2) Measure suction pressure — if <0.1 bar absolute, cavitation likely occurring; normal systems maintain 0.2–0.5 bar; (3) Oil analysis — check TAN (acid number); cavitation-damaged oil has TAN >2.0 ppm (normal <0.8); (4) Pressure transient measurement — install pressure transducers at pump outlet; cavitating systems show 100–200 bar oscillations at 1–10 kHz frequency; (5) Visual inspection — remove pump and inspect outlet face for pitting erosion (cavitation) vs. smooth wear (normal wear). If all five indicators point to cavitation, system cavitation is confirmed.',
      },
      {
        question: 'Why is cavitation particularly damaging to proportional valves?',
        answer: 'Proportional valve spools operate at microscopic clearances (1–3 µm) and throttle significant flow (50–100 gal/min) through small orifices. This creates extreme local velocity (15–25 m/sec) and pressure drop (100–200 bar), easily dropping pressure below vapor pressure in orifice. Cavitation bubbles form in spool lands and pilot cavities, collapse creating shockwaves that impact delicate spool surfaces. Spool surface erosion (100–200 µm pitting) is catastrophic because it degrades sealing geometry and increases internal leakage to 5–10% (uncontrolled). Proportional valve is most cavitation-sensitive component in system because of tight clearances + high throttling. Simple fixed-orifice valves have larger clearances and lower sensitivity.',
      },
    ],
    keyParameters: [
      { label: 'Vapor pressure (hydraulic oil @ 60°C)', value: '0.5–1 bar absolute' },
      { label: 'Cavity collapse duration', value: '1 µsec' },
      { label: 'Shockwave pressure on collapse', value: '2000–4000 bar' },
      { label: 'Erosion rate (cavitating system)', value: '0.1–0.5 mm/1000 hrs' },
    ],
  },
  {
    id: CANONICAL_PROBLEM_IDS.PUMP_FAILURE,
    slug: 'pump-failure',
    name: 'Pump Failure',
    category: 'structural-failure',
    severity: 'critical',
    status: 'published',
    relatedSystems: ['hydraulic-protection', 'lubrication-protection'],
    metaDescription: 'Hydraulic pump failure: cavitation, abrasive wear, load-carrying capacity loss. ISO 16889 fluid cleanliness targets. Predictive monitoring strategies.',
    definition: 'Pump failure is the catastrophic loss of a hydraulic pump\'s ability to generate flow and maintain pressure due to cavitation erosion, abrasive particle wear degrading internal clearances, or internal component seizure. Hydraulic pumps operate with clearances of 1–5 µm; a single contamination event introducing 10–50 µm particles causes wear that reduces clearance below critical thresholds, increasing leakage and reducing pump displacement. Complete pump failure requires replacement (€8,000–25,000 per pump) and 3–7 day downtime for system flushing and fluid replacement.',
    relatedStandards: ['ISO 16889', 'ISO 4413', 'NFPA T2.14', 'ISO 6162'],
    relatedTechnologies: ['NANOFORCE', 'DURATECH'],
    sections: [
      {
        heading: 'Hydraulic Pump Types and Contamination Sensitivity',
        body: 'Industrial hydraulic systems use four primary pump designs: (1) Gear pumps (spur, helical) — simple, low cost, 2–3 µm internal clearances, high contamination sensitivity; operate at 210–280 bar; require ISO 18/16/13 fluid cleanliness minimum; (2) Vane pumps (sliding vane) — moderate complexity, 1–2 µm clearances, extremely sensitive to contamination; operate at 140–210 bar; require ISO 17/15/12 minimum; used in positioning and proportional valve circuits; (3) Piston pumps (axial, swashplate) — highest pressure capability 350–420 bar, tightest tolerances 0.5–1 µm between piston and bore, most contamination-sensitive; require ISO 16/14/11 or tighter; used in excavators, mobile equipment, injection molding systems; (4) Centrifugal pumps (low-pressure systems) — 3–5 µm clearances, used for circulation and cooling, operate at <50 bar, moderate contamination tolerance ISO 19/17/14. Piston pumps represent 70% of heavy-duty hydraulic system failures due to tight tolerances and high operating pressures. A single 10 µm silica particle passing through a piston pump bore clearance (0.5–1 µm) creates a micro-scratch that increases wear rate 10–100×, accelerating internal degradation exponentially.',
      },
      {
        heading: 'Cavitation-Driven Pump Erosion',
        body: 'Cavitation in hydraulic pumps occurs during inlet stroke when suction line pressure drops below liquid vapor pressure (0.5–1 bar absolute), forming vapor bubbles. When inlet pressure recovers during discharge stroke, bubbles collapse violently, releasing shockwave energy (2000–4000 bar locally). Cavitation-erosion damage accumulates at pump inlet ports and piston bore surfaces, creating erosion craters that progressively increase clearances. Damage pattern: (1) Initial cavitation pitting — microscopic erosion craters 0.1–0.5 mm deep after 100–200 operating hours; (2) Progressive groove formation — pitting coalesces into micro-grooves, increasing flow leakage 1–2% per 100 hours; (3) Internal seal degradation — erosion of piston-to-bore surfaces reduces sealing contact pressure, leakage increases exponentially (5–10%/hr); (4) Pump starvation — total flow output drops below system demand, system pressure collapses, pump cavitation becomes self-reinforcing, complete failure within 1–5 days of severe cavitation. Root causes of pump cavitation: (1) suction line restriction (clogged inlet filter, kinked suction line) raising suction pressure by >0.5 bar; (2) fluid viscosity too high for inlet flow rate (cold fluid at -10°C in high-flow application); (3) air ingress through loose filler caps or damaged seals reducing effective vapor pressure margin.',
      },
      {
        heading: 'Abrasive Wear Degradation of Internal Clearances',
        body: 'Particles 2–50 µm trapped between pump moving parts cause three-body abrasive wear, progressively enlarging internal clearances. Wear rate is exponential with particle size: 4 µm particles cause baseline wear (reference 1×); 8 µm particles increase wear 3–4×; 16 µm particles increase wear 10–20×; 32 µm particles cause severe wear 50–100×. For a piston pump with nominal 0.5 µm clearance between piston and bore: (1) Clean fluid (ISO 16/14/11): wear rate <0.001 µm/1000 hrs, clearance remains <1 µm, pump operates at rated efficiency for 10,000+ hours; (2) Moderately contaminated (ISO 19/17/15): 10–50 µm particles introduced, wear rate 0.01–0.05 µm/1000 hrs, clearance increases to 2–3 µm over 2000 hours, leakage increases from 0.5% to 8–10%, pump flow output drops 15–20%; (3) Severely contaminated (ISO 22/20/18 or worse): 50–100 µm particles, wear rate 0.1–0.5 µm/1000 hrs, clearance reaches 5–8 µm in 500 hours, leakage 30–50%, pump cavitation and seizure imminent; (4) Catastrophic contamination (>100 µm particles, foreign object ingestion): wear rate >1 µm/hr, complete piston-bore seizure within 50–100 operating hours. Real-world example: Mobile equipment with failed primary hydraulic filter (bypass activated, unfiltered fluid circulating) introduced 100+ µm silica particles into piston pump; pump flow dropped 50% in 8 hours, seized completely by 24 hours of operation (€22,000 pump replacement, 5-day system downtime).',
      },
      {
        heading: 'Load-Carrying Capacity Loss and System Performance Degradation',
        body: 'Pump internal leakage (bypassing of pressurized fluid back to tank) increases as internal clearances grow from contamination-induced wear. System effect: (1) Initial phase (leakage 0.5–2%): operator notices slight softness in proportional valve response, pressure holding on load deteriorates, implement drift 2–5 mm per minute (acceptable); (2) Progressive phase (leakage 5–15%): pressure relief valve cycles more frequently to maintain system pressure (pump cannot generate rated pressure at reduced clearance), heat generation increases 15–25%, cycle time increases 20–30% (implement becomes "sluggish"), proportional valve response time doubles; (3) Failure phase (leakage >20%): pump cannot maintain rated system pressure even at full displacement, load-carrying capacity drops 50%+ (5-ton excavator can only lift 2–3 tons), implements move in jerky uncontrolled fashion, pressure relief continuously bypassing causing system temperature rise >70°C (fluid degradation accelerating). Safety hazard: load drift and loss of control trigger operator errors and accidents. Pressure surge transients from jerky proportional valve response cause secondary damage to seals and accumulators. Complete pump replacement required; attempting to operate with >20% leakage risks catastrophic loss of control and equipment damage/injury.',
      },
      {
        heading: 'Predictive Monitoring and Pump Health Assessment',
        body: 'Pump wear can be detected before failure through condition monitoring: (1) Acoustic emission (high-frequency vibration monitoring) — cavitation and wear particle impacts create ultrasonic signatures (10–100 kHz); abnormal cavitation signature appears as rapid crackling, distinct from normal pump noise; cavitation intensity correlates with erosion rate; (2) Pressure ripple analysis (pump pressure oscillation measurement) — worn pump produces greater pressure ripple (±5–20 bar vs. ±1–2 bar for healthy pump) due to uneven displacement per revolution; ripple frequency and amplitude increase with clearance growth; (3) Temperature trend monitoring — leakage increases heat generation; pump casing temperature rise >5°C above baseline + trending upward indicates progressive wear; (4) Flow measurement — pump displacement tests at fixed motor speed show declining flow; 10% flow reduction vs. rated indicates significant wear, 20% reduction indicates imminent failure; (5) Fluid sample analysis — wear debris (ferrous particles from piston-bore contact, bronze from bushings) increases from <50 ppm to 100–500 ppm during wear progression, detectable via ICP spectroscopy or ferrography; ISO cleanliness codes trending upward (ISO 17/15/12 → ISO 19/17/15 → ISO 21/19/16) indicate contamination ingress from worn seals. Maintenance threshold: when any two indicators reach warning level (ripple >10 bar + temperature +5°C + ferrous debris >150 ppm), schedule pump rebuild/replacement within 2–4 weeks before catastrophic failure.',
      },
      {
        heading: 'Hydraulic System Contamination Control Case Study: Mining Excavator Fleet',
        body: 'Fleet: 12 CAT 390F excavators (40-ton class) in open-pit copper mining, highly dusty environment. Baseline: 3–5 pump failures per year per 4-5 machines (total 15–20 annual failures across fleet), €250,000–400,000 annual replacement cost, 3–5 days downtime per failure impacting mining schedule. Investigation: Fluid samples showed ISO 21/19/17 cleanliness (well above ISO 16/14/11 specification for piston pumps), ferrous debris 200–400 ppm (abnormally high), particles >10 µm at 100,000+ per 100 mL. Root cause: primary main hydraulic filter (10 µm absolute) exceeded service life, secondary secondary filter (pilot hydraulic circuit) clogged causing bypass activation, suction line kinked reducing inlet flow. Implementation: (1) Install new 10 µm + 3 µm multi-stage hydraulic filter system with differential pressure indicating gauges; replace suction line with larger diameter hose; (2) Deploy offline kidney-loop filtration (NANOFORCE 3 µm absolute, 24/7 circulation during idle time) to continuously clean contamination from operating fluid; (3) Implement quarterly fluid sampling + analysis (ferrography to monitor wear debris, ISO cleanliness code trending); (4) Train operators to check differential pressure gauges daily and replace filters when reaching replacement threshold; (5) Switch to synthetic PAO hydraulic fluid (ISO VG 46) with better viscosity stability and corrosion resistance. Results: After 24 months, pump failures dropped from 15–20/year to 0–1/year (95% reduction). Fluid cleanliness maintained ISO 16/14/11 minimum. Ferrous debris stayed <50 ppm (normal baseline). Annual replacement cost reduced from €250K–400K to €10K–20K (spare parts only, no pump replacements). Fluid change interval extended from annual to 2 years (kidney-loop prevents oxidative degradation). Total 5-year savings: €1.1M+ (fluid cost + pump replacement elimination + downtime reduction). ROI payback: 8 months. Lessons: Contamination control (filtration + monitoring) is the single largest factor in pump reliability; dirt ingestion is virtually 100% predictable and preventable with proper fluid management.',
      },
    ],
    faqs: [
      {
        question: 'Why are hydraulic pumps so sensitive to particle contamination compared to other hydraulic components?',
        answer: 'Hydraulic pumps have the tightest tolerances in the system: piston pumps operate with 0.5–1 µm clearances (piston-to-bore), vane pumps have 1–2 µm clearances, gear pumps have 2–3 µm. These clearances are designed for micro-thin films of hydraulic fluid that provide lubrication. A single 10 µm silica particle is 10–20× larger than the designed clearance — it acts like a grinding stone between moving surfaces. In contrast, proportional valve spool clearances are 2–5 µm (more tolerant), and load-holding valve clearances are 5–10 µm. Pump design prioritizes efficiency over contamination tolerance, making it the system\'s weakest link for dirt ingestion.',
      },
      {
        question: 'How does cavitation damage a hydraulic pump and how can it be prevented?',
        answer: 'Cavitation occurs when pump inlet pressure drops below fluid vapor pressure (~0.5 bar absolute), forming vapor bubbles. During discharge stroke, bubbles collapse at >1 bar pressure, releasing shockwaves (2000–4000 bar locally). Shockwaves cause pitting and erosion on pump inlet ports and internal surfaces. Prevention: (1) ensure suction line is large-diameter and unrestricted (suction line pressure should be >0.3 bar, ideally 0.5 bar); (2) inlet filter differential pressure should not exceed 0.3 bar (replace filter before reaching 0.5 bar); (3) fluid viscosity must match inlet flow rate — cold fluid at startup requires 2–3 minute warm-up before full flow demand; (4) maintain tank level above minimum mark to prevent vortex formation at suction inlet; (5) check tank filler cap and seals for air ingress.',
      },
      {
        question: 'What wear rate can be expected in a contaminated hydraulic pump and how is it related to particle size?',
        answer: 'Wear rate is exponential with particle size. At reference 4 µm contamination level (ISO 19/17/15 cleanliness), piston pump clearances grow ~0.01 µm per 1000 operating hours. At 8 µm contamination: wear rate increases 3–4×. At 16 µm: wear rate 10–20×. At 32+ µm: wear rate 50–100×. Example: a piston pump with 0.5 µm nominal clearance, operating in ISO 22/20/18 contaminated fluid (50–100 µm particles present), experiences wear of 0.1–0.5 µm per 1000 hours. Clearance reaches critical 5 µm within 10,000 hours (3–4 years of continuous duty), causing pump cavitation and seizure. In contrast, same pump operating on ISO 16/14/11 fluid may last 20,000+ hours before reaching 5 µm clearance.',
      },
      {
        question: 'How is pump wear detected before catastrophic failure and what symptoms indicate impending pump failure?',
        answer: 'Early pump wear indicators: (1) pressure ripple increase — measured ripple rises from normal ±1–2 bar to ±5–10 bar; easily detected with pressure transducers; (2) cavitation noise — if cavitation is present, distinctive crackling sound audible from pump area (10–100 kHz acoustic signature); (3) temperature rise — pump casing temperature increases 5–10°C above baseline; correlates with internal leakage increasing friction; (4) flow decline — pump displacement measured at constant motor speed shows 5–10% loss vs. rated; (5) ferrous wear debris in fluid — jump from normal <50 ppm to 100–500 ppm visible via ferrography or ICP analysis. Late-stage failure warnings: proportional valve response becomes jerky and uncontrolled, load drift accelerates (>1 cm/min), system pressure cannot reach rated level even at full pump displacement, heat generation becomes excessive (fluid >65°C), pressure relief valve continuously bypassing (audible as tank return flow roar). If any two of these occur simultaneously, plan pump replacement within 2–4 weeks.',
      },
      {
        question: 'Why is offline kidney-loop filtration valuable for pump life extension and how much improvement can be expected?',
        answer: 'Offline kidney-loop filtration (3–10 µm filter running continuously during idle hours or 24/7) removes wear particles and contamination introduced during operation or ingress events (breather air, seal leakage). By maintaining fluid cleanliness at ISO 16/14/11 or better between normal operating cycles, kidney-loop eliminates the cumulative particle buildup that causes accelerated pump wear. Real-world improvement: piston pumps operating on ISO 18/16/13 fluid (borderline acceptable) typically last 8000–12000 hours before degradation. Same pumps with offline kidney-loop maintaining ISO 16/14/11 during idle time show 50–80% life extension (12000–20000 hours). In mining/construction environments with high dust exposure, kidney-loop can prevent 80–90% of contamination-induced pump failures. Cost: kidney-loop system €15,000–25,000 per excavator; pump replacement cost €22,000–35,000 per pump; prevention economics are 2–3:1 ROI.',
      },
    ],
    keyParameters: [
      { label: 'Piston pump bore clearance', value: '0.5–1 µm' },
      { label: 'Vane pump sliding clearance', value: '1–2 µm' },
      { label: 'Gear pump mesh clearance', value: '2–3 µm' },
      { label: 'Critical pump leakage threshold', value: '20% flow loss' },
    ],
  },
  {
    id: CANONICAL_PROBLEM_IDS.FILTER_COLLAPSE,
    slug: 'filter-collapse',
    name: 'Filter Collapse',
    category: 'structural-failure',
    severity: 'high',
    status: 'published',
    relatedSystems: ['hydraulic-protection', 'lubrication-protection', 'air-intake-protection'],
    metaDescription: 'Filter element collapse: excessive bypass pressure, fiber matrix failure, unfiltered fluid ingestion. ISO 16889 strength testing. Differential pressure monitoring.',
    definition: 'Filter collapse occurs when the filter media (pleated synthetic fiber or paper) ruptures or folds under excessive pressure differential, allowing unfiltered fluid to bypass directly into the system downstream. Collapse can result from: (1) media fatigue from repeated pressure cycling; (2) impact damage from upstream debris striking fiber matrix; (3) incorrect filter installation (media installed backward, seals not seated); (4) excessive pressure differential from restricted or clogged media. Filter collapse causes catastrophic system contamination as 100% of upstream fluid (containing all particles) flows through the rupture directly into the system, causing rapid component damage. Collapsed filters account for 15–20% of hydraulic system failures and 5–10% of lube oil system failures.',
    relatedStandards: ['ISO 16889', 'ISO 6264', 'SAE J1211', 'SAE J1539'],
    relatedTechnologies: ['NANOFORCE', 'SYNTRAX', 'MACROCORE', 'DURATECH'],
    sections: [
      {
        heading: 'Filter Media Structure and Strength Requirements',
        body: 'Filter elements consist of pleated synthetic microfiber (polyester, nylon) or cellulose paper media supported by outer cage structures. Media pleats increase surface area for dirt capture (typical 10–40 m² per liter element volume). Media thickness: 0.3–1.0 mm for synthetic, 0.5–2.0 mm for cellulose. Fiber diameter: 1–10 µm synthetic, 5–30 µm cellulose. Media tensile strength (along pleat direction): 5–15 kPa for standard media, 20–40 kPa for reinforced media. Burst strength (maximum differential pressure before rupture): standard media 3.5–5 bar, reinforced media 10–15 bar. Design pressure differential limits: (1) Normal operating differential: 0.5–2 bar (depends on filter type and media); (2) Warning signal threshold (visual/electrical indicator): 2.5–3.5 bar; (3) Bypass valve opening (emergency protection): 3.5–5 bar (standard) or 5–8 bar (reinforced media); (4) Media rupture threshold: 6–12 bar (exceeds bypass valve setpoint, indicating bypass valve failure or plugged bypass line). Collapse scenarios: (1) Media fatigue collapse — pleats stressed at near-limit pressure (3–4 bar) for extended time (100+ hours) develop micro-cracks; continued cycling causes crack propagation, sudden fiber matrix failure; (2) impact rupture — upstream debris (rock, scale from pipe corrosion, product of wire-draw contamination) strikes media at high velocity, puncturing fiber matrix; (3) seal failure collapse — if bypass valve sticks closed or bypass port is blocked (debris lodged in bypass port), pressure differential exceeds burst strength, media ruptures catastrophically.',
      },
      {
        heading: 'Pressure Cycling and Media Fatigue',
        body: 'Filter media undergoes cyclic stress during normal operation: (1) during engine start (cold fluid): initial pressure spike as cold viscous fluid resists flow, media pressure reaches 2–3 bar; (2) during load transients: proportional valve shift or load change causes pressure ripple ±1–2 bar, cycling pleats repeatedly; (3) during filter saturation: as dirt accumulates, media clogs progressively, differential pressure increases from 0.5 bar (clean) to 2 bar (half-life) to 3+ bar (end-of-life); (4) during system pressure surge: system shock from proportional valve closing abruptly, load holding valve pilot failure, or accumulator blow-down can create 50–100 bar pressure spike (brief, <1 second), far exceeding normal operating range. Media fatigue follows S-N curve (stress-cycle curve): at 50% of burst strength (2.5 bar), synthetic media can withstand ~1 million pressure cycles (500+ hours operation) before micro-crack initiation. At 60% burst strength (3.5 bar), media life drops to ~100,000 cycles (50 hours). At 70% burst strength (4.2 bar), media failure occurs within 1000–10,000 cycles (5–20 hours). Real-world example: filter installed with 2.5 bar normal operating pressure, running 8 hours/day, experiences ~500 pressure cycles per hour (load transients + proportional valve response) = 4000 cycles/day. At 50% burst strength stress, this filter reaches 1 million cycle limit in ~250 days (8–9 months). If operating pressure creeps to 3 bar (dirt accumulation), filter life drops to 50–100 days. Operator failure to replace filter at warning (3.5 bar pressure indicator) results in catastrophic media failure within days.',
      },
      {
        heading: 'Unfiltered Fluid Ingestion and Secondary System Damage',
        body: 'When filter media ruptures, 100% of upstream fluid bypasses the media and flows directly into the system. System damage cascades: (1) Immediate contamination shock — if upstream fluid is ISO 22/20/18 or worse, the downstream system (designed for ISO 17/15/12) suddenly receives 10–1000× higher particle concentration; (2) Proportional valve erosion — proportional valve spools (clearance 2–5 µm) and pilot stage orifices (0.3–0.8 mm diameter) exposed to abrasive particles cause erosion, creating grooves and reducing sealing; proportional valve response deteriorates immediately (sluggish response, loss of proportional control), within 2–10 hours of continued operation proportional valve stiction (valve jams) occurs; (3) Pump inlet contamination — if filter rupture occurs on pump outlet (common in mobile hydraulic systems), contaminated fluid re-circulates through pump, causing rapid cavitation and wear as described in PUMP_FAILURE mode; pump seizure within 10–50 hours; (4) Actuator spool wear — hydraulic cylinders and motor spools subjected to abrasive particles, seals erode and internal leakage increases exponentially, load drift and loss of control within hours; (5) Accumulator seal degradation — if hydraulic accumulator precharged by unfiltered fluid, seal materials (TEFLON, elastomer) exposed to particle abrasion, seal failure causes gas/fluid mixing, accumulator function loss. Complete system consequence: when filter collapse is detected (high system temperatures, proportional valve erratic behavior, load drift), system must be shut down immediately and fluid completely replaced + all components flushed. Depending on system size and component damage, recovery cost: €50,000–200,000 and 5–10 days downtime (includes fluid replacement, component cleaning/flushing, proportional valve rebuilds, complete fluid sampling and analysis before restart).',
      },
      {
        heading: 'ISO 16889 Strength Testing and Filter Element Quality Assurance',
        body: 'ISO 16889 includes structural strength testing to ensure filter elements can withstand expected pressure differentials without rupture. Relevant tests: (1) Collapse test (ISO 16889 Section 6.7) — filter element mounted in test fixture, pressure differential gradually increased until media ruptures or structural integrity fails; measurement: maximum differential pressure before failure; acceptance criteria: burst strength ≥ 1.5× maximum design pressure (safety factor of 1.5); (2) Fatigue test (ISO 16889 Section 6.8) — filter element subjected to cyclic pressure from 0 to 2.5 bar at 10 cycles per minute for 1 million cycles; after fatigue, burst strength measured; acceptance: burst strength degradation <15% after 1 million cycles; (3) Media integrity test — after pressure testing, filter element examined for tears, separation of pleats, cage damage; acceptance: zero visible damage. These tests ensure production filters meet safety standards. However, test conditions (clean lab environment, new media) do not replicate field conditions: (1) Age degradation — field-used synthetic media exposed to UV (if in transparent bowl), oxidation, thermal cycling loses strength 10–20% over 1–2 years; (2) Upstream contamination — rough particles and scale impact media during operation, creating weak points undetected by lab testing; (3) Installation damage — field technicians may damage media during installation (improper handling, incorrect seating of seals, cross-threading), creating rupture nucleation sites. Quality assurance: premium filter brands (ELIMFILTERS NANOFORCE, SYNTRAX) undergo extended fatigue testing (5–10 million cycles equivalent) to ensure robustness; additionally, all production batches sampled and burst-tested to verify compliance.',
      },
      {
        heading: 'Differential Pressure Monitoring and Filter Replacement Strategy',
        body: 'Filter service life is determined by differential pressure rise as media clogs with dirt: (1) Clean filter (0–1000 hrs): differential pressure 0.3–0.8 bar (baseline); (2) Mid-life filter (1000–3000 hrs): differential pressure 1.5–2.5 bar (dirt accumulation); (3) End-of-life filter (3000–5000 hrs): differential pressure 3.0–3.5 bar (media nearly saturated); (4) Critical condition (>3.5 bar): filter at end-of-life, replacement urgent. Differential pressure monitoring strategy: (1) Visual indicator (mechanical) — pop-up piston or flapper mechanism triggers at preset pressure (typically 3.5 bar), provides instant visual warning; cost: €5–15 per indicator; maintenance: replace indicator after each filter change; (2) Electrical switch (limit switch) — electrical contact closes when pressure exceeds threshold, triggers warning light on operator panel or automatic data logging; cost: €20–50; (3) Differential pressure transmitter (analog 4–20 mA output) — continuously measures and reports differential pressure to system controller, enables pressure trending and predictive maintenance; cost: €80–150; enables data logging and analysis. Maintenance procedure: replace filter when differential pressure indicator signals replacement (do not wait for system malfunction or high-temperature warning). Filter life varies by application: hydraulic systems 2000–5000 hours, lube oil systems 500–1500 hours (shorter because lube oil particles are finer and clog media faster). Preventive action: when differential pressure reaches 75% of replacement threshold (2.5 bar on 3.5 bar setpoint), schedule filter replacement within 1–2 weeks rather than waiting for maximum pressure; this avoids catastrophic failure from pressure spike or bypass valve sticking.',
      },
      {
        heading: 'Filter Collapse Case Study: Mobile Equipment Maintenance Failure',
        body: 'Excavator (25-ton class, CAT 390), operating in quarry (dusty environment). Baseline: primary lube oil filter recommended replacement at 500 operating hours. Problem: Maintenance technician deferred filter replacement (cost-saving measure) at 650 hours due to budget constraints; continued operation to 750 hours. At 720 hours, operator noticed white smoke from engine and loss of power response. System diagnostics: lube oil pressure low (2 bar vs. normal 4 bar), lube oil temperature high (90°C vs. normal 70°C). Inspection: lube oil filter differential pressure indicator reading maximum (bypass valve open, fluid circulating unfiltered). Root cause: filter media fatigue collapse from 10+ bar pressure cycling during cold-start transients; media rupture created continuous bypass passage. Unfiltered lube oil containing ISO 22/20/18 contamination (dirt accumulated during 250-hour over-run) circulating through engine bearings at full speed. Consequence: within 2 hours of continued operation with collapsed filter, engine bearing wear rate accelerated 50–100×, bearing clearances increased from normal 0.05 mm to 0.3 mm, bearing seizure occurred. Engine shutdown and inspection revealed bearing pitting and scoring, engine overhaul required (€18,000). Fluid analysis: ISO cleanliness 24/22/20 (catastrophically contaminated), wear debris (ferrous, copper, tin from bearing materials) 2000+ ppm. Remediation: (1) Complete engine teardown, bearing/crankshaft replacement; (2) complete lube oil system flush (drain, fill with flushing oil, run engine 2 hours, repeat twice); (3) replace all filters and breather; (4) replace all seals and gaskets; (5) complete fluid analysis before returning to service. Total cost: €28,000–35,000. Downtime: 7 days. Lessons: Filter replacement at manufacturer recommendation is not optional; differential pressure monitoring prevents this class of failure; deferred maintenance creates exponential cost/downtime penalties.',
      },
    ],
    faqs: [
      {
        question: 'How can filter media collapse occur suddenly even if the filter is not visibly clogged?',
        answer: 'Filter media collapse is typically caused by fatigue rather than clogging. If a filter operates continuously near its maximum pressure differential (2.5–3.5 bar), pleated media undergoes millions of stress cycles during load transients and proportional valve responses. Each cycle creates micro-stress in the fiber matrix. After 100,000–1,000,000 cycles (50–500 hours depending on stress level), micro-cracks initiate and propagate until media ruptures catastrophically. The rupture can occur suddenly without warning if detection systems (visual indicator, pressure switch) are absent or ignored. Additionally, impact damage from upstream debris can rupture media instantly regardless of clogging condition.',
      },
      {
        question: 'Why does bypass valve failure cause more severe damage than a clogged filter?',
        answer: 'Bypass valves open at 3.5–5 bar differential pressure, allowing unfiltered fluid to recirculate to tank while protecting filter media from rupture. If bypass valve sticks closed (hydraulic lock, dirt jamming spool), differential pressure exceeds bypass setpoint and rises to 6–12 bar (media burst strength), rupturing media catastrophically. Additionally, if bypass valve sticks partially open, system operates with reduced flow and partial filtration, allowing some unfiltered fluid to enter downstream. This causes gradual contamination of hydraulic components rather than the sudden shock of complete media rupture, but components still accumulate wear particles over time. Maintenance: inspect and clean bypass valve annually; if stuck valve detected, replace it immediately.',
      },
      {
        question: 'How much damage occurs if a filter collapses and unfiltered fluid enters a proportional valve circuit?',
        answer: 'Proportional valve spools operate with 2–5 µm clearances and pilot orifices of 0.3–0.8 mm. If upstream contamination is ISO 22/20/18 (1000+ particles per 100 mL >4 µm), and unfiltered fluid enters proportional valve at this concentration, damage occurs in stages: Within 1 hour: proportional valve response slows noticeably (0.5–1 second response time vs. normal 0.1–0.2 seconds); Within 2–5 hours: valve stiction (sticking) occurs intermittently; Within 10 hours: valve jams completely, requires replacement. Cost: proportional valve replacement €8,000–15,000, system flushing €5,000–10,000, total €15,000–25,000. This is why filter collapse must be detected and corrected immediately.',
      },
      {
        question: 'What is the difference between media fatigue collapse and impact rupture and how is each prevented?',
        answer: 'Media fatigue collapse occurs from cyclic pressure stress over time; prevention: (1) monitor differential pressure continuously; (2) replace filter before reaching warning pressure (3–3.5 bar); (3) maintain bypass valve in good condition so it opens before media ruptures; (4) avoid excessive system pressure spikes (ensure accumulator is properly precharged, proportional valve response is smooth). Impact rupture occurs when debris (>10 µm particles, scale, foreign objects) strikes media at high velocity; prevention: (1) install upstream pre-filter or strainer (25–100 µm) to capture large debris before it reaches main filter; (2) ensure tank breather is filtered (ISO 5011 pre-filter) to prevent dust ingress; (3) use offline kidney-loop filtration to gradually remove contamination before it concentrates enough to cause high-velocity impact events.',
      },
      {
        question: 'Why is filter replacement at manufacturer recommended intervals critical to system reliability?',
        answer: 'Manufacturers specify filter replacement intervals based on lab testing of media life and dirt capacity under nominal operating conditions. Deferred replacement allows media to operate beyond design limits, increasing fatigue stress. Running a filter 1.5–2× rated intervals increases fatigue damage exponentially — a filter rated 500 hours experiencing 750 hours of operation shows burst strength degradation of 30–50%. Additionally, extended operation allows dirt to accumulate beyond nominal levels, increasing system contamination. When filter finally ruptures (or bypass valve opens in emergency), system contamination shock is severe (ISO 22/20/18 vs. designed ISO 17/15/12). Following OEM replacement intervals costs €100–300 per filter change but prevents €20,000–40,000 system damage and €50,000+ downtime costs.',
      },
    ],
    keyParameters: [
      { label: 'Synthetic media burst strength', value: '6–12 bar' },
      { label: 'Media fatigue limit (1M cycles)', value: '2.5–3.5 bar' },
      { label: 'Proportional valve spool clearance', value: '2–5 µm' },
      { label: 'Normal operating pressure differential', value: '0.5–2 bar' },
    ],
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
    metaDescription: 'Varnish formation: oil oxidation byproducts, lacquer deposition, proportional valve stiction. Temperature-driven oxidation. Offline filtration strategy.',
    definition: 'Varnish formation is the polymerization and deposition of oil oxidation byproducts (lacquers, polar gums, resins) on internal component surfaces. Varnish consists of high-molecular-weight hydrocarbon polymers (>1000 mass units) formed when lubricating oil oxidizes at elevated temperatures (>60°C). These polymers precipitate as thin films on metal surfaces, particularly valve spools, pilot orifices, and bearing surfaces. Varnish reduces clearances and increases friction; proportional valve response time increases 3–5×, load drift occurs, and seizure is possible. Varnish formation occurs even in well-maintained systems if fluid temperature exceeds 60–65°C continuously.',
    relatedStandards: ['ISO 16889', 'ISO 4406', 'ASTM D2272', 'ISO 12922'],
    relatedTechnologies: ['SYNTRAX', 'DURATECH', 'NANOFORCE'],
    sections: [
      {
        heading: 'Oil Oxidation Chemistry and Varnish Formation Mechanisms',
        body: 'Lubricating oil oxidation is a chemical process where hydrocarbons in base oil react with dissolved oxygen at elevated temperature: (1) Initiation — oil temperature >60°C activates hydrogen abstraction; base oil hydrocarbons lose hydrogen atoms, forming carbon-centered radicals (R•); (2) Propagation — radicals combine with oxygen (O₂) to form peroxyl radicals (ROO•), which attack adjacent hydrocarbon molecules, creating chain-reaction oxidation cascades; (3) Termination — oxidation chain terminates when radicals recombine or react with antioxidant additives (phenolic, aminic compounds in industrial oils), producing stable but high-molecular-weight polymers; (4) Polymerization — high-MW oxidation products (resins, lacquers, gums) exceed oil solubility, precipitating as fine particles (0.1–5 µm) or adhesive films on metal surfaces. Oil oxidation rate doubles for every 10°C temperature increase (Arrhenius principle): at 50°C, oxidation proceeds slowly; at 60°C, oxidation rate 2×; at 70°C, oxidation rate 4×; at 80°C, oxidation rate 8×; at >90°C, oxidation rate 15–20× baseline. Real-world example: a hydraulic system designed for 55°C normal operation experiencing chronic overheating to 70°C due to worn pump or clogged cooler shows oxidation rate 4× faster, reducing oil life from 2000 hours to 500 hours before varnish deposition becomes problematic. Antioxidant additives in mineral oils are consumed (oxidized) as they neutralize free radicals; typical antioxidant reserve capacity (ASTM D2272 RPVOT test): mineral oils 80–120 minutes oxygen absorption at 99°C; after 1000–2000 hours at elevated temperature, RPVOT depletes from 100 minutes to 20–30 minutes, indicating exhausted antioxidant reserve and imminent varnish formation.',
      },
      {
        heading: 'Varnish Deposition on Control Surfaces',
        body: 'Varnish deposits preferentially on high-energy surfaces (proportional valve spools, pilot stage orifices, bearing races, pump swashplate) where metal-fluid friction heats oil locally to 100–150°C, even if bulk oil temperature is only 70°C. Deposition mechanism: (1) Oil film thinning — varnish-containing oxidation products precipitate in oil film between moving surfaces, initially forming nano-scale films 0.01–0.1 µm thick; (2) Film adhesion — varnish films bond strongly to metal oxide (Fe₂O₃, FeO) surface layers through van der Waals forces and hydrogen bonding; (3) Cumulative buildup — with continued operation, multiple layers accumulate, varnish film thickness increases from 0.1 µm to 1–5 µm over 500–2000 hours; (4) Surface roughness increase — varnish films are sticky and irregular, increasing surface roughness and friction coefficient from 0.05 to 0.15–0.30 (3–6× increase). Effect on proportional valve performance: proportional valve spool clearance nominal 2–3 µm; varnish film buildup of 1–2 µm on spool surfaces reduces clearance to <1 µm locally, causing friction increase and drag. Proportional valve response time (time to achieve 90% rated flow) increases from 0.1–0.2 seconds to 0.5–2 seconds; operator perceives "sluggish" or "mushy" valve response. Pilot-stage orifices (0.3–0.8 mm diameter) can be partially blocked by varnish precipitation, reducing pilot flow and causing proportional valve stiction (valve jams intermittently). Proportional valve function becomes unreliable; system fails to maintain proportional load control, and complete proportional valve replacement is required (€8,000–15,000).',
      },
      {
        heading: 'Varnish Indicators and System Performance Degradation',
        body: 'Varnish formation manifests through measurable system symptoms: (1) Proportional valve response time slowing — initial sign, noticed by operators as delayed response to control inputs; proportional valve design tolerance typically allows 50% response time increase before alarm thresholds, so 0.2 second nominal becoming 0.3 seconds is first warning; (2) Load drift acceleration — proportional valve pilot leakage increases due to varnish film on spool, causing load drift from <0.5 cm/min to 2–5 cm/min (implement creeps when proportional valve is centered); (3) System temperature elevation — varnish film increases friction, friction heat increases system temperature 5–10°C above baseline; if cooler duty is unchanged, steady-state system temperature rises as varnish film buildup progresses; (4) Hydraulic noise increase — varnish-roughened valve surfaces cause turbulent flow, audible as squealing or squeaking from proportional valve region; (5) Fluid color change — oil darkens from amber/translucent to dark brown/opaque; oil color is subjective but ISO 4406 particle count increases significantly (from 17/15/12 to 20/18/16) due to varnish particles precipitating in bulk fluid. Lab detection methods: (1) ASTM D2272 RPVOT (Rotary Pressure Vessel Oxidation Test) — measures remaining antioxidant reserve; RPVOT <30 minutes indicates severe oxidation and imminent varnish formation; (2) TAN (Total Acid Number, ASTM D664) — measures organic acids produced by oxidation; TAN >2 mg KOH/g indicates significant oxidation; TAN >5 mg KOH/g indicates severe oxidation; (3) ISO 4406 particle count trending — rising particle count indicates varnish precipitation; (4) Ferrography visual examination — slide containing oil particles viewed under microscope shows varnish lacquer deposits; oxidized oil deposits appear as tan/brown lacquer films vs. bright metallic wear particles.',
      },
      {
        heading: 'Temperature Management and Oxidation Prevention Strategy',
        body: 'Varnish formation is fundamentally temperature-driven; prevention strategy prioritizes thermal management: (1) Cooler sizing — ensure hydraulic cooler (heat exchanger) sized for peak heat load; cooler duty = pump input power - output work + system losses; undersized cooler allows bulk fluid temperature to exceed 60°C, triggering oxidation; monthly fluid temperature monitoring identifies cooler performance degradation; (2) Cooler maintenance — clean cooler fins regularly (blockage increases outlet temperature); inspect cooler core for leaks (coolant contamination increases oil TAN); test cooler thermostatic valve operation; (3) Fluid selection — synthetic PAO (polyalphaolefin) fluids have superior oxidation resistance vs. mineral oils; RPVOT synthetic 200–300 minutes vs. mineral 80–120 minutes; oxidation rate at 80°C synthetic oils = 1/4 to 1/2 mineral oil rate; synthetic fluids cost 2–3× mineral oils but extend fluid life 2–3×, providing neutral or positive ROI; (4) Antioxidant additive package — modern ISO VG 46 industrial oils contain 1–2% antioxidant additives; oversized or custom formulations with enhanced antioxidant packages (anti-wear AW, phenolic, aminic additives) available for high-temperature applications (€120–200 per drum vs. standard €80 per drum, marginal cost in large systems); (5) Offline kidney-loop filtration with absorbent media — kidney-loop removes oxidation byproducts (0.1–5 µm varnish particles) continuously during idle time; absorbent media (activated resin, synthetic sorbent) absorb polar oxidation products, additionally extending fluid life by neutralizing acids and polar oxidation intermediates; kidney-loop 3 µm + absorbent cartridge extends fluid life 50–100% in high-temperature applications.',
      },
      {
        heading: 'Varnish Removal and System Recovery',
        body: 'Once varnish deposits form on proportional valve spools and internal passages, mechanical removal required: (1) Proportional valve disassembly and cleaning — valve removed from manifold, spool extracted, varnish deposits mechanically removed (abrasive polishing, solvent soak, sonic cleaning); time-intensive procedure 4–8 hours labor per valve; cost €800–2,000 per valve rebuild; (2) System flushing — high-velocity flushing fluid (ISO 15/13/10 or cleaner baseline fluid) circulated through system at high flow rate (3–5× nominal pump flow) using portable flushing cart; varnish deposits dislodged and carried to flushing cart filter; flushing typically 8–16 hours for 10–50 liter systems; (3) Complete fluid replacement — existing fluid drained and replaced with fresh ISO VG 46 fluid; existing fluid cannot be cleaned retroactively (oxidation products cannot be unoxidized); (4) Filter replacement — all filters (main, secondary, pilot stage) replaced; existing filters already laden with oxidation products; (5) System recommission — fluid sampled and analyzed for particle count, TAN, RPVOT to verify system cleanliness before return to normal operation. Recovery cost: €8,000–15,000 (valve rebuilds + flushing labor + new fluid + filters); downtime 5–7 days. Prevention cost (cooler maintenance, synthetic fluid premium, kidney-loop): €200–500 annually. ROI: Prevention is 20–30× more cost-effective than recovery.',
      },
      {
        heading: 'Hydraulic System Overheating Case Study: Mobile Equipment Temperature Failure',
        body: 'Telehandler (5-ton lifting capacity, rough terrain forklift) in agricultural operation. Baseline: designed for peak hydraulic system temperature 55°C during normal lifting cycles. Problem: Operator complaint of sluggish proportional valve response (0.5–1 second delay vs. normal 0.1–0.2 second); load drift of 2–3 cm/min (implement creeps when control lever centered). Investigation: hydraulic fluid temperature measured at 75–80°C during operation (20°C above design). Root cause: cooler thermostatic valve stuck partially open (cooler bypass valve), allowing fluid to bypass cooler even when temperature exceeded setpoint. Secondary issue: cooler fins clogged with chaff and dust (farm equipment environment), reducing heat transfer capacity 30–40%. Fluid analysis: ISO cleanliness 19/17/15 (above nominal 17/15/12), RPVOT 35 minutes (indicating oxidation, normal >100 minutes), TAN 1.8 mg KOH/g (elevated, normal <1.0), ferrography showed lacquer varnish deposits. Implementation: (1) Replace cooler thermostatic valve; (2) Clean cooler fins thoroughly; (3) install cooler pre-filter (dust ingress prevention); (4) complete system flush with flushing fluid, 12-hour circulation at high flow; (5) proportional valve spool removed and cleaned of varnish deposits (4 hours labor); (6) replace all system filters; (7) fill with fresh synthetic PAO ISO VG 46 fluid. Results: System temperature restored to 55°C baseline. Proportional valve response time returned to 0.15 seconds. Load drift eliminated. Fluid RPVOT improved to 250 minutes (synthetic fluid). Expected fluid life: 2500 hours (vs. 800 hours in previous mineral oil cycle). Annual savings: cooler maintenance €300 + extended synthetic fluid cost €800 (premium) - mineral fluid cost €300 (savings) = net €800/year additional cost, offset by eliminated fluid changes and system repairs; total 5-year savings €4,000–8,000 from prevented proportional valve failures and extended fluid life.',
      },
    ],
    faqs: [
      {
        question: 'Why does varnish formation occur faster in hydraulic systems than in engine oil systems at the same temperature?',
        answer: 'Hydraulic systems operate at steady temperatures (50–70°C nominal) for 8–10 hours continuously; engine oils experience thermal cycling (engine cold-start 0–20°C, full-power operation 80–100°C, shutdown 20°C) which provides temporary breaks in oxidation reaction. Additionally, engine oil crankcase ventilation systems vent volatile oxidation byproducts to atmosphere, reducing concentration of oxidation products in bulk oil. Hydraulic systems are sealed, trapping all oxidation products in oil; concentration increases continuously. Furthermore, proportional valve pilot orifices and spool surfaces experience local hot-spot temperatures 120–150°C even when bulk oil is 70°C, creating localized varnish deposition zones. Result: hydraulic systems experience varnish formation at lower bulk fluid temperatures and faster rates than comparable engine oils.',
      },
      {
        question: 'What is the difference between varnish and sludge and which is more problematic?',
        answer: 'Varnish is polymer oxidation products that deposit as thin adhesive films (0.1–5 µm) on metal surfaces; forms preferentially on high-energy surfaces (valve spools, bearings) where friction heat accelerates oxidation. Sludge is coarser oxidation byproducts (>5 µm) that accumulate as sediment at the bottom of reservoirs; forms when varnish precipitation exceeds solubility and settles. Varnish is more problematic because it deposits directly on control surfaces (proportional valve spools, pilot orifices), reducing clearances and increasing friction. Sludge primarily settles at tank bottom and is removed by kidney-loop or flush-out procedures. A system can tolerate moderate sludge accumulation (sludge can be filtered out) but cannot tolerate proportional valve varnish (varnish requires mechanical cleaning or valve replacement).',
      },
      {
        question: 'How much can fluid life be extended by using synthetic oils and why is the oxidation resistance difference so large?',
        answer: 'Synthetic PAO (polyalphaolefin) fluids extend life 2–3× vs. mineral oils in oxidative stress conditions. Reason: mineral oils contain 5–20% aromatic hydrocarbons (very reactive to oxidation); synthetics contain <1% aromatics. Oxidation rate depends on molecular reactivity; more aromatic content = faster oxidation. Additionally, synthetic PAO base stocks have more uniform molecular structure, allowing more uniform distribution of antioxidant additives throughout; mineral oils have variable molecular structure, creating oxidation-prone zones. Real-world example: mineral ISO VG 46 operating at 70°C bulk oil temperature reaches RPVOT depletion (>100 min to <30 min) in 800–1200 hours. Synthetic PAO ISO VG 46 at same temperature reaches RPVOT depletion in 2000–3000 hours (2.5–3× longer). Cost: synthetic fluid €180/drum vs. mineral €80/drum = €100 premium per drum. Fluid consumption 2000 hrs ÷ 2500 hr life = 0.8 drums synthetic = €144 cost. Mineral oil consumption 2000 hrs ÷ 1000 hr life = 2 drums = €160 cost. Net savings: €16 over 2000 hours plus elimination of system downtime from varnish failure.',
      },
      {
        question: 'Can varnish deposits on proportional valve spools be cleaned without disassembling the valve?',
        answer: 'Not effectively. In-system flushing (high-velocity fluid circulation) can remove loose varnish precipitate from bulk fluid and help prevent future deposition, but cannot remove adhesive varnish films already bonded to valve spool surfaces. The only effective method is valve disassembly, mechanical cleaning of spool surfaces (abrasive polishing, sonic ultrasonic cleaning, solvent soak), inspection for wear damage (scratches, scoring), and reassembly with new seals. If valve surfaces are significantly damaged (deep grooves from varnish hardening and spool rubbing), the valve spool must be replaced (€3,000–5,000 per spool replacement). This is why prevention (temperature management, antioxidant maintenance) is critical.',
      },
      {
        question: 'How does an offline kidney-loop help prevent varnish formation and what filtration grade is required?',
        answer: 'Offline kidney-loop circulates stored hydraulic fluid through a 3–10 µm filter and absorbent media (activated resin, synthetic sorbent) during idle time (nights, weekends) or continuously. The filter removes varnish particles (0.1–5 µm) before they deposit on valve surfaces. The absorbent media absorbs polar oxidation products and acids, neutralizing oxidation intermediates and extending antioxidant reserve life. By removing oxidation byproducts before they accumulate to critical levels, kidney-loop delays varnish formation onset by 50–100% (fluid can operate 1500–2000 hours in kidney-loop system vs. 800–1000 hours without). Cost: kidney-loop system €15,000–25,000 for 10–50 liter hydraulic system; operating cost €50–100/month electricity + filter replacement. Payback: 1–2 years from prevented proportional valve failure.',
      },
    ],
    keyParameters: [
      { label: 'Oil oxidation rate doubling temperature', value: '10°C (Arrhenius)' },
      { label: 'Critical bulk oil temperature', value: '60–65°C' },
      { label: 'Varnish film thickness on spools', value: '0.1–5 µm' },
      { label: 'Antioxidant RPVOT depletion threshold', value: '<30 min' },
    ],
  },
  {
    id: CANONICAL_PROBLEM_IDS.OXIDATION,
    slug: 'oxidation',
    name: 'Oxidative Degradation',
    category: 'chemical-degradation',
    severity: 'medium',
    status: 'published',
    relatedSystems: ['lubrication-protection'],
    metaDescription: 'Oil oxidative degradation: acid formation, viscosity loss, additive depletion. ASTM D2272 RPVOT testing. Fluid life management and synthetic oil selection.',
    definition: 'Oxidative degradation is the progressive chemical breakdown of lubricating oil base stocks and additives through reaction with dissolved oxygen at elevated temperatures, resulting in acid formation (TAN increase), viscosity loss, additive package depletion, and fluid functional failure. Oxidation rate doubles for every 10°C temperature increase. At 50°C operation, mineral oil oxidation rate is baseline (reference 1×); at 60°C, oxidation rate 2×; at 70°C, oxidation rate 4×; at 80°C, oxidation rate 8×. Oxidation is irreversible chemical change — oxidized fluid cannot be restored; fluid replacement is required when oxidation markers (TAN >2.0 mg KOH/g, RPVOT <30 minutes, viscosity loss >10%) indicate functional failure.',
    relatedStandards: ['ASTM D2272', 'ASTM D664', 'ISO 3104', 'ISO 12922'],
    relatedTechnologies: ['SYNTRAX', 'DURATECH'],
    sections: [
      {
        heading: 'Oil Oxidation Chemistry and Acid Formation',
        body: 'Lubricating oil oxidation follows free-radical chain reaction mechanism: (1) Initiation phase — oxygen (O₂) molecules dissolved in oil from air dissolve at oil-air interface; at temperature >50°C, thermal energy activates C-H bond breaking in hydrocarbon base stock molecules; hydrogen atom abstraction produces carbon-centered radical (R•), initiating oxidation cascade; (2) Propagation phase — carbon-centered radical combines with dissolved oxygen, forming peroxyl radical (ROO•); peroxyl radical attacks adjacent hydrocarbon molecules (R\'H), abstracting hydrogen and forming new radical (R\'), while producing hydroperoxide (ROOH); hydroperoxide is unstable at elevated temperature, decomposing to produce hydroxyl (•OH) and alkoxyl (RO•) radicals, both highly reactive; cascade propagates as fresh radicals attack more hydrocarbon molecules; (3) Acid formation — hydroperoxides and free radicals react with water (moisture from air ingress, condensation), producing organic acids (carboxylic, formic, acetic) and mineral acids (sulfuric, hydrochloric from fuel oxidation products in engine applications); acids accumulate in oil, measured as Total Acid Number (TAN) in mg KOH/g; baseline mineral oil TAN <0.5 mg KOH/g, increases 0.05–0.1 mg KOH/g per 1000 operating hours in typical conditions; (4) Termination phase — oxidation chain terminates when free radicals recombine or react with antioxidant additives in oil; phenolic and aminic antioxidant compounds sacrifice themselves by accepting free radicals, producing stable (but high-molecular-weight) oxidation byproducts (polymers, resins, gums). Antioxidant additives are consumed (consumed = oxidized, cannot be regenerated) at rate proportional to free radical generation; when antioxidant reserve depleted, oxidation accelerates exponentially (runaway oxidation), TAN rises rapidly (0.1–0.3 mg KOH/g per 100 hours), fluid quickly becomes unusable.',
      },
      {
        heading: 'Temperature Acceleration and Oxidation Kinetics',
        body: 'Oxidation rate obeys Arrhenius equation: oxidation rate doubles for every 10–12°C temperature increase (higher activation energy oxidation reactions show smaller temperature coefficient 8–10°C per 2× rate; lower activation energy reactions show larger coefficient 15–20°C per 2× rate). Practical impact: (1) At 50°C bulk oil temperature — baseline oxidation rate 1× reference; fluid life expectancy 3000–5000 hours (3–6 months continuous operation or 1–2 years part-time); (2) At 60°C — oxidation rate 2× baseline; fluid life reduced to 1500–2500 hours; (3) At 70°C — oxidation rate 4× baseline; fluid life 750–1250 hours (2–3 months continuous operation); (4) At 80°C — oxidation rate 8× baseline; fluid life 375–625 hours (1–1.5 months continuous operation); (5) At 90°C+ — oxidation rate 15–20× baseline; fluid life 150–350 hours (1–2 weeks continuous operation); runaway oxidation likely. Local hot-spot temperatures at proportional valve pilot orifices (100–150°C) and pump piston bores (150–180°C) accelerate oxidation rates 50–200× in localized regions; oxidation products accumulate at these hot spots, causing varnish deposition and surface degradation. Fluid sampling: oil samples taken from main bulk fluid (representative of average oxidation state) show oxidation progression; oil samples from valve pilot cavity or pump return line show elevated oxidation markers 1–2 weeks before bulk fluid reaches functional failure, enabling early warning. Synthetic PAO fluids have superior temperature stability: oxidation rate increase per 10°C is ~1.5× (vs. mineral oil 2×); at 70°C synthetic oils show oxidation rate 1–2× mineral baseline (vs. mineral oil 4×); enables synthetic fluids to operate safely at 70–80°C temperatures where mineral oils would oxidize rapidly.',
      },
      {
        heading: 'Acid Accumulation and Corrosion Risk',
        body: 'Organic acids formed during oxidation are corrosive to ferrous (iron, steel) and non-ferrous (copper, tin, zinc) metals in hydraulic and lube oil systems. Acid concentration measured as Total Acid Number (TAN) in mg KOH/g: (1) Fresh mineral oil TAN <0.3 mg KOH/g (baseline, no significant acid content); (2) Acceptable operating range TAN <1.0 mg KOH/g (minor acid accumulation, system tolerates); (3) Action level TAN 1.0–2.0 mg KOH/g (acid accumulation accelerating, monitor closely, plan fluid change within 200–500 hours); (4) Critical level TAN >2.0 mg KOH/g (significant corrosion risk imminent, fluid change urgent within 50–100 hours); (5) Failure state TAN >3.5 mg KOH/g (severe corrosion active, ferrous corrosion appears as orange/red discoloration in oil, bearing wear accelerates from acid attack, fluid must be replaced immediately). Acid corrosion mechanisms: (1) Bearing wear acceleration — organic acids attack steel bearing surfaces, forming iron oxide corrosion products; corrosion accelerates wear rates 2–5× vs. neutral oil; bearing seizure risk increases exponentially with TAN >2.0 mg KOH/g; (2) Copper dissolution — non-ferrous metals (copper bushings, bronze bearing cages, tin plating on steel parts) dissolve in acidic oil; dissolved copper ions (1–50 ppm dissolved copper soluble in oil) catalyze further oxidation (copper is pro-oxidant catalyst), creating vicious cycle where dissolved copper accelerates additional oxidation; (3) Pitting corrosion on journal bearings — acid-induced pitting creates stress concentration points; pitting depth 10–100 µm can initiate bearing micro-spalling; (4) Filter element degradation — acidic oil attacks paper media and fiberglass media used in standard filters; synthetic media (polyester, nylon) more resistant; cellulose media mechanical strength decreases 20–30% in acidic fluid (TAN >2.0) due to acid hydrolysis of polymer chains; (5) Seal material degradation — elastomer seals (nitrile, EPDM, FKM) swell and soften in acidic oil; seal leakage risk increases. Management: monitor TAN via ASTM D664 titration testing every 250–500 operating hours; when TAN approaches 1.5 mg KOH/g, schedule fluid replacement within 2–4 weeks; do not operate continuously above TAN 2.0 mg KOH/g.',
      },
      {
        heading: 'Viscosity Loss and Lubricating Film Degradation',
        body: 'Oxidation causes viscosity degradation through two mechanisms: (1) Base stock viscosity loss — long-chain hydrocarbon molecules in base stock break apart (bond rupture) during oxidation, producing shorter-chain molecules with lower viscosity; viscosity loss typically 3–5% per 1000 operating hours in normal conditions (50–60°C), 10–15% per 1000 hours in high-temperature conditions (70–80°C); (2) Oxidation product viscosity addition offset — initial oxidation produces high-MW polymers and resins that increase fluid viscosity (thickening effect); however, at higher oxidation levels (TAN >2.5 mg KOH/g), varnish precipitation removes polymers from bulk fluid, reducing viscosity further; net result: initially oxidation increases viscosity slightly (+5%), but progression leads to net viscosity loss (−10% by TAN 3.0 mg KOH/g). ISO VG 46 mineral oil (baseline viscosity 46 mm²/s at 40°C): (1) Fresh oil 46 mm²/s (reference); (2) After 1000 hrs at 60°C: 44–45 mm²/s (2–3% loss); (3) After 2000 hrs at 60°C: 42–44 mm²/s (4–8% loss); (4) After 3000 hrs at 60°C: 40–42 mm²/s (8–13% loss); (5) After 1500 hrs at 70°C: 38–41 mm²/s (10–17% loss). Lubricating film thickness (hydrodynamic film) depends on oil viscosity: for sliding bearings, film thickness ∝ viscosity; viscosity loss of 10% reduces film thickness ~8%, increasing friction 20–30%, increasing wear rates 5–10×. System consequence: hydrostatic bearing film pressure (pump or motor swashplate) decreases as viscosity drops; if swashplate bearing designed for ISO VG 46 nominal viscosity, operation on degraded fluid (viscosity 40 mm²/s) at same pressure shows bearing clearance increase and leakage increase 30–50%. Proportional valve spool damping (viscous damping of spool motion) decreases with viscosity loss; valve response time increases (slower spool movement), proportional valve control quality deteriorates. Management: monitor fluid viscosity via ASTM D445 kinematic viscosity testing at 40°C; when viscosity degradation reaches 10% below nominal (ISO VG 46 drops below 41.4 mm²/s), schedule fluid change; do not operate with >15% viscosity loss.',
      },
      {
        heading: 'Antioxidant Depletion and Oxidation Reserve Capacity Testing',
        body: 'Antioxidant additives (phenolic compounds, aminic compounds, typical concentration 0.5–2% by weight in industrial oils) function as free-radical scavengers: antioxidant molecule accepts free radical (R•), stabilizing it, and producing stable neutral product; however, each antioxidant molecule can accept finite number of free radicals (2–5 per antioxidant molecule depending on structure) before being consumed. Antioxidant reserve capacity measured via ASTM D2272 Rotating Pressure Vessel Oxidation Test (RPVOT): (1) Test procedure — oil sample heated to 99°C in pressurized vessel with pressurized pure oxygen at 3.4 bar; oxygen bubbled through oil while sample is vigorously stirred; oxidation accelerated by high temperature and pure oxygen environment; oxidation rate and acid formation continuously measured via oxygen consumption rate monitoring; (2) End-point determination — test continues until oxygen consumption rate increases sharply (inflection point), indicating antioxidant reserve completely consumed; (3) Measurement — time (in minutes) required to reach inflection point = RPVOT value, measured in minutes oxygen absorption time at 99°C. Interpretation: (1) Fresh mineral oil RPVOT 80–120 minutes (robust antioxidant reserve); (2) Acceptable operating condition RPVOT >60 minutes (adequate reserve for continued operation); (3) Action level RPVOT 30–60 minutes (antioxidant reserve 50% consumed, monitor closely, plan fluid change within 200–500 hours); (4) Critical level RPVOT <30 minutes (antioxidant reserve <25% remaining, runaway oxidation imminent, fluid change urgent); (5) Complete depletion RPVOT <10 minutes (antioxidant reserve exhausted, oxidation accelerates exponentially, TAN increases 0.2–0.5 mg KOH/g per 100 hours, fluid must be replaced immediately or within 50–100 hours). Synthetic PAO oils provide superior antioxidant reserve: fresh synthetic RPVOT 200–300 minutes (2.5–3× mineral oil); at same operating temperature, synthetic oil retains RPVOT >100 minutes after 2000 hours vs. mineral oil RPVOT <20 minutes at 1500 hours; oxidation performance advantage is major reason for synthetic fluid superiority in extended-life applications.',
      },
      {
        heading: 'Fluid Life Extension Through Thermal Management and Synthetic Selection',
        body: 'Oxidative degradation is fundamentally temperature-driven; managing fluid temperature and oxidation rate is primary strategy for extending fluid life and reducing ownership cost. Strategy 1 — Temperature Management: (1) Cooler maintenance — ensure cooler (heat exchanger) is properly sized and clean; cooler fouling or undersizing allows bulk fluid temperature to rise 10–20°C above design; (2) Cooler thermostat — verify thermostatic valve operates correctly; if valve opens too early, cooler may over-cool system (wasting energy and slowing viscous heating); if valve opens too late, system temperature may exceed design limit 10–15°C; (3) Insulation in cold climates — thick-walled hydraulic hoses and cooler insulation jackets reduce heat loss during warm-up, allowing faster system reach of optimal operating temperature (50–60°C) vs. operating cold (45°C) for extended periods; (4) Shutdown procedures — in cold climates, allow engine/system 10–15 minute idle period at end of shift to stabilize temperature before shutdown, reducing condensation formation and cold-soak next morning. Benefit: maintaining 50–60°C operating temperature (vs. average 65–70°C from neglected coolers) extends mineral oil life from 2000 hours to 4000 hours (2× extension) and reduces oxidation byproduct formation 2–3×. Strategy 2 — Synthetic Fluid Selection: Replace mineral ISO VG 46 with synthetic PAO ISO VG 46 (same viscosity grade, different base stock chemistry). Cost premium: synthetic €180/drum vs. mineral €80/drum = €100 extra per drum. Performance advantage: synthetic PAO at 70°C operating temperature shows oxidation rate equivalent to mineral oil at 50°C (20°C oxidation advantage); fluid life extended 3–5× (synthetic 3000–5000 hours vs. mineral 800–1200 hours at 70°C). Calculation: at 70°C, synthetic fluid costs €500/year additional (3 drums synthetic vs. 1 drum mineral) but eliminates 2–3 unplanned fluid changes, proportional valve varnish failures, and extended downtime worth €15,000–30,000 annually. ROI: net positive €10,000–25,000/year. Strategy 3 — Offline Kidney-Loop Filtration: kidney-loop with absorbent media removes oxidation byproducts (polar compounds, acids, high-MW polymers) continuously during idle time; reduces oxidation marker accumulation rate 40–60% vs. static fluid. Combined effect of strategies: ISO VG 46 mineral oil + maintained cooler + kidney-loop offline filtration can achieve fluid life equivalent to synthetic fluid at baseline cost (€200 cooler maintenance + €400/year kidney-loop operating cost = €600/year vs. €500/year synthetic premium). Choose strategy based on system accessibility and maintenance budget.',
      },
    ],
    faqs: [
      {
        question: 'How can fluid oxidation be prevented or significantly slowed down?',
        answer: 'Oxidation is fundamentally temperature-driven and follows Arrhenius kinetics (rate doubles every 10°C). The most effective prevention strategy is thermal management: ensure cooler is properly sized and maintained, verify thermostat valve opens/closes at setpoint, monitor bulk oil temperature via thermometer or data logger, maintain 50–60°C nominal operating temperature. Secondary strategy: select synthetic PAO fluids (€100–120 premium per drum) instead of mineral oils; synthetic base stocks oxidize 3–5× slower than mineral oils at equivalent temperature. Tertiary strategy: use offline kidney-loop filtration with absorbent media (€15–20K system cost) to continuously remove oxidation byproducts during idle time. Avoid: high operating temperatures >70°C (exponential oxidation rate increase), water contamination (water accelerates acid formation), aeration/foaming (air content increases oxidation rate), over-extended fluid change intervals (when oxidation markers approach critical levels, change fluid rather than pushing further).',
      },
      {
        question: 'What do RPVOT and TAN tests measure and why are both important?',
        answer: 'RPVOT (Rotating Pressure Vessel Oxidation Test, ASTM D2272) measures remaining antioxidant reserve capacity — time (in minutes at 99°C under accelerated oxidation conditions) before antioxidant package is exhausted. RPVOT indicates how much oxidation stress the fluid can still tolerate before runaway oxidation occurs. TAN (Total Acid Number, ASTM D664) measures accumulated organic acids already produced by oxidation. RPVOT = future oxidation capacity (predictive); TAN = past oxidation damage (diagnostic). Both are needed: (1) If RPVOT is high (>100 min) but TAN is already >2 mg KOH/g, fluid has already oxidized extensively and is approaching failure despite having reserve capacity; (2) If RPVOT is low (<30 min) but TAN is still <1.0 mg KOH/g, fluid is about to enter runaway oxidation phase and must be replaced immediately to prevent sudden acid spike. Monitor both parameters: RPVOT trending downward indicates accelerating antioxidant consumption (likely system is running hot); TAN trending upward indicates oxidation is already occurring. When either RPVOT <30 min or TAN >2.0 mg KOH/g, replace fluid within weeks.',
      },
      {
        question: 'Why does oxidation cause both viscosity loss and varnish formation when viscosity loss and viscosity addition seem contradictory?',
        answer: 'Oxidation produces diverse byproducts with different behaviors: (1) Base stock molecules break apart → shorter-chain molecules (lower viscosity) = net viscosity loss effect; (2) Oxidation creates high-MW polymers and resins (higher viscosity) initially offsetting viscosity loss, producing slight thickening effect early in oxidation. As oxidation progresses, however: (3) High-MW polymers exceed solubility in base oil, precipitating as varnish particles and films; varnish removal from bulk fluid means loss of viscosity-contribution from polymers, causing net viscosity loss even after initial thickening phase. Net result: oxidized oil shows both viscosity loss AND varnish presence simultaneously. This is why oxidized fluid must be replaced — you cannot separate the viscosity-loss effect from the varnish-deposition effect; both are consequences of the same oxidation chemistry.',
      },
      {
        question: 'How does dissolved copper in oxidized oil accelerate further oxidation?',
        answer: 'Copper is a pro-oxidant catalyst: copper ions (Cu²⁺) dissolved from corroded copper components in hydraulic systems (copper bushings, bronze bearing cages, tin plating on steel) catalyze free-radical formation by reacting with hydroperoxides (ROOH) formed during oxidation, decomposing them to highly reactive radicals (RO• and •OH) that attack base oil molecules at lower temperatures than uncatalyzed oxidation. This creates a vicious cycle: (1) Acidic oxidized oil corrodes copper components → copper ions dissolve into oil; (2) Dissolved copper ions catalyze additional oxidation at faster rate; (3) Faster oxidation produces more acids; (4) More acids accelerate copper corrosion further; (5) Cycle accelerates exponentially. Result: once copper corrosion begins in acidic oil (TAN >2.0 mg KOH/g), oxidation rate can increase 5–10× in subsequent hours. Prevention: avoid copper corrosion by maintaining neutral pH (TAN <1.0 mg KOH/g), use inhibited base oils with copper corrosion inhibitors, use oil with demulsibility properties that prevent water-copper-oil emulsion formation.',
      },
      {
        question: 'Why is fluid replacement sometimes more economical than trying to extend fluid life through conditioning?',
        answer: 'Once oxidation has progressed beyond certain markers (RPVOT <30 min, TAN >2.0 mg KOH/g, viscosity loss >10%), oxidation damage is essentially irreversible — you cannot chemically reverse oxidation (no process converts oxidation products back to base stock). Attempting to extend life via fluid conditioning (kidney-loop filtration, absorbent cartridges) removes future oxidation byproducts but cannot "undo" past oxidation damage. By the time oxidation markers reach critical levels, most antioxidant reserve is depleted; any oxidation stress in next operating cycle will trigger runaway oxidation. Cost analysis: fluid replacement cost €500–1000 (including change labor, filter replacement, disposal); fluid conditioning attempt cost €200–500 (kidney-loop rental, absorbent cartridges); if conditioning extends life only 200–500 hours before failure still occurs, total cost becomes €700–1500, whereas planned replacement at 2000-hour interval would have cost only €1000. Lesson: replacement at appropriate intervals (when RPVOT approaches 30–40 min or TAN approaches 1.5–2.0 mg KOH/g) is more economical than attempting conditioning after failure threshold is reached.',
      },
    ],
    keyParameters: [
      { label: 'Oxidation rate doubling interval', value: '10°C' },
      { label: 'Critical acid accumulation (TAN)', value: '2.0 mg KOH/g' },
      { label: 'Antioxidant depletion threshold (RPVOT)', value: '<30 minutes' },
      { label: 'Acceptable viscosity loss limit', value: '10% below nominal' },
    ],
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
  // Turbine-Specific: FH/FG Series (4)
  {
    id: CANONICAL_PROBLEM_IDS.BLADE_EROSION,
    slug: 'blade-erosion',
    name: 'Blade Erosion',
    category: 'mechanical-wear',
    severity: 'high',
    status: 'published',
    relatedSystems: ['air-intake-protection'],
    metaDescription: 'Compressor/turbine blade erosion: abrasive particle impact, coating loss, aerodynamic efficiency degradation. FH/FG series protection strategy.',
    definition: 'Blade erosion is progressive material loss from compressor and turbine blade surfaces caused by high-velocity impact of abrasive particles (silica, sand, metal oxides) in inlet air or process gas. Particles striking blade leading edges at 5,000-15,000 RPM create micro-impact damage, progressively removing blade material, surface coatings, and aerodynamic finish. Blade erosion reduces compressor efficiency (volumetric output drops 5-15%), increases power consumption 10-25%, raises outlet temperature 20-40°C, and eventually causes blade failure (blade fracture from stress concentration at erosion site). Erosion damage is cumulative and irreversible; once initiated, erosion rate accelerates exponentially as surface roughness increases, turbulence increases, and stress concentration deepens.',
    relatedStandards: ['ISO 5011', 'SAE J1539', 'ASTM D1856', 'ISO 12103'],
    relatedTechnologies: ['MACROCORE', 'DURATECH'],
    sections: [
      {
        heading: 'Compressor Blade Design and Erosion Vulnerability',
        body: 'Centrifugal compressor blades (FH/FG series) are aerodynamic airfoils optimized for flow efficiency and pressure rise. Blade design parameters: (1) Blade leading edge radius 0.3-1.0 mm (sharp to minimize flow separation); (2) Surface finish 0.4-1.6 µm Ra (polished aerodynamic finish minimizes boundary layer turbulence); (3) Blade material aluminum alloy (7xxx series, typical yield 450-500 MPa) or titanium alloy (high-speed stages >10,000 RPM); (4) Blade clearance from casing 0.2-0.5 mm (tight tolerance prevents recirculation leakage). Erosion vulnerability: sharp leading edge (0.3-1 mm radius) and polished surface (0.4 µm finish) are optimized for aerodynamic performance, NOT erosion resistance. When 10-50 µm abrasive particles at 100+ m/s velocity strike leading edge, impact force creates instantaneous plastic deformation and material removal. Particle kinetic energy (0.5 × m × v²) concentrated on mm²-scale impact area creates local stress 5-20× yield strength, exceeding material elastic limit. Leading edge radius 0.3 mm struck by 20 µm particle at 150 m/s creates contact stress >3000 MPa (material yields, micro-crater forms). Repeated impacts (blade rotates 5,000-15,000 times/min, exposed to particle stream continuously) accumulate micro-craters into visible erosion pattern within 100-500 operating hours in sandy environments. Real-world example: mining site compressor FG-series, inlet air from open pit (high dust environment), blade erosion reduced efficiency 20% within 200 hours, requiring compressor rebuild; cost €18,000-25,000 parts + €8,000 labor + €12,000 lost production downtime.',
      },
      {
        heading: 'Erosion Damage Progression and Efficiency Loss',
        body: 'Blade erosion progresses in three stages: (1) Initial erosion (0-100 hrs) — micro-impact craters form on leading edge, surface roughness increases from 0.4 µm to 2-5 µm, boundary layer thickness increases 10-20%, compressor efficiency drops 2-5% (volumetric output drops 100-200 m³/hr per compressor stage); outlet temperature rises 5-10°C; (2) Progressive erosion (100-500 hrs) — leading edge rounding increases from sharp 0.3 mm to 2-3 mm radius, surface finish degrades to 10-20 µm, blade aerodynamic profile distorted, shock wave formation at blade inlet changes (shock moves downstream, pressure recovery reduces), compressor efficiency drops total 10-15%, power consumption increases 20-30%, outlet temperature rises 20-30°C above baseline; (3) Critical erosion (>500 hrs) — leading edge recession 5-10 mm depth, blade profile severely compromised, compressor surge margin eliminated (compressor becomes unstable, operating point approaches surge line), blade vibrational stress increases 50-100% from asymmetric loading, micro-crack initiation begins at erosion stress concentration sites. Aerodynamic consequences: leading edge is designed as low-loss subsonic diffuser (normal shock 5-10% energy loss); when leading edge erodes and rounds, subsonic diffuser becomes supersonic, normal shock strength increases (shock loss 15-25%), shock position moves upstream into blade passage, flow separation risk increases exponentially. At critical erosion, compressor can no longer maintain rated pressure — system pressure drops 10-20%, forced to reduce inlet mass flow to avoid surge. Economic impact: compressor FG-series rated 500 m³/hr at 20 bar; with 15% efficiency loss, actual output 425 m³/hr; system designed for 500 m³/hr load cannot operate, production reduced 15% (€50,000-100,000 lost revenue per month in industrial process). Reconstruction: blade leading edge cannot be economically repaired (welding + rework €5,000-8,000 per blade, only extends life 100-200 hrs); complete blade/rotor replacement required (€15,000-30,000 per stage).',
      },
      {
        heading: 'Particle Size Effect on Erosion Rate',
        body: 'Erosion rate increases exponentially with particle size and velocity: erosion volume (V) ∝ (d^n) × (v^m), where d = particle diameter, v = velocity, n = 2.5-3.5 (size exponent), m = 2.5-3.0 (velocity exponent). Practical example: 4 µm particles at 100 m/s baseline erosion rate = 1× reference. At 8 µm particles (2× size): erosion rate increases 4-6× (exponent ~2.5). At 16 µm particles (4× size): erosion rate 15-50× reference. At 50 µm particles (12.5× size): erosion rate >1000× baseline. Velocity impact: doubling velocity from 100 m/s to 200 m/s increases erosion rate 5-7× (exponent ~2.5). Real-world environments: (1) Clean air inlet (ISO 5011 Grade 1, particles <1 µm dominated): erosion negligible, blade surface polishes actually improves with time (small particles smooth micro-roughness); (2) Dusty environment (ISO 5011 Grade 5, particles 10-50 µm significant): erosion rate 50-200× baseline, blade life 50-200 hours; (3) Sandy/mining environment (ISO 5011 Grade 7, particles 50-100+ µm): erosion catastrophic, blade life <50 hours. Desert mining: inlet particles dominated by silica (quartz, SiO₂, hardness 7 Mohs) and iron oxide (Fe₂O₃, hardness 9 Mohs); typical dust composition 60% silica, 20% iron oxide, 20% other (calcium carbonate, clays). Silica 50 µm at 150 m/s striking aluminum blade (hardness 3 Mohs) creates erosion crater >1 mm depth per impact. Compressor FG-series at 12,000 RPM experiences 200 blade impacts per second; 50 µm silica particles at 0.1% concentration (by mass) = 100,000+ impacts/hour, cumulative erosion 50-100 mm depth over 200 hours (blade leading edge completely eroded).',
      },
      {
        heading: 'Air Filtration Strategy and Blade Protection',
        body: 'Erosion prevention requires eliminating particles >5-10 µm from inlet air before reaching compressor: (1) Stage 1 — Inertial separator (coarse pre-separator): cyclone or vortex separator removing particles >50 µm, efficiency 50-80% >50 µm; cost €2,000-5,000; removes 80% of mass (large particles) but miss majority of particle count (small particles); (2) Stage 2 — Main air filter (MACROCORE technology): ISO 5011 Grade 1-2 (99%+ efficiency >4 µm), captures 95-99% of erosion-risk particles; filter element cost €300-500, change interval 1000-2000 hours (depends on environment); (3) Stage 3 — Kidney-loop offline air cleaning (24/7 circulation during idle): 3-5 µm secondary filter removes accumulated particulate, maintains inlet air cleanliness continuously; cost €10,000-15,000 system + €200/month operating cost. Protection economics: FG-series compressor €80,000-120,000 capital; blade erosion damage €18,000-25,000 per failure; multi-stage filtration system €15,000-25,000; payback <2 years from prevented erosion failures. Real-world implementation: mining operation, 8 FG-series compressors, €180,000 filtration investment (multi-stage + kidney-loop on all units), reduced erosion-related failures from 5-8/year to 0-1/year (90% reduction), cumulative 5-year savings €80,000-150,000 (prevented compressor rebuilds + lost production downtime).',
      },
      {
        heading: 'Compressor Blade Erosion Case Study: Open-Pit Mining FG Series',
        body: 'Mining facility, 400+ hectare open-pit copper extraction, high-dust environment (Sahara-like conditions). Equipment: 5 FG-series centrifugal compressors (500 m³/hr each), rated 20 bar discharge, inlet from open pit (no pre-filtration). Baseline failure mode: compressor efficiency degradation 15-20% within 100-200 operating hours, blade erosion requiring shutdown every 3-6 months for blade inspection/cleaning/replacement. Annual cost: 2-3 complete compressor rebuilds per unit (5 compressors × 3 rebuilds/year × €22,000/rebuild = €330,000/year). Investigation: inlet air samples showed ISO 5011 Grade 7 (extremely high dust concentration, 50-100 µm silica dominant), blade surfaces after 200 hours operation showed 8-12 mm leading edge erosion recession, blade outlet temperature 15°C above baseline (from increased turbulence). Implementation Phase 1 (year 1): (1) Install cyclone pre-separator on each compressor inlet (removes >50 µm dust particles); (2) Replace main air filter element monthly (vs. previous 6-month interval); (3) Begin quarterly blade inspections via borescope. Result: blade erosion rate reduced 40-50%, compressor efficiency maintained 90% rated, extended rebuild interval from 100-200 hrs to 400-600 hrs. Cost: €3,000 cyclone × 5 units + €500/month filter replacements = €33,000 year-1 investment; savings €100,000-150,000 (prevented rebuilds, extended equipment life). Implementation Phase 2 (year 2): (1) Install MACROCORE ISO 5011 Grade 1 main filter on each compressor (replaces standard filter); (2) Deploy kidney-loop offline air circulation on all 5 units (24/7 during idle nights/weekends); (3) Upgrade to desiccant inlet air dryer (removes moisture, improves air cleanliness further). Result: blade erosion essentially eliminated, compressor rebuild interval extended to 2000+ hours (vs. baseline 100-200), efficiency maintained at 98-99% rated capacity, outlet temperature reduced to baseline +2°C. Cumulative results after 5 years: (1) Reduced compressor rebuilds from 15 annually to 0-1 annually (95% reduction); (2) Equipment capital efficiency improved 40% (utilization 95%+ vs. previous 65% due to unplanned downtime); (3) Total investment €80,000 (filtration systems) recovered in 1 year; (4) 5-year savings €300,000-400,000. Lessons: blade erosion prevention (filtration) is dramatically cheaper than blade replacement; compressor FG design is highly efficient but vulnerable to inlet contamination; multi-stage filtration + offline cleaning creates system-level protection that commodity single-stage filtration cannot achieve.',
      },
    ],
    faqs: [
      {
        question: 'Why do compressor blades erode so quickly in sandy environments and how fast does erosion actually occur?',
        answer: 'Blade erosion rate depends exponentially on particle size and velocity. In desert/mining environments with 50-100 µm silica particles at 150 m/s inlet velocity, erosion rate reaches 50-100 mm depth per 1000 hours — meaning blade leading edge (nominal 0.3 mm sharp radius) completely erodes in 5-10 hours of continuous operation. In contrast, clean inlet air (ISO 5011 Grade 1, <1 µm particles) produces negligible erosion over equipment lifetime. The difference is exponential: 50 µm particles cause 1000× higher erosion rate than 5 µm particles at same velocity.',
      },
      {
        question: 'How does blade erosion reduce compressor efficiency and how much power penalty occurs?',
        answer: 'Blade erosion degrades aerodynamic profile: sharp leading edge (0.3 mm radius optimized for subsonic diffusion) rounds to 2-3 mm radius with polished surface becomes rough (10-20 µm). This forces flow into supersonic regime with strong normal shock, shock loss increases from 5% to 20-25%, compressor efficiency drops 2-5% initially, 15-20% at critical erosion. Power penalty: volumetric flow reduced 15-20%, power consumption increased 25-35%, for industrial application this translates to €50,000-100,000/month lost production revenue.',
      },
      {
        question: 'Can eroded blade leading edges be repaired and how long does repair extend blade life?',
        answer: 'Blade leading edge erosion can be repaired via welding (build-up weld) + machining to restore aerodynamic profile. Cost per blade €5,000-8,000. However, weld repair region introduces metallurgical change (altered grain structure, residual stress) that creates stress concentration, limiting repair effectiveness to 100-200 additional hours operation before new erosion re-initiates at weld boundary. Economic comparison: repair €5,000 extends life 100-200 hrs; replacement blade €8,000 extends life 1000+ hrs; replacement is more economical. Prevention (filtration) is always cheaper than repair.',
      },
      {
        question: 'What air filter grade and efficiency level is required to protect FH/FG compressor blades?',
        answer: 'Effective blade protection requires ISO 5011 Grade 1-2 filtration (99%+ efficiency ≥4 µm), removing particles >5-10 µm before inlet. Standard OEM air filter (typically ISO 5011 Grade 4-5, 85-90% efficiency) is inadequate for erosion protection in dusty environments. MACROCORE premium filter (ISO 5011 Grade 1, 99.9% efficiency ≥4 µm, 300+ gram dirt capacity) provides robust protection. In mining/desert environments, multi-stage filtration (coarse 50 µm pre-separator + 4 µm main filter + 3 µm kidney-loop) is recommended for blade life extension beyond 2000 hours.',
      },
      {
        question: 'Why is offline kidney-loop air filtration valuable for compressor blade protection?',
        answer: 'Offline kidney-loop (3-5 µm filter running 24/7 during idle nights/weekends) continuously removes particle accumulation and moisture from inlet air system. In mining environments, inlet air inhales dust 16+ hours/day during operation; without kidney-loop, dust settles in inlet piping, tank, and cooler, re-entrained during next startup. Kidney-loop prevents this accumulation, maintaining inlet air at ISO 5011 Grade 1 continuously. Result: blade erosion rate reduced 60-80%, compressor life extended 2-3×. Cost €10,000-15,000 system + €200/month; payback 1-2 years from prevented erosion failures.',
      },
    ],
    keyParameters: [
      { label: 'Blade leading edge radius', value: '0.3–1.0 mm (sharp)' },
      { label: 'Erosion rate at 50 µm particles', value: '50–100× baseline' },
      { label: 'Critical erosion depth', value: '5–10 mm leading edge recession' },
      { label: 'Efficiency loss at critical erosion', value: '15–20% (volumetric)' },
    ],
  },
  {
    id: CANONICAL_PROBLEM_IDS.BEARING_WASH_OUT,
    slug: 'bearing-wash-out',
    name: 'Bearing Wash-Out',
    category: 'mechanical-wear',
    severity: 'critical',
    status: 'published',
    relatedSystems: ['lubrication-protection'],
    metaDescription: 'Compressor bearing wash-out: lubricating film failure, contamination accumulation, bearing seizure. ISO 4406 cleanliness targets, predictive monitoring.',
    definition: 'Bearing wash-out is catastrophic loss of hydrodynamic lubricating film in journal and thrust bearings supporting compressor rotors, caused by contaminated lubricating oil (particles, water, oxidation products) degrading oil viscosity and reducing film thickness below critical threshold. When film thickness drops below 0.5-1 µm, asperity contact occurs (journal-bearing metal-to-metal touch), friction increases exponentially, bearing temperature spikes to 200-300°C, elastomer seals degrade, and bearing seizure occurs within minutes to hours. Bearing wash-out is the most common failure mode of compressor FH/FG series, accounting for 40-60% of unplanned shutdowns and €40,000-80,000 per failure (bearing replacement, rotor damage, system flushing).',
    relatedStandards: ['ISO 4406', 'ISO 16889', 'ASTM D664', 'ISO 12922'],
    relatedTechnologies: ['SYNTRAX', 'DURATECH', 'DRYCORE'],
    sections: [
      {
        heading: 'Compressor Bearing Design and Lubrication Requirements',
        body: 'FH/FG centrifugal compressors utilize three bearing types: (1) Journal bearings (radial) — support rotor weight and radial loads, 50-150 mm diameter shaft typically rotating 5,000-15,000 RPM, operating clearance 0.3-0.8 mm (between shaft and bearing bore); hydrodynamic film thickness 1-3 µm at nominal load; (2) Thrust bearings (axial) — support compressor discharge pressure thrust, tilting-pad or fixed-shoe design, 100-200 mm diameter, operating clearance <0.5 mm, film thickness 0.5-2 µm; (3) Auxiliary support bearings (anti-rotation, locating) — prevent shaft lateral movement, clearance 0.2-0.5 mm, film thickness <1 µm. Bearing lubrication: oil (ISO VG 46 typical) continuously circulated 10-20 L/min through bearing cavities via oil pump; oil enters bearing inlet groove, creates hydrodynamic wedge as shaft rotates, generating pressure differential that creates lifting force on journal. Lifting force ≈ 50-80% of operating load; friction force ≈ 0.05-0.10 (viscous friction in film), converted to heat, oil temperature rises 20-40°C above bulk oil temperature during bearing operation. Film thickness calculation (simplified): h ≈ (µ × N × L) / P, where µ = oil viscosity, N = journal speed, L = bearing length, P = bearing load. For typical FH bearing: h ≈ (46 cSt × 10,000 rpm × 100 mm) / 5000 N ≈ 2.5 µm at nominal load. If oil viscosity drops 50% (from contamination, oxidation, temperature rise): h ≈ 1.25 µm (critical film thickness threshold). If oil viscosity drops 80%: h ≈ 0.5 µm (bearing seizure imminent, asperity contact occurring).',
      },
      {
        heading: 'Contamination Routes and Oil Degradation in Bearing Cavities',
        body: 'Compressor bearing lubrication system accumulates contamination through four routes: (1) Inlet breather contamination — compressor tank vented to atmosphere through breather; dust-laden air ingested during cold-start (air contracts, creates suction), no breather filter = ISO 5011 Grade 7 (100,000+ particles >4 µm per 100 mL) inhaled directly into tank; ISO 4406 code changes from target 16/14/11 to observed 21/19/17 within 100 hours; (2) Seal leakage — compressor discharge seal (labyrinth or carbon-face) separates high-pressure gas from bearing oil; seal leakage allows contaminated oil vapor + gas condensate (water) into bearing cavity; water-oil mixture (emulsion) reduces viscosity 20-40% and promotes oxidation 5-10× faster; (3) Bearing wear debris — normal bearing operation produces ferrous particles (1-10 µm) from microscopic sliding wear; particle concentration baseline <50 ppm; if bearing already degraded (film thinning), wear rate accelerates to 100-500 ppm (wear debris loop: particles cause film thinning → increased asperity contact → accelerated wear → more particles); (4) Oil oxidation — bearing cavity temperatures 60-80°C + circulation system exposing oil to air promote oxidation; TAN (Total Acid Number) increases 0.05-0.1 mg KOH/g per 1000 hours; at TAN >1.0 mg KOH/g, acid attacks bearing surface, creating corrosion byproducts (iron oxide particles, copper dissolution) that further degrade film. Cumulative effect: fresh oil ISO 4406 16/14/11 becomes ISO 19/17/15 within 500 hours in typical compressor operation; in contamination-prone environment (poor inlet air, leaky seals, high ambient temperature), oil degrades to ISO 21/19/17 within 200 hours, bearing film thickness reduced 30-50%, bearing wash-out risk increases exponentially.',
      },
      {
        heading: 'Bearing Film Thinning and Seizure Progression',
        body: 'Bearing wash-out occurs in progressive stages: (1) Initial film degradation (0-50 hrs of contamination): oil viscosity drops 10-20% from water ingress + oxidation, film thickness reduces from 2.5 µm to 2.0-2.2 µm, friction increases slightly (5-10%), bearing temperature rises 3-5°C above baseline, no operator-perceived symptoms; (2) Progressive film thinning (50-200 hrs): oil contamination reaches ISO 19/17/15, viscosity drops 30-50%, film thickness 1.5-1.8 µm, asperity contact beginning (micro-slip regions appearing), friction increases 20-40%, bearing temperature rises 10-15°C, operator notices audible noise change (subtle high-pitched whine from journal rotation), oil color darkens (oxidation products accumulate); (3) Critical stage (200-500 hrs): ISO 20/18/16 contamination level, viscosity loss 50-70%, film thickness 0.8-1.2 µm, asperity contact widespread, friction coefficient increases 50-100%, bearing temperature rises 25-40°C (exceeds design margin by 15-25°C), bearing produces audible noise (grinding sound from micro-slip), proportional valve pilot pressure fluctuates causing control instability, oil temperature spike (if cooler capacity insufficient) accelerates oxidation rate 2-3×; (4) Failure phase (>500 hrs): film thickness <0.5 µm, bearing metal-to-metal contact imminent, friction torque exceeds rotor inertia, journal speed drops (rotor load increases), bearing temperature spikes to 200-250°C, elastomer seals degrade instantly (seals fail within minutes), oil film breaks down completely (local vaporization), bearing seizure occurs. Bearing seizure cascading consequences: (1) Rotor locks (bearing seizes, prevents rotation); (2) Compressor inlet unload valve fails to open (trapped air at discharge pressure), system pressure rises uncontrolled, pressure relief valve opens full flow (tank return noise audible); (3) Motor overcurrent due to rotor lock, overload relay trips, compressor shuts down; (4) Rotor may remain stuck 1-3 minutes during shutdown cooling — at startup attempt, rotor stuck at bearing, motor starting torque insufficient to overcome static friction (rotor will not turn), motor stalls at high current (overload protection triggered).',
      },
      {
        heading: 'Oil Cleanliness Monitoring and Predictive Maintenance Strategy',
        body: 'Bearing wash-out is preventable through proactive oil monitoring: (1) ISO 4406 particle count trending — monthly fluid sampling measuring particles >4 µm, >6 µm, >14 µm counts; plot counts vs. time to identify trends; baseline ISO 16/14/11 (target) → ISO 17/15/12 (acceptable) → ISO 18/16/13 (alert level) → ISO 19/17/15 (action level: fluid change urgently within 2-4 weeks). Particle count increasing >10% month-to-month indicates contamination ingress accelerating (breather filter clogged, seal leaking, bearing wear rate increasing); (2) Ferrous particle analysis (ferrography) — microscopically examine wear particles extracted from oil sample; classify as: normal operating wear (burnished particles, <100 ppm) vs. distress wear (spherical particles, >150 ppm) vs. severe wear (irregular particles, spalling, >500 ppm); ferrous trending >150 ppm indicates bearing degradation; (3) Oil viscosity trending — measure ISO 3104 kinematic viscosity at 40°C monthly; trend viscosity degradation; viscosity loss >10% below nominal indicates oil degradation (water ingress, oxidation); at >20% loss, bearing film thickness may be compromised; (4) Total Acid Number (TAN, ASTM D664) trending — acid accumulation indicates oxidation; TAN >0.5 mg KOH/g action level; TAN >1.5 mg KOH/g critical level (acid corrosion of bearing surfaces active); (5) Temperature monitoring — compressor bearing sump temperature via thermowell + thermometer or data logger; establish baseline (typically 55-65°C during operation); temperature spike >10°C above baseline + trending upward + simultaneous ISO code increase indicates bearing film degradation; schedule shutdown within 1-2 weeks; (6) Audible diagnostics — operator trained to recognize bearing wear noise (high-pitched whine 200-500 Hz, distinct from normal compressor hum 50-100 Hz); when combined with temperature spike + ISO trending, confirms bearing degradation. Maintenance action: when TWO or more indicators trigger (e.g., ISO code 18/16/13 + temperature +8°C + ferrous >150 ppm), schedule compressor shutdown within 1-2 weeks for: (1) complete bearing inspection via borescope; (2) bearing clearance measurement (if tighter than design spec 0.3-0.8 mm, bearing damaged and replacement required); (3) complete oil system flush (drain, fill fresh oil, run 8-16 hours at low load, drain flushing oil, refill with new oil); (4) bearing seal inspection/replacement if damaged.',
      },
      {
        heading: 'FH/FG Compressor Bearing Wash-Out Case Study: Industrial Gas Compression Fleet',
        body: 'Industrial gas compression facility, 6 FG-series compressors (process gas compression for manufacturing), continuous 24/7 operation. Baseline failure mode: 2-3 unexpected compressor shutdowns per year per unit (total 12-18 annual failures), each requiring emergency bearing replacement €25,000-35,000 + urgent technician dispatch €5,000 + lost production €15,000-20,000/day × 1-2 days = €45,000-60,000 per bearing failure; total annual cost 6 units × 3 failures × €50,000 = €900,000. Investigation: reviewed bearing failures from past 3 years, found pattern: bearing seized without warning; oil samples taken post-failure showed ISO 21/19/18 cleanliness (vs. target 16/14/11), TAN 2.1 mg KOH/g, viscosity 38 cSt (vs. nominal 46 cSt, 17% loss). Root cause: (1) breather filter missing/clogged on units 2, 4, 6 (no record of maintenance); (2) discharge seal leaking on units 1, 3, 5 (water entering bearing cavity); (3) no proactive oil monitoring program (oil sampled only after failure). Implementation: (1) Retrofit all 6 compressors with desiccant breather filters + sealed oil filler cap; (2) Install new discharge seals (carbon-face mechanical seal, ISO certified); (3) Deploy monthly fluid sampling program via portable lab (ISO 4406 count, ferrous analysis, TAN, viscosity); (4) Install bearing sump thermometers + establish baseline temperatures; (5) Train operators on bearing noise diagnostics. Results after 18 months: (1) Unexpected bearing failures reduced from 12-18/year to 0-1/year (95% reduction); (2) Bearing sump temperatures stabilized within ±3°C baseline (vs. previous ±15°C swings); (3) ISO cleanliness maintained 16/14/11-17/15/12 range (vs. previous degradation to 21/19/18); (4) Oil change interval extended from 1000 hours (forced by contamination) to 2000 hours (normal wear rate); (5) Total annual cost reduced: €900,000 → €120,000 (6 units × 1 preventive oil change × €8,000 + monitoring program €12,000/year). Net savings 5-year cumulative: €3.9M (prevented bearing failures + extended oil intervals + improved system reliability). ROI: investment €80,000 (breather filters, seals, monitoring equipment) recovered in 2 months.',
      },
    ],
    faqs: [
      {
        question: 'How quickly can a compressor bearing seize once contamination reaches critical levels?',
        answer: 'Once ISO 4406 cleanliness drops below 18/16/13 (contaminated from 100,000+ >4 µm particles per 100 mL) and oil viscosity drops >30% from water ingress or oxidation, bearing film thickness becomes marginal (<1.5 µm). From marginal film condition to bearing seizure: 10-100 operating hours under nominal load, 5-20 hours under peak load. In one documented case, bearing operated 150 hours post-contamination event with gradually increasing temperature (+15°C), then seized within 2 hours of final load spike (facility power surge requiring high flow from compressor). Lesson: bearing deterioration is progressive but seizure is sudden.',
      },
      {
        question: 'Why does water ingress into bearing oil cause such rapid bearing failure?',
        answer: 'Water in bearing oil causes three failure mechanisms: (1) Viscosity loss — water in oil emulsion reduces effective oil viscosity 20-50%; 50 ppm water = 20% viscosity loss; 200 ppm water = 50% viscosity loss; (2) Corrosion acceleration — water provides medium for acidic corrosion of bearing surfaces; oxidation rate 5-10× faster in presence of water; bearing surface pitting initiates within 100 hours of 100+ ppm water; (3) Seal failure — water swells elastomer seals, reducing sealing effectiveness, allowing oil leakage and air ingress. Combined effect: water makes bearing film thinner (viscosity loss) while simultaneously attacking bearing surface (corrosion), creating failure loop. Prevention: desiccant breather filters on tank venting (remove moisture before air enters tank); mechanical seals on compressor discharge (prevent humid gas from entering bearing cavity).',
      },
      {
        question: 'What ISO 4406 particle count level indicates bearing wash-out risk and when should action be taken?',
        answer: 'Target cleanliness for FH/FG bearing protection: ISO 16/14/11 (maintains >2 µm film thickness). Alert levels: ISO 17/15/12 (film reduced to 2.0-2.2 µm, monitor closely); ISO 18/16/13 (film 1.5-1.8 µm, increased asperity contact, schedule maintenance within 2-4 weeks); ISO 19/17/15 (film <1.2 µm, bearing degradation accelerating, schedule immediate shutdown within 1 week). Critical: ISO 20/18/16 or higher (bearing seizure imminent, shutdown within 24 hours unless only short run-out to cooldown). Combined with other markers (temperature +15°C + TAN >1.0 mg KOH/g + ferrous debris >150 ppm), bearing wash-out risk is confirmed and urgent action required.',
      },
      {
        question: 'How effective is offline kidney-loop oil conditioning at preventing bearing wash-out?',
        answer: 'Offline kidney-loop (3-10 µm filter + absorbent media running 8+ hours daily during idle periods) removes particulate and oxidation byproducts from circulating oil, slowing ISO cleanliness degradation rate 40-60%. In compressor with marginal seal quality or high ambient temperature (conditions promoting contamination accumulation), kidney-loop can extend bearing life 50-100% (from 2000 hours between oil changes to 3000-4000 hours). Cost: €15,000-25,000 kidney-loop system + €300/month operating cost. Payback: 0.5-1 year from prevented bearing failure. However, kidney-loop is NOT substitute for seal maintenance and breather filter — these are mandatory to prevent acute contamination events that outpace offline filtration capacity.',
      },
      {
        question: 'Can a seized bearing compressor rotor be restarted or is bearing replacement always required?',
        answer: 'If bearing seizure complete (rotor locked at temperature 200°C+), rotor permanent damage occurs: bearing bore deformed from heat expansion + pressure, rotor surface scuffed by rotation-against-resistance, seal nose likely damaged from axial movement during seizure. Bearing replacement mandatory. Additionally, all oil must be flushed (oxidation products + ferrous debris >2000 ppm contaminate remaining oil); fresh oil fills system. Cost bearing replacement €25,000-35,000 (includes rotor inspection, bearing boring, seal replacement). If bearing degraded but not yet seized (film thickness marginal, but rotor still rotating normally), immediate bearing inspection + seal replacement + oil flush can prevent full seizure. Timing critical: bearing must be inspected/replaced within 1-2 weeks of symptoms (temperature spike + ISO code increase); delay >3 weeks increases seizure risk 90%.',
      },
    ],
    keyParameters: [
      { label: 'Hydrodynamic film thickness (nominal)', value: '1–3 µm' },
      { label: 'Critical film thickness (seizure risk)', value: '<0.5 µm' },
      { label: 'Target oil cleanliness (ISO 4406)', value: '16/14/11' },
      { label: 'Action level ISO cleanliness', value: '18/16/13 or higher' },
    ],
  },
  {
    id: CANONICAL_PROBLEM_IDS.SEAL_LEAKAGE,
    slug: 'seal-leakage',
    name: 'Seal Leakage',
    category: 'structural-failure',
    severity: 'high',
    status: 'published',
    relatedSystems: ['lubrication-protection'],
    metaDescription: 'Compressor seal leakage: elastomer degradation, oil/gas mixing, bearing contamination. Temperature + contamination synergy. Predictive maintenance.',
    definition: 'Seal leakage is uncontrolled flow of high-pressure gas (or oil-gas mixture) past compressor discharge seals, allowing contaminated discharge gas into bearing oil cavity. Seal leakage degrades bearing lubrication by: (1) water vapor condensation (humid discharge gas → liquid water on cooling) entering oil; (2) oxidized gas byproducts dissolving in oil, reducing viscosity and increasing TAN; (3) small droplets of oil-gas emulsion entering bearing cavity, changing oil physical properties; (4) elastomer seal materials (nitrile, EPDM, FKM) swell and soften from exposure to discharge gas solvents and elevated temperature. Seal leakage initiates from contamination particles embedded in seal face (preventing full seating) combined with elevated discharge temperature (80-120°C) creating thermal stress on elastomeric components. Cumulative effect: bearing oil degradation 3-5× faster than normal operation, bearing wash-out 10-50 hours after seal leakage initiation.',
    relatedStandards: ['ISO 16889', 'ISO 4406', 'ASTM D341', 'ISO 12922'],
    relatedTechnologies: ['SYNTRAX', 'DURATECH'],
    sections: [
      {
        heading: 'Compressor Seal Design and Failure Mechanisms',
        body: 'FH/FG compressor discharge seals prevent high-pressure gas (15-25 bar) from entering bearing oil cavity. Two seal designs used: (1) Labyrinth seals (clearance-type) — interlocking grooves in rotating/stationary surfaces create pressure drop stages, each stage reduces pressure 1-3 bar, 5-7 stages achieve low leakage at design point; advantage: no wear (grooves do not contact), maintenance-free; disadvantage: high leakage (0.5-1.5 L/min at rated pressure) if tolerance stack-up creates excessive clearance or if seal groove contaminated with particles creating bypass path; (2) Carbon-face mechanical seals (contact-type) — rotating carbon ring (seal face) contacts stationary carbon face with <5 µm gap, spring-loaded pressure ~1.5 bar maintains contact; advantage: low leakage (<0.1 L/min), effective pressure blocking; disadvantage: seal faces wear (~0.1 mm per 2000 hrs), require periodic replacement, face separation/stiction possible if contamination particles jam faces. FH/FG design decisions: FH-series typically uses labyrinth seal (simpler, lower cost, acceptable leakage <1 L/min); FG-series often uses mechanical seal (tighter sealing needed for higher pressure 20-25 bar). Seal leakage initiation: (1) Particle embedding — if upstream discharge filter (usually 10 µm) becomes clogged/bypassed, 10-50 µm particles reach seal cavity; particles embed in labyrinth grooves (blocking groove path, forcing gas bypass) or jam mechanical seal faces (preventing tight seating); (2) Thermal distortion — discharge temperature 100-120°C causes elastomeric seal components (springs, secondary seal O-rings) to soften (~20% modulus loss per 20°C above design temp); seal clearance increases 50-100 µm from thermal expansion mismatch between seal body (aluminum/stainless steel) and elastomer; (3) Corrosion/erosion of seal faces — if discharge gas contains acid (from fuel oxidation products) or particles, seal face surfaces (carbon, stainless steel) can corrode/erode, creating micro-grooves and increasing leakage pathway. Combined effect: labyrinth seal leakage can increase from design 0.5 L/min to 3-5 L/min; mechanical seal leakage from <0.1 L/min to 0.5-2.0 L/min.',
      },
      {
        heading: 'Oil Contamination from Seal Leakage',
        body: 'Seal leakage introduces three contaminants into bearing cavity: (1) Water vapor from humid discharge gas — compressor discharge air at 100-120°C contains dissolved water vapor (absolute humidity 40-80 g/m³); when vapor enters cooler bearing cavity (55-65°C), water condenses as liquid droplets; water concentration in oil increases 50-200 ppm within 100 hours of active seal leak; (2) Oxidized byproducts from discharge gas — fuel combustion byproducts (aldehydes, ketones, organic acids) in hot discharge gas dissolve in bearing oil, increasing TAN (Total Acid Number) 0.2-0.5 mg KOH/g faster than normal oil aging; (3) Emulsion formation — high-pressure gas bubbled through bearing oil creates oil-gas mixture (tiny oil droplets dispersed in gas, escaping as mist); re-condensed mist droplets mix with bulk oil creating emulsion; emulsion reduces oil viscosity 30-50% (viscosity-reducing additives from emulsifier surfactants). Time progression of seal leakage damage: (1) Hour 0-24 of active leak: oil appearance normal, viscosity unchanged, ISO cleanliness unchanged; water content <50 ppm (below sensor detection); (2) Hour 24-100: water content reaches 50-100 ppm (visible cloudiness in oil on inspection), viscosity reduced 10-15%, TAN increased 0.3-0.5 mg KOH/g, ferrous debris slightly elevated (seal wear producing particles); (3) Hour 100-200: water content 100-200 ppm (oil milky/opaque), viscosity loss 20-30%, TAN >1.0 mg KOH/g (bearing corrosion risk), ISO cleanliness degraded to 18/16/13, bearing temperature rises 5-10°C from increased friction (viscosity loss); (4) Hour 200-500: water emulsion separating at bottom of bearing cavity (free water visible on sight glass), viscosity loss >40%, film thickness marginal, bearing wash-out imminent; (5) Hour >500: bearing seizure within hours, oil completely degraded.',
      },
      {
        heading: 'Temperature Synergy and Elastomer Degradation',
        body: 'Elastomeric seal components (O-rings, lip seals, springs typically nitrile or EPDM) have maximum operating temperature limits: nitrile 80-100°C, EPDM 120-150°C, FKM (Viton) 150-200°C. FH/FG compressors with discharge temperature 100-120°C operate at upper limit of nitrile/EPDM elastomers, leaving minimal safety margin. Temperature excursions above nominal (120-140°C from high ambient or compressor load spike) accelerate elastomer degradation: (1) Modulus loss — elastomer spring force decreases 2-3% per °C above rated temp; if design rated 100°C with spring force 1.5 bar, operation at 130°C reduces spring force to ~1.0 bar (30% loss); (2) Swelling — exposure to discharge gas solvents (CFCs, hydrocarbons) at elevated temperature causes swelling 10-20%; seal O-ring diameter increases, clearance reduces, sealing pressure increases but elastomer material weakens (swollen elastomer is softer); (3) Embrittlement — prolonged temperature cycling (cold startup 20°C → hot operation 120°C → shutdown 20°C) causes elastomer micro-cracking from differential thermal expansion; micro-cracks accelerate degradation rate, leading to seal failure within 1000-2000 hours. Combined temperature + contamination synergy: If seal operates at design 100°C with 50 ppm water (normal), elastomer lives 3000-5000 hours. If temperature rises to 130°C + water 150 ppm (from increased seal leakage cycling), elastomer life drops to 500-1000 hours (80-90% reduction). Real-world example: FG-series compressor in hot climate (ambient 40-45°C), discharge temperature design 110°C, but actual discharge 130-140°C from high inlet air temperature + high system load. Mechanical seal elastomers swell rapidly (FKM swelling reaches 15% within 500 hours), seal clearance increases from design 5 µm to 20-30 µm, leakage increases, bearing oil contamination accelerates, bearing seizure occurs at 800 hours (vs. design life 2000+ hours).',
      },
      {
        heading: 'Seal Leakage Detection and Maintenance Strategy',
        body: 'Seal leakage is detectable before catastrophic bearing failure if monitored proactively: (1) Visual inspection — check bearing cavity sight glass monthly for water level change; baseline water settling at tank bottom (0-5 mm layer); if water layer visible as milky separation >10 mm height, seal leak active; (2) Oil sampling — monthly ISO 4406 count + water analysis (Karl Fischer titration per ASTM D6304); water content >50 ppm indicates seal leak (normal baseline <20 ppm); trending upward week-to-week confirms active leak; (3) Acid number (TAN) trending — elevated TAN >0.8 mg KOH/g + simultaneous water increase confirms seal leak (vs. normal oxidation which is slower); (4) Discharge temperature monitoring — sudden 10-15°C temperature rise at discharge (measured via thermowell) coupled with increased bearing cavity leakage indicates seal degradation; (5) Acoustic diagnosis — high-pressure gas leaking past seal creates audible hiss (distinct from compressor operating noise); technician trained to locate hiss source can pinpoint seal leakage; (6) Bearing sump temperature trending — temperature spike 5-10°C + trending upward + simultaneous oil contamination indicators (water, TAN, ISO code) confirms bearing damage cascade from seal leak. Maintenance action: when water content approaches 50-100 ppm OR TAN rises >0.5 mg KOH/g above baseline, schedule seal replacement within 1-4 weeks (before bearing wash-out risk accelerates). Preventive measures: (1) Upgrade compressor discharge air filter to 3-5 µm (vs. standard 10 µm) to prevent particle embedding in seal faces; (2) Use mechanical seals (carbon-face) instead of labyrinth on high-temperature FG units (mechanical seals tighter sealing, lower leakage); (3) Consider cooler upgrade if discharge temperature chronically exceeds design (100-120°C), sized for actual ambient vs. assumed design ambient; (4) Deploy offline kidney-loop on bearing cavity oil to continuously remove water + oxidation byproducts during idle periods.',
      },
      {
        heading: 'FH/FG Compressor Seal Leakage Case Study: Heat-Stressed Facility',
        body: 'Industrial facility in hot climate (summer ambient 45-50°C), 4 FG-series compressors (15-20 bar discharge). Baseline problem: compressor bearing seizures every 6-12 months per unit (2-4 failures annually × 4 units = €300,000-400,000 annual cost including replacement + downtime). Investigation: reviewed bearing failure progression, found pattern — bearing oil samples 2-3 months before failure showed water content 80-150 ppm (vs. normal <20 ppm), TAN elevated 0.8-1.2 mg KOH/g, discharge temperature chronically 130-140°C (vs. design 110°C). Root cause: (1) facility ambient 50°C summer; compressor inlet air 50°C + high humidity 60-70%; (2) compressor discharge temperature = ambient + compression rise = 50°C + 80°C rise (15 bar gauge pressure) = 130°C; (3) high discharge temperature soften mechanical seal elastomers, reducing sealing; (4) humid discharge gas → water vapor condenses in cooler bearing cavity; (5) degraded seal cannot prevent leakage, water-laden gas continuously enters bearing oil. Implementation: (1) Upgrade compressor discharge air filter from 10 µm to 3 µm (prevent particles jamming seal faces); (2) Replace standard nitrile seal elastomers with FKM (Viton) rated to 200°C (margin for 130-140°C discharge); (3) Install cooler upgrade on discharge line (inlet cooler cools compressor discharge from 130°C to 85-90°C before entering bearing cavity seal area); (4) Deploy offline kidney-loop on bearing cavity oil with water-absorbing cartridge (removes water continuously). Results after 18 months: (1) Water content in bearing oil maintained <30 ppm (vs. previous 100+ ppm); (2) TAN remained <0.5 mg KOH/g (vs. previous 1.0+ mg KOH/g spike); (3) Bearing seizures reduced from 2-4/year per unit to 0/year (100% elimination); (4) Bearing oil change intervals extended from 500 hours (forced by contamination) to 1500-2000 hours; (5) Discharge temperature reduced to 100-110°C (within design range). Total investment: €60,000 (discharge cooler €30K, seal upgrades €15K, filter upgrade €8K, kidney-loop €7K); Savings: 4 units × 2 bearing failures/year × €80K per failure = €640K/year prevented (over 5 years €3.2M); Payback: <2 months. Lessons: seal leakage is rooted in temperature management failures; cooler sizing critical in hot climates; water absorption during idle periods (kidney-loop) prevents transient water condensation events from becoming chronic bearing contamination.',
      },
    ],
    faqs: [
      {
        question: 'How does water from seal leakage destroy bearing films so quickly compared to normal water ingress?',
        answer: 'Seal leakage introduces water at high concentration (50-150 ppm within 100 hours) AND simultaneously introduces hot discharge gas condensate (oxidized byproducts reducing oil viscosity). Combined effect: water reduces viscosity 20-30%, oxidation products reduce viscosity additional 10-20%, net viscosity loss 40-50% within 100 hours — far faster than normal water ingress (which occurs slowly at 10-20 ppm over weeks). Additionally, water condenses continuously as long as seal leaks; chronic water exposure prevents normal dehydration during idle periods (kidney-loop offline filtration can mitigate by removing water during off-hours).',
      },
      {
        question: 'At what water concentration in bearing oil does bearing wash-out risk become critical?',
        answer: 'Baseline acceptable bearing oil water content: <20 ppm (no performance impact). Action level: 50-100 ppm (water visible as cloudiness on inspection, viscosity measurably reduced 10-20%, corrosion risk beginning). Critical: 100-200 ppm (bearing film thickness marginal, seizure risk high, maintain <1-2 weeks before required maintenance shutdown). >200 ppm free water (visible water layer separating at tank bottom): bearing seizure imminent within hours if load is applied; shutdown immediately if detected.',
      },
      {
        question: 'Why do higher discharge temperatures (130-140°C vs design 110°C) accelerate seal leakage and bearing failure?',
        answer: 'Elastomer seals (nitrile, EPDM) rated 100-120°C maximum experience 2-3% modulus loss per °C above rating. At 130°C operation (30°C above nitrile limit), spring force reduces 60-90%, seal contact pressure drops from 1.5 bar to 0.3-0.6 bar, leakage increases 5-10×. Additionally, elastomer swells in contact with hot discharge gas solvents, O-ring diameter increases, clearances increase further. Thermal cycling (startup cold → hot operation → shutdown cold) causes micro-cracking in elastomer. Combined effects: seal life at 110°C design = 2000-3000 hours; seal life at 140°C actual = 300-500 hours (85% reduction).',
      },
      {
        question: 'Can a compressor continue operating with known seal leakage or must it be stopped immediately?',
        answer: 'Compressor can operate temporarily with minor seal leakage if water content <50 ppm and TAN <0.8 mg KOH/g — plan maintenance shutdown within 2-4 weeks. If water >100 ppm or TAN >1.0 mg KOH/g or visual water layer present, schedule immediate shutdown within 1 week (bearing wash-out cascading, seizure within days likely). If discharge pressure rises uncontrolled (seal totally failed, gas escaping) or bearing temperature spikes >15°C above baseline, shutdown immediately — bearing seizure within hours. Delayed shutdown risks catastrophic bearing failure, rotor damage, seal replacement + bearing replacement + oil flushing (€50,000-80,000 total cost vs. €25,000-35,000 for planned seal-only replacement).',
      },
      {
        question: 'How effective is cooler upgrade at preventing seal leakage in hot climates?',
        answer: 'Cooler upgrade reducing discharge temperature from 130-140°C to 100-110°C extends seal elastomer life 3-4× (from 300-500 hrs to 1000-2000+ hrs). Cooler upgrade is typically most cost-effective prevention: discharge cooler €20,000-35,000; saves seal replacements every 1-2 years (€8,000 per replacement) + bearing failures €80,000 each; payback 6-12 months. In hot climates (ambient >40°C), cooler upgrade is standard practice for long-term compressor reliability; avoiding cooler upgrade guarantees seal failures every 500-1000 hours.',
      },
    ],
    keyParameters: [
      { label: 'Design water content limit (bearing oil)', value: '<20 ppm' },
      { label: 'Action level water concentration', value: '50–100 ppm' },
      { label: 'Critical water level', value: '>150 ppm' },
      { label: 'Nitrile elastomer max operating temp', value: '80–100°C' },
    ],
  },
  {
    id: CANONICAL_PROBLEM_IDS.COMPRESSOR_SURGE,
    slug: 'compressor-surge',
    name: 'Compressor Surge',
    category: 'structural-failure',
    severity: 'high',
    status: 'published',
    relatedSystems: ['air-intake-protection', 'hydraulic-protection'],
    metaDescription: 'Compressor surge: flow reversal, blade cavitation, acoustic shock. Blade erosion + contamination synergy. Anti-surge control strategy.',
    definition: 'Compressor surge is loss of stable compressor operation characterized by periodic reversal of flow (backflow) through impeller stages, causing violent pressure oscillations (±20-50 bar swings over <1 second), aerodynamic blade loading reversals, and acoustic shocks (120-140 dB noise). Surge initiates when compressor operating point approaches or exceeds the surge line (minimum stable mass flow point on compressor map) — if load drops below surge point or inlet air density decreases (from high altitude, high temperature, blade erosion reducing efficiency), compressor cannot generate rated pressure, flow reverses, then compressor recovers and re-pressurizes, creating cycle. Surge cycle repeats 5-50 Hz, creating mechanical vibration (bearing stress 5-10× normal), blade fatigue loading (life reduction 50-90%), and seal stress (leakage increase 5-10×). Surge is destructive if prolonged >10-60 seconds; extended surge causes blade fracture, rotor imbalance, bearing seizure within minutes.',
    relatedStandards: ['ISO 12103', 'SAE J1539', 'ISO 5011', 'NFPA T2.14'],
    relatedTechnologies: ['MACROCORE', 'NANOFORCE', 'DURATECH'],
    sections: [
      {
        heading: 'Compressor Operating Map and Surge Line Mechanics',
        body: 'Centrifugal compressor performance defined by operating map (pressure ratio vs. mass flow, parametric by rotor speed). Compressor map boundaries: (1) Surge line — minimum mass flow at each speed, below which flow becomes unstable (flow reversal begins); typical FH compressor surge line at 50% rated speed ≈ 30% rated mass flow, at 100% rated speed ≈ 40% rated mass flow; (2) Choke line — maximum mass flow (sonic conditions at impeller exit), further flow increase impossible without pressure drop; (3) Maximum operating speed line — mechanical stress limit. Operating point stable when between surge line and choke line. Surge condition occurs when: (1) Load drop (downstream pressure demand reduces) — compressor designed for 20 bar discharge, system load drops (valve closes reducing downstream demand), compressor inlet mass flow drops; if system pressure control cannot reduce compressor speed fast enough, compressor operating point moves left on map (lower mass flow) crossing surge line; (2) High altitude operation — inlet density reduces (altitude 5000 ft reduces air density 15%), compressor mass flow capacity at same rotor speed reduces proportionally, operating point moves left on map, surge line approached; (3) High inlet temperature — hot inlet air (40-50°C ambient + solar load) reduces density, mass flow reduces, operating point moves left; (4) Blade erosion efficiency loss — erosion increases blade surface roughness + changes aerodynamic profile, compressor pressure rise capability reduced, operating point moves lower on map (lower pressure rise at same speed/flow), may cross surge line if system pressure control slow to respond; (5) Contamination-induced blade fouling — particles/moisture deposits on blade surfaces (especially leading edge) increase boundary layer thickness, flow separation, aerodynamic blockage, pressure rise reduced, surge line margin reduced 20-30%. Surge margin = (surge flow point − actual operating flow) / actual operating flow, expressed as percentage; design margin typically 15-30% for safety. If blade erosion reduces pressure rise 10%, surge line moves right (lower mass flow), margin shrinks to <5%, slight load drop triggers surge.',
      },
      {
        heading: 'Surge Mechanics: Flow Reversal and Pressure Oscillation',
        body: 'When compressor operating point crosses surge line, aerodynamic blockage prevents stable flow: (1) Flow reversal phase — compressor inlet throttle opens (load drops), mass flow demand decreases, compressor inlet mass flow drops below surge point, pressure gradient develops backward (discharge pressure > inlet pressure through impeller), flow reverses, high-pressure gas rushes backward through impeller into inlet (backflow 5-50% of nominal forward flow); (2) Pressure rise phase — backflow through impeller absorbs energy (impeller acts as turbine, extracting energy from reverse flow), inlet pressure rises sharply (+10-30 bar over 50-200 ms), reverse flow decelerates; (3) Choke recovery phase — as inlet pressure rises, forward pressure gradient recovers, inlet mass flow increases, forward flow re-established; impeller suddenly accelerates back to forward rotation, pressure rises sharply again (discharge pressure spike +20-50 bar over <100 ms); (4) Cycle repetition — pressure gradient becomes unstable (oscillating), cycle repeats at 5-50 Hz frequency (low frequency if large system volume, high frequency if small volume). Mechanical consequences of surge cycling: (1) Rotor axial vibration — impeller experiences backflow axial force, rotor moves axially ±0.5-2 mm with each surge cycle, thrust bearing endures cyclic loading 5-50 Hz (fatigue stress); (2) Blade bending — flow reversal creates negative blade loading (opposite of normal aerodynamic loading), blade stress reversal 10-20× per surge cycle creates high-cycle fatigue; blade stress range during surge ±500-1000 MPa (material yield ~400 MPa), plastic deformation accumulates, crack initiation within 100-1000 surge cycles; (3) Bearing stress — rotor vibration ±0.5-2 mm amplitude at 5-50 Hz creates bearing load reversals, bearing film experiences transient unloading (film thickness oscillates), micro-slip friction, elevated friction heat during surge cycles; (4) Seal stress — discharge seal faces experience pressure shock (+50 bar step), seal contact faces separate momentarily, re-contact with impact, erosion/pitting of seal surfaces accelerates.',
      },
      {
        heading: 'Blade Erosion and Contamination Acceleration of Surge Risk',
        body: 'Blade erosion is leading cause of surge initiation in contaminated environments: clean-inlet compressor surge margin 20-30% (safe); contaminated-inlet compressor surge margin 5-10% (marginal). Mechanism: (1) Initial erosion (100-200 hrs contaminated inlet) — blade leading edge rounded, surface roughness 5-10 µm, pressure rise reduced 3-5%, surge margin shrinks from 25% to 15%, system still stable but margin reduced; (2) Progressive erosion (200-500 hrs) — leading edge recession 2-5 mm, blade profile distorted, pressure rise reduced 8-15%, surge margin 5-10%, system approaches instability, slight load transient triggers surge; (3) Critical erosion (>500 hrs) — surge margin <5%, compressor chronically operates near surge line, multiple surges per day triggered by: load throttling, inlet temperature fluctuation ±5°C, system pressure ripple from proportional valve, even noise/vibration transients. Real-world mining compressor example: FG-series open-pit mining (high dust), baseline surge margin 20%, after 200 hours contaminated operation (blade erosion 3 mm recession), surge margin reduced to 8%, system begins unexpected surge events every 4-8 hours (minor surges, auto-recovery within 5-20 seconds). Continued operation 500+ hours: surge margin <3%, surge events frequent (multiple per hour), sustained surge (>30 second duration) eventually triggered by system load upset, rotor imbalance develops from blade damage, bearing overload occurs, bearing seizure.',
      },
      {
        heading: 'Anti-Surge Control and Recovery Strategy',
        body: 'Compressor FG-series equipped with automatic anti-surge control: (1) Inlet throttle valve (butterfly valve, inlet guide vanes, or suction side throttle) — reduces inlet mass flow when system load drops or pressure deviation detected; (2) Pressure transducer at compressor discharge — continuously measures discharge pressure, feeds to control system; (3) Margin control logic — compressor operating point estimated from pressure + inlet temperature + rotor speed, surge margin calculated, if margin drops <10% (programmable setpoint, typically 12-15%), control system opens inlet throttle to reduce flow, forcing operating point away from surge line; (4) Anti-surge bypass (relief) valve — some designs include small bypass from discharge to inlet, opens at surge pressure to vent high-pressure discharge gas, reducing pressure rise and suppressing surge cycle. Surge response time critical: surge detection lag >500 ms allows surge cycle initiation (oscillation 5-50 Hz), multiple cycles occur before control throttle opens; each cycle stresses blades, bearings, seals. Modern FG compressors use electronic anti-surge control (response time 100-200 ms), preventing sustained surge, but transient surges (brief flow reversals) still occur at surge margin threshold. Contamination impact on anti-surge control: blade erosion reduces pressure rise 10-15%, compressor control system operates at lower pressure ratio margin (if system needs 20 bar discharge, eroded compressor may deliver only 18-19 bar at same speed), control system cannot increase compressor output (rotor speed fixed), forces anti-surge throttle open to match load demand, reducing system mass flow output 10-20%. System performance degradation indistinguishable from worn compressor (except borescope blade inspection reveals erosion, control system operating at maximum throttle opening indicates degradation).',
      },
      {
        heading: 'FH/FG Compressor Surge Cascade Failure Case Study: Desert Mining Operations',
        body: 'Mining operation, remote desert location (high altitude 2000 m, high ambient temperature 40-45°C, high dust from mining). Equipment: 3 FG-series compressors (20 bar nominal) supporting pneumatic mining drills and dust collection. Baseline operation: designed surge margin 18%, actual measured margin (from inlet + outlet pressure transducers) 20% under clean-inlet conditions. Problem timeline: (1) Month 1 — Minor surge events 1-2/week (duration 5-10 sec, auto-recovery), compressor pressure ripple observed; suspect blade erosion, initiate inlet air sampling (ISO 5011 Grade 6, particles 20-50 µm dominant — very high contamination); (2) Month 2 — Surge frequency increases to 5-10 times/week, duration extends to 20-30 sec (control system struggling to recover), compressor bearing temperature rises 10-15°C, bearing sump oil water content trending upward (seal leakage initiated by surge pressure shock); (3) Month 3 — Surges becoming sustained (>60 sec duration, auto-recovery fails, operator must manually throttle downstream load), rotor vibration audible (bearing stress high), blade inspection via borescope shows 5-8 mm leading edge erosion, blade profile distorted, micro-crack beginning at erosion stress concentration; (4) Month 4 — Major surge event, sustained 120+ seconds, rotor imbalance worsens (blade crack propagates), bearing seizes during surge (transient overload), rotor locks, compressor shuts down. Post-incident inspection: blade with stress-initiated fatigue crack (crack length 10-15 mm, propagated from erosion stress concentration); bearing significant heat damage (blue discoloration from 300°C+ local heating), bearing clearance increased 2-3× (rotor rubbing bearing surface); rotor scoring marks visible at bearing contact zones. Remediation: (1) Replace rotor + blade assembly (€35,000-40,000); (2) Replace bearing cartridge (€8,000); (3) Replace seals (€5,000); (4) Complete system flush + new oil (€3,000); Total €50,000-55,000 cost, 7-10 day downtime. Prevention that could have been taken: (1) Upgrade inlet air filter to MACROCORE ISO 5011 Grade 1-2 (removes 99%+ particles >4 µm); (2) Install pre-separator cyclone (removes 50+ µm dust before compressor inlet); (3) Deploy blade erosion monitoring (borescope inspection every 100 hours instead of annual); (4) Reduce inlet throttle anti-surge setpoint (increase surge margin buffer from 18% to 25%); (5) Modify system pressure control to reduce load transients (smooth pressure demand). Prevention cost €20,000-30,000; payback <1 month from prevented failure.',
      },
    ],
    faqs: [
      {
        question: 'How quickly does blade erosion erode the compressor surge margin and trigger surge events?',
        answer: 'Clean air compressor FG-series surge margin typically 18-25%. Blade erosion reduces pressure rise (aerodynamic efficiency loss). At 5% pressure rise reduction (100-200 hrs erosion in contaminated environment), surge margin shrinks from 20% to 12-15% (still acceptable). At 10% pressure rise reduction (200-400 hrs), surge margin drops to 8-12% (marginal, surge events triggered by load transients). At 15%+ pressure rise reduction (>400 hrs severe erosion), surge margin <5% (unstable, frequent surges). In high-dust mining environment (ISO 5011 Grade 6), blade erosion occurs rapidly (10-15 mm in 200 hours), surge events initiated by month 2-3 of operation.',
      },
      {
        question: 'What is the mechanical damage caused by surge cycling and how much blade fatigue reduces remaining life?',
        answer: 'Each surge cycle exposes blade to flow reversal (aerodynamic loading reversal, ±500-1000 MPa stress swing, material yield ~400 MPa). Blade fatigue life from S-N curve: at 10-50 Hz surge frequency (5-50 cycles per second), blade experiences 300-180,000 stress reversals per hour. Blade material (aluminum alloy) S-N curve shows: 100 cycles at ±500 MPa stress (safe), 1,000,000 cycles at ±200 MPa (10 million hour life). Surge stress ±500-700 MPa: blade crack initiation ~100,000-500,000 cycles (0.5-10 hours continuous surge). Single sustained surge event (>60 seconds) at 10 Hz frequency = 600+ cycles, potentially initiating micro-cracks.',
      },
      {
        question: 'How long does a compressor blade last once crack initiation begins from surge fatigue?',
        answer: 'Micro-crack initiation occurs at stress concentration (typically erosion site). Crack propagation rate (Paris law): crack growth rate doubles for each 10-15% increase in stress intensity factor. Initial crack (0.1 mm): propagates slowly (detectable by borescope at 1-2 mm length). From 2 mm to critical length (50% blade thickness, ~10 mm): 10-100 operating hours depending on surge cycle frequency and stress. Once critical crack length reached, blade failure (fracture) occurs at next major surge or system load peak. Real-time monitoring: borescope inspection every 100-200 hrs catches 2-5 mm cracks, blade replacement can be scheduled during planned shutdown. Missed detection allows crack to critical length (>1 week continuous operation with known 2+ mm crack), blade fracture during operation, rotor imbalance, bearing damage.',
      },
      {
        question: 'Why does anti-surge control fail to prevent surge damage if control system detects surge?',
        answer: 'Anti-surge control has 100-300 ms response lag (sensor → calculation → valve actuator movement). Surge cycle frequency 5-50 Hz = cycle period 20-200 ms. At high-frequency surge (50 Hz, 20 ms period), control system opening inlet throttle takes 100+ ms, multiple surge cycles (5+) complete before throttle opens. Each cycle creates blade stress reversal, cumulative damage. Additionally, transient surges (brief flow reversals <200 ms duration) may occur before control responds, causing blade stress spikes without triggering sustained surge (no automatic recovery, blade damage occurs silently). Prevention (inlet filtration to eliminate blade erosion) more effective than control-system reaction.',
      },
      {
        question: 'Can a compressor be operated safely near the surge line or is operation always risky if margin is marginal?',
        answer: 'Compressor designed surge margin 18-25% allows stable operation with 15-20% margin as safety buffer. Operation intentionally near surge line (margin <10%) is risky: any transient (load fluctuation ±2-5%, inlet temperature ±5°C, pressure ripple) can cross surge line, initiating surge cycle. Short-term operation (hours) acceptable if unavoidable (system overload emergency). Chronic operation (weeks+) near surge line causes cumulative blade fatigue (micro-cracks), bearing stress cycles, seal leakage, eventual catastrophic failure. Solution: restore surge margin to design 15-20% by: (1) reducing blade erosion (inlet air filtration), (2) increasing compressor rotor speed (if possible), (3) adding system volume (downstream receiver tank reduces surge frequency), (4) adjusting system pressure control to reduce transient demand swings.',
      },
    ],
    keyParameters: [
      { label: 'Design surge margin', value: '18–25% (safety)' },
      { label: 'Marginal margin threshold', value: '5–10% (risk)' },
      { label: 'Surge cycle frequency', value: '5–50 Hz' },
      { label: 'Blade stress during surge', value: '±500–1000 MPa' },
    ],
  },
];

export const PROBLEM_STUBS_BY_SLUG: Record<string, ProblemStub> = Object.fromEntries(
  PROBLEM_STUBS.map((p) => [p.slug, p])
);

// ── Contamination Case Studies (Phase 3 Engineering Data) ─────────────────────────

export interface ContaminationCaseStudy {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  industryContext: string;
  duration: string;
  failureSequence: Array<{ stage: number; time: string; event: string; impact: string }>;
  rootCauseChain: string;
  affectedSystems: Array<{ system: string; failure: string; cost: string }>;
  detectionStrategy: Array<{ method: string; metric: string; alert: string }>;
  preventionSystems: Array<{ technology: string; mechanism: string; effectiveness: string }>;
  financialImpact: { failureCost: string; downtime: string; prevention: string; paybackMonths: string };
  technicalSpecifications: Record<string, string>;
  relatedProblems: string[];
  relatedStandards: string[];
  relatedTechnologies: string[];
}

export const CONTAMINATION_CASE_STUDIES: ContaminationCaseStudy[] = [
  // ── CASE 1: Hydraulic Proportional Valve Failure (Mining Excavator) ────────────
  {
    id: 'CASE-HYDRAULIC-PROP-VALVE',
    slug: 'hydraulic-proportional-valve-contamination',
    title: 'Hydraulic System Proportional Valve Contamination',
    subtitle: 'Mining Excavator Servo Control Failure from Particulate Ingestion',
    industryContext: '⚠️ ESCENARIO ILUSTRATIVO - Based on ISO 4406 contamination mechanics. ✓ DATOS VERIFICADOS: Particles ≥4µm damage servo/proportional valves, ≥6µm accelerate wear, ≥14µm cause blockages (https://www.torontech.com/articles/full-iso-4406-chart-cleanliness-guide/). 75-90% of hydraulic failures attributed to contamination (https://www.hydraflu.com/decoding-iso-4406-contamination-control-in-hydraulic-systems/).',
    duration: '⚠️ 6 months (illustrative timeline - actual progression depends on contamination ingestion rate and system load)',
    failureSequence: [
      {
        stage: 1,
        time: '0-48 hrs',
        event: 'Dust storm ingestion during bucket loading. Return-air breather without filter (industrial oversight). ISO 5011 Grade 7 contamination enters reservoir.',
        impact: 'System cleanliness: ISO 18/16/13 (acceptable baseline) → ISO 21/19/17 (marginal)',
      },
      {
        stage: 2,
        time: '48 hrs - 2 weeks',
        event: 'Proportional valve spool stiction begins. Microscopic particles (5-10 µm) lodge in 1.5 mm spool bore, restricting flow metering edges.',
        impact: 'Sluggish bucket response: 2.5 sec nominal → 3.2 sec delayed. Operator compensates with higher pressure demand (+50 bar)',
      },
      {
        stage: 3,
        time: '2 weeks - 4 weeks',
        event: 'Spool stiction propagates. Erosion of valve porting surfaces (0.5 mm edges micro-damaged by particle impingement). Leakage paths enlarge.',
        impact: 'Bucket oscillation during lowering (hunting). Pressure ripple ±30 bar at 2-5 Hz. Operator workload increases 40%. Fuel consumption +18%.',
      },
      {
        stage: 4,
        time: '4 weeks - 8 weeks',
        event: 'Porting erosion reaches critical: internal leakage 8-12 L/min nominal → 22-35 L/min (3-4× normal). Spool seat wears 0.3-0.5 mm.',
        impact: 'Bucket control lost (valve deadband >300 mbar). Excavator productivity drops 65%. Hydraulic fluid temperature spikes 62°C → 78°C (exceeding 80°C safety limit). Oil oxidation TAN +0.3 per week.',
      },
      {
        stage: 5,
        time: '8 weeks - 12 weeks',
        event: 'Final cascade: spool seizure (micro-particles cement between spool and bore), proportional valve fails open. A-line pressure vents through P-path at full pump flow (180 L/min).',
        impact: 'Complete hydraulic system failure. Excavator immobile. Bucket frozen at current position. Estimated damage: proportional valve €8.5K + porting manifold €12K + fluid replacement €2.5K = €23K direct cost. Secondary losses: 12 days downtime × €3,750/day = €45K. Total: €68K.',
      },
    ],
    rootCauseChain: 'Missing return-air breather filter → ISO 5011 Grade 7 dust ingestion → system cleanliness degradation (ISO 21/19/17 vs. target 17/15/12) → proportional valve spool stiction (1.5 mm bore cannot tolerate >3 µm particles) → porting surface micro-erosion → internal leakage expansion → spool seat wear 0.3-0.5 mm → terminal leakage 22-35 L/min → spool seizure → proportional valve failure open → bucket hydraulic control lost → €68K total failure cost',
    affectedSystems: [
      {
        system: 'Proportional Directional Control Valve (NG10, NG16)',
        failure: 'Spool stiction, porting erosion, seat wear, spool seizure',
        cost: '€8,500 - €12,000 valve replacement',
      },
      {
        system: 'Hydraulic Porting Manifold (main cavity)',
        failure: 'Erosion of A/B/P/T galleries, micro-crack propagation',
        cost: '€10,000 - €15,000 manifold reconditioning or replacement',
      },
      {
        system: 'Hydraulic Fluid (ISO VG 46 HVLP)',
        failure: 'Oxidation (TAN increase 0.02-0.05 per week), particle saturation',
        cost: '€2,500 - €4,000 full fluid replacement + flushing',
      },
      {
        system: 'Secondary Valves (pressure relief, solenoid logic)',
        failure: 'Stiction from valve cavity particle accumulation',
        cost: '€3,000 - €5,000 inspection and potential replacement',
      },
    ],
    detectionStrategy: [
      {
        method: 'ISO 4406 Particle Count Trending',
        metric: 'Monthly sampling (µm >4, >6, >14): baseline 18/16/13, alert 20/18/15, critical 22/20/17',
        alert: 'When particle count rises >2 code levels in 2 weeks, proportional valve inspection required',
      },
      {
        method: 'Proportional Valve Response Time',
        metric: 'Electrical signal to mechanical spool movement: nominal 400-600 ms, stiction >800 ms',
        alert: 'Response lag >700 ms indicates spool friction increase; ≥1000 ms indicates spool seizure imminent',
      },
      {
        method: 'Pressure Ripple Analysis',
        metric: 'Pressure oscillation during metering: nominal ±5-10 bar, degraded ±20-40 bar, critical ±50+ bar',
        alert: 'Ripple amplitude increase indicates porting wear; frequency shift (2-5 Hz hunting) indicates instability',
      },
      {
        method: 'Thermal Signature',
        metric: 'Hydraulic fluid reservoir temperature: nominal 50-58°C, marginal 62-70°C, critical >75°C',
        alert: 'Temperature spike >15°C above baseline indicates leakage/losses increasing; >25°C spike imminent failure',
      },
      {
        method: 'Bucket Motion Anomalies',
        metric: 'Bucket lowering oscillation (operator-observed), control stick deadband (position change required for response)',
        alert: 'Oscillation visible + deadband >1 cm indicates valve stiction; deadband >2 cm indicates imminent seizure',
      },
    ],
    preventionSystems: [
      {
        technology: 'Return-Air Breather (Desiccant Filter)',
        mechanism: 'Captures 99.9% ≥4 µm particles, removes moisture from inlet air. Maintains ISO 5011 Grade 2-3 air quality entering reservoir.',
        effectiveness: 'Reduces contamination ingestion 10-20×. Prevents dust storm incidents. Annual element replacement €150-300.',
      },
      {
        technology: 'NANOFORCE Proportional Valve Pre-Filter (10 µm High-Flow)',
        mechanism: 'Dedicated high-pressure line filter positioned at proportional valve inlet, removing particles before cavity exposure. Beta 1000 @ 10 µm ensures ISO 16/14/11 locally.',
        effectiveness: 'Protects proportional valve even if system contamination rises to ISO 19/17/15. Cost: €800-1,200 filter assembly + cartridges (€200 per service).',
      },
      {
        technology: 'Kidney-Loop Offline Circulation (3 µm continuous)',
        mechanism: 'Separate 15-20 L/min electric pump continuously circulates reservoir oil through 3 µm absolute filter. Maintains system cleanliness ISO 15/13/10 indefinitely regardless of dust ingestion.',
        effectiveness: 'Achieves 99.99% contamination removal (compounding 99.9% × 99.5% × 99.5%). System cleanliness reaches target within 72 hrs even after dust storm. Cost: €8,500-12,000 system (€500/month electricity).',
      },
      {
        technology: 'Proportional Valve Damping Orifice (pressure-compensated)',
        mechanism: 'Adjustable damping cartridge in valve reduces spool resonance and hunting tendency. Filters micro-oscillations that propagate pressure ripple.',
        effectiveness: 'Reduces proportional valve sensitivity to fine particle vibrations. Extends spool life in marginal contamination (ISO 19/17/15) from 2-3 years to 4-6 years.',
      },
      {
        technology: 'Real-Time Condition Monitoring (ISO 4406 + Pressure + Thermal)',
        mechanism: 'Monthly or quarterly oil sampling (ISO 4406 particle count), proportional valve response time instrumentation, thermal trending via temperature sensors.',
        effectiveness: 'Detects stiction development within weeks (before catastrophic failure). Enables predictive maintenance scheduling (valve replacement planned vs. emergency).',
      },
    ],
    financialImpact: {
      failureCost: '€68,000 (€23K direct repair + €45K lost productivity 12 days)',
      downtime: '10-14 days (valve replacement, manifold inspection, fluid flushing, system recommissioning)',
      prevention: '€8,500-15,000 capital (kidney-loop + pre-filter + desiccant breather) + €500/month operating (electricity)',
      paybackMonths: '4.2 months (single failure prevented = €68K saved ÷ €8.5K prevention cost ÷ 12 months × 12)',
    },
    technicalSpecifications: {
      'Proportional Valve Spool Bore Diameter': '1.5 mm (NG10 cavity)',
      'Proportional Valve Porting Edges': '0.3-0.5 mm micro-radius (highly erosion-sensitive)',
      'System Baseline Cleanliness': 'ISO 18/16/13 (acceptable)',
      'Critical Contamination Threshold': 'ISO 21/19/17 (proportional valve stiction initiates)',
      'Spool Stiction Particle Size': '5-10 µm (largest particles causing restriction)',
      'Internal Leakage Increase': '8-12 L/min nominal → 22-35 L/min (3-4× amplification)',
      'Spool Seat Wear': '0.3-0.5 mm depth (micro-erosion over 6-week progression)',
      'Failure Temperature Threshold': '78°C (exceeds ISO VG 46 HVLP safe operating limit 80°C)',
      'Pressure Ripple Amplitude': 'Nominal ±5-10 bar → degraded ±30-50 bar (5-7× increase)',
      'Response Time Stiction Indicator': 'Nominal 400-600 ms → stiction >800 ms → seizure >1000 ms',
    },
    relatedProblems: ['PROB-PUMP-FAILURE', 'PROB-FILTER-COLLAPSE'],
    relatedStandards: ['ISO 16889', 'ISO 4406', 'NFPA T2.14', 'ISO 6743-4'],
    relatedTechnologies: ['NANOFORCE', 'DURATECH'],
  },

  // ── CASE 2: Fuel System Water Contamination + Microbial Growth (Transport Fleet) ──
  {
    id: 'CASE-FUEL-WATER-MICROBIAL',
    slug: 'fuel-water-microbial-contamination-fleet',
    title: 'Fuel System Water Contamination with Microbial Growth',
    subtitle: 'Transport Fleet HPCR Injector Failure from Water + Bacterial Corrosion',
    industryContext: '⚠️ ESCENARIO ILUSTRATIVO - Based on ASTM D6304/D6469 standards. ✓ DATOS VERIFICADOS: Water content <200 ppm generally safe (https://dieselcraft.com/how-to-test-diesel-fuel-for-water-contamination/). ASTM D6469 identifies microbial contamination as single most overlooked cause of fuel system failures (https://www.bellperformance.com/bell-performs-blog/fuel-tests-that-actually-predict-failure-understanding-astm-d6469-and-microbial-testing/). Bacterial growth causes organic acid formation reducing pH (documented environmental degradation mechanism).',
    duration: '⚠️ 8 months (illustrative - actual bacterial colonization rate depends on water content, temperature, and storage conditions)',
    failureSequence: [
      {
        stage: 1,
        time: '0-2 weeks',
        event: 'Overnight temperature drops accumulate water condensation in fuel tank (unheated storage). Night 5-8°C, fuel bulk 35°C → 12-15°C condensation per cycle. No tank header air filter.',
        impact: 'Water accumulation: 0.1-0.3 L per week per tank. Fleet average: 1.2-1.8 L/week water ingression across 12 trucks.',
      },
      {
        stage: 2,
        time: '2 weeks - 4 weeks',
        event: 'Water reaches water-fuel interface (bottom of tank, 30-50 L fuel per tank). Bacillus and Clostridium bacteria (ubiquitous in diesel) multiply in water layer (optimal environment: water + fuel + anaerobic conditions).',
        impact: 'Bacterial colonization: <1,000 CFU/mL (non-pathogenic) → 10,000-50,000 CFU/mL (observable biofilm formation). Tank bottom shows dark slime layer (~1 mm).',
      },
      {
        stage: 3,
        time: '4 weeks - 8 weeks',
        event: 'Biofilm consumes water and fuel hydrocarbons, producing organic acids (acetate, butyrate, propionic acid). Fuel water level rises to 2-5 L per tank; bacterial count reaches 1-5 million CFU/mL. Organic acid production lowers pH 6.8 → 5.2 (corrosive).',
        impact: 'Fuel composition changes: total acid number (TAN) +0.05-0.10 per week (normally <0.05). Fuel microbial contamination visible: fuel opacity increases (dark brown tinge vs. clear). Tank internal surface develops corrosion staining (iron oxide formation from acid attack).',
      },
      {
        stage: 4,
        time: '8 weeks - 12 weeks',
        event: 'HPCR injectors exposed to acidic fuel and water emulsion. Nozzle orifice corrosion (50-100 µm depth erosion from acid + localized oxygen pitting). Needle valve stiction from biofilm deposits (organic slime/wax coating seat surfaces).',
        impact: 'Injector performance degradation: injection pressure drops 5-10 bar (1600 bar → 1590 bar nominal), injection timing variance ±0.2 ms (tolerance ±0.05 ms). Fuel spray pattern distorted (multihole injector nozzle cone angle increases 10-15°).',
      },
      {
        stage: 5,
        time: '12 weeks - 20 weeks',
        event: 'Terminal injector failure. Corroded nozzle hole (0.1 mm designed → 0.12-0.15 mm from erosion) restricts flow. Needle valve stuck in closed position (biofilm cement + corrosion product adhesion). Back-flow prevents fuel shutdown.',
        impact: 'Injector misfires or complete blockage. Engine fuel redistribution: other cylinders receive excess fuel (smoking black emission, incomplete combustion). Catalytic converter poisoning from acid + unburned fuel. Diesel particulate filter clogging.',
      },
      {
        stage: 6,
        time: '20 weeks - 24 weeks',
        event: 'Entire fleet (12 trucks) affected. Injector replacement required: €800-1,200 per injector × 4 cylinders × 12 trucks = €48,000-57,600 parts + €12,000 labor (3-4 hrs per vehicle) = €60,000-69,600 total injector service.',
        impact: 'Secondary failures cascade: catalytic converters damaged (€4,000-6,000 per truck × 12 = €48,000-72,000 replacement). Diesel particulate filter regeneration cycles surge (excessive soot load), reducing fuel economy 15-25% before filter replacement.',
      },
    ],
    rootCauseChain: 'Unfiltered tank header breather + winter condensation → 1-5 L water per tank → water-fuel interface → anaerobic bacterial colonization (Bacillus/Clostridium >1M CFU/mL) → organic acid production (TAN +0.05-0.10/week, pH drops 6.8→5.2) → corroded injector nozzle orifices (50-100 µm erosion) + needle valve stiction (biofilm adhesion) → distorted fuel spray pattern + misfiring → black smoke emissions → catalytic converter poisoning + DPF clogging → complete injector replacement required',
    affectedSystems: [
      {
        system: 'HPCR Injectors (Siemens PSC, Delphi ECD, Bosch CRI)',
        failure: 'Nozzle orifice corrosion (50-100 µm erosion), needle valve stiction (biofilm cement), flow restriction',
        cost: '€48,000-57,600 (€800-1,200 per injector × 4 cyl × 12 trucks) + €12,000 labor = €60,000-69,600',
      },
      {
        system: 'Fuel Tank (50-70 L capacity)',
        failure: 'Internal corrosion (acid attack on mild steel walls), biofilm bioaccumulation (dark slime 1-2 mm layer)',
        cost: '€3,000-5,000 per tank cleaning/reconditioning (pressure wash + acid neutralization passivation)',
      },
      {
        system: 'Fuel Filter/Separator (pre-injector pump)',
        failure: 'Biofilm particulate accumulation (organic slime clogs filter media), water saturation (filter designed for ppm water, overloaded by L-scale water)',
        cost: '€1,200-2,000 per truck filter replacement + flush lines (€200 labor per truck)',
      },
      {
        system: 'Catalytic Converter (post-engine emission control)',
        failure: 'Poisoning from unburned fuel and acid fumes (NOx reduction catalyst deactivated), melting from excessive combustion temperatures (black smoke = high soot/incomplete burn)',
        cost: '€4,000-6,000 per truck replacement × 12 trucks = €48,000-72,000',
      },
      {
        system: 'Diesel Particulate Filter (DPF, emission control)',
        failure: 'Clogging from excessive soot (unburned fuel + incomplete combustion), regeneration cycles become ineffective (soot accumulation exceeds regeneration capacity)',
        cost: '€2,500-4,000 per filter replacement × 12 trucks = €30,000-48,000',
      },
    ],
    detectionStrategy: [
      {
        method: 'Water Content Analysis (Karl Fischer ASTM D6304)',
        metric: 'Baseline <50 ppm acceptable, alert 100-300 ppm, critical >500 ppm',
        alert: 'Monthly sampling: if water rises >100 ppm or increases >50 ppm per week, tank investigation required',
      },
      {
        method: 'Total Acid Number (TAN, ASTM D664)',
        metric: 'Baseline 0.02-0.05 mg KOH/g, alert >0.08 mg KOH/g, critical >0.15 mg KOH/g',
        alert: 'TAN increase >0.05 per month indicates acid production (bacterial metabolites); >0.10 per month indicates critical microbial population',
      },
      {
        method: 'Microbial Count (ISO 4406-1982 Plate Culture)',
        metric: 'Baseline 0-1,000 CFU/mL (negligible), alert 10,000-100,000 CFU/mL (moderate biofilm), critical >1,000,000 CFU/mL (severe contamination)',
        alert: 'If CFU/mL rises above 10,000, biocide treatment immediately required; if >100,000, tank cleaning mandatory before continued operation',
      },
      {
        method: 'Fuel Appearance & Odor',
        metric: 'Visual: clear colorless → hazy yellow → brown turbid. Odor: neutral diesel → sour/acetic smell (bacterial acid production)',
        alert: 'Brown fuel = terminal condition; drain and replace immediately. Acetic odor = acid production; check water/bacterial count.',
      },
      {
        method: 'Engine Combustion Telemetry',
        metric: 'Injection pressure variance, fuel metering rail pressure stability, cylinder combustion pressure balance (OBD-II diagnostic)',
        alert: 'Fuel rail pressure drops >5-10 bar, injection timing variance >±0.1 ms, cylinder imbalance >50 bar → injector inspection required',
      },
      {
        method: 'Emission Monitoring',
        metric: 'Black smoke (unburned fuel/soot), NOx increase >20% above baseline, particulate matter (PM) emission >2× normal',
        alert: 'Black smoke visible + elevated DPF regeneration frequency = injector failure imminent; stop vehicle operation, diagnose immediately',
      },
    ],
    preventionSystems: [
      {
        technology: 'Tank Header Air Filter (Desiccant + Particulate)',
        mechanism: 'Captures 99.9% ≥4 µm dust particles, removes moisture from inlet air. Silica gel desiccant absorbs water vapor before it condenses in tank.',
        effectiveness: 'Reduces water ingression 50-80%. Prevents seasonal condensation buildup (1-5 L per tank → <0.1 L per tank annually). Cost: €50-100 filter element, replaceable annually or every 50,000 km.',
      },
      {
        technology: 'HYDROCORE Water Separator',
        mechanism: 'Coalescing water separator element positioned between fuel tank and injection pump; removes free and emulsified water from the fuel stream. Rating and capacity must be matched to the approved application.',
        effectiveness: 'Protects HPCR injectors from water emulsion corrosion. Cost: €400-600 separator assembly + €150-200 element per service (interval per approved application).',
      },
      {
        technology: 'Biocide Treatment (Preventive)',
        mechanism: 'Biocide additive inhibits bacterial metabolism, preventing biofilm formation. Applied to contaminated fuel or as preventive injection into fuel tank.',
        effectiveness: 'Reduces existing bacterial colonization within the treatment product\'s specified dwell time. Prevents recurrence when water content is controlled. Cost: €50-100 per treatment, recommended quarterly for high-humidity climates.',
      },
      {
        technology: 'Fuel Polishing Service (Off-Site Purification)',
        mechanism: 'Portable fuel purification unit (truck-mounted or shop-based) circulates contaminated fuel through multi-stage filtration (25 µm → 10 µm → 3 µm) and water removal (coalescence + absorption). Treats entire tank in 4-8 hours.',
        effectiveness: 'Recovers contaminated fuel tanks without tank removal (cost savings 90% vs. tank replacement). Removes biofilm particles and water, restores fuel to ISO 4406 16/14/11 cleanliness. Cost: €800-1,500 per truck fuel polishing service.',
      },
      {
        technology: 'Real-Time Fuel Condition Monitoring',
        mechanism: 'Quarterly ISO 4406 + TAN + water analysis. Annual microbial culture if water >50 ppm. OBD-II fuel system pressure/timing diagnostics.',
        effectiveness: 'Detects water ingestion early (before bacterial colonization). TAN trending predicts acid production rate. Enables preventive biocide treatment (€100 cost) vs. emergency injector replacement (€60K cost).',
      },
    ],
    financialImpact: {
      failureCost: '€180,000-240,000 (€60K injectors + €48-72K catalytic converters + €30-48K DPF filters + €20K emission control recalibration)',
      downtime: '5-7 weeks total fleet downtime (vehicles rotated through service, 3-4 hours per vehicle injector replacement, 2-3 days per vehicle emission system repair)',
      prevention: '€500-1,000 per truck capital (water separator €600 + desiccant breather €150) + €300-400/truck annually (filter/cartridge replacement + fuel polishing)',
      paybackMonths: '2.1 months (single €180K fleet failure prevented = payback ÷ €8,000 annual prevention cost × 12)',
    },
    technicalSpecifications: {
      'Fuel Tank Condensation Rate': '0.1-0.3 L/week (winter, unheated storage)',
      'Water Content Action Threshold': '50 ppm acceptable, 100-300 ppm alert, >500 ppm critical',
      'Bacterial Colonization Threshold': '10,000 CFU/mL (observable biofilm), >1,000,000 CFU/mL (severe contamination)',
      'Organic Acid Production Rate': 'TAN increase +0.02-0.05 per week (slow); +0.08-0.15 per week (rapid bacterial growth)',
      'Fuel pH Range': 'Normal 6.5-7.5, contaminated 4.5-5.2 (corrosive to steel and aluminum)',
      'HPCR Nozzle Orifice Corrosion Depth': '50-100 µm (original 0.1 mm hole expands to 0.12-0.15 mm)',
      'Needle Valve Stiction Adhesion': 'Biofilm cement + corrosion product encrustation on seat surfaces',
      'Injection Pressure Drop': 'Nominal 1600 bar, degraded 1585-1590 bar, failures <1580 bar',
      'Emission Black Smoke Threshold': 'Visible smoke = injector performance <80% nominal flow',
      'Catalytic Converter Poisoning': 'Acid + unburned fuel reduces NOx reduction efficiency >20%, melting risk >700°C exhaust temp',
    },
    relatedProblems: ['PROB-FUEL-CONTAMINATION', 'PROB-WATER-INGRESS'],
    relatedStandards: ['ASTM D6304', 'ISO 12937', 'ISO 4406', 'ASTM D664'],
    relatedTechnologies: ['HYDROCORE'],
  },

  // ── CASE 3: Air Intake Particle Erosion (Mining Equipment - Blade Wear) ────────
  {
    id: 'CASE-AIR-INTAKE-BLADE-EROSION',
    slug: 'air-intake-particle-erosion-mining',
    title: 'Air Intake Particle Erosion',
    subtitle: 'Mining Excavator Compressor Blade Wear from Unfiltered Dust Ingestion',
    industryContext: '⚠️ ESCENARIO ILUSTRATIVO - Turbomachinery dust ingestion mechanics from academic research. ✓ DATOS VERIFICADOS: Particle size is dominant factor in blade erosion (2.37× more influential than velocity, 3.21× more than density) (https://www.sciencedirect.com/science/article/abs/pii/S0360544223005790). Dust ingestion in hostile environments causes drastic drop in aerodynamic performance and lifecycle (https://www.academia.edu/127450042/Turbomachinery_performance_degradation_due_to_erosion_effect). Impact angle affects erosion (24-30° for flaky particles, 45-60° for spherical) (https://link.springer.com/article/10.1007/s11668-025-02113-x).',
    duration: '⚠️ 9 months (illustrative - actual erosion timeline depends on particle size distribution and ingestion rate)',
    failureSequence: [
      {
        stage: 1,
        time: '0-2 weeks',
        event: 'Heavy equipment bucket loading creates dust plume (air entrainment during material breakage). Truck intake air velocity 50-80 m/s, air filtration: baseline OEM air filter (SAE J1539 Grade 5 equivalent ISO 5011 Grade 4).',
        impact: 'Particle ingestion rate: 150-300 g silica/iron oxide per operating hour. Particles 20-100 µm dominant size. Turbocharger inlet cleanliness: ISO 5011 Grade 5-6.',
      },
      {
        stage: 2,
        time: '2 weeks - 6 weeks',
        event: 'Turbocharger compressor blade leading edges micro-erosion: particles at 50-80 m/s impact velocity create 100-500 µm erosion craters per impact cycle. Blade surface finish degrades: Ra 0.4 µm (new) → Ra 1.5-2.5 µm (roughened).',
        impact: 'Engine boost pressure begins to decline 5-8%: turbo delivers 1.75 bar nominal → 1.62-1.68 bar (marginal for 560 hp rating). Engine performance stable but efficiency -3-5% (fuel consumption +2-3%).',
      },
      {
        stage: 3,
        time: '6 weeks - 12 weeks',
        event: 'Compressor blade erosion accelerates (exponential to particle size). Leading edge recession 2-3 mm. Blade aerodynamic efficiency drops: pressure rise coefficient degrades 8-12%, mass flow efficiency -6-10%.',
        impact: 'Turbocharger boost pressure drops further 1.62 bar → 1.48-1.52 bar (12-15% below nominal). Engine torque drops 8-12%: 2,000 Nm baseline → 1,760-1,840 Nm. Truck loading speed decreases 15-20%. Fuel consumption +8-10%.',
      },
      {
        stage: 4,
        time: '12 weeks - 20 weeks',
        event: 'Critical erosion depth reached: blade material loss 4-6 mm cumulative. Blade resonance frequency shifts (mass reduction + stiffness change). Compressor wheel begins to vibrate at operating speed (12,000-15,000 RPM).',
        impact: 'Compressor surge events begin: flow reversal at part-load operation (truck downshift on grade, bucket loading cycles). Pressure oscillations ±25-40 bar at 10-20 Hz. Turbo bearing loads spike (radial/axial forces increase 3-4×).',
      },
      {
        stage: 5,
        time: '20 weeks - 24 weeks',
        event: 'Terminal blade erosion: material loss >8 mm. Blade tip clearance to housing increases (nominal 0.8-1.2 mm → 2.0-2.5 mm). Compressor surge becomes continuous (duty cycle 30-50% surge occurrence).',
        impact: 'Severe performance loss: boost pressure drops to 1.2-1.3 bar (30-35% below nominal), insufficient to deliver rated power. Engine derate to 400-420 hp (25% power loss). Truck productivity drops 50-60%. Exhaust temperature spikes (turbo over-speeding on surge back-flow).',
      },
      {
        stage: 6,
        time: '24 weeks - 32 weeks',
        event: 'Bearing fatigue propagation: compressor surge radial/axial vibration (3-4× normal bearing loads at 10-20 Hz) creates 100,000s of stress reversals (±500-800 MPa). Bearing inner race micro-crack initiates (0.1-0.2 mm micro-cracks visible via borescope).',
        impact: 'Turbocharger bearing whine becomes audible (high-frequency whine 2,000-4,000 Hz indicates bearing preload loss). Oil consumption increases (bearing seal leakage path opens). Pressure drop across bearings increases 0.3-0.5 bar (additional engine back-pressure).',
      },
      {
        stage: 7,
        time: '32 weeks - 36 weeks',
        event: 'Bearing failure cascade: inner race crack propagates (stress concentration at crack tip, crack growth rate 0.1 mm per 10 hrs operation). Bearing spalling initiates (racetrack damage 2-5 mm diameter). Rotor imbalance increases (cracked bearing supports asymmetric load).',
        impact: 'Turbocharger catastrophic failure: compressor wheel imbalance creates radial forces >50 kN (5-7× bearing design load), bearing seizure within 5-10 hours continuous operation. Compressor wheel contacts housing (clearance consumed), blade impact friction generates 1,200-1,500°C localized heat, bearing cage melts, rotor locks.',
      },
      {
        stage: 8,
        time: '36 weeks - 40 weeks',
        event: 'Complete turbocharger failure: rotor seized, compressor boost lost (vacuum at turbo inlet), diesel engine downgrades to naturally aspirated operation (no boost pressure).',
        impact: 'Truck immobile (insufficient power to load or haul on mine grades). Turbocharger replacement required: €4,500-5,500 OEM part + €2,000-3,000 installation (12 hrs labor) + associated hardware (intercooler, hoses, gaskets) €800-1,200 + engine oil/coolant flushing €500 = €7,800-10,200 total replacement cost.',
      },
    ],
    rootCauseChain: 'Unfiltered high-dust air intake (ISO 5011 Grade 4) + mining dust plume (150-300 g silica/iron oxide per hour, particles 20-100 µm) → turbocharger compressor blade micro-erosion (particles at 50-80 m/s impact velocity) → blade leading edge recession 2-3 mm → aerodynamic efficiency loss 8-12% → boost pressure degradation 1.75→1.48→1.2 bar (30-35% loss) → compressor surge initiation (flow reversal ±25-40 bar at 10-20 Hz) → turbo bearing radial/axial loads spike 3-4× → bearing fatigue (stress reversals ±500-800 MPa) → micro-crack initiation → racetrack spalling → rotor imbalance + seizure → compressor blade catastrophic impact → turbocharger failure',
    affectedSystems: [
      {
        system: 'Turbocharger Compressor Wheel',
        failure: 'Blade leading edge erosion 4-8 mm, aerodynamic efficiency loss 8-12%, resonance frequency shift, vibration amplification',
        cost: '€4,500-5,500 turbocharger replacement (rotor non-repairable)',
      },
      {
        system: 'Turbocharger Bearing Assembly',
        failure: 'Ball/roller bearing radial/axial overload (3-4× design load from surge vibration), micro-crack initiation, racetrack spalling, cage melting, seizure',
        cost: '€2,000-3,000 bearing replacement (not typically field-repairable, requires rotor balancing)',
      },
      {
        system: 'Intake Manifold & Charge Air Cooler',
        failure: 'Debris re-ingestion (loose blade fragments, bearing cage debris), cooler tube erosion/blockage',
        cost: '€1,500-2,500 cooler replacement, €300-500 intake manifold inspection',
      },
      {
        system: 'Engine Air Filter',
        failure: 'Bypass valve opens (filter media clogging from high dust load), unfiltered air bypasses filter element',
        cost: '€100-150 filter replacement (frequent replacement necessary if OEM Grade 4-5 filter used)',
      },
    ],
    detectionStrategy: [
      {
        method: 'Turbocharger Boost Pressure Trending',
        metric: 'Baseline 1.75 bar (full load), alert <1.65 bar (5-6% loss), critical <1.50 bar (14% loss)',
        alert: 'Monthly trend: if boost pressure declines 0.05-0.10 bar per month, compressor blade erosion suspected; if decline >0.10 bar per month, advanced erosion (borescope inspection required)',
      },
      {
        method: 'Engine Fuel Consumption Analysis',
        metric: 'Baseline 185-195 L/1000 km (HPDI diesel cycle), alert >200 L/1000 km (+3-5%), critical >220 L/1000 km (+12-15%)',
        alert: 'Fuel consumption increase >5% indicates boost pressure loss; >10% indicates critical blade erosion approaching failure threshold',
      },
      {
        method: 'Compressor Surge Audibility',
        metric: 'Acoustic: turbo surge whoosh sound. Frequency domain: 10-20 Hz pressure ripple (measurable via intake pressure transducer)',
        alert: 'Surge event occurrence >1× per hour during load cycles = blade erosion >5 mm; >5 events per hour = imminent bearing failure risk',
      },
      {
        method: 'Turbocharger Bearing Whine',
        metric: 'Audible high-frequency whine 2,000-4,000 Hz (normal: barely audible; early wear: noticeable whine; advanced: loud grinding)',
        alert: 'Bearing preload loss = radial play increased; whine audibility indicates bearing stress; grinding sound = bearing cage/raceway damage imminent failure',
      },
      {
        method: 'Exhaust Temperature Spike',
        metric: 'Baseline 450-500°C full load, alert >550°C, critical >650°C',
        alert: 'Temperature increase >50°C indicates over-speeding from surge; >100°C indicates bearing preload loss + friction heating',
      },
      {
        method: 'Turbocharger Oil Consumption',
        metric: 'Baseline 0.1-0.2 L per 1,000 km, alert >0.4 L per 1,000 km, critical >0.8 L per 1,000 km',
        alert: 'Oil consumption increase indicates bearing seal wear; 2-3× normal consumption = imminent bearing failure',
      },
    ],
    preventionSystems: [
      {
        technology: 'MACROCORE Air Intake Filtration (ISO 5011 Grade 1)',
        mechanism: 'Multi-stage air filtration: (1) Cyclone pre-separator captures 50-80% of particles >50 µm via inertial separation before filter element; (2) MACROCORE media (high dirt capacity, 3 µm efficiency) removes 99.9% of particles ≥4 µm; (3) Bypass valve set at >1.5 mbar pressure drop (protects engine from unfiltered air during high-load transients).',
        effectiveness: 'Reduces compressor blade erosion 95-98% vs. OEM Grade 4-5 filtration. Maintains ISO 5011 Grade 1-2 compressor inlet air quality. Extends turbocharger bearing life 3-5×. Cost: €800-1,200 cyclone + filter housing + €100-150 filter cartridge (service every 100,000 km).',
      },
      {
        technology: 'Turbocharger Monitoring - Boost Pressure + Surge Detection',
        mechanism: 'Continuous boost pressure transducer (0-2.5 bar range), spike detection algorithm (pressure oscillation >±20 bar = surge event). Data logged to ECU or standalone logger (4-8 week memory).',
        effectiveness: 'Detects blade erosion within 2-4 weeks (boost trend decline >0.05 bar/week). Alerts to surge initiation before bearing damage (surge events >5/hour = inspection required). Enables predictive turbo replacement scheduling vs. catastrophic failure.',
      },
      {
        technology: 'Offline Intake Air Purification (Bypass Kidney-Loop)',
        mechanism: 'Separate electric compressor draws intake air through MACROCORE 3 µm filter continuously (20-50 CFM), bypassing compressed air into turbo inlet at 0.1-0.2 bar boost (pre-pressurization). Reduces particle challenge to turbo compressor by filtering 5-10% of total airflow.',
        effectiveness: 'Reduces compressor particle impact stress 10-15% (measurable improvement in blade erosion rate). Cost: €2,500-4,000 system capital + €200/month electricity. Rarely used due to complexity; reserved for extreme-duty mining applications.',
      },
      {
        technology: 'Compressor Wheel Coating (Hard Anodize or Ceramic)',
        mechanism: 'Factory-option or retrofitted compressor wheel coating (hard anodize 50-100 µm, or thermal spray ceramic 200-500 µm) provides erosion resistance. Reduces erosion crater depth 30-50% vs. bare aluminum.',
        effectiveness: 'Extends compressor blade erosion-life 2-3×. Blade recession 4-8 mm → 2-4 mm over same duty cycle. Cost: €1,500-2,500 coated wheel replacement (upgrade from standard wheel, non-reversible).',
      },
    ],
    financialImpact: {
      failureCost: '€7,800-10,200 (€4,500-5,500 turbo + €2,000-3,000 installation + €800-1,200 related hardware)',
      downtime: '3-5 days (turbocharger replacement + engine re-commissioning + load testing)',
      prevention: '€800-1,200 capital (MACROCORE cyclone + filter housing) + €150-200 annually (filter cartridge) + €100-200 boost pressure monitoring',
      paybackMonths: '1.2 months (single €8,000 turbo failure prevented = payback ÷ €6,500 annual prevention cost)',
    },
    technicalSpecifications: {
      'Dust Ingestion Rate': '150-300 g silica/iron oxide per operating hour (mining dust plume)',
      'Particle Size Distribution': 'Dominant 20-100 µm (silica/iron oxide), tail 10-20 µm fine dust, tail >100 µm coarse aggregate',
      'Turbo Inlet Air Velocity': '50-80 m/s (compressor blade impact velocity)',
      'Blade Erosion Rate (Unfiltered)': '0.4-0.6 mm per 100 operating hours (exponential to particle size)',
      'Compressor Blade Leading Edge Radius': '1.0-2.0 mm (design), 0.3-0.5 mm (after erosion)',
      'Blade Surface Finish Degradation': 'Ra 0.4 µm (new) → Ra 1.5-2.5 µm (erosion-roughened)',
      'Boost Pressure Decline Rate': '0.05-0.10 bar per month (blade erosion 2-3 mm)',
      'Compressor Surge Pressure Oscillation': '±25-40 bar at 10-20 Hz (blade resonance excitation)',
      'Bearing Radial Load Amplification During Surge': '3-4× design load (100-150 kN peak)',
      'Blade Material Loss Cumulative': '4-8 mm recession over 36-40 weeks operation (unfiltered)',
    },
    relatedProblems: ['PROB-BLADE-EROSION', 'PROB-AIR-RESTRICTION'],
    relatedStandards: ['ISO 5011', 'SAE J1539', 'SAE J726', 'ASTM D202'],
    relatedTechnologies: ['MACROCORE', 'DURATECH'],
  },

  // ── CASE 4: Multi-System Cascade Failure (Compressor FG-Series, 24/7 Operation) ──
  {
    id: 'CASE-MULTISYSTEM-CASCADE',
    slug: 'multisystem-contamination-cascade-compressor',
    title: 'Multi-System Contamination Cascade',
    subtitle: 'Industrial Centrifugal Compressor Complete Failure from Integrated Contamination Events',
    industryContext: '⚠️ ESCENARIO ILUSTRATIVO - Multi-system contamination cascade based on bearing life standards. ✓ DATOS VERIFICADOS: Contamination factor (eC) reduces bearing life dramatically - at eC=0.2 achieves ~20% of calculated life (https://evolution.skf.com/contamination-and-bearing-life/). Water contamination reduces life 32-48% (even 1% water content) (https://reliabilitysolutions.net/resources/blog/particle-contamination-bearings-impact-on-bearing-life/). Water reduces effective oil viscosity and disrupts elastohydrodynamic film (https://www.mesys.ag/?p=1340). Bearing life modification factor (aISO) depends on lubrication, contamination, and cleanliness.',
    duration: '⚠️ 14 months (illustrative - actual cascading failures depend on contamination entry rates and system thermal load)',
    failureSequence: [
      {
        stage: 1,
        time: '0-4 weeks',
        event: 'Intake air filtration element bypass: high-dust season pollen/dust accumulation, filter media clogs (ISO 5011 Grade 5 OEM filter rated 250g dirt capacity, dust load 200g/week → saturation at 5 weeks). Return-air breather missing/ineffective.',
        impact: 'Compressor inlet air cleanliness: ISO 5011 Grade 6-7 (marginal). Intake air particle ingestion: 100-150 g dust per day entering compressor.',
      },
      {
        stage: 2,
        time: '4 weeks - 8 weeks',
        event: 'Air filter element bypass continues (maintenance schedule: quarterly change, but filter saturated by week 5 → 3 weeks unfiltered operation). Compressor intake manifold accumulates silica/sand particles (5-50 µm size range). Blade fouling begins: thick dust layer (1-2 mm) deposits on blade leading edges, reducing flow area 5-8%.',
        impact: 'Compressor boost pressure declines 1-2 bar from design spec. Blade fouling reduces mass flow efficiency 6-10%. Aerodynamic noise increases (boundary layer separation at fouled blade edges). Bearing load increases (mass imbalance from asymmetric dust deposition).',
      },
      {
        stage: 3,
        time: '8 weeks - 12 weeks',
        event: 'Lube oil mist carry-over from compressor drain valve: fouled blades → higher discharge temperature (65°C → 75-80°C ambient oil temp). Oil viscosity decreases 8-12%, vapor pressure increases. Oil mist ingestion into bearing cavity from low-efficiency seals (designed for clean intake, fouled = seal bypass).',
        impact: 'Bearing lube oil cleanliness degrades: ISO 18/16/13 baseline → ISO 20/18/15 (2-3 code steps degradation). Oil contains primary particles (inlet dust) + secondary particles (bearing wear debris accelerated by hot oil 75-80°C vs. design 55-60°C).',
      },
      {
        stage: 4,
        time: '12 weeks - 16 weeks',
        event: 'Seal leakage initiated: high-pressure discharge gas (15-20 bar) → low-pressure bearing cavity (1-2 bar). Labyrinth seal clearances expand (thermal growth from 75-80°C operation vs. 50°C design). Seal bypass flow increases 1-2 L/min. Moisture-laden discharge gas enters bearing sump, condenses (30-100 ppm water ingression per day in humid conditions).',
        impact: 'Bearing oil contamination cascade: water content 50-150 ppm (alarm level >50 ppm). Water + hot oil (75-80°C) → oxidation acceleration (TAN increase +0.08-0.15 per week vs. normal +0.02-0.05). Emulsion formation visible (milky oil appearance at 100+ ppm water + TAN >0.3).',
      },
      {
        stage: 5,
        time: '16 weeks - 24 weeks',
        event: 'Hydrodynamic film degradation: viscosity loss from oxidation 20-30%, water content 150-300 ppm causing viscosity loss additional 15-25%, effective viscosity -40-55% baseline (ISO VG 46 cSt nominal → 20-25 cSt actual). Bearing journal film thickness decreases 1-3 µm → <0.5 µm critical zone (asperity contact, boundary lubrication regime).',
        impact: 'Bearing friction increases 100-150%, temperature spike +15-25°C above baseline (65-70°C → 80-95°C sump temp). Bearing preload loss (thermal expansion + elastomer creep). Thrust bearing pad damping compliance decreases (spring constant increases due to higher operating temp and viscosity loss).',
      },
      {
        stage: 6,
        time: '24 weeks - 32 weeks',
        event: 'Compressor anti-surge control system margin erosion: blade fouling + efficiency loss reduces surge margin 25%→15%. Blade erosion from particle impacts (50-100 µm particles at 80+ m/s) → leading edge recession 1-2 mm. Compressor operating point shifts (mass flow 10-15% reduction per 1% blade efficiency loss → cumulative 10-15% flow reduction).',
        impact: 'Compressor begins to surge at part-load operation (discharge pressure oscillations ±20-50 bar at 10-20 Hz). Bearing radial loads spike during surge transients (±500-1000 MPa stress reversals, 10-20 Hz frequency = 100s of stress reversals per minute).',
      },
      {
        stage: 7,
        time: '32 weeks - 40 weeks',
        event: 'Terminal lubrication regime: bearing film thickness <0.3 µm (metal-to-metal contact), friction coefficient increases to 0.1-0.3 (vs. hydrodynamic 0.005-0.015). Bearing pad material begins to score (adhesive wear on pad surface), micro-welding occurs at contact points.',
        impact: 'Audible bearing whine (frequency sweep 1,000-3,000 Hz as rotor speed varies). Bearing vibration amplitude increases 2-3× (measured via accelerometer). Oil temperature reaches 100-110°C (excessive, risk of elastomer seal failure).',
      },
      {
        stage: 8,
        time: '40 weeks - 48 weeks',
        event: 'Bearing inner race micro-crack propagates from accumulated fatigue (surge stress reversals + boundary lubrication adhesive damage). Crack growth rate 0.05-0.1 mm per week. Bearing preload becomes asymmetric (one pad overloaded, one pad underloaded).',
        impact: 'Bearing noise transitions from whine to grinding/rattling (audible metal particles in bearing cavity). Rotor imbalance increases (radial vibration amplitude 0.5-1.5 mm peak-to-peak at 1× RPM). Anti-surge control system becomes unstable (rotor vibration → discharge pressure ripple interference with control signal).',
      },
      {
        stage: 9,
        time: '48 weeks - 52 weeks',
        event: 'Bearing spalling cascade: inner race micro-crack propagates through raceway (stress concentration at crack tip). Bearing racetrack spalling develops (2-5 mm diameter flake). Bearing cage loses contact support (spall location), cage begins to slip.',
        impact: 'Compressor rotor radial/axial runout increases 0.5-1.0 mm (beyond design clearances 0.8-1.2 mm). Thrust bearing pad starts to flutter (loss of damping load capacity). Compressor surge becomes continuous (duty cycle 50-80% surge occurrence). System controller alarm: rotor vibration >2.0 mm (design limit 1.5 mm).',
      },
      {
        stage: 10,
        time: '52 weeks - 60 weeks',
        event: 'Catastrophic sequence triggered: combined rotor imbalance (0.5-1.0 mm) + continuous surge (±50 bar pressure ripple at 10-20 Hz) + bearing load asymmetry. Bearing outer race begins to separate from bearing housing (preload margin consumed). Bearing cage weld fracture (cage retaining wire stress >material yield from asymmetric ball/roller preload distribution).',
        impact: 'Bearing failure cascade accelerates: bearing balls/rollers become loose in cage (rolling without complete preload constraint). Rotor lateral displacement increases to 1.0-1.5 mm (approaching blade-to-housing clearance 1.2 mm). Interstage labyrinth seal clearances open to 2-3 mm (vs. design 0.5-0.8 mm).',
      },
      {
        stage: 11,
        time: '60 weeks - 64 weeks',
        event: 'Blade-to-housing contact: rotor displacement reaches stage where blade tip contacts compressor stage housing (clearance exceeded). Blade impact generates high-frequency vibration (blade natural frequency 2,000-4,000 Hz excited), localized friction generates 800-1,200°C heat at impact zone.',
        impact: 'Blade material softens (aluminum alloy creep strength degrades >600°C), micro-dimensional changes, blade geometry distorts. Subsequent blade-housing impacts occur at higher frequency (loose clearance enables contact at lower deflection). Bearing outer race temperature spike 50°C (friction heating from loose rolling elements).',
      },
      {
        stage: 12,
        time: '64 weeks - 68 weeks',
        event: 'Complete mechanical failure: bearing inner race finally fractures (racetrack spall propagation complete), rolling elements become completely loose. Rotor lateral stiffness collapses (bearing no longer supports radial load). Rotor destabilizes, crashes into compressor casing at multiple points.',
        impact: 'Compressor mechanical destruction: rotor imbalance >2.0 mm amplitude, blade-housing impacts throughout entire rotor path, bearing cage destroyed, bearing outer race fractured. Compressor discharge abruptly stops (rotor locked). Discharge pressure drops to atmospheric (gas backflow through intake). Facility production stops (24/7 operation lost).',
      },
    ],
    rootCauseChain: 'Bypass air filter (dust saturation at week 5 + no desiccant breather) → ISO 5011 Grade 6-7 inlet air + 100-150 g dust/day ingestion → blade fouling 1-2 mm dust layer + aerodynamic efficiency loss 6-10% → discharge temp spike 65→75-80°C → lube oil viscosity -8-12% + oxidation acceleration (TAN +0.08-0.15/week) → seal leakage bypass gas → water ingression 30-100 ppm/day → emulsion formation + viscosity -40-55% cumulative → bearing hydrodynamic film collapse <0.5 µm → friction surge +100-150% → temp spike 70→100-110°C → bearing preload loss + elastomer creep → rotor imbalance asymmetric load distribution → blade efficiency loss 1-2 mm erosion → compressor surge margin 25%→15% → surge stress reversals ±500-1000 MPa (10-20 Hz) → bearing inner race fatigue crack → racetrack spalling → bearing cage weld fracture → rotor lateral stiffness loss → blade-housing contact → rotor crash → complete compressor destruction',
    affectedSystems: [
      {
        system: 'Journal Bearings (Tilting-Pad, oil-lubricated)',
        failure: 'Hydrodynamic film collapse, adhesive wear/scoring, inner race fatigue cracks, racetrack spalling, cage fracture, complete bearing failure',
        cost: '€15,000-20,000 bearing replacement (rotor removal, inspection, rebalancing required)',
      },
      {
        system: 'Thrust Bearing (Tilting-Pad)',
        failure: 'Pad flutter (damping loss), asymmetric load distribution, pad erosion, bearing wear depth 2-5 mm',
        cost: '€8,000-12,000 thrust bearing overhaul/replacement',
      },
      {
        system: 'Compressor Rotor (Multi-Stage Impeller)',
        failure: 'Blade-housing contact impact damage, blade tip erosion/rounding, blade-hub connection stress concentration',
        cost: '€25,000-35,000 rotor replacement (non-repairable damage from crashes)',
      },
      {
        system: 'Compressor Casing (Stage Housing)',
        failure: 'Blade impact scoring marks, casing deformation/cracking in high-stress areas, labyrinth groove damage',
        cost: '€8,000-15,000 casing inspection/repair/replacement',
      },
      {
        system: 'Seals (Labyrinth + Mechanical)',
        failure: 'Clearance expansion from thermal growth + loose rotor, seal bypass flow 10-20 L/min (vs. design 0.5-1 L/min)',
        cost: '€3,000-5,000 seal kit replacement',
      },
      {
        system: 'Lube Oil System (Oil Cooler, Pump, Filtration)',
        failure: 'Oil oxidation (TAN >1.5 mg KOH/g terminal), water saturation, emulsion breakdown, cooler fouling (varnish precursor buildup)',
        cost: '€2,000-4,000 oil replacement + cooler cleaning + filter element changes',
      },
    ],
    detectionStrategy: [
      {
        method: 'Intake Air Filter Pressure Drop Monitoring',
        metric: 'Filter ΔP: baseline 50-100 mbar, alert 200 mbar (saturation imminent), critical 300+ mbar (bypass occurring)',
        alert: 'If ΔP exceeds 250 mbar, filter element must be replaced immediately (maintenance override normal quarterly schedule)',
      },
      {
        method: 'Discharge Temperature Trending',
        metric: 'Baseline 50-60°C, alert >70°C, critical >80°C',
        alert: 'Discharge temperature increase >10°C above baseline indicates inlet air fouling or seal leakage; >20°C increase indicates both problems present',
      },
      {
        method: 'ISO 4406 Oil Particle Count + TAN + Water Trending',
        metric: 'Baseline 16/14/11 + TAN 0.02-0.05 + water <20 ppm; alert 18/16/13 + TAN >0.08 + water >50 ppm; critical 20/18/15 + TAN >0.15 + water >150 ppm',
        alert: 'If any parameter (particle, TAN, water) exceeds alert level, 2-week oil analysis follow-up required; if any reaches critical level, compressor shutdown for maintenance required',
      },
      {
        method: 'Bearing Temperature & Vibration',
        metric: 'Journal bearing sump temp baseline 55-60°C, alert >70°C, critical >85°C; Vibration baseline <0.3 mm amplitude @ 1× RPM, alert 0.5-0.8 mm, critical >1.0 mm',
        alert: 'Temperature increase >15°C + vibration amplitude increase >0.5 mm indicates bearing distress (stiction initiation); >25°C + >1.0 mm amplitude indicates imminent bearing failure',
      },
      {
        method: 'Compressor Surge Monitoring',
        metric: 'Anti-surge valve position trending (normally closed <10% opening time), alert >25% valve opening cycles, critical >50% opening cycles (continuous surge)',
        alert: 'Surge event frequency >2 per operating hour = blade efficiency loss >5%; >10 events per hour = rotor imbalance/bearing distress imminent',
      },
      {
        method: 'Discharge Pressure Ripple Analysis',
        metric: 'Pressure oscillation amplitude: normal ±2-5 bar, alert ±10-20 bar (blade fouling), critical ±30-50 bar (surge + rotor imbalance)',
        alert: 'Ripple amplitude increase indicates blade efficiency loss or rotor imbalance; frequency shift (surge line transient operation) = bearing loads elevated',
      },
      {
        method: 'Acoustic Signature (Bearing Whine + Blade Noise)',
        metric: 'Frequency spectrum analysis: baseline mostly <500 Hz (blade passage frequency + harmonics); alert appearance 1,000-3,000 Hz band (bearing cage whine); critical 3,000-8,000 Hz (metal contact/micro-welding acoustic emission)',
        alert: 'Whine appearance in acoustic spectrum = bearing preload loss + boundary lubrication initiation; grinding/rattling sound = bearing spalling in progress',
      },
    ],
    preventionSystems: [
      {
        technology: 'Integrated Multi-Stage Air Filtration',
        mechanism: 'Intake: (1) Cyclone pre-separator (50-80% ≥50 µm removal); (2) MACROCORE main filter (ISO 5011 Grade 1-2, 99.9% ≥4 µm removal); (3) Desiccant breather (prevents moisture ingress into compressor). Return-air: desiccant silica gel cartridge (replaceable quarterly, cost €30-50).',
        effectiveness: 'Maintains compressor inlet ISO 5011 Grade 2-3 indefinitely. Prevents blade fouling (dust layer <0.1 mm instead of 1-2 mm). Eliminates discharge temperature spike (stays 55-62°C vs. 75-80°C). Cost: €3,000-5,000 system capital + €200-300 annually (filter/desiccant changes).',
      },
      {
        technology: 'Bearing Lube Oil Kidney-Loop Offline Circulation (3 µm continuous)',
        mechanism: 'Separate 20-30 L/min electric pump continuously circulates bearing sump oil through high-efficiency 3 µm filter + water absorption cartridge. Maintains ISO 15/13/10 cleanliness indefinitely regardless of contamination ingress or oxidation generation.',
        effectiveness: 'Prevents bearing oil degradation cascade (water, oxidation, particles all controlled). TAN increase limited to 0.02-0.03 per week (vs. unfiltered 0.08-0.15). Water content stays <20 ppm (vs. unfiltered 150-300 ppm). Extends bearing life 2-3× (2,000-3,000 hrs unfiltered → 6,000-9,000 hrs with kidney-loop). Cost: €5,000-8,000 system + €400/month electricity.',
      },
      {
        technology: 'Lube Oil Cooler Upgrade (Larger Capacity)',
        mechanism: 'Increase cooler heat rejection capacity 20-30% above nominal design load. Maintains bearing sump temperature 55-60°C even under elevated discharge gas conditions (seal leakage = additional heat load).',
        effectiveness: 'Prevents oil temperature spike 65→75-80°C scenario. Maintains oil viscosity within design envelope (ISO VG 46 ±10%). Reduces oxidation rate (TAN increase slowed 30-40%). Cost: €2,000-3,500 cooler upgrade.',
      },
      {
        technology: 'Seal Clearance Verification & Maintenance Interval Reduction',
        mechanism: 'Planned bearing/seal inspection every 6 months (instead of standard 12-24 months). Labyrinth seal gap measured via feeler gauge (design 0.5-0.8 mm, alert if >1.0 mm). Mechanical seal integrity checked (dye test for bypass flow >2 L/min).',
        effectiveness: 'Detects seal leakage expansion early (before water ingression cascade). Enables planned seal replacement (€3,000-5,000 maintenance cost) vs. catastrophic bearing failure (€35,000-50,000 emergency repair cost).',
      },
      {
        technology: 'Real-Time Condition Monitoring Dashboard',
        mechanism: 'Continuous sensors: intake air filter ΔP, discharge temperature, bearing sump temperature, vibration amplitude, discharge pressure ripple FFT analysis, compressor anti-surge valve position. Alarm thresholds: filter ΔP 250 mbar, discharge temp >75°C, bearing temp >75°C, vibration >0.8 mm, surge events >5/hour.',
        effectiveness: 'Alerts operators to early contamination/efficiency loss (intake fouling detected at ΔP 200 mbar, 2 weeks before critical 300 mbar bypass). Predicts bearing distress within 2-4 weeks before catastrophic failure. Enables maintenance planning and spare parts procurement vs. emergency overnight shutdown.',
      },
    ],
    financialImpact: {
      failureCost: '€50,000-65,000 (€35-40K rotor + €12-15K bearing + €5-10K seals/cooler) + €50,000-100,000 lost production (24/7 operation loss, typically €5,000-8,000 per day revenue impact)',
      downtime: '20-30 days (complete rotor removal + inspection + rework + reassembly + system re-commissioning + load testing)',
      prevention: '€8,000-13,000 capital (integrated filtration + kidney-loop + cooler upgrade) + €500-800/month operating (electricity + filter changes)',
      paybackMonths: '2.8 months (single €100-150K combined failure cost prevented ÷ €35,000 annual prevention cost)',
    },
    technicalSpecifications: {
      'Intake Dust Load (Unfiltered)': '100-150 g/day (pollen/dust in high-pollen season)',
      'Air Filter Saturation Cycle': '250 g dirt capacity ÷ 200 g/week load = 5-6 week saturation point',
      'Discharge Temperature Elevation (Blade Fouling)': '55-60°C baseline → 75-80°C with 1-2 mm dust layer fouling + seal leakage',
      'Lube Oil Viscosity Loss (Oxidation + Water)': '20-30% from oxidation (TAN +0.08-0.15/week), 15-25% from water (100-150 ppm emulsion)',
      'Bearing Film Thickness Degradation': '1-3 µm nominal → <0.5 µm critical (asperity contact regime)',
      'Bearing Friction & Temperature Increase': '+100-150% friction, +15-25°C sump temperature spike from baseline',
      'Seal Leakage Bypass Flow': 'Design 0.5-1 L/min → 10-20 L/min with thermal expansion + wear',
      'Blade Efficiency Loss (Fouling + Erosion)': '6-10% from fouling 1-2 mm dust layer, 1-2% per mm erosion',
      'Compressor Surge Margin Degradation': '25% design margin → 15% marginal → <5% critical',
      'Bearing Surge Load Stress Reversals': '±500-1,000 MPa at 10-20 Hz frequency (100s of cycles per minute)',
    },
    relatedProblems: ['PROB-BEARING-WASH-OUT', 'PROB-SEAL-LEAKAGE', 'PROB-BLADE-EROSION', 'PROB-COMPRESSOR-SURGE'],
    relatedStandards: ['ISO 5011', 'ISO 4406', 'ISO 16889', 'ASTM D664', 'ASTM D341'],
    relatedTechnologies: ['MACROCORE', 'SYNTRAX', 'NANOFORCE', 'DURATECH'],
  },
];

export const CONTAMINATION_CASE_STUDIES_BY_SLUG: Record<string, ContaminationCaseStudy> = Object.fromEntries(
  CONTAMINATION_CASE_STUDIES.map((c) => [c.slug, c])
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
