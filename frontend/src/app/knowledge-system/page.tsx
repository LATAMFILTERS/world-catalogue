'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const SECTIONS = [
  {
    slug: 'standards',
    href: '/knowledge-system/standards',
    title: 'Standards',
    subtitle: 'ISO · SAE · DIN · NFPA',
    icon: '⬡',
    description: 'International filtration standards, certifications, and compliance frameworks.',
  },
  {
    slug: 'contamination',
    href: '/knowledge-system/contamination',
    title: 'Contamination & Failure Modes',
    subtitle: 'Diagnosis · Prevention · Analysis',
    icon: '◈',
    description: 'Particle ingression, fluid degradation, and common filtration failure patterns.',
  },
  {
    slug: 'science',
    href: '/knowledge-system/science',
    title: 'Filtration Science',
    subtitle: 'Physics · Media · Efficiency',
    icon: '◉',
    description: 'Filtration mechanisms, media technology, beta ratios, and efficiency testing.',
  },
  {
    slug: 'compare',
    href: '/knowledge-system/compare',
    title: 'OEM vs Aftermarket Logic',
    subtitle: 'Comparison · Value · Performance',
    icon: '⬡',
    description: 'Engineering criteria for evaluating OEM specifications against aftermarket solutions.',
  },
  {
    slug: 'fleet',
    href: '/knowledge-system/fleet',
    title: 'Fleet Optimization',
    subtitle: 'Intervals · Scheduling · Cost',
    icon: '◈',
    description: 'Maintenance interval engineering, lifecycle cost analysis, and fleet-wide protection strategies.',
  },
];

export default function KnowledgeSystemPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Back to Home */}
      <Link href="/" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← HOME</Link>

      {/* Hero */}
      <section style={{
        paddingTop: '9rem',
        paddingBottom: '5rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.05) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.72rem',
            letterSpacing: '0.18em',
            color: '#FFF12D',
            marginBottom: '1.25rem',
            opacity: 0.85,
          }}>
            // ELIMFILTERS KNOWLEDGE SYSTEM
          </p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2.2rem, 6vw, 4rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: '1.25rem',
          }}>
            ENGINEERING<br />
            <span style={{ color: '#FFF12D' }}>KNOWLEDGE BASE</span>
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '520px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}>
            Technical documentation, filtration science, and asset protection methodology.
          </p>
        </motion.div>
      </section>

      {/* Cards Grid */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '5rem 2rem',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}>
          {SECTIONS.map((section, i) => (
            <motion.div
              key={section.slug}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link href={section.href} style={{ textDecoration: 'none', display: 'block' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.4)', y: -4 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '2rem',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Coming soon badge */}
                  <span style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.6rem',
                    letterSpacing: '0.15em',
                    color: 'rgba(255,241,45,0.5)',
                    border: '1px solid rgba(255,241,45,0.2)',
                    padding: '0.2rem 0.5rem',
                  }}>
                    SOON
                  </span>

                  {/* Icon */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '1px solid rgba(255,241,45,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF12D',
                    fontSize: '1.25rem',
                    flexShrink: 0,
                  }}>
                    {section.icon}
                  </div>

                  {/* Title block */}
                  <div>
                    <p style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.65rem',
                      letterSpacing: '0.15em',
                      color: 'rgba(255,255,255,0.35)',
                      marginBottom: '0.4rem',
                    }}>
                      {section.subtitle}
                    </p>
                    <h2 style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '1.15rem',
                      fontWeight: 600,
                      color: '#fff',
                      letterSpacing: '-0.01em',
                      lineHeight: 1.25,
                    }}>
                      {section.title}
                    </h2>
                  </div>

                  {/* Description */}
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.875rem',
                    color: 'rgba(255,255,255,0.45)',
                    lineHeight: 1.6,
                    marginTop: 'auto',
                  }}>
                    {section.description}
                  </p>

                  {/* Arrow */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.7rem',
                    color: 'rgba(255,241,45,0.5)',
                    letterSpacing: '0.08em',
                    marginTop: '0.5rem',
                  }}>
                    EXPLORE →
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          section { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
        }
      `}</style>
    </main>
  );
}
