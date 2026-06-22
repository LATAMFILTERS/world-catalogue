'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { catalogue, getSlug } from '@/lib/catalogue';
import { StaggerContainer, itemVariants } from '@/components/AnimateIn';
import { ScrollCards, type iCardItem } from '@/components/ui/scroll-cards';

const GEO_DEFINITIONS: Record<string, string> = {
  'hydrocore-series': "HYDROCORE/SERIES™ is ELIMFILTERS' heavy-duty turbine fuel filter/water separator line, delivering three-stage asset protection: Stage 1 intercepts solid particles, Stage 2 coalesces and removes emulsified water, and Stage 3 provides a final polishing barrier. The FH 900FH and 1000FH models are designed for high-flow turbine fuel systems in power generation and large-scale mining operations.",
  'hydrocore': 'HYDROCORE™ is a hydrophobic water-separation asset protection technology that removes free and emulsified water from diesel and turbine fuel systems at 99.8% efficiency. Engineered for Common Rail and turbine fuel systems, it protects precision injector assets from corrosion, cavitation, and microbial contamination in mining, marine, power generation, and agriculture.',
  'cooltech': 'COOLTECH™ is a Supplemental Coolant Additive (SCA) release technology integrated into coolant filtration systems. It delivers controlled additive dosing to prevent liner pitting, cavitation erosion, and scale deposits in diesel engine cooling circuits, extending coolant service intervals and protecting thermal system integrity in heavy-duty trucks and stationary power generation.',
  'drycore': 'DRYCORE™ is a molecular sieve desiccant technology engineered to remove moisture from compressed air and pneumatic systems. By adsorbing water vapour before it reaches control valves, actuators, and pneumatic tools, DRYCORE™ prevents corrosion, freeze events, and seal degradation in industrial and mobile equipment operating in high-humidity environments.',
  'intekcore': 'INTEKCORE™ is a high-pressure filter housing architecture rated for heavy-duty trucks and industrial machinery. Precision-formed sealing surfaces and corrosion-resistant materials deliver zero-bypass performance under peak system pressure, ensuring no unfiltered fluid bypasses the element during cold starts, load spikes, or element change events.',
  'macrocore': 'MACROCORE™ is a Progressive Density Gradient (PDG) multi-layer air filtration system rated to ISO 5011 standards. Outer protection layers capture macro-contaminants while progressively denser inner zones neutralise sub-micron threats, achieving 99.9%–99.98% interception efficiency with a 62 PSI anti-collapse rating. Engineered for heavy-duty combustion engines: on-road vehicles, mining equipment, agricultural machinery, stationary power generation, and industrial compressors.',
  'microkappa': 'MICROKAPPA™ is an electrostatic cabin air filtration system combining activated carbon and HEPA-grade particle capture. The electrostatic charge attracts sub-micron particles, allergens, and diesel particulate matter, while the activated carbon layer controls odours from fuel vapours and exhaust intrusion. Designed for mining cabs, agricultural machinery, and heavy-duty trucks operating in high-dust environments.',
  'nanoforce': 'NANOFORCE™ is a multi-layer hydraulic contamination control architecture engineered for high-pressure hydraulic circuits in heavy industrial machinery. It combines structural integrity reinforcement with vapour control mechanisms to maintain filter element form under system pressure spikes, delivering consistent sub-micron contamination interception across variable duty cycles.',
  'syntepore': 'SYNTEPORE™ is an all-synthetic air intake protection architecture for high-humidity, coastal, and marine intake environments. Structural integrity is maintained under moisture exposure conditions that degrade cellulose-based constructions, delivering consistent ISO 5011-compliant airflow restriction across variable humidity operating environments aboard offshore platforms, marine vessels, and humid tropical agricultural operations.',
  'syntrax': 'SYNTRAX™ is a synthetic lubrication protection architecture maintaining ISO 4406 cleanliness codes (16/14/11) throughout extended drain intervals for diesel, gas, and dual-fuel engines. It captures combustion soot above 2% by weight, metal wear particles, and fuel dilution byproducts — the primary degradation mechanisms that reduce oil film strength, accelerate bearing wear, and reduce engine service life in mobile and stationary applications.',
};

