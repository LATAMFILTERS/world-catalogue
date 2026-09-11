'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ConversionProvider, useConversion } from '@/components/conversion/ConversionContext';
import { EngineeringRecommendationsSection } from '@/components/engineering';
import { CTACard } from '@/components/conversion/CTACard';

function HydraulicContaminationContent() {
  const { dispatchTrustSignal, setIntent } = useConversion();

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Navigation */}
      <div style={{ padding: '1.5rem 2rem 0', maxWidth: '920px', margin: '0 auto' }}>
        <Link href="/engineering" style={{
          fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.08em',
        }}>
          ← ENGINEERING INTELLIGENCE
        </Link>
      </div>

      {/* Hero */}
      <section style={{
        padding: 'clamp(3rem, 6vw, 5rem) 2rem 2.5rem',
        borderBottom: '1px solid rgba(255,241,45,0.08)',
      }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p style={{
              fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,241,45,0.55)', letterSpacing: '0.12em', marginBottom: '1.25rem',
            }}>
              ENGINEERING TOPIC · HYDRAULIC SYSTEMS
            </p>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontFamily: 'Outfit, sans-serif',
              fontWeight: 700, lineHeight: 1.15, marginBottom: '1.25rem',
              maxWidth: '700px',
            }}>
              Which contamination mechanisms affect hydraulic systems?
            </h1>
            <p style={{
              fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7,
              maxWidth: '640px', textAlign: 'justify',
            }}>
              Hydraulic systems fail from the inside. Particle contamination and water ingress degrade
              proportional valves, piston pumps, and actuator seals — components operating at
              200–450 bar with clearances of 1–25 µm. Understanding the contamination mechanism
              determines the correct filtration response.
            </p>
          </motion.div>
        </div>
      </section>

      <div style={{ maxWidth: '920px', margin: '0 auto', padding: '3rem 2rem 5rem' }}>

        {/* 1 · Customer Problem */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
          onViewportEnter={() => dispatchTrustSignal('T-1')}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>01 / CUSTOMER PROBLEM</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1rem', color: '#fff',
          }}>
            Hydraulic systems lose precision before they lose pressure
          </h2>
          <p style={{
            fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75,
            textAlign: 'justify', marginBottom: '1rem',
          }}>
            The first sign of hydraulic contamination is not a leak or a failure — it is drift.
            Actuators that do not hold position. Proportional valves with growing deadband.
            Boom controls that hunt at partial throttle. These symptoms appear months before a
            component failure forces a repair event, which means contamination is already costing
            money long before it is diagnosed.
          </p>
          <p style={{
            fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75,
            textAlign: 'justify',
          }}>
            Hydraulic contamination is responsible for 70–80% of premature component failures in
            mobile equipment hydraulic circuits. It is not a consequence of bad luck. It is the
            predictable result of operating a high-precision system without a measured contamination
            control strategy.
          </p>
        </motion.section>

        {/* 2 · Operational Consequences */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>02 / OPERATIONAL CONSEQUENCES</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1.25rem', color: '#fff',
          }}>
            Measured impact on equipment and operations
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { metric: '−50–70%', label: 'Component service life under uncontrolled contamination' },
              { metric: '−15–40%', label: 'System efficiency loss from internal leakage and valve stiction' },
              { metric: '+25–35%', label: 'Increase in unplanned downtime events per 1,000 operating hours' },
              { metric: '$2K–$40K', label: 'Per-event cost for proportional valve or piston pump replacement' },
            ].map((item) => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '6px',
                padding: '1.25rem',
              }}>
                <p style={{
                  fontSize: '1.4rem', fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700, color: '#FFF12D', marginBottom: '0.4rem',
                }}>{item.metric}</p>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>{item.label}</p>
              </div>
            ))}
          </div>
          <p style={{
            fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, textAlign: 'justify',
          }}>
            At mining machine rates of $120,000–$180,000 per operating hour, a 24-hour hydraulic
            pump failure represents $2.88M–$4.32M in lost production value — before repair costs.
            In construction and agriculture, downtime cost is lower per hour but maintenance personnel
            cost and schedule disruption carry equivalent fleet-level economic impact.
          </p>
        </motion.section>

        {/* 3 · Engineering Explanation */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
          onViewportEnter={() => dispatchTrustSignal('T-2')}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>03 / ENGINEERING EXPLANATION</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1rem', color: '#fff',
          }}>
            Four contamination pathways. Two failure mechanisms.
          </h2>
          <p style={{
            fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75,
            textAlign: 'justify', marginBottom: '1.25rem',
          }}>
            Hydraulic contamination enters through four distinct pathways: built-in contamination
            from assembly residue in hoses, cylinders, and fittings; ingressed particles through
            cylinder rod seals and reservoir breathers; internally generated wear debris from pumps,
            motors, and valves; and fluid degradation products including varnish precursors from
            thermal-oxidative breakdown above 70°C. In mobile off-highway equipment, all four pathways
            operate simultaneously.
          </p>
          <div style={{
            background: 'rgba(255,241,45,0.04)', border: '1px solid rgba(255,241,45,0.12)',
            borderRadius: '6px', padding: '1.5rem', marginBottom: '1.25rem',
          }}>
            <p style={{
              fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,241,45,0.6)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>PARTICLE CONTAMINATION — PRIMARY MECHANISM</p>
            <p style={{
              fontSize: '0.87rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, textAlign: 'justify',
            }}>
              Proportional valve spools operate at 1–5 µm clearance. Gear pump side-plate clearances
              are 5–10 µm. Piston pump cylinder bore clearances are 15–25 µm. At these tolerances,
              particles at or above the clearance gap cause direct jamming, scoring, and catastrophic
              spool failure. Particles below the clearance gap — the silt range of 1–4 µm —
              accumulate in spool bores and produce silting: a gradual increase in friction and
              stiction that presents as control deadband before valve replacement becomes necessary.
              ISO 4406 cleanliness targets of 16/14/11 to 17/15/12 are achievable only with
              ISO 16889 Beta-rated filter elements.
            </p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px', padding: '1.5rem',
          }}>
            <p style={{
              fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>VARNISH FORMATION — SECONDARY MECHANISM</p>
            <p style={{
              fontSize: '0.87rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, textAlign: 'justify',
            }}>
              Hydraulic fluid exposed to operating temperatures above 80°C undergoes thermal-oxidative
              degradation producing varnish precursor molecules that deposit as thin lacquer films
              on proportional valve bores, pump plates, and accumulator internals. Varnish deposits
              of 1–2 µm thickness are sufficient to cause spool stiction under static conditions.
              Varnish cannot be removed by filtration alone — dissolved precursors require chemical
              flushing. Filtration prevents the solid varnish particles that form after precipitation
              from re-circulating in the system.
            </p>
          </div>
        </motion.section>

        {/* 4 · Applicable Standards */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>04 / APPLICABLE STANDARDS</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1.25rem', color: '#fff',
          }}>
            Standards that define measurable contamination targets
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                code: 'ISO 4406',
                scope: 'Particle cleanliness code classification for hydraulic and lube oil systems. Three-number code (4µm / 6µm / 14µm particle count per mL). Target: 16/14/11 for proportional valve circuits; 17/15/12 for standard hydraulic systems.',
                link: '/knowledge-system/standards/iso-4406',
              },
              {
                code: 'ISO 16889',
                scope: 'Multi-pass filter efficiency test methodology. Defines Beta ratio (βx[c]) as the ratio of upstream to downstream particle count at a given size. A filter rated β10[c] ≥ 1000 removes 99.9% of particles ≥10 µm.',
                link: '/knowledge-system/standards/iso-16889',
              },
              {
                code: 'NFPA T2.14',
                scope: 'National Fluid Power Association standard for hydraulic fluid cleanliness and filtration system design. Defines required cleanliness levels for different valve and pump types.',
                link: null,
              },
              {
                code: 'DIN 51524',
                scope: 'German hydraulic oil specification defining viscosity grades and additive requirements. Relevant for fluid compatibility with seal materials and filter element media.',
                link: null,
              },
            ].map((std) => (
              <div key={std.code} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '6px', padding: '1.25rem',
                display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
              }}>
                <p style={{
                  fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace',
                  color: '#FFF12D', minWidth: '80px', paddingTop: '2px',
                  fontWeight: 600,
                }}>{std.code}</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
                  {std.scope}{' '}
                  {std.link && (
                    <Link href={std.link} style={{ color: 'rgba(255,241,45,0.7)', textDecoration: 'none' }}>
                      Read standard →
                    </Link>
                  )}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 5 · Technology Architecture */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
          onViewportEnter={() => dispatchTrustSignal('T-3')}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>05 / TECHNOLOGY ARCHITECTURE</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1rem', color: '#fff',
          }}>
            Technologies mapped to each failure mechanism
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              {
                tech: 'NANOFORCE™',
                role: 'High-Beta hydraulic filtration',
                description: 'Sub-micron particle capture at β10[c] ≥ 1000. Protects proportional valve spools at 1–5 µm critical clearances. Inline and return-line configurations for hydraulic circuits targeting ISO 4406 16/14/11 to 17/15/12.',
                href: '/engineering/technologies/TECH-NANOFORCE',
                mechanism: 'Particle contamination — primary',
              },
              {
                tech: 'SYNTRAX™',
                role: 'Full-flow hydraulic circuit filtration',
                description: 'High dirt-capacity synthetic media for high-volume hydraulic circuit loops. Maintains ISO 4406 cleanliness in circuits with high internally generated wear particle loads from piston pumps and motor wear.',
                href: '/engineering/technologies/TECH-SYNTRAX',
                mechanism: 'Particle contamination — bulk load',
              },
              {
                tech: 'TURBOCORE™',
                role: 'Water separation',
                description: 'Coalescing media for free and emulsified water removal from hydraulic fluid. Prevents water-accelerated fluid oxidation and varnish precursor formation. Applied in reservoir return-line housings.',
                href: '/engineering/technologies/TECH-TURBOCORE',
                mechanism: 'Water contamination',
              },
              {
                tech: 'MICROKAPPA™',
                role: 'Reservoir breather protection',
                description: 'Filtration at the reservoir air exchange interface — preventing ingress contamination entering through breather ports during reservoir level changes. Addresses built-in contamination pathway during operation.',
                href: '/engineering/technologies/TECH-MICROKAPPA',
                mechanism: 'Ingress contamination',
              },
            ].map((item) => (
              <Link key={item.tech} href={item.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.25)' }}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '6px', padding: '1.25rem',
                    display: 'grid',
                    gridTemplateColumns: '140px 1fr',
                    gap: '1.25rem',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <p style={{
                      fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif',
                      fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem',
                    }}>{item.tech}</p>
                    <p style={{
                      fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
                      color: 'rgba(255,255,255,0.35)', lineHeight: 1.5,
                    }}>{item.role}</p>
                  </div>
                  <div>
                    <p style={{
                      fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
                      color: 'rgba(255,241,45,0.4)', letterSpacing: '0.08em', marginBottom: '0.4rem',
                    }}>ADDRESSES: {item.mechanism.toUpperCase()}</p>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* 6 · Protection Strategy */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
          onViewportEnter={() => dispatchTrustSignal('T-4')}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>06 / PROTECTION STRATEGY</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1rem', color: '#fff',
          }}>
            System-level contamination control, not individual filter replacement
          </h2>
          <p style={{
            fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75,
            textAlign: 'justify', marginBottom: '1.25rem',
          }}>
            Effective hydraulic contamination control requires four concurrent measures: inline
            filtration at the pump outlet (protecting valves), return-line filtration at the
            reservoir inlet (preventing system re-contamination), reservoir breather filtration
            (blocking ingress), and condition-based oil sampling (confirming ISO 4406 compliance).
            Changing a filter element without measuring the resulting cleanliness code does not
            confirm protection — it only confirms that a filter was installed.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              'Establish ISO 4406 cleanliness targets before selecting filter element specifications',
              'Size filter elements to system flow rate and dirt-holding capacity (not just connection port size)',
              'Monitor differential pressure indicator — confirm bypass valve does not open under operating conditions',
              'Implement quarterly oil analysis to track ISO 4406 particle count between service intervals',
              'Commission new hydraulic systems with flushing circuit before connecting to valves — built-in contamination from assembly is the leading source of early component failures',
              'Track varnish potential index (MPC test) if system operates above 70°C — particle filtration alone will not prevent varnish-induced stiction',
            ].map((action, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
                  color: '#FFF12D', minWidth: '20px', paddingTop: '3px',
                }}>{String(i + 1).padStart(2, '0')}</span>
                <p style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{action}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 7 · Recommended Products */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '3.5rem' }}
          onViewportEnter={() => { dispatchTrustSignal('T-5'); setIntent('FAILURE_DIAGNOSIS'); }}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '0.75rem',
          }}>07 / RECOMMENDED PRODUCTS</p>
          <h2 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, marginBottom: '1rem', color: '#fff',
          }}>
            Find hydraulic filtration elements for your equipment
          </h2>
          <p style={{
            fontSize: '0.87rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7,
            marginBottom: '1.5rem', textAlign: 'justify',
          }}>
            Product selection follows protection strategy. Once contamination targets (ISO 4406 codes)
            and technology selection (NANOFORCE™, SYNTRAX™) are established, the correct filter element
            is determined by equipment make, model, and hydraulic circuit configuration.
          </p>
          <CTACard onLeadCapture={() => dispatchTrustSignal('T-6')} />
        </motion.section>

        {/* 8 · Engineering References */}
        <EngineeringRecommendationsSection
          primaryEntityId="CONT-WEAR-PARTICLE-HYD"
          queryType="contamination"
          label="08 / ENGINEERING REFERENCES — KNOWLEDGE GRAPH"
        />

        {/* 9 · Related Topics */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{ marginTop: '3.5rem', marginBottom: '3.5rem' }}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '1.25rem',
          }}>09 / RELATED TOPICS</p>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
          }}>
            {[
              { label: 'ISO 4406 — Particle Cleanliness Codes', href: '/knowledge-center/standards/iso-4406/' },
              { label: 'ISO 16889 — Beta Ratio Filter Testing', href: '/knowledge-center/standards/iso-16889/' },
              { label: 'Hydraulic Systems — Standards Domain', href: '/knowledge-center/standards/' },
              { label: 'Hydraulic Contamination — Case Study', href: '/knowledge-center/engineering/contamination-control/' },
              { label: 'Diesel Water Contamination', href: '/engineering/diesel-water-contamination' },
              { label: 'Particle Wear in Engines', href: '/knowledge-center/engineering/contamination-control/' },
              { label: 'NANOFORCE™ Technology', href: '/engineering/technologies/TECH-NANOFORCE' },
              { label: 'Mining — Industry Application', href: '/industries/mining' },
            ].map((link) => (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.2)', background: 'rgba(255,241,45,0.03)' }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '6px', padding: '0.9rem 1rem',
                    fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.45,
                  }}
                >
                  {link.label} →
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* 10 · Next Recommended Journey */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '2.5rem',
          }}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,241,45,0.4)', letterSpacing: '0.12em', marginBottom: '1.25rem',
          }}>10 / NEXT RECOMMENDED JOURNEY</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              {
                label: 'My equipment has a hydraulic fault right now',
                href: '/engineering/problem-diagnosis',
                desc: 'Structured root-cause investigation',
                accent: '#f9a8d4',
              },
              {
                label: 'I want to protect my hydraulic system proactively',
                href: '/engineering/asset-protection',
                desc: 'Asset protection consultation',
                accent: '#FFF12D',
              },
            ].map((journey) => (
              <Link key={journey.href} href={journey.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: journey.accent }}
                  style={{
                    border: `1px solid rgba(255,255,255,0.08)`,
                    borderRadius: '8px', padding: '1.5rem',
                  }}
                >
                  <p style={{
                    fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
                    color: journey.accent, opacity: 0.7, letterSpacing: '0.1em', marginBottom: '0.6rem',
                  }}>{journey.desc.toUpperCase()}</p>
                  <p style={{
                    fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600,
                    color: '#fff', lineHeight: 1.4,
                  }}>{journey.label}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: 'Which contamination mechanisms affect hydraulic systems?',
          description: 'Particle contamination and water ingress degrade proportional valves, piston pumps, and actuator seals operating at 200–450 bar with clearances of 1–25 µm. ISO 4406 cleanliness codes define the measurable target.',
          author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
          about: {
            '@type': 'Thing',
            name: 'Hydraulic System Contamination',
            description: 'Particle and water contamination in hydraulic fluid causing proportional valve failure, pump wear, and actuator inefficiency.',
          },
          mentions: {
            standards: ['ISO 4406', 'ISO 16889', 'NFPA T2.14', 'DIN 51524'],
            technologies: ['NANOFORCE', 'SYNTRAX', 'TURBOCORE', 'MICROKAPPA'],
            contaminationModes: ['particle wear', 'silt contamination', 'varnish formation', 'water ingress'],
          },
          url: 'https://elimfilters.com/engineering/hydraulic-contamination',
        })}} />

      </div>
    </main>
  );
}

export default function HydraulicContaminationPage() {
  return (
    <ConversionProvider>
      <HydraulicContaminationContent />
    </ConversionProvider>
  );
}
