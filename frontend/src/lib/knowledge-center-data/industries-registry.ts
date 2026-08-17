/**
 * industries-registry.ts
 * ELIMFILTERS Knowledge Center — Industries Data
 *
 * Dependency: ./types
 */

import type { KCIndustryDetail } from './types';

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

// ─── INDUSTRY DETAILS ─────────────────────────────────────────────────────────

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
    technologies: ['MACROCORE™', 'INTEKCORE™', 'MICROKAPPA™', 'SYNTRAX™', 'NANOFORCE™', 'SYNTAPORE™', 'TURBOCORE™'],
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
    technologies: ['MACROCORE™', 'INTEKCORE™', 'SYNTRAX™', 'MICROKAPPA™', 'NANOFORCE™', 'TURBOCORE™'],
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
    technologies: ['MACROCORE™', 'SYNTRAX™', 'MICROKAPPA™', 'SYNTAPORE™'],
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
    technologies: ['SYNTAPORE™', 'TURBOCORE™', 'SYNTRAX™', 'NANOFORCE™', 'MICROKAPPA™'],
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
    technologies: ['MACROCORE™', 'SYNTRAX™', 'NANOFORCE™', 'SYNTAPORE™', 'TURBOCORE™'],
    standards: ['ISO 5011', 'ISO 8573-1', 'ISO 16889', 'ISO 4406'],
    systems: ['Air Intake Protection', 'Lubrication Protection', 'Hydraulic Protection', 'Fuel Cleanliness Protection'],
    sections: [
      {
        heading: 'Drilling Environment',
        body: 'Active drilling operations generate airborne barite (BaSO₄) and formation dust in concentrations that rapidly saturate primary air filters. Rig engines powering drill strings and mud pumps require frequent air filter service during active drilling phases. H₂S service requires FKM (Viton) elastomers for all seals — standard NBR degrades rapidly in sour gas environments.',
      },
      {
        heading: 'Instrument Air Quality',
        body: 'Process control instrumentation and pneumatic valve actuators in upstream and refinery applications require instrument-grade compressed air per ISO 8573-1. Contaminated instrument air causes instrument calibration drift, valve actuator stiction, and positioner failure — contributing to process upsets.',
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
    technologies: ['NANOFORCE™', 'SYNTRAX™'],
    standards: ['ISO 8573-1', 'ISO 16889', 'ISO 4406'],
    systems: ['Hydraulic Protection', 'Lubrication Protection'],
    sections: [
      {
        heading: 'Precision Manufacturing Requirements',
        body: 'CNC machining centers, coordinate measuring machines, and industrial robots use hydraulic servo systems with clearances as small as 2–5 µm. At these tolerances, particles passing through conventional filters can cause servo position errors, hysteresis, and axis hunting. A tight ISO 4406 target of this kind requires NANOFORCE™ precision-grade elements rated to the Beta ratio specified for the approved application, along with commissioning flush procedures.',
      },
      {
        heading: 'Compressed Air Quality',
        body: 'Pneumatic assembly tools, spray painting, pharmaceutical packaging, and food processing all require different compressed air purity classes per ISO 8573-1. Class 1:4:1 (food/pharma) requires sub-0.1 mg/m³ particle concentration, pressure dewpoint ≤+3°C, and oil concentration ≤0.01 mg/m³.',
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
    technologies: ['MACROCORE™', 'SYNTRAX™', 'SYNTAPORE™', 'TURBOCORE™', 'THERMACORE™'],
    standards: ['ISO 5011', 'ISO 16889', 'SAE J1858', 'ISO 12937', 'ASTM D6304'],
    systems: ['Air Intake Protection', 'Lubrication Protection', 'Fuel Cleanliness Protection', 'Cooling System Protection'],
    sections: [
      {
        heading: 'Gas Turbine Air Intake',
        body: 'Gas turbine air filters must remove airborne contaminants without causing turbine inlet pressure drop above design limits — excessive restriction reduces compressor efficiency and turbine output. Coastal installations face salt aerosol that causes turbine blade erosion and compressor fouling. Self-cleaning pulse systems maintain air filters in service longer by periodically back-pulsing compressed air through the media to dislodge accumulated dust.',
      },
      {
        heading: 'Standby Diesel Readiness',
        body: 'Emergency diesel generators (hospital, data center, critical infrastructure) must start and reach full load within 10–30 seconds. Fuel stored in standby tanks accumulates water over months of thermal cycling and atmospheric breathing. TURBOCORE™ fuel polishing — circulating standby fuel through a water separator and fine filter at regular intervals — maintains fuel quality and ensures injector readiness without draining and refilling tanks.',
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