const TECH_COMPARISON = [
  { name: 'MACROCORE™', slug: 'macrocore', system: 'Air Intake & Airflow Protection', func: 'Progressive density gradient intake protection', metric: '99.9%–99.98% efficiency · ISO 5011', industries: 'Mining, Agriculture, Construction, Power Gen' },
  { name: 'SYNTEPORE™', slug: 'syntepore', system: 'Air Intake & Airflow Protection', func: 'All-synthetic intake for humid/marine environments', metric: 'ISO 5011 · moisture-resistant construction', industries: 'Marine, Offshore, Coastal, Agriculture' },
  { name: 'INTEKCORE™', slug: 'intekcore', system: 'Air Intake & Airflow Protection', func: 'Pre-cleaner housing for high-vibration environments', metric: 'Radial seal zero-bypass · railway traction', industries: 'Railway, Stationary industrial, Heavy trucks' },
  { name: 'DRYCORE™', slug: 'drycore', system: 'Air Intake & Airflow Protection', func: 'Molecular sieve desiccant dryer', metric: 'ISO 8573-1 Class 1–2 dew point', industries: 'Railway, Bus & Coach, Industrial pneumatics' },
  { name: 'HYDROCORE™', slug: 'hydrocore', system: 'Fuel Cleanliness Protection', func: 'Turbine-stage water separation', metric: '99.8% free water · 95% emulsified removal', industries: 'Marine, Oil & Gas, Power Gen, Agriculture' },
  { name: 'HYDROCORE/SERIES™', slug: 'hydrocore-series', system: 'Fuel Cleanliness Protection', func: 'High-flow fuel protection for stationary power systems', metric: '99.8% free water removal · High-flow power systems', industries: 'Power Generation, Mining, Stationary industrial' },
  { name: 'SYNTRAX™', slug: 'syntrax', system: 'Lubrication Protection', func: 'Full-flow lube protection at ISO 4406 16/14/11', metric: 'Extended drain interval · soot capture above 2%', industries: 'Trucks & Fleets, Bus & Coach, Railway' },
  { name: 'NANOFORCE™', slug: 'nanoforce', system: 'Hydraulic Protection', func: 'Sub-micron Beta-rated contamination control', metric: 'ISO 4406 16/14/11 · 200–450 bar', industries: 'Construction, Mining, Manufacturing, Marine' },
  { name: 'COOLTECH™', slug: 'cooltech', system: 'Cooling System Protection', func: 'DCA-replenishing coolant protection', metric: 'SCA restoration · liner cavitation prevention', industries: 'Trucks & Fleets, Bus & Coach, Power Gen' },
  { name: 'MARINECLEAN™', slug: 'marineclean', system: 'Cross-System', func: 'Corrosion-resistant fuel and lube protection for marine environments', metric: 'IMO certified · ASTM B117 · Salt-resistant', industries: 'Marine, Offshore, Commercial vessels' },
  { name: 'DURATECH™', slug: 'duratech', system: 'Cross-System', func: 'Multi-domain fleet standardisation and consolidated service kits', metric: 'OEM-interchangeable · Mixed-fleet', industries: 'Trucks & Fleets, Mining, Construction, Agriculture' },
  { name: 'MICROKAPPA™', slug: 'microkappa', system: 'Cross-System', func: 'PM2.5 capture + activated carbon cabin protection', metric: 'Up to 85% PM2.5 reduction · EU Dir. 2019/130', industries: 'Trucks, Bus & Coach, Construction, Mining' },
];

