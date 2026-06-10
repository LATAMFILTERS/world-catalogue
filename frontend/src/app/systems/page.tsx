'use client';

import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { motion } from 'motion/react';

/* ─── DATA ──────────────────────────────────────────────────────────────── */

interface ProductFamily {
  label: string;
  description: string;
  slug: string;
  tech: string;
}

interface ProtectionSystem {
  number: string;
  id: string;
  name: string;
  headline: string;
  mission: string;
  description: string;
  contaminants: string[];
  risk: string[];
  strategy: string;
  outcome: string;
  families: ProductFamily[];
  technologies: string[];
  equipment: string[];
  industries: string[];
  knowledgeLinks: { label: string; href: string }[];
}

const SYSTEMS: ProtectionSystem[] = [
  {
    number: '01',
    id: 'air-intake',
    name: 'Air Intake & Airflow Protection',
    headline: 'COMBUSTION & PNEUMATIC SYSTEM INTEGRITY',
    mission:
      'Protecting combustion efficiency and engine structural integrity by controlling particulate and moisture ingress across air intake and compressed air circuits.',
    description:
      'Air intake contamination is the primary cause of abrasive wear in combustion engines, gas turbines, and industrial compressors. Silica dust at active mining and construction sites reaches 3,000–10,000 mg/m³ — ten to thirty times the ISO 5011 test threshold of 300 mg/m³. Agricultural harvest operations generate organic particulate at 1,500 mg/m³ or more. Offshore gas turbine installations draw salt-laden air at 1–10 mg/m³ NaCl, causing compressor blade corrosion and efficiency losses of 2–5% per 1,000 operating hours. Compressed air circuits serving pneumatic braking, suspension, and process control require moisture removal to ISO 8573-1 Class 1–2 dew point targets. Moisture above −20°C dew point at pressure causes valve icing, actuator seal degradation, and corrosion in safety-critical pneumatic circuits.',
    contaminants: [
      'Silica dust at 3,000–10,000 mg/m³ in mining and earthwork environments — 10 to 30× ISO 5011 test threshold',
      'Agricultural organic particulate at 1,500 mg/m³ during grain, corn, and cotton harvest operations',
      'Salt aerosol at 1–10 mg/m³ NaCl at offshore and coastal gas turbine installations',
      'Moisture and humidity accumulation in compressed air circuits for pneumatic braking and process control',
    ],
    risk: [
      'Engine abrasive wear from silica ingestion reduces cylinder liner and valve train life to 30–40% of design specification',
      'Compressor blade corrosion at offshore installations degrades turbine output efficiency 2–5% per 1,000 operating hours',
      'Pneumatic valve icing in transit braking systems creates safety-critical failures during low-temperature operations',
      'Uncontrolled intake contamination forces interval-based maintenance independent of actual contamination load, increasing service costs',
    ],
    strategy:
      'ELIMFILTERS air intake protection deploys multi-stage capture across primary, safety, and housing elements — engineered to dust concentration levels 10–30× ISO 5011 test thresholds. DRYCORE™ molecular sieve conditioning addresses downstream compressed air circuits within the same protection architecture, treating air intake and pneumatic cleanliness as a unified system rather than separate product categories.',
    outcome:
      'Maintained combustion efficiency through extended service intervals. Extended cylinder liner and valve train service life. Eliminated pneumatic valve icing in braking systems. Reduced abrasive wear failures across high-dust mining, agriculture, and construction environments.',
    families: [
      {
        label: 'Primary Intake Protection',
        description:
          'High-capacity intake protection for diesel engines, gas turbines, and industrial compressors in particulate-laden environments. Maintains ISO 5011-compliant airflow restriction through extended service intervals at dust concentrations up to 10,000 mg/m³.',
        slug: 'airfilter',
        tech: 'MACROCORE™ / SYNTEPORE™',
      },
      {
        label: 'Intake Housing & Pre-Cleaner Assembly',
        description:
          'Integrated pre-separation housing that removes coarse particulate before the primary intake element, extending service intervals and protecting primary element sealing geometry in extreme-dust applications.',
        slug: 'housing',
        tech: 'INTEKCORE™',
      },
      {
        label: 'Compressed Air Conditioning System',
        description:
          'Molecular sieve desiccant system achieving ISO 8573-1 Class 1–2 dew point targets for pneumatic braking, suspension, and process control circuits. Prevents valve icing, actuator corrosion, and seal degradation.',
        slug: 'dryer',
        tech: 'DRYCORE™',
      },
    ],
    technologies: ['MACROCORE™', 'SYNTEPORE™', 'DRYCORE™', 'INTEKCORE™'],
    equipment: [
      'Diesel engines (mobile and stationary)',
      'Gas turbines and centrifugal compressors',
      'Turbochargers',
      'Pneumatic brake and suspension systems',
      'Process control instrumentation air circuits',
    ],
    industries: ['Agriculture', 'Construction', 'Mining', 'Oil & Gas', 'Railway', 'Power Generation', 'Bus & Coach'],
    knowledgeLinks: [
      { label: 'Air Intake Standards (SAE J1539 / ISO 5011)', href: '/knowledge-system/standards/air-intake-systems' },
      { label: 'Compressed Air Systems (ISO 8573)', href: '/knowledge-system/standards/compressed-air-systems' },
      { label: 'Particle Wear in Engines', href: '/knowledge-system/contamination/particle-wear' },
    ],
  },
  {
    number: '02',
    id: 'fuel-cleanliness',
    name: 'Fuel Cleanliness Protection',
    headline: 'INJECTION SYSTEM INTEGRITY',
    mission:
      'Protecting high-pressure injection systems, fuel pumps and combustion efficiency through particle and water contamination control across diesel and marine fuel circuits.',
    description:
      'Modern high-pressure common-rail (HPCR) injection systems operate at 1,800–2,500 bar. Injector needle clearances measure 1–3 µm — where particle contamination above 10 µm causes injector tip erosion and free water above 200 ppm causes hydrogen embrittlement and corrosion of needle alloys. Marine fuel on commercial vessels accumulates water through tank condensation and bunkered fuel quality variation. Diesel stored in offshore or standby tanks reaches ASTM D6304 exceedance within 30–60 days without active separation. Emergency generator fuel stored 6–18 months undergoes biological colonization, oxidative degradation, and gum formation that blocks delivery components and prevents startup under load conditions.',
    contaminants: [
      'Free water from condensation in bulk tanks and bunkered fuel — injector corrosion above 200 ppm',
      'Emulsified water suspended in fuel — pump cavitation and microbial colonization at water-fuel interface',
      'Particulate from tank corrosion products above 10 µm — injector tip erosion at 1,800–2,500 bar injection pressure',
      'Microbial biomass and acidic metabolites from bacteria and fungi at water-fuel interface',
      'Oxidative gum and varnish deposits on injector nozzles during extended fuel storage periods',
    ],
    risk: [
      'HPCR injector tip erosion from particulate above 10 µm at 1,800–2,500 bar causes irreversible needle geometry damage within 500–1,000 operating hours',
      'Free water above 200 ppm causes hydrogen embrittlement of injector needle alloys — failure mode undetectable until injection system replacement is required',
      'Microbial colonization at water-fuel interface degrades fuel quality, blocks filters, and prevents engine startup under load in standby and emergency systems',
      'Injector replacement costs for HPCR systems range from $800–$2,500 per unit — multiplied across 6-cylinder engines, contamination-driven failure represents significant unplanned capital expenditure',
    ],
    strategy:
      'AQUAGUARD™ three-stage turbine-coalescing-precision architecture addresses both water and particulate contamination from storage through delivery. 99.8% free water removal and 95% emulsified water reduction protect injection tolerances at every stage of the fuel circuit — from bulk tank transfer to final delivery at injection pressure.',
    outcome:
      'Protected injection system precision at 1,800–2,500 bar. Extended HPCR injector service life. Prevented biological contamination in stored fuel circuits. Maintained combustion stability and fuel economy under continuous load.',
    families: [
      {
        label: 'Fuel Cleanliness Module',
        description:
          'Primary particulate capture for diesel fuel delivery across mobile and stationary applications. Controls contamination from storage to injection components.',
        slug: 'fuel',
        tech: 'AQUAGUARD™',
      },
      {
        label: 'Turbine-Stage Water Separation',
        description:
          'Three-stage turbine-coalescing-precision separation: 99.8% free water removal, 95% emulsified water reduction. For HPCR injection systems at 1,800–2,500 bar operating pressure.',
        slug: 'aquaguard-series',
        tech: 'AQUAGUARD™',
      },
      {
        label: 'Water-Fuel Separation Module',
        description:
          'Coalescing water separation for high water ingress rate applications including field-fueled construction equipment and marine fuel storage transfer.',
        slug: 'water',
        tech: 'AQUAGUARD™',
      },
      {
        label: 'Marine Fuel Protection',
        description:
          'Corrosion-resistant alloy construction for permanent salt, brine, and humidity exposure. Continuous fuel cleanliness for commercial vessels and offshore support systems.',
        slug: 'marine',
        tech: 'AQUAGUARD™',
      },
    ],
    technologies: ['AQUAGUARD™'],
    equipment: [
      'HPCR diesel engines (1,800–2,500 bar injection)',
      'Common-rail marine diesel engines',
      'Gas turbines on liquid fuel',
      'Standby and emergency diesel generators',
      'Offshore compression and power systems',
    ],
    industries: ['Marine', 'Oil & Gas', 'Power Generation', 'Trucks & Fleets', 'Waste & Municipal', 'Agriculture'],
    knowledgeLinks: [
      { label: 'Fuel Filtration Standards (ASTM D6304)', href: '/knowledge-system/standards/fuel-systems' },
      { label: 'Diesel Water Contamination', href: '/knowledge-system/contamination/diesel-water' },
      { label: 'Fleet Fuel Efficiency', href: '/knowledge-system/fleet/fuel-efficiency' },
    ],
  },
  {
    number: '03',
    id: 'lubrication',
    name: 'Lubrication Reliability Protection',
    headline: 'BEARING AND DRIVETRAIN INTEGRITY',
    mission:
      'Protecting bearing surfaces, valve trains and drivetrain components by maintaining ISO 4406 oil cleanliness codes through extended drain intervals in mobile and stationary diesel applications.',
    description:
      'Engine oil cleanliness measured against ISO 4406 particle count codes determines bearing, cam lobe, valve train, and journal service life across all diesel and gas engine applications. Maintaining ISO 4406 code 16/14/11 or cleaner extends bearing service life three to five times compared to uncontrolled contamination at 19/17/14 — the difference between a 15,000-hour overhaul interval and a 3,000-hour failure event. Urban transit buses and refuse vehicles complete 300–600 engine starts per week, accumulating soot at three to five times the rate of steady-state operation. Long-haul commercial trucks run extended drain programs at 60,000–100,000 km with oil analysis — intervals where lube protection must maintain ISO 4406 targets from service start to drain.',
    contaminants: [
      'Combustion soot above 2% by weight — degrades oil film strength, initiates abrasive bearing wear',
      'Metal wear particles from ring, liner, and bearing contact — create secondary contamination cycles',
      'Fuel dilution from cold-start cycles — thins oil viscosity below SAE specification',
      'Acidic combustion byproducts — attack bearing alloys and reduce oil alkalinity reserve',
      'External particulate ingress through shaft seals and crankcase vents in contaminated field environments',
    ],
    risk: [
      'Contamination above ISO 4406 19/17/14 reduces bearing service life from 15,000+ hours to 3,000 hours — a 5× acceleration in overhaul frequency and unplanned capital expenditure',
      'Soot accumulation above 2% by weight degrades oil film strength, initiating abrasive wear on bearing journals and cam lobes',
      'Fuel dilution from cold-start cycles reduces oil viscosity below SAE specification, causing metal-to-metal contact at startup when lubrication film has not fully established',
      'Cumulative metal wear particles create secondary contamination cycles, accelerating wear rates beyond initial contamination entry levels',
    ],
    strategy:
      'SYNTRAX™ synthetic lube protection maintains ISO 4406 16/14/11 cleanliness across extended drain programs of 60,000–100,000 km. Multi-circuit service kits synchronize oil, air, and fuel service events to eliminate contamination accumulation windows between intervals — treating lubrication as a system-wide cleanliness target rather than a single replacement event.',
    outcome:
      'Extended bearing and drivetrain service life 3–5×. Maintained ISO 4406 cleanliness through long-drain programs. Reduced unplanned engine maintenance events across mobile and stationary fleets. Lower total lubricant consumption through optimized drain intervals.',
    families: [
      {
        label: 'Engine Oil Protection',
        description:
          'Full-flow lubrication protection maintaining ISO 4406 cleanliness codes throughout extended drain intervals for diesel, gas, and dual-fuel engines in mobile and stationary applications.',
        slug: 'oil',
        tech: 'SYNTRAX™',
      },
      {
        label: 'Multi-Circuit Service Package',
        description:
          'Coordinated protection across intake, oil, and fuel circuits in a single scheduled service event. Matched service intervals calibrated for specific equipment platforms.',
        slug: 'kits',
        tech: 'SYNTRAX™',
      },
    ],
    technologies: ['SYNTRAX™'],
    equipment: [
      'Diesel and dual-fuel engines (mobile and stationary)',
      'Natural gas and bi-fuel generator engines',
      'Marine propulsion engines',
      'Industrial engine-driven equipment',
      'Gearboxes and differential housings',
    ],
    industries: ['Trucks & Fleets', 'Bus & Coach', 'Automotive', 'Manufacturing', 'Railway', 'Agriculture'],
    knowledgeLinks: [
      { label: 'Lube Oil Systems (ISO 4406 / ISO 16889)', href: '/knowledge-system/standards/lube-oil-systems' },
      { label: 'Particle Wear Contamination', href: '/knowledge-system/contamination/particle-wear' },
      { label: 'Fleet Total Cost of Ownership', href: '/knowledge-system/fleet/total-cost-ownership' },
    ],
  },
  {
    number: '04',
    id: 'hydraulic',
    name: 'Hydraulic Contamination Control',
    headline: 'PROPORTIONAL VALVE AND ACTUATOR INTEGRITY',
    mission:
      'Protecting proportional valves, actuators and pump integrity by maintaining ISO 4406 cleanliness targets in high-pressure hydraulic circuits across construction, mining and manufacturing equipment.',
    description:
      'Hydraulic systems in mobile equipment, manufacturing machinery, and marine deck systems operate at 200–450 bar. Proportional valve spool clearances measure 5–25 µm — where ISO 4406 cleanliness targets of 16/14/11 or tighter are required to prevent spool stiction, position drift, and pump wear. Silica particles entering hydraulic circuits from construction and mining environments have Mohs hardness 7, harder than valve alloy surfaces — each particle contact above 5 µm creates permanent micro-abrasion on spool faces. At ISO 19/17/14 contamination levels, proportional valve failure rates increase three to five times. Standard return-line protection captures contamination above 25 µm. Sub-micron hydraulic protection captures particles at 1–10 µm that bypass standard systems and drive the progressive valve wear behind 40–60% of unplanned hydraulic maintenance costs.',
    contaminants: [
      'Silica particulate at Mohs hardness 7 — permanent micro-abrasion on valve spool surfaces above 5 µm',
      'Metal wear particles from pump and actuator contact — create secondary contamination cycles in closed-loop circuits',
      'Water ingress through cylinder seals and reservoir condensation — valve corrosion and fluid viscosity degradation',
      'Aeration and cavitation in high-flow circuits — generates micro-particulate and accelerates pump wear',
    ],
    risk: [
      'Silica particles above 5 µm at Mohs hardness 7 create permanent micro-abrasion on valve spool faces — cumulative wear causes position drift and loss of actuator control precision',
      'ISO 19/17/14 contamination levels increase proportional valve failure rates 3–5×, driving 40–60% of unplanned hydraulic maintenance costs in construction and mining fleets',
      'Water ingress through cylinder seals causes valve corrosion and fluid viscosity breakdown — reducing system response and increasing energy consumption',
      'Standard 25 µm return-line protection leaves sub-10 µm particles unaddressed, allowing progressive spool wear to accumulate silently until valve replacement is required',
    ],
    strategy:
      'NANOFORCE™ sub-micron Beta-rated contamination control targets particles at 1–10 µm that bypass standard return-line protection — maintaining ISO 4406 16/14/11 or tighter at 200–450 bar operating pressure. By addressing the contamination range responsible for the majority of valve wear, the system extends proportional valve service life rather than simply managing end-of-life replacement schedules.',
    outcome:
      'Maintained proportional valve precision and actuator response accuracy. Eliminated sub-micron particle accumulation in closed-loop circuits. Reduced hydraulic maintenance costs driven by contamination-related valve failure. Extended pump service life through cleaner circuit operation.',
    families: [
      {
        label: 'Hydraulic Contamination Control Unit',
        description:
          'Sub-micron Beta-rated protection maintaining ISO 4406 16/14/11 or cleaner for proportional valve and actuator integrity across high-pressure hydraulic circuits up to 450 bar.',
        slug: 'hydraulic',
        tech: 'NANOFORCE™',
      },
    ],
    technologies: ['NANOFORCE™'],
    equipment: [
      'Excavators, wheel loaders, and motor graders',
      'Drilling and tunneling equipment',
      'Industrial presses and injection molding machines',
      'Marine crane, winch, and deck machinery',
      'Agricultural implement and harvester hydraulics',
    ],
    industries: ['Construction', 'Mining', 'Manufacturing', 'Agriculture', 'Marine'],
    knowledgeLinks: [
      { label: 'Hydraulic Systems (ISO 16889 / NFPA T2.14)', href: '/knowledge-system/standards/hydraulic-systems' },
      { label: 'Hydraulic System Contamination', href: '/knowledge-system/contamination/hydraulic-system' },
      { label: 'Reducing Fleet Downtime', href: '/knowledge-system/fleet/reducing-downtime' },
    ],
  },
  {
    number: '05',
    id: 'cooling-environmental',
    name: 'Cooling System & Environmental Protection',
    headline: 'THERMAL CIRCUIT AND CABIN INTEGRITY',
    mission:
      'Protecting engine thermal circuits from liner cavitation and coolant degradation, and operator cabins from occupational PM2.5 and VOC exposure in commercial vehicle and construction environments.',
    description:
      'Engine cooling circuits in industrial diesel engines depend on coolant additive concentration to prevent liner cavitation erosion and passage corrosion. Supplemental coolant additives (SCAs) and DCA inhibitors deplete through thermal cycling, electrolytic action, and combustion contamination. When DCA concentration falls below specification, cavitation erosion initiates on wet sleeve liner surfaces within 500–1,000 hours — a failure mode undetectable until compression testing. Operator cabin environments in commercial vehicles and construction equipment expose occupants to PM2.5 concentrations of 30–80 µg/m³ at road level, above WHO 24-hour exposure guidelines. Professional drivers completing 9–11 hour daily schedules accumulate sustained occupational exposure to diesel exhaust particulate classified as Group 1 carcinogen by IARC — regulated under EU Directive 2019/130 and OSHA occupational health standards.',
    contaminants: [
      'DCA depletion below SCA concentration threshold — initiates cavitation erosion on wet sleeve liner surfaces',
      'Corrosion products (aluminum oxide, iron deposits) in cooling passages — reduce heat transfer efficiency',
      'Silicate scale on heat exchanger surfaces — reduces radiator thermal efficiency 10–30% over service life',
      'PM2.5 at 30–80 µg/m³ at street level (road dust, diesel exhaust, brake wear particulate)',
      'Traffic-generated VOC and NOx accumulation in close-following highway and high-density urban conditions',
    ],
    risk: [
      'DCA concentration below specification initiates cavitation erosion on wet sleeve liner surfaces within 500–1,000 hours — undetectable until compression testing reveals liner damage requiring engine overhaul',
      'Silicate scale reduces radiator thermal efficiency 10–30% over service life, increasing engine thermal load and advancing overhaul intervals',
      'Sustained PM2.5 exposure above WHO guidelines in operator cabins creates occupational health liability for fleet operators under EU Directive 2019/130 and OSHA standards',
      'Inadequate cabin VOC filtration in urban transit environments exposes professional drivers to cumulative IARC Group 1 carcinogen exposure across 9–11 hour daily schedules',
    ],
    strategy:
      'COOLTECH™ DCA-replenishing protection continuously restores supplemental coolant additives throughout the service interval — treating cooling system protection as an active chemistry maintenance function, not a passive filter replacement. MICROKAPPA™ multi-stage cabin filtration with activated carbon adsorption addresses operator health as a system-level objective alongside mechanical reliability.',
    outcome:
      'Prevented wet sleeve liner cavitation erosion through continuous DCA concentration maintenance. Maintained radiator thermal efficiency through scale and corrosion control. Reduced operator cabin PM2.5 by up to 85% for EU Directive 2019/130 and OSHA occupational compliance. Extended engine overhaul intervals in wet-liner diesel applications.',
    families: [
      {
        label: 'Cooling Circuit Protection',
        description:
          'DCA-replenishing cooling protection that continuously restores supplemental coolant additives throughout the service interval, preventing liner cavitation erosion and corrosion scaling.',
        slug: 'coolant',
        tech: 'COOLTECH™',
      },
      {
        label: 'Cabin Environmental Protection',
        description:
          'Multi-stage particulate capture combined with activated carbon adsorption for operator cabin protection. Reduces cabin PM2.5 by up to 85% versus standard OEM cabin elements. Supports professional driver health compliance under OSHA and EU Directive 2019/130.',
        slug: 'cabin',
        tech: 'MICROKAPPA™',
      },
    ],
    technologies: ['COOLTECH™', 'MICROKAPPA™'],
    equipment: [
      'Industrial diesel engines with wet sleeve liner construction',
      'Commercial truck and bus cooling circuits',
      'Generator set cooling systems',
      'Commercial vehicle operator cabins',
      'Construction equipment operator environments',
      'Transit bus driver and passenger cabins',
    ],
    industries: ['Trucks & Fleets', 'Bus & Coach', 'Power Generation', 'Construction', 'Waste & Municipal', 'Automotive'],
    knowledgeLinks: [
      { label: 'Cabin Safety Systems (ISO 11155)', href: '/knowledge-system/standards/cabin-safety-systems' },
      { label: 'Fleet Downtime Reduction', href: '/knowledge-system/fleet/reducing-downtime' },
      { label: 'Total Cost of Ownership', href: '/knowledge-system/fleet/total-cost-ownership' },
    ],
  },
];

