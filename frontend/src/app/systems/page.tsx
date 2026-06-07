'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

/* ─── DATA ──────────────────────────────────────────────────────────────── */

interface ProductFamily { name: string; slug: string; }
interface Technology { name: string; slug: string; }
interface ProtectionSystem {
  id: string;
  code: string;
  name: string;
  tag: string;
  image: string;
  threat: string;
  families: ProductFamily[];
  technologies: Technology[];
  industries: string[];
}

const SYSTEMS: ProtectionSystem[] = [
  {
    id: 'air-intake',
    code: 'SYS-01',
    name: 'Air Intake\n& Airflow',
    tag: 'COMBUSTION · PNEUMATIC INTEGRITY',
    image: '/assets/mecanica-air.avif',
    threat: 'Airborne particulate contamination degrades engine volumetric efficiency and causes abrasive wear in turbocharger turbines, cylinder bores, and pneumatic control circuits — directly reducing asset service life.',
    families: [
      { name: 'Air Filters', slug: 'airfilter' },
      { name: 'Air Intake Housings', slug: 'housing' },
      { name: 'Air Dryers', slug: 'dryer' },
    ],
    technologies: [
      { name: 'MACROCORE™', slug: 'macrocore' },
      { name: 'INTEKCORE™', slug: 'intekcore' },
      { name: 'SYNTEPORE™', slug: 'syntepore' },
      { name: 'DRYCORE™', slug: 'drycore' },
    ],
    industries: ['Agriculture', 'Construction', 'Mining', 'Oil & Gas', 'Railway', 'Power Generation', 'Bus & Coach'],
  },
  {
    id: 'fuel-cleanliness',
    code: 'SYS-02',
    name: 'Fuel\nCleanliness',
    tag: 'INJECTION SYSTEM INTEGRITY',
    image: '/assets/fuelfilter-hero.avif',
    threat: 'Water and particulate contamination in fuel circuits damage HPCR injectors operating at 1,800–2,500 bar. A single contamination event causes injection failure, unplanned downtime, and premature injector replacement.',
    families: [
      { name: 'Fuel Filters', slug: 'fuel' },
      { name: 'Fuel Water Separators', slug: 'water' },
      { name: 'Turbine Fuel Filtration', slug: 'aquaguard-series' },
    ],
    technologies: [
      { name: 'HYDROCORE™', slug: 'hydrocore' },
    ],
    industries: ['Marine', 'Oil & Gas', 'Power Generation', 'Trucks & Fleets', 'Waste & Municipal', 'Agriculture'],
  },
  {
    id: 'lubrication',
    code: 'SYS-03',
    name: 'Lubrication',
    tag: 'BEARING · DRIVETRAIN INTEGRITY',
    image: '/assets/oil-hero.avif',
    threat: 'Particle contamination in engine oil causes abrasive wear on bearing journals and piston rings. Maintaining ISO 4406 16/14/11 cleanliness codes extends bearing life 3–5x compared to uncontrolled contamination levels.',
    families: [
      { name: 'Oil Filters', slug: 'oil' },
    ],
    technologies: [
      { name: 'SYNTRAX™', slug: 'syntrax' },
    ],
    industries: ['Trucks & Fleets', 'Bus & Coach', 'Automotive', 'Manufacturing', 'Railway', 'Agriculture'],
  },
  {
    id: 'hydraulic',
    code: 'SYS-04',
    name: 'Hydraulic',
    tag: 'PROPORTIONAL VALVE · ACTUATOR INTEGRITY',
    image: '/assets/hidraulic.avif',
    threat: 'Particulate above ISO 17/15/12 causes proportional valve stiction and accelerated actuator wear. In precision hydraulic circuits, contamination is the leading cause of unscheduled equipment failure.',
    families: [
      { name: 'Hydraulic Filters', slug: 'hydraulic' },
    ],
    technologies: [
      { name: 'NANOFORCE™', slug: 'nanoforce' },
    ],
    industries: ['Construction', 'Mining', 'Manufacturing', 'Agriculture', 'Marine'],
  },
  {
    id: 'cooling',
    code: 'SYS-05',
    name: 'Cooling',
    tag: 'THERMAL CIRCUIT · CABIN INTEGRITY',
    image: '/assets/coolant-hero.avif',
    threat: 'Corrosion and scale formation in cooling circuits reduce thermal transfer efficiency and cause wet sleeve liner pitting in high-load diesel engines. Cabin contamination exposes operators to PM2.5 and chemical compounds.',
    families: [
      { name: 'Coolant Filters', slug: 'coolant' },
      { name: 'Cabin Filters', slug: 'cabin' },
    ],
    technologies: [
      { name: 'THERMACORE™', slug: 'thermacore' },
      { name: 'MICROKAPPA™', slug: 'microkappa' },
    ],
    industries: ['Trucks & Fleets', 'Bus & Coach', 'Power Generation', 'Construction', 'Waste & Municipal', 'Automotive'],
  },
];

