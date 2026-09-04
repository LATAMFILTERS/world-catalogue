import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import { IndustryFilterCarousel } from './IndustryFilterCarousel';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/industries/manufacturing/`;

const assets = [
  'Hydraulic Power Units',
  'Industrial Compressors',
  'Process Pumps',
  'Machine Tools',
  'Production Equipment',
  'Engine-Driven Plant Utilities',
] as const;

const productionPressures = [
  ['Continuous Duty', 'Production equipment may operate across long shifts where a filtration-related interruption can affect more than one machine or workstation.'],
  ['Hydraulic Sensitivity', 'Servo valves, pumps, actuators and precision hydraulic interfaces depend on controlled fluid cleanliness to support repeatable machine response.'],
  ['Plant Air + Particulate', 'Dust and airborne particulate can enter intake paths, housings and service interfaces across compressors, engines and production support equipment.'],
  ['Maintenance Windows', 'Plants often depend on planned shutdowns and scheduled service windows, so part identification and maintenance preparation must be resolved before the line is stopped.'],
] as const;

const pathways = [
  ['HYDRAULIC DEBRIS', 'Ingress + internal wear + service contamination', 'HYDRAULIC', 'NANOFORCE™', '/technologies/nanoforce/'],
  ['AIRBORNE PARTICULATE', 'Plant dust + intake loading + service ingress', 'AIR INTAKE', 'MACROCORE™', '/technologies/macrocore/'],
  ['LUBE CONTAMINATION', 'Wear debris + oxidation byproducts + service ingress', 'LUBRICATION', 'SYNTRAX™', '/technologies/syntrax/'],
  ['FUEL + WATER', 'Storage + transfer + condensation in engine-driven plant utilities', 'FUEL / WATER SEPARATION', 'HYDROCORE™', '/technologies/hydrocore/'],
] as const;

const consequences = [
  ['Production Flow', 'A filtration problem can constrain the machine, utility or support system that a larger production sequence depends on.'],
  ['Machine Precision', 'Hydraulic and lubricated interfaces depend on controlled contamination levels to support consistent motion and repeatable response.'],
  ['Utility Availability', 'Compressors, pumps and engine-driven support equipment can become production bottlenecks when service or contamination interrupts their availability.'],
  ['Planned Maintenance', 'Correct application evidence before shutdown reduces the risk of discovering a mismatch after the maintenance window has already started.'],
  ['Component Protection', 'Filtration helps protect higher-value pumps, valves, bearings, actuators and engine interfaces from avoidable contamination exposure.'],
  ['Process Predictability', 'A disciplined contamination-control path supports more predictable service planning around production schedules and maintenance windows.'],
] as const;

const questions = [
  ['What filtration systems are most important in manufacturing plants?', 'Hydraulic, air intake, lubrication and fuel or water-separation systems are common priorities across hydraulic power units, compressors, process pumps, machine tools and engine-driven plant utilities. The correct priority depends on the machine, protected system, contamination source, duty cycle and maintenance access.'],
  ['Why is hydraulic cleanliness important in manufacturing equipment?', 'Hydraulic power units and machine systems rely on pumps, valves, actuators and precision control interfaces. Contamination can interfere with those surfaces, so filtration should be matched to component sensitivity, pressure, flow, duty and application requirements.'],
  ['How does filtration affect production continuity?', 'Filtration protects machines and utilities that may sit upstream of multiple production steps. The objective is not to claim that a filter alone prevents downtime, but to control contamination around assets whose loss of availability can disrupt planned production.'],
  ['Should manufacturing filters be selected only by service interval?', 'No. A fixed interval does not describe contamination loading, hydraulic sensitivity, fluid condition, machine duty, environment or shutdown access. Service planning should reflect the actual equipment and operating conditions.'],
  ['What information is needed to identify the correct manufacturing filter?', 'Use the machine or asset, protected system, fluid or air path, operating conditions, duty cycle, known OEM or existing filter reference, dimensions when available and validated application evidence.'],
  ['Why does application evidence matter before a planned shutdown?', 'A scheduled maintenance window is more effective when the correct part has already been validated. Equipment context, dimensions, protected system and known references should be reconciled before the machine is taken out of service.'],
  ['Can ELIMFILTERS identify a manufacturing filter from an OEM or part number?', 'Yes. If an OEM reference or current filter number is known, Part Search provides the fastest route to cross-reference and application information. For an engineering review, include the machine, protected system and operating conditions.'],
] as const;

export function ManufacturingIndustryPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#page`,
        url: PAGE_URL,
        name: 'Manufacturing Filtration Systems',
        description: 'Manufacturing filtration systems for hydraulic power units, compressors, pumps, machine tools and production equipment requiring contamination control across continuous plant duty and planned maintenance windows.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Manufacturing filtration systems' },
          { '@type': 'Thing', name: 'Industrial hydraulic cleanliness' },
          { '@type': 'Thing', name: 'Manufacturing equipment contamination control' },
          { '@type': 'Thing', name: 'Production equipment filtration' },
          { '@type': 'Thing', name: 'Plant maintenance filtration planning' },
          { '@type': 'Thing', name: 'Manufacturing equipment availability' },
        ],
        mentions: [
          { '@type': 'Thing', name: 'Hydraulic filtration' },
          { '@type': 'Thing', name: 'Air intake filtration' },
          { '@type': 'Thing', name: 'Lubrication filtration' },
          { '@type': 'Thing', name: 'Fuel filtration and water separation' },
          { '@type': 'Thing', name: 'NANOFORCE' },
          { '@type': 'Thing', name: 'MACROCORE' },
          { '@type': 'Thing', name: 'SYNTRAX' },
          { '@type': 'Thing', name: 'HYDROCORE' },
        ],
        breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Industry', item: `${BASE_URL}/industries/` },
          { '@type': 'ListItem', position: 3, name: 'Manufacturing Filtration Systems', item: PAGE_URL },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${PAGE_URL}#equipment`,
        name: 'Manufacturing equipment applications',
        itemListElement: assets.map((name, index) => ({ '@type': 'ListItem', position: index + 1, name })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${PAGE_URL}#faq`,
        mainEntity: questions.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
  };

  return (
    <main id="main-content" style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHeader currentPage="Manufacturing" />

      <section style={hero}>
        <video autoPlay muted loop playsInline preload="auto" style={heroVideo}>
          <source src="/images/Manufacture-1.mp4" type="video/mp4" />
        </video>
        <div style={heroShade} />
        <div style={heroInner}>
          <p style={eyebrow}>MANUFACTURING / PRODUCTION CONTINUITY</p>
          <h1 style={heroTitle}>Manufacturing Filtration<br /><span style={yellow}>Systems</span></h1>
          <p style={heroPromise}>Protect the machines and utilities that production flow depends on.</p>
          <p style={heroLead}>Hydraulic, air intake, lubrication and fuel contamination control for hydraulic power units, compressors, pumps, machine tools and engine-driven plant utilities operating across continuous duty and scheduled maintenance windows.</p>
          <div style={actions}>
            <Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>IDENTIFY MY PLANT PROTECTION PATH</Link>
            <a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a>
          </div>
        </div>
      </section>

      <section style={directSection} aria-labelledby="manufacturing-direct-title">
        <div style={contentWidth}>
          <p style={eyebrow}>DIRECT ANSWER</p>
          <h2 id="manufacturing-direct-title" style={directTitle}>What defines the correct manufacturing filtration strategy?</h2>
          <p style={directText}>Start with the machine or plant utility, identify the contamination source and protected system, then resolve component sensitivity, duty cycle, shutdown access and application evidence. Manufacturing filtration should support the production process around the asset, not be selected from equipment category or service interval alone.</p>
        </div>
      </section>

      <section style={section} aria-labelledby="production-title">
        <div style={contentWidth}>
          <p style={eyebrow}>THE PRODUCTION SYSTEM</p>
          <h2 id="production-title" style={sectionTitle}>A machine rarely operates in isolation.</h2>
          <p style={wideText}>Manufacturing plants connect machines, utilities and support systems into one operating sequence. The filtration decision should consider what happens to production when one hydraulic unit, compressor, pump or engine-driven utility is unavailable.</p>
          <div style={pressureGrid}>{productionPressures.map(([title, text]) => <article key={title} style={pressureCard}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={equipmentSection} aria-labelledby="equipment-title">
        <div style={equipmentGrid}>
          <div style={equipmentCopy}>
            <p style={eyebrow}>PLANT ASSETS</p>
            <h2 id="equipment-title" style={sectionTitle}>Different roles in the plant create different contamination priorities.</h2>
            <p style={wideText}>Hydraulic power, compressed-air support, pumping and machine operations can share the same facility while requiring different protection decisions and service evidence.</p>
            <div role="list" aria-label="Manufacturing equipment applications" style={equipmentList}>{assets.map((asset) => <div role="listitem" key={asset} style={equipmentRow}><span style={equipmentName}>{asset}</span></div>)}</div>
          </div>
          <div style={equipmentMedia}><img src="/images/manufacture.avif" alt="Industrial manufacturing equipment operating inside a production facility" style={equipmentImage} /></div>
        </div>
      </section>

      <section style={section} aria-labelledby="path-title">
        <div style={contentWidth}>
          <p style={eyebrow}>CONTAMINATION PATHWAYS</p>
          <h2 id="path-title" style={sectionTitle}>Map the contamination source to the protected production interface.</h2>
          <p style={wideText}>Selection should move from contamination source to protected system, then to the appropriate ELIMFILTERS technology and finally to a validated part.</p>
          <div className="industry-pathway-grid" style={pathwayGrid}>{pathways.map(([source, detail, system, technology, href]) => <article key={system} style={pathwayCard}><div><span style={smallLabel}>CONTAMINATION SOURCE</span><strong style={pathwaySource}>{source}</strong><p style={smallText}>{detail}</p></div><div style={pathwayDivider} /><div><span style={smallLabel}>PROTECTION SYSTEM</span><strong style={pathwaySystem}>{system}</strong></div><Link href={href} style={technologyLink}><span style={smallLabelYellow}>ELIMFILTERS TECHNOLOGY</span><strong style={technologyName}>{technology}</strong><span style={technologyCta}>EXPLORE →</span></Link></article>)}</div>
        </div>
      </section>

      <section style={principleSection}>
        <div style={principle}><span style={principleLabel}>MANUFACTURING ENGINEERING PRINCIPLE</span><p style={principleText}>The correct filter protects a production interface, not just a machine. Asset criticality, contamination pathway, component sensitivity, maintenance timing and application evidence must be resolved before the part number is accepted.</p></div>
      </section>

      <IndustryFilterCarousel dutyClass="HD" industryName="Manufacturing" />

      <section style={impactSection} aria-labelledby="continuity-title">
        <div style={contentWidth}>
          <p style={eyebrow}>PRODUCTION CONTINUITY</p>
          <h2 id="continuity-title" style={sectionTitle}>Protect the bottleneck before it becomes a line constraint.</h2>
          <p style={wideText}>Filtration supports the machine and the production sequence around it. The greater the dependency on a shared hydraulic unit, compressor, pump or engine-driven utility, the more important correct contamination control and service preparation become.</p>
          <div style={impactGrid}>{consequences.map(([title, text]) => <article key={title} style={impactCard}><h3 style={impactTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={section} aria-labelledby="decision-title">
        <div style={contentWidth}>
          <p style={eyebrow}>FROM PLANT CONDITION TO PART</p>
          <h2 id="decision-title" style={sectionTitle}>Resolve the manufacturing application in five decisions.</h2>
          <div style={decisionGrid}>{[
            ['Asset', 'Identify the machine, hydraulic power unit, compressor, pump or engine-driven plant utility.'],
            ['Process Role', 'Establish what production step or shared utility depends on the asset.'],
            ['Exposure', 'Define particulate, fluid contamination, storage, service ingress and operating environment.'],
            ['Protection', 'Match the contamination mechanism to hydraulic, air intake, lubrication or fuel protection.'],
            ['Application Evidence', 'Validate the final filter using OEM reference, dimensions and documented equipment evidence before the maintenance window.'],
          ].map(([title, text]) => <article key={title} style={decisionCard}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={evidenceSection} aria-labelledby="evidence-title">
        <div style={contentWidth}>
          <p style={eyebrow}>MAINTENANCE EVIDENCE</p>
          <h2 id="evidence-title" style={sectionTitle}>Validate the part before the shutdown starts.</h2>
          <p style={wideText}>Manufacturing maintenance often works inside defined windows. Final identification should reconcile the known reference, machine context, dimensions, protected system and operating conditions before the asset is taken out of service.</p>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={contentWidth}>
          <p style={eyebrow}>MANUFACTURING FILTRATION QUESTIONS</p>
          <h2 id="faq-title" style={sectionTitle}>What plant engineering and maintenance teams need to know.</h2>
          <div style={faqList}>{questions.map(([q, a]) => <article key={q} style={faqItem}><h3 style={faqQuestion}>{q}</h3><p style={faqAnswer}>{a}</p></article>)}</div>
        </div>
      </section>

      <section style={conversionSection}>
        <div style={conversionGrid}>
          <div><p style={eyebrow}>HAVE A MACHINE OR PLANT-UTILITY APPLICATION?</p><h2 style={conversionTitle}>Identify the protection path before the maintenance window opens.</h2><p style={conversionText}>Send the machine or utility, protected system, operating conditions, duty profile and any known OEM or filter reference.</p><Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>IDENTIFY MY PLANT PROTECTION PATH</Link></div>
          <div style={conversionSecondary}><div><p style={eyebrow}>ALREADY HAVE A PART NUMBER?</p><h3 style={conversionSubTitle}>Go directly to Part Search.</h3><a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a></div><div style={divider} /><div><p style={eyebrow}>SERVE INDUSTRIAL CUSTOMERS?</p><h3 style={conversionSubTitle}>Evaluate distributor fit.</h3><Link href="/distributor-application/" style={secondaryButton}>BECOME A DISTRIBUTOR</Link></div></div>
        </div>
      </section>
    </main>
  );
}

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';
const yellow: CSSProperties = { color: '#FFF12D' };
const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont, overflowX: 'hidden' };
const hero: CSSProperties = { minHeight: '92vh', background: '#000', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,.08)' };
const heroVideo: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: .72 };
const heroShade: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(0,0,0,.94),rgba(0,0,0,.58) 50%,rgba(0,0,0,.18)),linear-gradient(0deg,rgba(0,0,0,.75),transparent 58%)' };
const heroInner: CSSProperties = { width: '100%', maxWidth: '1180px', margin: '0 auto', padding: 'clamp(7rem,12vw,10rem) clamp(1.25rem,5vw,4.5rem) clamp(4rem,7vw,6rem)', position: 'relative', zIndex: 2 };
const eyebrow: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.72rem', lineHeight: 1.2, letterSpacing: '.18em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 1rem' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-.055em', lineHeight: .88, fontSize: 'clamp(3.3rem,7.6vw,7.2rem)', textTransform: 'uppercase', margin: 0, maxWidth: '1000px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,2vw,1.55rem)', lineHeight: 1.3, fontWeight: 700, maxWidth: '820px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem,1.45vw,1.18rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.78)', maxWidth: '900px', margin: '1rem 0 0' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '2rem' };
const primaryButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase' };
const secondaryButton: CSSProperties = { display: 'inline-block', background: 'transparent', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase', border: '1px solid rgba(255,241,45,.42)' };
const directSection: CSSProperties = { padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,6vw,6rem)', background: '#050505', borderBottom: '1px solid rgba(255,255,255,.08)' };
const contentWidth: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const directTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem,4vw,3.4rem)', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-.035em', margin: 0, maxWidth: '980px' };
const directText: CSSProperties = { fontSize: 'clamp(1.05rem,1.6vw,1.24rem)', lineHeight: 1.75, color: 'rgba(255,255,255,.82)', maxWidth: '980px', margin: '1.3rem 0 0' };
const section: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.2rem,4.7vw,4.2rem)', lineHeight: .96, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0, maxWidth: '980px' };
const bodyText: CSSProperties = { fontSize: '1rem', lineHeight: 1.72, color: 'rgba(255,255,255,.66)', margin: 0 };
const wideText: CSSProperties = { ...bodyText, maxWidth: '900px', marginTop: '1.3rem' };
const pressureGrid: CSSProperties = { marginTop: '2.8rem', display: 'flex', flexWrap: 'wrap', gap: '1px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.1)' };
const pressureCard: CSSProperties = { background: '#050505', padding: '1.55rem', minHeight: '220px', flex: '1 1 240px', minWidth: 0 };
const cardTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem,1.8vw,1.35rem)', lineHeight: 1.05, textTransform: 'uppercase', color: '#fff', margin: '0 0 .8rem' };
const equipmentSection: CSSProperties = { ...section, background: '#050505' };
const equipmentGrid: CSSProperties = { ...contentWidth, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(340px,100%),1fr))', gap: 'clamp(2.5rem,6vw,5rem)', alignItems: 'center' };
const equipmentCopy: CSSProperties = { minWidth: 0 };
const equipmentMedia: CSSProperties = { minWidth: 0 };
const equipmentImage: CSSProperties = { width: '100%', height: 'auto', objectFit: 'contain', display: 'block', border: '1px solid rgba(255,255,255,.08)' };
const equipmentList: CSSProperties = { marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,.14)' };
const equipmentRow: CSSProperties = { padding: '.95rem 0', borderBottom: '1px solid rgba(255,255,255,.14)' };
const equipmentName: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(.95rem,1.3vw,1.25rem)', lineHeight: 1.08, textTransform: 'uppercase', fontWeight: 700, color: '#fff', overflowWrap: 'break-word' };
const pathwayGrid: CSSProperties = { marginTop: '2.8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(300px,100%),1fr))', gap: '1rem' };
const pathwayCard: CSSProperties = { border: '1px solid rgba(255,255,255,.1)', background: '#050505', padding: '1.5rem', minHeight: '260px', display: 'grid', gap: '1rem' };
const smallLabel: CSSProperties = { fontFamily: displayFont, fontSize: '.58rem', letterSpacing: '.13em', color: 'rgba(255,255,255,.4)', fontWeight: 700, display: 'block', marginBottom: '.7rem' };
const smallLabelYellow: CSSProperties = { ...smallLabel, color: '#FFF12D' };
const pathwaySource: CSSProperties = { fontFamily: displayFont, fontSize: '1.15rem', color: '#fff', textTransform: 'uppercase' };
const pathwaySystem: CSSProperties = { fontFamily: displayFont, fontSize: '1.05rem', color: '#fff', textTransform: 'uppercase' };
const smallText: CSSProperties = { ...bodyText, fontSize: '.86rem', lineHeight: 1.55, marginTop: '.6rem' };
const pathwayDivider: CSSProperties = { height: '1px', background: 'rgba(255,255,255,.1)' };
const technologyLink: CSSProperties = { textDecoration: 'none', borderTop: '1px solid rgba(255,241,45,.18)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' };
const technologyName: CSSProperties = { fontFamily: displayFont, fontSize: '1.25rem', color: '#FFF12D' };
const technologyCta: CSSProperties = { fontFamily: displayFont, fontSize: '.58rem', letterSpacing: '.1em', color: 'rgba(255,255,255,.6)', marginTop: '.65rem' };
const principleSection: CSSProperties = { padding: '0 clamp(1.25rem,6vw,6rem) clamp(4.5rem,8vw,7rem)' };
const principle: CSSProperties = { ...contentWidth, borderLeft: '4px solid #FFF12D', background: 'linear-gradient(90deg,rgba(255,241,45,.08),rgba(255,255,255,.018))', padding: 'clamp(2rem,4vw,3rem)' };
const principleLabel: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.74rem', letterSpacing: '.16em', fontWeight: 700 };
const principleText: CSSProperties = { fontSize: 'clamp(1.2rem,2vw,1.55rem)', lineHeight: 1.55, color: 'rgba(255,255,255,.9)', margin: '1rem 0 0', maxWidth: '1040px' };
const impactSection: CSSProperties = { ...section, background: '#050505' };
const impactGrid: CSSProperties = { marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(300px,100%),1fr))', gap: '1rem' };
const impactCard: CSSProperties = { borderTop: '1px solid rgba(255,255,255,.15)', padding: '1.25rem 0', minHeight: '150px' };
const impactTitle: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '1.05rem', textTransform: 'uppercase', margin: '0 0 .65rem' };
const decisionGrid: CSSProperties = { marginTop: '2.6rem', display: 'flex', flexWrap: 'wrap', gap: '1px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.1)' };
const decisionCard: CSSProperties = { background: '#030303', minHeight: '205px', padding: '1.5rem', flex: '1 1 210px', minWidth: 0 };
const evidenceSection: CSSProperties = { ...section, background: 'linear-gradient(90deg,rgba(255,241,45,.045),#030303 38%)' };
const faqSection: CSSProperties = { ...section, background: '#070707' };
const faqList: CSSProperties = { marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,.12)' };
const faqItem: CSSProperties = { padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,.12)' };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem,1.8vw,1.3rem)', lineHeight: 1.25, margin: '0 0 .65rem' };
const faqAnswer: CSSProperties = { ...bodyText, maxWidth: '940px', fontSize: '.96rem' };
const conversionSection: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', background: '#020202', borderTop: '1px solid rgba(255,255,255,.08)' };
const conversionGrid: CSSProperties = { ...contentWidth, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(340px,100%),1fr))', gap: 'clamp(2.5rem,6vw,5rem)' };
const conversionSecondary: CSSProperties = { display: 'grid', gap: '2.2rem' };
const conversionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2.4rem,5vw,4.6rem)', lineHeight: .95, letterSpacing: '-.04em', textTransform: 'uppercase', maxWidth: '760px', margin: 0 };
const conversionText: CSSProperties = { ...bodyText, fontSize: '1.05rem', maxWidth: '680px', margin: '1.5rem 0 2rem' };
const conversionSubTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.5rem,2.8vw,2.2rem)', textTransform: 'uppercase', margin: '0 0 1.5rem' };
const divider: CSSProperties = { height: '1px', background: 'rgba(255,255,255,.12)' };