const TECH_MAP = [
  {
    name: 'MACROCORE™',
    system: '01',
    role: 'Air Intake',
    brief:
      'High-capacity cellulose-synthetic composite intake protection. Maintains ISO 5011-compliant restriction at dust concentrations up to 10,000 mg/m³ across extended service intervals.',
  },
  {
    name: 'SYNTEPORE™',
    system: '01',
    role: 'Air Intake',
    brief:
      'All-synthetic intake protection for high-humidity, coastal, and marine intake environments. Structural integrity is maintained under moisture exposure that degrades cellulose constructions.',
  },
  {
    name: 'INTEKCORE™',
    system: '01',
    role: 'Air Intake',
    brief:
      'Integrated core construction for stationary industrial engines, railway traction systems, and pre-cleaner housing assemblies. Radial seal geometry engineered for high-vibration operating environments.',
  },
  {
    name: 'DRYCORE™',
    system: '01',
    role: 'Compressed Air',
    brief:
      'Molecular sieve desiccant achieving ISO 8573-1 Class 1–2 dew point targets. Prevents valve icing, actuator corrosion, and seal degradation in pneumatic braking and process control systems.',
  },
  {
    name: 'AQUAGUARD™',
    system: '02',
    role: 'Fuel Cleanliness',
    brief:
      '99.8% free water removal, 95% emulsified water reduction via turbine-stage coalescing. Protects HPCR injection systems at 1,800–2,500 bar from water-driven corrosion and stiction failure.',
  },
  {
    name: 'SYNTRAX™',
    system: '03',
    role: 'Lubrication',
    brief:
      'Synthetic lube protection maintaining ISO 4406 16/14/11 through extended drain intervals. Captures soot above 2% by weight, metal wear particles, and fuel dilution byproducts.',
  },
  {
    name: 'NANOFORCE™',
    system: '04',
    role: 'Hydraulic',
    brief:
      'Sub-micron Beta-rated hydraulic contamination control at 200–450 bar. Maintains ISO 4406 cleanliness for proportional valve spool protection in construction, mining, and manufacturing circuits.',
  },
  {
    name: 'COOLTECH™',
    system: '05',
    role: 'Cooling System',
    brief:
      'DCA-replenishing coolant protection restoring SCA concentration throughout the service interval. Prevents wet sleeve liner cavitation erosion and corrosion scaling in industrial diesel cooling circuits.',
  },
  {
    name: 'MICROKAPPA™',
    system: '05',
    role: 'Cabin Protection',
    brief:
      'Multi-stage particulate capture with activated carbon adsorption. Reduces cabin PM2.5 by up to 85% for professional driver health compliance under EU Directive 2019/130 and OSHA standards.',
  },
];

