'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function AssetProtectionSystemPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Link href="/knowledge-center/fleet-optimization" style={{
        display: 'inline-block',
        padding: '1rem 2rem',
        color: '#FFF12D',
        textDecoration: 'none',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        margin: '2rem 2rem 0',
      }}>
        ← FLEET OPTIMIZATION
      </Link>

      <section style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              color: '#FFF12D',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}>
              FLEET OPTIMIZATION · FRAMEWORK
            </p>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              lineHeight: 1.15,
              marginBottom: '1.5rem',
            }}>
              Asset Protection System
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.65)',
              maxWidth: '640px',
              textAlign: 'justify',
            }}>
              ELIMFILTERS positioning as industrial asset protection provider. Moving beyond commodity filtration to system-level contamination control protecting equipment through 10+ year lifecycle.
            </p>
          </motion.div>
        </div>
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,241,45,0.5)',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
          }}>
            01 / PROTECTING INDUSTRIAL ASSETS THROUGH CONTAMINATION CONTROL
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Core Thesis: Equipment Reliability is a Contamination Control Problem
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            textAlign: 'justify',
            marginBottom: '1.5rem',
          }}>
            Industrial equipment does not fail from "bad luck" or random defects. It fails from <strong>uncontrolled contamination</strong>. A diesel engine, a hydraulic system, or a hydraulic pump fails for the same reason: contaminated air, fuel, or oil exceeded the system's filtration capacity, accelerated component wear, and exceeded that component's lifespan.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            textAlign: 'justify',
            marginBottom: '1.5rem',
          }}>
            <strong>ELIMFILTERS positions itself as an asset protection provider, not a filter manufacturer.</strong> Our role is to engineer contamination control systems that protect industrial assets from failure, extending equipment life 3–5 times and reducing total cost of ownership 60%.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            textAlign: 'justify',
          }}>
            The business outcome: Fleets investing in ELIMFILTERS asset protection systems see unplanned failures drop by 90%, downtime reduced 80%, and equipment lifespan extended 50–80%. The cost? Typically recouped in 18–24 months through eliminated repairs and extended equipment life.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,241,45,0.5)',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
          }}>
            02 / ASSET PROTECTION ACROSS FIVE DOMAINS
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Comprehensive System Protection
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            textAlign: 'justify',
            marginBottom: '2rem',
          }}>
            Industrial assets operate across 5 fluid and air domains, each with unique contamination threats and component sensitivity. ELIMFILTERS provides specialized protection for each domain:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1.5rem',
          }}>
            {[
              {
                domain: 'Air Intake Protection',
                threat: 'Dust ingestion causing piston ring wear',
                standard: 'ISO 5011 / SAE J1539',
                impact: 'Bypass risk when filter clogs',
                solution: 'MACROCORE premium air filters (99.9% @ 5 µm, 3× dirt capacity)',
              },
              {
                domain: 'Fuel Cleanliness Protection',
                threat: 'Water + particles damaging HPCR injectors',
                standard: 'ASTM D6304 / ISO 12937',
                impact: 'Injector corrosion + stiction, $800–1200 per injector failure',
                solution: 'SYNTAPORE particulate filtration + TURBOCORE water separator',
              },
              {
                domain: 'Lube Oil Protection',
                threat: 'Particle contamination reducing bearing life',
                standard: 'ISO 16889 / ISO 4406',
                impact: 'Bearing life reduction from 15,000 hrs to 2,000 hrs (7× penalty)',
                solution: 'SYNTRAX return filter + DURATECH kidney-loop (maintains 16/14/11 indefinitely)',
              },
              {
                domain: 'Hydraulic System Protection',
                threat: 'Proportional valve stiction from 3–5 µm particles',
                standard: 'ISO 16889 / NFPA T2.14',
                impact: 'Proportional valve failure in 600 hrs (5 µm pilot orifice blockage)',
                solution: 'NANOFORCE (Beta 1000 @ 3 µm, offline kidney-loop maintains ISO 15/13/10)',
              },
              {
                domain: 'Compressed Air & Cabin Protection',
                threat: 'Moisture + particles reducing pneumatic efficiency',
                standard: 'ISO 8573-1 / ISO 11155',
                impact: 'Compressor/actuator wear, operator health impact',
                solution: 'DRYCORE (desiccant breather) + MICROKAPPA (cabin HEPA filtration)',
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,241,45,0.06)',
                border: '1px solid rgba(255,241,45,0.15)',
                borderRadius: '6px',
                padding: '1.25rem',
              }}>
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#FFF12D', fontSize: '0.9rem' }}>
                  {item.domain}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>
                  <strong>Contamination threat:</strong> {item.threat}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
                  <strong>Standard:</strong> {item.standard}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem' }}>
                  <strong>Financial impact if uncontrolled:</strong> {item.impact}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#FFF12D' }}>
                  <strong>ELIMFILTERS solution:</strong> {item.solution}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,241,45,0.5)',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
          }}>
            03 / ELIMFILTERS COMPETITIVE POSITIONING
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Not a Filter Replacement Brand — An Asset Protection Provider
          </h2>
          <div style={{
            background: 'rgba(255,241,45,0.04)',
            border: '1px solid rgba(255,241,45,0.12)',
            borderRadius: '6px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', fontWeight: 600, marginBottom: '0.5rem' }}>COMMODITY COMPETITION</p>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                Donaldson, Fleetguard, Mann, Wix, Baldwin: Focus on product features (micron ratings, brand recognition, OEM spec compliance). Competition on price and availability. Customers view them as interchangeable filter replacements.
              </p>
            </div>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', fontWeight: 600, marginBottom: '0.5rem' }}>ELIMFILTERS DIFFERENTIATION</p>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                Asset protection through system-level contamination control. We position around equipment lifespan, downtime reduction, and total cost of ownership — not filter features. Customers value us for business outcomes (60% TCO savings, 90% failure reduction, 5× longer asset life), not because our filters are "slightly better."
              </p>
            </div>
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            textAlign: 'justify',
          }}>
            <strong>This positioning makes us unassailable in price competition:</strong> If a customer views us as "premium filter manufacturer," they compare us to Donaldson. If they view us as "asset protection provider," they compare us to major maintenance outsourcing firms and pay 10–20× more for the equivalent result (downtime reduction, equipment life extension). Our job is to move every conversation from "which filter" to "how do we protect this asset."
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,241,45,0.5)',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
          }}>
            04 / THE ASSET PROTECTION BUSINESS OUTCOME
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Why Customers Choose ELIMFILTERS
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
          }}>
            {[
              { metric: 'Equipment Lifespan', baseline: '5 years', protected: '10–15 years', value: '200–300% extension' },
              { metric: 'Unplanned Failures', baseline: '10–20/year per fleet', protected: '0–2/year', value: '90% reduction' },
              { metric: 'Downtime', baseline: '500–1000 hrs/year', protected: '50–100 hrs/year', value: '80–90% reduction' },
              { metric: 'Total Cost of Ownership', baseline: '$1.8M per 10-truck fleet', protected: '$700K per fleet', value: '$1.1M savings (61%  reduction)' },
              { metric: 'ROI Timeline', baseline: 'N/A', protected: '18–24 months', value: 'Then $111K/truck/10 years' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,241,45,0.06)',
                border: '1px solid rgba(255,241,45,0.15)',
                borderRadius: '6px',
                padding: '1.25rem',
              }}>
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#FFF12D', fontSize: '0.9rem' }}>
                  {item.metric}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
                  Commodity: {item.baseline}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem' }}>
                  Protected: {item.protected}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#FFF12D', fontWeight: 600 }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

      </div>

      <section style={{
        maxWidth: '860px',
        margin: '3rem auto',
        padding: '2rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.9rem',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '1.5rem',
        }}>
          Explore asset protection frameworks and operational data
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/knowledge-center/fleet-optimization/total-cost-ownership" style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255,241,45,0.1)',
            border: '1px solid rgba(255,241,45,0.3)',
            color: '#FFF12D',
            textDecoration: 'none',
            borderRadius: '4px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}>
            TCO Analysis →
          </Link>
          <Link href="/knowledge-center/fleet-optimization/contamination-control-strategy" style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255,241,45,0.1)',
            border: '1px solid rgba(255,241,45,0.3)',
            color: '#FFF12D',
            textDecoration: 'none',
            borderRadius: '4px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}>
            Control Strategy →
          </Link>
        </div>
      </section>
    </main>
  );
}
