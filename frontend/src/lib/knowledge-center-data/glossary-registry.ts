/**
 * glossary-registry.ts
 * ELIMFILTERS Engineering Knowledge Platform — Glossary Data Registry
 *
 * Phase 5B: Engineering Glossary Expansion
 * 50 canonical engineering terms. Every term is a first-class graph entity
 * with permanent ID, engineering context, and full relationship edges to
 * standards, technologies, systems, and articles.
 *
 * Dependency: governance.ts (TerminologyEntry type)
 * Consumed by: knowledge-center/terminology-registry.ts → navigation-index.ts
 *
 * Rules:
 *   - One definition per term, exists nowhere else in the codebase
 *   - All articles reference TERM-xxx identifiers, never write inline definitions
 *   - relatedArticles, relatedTechnologies, relatedSystems use slugs (not IDs)
 *   - applicableStandards, relatedTerms use permanent IDs (STD-xxx, TERM-xxx)
 */

import type { TerminologyEntry } from '../knowledge-center/governance';

export const GLOSSARY_REGISTRY: Record<string, TerminologyEntry> = {

  // ── FILTRATION PERFORMANCE ────────────────────────────────────────────────────

  'TERM-BETA-RATIO': {
    id: 'TERM-BETA-RATIO',
    term: 'Beta Ratio',
    category: 'filtration-performance',
    definition:
      'The ratio of the number of particles of a given size (x µm) upstream of a filter to the number of the same-sized particles downstream, as measured by the multi-pass test per ISO 16889. Expressed as β_x(c), where x is the particle size in micrometres and c denotes the counting method. A Beta ratio of 200 at 10 µm (β₁₀(c) = 200) means 200 upstream particles for every 1 downstream particle, corresponding to 99.5% single-pass efficiency.',
    engineeringContext:
      'Beta ratio is the primary standardised efficiency metric for hydraulic and lubrication filters. It enables direct performance comparison across manufacturers because all measurements follow the same multi-pass test conditions defined in ISO 16889. Specifying β₁₀(c) ≥ 200 is a minimum requirement for proportional valve protection in mobile hydraulics.',
    aliases: ['ß ratio', 'filtration ratio', 'Beta-x', 'beta_x(c)'],
    abbreviations: ['β_x(c)', 'β₁₀(c)'],
    applicableStandards: ['STD-ISO-16889'],
    relatedTerms: ['TERM-ABSOLUTE-EFFICIENCY', 'TERM-NOMINAL-EFFICIENCY', 'TERM-MULTI-PASS-TEST'],
    relatedTechnologies: ['syntrax', 'nanoforce', 'macrocore'],
    relatedSystems: ['lubrication-protection', 'hydraulic-protection'],
    relatedArticles: ['beta-ratio', 'iso-16889', 'iso-16889-multipass-test', 'filter-media-engineering', 'testing-and-validation'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-ABSOLUTE-EFFICIENCY': {
    id: 'TERM-ABSOLUTE-EFFICIENCY',
    term: 'Absolute Efficiency',
    category: 'filtration-performance',
    definition:
      'Filter efficiency expressed as the percentage of particles of a specified size removed in a single pass through the filter element, derived from the Beta ratio: Absolute Efficiency = (1 − 1/β_x(c)) × 100%. A β₁₀(c) of 200 corresponds to 99.5% absolute efficiency at 10 µm. Absolute efficiency ratings are measured under standardised multi-pass test conditions per ISO 16889.',
    engineeringContext:
      'Absolute efficiency is the correct metric when specifying filters for critical systems including servo valves, proportional valves, and precision hydraulic actuators. Unlike nominal efficiency, absolute efficiency values are reproducible across test laboratories because they derive from a defined multi-pass test protocol.',
    aliases: ['single-pass efficiency', 'absolute filtration efficiency'],
    abbreviations: ['AE'],
    applicableStandards: ['STD-ISO-16889'],
    relatedTerms: ['TERM-BETA-RATIO', 'TERM-NOMINAL-EFFICIENCY', 'TERM-MULTI-PASS-TEST'],
    relatedTechnologies: ['nanoforce', 'syntrax'],
    relatedSystems: ['lubrication-protection', 'hydraulic-protection'],
    relatedArticles: ['beta-ratio', 'filter-media-engineering', 'iso-16889'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-NOMINAL-EFFICIENCY': {
    id: 'TERM-NOMINAL-EFFICIENCY',
    term: 'Nominal Efficiency',
    category: 'filtration-performance',
    definition:
      'A non-standardised efficiency rating indicating that a filter removes a stated percentage of particles at a stated size under single-pass conditions, without defining the specific test method used. Unlike absolute efficiency (ISO 16889 multi-pass), nominal efficiency ratings are not comparable across manufacturers because test conditions vary. Nominal ratings are not used in ELIMFILTERS engineering documentation; all efficiency claims reference ISO 16889 Beta ratio.',
    engineeringContext:
      'Nominal efficiency appears frequently in commodity filter datasheets as "90% at 10 micron" or similar claims. Because the test method is unspecified, two filters both rated "90% nominal at 10 µm" may have actual efficiencies ranging from 50% to 95% under identical real-world conditions. Use Beta ratio (ISO 16889) for accurate performance comparisons.',
    aliases: ['nominal filtration rating', 'nominal micron rating'],
    abbreviations: [],
    applicableStandards: ['STD-ISO-16889'],
    relatedTerms: ['TERM-BETA-RATIO', 'TERM-ABSOLUTE-EFFICIENCY'],
    relatedTechnologies: [],
    relatedSystems: [],
    relatedArticles: ['beta-ratio', 'filter-media-science', 'oem-engineering'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-MULTI-PASS-TEST': {
    id: 'TERM-MULTI-PASS-TEST',
    term: 'Multi-Pass Test',
    category: 'filtration-performance',
    definition:
      'A standardised laboratory test method defined in ISO 16889 for measuring hydraulic filter performance. Test fluid is circulated through the filter element in multiple passes while ISO 12103-1 A2 Fine test dust is injected at a controlled rate upstream. Particle counts are taken upstream and downstream using automatic particle counters per ISO 11171 at defined intervals. The test runs until a terminal pressure differential is reached. Results yield the Beta ratio at each particle size and the dust holding capacity.',
    engineeringContext:
      'The multi-pass test is the global standard for hydraulic and lubrication filter qualification. Its multi-pass recirculation design allows fine particles to be counted with statistical accuracy across multiple filtration cycles, unlike single-pass tests which cannot control particle concentration precisely at the filter inlet.',
    aliases: ['ISO 16889 test', 'multi-pass filtration test', 'filter efficiency test'],
    abbreviations: ['MPT'],
    applicableStandards: ['STD-ISO-16889', 'STD-ISO-11171'],
    relatedTerms: ['TERM-BETA-RATIO', 'TERM-ABSOLUTE-EFFICIENCY', 'TERM-TEST-DUST', 'TERM-DIFFERENTIAL-PRESSURE'],
    relatedTechnologies: [],
    relatedSystems: [],
    relatedArticles: ['iso-16889', 'iso-16889-multipass-test', 'testing-and-validation', 'beta-ratio'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-GRAVIMETRIC-EFFICIENCY': {
    id: 'TERM-GRAVIMETRIC-EFFICIENCY',
    term: 'Gravimetric Efficiency',
    category: 'filtration-performance',
    definition:
      'Air filter efficiency measured by the percentage reduction in mass of standardised test dust (ISO 12103-1) passed through the filter element, as defined in ISO 5011 and SAE J726. Gravimetric efficiency is the primary efficiency metric for air intake filters, reflecting the filter\'s ability to capture the total mass of airborne contaminants before they enter the engine. A gravimetric efficiency of 99.9% means that for every 1,000 g of test dust introduced upstream, 999 g is retained by the filter element.',
    engineeringContext:
      'Air intake filters are evaluated by gravimetric efficiency rather than Beta ratio because airborne dust exists in a wide, continuous particle size distribution. Gravimetric efficiency measures the cumulative mass capture across all particle sizes present in the test dust, which correlates directly with the mass of field dust prevented from entering engine cylinders and causing abrasive wear.',
    aliases: ['overall efficiency', 'mass efficiency', 'air filter efficiency'],
    abbreviations: ['GE'],
    applicableStandards: ['STD-ISO-5011', 'STD-SAE-J726'],
    relatedTerms: ['TERM-DUST-HOLDING-CAPACITY', 'TERM-RESTRICTION', 'TERM-TEST-DUST'],
    relatedTechnologies: ['macrocore'],
    relatedSystems: ['air-intake-protection'],
    relatedArticles: ['iso-5011', 'sae-j726-iso-5011-air-cleaner-test', 'airflow-engineering', 'air-intake-system-design'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-DIFFERENTIAL-PRESSURE': {
    id: 'TERM-DIFFERENTIAL-PRESSURE',
    term: 'Differential Pressure',
    category: 'filtration-performance',
    definition:
      'The pressure difference (ΔP) measured across a filter element between the upstream (dirty) and downstream (clean) sides, typically expressed in bar, millibar (mbar), or pounds per square inch (psi). A clean filter element has low differential pressure at rated flow. As the element loads with contaminant, differential pressure increases progressively until reaching the element\'s service limit, triggering replacement. In air intake systems, differential pressure is termed restriction.',
    engineeringContext:
      'Differential pressure monitoring is the primary method for determining filter service life in hydraulic and lubrication systems. Bypass valves are set to open at a maximum differential pressure (typically 3–6 bar for hydraulic elements, 1.5–4 bar for lube filters) to protect the downstream circuit from flow starvation when the element is fully loaded. Continuous ΔP sensors enable condition-based replacement in high-criticality systems.',
    aliases: ['pressure drop', 'pressure differential', 'ΔP'],
    abbreviations: ['ΔP', 'dP'],
    applicableStandards: ['STD-ISO-16889', 'STD-ISO-5011'],
    relatedTerms: ['TERM-FILTER-BYPASS-VALVE', 'TERM-RESTRICTION', 'TERM-ELEMENT-COLLAPSE', 'TERM-SERVICE-INTERVAL'],
    relatedTechnologies: ['syntrax', 'nanoforce'],
    relatedSystems: ['lubrication-protection', 'hydraulic-protection'],
    relatedArticles: ['filter-element-integrity', 'service-intervals', 'hydraulic-power-unit-design', 'lubrication-system-filtration'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-FILTER-BYPASS-VALVE': {
    id: 'TERM-FILTER-BYPASS-VALVE',
    term: 'Filter Bypass Valve',
    category: 'filtration-performance',
    definition:
      'A spring-loaded pressure relief valve integrated into a filter element or filter housing that opens automatically when differential pressure across the filter element exceeds a preset threshold, allowing unfiltered fluid to bypass the element and maintain circuit flow. Bypass valves protect downstream components from oil starvation during cold starts (when high oil viscosity creates elevated ΔP) and when filter elements are overloaded with contaminant. Bypass valve opening pressure is typically 1.5–4 bar for lube oil filters and 3–6 bar for hydraulic elements.',
    engineeringContext:
      'A bypass valve is a last-resort protection device, not a service indicator. Bypass events introduce unfiltered, particle-laden fluid into the circuit, causing rapid component wear. Filter systems must be selected and maintained so bypass valve activation is infrequent. Bypass indicators (visual or electronic) enable detection of bypass events in service.',
    aliases: ['bypass relief valve', 'pressure relief valve', 'anti-drain back valve'],
    abbreviations: [],
    applicableStandards: [],
    relatedTerms: ['TERM-DIFFERENTIAL-PRESSURE', 'TERM-ELEMENT-COLLAPSE', 'TERM-FULL-FLOW-FILTRATION'],
    relatedTechnologies: ['syntrax', 'intekcore'],
    relatedSystems: ['lubrication-protection', 'hydraulic-protection'],
    relatedArticles: ['filter-element-integrity', 'filter-housing-design', 'lubrication-system-filtration'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-ELEMENT-COLLAPSE': {
    id: 'TERM-ELEMENT-COLLAPSE',
    term: 'Element Collapse',
    category: 'filtration-performance',
    definition:
      'The structural failure of a filter element under excessive differential pressure, in which the filter media and/or support structure collapses inward (for outside-in flow) or outward (for inside-out flow), irreversibly destroying the element\'s filtration integrity. Collapse releases accumulated contaminant directly into the downstream circuit. Collapse pressure is the minimum differential pressure at which a filter element will structurally fail, measured per ISO 3723 (collapse/burst test). ELIMFILTERS elements are designed with collapse pressures exceeding 21 bar to provide a margin above maximum bypass valve settings.',
    engineeringContext:
      'Element collapse is a catastrophic failure mode that typically results from failure to replace an overloaded filter element, a stuck or absent bypass valve, or extremely high cold-start viscosity combined with rapid acceleration. Post-collapse contamination events require complete system flushing and inspection of downstream components.',
    aliases: ['filter collapse', 'media collapse', 'structural filter failure'],
    abbreviations: [],
    applicableStandards: [],
    relatedTerms: ['TERM-DIFFERENTIAL-PRESSURE', 'TERM-FILTER-BYPASS-VALVE'],
    relatedTechnologies: ['syntrax', 'macrocore', 'intekcore'],
    relatedSystems: ['lubrication-protection', 'hydraulic-protection', 'air-intake-protection'],
    relatedArticles: ['filter-element-integrity', 'failure-analysis', 'materials-engineering'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  // ── FLUID CLEANLINESS ─────────────────────────────────────────────────────────

  'TERM-ISO-CLEANLINESS-CODE': {
    id: 'TERM-ISO-CLEANLINESS-CODE',
    term: 'ISO Cleanliness Code',
    category: 'fluid-cleanliness',
    definition:
      'A three-number code defined by ISO 4406 that quantifies the particle contamination level in a fluid sample. Each number represents the quantity of particles per millilitre in a specific size range: the first covers particles ≥4 µm(c), the second ≥6 µm(c), and the third ≥14 µm(c). Each code number represents a particle count range in powers of two — code 16 = 320–640 particles/mL, code 14 = 80–160 particles/mL. A cleanliness code of 16/14/11 means: 320–640 particles ≥4 µm, 80–160 particles ≥6 µm, and 10–20 particles ≥14 µm per millilitre. Tighter codes (lower numbers) indicate cleaner fluid and reduce risk of abrasive wear, valve stiction, and bearing failure.',
    engineeringContext:
      'ISO cleanliness codes are the global standard for specifying and verifying hydraulic and lubrication system fluid cleanliness. Target codes vary by component sensitivity: servo valves require 15/13/10 or tighter; general hydraulic systems typically target 17/15/12; engine lube systems target 16/14/11. Cleanliness codes are measured by laser particle counting per ISO 11171.',
    aliases: ['ISO 4406 code', 'fluid cleanliness target', 'cleanliness class', 'ISO code'],
    abbreviations: ['ICC'],
    applicableStandards: ['STD-ISO-4406', 'STD-ISO-11171'],
    relatedTerms: ['TERM-BETA-RATIO', 'TERM-SERVO-VALVE', 'TERM-PARTICLE-COUNT', 'TERM-NAS-CLEANLINESS-CODE'],
    relatedTechnologies: ['nanoforce', 'syntrax'],
    relatedSystems: ['lubrication-protection', 'hydraulic-protection'],
    relatedArticles: ['iso-4406', 'fluid-cleanliness', 'hydraulic-contamination-sensitivity', 'contamination-sensitivity-components'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-PARTICLE-COUNT': {
    id: 'TERM-PARTICLE-COUNT',
    term: 'Particle Count',
    category: 'fluid-cleanliness',
    definition:
      'The number of particles of a specified size range present in a unit volume of fluid, typically expressed as particles per millilitre (p/mL) or particles per 100 mL. Particle counts are measured by automatic particle counters using laser light obscuration or light scattering, calibrated per ISO 11171 using NIST-traceable calibration standards. Results are reported as cumulative counts at threshold sizes of ≥4 µm(c), ≥6 µm(c), and ≥14 µm(c) for ISO 4406 cleanliness code determination.',
    engineeringContext:
      'Particle counting is the fundamental measurement underlying all fluid cleanliness standards. Field particle counting uses portable laser particle counters inserted into sampling ports on operating machinery. Laboratory particle counting uses dedicated optical benchtop instruments. Sample handling — avoiding contamination from bottles, tubing, and ambient environment — is critical for accurate results.',
    aliases: ['particle concentration', 'particle contamination level', 'particle density'],
    abbreviations: ['p/mL', 'p/100mL'],
    applicableStandards: ['STD-ISO-11171', 'STD-ISO-4406'],
    relatedTerms: ['TERM-ISO-CLEANLINESS-CODE', 'TERM-NAS-CLEANLINESS-CODE', 'TERM-OIL-CONDITION-MONITORING'],
    relatedTechnologies: [],
    relatedSystems: ['lubrication-protection', 'hydraulic-protection'],
    relatedArticles: ['iso-11171-particle-counting', 'oil-analysis-methods', 'fluid-cleanliness', 'fleet-oil-sampling-protocol'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-NAS-CLEANLINESS-CODE': {
    id: 'TERM-NAS-CLEANLINESS-CODE',
    term: 'NAS 1638 Cleanliness Rating',
    category: 'fluid-cleanliness',
    definition:
      'A fluid cleanliness classification system originally developed by the National Aerospace Standard (NAS 1638), defining 14 classes (0–12) based on particle counts per 100 mL in five size ranges (5–15 µm, 15–25 µm, 25–50 µm, 50–100 µm, >100 µm). Higher NAS class numbers indicate higher contamination. NAS Class 6 is commonly specified for industrial hydraulic systems; Class 4–5 for servo and proportional valve systems. NAS 1638 has been largely superseded by ISO 4406 for new system specifications but remains common in legacy aerospace and military equipment documentation.',
    engineeringContext:
      'NAS 1638 and ISO 4406 are not directly interchangeable — they use different size ranges and counting methods. Approximate correspondence: NAS 5 ≈ ISO 15/13/10; NAS 7 ≈ ISO 17/15/12; NAS 9 ≈ ISO 19/17/14. When converting between systems, use the ISO 11171 counting method (designated as "c") rather than older optical microscopy methods to maintain accuracy.',
    aliases: ['NAS code', 'NAS class', 'NAS contamination class'],
    abbreviations: ['NAS'],
    applicableStandards: ['STD-NAS-1638', 'STD-ISO-4406'],
    relatedTerms: ['TERM-ISO-CLEANLINESS-CODE', 'TERM-PARTICLE-COUNT'],
    relatedTechnologies: ['nanoforce'],
    relatedSystems: ['hydraulic-protection'],
    relatedArticles: ['fluid-cleanliness', 'hydraulic-contamination-sensitivity', 'nfpa-t2-14-hydraulic-cleanliness'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-CONTAMINATION-INGRESSION-RATE': {
    id: 'TERM-CONTAMINATION-INGRESSION-RATE',
    term: 'Contamination Ingression Rate',
    category: 'fluid-cleanliness',
    definition:
      'The rate at which airborne particles, process contaminants, or wear debris enter a fluid system during normal operation, typically expressed as milligrams per hour (mg/h) or particles per hour at a defined size range. Ingression rate determines the steady-state contamination level achievable by a filtration system: a filter system reaches equilibrium when its removal rate equals the ingression rate. High ingression rate environments (dusty construction sites, mining, agriculture) require higher filtration capacity or more frequent service intervals than low ingression environments.',
    engineeringContext:
      'Contamination ingression modelling is used to select filtration systems capable of maintaining target cleanliness codes under actual operating conditions. Key ingression pathways include: cylinder rod seals and breathers (primary for mobile hydraulics), reservoir vent breathers (primary for static systems), and maintenance contamination (tool cleaning, improper oil transfer). Seal integrity and breather filtration selection directly control the ingression rate.',
    aliases: ['ingression rate', 'contamination generation rate', 'particle ingestion rate'],
    abbreviations: ['IR'],
    applicableStandards: [],
    relatedTerms: ['TERM-ISO-CLEANLINESS-CODE', 'TERM-INGRESS-PROTECTION', 'TERM-BYPASS-FILTRATION'],
    relatedTechnologies: ['nanoforce', 'intekcore'],
    relatedSystems: ['hydraulic-protection', 'lubrication-protection'],
    relatedArticles: ['contamination-ingression-modelling', 'particle-ingress-prevention', 'seal-integrity', 'contamination-control'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-TEST-DUST': {
    id: 'TERM-TEST-DUST',
    term: 'ISO 12103-1 Test Dust',
    category: 'fluid-cleanliness',
    definition:
      'Standardised artificial test contaminants defined by ISO 12103-1 for use in filter performance testing. Four grades are specified: A1 Ultrafine (0–80 µm), A2 Fine (0–150 µm, median ~18 µm), A3 Medium (0–280 µm), and A4 Coarse (0–600 µm). The A2 Fine grade is the primary dust used in ISO 16889 multi-pass tests for hydraulic filters and ISO 5011 tests for air filters. All grades are silica-based with defined particle size distributions, ensuring reproducibility across test laboratories worldwide.',
    engineeringContext:
      'The controlled particle size distribution of ISO 12103-1 test dust enables reproducible filter performance tests across different laboratories and manufacturers. Field dust is not used in standardised tests because its composition, shape, and size distribution vary by geography, season, and industrial environment. Test dust results provide a consistent baseline for performance comparison, not a prediction of absolute field service life.',
    aliases: ['ISO test dust', 'ACFTD', 'standardised test contaminant', 'SAE J726 dust'],
    abbreviations: ['A2 Fine', 'ACFTD'],
    applicableStandards: ['STD-ISO-16889', 'STD-ISO-5011', 'STD-SAE-J726'],
    relatedTerms: ['TERM-MULTI-PASS-TEST', 'TERM-GRAVIMETRIC-EFFICIENCY', 'TERM-DUST-HOLDING-CAPACITY'],
    relatedTechnologies: [],
    relatedSystems: [],
    relatedArticles: ['iso-16889-multipass-test', 'iso-5011', 'sae-j726-iso-5011-air-cleaner-test', 'testing-and-validation'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-OIL-CONDITION-MONITORING': {
    id: 'TERM-OIL-CONDITION-MONITORING',
    term: 'Oil Condition Monitoring',
    category: 'fluid-cleanliness',
    definition:
      'The systematic measurement of lubricating or hydraulic oil properties to assess both the condition of the oil itself and the mechanical condition of the lubricated components. Monitoring parameters include: particle count and ISO cleanliness code (contamination level), viscosity, acid number/TAN (oxidation state), base number/TBN (additive depletion), wear metal concentrations by spectrometric oil analysis (iron, copper, lead, chromium, aluminium), water content by Karl Fischer titration, and silicon (indicator of air filter bypass or seal failure). Results guide predictive maintenance decisions on oil change intervals and component inspection.',
    engineeringContext:
      'Oil condition monitoring converts filter service from scheduled replacement to condition-based replacement, extending oil drain intervals by 30–100% in many applications while reducing unexpected failures. Lab oil analysis performed every 250–500 operating hours provides the most complete picture; in-line sensors for particle count and water content enable real-time monitoring without sampling.',
    aliases: ['oil analysis', 'lubricant condition monitoring', 'fluid analysis', 'predictive oil maintenance'],
    abbreviations: ['OCM', 'OA'],
    applicableStandards: ['STD-ISO-4406', 'STD-ISO-11171'],
    relatedTerms: ['TERM-PARTICLE-COUNT', 'TERM-ISO-CLEANLINESS-CODE', 'TERM-TOTAL-ACID-NUMBER', 'TERM-TOTAL-BASE-NUMBER', 'TERM-KARL-FISCHER-TITRATION'],
    relatedTechnologies: ['duratech'],
    relatedSystems: ['lubrication-protection', 'hydraulic-protection'],
    relatedArticles: ['oil-condition-monitoring', 'oil-analysis-methods', 'fleet-oil-sampling-protocol', 'extended-drain-interval-engineering', 'service-intervals'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  // ── AIR INTAKE ────────────────────────────────────────────────────────────────

  'TERM-RESTRICTION': {
    id: 'TERM-RESTRICTION',
    term: 'Restriction',
    category: 'air-intake',
    definition:
      'The pressure drop (ΔP) across an air filter element at a given airflow rate, measured in millibar (mbar) or inches of water column (inH₂O). Restriction increases as the filter element loads with contaminant. Service limits are reached when restriction exceeds the engine manufacturer\'s threshold — typically 25 mbar for naturally aspirated engines and 37.5–62.5 mbar for turbocharged engines. Measured per ISO 5011 and SAE J1539.',
    engineeringContext:
      'Restriction directly reduces engine volumetric efficiency and power output. A 1 mbar increase in intake restriction reduces naturally aspirated engine power by approximately 0.3–0.5%. For turbocharged engines, restriction after the compressor inlet reduces compressor efficiency and increases exhaust back pressure, creating a compounding power loss. Restriction indicators (vacuostatic alerts) signal when service limits are approached.',
    aliases: ['pressure drop', 'ΔP', 'intake restriction', 'air restriction'],
    abbreviations: ['ΔP', 'inH₂O', 'mbar'],
    applicableStandards: ['STD-ISO-5011', 'STD-SAE-J1539'],
    relatedTerms: ['TERM-DUST-HOLDING-CAPACITY', 'TERM-DIFFERENTIAL-PRESSURE', 'TERM-SERVICE-INTERVAL'],
    relatedTechnologies: ['macrocore'],
    relatedSystems: ['air-intake-protection'],
    relatedArticles: ['airflow-engineering', 'air-restriction', 'air-intake-system-design', 'service-intervals', 'iso-5011'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-DUST-HOLDING-CAPACITY': {
    id: 'TERM-DUST-HOLDING-CAPACITY',
    term: 'Dust Holding Capacity',
    category: 'air-intake',
    definition:
      'The total mass of standardised test dust (ISO 12103-1 A2 Fine) that a filter element retains before reaching its defined terminal restriction limit, measured in grams (g) per ISO 5011 test protocol. Higher dust holding capacity at equivalent restriction extends service intervals in the field. Dust holding capacity and initial restriction together determine whether a filter element is suited for high-load dusty environments or light-duty clean-air applications.',
    engineeringContext:
      'Dust holding capacity is the key differentiator between high-performance and commodity air filter elements. An element with twice the dust holding capacity at the same initial restriction doubles the service interval in a given field dust environment, directly reducing maintenance costs and downtime. The progressive density gradient construction is the primary engineering method for maximising dust holding capacity.',
    aliases: ['DHC', 'dirt holding capacity', 'dust capacity', 'filter capacity'],
    abbreviations: ['DHC'],
    applicableStandards: ['STD-ISO-5011', 'STD-SAE-J726'],
    relatedTerms: ['TERM-RESTRICTION', 'TERM-PROGRESSIVE-DENSITY-GRADIENT', 'TERM-TEST-DUST', 'TERM-SERVICE-INTERVAL'],
    relatedTechnologies: ['macrocore'],
    relatedSystems: ['air-intake-protection'],
    relatedArticles: ['dust-holding-capacity', 'airflow-engineering', 'service-intervals', 'iso-5011', 'sae-j726-iso-5011-air-cleaner-test'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-PROGRESSIVE-DENSITY-GRADIENT': {
    id: 'TERM-PROGRESSIVE-DENSITY-GRADIENT',
    term: 'Progressive Density Gradient',
    category: 'air-intake',
    definition:
      'A filter media construction in which fibre packing density increases progressively from the upstream (dirty) face to the downstream (clean) face of the filter element. The outer, lower-density zones capture large particles and act as pre-filters; the inner, higher-density zones capture fine particles at high efficiency. This gradient maximises dust holding capacity while maintaining low initial restriction and high overall filtration efficiency — the opposite of surface filtration, which loads rapidly at a single capture plane.',
    engineeringContext:
      'Progressive density gradient construction is used in MACROCORE primary air filter elements and high-performance hydraulic elements. By distributing particle capture throughout the full depth of the media rather than concentrating it at the surface, dust holding capacity increases by 40–120% compared to single-density media of equivalent thickness, at the same efficiency rating.',
    aliases: ['graded density', 'density gradient media', 'depth gradient construction', 'tapered pore structure'],
    abbreviations: ['PDG'],
    applicableStandards: ['STD-ISO-16889', 'STD-ISO-5011'],
    relatedTerms: ['TERM-DUST-HOLDING-CAPACITY', 'TERM-RESTRICTION', 'TERM-DEPTH-FILTRATION', 'TERM-SURFACE-FILTRATION'],
    relatedTechnologies: ['macrocore', 'syntrax'],
    relatedSystems: ['air-intake-protection', 'lubrication-protection'],
    relatedArticles: ['filter-media-science', 'filter-media-engineering', 'dust-holding-capacity', 'airflow-engineering'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-CYCLONIC-SEPARATION': {
    id: 'TERM-CYCLONIC-SEPARATION',
    term: 'Cyclonic Pre-separation',
    category: 'air-intake',
    definition:
      'A centrifugal pre-cleaning stage integrated upstream of the primary filter element in which incoming air is given rotational motion by fixed vanes or tubes, creating centrifugal force that throws large particles (typically >100 µm) to the outer wall of the separator body. Separated particles are discharged to a dust unloader valve or collection bowl, bypassing the filter element entirely. Pre-separation reduces the dust load on the primary element by 70–95%, significantly extending filter element service life in high-dust environments.',
    engineeringContext:
      'Cyclonic pre-separation is standard practice for mobile equipment operating in mining, agriculture, and construction where airborne dust concentrations are high. The pre-separator must be matched to the engine\'s airflow rate and the primary filter housing design. Undersized pre-separators create restriction without achieving effective separation; oversized units add weight and cost without proportional benefit.',
    aliases: ['pre-cleaner', 'centrifugal pre-separator', 'cyclone separator', 'inertial separator', 'turboseparator'],
    abbreviations: [],
    applicableStandards: ['STD-ISO-5011'],
    relatedTerms: ['TERM-RESTRICTION', 'TERM-DUST-HOLDING-CAPACITY', 'TERM-INGRESS-PROTECTION'],
    relatedTechnologies: ['macrocore'],
    relatedSystems: ['air-intake-protection'],
    relatedArticles: ['air-intake-system-design', 'particle-ingress-prevention', 'airflow-engineering'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-INGRESS-PROTECTION': {
    id: 'TERM-INGRESS-PROTECTION',
    term: 'Ingress Protection',
    category: 'air-intake',
    definition:
      'The degree to which a filter housing, seal, or system component prevents the entry of solid particles and liquids from the environment, classified by IP codes (IEC 60529) or by engineering seal specifications. For air intake systems, ingress protection refers specifically to the sealing integrity between the filter element and housing, preventing unfiltered air from bypassing the filter media. Common failure modes include damaged element gaskets, distorted housing sealing surfaces, improper element installation, and housing damage. Particle bypass due to inadequate sealing can reduce effective filtration efficiency from >99.9% to <80%, even with a new, undamaged filter element.',
    engineeringContext:
      'Seal integrity inspection is the most frequently overlooked element of air filtration maintenance. Studies show that dust ingress from seal bypass contributes to engine wear in a significant proportion of field failures attributed to "filter bypass". For hydraulic breathers and reservoirs, IP-rated vent breathers prevent ambient dust from entering through the reservoir during oil level changes.',
    aliases: ['seal integrity', 'bypass prevention', 'IP rating', 'dust seal'],
    abbreviations: ['IP'],
    applicableStandards: ['STD-ISO-5011'],
    relatedTerms: ['TERM-RESTRICTION', 'TERM-CONTAMINATION-INGRESSION-RATE', 'TERM-SILICA'],
    relatedTechnologies: ['macrocore', 'intekcore'],
    relatedSystems: ['air-intake-protection', 'hydraulic-protection'],
    relatedArticles: ['seal-integrity', 'particle-ingress-prevention', 'air-intake-system-design', 'filter-housing-system-integration'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-SERVICE-INTERVAL': {
    id: 'TERM-SERVICE-INTERVAL',
    term: 'Service Interval',
    category: 'air-intake',
    definition:
      'The period (measured in operating hours, kilometres, or calendar time) between filter element replacement or service actions. Service intervals are determined by either time-based schedules (fixed hour intervals) or condition-based triggers (restriction indicator activation for air filters; differential pressure threshold for fluid filters; oil analysis results for lube systems). Condition-based intervals are more economical and reliable because they respond to actual contamination accumulation rather than assumptions about average operating conditions.',
    engineeringContext:
      'Over-extending service intervals is the leading cause of filter-related equipment failures. Under-servicing increases operating costs and generates unnecessary waste. Condition-based monitoring enables service intervals to be extended by 30–200% versus fixed schedules in clean environments, while ensuring early service in high-contamination conditions.',
    aliases: ['maintenance interval', 'filter change interval', 'oil drain interval', 'replacement interval'],
    abbreviations: [],
    applicableStandards: [],
    relatedTerms: ['TERM-DIFFERENTIAL-PRESSURE', 'TERM-RESTRICTION', 'TERM-DUST-HOLDING-CAPACITY', 'TERM-OIL-CONDITION-MONITORING'],
    relatedTechnologies: ['macrocore', 'duratech'],
    relatedSystems: ['air-intake-protection', 'lubrication-protection', 'hydraulic-protection'],
    relatedArticles: ['service-intervals', 'extended-drain-interval-engineering', 'total-cost-of-ownership', 'oil-condition-monitoring'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  // ── CONTAMINATION MECHANISMS ──────────────────────────────────────────────────

  'TERM-ABRASIVE-WEAR': {
    id: 'TERM-ABRASIVE-WEAR',
    term: 'Abrasive Wear',
    category: 'contamination',
    definition:
      'The removal of material from a surface by the cutting or scratching action of hard particles moving relative to that surface. In lubrication and hydraulic systems, abrasive wear occurs when hard particles (silica, iron oxides, wear metals) present in the fluid become trapped between moving surfaces — bearing journals and housings, piston rings and cylinder walls, gear tooth flanks — causing micro-cutting and surface fatigue. Abrasive wear rate is a strong function of particle hardness (relative to the substrate), particle concentration, particle size, and contact stress. Particles in the 2–15 µm range cause maximum abrasive wear because they can enter bearing clearances and load-bearing asperities.',
    engineeringContext:
      'Abrasive wear is the dominant failure mode in contaminated hydraulic and lubrication systems. A 10× increase in particle concentration accelerates bearing wear by approximately 4–7×. Maintaining ISO 16/14/11 or tighter in lube systems extends bearing life from a typical contamination-limited 3,000–5,000 hours to 15,000–25,000 hours under controlled conditions.',
    aliases: ['erosive wear', 'three-body abrasion', 'two-body abrasion', 'particle erosion'],
    abbreviations: [],
    applicableStandards: ['STD-ISO-4406', 'STD-ISO-16889'],
    relatedTerms: ['TERM-BEARING-CLEARANCE', 'TERM-ISO-CLEANLINESS-CODE', 'TERM-SILICA', 'TERM-ADHESIVE-WEAR'],
    relatedTechnologies: ['syntrax', 'nanoforce', 'macrocore'],
    relatedSystems: ['lubrication-protection', 'hydraulic-protection', 'air-intake-protection'],
    relatedArticles: ['contamination-control', 'failure-analysis', 'contamination-sensitivity-components', 'lubrication-system-filtration', 'hydraulic-contamination-sensitivity'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-ADHESIVE-WEAR': {
    id: 'TERM-ADHESIVE-WEAR',
    term: 'Adhesive Wear',
    category: 'contamination',
    definition:
      'Wear caused by the transfer of material from one surface to another when two surfaces in contact undergo relative motion. Under high contact stress and inadequate lubricant film thickness, metal-to-metal asperity contact occurs. Surface asperities weld momentarily and shear, transferring metal fragments from one surface to the other. These transferred fragments become abrasive particles in the lubricant, creating a secondary abrasive wear mode. Adhesive wear is accelerated by contaminated oil, incorrect oil viscosity, high temperature, and overloaded components.',
    engineeringContext:
      'Adhesive wear is characteristic of lubrication starvation and occurs when lubricant film thickness falls below the combined roughness of opposing surfaces. The wear products from adhesive wear (iron and other metal particles) are typically 1–10 µm and contribute to rapidly increasing oil contamination levels, which in turn accelerate abrasive wear — a self-reinforcing degradation cycle that can lead to rapid bearing seizure.',
    aliases: ['scuffing', 'galling', 'scoring', 'smearing'],
    abbreviations: [],
    applicableStandards: [],
    relatedTerms: ['TERM-ABRASIVE-WEAR', 'TERM-BEARING-CLEARANCE', 'TERM-VISCOSITY'],
    relatedTechnologies: ['syntrax'],
    relatedSystems: ['lubrication-protection'],
    relatedArticles: ['failure-analysis', 'lubrication-system-filtration', 'contamination-sensitivity-components'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-SILICA': {
    id: 'TERM-SILICA',
    term: 'Silica',
    category: 'contamination',
    definition:
      'Silicon dioxide (SiO₂), the primary mineral component of soil, sand, and airborne dust, with a Mohs hardness of 7 — harder than most bearing and engine component materials including steel (5–6.5). Silica is the most damaging contaminant in air intake, lubrication, and hydraulic systems because its hardness enables it to cut and abrade metal surfaces even at low concentrations. A single milligram of silica dust entering an engine represents millions of individual abrasive particles capable of causing measurable bearing wear.',
    engineeringContext:
      'Silica ingestion via the air intake system is the leading cause of accelerated engine wear in mobile equipment operating in dusty environments. Silicon content in lube oil, measured by ICP spectrometry, is a key oil analysis marker — elevated silicon indicates air filter bypass or seal failure. In construction and mining environments, airborne silica concentrations can reach 100–1,000 mg/m³, requiring high-efficiency pre-separation and primary filtration.',
    aliases: ['silicon dioxide', 'SiO₂', 'quartz dust', 'airborne silicon'],
    abbreviations: ['SiO₂'],
    applicableStandards: [],
    relatedTerms: ['TERM-ABRASIVE-WEAR', 'TERM-INGRESS-PROTECTION', 'TERM-RESTRICTION'],
    relatedTechnologies: ['macrocore'],
    relatedSystems: ['air-intake-protection'],
    relatedArticles: ['filter-media-science', 'particle-ingress-prevention', 'airflow-engineering', 'contamination-control'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-AERATION': {
    id: 'TERM-AERATION',
    term: 'Aeration',
    category: 'contamination',
    definition:
      'The entrainment of free air or non-condensable gases into hydraulic or lubrication fluid, resulting in a compressible, foamy fluid mixture. Aeration occurs when fluid is exposed to air above its saturation point — typically through turbulent flow, vortex formation at suction inlets, low reservoir fluid levels, or leaking suction line connections. Aerated fluid compresses under pressure, causing spongy actuator response, increased noise (cavitation-like), elevated fluid temperatures due to adiabatic compression of air bubbles, and accelerated oil oxidation. Aeration is distinct from dissolved air — dissolved air remains in solution and does not compress under operating pressures.',
    engineeringContext:
      'Aeration is controlled through hydraulic reservoir design: adequate fluid volume (minimum 3–5× pump flow rate per minute), return line submerged below the fluid surface, adequate settling time and baffles to allow entrained air to escape before fluid is recirculated through the pump. Foam-inhibiting oil additives reduce surface tension but do not address the root cause of air entrainment.',
    aliases: ['air entrainment', 'foaming', 'aerated oil', 'entrained air'],
    abbreviations: [],
    applicableStandards: [],
    relatedTerms: ['TERM-CAVITATION', 'TERM-VARNISH'],
    relatedTechnologies: [],
    relatedSystems: ['hydraulic-protection', 'lubrication-protection'],
    relatedArticles: ['hydraulic-reservoir-design', 'failure-analysis', 'hydraulic-power-unit-design'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-PARTICLE-SIZE-DISTRIBUTION': {
    id: 'TERM-PARTICLE-SIZE-DISTRIBUTION',
    term: 'Particle Size Distribution',
    category: 'contamination',
    definition:
      'The statistical description of the range of particle sizes present in a fluid or airborne contaminant sample, typically expressed as a cumulative count or mass percentage at specified size thresholds. Particle size distribution is measured by laser particle counting (ISO 11171) for fluid contamination and by laser diffraction or sieve analysis for airborne dust characterisation. The distribution determines which particle sizes dominate wear mechanisms and which filter rating is required to control the most damaging fraction.',
    engineeringContext:
      'In hydraulic systems, particles in the 2–15 µm range cause maximum abrasive damage because they match typical bearing and valve clearances (1–25 µm). Particles below 1 µm contribute minimally to abrasive wear and are not captured by standard laser particle counters. Particles above 50 µm are rapidly removed by sediment and are easily caught by coarse filtration. Filter specification must target the critical 2–15 µm range.',
    aliases: ['PSD', 'particle distribution', 'particle size spectrum'],
    abbreviations: ['PSD'],
    applicableStandards: ['STD-ISO-11171', 'STD-ISO-4406'],
    relatedTerms: ['TERM-PARTICLE-COUNT', 'TERM-ABRASIVE-WEAR', 'TERM-ISO-CLEANLINESS-CODE'],
    relatedTechnologies: [],
    relatedSystems: [],
    relatedArticles: ['iso-11171-particle-counting', 'contamination-control', 'filter-media-engineering'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  // ── HYDRAULIC SYSTEMS ─────────────────────────────────────────────────────────

  'TERM-SERVO-VALVE': {
    id: 'TERM-SERVO-VALVE',
    term: 'Servo Valve',
    category: 'hydraulic-systems',
    definition:
      'A high-precision hydraulic control valve that modulates hydraulic flow proportionally to an electrical input signal. Servo valves operate with internal clearances of 1–5 µm between spool and bore. Particle contamination above 3–5 µm in hydraulic fluid causes stiction, scoring of spool surfaces, and flow control degradation. ISO 16/14/11 or tighter cleanliness codes are required to protect servo valve performance and lifespan. Servo valves are used in precision motion control applications including aircraft hydraulics, CNC machine tools, and high-performance industrial systems.',
    engineeringContext:
      'Servo valves are the most contamination-sensitive components in any hydraulic circuit. A single particle larger than the spool-bore clearance can cause jamming. Hydraulic systems incorporating servo valves require offline kidney-loop filtration to maintain cleanliness codes continuously, not only during operation but during shutdown periods when thermal convection can redistribute settled particles.',
    aliases: ['electrohydraulic servo valve', 'EHSV', 'proportional valve'],
    abbreviations: ['EHSV', 'SV'],
    applicableStandards: ['STD-ISO-16889', 'STD-ISO-4406', 'STD-NFPA-T2-14'],
    relatedTerms: ['TERM-ISO-CLEANLINESS-CODE', 'TERM-PROPORTIONAL-VALVE', 'TERM-BYPASS-FILTRATION'],
    relatedTechnologies: ['nanoforce'],
    relatedSystems: ['hydraulic-protection'],
    relatedArticles: ['hydraulic-contamination-sensitivity', 'contamination-sensitivity-components', 'hydraulic-power-unit-design', 'nfpa-t2-14-hydraulic-cleanliness'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-PROPORTIONAL-VALVE': {
    id: 'TERM-PROPORTIONAL-VALVE',
    term: 'Proportional Valve',
    category: 'hydraulic-systems',
    definition:
      'A hydraulic directional control valve that modulates flow and pressure proportionally to an electrical input signal using a solenoid-actuated spool. Proportional valves operate with internal spool-bore clearances of 5–25 µm — larger than servo valves but still highly sensitive to particle contamination above 10–15 µm. Target cleanliness codes for proportional valve circuits are typically ISO 17/15/12 to 16/14/11. Proportional valves are widely used in mobile hydraulics for boom, arm, and bucket control on excavators, and in industrial presses for force and position control.',
    engineeringContext:
      'Contamination-induced stiction in proportional valves causes control instability, poor positioning accuracy, and premature spool and bore wear. Unlike servo valves, proportional valves can typically tolerate small, non-cutting contamination events without catastrophic failure, but repeated contamination events progressively degrade metering performance. The valve manufacturer\'s cleanliness specification must be verified against the system\'s achievable and maintained cleanliness target.',
    aliases: ['proportional directional control valve', 'PDCV', 'electrohydraulic proportional valve'],
    abbreviations: ['PDCV', 'PV'],
    applicableStandards: ['STD-ISO-16889', 'STD-ISO-4406', 'STD-NFPA-T2-14'],
    relatedTerms: ['TERM-SERVO-VALVE', 'TERM-ISO-CLEANLINESS-CODE', 'TERM-BYPASS-FILTRATION'],
    relatedTechnologies: ['nanoforce'],
    relatedSystems: ['hydraulic-protection'],
    relatedArticles: ['hydraulic-contamination-sensitivity', 'nfpa-t2-14-hydraulic-cleanliness', 'contamination-sensitivity-components'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-CAVITATION': {
    id: 'TERM-CAVITATION',
    term: 'Cavitation',
    category: 'hydraulic-systems',
    definition:
      'The formation and violent collapse of vapour-filled cavities (bubbles) in a hydraulic fluid when local pressure drops below the fluid\'s vapour pressure. Cavitation occurs primarily at hydraulic pump inlets (suction cavitation) where excessive restriction — caused by a partially closed inlet valve, undersized inlet line, plugged suction strainer, or excessively cold viscous oil — reduces inlet pressure below the vapour pressure threshold. Bubble collapse generates intense local pressure spikes (up to several thousand bar) that erode pump and valve component surfaces, produce high-frequency noise, and generate metallic wear particles that contaminate the fluid.',
    engineeringContext:
      'Cavitation is a pump-destructive phenomenon that develops rapidly once it begins. Indicators include high-frequency whining or rattling noise from the pump, discoloured pump components, and rapidly increasing metal particle counts in oil samples. Prevention centres on ensuring adequate inlet line sizing, maintaining oil level, using correct oil viscosity grade for ambient temperature, and keeping suction strainers clean. Suction strainers should not exceed 120 µm mesh to protect pumps while maintaining free flow.',
    aliases: ['suction cavitation', 'vapour cavitation', 'pump cavitation'],
    abbreviations: [],
    applicableStandards: [],
    relatedTerms: ['TERM-AERATION', 'TERM-DIFFERENTIAL-PRESSURE', 'TERM-VISCOSITY'],
    relatedTechnologies: ['nanoforce'],
    relatedSystems: ['hydraulic-protection'],
    relatedArticles: ['hydraulic-power-unit-design', 'hydraulic-reservoir-design', 'failure-analysis', 'hydraulic-contamination-sensitivity'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-BYPASS-FILTRATION': {
    id: 'TERM-BYPASS-FILTRATION',
    term: 'Bypass Filtration',
    category: 'hydraulic-systems',
    definition:
      'A supplementary filtration circuit in which a portion of the total system flow (typically 5–20%) is diverted from the main circuit through a high-efficiency fine filter and returned to the reservoir, operating in parallel with the full-flow filter system. Also called kidney-loop or off-line filtration. Bypass filters operate at low flow and low differential pressure, enabling very fine filtration (β₃(c) ≥ 1,000 or finer) without the flow restrictions that would impair normal circuit operation. Over time, bypass filtration progressively polishes the total fluid volume to the target cleanliness code, even removing particles smaller than the full-flow filter\'s rating.',
    engineeringContext:
      'Kidney-loop bypass filtration is the primary means of achieving and maintaining ISO 15/13/10 or tighter cleanliness codes in servo and proportional valve systems. A dedicated bypass filtration unit with a 3 µm absolute filter can reach ISO 16/14/11 in a contaminated system within 2–4 hours of continuous operation. Bypass filters should run continuously — not only when contamination alarms activate.',
    aliases: ['kidney-loop filtration', 'off-line filtration', 'supplementary filtration', 'polishing filter'],
    abbreviations: [],
    applicableStandards: ['STD-ISO-16889', 'STD-NFPA-T2-14'],
    relatedTerms: ['TERM-FULL-FLOW-FILTRATION', 'TERM-ISO-CLEANLINESS-CODE', 'TERM-SERVO-VALVE', 'TERM-BETA-RATIO'],
    relatedTechnologies: ['nanoforce', 'intekcore'],
    relatedSystems: ['hydraulic-protection'],
    relatedArticles: ['hydraulic-system-flushing', 'hydraulic-power-unit-design', 'nfpa-t2-14-hydraulic-cleanliness', 'fluid-cleanliness'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-FULL-FLOW-FILTRATION': {
    id: 'TERM-FULL-FLOW-FILTRATION',
    term: 'Full-Flow Filtration',
    category: 'hydraulic-systems',
    definition:
      'A filtration arrangement in which the entire pump output passes through the filter element before reaching downstream components, ensuring all fluid is filtered on every pass. Full-flow filters are positioned in pressure, return, or case drain lines depending on system design. Pressure-line full-flow filters must withstand full system pressure and shock loads; return-line filters operate at near-reservoir pressure but handle the full flow rate including cylinder-regeneration flows. Full-flow filtration provides the primary contamination barrier for protecting all downstream components.',
    engineeringContext:
      'Full-flow filtration rating must balance particle capture efficiency against flow capacity and differential pressure impact. An element that is too fine for the full flow rate will reach its service pressure differential rapidly, causing frequent bypass valve opening and degraded filtration. Full-flow and bypass filtration are complementary: full-flow handles the bulk of contamination at moderate efficiency; bypass polishing achieves the target cleanliness code.',
    aliases: ['pressure-line filter', 'return-line filter', 'main line filter', 'in-line filter'],
    abbreviations: [],
    applicableStandards: ['STD-ISO-16889'],
    relatedTerms: ['TERM-BYPASS-FILTRATION', 'TERM-FILTER-BYPASS-VALVE', 'TERM-DIFFERENTIAL-PRESSURE'],
    relatedTechnologies: ['nanoforce', 'syntrax', 'intekcore'],
    relatedSystems: ['hydraulic-protection', 'lubrication-protection'],
    relatedArticles: ['hydraulic-power-unit-design', 'filter-housing-design', 'lubrication-system-filtration'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  // ── LUBRICATION ───────────────────────────────────────────────────────────────

  'TERM-BEARING-CLEARANCE': {
    id: 'TERM-BEARING-CLEARANCE',
    term: 'Bearing Clearance',
    category: 'lubrication',
    definition:
      'The designed radial gap between a rotating journal and its bearing surface, typically between 1–100 µm depending on shaft diameter and bearing type. The clearance determines the minimum hydrodynamic oil film thickness required to prevent metal-to-metal contact at operating speed and load. Particles larger than approximately half the bearing clearance can contact both bearing surfaces simultaneously (three-body abrasion), causing accelerated wear and loss of clearance. Worn clearances increase lube oil consumption, reduce oil pressure, and accelerate further wear.',
    engineeringContext:
      'Bearing clearances in high-speed engines (crankshaft main bearings, connecting rod bearings) typically range from 25–75 µm. Particle sizes in the 12–37 µm range are therefore the most damaging for these components, correlating with the ISO 16889 β₁₄(c) rating specification for lube filters. ISO cleanliness codes are calibrated to the most critical clearances in each system type.',
    aliases: ['journal clearance', 'running clearance', 'oil film clearance'],
    abbreviations: [],
    applicableStandards: ['STD-ISO-4406'],
    relatedTerms: ['TERM-ABRASIVE-WEAR', 'TERM-VISCOSITY', 'TERM-ISO-CLEANLINESS-CODE'],
    relatedTechnologies: ['syntrax'],
    relatedSystems: ['lubrication-protection'],
    relatedArticles: ['lubrication-system-filtration', 'contamination-sensitivity-components', 'failure-analysis', 'iso-4406'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-VISCOSITY': {
    id: 'TERM-VISCOSITY',
    term: 'Oil Viscosity',
    category: 'lubrication',
    definition:
      'A measure of a fluid\'s resistance to flow, expressed as kinematic viscosity in centistokes (cSt) at a defined temperature, or as dynamic (absolute) viscosity in centipoise (cP). Engine and hydraulic oils are classified by SAE J300 (engine) or ISO VG (hydraulic) viscosity grades. Viscosity is the most critical physical property of a lubricant: too low and the oil film cannot support the bearing load (leading to metal contact and wear); too high and the oil creates excessive churning losses, heat generation, and pump cavitation at cold start. Viscosity decreases with temperature and increases with pressure.',
    engineeringContext:
      'Oil viscosity must remain within specification throughout the service interval. Excessive fuel dilution, thermal degradation, contamination by different viscosity-grade oil, and shear loss from high mechanical stress all reduce viscosity in service. Oxidation and soot loading increase viscosity. Oil analysis viscosity measurement (at 40°C and 100°C) detects both modes and is a primary condition monitoring trigger for oil change decisions.',
    aliases: ['kinematic viscosity', 'oil grade', 'SAE grade', 'ISO VG'],
    abbreviations: ['cSt', 'cP'],
    applicableStandards: [],
    relatedTerms: ['TERM-VISCOSITY-INDEX', 'TERM-TOTAL-BASE-NUMBER', 'TERM-OIL-CONDITION-MONITORING'],
    relatedTechnologies: ['syntrax'],
    relatedSystems: ['lubrication-protection'],
    relatedArticles: ['sae-j300-viscosity-classification', 'lubrication-system-filtration', 'oil-condition-monitoring'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-VISCOSITY-INDEX': {
    id: 'TERM-VISCOSITY-INDEX',
    term: 'Viscosity Index',
    category: 'lubrication',
    definition:
      'A dimensionless number that expresses the rate of change of oil viscosity with temperature. Higher viscosity index (VI) means the oil maintains more consistent viscosity across a wider temperature range. Mineral oils typically have VI of 90–110; conventional hydraulic fluids 95–105; VI-improved engine oils 140–175; synthetic fluids 150–200+. Low viscosity index oils become very thin at high temperatures (risking inadequate film thickness) and very thick at low temperatures (risking cold-start pump cavitation and excessive restriction).',
    engineeringContext:
      'Viscosity index is critical for mobile equipment operating across wide ambient temperature ranges. A hydraulic excavator operating from −20°C winter to +40°C summer ambient requires a hydraulic fluid with VI ≥ 160 to maintain acceptable pump inlet viscosity at cold start while avoiding excessive thinning at peak operating temperature. Synthetic base oils inherently deliver higher VI than mineral oils.',
    aliases: ['VI', 'viscosity-temperature behaviour'],
    abbreviations: ['VI'],
    applicableStandards: [],
    relatedTerms: ['TERM-VISCOSITY', 'TERM-THERMAL-DEGRADATION'],
    relatedTechnologies: [],
    relatedSystems: ['lubrication-protection', 'hydraulic-protection'],
    relatedArticles: ['sae-j300-viscosity-classification', 'lubrication-system-filtration'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-TOTAL-BASE-NUMBER': {
    id: 'TERM-TOTAL-BASE-NUMBER',
    term: 'Total Base Number',
    category: 'lubrication',
    definition:
      'A measure of an oil\'s reserve alkalinity — its capacity to neutralise acids formed by combustion blow-by gases and oil oxidation products. Expressed in milligrams of potassium hydroxide per gram of oil (mg KOH/g). Fresh engine oil typically has TBN of 8–14 mg KOH/g. Acidic products (sulfuric acid from combustion of sulfur-containing fuels, carboxylic acids from oil oxidation) are neutralised by alkaline additives (calcium and magnesium detergents). Oil change is indicated when TBN falls to approximately 2 mg KOH/g, below which corrosion of bearing surfaces by unchecked acid products accelerates.',
    engineeringContext:
      'TBN monitoring via oil analysis is the definitive method for determining engine lube oil condition-based drain intervals. An oil maintaining high TBN is not depleted regardless of calendar time; an oil with low TBN is depleted regardless of hours. Fuel sulfur content strongly determines TBN depletion rate — high-sulfur fuels require more alkaline reserve or shorter drain intervals.',
    aliases: ['TBN', 'base number', 'alkalinity reserve', 'reserve alkalinity'],
    abbreviations: ['TBN', 'BN'],
    applicableStandards: [],
    relatedTerms: ['TERM-TOTAL-ACID-NUMBER', 'TERM-OIL-CONDITION-MONITORING', 'TERM-OXIDATIVE-DEGRADATION'],
    relatedTechnologies: ['duratech'],
    relatedSystems: ['lubrication-protection'],
    relatedArticles: ['oil-condition-monitoring', 'oil-analysis-methods', 'extended-drain-interval-engineering', 'fleet-oil-sampling-protocol'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  // ── CHEMICAL DEGRADATION ──────────────────────────────────────────────────────

  'TERM-VARNISH': {
    id: 'TERM-VARNISH',
    term: 'Varnish',
    category: 'chemical-degradation',
    definition:
      'An insoluble, soft to hard deposit formed on hydraulic and lubrication system surfaces when oil degradation products — oxidation byproducts, thermal breakdown products, and dissolved metals — precipitate out of solution. Varnish deposits appear as thin, lacquer-like films (0.1–5 µm thick) on valve spools, pump components, and heat exchanger surfaces. Varnish formation is accelerated by high temperatures (>80°C), aeration, and extended oil service intervals. It increases valve stiction, reduces heat transfer efficiency, and is a principal cause of proportional valve failure.',
    engineeringContext:
      'Varnish deposits are not removed by oil changes because they adhere to metal surfaces and are insoluble in fresh oil. Electrostatic precipitation filtration and chemical oil flushing treatments can remove deposited varnish from system surfaces. Prevention through oil temperature control (below 80°C), regular oil analysis, and timely oil changes before advanced oxidation occurs is more economical than remediation.',
    aliases: ['lacquer deposits', 'oil varnish', 'sludge precursors', 'soft contaminants'],
    abbreviations: [],
    applicableStandards: [],
    relatedTerms: ['TERM-SERVO-VALVE', 'TERM-OXIDATIVE-DEGRADATION', 'TERM-THERMAL-DEGRADATION', 'TERM-AERATION'],
    relatedTechnologies: [],
    relatedSystems: ['lubrication-protection', 'hydraulic-protection'],
    relatedArticles: ['varnish-formation-lube-systems', 'failure-analysis', 'hydraulic-contamination-sensitivity'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-OXIDATIVE-DEGRADATION': {
    id: 'TERM-OXIDATIVE-DEGRADATION',
    term: 'Oxidative Degradation',
    category: 'chemical-degradation',
    definition:
      'The chemical breakdown of lubricating or hydraulic oil through reaction with dissolved oxygen, generating oxidation byproducts including organic acids, aldehydes, ketones, and high-molecular-weight polymers (sludge precursors). Oxidation rate doubles for approximately every 10°C rise in oil temperature above 60°C (the Arrhenius rule for lubricant oxidation). Oxidation products increase oil viscosity and TAN, decrease TBN, reduce antioxidant additive content, and generate insoluble varnish deposits. Contamination by water and metallic catalysts (copper, iron) accelerates oxidation significantly.',
    engineeringContext:
      'Oxidative degradation sets the fundamental limit on lubricant service life. All oil condition monitoring parameters — viscosity increase, TAN rise, TBN depletion, antioxidant depletion, and varnish potential — are direct indicators of oxidation progress. Oil temperature control below 80°C is the single most effective means of extending oil service life.',
    aliases: ['oil oxidation', 'lubricant degradation', 'oil aging', 'thermal oxidation'],
    abbreviations: [],
    applicableStandards: [],
    relatedTerms: ['TERM-VARNISH', 'TERM-TOTAL-ACID-NUMBER', 'TERM-TOTAL-BASE-NUMBER', 'TERM-THERMAL-DEGRADATION'],
    relatedTechnologies: ['duratech'],
    relatedSystems: ['lubrication-protection', 'hydraulic-protection'],
    relatedArticles: ['varnish-formation-lube-systems', 'oil-condition-monitoring', 'extended-drain-interval-engineering'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-THERMAL-DEGRADATION': {
    id: 'TERM-THERMAL-DEGRADATION',
    term: 'Thermal Degradation',
    category: 'chemical-degradation',
    definition:
      'The breakdown of lubricant or hydraulic fluid molecules at elevated temperatures through cracking, polymerisation, and volatilisation, independent of oxygen availability. Thermal degradation produces low-molecular-weight volatile compounds (flash point reduction), insoluble carbonaceous deposits (carbon black and coke), and very high-molecular-weight polymers (lacquer and varnish). It occurs at localised hot spots such as pump discharge zones, hydraulic actuator rod seals, and turbocharger bearing housings where temperatures can transiently exceed 200–300°C.',
    engineeringContext:
      'Thermal degradation is distinct from oxidative degradation because it can proceed without oxygen — it occurs in fully sealed hydraulic systems at high local temperatures even when bulk oil temperature is within specification. Synthetic base oils (PAO, ester) withstand higher temperatures before thermal cracking than mineral oils, making them superior for high-temperature service such as turbocharger oil supply circuits.',
    aliases: ['thermal cracking', 'pyrolytic degradation', 'thermal breakdown'],
    abbreviations: [],
    applicableStandards: [],
    relatedTerms: ['TERM-OXIDATIVE-DEGRADATION', 'TERM-VARNISH', 'TERM-VISCOSITY'],
    relatedTechnologies: [],
    relatedSystems: ['lubrication-protection'],
    relatedArticles: ['varnish-formation-lube-systems', 'lubrication-system-filtration'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-TOTAL-ACID-NUMBER': {
    id: 'TERM-TOTAL-ACID-NUMBER',
    term: 'Total Acid Number',
    category: 'chemical-degradation',
    definition:
      'A measure of the total acidity in a lubricating or hydraulic oil, expressed in milligrams of potassium hydroxide required to neutralise all acidic components in one gram of oil (mg KOH/g). TAN includes both strong inorganic acids (products of sulfur combustion) and weak organic acids (oxidation byproducts). Rising TAN during service indicates oil oxidation and additive depletion. For hydraulic fluids, a TAN increase of more than 0.5–1.0 mg KOH/g above the fresh oil baseline indicates significant degradation and typically triggers oil replacement.',
    engineeringContext:
      'TAN is used primarily for hydraulic oil condition assessment and fire-resistant fluid monitoring. For engine oils, TBN is the primary indicator because combustion-derived acids dominate. High TAN values indicate risk of corrosive attack on zinc, copper, and lead bearing overlays. TAN is measured by ASTM D664 potentiometric titration.',
    aliases: ['TAN', 'acid number', 'AN', 'acidity'],
    abbreviations: ['TAN', 'AN'],
    applicableStandards: [],
    relatedTerms: ['TERM-TOTAL-BASE-NUMBER', 'TERM-OXIDATIVE-DEGRADATION', 'TERM-OIL-CONDITION-MONITORING'],
    relatedTechnologies: [],
    relatedSystems: ['lubrication-protection', 'hydraulic-protection'],
    relatedArticles: ['oil-analysis-methods', 'oil-condition-monitoring', 'extended-drain-interval-engineering'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-SOOT': {
    id: 'TERM-SOOT',
    term: 'Soot',
    category: 'chemical-degradation',
    definition:
      'Carbonaceous combustion byproduct particles (typically 10–100 nm primary diameter, agglomerating to 0.1–10 µm) that enter engine lube oil via blow-by gases passing the piston ring assembly. Soot concentrations in used diesel engine oil typically range from 0.5–5% by weight. High soot loading increases oil viscosity (at concentrations above ~3%), promotes oxidative reactions, and can overload the dispersant additive package causing soot agglomeration and abrasive deposit formation on engine surfaces. Soot is detected in oil analysis by elemental carbon measurement or viscosity trend monitoring.',
    engineeringContext:
      'Modern Euro 5/6 and Tier 4 Final diesel engines generate significantly less blow-by and soot than older designs due to tighter piston ring tolerances and higher combustion efficiency. However, EGR (Exhaust Gas Recirculation) systems introduce soot-laden exhaust gases into the intake, increasing crankcase soot load in some engine configurations. High-soot environments require enhanced dispersant packages in engine oil.',
    aliases: ['carbon soot', 'combustion soot', 'blow-by soot', 'diesel soot'],
    abbreviations: [],
    applicableStandards: [],
    relatedTerms: ['TERM-OXIDATIVE-DEGRADATION', 'TERM-TOTAL-BASE-NUMBER', 'TERM-OIL-CONDITION-MONITORING'],
    relatedTechnologies: ['syntrax'],
    relatedSystems: ['lubrication-protection'],
    relatedArticles: ['crankcase-ventilation-filtration', 'lubrication-system-filtration', 'oil-condition-monitoring'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  // ── WATER & FUEL ──────────────────────────────────────────────────────────────

  'TERM-WATER-INGRESS': {
    id: 'TERM-WATER-INGRESS',
    term: 'Water Ingress',
    category: 'water-fuel',
    definition:
      'The entry of free water or emulsified water into a fuel, hydraulic, or lubrication system. Water ingress occurs through condensation in vented reservoirs, breather contamination, seal degradation, heat exchanger failure, and improper maintenance procedures. Water concentrations above 200 ppm in hydraulic fluid cause cavitation, accelerate bearing corrosion, reduce film strength, and enable microbial growth. In diesel fuel, water above 200 ppm causes injector stiction, corrosion, and microbial contamination. Measured by Karl Fischer titration per ASTM D6304 or ISO 12937.',
    engineeringContext:
      'Water is the most damaging non-particulate contaminant in hydraulic and fuel systems. As little as 0.1% free water reduces bearing fatigue life by 90% in rolling element bearings due to hydrogen embrittlement of bearing steel at asperity contacts. Reservoir breathers with desiccant or membrane barriers prevent condensation-driven water ingress in static systems. Coalescing water-separation filters are the primary active removal method.',
    aliases: ['water contamination', 'free water', 'dissolved water', 'emulsified water', 'moisture ingress'],
    abbreviations: [],
    applicableStandards: ['STD-ASTM-D6304', 'STD-ISO-12937'],
    relatedTerms: ['TERM-KARL-FISCHER-TITRATION', 'TERM-COALESCING', 'TERM-MICROBIAL-CONTAMINATION'],
    relatedTechnologies: ['hydrocore', 'syntepore'],
    relatedSystems: ['fuel-cleanliness-protection', 'hydraulic-protection', 'lubrication-protection'],
    relatedArticles: ['water-contamination-fuel', 'diesel-fuel-filtration', 'marine-diesel-filtration'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-KARL-FISCHER-TITRATION': {
    id: 'TERM-KARL-FISCHER-TITRATION',
    term: 'Karl Fischer Titration',
    category: 'water-fuel',
    definition:
      'A precise electrochemical analysis technique for determining water content in oils, fuels, and other non-aqueous liquids, based on the selective reaction of iodine with water in the presence of sulfur dioxide, an alcohol, and a base. Results are expressed in parts per million (ppm) by weight (mg water/kg oil) or as a weight percentage. Karl Fischer titration quantifies total water — dissolved, emulsified, and free — in a single measurement. It is the primary method specified in ASTM D6304 for hydraulic fluids and ISO 12937 for petroleum products.',
    engineeringContext:
      'Karl Fischer titration is the reference laboratory method for water content determination, providing accuracy to ±5 ppm. For field use, portable water activity sensors (measuring water activity aᵥ from 0–1.0) provide real-time monitoring without requiring sample preparation. Water activity above 0.6 in hydraulic fluid and above 0.7 in lube oil indicates free water formation risk and requires immediate action.',
    aliases: ['KF titration', 'Karl Fischer', 'water content analysis', 'coulometric titration'],
    abbreviations: ['KF', 'KFT'],
    applicableStandards: ['STD-ASTM-D6304', 'STD-ISO-12937'],
    relatedTerms: ['TERM-WATER-INGRESS', 'TERM-OIL-CONDITION-MONITORING'],
    relatedTechnologies: [],
    relatedSystems: ['fuel-cleanliness-protection', 'hydraulic-protection'],
    relatedArticles: ['water-contamination-fuel', 'oil-analysis-methods', 'fleet-oil-sampling-protocol'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-HPCR': {
    id: 'TERM-HPCR',
    term: 'High-Pressure Common Rail',
    category: 'water-fuel',
    definition:
      'A diesel fuel injection system in which fuel is pressurised to 1,400–2,500 bar in a common accumulator rail and distributed to individual solenoid or piezo-actuated injectors that fire multiple times per combustion cycle. HPCR injectors have plunger-barrel clearances of 1–3 µm and injection orifice diameters of 80–200 µm, making them the most contamination-sensitive components in modern diesel engines. ISO 12 cleanliness class or better (typically ISO cleanliness code for fuel: <18/16/13) is required. Even soft contaminants such as biological growth, wax, and oil carry-over can cause injector stiction and deposit formation.',
    engineeringContext:
      'HPCR systems require the highest fuel cleanliness standards ever specified for production engines. A single particle of silica above 5 µm can permanently scar an injector plunger, causing fuel leakage past the plunger and loss of injection pressure. HPCR-compatible filtration must achieve absolute ratings at 2–6 µm to protect injection components at the quantities of particles present in typical bulk diesel.',
    aliases: ['common rail', 'CRD', 'direct injection', 'CR injection'],
    abbreviations: ['HPCR', 'CRD', 'CR'],
    applicableStandards: ['STD-ISO-16332', 'STD-ASTM-D6304'],
    relatedTerms: ['TERM-INJECTOR-STICTION', 'TERM-WATER-INGRESS', 'TERM-MICROBIAL-CONTAMINATION'],
    relatedTechnologies: ['syntepore', 'hydrocore', 'turbocore'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedArticles: ['hpcr-fuel-system-cleanliness', 'diesel-fuel-filtration', 'water-contamination-fuel'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-INJECTOR-STICTION': {
    id: 'TERM-INJECTOR-STICTION',
    term: 'Injector Stiction',
    category: 'water-fuel',
    definition:
      'Sticking or sluggish movement of an injector needle or plunger due to deposits, lacquer formation, water contamination, biological growth, or particle abrasion within the precision clearances of a fuel injector. In HPCR injectors, stiction causes misfiring, uneven fuel delivery across cylinders, excessive smoke, high-pressure pump wear, and engine power loss. Stiction can be temporary (wash-out possible) or permanent (mechanical scoring of plunger and barrel surfaces). Water above 200 ppm in diesel fuel is a primary trigger for injector lacquer and stiction.',
    engineeringContext:
      'Injector stiction diagnostics use injection correction factor data from the engine ECU — a high positive correction for a cylinder indicates low injector delivery (stiction), a negative correction indicates excessive delivery (leakage past a scored plunger). Fuel system cleaning procedures using high-concentration injector cleaner additives can resolve early-stage deposits, but mechanical scoring from particle contamination requires injector replacement.',
    aliases: ['injector fouling', 'injector deposit', 'IDID', 'injector lacquering'],
    abbreviations: ['IDID'],
    applicableStandards: [],
    relatedTerms: ['TERM-HPCR', 'TERM-WATER-INGRESS', 'TERM-VARNISH'],
    relatedTechnologies: ['syntepore'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedArticles: ['hpcr-fuel-system-cleanliness', 'diesel-fuel-filtration', 'water-contamination-fuel'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-COALESCING': {
    id: 'TERM-COALESCING',
    term: 'Coalescing',
    category: 'water-fuel',
    definition:
      'A water separation mechanism in which fine, emulsified water droplets in fuel or hydraulic fluid contact hydrophilic filter media fibres and merge (coalesce) into progressively larger droplets. The larger droplets, now heavy enough to overcome the fluid drag and surface tension forces that kept them emulsified, migrate to the outer surface of the coalescing element and drain by gravity to a sump for removal. Coalescing is distinct from absorption (retaining water within the media) — it removes free and emulsified water while allowing the bulk fluid to pass. Coalescing efficiency decreases with high surfactant concentration in fuel, which stabilises emulsions.',
    engineeringContext:
      'Coalescing water-separation filters are the primary active water removal technology for fuel systems. HYDROCORE coalescing elements achieve water separation efficiency exceeding 99% at rated flow. The settled water must be drained from the filter bowl regularly — typically every 100–250 hours or when the water drain indicator activates — to prevent water re-entrainment in high-flow conditions.',
    aliases: ['coalescence', 'water coalescing', 'coalescer', 'water separation'],
    abbreviations: [],
    applicableStandards: ['STD-ISO-16332', 'STD-ASTM-D6304'],
    relatedTerms: ['TERM-WATER-INGRESS', 'TERM-KARL-FISCHER-TITRATION'],
    relatedTechnologies: ['hydrocore', 'turbocore'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedArticles: ['water-contamination-fuel', 'diesel-fuel-filtration', 'marine-diesel-filtration'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-MICROBIAL-CONTAMINATION': {
    id: 'TERM-MICROBIAL-CONTAMINATION',
    term: 'Microbial Contamination',
    category: 'water-fuel',
    definition:
      'The colonisation of diesel fuel, biodiesel blends, and fuel system components by bacteria, fungi, and yeasts at the water-fuel interface. Microbial organisms metabolise hydrocarbons as a carbon source while using free water as a growth medium. They generate acidic metabolic waste products (pH 3–5 at colony sites) that corrode metal tanks and components, produce biomass and biofilm that block fuel filters, and generate hydrogen sulfide that corrodes fuel system materials. ULSD (Ultra Low Sulfur Diesel) fuels are more susceptible than high-sulfur fuels because sulfur compounds previously acted as natural biocides.',
    engineeringContext:
      'Microbial contamination is a primary fuel system issue in marine, generator, and bulk storage applications where fuel sits for extended periods with free water present. Free water must be removed below 200 ppm to inhibit growth. Biocide treatment (BIOGUARD, Grotamar 82, etc.) treats existing contamination but does not replace water removal. Contaminated fuel systems require complete system drain, tank cleaning, and filter replacement.',
    aliases: ['biological contamination', 'fuel bugs', 'microbiological growth', 'bacterial contamination', 'fungal contamination'],
    abbreviations: [],
    applicableStandards: ['STD-ASTM-D6304'],
    relatedTerms: ['TERM-WATER-INGRESS', 'TERM-KARL-FISCHER-TITRATION', 'TERM-HPCR'],
    relatedTechnologies: ['hydrocore', 'marineclean'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedArticles: ['water-contamination-fuel', 'marine-diesel-filtration', 'diesel-fuel-filtration'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  // ── FILTER MEDIA ─────────────────────────────────────────────────────────────

  'TERM-DEPTH-FILTRATION': {
    id: 'TERM-DEPTH-FILTRATION',
    term: 'Depth Filtration',
    category: 'filter-media',
    definition:
      'A filtration mechanism in which particles are captured throughout the three-dimensional volume of the filter media — within the pores and interstices of the fibrous structure — rather than at a single surface layer. Depth filtration captures particles by adsorption, inertial impaction, electrostatic attraction, and direct interception as they travel through the tortuous pore paths in the media. Depth filtration provides high dust holding capacity because the entire media volume participates in particle retention, in contrast to surface filtration which saturates rapidly at the upstream face.',
    engineeringContext:
      'Depth filtration is the dominant mechanism in air intake, lube oil, and hydraulic filter elements constructed from multi-layer cellulose, glass fibre, and synthetic media. The efficiency and capacity characteristics of depth filtration depend on fibre diameter, packing density, media thickness, and the pore size distribution — all of which are engineered during media manufacturing.',
    aliases: ['depth filter', 'volumetric filtration', 'bulk filtration'],
    abbreviations: [],
    applicableStandards: ['STD-ISO-16889', 'STD-ISO-5011'],
    relatedTerms: ['TERM-SURFACE-FILTRATION', 'TERM-PROGRESSIVE-DENSITY-GRADIENT', 'TERM-BETA-RATIO'],
    relatedTechnologies: ['macrocore', 'syntrax', 'nanoforce'],
    relatedSystems: ['air-intake-protection', 'lubrication-protection', 'hydraulic-protection'],
    relatedArticles: ['filter-media-science', 'filter-media-engineering', 'airflow-engineering'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-SURFACE-FILTRATION': {
    id: 'TERM-SURFACE-FILTRATION',
    term: 'Surface Filtration',
    category: 'filter-media',
    definition:
      'A filtration mechanism in which particles larger than the surface pore openings of the filter media are captured exclusively at the upstream surface, forming a particle cake layer that itself becomes an increasingly efficient filtration surface as it thickens. Surface filtration provides high initial efficiency at a defined absolute pore size and is characteristic of membrane filters, woven metal screens, and some HEPA-grade media. However, surface filtration results in rapid differential pressure increase as the surface cake builds, and typically has much lower dust holding capacity than depth filtration elements of the same thickness.',
    engineeringContext:
      'Surface filtration is appropriate for applications requiring absolute filtration — screening all particles above a defined size — but not for high-capacity air or fluid filtration where extended service intervals are required. NANOFORCE technology uses nanofiber surface layers over a depth filtration substrate to provide high-efficiency surface filtration at the fine particle end without sacrificing bulk holding capacity.',
    aliases: ['cake filtration', 'screen filtration', 'surface barrier filtration', 'sieve filtration'],
    abbreviations: [],
    applicableStandards: [],
    relatedTerms: ['TERM-DEPTH-FILTRATION', 'TERM-PROGRESSIVE-DENSITY-GRADIENT', 'TERM-SYNTHETIC-MEDIA'],
    relatedTechnologies: ['nanoforce'],
    relatedSystems: ['hydraulic-protection', 'air-intake-protection'],
    relatedArticles: ['filter-media-science', 'filter-media-engineering'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

  'TERM-SYNTHETIC-MEDIA': {
    id: 'TERM-SYNTHETIC-MEDIA',
    term: 'Synthetic Filter Media',
    category: 'filter-media',
    definition:
      'Filter media manufactured from man-made polymer fibres — including polyester, polypropylene, polyacrylonitrile, and glass fibre — in contrast to natural cellulose (wood pulp-based) media. Synthetic fibres offer controlled fibre diameter, uniform pore size distribution, high wet-burst strength, chemical resistance, and resistance to biological degradation. Synthetic media achieves higher Beta ratios at smaller particle sizes, longer service life under pressure cycling, and better dimensional stability at elevated temperatures compared to equivalent cellulose media.',
    engineeringContext:
      'Synthetic media is standard for hydraulic and lubrication oil filters where ISO 16889 Beta ratio performance must be guaranteed. Cellulose media is still used in many air filters due to its cost advantage and adequate performance in moderate-efficiency air intake applications. ELIMFILTERS SYNTRAX and NANOFORCE technologies use synthetic media composites engineered for specific performance targets across oil filtration domains.',
    aliases: ['glass fibre media', 'polyester media', 'polypropylene media', 'man-made media', 'synthetic filter material'],
    abbreviations: [],
    applicableStandards: ['STD-ISO-16889'],
    relatedTerms: ['TERM-DEPTH-FILTRATION', 'TERM-SURFACE-FILTRATION', 'TERM-PROGRESSIVE-DENSITY-GRADIENT'],
    relatedTechnologies: ['syntrax', 'nanoforce', 'macrocore'],
    relatedSystems: ['lubrication-protection', 'hydraulic-protection', 'air-intake-protection'],
    relatedArticles: ['filter-media-science', 'filter-media-engineering', 'materials-engineering'],
    version: '1.0',
    status: 'published',
    lastReviewed: '2026-07-05',
  },

};
