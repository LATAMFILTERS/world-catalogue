'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function EvaluationFrameworkPage() {
  const evaluationSteps = [
    {
      step: 1,
      title: 'Define Contamination Target (ISO 4406)',
      details: [
        'What contamination mode threatens your equipment?',
        'What cleanliness code does equipment design require?',
        'What bypass pressure is safe?'
      ],
      example: 'Heavy-duty truck engine: particle wear threat → target 16/14/11 cleanliness → 4.0 bar bypass'
    },
    {
      step: 2,
      title: 'Select Filter Specification (ISO 16889)',
      details: [
        'Beta ratio (particle capture efficiency): Beta₂₀ ≥200 minimum',
        'Absolute rating (largest particle passed): 18-micron (MACROCORE), 10-micron (NANOFORCE)',
        'Dirt capacity: 15g/L (standard), 25g/L (premium), 40g/L (extended)'
      ],
      example: 'For 16/14/11 target, select Beta₂₀ ≥200 filter at 18-micron absolute with 25g/L capacity'
    },
    {
      step: 3,
      title: 'Verify Bypass Valve Setting',
      details: [
        'Does filter bypass valve match application pressure?',
        'Is bypass pressure ≥filter collapse rating?',
        'Does bypass threshold prevent uncontrolled contamination ingestion?'
      ],
      example: 'Fuel filter SYNTEPORE: 3.0 bar bypass protects injectors from starvation during cold engine start'
    },
    {
      step: 4,
      title: 'Establish Replacement Trigger (Condition-Based)',
      details: [
        'Monitor differential pressure across filter',
        'Analyze oil/fuel samples at intervals',
        'Replace when cleanliness drifts from target'
      ],
      example: 'Hydraulic system: replace proportional valve filter when ISO code exceeds 17/15/12 or pressure drops 3+ psi'
    },
    {
      step: 5,
      title: 'Document System & Measure Impact',
      details: [
        'Record baseline equipment condition',
        'Track maintenance intervals and downtime events',
        'Measure bearing life extension in operating hours'
      ],
      example: 'After 24 months: engine bearing life extended from 3,000 to 18,000 hours; downtime reduced 75%'
    }
  ];

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Link href="/knowledge-center" style={{
          color: 'rgba(255,255,255,0.6)',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          ← KNOWLEDGE CENTER
        </Link>
      </div>

      <section style={{
        padding: 'clamp(2rem, 8vw, 4rem) 2rem',
        borderBottom: '1px solid rgba(255,241,45,0.15)',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.05) 0%, rgba(255,241,45,0.01) 100%)',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{
            fontSize: '0.8rem',
            color: '#FFF12D',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '1rem',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            // EVALUATION FRAMEWORK · 5-STEP DECISION TREE
          </p>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            marginBottom: '1rem',
            fontFamily: 'Outfit, sans-serif'
          }}>
            Filter Evaluation Framework
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '800px',
            lineHeight: 1.6
          }}>
            Shift from "which product?" to "what contamination target?" This 5-step framework prioritizes contamination control metrics (ISO 16889 Beta ratio, ISO 4406 cleanliness codes, bypass pressure) over brand or price.
          </p>
        </motion.div>
      </section>

      <section style={{
        padding: 'clamp(2rem, 8vw, 4rem) 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {evaluationSteps.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(255,241,45,0.03) 100%)',
                border: '1px solid rgba(255,241,45,0.2)',
                borderRadius: '12px',
                padding: '2rem'
              }}
            >
              <div style={{
                fontSize: '3rem',
                fontWeight: 700,
                color: 'rgba(255,241,45,0.3)',
                marginBottom: '1rem',
                fontFamily: 'Outfit, sans-serif'
              }}>
                {item.step}
              </div>

              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: '#FFF12D',
                marginBottom: '1rem',
                fontFamily: 'Outfit, sans-serif'
              }}>
                {item.title}
              </h3>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '1.5rem'
              }}>
                {item.details.map((detail, i) => (
                  <li key={i} style={{
                    marginBottom: '0.75rem',
                    paddingLeft: '1.5rem',
                    position: 'relative',
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.5
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      color: '#FFF12D'
                    }}>
                      •
                    </span>
                    {detail}
                  </li>
                ))}
              </ul>

              <div style={{
                padding: '1rem',
                background: 'rgba(76,175,80,0.1)',
                border: '1px solid rgba(76,175,80,0.2)',
                borderRadius: '6px',
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.8)'
              }}>
                <strong style={{ color: '#4caf50' }}>Example:</strong> {item.example}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{
        padding: 'clamp(2rem, 8vw, 4rem) 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.06)',
        marginTop: '3rem'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#FFF12D',
          marginBottom: '1.5rem',
          fontFamily: 'Outfit, sans-serif'
        }}>
          Quick Selection Matrix
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '800px'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255,241,45,0.2)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#FFF12D', fontWeight: 600 }}>Application</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#FFF12D', fontWeight: 600 }}>Threat</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#FFF12D', fontWeight: 600 }}>ISO Target</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#FFF12D', fontWeight: 600 }}>Beta₂₀ Min</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#FFF12D', fontWeight: 600 }}>Bypass (bar)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { app: 'Lube Oil (HD Truck)', threat: 'Particle wear', iso: '16/14/11', beta: '≥200', bypass: '4.0' },
                { app: 'Hydraulic (Proportional)', threat: 'Spool wear', iso: '16/14/11', beta: '≥200', bypass: '3.5' },
                { app: 'Fuel (HPCR Injector)', threat: 'Water stiction', iso: '17/15/12', beta: '≥200', bypass: '3.0' },
                { app: 'Air Intake (Turbine)', threat: 'Blade erosion', iso: 'ISO 5011 Class 4', beta: '≥1000', bypass: 'N/A' },
                { app: 'Cabin Air (Health)', threat: 'PM10 exposure', iso: 'HEPA grade', beta: '≥1000', bypass: 'N/A' }
              ].map((row, idx) => (
                <tr key={idx} style={{
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent'
                }}>
                  <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.8)' }}>{row.app}</td>
                  <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.7)' }}>{row.threat}</td>
                  <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'JetBrains Mono, monospace' }}>{row.iso}</td>
                  <td style={{ padding: '1rem', color: '#FFF12D', fontWeight: 600 }}>{row.beta}</td>
                  <td style={{ padding: '1rem', color: '#FFF12D', fontWeight: 600 }}>{row.bypass}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
