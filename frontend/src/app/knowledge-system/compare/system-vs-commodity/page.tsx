'use client';

import Link from 'next/link';

import { motion } from 'motion/react';

export default function SystemVsCommodityPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      <Link href="/knowledge-system/compare"
        className="back-nav-btn" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← COMPARISON</Link>

      {/* Hero Section */}
      <section style={{
        paddingTop: '5rem',
        paddingBottom: '5rem',
        background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,0,0,0.3) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
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
              textAlign: 'justify',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            System vs Commodity Filtration
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
              lineHeight: 1.7,
              textAlign: 'justify',
              color: 'rgba(255,255,255,0.75)',
              fontFamily: 'Titillium Web, sans-serif',
              maxWidth: '700px',
              borderLeft: '3px solid #FFF12D',
              paddingLeft: '1.25rem',
            }}
          >
            Why filtration performance is a system design problem, not a product commodity selection problem.
          </motion.p>
        </div>
      </section>

      {/* Content Sections */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ marginBottom: '4rem' }}
        >

          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
            }}>
            How Filtration Became a Fungible Product
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            textAlign: 'justify',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1rem',
          }}>
            For decades, industrial filtration has been treated as a commodity product. Purchase decisions center on:
          </p>
          <ul style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            textAlign: 'justify',
            color: 'rgba(255,255,255,0.7)',
            marginLeft: '1.5rem',
            marginBottom: '1rem',
          }}>
            <li style={{ marginBottom: '0.75rem' }}>Brand recognition (Donaldson, Fleetguard, Mann, Wix, Baldwin)</li>
            <li style={{ marginBottom: '0.75rem' }}>OEM specification alignment (matching the original equipment manufacturer requirement)</li>
            <li style={{ marginBottom: '0.75rem' }}>Price per unit (cost minimization competitive bidding)</li>
            <li style={{ marginBottom: '0.75rem' }}>Replacement interval (all brands claim similar service hours)</li>
          </ul>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            textAlign: 'justify',
            color: 'rgba(255,255,255,0.7)',
          }}>
            In this model, filter performance is binary: it either meets OEM specifications or it doesn't. All compliant filters are treated as functionally equivalent. Equipment reliability is assumed to flow automatically from OEM specification compliance.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{ marginBottom: '4rem' }}
        >

          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
            }}>
            Equipment Performance Depends on Contamination Control
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            textAlign: 'justify',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1rem',
          }}>
            OEM specification compliance is a minimum floor, not a performance ceiling. Two vehicles, two hydraulic systems, or two compressed air networks can both use OEM-compliant filters while experiencing dramatically different equipment reliability based on how well contamination is actually controlled.
          </p>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            textAlign: 'justify',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1rem',
          }}>
            Real-world equipment failure is not caused by filter brand choice. It is caused by contamination entering the system because:
          </p>
          <ul style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            textAlign: 'justify',
            color: 'rgba(255,255,255,0.7)',
            marginLeft: '1.5rem',
            marginBottom: '1rem',
          }}>
            <li style={{ marginBottom: '0.75rem' }}>Bypass conditions occur (filter pressure differential exceeds pressure relief valve setting)</li>
            <li style={{ marginBottom: '0.75rem' }}>Contamination enters through multiple unfiltered pathways (air leaks, crankcase ventilation, cabin inlets)</li>
            <li style={{ marginBottom: '0.75rem' }}>Service intervals are extended beyond actual contamination loads</li>
            <li style={{ marginBottom: '0.75rem' }}>Single-point failure of one filter system compromises the entire protected circuit</li>
            <li style={{ marginBottom: '0.75rem' }}>Filter specifications are matched to component protection, not to actual contamination challenge</li>
          </ul>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            textAlign: 'justify',
            color: 'rgba(255,255,255,0.7)',
          }}>
            Equipment reliability is determined by the effectiveness of the total contamination control system, not by which branded filter element is installed. Understanding <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>industrial filtration as an integrated system</Link> is the prerequisite for moving beyond commodity thinking.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ marginBottom: '4rem' }}
        >

          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
            }}>
            From Product Selection to System Design
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            textAlign: 'justify',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1rem',
          }}>
            System-level filtration design addresses all contamination pathways:
          </p>
          <div style={{
            background: 'rgba(255,241,45,0.06)',
            border: '1px solid rgba(255,241,45,0.15)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1rem',
          }}>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', margin: '0.5rem 0' }}>
              <strong style={{ color: '#FFF12D' }}>Air Intake Filtration:</strong> Prevents particle ingestion through engine/compressor intake—reduces wear rate by 50-80% vs. bypass conditions.
            </p>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', margin: '0.5rem 0' }}>
              <strong style={{ color: '#FFF12D' }}>Fuel Filtration:</strong> Removes water and particulates before injectors—prevents stiction (sticky needle syndrome) affecting 15-40% fuel consumption increase.
            </p>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', margin: '0.5rem 0' }}>
              <strong style={{ color: '#FFF12D' }}>Lube Oil Filtration:</strong> Maintains ISO 16/14/11 cleanliness—extends component life 3-5x vs. contaminated condition.
            </p>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', margin: '0.5rem 0' }}>
              <strong style={{ color: '#FFF12D' }}>Hydraulic Filtration:</strong> Protects proportional valves at 6-10 microns—prevents varnish formation (20-50% efficiency loss).
            </p>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', margin: '0.5rem 0' }}>
              <strong style={{ color: '#FFF12D' }}>Cabin Filtration:</strong> Controls PM10/PM2.5 operator exposure—meets ISO 11155 and DIN 71220 health standards.
            </p>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', margin: '0.5rem 0' }}>
              <strong style={{ color: '#FFF12D' }}>Compressed Air Filtration:</strong> Achieves ISO 8573-1 purity classes—prevents instrument malfunction and corrosion.
            </p>
          </div>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            textAlign: 'justify',
            color: 'rgba(255,255,255,0.7)',
          }}>
            Each system is designed around specific contamination challenges and measurement standards, with <Link href="/knowledge-system/standards/iso-16889" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 16889 Beta Ratio testing</Link> providing the core measurement basis for evaluating how well any filter actually controls contamination. The filter product is an implementation detail, not the strategy.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          style={{ marginBottom: '4rem' }}
        >

          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
            }}>
            Why OEM Spec Compliance ≠ Equipment Reliability
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
            gap: '2rem',
            marginBottom: '2rem',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
              }}>
                Commodity Approach
              </p>
              <ul style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                textAlign: 'justify',
                color: 'rgba(255,255,255,0.6)',
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}>
                <li style={{ marginBottom: '0.5rem' }}>✓ Filter meets OEM specification</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Installed at OEM-specified interval</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Price minimized through competition</li>
                <li style={{ marginBottom: '0.5rem' }}>✗ Contamination control = binary (yes/no)</li>
                <li style={{ marginBottom: '0.5rem' }}>✗ No measurement of actual cleanliness</li>
                <li style={{ marginBottom: '0.5rem' }}>✗ No system-level optimization</li>
              </ul>
            </div>
            <div style={{
              background: 'rgba(255,241,45,0.08)',
              border: '1px solid rgba(255,241,45,0.2)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
              }}>
                System Approach (ELIMFILTERS)
              </p>
              <ul style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                textAlign: 'justify',
                color: 'rgba(255,255,255,0.7)',
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}>
                <li style={{ marginBottom: '0.5rem' }}>✓ Filter meets OEM specification</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Installed at contamination-based interval</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Total cost of ownership optimized</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Contamination control = measurable target (ISO code)</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Particle counts verify cleanliness</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ System integration across all domains</li>
              </ul>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >

          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
            }}>
            The Cost of Commodity Thinking
          </h2>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(255,0,0,0.03) 100%)',
            border: '1px solid rgba(255,241,45,0.15)',
            borderRadius: '8px',
            padding: '2rem',
          }}>
            <p style={{
              fontSize: '1rem',
              lineHeight: 1.8,
              textAlign: 'justify',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '1rem',
            }}>
              When filtration is treated as a commodity, organizations accept preventable equipment failures. The <Link href="/knowledge-system/fleet/reducing-downtime" style={{ color: '#FFF12D', textDecoration: 'underline' }}>fleet downtime reduction framework</Link> quantifies the operational and cost consequences of contamination-driven failures across industrial equipment types:
            </p>
            <ul style={{
              fontSize: '1rem',
              lineHeight: 1.8,
              textAlign: 'justify',
              color: 'rgba(255,255,255,0.7)',
              marginLeft: '1.5rem',
            }}>
              <li style={{ marginBottom: '0.75rem' }}>Engine wear accelerates 50-80% under contamination bypass</li>
              <li style={{ marginBottom: '0.75rem' }}>Fuel injector stiction reduces efficiency by 15-40%</li>
              <li style={{ marginBottom: '0.75rem' }}>Hydraulic varnish formation causes 20-50% performance loss</li>
              <li style={{ marginBottom: '0.75rem' }}>Unscheduled downtime costs 3-5x the filter replacement cost</li>
              <li style={{ marginBottom: '0.75rem' }}>Equipment replacement occurs 30-50% earlier than design life</li>
            </ul>
          </div>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            textAlign: 'justify',
            color: 'rgba(255,255,255,0.7)',
            marginTop: '1.5rem',
          }}>
            System-level filtration design eliminates these preventable failures by treating contamination control as a measurable engineering problem, not a commodity purchase decision.
          </p>
        </motion.section>

      </div>


      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'System vs Commodity Filtration',
        description: 'Why filtration performance is a system design problem, not a product commodity selection problem. Equipment reliability is determined by contamination control effectiveness, not filter brand choice.',
        author: { '@type': 'Organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', name: 'ELIMFILTERS' },
        dateModified: '2026-06-11',
        keywords: ['industrial filtration', 'contamination control', 'system filtration', 'commodity filtration', 'ISO 16889', 'OEM specification', 'equipment reliability'],
        about: { '@type': 'Thing', name: 'System vs Commodity Filtration', description: 'Framework distinguishing system-level contamination control from commodity filter product selection, showing why OEM specification compliance does not equal equipment reliability.' },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system' },
          { '@type': 'ListItem', position: 3, name: 'Compare', item: 'https://elimfilters.com/knowledge-system/compare' },
          { '@type': 'ListItem', position: 4, name: 'System vs Commodity Filtration', item: 'https://elimfilters.com/knowledge-system/compare/system-vs-commodity' },
        ],
      }) }} />
    </main>
  );
}
