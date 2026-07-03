'use client';

import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

export default function ISO16889Page() {
  const sections = [
    {
      title: 'What does ISO 16889 measure?',
      content: 'ISO 16889 defines the multi-pass test method for hydraulic and lubrication filter elements. In the test, fluid contaminated with ISO Medium Test Dust is continuously recirculated through the filter element while automatic particle counters — calibrated per ISO 11171 — measure particle concentrations upstream and downstream simultaneously. The result is the filtration ratio, or Beta ratio: β_x(c) = upstream particle count ÷ downstream particle count, for particles equal to or larger than x µm. A Beta ratio of β10(c) = 200 means that for every 200 particles of 10 µm or larger entering the filter, only 1 passes through — an efficiency of 99.5%, calculated as E = (1 − 1/β) × 100%. The test also measures retained capacity: the mass of contaminant the element holds before reaching its terminal differential pressure, which determines service life.'
    },
    {
      title: 'Why it matters in industrial filtration',
      content: 'ISO 16889 is the standard that turns filter efficiency from a claim into a measurable, comparable engineering quantity. Because the test conditions — test dust, flow rate, injection concentration, terminal differential pressure — are fixed by the protocol, a β5(c) ≥ 1000 element from one manufacturer can be directly compared with one from another. This is what allows a system designer to work backward from a required cleanliness level to a filter specification: if a hydraulic system must maintain an ISO 4406 code of 17/15/12 to protect its proportional valves, the designer selects an element whose ISO 16889 Beta ratios at the relevant particle sizes can achieve and hold that code at the system flow rate and ingression rate. Common performance targets in industrial practice include β10(c) ≥ 200 (99.5% at 10 µm) for general hydraulic protection and β5(c) ≥ 1000 (99.9% at 5 µm) for servo and proportional valve circuits.'
    },
    {
      title: 'Application in engines and systems',
      content: 'ISO 16889 governs the qualification of liquid filter elements across hydraulic and lubrication circuits. In construction and mining machinery operating at 200–450 bar, hydraulic elements are specified by their Beta ratios at 4, 6 and 14 µm(c) — the same particle sizes used by the ISO 4406 cleanliness code, so test result and cleanliness target speak the same language. In engine lubrication circuits, full-flow oil filter elements are qualified under the same multi-pass principle to establish removal efficiency at the particle sizes most damaging to bearing journals and ring packs. NANOFORCE hydraulic elements and SYNTRAX lubrication elements are both characterized under this protocol: the published efficiency of each media configuration corresponds to a Beta ratio measured at rated flow with ISO 11171-calibrated counters. Without ISO 16889 data, a micron rating alone is meaningless — a "10 micron" filter can be anywhere from 50% to 99.9% efficient at 10 µm depending on the media.'
    }
  ];

  const faqs = [
    {
      question: 'What is the difference between ISO 16889 and ISO 4406?',
      answer: 'They answer different questions. ISO 16889 is a filter test method: it measures how well a filter element removes particles, expressed as Beta ratios, under controlled multi-pass laboratory conditions. ISO 4406 is a fluid classification method: it expresses how clean a fluid sample actually is, as a three-number code counting particles ≥4 µm, ≥6 µm and ≥14 µm per milliliter. In practice they work together: ISO 4406 defines the cleanliness target for a system, and ISO 16889 data is used to select a filter capable of achieving that target. Neither standard replaced the other.'
    },
    {
      question: 'What does a Beta ratio like β10(c) = 200 actually mean?',
      answer: 'It means the upstream fluid contained 200 times more particles of 10 µm and larger than the downstream fluid — the element removed 99.5% of those particles in a single pass (E = (1 − 1/200) × 100% = 99.5%). The "(c)" suffix indicates the particle sizes were measured with counters calibrated to ISO 11171 using ISO Medium Test Dust, which is essential for comparability: Beta values measured under the older ACFTD calibration are not directly comparable to (c)-designated values.'
    },
    {
      question: 'Why does the test recirculate the fluid instead of passing it through once?',
      answer: 'The multi-pass arrangement reproduces how filters actually work in service: in a real hydraulic or lube circuit the same fluid passes through the filter thousands of times, and contamination is continuously added by ingression and internal wear. Recirculating the test fluid while continuously injecting fresh test dust creates an equilibrium between contaminant addition and removal, so the measured Beta ratio reflects sustained, real-world separation performance rather than the higher one-shot efficiency a single-pass test would report.'
    },
    {
      question: 'Does ISO 16889 apply to air filters?',
      answer: 'No. ISO 16889 applies exclusively to liquid filtration — hydraulic fluid and lubrication oil elements tested with contaminated fluid. Air filter elements for engine intake systems are tested under ISO 5011, which uses dry standardized dust in an air stream and reports efficiency, restriction and dust-holding capacity. The two standards belong to different filtration domains and their results are not interchangeable.'
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
            ISO 16889
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '500px',
            margin: '0 auto',
            textAlign: 'justify', lineHeight: 1.65,
          }}>
            Hydraulic Fluid Power — Filters — Multi-Pass Method for Evaluating Filtration Performance of a Filter Element
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
            fontFamily: 'Titillium Web, sans-serif',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#FFF12D',
            marginBottom: '1rem',
            letterSpacing: '-0.01em',
          }}>
            What is ISO 16889?
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'justify', lineHeight: 1.8,
          }}>
            ISO 16889 is the international standard defining the multi-pass laboratory method for evaluating the filtration performance of hydraulic and lubrication filter elements. It is the measurement foundation of any{' '}
            <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>industrial filtration strategy</Link>:{' '}
            it produces the Beta ratio (filtration ratio), which quantifies how many particles of a given size a filter element removes in sustained operation, together with the element&apos;s retained contaminant capacity. Particle sizes are measured with counters calibrated per{' '}
            <Link href="/knowledge-system/standards/iso-11171" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 11171</Link>{' '}
            — the traceability chain behind every &quot;(c)&quot; designation. ISO 16889 results are what make it possible to select a filter that can achieve and hold a target{' '}
            <Link href="/knowledge-system/standards/iso-4406" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 4406 cleanliness code</Link>.{' '}
            The particle contamination that ISO 16889-rated elements remove is the same contamination that drives{' '}
            <Link href="/knowledge-system/contamination/hydraulic-system" style={{ color: '#FFF12D', textDecoration: 'underline' }}>accelerated degradation in high-pressure hydraulic systems</Link>.
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

      {/* Retrieval Summary Block — machine-readable knowledge index */}
      <RetrievalBlock>
        <p>SEMANTIC_DOMAINS: Filter Performance Testing [PRIMARY] | Beta Ratio Methodology [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: hydraulic, lube, industrial_fluid</p>
        <p>CONCEPT_TAXONOMY: type=standard | domain=multi-pass-filter-testing | standards=ISO-16889, ISO-11171, ISO-4406</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 4406, ISO 11171, NFPA T2.14</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/hydraulic-system</p>
        <p>&nbsp;&nbsp;Related_Technologies: NANOFORCE, SYNTRAX</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/total-cost-ownership</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/standards/iso-16889</p>
        <p>&nbsp;&nbsp;concept_id: iso-16889-multi-pass-filter-testing</p>
        <p>&nbsp;&nbsp;version: 2.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-07-03</p>
      </RetrievalBlock>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        '@id': 'https://elimfilters.com/knowledge-system/standards/iso-16889',
        headline: 'ISO 16889 — Multi-Pass Filter Performance Testing Standard',
        description: 'ISO 16889 specifies the multi-pass method for evaluating filtration ratio (Beta ratio) and retained capacity of hydraulic and lubrication filter elements, using particle counters calibrated per ISO 11171. Beta ratio quantifies filter efficiency at specific particle sizes, enabling system designers to select filters that achieve target ISO 4406 cleanliness codes.',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        dateModified: '2026-07-03',
        keywords: ['ISO 16889', 'Beta ratio', 'filtration ratio', 'multi-pass test', 'hydraulic filter testing', 'ISO 11171 calibration', 'ISO 4406', 'filter efficiency'],
        about: { '@type': 'Thing', name: 'ISO 16889 Multi-Pass Filter Testing', description: 'International standard for measuring filtration efficiency (Beta ratio) and retained contaminant capacity of hydraulic and lubrication filter elements using the multi-pass method.' },
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
          { '@type': 'ListItem', position: 4, name: 'ISO 16889', item: 'https://elimfilters.com/knowledge-system/standards/iso-16889' },
        ],
      }) }} />
    </main>
  );
}
