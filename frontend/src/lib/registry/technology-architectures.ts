/**
 * technology-architectures.ts
 * ELIMFILTERS Engineering Intelligence Platform — Phase 1: Engineering Foundation
 *
 * Technology Architecture Registry — the core engineering entity of the platform.
 * Each entry implements the eight-component class schema defined in registry-types.ts.
 *
 * EDR: EDR-A-002 — Why Technology Architecture Became the Core Engineering Entity
 * EDR: EDR-C-001 — Engineering Rationale for MACROCORE Technology Architecture
 * EDR: EDR-C-002 — Engineering Rationale for HYDROCORE Technology Architecture
 * EDR: EDR-C-003 — Engineering Rationale for SYNTRAX Technology Architecture
 * EDR: EDR-C-004 — Engineering Rationale for NANOFORCE Technology Architecture
 *
 * AUTHORITATIVE TECHNOLOGY-DOMAIN MAPPING (constitutional — never overridden):
 *   MACROCORE   → Air Intake              (ISO 5011, SAE J726)
 *   SYNTRAX     → Engine Lube Oil         (ISO 16889, ISO 4406)
 *   NANOFORCE   → Hydraulic               (ISO 16889, NFPA T2.14)
 *   SYNTEPORE   → Fuel HPCR               (ASTM D6304, ISO 12937)
 *   HYDROCORE   → Fuel Water Separation   (ASTM D6304)
 *   TURBOCORE   → Fuel 3-Stage            (ISO 16332)
 *   THERMACORE  → Cooling System          (ASTM D3306)
 *   DRYCORE     → Compressed Air          (ISO 8573-1/2/3)
 *   INTEKCORE   → Filter Housing Systems
 *   DURATECH    → Fleet Maintenance
 *   MARINECLEAN → Marine Diesel & Hydraulic (IMO)
 *   MICROKAPPA  → Cabin Air               (ISO 11155, DIN 71220)
 */

import { MATURITY, type TechnologyArchitecture } from './registry-types';

