'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function OemVsAftermarketPage() {
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
            // MARKET POSITIONING · OEM VS AFTERMARKET
          </p>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            marginBottom: '1rem',
            fontFamily: 'Outfit, sans-serif'
          }}>
            OEM vs Aftermarket Filter Selection
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '800px',
            lineHeight: 1.6
          }}>
            Factual analysis of when OEM choice matters and when system-level engineering supersedes brand selection. Filter cost is 1–5% of total ownership cost; system-level contamination control determines the other 95%.
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(33,150,243,0.1)',
              border: '2px solid rgba(33,150,243,0.3)',
              borderRadius: '12px',
              padding: '2rem'
            }}
          >
            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#2196F3',
              marginBottom: '1.5rem',
              fontFamily: 'Outfit, sans-serif'
            }}>
              When OEM Choice Matters
            </h2>
            <ul style={{
              listStyle: 'none',
              padding: 0
            }}>
              {[
                'Warranty compliance: OEM-branded filters required to maintain manufacturer warranty',
                'Specification matching: OEM filter thread size, mounting style must fit equipment',
                'Service network: OEM filters available at authorized service centers',
                'Immediate availability: OEM supply chain reliable for emergency replacements'
              ].map((item, i) => (
                <li key={i} style={{
                  marginBottom: '1rem',
                  paddingLeft: '1.5rem',
                  position: 'relative',
                  fontSize: '0.95rem',
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.6
                }}>
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    color: '#2196F3'
                  }}>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: 'rgba(76,175,80,0.1)',
              border: '2px solid rgba(76,175,80,0.3)',
              borderRadius: '12px',
              padding: '2rem'
            }}
          >
            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#4caf50',
              marginBottom: '1.5rem',
              fontFamily: 'Outfit, sans-serif'
            }}>
              Where System Engineering Wins
            </h2>
            <ul style={{
              listStyle: 'none',
              padding: 0
            }}>
              {[
                'Contamination control: ISO 16889 Beta ratio and ISO 4406 cleanliness target determines reliability (not brand)',
                'Equipment lifespan: Proper bypass valve, absolute rating, and dirt capacity extend life 3–5× regardless of manufacturer',
                'Downtime prevention: System-level approach prevents cascade failures (brand not relevant)',
                'Total cost: Filter cost is ~3% of TCO; contamination target controls 97% of lifecycle costs'
              ].map((item, i) => (
                <li key={i} style={{
                  marginBottom: '1rem',
                  paddingLeft: '1.5rem',
                  position: 'relative',
                  fontSize: '0.95rem',
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 1.6
                }}>
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    color: '#4caf50'
                  }}>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            padding: '2rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
            marginBottom: '2rem'
          }}
        >
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#FFF12D',
            marginBottom: '1.5rem',
            fontFamily: 'Outfit, sans-serif'
          }}>
            Major Filter Brands: Market Analysis
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              { brand: 'Donaldson', approach: 'OEM + Aftermarket commodity', strength: 'Service network, availability', limitation: 'Minimal contamination engineering' },
              { brand: 'Fleetguard', approach: 'OEM Cummins, aftermarket range', strength: 'Engine-specific specs', limitation: 'Lacks system-level optimization' },
              { brand: 'Mann', approach: 'Premium European aftermarket', strength: 'High dirt capacity, Euro specs', limitation: 'Not integrated with other systems' },
              { brand: 'Wix', approach: 'Performance aftermarket', strength: 'High Beta ratios available', limitation: 'Brand-level decision, not system' },
              { brand: 'Baldwin', approach: 'Industrial equipment OEM', strength: 'Specialized hydraulic filters', limitation: 'Limited cross-system thinking' },
              { brand: 'ELIMFILTERS', approach: 'System-level contamination control', strength: 'ISO contamination targets drive all specs', limitation: 'Requires operational discipline (condition-based maintenance)' }
            ].map((item, i) => (
              <div key={i} style={{
                background: item.brand === 'ELIMFILTERS' ? 'rgba(76,175,80,0.1)' : 'rgba(255,255,255,0.02)',
                border: item.brand === 'ELIMFILTERS' ? '1px solid rgba(76,175,80,0.3)' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: item.brand === 'ELIMFILTERS' ? '#4caf50' : '#FFF12D',
                  marginBottom: '0.75rem'
                }}>
                  {item.brand}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: '0.5rem'
                }}>
                  <strong>Position:</strong> {item.approach}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: '0.5rem'
                }}>
                  <strong style={{ color: '#4caf50' }}>Strength:</strong> {item.strength}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.7)'
                }}>
                  <strong style={{ color: '#f44336' }}>Limitation:</strong> {item.limitation}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
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
            marginBottom: '1.5rem',
            fontFamily: 'Outfit, sans-serif'
          }}>
            ELIMFILTERS Competitive Advantage
          </h2>
          <p style={{
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.8,
            marginBottom: '1.5rem'
          }}>
            ELIMFILTERS does not compete on brand recognition or price. ELIMFILTERS competes on the principle that filtration is a <strong>system problem</strong>, not a product problem. Major brands treat filter selection as a commodity. ELIMFILTERS reverses this: start with contamination target (ISO 4406 cleanliness code) determined by equipment protection requirements, then engineer the filter specification to achieve that target.
          </p>
          <ul style={{
            listStyle: 'none',
            padding: 0
          }}>
            {[
              '✓ Contamination-first design: Target cleanliness drives filter specification, not equipment retrofit',
              '✓ System-level optimization: Air, fuel, hydraulic, lube, cabin systems engineered as integrated protection network',
              '✓ Condition-based triggering: Oil analysis replaces calendar intervals; extends equipment life 3–5×',
              '✓ Verified ROI: 3–6 month payback via downtime prevention + extended maintenance intervals',
              '✓ Industrial knowledge platform: Knowledge System teaches contamination engineering; other brands sell products'
            ].map((item, i) => (
              <li key={i} style={{
                marginBottom: '1rem',
                fontSize: '0.95rem',
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.6
              }}>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </section>
    </main>
  );
}
