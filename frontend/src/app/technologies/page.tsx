'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { catalogue, getSlug } from '@/lib/catalogue';
import { StaggerContainer, itemVariants } from '@/components/AnimateIn';
import { ScrollCards, type iCardItem } from '@/components/ui/scroll-cards';

const GEO_DEFINITIONS: Record<string, string> = {
  'turbocore-series': "TURBOCORE™ is ELIMFILTERS' heavy-duty turbine fuel filter/water separator line, delivering three-stage asset protection: Stage 1 intercepts solid particles via HYDROCORE™ inertial rotation, Stage 2 coalesces and removes emulsified water, and Stage 3 provides a final hydrophobic barrier. The FH 900FH and 1000FH models are designed for high-flow diesel fuel systems in power generation, mining, agriculture, and heavy transport.",
  'hydrocore': 'HYDROCORE™ is a hydrophobic water-separation technology that removes free, emulsified, and dissolved water from diesel fuel systems at 99.8% efficiency. The three-phase interception architecture uses a sealed collection chamber, coalescence geometry, and a 2µm hydrophobic terminal barrier — protecting HPCR injectors operating at 1,800–2,500 bar from water-induced corrosion, cavitation, and microbial contamination.',
  'drycore': 'DRYCORE™ is a molecular sieve desiccant technology engineered to remove moisture from compressed air and pneumatic systems. By adsorbing water vapour before phase transition occurs, DRYCORE™ prevents corrosion, freeze events, and seal degradation in air brake, suspension, and pneumatic control circuits on trucks, buses, and industrial equipment operating in high-humidity environments.',
  'intekcore': 'INTEKCORE™ is a high-pressure filter housing architecture rated for heavy-duty trucks and industrial machinery. Precision-formed sealing surfaces, corrosion-resistant construction, and OEM-compatible thread standards deliver zero-bypass performance under peak system pressure — ensuring no unfiltered fluid bypasses the element during cold starts, load spikes, or element change events.',
  'macrocore': 'MACROCORE™ is a Progressive Density Gradient (PDG) multi-layer air intake filtration system rated to ISO 5011 standards. Three density zones — macro-particle outer capture, gradient mid-zone, and sub-micron core barrier — achieve 99.9%–99.98% interception efficiency with a 62 PSI anti-collapse rating. Engineered for heavy-duty combustion engines in mining, agriculture, construction, power generation, and industrial compressors.',
  'microkappa': 'MICROKAPPA™ is a three-mechanism cabin air protection system combining electrostatic particle attraction, activated carbon adsorption, and HEPA-class mechanical filtration. It captures PM2.5 at 99% efficiency, removes VOCs and diesel exhaust gases at 95%, and achieves 99.97% efficiency at 0.3µm. Designed for operator health protection in trucks, buses, mining cabs, and agricultural machinery cabins.',
  'nanoforce': 'NANOFORCE™ is a multi-layer hydraulic contamination control architecture engineered for high-pressure hydraulic circuits. Three protection layers — macro guard, vapor control (dissolved water capture), and structural integrity core (3µm barrier) — maintain contamination control under continuous pressure pulsation. Vapor control addresses dissolved water phase-transition — the invisible hydraulic contamination source conventional filters ignore.',
  'syntepore': 'SYNTEPORE™ is a precision fuel injection protection technology engineered as the terminal barrier for Common Rail HPCR diesel systems operating above 2,000 bar. Three progressive layers — capture zone (40µm), intermediate band (10–4µm), and zero-migration barrier (4µm absolute) — prevent sub-micron particle contamination from reaching injector needle seats with clearances below 1 micron. Validated for Euro IV–VI injection systems.',
  'syntrax': 'SYNTRAX™ is a four-layer AI-calibrated lubrication protection architecture for engine oil circuits. The density gradient matrix targets contamination from 40µm (outer macro zone) down to 3µm (turbo custody barrier), with thermal bonding that locks layer position across the full service interval. Designed specifically to protect turbocharger shaft bearings operating on oil films of 2–4 microns.',
  'thermacore': 'THERMACORE™ is an SCA (Supplemental Coolant Additive) gradual-release technology for diesel engine cooling systems. Controlled passive dosing maintains SCA concentration within the protection corridor across the full service interval — preventing cylinder liner cavitation erosion and electrochemical corrosion on aluminum, copper, iron, steel, and brass cooling circuit components without operator intervention.',
  'marineclean': 'MARINECLEAN™ is a salt-resistant marine filtration architecture combining epoxy barrier coating, brine rejection geometry, and corrosion-shield internal components. IMO certified for commercial marine use, it protects diesel fuel and hydraulic systems against continuous saltwater aerosol exposure, seawater ingress, and the accelerated corrosion of wet-dry cycling in harbor, offshore, and deep-sea operating environments.',
  'duratech': 'DURATECH™ is a fleet maintenance master kit system that consolidates all filtration elements required for a complete vehicle service event — oil, fuel, air, and cabin — into a single OEM-interchangeable package. Platform-specific kits eliminate wrong-element installations in mixed-model fleets, convert filter inventory to a predictable kit-based structure, and standardize sourcing to a single order per service cycle.',
};