const SCROLL_ITEMS: iCardItem[] = [
  {
    title: 'MACROCORE™',
    subtitle: 'Progressive Density Engineering',
    description: 'Multi-layer air filtration achieving 99.9%–99.98% interception efficiency. ISO 5011 certified. 62 PSI anti-collapse rated for heavy-duty combustion engines.',
    system: 'Air Intake',
    src: '/assets/MACROCORE.avif',
    href: '/technologies/macrocore',
  },
  {
    title: 'SYNTEPORE™',
    subtitle: 'All-Synthetic Intake Architecture',
    description: 'All-synthetic construction for high-humidity, coastal, and marine intake environments where moisture exposure degrades cellulose media.',
    system: 'Air Intake · Marine',
    src: '/assets/SYNTEPORE.avif',
    href: '/technologies/syntepore',
  },
  {
    title: 'INTEKCORE™',
    subtitle: 'High-Pressure Housing Architecture',
    description: 'Precision-formed sealing surfaces and corrosion-resistant materials for zero-bypass performance in high-vibration railway and industrial environments.',
    system: 'Air Intake · Railway',
    src: '/assets/INTEKCORE.avif',
    href: '/technologies/intekcore',
  },
  {
    title: 'DRYCORE™',
    subtitle: 'Molecular Sieve Desiccant',
    description: 'Removes moisture from compressed air and pneumatic systems. Achieves ISO 8573-1 Class 1–2 dew point targets preventing corrosion and freeze events.',
    system: 'Compressed Air',
    src: '/assets/DRYCORE.avif',
    href: '/technologies/drycore',
  },
  {
    title: 'HYDROCORE™',
    subtitle: 'Turbine-Stage Water Separation',
    description: 'Removes free and emulsified water from diesel and turbine fuel systems at 99.8% efficiency. Protects HPCR injectors operating at 1,800–2,500 bar.',
    system: 'Fuel Cleanliness',
    src: '/assets/HYDROCORE.avif',
    href: '/technologies/hydrocore',
  },
  {
    title: 'HYDROCORE/SERIES™',
    subtitle: 'High-Flow Power Systems',
    description: 'Three-stage asset protection for turbine fuel systems. FH 900FH and 1000FH models for large-scale power generation and mining operations.',
    system: 'Fuel · Power Gen',
    src: '/assets/TURBOCORE.avif',
    href: '/technologies/hydrocore-series',
  },
  {
    title: 'SYNTRAX™',
    subtitle: 'Extended Drain Interval Protection',
    description: 'Maintains ISO 4406 cleanliness codes (16/14/11) throughout 60,000–100,000 km drain intervals. Captures combustion soot above 2% by weight.',
    system: 'Lubrication',
    src: '/assets/SYNTRAX.avif',
    href: '/technologies/syntrax',
  },
  {
    title: 'NANOFORCE™',
    subtitle: 'Sub-Micron Beta-Rated Control',
    description: 'Hydraulic contamination control for 200–450 bar circuits. Maintains ISO 4406 16/14/11 protecting proportional valve spool clearances of 5–25 µm.',
    system: 'Hydraulic',
    src: '/assets/NANOFORCE.avif',
    href: '/technologies/nanoforce',
  },
  {
    title: 'THERMACORE™',
    subtitle: 'Thermal Media Engineering',
    description: 'Thermal-bonded synthetic media for extreme temperature lube and cooling applications. Maintains ISO 4406 filtration integrity from −40°C to +150°C operating range.',
    system: 'Cooling System',
    src: '/assets/THERMACORE.avif',
    href: '/technologies/thermocore',
  },
  {
    title: 'MICROKAPPA™',
    subtitle: 'Electrostatic Cabin Protection',
    description: 'PM2.5 capture combined with activated carbon. Reduces cabin PM2.5 concentration by up to 85%. EU Directive 2019/130 compliance for commercial operators.',
    system: 'Cabin Air Quality',
    src: '/assets/MICROKAPPA.avif',
    href: '/technologies/microkappa',
  },
];

