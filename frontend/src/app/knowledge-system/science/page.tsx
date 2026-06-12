'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

const FAILURE_CHAIN = [
  { step: '01', concept: 'Contamination', description: 'Particles, water, and heat enter fluid systems from external ingestion, internal generation, and built-in assembly contamination.' },
  { step: '02', concept: 'Wear', description: 'Contaminants abrade component surfaces at the microscopic level. Particles sized 0.5–3× component clearance cause maximum abrasive damage.' },
  { step: '03', concept: 'Component Damage', description: 'Bearing clearances open beyond design tolerance. Valve spools stick. Seals erode. Injector tips pit. Clearance loss accumulates.' },
  { step: '04', concept: 'System Failure', description: 'Cumulative wear degrades performance past operational limits: pressure loss, flow instability, power reduction, control deviation.' },
  { step: '05', concept: 'Downtime', description: 'Unplanned equipment stops for emergency repair or replacement. In heavy industry: $5,000–$35,000 per hour depending on operation type.' },
  { step: '06', concept: 'Asset Loss', description: 'Equipment retired at a fraction of design life. Typical result: 30–50% of potential operating hours lost to premature failure.' },
];

const PROTECTION_CHAIN = [
  { step: '01', concept: 'Contamination Control', description: 'Establish ISO 4406 cleanliness targets for each fluid system based on the clearance sensitivity of protected components.' },
  { step: '02', concept: 'Technology Deployment', description: 'Match filtration technology to contamination type (particle, water, thermal) and the critical particle size for each system.' },
  { step: '03', concept: 'Protection Strategy', description: 'Multi-stage defense: primary filtration at ingestion points, secondary at return lines, kidney-loop offline for continuous polishing.' },
  { step: '04', concept: 'Reliability', description: 'Consistent cleanliness within target ISO codes eliminates the random failure variability caused by contamination events.' },
  { step: '05', concept: 'Asset Life Extension', description: 'System-level contamination control extends equipment lifecycle 30–50% versus commodity filter replacement. L10 bearing life: 2–7× improvement.' },
];

const BEARING_LIFE_TABLE = [
  { code: '14/12/09', multiplier: '1.0×', label: 'Optimal', bar: 100 },
  { code: '16/14/11', multiplier: '0.70×', label: 'Acceptable', bar: 70 },
  { code: '18/16/13', multiplier: '0.35×', label: 'Degraded', bar: 35 },
  { code: '20/18/15', multiplier: '0.15×', label: 'High Risk', bar: 15 },
  { code: '≥22', multiplier: '<0.05×', label: 'Failure Zone', bar: 5 },
];

const WEAR_MECHANISMS = [
  {
    type: 'Abrasive Wear',
    code: 'ABR',
    mechanism: 'Hard particles (silica, iron oxide, carbides) trapped between moving surfaces create micro-cutting. Maximum damage occurs when particle size is 0.5–3× the component clearance gap. Particles smaller than the gap pass through; particles much larger ride on the surface. The critical zone drives exponential wear rate increases.',
    impact: 'Primary cause of bearing journal failure, piston ring wear, and cylinder liner scoring. Accounts for 70–80% of contamination-related equipment failures in off-highway equipment.',
    systems: 'Engine | Hydraulic | Lube | Fuel',
  },
  {
    type: 'Adhesive Wear',
    code: 'ADH',
    mechanism: 'Metal-to-metal contact occurs when contamination breaks down the hydrodynamic oil film separating component surfaces. Microscopic surface asperities weld under load and shear during relative motion, transferring material between surfaces and generating metallic wear debris.',
    impact: 'Catastrophic failure mode under high-load conditions. Generated metallic particles become secondary abrasive contaminants, triggering the self-reinforcing wear cascade.',
    systems: 'Bearings | Gears | High-Load Interfaces',
  },
  {
    type: 'Surface Fatigue',
    code: 'FAT',
    mechanism: 'Contamination-induced load spikes initiate subsurface stress cracks at particle impingement points. Cracks propagate through repeated stress cycles. When cracks reach the surface, spall fragments release — typically 50–200µm particles that re-enter the fluid system as new contamination.',
    impact: 'Self-reinforcing failure cascade. One spall event generates dozens of secondary particles, each capable of initiating new fatigue sites. Explains why contamination events accelerate non-linearly.',
    systems: 'Rolling Element Bearings | Gears | Cam Followers',
  },
  {
    type: 'Corrosive Wear',
    code: 'COR',
    mechanism: 'Water contamination above 500 ppm combined with dissolved oxygen creates acidic conditions that chemically attack ferrous bearing surfaces. Water-induced corrosion reduces surface hardness before mechanical wear becomes detectable, lowering the threshold for abrasive and fatigue wear initiation.',
    impact: 'Silent failure mode — surface degradation is invisible until mechanical wear accelerates. Diesel fuel systems with >200 ppm water show 3–5× injector failure rates versus dry-fuel systems.',
    systems: 'Fuel Systems | Hydraulic | Lube (water ingress)',
  },
];

