'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

/* ─── HELPERS ────────────────────────────────────────────────────────────── */

function slugifyIndustry(s: string) {
  return s.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/* ─── PAGE ───────────────────────────────────────────────────────────────── */

export default function SystemsPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* ── BREADCRUMB ─────────────────────────────────────────────────── */}
      <div style={{ padding: '1.25rem clamp(1.5rem,5vw,3rem)' }}>
        <Link href="/" style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.72rem',
          letterSpacing: '0.16em',
          color: 'rgba(255,255,255,0.4)',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          transition: 'color 0.2s',
        }}>
          ← HOME
        </Link>
      </div>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}>
        {/* Full-bleed background — cropped to logo + SKU area */}
        <img
          src="/images/elemento-elim.avif"
          alt="ELIMFILTERS® filter element"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '78% 60%',
            filter: 'brightness(0.55) contrast(1.1) saturate(0.75)',
          }}
        />

        {/* Horizontal gradient: dark left for text legibility, reveal product right */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.88) 38%, rgba(0,0,0,0.52) 65%, rgba(0,0,0,0.18) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Bottom fade for smooth section transition */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.9) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Yellow accent — subtle top-left warmth */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 8% 20%, rgba(255,241,45,0.06) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1280px',
          margin: '0 auto',
          padding: 'clamp(4rem,8vh,7rem) clamp(1.5rem,5vw,3rem)',
          width: '100%',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ maxWidth: '660px' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.72rem',
              letterSpacing: '0.22em',
              color: '#FFF12D',
              marginBottom: '1.5rem',
            }}>
              // ASSET PROTECTION SYSTEMS
            </p>

            <h1 style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2.2rem,5vw,4.2rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              color: '#fff',
              margin: '0 0 1.75rem',
            }}>
              Five Systems. One Industrial Protection Architecture.
            </h1>

            <p style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(1rem,1.5vw,1.22rem)',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.72)',
              margin: '0 0 3rem',
            }}>
              Industrial equipment fails when contamination accumulates faster than the protection system removes it.
              ELIMFILTERS® structures contamination control into five engineering domains — each defined by its contamination
              target, failure mechanism, and the exclusive architecture that prevents it.
            </p>

            {/* Contamination Control Hierarchy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.4rem 0',
                marginBottom: '1.5rem',
              }}
            >
              {[
                'Contamination Source',
                'Entry Pathway',
                'Protection System',
                'Proprietary Architecture',
                'Asset Preserved',
              ].map((step, i, arr) => (
                <span key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.68rem',
                    letterSpacing: '0.1em',
                    color: i === arr.length - 1 ? '#FFF12D' : 'rgba(255,255,255,0.6)',
                    background: i === arr.length - 1 ? 'rgba(255,241,45,0.12)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${i === arr.length - 1 ? 'rgba(255,241,45,0.35)' : 'rgba(255,255,255,0.1)'}`,
                    padding: '0.3rem 0.7rem',
                    whiteSpace: 'nowrap' as const,
                  }}>
                    {step}
                  </span>
                  {i < arr.length - 1 && (
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', padding: '0 0.1rem' }}>→</span>
                  )}
                </span>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(1rem,1.4vw,1.18rem)',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.55)',
                margin: 0,
              }}
            >
              Asset reliability is determined by whether contamination entering each system stays below the threshold that
              causes measurable wear. Product selection is the last step in this decision — not the first. The five systems
              below are organized by contamination domain, not by product category.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── SYSTEM 01 — AIR INTAKE ──────────────────────────────────────── */}
      <motion.section
        id="air-intake"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55 }}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* System header */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            maxWidth: '1280px', margin: '0 auto',
            padding: 'clamp(2rem,4vw,3rem) clamp(1.5rem,5vw,3rem)',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: 'clamp(1.5rem,3vw,2.5rem)',
            alignItems: 'center',
          }}>
            <div style={{ textAlign: 'center' as const }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.22em', color: 'rgba(255,241,45,0.55)', margin: '0 0 0.1rem' }}>SYS</p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(2.5rem,4vw,4rem)', lineHeight: 1, color: '#FFF12D', margin: 0, letterSpacing: '-0.04em' }}>01</p>
            </div>
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem,2.5vw,2.4rem)', letterSpacing: '-0.03em', color: '#fff', margin: '0 0 0.5rem' }}>
                Air Intake &amp; Airflow Protection
              </h2>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.38)', margin: 0 }}>
                COMBUSTION &amp; PNEUMATIC SYSTEM INTEGRITY
              </p>
            </div>
            <div style={{ width: 'clamp(160px,18vw,240px)', height: 'clamp(108px,12vw,162px)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)' }}>
              <img src="/images/air-filterld.avif" alt="Air Intake Filter" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(0.88) contrast(1.06) saturate(0.85)' }} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(2.5rem,5vw,4rem) clamp(1.5rem,5vw,3rem)' }}>

          {/* Intro */}
          <div style={{
            borderLeft: '2px solid rgba(255,241,45,0.45)',
            paddingLeft: '1.25rem',
            marginBottom: '2.5rem',
            maxWidth: '820px',
          }}>
            <p style={{
              fontFamily: 'Outfit, sans-serif', fontSize: '0.97rem', lineHeight: 1.75,
              color: 'rgba(255,255,255,0.72)', margin: 0,
            }}>
              Air intake contamination is the primary cause of abrasive wear in combustion engines, gas turbines, and
              industrial compressors. Silica dust at active mining and construction sites reaches 3,000–10,000 mg/m³ —
              ten to thirty times the ISO 5011 test threshold of 300 mg/m³. Agricultural harvest operations generate
              organic particulate at 1,500 mg/m³ or more. Offshore gas turbine installations draw salt-laden air at
              1–10 mg/m³ NaCl, causing compressor blade corrosion and efficiency losses of 2–5% per 1,000 operating hours.
              Compressed air circuits serving pneumatic braking, suspension, and process control require moisture removal
              to ISO 8573-1 Class 1–2 dew point targets. Moisture above −20°C dew point at pressure causes valve icing,
              actuator seal degradation, and corrosion in safety-critical pneumatic circuits.
            </p>
          </div>

          {/* Contamination Targets */}
          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
              letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '1rem',
            }}>
              CONTAMINATION TARGETS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxWidth: '780px' }}>
              {[
                'Silica dust at 3,000–10,000 mg/m³ in mining and earthwork environments — 10 to 30× ISO 5011 test threshold',
                'Agricultural organic particulate at 1,500 mg/m³ during grain, corn, and cotton harvest operations',
                'Salt aerosol at 1–10 mg/m³ NaCl at offshore and coastal gas turbine installations',
                'Moisture and humidity accumulation in compressed air circuits for pneumatic braking and process control',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{
                    width: '3px', minWidth: '3px', alignSelf: 'stretch',
                    background: '#FFF12D', marginTop: '0.3rem',
                    display: 'inline-block', flexShrink: 0, borderRadius: '2px',
                  }} />
                  <p style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', lineHeight: 1.65,
                    color: 'rgba(255,255,255,0.68)', margin: 0,
                  }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Product Families */}
          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
              letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '1rem',
            }}>
              PRODUCT FAMILIES
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}>
              {[
                {
                  tech: 'MACROCORE™ / SYNTEPORE™',
                  name: 'Primary Intake Protection',
                  desc: 'High-capacity intake protection for diesel engines, gas turbines, and industrial compressors in particulate-laden environments. Maintains ISO 5011-compliant airflow restriction through extended service intervals at dust concentrations up to 10,000 mg/m³.',
                  href: '/systems/airfilter',
                },
                {
                  tech: 'INTEKCORE™',
                  name: 'Intake Housing & Pre-Cleaner Assembly',
                  desc: 'Integrated pre-separation housing that removes coarse particulate before the primary intake element, extending service intervals and protecting primary element sealing geometry in extreme-dust applications.',
                  href: '/systems/housing',
                },
                {
                  tech: 'DRYCORE™',
                  name: 'Compressed Air Conditioning System',
                  desc: 'Molecular sieve desiccant system achieving ISO 8573-1 Class 1–2 dew point targets for pneumatic braking, suspension, and process control circuits. Prevents valve icing, actuator corrosion, and seal degradation.',
                  href: '/systems/dryer',
                },
              ].map((pf) => (
                <motion.div
                  key={pf.href}
                  whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                    letterSpacing: '0.1em', color: '#FFF12D',
                    background: 'rgba(255,241,45,0.08)',
                    border: '1px solid rgba(255,241,45,0.2)',
                    padding: '0.2rem 0.55rem',
                    alignSelf: 'flex-start',
                  }}>{pf.tech}</span>
                  <p style={{
                    fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600,
                    fontSize: '0.95rem', color: '#fff', margin: 0,
                  }}>{pf.name}</p>
                  <p style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem',
                    lineHeight: 1.65, color: 'rgba(255,255,255,0.58)', margin: 0, flexGrow: 1,
                  }}>{pf.desc}</p>
                  <Link href={pf.href} style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem',
                    letterSpacing: '0.14em', color: '#FFF12D', textDecoration: 'none',
                    alignSelf: 'flex-start', marginTop: 'auto',
                  }}>
                    VIEW SYSTEM →
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Assets, Industries row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
          }}>
            <div>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
                letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '0.75rem',
              }}>ASSETS PROTECTED</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {[
                  'Diesel engines (mobile and stationary)',
                  'Gas turbines and centrifugal compressors',
                  'Turbochargers',
                  'Pneumatic brake and suspension systems',
                  'Process control instrumentation air circuits',
                ].map((a) => (
                  <li key={a} style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.6)', lineHeight: 1.5,
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem' }}>—</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
                letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '0.75rem',
              }}>INDUSTRIES</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.6rem', alignItems: 'center' }}>
                {['Agriculture', 'Construction', 'Mining', 'Oil & Gas', 'Railway', 'Power Generation', 'Bus & Coach'].map((ind, i, arr) => (
                  <span key={ind} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Link href={`/industries/${slugifyIndustry(ind)}`} style={{
                      fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem',
                      color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
                    }}>{ind}</Link>
                    {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.55rem' }}>●</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </motion.section>

      {/* ── SYSTEM 02 — FUEL CLEANLINESS ────────────────────────────────── */}
      <motion.section
        id="fuel-cleanliness"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55 }}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* System header */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            maxWidth: '1280px', margin: '0 auto',
            padding: 'clamp(2rem,4vw,3rem) clamp(1.5rem,5vw,3rem)',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: 'clamp(1.5rem,3vw,2.5rem)',
            alignItems: 'center',
          }}>
            <div style={{ textAlign: 'center' as const }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.22em', color: 'rgba(255,241,45,0.55)', margin: '0 0 0.1rem' }}>SYS</p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(2.5rem,4vw,4rem)', lineHeight: 1, color: '#FFF12D', margin: 0, letterSpacing: '-0.04em' }}>02</p>
            </div>
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem,2.5vw,2.4rem)', letterSpacing: '-0.03em', color: '#fff', margin: '0 0 0.5rem' }}>
                Fuel Cleanliness Protection
              </h2>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.38)', margin: 0 }}>
                INJECTION SYSTEM INTEGRITY
              </p>
            </div>
            <div style={{ width: 'clamp(160px,18vw,240px)', height: 'clamp(108px,12vw,162px)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)' }}>
              <img src="/images/fuel-filters.avif" alt="Fuel Cleanliness Filter" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(0.88) contrast(1.06) saturate(0.85)' }} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(2.5rem,5vw,4rem) clamp(1.5rem,5vw,3rem)' }}>

          <div style={{
            borderLeft: '2px solid rgba(255,241,45,0.45)',
            paddingLeft: '1.25rem',
            marginBottom: '2.5rem',
            maxWidth: '820px',
          }}>
            <p style={{
              fontFamily: 'Outfit, sans-serif', fontSize: '0.97rem', lineHeight: 1.75,
              color: 'rgba(255,255,255,0.72)', margin: 0,
            }}>
              Modern high-pressure common-rail (HPCR) injection systems operate at 1,800–2,500 bar. Injector needle
              clearances measure 1–3 µm — where particle contamination above 10 µm causes injector tip erosion and
              free water above 200 ppm causes hydrogen embrittlement and corrosion of needle alloys. Marine fuel on
              commercial vessels accumulates water through tank condensation and bunkered fuel quality variation. Diesel
              stored in offshore or standby tanks reaches ASTM D6304 exceedance within 30–60 days without active
              separation. Emergency generator fuel stored 6–18 months undergoes biological colonization, oxidative
              degradation, and gum formation that blocks delivery components and prevents startup under load conditions.
            </p>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
              letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '1rem',
            }}>
              CONTAMINATION TARGETS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxWidth: '780px' }}>
              {[
                'Free water from condensation in bulk tanks and bunkered fuel — injector corrosion above 200 ppm',
                'Emulsified water suspended in fuel — pump cavitation and microbial colonization at water-fuel interface',
                'Particulate from tank corrosion products above 10 µm — injector tip erosion at 1,800–2,500 bar injection pressure',
                'Microbial biomass and acidic metabolites from bacteria and fungi at water-fuel interface',
                'Oxidative gum and varnish deposits on injector nozzles during extended fuel storage periods',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{
                    width: '3px', minWidth: '3px', alignSelf: 'stretch',
                    background: '#FFF12D', marginTop: '0.3rem',
                    display: 'inline-block', flexShrink: 0, borderRadius: '2px',
                  }} />
                  <p style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', lineHeight: 1.65,
                    color: 'rgba(255,255,255,0.68)', margin: 0,
                  }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
              letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '1rem',
            }}>
              PRODUCT FAMILIES
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}>
              {[
                {
                  tech: 'AQUAGUARD™',
                  name: 'Fuel Cleanliness Module',
                  desc: 'Primary particulate capture for diesel fuel delivery across mobile and stationary applications. Controls contamination from storage to injection components.',
                  href: '/systems/fuel',
                },
                {
                  tech: 'AQUAGUARD™',
                  name: 'Turbine-Stage Water Separation',
                  desc: 'Three-stage turbine-coalescing-precision separation: 99.8% free water removal, 95% emulsified water reduction. For HPCR injection systems at 1,800–2,500 bar operating pressure.',
                  href: '/systems/aquaguard-series',
                },
                {
                  tech: 'AQUAGUARD™',
                  name: 'Water-Fuel Separation Module',
                  desc: 'Coalescing water separation for high water ingress rate applications including field-fueled construction equipment and marine fuel storage transfer.',
                  href: '/systems/water',
                },
                {
                  tech: 'AQUAGUARD™',
                  name: 'Marine Fuel Protection',
                  desc: 'Corrosion-resistant alloy construction for permanent salt, brine, and humidity exposure. Continuous fuel cleanliness for commercial vessels and offshore support systems.',
                  href: '/systems/water',
                },
              ].map((pf, i) => (
                <motion.div
                  key={`fuel-${i}`}
                  whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                    letterSpacing: '0.1em', color: '#FFF12D',
                    background: 'rgba(255,241,45,0.08)',
                    border: '1px solid rgba(255,241,45,0.2)',
                    padding: '0.2rem 0.55rem',
                    alignSelf: 'flex-start',
                  }}>{pf.tech}</span>
                  <p style={{
                    fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600,
                    fontSize: '0.95rem', color: '#fff', margin: 0,
                  }}>{pf.name}</p>
                  <p style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem',
                    lineHeight: 1.65, color: 'rgba(255,255,255,0.58)', margin: 0, flexGrow: 1,
                  }}>{pf.desc}</p>
                  <Link href={pf.href} style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem',
                    letterSpacing: '0.14em', color: '#FFF12D', textDecoration: 'none',
                    alignSelf: 'flex-start', marginTop: 'auto',
                  }}>
                    VIEW SYSTEM →
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
          }}>
            <div>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
                letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '0.75rem',
              }}>ASSETS PROTECTED</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {[
                  'HPCR diesel engines (1,800–2,500 bar injection)',
                  'Common-rail marine diesel engines',
                  'Gas turbines on liquid fuel',
                  'Standby and emergency diesel generators',
                  'Offshore compression and power systems',
                ].map((a) => (
                  <li key={a} style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.6)', lineHeight: 1.5,
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem' }}>—</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
                letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '0.75rem',
              }}>INDUSTRIES</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.6rem', alignItems: 'center' }}>
                {['Marine', 'Oil & Gas', 'Power Generation', 'Trucks & Fleets', 'Waste & Municipal', 'Agriculture'].map((ind, i, arr) => (
                  <span key={ind} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Link href={`/industries/${slugifyIndustry(ind)}`} style={{
                      fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem',
                      color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
                    }}>{ind}</Link>
                    {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.55rem' }}>●</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </motion.section>

      {/* ── SYSTEM 03 — LUBRICATION ──────────────────────────────────────── */}
      <motion.section
        id="lubrication"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55 }}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* System header */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            maxWidth: '1280px', margin: '0 auto',
            padding: 'clamp(2rem,4vw,3rem) clamp(1.5rem,5vw,3rem)',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: 'clamp(1.5rem,3vw,2.5rem)',
            alignItems: 'center',
          }}>
            <div style={{ textAlign: 'center' as const }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.22em', color: 'rgba(255,241,45,0.55)', margin: '0 0 0.1rem' }}>SYS</p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(2.5rem,4vw,4rem)', lineHeight: 1, color: '#FFF12D', margin: 0, letterSpacing: '-0.04em' }}>03</p>
            </div>
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem,2.5vw,2.4rem)', letterSpacing: '-0.03em', color: '#fff', margin: '0 0 0.5rem' }}>
                Lubrication Reliability Protection
              </h2>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.38)', margin: 0 }}>
                BEARING AND DRIVETRAIN INTEGRITY
              </p>
            </div>
            <div style={{ width: 'clamp(160px,18vw,240px)', height: 'clamp(108px,12vw,162px)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)' }}>
              <img src="/images/elementos-oil.avif" alt="Lubrication Filter" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(0.88) contrast(1.06) saturate(0.85)' }} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(2.5rem,5vw,4rem) clamp(1.5rem,5vw,3rem)' }}>

          <div style={{
            borderLeft: '2px solid rgba(255,241,45,0.45)',
            paddingLeft: '1.25rem',
            marginBottom: '2.5rem',
            maxWidth: '820px',
          }}>
            <p style={{
              fontFamily: 'Outfit, sans-serif', fontSize: '0.97rem', lineHeight: 1.75,
              color: 'rgba(255,255,255,0.72)', margin: 0,
            }}>
              Engine oil cleanliness measured against ISO 4406 particle count codes determines bearing, cam lobe, valve
              train, and journal service life across all diesel and gas engine applications. Maintaining ISO 4406 code
              16/14/11 or cleaner extends bearing service life three to five times compared to uncontrolled contamination
              at 19/17/14 — the difference between a 15,000-hour overhaul interval and a 3,000-hour failure event. Urban
              transit buses and refuse vehicles complete 300–600 engine starts per week, accumulating soot at three to
              five times the rate of steady-state operation. Long-haul commercial trucks run extended drain programs at
              60,000–100,000 km with oil analysis — intervals where lube protection must maintain ISO 4406 targets from
              service start to drain.
            </p>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
              letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '1rem',
            }}>
              CONTAMINATION TARGETS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxWidth: '780px' }}>
              {[
                'Combustion soot above 2% by weight — degrades oil film strength, initiates abrasive bearing wear',
                'Metal wear particles from ring, liner, and bearing contact — create secondary contamination cycles',
                'Fuel dilution from cold-start cycles — thins oil viscosity below SAE specification',
                'Acidic combustion byproducts — attack bearing alloys and reduce oil alkalinity reserve',
                'External particulate ingress through shaft seals and crankcase vents in contaminated field environments',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{
                    width: '3px', minWidth: '3px', alignSelf: 'stretch',
                    background: '#FFF12D', marginTop: '0.3rem',
                    display: 'inline-block', flexShrink: 0, borderRadius: '2px',
                  }} />
                  <p style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', lineHeight: 1.65,
                    color: 'rgba(255,255,255,0.68)', margin: 0,
                  }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
              letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '1rem',
            }}>
              PRODUCT FAMILIES
            </p>
            <div style={{ maxWidth: '480px' }}>
              <motion.div
                whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'border-color 0.2s',
                }}
              >
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                  letterSpacing: '0.1em', color: '#FFF12D',
                  background: 'rgba(255,241,45,0.08)',
                  border: '1px solid rgba(255,241,45,0.2)',
                  padding: '0.2rem 0.55rem',
                  alignSelf: 'flex-start',
                }}>SYNTRAX™</span>
                <p style={{
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600,
                  fontSize: '0.95rem', color: '#fff', margin: 0,
                }}>Engine Oil Protection</p>
                <p style={{
                  fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem',
                  lineHeight: 1.65, color: 'rgba(255,255,255,0.58)', margin: 0, flexGrow: 1,
                }}>
                  Full-flow lubrication protection maintaining ISO 4406 cleanliness codes throughout extended drain
                  intervals for diesel, gas, and dual-fuel engines in mobile and stationary applications.
                </p>
                <Link href="/systems/oil" style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem',
                  letterSpacing: '0.14em', color: '#FFF12D', textDecoration: 'none',
                  alignSelf: 'flex-start', marginTop: 'auto',
                }}>
                  VIEW SYSTEM →
                </Link>
              </motion.div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
          }}>
            <div>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
                letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '0.75rem',
              }}>ASSETS PROTECTED</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {[
                  'Diesel and dual-fuel engines (mobile and stationary)',
                  'Natural gas and bi-fuel generator engines',
                  'Marine propulsion engines',
                  'Industrial engine-driven equipment',
                  'Gearboxes and differential housings',
                ].map((a) => (
                  <li key={a} style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.6)', lineHeight: 1.5,
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem' }}>—</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
                letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '0.75rem',
              }}>INDUSTRIES</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.6rem', alignItems: 'center' }}>
                {['Trucks & Fleets', 'Bus & Coach', 'Automotive', 'Manufacturing', 'Railway', 'Agriculture'].map((ind, i, arr) => (
                  <span key={ind} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Link href={`/industries/${slugifyIndustry(ind)}`} style={{
                      fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem',
                      color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
                    }}>{ind}</Link>
                    {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.55rem' }}>●</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </motion.section>

      {/* ── SYSTEM 04 — HYDRAULIC ────────────────────────────────────────── */}
      <motion.section
        id="hydraulic"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55 }}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* System header */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            maxWidth: '1280px', margin: '0 auto',
            padding: 'clamp(2rem,4vw,3rem) clamp(1.5rem,5vw,3rem)',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: 'clamp(1.5rem,3vw,2.5rem)',
            alignItems: 'center',
          }}>
            <div style={{ textAlign: 'center' as const }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.22em', color: 'rgba(255,241,45,0.55)', margin: '0 0 0.1rem' }}>SYS</p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(2.5rem,4vw,4rem)', lineHeight: 1, color: '#FFF12D', margin: 0, letterSpacing: '-0.04em' }}>04</p>
            </div>
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem,2.5vw,2.4rem)', letterSpacing: '-0.03em', color: '#fff', margin: '0 0 0.5rem' }}>
                Hydraulic Contamination Control
              </h2>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.38)', margin: 0 }}>
                PROPORTIONAL VALVE AND ACTUATOR INTEGRITY
              </p>
            </div>
            <div style={{ width: 'clamp(160px,18vw,240px)', height: 'clamp(108px,12vw,162px)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)' }}>
              <img src="/images/nanoforce.avif" alt="Hydraulic Filter" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(0.88) contrast(1.06) saturate(0.85)' }} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(2.5rem,5vw,4rem) clamp(1.5rem,5vw,3rem)' }}>

          <div style={{
            borderLeft: '2px solid rgba(255,241,45,0.45)',
            paddingLeft: '1.25rem',
            marginBottom: '2.5rem',
            maxWidth: '820px',
          }}>
            <p style={{
              fontFamily: 'Outfit, sans-serif', fontSize: '0.97rem', lineHeight: 1.75,
              color: 'rgba(255,255,255,0.72)', margin: 0,
            }}>
              Hydraulic systems in mobile equipment, manufacturing machinery, and marine deck systems operate at
              200–450 bar. Proportional valve spool clearances measure 5–25 µm — where ISO 4406 cleanliness targets
              of 16/14/11 or tighter are required to prevent spool stiction, position drift, and pump wear. Silica
              particles entering hydraulic circuits from construction and mining environments have Mohs hardness 7,
              harder than valve alloy surfaces — each particle contact above 5 µm creates permanent micro-abrasion on
              spool faces. At ISO 19/17/14 contamination levels, proportional valve failure rates increase three to
              five times. Standard return-line protection captures contamination above 25 µm. Sub-micron hydraulic
              protection captures particles at 1–10 µm that bypass standard systems and drive the progressive valve
              wear behind 40–60% of unplanned hydraulic maintenance costs.
            </p>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
              letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '1rem',
            }}>
              CONTAMINATION TARGETS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxWidth: '780px' }}>
              {[
                'Silica particulate at Mohs hardness 7 — permanent micro-abrasion on valve spool surfaces above 5 µm',
                'Metal wear particles from pump and actuator contact — create secondary contamination cycles in closed-loop circuits',
                'Water ingress through cylinder seals and reservoir condensation — valve corrosion and fluid viscosity degradation',
                'Aeration and cavitation in high-flow circuits — generates micro-particulate and accelerates pump wear',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{
                    width: '3px', minWidth: '3px', alignSelf: 'stretch',
                    background: '#FFF12D', marginTop: '0.3rem',
                    display: 'inline-block', flexShrink: 0, borderRadius: '2px',
                  }} />
                  <p style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', lineHeight: 1.65,
                    color: 'rgba(255,255,255,0.68)', margin: 0,
                  }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
              letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '1rem',
            }}>
              PRODUCT FAMILIES
            </p>
            <div style={{ maxWidth: '480px' }}>
              <motion.div
                whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'border-color 0.2s',
                }}
              >
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                  letterSpacing: '0.1em', color: '#FFF12D',
                  background: 'rgba(255,241,45,0.08)',
                  border: '1px solid rgba(255,241,45,0.2)',
                  padding: '0.2rem 0.55rem',
                  alignSelf: 'flex-start',
                }}>NANOFORCE™</span>
                <p style={{
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600,
                  fontSize: '0.95rem', color: '#fff', margin: 0,
                }}>Hydraulic Contamination Control Unit</p>
                <p style={{
                  fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem',
                  lineHeight: 1.65, color: 'rgba(255,255,255,0.58)', margin: 0, flexGrow: 1,
                }}>
                  Sub-micron Beta-rated protection maintaining ISO 4406 16/14/11 or cleaner for proportional valve
                  and actuator integrity across high-pressure hydraulic circuits up to 450 bar.
                </p>
                <Link href="/systems/hydraulic" style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem',
                  letterSpacing: '0.14em', color: '#FFF12D', textDecoration: 'none',
                  alignSelf: 'flex-start', marginTop: 'auto',
                }}>
                  VIEW SYSTEM →
                </Link>
              </motion.div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
          }}>
            <div>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
                letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '0.75rem',
              }}>ASSETS PROTECTED</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {[
                  'Excavators, wheel loaders, and motor graders',
                  'Drilling and tunneling equipment',
                  'Industrial presses and injection molding machines',
                  'Marine crane, winch, and deck machinery',
                  'Agricultural implement and harvester hydraulics',
                ].map((a) => (
                  <li key={a} style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.6)', lineHeight: 1.5,
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem' }}>—</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
                letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '0.75rem',
              }}>INDUSTRIES</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.6rem', alignItems: 'center' }}>
                {['Construction', 'Mining', 'Manufacturing', 'Agriculture', 'Marine'].map((ind, i, arr) => (
                  <span key={ind} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Link href={`/industries/${slugifyIndustry(ind)}`} style={{
                      fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem',
                      color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
                    }}>{ind}</Link>
                    {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.55rem' }}>●</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </motion.section>

      {/* ── SYSTEM 05 — COOLING & CABIN ──────────────────────────────────── */}
      <motion.section
        id="cooling"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55 }}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* System header */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            maxWidth: '1280px', margin: '0 auto',
            padding: 'clamp(2rem,4vw,3rem) clamp(1.5rem,5vw,3rem)',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: 'clamp(1.5rem,3vw,2.5rem)',
            alignItems: 'center',
          }}>
            <div style={{ textAlign: 'center' as const }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.22em', color: 'rgba(255,241,45,0.55)', margin: '0 0 0.1rem' }}>SYS</p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(2.5rem,4vw,4rem)', lineHeight: 1, color: '#FFF12D', margin: 0, letterSpacing: '-0.04em' }}>05</p>
            </div>
            <div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 'clamp(1.5rem,2.5vw,2.4rem)', letterSpacing: '-0.03em', color: '#fff', margin: '0 0 0.5rem' }}>
                Cooling System &amp; Environmental Protection
              </h2>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.38)', margin: 0 }}>
                THERMAL CIRCUIT AND CABIN INTEGRITY
              </p>
            </div>
            <div style={{ width: 'clamp(160px,18vw,240px)', height: 'clamp(108px,12vw,162px)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)' }}>
              <img src="/images/COOLANT-FILTER.avif" alt="Cooling System Filter" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(0.88) contrast(1.06) saturate(0.85)' }} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(2.5rem,5vw,4rem) clamp(1.5rem,5vw,3rem)' }}>

          <div style={{
            borderLeft: '2px solid rgba(255,241,45,0.45)',
            paddingLeft: '1.25rem',
            marginBottom: '2.5rem',
            maxWidth: '820px',
          }}>
            <p style={{
              fontFamily: 'Outfit, sans-serif', fontSize: '0.97rem', lineHeight: 1.75,
              color: 'rgba(255,255,255,0.72)', margin: 0,
            }}>
              Engine cooling circuits in industrial diesel engines depend on coolant additive concentration to prevent
              liner cavitation erosion and passage corrosion. Supplemental coolant additives (SCAs) and DCA inhibitors
              deplete through thermal cycling, electrolytic action, and combustion contamination. When DCA concentration
              falls below specification, cavitation erosion initiates on wet sleeve liner surfaces within 500–1,000 hours
              — a failure mode undetectable until compression testing. Operator cabin environments in commercial vehicles
              and construction equipment expose occupants to PM2.5 concentrations of 30–80 µg/m³ at road level, above
              WHO 24-hour exposure guidelines. Professional drivers completing 9–11 hour daily schedules accumulate
              sustained occupational exposure to diesel exhaust particulate classified as Group 1 carcinogen by IARC —
              regulated under EU Directive 2019/130 and OSHA occupational health standards.
            </p>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
              letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '1rem',
            }}>
              CONTAMINATION TARGETS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxWidth: '780px' }}>
              {[
                'DCA depletion below SCA concentration threshold — initiates cavitation erosion on wet sleeve liner surfaces',
                'Corrosion products (aluminum oxide, iron deposits) in cooling passages — reduce heat transfer efficiency',
                'Silicate scale on heat exchanger surfaces — reduces radiator thermal efficiency 10–30% over service life',
                'PM2.5 at 30–80 µg/m³ at street level (road dust, diesel exhaust, brake wear particulate)',
                'Traffic-generated VOC and NOx accumulation in close-following highway and high-density urban conditions',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{
                    width: '3px', minWidth: '3px', alignSelf: 'stretch',
                    background: '#FFF12D', marginTop: '0.3rem',
                    display: 'inline-block', flexShrink: 0, borderRadius: '2px',
                  }} />
                  <p style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', lineHeight: 1.65,
                    color: 'rgba(255,255,255,0.68)', margin: 0,
                  }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
              letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '1rem',
            }}>
              PRODUCT FAMILIES
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
              maxWidth: '680px',
            }}>
              {[
                {
                  tech: 'COOLTECH™',
                  name: 'Cooling Circuit Protection',
                  desc: 'DCA-replenishing cooling protection that continuously restores supplemental coolant additives throughout the service interval, preventing liner cavitation erosion and corrosion scaling.',
                  href: '/systems/coolant',
                },
                {
                  tech: 'MICROKAPPA™',
                  name: 'Cabin Environmental Protection',
                  desc: 'Multi-stage particulate capture combined with activated carbon adsorption for operator cabin protection. Reduces cabin PM2.5 by up to 85% versus standard OEM cabin elements. Supports professional driver health compliance under OSHA and EU Directive 2019/130.',
                  href: '/systems/cabin',
                },
              ].map((pf) => (
                <motion.div
                  key={pf.href}
                  whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                    letterSpacing: '0.1em', color: '#FFF12D',
                    background: 'rgba(255,241,45,0.08)',
                    border: '1px solid rgba(255,241,45,0.2)',
                    padding: '0.2rem 0.55rem',
                    alignSelf: 'flex-start',
                  }}>{pf.tech}</span>
                  <p style={{
                    fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600,
                    fontSize: '0.95rem', color: '#fff', margin: 0,
                  }}>{pf.name}</p>
                  <p style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem',
                    lineHeight: 1.65, color: 'rgba(255,255,255,0.58)', margin: 0, flexGrow: 1,
                  }}>{pf.desc}</p>
                  <Link href={pf.href} style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem',
                    letterSpacing: '0.14em', color: '#FFF12D', textDecoration: 'none',
                    alignSelf: 'flex-start', marginTop: 'auto',
                  }}>
                    VIEW SYSTEM →
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
          }}>
            <div>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
                letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '0.75rem',
              }}>ASSETS PROTECTED</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {[
                  'Industrial diesel engines with wet sleeve liner construction',
                  'Commercial truck and bus cooling circuits',
                  'Generator set cooling systems',
                  'Commercial vehicle operator cabins',
                  'Construction equipment operator environments',
                  'Transit bus driver and passenger cabins',
                ].map((a) => (
                  <li key={a} style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.6)', lineHeight: 1.5,
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem' }}>—</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
                letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '0.75rem',
              }}>INDUSTRIES</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 0.6rem', alignItems: 'center' }}>
                {['Trucks & Fleets', 'Bus & Coach', 'Power Generation', 'Construction', 'Waste & Municipal', 'Automotive'].map((ind, i, arr) => (
                  <span key={ind} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Link href={`/industries/${slugifyIndustry(ind)}`} style={{
                      fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem',
                      color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
                    }}>{ind}</Link>
                    {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.55rem' }}>●</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </motion.section>

      {/* ── PROTECTION COVERAGE BY INDUSTRY ─────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55 }}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,3rem)' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
            letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '0.75rem',
          }}>
            PROTECTION COVERAGE BY INDUSTRY
          </p>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800,
            fontSize: 'clamp(1.4rem,2.5vw,2rem)', letterSpacing: '-0.025em',
            color: '#fff', margin: '0 0 2.5rem',
          }}>
            Cross-system coverage for each industrial vertical
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
          }}>
            {[
              { industry: 'Agriculture', systems: ['SYS 01', 'SYS 02', 'SYS 03'] },
              { industry: 'Automotive', systems: ['SYS 01', 'SYS 02', 'SYS 03', 'SYS 05'] },
              { industry: 'Bus & Coach', systems: ['SYS 01', 'SYS 03', 'SYS 05'] },
              { industry: 'Construction', systems: ['SYS 01', 'SYS 02', 'SYS 04', 'SYS 05'] },
              { industry: 'Manufacturing', systems: ['SYS 01', 'SYS 03', 'SYS 04'] },
              { industry: 'Marine', systems: ['SYS 02', 'SYS 03', 'SYS 04'] },
              { industry: 'Mining', systems: ['SYS 01', 'SYS 02', 'SYS 04'] },
              { industry: 'Oil & Gas', systems: ['SYS 01', 'SYS 02', 'SYS 03'] },
              { industry: 'Power Generation', systems: ['SYS 01', 'SYS 02', 'SYS 05'] },
              { industry: 'Railway', systems: ['SYS 01', 'SYS 02', 'SYS 03'] },
              { industry: 'Trucks & Fleets', systems: ['SYS 01', 'SYS 02', 'SYS 03', 'SYS 05'] },
              { industry: 'Waste & Municipal', systems: ['SYS 01', 'SYS 02', 'SYS 03', 'SYS 05'] },
            ].map((row) => (
              <Link key={row.industry} href={`/industries/${slugifyIndustry(row.industry)}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.3)', background: 'rgba(255,255,255,0.02)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.07)',
                    padding: '1.25rem',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                >
                  <p style={{
                    fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600,
                    fontSize: '0.88rem', color: '#fff', margin: '0 0 0.75rem',
                    letterSpacing: '-0.01em',
                  }}>{row.industry}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {row.systems.map((s) => (
                      <span key={s} style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem',
                        letterSpacing: '0.08em', fontWeight: 700,
                        color: '#FFF12D',
                        background: 'rgba(255,241,45,0.1)',
                        border: '1px solid rgba(255,241,45,0.22)',
                        padding: '0.15rem 0.45rem',
                      }}>{s}</span>
                    ))}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── TECHNICAL QUESTIONS (FAQ) ────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55 }}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,3rem)' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
            letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '0.75rem',
          }}>
            TECHNICAL QUESTIONS
          </p>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800,
            fontSize: 'clamp(1.4rem,2.5vw,2rem)', letterSpacing: '-0.025em',
            color: '#fff', margin: '0 0 2.5rem',
          }}>
            Engineering and system selection guidance
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '880px' }}>
            {[
              {
                q: 'What are the five asset protection systems?',
                a: 'Air Intake & Airflow Protection, Fuel Cleanliness Protection, Lubrication Reliability Protection, Hydraulic Contamination Control, and Cooling System & Environmental Protection. Each system targets a specific contamination pathway — from silica dust ingestion in air intake circuits to moisture accumulation in HPCR fuel systems — and is served by one or more exclusive protection architectures.',
              },
              {
                q: 'How does HYDROCORE™ protect HPCR injection systems?',
                a: 'HYDROCORE™ uses three-stage turbine-coalescing-precision separation to remove free water to below ASTM D6304 thresholds (99.8% removal) and emulsified water by 95%. HPCR injection operates at 1,800–2,500 bar with needle clearances of 1–3 µm — tolerances where free water above 200 ppm causes hydrogen embrittlement and corrosion of needle alloys within 200–500 operating hours.',
              },
              {
                q: 'What hydraulic cleanliness standard does NANOFORCE™ maintain?',
                a: 'NANOFORCE™ maintains ISO 4406 cleanliness codes of 16/14/11 or tighter — the threshold required to prevent proportional valve spool stiction and actuator position drift at 200–450 bar. At contamination levels above ISO 19/17/14, proportional valve failure rates increase three to five times. NANOFORCE™ captures particles at 1–10 µm that bypass standard return-line protection systems.',
              },
              {
                q: 'Why does Air Intake & Airflow include compressed air conditioning?',
                a: 'Compressed air circuits for pneumatic braking and process control are downstream of the same intake infrastructure. Moisture above −20°C dew point at pressure causes valve icing in safety-critical pneumatic systems. DRYCORE™ achieves ISO 8573-1 Class 1–2 dew point targets within the same system protection architecture that governs combustion air cleanliness.',
              },
              {
                q: 'What professional driver health compliance does MICROKAPPA™ address?',
                a: 'MICROKAPPA™ multi-stage capture reduces cabin PM2.5 by up to 85% versus standard OEM cabin elements. Professional drivers in commercial vehicles accumulate sustained occupational exposure to diesel exhaust particulate — IARC Group 1 carcinogen — regulated under EU Directive 2019/130 and OSHA standards. Fleet operators in regulated jurisdictions require documented cabin environmental protection as a compliance obligation.',
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                whileHover={{ borderColor: 'rgba(255,255,255,0.14)' }}
                style={{
                  border: '1px solid rgba(255,255,255,0.07)',
                  padding: '1.5rem 1.75rem',
                  transition: 'border-color 0.2s',
                }}
              >
                <p style={{
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600,
                  fontSize: '0.95rem', color: '#fff',
                  margin: '0 0 0.75rem', lineHeight: 1.45,
                }}>
                  {faq.q}
                </p>
                <p style={{
                  fontFamily: 'Outfit, sans-serif', fontSize: '0.88rem',
                  lineHeight: 1.7, color: 'rgba(255,255,255,0.58)', margin: 0,
                }}>
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55 }}
      >
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: 'clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,3rem)',
          textAlign: 'center' as const,
        }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem',
            letterSpacing: '0.2em', color: 'rgba(255,255,255,0.38)', marginBottom: '1rem',
          }}>
            SYSTEM SELECTION
          </p>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800,
            fontSize: 'clamp(1.5rem,3vw,2.3rem)', letterSpacing: '-0.025em',
            color: '#fff', margin: '0 0 1rem',
          }}>
            Identify the right protection system for your equipment
          </h2>
          <p style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem',
            lineHeight: 1.7, color: 'rgba(255,255,255,0.5)',
            maxWidth: '520px', margin: '0 auto 2.5rem',
          }}>
            Cross-reference 500,000+ part numbers across all five protection systems. Match your equipment platform
            and contamination environment to the correct protection architecture.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/industries" style={{ textDecoration: 'none' }}>
              <motion.span
                whileHover={{ background: '#e6d928', color: '#000' }}
                style={{
                  display: 'inline-block',
                  fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                  fontSize: '0.78rem', letterSpacing: '0.14em',
                  color: '#000', background: '#FFF12D',
                  padding: '0.9rem 2rem',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
              >
                BROWSE BY INDUSTRY
              </motion.span>
            </Link>
            <Link href="/technologies" style={{ textDecoration: 'none' }}>
              <motion.span
                whileHover={{ borderColor: '#FFF12D', color: '#FFF12D' }}
                style={{
                  display: 'inline-block',
                  fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                  fontSize: '0.78rem', letterSpacing: '0.14em',
                  color: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '0.9rem 2rem',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
              >
                VIEW TECHNOLOGIES
              </motion.span>
            </Link>
          </div>
        </div>
      </motion.section>

    </main>
  );
}
