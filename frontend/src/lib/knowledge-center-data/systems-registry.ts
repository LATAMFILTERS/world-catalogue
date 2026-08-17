/**
 * systems-registry.ts
 * ELIMFILTERS Knowledge Center — Protection Systems Data
 *
 * Dependency: ./types
 */

import type { KCSystemDetail } from './types';

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
    technologies: ['SYNTAPORE™', 'TURBOCORE™', 'DURATECH™', 'MARINECLEAN™'],
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

// ─── SYSTEM DETAILS ───────────────────────────────────────────────────────────

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
        body: 'Centrifugal pre-cleaners installed upstream of the primary element remove a substantial fraction of coarse dust (>50 µm) before it reaches the filter media. INTEKCORE™ housings integrate pre-cleaner functionality, extending primary MACROCORE™ element life in high-dust environments; the specific extension must be confirmed by field service data for the approved application rather than assumed. Pre-cleaners require automatic evacuation of the separated dust through a scavenging air ejector or manual drain.',
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
        body: 'Fuel protection requires two complementary technologies: SYNTAPORE™ for particle removal and TURBOCORE™ for free water removal. The pre-filter/coarse separator (TURBOCORE™) is installed upstream to remove bulk water and coarse particles. The final element (SYNTAPORE™) provides fine particle protection at the injection pump inlet. This sequence protects both the lift pump and the high-pressure pump and injectors.',
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
      { label: 'NANOFORCE™ Beta ratio', value: 'Per approved application' },
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
      { label: 'THERMACORE™ particle capture', value: 'Per approved application' },
      { label: 'Liner erosion mechanism', value: 'Cavitation from vapor bubble collapse' },
    ],
    sections: [
      {
        heading: 'Cavitation Erosion Mechanism',
        body: 'Diesel engine wet cylinder liners vibrate due to combustion pressure pulses. This vibration creates low-pressure zones on the coolant side of the liner — when pressure drops below the vapor pressure of the coolant, vapor bubbles form. When these bubbles collapse, micro-jets of liquid impact the liner surface at velocities that erode cast iron at a rate that can penetrate a liner wall in 2,000–5,000 hours without adequate SCA protection. Supplemental coolant additives (SCA) form a protective film on the liner surface that absorbs the impact energy of bubble collapse.',
      },
      {
        heading: 'SCA Management',
        body: 'SCA concentration must remain within the range specified for the coolant chemistry and approved application. Below the minimum, cavitation erosion protection is insufficient; above the maximum, SCA precipitation can cause gel formation and clogging. THERMACORE™ is engineered to release SCA at a controlled rate across the service interval to help maintain concentration within the specified range. SCA concentration is verified using test strips or refractometer measurement at each coolant service interval.',
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
      { label: 'MICROKAPPA™ PM₂.₅ efficiency', value: 'Per approved application' },
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
        body: 'MICROKAPPA™ elements are rated to the PM₂.₅ efficiency class specified for the approved application, up to H13-class HEPA-equivalent media where required. The activated carbon layer adsorbs VOCs, NO₂, diesel exhaust gases, and agricultural chemicals. Proper cabin filtration requires positive pressurization of the cab relative to the exterior — air must flow outward through any gap, preventing unfiltered exterior air from entering through door seals, cable penetrations, or HVAC ducts.',
      },
      {
        heading: 'Filter Replacement Protocol',
        body: 'Cabin air filter service intervals in mining and construction environments range from 100 to 500 hours depending on ambient dust concentration and cab pressurization integrity. Restriction should be checked at each scheduled service. Activated carbon saturation occurs independently of particulate loading — in high-VOC environments (diesel exhaust, paint fumes), carbon may saturate before particulate capacity is reached. Carbon saturation is indicated by odor breakthrough.',
      },
    ],
  },
};