export const TECHNOLOGY_ARCHITECTURES: Record<string, TechnologyArchitecture> = {

  // ── MACROCORE — Air Intake Filtration ─────────────────────────────────

  'TECH-MACROCORE': {
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    id: 'TECH-MACROCORE',
    technologyName: 'MACROCORE',
    commercialName: 'MACROCORE™',
    systemDomain: 'Air Intake',
    primaryStandards: ['ISO 5011', 'SAE J726', 'ASTM D2986'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',

    canonicalDefinition:
      'MACROCORE is the air intake filtration technology implementing Progressive Density Architecture for multi-stage mechanical depth filtration of engine combustion air. It intercepts airborne particulate matter across the full size spectrum — from macro-debris at outer zones to fine dust at inner precision zones — before the air reaches the engine intake manifold.',

    systemContext:
      'Applies to all internal combustion engines in dusty operating environments: mining haul trucks, agricultural combines, construction excavators, long-haul diesel trucks, industrial generators, and any application where ambient dust concentration exceeds the engine intake air cleanliness requirement. The system protects the air path from ambient intake to cylinder.',

    industrialRole:
      'Abrasive particle ingestion through the air intake is the primary controllable cause of cylinder bore wear and ring wear in diesel engines. Each milligram of silica dust that reaches the combustion chamber acts as an abrasive cutting compound against cylinder liners and piston rings. MACROCORE intercepts this contamination stream before it reaches the engine, directly determining the serviceable life of the cylinder assembly.',

    // Component Class 1: Protection Media
    protectionMedia: [
      {
        type: 'Outer Zone — Coarse Depth Media',
        description:
          'High-loft synthetic fiber matrix capturing macro-particles (>50 µm) and agglomerates. Low initial pressure drop profile preserves volumetric air flow rate.',
        micronRating: '>50 µm',
        mediaConstruction: 'Polyester fiber, progressive pleat spacing',
      },
      {
        type: 'Intermediate Zone — Graduated Density Media',
        description:
          'Increasing fiber density captures mid-range dust particles (10–50 µm). Distributes particle loading to prevent premature outer-zone blinding.',
        micronRating: '10–50 µm',
        mediaConstruction: 'Glass microfiber / polyester blend, radial pleating',
      },
      {
        type: 'Inner Zone — Fine Precision Media',
        description:
          'High-efficiency depth medium capturing particles from 1 µm to 10 µm. Protects the engine from fine respirable silica fractions most damaging to cylinder bore geometry.',
        micronRating: '1–10 µm',
        mediaConstruction: 'Melt-blown glass microfiber, tight pleat geometry',
      },
    ],

    // Component Class 2: Engineering Principles
    engineeringPrincipleIds: ['EP-SEP-004', 'EP-SEP-001', 'EP-TRB-001'],

    // Component Class 3: Materials
    materials: [
      {
        component: 'Filter medium',
        material: 'Glass microfiber / polyester composite',
        justification:
          'Glass microfiber achieves stable Beta ratio under 80°C intake air temperatures and vibration loads where cellulose media undergoes pleat collapse and fiber migration.',
      },
      {
        component: 'End caps',
        material: 'Polyurethane foam or molded thermoplastic',
        justification:
          'Flexible polyurethane provides sealing compliance to housing tolerances; prevents bypass flow around end cap perimeter.',
      },
      {
        component: 'Center tube',
        material: 'Perforated steel or glass-filled nylon',
        justification:
          'Structural support prevents medium collapse under high differential pressure at terminal service life.',
      },
    ],

    // Component Class 4: Construction
    construction: [
      {
        feature: 'Progressive pleat density',
        description:
          'Pleat count and depth increase from outer to inner zone, creating the physical gradient for Progressive Density Architecture.',
        engineeringBasis:
          'Higher pleat count at inner zones provides the fine particle surface area required for sub-10 µm capture without restricting outer zone capacity.',
      },
      {
        feature: 'Radial sealing design',
        description:
          'Filter element seals radially against housing bore. No axial face seal that could unseat under vibration or thermal cycling.',
        engineeringBasis:
          'ISO 5011 test protocol includes vibration resistance evaluation. Radial seal maintains integrity under the mechanical shock loads common to off-highway applications.',
      },
      {
        feature: 'Safety inner element (where specified)',
        description:
          'Secondary filtration element inside the primary, providing protection during primary element change-out.',
        engineeringBasis:
          'Engine is unprotected during the brief period of primary element removal in the field. Safety element prevents a spike of contamination entering the engine during maintenance.',
      },
    ],

    // Component Class 5: Flow Dynamics
    flowDynamics: [
      {
        parameter: 'Rated air flow',
        value: 'Application-specific',
        unit: 'CFM / m³/h',
        standardRef: 'ISO 5011',
      },
      {
        parameter: 'Initial restriction (clean)',
        value: '<1.0',
        unit: 'kPa at rated flow',
        standardRef: 'ISO 5011',
      },
      {
        parameter: 'Service restriction limit',
        value: 'OEM-specified',
        unit: 'kPa',
        standardRef: 'SAE J726',
      },
    ],

    // Component Class 6: Capture Mechanisms
    captureMechanisms: [
      {
        contaminantClass: 'Coarse mineral particles (>50 µm)',
        mechanism: 'Inertial impaction at outer zone',
        efficiency: '>99.9%',
        particleSizeRange: '>50 µm',
      },
      {
        contaminantClass: 'Fine mineral dust (1–50 µm)',
        mechanism: 'Progressive depth filtration — interception and diffusion',
        efficiency: '>99.5% at 5 µm',
        particleSizeRange: '1–50 µm',
      },
      {
        contaminantClass: 'Respirable silica (0.5–5 µm)',
        mechanism: 'Glass microfiber diffusion capture at inner zone',
        efficiency: '>98% at 1 µm',
        particleSizeRange: '0.5–5 µm',
      },
    ],

    // Component Class 7: Performance Profile
    performanceProfile: [
      {
        metric: 'Overall filtration efficiency',
        value: '>99.9',
        unit: '%',
        evidenceSource: 'ISO 5011 standardized test dust A2 fine',
        standardRef: 'ISO 5011',
      },
      {
        metric: 'Dust-holding capacity',
        value: 'Model-dependent',
        unit: 'g at terminal restriction',
        evidenceSource: 'ISO 5011 Section 6 — dust-holding capacity test',
        standardRef: 'ISO 5011',
      },
    ],

    // Component Class 8: Failure Modes addressed
    failureModes: [
      {
        id: 'FM-AIR-001',
        rootCauseChain:
          'Unfiltered dust ingestion → cylinder bore abrasive wear → ring seal degradation → blow-by gas increase → oil contamination acceleration',
        measuredConsequence:
          'Cylinder bore wear rate increase of 3–10× versus filtered operation with ISO 5011-compliant element',
        operationalImpact:
          'Engine overhaul interval reduced from 12,000–20,000 hours to 2,000–5,000 hours under extreme dust without MACROCORE-class filtration',
        preventedByThisTechnology: true,
      },
      {
        id: 'FM-AIR-002',
        rootCauseChain:
          'Air filter restriction beyond OEM limit → volumetric efficiency reduction → fuel-air ratio enrichment → incomplete combustion → increased carbon deposits',
        measuredConsequence: '5–15% fuel consumption increase at terminal restriction',
        operationalImpact:
          'Failure to service at OEM restriction limit converts filtration protection into an active performance degradation factor',
        preventedByThisTechnology: false,
      },
    ],

    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority + Quality Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-C-001-v1.0',
      },
    ],
  },

  // ── SYNTRAX — Engine Lube Oil Filtration ──────────────────────────────

  'TECH-SYNTRAX': {
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    id: 'TECH-SYNTRAX',
    technologyName: 'SYNTRAX',
    commercialName: 'SYNTRAX™',
    systemDomain: 'Engine Lube Oil',
    primaryStandards: ['ISO 16889', 'ISO 4406', 'SAE J1858'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',

    canonicalDefinition:
      'SYNTRAX is the engine lube oil filtration technology implementing multi-layer depth filtration with Progressive Density Architecture and synthetic glass microfiber media. It maintains measurable ISO 4406 oil cleanliness codes in engine lubrication circuits by intercepting wear particles, carbon agglomerates, and metallic debris across the full service interval.',

    systemContext:
      'Applies to engine crankcase lubrication systems in diesel and gasoline engines across all duty classes. Protects: main bearings, connecting rod bearings, crankshaft journals, camshaft bearings, piston pins, and turbocharger journal bearings — all components that depend on oil film integrity for protection from metal-to-metal contact. Operating temperature range: 80–140°C engine oil temperature.',

    industrialRole:
      'Engine bearing lifespan is the primary determinant of planned engine overhaul interval. Particle contamination in engine oil is the largest controllable variable in bearing wear rate. SYNTRAX maintains the oil cleanliness target required for the designed bearing lifespan: ISO 16/14/11 to ISO 17/15/12 depending on engine specification. Failure to maintain this target accelerates the abrasive wear cycle and reduces bearing life by 3–5×.',

    // Component Class 1: Protection Media
    protectionMedia: [
      {
        type: 'Outer Layer — Macro-Particle Zone',
        description:
          'High-loft synthetic fiber captures metallic debris and carbon agglomerates >40 µm. Protects inner precision zones from premature loading.',
        micronRating: '>40 µm',
        mediaConstruction: 'Polyester fiber, high void volume',
      },
      {
        type: 'Intermediate Layer — Wear Particle Zone',
        description:
          'Medium-density synthetic media captures metallic wear particles in the 10–40 µm range — the size class most correlated with bearing surface damage.',
        micronRating: '10–40 µm',
        mediaConstruction: 'Glass microfiber / polyester blend',
      },
      {
        type: 'Inner Layer — Sub-Micron Zone',
        description:
          'High-efficiency glass microfiber barrier intercepts particles from 1 µm to 10 µm — the size class that transits conventional oil filters and causes progressive bearing clearance increase.',
        micronRating: '1–10 µm',
        mediaConstruction: 'Borosilicate glass microfiber',
      },
      {
        type: 'Core Barrier — Anti-Drainback / Bypass Control',
        description:
          'Anti-drainback valve prevents oil drain-back during cold starts. Bypass valve opens at calibrated differential pressure to maintain oil flow when medium is at terminal load.',
        micronRating: 'N/A — structural component',
        mediaConstruction: 'Nitrile valve; calibrated spring bypass',
      },
    ],

    // Component Class 2: Engineering Principles
    engineeringPrincipleIds: ['EP-SEP-004', 'EP-SEP-001', 'EP-CHE-002', 'EP-TRB-001', 'EP-INS-001'],

    // Component Class 3: Materials
    materials: [
      {
        component: 'Filter medium — precision layers',
        material: 'Borosilicate glass microfiber',
        justification:
          'Borosilicate glass fiber achieves stable Beta ratio at engine oil temperature range (80–140°C) and differential pressure conditions where synthetic polymer fibers undergo thermal softening and compression.',
      },
      {
        component: 'Filter canister (spin-on format)',
        material: 'Steel, seam-welded',
        justification:
          'Rated burst pressure must exceed maximum engine oil circuit pressure (typically 6–10 bar with pressure relief). Steel canister provides validated pressure containment.',
      },
      {
        component: 'Sealing gasket',
        material: 'Nitrile rubber (NBR)',
        justification:
          'NBR is compatible with petroleum and synthetic engine oils at operating temperatures. EPDM alternative for applications using ester-based synthetic oils.',
      },
      {
        component: 'Bypass valve spring',
        material: 'Stainless steel',
        justification:
          'Corrosion resistance in oil environment. Calibrated spring rate defines bypass opening pressure — a critical functional specification.',
      },
    ],

    // Component Class 4: Construction
    construction: [
      {
        feature: 'Four-layer progressive density stack',
        description:
          'Macro → intermediate → precision → core barrier. Each layer calibrated to its contamination size class.',
        engineeringBasis:
          'Distributes particle loading across the full medium volume, maximizing dirt-holding capacity and extending service intervals versus single-density designs.',
      },
      {
        feature: 'Anti-drainback valve',
        description:
          'One-way valve prevents oil from draining back to sump during engine-off periods.',
        engineeringBasis:
          'Cold-start bearing protection requires immediate oil film delivery. Without anti-drainback, the oil circuit must reprime from empty on every start, leaving bearings unlubricated during the priming period (typically 0.5–2 seconds at low temperature).',
      },
      {
        feature: 'Calibrated bypass valve',
        description:
          'Opens at defined differential pressure to bypass the medium, maintaining oil flow to bearings when the medium is at terminal load.',
        engineeringBasis:
          'Bypass valve protects against oil starvation (the acute failure mode) at the cost of temporary unfiltered oil flow (the chronic failure mode). The calibration pressure balances these two failure modes: too low opens bypass too early, bypassing clean oil; too high risks oil starvation if medium blinds.',
      },
    ],

    // Component Class 5: Flow Dynamics
    flowDynamics: [
      {
        parameter: 'Design flow rate',
        value: 'Engine-specific',
        unit: 'L/min at 80°C oil viscosity',
        standardRef: 'SAE J1858',
      },
      {
        parameter: 'Clean initial pressure drop',
        value: '<0.5',
        unit: 'bar at rated flow',
        standardRef: 'ISO 16889',
      },
      {
        parameter: 'Bypass valve opening pressure',
        value: '1.2–2.5 (OEM-specified)',
        unit: 'bar differential',
        standardRef: 'SAE J1858',
      },
    ],

    // Component Class 6: Capture Mechanisms
    captureMechanisms: [
      {
        contaminantClass: 'Metallic wear particles (Fe, Al, Cu)',
        mechanism: 'Inertial impaction + depth interception across progressive density zones',
        efficiency: 'β10(c) ≥ 200 per ISO 16889',
        particleSizeRange: '1–40 µm',
      },
      {
        contaminantClass: 'Carbon agglomerates',
        mechanism: 'Interception at outer macro-particle zone',
        efficiency: 'β40(c) ≥ 75 per ISO 16889',
        particleSizeRange: '>40 µm',
      },
      {
        contaminantClass: 'Soot particles',
        mechanism: 'Diffusion capture at glass microfiber inner zone',
        efficiency: 'Partial — soot agglomeration is primary removal mechanism',
        particleSizeRange: '0.01–1 µm',
      },
    ],

    // Component Class 7: Performance Profile
    performanceProfile: [
      {
        metric: 'Beta ratio at 10 µm (β10(c))',
        value: '≥200',
        unit: 'dimensionless',
        evidenceSource: 'ISO 16889 multi-pass test with ISO medium test dust',
        standardRef: 'ISO 16889',
      },
      {
        metric: 'Oil cleanliness achievable',
        value: 'ISO 16/14/11',
        unit: 'ISO 4406 code',
        evidenceSource: 'Field measurement in engine lube circuit with SYNTRAX at nominal service interval',
        standardRef: 'ISO 4406',
      },
    ],

    // Component Class 8: Failure Modes addressed
    failureModes: [
      {
        id: 'FM-LUB-001',
        rootCauseChain:
          'Particle contamination > ISO 4406 target → abrasive wear particles transit bearing clearances → micro-cutting of bearing surface → bearing clearance increase → oil film breakdown at high load → bearing seizure',
        measuredConsequence:
          'ISO 19/17/14 (commodity filter) versus ISO 16/14/11 (SYNTRAX): bearing life reduction of 3–5× documented in controlled engine test programs',
        operationalImpact:
          'Engine overhaul interval at optimal cleanliness (16/14/11): 15,000–25,000 hours. At poor cleanliness (19/17/14): 3,000–5,000 hours. Difference is the value of the filtration system, not the filter purchase price.',
        preventedByThisTechnology: true,
      },
    ],

    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority + Quality Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-C-003-v1.0',
      },
    ],
  },

  // ── NANOFORCE — Hydraulic System Filtration ───────────────────────────

  'TECH-NANOFORCE': {
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    id: 'TECH-NANOFORCE',
    technologyName: 'NANOFORCE',
    commercialName: 'NANOFORCE™',
    systemDomain: 'Hydraulic',
    primaryStandards: ['ISO 16889', 'NFPA T2.14.1', 'DIN 51524', 'ISO 4406'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',

    canonicalDefinition:
      'NANOFORCE is the hydraulic system filtration technology implementing high-efficiency depth filtration with nanofiber-enhanced media to achieve ISO 17/15/12 or tighter cleanliness targets in hydraulic circuits. It protects proportional valves, servo valves, and hydraulic pump components that operate with bore clearances of 1–5 µm — clearances where individual particles above 5 µm cause immediate functional damage.',

    systemContext:
      'Applies to high-pressure hydraulic systems in mobile machinery and industrial equipment: load-sensing proportional valve systems, electrohydraulic servo systems, variable-displacement axial piston pumps, and any hydraulic circuit controlling precision motion. Operating pressure: 150–450 bar. Oil temperature: 40–80°C operating range.',

    industrialRole:
      'Proportional valve spool-bore clearances of 1–5 µm define the contamination sensitivity of modern hydraulic systems. A single hard particle above 5 µm transiting the valve bore causes immediate micro-scoring of the spool surface. Cumulative scoring creates internal leakage, position control error, and eventual valve seizure. NANOFORCE maintains the ISO 4406 cleanliness code required for proportional valve rated service life, which is the primary determinant of hydraulic system reliability in precision machine control applications.',

    // Component Class 1: Protection Media
    protectionMedia: [
      {
        type: 'Nanofiber-enhanced depth medium',
        description:
          'Glass microfiber substrate with electrospun nanofiber layer achieving absolute filtration rating at 3–10 µm with β ratios >200.',
        micronRating: '3 µm absolute',
        mediaConstruction: 'Borosilicate glass microfiber + polyamide nanofiber overlay',
      },
      {
        type: 'Collapse-resistance structural support',
        description:
          'Synthetic drainage layer and perforated core tube preventing medium collapse under high differential pressure excursions.',
        micronRating: 'N/A — structural',
        mediaConstruction: 'Stainless steel perforated core, woven monofilament support layer',
      },
    ],

    // Component Class 2: Engineering Principles
    engineeringPrincipleIds: ['EP-SEP-001', 'EP-SEP-002', 'EP-CHE-002', 'EP-INS-001', 'EP-TRB-001'],

    // Component Class 3: Materials
    materials: [
      {
        component: 'Primary filter medium',
        material: 'Borosilicate glass microfiber with polyamide nanofiber',
        justification:
          'Nanofiber overlay reduces effective pore size to 3 µm while maintaining acceptable pressure drop. Glass substrate provides high-temperature stability at 80°C hydraulic fluid temperature.',
      },
      {
        component: 'Filter housing (high-pressure line filter)',
        material: 'Ductile cast iron or billet aluminum',
        justification:
          'High-pressure hydraulic line applications require housing rated to 420 bar working pressure minimum with appropriate safety factor. Cast iron provides required wall strength.',
      },
      {
        component: 'Seals',
        material: 'Fluorocarbon (FKM/Viton)',
        justification:
          'FKM compatible with petroleum-based and synthetic ester-based hydraulic fluids at 80°C. Resistance to hydraulic system cleaning agents and phosphate ester fluids.',
      },
    ],

    // Component Class 4: Construction
    construction: [
      {
        feature: 'Absolute-rated nanofiber medium',
        description:
          'Nanofiber layer provides consistent absolute rating across service life, unlike depth-only media that changes effective rating as loading progresses.',
        engineeringBasis:
          'Proportional valve damage occurs from the first particle above the valve bore clearance. Consistent absolute rating ensures protection from installation through end of service life, not only in the early loading phase.',
      },
      {
        feature: 'Collapse-pressure rated to 16 bar differential',
        description:
          'Element structural integrity maintained at 16 bar differential pressure — the condition occurring when element is fully loaded and system is operating at maximum flow.',
        engineeringBasis:
          'NFPA T2.14.1 requires filter elements to withstand collapse pressure without structural failure. A collapsed element releases accumulated contamination as a single slug — the acute catastrophic contamination event the filter is designed to prevent.',
      },
      {
        feature: 'Differential pressure indicator port',
        description:
          'Housing incorporates differential pressure measurement port for monitoring element load progression.',
        engineeringBasis:
          'Hydraulic filters must be serviced at differential pressure limits, not at calendar intervals. Pressure indication enables condition-based maintenance: service when needed, not on schedule.',
      },
    ],

    // Component Class 5: Flow Dynamics
    flowDynamics: [
      {
        parameter: 'Rated flow',
        value: 'Model-dependent',
        unit: 'L/min at 46 cSt (ISO VG 46)',
        standardRef: 'ISO 3968',
      },
      {
        parameter: 'Clean initial pressure drop',
        value: '<0.3',
        unit: 'bar at rated flow',
        standardRef: 'ISO 3968',
      },
      {
        parameter: 'Collapse-rated differential pressure',
        value: '≥16',
        unit: 'bar',
        standardRef: 'NFPA T2.14.1',
      },
    ],

    // Component Class 6: Capture Mechanisms
    captureMechanisms: [
      {
        contaminantClass: 'Metallic particles (>3 µm)',
        mechanism: 'Nanofiber surface capture + depth interception',
        efficiency: 'β3(c) ≥ 200 per ISO 16889',
        particleSizeRange: '3–50 µm',
      },
      {
        contaminantClass: 'Silica ingress particles',
        mechanism: 'Depth filtration through glass microfiber matrix',
        efficiency: 'β10(c) ≥ 1000 per ISO 16889',
        particleSizeRange: '10–50 µm',
      },
      {
        contaminantClass: 'Varnish precursors / oxidation products',
        mechanism: 'Partial capture by adsorption onto glass fiber surface',
        efficiency: 'Partial — dedicated varnish removal elements required for severe cases',
        particleSizeRange: '<1 µm',
      },
    ],

    // Component Class 7: Performance Profile
    performanceProfile: [
      {
        metric: 'Beta ratio at 3 µm (β3(c))',
        value: '≥200',
        unit: 'dimensionless',
        evidenceSource: 'ISO 16889 multi-pass test',
        standardRef: 'ISO 16889',
      },
      {
        metric: 'Achievable system cleanliness',
        value: 'ISO 17/15/12',
        unit: 'ISO 4406 code',
        evidenceSource: 'System cleanliness measurement in mobile hydraulic application with kidney-loop NANOFORCE filtration',
        standardRef: 'ISO 4406',
      },
    ],

    // Component Class 8: Failure Modes addressed
    failureModes: [
      {
        id: 'FM-HYD-001',
        rootCauseChain:
          'Particle contamination > ISO 4406 target → particles transit proportional valve bore clearance → micro-scoring of spool surface → internal leakage increase → position control error → valve seizure',
        measuredConsequence:
          'ISO 4406 17/15/12 versus 19/17/14: proportional valve service life 3–8× longer at target cleanliness. Servo valve manufacturers specify rejection of systems operating above ISO 16/14/11.',
        operationalImpact:
          'Proportional valve replacement at USD 800–5,000 per valve. Multi-valve hydraulic systems experiencing uncontrolled contamination may require 3–5 valve replacements per machine per year. NANOFORCE-maintained cleanliness reduces valve replacement frequency to 0–1 events per machine per planned maintenance cycle.',
        preventedByThisTechnology: true,
      },
    ],

    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority + Quality Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-C-004-v1.0',
      },
    ],
  },

  // ── HYDROCORE — Fuel Water Separation ────────────────────────────────

  'TECH-HYDROCORE': {
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    id: 'TECH-HYDROCORE',
    technologyName: 'HYDROCORE',
    commercialName: 'HYDROCORE™',
    systemDomain: 'Fuel Water Separation',
    primaryStandards: ['ASTM D6304', 'ISO 12937', 'ISO 16332'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',

    canonicalDefinition:
      'HYDROCORE is the fuel water separation technology implementing coalescence and hydrophobic repulsion to remove free and emulsified water from diesel fuel before it reaches the fuel injection system. It is classified as a Fuel Water Separation technology — not a hydraulic technology and not a multi-domain technology — because its engineering principles address the specific phase-state challenge of water-in-fuel contamination.',

    systemContext:
      'Applies to diesel fuel supply systems in all compression-ignition engines. Primary installation points: fuel pre-filter position (upstream of fuel transfer pump) and primary fuel filter housing with integrated water separation bowl. Critical in: long-haul transport, standby power generation, agricultural storage systems, and any application using stored diesel fuel susceptible to condensation water accumulation.',

    industrialRole:
      'Free water in diesel fuel at concentrations above 200 ppm causes: hydraulic fracture of high-pressure common rail injector tips (at 1,800+ bar injection pressure), injector stiction from water-induced lacquer deposits, and injector tip corrosion from dissolved acids in the water phase. Water content of stored diesel increases by 50–200 ppm per week of storage in above-ground tanks through thermal cycling. HYDROCORE intercepts this water before it reaches the injection circuit, protecting injector service life from a failure mode that is predictable, progressive, and preventable.',

    protectionMedia: [
      {
        type: 'Coalescing medium',
        description:
          'High-surface-area fiber matrix providing repeated droplet contact surfaces. Dispersed water droplets (5–50 µm) contact fibers and merge into settleable droplets (>100 µm).',
        micronRating: '10 µm particle filtration',
        mediaConstruction: 'Borosilicate glass microfiber, hydrophilic surface treatment',
      },
      {
        type: 'Hydrophobic barrier',
        description:
          'Final stage hydrophobic membrane prevents any coalesced or un-coalesced water from transiting to the fuel delivery circuit.',
        micronRating: '2–30 µm selectable',
        mediaConstruction: 'PTFE-coated or fluoropolymer membrane, hydrophobic surface energy <30 mN/m',
      },
    ],

    engineeringPrincipleIds: ['EP-PHS-001', 'EP-PHS-002', 'EP-SEP-001'],

    materials: [
      {
        component: 'Coalescing fiber',
        material: 'Borosilicate glass microfiber with hydrophilic surface treatment',
        justification:
          'Hydrophilic surface treatment maximizes water droplet contact area and promotes coalescence versus hydrophobic surfaces that repel droplets before coalescence can complete.',
      },
      {
        component: 'Hydrophobic barrier layer',
        material: 'PTFE-coated glass fiber or polytetrafluoroethylene membrane',
        justification:
          'PTFE surface energy (~18 mN/m) is well below water surface tension (72 mN/m), providing reliable hydrophobic repulsion across the operating differential pressure range.',
      },
      {
        component: 'Water collection bowl',
        material: 'Transparent polysulfone',
        justification:
          'Visual water level monitoring without draining. Polysulfone is diesel-compatible and UV-stable for outdoor installation.',
      },
    ],

    construction: [
      {
        feature: 'Coalesce-then-repel architecture',
        description:
          'Coalescing stage first (hydrophilic) grows water droplets to settleable size; repulsion stage second (hydrophobic) provides final barrier. Sequence is functional — reversing the stages reduces effectiveness.',
        engineeringBasis:
          'Coalescence requires droplet-surface contact; hydrophilic surfaces promote wetting and coalescence. Hydrophobic surfaces repel droplets, so a hydrophobic first stage would repel the very droplets it is intended to coalesce.',
      },
      {
        feature: 'Transparent water collection bowl with drain valve',
        description:
          'Separated water accumulates in sealed bowl below the element. Visual level indicator and manual or automatic drain valve.',
        engineeringBasis:
          'Water that is separated must be removed from the system or it re-emulsifies under vibration and fuel flow. The bowl provides temporary storage with visual service indicator.',
      },
      {
        feature: 'Water-in-fuel sensor port (optional)',
        description:
          'Electrical port for capacitance-type WIF sensor providing dashboard warning on water level in collection bowl.',
        engineeringBasis:
          'ISO 4020 requires WIF warning systems on diesel engines over a defined threshold power. Sensor integration converts the mechanical filter housing into a condition-monitoring device.',
      },
    ],

    flowDynamics: [
      {
        parameter: 'Rated fuel flow',
        value: 'Model-dependent',
        unit: 'L/h at 40°C fuel viscosity',
        standardRef: 'ISO 16332',
      },
      {
        parameter: 'Water separation efficiency',
        value: '>95',
        unit: '% free water removal',
        standardRef: 'ISO 16332',
      },
    ],

    captureMechanisms: [
      {
        contaminantClass: 'Free water (droplets >10 µm)',
        mechanism: 'Coalescence followed by gravitational settling',
        efficiency: '>95% per ISO 16332',
        particleSizeRange: '>10 µm droplets',
      },
      {
        contaminantClass: 'Emulsified water (droplets 1–10 µm)',
        mechanism: 'Coalescing medium — surface contact → droplet growth → settling',
        efficiency: '>85% per ISO 16332 test conditions',
        particleSizeRange: '1–10 µm droplets',
      },
      {
        contaminantClass: 'Fuel particulate (>10 µm)',
        mechanism: 'Depth filtration through coalescing medium',
        efficiency: 'β10(c) ≥ 75 typical',
        particleSizeRange: '>10 µm',
      },
    ],

    performanceProfile: [
      {
        metric: 'Free water separation efficiency',
        value: '>95',
        unit: '% at rated flow',
        evidenceSource: 'ISO 16332 fuel/water separator test protocol',
        standardRef: 'ISO 16332',
      },
      {
        metric: 'Water content of delivered fuel',
        value: '<200',
        unit: 'ppm (target for HPCR injection systems)',
        evidenceSource: 'ASTM D6304 Karl Fischer titration on filtered fuel samples',
        standardRef: 'ASTM D6304',
      },
    ],

    failureModes: [
      {
        id: 'FM-FUEL-001',
        rootCauseChain:
          'Free water in diesel > 200 ppm → water transit to HPCR injection rail at 1,800 bar → hydraulic fracture force on injector tip → injector tip cracking → injection pattern distortion → combustion inefficiency and injector replacement',
        measuredConsequence:
          'HPCR injector replacement cost: USD 400–2,000 per injector. 6-cylinder engine: USD 2,400–12,000 per water contamination event.',
        operationalImpact:
          'Single water contamination event causing injector failure results in vehicle off-service for 2–5 days (parts availability dependent). Fleet operators experiencing recurring fuel water contamination report 15–25% of unscheduled maintenance events attributable to injection system water damage.',
        preventedByThisTechnology: true,
      },
    ],

    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority + Quality Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-C-002-v1.0',
      },
    ],
  },

  // ── MICROKAPPA — Cabin Air Filtration ────────────────────────────────

  'TECH-MICROKAPPA': {
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    id: 'TECH-MICROKAPPA',
    technologyName: 'MICROKAPPA',
    commercialName: 'MICROKAPPA™',
    systemDomain: 'Cabin Air',
    primaryStandards: ['ISO 11155-1', 'ISO 11155-2', 'DIN 71220', 'EN 779'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',

    canonicalDefinition:
      'MICROKAPPA is the cabin air filtration technology implementing multi-layer particulate and chemical filtration for operator health protection in industrial equipment cabs. It intercepts airborne PM10, PM2.5, and respirable crystalline silica (RCS) from the cab air supply, with optional activated carbon layer for chemical vapor protection. The governing design objective is operator respiratory health, not equipment protection.',

    systemContext:
      'Applies to operator cabs in mining equipment, agricultural machinery, construction equipment, and any industrial vehicle where the operator is exposed to elevated ambient particulate concentrations. Regulatory context: occupational silica exposure limits (0.05 mg/m³ in most jurisdictions) are enforced at the operator breathing zone — the cab air supply post-filter is the enforcement point.',

    industrialRole:
      'Chronic silicosis is an irreversible occupational lung disease caused by cumulative inhalation of respirable crystalline silica. Mining, quarrying, and tunneling operators face the highest RCS exposure. Agricultural operators face pesticide vapor exposure. MICROKAPPA cabin filtration is the primary engineering control for operator respiratory health in these environments — the protective equipment at the last line before operator inhalation. ISO 11155 Class E efficiency (>80% at 0.4 µm) is the minimum standard for RCS protection in high-dust environments.',

    protectionMedia: [
      {
        type: 'Particulate filtration layer',
        description:
          'Multi-layer nonwoven medium capturing PM10 and PM2.5 by mechanical filtration. Efficiency class per ISO 11155-1.',
        micronRating: '0.4 µm (ISO test particle)',
        mediaConstruction: 'Electrostatic-enhanced melt-blown polypropylene, pleated',
      },
      {
        type: 'Activated carbon layer (combination filter)',
        description:
          'Granular or impregnated activated carbon layer for adsorption of gaseous chemical contaminants: pesticide vapors, NOx, organic solvents.',
        micronRating: 'N/A — adsorption',
        mediaConstruction: 'Granular activated carbon impregnated with metal salts for acid gas capture',
      },
    ],

    engineeringPrincipleIds: ['EP-TRB-002', 'EP-CHE-001', 'EP-SEP-001'],

    materials: [
      {
        component: 'Particulate medium',
        material: 'Electrostatic melt-blown polypropylene',
        justification:
          'Electrostatic charge enhancement increases capture efficiency for sub-micron particles (0.1–1 µm RCS fraction) without proportional increase in pressure drop. Critical for achieving Class E efficiency at acceptable HVAC system pressure drop.',
      },
      {
        component: 'Carbon layer substrate',
        material: 'Activated carbon granules (coconut shell or coal-based)',
        justification:
          'Coconut-shell activated carbon has higher micropore volume than coal-based, providing greater adsorption capacity per gram for volatile organic compounds. Impregnation with KI (potassium iodide) extends protection to certain pesticide chemistries.',
      },
      {
        component: 'Filter frame',
        material: 'Cardboard (standard) or ABS plastic (premium)',
        justification:
          'Frame must maintain seal against cab HVAC housing. ABS provides dimensional stability in high-humidity cab environments where cardboard frames absorb moisture and deform.',
      },
    ],

    construction: [
      {
        feature: 'Dual-stage architecture (particulate + carbon)',
        description:
          'Particulate layer upstream, carbon layer downstream. Air encounters particle filter first, then chemical adsorption.',
        engineeringBasis:
          'Particulate layer protects carbon from dust loading that would reduce chemical adsorption capacity. Reversed order would result in rapid carbon capacity consumption by particulate matter rather than gaseous contaminants.',
      },
      {
        feature: 'Electrostatic charge in particulate layer',
        description:
          'Melt-blown polypropylene fibers carry permanent electrostatic charge that attracts sub-micron particles toward fiber surfaces beyond mechanical interception alone.',
        engineeringBasis:
          'Electrostatic attraction increases capture probability for particles in the 0.1–1 µm range — the RCS size fraction that is most damaging to respiratory health and most difficult to capture by mechanical filtration alone at acceptable pressure drop.',
      },
    ],

    flowDynamics: [
      {
        parameter: 'Rated air flow',
        value: 'Cab HVAC system dependent',
        unit: 'm³/h at rated HVAC flow',
        standardRef: 'ISO 11155-1',
      },
      {
        parameter: 'Initial pressure drop',
        value: '<50 (particulate only) / <80 (combination)',
        unit: 'Pa at rated flow',
        standardRef: 'ISO 11155-1',
      },
    ],

    captureMechanisms: [
      {
        contaminantClass: 'PM10 (≤10 µm aerodynamic diameter)',
        mechanism: 'Mechanical depth filtration + electrostatic attraction',
        efficiency: '>95% at PM10 per ISO 11155-1',
        particleSizeRange: '2.5–10 µm',
      },
      {
        contaminantClass: 'PM2.5 / Respirable crystalline silica (0.5–2.5 µm)',
        mechanism: 'Electrostatic capture + diffusion in melt-blown matrix',
        efficiency: '>80% at 0.4 µm (Class E per ISO 11155-1)',
        particleSizeRange: '0.1–2.5 µm',
      },
      {
        contaminantClass: 'Pesticide vapors / organic vapors (combination filter)',
        mechanism: 'Adsorption onto activated carbon surface',
        efficiency: 'Chemical-class dependent; validated per EN 15695',
        particleSizeRange: 'Molecular / sub-0.01 µm',
      },
    ],

    performanceProfile: [
      {
        metric: 'Particulate efficiency at 0.4 µm',
        value: '>80 (Class E)',
        unit: '% per ISO 11155-1',
        evidenceSource: 'ISO 11155-1 test protocol using DEHS aerosol at 0.4 µm',
        standardRef: 'ISO 11155-1',
      },
      {
        metric: 'Service interval',
        value: '1,000–2,000',
        unit: 'operating hours (environment dependent)',
        evidenceSource: 'Field measurement of pressure drop vs. service hours in high-dust applications',
        standardRef: 'ISO 11155-2',
      },
    ],

    failureModes: [
      {
        id: 'FM-CAB-001',
        rootCauseChain:
          'No cabin air filtration or filter beyond service life → RCS penetrates cab HVAC → operator breathing zone RCS concentration > 0.05 mg/m³ → chronic respiratory exposure → silicosis (irreversible)',
        measuredConsequence:
          'Silicosis has no cure. Operators with chronic silicosis: reduced lung function, increased susceptibility to tuberculosis, disability. Regulatory consequence: workplace violation, potential prosecution under occupational health statutes.',
        operationalImpact:
          'Fleet operators without validated cabin air filtration in high-silica environments face: compensation claims, regulatory fines, operator attrition, and insurance premium increases. MICROKAPPA cabin filtration is the engineering control that removes the RCS hazard at source before it reaches the operator.',
        preventedByThisTechnology: true,
      },
    ],

    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority + Quality Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-B-002-v1.0',
      },
    ],
  },

  // ── SYNTEPORE — Fuel HPCR Filtration ─────────────────────────────────

  'TECH-SYNTEPORE': {
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    id: 'TECH-SYNTEPORE',
    technologyName: 'SYNTEPORE',
    commercialName: 'SYNTEPORE™',
    systemDomain: 'Fuel HPCR',
    primaryStandards: ['ASTM D6304', 'ISO 12937', 'ISO 19438'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',

    canonicalDefinition:
      'SYNTEPORE is the fuel filtration technology for High-Pressure Common Rail (HPCR) injection systems, implementing absolute-rated synthetic media filtration to achieve sub-4 µm fuel cleanliness targets required by HPCR injector manufacturers. It addresses both particulate contamination and residual water contamination in the secondary fuel filtration stage — between the primary water separator and the high-pressure injection pump inlet.',

    systemContext:
      'Applies to the secondary fuel filtration position in HPCR diesel fuel systems operating at injection pressures of 1,600–2,500 bar. HPCR injector plunger-barrel clearances of 1–3 µm define the contamination sensitivity: particles above 4 µm cause immediate plunger scoring at the operating pressure. Critical in: Euro IV/V/VI trucks, Tier 4 Final agricultural engines, modern construction equipment with electronic injection management.',

    industrialRole:
      'HPCR injection precision is the operational basis for Tier 4 Final emissions compliance and fuel efficiency. Injector wear from particulate contamination degrades injection timing and spray pattern, directly increasing NOx emissions and fuel consumption. SYNTEPORE maintains the sub-4 µm fuel cleanliness code (ISO 4406 equivalent: 12/10/7 or tighter) specified by HPCR injector manufacturers for rated injector service life of 10,000–15,000 hours.',

    protectionMedia: [
      {
        type: 'Absolute-rated synthetic medium',
        description:
          'Synthetic microfiber medium with absolute rating at 4 µm, providing consistent sub-micron cleanliness from installation through end of service life.',
        micronRating: '4 µm absolute',
        mediaConstruction: 'Synthetic polyester microfiber, wet-laid, absolute-rated',
      },
      {
        type: 'Water-scavenging layer',
        description:
          'Integrated coalescing layer captures residual dissolved water below the primary water separator threshold, protecting against moisture-induced injector tip corrosion.',
        micronRating: 'N/A — water scavenging',
        mediaConstruction: 'Hydrophilic glass microfiber with water coalescence treatment',
      },
    ],

    engineeringPrincipleIds: ['EP-SEP-001', 'EP-SEP-002', 'EP-PHS-001', 'EP-INS-001', 'EP-CHE-002'],

    materials: [
      {
        component: 'Primary filter medium',
        material: 'Synthetic polyester microfiber (absolute-rated)',
        justification:
          'Synthetic media maintains absolute rating at high pressure differentials and fuel temperature range (-20°C to +70°C). Cellulose media undergoes fiber migration that compromises the absolute rating under HPCR system pressure fluctuations.',
      },
      {
        component: 'Filter housing',
        material: 'Plastic bowl (standard) or aluminum (high-temperature)',
        justification:
          'Fuel pre-filter housings in modern engines are thermally exposed. Aluminum housings resist deformation at sustained 70°C fuel temperature in underhood environments.',
      },
      {
        component: 'O-ring seals',
        material: 'Fluorocarbon (FKM)',
        justification:
          'FKM compatibility with biofuel blends (B5, B20) and low-sulfur diesel. Required for diesel fuel compatibility across all blend ratios in current market.',
      },
    ],

    construction: [
      {
        feature: 'Absolute-rated media construction',
        description:
          'Wet-laid synthetic fiber provides consistent absolute rating throughout service life, unlike depth media where effective rating changes as media loads.',
        engineeringBasis:
          'HPCR injector damage is caused by individual particle events at the plunger-barrel interface. Nominal ratings that allow particles above the injector clearance to transit represent functional non-compliance with the injector manufacturer cleanliness specification.',
      },
      {
        feature: 'Integrated water scavenging stage',
        description:
          'Secondary water scavenging after primary water separator catches residual dissolved water not removed by coalescence.',
        engineeringBasis:
          'Primary water separators (HYDROCORE) remove free and emulsified water. Dissolved water at 100–500 ppm passes through primary separation unchanged. SYNTEPORE integrated scavenging removes residual dissolved water phase, protecting injectors from the acid corrosion mechanism.',
      },
    ],

    flowDynamics: [
      {
        parameter: 'Rated fuel flow',
        value: 'Engine-specific',
        unit: 'L/h at maximum rated power',
        standardRef: 'ISO 19438',
      },
      {
        parameter: 'Initial pressure drop (clean)',
        value: '<0.1',
        unit: 'bar at rated flow',
        standardRef: 'ISO 19438',
      },
    ],

    captureMechanisms: [
      {
        contaminantClass: 'Fuel particulate (>4 µm)',
        mechanism: 'Absolute surface filtration on synthetic microfiber medium',
        efficiency: 'β4(c) ≥ 200 (absolute rated)',
        particleSizeRange: '>4 µm',
      },
      {
        contaminantClass: 'Residual dissolved water',
        mechanism: 'Coalescence in integrated water scavenging layer',
        efficiency: '>70% dissolved water capture at rated flow',
        particleSizeRange: 'Molecular / <1 µm',
      },
    ],

    performanceProfile: [
      {
        metric: 'Absolute filtration rating',
        value: '4',
        unit: 'µm (absolute)',
        evidenceSource: 'ISO 19438 fuel contamination multi-pass test with AC Ultra Fine test dust',
        standardRef: 'ISO 19438',
      },
      {
        metric: 'Achievable fuel cleanliness',
        value: 'ISO 4406 12/10/7',
        unit: 'ISO 4406 code',
        evidenceSource: 'Particle count measurement downstream of SYNTEPORE in HPCR fuel circuit',
        standardRef: 'ISO 4406',
      },
    ],

    failureModes: [
      {
        id: 'FM-HPCR-001',
        rootCauseChain:
          'Particle contamination > 4 µm in HPCR fuel circuit → particle transits injector plunger-barrel clearance at 2,000 bar → micro-scoring of plunger surface → internal leakage increase → injection quantity drift → emissions non-compliance and power loss → injector replacement',
        measuredConsequence:
          'HPCR injector service life at correct cleanliness (ISO 12/10/7): 10,000–15,000 hours. At uncontrolled cleanliness (ISO 18/16/13): 2,000–4,000 hours. Injector replacement cost: USD 400–2,000 per injector × 6 cylinders.',
        operationalImpact:
          'Premature injector failure in Tier 4 Final engines triggers emissions system non-compliance warnings, requiring immediate engine shutdown in regulated jurisdictions. Off-service time: 2–5 days. SYNTEPORE fuel cleanliness maintenance prevents this failure mode.',
        preventedByThisTechnology: true,
      },
    ],

    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority + Quality Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-C-005-v1.0',
      },
    ],
  },

  // ── TURBOCORE — Fuel 3-Stage Filtration ──────────────────────────────

  'TECH-TURBOCORE': {
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    id: 'TECH-TURBOCORE',
    technologyName: 'TURBOCORE',
    commercialName: 'TURBOCORE™',
    systemDomain: 'Fuel 3-Stage',
    primaryStandards: ['ISO 16332', 'ISO 19438', 'EN 590'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',

    canonicalDefinition:
      'TURBOCORE is the three-stage fuel filtration technology integrating water separation, primary particulate filtration, and final absolute-rated filtration in a single system designed for large-displacement diesel engines in mining, power generation, and marine applications. The three-stage architecture addresses all fuel contamination classes — water, coarse particulate, and fine particulate — in a defined sequence that prevents each stage from being overwhelmed by contamination classes outside its design specification.',

    systemContext:
      'Applies to large diesel engines (>500 kW) in stationary power generation, mining haul trucks, large marine auxiliary engines, and locomotive applications where fuel quality is variable and fuel system protection requires the complete three-stage sequence. Typical fuel consumption rates of 100–500 L/h require high-capacity filtration elements with extended service intervals.',

    industrialRole:
      'Large-displacement engines in remote operations face compounded fuel contamination challenges: stored fuel with accumulated water and particulate, variable fuel supplier quality, and high fuel volume throughput that rapidly loads single-stage filtration. TURBOCORE three-stage architecture provides redundant protection layers so that a failure of primary water separation does not expose the final-stage filter to bulk water, and a failure of primary particulate filtration does not expose the HPCR injection circuit to coarse particles.',

    protectionMedia: [
      {
        type: 'Stage 1 — Water Separation',
        description:
          'Coalescing and hydrophobic medium for free and emulsified water removal. Identical engineering principles to HYDROCORE but scaled for high fuel flow rates.',
        micronRating: '30 µm primary particle filtration',
        mediaConstruction: 'Glass microfiber coalescing + PTFE hydrophobic barrier',
      },
      {
        type: 'Stage 2 — Primary Particulate',
        description:
          'High-capacity depth medium for coarse particle removal (>10 µm) and protection of Stage 3 from rapid loading.',
        micronRating: '10 µm nominal',
        mediaConstruction: 'Cellulose / synthetic blend, high dirt-holding capacity',
      },
      {
        type: 'Stage 3 — Final Absolute Filtration',
        description:
          'Absolute-rated synthetic medium providing final cleanliness target before the injection system inlet.',
        micronRating: '4 µm absolute',
        mediaConstruction: 'Synthetic polyester microfiber, absolute-rated',
      },
    ],

    engineeringPrincipleIds: ['EP-PHS-001', 'EP-PHS-002', 'EP-SEP-001', 'EP-SEP-004'],

    materials: [
      {
        component: 'Stage 1 coalescing element',
        material: 'Glass microfiber (hydrophilic) + PTFE (hydrophobic)',
        justification:
          'Same materials basis as HYDROCORE — borosilicate glass for coalescence, PTFE for final water repulsion. Scaled element size for high-flow applications.',
      },
      {
        component: 'Stage 2 primary element',
        material: 'Cellulose / polyester blend',
        justification:
          'High dirt-holding capacity of cellulosic media provides extended service intervals for Stage 2 at the coarse-particle contamination levels typical of bulk stored fuel.',
      },
      {
        component: 'Stage 3 final element',
        material: 'Absolute-rated synthetic polyester microfiber',
        justification:
          'Absolute rating at 4 µm provides consistent final-stage protection to the injection system. Stage 3 is protected from premature loading by Stages 1 and 2.',
      },
    ],

    construction: [
      {
        feature: 'Sequential three-stage architecture',
        description:
          'Stages in fixed sequence: water removal first, coarse particle second, fine particle third. No stage bypass.',
        engineeringBasis:
          'Stage sequence matches contamination removal difficulty: water is removed by phase separation (Stage 1), coarse particles by high-capacity depth filtration (Stage 2), fine particles by absolute-rated precision medium (Stage 3). Reversed sequence would result in fine-particle medium rapidly loading with coarse contamination intended for Stage 2.',
      },
      {
        feature: 'Independent service access per stage',
        description:
          'Each stage can be serviced independently, allowing Stage 2 replacement at high-contamination intervals without disturbing Stage 1 (water separator) or Stage 3 (final element).',
        engineeringBasis:
          'Stages have different service intervals in the field: Stage 2 primary element may require replacement at 200–500 hours in contaminated fuel environments while Stage 3 final element remains within service limits. Independent access prevents unnecessary replacement of stages that are not at service limits.',
      },
    ],

    flowDynamics: [
      {
        parameter: 'Rated fuel flow (3-stage assembly)',
        value: '100–500',
        unit: 'L/h depending on configuration',
        standardRef: 'ISO 16332',
      },
      {
        parameter: 'System water separation efficiency',
        value: '>95',
        unit: '% (Stages 1 + 2 combined)',
        standardRef: 'ISO 16332',
      },
    ],

    captureMechanisms: [
      {
        contaminantClass: 'Free and emulsified water',
        mechanism: 'Stage 1: coalescence + hydrophobic repulsion',
        efficiency: '>95% free water per ISO 16332',
        particleSizeRange: '>5 µm water droplets',
      },
      {
        contaminantClass: 'Coarse fuel particulate (>10 µm)',
        mechanism: 'Stage 2: depth filtration — high dirt-holding capacity medium',
        efficiency: '>90% at 10 µm (nominal)',
        particleSizeRange: '10–500 µm',
      },
      {
        contaminantClass: 'Fine fuel particulate (>4 µm)',
        mechanism: 'Stage 3: absolute surface filtration on synthetic medium',
        efficiency: 'β4(c) ≥ 200 (absolute)',
        particleSizeRange: '4–10 µm',
      },
    ],

    performanceProfile: [
      {
        metric: 'Stage 3 absolute rating',
        value: '4',
        unit: 'µm (absolute)',
        evidenceSource: 'ISO 19438 multi-pass test on Stage 3 element independently',
        standardRef: 'ISO 19438',
      },
      {
        metric: 'System water separation efficiency',
        value: '>95',
        unit: '% combined Stages 1+2',
        evidenceSource: 'ISO 16332 test on complete 3-stage assembly',
        standardRef: 'ISO 16332',
      },
    ],

    failureModes: [
      {
        id: 'FM-FUEL3-001',
        rootCauseChain:
          'Bulk water ingress overwhelming single-stage primary water separator → water passes Stage 1 → Stage 2 (non-water-rated) becomes emulsion trap → Stage 3 final element exposed to water slugs → bypass valve opens → unfiltered fuel water slug reaches HPCR injection circuit',
        measuredConsequence:
          'HPCR injector hydraulic fracture from water-at-pressure event. Full injector set replacement (6-cylinder: USD 2,400–12,000). Engine off-service 2–5 days.',
        operationalImpact:
          'Single-stage primary filters in high-contamination fuel environments fail at this sequence approximately 3–5 times per year in remote mining operations per reported field data. TURBOCORE three-stage redundancy prevents the failure cascade by providing dedicated water removal (Stage 1) before particulate stages.',
        preventedByThisTechnology: true,
      },
    ],

    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority + Quality Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-C-006-v1.0',
      },
    ],
  },

  // ── THERMACORE — Cooling System Filtration ────────────────────────────

  'TECH-THERMACORE': {
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    id: 'TECH-THERMACORE',
    technologyName: 'THERMACORE',
    commercialName: 'THERMACORE™',
    systemDomain: 'Cooling System',
    primaryStandards: ['ASTM D3306', 'ASTM D6210', 'SAE J1941'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',

    canonicalDefinition:
      'THERMACORE is the cooling system protection technology implementing Supplemental Coolant Additive (SCA) filtration and corrosion inhibitor management for diesel engine cooling circuits. It maintains the chemical balance of coolant — glycol concentration, SCA concentration, pH, and inhibitor depletion — that prevents liner pitting, cylinder block corrosion, and heat exchanger fouling.',

    systemContext:
      'Applies to diesel engine cooling circuits in heavy-duty engines where cavitation erosion of wet cylinder liners is a failure mode. Wet liner engines (common in large diesel: >300 kW) require active SCA management throughout the coolant service interval. The THERMACORE element releases SCA additives into the coolant at a controlled rate, replacing depleted inhibitors without requiring drain-and-refill coolant changes.',

    industrialRole:
      'Cavitation erosion of wet cylinder liners is caused by collapse of vapor bubbles formed at liner surfaces during combustion pressure pulses. The liner surface experiences repeated micro-explosive implosion events that remove metal at a rate that can perforate a liner wall in 500–1,000 hours without SCA protection. THERMACORE SCA management maintains the nitrite and molybdate inhibitor concentrations that form protective surface layers on liner surfaces, preventing vapor bubble nucleation. Correct SCA maintenance extends liner service life from 500 hours (unprotected) to engine design life (15,000–20,000 hours).',

    protectionMedia: [
      {
        type: 'SCA release matrix',
        description:
          'Porous media matrix impregnated with measured dose of Supplemental Coolant Additives (nitrites, molybdates, silicates). Coolant flow through the element dissolves SCA at a controlled rate matching depletion rate.',
        micronRating: 'N/A — chemical additive delivery',
        mediaConstruction: 'Compressed fiber matrix with controlled SCA loading per liter of coolant circuit volume',
      },
      {
        type: 'Coolant particulate filter layer',
        description:
          'Secondary particulate filtration layer removing corrosion products and scale particles from the coolant circuit before they deposit in heat exchanger passages.',
        micronRating: '10–20 µm',
        mediaConstruction: 'Cellulose depth medium',
      },
    ],

    engineeringPrincipleIds: ['EP-CHE-001', 'EP-SEP-001'],

    materials: [
      {
        component: 'SCA carrier matrix',
        material: 'Cellulose fiber with SCA impregnation',
        justification:
          'Controlled dissolution rate of SCA from cellulose carrier is governed by coolant flow rate and temperature — both of which are proportional to engine load and coolant depletion rate. Self-regulating release mechanism matches SCA delivery to coolant chemistry demand.',
      },
      {
        component: 'Coolant filter canister',
        material: 'Steel, seam-welded',
        justification:
          'Cooling circuit pressures (0.5–2.0 bar gauge) are lower than oil circuits. Steel canister provides adequate pressure containment with standard automotive/industrial filter manufacturing processes.',
      },
      {
        component: 'Seals',
        material: 'EPDM rubber',
        justification:
          'EPDM compatibility with ethylene glycol/water coolant formulations and SCA chemistry. NBR is not coolant-compatible — EPDM is the correct sealing material for cooling system applications.',
      },
    ],

    construction: [
      {
        feature: 'SCA loading matched to cooling circuit volume',
        description:
          'Each THERMACORE element is specified with SCA loading calculated for a defined cooling circuit volume (typically 20–60 L) to deliver the correct SCA top-up dose over the service interval.',
        engineeringBasis:
          'Over-dosing SCA causes silicate gel precipitation that blocks heat exchanger passages. Under-dosing leaves liner surfaces unprotected. Correct load matching is the critical specification parameter for cooling system protection.',
      },
      {
        feature: 'Bypass valve for SCA delivery confirmation',
        description:
          'Coolant must flow through the THERMACORE element to receive SCA. Bypass valve is set high (above normal circuit operating pressure) so that coolant is directed through the element except under abnormal restriction.',
        engineeringBasis:
          'SCA release requires coolant contact with the carrier matrix. A prematurely opening bypass valve would route coolant around the SCA element, stopping additive delivery while appearing to function normally.',
      },
    ],

    flowDynamics: [
      {
        parameter: 'Coolant circuit flow through element',
        value: 'Cooling circuit-dependent',
        unit: 'L/min through SCA filter',
        standardRef: 'SAE J1941',
      },
      {
        parameter: 'SCA release rate',
        value: 'Matched to circuit volume',
        unit: 'SCA units per 1,000 hours at operating temperature',
        standardRef: 'ASTM D6210',
      },
    ],

    captureMechanisms: [
      {
        contaminantClass: 'Coolant corrosion products (rust, scale)',
        mechanism: 'Depth filtration through cellulose layer',
        efficiency: '>80% at 10 µm',
        particleSizeRange: '10–500 µm',
      },
      {
        contaminantClass: 'Depleted SCA chemistry',
        mechanism: 'Controlled chemical release from SCA carrier matrix',
        efficiency: 'Depletion rate matched by SCA delivery',
        particleSizeRange: 'Molecular',
      },
    ],

    performanceProfile: [
      {
        metric: 'Coolant SCA concentration maintenance',
        value: '0.5–1.0',
        unit: 'SCA units/L at end of service interval',
        evidenceSource: 'ASTM D6210 coolant chemistry analysis at end-of-service',
        standardRef: 'ASTM D6210',
      },
      {
        metric: 'Liner cavitation protection duration',
        value: '500–1,000',
        unit: 'hours per element (circuit volume dependent)',
        evidenceSource: 'SAE J1941 liner pitting test — coolant with maintained SCA vs. depleted SCA',
        standardRef: 'SAE J1941',
      },
    ],

    failureModes: [
      {
        id: 'FM-COOL-001',
        rootCauseChain:
          'SCA depletion below protective threshold → nitrite/molybdate inhibitor concentration insufficient for liner surface passivation → vapor bubble nucleation at liner surface during combustion pressure pulses → cavitation erosion of liner wall → liner perforation → coolant-oil mixing → engine seizure',
        measuredConsequence:
          'Liner perforation rate without SCA: 500–1,000 hours in high-load diesel. Cost: wet liner replacement USD 5,000–25,000 per engine, plus 3–7 day off-service for overhaul.',
        operationalImpact:
          'Fleet operators without THERMACORE SCA management in wet-liner engine fleets report liner perforation as the leading cause of catastrophic engine failure in engines operating beyond 2,000 hours. Correct THERMACORE use eliminates this failure mode to designed engine overhaul intervals.',
        preventedByThisTechnology: true,
      },
    ],

    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority + Quality Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-C-007-v1.0',
      },
    ],
  },

  // ── DRYCORE — Compressed Air Filtration ──────────────────────────────

  'TECH-DRYCORE': {
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    id: 'TECH-DRYCORE',
    technologyName: 'DRYCORE',
    commercialName: 'DRYCORE™',
    systemDomain: 'Compressed Air',
    primaryStandards: ['ISO 8573-1', 'ISO 8573-2', 'ISO 8573-3'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',

    canonicalDefinition:
      'DRYCORE is the compressed air filtration and drying technology implementing multi-stage purification of compressed air to achieve defined purity classes per ISO 8573-1. It removes solid particulate, liquid water aerosols, oil aerosols, and water vapor (dew point control) from compressed air supply lines feeding pneumatic actuators, air-operated tools, painting, food contact, and pharmaceutical process equipment.',

    systemContext:
      'Applies to compressed air distribution systems downstream of the air compressor. ISO 8573-1 defines purity classes for: solid particles (Class 1–9), water (dew point, Class 1–9), and oil content (Class 1–4). Application requirements define the target purity class, which determines the DRYCORE element configuration required. Critical applications: pneumatic valve actuators (Class 3/4/3), breathing air (ISO 8573-1 Class 1/2/1), painting (Class 2/4/2), food contact (Class 1/2/1).',

    industrialRole:
      'Compressed air contamination is the primary cause of pneumatic valve actuator failure, paint defect generation, and compressed air line corrosion. Liquid water carryover in compressed air corrodes pneumatic actuator internals, washes lubricant from O-ring surfaces, and causes water hammer damage to downstream valves. Oil aerosol contamination in painting applications causes adhesion failure. DRYCORE maintains the compressed air purity class required for each downstream application, preventing contamination-induced process failures.',

    protectionMedia: [
      {
        type: 'Coarse particulate pre-filter',
        description:
          'First-stage removal of bulk liquid water, bulk oil droplets, and particles >5 µm. High dirt-holding capacity element protecting downstream precision stages from rapid loading.',
        micronRating: '5 µm (nominal)',
        mediaConstruction: 'Borosilicate glass microfiber, deep-bed construction',
      },
      {
        type: 'Oil aerosol coalescing element',
        description:
          'Coalescing medium targeting oil aerosol droplets 0.01–5 µm and residual water aerosol. Achieves oil content <0.01 mg/m³ (ISO 8573-1 Class 1 oil).',
        micronRating: '0.01 µm oil aerosol',
        mediaConstruction: 'Borosilicate glass microfiber, fine fiber, horizontal coalescing orientation',
      },
      {
        type: 'Activated carbon adsorber (oil vapor)',
        description:
          'Adsorption stage removing residual oil vapor and hydrocarbons not removed by coalescing. Required for food, pharmaceutical, and painting applications.',
        micronRating: 'Molecular',
        mediaConstruction: 'Activated carbon granules in annular cartridge',
      },
      {
        type: 'Desiccant drying stage',
        description:
          'Pressure swing adsorption (PSA) or desiccant bed reducing pressure dew point to -40°C or -70°C for instrument air and breathing air applications.',
        micronRating: 'N/A — vapor phase dew point control',
        mediaConstruction: 'Silica gel or molecular sieve desiccant',
      },
    ],

    engineeringPrincipleIds: ['EP-SEP-001', 'EP-PHS-001', 'EP-CHE-001'],

    materials: [
      {
        component: 'Coalescing filter body',
        material: 'Anodized aluminum or stainless steel (food/pharma)',
        justification:
          'Compressed air systems operate at 7–15 bar. Aluminum housings rated to 16 bar for standard applications; stainless steel for food and pharmaceutical applications requiring steam sterilization.',
      },
      {
        component: 'Desiccant material',
        material: 'Silica gel (dew point to -40°C) or molecular sieve (dew point to -70°C)',
        justification:
          'Silica gel achieves -40°C dew point adequate for most industrial instrument air. Molecular sieve required for breathing air and cryogenic applications requiring -70°C dew point.',
      },
      {
        component: 'Drain valve',
        material: 'Brass or stainless steel with fluoropolymer seats',
        justification:
          'Automatic drain valve removes accumulated liquid from filter bowls. Fluoropolymer seat compatibility with both water and oil condensate.',
      },
    ],

    construction: [
      {
        feature: 'Multi-stage series architecture',
        description:
          'Stages in series: pre-filter → coalescing → carbon adsorber → desiccant. Each stage prepares the air for the next stage.',
        engineeringBasis:
          'Bulk liquid carryover that reaches a coalescing element defeats the fine-fiber coalescing mechanism. Pre-filtration removes bulk liquid before the precision coalescing stage. Carbon adsorber before desiccant prevents oil vapor poisoning the desiccant bed.',
      },
      {
        feature: 'Automatic condensate drain',
        description:
          'Electronic or pneumatically operated drain valve evacuates accumulated condensate from filter bowls on timed or float-actuated cycles.',
        engineeringBasis:
          'Accumulated liquid in filter bowl eventually re-entrains into the air stream under high-velocity flow conditions. Automatic drain prevents bowl level from reaching re-entrainment depth, ensuring continuous separation effectiveness.',
      },
    ],

    flowDynamics: [
      {
        parameter: 'Rated compressed air flow',
        value: 'Model-dependent',
        unit: 'Nm³/h at 7 bar inlet pressure',
        standardRef: 'ISO 8573-1',
      },
      {
        parameter: 'Pressure drop across filter train',
        value: '<0.2',
        unit: 'bar total (clean, multi-stage)',
        standardRef: 'ISO 8573-2',
      },
    ],

    captureMechanisms: [
      {
        contaminantClass: 'Liquid water (droplets)',
        mechanism: 'Coalescing + gravitational settling with automatic drain',
        efficiency: '>99.9% liquid water removal per ISO 8573-2',
        particleSizeRange: '>0.1 µm droplets',
      },
      {
        contaminantClass: 'Oil aerosol (0.01–5 µm)',
        mechanism: 'Coalescing in glass microfiber medium + gravitational drainage',
        efficiency: 'Residual oil <0.01 mg/m³ (ISO 8573-1 Class 1)',
        particleSizeRange: '0.01–5 µm',
      },
      {
        contaminantClass: 'Oil vapor and hydrocarbon gases',
        mechanism: 'Adsorption on activated carbon',
        efficiency: 'Total oil vapor content <0.003 mg/m³ with carbon stage',
        particleSizeRange: 'Molecular',
      },
      {
        contaminantClass: 'Water vapor (humidity)',
        mechanism: 'Adsorption by desiccant — pressure swing or thermal regeneration',
        efficiency: 'Pressure dew point to -40°C (silica) or -70°C (molecular sieve)',
        particleSizeRange: 'Vapor phase',
      },
    ],

    performanceProfile: [
      {
        metric: 'Residual oil content (coalescing stage)',
        value: '<0.01',
        unit: 'mg/m³ (ISO 8573-1 Class 1)',
        evidenceSource: 'ISO 8573-2 aerosol test — downstream oil measurement by photometric method',
        standardRef: 'ISO 8573-2',
      },
      {
        metric: 'Pressure dew point (desiccant stage)',
        value: '-40 to -70',
        unit: '°C pressure dew point',
        evidenceSource: 'ISO 8573-3 dew point measurement at desiccant outlet',
        standardRef: 'ISO 8573-3',
      },
    ],

    failureModes: [
      {
        id: 'FM-AIR-COMP-001',
        rootCauseChain:
          'Liquid water carryover past failed coalescing element → water enters pneumatic actuator → O-ring lubricant washout → actuator seal failure → valve control loss → process shutdown',
        measuredConsequence:
          'Pneumatic actuator O-ring replacement: USD 50–500 per actuator. Plant shutdown during actuator replacement on critical process line: USD 10,000–100,000 per event depending on process.',
        operationalImpact:
          'Industrial plants with unmanaged compressed air quality report 15–30% of pneumatic maintenance events attributable to liquid water carryover. DRYCORE multi-stage filtration maintained at correct service intervals eliminates water-induced actuator failures.',
        preventedByThisTechnology: true,
      },
    ],

    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority + Quality Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-C-008-v1.0',
      },
    ],
  },

  // ── INTEKCORE — Filter Housing Systems ───────────────────────────────

  'TECH-INTEKCORE': {
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    id: 'TECH-INTEKCORE',
    technologyName: 'INTEKCORE',
    commercialName: 'INTEKCORE™',
    systemDomain: 'Filter Housing Systems',
    primaryStandards: ['ISO 4021', 'ISO 23369', 'DIN 24550'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',

    canonicalDefinition:
      'INTEKCORE is the filter housing systems technology providing the structural, hydraulic, and mechanical interface between filtration elements and equipment fluid circuits. It encompasses: high-pressure filter heads, modular filter housings, manifold assemblies, bypass valves, differential pressure indicators, and contamination monitoring integration points. INTEKCORE enables the installation, service, and monitoring of all ELIMFILTERS element technologies across fluid system applications.',

    systemContext:
      'Applies wherever a filtration element must interface with a fluid circuit at defined pressure, flow, and temperature conditions. INTEKCORE housings are the structural layer of the filtration system — the filter element performs the filtration; the housing holds the element in position, maintains seal integrity under operating pressure, routes fluid through the element, and provides service access for element replacement without system contamination.',

    industrialRole:
      'A correctly specified filtration element installed in an incorrectly specified housing is functionally equivalent to no filtration: housing bypass valves calibrated incorrectly defeat element performance; housing seals rated below circuit temperature allow bypass leakage; housings without differential pressure indicators prevent condition-based maintenance. INTEKCORE housing specification is the mechanical prerequisite for element performance — it ensures the element operates within its design conditions and can be serviced without introducing contamination.',

    protectionMedia: [
      {
        type: 'N/A — structural housing system',
        description:
          'INTEKCORE is a housing and manifold system, not a filtration medium. It contains and interfaces the filtration elements of other ELIMFILTERS technologies (MACROCORE, SYNTRAX, NANOFORCE, HYDROCORE, SYNTEPORE, TURBOCORE, DRYCORE).',
        micronRating: 'Defined by installed element technology',
        mediaConstruction: 'Cast aluminum, ductile iron, or stainless steel housing body',
      },
    ],

    engineeringPrincipleIds: ['EP-SEP-001'],

    materials: [
      {
        component: 'Housing body (standard pressure)',
        material: 'Anodized aluminum alloy or ductile cast iron',
        justification:
          'Aluminum: weight advantage for mobile applications (mining trucks, agricultural equipment) where housing mass is relevant. Cast iron: cost-effective for stationary industrial and high-pressure hydraulic applications.',
      },
      {
        component: 'Housing body (high-pressure hydraulic)',
        material: 'Billet aluminum or forged steel',
        justification:
          'Billet or forged construction for housings rated >420 bar (hydraulic line filter). Cast materials have porosity risk at extreme pressures that billet/forged materials do not.',
      },
      {
        component: 'Bypass valve and differential pressure indicator',
        material: 'Stainless steel spring, brass valve body, silicone or FKM O-ring',
        justification:
          'Bypass valve spring calibration is a safety-critical parameter — spring rate must be stable across the operating temperature range. Stainless steel spring provides temperature stability. FKM O-ring for compatibility across fluid types.',
      },
    ],

    construction: [
      {
        feature: 'Calibrated bypass valve',
        description:
          'Spring-loaded bypass valve opens at defined differential pressure (typically 2–16 bar depending on application) to protect against element over-restriction.',
        engineeringBasis:
          'Bypass valve opening pressure is the boundary between two failure modes: below opening pressure (filtration operating), above opening pressure (oil flow maintained but unfiltered). Calibration determines when the second failure mode activates — it must be set above normal operating differential pressure to avoid premature bypass.',
      },
      {
        feature: 'Differential pressure indicator',
        description:
          'Visual pop-up or electrical differential pressure switch indicating when element differential pressure has reached the service limit.',
        engineeringBasis:
          'Condition-based maintenance requires a signal at which maintenance is due. Calendar-based maintenance intervals cannot account for variable contamination loading rates. Differential pressure indication converts the filter housing into a condition-monitoring device.',
      },
      {
        feature: 'Contamination sampling port',
        description:
          'Minimess or equivalent sampling valve port in housing body allows fluid sampling for particle count and cleanliness code analysis without opening the circuit.',
        engineeringBasis:
          'ISO 4406 cleanliness code verification requires fluid samples from the live system. Sampling ports allow representative samples without introducing contamination during the sampling procedure.',
      },
    ],

    flowDynamics: [
      {
        parameter: 'Rated working pressure',
        value: 'Application-specific (10–420 bar)',
        unit: 'bar',
        standardRef: 'ISO 23369',
      },
      {
        parameter: 'Bypass valve calibration pressure',
        value: 'Application-specific (2–16 bar)',
        unit: 'bar differential',
        standardRef: 'DIN 24550',
      },
    ],

    captureMechanisms: [
      {
        contaminantClass: 'N/A — housing provides structural interface',
        mechanism: 'Contamination capture performed by installed element technology',
        efficiency: 'Defined by element technology (MACROCORE, SYNTRAX, NANOFORCE, etc.)',
        particleSizeRange: 'Defined by element technology',
      },
    ],

    performanceProfile: [
      {
        metric: 'Housing rated working pressure',
        value: '10–420',
        unit: 'bar (model dependent)',
        evidenceSource: 'Hydrostatic pressure test per ISO 23369',
        standardRef: 'ISO 23369',
      },
      {
        metric: 'Bypass valve calibration accuracy',
        value: '±10',
        unit: '% of rated opening pressure',
        evidenceSource: 'Differential pressure test per DIN 24550 at ambient temperature',
        standardRef: 'DIN 24550',
      },
    ],

    failureModes: [
      {
        id: 'FM-HSG-001',
        rootCauseChain:
          'Incorrect bypass valve calibration pressure (too low) → bypass opens at normal operating differential pressure → fluid bypasses element at normal flow → no filtration occurs despite element in place → cleanliness target not achieved → equipment component wear',
        measuredConsequence:
          'Incorrect bypass calibration is invisible in field inspection — filter appears installed correctly. Contamination damage accumulates at the rate equivalent to no filtration. Discovery occurs at component failure, not during routine inspection.',
        operationalImpact:
          'INTEKCORE housing specification includes bypass valve calibration verification as a commissioning step. Field-installed housings with incorrect bypass settings are a systemic contamination control failure with no external indicator until component damage occurs.',
        preventedByThisTechnology: true,
      },
    ],

    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority + Quality Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-C-009-v1.0',
      },
    ],
  },

  // ── DURATECH — Fleet Maintenance System ──────────────────────────────

  'TECH-DURATECH': {
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    id: 'TECH-DURATECH',
    technologyName: 'DURATECH',
    commercialName: 'DURATECH™',
    systemDomain: 'Fleet Maintenance',
    primaryStandards: ['ISO 9001', 'ISO 55000', 'SAE JA1012'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',

    canonicalDefinition:
      'DURATECH is the fleet maintenance technology providing consolidated filtration service kits and maintenance interval management for multi-system diesel-powered fleets. It bundles the correct filtration elements for each equipment model (air, fuel, lube oil, hydraulic, cabin) in service-interval-matched kits, with interval specifications derived from field contamination data and OEM service documentation. DURATECH converts the fleet maintenance event from multi-supplier coordination into a single, complete filtration service with verified element compatibility.',

    systemContext:
      'Applies to fleet operators maintaining 5+ diesel-powered units across mining, construction, agriculture, or transport. The DURATECH system addresses the fleet maintenance coordination problem: for each equipment model, the correct combination of filtration elements must be sourced (often from multiple suppliers), verified for compatibility, installed at the correct interval, and tracked for compliance. DURATECH kit consolidation reduces this coordination to a single kit number per equipment model per service event.',

    industrialRole:
      'Fleet maintenance errors — wrong element installed, correct element installed at incorrect interval, element omitted from service event — are a leading cause of preventable equipment failure in large fleets. A wrong-specification hydraulic filter installed at a lube oil change event allows particles to transit the circuit at the wrong filtration rating. An extended-interval kit applied to a machine operating in severe conditions depletes element capacity before the next service. DURATECH kit specifications encode the correct element combination and service interval for each equipment model, making the correct choice the default choice.',

    protectionMedia: [
      {
        type: 'Kit assembly — application-matched elements',
        description:
          'Pre-packaged combination of MACROCORE (air), SYNTRAX (lube oil), NANOFORCE or SYNTEPORE (hydraulic/fuel), HYDROCORE (water separation), and MICROKAPPA (cabin air) elements in the correct specifications for the target equipment model.',
        micronRating: 'Defined by each element technology in the kit',
        mediaConstruction: 'Assembled kit with element compatibility verified against OEM service documentation',
      },
    ],

    engineeringPrincipleIds: ['EP-INS-001'],

    materials: [
      {
        component: 'Kit elements',
        material: 'Per individual element technology specifications',
        justification:
          'DURATECH kit contains the same elements as ordered individually — MACROCORE, SYNTRAX, NANOFORCE, HYDROCORE, SYNTEPORE, MICROKAPPA — in the correct configurations for the target application. Material specifications are inherited from each element technology.',
      },
      {
        component: 'Kit packaging',
        material: 'Corrugated cardboard outer, individual element packaging per element standard',
        justification:
          'Elements shipped in individual packaging to protect sealing surfaces and end caps. Outer kit carton provides single-unit identification (kit number = equipment model + service interval).',
      },
    ],

    construction: [
      {
        feature: 'Model-matched kit specification',
        description:
          'Each DURATECH kit is specified for a single equipment model (or model family with identical filtration requirements). Kit content is determined by cross-referencing OEM service documentation and field-verified element sizes.',
        engineeringBasis:
          'Element specification errors are eliminated by encoding the correct combination at the kit design stage rather than requiring the maintenance technician to cross-reference specifications per element at the service event.',
      },
      {
        feature: 'Service interval designation (Standard / Severe / Extended)',
        description:
          'Three kit variants per equipment model: Standard (normal conditions per OEM), Severe (elevated dust, water, or contamination environments), Extended (condition-monitoring confirmed — only where differential pressure data supports longer interval).',
        engineeringBasis:
          'OEM service intervals are specified for standard operating conditions. Mining, quarrying, and agricultural applications routinely operate in Severe conditions (2–5× higher dust loading) requiring shorter service intervals. Extended intervals require confirmation from differential pressure monitoring data.',
      },
    ],

    flowDynamics: [
      {
        parameter: 'N/A — kit system, not individual element',
        value: 'Per element specifications in kit',
        unit: 'See element technology specifications',
        standardRef: 'SAE JA1012',
      },
    ],

    captureMechanisms: [
      {
        contaminantClass: 'All system contamination classes',
        mechanism: 'Addressed by respective element technology in each kit position',
        efficiency: 'Per element technology specifications (MACROCORE, SYNTRAX, etc.)',
        particleSizeRange: 'Full spectrum — per element specifications',
      },
    ],

    performanceProfile: [
      {
        metric: 'Kit element compatibility rate',
        value: '100',
        unit: '% OEM specification match (per kit design verification)',
        evidenceSource: 'OEM service documentation cross-reference at kit design stage',
        standardRef: 'ISO 55000',
      },
      {
        metric: 'Fleet maintenance event completion time reduction',
        value: '30–50',
        unit: '% reduction vs. per-element sourcing (field observation)',
        evidenceSource: 'Fleet maintenance time study — kit vs. individual element procurement',
        standardRef: 'SAE JA1012',
      },
    ],

    failureModes: [
      {
        id: 'FM-FLEET-001',
        rootCauseChain:
          'Fleet maintenance event using individually sourced elements → element specification error (wrong thread size, wrong bypass pressure, wrong micron rating) → incorrect element installed → filtration system does not perform to specification → contamination damage accumulates undetected until component failure',
        measuredConsequence:
          'Element specification errors are detected only at component failure, not at installation. A wrong-specification hydraulic filter discovered at proportional valve failure (USD 2,000–8,000) required 500–2,000 hours of incorrect filtration to cause the damage.',
        operationalImpact:
          'Large fleet operators (50+ machines) conducting 500–2,000 maintenance events per year experience measurable element specification error rates without kit consolidation. DURATECH eliminates element specification as a maintenance error source.',
        preventedByThisTechnology: true,
      },
    ],

    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority + Quality Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-C-010-v1.0',
      },
    ],
  },

  // ── MARINECLEAN — Marine Diesel & Hydraulic Filtration ───────────────

  'TECH-MARINECLEAN': {
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    id: 'TECH-MARINECLEAN',
    technologyName: 'MARINECLEAN',
    commercialName: 'MARINECLEAN™',
    systemDomain: 'Marine Diesel & Hydraulic',
    primaryStandards: ['IMO MARPOL Annex VI', 'ISO 8217', 'ISO 4406', 'ISO 16889'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',

    canonicalDefinition:
      'MARINECLEAN is the marine diesel and hydraulic filtration technology implementing fuel, lube oil, and hydraulic fluid purification systems for maritime applications. It addresses the contamination challenges specific to marine environments: high-sulfur bunker fuel treatment, seawater ingress into hydraulic circuits, biological growth in stored fuel, and the IMO MARPOL regulatory requirements for marine fuel handling and bilge water oil separation.',

    systemContext:
      'Applies to: main propulsion diesel engines (2-stroke and 4-stroke) on commercial vessels, auxiliary diesel generators, deck hydraulic systems (anchor winches, cargo cranes, hatch actuators), and marine diesel tank storage systems. Marine operating environment introduces contamination sources not present in land applications: seawater exposure of hydraulic deck equipment, high-humidity environments accelerating biological fuel contamination, and MARPOL-regulated discharge limits for oil-in-water separators.',

    industrialRole:
      'Marine diesel engines operating on high-sulfur fuel oil (HFO) or very low sulfur fuel oil (VLSFO) require filtration rated for fuel viscosities of 100–700 cSt (versus 2–4 cSt for automotive diesel). At these viscosities, conventional automotive-rated filters are hydraulically undersized for the required flow rates. MARINECLEAN provides marine-rated fuel purification (heater + centrifuge + precision filtration) scaled to bunker fuel viscosity and flow requirements. Hydraulic deck equipment exposed to seawater contamination requires stainless steel or marine-rated housing materials and elevated bypass valve calibration pressures for cold seawater operation at increased hydraulic fluid viscosity.',

    protectionMedia: [
      {
        type: 'Fuel treatment — high-viscosity medium',
        description:
          'Filtration medium rated for operation at HFO/VLSFO viscosities after pre-heating to operating viscosity (typically 90–130°C fuel temperature for HFO at 380 cSt rated viscosity).',
        micronRating: '10–25 µm (pre-treatment stage)',
        mediaConstruction: 'High-temperature rated synthetic microfiber, open-weave construction for high-viscosity flow',
      },
      {
        type: 'Lube oil purification — centrifuge/filtration combination',
        description:
          'Combined centrifuge separation and depth filtration for marine 2-stroke crosshead engine lube oil. Centrifuge removes water and dense solid particles; filtration captures remaining particulate.',
        micronRating: 'Centrifuge: >5 µm; Filter: >1 µm combined system',
        mediaConstruction: 'Gravity disc centrifuge + borosilicate glass microfiber polishing filter',
      },
      {
        type: 'Bilge water separator — oil removal',
        description:
          'Coalescing medium for removal of oil from bilge water to MARPOL-compliant level (<15 ppm oil in discharged water).',
        micronRating: 'N/A — oil-in-water separation',
        mediaConstruction: 'Hydrophilic coalescing medium with oleophilic collector',
      },
    ],

    engineeringPrincipleIds: ['EP-SEP-001', 'EP-SEP-003', 'EP-PHS-001', 'EP-CHE-001', 'EP-TRB-001'],

    materials: [
      {
        component: 'Housing body (deck hydraulic)',
        material: 'Marine-grade stainless steel (316L) or bronze',
        justification:
          'Deck hydraulic equipment is exposed to salt spray and seawater immersion. Carbon steel housings corrode to structural failure in marine environments within 2–5 years. 316L stainless steel or naval bronze provides 15–25 year service life in marine exposure.',
      },
      {
        component: 'Housing seals (marine environment)',
        material: 'EPDM or fluorocarbon (FKM) depending on fluid type',
        justification:
          'Marine hydraulic systems may use seawater-resistant fire-resistant fluids (phosphate ester or glycol-based). FKM compatibility required for phosphate ester fluids. EPDM for glycol-based fire-resistant fluids.',
      },
      {
        component: 'Fuel filter housing (HFO/VLSFO)',
        material: 'Steel with cataphoretic coating or stainless steel',
        justification:
          'Marine fuel handling areas are Class I Division 1 hazardous areas. Housings must meet ignition protection requirements and corrosion resistance for the humid, salt-laden engine room environment.',
      },
    ],

    construction: [
      {
        feature: 'High-viscosity rated flow path',
        description:
          'Marine fuel filter housings have larger element diameter and shorter pleat depth than automotive equivalents, reducing flow velocity at the high viscosity of preheated HFO/VLSFO.',
        engineeringBasis:
          'Darcy-Weisbach pressure drop equation shows that pressure drop is proportional to dynamic viscosity. HFO at 380 cSt is 190× more viscous than automotive diesel at 2 cSt. Element flow path geometry must be re-scaled accordingly to maintain acceptable pressure drop at rated flow.',
      },
      {
        feature: 'MARPOL bilge separator integration',
        description:
          'Bilge water oil-water separator designed to meet IMO MARPOL Annex I requirements: <15 ppm oil content in overboard discharge, with automatic shutdown if 15 ppm is exceeded.',
        engineeringBasis:
          'MARPOL Annex I Regulation 14 prohibits discharge of oily mixtures exceeding 15 ppm. The 15 ppm Oil Content Monitor (OCM) triggers automatic shut-off valve — not just alarm — ensuring regulatory compliance without operator intervention during discharge operations.',
      },
      {
        feature: 'Cold-climate bypass valve adjustment',
        description:
          'Marine hydraulic housings used in cold-climate operations include adjustable bypass valve calibration for cold-start operations where hydraulic fluid viscosity is elevated.',
        engineeringBasis:
          'At -20°C, hydraulic fluid viscosity may be 5–10× higher than at operating temperature. A bypass valve calibrated for operating viscosity opens immediately at cold start, routing all fluid bypass before the system reaches operating temperature. Cold-climate adjustment prevents cold-start bypass.',
      },
    ],

    flowDynamics: [
      {
        parameter: 'HFO fuel filter rated flow',
        value: 'Vessel-specific',
        unit: 'm³/h at preheated fuel viscosity (25 cSt at filter)',
        standardRef: 'ISO 8217',
      },
      {
        parameter: 'Bilge separator rated flow',
        value: 'Class-required',
        unit: 'm³/h per vessel bilge pump capacity',
        standardRef: 'IMO MARPOL Annex I',
      },
    ],

    captureMechanisms: [
      {
        contaminantClass: 'Bunker fuel particulate (catalytic fines)',
        mechanism: 'Depth filtration at preheated fuel viscosity',
        efficiency: '>95% at 10 µm in preheated HFO',
        particleSizeRange: '10–500 µm',
      },
      {
        contaminantClass: 'Seawater in deck hydraulic oil',
        mechanism: 'Coalescence + gravitational separation in purifier circuit',
        efficiency: '>90% free water removal',
        particleSizeRange: '>10 µm water droplets',
      },
      {
        contaminantClass: 'Oil in bilge water (MARPOL discharge)',
        mechanism: 'Coalescing + oleophilic collection in bilge separator',
        efficiency: 'Discharge <15 ppm per MARPOL Annex I',
        particleSizeRange: '>1 µm oil droplets in water',
      },
    ],

    performanceProfile: [
      {
        metric: 'HFO fuel cleanliness at engine inlet',
        value: 'ISO 4406 17/15/12 (target)',
        unit: 'ISO 4406 code',
        evidenceSource: 'Particle count measurement downstream of MARINECLEAN fuel purification system',
        standardRef: 'ISO 4406',
      },
      {
        metric: 'Bilge water oil content (overboard discharge)',
        value: '<15',
        unit: 'ppm (MARPOL Annex I limit)',
        evidenceSource: 'IMO MEPC.107(49) type approval test — oil content monitor verification',
        standardRef: 'IMO MARPOL Annex I',
      },
    ],

    failureModes: [
      {
        id: 'FM-MAR-001',
        rootCauseChain:
          'Catalytic fines (Al₂O₃ + SiO₂) in HFO above ISO 8217 Class DMB/RMA 10 limit → catalytic fines transit undersized fuel filter → abrasive particles enter fuel injection pump → pump plunger abrasive wear → injection quantity control loss → engine power reduction and fuel system damage',
        measuredConsequence:
          'Main engine fuel injection pump replacement: USD 50,000–300,000. Port repair delay: USD 10,000–100,000 per day of vessel off-hire.',
        operationalImpact:
          'Catalytic fines are the primary fuel-side equipment damage mechanism in heavy fuel oil marine engines. ISO 8217 specifies maximum Al + Si content of 60 mg/kg in RMG grade HFO. MARINECLEAN fuel purification (heater + centrifuge + final filtration) reduces catalytic fines to <10 mg/kg at engine inlet, protecting injection equipment from this failure mode.',
        preventedByThisTechnology: true,
      },
    ],

    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Technology Authority + Quality Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
        edrRef: 'EDR-C-011-v1.0',
      },
    ],
  },

} as const;

// ── Accessor functions ───────────────────────────────────────────────────────

/**
 * Returns all Technology Architectures at a given maturity level.
 * Platform surfaces must only consume Level 3 (PUBLISHED) architectures.
 */
export function getTechArchByMaturity(
  level: number
): TechnologyArchitecture[] {
  return Object.values(TECHNOLOGY_ARCHITECTURES).filter((t) => t.maturity === level);
}

/**
 * Returns the Technology Architecture for a given system domain.
 * Enforces the authoritative technology-domain mapping.
 */
export function getTechArchByDomain(domain: string): TechnologyArchitecture | undefined {
  return Object.values(TECHNOLOGY_ARCHITECTURES).find((t) => t.systemDomain === domain);
}

/**
 * Returns Technology Architectures that implement a given Engineering Principle.
 */
export function getTechArchByPrinciple(principleId: string): TechnologyArchitecture[] {
  return Object.values(TECHNOLOGY_ARCHITECTURES).filter((t) =>
    t.engineeringPrincipleIds.includes(principleId)
  );
}
