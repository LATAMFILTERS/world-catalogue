'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function MaintenanceSchedulingPage() {
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
              FLEET OPTIMIZATION · OPERATIONS
            </p>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              lineHeight: 1.15,
              marginBottom: '1.5rem',
            }}>
              Condition-Based Maintenance Scheduling
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.65)',
              maxWidth: '640px',
              textAlign: 'justify',
            }}>
              Shift from fixed time-based maintenance intervals to contamination-driven condition-based scheduling. Equipment equipped with contamination monitoring (ISO 4406 particle counts, fluid condition sensors) can extend maintenance intervals 30–40% while reducing unplanned downtime 80%. Predictive scheduling based on actual component wear—not arbitrary calendar dates—extends equipment life and reduces emergency maintenance events.
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
            01 / TIME-BASED VS. CONDITION-BASED MAINTENANCE
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            The Maintenance Paradox
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            textAlign: 'justify',
            marginBottom: '1.5rem',
          }}>
            Time-based maintenance (replace filter at 500 hours, oil at 1,000 hours) assumes all equipment operates identically. A truck running light-duty city routes accumulates minimal contamination. The same truck model running desert mining routes accumulates 10× more dust, sand, and engine wear. Time-based intervals treat both identically—either the light-duty truck wastes money replacing clean filters, or the heavy-duty truck runs filters past their contamination capacity. Condition-based maintenance measures actual contamination (ISO 4406 particle counts, water content, particle morphology) and replaces fluids/filters only when contamination targets are exceeded. Result: heavy-duty truck maintains shorter intervals (but accurate), light-duty truck extends intervals (maintaining cleanliness indefinitely). Both save 25–40% on consumable costs and reduce emergency failures 80%.
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
            02 / CONTAMINATION MONITORING FRAMEWORK
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            ISO 4406 Decision Tree for Filter Replacement
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            textAlign: 'justify',
            marginBottom: '2rem',
          }}>
            Condition-based scheduling uses ISO 4406 cleanliness codes as the decision trigger. Fleet operators establish a target cleanliness code (e.g., 18/16/13 for lube oil, 17/15/12 for hydraulic) and monitor particles monthly. When a sample exceeds the target, the filter is replaced and fluids topped off. This approach prevents both premature replacement and over-use.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1.5rem',
          }}>
            {[
              {
                system: 'Engine Lube Oil',
                target: 'ISO 18/16/13',
                action: 'Sample monthly; replace filter if any code exceeds target',
                timing: 'Typical interval: 1500–2500 hours (vs. fixed 1000 hours)',
                savings: '30–40% less frequent oil changes; extends drain intervals to 2000+ hours',
              },
              {
                system: 'Hydraulic Systems',
                target: 'ISO 17/15/12',
                action: 'Sample every 500 hours; activate kidney-loop if ≥1 particle exceeds target',
                timing: 'Kidney-loop typically runs 4–8 hours per equipment per month',
                savings: 'Prevents proportional valve stiction (€8K repair); extends fluid drain to 3000+ hours',
              },
              {
                system: 'Fuel Systems',
                target: 'ASTM D6304: ≤100 ppm water',
                action: 'Sample every 200 operating hours or monthly; activate water separator if exceeded',
                timing: 'Water separator typically activated 1–2× per season in humid climates',
                savings: 'Prevents injector corrosion (€2–3K per injector); extends fuel life to 1500+ hours',
              },
              {
                system: 'Transmission (if equipped)',
                target: 'ISO 18/16/14',
                action: 'Sample every 500 hours; replace if any code exceeds target by >1 level',
                timing: 'Typical interval: 2000–3000 hours (vs. fixed 1500 hours)',
                savings: '25–35% less frequent fluid changes; reduces transmission wear 50%',
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,241,45,0.06)',
                border: '1px solid rgba(255,241,45,0.15)',
                borderRadius: '6px',
                padding: '1.25rem',
              }}>
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#FFF12D', fontSize: '0.9rem' }}>
                  {item.system}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>
                  <strong>Target cleanliness:</strong> {item.target}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>
                  <strong>Monitoring action:</strong> {item.action}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
                  <strong>Typical replacement interval:</strong> {item.timing}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#FFF12D' }}>
                  <strong>Fleet benefit:</strong> {item.savings}
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
            03 / EMERGENCY VS. PREVENTIVE MAINTENANCE ECONOMICS
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Cost of Unplanned Maintenance Events
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            textAlign: 'justify',
            marginBottom: '1.5rem',
          }}>
            A single emergency maintenance event (engine failure, bearing seizure, injector failure) costs 5–10× more than preventive maintenance. Emergency repair: equipment towed (€500), parts (€4K–8K), labor (€2K–5K), downtime (€8K–20K/day), lost revenue. Total: €15K–35K per event. Preventive filter replacement and fluid service: parts (€500–1K), labor (€200–500), no downtime. Cost: €1K–2K. Reducing emergency events from 8/year to 1/year saves €90K–200K per truck per year. Condition-based scheduling detects contamination before component damage occurs, preventing 90% of emergency events.
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
            04 / IMPLEMENTATION: MONITORING AND SAMPLING WORKFLOW
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Building a Condition-Based Maintenance Program
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1.5rem',
          }}>
            {[
              {
                step: 'Step 1: Establish Baseline Cleanliness',
                action: 'Sample all equipment fluids at program start; establish ISO 4406 baseline for each vehicle/system',
                timeline: 'Week 1–2',
              },
              {
                step: 'Step 2: Define Target Cleanliness Codes',
                action: 'Set target codes for lube oil (18/16/13), hydraulic (17/15/12), fuel (100 ppm water). These become "green light" values.',
                timeline: 'Week 2',
              },
              {
                step: 'Step 3: Implement Routine Sampling Schedule',
                action: 'Lube oil: monthly; Hydraulic: every 500 hrs; Fuel: every 200 hrs or monthly. Use portable particle counters or send to ISO 4406 lab.',
                timeline: 'Ongoing, 1–2 samples per equipment per month',
              },
              {
                step: 'Step 4: Execute Maintenance Actions on Exceeding Targets',
                action: 'Filter replacement when any ISO 4406 code exceeds target. Kidney-loop activation for hydraulic systems. Fuel water separator for HPCR engines.',
                timeline: 'Within 48 hours of sample result exceeding target',
              },
              {
                step: 'Step 5: Track Cumulative Data',
                action: 'Log all samples in fleet maintenance software. Calculate average intervals per equipment type. Adjust target codes if consistently exceeded.',
                timeline: 'Quarterly review; annual strategy adjustment',
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,241,45,0.06)',
                border: '1px solid rgba(255,241,45,0.15)',
                borderRadius: '6px',
                padding: '1.25rem',
              }}>
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#FFF12D', fontSize: '0.9rem' }}>
                  {item.step}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>
                  {item.action}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                  <strong>Timeline:</strong> {item.timeline}
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
          Related Fleet Optimization strategies
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/knowledge-center/fleet-optimization/predictive-monitoring" style={{
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
            Predictive Monitoring →
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
            Contamination Strategy →
          </Link>
        </div>
      </section>
    </main>
  );
}
