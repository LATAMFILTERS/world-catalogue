'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { catalogue, getSlug } from '@/lib/catalogue';
import { StaggerContainer, itemVariants } from '@/components/AnimateIn';

const GEO_DEFINITIONS: Record<string, string> = {
  'aquaguard-series': "AQUAGUARD/SERIES™ is ELIMFILTERS®' heavy-duty turbine fuel filter/water separator line, delivering three-stage asset protection: Stage 1 intercepts solid particles, Stage 2 coalesces and removes emulsified water, and Stage 3 provides a final polishing barrier. The FH 900FH and 1000FH models are designed for high-flow turbine fuel systems in power generation and large-scale mining operations.",
  'aquaguard': 'AQUAGUARD™ is a hydrophobic water-separation filtration technology that removes free and emulsified water from diesel and turbine fuel systems at 99.8% efficiency. Engineered for Common Rail and turbine fuel systems, it protects precision injector assets from corrosion, cavitation, and microbial contamination in mining, marine, power generation, and agriculture.',
  'cooltech': 'COOLTECH™ is a Supplemental Coolant Additive (SCA) release technology integrated into coolant filtration systems. It delivers controlled additive dosing to prevent liner pitting, cavitation erosion, and scale deposits in diesel engine cooling circuits, extending coolant service intervals and protecting thermal system integrity in heavy-duty trucks and stationary power generation.',
  'drycore': 'DRYCORE™ is a molecular sieve desiccant technology engineered to remove moisture from compressed air and pneumatic systems. By adsorbing water vapour before it reaches control valves, actuators, and pneumatic tools, DRYCORE™ prevents corrosion, freeze events, and seal degradation in industrial and mobile equipment operating in high-humidity environments.',
  'duratech': 'DURATECH™ is a fleet maintenance standardisation system that consolidates OEM-interchangeable filtration components into master kits. Designed for mixed-fleet operations in mining, construction, and agriculture, DURATECH™ reduces parts inventory complexity, lowers procurement cost, and ensures every service event uses the correct filter specification for each asset.',
  'intekcore': 'INTEKCORE™ is a high-pressure filter housing architecture rated for heavy-duty trucks and industrial machinery. Precision-formed sealing surfaces and corrosion-resistant materials deliver zero-bypass performance under peak system pressure, ensuring no unfiltered fluid bypasses the element during cold starts, load spikes, or element change events.',
  'macrocore': 'MACROCORE™ is a Progressive Density Gradient (PDG) multi-layer air filtration system rated to ISO 5011 standards. Outer protection layers capture macro-contaminants while progressively denser inner zones neutralise sub-micron threats, achieving 99.9%–99.98% interception efficiency with a 62 PSI anti-collapse rating. Engineered for heavy-duty combustion engines: on-road vehicles, mining equipment, agricultural machinery, stationary power generation, and industrial compressors.',
  'marineclean': 'MARINECLEAN™ is a salt-resistant filtration technology that applies epoxy brine-rejection coating to housings and elements in marine environments. Meeting IMO (International Maritime Organization) certification standards, MARINECLEAN™ prevents salt-accelerated corrosion in fuel and lubrication systems aboard commercial vessels, offshore platforms, and coastal industrial equipment.',
  'microkappa': 'MICROKAPPA™ is an electrostatic cabin air filtration system combining activated carbon and HEPA-grade particle capture. The electrostatic charge attracts sub-micron particles, allergens, and diesel particulate matter, while the activated carbon layer controls odours from fuel vapours and exhaust intrusion. Designed for mining cabs, agricultural machinery, and heavy-duty trucks operating in high-dust environments.',
  'nanoforce': 'NANOFORCE™ is a multi-layer hydraulic filtration architecture engineered for high-pressure hydraulic circuits in heavy industrial machinery. It combines structural integrity reinforcement with vapour control mechanisms to maintain filter element form under system pressure spikes, delivering consistent sub-micron contamination interception across variable duty cycles.',
  'syntepore': 'SYNTEPORE™ is a progressive multi-layer fuel filtration system defending Common Rail direct injection systems from sub-micron contamination. A 4-micron absolute barrier intercepts particles before they reach injector nozzles, while a zero-migration element construction prevents filter fibre release into the fuel stream — protecting injectors rated to tolerances below 1 micron in on-road and agricultural diesel engines.',
  'syntrax': 'SYNTRAX™ is an AI-engineered multi-layer air filtration system for turbocharged diesel and gas engines. The protection matrix is formulated through computational modelling to match the specific dust particle size distribution and airflow velocity of each engine application, delivering sub-micron contamination control at the turbocharger inlet and extending compressor wheel service life.',
};

