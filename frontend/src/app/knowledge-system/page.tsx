'use client';

import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { useState } from 'react';
import { motion } from 'motion/react';

const SECTIONS = [
  {
    num: '01',
    title: 'Industrial Standards',
    subtitle: 'ISO · SAE · ASTM · DIN',
    description: 'ISO 16889 (Beta ratio testing), ISO 4406 (cleanliness codes), SAE J1539 (air filter performance), ASTM D6304 (water in fuel) — each standard defines measurable contamination targets for a specific fluid circuit.',
    href: '/knowledge-system/standards',
    tags: ['ISO 16889', 'ISO 4406', 'ISO 5011', 'SAE J1539'],
    img: '/images/air-filters-lab.avif',
  },
  {
    num: '02',
    title: 'Contamination & Failure',
    subtitle: 'Root cause analysis',
    description: 'Particle contamination causes 70–80% of hydraulic failures (NFPA). Understand how abrasive wear, water ingress, varnish formation, and silica ingestion degrade equipment at the component level.',
    href: '/knowledge-system/contamination',
    tags: ['Particle wear', 'Water contamination', 'Hydraulic failure'],
    img: '/images/oilfilter-mecan.avif',
  },
  {
    num: '03',
    title: 'Filtration Science',
    subtitle: 'Beta ratio · media · efficiency',
    description: 'A β₁₀ = 200 filter captures 99.5% of particles ≥10 µm (ISO 16889). Learn how multi-layer media, bypass valve thresholds, collapse pressure ratings, and dirt-holding capacity define real-world filter performance.',
    href: '/knowledge-system/science',
    tags: ['Beta ratio', 'Multi-pass test', 'ISO 16889'],
    img: '/images/media-pliegue.avif',
  },
  {
    num: '04',
    title: 'OEM vs Aftermarket',
    subtitle: 'Evaluation framework',
    description: 'Filter cost is 1–5% of total ownership cost. OEM compliance ensures warranty coverage; performance evaluation requires Beta ratio, ISO cleanliness targets, and bypass threshold — not brand or price.',
    href: '/knowledge-system/compare',
    tags: ['TCO analysis', 'Beta ratio', 'Specification matching'],
    img: '/images/dossier-filters.avif',
  },
  {
    num: '05',
    title: 'Fleet Optimisation',
    subtitle: 'Operational strategy',
    description: 'Unplanned heavy industry downtime costs ~$260,000/hr (Siemens, 2023). System-level filtration targeting contamination before failure extends service intervals 30–50% and reduces unplanned breakdowns.',
    href: '/knowledge-system/fleet',
    tags: ['Downtime reduction', 'TCO', 'Extended drain intervals'],
    img: '/images/trucks-1.avif',
  },
];

const STATS = [
  { val: '70–80%', label: 'of hydraulic failures caused by particle contamination', src: 'NFPA' },
  { val: '$260K', label: 'per hour — average unplanned downtime cost in heavy industry', src: 'Siemens 2023' },
  { val: '3–5×', label: 'bearing life extension when cleanliness targets are maintained', src: 'ISO 4406' },
  { val: 'β ≥ 200', label: '99.5% capture at 10 µm — ISO 16889 hydraulic standard', src: 'ISO 16889' },
];

