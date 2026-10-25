import { ReviewedText } from '@/components/ReviewedText';
import { SystemDisplayText } from '@/components/FamilyDisplayText';
import { PublicUiText } from '@/components/PublicUiText';
import Link from '@/components/LocalizedLink';
import type { CSSProperties } from 'react';
import { TechnologiesPortfolio } from '@/components/TechnologiesPortfolio';
import { PageHeader } from '@/components/PageHeader';
import { VIDEO_HERO_TREATMENT } from '@/lib/hero-media';
import styles from './TechnologiesLanding.module.css';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/technologies/`;

const canonicalTechnologies = [
  ['MACROCORE™', 'macrocore', 'Engine air contamination control and intake-system protection.', 'Air Intake & Airflow Protection'],
  ['MICROKAPPA™', 'microkappa', 'Cabin-air particulate and operator/passenger environment protection.', 'Air Intake & Airflow Protection'],
  ['DRYCORE™', 'drycore', 'Moisture control for applicable pneumatic and compressed-air systems.', 'Air Intake & Airflow Protection'],
  ['INTEKCORE™', 'intekcore', 'Air-cleaner housing, sealing and airflow-system integration.', 'Air Intake & Airflow Protection'],
  ['SYNTAPORE™', 'syntapore', 'Fuel particulate contamination control before precision fuel-system components.', 'Fuel Cleanliness Protection'],
  ['HYDROCORE™', 'hydrocore', 'Fuel-water separation for approved standard non-turbine separator architectures and applications.', 'Fuel Cleanliness Protection'],
  ['TURBOCORE™', 'turbocore', 'Turbine-style fuel-water separation for approved FH and FG series systems.', 'Fuel Cleanliness Protection'],
  ['SYNTRAX™', 'syntrax', 'Lubricant contamination control for protected engine and component interfaces.', 'Lubrication Protection'],
  ['NANOFORCE™', 'nanoforce', 'Hydraulic-fluid cleanliness control around pumps, valves and actuators.', 'Hydraulic Protection'],
  ['THERMACORE™', 'thermacore', 'Cooling-system cleanliness and coolant-circuit component protection.', 'Cooling System Protection'],
] as const;

const systemGroups = [
  {
    system: 'Air Intake & Airflow Protection',
    href: '/systems/air-intake/',
    technologies: ['MACROCORE™', 'INTEKCORE™', 'MICROKAPPA™', 'DRYCORE™'],
    description: 'Engine intake, housings, cabin air and applicable compressed-air drying are different airflow functions inside one protection system.',
  },
  {
    system: 'Fuel Cleanliness Protection',
    href: '/systems/fuel-cleanliness/',
    technologies: ['SYNTAPORE™', 'HYDROCORE™', 'TURBOCORE™'],
    description: 'Particulate control, standard non-turbine fuel-water separation and FH/FG turbine-style separation are distinct functions inside one fuel-cleanliness protection system.',
  },
  {
    system: 'Lubrication Protection',
    href: '/systems/lubrication/',
    technologies: ['SYNTRAX™'],
    description: 'Lubricant contamination control is tied to the protected oil circuit, engine context and validated product application.',
  },
  {
    system: 'Hydraulic Protection',
    href: '/systems/hydraulic/',
    technologies: ['NANOFORCE™'],
    description: 'Hydraulic filtration is selected around fluid cleanliness, pressure, flow, component tolerance and application evidence.',
  },
  {
    system: 'Cooling System Protection',
    href: '/systems/cooling-system/',
    technologies: ['THERMACORE™'],
    description: 'Cooling-system protection connects coolant condition and contamination control to the approved heavy-duty cooling application.',
  },
] as const;

const FIELD_CHECKS = [
  {
    system: 'Fuel-injection protection',
    href: '/systems/fuel-cleanliness/',
    exposure: 'Water and hard particles arriving from storage, transfer or the fuel circuit.',
    verification: 'Confirm filter stage, approved water-separator design, housing, drain and OEM application.',
    consequence: 'Injector and precision-pump wear, contamination recurrence and downtime.',
  },
  {
    system: 'Engine-air intake integrity',
    href: '/systems/air-intake/',
    exposure: 'Abrasive dust or unfiltered bypass around the primary and safety element seals.',
    verification: 'Inspect housing, seal compression, restriction indication and the approved element pairing.',
    consequence: 'Accelerated engine wear and service risk despite an apparently installed filter.',
  },
  {
    system: 'Hydraulic-component tolerance',
    href: '/systems/hydraulic/',
    exposure: 'Airborne ingress, reservoir debris and internal wear particles in hydraulic fluid.',
    verification: 'Check ISO 4406 target, flow, differential pressure, collapse rating and element location.',
    consequence: 'Pump scoring, sticking valves and loss of actuator reliability.',
  },
  {
    system: 'Oil and coolant service decisions',
    href: '/systems/lubrication/',
    exposure: 'Oil-borne soot and wear debris; separate corrosion or scale in coolant circuits.',
    verification: 'Verify viscosity and oil supply for SYNTRAX™; coolant chemistry and application for THERMACORE™.',
    consequence: 'Bearing wear, degraded heat transfer or unnecessary component replacement.',
  },
] as const;

const faqs = [
  ['What does an ELIMFILTERS technology identify?', 'A technology identifies the engineering method for controlling a specific contamination mechanism. Select the protected system and duty first, then confirm the product family and validated part number.'],
  ['How are technologies connected to the five protection systems?', 'Air protection has four distinct functions: MACROCORE™ engine intake, INTEKCORE™ housings, MICROKAPPA™ cabin HVAC and DRYCORE™ compressed-air drying. Fuel uses SYNTAPORE™ particles, HYDROCORE™ standard water separation and TURBOCORE™ approved FH/FG turbine systems. SYNTRAX™, NANOFORCE™ and THERMACORE™ serve lubrication, hydraulics and cooling respectively.'],
  ['Can two technologies in the same system be interchanged?', 'No. A housing architecture is not a filter medium, a particulate fuel filter is not automatically a water separator and conventional separator elements are not FH/FG turbine replacements. Validate the actual circuit and approved configuration.'],
  ['What should a maintenance engineer verify?', 'Identify the failure mechanism, contaminant exposure, required flow and pressure limits, sealing interfaces and service evidence. Confirm the OEM specification and investigate recurring contamination before changing intervals.'],
  ['What should fleet and maintenance managers monitor?', 'Track recurring water or dust ingress, restriction or pressure trends, fluid condition, service history and the operational consequence of a failure. Match inspection and stocking policies to the actual equipment and duty cycle.'],
  ['What evidence should purchasing use before approving a part?', 'A cross-reference helps narrow candidates, but final approval also needs the equipment, engine or circuit, filtration stage, housing fit, seals and validated OEM application evidence. Physical similarity alone is insufficient.'],
] as const;

export const metadata = {
  title: 'Industrial Filtration Technologies | Contamination Control | ELIMFILTERS®',
  description: 'Explore ten ELIMFILTERS filtration technologies organized inside five protection systems across air intake and airflow, fuel cleanliness, lubrication, hydraulic and cooling-system protection.',
  keywords: [
    'industrial filtration technologies',
    'filtration technology',
    'contamination control technology',
    'air intake filtration technology',
    'fuel filtration technology',
    'fuel water separation technology',
    'lubrication filtration technology',
    'hydraulic filtration technology',
    'cooling system filtration technology',
    'asset protection systems',
    'ELIMFILTERS',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Industrial Filtration Technologies | ELIMFILTERS',
    description: 'Ten ELIMFILTERS engineering technologies mapped to five protected systems, contamination risks, product families and validated applications.',
    url: PAGE_URL,
    type: 'website',
    siteName: 'ELIMFILTERS',
    images: [{ url: `${BASE_URL}/assets/logo-elimfilters.png`, width: 1200, height: 630, alt: 'ELIMFILTERS industrial filtration technologies' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Industrial Filtration Technologies | ELIMFILTERS',
    description: 'Ten filtration technologies organized inside five protection systems by contamination function and application path.',
    images: [`${BASE_URL}/assets/logo-elimfilters.png`],
  },
};

export default function TechnologiesPage() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${PAGE_URL}#collection`,
      name: 'ELIMFILTERS Industrial Filtration Technologies',
      url: PAGE_URL,
      description: 'Ten industrial filtration engineering technologies organized inside five protection systems by contamination-control function and product architecture.',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      publisher: { '@id': `${BASE_URL}/#organization` },
      about: [
        { '@type': 'Thing', name: 'Industrial filtration technology' },
        { '@type': 'Thing', name: 'Contamination control' },
        { '@type': 'Thing', name: 'Asset protection systems' },
      ],
      mentions: canonicalTechnologies.map(([name]) => ({ '@type': 'DefinedTerm', name })),
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: canonicalTechnologies.length,
        itemListElement: canonicalTechnologies.map(([name, slug, description, system], index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'DefinedTerm',
            '@id': `${BASE_URL}/technologies/${slug}/#technology`,
            name,
            description,
            url: `${BASE_URL}/technologies/${slug}/`,
            termCode: slug,
            inDefinedTermSet: { '@id': `${PAGE_URL}#collection` },
            subjectOf: { '@type': 'Thing', name: system },
          },
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Technologies', item: PAGE_URL },
      ],
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

  const renderSystemCard = (group: (typeof systemGroups)[number]) => (
    <article key={group.system} style={systemCard}>
      <Link href={group.href} style={systemName}><SystemDisplayText slug={group.href.split('/')[2]} original={group.system} /></Link>
      <p style={bodyText}><ReviewedText text={group.description} /></p>
      <div className={styles.systemTags}>
        {group.technologies.map((technology) => {
          const match = canonicalTechnologies.find(([name]) => name === technology);
          return match ? (
            <Link key={technology} href={`/technologies/${match[1]}/`}><span>{technology}</span></Link>
          ) : null;
        })}
      </div>
    </article>
  );

  return (
    <main className={`technologies-page ${styles.page}`} style={main}>
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <PageHeader currentPage="Technologies" />

      <section className={styles.hero} style={hero}>
        <video autoPlay muted loop playsInline preload="metadata" poster="/images/operator-technology.avif" style={heroImage}>
          <source src="/images/Operator_enters_machine_cabin_20_tecnology.mp4" type="video/mp4" />
        </video>
        <div style={heroOverlay} />
        <div className={styles.heroContent}>
          <p style={eyebrow}><ReviewedText text={"FILTRATION ENGINEERING ARCHITECTURE"} /></p>
          <h1 style={heroTitle}><ReviewedText text={"Industrial Filtration"} /><br />
            <span style={{ color: '#FFF12D' }}><ReviewedText text={"Technologies"} /></span>
          </h1>
          <div className={styles.heroLower}>
            <div className={styles.heroCopy}>
              <p style={heroPromise}><ReviewedText text={"The filter is the means. Asset protection is the objective."} /></p>
              <p style={heroLead}><ReviewedText text={"Select the contamination-control architecture from the equipment, exposure and critical component—not from a technology name alone."} /></p>
            </div>
            <div className={styles.heroActions}>
              <Link href="/systems/" style={yellowButton}><ReviewedText text={"START WITH A PROTECTION SYSTEM"} /></Link>
              <a href="https://part-search.elimfilters.com/" style={darkButton}><ReviewedText text={"FIND MY FILTER"} /></a>
            </div>
          </div>
        </div>
      </section>

      <section style={section} aria-labelledby="technology-context">
        <div className={styles.shell}>
          <div className={styles.editorialHeading}>
            <p style={eyebrow}><ReviewedText text={"ENGINEERING CONTEXT"} /></p>
            <h2 id="technology-context" style={sectionTitle}><ReviewedText text={"A protected asset determines the technology—not the other way around."} /></h2>
          </div>
          <div className={styles.editorialColumns}>
            <p style={leadText}><ReviewedText text={"Contamination becomes a reliability problem when particles, water, moisture or chemistry reach a component that cannot tolerate them. The relevant failure boundary depends on the circuit, equipment and duty."} /></p>
            <p style={bodyText}><ReviewedText text={"ELIMFILTERS connects that exposure to the appropriate protection system, engineered technology, product family and application evidence. Technology names describe control mechanisms; they do not, by themselves, certify efficiency or interchangeability."} /></p>
          </div>
          <div className={styles.assetPrinciple}>
            <strong><ReviewedText text={"ASSET PROTECTION"} /></strong>
            <span><ReviewedText text={"Identify the failure mode, protect the critical interface and validate the installed element. The filter is the means; uptime, component integrity and service discipline are the objective."} /></span>
          </div>
        </div>
      </section>

      <section id="technology-architecture" style={sectionAlt} aria-labelledby="systems-title">
        <div className={styles.shell}>
          <p style={eyebrow}><ReviewedText text={"FIVE PROTECTION SYSTEMS"} /></p>
          <h2 id="systems-title" style={sectionTitle}><ReviewedText text={"Ten technologies. Five systems. Distinct protection functions."} /></h2>
          <p style={{...bodyText,maxWidth:'1050px'}}><ReviewedText text={"Explore the system that contains the exposed component. The technology within it defines the appropriate contamination-control function, not a universal replacement element."} /></p>
          <div className={styles.systemGrid}>
            {systemGroups.map(renderSystemCard)}
          </div>
        </div>
      </section>

      <section style={section} aria-labelledby="engineering-checks-title">
        <div className={styles.shell}>
          <p style={eyebrow}><ReviewedText text={"FIELD ENGINEERING DECISIONS"} /></p>
          <h2 id="engineering-checks-title" style={sectionTitle}><ReviewedText text={"What should maintenance, fleet and purchasing teams verify?"} /></h2>
          <p style={{...bodyText,maxWidth:'980px'}}><ReviewedText text={"These are application checkpoints, not universal performance specifications. Confirm required limits and approved fitment with OEM and equipment evidence."} /></p>
          <div className={styles.impactGrid}>
            {FIELD_CHECKS.map((item) => (
              <article key={item.system} className={styles.impactCard}>
                <h3><ReviewedText text={item.system} /></h3>
                <dl className={styles.impactFacts}>
                  <div><dt><ReviewedText text={"Exposure"} /></dt><dd><ReviewedText text={item.exposure} /></dd></div>
                  <div><dt><ReviewedText text={"Verify"} /></dt><dd><ReviewedText text={item.verification} /></dd></div>
                  <div><dt><ReviewedText text={"Asset consequence"} /></dt><dd><ReviewedText text={item.consequence} /></dd></div>
                </dl>
                <Link href={item.href} style={{...darkButton,marginTop:'1.4rem',display:'inline-block'}}><ReviewedText text={"VIEW PROTECTION SYSTEM"} /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <TechnologiesPortfolio />

      <section style={sectionAlt}>
        <p style={eyebrow}><ReviewedText text={"FROM TECHNOLOGY TO PART"} /></p>
        <h2 style={sectionTitle}><ReviewedText text={"Use the technology to narrow the architecture, not to bypass application validation."} /></h2>
        <div className={`decision-flow ${styles.decisionGrid}`} style={decisionFlow}>
          {['1. ASSET / EQUIPMENT', '2. PROTECTED SYSTEM', '3. CONTAMINATION FUNCTION', '4. ELIMFILTERS TECHNOLOGY', '5. PRODUCT FAMILY', '6. VALIDATED PART NUMBER'].map((step, i) => (
            <div key={step} className="decision-step" style={decisionStep}><span className="decision-step-index">{String(i + 1).padStart(2, '0')}</span><span className="decision-step-label"><ReviewedText text={step.replace(/^\d+\.\s*/, '')} /></span></div>
          ))}
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}><ReviewedText text={"FREQUENT QUESTIONS"} /></p>
        <h2 style={sectionTitle}><ReviewedText text={"Industrial Filtration Technologies"} /></h2>
        <div className={styles.faqGrid} style={faqGrid}>
          {faqs.map(([question, answer]) => (
            <article key={question} style={faqCard}>
              <h3 style={faqQuestion}><ReviewedText text={question} /></h3>
              <p style={bodyText}><ReviewedText text={answer} /></p>
            </article>
          ))}
        </div>
      </section>

      <section className="technologies-final-cta" style={cta} aria-labelledby="technology-final-cta-title">
        <div className={styles.ctaGrid}>
          <div>
            <p style={eyebrow}><ReviewedText text={"READY TO RESOLVE THE APPLICATION?"} /></p>
            <h2 id="technology-final-cta-title" style={sectionTitle}><ReviewedText text={"Connect the protection system to the correct technology, family and part."} /></h2>
          </div>
          <div className={styles.ctaContent}>
            <p style={bodyText}><ReviewedText text={"Use Product Intelligence when you already have a reference or known application. Use Application Support when the protected system, duty conditions or technical fit still need to be resolved."} /></p>
            <div className={styles.ctaActions}>
              <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence" style={yellowButton}><PublicUiText textKey="publicUi.text30">{"FIND MY FILTER"}</PublicUiText></a>
              <Link href="/contact/" data-conversion-action="application-support" style={darkButton}><ReviewedText text={"IDENTIFY MY PROTECTION PATH"} /></Link>
              <Link href="/systems/" style={darkButton}><ReviewedText text={"EXPLORE PROTECTION SYSTEMS"} /></Link>
            </div>
          </div>
        </div>
      </section>


    </main>
  );
}

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';
const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont, overflowX: 'hidden' };
const hero: CSSProperties = { minHeight:'clamp(630px,83vh,900px)',position:'relative',overflow:'hidden',display:'flex',alignItems:'center',padding:'clamp(7rem,10vw,9rem) clamp(1.1rem,3.8vw,4.7rem)',borderBottom:'1px solid rgba(255,255,255,.1)' };
const heroImage: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: VIDEO_HERO_TREATMENT.opacity };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: VIDEO_HERO_TREATMENT.overlayBackground };
const heroTitle: CSSProperties = { fontFamily:displayFont,fontWeight:700,letterSpacing:'-.045em',lineHeight:1.0,fontSize:'clamp(3rem,6.2vw,6rem)',maxWidth:'1300px',margin:0,textTransform:'uppercase' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(1.08rem, 2vw, 1.45rem)', lineHeight: 1.35, maxWidth: '820px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { marginTop: '1rem', maxWidth: '860px', color: 'rgba(255,255,255,0.72)', fontSize: 'clamp(1rem, 1.6vw, 1.18rem)', lineHeight: 1.7, fontWeight: 500 };
const eyebrow: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 1rem' };
const section: CSSProperties = { padding:'clamp(3.8rem,6vw,6rem) clamp(1.1rem,3.8vw,4.7rem)' };
const sectionAlt: CSSProperties = { ...section, background: '#050505', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem, 4vw, 3.6rem)', lineHeight: 0.98, letterSpacing: '-0.035em', margin: 0, textTransform: 'uppercase', fontWeight: 700 };
const leadText: CSSProperties = { color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(1.08rem, 1.7vw, 1.3rem)', lineHeight: 1.7, fontWeight: 600, margin: 0 };
const bodyText: CSSProperties = { color: 'rgba(255,255,255,0.62)', fontSize: '1rem', lineHeight: 1.76, marginTop: '1rem' };
const yellowButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.8rem', padding: '1rem 1.2rem' };
const darkButton: CSSProperties = { display: 'inline-block', background: 'rgba(0,0,0,0.5)', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.8rem', padding: '1rem 1.2rem', border: '1px solid rgba(255,241,45,0.4)' };
const systemCard: CSSProperties = { minWidth:0 };
const systemName: CSSProperties = { color: '#fff', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase' };
const decisionFlow: CSSProperties = { maxWidth:'1560px',margin:'2.4rem auto 0',display:'grid',gap:'1px',background:'rgba(255,255,255,.18)' };
const decisionStep: CSSProperties = { background:'#080808',padding:'clamp(1.3rem,2vw,2.2rem)',fontFamily:displayFont,fontSize:'.79rem',fontWeight:700,letterSpacing:'.06em',color:'#fff',minWidth:0 };
const faqGrid: CSSProperties = { maxWidth:'1560px',margin:'2.2rem auto 0',display:'grid',gap:'clamp(1rem,1.7vw,1.7rem)' };
const faqCard: CSSProperties = { background:'#0c0c0c' };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: '1rem', lineHeight: 1.3, margin: 0, color: '#fff' };
const cta: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderTop: '1px solid rgba(255,241,45,0.2)', background: 'radial-gradient(circle at 50% 0%, rgba(255,241,45,0.18), transparent 34%)' };
