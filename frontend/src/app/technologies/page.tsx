'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { catalogue, getSlug } from '@/lib/catalogue';
import { StaggerContainer, itemVariants } from '@/components/AnimateIn';
import {
  TECHNOLOGIES as UD_TECHNOLOGIES,
  DEPRECATED_TECHNOLOGIES as UD_DEPRECATED,
  ECOSYSTEMS as UD_ECOSYSTEMS,
  SYSTEMS as UD_SYSTEMS,
  type TechnologyKey,
} from '@/lib/unified-data';

// GEO_DEFINITIONS derived from unified-data.ts (Single Source of Truth)
// All 12 slug→description entries are sourced from geoDefinition fields and system descriptions.
const _geoDefBySlug: Record<string, string> = {
  // HYDROCORE_SERIES has a product-line description separate from the AQUAGUARD technology definition
  'aquaguard-series': UD_SYSTEMS.HYDROCORE_SERIES.description!,
  ...Object.fromEntries(Object.values(UD_TECHNOLOGIES).map((t) => [t.slug, t.geoDefinition])),
  ...Object.fromEntries(Object.values(UD_DEPRECATED).map((t) => [t.slug, t.geoDefinition])),
  ...Object.fromEntries(Object.values(UD_ECOSYSTEMS).map((t) => [t.slug, t.geoDefinition])),
};

// TECH_COMPARISON derived from unified-data.ts
// Row order preserved: 7 active (with pages) + AQUAGUARD/COOLTECH (deprecated, pages live)
// HYDROCORE and THERMOCORE are active but don't have catalogue pages yet — excluded.
const _COMPARISON_KEYS: TechnologyKey[] = [
  'MACROCORE', 'SYNTEPORE', 'INTEKCORE', 'DRYCORE',
  'HYDROCORE',
  'SYNTRAX', 'NANOFORCE',
  'THERMOCORE',
  'MICROKAPPA',
];

const _techComparison = _COMPARISON_KEYS.map((key) => {
  const t = UD_TECHNOLOGIES[key];
  return { name: t.name, slug: t.slug, system: t.domain, func: t.comparisonFunction, metric: t.comparisonMetric, industries: t.comparisonIndustries };
});

const FAQS = [
  {
    q: 'What is the difference between MACROCORE™ and SYNTEPORE™ air intake protection?',
    a: 'Both are Air Intake architectures (System 01) but target different operating environments. MACROCORE™ uses Progressive Density Gradient (PDG) media — a multi-layer cellulose-synthetic composite achieving 99.9%–99.98% efficiency (ISO 5011) at dust concentrations up to 10,000 mg/m³ in mining, agriculture, and construction. SYNTEPORE™ is all-synthetic construction for high-humidity, coastal, and marine intake environments where moisture exposure would degrade cellulose media — maintaining ISO 5011-compliant airflow restriction regardless of humidity conditions.',
  },
  {
    q: 'Which ELIMFILTERS® architecture protects HPCR diesel injection systems?',
    a: 'HYDROCORE™ is the fuel cleanliness architecture (System 02) for HPCR injection systems operating at 1,800–2,500 bar. It uses turbine-stage coalescing separation to remove free water at 99.8% efficiency and emulsified water at 95% — preventing injector needle corrosion above 200 ppm water content and pump cavitation. HPCR injector needle clearances measure 1–3 µm, making water contamination the primary failure mechanism in fuel-injection equipment.',
  },
  {
    q: 'What is SYNTRAX™ and which system does it protect?',
    a: 'SYNTRAX™ is the lubrication reliability architecture for System 03 — engine oil protection. It maintains ISO 4406 cleanliness codes (16/14/11) throughout extended drain intervals (60,000–100,000 km programs) for diesel, gas, and dual-fuel engines. SYNTRAX™ captures combustion soot above 2% by weight, metal wear particles from ring/liner/bearing contact, and fuel dilution byproducts that reduce oil viscosity below SAE specification. Maintaining ISO 4406 code 16/14/11 extends bearing service life three to five times compared to uncontrolled contamination at 19/17/14.',
  },
  {
    q: 'What ISO standards govern ELIMFILTERS® protection architectures?',
    a: 'MACROCORE™ and SYNTEPORE™ are validated against ISO 5011 (air filter performance for internal combustion engines). HYDROCORE™ water separation is verified against ASTM D6304 free water thresholds and SAE J1488 coalescer protocols. SYNTRAX™ lubrication protection targets ISO 4406 cleanliness codes — the international standard for particle contamination counting in oil systems. NANOFORCE™ hydraulic architecture is validated against ISO 16889 Beta ratio testing and targets ISO 4406 16/14/11 for proportional valve protection. DRYCORE™ achieves ISO 8573-1 Class 1–2 dew point targets for compressed air systems.',
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
        brand: { '@type': 'Brand', name: 'ELIMFILTERS®' },
        description: _geoDefBySlug[slug] || tech.description,
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
        name: 'ELIMFILTERS® Proprietary Protection Architectures',
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
        paddingTop: 'clamp(3.5rem,8vw,5rem)',
        paddingBottom: 'clamp(3rem,7vw,5rem)',
        backgroundImage: 'url(/images/sistems-hero.avif)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
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
            ELIMFILTERS® technologies are engineered to protect industrial assets by controlling contamination at the source across air, fuel, hydraulic, lubrication, and cabin systems. Each technology is designed to solve specific contamination problems that degrade equipment performance, reduce operational reliability, and accelerate total cost of ownership. Technologies are the physical embodiment of ELIMFILTERS®&apos; industrial asset protection strategy.
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
              const geoDef = _geoDefBySlug[slug];
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
              System assignment, primary contamination target, key engineering metric, and applicable industries across the nine proprietary ELIMFILTERS® protection architectures.
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
                {_techComparison.map((row, i) => (
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
