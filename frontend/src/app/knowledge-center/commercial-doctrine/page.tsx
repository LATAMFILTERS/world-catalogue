'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const SEGMENTS = [
  {
    id: 'HD',
    label: 'Heavy Duty',
    role: 'Primary profitability engine',
    allocation: '80%',
    target: '7%–10% market share',
    sectors: ['Mining', 'Construction', 'Agriculture', 'Transportation Fleets', 'Oil & Gas', 'Power Generation', 'Marine', 'Railway', 'Waste Municipal', 'Industrial Manufacturing'],
    objectives: ['Profitability', 'Strategic Account Development', 'Technology Deployment', 'Asset Protection Programs', 'Industrial Market Penetration'],
  },
  {
    id: 'LD',
    label: 'Light Duty',
    role: 'Primary market participation engine',
    allocation: '20%',
    target: 'Min. 8% regional participation',
    sectors: ['Passenger Vehicles', 'Pickup Trucks', 'SUVs', 'Light Commercial Vehicles', 'Government Fleets', 'Corporate Fleets', 'Service Centers'],
    objectives: ['Market Participation', 'Distributor Expansion', 'Regional Presence', 'Commercial Intelligence', 'Brand Visibility'],
  },
];

const PROTECTION_SYSTEMS = [
  'Air Intake Protection',
  'Fuel Cleanliness Protection',
  'Lubrication Protection',
  'Hydraulic Protection',
  'Cooling System Protection',
  'Cabin Air Protection',
  'Air Dryer Protection',
];

const STRATEGIC_ACCOUNTS = [
  'Mining Companies',
  'Power Generation Operators',
  'Oil & Gas Operators',
  'Railway Operators',
  'Port Authorities',
  'Airport Operators',
  'National Transportation Fleets',
  'Industrial Manufacturing Groups',
];

const METRICS = [
  'Revenue (HD and LD separately)',
  'Gross Margin',
  'Heavy Duty Market Share',
  'Light Duty Market Share',
  'Protected Assets',
  'Asset Protection Penetration',
  'Strategic Accounts',
  'Distributor Coverage',
  'Customer Retention',
  'Inventory Turnover',
  'Commercial Intelligence Coverage',
];