const FAILURE_MODES = [
  {
    system: 'Engine / Lube',
    code: 'ENG',
    href: '/knowledge-system/standards/lube-oil-systems',
    standard: 'ISO 4406 target: 16/14/11',
    modes: [
      'Bearing journal abrasion → clearance increase → oil pressure loss → engine seizure',
      'Piston ring wear → blowby → oil consumption increase → thermal degradation',
      'Cylinder liner scoring → compression loss → fuel efficiency reduction',
    ],
  },
  {
    system: 'Hydraulic',
    code: 'HYD',
    href: '/knowledge-system/standards/hydraulic-systems',
    standard: 'ISO 4406 target: 17/15/12 to 16/14/11',
    modes: [
      'Proportional valve spool wear at 1–3µm clearance → stiction → control deviation',
      'Pump wear plate erosion → reduced flow → system pressure collapse',
      'Actuator seal erosion → internal bypass → position drift and cycle time increase',
    ],
  },
  {
    system: 'Fuel / Injection',
    code: 'FUEL',
    href: '/knowledge-system/standards/fuel-systems',
    standard: 'ISO 12937 water limit: <200 ppm',
    modes: [
      'Injector tip erosion from particle impingement → spray pattern distortion → combustion inefficiency',
      'Needle valve stiction from particulate accumulation → misfiring → power loss',
      'Water contamination → corrosive pitting → injector tip failure → fuel system shutdown',
    ],
  },
  {
    system: 'Air Intake',
    code: 'AIR',
    href: '/knowledge-system/standards/air-intake-systems',
    standard: 'ISO 5011 efficiency: ≥99.9% at critical particle size',
    modes: [
      'Silica dust ingestion → abrasive cylinder wear → compression loss (1% per 1,000 hours unfiltered)',
      'Restriction increase → air-fuel ratio lean → turbo overspeed and compressor blade erosion',
      'Bypass valve failure → unfiltered air event → catastrophic engine wear within hours',
    ],
  },
];

const TECHNOLOGIES = [
  {
    code: 'MACROCORE™',
    href: '/technologies/macrocore',
    failureMechanism: 'High particle population (ISO 4406 ≥18/16/13) causing bearing abrasion',
    protection: 'Primary particulate capture at 18µm absolute in engine lube and hydraulic systems. Reduces cleanliness code by 2–4 ISO steps, extending L10 bearing life 2–5×.',
    system: 'Engine | Hydraulic | Lube',
  },
  {
    code: 'MICROKAPPA™',
    href: '/technologies/microkappa',
    failureMechanism: 'Fine particle wear at 4–10µm causing servo valve spool erosion and stiction',
    protection: 'Sub-10µm particle capture for precision hydraulic and fuel injection systems. Addresses the critical particle population driving proportional valve failure at 1–3µm clearance.',
    system: 'Hydraulic | Fuel | Precision Systems',
  },
  {
    code: 'DRYCORE™',
    href: '/technologies/drycore',
    failureMechanism: 'Airborne silica and mineral dust ingestion causing abrasive cylinder and ring wear',
    protection: 'Dry element air filtration for extreme dust environments (2,000–15,000 mg/m³ silica). Captures 99.9%+ of particles above the critical ingestion threshold without oil carryover risk.',
    system: 'Air Intake | Engine Protection',
  },
  {
    code: 'INTEKCORE™',
    href: '/technologies/intekcore',
    failureMechanism: 'Combined particle and water contamination in fuel causing injector erosion and corrosion',
    protection: 'Integrated fuel filtration addressing dual contamination mode: particulate capture + water separation in single assembly. Prevents both particle erosion and water-corrosion failure pathways.',
    system: 'Fuel | Diesel | Injection Systems',
  },
  {
    code: 'SYNTEPORE™',
    href: '/technologies/syntepore',
    failureMechanism: 'Cellulose media degradation in water-contaminated or high-temperature fluids causing Beta ratio collapse',
    protection: 'Synthetic pore-structure media with dimensional stability from −40°C to +150°C. Maintains rated Beta ratio when cellulose media fails under thermal or water exposure.',
    system: 'Hydraulic | Lube | High-Temperature',
  },
  {
    code: 'HYDROCORE™',
    href: '/technologies/hydrocore',
    failureMechanism: 'Free and emulsified water above 500 ppm activating corrosive wear and injector failure',
    protection: 'Hydrophilic coalescing media grows water droplets to gravity-separation threshold. Reduces water content to <100 ppm — below the corrosion activation threshold for ferrous components.',
    system: 'Fuel | Hydraulic | Water Separation',
  },
  {
    code: 'HYDROCORE™/SERIES',
    href: '/technologies/hydracore-series',
    failureMechanism: 'High-volume water contamination in large-displacement fuel systems exceeding single-stage coalescer capacity',
    protection: 'Extended-capacity HYDROCORE configuration for bulk fuel and marine applications. Multi-stage coalescing for high-flow systems with continuous water ingress from storage or transfer.',
    system: 'Bulk Fuel | Large Equipment | Marine',
  },
  {
    code: 'SYNTRAX™',
    href: '/technologies/syntrax',
    failureMechanism: 'Transmission fluid metallic wear debris causing gear-to-gear contact propagation and additive depletion',
    protection: 'Synthetic transmission filtration with high dirt-holding capacity. Removes metallic wear debris before the self-reinforcing wear cascade propagates through the drivetrain.',
    system: 'Transmission | Drivetrain | Gearbox',
  },
  {
    code: 'NANOFORCE™',
    href: '/technologies/nanoforce',
    failureMechanism: 'Sub-micron particles (0.5–3µm) causing varnish formation and additive depletion in modern hydraulic oils',
    protection: 'Sub-micron capture to 1µm efficiency. Addresses the particle population below standard ISO 4406 measurement resolution but responsible for modern hydraulic fluid accelerated degradation.',
    system: 'Hydraulic | High-Precision | Servo Systems',
  },
  {
    code: 'THERMACORE™',
    href: '/technologies/thermacore',
    failureMechanism: 'Thermal cycling causing media structural failure and contamination bypass at peak operating temperatures',
    protection: 'Thermal-resistant media structure maintains Beta ratio integrity at high operating temperatures. Prevents contamination bypass events during hot-cycle operation that defeat primary protection.',
    system: 'High-Temperature | Diesel | Industrial',
  },
];

