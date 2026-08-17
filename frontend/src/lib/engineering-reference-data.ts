// ELIMFILTERS Engineering Reference Library — v1.0
// All content sourced exclusively from documented ELIMFILTERS knowledge base.
// Gaps marked as "PENDING ENGINEERING DOCUMENTATION"

export interface ERLSection {
  slug: string;
  number: string;
  title: string;
  definition: string;
  engineeringPurpose: string;
  applicableStandards: string[];
  keyConcepts: { term: string; definition: string }[];
  engineeringMetrics: { label: string; value: string; standard?: string }[];
  failureConsiderations: string[];
  relatedTechnologies: string[];
  relatedSystems: string[];
  relatedIndustries: string[];
  relatedKCArticles: string[];
  references: string[];
}

export const ERL_SECTIONS: ERLSection[] = [
  {
    slug: 'standards',
    number: '01',
    title: 'Filtration Standards Framework',
    definition:
      'The filtration standards framework comprises ISO, ASTM, SAE, NFPA, and DIN specifications that define test methodology, performance classification, and cleanliness targets for industrial filtration systems. Standards provide the common measurement language enabling comparison of filter performance across manufacturers, applications, and geographies.',
    engineeringPurpose:
      'Standards serve as measurement tools — they do not specify which products to use, but define what must be measured and how. Applying the correct standard to a circuit (ISO 16889 for hydraulic elements, ISO 5011 for air cleaners, ISO 4406 for cleanliness codes) establishes the basis for filter selection, performance verification, and contamination management.',
    applicableStandards: [
      'ISO 16889',
      'ISO 5011',
      'ISO 4406',
      'ISO 11171',
      'ISO 29463',
      'ISO 8573-1',
      'ISO 12937',
      'ASTM D6304',
      'SAE J1539',
      'SAE J1858',
      'NFPA T2.14',
      'NAS 1638',
      'DIN 71220',
      'DIN 51524',
      'ISO 16332',
    ],
    keyConcepts: [
      {
        term: 'Beta ratio (β)',
        definition:
          'Ratio of upstream particle count to downstream particle count at a specified particle size, measured per ISO 16889. β₁₀(c) = 200 means 99.5% efficiency at ≥10 µm using ISO 11171 calibrated counting.',
      },
      {
        term: 'ISO 4406 Cleanliness Code',
        definition:
          'Three-number code (e.g., 17/15/12) representing particle count ranges per mL at ≥4 µm, ≥6 µm, and ≥14 µm. Each code increment doubles the particle count. The most sensitive system component determines the target code.',
      },
      {
        term: 'β(c) vs β (legacy)',
        definition:
          'β₁₀(c) uses ISO 11171 calibrated automatic particle counters. Legacy β₁₀ used AC fine test dust (deprecated). The two scales are NOT directly comparable — always specify β(c) when comparing manufacturer data.',
      },
      {
        term: 'Multi-pass test',
        definition:
          'ISO 16889 test method where contaminated fluid recirculates through the test circuit. Particles that pass the filter remain in suspension and continue to challenge the element, simulating real-world conditions and enabling simultaneous Beta ratio and DHC measurement.',
      },
      {
        term: 'Test dust',
        definition:
          'Standardized test contaminant (ISO A2 fine for most fluid tests, ISO coarse for specific applications) used across ISO 16889, ISO 5011, and related standards to enable repeatable, comparable test results.',
      },
    ],
    engineeringMetrics: [
      { label: 'β₁₀(c) = 75 efficiency', value: '98.7%', standard: 'ISO 16889' },
      { label: 'β₁₀(c) = 200 efficiency', value: '99.5%', standard: 'ISO 16889' },
      { label: 'β₁₀(c) = 1000 efficiency', value: '99.9%', standard: 'ISO 16889' },
      { label: 'ISO 16889 test fluid', value: 'ISO VG 15 oil', standard: 'ISO 16889' },
      { label: 'ISO 5011 test dust', value: 'ISO A2 fine', standard: 'ISO 5011' },
      { label: 'ISO 11171 calibration', value: 'NIST-traceable reference particles', standard: 'ISO 11171' },
    ],
    failureConsiderations: [
      'Using legacy β values (without "c" suffix) when comparing to ISO 11171-calibrated data produces invalid comparisons — a filter rated β₁₀ = 75 may have β₁₀(c) = 10.',
      'Applying a standard designed for one circuit type to another (e.g., using ISO 5011 air filter metrics for hydraulic selection) produces invalid specifications.',
      'Cleanliness targets set below the sensitivity of the most critical component allow damage to occur even while meeting the nominal specification.',
    ],
    relatedTechnologies: ['MACROCORE™', 'SYNTRAX™', 'NANOFORCE™', 'SYNTAPORE™', 'DRYCORE™', 'MICROKAPPA™'],
    relatedSystems: [
      'Air Intake Protection',
      'Lubrication Protection',
      'Hydraulic Protection',
      'Fuel Cleanliness Protection',
    ],
    relatedIndustries: ['Mining', 'Agriculture', 'Manufacturing', 'Oil & Gas', 'Power Generation'],
    relatedKCArticles: [
      'testing-and-validation',
      'contamination-control',
      'fluid-cleanliness',
      'airflow-engineering',
    ],
    references: [
      'ISO 16889:2022 — Hydraulic fluid power — Multi-pass method for evaluating filter element performance',
      'ISO 5011:2020 — Inlet air cleaning equipment for internal combustion engines',
      'ISO 4406:2021 — Hydraulic fluid power — Method for coding the level of contamination by solid particles',
      'ISO 11171:2016 — Hydraulic fluid power — Calibration of automatic particle counters',
    ],
  },
  {
    slug: 'engineering-principles',
    number: '02',
    title: 'Core Filtration Engineering Principles',
    definition:
      'Core filtration engineering principles encompass the physical and mechanical laws governing particle capture, pressure drop, flow capacity, and system design in industrial filtration applications. These principles form the analytical basis for filter selection, system specification, and performance prediction.',
    engineeringPurpose:
      'Engineering principles enable engineers to move beyond catalog selection into quantitative system design — calculating contamination budgets, predicting service intervals, matching filter specifications to cleanliness targets, and diagnosing protection gaps before equipment failure occurs.',
    applicableStandards: ['ISO 16889', 'ISO 5011', 'ISO 4406', 'ISO 11171'],
    keyConcepts: [
      {
        term: 'Contamination budget',
        definition:
          'Balance between contamination ingress rate (particles per hour entering the system) and filtration removal rate (particles per hour captured). At steady state, ingress equals removal and cleanliness is constant. Budget deficit — ingress exceeds removal — causes progressive cleanliness degradation.',
      },
      {
        term: 'Pressure drop (ΔP)',
        definition:
          'Differential pressure across the filter element, expressed in mbar, Pa, or inH₂O. Initial ΔP (clean element at rated flow) is the baseline; ΔP increases as the element loads with contaminant until the service threshold is reached.',
      },
      {
        term: 'Face velocity',
        definition:
          'Airflow rate per unit of filter face area (m/s). Higher face velocity increases separation efficiency but accelerates element loading. Industrial air filter design targets 0.05–0.15 m/s to balance restriction, dirt capacity, and service interval.',
      },
      {
        term: 'Protection architecture',
        definition:
          'Systematic identification of all contamination circuits within an asset (air intake, lube, fuel, hydraulic, cooling, cabin air) and specification of filtration parameters for each circuit based on contamination ingress rate and cleanliness target.',
      },
      {
        term: 'Filter cost ratio',
        definition:
          'Filter acquisition cost represents 1–5% of total filtration cost for heavy-duty industrial assets. The remaining 95–99% is determined by the filtration system\'s effectiveness at preventing component wear and extending equipment life.',
      },
    ],
    engineeringMetrics: [
      { label: 'Filter cost / total maintenance', value: '1–5%' },
      { label: 'System approach life extension', value: '30–50%' },
      { label: 'Face velocity target (air)', value: '0.05–0.15 m/s', standard: 'ISO 5011' },
      { label: 'Protection circuits per heavy asset', value: '5–7' },
      { label: 'Integrated program downtime reduction', value: '3–5× vs commodity' },
    ],
    failureConsiderations: [
      'Selecting filters by acquisition cost without considering system-level contamination control results in exponential cost increases in component replacement and downtime.',
      'Single-circuit focus (e.g., air only) while neglecting hydraulic or fuel circuits leaves the asset partially protected — one unprotected circuit can undermine all other filtration investments.',
      'Contamination budget deficits develop gradually and may not produce immediate symptoms, creating false confidence until catastrophic failure occurs.',
    ],
    relatedTechnologies: ['MACROCORE™', 'SYNTRAX™', 'NANOFORCE™', 'SYNTAPORE™', 'DURATECH™'],
    relatedSystems: [
      'Air Intake Protection',
      'Lubrication Protection',
      'Hydraulic Protection',
      'Fuel Cleanliness Protection',
    ],
    relatedIndustries: ['Mining', 'Agriculture', 'Truck Fleets', 'Construction'],
    relatedKCArticles: [
      'asset-protection-engineering',
      'total-cost-of-ownership',
      'contamination-control',
      'service-intervals',
    ],
    references: [
      'ELIMFILTERS Knowledge Center — Asset Protection Engineering (asset-protection-engineering)',
      'ELIMFILTERS Knowledge Center — Total Cost of Ownership (total-cost-of-ownership)',
    ],
  },
  {
    slug: 'filtration-science',
    number: '03',
    title: 'Filtration Science',
    definition:
      'Filtration science describes the physical mechanisms by which filter media captures particles from a fluid stream. The primary mechanisms are inertial impaction, interception, Brownian diffusion, and electrostatic attraction. The dominant mechanism depends on particle size, fluid velocity, fiber diameter, and media structure.',
    engineeringPurpose:
      'Understanding filtration mechanisms informs media selection — different mechanisms dominate at different particle size ranges, explaining why synthetic microfiber outperforms cellulose at sub-10 µm and why glass fiber is required for sub-3 µm efficiency. Mechanism knowledge also explains why efficiency and capacity are in fundamental tension.',
    applicableStandards: ['ISO 16889', 'ISO 5011', 'ISO 29463'],
    keyConcepts: [
      {
        term: 'Inertial impaction',
        definition:
          'Large particles (>10 µm) following the fluid streamline cannot change direction quickly enough to navigate around fibers, impacting and being captured. Dominant mechanism for coarse particle removal.',
      },
      {
        term: 'Interception',
        definition:
          'Mid-range particles (2–10 µm) following streamlines pass close enough to fiber surfaces to make contact and be captured. Efficiency increases with lower face velocity (more time for contact) and smaller fiber diameter.',
      },
      {
        term: 'Brownian diffusion',
        definition:
          'Sub-micron particles (<1 µm) are displaced from streamlines by Brownian motion (thermal energy), increasing contact probability with fibers. Diffusion efficiency increases at lower face velocity and is the dominant capture mechanism for HEPA-class filtration.',
      },
      {
        term: 'Depth filtration vs surface filtration',
        definition:
          'Depth filtration captures particles throughout the media thickness, distributing loading and maximizing dirt holding capacity. Surface filtration captures particles at the media face, enabling easy cleaning (pulse-jet systems) but lower capacity before blinding.',
      },
      {
        term: 'Most Penetrating Particle Size (MPPS)',
        definition:
          'The particle size with minimum capture efficiency — typically 0.1–0.3 µm — where neither inertial/interception nor diffusion mechanisms are dominant. Filter efficiency curves show a minimum at MPPS. Per ISO 29463 (HEPA/ULPA), filters are rated at MPPS.',
      },
    ],
    engineeringMetrics: [
      { label: 'Inertial impaction dominant range', value: '>10 µm' },
      { label: 'Interception dominant range', value: '2–10 µm' },
      { label: 'Brownian diffusion dominant range', value: '<1 µm' },
      { label: 'MPPS range', value: '0.1–0.3 µm', standard: 'ISO 29463' },
      { label: 'Cellulose β₁₀(c)', value: '2–10', standard: 'ISO 16889' },
      { label: 'Synthetic microfiber β₁₀(c)', value: '50–200', standard: 'ISO 16889' },
    ],
    failureConsiderations: [
      'Media face velocity above design point (0.15 m/s for air) reduces contact time for interception mechanism, degrading efficiency in the critical 2–10 µm range.',
      'Cellulose media absorbs 6–8% of its own weight in water — swelling degrades filtration geometry and can cause media bypass in high-humidity or water-contaminated applications.',
      'Glass fiber brittleness under pulsating flow can release captured particles downstream if pleating geometry and structural support layers are inadequate.',
    ],
    relatedTechnologies: ['MACROCORE™', 'SYNTRAX™', 'NANOFORCE™', 'MICROKAPPA™'],
    relatedSystems: ['Air Intake Protection', 'Lubrication Protection', 'Hydraulic Protection'],
    relatedIndustries: ['Mining', 'Manufacturing', 'Power Generation'],
    relatedKCArticles: ['filter-media-science', 'testing-and-validation', 'airflow-engineering'],
    references: [
      'ELIMFILTERS Knowledge Center — Filter Media Science (filter-media-science)',
      'ISO 29463 — High-efficiency air filters (EPA, HEPA, ULPA)',
    ],
  },
  {
    slug: 'particle-science',
    number: '04',
    title: 'Particle Science',
    definition:
      'Particle science characterizes the size distribution, morphology, composition, and concentration of contaminant particles in industrial fluids and air. Understanding particle characteristics determines which particles cause damage, at what concentrations damage occurs, and what particle sizes the filtration system must target.',
    engineeringPurpose:
      'Industrial wear damage is dominated by particles in the 5–15 µm range — the clearance range of bearings, servo valves, and gear teeth. Particles visible to the naked eye (>40 µm) have already been largely captured by primary filtration; it is the sub-20 µm fraction that drives long-term wear.',
    applicableStandards: ['ISO 4406', 'ISO 11171', 'ISO 16889'],
    keyConcepts: [
      {
        term: 'Critical wear particle range',
        definition:
          'Particles in the 5–15 µm range cause the greatest proportion of abrasive wear in precision mechanical components because they match bearing clearances (5–25 µm), generating maximum contact between abrasive particle and component surface.',
      },
      {
        term: 'Particle size distribution',
        definition:
          'Industrial fluid contamination follows a size distribution weighted toward smaller particles — for every 5 µm particle, approximately 10× more 2 µm particles exist. ISO 4406 counts at ≥4 µm, ≥6 µm, and ≥14 µm to capture the critical wear range.',
      },
      {
        term: 'Particle morphology',
        definition:
          'Particle shape and surface texture reveal contamination source: angular silica particles indicate air intake breach; smooth metallic platelets indicate fatigue wear; ribbon-shaped particles indicate cutting wear; carbon agglomerates indicate oil thermal degradation.',
      },
      {
        term: 'ISO 4406 code interpretation',
        definition:
          'Each code increment doubles the particle count — ISO 17/15/12 contains approximately twice the particles per mL as ISO 16/14/11. Moving from ISO 19/17/14 (commodity) to ISO 16/14/11 (system approach) extends bearing life 3–5×.',
      },
      {
        term: 'Automatic particle counter (APC)',
        definition:
          'Instrument using light obscuration (ISO 11171) to count and size particles in fluid samples. APC must be calibrated against NIST-traceable reference particles. Sample bottles must be pre-cleaned to ISO 14/12/11 to avoid contaminating the sample.',
      },
    ],
    engineeringMetrics: [
      { label: 'Critical particle range', value: '5–15 µm' },
      { label: 'Bearing clearance typical', value: '5–25 µm' },
      { label: 'ISO 4406 count sizes', value: '≥4, ≥6, ≥14 µm', standard: 'ISO 4406' },
      { label: 'Code increment = particle count change', value: '×2 per code unit', standard: 'ISO 4406' },
      { label: 'Bearing life improvement ISO 16/14/11 vs 19/17/14', value: '3–5×' },
      { label: 'APC sample bottle cleanliness', value: 'ISO 14/12/11 minimum', standard: 'ISO 11171' },
    ],
    failureConsiderations: [
      'Particles larger than 40 µm are visible but cause less proportional damage than critical-size particles — over-focusing on visible contamination misses the primary wear driver.',
      'Erroneous particle count data from contaminated sample bottles or incorrect sampling technique produces false cleanliness readings, masking actual system condition.',
      'Particle count alone without morphology analysis cannot distinguish ingress contamination (silica = air intake breach) from internal wear generation (iron = component degradation).',
    ],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™', 'MACROCORE™'],
    relatedSystems: ['Hydraulic Protection', 'Lubrication Protection', 'Air Intake Protection'],
    relatedIndustries: ['Mining', 'Manufacturing', 'Agriculture'],
    relatedKCArticles: ['contamination-control', 'fluid-cleanliness', 'failure-analysis'],
    references: [
      'ISO 4406:2021 — Hydraulic fluid power — Method for coding the level of contamination by solid particles',
      'ISO 11171:2016 — Hydraulic fluid power — Calibration of automatic particle counters',
      'ELIMFILTERS Knowledge Center — Contamination Control (contamination-control)',
    ],
  },
  {
    slug: 'contamination-science',
    number: '05',
    title: 'Contamination Science',
    definition:
      'Contamination science identifies, classifies, and quantifies the sources of particulate, water, and chemical contamination in industrial systems. The three primary contamination categories — built-in, ingress, and generated — require different control strategies and together determine the total contamination load a filtration system must manage.',
    engineeringPurpose:
      'Effective contamination control requires identifying each source contributing to system contamination. Addressing only one source (e.g., ingress via air intake) while ignoring others (e.g., built-in from assembly or generated from component wear) produces an incomplete protection strategy that fails to maintain target cleanliness.',
    applicableStandards: ['ISO 4406', 'ISO 16889', 'ISO 12937', 'ASTM D6304'],
    keyConcepts: [
      {
        term: 'Built-in contamination',
        definition:
          'Contamination present in a system before operation begins — machining chips, casting sand, assembly residues, pipe scale, and elastomer particles from installation. New hydraulic systems typically start at ISO 22/20/17 or worse without commissioning flush.',
      },
      {
        term: 'Ingress contamination',
        definition:
          'Contamination entering an operating system from outside — airborne dust through air intake, water through breather valves, particles through worn rod seals, and external contamination introduced during maintenance.',
      },
      {
        term: 'Generated contamination',
        definition:
          'Contamination produced internally by system operation — wear particles from bearing surfaces and gear teeth, oxidation products, carbon agglomerates from oil thermal degradation, and corrosion products.',
      },
      {
        term: 'Commissioning flush',
        definition:
          'Circulation of hydraulic fluid through the new system at full flow before first operation, specifically to remove built-in contamination. Target: ISO 17/15/12 before commissioning. Skipping commissioning flush causes accelerated early-life wear.',
      },
      {
        term: 'Water contamination in fuel',
        definition:
          'Water in diesel fuel above 200 ppm damages HPCR injector seats through corrosion and micro-pitting. Water enters fuel through condensation in large tanks (atmospheric breathing + temperature cycling), transfer contamination, and seal leaks. Karl Fischer titration (ISO 12937 / ASTM D6304) quantifies water content.',
      },
    ],
    engineeringMetrics: [
      { label: 'New system typical cleanliness', value: 'ISO 22/20/17 (uncontrolled)' },
      { label: 'Commissioning flush target', value: 'ISO 17/15/12', standard: 'ISO 4406' },
      { label: 'HPCR injector water limit', value: '<200 ppm', standard: 'ISO 12937' },
      { label: 'Water in lube oil — coolant leak indicator', value: '>0.1%' },
      { label: 'Water in lube oil — accelerated oxidation threshold', value: '>0.5%' },
    ],
    failureConsiderations: [
      'Commissioning without flushing introduces built-in contamination that immediately challenges filtration capacity, causing accelerated early-life wear and false attribution of component failures to product quality.',
      'Water above 0.5% in lube oil reduces oil film strength at bearing surfaces, promotes bacterial growth in biodegradable oils, and accelerates oxidation — even in systems with clean particle counts.',
      'Cross-contamination between circuits (coolant leaking into lube oil via head gasket, fuel dilution from DPF post-injection) introduces chemical contamination that oil analysis must identify through physical property tests, not just particle counts.',
    ],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™', 'TURBOCORE™', 'SYNTAPORE™', 'MACROCORE™'],
    relatedSystems: ['Hydraulic Protection', 'Lubrication Protection', 'Fuel Cleanliness Protection'],
    relatedIndustries: ['Mining', 'Marine', 'Agriculture', 'Power Generation'],
    relatedKCArticles: ['contamination-control', 'failure-analysis', 'fluid-cleanliness', 'asset-protection-engineering'],
    references: [
      'ELIMFILTERS Knowledge Center — Contamination Control (contamination-control)',
      'ISO 12937:2000 — Petroleum products — Determination of water by Karl Fischer titration',
      'ASTM D6304 — Standard Test Method for Water in Petroleum Products by Karl Fischer Titration',
    ],
  },
  {
    slug: 'airflow-engineering',
    number: '06',
    title: 'Airflow Engineering',
    definition:
      'Airflow engineering defines how air moves through filtration systems and how pressure drop (restriction) across filter elements affects engine performance, fuel consumption, and turbocharger operation. Restriction is the primary measurable output of airflow engineering — it governs service intervals, system efficiency, and the margin between protection and performance compromise.',
    engineeringPurpose:
      'Pressure drop management ensures that filtration provides contamination control without degrading engine volumetric efficiency, turbocharger performance, or fuel economy. Service limits must be enforced — operating above restriction thresholds causes quantifiable power and fuel penalties and accelerates turbocharger bearing wear.',
    applicableStandards: ['ISO 5011', 'ISO 29463', 'SAE J1539'],
    keyConcepts: [
      {
        term: 'Initial restriction',
        definition:
          'Pressure drop through a clean filter element at rated airflow. Typical range: 6–25 mbar depending on element geometry, face velocity, and media type. Initial restriction establishes the protection margin between the service limit and clean condition.',
      },
      {
        term: 'Service limit',
        definition:
          'Maximum allowable restriction before element replacement — 25 mbar for naturally aspirated engines, 375–625 mbar for turbocharged applications. Exceeding service limits causes volumetric efficiency loss and compressor surge risk.',
      },
      {
        term: 'Restriction indicators',
        definition:
          'Mechanical (spring-piston, latching) or electronic (ECU-connected sensor) devices monitoring intake restriction in real time. Mechanical indicators provide a visual flag independent of electrical systems. Electronic sensors enable condition-based service scheduling from restriction trend rate.',
      },
      {
        term: 'Turbocharger compressor surge',
        definition:
          'Flow instability occurring when compressor inlet restriction forces operation toward the surge line of the compressor map. Each 1 mbar increase in inlet depression increases turbocharger speed approximately 0.5% at constant boost, accelerating bearing wear.',
      },
      {
        term: 'Condition-based servicing',
        definition:
          'Replacing air filter elements when the restriction indicator triggers — when the threshold is reached — rather than on a fixed interval. Extends service intervals 30–200% in low-dust environments while maintaining consistent protection margin throughout the interval.',
      },
    ],
    engineeringMetrics: [
      { label: 'Clean element restriction', value: '6–25 mbar', standard: 'ISO 5011' },
      { label: 'NA engine service limit', value: '25 mbar / 10 inH₂O' },
      { label: 'Turbo engine service limit', value: '375–625 mbar / 25 inH₂O' },
      { label: 'Power loss per 25 mbar excess restriction', value: '1–3% (NA engines)' },
      { label: 'Condition-based interval extension', value: '30–200%' },
      { label: 'Face velocity target', value: '0.05–0.15 m/s', standard: 'ISO 5011' },
      { label: 'Unit conversion', value: '1 inH₂O = 2.49 mbar = 249 Pa' },
    ],
    failureConsiderations: [
      'Operating above service restriction limit causes measurable power losses (1–3% per 25 mbar excess) and in turbocharged engines, shifts compressor operating point toward surge, accelerating bearing wear.',
      'Under-servicing (missing restriction threshold) allows contaminant breakthrough as media loads beyond capacity — efficiency degrades near the service limit if the element structure fails before the indicator triggers.',
      'Fixed-interval replacement in low-dust environments wastes filter capacity; in high-dust environments, fixed intervals may allow threshold exceedance between scheduled services.',
    ],
    relatedTechnologies: ['MACROCORE™', 'INTEKCORE™'],
    relatedSystems: ['Air Intake Protection'],
    relatedIndustries: ['Mining', 'Agriculture', 'Truck Fleets', 'Power Generation', 'Railway'],
    relatedKCArticles: ['airflow-engineering', 'air-restriction', 'dust-holding-capacity', 'service-intervals'],
    references: [
      'ISO 5011:2020 — Inlet air cleaning equipment for internal combustion engines and air compressors',
      'SAE J1539 — Air Cleaner Test Code — Heavy Duty Diesel Engines',
      'ELIMFILTERS Knowledge Center — Airflow Engineering (airflow-engineering)',
      'ELIMFILTERS Knowledge Center — Air Restriction (air-restriction)',
    ],
  },
  {
    slug: 'fluid-engineering',
    number: '07',
    title: 'Fluid Engineering',
    definition:
      'Fluid engineering in the filtration context covers the mechanical properties of industrial fluids (viscosity, density, compressibility) and how these properties interact with filter element design to determine flow capacity, pressure drop, bypass behavior, and contamination transport. Hydraulic, lube, fuel, and coolant circuits each present distinct fluid engineering challenges.',
    engineeringPurpose:
      'Filter elements must maintain adequate flow capacity at the full range of operating temperatures. Cold-start conditions (high viscosity) create maximum ΔP — bypass valves are sized for cold-start to prevent oil starvation. High-temperature conditions (low viscosity) reduce bypass efficiency. Fluid engineering connects these thermal and flow behaviors to protection system design.',
    applicableStandards: ['ISO 16889', 'ISO 4406', 'NFPA T2.14', 'DIN 51524'],
    keyConcepts: [
      {
        term: 'Bypass valve',
        definition:
          'Spring-loaded valve opening at 0.8–1.0 bar ΔP to protect the engine from oil starvation when the filter element is restricted beyond flow capacity (cold start, over-service). At bypass, unfiltered fluid enters the system. Bypass valve cracking pressure must match OEM specification.',
      },
      {
        term: 'Anti-drain back (ADB) valve',
        definition:
          'Check valve preventing oil column from draining to sump when the engine stops. Without ADB, 3–8 seconds of dry starting occurs before oil reaches the filter outlet. ADB leak specification: <1 mL/min over 60 minutes under static head.',
      },
      {
        term: 'ISO viscosity grade',
        definition:
          'Fluid viscosity classification determining flow characteristics through filter media. ISO 16889 test is conducted with ISO VG 15 oil. Real-world hydraulic systems use VG 32–68; engine lube uses SAE 10W-30 to 15W-40. Filter ΔP scales with viscosity at the operating temperature.',
      },
      {
        term: 'Proportional valve sensitivity',
        definition:
          'Proportional hydraulic valves have internal clearances of 5–10 µm. Particles in this size range cause stiction (valve sticking intermittently), hysteresis (delayed response), and eventual seizure. NFPA T2.14 minimum cleanliness for proportional valves: ISO 16/14/11.',
      },
      {
        term: 'Kidney loop filtration',
        definition:
          'Offline filtration circuit operating independently of the main hydraulic system flow, continuously polishing the fluid reservoir at low flow rates with high-efficiency elements. Enables ISO 14/12/9 cleanliness in servo valve systems without requiring full-flow fine filtration.',
      },
    ],
    engineeringMetrics: [
      { label: 'Bypass valve opening ΔP', value: '0.8–1.0 bar typical' },
      { label: 'ADB leak specification', value: '<1 mL/min / 60 min' },
      { label: 'Servo valve cleanliness target', value: 'ISO 14/12/9', standard: 'NFPA T2.14' },
      { label: 'Proportional valve minimum', value: 'ISO 16/14/11', standard: 'NFPA T2.14' },
      { label: 'Gear pump minimum cleanliness', value: 'ISO 19/17/14', standard: 'NFPA T2.14' },
      { label: 'ISO 16889 test fluid', value: 'ISO VG 15 oil', standard: 'ISO 16889' },
    ],
    failureConsiderations: [
      'Bypass valve spring relaxation at elevated temperature can allow partial bypass opening without triggering a restriction fault, allowing unfiltered oil into the system at operating temperature.',
      'Incorrect bypass valve pressure specification (lower than OEM) allows bypass under normal operating differential pressure, bypassing the filter during normal operation.',
      'Commissioning flush skipped means built-in contamination (ISO 22/20/17 typical) immediately contacts sensitive proportional valve components, causing premature wear.',
    ],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™', 'THERMACORE™'],
    relatedSystems: ['Hydraulic Protection', 'Lubrication Protection', 'Cooling System Protection'],
    relatedIndustries: ['Mining', 'Manufacturing', 'Agriculture', 'Oil & Gas'],
    relatedKCArticles: ['seal-integrity', 'fluid-cleanliness', 'contamination-control', 'oem-engineering'],
    references: [
      'NFPA T2.14:2005 — Hydraulic Fluid Power — Fluid Cleanliness Guidelines for Industrial Hydraulic Equipment',
      'ISO 16889:2022 — Multi-pass method for evaluating filter element performance',
      'DIN 51524 — Hydraulic fluids (HLP types)',
      'ELIMFILTERS Knowledge Center — Seal Integrity (seal-integrity)',
    ],
  },
  {
    slug: 'filter-media',
    number: '08',
    title: 'Filter Media Engineering',
    definition:
      'Filter media engineering characterizes the materials, structures, and configurations used to capture particles from fluid and air streams. The three primary media types — cellulose, synthetic microfiber, and glass fiber — represent increasing performance tiers. Media selection balances filtration efficiency (Beta ratio), dirt holding capacity, flow resistance, thermal stability, and chemical compatibility with the process fluid.',
    engineeringPurpose:
      'Media selection is the primary determinant of filtration efficiency and service interval. Specifying cellulose media where synthetic is required underspecifies the protection system. Understanding media capabilities enables correct specification — matching Beta ratio targets and service interval requirements to media type and construction.',
    applicableStandards: ['ISO 16889', 'ISO 5011', 'ISO 29463'],
    keyConcepts: [
      {
        term: 'Cellulose media',
        definition:
          'Plant-derived fiber media with diameter 10–40 µm, producing a stochastic pore structure. Beta values β₁₀(c) = 2–10 (moderate efficiency). Absorbs 6–8% own weight in water — degrades in high-humidity or water-contaminated applications. Temperature limit: 120°C. Adequate for passenger vehicle applications with frequent drain intervals.',
      },
      {
        term: 'Synthetic microfiber media',
        definition:
          'Polyester or polypropylene media (meltblown or electrospun) with controlled fiber diameter 1–10 µm. Beta values β₁₀(c) = 50–200 (high efficiency). Does not absorb water. Temperature rating 150°C. 2–4× dirt holding capacity versus cellulose at equivalent efficiency. Used in SYNTRAX™ and NANOFORCE™ configurations.',
      },
      {
        term: 'Glass fiber media',
        definition:
          'Sub-micron glass fiber diameter (0.5–5 µm) enabling Beta values β₃(c) > 200. Inherently hydrophobic when treated. Limitations: brittleness under pulsating flow — fibers fracture and release captured particles downstream. Requires structural support layers in pleated configurations.',
      },
      {
        term: 'Pleating geometry',
        definition:
          'Pleat count, height, and density define total media area within a given element envelope. Deep pleating maximizes media area but requires structural support to prevent pleat collapse under ΔP. Thermally bonded end caps and wire-wound outer support maintain pleat geometry across service life.',
      },
      {
        term: 'Multi-layer construction',
        definition:
          'Combining media layers with different characteristics — coarse upstream layer removes large particles and distributes flow, fine downstream layer provides high efficiency at critical particle sizes. NANOFORCE™ uses multi-layer synthetic media to achieve high efficiency with extended capacity.',
      },
    ],
    engineeringMetrics: [
      { label: 'Cellulose β₁₀(c)', value: '2–10', standard: 'ISO 16889' },
      { label: 'Synthetic β₁₀(c)', value: '50–200', standard: 'ISO 16889' },
      { label: 'Glass fiber β₃(c)', value: '>200', standard: 'ISO 16889' },
      { label: 'Cellulose fiber diameter', value: '10–40 µm' },
      { label: 'Synthetic fiber diameter', value: '1–10 µm' },
      { label: 'Glass fiber diameter', value: '0.5–5 µm' },
      { label: 'Synthetic capacity advantage vs cellulose', value: '2–4×' },
      { label: 'Cellulose water absorption', value: '6–8% by weight' },
    ],
    failureConsiderations: [
      'Cellulose media water absorption causes media dimensional change and efficiency degradation in fuel and hydraulic applications with water contamination — synthetic media is required in wet environments.',
      'Glass fiber fracture under high-frequency pressure pulsation (hydraulic circuits) can migrate downstream, damaging precisely controlled clearances in servo valves.',
      'Pleat collapse under elevated ΔP reduces effective media area, causing non-linear restriction increase and premature service — confirmed by post-service element cross-section examination.',
    ],
    relatedTechnologies: ['MACROCORE™', 'SYNTRAX™', 'NANOFORCE™', 'MICROKAPPA™', 'SYNTAPORE™'],
    relatedSystems: ['Air Intake Protection', 'Lubrication Protection', 'Hydraulic Protection', 'Fuel Cleanliness Protection'],
    relatedIndustries: ['Mining', 'Agriculture', 'Manufacturing', 'Marine'],
    relatedKCArticles: ['filter-media-science', 'testing-and-validation', 'airflow-engineering'],
    references: [
      'ELIMFILTERS Knowledge Center — Filter Media Science (filter-media-science)',
      'ISO 16889:2022 — Multi-pass method for evaluating filter element performance',
      'ISO 29463 — High-efficiency air filters (EPA, HEPA, ULPA)',
    ],
  },
  {
    slug: 'materials-engineering',
    number: '09',
    title: 'Materials Engineering',
    definition:
      'Materials engineering for industrial filters covers housing alloys, elastomer compounds, end-cap bonding methods, and structural support materials. Each component must be compatible with the process fluid, operating temperature, and system pressure to maintain structural integrity and sealing performance throughout the service interval.',
    engineeringPurpose:
      'Material incompatibilities cause filter failure independent of media performance — a mismatched elastomer swells and loses sealing capability within the first service interval; an undersized housing fails under cold-start bypass pressure; incorrect end-cap bonding dissolves in synthetic lubricant. Material specification is the first quality gate in filter engineering.',
    applicableStandards: ['ISO 16889'],
    keyConcepts: [
      {
        term: 'NBR (nitrile rubber)',
        definition:
          'Standard elastomer for petroleum-based fuel and oil applications. Temperature range: −40°C to 120°C continuous. Provides resistance to aliphatic hydrocarbons, petroleum oils, diesel fuel, and lubricating oils. Degrades in phosphate ester hydraulic fluids and brake fluids.',
      },
      {
        term: 'FKM (fluoroelastomer / Viton)',
        definition:
          'High-performance elastomer for synthetic lubricants, biodiesel, high-temperature petroleum, and H₂S sour gas service. Temperature range: −20°C to 200°C. Required in oil & gas applications where H₂S is present — NBR degrades rapidly in sour gas environments.',
      },
      {
        term: 'EPDM',
        definition:
          'Elastomer for water-glycol coolant applications. Good resistance to steam, hot water, and glycol-based coolants. NOT compatible with petroleum fluids — swells rapidly in oil or diesel. Application-specific selection is critical to avoid misapplication.',
      },
      {
        term: 'Steel housing construction',
        definition:
          'Cold-drawn steel housings (thickness 0.8–1.2 mm) for spin-on filters, burst-rated to 2–4× working pressure. Heavy-duty headers for hydraulic elements use ductile cast iron or carbon steel with O-ring face seal (ORFS) connections. External corrosion protection: zinc phosphating, e-coat, or polymer coating.',
      },
      {
        term: 'End-cap bonding methods',
        definition:
          'Plastisol (PVC-based, to 120°C), epoxy (to 150°C, chemical resistance to synthetic lubricants), or thermal bonding (no adhesive, highest purity, eliminates adhesive contamination risk). Selection based on fluid compatibility and temperature requirements.',
      },
    ],
    engineeringMetrics: [
      { label: 'NBR temperature range', value: '−40°C to 120°C' },
      { label: 'FKM temperature range', value: '−20°C to 200°C' },
      { label: 'Silicone temperature range', value: '−60°C to 200°C' },
      { label: 'Steel housing burst rating', value: '2–4× working pressure' },
      { label: 'Plastisol bond temperature limit', value: '120°C' },
      { label: 'Epoxy bond temperature limit', value: '150°C' },
    ],
    failureConsiderations: [
      'NBR gaskets in phosphate ester or synthetic ester hydraulic fluids swell 30–100% within 500 hours, losing sealing load and creating a contamination bypass path.',
      'EPDM seals in petroleum oil applications swell and extrude from the seal groove within the first service interval, causing immediate fluid leakage.',
      'Plastisol end-cap bonding in synthetic lubricant service softens at operating temperature, allowing media separation from end caps and unrestricted bypass flow.',
    ],
    relatedTechnologies: ['SYNTRAX™', 'DURATECH™', 'MARINECLEAN™'],
    relatedSystems: ['Lubrication Protection', 'Hydraulic Protection', 'Fuel Cleanliness Protection'],
    relatedIndustries: ['Oil & Gas', 'Marine', 'Mining', 'Manufacturing'],
    relatedKCArticles: ['materials-engineering', 'seal-integrity', 'oem-engineering'],
    references: [
      'ELIMFILTERS Knowledge Center — Materials Engineering (materials-engineering)',
      'ELIMFILTERS Knowledge Center — Seal Integrity (seal-integrity)',
    ],
  },
  {
    slug: 'seal-engineering',
    number: '10',
    title: 'Seal Engineering',
    definition:
      'Seal engineering governs the boundary between filtered and unfiltered fluid in a filter assembly. The gasket, bypass valve, anti-drain back valve, and end-cap bonding collectively define the system\'s contamination boundary. Seal failure provides zero contamination protection regardless of media performance — unfiltered fluid bypasses the media entirely.',
    engineeringPurpose:
      'A filter with compromised seal integrity provides zero protection. Seal engineering verifies that the gasket material, installation torque, bypass valve specification, and ADB valve performance meet the application requirements at all operating temperatures throughout the service interval.',
    applicableStandards: ['ISO 16889'],
    keyConcepts: [
      {
        term: 'Gasket compression sealing',
        definition:
          'Gasket cross-section (circular, D-ring, or flat-face) determines sealing load distribution. Circular cross-sections provide consistent radial load. Flat-face designs require controlled compression to avoid extrusion. Installation torque: 20–30 Nm (wrench) or hand-tight plus ¾ turn (spin-on) per OEM specification.',
      },
      {
        term: 'Bypass valve operation',
        definition:
          'Typical bypass valve opens at 0.8–1.0 bar ΔP to prevent oil starvation during cold start (high-viscosity oil). At bypass, unfiltered oil enters the engine. Inferior spring designs may allow partial opening at elevated temperature due to spring relaxation without triggering a restriction fault.',
      },
      {
        term: 'Bypass valve cracking pressure',
        definition:
          'OEM-specified ΔP at which the bypass valve opens. Range: 0.8–1.5 bar across applications. Aftermarket filters must match or exceed OEM cracking pressure — lower cracking pressure allows bypass under normal operating conditions, not just cold start.',
      },
      {
        term: 'Anti-drain back (ADB) valve',
        definition:
          'Prevents oil column from draining to sump on engine stop, eliminating 3–8 seconds of dry starting. Measured by leak rate under static head: <1 mL/min over 60 minutes is the standard specification.',
      },
      {
        term: 'Leak path detection',
        definition:
          'Seal failure paths: gasket under-compression (insufficient torque), gasket extrusion (over-torque), gasket creep relaxation (thermal cycling), end-cap separation, bypass valve stuck open. Each path produces different contamination signatures in oil analysis.',
      },
    ],
    engineeringMetrics: [
      { label: 'Gasket installation torque', value: '20–30 Nm (flanged)' },
      { label: 'Spin-on installation', value: 'Hand-tight + ¾ turn' },
      { label: 'Bypass valve cracking pressure range', value: '0.8–1.5 bar' },
      { label: 'ADB leak specification', value: '<1 mL/min / 60 min' },
      { label: 'NBR gasket thermal range', value: '−40°C to 150°C' },
    ],
    failureConsiderations: [
      'Over-torquing extrudes gasket beyond compression limit — contact area reduces, creep relaxation accelerates, and seal fails within 1–2 service intervals.',
      'Under-torquing creates micro-leak path — may not produce visible external leakage but allows contamination to bypass the filter media at the gasket interface.',
      'Bypass valve spring relaxation at sustained high temperature allows partial bypass opening during normal operation — confirmed only by opening the bypass valve at operating temperature, not static pressure test.',
    ],
    relatedTechnologies: ['SYNTRAX™', 'DRYCORE™'],
    relatedSystems: ['Lubrication Protection', 'Hydraulic Protection'],
    relatedIndustries: ['Mining', 'Truck Fleets', 'Railway', 'Power Generation'],
    relatedKCArticles: ['seal-integrity', 'materials-engineering', 'oem-engineering'],
    references: [
      'ELIMFILTERS Knowledge Center — Seal Integrity (seal-integrity)',
      'ISO 16889:2022 — Multi-pass method for filter element performance (bypass valve test conditions)',
    ],
  },
  {
    slug: 'fluid-cleanliness',
    number: '11',
    title: 'Fluid Cleanliness Management',
    definition:
      'Fluid cleanliness management is the systematic process of setting cleanliness targets for industrial fluids (hydraulic, lube, fuel), measuring actual cleanliness via particle counting, maintaining cleanliness through appropriate filtration, and verifying cleanliness through oil analysis programs. Cleanliness is quantified using ISO 4406 codes.',
    engineeringPurpose:
      'Fluid cleanliness management shifts contamination control from reactive (wait for failure, then investigate) to proactive (measure cleanliness continuously, maintain specification, predict failure risk). Oil analysis combined with particle counting provides both contamination status (ISO code) and wear generation data (elemental spectroscopy), enabling condition-based maintenance.',
    applicableStandards: ['ISO 4406', 'ISO 16889', 'ISO 11171', 'NFPA T2.14'],
    keyConcepts: [
      {
        term: 'Target cleanliness code selection',
        definition:
          'Set by the most sensitive component in the fluid circuit. Servo valves (1–3 µm clearance): ISO 14/12/9. Proportional valves (5–10 µm): ISO 16/14/11. Engine bearings (5–25 µm): ISO 16/14/11. Gear pumps (15–30 µm): ISO 19/17/14. The target establishes the Beta ratio and absolute rating required at the specified ingress rate.',
      },
      {
        term: 'New oil cleanliness',
        definition:
          'New oil from the drum is NOT clean to system specification — typical new oil is ISO 18/16/13 or worse. Filling a clean system with new oil from unfiltered containers introduces contamination. Filter transfer carts or kidney loop conditioning are required before fill.',
      },
      {
        term: 'Oil analysis program',
        definition:
          'Combines particle counting (ISO 4406 code), elemental spectroscopy (ICP — wear metals by element), and physical properties (viscosity, TAN, TBN, water content). Each data stream provides different diagnostic information. Trend analysis over consistent sampling intervals has more diagnostic value than single-point measurements.',
      },
      {
        term: 'Sampling methodology',
        definition:
          'Samples must be drawn from live zones (not stagnant lines), in representative bottles (pre-cleaned to ISO 14/12/11 or better), at consistent points in the system. Sampling from the bottom of a sump or from a drain valve captures settled contamination, not representative system fluid.',
      },
      {
        term: 'Wear metal patterns',
        definition:
          'Elemental spectroscopy maps wear sources: iron = steel components (rings, cylinders, gears); chromium = chrome-plated bores/rings; aluminum = pistons/housings; copper/tin = bearings; silicon = dirt ingress or sealant degradation. Silicon increase in lube oil typically indicates air intake breach.',
      },
    ],
    engineeringMetrics: [
      { label: 'Servo valve cleanliness target', value: 'ISO 14/12/9', standard: 'NFPA T2.14' },
      { label: 'Engine lube target', value: 'ISO 16/14/11' },
      { label: 'Hydraulic motor target', value: 'ISO 17/15/12' },
      { label: 'Gear pump target', value: 'ISO 19/17/14' },
      { label: 'Flush target before commissioning', value: 'ISO 17/15/12' },
      { label: 'New oil typical cleanliness', value: 'ISO 18/16/13' },
    ],
    failureConsiderations: [
      'Using new oil directly from drums without conditioning introduces ISO 18/16/13 contamination into systems designed for ISO 16/14/11 — filling is itself a contamination event.',
      'Inconsistent sampling points or intervals invalidate trend analysis — a single anomalous sample may trigger unnecessary maintenance or mask a real degradation trend.',
      'Silicon spike in oil analysis misinterpreted as sealant contamination when the actual source is silica ingestion through air intake breach — causes wrong corrective action (replace sealant vs inspect air filter system).',
    ],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™'],
    relatedSystems: ['Hydraulic Protection', 'Lubrication Protection'],
    relatedIndustries: ['Mining', 'Manufacturing', 'Agriculture', 'Marine'],
    relatedKCArticles: ['fluid-cleanliness', 'contamination-control', 'service-intervals', 'failure-analysis'],
    references: [
      'ISO 4406:2021 — Hydraulic fluid power — Contamination level coding',
      'ISO 11171:2016 — Calibration of automatic particle counters',
      'NFPA T2.14:2005 — Fluid cleanliness guidelines for hydraulic equipment',
      'ELIMFILTERS Knowledge Center — Fluid Cleanliness (fluid-cleanliness)',
    ],
  },
  {
    slug: 'air-cleanliness',
    number: '12',
    title: 'Air Cleanliness Engineering',
    definition:
      'Air cleanliness engineering covers the measurement, specification, and control of airborne contaminants in industrial contexts — including engine intake air, compressed air for instrumentation and process applications, and operator cabin air. Each application has distinct contaminant types, measurement standards, and cleanliness targets.',
    engineeringPurpose:
      'Air contamination causes three distinct damage mechanisms: particulate ingestion causing abrasive wear in engines, compressed air contamination causing instrument malfunction and process quality failures, and airborne dust causing operator respiratory disease. Each requires a different measurement standard and technology response.',
    applicableStandards: ['ISO 5011', 'ISO 8573-1', 'ISO 11155-1', 'SAE J1539', 'DIN 71220'],
    keyConcepts: [
      {
        term: 'Engine intake air quality',
        definition:
          'Engine air intake filters capture airborne dust to prevent abrasive wear in cylinder bores, piston rings, and valve seats. Silica (quartz) particles — the primary component of soil and mineral dust — are extremely abrasive at hardness 7 Mohs. Efficiency measured per ISO 5011; service determined by restriction indicator.',
      },
      {
        term: 'Compressed air purity classes (ISO 8573-1)',
        definition:
          'Specifies compressed air purity using three class numbers (Particle:Water:Oil). Instrument air: Class 2:4:1. Food contact: Class 1:2:1. General pneumatics: Class 5:4:3. Each class defines maximum contamination concentration — particle, pressure dewpoint, and total oil content.',
      },
      {
        term: 'Cabin air filtration',
        definition:
          'Operator cabin filters protect personnel from ambient particulate (PM₂.₅, PM₁₀, silica dust, grain dust, bioaerosols) and gas-phase contamination. Mining and construction cabs may have silica concentrations exceeding 100× the OSHA PEL. MICROKAPPA™ elements provide H13-class PM₂.₅ efficiency per ISO 11155-2.',
      },
      {
        term: 'Dust concentration by industry',
        definition:
          'Mining: 0.1–5 mg/m³ at equipment. Agriculture (harvest): 500–2,000 mg/m³ around combines. Drilling operations: barite/silica dust at drilling platform level — PENDING ENGINEERING DOCUMENTATION (quantification not yet in ELIMFILTERS Technical Doctrine). Road construction: 1–10 mg/m³ (PENDING ENGINEERING DOCUMENTATION).',
      },
      {
        term: 'PM₂.₅ and PM₁₀',
        definition:
          'Respirable particulate matter classifications: PM₁₀ = particles ≤10 µm aerodynamic diameter; PM₂.₅ = particles ≤2.5 µm. PM₂.₅ penetrates deepest into the respiratory tract. ISO 11155-2 measures cabin filter efficiency against PM₂.₅. MICROKAPPA™ achieves H13-class efficiency at PM₂.₅.',
      },
    ],
    engineeringMetrics: [
      { label: 'Mining dust concentration', value: '0.1–5 mg/m³' },
      { label: 'Harvest dust concentration', value: '500–2,000 mg/m³ (combine proximity)' },
      { label: 'DRYCORE™ moisture control', value: 'Per approved pneumatic brake-system application', standard: 'ISO 8573-1' },
      { label: 'NA engine restriction limit', value: '25 mbar / 10 inH₂O', standard: 'ISO 5011' },
      { label: 'Silica Mohs hardness', value: '7 (vs steel 5–6.5)' },
    ],
    failureConsiderations: [
      'Pre-cleaners not installed in high-dust environments — mining, harvest — overload primary filter elements within hours, requiring emergency service intervals that interrupt operations.',
      'Compressed air contamination above ISO 8573-1 specification causes instrument calibration drift and pneumatic actuator stiction — often misdiagnosed as process control or mechanical faults, not air quality.',
      'Cabin filter service intervals not adjusted for harvest season result in PM₂.₅ breakthrough during the highest-exposure period, directly increasing operator silicosis and occupational disease risk.',
    ],
    relatedTechnologies: ['MACROCORE™', 'INTEKCORE™', 'DRYCORE™', 'MICROKAPPA™'],
    relatedSystems: ['Air Intake Protection', 'Cabin Air Protection'],
    relatedIndustries: ['Mining', 'Agriculture', 'Manufacturing', 'Oil & Gas'],
    relatedKCArticles: ['airflow-engineering', 'air-restriction', 'dust-holding-capacity'],
    references: [
      'ISO 5011:2020 — Inlet air cleaning equipment for internal combustion engines',
      'ISO 8573-1:2010 — Compressed air — Contaminant classes and purity requirements',
      'ISO 11155-1:2001 — Road vehicles — Air conditioning and ventilation',
      'DIN 71220 — Cabin air filter classification',
    ],
  },
  {
    slug: 'performance-metrics',
    number: '13',
    title: 'Filter Performance Metrics',
    definition:
      'Filter performance metrics are the standardized quantitative measures characterizing filter element capability: Beta ratio (filtration efficiency), dirt holding capacity (DHC, service life), initial differential pressure (flow resistance), and collapse pressure (structural integrity). Together these metrics define the complete performance envelope of a filter element.',
    engineeringPurpose:
      'Performance metrics enable specification — translating contamination control requirements into filter selection criteria. Beta ratio at the critical particle size determines whether the target cleanliness code is achievable. DHC determines whether the service interval is achievable under the application ingress rate. Collapse pressure determines whether the element survives worst-case ΔP without structural failure.',
    applicableStandards: ['ISO 16889', 'ISO 5011', 'ISO 11171'],
    keyConcepts: [
      {
        term: 'Beta ratio (β)',
        definition:
          'β at particle size x(c) = upstream particle count ÷ downstream particle count at ≥x µm. Efficiency = (1 − 1/β) × 100%. β₁₀(c) = 200 → 99.5% efficiency. β₁₀(c) = 75 → 98.7%. Measured per ISO 16889 with ISO 11171 calibrated counter. Always requires the "(c)" suffix for valid comparison.',
      },
      {
        term: 'Dirt holding capacity (DHC)',
        definition:
          'Total grams of standardized test contaminant captured by the filter from initial restriction to terminal restriction. Measured per ISO 16889 (fluid filters) and ISO 5011 (air filters). DHC determines service interval — the element reaches the service threshold when DHC is exhausted at the application ingress rate.',
      },
      {
        term: 'Initial differential pressure',
        definition:
          'Pressure drop across a clean element at rated flow and fluid viscosity. Lower initial ΔP means more available headroom before the service limit. Initial ΔP is higher for finer media (better Beta) and decreases with increasing media area (higher DHC). There is a fundamental efficiency-capacity-restriction tradeoff in media design.',
      },
      {
        term: 'Collapse pressure',
        definition:
          'Maximum differential pressure an element withstands without structural failure (media collapse, end-cap separation, or center tube buckling). Must exceed maximum possible system ΔP — bypass valve cracking pressure during cold start with high-viscosity oil. Minimum collapse rating: 2× maximum bypass valve opening pressure.',
      },
      {
        term: 'Fractional efficiency',
        definition:
          'Efficiency measured separately at multiple particle size ranges (0.5, 1, 2, 3, 5, 7, 10, 20, 40, 80 µm in ISO 5011) to characterize the complete efficiency curve. A filter may have high efficiency at ≥10 µm but poor efficiency at 2–5 µm — the critical wear range. Fractional efficiency reveals which particle sizes are not being controlled.',
      },
    ],
    engineeringMetrics: [
      { label: 'β₁₀(c) = 75', value: '98.7% efficiency', standard: 'ISO 16889' },
      { label: 'β₁₀(c) = 200', value: '99.5% efficiency', standard: 'ISO 16889' },
      { label: 'β₁₀(c) = 1000', value: '99.9% efficiency', standard: 'ISO 16889' },
      { label: 'Synthetic DHC vs cellulose', value: '2–4× at equivalent efficiency' },
      { label: 'MACROCORE™ DHC advantage', value: 'Up to 2× cellulose', standard: 'ISO 5011' },
      { label: 'Minimum collapse pressure', value: '2× bypass valve opening pressure' },
    ],
    failureConsiderations: [
      'Specifying Beta at the wrong particle size — selecting β₂₀(c) when the critical particle size is 5 µm — produces an element with good coarse efficiency but inadequate protection in the wear-critical range.',
      'DHC measured at laboratory face velocity and ingress rate may not translate to field service interval if actual operating conditions (higher airflow, higher dust) differ from test conditions.',
      'High initial ΔP media in a bypass-prone system (worn bypass valve seat) may bypass under normal operating conditions if initial restriction already approaches cracking pressure.',
    ],
    relatedTechnologies: ['MACROCORE™', 'SYNTRAX™', 'NANOFORCE™', 'SYNTAPORE™'],
    relatedSystems: ['Air Intake Protection', 'Lubrication Protection', 'Hydraulic Protection'],
    relatedIndustries: ['Mining', 'Agriculture', 'Manufacturing'],
    relatedKCArticles: ['testing-and-validation', 'filter-media-science', 'airflow-engineering', 'oem-engineering'],
    references: [
      'ISO 16889:2022 — Multi-pass method for evaluating filter element performance',
      'ISO 5011:2020 — Inlet air cleaning equipment',
      'ELIMFILTERS Knowledge Center — Testing and Validation (testing-and-validation)',
    ],
  },
  {
    slug: 'test-methods',
    number: '14',
    title: 'Test Methods and Certification',
    definition:
      'Standardized test methods define the controlled conditions under which filter performance is measured and certified. ISO 16889 (multi-pass fluid filter test), ISO 5011 (air cleaner test), and ISO 11171 (APC calibration) form the primary test framework for industrial filtration. Test results are only comparable when the same standard, same calibration, and same reporting methodology are used.',
    engineeringPurpose:
      'Test standards exist to enable valid performance comparison across manufacturers and product lines. Without standardized test methods, filter performance data cannot be compared — marketing efficiency claims without standard reference are meaningless. Understanding test methodology enables engineers to evaluate data quality and identify unsupported claims.',
    applicableStandards: ['ISO 16889', 'ISO 5011', 'ISO 11171', 'ISO 29463'],
    keyConcepts: [
      {
        term: 'ISO 16889 multi-pass test',
        definition:
          'Test fluid (ISO VG 15 oil) contaminated with ISO A2 medium test dust at controlled concentration. Particle counts measured upstream and downstream simultaneously with ISO 11171 calibrated APCs. Contaminated fluid recirculates — particles that pass the filter continue challenging it. Beta values and DHC measured simultaneously throughout the test until terminal ΔP.',
      },
      {
        term: 'ISO 5011 air filter test',
        definition:
          'Covers initial efficiency, dust holding capacity, and fractional efficiency for air cleaners. ISO A2 fine test dust fed at controlled rate. Efficiency measured at 0.5, 1, 2, 3, 5, 7, 10, 20, 40, 80 µm. Restriction monitored continuously. Test conducted at rated airflow; safety element testing follows primary element to characterize total system performance.',
      },
      {
        term: 'ISO 11171 APC calibration',
        definition:
          'Calibration standard for automatic particle counters using NIST-traceable reference particles — ISO Medium Test Dust (ISAC) suspension. Establishes the "c" in β(c). APCs calibrated per ISO 11171 are required for ISO 16889 multi-pass testing and for oil cleanliness measurement to ISO 4406.',
      },
      {
        term: 'Beta(c) reporting requirement',
        definition:
          'Since ~2000, all ISO 16889 test reports must use ISO 11171 calibrated APCs and report β values with the "(c)" suffix. Legacy β values (without "c") used deprecated AC fine test dust. A filter rated β₁₀ = 200 (legacy) may have β₁₀(c) = 10–20 — the difference is large and the data is incompatible.',
      },
      {
        term: 'Terminal differential pressure',
        definition:
          'The ΔP at which the ISO 16889 multi-pass test ends — representing the service limit condition. DHC is the total grams of test dust captured when terminal ΔP is reached. Terminal ΔP is set by the test standard to correspond to realistic service limit conditions.',
      },
    ],
    engineeringMetrics: [
      { label: 'ISO 16889 test fluid', value: 'ISO VG 15', standard: 'ISO 16889' },
      { label: 'ISO 16889 test dust', value: 'ISO A2 medium', standard: 'ISO 16889' },
      { label: 'ISO 5011 test dust', value: 'ISO A2 fine', standard: 'ISO 5011' },
      { label: 'ISO 5011 efficiency measurement sizes', value: '0.5, 1, 2, 3, 5, 7, 10, 20, 40, 80 µm' },
      { label: 'ISO 11171 calibration', value: 'NIST-traceable reference particles' },
      { label: 'β(c) availability', value: 'Required for ISO 16889:2022 compliance' },
    ],
    failureConsiderations: [
      'Comparing β₁₀ (legacy) data from one manufacturer against β₁₀(c) data from another produces invalid comparisons — the scales differ by a factor of 5–20× in some particle size ranges.',
      'Single-point efficiency data (at one particle size) without fractional efficiency data cannot confirm protection across the critical 2–15 µm wear range — filters may appear compliant at one size but fail in the critical range.',
      'Test data from different flow rates is not directly comparable — Beta values decrease at higher face velocity. Manufacturers may publish data at the most favorable test conditions.',
    ],
    relatedTechnologies: ['MACROCORE™', 'SYNTRAX™', 'NANOFORCE™', 'DRYCORE™'],
    relatedSystems: ['Air Intake Protection', 'Hydraulic Protection', 'Lubrication Protection'],
    relatedIndustries: ['Mining', 'Manufacturing', 'Power Generation'],
    relatedKCArticles: ['testing-and-validation', 'filter-media-science', 'oem-engineering'],
    references: [
      'ISO 16889:2022 — Hydraulic fluid power — Multi-pass method for evaluating filter element performance',
      'ISO 5011:2020 — Inlet air cleaning equipment for internal combustion engines',
      'ISO 11171:2016 — Calibration of automatic particle counters for liquids',
      'ELIMFILTERS Knowledge Center — Testing and Validation (testing-and-validation)',
    ],
  },
  {
    slug: 'reliability-engineering',
    number: '15',
    title: 'Reliability Engineering',
    definition:
      'Reliability engineering in industrial filtration quantifies the relationship between filtration system performance and equipment reliability metrics — mean time between failures (MTBF), component life expectancy, and total cost of ownership. It establishes the quantitative case for system-level contamination control versus commodity filter selection.',
    engineeringPurpose:
      'Reliability engineering provides the economic framework connecting filtration investment to asset reliability outcomes. The filter acquisition cost (1–5% of total maintenance cost) can be optimized only by understanding its leverage on the 95–99% of total cost driven by component replacement, oil consumption, and downtime.',
    applicableStandards: ['ISO 4406', 'ISO 16889'],
    keyConcepts: [
      {
        term: 'Bearing life extension',
        definition:
          'Achieving ISO 16/14/11 cleanliness in hydraulic systems extends hydraulic component life 3–5× versus ISO 20/18/15 (commodity filtration). Engine bearings maintained at ISO 16/14/11 extend 3–5× versus poorly filtered systems operating at ISO 19/17/14 or worse.',
      },
      {
        term: 'Total Cost of Ownership (TCO)',
        definition:
          'TCO = filter acquisition + installation labor + oil/fluid cost + component replacement cost + planned maintenance cost + unplanned downtime cost. For a mining haul truck over 10 years, filter acquisition cost represents approximately 1–3% of total TCO. Downtime and component replacement represent 70–85%.',
      },
      {
        term: 'Downtime cost calculation',
        definition:
          'Downtime cost = (lost production value + repair labor + parts + mobilization) per event. A mining shovel at USD $20,000/hour production value experiencing 48 hours downtime from hydraulic failure incurs USD $960,000 in lost production plus USD $50,000–200,000 in repair costs. This represents 200–400× the annual hydraulic filter budget.',
      },
      {
        term: 'Fleet-level economics',
        definition:
          'Fleet-level contamination control economics amplify individual-asset ROI. 50 haul trucks each saving one hydraulic motor replacement per year (USD $12,000/motor) through ISO 16/14/11 compliance = USD $600,000 annual savings. Incremental filtration investment: USD $2,000–5,000 per truck = USD $100,000–250,000. Net fleet benefit: USD $350,000–500,000 annually.',
      },
      {
        term: 'Maintenance interval optimization',
        definition:
          'Condition-based service intervals (replacing filters when the threshold is reached, using oil analysis to extend oil drain intervals) reduces per-asset maintenance cost 15–40% versus fixed interval approaches, while maintaining equivalent protection levels.',
      },
    ],
    engineeringMetrics: [
      { label: 'Bearing life at ISO 16/14/11 vs 19/17/14', value: '3–5×' },
      { label: 'Filter cost / total maintenance', value: '1–5%' },
      { label: 'Typical unplanned downtime event cost', value: '10–100× annual filter budget' },
      { label: 'Hydraulic pump cost vs annual filter budget', value: '50–200×' },
      { label: 'Engine rebuild vs annual lube filter budget', value: '500–2000×' },
      { label: 'Condition-based vs fixed interval savings', value: '15–40%' },
    ],
    failureConsiderations: [
      'Optimizing filter acquisition cost without TCO context — selecting the cheapest filter — risks exponential cost increases in component replacement and downtime that dwarf the procurement savings.',
      'Fleet standardization on a single lower-specification filter for simplicity may underspecify hydraulic circuits while over-specifying air intake circuits — the fleet-level outcome is suboptimal for both cost and protection.',
      'Extended drain programs implemented without oil analysis monitoring risk oil degradation and bearing wear — filter capacity and oil condition must be evaluated together.',
    ],
    relatedTechnologies: ['DURATECH™', 'NANOFORCE™', 'SYNTRAX™', 'MACROCORE™'],
    relatedSystems: ['Hydraulic Protection', 'Lubrication Protection', 'Air Intake Protection'],
    relatedIndustries: ['Mining', 'Agriculture', 'Truck Fleets', 'Power Generation'],
    relatedKCArticles: ['total-cost-of-ownership', 'service-intervals', 'asset-protection-engineering'],
    references: [
      'ELIMFILTERS Knowledge Center — Total Cost of Ownership (total-cost-of-ownership)',
      'ELIMFILTERS Knowledge Center — Service Intervals (service-intervals)',
      'ELIMFILTERS Knowledge Center — Asset Protection Engineering (asset-protection-engineering)',
    ],
  },
  {
    slug: 'failure-mechanisms',
    number: '16',
    title: 'Failure Mechanisms',
    definition:
      'Failure mechanisms in contamination-related equipment failures are the physical processes by which contaminant particles, water, or chemical degradation products cause component damage. The three primary mechanical failure mechanisms are abrasive wear, adhesive wear, and fatigue wear — each producing distinct particle morphologies and different consequences for equipment reliability.',
    engineeringPurpose:
      'Identifying the active failure mechanism enables targeted corrective action. Abrasive wear from silica ingestion requires addressing the air intake system. Fatigue wear from fluid cavitation requires addressing fluid cleanliness and system design. Misidentifying the mechanism leads to incorrect protective action — replacing the wrong filter while the actual damage pathway continues.',
    applicableStandards: ['ISO 4406', 'ISO 16889'],
    keyConcepts: [
      {
        term: 'Abrasive wear (two-body)',
        definition:
          'Hard particles (silica, metal carbides) embedded in a soft surface cut grooves in the opposing surface. Silica at Mohs 7 abrades steel surfaces at Mohs 5–6.5. Produces angular, ribbon-like wear particles in oil analysis. Primary cause: air intake breach introducing silica into lube system.',
      },
      {
        term: 'Abrasive wear (three-body)',
        definition:
          'Hard particles free in the lubricant gap between two surfaces act as rolling abrasive media, creating micro-pitting on both surfaces. The 5–15 µm particle range is most damaging — sizes matching bearing clearances where particles are trapped and roll under load.',
      },
      {
        term: 'Adhesive wear',
        definition:
          'Occurs when lubricant film fails between two metallic surfaces under load — metal-to-metal contact creates adhesion (welding at asperities). Produces smooth, featureless wear particles. Primary causes: insufficient lubricant viscosity, thermal degradation of oil film, bearing overload.',
      },
      {
        term: 'Surface fatigue wear',
        definition:
          'Repeated stress cycling in bearing raceways creates subsurface fatigue cracks that propagate to the surface, releasing flat, smooth, uniformly sized platelets. Accelerated by fine particle contamination (1–5 µm) that increases contact stress in EHD lubrication films.',
      },
      {
        term: 'Filtration failure root causes',
        definition:
          'Five failure modes: (1) seal failure allowing ingress above filtration capacity; (2) element bypass from over-service interval; (3) bypass valve stuck open; (4) incorrect filter specification (wrong Beta, wrong particle size); (5) commissioning contamination never flushed from system.',
      },
    ],
    engineeringMetrics: [
      { label: 'Silica hardness', value: 'Mohs 7 (steel = 5–6.5)' },
      { label: 'Critical abrasive particle range', value: '5–15 µm (bearing clearance range)' },
      { label: 'Large particle diagnostic threshold', value: '>100 µm = acute wear event' },
      { label: 'Fine particle chronic wear indicator', value: '<25 µm sustained increase' },
    ],
    failureConsiderations: [
      'Identifying iron particles in oil without silicon particles incorrectly excludes air intake breach as the cause — silicon may have already been filtered out by the time analysis is performed, but the wear process continues.',
      'Misclassifying adhesive wear particles as fatigue wear particles leads to the wrong diagnostic conclusion — adhesive wear indicates lubrication failure; fatigue wear indicates contamination or overload.',
      'Filter element inspection revealing large metallic particles (>100 µm) indicates an acute ongoing wear event — continued operation without shutdown and investigation risks catastrophic failure.',
    ],
    relatedTechnologies: ['MACROCORE™', 'SYNTRAX™', 'NANOFORCE™'],
    relatedSystems: ['Air Intake Protection', 'Lubrication Protection', 'Hydraulic Protection'],
    relatedIndustries: ['Mining', 'Agriculture', 'Manufacturing'],
    relatedKCArticles: ['failure-analysis', 'contamination-control', 'particle-science'],
    references: [
      'ELIMFILTERS Knowledge Center — Failure Analysis (failure-analysis)',
      'ELIMFILTERS Knowledge Center — Contamination Control (contamination-control)',
    ],
  },
  {
    slug: 'maintenance-engineering',
    number: '17',
    title: 'Maintenance Engineering',
    definition:
      'Maintenance engineering defines when, how, and at what intervals filtration components are serviced to maintain system protection within specification. The core decision — fixed interval versus condition-based service — determines both the cost and effectiveness of the maintenance program. Environment adjustment factors calibrate base intervals to actual operating conditions.',
    engineeringPurpose:
      'A correct maintenance strategy ensures that filters are replaced before protection gaps develop, without wasting capacity through premature replacement. Condition-based maintenance requires instrumentation (restriction indicators, oil analysis programs) but produces 15–40% cost savings versus fixed intervals while maintaining or improving protection.',
    applicableStandards: ['ISO 4406', 'ISO 5011'],
    keyConcepts: [
      {
        term: 'Fixed interval maintenance',
        definition:
          'OEM-specified intervals (e.g., 500 hours, 10,000 km) designed for worst-case operating conditions. Equipment in moderate environments replaces elements before reaching functional limits (waste). Equipment in severe environments may reach limits before scheduled service (protection gap).',
      },
      {
        term: 'Condition-based service (CBS)',
        definition:
          'Replace when restriction indicator triggers (air filters), oil analysis limits are reached (lube), or particle count exceeds target code (hydraulic). CBS extends intervals 30–200% in light-duty environments and prevents protection gaps in severe environments by triggering service when actually needed.',
      },
      {
        term: 'Environment adjustment factors',
        definition:
          'Multipliers adjusting OEM base intervals to actual operating conditions: Dust factor 0.25× (severe mining) to 1.0× (clean indoor). Temperature factor 0.5× (continuous high temperature) to 1.0× (nominal). Idle time factor 0.5× to 1.5×. Correct factors identify both over-servicing and under-servicing within existing fleets.',
      },
      {
        term: 'Air filter service trigger',
        definition:
          'Restriction indicator reaches calibrated threshold (25 mbar NA, 62.5 mbar turbo). Mechanical indicator latches for visual confirmation. Electronic sensor logs restriction history enabling trend-based prediction. Do not replace on mileage alone when restriction data is available.',
      },
      {
        term: 'Extended drain intervals',
        definition:
          'Lube oil drain interval extension requires synthetic media elements (higher dirt holding capacity) AND oil analysis monitoring — filter capacity and oil condition must be evaluated together. Blind interval extension without monitoring risks bearing wear from degraded oil.',
      },
    ],
    engineeringMetrics: [
      { label: 'Condition-based vs fixed savings', value: '15–40%' },
      { label: 'Severe dust adjustment factor', value: '0.25× base interval' },
      { label: 'High temperature adjustment factor', value: '0.5× base interval' },
      { label: 'Harvest season air filter interval', value: '8–24 hrs (Agriculture)' },
      { label: 'Highway truck air filter interval', value: '60,000–150,000 km' },
      { label: 'Urban truck air filter interval', value: '30,000–80,000 km' },
    ],
    failureConsiderations: [
      'Fixed intervals set for worst-case conditions cause over-servicing in clean environments — capacity is wasted and maintenance cost is unnecessarily elevated without protection benefit.',
      'Extended drain intervals without oil analysis monitoring may allow oil viscosity or TAN to degrade before the filter service trigger, creating a period of inadequate lubrication protection.',
      'Failure to apply harvest-season service factors for agricultural equipment creates extreme protection gaps during the period of maximum contamination exposure.',
    ],
    relatedTechnologies: ['DURATECH™', 'MACROCORE™', 'SYNTRAX™'],
    relatedSystems: ['Air Intake Protection', 'Lubrication Protection', 'Hydraulic Protection'],
    relatedIndustries: ['Mining', 'Agriculture', 'Truck Fleets', 'Railway'],
    relatedKCArticles: ['service-intervals', 'total-cost-of-ownership', 'asset-protection-engineering'],
    references: [
      'ELIMFILTERS Knowledge Center — Service Intervals (service-intervals)',
      'ELIMFILTERS Knowledge Center — Total Cost of Ownership (total-cost-of-ownership)',
    ],
  },
  {
    slug: 'environmental-conditions',
    number: '18',
    title: 'Environmental Conditions by Industry',
    definition:
      'Environmental conditions determine contamination exposure levels and the corresponding filtration requirements for each industrial application. Dust type, concentration, temperature, humidity, duty cycle, and chemical environment (H₂S, salt, organic matter) define the filtration challenge. Matching filtration design to the actual environmental profile — not the average OEM specification — is required for effective asset protection.',
    engineeringPurpose:
      'OEM specifications represent nominal operating conditions. Industrial equipment in mining, agriculture, marine, or oil & gas faces contamination profiles that can exceed OEM baseline by 10–100×. Understanding the specific environmental profile for each application enables correct service interval adjustment and technology selection.',
    applicableStandards: ['ISO 5011', 'ISO 4406', 'ISO 8573-1', 'ISO 12937'],
    keyConcepts: [
      {
        term: 'Mining environment',
        definition:
          'Airborne dust concentrations 0.1–5 mg/m³ at equipment level; silica content typically 5–40% depending on ore type. Extreme duty cycles (24/7 operation). Hydraulic systems experience high-cycle shock loads from rock fragmentation and material handling. Air filter intervals may be as low as 100 hours.',
      },
      {
        term: 'Agriculture — harvest season',
        definition:
          'Combine harvesters generate 500–2,000 mg/m³ grain dust at operating proximity. Harvest air filter intervals: 8–24 hours depending on crop type, humidity, and machine configuration. Pre-cleaner systems mandatory to achieve acceptable primary element service life during harvest windows.',
      },
      {
        term: 'Marine environment',
        definition:
          'Saltwater intrusion affects all fluid systems and metallic components. Marine diesel tank condensation creates water contamination risk (large tank volumes, long dwell times, temperature differentials). Microbial growth at fuel/water interface blocks filters rapidly under warm conditions. IMO compliance required for international vessels.',
      },
      {
        term: 'Oil & gas — drilling',
        definition:
          'Active drilling generates airborne barite (BaSO₄) and formation mineral dust. H₂S sour gas service requires FKM (Viton) elastomers throughout — NBR degrades rapidly. Instrument air quality critical for process control: ISO 8573-1 Class 1:4:1. Rig air filter intervals as low as 100–300 hours during active drilling.',
      },
      {
        term: 'Truck fleet — modern diesel',
        definition:
          'EGR (exhaust gas recirculation) and DPF aftertreatment introduce new contamination modes: EGR soot in lube oil at 1–5% by mass, fuel dilution from DPF post-injection reducing lube oil viscosity. Urban routes generate higher soot loads than highway. Lube oil analysis programs required to validate extended drain intervals.',
      },
    ],
    engineeringMetrics: [
      { label: 'Mining dust concentration', value: '0.1–5 mg/m³' },
      { label: 'Agriculture harvest dust', value: '500–2,000 mg/m³' },
      { label: 'Harvest air filter interval', value: '8–24 hours' },
      { label: 'Mining air filter interval', value: '100–500 hours (application-specific)' },
      { label: 'H₂S elastomer requirement', value: 'FKM (Viton) — not NBR' },
      { label: 'Marine tank condensation risk', value: 'HIGH — large volumes, long dwell' },
      { label: 'EGR soot in lube oil', value: '1–5% by mass (modern diesel)' },
    ],
    failureConsiderations: [
      'Applying standard OEM intervals in mining or harvest environments without dust environment adjustment causes premature element saturation, protection gaps, and increased engine wear.',
      'Standard NBR seals installed in H₂S oil and gas service degrade within 200–500 hours — catastrophic seal failure causes massive fluid loss and contamination events.',
      'Marine fuel polishing programs not scheduled for standby diesel generators allow 6–12 months of microbial growth and water accumulation, risking fuel delivery failure on emergency generator start.',
    ],
    relatedTechnologies: ['MACROCORE™', 'INTEKCORE™', 'TURBOCORE™', 'SYNTAPORE™', 'MARINECLEAN™', 'MICROKAPPA™'],
    relatedSystems: ['Air Intake Protection', 'Fuel Cleanliness Protection', 'Cabin Air Protection'],
    relatedIndustries: ['Mining', 'Agriculture', 'Marine', 'Oil & Gas', 'Truck Fleets', 'Power Generation'],
    relatedKCArticles: ['dust-holding-capacity', 'service-intervals', 'airflow-engineering'],
    references: [
      'ELIMFILTERS Knowledge Center — Dust Holding Capacity (dust-holding-capacity)',
      'ELIMFILTERS Knowledge Center — Service Intervals (service-intervals)',
      'ISO 12937:2000 — Water determination in petroleum products',
    ],
  },
  {
    slug: 'engineering-calculations',
    number: '19',
    title: 'Engineering Calculations',
    definition:
      'Engineering calculations in filtration system design translate performance requirements into quantitative specifications. Core calculations include contamination budget (ingress vs removal rate), service interval prediction from dust holding capacity and ingress rate, pressure drop estimation, and total cost of ownership analysis. These calculations provide the quantitative foundation for filter selection and system design.',
    engineeringPurpose:
      'Engineering calculations allow engineers to predict system behavior before installation — selecting elements that will achieve cleanliness targets at the application ingress rate, and service intervals that balance cost and protection. Calculations that do not match field observation indicate incorrect input assumptions (actual dust concentration, actual flow rate) requiring recalibration.',
    applicableStandards: ['ISO 4406', 'ISO 5011', 'ISO 16889'],
    keyConcepts: [
      {
        term: 'Service interval prediction (air filter)',
        definition:
          'Service interval (hours) = DHC (grams) ÷ [dust concentration (mg/m³) × airflow rate (m³/h) × 0.001 (mg→g)]. Example: 500g DHC, 1 mg/m³ dust, 1,000 m³/h airflow → 500 theoretical hours. Apply service factor of 0.8–0.85 (replace at 80–85% of theoretical capacity).',
      },
      {
        term: 'Contamination budget',
        definition:
          'Particle ingress rate (particles/hour) = dust concentration × airflow × particle count per gram × efficiency gap. Particle removal rate (particles/hour) = total flow × filter efficiency at critical size. Balance requires removal rate ≥ ingress rate to maintain target cleanliness code.',
      },
      {
        term: 'Beta ratio to efficiency conversion',
        definition:
          'Efficiency (%) = (1 − 1/β) × 100. β = 2 → 50%; β = 10 → 90%; β = 75 → 98.7%; β = 200 → 99.5%; β = 1000 → 99.9%. The relationship is logarithmic — going from β = 10 to β = 200 is a qualitative change, not a 20× proportional improvement in protection.',
      },
      {
        term: 'Pressure drop estimation',
        definition:
          'ΔP scales approximately linearly with flow rate and fluid viscosity. ΔP at new conditions = ΔP_rated × (Q_new/Q_rated) × (η_new/η_rated) where Q = flow rate and η = dynamic viscosity. Cold-start viscosity (40°C) may be 5–10× operating viscosity (100°C), producing 5–10× rated initial ΔP — the basis for bypass valve sizing.',
      },
      {
        term: 'TCO differential calculation',
        definition:
          'TCO difference = (component life extension value) − (incremental filter cost). If ISO 16/14/11 extends hydraulic motor life 3× and motor costs USD $12,000, life extension value = 2× $12,000 = $24,000 per motor per asset. Incremental filter cost to achieve ISO 16/14/11 vs ISO 19/17/14 = USD $500–2,000/year. Net benefit: USD $22,000–23,500/motor replaced.',
      },
    ],
    engineeringMetrics: [
      { label: 'Service factor for DHC scheduling', value: '0.80–0.85 (replace at 80–85% DHC)' },
      { label: 'β efficiency formula', value: 'Efficiency = (1 − 1/β) × 100%' },
      { label: 'β = 200 efficiency', value: '99.5%' },
      { label: 'Cold start viscosity multiplier', value: '5–10× operating viscosity (typical)' },
      { label: 'TCO filter cost share', value: '1–5% of total maintenance cost' },
    ],
    failureConsiderations: [
      'Service interval calculations using nominal dust concentrations instead of peak concentrations underestimate ingress rate — intervals should be calculated at 80th percentile dust concentration for the application, not average.',
      'Pressure drop estimation without temperature correction overstates cold-start ΔP margin — bypassing this check risks specifying elements that bypass during normal cold operation.',
      'Beta ratio linear scaling assumption — assuming β = 400 provides exactly 2× the protection of β = 200 — is incorrect. At high efficiency values, the incremental improvement is small and the TCO impact is minimal; protection gaps at low Beta values are far more impactful.',
    ],
    relatedTechnologies: ['MACROCORE™', 'NANOFORCE™', 'SYNTRAX™', 'DURATECH™'],
    relatedSystems: ['Air Intake Protection', 'Hydraulic Protection', 'Lubrication Protection'],
    relatedIndustries: ['Mining', 'Agriculture', 'Manufacturing'],
    relatedKCArticles: ['total-cost-of-ownership', 'dust-holding-capacity', 'contamination-control', 'service-intervals'],
    references: [
      'ISO 5011:2020 — DHC test methodology and ingress rate calculation basis',
      'ISO 4406:2021 — Particle count code conversion tables',
      'ELIMFILTERS Knowledge Center — Dust Holding Capacity (dust-holding-capacity)',
      'ELIMFILTERS Knowledge Center — Total Cost of Ownership (total-cost-of-ownership)',
    ],
  },
  {
    slug: 'engineering-glossary',
    number: '20',
    title: 'Engineering Glossary',
    definition:
      'Standardized definitions for technical terms used across the ELIMFILTERS Engineering Reference Library and Knowledge Center. All definitions are derived from documented ISO standards, ASTM methods, NFPA specifications, or ELIMFILTERS technical documentation. Terms marked "PENDING ENGINEERING DOCUMENTATION" require additional documentation before formal definition.',
    engineeringPurpose:
      'A consistent, standards-grounded glossary eliminates terminology ambiguity in engineering specifications, maintenance programs, and procurement documents. All ELIMFILTERS Knowledge Center content uses terms as defined here — cross-page consistency enables reliable citation by engineering teams and AI systems.',
    applicableStandards: [
      'ISO 4406',
      'ISO 16889',
      'ISO 5011',
      'ISO 11171',
      'ISO 8573-1',
      'NFPA T2.14',
    ],
    keyConcepts: [
      {
        term: 'Absolute rating',
        definition:
          'The size of the largest particle that passes through a filter element under specified test conditions. NOT the same as nominal rating. Absolute ratings are derived from multi-pass test data (ISO 16889) and relate to specific Beta values at the rated size.',
      },
      {
        term: 'Beta ratio (β)',
        definition:
          'The ratio of upstream to downstream particle count at a specified size, per ISO 16889. β₁₀(c) = 200 means 200 particles >10 µm enter for every 1 that exits — 99.5% efficiency. The "(c)" suffix indicates ISO 11171 calibrated counting.',
      },
      {
        term: 'Cleanliness code (ISO 4406)',
        definition:
          'Three-number code representing particle count ranges per mL at ≥4 µm, ≥6 µm, and ≥14 µm. Code 17/15/12 means: 640–1,280 particles/mL at ≥4 µm; 160–320 at ≥6 µm; 20–40 at ≥14 µm. Each unit increase doubles the count.',
      },
      {
        term: 'Dirt holding capacity (DHC)',
        definition:
          'Total mass of standardized test contaminant (grams) captured by a filter from initial to terminal differential pressure, per ISO 16889 (fluid) or ISO 5011 (air). Determines service life at a given ingress rate.',
      },
      {
        term: 'Differential pressure (ΔP)',
        definition:
          'Pressure difference between the upstream and downstream sides of the filter element. Measured in mbar, Pa, or inH₂O. Increases as element loads with contaminant. Service limit is the maximum allowable ΔP before element replacement.',
      },
      {
        term: 'Face velocity',
        definition:
          'Fluid or air velocity through the filter face area (m/s or m³/h per m²). Higher face velocity increases pressure drop and can decrease efficiency. Target face velocity for air filters: 0.05–0.15 m/s per ISO 5011 design guidelines.',
      },
      {
        term: 'Fractional efficiency',
        definition:
          'Filter efficiency measured at each of multiple particle size intervals, characterizing the complete efficiency curve across all relevant particle sizes (per ISO 5011 at 0.5, 1, 2, 3, 5, 7, 10, 20, 40, 80 µm).',
      },
      {
        term: 'ISO 4406 code',
        definition: 'See "Cleanliness code (ISO 4406)" above.',
      },
      {
        term: 'Most Penetrating Particle Size (MPPS)',
        definition:
          'The particle size with minimum filtration efficiency, typically 0.1–0.3 µm, where neither inertial/interception nor diffusion mechanisms dominate. ISO 29463 HEPA/ULPA filters are tested and rated at MPPS.',
      },
      {
        term: 'Nominal rating',
        definition:
          'PENDING ENGINEERING DOCUMENTATION — The industry has no standardized definition of "nominal" rating; values are manufacturer-defined. Engineers should always request and compare β(c) data rather than nominal ratings when specifying filters.',
      },
      {
        term: 'Bypass valve',
        definition:
          'Spring-loaded valve opening at a specified ΔP (typically 0.8–1.0 bar) to protect the system from flow starvation when the filter element is severely restricted. At bypass, unfiltered fluid enters the system — bypass is a protection-of-last-resort, not an operating mode.',
      },
      {
        term: 'Condition-based service (CBS)',
        definition:
          'Maintenance strategy replacing filter elements when measurable indicators (restriction threshold, oil analysis limits, particle count exceedance) signal that service is needed — not on a fixed calendar or mileage schedule.',
      },
    ],
    engineeringMetrics: [
      { label: 'β = 200 efficiency', value: '99.5%' },
      { label: 'ISO 4406 code increment', value: '×2 particle count per unit' },
      { label: 'MPPS range', value: '0.1–0.3 µm', standard: 'ISO 29463' },
      { label: 'Bypass valve typical cracking pressure', value: '0.8–1.0 bar' },
      { label: 'Standard DHC test contaminant', value: 'ISO A2 fine dust', standard: 'ISO 16889' },
    ],
    failureConsiderations: [
      'Using nominal ratings for filter selection without requesting β(c) data results in unknowable actual efficiency — nominal ratings are not standardized and cannot be compared across manufacturers.',
      'Treating bypass valve actuation as an expected operating condition (not an alarm condition) leads to extended operation with unfiltered fluid entering sensitive components.',
    ],
    relatedTechnologies: ['MACROCORE™', 'SYNTRAX™', 'NANOFORCE™', 'DRYCORE™', 'MICROKAPPA™'],
    relatedSystems: ['Air Intake Protection', 'Lubrication Protection', 'Hydraulic Protection'],
    relatedIndustries: ['Mining', 'Manufacturing', 'Agriculture', 'Marine'],
    relatedKCArticles: [
      'testing-and-validation',
      'contamination-control',
      'fluid-cleanliness',
      'filter-media-science',
    ],
    references: [
      'ISO 4406:2021 — Hydraulic fluid power — Contamination level coding',
      'ISO 16889:2022 — Multi-pass method for evaluating filter element performance',
      'ISO 5011:2020 — Inlet air cleaning equipment',
      'ISO 11171:2016 — Calibration of automatic particle counters',
      'NFPA T2.14:2005 — Fluid cleanliness guidelines for hydraulic equipment',
    ],
  },
];

export function getERLSection(slug: string): ERLSection | undefined {
  return ERL_SECTIONS.find((s) => s.slug === slug);
}

export function getERLSectionsByRelatedTechnology(tech: string): ERLSection[] {
  return ERL_SECTIONS.filter((s) => s.relatedTechnologies.includes(tech));
}

export function getERLSectionsByIndustry(industry: string): ERLSection[] {
  return ERL_SECTIONS.filter((s) => s.relatedIndustries.includes(industry));
}
