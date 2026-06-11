'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { catalogue, getSlug } from '@/lib/catalogue';
import { StaggerContainer, itemVariants } from '@/components/AnimateIn';

const GEO_DEFINITIONS: Record<string, string> = {
  'aquaguard-series': "AQUAGUARD/SERIES™ is ELIMFILTERS' heavy-duty turbine fuel filter/water separator line, delivering three-stage asset protection: Stage 1 intercepts solid particles, Stage 2 coalesces and removes emulsified water, and Stage 3 provides a final polishing barrier. The FH 900FH and 1000FH models are designed for high-flow turbine fuel systems in power generation and large-scale mining operations.",
  'aquaguard': 'AQUAGUARD™ is a hydrophobic water-separation filtration technology that removes free and emulsified water from diesel and turbine fuel systems at 99.8% efficiency. Engineered for Common Rail and turbine fuel systems, it protects precision injector assets from corrosion, cavitation, and microbial contamination in mining, marine, power generation, and agriculture.',
  'cooltech': 'COOLTECH™ is a Supplemental Coolant Additive (SCA) release technology integrated into coolant filtration systems. It delivers controlled additive dosing to prevent liner pitting, cavitation erosion, and scale deposits in diesel engine cooling circuits, extending coolant service intervals and protecting thermal system integrity in heavy-duty trucks and stationary power generation.',
  'drycore': 'DRYCORE™ is a molecular sieve desiccant technology engineered to remove moisture from compressed air and pneumatic systems. By adsorbing water vapour before it reaches control valves, actuators, and pneumatic tools, DRYCORE™ prevents corrosion, freeze events, and seal degradation in industrial and mobile equipment operating in high-humidity environments.',
  'intekcore': 'INTEKCORE™ is a high-pressure filter housing architecture rated for heavy-duty trucks and industrial machinery. Precision-formed sealing surfaces and corrosion-resistant materials deliver zero-bypass performance under peak system pressure, ensuring no unfiltered fluid bypasses the element during cold starts, load spikes, or element change events.',
  'macrocore': 'MACROCORE™ is a Progressive Density Gradient (PDG) multi-layer air filtration system rated to ISO 5011 standards. Outer protection layers capture macro-contaminants while progressively denser inner zones neutralise sub-micron threats, achieving 99.9%–99.98% interception efficiency with a 62 PSI anti-collapse rating. Engineered for heavy-duty combustion engines: on-road vehicles, mining equipment, agricultural machinery, stationary power generation, and industrial compressors.',
  'microkappa': 'MICROKAPPA™ is an electrostatic cabin air filtration system combining activated carbon and HEPA-grade particle capture. The electrostatic charge attracts sub-micron particles, allergens, and diesel particulate matter, while the activated carbon layer controls odours from fuel vapours and exhaust intrusion. Designed for mining cabs, agricultural machinery, and heavy-duty trucks operating in high-dust environments.',
  'nanoforce': 'NANOFORCE™ is a multi-layer hydraulic filtration architecture engineered for high-pressure hydraulic circuits in heavy industrial machinery. It combines structural integrity reinforcement with vapour control mechanisms to maintain filter element form under system pressure spikes, delivering consistent sub-micron contamination interception across variable duty cycles.',
  'syntepore': 'SYNTEPORE™ is an all-synthetic air intake protection architecture for high-humidity, coastal, and marine intake environments. Structural integrity is maintained under moisture exposure conditions that degrade cellulose-based constructions, delivering consistent ISO 5011-compliant airflow restriction across variable humidity operating environments aboard offshore platforms, marine vessels, and humid tropical agricultural operations.',
  'syntrax': 'SYNTRAX™ is a synthetic lubrication protection architecture maintaining ISO 4406 cleanliness codes (16/14/11) throughout extended drain intervals for diesel, gas, and dual-fuel engines. It captures combustion soot above 2% by weight, metal wear particles, and fuel dilution byproducts — the primary degradation mechanisms that reduce oil film strength, accelerate bearing wear, and reduce engine service life in mobile and stationary applications.',
};

