'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const COMPETITIVE_ANALYSIS = [
  {
    category: 'Strategic Competitive Analysis Framework',
    points: [
      'Identify competitor strengths and weaknesses systematically',
      'Map market positioning against industry standards',
      'Evaluate pricing strategy and value proposition',
      'Assess distribution networks and partnerships',
      'Monitor technology differentiation factors'
    ]
  },
  {
    category: 'Market Trends & Growth Drivers',
    points: [
      'Global filtration market growth driven by urbanization',
      'Strict environmental regulations increasing compliance demand',
      'Shift toward predictive maintenance and condition-based monitoring',
      'Rising equipment reliability requirements in critical industries',
      'Contamination control becoming premium feature, not commodity'
    ]
  },
  {
    category: 'Technology Comparison: Advanced vs Conventional',
    points: [
      'Advanced elements (INDRO-type designs) show 40-60% durability improvement',
      'Flow efficiency gains of 25-35% with optimized media',
      'Dirt holding capacity increases 50-80% with modern designs',
      'Pressure drop reduction improves fuel efficiency 8-12%',
      'Extended service intervals reduce total cost of ownership'
    ]
  }
];

const MARKET_OPPORTUNITIES = [
  { segment: 'Heavy-Duty Fleets', size: '€8.2B global', opportunity: 'TCO education, ROI calculators' },
  { segment: 'Construction & Mining', size: '€3.5B global', opportunity: 'Durability in harsh environments, case studies' },
  { segment: 'Industrial Manufacturing', size: '€2.1B global', opportunity: 'Predictive analytics, system integration' },
  { segment: 'Marine & Power Generation', size: '€2.8B global', opportunity: 'Specialized systems, compliance support' }
];

