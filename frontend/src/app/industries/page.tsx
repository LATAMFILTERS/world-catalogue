'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { catalogue, getSlug } from '@/lib/catalogue';
import BlurFade from '@/components/ui/blur-fade';
import { DotPattern } from '@/components/ui/dot-pattern';

const INDUSTRY_IMAGE_CARDS = [
  { slug: 'agriculture', label: 'Agriculture', img: '/images/agriculture.avif', tag: 'HIGH DUST · HIGH MOISTURE' },
  { slug: 'mining', label: 'Mining', img: '/images/mineria.avif', tag: 'EXTREME ABRASIVE · SILICA' },
  { slug: 'marine', label: 'Marine', img: '/images/marine.avif', tag: 'SALT CORROSION · H₂O INTRUSION' },
  { slug: 'construction', label: 'Construction', img: '/images/construccion.avif', tag: 'DUST · HYDRAULIC STRESS' },
  { slug: 'oil-gas', label: 'Oil & Gas', img: '/images/oil&gas.avif', tag: 'CHEMICAL · H₂S · PRESSURE' },
  { slug: 'power-generation', label: 'Power Generation', img: '/images/power-generator.avif', tag: 'CONTINUOUS LOAD · HEAT' },
  { slug: 'heavy-transport', label: 'Heavy Transport', img: '/images/trucks-1.avif', tag: 'ROAD DUST · FUEL WATER' },
  { slug: 'forestry', label: 'Forestry', img: '/images/agriculture-2_converted.avif', tag: 'ORGANIC · FINE PARTICULATE' },
];

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
          {/* Spotlight glow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(280px circle at ${spot.x}% ${spot.y}%, rgba(255,241,45,0.06), transparent 70%)`,
              opacity: spot.opacity,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none',
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
            }}
          />

          {/* Index */}
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: hovered ? 'rgba(255,241,45,0.5)' : 'rgba(255,255,255,0.15)',
              letterSpacing: '0.1em',
              marginBottom: '1.75rem',
              transition: 'color 0.3s ease',
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>

          {/* Subtitle tag */}
          {industry.subtitle && (
            <p
              style={{
                fontSize: '0.65rem',
                color: '#FFF12D',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                margin: '0 0 0.6rem',
              }}
            >
              {industry.subtitle}
            </p>
          )}

          {/* Industry name */}
          <h3
            style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif',
              color: hovered ? '#fff' : 'rgba(255,255,255,0.85)',
              margin: '0 0 1.25rem',
              lineHeight: 1.2,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              transition: 'color 0.3s ease',
            }}
          >
            {industry.name}
          </h3>

          {/* Description excerpt */}
          <p
            style={{
              fontSize: '0.82rem',
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.45)',
              fontFamily: 'Outfit, sans-serif',
              margin: 0,
              flexGrow: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {industry.description}
          </p>

          {/* CTA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <motion.span
              animate={{ x: hovered ? 4 : 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
                letterSpacing: '0.12em',
                color: '#FFF12D',
                textTransform: 'uppercase',
              }}
            >
              View Asset Protection Systems →
            </motion.span>
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
    description: 'ELIMFILTERS serves 12 critical industries with engineered asset protection filtration systems engineered to ISO and SAE specification.',
    url: 'https://elimfilters.com/industries/',
    datePublished: '2026-01-15',
    dateModified: '2026-05-25',
    author: {
      '@type': 'Organization',
      name: 'ELIMFILTERS',
      url: 'https://elimfilters.com',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What industries require industrial filtration systems?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Every heavy-equipment and process industry requires filtration. Mining, agriculture, marine, oil & gas, power generation, construction, manufacturing, transportation, and waste management all depend on asset protection filtration to prevent contamination-related failures in engines, hydraulic systems, fuel circuits, and pneumatic systems.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is asset protection filtration?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Asset protection filtration is a system-level approach that targets contamination control via ISO and SAE standards, not product commodity selection. It maintains measurable cleanliness codes (ISO 4406, ISO 16889) across all fluid circuits—oil, fuel, hydraulic, coolant, and air—to extend equipment lifespan 30-50% and reduce unplanned downtime.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does mining filtration differ from standard industrial filtration?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mining environments expose equipment to dust concentrations exceeding 5,000 mg/m³—far above ISO 5011 test standards. Mining filtration systems must handle bypass-protected air intakes, fuel circuit water removal (H2O intrusion from rain and humidity), and hydraulic system contamination control for high-pressure hoist and crush systems.',
        },
      },
      {
        '@type': 'Question',
        name: 'What filtration standards does ELIMFILTERS comply with?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ELIMFILTERS systems are engineered to ISO 16889 (Beta ratio filter testing), ISO 4406 (cleanliness codes), ISO 5011 (air filter testing), SAE J1539 (air filter performance), ASTM D6304 (fuel water removal), and ISO 11155 (cabin air safety). Specific certifications vary by industry and circuit type.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does ELIMFILTERS serve offshore oil and gas platforms?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. ELIMFILTERS marine and offshore systems protect against salt-mist corrosion (ASTM B117), H2S and CO2 contamination, high-pressure fuel injection systems, and seawater-based cooling circuits. All systems are rated for ATEX/IECEx hazardous-area environments where applicable.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the typical equipment lifespan extension from system-level filtration?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'System-level filtration targeting ISO 16/14/11 cleanliness codes (vs. commodity approaches at 19/17/14) extends bearing and engine component life 3-5x. In mining equipment, this translates to 15,000-25,000 operational hours vs. 2,000-3,000 hours under poor contamination control.',
        },
      },
    ],
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
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

      <section style={{
        minHeight: '72vh',
        background: '#000',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Hero background image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/operador1_converted.avif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
          opacity: 0.18,
          zIndex: 0,
        }} />
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '6rem 2rem 4rem', position: 'relative', zIndex: 1, width: '100%' }}>
          <motion.p
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              color: '#FFF12D',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            // INDUSTRIES
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              color: 'rgba(255,255,255,0.85)',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              lineHeight: 1.1,
              marginBottom: '3rem',
            }}
          >
            Industrial Asset Protection by Industry
          </motion.h1>

          {/* Tagline — Change 2 */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
              color: '#fff',
              lineHeight: 1.25,
              marginBottom: '1.5rem',
            }}
          >
            Every industry has contamination risks.<br />
            <span style={{ color: '#FFF12D' }}>Every asset deserves protection.</span>
          </motion.h2>

          {/* Direct Answer Block — GEO Optimization */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.75)',
              fontSize: '0.95rem',
              fontFamily: 'Outfit, sans-serif',
              marginBottom: '2rem',
              maxWidth: '820px',
            }}
          >
            <p style={{ margin: '0 0 1.5rem' }}>
              From open-pit mining to offshore platforms, from harvest combines to municipal fleets — contamination is the single largest cause of unplanned equipment failure. ELIMFILTERS engineers asset protection systems calibrated to your sector's specific contamination profile and ISO cleanliness targets.
            </p>
            {/* Change 3 — new positioning paragraphs */}
            <p style={{ margin: '0 0 0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
              Industries do not buy filters.
            </p>
            <p style={{ margin: '0 0 1.25rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
              Industries protect assets.
            </p>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.65)' }}>
              Every ELIMFILTERS solution begins by identifying the assets at risk, understanding the contamination threats affecting them, and deploying the protection systems required to maintain operational continuity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Visual Image Grid */}
      <section style={{ background: '#000', padding: '3rem 0 0', position: 'relative', overflow: 'hidden' }}>
        <DotPattern
          className="opacity-20"
          cx={1}
          cy={1}
          cr={0.8}
          width={20}
          height={20}
          style={{ fill: 'rgba(255,241,45,0.25)' }}
        />
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.75rem',
          }}
          className="industry-image-grid"
          >
            {INDUSTRY_IMAGE_CARDS.map((card, i) => (
              <BlurFade key={card.slug} delay={i * 0.07} inView>
                <Link href={`/industries/${card.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div
                    style={{
                      position: 'relative',
                      height: i < 4 ? '200px' : '160px',
                      overflow: 'hidden',
                      borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                    className="industry-img-card"
                  >
                    <img
                      src={card.img}
                      alt={card.label}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.6s ease',
                        display: 'block',
                      }}
                      className="industry-img-inner"
                    />
                    {/* Dark overlay */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)',
                    }} />
                    {/* Label */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '1rem',
                    }}>
                      <p style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.52rem',
                        color: 'rgba(255,241,45,0.7)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        margin: '0 0 0.2rem',
                      }}>{card.tag}</p>
                      <p style={{
                        fontFamily: '"Space Grotesk", sans-serif',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: '#fff',
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                      }}>{card.label}</p>
                    </div>
                    {/* Hover border */}
                    <div
                      className="industry-img-border"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        border: '2px solid rgba(255,241,45,0)',
                        borderRadius: '4px',
                        transition: 'border-color 0.3s ease',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                </Link>
              </BlurFade>
            ))}
          </div>
        </div>
        <style>{`
          @media (max-width: 1024px) { .industry-image-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 600px) { .industry-image-grid { grid-template-columns: 1fr !important; } }
          .industry-img-card:hover .industry-img-inner { transform: scale(1.06); }
          .industry-img-card:hover .industry-img-border { border-color: rgba(255,241,45,0.45) !important; }
        `}</style>
      </section>

      {/* Industry Cards Grid */}
      <section style={{ background: '#000', padding: '3rem 0 5rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
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

      {/* Cost of Contamination — Changes 5 & 6 */}
      <section style={{ padding: '5rem 2rem', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-80px' }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              // The cost of contamination
            </p>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#fff', lineHeight: 1.25, marginBottom: '3rem' }}>
              Asset protection is not a maintenance cost.<br />
              <span style={{ color: '#FFF12D' }}>It is operational insurance.</span>
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {[
              {
                stat: '70%',
                desc: 'of all hydraulic and engine failures are caused by contamination — particles you cannot see with the naked eye.',
              },
              {
                stat: '3–5×',
                desc: 'asset component life extension when ISO cleanliness targets are consistently maintained.',
              },
              {
                stat: '1–5%',
                desc: 'of total asset ownership cost is filtration. The remaining 95% is determined by how well that 1–5% performs.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true, margin: '-40px' }}
                style={{ borderLeft: '3px solid #FFF12D', paddingLeft: '1.5rem' }}
              >
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#FFF12D', lineHeight: 1, marginBottom: '0.75rem' }}>
                  {item.stat}
                </p>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section — GEO High-Impact */}
      <section style={{ padding: '5rem 2rem', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-100px' }}
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              color: '#fff',
              marginBottom: '2.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            Frequently Asked Questions
          </motion.h2>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {[
              {
                q: 'What industries require industrial filtration systems?',
                a: 'Every heavy-equipment and process industry requires filtration. Mining, agriculture, marine, oil & gas, power generation, construction, manufacturing, transportation, and waste management all depend on asset protection filtration to prevent contamination-related failures in engines, hydraulic systems, fuel circuits, and pneumatic systems.',
              },
              {
                q: 'What is asset protection filtration?',
                a: 'Asset protection filtration is a system-level approach that targets contamination control via ISO and SAE standards, not product commodity selection. It maintains measurable cleanliness codes (ISO 4406, ISO 16889) across all fluid circuits—oil, fuel, hydraulic, coolant, and air—to extend equipment lifespan 30-50% and reduce unplanned downtime.',
              },
              {
                q: 'How does mining filtration differ from standard industrial filtration?',
                a: 'Mining environments expose equipment to dust concentrations exceeding 5,000 mg/m³—far above ISO 5011 test standards. Mining filtration systems must handle bypass-protected air intakes, fuel circuit water removal (H2O intrusion from rain and humidity), and hydraulic system contamination control for high-pressure hoist and crush systems.',
              },
              {
                q: 'What filtration standards does ELIMFILTERS comply with?',
                a: 'ELIMFILTERS systems are engineered to ISO 16889 (Beta ratio filter testing), ISO 4406 (cleanliness codes), ISO 5011 (air filter testing), SAE J1539 (air filter performance), ASTM D6304 (fuel water removal), and ISO 11155 (cabin air safety). Specific certifications vary by industry and circuit type.',
              },
              {
                q: 'Does ELIMFILTERS serve offshore oil and gas platforms?',
                a: 'Yes. ELIMFILTERS marine and offshore systems protect against salt-mist corrosion (ASTM B117), H2S and CO2 contamination, high-pressure fuel injection systems, and seawater-based cooling circuits. All systems are rated for ATEX/IECEx hazardous-area environments where applicable.',
              },
              {
                q: 'What is the typical equipment lifespan extension from system-level filtration?',
                a: 'System-level filtration targeting ISO 16/14/11 cleanliness codes (vs. commodity commodity approaches at 19/17/14) extends bearing and engine component life 3-5x. In mining equipment, this translates to 15,000-25,000 operational hours vs. 2,000-3,000 hours under poor contamination control.',
              },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: '-50px' }}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '4px',
                  padding: '1.5rem',
                  borderLeft: '3px solid #FFF12D',
                }}
              >
                <p
                  style={{
                    margin: '0 0 0.75rem',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: '#FFF12D',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
                  {faq.q}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.75)',
                    fontFamily: 'Outfit, sans-serif',
                  }}
                >
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