const TECH_COMPARISON = [
  { name: 'MACROCORE™', slug: 'macrocore', system: 'Air Intake', func: 'Progressive density gradient intake protection', metric: '99.9%–99.98% efficiency · ISO 5011', industries: 'Mining, Agriculture, Construction, Power Gen' },
  { name: 'SYNTEPORE™', slug: 'syntepore', system: 'Air Intake', func: 'All-synthetic intake for humid/marine environments', metric: 'ISO 5011 · moisture-resistant construction', industries: 'Marine, Offshore, Coastal, Agriculture' },
  { name: 'INTEKCORE™', slug: 'intekcore', system: 'Air Intake', func: 'Pre-cleaner housing for high-vibration environments', metric: 'Radial seal zero-bypass · railway traction', industries: 'Railway, Stationary industrial, Heavy trucks' },
  { name: 'DRYCORE™', slug: 'drycore', system: 'Compressed Air', func: 'Molecular sieve desiccant dryer', metric: 'ISO 8573-1 Class 1–2 dew point', industries: 'Railway, Bus & Coach, Industrial pneumatics' },
  { name: 'AQUAGUARD™', slug: 'aquaguard', system: 'Fuel Cleanliness', func: 'Turbine-stage water separation', metric: '99.8% free water · 95% emulsified removal', industries: 'Marine, Oil & Gas, Power Gen, Agriculture' },
  { name: 'SYNTRAX™', slug: 'syntrax', system: 'Lubrication', func: 'Full-flow lube protection at ISO 4406 16/14/11', metric: 'Extended drain interval · soot capture above 2%', industries: 'Trucks & Fleets, Bus & Coach, Railway' },
  { name: 'NANOFORCE™', slug: 'nanoforce', system: 'Hydraulic', func: 'Sub-micron Beta-rated contamination control', metric: 'ISO 4406 16/14/11 · 200–450 bar', industries: 'Construction, Mining, Manufacturing, Marine' },
  { name: 'COOLTECH™', slug: 'cooltech', system: 'Cooling System', func: 'DCA-replenishing coolant protection', metric: 'SCA restoration · liner cavitation prevention', industries: 'Trucks & Fleets, Bus & Coach, Power Gen' },
  { name: 'MICROKAPPA™', slug: 'microkappa', system: 'Cabin Protection', func: 'PM2.5 capture + activated carbon adsorption', metric: 'Up to 85% PM2.5 reduction · EU Dir. 2019/130', industries: 'Trucks, Bus & Coach, Construction, Mining' },
];

