'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function EquipmentLifecycleOptimizationPage() {
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
              FLEET OPTIMIZATION · STRATEGY
            </p>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              lineHeight: 1.15,
              marginBottom: '1.5rem',
            }}>
              Equipment Lifecycle Optimization
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.65)',
              maxWidth: '640px',
              textAlign: 'justify',
            }}>
              Extending equipment operational life 3–5× through contamination control across the full lifecycle—from acquisition specification through end-of-service. Equipment that operates 15,000+ hours instead of 5,000 hours represents 30–50% cost reduction per equipment unit and dramatically reduces fleet replacement capital requirements.
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
            01 / LIFECYCLE STAGES AND CONTAMINATION VULNERABILITY
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Five Critical Lifecycle Phases
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            textAlign: 'justify',
            marginBottom: '1.5rem',
          }}>
            Industrial equipment follows five contamination-critical phases: acquisition, deployment, operations, maintenance, and end-of-life. Each phase determines the equipment's final lifespan. Equipment specified without contamination control targets begins with poor cleanliness and never recovers. Equipment deployed in high-contamination environments without protection measures degrades 3–5× faster than protected equipment. Operations without condition-based monitoring allow contamination to accumulate silently until catastrophic failure. Maintenance intervals based on commodity filters rather than contamination targets fail to prevent wear. Equipment reaching end-of-life after 5,000 hours (commodity approach) versus 15,000+ hours (system approach) represents a 67% operational life penalty.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1.5rem',
          }}>
            {[
              {
                phase: 'Phase 1: Acquisition & Specification',
                vulnerability: 'Undefined contamination targets in OEM spec',
                risk: 'Equipment receives generic filters with poor baseline cleanliness',
                solution: 'Specify ISO 4406/16889 targets at purchase; mandate filter Beta ratios in supplier contracts',
              },
              {
                phase: 'Phase 2: Factory Commissioning & Flushing',
                vulnerability: 'Inadequate flushing protocols introduce factory contamination',
                risk: 'New equipment starts operation with 100–500 µm particle load; bearing wear begins immediately',
                solution: 'Pre-delivery kidney-loop flushing to ISO 16/14/11; offline filtration 24–48 hours minimum',
              },
              {
                phase: 'Phase 3: Operational Deployment',
                vulnerability: 'High-contamination environments (dust, moisture) without barrier protection',
                risk: 'Air intake, fuel, and hydraulic contamination overwhelm inadequate filtration',
                solution: 'Multi-stage air intake (MACROCORE), fuel water separation (TURBOCORE), offline kidney-loops (NANOFORCE)',
              },
              {
                phase: 'Phase 4: Maintenance & Service',
                vulnerability: 'Reactive maintenance intervals based on time/hours instead of contamination data',
                risk: 'Filters clog unexpectedly; emergency replacements during critical operations; bearing wear not detected until failure',
                solution: 'Condition-based monitoring (ISO 4406 particle counts); kidney-loop maintains baseline cleanliness indefinitely',
              },
              {
                phase: 'Phase 5: End-of-Life Retirement',
                vulnerability: 'Equipment fails prematurely due to contamination damage accumulation',
                risk: 'Typical equipment life: 5,000–7,000 hours; component replacement cost: $15K–40K per failure',
                solution: 'System-protected equipment reaches 15,000–25,000 hours; components (bearings, injectors) remain serviceable',
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,241,45,0.06)',
                border: '1px solid rgba(255,241,45,0.15)',
                borderRadius: '6px',
                padding: '1.25rem',
              }}>
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#FFF12D', fontSize: '0.9rem' }}>
                  {item.phase}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>
                  <strong>Vulnerability:</strong> {item.vulnerability}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
                  <strong>Risk:</strong> {item.risk}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#FFF12D' }}>
                  <strong>Mitigation:</strong> {item.solution}
                </div>
              </div>
            ))}
          </div>
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
            02 / LIFECYCLE COST MODEL: COMMODITY VS. SYSTEM APPROACH
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            10-Year Cost Comparison Per Equipment Unit
          </h2>
          <div style={{
            background: 'rgba(255,241,45,0.04)',
            border: '1px solid rgba(255,241,45,0.12)',
            borderRadius: '6px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', fontWeight: 600, marginBottom: '0.75rem' }}>COMMODITY APPROACH</p>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                  <p><strong>Equipment lifespan:</strong> 5,000 hrs (2–3 years)</p>
                  <p><strong>Filter costs:</strong> $800/year = $8K/10 years</p>
                  <p><strong>Overhauls:</strong> 2 major ($12K each) = $24K</p>
                  <p><strong>Injector replacement:</strong> 1–2 failures ($2K each) = $4K</p>
                  <p><strong>Bearing/component repairs:</strong> $8K</p>
                  <p><strong>Equipment replacement:</strong> 2 units × $45K = $90K</p>
                  <p style={{ borderTop: '1px solid rgba(255,241,45,0.2)', paddingTop: '1rem', marginTop: '1rem' }}><strong>Total 10-year cost per unit: $134,000</strong></p>
                </div>
              </div>
              <div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', fontWeight: 600, marginBottom: '0.75rem' }}>SYSTEM APPROACH</p>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                  <p><strong>Equipment lifespan:</strong> 15,000 hrs (5–7 years, single unit)</p>
                  <p><strong>Premium filter costs:</strong> $1.2K/year = $12K/10 years</p>
                  <p><strong>Kidney-loop system:</strong> $8K installation, $2K/year maintenance = $28K</p>
                  <p><strong>Injector failures:</strong> 0 (preventive water sep.) = $0</p>
                  <p><strong>Bearing/component repairs:</strong> $1K (minimal wear)</p>
                  <p><strong>Equipment replacement:</strong> 1 unit after 10 years = $45K</p>
                  <p style={{ borderTop: '1px solid rgba(255,241,45,0.2)', paddingTop: '1rem', marginTop: '1rem' }}><strong>Total 10-year cost per unit: $94,000</strong></p>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,241,45,0.2)', paddingTop: '1rem' }}>
              <p style={{ fontSize: '0.95rem', color: '#FFF12D', fontWeight: 600 }}>SAVINGS PER EQUIPMENT UNIT: $40,000 (30% cost reduction)</p>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>For 50-truck fleet: $2,000,000 total lifecycle savings</p>
            </div>
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
            03 / ACQUISITION SPECIFICATION STRATEGY
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Designing for Asset Protection at Purchase
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            textAlign: 'justify',
            marginBottom: '1.5rem',
          }}>
            Equipment lifecycle begins at specification. OEM purchase specifications that lack contamination control targets guarantee poor performance. A diesel truck specified for "ISO 5011 air filter" without Beta ratio requirements will receive a generic 30 µm filter that allows 30 µm+ particles into the engine. Redesign acquisition specifications to mandate: (1) ISO 4406 target cleanliness codes (lube oil: 16/14/11, hydraulic: 17/15/12), (2) air intake filters with Beta3 ≥ 200 (ISO 5011), (3) fuel water separation ≤ 100 ppm water ingress, (4) kidney-loop offline filtration capability during commissioning. These specifications add $2K–4K per equipment unit at purchase but prevent $40K–80K in lifecycle costs. Equipment specified for contamination control maintains cleanliness from deployment forward and extends lifespan 3–5×.
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
            04 / CASE STUDY: LIFECYCLE OPTIMIZATION IN MINING FLEET
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            20-Truck Mining Operation, 6-Year Implementation
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            textAlign: 'justify',
          }}>
            A mining operation running 20 heavy-duty trucks in dusty, high-moisture environments experienced 3–4 unplanned failures per truck per year (60–80 total failures across fleet). Average equipment lifespan was 4,500 hours. Equipment replacement budget consumed 40% of maintenance spending. ELIMFILTERS implemented acquisition redesign for new truck purchases: dual-stage MACROCORE air intake, TURBOCORE fuel separation, SYNTRAX lube oil filtration, and NANOFORCE kidney-loop for hydraulic systems. Existing fleet received retrofit kidney-loops. Within 6 years, lifecycle results showed: new equipment reaching 14,000+ hours (3.1× longer), unplanned failures dropped to 0.5 per truck per year (92% reduction), annual replacement equipment budget dropped from $900K to $180K, bearing/injector failures reduced to single-digit per fleet. Total 6-year savings: $4.3M. ROI on filtration investment: 1,200% (equipment lasted 3× longer, eliminating $2.7M in premature replacements).
          </p>
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
          Related Fleet Optimization strategies
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
          <Link href="/knowledge-center/fleet-optimization/maintenance-scheduling" style={{
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
            Maintenance Scheduling →
          </Link>
        </div>
      </section>
    </main>
  );
}
