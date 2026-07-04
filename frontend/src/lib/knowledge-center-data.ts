// ELIMFILTERS Knowledge Center — Content Data
// All engineering articles, standards, systems, industries content

export interface KCArticle {
  slug: string;
  title: string;
  subtitle: string;
  metaDescription: string;
  category: string;
  readTime: string;
  intro: string;
  sections: {
    heading: string;
    body: string;
    callout?: { label: string; value: string }[];
  }[];
  keyMetrics: { label: string; value: string }[];
  relatedStandards: string[];
  relatedTechnologies: string[];
  relatedSystems: string[];
  keywords: string[];
}

export interface KCStandard {
  slug: string;
  code: string;
  title: string;
  metaDescription: string;
  scope: string;
  year: string;
  sections: { heading: string; body: string }[];
  keyParams: { label: string; value: string }[];
  relatedTopics: string[];
  relatedTechnologies: string[];
}

// ─── ENGINEERING ARTICLES ────────────────────────────────────────────────────

export const ENGINEERING_ARTICLES: KCArticle[] = [
  {
    slug: 'airflow-engineering',
    title: 'Airflow Engineering',
    subtitle: 'Pressure Drop, Restriction, and Volumetric Efficiency',
    metaDescription: 'Engineering principles of airflow through filtration systems: pressure drop measurement, restriction thresholds, face velocity, and volumetric efficiency impact on engine performance.',
    category: 'Engineering',
    readTime: '8 min',
    intro: 'Airflow engineering defines how air moves through filtration systems and how restriction affects engine performance. Pressure drop across a filter element is the primary measurable output of airflow engineering — it determines service intervals, system efficiency, and protection margin.',
    sections: [
      {
        heading: 'Pressure Drop Fundamentals',
        body: 'Pressure drop (ΔP) across a filter element is expressed in millibar (mbar) or inches of water column (inH₂O). Initial restriction — the pressure drop through a clean element at rated airflow — determines the baseline performance. As the element loads with contaminant, restriction increases until a service threshold is reached. Clean element restriction typically ranges from 6 to 25 mbar depending on element geometry, face velocity, and media type. Service limit is typically 25 mbar for naturally aspirated engines and up to 62.5 mbar for turbocharged applications. Exceeding service limits causes volumetric efficiency losses and, in turbocharged engines, compressor surge risk.',
        callout: [
          { label: 'Clean restriction', value: '6–25 mbar' },
          { label: 'NA engine service limit', value: '25 mbar' },
          { label: 'Turbo engine service limit', value: '37.5–62.5 mbar' },
        ],
      },
      {
        heading: 'Face Velocity and Media Loading',
        body: 'Face velocity — airflow rate per unit of filter face area (m/s) — determines the rate of pressure drop increase as the element loads. Higher face velocity increases separation efficiency but accelerates loading. Industrial air filter design targets face velocities between 0.05 and 0.15 m/s to balance restriction, dirt capacity, and service interval. MACROCORE™ synthetic media achieves higher dirt capacity at equivalent face velocities versus cellulose media, extending service intervals without compromising restriction thresholds.',
      },
      {
        heading: 'Volumetric Efficiency Impact',
        body: 'Each 25 mbar increase in intake restriction above the design point reduces engine power output by approximately 1–3% in naturally aspirated engines. In turbocharged engines, increased intake restriction forces the compressor to operate at a higher pressure ratio, reducing efficiency and increasing charge temperature. For mining and construction equipment operating 12–18 hours per day, restriction-induced power losses directly increase fuel consumption and accelerate thermal wear in turbocharger bearings.',
      },
      {
        heading: 'Service Indicators',
        body: 'Restriction indicators monitor ΔP in real time and signal service when the threshold is reached. Mechanical indicators (piston-type) provide a visual flag independent of electrical systems. Electronic sensors connected to ECU allow data logging and predictive service scheduling. Condition-based servicing — replacing elements when the restriction threshold is reached rather than on a fixed mileage interval — can extend service intervals by 30–200% in low-dust environments while maintaining consistent protection margin.',
      },
    ],
    keyMetrics: [
      { label: 'Test Standard', value: 'ISO 5011' },
      { label: 'Face velocity target', value: '0.05–0.15 m/s' },
      { label: 'Power loss per 25 mbar', value: '1–3%' },
      { label: 'Service interval extension', value: 'Up to 200%' },
    ],
    relatedStandards: ['ISO 5011', 'ISO 29463'],
    relatedTechnologies: ['MACROCORE™'],
    relatedSystems: ['Air Intake Protection'],
    keywords: ['airflow', 'pressure drop', 'restriction', 'volumetric efficiency', 'face velocity'],
  },
  {
    slug: 'seal-integrity',
    title: 'Seal Integrity',
    subtitle: 'Gasket Engineering, Bypass Prevention, and Leak Path Control',
    metaDescription: 'Engineering analysis of filter seal integrity: gasket materials, installation torque, bypass valve design, and how seal failure allows unfiltered fluid to bypass protective media.',
    category: 'Engineering',
    readTime: '7 min',
    intro: 'A filter with compromised seal integrity provides zero protection regardless of media quality. Seal engineering governs the boundary between filtered and unfiltered fluid — the gasket, end cap bonding, bypass valve, and anti-drain valve collectively define the system\'s contamination boundary.',
    sections: [
      {
        heading: 'Gasket Materials and Sealing Mechanisms',
        body: 'Nitrile (NBR) rubber compounds are the standard for lube oil and fuel filter applications, rated to 150°C continuous service. High-temperature synthetic elastomers (FKM/Viton) extend thermal capability to 200°C for turbocharger-adjacent applications. Silicone compounds provide excellent temperature range (−60°C to 200°C) but limited resistance to petroleum-based fluids. Gasket cross-sectional geometry — circular, D-ring, or flat face — determines sealing load distribution. Circular cross-sections provide consistent radial load; flat-face designs require controlled compression to avoid extrusion.',
        callout: [
          { label: 'NBR rating', value: '−40°C to 150°C' },
          { label: 'FKM rating', value: '−20°C to 200°C' },
          { label: 'Install torque typical', value: '20–30 Nm' },
        ],
      },
      {
        heading: 'Installation Torque and Compression',
        body: 'Insufficient installation torque creates a leak path between the gasket and mounting face. Over-torquing extrudes the gasket beyond its compression limit, reducing contact area and accelerating creep relaxation. Spin-on filter installation specifications typically require hand-tight plus ¾ turn for solid end-cap designs, or 20–30 Nm using a torque wrench for flanged mounting systems. ELIMFILTERS end-cap geometry is designed to provide a positive stop to prevent over-compression while maintaining minimum sealing load across the full temperature cycle.',
      },
      {
        heading: 'Bypass Valve Engineering',
        body: 'Bypass valves protect the engine from oil starvation during cold starts or when the filter element is severely restricted. A typical bypass valve opens at 0.8–1.0 bar differential pressure. At bypass, unfiltered oil enters the engine lubrication system. Bypass valve spring rate, poppet geometry, and seat material determine the cracking pressure and flow capacity. Inferior bypass valve designs may allow the valve to partially open at elevated temperature due to spring relaxation — allowing unfiltered flow without signaling a restriction fault.',
      },
      {
        heading: 'Anti-Drain Back Valves',
        body: 'Anti-drain back (ADB) valves prevent the oil column from draining to the sump when the engine is stopped. Without ADB, 3–8 seconds of dry starting occurs before oil reaches the filter outlet, during which time bearing and valve train surfaces operate without lubrication. ADB valve leak-by rate is measured in mL/minute under static head pressure — specification is typically less than 1 mL/min over 60 minutes.',
      },
    ],
    keyMetrics: [
      { label: 'Standard bypass open ΔP', value: '0.8–1.0 bar' },
      { label: 'ADB leak spec', value: '<1 mL/min / 60 min' },
      { label: 'Gasket temperature range (NBR)', value: '−40 to 150°C' },
    ],
    relatedStandards: ['ISO 16889'],
    relatedTechnologies: ['SYNTRAX™', 'DRYCORE™'],
    relatedSystems: ['Lubrication Protection', 'Hydraulic Protection'],
    keywords: ['seal integrity', 'gasket', 'bypass valve', 'anti-drain back', 'filter seal'],
  },
  {
    slug: 'contamination-control',
    title: 'Contamination Control',
    subtitle: 'Particle Management, ISO Cleanliness Codes, and System Design',
    metaDescription: 'Engineering framework for contamination control: particle counting methodology, ISO 4406 cleanliness codes, ingress point identification, and system-level contamination budgets.',
    category: 'Engineering',
    readTime: '10 min',
    intro: 'Contamination control is the systematic management of particle, water, and chemical ingress into mechanical systems. It requires identifying all contamination sources, quantifying concentration and particle size distribution, selecting filtration parameters that achieve target cleanliness levels, and verifying cleanliness through oil analysis or particle counting.',
    sections: [
      {
        heading: 'Contamination Sources',
        body: 'Built-in contamination enters during manufacturing (machining chips, casting sand, assembly residues). Ingress contamination enters during operation (airborne dust through air intake, water through breathers, particles through worn seals). Generated contamination is produced by wear, oxidation, and thermal degradation within the system. A contamination control strategy must address all three sources: flush to remove built-in contamination, filtration to capture ingress contamination, and condition monitoring to detect generated contamination.',
      },
      {
        heading: 'Particle Size Distribution',
        body: 'Particles in industrial fluids follow a distribution weighted toward smaller sizes — for every 5 µm particle, there are approximately 10× more 2 µm particles. Most wear damage is caused by particles in the 5–15 µm range — the clearance size range of bearings, servo valves, and gear teeth. Particles larger than 40 µm are visible to the naked eye but cause less proportional damage than critical-size particles because they are rapidly captured by primary filters. ISO 4406 counts particles at ≥4 µm, ≥6 µm, and ≥14 µm — specifically targeting the critical wear range.',
        callout: [
          { label: 'Critical particle range', value: '5–15 µm' },
          { label: 'Bearing clearance typical', value: '5–25 µm' },
          { label: 'ISO count sizes', value: '≥4, ≥6, ≥14 µm' },
        ],
      },
      {
        heading: 'ISO 4406 Cleanliness Codes',
        body: 'ISO 4406 assigns a three-number cleanliness code (e.g., 17/15/12) where each number represents a range of particle counts per mL at the three measurement sizes. A one-unit change in code number doubles the particle count. A system at ISO 17/15/12 contains approximately twice the particles of a system at ISO 16/14/11. Target cleanliness codes are determined by the most sensitive component in the system — proportional valves typically require ISO 16/14/11 or better, while gear pumps may tolerate ISO 19/17/14.',
      },
      {
        heading: 'Filtration Ratio and Beta Values',
        body: 'Filtration efficiency is expressed as Beta ratio (β): the ratio of particles upstream to particles downstream at a given size. β₁₀ = 200 means for every 200 particles >10 µm entering the filter, 1 exits — 99.5% efficiency. ISO 16889 multi-pass testing is the standard method for Beta ratio measurement. A filter rated βx(c) uses the ISO 16889 calibrated particle counting method, providing comparable data across manufacturers.',
      },
    ],
    keyMetrics: [
      { label: 'Critical wear particle range', value: '5–15 µm' },
      { label: 'β₁₀ = 200 efficiency', value: '99.5%' },
      { label: 'Bearing life at ISO 16/14/11 vs 19/17/14', value: '3–5× longer' },
    ],
    relatedStandards: ['ISO 4406', 'ISO 16889'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™'],
    relatedSystems: ['Hydraulic Protection', 'Lubrication Protection'],
    keywords: ['contamination control', 'ISO 4406', 'particle size', 'cleanliness code', 'Beta ratio'],
  },
  {
    slug: 'filter-media-science',
    title: 'Filter Media Science',
    subtitle: 'Cellulose, Synthetic, and Glass Fiber Media — Performance Characteristics',
    metaDescription: 'Technical analysis of filter media types: cellulose vs synthetic vs glass fiber, Beta ratio efficiency, dirt holding capacity, and thermal stability for industrial filtration applications.',
    category: 'Engineering',
    readTime: '9 min',
    intro: 'Filter media is the core component determining filtration efficiency, dirt holding capacity, and service life. Media selection involves balancing particle capture efficiency (Beta ratio), flow capacity (clean differential pressure), dirt holding capacity (grams of contaminant before restriction threshold), and thermal/chemical compatibility with the process fluid.',
    sections: [
      {
        heading: 'Cellulose Media',
        body: 'Cellulose media — composed of plant-derived fibers — is the historical standard for spin-on lube and fuel filters. Fiber diameter ranges from 10 to 40 µm, producing a stochastic pore structure with high variation in effective pore size. The result is moderate Beta values (β₁₀ ≈ 2–10) and moderate dirt holding capacity. Cellulose media absorbs 6–8% of its own weight in water, making it susceptible to media degradation and bypass in high-humidity environments. Service temperature limit is typically 120°C. Cellulose provides adequate protection for passenger vehicle applications with frequent drain intervals.',
      },
      {
        heading: 'Synthetic Microfiber Media',
        body: 'Synthetic microfiber media — polyester or polypropylene — produces consistent fiber diameter (1–10 µm) through meltblown or electrospun processes. Controlled fiber diameter yields higher Beta values (β₁₀ ≈ 50–200) and superior dirt holding capacity versus cellulose. Synthetic media does not absorb water, maintaining performance in contaminated environments. Temperature rating extends to 150°C continuous. SYNTRAX™ and NANOFORCE™ use multi-layer synthetic media configurations to combine high efficiency with extended capacity.',
        callout: [
          { label: 'Cellulose β₁₀', value: '2–10' },
          { label: 'Synthetic β₁₀', value: '50–200' },
          { label: 'Glass fiber β₃', value: '50–1000' },
        ],
      },
      {
        heading: 'Glass Fiber Media',
        body: 'Glass fiber media achieves the highest efficiency ratings through sub-micron glass fiber diameters (0.5–5 µm). Beta values above β₃ = 200 are achievable for hydraulic and precision fuel applications. Glass fiber is inherently hydrophobic when treated and does not swell or degrade in water-contaminated fluids. The limitation is brittleness — glass fibers can fracture under pulsating flow, releasing particles downstream. Pleating geometry and supporting layers mitigate this risk in engineered filter elements.',
      },
      {
        heading: 'Pleating and Construction Geometry',
        body: 'Media area determines dirt holding capacity and flow capacity independently of efficiency. Pleat count, pleat height, and pleat density define total media area within a given element envelope. Deep pleating (tall pleat height) maximizes media area but requires structural support to prevent pleat collapse under differential pressure. ELIMFILTERS construction uses thermally bonded end caps and wire-wound outer support to maintain pleat geometry across the full service life.',
      },
    ],
    keyMetrics: [
      { label: 'Cellulose fiber diameter', value: '10–40 µm' },
      { label: 'Synthetic fiber diameter', value: '1–10 µm' },
      { label: 'Glass fiber diameter', value: '0.5–5 µm' },
      { label: 'Synthetic capacity advantage', value: '2–4× cellulose' },
    ],
    relatedStandards: ['ISO 16889', 'ISO 5011', 'ISO 29463'],
    relatedTechnologies: ['SYNTRAX™', 'NANOFORCE™', 'MACROCORE™'],
    relatedSystems: ['Air Intake Protection', 'Lubrication Protection', 'Hydraulic Protection'],
    keywords: ['filter media', 'cellulose', 'synthetic media', 'glass fiber', 'Beta ratio', 'dirt capacity'],
  },
  {
    slug: 'fluid-cleanliness',
    title: 'Fluid Cleanliness',
    subtitle: 'ISO 4406 Target Codes, Particle Counting, and Oil Analysis',
    metaDescription: 'Industrial fluid cleanliness management: ISO 4406 codes, particle counting methodology, oil sampling best practices, and cleanliness targets for hydraulic, lube, and fuel systems.',
    category: 'Engineering',
    readTime: '8 min',
    intro: 'Fluid cleanliness — measured by ISO 4406 cleanliness codes — is the quantified state of particle contamination in industrial fluids. Managing fluid cleanliness to defined targets extends component life, reduces maintenance frequency, and provides early warning of system degradation before catastrophic failure occurs.',
    sections: [
      {
        heading: 'Cleanliness Target Selection',
        body: 'Target cleanliness codes are set by the most sensitive component in the fluid circuit. Proportional and servo hydraulic valves (clearances 1–3 µm) require ISO 16/14/11 or tighter. Gear pumps and motors (clearances 15–30 µm) can tolerate ISO 19/17/14. Engine bearings (clearances 5–25 µm) target ISO 16/14/11. The target establishes the filtration specification — Beta ratio and absolute rating — required to achieve and maintain the cleanliness code under normal ingress conditions.',
        callout: [
          { label: 'Servo valve target', value: 'ISO 14/12/9' },
          { label: 'Hydraulic motor target', value: 'ISO 17/15/12' },
          { label: 'Engine lube target', value: 'ISO 16/14/11' },
          { label: 'Gear pump target', value: 'ISO 19/17/14' },
        ],
      },
      {
        heading: 'Particle Counting Methods',
        body: 'Automatic particle counters (APC) use light obscuration to count and size particles in fluid samples. ISO 11171 calibrates APCs using NIST-traceable reference particles for consistency across instruments. Field sampling bottles must be pre-cleaned to ISO 14/12/11 or better to avoid contaminating the sample with packaging particles. Wrong sampling technique — drawing from stagnant lines or using contaminated bottles — is the most common source of erroneous particle count data.',
      },
      {
        heading: 'Oil Analysis Programs',
        body: 'Oil analysis combines particle counting, elemental spectroscopy (ICP), and physical property tests (viscosity, TAN, TBN) to characterize both contamination and oil degradation. Spectroscopy detects wear metals (iron, chromium, aluminum, copper) generated by internal component wear — each element pattern maps to a specific component and failure mode. Consistent sampling intervals and consistent sampling points are required for trend analysis to have diagnostic value.',
      },
      {
        heading: 'Cleanliness Verification and Documentation',
        body: 'New hydraulic systems should be flushed to cleanliness specification before commissioning — residual contamination from assembly (metal chips, pipe scale, elastomer particles) typically loads at ISO 22/20/17 or worse. Flushing to ISO 17/15/12 before first operation eliminates built-in contamination and establishes a clean baseline. Document particle counts at commissioning and at regular service intervals to build a contamination history for each asset.',
      },
    ],
    keyMetrics: [
      { label: 'New oil cleanliness typical', value: 'ISO 18/16/13' },
      { label: 'Servo valve target', value: 'ISO 14/12/9' },
      { label: 'Flush target before commissioning', value: 'ISO 17/15/12' },
    ],
    relatedStandards: ['ISO 4406', 'ISO 16889', 'ISO 11171'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™'],
    relatedSystems: ['Hydraulic Protection', 'Lubrication Protection'],
    keywords: ['fluid cleanliness', 'ISO 4406', 'particle counting', 'oil analysis', 'cleanliness code'],
  },
  {
    slug: 'air-restriction',
    title: 'Air Restriction',
    subtitle: 'Service Indicators, Restriction Thresholds, and Engine Impact',
    metaDescription: 'Air filter restriction measurement, service indicator engineering, restriction thresholds for naturally aspirated and turbocharged engines, and the impact on fuel consumption and engine life.',
    category: 'Engineering',
    readTime: '6 min',
    intro: 'Air restriction is the measurable pressure differential created as air flows through the filter element. Managing restriction within specification thresholds ensures engine volumetric efficiency, turbocharger performance, and filtration effectiveness throughout the service interval.',
    sections: [
      {
        heading: 'Restriction Measurement Units',
        body: 'Restriction is expressed in millibar (mbar), pascals (Pa), or inches of water column (inH₂O). Conversion: 1 inH₂O = 2.49 mbar = 249 Pa. Most engine manufacturers specify restriction limits in inH₂O (North American market) or mbar (European/international market). Service indicators are calibrated in the same units as the OEM specification.',
        callout: [
          { label: '1 inH₂O =', value: '2.49 mbar = 249 Pa' },
          { label: 'NA engine limit', value: '10 inH₂O / 25 mbar' },
          { label: 'Turbo engine limit', value: '25 inH₂O / 62.5 mbar' },
        ],
      },
      {
        heading: 'Service Indicator Types',
        body: 'Mechanical restriction indicators use a spring-loaded piston behind a sight glass window. As restriction increases, the piston migrates, changing the visible indicator color (typically red/yellow). The indicator latches at maximum restriction and must be manually reset after element change. Electronic pressure differential sensors connected to the ECU provide continuous real-time restriction logging, enabling predictive servicing based on restriction trend rate rather than threshold alone.',
      },
      {
        heading: 'Turbocharged Engine Considerations',
        body: 'In turbocharged engines, intake restriction affects compressor map operating point. Higher restriction shifts operation toward the surge region, reducing compressor efficiency and increasing discharge temperature. Each 1 mbar increase in compressor inlet depression (restriction) increases turbocharger speed by approximately 0.5% at constant boost pressure, accelerating bearing wear. The inter-cooler effectiveness also degrades as charge temperature rises with compressor efficiency loss.',
      },
    ],
    keyMetrics: [
      { label: 'NA engine service limit', value: '25 mbar / 10 inH₂O' },
      { label: 'Turbo service limit', value: '62.5 mbar / 25 inH₂O' },
      { label: 'Fuel penalty per 25 mbar excess', value: '1–3%' },
    ],
    relatedStandards: ['ISO 5011'],
    relatedTechnologies: ['MACROCORE™'],
    relatedSystems: ['Air Intake Protection'],
    keywords: ['air restriction', 'pressure drop', 'service indicator', 'intake restriction', 'turbocharged engine'],
  },
  {
    slug: 'dust-holding-capacity',
    title: 'Dust Holding Capacity',
    subtitle: 'Filter Loading, Dirt Capacity Testing, and Service Life Prediction',
    metaDescription: 'Engineering analysis of filter dust holding capacity (DHC): ISO 5011 test dust, loading curves, capacity measurement in grams, and how capacity determines service interval in contaminated environments.',
    category: 'Engineering',
    readTime: '7 min',
    intro: 'Dust holding capacity (DHC) — measured in grams of standardized test dust retained before reaching terminal pressure drop — directly determines service life in contaminated environments. Higher capacity extends service intervals, reduces filter change frequency, and lowers total cost of filtration.',
    sections: [
      {
        heading: 'DHC Measurement Methodology',
        body: 'ISO 5011 defines the standard test method for air filter performance including DHC. Test dust (ISO A2 fine dust or ISO coarse dust) is fed into the upstream side of the filter at a controlled rate and airflow. Restriction is measured continuously. DHC is recorded as total grams injected when terminal restriction is reached. Test conditions must match the application airflow — DHC is not a fixed property independent of face velocity.',
      },
      {
        heading: 'Loading Curves and Service Prediction',
        body: 'Real-world loading rate depends on ambient dust concentration, equipment operating hours, and airflow per hour. A mining haul truck operating in a 1 mg/m³ dust environment at 1,000 m³/h airflow ingests 1 gram of dust per hour. An element with 500g DHC has a theoretical capacity of 500 hours under these conditions. However, restriction increases non-linearly with loading — the final 20% of capacity causes 50% of total restriction increase. Service intervals should be set at 80–85% of theoretical capacity.',
        callout: [
          { label: 'Mining dust concentration', value: '0.1–5 mg/m³' },
          { label: 'Service point', value: '80–85% of DHC' },
          { label: 'MACROCORE™ DHC advantage', value: 'Up to 2× cellulose' },
        ],
      },
      {
        heading: 'Pre-Cleaning Systems',
        body: 'Pre-cleaners — cyclone separators, pre-filter tubes, or rain-cap deflectors — remove coarse particles before they reach the primary filter element. A pre-cleaner separating 80% of incoming dust at ≥10 µm effectively multiplies primary element service life by 5×. Multi-stage filtration systems (pre-cleaner + primary + safety element) are standard on mining equipment where dust concentrations exceed 0.5 mg/m³.',
      },
    ],
    keyMetrics: [
      { label: 'Test standard', value: 'ISO 5011' },
      { label: 'Service threshold', value: '80–85% DHC' },
      { label: 'Pre-cleaner efficiency', value: '70–95% at ≥10 µm' },
    ],
    relatedStandards: ['ISO 5011'],
    relatedTechnologies: ['MACROCORE™'],
    relatedSystems: ['Air Intake Protection'],
    keywords: ['dust holding capacity', 'DHC', 'filter loading', 'service life', 'ISO 5011'],
  },
  {
    slug: 'service-intervals',
    title: 'Service Intervals',
    subtitle: 'Condition-Based vs Fixed Intervals, Interval Optimization, and TCO Impact',
    metaDescription: 'Engineering methodology for filter service interval determination: condition-based monitoring, OEM recommendations, environment adjustment factors, and impact on total cost of ownership.',
    category: 'Engineering',
    readTime: '7 min',
    intro: 'Service interval strategy defines when filters are replaced — either on fixed time/mileage schedules or based on actual operating conditions. Condition-based servicing (replacing when restriction threshold or oil analysis limits are reached) typically extends intervals by 30–200% in light-duty environments while maintaining equivalent protection levels.',
    sections: [
      {
        heading: 'Fixed Interval Limitations',
        body: 'OEM fixed intervals (500 hours, 10,000 km) are designed for worst-case operating conditions — maximum dust, maximum thermal loading, minimum maintenance quality. Equipment operating in moderate environments replaces elements before they reach functional limits, wasting filtration capacity. Equipment operating in severe environments may reach limits before the scheduled interval, providing a gap in protection.',
      },
      {
        heading: 'Condition-Based Service Criteria',
        body: 'Air filters: service when restriction indicator triggers (at rated restriction threshold). Lube filters: service when oil analysis indicates degradation (TAN increase, viscosity change, wear metal trend). Hydraulic filters: service when inline restriction indicator reaches set point or particle count exceeds target cleanliness code. Fuel filters: service on fixed interval in high-water environments; condition-based (differential pressure indicator) in dry environments.',
        callout: [
          { label: 'Air filter trigger', value: 'Restriction indicator (mbar)' },
          { label: 'Lube filter trigger', value: 'Oil analysis TAN / viscosity' },
          { label: 'Hydraulic trigger', value: 'ΔP indicator / particle count' },
        ],
      },
      {
        heading: 'Environment Adjustment Factors',
        body: 'Environment multipliers adjust OEM base intervals for actual operating conditions. Dust factor: 0.25–1.0 (severe mining = 0.25×, clean indoor = 1.0×). Temperature factor: 0.5–1.0 (continuous high temperature = 0.5×). Idle time factor: 0.5–1.5 (high idle fraction reduces thermal cycling stress, allowing longer intervals for lube). Application of correct adjustment factors can identify both over-servicing (cost waste) and under-servicing (protection gap) within existing fleets.',
      },
    ],
    keyMetrics: [
      { label: 'CI savings vs fixed intervals', value: '15–40%' },
      { label: 'Severe dust adjustment', value: '0.25× base interval' },
      { label: 'High temperature adjustment', value: '0.5× base interval' },
    ],
    relatedStandards: ['ISO 4406'],
    relatedTechnologies: ['DURATECH™', 'MACROCORE™'],
    relatedSystems: ['Air Intake Protection', 'Lubrication Protection'],
    keywords: ['service intervals', 'condition-based maintenance', 'interval optimization', 'filter replacement'],
  },
  {
    slug: 'total-cost-of-ownership',
    title: 'Total Cost of Ownership',
    subtitle: 'Filter Economics, Downtime Cost, and System-Level ROI',
    metaDescription: 'Total cost of ownership analysis for industrial filtration: filter acquisition cost vs downtime prevention, component life extension economics, and system vs commodity filtration ROI.',
    category: 'Engineering',
    readTime: '9 min',
    intro: 'Total cost of ownership (TCO) for industrial filtration encompasses filter acquisition, installation labor, oil and fluid cost, component life, planned maintenance, and unplanned downtime. Filter acquisition cost represents 1–5% of total filtration cost for heavy-duty industrial assets. The remaining 95–99% is determined by the filtration system\'s effectiveness at preventing wear and extending equipment life.',
    sections: [
      {
        heading: 'The 1-5% Filter Cost Rule',
        body: 'For a mining haul truck with a 10-year operational life, the total cost of filters (air, oil, fuel, hydraulic, cabin) represents approximately 1–3% of total maintenance expenditure. The remaining 97–99% is spent on component replacement, oil, labor, and downtime. Optimizing the 1–3% at the expense of protection quality risks exponential cost increases in the 97–99% category. A hydraulic pump replacement costs 50–200× the annual hydraulic filter budget.',
        callout: [
          { label: 'Filter cost as % of maintenance', value: '1–5%' },
          { label: 'Hydraulic pump vs filter ratio', value: '50–200×' },
          { label: 'Engine rebuild vs lube filter ratio', value: '500–2000×' },
        ],
      },
      {
        heading: 'Downtime Cost Calculation',
        body: 'Downtime cost = (lost production value + repair labor + parts + mobilization) per hour × hours of downtime. A mining shovel producing 500 tonnes/hour at USD $40/tonne generates USD $20,000/hour of production value. An unplanned hydraulic failure causing 48 hours downtime represents USD $960,000 in lost production, plus USD $50,000–200,000 in repair costs. The total event cost of USD $1,000,000–1,200,000 is 200–400× the annual hydraulic filter budget for that machine.',
      },
      {
        heading: 'Component Life Extension Economics',
        body: 'Achieving ISO 16/14/11 cleanliness in hydraulic systems extends hydraulic component life by 3–5× versus ISO 20/18/15 (commodity filtration). For a fleet of 50 haul trucks each requiring one hydraulic motor replacement per year at USD $12,000 per motor, improving cleanliness to ISO 16/14/11 extends intervals to 3–5 years, reducing annual component cost by USD $360,000–480,000 per fleet. The incremental filtration cost to achieve ISO 16/14/11 is typically USD $2,000–5,000 per truck per year.',
      },
    ],
    keyMetrics: [
      { label: 'Filter cost / total maintenance', value: '1–5%' },
      { label: 'Bearing life improvement ISO 16/14/11', value: '3–5×' },
      { label: 'Typical downtime ROI ratio', value: '10–100×' },
    ],
    relatedStandards: ['ISO 4406', 'ISO 16889'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™', 'DURATECH™'],
    relatedSystems: ['Hydraulic Protection', 'Lubrication Protection'],
    keywords: ['total cost of ownership', 'TCO', 'filter economics', 'downtime cost', 'ROI'],
  },
  {
    slug: 'failure-analysis',
    title: 'Failure Analysis',
    subtitle: 'Root Cause Identification, Wear Patterns, and Contamination Diagnosis',
    metaDescription: 'Industrial filtration failure analysis methodology: identifying root causes through wear pattern analysis, particle morphology, oil analysis, and filter element inspection techniques.',
    category: 'Engineering',
    readTime: '8 min',
    intro: 'Failure analysis determines the root cause of mechanical failure to prevent recurrence. For contamination-related failures, the evidence chain includes component wear patterns, oil analysis trends, filter element condition, particle morphology, and system operating history. Correctly identifying the contamination source — not just the failure mode — is the objective.',
    sections: [
      {
        heading: 'Filter Element Inspection',
        body: 'A used filter element is a diagnostic record. Cutting open a used lube filter and examining the media under magnification reveals: ferrous particles (magnetic, metallic sheen = iron wear), non-ferrous metallic particles (copper/bronze = bearing wear, aluminum = piston skirt wear), elastomeric material (seal degradation), and carbon agglomerates (oil thermal degradation). The distribution of particle sizes provides information about the severity and duration of the wear event. Large metallic particles (>100 µm) indicate acute wear; fine particles (<25 µm) indicate chronic wear.',
        callout: [
          { label: 'Iron particles', value: 'Steel components wear' },
          { label: 'Copper/bronze particles', value: 'Bearing wear' },
          { label: 'Aluminum particles', value: 'Piston/housing wear' },
          { label: 'Carbon agglomerates', value: 'Oil degradation' },
        ],
      },
      {
        heading: 'Particle Morphology Classification',
        body: 'Abrasive wear particles are angular, irregular, and hard (silica ingestion produces quartz particles distinguishable by energy-dispersive spectroscopy). Fatigue wear particles are flat, smooth, and uniformly sized — produced by surface fatigue of bearing raceways. Adhesive wear particles (sliding wear) are featureless plates with smooth edges. Cutting wear particles are long, ribbon-like, and indicate hard particle intersection with a soft surface.',
      },
      {
        heading: 'Root Cause Identification Framework',
        body: 'Contamination failure root causes: (1) seal failure allowing ingress above filtration capacity, (2) filter element bypass due to over-service interval, (3) bypass valve failure remaining open, (4) incorrect filter specification, (5) commissioning contamination never flushed. For each failure, identify the contamination pathway, the gap in protection, and the system change required to prevent recurrence.',
      },
    ],
    keyMetrics: [
      { label: 'Silica particles cause', value: 'Air intake breach' },
      { label: 'Copper particles cause', value: 'Bearing wear' },
      { label: 'Carbon agglomerates cause', value: 'Oil degradation / overtemp' },
    ],
    relatedStandards: ['ISO 4406', 'ISO 16889'],
    relatedTechnologies: ['SYNTRAX™', 'NANOFORCE™'],
    relatedSystems: ['Lubrication Protection', 'Hydraulic Protection'],
    keywords: ['failure analysis', 'root cause', 'wear patterns', 'particle morphology', 'contamination diagnosis'],
  },
  {
    slug: 'testing-and-validation',
    title: 'Testing & Validation',
    subtitle: 'ISO Test Methods, Multi-Pass Testing, and Performance Certification',
    metaDescription: 'Industrial filter testing methodology: ISO 16889 multi-pass test, ISO 5011 air filter test, Beta ratio measurement, dirt holding capacity validation, and performance certification standards.',
    category: 'Engineering',
    readTime: '8 min',
    intro: 'Performance claims for industrial filters must be supported by standardized testing conducted under controlled conditions. ISO test methods define the fluid, test dust, flow conditions, measurement intervals, and reporting requirements that enable valid comparison of performance data across manufacturers and product lines.',
    sections: [
      {
        heading: 'ISO 16889 Multi-Pass Test',
        body: 'ISO 16889 is the standard test method for hydraulic and lube filter elements, measuring Beta ratio and dirt holding capacity simultaneously. Test fluid (ISO VG 15 oil) is contaminated with ISO A2 medium test dust at controlled concentration. Particle counts are measured upstream and downstream with calibrated automatic particle counters (ISO 11171). Beta values are calculated at each count size throughout the test until terminal differential pressure is reached. Multi-pass refers to recirculating contaminated fluid through the test circuit — particles that pass through the filter remain in the circuit and contribute to downstream counts.',
      },
      {
        heading: 'ISO 5011 Air Filter Test',
        body: 'ISO 5011 covers initial efficiency, dust holding capacity, and fractional efficiency for air filters. Test dust (ISO A2 fine) is fed at controlled rate. Efficiency is measured at 0.5, 1, 2, 3, 5, 7, 10, 20, 40, and 80 µm using laser particle counters. Restriction is monitored continuously. The test is conducted at one or more airflow rates — performance at rated airflow is the primary specification point. Safety element testing follows primary element test to verify total system performance.',
      },
      {
        heading: 'Beta(c) vs Beta Rating',
        body: 'Beta values carry a suffix indicating the particle counting calibration standard used. β₁₀ uses legacy calibration with AC fine test dust — now deprecated. β₁₀(c) uses ISO 11171 calibrated particle counting — the current standard. β₁₀ and β₁₀(c) are NOT directly comparable. A filter rated β₁₀ = 75 may have a β₁₀(c) = 10 — a significant difference. Always specify β(c) when comparing filter performance data from different manufacturers.',
        callout: [
          { label: 'β₁₀(c) = 75 efficiency', value: '98.7%' },
          { label: 'β₁₀(c) = 200 efficiency', value: '99.5%' },
          { label: 'β₁₀(c) = 1000 efficiency', value: '99.9%' },
        ],
      },
    ],
    keyMetrics: [
      { label: 'ISO 16889 test fluid', value: 'ISO VG 15 oil' },
      { label: 'ISO 5011 test dust', value: 'ISO A2 fine' },
      { label: 'β(c) standard', value: 'ISO 11171 calibrated' },
    ],
    relatedStandards: ['ISO 16889', 'ISO 5011', 'ISO 11171'],
    relatedTechnologies: ['NANOFORCE™', 'MACROCORE™', 'SYNTRAX™'],
    relatedSystems: ['Air Intake Protection', 'Hydraulic Protection'],
    keywords: ['filter testing', 'ISO 16889', 'ISO 5011', 'Beta ratio', 'multi-pass test', 'performance certification'],
  },
  {
    slug: 'oem-engineering',
    title: 'OEM Engineering',
    subtitle: 'OEM Filtration Specifications, Cross-References, and Aftermarket Equivalence',
    metaDescription: 'OEM filtration engineering requirements: how OEM specifications are determined, what parameters define equivalence, and engineering criteria for aftermarket filter validation.',
    category: 'Engineering',
    readTime: '7 min',
    intro: 'OEM filtration specifications define the minimum performance requirements for a given engine or system application. Understanding the engineering basis of OEM specifications enables correct selection of aftermarket equivalents — matching or exceeding the parameters that protect the asset, not merely matching physical dimensions.',
    sections: [
      {
        heading: 'OEM Specification Parameters',
        body: 'OEM filter specifications define: thread size and pitch (M20×1.5, M22×1.5, M26×1.5 typical), housing dimensions (OD, height, gasket diameter), bypass valve opening pressure (0.8–1.5 bar typical), anti-drain back valve flow rate, media efficiency (Beta ratio at specified particle size), and dirt holding capacity. Thread and dimensional match ensures physical installation. Bypass valve and media parameters ensure performance equivalence.',
        callout: [
          { label: 'Common lube threads', value: 'M20×1.5, M22×1.5, M26×1.5' },
          { label: 'Bypass valve range', value: '0.8–1.5 bar' },
          { label: 'Media efficiency match', value: 'β₁₀(c) ≥ OEM spec' },
        ],
      },
      {
        heading: 'Aftermarket Equivalence Criteria',
        body: 'Dimensional equivalence (physical fit) is necessary but insufficient. Performance equivalence requires matching or exceeding the OEM element\'s Beta ratio, dirt holding capacity, and bypass valve specification. An aftermarket filter with lower Beta ratio than the OEM specification fails to maintain the cleanliness target the OEM system was designed around, even if it physically installs correctly. ELIMFILTERS engineering validates media performance against OEM Beta specifications before publishing cross-references.',
      },
      {
        heading: 'Warranty Considerations',
        body: 'OEM warranty requirements specify the use of approved filters during the warranty period. In many markets, regulations allow the use of equivalent aftermarket filters without voiding warranty, provided the aftermarket filter meets or exceeds OEM performance specifications. The burden of proof for equivalence rests with the aftermarket supplier. Performance documentation (ISO 16889 test reports, β(c) data sheets) is the standard evidence format.',
      },
    ],
    keyMetrics: [
      { label: 'Equivalence basis', value: 'β(c) + bypass valve + dimensions' },
      { label: 'Thread standard', value: 'ISO 965-1 metric fine' },
    ],
    relatedStandards: ['ISO 16889', 'ISO 5011'],
    relatedTechnologies: ['SYNTRAX™', 'MACROCORE™'],
    relatedSystems: ['Lubrication Protection', 'Air Intake Protection'],
    keywords: ['OEM engineering', 'filter specification', 'aftermarket equivalence', 'cross-reference', 'warranty'],
  },
  {
    slug: 'asset-protection-engineering',
    title: 'Asset Protection Engineering',
    subtitle: 'System Design, Contamination Budgets, and Protection Architecture',
    metaDescription: 'Engineering framework for industrial asset protection through contamination control: system design methodology, contamination budget calculation, protection architecture, and performance verification.',
    category: 'Engineering',
    readTime: '10 min',
    intro: 'Asset protection engineering applies contamination control principles systematically across all fluid and air circuits within an industrial asset. The objective is not to select individual filters but to design a contamination control system that maintains all circuits within cleanliness specifications throughout the asset\'s operational life.',
    sections: [
      {
        heading: 'Protection System Architecture',
        body: 'Asset protection architecture identifies every circuit requiring contamination control: air intake (primary + safety elements + pre-cleaner), lube system (full-flow + bypass filter), fuel system (primary + secondary + water separator), hydraulic system (pressure line + return line + offline circuit), cooling system (SCA dosing + coolant filter), and cab air (HVAC filter + activated carbon). Each circuit has a cleanliness target, contamination ingress rate, and filter specification derived from the target and ingress rate.',
      },
      {
        heading: 'Contamination Budget Methodology',
        body: 'A contamination budget calculates the balance between contamination ingress rate (particles per hour entering the system) and filtration removal rate (particles per hour captured by filters). At steady state, ingress rate = filtration rate and system cleanliness is constant. If ingress rate exceeds filtration capacity, cleanliness degrades. The contamination budget identifies the circuit with the highest ingress-to-filtration ratio and prioritizes filtration upgrades accordingly.',
        callout: [
          { label: 'Budget balance', value: 'Ingress rate = Removal rate' },
          { label: 'Budget deficit result', value: 'Cleanliness degradation' },
          { label: 'Priority circuit', value: 'Highest ingress/filtration ratio' },
        ],
      },
      {
        heading: 'Multi-Circuit Integration',
        body: 'Failure to protect one circuit undermines the entire asset. Air intake breach introduces silica into the lube system; fuel water contamination affects hydraulic fluid through cross-contamination; coolant seal failure introduces water into lube oil. An integrated contamination control program covers all circuits simultaneously — monitoring, sampling, and optimizing each circuit as a component of a single protection system.',
      },
    ],
    keyMetrics: [
      { label: 'Protection circuits per heavy asset', value: '5–7' },
      { label: 'System approach life extension', value: '30–50%' },
      { label: 'Integrated program vs commodity', value: '3–5× lower downtime' },
    ],
    relatedStandards: ['ISO 4406', 'ISO 16889', 'ISO 5011'],
    relatedTechnologies: ['MACROCORE™', 'SYNTRAX™', 'NANOFORCE™', 'SYNTEPORE™'],
    relatedSystems: ['Air Intake Protection', 'Lubrication Protection', 'Hydraulic Protection', 'Fuel Cleanliness Protection'],
    keywords: ['asset protection', 'contamination budget', 'protection architecture', 'system design', 'contamination control'],
  },
  {
    slug: 'materials-engineering',
    title: 'Materials Engineering',
    subtitle: 'Filter Construction Materials, Chemical Compatibility, and Thermal Limits',
    metaDescription: 'Industrial filter materials engineering: metal housing alloys, elastomer chemical compatibility, end-cap bonding methods, and thermal rating determination for industrial filtration applications.',
    category: 'Engineering',
    readTime: '7 min',
    intro: 'Material selection for filter construction determines thermal capability, chemical resistance, structural integrity, and service life. Each component — housing, media, end caps, gaskets, anti-drain back valve, bypass valve — must be compatible with the process fluid and operating temperature range.',
    sections: [
      {
        heading: 'Housing Materials',
        body: 'Spin-on filter housings use cold-drawn steel (thickness 0.8–1.2 mm, burst rated to 2–4× working pressure). Heavy-duty headers for hydraulic elements use ductile cast iron or carbon steel with O-ring face seal connections (ORFS). Aluminum housings are used in light-duty applications where weight is prioritized over pressure rating. All housings require corrosion protection — zinc phosphating, e-coat, or polymer coating — for external durability.',
      },
      {
        heading: 'Elastomer Chemical Compatibility',
        body: 'NBR (nitrile) serves petroleum-based fuels and oils to 120°C. FKM (Viton) handles synthetic lubricants, bio-fuels, and high-temperature petroleum to 200°C. EPDM handles water-glycol coolants but degrades in petroleum fluids. Silicone offers wide temperature range (−60 to 200°C) but low resistance to petroleum hydrocarbons. Mismatched elastomers swell, degrade, or harden — losing sealing capability within the first service interval.',
        callout: [
          { label: 'NBR fluid compatibility', value: 'Petroleum oil, diesel fuel' },
          { label: 'FKM fluid compatibility', value: 'Synthetic oil, biodiesel, HF fluids' },
          { label: 'EPDM fluid compatibility', value: 'Coolant, water-glycol, NOT oil' },
        ],
      },
      {
        heading: 'End Cap Bonding',
        body: 'End caps connect the filter media pack to the housing closure. Plastisol bonding (PVC-based adhesive) is the standard for cellulose media applications to 120°C. Epoxy bonding extends capability to 150°C and provides chemical resistance to synthetic lubricants. Thermally bonded end caps (media and end cap fused by heat without adhesive) are used for high-purity applications where adhesive contamination must be eliminated.',
      },
    ],
    keyMetrics: [
      { label: 'Steel housing burst rating', value: '2–4× working pressure' },
      { label: 'NBR temperature limit', value: '120°C continuous' },
      { label: 'FKM temperature limit', value: '200°C continuous' },
    ],
    relatedStandards: ['ISO 16889'],
    relatedTechnologies: ['SYNTRAX™', 'DURATECH™'],
    relatedSystems: ['Lubrication Protection', 'Hydraulic Protection'],
    keywords: ['filter materials', 'elastomer compatibility', 'housing materials', 'end cap bonding', 'thermal rating'],
  },
];

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

// ─── SYSTEMS ─────────────────────────────────────────────────────────────────

export const KC_SYSTEMS = [
  {
    slug: 'air-intake-protection',
    title: 'Air Intake Protection',
    description: 'Preventing dust, abrasive particles, and moisture from entering the combustion and air supply system. Air filtration directly determines engine wear rate and volumetric efficiency.',
    icon: '💨',
    technologies: ['MACROCORE™', 'INTEKCORE™', 'DURATECH™'],
    standards: ['ISO 5011'],
    challenges: ['Silica ingestion', 'Air restriction', 'Dust holding capacity', 'Pre-cleaner selection'],
  },
  {
    slug: 'fuel-cleanliness-protection',
    title: 'Fuel Cleanliness Protection',
    description: 'Removing water and particles from diesel fuel to protect high-pressure common rail injectors. Water above 200 ppm causes injector stiction and micro-pitting.',
    icon: '⛽',
    technologies: ['SYNTEPORE™', 'HYDROCORE™', 'DURATECH™', 'MARINECLEAN™'],
    standards: ['ISO 12937', 'ASTM D6304'],
    challenges: ['Water contamination', 'HPCR injector protection', 'Microbial growth', 'Fuel polishing'],
  },
  {
    slug: 'lubrication-protection',
    title: 'Lubrication Protection',
    description: 'Maintaining ISO 4406 cleanliness codes in engine and transmission lube circuits. Particle contamination in lube oil is the primary cause of bearing and piston wear.',
    icon: '🔧',
    technologies: ['SYNTRAX™', 'DURATECH™', 'MARINECLEAN™'],
    standards: ['ISO 16889', 'ISO 4406', 'SAE J1858'],
    challenges: ['Bypass valve design', 'Cold start protection', 'Extended drain intervals', 'Oil analysis'],
  },
  {
    slug: 'hydraulic-protection',
    title: 'Hydraulic Protection',
    description: 'Maintaining cleanliness targets in hydraulic circuits to protect proportional valves, servo valves, and high-pressure pumps with sub-10 µm clearance tolerances.',
    icon: '⚙️',
    technologies: ['NANOFORCE™', 'DURATECH™', 'MARINECLEAN™'],
    standards: ['ISO 16889', 'ISO 4406', 'NAS 1638'],
    challenges: ['Servo valve protection', 'Varnish formation', 'Commissioning flush', 'Ingress control'],
  },
  {
    slug: 'cooling-system-protection',
    title: 'Cooling System Protection',
    description: 'Controlling cavitation erosion, corrosion, and scale buildup in diesel engine cooling systems through supplemental coolant additive (SCA) filtration and coolant conditioning.',
    icon: '🌡️',
    technologies: ['THERMACORE™'],
    standards: [],
    challenges: ['Cavitation protection', 'Corrosion inhibitor depletion', 'Coolant pH control', 'Scale prevention'],
  },
  {
    slug: 'cabin-air-protection',
    title: 'Cabin Air Protection',
    description: 'Protecting operators from PM2.5, silica dust, chemical vapors, and biological agents in heavy equipment cabs and industrial vehicles. Cabin air quality is an occupational health requirement.',
    icon: '🏭',
    technologies: ['MICROKAPPA™'],
    standards: ['ISO 11155', 'DIN 71220', 'ISO 29463'],
    challenges: ['PM2.5 capture', 'Chemical vapor control', 'Activated carbon saturation', 'Operator health'],
  },
];

// ─── INDUSTRIES ──────────────────────────────────────────────────────────────

export const KC_INDUSTRIES = [
  { slug: 'mining', title: 'Mining', icon: '⛏️', dust: 'Extreme', description: 'Silica dust, rock fines, explosive gases, and water contamination in extreme environments.' },
  { slug: 'construction', title: 'Construction', icon: '🏗️', dust: 'High', description: 'Concrete dust, soil, and hydraulic circuit contamination on mobile earthmoving equipment.' },
  { slug: 'agriculture', title: 'Agriculture', icon: '🌾', dust: 'High', description: 'Soil, grain dust, and organic matter causing air intake and hydraulic system wear.' },
  { slug: 'truck-fleets', title: 'Truck Fleets', icon: '🚛', dust: 'Moderate', description: 'Urban diesel soot, highway dust, and extended drain interval requirements for long-haul applications.' },
  { slug: 'marine', title: 'Marine', icon: '⚓', dust: 'Moderate', description: 'Salt water ingress, marine diesel contamination, and IMO compliance for offshore operations.' },
  { slug: 'oil-gas', title: 'Oil & Gas', icon: '🛢️', dust: 'High', description: 'Sand, H₂S, drilling mud contamination in upstream and midstream oil and gas assets.' },
  { slug: 'manufacturing', title: 'Manufacturing', icon: '🏭', dust: 'Moderate', description: 'Metalworking fluid contamination, compressor intake filtration, and hydraulic press protection.' },
  { slug: 'power-generation', title: 'Power Generation', icon: '⚡', dust: 'Moderate', description: 'Turbine air intake filtration, generator lube systems, and continuous operation requirements.' },
  { slug: 'railway', title: 'Railway', icon: '🚂', dust: 'Moderate', description: 'Diesel soot, brake dust, and extended service interval requirements for locomotive and rail fleet operations.' },
  { slug: 'waste-municipal', title: 'Waste & Municipal', icon: '🗑️', dust: 'High', description: 'Extreme duty cycles, organic decomposition dust, and hydraulic system demands in refuse collection and compaction equipment.' },
];

// ─── TECHNOLOGIES ─────────────────────────────────────────────────────────────

export interface KCTechnology {
  slug: string;
  name: string;
  domain: string;
  tagline: string;
  engineeringPrinciple: string;
  contamination: string[];
  performanceSpecs: { label: string; value: string }[];
  standards: string[];
  relatedSystems: string[];
  relatedIndustries: string[];
  worksWith: string[];
}

export const KC_TECHNOLOGIES: KCTechnology[] = [
  {
    slug: 'macrocore',
    name: 'MACROCORE™',
    domain: 'Air Intake Protection',
    tagline: 'Multi-layer synthetic air filtration for extreme-duty diesel engine protection.',
    engineeringPrinciple: 'MACROCORE™ uses multi-layer synthetic microfiber media engineered for high dust holding capacity (DHC) and consistent Beta efficiency throughout the service life. The element structure combines an outer pre-filter layer for coarse particle capture, a primary synthetic microfiber layer for sub-10 µm efficiency, and a structural wire support to maintain pleat geometry under anti-collapse loading. Designed for air intake filtration in mining, construction, and agriculture environments where airborne silica concentrations reach 5,000–15,000 mg/m³.',
    contamination: ['Airborne silica', 'Rock fines', 'Grain dust and chaff', 'Carbon soot', 'Cement particulate', 'Coal dust'],
    performanceSpecs: [
      { label: 'Gravimetric efficiency (ISO 5011)', value: '≥99.5%' },
      { label: 'Particulate efficiency at 5 µm', value: '≥99.9%' },
      { label: 'Anti-collapse rating', value: '62 PSI (4.3 bar)' },
      { label: 'Thermal limit (continuous)', value: '120°C' },
    ],
    standards: ['ISO 5011', 'SAE J1539'],
    relatedSystems: ['air-intake-protection'],
    relatedIndustries: ['mining', 'construction', 'agriculture', 'oil-gas', 'power-generation', 'truck-fleets'],
    worksWith: ['INTEKCORE™'],
  },
  {
    slug: 'syntrax',
    name: 'SYNTRAX™',
    domain: 'Engine Lubrication Protection',
    tagline: 'Synthetic lube oil filtration for extended drain and bearing life extension.',
    engineeringPrinciple: 'SYNTRAX™ uses synthetic microfiber media for engine lube oil filtration, achieving β₁₀(c) ≥200 efficiency (99.5% at 10 µm) with 2–3× the dirt holding capacity of equivalent cellulose elements. The anti-drain back valve prevents oil column drain-down during engine shutdown, eliminating dry-start bearing exposure. Cold start differential pressure remains below 0.5 bar at –20°C with synthetic oil formulations, keeping the bypass valve closed during cold crank.',
    contamination: ['Metallic wear particles', 'Silica ingress via air intake', 'Carbon soot from combustion', 'Oxidation products', 'Coolant contamination'],
    performanceSpecs: [
      { label: 'Beta efficiency β₁₀(c)', value: '≥200 (99.5%)' },
      { label: 'DHC vs cellulose', value: '2–3× capacity' },
      { label: 'Thermal limit (continuous)', value: '150°C' },
      { label: 'Cold start ΔP at –20°C', value: '<0.5 bar' },
    ],
    standards: ['ISO 16889', 'ISO 4406', 'SAE J1858', 'DIN 51524'],
    relatedSystems: ['lubrication-protection'],
    relatedIndustries: ['mining', 'construction', 'agriculture', 'truck-fleets', 'marine', 'oil-gas', 'railway', 'power-generation'],
    worksWith: [],
  },
  {
    slug: 'nanoforce',
    name: 'NANOFORCE™',
    domain: 'Hydraulic System Protection',
    tagline: 'High-Beta hydraulic filtration for proportional valve and servo valve protection.',
    engineeringPrinciple: 'NANOFORCE™ achieves β₁₀(c) ≥200 for standard hydraulic applications and β₄(c) ≥1000 for precision servo valve protection. The element collapse resistance of ≥3,000 kPa prevents structural failure under pressure surges. Available in pressure line (rated to 420 bar system pressure), return line, and offline kidney loop configurations. Target ISO 4406 cleanliness of 16/14/11 is achievable with proper system design combining NANOFORCE™ elements with breather protection and commissioning flush procedures.',
    contamination: ['Hard particles 5–15 µm (proportional valve clearance range)', 'Metallic wear debris', 'Silica ingress via breathers', 'Water contamination', 'Varnish precursors'],
    performanceSpecs: [
      { label: 'Beta efficiency β₁₀(c)', value: '≥200 (99.5%)' },
      { label: 'Precision grade β₄(c)', value: '≥1000 (99.9%)' },
      { label: 'Element collapse resistance', value: '≥3,000 kPa' },
      { label: 'Pressure line rating', value: 'To 420 bar' },
    ],
    standards: ['ISO 16889', 'ISO 4406', 'NAS 1638', 'NFPA T2.14', 'ISO 11171'],
    relatedSystems: ['hydraulic-protection'],
    relatedIndustries: ['mining', 'construction', 'agriculture', 'manufacturing', 'oil-gas', 'marine'],
    worksWith: [],
  },
  {
    slug: 'syntepore',
    name: 'SYNTEPORE™',
    domain: 'Fuel Cleanliness — HPCR Injector Protection',
    tagline: 'Nanofiber fuel filtration for high-pressure common rail injector protection.',
    engineeringPrinciple: 'SYNTEPORE™ uses nanofiber surface-loading media to achieve β₄(c) ≥200 particle efficiency in diesel fuel filtration. Surface-loading (as opposed to depth-loading cellulose) prevents media fiber collapse and migration under pulsating pressure. Compatible with B20 biodiesel blends and designed for water tolerance to 500 ppm emulsified water without media degradation or efficiency loss. Target protection for HPCR injectors requires fuel cleanliness at ISO 12/10/8 — achievable with SYNTEPORE™ in a properly designed two-stage fuel system.',
    contamination: ['Hard particles >4 µm (injector needle clearance)', 'Silica particles', 'Metallic particles from fuel system wear', 'Emulsified water (tolerance only — free water removal via HYDROCORE™)'],
    performanceSpecs: [
      { label: 'Beta efficiency β₄(c)', value: '≥200 (99.5%)' },
      { label: 'Biodiesel compatibility', value: 'B20 certified' },
      { label: 'Water tolerance', value: 'No degradation to 500 ppm emulsified' },
      { label: 'Target fuel cleanliness', value: 'ISO 12/10/8' },
    ],
    standards: ['ASTM D6304', 'ISO 12937', 'ISO 16332'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedIndustries: ['mining', 'construction', 'agriculture', 'truck-fleets', 'marine', 'oil-gas', 'power-generation'],
    worksWith: ['HYDROCORE™'],
  },
  {
    slug: 'hydrocore',
    name: 'HYDROCORE™',
    domain: 'Fuel Water Separation',
    tagline: 'Coalescing fuel water separator for free water removal from diesel fuel.',
    engineeringPrinciple: 'HYDROCORE™ uses a coalescing mechanism — hydrophobic media attracts and aggregates small water droplets into larger droplets that fall by gravity into a drain sump. Free water removal efficiency ≥96% per ISO 16332. Coalescing is paired with 10 µm particulate capability to address both contamination modes simultaneously. The drain sump requires periodic manual drain or an automated sump drain valve. HYDROCORE™ is complementary to SYNTEPORE™ — HYDROCORE™ removes free and coalesced water; SYNTEPORE™ provides particle protection for HPCR injectors.',
    contamination: ['Free water in diesel fuel', 'Emulsified water', 'Entrained water from fuel storage', 'Microbial growth (removed via water elimination)'],
    performanceSpecs: [
      { label: 'Free water removal (ISO 16332)', value: '≥96%' },
      { label: 'Particulate capability', value: '10 µm' },
      { label: 'Mechanism', value: 'Hydrophobic coalescing + gravity sump' },
    ],
    standards: ['ASTM D6304', 'ISO 12937', 'ISO 16332'],
    relatedSystems: ['fuel-cleanliness-protection'],
    relatedIndustries: ['marine', 'mining', 'agriculture', 'truck-fleets', 'oil-gas', 'power-generation'],
    worksWith: ['SYNTEPORE™'],
  },
  {
    slug: 'thermacore',
    name: 'THERMACORE™',
    domain: 'Cooling System Protection',
    tagline: 'SCA conditioner for diesel engine cooling system inhibitor management.',
    engineeringPrinciple: 'THERMACORE™ controls supplemental coolant additive (SCA) concentration through a controlled-release media that depletes SCA linearly across the service interval. This maintains inhibitor concentration in the 0.5–1.0 units SCA/L target band without overdose or underdose conditions. The element also provides >80% particulate capture at 20 µm in coolant, removing corrosion products, scale particles, and silicate gel. Compatible with OAT (organic acid technology), HOAT, and conventional silicate coolants. Cooling system contamination control prevents cavitation erosion of wet cylinder liners, a primary failure mode in heavy diesel engines.',
    contamination: ['Scale deposits', 'Cavitation erosion products', 'Corrosion products', 'Silicate gel precipitation', 'SCA inhibitor depletion'],
    performanceSpecs: [
      { label: 'SCA release mechanism', value: 'Linear controlled release' },
      { label: 'Particulate capture at 20 µm', value: '>80%' },
      { label: 'Coolant compatibility', value: 'OAT, HOAT, conventional' },
    ],
    standards: ['ASTM D6210', 'ASTM D3306'],
    relatedSystems: ['cooling-system-protection'],
    relatedIndustries: ['mining', 'construction', 'truck-fleets', 'agriculture', 'power-generation'],
    worksWith: [],
  },
  {
    slug: 'drycore',
    name: 'DRYCORE™',
    domain: 'Compressed Air Protection',
    tagline: 'Multi-stage compressed air filtration achieving ISO 8573-1 Class 1 purity.',
    engineeringPrinciple: 'DRYCORE™ addresses all three compressed air contamination categories defined by ISO 8573-1: solid particles, water (liquid and vapor), and oil (liquid, aerosol, and vapor). The multi-stage system consists of a pre-filter for bulk liquid removal, a coalescing filter for aerosol capture (≥99.9% liquid oil removal), an activated carbon stage for oil vapor and odor, and a post-filter for final particulate polish. ISO 8573-1 Class 1:4:1 is achievable — representing particle class 1 (≤0.1 mg/m³ at ≥0.5 µm), water class 4 (pressure dewpoint ≤+3°C), and oil class 1 (≤0.01 mg/m³). Applied in precision manufacturing, pharmaceutical production, food processing, and instrument air systems.',
    contamination: ['Water vapor and liquid water', 'Compressor oil aerosol', 'Oil vapor', 'Solid particles from compressor wear', 'Rust from distribution piping'],
    performanceSpecs: [
      { label: 'Liquid oil removal', value: '≥99.9%' },
      { label: 'ISO 8573-1 class achievable', value: '1:4:1' },
      { label: 'Stages', value: 'Pre-filter, coalescing, carbon, post-filter' },
    ],
    standards: ['ISO 8573-1', 'ISO 8573-2', 'ISO 8573-3'],
    relatedSystems: [],
    relatedIndustries: ['manufacturing', 'oil-gas', 'power-generation'],
    worksWith: [],
  },
  {
    slug: 'intekcore',
    name: 'INTEKCORE™',
    domain: 'Air Intake Protection',
    tagline: 'Air intake housing and pre-cleaner system for primary element life extension.',
    engineeringPrinciple: 'INTEKCORE™ provides the system housing around the MACROCORE™ primary element, including pre-cleaner integration, restriction monitoring port, and service access design. Centrifugal pre-cleaners integrated into INTEKCORE™ housings remove 80–95% of dust before it reaches the primary element, extending primary element service life 3–5× in high-dust environments. The integrated restriction indicator port accepts mechanical or electronic restriction indicators for condition-based service scheduling. Housing seals are precision-engineered to eliminate bypass at the housing-to-engine interface.',
    contamination: ['Pre-cleaner stage: coarse particles >50 µm removed by centrifugal separation', 'Housing bypass prevention: zero-leak seal design', 'Restriction monitoring: prevents service-limit exceedance'],
    performanceSpecs: [
      { label: 'Pre-cleaner dust removal', value: '80–95% coarse particles' },
      { label: 'Primary element life extension', value: '3–5× in high-dust' },
      { label: 'Restriction port', value: 'Mechanical and electronic indicator compatible' },
    ],
    standards: ['ISO 5011'],
    relatedSystems: ['air-intake-protection'],
    relatedIndustries: ['mining', 'construction', 'agriculture', 'oil-gas'],
    worksWith: ['MACROCORE™'],
  },
  {
    slug: 'microkappa',
    name: 'MICROKAPPA™',
    domain: 'Cabin Air Protection',
    tagline: 'H13-class cabin air filtration for operator health in heavy equipment cabs.',
    engineeringPrinciple: 'MICROKAPPA™ addresses operator occupational health exposure to PM₁₀, PM₂.₅, PM₁.₀, crystalline silica, and chemical vapors in heavy equipment operator cabs. The dual-function element combines H13-class particulate filtration (≥95% PM₂.₅ efficiency) with an activated carbon layer for VOC, NO₂, and diesel exhaust vapor control. Initial restriction ≤50 Pa allows installation in HVAC systems with standard fan capacity. Respirable silica occupational limits (OSHA PEL: 0.025 mg/m³) require effective cabin filtration in mining, construction, and agriculture environments where ambient silica concentrations exceed limits by 100–1000×.',
    contamination: ['PM₁₀, PM₂.₅, PM₁.₀ particulates', 'Crystalline silica (respirable fraction)', 'Diesel exhaust particulate (DPM)', 'Volatile organic compounds (VOCs)', 'NO₂ and combustion gases', 'Biological agents'],
    performanceSpecs: [
      { label: 'PM₂.₅ efficiency', value: '≥95%' },
      { label: 'Classification', value: 'H13-class (HEPA-adjacent)' },
      { label: 'Initial restriction', value: '≤50 Pa at rated flow' },
      { label: 'Activated carbon layer', value: 'VOC + NO₂ adsorption' },
    ],
    standards: ['ISO 11155-1', 'ISO 11155-2', 'DIN 71220', 'ISO 16890', 'ISO 29463'],
    relatedSystems: ['cabin-air-protection'],
    relatedIndustries: ['mining', 'construction', 'agriculture', 'oil-gas', 'waste-municipal'],
    worksWith: [],
  },
  {
    slug: 'duratech',
    name: 'DURATECH™',
    domain: 'Fleet Maintenance — Consolidated Kit System',
    tagline: 'Consolidated filter kits for heavy-duty fleet maintenance covering all filtration systems in a single service kit.',
    engineeringPrinciple: 'DURATECH™ is the ELIMFILTERS consolidated filter kit system for heavy-duty fleets, delivering the complete filtration requirement for a specific piece of equipment in a single maintenance kit covering air, oil, fuel, and hydraulic filters simultaneously. Instead of sourcing individual filtration components, DURATECH™ bundles all system-specific elements required for a full service event. The kit architecture eliminates the common malpractice of extending service intervals on secondary filters when primary elements are changed — guaranteeing that all contamination control systems are renewed simultaneously at each maintenance event.',
    contamination: ['Cross-system contamination from incomplete maintenance', 'Metallic wear particles (oil circuit)', 'Airborne silica (air intake)', 'Fuel water contamination', 'Hydraulic particle contamination'],
    performanceSpecs: [
      { label: 'Coverage', value: 'Air, oil, fuel, hydraulic — single kit' },
      { label: 'Application scope', value: 'Equipment-specific kit configuration' },
      { label: 'TCO model', value: 'Fixed maintenance cost per service event' },
      { label: 'Inventory reduction', value: 'One kit number per equipment model' },
    ],
    standards: ['ISO 4406', 'ISO 16889'],
    relatedSystems: ['air-intake-protection', 'lubrication-protection', 'fuel-cleanliness-protection', 'hydraulic-protection'],
    relatedIndustries: ['mining', 'construction', 'agriculture', 'truck-fleets'],
    worksWith: ['MACROCORE™', 'SYNTRAX™', 'SYNTEPORE™', 'NANOFORCE™'],
  },
  {
    slug: 'marineclean',
    name: 'MARINECLEAN™',
    domain: 'Marine Filtration — Consolidated Marine System',
    tagline: 'Consolidated filtration system for maritime vessels covering all on-board filtration circuits in high-salinity environments.',
    engineeringPrinciple: 'MARINECLEAN™ is the ELIMFILTERS comprehensive commercial system dedicated to the maritime sector, consolidating all marine filtration requirements — engine lube, fuel, hydraulic — for vessels operating in high-humidity and high-salinity environments where uncontrolled contamination can result in vessel immobilization without immediate service access. The system spans recreational marine (jet skis, outboard and inboard engines from Yamaha, Evinrude, Mercruiser) through commercial heavy-duty cargo vessels (MTU, CAT, ONAN marine diesel engines). Full traceability of filtration across all on-board circuits is the core operating principle, reflecting IMO and classification society maintenance documentation requirements.',
    contamination: ['Salt water ingress into lube and fuel systems', 'Marine diesel water contamination', 'Hydraulic contamination in deck machinery', 'Corrosion products from high-humidity environments', 'Microbial growth in stored marine diesel fuel'],
    performanceSpecs: [
      { label: 'Coverage', value: 'Engine lube, fuel, hydraulic — full vessel' },
      { label: 'Sector range', value: 'Recreational to heavy-duty cargo' },
      { label: 'Environmental rating', value: 'High-salinity, high-humidity certification' },
      { label: 'Traceability', value: 'Full circuit documentation for survey compliance' },
    ],
    standards: ['ISO 16889', 'ASTM D6304', 'ISO 12937'],
    relatedSystems: ['lubrication-protection', 'fuel-cleanliness-protection', 'hydraulic-protection'],
    relatedIndustries: ['marine'],
    worksWith: ['SYNTRAX™', 'HYDROCORE™', 'NANOFORCE™', 'SYNTEPORE™'],
  },
];

// ─── SYSTEM DETAILS ───────────────────────────────────────────────────────────

export interface KCSystemDetail {
  slug: string;
  failureMechanism: string;
  contaminationTarget: string;
  targetCleanliness: string;
  keyMetrics: { label: string; value: string }[];
  sections: { heading: string; body: string; callout?: { label: string; value: string }[] }[];
}

export const KC_SYSTEM_DETAILS: Record<string, KCSystemDetail> = {
  'air-intake-protection': {
    slug: 'air-intake-protection',
    failureMechanism: 'Unfiltered air ingests silica and abrasive particles through the combustion air system → particles embed in piston ring/cylinder bore interface → two-body abrasive wear → oil consumption increase → ring land collapse → engine overhaul required.',
    contaminationTarget: 'Airborne particulate — silica, carbon, grain dust, cement — at concentrations from 100 mg/m³ (highway) to 15,000 mg/m³ (mining blast areas).',
    targetCleanliness: '≥99.5% gravimetric efficiency (ISO 5011); ≤625 mm H₂O restriction for turbocharged; ≤250 mm H₂O for naturally aspirated.',
    keyMetrics: [
      { label: 'Mining dust concentration', value: '5,000–15,000 mg/m³' },
      { label: 'Efficiency target (ISO 5011)', value: '≥99.5% gravimetric' },
      { label: 'Service limit (turbo)', value: '625 mm H₂O' },
      { label: 'Engine life extension', value: '3–5× with system approach' },
    ],
    sections: [
      {
        heading: 'Protection Domain',
        body: 'Air intake filtration is the first and most critical protection barrier for diesel engines in heavy-duty applications. Every kilogram of dust that reaches the combustion chamber contributes directly to cylinder and ring wear. In mining environments, dust concentrations exceed 5,000 mg/m³ during blasting operations — compared to highway environments at 0.1–1 mg/m³. The filtration system must remove ≥99.5% of incoming particulate mass while maintaining restriction below the engine manufacturer\'s service limit.',
      },
      {
        heading: 'Restriction and Service Interval',
        body: 'Filter restriction increases as the element loads with contaminant. Service is required when restriction reaches the threshold set by the engine manufacturer — typically 375–625 mm H₂O for turbocharged diesel engines. Condition-based service (using restriction indicators) maximizes element DHC utilization and avoids premature replacement. In high-dust environments, service intervals can range from 50 hours (extreme mining blast areas) to 2,000+ hours (highway truck operations).',
        callout: [
          { label: 'Typical highway interval', value: '1,000–2,000 hrs' },
          { label: 'Mining interval', value: '50–250 hrs' },
          { label: 'Agriculture (harvest)', value: '8–24 hrs' },
        ],
      },
      {
        heading: 'Pre-Cleaner Systems',
        body: 'Centrifugal pre-cleaners installed upstream of the primary element remove 80–95% of coarse dust (>50 µm) before it reaches the filter media. INTEKCORE™ housings integrate pre-cleaner functionality, extending primary MACROCORE™ element life by 3–5× in high-dust environments. Pre-cleaners require automatic evacuation of the separated dust through a scavenging air ejector or manual drain.',
      },
      {
        heading: 'Failure Analysis',
        body: 'Air intake filter failures occur in three modes: media failure (breach in filter media allowing unfiltered air bypass), seal failure (leak at the housing-to-engine interface), and service limit exceedance (continued operation after restriction threshold is reached). Of these, seal failure is most common in field conditions — improper installation torque, damaged gaskets, or distorted housing seating surfaces allow unfiltered air to bypass the element entirely.',
      },
    ],
  },
  'fuel-cleanliness-protection': {
    slug: 'fuel-cleanliness-protection',
    failureMechanism: 'Water above 200 ppm in HPCR fuel → corrosion of injector needle and valve seat → micro-pitting → stiction → increased injection timing variability → rough running → injector replacement. Hard particles >4 µm → abrasive wear of injector needle and orifice → spray pattern distortion → combustion degradation → power loss.',
    contaminationTarget: 'Water (<200 ppm for HPCR protection), hard particles (ISO 12/10/8 cleanliness for HPCR injectors at 2,000+ bar injection pressure).',
    targetCleanliness: 'ISO 12/10/8 particle cleanliness; <200 ppm water content (ISO 12937 / ASTM D6304).',
    keyMetrics: [
      { label: 'HPCR injector clearance', value: '1–3 µm needle/seat' },
      { label: 'Water limit for HPCR', value: '<200 ppm' },
      { label: 'Particle target', value: 'ISO 12/10/8' },
      { label: 'Injector service cost', value: '$800–$2,500 per injector' },
    ],
    sections: [
      {
        heading: 'HPCR Injector Sensitivity',
        body: 'High-pressure common rail (HPCR) fuel systems operate at injection pressures from 1,600 to 2,500 bar. Injector needle-to-seat clearances are 1–3 µm — smaller than many fuel contaminant particles. At these clearances, even sub-5 µm particles cause abrasive wear and dimensional change. Water above 200 ppm in fuel causes corrosion of precision-ground injector surfaces and promotes microbial growth in fuel storage.',
        callout: [
          { label: 'Injection pressure', value: '1,600–2,500 bar' },
          { label: 'Needle clearance', value: '1–3 µm' },
          { label: 'Water damage threshold', value: '>200 ppm' },
        ],
      },
      {
        heading: 'Two-Stage Protection Strategy',
        body: 'Fuel protection requires two complementary technologies: SYNTEPORE™ for particle removal (β₄(c) ≥200) and HYDROCORE™ for free water removal (≥96%). The pre-filter/coarse separator (HYDROCORE™) is installed upstream to remove bulk water and coarse particles. The final element (SYNTEPORE™) provides fine particle protection at the injection pump inlet. This sequence protects both the lift pump (10–15 µm clearances) and the high-pressure pump and injectors (1–3 µm clearances).',
      },
      {
        heading: 'Water Contamination Pathways',
        body: 'Water enters diesel fuel through atmospheric breathing of storage tanks (condensation), transport container contamination, fuel depot cross-contamination, and worn fill-point seals. Coastal marine environments and high-humidity climates accelerate tank condensation. Microbial growth (Hormoconis resinae, Pseudomonas aeruginosa) occurs at the water/fuel interface above 60–70°F and can block filters within 72 hours.',
      },
    ],
  },
  'lubrication-protection': {
    slug: 'lubrication-protection',
    failureMechanism: 'Particle contamination in lube oil → abrasive wear of bearing journals and piston rings → bearing clearance opens → oil film breakdown at reduced clearance → bearing seizure. Bypass valve opening during cold start → unfiltered oil to bearings during first 30–60 seconds.',
    contaminationTarget: 'Solid particles (ISO 4406 target 16/14/11 for system approach), water (from coolant leak or condensation), fuel dilution, and oxidation soot.',
    targetCleanliness: 'ISO 4406 code 16/14/11 for system-approach protection; OEM specification for minimum compliance.',
    keyMetrics: [
      { label: 'Bearing life at 16/14/11', value: '3–5× vs 19/17/14' },
      { label: 'Typical lube filter β₁₀(c)', value: 'SYNTRAX™: ≥200' },
      { label: 'Bypass valve cracking ΔP', value: '0.8–1.0 bar' },
      { label: 'Cold start ADB spec', value: '<1 mL/min drain-back' },
    ],
    sections: [
      {
        heading: 'Bearing Clearance and Contamination',
        body: 'Engine bearing journals operate with clearances of 5–25 µm depending on bearing size and design. Particles in this size range — most prevalent in used engine oil — cause two-body and three-body abrasive wear that progressively increases clearance. Increased clearance reduces oil film pressure, which in turn increases bearing operating temperature. ISO 4406 cleanliness code 16/14/11 — achievable with SYNTRAX™ — extends bearing life 3–5× versus the commodity approach at 19/17/14.',
      },
      {
        heading: 'Bypass Valve Design',
        body: 'Lube filter bypass valves open at 0.8–1.0 bar differential pressure to protect the engine from oil starvation if the filter becomes severely restricted. During bypass, unfiltered oil bypasses the filter media and enters the lubrication circuit. This is acceptable for brief cold-start conditions but represents a failure mode if sustained. Bypass valve spring rate must be calibrated to maintain closure across the full operating temperature range — spring relaxation at elevated temperature can cause partial bypass below the rated threshold.',
      },
      {
        heading: 'Extended Drain Intervals',
        body: 'Extended drain interval programs require oil analysis to monitor oil condition and contamination level throughout the interval. SYNTRAX™ elements provide higher dirt holding capacity than cellulose, enabling longer intervals in terms of filter restriction. However, lube oil replacement interval is governed by oil oxidation, additive depletion, and TAN (total acid number) — not filter restriction alone. Extended drain programs without oil analysis risk cumulative bearing wear from contaminated oil.',
      },
    ],
  },
  'hydraulic-protection': {
    slug: 'hydraulic-protection',
    failureMechanism: 'Particles in the 5–15 µm clearance range of proportional valve spools → spool stiction → valve position error → pressure and flow control instability → machine motion faults → unexpected movement. Hard particles >3 µm in high-pressure pump clearances → abrasive wear → pump efficiency loss → heat generation → seal failure.',
    contaminationTarget: 'Hard particles in the 1–15 µm range, targeting ISO 4406 16/14/11 for proportional systems and ISO 18/16/13 minimum per NFPA T2.14.',
    targetCleanliness: 'ISO 4406 16/14/11 for proportional valve systems; ISO 18/16/13 minimum (NFPA T2.14); ISO 15/13/10 for servo valve systems.',
    keyMetrics: [
      { label: 'Proportional valve clearance', value: '5–10 µm' },
      { label: 'NFPA T2.14 minimum', value: 'ISO 18/16/13' },
      { label: 'NANOFORCE™ β₁₀(c)', value: '≥200 (99.5%)' },
      { label: 'Equipment availability impact', value: '–15–30% without control' },
    ],
    sections: [
      {
        heading: 'Proportional Valve Protection',
        body: 'Proportional valves and servo valves control hydraulic flow and pressure in direct proportion to an electrical input signal. Spool-to-bore clearances of 5–10 µm make these valves highly sensitive to particle contamination. Hard particles trap between spool and bore, increasing breakout friction (stiction) and causing position hysteresis — the actual valve position lags the commanded position. NFPA T2.14 mandates ISO 18/16/13 minimum cleanliness for systems containing proportional control valves.',
        callout: [
          { label: 'Servo valve clearance', value: '2–5 µm' },
          { label: 'Proportional valve clearance', value: '5–10 µm' },
          { label: 'Gear pump clearance', value: '10–25 µm' },
        ],
      },
      {
        heading: 'Commissioning Flush Protocol',
        body: 'New hydraulic systems contain manufacturing residue (machining chips, pipe scale, welding slag, sealing compound). Commissioning flush — circulating filtered oil at elevated flow rate through dedicated flush circuits before first operation — is essential to achieve target cleanliness. System cleanliness should be verified by particle counting (ISO 11171 calibrated APC) before connecting servo or proportional valves.',
      },
      {
        heading: 'Offline Kidney Loop Filtration',
        body: 'Offline kidney loop filters — independent filtration circuits that draw from and return to the reservoir — provide continuous particulate removal independent of system operation. Unlike pressure and return line filters that only filter during machine operation, kidney loops maintain reservoir cleanliness during standby. Recommended flow rate: 10–15% of reservoir volume per hour for steady-state maintenance filtration.',
      },
    ],
  },
  'cooling-system-protection': {
    slug: 'cooling-system-protection',
    failureMechanism: 'SCA inhibitor depletion → liner wall cavitation erosion → coolant contamination with cast iron particles → coolant jacket corrosion → head gasket failure. Scale formation → reduced heat transfer coefficient → elevated coolant temperature → overheating events.',
    contaminationTarget: 'SCA concentration maintained in 0.5–1.0 units/L band; scale, corrosion products, and silicate gel below 20 µm threshold.',
    targetCleanliness: 'SCA concentration 0.5–1.0 units per liter; pH 8.5–10.5; coolant change interval per ASTM D6210.',
    keyMetrics: [
      { label: 'SCA target concentration', value: '0.5–1.0 units/L' },
      { label: 'THERMACORE™ particle capture', value: '>80% at 20 µm' },
      { label: 'Liner erosion mechanism', value: 'Cavitation from vapor bubble collapse' },
    ],
    sections: [
      {
        heading: 'Cavitation Erosion Mechanism',
        body: 'Diesel engine wet cylinder liners vibrate due to combustion pressure pulses. This vibration creates low-pressure zones on the coolant side of the liner — when pressure drops below the vapor pressure of the coolant, vapor bubbles form. When these bubbles collapse, micro-jets of liquid impact the liner surface at velocities that erode cast iron at a rate that can penetrate a liner wall in 2,000–5,000 hours without adequate SCA protection. Supplemental coolant additives (SCA) form a protective film on the liner surface that absorbs the impact energy of bubble collapse.',
      },
      {
        heading: 'SCA Management',
        body: 'SCA concentration must remain within the 0.5–1.0 units/L range. Below 0.5, cavitation erosion protection is insufficient. Above 1.5, SCA precipitation can cause gel formation and clogging. THERMACORE™ releases SCA linearly across the service interval, maintaining concentration without overdose. SCA concentration is verified using test strips or refractometer measurement at each coolant service interval.',
      },
    ],
  },
  'cabin-air-protection': {
    slug: 'cabin-air-protection',
    failureMechanism: 'Unfiltered cabin air → occupational exposure to respirable silica (PM₁.₀) → cumulative lung dose → silicosis (irreversible fibrotic lung disease) — a permanently disabling occupational illness. PM₂.₅ → cardiovascular and respiratory disease. VOC/diesel exhaust → carcinogenic exposure.',
    contaminationTarget: 'PM₁₀, PM₂.₅, PM₁.₀ particulates below occupational exposure limits; respirable silica below 0.025 mg/m³ (OSHA PEL).',
    targetCleanliness: 'Cabin air quality below OEL: respirable silica <0.025 mg/m³, PM₂.₅ <35 µg/m³ (8-hr TWA), total diesel particulate below relevant national limits.',
    keyMetrics: [
      { label: 'OSHA PEL — respirable silica', value: '0.025 mg/m³' },
      { label: 'MICROKAPPA™ PM₂.₅ efficiency', value: '≥95%' },
      { label: 'Mining ambient silica vs OEL', value: '100–1,000× above limit' },
    ],
    sections: [
      {
        heading: 'Occupational Exposure Framework',
        body: 'Operators of mining, construction, and agricultural equipment face chronic exposure to airborne crystalline silica at concentrations 100–1,000× above the OSHA Permissible Exposure Limit (PEL) of 0.025 mg/m³ for respirable silica. Silicosis is a progressively disabling fibrotic lung disease with no cure — once silica deposits are established in lung tissue, the inflammation continues regardless of subsequent exposure reduction. Cabin air filtration is the primary engineering control for operator protection in environments where atmospheric controls are impractical.',
        callout: [
          { label: 'OSHA silica PEL', value: '0.025 mg/m³' },
          { label: 'Mine ambient concentration', value: 'Up to 25 mg/m³ respirable fraction' },
          { label: 'Protection factor needed', value: '1,000×' },
        ],
      },
      {
        heading: 'Cabin Filtration Design',
        body: 'MICROKAPPA™ H13-class elements provide ≥95% PM₂.₅ efficiency and ≥99.95% efficiency at 0.3 µm (MPPS for HEPA-class media). The activated carbon layer adsorbs VOCs, NO₂, diesel exhaust gases, and agricultural chemicals. Proper cabin filtration requires positive pressurization of the cab relative to the exterior — air must flow outward through any gap, preventing unfiltered exterior air from entering through door seals, cable penetrations, or HVAC ducts.',
      },
      {
        heading: 'Filter Replacement Protocol',
        body: 'Cabin air filter service intervals in mining and construction environments range from 100 to 500 hours depending on ambient dust concentration and cab pressurization integrity. Restriction should be checked at each scheduled service. Activated carbon saturation occurs independently of particulate loading — in high-VOC environments (diesel exhaust, paint fumes), carbon may saturate before particulate capacity is reached. Carbon saturation is indicated by odor breakthrough.',
      },
    ],
  },
};

// ─── INDUSTRY DETAILS ─────────────────────────────────────────────────────────

export interface KCIndustryDetail {
  slug: string;
  contaminationEnvironment: string;
  primaryRisks: string[];
  serviceIntervalNote: string;
  keyMetrics: { label: string; value: string }[];
  technologies: string[];
  standards: string[];
  systems: string[];
  sections: { heading: string; body: string }[];
}

export const KC_INDUSTRY_DETAILS: Record<string, KCIndustryDetail> = {
  mining: {
    slug: 'mining',
    contaminationEnvironment: 'Extreme — silica dust 5,000–15,000 mg/m³ during blasting; coal dust, rock fines, explosive gases, and process water contamination across surface and underground operations.',
    primaryRisks: [
      'Air intake silica ingestion → engine abrasive wear',
      'Operator silicosis risk (respirable fraction)',
      'Hydraulic valve stiction from fine silica particles',
      'Bearing wear from lube oil contamination',
      'Fuel water contamination in remote storage',
    ],
    serviceIntervalNote: 'Air filter: 50–250 hours depending on blast proximity and dust suppression. Lube oil: per oil analysis program, typically 250–500 hours with synthetic media. Hydraulic: 500–1,000 hours with kidney loop systems.',
    keyMetrics: [
      { label: 'Dust concentration (blast area)', value: '5,000–15,000 mg/m³' },
      { label: 'Primary element service (extreme)', value: '50–100 hrs' },
      { label: 'MICROKAPPA™ required', value: 'Yes — silicosis risk' },
      { label: 'ISO 4406 hydraulic target', value: '16/14/11' },
    ],
    technologies: ['MACROCORE™', 'INTEKCORE™', 'MICROKAPPA™', 'SYNTRAX™', 'NANOFORCE™', 'SYNTEPORE™', 'HYDROCORE™'],
    standards: ['ISO 5011', 'ISO 4406', 'ISO 16889', 'ISO 11155-1'],
    systems: ['Air Intake Protection', 'Cabin Air Protection', 'Hydraulic Protection', 'Lubrication Protection', 'Fuel Cleanliness Protection'],
    sections: [
      {
        heading: 'Contamination Profile',
        body: 'Mining operations generate contamination across all protection domains simultaneously. Blasting and drilling produce silica concentrations that can render primary air filters unserviceable in 50–100 hours. Underground operations add diesel exhaust particulate (DPM) to the cabin air load. Hydraulic systems on haul trucks and loaders are exposed to dust ingress through worn cylinder seal wipers and breather contamination. Fuel storage in remote locations accumulates water contamination from tank condensation over weeks of thermal cycling.',
      },
      {
        heading: 'Equipment Applications',
        body: 'Mining equipment requiring ELIMFILTERS system protection includes surface haul trucks (150–400 tonne payload, CAT 793, Komatsu 930E class), underground loaders (LHDs), drill rigs, crushing and screening plant, and conveyor drive systems. Each equipment class has different duty cycles, contamination exposure levels, and service access constraints that determine the filtration strategy.',
      },
      {
        heading: 'Cabin Air Priority',
        body: 'Operator silicosis risk in mining is classified as an occupational health emergency in most jurisdictions. Ambient respirable silica in active mining areas exceeds the OSHA PEL (0.025 mg/m³) by 100–1,000×. MICROKAPPA™ H13-class cabin filtration is mandatory from an occupational health standpoint — not optional equipment. Cab pressurization integrity must be verified at each major service to prevent unfiltered air ingress through door seals and cable penetrations.',
      },
    ],
  },
  construction: {
    slug: 'construction',
    contaminationEnvironment: 'High — concrete dust, soil, sand, demolition debris; hydraulic circuit contamination from attachment changes; seasonal variation between dry (summer/high dust) and wet (winter/water ingress) conditions.',
    primaryRisks: [
      'Air intake concrete and silica dust — abrasive wear',
      'Hydraulic contamination during quick-coupler attachment changes',
      'Lube oil contamination in high-cycle excavators',
      'Water contamination in fuel storage on site',
    ],
    serviceIntervalNote: 'Air filter: 250–500 hours in typical conditions; 100–200 hours during demolition work. Hydraulic: 500–1,000 hours, with attention to quick-coupler attachment changes as ingress points.',
    keyMetrics: [
      { label: 'Dust concentration (demolition)', value: 'Up to 2,000 mg/m³' },
      { label: 'Air filter service interval', value: '250–500 hrs' },
      { label: 'Quick-coupler ingress risk', value: 'HIGH at every attachment change' },
    ],
    technologies: ['MACROCORE™', 'NANOFORCE™', 'SYNTRAX™', 'MICROKAPPA™'],
    standards: ['ISO 5011', 'ISO 4406', 'ISO 16889'],
    systems: ['Air Intake Protection', 'Hydraulic Protection', 'Lubrication Protection', 'Cabin Air Protection'],
    sections: [
      {
        heading: 'Contamination Profile',
        body: 'Construction sites generate silica-containing dust from concrete cutting, demolition, earthmoving, and road base work. Hydraulic circuits face a specific ingress risk at quick-coupler attachment changes — each connection exposes hydraulic ports to ambient contamination for 5–30 seconds. Over a typical excavator\'s working day (8–10 attachment changes), cumulative ingress can significantly degrade hydraulic cleanliness.',
      },
      {
        heading: 'Equipment Applications',
        body: 'Construction equipment includes excavators (CAT 320–395, Komatsu PC200–800 class), wheel loaders, crawler dozers, graders, compaction equipment, and off-road dump trucks. Excavators are the highest-value asset requiring hydraulic protection, with complex multi-circuit systems controlling boom, arm, bucket, travel, and swing simultaneously.',
      },
    ],
  },
  agriculture: {
    slug: 'agriculture',
    contaminationEnvironment: 'High (seasonally extreme during harvest) — grain dust, chaff, crop residue, and organic matter. Harvest windows create extreme air intake loading that may require daily filter service. Soil dust from tillage operations.',
    primaryRisks: [
      'Air intake saturation during harvest — daily or more frequent service required',
      'Cabin operator health — grain dust and agrochemical exposure',
      'Hydraulic system contamination from high-cycle operations',
      'Fuel water contamination in seasonal storage',
    ],
    serviceIntervalNote: 'Air filter during harvest: as frequent as 8–24 hours depending on crop type and humidity. Off-season: 250–500 hours. Lube oil: per oil analysis. Pre-cleaner systems extend primary element life significantly during harvest.',
    keyMetrics: [
      { label: 'Harvest air filter interval', value: '8–24 hrs (crop dependent)' },
      { label: 'Pre-cleaner life extension', value: '3–5× primary element' },
      { label: 'Season length', value: '6–12 weeks (high dust)' },
    ],
    technologies: ['MACROCORE™', 'INTEKCORE™', 'SYNTRAX™', 'MICROKAPPA™', 'NANOFORCE™', 'HYDROCORE™'],
    standards: ['ISO 5011', 'ISO 4406', 'ISO 16889'],
    systems: ['Air Intake Protection', 'Lubrication Protection', 'Hydraulic Protection', 'Cabin Air Protection', 'Fuel Cleanliness Protection'],
    sections: [
      {
        heading: 'Harvest Season Contamination',
        body: 'Combine harvesters and grain carts operate in concentrated grain dust during harvest season. Grain dust is highly combustible (explosion risk) and saturates air filter elements rapidly. Dust concentrations around operating combines can reach 500–2,000 mg/m³. Pre-cleaner systems with ejection hoppers are essential — without them, primary element service intervals may drop to 4–8 hours, creating unacceptable machine downtime during time-critical harvest windows.',
      },
      {
        heading: 'Equipment Applications',
        body: 'Agricultural equipment includes combine harvesters, tractors (100–500+ HP), sprayers, planters, and grain carts. Combines have the highest filtration demand due to the combination of crop dust generation at the header and engine proximity to the threshing and cleaning systems. Tractors pulling grain carts or tillage implements face high dust loads from disturbed soil.',
      },
    ],
  },
  'truck-fleets': {
    slug: 'truck-fleets',
    contaminationEnvironment: 'Moderate — highway dust, diesel soot from EGR systems, oil dilution from DPF post-injection. Long-haul routes have lower dust but high-cycle urban delivery generates higher soot loads.',
    primaryRisks: [
      'Engine oil contamination from EGR soot and DPF post-injection fuel dilution',
      'Cabin air quality (urban diesel exhaust)',
      'Extended drain interval compliance',
      'Air restriction from accumulated highway dust',
    ],
    serviceIntervalNote: 'Air filter: 60,000–150,000 km highway; 30,000–80,000 km urban. Lube oil: per oil analysis program, typically 30,000–50,000 km long-haul with synthetic media.',
    keyMetrics: [
      { label: 'Highway air filter interval', value: '60,000–150,000 km' },
      { label: 'Urban interval', value: '30,000–80,000 km' },
      { label: 'EGR soot contamination', value: 'Up to 5% soot in lube oil' },
    ],
    technologies: ['MACROCORE™', 'SYNTRAX™', 'MICROKAPPA™', 'SYNTEPORE™'],
    standards: ['ISO 5011', 'ISO 16889', 'SAE J1858'],
    systems: ['Air Intake Protection', 'Lubrication Protection', 'Fuel Cleanliness Protection', 'Cabin Air Protection'],
    sections: [
      {
        heading: 'Modern Diesel Engine Contamination',
        body: 'Modern Euro VI/EPA EPA2010 diesel engines use EGR (exhaust gas recirculation) and DPF (diesel particulate filter) aftertreatment systems that introduce new contamination modes. EGR recirculates soot-laden exhaust into the intake manifold, depositing carbon soot in the engine oil at rates of 1–5% by mass. DPF regeneration uses post-injection fuel to burn accumulated soot — residual unburned fuel dilutes the lube oil, reducing viscosity and accelerating oxidation.',
      },
      {
        heading: 'Extended Drain Programs',
        body: 'Fleet operators pursue extended drain intervals to reduce per-vehicle maintenance costs. SYNTRAX™ elements support extended intervals by providing higher dirt holding capacity versus cellulose elements. However, interval extension requires oil analysis monitoring — filter capacity and oil condition must be evaluated together. Blind interval extension without monitoring risks bearing wear from degraded oil.',
      },
    ],
  },
  marine: {
    slug: 'marine',
    contaminationEnvironment: 'Medium-High — saltwater intrusion, marine diesel water contamination from tank condensation and fuel transfer, microbial growth in fuel tanks, IMO compliance requirements for vessel systems.',
    primaryRisks: [
      'Fuel water contamination — microbial growth, corrosion, injector damage',
      'Saltwater intrusion into engine and hydraulic systems',
      'IMO compliance for vessel filtration systems',
      'Corrosion of metallic filter components from salt atmosphere',
    ],
    serviceIntervalNote: 'Fuel filter and water separator: monitor water sump at each refueling; replace per restriction or manufacturer interval. Lube oil: extended intervals with oil analysis typical for main propulsion engines.',
    keyMetrics: [
      { label: 'Fuel water contamination risk', value: 'HIGH — condensation in marine tanks' },
      { label: 'IMO compliance', value: 'Required for international voyages' },
      { label: 'MARINECLEAN™', value: 'IMO-certified ecosystem' },
    ],
    technologies: ['SYNTEPORE™', 'HYDROCORE™', 'SYNTRAX™', 'NANOFORCE™', 'MICROKAPPA™'],
    standards: ['ISO 12937', 'ASTM D6304', 'ISO 16889', 'ISO 4406'],
    systems: ['Fuel Cleanliness Protection', 'Lubrication Protection', 'Hydraulic Protection'],
    sections: [
      {
        heading: 'Marine Fuel Contamination',
        body: 'Marine fuel tanks are particularly susceptible to water contamination due to large tank volumes with significant atmospheric breathing, long dwell times between fuel consumption cycles, and temperature differentials between sea temperature and ambient air that drive condensation. Microbial growth at the water/fuel interface can produce biomass that blocks filters within days under warm conditions.',
      },
      {
        heading: 'IMO Compliance and MARINECLEAN™',
        body: 'Vessels operating on international routes must comply with International Maritime Organization (IMO) requirements for environmental protection — including fuel treatment standards and bilge water treatment. The MARINECLEAN™ ecosystem provides IMO-certified filtration solutions for marine diesel and hydraulic systems. Reference Technical Doctrine for MARINECLEAN™ commercial program details.',
      },
    ],
  },
  'oil-gas': {
    slug: 'oil-gas',
    contaminationEnvironment: 'High — drilling fluid, barite dust, H₂S sour gas, produced water, sand and formation particles in upstream operations; refinery process contamination in downstream applications.',
    primaryRisks: [
      'Drilling fluid (mud) contamination of air intake systems',
      'H₂S sour gas requiring FKM elastomer seal material',
      'Compressed air quality for instrument air and control systems',
      'Produced water and sand in fluid handling systems',
    ],
    serviceIntervalNote: 'Drilling environment air filters: 100–300 hours depending on drilling activity. Instrument air: continuous monitoring per ISO 8573-1. Well completion fluid service as required.',
    keyMetrics: [
      { label: 'Seal material requirement', value: 'FKM (Viton) for H₂S service' },
      { label: 'Instrument air class', value: 'ISO 8573-1 Class 1:4:1' },
      { label: 'Drilling dust type', value: 'Barite, silica, formation minerals' },
    ],
    technologies: ['MACROCORE™', 'DRYCORE™', 'SYNTRAX™', 'NANOFORCE™', 'SYNTEPORE™', 'HYDROCORE™'],
    standards: ['ISO 5011', 'ISO 8573-1', 'ISO 16889', 'ISO 4406'],
    systems: ['Air Intake Protection', 'Lubrication Protection', 'Hydraulic Protection', 'Fuel Cleanliness Protection'],
    sections: [
      {
        heading: 'Drilling Environment',
        body: 'Active drilling operations generate airborne barite (BaSO₄) and formation dust in concentrations that rapidly saturate primary air filters. Rig engines powering drill strings and mud pumps require frequent air filter service during active drilling phases. H₂S service requires FKM (Viton) elastomers for all seals — standard NBR degrades rapidly in sour gas environments.',
      },
      {
        heading: 'Instrument Air Quality',
        body: 'Process control instrumentation and pneumatic valve actuators in upstream and refinery applications require instrument-grade compressed air per ISO 8573-1. Contaminated instrument air causes instrument calibration drift, valve actuator stiction, and positioner failure — contributing to process upsets. DRYCORE™ multi-stage systems achieve Class 1:4:1 for precision instrument air applications.',
      },
    ],
  },
  manufacturing: {
    slug: 'manufacturing',
    contaminationEnvironment: 'Low-Medium — metalworking fluid mist, grinding dust, machining particulate; precision manufacturing requires ISO 8573-1 Class 1 compressed air; hydraulic servo valve protection critical for CNC accuracy.',
    primaryRisks: [
      'Compressed air contamination affecting pneumatic actuators and instruments',
      'Hydraulic servo valve stiction in CNC equipment',
      'Metalworking fluid mist in machining environments',
    ],
    serviceIntervalNote: 'Compressed air filtration: continuous monitoring per ISO 8573-1; element replacement per restriction or contamination breakthrough. Hydraulic: 1,000–2,000 hours for industrial equipment.',
    keyMetrics: [
      { label: 'Compressed air class required', value: 'ISO 8573-1 Class 1:4:1' },
      { label: 'Hydraulic cleanliness target', value: 'ISO 15/13/10 for servo valves' },
      { label: 'CNC hydraulic sensitivity', value: 'Sub-5 µm particle damage' },
    ],
    technologies: ['DRYCORE™', 'NANOFORCE™', 'SYNTRAX™'],
    standards: ['ISO 8573-1', 'ISO 16889', 'ISO 4406'],
    systems: ['Hydraulic Protection', 'Lubrication Protection'],
    sections: [
      {
        heading: 'Precision Manufacturing Requirements',
        body: 'CNC machining centers, coordinate measuring machines, and industrial robots use hydraulic servo systems with clearances as small as 2–5 µm. At these tolerances, particles passing through conventional filters can cause servo position errors, hysteresis, and axis hunting. ISO 4406 15/13/10 target requires NANOFORCE™ precision-grade elements (β₄(c) ≥1000) and commissioning flush procedures.',
      },
      {
        heading: 'Compressed Air Quality',
        body: 'Pneumatic assembly tools, spray painting, pharmaceutical packaging, and food processing all require different compressed air purity classes per ISO 8573-1. DRYCORE™ multi-stage systems are configured for each application class. Class 1:4:1 (food/pharma) requires sub-0.1 mg/m³ particle concentration, pressure dewpoint ≤+3°C, and oil concentration ≤0.01 mg/m³.',
      },
    ],
  },
  'power-generation': {
    slug: 'power-generation',
    contaminationEnvironment: 'Medium-High — coastal installations face salt aerosol ingress into turbine air intake; diesel gensets face standard fuel and lube contamination; continuous operation requirements make unplanned shutdowns extremely costly.',
    primaryRisks: [
      'Turbine inlet fouling from salt aerosol (coastal)',
      'Standby fuel polishing for emergency diesel gensets',
      'Lube oil contamination in continuous-operation gensets',
      'Air intake reliability for gas turbine performance',
    ],
    serviceIntervalNote: 'Gas turbine air filters: monitor pressure drop; pulse-cleaning systems extend intervals. Standby diesel lube filters: replace on calendar interval to maintain readiness; fuel polish per ISO 12937 water testing.',
    keyMetrics: [
      { label: 'Turbine air filter role', value: 'Direct impact on turbine efficiency' },
      { label: 'Standby diesel readiness', value: 'Fuel polishing required' },
      { label: 'Typical genset lube interval', value: '250–500 hrs or calendar' },
    ],
    technologies: ['MACROCORE™', 'SYNTRAX™', 'SYNTEPORE™', 'HYDROCORE™', 'THERMACORE™'],
    standards: ['ISO 5011', 'ISO 16889', 'SAE J1858', 'ISO 12937', 'ASTM D6304'],
    systems: ['Air Intake Protection', 'Lubrication Protection', 'Fuel Cleanliness Protection', 'Cooling System Protection'],
    sections: [
      {
        heading: 'Gas Turbine Air Intake',
        body: 'Gas turbine air filters must remove airborne contaminants without causing turbine inlet pressure drop above design limits — excessive restriction reduces compressor efficiency and turbine output. Coastal installations face salt aerosol that causes turbine blade erosion and compressor fouling. Self-cleaning pulse systems maintain air filters in service longer by periodically back-pulsing compressed air through the media to dislodge accumulated dust.',
      },
      {
        heading: 'Standby Diesel Readiness',
        body: 'Emergency diesel generators (hospital, data center, critical infrastructure) must start and reach full load within 10–30 seconds. Fuel stored in standby tanks accumulates water over months of thermal cycling and atmospheric breathing. HYDROCORE™ fuel polishing — circulating standby fuel through a water separator and fine filter at regular intervals — maintains fuel quality and ensures injector readiness without draining and refilling tanks.',
      },
    ],
  },
  railway: {
    slug: 'railway',
    contaminationEnvironment: 'Moderate — diesel soot from locomotive engines, brake dust from disc and tread brakes, traction motor bearing grease, tunnel environments (high soot concentration).',
    primaryRisks: [
      'Lube oil contamination from diesel soot accumulation',
      'Extended service intervals — maintenance windows are constrained by operating schedules',
      'Traction motor cooling air filtration (tunnel soot)',
      'Fleet standardization across heterogeneous locomotive classes',
    ],
    serviceIntervalNote: 'Locomotive air filter: 60–200 operating hours depending on route type (tunnel/surface). Lube oil: per oil analysis program, often extended intervals with synthetic media to reduce maintenance window frequency.',
    keyMetrics: [
      { label: 'Tunnel soot concentration', value: 'Elevated vs surface routes' },
      { label: 'Lube oil soot content (typical)', value: '1–3% by mass at change interval' },
      { label: 'Fleet standardization value', value: 'High — reduces parts complexity' },
    ],
    technologies: ['MACROCORE™', 'SYNTRAX™'],
    standards: ['ISO 5011', 'ISO 16889', 'SAE J1858'],
    systems: ['Air Intake Protection', 'Lubrication Protection'],
    sections: [
      {
        heading: 'Railway Contamination Profile',
        body: 'Diesel locomotives generate significant exhaust soot that recirculates into engine air intake systems. Tunnel operations concentrate soot in enclosed environments, reducing air filter service intervals substantially versus surface-only routes. Brake dust from wheel tread and disc brakes adds metallic particulate to the locomotive environment.',
      },
      {
        heading: 'Fleet Standardization',
        body: 'Rail fleet operators benefit significantly from standardized filtration across locomotive classes — reducing SKU complexity, enabling bulk purchasing, and simplifying maintenance technician training. ELIMFILTERS commercial doctrine classifies railway under HD (Heavy Duty) with allocation priority consistent with other high-value asset protection verticals.',
      },
    ],
  },
  'waste-municipal': {
    slug: 'waste-municipal',
    contaminationEnvironment: 'High — extreme duty cycles (stop-start, high PTO hours), organic decomposition dust and bioaerosols, hydraulic contamination from high-cycle refuse compaction circuits, water contamination in all fluid systems.',
    primaryRisks: [
      'Hydraulic compaction circuit contamination from extreme duty cycles',
      'Air intake organic dust and bioaerosol exposure',
      'Engine oil contamination from short-trip, high-idle operations',
      'Operator health — bioaerosol and organic dust exposure',
    ],
    serviceIntervalNote: 'Air filter: 100–250 hours due to high organic dust and stop-start operation. Hydraulic: 500–1,000 hours with attention to compaction circuit pressure spikes. Lube oil: per oil analysis — stop-start duty cycles accelerate oil degradation.',
    keyMetrics: [
      { label: 'Duty cycle classification', value: 'Extreme — continuous stop-start' },
      { label: 'Hydraulic circuit demand', value: 'HIGH — compaction at 250+ bar' },
      { label: 'Organic dust classification', value: 'Bioaerosol risk' },
    ],
    technologies: ['MACROCORE™', 'NANOFORCE™', 'SYNTRAX™', 'MICROKAPPA™'],
    standards: ['ISO 5011', 'ISO 4406', 'ISO 16889'],
    systems: ['Air Intake Protection', 'Hydraulic Protection', 'Lubrication Protection', 'Cabin Air Protection'],
    sections: [
      {
        heading: 'Refuse Collection Duty Cycle',
        body: 'Refuse collection vehicles operate with extreme stop-start duty cycles — a typical route involves 100–200 stops per shift with engine idle periods, PTO operation for compaction at 250+ bar, and full engine load during transit. This duty cycle accelerates oil oxidation (high idle periods), lube oil contamination (short trip condensation), and hydraulic component wear (high-cycle compaction circuits).',
      },
      {
        heading: 'Bioaerosol and Organic Dust',
        body: 'Refuse handling generates bioaerosols — airborne viable microorganisms, fungal spores, and endotoxins — from decomposing organic waste. Operator cabin filtration (MICROKAPPA™) addresses both particulate and biological exposure. Pending Engineering Documentation: specific bioaerosol quantification and relevant occupational exposure standards for municipal waste sector are not yet documented in the ELIMFILTERS Technical Doctrine.',
      },
    ],
  },
};

// ─── ADDITIONAL STANDARDS (deprecated — merged into KC_STANDARDS above) ────────

const KC_STANDARDS_ADDITIONAL_DEPRECATED: KCStandard[] = [
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
        body: 'ISO 8573-1 specifies compressed air purity using three independent class numbers in the format X:Y:Z — where X is the particle class (1–9 or 0), Y is the water class (1–9 or 0), and Z is the oil class (1–4 or 0). Lower numbers represent higher purity. Class 1:4:1 — achievable with DRYCORE™ multi-stage filtration — represents particle concentration <0.1 mg/m³ at ≥0.5 µm, pressure dewpoint ≤+3°C, and total oil <0.01 mg/m³. Class 0 (highest purity) is application-specific and defined by the equipment supplier and end user.',
      },
      {
        heading: 'Application Requirements',
        body: 'Typical application requirements: pneumatic general service Class 5:4:3; instrument air Class 2:4:1; food contact Class 1:2:1; pharmaceutical filling Class 1:2:1. ISO 8573-1 is used in conjunction with ISO 8573-2 (particle measurement), ISO 8573-3 (humidity and water measurement), ISO 8573-4 (solid particle content), and ISO 12500 (coalescing filter test). DRYCORE™ compressed air systems are designed and certified against ISO 8573-1 class requirements.',
      },
    ],
    keyParams: [
      { label: 'Format', value: 'Particle:Water:Oil class numbers' },
      { label: 'Instrument air minimum', value: 'Class 2:4:1' },
      { label: 'DRYCORE™ achievable', value: 'Class 1:4:1' },
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
        body: 'SAE J1539 establishes standardized test conditions for evaluating air cleaner assemblies installed on heavy-duty diesel engines. Key parameters include airflow rate (matched to engine displacement and rated speed), test dust specification (ISO fine or coarse test dust per SAE J726), restriction measurement method, and efficiency calculation basis. The test enables comparison of air cleaner performance across different configurations under controlled conditions.',
      },
      {
        heading: 'Relationship to ISO 5011',
        body: 'SAE J1539 and ISO 5011 address similar test objectives — air cleaner performance evaluation. ISO 5011 is the international standard widely used in European and international specifications. SAE J1539 is referenced in North American heavy-duty engine applications. MACROCORE™ elements are tested and characterized against both standards to provide performance documentation for global equipment OEM specifications.',
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
    metaDescription: 'ISO 12937 defines the Karl Fischer coulometric titration method for determining water content in petroleum products, establishing the analytical basis for diesel fuel water contamination assessment.',
    scope: 'Determination of water content in petroleum products with water content between 5 mg/kg and 2,000 mg/kg using coulometric Karl Fischer titration.',
    year: '2000',
    sections: [
      {
        heading: 'Karl Fischer Titration Principle',
        body: 'ISO 12937 uses coulometric Karl Fischer titration to quantitatively determine water content in petroleum products. In coulometric titration, iodine is electrochemically generated at an anode; iodine reacts stoichiometrically with water in the Karl Fischer reaction. The amount of charge required to generate sufficient iodine to consume all water in the sample is proportional to water content. The method is accurate to ±5 ppm at concentrations below 200 ppm — the threshold relevant for HPCR injector protection.',
      },
      {
        heading: 'HPCR Fuel Quality Target',
        body: 'High-pressure common rail injectors require fuel water content below 200 ppm to prevent injector seat corrosion and micro-pitting. ISO 12937 is the analytical method used to verify that treated fuel meets this target. Water above 500 ppm causes visible free water phases that interfere with fuel metering. Verification using ISO 12937 is performed at fuel depot acceptance, during storage monitoring, and as part of commissioning flush verification for marine vessels.',
      },
    ],
    keyParams: [
      { label: 'Measurement range', value: '5–2,000 mg/kg (ppm)' },
      { label: 'Analytical accuracy', value: '±5 ppm at low concentrations' },
      { label: 'HPCR protection threshold', value: '<200 ppm' },
    ],
    relatedTopics: ['fluid-cleanliness', 'testing-and-validation'],
    relatedTechnologies: ['HYDROCORE™', 'SYNTEPORE™'],
  },
  {
    slug: 'nfpa-t2-14',
    code: 'NFPA T2.14',
    title: 'Hydraulic Fluid Power — Fluid Cleanliness Guidelines for Use of Industrial Hydraulic Equipment',
    metaDescription: 'NFPA T2.14 establishes minimum fluid cleanliness levels for hydraulic system components, defining ISO 4406 cleanliness requirements for pumps, valves, cylinders, and servo/proportional valve systems.',
    scope: 'Minimum fluid cleanliness requirements for industrial hydraulic equipment components, expressed as ISO 4406 cleanliness codes correlated to component type and sensitivity.',
    year: '2005',
    sections: [
      {
        heading: 'Component Sensitivity Classification',
        body: 'NFPA T2.14 classifies hydraulic components by cleanliness sensitivity based on internal clearances. Servo valves (clearance 2–5 µm): ISO 15/13/10 minimum. Proportional valves (5–10 µm clearance): ISO 16/14/11 minimum. Vane and piston pumps: ISO 18/16/13 minimum. Gear pumps and cylinders: ISO 19/17/14 minimum. These represent minimum targets — not system design targets. NANOFORCE™ system design targets exceed NFPA T2.14 minimums for sensitive proportional and servo valve systems.',
      },
      {
        heading: 'System Cleanliness vs Component Cleanliness',
        body: 'NFPA T2.14 minimum cleanliness levels are based on the most sensitive component in the system. If a system contains any proportional valve, the entire system fluid must meet ISO 16/14/11 minimum — not just the valve circuit. System design must account for ingress through breathers, cylinder rod seal wear, and maintenance-induced contamination at all service points.',
      },
    ],
    keyParams: [
      { label: 'Servo valve minimum', value: 'ISO 15/13/10' },
      { label: 'Proportional valve minimum', value: 'ISO 16/14/11' },
      { label: 'Gear pump minimum', value: 'ISO 19/17/14' },
    ],
    relatedTopics: ['contamination-control', 'fluid-cleanliness', 'testing-and-validation'],
    relatedTechnologies: ['NANOFORCE™'],
  },
  {
    slug: 'iso-11155-1',
    code: 'ISO 11155-1',
    title: 'Road Vehicles — Air Conditioning and Ventilation for the Passenger Compartment — Part 1: Vocabulary',
    metaDescription: 'ISO 11155-1 establishes terminology for road vehicle air conditioning and ventilation systems; Part 2 covers cabin air filter test methods relevant to operator health protection.',
    scope: 'Vocabulary and definitions for road vehicle air conditioning and ventilation systems; Part 2 defines cabin air filter test methodology for particulate and gas-phase filtration performance.',
    year: '2001',
    sections: [
      {
        heading: 'Cabin Air Filter Standards Framework',
        body: 'ISO 11155 comprises two parts: Part 1 (vocabulary) and Part 2 (test methods for cabin air filtration). ISO 11155-2 defines test procedures for measuring cabin air filter performance against particulate (dust) and gas-phase (activated carbon) contamination. For heavy equipment cabin applications, ISO 11155-2 provides the test framework while DIN 71220 provides complementary cabin filter quality classification. MICROKAPPA™ elements are characterized against ISO 11155-2 test methods for PM₂.₅ efficiency, initial pressure drop, and dust holding capacity.',
      },
      {
        heading: 'Heavy Equipment Application',
        body: 'ISO 11155 was developed for road vehicle passenger compartments, but the test methodology is applicable to heavy equipment operator cabs where the contamination environment is far more aggressive. In mining and construction cabs, ambient silica concentrations exceed 100× the OSHA PEL. Cabin air filters must maintain ≥95% PM₂.₅ efficiency throughout their service life — not just at the clean element condition.',
      },
    ],
    keyParams: [
      { label: 'Parts', value: 'Part 1: vocabulary; Part 2: test methods' },
      { label: 'Primary technology', value: 'MICROKAPPA™ (H13-class PM₂.₅ efficiency)' },
      { label: 'Application context', value: 'Road vehicles and heavy equipment cabs' },
    ],
    relatedTopics: ['filter-media-science', 'testing-and-validation'],
    relatedTechnologies: ['MICROKAPPA™'],
  },
  {
    slug: 'astm-d6304',
    code: 'ASTM D6304',
    title: 'Standard Test Method for Determination of Water in Petroleum Products, Lubricating Oils, and Additives by Coulometric Karl Fischer Titration',
    metaDescription: 'ASTM D6304 is the North American equivalent of ISO 12937, defining coulometric Karl Fischer titration for water content determination in petroleum products and lubricating oils.',
    scope: 'Water content determination in petroleum products, lubricating oils, and additives with water content from 10 ppm to 25,000 ppm using coulometric Karl Fischer titration.',
    year: '2007',
    sections: [
      {
        heading: 'ASTM vs ISO Relationship',
        body: 'ASTM D6304 and ISO 12937 both use coulometric Karl Fischer titration for water content determination and produce equivalent results. ASTM D6304 is referenced in North American specifications and by ASTM-citing engine and equipment manufacturers. ISO 12937 is used in European and international specifications. Both standards are acceptable for fuel quality verification against the <200 ppm water target for HPCR injector protection. HYDROCORE™ and SYNTEPORE™ performance is validated against both standards.',
      },
      {
        heading: 'Lubricating Oil Application',
        body: 'ASTM D6304 is also applicable to lubricating oil water content — important for detecting coolant leaks (water in oil above 0.1% indicates head gasket or liner leakage) and for monitoring oil condition in extended drain programs. Water in lube oil above 0.5% accelerates oil oxidation, promotes bacterial growth in biodegradable oils, and reduces oil film strength at bearing surfaces.',
      },
    ],
    keyParams: [
      { label: 'Measurement range', value: '10–25,000 ppm' },
      { label: 'Equivalent to', value: 'ISO 12937' },
      { label: 'Applications', value: 'Fuel and lubricating oil water analysis' },
    ],
    relatedTopics: ['fluid-cleanliness', 'testing-and-validation'],
    relatedTechnologies: ['HYDROCORE™', 'SYNTEPORE™'],
  },
];