const FAQS = [
  {
    q: 'What is the difference between MACROCORE™ and SYNTEPORE™ air intake protection?',
    a: 'Both are Air Intake architectures (System 01) but target different operating environments. MACROCORE™ uses Progressive Density Gradient (PDG) media — a multi-layer cellulose-synthetic composite achieving 99.9%–99.98% efficiency (ISO 5011) at dust concentrations up to 10,000 mg/m³ in mining, agriculture, and construction. SYNTEPORE™ is all-synthetic construction for high-humidity, coastal, and marine intake environments where moisture exposure would degrade cellulose media — maintaining ISO 5011-compliant airflow restriction regardless of humidity conditions.',
  },
  {
    q: 'Which ELIMFILTERS architecture protects HPCR diesel injection systems?',
    a: 'AQUAGUARD™ is the fuel cleanliness architecture (System 02) for HPCR injection systems operating at 1,800–2,500 bar. It uses turbine-stage coalescing separation to remove free water at 99.8% efficiency and emulsified water at 95% — preventing injector needle corrosion above 200 ppm water content and pump cavitation. HPCR injector needle clearances measure 1–3 µm, making water contamination the primary failure mechanism in fuel-injection equipment.',
  },
  {
    q: 'What is SYNTRAX™ and which system does it protect?',
    a: 'SYNTRAX™ is the lubrication reliability architecture for System 03 — engine oil protection. It maintains ISO 4406 cleanliness codes (16/14/11) throughout extended drain intervals (60,000–100,000 km programs) for diesel, gas, and dual-fuel engines. SYNTRAX™ captures combustion soot above 2% by weight, metal wear particles from ring/liner/bearing contact, and fuel dilution byproducts that reduce oil viscosity below SAE specification. Maintaining ISO 4406 code 16/14/11 extends bearing service life three to five times compared to uncontrolled contamination at 19/17/14.',
  },
  {
    q: 'What ISO standards govern ELIMFILTERS protection architectures?',
    a: 'MACROCORE™ and SYNTEPORE™ are validated against ISO 5011 (air filter performance for internal combustion engines). AQUAGUARD™ water separation is verified against ASTM D6304 free water thresholds and SAE J1488 coalescer protocols. SYNTRAX™ lubrication protection targets ISO 4406 cleanliness codes — the international standard for particle contamination counting in oil systems. NANOFORCE™ hydraulic architecture is validated against ISO 16889 Beta ratio testing and targets ISO 4406 16/14/11 for proportional valve protection. DRYCORE™ achieves ISO 8573-1 Class 1–2 dew point targets for compressed air systems.',
  },
  {
    q: 'How does NANOFORCE™ prevent hydraulic proportional valve failure?',
    a: 'NANOFORCE™ is the hydraulic contamination control architecture (System 04) maintaining ISO 4406 cleanliness codes of 16/14/11 or tighter at 200–450 bar. Proportional valve spool clearances measure 5–25 µm — where silica particles above 5 µm (Mohs hardness 7) cause permanent micro-abrasion on valve faces. At contamination levels above ISO 19/17/14, proportional valve failure rates increase three to five times. NANOFORCE™ captures sub-micron particles at 1–10 µm that bypass standard 25 µm return-line protection systems.',
  },
  {
    q: 'What protection does MICROKAPPA™ provide for commercial vehicle operators?',
    a: 'MICROKAPPA™ is the cabin environmental protection architecture (System 05) combining multi-stage PM2.5 particulate capture with activated carbon adsorption. It reduces cabin PM2.5 concentration by up to 85% versus standard OEM cabin elements. Professional drivers completing 9–11 hour daily schedules accumulate sustained occupational exposure to diesel exhaust particulate — classified as IARC Group 1 carcinogen. EU Directive 2019/130 and OSHA standards impose PM2.5 exposure limits for commercial vehicle operators, making documented cabin protection a compliance obligation for fleet operators in regulated jurisdictions.',
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
        name: 'ELIMFILTERS Proprietary Protection Architectures',
        description: 'Nine exclusive protection architectures for industrial asset protection across air intake, fuel cleanliness, lubrication, hydraulic, compressed air, cooling, and cabin contamination domains.',
        url: 'https://elimfilters.com/technologies/',
        numberOfItems: 9,
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
      <section style={{
        marginTop: 0,
        paddingTop: 'clamp(3.5rem,8vw,5rem)',
        paddingBottom: 'clamp(3rem,7vw,5rem)',
        backgroundImage: 'url(/images/system-hero.avif)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        backgroundAttachment: 'scroll',
        position: 'relative',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.50) 100%)',
          zIndex: 1,
        }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: '1.5rem' }}
          >
            <span style={{
              display: 'block', fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.25em', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace',
            }}>
              // TECHNOLOGIES
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900,
              fontFamily: 'Space Grotesk, sans-serif', marginBottom: '1.5rem',
              lineHeight: 1.1, color: 'rgba(255,255,255,0.9)',
            }}
          >
            NINE EXCLUSIVE PROTECTION ARCHITECTURES
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1rem)', lineHeight: 1.7,
              color: 'rgba(255,255,255,0.75)', fontFamily: 'Outfit, sans-serif',
              maxWidth: '700px', borderLeft: '3px solid #FFF12D', paddingLeft: '1.25rem',
            }}
          >
            Nine protection architectures organized by contamination domain — air intake, fuel cleanliness, lubrication, hydraulic, compressed air, cooling, and cabin — each defined by its contamination target, failure mechanism, and measurable engineering standard.
          </motion.p>
        </div>
      </section>

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
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
            ELIMFILTERS technologies are engineered to protect industrial assets by controlling contamination at the source across air, fuel, hydraulic, lubrication, and cabin systems. Each technology is designed to solve specific contamination problems that degrade equipment performance, reduce operational reliability, and accelerate total cost of ownership. Technologies are the physical embodiment of ELIMFILTERS&apos; industrial asset protection strategy.
          </p>
        </motion.div>
      </section>

      {/* Technologies Grid */}
      <section style={{ padding: 'clamp(3rem,6vw,5rem) clamp(1.25rem,5vw,2rem)', background: '#000' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <StaggerContainer style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {catalogue.technologies.map((tech) => {
              const slug = getSlug(tech.name);
              const geoDef = GEO_DEFINITIONS[slug];
              return (
                <motion.div key={tech.name} variants={itemVariants}>
                  <Link href={`/technologies/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <motion.div
                      whileHover={{ y: -5, boxShadow: '0 16px 48px rgba(255,241,45,0.14)' }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,0,0,0.3) 100%)',
                        border: '1px solid rgba(255,241,45,0.2)',
                        borderRadius: '12px',
                        padding: 'clamp(1.5rem,4vw,2.5rem) clamp(1.25rem,3vw,2rem)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255,241,45,0.1)' }}>
                        <h3 style={{
                          fontSize: '1.4rem', fontWeight: 700,
                          fontFamily: 'Space Grotesk, sans-serif',
                          color: 'rgba(255,255,255,0.9)', margin: '0 0 0.5rem',
                        }}>
                          {tech.title}
                        </h3>
                        {tech.subtitle && (
                          <p style={{ fontSize: '0.9rem', color: '#FFF12D', fontFamily: 'Outfit, sans-serif', fontWeight: 600, margin: '0' }}>
                            {tech.subtitle}
                          </p>
                        )}
                      </div>

                      {/* GEO Definition — full prose for AI engine extraction */}
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'rgba(255,255,255,0.7)',
                        fontFamily: 'Inter, sans-serif',
                        lineHeight: 1.75,
                        margin: '0',
                        flexGrow: 1,
                      }}>
                        {geoDef || tech.description}
                      </p>

                      <div style={{ marginTop: 'auto' }}>
                        {tech.features.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                            {tech.features.slice(0, 3).map((feature, idx) => (
                              <span key={idx} style={{
                                fontSize: '0.75rem',
                                background: 'rgba(255,241,45,0.1)',
                                color: '#FFF12D',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '4px',
                                fontFamily: 'Outfit, sans-serif',
                                fontWeight: 600,
                              }}>
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}
                        <span style={{
                          display: 'inline-block', color: '#FFF12D',
                          fontSize: '0.85rem', fontWeight: 600,
                          fontFamily: 'Outfit, sans-serif', letterSpacing: '0.05em',
                        }}>
                          DISCOVER →
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </StaggerContainer>
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
              Nine Protection Architectures — Quick Reference
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif', maxWidth: '600px', margin: '0' }}>
              System assignment, primary contamination target, key engineering metric, and applicable industries across the nine proprietary ELIMFILTERS protection architectures.
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
    </main>
  );
}
