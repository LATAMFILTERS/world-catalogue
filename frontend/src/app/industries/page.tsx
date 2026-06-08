'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { catalogue, getSlug } from '@/lib/catalogue';

const INDUSTRY_IMAGES: Record<string, string> = {
  'Agriculture':        '/images/agriculture.avif',
  'Automotive':         '/images/autos-02.avif',
  'Bus & Coach':        '/images/bus-hero.avif',
  'Construction':       '/images/construccion.avif',
  'Manufacturing':      '/images/manufacture.avif',
  'Marine':             '/images/marine.avif',
  'Mining':             '/images/mineria.avif',
  'Oil & Gas':          '/images/oil&gas.avif',
  'Power Generation':   '/images/power-generator.avif',
  'Railway':            '/images/trenes.avif',
  'Trucks & Fleets':    '/images/trucks-1.avif',
  'Waste & Municipal':  '/images/wasted.avif',
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

function IndustryCard({
  industry,
  index,
}: {
  industry: (typeof catalogue.industries)[number];
  index: number;
}) {
  const slug = getSlug(industry.name);
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 50, opacity: 0 });
  const [hovered, setHovered] = useState(false);
  const img = INDUSTRY_IMAGES[industry.name];

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setSpot({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, opacity: 1 });
  };

  return (
    <motion.div
      variants={cardVariants}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5 }}
    >
      <Link href={`/industries/${slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
        <div
          ref={ref}
          onMouseMove={onMove}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => { setSpot(s => ({ ...s, opacity: 0 })); setHovered(false); }}
          style={{
            position: 'relative',
            background: '#050505',
            border: `1px solid ${hovered ? 'rgba(255,241,45,0.35)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: '2px',
            padding: '2.25rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'border-color 0.3s ease',
          }}
        >
          {/* Industry background image */}
          {img && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: hovered ? 0.38 : 0.22,
              transition: 'opacity 0.4s ease',
              zIndex: 0,
            }} />
          )}
          {/* Dark overlay for text legibility */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.15) 100%)',
            zIndex: 1,
            pointerEvents: 'none',
          }} />

          {/* Spotlight glow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(280px circle at ${spot.x}% ${spot.y}%, rgba(255,241,45,0.08), transparent 70%)`,
              opacity: spot.opacity,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />

          {/* Animated yellow top bar */}
          <motion.div
            animate={{ scaleX: hovered ? 1 : 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '2px',
              background: '#FFF12D',
              transformOrigin: 'left',
              zIndex: 3,
            }}
          />

          {/* Content — above overlays */}
          <div style={{ position: 'relative', zIndex: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Index */}
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: hovered ? 'rgba(255,241,45,0.5)' : 'rgba(255,255,255,0.15)',
              letterSpacing: '0.1em',
              marginBottom: '1.75rem',
              transition: 'color 0.3s ease',
            }}>
              {String(index + 1).padStart(2, '0')}
            </span>

            {/* Subtitle tag */}
            {industry.subtitle && (
              <p style={{
                fontSize: '0.65rem',
                color: '#FFF12D',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase' as const,
                margin: '0 0 0.6rem',
              }}>
                {industry.subtitle}
              </p>
            )}

            {/* Industry name */}
            <h3 style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif',
              color: hovered ? '#fff' : 'rgba(255,255,255,0.85)',
              margin: '0 0 1.25rem',
              lineHeight: 1.2,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.03em',
              transition: 'color 0.3s ease',
            }}>
              {industry.name}
            </h3>

            {/* Description excerpt */}
            <p style={{
              fontSize: '0.82rem',
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'Outfit, sans-serif',
              margin: 0,
              flexGrow: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
            }}>
              {industry.description}
            </p>

            {/* CTA */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              <motion.span
                animate={{ x: hovered ? 4 : 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  fontFamily: 'Outfit, sans-serif',
                  letterSpacing: '0.12em',
                  color: '#FFF12D',
                  textTransform: 'uppercase' as const,
                }}
              >
                LEARN MORE →
              </motion.span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function IndustriesPage() {
  const industriesSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Industrial Filtration Systems by Industry',
    url: 'https://elimfilters.com/industries/',
    itemListElement: catalogue.industries.map((industry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${industry.name} Filtration Systems`,
      url: `https://elimfilters.com/industries/${getSlug(industry.name)}`,
      description: industry.description,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com/' },
      { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://elimfilters.com/industries/' },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Industrial Filtration Systems by Industry',
    description: 'ELIMFILTERS® serves 12 critical industries with engineered asset protection filtration systems engineered to ISO and SAE specification.',
    url: 'https://elimfilters.com/industries/',
    datePublished: '2026-01-15',
    dateModified: '2026-06-08',
    author: { '@type': 'Organization', name: 'ELIMFILTERS®', url: 'https://elimfilters.com' },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What industries require industrial filtration systems?', acceptedAnswer: { '@type': 'Answer', text: 'Every heavy-equipment and process industry requires filtration. Mining, agriculture, marine, oil & gas, power generation, construction, manufacturing, transportation, and waste management all depend on asset protection filtration to prevent contamination-related failures in engines, hydraulic systems, fuel circuits, and pneumatic systems.' } },
      { '@type': 'Question', name: 'What is asset protection filtration?', acceptedAnswer: { '@type': 'Answer', text: 'Asset protection filtration is a system-level approach that targets contamination control via ISO and SAE standards, not product commodity selection. It maintains measurable cleanliness codes (ISO 4406, ISO 16889) across all fluid circuits—oil, fuel, hydraulic, coolant, and air—to extend equipment lifespan 30-50% and reduce unplanned downtime.' } },
      { '@type': 'Question', name: 'How does mining filtration differ from standard industrial filtration?', acceptedAnswer: { '@type': 'Answer', text: 'Mining environments expose equipment to dust concentrations exceeding 5,000 mg/m³—far above ISO 5011 test standards. Mining filtration systems must handle bypass-protected air intakes, fuel circuit water removal, and hydraulic system contamination control for high-pressure hoist and crush systems.' } },
      { '@type': 'Question', name: 'What filtration standards does ELIMFILTERS® comply with?', acceptedAnswer: { '@type': 'Answer', text: 'ELIMFILTERS® systems are engineered to ISO 16889 (Beta ratio filter testing), ISO 4406 (cleanliness codes), ISO 5011 (air filter testing), SAE J1539 (air filter performance), ASTM D6304 (fuel water removal), and ISO 11155 (cabin air safety).' } },
      { '@type': 'Question', name: 'What is the typical equipment lifespan extension from system-level filtration?', acceptedAnswer: { '@type': 'Answer', text: 'System-level filtration targeting ISO 16/14/11 cleanliness codes extends bearing and engine component life 3-5x. In mining equipment, this translates to 15,000-25,000 operational hours vs. 2,000-3,000 hours under poor contamination control.' } },
    ],
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* ── BREADCRUMB ─────────────────────────────────────────────────── */}
      <div style={{ padding: '1.25rem clamp(1.5rem,5vw,3rem)' }}>
        <Link href="/" style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem',
          letterSpacing: '0.16em', color: 'rgba(255,255,255,0.4)',
          textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        }}>
          ← HOME
        </Link>
      </div>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '42vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <img
          src="/images/operador1_converted.avif"
          alt="Industrial operations"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 35%',
            filter: 'brightness(0.5) contrast(1.1) saturate(0.7)',
          }}
        />
        {/* Horizontal gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.88) 40%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.15) 100%)',
          pointerEvents: 'none',
        }} />
        {/* Bottom fade */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.95) 100%)',
          pointerEvents: 'none',
        }} />
        {/* Yellow accent */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 6% 20%, rgba(255,241,45,0.06) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: '1280px', margin: '0 auto',
          padding: 'clamp(2.5rem,5vh,4rem) clamp(1.5rem,5vw,3rem)',
          width: '100%',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ maxWidth: '700px', marginBottom: '2rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem',
              letterSpacing: '0.22em', color: '#FFF12D', marginBottom: '1.5rem',
            }}>
              // INDUSTRIES
            </p>
            <h1 style={{
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800,
              fontSize: 'clamp(2.2rem,5vw,4rem)', letterSpacing: '-0.03em',
              lineHeight: 1.05, color: '#fff', margin: 0,
            }}>
              12 Industries. One Protection Architecture.
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{
              fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(0.95rem,1.4vw,1.1rem)',
              lineHeight: 1.75, color: 'rgba(255,255,255,0.65)', margin: '0 0 2.5rem',
            }}
          >
            Each industrial sector operates under a distinct contamination profile. ELIMFILTERS® calibrates air, oil, fuel,
            hydraulic, and coolant protection to the specific particle loads, chemical exposures, and operational cycles of
            each environment — from sub-Saharan mine dust at 5,000 mg/m³ to offshore salt-mist corrosion at 1–10 mg/m³ NaCl.
          </motion.p>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0 2.5rem' }}
          >
            {[
              { value: '12', label: 'Industries' },
              { value: '50+', label: 'Countries' },
              { value: '5', label: 'Protection Systems' },
              { value: '500K+', label: 'Part Numbers' },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.2rem' }}>
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(1.4rem,2.5vw,2rem)', color: '#FFF12D', letterSpacing: '-0.03em' }}>{s.value}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)' }}>{s.label.toUpperCase()}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── INDUSTRY CARDS GRID ─────────────────────────────────────────── */}
      <section style={{ background: '#000', padding: '0 0 5rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem 0' }}>
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {catalogue.industries.map((industry, i) => (
              <IndustryCard key={industry.name} industry={industry} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 2rem', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '0.75rem' }}
          >
            TECHNICAL QUESTIONS
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }} viewport={{ once: true, margin: '-100px' }}
            style={{
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
              fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#fff',
              marginBottom: '2.5rem', letterSpacing: '-0.02em',
            }}
          >
            Engineering and industry selection guidance
          </motion.h2>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              { q: 'What industries require industrial filtration systems?', a: 'Every heavy-equipment and process industry requires filtration. Mining, agriculture, marine, oil & gas, power generation, construction, manufacturing, transportation, and waste management all depend on asset protection filtration to prevent contamination-related failures in engines, hydraulic systems, fuel circuits, and pneumatic systems.' },
              { q: 'What is asset protection filtration?', a: 'Asset protection filtration is a system-level approach that targets contamination control via ISO and SAE standards, not product commodity selection. It maintains measurable cleanliness codes (ISO 4406, ISO 16889) across all fluid circuits—oil, fuel, hydraulic, coolant, and air—to extend equipment lifespan 30-50% and reduce unplanned downtime.' },
              { q: 'How does mining filtration differ from standard industrial filtration?', a: 'Mining environments expose equipment to dust concentrations exceeding 5,000 mg/m³—far above ISO 5011 test standards. Mining filtration systems must handle bypass-protected air intakes, fuel circuit water removal (H₂O intrusion from rain and humidity), and hydraulic system contamination control for high-pressure hoist and crush systems.' },
              { q: 'What filtration standards does ELIMFILTERS® comply with?', a: 'ELIMFILTERS® systems are engineered to ISO 16889 (Beta ratio filter testing), ISO 4406 (cleanliness codes), ISO 5011 (air filter testing), SAE J1539 (air filter performance), ASTM D6304 (fuel water removal), and ISO 11155 (cabin air safety). Specific certifications vary by industry and circuit type.' },
              { q: 'What is the typical equipment lifespan extension from system-level filtration?', a: 'System-level filtration targeting ISO 16/14/11 cleanliness codes (vs. commodity approaches at 19/17/14) extends bearing and engine component life 3-5x. In mining equipment, this translates to 15,000-25,000 operational hours vs. 2,000-3,000 hours under poor contamination control.' },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }} viewport={{ once: true, margin: '-50px' }}
                style={{
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderLeft: '2px solid #FFF12D',
                  padding: '1.5rem 1.75rem',
                }}
              >
                <p style={{ margin: '0 0 0.65rem', fontWeight: 700, fontSize: '0.95rem', color: '#fff', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.4 }}>
                  {faq.q}
                </p>
                <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit, sans-serif' }}>
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(industriesSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </main>
  );
}