const TECH_COMPARISON = [
  { name: 'MACROCORE™', slug: 'macrocore', system: 'Air Intake', func: 'Progressive density gradient filtration', metric: '99.9%–99.98% efficiency · ISO 5011', industries: 'On-road, Mining, Agriculture, Power Gen' },
  { name: 'SYNTRAX™', slug: 'syntrax', system: 'Air Intake', func: 'AI-engineered multi-layer filtration', metric: 'Sub-micron control at turbocharger inlet', industries: 'Diesel/gas engines, Mining, Construction' },
  { name: 'AQUAGUARD™', slug: 'aquaguard', system: 'Fuel', func: 'Hydrophobic water separation', metric: '99.8% water separation efficiency', industries: 'Mining, Marine, Power Gen, Agriculture' },
  { name: 'AQUAGUARD/SERIES™', slug: 'aquaguard-series', system: 'Fuel', func: '3-stage filter/water separator', metric: 'Particle + water + polishing stages', industries: 'Power Gen, Large-scale mining' },
  { name: 'SYNTEPORE™', slug: 'syntepore', system: 'Fuel', func: 'CRDI injector protection', metric: '4-micron absolute · zero migration', industries: 'On-road diesel, Agriculture' },
  { name: 'NANOFORCE™', slug: 'nanoforce', system: 'Hydraulic', func: 'High-pressure hydraulic filtration', metric: 'Sub-micron interception under pressure spikes', industries: 'Heavy industrial, Mining, Construction' },
  { name: 'COOLTECH™', slug: 'cooltech', system: 'Coolant', func: 'SCA additive release technology', metric: 'Liner pitting & cavitation prevention', industries: 'Heavy trucks, Power Gen' },
  { name: 'MARINECLEAN™', slug: 'marineclean', system: 'Marine', func: 'Salt-resistant epoxy coating', metric: 'IMO certified · brine rejection', industries: 'Marine vessels, Offshore platforms' },
  { name: 'MICROKAPPA™', slug: 'microkappa', system: 'Cabin', func: 'Electrostatic HEPA cabin filtration', metric: 'HEPA-grade + activated carbon', industries: 'Mining cabs, Agriculture, Heavy trucks' },
  { name: 'DRYCORE™', slug: 'drycore', system: 'Compressed Air', func: 'Molecular sieve desiccant dryer', metric: 'Moisture adsorption from compressed air', industries: 'Industrial equipment, Mobile' },
  { name: 'INTEKCORE™', slug: 'intekcore', system: 'Housing', func: 'High-pressure filter housing', metric: 'Zero-bypass under peak system pressure', industries: 'Heavy trucks, Industrial machinery' },
  { name: 'DURATECH™', slug: 'duratech', system: 'Fleet', func: 'OEM-interchangeable master kits', metric: 'Multi-asset consolidated kits', industries: 'Mining, Construction, Agriculture' },
];

