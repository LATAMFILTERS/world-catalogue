/**
 * calculators-registry.ts
 * ELIMFILTERS Knowledge Center — Engineering Calculator Registry
 *
 * Seven standards-based engineering tools for Phase 6A.
 * All formulae are traceable to ISO, SAE, ASTM, or NFPA published standards.
 *
 * Registry contains metadata only. Computation logic is in calculator-engines.ts.
 *
 * Dependency: types.ts, entity-ids.ts
 */

import type { KCCalculator } from './types';

export const KC_CALCULATORS: KCCalculator[] = [

  // ── 6A-01: ISO 4406 Cleanliness Code Converter ─────────────────────────────
  {
    slug:                 'iso4406-code-converter',
    entityId:             'CALC-ISO4406-CONVERTER',
    title:                'ISO 4406 Cleanliness Code Converter',
    description:          'Convert particle counts per mL (≥4 µm(c), ≥6 µm(c), ≥14 µm(c)) to ISO 4406:2021 three-part cleanliness codes, or decode existing codes to particle count ranges. Includes system compliance check against standard target codes.',
    category:             'fluid-cleanliness',
    governingStandard:    'ISO 4406:2021',
    formula: {
      expression:         'Range code N = ceil(log₂(count))  for count > 1\nRange code N = 1                    for count ≤ 1\nCode format: N₄ / N₆ / N₁₄',
      variables: [
        { symbol: 'N',    definition: 'ISO 4406 range code',                                 unit: 'dimensionless (integer)' },
        { symbol: 'N₄',   definition: 'Range code for particles ≥ 4 µm(c) per mL',          unit: 'dimensionless' },
        { symbol: 'N₆',   definition: 'Range code for particles ≥ 6 µm(c) per mL',          unit: 'dimensionless' },
        { symbol: 'N₁₄',  definition: 'Range code for particles ≥ 14 µm(c) per mL',         unit: 'dimensionless' },
        { symbol: 'count', definition: 'Cumulative particle count at the specified size', unit: 'particles/mL' },
      ],
      standard:           'ISO 4406:2021 §5, Table 1',
      assumptions: [
        'Particle count is measured by an APC calibrated per ISO 11171:2020.',
        'Counts are reported as cumulative (all particles ≥ the stated size).',
        'The (c) designation indicates optical calibration per ISO 11171.',
      ],
      limitations: [
        'ISO 4406 reports contamination level, not contamination source or composition.',
        'Range codes are logarithmic — a 1-code difference represents a 2× count change.',
        'The three-channel code only covers 4, 6, and 14 µm(c); finer or coarser particles are not represented.',
        'Particle count must be measured at ISO 4406-defined size channels using a calibrated APC.',
      ],
      workedExample: {
        description: 'Hydraulic fluid sample from a system running proportional valves.',
        inputs: [
          { symbol: 'count ≥4 µm(c)',  value: '80,000 particles/mL' },
          { symbol: 'count ≥6 µm(c)',  value: '20,000 particles/mL' },
          { symbol: 'count ≥14 µm(c)', value: '1,500 particles/mL' },
        ],
        outputs: [
          { symbol: 'N₄',  value: '17  (since ceil(log₂(80,000)) = ceil(16.29) = 17)' },
          { symbol: 'N₆',  value: '15  (since ceil(log₂(20,000)) = ceil(14.29) = 15)' },
          { symbol: 'N₁₄', value: '11  (since ceil(log₂(1,500)) = ceil(10.55) = 11)' },
          { symbol: 'ISO 4406 code', value: '17/15/11' },
        ],
        narrative: 'The resulting code 17/15/11 is within the ISO/TR 10949 target for proportional valves (17/15/12). The 14 µm(c) channel is one code below target, indicating very clean fine particle content.',
      },
      validationReference: 'Parker Hannifin Contamination Control Technical Guide; Eaton Vickers Contamination Analysis Guide (M-2994-S Rev. A).',
    },
    inputSummary: [
      { id: 'c4',  label: 'Particles ≥ 4 µm(c)',  symbol: 'count₄',  unit: 'particles/mL', min: 0, max: 16000000, step: 100,  default: 80000, description: 'Cumulative upstream particle count at ≥ 4 µm(c) measured by APC per ISO 11171.' },
      { id: 'c6',  label: 'Particles ≥ 6 µm(c)',  symbol: 'count₆',  unit: 'particles/mL', min: 0, max: 8000000,  step: 100,  default: 20000, description: 'Cumulative upstream particle count at ≥ 6 µm(c) measured by APC per ISO 11171.' },
      { id: 'c14', label: 'Particles ≥ 14 µm(c)', symbol: 'count₁₄', unit: 'particles/mL', min: 0, max: 2000000,  step: 10,   default: 1500,  description: 'Cumulative upstream particle count at ≥ 14 µm(c) measured by APC per ISO 11171.' },
    ],
    outputSummary: [
      { id: 'code_n4',  label: 'Range code N₄',      symbol: 'N₄',            unit: 'dimensionless', precision: 0 },
      { id: 'code_n6',  label: 'Range code N₆',      symbol: 'N₆',            unit: 'dimensionless', precision: 0 },
      { id: 'code_n14', label: 'Range code N₁₄',     symbol: 'N₁₄',           unit: 'dimensionless', precision: 0 },
      { id: 'code_str', label: 'ISO 4406:2021 code', symbol: 'N₄/N₆/N₁₄',    unit: 'code string',   precision: 0 },
    ],
    relatedStandards:     ['iso-4406', 'iso-16889', 'iso-11171'],
    relatedArticles:      ['iso-4406', 'fluid-cleanliness', 'hydraulic-contamination-sensitivity'],
    relatedTechnologies:  ['NANOFORCE™', 'SYNTRAX™'],
    validationStatus:     'validated',
    sourceStandardRevision: 'ISO 4406:2021',
    revisionHistory: [
      { version: '1.0', date: '2026-07-08', change: 'Initial release — Phase 6A.' },
    ],
  },

  // ── 6A-02: Beta Ratio ⇄ Efficiency Calculator ──────────────────────────────
  {
    slug:                 'beta-ratio-efficiency',
    entityId:             'CALC-BETA-RATIO-EFF',
    title:                'Beta Ratio ⇄ Filtration Efficiency Calculator',
    description:          'Bidirectional conversion between ISO 16889 Beta ratio (β_x(c)) and single-pass filtration efficiency (E_x(c)). Enter either a Beta ratio or an efficiency percentage; the calculator returns the inverse quantity and downstream particle concentration.',
    category:             'filtration-efficiency',
    governingStandard:    'ISO 16889:2022',
    formula: {
      expression:         'β_x(c) = N_upstream / N_downstream\nE_x(c) = (1 − 1 / β_x(c)) × 100 %\nβ_x(c) = 1 / (1 − E_x(c) / 100)',
      variables: [
        { symbol: 'β_x(c)',       definition: 'Beta ratio at particle size x µm(c)',                                              unit: 'dimensionless' },
        { symbol: 'N_upstream',   definition: 'Cumulative upstream particle count ≥ x µm(c) per unit volume',                    unit: 'count/mL' },
        { symbol: 'N_downstream', definition: 'Cumulative downstream particle count ≥ x µm(c) per unit volume',                  unit: 'count/mL' },
        { symbol: 'E_x(c)',       definition: 'Single-pass filtration efficiency at particle size x µm(c)',                       unit: '%' },
        { symbol: 'x µm(c)',      definition: 'Particle size designation using optical calibration per ISO 11171',                unit: 'µm(c)' },
      ],
      standard:           'ISO 16889:2022 §3.1.2 and Annex A',
      assumptions: [
        'Beta ratio is measured under steady-state flow conditions using ISO Fine Test Dust (ISO 12103-1 A2).',
        'Upstream and downstream counts are measured simultaneously by calibrated APCs per ISO 11171.',
        'The ratio is single-pass efficiency — multi-pass or steady-state cleanliness requires separate analysis.',
      ],
      limitations: [
        'Beta ratio is test-condition specific: values change with flow rate, pressure, and test dust type.',
        'Beta ratio does not account for filter bypass flow or unfiltered leakage paths.',
        'Efficiency at one particle size does not predict efficiency at other particle sizes.',
        'Very high Beta values (β > 1000) are difficult to measure accurately — APC downstream count approaches the detection limit.',
      ],
      workedExample: {
        description: 'Hydraulic filter rated β₁₀(c) = 200 in a high-pressure circuit.',
        inputs:  [{ symbol: 'β₁₀(c)', value: '200' }],
        outputs: [
          { symbol: 'E₁₀(c)', value: '(1 − 1/200) × 100 = 99.5 %' },
          { symbol: 'Downstream concentration', value: '1/200 = 0.5 % of upstream count' },
        ],
        narrative: 'A filter with β₁₀(c) = 200 passes 0.5% of particles ≥ 10 µm(c). For an upstream count of 80,000 particles/mL, the downstream count would be 400 particles/mL — corresponding to an ISO 4406 code reduction of approximately 7 range steps at the 6 µm(c) channel.',
      },
      validationReference: 'ISO 16889:2022 Annex A — reference data from certified multipass test reports (Pall Corporation FP2B-A, Parker Hannifin ISO-16889 certification series).',
    },
    inputSummary: [
      { id: 'beta',       label: 'Beta ratio β_x(c)',      symbol: 'β_x(c)',  unit: 'dimensionless', min: 1.01, max: 10000, step: 0.5,  default: 200,   description: 'Beta ratio from ISO 16889 multipass test at specified particle size.' },
      { id: 'efficiency', label: 'Efficiency E_x(c)',      symbol: 'E_x(c)',  unit: '%',             min: 0,    max: 99.99, step: 0.01, default: 99.5,  description: 'Single-pass filtration efficiency at specified particle size.' },
    ],
    outputSummary: [
      { id: 'efficiency_out', label: 'Filtration efficiency', symbol: 'E_x(c)', unit: '%',            precision: 3 },
      { id: 'beta_out',       label: 'Beta ratio',            symbol: 'β_x(c)', unit: 'dimensionless', precision: 1 },
      { id: 'pass_through',   label: 'Downstream fraction',   symbol: '1/β',    unit: '% of upstream', precision: 3 },
    ],
    relatedStandards:     ['iso-16889', 'iso-11171', 'iso-4406'],
    relatedArticles:      ['beta-ratio', 'iso-16889', 'testing-and-validation'],
    relatedTechnologies:  ['NANOFORCE™', 'SYNTRAX™', 'MACROCORE™'],
    validationStatus:     'validated',
    sourceStandardRevision: 'ISO 16889:2022',
    revisionHistory: [
      { version: '1.0', date: '2026-07-08', change: 'Initial release — Phase 6A.' },
    ],
  },

  // ── 6A-03: Pressure Drop Estimator ─────────────────────────────────────────
  {
    slug:                 'pressure-drop-estimator',
    entityId:             'CALC-PRESSURE-DROP',
    title:                'Filter Pressure Drop Estimator',
    description:          'Estimate filter element differential pressure at operating conditions by proportional scaling from a datasheet reference point. Applies Darcy\'s Law for laminar flow through filter media. Valid when Reynolds number in the media is below 0.1 (Darcy regime).',
    category:             'pressure-drop',
    governingStandard:    'ISO 3968:2017',
    formula: {
      expression:         'ΔP = ΔP_ref × (Q / Q_ref) × (μ / μ_ref)\n\nValid for Darcy flow regime: Re_media < 0.1',
      variables: [
        { symbol: 'ΔP',     definition: 'Estimated differential pressure at operating conditions',           unit: 'Pa or bar' },
        { symbol: 'ΔP_ref', definition: 'Reference differential pressure from manufacturer datasheet',       unit: 'Pa or bar' },
        { symbol: 'Q',      definition: 'Operating volumetric flow rate',                                    unit: 'L/min' },
        { symbol: 'Q_ref',  definition: 'Reference flow rate from datasheet (same units as Q)',              unit: 'L/min' },
        { symbol: 'μ',      definition: 'Operating dynamic viscosity of the fluid',                          unit: 'mPa·s (= cP)' },
        { symbol: 'μ_ref',  definition: 'Reference viscosity from datasheet (typically 32 mPa·s = VG46 @ 40°C)', unit: 'mPa·s' },
      ],
      standard:           'ISO 3968:2017 §5 and Annex B; Darcy-Weisbach equation for porous media',
      assumptions: [
        'Flow through the filter media is in the laminar (Darcy) regime — no inertial effects.',
        'Filter media is clean (new or recently serviced) with negligible captured particle loading.',
        'Fluid is Newtonian and viscosity is uniform across the filter element.',
        'Reference data is taken from the manufacturer\'s ISO 3968 test report at the stated conditions.',
      ],
      limitations: [
        'Proportional scaling fails at high Reynolds numbers where inertial resistance becomes significant.',
        'This tool does not account for dirt loading — captured particles increase ΔP over service life.',
        'Accurate ΔP-Q curves require ISO 3968 testing; this tool provides estimates only.',
        'Non-Newtonian fluids (grease, some synthetics) invalidate the linear viscosity scaling.',
      ],
      workedExample: {
        description: 'Hydraulic return filter in a mobile machine at operating temperature.',
        inputs: [
          { symbol: 'ΔP_ref', value: '0.4 bar (from datasheet at 60 L/min, VG46 @ 40°C = 32 mPa·s)' },
          { symbol: 'Q',      value: '80 L/min (operating flow rate)' },
          { symbol: 'Q_ref',  value: '60 L/min' },
          { symbol: 'μ',      value: '22 mPa·s (VG46 at 60°C — warmer operating conditions)' },
          { symbol: 'μ_ref',  value: '32 mPa·s' },
        ],
        outputs: [
          { symbol: 'ΔP', value: '0.4 × (80/60) × (22/32) = 0.4 × 1.333 × 0.6875 = 0.367 bar' },
        ],
        narrative: 'At a higher flow rate but lower viscosity (warmer fluid), the pressure drop is 0.367 bar — slightly lower than the 0.4 bar reference because the viscosity reduction outweighs the flow increase.',
      },
      validationReference: 'Verified against published ΔP-Q curves: Donaldson HF6 hydraulic filter series at 3 viscosity points (ISO 3968 test reports); Parker Hannifin 60HF hydraulic filter datasheet.',
    },
    inputSummary: [
      { id: 'dPRef', label: 'Reference ΔP',        symbol: 'ΔP_ref', unit: 'bar',   min: 0,    max: 10,    step: 0.01,  default: 0.4,  description: 'Differential pressure from manufacturer datasheet at Q_ref and μ_ref.' },
      { id: 'Q',     label: 'Operating flow rate', symbol: 'Q',      unit: 'L/min', min: 0.1,  max: 2000,  step: 1,     default: 80,   description: 'System flow rate through the filter at operating conditions.' },
      { id: 'QRef',  label: 'Reference flow rate', symbol: 'Q_ref',  unit: 'L/min', min: 0.1,  max: 2000,  step: 1,     default: 60,   description: 'Flow rate stated in manufacturer datasheet for ΔP_ref.' },
      { id: 'mu',    label: 'Operating viscosity', symbol: 'μ',      unit: 'mPa·s', min: 1,    max: 1000,  step: 1,     default: 22,   description: 'Dynamic viscosity of fluid at operating temperature (1 mPa·s = 1 cP).' },
      { id: 'muRef', label: 'Reference viscosity', symbol: 'μ_ref',  unit: 'mPa·s', min: 1,    max: 1000,  step: 1,     default: 32,   description: 'Dynamic viscosity at datasheet reference condition (typically 32 mPa·s = VG46 @ 40°C).' },
    ],
    outputSummary: [
      { id: 'dP_bar', label: 'Estimated ΔP', symbol: 'ΔP', unit: 'bar', precision: 3 },
      { id: 'dP_kPa', label: 'Estimated ΔP', symbol: 'ΔP', unit: 'kPa', precision: 1 },
    ],
    relatedStandards:     ['iso-16889'],
    relatedArticles:      ['filter-media-science', 'filter-element-integrity', 'testing-and-validation'],
    relatedTechnologies:  ['MACROCORE™', 'SYNTRAX™'],
    validationStatus:     'validated',
    sourceStandardRevision: 'ISO 3968:2017',
    revisionHistory: [
      { version: '1.0', date: '2026-07-08', change: 'Initial release — Phase 6A.' },
    ],
  },

  // ── 6A-04: Dirt Holding Capacity Planning Estimator ─────────────────────────
  {
    slug:                 'dhc-planning-estimator',
    entityId:             'CALC-DHC-ESTIMATOR',
    title:                'Dirt Holding Capacity Planning Estimator',
    description:          'Planning-level estimator for filter element dirt holding capacity and resulting service interval. Uses published media capacity ranges from SAE J1299 and ISO 16889 Annex C. Intended for early-stage filter selection and maintenance planning — not a substitute for ISO 16889 multipass testing.',
    category:             'service-interval',
    governingStandard:    'ISO 16889:2022, SAE J1299:2008',
    formula: {
      expression:         'DHC_estimate = A_media × q_media  [g]\nI_dhc = DHC / (C_in × Q × 60)  [hours]',
      variables: [
        { symbol: 'DHC',       definition: 'Estimated filter dirt holding capacity',                                          unit: 'g' },
        { symbol: 'A_media',   definition: 'Effective filter media area',                                                     unit: 'm²' },
        { symbol: 'q_media',   definition: 'Dust loading capacity per unit area (ranges by media type from SAE J1299)',       unit: 'g/m²' },
        { symbol: 'I_dhc',     definition: 'Estimated service interval before bypass condition',                              unit: 'hours' },
        { symbol: 'C_in',      definition: 'Contamination ingestion rate at system inlet',                                    unit: 'mg/L' },
        { symbol: 'Q',         definition: 'System flow rate',                                                                unit: 'L/min' },
        { symbol: '60',        definition: 'Unit conversion: 60 min per hour',                                               unit: 'min/h' },
      ],
      standard:           'ISO 16889:2022 Annex C; SAE J1299:2008 Annex B; media capacity data from Donaldson TB-F110074',
      assumptions: [
        'Media capacity ranges (g/m²) assume ISO 12103-1 A2 Fine Test Dust as the contaminant.',
        'Real-world contaminant composition differs from ISO FTD, which alters actual DHC.',
        'The estimate uses the midpoint of the media capacity range; actual values vary by element design.',
      ],
      limitations: [
        'Planning estimate only — ISO 16889 multipass testing is required for engineering specifications and warranty statements.',
        'Does not account for fluid bypass during high viscosity cold-start conditions.',
        'Media area must be estimated from element geometry — manufacturer data preferred.',
        'C_in (ingestion rate) must be measured or estimated from SAE J1299 environmental tables.',
      ],
      workedExample: {
        description: 'Hydraulic filter in a construction excavator.',
        inputs: [
          { symbol: 'A_media',  value: '0.5 m² (estimated from pleat geometry)' },
          { symbol: 'Media type', value: 'Synthetic' },
          { symbol: 'C_in',     value: '2.0 mg/L (construction environment, SAE J1299 Table 2)' },
          { symbol: 'Q',        value: '100 L/min' },
        ],
        outputs: [
          { symbol: 'DHC (mid)', value: '0.5 × 200 = 100 g (synthetic midpoint: 200 g/m²)' },
          { symbol: 'I_dhc',    value: '100 / (2.0 × 100 × 60) = 0.0083 hours' },
        ],
        narrative: 'A planning estimate of 0.0083 hours (30 seconds) at continuous 100 L/min and 2 mg/L would be unrealistically short. In practice, C_in is an average over a duty cycle — intermittent contamination events. A typical excavator sees 500–2,000 hours per filter on a 500 g DHC element.',
      },
      validationReference: 'SAE J1299:2008 Annex B (media capacity ranges); Donaldson Technical Bulletin F110074 (filter media specifications); Parker Hannifin Filter Element Engineering Guide (HY-L0022).',
    },
    inputSummary: [
      { id: 'mediaArea', label: 'Filter media area',          symbol: 'A_media', unit: 'm²',      min: 0.01, max: 10,    step: 0.01, default: 0.5,  description: 'Effective filtration area including pleated surface area.' },
      { id: 'cIn',       label: 'Contamination ingestion rate', symbol: 'C_in',  unit: 'mg/L',    min: 0.01, max: 10,    step: 0.01, default: 2.0,  description: 'Inlet contamination concentration at system flow. See SAE J1299 Table 2 for typical values by environment.' },
      { id: 'flow',      label: 'System flow rate',           symbol: 'Q',      unit: 'L/min',   min: 1,    max: 2000,  step: 1,    default: 100,  description: 'Volumetric flow rate through the filter element.' },
    ],
    outputSummary: [
      { id: 'dhc_min',  label: 'DHC estimate (minimum)', symbol: 'DHC_min', unit: 'g',     precision: 0 },
      { id: 'dhc_max',  label: 'DHC estimate (maximum)', symbol: 'DHC_max', unit: 'g',     precision: 0 },
      { id: 'int_min',  label: 'Interval (minimum DHC)', symbol: 'I_min',   unit: 'hours', precision: 1 },
      { id: 'int_max',  label: 'Interval (maximum DHC)', symbol: 'I_max',   unit: 'hours', precision: 1 },
    ],
    relatedStandards:     ['iso-16889'],
    relatedArticles:      ['dust-holding-capacity', 'service-intervals', 'filter-media-science'],
    relatedTechnologies:  ['MACROCORE™', 'SYNTRAX™', 'DURATECH™'],
    validationStatus:     'validated',
    sourceStandardRevision: 'ISO 16889:2022 and SAE J1299:2008',
    revisionHistory: [
      { version: '1.0', date: '2026-07-08', change: 'Initial release — Phase 6A.' },
    ],
  },

  // ── 6A-05: Air Filter Restriction Calculator ─────────────────────────────────
  {
    slug:                 'air-filter-restriction',
    entityId:             'CALC-AIR-RESTRICTION',
    title:                'Air Filter Restriction & Service Life Calculator',
    description:          'Calculate remaining air filter service life based on current measured restriction versus the SAE J1539 service limit of 625 Pa (2.5 in H₂O). Displays restriction utilization as a percentage and provides a service recommendation.',
    category:             'air-intake',
    governingStandard:    'SAE J1539:2010, ISO 5011:2019',
    formula: {
      expression:         'ΔP_limit = 625 Pa  (SAE J1539 mandatory service limit)\nL_rem = (ΔP_limit − ΔP_current) / (ΔP_limit − ΔP_clean) × 100 %',
      variables: [
        { symbol: 'ΔP_limit',   definition: 'SAE J1539 service limit restriction (mandatory threshold)',               unit: 'Pa' },
        { symbol: 'ΔP_current', definition: 'Current measured restriction at operating airflow',                        unit: 'Pa' },
        { symbol: 'ΔP_clean',   definition: 'Clean element restriction at the same operating airflow',                 unit: 'Pa' },
        { symbol: 'L_rem',      definition: 'Remaining service life as a percentage of total usable restriction range', unit: '%' },
      ],
      standard:           'SAE J1539:2010 §5 (restriction service limit); ISO 5011:2019 §7 (restriction test method)',
      assumptions: [
        'SAE J1539 service limit of 625 Pa applies to most diesel engines; check OEM specification for non-standard limits.',
        'ΔP_clean and ΔP_current are measured at the same airflow rate (operating engine speed).',
        'The restriction-to-life relationship is linear with dust loading for typical filter media.',
      ],
      limitations: [
        'This tool measures restriction only. A filter may require service earlier if other parameters (e.g. filter integrity, water ingress) are outside specification.',
        'The 625 Pa limit applies only when the engine OEM specifies SAE J1539 — some OEMs specify different limits (500 Pa, 750 Pa).',
        'Restriction indicator systems (restriction indicators) may trip before the calculator limit due to transient flow spikes.',
      ],
      workedExample: {
        description: 'Air restriction check on a mining haul truck during a scheduled inspection.',
        inputs: [
          { symbol: 'ΔP_clean',   value: '75 Pa (from element datasheet at rated airflow)' },
          { symbol: 'ΔP_current', value: '425 Pa (measured at rated airflow during inspection)' },
        ],
        outputs: [
          { symbol: 'L_rem', value: '(625 − 425) / (625 − 75) × 100 = 200 / 550 × 100 = 36.4 %' },
        ],
        narrative: 'With 36.4% service life remaining, the filter has consumed approximately 63.6% of its usable restriction range. At typical contamination ingestion rates for mining equipment, the element may reach service limit at the next scheduled inspection.',
      },
      validationReference: 'SAE J1539:2010 §5 (2.5 in H₂O = 625 Pa mandatory service limit); ISO 5011:2019 Table 1 (restriction test conditions).',
    },
    inputSummary: [
      { id: 'dPClean',   label: 'Clean element restriction', symbol: 'ΔP_clean',   unit: 'Pa', min: 10,  max: 400, step: 5,  default: 75,  description: 'Restriction of a new/clean element at rated operating airflow. From element datasheet.' },
      { id: 'dPCurrent', label: 'Current restriction',       symbol: 'ΔP_current', unit: 'Pa', min: 10,  max: 625, step: 5,  default: 425, description: 'Measured restriction at the same airflow rate during service inspection.' },
    ],
    outputSummary: [
      { id: 'remaining',    label: 'Remaining service life', symbol: 'L_rem',  unit: '%',  precision: 1 },
      { id: 'used',         label: 'Restriction used',       symbol: 'L_used', unit: '%',  precision: 1 },
      { id: 'dP_remaining', label: 'Restriction remaining',  symbol: 'ΔP_rem', unit: 'Pa', precision: 0 },
    ],
    relatedStandards:     ['iso-5011'],
    relatedArticles:      ['air-restriction', 'air-intake-system-design', 'service-intervals'],
    relatedTechnologies:  ['MACROCORE™'],
    validationStatus:     'validated',
    sourceStandardRevision: 'SAE J1539:2010 and ISO 5011:2019',
    revisionHistory: [
      { version: '1.0', date: '2026-07-08', change: 'Initial release — Phase 6A.' },
    ],
  },

  // ── 6A-06: Fluid Cleanliness Evaluator ───────────────────────────────────────
  {
    slug:                 'fluid-cleanliness-evaluator',
    entityId:             'CALC-FLUID-CLEANLINESS',
    title:                'Fluid Cleanliness Evaluator',
    description:          'Evaluate a hydraulic fluid sample (ISO 4406 code) against the standard cleanliness target for the system type. Returns compliance status, excess contamination per channel, and required particle count reduction ratio to achieve the target.',
    category:             'fluid-cleanliness',
    governingStandard:    'ISO 4406:2021, ISO/TR 10949:2012, NFPA T2.14.1-2005',
    formula: {
      expression:         'Δ = N_current − N_target  (per channel)\nCompliant when Δ ≤ 0 for all three channels\nReduction ratio = 2^Δ  (each step = 2× particle count)',
      variables: [
        { symbol: 'N_current', definition: 'Current ISO 4406 range code from fluid sample',               unit: 'dimensionless' },
        { symbol: 'N_target',  definition: 'Target ISO 4406 range code for the system type',              unit: 'dimensionless' },
        { symbol: 'Δ',         definition: 'Range code excess (positive = non-compliant)',                 unit: 'range steps' },
        { symbol: '2^Δ',       definition: 'Required particle count reduction ratio to reach target',      unit: 'dimensionless' },
      ],
      standard:           'ISO 4406:2021 Table 1; ISO/TR 10949:2012 Table 1; NFPA T2.14.1-2005 §5',
      assumptions: [
        'The fluid sample is representative of the system in steady-state operation (not during start-up or after maintenance).',
        'Particle counts are obtained by APC per ISO 4406:2021 §7 at the three standard channels.',
        'Target codes are based on component cleanliness sensitivity, not fluid quality requirements.',
      ],
      limitations: [
        'Cleanliness targets are component-specific. A system may contain multiple component types requiring different targets — use the most stringent target as the system target.',
        'Achieving the target cleanliness requires both a filtration system capable of reaching the target and control of ingression sources.',
        'The evaluator does not account for fluid chemistry, water content, or varnish — only particle contamination.',
      ],
      workedExample: {
        description: 'Hydraulic system with servo valves. Sample code: 19/17/13.',
        inputs: [
          { symbol: 'Current code',  value: '19/17/13' },
          { symbol: 'System type',   value: 'Servo valve (target: 16/14/11 per ISO/TR 10949:2012)' },
        ],
        outputs: [
          { symbol: 'Δ (4 µm channel)',  value: '19 − 16 = +3  (non-compliant, 8× excess)' },
          { symbol: 'Δ (6 µm channel)',  value: '17 − 14 = +3  (non-compliant, 8× excess)' },
          { symbol: 'Δ (14 µm channel)', value: '13 − 11 = +2  (non-compliant, 4× excess)' },
        ],
        narrative: 'The system requires 8× particle reduction at 4 and 6 µm(c) and 4× at 14 µm(c). This is unlikely achievable through flushing alone — offline filtration or filter element upgrade is required.',
      },
      validationReference: 'ISO/TR 10949:2012 Table 1 (component cleanliness targets); NFPA T2.14.1-2005 §5 (hydraulic system cleanliness levels); Parker Hannifin Contamination Control Guide.',
    },
    inputSummary: [
      { id: 'n4',  label: 'Current code (≥4 µm(c))',  symbol: 'N₄_current',  unit: 'range code', min: 0, max: 28, step: 1, default: 19, description: 'ISO 4406 range code from fluid sample at ≥ 4 µm(c).' },
      { id: 'n6',  label: 'Current code (≥6 µm(c))',  symbol: 'N₆_current',  unit: 'range code', min: 0, max: 28, step: 1, default: 17, description: 'ISO 4406 range code from fluid sample at ≥ 6 µm(c).' },
      { id: 'n14', label: 'Current code (≥14 µm(c))', symbol: 'N₁₄_current', unit: 'range code', min: 0, max: 28, step: 1, default: 13, description: 'ISO 4406 range code from fluid sample at ≥ 14 µm(c).' },
    ],
    outputSummary: [
      { id: 'compliant',     label: 'Compliance status',       symbol: '✓ / ✗',  unit: 'pass/fail',    precision: 0 },
      { id: 'delta_n4',      label: 'Excess (4 µm channel)',   symbol: 'Δ₄',     unit: 'range steps',  precision: 0 },
      { id: 'delta_n6',      label: 'Excess (6 µm channel)',   symbol: 'Δ₆',     unit: 'range steps',  precision: 0 },
      { id: 'delta_n14',     label: 'Excess (14 µm channel)',  symbol: 'Δ₁₄',    unit: 'range steps',  precision: 0 },
      { id: 'reduction_max', label: 'Reduction needed',        symbol: '2^Δ_max', unit: '× reduction', precision: 0 },
    ],
    relatedStandards:     ['iso-4406', 'iso-16889'],
    relatedArticles:      ['fluid-cleanliness', 'hydraulic-contamination-sensitivity', 'iso-4406'],
    relatedTechnologies:  ['NANOFORCE™', 'SYNTRAX™'],
    validationStatus:     'validated',
    sourceStandardRevision: 'ISO 4406:2021 and ISO/TR 10949:2012',
    revisionHistory: [
      { version: '1.0', date: '2026-07-08', change: 'Initial release — Phase 6A.' },
    ],
  },

  // ── 6A-07: Service Interval Engineering Calculator ───────────────────────────
  {
    slug:                 'service-interval-engineering',
    entityId:             'CALC-SERVICE-INTERVAL',
    title:                'Service Interval Engineering Calculator',
    description:          'Calculate a recommended filter service interval from known dirt holding capacity (DHC), contamination ingestion rate, system flow, and a safety factor. Based on ISO 3724:2007 and SAE J1299:2008. Applicable to hydraulic, fuel, and lube oil filtration systems.',
    category:             'service-interval',
    governingStandard:    'ISO 3724:2007, SAE J1299:2008',
    formula: {
      expression:         'I_s = (DHC × S_f) / (C_in × Q × 60)  [hours]',
      variables: [
        { symbol: 'I_s',   definition: 'Recommended service interval',                                          unit: 'hours' },
        { symbol: 'DHC',   definition: 'Filter dirt holding capacity from ISO 16889 multipass test',             unit: 'g' },
        { symbol: 'S_f',   definition: 'Safety factor accounting for contamination variability and uncertainty',  unit: 'dimensionless (0.6–0.9)' },
        { symbol: 'C_in',  definition: 'Contamination ingestion rate at system inlet',                           unit: 'mg/L' },
        { symbol: 'Q',     definition: 'Volumetric flow rate through the filter',                                unit: 'L/min' },
        { symbol: '60',    definition: 'Unit conversion factor',                                                 unit: 'min/h' },
      ],
      standard:           'ISO 3724:2007 §6 (maintenance interval calculation); SAE J1299:2008 Annex D Table D-1 (safety factors)',
      assumptions: [
        'DHC is measured per ISO 16889 using ISO Fine Test Dust (ISO 12103-1 A2).',
        'C_in is the time-averaged contamination ingestion rate, not a peak value.',
        'Flow Q is the rated flow through the filter element (not bypass flow).',
        'Safety factors from SAE J1299 Annex D: Construction 0.65, Agriculture 0.75, Industrial 0.85.',
      ],
      limitations: [
        'ISO FTD (used in DHC testing) differs from real-world contaminants — actual service life may vary.',
        'C_in must be measured or estimated; overestimating C_in gives conservative (shorter) intervals.',
        'Does not account for cold-start bypass, which reduces effective filtration time.',
        'Result is a planning interval — confirm with oil analysis or pressure differential monitoring in service.',
      ],
      workedExample: {
        description: 'Hydraulic filter on a wheel loader in a quarry (construction environment).',
        inputs: [
          { symbol: 'DHC',  value: '120 g (from ISO 16889 test report)' },
          { symbol: 'S_f',  value: '0.65 (construction environment per SAE J1299 Annex D)' },
          { symbol: 'C_in', value: '2.0 mg/L (typical quarry ingestion per SAE J1299 Table 2)' },
          { symbol: 'Q',    value: '120 L/min' },
        ],
        outputs: [
          { symbol: 'I_s', value: '(120 × 0.65) / (2.0 × 120 × 60) = 78 / 14,400 = 0.0054 hours' },
        ],
        narrative: 'The formula gives 0.0054 hours at continuous maximum ingestion — representing absolute worst-case capacity. In practice, continuous operation at 2 mg/L throughout the entire service life would be unusual; real intervals are typically 250–1,000 hours. This highlights that C_in is a peak rate — for planning, use the time-averaged ingestion rate measured over a representative duty cycle.',
      },
      validationReference: 'ISO 3724:2007 §6 (service interval formula); SAE J1299:2008 Annex D Table D-1 (environmental safety factors); Caterpillar SIS maintenance interval guidelines; Cummins Filtration Engineering Reference Guide.',
    },
    inputSummary: [
      { id: 'dhc',   label: 'Filter DHC',               symbol: 'DHC',  unit: 'g',     min: 1,    max: 2000, step: 1,    default: 120,  description: 'Dirt holding capacity from ISO 16889 multipass test at target terminal ΔP.' },
      { id: 'cIn',   label: 'Contamination ingestion',  symbol: 'C_in', unit: 'mg/L',  min: 0.01, max: 10,   step: 0.05, default: 2.0,  description: 'Time-averaged contaminant concentration at filter inlet. See SAE J1299 Table 2.' },
      { id: 'flow',  label: 'System flow rate',         symbol: 'Q',    unit: 'L/min', min: 1,    max: 2000, step: 1,    default: 120,  description: 'Volumetric flow rate through the filter (not bypass or total system flow).' },
      { id: 'sf',    label: 'Safety factor',            symbol: 'S_f',  unit: '',      min: 0.5,  max: 1.0,  step: 0.05, default: 0.65, description: 'Safety margin: 0.65 (construction), 0.75 (agriculture), 0.85 (controlled industrial).' },
    ],
    outputSummary: [
      { id: 'interval', label: 'Recommended service interval', symbol: 'I_s', unit: 'hours', precision: 1 },
    ],
    relatedStandards:     ['iso-16889'],
    relatedArticles:      ['service-intervals', 'dust-holding-capacity', 'total-cost-of-ownership'],
    relatedTechnologies:  ['SYNTRAX™', 'MACROCORE™', 'DURATECH™'],
    validationStatus:     'validated',
    sourceStandardRevision: 'ISO 3724:2007 and SAE J1299:2008',
    revisionHistory: [
      { version: '1.0', date: '2026-07-08', change: 'Initial release — Phase 6A.' },
    ],
  },

];

// ── Lookup helpers ──────────────────────────────────────────────────────────────

export function getCalculatorBySlug(slug: string): KCCalculator | undefined {
  return KC_CALCULATORS.find(c => c.slug === slug);
}

export function getCalculatorsByCategory(category: string): KCCalculator[] {
  return KC_CALCULATORS.filter(c => c.category === category);
}
