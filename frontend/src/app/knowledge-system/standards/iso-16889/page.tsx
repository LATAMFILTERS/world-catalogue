'use client';

import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { motion } from 'motion/react';

export default function ISO16889Page() {
  const sections = [
    {
      title: 'What ISO 16889 Measures',
      content: 'ISO 16889 defines the multi-pass method for evaluating the filtration ratio (Beta ratio) and dirt-holding capacity of hydraulic filter elements. The Beta ratio (βx) quantifies a filter\'s efficiency at a specific particle size: β10(c) = 200 means the filter captures 200 contaminated particles per 1 clean particle that passes through at the 10 µm(c) size — equivalent to 99.5% efficiency at that size. The cleanliness code produced by ISO 16889-based testing uses three Range Numbers representing particle counts per millilitre at >4 µm, >6 µm, and >14 µm thresholds. A code of 16/14/11 means: up to 320 particles >4 µm, up to 80 particles >6 µm, and up to 10 particles >14 µm per mL. Particle counting must be performed with an automatic particle counter (APC) calibrated to ISO 11171 using NIST-traceable calibration fluid — this eliminated inter-laboratory variation that existed under older ISO 4406 manual counting methods.'
    },
    {
      title: 'Why It Matters for Industrial Filtration',
      content: 'ISO 16889 is the foundational measurement standard for specifying and verifying hydraulic system cleanliness. Without it, there is no consistent way to define what "clean enough" means for a specific hydraulic circuit, or to verify that a filter element actually performs as specified. The standard enables engineers to: (1) specify target cleanliness codes for each circuit based on the most sensitive component (e.g., ISO 16/14/11 for proportional valves with 1–4 µm spool clearances); (2) select filter elements with Beta ratios proven to achieve those targets; (3) verify actual fluid condition through periodic oil analysis. Particle contamination is responsible for 70–80% of hydraulic system failures. ISO 16889 provides the measurement framework that transforms contamination control from a qualitative guideline into a verifiable engineering specification. Contamination exceeding target codes accelerates the same wear mechanisms that drive hydraulic system failure.'
    },
    {
      title: 'Cleanliness Codes for Common Hydraulic Systems',
      content: 'Target cleanliness codes vary by component sensitivity. Proportional and servo control valves (spool clearances 1–4 µm): ISO 16/14/11 or 15/13/10. Pressure-compensated variable displacement pumps: ISO 17/15/12. Standard directional control valves: ISO 18/16/13. Hydraulic cylinders and motors: ISO 19/17/14. Return line and reservoir circuits: ISO 20/18/15. These targets are derived from empirical wear data: maintaining 16/14/11 in a servo system extends valve spool life by 3–5× compared to uncontrolled contamination at 20/18/15. Filter selection must account for the system\'s highest-pressure circuit, the most sensitive component, and the expected ingression rate from ambient contamination, system wear particles, and new oil contamination. New oil from drums typically measures ISO 21/19/16 — it must be filtered before use if the system target is tighter than 20/18/15.'
    }
  ];

  const faqs = [
    {
      question: 'What is a Beta ratio and how is it read?',
      answer: 'A Beta ratio (β) expresses how many particles of a given size the filter captures for every one that passes through. β10(c) = 200 means 200 particles >10 µm are captured for every 1 that bypasses — 99.5% efficiency. The (c) suffix indicates the particle size was measured using the ISO 11171 calibration standard (c = calibrated). Common Beta ratios and their efficiencies: β3(c) = 200 → 99.5% at 3 µm; β6(c) = 10 → 90% at 6 µm; β10(c) = 1000 → 99.9% at 10 µm. Higher Beta ratio means higher efficiency at that particle size. A filter element labelled "10 µm absolute" typically means β10(c) ≥ 200.'
    },
    {
      question: 'What is the difference between ISO 4406 and ISO 16889?',
      answer: 'ISO 4406 defined the Range Number cleanliness code system. ISO 16889 defines how to measure the fluid to arrive at that code — specifically the multi-pass filter test, the Beta ratio measurement protocol, and the requirement for automatic particle counters calibrated to ISO 11171. The cleanliness code format is identical: both use three Range Numbers at 4 µm, 6 µm, and 14 µm. The difference is measurement precision: ISO 4406 permitted manual microscopic counting that varied between laboratories; ISO 16889 mandated calibrated APCs that produce consistent, reproducible results. When a service manual specifies "ISO 4406 18/16/13," the numbers mean exactly the same as "ISO 16889 18/16/13."'
    },
    {
      question: 'How often should fluid cleanliness be measured?',
      answer: 'Measurement frequency depends on system criticality and operating environment. Servo and proportional valve systems in clean environments: quarterly or every 500 operating hours. Mobile construction equipment in dusty environments: every 250 hours or when filter differential pressure indicators signal approaching bypass. Fixed industrial systems with continuous monitoring: inline particle counters can provide real-time cleanliness data. After maintenance events (filter change, seal replacement, component repair): always sample before returning to service to confirm the circuit was not contaminated during maintenance. Oil analysis programs typically combine particle counting (ISO 16889), water content (Karl Fischer per ASTM D6304), and wear metal spectrometry (ICP-OES) to provide a complete picture of fluid condition.'
    },
    {
      question: 'What does "absolute" versus "nominal" filtration rating mean under ISO 16889?',
      answer: '"Absolute" filtration rating means the filter achieves a specified Beta ratio at the stated particle size: a 10 µm absolute filter has β10(c) ≥ 200 (99.5% efficiency). "Nominal" ratings are not standardised and carry no guaranteed efficiency — a filter marked "10 µm nominal" might allow 30–50% of 10 µm particles to pass in service. ISO 16889 only recognises Beta ratio values as valid efficiency descriptors. When specifying replacement filter elements, always request the manufacturer\'s ISO 16889 test report with Beta ratio data, not just a nominal micron rating. Nominal ratings are a legacy marketing convention with no engineering basis under modern filtration standards.'
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
            Hydraulic Fluid Power — Filters — Multi-pass method for evaluating filtration performance of a filter element
          </p>
        </motion.div>
      </section>

      {/* Content Sections */}
      <section style={{
        maxWidth: '900px',
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
            What is ISO 16889?
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'justify', lineHeight: 1.8,
          }}>
            ISO 16889 is the international standard defining the multi-pass method for measuring the filtration ratio (Beta ratio) and dirt-holding capacity of hydraulic filter elements. It is the central measurement tool within any{' '}
            <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>industrial filtration strategy</Link>.
            {' '}The standard establishes a three-number cleanliness code system — identical in format to{' '}
            <Link href="/knowledge-system/standards/iso-4406" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 4406</Link>{' '}
            — that classifies particle concentrations at 4 µm, 6 µm, and 14 µm thresholds per millilitre of fluid. What distinguishes ISO 16889 is its mandated test methodology: all particle counting must use automatic particle counters calibrated to ISO 11171, eliminating the measurement variability that existed under older manual counting methods. The contamination that ISO 16889 quantifies is the same contamination driving{' '}
            <Link href="/knowledge-system/contamination/hydraulic-system" style={{ color: '#FFF12D', textDecoration: 'underline' }}>accelerated degradation in high-pressure hydraulic circuits</Link>.
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

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'ISO 16889 — Multi-Pass Filter Performance Testing Standard',
        description: 'ISO 16889 specifies the multi-pass method for evaluating filtration ratio (Beta ratio) and dirt-holding capacity of hydraulic fluid power filter elements. Beta ratio quantifies filter efficiency at specific particle sizes, enabling system designers to specify target cleanliness codes for critical components.',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        dateModified: '2026-07-03',
        keywords: ['ISO 16889', 'Beta ratio', 'filter efficiency', 'multi-pass test', 'hydraulic filtration', 'ISO 4406', 'contamination control', 'industrial filtration', 'ISO 11171'],
        about: { '@type': 'Thing', name: 'ISO 16889 Filter Testing', description: 'International standard for measuring filtration efficiency (Beta ratio) and dirt-holding capacity of hydraulic filter elements using the multi-pass method with ISO 11171 calibrated particle counters.' },
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
