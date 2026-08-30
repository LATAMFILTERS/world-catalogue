'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function SystemVsCommodityPage() {
  const comparisonData = [
    {
      category: 'Filtration Strategy',
      commodity: 'Product selection based on OEM spec, brand reputation, price',
      system: 'Contamination target (ISO 4406 code) determines filter specification'
    },
    {
      category: 'Cleanliness Target',
      commodity: 'OEM minimum (19/17/14 typical) — meets warranty compliance',
      system: 'Equipment-specific optimal (16/14/11 bearing, 17/15/12 valve)'
    },
    {
      category: 'Bypass Valve',
      commodity: 'Standard 3.5–4.0 bar (often ignored in selection)',
      system: 'Engineered to application: 3.5 bar (fuel), 4.5 bar (hydraulic mobile)'
    },
    {
      category: 'Maintenance Approach',
      commodity: 'Calendar-based intervals (every 250 hours, 6 months, etc.)',
      system: 'Condition-based (oil analysis triggers replacement)'
    },
    {
      category: 'Cost Analysis',
      commodity: 'Filter cost only (~$150–300 per replacement)',
      system: 'Total cost of ownership (filter + downtime + premature failure)'
    },
    {
      category: 'Equipment Life',
      commodity: 'Design life accepted (2,000–5,000 hours bearing life)',
      system: 'Extended life targeted (15,000–25,000 hours — 3–5× improvement)'
    },
    {
      category: 'Failure Risk',
      commodity: 'High: contamination bypass not controlled, cascade failures',
      system: 'Low: contamination targets prevent root causes'
    },
    {
      category: 'ROI Payback',
      commodity: 'N/A (no system investment, reactive spending)',
      system: '3–6 months via extended intervals + downtime prevention'
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
            // COMPARISON FRAMEWORK · SYSTEM VS COMMODITY
          </p>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            marginBottom: '1rem',
            fontFamily: 'Outfit, sans-serif'
          }}>
            System Approach vs Commodity Filtration
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '800px',
            lineHeight: 1.6
          }}>
            Filtration is not a product commodity selection problem. It is a contamination control system problem. This framework explains why OEM specification compliance does not equal equipment reliability.
          </p>
        </motion.div>
      </section>

      <section style={{
        padding: 'clamp(2rem, 8vw, 4rem) 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.9rem',
            minWidth: '900px'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255,241,45,0.2)' }}>
                <th style={{
                  padding: '1.5rem',
                  textAlign: 'left',
                  color: '#FFF12D',
                  fontWeight: 700,
                  fontFamily: 'Outfit, sans-serif',
                  width: '25%'
                }}>
                  Decision Factor
                </th>
                <th style={{
                  padding: '1.5rem',
                  textAlign: 'left',
                  color: '#f44336',
                  fontWeight: 700,
                  fontFamily: 'Outfit, sans-serif'
                }}>
                  Commodity Approach
                </th>
                <th style={{
                  padding: '1.5rem',
                  textAlign: 'left',
                  color: '#4caf50',
                  fontWeight: 700,
                  fontFamily: 'Outfit, sans-serif'
                }}>
                  System Approach (ELIMFILTERS)
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent'
                  }}
                >
                  <td style={{
                    padding: '1.5rem',
                    color: '#FFF12D',
                    fontWeight: 600,
                    verticalAlign: 'top'
                  }}>
                    {row.category}
                  </td>
                  <td style={{
                    padding: '1.5rem',
                    color: 'rgba(255,255,255,0.7)',
                    verticalAlign: 'top'
                  }}>
                    {row.commodity}
                  </td>
                  <td style={{
                    padding: '1.5rem',
                    color: 'rgba(255,255,255,0.8)',
                    verticalAlign: 'top'
                  }}>
                    {row.system}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            marginTop: '3rem',
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(76,175,80,0.05) 100%)',
            border: '2px solid rgba(76,175,80,0.3)',
            borderRadius: '12px'
          }}
        >
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#4caf50',
            marginBottom: '1rem',
            fontFamily: 'Outfit, sans-serif'
          }}>
            Why System Approach Wins
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              { title: '3–5× Equipment Life Extension', desc: 'Bearing life 15,000+ hours vs 2,000–5,000 hours with commodity approach' },
              { title: '60–80% Downtime Reduction', desc: 'Predictive maintenance prevents cascade failures; unplanned events drop from 8h per 5000h to 2h per 20000h' },
              { title: '50–60% 10-Year TCO Savings', desc: 'System investment ($1,500–2,000) recovered in 3–6 months; extends to 10-year savings of $50K–150K' },
              { title: 'Risk Transfer from Operations to Design', desc: 'Contamination targets engineered in; not left to maintenance luck or OEM warranty limits' }
            ].map((item, idx) => (
              <div key={idx} style={{ paddingLeft: '2rem', borderLeft: '2px solid rgba(76,175,80,0.4)' }}>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </ul>
        </motion.div>
      </section>
    </main>
  );
}
