'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function PredictiveMonitoringPage() {
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
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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
              FLEET OPTIMIZATION · INTELLIGENCE
            </p>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              lineHeight: 1.15,
              marginBottom: '1.5rem',
            }}>
              Predictive Monitoring & Early Failure Detection
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.65)',
              maxWidth: '780px',
            }}>
              Detect equipment failure 2–4 weeks before catastrophic breakdown. Real-time fluid condition monitoring (ISO 4406 particle counts, fluid viscosity, water content, ferrous wear debris) identifies component degradation while maintenance options still exist. Equipment showing ISO 18/16/14 trend climbing to 19/17/15 signals imminent failure—order bearing replacement, schedule maintenance window, prevent emergency downtime.
            </p>
          </motion.div>
        </div>
      </section>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>

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
            01 / FAILURE SIGNAL DETECTION: PARTICLE MORPHOLOGY AND WEAR RATES
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Reading Equipment Condition from Fluid Analysis
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            marginBottom: '1.5rem',
          }}>
            Fluid condition analysis reveals equipment wear before external symptoms appear. A lube oil sample showing 500 µm wear particles per 100 mL (vs. normal 50–100) signals bearing distress. 1,000+ µm particles indicate imminent bearing failure within 200–500 hours. Fuel water content rising from 50 ppm to 300 ppm over 2 weeks signals fuel tank water ingress and imminent injector corrosion. Hydraulic oil showing sudden ISO code jump (17/15/12 → 19/17/14) indicates component wear, proportional valve internal leakage, or pump cavitation. These signals appear 2–4 weeks before failure, allowing planned maintenance instead of emergency repair.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1.5rem',
          }}>
            {[
              {
                signal: 'Particle Count Spike',
                indicator: 'ISO 4406 code increases by 2+ levels within 500 hours',
                meaning: 'Bearing wear acceleration; component clearance degradation',
                action: 'Schedule bearing replacement within 2 weeks; activate kidney-loop',
              },
              {
                signal: 'Ferrous Wear Debris',
                indicator: '500+ µm iron particles in oil sample; metallic shine visible',
                meaning: 'Engine or bearing surfaces generating wear particles; imminent failure',
                action: 'Plan equipment removal within 1 week; order replacement bearing',
              },
              {
                signal: 'Water Contamination Trend',
                indicator: 'Fuel water content 50 ppm → 100 ppm → 300 ppm over 3 weeks',
                meaning: 'Tank seal failure or condensation accumulation; injector corrosion risk',
                action: 'Activate water separator immediately; drain water; tank inspection',
              },
              {
                signal: 'Viscosity Degradation',
                indicator: 'Oil viscosity drops 10%+ from baseline; kinematic viscosity <95%',
                meaning: 'Fuel dilution (incomplete combustion) or oil oxidation; lubrication failing',
                action: 'Oil change within 1 week; inspect engine rings; review fuel system',
              },
              {
                signal: 'Varnish Formation',
                indicator: 'Dark oil discoloration; acid number (TAN) increasing 20%+ per month',
                meaning: 'Thermal oxidation; coolant leak into oil; additive depletion',
                action: 'Oil change immediately; coolant system inspection; temperature logging',
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,241,45,0.06)',
                border: '1px solid rgba(255,241,45,0.15)',
                borderRadius: '6px',
                padding: '1.25rem',
              }}>
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#FFF12D', fontSize: '0.9rem' }}>
                  {item.signal}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>
                  <strong>Indicator:</strong> {item.indicator}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
                  <strong>What it means:</strong> {item.meaning}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#FFF12D' }}>
                  <strong>Fleet action:</strong> {item.action}
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
            02 / PREDICTIVE MAINTENANCE ECONOMICS
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Cost of Early Detection vs. Emergency Failure
          </h2>
          <div style={{
            background: 'rgba(255,241,45,0.04)',
            border: '1px solid rgba(255,241,45,0.12)',
            borderRadius: '6px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', fontWeight: 600, marginBottom: '0.75rem' }}>PREDICTIVE MAINTENANCE (Early Detection)</p>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                Fluid sampling: €80/month × 12 = €960/year<br/>
                Bearing replacement (planned): €2,500<br/>
                Labor (scheduled): €400<br/>
                Zero downtime (scheduled maintenance during planned window)<br/>
                <strong style={{ color: '#FFF12D' }}>Total annual cost per truck: €3,860</strong>
              </p>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', fontWeight: 600, marginBottom: '0.75rem' }}>REACTIVE MAINTENANCE (Emergency Failure)</p>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                Bearing replacement (emergency): €3,500<br/>
                Labor (emergency, 3× cost): €1,200<br/>
                Towing (2 incidents/year): €1,000<br/>
                Downtime (3 days @ €500/day): €1,500<br/>
                Lost revenue (truck out of service): €4,000<br/>
                <strong style={{ color: '#FFF12D' }}>Total annual cost per truck: €11,200</strong>
              </p>
            </div>
            <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,241,45,0.2)', paddingTop: '1rem' }}>
              <p style={{ fontSize: '0.95rem', color: '#FFF12D', fontWeight: 600 }}>ANNUAL SAVINGS PER TRUCK: €7,340 (65% cost reduction)</p>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>For 50-truck fleet: €367,000/year in avoided emergency costs</p>
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
            03 / REAL-TIME MONITORING TECHNOLOGY STACK
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Tools for Continuous Equipment Health Assessment
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            marginBottom: '1.5rem',
          }}>
            Three monitoring approaches: (1) Lab-based particle counting: fluid samples sent to ISO 4406 certified lab; results returned 24–48 hours; cost €60–120 per sample; accuracy ±0.3 ISO codes. (2) Portable field analyzers: particle counters that operate in-vehicle; real-time ISO 4406 counts; cost €15K–25K per device; accuracy ±0.5 ISO codes; enables immediate threshold detection. (3) Continuous in-vehicle sensors: deployed on critical equipment; measure particle count, water content, viscosity continuously; data streamed to fleet dashboard; cost €8K–12K per sensor + €200/month data; enables predictive trend analysis. Most cost-effective approach: portable lab combined with scheduled sampling (1–2× per month) for light-duty vehicles, continuous sensors for critical high-value equipment (mining trucks, refuse compactors, construction cranes).
          </p>
        </motion.section>

      </div>

      <section style={{
        maxWidth: '1000px',
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
          <Link href="/knowledge-center/problems" style={{
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
            Problem Analysis →
          </Link>
        </div>
      </section>
    </main>
  );
}