export default function CommercialDoctrinePage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.875rem clamp(1.5rem, 4vw, 4rem)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/knowledge-center" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Knowledge Center</Link>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>›</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>Commercial Doctrine</span>
        </div>
      </div>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #080808 0%, #000 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: '#FFF12D', marginBottom: '1rem' }}>
            COMMERCIAL DOCTRINE · v1.0 · 2026-06-28
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Market Architecture &<br />Profitability Strategy
          </motion.h1>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.15 }}
            style={{
              borderLeft: '3px solid #FFF12D',
              paddingLeft: '1.5rem',
              marginBottom: '2rem',
            }}>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: '1.1rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.85)' }}>
              ELIMFILTERS operates as an Asset Protection Company focused on contamination control across critical mechanical systems.
            </p>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 400, fontSize: '1rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.55)', marginTop: '0.75rem' }}>
              Products are components of the solution. Asset Protection is the business.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)' }}>

        {/* Market Architecture */}
        <section style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>
            01 / MARKET ARCHITECTURE
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
            {SEGMENTS.map((seg, i) => (
              <motion.div
                key={seg.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                style={{ background: '#000', padding: '2rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.25rem' }}>{seg.id}</p>
                    <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.4rem', color: '#fff' }}>{seg.label}</h2>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>{seg.role}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '2.5rem', color: '#FFF12D', lineHeight: 1 }}>{seg.allocation}</p>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>RESOURCES</p>
                  </div>
                </div>

                <div style={{ display: 'inline-block', background: 'rgba(255,241,45,0.08)', border: '1px solid rgba(255,241,45,0.2)', padding: '0.35rem 0.75rem', marginBottom: '1.5rem' }}>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#FFF12D' }}>TARGET: {seg.target}</p>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)', marginBottom: '0.5rem' }}>TARGET SECTORS</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {seg.sectors.map((s) => (
                      <span key={s} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '0.2rem 0.5rem' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)', marginBottom: '0.5rem' }}>PRIMARY OBJECTIVES</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {seg.objectives.map((o) => (
                      <p key={o} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', paddingLeft: '0.75rem', borderLeft: '2px solid rgba(255,241,45,0.25)' }}>
                        {o}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Profitability Doctrine */}
        <section style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>
            02 / PROFITABILITY DOCTRINE
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}>
            {[
              ['Heavy Duty generates', 'Profitability'],
              ['Light Duty generates', 'Market Participation'],
              ['Heavy Duty creates', 'Technical Depth'],
              ['Light Duty creates', 'Geographic Reach'],
              ['Heavy Duty secures', 'Strategic Accounts'],
              ['Light Duty strengthens', 'Distribution Networks'],
            ].map(([label, value]) => (
              <motion.div key={value}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                style={{ background: '#000', padding: '1.25rem 1.5rem' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.25rem' }}>{label}</p>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1rem', color: '#fff' }}>{value}</p>
              </motion.div>
            ))}
          </div>

          <div style={{
            marginTop: '1.5rem',
            padding: '1.25rem 1.75rem',
            border: '1px solid rgba(255,241,45,0.15)',
            background: 'rgba(255,241,45,0.02)',
          }}>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: '0.95rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
              Both segments are required for sustainable growth. Neither segment shall be evaluated using the same performance criteria.
            </p>
          </div>
        </section>

        {/* Asset Protection Penetration */}
        <section style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem' }}>
            03 / ASSET PROTECTION PENETRATION
          </p>

          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            lineHeight: 1.75,
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '1.5rem',
            maxWidth: '640px',
            textAlign: 'justify',
          }}>
            The primary economic unit of ELIMFILTERS is the Protected Asset. The objective is not to sell a single product — it is to expand protection coverage across multiple critical systems within the same asset. Higher system penetration increases retention, technical integration, and long-term profitability.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
            {PROTECTION_SYSTEMS.map((sys, i) => (
              <motion.div key={sys}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}
                style={{
                  border: '1px solid rgba(255,255,255,0.07)',
                  padding: '0.875rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: '#FFF12D', opacity: 0.6 }}>0{i + 1}</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>{sys}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Distribution + Strategic Accounts */}
        <section style={{ marginBottom: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.25rem' }}>
              04 / DISTRIBUTION MODEL
            </p>
            <div style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '1.75rem' }}>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.05rem', color: '#fff', marginBottom: '0.5rem' }}>
                Distributors are regional extensions of the organization.
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginBottom: '1.25rem', textAlign: 'justify' }}>
                Selection is not based on purchase volume. Selection prioritizes asset access, industry access, technical capability, and long-term growth potential.
              </p>
              <div style={{ borderTop: '1px solid rgba(255,241,45,0.15)', paddingTop: '1rem' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#FFF12D', fontStyle: 'italic' }}>
                  "A strategic distributor is defined by access to assets, not by the number of filters sold."
                </p>
              </div>
            </div>
          </div>

          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.25rem' }}>
              05 / STRATEGIC ACCOUNTS
            </p>
            <div style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '1.75rem' }}>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.05rem', color: '#fff', marginBottom: '1rem' }}>
                Highest-value customer segment.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {STRATEGIC_ACCOUNTS.map((acc) => (
                  <p key={acc} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', paddingLeft: '0.75rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                    {acc}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Success Metrics */}
        <section style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem' }}>
            06 / SUCCESS METRICS
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.4rem' }}>
            {METRICS.map((m, i) => (
              <div key={m} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '0.75rem 1rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
              }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: 'rgba(255,241,45,0.4)' }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>{m}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Governance Note */}
        <section style={{
          background: 'rgba(255,241,45,0.03)',
          border: '1px solid rgba(255,241,45,0.12)',
          padding: '2rem',
          marginBottom: '2rem',
        }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'rgba(255,241,45,0.5)', marginBottom: '0.75rem' }}>
            DOCTRINE GOVERNANCE
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', textAlign: 'justify' }}>
            This document establishes the commercial doctrine of ELIMFILTERS. The principles herein govern market prioritization, resource allocation, distribution development, strategic account acquisition, commercial intelligence, and profitability objectives. Amendments require explicit authorization and formal version update. All commercial strategies, content, digital assets, and go-to-market activities shall be consistent with these principles.
          </p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', marginTop: '1rem' }}>
            Source: elimfilters-vault/10-commercial/MARKET_ARCHITECTURE_AND_PROFITABILITY_STRATEGY.md · v1.0 · 2026-06-28
          </p>
        </section>

        {/* Cross-links */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/knowledge-center/systems" style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
              style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '0.75rem 1.25rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', transition: 'border-color 0.2s' }}>
              PROTECTION SYSTEMS →
            </motion.div>
          </Link>
          <Link href="/knowledge-center/industries" style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
              style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '0.75rem 1.25rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', transition: 'border-color 0.2s' }}>
              INDUSTRY PROFILES →
            </motion.div>
          </Link>
          <Link href="/knowledge-center/engineering" style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
              style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '0.75rem 1.25rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', transition: 'border-color 0.2s' }}>
              ENGINEERING REFERENCE →
            </motion.div>
          </Link>
        </div>
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'Market Architecture and Profitability Strategy — ELIMFILTERS Commercial Doctrine',
        description: 'ELIMFILTERS commercial doctrine defining market architecture, resource allocation, distribution model, and asset protection strategy across Heavy Duty and Light Duty segments.',
        url: 'https://elimfilters.com/knowledge-center/commercial-doctrine',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        about: { '@type': 'Thing', name: 'Industrial Asset Protection Strategy', description: 'Commercial framework for contamination control across critical mechanical systems.' },
      })}} />
    </main>
  );
}
