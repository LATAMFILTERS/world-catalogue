'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function OEMReplacementPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Link href="/knowledge-system/bridges" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← BRIDGES</Link>

      {/* Hero */}
      <section style={{
        paddingTop: '5rem',
        paddingBottom: '5rem',
        background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,0,0,0.3) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: '1.5rem' }}
          >
            <span style={{
              display: 'block',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.25em',
              color: '#FFF12D',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              // FILTRATION DECISION BRIDGE
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 900,
              fontFamily: 'Space Grotesk, sans-serif',
              marginBottom: '1.5rem',
              lineHeight: 1.1,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            OEM Filter Replacement Strategy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.75)',
              fontFamily: 'Outfit, sans-serif',
              maxWidth: '700px',
              borderLeft: '3px solid #FFF12D',
              paddingLeft: '1.25rem',
            }}
          >
            When OEM filters are required, recommended, or optional—and how to optimize filter selection within those constraints.
          </motion.p>
        </div>
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        {/* 01 / OEM Requirements */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ marginBottom: '4rem' }}
        >
          <p style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            color: '#FFF12D',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '1rem',
            textTransform: 'uppercase',
          }}>
            01 / OEM FILTER REQUIREMENTS
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            When OEM Filters Are Non-Negotiable
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1rem',
          }}>
            OEM-specified filters are mandatory in these scenarios:
          </p>
          <ul style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginLeft: '1.5rem',
            marginBottom: '1rem',
          }}>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#FFF12D' }}>Warranty Coverage:</strong> Most manufacturers require OEM filters for warranty validity. Non-OEM filter installation may void coverage (engine failure, transmission wear, hydraulic malfunction claims rejected).
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#FFF12D' }}>Specification Mismatch Risk:</strong> Equipment is engineered for specific pressure drops, bypass settings, and element geometry. Non-equivalent filters can cause performance issues (bypass premature activation, reduced flow, clogging acceleration).
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#FFF12D' }}>Service Network Control:</strong> Government contracts, medical equipment, aerospace, and pharmaceutical applications require OEM components for traceability and certification.
            </li>
            <li>
              <strong style={{ color: '#FFF12D' }}>System Integration:</strong> Some equipment (integrated aftertreatment, active exhaust systems) requires OEM components for diagnostics and emissions compliance.
            </li>
          </ul>
        </motion.section>

        {/* 02 / When OEM is Optional */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{ marginBottom: '4rem' }}
        >
          <p style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            color: '#FFF12D',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '1rem',
            textTransform: 'uppercase',
          }}>
            02 / WHEN OEM IS OPTIONAL
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Optimization Opportunities
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1.5rem',
          }}>
            Once warranty expires or for out-of-warranty equipment, filter selection can be optimized around contamination control and cost:
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
          }}>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '1rem',
              margin: '0 0 1rem 0',
            }}>
              <strong style={{ color: '#FFF12D' }}>Specification-Equivalent Alternatives:</strong> Select non-OEM filters that meet or exceed OEM specifications. Key metrics: micron rating, flow capacity, pressure drop, bypass setting. If equivalent, performance is equivalent.
            </p>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '1rem',
              margin: '0 0 1rem 0',
            }}>
              <strong style={{ color: '#FFF12D' }}>Performance-Enhanced Selection:</strong> Choose filters with superior contamination control metrics (higher Beta ratio, greater dirt holding capacity) while maintaining specification compatibility. Result: extended service intervals, lower TCO.
            </p>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              margin: '0',
            }}>
              <strong style={{ color: '#FFF12D' }}>Cost Optimization:</strong> High-quality aftermarket filters meeting OEM specs often cost 30-50% less than OEM-branded equivalents. Cost savings with no performance penalty when specification requirements are identical.
            </p>
          </div>
        </motion.section>

        {/* 03 / Equivalent Filter Evaluation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ marginBottom: '4rem' }}
        >
          <p style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            color: '#FFF12D',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '1rem',
            textTransform: 'uppercase',
          }}>
            03 / EQUIVALENT FILTER EVALUATION
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Specification Matching Criteria
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1.5rem',
          }}>
            When comparing non-OEM filters to OEM specifications, verify these critical dimensions:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
              }}>
                Physical Match
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
                margin: '0',
              }}>
                Element diameter, length, thread size, bowl design. Must fit housing without modification.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
              }}>
                Flow Capacity
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
                margin: '0',
              }}>
                GPM or L/min rating. Must equal or exceed OEM. Under-capacity reduces system flow.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
              }}>
                Pressure Drop
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
                margin: '0',
              }}>
                PSI/bar at rated flow. Must not exceed OEM. High pressure drop causes bypass.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
              }}>
                Bypass Setting
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
                margin: '0',
              }}>
                PSI at which unfiltered flow bypasses element. Must match OEM rating.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
              }}>
                Micron Rating
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
                margin: '0',
              }}>
                Filtration fineness. Non-OEM must equal or exceed (finer) OEM specification.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
              }}>
                Media Type
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
                margin: '0',
              }}>
                Synthetic vs glass fiber. Material affects lifespan and performance under extreme temps.
              </p>
            </div>
          </div>
        </motion.section>

        {/* 04 / OEM Optimization Strategy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <p style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            color: '#FFF12D',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '1rem',
            textTransform: 'uppercase',
          }}>
            04 / OPTIMIZING WITHIN OEM CONSTRAINTS
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            System-Level Performance with OEM Compliance
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1.5rem',
          }}>
            When OEM filters are required, contamination control can still be optimized:
          </p>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,255,0,0.03) 100%)',
            border: '1px solid rgba(255,241,45,0.15)',
            borderRadius: '8px',
            padding: '2rem',
          }}>
            <ul style={{
              fontSize: '1rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              marginLeft: '1.5rem',
              marginBottom: '0',
            }}>
              <li style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#FFF12D' }}>Maintenance Interval Optimization:</strong> While using OEM filters, replace based on contamination condition (particle counting), not calendar schedule. Reduces unplanned downtime and extends component life.
              </li>
              <li style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#FFF12D' }}>Preventive Contamination Control:</strong> Address contamination pathways outside the filter system (air intake design, crankcase ventilation, fuel water removal, seal integrity). OEM filter effectiveness improves when contamination sources are managed.
              </li>
              <li style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#FFF12D' }}>System-Level Integration:</strong> While respecting OEM filter requirements for warranty, integrate all six system domains (air, fuel, lube, hydraulic, cabin, compressed air) into a unified contamination control strategy.
              </li>
              <li>
                <strong style={{ color: '#FFF12D' }}>Measurement and Verification:</strong> Track particle counts and cleanliness codes to verify OEM filters are maintaining target contamination levels. If not, escalate to equipment maintenance (bypass valve check, seal inspection, air intake seal verification).
              </li>
            </ul>
          </div>
        </motion.section>

      </div>
    </main>
  );
}
