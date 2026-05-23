'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const STANDARDS = [
  { code: 'ISO 16889', href: '/knowledge-system/standards/iso-16889', desc: '4-digit cleanliness code (17/15/12) for hydraulic and industrial fluids, primary classification system for modern equipment.' },
  { code: 'ISO 4406', href: '/knowledge-system/standards/iso-4406', desc: 'Legacy 2-3 digit code (19/17) providing historical continuity with automotive and pre-2000 industrial equipment.' },
  { code: 'SAE J1211', desc: 'Engine oil filtration performance standard defining bypass valve pressure limits (typically 3-5 bar) and element collapse thresholds.' },
  { code: 'ASTM D7085', desc: 'Particle counting methodology for in-service oil analysis providing quantitative wear debris classification and trending.' },
];

const TECHNOLOGIES = [
  { name: 'DURATECH', slug: 'duratech', role: 'Dual-stage engine oil filtration maintaining ISO 16/14/11 target cleanliness through extended 500-hour service intervals.' },
  { name: 'NANOFORCE', slug: 'nanoforce', role: 'Synthetic media achieving 99.9% efficiency at 3-5 microns for oil systems requiring extended intervals and superior wear particle capture.' },
];

const CONTAMINATION_IMPACTS = [
  { metric: '+15-40%', label: 'Oil consumption increase from wear particle acceleration' },
  { metric: '+5-10%', label: 'Engine blowby gas increase from ring blowdown elevation' },
  { metric: '-5-12%', label: 'Fuel economy degradation from friction loss increase' },
  { metric: '-10-25%', label: 'Compression pressure drop from ring sticking' },
];

const FAQS = [
  {
    q: 'Why is ISO 16889 preferred over the legacy ISO 4406 code for new equipment specification?',
    a: 'ISO 16889 uses a 4-digit code (17/15/12) measuring particle concentrations at three size thresholds: 4 microns, 6 microns, and 14 microns. This precision allows engineers to target specific contamination sizes that cause damage to different component types. ISO 4406\'s 2-3 digit code (19/17) measured only at two thresholds and has lower precision. Modern equipment with tight clearances (proportional valves, swashplate pumps) requires the precision that ISO 16889 provides for accurate protection specification.',
  },
  {
    q: 'What is the practical meaning of an ISO 16889 code like 17/15/12?',
    a: 'The code represents particle counts per milliliter: 17 means 2^17 = 131,072 particles larger than 4 microns per mL. 15 means 2^15 = 32,768 particles larger than 6 microns per mL. 12 means 2^12 = 4,096 particles larger than 14 microns per mL. For a 10-liter oil sump, this represents approximately 1.3 billion 4-micron particles total. Each code step represents a 2x change in particle concentration, so upgrading from 18/16/13 to 16/14/11 represents an 8x reduction at the 4-micron level.',
  },
  {
    q: 'How often should oil cleanliness be monitored if drain intervals extend beyond 500 hours?',
    a: 'Drain interval extension beyond OEM specification requires oil analysis sampling at 250-hour intervals minimum. ASTM D7085 particle counting plus elemental spectroscopy (Fe, Al, Cr, Cu) provides contamination trending data that justifies interval extension or triggers early intervention if contamination acceleration is detected. Without monitoring data, extending drain intervals without filtration system upgrades increases wear particle accumulation risk exponentially.',
  },
  {
    q: 'What filter bypass pressure is appropriate for different equipment classes?',
    a: 'Engine oil filter bypass valves typically operate at 3-5 bar differential pressure (SAE J1211). Light-duty automotive engines use 3-4 bar. Heavy-duty diesel engines use 4-5 bar. Bypass occurs when element restriction exceeds these pressures due to contamination loading. Operating with an active bypass for extended periods delivers unfiltered oil directly to bearings and increases wear rates 5 to 10 times faster than filtered circulation. A restriction indicator light activation should trigger immediate element service before bypass pressure is reached.',
  },
];

const RELATED_SYSTEMS = [
  { code: 'AIR', title: 'Air Intake Systems', href: '/knowledge-system/standards/air-intake-systems' },
  { code: 'FUEL', title: 'Fuel Systems', href: '/knowledge-system/standards/fuel-systems' },
  { code: 'HYD', title: 'Hydraulic Systems', href: '/knowledge-system/standards/hydraulic-systems' },
];

