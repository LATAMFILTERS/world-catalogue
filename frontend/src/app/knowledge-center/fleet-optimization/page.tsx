'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function FleetOptimizationHub() {
  const pages = [
    {
      title: 'Asset Protection System',
      description: 'ELIMFILTERS positioning as industrial asset protection provider. Moving beyond commodity filtration to system-level contamination control protecting equipment through 10+ year lifecycle.',
      href: '/knowledge-center/fleet-optimization/asset-protection-system',
      icon: '🛡️',
    },
    {
      title: 'Total Cost of Ownership',
      description: '10-year fleet TCO comparison showing $1.1M savings (61% reduction) through system-level contamination control. Break down costs by maintenance category and ROI analysis.',
      href: '/knowledge-center/fleet-optimization/total-cost-ownership',
      icon: '💰',
    },
    {
      title: 'Contamination Control Strategy',
      description: '7-layer Information Architecture hierarchy and 5-domain contamination protection system. 4-phase implementation roadmap from diagnosis through monitoring across all critical domains.',
      href: '/knowledge-center/fleet-optimization/contamination-control-strategy',
      icon: '⚙️',
    },
    {
      title: 'Equipment Lifecycle Optimization',
      description: 'Extend equipment operational life 3–5× through contamination control across five critical lifecycle phases: acquisition, commissioning, deployment, maintenance, and end-of-life.',
      href: '/knowledge-center/fleet-optimization/equipment-lifecycle-optimization',
      icon: '📈',
    },
    {
      title: 'Condition-Based Maintenance Scheduling',
      description: 'Shift from fixed time-based intervals to contamination-driven scheduling using ISO 4406 cleanliness codes. Extend intervals 30–40% while reducing unplanned downtime 80%.',
      href: '/knowledge-center/fleet-optimization/maintenance-scheduling',
      icon: '📊',
    },
    {
      title: 'Predictive Monitoring & Early Failure Detection',
      description: 'Detect equipment failure 2–4 weeks before catastrophic breakdown through real-time fluid condition monitoring. Reduce emergency maintenance costs 65% through predictive intervention.',
      href: '/knowledge-center/fleet-optimization/predictive-monitoring',
      icon: '🔍',
    },
    {
      title: 'Regional Fleet Strategies',
      description: 'Tailor filtration deployment to regional environmental stressors: desert dust, tropical moisture, coastal salt air, cold climate extremes. Standardize on modular platform, customize by region.',
      href: '/knowledge-center/fleet-optimization/regional-fleet-strategies',
      icon: '🌍',
    },
  ];

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Link href="/knowledge-center/" style={{
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
        ← KNOWLEDGE SYSTEM
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
              KNOWLEDGE SYSTEM · OPERATIONAL STRATEGY
            </p>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              lineHeight: 1.15,
              marginBottom: '1.5rem',
            }}>
              Fleet Optimization
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.65)',
              maxWidth: '640px',
              textAlign: 'justify',
            }}>
              Fleet Optimization translates contamination control principles into operational strategies. This section connects industrial asset protection (Standards → Contamination → Technologies) to practical fleet management: equipment lifecycle planning, condition-based maintenance scheduling, predictive monitoring, and regional deployment strategies. The result: equipment operating 3–5× longer, 90% fewer unplanned failures, 60% lower total cost of ownership.
            </p>
          </motion.div>
        </div>
      </section>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ marginBottom: '4rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,241,45,0.5)',
            textTransform: 'uppercase',
            marginBottom: '2rem',
          }}>
            FLEET OPTIMIZATION FRAMEWORK
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {pages.map((page, i) => (
              <motion.div
                key={page.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 + i * 0.05 }}
              >
                <Link
                  href={page.href}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(255,241,45,0.06)',
                    border: '1px solid rgba(255,241,45,0.15)',
                    borderRadius: '8px',
                    padding: '1.75rem',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    height: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,241,45,0.35)';
                    e.currentTarget.style.background = 'rgba(255,241,45,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,241,45,0.15)';
                    e.currentTarget.style.background = 'rgba(255,241,45,0.06)';
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
                    {page.icon}
                  </div>
                  <h3 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    marginBottom: '0.75rem',
                    color: '#FFF12D',
                  }}>
                    {page.title}
                  </h3>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: 'rgba(255,255,255,0.65)',
                    textAlign: 'justify',
                    flex: 1,
                  }}>
                    {page.description}
                  </p>
                  <div style={{
                    marginTop: '1rem',
                    color: '#FFF12D',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}>
                    EXPLORE →
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          style={{
            background: 'rgba(255,241,45,0.04)',
            border: '1px solid rgba(255,241,45,0.12)',
            borderRadius: '8px',
            padding: '2rem',
            marginTop: '3rem',
          }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,241,45,0.5)',
            marginBottom: '1rem',
            textTransform: 'uppercase',
          }}>
            INFORMATION ARCHITECTURE
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            textAlign: 'justify',
          }}>
            Fleet Optimization sits at the operational apex of ELIMFILTERS Knowledge System. The hierarchy flows: <strong>Contamination</strong> (root cause) → <strong>Asset Degradation</strong> (impact) → <strong>Standards & Measurement</strong> (assessment via ISO 4406, ISO 16889, ASTM D6304) → <strong>Protection Technologies</strong> (MACROCORE, SYNTRAX, NANOFORCE, HYDROCORE) → <strong>Product Implementation</strong> (specific filters and systems) → <strong>Fleet Optimization</strong> (operational strategy). Fleet Optimization pages translate technical knowledge into business outcomes: extend equipment life, reduce failures, lower total cost of ownership.
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
          Related Knowledge System sections
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/knowledge-center/standards/" style={{
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
            Industrial Standards →
          </Link>
          <Link href="/knowledge-center/engineering/" style={{
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
            Contamination Analysis →
          </Link>
          <Link href="/knowledge-system/problems" style={{
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
