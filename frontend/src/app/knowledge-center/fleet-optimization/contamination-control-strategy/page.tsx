'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function ContaminationControlStrategyPage() {
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
              Integrated Contamination Control Strategy
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.65)',
              maxWidth: '640px',
              textAlign: 'justify',
            }}>
              Unified framework protecting industrial assets across 5 contamination domains: air intake, fuel, lube oil, hydraulic systems, and compressed air. Information architecture: Contamination → Degradation → Standards → Technologies → Implementation.
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
            01 / THE UNIFIED CONTAMINATION PROBLEM
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Root Cause: Uncontrolled Contamination
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            textAlign: 'justify',
            marginBottom: '1.5rem',
          }}>
            All industrial equipment failure modes share a common root cause: <strong>uncontrolled contamination</strong>. Although air, fuel, oil, hydraulic, and compressed-air systems appear separate, the underlying mechanism is identical: contamination enters → exceeds filter capacity → accelerates component degradation → equipment life reduced 50–80% → downtime and catastrophic costs.
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            textAlign: 'justify',
          }}>
            The difference is not the contamination source, but component sensitivity. A 4 µm silica particle damages proportional valve spool clearances (1–4 µm) but passes harmlessly through cylinder ports (20–50 µm). Effective contamination control requires understanding which component is most sensitive in each system and specifying filtration to protect that critical component.
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
            02 / INFORMATION ARCHITECTURE: DECISION HIERARCHY
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            From Problem to Solution: 7-Layer Framework
          </h2>
          <div style={{
            background: 'rgba(255,241,45,0.06)',
            border: '1px solid rgba(255,241,45,0.15)',
            borderRadius: '6px',
            padding: '1.5rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.8rem',
            lineHeight: 2,
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <strong style={{ color: '#FFF12D' }}>Layer 1: Contamination (Root Cause)</strong><br/>
              <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem', display: 'block' }}>
                Identify contamination sources: dust ingression, water entry, fuel degradation, wear particles, microorganism growth.
              </span>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <strong style={{ color: '#FFF12D' }}>Layer 2: Asset Degradation (Impact)</strong><br/>
              <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem', display: 'block' }}>
                Understand failure mechanisms: abrasive wear, corrosion, viscosity loss, valve stiction, component seizure.
              </span>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <strong style={{ color: '#FFF12D' }}>Layer 3: Measurement Standards (Assessment)</strong><br/>
              <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem', display: 'block' }}>
                Apply ISO standards as measurement tools: ISO 4406 (oil cleanliness), ISO 16889 (filter testing), ASTM D6304 (water content), ISO 5011 (air filter efficiency).
              </span>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <strong style={{ color: '#FFF12D' }}>Layer 4: Control Technologies (Solution)</strong><br/>
              <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem', display: 'block' }}>
                Select ELIMFILTERS technologies addressing contamination targets: MACROCORE (air), SYNTAPORE (fuel particles), SYNTRAX (lube oil), NANOFORCE (hydraulic), DRYCORE (compressed air).
              </span>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <strong style={{ color: '#FFF12D' }}>Layer 5: Product Implementation (Deployment)</strong><br/>
              <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem', display: 'block' }}>
                Specify filter products with proven Beta ratios and dirt capacity. Install multi-stage filtration: air intake + fuel + return line + kidney-loop.
              </span>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <strong style={{ color: '#FFF12D' }}>Layer 6: Operational Monitoring (Verification)</strong><br/>
              <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem', display: 'block' }}>
                Implement condition-based maintenance: quarterly ISO 4406 oil analysis, Karl Fischer water testing, differential pressure monitoring, wear metal spectrometry.
              </span>
            </div>
            <div>
              <strong style={{ color: '#FFF12D' }}>Layer 7: Fleet Optimization (Results)</strong><br/>
              <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem', display: 'block' }}>
                Achieve target outcomes: 3–5× equipment lifespan extension, 80–90% downtime reduction, 60% total cost of ownership savings.
              </span>
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
            03 / THE 5 DOMAINS: CONTAMINATION PROTECTION SYSTEMS
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Multi-Domain Protection Framework
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
          }}>
            {[
              { domain: 'Air Intake', sensitivity: 'MODERATE', critical: 'Bypass risk', technology: 'MACROCORE', target: 'ISO 5011 (99.5%)' },
              { domain: 'Fuel Systems', sensitivity: 'HIGH', critical: 'HPCR injectors (0.1 mm orifice)', technology: 'SYNTAPORE + TURBOCORE', target: '<4 µm particles + water' },
              { domain: 'Lube Oil', sensitivity: 'MODERATE-HIGH', critical: 'Bearing life (4 µm particles)', technology: 'SYNTRAX', target: 'Per approved application + kidney-loop' },
              { domain: 'Hydraulic', sensitivity: 'CRITICAL', critical: 'Proportional valve (1–4 µm)', technology: 'NANOFORCE', target: 'Per approved application' },
              { domain: 'Compressed Air', sensitivity: 'MODERATE', critical: 'Pneumatic valve efficiency', technology: 'DRYCORE', target: 'ISO 8573-1 class 2–3' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,241,45,0.06)',
                border: '1px solid rgba(255,241,45,0.15)',
                borderRadius: '6px',
                padding: '1.25rem',
              }}>
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#FFF12D', fontSize: '0.9rem' }}>{item.domain}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>SENSITIVITY: {item.sensitivity}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                  <strong>Critical component:</strong> {item.critical}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
                  <strong>Technology:</strong> {item.technology}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#FFF12D' }}>
                  <strong>Target:</strong> {item.target}
                </div>
              </div>
            ))}
          </div>
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
            04 / IMPLEMENTATION ROADMAP: 4 PHASES
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            From Assessment to Optimization
          </h2>
          <div style={{
            background: 'rgba(255,241,45,0.06)',
            border: '1px solid rgba(255,241,45,0.15)',
            borderRadius: '6px',
            padding: '1.5rem',
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', fontWeight: 600, marginBottom: '0.5rem' }}>PHASE 1: DIAGNOSIS (MONTH 1)</div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                Baseline assessment: oil analysis (ISO 4406), water testing (Karl Fischer), visual inspection, differential pressure measurement, fuel consumption analysis. Identify contamination sources and current system cleanliness state.
              </p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', fontWeight: 600, marginBottom: '0.5rem' }}>PHASE 2: SPECIFICATION (MONTH 2)</div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                Design protection strategy: determine target cleanliness codes per system, select filtration technologies (MACROCORE, SYNTRAX, NANOFORCE, etc.), plan kidney-loop offline circulation, establish monitoring calendar. Define budget and implementation timeline.
              </p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', fontWeight: 600, marginBottom: '0.5rem' }}>PHASE 3: INSTALLATION (MONTH 3–4)</div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                Deploy multi-stage filtration: air intake + fuel + return line filters, kidney-loop pump and circulation circuit. Flush system with clean oil (8+ hours circulation). Validate that target cleanliness is achieved via ISO 4406 sampling. Update maintenance schedules.
              </p>
            </div>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', fontWeight: 600, marginBottom: '0.5rem' }}>PHASE 4: MONITORING (ONGOING)</div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                Quarterly ISO 4406 analysis. Karl Fischer water testing every 500 hours. Differential pressure monitoring on all filters. Wear metal spectrometry (ICP-OES) for bearing/cylinder wear detection. Preventive filter replacement at target + 1 cleanliness level (not waiting for failure).
              </p>
            </div>
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
          Learn more about standards and contamination protection
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/knowledge-center/standards/iso-4406" style={{
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
            ISO 4406 Cleanliness →
          </Link>
          <Link href="/knowledge-center/problems/bearing-wear" style={{
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
            Bearing Wear Analysis →
          </Link>
        </div>
      </section>
    </main>
  );
}
