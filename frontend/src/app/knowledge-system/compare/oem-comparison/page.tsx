'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

export default function OEMComparisonPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Link href="/knowledge-system/compare" style={{
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
              // MARKET POSITIONING
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
            OEM vs Aftermarket Analysis
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
            When brand choice matters, and when system design is what actually determines equipment reliability.
          </motion.p>
        </div>
      </section>

      {/* Content Sections */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        {/* 01 / The OEM Requirement Myth */}
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
            01 / THE OEM REQUIREMENT MYTH
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Why "OEM-Specified" Doesn't Mean Optimized
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1rem',
          }}>
            Original Equipment Manufacturers (Caterpillar, Cummins, Detroit Diesel, Volvo, Komatsu, etc.) specify filter brands and types based on:
          </p>
          <ul style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginLeft: '1.5rem',
            marginBottom: '1rem',
          }}>
            <li style={{ marginBottom: '0.75rem' }}>Integration with existing supplier contracts</li>
            <li style={{ marginBottom: '0.75rem' }}>Cost reduction negotiations (not performance optimization)</li>
            <li style={{ marginBottom: '0.75rem' }}>Supply chain reliability and availability</li>
            <li style={{ marginBottom: '0.75rem' }}>Lowest specification that meets minimum warranty requirements</li>
          </ul>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1rem',
          }}>
            OEM specifications (Donaldson, Fleetguard, Mann, Wix, Baldwin, etc.) represent a <strong>minimum compliance floor, not a performance target</strong>. The OEM is optimizing for cost and warranty liability risk, not for your equipment's operational lifespan.
          </p>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
          }}>
            Many OEM-specified filters are high-quality products. But specification compliance and product quality are separate dimensions. A high-quality Donaldson filter installed with commodity maintenance practices will fail to maintain contamination control. Understanding the <Link href="/knowledge-system/bridges/oem-replacement" style={{ color: '#FFF12D', textDecoration: 'underline' }}>OEM replacement context</Link> clarifies when brand choice is a compliance issue versus when system design is the controlling variable. An equivalent quality aftermarket filter installed as part of a system-level contamination control strategy will outperform commodity practice.
          </p>
        </motion.section>

        {/* 02 / OEM Brand Landscape */}
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
            02 / MAJOR MARKET BRANDS
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Understanding the Competitive Landscape
          </h2>
          <p style={{
            fontSize: '0.95rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.65)',
            marginBottom: '2rem',
            fontStyle: 'italic',
          }}>
            Note: The following overview is factual market analysis. ELIMFILTERS® does not compete on price or brand positioning. We compete on system-level contamination control.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1.5rem',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#fff',
                marginBottom: '0.75rem',
              }}>
                <strong>Donaldson, Fleetguard, Mann:</strong> Established OEM suppliers with high-quality products, premium pricing, established service networks.
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
              }}>
                Strength: Brand recognition, integration with OEM systems, proven field reliability. Weakness: High cost, standardized intervals (not contamination-responsive), commodity market positioning.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#fff',
                marginBottom: '0.75rem',
              }}>
                <strong>Wix, Baldwin, Parker, Hydac:</strong> Aftermarket players with lower pricing, competitive specifications, diverse product ranges.
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
              }}>
                Strength: Cost advantage, specification compatibility, availability. Weakness: Less integrated with OEM systems, variable quality across product lines, limited system-level approach.
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
                <strong>ELIMFILTERS® Positioning:</strong> Not a filter brand, but an asset protection system.
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
              }}>
                Strength: System-level contamination control across all domains (air, fuel, hydraulic, cabin, lube, compressed air), measurement-based service intervals, TCO optimization, measurable equipment reliability improvement. Focus: Contamination control strategy, not product commodity.
              </p>
            </div>
          </div>
        </motion.section>

        {/* 03 / When OEM Choice Matters */}
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
            03 / WHEN OEM CHOICE MATTERS
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Specification Alignment and System Integration
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1.5rem',
          }}>
            OEM filter brand choice is relevant when:
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
            }}>
              <strong style={{ color: '#FFF12D' }}>Warranty Compliance:</strong> If equipment is under manufacturer warranty, OEM-specified filters may be required to maintain coverage. This is a compliance issue, not a performance issue. Non-OEM equivalent filters with same specifications provide identical performance but warranty claims may be denied.
            </p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
            }}>
              <strong style={{ color: '#FFF12D' }}>Specification Mismatch:</strong> Equipment is designed for specific flow rates, pressure drops, and element geometry. Non-compliant aftermarket filters may have different bypass settings, clogging rates, or bypass valve response. These can cause performance degradation even if nominal specifications match.
            </p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
            }}>
              <strong style={{ color: '#FFF12D' }}>Service Network Requirements:</strong> Some industries require OEM parts for supply chain control and traceability. Pharmaceutical, medical, aerospace applications may restrict to approved suppliers. In these cases, brand choice is mandated, not optional.
            </p>
          </div>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginTop: '1.5rem',
          }}>
            Outside these specific constraints, OEM brand choice has minimal impact on actual equipment performance. The operational consequences of this distinction are quantified in the <Link href="/knowledge-system/fleet/reducing-downtime" style={{ color: '#FFF12D', textDecoration: 'underline' }}>fleet downtime reduction analysis</Link>, which shows how system design — not brand selection — drives availability outcomes. Performance is governed by:
          </p>
          <ul style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginLeft: '1.5rem',
          }}>
            <li style={{ marginBottom: '0.75rem' }}>Filter specifications match design requirements (micron rating, flow capacity, pressure drop)</li>
            <li style={{ marginBottom: '0.75rem' }}>Contamination control system is properly designed and maintained</li>
            <li style={{ marginBottom: '0.75rem' }}>Service intervals are based on actual contamination, not calendar time</li>
            <li style={{ marginBottom: '0.75rem' }}>System-level cleanliness targets are measured and verified</li>
          </ul>
        </motion.section>

        {/* 04 / System Perspective */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
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
            04 / THE ELIMFILTERS® ADVANTAGE
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Titillium Web, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Moving Beyond Brand Comparison
          </h2>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,255,0,0.03) 100%)',
            border: '1px solid rgba(255,241,45,0.15)',
            borderRadius: '8px',
            padding: '2rem',
          }}>
            <p style={{
              fontSize: '1rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '1rem',
            }}>
              ELIMFILTERS® does not position as a filter replacement brand. Instead, we provide the system-level approach that makes filter brand choice secondary:
            </p>
            <ul style={{
              fontSize: '1rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              marginLeft: '1.5rem',
              marginBottom: '0',
            }}>
              <li style={{ marginBottom: '0.75rem' }}>
                <strong style={{ color: '#FFF12D' }}>Contamination Control Design:</strong> Integrated across air, fuel, hydraulic, cabin, lube, and compressed air systems. Identifies contamination pathways that individual filter brands cannot address.
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                <strong style={{ color: '#FFF12D' }}>Measurement-Based Service:</strong> Particle counting data replaces calendar-based intervals. Works with any OEM-compliant filter product, Donaldson or aftermarket.
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                <strong style={{ color: '#FFF12D' }}>Specification Optimization:</strong> Recommends filter specifications based on actual contamination loads, not OEM default. The <Link href="/knowledge-system/bridges/aftermarket-selection" style={{ color: '#FFF12D', textDecoration: 'underline' }}>aftermarket selection framework</Link> provides the evaluation criteria for identifying when non-OEM elements meet or exceed specification requirements.
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                <strong style={{ color: '#FFF12D' }}>Total Cost of Ownership Clarity:</strong> Shows how system investment reduces downtime, extends equipment life, and optimizes operational cost. Makes filter commodity choice irrelevant to business outcome.
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                <strong style={{ color: '#FFF12D' }}>Compliance Verification:</strong> Ensures all system components meet applicable standards (ISO, ASTM, SAE, DIN) and warranty requirements, regardless of filter brand selected.
              </li>
            </ul>
          </div>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginTop: '1.5rem',
          }}>
            <strong style={{ color: '#FFF12D' }}>Result:</strong> Equipment reliability improves not because of which filter brand is installed, but because contamination is controlled. The filter brand becomes an implementation detail, selected based on cost efficiency and specification match, not brand positioning or price competition.
          </p>
        </motion.section>

      </div>

      <RetrievalBlock>
        <p>SEMANTIC_DOMAINS: Asset Protection Systems [PRIMARY] | Contamination Control Systems [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: engine, hydraulic, fuel, lube, air_intake</p>
        <p>CONCEPT_TAXONOMY: type=analysis | domain=asset-protection | approach=oem-vs-aftermarket</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 16889, ISO 4406</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/particle-wear</p>
        <p>&nbsp;&nbsp;Related_Technologies: MACROCORE, NANOFORCE, DURATECH</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/reducing-downtime</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/compare/oem-comparison</p>
        <p>&nbsp;&nbsp;concept_id: oem-vs-aftermarket-filtration</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-05-23</p>
      </RetrievalBlock>
    </main>
  );
}
