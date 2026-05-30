'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

const definedTermSchema = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTerm',
  name: 'ISO 5011',
  description: 'ISO 5011 is the international standard for testing the performance of air filtration elements for internal combustion engines and compressors. It specifies test methods for filtration efficiency, pressure drop, dust holding capacity, and element integrity under collapse pressure.',
  url: 'https://elimfilters.com/knowledge-system/standards/iso-5011/',
  inDefinedTermSet: {
    '@type': 'DefinedTermSet',
    name: 'Industrial Filtration Standards',
    url: 'https://elimfilters.com/knowledge-system/standards/',
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
    { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system/' },
    { '@type': 'ListItem', position: 3, name: 'Standards', item: 'https://elimfilters.com/knowledge-system/standards/' },
    { '@type': 'ListItem', position: 4, name: 'ISO 5011', item: 'https://elimfilters.com/knowledge-system/standards/iso-5011/' },
  ],
};

export default function ISO5011Page() {
  const sections = [
    {
      title: 'What Is ISO 5011 Used For?',
      content: 'ISO 5011 serves as the test standard that validates the quality and reliability of air filter elements for internal combustion engines and compressors. Its purpose is to provide a reproducible, standardised method for verifying that a filter element can adequately retain particles under extreme differential pressures without collapsing or developing leaks. Filter manufacturers use ISO 5011 to certify that their products meet retention specifications, and buyers use this standard to validate that the filters they procure will provide the expected protection. ISO 5011 test procedures include the integrity test, where compressed air is applied to detect leak points, and the collapse test, where differential pressure is gradually increased until the element fails.'
    },
    {
      title: 'Why It Matters in Industrial Filtration',
      content: 'In industrial filtration, ISO 5011 is critical because it connects the cleanliness specification (ISO 16889 or ISO 4406) to the physical reality of particle retention. A filter element may be designed to retain 10 µm particles, but without ISO 5011 testing there is no reliable way to verify that it actually does so. When a filter fails in service without visibly collapsing, it is often because it did not adequately pass ISO 5011 testing. Particulate contamination that escapes through a defective filter element is one of the most common causes of catastrophic damage in hydraulic systems. ISO 5011 prevents this by ensuring that only filters that have demonstrated their retention capability are placed in critical service.'
    },
    {
      title: 'Application in Engines and Systems',
      content: 'When an OEM equipment manufacturer designs a hydraulic system with an ISO 16889 16/14/11 requirement, they also specify a filter element that has been certified under ISO 5011 to retain particles at that critical size. In construction machinery operating at 210 bar, the filter must demonstrate it can maintain integrity up to differential pressures of 350+ bar in ISO 5011 collapse testing. In agricultural systems with long operating cycles, ISO 5011-certified filter elements ensure the fluid remains clean for thousands of operating hours. In marine equipment where access for filter changes is limited, ISO 5011 certification is especially important to guarantee the element will perform reliably across the full specified service interval.'
    }
  ];

  const faqs = [
    {
      question: 'What Is the Difference Between "Collapse" and "Integrity" in ISO 5011?',
      answer: 'The integrity test uses low-pressure compressed air to detect leaks or weak points in the filter media using a bubble detector. The collapse test gradually increases differential pressure (typically using water) until the element fails structurally or develops a significant leak. The integrity test detects small imperfections, while the collapse test verifies the element can withstand extreme pressures before structural failure.'
    },
    {
      question: 'What Differential Pressure Must a Filter Element Withstand per ISO 5011?',
      answer: 'Requirements vary by filter type and particle retention size. A typical medium-pressure filter (10–25 µm retention) must withstand a collapse differential pressure of at least 350 kPa (3.5 bar). High-pressure filters may require 1,000+ kPa. Manufacturers also specify nominal operating differential pressures (typically 70–140 kPa) that are significantly lower than the collapse pressure to provide a safety margin.'
    },
    {
      question: 'How Often Is ISO 5011 Testing Performed?',
      answer: 'For filter manufacturers, ISO 5011 is a validation test performed during product development and during quality control on production batches (typically a statistical sample per batch). For end users, ISO 5011 is not a test performed on a regular basis. Instead, users specify filters certified under ISO 5011 and rely on that prior certification. If a defective element is suspected in service, ISO 5011 tests can be performed in a laboratory to investigate failures.'
    }
  ];

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Back Button */}
      <Link href="/knowledge-system/standards" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← STANDARDS</Link>

      {/* Hero Section */}
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
            // INTERNATIONAL FILTRATION STANDARD
          </p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
          }}>
            ISO 5011
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}>
            Hydraulic Fluid Power — Filters — Test Procedure for Verification of Collapse/Integrity
          </p>
        </motion.div>
      </section>

      {/* Content Sections */}
      <section style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '4rem 2rem',
      }}>
        {/* Section: Definition (with internal links) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
          style={{
            marginBottom: '3rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#FFF12D',
            marginBottom: '1rem',
            letterSpacing: '-0.01em',
          }}>
            What Is ISO 5011?
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.8,
          }}>
            ISO 5011 is the international standard that defines the test procedure for verifying the integrity and collapse resistance of filter media in air filters for internal combustion engines and compressors, complementing the requirements of the{' '}
            <Link href="/knowledge-system/standards/air-intake-systems" style={{ color: '#FFF12D', textDecoration: 'underline' }}>air intake systems</Link>{' '}
            domain. This standard specifies precise methods for testing that a filter element can retain particles of a specific size without allowing fluid bypass around the element under extreme differential pressure conditions. ISO 5011 is critical because it ensures filter elements meet their particle retention specifications and will not fail catastrophically when exposed to elevated differential pressures during normal operation or emergency situations. The retained particle size classification follows the{' '}
            <Link href="/knowledge-system/standards/iso-16889" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 16889</Link>{' '}
            framework to ensure consistency across filtration domains. Filters that fail ISO 5011 testing allow abrasive particles to pass through, causing{' '}
            <Link href="/knowledge-system/contamination/particle-wear" style={{ color: '#FFF12D', textDecoration: 'underline' }}>accelerated wear of internal engine components</Link>.
          </p>
        </motion.div>

        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: (i + 1) * 0.1 }}
            style={{
              marginBottom: '3rem',
              paddingBottom: '2rem',
              borderBottom: i < sections.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}
          >
            <h2 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#FFF12D',
              marginBottom: '1rem',
              letterSpacing: '-0.01em',
            }}>
              {section.title}
            </h2>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.8,
            }}>
              {section.content}
            </p>
          </motion.div>
        ))}
      </section>

      {/* FAQ Section */}
      <section style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '4rem 2rem',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: sections.length * 0.1 }}
        >
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#FFF12D',
            marginBottom: '2rem',
            textAlign: 'center',
            letterSpacing: '-0.01em',
          }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (sections.length + 1 + i) * 0.1 }}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,241,45,0.15)',
                  padding: '1.5rem',
                  borderRadius: '4px',
                }}
              >
                <h3 style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#FFF12D',
                  marginBottom: '0.75rem',
                }}>
                  {faq.question}
                </h3>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.7,
                }}>
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Retrieval Summary Block — machine-readable knowledge index */}
      <RetrievalBlock>
        <p>SEMANTIC_DOMAINS: Air Intake Filtration Systems [PRIMARY]</p>
        <p>SYSTEMS_AFFECTED: air_intake, engine, turbocharger</p>
        <p>CONCEPT_TAXONOMY: type=standard | domain=air-filtration-testing | standards=ISO-5011, SAE-J726</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 5011, SAE J726, SAE J1539</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/particle-wear</p>
        <p>&nbsp;&nbsp;Related_Technologies: DRYCORE, MACROCORE, SYNTEPORE</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/reducing-downtime</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/standards/iso-5011</p>
        <p>&nbsp;&nbsp;concept_id: iso-5011-air-filter-testing</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-05-23</p>
      </RetrievalBlock>
    </main>
  );
}
