'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import RoiCalculator from './components/roi-calculator';
import BearingLifePredictor from './components/bearing-life-predictor';
import OilDegradationTimeline from './components/oil-degradation-timeline';
import FilterSelectionGuide from './components/filter-selection-guide';
import TcoComparison from './components/tco-comparison';

export default function FleetOptimizationPage() {
  return (
    <main style={{
      background: '#000',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <div style={{
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Link
          href="/knowledge-center"
          style={{
            color: 'rgba(255,255,255,0.6)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF12D')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
        >
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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p style={{
            fontSize: '0.8rem',
            color: '#FFF12D',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '1rem',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            // INDUSTRIAL FLEET OPTIMIZATION · COST ANALYSIS TOOLS
          </p>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            marginBottom: '1rem',
            fontFamily: 'Outfit, sans-serif',
            lineHeight: 1.2
          }}>
            Fleet Optimization Library
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '800px',
            lineHeight: 1.6,
            marginBottom: '1.5rem'
          }}>
            Five interconnected calculators engineered to quantify the financial and operational impact of contamination control systems. Data-driven tools for ROI, bearing life prediction, oil degradation analysis, filter selection, and total cost of ownership comparison.
          </p>

          <p style={{
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '800px'
          }}>
            All calculations use verified data from ISO 19438 contamination factors, ASTM D6304 water ingress studies, and 12+ industrial case studies with quantified failure costs.
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '3rem',
          padding: '1.5rem',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          {[
            { name: 'ROI Calculator', icon: '📊' },
            { name: 'Bearing Life Predictor', icon: '⚙️' },
            { name: 'Oil Degradation', icon: '📉' },
            { name: 'Filter Selection', icon: '🔍' },
            { name: 'TCO Comparison', icon: '💰' }
          ].map((tool, idx) => (
            <div
              key={idx}
              style={{
                padding: '1rem',
                background: 'rgba(255,241,45,0.08)',
                border: '1px solid rgba(255,241,45,0.2)',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#FFF12D'
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                {tool.icon}
              </div>
              {tool.name}
            </div>
          ))}
        </div>

        <RoiCalculator />
        <BearingLifePredictor />
        <OilDegradationTimeline />
        <FilterSelectionGuide />
        <TcoComparison />
      </section>

      <section style={{
        padding: 'clamp(2rem, 8vw, 4rem) 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(255,241,45,0.03) 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(255,241,45,0.15)',
        marginBottom: '3rem'
      }}>
        <h2 style={{
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          fontWeight: 700,
          color: '#FFF12D',
          marginBottom: '1.5rem',
          fontFamily: 'Outfit, sans-serif'
        }}>
          How These Tools Work Together
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          {[
            { title: '1. Identify Contamination Risk', desc: 'Use the Filter Selection Guide to identify which contamination modes threaten your equipment.' },
            { title: '2. Simulate Degradation', desc: 'Run the Oil Degradation Timeline to visualize how contamination accumulates over time.' },
            { title: '3. Project Equipment Life', desc: 'Use the Bearing Life Predictor to quantify how contamination control extends service life.' },
            { title: '4. Calculate ROI', desc: 'Input your scenario into the ROI Calculator to determine payback period and annual savings.' },
            { title: '5. Compare Lifecycle Costs', desc: 'Run TCO Comparison to see 10-year cost projections: commodity vs system approach.' },
            { title: '6. Make Data-Driven Decisions', desc: 'Armed with quantified impact, justify contamination control investment to leadership.' }
          ].map((item, idx) => (
            <div key={idx}>
              <div style={{
                fontSize: '0.9rem',
                color: '#FFF12D',
                fontWeight: 700,
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {item.title}
              </div>
              <p style={{
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.6
              }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '2rem'
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: '#FFF12D',
          marginBottom: '1rem'
        }}>
          ✓ Verified Data Sources
        </h3>
        <p style={{
          fontSize: '0.9rem',
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '1rem',
          lineHeight: 1.6
        }}>
          All calculator logic is based on ISO 19438, ISO 4406, ISO 16889, ASTM D6304, and SKF bearing life data. Failure costs and timelines verified against 12+ industrial case studies.
        </p>
        <p style={{
          fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.6)',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          Sources: ISO 19438 (SKF), ISO 4406:2021, ISO 16889:2021, ASTM D6304, NFPA T2.14
        </p>
      </section>
    </main>
  );
}
