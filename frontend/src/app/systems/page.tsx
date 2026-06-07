'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

/* ─── DATA ──────────────────────────────────────────────────────────────── */

interface ProductFamily { name: string; slug: string; }
interface Technology { name: string; slug: string; }
interface ProtectionSystem {
  id: string; code: string; name: string; tag: string; image: string;
  families: ProductFamily[]; technologies: Technology[]; industries: string[];
}

const SYSTEMS: ProtectionSystem[] = [
  {
    id: 'air-intake', code: 'SYS-01', name: 'Air Intake\n& Airflow',
    tag: 'COMBUSTION + PNEUMATIC INTEGRITY',
    image: '/assets/mecanica-air.avif',
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
    id: 'fuel-cleanliness', code: 'SYS-02', name: 'Fuel\nCleanliness',
    tag: 'INJECTION SYSTEM INTEGRITY',
    image: '/assets/fuelfilter-hero.avif',
    families: [
      { name: 'Fuel Filters', slug: 'fuel' },
      { name: 'Fuel Water Separators', slug: 'water' },
      { name: 'Turbine Fuel Filtration', slug: 'aquaguard-series' },
    ],
    technologies: [{ name: 'HYDROCORE™', slug: 'hydrocore' }],
    industries: ['Marine', 'Oil & Gas', 'Power Generation', 'Trucks & Fleets', 'Waste & Municipal', 'Agriculture'],
  },
  {
    id: 'lubrication', code: 'SYS-03', name: 'Lubrication',
    tag: 'BEARING AND DRIVETRAIN INTEGRITY',
    image: '/assets/oil-hero.avif',
    families: [{ name: 'Oil Filters', slug: 'oil' }],
    technologies: [{ name: 'SYNTRAX™', slug: 'syntrax' }],
    industries: ['Trucks & Fleets', 'Bus & Coach', 'Automotive', 'Manufacturing', 'Railway', 'Agriculture'],
  },
  {
    id: 'hydraulic', code: 'SYS-04', name: 'Hydraulic',
    tag: 'PROPORTIONAL VALVE + ACTUATOR INTEGRITY',
    image: '/assets/hidraulic.avif',
    families: [{ name: 'Hydraulic Filters', slug: 'hydraulic' }],
    technologies: [{ name: 'NANOFORCE™', slug: 'nanoforce' }],
    industries: ['Construction', 'Mining', 'Manufacturing', 'Agriculture', 'Marine'],
  },
  {
    id: 'cooling', code: 'SYS-05', name: 'Cooling',
    tag: 'THERMAL CIRCUIT + CABIN INTEGRITY',
    image: '/assets/coolant-hero.avif',
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

const TECH_INDEX = [
  { name: 'MACROCORE™',  slug: 'macrocore',  sys: 'SYS-01', fn: 'High-capacity particulate capture — air intake, ISO 5011' },
  { name: 'INTEKCORE™',  slug: 'intekcore',  sys: 'SYS-01', fn: 'Integrated housing and pre-cleaner core assembly' },
  { name: 'SYNTEPORE™',  slug: 'syntepore',  sys: 'SYS-01', fn: 'All-synthetic intake media — high-humidity and coastal environments' },
  { name: 'DRYCORE™',   slug: 'drycore',   sys: 'SYS-01', fn: 'Molecular sieve desiccant — ISO 8573-1 Class 1–2 dew point' },
  { name: 'HYDROCORE™',  slug: 'hydrocore',  sys: 'SYS-02', fn: 'Turbine-stage fuel water separation — 99.8% free water removal' },
  { name: 'SYNTRAX™',   slug: 'syntrax',   sys: 'SYS-03', fn: 'Synthetic lube media — ISO 4406 16/14/11 across extended drain intervals' },
  { name: 'NANOFORCE™',  slug: 'nanoforce',  sys: 'SYS-04', fn: 'Sub-micron Beta-rated hydraulic protection — 1–10 µm particle control' },
  { name: 'THERMACORE™', slug: 'thermacore', sys: 'SYS-05', fn: 'DCA-replenishing coolant filtration — SCA restoration per interval' },
  { name: 'MICROKAPPA™', slug: 'microkappa', sys: 'SYS-05', fn: 'Multi-stage cabin PM2.5 capture with activated carbon VOC adsorption' },
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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div
        className="sys-panel-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: '42% 1fr',
          minHeight: '360px',
          direction: flip ? 'rtl' : 'ltr',
        }}
      >
        {/* ── IMAGE SIDE ── */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          direction: 'ltr',
          minHeight: '300px',
        }}>
          <img
            src={sys.image}
            alt={sys.name}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              filter: 'brightness(0.55) contrast(1.1) saturate(0.85)',
            }}
          />
          {/* Gradient overlay towards content side */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: flip
              ? 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)'
              : 'linear-gradient(to left, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
          }} />
          {/* System code + name overlaid on image */}
          <div style={{
            position: 'absolute',
            bottom: '1.75rem',
            left: '1.75rem',
            right: '1.75rem',
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.58rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: '#FFF12D',
              marginBottom: '0.55rem',
            }}>
              {sys.code}
            </div>
            <h2 style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(1.6rem,3.5vw,2.6rem)',
              color: '#fff',
              margin: 0,
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              whiteSpace: 'pre-line',
              textShadow: '0 2px 20px rgba(0,0,0,0.8)',
            }}>
              {sys.name}
            </h2>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.46rem',
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.35)',
              marginTop: '0.6rem',
            }}>
              {sys.tag}
            </div>
          </div>
        </div>

        {/* ── CONTENT SIDE ── */}
        <div style={{
          direction: 'ltr',
          padding: 'clamp(1.75rem,3.5vw,2.5rem) clamp(1.5rem,3.5vw,2.5rem)',
          borderLeft: flip ? 'none' : '1px solid rgba(255,255,255,0.06)',
          borderRight: flip ? '1px solid rgba(255,255,255,0.06)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
        }}>

          {/* Product Families */}
          <div>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.45)',
              marginBottom: '0.7rem',
            }}>
              PRODUCT FAMILIES
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {sys.families.map((f) => (
                <Link key={f.slug} href={`/systems/${f.slug}`} style={{ textDecoration: 'none' }}>
                  <motion.span
                    whileHover={{ borderColor: 'rgba(255,255,255,0.35)', color: '#fff', background: 'rgba(255,255,255,0.04)' }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.45rem 0.85rem',
                      border: '1px solid rgba(255,255,255,0.12)',
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.82)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {f.name}
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.28)' }}>→</span>
                  </motion.span>
                </Link>
              ))}
            </div>
          </div>

          {/* Technologies */}
          <div>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.45)',
              marginBottom: '0.7rem',
            }}>
              TECHNOLOGY PLATFORM
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {sys.technologies.map((tech) => (
                <Link key={tech.slug} href={`/technologies/${tech.slug}`} style={{ textDecoration: 'none' }}>
                  <motion.span
                    whileHover={{ borderColor: '#FFF12D', background: 'rgba(255,241,45,0.08)', color: '#FFF12D' }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.45rem 0.85rem',
                      border: '1px solid rgba(255,241,45,0.25)',
                      background: 'rgba(255,241,45,0.04)',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#FFF12D',
                      letterSpacing: '0.04em',
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
          <div style={{ marginTop: 'auto', paddingTop: '0.25rem' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.45)',
              marginBottom: '0.55rem',
            }}>
              INDUSTRIES
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.65rem', alignItems: 'center' }}>
              {sys.industries.map((ind, i) => (
                <span key={ind} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Link href={`/industries/${slugifyIndustry(ind)}`} style={{ textDecoration: 'none' }}>
                    <motion.span
                      whileHover={{ color: 'rgba(255,255,255,0.65)' }}
                      style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '0.82rem',
                        color: 'rgba(255,255,255,0.55)',
                        transition: 'color 0.15s',
                      }}
                    >
                      {ind}
                    </motion.span>
                  </Link>
                  {i < sys.industries.length - 1 && (
                    <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '0.6rem' }}>·</span>
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
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Industrial Asset Protection Systems — ELIMFILTERS®',
    description:
      'Five independent asset protection systems: Air Intake & Airflow, Fuel Cleanliness, Lubrication, Hydraulic, and Cooling. Nine proprietary protection technologies across ten product families.',
    url: 'https://elimfilters.com/systems',
    dateModified: '2026-06-07',
    author: { '@type': 'Organization', name: 'ELIMFILTERS®', url: 'https://elimfilters.com' },
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* ── MASTHEAD ───────────────────────────────────────────────────── */}
      <section style={{
        paddingTop: 'clamp(5rem,11vw,8rem)',
        paddingBottom: 'clamp(2.5rem,5vw,3.5rem)',
        paddingLeft: 'clamp(1.5rem,4vw,3rem)',
        paddingRight: 'clamp(1.5rem,4vw,3rem)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle background grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,241,45,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,241,45,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '2rem',
          }}>

            {/* Left: title */}
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.6rem',
                  letterSpacing: '0.24em',
                  color: 'rgba(255,241,45,0.55)',
                  marginBottom: '0.75rem',
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
                  fontSize: 'clamp(2.5rem,6vw,4.5rem)',
                  color: '#fff',
                  lineHeight: 0.92,
                  letterSpacing: '-0.03em',
                  margin: 0,
                }}
              >
                SYSTEM<br />
                <span style={{ color: '#FFF12D' }}>ARCHITECTURE</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.38)',
                  marginTop: '1rem',
                  maxWidth: '420px',
                  lineHeight: 1.6,
                }}
              >
                Five independent protection systems — each defined by its contamination target, product families, and proprietary technology platform.
              </motion.p>
            </div>

            {/* Right: counters */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {[
                { val: '05', label: 'SYSTEMS' },
                { val: '09', label: 'TECHNOLOGIES' },
                { val: '10', label: 'PRODUCT FAMILIES' },
                { val: '12', label: 'INDUSTRIES' },
              ].map((item) => (
                <div key={item.label} style={{
                  padding: '1.1rem 1.5rem',
                  background: '#000',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 'clamp(1.6rem,3vw,2.2rem)',
                    fontWeight: 900,
                    color: '#FFF12D',
                    lineHeight: 1,
                  }}>
                    {item.val}
                  </div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.44rem',
                    letterSpacing: '0.2em',
                    color: 'rgba(255,255,255,0.24)',
                    marginTop: '0.35rem',
                  }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SYSTEM INDEX BAR ───────────────────────────────────────────── */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        overflowX: 'auto',
        background: 'rgba(255,255,255,0.01)',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingLeft: 'clamp(1.5rem,4vw,3rem)',
          paddingRight: 'clamp(1.5rem,4vw,3rem)',
          display: 'flex',
        }}>
          {SYSTEMS.map((sys, i) => (
            <a
              key={sys.id}
              href={`#${sys.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                flex: '1 0 120px',
                padding: '0.85rem 1rem',
                borderRight: i < SYSTEMS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,241,45,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.5rem',
                letterSpacing: '0.15em',
                color: '#FFF12D',
                background: 'rgba(255,241,45,0.08)',
                padding: '0.15rem 0.4rem',
                flexShrink: 0,
              }}>
                {sys.code}
              </span>
              <span style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.78rem',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.5)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {sys.name.replace('\n', ' ')}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* ── FIVE SYSTEM PANELS ─────────────────────────────────────────── */}
      {SYSTEMS.map((sys, idx) => (
        <SystemPanel key={sys.id} sys={sys} idx={idx} />
      ))}

      {/* ── FOOTER NAVIGATION ──────────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(1.5rem,3vw,2rem) clamp(1.5rem,4vw,3rem)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.46rem',
          color: 'rgba(255,255,255,0.16)',
          letterSpacing: '0.12em',
          lineHeight: 2.2,
        }}>
          <div>ELIMFILTERS® · ASSET PROTECTION PLATFORM</div>
          <div>DOC: SYS-ARCH-2026.06 · REV 2.0</div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'INDUSTRIES', href: '/industries', hi: false },
            { label: 'TECHNOLOGIES', href: '/technologies', hi: false },
            { label: 'KNOWLEDGE SYSTEM', href: '/knowledge-system', hi: false },
            { label: 'CONTACT', href: '/contact', hi: true },
          ].map((lnk) => (
            <Link key={lnk.href} href={lnk.href} style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              color: lnk.hi ? '#FFF12D' : 'rgba(255,255,255,0.3)',
              textDecoration: 'none',
            }}>
              {lnk.label} →
            </Link>
          ))}
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
