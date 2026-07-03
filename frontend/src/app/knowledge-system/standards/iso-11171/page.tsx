'use client';

import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

export default function ISO11171Page() {
  const sections = [
    {
      title: 'What does ISO 11171 calibrate?',
      content: 'ISO 11171 defines the calibration procedure for automatic particle counters (APCs) used to measure solid particle contamination in liquids. An automatic particle counter reports how many particles of each size pass its sensor — but "size" is only meaningful if the instrument has been calibrated against a traceable reference. ISO 11171 establishes that reference: certified samples of ISO Medium Test Dust (ISO MTD, defined in ISO 12103-1) suspended at known concentrations, with particle size distributions certified by a national metrology institute (NIST-traceable standard reference materials). The calibration assigns the instrument a certified size scale, designated µm(c) — the "(c)" suffix indicates the counter was calibrated per ISO 11171. Every ISO 4406 cleanliness code and every ISO 16889 Beta ratio published with the (c) designation traces back to this calibration chain.'
    },
    {
      title: 'Why it matters: the ACFTD to ISO MTD transition',
      content: 'Before ISO 11171, particle counters were calibrated with Air Cleaner Fine Test Dust (ACFTD) under the earlier ISO 4402 procedure. ACFTD production ceased, and its particle size distribution below 5 µm had never been accurately certified — the smallest sizes were extrapolated rather than measured. ISO 11171 replaced this with ISO MTD and NIST-traceable size certification. The consequence is a permanent shift in reported sizes: a particle counted as "5 µm" under the old ACFTD calibration corresponds to approximately 6 µm(c) under ISO 11171, and old "10 µm" roughly to 11 µm(c). This is why modern cleanliness codes count at 4/6/14 µm(c) where older literature used 5/15 µm: the thresholds were re-mapped to preserve continuity of the underlying contamination levels. Comparing a pre-ISO 11171 Beta ratio with a modern β(c) value without accounting for this shift produces errors of one full size class or more.'
    },
    {
      title: 'Application in contamination measurement',
      content: 'ISO 11171 calibration is the invisible foundation of every fluid cleanliness measurement in industrial practice. When an oil analysis laboratory reports an ISO 4406 code of 17/15/12 for a hydraulic sample, the particle counts at ≥4, ≥6 and ≥14 µm(c) are valid only because the laboratory’s counter carries a current ISO 11171 calibration. When a filter manufacturer publishes an ISO 16889 result of β10(c) ≥ 200 for a hydraulic element, both the upstream and downstream counters in the multi-pass rig were ISO 11171-calibrated — otherwise the Beta ratio would not be comparable to any other manufacturer’s data. NANOFORCE hydraulic elements and SYNTRAX lubrication elements are characterized under this measurement chain: ISO 11171 calibration → ISO 16889 multi-pass test → Beta ratio → predicted ISO 4406 cleanliness in service. Calibration is repeated at defined intervals (typically annually) and verified with secondary reference samples, because sensor drift directly translates into misreported cleanliness codes and incorrect maintenance decisions.'
    }
  ];

  const faqs = [
    {
      question: 'What does the "(c)" in µm(c) or β10(c) mean?',
      answer: 'The "(c)" suffix certifies that the particle sizes were measured with an automatic particle counter calibrated per ISO 11171 using NIST-traceable ISO Medium Test Dust. A Beta ratio written β10(c) and one written β10 without the suffix are not the same measurement: the unsuffixed value likely comes from the older ACFTD calibration (ISO 4402), where reported sizes ran roughly 1–2 µm smaller in the fine range. Specifications, filter data sheets and oil analysis reports should always be checked for the (c) designation before values are compared.'
    },
    {
      question: 'Why did ISO 4406 codes move from 5/15 µm to 4/6/14 µm thresholds?',
      answer: 'The threshold change accompanied the calibration change. Under ACFTD calibration, cleanliness was classified at ≥5 µm and ≥15 µm. When ISO 11171 recalibrated the size scale against accurately certified ISO MTD, the same physical contamination levels corresponded to different reported sizes. The thresholds were re-mapped to ≥4, ≥6 and ≥14 µm(c) so that a fluid’s cleanliness code stayed approximately continuous across the transition — and a third threshold (≥4 µm(c)) was added to capture the fine particle population relevant to modern tight-clearance components.'
    },
    {
      question: 'How often must a particle counter be recalibrated under ISO 11171?',
      answer: 'ISO 11171 defines the calibration procedure; the recalibration interval is set by laboratory quality systems, with annual recalibration the common industry practice. Between full calibrations, laboratories verify performance with secondary calibration suspensions and check sample validation. Counter drift matters operationally: a sensor mis-sized by even 1 µm at the 4 µm(c) threshold can shift a reported ISO 4406 code by a full class, turning a fluid that meets a 17/15/12 specification into one that appears to fail it — or worse, the reverse.'
    },
    {
      question: 'Does ISO 11171 apply to air filter testing too?',
      answer: 'No. ISO 11171 covers calibration of particle counters for liquid samples — hydraulic fluid, lubrication oil, fuel. It underpins ISO 4406 cleanliness coding and ISO 16889 multi-pass filter testing, both liquid-domain methods. Air filter elements are tested under ISO 5011 using gravimetric dust feed and mass-based efficiency measurement, which does not rely on liquid-borne particle counting.'
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
            ISO 11171
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '500px',
            margin: '0 auto',
            textAlign: 'justify', lineHeight: 1.65,
          }}>
            Hydraulic Fluid Power — Calibration of Automatic Particle Counters for Liquids
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
            What is ISO 11171?
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'justify', lineHeight: 1.8,
          }}>
            ISO 11171 is the international standard for calibrating the automatic particle counters that measure solid contamination in hydraulic fluid, lubrication oil and fuel. It is the measurement traceability layer beneath the two standards that industrial filtration is specified with:{' '}
            <Link href="/knowledge-system/standards/iso-4406" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 4406</Link>{' '}
            cleanliness codes describe the state of a fluid, and{' '}
            <Link href="/knowledge-system/standards/iso-16889" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 16889</Link>{' '}
            Beta ratios describe the capability of a filter — but both depend on particle counters whose size scale is certified per ISO 11171, indicated by the &quot;(c)&quot; suffix in µm(c) and β(c) values. Without this calibration chain, particle counts from different laboratories or manufacturers are not comparable, and the contamination levels that drive{' '}
            <Link href="/knowledge-system/contamination/particle-wear" style={{ color: '#FFF12D', textDecoration: 'underline' }}>abrasive wear in engines and hydraulic components</Link>{' '}
            cannot be reliably quantified or trended.
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
        <p>SEMANTIC_DOMAINS: Particle Counter Calibration [PRIMARY] | Measurement Traceability [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: hydraulic, lube, fuel, oil_analysis_laboratory</p>
        <p>CONCEPT_TAXONOMY: type=standard | domain=particle-counter-calibration | standards=ISO-11171, ISO-12103-1, ISO-4406, ISO-16889</p>
        <p>RELEVANCE_LEVELS: industrial, laboratory, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 4406, ISO 16889, ISO 12103-1</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/particle-wear</p>
        <p>&nbsp;&nbsp;Related_Technologies: NANOFORCE, SYNTRAX</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/reducing-downtime</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/standards/iso-11171</p>
        <p>&nbsp;&nbsp;concept_id: iso-11171-particle-counter-calibration</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-07-03</p>
      </RetrievalBlock>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        '@id': 'https://elimfilters.com/knowledge-system/standards/iso-11171',
        headline: 'ISO 11171 — Calibration of Automatic Particle Counters for Liquids',
        description: 'ISO 11171 defines the NIST-traceable calibration of automatic particle counters using ISO Medium Test Dust, establishing the µm(c) size scale that underlies ISO 4406 cleanliness codes and ISO 16889 Beta ratios. Replaced the earlier ACFTD-based calibration, shifting reported particle sizes and the classification thresholds to 4/6/14 µm(c).',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        dateModified: '2026-07-03',
        keywords: ['ISO 11171', 'particle counter calibration', 'ISO Medium Test Dust', 'ACFTD', 'µm(c) size designation', 'measurement traceability', 'ISO 4406', 'ISO 16889'],
        about: { '@type': 'Thing', name: 'ISO 11171 Particle Counter Calibration', description: 'International standard for calibrating automatic particle counters for liquids, providing the traceable size scale for fluid cleanliness measurement and filter performance testing.' },
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
          { '@type': 'ListItem', position: 4, name: 'ISO 11171', item: 'https://elimfilters.com/knowledge-system/standards/iso-11171' },
        ],
      }) }} />
    </main>
  );
}