const FAQS = [
  {
    q: 'What is the difference between MACROCORE™ and SYNTEPORE™ air intake protection?',
    a: 'Both are Air Intake & Airflow Protection technologies but target different operating environments. MACROCORE™ uses Progressive Density Gradient (PDG) media — a multi-layer cellulose-synthetic composite achieving 99.9%–99.98% efficiency (ISO 5011) at dust concentrations up to 10,000 mg/m³ in mining, agriculture, and construction. SYNTEPORE™ is all-synthetic construction for high-humidity, coastal, and marine intake environments where moisture exposure would degrade cellulose media — maintaining ISO 5011-compliant airflow restriction regardless of humidity conditions.',
  },
  {
    q: 'Which ELIMFILTERS architecture protects HPCR diesel injection systems?',
    a: 'HYDROCORE™ is the Fuel Cleanliness Protection technology for HPCR injection systems operating at 1,800–2,500 bar. It uses turbine-stage coalescing separation to remove free water at 99.8% efficiency and emulsified water at 95% — preventing injector needle corrosion above 200 ppm water content and pump cavitation. HPCR injector needle clearances measure 1–3 µm, making water contamination the primary failure mechanism in fuel-injection equipment.',
  },
  {
    q: 'What is SYNTRAX™ and which system does it protect?',
    a: 'SYNTRAX™ is the Lubrication Protection technology for engine oil protection. It maintains ISO 4406 cleanliness codes (16/14/11) throughout extended drain intervals (60,000–100,000 km programs) for diesel, gas, and dual-fuel engines. SYNTRAX™ captures combustion soot above 2% by weight, metal wear particles from ring/liner/bearing contact, and fuel dilution byproducts that reduce oil viscosity below SAE specification. Maintaining ISO 4406 code 16/14/11 extends bearing service life three to five times compared to uncontrolled contamination at 19/17/14.',
  },
  {
    q: 'What ISO standards govern ELIMFILTERS protection architectures?',
    a: 'MACROCORE™ and SYNTEPORE™ are validated against ISO 5011 (air filter performance for internal combustion engines). HYDROCORE™ water separation is verified against ASTM D6304 free water thresholds and SAE J1488 coalescer protocols. SYNTRAX™ lubrication protection targets ISO 4406 cleanliness codes — the international standard for particle contamination counting in oil systems. NANOFORCE™ hydraulic architecture is validated against ISO 16889 Beta ratio testing and targets ISO 4406 16/14/11 for proportional valve protection. DRYCORE™ achieves ISO 8573-1 Class 1–2 dew point targets for compressed air systems.',
  },
  {
    q: 'How does NANOFORCE™ prevent hydraulic proportional valve failure?',
    a: 'NANOFORCE™ is the Hydraulic Protection technology maintaining ISO 4406 cleanliness codes of 16/14/11 or tighter at 200–450 bar. Proportional valve spool clearances measure 5–25 µm — where silica particles above 5 µm (Mohs hardness 7) cause permanent micro-abrasion on valve faces. At contamination levels above ISO 19/17/14, proportional valve failure rates increase three to five times. NANOFORCE™ captures sub-micron particles at 1–10 µm that bypass standard 25 µm return-line protection systems.',
  },
  {
    q: 'What protection does MICROKAPPA™ provide for commercial vehicle operators?',
    a: 'MICROKAPPA™ is a cross-system cabin protection technology combining multi-stage PM2.5 particulate capture with activated carbon adsorption. It reduces cabin PM2.5 concentration by up to 85% versus standard OEM cabin elements. Professional drivers completing 9–11 hour daily schedules accumulate sustained occupational exposure to diesel exhaust particulate — classified as IARC Group 1 carcinogen. EU Directive 2019/130 and OSHA standards impose PM2.5 exposure limits for commercial vehicle operators, making documented cabin protection a compliance obligation for fleet operators in regulated jurisdictions.',
  },
];

