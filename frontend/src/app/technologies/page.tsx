'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { catalogue, getSlug } from '@/lib/catalogue';
import { StaggerContainer, itemVariants } from '@/components/AnimateIn';
import { TechnologiesParallaxContent } from '@/components/ui/text-parallax-content-scroll';

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

const TECH_CARDS = [
  { slug: 'macrocore',      logo: '/images/macrocore(fn).avif',   bg: '/images/air-filter1.avif',        system: 'Air Intake' },
  { slug: 'syntepore',      logo: null,                            bg: '/images/syntrapore-hero.avif',    system: 'Air Intake · Marine' },
  { slug: 'intekcore',      logo: '/images/intekcore(fn).avif',   bg: '/images/trenes.avif',             system: 'Air Intake · Railway' },
  { slug: 'drycore',        logo: '/images/drycore(fn).avif',     bg: '/images/airdryer-hero.avif',      system: 'Compressed Air' },
  { slug: 'hydrocore',      logo: '/images/HYDROCORE.avif',       bg: '/images/fuelseparator.avif',      system: 'Fuel Cleanliness' },
  { slug: 'hydrocore-series', logo: null,                          bg: '/images/turbinas-hero.avif',      system: 'Fuel · Power Gen' },
  { slug: 'syntrax',        logo: '/images/syntrax.avif',         bg: '/images/oil-hero.avif',           system: 'Lubrication' },
  { slug: 'nanoforce',      logo: '/images/nanoforce(fn).avif',   bg: '/images/hidraulic.avif',          system: 'Hydraulic' },
  { slug: 'cooltech',       logo: null,                            bg: '/images/coolant-hero.avif',       system: 'Cooling System' },
  { slug: 'marineclean',    logo: '/images/marineclean(fn).avif', bg: '/images/ingmarine.avif',          system: 'Marine · Cross-System' },
  { slug: 'duratech',       logo: '/images/duratech(fn).avif',    bg: '/images/trucks-1.avif',           system: 'Fleet · Cross-System' },
  { slug: 'microkappa',     logo: '/images/microkappa(fn).avif',  bg: '/images/cabin-hero.avif',         system: 'Cabin Air Quality' },
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
      {/* Hero Section */}
      <TechnologiesParallaxContent />

      {/* Asset Protection Narrative */}
      <section style={{
        padding: 'clamp(2.5rem,5vw,4rem) clamp(1.25rem,5vw,2rem)',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.02) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ maxWidth: '900px', margin: '0 auto' }}
        >
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: '#fff', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Technology exists to protect assets.
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.85, marginBottom: '1rem' }}>
            Every ELIMFILTERS architecture was engineered to control a specific contamination mechanism responsible for asset degradation, downtime, and operational risk. These architectures are not filter products. They are contamination control systems — the engineering foundation upon which every ELIMFILTERS asset protection strategy is built.
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.85 }}>
            The technologies support the protection systems. The protection systems protect the assets. The objective is not filtration alone. The objective is asset protection — measurable, documented, and sustained across every operating environment.
          </p>
        </motion.div>
      </section>

      {/* Technology Governance Principle */}
      <section style={{
        padding: 'clamp(2.5rem,5vw,4rem) clamp(1.25rem,5vw,2rem)',
        background: 'rgba(255,241,45,0.03)',
        borderBottom: '1px solid rgba(255,241,45,0.1)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', marginBottom: '2rem' }}>
              // TECHNOLOGY GOVERNANCE PRINCIPLE
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[
                  'Contamination Control',
                  'Protection Systems',
                  'Technology Architectures',
                  'Product Implementations',
                  'Protected Assets',
                  'Operational Outcomes',
                ].map((item, i, arr) => (
                  <div key={item}>
                    <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: i === 0 ? '#FFF12D' : i === arr.length - 1 ? '#FFF12D' : 'rgba(255,255,255,0.85)', margin: 0 }}>
                      {item}
                    </p>
                    {i < arr.length - 1 && (
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: 'rgba(255,241,45,0.35)', margin: '0.3rem 0', lineHeight: 1 }}>↓</p>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.25rem' }}>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.65)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                  Products never define strategy.
                </p>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.65)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                  Technologies support systems.
                </p>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.65)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                  Systems protect assets.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Technologies Grid */}
      <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.25rem,5vw,2rem)', background: '#000' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '3rem' }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.5rem)', color: '#fff', margin: '0 0 0.75rem' }}>
              12 Protection Technologies
            </h2>
            <p style={{ fontFamily: 'var(--font-inter)', fontSize: '1rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              Each technology engineered to control a specific contamination mechanism.
            </p>
          </motion.div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5px',
          }}>
            {TECH_CARDS.map((card, i) => {
              const techData = TECH_COMPARISON.find(t => t.slug === card.slug);
              if (!techData) return null;
              return (
                <motion.div
                  key={card.slug}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.04 }}
                >
                  <Link
                    href={`/technologies/${card.slug}`}
                    style={{ display: 'block', textDecoration: 'none', position: 'relative', overflow: 'hidden', aspectRatio: '4/3' }}
                    onMouseEnter={e => {
                      const img = e.currentTarget.querySelector('.tech-bg') as HTMLImageElement;
                      const overlay = e.currentTarget.querySelector('.tech-hover') as HTMLElement;
                      if (img) img.style.transform = 'scale(1.06)';
                      if (overlay) overlay.style.transform = 'translateY(0)';
                    }}
                    onMouseLeave={e => {
                      const img = e.currentTarget.querySelector('.tech-bg') as HTMLImageElement;
                      const overlay = e.currentTarget.querySelector('.tech-hover') as HTMLElement;
                      if (img) img.style.transform = 'scale(1)';
                      if (overlay) overlay.style.transform = 'translateY(100%)';
                    }}
                  >
                    {/* Background image */}
                    <img
                      className="tech-bg"
                      src={card.bg}
                      alt={techData.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
                    />

                    {/* Base gradient overlay */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.15) 100%)',
                    }} />

                    {/* Logo centered with mix-blend-mode: screen */}
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {card.logo ? (
                        <img
                          src={card.logo}
                          alt={techData.name}
                          style={{
                            maxWidth: '55%', maxHeight: '35%',
                            objectFit: 'contain',
                            mixBlendMode: 'screen',
                            opacity: 0.95,
                          }}
                        />
                      ) : (
                        <span style={{
                          fontFamily: 'var(--font-display)', fontWeight: 800,
                          fontSize: 'clamp(1.1rem, 1.8vw, 1.5rem)',
                          color: '#fff', textAlign: 'center', padding: '0 1rem',
                          letterSpacing: '0.04em',
                        }}>
                          {techData.name}
                        </span>
                      )}
                    </div>

                    {/* Bottom label */}
                    <div style={{
                      position: 'absolute', bottom: '1.2rem', left: '1.2rem', right: '1.2rem',
                      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                    }}>
                      <div>
                        {card.logo && (
                          <span style={{
                            display: 'block',
                            fontFamily: 'var(--font-display)', fontWeight: 800,
                            fontSize: 'clamp(0.85rem, 1.2vw, 1rem)',
                            letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff',
                          }}>
                            {techData.name}
                          </span>
                        )}
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                          letterSpacing: '0.12em', color: 'rgba(255,241,45,0.7)',
                          textTransform: 'uppercase',
                        }}>
                          {card.system}
                        </span>
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontWeight: 600,
                        fontSize: '0.65rem', letterSpacing: '0.15em',
                        color: '#FFF12D', textTransform: 'uppercase',
                      }}>
                        EXPLORE →
                      </span>
                    </div>

                    {/* Hover overlay — slides up */}
                    <div
                      className="tech-hover"
                      style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.88)',
                        transform: 'translateY(100%)',
                        transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
                        display: 'flex', flexDirection: 'column',
                        justifyContent: 'flex-end', padding: '1.5rem',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      <span style={{
                        fontFamily: 'var(--font-display)', fontWeight: 800,
                        fontSize: '1rem', color: '#FFF12D',
                        letterSpacing: '0.05em', marginBottom: '0.6rem',
                        display: 'block',
                      }}>
                        {techData.name}
                      </span>
                      <p style={{
                        fontFamily: 'var(--font-inter)', fontSize: '0.78rem',
                        color: 'rgba(255,255,255,0.75)', lineHeight: 1.65,
                        margin: '0 0 1rem',
                      }}>
                        {techData.func} — {techData.metric}
                      </p>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontWeight: 700,
                        fontSize: '0.7rem', letterSpacing: '0.12em',
                        color: '#FFF12D', textTransform: 'uppercase',
                      }}>
                        EXPLORE →
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Technology Matters */}
      <section style={{ padding: 'clamp(2.5rem,5vw,4rem) clamp(1.25rem,5vw,2rem)', background: '#000', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', marginBottom: '1.5rem' }}>
              // WHY TECHNOLOGY MATTERS IN ASSET PROTECTION
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.85, marginBottom: '1rem' }}>
              Technology is where reliability engineering becomes operational reality.
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.85, marginBottom: '1rem' }}>
              Failures do not occur because equipment is old. Failures occur because contamination mechanisms remain uncontrolled.
            </p>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 'clamp(1rem, 2vw, 1.1rem)', color: '#fff', lineHeight: 1.6 }}>
              Every ELIMFILTERS asset protection technology exists to control one of those mechanisms.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Asset Protection Architecture Map */}
      <section style={{ padding: 'clamp(2.5rem,5vw,4rem) clamp(1.25rem,5vw,2rem)', background: 'rgba(255,241,45,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '2.5rem' }}
          >
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '1rem' }}>
              // ASSET PROTECTION ARCHITECTURE MAP
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: '#fff', margin: 0 }}>
              Protection Domain Architecture
            </h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem' }}>
            {[
              { domain: 'Air Intake & Airflow', techs: ['MACROCORE™', 'INTEKCORE™', 'DRYCORE™'] },
              { domain: 'Fuel Cleanliness', techs: ['HYDROCORE™', 'HYDROCORE/SERIES™', 'SYNTEPORE™'] },
              { domain: 'Lubrication', techs: ['SYNTRAX™'] },
              { domain: 'Hydraulic', techs: ['NANOFORCE™'] },
              { domain: 'Cooling System', techs: ['THERMACORE™'] },
              { domain: 'Cabin Air Quality', techs: ['MICROKAPPA™'] },
              { domain: 'Fleet Lifecycle', techs: ['DURATECH™'] },
              { domain: 'Marine & Offshore', techs: ['MARINECLEAN™'] },
            ].map(({ domain, techs }) => (
              <motion.div
                key={domain}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                }}
              >
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.12em', color: '#FFF12D', marginBottom: '0.6rem', textTransform: 'uppercase', lineHeight: 1.4 }}>
                  {domain}
                </p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(255,241,45,0.3)', margin: '0 0 0.5rem', lineHeight: 1 }}>↓</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {techs.map(tech => {
                    const slug = tech.toLowerCase().replace(/™|®/g, '').replace(/\//g, '-').replace(/\s+/g, '-');
                    return (
                      <Link key={tech} href={`/technologies/${slug}`} style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#FFF12D')}
                        onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.85)')}
                      >
                        {tech} →
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Comparison Table */}
      <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.25rem,5vw,2rem)', background: 'rgba(255,241,45,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '3rem' }}
          >
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '1rem' }}>
              // TECHNOLOGY COMPARISON
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: '#fff', margin: '0 0 1rem' }}>
              Twelve Technologies — Quick Reference
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif', maxWidth: '600px', margin: '0' }}>
              Protection system assignment, primary contamination target, key engineering metric, and applicable industries across the twelve ELIMFILTERS technologies. MARINECLEAN™, DURATECH™, and MICROKAPPA™ are classified as cross-system platform technologies.
            </p>
          </motion.div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,241,45,0.3)' }}>
                  {['Technology', 'System', 'Primary Function', 'Key Metric', 'Industries'].map(h => (
                    <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.15em', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TECH_COMPARISON.map((row, i) => (
                  <tr key={row.slug} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <td style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>
                      <Link href={`/technologies/${row.slug}`} style={{ color: '#FFF12D', fontWeight: 700, textDecoration: 'none', fontFamily: 'Space Grotesk, sans-serif' }}>
                        {row.name}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace' }}>
                      {row.system}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                      {row.func}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, whiteSpace: 'nowrap' }}>
                      {row.metric}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, fontSize: '0.82rem' }}>
                      {row.industries}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.25rem,5vw,2rem)', background: '#000', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '3rem' }}
          >
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '1rem' }}>
              // FREQUENTLY ASKED QUESTIONS
            </span>
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
                  padding: '2rem',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: '#fff', margin: '0 0 1rem', lineHeight: 1.5 }}>
                  {faq.q}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', lineHeight: 1.85, margin: '0' }}>
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Closing Platform Positioning */}
      <section style={{
        padding: 'clamp(3rem,6vw,5rem) clamp(1.25rem,5vw,2rem)',
        background: 'rgba(255,241,45,0.03)',
        borderTop: '1px solid rgba(255,241,45,0.15)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'rgba(255,255,255,0.75)', lineHeight: 2, margin: 0 }}>
              Technologies control contamination.
            </p>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'rgba(255,255,255,0.75)', lineHeight: 2, margin: 0 }}>
              Systems protect assets.
            </p>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#FFF12D', lineHeight: 2, margin: 0 }}>
              Protected assets sustain operations.
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
