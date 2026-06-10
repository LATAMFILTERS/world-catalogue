'use client';

import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { useState } from 'react';
import { motion } from 'motion/react';
import { catalogue, getSlug } from '@/lib/catalogue';

/* ─── TECHNOLOGY PLATFORM DATA ──────────────────────────────────────────── */

interface TechPlatformData {
  system: string;
  metric: string;
  short: string;
  purpose: string;
  contaminationTarget: string;
  engineeringPrinciple: string;
  systemApplications: string[];
  outcome: string[];
  relatedSystems: { label: string; href: string }[];
  relatedKnowledge: { label: string; href: string }[];
  industries: string[];
}

const TECH_PLATFORM: Record<string, TechPlatformData> = {
  'macrocore': {
    system: 'Air Intake',
    metric: '99.9–99.98% · ISO 5011 · 10,000 mg/m³',
    short: 'Progressive Density Gradient multi-layer air filtration. Handles dust concentrations up to 10,000 mg/m³ in mining and construction.',
    purpose: 'Engineered to protect combustion engines, gas turbines, and industrial compressors from airborne particulate ingestion in high-dust environments. Controls silica, mineral, and organic particulate before it reaches intake valves, turbochargers, and compressor blades.',
    contaminationTarget: 'Silica dust at 3,000–10,000 mg/m³ · Mineral particulate · Organic harvest dust · Coarse industrial airborne contamination',
    engineeringPrinciple: 'Progressive Density Gradient construction deploys multi-layer cellulose-synthetic composite media graded from coarse outer capture to fine inner retention. Outer layers intercept large particles and distribute dirt loading across the full media depth; inner layers capture sub-20 µm particles. Maintains airflow restriction within ISO 5011 limits at dust concentrations 10–30× the ISO 5011 test threshold of 300 mg/m³.',
    systemApplications: ['Air Intake & Airflow Protection'],
    outcome: ['Extended cylinder liner and valve train service life in high-dust mining, construction, and harvest environments', 'ISO 5011-compliant restriction maintained through extended service intervals at 10,000 mg/m³ dust concentration', 'Reduced abrasive wear from silica ingestion in turbochargers and compressor stages'],
    relatedSystems: [{ label: 'Air Intake & Airflow System', href: '/systems' }],
    relatedKnowledge: [{ label: 'Air Intake Standards', href: '/knowledge-system/standards/air-intake-systems' }, { label: 'Particle Wear in Engines', href: '/knowledge-system/contamination/particle-wear' }],
    industries: ['Mining', 'Construction', 'Agriculture', 'Power Generation'],
  },
  'syntepore': {
    system: 'Air Intake',
    metric: 'ISO 5011 · Moisture-resistant · All-synthetic',
    short: 'All-synthetic air intake for high-humidity, coastal, and marine environments where cellulose media would degrade.',
    purpose: 'Engineered for air intake protection in high-humidity, coastal, and marine environments where moisture exposure degrades cellulose-based media constructions. Maintains filtration efficiency where MACROCORE™ cellulose-synthetic composite media cannot be specified.',
    contaminationTarget: 'Airborne particulate in humid, salt-laden, and marine environments · Moisture-contaminated intake air · Salt aerosol at 1–10 mg/m³ NaCl',
    engineeringPrinciple: 'All-synthetic multi-layer media eliminates the hydrolytic degradation and tensile strength loss that affects cellulose-containing media under continuous moisture exposure. Synthetic fiber construction maintains structural geometry, pleat stability, and filtration efficiency under humidity conditions that cause cellulose media to soften, deform, and lose media-to-endcap bond integrity.',
    systemApplications: ['Air Intake & Airflow Protection'],
    outcome: ['Maintained combustion air cleanliness in marine and coastal operating environments', 'Structural performance stability under humidity and salt spray that degrades conventional intake media', 'Consistent ISO 5011 performance in offshore and tropical climate applications'],
    relatedSystems: [{ label: 'Air Intake & Airflow System', href: '/systems' }],
    relatedKnowledge: [{ label: 'Air Intake Standards', href: '/knowledge-system/standards/air-intake-systems' }],
    industries: ['Marine', 'Oil & Gas', 'Bus & Coach', 'Railway'],
  },
  'intekcore': {
    system: 'Air Intake',
    metric: 'Zero-bypass · Radial seal · High-vibration rated',
    short: 'High-pressure filter housing architecture delivering zero-bypass performance under peak system pressure in heavy-duty machinery.',
    purpose: 'Engineered for stationary industrial engines, railway traction systems, and pre-cleaner housing assemblies operating under continuous vibration loading. Prevents bypass at seal interfaces where mechanical movement from vibration would compromise conventional intake element seating.',
    contaminationTarget: 'Coarse and fine airborne particulate in high-vibration industrial, railway, and power generation environments',
    engineeringPrinciple: 'Integrated core construction provides radial seal geometry with reinforced end-cap and pleat structure engineered for sustained vibration exposure. Radial sealing against the housing bore maintains zero-bypass even under the mechanical loading of railway traction systems — where axial end-cap seals can lift and allow contaminated air to bypass the filtration media during vibration cycles.',
    systemApplications: ['Air Intake & Airflow Protection'],
    outcome: ['Zero-bypass air intake protection in high-vibration railway traction and industrial power environments', 'Extended service life in stationary engine applications with continuous mechanical loading', 'Reliable seal geometry performance where axial-seal designs are unsuitable'],
    relatedSystems: [{ label: 'Air Intake & Airflow System', href: '/systems' }],
    relatedKnowledge: [{ label: 'Air Intake Standards', href: '/knowledge-system/standards/air-intake-systems' }],
    industries: ['Railway', 'Power Generation', 'Mining', 'Oil & Gas'],
  },
  'drycore': {
    system: 'Compressed Air',
    metric: 'ISO 8573-1 Class 1–2 · −20°C dew point',
    short: 'Molecular sieve desiccant system. Removes moisture from compressed air preventing valve icing, seal degradation, and corrosion.',
    purpose: 'Engineered to remove moisture from compressed air circuits to ISO 8573-1 Class 1–2 dew point targets, preventing valve icing and actuator seal degradation in pneumatic braking, suspension, and process control systems.',
    contaminationTarget: 'Water vapor and moisture in compressed air for pneumatic braking, suspension, and process control instrumentation circuits',
    engineeringPrinciple: 'Molecular sieve desiccant architecture adsorbs water vapor at pressure to achieve dew points below −20°C. Molecular sieve lattice structure traps water molecules through physical adsorption based on molecular diameter — providing consistent moisture removal across varying inlet humidity and temperature conditions. Unlike silica gel, molecular sieve maintains adsorption performance at lower relative humidity and does not release adsorbed water at elevated temperatures.',
    systemApplications: ['Air Intake & Airflow Protection'],
    outcome: ['Eliminated pneumatic valve icing in safety-critical railway and transit braking systems', 'Prevented actuator seal degradation and corrosion in process control pneumatic circuits', 'ISO 8573-1 Class 1–2 dew point compliance for regulated compressed air applications'],
    relatedSystems: [{ label: 'Air Intake & Airflow System', href: '/systems' }],
    relatedKnowledge: [{ label: 'Compressed Air Systems', href: '/knowledge-system/standards/compressed-air-systems' }],
    industries: ['Railway', 'Bus & Coach', 'Manufacturing', 'Oil & Gas'],
  },
  'aquaguard': {
    system: 'Fuel Cleanliness',
    metric: '99.8% water removal · ASTM D6304 · 1,800–2,500 bar',
    short: 'Hydrophobic water-separation for diesel and turbine fuel at 99.8% efficiency. Protects HPCR injectors from corrosion and cavitation.',
    purpose: 'Designed to separate free and emulsified water from diesel fuel before it damages high-pressure common-rail injection components. Protects HPCR injection systems at 1,800–2,500 bar — where free water above 200 ppm causes hydrogen embrittlement and corrosion of injector needle alloys at 1–3 µm clearances.',
    contaminationTarget: 'Free water from tank condensation and bunkered fuel · Emulsified water at water-fuel interface · Particulate above 10 µm · Microbial contamination from water-fuel interface',
    engineeringPrinciple: 'Three-stage turbine-coalescing-precision architecture: turbine pre-separation removes bulk water through centrifugal force; hydrophobic coalescing media aggregates emulsified water droplets for gravity separation in the collection bowl; precision stage captures residual particulate at final delivery. Achieves 99.8% free water removal and 95% emulsified water reduction per ASTM D6304 — below the 200 ppm threshold where hydrogen embrittlement of injector needle alloys initiates.',
    systemApplications: ['Fuel Cleanliness Protection'],
    outcome: ['Protected HPCR injection system precision at 1,800–2,500 bar', 'Prevented hydrogen embrittlement and corrosion of injector needle alloys', 'Extended injector service life in long-haul, marine, and standby generator applications'],
    relatedSystems: [{ label: 'Fuel Cleanliness Protection System', href: '/systems' }],
    relatedKnowledge: [{ label: 'Fuel Systems Standards', href: '/knowledge-system/standards/fuel-systems' }, { label: 'Diesel Water Contamination', href: '/knowledge-system/contamination/diesel-water' }],
    industries: ['Trucks & Fleets', 'Marine', 'Oil & Gas', 'Power Generation'],
  },
  'aquaguard-series': {
    system: 'Fuel Cleanliness',
    metric: '99.8% free water removal · High-flow power systems',
    short: 'Heavy-duty turbine fuel filter/water separator. Three-stage protection for high-flow power generation and mining fuel systems.',
    purpose: 'Engineered for high-flow fuel delivery systems in power generation, mining, and heavy commercial transport where fuel volume and contamination load require higher capacity than standard fuel cleanliness modules.',
    contaminationTarget: 'Free water, emulsified water, and particulate contamination in high-volume fuel delivery for stationary power systems and mining equipment',
    engineeringPrinciple: 'Heavy-duty turbine-stage coalescing construction with expanded housing volume and media area for high-flow applications. Maintains 99.8% free water removal efficiency across flow rates exceeding standard mobile diesel applications. Corrosion-resistant construction for stationary and marine installation environments.',
    systemApplications: ['Fuel Cleanliness Protection'],
    outcome: ['High-volume fuel cleanliness protection for power generation and mining fuel systems', 'Maintained ASTM D6304 water content compliance at elevated fuel flow rates', 'Extended service intervals in high-demand stationary fuel applications'],
    relatedSystems: [{ label: 'Fuel Cleanliness Protection System', href: '/systems' }],
    relatedKnowledge: [{ label: 'Fuel Systems Standards', href: '/knowledge-system/standards/fuel-systems' }, { label: 'Diesel Water Contamination', href: '/knowledge-system/contamination/diesel-water' }],
    industries: ['Power Generation', 'Mining', 'Marine', 'Oil & Gas'],
  },
  'syntrax': {
    system: 'Lubrication',
    metric: 'ISO 4406 16/14/11 · Soot >2% · 60,000–100,000 km',
    short: 'Synthetic lubrication protection maintaining ISO cleanliness codes through extended drain intervals for diesel and dual-fuel engines.',
    purpose: 'Engineered to maintain ISO 4406 oil cleanliness codes in diesel engine lubrication circuits through extended drain intervals, preventing abrasive bearing wear from soot accumulation and particle contamination at 15,000+ hour overhaul targets.',
    contaminationTarget: 'Combustion soot above 2% by weight · Metal wear particles from ring and bearing contact · Fuel dilution byproducts · Acidic combustion residues · External particulate ingress',
    engineeringPrinciple: 'Synthetic multi-layer lube media combines high-capacity soot adsorption with sub-micron particle retention across extended service intervals. Media construction balances dirt-holding capacity for 60,000–100,000 km drain programs with pressure drop control under cold-start viscosity conditions. Maintains ISO 4406 16/14/11 cleanliness codes from service start to drain — preventing the contamination accumulation that reduces bearing life from 15,000 hours to 3,000 hours.',
    systemApplications: ['Lubrication Reliability Protection'],
    outcome: ['Extended bearing and drivetrain service life 3–5× versus uncontrolled contamination at ISO 19/17/14', 'ISO 4406 16/14/11 cleanliness maintained through long-drain programs of 60,000–100,000 km', 'Reduced soot-accelerated wear in high-cycle urban transit and long-haul commercial transport applications'],
    relatedSystems: [{ label: 'Lubrication Reliability Protection System', href: '/systems' }],
    relatedKnowledge: [{ label: 'Lube Oil Systems Standards', href: '/knowledge-system/standards/lube-oil-systems' }, { label: 'Particle Wear in Engines', href: '/knowledge-system/contamination/particle-wear' }],
    industries: ['Trucks & Fleets', 'Bus & Coach', 'Agriculture', 'Railway'],
  },
  'nanoforce': {
    system: 'Hydraulic',
    metric: 'ISO 4406 16/14/11 · 1–10 µm · 200–450 bar',
    short: 'Multi-layer hydraulic architecture for high-pressure circuits. Sub-micron contamination interception protecting proportional valves.',
    purpose: 'Engineered to maintain ISO 4406 cleanliness at sub-micron levels in high-pressure hydraulic circuits, protecting proportional valve spool geometry and actuator precision from the particle size range that bypasses standard return-line protection.',
    contaminationTarget: 'Sub-micron particulate at 1–10 µm bypassing standard 25 µm return-line filtration · Silica at Mohs hardness 7 · Metal wear particles from pump contact · Water ingress through cylinder seals',
    engineeringPrinciple: 'Multi-layer hydraulic media with ISO 16889 Beta-rated sub-micron retention intercepts particles at 1–10 µm — the contamination range responsible for progressive valve spool wear that standard 25 µm systems do not address. Beta ratio construction provides measured efficiency values per ISO 16889 multi-pass test protocol at 200–450 bar operating pressure. Maintains ISO 4406 16/14/11 in closed-loop circuits where contamination accumulates from pump, actuator, and external ingress sources.',
    systemApplications: ['Hydraulic Contamination Control'],
    outcome: ['Maintained proportional valve spool precision and actuator response accuracy', 'Eliminated sub-micron particle accumulation driving 40–60% of unplanned hydraulic maintenance costs', 'Extended pump service life in construction, mining, and manufacturing high-pressure circuits'],
    relatedSystems: [{ label: 'Hydraulic Contamination Control System', href: '/systems' }],
    relatedKnowledge: [{ label: 'Hydraulic Systems Standards', href: '/knowledge-system/standards/hydraulic-systems' }, { label: 'Hydraulic System Contamination', href: '/knowledge-system/contamination/hydraulic-system' }],
    industries: ['Construction', 'Mining', 'Manufacturing', 'Agriculture'],
  },
  'cooltech': {
    system: 'Cooling System',
    metric: 'SCA dosing · DCA concentration maintenance · Liner protection',
    short: 'Supplemental Coolant Additive release technology preventing liner pitting and scale in diesel engine cooling circuits.',
    purpose: 'Engineered to continuously replenish supplemental coolant additives throughout the service interval, preventing cavitation erosion on wet sleeve liner surfaces and corrosion scaling in industrial diesel engine cooling circuits.',
    contaminationTarget: 'DCA depletion below cavitation-protection threshold · Corrosion products in cooling passages · Silicate scale on heat exchanger surfaces · Electrolytic degradation of coolant additive package',
    engineeringPrinciple: 'Slow-release DCA matrix dissolves supplemental coolant additives at a controlled rate matched to the thermal cycling and electrolytic depletion rate. Maintains protective DCA concentration above the cavitation suppression threshold throughout the full service interval. Unlike passive coolant filters that capture particulate but cannot replenish depleted chemistry, COOLTECH™ treats cooling system protection as an active chemistry maintenance function.',
    systemApplications: ['Cooling System & Environmental Protection'],
    outcome: ['Prevented wet sleeve liner cavitation erosion — a failure mode that initiates within 500–1,000 hours below DCA threshold', 'Maintained radiator thermal efficiency through scale and corrosion product control', 'Extended engine overhaul intervals in wet-liner industrial diesel and commercial transport applications'],
    relatedSystems: [{ label: 'Cooling System & Environmental Protection', href: '/systems' }],
    relatedKnowledge: [{ label: 'Fleet Total Cost of Ownership', href: '/knowledge-system/fleet/total-cost-ownership' }],
    industries: ['Trucks & Fleets', 'Bus & Coach', 'Power Generation', 'Construction'],
  },
  'microkappa': {
    system: 'Cabin Protection',
    metric: 'Up to 85% PM2.5 reduction · IARC Group 1 · EU 2019/130',
    short: 'Electrostatic cabin air filtration combining HEPA-grade particle capture and activated carbon against diesel exhaust particulate.',
    purpose: 'Engineered to reduce operator cabin PM2.5 and VOC concentrations in commercial vehicles and construction equipment, protecting professional driver health from diesel exhaust particulate exposure regulated under EU Directive 2019/130 and OSHA occupational health standards.',
    contaminationTarget: 'PM2.5 at 30–80 µg/m³ at road level · Diesel exhaust soot (IARC Group 1 carcinogen) · NOx and VOC from urban traffic · Brake wear and road dust particulate',
    engineeringPrinciple: 'Multi-stage architecture combines HEPA-grade mechanical particle capture with activated carbon adsorption. The mechanical stage captures PM2.5 particles through interception, impaction, and diffusion mechanisms across graded fiber layers. The activated carbon stage adsorbs volatile organic compounds, nitrogen dioxide, and diesel exhaust chemicals through chemisorption — providing dual protection against particle and chemical contamination that single-mechanism cabin filters cannot address.',
    systemApplications: ['Cooling System & Environmental Protection'],
    outcome: ['Reduced operator cabin PM2.5 by up to 85% versus standard OEM cabin elements', 'Supported professional driver occupational health compliance under EU Directive 2019/130 and OSHA standards', 'Reduced sustained exposure to IARC Group 1 carcinogen diesel exhaust particulate in 9–11 hour professional driving schedules'],
    relatedSystems: [{ label: 'Cooling System & Environmental Protection', href: '/systems' }],
    relatedKnowledge: [{ label: 'Cabin Safety Systems', href: '/knowledge-system/standards/cabin-safety-systems' }],
    industries: ['Trucks & Fleets', 'Bus & Coach', 'Construction', 'Waste & Municipal'],
  },
  'marineclean': {
    system: 'Marine & Offshore',
    metric: 'IMO certified · ASTM B117 · Salt-resistant',
    short: 'Salt-resistant filtration with epoxy brine-rejection coating for fuel and lube systems aboard vessels and offshore platforms.',
    purpose: 'Engineered for continuous fuel and lubrication protection aboard commercial vessels and offshore platforms where salt brine, humidity, and marine corrosion prevent the use of standard land-based filtration components.',
    contaminationTarget: 'Salt brine and humidity on component surfaces · Marine fuel water contamination · Particulate in marine diesel and bunker fuel delivery circuits',
    engineeringPrinciple: 'Epoxy brine-rejection coating on housing and end-cap components provides ASTM B117 salt spray resistance for extended offshore service. IMO-certified construction meets marine flag state requirements for onboard filtration equipment. Internal media construction maintains AQUAGUARD™-equivalent water separation and particle capture performance in marine fuel and lube circuits.',
    systemApplications: ['Fuel Cleanliness Protection', 'Lubrication Reliability Protection'],
    outcome: ['Extended service life in permanent marine salt and humidity exposure environments', 'IMO-compliant filtration for regulated commercial maritime operations', 'Fuel and lubrication cleanliness protection aboard commercial vessels and offshore support platforms'],
    relatedSystems: [{ label: 'Fuel Cleanliness Protection System', href: '/systems' }],
    relatedKnowledge: [{ label: 'Fuel Systems Standards', href: '/knowledge-system/standards/fuel-systems' }],
    industries: ['Marine', 'Oil & Gas'],
  },
  'duratech': {
    system: 'Fleet Maintenance',
    metric: 'OEM-interchangeable · Mixed-fleet standardisation',
    short: 'Fleet maintenance standardisation consolidating OEM-interchangeable filtration into master kits for mixed-fleet operations.',
    purpose: 'Engineered to standardize contamination control programs across mixed-fleet operations by consolidating OEM-interchangeable filter specifications into coordinated service kits — reducing procurement complexity and ensuring coordinated protection across all five contamination domains.',
    contaminationTarget: 'Multi-domain contamination across intake, fuel, lube, hydraulic, and cooling circuits in mixed-fleet operating environments',
    engineeringPrinciple: 'OEM cross-reference architecture maps ELIMFILTERS technology specifications to OEM part numbers across major equipment platforms. Consolidated kit construction synchronizes service intervals across protection domains — ensuring that intake, oil, and fuel protection changes are coordinated rather than performed independently at mismatched intervals that create contamination accumulation windows.',
    systemApplications: ['Air Intake & Airflow Protection', 'Fuel Cleanliness Protection', 'Lubrication Reliability Protection'],
    outcome: ['Reduced fleet procurement complexity through consolidated kit specifications', 'Synchronized multi-domain service intervals across mixed-equipment platforms', 'Consistent contamination control standards across heterogeneous fleet operations'],
    relatedSystems: [{ label: 'All Five Protection Systems', href: '/systems' }],
    relatedKnowledge: [{ label: 'Fleet Total Cost of Ownership', href: '/knowledge-system/fleet/total-cost-ownership' }, { label: 'Reducing Fleet Downtime', href: '/knowledge-system/fleet/reducing-downtime' }],
    industries: ['Trucks & Fleets', 'Construction', 'Agriculture', 'Mining'],
  },
};