export default function CompetitiveIntelligencePage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Back Navigation */}
      <Link
        href="/knowledge-system/market"
        style={{
          display: 'inline-block',
          margin: '2rem',
          color: '#FFF12D',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        ← MARKET ANALYSIS
      </Link>

      {/* Hero Section */}
      <section
        style={{
          padding: 'clamp(2rem, 5vw, 4rem)',
          background: 'linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(255,241,45,0.05) 100%)',
          borderBottom: '2px solid rgba(255,241,45,0.15)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(255,241,45,0.7)', marginBottom: '1rem' }}>
            // MARKET INTELLIGENCE · COMPETITIVE ANALYSIS
          </p>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              margin: '0 0 1rem 0',
              fontFamily: 'Outfit, sans-serif',
              lineHeight: 1.2,
            }}
          >
            Strategic Competitive Intelligence
          </h1>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '700px',
              lineHeight: 1.6,
            }}
          >
            Competitive analysis framework, market trends analysis, and technology comparison data for industrial filtration systems.
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 4rem) 2rem' }}>

        {/* Section 1: Industrial Context */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ marginBottom: '3rem' }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              color: '#FFF12D',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            01 / Industrial Market Context
          </p>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'justify',
            }}
          >
            The global filtration market operates within interconnected forces: strict environmental regulations driving compliance requirements, urbanization increasing equipment density in concentrated areas, and industrial asset reliability becoming business-critical as downtime costs accelerate. Equipment manufacturers and fleet operators face recurring decision points about filtration strategy. Understanding competitive positioning, market growth drivers, and technology differentiation enables strategic filtration decisions that optimize both immediate costs and long-term asset protection.
          </p>
        </motion.section>

        {/* Section 2: Competitive Analysis Framework */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ marginBottom: '3rem' }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              color: '#FFF12D',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            02 / Competitive Analysis Framework
          </p>

          <div style={{ background: 'rgba(255,241,45,0.03)', border: '1px solid rgba(255,241,45,0.1)', borderRadius: '8px', padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#FFF12D', marginBottom: '1.5rem', fontFamily: 'Outfit, sans-serif' }}>
              Step-by-Step Competitive Assessment
            </h3>
            <ol style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.8)', paddingLeft: '1.5rem' }}>
              {COMPETITIVE_ANALYSIS[0].points.map((point, idx) => (
                <li key={idx} style={{ marginBottom: '0.5rem' }}>{point}</li>
              ))}
            </ol>
          </div>

          <div style={{ background: 'rgba(255,241,45,0.03)', border: '1px solid rgba(255,241,45,0.1)', borderRadius: '8px', padding: '2rem' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#FFF12D', marginBottom: '1.5rem', fontFamily: 'Outfit, sans-serif' }}>
              Key Evaluation Criteria
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {['Market Share & Scale', 'Technology Differentiation', 'Pricing Strategy', 'Distribution Networks', 'Technical Support', 'Standards Compliance'].map((criterion) => (
                <div key={criterion} style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '4px', borderLeft: '3px solid rgba(255,241,45,0.3)' }}>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', margin: 0 }}>{criterion}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Section 3: Market Trends */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ marginBottom: '3rem' }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              color: '#FFF12D',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            03 / Market Trends & Growth Drivers
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {COMPETITIVE_ANALYSIS[1].points.map((trend, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + idx * 0.08 }}
                style={{
                  background: 'rgba(255,241,45,0.03)',
                  border: '1px solid rgba(255,241,45,0.15)',
                  borderRadius: '6px',
                  padding: '1.5rem',
                  borderLeft: '4px solid rgba(255,241,45,0.4)',
                }}
              >
                <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.6 }}>
                  {trend}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Section 4: Technology Comparison */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ marginBottom: '3rem' }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              color: '#FFF12D',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            04 / Advanced vs Conventional Filter Technology
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,241,45,0.3)' }}>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace' }}>Characteristic</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace' }}>Conventional</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace' }}>Advanced (INDRO-type)</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace' }}>Advantage</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { char: 'Element Durability', conv: '8,000-12,000 hrs', adv: '20,000-28,000 hrs', gain: '+40-60%' },
                  { char: 'Flow Efficiency', conv: 'Baseline', adv: '+25-35% improvement', gain: '25-35%' },
                  { char: 'Dirt Holding Capacity', conv: '100% baseline', adv: '150-180% baseline', gain: '+50-80%' },
                  { char: 'Pressure Drop', conv: 'Baseline', adv: '-8-12% reduction', gain: 'Fuel efficiency' },
                  { char: 'Service Intervals', conv: '500-1000 hrs', adv: '1500-2500 hrs', gain: '+40-60%' },
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,241,45,0.1)' }}>
                    <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.8)' }}>{row.char}</td>
                    <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.6)' }}>{row.conv}</td>
                    <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.8)' }}>{row.adv}</td>
                    <td style={{ padding: '1rem', color: '#FFF12D', fontWeight: 600 }}>{row.gain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Section 5: Market Opportunities */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ marginBottom: '3rem' }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              color: '#FFF12D',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            05 / Segmentation & Market Opportunities
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {MARKET_OPPORTUNITIES.map((opp, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + idx * 0.08 }}
                style={{
                  background: 'rgba(255,241,45,0.03)',
                  border: '1px solid rgba(255,241,45,0.15)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                }}
              >
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>
                  {opp.segment}
                </p>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', margin: '0 0 0.75rem 0' }}>
                  <strong>Market Size:</strong> {opp.size}
                </p>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,241,45,0.8)', margin: 0 }}>
                  <strong>Opportunity:</strong> {opp.opportunity}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Section 6: Strategic Implications */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{ marginBottom: '3rem' }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              color: '#FFF12D',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            06 / Strategic Positioning for ELIMFILTERS
          </p>

          <div style={{ background: 'rgba(255,241,45,0.05)', border: '2px solid rgba(255,241,45,0.2)', borderRadius: '8px', padding: '2rem' }}>
            <ul style={{ lineHeight: 1.9, color: 'rgba(255,255,255,0.8)', paddingLeft: '1.5rem', margin: 0 }}>
              <li><strong>NOT</strong> competing on commodity price or distribution scale</li>
              <li><strong>COMPETE</strong> on technical education, system-level contamination control, and documented asset protection</li>
              <li><strong>TARGET</strong> segments where TCO and equipment reliability are decision drivers (fleets, mining, industrial)</li>
              <li><strong>DIFFERENTIATE</strong> via Knowledge System (263+ pages), ROI calculators, technical standards compliance verification</li>
              <li><strong>BUILD</strong> thought leadership in contamination control as asset protection, not filtration as commodity</li>
              <li><strong>MEASURE</strong> success via customer equipment lifespan extension (30-50%), downtime reduction (60-80%), TCO optimization</li>
            </ul>
          </div>
        </motion.section>

        {/* Section 7: Internal Knowledge Links */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          style={{ marginBottom: '3rem' }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              color: '#FFF12D',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            07 / Related Knowledge
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { text: 'Standards Domain Pages', href: '/knowledge-center/standards/' },
              { text: 'Total Cost of Ownership Analysis', href: '/knowledge-center/fleet-optimization/total-cost-ownership/' },
              { text: 'Technology Comparison', href: '/technologies/' },
              { text: 'Market Projections 2026-2031', href: '/knowledge-center/' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '1rem',
                  background: 'rgba(255,241,45,0.05)',
                  border: '1px solid rgba(255,241,45,0.15)',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: '#FFF12D',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                }}
              >
                ↗ {link.text}
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Canonical Knowledge Block */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          style={{
            background: 'rgba(255,241,45,0.05)',
            border: '2px solid rgba(255,241,45,0.25)',
            borderRadius: '8px',
            padding: '2rem',
            marginTop: '4rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.85rem',
          }}
        >
          <h3 style={{ color: '#FFF12D', marginBottom: '1rem' }}>
            CANONICAL KNOWLEDGE BLOCK: Competitive Intelligence
          </h3>

          <div style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
            <p>
              <strong>DEFINITION</strong><br />
              Strategic competitive intelligence combines systematic analysis of competitor positioning, market trend evaluation, and technology comparison to inform industrial filtration purchasing decisions and corporate strategy.
            </p>

            <p>
              <strong>INDUSTRIAL_ROLE</strong><br />
              Competitive analysis enables equipment purchasers and maintenance managers to position their filtration strategy within market context, evaluate vendor differentiation claims against standards, and optimize purchasing decisions for both capital cost and long-term asset protection objectives.
            </p>

            <p>
              <strong>CITATION_REFERENCE</strong><br />
              source: elimfilters.com/knowledge-system/market/competitive-intelligence<br />
              concept: Strategic Competitive Intelligence and Market Analysis<br />
              version: 1.0<br />
              last_updated: 2026-08-03<br />
              data_sources: 9 industry sources (Strategic Marketing Intelligence, Filtration Market Trends, Technology Comparison Analysis)
            </p>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
