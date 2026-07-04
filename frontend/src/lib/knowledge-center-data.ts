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
    subtitle: 'Three Contamination Categories, ISO 4406 Target Setting, and System Design',
    metaDescription: 'Engineering framework for contamination control in industrial fluid systems: three contamination categories, critical 5–15 µm particle range, ISO 4406 target setting, ingress estimation, filtration system design, commissioning flushing, and ongoing monitoring.',
    category: 'Engineering',
    readTime: '12 min',
    intro: 'Contamination control is the systematic engineering discipline that keeps particle, water, and chemical concentrations within specified limits in industrial fluid systems. It begins with identifying contamination sources and quantifying ingress rates, then proceeds through cleanliness target selection, filtration system design, commissioning flushing, and continuous monitoring. Failing any one of these steps allows contamination to accumulate and accelerate component wear.',
    sections: [
      {
        heading: 'Three Contamination Categories',
        body: 'Industrial fluid contamination divides into three categories with distinct control strategies. Built-in contamination originates from manufacturing — machining chips, casting sand, pipe scale, elastomer flash, and assembly residues. A new hydraulic system without commissioning flush can present ISO 22/20/17 or worse before first operation. Ingress contamination enters during operation: airborne dust drawn past worn shaft seals or through breathers, water through condensation in vented reservoirs, and particles introduced during maintenance (contaminated fill equipment, open top fill points). Generated contamination is produced internally by wear, cavitation erosion, thermal degradation of fluid, and oxidation. Generated contamination is both a consequence of contamination already present and a cause of further wear. The three categories must be controlled in sequence: flush out built-in, seal against ingress, monitor generated.',
        callout: [
          { label: 'New hydraulic system (unflushed)', value: 'ISO 22/20/17 typical' },
          { label: 'Ingress primary pathway', value: 'Breathers and shaft seals' },
          { label: 'Generated particles indicate', value: 'Wear in progress' },
        ],
      },
      {
        heading: 'The Critical 5–15 µm Particle Range',
        body: 'Particle size distribution in contaminated fluid follows an inverse relationship: smaller particles are orders of magnitude more numerous than large ones. For every 100 µm particle, there are roughly 10,000 particles at 10 µm and 1,000,000 at 2 µm. The engineering significance of the 5–15 µm size range comes from its relationship to component running clearances: engine main bearings run at 5–15 µm clearance, gear teeth at 5–25 µm, servo valve spools at 1–4 µm, vane pump vane tips at 2–5 µm. Particles within the clearance range are not simply trapped — they are pulled through, abrading both surfaces and generating secondary wear debris. Particles substantially larger than the clearance are blocked at entry and cause relatively limited damage. ISO 4406 reports counts at ≥4 µm, ≥6 µm, and ≥14 µm precisely because this range encompasses the critical wear zone.',
        callout: [
          { label: 'Main bearing clearance', value: '5–15 µm' },
          { label: 'Servo valve spool clearance', value: '1–4 µm' },
          { label: 'ISO 4406 count sizes', value: '≥4 µm, ≥6 µm, ≥14 µm' },
        ],
      },
      {
        heading: 'ISO 4406 Target Setting',
        body: 'Target cleanliness codes are set by the most sensitive — lowest clearance — component in the fluid circuit. The three-number code (e.g., 16/14/11) reports particle count ranges at ≥4 µm, ≥6 µm, and ≥14 µm per millilitre. Each increment of one code unit doubles the particle count; two code units is a 4× change in contamination level. Representative target codes by component type: servo and proportional valves ISO 14/12/9 to 16/14/11; piston pumps and motors ISO 17/15/12; vane pumps ISO 17/15/12; gear pumps ISO 18/16/13; engine bearings ISO 16/14/11; gearboxes ISO 18/16/13. New oil from the drum typically presents at ISO 18/16/13 — it does not meet specification for sensitive circuits without additional filtration. Operating above the target code by two or more units (e.g., running at ISO 18/16/13 instead of ISO 16/14/11) reduces bearing life by approximately 50%.',
        callout: [
          { label: 'Servo valve target', value: 'ISO 14/12/9' },
          { label: 'Piston pump target', value: 'ISO 17/15/12' },
          { label: 'New drum oil typical', value: 'ISO 18/16/13' },
        ],
      },
      {
        heading: 'Ingress Points and Rate Estimation',
        body: 'Quantifying ingress rate allows the filtration system to be sized to maintain the target cleanliness code under steady-state operation. Ingress pathways and typical rates: reservoir breathers (unfiltered) at 10–50 mg/h depending on ambient dust and pressure cycling; shaft seals (worn lip seals) at 1–10 mg/h per seal; maintenance fill points (open buckets, contaminated nozzles) at 50–500 mg per fill event; cylinder rod seals (extended stroke) at 1–5 mg/h per cylinder. The sum of all ingress rates defines the contamination load the filtration system must equal or exceed in removal rate to maintain steady-state cleanliness. This analysis identifies which ingress points have the highest marginal impact — often breather replacement from open vent to 3 µm filter provides the highest contamination reduction per dollar spent.',
      },
      {
        heading: 'Filtration System Design',
        body: 'Filtration system design translates the contamination budget into filter specifications. The required Beta ratio at each particle size is derived from the target cleanliness code and steady-state ingress rate. The fundamental relationship is: C_downstream = C_upstream / β_x, where C is particle count at size x. For a hydraulic circuit targeting ISO 16/14/11 with a return-line filter, the filter Beta ratio must be sufficient to reduce fluid entering return from its contamination level to the target. High-efficiency return-line filters with β₁₀(c) ≥ 200 are standard for servo valve circuits. Offline kidney-loop circuits with high Beta ratios continuously polish fluid independent of system operation, particularly effective for removing sub-10 µm particles that return-line flow rates cannot capture efficiently. Filter area (pleat count × pleat height × pleat density) determines dirt holding capacity and therefore service interval — undersized filters load rapidly and may increase bypass events.',
        callout: [
          { label: 'Servo circuit return filter', value: 'β₁₀(c) ≥ 200' },
          { label: 'Kidney loop interval', value: 'Continuous offline polishing' },
          { label: 'Offline circuit flow', value: '5–15% of system volume/min' },
        ],
      },
      {
        heading: 'Commissioning Flush Protocol',
        body: 'Commissioning flush removes built-in contamination from new or rebuilt systems before first operation under load. Without flushing, machining residues and assembly contamination immediately load the system filters, cause early bypass events, and can score servo valve spools and pump surfaces before steady-state operation establishes. Flush procedure: fill system with flush fluid (same as operating fluid or compatible flush oil), install temporary bypass plates across sensitive components (servo valves, proportional valves), circulate at 1.5–2× operating flow for turbulent flushing effect, sample and analyse at 2-hour intervals, continue until two consecutive samples meet the target cleanliness code. For a typical hydraulic system, commissioning flush takes 4–16 hours. Temporary high-capacity return-line filters (10 µm absolute) during flush prevent system filter loading during the contaminant removal phase.',
        callout: [
          { label: 'Flush flow rate', value: '1.5–2× operating flow' },
          { label: 'Flush duration', value: '4–16 hours typical' },
          { label: 'Acceptance criterion', value: '2 consecutive samples at target code' },
        ],
      },
      {
        heading: 'Ongoing Monitoring',
        body: 'Ongoing contamination monitoring provides early warning of system degradation before it causes component failure. Oil sampling frequency: once per 250–500 hours for hydraulic systems; once per 250 hours for critical engine lube circuits; after any maintenance event or component change. Sampling point selection is critical — draw from turbulent zones in return lines or dedicated sampling valves, not from stagnant legs or the bottom of reservoirs. Use pre-cleaned sample bottles (ISO 14/12/11 or better) to prevent bottle contamination from biasing results. Trending is more informative than individual readings: a rising ISO code number over successive samples signals increasing ingress or failing filtration before the component reaches damage threshold. Elemental spectroscopy (ICP) on lube oil adds wear metal trending — rising iron indicates bearing or liner wear; rising silicon indicates dust ingress; rising copper indicates bearing overlay failure.',
      },
    ],
    keyMetrics: [
      { label: 'Critical wear particle range', value: '5–15 µm' },
      { label: 'Servo valve ISO target', value: '14/12/9' },
      { label: 'Commissioning flush time', value: '4–16 hours' },
      { label: 'Two code-unit degradation', value: '~50% bearing life reduction' },
    ],
    relatedStandards: ['ISO 4406', 'ISO 16889', 'ISO 11171'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™'],
    relatedSystems: ['Hydraulic Protection', 'Lubrication Protection'],
    keywords: ['contamination control', 'ISO 4406', 'particle size', 'cleanliness code', 'Beta ratio', 'commissioning flush', 'ingress control'],
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

  // ── Phase 4 Cornerstone Engineering References ────────────────────────────

  {
    slug: 'iso-16889',
    title: 'ISO 16889',
    subtitle: 'Multi-Pass Method for Evaluating Filter Element Performance',
    metaDescription: 'Complete technical reference for ISO 16889: multi-pass test circuit, ISO A2 test contaminant, ISO 11171 particle counter calibration, Beta ratio calculation, dirt holding capacity measurement, and filter performance specification.',
    category: 'Standards',
    readTime: '12 min',
    intro: 'ISO 16889 defines the multi-pass method for determining the filtration efficiency and dirt holding capacity of hydraulic filter elements. It is the international standard basis for Beta ratio specifications and the primary performance test referenced when specifying or comparing hydraulic and lube oil filter elements. Understanding its test circuit, contaminants, calibration requirements, and output metrics is prerequisite to correctly interpreting filter performance data.',
    sections: [
      {
        heading: 'Purpose and Scope',
        body: 'ISO 16889 establishes a single-element multi-pass test that simultaneously measures two independent performance parameters: filtration efficiency (expressed as Beta ratio, β) at multiple particle sizes, and dirt holding capacity (DHC, in grams) at terminal differential pressure. The standard applies to filter elements used in hydraulic fluid power systems and lube oil circuits. It does not apply to air filters (ISO 5011), fuel filters (ISO 16332), or coalescence filters. The "multi-pass" principle distinguishes this method from single-pass efficiency tests: test fluid is recirculated through the circuit, allowing particles that pass through the filter to accumulate in the downstream loop and contribute to downstream particle counts over time. This loading approach reflects realistic field conditions more accurately than single-pass lab tests and produces both efficiency data and DHC in one test run.',
      },
      {
        heading: 'Test Circuit Architecture',
        body: 'The ISO 16889 test circuit consists of an upstream injection loop and a downstream collection loop connected through the test filter element. The upstream reservoir contains test fluid conditioned to the specified ISO Viscosity Grade (typically ISO VG 15 mineral oil). A constant-displacement pump maintains the specified flow rate through the element. ISO A2 medium test dust is injected upstream at a controlled mass rate using a calibrated gravimetric feeder. Automatic particle counters (APC) sample upstream and downstream continuously. The test runs until terminal differential pressure is reached — defined as either 10× the initial clean differential pressure or 6 bar (whichever occurs first). All connections downstream of the test element are maintained at ISO 11/9/6 or better to prevent background contamination from masking downstream particle counts.',
        callout: [
          { label: 'Test fluid', value: 'ISO VG 15 mineral oil' },
          { label: 'Test temperature', value: '50°C ± 2°C' },
          { label: 'Terminal ΔP definition', value: '10× initial ΔP or 6 bar' },
        ],
      },
      {
        heading: 'Test Contaminant: ISO 12103-1 A2 Medium',
        body: 'ISO 16889 specifies ISO 12103-1 A2 medium test dust as the standard contaminant. This synthetic dust replicates the composition and size distribution of atmospheric dust: approximately 68% silicon dioxide (quartz), 14% aluminum oxide, 8% iron oxide, 3% calcium oxide, and trace amounts of magnesium oxide and other oxides. Particle size distribution spans 0.5 to 180 µm with the median diameter (D50) near 10 µm. The controlled composition and size distribution allows reproducible test results across different laboratories and test dates, provided the dust lot is from a certified supplier and stored according to specification (sealed, dry, ≤25°C). Using different dust — including field-collected soil — invalidates comparison with published ISO 16889 data.',
        callout: [
          { label: 'Dust composition', value: '~68% SiO₂, ~14% Al₂O₃' },
          { label: 'Particle size range', value: '0.5–180 µm' },
          { label: 'Median diameter (D50)', value: '~10 µm' },
        ],
      },
      {
        heading: 'Particle Counting and ISO 11171 Calibration',
        body: 'Particle counts upstream and downstream must be measured with automatic particle counters (APC) calibrated according to ISO 11171. This calibration standard uses NIST-traceable primary reference particles to establish the relationship between particle size and light obscuration signal in the specific instrument. ISO 11171 calibration replaced the older AC fine dust calibration method for particle counters in 2000. Data generated with the old calibration is denoted β₁₀ (without suffix); data generated with ISO 11171-calibrated counters is denoted β₁₀(c). These two values are not numerically equivalent: a filter with β₁₀ = 75 by the old method may yield β₁₀(c) = 10–12 by the current calibration — a substantial difference in reported efficiency. All current ISO 16889 data must specify β(c). When comparing datasheets from different manufacturers or different dates, verify the calibration basis before drawing performance conclusions.',
        callout: [
          { label: 'Current calibration standard', value: 'ISO 11171 (NIST-traceable)' },
          { label: 'Old notation', value: 'β₁₀ (AC fine dust cal.)' },
          { label: 'Current notation', value: 'β₁₀(c) (ISO 11171 cal.)' },
        ],
      },
      {
        heading: 'Calculating Beta Ratio',
        body: 'Beta ratio at a given particle size x is defined as: β_x(c) = N_upstream(≥x) / N_downstream(≥x), where N is the cumulative particle count per millilitre at or above size x. Both counts are time-averaged over the same sample interval during the test run. For example, if upstream counts 2,000 particles ≥10 µm/mL and downstream counts 10 particles ≥10 µm/mL, then β₁₀(c) = 200. Efficiency is derived from Beta ratio: E(%) = (1 − 1/β) × 100. β₁₀(c) = 200 → E = (1 − 1/200) × 100 = 99.5%. β₁₀(c) = 1,000 → E = 99.9%. The relationship is non-linear at high Beta values — improving from β = 100 to β = 200 doubles particle rejection, but improving from β = 1,000 to β = 2,000 only halves an already very small penetration fraction.',
        callout: [
          { label: 'β₁₀(c) = 75 efficiency', value: '98.7%' },
          { label: 'β₁₀(c) = 200 efficiency', value: '99.5%' },
          { label: 'β₁₀(c) = 1000 efficiency', value: '99.9%' },
        ],
      },
      {
        heading: 'Dirt Holding Capacity',
        body: 'Dirt holding capacity (DHC) is measured as the total mass of ISO A2 medium test dust injected from the start of the test until terminal differential pressure is reached. DHC is expressed in grams and reported at the specific test flow rate and fluid conditions. DHC is not a fixed material property — it is a function of flow rate (face velocity), fluid viscosity, and dust concentration. A filter element tested at higher flow rate will exhibit a lower DHC in grams because higher face velocity compresses the dust cake more rapidly and the differential pressure rises faster. DHC data is therefore only directly comparable when the test conditions (flow rate, fluid, dust concentration) match. For field service life prediction, DHC must be combined with a site-specific dust concentration measurement to estimate hours to service.',
        callout: [
          { label: 'DHC unit', value: 'Grams of ISO A2 medium dust' },
          { label: 'DHC dependency', value: 'Flow rate, viscosity, dust concentration' },
          { label: 'Field life formula', value: 'Hours = DHC(g) / dust ingress (g/h)' },
        ],
      },
      {
        heading: 'Interpreting and Specifying Filter Performance',
        body: 'A complete ISO 16889 performance specification for a filter element includes: the particle size at which Beta is specified (e.g., 10 µm), the minimum Beta ratio at that size [e.g., β₁₀(c) ≥ 200], the minimum DHC at the specified test flow rate (e.g., DHC ≥ 150 g at 40 L/min), and the test conditions (ISO VG 15, 50°C, ISO A2 medium). When evaluating competitor or equivalent products, request full ISO 16889 test reports from accredited laboratories (ISO 17025), not marketing summary sheets. Verify the calibration notation (c suffix), the test flow rate matching your application, and the dust concentration used. A filter may meet ISO 16889 requirements at a specified minimum Beta ratio with no upper guarantee — a β₁₀(c) minimum of 75 does not prevent the filter from achieving β₁₀(c) = 200 in practice, but the minimum is the contractual commitment.',
      },
    ],
    keyMetrics: [
      { label: 'Test fluid viscosity', value: 'ISO VG 15' },
      { label: 'Test temperature', value: '50°C ± 2°C' },
      { label: 'Terminal ΔP', value: '10× initial ΔP or 6 bar' },
      { label: 'Test contaminant', value: 'ISO 12103-1 A2 medium' },
      { label: 'Calibration standard', value: 'ISO 11171' },
    ],
    relatedStandards: ['ISO 16889', 'ISO 11171', 'ISO 4406'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™'],
    relatedSystems: ['Hydraulic Protection', 'Lubrication Protection'],
    keywords: ['ISO 16889', 'multi-pass test', 'Beta ratio', 'dirt holding capacity', 'filter efficiency', 'ISO 11171', 'particle counting'],
  },

  {
    slug: 'iso-4406',
    title: 'ISO 4406',
    subtitle: 'Hydraulic Fluid Power — Method for Coding the Level of Contamination by Solid Particles',
    metaDescription: 'Technical reference for ISO 4406: three-number cleanliness code, particle count ranges, significance of each size threshold, target codes by component type, wear-cleanliness correlation, sampling protocols, and comparison with NAS 1638.',
    category: 'Standards',
    readTime: '10 min',
    intro: 'ISO 4406 provides a standardised coding system for expressing the level of solid particle contamination in hydraulic and lubricating fluids. The three-number code converts raw particle count data from automatic particle counters into a concise, comparable format used by system designers, maintenance engineers, and filter manufacturers to specify cleanliness targets and assess system condition.',
    sections: [
      {
        heading: 'The Three-Number Code',
        body: 'ISO 4406 assigns three code numbers separated by slashes, each representing a particle count range at one of three cumulative size thresholds: ≥4 µm(c), ≥6 µm(c), and ≥14 µm(c) per millilitre. The "(c)" suffix indicates that particle counts were obtained with a counter calibrated per ISO 11171 using NIST-traceable reference particles. A code of 17/15/12 means: the particle count at ≥4 µm falls in the range corresponding to code 17 (80,000–160,000 particles/mL), at ≥6 µm falls in the range for code 15 (20,000–40,000 particles/mL), and at ≥14 µm falls in the range for code 12 (2,500–5,000 particles/mL). The three thresholds were chosen to align with the critical wear zones of bearings and hydraulic components (4–6 µm range) and to capture the upper tail of the damage-causing particle distribution (≥14 µm).',
        callout: [
          { label: 'Size 1: ≥4 µm(c)', value: 'Total contamination indicator' },
          { label: 'Size 2: ≥6 µm(c)', value: 'Bearing clearance range' },
          { label: 'Size 3: ≥14 µm(c)', value: 'Larger particle indicator' },
        ],
      },
      {
        heading: 'Code-to-Count Conversion',
        body: 'Each ISO 4406 code number maps to a range of particle counts per millilitre. The code scale is logarithmic, base 2: each increment of one code unit doubles the upper count boundary. Code 14: 2,000–4,000 particles/mL. Code 15: 4,000–8,000. Code 16: 8,000–16,000. Code 17: 16,000–32,000. Code 18: 32,000–64,000. Code 19: 64,000–130,000. Code 20: 130,000–250,000. Code 21: 250,000–500,000. Code 22: 500,000–1,000,000. The implication for contamination management: improving from ISO 20 to ISO 16 at a given size reduces particle count by a factor of approximately 16 (four code-unit steps = 2⁴ = 16). Improving from ISO 16 to ISO 14 reduces by a further factor of 4.',
        callout: [
          { label: 'Code 14', value: '2,000–4,000 particles/mL' },
          { label: 'Code 17', value: '16,000–32,000 particles/mL' },
          { label: 'Code 20', value: '130,000–250,000 particles/mL' },
        ],
      },
      {
        heading: 'Significance of Each Size Threshold',
        body: 'The ≥4 µm(c) count (first code number) captures the total contamination load across the full critical size range and is the most sensitive indicator of filtration performance. Small particles in this range are the most numerous and most difficult to remove. The ≥6 µm(c) count (second number) targets the clearance range of most roller bearings (6–15 µm) and gear tooth faces. This is the most widely used single indicator of bearing protection adequacy. The ≥14 µm(c) count (third number) captures larger particles that can cause scoring of sliding surfaces and three-body abrasion in gear contacts. Particles in this range are more readily removed by standard 10 µm absolute filters and thus serve as a check on gross filtration failure rather than fine cleanliness. Systems with a third code number disproportionately high relative to the first two numbers (e.g., 16/15/14) may indicate filter bypass or a specific contamination source introducing coarse particles.',
      },
      {
        heading: 'Target Codes by Component Type',
        body: 'Cleanliness targets are determined by the component with the tightest clearance in the circuit. Published guidelines from ISO TR 10949 and OEM service data: servo valves and electrohydraulic proportional valves ISO 14/12/9 to 15/13/10; axial piston pumps and motors ISO 16/14/11 to 17/15/12; vane pumps ISO 16/14/11 to 17/15/12; gear pumps and motors ISO 18/16/13 to 19/17/14; hydraulic cylinders ISO 18/16/13; engine main and rod bearings ISO 16/14/11; camshaft bearings ISO 15/13/10; automatic transmissions ISO 17/15/12; industrial gearboxes ISO 17/15/12 to 18/16/13. New fluid from a sealed drum typically measures ISO 18/16/13 — adequate for gear pumps but not for servo valves or piston pumps without additional filtration.',
        callout: [
          { label: 'Servo valve', value: 'ISO 14/12/9' },
          { label: 'Piston pump/motor', value: 'ISO 17/15/12' },
          { label: 'Gear pump', value: 'ISO 19/17/14' },
        ],
      },
      {
        heading: 'Wear-Cleanliness Correlation',
        body: 'The relationship between cleanliness code and component life has been quantified through fleet studies and accelerated wear tests. A two-code-unit difference at ≥6 µm(c) corresponds approximately to a factor of 2 in bearing life under otherwise identical conditions. Maintaining ISO 16/14/11 instead of ISO 18/16/13 in an axial piston pump extends expected pump life by approximately 2–4×. Conversely, allowing cleanliness to degrade two code units below target accelerates wear proportionally. Servo valve sensitivity is higher: spool clearances of 1–3 µm mean that particles in the ≥4 µm range can cause spool stiction, flow gain changes, and hysteresis increase at code levels that cause no visible damage to gear pumps. ISO 4406 does not define cleanliness targets — it defines how to measure and report cleanliness. The targets come from component OEM specifications, ISO TR 10949, and system-specific analysis.',
      },
      {
        heading: 'Sampling Protocols',
        body: 'Oil sample quality is as important as particle counter accuracy. Correct sampling: (1) take representative samples from turbulent zones (return lines, not reservoir bottom or dead legs); (2) use ISO 11171-certified sample bottles, pre-cleaned to ISO 11/9/6 or better; (3) purge the sampling valve with 3–5 volumes before collecting the sample; (4) fill the bottle to 75–80% capacity to allow mixing but not aeration; (5) label immediately with machine ID, sample point, oil hours, and date. Common errors that invalidate results: using uncleaned bottles (adds 2–4 code units of contamination), sampling from stagnant points (underestimates circulating contamination), aeration of the sample from high-velocity sampling (breaks particles into artificial small counts). For trend analysis, samples must come from the same sampling point under identical operating conditions (temperature, flow rate, time since last change).',
        callout: [
          { label: 'Bottle cleanliness required', value: 'ISO 11/9/6 or better' },
          { label: 'Sampling from reservoir', value: 'NOT representative — avoid' },
          { label: 'Valve purge before sample', value: '3–5 valve volumes' },
        ],
      },
      {
        heading: 'ISO 4406 vs NAS 1638',
        body: 'NAS 1638 (National Aerospace Standard) is an older US standard for hydraulic fluid cleanliness. NAS 1638 uses a single code number (Class 0 to Class 12) based on particle counts in five size ranges: 5–15 µm, 15–25 µm, 25–50 µm, 50–100 µm, and ≥100 µm. The NAS class is determined by the worst-performing size range — one range above the class limit fails the entire sample. NAS 1638 uses particle counts per 100 mL; ISO 4406 uses counts per mL. NAS 1638 Class 8 corresponds approximately to ISO 16/14/11, but the mapping is imprecise because the size ranges and count thresholds do not align exactly. NAS 1638 was officially withdrawn in 2001 and replaced by ARP 598. ISO 4406 is the current international standard and should be used for new specifications. When converting existing NAS-specified systems, verify the conversion for each size range rather than applying a generic NAS-to-ISO offset table.',
        callout: [
          { label: 'NAS 1638 status', value: 'Withdrawn 2001, replaced by ARP 598' },
          { label: 'NAS 8 ≈ ISO', value: '16/14/11 (approximate, not exact)' },
          { label: 'Current standard', value: 'ISO 4406 (three-number code)' },
        ],
      },
    ],
    keyMetrics: [
      { label: 'Code unit = particle count change', value: '×2 per unit' },
      { label: 'Servo valve target', value: 'ISO 14/12/9' },
      { label: 'New drum oil typical', value: 'ISO 18/16/13' },
      { label: 'Sample bottle cleanliness', value: 'ISO 11/9/6 minimum' },
    ],
    relatedStandards: ['ISO 4406', 'ISO 16889', 'ISO 11171'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™'],
    relatedSystems: ['Hydraulic Protection', 'Lubrication Protection'],
    keywords: ['ISO 4406', 'cleanliness code', 'particle count', 'hydraulic cleanliness', 'NAS 1638', 'fluid contamination'],
  },

  {
    slug: 'iso-5011',
    title: 'ISO 5011',
    subtitle: 'Inlet Air Cleaning Equipment for Internal Combustion Engines — Performance Testing',
    metaDescription: 'Technical reference for ISO 5011: scope, test dust specification, initial efficiency measurement, restriction curves, dust holding capacity, fractional efficiency, safety element testing, and comparison with SAE J1539.',
    category: 'Standards',
    readTime: '10 min',
    intro: 'ISO 5011 defines performance test methods for inlet air cleaning equipment used with internal combustion engines and compressors. It establishes the test conditions, contaminants, measurement procedures, and reporting requirements for three key performance parameters: initial particle separation efficiency, restriction (differential pressure) as a function of dust load, and dust holding capacity. Filter elements for gasoline engines, diesel engines, turbocharged engines, and industrial compressors are all within scope.',
    sections: [
      {
        heading: 'Scope and Application',
        body: 'ISO 5011 applies to dry-type inlet air cleaning equipment: primary filter elements (paper, synthetic, or glass fiber media), safety/secondary elements, pre-cleaners, and complete air cleaner assemblies. Wet-type (oil bath) cleaners are excluded. The standard covers both initial and loaded efficiency, restriction development under continuous dust loading, and total mass of dust retained before terminal restriction. ISO 5011 does not define pass/fail cleanliness targets — it is a measurement protocol only. Cleanliness specifications and service limits are set by the engine manufacturer in their technical data. A common distinction: ISO 5011 is the European and international standard; SAE J1539 is the older US market standard. Both cover similar parameters but differ in test dust specification and some procedural details.',
      },
      {
        heading: 'Test Dust Specification',
        body: 'ISO 5011 uses ISO 12103-1 A2 fine test dust as the standard loading medium. This synthetic dust represents the fine mineral fraction of atmospheric dust with a controlled composition: approximately 68% SiO₂, 14% Al₂O₃, 8% Fe₂O₃, 3% CaO, and trace oxides. The particle size distribution spans 0 to 200 µm with a mass median diameter near 23 µm. Dust feed rate is expressed in grams per kilogram of air (g/kg air) or grams per cubic metre (g/m³). Test concentrations typically range from 1 to 10 g/m³ depending on the test protocol and intended application. The controlled dust allows direct comparison of restriction and DHC data between manufacturers, provided the test airflow, temperature, and humidity conditions are also matched.',
        callout: [
          { label: 'Test dust', value: 'ISO 12103-1 A2 fine' },
          { label: 'Dust composition', value: '~68% SiO₂, ~14% Al₂O₃' },
          { label: 'Particle size span', value: '0–200 µm' },
        ],
      },
      {
        heading: 'Initial Efficiency Measurement',
        body: 'Initial efficiency is measured on a clean element at the start of the test, before any dust loading. An isokinetic sampling probe upstream and a downstream probe draw simultaneous samples through optical particle counters or gravimetric samplers. Fractional efficiency — efficiency at each individual particle size — is measured using particle counters over the size range 0.5 to 80 µm. Penetration at each size = (downstream count / upstream count) × 100%. Initial efficiency is always higher than efficiency under partial load conditions for depth-filtration media (cellulose), where dust cake formation increases efficiency as the element loads. For surface-filtration media (membrane-type), initial and loaded efficiencies are more similar because surface capture dominates from first contact. ISO 5011 requires reporting fractional efficiency at minimum at 0.5, 1, 2, 3, 5, 7, 10, 20, 40, and 80 µm.',
        callout: [
          { label: 'Efficiency sizes reported', value: '0.5, 1, 2, 3, 5, 7, 10, 20, 40, 80 µm' },
          { label: 'Depth media efficiency trend', value: 'Increases with dust cake formation' },
          { label: 'Surface media efficiency', value: 'Stable from clean to loaded' },
        ],
      },
      {
        heading: 'Restriction Curve and ΔP Development',
        body: 'Restriction — the differential pressure across the filter element — is measured continuously throughout the test as dust accumulates. The restriction curve plots ΔP (in Pa or mbar) against cumulative dust mass fed (in grams). Initial restriction is the ΔP through a clean element at the test airflow. As dust accumulates, restriction rises. For cellulose media, restriction increases slowly at first (loose surface layer, low packing density) then accelerates as the dust cake compresses and blind-holes. Synthetic media exhibits different loading characteristics depending on fiber diameter and arrangement. Terminal restriction for ISO 5011 testing is typically defined as an absolute value set by agreement (commonly 2,500–4,000 Pa for primary elements, or the OEM service limit). DHC is the cumulative dust mass at terminal restriction.',
        callout: [
          { label: 'Restriction unit', value: 'Pa or mbar' },
          { label: 'Typical terminal restriction', value: '2,500–4,000 Pa (primary elements)' },
          { label: 'Clean restriction target', value: '<500 Pa at rated airflow' },
        ],
      },
      {
        heading: 'Dust Holding Capacity',
        body: 'Dust holding capacity (DHC) is the total mass of test dust retained in the filter element at terminal restriction, measured by weighing the element before and after the test. DHC is the primary indicator of service life potential: higher DHC at equivalent efficiency and restriction means longer intervals between element changes. DHC depends on element media area (total filtration area in cm²), media type and porosity, pleat geometry, and test face velocity. All else equal, doubling media area approximately doubles DHC. MACROCORE™ synthetic media achieves higher DHC than cellulose for equivalent media area because synthetic fibers have larger void fraction, accepting more dust before the cake seals. Field DHC application requires a site-specific dust concentration measurement: expected service life (hours) = DHC (grams) / (dust concentration g/m³ × airflow m³/h).',
        callout: [
          { label: 'DHC units', value: 'Grams of ISO A2 fine dust' },
          { label: 'Field life formula', value: 'DHC(g) / (conc. × airflow)' },
          { label: 'Media area doubles DHC by', value: '~2× (approximately linear)' },
        ],
      },
      {
        heading: 'Reading ISO 5011 Data Sheets',
        body: 'A valid ISO 5011 data sheet reports: (1) test airflow in m³/h or kg/h; (2) test temperature and humidity; (3) dust type (A2 fine or alternative); (4) dust concentration g/m³; (5) initial restriction in Pa at test airflow; (6) fractional efficiency curve or tabulated values at specified sizes; (7) terminal restriction definition used; (8) DHC in grams at terminal restriction; (9) overall initial gravimetric efficiency (total mass captured / total mass fed × 100%). Data sheets without the test airflow specification are unusable for comparison because restriction and DHC both depend on airflow. When comparing two elements, ensure the test airflow matches your application rated airflow — DHC data taken at 500 m³/h does not apply to an element installed in a 1,000 m³/h air cleaner.',
      },
      {
        heading: 'ISO 5011 vs SAE J1539',
        body: 'SAE J1539 (Air Cleaner Test Code — Engine Intake Air Cleaning Equipment) is the comparable US market standard. Key differences: ISO 5011 uses SI units throughout (Pa, m³/h, g/m³); SAE J1539 uses mixed US/SI units. ISO 5011 specifies ISO 12103-1 A2 fine dust; SAE J1539 specifies SAE fine and SAE coarse test dusts, which have different particle size distributions from ISO A2 fine. Efficiency measured with SAE coarse will be numerically higher than with ISO A2 fine because the coarser dust is easier to capture. ISO 5011 requires fractional efficiency measurement across the full size distribution; SAE J1539 historically focused on total gravimetric efficiency. Manufacturers serving global markets typically report ISO 5011 data; products targeted at North American OEMs often include SAE J1539 data. For cross-manufacturer comparison, verify the test protocol and dust type before drawing conclusions.',
        callout: [
          { label: 'ISO 5011 dust', value: 'ISO 12103-1 A2 fine' },
          { label: 'SAE J1539 dust', value: 'SAE fine or SAE coarse' },
          { label: 'Units', value: 'ISO 5011 = SI; J1539 = mixed' },
        ],
      },
    ],
    keyMetrics: [
      { label: 'Test dust', value: 'ISO 12103-1 A2 fine' },
      { label: 'Fractional efficiency sizes', value: '0.5–80 µm (10 points minimum)' },
      { label: 'Terminal restriction (typical)', value: '2,500–4,000 Pa' },
      { label: 'DHC unit', value: 'Grams at terminal restriction' },
    ],
    relatedStandards: ['ISO 5011', 'ISO 29463'],
    relatedTechnologies: ['MACROCORE™'],
    relatedSystems: ['Air Intake Protection'],
    keywords: ['ISO 5011', 'air filter test', 'dust holding capacity', 'inlet air cleaning', 'filter efficiency', 'SAE J1539', 'restriction curve'],
  },

  {
    slug: 'beta-ratio',
    title: 'Beta Ratio',
    subtitle: 'Filter Efficiency Metric — Definition, Measurement, and Application',
    metaDescription: 'Complete engineering reference for Beta ratio: definition, derivation from ISO 16889 multi-pass test, calibrated (c) notation, Beta-to-efficiency conversion, multi-point efficiency curves, system design application, and why nominal micron ratings are technically insufficient.',
    category: 'Engineering',
    readTime: '9 min',
    intro: 'Beta ratio (β) is the quantitative measure of filter element efficiency at a specified particle size. It is derived from ISO 16889 multi-pass testing and expresses the ratio of upstream to downstream particle concentrations at a given cumulative size threshold. Beta ratio, not nominal micron rating, is the engineering basis for filter selection in hydraulic and lube oil systems — it provides a traceable, calibrated, and reproducible measure of filtration performance.',
    sections: [
      {
        heading: 'Definition and Formula',
        body: 'Beta ratio at particle size x is defined as: β_x = N₁(≥x) / N₂(≥x), where N₁ is the upstream particle count per mL at size ≥x and N₂ is the downstream particle count per mL at the same size. The subscript notation β_x(c) indicates that counts were obtained with ISO 11171-calibrated automatic particle counters; the (c) suffix is mandatory for current-standard data and distinguishes it from pre-2000 results using AC fine dust calibration. A Beta ratio of 1 means no filtration (equal counts upstream and downstream). A Beta ratio of 200 at 10 µm means for every 200 particles ≥10 µm entering the filter, on average 1 exits downstream — 99.5% capture efficiency at that size. Beta ratio has no upper theoretical limit, though practical measurement becomes difficult above β = 10,000 because downstream counts approach the particle counter background noise floor.',
        callout: [
          { label: 'Formula', value: 'β_x = N₁(≥x) / N₂(≥x)' },
          { label: 'β_x = 1', value: 'No filtration (0% efficiency)' },
          { label: 'β_x = 200', value: '99.5% efficiency at size x' },
        ],
      },
      {
        heading: 'Derivation from ISO 16889 Multi-Pass Testing',
        body: 'Beta ratio data comes from ISO 16889 multi-pass testing, not from single-pass efficiency measurement. In the multi-pass circuit, particles that penetrate the filter remain in the test fluid circuit and accumulate in the downstream sampling zone. Upstream concentration is continuously elevated by injected test dust. The ratio of upstream to downstream counts is measured continuously and averaged over defined time intervals. This multi-pass approach reflects actual operating conditions where circulating fluid is repeatedly challenged by the same filter. The resulting Beta values are conservative relative to a single-pass test because recirculated penetrating particles add to downstream counts. ISO 16889 requires reporting Beta ratios at minimum at particle sizes 2, 5, 10, 15, 20, 25, and 30 µm(c) to enable construction of a fractional efficiency curve. Most filter specifications cite β₁₀(c) or β₁₂(c) as the primary performance indicator.',
      },
      {
        heading: 'The Calibrated (c) Notation',
        body: 'The "(c)" suffix in β₁₀(c) is not cosmetic — it indicates a specific and mandatory calibration of the particle counting instrument. ISO 11171 defines the calibration procedure using NIST-traceable reference particles certified by the National Institute of Standards and Technology. ISO 11171 calibration replaced AC fine dust calibration (the "old method") in 2000. The problem with the old calibration: AC fine dust particles of a given size were assigned to size bins differently than ISO 11171 reference particles because the optical properties differ. The result: the same physical filter measured β₁₀ = 200 with the old method and β₁₀(c) = 75 or lower with ISO 11171 calibration — the particle counter reports smaller sizes for the same physical particles. When comparing filter datasheets from different eras or manufacturers, the presence or absence of the (c) suffix is a critical qualifier. Mixing old β values with new β(c) values to compare filters is a systematic error that can understate the performance difference between products.',
        callout: [
          { label: 'Old notation (pre-2000)', value: 'β₁₀ (AC fine dust calibration)' },
          { label: 'Current notation', value: 'β₁₀(c) (ISO 11171 calibration)' },
          { label: 'Approx. relationship', value: 'β₁₀ = 200 old ≈ β₁₀(c) = 75–100 new' },
        ],
      },
      {
        heading: 'Beta-to-Efficiency Conversion',
        body: 'Filtration efficiency E (%) at size x is derived directly from Beta ratio: E(%) = (1 − 1/β_x) × 100 = (β_x − 1) / β_x × 100. This relationship is strictly monotonic — higher Beta always means higher efficiency, with diminishing returns at very high Beta values. Practical Beta values and their efficiencies: β₆(c) = 10 → E = 90.0%; β₁₀(c) = 75 → E = 98.7%; β₁₀(c) = 200 → E = 99.5%; β₁₀(c) = 1,000 → E = 99.9%; β₁₀(c) = 5,000 → E = 99.98%. The engineering significance of this curve: moving from β = 10 to β = 75 (a 7.5× Beta improvement) delivers a 8.7 percentage point efficiency gain. Moving from β = 1,000 to β = 5,000 (a 5× Beta improvement) delivers only 0.08 percentage points. For contamination-sensitive systems (servo valves, piston pumps), the difference between β₁₀(c) = 75 and β₁₀(c) = 200 is meaningful — penetration drops from 1.33% to 0.5%, a 2.7× reduction in particles escaping downstream per unit time.',
        callout: [
          { label: 'β₁₀(c) = 10 efficiency', value: '90.0%' },
          { label: 'β₁₀(c) = 75 efficiency', value: '98.7%' },
          { label: 'β₁₀(c) = 200 efficiency', value: '99.5%' },
        ],
      },
      {
        heading: 'Multi-Point Efficiency Curves',
        body: 'A single Beta value (e.g., β₁₀(c) = 200) describes efficiency at one particle size only. A complete filter specification includes a multi-point efficiency curve — Beta ratio across the full range of particle sizes. The curve typically follows a sigmoid shape when plotted on a linear size axis: low efficiency at very small sizes (below the effective capture range of the media), rising steeply through the media\'s characteristic capture size, and approaching asymptotically high efficiency at large sizes. The "x" in β_x(c) where efficiency transitions from below 50% to above 99% is sometimes informally called the "absolute" rating — though this term is not defined in ISO 16889. Multi-point curves matter when the system contains components sensitive to different particle sizes: a servo valve sensitive to ≥3 µm particles requires β₃(c) to be specified alongside β₁₀(c).',
      },
      {
        heading: 'System Design Application',
        body: 'Beta ratio is the design input for calculating achievable system cleanliness under specified ingress and filtration conditions. The steady-state cleanliness of a fluid system can be estimated from the contamination balance: C_system = C_ingress × V_system / (β_x × Q_filter × t), where V_system is reservoir volume, Q_filter is filter flow rate, and t is residence time. Selecting the required β_x to achieve a target ISO 4406 cleanliness code involves solving for β given known ingress rate (particles/mL/h) and system volume. For a hydraulic system targeting ISO 16/14/11 with a 500 L reservoir and 100 L/min filter flow, maintaining code requires β₁₀(c) ≥ 75 for moderate ingress and β₁₀(c) ≥ 200 for high-ingress applications (outdoor equipment with worn seals). This calculation demonstrates that Beta ratio selection is system-specific — the same filter element may be adequate in one installation and insufficient in another depending on ingress rate and system volume.',
        callout: [
          { label: 'Low ingress (office equip.)', value: 'β₁₀(c) ≥ 10–25 typically adequate' },
          { label: 'Moderate ingress (mobile equip.)', value: 'β₁₀(c) ≥ 75 typically required' },
          { label: 'High ingress (mining/outdoor)', value: 'β₁₀(c) ≥ 200 recommended' },
        ],
      },
      {
        heading: 'Why Nominal Micron Ratings Are Insufficient',
        body: 'Nominal micron rating — a single number such as "10 micron nominal" — was the historical shorthand for filter performance but carries no standardized definition. Different manufacturers define "nominal" differently: some at 50% efficiency, some at 90% efficiency, some at 98% efficiency at the rated size. A "10 micron nominal" filter from one manufacturer may remove 50% of 10 µm particles; another may remove 95% — both are technically compliant with their own definition of "nominal." This ambiguity makes nominal micron ratings useless for engineering comparisons. Absolute micron rating fares slightly better but still lacks a standardized efficiency threshold — "10 micron absolute" conventionally implies ≥99.5% efficiency at 10 µm, corresponding to β₁₀ ≥ 200, but this is not ISO-defined. Only β_x(c) from ISO 16889 testing provides a standardized, reproducible, instrument-calibrated efficiency value that supports engineering design calculations. When specifying or procuring hydraulic or lube filters, nominal micron rating should be replaced with the ISO 16889 Beta ratio specification at the relevant particle size.',
      },
    ],
    keyMetrics: [
      { label: 'Beta ratio formula', value: 'β_x = N₁(≥x) / N₂(≥x)' },
      { label: 'β₁₀(c) = 200 efficiency', value: '99.5%' },
      { label: 'Test method', value: 'ISO 16889 multi-pass' },
      { label: 'Calibration standard', value: 'ISO 11171 (current); AC fine (legacy)' },
    ],
    relatedStandards: ['ISO 16889', 'ISO 11171', 'ISO 4406'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™'],
    relatedSystems: ['Hydraulic Protection', 'Lubrication Protection'],
    keywords: ['Beta ratio', 'filter efficiency', 'ISO 16889', 'particle counting', 'nominal micron rating', 'multi-pass test', 'ISO 11171'],
  },

  {
    slug: 'hydraulic-contamination-sensitivity',
    title: 'Hydraulic Contamination Sensitivity',
    subtitle: 'Component Clearances, Failure Mechanisms, and Cleanliness Requirements',
    metaDescription: 'Engineering analysis of how hydraulic component clearances determine contamination sensitivity: servo valve silting, piston pump wear, gear pump abrasion, and why ISO 4406 target codes are set by the most sensitive component in the circuit.',
    category: 'Engineering',
    readTime: '11 min',
    intro: 'Hydraulic systems fail from contamination through two distinct mechanisms: abrasive wear (particles erode precision surfaces) and silting (fine particles pack into close-clearance annuli, causing valve stiction). The sensitivity of a hydraulic component to contamination is a direct function of its internal clearances — components with tighter clearances fail first and set the cleanliness target for the entire circuit.',
    sections: [
      {
        heading: 'Component Clearances and Contamination Sensitivity',
        body: 'Hydraulic component running clearances determine which particle sizes cause damage. Servo valve spool-to-bore clearances: 1–3 µm. Proportional valve spool clearances: 3–8 µm. Axial piston pump slipper-to-swashplate clearances: 5–10 µm; cylinder bore-to-piston clearances: 5–13 µm. Vane pump tip-to-ring clearances: 2–5 µm. Gear pump gear-to-housing radial clearances: 0.5–5 µm depending on grade. Hydraulic motor cylinder port plate: 5–15 µm. Particles within or slightly below the clearance size cause the most damage — they are small enough to enter the clearance but too large to pass freely, generating two-body abrasion on both surfaces with each pass. Particles substantially larger than the clearance bridge across and cause localised scoring; particles much smaller than the clearance pass through without contact.',
        callout: [
          { label: 'Servo valve spool clearance', value: '1–3 µm' },
          { label: 'Axial piston pump clearance', value: '5–13 µm' },
          { label: 'Gear pump tip clearance', value: '0.5–5 µm' },
        ],
      },
      {
        heading: 'Abrasive Wear Mechanisms',
        body: 'Three abrasive wear modes operate simultaneously in contaminated hydraulic systems. Two-body abrasion: a hard particle embedded in or trapped against one surface cuts the opposing surface as they move relative to each other, producing long ribbon-like wear debris. Three-body abrasion: a free-rolling hard particle (silica, alumina) between two surfaces acts as a micro-cutting wheel, removing material from both — this mode dominates at moderate contamination levels and is responsible for the majority of progressive hydraulic component wear. Adhesive wear: metal-to-metal contact under high load removes material from the softer surface; contamination accelerates adhesive wear by preventing hydrodynamic films from forming in bearing areas. Abrasive wear rate is not linear with contamination — at cleanliness levels above ISO 21/19/16, the abrasive particle count is high enough to dominate hydrodynamic film formation and wear rates increase sharply.',
      },
      {
        heading: 'Servo Valve Silting',
        body: 'Silting is distinct from abrasive wear: fine particles (typically ≤5 µm) accumulate in the annular clearance between a servo valve spool and its bore, building a compacted layer that increases the force required to move the spool. Silting does not immediately destroy the valve — it degrades performance by increasing threshold (deadband), hysteresis, and null shift. A silted servo valve may command 2 mA but not respond until 4–6 mA — a 100–200% increase in threshold — while appearing externally undamaged. Silting reverses partially when system operation causes flow velocity through the clearance to flush the accumulated particles, but a silted valve that has been stationary (standby mode) requires high drive current to break out. Preventing silting requires maintaining ISO 16/14/11 or better (≤320 particles ≥6 µm/mL) in servo valve circuits — the fine particle count at ≥4 µm is the most predictive single number for silting risk.',
        callout: [
          { label: 'Silting particle size', value: '≤5 µm (accumulate in clearance)' },
          { label: 'Silting effect', value: 'Increased threshold, hysteresis, null shift' },
          { label: 'Servo valve target to prevent', value: 'ISO 16/14/11 or better' },
        ],
      },
      {
        heading: 'Contamination Sensitivity Classification',
        body: 'ISO TR 10949 and component OEM service data classify hydraulic components by contamination sensitivity and specify corresponding cleanliness targets. Very high sensitivity (ISO 14/12/9 to 15/13/10): servo valves, electrohydraulic proportional valves, high-speed hydrostatic motors. High sensitivity (ISO 16/14/11 to 17/15/12): axial piston pumps and motors, vane pumps, medium-pressure proportional valves, precision gear pumps. Medium sensitivity (ISO 18/16/13 to 19/17/14): gear pumps (standard), gear motors, directional control valves, hydraulic cylinders (standard seal package). Low sensitivity (ISO 20/18/15 to 21/19/16): heavy-duty cylinders, manual valves, accumulators, rigid piping. The circuit cleanliness target is set by the most sensitive component installed — a system containing one servo valve must meet ISO 14/12/9 throughout, regardless of what other components tolerate.',
        callout: [
          { label: 'Servo valve (very high)', value: 'ISO 14/12/9' },
          { label: 'Piston pump (high)', value: 'ISO 17/15/12' },
          { label: 'Standard gear pump (medium)', value: 'ISO 19/17/14' },
        ],
      },
      {
        heading: 'Component Life vs Cleanliness Relationship',
        body: 'The relationship between system cleanliness and component life has been characterised through fleet studies and accelerated wear testing. For axial piston pumps, the relationship approximates: each two-code-unit improvement in cleanliness at ≥6 µm doubles expected pump life, with diminishing returns above ISO 15/13/10. Data from hydraulic pump OEMs indicates: at ISO 20/18/15, pump life averages 1,500–2,500 operating hours; at ISO 17/15/12, life extends to 5,000–8,000 hours; at ISO 15/13/10, life exceeds 10,000 hours in many applications. For servo valves, the correlation is steeper: hysteresis and threshold degrade measurably within 500–1,000 hours at ISO 18/16/13, while valves maintained at ISO 15/13/10 operate indefinitely without measurable performance degradation in the same application. These relationships are not universal — they depend on fluid type, operating pressure, temperature, and duty cycle — but they illustrate the order-of-magnitude impact of cleanliness on component economics.',
      },
      {
        heading: 'Offline Filtration and Contamination Control Architecture',
        body: 'Return-line filtration is the primary protection mechanism in most hydraulic circuits: all fluid returning from actuators passes through the return filter before re-entering the reservoir. Return-line filters are sized for the full system flow at maximum operating temperature. Offline (kidney-loop) filtration continuously circulates reservoir fluid through a high-efficiency filter independent of system operation — typically 5–15% of total system flow at β₁₀(c) ≥ 200 or β₃(c) ≥ 200 for servo valve circuits. Kidney-loop circuits are particularly effective at reducing fine particle counts (≤5 µm) that return-line filters at practical flow rates cannot capture efficiently. Pressure-line filtration (downstream of pump, upstream of control valves) provides protection against pump wear particles reaching sensitive valves — typically 3–5 µm absolute rated. Multi-stage filtration: high-capacity return filter + high-efficiency kidney loop + pressure-line filter covers the full particle size range and multiple ingress pathways simultaneously.',
        callout: [
          { label: 'Return-line filter rating', value: 'β₁₀(c) ≥ 75–200' },
          { label: 'Kidney loop flow', value: '5–15% of total system volume/min' },
          { label: 'Pressure-line filter', value: '3–5 µm absolute for servo circuits' },
        ],
      },
      {
        heading: 'Fluid Sampling and Cleanliness Verification',
        body: 'Verifying that a hydraulic system operates within its cleanliness target requires correct fluid sampling. Sample ports must be located in turbulent flow zones — return-line tees, pump outlet connections, or dedicated sampling valves. Do not sample from the reservoir directly (stratified contamination and settled particles give unrepresentative results). Sample bottles must be pre-cleaned to ISO 11/9/6 or better. Sample the system at operating temperature and normal flow rate — cold samples drawn at idle give optimistic particle counts. For servo valve systems, confirm cleanliness meets ISO 14/12/9 at the valve inlet port, not just at the reservoir. Initial commissioning sampling after flushing is mandatory: a system accepted at ISO 22/20/17 in as-built condition has already initiated spool wear before its first productive cycle.',
      },
    ],
    keyMetrics: [
      { label: 'Servo valve spool clearance', value: '1–3 µm' },
      { label: 'Servo valve cleanliness target', value: 'ISO 14/12/9' },
      { label: 'Piston pump life at ISO 17/15/12', value: '5,000–8,000 hours' },
      { label: 'Kidney-loop flow rate', value: '5–15% system volume/min' },
    ],
    relatedStandards: ['ISO 4406', 'ISO 16889', 'ISO 11171'],
    relatedTechnologies: ['NANOFORCE™', 'SYNTRAX™'],
    relatedSystems: ['Hydraulic Protection'],
    keywords: ['hydraulic contamination', 'servo valve silting', 'component clearance', 'contamination sensitivity', 'ISO 4406', 'abrasive wear', 'kidney loop'],
  },

  {
    slug: 'water-contamination-fuel',
    title: 'Water Contamination in Fuel Systems',
    subtitle: 'ASTM D6304, Karl Fischer Titration, and HPCR Injector Protection',
    metaDescription: 'Technical reference for water contamination in diesel fuel systems: free, dissolved, and emulsified water states, ASTM D6304 Karl Fischer measurement, ISO 12937, microbial growth, HPCR injector clearances, and coalescing filter selection.',
    category: 'Engineering',
    readTime: '11 min',
    intro: 'Water is the most damaging non-particulate contaminant in diesel fuel systems. It exists in three physical states — dissolved, emulsified, and free — each requiring different detection and removal strategies. High-pressure common rail (HPCR) injection systems, with pressures up to 2,500 bar and injector nozzle clearances of 1–3 µm, are acutely sensitive to water concentrations that would cause no visible damage in older injection systems.',
    sections: [
      {
        heading: 'Three States of Water in Fuel',
        body: 'Dissolved water is held in molecular solution within the fuel hydrocarbon matrix. Diesel fuel at 20°C can hold approximately 50–100 ppm dissolved water at saturation, depending on fuel composition and aromaticity. Dissolved water is invisible and causes no immediate operational problem. As temperature drops or water loading increases beyond saturation, dissolved water precipitates as emulsified water — micron-scale droplets dispersed through the fuel, giving it a hazy appearance. Free water settles to the lowest point of the fuel system as a distinct aqueous layer, typically at the bottom of fuel tanks, filter housings, and injection pump sumps. Free water causes the most acute damage: corrosion, bacterial growth, ice crystal formation, and lubrication loss in injection system components. The transitions between states are reversible with temperature and mixing energy, making free water identification at tank bottom a reliable indicator of total water loading.',
        callout: [
          { label: 'Dissolved water (saturation)', value: '50–100 ppm at 20°C in diesel' },
          { label: 'Emulsified water appearance', value: 'Hazy, milky, or cloudy fuel' },
          { label: 'Free water location', value: 'Bottom of tank/housing (settled)' },
        ],
      },
      {
        heading: 'ASTM D6304 and Karl Fischer Titration',
        body: 'ASTM D6304 (Standard Test Method for Determination of Water in Petroleum Products, Lubricating Oils, and Additives by Coulometric Karl Fischer Titration) is the primary laboratory method for measuring total water content in fuel. The Karl Fischer reaction oxidises sulphur dioxide with iodine in the presence of water: H₂O + I₂ + SO₂ + 3(RN) + CH₃OH → 2[RNH]I + [RNH]SO₄CH₃. Coulometric KFT generates iodine electrolytically from iodide — one mole of iodine reacts with one mole of water, allowing water mass to be calculated from the electrical charge. Method range: 10–10,000 ppm water. Precision: ±2 ppm at concentrations below 100 ppm. ASTM D6304 measures all three water states simultaneously. ISO 12937 (Petroleum Products — Determination of Water — Coulometric Karl Fischer Titration Method) covers the same fundamental reaction with harmonised procedure for international markets.',
        callout: [
          { label: 'ASTM D6304 range', value: '10–10,000 ppm' },
          { label: 'Precision at <100 ppm', value: '±2 ppm' },
          { label: 'ISO equivalent', value: 'ISO 12937' },
        ],
      },
      {
        heading: 'EN 590 Fuel Quality Specification',
        body: 'EN 590, the European diesel fuel quality standard, specifies maximum water content of 200 mg/kg (approximately 200 ppm by mass) at point of distribution. This limit encompasses all three water states and is measured by ASTM D6304 or equivalent coulometric KFT. However, 200 ppm at the distribution terminal does not mean 200 ppm at the fuel tank: water ingress during transport (condensation in vented tanks, incompletely dried tanker compartments, contaminated fill nozzles) and during vehicle storage (temperature cycling of partly filled tanks) typically adds 50–300 ppm to fuel before it reaches the injection system. On-tank water accumulation in large-capacity fleet vehicles operating in humid environments can reach 500–2,000 ppm total water in the lower fuel strata, with measurable free water layering above the tank drain point.',
        callout: [
          { label: 'EN 590 water limit', value: '200 mg/kg (≈200 ppm)' },
          { label: 'In-service accumulation', value: '50–300 ppm additional typical' },
          { label: 'Fleet tank worst case', value: '500–2,000 ppm in lower strata' },
        ],
      },
      {
        heading: 'HPCR Injector Sensitivity to Water',
        body: 'High-pressure common rail injection systems operate at rail pressures of 1,600–2,500 bar. Injector nozzle needle clearances are 1–3 µm; injector solenoid and piezo valve clearances are tighter still. Water in the injection system causes damage through three distinct mechanisms. Corrosion: water in contact with ferrous fuel system components generates iron hydroxide corrosion products (rust particles); these particles, typically 5–50 µm, cause abrasive wear of injector needles and nozzle seats at rail pressure. Lubrication loss: diesel fuel provides hydrodynamic lubrication to high-pressure injection pump plungers (lubrication rating HFRR ≤ 460 µm). Free water displaces the fuel film, increasing plunger and barrel wear by 5–20× in water-contaminated operation. Hydraulic lock and nozzle damage: at sub-zero temperatures, dissolved water that precipitates in the high-pressure nozzle bore can form ice crystals that hydraulically lock the injector needle open, causing injector tip failure and catastrophic nozzle seat erosion. A 200 ppm water concentration in HPCR fuel, while within EN 590 specification, is at the threshold of injector service life impact for pumps operating at ≥2,000 bar.',
        callout: [
          { label: 'HPCR rail pressure', value: '1,600–2,500 bar' },
          { label: 'Injector nozzle clearance', value: '1–3 µm' },
          { label: 'Water lubrication impact', value: '5–20× pump wear increase' },
        ],
      },
      {
        heading: 'Microbial Contamination and Fuel Degradation',
        body: 'Free water at the fuel–water interface in storage tanks supports microbial colonisation. Cladosporium resinae (the "kerosene fungus") and Pseudomonas aeruginosa are the most common fuel-degrading microorganisms in diesel. Microbial biofilm grows at the fuel–water interface, producing organic acids that lower fuel pH, generate particulate biomass (5–50 µm fungal hyphae and bacterial aggregates), and accelerate metal corrosion through hydrogen sulphide and organic acid production. Microbial contamination in commercial tanks is typically detected when fuel darkens, develops sediment, or causes rapid filter plugging. Biocide treatment (ASTM D4054 approved biocides) kills active microorganisms but does not remove dead cell matter — a biocide-treated tank with established biofilm requires flushing and physical cleaning to restore fuel quality. Prevention is more effective than remediation: maintaining tank water content below 50 ppm prevents the free-water layer necessary for microbial establishment.',
        callout: [
          { label: 'Primary organism', value: 'Cladosporium resinae (diesel fungus)' },
          { label: 'Prevention threshold', value: 'Tank water <50 ppm (no free layer)' },
          { label: 'Biocide limitation', value: 'Kills organisms; does not remove biomass' },
        ],
      },
      {
        heading: 'Coalescing Filter Technology and Water Removal',
        body: 'Fuel filter water separators use coalescence to remove emulsified and free water from fuel. Coalescence media (glass fiber or hydrophilic synthetic with controlled surface energy) cause small water droplets to collide, adhere, and grow into larger droplets that settle by gravity to the water sump. Separation efficiency is expressed as water dropout rate at a specified fuel flow rate and initial water concentration. Stage 1 (coalescer): emulsified water droplets (1–10 µm) coalesce to >100 µm on the coalescing media surface. Stage 2 (separator shell): coalesced droplets settle through the quiescent zone below the coalescer to the water collection bowl. ASTM D7619 (Standard Test Method for Sizing and Characterization of Particles in Low-Sulfur Automotive-Grade Diesel Fuels) measures particulate levels that accompany water separation testing. HYDROCORE™ coalescing technology combines sub-10 µm particle capture with water separation in a single element, eliminating the separate secondary stage in applications where space is constrained.',
        callout: [
          { label: 'Coalescence droplet range', value: '1–10 µm (initial) → >100 µm (coalesced)' },
          { label: 'Separation mechanism', value: 'Gravity settling after coalescence' },
          { label: 'Test standard', value: 'ASTM D7619 (particle sizing with water)' },
        ],
      },
      {
        heading: 'Field Detection and Monitoring',
        body: 'Field water detection methods span from crude to quantitative. Water paste (copper sulphate indicator): applied to a sampling tube, changes colour in contact with free water — useful for tank bottom sampling to confirm presence/absence of a free-water layer. Water-finding paper or capsules: single-use colorimetric indicators for field confirmation. Portable refractometer: measures water content by refractive index change — applicable to water-soluble fluids (coolant, water-glycol hydraulic fluid) but not diesel. Coulometric KFT field instruments: handheld units can measure water in fuel to ±10 ppm precision at 30–300 ppm concentrations, suitable for fleet pre-delivery inspection. Capacitance sensors: installed in-line fuel water sensors detect emulsified water by dielectric constant change — they trigger an alarm at pre-set water fraction without measuring ppm. Drain inspection: daily inspection and draining of filter water bowls is the minimum fleet maintenance protocol; drain volume and visual appearance of drained water provide qualitative contamination trending.',
      },
    ],
    keyMetrics: [
      { label: 'EN 590 water limit', value: '200 mg/kg (ppm)' },
      { label: 'HPCR rail pressure', value: '1,600–2,500 bar' },
      { label: 'ASTM D6304 precision', value: '±2 ppm at <100 ppm' },
      { label: 'Microbial prevention threshold', value: '<50 ppm tank water' },
    ],
    relatedStandards: ['ASTM D6304', 'ISO 12937'],
    relatedTechnologies: ['HYDROCORE™', 'SYNTEPORE™', 'TURBOCORE™'],
    relatedSystems: ['Fuel Cleanliness Protection'],
    keywords: ['water contamination', 'fuel systems', 'Karl Fischer', 'ASTM D6304', 'ISO 12937', 'HPCR', 'coalescing filter', 'microbial contamination'],
  },

  {
    slug: 'compressed-air-purity',
    title: 'Compressed Air Purity',
    subtitle: 'ISO 8573-1 Quality Classes, Contamination Measurement, and System Design',
    metaDescription: 'Technical reference for compressed air purity: ISO 8573-1 quality classes for particles, moisture, and oil; ISO 8573-2/3 test methods; dew point measurement; and filtration system design for pneumatic and process air applications.',
    category: 'Engineering',
    readTime: '10 min',
    intro: 'Compressed air contains particles, liquid water, water vapour, and oil aerosols and vapour introduced during compression and distribution. ISO 8573-1 defines quality classes for each contaminant type, providing a standardised specification language for compressed air systems. Achieving the correct purity class requires understanding contamination sources, measurement methods, and the filtration and drying technologies that control each contaminant type.',
    sections: [
      {
        heading: 'ISO 8573-1 Quality Classes',
        body: 'ISO 8573-1 defines quality classes 0 through 6 for three contamination categories independently: solid particles (by count and size), moisture (by pressure dew point, °C), and total oil (aerosol plus vapour, mg/m³). Class 0 is specified by the user and is more stringent than Class 1 — it is not a defined numerical value in the standard. Class 1 is the highest standard-defined purity; Class 6 is the least stringent. A compressed air quality specification written as ISO 8573-1:2010 [2:4:2] means Class 2 for particles, Class 4 for moisture, and Class 2 for oil. Each class must be specified independently because different treatment stages address each contamination type — a highly efficient particulate filter provides no benefit for dew point, and a refrigerant dryer reduces moisture but does not remove oil aerosols.',
        callout: [
          { label: 'Class 0', value: 'User-defined, more stringent than Class 1' },
          { label: 'Class 1 oil content', value: '≤0.01 mg/m³ (total oil)' },
          { label: 'Notation example', value: 'ISO 8573-1 [2:4:2] = particles:moisture:oil' },
        ],
      },
      {
        heading: 'Particle Quality Classes',
        body: 'ISO 8573-1 particle classes are defined by the maximum number of particles per cubic metre at specified size ranges. Class 1 (particles): ≤20,000 particles/m³ at 0.1–0.5 µm; ≤400 at 0.5–1 µm; ≤10 at 1–5 µm; no particles ≥5 µm. Class 2: same ≤400,000 at 0.1–0.5 µm; ≤6,000 at 0.5–1 µm; ≤100 at 1–5 µm; no particles ≥5 µm. Class 3: no limit for <1 µm; ≤1,000 at 1–5 µm; no particles ≥5 µm. Classes 4 and 5 allow particles ≥5 µm in increasing quantities. Class 6 allows particle mass concentration up to 10 mg/m³ without size distribution limits. For most industrial pneumatic actuator and tool applications, particle Class 3 or 4 is adequate. Instrument air (analytical instruments, pressure transmitters, control valves) requires particle Class 1 or 2 to prevent instrument blockage and measurement error.',
        callout: [
          { label: 'Class 1 (≥5 µm particles)', value: 'Zero permitted' },
          { label: 'Class 3 (1–5 µm)', value: '≤1,000 particles/m³' },
          { label: 'Instrument air class', value: 'Class 1 or 2' },
        ],
      },
      {
        heading: 'Moisture Classes and Pressure Dew Point',
        body: 'Moisture in compressed air is expressed as pressure dew point (PDP) — the temperature at which condensation occurs at the system operating pressure. A PDP of −40°C at 7 bar means the air contains so little moisture that condensation will not form until the temperature drops to −40°C, even at 7 bar line pressure. ISO 8573-1 moisture classes: Class 1: PDP ≤ −70°C; Class 2: ≤ −40°C; Class 3: ≤ −20°C; Class 4: ≤ +3°C; Class 5: ≤ +7°C; Class 6: ≤ +10°C. Refrigerant dryers achieve PDP between +2°C and +10°C (Classes 4–6). Adsorption (desiccant) dryers achieve PDP between −20°C and −70°C (Classes 1–3). The conversion from PDP to water content in g/m³ at a reference condition allows calculation of absolute humidity: at −40°C PDP and 7 bar, the water content is approximately 0.003 g/m³ — compared to 1.4 g/m³ at +7°C PDP.',
        callout: [
          { label: 'Class 1 PDP', value: '≤ −70°C' },
          { label: 'Refrigerant dryer PDP range', value: '+2°C to +10°C (Classes 4–6)' },
          { label: 'Desiccant dryer PDP range', value: '−20°C to −70°C (Classes 1–3)' },
        ],
      },
      {
        heading: 'Oil Content Classes and Measurement',
        body: 'Oil in compressed air originates from lubricant carryover from oil-lubricated compressors (in the form of aerosol and vapour) and from atmospheric hydrocarbon vapours that concentrate during compression. ISO 8573-1 total oil classes (aerosol + liquid + vapour, mg/m³): Class 1: ≤0.01 mg/m³; Class 2: ≤0.1 mg/m³; Class 3: ≤1 mg/m³; Class 4: ≤5 mg/m³. Oil-free compressors (Class 0 equipment per ISO 8573-7) still require oil removal filtration for Class 1 or Class 2 applications because atmospheric hydrocarbon vapours drawn into the compressor inlet concentrate to measurable levels at the outlet. ISO 8573-2 defines the test method for aerosol oil measurement: impaction on a membrane filter with gravimetric analysis. ISO 8573-5 defines the vapour oil measurement method using activated carbon adsorption tubes. Total oil = aerosol (ISO 8573-2 method) + oil vapour (ISO 8573-5 method). Coalescing filters remove aerosol oil to Class 1; activated carbon adsorption removes vapour oil — both stages are required to achieve verified Class 1 compliance.',
        callout: [
          { label: 'Class 1 oil content', value: '≤0.01 mg/m³' },
          { label: 'Aerosol removal', value: 'Coalescing filter (ISO 8573-2)' },
          { label: 'Vapour removal', value: 'Activated carbon (ISO 8573-5)' },
        ],
      },
      {
        heading: 'Contamination Sources During Compression',
        body: 'Ambient air drawn into a compressor contains atmospheric particulates (0.1–10 µm pollen, dust, soot), water vapour (humidity), and trace hydrocarbon vapours. During compression, all constituents are concentrated in proportion to the compression ratio: at 7 bar gauge (8 bar absolute), volume reduces to 1/8 and contaminant mass per volume increases 8-fold. Compressed air after-cooling (required to prevent thermal damage to downstream equipment) causes the compressed, humid air to cool rapidly — water vapour condenses into liquid water and aerosol droplets. The after-cooler and condensate separator remove the largest water fraction (typically 70–90% of the inlet water vapour at tropical ambient conditions) but leave substantial residual moisture requiring drying. Oil-lubricated compressors inject oil into the compression stage for cooling and sealing — oil carryover from the separator and coalescing filter in the compressor unit outlet is typically 1–5 mg/m³ before point-of-use treatment.',
      },
      {
        heading: 'Filtration System Design for Quality Classes',
        body: 'A compressed air treatment train is designed in stages, each addressing one contamination category at the conditions produced by the upstream stage. After-cooler + condensate separator: removes bulk liquid water and coarse aerosols (Stages 4–5 moisture, particle Class 4–5). General purpose coalescing filter (1 µm coalescence element): removes liquid aerosol oil to 0.1 mg/m³ and particles ≥1 µm (particle Class 2–3, oil Class 2–3). High-efficiency coalescing filter (0.01 µm coalescence element): reduces oil aerosol to 0.01 mg/m³ (oil Class 1). Activated carbon adsorber: removes oil vapour below 0.003 mg/m³ (oil Class 1). Desiccant dryer: achieves PDP ≤ −40°C (moisture Class 2). Final particulate filter (PTFE membrane or borosilicate fiber): ensures sterile or classified air downstream of all treatment stages (particle Class 1 or 2). DRYCORE™ filtration systems provide integrated particulate and coalescing elements for compressed air applications, reducing system footprint and pressure drop budget.',
        callout: [
          { label: 'Coalescing filter achieves', value: 'Oil Class 2 (0.1 mg/m³)' },
          { label: 'High-efficiency coalescer', value: 'Oil Class 1 (0.01 mg/m³)' },
          { label: 'Activated carbon adds', value: 'Vapour removal to full Class 1 compliance' },
        ],
      },
    ],
    keyMetrics: [
      { label: 'ISO 8573-1 Class 1 oil', value: '≤0.01 mg/m³' },
      { label: 'Class 1 pressure dew point', value: '≤ −70°C' },
      { label: 'Class 1 particles (≥5 µm)', value: 'Zero permitted' },
      { label: 'Refrigerant dryer PDP', value: '+2°C to +10°C' },
    ],
    relatedStandards: ['ISO 8573-1', 'ISO 29463'],
    relatedTechnologies: ['DRYCORE™'],
    relatedSystems: ['Compressed Air Protection'],
    keywords: ['ISO 8573', 'compressed air purity', 'pressure dew point', 'oil aerosol', 'particle class', 'coalescing filter', 'desiccant dryer'],
  },

  {
    slug: 'oil-analysis-methods',
    title: 'Oil Analysis Methods',
    subtitle: 'ICP Spectroscopy, TAN/TBN, Viscosity, and Wear Metal Trending',
    metaDescription: 'Engineering reference for oil condition monitoring: ICP spectrometric wear metal analysis, total acid number (ASTM D664), total base number (ASTM D2896), kinematic viscosity (ASTM D445), FTIR spectroscopy, and sampling protocols for fleet maintenance programs.',
    category: 'Engineering',
    readTime: '10 min',
    intro: 'Oil analysis is the systematic measurement of physical and chemical properties of in-service lubricating oil to detect component wear, monitor oil degradation, and identify contamination before damage occurs. When applied to a defined sampling schedule, oil analysis provides a leading indicator of failure — typically identifying problems 200–500 operating hours before mechanical failure, allowing planned intervention rather than unplanned breakdown.',
    sections: [
      {
        heading: 'ICP Spectrometric Wear Metal Analysis',
        body: 'Inductively Coupled Plasma (ICP) spectrometry is the standard method for measuring dissolved and sub-20 µm particle wear metals in engine and hydraulic oils. ASTM D5185 (Multi-Element Determination of Used and Unused Lubricating Oils and Base Oils by Inductively Coupled Plasma Atomic Emission Spectrometry) is the reference method. A plasma torch at approximately 10,000 K atomises and excites elements in the oil sample; emission lines at element-specific wavelengths are measured simultaneously. Reportable elements and their diagnostic significance: iron (Fe) — cylinder liners, camshaft, crankshaft wear; chromium (Cr) — piston ring, cylinder liner wear; aluminium (Al) — piston crown, bearing housing, gear case wear; copper (Cu) — bearing overlay wear (Cu–Pb, Cu–Sn overlays), bronze bushing wear; lead (Pb) — bearing overlay failure; silicon (Si) — airborne dust ingestion (silica) OR antifreeze coolant (silicone additive); sodium (Na) — coolant ingress (sodium silicate antifreeze); boron (B) — coolant ingress (sodium borate antifreeze). ICP reliably detects particles below 7–10 µm; larger wear particles (fatigue spalling, chip wear) are not efficiently dissolved or atomised and require particle counting or analytical ferrography for detection.',
        callout: [
          { label: 'Iron (Fe)', value: 'Liner, crankshaft, camshaft wear' },
          { label: 'Silicon (Si)', value: 'Dust ingestion OR coolant (context dependent)' },
          { label: 'ICP particle size limit', value: 'Effective to ~7–10 µm diameter' },
        ],
      },
      {
        heading: 'Total Acid Number and Total Base Number',
        body: 'Total Acid Number (TAN) measures the concentration of all acidic components in oil — oxidation products, acidic combustion by-products, and depleted additive degradation products. ASTM D664 (Potentiometric Titration Method) expresses TAN in mg KOH per gram of oil (mgKOH/g). New engine oil TAN typically ranges 0.3–1.5 mgKOH/g. A rising TAN trend indicates accelerating oxidation or acid contamination. Alert limit: TAN ≥ 2× new oil value or ≥ 2.0 mgKOH/g depending on OEM specification. Total Base Number (TBN) measures the alkaline reserve of the oil — primarily the detergent and dispersant additives that neutralise combustion acids. ASTM D2896 (Potentiometric Perchloric Acid Titration Method). New diesel engine oil TBN: 10–30 mgKOH/g depending on application (mining diesel at 30+ TBN for high-sulphur fuel; on-road diesel at 10–14 TBN with low-sulphur ULSD). As TBN depletes during service, TAN rises. Service limit is typically TBN ≤ 50% of new oil TBN, or TAN approaching TBN. TBN:TAN ratio ≥ 1 is the minimum criterion for maintaining protective alkaline buffering.',
        callout: [
          { label: 'TAN test method', value: 'ASTM D664 (mgKOH/g)' },
          { label: 'TBN test method', value: 'ASTM D2896 (mgKOH/g)' },
          { label: 'Service limit (TBN)', value: '≤50% of new oil TBN, or TBN ≤ TAN' },
        ],
      },
      {
        heading: 'Kinematic Viscosity',
        body: 'Kinematic viscosity is the fundamental physical property governing oil film thickness, pump efficiency, and bearing protection. ASTM D445 (Standard Test Method for Kinematic Viscosity of Transparent and Opaque Liquids) measures viscosity by timing oil flow through a calibrated capillary tube at 40°C and 100°C. Results in centistokes (cSt = mm²/s). Viscosity index (ASTM D2270) characterises viscosity-temperature sensitivity: high VI oils maintain viscosity better across temperature range. Viscosity decrease in service (shear thinning): VI improvers in multigrade oils are high-molecular-weight polymers that shear into shorter chains under mechanical stress, reducing viscosity permanently. Alert: viscosity ≥20% below or ≥30% above new oil value at 40°C. Viscosity increase: oxidation increases molecular weight of base oil and creates sludge precursors. Fuel dilution from injector blow-by reduces viscosity acutely (confirmed by flash point test ASTM D92: fuel-diluted oil flash point drops below 160°C). Coolant ingress from head gasket failure increases water content and, after emulsification, apparent viscosity.',
        callout: [
          { label: 'Test standard', value: 'ASTM D445 at 40°C and 100°C' },
          { label: 'Viscosity decrease alert', value: '≥20% below new oil spec' },
          { label: 'Fuel dilution indicator', value: 'Flash point <160°C (ASTM D92)' },
        ],
      },
      {
        heading: 'FTIR Spectroscopy for Oil Condition',
        body: 'Fourier Transform Infrared spectroscopy (FTIR) identifies molecular species in used oil by comparing absorption spectra to a reference spectrum of new (unused) oil of the same grade. Absorbance peaks at characteristic wavenumbers indicate specific degradation products: oxidation products (1,700–1,760 cm⁻¹, carbonyl stretch); nitration products (1,620 cm⁻¹, nitrile bands from combustion gas oxidation of nitrogen); soot/combustion particulates (2,000 cm⁻¹ baseline elevation); water (3,400 cm⁻¹, OH stretch — used for water detection when coulometric KFT is not available); glycol coolant (866 cm⁻¹, ethylene glycol signature). FTIR is reported in Absorbance Units (AU) relative to the new oil baseline. Alert limits vary by OEM: oxidation ≥ 25 AU and nitration ≥ 25 AU are common fleet trigger values for SAE 15W-40 diesel engine oil. FTIR is a rapid, cost-effective screening technique — a complete spectrum is generated in under 2 minutes. Confirmation of specific contaminants identified by FTIR is done by dedicated test methods (D664 for oxidation acids, D6304 for water).',
        callout: [
          { label: 'Oxidation peak', value: '1,700–1,760 cm⁻¹ (carbonyl)' },
          { label: 'Glycol coolant peak', value: '866 cm⁻¹' },
          { label: 'Oxidation alert limit', value: '≥25 AU (relative to new oil)' },
        ],
      },
      {
        heading: 'Particle Counting in Used Oil',
        body: 'ISO 4406 particle counting applied to used engine or hydraulic oil provides early detection of increased internal wear before ICP spectroscopy can detect it (ICP is limited to particles ≤7–10 µm; particles from surface fatigue and spalling are typically 25–100 µm). Automatic particle counters calibrated per ISO 11171 count particles at ≥4 µm, ≥6 µm, and ≥14 µm. Establishing a baseline ISO code for each specific machine type (e.g., ISO 17/15/12 for a healthy diesel engine lube circuit) allows deviation detection — a shift of two code units above baseline indicates a doubling in particle generation rate. When particle counts rise and ICP shows no corresponding elemental increase, the source particles are larger than 10 µm and represent fatigue or spalling events. Combined ICP + particle counting covers the full size distribution and provides complementary diagnostic information: ICP for chronic sub-surface wear, particle counting for acute mechanical events.',
        callout: [
          { label: 'ICP particle size limit', value: '≤7–10 µm reliably detected' },
          { label: 'Fatigue particle size', value: '25–100 µm (ICP misses these)' },
          { label: 'Alert threshold', value: '≥2 code-unit rise from individual baseline' },
        ],
      },
      {
        heading: 'Sampling Protocols and Trending',
        body: 'Oil analysis value is maximised by consistent sampling protocols that enable trend detection across multiple data points. Key protocol requirements: sample at consistent engine/machine hours from the same sampling point each interval; use pre-cleaned sample tubes or syringes with a dedicated sampling valve (not the drain plug); sample at operating temperature with the system at normal load; fill sample bottles to 3/4 capacity to allow mixing without aeration. Recommended intervals: engine oil in mining trucks, every 250 hours; engine oil in on-road diesel, every 500 hours; hydraulic oil in construction equipment, every 250–500 hours; turbine oil, every 1,000–2,000 hours. A single sample is a measurement; three or more samples from the same machine are a trend. Alert limits for a single sample are less meaningful than a rising trend — an iron reading of 80 ppm that was 15 ppm previously indicates a 5× wear rate acceleration, even if 80 ppm has not crossed the absolute alert limit.',
      },
    ],
    keyMetrics: [
      { label: 'ICP standard', value: 'ASTM D5185' },
      { label: 'TAN standard', value: 'ASTM D664 (mgKOH/g)' },
      { label: 'TBN service limit', value: '≤50% of new oil TBN' },
      { label: 'Viscosity standard', value: 'ASTM D445 at 40°C and 100°C' },
    ],
    relatedStandards: ['ISO 4406', 'ASTM D6304'],
    relatedTechnologies: ['SYNTRAX™', 'DURATECH™'],
    relatedSystems: ['Lubrication Protection'],
    keywords: ['oil analysis', 'ICP spectroscopy', 'wear metals', 'TAN', 'TBN', 'viscosity', 'FTIR', 'ASTM D5185', 'ASTM D664', 'fluid condition monitoring'],
  },

  {
    slug: 'cabin-air-filtration',
    title: 'Cabin Air Filtration',
    subtitle: 'ISO 11155, Particulate Exposure Limits, and Operator Health Protection',
    metaDescription: 'Technical reference for mobile equipment cabin air filtration: ISO 11155 test standards, PM10 and PM2.5 occupational exposure limits, activated carbon for gaseous contaminants, HVAC integration, and DIN 71220 classification.',
    category: 'Engineering',
    readTime: '9 min',
    intro: 'Cabin air filtration in mobile equipment protects operators from airborne particulates, chemical vapours, and biological contaminants generated by the operating environment. For mining, construction, and agricultural equipment operators working 2,000–5,000 hours per year, cabin filtration directly determines the chronic particulate dose received during occupational exposure. ISO 11155 provides the framework for testing and specifying cabin air filter performance; occupational health standards define the dose limits that cabin systems must maintain.',
    sections: [
      {
        heading: 'Occupational Particulate Exposure Limits',
        body: 'Regulatory exposure limits for respirable dust in occupational settings are set by national and international bodies. WHO Air Quality Guidelines (2021) define PM2.5 annual mean guideline at 5 µg/m³ and 24-hour guideline at 15 µg/m³; PM10 annual mean at 15 µg/m³ and 24-hour at 45 µg/m³. Mining-specific limits: coal dust (MSHA, US) at 1.5 mg/m³ total dust; silica (quartz) at 0.05 mg/m³ respirable fraction — the most stringent mineral dust limit because crystalline silica causes silicosis at chronic exposures above 0.025 mg/m³ over a working lifetime. Cab air standards for mobile mining equipment typically target a cab-to-ambient ratio (CAR) of 0.05 or better — meaning the PM10 concentration inside the cab should be no more than 5% of the ambient concentration outside the machine. Achieving CAR ≤ 0.05 in a 10 mg/m³ dust environment produces an internal concentration of ≤0.5 mg/m³, consistent with health protection during a full shift.',
        callout: [
          { label: 'WHO PM2.5 guideline (annual)', value: '5 µg/m³' },
          { label: 'Crystalline silica OEL', value: '0.05 mg/m³ respirable' },
          { label: 'Mining cab target (CAR)', value: '≤0.05 (5% of ambient)' },
        ],
      },
      {
        heading: 'ISO 11155 — Cabin Air Filtration Standard',
        body: 'ISO 11155 (Road Vehicles — Air Filters for Passenger Compartments) consists of two parts: ISO 11155-1 defines general requirements, test conditions, performance parameters, and marking requirements; ISO 11155-2 defines the test method for evaluating aerosol particle filtration efficiency and airflow resistance. The test measures filtration efficiency at particle sizes 0.4 µm using a dioctyl phthalate (DOP) or dioctyl sebacate (DOS) aerosol challenge and an optical particle counter. Performance is classified by removal efficiency at 0.4 µm: standard cabin filter (ISO 11155 Class 1) ≥ 10% efficiency; anti-pollen filter (Class 2) ≥ 80%; activated carbon filter (Class 3): meets Class 2 particle efficiency plus gaseous contaminant removal. DIN 71220 is the predecessor German standard (published before ISO 11155) and remains referenced in older OEM specifications; it defines similar particle classes but with slightly different test conditions and classification thresholds. For heavy mobile equipment (mining, construction), ISO 11155 test conditions may not fully replicate cab pressurisation, airflow rates, and ambient dust concentrations — equipment-specific testing is recommended for critical applications.',
        callout: [
          { label: 'ISO 11155 test aerosol', value: 'DOP or DOS at 0.4 µm' },
          { label: 'Class 2 efficiency (0.4 µm)', value: '≥80%' },
          { label: 'Class 3 (carbon filter)', value: 'Class 2 + gaseous removal' },
        ],
      },
      {
        heading: 'Particulate Capture Mechanisms in Cabin Filters',
        body: 'Cabin air filter elements use the same particle capture mechanisms as industrial filtration: inertial impaction (heavy particles >5 µm deviate from streamlines and impact fiber surfaces), interception (particles 1–5 µm follow streamlines but contact fiber surfaces due to their physical size), diffusion (Brownian motion causes sub-1 µm particles to deviate from streamlines and contact fibers — increasing with decreasing particle size), and electrostatic attraction (charged media or charged particles enhance interception and diffusion capture). Depth-loading media (cellulose, polyester) capture particles throughout the media thickness; surface-loading membrane media (PTFE) capture particles on the upstream face. Cabin filters see moderate dust concentrations compared to engine air filters — typically 0.01–10 mg/m³ ambient, resulting in low pressure-drop build-up rates and long service intervals (one filter per season or per OEM interval). Activated carbon layers added to cabin filter elements capture gaseous contaminants (NOx, SO₂, O₃, VOCs) through adsorption — carbon surface area (800–1,200 m²/g for activated carbon) determines capacity. Carbon layer exhaustion is not detectable by restriction monitoring; it is time- and exposure-based.',
        callout: [
          { label: 'Coarse particle removal (>5 µm)', value: 'Inertial impaction' },
          { label: 'Sub-micron particle removal', value: 'Diffusion (increases with smaller size)' },
          { label: 'Activated carbon surface area', value: '800–1,200 m²/g' },
        ],
      },
      {
        heading: 'Cab Pressurisation and Ingress Control',
        body: 'A cabin air filter alone cannot achieve low cab-to-ambient ratios if the cab structure has uncontrolled leakage paths. Effective cab sealing requires positive pressurisation — maintaining cab interior air pressure 10–30 Pa above ambient. Positive pressure prevents ambient dust from being drawn in through door seals, cable penetrations, floor gaskets, and structural joints. Pressurisation is maintained by supplying filtered air at a flow rate that exceeds the leakage rate of the cab. Leakage rate measurement: with the HVAC fan on and all openings sealed (doors closed, vents shut), measure pressure decay over 60 seconds with HVAC fan off. A well-sealed cab retains ≥50% of pressurisation after 60 seconds. Poorly sealed cabs with doors, gaskets, or penetration seals in poor condition cannot achieve CAR ≤ 0.05 regardless of filter efficiency — the filtration element is not the limiting factor. Cab integrity testing should precede or accompany filter specification upgrades on high-contamination equipment.',
        callout: [
          { label: 'Positive pressurisation target', value: '10–30 Pa above ambient' },
          { label: 'Pressure retention (well-sealed cab)', value: '≥50% after 60 seconds' },
          { label: 'Limiting factor for poor CAR', value: 'Cab leakage, not filter efficiency' },
        ],
      },
      {
        heading: 'Filter Selection for Mining and Construction Equipment',
        body: 'Mining and construction equipment cabin filtration requirements differ from passenger car requirements in dust concentration, airflow volume, and shift duration. Key selection parameters: (1) Efficiency at PM10 and PM2.5 sizes — not just the DOP 0.4 µm ISO 11155 metric; request fractional efficiency data at 1, 2.5, 5, and 10 µm for particulate health protection. (2) Dust holding capacity in grams — harsh environments require high-capacity elements to maintain airflow throughout a full shift without performance degradation. (3) Activated carbon mass — specified in grams of activated carbon, not just "with carbon": 100 g carbon is meaningfully different in capacity from 20 g. (4) Chemical compatibility — carbon layers are selective; activated carbon for NOx/SO₂ removal (impregnated carbon) differs from standard carbon for VOC removal. MICROKAPPA™ cabin filter elements combine high particulate efficiency with high activated carbon loading optimised for mining and construction ambient contaminant profiles.',
        callout: [
          { label: 'Key efficiency sizes for health', value: '1, 2.5, 5, 10 µm' },
          { label: 'Carbon capacity indicator', value: 'Total carbon mass (grams)' },
          { label: 'Activated carbon types', value: 'Standard (VOC) vs impregnated (NOx/SO₂)' },
        ],
      },
      {
        heading: 'Maintenance and Service Intervals',
        body: 'Cabin air filter service intervals are determined by restriction increase (airflow reduction) and by total operating hours rather than by particulate breakthrough. Restriction increase degrades cab pressurisation: as the filter loads, the HVAC fan operates at reduced efficiency, cab pressure drops, and ambient dust ingress increases. Service when restriction indicator (if fitted) reaches the set point, or on the OEM\'s scheduled interval — whichever comes first. Activated carbon elements must be replaced on time-based intervals even if particulate restriction has not reached the service point, because carbon exhaustion is invisible to restriction monitoring. Heavily contaminated carbon elements may desorb adsorbed gases when ambient conditions change (elevated temperature), temporarily releasing accumulated contaminants into the cab air — this is the critical failure mode for carbon elements operated past their service life. Visual inspection of a used cabin filter provides useful information: a grey-brown uniform loading pattern indicates normal ambient dust; localised dark staining may indicate specific contamination source proximity (diesel exhaust, chemical storage); unusual colours indicate chemical exposure requiring investigation.',
      },
    ],
    keyMetrics: [
      { label: 'WHO PM2.5 guideline (annual)', value: '5 µg/m³' },
      { label: 'Mining cab CAR target', value: '≤0.05' },
      { label: 'ISO 11155 Class 2 efficiency', value: '≥80% at 0.4 µm' },
      { label: 'Cab pressurisation target', value: '10–30 Pa above ambient' },
    ],
    relatedStandards: ['ISO 11155', 'DIN 71220'],
    relatedTechnologies: ['MICROKAPPA™'],
    relatedSystems: ['Cabin Air Protection'],
    keywords: ['cabin air filtration', 'ISO 11155', 'DIN 71220', 'PM10', 'PM2.5', 'activated carbon', 'cab pressurisation', 'operator health', 'MICROKAPPA'],
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
