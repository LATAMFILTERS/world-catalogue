'use client';

import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

export default function ISO5011Page() {
  const sections = [
    {
      title: 'What does ISO 5011 measure?',
      content: 'ISO 5011 defines the laboratory test method for evaluating inlet air cleaning equipment for internal combustion engines and compressors. The standard measures three fundamental performance characteristics of an air filter element: initial restriction (the pressure drop across a clean element at rated airflow, expressed in Pa or kPa), fractional and overall efficiency (the percentage of standardized test dust captured by the element), and dust-holding capacity (the mass of test dust, in grams, the element retains before reaching its terminal restriction limit). Tests are performed on a controlled airflow bench using standardized test dusts — ISO 12103-1 A2 (Fine) and A4 (Coarse) — fed at a controlled concentration. Because dust grade, airflow rate, and terminal restriction are all fixed by the test protocol, ISO 5011 results are reproducible and directly comparable between filter elements from different manufacturers.'
    },
    {
      title: 'Why it matters for air intake protection',
      content: 'An engine ingests several thousand cubic meters of air for every liter of fuel burned. Airborne dust that passes the air filter enters the combustion chamber, where hard silica particles embed in cylinder walls and abrade piston rings — the dominant wear mechanism in dusty operating environments. ISO 5011 is the measurement layer that makes air filter performance a verifiable engineering quantity instead of a marketing claim: an element rated 99.9% efficient under ISO 5011 with SAE Fine dust passes a known, bounded mass of dust into the engine over its service life. Without ISO 5011 data, two visually identical elements can differ by an order of magnitude in the dust mass they pass downstream. The standard also quantifies dust-holding capacity, which determines service interval: an element with higher capacity reaches its terminal restriction later, extending the interval between replacements without sacrificing engine protection.'
    },
    {
      title: 'Application in engines and equipment',
      content: 'When an OEM specifies an air cleaner for a heavy-duty diesel engine, the specification includes ISO 5011 test conditions: rated airflow (for example 15 m³/min), initial restriction limit (typically below 1.5 kPa clean), terminal restriction (typically 5.0–6.25 kPa for heavy-duty applications), minimum overall efficiency (99.9%+ for turbocharged diesel engines), and minimum dust capacity at that airflow. In agriculture and mining, where ambient dust concentrations can exceed 100 mg/m³, elements are validated with ISO 12103-1 A4 Coarse dust to represent field conditions. MACROCORE air filtration elements are validated under this protocol: the progressive-density-gradient (PDG) media structure is tested for initial restriction, fractional efficiency across the particle size spectrum, and dust-holding capacity at rated airflow, with the results forming the basis of published efficiency figures. ISO 5011 works alongside SAE J726 (the historical air cleaner test code it superseded and harmonized) and SAE J1539, which addresses air induction system integrity — leaks downstream of the filter bypass even a perfect element.'
    }
  ];

  const faqs = [
    {
      question: 'What is the difference between ISO 5011 and ISO 16889?',
      answer: 'ISO 5011 tests air filter elements using dry standardized dust carried in an air stream; it reports efficiency, restriction, and dust-holding capacity for air intake filtration. ISO 16889 is the multi-pass test for liquid filters (hydraulic and lube oil), where contaminated fluid is recirculated through the element and upstream/downstream particle counts produce a Beta ratio. The two standards belong to different domains: ISO 5011 governs air intake elements; ISO 16889 governs hydraulic and lubrication filter elements. Neither can substitute for the other.'
    },
    {
      question: 'What test dust does ISO 5011 use?',
      answer: 'ISO 5011 uses standardized test dusts defined in ISO 12103-1: A2 Fine test dust (particle distribution concentrated below 80 µm, representative of general on-road and moderate off-road environments) and A4 Coarse test dust (extends to 180 µm, representative of severe off-road, agricultural, and mining environments). The dust grade must always be reported with the result — an efficiency figure is meaningless without stating which dust it was measured with, because coarse dust is easier to capture and produces higher apparent efficiency.'
    },
    {
      question: 'What is terminal restriction and why does it define filter life?',
      answer: 'Terminal restriction is the maximum pressure drop across the air filter at which the engine manufacturer requires element replacement — typically 5.0 to 6.25 kPa for heavy-duty diesel engines and around 2.5 kPa for light-duty applications. As the element loads with dust, restriction rises; beyond the terminal limit, the engine loses volumetric efficiency (reduced air charge, incomplete combustion, higher fuel consumption and exhaust temperature). In an ISO 5011 capacity test, dust is fed until the element reaches terminal restriction; the mass of dust retained at that point is the dust-holding capacity, which directly determines the service interval in a given dust environment.'
    },
    {
      question: 'Does a higher ISO 5011 efficiency always mean a better air filter?',
      answer: 'Not in isolation. Efficiency, restriction, and capacity form a trade-off triangle: denser media raises efficiency but also raises initial restriction and can reduce dust-holding capacity, shortening service life. A properly engineered element balances all three for the target application. Progressive-density media (coarse fibers upstream, fine fibers downstream) captures large particles in the depth of the media and reserves the fine downstream layer for small particles, achieving high efficiency without the restriction penalty of a uniformly dense medium. Evaluating a filter requires all three ISO 5011 results together, at the rated airflow of the actual application.'
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
            Inlet Air Cleaning Equipment for Internal Combustion Engines and Compressors — Performance Testing
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
            What is ISO 5011?
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'justify', lineHeight: 1.8,
          }}>
            ISO 5011 is the international standard that specifies performance test methods for air filter elements used in{' '}
            <Link href="/knowledge-system/standards/air-intake-systems" style={{ color: '#FFF12D', textDecoration: 'underline' }}>engine air intake systems</Link>{' '}
            and compressor inlets. It defines how to measure initial restriction, filtration efficiency, and dust-holding capacity on a controlled airflow test bench using standardized ISO 12103-1 test dusts. ISO 5011 exists because air filter performance cannot be judged visually: two elements of identical size and appearance can pass dramatically different quantities of abrasive dust into an engine. Dust that penetrates the air filter is the primary driver of{' '}
            <Link href="/knowledge-system/contamination/particle-wear" style={{ color: '#FFF12D', textDecoration: 'underline' }}>abrasive particle wear in cylinder liners and piston rings</Link>, which is why OEM air cleaner specifications for turbocharged diesel engines require ISO 5011-verified overall efficiency of 99.9% or higher with the specified test dust at rated airflow.
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
        <p>SEMANTIC_DOMAINS: Air Filter Element Testing [PRIMARY], Dust-Holding Capacity Measurement [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: air_intake, engine, turbocharger, compressor_inlet</p>
        <p>CONCEPT_TAXONOMY: type=standard | domain=air-filtration-testing | standards=ISO-5011, ISO-12103-1, SAE-J726</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 5011, ISO 12103-1, SAE J726, SAE J1539</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/particle-wear</p>
        <p>&nbsp;&nbsp;Related_Technologies: MACROCORE</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/reducing-downtime</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/standards/iso-5011</p>
        <p>&nbsp;&nbsp;concept_id: iso-5011-air-filter-testing</p>
        <p>&nbsp;&nbsp;version: 2.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-07-03</p>
      </RetrievalBlock>

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        '@id': 'https://elimfilters.com/knowledge-system/standards/iso-5011',
        headline: 'ISO 5011 — Air Filter Element Test Standard for Internal Combustion Engines',
        description: 'ISO 5011 specifies test methods for evaluating air filter element performance including initial restriction, filtration efficiency with ISO 12103-1 test dust, and dust-holding capacity. Defines standardized procedures for measuring filtration efficiency and service life of air intake filter elements.',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        dateModified: '2026-07-03',
        keywords: ['ISO 5011', 'air filter testing', 'dust holding capacity', 'initial restriction', 'air intake filtration', 'ISO 12103-1 test dust', 'SAE J726', 'engine air filter efficiency'],
        about: { '@type': 'Thing', name: 'ISO 5011 Air Filter Testing', description: 'International standard for measuring air filter element performance including efficiency, dust holding capacity, and restriction under controlled airflow test conditions.' },
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
