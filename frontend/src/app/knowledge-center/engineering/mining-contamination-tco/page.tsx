import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/knowledge-center/engineering/mining-contamination-tco/`;

const faq = [
  {
    q: 'How does dust contamination affect mining equipment availability?',
    a: 'Dust can increase air-intake restriction, accelerate abrasive wear, interfere with cooling and instrumentation, and increase maintenance intervention. The operational effect depends on the asset, contamination load, system sensitivity and service discipline.',
  },
  {
    q: 'Why is contamination control part of mining total cost of ownership?',
    a: 'Filtration influences more than replacement-filter cost. Contamination can affect component life, service frequency, maintenance predictability and equipment availability, all of which contribute to lifecycle operating cost.',
  },
  {
    q: 'Which failure mechanisms are associated with mining dust?',
    a: 'Common mechanisms include abrasive wear at precision interfaces, restriction caused by accumulated particulate, impaired heat rejection, contamination of fluid systems and interference with sensors or control components.',
  },
  {
    q: 'How can contamination influence the equipment reliability curve?',
    a: 'Contamination can be introduced during commissioning, normal operation or maintenance. Depending on the system and timing, it can contribute to early-life defects, shorten the stable useful-life period or accelerate wear-out. Filtration is one part of a broader reliability strategy.',
  },
  {
    q: 'Why should filtration strategy consider component criticality?',
    a: 'Consumable filtration elements are relatively low-cost compared with engines, hydraulic pumps, injectors, transmissions and other major assemblies. Protection strategy should therefore be evaluated by the value and sensitivity of the components being protected, not by filter purchase price alone.',
  },
  {
    q: 'What information is needed to select filtration for mining equipment?',
    a: 'Selection should resolve the machine, protected system, contamination source, duty cycle, service interval, maintenance conditions, component sensitivity and available application evidence.',
  },
];

export const metadata: Metadata = {
  title: 'Mining Dust Contamination, Availability & TCO | ELIMFILTERS®',
  description: 'Engineering guide to how abrasive dust and contamination affect mining equipment availability, component life, maintenance predictability and total cost of ownership.',
  keywords: [
    'mining dust contamination',
    'mining equipment availability',
    'mining filtration TCO',
    'mining contamination control',
    'heavy equipment filtration',
    'mining maintenance reliability',
    'mining equipment lifecycle cost',
    'mining reliability engineering',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Mining Dust Contamination, Availability & TCO | ELIMFILTERS®',
    description: 'How contamination mechanisms influence mining equipment reliability, maintenance and lifecycle cost.',
    url: PAGE_URL,
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mining Dust Contamination, Availability & TCO | ELIMFILTERS®',
    description: 'Engineering guide to contamination-driven wear, restriction, maintenance burden and mining equipment availability.',
  },
};

export default function MiningContaminationTcoPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        '@id': `${PAGE_URL}#article`,
        headline: 'Mining Dust Contamination, Equipment Availability and Total Cost of Ownership',
        description: 'Engineering guide to contamination mechanisms, equipment reliability, maintenance predictability and total cost of ownership in mining operations.',
        url: PAGE_URL,
        mainEntityOfPage: { '@id': `${PAGE_URL}#page` },
        author: { '@id': `${BASE_URL}/#organization` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Mining dust contamination' },
          { '@type': 'Thing', name: 'Mining equipment availability' },
          { '@type': 'Thing', name: 'Total cost of ownership' },
          { '@type': 'Thing', name: 'Mining equipment reliability' },
          { '@type': 'Thing', name: 'Component criticality' },
          { '@type': 'Thing', name: 'Condition-based maintenance' },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#page`,
        url: PAGE_URL,
        name: 'Mining Dust Contamination, Availability & TCO',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Knowledge Center', item: `${BASE_URL}/knowledge-center/` },
          { '@type': 'ListItem', position: 3, name: 'Engineering', item: `${BASE_URL}/knowledge-center/engineering/` },
          { '@type': 'ListItem', position: 4, name: 'Mining Contamination & TCO', item: PAGE_URL },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${PAGE_URL}#faq`,
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };

  const related = [
    {
      href: '/knowledge-center/engineering/dust-failure-mechanisms-mining/',
      title: 'Mining Dust Failure Mechanisms',
      text: 'Abrasive wear, restriction, thermal load and instrumentation interference.',
    },
    {
      href: '/knowledge-center/engineering/contamination-reliability-curve/',
      title: 'Contamination & Reliability Curve',
      text: 'How contamination can influence early-life failures, useful life and wear-out.',
    },
    {
      href: '/knowledge-center/engineering/high-value-component-protection/',
      title: 'Protecting High-Value Components',
      text: 'Connect consumable protection elements to component criticality and lifecycle economics.',
    },
  ];

  return (
    <main id="main-content" style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHeader currentPage="Knowledge Center" />

      <section style={hero}>
        <div style={heroInner}>
          <Link href="/knowledge-center/engineering/" style={backLink}>← ENGINEERING</Link>
          <p style={eyebrow}>MINING / CONTAMINATION CONTROL</p>
          <h1 style={heroTitle}>Mining Dust Contamination,<br /><span style={{ color: '#FFF12D' }}>Availability & TCO</span></h1>
          <p style={heroLead}>Dust control in mining is not only a filter-maintenance issue. It is an asset-protection decision that influences component wear, service burden, equipment availability and lifecycle cost.</p>
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div style={twoColHeading}>
            <p style={eyebrow}>DIRECT ANSWER</p>
            <h2 style={sectionTitle}>Why does contamination matter to mining TCO?</h2>
          </div>
          <div>
            <p style={leadText}>Mining assets operate under sustained particulate exposure, high load and limited service windows. When contamination reaches sensitive interfaces, the consequence can move beyond a filter change into accelerated wear, restriction, thermal stress, repeated intervention and lost equipment availability.</p>
            <p style={bodyText}>The engineering objective is to control contamination before it reaches high-value interfaces and to align maintenance decisions with operating evidence. Filtration should be evaluated by what it protects and by the operational consequence of insufficient contamination control.</p>
          </div>
        </div>
      </section>

      <section style={mechanismSection}>
        <div style={contentWidth}>
          <p style={eyebrow}>FAILURE MECHANISMS</p>
          <h2 style={sectionTitle}>Four ways dust can turn into downtime.</h2>
          <div style={mechanismGrid}>
            {[
              ['01', 'Abrasive Wear', 'Hard particulate can disturb precision clearances and accelerate wear across bearings, pumps, valves, compressor surfaces and other protected interfaces.'],
              ['02', 'Restriction & Blockage', 'Accumulated particulate can increase pressure differential and reduce available flow, creating additional service demand and operating instability.'],
              ['03', 'Thermal Load', 'Dust accumulation can impair heat rejection around cooling surfaces and components, increasing thermal stress on lubricants, electronics and mechanical systems.'],
              ['04', 'Instrumentation Interference', 'Particulate can affect sensors, optical surfaces and control components, creating unreliable signals or maintenance events outside the primary filtration circuit.'],
            ].map(([num, title, text]) => (
              <article key={num} style={mechanismCard}>
                <span style={number}>{num}</span>
                <h3 style={cardTitle}>{title}</h3>
                <p style={bodyText}>{text}</p>
              </article>
            ))}
          </div>
          <Link href="/knowledge-center/engineering/dust-failure-mechanisms-mining/" style={inlineLink}>EXPLORE FAILURE MECHANISMS →</Link>
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div style={twoColHeading}>
            <p style={eyebrow}>RELIABILITY CURVE</p>
            <h2 style={sectionTitle}>Contamination can move failure behavior earlier.</h2>
          </div>
          <div>
            <p style={leadText}>The classic reliability curve separates early-life failures, a useful-life period and eventual wear-out. Contamination can affect any phase when it enters during assembly, commissioning, operation or maintenance.</p>
            <div style={phaseList}>
              {[
                ['I', 'Early Life', 'Assembly debris, dirty fluids or commissioning contamination can expose precision interfaces before stable operation is established.'],
                ['II', 'Useful Life', 'Controlled contamination helps preserve predictable operation by limiting avoidable wear, restriction and fluid-quality deterioration.'],
                ['III', 'Wear-Out', 'As components age, accumulated wear and contamination can interact. Filtration cannot remove design-life limits, but it can reduce avoidable acceleration.'],
              ].map(([phase, title, text]) => (
                <article key={phase} style={phaseRow}>
                  <span style={phaseIndex}>{phase}</span>
                  <div><h3 style={phaseTitle}>{title}</h3><p style={bodyText}>{text}</p></div>
                </article>
              ))}
            </div>
            <Link href="/knowledge-center/engineering/contamination-reliability-curve/" style={inlineLink}>EXPLORE THE RELIABILITY MODEL →</Link>
          </div>
        </div>
      </section>

      <section style={assetSection}>
        <div style={twoCol}>
          <div style={twoColHeading}>
            <p style={eyebrow}>ASSET ECONOMICS</p>
            <h2 style={sectionTitle}>Protect expensive components with lower-cost protection elements.</h2>
          </div>
          <div>
            <p style={leadText}>The economics are asymmetric. Consumable filters, seals and service fluids sit upstream of components whose repair, replacement or unplanned removal from service can have much greater operational consequences.</p>
            <div style={hierarchyList}>
              {[
                ['Long-life asset structures', 'Frames, housings, major castings and structural assemblies intended to remain with the machine for long periods.'],
                ['High-value serviceable components', 'Turbochargers, injectors, pumps, valves, transmissions, final drives and other assemblies with significant service consequence.'],
                ['Consumable protection elements', 'Filters, seals and service fluids replaced through the lifecycle to control contamination before it reaches sensitive interfaces.'],
              ].map(([title, text]) => (
                <article key={title} style={hierarchyRow}><h3 style={hierarchyTitle}>{title}</h3><p style={bodyText}>{text}</p></article>
              ))}
            </div>
            <div style={economicsFlow}>
              {['Contamination ingress', 'Wear / restriction / thermal load', 'Component degradation', 'Unplanned intervention', 'Lower availability', 'Higher lifecycle cost'].map((step, index) => (
                <div key={step} style={economicsRow}><span style={flowIndex}>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong></div>
              ))}
            </div>
            <Link href="/knowledge-center/engineering/high-value-component-protection/" style={inlineLink}>EXPLORE COMPONENT CRITICALITY →</Link>
          </div>
        </div>
      </section>

      <section style={principleSection}>
        <div style={principle}>
          <span style={principleLabel}>ENGINEERING PRINCIPLE</span>
          <p style={principleText}>The useful question is not “How inexpensive is the filter?” but “What component, operating interval and production consequence is this filtration decision protecting?”</p>
        </div>
      </section>

      <section style={section}>
        <div style={contentWidth}>
          <p style={eyebrow}>FROM REACTIVE TO CONDITION-AWARE</p>
          <h2 style={{ ...sectionTitle, maxWidth: '900px' }}>Use operating evidence instead of generic maintenance assumptions.</h2>
          <p style={{ ...leadText, maxWidth: '900px', marginTop: '1.5rem' }}>Restriction trend, fluid cleanliness, service history, operating hours, environment, temperature and component condition can help determine whether a filtration strategy remains appropriate. The objective is not to extend every interval; it is to make the interval respond to the contamination reality.</p>
          <div style={decisionGrid}>
            {[
              ['Measure', 'Track variables that reveal contamination load, restriction or system condition.'],
              ['Interpret', 'Relate the trend to machine duty, component sensitivity and maintenance history.'],
              ['Act', 'Service or change the protection architecture when evidence indicates the current strategy is no longer adequate.'],
            ].map(([title, text]) => <div key={title} style={decisionCard}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></div>)}
          </div>
        </div>
      </section>

      <section style={relatedSection} aria-labelledby="mining-series-title">
        <div style={contentWidth}>
          <p style={eyebrow}>MINING CONTAMINATION SERIES</p>
          <h2 id="mining-series-title" style={sectionTitle}>Go deeper into the engineering decision.</h2>
          <div style={relatedGrid}>
            {related.map((item) => (
              <Link key={item.href} href={item.href} style={relatedCard}>
                <strong style={relatedTitle}>{item.title}</strong>
                <span style={relatedText}>{item.text}</span>
                <span style={relatedCta}>READ GUIDE →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={contentWidth}>
          <p style={eyebrow}>MINING CONTAMINATION QUESTIONS</p>
          <h2 id="faq-title" style={sectionTitle}>Questions asset and maintenance teams ask.</h2>
          <div style={faqList}>
            {faq.map((item, index) => (
              <article key={item.q} style={faqItem}>
                <span style={faqNumber}>{String(index + 1).padStart(2, '0')}</span>
                <div><h3 style={faqQuestion}>{item.q}</h3><p style={bodyText}>{item.a}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={ctaSection}>
        <div style={ctaGrid}>
          <div>
            <p style={eyebrow}>APPLY THIS TO A MINING ASSET</p>
            <h2 style={ctaTitle}>Connect contamination risk to the correct protection path.</h2>
            <p style={ctaText}>Provide the machine, protected system, operating environment, duty cycle and any known OEM or filter reference.</p>
          </div>
          <div style={ctaActions}>
            <Link href="/contact/" data-conversion-action="application-support" style={yellowButton}>REQUEST APPLICATION SUPPORT</Link>
            <a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={darkButton}>SEARCH PRODUCT INTELLIGENCE</a>
            <Link href="/industries/mining/" style={textLink}>RETURN TO MINING →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';
const main = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont, overflowX: 'hidden' } as const;
const hero = { padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'radial-gradient(circle at 80% 10%, rgba(255,241,45,0.13), transparent 34%), #020202' } as const;
const heroInner = { maxWidth: '1180px', margin: '0 auto' } as const;
const backLink = { display: 'inline-block', color: 'rgba(255,255,255,0.48)', textDecoration: 'none', fontFamily: displayFont, fontSize: '0.7rem', letterSpacing: '0.12em', marginBottom: '2rem' } as const;
const eyebrow = { fontFamily: displayFont, color: '#FFF12D', fontSize: '0.7rem', letterSpacing: '0.18em', fontWeight: 700, margin: '0 0 1rem', textTransform: 'uppercase' } as const;
const heroTitle = { fontFamily: displayFont, fontSize: 'clamp(3rem, 7vw, 6.6rem)', lineHeight: 0.9, letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0, maxWidth: '1100px' } as const;
const heroLead = { fontSize: 'clamp(1.1rem, 2vw, 1.45rem)', lineHeight: 1.65, color: 'rgba(255,255,255,0.82)', maxWidth: '880px', margin: '1.8rem 0 0' } as const;
const section = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.06)' } as const;
const contentWidth = { maxWidth: '1180px', margin: '0 auto' } as const;
const twoCol = { ...contentWidth, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: 'clamp(2.5rem, 7vw, 6rem)', alignItems: 'start' } as const;
const twoColHeading = { position: 'sticky', top: '7rem' } as const;
const sectionTitle = { fontFamily: displayFont, fontSize: 'clamp(2.2rem, 4.8vw, 4.2rem)', lineHeight: 0.98, letterSpacing: '-0.04em', textTransform: 'uppercase', margin: 0 } as const;
const leadText = { fontSize: 'clamp(1.08rem, 1.7vw, 1.35rem)', lineHeight: 1.68, fontWeight: 600, color: 'rgba(255,255,255,0.84)', margin: '0 0 1.3rem' } as const;
const bodyText = { fontSize: '0.98rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.64)', margin: 0, textAlign: 'left' } as const;
const mechanismSection = { ...section, background: '#050505' } as const;
const assetSection = { ...section, background: 'radial-gradient(circle at 100% 0%, rgba(255,241,45,0.06), transparent 30%), #030303' } as const;
const mechanismGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(230px, 100%), 1fr))', gap: '1px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', marginTop: '2.5rem' } as const;
const mechanismCard = { background: '#050505', padding: '1.8rem', minHeight: '270px' } as const;
const number = { fontFamily: displayFont, color: '#FFF12D', fontSize: '0.68rem', letterSpacing: '0.14em', fontWeight: 700 } as const;
const cardTitle = { fontFamily: displayFont, fontSize: '1.2rem', textTransform: 'uppercase', margin: '1.1rem 0 0.8rem' } as const;
const phaseList = { borderTop: '1px solid rgba(255,255,255,0.13)' } as const;
const phaseRow = { display: 'grid', gridTemplateColumns: '54px minmax(0,1fr)', gap: '1rem', padding: '1.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.13)' } as const;
const phaseIndex = { fontFamily: displayFont, color: '#FFF12D', fontSize: '0.8rem', fontWeight: 700, paddingTop: '0.15rem' } as const;
const phaseTitle = { fontFamily: displayFont, fontSize: '1.08rem', textTransform: 'uppercase', margin: '0 0 0.55rem' } as const;
const hierarchyList = { borderTop: '1px solid rgba(255,255,255,0.13)' } as const;
const hierarchyRow = { padding: '1.2rem 0', borderBottom: '1px solid rgba(255,255,255,0.13)' } as const;
const hierarchyTitle = { fontFamily: displayFont, color: '#FFF12D', fontSize: '0.9rem', textTransform: 'uppercase', margin: '0 0 0.5rem' } as const;
const economicsFlow = { borderTop: '1px solid rgba(255,255,255,0.12)', marginTop: '2rem' } as const;
const economicsRow = { display: 'grid', gridTemplateColumns: '42px minmax(0, 1fr)', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.12)', alignItems: 'center' } as const;
const flowIndex = { fontFamily: displayFont, color: '#FFF12D', fontSize: '0.68rem', letterSpacing: '0.1em' } as const;
const inlineLink = { display: 'inline-block', marginTop: '1.5rem', color: '#FFF12D', textDecoration: 'none', borderBottom: '1px solid rgba(255,241,45,0.5)', paddingBottom: '0.25rem', fontFamily: displayFont, fontWeight: 700, fontSize: '0.66rem', letterSpacing: '0.1em' } as const;
const principleSection = { padding: '0 clamp(1.25rem, 6vw, 6rem) clamp(4rem, 8vw, 7rem)' } as const;
const principle = { maxWidth: '1180px', margin: '0 auto', borderLeft: '4px solid #FFF12D', background: 'linear-gradient(90deg, rgba(255,241,45,0.08), rgba(255,255,255,0.018))', padding: 'clamp(2rem, 4vw, 3rem)' } as const;
const principleLabel = { fontFamily: displayFont, color: '#FFF12D', fontSize: '0.74rem', letterSpacing: '0.16em', fontWeight: 700 } as const;
const principleText = { fontSize: 'clamp(1.2rem, 2vw, 1.55rem)', lineHeight: 1.55, color: 'rgba(255,255,255,0.9)', margin: '1rem 0 0', maxWidth: '1000px' } as const;
const decisionGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '1rem', marginTop: '2.5rem' } as const;
const decisionCard = { border: '1px solid rgba(255,255,255,0.1)', background: '#050505', padding: '1.6rem', minHeight: '190px' } as const;
const relatedSection = { ...section, background: '#050505' } as const;
const relatedGrid = { marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(250px,100%),1fr))', gap: '1px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' } as const;
const relatedCard = { background: '#050505', color: '#fff', textDecoration: 'none', padding: '1.6rem', minHeight: '190px', display: 'flex', flexDirection: 'column', minWidth: 0 } as const;
const relatedTitle = { fontFamily: displayFont, color: '#FFF12D', fontSize: '1.02rem', textTransform: 'uppercase' } as const;
const relatedText = { color: 'rgba(255,255,255,0.62)', lineHeight: 1.55, fontSize: '0.9rem', marginTop: '0.8rem' } as const;
const relatedCta = { marginTop: 'auto', paddingTop: '1.2rem', color: 'rgba(255,255,255,0.78)', fontFamily: displayFont, fontSize: '0.62rem', letterSpacing: '0.1em' } as const;
const faqSection = { ...section, background: '#070707' } as const;
const faqList = { borderTop: '1px solid rgba(255,255,255,0.12)', marginTop: '2rem' } as const;
const faqItem = { display: 'grid', gridTemplateColumns: '48px minmax(0, 1fr)', gap: '1rem', padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.12)' } as const;
const faqNumber = { fontFamily: displayFont, color: '#FFF12D', fontSize: '0.68rem', letterSpacing: '0.1em' } as const;
const faqQuestion = { fontFamily: displayFont, fontSize: 'clamp(1.05rem, 1.8vw, 1.3rem)', lineHeight: 1.25, margin: '0 0 0.65rem' } as const;
const ctaSection = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', background: 'radial-gradient(circle at 0% 0%, rgba(255,241,45,0.14), transparent 32%), #020202' } as const;
const ctaGrid = { ...contentWidth, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 'clamp(2.5rem, 7vw, 6rem)', alignItems: 'center' } as const;
const ctaTitle = { ...sectionTitle, fontSize: 'clamp(2.3rem, 4.8vw, 4.4rem)' } as const;
const ctaText = { ...bodyText, marginTop: '1.4rem', maxWidth: '680px' } as const;
const ctaActions = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.8rem' } as const;
const yellowButton = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.09em', fontSize: '0.72rem', padding: '1rem 1.2rem' } as const;
const darkButton = { ...yellowButton, background: 'transparent', color: '#FFF12D', border: '1px solid rgba(255,241,45,0.42)' } as const;
const textLink = { color: 'rgba(255,255,255,0.58)', textDecoration: 'none', fontFamily: displayFont, fontSize: '0.72rem', letterSpacing: '0.08em', marginTop: '0.5rem' } as const;
