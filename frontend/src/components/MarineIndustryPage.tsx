import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import { IndustryFilterCarousel } from './IndustryFilterCarousel';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/industries/marine/`;

const equipment = [
  'Commercial Vessels',
  'Workboats',
  'Marine Engines',
  'Deck Machinery',
  'Steering & Hydraulic Systems',
  'Auxiliary Power Equipment',
] as const;

const operatingPressures = [
  ['Fuel + Water', 'Storage, transfer, condensation and marine humidity can introduce water and particulate before fuel reaches the engine.'],
  ['Salt + Moisture', 'Salt atmosphere and persistent humidity increase contamination exposure around air paths, housings, service interfaces and onboard equipment.'],
  ['Hydraulic Dependence', 'Steering, deck machinery and auxiliary systems rely on pumps, valves and actuators that require controlled fluid cleanliness.'],
  ['Limited Service Access', 'Once underway, maintenance options narrow. Filtration strategy must account for voyage duration, service windows and port access.'],
] as const;

const protection = [
  ['FUEL + WATER', 'Storage + transfer + condensation + tank breathing', 'FUEL / WATER SEPARATION', 'HYDROCORE™', '/technologies/hydrocore/'],
  ['SALT-LADEN AIR + PARTICULATE', 'Airborne moisture + salt + particulate around engine intake paths', 'AIR INTAKE', 'MACROCORE™', '/technologies/macrocore/'],
  ['HYDRAULIC DEBRIS', 'Ingress + internal wear + service contamination', 'HYDRAULIC', 'NANOFORCE™', '/technologies/nanoforce/'],
  ['LUBE CONTAMINATION', 'Wear debris + soot + service ingress', 'LUBRICATION', 'SYNTRAX™', '/technologies/syntrax/'],
] as const;

const consequences = [
  ['Propulsion Reliability', 'Fuel, air and lubrication cleanliness support the protected interfaces that keep marine engines available under sustained duty.'],
  ['Fuel-System Integrity', 'Water and particulate control matter across storage, transfer and engine supply because contamination can originate before the onboard final filter.'],
  ['Hydraulic Control', 'Steering and deck functions depend on clean hydraulic fluid reaching precision pumps, valves and actuators.'],
  ['Voyage Continuity', 'A filtration problem at sea can become an operating constraint because service access and replacement options are more limited than on land.'],
  ['Component Protection', 'Filtration helps protect injectors, pumps, bearings, turbochargers and hydraulic components whose service consequence can be significant.'],
  ['Maintenance Predictability', 'A disciplined contamination-control path supports service planning around voyage cycles, port calls and actual operating exposure.'],
] as const;

const questions = [
  ['What is MARINECLEAN™?', 'MARINECLEAN™ is the ELIMFILTERS marine filtration line. It identifies filters developed and organized for marine applications; it is not a filtration-media technology. Products within the MARINECLEAN™ line may use the appropriate ELIMFILTERS technology for the protected system, including HYDROCORE™, MACROCORE™, NANOFORCE™ or SYNTRAX™.'],
  ['What filtration systems are most important on commercial vessels and workboats?', 'Fuel and water separation, air intake, lubrication and hydraulic filtration are common priorities on marine equipment. The correct priority depends on the vessel, engine, fuel-handling path, hydraulic functions, duty cycle and maintenance access.'],
  ['Why is fuel-water separation especially important in marine applications?', 'Marine fuel can be exposed to storage time, tank breathing, condensation, transfer operations and persistent humidity. The protection strategy should therefore consider the complete fuel path and the need to control both particulate and water before fuel reaches sensitive engine interfaces.'],
  ['How does salt air affect marine filtration decisions?', 'Salt atmosphere and humidity can increase contamination exposure around air-intake paths, housings and service interfaces. Selection should consider the environment, sealing integrity, loading conditions and protected component rather than treating marine duty as equivalent to inland service.'],
  ['Why is hydraulic cleanliness important on vessels?', 'Steering systems, deck machinery and auxiliary hydraulic functions rely on pumps, valves and actuators operating with controlled fluid cleanliness. Contamination can interfere with those precision interfaces and increase service risk.'],
  ['Should marine filters be selected only by service interval?', 'No. A fixed interval does not describe fuel quality, water exposure, voyage duration, engine load, hydraulic sensitivity, environmental contamination or maintenance access. Service planning should reflect the actual vessel and operating conditions.'],
  ['What information is needed to identify the correct marine filter?', 'Use the vessel or equipment type, engine, protected system, operating environment, fuel-handling conditions, duty cycle, OEM or existing part reference, dimensions when available and validated application evidence.'],
  ['Can ELIMFILTERS identify a marine filter from an OEM or part number?', 'Yes. If an OEM reference or current filter number is known, Part Search provides the fastest route to cross-reference and application information. For an engineering review, include the vessel, engine, protected system and operating conditions.'],
] as const;

export function MarineIndustryPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#page`,
        url: PAGE_URL,
        name: 'Marine Filtration Systems',
        description: 'Marine filtration systems for commercial vessels, workboats, marine engines, deck machinery and onboard hydraulic equipment operating under salt air, humidity, fuel-water exposure and extended duty.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Marine filtration systems' },
          { '@type': 'Thing', name: 'MARINECLEAN Marine Filtration Line' },
          { '@type': 'Thing', name: 'Marine fuel water separation' },
          { '@type': 'Thing', name: 'Commercial vessel filtration' },
          { '@type': 'Thing', name: 'Marine hydraulic cleanliness' },
          { '@type': 'Thing', name: 'Marine engine contamination control' },
          { '@type': 'Thing', name: 'Vessel operating reliability' },
        ],
        mentions: [
          { '@type': 'Thing', name: 'MARINECLEAN Marine Filtration Line' },
          { '@type': 'Thing', name: 'Fuel filtration and water separation' },
          { '@type': 'Thing', name: 'Air intake filtration' },
          { '@type': 'Thing', name: 'Hydraulic filtration' },
          { '@type': 'Thing', name: 'Lubrication filtration' },
          { '@type': 'Thing', name: 'HYDROCORE' },
          { '@type': 'Thing', name: 'MACROCORE' },
          { '@type': 'Thing', name: 'NANOFORCE' },
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
          { '@type': 'ListItem', position: 3, name: 'Marine Filtration Systems', item: PAGE_URL },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${PAGE_URL}#equipment`,
        name: 'Marine equipment applications',
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
      <PageHeader currentPage="Marine" />

      <section style={hero}>
        <video autoPlay muted loop playsInline preload="auto" style={heroVideo}>
          <source src="/images/Marino-1.mp4" type="video/mp4" />
        </video>
        <div style={heroShade} />
        <div style={heroInner}>
          <p style={eyebrow}>MARINE / VOYAGE ASSET PROTECTION</p>
          <h1 style={heroTitle}>Marine Filtration<br /><span style={yellow}>Systems</span></h1>
          <p style={heroPromise}>Protect propulsion, fuel and hydraulic systems before the vessel leaves service access behind.</p>
          <p style={heroLead}>Fuel-water separation, air intake, lubrication and hydraulic contamination control for commercial vessels, workboats, marine engines, deck machinery and auxiliary systems operating under salt air, humidity and extended duty.</p>
          <p style={heroLine}><strong>MARINECLEAN™ Marine Filtration Line</strong> — the ELIMFILTERS product line for marine filtration applications.</p>
          <div style={actions}>
            <Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>IDENTIFY MY MARINE PROTECTION PATH</Link>
            <a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a>
          </div>
        </div>
      </section>

      <section style={directSection} aria-labelledby="marine-direct-title">
        <div style={contentWidth}>
          <p style={eyebrow}>DIRECT ANSWER</p>
          <h2 id="marine-direct-title" style={directTitle}>What defines the correct marine filtration strategy?</h2>
          <p style={directText}>Marine filtration begins with the vessel and contamination path, then resolves fuel-water exposure, protected system, component sensitivity, voyage duty, maintenance access and validated application evidence. The correct filter should not be selected from vessel category or service interval alone.</p>
        </div>
      </section>

      <section style={lineSection} aria-labelledby="marineclean-title">
        <div style={contentWidth}>
          <p style={eyebrow}>MARINE PRODUCT LINE</p>
          <h2 id="marineclean-title" style={directTitle}>MARINECLEAN™ Marine Filtration Line</h2>
          <p style={directText}>MARINECLEAN™ is the ELIMFILTERS line that groups filtration products for marine applications. It defines the marine product class, not the filtration technology itself. A MARINECLEAN™ product is assigned the ELIMFILTERS technology appropriate to the protected system—for example HYDROCORE™ for fuel/water separation, MACROCORE™ for air intake, NANOFORCE™ for hydraulic protection or SYNTRAX™ for lubrication.</p>
        </div>
      </section>

      <section style={section} aria-labelledby="reality-title">
        <div style={contentWidth}>
          <p style={eyebrow}>AT-SEA OPERATING REALITY</p>
          <h2 id="reality-title" style={sectionTitle}>Water, salt and distance change the protection problem.</h2>
          <p style={wideText}>Marine equipment operates inside a contamination environment that follows the vessel. Fuel quality, humidity, salt exposure and service access can change across storage, port operations and time underway.</p>
          <div style={pressureGrid}>{operatingPressures.map(([title, text]) => <article key={title} style={pressureCard}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={equipmentSection} aria-labelledby="equipment-title">
        <div style={equipmentGrid}>
          <div style={equipmentMedia}><img src="/images/marine-2_converted.avif" alt="Commercial marine vessel operating in a saltwater environment" style={equipmentImage} /></div>
          <div style={equipmentCopy}>
            <h2 id="equipment-title" style={sectionTitle}>Different onboard systems. Different contamination consequences.</h2>
            <p style={wideText}>Main propulsion, auxiliary power, steering and deck machinery share the same vessel but not the same contamination mechanism, operating load or service consequence.</p>
            <div role="list" aria-label="Marine equipment applications" style={equipmentList}>{equipment.map((asset) => <div role="listitem" key={asset} style={equipmentRow}><span style={equipmentName}>{asset}</span></div>)}</div>
          </div>
        </div>
      </section>

      <section style={section} aria-labelledby="path-title">
        <div style={contentWidth}>
          <p style={eyebrow}>CONTAMINATION PATHWAYS</p>
          <h2 id="path-title" style={sectionTitle}>Start with what enters the vessel system. Then engineer the protection.</h2>
          <p style={wideText}>Marine selection should connect each contamination source to the protected system, the appropriate ELIMFILTERS technology and finally to a validated part.</p>
          <div className="industry-pathway-grid" style={pathwayGrid}>{protection.map(([source, detail, system, technology, href]) => <article key={system} style={pathwayCard}><div><span style={smallLabel}>CONTAMINATION SOURCE</span><strong style={pathwaySource}>{source}</strong><p style={smallText}>{detail}</p></div><div style={pathwayDivider} /><div><span style={smallLabel}>PROTECTION SYSTEM</span><strong style={pathwaySystem}>{system}</strong></div><Link href={href} style={technologyLink}><span style={smallLabelYellow}>ELIMFILTERS TECHNOLOGY</span><strong style={technologyName}>{technology}</strong><span style={technologyCta}>EXPLORE →</span></Link></article>)}</div>
        </div>
      </section>

      <section style={principleSection}>
        <div style={principle}><span style={principleLabel}>MARINE ENGINEERING PRINCIPLE</span><p style={principleText}>The filtration decision must resolve the vessel, contamination pathway, protected interface, voyage duty, service access and application evidence before a product number is accepted.</p></div>
      </section>

      <IndustryFilterCarousel dutyClass="HD" industryName="Marine" />

      <section style={impactSection} aria-labelledby="impact-title">
        <div style={contentWidth}>
          <p style={eyebrow}>VOYAGE CONTINUITY</p>
          <h2 id="impact-title" style={sectionTitle}>Protect the operating chain before contamination becomes an at-sea constraint.</h2>
          <p style={wideText}>Marine filtration protects more than a component. It supports propulsion, fuel delivery, steering, deck functions and maintenance predictability across the voyage.</p>
          <div style={impactGrid}>{consequences.map(([title, text]) => <article key={title} style={impactCard}><h3 style={impactTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={section} aria-labelledby="decision-title">
        <div style={contentWidth}>
          <p style={eyebrow}>FROM VESSEL CONDITION TO PART</p>
          <h2 id="decision-title" style={sectionTitle}>Resolve the marine application in five decisions.</h2>
          <div style={decisionGrid}>{[
            ['Vessel / Asset', 'Identify the vessel, engine, steering system, deck machinery or auxiliary equipment.'],
            ['Exposure', 'Define fuel-water risk, salt air, humidity, particulate, hydraulic contamination and storage conditions.'],
            ['Voyage Duty', 'Establish operating hours, engine load, voyage duration, port access and maintenance constraints.'],
            ['Protection', 'Match the contamination mechanism to fuel, air intake, lubrication or hydraulic protection.'],
            ['Application Evidence', 'Validate the final filter using OEM reference, dimensions and documented application evidence.'],
          ].map(([title, text]) => <article key={title} style={decisionCard}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={evidenceSection} aria-labelledby="evidence-title">
        <div style={contentWidth}>
          <p style={eyebrow}>APPLICATION EVIDENCE</p>
          <h2 id="evidence-title" style={sectionTitle}>A marine cross-reference still has to match the actual vessel application.</h2>
          <p style={wideText}>Final identification should reconcile the known reference, vessel or engine context, dimensions, protected system and operating conditions. Where evidence is incomplete, the application should remain under review rather than be treated as confirmed.</p>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={contentWidth}>
          <p style={eyebrow}>MARINE FILTRATION QUESTIONS</p>
          <h2 id="faq-title" style={sectionTitle}>What vessel operators and maintenance teams need to know.</h2>
          <div style={faqList}>{questions.map(([q, a]) => <article key={q} style={faqItem}><h3 style={faqQuestion}>{q}</h3><p style={faqAnswer}>{a}</p></article>)}</div>
        </div>
      </section>

      <section style={conversionSection}>
        <div style={conversionGrid}>
          <div><p style={eyebrow}>HAVE A VESSEL OR CONTAMINATION PROBLEM?</p><h2 style={conversionTitle}>Identify the protection path before the next voyage depends on the part.</h2><p style={conversionText}>Send the vessel or equipment, engine, protected system, fuel and environmental conditions, duty cycle and any known OEM or filter reference.</p><Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>IDENTIFY MY MARINE PROTECTION PATH</Link></div>
          <div style={conversionSecondary}><div><p style={eyebrow}>ALREADY HAVE A PART NUMBER?</p><h3 style={conversionSubTitle}>Go directly to Part Search.</h3><a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a></div><div style={divider} /><div><p style={eyebrow}>SERVE MARINE CUSTOMERS?</p><h3 style={conversionSubTitle}>Evaluate distributor fit.</h3><Link href="/distributor-application/" style={secondaryButton}>BECOME A DISTRIBUTOR</Link></div></div>
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
const heroVideo: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: .78 };
const heroShade: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(0,0,0,.92),rgba(0,0,0,.58) 52%,rgba(0,0,0,.12)),linear-gradient(0deg,rgba(0,0,0,.7),transparent 58%)' };
const heroInner: CSSProperties = { width: '100%', maxWidth: '1180px', margin: '0 auto', padding: 'clamp(7rem,12vw,10rem) clamp(1.25rem,5vw,4.5rem) clamp(4rem,7vw,6rem)', position: 'relative', zIndex: 2 };
const eyebrow: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.72rem', lineHeight: 1.2, letterSpacing: '.18em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 1rem' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-.055em', lineHeight: .88, fontSize: 'clamp(3.3rem,7.6vw,7.2rem)', textTransform: 'uppercase', margin: 0, maxWidth: '920px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,2vw,1.55rem)', lineHeight: 1.3, fontWeight: 700, maxWidth: '820px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem,1.45vw,1.18rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.78)', maxWidth: '900px', margin: '1rem 0 0' };
const heroLine: CSSProperties = { fontSize: '.9rem', lineHeight: 1.6, color: 'rgba(255,255,255,.88)', maxWidth: '820px', margin: '1rem 0 0', paddingLeft: '1rem', borderLeft: '2px solid #FFF12D' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '2rem' };
const primaryButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase' };
const secondaryButton: CSSProperties = { display: 'inline-block', background: 'transparent', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase', border: '1px solid rgba(255,241,45,.42)' };
const directSection: CSSProperties = { padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,6vw,6rem)', background: '#050505', borderBottom: '1px solid rgba(255,255,255,.08)' };
const lineSection: CSSProperties = { padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,6vw,6rem)', background: 'linear-gradient(90deg,rgba(255,241,45,.055),#030303 42%)', borderBottom: '1px solid rgba(255,255,255,.08)' };
const contentWidth: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const directTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem,4vw,3.4rem)', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-.035em', margin: 0, maxWidth: '900px' };
const directText: CSSProperties = { fontSize: 'clamp(1.05rem,1.6vw,1.24rem)', lineHeight: 1.75, color: 'rgba(255,255,255,.82)', maxWidth: '980px', margin: '1.3rem 0 0' };
const section: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.2rem,4.7vw,4.2rem)', lineHeight: .96, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0, maxWidth: '920px' };
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
const decisionGrid: CSSProperties = { marginTop: '2.6rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(210px,100%),1fr))', gap: '1px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.1)' };
const decisionCard: CSSProperties = { background: '#030303', minHeight: '205px', padding: '1.5rem' };
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