const SYSTEM_GROUPS = [
  { label: 'Air Intake', techs: ['macrocore', 'syntepore', 'intekcore'] },
  { label: 'Fuel Cleanliness', techs: ['aquaguard', 'aquaguard-series'] },
  { label: 'Lubrication', techs: ['syntrax'] },
  { label: 'Hydraulic', techs: ['nanoforce'] },
  { label: 'Compressed Air', techs: ['drycore'] },
  { label: 'Cooling System', techs: ['cooltech'] },
  { label: 'Cabin Protection', techs: ['microkappa'] },
  { label: 'Marine & Offshore', techs: ['marineclean'] },
  { label: 'Fleet Maintenance', techs: ['duratech'] },
];

/* ─── TECH CARD COMPONENT ────────────────────────────────────────────────── */

function TechCard({ tech, index }: { tech: (typeof catalogue.technologies)[number]; index: number }) {
  const slug = getSlug(tech.name);
  const meta = TECH_PLATFORM[slug];
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          height: '100%',
          padding: '2rem',
          background: hovered ? 'rgba(255,241,45,0.03)' : '#050505',
          border: `1px solid ${hovered ? 'rgba(255,241,45,0.3)' : 'rgba(255,255,255,0.06)'}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* System label + entity ownership */}
        {meta && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.58rem',
              letterSpacing: '0.18em',
              color: hovered ? '#FFF12D' : 'rgba(255,241,45,0.45)',
              textTransform: 'uppercase',
              transition: 'color 0.3s ease',
            }}>
              {meta.system}
            </span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.52rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.18)',
              textTransform: 'uppercase',
            }}>
              ELIMFILTERS
            </span>
          </div>
        )}

        {/* Technology name */}
        <h3 style={{
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 600,
          fontSize: 'clamp(1.1rem, 1.8vw, 1.3rem)',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          color: hovered ? '#fff' : 'rgba(255,255,255,0.85)',
          margin: 0,
          transition: 'color 0.3s ease',
        }}>
          {tech.title || tech.name}
        </h3>

        {/* PURPOSE */}
        {meta?.purpose && (
          <div>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.52rem',
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.22)',
              textTransform: 'uppercase',
              marginBottom: '0.4rem',
            }}>
              Purpose
            </p>
            <p style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: 400,
              fontSize: '0.82rem',
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.55)',
              margin: 0,
            }}>
              {meta.purpose}
            </p>
          </div>
        )}

        {/* CONTAMINATION TARGET */}
        {meta?.contaminationTarget && (
          <div style={{
            background: 'rgba(255,241,45,0.03)',
            border: '1px solid rgba(255,241,45,0.1)',
            borderRadius: '2px',
            padding: '0.75rem 1rem',
          }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.52rem',
              letterSpacing: '0.15em',
              color: 'rgba(255,241,45,0.4)',
              textTransform: 'uppercase',
              marginBottom: '0.4rem',
            }}>
              Contamination Target
            </p>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.5)',
              margin: 0,
            }}>
              {meta.contaminationTarget}
            </p>
          </div>
        )}

        {/* OUTCOME */}
        {meta?.outcome && (
          <div style={{ flexGrow: 1 }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.52rem',
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.22)',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}>
              Asset Protection Outcome
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.35rem' }}>
              {meta.outcome.map((o, i) => (
                <li key={i} style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontSize: '0.78rem',
                  lineHeight: 1.55,
                  color: 'rgba(255,255,255,0.45)',
                  paddingLeft: '1rem',
                  position: 'relative',
                }}>
                  <span style={{ position: 'absolute', left: 0, color: '#FFF12D', fontSize: '0.7rem' }}>›</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Metric */}
        {meta?.metric && (
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            letterSpacing: '0.08em',
            color: 'rgba(255,241,45,0.6)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: '1rem',
          }}>
            {meta.metric}
          </div>
        )}

        {/* Related links */}
        {meta?.relatedKnowledge && meta.relatedKnowledge.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {meta.relatedKnowledge.map((link) => (
              <Link key={link.href} href={link.href} style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.55rem',
                letterSpacing: '0.06em',
                color: 'rgba(255,255,255,0.3)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '2px',
                padding: '0.15rem 0.5rem',
                textDecoration: 'none',
                transition: 'color 0.2s, border-color 0.2s',
              }}>
                {link.label} →
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <Link href={`/technologies/${slug}`} style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: hovered ? '#FFF12D' : 'rgba(255,255,255,0.25)',
              transition: 'color 0.3s ease',
            }}>
              Explore architecture
            </span>
            <svg
              width="10" height="10" viewBox="0 0 24 24" fill="none"
              stroke={hovered ? '#FFF12D' : 'rgba(255,255,255,0.25)'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: 'stroke 0.3s ease, transform 0.3s ease', transform: hovered ? 'translateX(3px)' : 'none' }}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────────────────── */

export default function TechnologiesPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is AQUAGUARD™ by ELIMFILTERS?',
        acceptedAnswer: { '@type': 'Answer', text: 'AQUAGUARD™ is a proprietary ELIMFILTERS water separation and fuel cleanliness technology using three-stage turbine-coalescing-precision architecture. It achieves 99.8% free water removal and 95% emulsified water reduction per ASTM D6304, protecting high-pressure common-rail injection systems at 1,800–2,500 bar from water-driven injector corrosion, hydrogen embrittlement, and stiction failure. AQUAGUARD™ applies to mobile diesel, marine, standby generator, and offshore fuel systems.' },
      },
      {
        '@type': 'Question',
        name: 'What is MACROCORE™ by ELIMFILTERS?',
        acceptedAnswer: { '@type': 'Answer', text: 'MACROCORE™ is a proprietary ELIMFILTERS Progressive Density Gradient air intake technology using multi-layer cellulose-synthetic composite media. It achieves 99.9–99.98% ISO 5011 filtration efficiency at dust concentrations up to 10,000 mg/m³ — 10 to 30× the ISO 5011 test threshold of 300 mg/m³. MACROCORE™ protects combustion engines, gas turbines, and industrial compressors in mining, construction, and agriculture environments where silica and mineral dust cause abrasive intake wear.' },
      },
      {
        '@type': 'Question',
        name: 'What is SYNTEPORE™ by ELIMFILTERS?',
        acceptedAnswer: { '@type': 'Answer', text: 'SYNTEPORE™ is a proprietary ELIMFILTERS all-synthetic air intake technology engineered for high-humidity, coastal, and marine environments. Unlike cellulose-synthetic composite media, SYNTEPORE™ maintains structural integrity and filtration efficiency under continuous moisture exposure, preventing the hydrolytic degradation and tensile strength loss that affects cellulose media in salt-laden and offshore operating conditions.' },
      },
      {
        '@type': 'Question',
        name: 'What is NANOFORCE™ by ELIMFILTERS?',
        acceptedAnswer: { '@type': 'Answer', text: 'NANOFORCE™ is a proprietary ELIMFILTERS sub-micron hydraulic contamination control technology. It uses ISO 16889 Beta-rated multi-layer media to capture particles at 1–10 µm in high-pressure circuits at 200–450 bar — the contamination range that bypasses standard 25 µm return-line protection and drives progressive proportional valve spool wear. NANOFORCE™ maintains ISO 4406 16/14/11 cleanliness codes in construction, mining, and manufacturing hydraulic circuits.' },
      },
      {
        '@type': 'Question',
        name: 'How do contamination control technologies improve industrial reliability?',
        acceptedAnswer: { '@type': 'Answer', text: 'Contamination control technologies improve reliability by maintaining the physical, chemical, and mechanical properties of industrial fluids and operating environments within the thresholds that determine component wear rates. When lube oil cleanliness is maintained at ISO 4406 16/14/11, bearing service life extends 3–5× versus uncontrolled contamination at 19/17/14. When fuel water content is maintained below 200 ppm via AQUAGUARD™, HPCR injector service life extends from under 2,000 hours to 10,000+ hours. Contamination control technologies are reliability engineering tools, not commodity replacements.' },
      },
      {
        '@type': 'Question',
        name: 'Why does ELIMFILTERS use multiple technologies rather than a single filtration solution?',
        acceptedAnswer: { '@type': 'Answer', text: 'Different contamination threats require fundamentally different engineering approaches. Silica dust ingestion in air intake circuits requires Progressive Density Gradient media (MACROCORE™) rated to 10,000 mg/m³. Water contamination in fuel systems requires turbine-stage coalescing architecture (AQUAGUARD™). Sub-micron hydraulic particle contamination requires Beta-rated sub-micron retention (NANOFORCE™). A single filtration solution cannot address these distinct contamination mechanisms, failure modes, and measurement standards (ISO 5011, ASTM D6304, ISO 16889). Each ELIMFILTERS technology is engineered for a specific contamination domain.' },
      },
      {
        '@type': 'Question',
        name: 'How are ELIMFILTERS technologies connected to industrial protection systems?',
        acceptedAnswer: { '@type': 'Answer', text: 'ELIMFILTERS technologies are organized within five industrial asset protection systems: Air Intake & Airflow Protection (MACROCORE™, SYNTEPORE™, INTEKCORE™, DRYCORE™), Fuel Cleanliness Protection (AQUAGUARD™), Lubrication Reliability Protection (SYNTRAX™), Hydraulic Contamination Control (NANOFORCE™), and Cooling System & Environmental Protection (COOLTECH™, MICROKAPPA™). Technologies are selected based on the contamination challenge within each system — not selected as standalone product replacements.' },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between a technology and a product in the ELIMFILTERS framework?',
        acceptedAnswer: { '@type': 'Answer', text: 'In the ELIMFILTERS framework, a technology is a contamination control architecture — an engineered approach for addressing a specific failure mechanism (e.g., AQUAGUARD™ for water separation in fuel systems). A product is the implementation of that technology in a specific housing, size, and configuration for a particular equipment platform. Multiple products can implement the same technology. The technology defines the contamination control capability; the product deploys it in a specific application. Selecting a filtration solution by technology-first rather than product-first ensures the contamination challenge is addressed, not just the part number.' },
      },
      {
        '@type': 'Question',
        name: 'How does contamination type influence technology selection?',
        acceptedAnswer: { '@type': 'Answer', text: 'Contamination type determines which failure mechanism is active, which engineering approach addresses it, and which ISO or ASTM standard defines the acceptable threshold. Particle contamination in hydraulic circuits → NANOFORCE™ sub-micron Beta-rated capture → ISO 16889 / ISO 4406 measurement. Water contamination in fuel systems → AQUAGUARD™ turbine-stage coalescing → ASTM D6304 compliance. Soot and wear particles in lube oil → SYNTRAX™ synthetic media → ISO 4406 cleanliness codes. Moisture in compressed air → DRYCORE™ molecular sieve desiccant → ISO 8573-1 dew point class. Technology selection begins with contamination identification, not product catalog browsing.' },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between MACROCORE™ and SYNTEPORE™?',
        acceptedAnswer: { '@type': 'Answer', text: 'MACROCORE™ uses Progressive Density Gradient media — multi-layer cellulose-synthetic composite at 99.9–99.98% efficiency (ISO 5011) for dust concentrations up to 10,000 mg/m³. SYNTEPORE™ is all-synthetic for high-humidity, coastal, and marine environments where moisture would degrade cellulose media.' },
      },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Industrial Asset Protection Technology Platform — ELIMFILTERS®',
    description: 'Nine proprietary ELIMFILTERS contamination control technologies organized into a system-level asset protection framework covering air intake, fuel cleanliness, lubrication, hydraulic, compressed air, cooling, and cabin protection domains.',
    url: 'https://elimfilters.com/technologies',
    dateModified: '2026-06-10',
    author: { '@type': 'Organization', name: 'ELIMFILTERS®', url: 'https://elimfilters.com' },
    mentions: [
      { '@type': 'Thing', name: 'MACROCORE™', description: 'Progressive Density Gradient air intake protection technology by ELIMFILTERS' },
      { '@type': 'Thing', name: 'AQUAGUARD™', description: 'Three-stage turbine-coalescing fuel water separation technology by ELIMFILTERS' },
      { '@type': 'Thing', name: 'SYNTRAX™', description: 'Synthetic lube oil cleanliness technology by ELIMFILTERS' },
      { '@type': 'Thing', name: 'NANOFORCE™', description: 'Sub-micron hydraulic contamination control technology by ELIMFILTERS' },
      { '@type': 'Thing', name: 'SYNTEPORE™', description: 'All-synthetic moisture-resistant air intake technology by ELIMFILTERS' },
      { '@type': 'Thing', name: 'MICROKAPPA™', description: 'Multi-stage cabin PM2.5 protection technology by ELIMFILTERS' },
      { '@type': 'Thing', name: 'COOLTECH™', description: 'DCA-replenishing cooling system protection technology by ELIMFILTERS' },
      { '@type': 'Thing', name: 'DRYCORE™', description: 'Molecular sieve compressed air desiccant technology by ELIMFILTERS' },
      { '@type': 'Thing', name: 'INTEKCORE™', description: 'Zero-bypass radial-seal air intake housing technology by ELIMFILTERS' },
    ],
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Breadcrumb />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />

      {/* ── PAGE HERO ── */}
      <section style={{ padding: '10rem 7% 5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.22em',
            color: 'rgba(255,241,45,0.7)',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}
        >
          // Asset Protection Technology Platform · 9 Proprietary Architectures
        </motion.p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', maxWidth: '1200px', alignItems: 'end' }}>
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 300,
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: 'rgba(255,255,255,0.9)',
                margin: 0,
              }}
            >
              Nine proprietary<br />
              <span style={{ fontWeight: 600, color: '#FFF12D' }}>protection architectures.</span><br />
              One contamination strategy.
            </motion.h1>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <p style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.5)',
              margin: '0 0 1.5rem',
            }}>
              Each ELIMFILTERS technology targets a specific contamination domain — air intake, fuel cleanliness, lubrication, hydraulic, compressed air, cooling, or cabin. Every architecture is defined by its contamination target, the failure mechanism it prevents, and the ISO standard it addresses.
            </p>
            <div style={{ display: 'flex', gap: '2.5rem' }}>
              {[
                { val: '9', label: 'Architectures' },
                { val: '7', label: 'Domains' },
                { val: 'ISO', label: 'Referenced' },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#FFF12D', lineHeight: 1 }}>{stat.val}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginTop: '0.3rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TECHNOLOGY PLATFORM INTRODUCTION ─────────────────────────── */}
      <section style={{
        padding: 'clamp(3rem,6vw,5rem) 7%',
        background: 'rgba(255,241,45,0.02)',
        borderBottom: '1px solid rgba(255,241,45,0.08)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.22em',
              color: 'rgba(255,241,45,0.7)',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              // Engineering Philosophy
            </p>
            <h2 style={{
              fontFamily: 'Titillium Web, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1.5rem,3.5vw,2.2rem)',
              color: '#fff',
              marginBottom: '2rem',
              lineHeight: 1.2,
            }}>
              Engineering Asset Protection Through Technology
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
              <div>
                <p style={{
                  fontFamily: 'Titillium Web, sans-serif',
                  fontSize: '0.92rem',
                  lineHeight: 1.8,
                  color: 'rgba(255,255,255,0.6)',
                  margin: '0 0 1rem',
                }}>
                  Industrial asset protection requires more than replacement parts. Each contamination challenge demands a specific protection strategy, filtration mechanism, material architecture, and engineering approach.
                </p>
                <p style={{
                  fontFamily: 'Titillium Web, sans-serif',
                  fontSize: '0.92rem',
                  lineHeight: 1.8,
                  color: 'rgba(255,255,255,0.6)',
                  margin: 0,
                }}>
                  Water contamination in fuel circuits requires turbine-stage coalescing architecture. Sub-micron hydraulic particle contamination requires Beta-rated multi-layer retention. Soot accumulation in lube oil requires synthetic high-capacity media. These are distinct engineering problems — not variations of the same replacement decision.
                </p>
              </div>
              <div>
                <p style={{
                  fontFamily: 'Titillium Web, sans-serif',
                  fontSize: '0.92rem',
                  lineHeight: 1.8,
                  color: 'rgba(255,255,255,0.6)',
                  margin: '0 0 1rem',
                }}>
                  ELIMFILTERS organizes its technologies into a contamination control framework designed to support reliability, operational continuity, equipment protection, and lifecycle extension across critical industrial systems.
                </p>
                <p style={{
                  fontFamily: 'Titillium Web, sans-serif',
                  fontSize: '0.92rem',
                  lineHeight: 1.8,
                  color: 'rgba(255,255,255,0.6)',
                  margin: 0,
                }}>
                  The technologies support the systems. The systems protect the assets. The objective is not filtration alone. The objective is asset protection.
                </p>
              </div>
            </div>

            {/* Technology architecture hierarchy */}
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,241,45,0.12)',
              borderRadius: '4px',
              padding: '1.75rem 2rem',
            }}>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.58rem',
                color: 'rgba(255,255,255,0.22)',
                letterSpacing: '0.18em',
                marginBottom: '1.25rem',
              }}>
                ASSET PROTECTION FRAMEWORK — TECHNOLOGY POSITION
              </p>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.6rem',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.72rem',
              }}>
                {[
                  { label: 'Industrial Asset Protection', dim: false },
                  { label: '↓', arrow: true },
                  { label: 'Contamination Control', dim: false },
                  { label: '↓', arrow: true },
                  { label: 'Systems', dim: false },
                  { label: '↓', arrow: true },
                  { label: 'Technologies', highlight: true },
                  { label: '↓', arrow: true },
                  { label: 'Protection Implementations', dim: true },
                  { label: '↓', arrow: true },
                  { label: 'Operational Outcomes', dim: true },
                ].map((item, i) => (
                  <span
                    key={i}
                    style={{
                      color: item.arrow
                        ? 'rgba(255,255,255,0.15)'
                        : item.highlight
                        ? '#FFF12D'
                        : item.dim
                        ? 'rgba(255,255,255,0.3)'
                        : 'rgba(255,255,255,0.5)',
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

      {/* ── TECHNOLOGIES GRID ── */}
      <section style={{ padding: '5rem 7%' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {SYSTEM_GROUPS.map((group) => {
            const techs = catalogue.technologies.filter(t => {
              const slug = getSlug(t.name);
              return group.techs.includes(slug);
            });
            if (techs.length === 0) return null;
            return (
              <div key={group.label} style={{ marginBottom: '4rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.62rem',
                    letterSpacing: '0.2em',
                    color: 'rgba(255,241,45,0.6)',
                    textTransform: 'uppercase',
                  }}>
                    {group.label}
                  </span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                  gap: '1px',
                  background: 'rgba(255,255,255,0.05)',
                }}>
                  {techs.map((tech, i) => (
                    <TechCard key={tech.name} tech={tech} index={i} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Techs not in any group — catch-all */}
          {(() => {
            const allGrouped = SYSTEM_GROUPS.flatMap(g => g.techs);
            const ungrouped = catalogue.technologies.filter(t => !allGrouped.includes(getSlug(t.name)));
            if (ungrouped.length === 0) return null;
            return (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.2em', color: 'rgba(255,241,45,0.6)', textTransform: 'uppercase' }}>Other Systems</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
                  {ungrouped.map((tech, i) => <TechCard key={tech.name} tech={tech} index={i} />)}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── COMPARISON QUICK TABLE ── */}
      <section style={{ padding: '5rem 7%', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.22em', color: 'rgba(255,241,45,0.7)', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Quick reference
            </p>
            <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>
              Technology platform — architecture comparison
            </h2>
          </motion.div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,241,45,0.2)' }}>
                  {['Technology', 'Domain', 'Key metric', 'System Application'].map(h => (
                    <th key={h} style={{ padding: '1rem 1.5rem', textAlign: 'left', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.18em', color: 'rgba(255,241,45,0.6)', textTransform: 'uppercase', fontWeight: 400, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {catalogue.technologies.map((tech) => {
                  const slug = getSlug(tech.name);
                  const meta = TECH_PLATFORM[slug];
                  return (
                    <tr key={slug} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                        <Link href={`/technologies/${slug}`} style={{ color: '#fff', fontWeight: 600, textDecoration: 'none', letterSpacing: '-0.01em' }}>
                          {tech.title || tech.name}
                        </Link>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                        {meta?.system || '—'}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: 'rgba(255,241,45,0.7)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                        {meta?.metric || '—'}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        {meta?.systemApplications?.join(' · ') || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── GEO / AI DISCOVERABILITY ──────────────────────────────────── */}
      <section style={{
        padding: 'clamp(3rem,6vw,5rem) 7%',
        background: '#000',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.22em',
              color: 'rgba(255,241,45,0.7)',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              // Reliability Engineering Context
            </p>
            <h2 style={{
              fontFamily: 'Titillium Web, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1.4rem,3vw,2rem)',
              color: '#fff',
              marginBottom: '2rem',
              lineHeight: 1.2,
            }}>
              Why Technology Matters In Asset Protection
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[
                {
                  label: 'PRINCIPLE',
                  text: 'Industrial reliability depends on the effectiveness of the technologies used to control contamination. A bearing does not fail because maintenance was delayed by a week. It fails because particle contamination in the lubrication circuit accumulated above the ISO 4406 cleanliness threshold at which abrasive wear rate exceeds the design tolerance for that bearing geometry. Technology determines whether that threshold is maintained.',
                },
                {
                  label: 'DIFFERENTIATION',
                  text: 'Different contamination threats require different engineering approaches. Water contamination, airborne particulate, hydraulic wear particles, soot, oxidation, and fluid degradation each require unique protection mechanisms. AQUAGUARD™ addresses water in fuel through turbine-stage coalescing — a fundamentally different mechanism than NANOFORCE™ sub-micron particle retention in hydraulic circuits. Specifying the wrong technology for a contamination challenge leaves the failure mechanism unaddressed regardless of replacement frequency.',
                },
                {
                  label: 'FRAMEWORK',
                  text: 'ELIMFILTERS technologies are designed to address specific contamination challenges through specialized protection architectures aligned with industrial systems. The framework is: identify the contamination type and entry pathway → determine the measurable threshold standard (ISO 4406, ASTM D6304, ISO 8573-1) → select the technology engineered to meet that threshold → implement through the correct product specification. Technology selection is a reliability engineering decision, not a procurement decision.',
                },
                {
                  label: 'OUTCOME',
                  text: 'When technologies are matched to contamination challenges, assets operate longer, fail less, and cost less to maintain. When technology selection is replaced by commodity substitution, the contamination mechanism continues regardless of service frequency. The difference between a 15,000-hour engine overhaul interval and a 3,000-hour failure event is not which brand of filter was installed — it is whether the correct contamination control technology was specified for the operating environment.',
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
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.55rem',
                    letterSpacing: '0.18em',
                    color: '#FFF12D',
                    textTransform: 'uppercase',
                    minWidth: '90px',
                    paddingTop: '0.3rem',
                    opacity: i === 3 ? 1 : 0.55,
                  }}>
                    {item.label}
                  </span>
                  <p style={{
                    fontFamily: i === 3 ? 'Titillium Web, sans-serif' : 'Inter, sans-serif',
                    fontSize: '0.92rem',
                    lineHeight: 1.85,
                    color: i === 3 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.55)',
                    fontWeight: i === 3 ? 600 : 400,
                    margin: 0,
                  }}>
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ SECTION ───────────────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(3rem,6vw,5rem) 7%',
        background: 'rgba(255,255,255,0.01)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.22em',
              color: 'rgba(255,241,45,0.7)',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}>
              // Technical Reference
            </p>
            <h2 style={{
              fontFamily: 'Titillium Web, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(1.3rem,3vw,1.85rem)',
              color: '#fff',
              marginBottom: '2.5rem',
            }}>
              Technology Platform — Technical Questions
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {[
              {
                q: 'What is AQUAGUARD™ by ELIMFILTERS?',
                a: 'AQUAGUARD™ is a proprietary ELIMFILTERS water separation and fuel cleanliness technology using three-stage turbine-coalescing-precision architecture. It achieves 99.8% free water removal and 95% emulsified water reduction per ASTM D6304, protecting HPCR injection systems at 1,800–2,500 bar from water-driven injector corrosion, hydrogen embrittlement, and stiction failure. Applies to mobile diesel, marine, standby generator, and offshore fuel systems.',
              },
              {
                q: 'What is MACROCORE™ by ELIMFILTERS?',
                a: 'MACROCORE™ is a proprietary ELIMFILTERS Progressive Density Gradient air intake technology using multi-layer cellulose-synthetic composite media. It achieves 99.9–99.98% ISO 5011 efficiency at dust concentrations up to 10,000 mg/m³ — 10–30× the ISO 5011 test threshold. MACROCORE™ protects combustion engines, gas turbines, and industrial compressors in mining, construction, and agriculture environments from silica and mineral dust abrasive intake wear.',
              },
              {
                q: 'What is NANOFORCE™ by ELIMFILTERS?',
                a: 'NANOFORCE™ is a proprietary ELIMFILTERS sub-micron hydraulic contamination control technology. It uses ISO 16889 Beta-rated multi-layer media to capture particles at 1–10 µm in high-pressure circuits at 200–450 bar — the contamination range that bypasses standard 25 µm return-line protection and drives progressive proportional valve spool wear. Maintains ISO 4406 16/14/11 in construction, mining, and manufacturing hydraulic circuits.',
              },
              {
                q: 'How do contamination control technologies improve industrial reliability?',
                a: 'Contamination control technologies maintain fluid and system cleanliness within the thresholds that determine component wear rates. When lube oil cleanliness is maintained at ISO 4406 16/14/11 via SYNTRAX™, bearing service life extends 3–5×. When fuel water content is maintained below 200 ppm via AQUAGUARD™, HPCR injector service life extends from under 2,000 hours to 10,000+. The technology determines whether the contamination threshold is maintained — and whether the failure mechanism remains active or controlled.',
              },
              {
                q: 'Why does ELIMFILTERS use multiple technologies rather than a single filtration solution?',
                a: 'Different contamination threats require fundamentally different engineering approaches. Silica dust in air intake requires Progressive Density Gradient media (MACROCORE™). Water in fuel requires turbine-stage coalescing (AQUAGUARD™). Sub-micron hydraulic particles require Beta-rated retention (NANOFORCE™). Soot in lube oil requires high-capacity synthetic media (SYNTRAX™). A single technology cannot address these distinct failure mechanisms, measurement standards, and operating conditions. Each ELIMFILTERS technology is engineered for a specific contamination domain.',
              },
              {
                q: 'How are ELIMFILTERS technologies connected to industrial protection systems?',
                a: 'ELIMFILTERS technologies are organized within five protection systems: Air Intake & Airflow (MACROCORE™, SYNTEPORE™, INTEKCORE™, DRYCORE™), Fuel Cleanliness (AQUAGUARD™), Lubrication Reliability (SYNTRAX™), Hydraulic Contamination Control (NANOFORCE™), and Cooling System & Environmental Protection (COOLTECH™, MICROKAPPA™). Technologies are selected based on the contamination challenge within each system, not as standalone product replacements.',
              },
              {
                q: 'What is the difference between a technology and a product in the ELIMFILTERS framework?',
                a: 'A technology is a contamination control architecture — an engineered approach for a specific failure mechanism (e.g., AQUAGUARD™ for water separation in fuel systems). A product is the implementation of that technology in a specific housing, size, and configuration for a particular equipment platform. Multiple products implement the same technology. The technology defines contamination control capability; the product deploys it in a specific application. Technology-first selection ensures the contamination challenge is addressed, not just the part number matched.',
              },
              {
                q: 'How does contamination type influence technology selection?',
                a: 'Contamination type determines which failure mechanism is active and which engineering approach addresses it. Particle contamination in hydraulic circuits → NANOFORCE™ sub-micron Beta-rated capture → ISO 16889 / ISO 4406 measurement. Water in fuel systems → AQUAGUARD™ turbine-stage coalescing → ASTM D6304 compliance. Soot and wear particles in lube oil → SYNTRAX™ synthetic media → ISO 4406 cleanliness codes. Moisture in compressed air → DRYCORE™ molecular sieve → ISO 8573-1 dew point class. Technology selection begins with contamination identification.',
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                style={{
                  padding: '1.5rem 1.75rem',
                  background: 'rgba(255,241,45,0.025)',
                  border: '1px solid rgba(255,241,45,0.1)',
                  borderRadius: '3px',
                }}
              >
                <h3 style={{
                  fontFamily: 'Titillium Web, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: '#FFF12D',
                  margin: '0 0 0.75rem',
                }}>
                  {faq.q}
                </h3>
                <p style={{
                  fontFamily: 'Titillium Web, sans-serif',
                  fontSize: '0.88rem',
                  lineHeight: 1.75,
                  color: 'rgba(255,255,255,0.68)',
                  margin: 0,
                }}>
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CROSS-NAVIGATION CTA ─────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(3rem,6vw,5rem) 7%',
        background: 'linear-gradient(135deg, rgba(255,241,45,0.04) 0%, transparent 60%)',
        borderTop: '1px solid rgba(255,241,45,0.1)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.62rem',
              letterSpacing: '0.2em',
              color: 'rgba(255,241,45,0.6)',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              // Explore the Platform
            </p>
            <h2 style={{
              fontFamily: 'Titillium Web, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1.4rem,3vw,1.9rem)',
              color: '#fff',
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}>
              Technologies support systems.<br />Systems protect assets.
            </h2>
            <p style={{
              fontFamily: 'Titillium Web, sans-serif',
              fontSize: '0.92rem',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '2.5rem',
            }}>
              See how ELIMFILTERS protection architectures are organized within the five industrial asset protection systems — and which industries they serve.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/systems" style={{
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
              }}>
                VIEW PROTECTION SYSTEMS
              </Link>
              <Link href="/knowledge-system" style={{
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
              }}>
                KNOWLEDGE SYSTEM
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