function SectionCard({ section, index }: { section: typeof SECTIONS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={section.href} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: 'relative',
            height: '340px',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
        >
          {/* Background image */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${section.img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.65s cubic-bezier(0.16,1,0.3,1)',
            filter: hovered ? 'brightness(0.5)' : 'brightness(0.35)',
          }} />

          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)',
          }} />

          {/* Yellow bottom border on hover */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '2px', background: '#FFF12D',
            transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
          }} />

          {/* Content */}
          <div style={{
            position: 'absolute', inset: 0,
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.25)' }}>
                {section.num}
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.15em', color: hovered ? '#FFF12D' : 'rgba(255,241,45,0.5)', textTransform: 'uppercase', transition: 'color 0.3s' }}>
                {section.subtitle}
              </span>
            </div>

            <div>
              <h3 style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(1.15rem, 2vw, 1.4rem)',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
                color: '#fff',
                margin: '0 0 0.75rem',
              }}>
                {section.title}
              </h3>

              <div style={{
                overflow: 'hidden',
                maxHeight: hovered ? '100px' : '0',
                opacity: hovered ? 1 : 0,
                transition: 'max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease',
                marginBottom: hovered ? '1rem' : '0',
              }}>
                <p style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.78rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                  {section.description}
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                {section.tags.map(tag => (
                  <span key={tag} style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.58rem',
                    letterSpacing: '0.1em',
                    color: 'rgba(255,255,255,0.35)',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '0.2rem 0.5rem',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: hovered ? '#FFF12D' : 'rgba(255,255,255,0.3)', transition: 'color 0.3s' }}>
                  Enter section
                </span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={hovered ? '#FFF12D' : 'rgba(255,255,255,0.3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.3s, transform 0.3s', transform: hovered ? 'translateX(3px)' : 'none' }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function KnowledgeSystemPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Breadcrumb />
      <style>{`
        @media (max-width: 768px) {
          .knowledge-grid { grid-template-columns: 1fr !important; }
          .knowledge-header { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .stats-row { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ padding: '10rem 7% 5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.22em', color: 'rgba(255,241,45,0.7)', textTransform: 'uppercase', marginBottom: '1.5rem' }}
        >
          Industrial knowledge · 5 domains
        </motion.p>

        <div className="knowledge-header" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', maxWidth: '1200px', alignItems: 'end' }}>
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 300, fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.15, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.9)', margin: 0 }}
            >
              Understanding contamination<br />
              <span style={{ fontWeight: 600, color: '#FFF12D' }}>is understanding failure.</span>
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.95rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', margin: 0 }}
          >
            The ELIMFILTERS Knowledge System covers the physics of contamination, the standards that measure it, the failure mechanisms it causes, and the operational strategies that prevent it. Five domains. One objective: zero unplanned downtime caused by contamination.
          </motion.p>
        </div>
      </section>

      {/* ── STATS ROW ── */}
      <section style={{ padding: '3.5rem 7%', borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#050505' }}>
        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)', color: '#FFF12D', lineHeight: 1, marginBottom: '0.5rem' }}>
                {s.val}
              </div>
              <p style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.78rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.45)', margin: '0 0 0.4rem' }}>
                {s.label}
              </p>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
                {s.src}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── KNOWLEDGE SECTIONS GRID ── */}
      <section style={{ padding: '0' }}>
        <div
          className="knowledge-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '1px',
            background: 'rgba(255,255,255,0.06)',
          }}
        >
          {SECTIONS.map((section, i) => (
            <SectionCard key={section.href} section={section} index={i} />
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ padding: '6rem 7%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '700px' }}>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.22em', color: 'rgba(255,241,45,0.7)', textTransform: 'uppercase', marginBottom: '1.5rem' }}
          >
            Not a filter company
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 300, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', lineHeight: 1.2, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.85)', margin: '0 0 1.5rem' }}
          >
            Equipment fails when contamination is not measured, not monitored, and not controlled. Every section in this library exists to close that gap.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}
          >
            <Link href="/knowledge-system/standards" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: '#FFF12D', color: '#000',
              fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: '0.78rem',
              letterSpacing: '0.08em', padding: '0.8rem 1.75rem',
              textDecoration: 'none', textTransform: 'uppercase', borderRadius: '3px',
            }}>
              Start with Standards
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link href="/knowledge-system/contamination" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              color: 'rgba(255,255,255,0.45)',
              fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.78rem',
              letterSpacing: '0.08em', padding: '0.8rem 0',
              textDecoration: 'none', textTransform: 'uppercase',
              transition: 'color 0.25s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
            >
              Failure analysis
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