export default function TechnologiesPage() {
  const itemListData = catalogue.technologies.map((tech, i) => {
    const slug = getSlug(tech.name);
    return {
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: tech.title,
        brand: { '@type': 'Brand', name: 'ELIMFILTERS' },
        description: GEO_DEFINITIONS[slug] || tech.description,
        url: `https://elimfilters.com/technologies/${slug}`,
        manufacturer: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
      },
    };
  });

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'ELIMFILTERS Proprietary Technologies — Asset Protection Platform',
        description: 'Twelve proprietary technologies organized within five protection systems: Air Intake & Airflow Protection, Fuel Cleanliness Protection, Lubrication Protection, Hydraulic Protection, and Cooling System Protection.',
        url: 'https://elimfilters.com/technologies/',
        numberOfItems: 12,
        itemListElement: itemListData,
      }) }} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Technologies', item: 'https://elimfilters.com/technologies' },
        ],
      }) }} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Link href="/"
        className="back-nav-btn" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        transition: 'background 0.2s, border-color 0.2s',
      }}>← HOME</Link>

      {/* Hero */}
      <section style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,3rem)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            lineHeight: 0.92,
            letterSpacing: '-0.03em',
            color: '#fff',
            margin: '0 0 2rem',
            maxWidth: '900px',
          }}>
            Protection<br />Technologies
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(0.9rem, 1.3vw, 1rem)',
            color: 'rgba(255,255,255,0.45)',
            maxWidth: '480px',
            lineHeight: 1.75,
            margin: 0,
          }}>
            Twelve proprietary architectures. Each engineered to control a specific contamination mechanism that causes equipment failure.
          </p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          style={{
            position: 'absolute',
            bottom: '2.5rem',
            right: 'clamp(1.5rem,5vw,3rem)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.25)',
          }}
        >
          SCROLL
          <div style={{
            width: '1px',
            height: '48px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)',
          }} />
        </motion.div>
      </section>

      {/* Scroll Cards — 12 Technologies */}
      <ScrollCards items={SCROLL_ITEMS} />

      {/* Asset Protection Narrative */}
      <section style={{
        padding: 'clamp(2.5rem,5vw,4rem) clamp(1.25rem,5vw,3rem)',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.02) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: '#fff', lineHeight: 1.6, marginBottom: '1.25rem', textAlign: 'justify', hyphens: 'none' } as React.CSSProperties}>
            Technology exists to protect assets.
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.9rem, 1.5vw, 1rem)', color: 'rgba(255,255,255,0.7)', lineHeight: 1.85, marginBottom: '1rem', textAlign: 'justify', hyphens: 'none' } as React.CSSProperties}>
            Every ELIMFILTERS architecture was engineered to control a specific contamination mechanism responsible for asset degradation, downtime, and operational risk. These architectures are not filter products. They are contamination control systems — the engineering foundation upon which every ELIMFILTERS asset protection strategy is built.
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.9rem, 1.5vw, 1rem)', color: 'rgba(255,255,255,0.7)', lineHeight: 1.85, textAlign: 'justify', hyphens: 'none' } as React.CSSProperties}>
            The technologies support the protection systems. The protection systems protect the assets. The objective is not filtration alone. The objective is asset protection — measurable, documented, and sustained across every operating environment.
          </p>
        </motion.div>
      </section>

      {/* Engineering Principle */}
      <section style={{
        padding: 'clamp(3rem,6vw,5rem) clamp(1.25rem,5vw,2rem)',
        background: '#000',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1px 1fr',
              gap: '0',
              border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.02)',
            }}>
              {/* Left: hierarchy chain */}
              <div style={{ padding: 'clamp(2rem,4vw,3rem)' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '1.75rem' }}>
                  Engineering Hierarchy
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {[
                    { label: 'Contamination Control', accent: true },
                    { label: 'Protection Systems', accent: false },
                    { label: 'Technology Architectures', accent: false },
                    { label: 'Product Implementations', accent: false },
                    { label: 'Protected Assets', accent: false },
                    { label: 'Operational Outcomes', accent: true },
                  ].map(({ label, accent }, i, arr) => (
                    <div key={label}>
                      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '0.95rem', color: accent ? '#FFF12D' : 'rgba(255,255,255,0.8)', margin: 0 }}>
                        {label}
                      </p>
                      {i < arr.length - 1 && (
                        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: 'rgba(255,241,45,0.25)', margin: '0.35rem 0', lineHeight: 1 }}>↓</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{ background: 'rgba(255,255,255,0.07)' }} />

              {/* Right: principle statements */}
              <div style={{ padding: 'clamp(2rem,4vw,3rem)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '1.75rem' }}>
                    Design Principle
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, marginBottom: '0.85rem' }}>
                    Technology is where reliability engineering becomes operational reality.
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, marginBottom: '1.75rem' }}>
                    Failures do not occur because equipment is old. Failures occur because contamination mechanisms remain uncontrolled.
                  </p>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['Products never define strategy.', 'Technologies support systems.', 'Systems protect assets.'].map(s => (
                    <p key={s} style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#fff', margin: 0, lineHeight: 1.5 }}>
                      {s}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>



      {/* FAQ Section */}
      <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.25rem,5vw,3rem)', background: '#000', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '3rem' }}
          >
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: '#fff', margin: '0' }}>
              Technical Questions
            </h2>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  padding: 'clamp(1.25rem,3vw,2rem)',
                }}
              >
                <h3 style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1rem)', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: '#fff', margin: '0 0 1rem', lineHeight: 1.5, textAlign: 'justify', hyphens: 'none' } as React.CSSProperties}>
                  {faq.q}
                </h3>
                <p style={{ fontSize: 'clamp(0.85rem, 1.3vw, 0.9rem)', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', lineHeight: 1.85, margin: '0', textAlign: 'justify', hyphens: 'none' } as React.CSSProperties}>
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
      </section>

      {/* CTA — Part Search */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)', borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.2em', color: 'rgba(255,241,45,0.6)', marginBottom: '1.25rem', textTransform: 'uppercase' }}>
            Find Your Filter
          </p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 700, color: '#fff', margin: '0 0 1rem', lineHeight: 1.25 }}>
            Search by Part Number or OEM Code
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.9rem, 1.4vw, 1rem)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto 2.5rem' }}>
            Cross-reference OEM specifications, part numbers, and application data across the full ELIMFILTERS product range.
          </p>
          <a
            href="https://part-search.elimfilters.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: '#FFF12D',
              color: '#000',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              padding: '1rem 2.5rem',
              textDecoration: 'none',
              textTransform: 'uppercase',
              transition: 'background 0.2s',
            }}
          >
            Open Part Search →
          </a>
        </motion.div>
      </section>
    </main>
  );
}