const TECH_COMPARISON = [
  { name: 'MACROCORE™', slug: 'macrocore', system: 'Air Intake Protection', func: 'Progressive Density Gradient air intake filtration', metric: '99.9%–99.98% efficiency · ISO 5011 · 62 PSI', industries: 'Mining, Agriculture, Construction, Power Gen' },
  { name: 'SYNTEPORE™', slug: 'syntepore', system: 'Fuel Cleanliness Protection', func: 'Terminal HPCR injector barrier (zero-migration 4µm)', metric: '4µm absolute · 2,000+ bar · Euro IV–VI', industries: 'Heavy Transport, Power Gen, Agriculture, Mining' },
  { name: 'HYDROCORE™', slug: 'hydrocore', system: 'Fuel Cleanliness Protection', func: 'Three-phase water separation from diesel fuel', metric: '99.8% separation efficiency · 2µm hydrophobic barrier', industries: 'Marine, Power Gen, Agriculture, Mining, Transport' },
  { name: 'TURBOCORE™', slug: 'turbocore-series', system: 'Fuel Cleanliness Protection', func: 'Three-stage fuel protection (inertia + coalescence + barrier)', metric: '99% water separation · ISO 16332 · 90–180 GPH', industries: 'Power Generation, Mining, Agriculture, Transport' },
  { name: 'SYNTRAX™', slug: 'syntrax', system: 'Lubrication Protection', func: '4-layer AI-calibrated lube oil protection', metric: '3µm turbo custody barrier · thermal bonding', industries: 'Trucks & Fleets, Bus & Coach, Mining, Construction' },
  { name: 'NANOFORCE™', slug: 'nanoforce', system: 'Hydraulic Protection', func: 'Multi-layer hydraulic with vapor control', metric: '3µm structural core · dissolved water capture', industries: 'Construction, Mining, Manufacturing, Marine' },
  { name: 'THERMACORE™', slug: 'thermacore', system: 'Cooling System Protection', func: 'SCA gradual-release for cylinder liner cavitation prevention', metric: 'Passive dosing · 5 metals · full service interval', industries: 'Heavy Transport, Power Gen, Agriculture, Mining' },
  { name: 'DRYCORE™', slug: 'drycore', system: 'Compressed Air Protection', func: 'Molecular sieve desiccant for pneumatic systems', metric: 'Zero moisture breakthrough · −40°C rated', industries: 'Railway, Bus & Coach, Industrial pneumatics' },
  { name: 'INTEKCORE™', slug: 'intekcore', system: 'Housing Systems', func: 'High-pressure filter housings for trucks & machinery', metric: 'Zero-bypass seal · OEM-compatible threads', industries: 'Heavy Trucks, Mining, Construction, Agriculture' },
  { name: 'MICROKAPPA™', slug: 'microkappa', system: 'Cabin Air Protection', func: 'Electrostatic + carbon + HEPA cabin occupant protection', metric: 'PM2.5 99% · VOC 95% · HEPA 99.97% at 0.3µm', industries: 'Trucks, Bus & Coach, Construction, Mining' },
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
    subtitle: 'Precision Injector Guard',
    description: 'Terminal barrier for Common Rail HPCR systems operating above 2,000 bar. Three progressive layers with 4µm zero-migration barrier protecting injector needle seats.',
    system: 'Fuel · HPCR Injectors',
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
    title: 'TURBOCORE™',
    subtitle: 'High-Flow Power Systems',
    description: 'Three-stage asset protection for turbine fuel systems. FH 900FH and 1000FH models for large-scale power generation and mining operations.',
    system: 'Fuel · Power Gen',
    src: '/assets/TURBOCORE.avif',
    href: '/technologies/turbocore-series',
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
    href: '/technologies/thermacore',
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
    q: 'What is the difference between MACROCORE™ and SYNTEPORE™?',
    a: 'MACROCORE™ and SYNTEPORE™ protect different systems entirely. MACROCORE™ is an air intake filtration system — Progressive Density Gradient (PDG) architecture achieving 99.9%–99.98% efficiency (ISO 5011) for combustion engine air circuits in mining, agriculture, and construction. SYNTEPORE™ is a fuel system technology — the terminal protection barrier for Common Rail HPCR diesel injection systems operating above 2,000 bar. Its three-layer progressive architecture delivers a 4µm zero-migration barrier protecting injector needle seats with clearances below 1 micron from sub-micron particle contamination.',
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
    a: 'MACROCORE™ is validated against ISO 5011 (air filter performance for combustion engines). SYNTEPORE™ and HYDROCORE™ fuel protection technologies are verified against ASTM D6304 (water content) and SAE J1488 (water separation efficiency). TURBOCORE™ is certified to ISO 16332 (fuel/water separation). SYNTRAX™ lubrication protection targets ISO 4406 cleanliness codes. NANOFORCE™ hydraulic architecture is validated against ISO 16889 Beta ratio testing. DRYCORE™ achieves ISO 8573-1 Class 1–2 dew point targets for compressed air systems. MICROKAPPA™ cabin protection is rated against ISO 11155 (vehicle cabin air filtration) and EU Directive 2019/130.',
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
        description: 'Ten proprietary technologies organized within five protection systems: Air Intake & Airflow Protection, Fuel Cleanliness Protection, Lubrication Protection, Hydraulic Protection, and Cooling System Protection.',
        url: 'https://elimfilters.com/technologies/',
        numberOfItems: 10,
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
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.9) 100%), url('/images/operator-technology.avif')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
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
            Ten proprietary architectures. Each engineered to control a specific contamination mechanism that causes equipment failure.
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

      {/* Scroll Cards — 10 Technologies */}
      <ScrollCards items={SCROLL_ITEMS} />

      {/* Commercial Lines */}
      <section style={{
        padding: 'clamp(3rem,6vw,5rem) clamp(1.25rem,5vw,3rem)',
        background: '#000',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '2.5rem' }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.28)', marginBottom: '0.75rem' }}>
              COMMERCIAL LINES
            </p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', color: '#fff', letterSpacing: '-0.01em', marginBottom: '0.6rem' }}>
              Specialized Product Lines
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: '560px' }}>
              Sector-specific and application-packaged product lines built on ELIMFILTERS filtration technologies.
            </p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
            {[
              {
                title: 'MARINECLEAN™',
                subtitle: 'Salt-Resistant Marine Filtration',
                body: 'Epoxy coating, brine rejection geometry, and corrosion-shield internals. IMO certified for continuous saltwater aerosol exposure in diesel fuel and hydraulic systems operating in harbor, offshore, and deep-sea environments.',
                tag: 'Marine · Offshore',
                src: '/assets/MARINECLEAN.avif',
                href: '/commercial-lines/marineclean',
              },
              {
                title: 'DURATECH™',
                subtitle: 'Fleet Master Kit System',
                body: 'Consolidated service kits with oil, fuel, air, and cabin elements per vehicle platform. OEM-interchangeable, single-source per service cycle for mixed-model fleet operations.',
                tag: 'Fleet Maintenance',
                src: '/assets/Duratech.avif',
                href: '/commercial-lines/duratech',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={item.href} style={{ textDecoration: 'none', display: 'block' }}>
                  <motion.div
                    whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                    transition={{ duration: 0.15 }}
                    style={{ background: '#000', padding: '2.5rem', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}
                  >
                    <img
                      src={item.src}
                      alt={item.title}
                      style={{ width: '100px', height: '100px', objectFit: 'contain', flexShrink: 0, filter: 'brightness(0) invert(1)', opacity: 0.85 }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)' }}>{item.tag}</p>
                      <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{item.title}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500, color: 'rgba(255,255,255,0.45)', marginBottom: '0.25rem' }}>{item.subtitle}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.65 }}>{item.body}</p>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(255,241,45,0.5)', letterSpacing: '0.08em', marginTop: '0.5rem' }}>EXPLORE →</p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
                <h3 style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1rem)', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: '#fff', margin: '0 0 1rem', lineHeight: 1.5, hyphens: 'none' } as React.CSSProperties}>
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
