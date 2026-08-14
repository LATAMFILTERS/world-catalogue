'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function TotalCostOwnershipPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Back Navigation */}
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

      {/* Hero Section */}
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
              FLEET OPTIMIZATION · ECONOMICS
            </p>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              lineHeight: 1.15,
              marginBottom: '1.5rem',
            }}>
              Total Cost of Ownership Analysis
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.65)',
              maxWidth: '640px',
              textAlign: 'justify',
            }}>
              10-year fleet economics: Commodity filtration approach vs. system-level contamination control. Real-world TCO comparison showing 60%+ cost reduction through asset protection.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        {/* Section 1 */}
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
            01 / COMMODITY APPROACH COSTS (10-YEAR BASELINE)
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Standard OEM Specification Compliance
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            textAlign: 'justify',
            marginBottom: '1.5rem',
          }}>
            Baseline scenario: 10-truck fleet, Cummins QSL9 diesel engines, 200,000 km/year per vehicle (2,000,000 km total per fleet). Commodity approach: purchase standard OEM-specified filters, install, change on OEM schedule, no proactive contamination monitoring or condition-based maintenance.
          </p>
          <div style={{
            background: 'rgba(255,241,45,0.04)',
            border: '1px solid rgba(255,241,45,0.12)',
            borderRadius: '6px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.85rem',
            lineHeight: 1.8,
          }}>
            <div><strong>Filters (air + fuel + oil):</strong></div>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem' }}>
              Change every 10,000 km: 3 filters × $50 = $150/change<br/>
              10 years × 20 changes × $150 = <strong>$30,000</strong>
            </div>
            <br/>
            <div><strong>Oil changes (every 1,000 hrs):</strong></div>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem' }}>
              40 L × $8 = $320/change<br/>
              2,000 changes × $320 = <strong>$640,000</strong>
            </div>
            <br/>
            <div><strong>Engine overhauls (1 every 3 years):</strong></div>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem' }}>
              3 overhauls × $8,500 = <strong>$25,500</strong>
            </div>
            <br/>
            <div><strong>Injector replacements (water/corrosion):</strong></div>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem' }}>
              6 injectors × $1,200 = $7,200<br/>
              3 events × $7,200 = <strong>$21,600</strong>
            </div>
            <br/>
            <div><strong>Bearing/cylinder repairs:</strong></div>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem' }}>
              2–3 events × $5,000 = <strong>$12,500</strong>
            </div>
            <br/>
            <div><strong>Downtime (500–1000 hrs/yr @ $150/hr):</strong></div>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem' }}>
              7,500 hours × $150 = <strong>$1,125,000</strong>
            </div>
            <br/>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              <strong style={{ color: '#FFF12D' }}>TOTAL 10-YEAR COMMODITY COST: $1,834,600</strong>
            </div>
          </div>
        </motion.section>

        {/* Section 2 */}
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
            02 / SYSTEM APPROACH COSTS (10-YEAR OPTIMIZED)
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Asset Protection Through Contamination Control
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            textAlign: 'justify',
            marginBottom: '1.5rem',
          }}>
            System approach: Install premium multi-stage filtration (MACROCORE, SYNTRAX, TURBOCORE), implement ISO 4406 cleanliness targets (16/14/11 for engine lube oil), quarterly contamination monitoring, kidney-loop offline circulation, preventive maintenance based on condition not calendar. Goal: Extend equipment life 50–80%, reduce downtime 80–90%, eliminate unplanned failures.
          </p>
          <div style={{
            background: 'rgba(255,241,45,0.04)',
            border: '1px solid rgba(255,241,45,0.12)',
            borderRadius: '6px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.85rem',
            lineHeight: 1.8,
          }}>
            <div><strong>Premium filters (extended intervals):</strong></div>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem' }}>
              Every 15,000 km: 3 premium filters × $120 = $360<br/>
              10 years × 13 changes × $360 = <strong>$46,800</strong>
            </div>
            <br/>
            <div><strong>Oil changes (extended to 1,500 hrs):</strong></div>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem' }}>
              1,300 changes × $320 = <strong>$416,000</strong>
            </div>
            <br/>
            <div><strong>ISO 4406 monitoring (quarterly):</strong></div>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem' }}>
              $200/test × 40 tests/10 years = <strong>$8,000</strong>
            </div>
            <br/>
            <div><strong>Kidney-loop system:</strong></div>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem' }}>
              Installation: $2,500<br/>
              10 filter changes × $200 = $2,000<br/>
              Total kidney-loop: <strong>$4,500</strong>
            </div>
            <br/>
            <div><strong>Engine overhauls (1 every 7–8 years):</strong></div>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem' }}>
              1.5 overhauls × $8,500 = <strong>$12,750</strong>
            </div>
            <br/>
            <div><strong>Injector replacements (water separator protection):</strong></div>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem' }}>
              0.5 events × $2,400 = <strong>$1,200</strong>
            </div>
            <br/>
            <div><strong>Bearing/cylinder repairs (extended life):</strong></div>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem' }}>
              0.5 events × $5,000 = <strong>$2,500</strong>
            </div>
            <br/>
            <div><strong>Downtime (100–200 hrs/yr @ $150/hr):</strong></div>
            <div style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '1rem' }}>
              1,500 hours × $150 = <strong>$225,000</strong>
            </div>
            <br/>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              <strong style={{ color: '#FFF12D' }}>TOTAL 10-YEAR SYSTEM COST: $716,050</strong>
            </div>
          </div>
        </motion.section>

        {/* Section 3 */}
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
            03 / ROI AND SAVINGS ANALYSIS
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Economic Impact: 10-Year Fleet Lifecycle
          </h2>
          <div style={{
            background: 'rgba(255,241,45,0.04)',
            border: '1px solid rgba(255,241,45,0.12)',
            borderRadius: '6px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.85rem',
            lineHeight: 1.8,
          }}>
            <div><strong>Commodity Approach (Baseline):</strong> $1,834,600</div>
            <div><strong>System Approach (Optimized):</strong> $716,050</div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
              <strong style={{ color: '#FFF12D' }}>TOTAL 10-YEAR SAVINGS: $1,118,550</strong><br/>
              <strong style={{ color: '#FFF12D' }}>REDUCTION: 61% lower total cost of ownership</strong><br/>
              <strong style={{ color: '#FFF12D' }}>PER TRUCK AVERAGE: $111,855 savings</strong><br/>
              <strong style={{ color: '#FFF12D' }}>ROI: $10 invested in system filtration = $160 saved over lifecycle</strong>
            </div>
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            textAlign: 'justify',
          }}>
            The system approach eliminates the three largest cost drivers: unplanned downtime ($900K+ reduction), premature overhauls ($12,750 reduction vs baseline), and component replacement failures ($20K+ reduction). The upfront investment in premium filters, kidney-loop systems, and ISO 4406 monitoring is recovered within 18–24 months and generates $1.1M+ fleet savings over the full lifecycle.
          </p>
        </motion.section>

        {/* Section 4 */}
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
            04 / KEY COST DRIVERS: WHERE SYSTEM APPROACH WINS
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Breakdown of Savings by Category
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
          }}>
            {[
              { title: 'Downtime Reduction', commodity: '$1,125,000', system: '$225,000', savings: '$900,000' },
              { title: 'Engine Overhauls', commodity: '$25,500', system: '$12,750', savings: '$12,750' },
              { title: 'Injector Replacement', commodity: '$21,600', system: '$1,200', savings: '$20,400' },
              { title: 'Bearing/Cylinder Repair', commodity: '$12,500', system: '$2,500', savings: '$10,000' },
              { title: 'Unplanned Maintenance', commodity: '$59,600', system: '$16,450', savings: '$43,150' },
              { title: 'Filter Costs (higher quality)', commodity: '$30,000', system: '$46,800', savings: '−$16,800' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,241,45,0.06)',
                border: '1px solid rgba(255,241,45,0.15)',
                borderRadius: '6px',
                padding: '1rem',
              }}>
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#fff' }}>{item.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
                  Commodity: {item.commodity}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem' }}>
                  System: {item.system}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: item.savings.startsWith('−') ? 'rgba(255,255,255,0.6)' : '#FFF12D'
                }}>
                  Savings: {item.savings}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

      </div>

      {/* Footer Navigation */}
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
          Explore contamination protection systems and operational strategies
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/contamination/particle-wear" style={{
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
            Particle Wear Analysis →
          </Link>
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
        </div>
      </section>
    </main>
  );
}
