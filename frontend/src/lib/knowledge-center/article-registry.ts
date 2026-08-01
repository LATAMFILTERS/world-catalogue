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
    relatedTechnologies: ['SYNTEPORE', 'HYDROCORE', 'TURBOCORE'],
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
        body: 'Injector wear detection: (1) ISO 4406 fuel analysis for particle counts (target <4 µm particles for HPCR); (2) Karl Fischer testing for water content (critical threshold >200 ppm); (3) Injector performance testing — modern OBD-II systems detect injection timing variance (>50 microseconds); rough idle and white smoke indicate stiction/blockage. Prevention requires three-stage fuel protection: (1) SYNTEPORE fuel filtration (10 µm absolute, Beta 1000) capturing particulates before fuel rail; (2) HYDROCORE water separator (99% water removal to <50 ppm) preventing corrosion; (3) TURBOCORE 3-stage fuel polishing for proactive tank treatment. Regular Karl Fischer testing (monthly during rainy season, quarterly otherwise) allows early detection of water ingress before corroded fuel reaches injectors.',
      },
      {
        heading: 'Real-World Case Study: Commercial Fleet Fuel System Protection',
        body: 'Heavy-duty truck fleet, 25 vehicles, tropical climate (coastal Malaysia). Baseline: Commodity fuel filters + standard tank breathers. Problem: 8–10 injector failures per year across fleet ($96K–120K annual cost). Failure pattern: Every 4–6 weeks, 1–2 vehicles experience rough idle and white smoke, requiring injector removal and replacement. Root cause analysis: Fuel samples showed ISO 6/4/2 particle cleanliness (HPCR target: <2/0/0, essentially "clean") and 400–800 ppm water during rainy season (monsoon moisture ingress through breather). Implementation: (1) Desiccant breathers on all 25 fuel tanks (silica-gel, rechargeable); (2) HYDROCORE water separator filters on all fuel systems (dual-stage coalescing); (3) Monthly Karl Fischer testing on fuel samples; (4) Annual fuel polishing service at regional depot. Results after 12 months: Water levels maintained <50 ppm year-round (vs. baseline 400–800 ppm); fuel cleanliness improved to <4/2/0; zero injector failures in year 1 (vs. baseline 8–10/year). Cost impact: Equipment investment $35K (breathers, filters, testing equipment), maintenance $12K/year (fuel polishing, testing) = $47K total first-year cost. Savings: 8 injector replacements avoided × $8K average cost = $64K first-year savings, plus improved fuel economy (+2–3% from cleaner combustion), plus eliminated downtime. 18-month payback, 10-year fleet savings: $480K+.',
      },
    ],
    faqs: [
      {
        question: 'Why can\'t commodity diesel filters protect HPCR injectors?',
        answer: 'Commodity diesel filters are rated 20–25 µm absolute (Beta 200 @ 20 µm), allowing 50% of particles >20 µm to pass. HPCR injectors fail at >4 µm particles. A commodity filter allowing even 1% of 5 µm particles to pass is catastrophic — 100 µm³ of fuel passing through 0.1 mm nozzle orifices at 1000 liters/hour = millions of 5 µm particles per minute reaching injectors. SYNTEPORE 10 µm filtration (Beta 1000 @ 10 µm) captures 99.9% of particles >10 µm and 95%+ of 4–10 µm range, protecting orifices. The particle size threshold is the critical difference.',
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
    metaDescription: 'Cavitation in hydraulic systems: vapor bubble formation, cavity collapse erosion, pump damage, prevention through pressure control.',
    definition: 'Cavitation is the rapid formation and collapse of vapor bubbles (cavities) in flowing liquid, occurring when local pressure drops below the liquid\'s vapor pressure. In hydraulic systems, cavitation happens in pump inlet lines, proportional valve spools, and orifice restrictions. Cavity collapse creates violent pressure waves (>2000 bar for microseconds) that damage component surfaces through erosion, pitting, and material loss.',
    relatedStandards: ['ISO 16889', 'ISO 4413', 'NFPA T2.14'],
    relatedTechnologies: ['NANOFORCE', 'SYNTEPORE'],
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
    relatedTechnologies: ['NANOFORCE', 'SYNTEPORE', 'DURATECH'],
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
