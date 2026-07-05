/**
 * standards-registry.ts
 * ELIMFILTERS Knowledge Center — Standards Data
 *
 * Dependency: ./types
 */

import type { KCStandard } from './types';

// ─── STANDARDS ────────────────────────────────────────────────────────────────

export const KC_STANDARDS: KCStandard[] = [
  {
    slug: 'iso-16889',
    code: 'ISO 16889',
    title: 'Hydraulic Fluid Power — Multi-Pass Method for Evaluating Filter Element Performance',
    metaDescription: 'ISO 16889 defines the multi-pass test method for hydraulic and lubrication filter elements, establishing Beta ratio, dirt holding capacity, and performance classification methodology.',
    scope: 'Hydraulic and lubrication filter elements used in hydraulic fluid power systems.',
    year: '2022 (4th edition)',
    sections: [
      {
        heading: 'Scope and Application',
        body: 'ISO 16889 specifies the multi-pass method for testing filter elements used in hydraulic fluid power systems, including lube oil filtration. The test measures filter efficiency (Beta ratio), dirt holding capacity (grams of A2 medium test dust), and differential pressure characteristics throughout the test cycle. The standard applies to full-flow and bypass filter elements operating in petroleum and synthetic hydraulic fluids.',
      },
      {
        heading: 'Test Methodology',
        body: 'Contaminated test fluid (ISO VG 15 mineral oil at 60°C) containing ISO A2 medium test dust is circulated through the filter element at rated flow. Automatic particle counters (calibrated per ISO 11171) measure particle concentrations upstream and downstream simultaneously. Counts at ≥4, ≥6, ≥10, ≥14, ≥21, and ≥38 µm provide Beta values across the capture range. The test continues until terminal differential pressure (typically 6 bar) is reached.',
      },
      {
        heading: 'Beta Ratio Interpretation',
        body: 'Beta ratio (β) at a given particle size is the ratio of upstream to downstream particle count at that size. β₆(c) = 200 indicates that for every 200 particles >6 µm upstream, one particle exits downstream — 99.5% efficiency. The "(c)" suffix confirms ISO 11171 calibrated counting. Beta values vary continuously throughout the test as the element loads with contaminant; the reported value is the filtration ratio averaged over the test.',
      },
    ],
    keyParams: [
      { label: 'Test fluid', value: 'ISO VG 15 mineral oil' },
      { label: 'Test temperature', value: '60 ± 2°C' },
      { label: 'Test dust', value: 'ISO A2 medium (ISO 12103-1)' },
      { label: 'Particle counter calibration', value: 'ISO 11171' },
      { label: 'Terminal ΔP', value: 'Typically 6 bar' },
    ],
    relatedTopics: ['contamination-control', 'filter-media-science', 'fluid-cleanliness'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™'],
  },
  {
    slug: 'iso-5011',
    code: 'ISO 5011',
    title: 'Inlet Air Cleaning Equipment — Performance Testing of Air Filters for Internal Combustion Engines and Compressors',
    metaDescription: 'ISO 5011 defines performance test methods for air filters used in internal combustion engines and compressors, covering efficiency, restriction, and dust holding capacity.',
    scope: 'Air filters for internal combustion engines, gas turbines, and compressors.',
    year: '2014',
    sections: [
      {
        heading: 'Scope and Application',
        body: 'ISO 5011 defines test methods for determining the performance characteristics of air cleaner filter elements including filtration efficiency, air restriction (pressure drop), and dust holding capacity. The standard applies to primary and safety filter elements used in internal combustion engines (gasoline and diesel), gas turbines, and compressors in industrial and mobile applications.',
      },
      {
        heading: 'Efficiency Measurement',
        body: 'Particle counting upstream and downstream at 0.5, 1, 2, 3, 5, 7, 10, 20, 40, and 80 µm provides fractional efficiency data. Overall efficiency is measured gravimetrically — mass of dust retained by element divided by mass injected. ISO A2 fine test dust (ISO 12103-1, formerly SAE Fine test dust) is injected at constant rate during the test. A secondary downstream filter captures all particles that pass through the test element.',
      },
      {
        heading: 'Restriction and Capacity Testing',
        body: 'Restriction (pressure drop in mbar or Pa) is measured at rated airflow using calibrated differential pressure transducers. The test runs at constant flow until terminal restriction is reached (as specified by the manufacturer or test client). Dust holding capacity is the total grams of test dust retained by the element at terminal restriction, providing the basis for service interval prediction.',
      },
    ],
    keyParams: [
      { label: 'Test dust', value: 'ISO A2 fine (ISO 12103-1)' },
      { label: 'Restriction unit', value: 'mbar or Pa' },
      { label: 'Efficiency unit', value: '% gravimetric or fractional' },
      { label: 'DHC unit', value: 'grams' },
    ],
    relatedTopics: ['airflow-engineering', 'air-restriction', 'dust-holding-capacity'],
    relatedTechnologies: ['MACROCORE™'],
  },
  {
    slug: 'iso-4406',
    code: 'ISO 4406',
    title: 'Hydraulic Fluid Power — Method for Coding the Level of Contamination by Solid Particles',
    metaDescription: 'ISO 4406 defines the particle contamination coding system for hydraulic and lubrication fluids, establishing cleanliness codes used to specify and verify target contamination levels.',
    scope: 'Hydraulic fluids, lubrication oils, and other industrial fluids requiring cleanliness specification.',
    year: '2021 (3rd edition)',
    sections: [
      {
        heading: 'Cleanliness Code System',
        body: 'ISO 4406 assigns a three-number code (e.g., 17/15/12) representing the particle contamination level at three size thresholds: ≥4 µm(c), ≥6 µm(c), and ≥14 µm(c). Each code number corresponds to a particle count range per milliliter. Code 17 = 640–1,300 particles/mL; Code 12 = 20–40 particles/mL. A one-unit increase in code number doubles the particle count.',
      },
      {
        heading: 'Target Code Selection',
        body: 'Target cleanliness codes are determined by the most sensitive component in the system. Equipment manufacturers specify target codes based on their component clearance tolerances. Servo valves with 1–3 µm spool clearances require ISO 14/12/10. Hydraulic motors with 10–30 µm clearances may tolerate ISO 18/16/13. Engine bearings with 5–25 µm journal clearances target ISO 16/14/11.',
      },
      {
        heading: 'Measurement Methods',
        body: 'Particle counts are measured by automatic particle counter (APC) using light obscuration, calibrated per ISO 11171 using NIST-traceable PSL reference particles. Alternatively, microscopic counting (patch test, ISO 11500) provides confirmation. Sample collection, handling, and bottle cleanliness requirements are specified to prevent sample contamination from invalidating results.',
      },
    ],
    keyParams: [
      { label: 'Count sizes', value: '≥4 µm(c), ≥6 µm(c), ≥14 µm(c)' },
      { label: 'Count unit', value: 'Particles per mL' },
      { label: 'Code range per number', value: '2× range (doubling)' },
      { label: 'APC calibration', value: 'ISO 11171' },
    ],
    relatedTopics: ['contamination-control', 'fluid-cleanliness', 'filter-media-science'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™'],
  },
  {
    slug: 'nas-1638',
    code: 'NAS 1638',
    title: 'Cleanliness Requirements for Parts Used in Hydraulic Systems',
    metaDescription: 'NAS 1638 defines particle contamination cleanliness classes for hydraulic system components and fluids, widely used in aerospace, defense, and industrial hydraulics applications.',
    scope: 'Hydraulic system components and fluids in aerospace, defense, and industrial applications.',
    year: '1964 (with subsequent amendments)',
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
    relatedTopics: ['fluid-cleanliness', 'contamination-control'],
    relatedTechnologies: ['NANOFORCE™'],
  },
  {
    slug: 'iso-29463',
    code: 'ISO 29463',
    title: 'High-Efficiency Filters and Filter Media — Classification, Performance Testing, and Marking',
    metaDescription: 'ISO 29463 defines test methods and classification for high-efficiency air filters (HEPA/ULPA classes ePM1, ePM2.5, ePM10) for engine intake, compressed air, and cabin air applications.',
    scope: 'High-efficiency air and cabin air filters for HEPA/ULPA performance classification.',
    year: '2011 (Parts 1–5)',
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
      { label: 'Application scope', value: 'HEPA/ULPA cabin air' },
    ],
    relatedTopics: ['filter-media-science', 'airflow-engineering'],
    relatedTechnologies: ['MICROKAPPA™'],
  },
  {
    slug: 'sae-j1858',
    code: 'SAE J1858',
    title: 'Full-Flow Lubricating Oil Filters — Selecting and Specifying',
    metaDescription: 'SAE J1858 provides guidance for specifying and selecting full-flow lubricating oil filters for diesel and gasoline engines, covering performance requirements and test methodology references.',
    scope: 'Full-flow lube oil filters for internal combustion engines.',
    year: '2011',
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
    relatedTopics: ['service-intervals', 'oem-engineering', 'filter-media-science'],
    relatedTechnologies: ['SYNTRAX™'],
  },
  {
    slug: 'iso-11171',
    code: 'ISO 11171',
    title: 'Hydraulic Fluid Power — Calibration of Automatic Particle Counters for Liquids',
    metaDescription: 'ISO 11171 defines calibration methodology for automatic particle counters used in hydraulic and lubrication fluid analysis, establishing the basis for traceable ISO 4406 cleanliness measurements.',
    scope: 'Automatic particle counters (APC) used for particle counting in hydraulic and lubrication fluids.',
    year: '2016',
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
    relatedTopics: ['fluid-cleanliness', 'testing-and-validation', 'contamination-control'],
    relatedTechnologies: ['NANOFORCE™'],
  },
  {
    slug: 'iso-8573-1',
    code: 'ISO 8573-1',
    title: 'Compressed Air — Contaminant Classes and Purity Requirements',
    metaDescription: 'ISO 8573-1 defines purity classes for compressed air, specifying maximum concentrations of solid particles, water, and oil for industrial, food, pharmaceutical, and instrument air applications.',
    scope: 'Classification of compressed air purity by contamination class for solid particles, water (liquid and vapor), and total oil (liquid, aerosol, and vapor).',
    year: '2010',
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
    relatedTopics: ['testing-and-validation', 'contamination-control'],
    relatedTechnologies: ['DRYCORE™'],
  },
  {
    slug: 'sae-j1539',
    code: 'SAE J1539',
    title: 'Air Cleaner Test Code — Heavy Duty Diesel Engines',
    metaDescription: 'SAE J1539 defines test procedures for evaluating air cleaner performance on heavy-duty diesel engines, covering restriction, efficiency, dust capacity, and element replacement protocols.',
    scope: 'Test code for air cleaner performance evaluation on heavy-duty diesel engines, including restriction measurement, filtration efficiency, and service life determination.',
    year: '1986',
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
    relatedTopics: ['airflow-engineering', 'dust-holding-capacity', 'testing-and-validation'],
    relatedTechnologies: ['MACROCORE™', 'INTEKCORE™'],
  },
  {
    slug: 'iso-12937',
    code: 'ISO 12937',
    title: 'Petroleum Products — Determination of Water by Coulometric Karl Fischer Titration',
    metaDescription: 'ISO 12937 defines the Karl Fischer coulometric titration method for determining water content in petroleum products, the European and international equivalent of ASTM D6304.',
    scope: 'Determination of water content in petroleum products with water content between 5 mg/kg and 2,000 mg/kg using coulometric Karl Fischer titration.',
    year: '2000',
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
    relatedTopics: ['fluid-cleanliness', 'testing-and-validation'],
    relatedTechnologies: ['HYDROCORE™', 'SYNTEPORE™'],
  },
  {
    slug: 'nfpa-t2-14',
    code: 'NFPA T2.14',
    title: 'Fluid Power Systems — Hydraulic Filters — Method for Verifying Collapse/Burst Resistance',
    metaDescription: 'NFPA T2.14 specifies test methods for verifying the structural integrity of hydraulic filter elements under differential pressure, defining collapse and burst resistance ratings for high-pressure hydraulic applications.',
    scope: 'Test methods for verifying collapse pressure rating and burst resistance of hydraulic filter elements operating in high-pressure hydraulic systems.',
    year: '2005',
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
    relatedTopics: ['contamination-control', 'fluid-cleanliness', 'testing-and-validation'],
    relatedTechnologies: ['NANOFORCE™'],
  },
  {
    slug: 'iso-11155-1',
    code: 'ISO 11155-1',
    title: 'Road Vehicles — Air Filters for Passenger Compartments — Particle Filtration Performance',
    metaDescription: 'ISO 11155-1 defines particle filtration efficiency and airflow resistance test methods for cabin air filters in road vehicles and heavy equipment operator cabs.',
    scope: 'Performance testing of cabin air filter elements for particle filtration efficiency (PM10, PM2.5) and airflow resistance in road vehicle passenger compartments and heavy equipment operator cabs.',
    year: '2001',
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
    relatedTopics: ['filter-media-science', 'testing-and-validation'],
    relatedTechnologies: ['MICROKAPPA™'],
  },
  {
    slug: 'astm-d6304',
    code: 'ASTM D6304',
    title: 'Standard Test Method for Determination of Water in Petroleum Products by Coulometric Karl Fischer Titration',
    metaDescription: 'ASTM D6304 is the North American coulometric Karl Fischer titration method for water content in petroleum products and lubricating oils, equivalent to ISO 12937.',
    scope: 'Water content determination in petroleum products, lubricating oils, and additives with water content from 10 ppm to 25,000 ppm using coulometric Karl Fischer titration.',
    year: '2007',
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
    relatedTopics: ['fluid-cleanliness', 'testing-and-validation'],
    relatedTechnologies: ['HYDROCORE™', 'SYNTEPORE™'],
  },
  {
    slug: 'iso-16332',
    code: 'ISO 16332',
    title: 'Diesel Engines — Fuel Filters — Test Methods for Water Separation Efficiency',
    metaDescription: 'ISO 16332 defines test methods for measuring water separation efficiency of diesel fuel filters, establishing the performance benchmark for coalescing fuel water separators.',
    scope: 'Test methodology for determining the water separation efficiency of diesel fuel filter elements using standardized test conditions and water concentration measurement.',
    year: '2015',
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
    relatedTopics: ['fluid-cleanliness', 'testing-and-validation'],
    relatedTechnologies: ['HYDROCORE™', 'SYNTEPORE™'],
  },
  {
    slug: 'din-71220',
    code: 'DIN 71220',
    title: 'Road Vehicles — Cabin Air Filters — Requirements and Testing',
    metaDescription: 'DIN 71220 is the German standard for road vehicle cabin air filter performance, specifying particle filtration efficiency, odour removal, and activated carbon performance — a predecessor to ISO 11155 still referenced in European OEM specifications.',
    scope: 'Cabin air filters for road vehicles (passenger cars, light commercial vehicles, buses, trucks) in European OEM qualification contexts, particularly German automotive supply chains.',
    year: 'Active (pre-harmonisation)',
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
    relatedTopics: ['cabin-air-filtration', 'operator-health'],
    relatedTechnologies: ['MICROKAPPA™'],
  },
  {
    slug: 'din-51524',
    code: 'DIN 51524',
    title: 'Hydraulic Fluids — Minimum Requirements (HL, HLP, HVLP Classifications)',
    metaDescription: 'DIN 51524 specifies minimum performance requirements for hydraulic and lube oils in HL, HLP, and HVLP classifications — the German standard for lubricant compatibility with filtration media and hydraulic system components.',
    scope: 'Hydraulic and lube oil performance classification for industrial and mobile equipment — engine lube circuits, hydraulic power circuits, and industrial gear lubrication.',
    year: 'Active (multi-part)',
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
    relatedTopics: ['fluid-cleanliness', 'contamination-control'],
    relatedTechnologies: ['SYNTRAX™'],
  },
];