const FAQS = [
  {
    q: 'What is the financial impact of operating at ISO 4406 code 20/18/15 versus 16/14/11?',
    a: "The L10 bearing life multiplier at 16/14/11 is 0.70× (30% reduction from optimal). At 20/18/15 it is 0.15× — an 85% reduction. For a typical haul truck bearing rated at 20,000 operating hours at optimal cleanliness, operation at 16/14/11 delivers approximately 14,000 hours; operation at 20/18/15 delivers only 3,000 hours. The bearing replacement interval decreases from every 5 years to every 9 months. At $15,000–$40,000 per major bearing replacement including labour and downtime, the contamination management failure cost over a 10-year period can exceed the capital cost of the equipment's entire filtration system by 20–50×.",
  },
  {
    q: 'How does particle contamination cause proportional valve failure in hydraulic systems?',
    a: 'Proportional control valve spools operate with radial clearances of 1–3µm. Particles at or above this size cause three failure modes: (1) Abrasive wear — particles in the clearance gap micro-cut the spool surface, opening clearances and increasing internal bypass leakage. (2) Stiction — particles jam in the gap, preventing the spool from responding to control signals. (3) Silting — fine particles (1–5µm) pack into the clearance without breaking free, gradually increasing breakout force until the valve cannot move. ISO 4406 target for proportional valve protection is 16/14/11. Each ISO code step above this target approximately doubles the valve wear rate and increases stiction event probability by 3–5×.',
  },
  {
    q: 'Why does filtration system quality affect total cost of ownership more than filter purchase price?',
    a: 'Filter element cost represents 1–5% of total filtration-related ownership cost over equipment lifecycle. The remaining 95–99% is driven by: unplanned downtime ($5,000–$35,000 per hour in mining and construction), premature component replacement (bearings, pumps, injectors, valves), increased oil consumption from contamination-accelerated degradation, and reduced equipment resale value from condition evidence. A system-level contamination control approach maintaining ISO 4406 targets consistently extends component life 30–50% versus commodity filter replacement. Typical 10-year TCO reduction: 40–60% versus reactive maintenance approaches.',
  },
  {
    q: 'What is the difference between nominal and absolute filter ratings?',
    a: 'Nominal ratings indicate the particle size at which a filter removes some unspecified percentage of particles — typically 50–98% — making them non-reproducible and unsuitable for engineering specifications. Absolute ratings, expressed as Beta ratio under ISO 16889 test conditions, define capture efficiency at a specific particle size with reproducible multi-pass test methodology. A filter with β10(c) ≥200 captures 99.5% of particles ≥10µm under standardized conditions. For any system with contamination-sensitive components, only absolute Beta ratio ratings provide defensible filtration specifications.',
  },
  {
    q: 'How does temperature affect filter media performance?',
    a: 'Elevated temperatures reduce fluid viscosity, increasing flow velocity through media pores and reducing contact time for particle interception — lowering effective Beta ratio at operating temperature versus ISO 16889 test conditions (60°C ±2°C). Cold temperatures increase viscosity, raising differential pressure and risk of bypass valve activation at startup. Synthetic media (polyester, glass fiber) maintains dimensional stability across wide temperature ranges; cellulose media swells in water-contaminated fluids and can fail structurally at temperature extremes. Temperature derating factors must be applied when operating outside test conditions.',
  },
  {
    q: 'Why does ISO 4406 use three cleanliness code numbers instead of one?',
    a: 'Three particle size thresholds (≥4µm, ≥6µm, ≥14µm) are reported because different failure mechanisms are driven by different particle populations. Servo valve spool wear is driven primarily by ≥4µm particles. Bearing surface fatigue is driven by ≥6µm particles in the critical clearance zone. Gear tooth scoring correlates with ≥14µm particles. A single code number cannot simultaneously characterize all three failure-risk populations. A hydraulic system at 17/15/12 allows approximately 640–1,300, 160–320, and 20–40 particles per mL respectively at these thresholds — each population threatening a different component class.',
  },
  {
    q: 'What determines when a filter element should be replaced?',
    a: 'Condition-based replacement is driven by differential pressure across the element. When differential pressure reaches the filter indicator setpoint (typically 70–80% of bypass cracking pressure), the element has reached its working dirt capacity. Time-based replacement on fixed intervals assumes consistent contamination loading — an assumption that fails in variable-duty equipment. Combined approaches using differential pressure monitoring with a maximum time-interval backstop provide optimal protection: replacing at saturation avoids premature changes while the time limit prevents bypass events in low-contamination applications where the indicator threshold may never be reached.',
  },
];

