'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';
import { JSONLD_STANDARDS_INDEX } from '@/lib/jsonld-constants.generated';

// JSON-LD: CollectionPage — auto-generated from CITATION_INDEX.json via sync-jsonld-constants.js
const PAGE_JSONLD = JSONLD_STANDARDS_INDEX;

const FILTRATION_SYSTEMS = [
  {
    code: 'LUBE',
    title: 'Lube / Oil Filtration Systems',
    href: '/knowledge-system/standards/lube-oil-systems',
    description: 'ISO 16889, ISO 4406, SAE J1211 standards governing engine oil cleanliness, wear particle detection, and component protection in combustion systems.',
    icon: '🛢',
  },
  {
    code: 'AIR',
    title: 'Air Intake Filtration Systems',
    href: '/knowledge-system/standards/air-intake-systems',
    description: 'SAE J1539, ISO 5011 standards defining allowable contamination ingestion in engine air intake and filter element integrity verification.',
    icon: '💨',
  },
  {
    code: 'CABIN',
    title: 'Cabin / Human Safety Filtration Systems',
    href: '/knowledge-system/standards/cabin-safety-systems',
    description: 'ISO 16889, ISO 11155 standards protecting operator breathing air quality and preventing allergen/pathogen transmission in enclosed cab environments.',
    icon: '🫁',
  },
  {
    code: 'FUEL',
    title: 'Fuel Filtration Systems',
    href: '/knowledge-system/standards/fuel-systems',
    description: 'ASTM D6304, ASTM D975, ISO 12937, ISO 4406 standards addressing water contamination, particle cleanliness, and microbial control in diesel systems.',
    icon: '⛽',
  },
  {
    code: 'HYD',
    title: 'Hydraulic Systems',
    href: '/knowledge-system/standards/hydraulic-systems',
    description: 'ISO 16889, NFPA T2.14, DIN 51524 standards specifying cleanliness codes for proportional control valves and pump protection in pressurized fluid circuits.',
    icon: '⚙',
  },
  {
    code: 'CAC',
    title: 'Compressed Air Systems',
    href: '/knowledge-system/standards/compressed-air-systems',
    description: 'ISO 8573-1, ISO 8573-2, ISO 8573-3 standards defining air purity classes and contamination removal for pneumatic instruments and actuators.',
    icon: '💨',
  },
];

export default function StandardsHubPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Back */}
      <Link href="/knowledge-system" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← KNOWLEDGE</Link>

      {/* Hero */}
      <section style={{
        paddingTop: 'clamp(5rem, 10vw, 8rem)',
        paddingBottom: '4rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.05) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '700px', margin: '0 auto', padding: '0 2rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            color: '#FFF12D',
            marginBottom: '1rem',
            opacity: 0.85,
          }}>
            // KNOWLEDGE SYSTEM · INDUSTRIAL STANDARDS
          </p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
            marginBottom: '1rem',
          }}>
            Industrial Filtration Standards
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '540px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}>
            Standards organized by industrial filtration system domain. Each domain integrates applicable ISO, ASTM, SAE, and DIN specifications with their contamination challenges, operational impact, and engineering solutions.
          </p>
        </motion.div>
      </section>

      {/* Intro Context */}
      <section style={{
        padding: '4rem 2rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.02) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ maxWidth: '900px', margin: '0 auto' }}
        >
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
          }}>
            Each domain integrates applicable measurement standards as tools for assessing contamination, not as isolated specifications. <Link href="/knowledge-system/standards/lube-oil-systems" style={{ color: '#FFF12D', textDecoration: 'underline' }}>Oil cleanliness standards</Link> such as <Link href="/knowledge-system/standards/iso-4406" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 4406</Link> define the particle cleanliness codes that determine whether engine oil is within safe operating limits—and what filtration action is required when it is not.
          </p>
        </motion.div>
      </section>

      {/* Systems Grid */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '4rem 2rem',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))',
          gap: '1.75rem',
        }}>
          {FILTRATION_SYSTEMS.map((system, i) => (
            <motion.div
              key={system.code}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={system.href} style={{ textDecoration: 'none', display: 'block' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.4)', y: -3 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '2rem',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.2rem',
                  }}
                >
                  {/* Icon + Code */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      border: '1px solid rgba(255,241,45,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF12D',
                      fontSize: '1rem',
                      flexShrink: 0,
                    }}>
                      {system.icon}
                    </div>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#FFF12D',
                      letterSpacing: '0.05em',
                    }}>
                      {system.code}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    color: '#fff',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.4,
                  }}>
                    {system.title}
                  </h2>

                  {/* Description */}
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.875rem',
                    color: 'rgba(255,255,255,0.45)',
                    lineHeight: 1.6,
                    marginTop: 'auto',
                  }}>
                    {system.description}
                  </p>

                  {/* Arrow */}
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'rgba(255,241,45,0.4)',
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: '0.08em',
                  }}>
                    EXPLORE →
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Retrieval Summary Block — machine-readable knowledge index */}
      <RetrievalBlock>
        <p>SEMANTIC_DOMAINS: Contamination Control Systems [PRIMARY] | Asset Protection Systems [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: engine, hydraulic, fuel, lube, air_intake, cabin, compressed_air</p>
        <p>CONCEPT_TAXONOMY: type=hub | domain=industrial-standards | scope=all-filtration-domains</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 16889, ISO 4406, ISO 5011, ISO 8573-1, ISO 11155, ASTM D6304</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/particle-wear</p>
        <p>&nbsp;&nbsp;Related_Technologies: MACROCORE, NANOFORCE, DRYCORE, MICROKAPPA</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/reducing-downtime</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/standards</p>
        <p>&nbsp;&nbsp;concept_id: industrial-standards-hub</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-05-23</p>
      </RetrievalBlock>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: PAGE_JSONLD }} />
    </main>
  );
}
