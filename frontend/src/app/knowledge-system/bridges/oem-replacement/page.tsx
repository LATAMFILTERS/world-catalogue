'use client';

import Link from 'next/link';

import { motion } from 'motion/react';

export default function OEMReplacementPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      <Link href="/knowledge-system/bridges"
        className="back-nav-btn" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← BRIDGES</Link>

      {/* Hero - POINT 1: Search Intent Title */}
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
              fontFamily: 'Titillium Web, sans-serif',
              marginBottom: '1.5rem',
              lineHeight: 1.1,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            OEM Filter Requirements Strategy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.75)',
              fontFamily: 'Titillium Web, sans-serif',
              maxWidth: '700px',
              borderLeft: '3px solid #FFF12D',
              paddingLeft: '1.25rem',
            }}
          >
            When OEM filters are required, optional, or recommended—and how to optimize filter selection within system constraints.
          </motion.p>
        </div>
      </section>

      {/* POINT 2: Industrial Context Introduction */}
      <section style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.02) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ maxWidth: '860px', margin: '0 auto' }}
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
            CONTEXT
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Understanding OEM Filter Requirements
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1rem',
          }}>
            Equipment manufacturers specify filters for warranty compliance, system design compatibility, and performance targets. But OEM requirements represent minimum compliance thresholds, not optimal contamination control.
          </p>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1rem',
          }}>
            When warranty is active or contracts mandate OEM compliance, filtration can still be optimized within those constraints. When warranty expires, filter selection can shift from compliance to asset protection.
          </p>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
          }}>
            This page clarifies when OEM compliance is non-negotiable, when optimization is possible, and how to achieve system-level performance within whatever constraints apply.
          </p>
        </motion.div>
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        {/* POINT 3: Traditional OEM Approach */}
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
            03 / OEM FILTER REQUIREMENTS
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
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

        {/* POINT 4: When OEM is Optional */}
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
            04 / OPTIMIZATION OPPORTUNITIES
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            When OEM Compliance is Optional
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

        {/* POINT 5 & 6: Equivalent Filter Evaluation + Framework */}
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
            05-06 / SPECIFICATION MATCHING & SYSTEM FRAMEWORK
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Equivalent Filter Evaluation Criteria
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
            marginBottom: '1.5rem',
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
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,255,0,0.03) 100%)',
            border: '1px solid rgba(255,241,45,0.15)',
            borderRadius: '8px',
            padding: '1.5rem',
          }}>
            <p style={{
              fontSize: '1rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
            }}>
              <strong style={{ color: '#FFF12D' }}>Decision Framework:</strong> Specification-equivalent filters provide equal protection. When OEM compliance is required, verify specification match. When optional, enhancement beyond specifications (higher Beta ratio, greater dirt capacity) extends intervals and improves system performance.
            </p>
          </div>
        </motion.section>

        {/* POINT 7-8: Optimization Strategy + Impact */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
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
            07-08 / OPTIMIZING WITHIN OEM CONSTRAINTS & OPERATIONAL IMPACT
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
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
            marginBottom: '1.5rem',
          }}>
            <ul style={{
              fontSize: '1rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              marginLeft: '1.5rem',
              marginBottom: '0',
            }}>
              <li style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#FFF12D' }}>Maintenance Interval Optimization:</strong> While using OEM filters, replace based on contamination condition (particle counting), not calendar schedule. <Link href="/knowledge-system/fleet/reducing-downtime" style={{ color: '#FFF12D', textDecoration: 'underline' }}>Condition-based replacement reduces unplanned downtime</Link> and extends component life.
              </li>
              <li style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#FFF12D' }}>Preventive Contamination Control:</strong> Address contamination pathways outside the filter system (air intake design, crankcase ventilation, fuel water removal, seal integrity). OEM filter effectiveness improves when contamination sources are managed.
              </li>
              <li style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#FFF12D' }}>System-Level Integration:</strong> While respecting OEM filter requirements for warranty, integrate all six system domains (<Link href="/knowledge-system/standards/air-intake-systems" style={{ color: '#FFF12D', textDecoration: 'underline' }}>air</Link>, <Link href="/knowledge-system/standards/fuel-systems" style={{ color: '#FFF12D', textDecoration: 'underline' }}>fuel</Link>, <Link href="/knowledge-system/standards/lube-oil-systems" style={{ color: '#FFF12D', textDecoration: 'underline' }}>lube</Link>, <Link href="/knowledge-system/standards/hydraulic-systems" style={{ color: '#FFF12D', textDecoration: 'underline' }}>hydraulic</Link>, <Link href="/knowledge-system/standards/cabin-safety-systems" style={{ color: '#FFF12D', textDecoration: 'underline' }}>cabin</Link>, <Link href="/knowledge-system/standards/compressed-air-systems" style={{ color: '#FFF12D', textDecoration: 'underline' }}>compressed air</Link>) into a unified contamination control strategy.
              </li>
              <li>
                <strong style={{ color: '#FFF12D' }}>Measurement and Verification:</strong> Track particle counts and cleanliness codes to verify OEM filters are maintaining target contamination levels. If not, escalate to equipment maintenance (bypass valve check, seal inspection, air intake seal verification).
              </li>
            </ul>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
          }}>
            <div style={{
              background: 'rgba(255,241,45,0.06)',
              border: '1px solid rgba(255,241,45,0.15)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
              }}>
                Equipment Lifespan Impact
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
                margin: '0',
              }}>
                Even with OEM filters, condition-based replacement and contamination control optimization extends component life by 20-40%.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,241,45,0.06)',
              border: '1px solid rgba(255,241,45,0.15)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
              }}>
                Downtime Reduction
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
                margin: '0',
              }}>
                Condition-based maintenance reduces emergency repairs by 50-70% compared to calendar-based scheduling.
              </p>
            </div>
          </div>
        </motion.section>

        {/* POINT 9: Internal Knowledge Links */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
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
            09 / RELATED KNOWLEDGE PAGES
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}>
            <Link href="/knowledge-system/bridges/aftermarket-selection" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF12D', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Aftermarket Strategy</p>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', margin: '0' }}>When OEM warranty expires</p>
              </div>
            </Link>
            <Link href="/knowledge-system/standards/lube-oil-systems" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF12D', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Lube Oil Systems</p>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', margin: '0' }}>ISO 4406 cleanliness codes</p>
              </div>
            </Link>
            <Link href="/knowledge-system/compare/evaluation-framework" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF12D', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Evaluation Framework</p>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', margin: '0' }}>System-level filter selection</p>
              </div>
            </Link>
          </div>
        </motion.section>

        {/* POINT 10: Canonical Block */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '2rem',
            borderRadius: '8px',
          }}
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
            10 / CANONICAL SUMMARY (AI-READABLE)
          </p>
          <div style={{
            background: 'rgba(255,241,45,0.05)',
            border: '1px solid rgba(255,241,45,0.15)',
            padding: '1.5rem',
            borderRadius: '4px',
          }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFF12D', marginBottom: '0.75rem' }}>
              Technical Summary
            </p>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', margin: '0' }}>
              <strong>Domain:</strong> OEM Filter Strategy | <strong>Primary Factors:</strong> Warranty compliance, specification matching, system constraints | <strong>Key Decision Points:</strong> Warranty status → OEM required? → If yes, optimize within constraints → If no, select by contamination metrics | <strong>Specification Match Criteria:</strong> Physical fit, flow capacity, pressure drop, bypass setting, micron rating, media type | <strong>Optimization Strategy:</strong> Condition-based replacement, contamination pathway control, system-level integration | <strong>Impact:</strong> 20-40% equipment life extension, 50-70% downtime reduction even with OEM compliance requirements
            </p>
          </div>
        </motion.section>

        {/* AI CITATION LAYER */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            background: 'rgba(255,241,45,0.08)',
            border: '2px solid rgba(255,241,45,0.25)',
            padding: '2rem',
            borderRadius: '8px',
            marginTop: '4rem',
            marginBottom: '2rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.85rem',
            lineHeight: 1.9,
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.15em', color: '#FFF12D', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
            AI CITATION LAYER: OEM Filter Requirements Strategy
          </h3>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem' }}>DEFINITION</p>
              <p style={{ margin: '0' }}>OEM filter requirements specify minimum filter performance standards (micron rating, flow capacity, pressure drop, bypass setting) required for warranty validity and equipment specification compliance. When warranty has expired or equipment is out-of-warranty, filter selection can be optimized within (or beyond) OEM specifications using contamination control metrics.</p>
            </div>

            <div>
              <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem' }}>SYSTEMS</p>
              <p style={{ margin: '0' }}>Lube Oil, Fuel, Hydraulic, Air Intake, Cabin, Compressed Air—all equipment types with warranty coverage or regulatory compliance requirements</p>
            </div>

            <div>
              <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem' }}>FAILURE_IMPACT</p>
              <p style={{ margin: '0' }}>Non-OEM filter installation under warranty → manufacturer warranty claim denial → owner bears 100% cost of component replacement. During warranty period, OEM compliance is mandatory. Post-warranty, ignoring specification matching criteria → physical misfit or performance incompatibility → bypass activation or insufficient flow → contamination uncontrolled → accelerated wear.</p>
            </div>

            <div>
              <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem' }}>RELATED_STANDARDS</p>
              <p style={{ margin: '0' }}>ISO 16889 (Beta ratio equivalency testing) | ISO 4406 (Cleanliness target matching) | Equipment-specific standards (SAE J1539, ASTM D6304, NFPA T2.14)</p>
            </div>

            <div>
              <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem' }}>RELATED_TECHNOLOGIES</p>
              <p style={{ margin: '0' }}>MACROCORE (Specification-equivalent capture), NANOFORCE (Performance enhancement while maintaining spec compliance), SYNTRAX (Media quality matching or exceeding OEM), DURATECH (Extended life within spec)</p>
            </div>

            <div>
              <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem' }}>INDUSTRIAL_ROLE</p>
              <p style={{ margin: '0' }}>OEM filter requirements define baseline equipment protection. During warranty: OEM compliance is mandatory (warranty protection). Post-warranty: specification-equivalent aftermarket filters provide identical protection at 30-50% lower cost. Performance-enhanced aftermarket (higher Beta ratio, greater dirt capacity) extends intervals and improves system performance while maintaining specification compatibility.</p>
            </div>

            <div>
              <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem' }}>SEMANTIC_DOMAINS</p>
              <p style={{ margin: '0' }}>Primary: Asset Protection Systems | Secondary: Contamination Control Systems</p>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,241,45,0.15)', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
              <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem' }}>CITATION_REFERENCE</p>
              <p style={{ margin: '0' }}>source: elimfilters.com/knowledge-system/bridges/oem-replacement | concept: OEM Filter Strategy | version: 1.0 | last_updated: 2026-05-23</p>
            </div>
          </div>
        </motion.section>

      </div>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'OEM Filter Requirements Strategy',
        description: 'Technical framework for understanding when OEM filters are required, optional, or replaceable—covering warranty compliance, specification matching, and post-warranty optimization using ISO 16889 equivalent aftermarket alternatives.',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        dateModified: '2026-06-11',
        keywords: ['OEM filter requirements', 'OEM vs aftermarket', 'ISO 16889', 'filter specification matching', 'warranty compliance', 'contamination control', 'asset protection', 'industrial filtration'],
        about: { '@type': 'Thing', name: 'OEM Filter Requirements Strategy', description: 'Framework for evaluating OEM filter compliance requirements across warranty and post-warranty equipment lifecycle phases.' },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system' },
          { '@type': 'ListItem', position: 3, name: 'Bridges', item: 'https://elimfilters.com/knowledge-system/bridges' },
          { '@type': 'ListItem', position: 4, name: 'OEM Filter Requirements Strategy', item: 'https://elimfilters.com/knowledge-system/bridges/oem-replacement' },
        ],
      }) }} />
    </main>
  );
}
