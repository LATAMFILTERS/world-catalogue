/**
 * diagram-registry.ts
 * ELIMFILTERS Knowledge Center — Engineering Diagram Registry
 *
 * 10 engineering diagrams covering the core filtration domains.
 * Each entry exposes: entity ID, governing standards, applicable systems,
 * related technologies, related articles, glossary terms, revision metadata,
 * accessibility metadata, and SVG component reference.
 *
 * Dependency: types.ts
 */

import type { KCDiagram } from './types';

export const ENGINEERING_DIAGRAMS: KCDiagram[] = [

  // ── 01. ISO 16889 Multi-Pass Test Circuit ─────────────────────────────────
  {
    slug: 'multipass-test-circuit',
    entityId: 'DIAG-MULTIPASS-TEST',
    title: 'ISO 16889 Multi-Pass Filter Test Circuit',
    metaDescription:
      'Engineering schematic of the ISO 16889 multi-pass test circuit used to measure filter Beta ratio (β) efficiency — reservoir, pump, upstream particle counter (PC₁), test filter, downstream particle counter (PC₂), and return flow.',
    engineeringPurpose:
      'Documents the standardised test circuit for determining filter efficiency (Beta ratio) and dirt-holding capacity under ISO 16889. The multi-pass method recirculates test fluid with injected ISO medium test dust to achieve steady-state upstream particle concentration, enabling reproducible efficiency measurement across particle size ranges.',
    diagramType: 'schematic',
    governingStandards: ['STD-ISO-16889', 'STD-ISO-11171'],
    applicableSystems: ['hydraulic-protection', 'lubrication-protection'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™'],
    relatedArticles: [
      'iso-16889-multipass-test',
      'beta-ratio',
      'testing-and-validation',
      'fluid-cleanliness',
    ],
    relatedGlossaryTerms: [
      'TERM-BETA-RATIO',
      'TERM-MULTI-PASS-TEST',
      'TERM-DIFFERENTIAL-PRESSURE',
      'TERM-PARTICLE-COUNT',
      'TERM-TEST-DUST',
      'TERM-ABSOLUTE-EFFICIENCY',
    ],
    revisionMetadata: {
      version: '1.0.0',
      lastReviewed: '2026-07-08',
      nextReview: '2027-07-08',
      status: 'current',
    },
    accessibility: {
      title: 'ISO 16889 Multi-Pass Filter Test Circuit',
      desc: 'Schematic of the multi-pass test loop: reservoir, pump, upstream particle counter PC₁, test filter housing with ΔP sensor, downstream particle counter PC₂, and return line. Contamination injection point upstream of PC₁. Beta ratio β = PC₁ ÷ PC₂.',
      ariaLabel: 'Engineering schematic of ISO 16889 multi-pass filter test circuit',
    },
    svgComponentId: 'MultipassTestCircuit',
  },

  // ── 02. Beta Ratio Measurement Schematic ──────────────────────────────────
  {
    slug: 'beta-ratio-measurement',
    entityId: 'DIAG-BETA-RATIO',
    title: 'Beta Ratio Measurement — Upstream / Downstream Particle Count',
    metaDescription:
      'Schematic showing the Beta ratio measurement principle: upstream particle count (Nᵤ) before the filter element versus downstream count (Nd) after. Formula β = Nᵤ/Nd. Filtration efficiency E(%) = (1 − 1/β) × 100.',
    engineeringPurpose:
      'Illustrates the fundamental principle of the Beta ratio (filtration ratio) as defined in ISO 16889. Upstream particles of all sizes enter the filter element; only those below the rated efficiency cut-off pass through to the downstream side. The ratio of upstream to downstream particle counts at a given size defines the Beta ratio, which directly quantifies filtration efficiency.',
    diagramType: 'schematic',
    governingStandards: ['STD-ISO-16889', 'STD-ISO-11171'],
    applicableSystems: ['hydraulic-protection', 'lubrication-protection', 'fuel-cleanliness-protection'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™'],
    relatedArticles: [
      'beta-ratio',
      'iso-16889',
      'filter-media-science',
      'fluid-cleanliness',
      'filter-media-engineering',
    ],
    relatedGlossaryTerms: [
      'TERM-BETA-RATIO',
      'TERM-ABSOLUTE-EFFICIENCY',
      'TERM-NOMINAL-EFFICIENCY',
      'TERM-MULTI-PASS-TEST',
      'TERM-PARTICLE-COUNT',
    ],
    revisionMetadata: {
      version: '1.0.0',
      lastReviewed: '2026-07-08',
      nextReview: '2027-07-08',
      status: 'current',
    },
    accessibility: {
      title: 'Beta Ratio Measurement Schematic',
      desc: 'Left zone shows upstream contaminated fluid with many particles of varying sizes (large orange circles, medium particles, fine particles). Central zone is the filter element shown as a hatched rectangle. Right zone shows downstream clean fluid with only a few fine particles that passed through. Formula β = Nᵤ/Nd and efficiency E(%) = (1 − 1/β) × 100 are shown at bottom.',
      ariaLabel: 'Beta ratio measurement schematic showing particle counts upstream and downstream of a filter element',
    },
    svgComponentId: 'BetaRatioMeasurement',
  },

  // ── 03. ISO 4406 Cleanliness Code Scale ───────────────────────────────────
  {
    slug: 'iso-4406-cleanliness-scale',
    entityId: 'DIAG-ISO4406-CLEANLINESS',
    title: 'ISO 4406 Fluid Cleanliness Code Scale',
    metaDescription:
      'Chart showing ISO 4406 cleanliness code numbers 6 through 24 against particle count per millilitre for three particle size channels (≥4µm, ≥6µm, ≥14µm per ISO 11171), with target cleanliness requirements for servo valves, proportional valves, and gear pumps.',
    engineeringPurpose:
      'Provides a visual reference for interpreting ISO 4406 cleanliness codes. The three-number code (e.g. 17/15/12) represents particle count ranges at ≥4µm, ≥6µm, and ≥14µm channels respectively. Each code increment represents a doubling of particle count. Target cleanliness levels for common hydraulic components are overlaid to show where a given ISO code falls relative to component sensitivity.',
    diagramType: 'chart',
    governingStandards: ['STD-ISO-4406', 'STD-ISO-11171'],
    applicableSystems: ['hydraulic-protection', 'lubrication-protection'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™'],
    relatedArticles: [
      'iso-4406',
      'fluid-cleanliness',
      'hydraulic-contamination-sensitivity',
      'contamination-control',
    ],
    relatedGlossaryTerms: [
      'TERM-ISO-CLEANLINESS-CODE',
      'TERM-PARTICLE-COUNT',
      'TERM-CONTAMINATION-INGRESSION-RATE',
      'TERM-BETA-RATIO',
      'TERM-SERVO-VALVE',
    ],
    revisionMetadata: {
      version: '1.0.0',
      lastReviewed: '2026-07-08',
      nextReview: '2027-07-08',
      status: 'current',
    },
    accessibility: {
      title: 'ISO 4406 Fluid Cleanliness Code Scale Chart',
      desc: 'Chart with ISO 4406 code number on X-axis (6 to 24) and particle count per mL on Y-axis (logarithmic, 0.32 to 20,000). Three lines represent the ≥4µm(c), ≥6µm(c), and ≥14µm(c) particle size channels per ISO 11171. Horizontal bands show target cleanliness for servo valves (≤14/12/10), proportional valves (≤17/15/12), and gear pumps (≤19/17/14).',
      ariaLabel: 'ISO 4406 fluid cleanliness code scale chart showing particle count ranges for codes 6 through 24',
    },
    svgComponentId: 'Iso4406CleanlinessScale',
  },

  // ── 04. Hydraulic System Contamination Paths ───────────────────────────────
  {
    slug: 'hydraulic-contamination-paths',
    entityId: 'DIAG-HYD-CONTAMINATION',
    title: 'Hydraulic System Contamination Ingression Paths',
    metaDescription:
      'System diagram showing the three contamination ingression paths in hydraulic systems: built-in (manufacturing residues), ingressed (seals, breathers, top-up), and generated (component wear). Return and pressure filters remove particles from the circuit.',
    engineeringPurpose:
      'Maps the three fundamental contamination sources that govern hydraulic fluid cleanliness. Built-in contamination enters at assembly and cannot be eliminated without pre-commissioning flush. Ingressed contamination enters continuously during operation through dynamic seals and reservoir breathers. Generated contamination is produced by component wear — itself accelerated by particle contamination, creating a positive-feedback loop that system filtration must break.',
    diagramType: 'system',
    governingStandards: ['STD-ISO-16889', 'STD-NFPA-T2-14', 'STD-ISO-4406'],
    applicableSystems: ['hydraulic-protection'],
    relatedTechnologies: ['NANOFORCE™'],
    relatedArticles: [
      'contamination-control',
      'hydraulic-power-unit-design',
      'hydraulic-system-flushing',
      'hydraulic-reservoir-design',
      'particle-ingress-prevention',
    ],
    relatedGlossaryTerms: [
      'TERM-CONTAMINATION-INGRESSION-RATE',
      'TERM-PARTICLE-COUNT',
      'TERM-ISO-CLEANLINESS-CODE',
      'TERM-SERVO-VALVE',
      'TERM-PROPORTIONAL-VALVE',
      'TERM-BYPASS-FILTRATION',
      'TERM-FULL-FLOW-FILTRATION',
      'TERM-KIDNEY-LOOP',
      'TERM-SYSTEM-FLUSHING',
    ],
    revisionMetadata: {
      version: '1.0.0',
      lastReviewed: '2026-07-08',
      nextReview: '2027-07-08',
      status: 'current',
    },
    accessibility: {
      title: 'Hydraulic System Contamination Ingression Paths Diagram',
      desc: 'Central hydraulic reservoir with three contamination sources shown as labelled boxes with arrows pointing to the reservoir. Top left: Built-in contamination (manufacturing residues, assembly contamination, casting sand, hose fibres). Top right: Ingressed contamination (breather, cylinder rod seals, unfiltered top-up, access covers, water ingress). Bottom left: Generated contamination (pump wear debris, valve spool erosion, seal degradation, hose erosion). Return filter and pressure filter shown removing particles from the circuit loop. Target cleanliness table for servo valves, proportional valves, and gear pumps shown bottom right.',
      ariaLabel: 'Hydraulic system contamination ingression paths diagram showing three contamination sources converging on the reservoir',
    },
    svgComponentId: 'HydraulicContaminationPaths',
  },

  // ── 05. Air Intake Filtration Flow ────────────────────────────────────────
  {
    slug: 'air-intake-filtration-flow',
    entityId: 'DIAG-AIR-INTAKE-FLOW',
    title: 'Air Intake Filtration System Flow Diagram',
    metaDescription:
      'Linear flow diagram of an air intake filtration system: ambient dusty air → pre-cleaner (cyclonic separator) → main filter element → safety element → clean air to engine intake. Restriction indicator monitors differential pressure across the main element. Based on ISO 5011 and SAE J726.',
    engineeringPurpose:
      'Illustrates the staged protection strategy in air intake systems. The pre-cleaner ejects coarse dust particles centrifugally, extending main element service life by 30–60%. The main filter element provides rated dust-holding capacity and efficiency per ISO 5011. The safety element prevents engine ingestion if the main element is incorrectly installed or fails. The restriction indicator signals when the main element has reached its terminal differential pressure.',
    diagramType: 'flow',
    governingStandards: ['STD-ISO-5011', 'STD-SAE-J726'],
    applicableSystems: ['air-intake-protection'],
    relatedTechnologies: ['MACROCORE™'],
    relatedArticles: [
      'air-restriction',
      'air-intake-system-design',
      'dust-holding-capacity',
      'service-intervals',
      'airflow-engineering',
    ],
    relatedGlossaryTerms: [
      'TERM-DUST-HOLDING-CAPACITY',
      'TERM-RESTRICTION',
      'TERM-PROGRESSIVE-DENSITY-GRADIENT',
      'TERM-CYCLONIC-SEPARATION',
      'TERM-INGRESS-PROTECTION',
      'TERM-SERVICE-INTERVAL',
      'TERM-SAFETY-ELEMENT',
      'TERM-PRE-CLEANER',
      'TERM-RESTRICTION-INDICATOR',
    ],
    revisionMetadata: {
      version: '1.0.0',
      lastReviewed: '2026-07-08',
      nextReview: '2027-07-08',
      status: 'current',
    },
    accessibility: {
      title: 'Air Intake Filtration System Flow Diagram',
      desc: 'Left to right flow: ambient air with dust particles (orange circles of various sizes), pre-cleaner box with cyclonic separator symbol ejecting dust downward, main filter element (large hatched rectangle with ISO 5011 label) with restriction indicator gauge above, safety element (smaller hatched rectangle), clean air line (green) with only trace fine particles, and engine intake block with three cylinders. Dust holding capacity note at bottom explains DHC measurement per ISO 5011.',
      ariaLabel: 'Air intake filtration system flow diagram from ambient air through pre-cleaner, main filter, safety element to engine',
    },
    svgComponentId: 'AirIntakeFlow',
  },

  // ── 06. Engine Lube Oil Circuit ───────────────────────────────────────────
  {
    slug: 'lube-oil-circuit',
    entityId: 'DIAG-LUBE-OIL-CIRCUIT',
    title: 'Engine Lube Oil Filtration Circuit — Full-Flow with Bypass Valve',
    metaDescription:
      'Engine lube oil circuit diagram showing oil sump, suction strainer, gear pump, pressure relief valve, full-flow filter with integral bypass valve, main oil gallery, distribution to main bearings, camshaft bearings, and oil drain returns. ISO 16889 governs filter performance.',
    engineeringPurpose:
      'Documents the lube oil filtration circuit architecture used in virtually all internal combustion engines. The full-flow design routes 100% of pump output through the filter, ensuring all circulating oil is filtered before reaching bearings. The integral bypass valve (1.5–3.5 bar ΔP) protects the engine from oil starvation if the filter element becomes blocked — at the cost of passing unfiltered oil. This trade-off is the primary engineering argument for correct filter service intervals.',
    diagramType: 'schematic',
    governingStandards: ['STD-ISO-16889', 'STD-ISO-4406'],
    applicableSystems: ['lubrication-protection'],
    relatedTechnologies: ['SYNTRAX™'],
    relatedArticles: [
      'lubrication-system-filtration',
      'oil-condition-monitoring',
      'service-intervals',
      'total-cost-of-ownership',
      'failure-analysis',
    ],
    relatedGlossaryTerms: [
      'TERM-FILTER-BYPASS-VALVE',
      'TERM-DIFFERENTIAL-PRESSURE',
      'TERM-FULL-FLOW-FILTRATION',
      'TERM-BYPASS-FILTRATION',
      'TERM-BEARING-CLEARANCE',
      'TERM-VISCOSITY',
      'TERM-OIL-DRAIN-INTERVAL',
      'TERM-ABRASIVE-WEAR',
    ],
    revisionMetadata: {
      version: '1.0.0',
      lastReviewed: '2026-07-08',
      nextReview: '2027-07-08',
      status: 'current',
    },
    accessibility: {
      title: 'Engine Lube Oil Filtration Circuit Diagram',
      desc: 'Circuit diagram showing: oil sump at bottom, suction strainer, oil pump with gear symbol, pressure relief valve returning oil to sump, full-flow filter housing with hatched element and bypass valve path, main oil gallery bar, four main bearing ellipses below the gallery, camshaft bearings above, oil drain return lines back to sump. Bypass valve opens at ΔP 1.5–3.5 bar allowing unfiltered oil to bypass the element.',
      ariaLabel: 'Engine lube oil filtration circuit diagram showing full-flow filter with bypass valve and bearing distribution',
    },
    svgComponentId: 'LubeOilCircuit',
  },

  // ── 07. 3-Stage Diesel Fuel Filtration ────────────────────────────────────
  {
    slug: 'fuel-filtration-3stage',
    entityId: 'DIAG-FUEL-3STAGE',
    title: '3-Stage Diesel Fuel Filtration System for HPCR Engines',
    metaDescription:
      'Horizontal flow diagram of a 3-stage diesel fuel filtration system: Stage 1 pre-filter (≥200µm strainer), Stage 2 primary filter with water coalescing separator (≥10µm), Stage 3 secondary fine filter (≥2µm), HPCR injection pump at 2000 bar, injectors, and fuel return line. Based on ISO 16332 and ASTM D6304.',
    engineeringPurpose:
      'Documents the multi-stage filtration architecture required by high-pressure common rail (HPCR) diesel fuel systems. HPCR injection pressures up to 2000 bar reduce injector nozzle clearances to 2–4µm, making fuel cleanliness critical. Stage 1 removes coarse debris protecting the lift pump. Stage 2 removes medium particles and free water (measured per ASTM D6304 Karl Fischer method) which causes injector stiction. Stage 3 provides final protection at ≥2µm before the high-pressure pump.',
    diagramType: 'flow',
    governingStandards: ['STD-ISO-16332', 'STD-ASTM-D6304', 'STD-ISO-12937'],
    applicableSystems: ['fuel-cleanliness-protection'],
    relatedTechnologies: ['SYNTAPORE™', 'HYDROCORE™'],
    relatedArticles: [
      'diesel-fuel-filtration',
      'hpcr-fuel-system-cleanliness',
      'water-contamination-fuel',
      'marine-diesel-filtration',
    ],
    relatedGlossaryTerms: [
      'TERM-HPCR',
      'TERM-COALESCING',
      'TERM-WATER-INGRESS',
      'TERM-FREE-WATER',
      'TERM-EMULSIFIED-WATER',
      'TERM-WATER-SEPARATION-EFFICIENCY',
      'TERM-INJECTOR-STICTION',
      'TERM-KARL-FISCHER-TITRATION',
      'TERM-MICROBIAL-CONTAMINATION',
    ],
    revisionMetadata: {
      version: '1.0.0',
      lastReviewed: '2026-07-08',
      nextReview: '2027-07-08',
      status: 'current',
    },
    accessibility: {
      title: '3-Stage Diesel Fuel Filtration System Diagram',
      desc: 'Left to right flow: fuel tank with yellow fill, Stage 1 pre-filter (coarse strainer ≥200µm, coarse particles shown caught inside), Stage 2 primary filter with water separator (≥10µm, water droplets draining downward, blue drain arrow), lift pump circle, Stage 3 secondary fine filter (≥2µm, green outline), HPCR pump box at 2000 bar, injector nozzles (three triangles in vertical stack), fuel return line in yellow dashed arrow going back to tank.',
      ariaLabel: '3-stage diesel fuel filtration system diagram from tank through three filter stages to HPCR injectors',
    },
    svgComponentId: 'FuelFiltration3Stage',
  },

  // ── 08. Differential Pressure vs Service Life Curve ───────────────────────
  {
    slug: 'differential-pressure-curve',
    entityId: 'DIAG-DP-CURVE',
    title: 'Filter Differential Pressure vs Service Life Curve',
    metaDescription:
      'Chart showing differential pressure (ΔP) across a filter element rising as contamination loading increases over service life. Three threshold lines shown: service indicator alert, bypass valve opening pressure, and element collapse threshold. Based on ISO 16889 and ISO 3968.',
    engineeringPurpose:
      'Documents the ΔP vs service life relationship that governs filter replacement intervals. The curve starts low (clean element initial resistance), rises with dirt accumulation, and accelerates as the element approaches its rated capacity. Three critical thresholds define failure modes: the service indicator threshold (visual/electronic alert to replace), the bypass valve opening pressure (element protection at cost of unfiltered flow), and the element collapse pressure (structural failure under pressure differential).',
    diagramType: 'chart',
    governingStandards: ['STD-ISO-16889', 'STD-ISO-3968'],
    applicableSystems: ['hydraulic-protection', 'lubrication-protection', 'fuel-cleanliness-protection'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™'],
    relatedArticles: [
      'dust-holding-capacity',
      'filter-element-integrity',
      'air-restriction',
      'service-intervals',
    ],
    relatedGlossaryTerms: [
      'TERM-DIFFERENTIAL-PRESSURE',
      'TERM-FILTER-BYPASS-VALVE',
      'TERM-ELEMENT-COLLAPSE',
      'TERM-COLLAPSE-PRESSURE',
      'TERM-DUST-HOLDING-CAPACITY',
      'TERM-SERVICE-INTERVAL',
      'TERM-RESTRICTION-INDICATOR',
    ],
    revisionMetadata: {
      version: '1.0.0',
      lastReviewed: '2026-07-08',
      nextReview: '2027-07-08',
      status: 'current',
    },
    accessibility: {
      title: 'Filter Differential Pressure vs Service Life Curve Chart',
      desc: 'Line chart with contamination load on X-axis (from NEW to END OF LIFE) and differential pressure on Y-axis (low to high). A smooth S-shaped curve rises from bottom-left. Three horizontal dashed threshold lines: yellow dashed at mid-height labelled SERVICE INDICATOR, orange dashed above it labelled BYPASS OPENS, red dashed near top labelled COLLAPSE RISK. Three shaded background zones: faint green below service indicator (normal operating range), faint yellow between service indicator and bypass (service interval exceeded), faint red above bypass (bypass active, unfiltered flow). Circle marker at intersection of curve and service indicator threshold.',
      ariaLabel: 'Chart showing differential pressure rising across filter element over service life with three threshold lines',
    },
    svgComponentId: 'DifferentialPressureCurve',
  },

  // ── 09. Compressed Air Treatment Train ────────────────────────────────────
  {
    slug: 'compressed-air-treatment',
    entityId: 'DIAG-CA-TREATMENT',
    title: 'Compressed Air Treatment Train — ISO 8573-1 Purity Classes',
    metaDescription:
      'Sequential compressed air treatment stages: compressor, aftercooler and moisture separator, desiccant dryer (dew point ≤−40°C), particulate filter (ISO 8573-1 dust class), oil coalescing filter, activated carbon filter — achieving Class 1.1.1 at end use. Based on ISO 8573-1 and ISO 8573-2.',
    engineeringPurpose:
      'Defines the treatment sequence required to achieve ISO 8573-1 compressed air purity classes from raw compressor output. Compression raises moisture content above ambient dew point, making condensate separation and drying mandatory. Particulate and oil coalescing filtration removes compressor lubricant carry-over. Each stage targets a specific contaminant class (solids, water, oil) as defined in ISO 8573-1. ISO 8573-2 specifies the test methods for measuring oil content to verify compliance.',
    diagramType: 'process',
    governingStandards: ['STD-ISO-8573-1', 'STD-ISO-8573-2'],
    applicableSystems: [],
    relatedTechnologies: ['DRYCORE™'],
    relatedArticles: [
      'compressed-air-purity',
      'compressed-air-quality-verification',
      'compressed-air-dryer-selection',
    ],
    relatedGlossaryTerms: [
      'TERM-COMPRESSED-AIR-PURITY',
      'TERM-DEW-POINT',
      'TERM-COALESCING',
      'TERM-DEPTH-FILTRATION',
      'TERM-RESTRICTION',
    ],
    revisionMetadata: {
      version: '1.0.0',
      lastReviewed: '2026-07-08',
      nextReview: '2027-07-08',
      status: 'current',
    },
    accessibility: {
      title: 'Compressed Air Treatment Train Diagram',
      desc: 'Left to right sequence: ambient air inlet, compressor block with triangle pump symbol, aftercooler (sinusoidal coil symbol, blue) with condensate drain arrow, desiccant dryer (vessel filled with bead circles, dew point ≤−40°C label, water drain), particulate filter (circle with diamond filter symbol and ISO 8573-1 dust label), oil coalescing filter (yellow-bordered circle with diamond symbol and oil mist label, oil drain at bottom), activated carbon filter (circle with green beads symbol), and clean air end use box labelled Class 1.1.1. ISO 8573-1 purity class reference table at bottom.',
      ariaLabel: 'Compressed air treatment train diagram showing sequential treatment stages from compressor to Class 1.1.1 clean air',
    },
    svgComponentId: 'CompressedAirTreatment',
  },

  // ── 10. Particle Wear Mechanism ───────────────────────────────────────────
  {
    slug: 'particle-wear-mechanism',
    entityId: 'DIAG-PARTICLE-WEAR',
    title: 'Particle Wear Mechanisms in Lubricated Systems',
    metaDescription:
      'Three-panel diagram showing abrasive wear mechanisms in lubricated systems: two-body abrasion (hard particle embedded in surface cutting counter-face), three-body abrasion (free particle rolling between surfaces), and adhesive wear (direct metal-to-metal contact from oil film breakdown). Critical particle size range relative to bearing clearance shown.',
    engineeringPurpose:
      'Provides a mechanistic understanding of how particle contamination causes surface damage in lubricated systems. Two-body abrasion accounts for the deepest groove wear; three-body abrasion is the most common mode in hydraulic and lube systems where hard particles circulate freely. Adhesive wear occurs when the lubricant film breaks down (from oil degradation, water contamination, or overloading). All three mechanisms are accelerated by particles in the 0.5–5µm range relative to bearing clearance — the primary engineering argument for ≤6µm filtration efficiency ratings.',
    diagramType: 'schematic',
    governingStandards: ['STD-ISO-4406', 'STD-ISO-16889'],
    applicableSystems: ['lubrication-protection', 'hydraulic-protection'],
    relatedTechnologies: ['SYNTRAX™', 'NANOFORCE™', 'MACROCORE™'],
    relatedArticles: [
      'contamination-control',
      'failure-analysis',
      'filter-media-science',
      'fluid-cleanliness',
    ],
    relatedGlossaryTerms: [
      'TERM-ABRASIVE-WEAR',
      'TERM-ADHESIVE-WEAR',
      'TERM-PARTICLE-SIZE-DISTRIBUTION',
      'TERM-BEARING-CLEARANCE',
      'TERM-SILICA',
      'TERM-FERROUS-WEAR-DEBRIS',
    ],
    revisionMetadata: {
      version: '1.0.0',
      lastReviewed: '2026-07-08',
      nextReview: '2027-07-08',
      status: 'current',
    },
    accessibility: {
      title: 'Particle Wear Mechanisms Diagram',
      desc: 'Three panels separated by vertical dividers. Left panel (Two-Body Abrasion): upper surface moving right over lower surface, hard triangular particle embedded in lower surface creating a wear groove on upper surface. Centre panel (Three-Body Abrasion): free circular particles of varying sizes between two surfaces, causing simultaneous wear on both faces. Right panel (Adhesive Wear): direct metal contact zones shown as red-highlighted rectangles between surfaces where oil film is absent, with material transfer arrows. Bottom bar shows critical particle size range: engine bearings 0.5–5µm, servo valves 0.5–2µm, per ISO 4406.',
      ariaLabel: 'Three-panel diagram of particle wear mechanisms: two-body abrasion, three-body abrasion, and adhesive wear',
    },
    svgComponentId: 'ParticleWearMechanism',
  },

  // ── Phase 6B: Five additional engineering diagrams ────────────────────────

  // ── 11. Filter Media Cross-Section ────────────────────────────────────────
  {
    slug: 'filter-media-cross-section',
    entityId: 'DIAG-MEDIA-CROSS-SECTION',
    title: 'Filter Element Media Cross-Section',
    metaDescription:
      'Cross-section diagram of a cylindrical filter element showing outer wrap, pre-filter layer, main filtration media depth zone, anti-collapse scrim, and perforated center tube with progressive particle capture at each layer.',
    engineeringPurpose:
      'Illustrates the layered construction of a modern multi-layer filter element and how particle capture efficiency arises from depth filtration. The progressive-density gradient from outer coarse layers to inner fine media layers maximises dirt-holding capacity while maintaining the rated Beta ratio efficiency.',
    diagramType: 'cross-section',
    governingStandards: ['STD-ISO-16889', 'STD-ISO-11171'],
    applicableSystems: ['hydraulic-protection', 'lubrication-protection', 'fuel-cleanliness'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™', 'SYNTAPORE™'],
    relatedArticles: [
      'filter-media-science',
      'filter-media-engineering',
      'fluid-cleanliness',
      'testing-and-validation',
      'dust-holding-capacity',
    ],
    relatedGlossaryTerms: [
      'TERM-DEPTH-FILTRATION',
      'TERM-SURFACE-FILTRATION',
      'TERM-PROGRESSIVE-DENSITY-GRADIENT',
      'TERM-SYNTHETIC-MEDIA',
      'TERM-CELLULOSE-MEDIA',
      'TERM-BETA-RATIO',
      'TERM-COLLAPSE-PRESSURE',
      'TERM-MELT-BLOWN-MEDIA',
    ],
    revisionMetadata: {
      version: '1.0.0',
      lastReviewed: '2026-07-08',
      nextReview: '2027-07-08',
      status: 'current',
    },
    accessibility: {
      title: 'Filter Element Media Cross-Section',
      desc: 'Cross-sectional view through a cylindrical filter element from outside to center. Left edge: protective outer wrap. Next layer: coarse pre-filter zone showing large particle symbols trapped near the surface. Main zone (widest): synthetic or glass-fiber filtration media with progressive density gradient — large particles captured near outer edge, medium particles at mid-depth, fine particles near the center. Anti-collapse inner scrim. Right edge: perforated steel center tube providing structural support. Arrows show contaminated flow entering from left, clean filtered flow exiting right. Formula box: Beta ratio β = N_upstream ÷ N_downstream per ISO 16889.',
      ariaLabel: 'Cross-section diagram of a cylindrical filter element showing outer wrap, pre-filter layer, main filtration media, and perforated center tube',
    },
    svgComponentId: 'FilterMediaCrossSection',
  },

  // ── 12. ISO 8573-1 Purity Classes ─────────────────────────────────────────
  {
    slug: 'iso-8573-purity-classes',
    entityId: 'DIAG-ISO8573-PURITY',
    title: 'ISO 8573-1 Compressed Air Purity Classes',
    metaDescription:
      'Chart reference for ISO 8573-1:2010 compressed air purity classifications covering solid particle count, pressure dew point, and total oil content across Classes 0 through 9.',
    engineeringPurpose:
      'Provides a visual reference for ISO 8573-1 purity class selection in compressed air system design. Engineers select the appropriate class for each application based on sensitivity to solid particles, moisture, and oil — then specify the treatment train components required to achieve that class at the point of use.',
    diagramType: 'chart',
    governingStandards: ['STD-ISO-8573-1', 'STD-ISO-8573-2'],
    applicableSystems: ['compressed-air-protection'],
    relatedTechnologies: ['DRYCORE™'],
    relatedArticles: [
      'compressed-air-purity',
      'compressed-air-quality-verification',
      'compressed-air-dryer-selection',
      'testing-and-validation',
    ],
    relatedGlossaryTerms: [
      'TERM-COMPRESSED-AIR-PURITY',
      'TERM-DEW-POINT',
      'TERM-PARTICLE-COUNT',
      'TERM-PARTICLE-SIZE-DISTRIBUTION',
    ],
    revisionMetadata: {
      version: '1.0.0',
      lastReviewed: '2026-07-08',
      nextReview: '2027-07-08',
      status: 'current',
    },
    accessibility: {
      title: 'ISO 8573-1 Compressed Air Purity Classes Chart',
      desc: 'Three-panel reference chart for ISO 8573-1:2010. Top panel — solid particles: table showing Classes 0–5 with maximum particle count per cubic metre at size ranges ≥0.1 µm, ≥0.5 µm, ≥1 µm, and ≥5 µm; Class 0 requires user specification, Class 1 is most stringent. Middle panel — water content: horizontal bars showing maximum pressure dew point from Class 1 (−70°C, driest) to Class 6 (+10°C, least dry). Bottom panel — oil content: bar chart showing Classes 1–4 maximum total oil content from 0.01 mg/m³ to 5 mg/m³.',
      ariaLabel: 'Chart showing ISO 8573-1:2010 compressed air purity classes 0 through 9 for solid particles, water content, and total oil content',
    },
    svgComponentId: 'Iso8573PurityClasses',
  },

  // ── 13. Service Interval Decision Flow ────────────────────────────────────
  {
    slug: 'service-interval-flow',
    entityId: 'DIAG-SERVICE-INTERVAL-FLOW',
    title: 'Service Interval Planning Decision Flow',
    metaDescription:
      'Engineering decision flowchart for calculating filter service intervals from dirt holding capacity (DHC), contamination ingestion rate, system flow rate, and safety factor per ISO 3724:2007 and SAE J1299:2008.',
    engineeringPurpose:
      'Documents the ISO 3724/SAE J1299 service interval calculation method as a decision flow so engineers can systematically derive replacement intervals from measured or estimated DHC, environment-specific ingestion rates, and application safety factors. The output interval is a planning target requiring field validation.',
    diagramType: 'flow',
    governingStandards: ['STD-ISO-16889'],
    applicableSystems: ['air-intake-protection', 'hydraulic-protection', 'lubrication-protection', 'fuel-cleanliness'],
    relatedTechnologies: ['MACROCORE™', 'SYNTRAX™', 'NANOFORCE™'],
    relatedArticles: [
      'service-intervals',
      'dust-holding-capacity',
      'contamination-ingression-modelling',
      'total-cost-of-ownership',
    ],
    relatedGlossaryTerms: [
      'TERM-DUST-HOLDING-CAPACITY',
      'TERM-CONTAMINATION-INGRESSION-RATE',
      'TERM-SERVICE-INTERVAL',
      'TERM-DIFFERENTIAL-PRESSURE',
    ],
    revisionMetadata: {
      version: '1.0.0',
      lastReviewed: '2026-07-08',
      nextReview: '2027-07-08',
      status: 'current',
    },
    accessibility: {
      title: 'Service Interval Planning Decision Flow',
      desc: 'Flowchart for filter service interval planning per ISO 3724 and SAE J1299. Start oval: Filter Service Interval Planning. Step 1 box: Measure DHC via ISO 16889 multipass test or estimate from media area × capacity factor, result in grams. Step 2 box: Classify operating environment — construction 2.0 mg/L typical ingestion, agriculture 0.8 mg/L, industrial 0.15 mg/L per SAE J1299 Table 2. Step 3 box: Apply safety factor — construction 0.65, agriculture 0.75, industrial 0.85 per SAE J1299 Annex D. Step 4 box: Calculate service interval I_s = DHC × S_f divided by C_in × Q × 60, result in hours. End oval: Service Interval I_s in hours. Side note: verify against field data and adjust safety factor if needed.',
      ariaLabel: 'Flowchart showing the engineering process for calculating filter service intervals from dirt holding capacity, contamination ingestion rate, and safety factor',
    },
    svgComponentId: 'ServiceIntervalFlow',
  },

  // ── 14. Cabin Air Filtration System ───────────────────────────────────────
  {
    slug: 'cabin-air-system',
    entityId: 'DIAG-CABIN-AIR-SYSTEM',
    title: 'Cabin Air Filtration System — ISO 11155',
    metaDescription:
      'System diagram of an ISO 11155 vehicle cabin air filtration train showing fresh air inlet, coarse particulate pre-filter, activated carbon gas-phase stage, fine particulate HEPA stage, recirculation mode damper, and cabin delivery.',
    engineeringPurpose:
      'Documents the filtration stages in a compliant cabin air system under ISO 11155. Operators in construction, agriculture, and mining environments may be exposed to PM10 and PM2.5 concentrations that exceed occupational exposure limits without an effective cabin filtration system. Each stage addresses a distinct contaminant class: coarse particles, gas-phase contaminants, and fine respirable particles.',
    diagramType: 'system',
    governingStandards: ['STD-ISO-11155-1', 'STD-ISO-29463', 'STD-DIN-71220'],
    applicableSystems: ['cabin-air-protection'],
    relatedTechnologies: ['MICROKAPPA™'],
    relatedArticles: [
      'cabin-air-filtration',
      'filter-element-integrity',
      'seal-integrity',
    ],
    relatedGlossaryTerms: [
      'TERM-PRE-CLEANER',
      'TERM-DEPTH-FILTRATION',
      'TERM-SAFETY-ELEMENT',
    ],
    revisionMetadata: {
      version: '1.0.0',
      lastReviewed: '2026-07-08',
      nextReview: '2027-07-08',
      status: 'current',
    },
    accessibility: {
      title: 'Cabin Air Filtration System ISO 11155 Diagram',
      desc: 'Left-to-right system flow. Outside air inlet on the left. First stage: coarse particulate pre-filter labelled PM10 stage per ISO 11155, showing large particle symbols blocked. Second stage: activated carbon adsorber for gas-phase contaminants and odours, shown as a dotted-pattern block. Third stage: fine particulate filter labelled PM2.5/HEPA achieving greater than 95% efficiency at 0.3 µm per ISO 29463, shown with dense hatch and very small particles blocked. Arrow continues to cabin HVAC zone on the right. A recirculation branch shown as a dashed arrow below the main flow returns cabin air to the carbon and fine filter stages, controlled by a damper. Labels indicate fresh air mode on main path and recirculation mode on branch.',
      ariaLabel: 'System diagram of a vehicle cabin air filtration system showing fresh air inlet, particulate pre-filter, activated carbon stage, HEPA final stage, recirculation loop, and delivery to cabin',
    },
    svgComponentId: 'CabinAirSystem',
  },

  // ── 15. Water Contamination Pathways ──────────────────────────────────────
  {
    slug: 'water-contamination-pathways',
    entityId: 'DIAG-WATER-CONT-PATHS',
    title: 'Water Contamination Ingress Pathways — Diesel Fuel Systems',
    metaDescription:
      'Engineering diagram showing five water ingress pathways into diesel fuel and hydraulic systems — condensation, fill cap, breather vent, worn seals, and cross-contamination — and the downstream equipment damage consequences.',
    engineeringPurpose:
      'Identifies and maps the five primary water ingress mechanisms in diesel fuel and hydraulic reservoirs to enable targeted prevention design. Water contamination is the primary failure driver in HPCR fuel injection systems and the principal cause of microbial growth in diesel fuel tanks. Each ingress pathway requires a specific prevention measure.',
    diagramType: 'flow',
    governingStandards: ['STD-ASTM-D6304', 'STD-ISO-12937', 'STD-ISO-16332'],
    applicableSystems: ['fuel-cleanliness', 'hydraulic-protection'],
    relatedTechnologies: ['HYDROCORE™'],
    relatedArticles: [
      'water-contamination-fuel',
      'diesel-fuel-filtration',
      'hpcr-fuel-system-cleanliness',
      'contamination-control',
    ],
    relatedGlossaryTerms: [
      'TERM-WATER-INGRESS',
      'TERM-KARL-FISCHER-TITRATION',
      'TERM-FREE-WATER',
      'TERM-EMULSIFIED-WATER',
      'TERM-MICROBIAL-CONTAMINATION',
      'TERM-COALESCING',
      'TERM-HPCR',
      'TERM-INJECTOR-STICTION',
      'TERM-WATER-SEPARATION-EFFICIENCY',
    ],
    revisionMetadata: {
      version: '1.0.0',
      lastReviewed: '2026-07-08',
      nextReview: '2027-07-08',
      status: 'current',
    },
    accessibility: {
      title: 'Water Contamination Ingress Pathways Diagram',
      desc: 'Central element: a fuel or hydraulic reservoir tank shape. Five ingress pathways shown as arrows pointing into the tank. Top-left: condensation from temperature cycling with water droplet symbols. Top-right: fill cap splash or rain ingress. Left: breather vent admitting humid air shown as a dashed arrow. Bottom-left: worn shaft seals allowing external water ingress. Bottom-right: transfer cross-contamination from contaminated fluid during transfers. Right side of diagram: consequence chain — arrow leaving tank labelled free water present, then four stacked consequence boxes: microbial growth from sulphate-reducing bacteria, filter plugging at the hydrocarbon-water interface, injector corrosion, and HPCR pump damage. Detection box below: Karl Fischer titration per ASTM D6304 and ISO 12937, target below 200 ppm by weight.',
      ariaLabel: 'Diagram showing five water contamination ingress pathways in diesel fuel systems and the downstream equipment damage consequences',
    },
    svgComponentId: 'WaterContaminationPathways',
  },
];

/**
 * getDiagramBySlug — O(n) lookup; diagram count is small enough that Map is not necessary.
 */
export function getDiagramBySlug(slug: string): KCDiagram | undefined {
  return ENGINEERING_DIAGRAMS.find((d) => d.slug === slug);
}

/**
 * getDiagramsForArticle — returns all diagrams that list the given article slug.
 */
export function getDiagramsForArticle(articleSlug: string): KCDiagram[] {
  return ENGINEERING_DIAGRAMS.filter((d) => d.relatedArticles.includes(articleSlug));
}

/**
 * getDiagramsForStandard — returns all diagrams governed by a given STD-xxx entity ID.
 */
export function getDiagramsForStandard(stdEntityId: string): KCDiagram[] {
  return ENGINEERING_DIAGRAMS.filter((d) => d.governingStandards.includes(stdEntityId));
}
