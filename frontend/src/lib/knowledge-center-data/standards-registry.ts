/**
 * standards-registry.ts
 * ELIMFILTERS Knowledge Center — Standards Data Registry
 *
 * Phase 5C: Standards Library Expansion
 * 22 canonical engineering standards. Every standard is a first-class graph entity
 * with permanent ID, issuing body metadata, revision status, and full relationship
 * edges to systems, technologies, glossary terms, and articles.
 *
 * Dependency: ./types (KCStandard)
 * Consumed by: knowledge-center/navigation-index.ts
 *
 * Rules:
 *   - entityId must match the corresponding STANDARD_IDS key in entity-ids.ts
 *   - relatedGlossaryTerms must reference valid TERM-xxx permanent IDs
 *   - applicableSystems must reference valid SYSTEM_IDS slugs
 *   - relatedTechnologies use display names with ™ symbol (e.g. 'MACROCORE™')
 *   - parentStandard / childStandards use STD-xxx permanent IDs
 */

import type { KCStandard } from './types';

// ─── STANDARDS REGISTRY ────────────────────────────────────────────────────────

export const KC_STANDARDS: KCStandard[] = [

  // ── HYDRAULIC & LUBRICATION FILTER PERFORMANCE ────────────────────────────

  {
    slug: 'iso-16889',
    code: 'ISO 16889',
    entityId: 'STD-ISO-16889',
    title: 'Hydraulic Fluid Power — Multi-Pass Method for Evaluating Filter Element Performance',
    issuingOrganization: 'ISO (International Organization for Standardization)',
    year: '2022 (4th edition)',
    revisionStatus: 'active',
    metaDescription: 'ISO 16889 defines the multi-pass test method for hydraulic and lubrication filter elements, establishing Beta ratio, dirt holding capacity, and performance classification methodology.',
    scope: 'Hydraulic and lubrication filter elements used in hydraulic fluid power systems.',
    engineeringPurpose: 'Provides the sole global standardised test method for measuring hydraulic and lubrication filter element efficiency (Beta ratio) and capacity (dust holding capacity), enabling direct cross-manufacturer performance comparability under fully reproducible laboratory conditions. ISO 16889 is the reference standard for all ELIMFILTERS fluid filter qualification.',
    sections: [
      {
        heading: 'What ISO 16889 Measures',
        body: 'ISO 16889 defines the multi-pass method for evaluating the filtration ratio (Beta ratio) and dirt-holding capacity of hydraulic filter elements. The Beta ratio (βx) quantifies a filter\'s efficiency at a specific particle size: β10(c) = 200 means the filter captures 200 contaminated particles per 1 clean particle that passes through at the 10 µm(c) size — equivalent to 99.5% efficiency at that size. The cleanliness code produced by ISO 16889-based testing uses three Range Numbers representing particle counts per millilitre at >4 µm, >6 µm, and >14 µm thresholds. A code of 16/14/11 means: up to 320 particles >4 µm, up to 80 particles >6 µm, and up to 10 particles >14 µm per mL. Particle counting must be performed with an automatic particle counter (APC) calibrated to ISO 11171 using NIST-traceable calibration fluid — this eliminated inter-laboratory variation that existed under older ISO 4406 manual counting methods.',
      },
      {
        heading: 'Test Methodology',
        body: 'Contaminated test fluid (ISO VG 15 mineral oil at 60°C) containing ISO A2 medium test dust is circulated through the filter element at rated flow. Automatic particle counters (calibrated per ISO 11171) measure particle concentrations upstream and downstream simultaneously. Counts at ≥4, ≥6, ≥10, ≥14, ≥21, and ≥38 µm provide Beta values across the capture range. The test continues until terminal differential pressure (typically 6 bar) is reached.',
      },
      {
        heading: 'Beta Ratio Interpretation',
        body: 'Beta ratio (β) at a given particle size is the ratio of upstream to downstream particle count at that size. β₆(c) = 200 indicates that for every 200 particles >6 µm upstream, one particle exits downstream — 99.5% efficiency. The "(c)" suffix confirms ISO 11171 calibrated counting. Beta values vary continuously throughout the test as the element loads with contaminant; the reported value is the filtration ratio averaged over the test.',
      },
      {
        heading: 'Why It Matters for Industrial Filtration',
        body: 'ISO 16889 is the foundational measurement standard for specifying and verifying hydraulic system cleanliness. Without it, there is no consistent way to define what "clean enough" means for a specific hydraulic circuit, or to verify that a filter element actually performs as specified. The standard enables engineers to: (1) specify target cleanliness codes for each circuit based on the most sensitive component (e.g., ISO 16/14/11 for proportional valves with 1–4 µm spool clearances); (2) select filter elements with Beta ratios proven to achieve those targets; (3) verify actual fluid condition through periodic oil analysis. Particle contamination is responsible for 70–80% of hydraulic system failures. ISO 16889 provides the measurement framework that transforms contamination control from a qualitative guideline into a verifiable engineering specification.',
      },
      {
        heading: 'Cleanliness Codes for Common Hydraulic Systems',
        body: 'Target cleanliness codes vary by component sensitivity. Proportional and servo control valves (spool clearances 1–4 µm): ISO 16/14/11 or 15/13/10. Pressure-compensated variable displacement pumps: ISO 17/15/12. Standard directional control valves: ISO 18/16/13. Hydraulic cylinders and motors: ISO 19/17/14. Return line and reservoir circuits: ISO 20/18/15. These targets are derived from empirical wear data: maintaining 16/14/11 in a servo system extends valve spool life by 3–5× compared to uncontrolled contamination at 20/18/15. Filter selection must account for the system\'s highest-pressure circuit, the most sensitive component, and the expected ingression rate from ambient contamination, system wear particles, and new oil contamination. New oil from drums typically measures ISO 21/19/16 — it must be filtered before use if the system target is tighter than 20/18/15.',
      },
      {
        heading: 'What is the difference between ISO 4406 and ISO 16889?',
        body: 'ISO 4406 defined the Range Number cleanliness code system. ISO 16889 defines how to measure the fluid to arrive at that code — specifically the multi-pass filter test, the Beta ratio measurement protocol, and the requirement for automatic particle counters calibrated to ISO 11171. The cleanliness code format is identical: both use three Range Numbers at 4 µm, 6 µm, and 14 µm. The difference is measurement precision: ISO 4406 permitted manual microscopic counting that varied between laboratories; ISO 16889 mandated calibrated APCs that produce consistent, reproducible results. When a service manual specifies "ISO 4406 18/16/13," the numbers mean exactly the same as "ISO 16889 18/16/13."',
      },
      {
        heading: 'How often should fluid cleanliness be measured?',
        body: 'Measurement frequency depends on system criticality and operating environment. Servo and proportional valve systems in clean environments: quarterly or every 500 operating hours. Mobile construction equipment in dusty environments: every 250 hours or when filter differential pressure indicators signal approaching bypass. Fixed industrial systems with continuous monitoring: inline particle counters can provide real-time cleanliness data. After maintenance events (filter change, seal replacement, component repair): always sample before returning to service to confirm the circuit was not contaminated during maintenance. Oil analysis programs typically combine particle counting (ISO 16889), water content (Karl Fischer per ASTM D6304), and wear metal spectrometry (ICP-OES) to provide a complete picture of fluid condition.',
      },
      {
        heading: 'What does "absolute" versus "nominal" filtration rating mean?',
        body: '"Absolute" filtration rating means the filter achieves a specified Beta ratio at the stated particle size: a 10 µm absolute filter has β10(c) ≥ 200 (99.5% efficiency). "Nominal" ratings are not standardised and carry no guaranteed efficiency — a filter marked "10 µm nominal" might allow 30–50% of 10 µm particles to pass in service. ISO 16889 only recognises Beta ratio values as valid efficiency descriptors. When specifying replacement filter elements, always request the manufacturer\'s ISO 16889 test report with Beta ratio data, not just a nominal micron rating. Nominal ratings are a legacy marketing convention with no engineering basis under modern filtration standards.',
      },
    ],
    keyParams: [
      { label: 'Test fluid', value: 'ISO VG 15 mineral oil' },
      { label: 'Test temperature', value: '60 ± 2°C' },
      { label: 'Test dust', value: 'ISO A2 medium (ISO 12103-1)' },
      { label: 'Particle counter calibration', value: 'ISO 11171' },
      { label: 'Terminal ΔP', value: 'Typically 6 bar' },
    ],
    applicableSystems: ['lubrication-protection', 'hydraulic-protection'],
    relatedGlossaryTerms: [
      'TERM-BETA-RATIO', 'TERM-ABSOLUTE-EFFICIENCY', 'TERM-MULTI-PASS-TEST',
      'TERM-DIFFERENTIAL-PRESSURE', 'TERM-TEST-DUST', 'TERM-DUST-HOLDING-CAPACITY',
      'TERM-COLLAPSE-PRESSURE', 'TERM-NOMINAL-EFFICIENCY',
    ],
    relatedTopics: ['contamination-control', 'filter-media-science', 'fluid-cleanliness'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™'],
    relatedArticles: ['iso-16889', 'iso-16889-multipass-test', 'beta-ratio', 'filter-media-engineering', 'testing-and-validation'],
    commonMistakes: [
      'Confusing Beta ratio with percentage efficiency: β₁₀(c) = 200 means 99.5% efficiency, not 200% — the ratio is upstream count ÷ downstream count, not a percentage.',
      'Specifying nominal micron ratings instead of Beta values from ISO 16889 test reports. Nominal ratings carry no guaranteed efficiency under ISO 16889 and are not valid engineering specifications.',
      'Using the Beta ratio at a single particle size as the sole filter selection criterion. Dirt-holding capacity and collapse pressure are equally critical for field performance and service life.',
      'Assuming ISO 16889 test results apply at all flow rates. The standard specifies rated flow conditions — Beta ratio degrades at elevated flow and improves at reduced flow.',
    ],
  },

  {
    slug: 'iso-4406',
    code: 'ISO 4406',
    entityId: 'STD-ISO-4406',
    title: 'Hydraulic Fluid Power — Method for Coding the Level of Contamination by Solid Particles',
    issuingOrganization: 'ISO (International Organization for Standardization)',
    year: '2021 (3rd edition)',
    revisionStatus: 'active',
    metaDescription: 'ISO 4406 defines the particle contamination coding system for hydraulic and lubrication fluids, establishing cleanliness codes used to specify and verify target contamination levels.',
    scope: 'Hydraulic fluids, lubrication oils, and other industrial fluids requiring cleanliness specification.',
    engineeringPurpose: 'Establishes the universal particle contamination coding system for hydraulic and lubrication fluids — providing a common language for cleanliness specification, measurement verification, and contamination control target-setting across all OEM and aftermarket filtration applications.',
    sections: [
      {
        heading: 'What ISO 4406 Measures',
        body: 'ISO 4406 classifies particle contamination in hydraulic and lubricating fluids using a two- or three-number cleanliness code. Each number in the code is a Range Number corresponding to a particle count threshold per millilitre: the first number covers particles larger than 4 µm, the second covers particles larger than 6 µm, and a third number (when included) covers particles larger than 14 µm. Range Numbers are logarithmic: Range Number 18 means a maximum of 1,300 particles per mL; Range Number 16 means a maximum of 320 particles per mL. Each increment of one Range Number represents a doubling of the particle count. A code such as 18/16/13 means the fluid contains up to 1,300 particles >4 µm, up to 320 particles >6 µm, and up to 40 particles >14 µm per millilitre of fluid. The 4 µm channel captures the fine contamination that causes the most damage to tight-tolerance components; the 14 µm channel captures larger wear debris indicating ongoing component damage.',
      },
      {
        heading: 'Industrial Application',
        body: 'ISO 4406 codes appear in OEM service manuals, hydraulic component datasheets, and oil analysis laboratory reports. When a hydraulic system specifies a target cleanliness of ISO 4406 16/14/11, it defines the maximum allowable particle concentrations at which the system will operate without accelerated wear. Proportional control valves with spool clearances of 1–4 µm require target codes of 16/14/11 or tighter; industrial hydraulic cylinders typically specify 18/16/13. Particle counters calibrated to ISO 11171 measure fluid samples and report the code automatically. Oil analysis programs use ISO 4406 codes to trend contamination over time — a shift from 16/14/11 to 18/16/13 indicates contamination ingress or filter degradation and triggers maintenance action before component failure occurs.',
      },
      {
        heading: 'Measurement Methods',
        body: 'Particle counts are measured by automatic particle counter (APC) using light obscuration, calibrated per ISO 11171 using NIST-traceable PSL reference particles. Alternatively, microscopic counting (patch test, ISO 11500) provides confirmation. Sample collection, handling, and bottle cleanliness requirements are specified to prevent sample contamination from invalidating results.',
      },
      {
        heading: 'Relationship to ISO 16889',
        body: 'ISO 4406 predates ISO 16889 and used slightly different counting methods, which created measurement inconsistencies between laboratories. ISO 16889 (published 1999, revised 2022) standardised the multi-pass filter test methodology and the automatic particle counter calibration protocol under ISO 11171, replacing the earlier manual counting methods that ISO 4406 permitted. Modern equipment specifications typically reference ISO 16889 cleanliness codes rather than ISO 4406 codes, but the Range Number framework and the 4 µm / 6 µm / 14 µm particle size channels are identical. Legacy equipment built before 2000 frequently specifies ISO 4406 two-number codes such as 18/16; these translate directly to ISO 16889 codes by adding the 14 µm channel: 18/16 is approximately equivalent to 18/16/13. Equipment operating under legacy ISO 4406 specifications can still be monitored using modern particle counters reporting ISO 16889 codes — the numerical values are compatible.',
      },
      {
        heading: 'What does an ISO 4406 code of 18/16 mean?',
        body: 'ISO 4406 18/16 means the fluid contains: up to 1,300 particles larger than 4 µm per mL (Range Number 18 = 640–1,300 particles/mL) and up to 320 particles larger than 6 µm per mL (Range Number 16 = 160–320 particles/mL). This is a relatively contaminated condition typically acceptable for low-pressure return lines and reservoirs, but not for servo valves or pump circuits. For comparison, a clean hydraulic servo system typically targets 16/14 (up to 320 particles >4 µm / up to 80 particles >6 µm per mL).',
      },
      {
        heading: 'Why do some hydraulic systems still specify ISO 4406 codes?',
        body: 'Many legacy systems, imported machines, and OEM service manuals written before 2000 reference ISO 4406 codes. Maintenance teams working on these systems encounter two-number codes (e.g., 18/16) without a 14 µm channel. This is fully compatible with modern ISO 16889-based oil analysis — modern particle counters report all three channels automatically. A legacy ISO 4406 18/16 specification means the third channel (14 µm) was not originally measured; when monitoring the system today, target 18/16/13 or tighter. The 14 µm channel provides early warning of catastrophic wear events that the two-channel code would miss.',
      },
      {
        heading: 'What particle counter should be used to measure ISO 4406 cleanliness?',
        body: 'Automatic optical particle counters (OPCs) calibrated to ISO 11171 using NIST-traceable AC Fine Test Dust (ACFTD) reference material are the required measurement instrument. Older manual counting methods (light microscopy on filter membranes) are no longer acceptable for ISO 16889 reporting but may still appear in older ISO 4406 procedures. For field sampling, bottles must be clean to ISO 4406 14/12/10 or better and filled under clean conditions to prevent sampling contamination. Sample volume is typically 10–100 mL. Laboratory results report Range Numbers for each particle size channel; counts are corrected for background contamination per ISO 11171 procedures.',
      },
    ],
    keyParams: [
      { label: 'Count sizes', value: '≥4 µm(c), ≥6 µm(c), ≥14 µm(c)' },
      { label: 'Count unit', value: 'Particles per mL' },
      { label: 'Code range per number', value: '2× range (doubling)' },
      { label: 'APC calibration', value: 'ISO 11171' },
    ],
    applicableSystems: ['lubrication-protection', 'hydraulic-protection'],
    relatedGlossaryTerms: [
      'TERM-ISO-CLEANLINESS-CODE', 'TERM-PARTICLE-COUNT', 'TERM-NAS-CLEANLINESS-CODE',
      'TERM-BETA-RATIO', 'TERM-SERVO-VALVE', 'TERM-PROPORTIONAL-VALVE',
    ],
    relatedTopics: ['contamination-control', 'fluid-cleanliness', 'filter-media-science'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™'],
    relatedArticles: ['iso-4406', 'fluid-cleanliness', 'hydraulic-contamination-sensitivity', 'contamination-sensitivity-components'],
    commonMistakes: [
      'Reading cleanliness codes as absolute particle counts: ISO 4406 Range Numbers are logarithmic, not linear. Range Number 18 means up to 1,300 particles/mL — not 18 particles.',
      'Specifying only two-channel codes (e.g., 18/16) for modern servo systems. ISO 4406 three-channel codes (4 µm / 6 µm / 14 µm) are required for complete contamination characterisation.',
      'Treating the cleanliness code as a target rather than a maximum allowable limit. The code defines the worst acceptable condition — not the operating setpoint.',
      'Confusing ISO 4406 (the coding method) with ISO 16889 (the multi-pass test method). ISO 4406 defines how to express the result; ISO 16889 defines how to measure it.',
    ],
  },

  {
    slug: 'nas-1638',
    code: 'NAS 1638',
    entityId: 'STD-NAS-1638',
    title: 'Cleanliness Requirements for Parts Used in Hydraulic Systems',
    issuingOrganization: 'AIA (Aerospace Industries Association)',
    year: '1964 (with subsequent amendments)',
    revisionStatus: 'active',
    metaDescription: 'NAS 1638 defines particle contamination cleanliness classes for hydraulic system components and fluids, widely used in aerospace, defense, and industrial hydraulics applications.',
    scope: 'Hydraulic system components and fluids in aerospace, defense, and industrial applications.',
    engineeringPurpose: 'Predecessor hydraulic cleanliness classification standard developed for US aerospace hydraulic systems; provides the legacy single-number class framework still required in aerospace, defense, and industrial equipment documentation where OEM specifications have not migrated to ISO 4406.',
    sections: [
      {
        heading: 'NAS vs ISO 4406',
        body: 'NAS 1638 was the predecessor standard for hydraulic cleanliness specification, developed by the National Aerospace Standards committee. It uses a single-number class system (Class 00 to Class 12) based on particle counts at five size ranges: 5–15, 15–25, 25–50, 50–100, and >100 µm. NAS 1638 Class 6 is approximately equivalent to ISO 4406 17/15/12. ISO 4406 has largely superseded NAS 1638 in industrial applications but NAS 1638 remains in use in aerospace and defense specifications.',
      },
      {
        heading: 'Class Definitions',
        body: 'NAS 1638 classes define the maximum particle count per 100 mL at each size range. Class 6: 5–15 µm = 32,000; 15–25 µm = 5,700; 25–50 µm = 1,012; 50–100 µm = 180; >100 µm = 32. Class 4: 5–15 µm = 8,000; 15–25 µm = 1,425; 25–50 µm = 253; 50–100 µm = 45; >100 µm = 8. Lower class numbers indicate higher cleanliness.',
      },
    ],
    keyParams: [
      { label: 'Class range', value: 'Class 00 to Class 12' },
      { label: 'Size ranges', value: '5–15, 15–25, 25–50, 50–100, >100 µm' },
      { label: 'Count unit', value: 'Particles per 100 mL' },
      { label: 'NAS 6 ≈ ISO equivalent', value: 'ISO 17/15/12' },
    ],
    applicableSystems: ['hydraulic-protection'],
    relatedGlossaryTerms: ['TERM-NAS-CLEANLINESS-CODE', 'TERM-ISO-CLEANLINESS-CODE', 'TERM-PARTICLE-COUNT'],
    relatedTopics: ['fluid-cleanliness', 'contamination-control'],
    relatedTechnologies: ['NANOFORCE™'],
    relatedArticles: ['fluid-cleanliness', 'hydraulic-contamination-sensitivity', 'nfpa-t2-14-hydraulic-cleanliness'],
    commonMistakes: [
      'Treating NAS 1638 Class numbers and ISO 4406 Range Numbers as directly interchangeable. Different measurement bases and particle size channels make conversion approximate, not equivalent.',
      'Applying NAS 1638 targets to modern servo and proportional valve systems specified to ISO 4406 without formal conversion verification. Clearance tolerance differences make direct substitution unsafe.',
      'Using NAS 1638 for aerospace hydraulic system maintenance monitoring where the applicable standard is now SAE AS4059 in most OEM documentation.',
    ],
  },

  {
    slug: 'iso-11171',
    code: 'ISO 11171',
    entityId: 'STD-ISO-11171',
    title: 'Hydraulic Fluid Power — Calibration of Automatic Particle Counters for Liquids',
    issuingOrganization: 'ISO (International Organization for Standardization)',
    year: '2016',
    revisionStatus: 'active',
    metaDescription: 'ISO 11171 defines calibration methodology for automatic particle counters used in hydraulic and lubrication fluid analysis, establishing the basis for traceable ISO 4406 cleanliness measurements.',
    scope: 'Automatic particle counters (APC) used for particle counting in hydraulic and lubrication fluids.',
    engineeringPurpose: 'Specifies the calibration procedure for automatic particle counters using NIST-traceable reference particles, ensuring that ISO 4406 cleanliness code measurements and ISO 16889 Beta ratio results are reproducible across instruments, laboratories, and countries — the metrological foundation of the entire fluid cleanliness system.',
    sections: [
      {
        heading: 'Calibration Basis',
        body: 'ISO 11171 uses NIST-traceable polystyrene latex (PSL) reference particles to calibrate automatic particle counters for liquid particle counting. The calibration establishes size thresholds and count accuracy across the instrument\'s measurement range. ISO 11171 calibration is required for ISO 4406(c) reporting — the "(c)" suffix in Beta ratio notation (e.g., β₆(c)) confirms that particle counts were obtained with ISO 11171 calibrated equipment.',
      },
      {
        heading: 'Historical Context',
        body: 'Before ISO 11171, particle counters were calibrated using AC fine test dust — a natural mineral dust with variable optical properties. Different instruments calibrated with AC fine test dust gave inconsistent results at the same actual particle size. ISO 11171 PSL calibration eliminated this variability, enabling valid comparison of particle count data across instruments, laboratories, and manufacturers. The transition from β to β(c) notation reflects this change.',
      },
    ],
    keyParams: [
      { label: 'Reference material', value: 'NIST-traceable PSL particles' },
      { label: 'Notation suffix', value: '(c) = ISO 11171 calibrated' },
      { label: 'Calibration verification', value: 'NIST SRM 1003c reference material' },
    ],
    applicableSystems: ['lubrication-protection', 'hydraulic-protection'],
    relatedGlossaryTerms: ['TERM-PARTICLE-COUNT', 'TERM-ISO-CLEANLINESS-CODE', 'TERM-MULTI-PASS-TEST', 'TERM-BETA-RATIO'],
    relatedTopics: ['fluid-cleanliness', 'testing-and-validation', 'contamination-control'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™'],
    relatedArticles: ['iso-11171-particle-counting', 'fluid-cleanliness', 'oil-analysis-methods', 'testing-and-validation'],
    commonMistakes: [
      'Operating automatic particle counters without verifying ISO 11171 calibration status. APC calibration drift causes systematic errors that invalidate cleanliness code comparisons between service intervals.',
      'Comparing particle count results from APCs using different calibration fluids or PSL reference standards. ISO 11171 requires NIST SRM 1003c — instruments calibrated to other standards produce non-comparable results.',
      'Using light obscuration APCs for fluids with additives that cause optical absorption (e.g., dark gear oils). ISO 11171 specifies the applicable fluid types — non-conforming fluids require alternative counting methods.',
    ],
  },

  {
    slug: 'nfpa-t2-14',
    code: 'NFPA T2.14',
    entityId: 'STD-NFPA-T2-14',
    title: 'Fluid Power Systems — Hydraulic Filters — Method for Verifying Collapse/Burst Resistance',
    issuingOrganization: 'NFPA (National Fluid Power Association)',
    year: '2005',
    revisionStatus: 'active',
    metaDescription: 'NFPA T2.14 specifies test methods for verifying the structural integrity of hydraulic filter elements under differential pressure, defining collapse and burst resistance ratings for high-pressure hydraulic applications.',
    scope: 'Test methods for verifying collapse pressure rating and burst resistance of hydraulic filter elements operating in high-pressure hydraulic systems.',
    engineeringPurpose: 'Provides structural integrity verification test methodology for hydraulic filter elements in high-pressure applications, ensuring collapse pressure margins that prevent catastrophic contamination release events during differential pressure transients and cold-start conditions.',
    sections: [
      {
        heading: 'Collapse and Burst Testing',
        body: 'NFPA T2.14 specifies the test methodology for verifying hydraulic filter element structural integrity by measuring collapse pressure (failure under differential pressure from the upstream side) and burst pressure (failure from downstream positive pressure). NFPA T2.14-qualified elements specify collapse ratings greater than 10× the nominal operating differential pressure and burst ratings greater than 2× the collapse rating. These margins accommodate hydraulic system cold-start transients and end-of-life differential pressures without structural failure.',
      },
      {
        heading: 'Complementary Role with ISO 16889',
        body: 'NFPA T2.14 is a structural integrity standard that operates alongside ISO 16889 (filtration efficiency) and ISO 4406 (cleanliness code targets). A hydraulic filter element requires both: ISO 16889 Beta efficiency to demonstrate particle capture performance, and NFPA T2.14 collapse/burst ratings to demonstrate structural survival under the differential pressures encountered in high-pressure hydraulic systems. NANOFORCE™ elements satisfy both standards for construction and mining applications operating at 200–350 bar.',
      },
      {
        heading: 'Failure Mode Prevention',
        body: 'Filter element collapse is a critical failure mode: when a loaded element collapses under excess differential pressure, accumulated contamination is released into the downstream hydraulic circuit — converting a controlled contamination state into a contamination surge event affecting proportional valves, servo valves, and actuators. Structural integrity testing per NFPA T2.14 prevents this failure mode by verifying adequate collapse pressure margin before installation.',
      },
    ],
    keyParams: [
      { label: 'Collapse rating minimum', value: '>10× operating differential pressure' },
      { label: 'Burst rating minimum', value: '>2× collapse rating' },
      { label: 'Servo valve minimum cleanliness', value: 'ISO 15/13/10' },
      { label: 'Proportional valve minimum', value: 'ISO 16/14/11' },
    ],
    applicableSystems: ['hydraulic-protection'],
    relatedGlossaryTerms: [
      'TERM-ISO-CLEANLINESS-CODE', 'TERM-PARTICLE-COUNT', 'TERM-SERVO-VALVE',
      'TERM-PROPORTIONAL-VALVE', 'TERM-COLLAPSE-PRESSURE', 'TERM-ELEMENT-COLLAPSE',
      'TERM-DIFFERENTIAL-PRESSURE',
    ],
    relatedTopics: ['contamination-control', 'fluid-cleanliness', 'testing-and-validation'],
    relatedTechnologies: ['NANOFORCE™'],
    relatedArticles: ['nfpa-t2-14-hydraulic-cleanliness', 'fluid-cleanliness', 'hydraulic-contamination-sensitivity', 'filter-element-integrity'],
    commonMistakes: [
      'Applying a single cleanliness target across all hydraulic circuits without distinguishing component sensitivity. Servo valves require ISO 16/14/11; cylinders only need ISO 19/17/14 — over-specifying increases filtration cost without benefit.',
      'Not accounting for ingression rates in mobile equipment when selecting target cleanliness codes. NFPA T2.14 targets designed for closed industrial systems may be unachievable in open-cab excavators without sealed reservoirs.',
      'Treating T2.14 cleanliness specifications as applicable to fluid at rest rather than during active operation. Dynamic ingression from rod seals and breathers raises in-service contamination above static measurements.',
    ],
  },

  {
    slug: 'din-51524',
    code: 'DIN 51524',
    entityId: 'STD-DIN-51524',
    title: 'Hydraulic Fluids — Minimum Requirements (HL, HLP, HVLP Classifications)',
    issuingOrganization: 'DIN (Deutsches Institut für Normung)',
    year: 'Active (multi-part)',
    revisionStatus: 'active',
    metaDescription: 'DIN 51524 specifies minimum performance requirements for hydraulic and lube oils in HL, HLP, and HVLP classifications — the German standard for lubricant compatibility with filtration media and hydraulic system components.',
    scope: 'Hydraulic and lube oil performance classification for industrial and mobile equipment — engine lube circuits, hydraulic power circuits, and industrial gear lubrication.',
    engineeringPurpose: 'Defines the composition and performance classification (HL/HLP/HVLP) for hydraulic and lubricating oils, ensuring that filter media chemical compatibility and anti-wear additive protection are maintained across the full service interval in both European and global equipment platforms.',
    sections: [
      {
        heading: 'Classification System (HL / HLP / HVLP)',
        body: 'DIN 51524 defines three hydraulic oil performance classifications. Part 1 (HL): rust and oxidation inhibited — basic protection for low-demand applications. Part 2 (HLP): adds anti-wear additives for pump and proportional valve protection — the most common specification for mobile equipment hydraulics. Part 3 (HVLP): high-viscosity index hydraulic oil with viscosity stability across wide temperature ranges, specified for equipment operating from arctic to tropical conditions where cold-start and hot-running viscosity stability is critical.',
      },
      {
        heading: 'Relevance to Filtration Media Compatibility',
        body: 'Filtration media must be chemically compatible with DIN 51524 fluids — particularly the additive packages in HLP and HVLP class oils. Incompatible media can cause additive stripping (depleting anti-wear protection) or media degradation (reducing filtration efficiency over the service interval). SYNTRAX™ lube oil filter elements are qualified for compatibility with DIN 51524 HLP and HVLP class fluids, ensuring no media degradation or additive interaction under normal operating conditions. Compatibility verification is required when switching lubricant brands or formulations within the DIN 51524 classification system.',
      },
      {
        heading: 'Relationship to ISO Cleanliness Standards',
        body: 'DIN 51524 defines fluid composition quality; ISO 4406 defines particle contamination cleanliness codes. Both apply simultaneously in lube oil and hydraulic systems — the fluid must meet DIN 51524 composition requirements while the particle contamination level must meet ISO 4406 cleanliness targets (16/14/11 for system-approach engine lubrication; 17/15/12 for hydraulic circuits). A correctly specified DIN 51524 fluid with inadequate filtration will still fail contamination targets; a correctly filtered fluid using a non-compliant lubricant will compromise component anti-wear protection.',
      },
    ],
    keyParams: [
      { label: 'HL class', value: 'Rust and oxidation inhibited — basic protection' },
      { label: 'HLP class', value: 'Anti-wear additives — most common mobile equipment specification' },
      { label: 'HVLP class', value: 'High-viscosity index — wide temperature range applications' },
      { label: 'Compatibility check', value: 'Required when changing lubricant brand or formulation' },
    ],
    applicableSystems: ['hydraulic-protection', 'lubrication-protection'],
    relatedGlossaryTerms: ['TERM-VISCOSITY', 'TERM-VISCOSITY-INDEX', 'TERM-OXIDATIVE-DEGRADATION', 'TERM-ISO-CLEANLINESS-CODE'],
    relatedTopics: ['fluid-cleanliness', 'contamination-control'],
    relatedTechnologies: ['SYNTRAX™', 'NANOFORCE™'],
    relatedArticles: ['lubrication-system-filtration', 'contamination-control', 'fluid-cleanliness'],
    commonMistakes: [
      'Selecting HLP grade mineral oil for hydraulic systems requiring HM specification. HM fluids add anti-wear additives for high-pressure pump protection — substituting HLP in HM-specified systems increases pump wear.',
      'Choosing hydraulic fluid viscosity grade based only on ambient temperature without considering operating pressure and pump type. High-pressure axial piston pumps require higher viscosity than gear pumps at the same temperature.',
      'Mixing DIN 51524 fluid classifications (HL, HLP, HVLP) in the same system. Additive package incompatibility can cause foaming, emulsification, and seal degradation.',
    ],
  },

  // ── AIR INTAKE ─────────────────────────────────────────────────────────────

  {
    slug: 'iso-5011',
    code: 'ISO 5011',
    entityId: 'STD-ISO-5011',
    title: 'Inlet Air Cleaning Equipment — Performance Testing of Air Filters for Internal Combustion Engines and Compressors',
    issuingOrganization: 'ISO (International Organization for Standardization)',
    year: '2014',
    revisionStatus: 'active',
    metaDescription: 'ISO 5011 defines performance test methods for air filters used in internal combustion engines and compressors, covering efficiency, restriction, and dust holding capacity.',
    scope: 'Air filters for internal combustion engines, gas turbines, and compressors.',
    engineeringPurpose: 'Provides standardised test methodology for air intake filter gravimetric efficiency and dust holding capacity, enabling performance comparison across air filter manufacturers for engine intake protection in on-road, off-road, agricultural, and industrial applications.',
    sections: [
      {
        heading: 'What ISO 5011 Tests',
        body: 'ISO 5011 defines the test methods for measuring the performance of air intake filter elements used in internal combustion engines and compressors. The standard specifies three principal test procedures: (1) Initial efficiency test — measures the filter\'s particle capture efficiency at the start of service life, using AC Fine Test Dust (ACFTD) of defined particle size distribution. (2) Dust capacity test — measures the total mass of dust the element can hold before reaching the specified maximum permissible differential pressure, defining service interval. (3) Collapse/integrity test — verifies the element\'s structural integrity under severe differential pressure: the element must survive without leaking or collapsing at three to five times the rated operating pressure differential. These tests are conducted under standardised airflow conditions and document filter performance using consistent, reproducible methodology that allows direct comparison between competing elements.',
      },
      {
        heading: 'Efficiency Measurement',
        body: 'Particle counting upstream and downstream at 0.5, 1, 2, 3, 5, 7, 10, 20, 40, and 80 µm provides fractional efficiency data. Overall efficiency is measured gravimetrically — mass of dust retained by element divided by mass injected. ISO A2 fine test dust (ISO 12103-1, formerly SAE Fine test dust) is injected at constant rate during the test. A secondary downstream filter captures all particles that pass through the test element.',
      },
      {
        heading: 'Restriction and Capacity Testing',
        body: 'Restriction (pressure drop in mbar or Pa) is measured at rated airflow using calibrated differential pressure transducers. The test runs at constant flow until terminal restriction is reached (as specified by the manufacturer or test client). Dust holding capacity is the total grams of test dust retained by the element at terminal restriction, providing the basis for service interval prediction.',
      },
      {
        heading: 'Why It Matters for Engine Protection',
        body: 'Air intake filtration is the first and most critical defence for combustion engine reliability. Diesel engines ingest 10,000–30,000 litres of air per litre of fuel burned; all contamination in that air — silica dust, carbon particles, pollen, industrial particulate — enters the combustion chamber unless the air filter intercepts it. A single particle of silica dust (hardness 7 Mohs) larger than the oil film thickness on a piston ring (typically 3–10 µm) can initiate abrasive wear that propagates across the full service interval. ISO 5011 provides the measurement framework that guarantees an air filter element will capture particles above its rated efficiency threshold under defined operating conditions. An element that passes ISO 5011 integrity testing at 3× rated differential pressure will not develop bypass leaks in normal service. Without ISO 5011 certification, there is no engineering basis for assuming an air filter will perform as labelled during its full service life.',
      },
      {
        heading: 'Application in Engine Specifications',
        body: 'OEM engine manufacturers specify air filter elements by ISO 5011 performance parameters: minimum initial efficiency (typically 99.5%–99.9% at the test particle size), minimum dust capacity (in grams of ACFTD per unit airflow), and minimum collapse pressure. When an agricultural tractor OEM specifies an air filter element for a 150 kW diesel engine, the element must meet the ISO 5011 performance parameters validated for that engine\'s airflow rate (typically 600–900 m³/h) and operating environment (high ambient dust concentration in agricultural applications requires higher dust capacity than urban construction equipment). Aftermarket elements must demonstrate equivalent ISO 5011 performance — not just dimensional compatibility — to provide equivalent engine protection. An element that fits physically but holds 30% less dust will require 30% more frequent replacement intervals to prevent performance degradation from restriction or failure from collapse.',
      },
      {
        heading: 'What is the difference between the collapse test and the integrity test in ISO 5011?',
        body: 'The integrity test (bubble point test) applies low-pressure air to the clean filter element while the outlet side is submerged in liquid; bubbles indicate leaks in the filter media or gasket seals. It detects manufacturing defects and small perforations that would allow particle bypass in service. The collapse test applies increasing differential pressure (with liquid) until the element either develops a sustained leak or deforms structurally. The collapse test verifies the element can withstand pressure spikes from cold start conditions, clogged filter operation, and blocked service intervals without catastrophic bypass. ISO 5011 requires elements to survive at least 3× their rated operating differential pressure without collapse.',
      },
      {
        heading: 'What differential pressure rating should a heavy-duty air filter element have?',
        body: 'Heavy-duty air filter elements for diesel engines typically have rated service differential pressures of 3–7 kPa (30–70 mbar) at maximum rated airflow. Service restriction indicators (visual or electronic) typically trigger at 6–10 kPa. ISO 5011 collapse testing requires the element to survive 20–35 kPa without failure — providing a 3–5× safety margin above the service restriction trigger point. Mining and construction equipment operating in extremely dusty environments may use lower restriction triggers (4–5 kPa) to prevent ingestion of dust through a bypassing clogged element. High-performance industrial compressors may specify collapse ratings up to 100 kPa for catastrophic-failure prevention in process-critical applications.',
      },
      {
        heading: 'How does ISO 5011 relate to SAE J726 and SAE J1539?',
        body: 'SAE J726 (Air Cleaner Test Code) and ISO 5011 are technically equivalent standards that were harmonised through the international standardisation process. SAE J726 is the North American version; ISO 5011 is the international version. They specify the same test procedures, the same test dusts, and produce comparable results. Equipment sold globally may reference either standard. SAE J1539 (Air Cleaner Element Test Code for Crankcase Breathers) covers a related but distinct application: crankcase ventilation filter elements that prevent engine oil mist and blowby gases from entering the air intake. ELIMFILTERS MACROCORE™ elements are tested and certified under both ISO 5011 and SAE J726 for primary air intake applications.',
      },
      {
        heading: 'Does ISO 5011 certification guarantee compatibility with my engine?',
        body: 'ISO 5011 certification guarantees the element meets the specified efficiency, dust capacity, and structural integrity values under the standard\'s test conditions — it does not guarantee dimensional fit or compatibility with a specific engine\'s airflow system. An element must also match the engine\'s housing inlet/outlet dimensions, sealing geometry (radial seal, axial seal, or flat panel), and airflow resistance characteristics to the OEM specification. When sourcing replacement elements, verify both the ISO 5011 performance data (efficiency ≥ OEM spec, dust capacity ≥ OEM spec, collapse pressure ≥ OEM spec) and the dimensional specification against the original element part number.',
      },
    ],
    keyParams: [
      { label: 'Test dust', value: 'ISO A2 fine (ISO 12103-1)' },
      { label: 'Restriction unit', value: 'mbar or Pa' },
      { label: 'Efficiency unit', value: '% gravimetric or fractional' },
      { label: 'DHC unit', value: 'grams' },
    ],
    applicableSystems: ['air-intake-protection'],
    relatedGlossaryTerms: [
      'TERM-GRAVIMETRIC-EFFICIENCY', 'TERM-DUST-HOLDING-CAPACITY', 'TERM-RESTRICTION',
      'TERM-TEST-DUST', 'TERM-SAFETY-ELEMENT', 'TERM-PRE-CLEANER', 'TERM-CYCLONIC-SEPARATION',
    ],
    relatedTopics: ['airflow-engineering', 'air-restriction', 'dust-holding-capacity'],
    relatedTechnologies: ['MACROCORE™'],
    relatedArticles: ['iso-5011', 'sae-j726-iso-5011-air-cleaner-test', 'airflow-engineering', 'air-intake-system-design'],
    commonMistakes: [
      'Confusing ISO 5011 gravimetric test dust capacity with real-world service life. Laboratory dust (ISO Fine or ISO Coarse) differs in size distribution and composition from ambient dust at specific job site conditions.',
      'Treating initial restriction values as representative of in-service restriction. A filter\'s restriction increases significantly as contaminant loads onto the media — rated flow restriction at 0 g dust loading is not the operating condition.',
      'Selecting air filters by nominal micron rating rather than ISO 5011 gravimetric efficiency with specified dust type and concentration. Nominal ratings are not defined by ISO 5011 and carry no engineering validity.',
    ],
  },

  {
    slug: 'sae-j726',
    code: 'SAE J726',
    entityId: 'STD-SAE-J726',
    title: 'Air Cleaner Test Code',
    issuingOrganization: 'SAE International',
    year: '1993 (with supplements)',
    revisionStatus: 'active',
    metaDescription: 'SAE J726 defines the air cleaner test code for engine intake air filter performance evaluation — the North American counterpart to ISO 5011, measuring gravimetric efficiency, restriction, and dust holding capacity.',
    scope: 'Air intake filter elements for gasoline and diesel internal combustion engines in automotive and light-to-medium commercial vehicle applications in North American OEM specifications.',
    engineeringPurpose: 'Provides the North American standard test code for air filter performance evaluation, complementing ISO 5011 with procedures aligned to North American engine manufacturer specifications and US OEM qualification requirements. MACROCORE™ elements are characterised against both SAE J726 and ISO 5011 for global OEM documentation.',
    sections: [
      {
        heading: 'Test Code Scope',
        body: 'SAE J726 defines test procedures for measuring air cleaner element performance including: gravimetric filtration efficiency (mass of test dust retained per total dust injected, expressed as a percentage), intake restriction (differential pressure across the filter element at rated engine airflow), and dust holding capacity (grams of test dust at terminal restriction). The test uses SAE fine or coarse test dust (equivalent to ISO 12103-1 A2 Fine and A3 Medium grades).',
      },
      {
        heading: 'Relationship to ISO 5011',
        body: 'SAE J726 and ISO 5011 address the same test objectives for air cleaner performance evaluation, with differences in detailed test conditions and reporting formats. ISO 5011 is the international reference cited in European and international OEM specifications; SAE J726 is the North American equivalent referenced in US and Canadian OEM applications. Filter manufacturers targeting global OEM supply require characterisation data against both standards. A filter element meeting SAE J726 performance thresholds will generally satisfy ISO 5011 efficiency requirements at equivalent test conditions.',
      },
      {
        heading: 'Service Interval Implication',
        body: 'Dust holding capacity data from SAE J726 testing (grams at terminal restriction) is the primary input for service interval prediction models. Higher dust holding capacity at equivalent initial restriction means longer field service before restriction indicator activation. The progressive density gradient construction used in MACROCORE™ elements maximises SAE J726 dust holding capacity at the specified terminal restriction limit.',
      },
    ],
    keyParams: [
      { label: 'Test dust', value: 'SAE fine/coarse (≈ ISO 12103-1 A2/A3)' },
      { label: 'Key metrics', value: 'Efficiency (%), restriction (mbar), DHC (grams)' },
      { label: 'International equivalent', value: 'ISO 5011' },
      { label: 'Application', value: 'North American automotive and light commercial OEM' },
    ],
    applicableSystems: ['air-intake-protection'],
    relatedGlossaryTerms: [
      'TERM-GRAVIMETRIC-EFFICIENCY', 'TERM-DUST-HOLDING-CAPACITY', 'TERM-RESTRICTION',
      'TERM-TEST-DUST', 'TERM-PROGRESSIVE-DENSITY-GRADIENT',
    ],
    relatedTopics: ['airflow-engineering', 'dust-holding-capacity', 'testing-and-validation'],
    relatedTechnologies: ['MACROCORE™'],
    relatedArticles: ['sae-j726-iso-5011-air-cleaner-test', 'airflow-engineering', 'iso-5011', 'air-intake-system-design'],
  },

  {
    slug: 'sae-j1539',
    code: 'SAE J1539',
    entityId: 'STD-SAE-J1539',
    title: 'Air Cleaner Test Code — Heavy Duty Diesel Engines',
    issuingOrganization: 'SAE International',
    year: '1986',
    revisionStatus: 'active',
    metaDescription: 'SAE J1539 defines test procedures for evaluating air cleaner performance on heavy-duty diesel engines, covering restriction, efficiency, dust capacity, and element replacement protocols.',
    scope: 'Test code for air cleaner performance evaluation on heavy-duty diesel engines, including restriction measurement, filtration efficiency, and service life determination.',
    engineeringPurpose: 'Defines standardised test conditions for evaluating complete air cleaner assemblies on heavy-duty diesel engines in North American OEM applications, providing the framework for restriction indicator calibration and engine manufacturer restriction limit specification.',
    sections: [
      {
        heading: 'Test Parameters',
        body: 'SAE J1539 establishes standardized test conditions for evaluating air cleaner assemblies installed on heavy-duty diesel engines. Key parameters include airflow rate matched to engine displacement and rated speed, test dust specification using ISO fine or coarse test dust (ISO 12103-1), restriction measurement method using calibrated differential pressure transducers, and efficiency calculation. The test enables comparison of air cleaner performance across different configurations under controlled conditions.',
      },
      {
        heading: 'Relationship to ISO 5011',
        body: 'SAE J1539 and ISO 5011 address similar test objectives — air cleaner performance evaluation for internal combustion engines. ISO 5011 is the international standard widely referenced in European and international OEM specifications. SAE J1539 is the North American counterpart referenced in North American heavy-duty diesel engine applications. MACROCORE™ elements are characterized against both standards to provide performance documentation for global equipment OEM specifications.',
      },
    ],
    keyParams: [
      { label: 'Application', value: 'Heavy-duty diesel engine air cleaners' },
      { label: 'Key measurements', value: 'Restriction, efficiency, dust capacity' },
      { label: 'Related standard', value: 'ISO 5011 (international equivalent)' },
    ],
    applicableSystems: ['air-intake-protection'],
    relatedGlossaryTerms: ['TERM-RESTRICTION', 'TERM-RESTRICTION-INDICATOR', 'TERM-DIFFERENTIAL-PRESSURE', 'TERM-DUST-HOLDING-CAPACITY'],
    relatedTopics: ['airflow-engineering', 'dust-holding-capacity', 'testing-and-validation'],
    relatedTechnologies: ['MACROCORE™', 'INTEKCORE™'],
    relatedArticles: ['airflow-engineering', 'air-restriction', 'iso-5011', 'service-intervals'],
    commonMistakes: [
      'Setting restriction change indicators at static clean-element values rather than the OEM-specified maximum restriction limit. J1539 restriction limits account for fully loaded element conditions — change decisions based on clean pressure drop cause premature element replacement.',
      'Not correcting restriction measurements for altitude. Air density reduction at high elevation reduces mass flow for the same volumetric restriction reading — J1539 restriction limits specified at sea level must be adjusted for altitude operation.',
      'Assuming SAE J1539 and ISO 5011 test results are directly comparable. Different test dust specifications and airflow conditions mean results are not numerically interchangeable between the two standards.',
    ],
  },

  // ── CABIN AIR ──────────────────────────────────────────────────────────────

  {
    slug: 'iso-29463',
    code: 'ISO 29463',
    entityId: 'STD-ISO-29463',
    title: 'High-Efficiency Filters and Filter Media — Classification, Performance Testing, and Marking',
    issuingOrganization: 'ISO (International Organization for Standardization)',
    year: '2011 (Parts 1–5)',
    revisionStatus: 'active',
    metaDescription: 'ISO 29463 defines test methods and classification for high-efficiency air filters (HEPA/ULPA classes ePM1, ePM2.5, ePM10) for engine intake, compressed air, and cabin air applications.',
    scope: 'High-efficiency air and cabin air filters for HEPA/ULPA performance classification.',
    engineeringPurpose: 'Provides the international classification system and performance test methodology for HEPA and ULPA-grade air filters, enabling occupational health compliance verification for cabin air systems in heavy equipment operating in mining, quarrying, and construction environments.',
    sections: [
      {
        heading: 'Classification System',
        body: 'ISO 29463 replaces EN 1822 for HEPA/ULPA classification in industrial applications. Filter classes are defined by minimum efficiency at the most penetrating particle size (MPPS): E10 = 85%, E11 = 95%, E12 = 99.5%, H13 = 99.95%, H14 = 99.995%, U15 = 99.9995%. ELIMFILTERS MICROKAPPA™ cabin air filters targeting occupational health protection in mining and construction applications are classified to H13 minimum for PM2.5 protection.',
      },
      {
        heading: 'MPPS Testing',
        body: 'The most penetrating particle size (MPPS) for fibrous media is typically 0.1–0.3 µm — the size at which diffusion and interception mechanisms both have minimum efficiency. Testing at MPPS provides the worst-case efficiency measurement. For cabin air filters, scanning methods measure local penetration across the entire filter face to identify any penetration hotspots that would expose occupants to localized high particle concentration.',
      },
    ],
    keyParams: [
      { label: 'H13 minimum efficiency', value: '99.95% at MPPS' },
      { label: 'MPPS range', value: '0.1–0.3 µm' },
      { label: 'Application scope', value: 'HEPA/ULPA cabin air and industrial filtration' },
    ],
    applicableSystems: ['cabin-air-protection', 'air-intake-protection'],
    relatedGlossaryTerms: ['TERM-PROGRESSIVE-DENSITY-GRADIENT', 'TERM-MELT-BLOWN-MEDIA', 'TERM-SURFACE-FILTRATION'],
    relatedTopics: ['filter-media-science', 'airflow-engineering', 'cabin-air-filtration'],
    relatedTechnologies: ['MICROKAPPA™'],
    relatedArticles: ['cabin-air-filtration', 'filter-media-science', 'filter-media-engineering'],
    commonMistakes: [
      'Using DOP/DEHS penetration at rated airflow as the sole performance criterion. ISO 29463 also requires mechanical integrity under pulsed pressure cycling — high efficiency media that fails cyclic loading provides no protection.',
      'Confusing H13 HEPA efficiency (99.95% at MPPS) with H14 (99.995%) as equivalent for operator health applications. The 10× penetration difference is significant at industrial dust concentrations above 1 mg/m³.',
      'Applying cabin HEPA specifications from laboratory HVAC to heavy equipment cabs without accounting for higher face velocities and contamination concentrations in mining and construction environments.',
    ],
  },

  {
    slug: 'iso-11155-1',
    code: 'ISO 11155-1',
    entityId: 'STD-ISO-11155-1',
    title: 'Road Vehicles — Air Filters for Passenger Compartments — Particle Filtration Performance',
    issuingOrganization: 'ISO (International Organization for Standardization)',
    year: '2001',
    revisionStatus: 'active',
    metaDescription: 'ISO 11155-1 defines particle filtration efficiency and airflow resistance test methods for cabin air filters in road vehicles and heavy equipment operator cabs.',
    scope: 'Performance testing of cabin air filter elements for particle filtration efficiency (PM10, PM2.5) and airflow resistance in road vehicle passenger compartments and heavy equipment operator cabs.',
    engineeringPurpose: 'Defines particle filtration efficiency test methodology for cabin air systems in road vehicles and heavy equipment operator cabs, providing the performance framework for protecting operator health from PM2.5 and PM10 exposure in industrial environments.',
    sections: [
      {
        heading: 'Particle Efficiency Testing',
        body: 'ISO 11155-1 measures particle capture efficiency at PM10 and PM2.5 fractions — the size ranges corresponding to inhalable and respirable health fractions per WHO air quality guidelines. Testing uses standardized airflow rates with synthetic dust challenge. Minimum performance targets for operator health protection are >80% PM10 efficiency and >60% PM2.5 efficiency. MICROKAPPA™ elements achieve ≥95% PM2.5 efficiency, exceeding the ISO 11155-1 minimum threshold for occupational exposure limit compliance in high-dust industrial environments.',
      },
      {
        heading: 'ISO 11155-2 Complement',
        body: 'ISO 11155-1 addresses particle filtration; ISO 11155-2 addresses gaseous contaminant removal efficiency for activated carbon layers against odour compounds, aromatic hydrocarbons, and NOx species. Together, Parts 1 and 2 provide the full performance framework for cabin air filtration. DIN 71220 is the German predecessor standard, harmonised into ISO 11155 methodology, still referenced in European OEM cabin filter qualification documents.',
      },
      {
        heading: 'Heavy Equipment Application',
        body: 'ISO 11155 was developed for road vehicle passenger compartments, but the test methodology applies to heavy equipment operator cabs where contamination environments are significantly more aggressive. In mining and construction operations, ambient PM2.5 concentrations can reach 150–500 µg/m³ during active operations — 10–30× the WHO 24-hour guideline of 15 µg/m³. Cabin filtration compliant with ISO 11155-1 PM2.5 efficiency targets reduces in-cab concentrations to below occupational exposure limits.',
      },
    ],
    keyParams: [
      { label: 'PM10 efficiency minimum', value: '>80%' },
      { label: 'PM2.5 efficiency minimum', value: '>60%' },
      { label: 'MICROKAPPA™ PM2.5', value: '≥95%' },
      { label: 'Parts', value: 'Part 1: particles; Part 2: gas phase' },
    ],
    applicableSystems: ['cabin-air-protection'],
    relatedGlossaryTerms: ['TERM-PROGRESSIVE-DENSITY-GRADIENT', 'TERM-MELT-BLOWN-MEDIA', 'TERM-DEPTH-FILTRATION'],
    relatedTopics: ['filter-media-science', 'testing-and-validation', 'cabin-air-filtration'],
    relatedTechnologies: ['MICROKAPPA™'],
    relatedArticles: ['cabin-air-filtration', 'filter-media-science'],
    commonMistakes: [
      'Specifying cabin filters solely by particle efficiency without considering gaseous contaminant protection. ISO 11155-1 covers particulate only — chemical and odour protection requires ISO 11155-2 combined filter testing.',
      'Not accounting for filter media saturation in high-dust environments. Particle efficiency approaches 100% on a saturated filter, but flow restriction may exceed the HVAC system capacity before the end of the rated service interval.',
      'Applying road vehicle cabin filter specifications (passenger compartment conditions) directly to construction or mining equipment cabs without adjusting for the higher ambient dust concentrations of those environments.',
    ],
  },

  {
    slug: 'din-71220',
    code: 'DIN 71220',
    entityId: 'STD-DIN-71220',
    title: 'Road Vehicles — Cabin Air Filters — Requirements and Testing',
    issuingOrganization: 'DIN (Deutsches Institut für Normung)',
    year: 'Active (pre-harmonisation)',
    revisionStatus: 'active',
    metaDescription: 'DIN 71220 is the German standard for road vehicle cabin air filter performance, specifying particle filtration efficiency, odour removal, and activated carbon performance — a predecessor to ISO 11155 still referenced in European OEM specifications.',
    scope: 'Cabin air filters for road vehicles (passenger cars, light commercial vehicles, buses, trucks) in European OEM qualification contexts, particularly German automotive supply chains.',
    engineeringPurpose: 'German predecessor standard for cabin air filter qualification, still required alongside ISO 11155 for European OEM supply chains where legacy specifications mandate dual-standard compliance for German automotive and commercial vehicle markets.',
    sections: [
      {
        heading: 'Scope and Background',
        body: 'DIN 71220 specifies particle filtration efficiency (>80%), odour removal performance, and activated carbon layer testing for road vehicle cabin air filters. Published by DIN (Deutsches Institut für Normung), it preceded ISO 11155 and remains cited in European OEM supplier qualification documents — particularly in German automotive, bus, and truck supply chains — where legacy specifications have not been updated to ISO 11155 equivalents. The standard covers the same vehicle scope as ISO 11155: passenger cars, light commercial vehicles, buses, and trucks.',
      },
      {
        heading: 'Relationship to ISO 11155',
        body: 'ISO 11155-1 particle efficiency and flow resistance methodology builds directly on the DIN 71220 framework with internationally standardised test conditions. In practice, a cabin filter that passes ISO 11155-1 will generally satisfy DIN 71220 particle efficiency requirements. However, formal DIN 71220 testing may be required separately for OEM qualification where German OEM specifications continue to cite DIN 71220 alongside or in place of ISO 11155. Dual-standard compliance is required for European market cabin filter products targeting German OEM supply chains.',
      },
    ],
    keyParams: [
      { label: 'Particle efficiency threshold', value: '>80% at rated test conditions' },
      { label: 'Issuing body', value: 'DIN (Deutsches Institut für Normung)' },
      { label: 'Scope', value: 'Road vehicles — passenger cars, LCV, buses, trucks' },
      { label: 'Relationship', value: 'German predecessor to ISO 11155; dual qualification required in some EU OEM supply chains' },
    ],
    applicableSystems: ['cabin-air-protection'],
    relatedGlossaryTerms: ['TERM-MELT-BLOWN-MEDIA', 'TERM-PROGRESSIVE-DENSITY-GRADIENT'],
    relatedTopics: ['cabin-air-filtration', 'operator-health'],
    relatedTechnologies: ['MICROKAPPA™'],
    relatedArticles: ['cabin-air-filtration', 'filter-media-science'],
    commonMistakes: [
      'Treating DIN 71220 and ISO 11155 as fully interchangeable specifications. Test dust concentrations and efficiency measurement conditions differ between the two standards — a filter qualifying under one may not meet the other.',
      'Applying automotive passenger vehicle cabin filter change intervals (typically 15,000–25,000 km) to construction or agricultural equipment where ambient dust concentrations are 10–100× higher than road vehicle conditions.',
    ],
  },

  // ── FUEL & WATER SEPARATION ────────────────────────────────────────────────

  {
    slug: 'iso-12937',
    code: 'ISO 12937',
    entityId: 'STD-ISO-12937',
    title: 'Petroleum Products — Determination of Water by Coulometric Karl Fischer Titration',
    issuingOrganization: 'ISO (International Organization for Standardization)',
    year: '2000',
    revisionStatus: 'active',
    metaDescription: 'ISO 12937 defines the Karl Fischer coulometric titration method for determining water content in petroleum products, the European and international equivalent of ASTM D6304.',
    scope: 'Determination of water content in petroleum products with water content between 5 mg/kg and 2,000 mg/kg using coulometric Karl Fischer titration.',
    engineeringPurpose: 'Specifies the Karl Fischer coulometric titration method for quantifying water contamination in diesel fuel and lubricating oils — the primary analytical measurement used to verify fuel water content compliance with HPCR injection system protection thresholds and to detect coolant ingress in engine oil condition monitoring.',
    sections: [
      {
        heading: 'Karl Fischer Titration Principle',
        body: 'ISO 12937 uses coulometric Karl Fischer titration to quantitatively determine water content in petroleum products. Iodine is electrochemically generated at an anode and reacts stoichiometrically with water in the Karl Fischer reaction; the charge required to generate sufficient iodine to consume all sample water is proportional to water content. Results are expressed as mg/kg (ppm by mass). ISO 12937 and ASTM D6304 use the same electrochemical principle and produce equivalent results — ISO 12937 is the European and international market reference; ASTM D6304 is the North American equivalent.',
      },
      {
        heading: 'HPCR Fuel Quality Target',
        body: 'ISO 12937 is the measurement method cited in EN 590 (European diesel fuel specification) with a limit of 200 mg/kg water. High-pressure common rail injectors require fuel water content below this threshold to prevent injector seat corrosion, micro-pitting, and stiction. Water above 500 mg/kg causes visible free water phases. ISO 12937 analysis is performed at fuel depot acceptance, during storage monitoring, and as commissioning flush verification for marine vessels under ISO 8217.',
      },
    ],
    keyParams: [
      { label: 'Measurement range', value: '5–2,000 mg/kg (ppm)' },
      { label: 'EN 590 water limit', value: '200 mg/kg' },
      { label: 'Equivalent standard', value: 'ASTM D6304 (North American)' },
    ],
    applicableSystems: ['fuel-cleanliness-protection', 'lubrication-protection'],
    relatedGlossaryTerms: [
      'TERM-KARL-FISCHER-TITRATION', 'TERM-WATER-INGRESS', 'TERM-FREE-WATER',
      'TERM-EMULSIFIED-WATER', 'TERM-HPCR', 'TERM-MICROBIAL-CONTAMINATION',
    ],
    relatedTopics: ['fluid-cleanliness', 'testing-and-validation'],
    relatedTechnologies: ['HYDROCORE™', 'SYNTEPORE™', 'TURBOCORE™'],
    relatedArticles: ['fuel-water-contamination', 'oil-analysis-methods', 'hpcr-fuel-system-protection'],
    commonMistakes: [
      'Confusing free water and dissolved water in Karl Fischer results. ISO 12937 coulometric KF measures total water (dissolved + free + emulsified) — a result of 80 ppm in diesel does not mean free water is absent if phase separation has occurred.',
      'Accepting diesel water content above 200 ppm without considering HPCR injector stiction risk. Modern HPCR systems with ≤1 µm spool clearances show accelerated wear onset above 200 ppm total water.',
      'Not accounting for sample handling water pickup during Karl Fischer testing. Low-water samples (<50 ppm) absorb ambient moisture rapidly — ISO 12937 sample handling protocols are mandatory for reliable results.',
    ],
  },

  {
    slug: 'astm-d6304',
    code: 'ASTM D6304',
    entityId: 'STD-ASTM-D6304',
    title: 'Standard Test Method for Determination of Water in Petroleum Products by Coulometric Karl Fischer Titration',
    issuingOrganization: 'ASTM International',
    year: '2007',
    revisionStatus: 'active',
    metaDescription: 'ASTM D6304 is the North American coulometric Karl Fischer titration method for water content in petroleum products and lubricating oils, equivalent to ISO 12937.',
    scope: 'Water content determination in petroleum products, lubricating oils, and additives with water content from 10 ppm to 25,000 ppm using coulometric Karl Fischer titration.',
    engineeringPurpose: 'Provides the North American standard analytical method for water content measurement in petroleum products and lubricating oils — used for HPCR fuel quality verification, fuel filter/water separator performance testing, and engine oil condition monitoring where coolant ingress detection is required.',
    sections: [
      {
        heading: 'Coulometric Karl Fischer Method',
        body: 'ASTM D6304 measures total water content in petroleum products using coulometric Karl Fischer titration — iodine generated electrochemically reacts stoichiometrically with sample water, with the charge passed proportional to water concentration. Sensitivity range covers 10–25,000 mg/kg, making it appropriate for fuel quality management and lubricating oil condition monitoring. ASTM D6304 and ISO 12937 are technically equivalent, producing the same results from the same sample material; ASTM D6304 is referenced in North American OEM and regulatory specifications where ISO 12937 is cited in European and international frameworks.',
      },
      {
        heading: 'Fuel and Lube Oil Applications',
        body: 'In fuel applications, ASTM D6304 verifies diesel fuel water content below the 200 mg/kg threshold critical for HPCR injector protection. In lubricating oil applications, water above 0.1% indicates coolant leak (head gasket or liner failure); above 0.5%, water accelerates oil oxidation, promotes bacterial growth in biodegradable oils, and reduces oil film strength at bearing surfaces. HYDROCORE™ performance is validated by comparing ASTM D6304 inlet versus outlet water concentrations, with target outlet below 50–100 mg/kg dissolved saturation.',
      },
    ],
    keyParams: [
      { label: 'Measurement range', value: '10–25,000 ppm' },
      { label: 'Equivalent to', value: 'ISO 12937' },
      { label: 'HPCR protection threshold', value: '<200 ppm' },
      { label: 'Lube coolant leak indicator', value: '>0.1% water' },
    ],
    applicableSystems: ['fuel-cleanliness-protection', 'lubrication-protection'],
    relatedGlossaryTerms: [
      'TERM-KARL-FISCHER-TITRATION', 'TERM-FREE-WATER', 'TERM-EMULSIFIED-WATER',
      'TERM-WATER-SEPARATION-EFFICIENCY', 'TERM-COALESCING', 'TERM-HPCR',
    ],
    relatedTopics: ['fluid-cleanliness', 'testing-and-validation'],
    relatedTechnologies: ['HYDROCORE™', 'SYNTEPORE™', 'TURBOCORE™'],
    relatedArticles: ['fuel-water-contamination', 'oil-analysis-methods', 'hpcr-fuel-system-protection'],
    commonMistakes: [
      'Selecting coulometric Karl Fischer (ASTM D6304) for high-water-content samples (>1000 ppm). Coulometric KF is designed for low water content — volumetric KF (ASTM D1744) is more appropriate for high-water petroleum products.',
      'Comparing KF water content results between samples taken at different fuel temperatures. Water solubility in diesel changes with temperature — hot tank samples taken after engine operation will show lower dissolved water than cold morning samples.',
    ],
  },

  {
    slug: 'iso-16332',
    code: 'ISO 16332',
    entityId: 'STD-ISO-16332',
    title: 'Diesel Engines — Fuel Filters — Test Methods for Water Separation Efficiency',
    issuingOrganization: 'ISO (International Organization for Standardization)',
    year: '2015',
    revisionStatus: 'active',
    metaDescription: 'ISO 16332 defines test methods for measuring water separation efficiency of diesel fuel filters, establishing the performance benchmark for coalescing fuel water separators.',
    scope: 'Test methodology for determining the water separation efficiency of diesel fuel filter elements using standardized test conditions and water concentration measurement.',
    engineeringPurpose: 'Provides the standardised test method for measuring water separation efficiency of diesel fuel filter/water separator elements, enabling performance qualification of coalescing filter technology for HPCR injection system protection in heavy-duty diesel applications.',
    sections: [
      {
        heading: 'Water Separation Efficiency Test',
        body: 'ISO 16332 defines the standardized test methodology for measuring the water separation efficiency of diesel fuel filters, including coalescing filter elements. The test circulates diesel fuel containing a controlled water concentration through the filter element under specified flow and temperature conditions, measuring water concentration upstream and downstream using analytical methods (Karl Fischer titration per ISO 12937 or ASTM D6304). Water separation efficiency is expressed as the percentage of input water concentration removed by the filter element. HYDROCORE™ coalescing water separator elements achieve ≥96% water separation efficiency under ISO 16332 test conditions.',
      },
      {
        heading: 'HPCR Fuel System Application',
        body: 'ISO 16332 is the performance standard for the water separation stage of HPCR fuel protection systems. In the ELIMFILTERS fuel protection strategy, HYDROCORE™ (water separation, ISO 16332 rated) operates in sequence with SYNTEPORE™ (primary particle removal) to achieve HPCR fuel cleanliness at ISO 12/10/8. ISO 16332 water separation test performance is the primary qualification criterion for selecting coalescing fuel filter elements for HPCR diesel engine protection.',
      },
      {
        heading: 'Relationship to Fuel Water Standards',
        body: 'ISO 16332 defines the filter performance test; ISO 12937 and ASTM D6304 define the water content measurement methods used both within the ISO 16332 test protocol and for field monitoring of fuel water content. Together, these three standards form the measurement and performance framework for diesel fuel water contamination control: ISO 12937/ASTM D6304 measure water concentration in fuel; ISO 16332 verifies that filtration equipment removes water to below the HPCR protection threshold.',
      },
    ],
    keyParams: [
      { label: 'HYDROCORE™ water separation', value: '≥96% (ISO 16332)' },
      { label: 'Test method for water content', value: 'ISO 12937 / ASTM D6304' },
      { label: 'HPCR fuel protection threshold', value: '<200 mg/kg water' },
    ],
    applicableSystems: ['fuel-cleanliness-protection'],
    relatedGlossaryTerms: [
      'TERM-COALESCING', 'TERM-WATER-SEPARATION-EFFICIENCY', 'TERM-FREE-WATER',
      'TERM-EMULSIFIED-WATER', 'TERM-HPCR', 'TERM-INJECTOR-STICTION',
    ],
    relatedTopics: ['fluid-cleanliness', 'testing-and-validation'],
    relatedTechnologies: ['HYDROCORE™', 'SYNTEPORE™', 'TURBOCORE™'],
    relatedArticles: ['fuel-water-contamination', 'hpcr-fuel-system-protection', 'iso-16332'],
    commonMistakes: [
      'Specifying water separation efficiency at a single test flow rate as the only performance criterion. ISO 16332 water separation efficiency varies significantly with flow — a separator rated at 95% efficiency at rated flow may drop to 60% at 150% of rated flow.',
      'Not distinguishing between free water separation and emulsified water separation in ISO 16332 test results. Coalescing separators remove free water efficiently but require higher-efficiency coalescer media for surfactant-stabilised emulsified water.',
    ],
  },

  // ── COMPRESSED AIR ─────────────────────────────────────────────────────────

  {
    slug: 'iso-8573-1',
    code: 'ISO 8573-1',
    entityId: 'STD-ISO-8573-1',
    title: 'Compressed Air — Contaminant Classes and Purity Requirements',
    issuingOrganization: 'ISO (International Organization for Standardization)',
    year: '2010',
    revisionStatus: 'active',
    metaDescription: 'ISO 8573-1 defines purity classes for compressed air, specifying maximum concentrations of solid particles, water, and oil for industrial, food, pharmaceutical, and instrument air applications.',
    scope: 'Classification of compressed air purity by contamination class for solid particles, water (liquid and vapor), and total oil (liquid, aerosol, and vapor).',
    engineeringPurpose: 'Establishes the compressed air purity classification system (Particle:Water:Oil classes) enabling specification of point-of-use air quality requirements for pneumatic equipment, instrumentation, and process applications — the primary framework for selecting and verifying DRYCORE™ compressed air treatment systems.',
    sections: [
      {
        heading: 'Purity Class Structure',
        body: 'ISO 8573-1 specifies compressed air purity using three independent class numbers in the format X:Y:Z — where X is the particle class (1–9 or 0), Y is the water class (1–9 or 0), and Z is the oil class (1–4 or 0). Lower numbers represent higher purity. Class 1:4:1 — achievable with DRYCORE™ multi-stage filtration — represents particle concentration <20,000 per m³ at ≥0.1 µm, pressure dewpoint ≤+3°C, and total oil <0.01 mg/m³. Class 0 (highest purity) is application-specific and defined by the equipment supplier and end user.',
      },
      {
        heading: 'Application Requirements',
        body: 'Typical application requirements: pneumatic general service Class 5:4:3; instrument air Class 2:4:1; food contact Class 1:2:1; pharmaceutical filling Class 1:2:1. ISO 8573-1 is used in conjunction with ISO 8573-2 (particle measurement), ISO 8573-3 (humidity and water measurement), and ISO 12500 (coalescing filter test). DRYCORE™ compressed air systems are designed and certified against ISO 8573-1 class requirements.',
      },
      {
        heading: 'Treatment Stage Requirements',
        body: 'Achieving Class 1:4:1 requires a multi-stage compressed air treatment train: pre-filter (bulk liquid and >3 µm particles), refrigeration dryer (pressure dewpoint 2–5°C), coalescing filter (oil aerosol to 0.01 mg/m³), activated carbon (oil vapor to 0.005 mg/m³), and post-filter (carbon fines removal). Each stage is tested and classified individually against the applicable ISO 8573 part.',
      },
    ],
    keyParams: [
      { label: 'Format', value: 'Particle:Water:Oil class numbers' },
      { label: 'Instrument air minimum', value: 'Class 2:4:1' },
      { label: 'DRYCORE™ achievable', value: 'Class 1:4:1' },
      { label: 'Class 1 particles', value: '<20,000/m³ at ≥0.1 µm' },
    ],
    applicableSystems: [],
    relatedGlossaryTerms: ['TERM-DEW-POINT', 'TERM-COMPRESSED-AIR-PURITY', 'TERM-COALESCING'],
    relatedTopics: ['testing-and-validation', 'contamination-control'],
    relatedTechnologies: ['DRYCORE™'],
    relatedArticles: ['compressed-air-systems', 'iso-8573-compressed-air-purity'],
    childStandards: ['STD-ISO-8573-2'],
    commonMistakes: [
      'Specifying ISO 8573-1 Class 0 (oil-free) for applications that only require Class 1 (≤0.01 mg/m³ oil aerosol). Class 0 requires an oil-free compressor; Class 1 is achievable with downstream coalescing filtration on a lubricated compressor — a significant cost difference.',
      'Not distinguishing between ISO 8573-1 oil aerosol content (measured by 8573-2) and total hydrocarbon content (aerosol + vapour). A system meeting Class 1 oil aerosol may still contain oil vapour requiring activated carbon treatment.',
      'Applying ISO 8573-1 purity class specifications at a single point in the system without accounting for recontamination from distribution pipework. Point-of-use air quality must be measured at the application, not at the dryer outlet.',
    ],
  },

  // ── LUBRICATION OIL ────────────────────────────────────────────────────────

  {
    slug: 'sae-j1858',
    code: 'SAE J1858',
    entityId: 'STD-SAE-J1858',
    title: 'Full-Flow Lubricating Oil Filters — Selecting and Specifying',
    issuingOrganization: 'SAE International',
    year: '2011',
    revisionStatus: 'active',
    metaDescription: 'SAE J1858 provides guidance for specifying and selecting full-flow lubricating oil filters for diesel and gasoline engines, covering performance requirements and test methodology references.',
    scope: 'Full-flow lube oil filters for internal combustion engines.',
    engineeringPurpose: 'Provides the selection and specification framework for full-flow lube oil filters in engine applications, defining performance tiers aligned to oil drain interval categories and referencing ISO test methods for efficiency, capacity, and structural requirements.',
    sections: [
      {
        heading: 'Specification Framework',
        body: 'SAE J1858 establishes the performance requirements and selection criteria for full-flow lube oil filters in gasoline and diesel engine applications. The standard references ISO 4548 for test methodology and provides guidance on bypass valve specification, anti-drain back valve performance, and media efficiency requirements for different engine service categories.',
      },
      {
        heading: 'Performance Categories',
        body: 'SAE J1858 defines performance levels based on oil change interval: standard service (≤5,000 km), extended service (5,000–10,000 km), and severe/extended (>10,000 km). Higher categories require higher dirt holding capacity and superior media efficiency to maintain protection through longer service intervals. Synthetic media filters are required for extended service applications.',
      },
    ],
    keyParams: [
      { label: 'Standard service', value: '≤5,000 km' },
      { label: 'Extended service', value: '5,000–10,000 km' },
      { label: 'Test method reference', value: 'ISO 4548' },
    ],
    applicableSystems: ['lubrication-protection'],
    relatedGlossaryTerms: [
      'TERM-BETA-RATIO', 'TERM-DIFFERENTIAL-PRESSURE', 'TERM-FILTER-BYPASS-VALVE',
      'TERM-SERVICE-INTERVAL', 'TERM-OIL-DRAIN-INTERVAL', 'TERM-DUST-HOLDING-CAPACITY',
    ],
    relatedTopics: ['service-intervals', 'oem-engineering', 'filter-media-science'],
    relatedTechnologies: ['SYNTRAX™'],
    relatedArticles: ['lubrication-system-filtration', 'service-intervals', 'filter-element-integrity', 'extended-drain-interval-engineering'],
    commonMistakes: [
      'Confusing bypass valve opening pressure with collapse pressure. Bypass valve activation is a normal, designed operating event — it protects the engine from oil starvation during cold starts. Collapse is a structural failure that releases contamination.',
      'Using J1858 flow rate and efficiency requirements from one engine class for a different engine service category. J1858 distinguishes between standard service, severe service, and extended drain service — each has different performance requirements.',
      'Selecting full-flow oil filters based on thread size and anti-drain back valve orientation alone without verifying media efficiency and collapse pressure ratings meet the engine manufacturer\'s J1858 service category requirements.',
    ],
  },

  // ── PHASE 5C NEW STANDARDS ─────────────────────────────────────────────────

  {
    slug: 'iso-3723',
    code: 'ISO 3723',
    entityId: 'STD-ISO-3723',
    title: 'Hydraulic Fluid Power Filter Elements — Method for End Load Test',
    issuingOrganization: 'ISO (International Organization for Standardization)',
    year: '2015',
    revisionStatus: 'active',
    metaDescription: 'ISO 3723 defines the end load test method for determining the structural integrity and collapse resistance of hydraulic filter elements under axial compressive loading conditions.',
    scope: 'Hydraulic filter elements in hydraulic fluid power systems requiring structural integrity qualification under compressive differential pressure loading.',
    engineeringPurpose: 'Determines the structural load capacity and collapse pressure of hydraulic filter elements, verifying that element construction withstands the axial compressive forces generated by differential pressure buildup, cold-start viscosity transients, and bypass valve activation — preventing element collapse and catastrophic contamination release.',
    sections: [
      {
        heading: 'End Load Test Methodology',
        body: 'ISO 3723 specifies a compressive end load test that simulates the axial force exerted on a filter element by differential pressure in an outside-in flow configuration. The element is mounted in a test fixture and subjected to increasing axial compressive load until structural failure occurs. The load at failure is the collapse end load, which is correlated to the collapse pressure rating for a given element diameter and end cap geometry. Elements are qualified against minimum collapse end load values that provide a defined safety margin above the system bypass valve opening pressure.',
      },
      {
        heading: 'Collapse Prevention Engineering',
        body: 'Filter element collapse is a catastrophic failure mode: a collapsed element releases all accumulated contamination directly into the downstream circuit. The primary structural determinants of collapse resistance are: pleated media support layer construction (inner and outer support tubes), end cap bonding strength, and pleat geometry under compressive load. ELIMFILTERS NANOFORCE™ and SYNTRAX™ elements use steel inner and outer support cages with bonded end caps, achieving collapse load margins of 10–20× above typical bypass valve settings (3–6 bar).',
      },
      {
        heading: 'Complementary Standards',
        body: 'ISO 3723 (end load/collapse) complements NFPA T2.14 (hydraulic collapse and burst pressure verification) and ISO 2941 (filter element structural integrity — collapse and burst test under internal pressure). Together these standards provide complete structural qualification for filter elements operating under both outside-in and inside-out flow regimes, covering the full range of collapse and burst failure modes encountered in hydraulic and lubrication system applications.',
      },
    ],
    keyParams: [
      { label: 'Test type', value: 'Axial compressive end load' },
      { label: 'Failure mode targeted', value: 'Element collapse under differential pressure' },
      { label: 'Safety margin requirement', value: '≥10× bypass valve opening pressure' },
      { label: 'Complementary standard', value: 'NFPA T2.14, ISO 2941' },
    ],
    applicableSystems: ['hydraulic-protection', 'lubrication-protection'],
    relatedGlossaryTerms: [
      'TERM-COLLAPSE-PRESSURE', 'TERM-ELEMENT-COLLAPSE', 'TERM-DIFFERENTIAL-PRESSURE',
      'TERM-FILTER-BYPASS-VALVE',
    ],
    relatedTopics: ['testing-and-validation', 'filter-media-science', 'contamination-control'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™', 'INTEKCORE™'],
    relatedArticles: ['filter-element-integrity', 'materials-engineering', 'failure-analysis'],
    commonMistakes: [
      'Confusing collapse pressure (structural failure) with bypass valve opening pressure (designed operating event). Collapse releases unfiltered fluid and captured contaminant into the system — bypass valve activation diverts flow around a blocked element without releasing contaminant.',
      'Not testing under pulsed differential pressure conditions representative of cold-start and flow transients. ISO 3723 static end load tests qualify elements for sustained differential pressure — fatigue failure from cyclic loading is a separate qualification requirement.',
    ],
  },

  {
    slug: 'iso-19438',
    code: 'ISO 19438',
    entityId: 'STD-ISO-19438',
    title: 'Diesel Fuel and Petrol — Filtration and Filtration Performance Evaluation',
    issuingOrganization: 'ISO (International Organization for Standardization)',
    year: '2003',
    revisionStatus: 'active',
    metaDescription: 'ISO 19438 defines particle counting and filtration performance evaluation methods for diesel and petrol fuel filter elements, extending ISO 16889 methodology to fuel system applications for HPCR injection protection.',
    scope: 'Fuel filter elements in diesel and petrol fuel systems, particularly high-pressure common-rail injection systems requiring particle filtration qualification at ≤6 µm particle sizes.',
    engineeringPurpose: 'Provides standardised particle counting and filtration efficiency measurement for diesel and petrol fuel filter elements, enabling quantitative Beta ratio performance qualification for HPCR injection system protection where particles above 4–6 µm cause precision injector and pump component failure within the injection system clearance envelope.',
    sections: [
      {
        heading: 'Scope and HPCR Context',
        body: 'ISO 19438 adapts the multi-pass filtration test methodology of ISO 16889 to fuel filter applications, addressing the specific conditions of diesel and petrol fuel systems. The standard defines test fluid selection (diesel or ISO VG 15 test fluid), test dust type, flow conditions, and particle counting methodology for fuel filter elements. The primary application is qualification of fuel filters for high-pressure common-rail (HPCR) diesel injection systems where component clearances of 1–3 µm require fuel cleanliness at ISO 12/10/8 or finer.',
      },
      {
        heading: 'Particle Counting Methodology',
        body: 'ISO 19438 uses automatic particle counters calibrated per ISO 11171 for particle size thresholds including ≥4 µm(c), ≥6 µm(c), and ≥14 µm(c). The multi-pass test recirculates fuel-dust suspension to achieve statistically reliable counts at each size range. Beta ratio results from ISO 19438 are expressed in the same β_x(c) format as ISO 16889, enabling direct comparison of fuel filter efficiency with hydraulic filter efficiency data — important for systems combining fuel filtration with hydraulic filtration in equipment powertrain design.',
      },
      {
        heading: 'HPCR Protection Specification',
        body: 'For HPCR injection systems operating at 1,600–2,500 bar injection pressure, injector nozzle tip orifices of 100–150 µm diameter, and pump plunger clearances of 1–2 µm, particle contamination above 6 µm at the injector inlet causes abrasive wear of precision surfaces. ISO 19438 Beta ratio qualification at β₆(c) ≥ 200 is the minimum filtration performance required for HPCR injector protection. SYNTEPORE™ fuel filter elements are qualified to ISO 19438 at β₆(c) ≥ 200 for HPCR applications.',
      },
    ],
    keyParams: [
      { label: 'Key particle size', value: '≥4 µm(c), ≥6 µm(c)' },
      { label: 'HPCR minimum Beta ratio', value: 'β₆(c) ≥ 200' },
      { label: 'Particle counter calibration', value: 'ISO 11171' },
      { label: 'Equivalent methodology', value: 'ISO 16889 (hydraulic) adapted to fuel' },
    ],
    applicableSystems: ['fuel-cleanliness-protection'],
    relatedGlossaryTerms: [
      'TERM-BETA-RATIO', 'TERM-HPCR', 'TERM-INJECTOR-STICTION', 'TERM-PARTICLE-COUNT',
      'TERM-ABSOLUTE-EFFICIENCY', 'TERM-MULTI-PASS-TEST',
    ],
    relatedTopics: ['fluid-cleanliness', 'testing-and-validation', 'filter-media-science'],
    relatedTechnologies: ['SYNTEPORE™', 'TURBOCORE™'],
    relatedArticles: ['hpcr-fuel-system-protection', 'fuel-water-contamination', 'beta-ratio', 'filter-media-engineering'],
    commonMistakes: [
      'Specifying fuel filter performance using ISO 4548 (lube oil filter method) when ISO 19438 is the applicable standard for fuel applications. Different test fluids, viscosities, and contaminant specifications make the tests non-comparable.',
      'Not accounting for biocide treatment effects on synthetic filter media in biodiesel (B20+) applications. Some amine-based biocides cause swelling and degradation of polyester filter media that passes ISO 19438 testing with mineral diesel.',
      'Using particle efficiency at 10 µm as the primary HPCR fuel filter selection criterion. HPCR injector clearances of 1–3 µm require fuel filter qualification at 4–6 µm particle sizes — 10 µm efficiency data understates contamination risk.',
    ],
  },

  {
    slug: 'astm-d5185',
    code: 'ASTM D5185',
    entityId: 'STD-ASTM-D5185',
    title: 'Determination of Additive Elements, Wear Metals, and Contaminants in Used Lubricating Oils by ICP-OES',
    issuingOrganization: 'ASTM International',
    year: '2019',
    revisionStatus: 'active',
    metaDescription: 'ASTM D5185 specifies inductively coupled plasma optical emission spectrometry (ICP-OES) for measuring elemental composition of used lubricating and hydraulic oils in condition monitoring programmes.',
    scope: 'Used lubricating oils, hydraulic fluids, and related petroleum products in predictive maintenance oil analysis programmes requiring elemental quantification of wear metals, additive elements, and contaminants.',
    engineeringPurpose: 'Provides the primary analytical method for used oil spectrometric analysis — quantifying 20+ elements (wear metals, additive elements, contaminants) that indicate component wear rates, oil degradation rates, and contamination events — enabling condition-based maintenance decisions on oil change intervals and component inspection scheduling.',
    sections: [
      {
        heading: 'ICP-OES Analysis Methodology',
        body: 'ASTM D5185 uses inductively coupled plasma optical emission spectrometry (ICP-OES) to simultaneously quantify multiple elements in used oil samples diluted in a solvent. The plasma source atomises and excites oil-dissolved metal species; each element emits characteristic wavelengths detected by the spectrometer. Elements measured include wear metals (iron, copper, lead, tin, aluminium, chromium, nickel), additive elements (calcium, magnesium, zinc, phosphorus, boron, molybdenum), and contaminants (silicon, sodium, potassium, glycol marker elements). Results are expressed in mg/kg (ppm).',
      },
      {
        heading: 'Wear Metal Interpretation',
        body: 'Iron concentration indicates general ferrous component wear across the lubrication circuit. Copper indicates bearing shell wear. Lead indicates bearing overlay failure. Aluminium indicates piston or bearing alloy wear. Silicon above 20 ppm indicates soil ingestion (air filter bypass or road dust contamination), which simultaneously produces elevated iron by acting as an abrasive on cylinder bores and bearing surfaces. Trending multiple wear elements simultaneously reveals the specific wear mechanism and affected component — ICP analysis without silicon data is incomplete for root-cause diagnosis of elevated iron.',
      },
      {
        heading: 'Integration with Oil Condition Monitoring',
        body: 'ASTM D5185 is the central analytical method in oil condition monitoring programmes, combined with: viscosity at 100°C (ASTM D445), acid number/TAN (ASTM D664), base number/TBN (ASTM D2896 or D4739), water content (ASTM D6304/ISO 12937), and particle count (ISO 4406/ISO 11171). Each analytical method covers a different failure mode — ASTM D5185 addresses component wear and contamination; viscosity and TBN/TAN address oil degradation. Combined data enables condition-based oil drain interval decisions.',
      },
    ],
    keyParams: [
      { label: 'Method', value: 'ICP-OES (inductively coupled plasma)' },
      { label: 'Sensitivity range', value: '0.1–10,000 ppm per element' },
      { label: 'Elements measured', value: '20+ (wear metals, additives, contaminants)' },
      { label: 'Silicon threshold (air ingestion)', value: '>20 ppm = suspected filter bypass' },
    ],
    applicableSystems: ['lubrication-protection', 'hydraulic-protection'],
    relatedGlossaryTerms: [
      'TERM-OIL-CONDITION-MONITORING', 'TERM-FERROUS-WEAR-DEBRIS', 'TERM-ABRASIVE-WEAR',
      'TERM-GLYCOL-CONTAMINATION', 'TERM-SILICA', 'TERM-TOTAL-BASE-NUMBER', 'TERM-TOTAL-ACID-NUMBER',
    ],
    relatedTopics: ['fluid-cleanliness', 'testing-and-validation', 'contamination-control'],
    relatedTechnologies: ['DURATECH™', 'SYNTRAX™'],
    relatedArticles: ['oil-analysis-methods', 'oil-condition-monitoring', 'fleet-oil-sampling-protocol', 'extended-drain-interval-engineering'],
    commonMistakes: [
      'Treating wear metal concentration in a single sample as a definitive wear indicator without trending data from sequential samples at known drain intervals. A high iron value in isolation may reflect component run-in — the trend rate matters more than any single reading.',
      'Not normalizing wear metal concentrations for sample drain interval. Comparing a 250-hour oil sample to a 500-hour sample without normalization gives a misleading wear rate impression — mg/hour of operation is the correct comparison metric.',
      'Using ICP-OES (ASTM D5185) spectroscopy as the sole wear debris detection method. ICP-OES reliably detects particles below 5–8 µm; larger wear debris particles characteristic of accelerated component damage are under-reported. Ferrography or filter debris analysis should supplement ICP for critical equipment.',
    ],
  },

  {
    slug: 'iso-8573-2',
    code: 'ISO 8573-2',
    entityId: 'STD-ISO-8573-2',
    title: 'Compressed Air — Test Methods for Aerosol Oil Content',
    issuingOrganization: 'ISO (International Organization for Standardization)',
    year: '2018 (3rd edition)',
    revisionStatus: 'active',
    metaDescription: 'ISO 8573-2 specifies test methods for measuring oil aerosol and vapour content in compressed air, providing measurement procedures for the oil contamination class defined in ISO 8573-1.',
    scope: 'Measurement of oil aerosol and vapour contamination in compressed air at the point of use, for compressed air treatment system qualification and purity class verification per ISO 8573-1.',
    engineeringPurpose: 'Provides the measurement methodology for the oil content component of the ISO 8573-1 purity class system, enabling verification that coalescing filters, activated carbon beds, and compressed air treatment systems achieve the specified oil aerosol and vapour class in food contact, pharmaceutical, and sensitive process applications.',
    sections: [
      {
        heading: 'Oil Content Measurement Scope',
        body: 'ISO 8573-2 specifies two complementary test methods for measuring total oil content in compressed air: the aerosol method (membrane filter collection and gravimetric measurement for liquid oil mist) and the vapour method (activated carbon sorbent tube collection and solvent extraction for oil vapour). Total oil content = aerosol oil + vapour oil, reported in mg/m³ at reference conditions (20°C, 1 bar). ISO 8573-1 oil classes are verified using the total oil content measurement from ISO 8573-2.',
      },
      {
        heading: 'Compressed Air Treatment Verification',
        body: 'ISO 8573-2 measurement is performed downstream of each treatment stage to verify that the installed equipment achieves the specified oil class. A coalescing pre-filter reduces oil aerosol from compressor lubricant carry-over (typically 5–40 mg/m³ at compressor outlet) to <1 mg/m³ (ISO Class 3 oil). A high-efficiency coalescing stage reduces further to <0.1 mg/m³ (ISO Class 2). An activated carbon adsorber removes oil vapour to <0.01 mg/m³ (ISO Class 1). Point-of-use measurement confirms each stage is functioning correctly under actual operating pressure and flow conditions.',
      },
      {
        heading: 'Relationship to ISO 8573-1',
        body: 'ISO 8573-2 is the test method standard referenced by ISO 8573-1 for the oil contamination class parameter. ISO 8573-1 specifies what purity class is required; ISO 8573-2 specifies how to measure whether that class is achieved. Additional ISO 8573 parts cover other contaminants: Part 3 (water and humidity measurement), Part 4 (solid particles by mass), Part 6 (gaseous contaminants), and Part 9 (liquid water measurement). Together these parts form the complete measurement framework for the ISO 8573-1 purity class system.',
      },
    ],
    keyParams: [
      { label: 'Measurement', value: 'Oil aerosol + vapour (mg/m³)' },
      { label: 'ISO Class 3 oil limit', value: '<1 mg/m³' },
      { label: 'ISO Class 1 oil limit', value: '<0.01 mg/m³' },
      { label: 'Methods', value: 'Membrane filter (aerosol) + sorbent tube (vapour)' },
    ],
    applicableSystems: [],
    relatedGlossaryTerms: ['TERM-COMPRESSED-AIR-PURITY', 'TERM-DEW-POINT', 'TERM-COALESCING'],
    relatedTopics: ['testing-and-validation', 'contamination-control'],
    relatedTechnologies: ['DRYCORE™'],
    relatedArticles: ['compressed-air-systems', 'iso-8573-compressed-air-purity'],
    parentStandard: 'STD-ISO-8573-1',
    commonMistakes: [
      'Using ISO 8573-2 oil aerosol measurement as a proxy for total hydrocarbon content. ISO 8573-2 measures oil aerosol and liquid oil — it does not detect oil vapour, which requires activated carbon treatment and separate measurement.',
      'Not recognising that oil aerosol content in compressed air increases with downstream filter element aging even within the rated service life. Verification measurements must be taken at end-of-life conditions, not only on new elements.',
    ],
  },

  {
    slug: 'iso-3968',
    code: 'ISO 3968',
    entityId: 'STD-ISO-3968',
    title: 'Hydraulic Fluid Power — Filters — Evaluation of Differential Pressure versus Flow Characteristics',
    issuingOrganization: 'ISO (International Organization for Standardization)',
    year: '2001',
    revisionStatus: 'active',
    metaDescription: 'ISO 3968 defines the test method for measuring differential pressure versus flow rate characteristics of hydraulic filter elements, providing the pressure-flow curve data used for system integration and housing selection.',
    scope: 'Hydraulic filter elements and filter assemblies requiring pressure-flow characteristic data for system integration into hydraulic circuit design.',
    engineeringPurpose: 'Provides standardised measurement of filter element pressure-flow (ΔP-Q) characteristics, enabling accurate hydraulic circuit pressure drop modelling and filter housing selection across the full operating flow range — from cold-start viscosity conditions to rated continuous flow.',
    sections: [
      {
        heading: 'Pressure-Flow Test Method',
        body: 'ISO 3968 measures differential pressure across a filter element at a series of flow rates using clean test fluid (ISO VG 15 mineral oil) at a controlled temperature (23 ± 1°C). The test generates a ΔP-Q curve: at zero flow, ΔP is zero; as flow increases, ΔP increases approximately with the square of flow rate for turbulent conditions or linearly for laminar conditions. Multiple measurement points generate the curve, which is fitted to a polynomial or power function for hydraulic circuit modelling. Cold-start correction factors are applied using the viscosity multiplier at the cold start temperature.',
      },
      {
        heading: 'System Integration Application',
        body: 'Pressure-flow data from ISO 3968 is the primary input for hydraulic system pressure drop budgeting. In a typical mobile hydraulic system, filter element pressure drop must not exceed 15–20% of pump delivery pressure at rated flow and operating temperature to maintain acceptable system efficiency. ISO 3968 data allows engineers to select filter elements and housings that maintain acceptable ΔP across the full operating range: cold start (high viscosity, low flow), operating temperature (rated viscosity, rated flow), and end-of-life (clean element, rated flow — the worst-case for initial system design).',
      },
      {
        heading: 'Relationship to ISO 16889',
        body: 'ISO 3968 characterises clean filter element pressure-flow behaviour; ISO 16889 characterises dirty element performance (Beta ratio, DHC, and ΔP buildup during loading). Together, ISO 3968 (initial ΔP) and ISO 16889 (ΔP at end of life) define the complete differential pressure range the filtration system will present to the hydraulic circuit — from first installation to replacement. Both data sets are required for complete filter system integration in high-pressure hydraulic circuit design.',
      },
    ],
    keyParams: [
      { label: 'Test fluid', value: 'ISO VG 15 mineral oil' },
      { label: 'Test temperature', value: '23 ± 1°C (clean element)' },
      { label: 'Output', value: 'ΔP-Q curve (differential pressure vs flow rate)' },
      { label: 'Application', value: 'Circuit pressure drop budgeting and housing selection' },
    ],
    applicableSystems: ['hydraulic-protection', 'lubrication-protection'],
    relatedGlossaryTerms: [
      'TERM-DIFFERENTIAL-PRESSURE', 'TERM-FILTER-BYPASS-VALVE', 'TERM-VISCOSITY',
      'TERM-FULL-FLOW-FILTRATION', 'TERM-KIDNEY-LOOP',
    ],
    relatedTopics: ['contamination-control', 'testing-and-validation', 'filter-media-science'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™', 'INTEKCORE™'],
    relatedArticles: ['hydraulic-power-unit-design', 'filter-element-integrity', 'testing-and-validation'],
    commonMistakes: [
      'Selecting filters based on clean ΔP from ISO 3968 alone without accounting for in-service contaminated ΔP. A fully loaded filter element can have 5–10× the clean differential pressure — system designs using only clean ΔP data underestimate circuit pressure losses.',
      'Comparing ISO 3968 ΔP-Q curves from different manufacturers without confirming identical test fluid viscosity (ISO VG 15 at 23°C). Viscosity differences of ±20% produce proportional ΔP differences — data from different test conditions is not directly comparable.',
      'Not applying cold-start viscosity correction to ISO 3968 data when specifying bypass valve relief settings. Mineral oil at 0°C has 10–15× higher viscosity than at operating temperature — cold-start ΔP may exceed bypass valve opening pressure even on a clean element.',
    ],
  },

];
