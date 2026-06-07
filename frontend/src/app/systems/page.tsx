'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

/* ─── DATA ──────────────────────────────────────────────────────────────── */

interface ProductFamily {
  name: string;
  slug: string;
}

interface Technology {
  name: string;
  slug: string;
}

interface ProtectionSystem {
  id: string;
  code: string;
  name: string;
  tag: string;
  image: string;
  assets: string[];
  families: ProductFamily[];
  technologies: Technology[];
  industries: string[];
}

const SYSTEMS: ProtectionSystem[] = [
  {
    id: 'air-intake',
    code: 'SYS-01',
    name: 'Air Intake & Airflow',
    tag: 'COMBUSTION + PNEUMATIC INTEGRITY',
    image: '/assets/mecanica-air.avif',
    assets: [
      'Diesel and gas engines — mobile and stationary',
      'Gas turbines and centrifugal compressors',
      'Turbochargers and charge air circuits',
      'Pneumatic brake and suspension systems',
      'Process control instrumentation air circuits',
      'Industrial compressor stations',
    ],
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
    name: 'Fuel Cleanliness',
    tag: 'INJECTION SYSTEM INTEGRITY',
    image: '/assets/fuelfilter-hero.avif',
    assets: [
      'HPCR diesel engines — 1,800 to 2,500 bar injection',
      'Common-rail marine diesel engines',
      'Gas turbines on liquid fuel',
      'Standby and emergency diesel generators',
      'Offshore compression and power systems',
      'Bulk fuel storage and transfer circuits',
    ],
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
    tag: 'BEARING AND DRIVETRAIN INTEGRITY',
    image: '/assets/oil-hero.avif',
    assets: [
      'Diesel and dual-fuel engines — mobile and stationary',
      'Natural gas and bi-fuel generator engines',
      'Marine propulsion engines',
      'Industrial engine-driven equipment',
      'Gearboxes and differential housings',
      'Transmission and final drive assemblies',
    ],
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
    tag: 'PROPORTIONAL VALVE + ACTUATOR INTEGRITY',
    image: '/assets/hidraulic.avif',
    assets: [
      'Excavators, wheel loaders, and motor graders',
      'Drilling and tunneling equipment',
      'Industrial presses and injection molding machines',
      'Marine crane, winch, and deck machinery',
      'Agricultural implement and harvester hydraulics',
      'Proportional valve and servo actuator circuits',
    ],
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
    tag: 'THERMAL CIRCUIT + CABIN INTEGRITY',
    image: '/assets/coolant-hero.avif',
    assets: [
      'Industrial diesel engines — wet sleeve liner construction',
      'Commercial truck and bus cooling circuits',
      'Generator set cooling systems',
      'Commercial vehicle operator cabins',
      'Construction equipment operator environments',
      'Transit bus driver and passenger cabins',
    ],
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

/* ─── HELPERS ────────────────────────────────────────────────────────────── */

function slugifyIndustry(s: string) {
  return s
    .toLowerCase()
    .replace(/\s*&\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/* ─── SYSTEM PANEL ───────────────────────────────────────────────────────── */

function SystemPanel({ sys, idx }: { sys: ProtectionSystem; idx: number }) {
  const altBg = idx % 2 === 1;

  return (
    <motion.section
      id={sys.id}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45 }}
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: altBg ? 'rgba(255,255,255,0.014)' : 'transparent',
      }}
    >
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: 'clamp(2.5rem,5vw,4rem) clamp(1.5rem,4vw,3rem)',
      }}>

        {/* Panel header */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          marginBottom: '2rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          alignItems: 'flex-start',
        }}>
          {/* Left: system identity */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                color: '#FFF12D',
                background: 'rgba(255,241,45,0.08)',
                border: '1px solid rgba(255,241,45,0.2)',
                padding: '0.22rem 0.6rem',
                flexShrink: 0,
              }}>
                {sys.code}
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.52rem',
                letterSpacing: '0.16em',
                color: 'rgba(255,255,255,0.27)',
              }}>
                {sys.tag}
              </span>
            </div>
            <h2 style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(1.25rem,3vw,1.85rem)',
              color: '#fff',
              margin: 0,
              letterSpacing: '-0.01em',
              lineHeight: 1.1,
            }}>
              {sys.name}
            </h2>
          </div>

          {/* Right: system image */}
          <div style={{
            flexShrink: 0,
            width: 'clamp(160px, 22vw, 280px)',
            height: 'clamp(100px, 14vw, 175px)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            position: 'relative',
          }}>
            <img
              src={sys.image}
              alt={sys.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                filter: 'brightness(0.75) contrast(1.05)',
              }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.35) 0%, transparent 60%)',
            }} />
          </div>
        </div>

        {/* 3-column data grid */}
        <div
          className="sys-panel-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 0,
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {/* ASSETS PROTECTED */}
          <div style={{
            padding: '1.5rem 1.75rem',
            borderRight: '1px solid rgba(255,255,255,0.07)',
          }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.5rem',
              letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.26)',
              marginBottom: '1rem',
            }}>
              ASSETS PROTECTED
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.5rem' }}>
              {sys.assets.map((a, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.6rem',
                    color: 'rgba(255,241,45,0.35)',
                    flexShrink: 0,
                    lineHeight: 1.7,
                  }}>—</span>
                  <span style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.52)',
                    lineHeight: 1.65,
                  }}>
                    {a}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* PRODUCT FAMILIES */}
          <div style={{
            padding: '1.5rem 1.75rem',
            borderRight: '1px solid rgba(255,255,255,0.07)',
          }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.5rem',
              letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.26)',
              marginBottom: '1rem',
            }}>
              PRODUCT FAMILIES
            </p>
            <div style={{ display: 'grid', gap: '0.55rem' }}>
              {sys.families.map((f) => (
                <Link key={f.slug} href={`/products/${f.slug}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.3)', color: '#fff' }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: 'rgba(255,255,255,0.6)',
                      transition: 'border-color 0.2s, color 0.2s',
                    }}
                  >
                    <span style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                    }}>
                      {f.name}
                    </span>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.58rem',
                      color: 'rgba(255,241,45,0.45)',
                    }}>
                      →
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* TECHNOLOGY PLATFORM */}
          <div style={{ padding: '1.5rem 1.75rem' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.5rem',
              letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.26)',
              marginBottom: '1rem',
            }}>
              TECHNOLOGY PLATFORM
            </p>
            <div style={{ display: 'grid', gap: '0.55rem' }}>
              {sys.technologies.map((tech) => (
                <Link key={tech.slug} href={`/technologies/${tech.slug}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.45)', background: 'rgba(255,241,45,0.05)' }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      border: '1px solid rgba(255,241,45,0.15)',
                      background: 'rgba(255,241,45,0.025)',
                      transition: 'border-color 0.2s, background 0.2s',
                    }}
                  >
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#FFF12D',
                      letterSpacing: '0.04em',
                    }}>
                      {tech.name}
                    </span>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.58rem',
                      color: 'rgba(255,241,45,0.4)',
                    }}>
                      →
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Industries strip */}
        <div style={{
          border: '1px solid rgba(255,255,255,0.07)',
          borderTop: 'none',
          padding: '0.85rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.5rem',
            letterSpacing: '0.22em',
            color: 'rgba(255,255,255,0.22)',
            flexShrink: 0,
          }}>
            INDUSTRIES
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1.25rem' }}>
            {sys.industries.map((ind) => (
              <Link
                key={ind}
                href={`/industries/${slugifyIndustry(ind)}`}
                style={{ textDecoration: 'none' }}
              >
                <motion.span
                  whileHover={{ color: 'rgba(255,255,255,0.75)' }}
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.38)',
                    display: 'inline-block',
                    transition: 'color 0.15s',
                  }}
                >
                  {ind}
                </motion.span>
              </Link>
            ))}
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
      'Five independent asset protection systems for industrial equipment: Air Intake & Airflow, Fuel Cleanliness, Lubrication, Hydraulic, and Cooling. Nine proprietary protection technologies across ten product families.',
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
        paddingTop: 'clamp(5.5rem,12vw,9rem)',
        paddingBottom: 'clamp(2.5rem,5vw,4rem)',
        paddingLeft: 'clamp(1.5rem,4vw,3rem)',
        paddingRight: 'clamp(1.5rem,4vw,3rem)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

          {/* Top row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.22em',
                color: 'rgba(255,241,45,0.6)',
                marginBottom: '0.75rem',
              }}>
                // ELIMFILTERS® · ASSET PROTECTION PLATFORM
              </p>
              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(2.2rem,5.5vw,4rem)',
                  color: '#fff',
                  lineHeight: 1.0,
                  letterSpacing: '-0.02em',
                  marginBottom: '0.75rem',
                }}
              >
                SYSTEM<br />ARCHITECTURE
              </motion.h1>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.62rem',
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.32)',
              }}>
                FIVE INDEPENDENT PROTECTION SYSTEMS · INDUSTRIAL ASSET INTEGRITY
              </p>
            </div>

            {/* Document metadata */}
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.56rem',
              color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.1em',
              lineHeight: 2.2,
              textAlign: 'right',
            }}>
              <div>DOC: SYS-ARCH-2026.06</div>
              <div>REV: 2.0 — ACTIVE</div>
              <div>9 TECHNOLOGIES</div>
              <div>10 PRODUCT FAMILIES</div>
            </div>
          </div>

          {/* Platform stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, auto)',
            gap: 0,
            border: '1px solid rgba(255,255,255,0.08)',
            width: 'fit-content',
          }}>
            {[
              { val: '05', label: 'SYSTEMS' },
              { val: '09', label: 'TECHNOLOGIES' },
              { val: '10', label: 'PRODUCT FAMILIES' },
              { val: '12', label: 'INDUSTRIES' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '1rem 1.75rem',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 'clamp(1.6rem,3vw,2.2rem)',
                  fontWeight: 700,
                  color: '#FFF12D',
                  lineHeight: 1,
                }}>
                  {item.val}
                </div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.5rem',
                  letterSpacing: '0.2em',
                  color: 'rgba(255,255,255,0.28)',
                  marginTop: '0.35rem',
                }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HIERARCHY ──────────────────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(1.5rem,3vw,2.25rem) clamp(1.5rem,4vw,3rem)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.012)',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            flexWrap: 'wrap',
            marginBottom: '0.85rem',
          }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.55rem',
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.2)',
              marginRight: '1.5rem',
            }}>
              DECISION HIERARCHY
            </span>
            {['SYSTEM', 'PRODUCT FAMILY', 'TECHNOLOGY', 'INDUSTRY'].map((step, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.62rem',
                  fontWeight: i === 0 ? 700 : 400,
                  letterSpacing: '0.13em',
                  color: i === 0 ? '#FFF12D' : `rgba(255,255,255,${0.55 - i * 0.12})`,
                  padding: '0.28rem 0.65rem',
                  background: i === 0 ? 'rgba(255,241,45,0.08)' : 'transparent',
                  border: i === 0 ? '1px solid rgba(255,241,45,0.2)' : 'none',
                }}>
                  {step}
                </span>
                {i < 3 && (
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.68rem',
                    color: 'rgba(255,255,255,0.18)',
                    padding: '0 0.4rem',
                  }}>
                    →
                  </span>
                )}
              </span>
            ))}
          </div>
          <p style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '0.82rem',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.38)',
            maxWidth: '680px',
            margin: 0,
          }}>
            Selection begins with the system domain. Each system defines the applicable product families and technology platforms. Industry exposure determines which systems apply to a given asset.
          </p>
        </div>
      </section>

      {/* ── SYSTEM INDEX BAR ───────────────────────────────────────────── */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        overflowX: 'auto',
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
                display: 'block',
                flex: '1 0 140px',
                padding: '0.9rem 1.1rem',
                borderRight: i < SYSTEMS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,241,45,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.52rem',
                letterSpacing: '0.18em',
                color: '#FFF12D',
                marginBottom: '0.3rem',
              }}>
                {sys.code}
              </div>
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.6)',
                whiteSpace: 'nowrap',
              }}>
                {sys.name}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── FIVE SYSTEM PANELS ─────────────────────────────────────────── */}
      {SYSTEMS.map((sys, idx) => (
        <SystemPanel key={sys.id} sys={sys} idx={idx} />
      ))}

      {/* ── TECHNOLOGY CROSS-REFERENCE ─────────────────────────────────── */}
      <section style={{
        padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,4vw,3rem)',
        borderTop: '1px solid rgba(255,241,45,0.1)',
        background: 'rgba(255,241,45,0.01)',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            <div>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.52rem',
                letterSpacing: '0.22em',
                color: 'rgba(255,241,45,0.5)',
                marginBottom: '0.5rem',
              }}>
                TECHNOLOGY CROSS-REFERENCE
              </p>
              <h2 style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(1.1rem,2.5vw,1.5rem)',
                color: '#fff',
                margin: 0,
              }}>
                Nine Protection Architectures
              </h2>
            </div>
            <Link href="/technologies" style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: '#FFF12D',
              textDecoration: 'none',
            }}>
              TECHNOLOGY PLATFORM →
            </Link>
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '200px 110px 1fr',
              padding: '0.65rem 1.25rem',
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
              {['TECHNOLOGY', 'SYSTEM', 'FUNCTION'].map((h) => (
                <span key={h} style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.48rem',
                  letterSpacing: '0.22em',
                  color: 'rgba(255,255,255,0.24)',
                }}>
                  {h}
                </span>
              ))}
            </div>

            {TECH_INDEX.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ background: 'rgba(255,255,255,0.025)' }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '200px 110px 1fr',
                  padding: '0.9rem 1.25rem',
                  borderBottom: i < TECH_INDEX.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  alignItems: 'center',
                  transition: 'background 0.15s',
                }}
              >
                <Link href={`/technologies/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#FFF12D',
                    letterSpacing: '0.03em',
                  }}>
                    {t.name}
                  </span>
                </Link>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.62rem',
                  color: 'rgba(255,241,45,0.38)',
                  letterSpacing: '0.12em',
                }}>
                  {t.sys}
                </span>
                <span style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '0.82rem',
                  color: 'rgba(255,255,255,0.48)',
                  lineHeight: 1.6,
                }}>
                  {t.fn}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER NAVIGATION ──────────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(1.75rem,3.5vw,2.5rem) clamp(1.5rem,4vw,3rem)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.5rem',
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.12em',
          lineHeight: 2,
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
              fontSize: '0.62rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              color: lnk.hi ? '#FFF12D' : 'rgba(255,255,255,0.35)',
              textDecoration: 'none',
            }}>
              {lnk.label} →
            </Link>
          ))}
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .sys-panel-grid {
            grid-template-columns: 1fr !important;
          }
          .sys-panel-grid > div {
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.07);
          }
          .sys-panel-grid > div:last-child {
            border-bottom: none;
          }
        }
      `}</style>
    </main>
  );
}