export default function LubeOilSystemsPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Navigation */}
      <Link href="/knowledge-system/standards" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← STANDARDS</Link>

      {/* Hero */}
      <section style={{
        paddingTop: '8rem',
        paddingBottom: '4rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.04) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '720px', margin: '0 auto', padding: '0 2rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
            letterSpacing: '0.18em', color: '#FFF12D', marginBottom: '1rem', opacity: 0.85,
          }}>
            // INDUSTRIAL STANDARDS · LUBE OIL SYSTEMS
          </p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: '1.5rem',
          }}>
            Lube / Oil Filtration Systems
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)', maxWidth: '540px', margin: '0 auto', lineHeight: 1.7,
          }}>
            Engine oil and crankcase filtration protecting combustion engines from wear particle accumulation, addressing the most damaging contamination vector in mobile and stationary industrial equipment.
          </p>
        </motion.div>
      </section>

      {/* Body */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        {/* 1. System Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>01 / SYSTEM OVERVIEW</p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Engine Oil Filtration Domain</h2>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '1rem',
          }}>
            <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>Engine oil filtration systems protect internal combustion engines from wear particle accumulation</Link> by controlling contamination within measurable ISO cleanliness targets. During combustion, abrasive particles from air intake, fuel injection, and internal wear processes enter the crankcase and circulate through engine oil. Bearing surfaces operating at pressures of 40 to 100 bar with clearances of 25 to 75 microns cannot tolerate particle contamination above critical thresholds without accelerated wear.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8,
          }}>
            A typical engine oil filter operates under 3 to 5 bar differential pressure, processing 40 to 100 liters per minute depending on engine displacement and speed. Over a 500-hour service interval, the filter element accumulates kilograms of contaminant mass while maintaining target ISO cleanliness codes that directly determine bearing life and oil oxidation rate.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 2. Contamination Challenges */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>02 / CONTAMINATION CHALLENGES</p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Wear Particle Accumulation Pathways</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              {
                title: 'Air Intake Ingestion',
                desc: 'Combustion air containing silica dust and soil particles at 100+ mg/m³ enters the crankcase through cylinder blow-by when piston rings wear. Even high-efficiency air filters (99.9%) allow particle penetration during peak load transients.',
              },
              {
                title: 'Internal Combustion Byproducts',
                desc: 'Soot and unburned fuel fragments from incomplete combustion enter the oil directly. Modern diesel engines with EGR systems and biodiesel blends generate higher soot loading than petroleum diesel equivalents.',
              },
              {
                title: 'Bearing and Ring Wear Debris',
                desc: 'Early-stage abrasion from micro-contact between bearing surfaces and journals generates ferrous and non-ferrous wear particles. This initial wear increases surface roughness, which accelerates subsequent wear rates exponentially. See the detailed analysis of how particle contamination causes bearing failure.',
              },
              {
                title: 'Water and Acid Accumulation',
                desc: 'Combustion produces water vapor that condenses in the oil during cold-start periods. Water content above 500 ppm triggers oxidation acceleration and corrosive acid formation, reducing oil service life independent of particle contamination.',
              },
            ].map((item) => (
              <div key={item.title} style={{
                borderLeft: '2px solid rgba(255,241,45,0.2)',
                paddingLeft: '1.25rem',
              }}>
                <p style={{
                  fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem',
                  fontWeight: 600, color: '#fff', marginBottom: '0.5rem',
                }}>{item.title}</p>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.55)', lineHeight: 1.7,
                }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 3. Associated Standards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>03 / ASSOCIATED STANDARDS</p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Applicable Specifications</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {STANDARDS.map((std) => (
              <div key={std.code} style={{
                display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1.25rem',
                padding: '1rem 1.25rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                alignItems: 'start',
              }}>
                {std.href ? (
                  <Link href={std.href} style={{ textDecoration: 'none' }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem',
                      fontWeight: 600, color: '#FFF12D', textDecoration: 'underline',
                    }}>{std.code}</span>
                  </Link>
                ) : (
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem',
                    fontWeight: 600, color: '#FFF12D',
                  }}>{std.code}</span>
                )}
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.5)', lineHeight: 1.55,
                }}>{std.desc}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 4. Operational Impact */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>04 / OPERATIONAL IMPACT & COST</p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Contamination-Driven Degradation Metrics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            {CONTAMINATION_IMPACTS.map((impact) => (
              <div key={impact.metric} style={{
                background: 'rgba(255,241,45,0.03)',
                border: '1px solid rgba(255,241,45,0.12)',
                padding: '1.25rem',
              }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4rem',
                  fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem',
                }}>{impact.metric}</div>
                <div style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.5)', lineHeight: 1.5,
                }}>{impact.label}</div>
              </div>
            ))}
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.65)', lineHeight: 1.8,
          }}>
            Operating above ISO 18/16/13 oil cleanliness threshold for extended periods accelerates these degradation modes. An engine operating at ISO 19/17/14 (one code step higher) experiences roughly 2x the particle concentration at each size class, driving wear rates forward by 3 to 5 years in service life compression. These cumulative effects directly drive unplanned downtime — see <Link href="/knowledge-system/fleet/reducing-downtime" style={{ color: '#FFF12D', textDecoration: 'underline' }}>fleet downtime reduction strategies</Link> for operational response frameworks.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 5. Related Contamination */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>05 / RELATED CONTAMINATION MODES</p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Primary & Secondary Failure Mechanisms</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              {
                mode: 'Particle Wear in Engines',
                path: '/knowledge-system/contamination/particle-wear',
                desc: 'Three-body abrasive wear from particle circulation is the dominant failure mode in oil filtration. Read the detailed analysis of two-body, three-body, and adhesive wear mechanisms.',
              },
            ].map((item) => (
              <Link key={item.mode} href={item.path} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1.25rem',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                  }}
                >
                  <p style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem',
                    fontWeight: 600, color: '#fff', margin: 0,
                  }}>{item.mode}</p>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0,
                  }}>{item.desc}</p>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                    color: 'rgba(255,241,45,0.4)', marginTop: '0.25rem',
                  }}>VIEW ANALYSIS →</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 6. Related Technologies */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>06 / ELIMFILTERS TECHNOLOGIES</p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Applicable Filtration Systems</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {TECHNOLOGIES.map((tech) => (
              <Link key={tech.slug} href={`/technologies/${tech.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1.25rem',
                    height: '100%',
                  }}
                >
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem',
                    fontWeight: 600, color: '#FFF12D', marginBottom: '0.6rem',
                  }}>{tech.name}</p>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.5)', lineHeight: 1.6,
                  }}>{tech.role}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 7. System Design Considerations */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>07 / SYSTEM DESIGN CONSIDERATIONS</p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em',
          }}>Engineering Factors</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { title: 'Filter Element Capacity', body: 'Element dirt-holding capacity must match contamination loading over the planned service interval. Higher efficiency elements (lower beta ratio) reduce capacity but maintain lower ISO cleanliness codes.' },
              { title: 'Bypass Valve Pressure', body: 'Bypass valve opening pressure (typically 3-5 bar) must exceed peak crankcase pressure under cold-start conditions while preventing unfiltered oil circulation during normal operation.' },
              { title: 'Service Interval Extension', body: 'Extending drain intervals beyond OEM specification requires filter efficiency upgrades and oil analysis monitoring. Without upgrades, interval extension increases contamination accumulation exponentially.' },
              { title: 'Restriction Monitoring', body: 'Visual or electrical restriction indicators alert operators before filter bypass occurs. Service should occur at first alarm signal, not at subsequent warnings.' },
            ].map((item) => (
              <div key={item.title} style={{
                borderLeft: '2px solid rgba(255,241,45,0.2)',
                paddingLeft: '1.25rem',
              }}>
                <p style={{
                  fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem',
                  fontWeight: 600, color: '#fff', marginBottom: '0.5rem',
                }}>{item.title}</p>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.55)', lineHeight: 1.7,
                }}>{item.body}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 8. FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem',
          }}>08 / FREQUENTLY ASKED QUESTIONS</p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600,
            color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.01em',
          }}>Technical Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '1.5rem',
              }}>
                <p style={{
                  fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem',
                  fontWeight: 600, color: '#fff', marginBottom: '0.85rem', lineHeight: 1.5,
                }}>{faq.q}</p>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.55)', lineHeight: 1.75,
                }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Related Systems */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
            letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.25rem',
          }}>// EXPLORE OTHER FILTRATION SYSTEMS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {RELATED_SYSTEMS.map((sys) => (
              <Link key={sys.code} href={sys.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.35)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1.25rem 1.5rem',
                    display: 'flex', flexDirection: 'column', gap: '0.4rem',
                  }}
                >
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                    color: '#FFF12D', opacity: 0.6, letterSpacing: '0.1em',
                  }}>{sys.code}</span>
                  <span style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem',
                    fontWeight: 600, color: '#fff',
                  }}>{sys.title}</span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                    color: 'rgba(255,241,45,0.4)', marginTop: '0.25rem',
                  }}>EXPLORE →</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Retrieval Summary Block — machine-readable knowledge index */}
      <section style={{
        background: 'rgba(255,241,45,0.02)',
        border: '1px solid rgba(255,241,45,0.12)',
        borderRadius: '4px',
        padding: '2rem',
        margin: '2rem auto',
        maxWidth: '860px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.7rem',
        lineHeight: 1.8,
        color: 'rgba(255,255,255,0.35)',
      }}>
        <p style={{ color: 'rgba(255,241,45,0.6)', marginBottom: '1rem', fontSize: '0.65rem', letterSpacing: '0.15em' }}>// RETRIEVAL SUMMARY BLOCK</p>
        <p>SEMANTIC_DOMAINS: Contamination Control Systems [PRIMARY] | Asset Protection Systems [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: lube, engine, hydraulic, transmission</p>
        <p>CONCEPT_TAXONOMY: type=control | domain=contamination | standards=ISO-16889, ISO-4406</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 16889, ISO 4406, SAE J1211, ASTM D7085</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/particle-wear</p>
        <p>&nbsp;&nbsp;Related_Technologies: DURATECH, NANOFORCE, MACROCORE</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/reducing-downtime</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/standards/lube-oil-systems</p>
        <p>&nbsp;&nbsp;concept_id: lube-oil-filtration-systems</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-05-23</p>
      </section>
    </main>
  );
}