function barColor(bar: number): string {
  if (bar >= 100) return '#4ade80';
  if (bar >= 70) return '#a3e635';
  if (bar >= 35) return '#facc15';
  if (bar >= 15) return '#fb923c';
  return '#f87171';
}

export default function SciencePage() {
  const schemaFAQPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  const schemaTechArticle = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'The Physics of Industrial Failure',
    description:
      'Bearing life decreases 20× when fluid contamination rises from ISO 4406 14/12/09 to ≥22. The physics of how particles, water, and heat destroy industrial assets — and the contamination control science that prevents it.',
    author: { '@type': 'Organization', name: 'ELIMFILTERS' },
    publisher: { '@type': 'Organization', name: 'ELIMFILTERS' },
    dateModified: '2026-06-11',
    keywords: [
      'industrial filtration', 'contamination control', 'ISO 4406', 'ISO 16889',
      'bearing life', 'particle wear', 'hydraulic contamination', 'asset protection',
      'filtration physics', 'wear mechanisms', 'L10 bearing life', 'abrasive wear',
      'filter efficiency', 'Beta ratio',
    ],
    about: {
      '@type': 'Thing',
      name: 'Industrial Asset Protection Through Contamination Control',
      description:
        'The physics of how particle and water contamination in industrial fluid systems causes component wear, system failure, and premature asset loss — and the contamination control framework that prevents it.',
    },
    mentions: {
      standards: ['ISO 4406', 'ISO 16889', 'ISO 5011', 'ISO 12937', 'ISO 281', 'SAE J1539'],
      technologies: ['MACROCORE', 'MICROKAPPA', 'DRYCORE', 'INTEKCORE', 'SYNTEPORE', 'HYDROCORE', 'SYNTRAX', 'NANOFORCE', 'THERMACORE'],
      failureMechanisms: ['abrasive wear', 'adhesive wear', 'surface fatigue', 'corrosive wear', 'bearing spalling', 'valve stiction', 'injector erosion'],
    },
  };

  const schemaBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
      { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system' },
      { '@type': 'ListItem', position: 3, name: 'The Physics of Industrial Failure', item: 'https://elimfilters.com/knowledge-system/science' },
    ],
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Back Navigation */}
      <Link
        href="/knowledge-system"
        className="back-nav-btn"
        style={{
          position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
          borderRadius: '4px', padding: '0.45rem 1rem',
          fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
          letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
          backdropFilter: 'blur(8px)',
        }}
      >
        ← KNOWLEDGE
      </Link>

      {/* 01 — HERO */}
      <section style={{
        paddingTop: 'clamp(5rem, 10vw, 8rem)',
        paddingBottom: '4rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.06) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '780px', margin: '0 auto', padding: '0 2rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            color: '#FFF12D',
            marginBottom: '1rem',
            opacity: 0.85,
          }}>
            // THE SCIENCE OF ASSET PROTECTION™
          </p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.4rem)',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.12,
            marginBottom: '1.25rem',
          }}>
            The Physics of Industrial Failure
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
            color: 'rgba(255,255,255,0.55)',
            maxWidth: '580px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Bearing life decreases 20× when fluid contamination rises from ISO 4406 14/12/09 to ≥22. The physics of how particles, water, and heat destroy industrial assets — and the contamination control framework that prevents it.
          </p>
        </motion.div>
      </section>

      {/* Jump Navigation TOC */}
      <nav aria-label="Page sections" style={{
        background: 'rgba(255,241,45,0.03)',
        borderBottom: '1px solid rgba(255,241,45,0.1)',
        padding: '1.25rem 2rem',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <details style={{ cursor: 'pointer' }}>
            <summary style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.18em',
              color: 'rgba(255,241,45,0.7)',
              listStyle: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              userSelect: 'none',
            }}>
              <span>// JUMP TO SECTION</span>
              <span style={{ opacity: 0.4, fontSize: '0.6rem' }}>▼</span>
            </summary>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '1rem',
            }}>
              {[
                { id: 'core-thesis',          label: '02 Scientific Thesis' },
                { id: 'failure-chain',         label: '03 Failure Chain' },
                { id: 'protection-chain',      label: '04 Protection Chain' },
                { id: 'bearing-life',          label: '05 Bearing Life Evidence' },
                { id: 'contamination-physics', label: '06 Contamination Physics' },
                { id: 'wear-mechanisms',       label: '07 Wear Mechanisms' },
                { id: 'failure-modes',         label: '08 Failure Modes' },
                { id: 'technology-map',        label: '09 Technology Map' },
                { id: 'systems-integration',   label: '10 Systems' },
                { id: 'industry-integration',  label: '11 Industries' },
                { id: 'faq',                   label: '12 FAQ' },
              ].map(({ id, label }) => (
                <a key={id} href={`#${id}`} style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.62rem',
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  padding: '0.3rem 0.75rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '2px',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#FFF12D'; e.currentTarget.style.borderColor = 'rgba(255,241,45,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  {label}
                </a>
              ))}
            </div>
          </details>
        </div>
      </nav>

      {/* 02 — CORE SCIENTIFIC THESIS */}
      <section id="core-thesis" style={{
        padding: 'clamp(3rem, 6vw, 5rem) 2rem',
        background: 'rgba(255,241,45,0.015)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{ maxWidth: '860px', margin: '0 auto' }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.75rem' }}>
            02 / CORE SCIENTIFIC THESIS
          </p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 600, marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>
            Industrial Equipment Does Not Fail Randomly
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
              Contamination is the root cause of 70–80% of hydraulic and lubrication system failures in heavy equipment. Not age. Not hours. Not mechanical chance. Particle contamination accumulating beyond the ISO 4406 cleanliness target of the protected component initiates a measurable, predictable wear cascade — abrasion, fatigue, adhesion, and corrosion — that progresses at a rate directly proportional to contamination level.
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
              The contamination-failure relationship is quantified. ISO 281:2007 and the SKF General Catalogue define L10 bearing life multipliers at each ISO 4406 cleanliness code. The data shows a 20× difference in bearing lifespan between optimal cleanliness (14/12/09) and field-typical contaminated conditions (≥22). This is not a marketing claim — it is a physical relationship measured under controlled test conditions with defined statistical confidence.
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
              The operational implication is direct: contamination control is not a maintenance practice. It is an engineering decision that determines equipment lifespan at the system design level. Asset owners who treat filtration as a commodity purchasing decision are making an engineering decision by default — and the consequence is equipment that fails 3–7× faster than its design life.
            </p>
          </div>
        </motion.div>
      </section>

      {/* 03 — FAILURE CHAIN FRAMEWORK */}
      <section id="failure-chain" style={{ padding: 'clamp(3rem, 6vw, 5rem) 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: '2.5rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.75rem' }}>
              03 / FAILURE CHAIN FRAMEWORK
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 600, letterSpacing: '-0.01em' }}>
              How Contamination Destroys Industrial Assets
            </h2>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {FAILURE_CHAIN.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                style={{ display: 'grid', gridTemplateColumns: '3rem 1fr', gap: '1.5rem', padding: '1.5rem 0', borderBottom: i < FAILURE_CHAIN.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#FFF12D', opacity: 0.5 }}>{item.step}</span>
                  {i < FAILURE_CHAIN.length - 1 && (
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'rgba(255,241,45,0.2)', marginTop: '0.25rem' }}>↓</span>
                  )}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, color: i === 5 ? '#f87171' : '#fff', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
                    {item.concept}
                  </h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 — PROTECTION CHAIN FRAMEWORK */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 2rem', background: 'rgba(255,241,45,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: '2.5rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.75rem' }}>
              04 / PROTECTION CHAIN FRAMEWORK
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 600, letterSpacing: '-0.01em' }}>
              Contamination Control → Asset Life Extension
            </h2>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {PROTECTION_CHAIN.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                style={{ display: 'grid', gridTemplateColumns: '3rem 1fr', gap: '1.5rem', padding: '1.5rem 0', borderBottom: i < PROTECTION_CHAIN.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#FFF12D', opacity: 0.5 }}>{item.step}</span>
                  {i < PROTECTION_CHAIN.length - 1 && (
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'rgba(255,241,45,0.2)', marginTop: '0.25rem' }}>↓</span>
                  )}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, color: i === 4 ? '#4ade80' : '#fff', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
                    {item.concept}
                  </h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 05 — ISO 4406 / BEARING LIFE EVIDENCE */}
      <section id="bearing-life" style={{ padding: 'clamp(3rem, 6vw, 5rem) 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: '2.5rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.75rem' }}>
              05 / EVIDENCE EXHIBIT — ISO 4406 BEARING LIFE
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '1rem' }}>
              Cleanliness Code vs. L10 Bearing Life Multiplier
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
              Source: ISO 281:2007, SKF General Catalogue 6000 EN. L10 bearing life is the operating hours at which 10% of a bearing population is expected to have failed. The multiplier expresses life relative to optimal cleanliness (14/12/09 = 1.0×).
            </p>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {BEARING_LIFE_TABLE.map((row, i) => (
              <motion.div
                key={row.code}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '120px 80px 1fr', gap: '1rem', alignItems: 'center' }}
              >
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: '#FFF12D', opacity: 0.85 }}>{row.code}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem', fontWeight: 700, color: barColor(row.bar) }}>{row.multiplier}</span>
                <div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                    <div style={{ height: '100%', width: `${row.bar}%`, background: barColor(row.bar), borderRadius: '2px' }} />
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>{row.label.toUpperCase()}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,241,45,0.06)', border: '1px solid rgba(255,241,45,0.2)', padding: '1.5rem' }}>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 600, color: '#FFF12D', marginBottom: '0.5rem' }}>Operational Translation</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75 }}>
              A haul truck bearing designed for 20,000 operating hours at ISO 4406 14/12/09 will deliver approximately 3,000 hours at 20/18/15 — the cleanliness level typical of equipment without active contamination control. That is a 6.7× reduction in service life, representing $25,000–$80,000 per bearing assembly in replacement and downtime costs per event, recurring every 9 months instead of every 5 years.
            </p>
          </div>
        </div>
      </section>

      {/* 06 — CONTAMINATION PHYSICS */}
      <section id="contamination-physics" style={{ padding: 'clamp(3rem, 6vw, 5rem) 2rem', background: 'rgba(255,241,45,0.015)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: '2.5rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.75rem' }}>
              06 / CONTAMINATION PHYSICS
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 600, letterSpacing: '-0.01em' }}>
              Particle Capture Mechanics and Media Efficiency
            </h2>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
              Three physical mechanisms arrest particles in filter media: <strong style={{ color: '#fff' }}>inertial impaction</strong> (particles with sufficient mass deviate from fluid streamlines and contact fibers, dominant above 10µm), <strong style={{ color: '#fff' }}>interception</strong> (particles following streamlines contact fibers due to their size, dominant 1–10µm), and <strong style={{ color: '#fff' }}>diffusion</strong> (sub-micron particles undergo Brownian motion increasing fiber contact probability, dominant below 0.3µm). The particle size range 0.3–1.0µm falls in the transition zone between all three mechanisms — this is the most penetrating particle size for fibrous filter media.
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
              Beta ratio (βx) quantifies media efficiency: it is the ratio of upstream to downstream particle count at particle size x under ISO 16889 multi-pass test conditions. β10(c) = 200 means 200 upstream particles for every 1 downstream particle at 10µm — 99.5% capture efficiency. Beta ratio must be stated at the relevant particle size for the protected component. A hydraulic proportional valve with 2µm spool clearance requires β3 ≥200, not β10. Specifying at the wrong particle size produces unmeasurable protection.
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
              Filter element service life is governed by <strong style={{ color: '#fff' }}>dirt holding capacity</strong> — the total mass of contaminant the element can retain before reaching terminal differential pressure and the bypass valve opens. ISO 16889 quantifies this via gravimetric analysis. High dirt capacity delays bypass valve activation at the exact moments of highest contamination ingestion, when the protection floor matters most.
            </p>
          </div>
        </div>
      </section>

      {/* 07 — WEAR MECHANISMS */}
      <section id="wear-mechanisms" style={{ padding: 'clamp(3rem, 6vw, 5rem) 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: '2.5rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.75rem' }}>
              07 / WEAR MECHANISMS
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 600, letterSpacing: '-0.01em' }}>
              Four Tribological Failure Pathways
            </h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1.25rem' }}>
            {WEAR_MECHANISMS.map((w, i) => (
              <motion.div
                key={w.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{w.type}</h3>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,241,45,0.5)', letterSpacing: '0.1em', marginLeft: '1rem', flexShrink: 0 }}>{w.code}</span>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{w.mechanism}</p>
                <div style={{ background: 'rgba(255,241,45,0.04)', border: '1px solid rgba(255,241,45,0.12)', padding: '0.75rem', marginTop: 'auto' }}>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(255,241,45,0.7)', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>OPERATIONAL IMPACT</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{w.impact}</p>
                </div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>SYSTEMS: {w.systems}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 08 — FAILURE MODES BY SYSTEM */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 2rem', background: 'rgba(255,241,45,0.015)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: '2.5rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.75rem' }}>
              08 / FAILURE MODES BY SYSTEM
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 600, letterSpacing: '-0.01em' }}>
              Contamination Failure Pathways in Industrial Fluid Systems
            </h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '1.25rem' }}>
            {FAILURE_MODES.map((sys, i) => (
              <motion.div key={sys.code} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}>
                <Link href={sys.href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                    transition={{ duration: 0.15 }}
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', padding: '1.75rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,241,45,0.5)', letterSpacing: '0.1em', background: 'rgba(255,241,45,0.06)', padding: '0.2rem 0.5rem' }}>{sys.code}</span>
                      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{sys.system}</h3>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {sys.modes.map((mode, mi) => (
                        <li key={mi} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, paddingLeft: '0.75rem', borderLeft: '2px solid rgba(255,241,45,0.15)' }}>{mode}</li>
                      ))}
                    </ul>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>{sys.standard}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(255,241,45,0.4)' }}>DOMAIN →</span>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 09 — TECHNOLOGY INTEGRATION */}
      <section id="technology-map" style={{ padding: 'clamp(3rem, 6vw, 5rem) 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: '2.5rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.75rem' }}>
              09 / TECHNOLOGY INTEGRATION
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '0.75rem' }}>
              ELIMFILTERS Technologies: Why Each Exists
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '680px' }}>
              Every ELIMFILTERS technology was engineered to address a specific, identified failure mechanism. The failure mechanism determines the technology requirement. The technology maps to a contamination control target. The contamination target is defined by the cleanliness sensitivity of the protected component.
            </p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '1rem' }}>
            {TECHNOLOGIES.map((tech, i) => (
              <motion.div key={tech.code} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 + i * 0.04 }}>
                <Link href={tech.href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.35)' }}
                    transition={{ duration: 0.15 }}
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                  >
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: '#FFF12D', letterSpacing: '0.05em' }}>{tech.code}</span>
                    <div>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>ADDRESSES</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{tech.failureMechanism}</p>
                    </div>
                    <div>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,241,45,0.5)', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>PROTECTION</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{tech.protection}</p>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.57rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>{tech.system}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(255,241,45,0.4)' }}>→</span>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 — SYSTEMS INTEGRATION */}
      <section id="systems-integration" style={{ padding: 'clamp(3rem, 6vw, 5rem) 2rem', background: 'rgba(255,241,45,0.015)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: '2rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.75rem' }}>
              10 / SYSTEMS INTEGRATION
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 600, letterSpacing: '-0.01em' }}>
              Filtration System Domains
            </h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '1rem' }}>
            {[
              { label: 'Lube / Oil', href: '/knowledge-system/standards/lube-oil-systems', code: 'ISO 4406 · ISO 16889' },
              { label: 'Air Intake', href: '/knowledge-system/standards/air-intake-systems', code: 'ISO 5011 · SAE J1539' },
              { label: 'Cabin / Safety', href: '/knowledge-system/standards/cabin-safety-systems', code: 'ISO 11155 · DIN 71220' },
              { label: 'Fuel', href: '/knowledge-system/standards/fuel-systems', code: 'ISO 12937 · ASTM D6304' },
              { label: 'Hydraulic', href: '/knowledge-system/standards/hydraulic-systems', code: 'ISO 16889 · NFPA T2.14' },
              { label: 'Compressed Air', href: '/knowledge-system/standards/compressed-air-systems', code: 'ISO 8573-1 · ISO 8573-2' },
            ].map((sys) => (
              <Link key={sys.href} href={sys.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                  transition={{ duration: 0.15 }}
                  style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
                >
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{sys.label}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,241,45,0.4)', letterSpacing: '0.06em' }}>{sys.code}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 11 — INDUSTRY INTEGRATION */}
      <section id="industry-integration" style={{ padding: 'clamp(3rem, 6vw, 5rem) 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: '2rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.75rem' }}>
              11 / INDUSTRY INTEGRATION
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 600, letterSpacing: '-0.01em' }}>
              Industrial Sectors Where Failure Physics Apply
            </h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(160px, 100%), 1fr))', gap: '0.75rem' }}>
            {[
              { label: 'Mining', href: '/industries/mining' },
              { label: 'Agriculture', href: '/industries/agriculture' },
              { label: 'Construction', href: '/industries/construction' },
              { label: 'Marine', href: '/industries/marine' },
              { label: 'Forestry', href: '/industries/forestry' },
              { label: 'Energy', href: '/industries/energy' },
              { label: 'Oil & Gas', href: '/industries/oil-and-gas' },
              { label: 'Transport', href: '/industries/transport' },
            ].map((ind) => (
              <Link key={ind.href} href={ind.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                  transition={{ duration: 0.15 }}
                  style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '0.9rem 1rem', textAlign: 'center' }}
                >
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>{ind.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 12 — FAQ */}
      <section id="faq" style={{ padding: 'clamp(3rem, 6vw, 5rem) 2rem', background: 'rgba(255,241,45,0.015)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: '3rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.75rem' }}>
              12 / TECHNICAL QUESTIONS
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 600, letterSpacing: '-0.01em' }}>
              Engineering Q&amp;A — Science and Business Impact
            </h2>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 + i * 0.05 }}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', padding: '1.75rem' }}
              >
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.75rem', lineHeight: 1.5 }}>{faq.q}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.52)', lineHeight: 1.8 }}>{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 13 — INTERNAL KNOWLEDGE LINKS */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,241,45,0.6)', marginBottom: '2rem' }}>
            13 / INTERNAL KNOWLEDGE LINKS
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1rem' }}>
            {[
              { section: 'STANDARDS', title: 'ISO Filtration Standards', href: '/knowledge-system/standards', desc: 'Measurement frameworks and cleanliness targets' },
              { section: 'CONTAMINATION', title: 'Failure Mode Analysis', href: '/knowledge-system/contamination', desc: 'Particle wear, water contamination, hydraulic failure' },
              { section: 'FLEET', title: 'Fleet Optimization', href: '/knowledge-system/fleet', desc: 'TCO, downtime reduction, maintenance intervals' },
              { section: 'COMPARE', title: 'System vs Commodity', href: '/knowledge-system/compare/system-vs-commodity', desc: 'Reframing filtration as asset protection' },
              { section: 'ISO 4406', title: 'Cleanliness Codes', href: '/knowledge-system/standards/iso-4406', desc: 'Particle count measurement and target codes' },
              { section: 'ISO 16889', title: 'Beta Ratio Testing', href: '/knowledge-system/standards/iso-16889', desc: 'Filter efficiency measurement standard' },
            ].map((link) => (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                  transition={{ duration: 0.15 }}
                  style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
                >
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,241,45,0.5)', letterSpacing: '0.1em' }}>{link.section}</span>
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{link.title}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{link.desc}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 14 — STRUCTURED DATA LAYER */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaTechArticle) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }} />

      {/* 15 — AUTHORITY SIGNALS / CANONICAL KNOWLEDGE BLOCK */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 2rem 4rem' }}>
        <RetrievalBlock>
          <p>CANONICAL_KNOWLEDGE_BLOCK: The Physics of Industrial Failure — The Science of Asset Protection™</p>
          <p style={{ marginTop: '0.75rem' }}>DEFINITION</p>
          <p>Industrial fluid system contamination (particles ≥4µm, water &gt;500 ppm, thermal degradation) causes four tribological failure mechanisms — abrasive wear, adhesive wear, surface fatigue, and corrosive wear — that reduce component life in proportion to ISO 4406 cleanliness code deviation from design targets. L10 bearing life decreases 20× between optimal (ISO 4406 14/12/09) and severely contaminated (≥22) conditions per ISO 281:2007 and SKF General Catalogue 6000 EN.</p>
          <p style={{ marginTop: '0.75rem' }}>SYSTEMS</p>
          <p>Engine lube circuits, hydraulic systems, fuel injection systems, air intake systems, cabin air systems, compressed air systems, transmission and drivetrain systems</p>
          <p style={{ marginTop: '0.75rem' }}>FAILURE_IMPACT</p>
          <p>Contamination particles accumulate in fluid → abrasive wear at component clearances → bearing clearance increase → L10 life reduction (up to 20×) → unplanned downtime ($5,000–$35,000/hour) → asset loss at 30–50% of design life | Operational Impact: ISO 4406 code 20/18/15 reduces bearing life to 0.15× baseline; code 16/14/11 reduces to 0.70× baseline</p>
          <p style={{ marginTop: '0.75rem' }}>RELATED_STANDARDS</p>
          <p>ISO 4406: Particle cleanliness code classification (≥4µm, ≥6µm, ≥14µm thresholds) | ISO 16889: Beta ratio filter efficiency testing (multi-pass methodology) | ISO 281:2007: Bearing life calculation including contamination factor | ISO 5011: Air filter efficiency and flow resistance | ISO 12937: Water content in petroleum products (Karl Fischer) | SAE J1539: Air induction system performance</p>
          <p style={{ marginTop: '0.75rem' }}>RELATED_TECHNOLOGIES</p>
          <p>MACROCORE™: Primary particulate capture 18µm absolute — addresses high particle population (ISO 4406 ≥18) bearing abrasion | MICROKAPPA™: Sub-10µm capture — addresses servo valve spool wear at 4–10µm | DRYCORE™: Dry element air filtration — addresses silica dust ingestion cylinder wear | INTEKCORE™: Integrated fuel filtration — addresses combined particle + water injector failure | SYNTEPORE™: Synthetic pore media — addresses cellulose media failure in water/high-temperature environments | HYDROCORE™: Water coalescing — addresses water corrosion activation (&gt;500 ppm) | HYDROCORE™/SERIES: Extended water separation — bulk fuel high-volume applications | SYNTRAX™: Synthetic transmission filtration — addresses metallic wear debris drivetrain cascade | NANOFORCE™: Sub-micron 1µm capture — addresses varnish formation and additive depletion | THERMACORE™: Thermal-resistant media — addresses Beta ratio collapse at peak operating temperatures</p>
          <p style={{ marginTop: '0.75rem' }}>INDUSTRIAL_ROLE</p>
          <p>Contamination control is the primary engineering lever for industrial equipment lifespan. The difference between ISO 4406 14/12/09 and 20/18/15 cleanliness — achievable through system-level filtration design — represents a 6–7× difference in bearing service life and determines whether equipment operates 5+ years between major overhauls or requires intervention every 9 months.</p>
          <p style={{ marginTop: '0.75rem' }}>CITATION_REFERENCE</p>
          <p>source: elimfilters.com/knowledge-system/science</p>
          <p>concept: The Physics of Industrial Failure — Asset Protection Science</p>
          <p>version: 3.0</p>
          <p>last_updated: 2026-06-11</p>
        </RetrievalBlock>
      </div>
    </main>
  );
}
