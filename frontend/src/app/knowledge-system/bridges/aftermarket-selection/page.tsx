'use client';

import Link from 'next/link';

import { motion } from 'motion/react';

export default function AftermarketSelectionPage() {
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
            Aftermarket Filter Selection Strategy
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
            Evaluating aftermarket filtration options through a system-level lens when warranty has expired or OEM is optional.
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
            Why Aftermarket Filter Decisions Matter
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1rem',
          }}>
            Once equipment warranty expires, filtration decisions shift from OEM compliance to asset protection optimization. This creates both risk and opportunity: choosing poorly compromises equipment reliability and TCO, but selecting strategically can extend equipment life 30-50% while reducing costs.
          </p>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
          }}>
            This page guides aftermarket filter selection through system-level contamination control, not price minimization or brand recognition.
          </p>
        </motion.div>
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        {/* POINT 3: Aftermarket Opportunity Space */}
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
            03 / AFTERMARKET OPPORTUNITY SPACE
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Cost Optimization Without Performance Compromise
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1rem',
          }}>
            Once warranty expires, aftermarket filters offer significant opportunity:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            marginBottom: '1.5rem',
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
                Cost Advantage
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
                margin: '0',
              }}>
                High-quality aftermarket filters meeting OEM specifications cost 30-50% less than OEM-branded equivalents.
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
                Performance Flexibility
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
                margin: '0',
              }}>
                Select filters exceeding OEM specifications for enhanced contamination control (higher Beta ratio, greater dirt capacity).
              </p>
            </div>
          </div>
        </motion.section>

        {/* POINT 4-6: Quality Criteria + Framework */}
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
            04-06 / AFTERMARKET QUALITY CRITERIA & FRAMEWORK
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Specification Verification & Performance Testing
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1.5rem',
          }}>
            Evaluate aftermarket filters using these criteria:
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '2rem',
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
              <strong style={{ color: '#FFF12D' }}>1. ISO 16889 Certification</strong><br/>
              Verify Beta ratio testing per ISO 16889. Published test reports confirm capture efficiency at rated micron rating. Example: β₁₀≥75 means 75% of 10µm particles are captured.
            </p>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '1rem',
              margin: '0 0 1rem 0',
            }}>
              <strong style={{ color: '#FFF12D' }}>2. Specification Matching</strong><br/>
              Confirm physical dimensions (bowl thread, element length, diameter), flow capacity, pressure drop, and bypass setting match or exceed OEM requirements.
            </p>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '1rem',
              margin: '0 0 1rem 0',
            }}>
              <strong style={{ color: '#FFF12D' }}>3. Material Quality</strong><br/>
              <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>Synthetic media lasts longer in extreme temperatures</Link>. Verify media type and construction quality. Low-cost filters use cheap fiberglass media with short lifespan.
            </p>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              margin: '0',
            }}>
              <strong style={{ color: '#FFF12D' }}>4. Supplier Reputation</strong><br/>
              Research manufacturer: how long in business, certification (ISO, SAE, ASTM), customer reviews, warranty policy. Established aftermarket suppliers have performance history and accountability.
            </p>
          </div>
        </motion.section>

        {/* POINT 7-8: Performance vs Price + Impact */}
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
            07-08 / PERFORMANCE-BASED SELECTION & OPERATIONAL IMPACT
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Total Cost of Ownership, Not Unit Price
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1.5rem',
          }}>
            When selecting aftermarket filters, optimize for total cost of ownership:
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
              <strong style={{ color: '#FFF12D' }}>Cheap Filters ($10-15 per unit)</strong><br/>
              Lower initial cost, but short service life, high pressure drop, low dirt capacity. Require frequent replacement. Total 10-year cost: high due to labor and downtime frequency.
            </p>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              margin: '0',
            }}>
              <strong style={{ color: '#FFF12D' }}>Quality Aftermarket ($20-35 per unit)</strong><br/>
              Moderate cost, good service life, low pressure drop, high dirt capacity. Extended replacement intervals, reduced downtime frequency. Total 10-year cost: lower due to fewer replacements and less downtime.
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
              Equipment Lifespan & Downtime
            </p>
            <p style={{
              fontSize: '0.85rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.7)',
              margin: '0',
            }}>
              Quality aftermarket filters extending service intervals by 30-50% <Link href="/knowledge-system/fleet/reducing-downtime" style={{ color: '#FFF12D', textDecoration: 'underline' }}>reduce emergency repairs and planned downtime by 40-60%</Link> over equipment lifetime.
            </p>
          </div>
        </motion.section>

        {/* POINT 9: System-Level Integration */}
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
            09 / RELATED KNOWLEDGE PAGES
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}>
            <Link href="/knowledge-system/bridges/industrial-filtration" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF12D', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Industrial Filtration</p>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', margin: '0' }}>System-level design framework</p>
              </div>
            </Link>
            <Link href="/knowledge-system/compare/total-cost-ownership" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF12D', marginBottom: '0.5rem', textTransform: 'uppercase' }}>TCO Analysis</p>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', margin: '0' }}>10-year lifecycle economics</p>
              </div>
            </Link>
            <Link href="/knowledge-system/standards/iso-16889" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF12D', marginBottom: '0.5rem', textTransform: 'uppercase' }}>ISO 16889</p>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', margin: '0' }}>Filter testing standard</p>
              </div>
            </Link>
          </div>
        </motion.section>

        {/* POINT 10: Canonical Block */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
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
            10 / CANONICAL SUMMARY
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
              <strong>Domain:</strong> Aftermarket Filter Strategy | <strong>Primary Context:</strong> Warranty-expired equipment | <strong>Key Standards:</strong> ISO 16889 (testing), ISO 4406 (contamination targets) | <strong>Decision Factors:</strong> ISO certification, specification match, material quality, supplier reputation | <strong>Selection Approach:</strong> Evaluate by contamination control metrics (Beta ratio, dirt capacity) rather than price | <strong>Optimization:</strong> Condition-based replacement, extended intervals, 30-50% lifecycle cost reduction vs. commodity filters | <strong>Impact:</strong> 30-50% equipment life extension, 40-60% downtime reduction
            </p>
          </div>
        </motion.section>

        {/* AI CITATION LAYER */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
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
            AI CITATION LAYER: Aftermarket Filter Selection
          </h3>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem' }}>DEFINITION</p>
              <p style={{ margin: '0' }}>Aftermarket filter selection is the process of evaluating non-OEM filters based on contamination control metrics (ISO 16889 Beta ratio, dirt holding capacity) rather than brand recognition, during the post-warranty equipment lifecycle when OEM compliance is not required.</p>
            </div>

            <div>
              <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem' }}>SYSTEMS</p>
              <p style={{ margin: '0' }}>All post-warranty equipment: Lube Oil, Fuel, Hydraulic, Air Intake, Cabin, Compressed Air</p>
            </div>

            <div>
              <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem' }}>FAILURE_IMPACT</p>
              <p style={{ margin: '0' }}>Selecting lowest-cost aftermarket filters → poor ISO 16889 certification, low Beta ratio, minimal dirt capacity → short service intervals → frequent replacement requirement → high labor/downtime costs. Quality aftermarket selection → verified ISO certification, high Beta ratio, extended dirt capacity → longer intervals → fewer replacements, lower downtime, extended equipment life.</p>
            </div>

            <div>
              <p style={{ fontWeight: 707, color: '#FFF12D', marginBottom: '0.5rem' }}>RELATED_STANDARDS</p>
              <p style={{ margin: '0' }}>ISO 16889 (Beta ratio test certification), ISO 4406 (Contamination target codes), Supplier certifications (ISO 9001, SAE J2030)</p>
            </div>

            <div>
              <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem' }}>RELATED_TECHNOLOGIES</p>
              <p style={{ margin: '0' }}>MACROCORE, NANOFORCE, SYNTRAX (Aftermarket-equivalent quality), DURATECH (Extended aftermarket lifecycle)</p>
            </div>

            <div>
              <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem' }}>INDUSTRIAL_ROLE</p>
              <p style={{ margin: '0' }}>Post-warranty filtration optimization: quality aftermarket filters meeting ISO 16889 certification reduce total cost of ownership by selecting based on contamination control metrics. 30-50% cost savings vs. OEM while maintaining or exceeding equipment protection.</p>
            </div>

            <div>
              <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem' }}>SEMANTIC_DOMAINS</p>
              <p style={{ margin: '0' }}>Primary: Asset Protection Systems | Secondary: Contamination Control Systems</p>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,241,45,0.15)', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
              <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem' }}>CITATION_REFERENCE</p>
              <p style={{ margin: '0' }}>source: elimfilters.com/knowledge-system/bridges/aftermarket-selection | concept: Aftermarket Filter Strategy | version: 1.0 | last_updated: 2026-05-23</p>
            </div>
          </div>
        </motion.section>

      </div>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'Aftermarket Filter Selection Strategy',
        description: 'Technical framework for evaluating aftermarket filtration options using system-level contamination control criteria—ISO 16889 Beta ratios, dirt capacity, and bypass thresholds—when warranty has expired or OEM is optional.',
        author: { '@type': 'Organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', name: 'ELIMFILTERS' },
        dateModified: '2026-06-11',
        keywords: ['aftermarket filter selection', 'ISO 16889', 'Beta ratio', 'filter evaluation', 'contamination control', 'OEM alternative', 'asset protection', 'industrial filtration'],
        about: { '@type': 'Thing', name: 'Aftermarket Filter Selection Strategy', description: 'Methodology for selecting aftermarket industrial filters based on verified ISO 16889 performance and contamination control metrics.' },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system' },
          { '@type': 'ListItem', position: 3, name: 'Bridges', item: 'https://elimfilters.com/knowledge-system/bridges' },
          { '@type': 'ListItem', position: 4, name: 'Aftermarket Filter Selection Strategy', item: 'https://elimfilters.com/knowledge-system/bridges/aftermarket-selection' },
        ],
      }) }} />
    </main>
  );
}