/* ─── SUB-COMPONENTS ─────────────────────────────────────────────────────── */

function ProductFamilyCard({ family }: { family: ProductFamily }) {
  return (
    <motion.div
      whileHover={{ borderColor: 'rgba(255,241,45,0.4)', background: 'rgba(255,241,45,0.025)' }}
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '3px',
        padding: '1.25rem 1.5rem',
        transition: 'border-color 0.25s, background 0.25s',
      }}
    >
      <Link href={`/products/${family.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            color: 'rgba(255,241,45,0.6)',
            letterSpacing: '0.15em',
            margin: '0 0 0.4rem',
          }}
        >
          {family.tech}
        </p>
        <p
          style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: '#fff',
            margin: '0 0 0.6rem',
          }}
        >
          {family.label}
        </p>
        <p
          style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: '0.8rem',
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.5)',
            margin: '0 0 0.75rem',
          }}
        >
          {family.description}
        </p>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: '#FFF12D',
          }}
        >
          VIEW SYSTEM →
        </span>
      </Link>
    </motion.div>
  );
}

function SystemSection({ sys, idx }: { sys: ProtectionSystem; idx: number }) {
  const bg = idx % 2 === 1 ? 'rgba(255,255,255,0.018)' : 'transparent';

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55 }}
      style={{
        background: bg,
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: 'clamp(3rem,6vw,5rem) clamp(1.25rem,5vw,2.5rem)',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.25rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: 'rgba(255,241,45,0.45)',
              letterSpacing: '0.2em',
              flexShrink: 0,
            }}
          >
            SYSTEM {sys.number}
          </span>
          <h2
            style={{
              fontFamily: 'Titillium Web, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1.35rem,3vw,2rem)',
              color: '#fff',
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            {sys.name}
          </h2>
        </div>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            color: '#FFF12D',
            letterSpacing: '0.18em',
            marginBottom: '1rem',
          }}
        >
          {sys.headline}
        </p>

        {/* Mission statement */}
        <p
          style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: '0.95rem',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.85)',
            fontWeight: 500,
            borderLeft: '3px solid rgba(255,241,45,0.5)',
            paddingLeft: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          {sys.mission}
        </p>

        {/* Description */}
        <p
          style={{
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: '0.92rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.65)',
            marginBottom: '2.5rem',
          }}
        >
          {sys.description}
        </p>

        {/* THREAT — Contamination targets */}
        <div
          style={{
            background: 'rgba(255,241,45,0.03)',
            border: '1px solid rgba(255,241,45,0.12)',
            borderRadius: '3px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              color: 'rgba(255,241,45,0.55)',
              letterSpacing: '0.18em',
              marginBottom: '0.75rem',
            }}
          >
            THREAT — CONTAMINATION TARGETS
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.6rem' }}>
            {sys.contaminants.map((c, i) => (
              <li
                key={i}
                style={{
                  fontFamily: 'Titillium Web, sans-serif',
                  fontSize: '0.9rem',
                  lineHeight: 1.65,
                  color: 'rgba(255,255,255,0.78)',
                  paddingLeft: '1.25rem',
                  position: 'relative',
                }}
              >
                <span style={{ position: 'absolute', left: 0, color: '#FFF12D' }}>›</span>
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* RISK */}
        <div
          style={{
            background: 'rgba(255,50,50,0.03)',
            border: '1px solid rgba(255,100,100,0.1)',
            borderRadius: '3px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              color: 'rgba(255,180,180,0.55)',
              letterSpacing: '0.18em',
              marginBottom: '0.75rem',
            }}
          >
            RISK — UNCONTROLLED CONTAMINATION OUTCOMES
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.6rem' }}>
            {sys.risk.map((r, i) => (
              <li
                key={i}
                style={{
                  fontFamily: 'Titillium Web, sans-serif',
                  fontSize: '0.9rem',
                  lineHeight: 1.65,
                  color: 'rgba(255,255,255,0.65)',
                  paddingLeft: '1.25rem',
                  position: 'relative',
                }}
              >
                <span style={{ position: 'absolute', left: 0, color: 'rgba(255,130,130,0.7)' }}>›</span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* PROTECTION STRATEGY */}
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '3px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.18em',
              marginBottom: '0.75rem',
            }}
          >
            PROTECTION STRATEGY
          </p>
          <p
            style={{
              fontFamily: 'Titillium Web, sans-serif',
              fontSize: '0.92rem',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.65)',
              margin: 0,
            }}
          >
            {sys.strategy}
          </p>
        </div>

        {/* Product families */}
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.18em',
            marginBottom: '0.85rem',
          }}
        >
          PROTECTION IMPLEMENTATIONS
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.06)',
            marginBottom: '2.5rem',
          }}
        >
          {sys.families.map((f) => (
            <div key={f.slug} style={{ background: bg === 'transparent' ? '#000' : 'rgb(5,5,5)' }}>
              <ProductFamilyCard family={f} />
            </div>
          ))}
        </div>

        {/* OUTCOME */}
        <div
          style={{
            background: 'rgba(255,241,45,0.04)',
            border: '1px solid rgba(255,241,45,0.18)',
            borderRadius: '3px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              color: 'rgba(255,241,45,0.55)',
              letterSpacing: '0.18em',
              marginBottom: '0.75rem',
            }}
          >
            OUTCOME — ASSET PROTECTION RESULT
          </p>
          <p
            style={{
              fontFamily: 'Titillium Web, sans-serif',
              fontSize: '0.92rem',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 500,
              margin: 0,
            }}
          >
            {sys.outcome}
          </p>
        </div>

        {/* Technologies / Equipment / Industries — 3-col auto grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.58rem',
                color: 'rgba(255,255,255,0.28)',
                letterSpacing: '0.16em',
                marginBottom: '0.6rem',
              }}
            >
              TECHNOLOGIES
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {sys.technologies.map((t) => (
                <Link
                  key={t}
                  href={`/technologies/${t.toLowerCase().replace(/[™®]/g, '').trim()}`}
                  style={{ textDecoration: 'none' }}
                >
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.65rem',
                      color: '#FFF12D',
                      background: 'rgba(255,241,45,0.07)',
                      border: '1px solid rgba(255,241,45,0.2)',
                      borderRadius: '2px',
                      padding: '0.2rem 0.55rem',
                      cursor: 'pointer',
                      display: 'inline-block',
                    }}
                  >
                    {t}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.58rem',
                color: 'rgba(255,255,255,0.28)',
                letterSpacing: '0.16em',
                marginBottom: '0.6rem',
              }}
            >
              ASSETS PROTECTED
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {sys.equipment.map((eq) => (
                <li
                  key={eq}
                  style={{
                    fontFamily: 'Titillium Web, sans-serif',
                    fontSize: '0.78rem',
                    color: 'rgba(255,255,255,0.48)',
                    lineHeight: 1.65,
                  }}
                >
                  {eq}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.58rem',
                color: 'rgba(255,255,255,0.28)',
                letterSpacing: '0.16em',
                marginBottom: '0.6rem',
              }}
            >
              INDUSTRIES
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {sys.industries.map((ind) => (
                <li
                  key={ind}
                  style={{
                    fontFamily: 'Titillium Web, sans-serif',
                    fontSize: '0.78rem',
                    color: 'rgba(255,255,255,0.48)',
                    lineHeight: 1.65,
                  }}
                >
                  {ind}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Knowledge links */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.58rem',
              color: 'rgba(255,255,255,0.22)',
              letterSpacing: '0.16em',
              marginBottom: '0.6rem',
            }}
          >
            KNOWLEDGE SYSTEM
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {sys.knowledgeLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.6rem',
                  color: 'rgba(255,255,255,0.4)',
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '2px',
                  padding: '0.2rem 0.6rem',
                  letterSpacing: '0.06em',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
              >
                {link.label} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────────────────── */

export default function SystemsPage() {
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Industrial Asset Protection Systems — ELIMFILTERS®',
    description:
      'Five industrial asset protection systems covering air intake, fuel cleanliness, lubrication reliability, hydraulic contamination control, and cooling/environmental protection across 12 heavy industry sectors.',
    url: 'https://elimfilters.com/systems',
    dateModified: '2026-06-10',
    author: { '@type': 'Organization', name: 'ELIMFILTERS®', url: 'https://elimfilters.com' },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
      { '@type': 'ListItem', position: 2, name: 'Asset Protection Systems', item: 'https://elimfilters.com/systems' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Why does contamination damage industrial systems?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Industrial contamination — particles, water, heat degradation products, and chemical byproducts — physically damages precision components through abrasive wear, corrosion, and viscosity breakdown. In lube oil circuits, particles smaller than bearing clearances (1–10 µm) create micro-cutting wear on journal surfaces. In fuel systems, water above 200 ppm causes hydrogen embrittlement of injector needle alloys. In hydraulic circuits, particles at Mohs hardness 7 permanently abrade valve spool faces at tolerances of 5–25 µm. The damage is cumulative and progressive — occurring silently over operating hours until component failure triggers unplanned downtime.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is fuel cleanliness and why does it matter?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Fuel cleanliness refers to controlling particle contamination and water content in diesel fuel below the tolerance thresholds of fuel delivery components. Modern high-pressure common-rail (HPCR) injection systems operate at 1,800–2,500 bar with injector needle clearances of 1–3 µm. Particles above 10 µm cause injector tip erosion at these pressures. Free water above 200 ppm causes hydrogen embrittlement and corrosion of needle alloys. Fuel cleanliness is measured against ASTM D6304 (water content) and particle count standards. Without active water separation and particulate control, HPCR injector service life is reduced from 10,000+ hours to under 2,000 hours.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is hydraulic contamination control?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Hydraulic contamination control is the engineering practice of maintaining fluid cleanliness within ISO 4406 particle count targets to protect proportional valves, actuators, and pumps in high-pressure hydraulic circuits. Proportional valves operate at 200–450 bar with spool clearances of 5–25 µm. Particles in this size range cause permanent micro-abrasion on spool faces, leading to position drift and loss of actuator precision. ISO 4406 cleanliness codes (e.g., 16/14/11) define maximum particle counts at 4, 6, and 14 µm sizes. Maintaining these targets requires sub-micron filtration beyond what standard 25 µm return-line systems provide.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why is cooling system protection important for diesel engines?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Diesel engine cooling systems with wet sleeve liner construction depend on supplemental coolant additive (SCA/DCA) concentration to prevent cavitation erosion — a failure mode where coolant pressure waves create micro-bubbles that collapse against liner surfaces, removing metal at a microscopic level. When DCA concentration falls below specification through thermal cycling and electrolytic depletion, cavitation erosion initiates within 500–1,000 operating hours. The damage is undetectable until compression testing reveals liner wear requiring engine overhaul. Passive coolant filters cannot replenish depleted additives — only DCA-replenishing technology like COOLTECH™ maintains protective concentration continuously throughout the service interval.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does lubrication contamination affect equipment life?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Lube oil contamination accelerates bearing and drivetrain wear through three mechanisms: abrasive wear from hard particles (silica, metal oxides) creating micro-cutting on bearing surfaces; viscosity degradation from soot accumulation and fuel dilution reducing oil film strength; and acidic byproduct attack on bearing alloys depleting alkalinity reserve. ISO 4406 cleanliness codes quantify particle contamination levels. Maintaining ISO 16/14/11 extends bearing service life 3–5× versus uncontrolled contamination at 19/17/14 — the difference between a 15,000-hour overhaul interval and a 3,000-hour failure event. Extended drain programs at 60,000–100,000 km require filtration systems that maintain these cleanliness targets from service start to drain.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why does ELIMFILTERS organize protection by systems rather than products?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Equipment reliability is determined by whether contamination in each critical system stays below the threshold that causes measurable wear — not by which filter brand is installed. Air intake, fuel, lubrication, hydraulic, and cooling systems each have distinct contamination types, failure mechanisms, and measurement standards. Organizing by system ensures that the protection strategy addresses the root cause (contamination control) rather than the symptom (filter selection). Product selection is the final step in a system-level decision that begins with identifying the contamination target, applying relevant ISO or ASTM standards as measurement tools, and matching technologies capable of meeting those targets. This is why ELIMFILTERS five systems are defined by contamination domain, not by product category.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the five industrial asset protection systems from ELIMFILTERS®?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ELIMFILTERS® organizes industrial contamination control into five protection systems: Air Intake & Airflow Protection (combustion and pneumatic system integrity), Fuel Cleanliness Protection (injection system integrity), Lubrication Reliability Protection (bearing and drivetrain integrity), Hydraulic Contamination Control (proportional valve and actuator integrity), and Cooling System & Environmental Protection (thermal circuit and cabin integrity). Each system is defined by its contamination target, failure mechanism, product families, and the exclusive technologies that control the contamination pathway.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does AQUAGUARD™ protect HPCR diesel injection systems?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AQUAGUARD™ uses a three-stage turbine-coalescing-precision architecture to remove free water to below ASTM D6304 thresholds (99.8% removal) and emulsified water by 95%. Modern HPCR injection systems operate at 1,800–2,500 bar with injector needle clearances of 1–3 µm. At these tolerances, free water above 200 ppm causes hydrogen embrittlement and corrosion of needle alloys. AQUAGUARD™ prevents these failure modes across long-haul trucks, marine diesel engines, standby generators, and offshore equipment.',
        },
      },
      {
        '@type': 'Question',
        name: 'What ISO 4406 cleanliness target does NANOFORCE™ maintain in hydraulic systems?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'NANOFORCE™ sub-micron hydraulic contamination control maintains ISO 4406 cleanliness codes of 16/14/11 or tighter — the threshold required to prevent proportional valve spool stiction and actuator position drift in construction, mining, and manufacturing hydraulic systems at 200–450 bar operating pressure. At contamination levels above ISO 19/17/14, proportional valve failure rates increase three to five times. NANOFORCE™ captures particles at 1–10 µm that bypass standard return-line protection.',
        },
      },
    ],
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Breadcrumb />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Back nav */}
      <Link
        href="/"
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'rgba(0,0,0,0.88)',
          border: '1px solid rgba(255,241,45,0.35)',
          borderRadius: '4px',
          padding: '0.45rem 1rem',
          fontFamily: 'Titillium Web, sans-serif',
          fontWeight: 700,
          fontSize: '0.72rem',
          letterSpacing: '0.12em',
          color: '#FFF12D',
          textDecoration: 'none',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        ← HOME
      </Link>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section
        style={{
          paddingTop: 'clamp(4rem,10vw,7rem)',
          paddingBottom: 'clamp(3.5rem,8vw,6rem)',
          paddingLeft: 'clamp(1.25rem,5vw,2.5rem)',
          paddingRight: 'clamp(1.25rem,5vw,2.5rem)',
          backgroundImage: 'url(/images/system-hero.avif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          position: 'relative',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.50) 100%)',
            zIndex: 1,
          }}
        />
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.28em',
              color: '#FFF12D',
              marginBottom: '1.25rem',
            }}
          >
            // ASSET PROTECTION SYSTEMS
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            style={{
              fontFamily: 'Titillium Web, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(2rem,5vw,3.75rem)',
              lineHeight: 1.08,
              color: 'rgba(255,255,255,0.95)',
              marginBottom: '1.5rem',
            }}
          >
            Five Systems.<br />One Industrial Protection Architecture.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16 }}
            style={{
              fontFamily: 'Titillium Web, sans-serif',
              fontSize: 'clamp(0.9rem,2vw,1.05rem)',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.68)',
              maxWidth: '660px',
              borderLeft: '3px solid #FFF12D',
              paddingLeft: '1.25rem',
            }}
          >
            Industrial equipment fails when contamination accumulates faster than the protection system
            removes it. ELIMFILTERS® structures contamination control into five engineering domains —
            each defined by its contamination target, failure mechanism, and the exclusive architecture
            that prevents it.
          </motion.p>
        </div>
      </section>

      {/* ── SYSTEMS INTRODUCTION ───────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(3rem,6vw,5rem) clamp(1.25rem,5vw,2.5rem)',
          background: 'rgba(255,241,45,0.025)',
          borderBottom: '1px solid rgba(255,241,45,0.08)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: '#FFF12D',
                letterSpacing: '0.2em',
                marginBottom: '1rem',
                opacity: 0.8,
              }}
            >
              // PROTECTION PHILOSOPHY
            </p>
            <h2
              style={{
                fontFamily: 'Titillium Web, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.5rem,3.5vw,2.2rem)',
                color: '#fff',
                marginBottom: '2rem',
                lineHeight: 1.2,
              }}
            >
              Protecting Assets Through System-Level Contamination Control
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
              <div>
                <p
                  style={{
                    fontFamily: 'Titillium Web, sans-serif',
                    fontSize: '0.92rem',
                    lineHeight: 1.8,
                    color: 'rgba(255,255,255,0.65)',
                    margin: '0 0 1rem',
                  }}
                >
                  Industrial assets do not fail as individual components. Failures occur when contamination enters
                  and damages the critical systems that sustain mechanical performance — air intake circuits,
                  fuel delivery systems, lubrication circuits, hydraulic systems, and thermal management systems.
                </p>
                <p
                  style={{
                    fontFamily: 'Titillium Web, sans-serif',
                    fontSize: '0.92rem',
                    lineHeight: 1.8,
                    color: 'rgba(255,255,255,0.65)',
                    margin: 0,
                  }}
                >
                  ELIMFILTERS organizes contamination control around the systems that sustain equipment
                  performance, reliability and operational continuity. Each system requires different
                  protection strategies, technologies and filtration mechanisms. The objective is not
                  filtration alone. The objective is asset protection.
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: 'Titillium Web, sans-serif',
                    fontSize: '0.92rem',
                    lineHeight: 1.8,
                    color: 'rgba(255,255,255,0.65)',
                    margin: '0 0 1rem',
                  }}
                >
                  A product-centric approach asks: which filter fits my equipment? A system-level approach
                  asks: what contamination is threatening this system, what standard defines the acceptable
                  threshold, and what technology is engineered to meet it?
                </p>
                <p
                  style={{
                    fontFamily: 'Titillium Web, sans-serif',
                    fontSize: '0.92rem',
                    lineHeight: 1.8,
                    color: 'rgba(255,255,255,0.65)',
                    margin: 0,
                  }}
                >
                  Product selection is the last step in this decision, not the first. The five protection
                  systems below are organized by contamination domain — each with its mission, contamination
                  targets, risk outcomes, protection strategy, and measurable asset protection result.
                </p>
              </div>
            </div>

            {/* Visual hierarchy diagram */}
            <div
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,241,45,0.12)',
                borderRadius: '4px',
                padding: '1.75rem 2rem',
              }}
            >
              <p
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.58rem',
                  color: 'rgba(255,255,255,0.25)',
                  letterSpacing: '0.18em',
                  marginBottom: '1.25rem',
                }}
              >
                INFORMATION ARCHITECTURE HIERARCHY
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.72rem',
                }}
              >
                {[
                  { label: 'Industrial Asset Protection', highlight: true },
                  { label: '↓', arrow: true },
                  { label: 'Contamination Control', highlight: false },
                  { label: '↓', arrow: true },
                  { label: 'Systems', highlight: true },
                  { label: '↓', arrow: true },
                  { label: 'Technologies', highlight: false },
                  { label: '↓', arrow: true },
                  { label: 'Products', highlight: false },
                ].map((item, i) => (
                  <span
                    key={i}
                    style={{
                      color: item.arrow
                        ? 'rgba(255,255,255,0.15)'
                        : item.highlight
                        ? '#FFF12D'
                        : 'rgba(255,255,255,0.45)',
                      fontWeight: item.highlight ? 700 : 400,
                    }}
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ARCHITECTURE BRIEF ─────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(2.5rem,5vw,4rem) clamp(1.25rem,5vw,2.5rem)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: '#FFF12D',
                letterSpacing: '0.2em',
                marginBottom: '1rem',
              }}
            >
              CONTAMINATION CONTROL HIERARCHY
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.72rem',
                marginBottom: '1.5rem',
              }}
            >
              {[
                'Contamination Source',
                '→',
                'Entry Pathway',
                '→',
                'Protection System',
                '→',
                'Proprietary Architecture',
                '→',
                'Asset Preserved',
              ].map((step, i) => (
                <span
                  key={i}
                  style={{
                    color:
                      step === '→'
                        ? 'rgba(255,255,255,0.2)'
                        : i === 4
                        ? '#FFF12D'
                        : 'rgba(255,255,255,0.5)',
                    fontWeight: i === 4 ? 700 : 400,
                  }}
                >
                  {step}
                </span>
              ))}
            </div>
            <p
              style={{
                fontFamily: 'Titillium Web, sans-serif',
                fontSize: '0.92rem',
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.55)',
                maxWidth: '780px',
              }}
            >
              Asset reliability is determined by whether contamination entering each system stays below the
              threshold that causes measurable wear. Product selection is the last step in this decision —
              not the first. The five systems below are organized by contamination domain, not by product category.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FIVE SYSTEMS ──────────────────────────────────────────────── */}
      {SYSTEMS.map((sys, idx) => (
        <SystemSection key={sys.id} sys={sys} idx={idx} />
      ))}

      {/* ── TECHNOLOGY INDEX ───────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(3rem,6vw,5rem) clamp(1.25rem,5vw,2.5rem)',
          background: 'rgba(255,241,45,0.02)',
          borderTop: '1px solid rgba(255,241,45,0.1)',
          borderBottom: '1px solid rgba(255,241,45,0.1)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: '#FFF12D',
                letterSpacing: '0.2em',
                marginBottom: '0.5rem',
              }}
            >
              NINE EXCLUSIVE PROTECTION ARCHITECTURES
            </p>
            <h2
              style={{
                fontFamily: 'Titillium Web, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(1.3rem,3vw,1.85rem)',
                color: '#fff',
                marginBottom: '2rem',
              }}
            >
              Technologies are architectures. Not products.
            </h2>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {TECH_MAP.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '3px',
                  padding: '1.5rem',
                }}
              >
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.58rem',
                    color: 'rgba(255,241,45,0.45)',
                    letterSpacing: '0.14em',
                    marginBottom: '0.3rem',
                  }}
                >
                  SYSTEM {t.system} · {t.role.toUpperCase()}
                </p>
                <p
                  style={{
                    fontFamily: 'Titillium Web, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    color: '#fff',
                    marginBottom: '0.6rem',
                  }}
                >
                  {t.name}
                </p>
                <p
                  style={{
                    fontFamily: 'Titillium Web, sans-serif',
                    fontSize: '0.78rem',
                    lineHeight: 1.65,
                    color: 'rgba(255,255,255,0.45)',
                    margin: 0,
                  }}
                >
                  {t.brief}
                </p>
              </motion.div>
            ))}
          </div>

          <div style={{ marginTop: '1.75rem', textAlign: 'right' }}>
            <Link
              href="/technologies"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: '#FFF12D',
                textDecoration: 'none',
              }}
            >
              VIEW TECHNOLOGY PLATFORM →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CROSS-NAVIGATION ───────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(3rem,6vw,5rem) clamp(1.25rem,5vw,2.5rem)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.2em',
                marginBottom: '2rem',
                textAlign: 'center',
              }}
            >
              PROTECTION COVERAGE BY INDUSTRY
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1px',
                background: 'rgba(255,255,255,0.05)',
              }}
            >
              {[
                { name: 'Agriculture', slug: 'agriculture', systems: ['01', '02', '03'] },
                { name: 'Automotive', slug: 'automotive', systems: ['01', '02', '03', '05'] },
                { name: 'Bus & Coach', slug: 'bus-coach', systems: ['01', '03', '01', '05'] },
                { name: 'Construction', slug: 'construction', systems: ['01', '02', '04', '05'] },
                { name: 'Manufacturing', slug: 'manufacturing', systems: ['01', '03', '04'] },
                { name: 'Marine', slug: 'marine', systems: ['02', '03', '04'] },
                { name: 'Mining', slug: 'mining', systems: ['01', '02', '04'] },
                { name: 'Oil & Gas', slug: 'oil-gas', systems: ['01', '02', '03'] },
                { name: 'Power Generation', slug: 'power-generation', systems: ['01', '02', '05'] },
                { name: 'Railway', slug: 'railway', systems: ['01', '02', '03'] },
                { name: 'Trucks & Fleets', slug: 'trucks-fleets', systems: ['01', '02', '03', '05'] },
                { name: 'Waste & Municipal', slug: 'waste-municipal', systems: ['01', '02', '03', '05'] },
              ].map((ind) => (
                <motion.div
                  key={ind.slug}
                  whileHover={{ background: 'rgba(255,241,45,0.04)' }}
                  style={{ background: '#000', padding: '1rem 1.25rem', transition: 'background 0.2s' }}
                >
                  <Link href={`/industries/${ind.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <p
                      style={{
                        fontFamily: 'Titillium Web, sans-serif',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        color: '#fff',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {ind.name}
                    </p>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {Array.from(new Set(ind.systems)).map((s) => (
                        <span
                          key={s}
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.58rem',
                            color: 'rgba(255,241,45,0.6)',
                            background: 'rgba(255,241,45,0.06)',
                            border: '1px solid rgba(255,241,45,0.15)',
                            borderRadius: '2px',
                            padding: '0.15rem 0.4rem',
                          }}
                        >
                          SYS {s}
                        </span>
                      ))}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── GEO / AI DISCOVERABILITY ───────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(3rem,6vw,5rem) clamp(1.25rem,5vw,2.5rem)',
          background: '#000',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: '#FFF12D',
                letterSpacing: '0.2em',
                marginBottom: '1rem',
                opacity: 0.7,
              }}
            >
              // RELIABILITY ENGINEERING CONTEXT
            </p>
            <h2
              style={{
                fontFamily: 'Titillium Web, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.4rem,3vw,2rem)',
                color: '#fff',
                marginBottom: '2rem',
                lineHeight: 1.2,
              }}
            >
              Why Systems Matter More Than Components
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                {
                  label: 'RELIABILITY',
                  text: 'Industrial reliability is determined by the health of critical systems rather than individual replacement parts. A bearing fails not because the oil filter was a particular brand — it fails because particle contamination in the lubrication circuit exceeded the threshold at which abrasive wear rate exceeds the design tolerance. The system determines the outcome; the component is the mechanism.',
                },
                {
                  label: 'SCOPE',
                  text: 'Air intake systems, fuel systems, lubrication systems, hydraulic systems and cooling systems each require unique contamination control strategies. Silica dust in an air intake circuit requires cellulose-synthetic composite capture at concentrations up to 10,000 mg/m³. Water contamination in a fuel system requires turbine-stage coalescing separation to below ASTM D6304 thresholds. Hydraulic contamination requires sub-micron Beta-rated filtration maintaining ISO 4406 16/14/11. These are distinct engineering problems — not variations of the same filter replacement decision.',
                },
                {
                  label: 'STRATEGY',
                  text: 'A system-level approach allows organizations to reduce wear, improve reliability and extend equipment life through coordinated protection measures. Instead of scheduling maintenance by time or mileage, system-level contamination control defines measurable targets — ISO 4406 codes, ASTM water content thresholds, ISO 8573 dew point classes — and selects technologies capable of maintaining those targets throughout the equipment lifecycle.',
                },
                {
                  label: 'OUTCOME',
                  text: 'The result is equipment that operates longer, fails less frequently, and costs less to maintain — not because better filters were purchased, but because contamination was controlled below the thresholds where damage accumulates. Industrial asset protection is a reliability engineering discipline. The products exist to support the systems. The systems exist to protect the assets.',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  style={{
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'flex-start',
                    borderLeft: i === 3 ? '3px solid #FFF12D' : '1px solid rgba(255,255,255,0.08)',
                    paddingLeft: '1.25rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.55rem',
                      letterSpacing: '0.18em',
                      color: '#FFF12D',
                      textTransform: 'uppercase',
                      minWidth: '68px',
                      paddingTop: '0.3rem',
                      opacity: i === 3 ? 1 : 0.55,
                    }}
                  >
                    {item.label}
                  </span>
                  <p
                    style={{
                      fontFamily: i === 3 ? 'Titillium Web, sans-serif' : 'Inter, sans-serif',
                      fontSize: '0.92rem',
                      lineHeight: 1.85,
                      color: i === 3 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.55)',
                      fontWeight: i === 3 ? 600 : 400,
                      margin: 0,
                    }}
                  >
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(3rem,6vw,5rem) clamp(1.25rem,5vw,2.5rem)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.01)',
        }}
      >
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: '#FFF12D',
                letterSpacing: '0.2em',
                marginBottom: '0.75rem',
                opacity: 0.7,
              }}
            >
              // TECHNICAL REFERENCE
            </p>
            <h2
              style={{
                fontFamily: 'Titillium Web, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(1.3rem,3vw,1.85rem)',
                color: '#fff',
                marginBottom: '2.5rem',
              }}
            >
              Systems & Contamination Control — Technical Questions
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {[
              {
                q: 'Why does contamination damage industrial systems?',
                a: 'Industrial contamination — particles, water, degradation products, chemical byproducts — physically damages precision components through abrasive wear, corrosion, and viscosity breakdown. Particles smaller than bearing clearances create micro-cutting wear on journal surfaces. Water above 200 ppm causes hydrogen embrittlement of injector needle alloys. Hard particles at Mohs 7 permanently abrade valve spool faces at tolerances of 5–25 µm. The damage is cumulative and progressive — occurring silently over operating hours until component failure triggers unplanned downtime.',
              },
              {
                q: 'What is fuel cleanliness and why does it matter?',
                a: 'Fuel cleanliness refers to controlling particle contamination and water content in diesel fuel below the tolerance thresholds of fuel delivery components. Modern HPCR injection systems operate at 1,800–2,500 bar with injector needle clearances of 1–3 µm. Particles above 10 µm cause injector tip erosion at these pressures. Free water above 200 ppm causes hydrogen embrittlement and corrosion of needle alloys. Without active water separation and particulate control, HPCR injector service life is reduced from 10,000+ hours to under 2,000 hours.',
              },
              {
                q: 'What is hydraulic contamination control?',
                a: 'Hydraulic contamination control maintains fluid cleanliness within ISO 4406 particle count targets to protect proportional valves, actuators, and pumps in high-pressure circuits. Proportional valves operate at 200–450 bar with spool clearances of 5–25 µm. Particles in this range cause permanent micro-abrasion on spool faces, leading to position drift and loss of actuator precision. Maintaining ISO 4406 targets of 16/14/11 requires sub-micron filtration beyond what standard 25 µm return-line systems provide — this is why NANOFORCE™ captures contamination at 1–10 µm.',
              },
              {
                q: 'Why is cooling system protection important for diesel engines?',
                a: 'Wet sleeve liner diesel engines depend on supplemental coolant additive (SCA/DCA) concentration to prevent cavitation erosion — where coolant pressure waves create micro-bubbles that collapse against liner surfaces, removing metal progressively. When DCA concentration falls below specification through thermal cycling and electrolytic depletion, cavitation erosion initiates within 500–1,000 hours. The damage is undetectable until compression testing reveals liner wear requiring engine overhaul. Passive coolant filters cannot replenish depleted additives — only DCA-replenishing technology maintains protective concentration continuously.',
              },
              {
                q: 'How does lubrication contamination affect equipment life?',
                a: 'Lube oil contamination accelerates bearing and drivetrain wear through three mechanisms: abrasive wear from hard particles creating micro-cutting on bearing surfaces; viscosity degradation from soot and fuel dilution reducing oil film strength; and acidic byproduct attack on bearing alloys. ISO 4406 cleanliness codes quantify contamination levels. Maintaining ISO 16/14/11 extends bearing service life 3–5× versus uncontrolled contamination at 19/17/14 — the difference between a 15,000-hour overhaul interval and a 3,000-hour failure event.',
              },
              {
                q: 'Why does ELIMFILTERS organize protection by systems rather than products?',
                a: 'Equipment reliability is determined by whether contamination in each critical system stays below the threshold that causes measurable wear — not by which filter brand is installed. Air intake, fuel, lubrication, hydraulic, and cooling systems each have distinct contamination types, failure mechanisms, and measurement standards (SAE J1539, ASTM D6304, ISO 4406, ISO 16889, ISO 8573). Organizing by system ensures the protection strategy addresses root cause rather than symptom. Product selection is the final step in a system-level decision that begins with identifying the contamination target.',
              },
              {
                q: 'What are the five asset protection systems?',
                a: 'Air Intake & Airflow Protection, Fuel Cleanliness Protection, Lubrication Reliability Protection, Hydraulic Contamination Control, and Cooling System & Environmental Protection. Each system targets a specific contamination pathway — from silica dust ingestion in air intake circuits to moisture accumulation in HPCR fuel systems — and is served by one or more exclusive protection architectures including MACROCORE™, AQUAGUARD™, SYNTRAX™, NANOFORCE™, COOLTECH™, and MICROKAPPA™.',
              },
              {
                q: 'How does AQUAGUARD™ protect HPCR injection systems?',
                a: 'AQUAGUARD™ uses three-stage turbine-coalescing-precision separation to remove free water to below ASTM D6304 thresholds (99.8% removal) and emulsified water by 95%. HPCR injection operates at 1,800–2,500 bar with needle clearances of 1–3 µm — tolerances where free water above 200 ppm causes hydrogen embrittlement and corrosion of needle alloys within 200–500 operating hours.',
              },
              {
                q: 'What hydraulic cleanliness standard does NANOFORCE™ maintain?',
                a: 'NANOFORCE™ maintains ISO 4406 cleanliness codes of 16/14/11 or tighter — the threshold required to prevent proportional valve spool stiction and actuator position drift at 200–450 bar. At contamination levels above ISO 19/17/14, proportional valve failure rates increase three to five times. NANOFORCE™ captures particles at 1–10 µm that bypass standard return-line protection systems.',
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                style={{
                  padding: '1.5rem 1.75rem',
                  background: 'rgba(255,241,45,0.025)',
                  border: '1px solid rgba(255,241,45,0.1)',
                  borderRadius: '3px',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Titillium Web, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: '#FFF12D',
                    margin: '0 0 0.75rem',
                  }}
                >
                  {faq.q}
                </h3>
                <p
                  style={{
                    fontFamily: 'Titillium Web, sans-serif',
                    fontSize: '0.88rem',
                    lineHeight: 1.75,
                    color: 'rgba(255,255,255,0.68)',
                    margin: 0,
                  }}
                >
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(3.5rem,7vw,6rem) clamp(1.25rem,5vw,2.5rem)',
          background: 'linear-gradient(135deg, rgba(255,241,45,0.05) 0%, transparent 60%)',
          borderTop: '1px solid rgba(255,241,45,0.12)',
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              style={{
                fontFamily: 'Titillium Web, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(1.5rem,3.5vw,2.1rem)',
                color: '#fff',
                marginBottom: '1rem',
                lineHeight: 1.2,
              }}
            >
              Identify the right protection system for your equipment
            </h2>
            <p
              style={{
                fontFamily: 'Titillium Web, sans-serif',
                fontSize: '0.95rem',
                lineHeight: 1.75,
                color: 'rgba(255,255,255,0.55)',
                marginBottom: '2.5rem',
              }}
            >
              Cross-reference 500,000+ part numbers across all five protection systems.
              Match your equipment platform and contamination environment to the correct
              protection architecture.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <Link
                href="/industries"
                style={{
                  background: '#FFF12D',
                  color: '#000',
                  fontFamily: 'Titillium Web, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  letterSpacing: '0.12em',
                  padding: '0.85rem 2rem',
                  borderRadius: '2px',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                BROWSE BY INDUSTRY
              </Link>
              <Link
                href="/technologies"
                style={{
                  background: 'transparent',
                  color: '#FFF12D',
                  border: '1px solid rgba(255,241,45,0.45)',
                  fontFamily: 'Titillium Web, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  letterSpacing: '0.12em',
                  padding: '0.85rem 2rem',
                  borderRadius: '2px',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                VIEW TECHNOLOGIES
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
