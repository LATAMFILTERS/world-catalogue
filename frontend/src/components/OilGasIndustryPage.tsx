import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import { IndustryFilterCarousel } from './IndustryFilterCarousel';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/industries/oil-gas/`;

const equipment = [
  'Drilling Rigs',
  'Pumping Units',
  'Compressors',
  'Hydraulic Power Units',
  'Engine-Driven Equipment',
  'Field Service Equipment',
] as const;

const operatingPressures = [
  ['Airborne Contamination', 'Dust, sand and fine particulate can load engine air-intake systems across drilling, production and field-service environments.'],
  ['Hydraulic Control', 'Drilling, lifting, pressure control and auxiliary functions depend on pumps, valves and actuators working with controlled fluid cleanliness.'],
  ['Fuel Handling', 'Bulk tanks, transfer equipment, mobile refueling, condensation and water exposure can contaminate fuel before it reaches the engine.'],
  ['Continuous Duty', 'Long operating periods, heat, vibration and limited maintenance windows increase the importance of predictable filtration performance and service planning.'],
] as const;

const protection = [
  ['DUST + SAND', 'Airborne particulate around drilling and field operations', 'AIR INTAKE', 'MACROCORE™', '/technologies/macrocore/'],
  ['HYDRAULIC DEBRIS', 'Ingress + internal wear + service contamination', 'HYDRAULIC', 'NANOFORCE™', '/technologies/nanoforce/'],
  ['FUEL + WATER', 'Storage + transfer + condensation + field refueling', 'FUEL', 'HYDROCORE™', '/technologies/hydrocore/'],
  ['LUBE CONTAMINATION', 'Wear debris + soot + service ingress', 'LUBRICATION', 'SYNTRAX™', '/technologies/syntrax/'],
] as const;

const consequences = [
  ['Process Continuity', 'An engine, pump or compressor taken out of service can interrupt a larger operating sequence and constrain production support.'],
  ['Hydraulic Precision', 'Contamination can affect the precision interfaces responsible for pressure control, actuation and repeated hydraulic response.'],
  ['Engine Protection', 'Air, fuel and lubricant cleanliness influence the protection of combustion and lubricated interfaces under extended field duty.'],
  ['Maintenance Access', 'Remote sites and constrained service windows make application evidence and condition-aware maintenance especially important.'],
  ['Component Protection', 'Filtration protects higher-value pumps, valves, injectors, bearings, turbochargers and other serviceable components.'],
  ['Operating Predictability', 'A disciplined contamination-control path supports more predictable service planning across critical field equipment.'],
] as const;

const questions = [
  ['What filtration systems are most important in oil and gas equipment?', 'Air intake, hydraulic, fuel and lubrication systems are common protection priorities across drilling rigs, compressors, pumps, hydraulic power units and engine-driven field equipment. The correct priority depends on the asset, contamination source, component sensitivity, duty cycle and service conditions.'],
  ['Why is filtration different in oil and gas field operations?', 'Oil and gas equipment may operate for extended periods in dust, sand, heat, vibration, remote locations and variable fuel-handling conditions. These factors can increase contamination exposure while reducing service flexibility, so filtration should be selected around the operating environment and protected system rather than equipment category alone.'],
  ['How can fuel become contaminated at an oil and gas site?', 'Fuel can acquire particulate or water through bulk storage, tank breathing, condensation, transfer equipment, mobile refueling and handling practices. The protection strategy should consider the complete path from storage to the engine.'],
  ['Why is hydraulic cleanliness important on drilling and production equipment?', 'Hydraulic systems rely on pumps, valves, actuators and control interfaces operating under pressure. Contamination can interfere with those precision surfaces, so filtration should be matched to cleanliness requirements, pressure, duty cycle and component sensitivity.'],
  ['Should oil and gas filters be selected only by service interval?', 'No. A calendar or hour interval does not describe contamination loading, fuel quality, hydraulic sensitivity, dust exposure, sealing condition or maintenance access. Service planning should be informed by the application and operating conditions.'],
  ['What information is needed to identify the correct filter?', 'Use the equipment, engine or power unit, protected system, operating environment, duty cycle, OEM or existing part reference, dimensions when available and validated application evidence.'],
  ['Can ELIMFILTERS identify an oil and gas filter from an OEM or part number?', 'Yes. If an OEM reference or current filter number is known, Part Search provides the fastest route to cross-reference and application information. For an engineering review, include the equipment, protected system and site conditions.'],
] as const;

export function OilGasIndustryPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#page`,
        url: PAGE_URL,
        name: 'Oil & Gas Filtration Systems',
        description: 'Oil and gas filtration systems for drilling rigs, pumping units, compressors, hydraulic power units and engine-driven field equipment operating under dust, heat, vibration and extended duty.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Oil and gas filtration systems' },
          { '@type': 'Thing', name: 'Oilfield equipment contamination control' },
          { '@type': 'Thing', name: 'Drilling rig filtration' },
          { '@type': 'Thing', name: 'Hydraulic cleanliness in oil and gas equipment' },
          { '@type': 'Thing', name: 'Oilfield fuel contamination' },
          { '@type': 'Thing', name: 'Oil and gas equipment reliability' },
        ],
        mentions: [
          { '@type': 'Thing', name: 'Air intake filtration' },
          { '@type': 'Thing', name: 'Hydraulic filtration' },
          { '@type': 'Thing', name: 'Fuel filtration and water separation' },
          { '@type': 'Thing', name: 'Lubrication filtration' },
          { '@type': 'Thing', name: 'MACROCORE' },
          { '@type': 'Thing', name: 'NANOFORCE' },
          { '@type': 'Thing', name: 'HYDROCORE' },
          { '@type': 'Thing', name: 'SYNTRAX' },
        ],
        breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Industry', item: `${BASE_URL}/industries/` },
          { '@type': 'ListItem', position: 3, name: 'Oil & Gas Filtration Systems', item: PAGE_URL },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${PAGE_URL}#equipment`,
        name: 'Oil and gas equipment applications',
        itemListElement: equipment.map((name, index) => ({ '@type': 'ListItem', position: index + 1, name })),
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
      <PageHeader currentPage="Oil Gas" />

      <section style={hero}>
        <video autoPlay muted loop playsInline preload="auto" style={heroVideo}>
          <source src="/images/Petro&Gas-1.mp4" type="video/mp4" />
        </video>
        <div style={heroShade} />
        <div style={heroInner}>
          <p style={eyebrow}>OIL & GAS / FIELD ASSET PROTECTION</p>
          <h1 style={heroTitle}>Oil & Gas Filtration<br /><span style={yellow}>Systems</span></h1>
          <p style={heroPromise}>Protect the equipment that keeps energy operations moving.</p>
          <p style={heroLead}>Air intake, hydraulic, fuel and lubrication contamination control for drilling rigs, pumping units, compressors, hydraulic power units and engine-driven field equipment operating under dust, sand, heat, vibration and extended duty.</p>
          <div style={actions}>
            <Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>IDENTIFY MY PROTECTION PATH</Link>
            <a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a>
          </div>
        </div>
      </section>

      <section style={directSection} aria-labelledby="direct-title">
        <div style={contentWidth}>
          <p style={eyebrow}>DIRECT ANSWER</p>
          <h2 id="direct-title" style={directTitle}>What defines the correct oil & gas filtration strategy?</h2>
          <p style={directText}>The correct filtration strategy starts with the asset and contamination source, then resolves the protected system, component sensitivity, duty cycle, maintenance access and validated application evidence. Oil and gas equipment should not be selected by industry label or service interval alone.</p>
        </div>
      </section>

      <section style={section} aria-labelledby="reality-title">
        <div style={contentWidth}>
          <p style={eyebrow}>FIELD OPERATING REALITY</p>
          <h2 id="reality-title" style={sectionTitle}>Contamination risk changes across the operating chain.</h2>
          <p style={wideText}>Drilling, pumping, compression, hydraulic control and field power place different demands on filtration even when equipment operates at the same site.</p>
          <div style={pressureGrid}>{operatingPressures.map(([title, text]) => <article key={title} style={pressureCard}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={equipmentSection} aria-labelledby="equipment-title">
        <div style={equipmentGrid}>
          <div style={equipmentCopy}>
            <h2 id="equipment-title" style={sectionTitle}>Different assets. Different protection priorities.</h2>
            <p style={wideText}>A drilling rig, compressor and hydraulic power unit may share a site but not the same contamination mechanism, component sensitivity or service access.</p>
            <div role="list" aria-label="Oil and gas equipment applications" style={equipmentList}>{equipment.map((asset) => <div role="listitem" key={asset} style={equipmentRow}><span style={equipmentName}>{asset}</span></div>)}</div>
          </div>
          <div style={equipmentMedia}><img src="/images/oil&gas.avif" alt="Oil and gas field equipment operating in demanding conditions" style={equipmentImage} /></div>
        </div>
      </section>

      <section style={section} aria-labelledby="path-title">
        <div style={contentWidth}>
          <p style={eyebrow}>CONTAMINATION PATHWAYS</p>
          <h2 id="path-title" style={sectionTitle}>Connect the field threat to the system that must remain protected.</h2>
          <p style={wideText}>Selection should move from contamination source to protected system, then to the appropriate ELIMFILTERS technology and finally to a validated part.</p>
          <div style={pathwayGrid}>{protection.map(([source, detail, system, technology, href]) => <article key={system} style={pathwayCard}><div><span style={smallLabel}>CONTAMINATION SOURCE</span><strong style={pathwaySource}>{source}</strong><p style={smallText}>{detail}</p></div><div style={pathwayDivider} /><div><span style={smallLabel}>PROTECTION SYSTEM</span><strong style={pathwaySystem}>{system}</strong></div><Link href={href} style={technologyLink}><span style={smallLabelYellow}>ELIMFILTERS TECHNOLOGY</span><strong style={technologyName}>{technology}</strong><span style={technologyCta}>EXPLORE →</span></Link></article>)}</div>
        </div>
      </section>

      <section style={principleSection}>
        <div style={principle}><span style={principleLabel}>OIL & GAS ENGINEERING PRINCIPLE</span><p style={principleText}>The filtration decision must resolve the equipment, contamination pathway, protected interface, operating duty and application evidence before a product number is accepted.</p></div>
      </section>

      <IndustryFilterCarousel dutyClass="HD" industryName="Oil & Gas" />

      <section style={impactSection} aria-labelledby="impact-title">
        <div style={contentWidth}>
          <p style={eyebrow}>OPERATING CONTINUITY</p>
          <h2 id="impact-title" style={sectionTitle}>Protect the process before contamination becomes an interruption.</h2>
          <p style={wideText}>Filtration supports more than the component itself. It protects the operating sequence around engines, pumps, compressors and hydraulic functions that other field activities may depend on.</p>
          <div style={impactGrid}>{consequences.map(([title, text]) => <article key={title} style={impactCard}><h3 style={impactTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={section} aria-labelledby="decision-title">
        <div style={contentWidth}>
          <p style={eyebrow}>FROM FIELD CONDITION TO PART</p>
          <h2 id="decision-title" style={sectionTitle}>Resolve the oil & gas application in five decisions.</h2>
          <div style={decisionGrid}>{[
            ['Asset', 'Identify the drilling rig, pump, compressor, hydraulic power unit or engine-driven equipment.'],
            ['Exposure', 'Define dust, sand, moisture, fuel handling, heat, vibration and environmental contamination.'],
            ['Duty', 'Establish load, operating hours, pressure, service access and maintenance constraints.'],
            ['Protection', 'Match the contamination mechanism to air intake, hydraulic, fuel or lubrication protection.'],
            ['Application Evidence', 'Validate the final filter using OEM reference, dimensions and documented application evidence.'],
          ].map(([title, text]) => <article key={title} style={decisionCard}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={evidenceSection} aria-labelledby="evidence-title">
        <div style={contentWidth}>
          <p style={eyebrow}>APPLICATION EVIDENCE</p>
          <h2 id="evidence-title" style={sectionTitle}>A plausible cross-reference is not enough.</h2>
          <p style={wideText}>Final identification should reconcile the known reference, equipment or engine context, dimensions, protected system and operating conditions. Where evidence is incomplete, the application should remain under review rather than be treated as confirmed.</p>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={contentWidth}>
          <p style={eyebrow}>OIL & GAS FILTRATION QUESTIONS</p>
          <h2 id="faq-title" style={sectionTitle}>What operators, fleet teams and maintenance teams need to know.</h2>
          <div style={faqList}>{questions.map(([q, a]) => <article key={q} style={faqItem}><h3 style={faqQuestion}>{q}</h3><p style={faqAnswer}>{a}</p></article>)}</div>
        </div>
      </section>

      <section style={conversionSection}>
        <div style={conversionGrid}>
          <div><p style={eyebrow}>HAVE AN ASSET OR FIELD-CONTAMINATION PROBLEM?</p><h2 style={conversionTitle}>Identify the protection path before selecting the part.</h2><p style={conversionText}>Send the equipment, engine or power unit, protected system, operating conditions and any known OEM or filter reference.</p><Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>IDENTIFY MY PROTECTION PATH</Link></div>
          <div style={conversionSecondary}><div><p style={eyebrow}>ALREADY HAVE A PART NUMBER?</p><h3 style={conversionSubTitle}>Go directly to Part Search.</h3><a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a></div><div style={divider} /><div><p style={eyebrow}>SERVE OIL & GAS OPERATIONS?</p><h3 style={conversionSubTitle}>Evaluate distributor fit.</h3><Link href="/distributor-application/" style={secondaryButton}>BECOME A DISTRIBUTOR</Link></div></div>
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
const heroVideo: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: .76 };
const heroShade: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(0,0,0,.94),rgba(0,0,0,.6) 52%,rgba(0,0,0,.18)),linear-gradient(0deg,rgba(0,0,0,.72),transparent 58%)' };
const heroInner: CSSProperties = { width: '100%', maxWidth: '1180px', margin: '0 auto', padding: 'clamp(7rem,12vw,10rem) clamp(1.25rem,5vw,4.5rem) clamp(4rem,7vw,6rem)', position: 'relative', zIndex: 2 };
const eyebrow: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.72rem', lineHeight: 1.2, letterSpacing: '.18em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 1rem' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-.055em', lineHeight: .88, fontSize: 'clamp(3.3rem,7.4vw,7rem)', textTransform: 'uppercase', margin: 0, maxWidth: '980px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,2vw,1.55rem)', lineHeight: 1.3, fontWeight: 700, maxWidth: '780px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem,1.45vw,1.18rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.78)', maxWidth: '880px', margin: '1rem 0 0' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '2rem' };
const primaryButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase' };
const secondaryButton: CSSProperties = { display: 'inline-block', background: 'transparent', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase', border: '1px solid rgba(255,241,45,.42)' };
const section: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const contentWidth: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const directSection: CSSProperties = { ...section, background: '#050505' };
const directTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(1.8rem,3.4vw,3.1rem)', lineHeight: 1, textTransform: 'uppercase', maxWidth: '860px', margin: 0 };
const directText: CSSProperties = { fontSize: 'clamp(1.05rem,1.7vw,1.28rem)', lineHeight: 1.65, color: 'rgba(255,255,255,.82)', maxWidth: '980px', margin: '1.3rem 0 0' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.2rem,4.7vw,4.2rem)', lineHeight: .96, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0, maxWidth: '950px' };
const bodyText: CSSProperties = { fontSize: '1rem', lineHeight: 1.72, color: 'rgba(255,255,255,.66)', margin: 0 };
const wideText: CSSProperties = { ...bodyText, maxWidth: '880px', marginTop: '1.3rem' };
const pressureGrid: CSSProperties = { marginTop: '2.8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(240px,100%),1fr))', gap: '1px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.1)' };
const pressureCard: CSSProperties = { background: '#050505', padding: '1.55rem', minHeight: '220px' };
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
const decisionGrid: CSSProperties = { marginTop: '2.6rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(200px,100%),1fr))', gap: '1px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.1)' };
const decisionCard: CSSProperties = { background: '#030303', minHeight: '210px', padding: '1.5rem' };
const evidenceSection: CSSProperties = { ...section, background: 'linear-gradient(90deg,rgba(255,241,45,.045),transparent 55%),#030303' };
const faqSection: CSSProperties = { ...section, background: '#070707' };
const faqList: CSSProperties = { marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,.12)' };
const faqItem: CSSProperties = { padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,.12)' };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem,1.8vw,1.3rem)', lineHeight: 1.25, margin: '0 0 .65rem' };
const faqAnswer: CSSProperties = { ...bodyText, maxWidth: '960px', fontSize: '.96rem' };
const conversionSection: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', background: '#020202', borderTop: '1px solid rgba(255,255,255,.08)' };
const conversionGrid: CSSProperties = { ...contentWidth, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(340px,100%),1fr))', gap: 'clamp(2.5rem,6vw,5rem)' };
const conversionSecondary: CSSProperties = { display: 'grid', gap: '2.2rem' };
const conversionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2.4rem,5vw,4.6rem)', lineHeight: .95, letterSpacing: '-.04em', textTransform: 'uppercase', maxWidth: '760px', margin: 0 };
const conversionText: CSSProperties = { ...bodyText, fontSize: '1.05rem', maxWidth: '680px', margin: '1.5rem 0 2rem' };
const conversionSubTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.5rem,2.8vw,2.2rem)', textTransform: 'uppercase', margin: '0 0 1.5rem' };
const divider: CSSProperties = { height: '1px', background: 'rgba(255,255,255,.12)' };