function slugifyIndustry(s: string) {
  return s.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/* ─── SYSTEM PANEL ───────────────────────────────────────────────────────── */

function SystemPanel({ sys, idx }: { sys: ProtectionSystem; idx: number }) {
  const flip = idx % 2 === 1;

  return (
    <motion.section
      id={sys.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div
        className="sys-panel-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: '40% 1fr',
          minHeight: '420px',
          direction: flip ? 'rtl' : 'ltr',
        }}
      >
        {/* IMAGE */}
        <div style={{ position: 'relative', overflow: 'hidden', direction: 'ltr', minHeight: '320px' }}>
          <img
            src={sys.image}
            alt={sys.name}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
              filter: 'brightness(0.5) contrast(1.1) saturate(0.8)',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: flip
              ? 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 70%, transparent 100%)'
              : 'linear-gradient(to left, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 70%, transparent 100%)',
          }} />
          <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem' }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: '#FFF12D',
              marginBottom: '0.6rem',
            }}>
              {sys.code}
            </div>
            <h2 style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(1.8rem,3.5vw,2.8rem)',
              color: '#fff',
              margin: 0,
              lineHeight: 1.0,
              letterSpacing: '-0.025em',
              whiteSpace: 'pre-line',
              textShadow: '0 2px 24px rgba(0,0,0,0.9)',
            }}>
              {sys.name}
            </h2>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.5rem',
              letterSpacing: '0.14em',
              color: 'rgba(255,255,255,0.4)',
              marginTop: '0.7rem',
            }}>
              {sys.tag}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{
          direction: 'ltr',
          padding: 'clamp(2rem,4vw,3rem) clamp(2rem,4vw,3rem)',
          borderLeft: flip ? 'none' : '1px solid rgba(255,255,255,0.06)',
          borderRight: flip ? '1px solid rgba(255,255,255,0.06)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
        }}>

          {/* Asset threat — the philosophical anchor */}
          <div style={{
            borderLeft: '2px solid rgba(255,241,45,0.5)',
            paddingLeft: '1rem',
          }}>
            <p style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.72)',
              margin: 0,
            }}>
              {sys.threat}
            </p>
          </div>

          {/* Product Families */}
          <div>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.58rem',
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: '0.65rem',
            }}>
              PRODUCT FAMILIES
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {sys.families.map((f) => (
                <Link key={f.slug} href={`/systems/${f.slug}`} style={{ textDecoration: 'none' }}>
                  <motion.span
                    whileHover={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      border: '1px solid rgba(255,255,255,0.15)',
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.75)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {f.name}
                    <span style={{ fontSize: '0.65rem', opacity: 0.4 }}>→</span>
                  </motion.span>
                </Link>
              ))}
            </div>
          </div>

          {/* Technologies */}
          <div>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.58rem',
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: '0.65rem',
            }}>
              PROTECTION TECHNOLOGIES
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {sys.technologies.map((tech) => (
                <Link key={tech.slug} href={`/technologies/${tech.slug}`} style={{ textDecoration: 'none' }}>
                  <motion.span
                    whileHover={{ borderColor: '#FFF12D', background: 'rgba(255,241,45,0.1)', color: '#FFF12D' }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      border: '1px solid rgba(255,241,45,0.3)',
                      background: 'rgba(255,241,45,0.05)',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#FFF12D',
                      letterSpacing: '0.05em',
                      transition: 'all 0.2s',
                    }}
                  >
                    {tech.name}
                    <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>→</span>
                  </motion.span>
                </Link>
              ))}
            </div>
          </div>

          {/* Industries */}
          <div style={{ marginTop: 'auto' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.58rem',
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: '0.5rem',
            }}>
              INDUSTRIES
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 0.75rem', alignItems: 'center' }}>
              {sys.industries.map((ind, i) => (
                <span key={ind} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link href={`/industries/${slugifyIndustry(ind)}`} style={{ textDecoration: 'none' }}>
                    <motion.span
                      whileHover={{ color: 'rgba(255,255,255,0.8)' }}
                      style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.5)',
                        transition: 'color 0.15s',
                      }}
                    >
                      {ind}
                    </motion.span>
                  </Link>
                  {i < sys.industries.length - 1 && (
                    <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: '0.5rem' }}>·</span>
                  )}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </motion.section>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────────────────── */

