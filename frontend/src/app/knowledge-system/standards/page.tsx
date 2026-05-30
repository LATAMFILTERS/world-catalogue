'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

const collectionPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Industrial Filtration Standards',
  description: 'ISO 16889, ISO 4406, SAE J1211, ASTM D6304 — filtration standards by domain: lube oil, fuel, hydraulic, air intake, cabin, and compressed air.',
  url: 'https://elimfilters.com/knowledge-system/standards/',
  publisher: {
    '@type': 'Organization',
    name: 'ELIMFILTERS®',
    url: 'https://elimfilters.com',
  },
  hasPart: [
    { '@type': 'TechArticle', name: 'Lube Oil Filtration Systems', url: 'https://elimfilters.com/knowledge-system/standards/lube-oil-systems/' },
    { '@type': 'TechArticle', name: 'Hydraulic Filtration Systems', url: 'https://elimfilters.com/knowledge-system/standards/hydraulic-systems/' },
    { '@type': 'TechArticle', name: 'Fuel Filtration Systems', url: 'https://elimfilters.com/knowledge-system/standards/fuel-systems/' },
    { '@type': 'TechArticle', name: 'Air Intake Filtration Systems', url: 'https://elimfilters.com/knowledge-system/standards/air-intake-systems/' },
    { '@type': 'TechArticle', name: 'Cabin Air Filtration', url: 'https://elimfilters.com/knowledge-system/standards/cabin-safety-systems/' },
    { '@type': 'TechArticle', name: 'Compressed Air Systems', url: 'https://elimfilters.com/knowledge-system/standards/compressed-air-systems/' },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
    { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system/' },
    { '@type': 'ListItem', position: 3, name: 'Standards', item: 'https://elimfilters.com/knowledge-system/standards/' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is ISO 16889 and why does it matter for filtration?',
      acceptedAnswer: { '@type': 'Answer', text: 'ISO 16889 is the multi-pass filter test method that defines how filter efficiency is measured. It produces the Beta ratio (β), which quantifies how many particles a filter removes per size class. A β₁₀(c) ≥ 200 means the filter removes 99.5% of particles ≥10 µm. It is the universal benchmark for hydraulic and lube oil filter selection.' },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between ISO and SAE filtration standards?',
      acceptedAnswer: { '@type': 'Answer', text: 'ISO standards (ISO 16889, ISO 4406, ISO 5011) are international standards developed by the International Organization for Standardization and are used globally across industries. SAE standards (SAE J1539, SAE J1211) are developed by SAE International and are commonly used in North American automotive and heavy equipment applications. Both are accepted in industrial filtration, and many specifications reference both.' },
    },
    {
      '@type': 'Question',
      name: 'Which filtration standard applies to hydraulic systems?',
      acceptedAnswer: { '@type': 'Answer', text: 'Hydraulic systems are primarily governed by ISO 16889 (filter efficiency), ISO 4406 (fluid cleanliness codes), NFPA T2.14 (cleanliness targets for components), and DIN 51524 (hydraulic fluid specifications). Proportional control valves typically require cleanliness levels of ISO 4406 code 17/15/12 or better.' },
    },
    {
      '@type': 'Question',
      name: 'What ISO standard applies to compressed air quality?',
      acceptedAnswer: { '@type': 'Answer', text: 'ISO 8573-1 defines compressed air purity classes for three contaminant types: solid particles, water, and oil. Companion standards ISO 8573-2 and ISO 8573-3 provide test methods for measuring oil aerosol content and humidity respectively. Most industrial pneumatic systems require Class 1 or Class 2 air quality.' },
    },
    {
      '@type': 'Question',
      name: 'How do cabin air filtration standards protect operators?',
      acceptedAnswer: { '@type': 'Answer', text: 'Cabin air filtration in mining, agriculture, and construction vehicles is governed by ISO 11155 (test standard) and DIN 71220 (classification). These standards define minimum filtration efficiency for PM10 and PM2.5 particulate matter, ensuring operators are protected from silica dust, agricultural chemicals, and combustion by-products in enclosed cab environments.' },
    },
  ],
};

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
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

      {/* FAQ Section */}
      <section style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '4rem 2rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <h2 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
          fontWeight: 700,
          marginBottom: '2.5rem',
          color: '#fff',
        }}>
          Frequently Asked Questions
        </h2>
        {faqSchema.mainEntity.map((item, i) => (
          <div key={i} style={{
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            paddingBottom: '1.75rem',
            marginBottom: '1.75rem',
          }}>
            <h3 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#FFF12D',
              marginBottom: '0.6rem',
            }}>
              {item.name}
            </h3>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.7,
            }}>
              {item.acceptedAnswer.text}
            </p>
          </div>
        ))}
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
        <p>&nbsp;&nbsp;Related_Technologies: MACROCORE, NANOFORCE, DRYCORE, AQUAGUARD, MICROKAPPA</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/reducing-downtime</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/standards</p>
        <p>&nbsp;&nbsp;concept_id: industrial-standards-hub</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-05-23</p>
      </RetrievalBlock>

    </main>
  );
}
