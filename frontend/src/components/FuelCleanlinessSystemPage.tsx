import { ReviewedText } from '@/components/ReviewedText';
import { ReviewedImage } from '@/components/ReviewedMedia';
import { PublicUiText } from '@/components/PublicUiText';
import Link from '@/components/LocalizedLink';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import airStyles from './AirIntakeSystemPage.module.css';
import fuelStyles from './FuelCleanlinessSystemPage.module.css';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/systems/fuel-cleanliness/`;

const pathways = [
  [
    'PARTICULATE CONTROL', 'Hard particles + storage debris + transfer contamination',
    'SYNTAPORE™', '/technologies/syntapore/', '/images/fuel-filter.avif',
    'Particulate capture in approved primary, secondary, spin-on and cartridge diesel positions. Media selection balances particle-control objectives, contaminant capacity and fuel-side pressure loss.',
    'Verify engine, filtration stage, required fuel flow, permissible pressure differential, sealing interfaces and application evidence. Particulate filtration alone does not establish water-separation capability.'
  ],
  [
    'FUEL / WATER SEPARATION', 'Free water + entrained moisture before sensitive fuel components',
    'HYDROCORE™', '/technologies/hydrocore/', '/images/fuellseparator-hero.avif',
    'Conventional non-turbine fuel/water separation architecture for approved spin-on or cartridge separators, including applicable drain and transparent-bowl configurations. Free-water and dispersed-water performance depends on the validated assembly.',
    'Confirm fuel flow, incoming water condition, separation-media specification, drainage, bowl configuration and downstream component requirements. FH/FG turbine-style assemblies are outside HYDROCORE™ scope.'
  ],
  [
    'TURBINE-SERIES SEPARATION', 'Multi-stage fuel conditioning in applicable FH / FG turbine systems',
    'TURBOCORE™', '/technologies/turbocore/', '/images/turbine-1.avif',
    'Dedicated multi-stage fuel/water separation architecture for approved FH/FG turbine-style assemblies, compatible replacement elements and approved fuel-processor housings.',
    'Verify the exact housing series, element specification, flow routing, sealing geometry, bowl or drainage arrangement and documented application. TURBOCORE™ is not interchangeable with conventional HYDROCORE™ separators.'
  ]
] as const;

const protectedFunctions = [
  ['Fuel Supply Path', 'Primary and secondary filtration reduce particulate load before fuel reaches precision pumps and injectors.'],
  ['Water Control', 'Fuel/water separation addresses free water and moisture exposure before it enters downstream fuel-system components.'],
  ['Stored Fuel Integrity', 'Storage, transfer and condensation can introduce contamination before the engine is even started, making upstream control part of system protection.'],
  ['Injection-System Protection', 'Modern diesel fuel systems use tight clearances, so product selection has to reflect the actual engine, fuel path and validated application evidence.'],
] as const;

const families = [
  ['Primary Fuel Filters', 'primary-fuel', 'First-stage particulate control in applicable diesel fuel systems'],
  ['Secondary Fuel Filters', 'secondary-fuel', 'Downstream fine filtration where the application uses a secondary stage'],
  ['Fuel / Water Separators', 'fuel-water-separators', 'Water-separation protection for applicable diesel fuel systems'],
  ['Fuel Turbine Elements', 'fuel-turbine', 'Replacement elements for applicable FH / FG turbine-series fuel-separation systems'],
] as const;

const standards = [
  ['ASTM D6304', 'Water determination is used as evidence for fuel moisture condition and belongs to the applicable fuel-analysis context.'],
  ['ISO 12937', 'Water content in petroleum products is a distinct measurement domain that supports fuel-condition evaluation.'],
  ['ISO 16332', 'Fuel/water separation performance belongs to the applicable separator and product-family context rather than every fuel filter indiscriminately.'],
] as const;

const faqs = [
  ["What is Fuel Cleanliness Protection?", "ELIMFILTERS coordinates particle filtration and water separation to help protect diesel pumps, injectors and sensitive components. Selection follows the actual fuel-system configuration and validated application."],
  ["Which ELIMFILTERS technologies belong to Fuel Cleanliness Protection?", "SYNTAPORE™ controls particles; HYDROCORE™ separates water in conventional non-turbine systems; TURBOCORE™ serves approved FH/FG turbine-style assemblies. Each technology has a distinct application."],
  ["Is every fuel filter a fuel/water separator?", "No. Particle filtration and water separation are separate functions. Check the filtration stage, separator design and approved application before selecting a filter."],
  ["Why does stored fuel matter?", "Storage and transfer can introduce water and sediment before fuel reaches the engine. Proper handling, filtration and applicable water separation help limit downstream contamination."],
  ["Can a fuel filter be selected only from a cross reference?", "No. A cross-reference identifies a candidate. Confirm the engine, filtration stage, separation function, dimensions and validated OEM application before installation."],
  ["What information is useful for fuel-filter identification?", "Provide the equipment model, engine, installed filter or OEM number, filtration stage, housing configuration and dimensions. Include any known water-contamination or service issues."],
  ["Where does the turbine-series product line fit?", "TURBOCORE™ elements serve compatible FH/FG turbine-style fuel separation systems. Confirm housing, element series and sealing configuration; these elements are not interchangeable with conventional separators."],
] as const;

export function FuelCleanlinessSystemPage() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${PAGE_URL}#webpage`,
      name: 'Fuel Cleanliness Protection',
      url: PAGE_URL,
      description: 'Fuel cleanliness protection architecture for particulate filtration, fuel/water separation, stored-fuel contamination control and diesel injection-system protection.',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      publisher: { '@id': `${BASE_URL}/#organization` },
      about: [
        { '@type': 'Thing', name: 'Diesel fuel filtration' },
        { '@type': 'Thing', name: 'Fuel water separation' },
        { '@type': 'Thing', name: 'Stored fuel contamination' },
        { '@type': 'Thing', name: 'Diesel injection system protection' },
      ],
      mentions: [
        { '@type': 'Thing', name: 'SYNTAPORE' },
        { '@type': 'Thing', name: 'HYDROCORE' },
        { '@type': 'Thing', name: 'TURBOCORE' },
        { '@type': 'Thing', name: 'ASTM D6304' },
        { '@type': 'Thing', name: 'ISO 12937' },
        { '@type': 'Thing', name: 'ISO 16332' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Systems', item: `${BASE_URL}/systems/` },
        { '@type': 'ListItem', position: 3, name: 'Fuel Cleanliness Protection', item: PAGE_URL },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Fuel Cleanliness Protection product families',
      itemListElement: families.map((family, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: family[0],
        url: `${BASE_URL}/families/${family[1]}/`,
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
    <main style={main} className={airStyles.page}>
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <PageHeader breadcrumbs={[{ label: 'Systems', href: '/systems/' }]} currentPage="Fuel Cleanliness Protection" />

      <section className={`${airStyles.hero} ${fuelStyles.fuelHero}`} aria-labelledby="fuel-hero-title">
        <ReviewedImage className={airStyles.heroPhoto} src="/images/hero-syntapore.avif" alt="Engine diesel fuel-filtration service environment" />
        <div className={airStyles.heroOverlay} aria-hidden="true" />
        <div className={airStyles.shell}>
          <div className={fuelStyles.heroContent}>
            <p style={eyebrow}><ReviewedText text={"DIESEL FUEL CONTAMINATION CONTROL"} /></p>
            <h1 id="fuel-hero-title" className={`${airStyles.heroTitle} ${fuelStyles.heroHeadline}`}>
              <ReviewedText text={"Fuel Cleanliness"} context="FuelCleanlinessSystemPageTitle" />
              <span className={fuelStyles.heroTitleAccent}><ReviewedText text={"Protection"} context="FuelCleanlinessSystemPageTitle" /></span>
            </h1>
            <p className={fuelStyles.heroSummary}>
              <ReviewedText text={"Control particles and water before contaminated fuel reaches precision pumps, injectors and downstream fuel-system components."} />
            </p>
            <div style={buttonRow}>
              <Link href="#fuel-path" style={yellowButton}><ReviewedText text={"IDENTIFY THE FUEL PATH"} /></Link>
              <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={darkButton}><PublicUiText textKey="publicUi.text30">{"FIND MY FILTER"}</PublicUiText></a>
            </div>
          </div>
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}><PublicUiText textKey="publicUi.text22">{"DIRECT ANSWER"}</PublicUiText></p>
        <div style={twoCol}>
          <h2 style={h2}><ReviewedText text={"Fuel cleanliness is a system decision, not a single-filter decision."} /></h2>
          <div>
            <p style={lead}><ReviewedText text={"Fuel Cleanliness Protection organizes the filtration stages that control particulate contamination and water before diesel fuel reaches sensitive downstream components."} /></p>
            <p style={body}><ReviewedText text={"Primary filtration, secondary filtration, fuel/water separation and turbine-series separation may exist in different combinations. They should not be treated as interchangeable simply because every component is installed in the fuel path."} /></p>
            <div className={airStyles.technicalRule}>
              <strong><ReviewedText text={"ENGINEERING PRINCIPLE"} /></strong>
              <p><ReviewedText text={"A filter that captures particulate is not automatically a fuel/water separator. Likewise, a separator architecture should not be assumed from external dimensions or cross-reference similarity alone."} /></p>
              <p><ReviewedText text={"ELIMFILTERS keeps the hierarchy explicit: fuel contamination problem → protection function → technology → product family → validated part number."} /></p>
            </div>
          </div>
        </div>
      </section>

      <section id="fuel-path" className={airStyles.sectionDark} aria-labelledby="fuel-tech-heading">
        <div className={airStyles.shell}>
          <p className={airStyles.eyebrow}><ReviewedText text={"PROTECTION PATHWAYS"} /></p>
          <h2 className={airStyles.h2} id="fuel-tech-heading"><ReviewedText text={"Start with the contamination function the fuel system actually requires."} /></h2>
          <p className={airStyles.sectionIntro}><ReviewedText text={"SYNTAPORE™, HYDROCORE™ and TURBOCORE™ are proprietary ELIMFILTERS engineering architectures with distinct operating scopes. A technology designation does not certify performance or authorize interchangeability."} /></p>
          <div className={fuelStyles.fuelGrid}>
            {pathways.map(([title, exposure, technology, href, photo, mechanism, verification], index) => (
              <article key={technology} className={airStyles.technologyCard}>
                <div className={airStyles.technologyMedia}>
                  <ReviewedImage src={photo} alt={`${technology} — ${title}`} loading="lazy" />
                  <span className={airStyles.cardNumber}>0{index + 1} / 03</span>
                </div>
                <div className={airStyles.technologyBody}>
                  <p className={airStyles.technicalDomain}><ReviewedText text={title} /></p>
                  <h3>{technology}</h3>
                  <dl className={airStyles.technicalData}>
                    <div>
                      <dt><ReviewedText text={"DIESEL FUEL CONTAMINATION CONTROL"} /></dt>
                      <dd><ReviewedText text={exposure} /></dd>
                    </div>
                    <div>
                      <dt><ReviewedText text={"ENGINEERING PRINCIPLE"} /></dt>
                      <dd><ReviewedText text={mechanism} /></dd>
                    </div>
                    <div>
                      <dt><ReviewedText text={"APPLICATION VERIFICATION"} /></dt>
                      <dd><ReviewedText text={verification} /></dd>
                    </div>
                  </dl>
                  <Link href={href} className={airStyles.link}>
                    <ReviewedText text={"EXPLORE TECHNOLOGY"} /> <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={sectionAlt}>
        <p style={eyebrow}><ReviewedText text={"WHAT THE SYSTEM PROTECTS"} /></p>
        <h2 style={h2}><ReviewedText text={"Fuel cleanliness starts before the high-pressure circuit."} /></h2>
        <div style={grid2}>
          {protectedFunctions.map(([title, text]) => (
            <article key={title} style={lineCard}>
              <h3 style={h3}><ReviewedText text={title} /></h3>
              <p style={body}><ReviewedText text={text} /></p>
            </article>
          ))}
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}><ReviewedText text={"PRODUCT ARCHITECTURE"} /></p>
        <h2 style={h2}><ReviewedText text={"From fuel-protection function to physical filtration component."} /></h2>
        <div className={fuelStyles.familyGrid}>
          {families.map(([name, slug, purpose], index) => (
            <Link key={slug} href={`/families/${slug}/`} className={fuelStyles.familyCard}>
              <span className={fuelStyles.familyNumber}>0{index + 1} / 04</span>
              <h3 className={fuelStyles.familyTitle}><ReviewedText text={name} /></h3>
              <p className={fuelStyles.familyPurpose}><ReviewedText text={purpose} /></p>
              <span className={fuelStyles.familyLink}><ReviewedText text={"VIEW PRODUCT FAMILY →"} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section style={sectionAlt}>
        <p style={eyebrow}><ReviewedText text={"VALIDATION CONTEXT"} /></p>
        <h2 style={h2}><ReviewedText text={"Keep measurement standards tied to the fuel function they actually describe."} /></h2>
        <p style={{ ...lead, maxWidth: '840px' }}><ReviewedText text={"Water measurement, fuel-condition evidence and separator performance are related but not interchangeable. Standards should be applied at the correct product-family and test context."} /></p>
        <div style={grid3}>
          {standards.map(([name, text]) => (
            <article key={name} style={card}>
              <p style={cardLabel}><ReviewedText text={name} /></p>
              <p style={cardBody}><ReviewedText text={text} /></p>
            </article>
          ))}
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}><ReviewedText text={"FROM FUEL CONDITION TO PART"} /></p>
        <h2 style={h2}><ReviewedText text={"Resolve the application in a controlled sequence."} /></h2>
        <div className={`decision-flow ${fuelStyles.decisionFlow}`} style={decisionFlow}>
          {['1. EQUIPMENT / VEHICLE', '2. ENGINE + FUEL SYSTEM', '3. FILTRATION STAGE', '4. WATER-SEPARATION REQUIREMENT', '5. OEM / FILTER EVIDENCE', '6. VALIDATED ELIMFILTERS PART'].map((step, i) => (
            <div key={step} className="decision-step" style={decisionStep}><span className="decision-step-index">{String(i + 1).padStart(2, '0')}</span><span className="decision-step-label"><ReviewedText text={step} stripNumber /></span></div>
          ))}
        </div>
      </section>

      <section style={sectionAlt}>
        <p style={eyebrow}><ReviewedText text={"FREQUENT QUESTIONS"} /></p>
        <h2 style={h2}><ReviewedText text={"Fuel Cleanliness Protection"} /></h2>
        <div className={`faq-grid ${fuelStyles.faqGrid}`} style={faqGrid}>
          {faqs.map(([question, answer]) => (
            <article key={question} style={faqCard}>
              <h3 style={faqQuestion}><ReviewedText text={question} /></h3>
              <p style={body}><ReviewedText text={answer} /></p>
            </article>
          ))}
        </div>
      </section>

      <section style={finalCta}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <p style={eyebrow}><ReviewedText text={"HAVE A FUEL APPLICATION TO RESOLVE?"} /></p>
          <h2 style={h2}><ReviewedText text={"Identify the fuel-protection function before selecting the part."} /></h2>
          <p style={{ ...lead, maxWidth: '800px' }}><ReviewedText text={"Use equipment, engine, fuel-system stage, separator configuration, operating conditions and available OEM or filter evidence to identify the correct ELIMFILTERS fuel-protection path."} /></p>
          <div style={buttonRow}>
            <a href="mailto:applications@elimfilters.com?subject=Fuel%20Cleanliness%20Application%20Support" style={yellowButton}><ReviewedText text={"IDENTIFY MY FUEL PROTECTION PATH"} /></a>
            <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={darkButton}>PART SEARCH</a>
          </div>
        </div>
      </section>
    </main>
  );
}

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';
const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont, overflowX: 'hidden' };
const section: CSSProperties = { padding: 'clamp(3.5rem, 6vw, 6rem) clamp(1.25rem, 4vw, 5rem)', maxWidth: '1540px', margin: '0 auto' };
const sectionAlt: CSSProperties = { ...section, maxWidth: '1540px', background: 'rgba(255,255,255,.018)', borderTop: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const twoCol: CSSProperties = { maxWidth: '1540px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,460px),1fr))', gap: 'clamp(2rem,5vw,5rem)', alignItems: 'start' };
const eyebrow: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: '.72rem', letterSpacing: '.16em', color: '#FFF12D', textTransform: 'uppercase', margin: '0 0 1rem' };
const h2: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2rem,4.2vw,3.8rem)', lineHeight: .96, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0 };
const h3: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase', margin: '0 0 .7rem' };
const lead: CSSProperties = { fontSize: 'clamp(1.02rem,1.6vw,1.18rem)', lineHeight: 1.75, color: 'rgba(255,255,255,.78)', margin: 0 };
const body: CSSProperties = { fontSize: '.98rem', lineHeight: 1.72, color: 'rgba(255,255,255,.6)', margin: '1rem 0 0' };
const grid3: CSSProperties = { maxWidth: '1540px', margin: '2.4rem auto 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: 'clamp(1rem,1.8vw,2rem)' };
const grid2: CSSProperties = { maxWidth: '1540px', margin: '2.4rem auto 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,490px),1fr))', gap: 'clamp(1rem,2vw,2rem)' };
const card: CSSProperties = { background: '#090909', border: '1px solid rgba(255,255,255,.13)', padding: 'clamp(1.3rem,2vw,2.2rem)', minWidth: 0, display: 'flex', flexDirection: 'column' };
const lineCard: CSSProperties = { background: '#080808', padding: 'clamp(1.5rem,2.4vw,2.4rem)', borderTop: '2px solid rgba(255,241,45,.5)', minWidth: 0 };
const cardLabel: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: '.76rem', letterSpacing: '.1em', color: '#FFF12D', margin: 0 };
const cardBody: CSSProperties = { fontSize: '.92rem', lineHeight: 1.65, color: 'rgba(255,255,255,.58)', margin: '.8rem 0 0' };
const technicalDetailLabel: CSSProperties = { ...cardLabel, marginTop: '1.5rem', paddingTop: '1.15rem', borderTop: '1px solid rgba(255,255,255,.13)' };
const techLink: CSSProperties = { fontFamily: displayFont, fontWeight: 700, color: '#fff', textDecoration: 'none', textTransform: 'uppercase', fontSize: '1.08rem' };
const decisionFlow: CSSProperties = { maxWidth: '1540px', margin: '2.2rem auto 0', display: 'grid', gap: '1px', background: 'rgba(255,255,255,.13)' };
const decisionStep: CSSProperties = { background: '#070707', padding: '1.6rem', fontFamily: displayFont, fontSize: '.74rem', fontWeight: 700, letterSpacing: '.08em', color: 'rgba(255,255,255,.84)', minWidth: 0 };
const faqGrid: CSSProperties = { maxWidth: '1540px', margin: '2.2rem auto 0', display: 'grid', gap: 'clamp(1rem,1.7vw,1.8rem)' };
const faqCard: CSSProperties = { background: '#0b0b0b', padding: 'clamp(1.4rem,2.2vw,2.4rem)', borderTop: '2px solid rgba(255,241,45,.65)', minWidth: 0 };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: '1rem', lineHeight: 1.3, margin: 0 };
const finalCta: CSSProperties = { padding: 'clamp(5rem,9vw,8rem) clamp(1.25rem,6vw,6rem)', background: 'linear-gradient(180deg,#050505,#000)', borderTop: '1px solid rgba(255,241,45,.16)' };
const buttonRow: CSSProperties = { display: 'flex', gap: '.9rem', flexWrap: 'wrap', marginTop: '2rem' };
const yellowButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', padding: '.95rem 1.35rem', fontFamily: displayFont, fontWeight: 700, fontSize: '.76rem', letterSpacing: '.08em', textTransform: 'uppercase' };
const darkButton: CSSProperties = { ...yellowButton, background: 'rgba(255,255,255,.06)', color: '#fff', border: '1px solid rgba(255,255,255,.15)' };