export default function SystemsPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section style={{
        paddingTop: 'clamp(6rem,12vw,9rem)',
        paddingBottom: 'clamp(3rem,6vw,5rem)',
        paddingLeft: 'clamp(1.5rem,5vw,4rem)',
        paddingRight: 'clamp(1.5rem,5vw,4rem)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,241,45,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,241,45,0.02) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2.5rem' }}>

            {/* Left: philosophy headline */}
            <div style={{ maxWidth: '680px' }}>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.62rem',
                  letterSpacing: '0.22em',
                  color: 'rgba(255,241,45,0.6)',
                  marginBottom: '1rem',
                }}
              >
                // ELIMFILTERS® · ASSET PROTECTION PLATFORM
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(2.4rem,5.5vw,4rem)',
                  color: '#fff',
                  lineHeight: 0.95,
                  letterSpacing: '-0.03em',
                  margin: '0 0 1.25rem',
                }}
              >
                FIVE DOMAINS<br />
                <span style={{ color: '#FFF12D' }}>OF ASSET PROTECTION</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.55)',
                  margin: 0,
                }}
              >
                Industrial equipment fails through contamination. ELIMFILTERS® controls contamination across five independent protection domains — each engineered to maintain asset integrity, extend service life, and reduce unplanned downtime.
              </motion.p>
            </div>

            {/* Right: stats */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.08)',
                flexShrink: 0,
              }}
            >
              {[
                { val: '05', label: 'PROTECTION SYSTEMS' },
                { val: '09', label: 'TECHNOLOGIES' },
                { val: '10', label: 'PRODUCT FAMILIES' },
                { val: '12', label: 'INDUSTRIES' },
              ].map((item) => (
                <div key={item.label} style={{ padding: '1.25rem 1.75rem', background: '#000', textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 'clamp(1.8rem,3vw,2.4rem)',
                    fontWeight: 900,
                    color: '#FFF12D',
                    lineHeight: 1,
                  }}>
                    {item.val}
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.46rem',
                    letterSpacing: '0.18em',
                    color: 'rgba(255,255,255,0.3)',
                    marginTop: '0.4rem',
                  }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SYSTEM NAV BAR ─────────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', overflowX: 'auto', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          paddingLeft: 'clamp(1.5rem,5vw,4rem)',
          paddingRight: 'clamp(1.5rem,5vw,4rem)',
          display: 'flex',
        }}>
          {SYSTEMS.map((sys, i) => (
            <a
              key={sys.id}
              href={`#${sys.id}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                flex: '1 0 130px',
                padding: '0.9rem 1rem',
                borderRight: i < SYSTEMS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                textDecoration: 'none', transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,241,45,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.52rem', letterSpacing: '0.15em',
                color: '#FFF12D', background: 'rgba(255,241,45,0.08)',
                padding: '0.15rem 0.45rem', flexShrink: 0,
              }}>
                {sys.code}
              </span>
              <span style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.82rem', fontWeight: 500,
                color: 'rgba(255,255,255,0.55)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {sys.name.replace('\n', ' ')}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* ── FIVE PROTECTION DOMAINS ────────────────────────────────────── */}
      {SYSTEMS.map((sys, idx) => (
        <SystemPanel key={sys.id} sys={sys} idx={idx} />
      ))}

      {/* ── CLOSING STATEMENT ──────────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)',
        borderTop: '1px solid rgba(255,241,45,0.1)',
        background: 'rgba(255,241,45,0.01)',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ maxWidth: '560px' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.58rem', letterSpacing: '0.2em',
              color: 'rgba(255,241,45,0.5)', marginBottom: '0.75rem',
            }}>
              ASSET PROTECTION · SYSTEM APPROACH
            </p>
            <p style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1.05rem', lineHeight: 1.7,
              color: 'rgba(255,255,255,0.6)', margin: 0,
            }}>
              Equipment reliability is not determined by any single filter. It is determined by how effectively the total filtration system controls contamination across all critical domains.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
            {[
              { label: 'EXPLORE INDUSTRIES', href: '/industries' },
              { label: 'PROTECTION TECHNOLOGIES', href: '/technologies' },
              { label: 'KNOWLEDGE SYSTEM', href: '/knowledge-system' },
              { label: 'CONTACT', href: '/contact', accent: true },
            ].map((lnk) => (
              <Link key={lnk.href} href={lnk.href} style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.62rem', fontWeight: 600,
                letterSpacing: '0.14em',
                color: lnk.accent ? '#FFF12D' : 'rgba(255,255,255,0.35)',
                textDecoration: 'none',
              }}>
                {lnk.label} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .sys-panel-layout {
            grid-template-columns: 1fr !important;
            direction: ltr !important;
          }
        }
      `}</style>
    </main>
  );
}
