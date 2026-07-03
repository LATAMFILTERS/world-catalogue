'use client';

import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { motion } from 'motion/react';

export default function ISO5011Page() {
  const sections = [
    {
      title: 'What ISO 5011 Tests',
      content: 'ISO 5011 defines the test methods for measuring the performance of air intake filter elements used in internal combustion engines and compressors. The standard specifies three principal test procedures: (1) Initial efficiency test — measures the filter\'s particle capture efficiency at the start of service life, using AC Fine Test Dust (ACFTD) of defined particle size distribution. (2) Dust capacity test — measures the total mass of dust the element can hold before reaching the specified maximum permissible differential pressure, defining service interval. (3) Collapse/integrity test — verifies the element\'s structural integrity under severe differential pressure: the element must survive without leaking or collapsing at three to five times the rated operating pressure differential. These tests are conducted under standardised airflow conditions and document filter performance using consistent, reproducible methodology that allows direct comparison between competing elements.'
    },
    {
      title: 'Why It Matters for Engine Protection',
      content: 'Air intake filtration is the first and most critical defence for combustion engine reliability. Diesel engines ingest 10,000–30,000 litres of air per litre of fuel burned; all contamination in that air — silica dust, carbon particles, pollen, industrial particulate — enters the combustion chamber unless the air filter intercepts it. A single particle of silica dust (hardness 7 Mohs) larger than the oil film thickness on a piston ring (typically 3–10 µm) can initiate abrasive wear that propagates across the full service interval. ISO 5011 provides the measurement framework that guarantees an air filter element will capture particles above its rated efficiency threshold under defined operating conditions. An element that passes ISO 5011 integrity testing at 3× rated differential pressure will not develop bypass leaks in normal service. Without ISO 5011 certification, there is no engineering basis for assuming an air filter will perform as labelled during its full service life.'
    },
    {
      title: 'Application in Engine Specifications',
      content: 'OEM engine manufacturers specify air filter elements by ISO 5011 performance parameters: minimum initial efficiency (typically 99.5%–99.9% at the test particle size), minimum dust capacity (in grams of ACFTD per unit airflow), and minimum collapse pressure. When an agricultural tractor OEM specifies an air filter element for a 150 kW diesel engine, the element must meet the ISO 5011 performance parameters validated for that engine\'s airflow rate (typically 600–900 m³/h) and operating environment (high ambient dust concentration in agricultural applications requires higher dust capacity than urban construction equipment). Aftermarket elements must demonstrate equivalent ISO 5011 performance — not just dimensional compatibility — to provide equivalent engine protection. An element that fits physically but holds 30% less dust will require 30% more frequent replacement intervals to prevent performance degradation from restriction or failure from collapse.'
    }
  ];

  const faqs = [
    {
      question: 'What is the difference between the collapse test and the integrity test in ISO 5011?',
      answer: 'The integrity test (bubble point test) applies low-pressure air to the clean filter element while the outlet side is submerged in liquid; bubbles indicate leaks in the filter media or gasket seals. It detects manufacturing defects and small perforations that would allow particle bypass in service. The collapse test applies increasing differential pressure (with liquid) until the element either develops a sustained leak or deforms structurally. The collapse test verifies the element can withstand pressure spikes from cold start conditions, clogged filter operation, and blocked service intervals without catastrophic bypass. ISO 5011 requires elements to survive at least 3× their rated operating differential pressure without collapse.'
    },
    {
      question: 'What differential pressure rating should a heavy-duty air filter element have?',
      answer: 'Heavy-duty air filter elements for diesel engines typically have rated service differential pressures of 3–7 kPa (30–70 mbar) at maximum rated airflow. Service restriction indicators (visual or electronic) typically trigger at 6–10 kPa. ISO 5011 collapse testing requires the element to survive 20–35 kPa without failure — providing a 3–5× safety margin above the service restriction trigger point. Mining and construction equipment operating in extremely dusty environments may use lower restriction triggers (4–5 kPa) to prevent ingestion of dust through a bypassing clogged element. High-performance industrial compressors may specify collapse ratings up to 100 kPa for catastrophic-failure prevention in process-critical applications.'
    },
    {
      question: 'How does ISO 5011 relate to SAE J726 and SAE J1539?',
      answer: 'SAE J726 (Air Cleaner Test Code) and ISO 5011 are technically equivalent standards that were harmonised through the international standardisation process. SAE J726 is the North American version; ISO 5011 is the international version. They specify the same test procedures, the same test dusts, and produce comparable results. Equipment sold globally may reference either standard. SAE J1539 (Air Cleaner Element Test Code for Crankcase Breathers) covers a related but distinct application: crankcase ventilation filter elements that prevent engine oil mist and blowby gases from entering the air intake. ELIMFILTERS MACROCORE™ elements are tested and certified under both ISO 5011 and SAE J726 for primary air intake applications.'
    },
    {
      question: 'Does ISO 5011 certification on an element guarantee compatibility with my engine?',
      answer: 'ISO 5011 certification guarantees the element meets the specified efficiency, dust capacity, and structural integrity values under the standard\'s test conditions — it does not guarantee dimensional fit or compatibility with a specific engine\'s airflow system. An element must also match the engine\'s housing inlet/outlet dimensions, sealing geometry (radial seal, axial seal, or flat panel), and airflow resistance characteristics to the OEM specification. When sourcing replacement elements, verify both the ISO 5011 performance data (efficiency ≥ OEM spec, dust capacity ≥ OEM spec, collapse pressure ≥ OEM spec) and the dimensional specification against the original element part number.'
    }
  ];

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Breadcrumb />
      {/* Back Button */}
      <Link href="/knowledge-system/standards"
        className="back-nav-btn" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.72rem',
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
          <h1 style={{
            fontFamily: 'Titillium Web, sans-serif',
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
            textAlign: 'justify', lineHeight: 1.65,
          }}>
            Intake Air Cleaning Equipment for Internal Combustion Engines and Compressors — Performance Testing
          </p>
        </motion.div>
      </section>

      {/* Content Sections */}
      <section style={{
        maxWidth: '1060px',
        margin: '0 auto',
        padding: '4rem 2rem',
      }}>
        {/* Definition */}
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
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#FFF12D',
            marginBottom: '1rem',
            letterSpacing: '-0.01em',
          }}>
            What is ISO 5011?
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'justify', lineHeight: 1.8,
          }}>
            ISO 5011 is the international standard specifying the test methods for evaluating the performance of air intake filter elements used in internal combustion engines and industrial compressors. It defines standardised procedures for measuring three critical performance parameters: filtration efficiency (what percentage of particles are captured), dust capacity (how much contaminant the element holds before requiring replacement), and structural integrity (resistance to collapse under extreme differential pressure). ISO 5011 is the counterpart to{' '}
            <Link href="/knowledge-system/standards/iso-16889" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 16889</Link>{' '}
            in the air intake domain, providing the same measurement rigour for air filtration that ISO 16889 provides for hydraulic and lube fluid filtration. Elements certified under ISO 5011 complement the broader{' '}
            <Link href="/knowledge-system/standards/air-intake-systems" style={{ color: '#FFF12D', textDecoration: 'underline' }}>air intake filtration system domain</Link>.
            {' '}Particles that bypass an uncertified or sub-performing air filter element cause the same{' '}
            <Link href="/knowledge-system/contamination/particle-wear" style={{ color: '#FFF12D', textDecoration: 'underline' }}>abrasive wear on engine components</Link>{' '}
            as particles entering through hydraulic system contamination.
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
              fontFamily: 'Titillium Web, sans-serif',
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
              textAlign: 'justify', lineHeight: 1.8,
            }}>
              {section.content}
            </p>
          </motion.div>
        ))}
      </section>

      {/* FAQ Section */}
      <section style={{
        maxWidth: '1060px',
        margin: '0 auto',
        padding: '4rem 2rem',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: sections.length * 0.1 }}
        >
          <h2 style={{
            fontFamily: 'Titillium Web, sans-serif',
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
                  fontFamily: 'Titillium Web, sans-serif',
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
                  textAlign: 'justify', lineHeight: 1.7,
                }}>
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'ISO 5011 — Air Filter Element Test Standard for Internal Combustion Engines and Compressors',
        description: 'ISO 5011 specifies test methods for evaluating air intake filter element performance including initial filtration efficiency, dust capacity, and structural integrity under collapse testing. Defines standardised procedures for measuring and comparing air filter element performance in internal combustion engines and industrial compressors.',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        dateModified: '2026-07-03',
        keywords: ['ISO 5011', 'air filter testing', 'filter element integrity', 'dust capacity test', 'air intake filtration', 'SAE J726', 'SAE J1539', 'engine air filter', 'MACROCORE'],
        about: { '@type': 'Thing', name: 'ISO 5011 Air Filter Testing', description: 'International standard for measuring air intake filter element performance including efficiency, dust holding capacity, and structural integrity under defined test conditions.' },
        inLanguage: 'en',
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Knowledge System', item: 'https://elimfilters.com/knowledge-system' },
          { '@type': 'ListItem', position: 3, name: 'Standards', item: 'https://elimfilters.com/knowledge-system/standards' },
          { '@type': 'ListItem', position: 4, name: 'ISO 5011', item: 'https://elimfilters.com/knowledge-system/standards/iso-5011' },
        ],
      }) }} />
    </main>
  );
}
