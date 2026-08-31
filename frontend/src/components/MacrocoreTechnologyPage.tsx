import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import MacrocoreConceptDiagram from './technologies/MacrocoreConceptDiagram';
import { ApplicationCards } from './technologies/ApplicationCards';
import { MACROCORE_APPLICATIONS } from '@/lib/macrocore-applications';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/technologies/macrocore/`;

const protectionPath = [
  ['AMBIENT AIR', 'Dust, soot, fibers and airborne debris enter through the intake environment.'],
  ['PRIMARY FILTRATION', 'The primary element carries the normal contamination load while maintaining the airflow required by the engine application.'],
  ['SECONDARY PROTECTION', 'Where specified, a safety element protects the clean-air side during primary-element service or abnormal primary-element conditions.'],
  ['SEALED CLEAN-AIR PATH', 'Housing condition, element fit and sealing geometry preserve the contamination boundary downstream of the filter.'],
  ['ENGINE', 'Controlled intake contamination helps protect turbocharger compressor surfaces, cylinder walls, piston rings and the combustion-air path.'],
] as const;

const decisionFactors = [
  ['Airflow Demand', 'Engine displacement, operating load and intake-system design determine the airflow that the filter and housing must support.'],
  ['Restriction', 'The selected configuration must remain compatible with the restriction limits defined by the equipment application.'],
  ['Dust Loading', 'Contaminant concentration, particle distribution and duty environment influence media loading and service behavior.'],
  ['Housing + Seal', 'Dimensions alone do not prove fit. Element retention, gasket geometry, housing condition and clean-side sealing are part of the protection decision.'],
  ['Primary vs. Secondary Role', 'Primary and safety elements occupy different positions in the intake architecture and should not be treated as interchangeable components.'],
  ['Service Strategy', 'Restriction indication, inspection history and operating environment should guide maintenance rather than visual appearance alone.'],
] as const;

const protectedAssets = [
  ['Turbocharger Compressor', 'Airborne particulate reaching compressor surfaces can contribute to erosive wear and loss of surface integrity.'],
  ['Cylinder Walls', 'Fine particulate entering the combustion air path can contribute to abrasive contact at the cylinder interface.'],
  ['Piston Rings', 'Dust ingestion can increase abrasive exposure at ring and liner surfaces.'],
  ['Combustion Air Path', 'The intake system must deliver required air while preserving the clean-air boundary.'],
] as const;

const fieldSignals = [
  'Repeated premature restriction or unusually short air-filter intervals',
  'Dust tracks or contamination observed on the clean side of the intake system',
  'Recurring housing, clamp, gasket or sealing problems',
  'Air-filter selection being made only from dimensions or visual similarity',
  'Severe dust exposure that does not match the original service strategy',
  'Primary and secondary element roles being confused during service',
] as const;

const faqs = [
  ['What is MACROCORE™?', 'MACROCORE™ is the ELIMFILTERS engine-air filtration architecture used for primary and secondary intake protection. It is applied within the Air Intake & Airflow Protection system.'],
  ['What does MACROCORE™ protect?', 'The technology is used to control airborne contamination before it reaches the clean-air side of the engine intake system, helping protect downstream surfaces such as the turbocharger compressor, cylinders and piston rings.'],
  ['Is MACROCORE™ a product family?', 'No. MACROCORE™ is the technology architecture. Primary Air Filters and Secondary / Safety Air Elements are product families that use the technology. Individual part numbers are selected only after the application is validated.'],
  ['What is the difference between a primary and a secondary air element?', 'The primary element carries the normal contamination load. A secondary or safety element, where the intake system specifies one, provides an additional clean-side protection layer during service or abnormal primary-element conditions.'],
  ['Can an engine air filter be selected only by dimensions?', 'No. Dimensions are useful evidence, but airflow demand, restriction, seal geometry, housing fit, element position and application compatibility also matter.'],
  ['Should an engine air filter be replaced because it looks dirty?', 'Not by appearance alone. The equipment maintenance strategy, restriction condition and inspection of the complete intake system should guide service decisions.'],
  ['What does ISO 5011 mean for MACROCORE™?', 'ISO 5011 provides test methods used for engine air-cleaner and filter performance evaluation. Product-level performance claims should remain tied to validated data for the specific element or assembly rather than treated as universal values for the technology.'],
  ['What information is useful for a MACROCORE™ application review?', 'Equipment model, engine, current element reference, housing information, operating environment, duty cycle and any history of restriction, dust bypass or premature service are useful starting points.'],
] as const;

const families = [
  ['Primary Air Filters', '/families/primary-air/', 'Main engine-intake contamination barrier for the normal service load.'],
  ['Secondary / Safety Air Elements', '/families/secondary-air/', 'Additional downstream protection where the intake architecture specifies a secondary element.'],
] as const;

export function MacrocoreTechnologyPage() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      '@id': `${PAGE_URL}#article`,
      headline: 'MACROCORE™ Engine Air Filtration Technology',
      name: 'MACROCORE™',
      url: PAGE_URL,
      description: 'MACROCORE™ is the ELIMFILTERS engine-air filtration architecture for primary and secondary intake protection, connecting airflow demand, contamination loading, housing integrity and validated application evidence.',
      author: { '@id': `${BASE_URL}/#organization` },
      publisher: { '@id': `${BASE_URL}/#organization` },
      about: {
        '@type': 'DefinedTerm',
        '@id': `${PAGE_URL}#technology`,
        name: 'MACROCORE™',
        description: 'ELIMFILTERS engine-air filtration architecture for primary and secondary intake protection.',
        inDefinedTermSet: `${BASE_URL}/technologies/`,
      },
      mentions: [
        { '@type': 'Thing', name: 'Engine air filtration' },
        { '@type': 'Thing', name: 'Air intake contamination control' },
        { '@type': 'Thing', name: 'Primary air filters' },
        { '@type': 'Thing', name: 'Secondary safety air elements' },
        { '@type': 'Thing', name: 'ISO 5011' },
        { '@type': 'Thing', name: 'Air Intake & Airflow Protection' },
      ],
      isPartOf: { '@id': `${BASE_URL}/#website` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Technologies', item: `${BASE_URL}/technologies/` },
        { '@type': 'ListItem', position: 3, name: 'MACROCORE™', item: PAGE_URL },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'MACROCORE product families',
      itemListElement: families.map(([name, href], index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name,
        url: `${BASE_URL}${href}`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  ];

  return (
    <main style={main}>
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <PageHeader breadcrumbs={[{ label: 'Technologies', href: '/technologies/' }]} currentPage="MACROCORE™" />

      <section style={hero}>
        <img src="/images/mecanica-air.avif" alt="Engine air intake filtration application" style={heroMedia} />
        <div style={heroOverlay} />
        <div style={heroInner}>
          <img src="/assets/MACROCORE_final.avif" alt="MACROCORE technology" style={technologyMark} />
          <p style={eyebrow}>ENGINE AIR FILTRATION TECHNOLOGY</p>
          <h1 style={heroTitle}>MACROCORE™<br /><span style={{ color: '#FFF12D' }}>Engine Air Protection</span></h1>
          <p style={heroPromise}>Control airborne contamination without losing sight of airflow, restriction, sealing integrity and the real intake duty cycle.</p>
          <p style={heroLead}>MACROCORE™ is the ELIMFILTERS technology architecture for primary and secondary engine-air filtration. It connects media configuration, airflow management, housing integrity and application evidence before a part number is selected.</p>
          <div style={buttonRow}>
            <Link href="#selection" style={yellowButton}>IDENTIFY THE INTAKE REQUIREMENT</Link>
            <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence" style={darkButton}>FIND MY FILTER</a>
          </div>
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}>DIRECT ANSWER</p>
        <div style={twoCol}>
          <h2 style={h2}>The filter media is only one part of the clean-air boundary.</h2>
          <div>
            <p style={lead}>Engine air protection depends on the complete intake path: ambient contamination, primary filtration, any specified secondary element, element fit, housing condition, seal integrity and the airflow required by the engine.</p>
            <p style={body}>MACROCORE™ belongs to the ELIMFILTERS Air Intake & Airflow Protection system. The technology is implemented through Primary Air Filters and Secondary / Safety Air Elements; compatibility is resolved at the application and part-number level.</p>
          </div>
        </div>
      </section>

      <section style={mediaFeatureSection}>
        <div style={mediaFeatureGrid}>
          <div>
            <p style={eyebrow}>APPLICATION</p>
            <p style={applicationText}>Primary and secondary engine air-intake filtration</p>
            <h2 style={{ ...h2, marginTop: '1.4rem' }}>Airflow Management and Particle Control</h2>
            <p style={{ ...lead, marginTop: '1.5rem' }}>MACROCORE™ is the ELIMFILTERS architecture for engine air-intake protection. It integrates media configuration, contaminant-holding capacity, restriction control, and sealing integrity according to airflow demand and operating conditions.</p>
          </div>
          <figure style={mediaFigure}>
            <img
              src="/images/MACROCORE-media.png"
              alt="Conceptual fibrous structure representing MACROCORE engine air-intake filtration media architecture"
              style={mediaImage}
            />
            <figcaption style={mediaCaption}>Conceptual representation of a fibrous structure. This image is not an actual MACROCORE™ micrograph.</figcaption>
          </figure>
        </div>
      </section>

      <section style={sectionAlt}>
        <p style={eyebrow}>CONTAMINATION PATH</p>
        <h2 style={h2}>Follow the air from the environment to the engine.</h2>
        <div style={pathGrid}>
          {protectionPath.map(([title, text], index) => (
            <article key={title} style={pathCard}>
              <span style={number}>{String(index + 1).padStart(2, '0')}</span>
              <h3 style={h3}>{title}</h3>
              <p style={body}>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}>ENGINEERING ARCHITECTURE</p>
        <h2 style={h2}>Airflow and contamination control have to coexist.</h2>
        <p style={{ ...lead, maxWidth: '900px' }}>A filtration configuration cannot be judged by efficiency alone. The engineering decision has to keep contamination on the dirty side while preserving the airflow and restriction behavior required by the actual intake system.</p>
        <div style={{ marginTop: '2.2rem' }}>
          <MacrocoreConceptDiagram />
        </div>
      </section>

      <section id="selection" style={sectionAlt}>
        <p style={eyebrow}>SELECTION LOGIC</p>
        <h2 style={h2}>Six factors determine whether the air-filter decision is technically complete.</h2>
        <div style={grid3}>
          {decisionFactors.map(([title, text]) => (
            <article key={title} style={card}>
              <h3 style={h3}>{title}</h3>
              <p style={body}>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}>WHAT SITS DOWNSTREAM</p>
        <h2 style={h2}>The protected asset begins after the clean-air seal.</h2>
        <div style={grid2}>
          {protectedAssets.map(([title, text]) => (
            <article key={title} style={lineCard}>
              <h3 style={h3}>{title}</h3>
              <p style={body}>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={sectionAlt}>
        <p style={eyebrow}>PRODUCT ARCHITECTURE</p>
        <h2 style={h2}>Technology first. Product family second. Validated part number last.</h2>
        <div style={grid2}>
          {families.map(([name, href, description]) => (
            <Link key={name} href={href} style={familyCard}>
              <h3 style={h3}>{name}</h3>
              <p style={body}>{description}</p>
              <span style={smallLink}>VIEW PRODUCT FAMILY →</span>
            </Link>
          ))}
        </div>
        <div style={architectureFlow}>
          {['AIR INTAKE & AIRFLOW PROTECTION', 'MACROCORE™', 'PRIMARY / SECONDARY AIR FAMILY', 'VALIDATED PART NUMBER'].map((item) => (
            <div key={item} style={decisionStep}>{item}</div>
          ))}
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}>VALIDATION CONTEXT</p>
        <div style={twoCol}>
          <h2 style={h2}>ISO 5011 is a test framework, not a universal performance claim.</h2>
          <div>
            <p style={lead}>Engine air-cleaner performance is commonly evaluated using ISO 5011 methods. The standard provides a controlled basis for evaluating relevant filter or air-cleaner performance characteristics.</p>
            <p style={body}>Published efficiency, dust-capacity, restriction or durability values should remain tied to validated test data for the specific element or assembly. MACROCORE™ should not be presented as having one universal numeric performance value across every product and application.</p>
          </div>
        </div>
      </section>

      <section style={sectionAlt}>
        <p style={eyebrow}>FIELD SIGNALS</p>
        <h2 style={h2}>When the problem is bigger than a replacement element.</h2>
        <div style={signalGrid}>
          {fieldSignals.map((item) => <div key={item} style={signal}>{item}</div>)}
        </div>
        <p style={{ ...body, maxWidth: '860px', marginTop: '1.8rem' }}>These conditions call for intake-system review before treating repeated filter replacement as the complete solution.</p>
      </section>

      <section style={section}>
        <p style={eyebrow}>OPERATING ENVIRONMENTS</p>
        <h2 style={h2}>MACROCORE™ follows the intake duty, not an industry label alone.</h2>
        <p style={{ ...lead, maxWidth: '900px', marginBottom: '2rem' }}>The same technology can serve different industries, but selection still depends on the equipment, engine, housing, airflow requirement, dust exposure and validated application evidence.</p>
        <ApplicationCards applications={MACROCORE_APPLICATIONS} />
      </section>

      <section style={sectionAlt}>
        <p style={eyebrow}>FROM INTAKE CONDITION TO PART</p>
        <h2 style={h2}>Resolve the application in a controlled sequence.</h2>
        <div style={architectureFlow}>
          {['1. EQUIPMENT + ENGINE', '2. HOUSING + ELEMENT POSITION', '3. AIRFLOW + RESTRICTION', '4. DUST / DUTY ENVIRONMENT', '5. OEM + DIMENSIONAL EVIDENCE', '6. VALIDATED ELIMFILTERS PART'].map((item) => (
            <div key={item} style={decisionStep}>{item}</div>
          ))}
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}>FREQUENT QUESTIONS</p>
        <h2 style={h2}>MACROCORE™ Engine Air Protection</h2>
        <div style={faqGrid}>
          {faqs.map(([question, answer]) => (
            <article key={question} style={faqCard}>
              <h3 style={faqQuestion}>{question}</h3>
              <p style={body}>{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={finalCta}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <p style={eyebrow}>HAVE AN ENGINE AIR APPLICATION TO RESOLVE?</p>
          <h2 style={h2}>Start with the intake system, not with a visually similar filter.</h2>
          <p style={{ ...lead, maxWidth: '800px' }}>Send the equipment, engine, current element reference, housing information, duty environment and any restriction or dust-bypass history. That evidence is used to identify the correct protection path before the final part number is accepted.</p>
          <div style={buttonRow}>
            <a href="mailto:applications@elimfilters.com?subject=MACROCORE%20Application%20Support" data-conversion-action="application-support" style={yellowButton}>IDENTIFY MY MACROCORE APPLICATION</a>
            <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence" style={darkButton}>PART SEARCH</a>
            <Link href="/systems/air-intake/" style={darkButton}>AIR INTAKE SYSTEM</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';
const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont, overflowX: 'hidden' };
const hero: CSSProperties = { minHeight: '90vh', position: 'relative', display: 'flex', alignItems: 'center', padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const heroMedia: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.5 };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,.94) 0%, rgba(0,0,0,.76) 52%, rgba(0,0,0,.38) 100%)' };
const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };
const technologyMark: CSSProperties = { width: 'min(320px, 58vw)', height: 'auto', objectFit: 'contain', marginBottom: '1.5rem', filter: 'brightness(1.12)' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(3rem, 7vw, 6.6rem)', lineHeight: 0.9, letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0, maxWidth: '1000px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(1.1rem, 2vw, 1.45rem)', lineHeight: 1.35, maxWidth: '850px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem, 1.6vw, 1.18rem)', lineHeight: 1.72, color: 'rgba(255,255,255,.72)', maxWidth: '860px', margin: '1rem 0 0' };
const section: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', maxWidth: '1320px', margin: '0 auto', width: '100%' };
const sectionAlt: CSSProperties = { ...section, maxWidth: 'none', background: 'rgba(255,255,255,.025)', borderTop: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const mediaFeatureSection: CSSProperties = { ...section, maxWidth: 'none', background: 'linear-gradient(135deg, rgba(255,241,45,.055), rgba(255,255,255,.018) 42%, rgba(0,0,0,0) 100%)', borderTop: '1px solid rgba(255,241,45,.14)', borderBottom: '1px solid rgba(255,255,255,.07)' };
const mediaFeatureGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 'clamp(2.5rem,6vw,5.5rem)', alignItems: 'center' };
const applicationText: CSSProperties = { margin: 0, maxWidth: '720px', color: 'rgba(255,255,255,.78)', fontSize: 'clamp(1rem,1.45vw,1.14rem)', lineHeight: 1.55, fontWeight: 600 };
const mediaFigure: CSSProperties = { margin: 0, width: '100%' };
const mediaImage: CSSProperties = { display: 'block', width: '100%', height: 'auto', objectFit: 'contain', border: '1px solid rgba(255,255,255,.1)', background: '#050505' };
const mediaCaption: CSSProperties = { marginTop: '.85rem', fontSize: '.78rem', lineHeight: 1.55, color: 'rgba(255,255,255,.48)', fontStyle: 'italic' };
const twoCol: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(2rem,6vw,5rem)', alignItems: 'start' };
const eyebrow: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, fontSize: '.72rem', letterSpacing: '.22em', textTransform: 'uppercase', margin: '0 0 1rem' };
const h2: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2rem,4vw,3.6rem)', lineHeight: .98, letterSpacing: '-.035em', textTransform: 'uppercase', margin: 0 };
const h3: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase', margin: '0 0 .8rem' };
const lead: CSSProperties = { fontSize: 'clamp(1.05rem,1.7vw,1.3rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.84)', margin: 0 };
const body: CSSProperties = { fontSize: '1rem', lineHeight: 1.76, color: 'rgba(255,255,255,.62)', margin: '.8rem 0 0' };
const buttonRow: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.85rem', marginTop: '2rem' };
const yellowButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', padding: '1rem 1.25rem', fontFamily: displayFont, fontWeight: 700, fontSize: '.78rem', letterSpacing: '.1em' };
const darkButton: CSSProperties = { display: 'inline-block', background: 'rgba(0,0,0,.5)', color: '#FFF12D', textDecoration: 'none', padding: '1rem 1.25rem', border: '1px solid rgba(255,241,45,.35)', fontFamily: displayFont, fontWeight: 700, fontSize: '.78rem', letterSpacing: '.1em' };
const pathGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '1px', background: 'rgba(255,255,255,.08)', marginTop: '2.2rem' };
const pathCard: CSSProperties = { background: '#050505', padding: '1.5rem' };
const number: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, fontSize: '.72rem', letterSpacing: '.15em', display: 'block', marginBottom: '1rem' };
const grid3: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1px', background: 'rgba(255,255,255,.08)', marginTop: '2.2rem' };
const grid2: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1rem', marginTop: '2.2rem' };
const card: CSSProperties = { background: '#050505', border: '1px solid rgba(255,255,255,.08)', padding: '1.5rem' };
const lineCard: CSSProperties = { borderTop: '1px solid rgba(255,241,45,.28)', padding: '1.4rem 0' };
const familyCard: CSSProperties = { textDecoration: 'none', color: '#fff', border: '1px solid rgba(255,255,255,.1)', background: '#050505', padding: '1.6rem', display: 'block' };
const smallLink: CSSProperties = { display: 'inline-block', marginTop: '1.2rem', color: '#FFF12D', fontFamily: displayFont, fontSize: '.68rem', fontWeight: 700, letterSpacing: '.13em' };
const architectureFlow: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1px', background: 'rgba(255,255,255,.08)', marginTop: '2.4rem' };
const decisionStep: CSSProperties = { background: '#050505', padding: '1.25rem', color: 'rgba(255,255,255,.82)', fontFamily: displayFont, fontWeight: 700, fontSize: '.76rem', letterSpacing: '.08em', lineHeight: 1.45 };
const signalGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '.8rem', marginTop: '2rem' };
const signal: CSSProperties = { padding: '1.1rem 1.2rem', border: '1px solid rgba(255,255,255,.09)', background: '#050505', color: 'rgba(255,255,255,.72)', lineHeight: 1.6 };
const faqGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(310px,1fr))', gap: '1rem', marginTop: '2.2rem' };
const faqCard: CSSProperties = { borderTop: '1px solid rgba(255,241,45,.3)', padding: '1.35rem 0' };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: '1rem', lineHeight: 1.4, margin: 0 };
const finalCta: CSSProperties = { padding: 'clamp(5rem,9vw,8rem) clamp(1.25rem,6vw,6rem)', background: 'radial-gradient(circle at 50% 0%,rgba(255,241,45,.16),transparent 42%)', borderTop: '1px solid rgba(255,241,45,.2)' };