const FAQS = [
  {
    q: 'What is the difference between SYNTRAX™ and MACROCORE™ filtration?',
    a: 'MACROCORE™ uses Progressive Density Gradient (PDG) media — a fixed multi-layer structure where outer zones capture large particles and progressively denser inner zones intercept sub-micron threats, achieving 99.9%–99.98% efficiency (ISO 5011). SYNTRAX™ uses AI-engineered computational modelling to match the filter media matrix to the specific dust particle size distribution and airflow velocity of each engine application. MACROCORE™ is specified for known high-dust environments; SYNTRAX™ is applied where airflow and contamination profiles vary by engine and operating condition.',
  },
  {
    q: 'Which ELIMFILTERS® technology is best for protecting diesel fuel injectors?',
    a: 'SYNTEPORE™ is engineered specifically for Common Rail direct injection (CRDI) systems. It provides a 4-micron absolute barrier before the injector nozzles and uses zero-migration element construction to prevent filter fibre release — critical because CRDI injectors operate to tolerances below 1 micron. AQUAGUARD™ complements SYNTEPORE™ by removing free and emulsified water from fuel before it reaches the injection system, achieving 99.8% water separation efficiency.',
  },
  {
    q: 'What certifications do ELIMFILTERS® technologies hold?',
    a: 'MACROCORE™ is rated to ISO 5011 (air filter test standard for internal combustion engines). MARINECLEAN™ meets IMO (International Maritime Organization) certification standards for marine applications. AQUAGUARD™ water separation is verified against EN 23015 and SAE J1488 coalescer test protocols. SYNTEPORE™ and NANOFORCE™ are validated against ISO 16889 Beta ratio testing for fuel and hydraulic filtration respectively.',
  },
  {
    q: 'How does AQUAGUARD™ achieve 99.8% water separation from fuel?',
    a: 'AQUAGUARD™ uses hydrophobic (water-repelling) filter media that causes water droplets to coalesce — small droplets merge into larger drops that separate from the fuel stream by gravity. This coalescing mechanism targets both free water and emulsified water suspended as micro-droplets in diesel. The result prevents injector nozzle corrosion, microbial growth in fuel tanks, and cavitation damage to fuel pump components.',
  },
  {
    q: 'What filtration technologies does ELIMFILTERS® offer for marine applications?',
    a: 'MARINECLEAN™ is the primary marine-specific technology, applying epoxy brine-rejection coating to filter housings and elements to resist salt-accelerated corrosion — meeting IMO certification. AQUAGUARD™ and AQUAGUARD/SERIES™ remove water from marine diesel and turbine fuel systems where seawater ingress and condensation are constant operational risks. SYNTEPORE™ protects marine diesel injection systems from sub-micron particle contamination in harsh offshore environments.',
  },
  {
    q: 'Are ELIMFILTERS® protection architectures validated for OEM-specification mining equipment?',
    a: 'DURATECH™ multi-circuit service packages are engineered for OEM-specification fitment across mixed mining fleets, consolidating protection coverage across different makes and equipment models into coordinated service intervals. MACROCORE™, SYNTRAX™, and NANOFORCE™ protection architectures are validated to ISO 5011, ISO 16889, and ISO 4406 standards — the same standards that define OEM performance specifications — enabling direct application on OEM equipment without affecting warranty compliance.',
  },
  {
    q: 'What is the difference between AQUAGUARD™ and AQUAGUARD/SERIES™?',
    a: 'AQUAGUARD™ is the core hydrophobic water-separation technology — a coalescing filter that removes free and emulsified water from diesel fuel at 99.8% efficiency. AQUAGUARD/SERIES™ (FH 900FH / 1000FH) is the heavy-duty multi-stage implementation for high-flow applications: Stage 1 intercepts solid particles, Stage 2 coalesces and removes emulsified water, Stage 3 provides a final polishing barrier. Series models are sized for turbine fuel systems in large-scale power generation and mining operations where flow rates exceed standard AQUAGUARD™ capacity.',
  },
  {
    q: 'Which ELIMFILTERS® technology protects cabin air quality in mining and construction?',
    a: 'MICROKAPPA™ is engineered for operator cabin protection in high-dust industrial environments. It combines electrostatic charge (which attracts sub-micron particles, allergens, and diesel particulate matter) with activated carbon filtration (which adsorbs odours from fuel vapours and exhaust gas intrusion). This delivers HEPA-grade particle capture combined with chemical filtration, protecting operators from PM2.5/PM10 exposure in mining cabs, agricultural machinery, and heavy-duty construction vehicles.',
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
        brand: { '@type': 'Brand', name: 'ELIMFILTERS®' },
        description: GEO_DEFINITIONS[slug] || tech.description,
        url: `https://elimfilters.com/technologies/${slug}`,
        manufacturer: { '@type': 'Organization', name: 'ELIMFILTERS®', url: 'https://elimfilters.com' },
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
        name: 'ELIMFILTERS® Proprietary Filtration Technologies',
        description: '12 proprietary filtration technologies for asset protection across industrial, marine, and agricultural applications.',
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

      <Link href="/" style={{
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
        paddingTop: '5rem',
        paddingBottom: '5rem',
        backgroundImage: 'url(/images/sistems-hero.avif)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        backgroundAttachment: 'scroll',
        position: 'relative',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 100%)',
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
            12 PROPRIETARY TECHNOLOGIES
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
            12 engineered systems achieving up to 99.98% contamination interception across fuel, air, hydraulic, coolant, and cabin filtration for mining, marine, and heavy industry.
          </motion.p>
        </div>
      </section>

      {/* Asset Protection Narrative */}
      <section style={{
        padding: '4rem 2rem',
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
            ELIMFILTERS® technologies are engineered to protect industrial assets by controlling contamination at the source across air, fuel, hydraulic, lubrication, and cabin systems. Each technology is designed to solve specific contamination problems that degrade equipment performance, reduce operational reliability, and accelerate total cost of ownership. Technologies are the physical embodiment of ELIMFILTERS®&apos; industrial asset protection strategy.
          </p>
        </motion.div>
      </section>

      {/* Technologies Grid */}
      <section style={{ padding: '5rem 2rem', background: '#000' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <StaggerContainer style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
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
                        padding: '2.5rem 2rem',
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
      <section style={{ padding: '5rem 2rem', background: 'rgba(255,241,45,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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
              All 12 Technologies — Quick Reference
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter, sans-serif', maxWidth: '600px', margin: '0' }}>
              System type, primary function, key efficiency metric, and applicable industries across the complete ELIMFILTERS® technology portfolio.
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
      <section style={{ padding: '5rem 2rem', background: '#000', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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
