import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import { IndustryFilterCarousel } from './IndustryFilterCarousel';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/industries/railway/`;

const assets = [
  'Freight Locomotives',
  'Passenger Locomotives',
  'Diesel Multiple Units',
  'Rail Maintenance Equipment',
  'Auxiliary Power Units',
  'Depot Support Equipment',
] as const;

const operatingPressures = [
  ['Extended Duty', 'Rail equipment can accumulate long operating hours across variable routes, loads and ambient conditions, making contamination control part of availability planning.'],
  ['Vibration + Thermal Cycling', 'Repeated vibration and changing temperatures influence sealing, fluid condition, intake loading and service interfaces across locomotive systems.'],
  ['Fuel Handling', 'Bulk storage, transfer, condensation and depot refueling can introduce particulate or water before fuel reaches the engine.'],
  ['Maintenance Windows', 'Locomotive service is often coordinated around depot access and scheduled maintenance windows, so application evidence must be resolved before the asset is released to service.'],
] as const;

const pathways = [
  ['AIRBORNE PARTICULATE', 'Route dust + ballast particulate + intake loading', 'AIR INTAKE', 'MACROCORE™', '/technologies/macrocore/'],
  ['FUEL + WATER', 'Bulk storage + transfer + condensation + depot refueling', 'FUEL / WATER SEPARATION', 'HYDROCORE™', '/technologies/hydrocore/'],
  ['LUBE CONTAMINATION', 'Wear debris + soot + service ingress', 'LUBRICATION', 'SYNTRAX™', '/technologies/syntrax/'],
  ['HYDRAULIC DEBRIS', 'Wear + service contamination in applicable auxiliary and support systems', 'HYDRAULIC', 'NANOFORCE™', '/technologies/nanoforce/'],
] as const;

const consequences = [
  ['Fleet Availability', 'A locomotive removed from service can affect fleet allocation, consist planning and the operating schedule around it.'],
  ['Engine Protection', 'Air, fuel and lubricant cleanliness support the protected interfaces that must operate across long duty cycles.'],
  ['Fuel-System Integrity', 'Particulate and water control matter from storage and transfer through final engine supply, not only at the last filter position.'],
  ['Depot Efficiency', 'Correct part identification before a scheduled service event reduces the risk of losing maintenance time to an avoidable mismatch.'],
  ['Component Protection', 'Filtration helps protect injectors, pumps, bearings, turbochargers and applicable hydraulic components from contamination exposure.'],
  ['Service Predictability', 'A governed contamination-control path supports more consistent maintenance planning across mixed locomotive and support-equipment populations.'],
] as const;

const questions = [
  ['What filtration systems are most important on railway equipment?', 'Air intake, fuel and water separation, lubrication and selected hydraulic systems are common protection priorities on locomotives and rail-support equipment. The correct combination depends on the asset, engine, protected system, route exposure and duty cycle.'],
  ['Why is railway filtration different from normal road service?', 'Rail equipment combines extended duty, vibration, thermal cycling, route dust, depot fuel handling and scheduled maintenance constraints. Filtration should therefore be selected around the actual locomotive or rail asset rather than assumed from a general heavy-duty category.'],
  ['How can railway fuel become contaminated?', 'Particulate or water can enter through bulk storage, tank breathing, condensation, transfer equipment and depot refueling. The protection strategy should consider the complete fuel path from storage to the engine.'],
  ['Why does air-intake protection matter on locomotives?', 'Locomotive air systems can be exposed to route dust, ballast particulate and changing ambient conditions. Air-intake selection should account for loading, sealing, engine requirements and the actual operating environment.'],
  ['Should railway filters be selected only by service interval?', 'No. A fixed interval does not describe contamination loading, fuel quality, engine configuration, route exposure, sealing condition or maintenance access. Service planning should reflect the actual application.'],
  ['What information is needed to identify the correct railway filter?', 'Use the locomotive or rail asset, engine, protected system, duty cycle, route environment, OEM or current filter reference, dimensions when available and validated application evidence.'],
  ['Can ELIMFILTERS identify a railway filter from an OEM or part number?', 'Yes. If an OEM reference or current filter number is known, Part Search provides the fastest route to cross-reference and application information. For engineering review, include the locomotive or asset, engine, protected system and operating conditions.'],
  ['How should a mixed railway fleet standardize filters?', 'Standardization should follow confirmed compatibility at the engine, system and part level. Similar locomotive classes or duty profiles do not by themselves establish interchangeability.'],
] as const;

export function RailwayIndustryPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#page`,
        url: PAGE_URL,
        name: 'Railway Filtration Systems',
        description: 'Railway filtration systems for freight and passenger locomotives, diesel multiple units, auxiliary power units and rail maintenance equipment operating under vibration, route dust, fuel-handling exposure and extended duty.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Railway filtration systems' },
          { '@type': 'Thing', name: 'Locomotive contamination control' },
          { '@type': 'Thing', name: 'Railway fuel water separation' },
          { '@type': 'Thing', name: 'Locomotive air intake filtration' },
          { '@type': 'Thing', name: 'Rail fleet maintenance planning' },
          { '@type': 'Thing', name: 'Railway equipment availability' },
        ],
        mentions: [
          { '@type': 'Thing', name: 'Air intake filtration' },
          { '@type': 'Thing', name: 'Fuel filtration and water separation' },
          { '@type': 'Thing', name: 'Lubrication filtration' },
          { '@type': 'Thing', name: 'Hydraulic filtration' },
          { '@type': 'Thing', name: 'MACROCORE' },
          { '@type': 'Thing', name: 'HYDROCORE' },
          { '@type': 'Thing', name: 'SYNTRAX' },
          { '@type': 'Thing', name: 'NANOFORCE' },
        ],
        breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Industry', item: `${BASE_URL}/industries/` },
          { '@type': 'ListItem', position: 3, name: 'Railway Filtration Systems', item: PAGE_URL },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${PAGE_URL}#equipment`,
        name: 'Railway equipment applications',
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
      <PageHeader currentPage="Railway" />

      <section style={hero}>
        <video autoPlay muted loop playsInline preload="auto" style={heroVideo}>
          <source src="/images/Train.mp4" type="video/mp4" />
        </video>
        <div style={heroShade} />
        <div style={heroInner}>
          <p style={eyebrow}>RAILWAY / FLEET AVAILABILITY</p>
          <h1 style={heroTitle}>Railway Filtration<br /><span style={yellow}>Systems</span></h1>
          <p style={heroPromise}>Protect locomotive systems around route duty, depot service and validated application evidence.</p>
          <p style={heroLead}>Air intake, fuel-water separation, lubrication and applicable hydraulic contamination control for locomotives, diesel multiple units, auxiliary power units and rail-support equipment operating under vibration, route dust and extended duty.</p>
          <div style={actions}>
            <Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>IDENTIFY MY RAIL PROTECTION PATH</Link>
            <a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a>
          </div>
        </div>
      </section>

      <section style={directSection} aria-labelledby="rail-direct-title">
        <div style={contentWidth}>
          <p style={eyebrow}>DIRECT ANSWER</p>
          <h2 id="rail-direct-title" style={directTitle}>What defines the correct railway filtration strategy?</h2>
          <p style={directText}>Railway filtration should start with the locomotive or rail asset, engine and protected system, then resolve route exposure, fuel handling, duty cycle, maintenance window and validated application evidence. Similar locomotive classes should not be treated as interchangeable without confirming the actual filter position and application.</p>
        </div>
      </section>

      <section style={section} aria-labelledby="reality-title">
        <div style={contentWidth}>
          <p style={eyebrow}>RAIL OPERATING REALITY</p>
          <h2 id="reality-title" style={sectionTitle}>The maintenance window is short. The duty cycle is not.</h2>
          <p style={wideText}>Rail assets combine long operating periods with vibration, changing ambient conditions, depot fuel handling and scheduled service events. Filtration decisions have to fit that operating rhythm.</p>
          <div style={pressureGrid}>{operatingPressures.map(([title, text]) => <article key={title} style={pressureCard}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={equipmentSection} aria-labelledby="equipment-title">
        <div style={equipmentGrid}>
          <div style={equipmentCopy}>
            <h2 id="equipment-title" style={sectionTitle}>One rail network can contain several filtration architectures.</h2>
            <p style={wideText}>Freight, passenger, maintenance and auxiliary equipment can share depots while using different engines, protected systems and service requirements.</p>
            <div role="list" aria-label="Railway equipment applications" style={equipmentList}>{assets.map((asset) => <div role="listitem" key={asset} style={equipmentRow}><span style={equipmentName}>{asset}</span></div>)}</div>
          </div>
          <div style={equipmentMedia}><img src="/images/trenes.avif" alt="Railway locomotive operating in demanding service conditions" style={equipmentImage} /></div>
        </div>
      </section>

      <section style={section} aria-labelledby="path-title">
        <div style={contentWidth}>
          <p style={eyebrow}>CONTAMINATION PATHWAYS</p>
          <h2 id="path-title" style={sectionTitle}>Trace the contamination path before choosing the part.</h2>
          <p style={wideText}>Railway selection should connect the contamination source to the protected system, then to the appropriate ELIMFILTERS technology and finally to a validated application.</p>
          <div style={pathwayGrid}>{pathways.map(([source, detail, system, technology, href]) => <article key={system} style={pathwayCard}><div><span style={smallLabel}>CONTAMINATION SOURCE</span><strong style={pathwaySource}>{source}</strong><p style={smallText}>{detail}</p></div><div style={pathwayDivider} /><div><span style={smallLabel}>PROTECTION SYSTEM</span><strong style={pathwaySystem}>{system}</strong></div><Link href={href} style={technologyLink}><span style={smallLabelYellow}>ELIMFILTERS TECHNOLOGY</span><strong style={technologyName}>{technology}</strong><span style={technologyCta}>EXPLORE →</span></Link></article>)}</div>
        </div>
      </section>

      <section style={principleSection}>
        <div style={principle}><span style={principleLabel}>RAILWAY ENGINEERING PRINCIPLE</span><p style={principleText}>The correct railway filter must resolve the locomotive or asset, engine, protected system, route duty, service environment and application evidence before interchangeability is accepted.</p></div>
      </section>

      <IndustryFilterCarousel dutyClass="HD" industryName="Railway" />

      <section style={impactSection} aria-labelledby="impact-title">
        <div style={contentWidth}>
          <p style={eyebrow}>FLEET AVAILABILITY</p>
          <h2 id="impact-title" style={sectionTitle}>Protect the locomotive before contamination becomes a network constraint.</h2>
          <p style={wideText}>Filtration supports more than the component. It helps protect the engine, fuel path, service plan and fleet allocation decisions surrounding the asset.</p>
          <div style={impactGrid}>{consequences.map(([title, text]) => <article key={title} style={impactCard}><h3 style={impactTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={section} aria-labelledby="decision-title">
        <div style={contentWidth}>
          <p style={eyebrow}>FROM LOCOMOTIVE TO PART</p>
          <h2 id="decision-title" style={sectionTitle}>Resolve the railway application in five decisions.</h2>
          <div style={decisionGrid}>{[
            ['Rail Asset', 'Identify the locomotive, multiple unit, auxiliary power unit or maintenance equipment.'],
            ['Engine + System', 'Confirm the engine and the exact air, fuel, lubrication or hydraulic filter position.'],
            ['Route Duty', 'Define operating hours, load, route dust, vibration, ambient conditions and maintenance access.'],
            ['Protection', 'Match the contamination mechanism to the protected system and service requirement.'],
            ['Application Evidence', 'Validate the final filter using OEM reference, dimensions and documented application evidence.'],
          ].map(([title, text]) => <article key={title} style={decisionCard}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={evidenceSection} aria-labelledby="evidence-title">
        <div style={contentWidth}>
          <p style={eyebrow}>DEPOT APPLICATION EVIDENCE</p>
          <h2 id="evidence-title" style={sectionTitle}>A maintenance slot should not be used to discover a part mismatch.</h2>
          <p style={wideText}>Final identification should reconcile the known reference, locomotive and engine context, dimensions, protected system and operating conditions before the scheduled service event begins.</p>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={contentWidth}>
          <p style={eyebrow}>RAILWAY FILTRATION QUESTIONS</p>
          <h2 id="faq-title" style={sectionTitle}>What rail operators and maintenance teams need to know.</h2>
          <div style={faqList}>{questions.map(([q, a]) => <article key={q} style={faqItem}><h3 style={faqQuestion}>{q}</h3><p style={faqAnswer}>{a}</p></article>)}</div>
        </div>
      </section>

      <section style={conversionSection}>
        <div style={conversionGrid}>
          <div><p style={eyebrow}>HAVE A LOCOMOTIVE OR RAIL APPLICATION TO RESOLVE?</p><h2 style={conversionTitle}>Identify the protection path before the maintenance window opens.</h2><p style={conversionText}>Send the locomotive or rail asset, engine, protected system, route conditions and any known OEM or current filter reference.</p><Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>IDENTIFY MY RAIL PROTECTION PATH</Link></div>
          <div style={conversionSecondary}><div><p style={eyebrow}>ALREADY HAVE A PART NUMBER?</p><h3 style={conversionSubTitle}>Go directly to Part Search.</h3><a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a></div><div style={divider} /><div><p style={eyebrow}>SERVE RAIL CUSTOMERS?</p><h3 style={conversionSubTitle}>Evaluate distributor fit.</h3><Link href="/distributor-application/" style={secondaryButton}>BECOME A DISTRIBUTOR</Link></div></div>
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
const heroShade: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(0,0,0,.94),rgba(0,0,0,.58) 52%,rgba(0,0,0,.12)),linear-gradient(0deg,rgba(0,0,0,.72),transparent 58%)' };
const heroInner: CSSProperties = { width: '100%', maxWidth: '1180px', margin: '0 auto', padding: 'clamp(7rem,12vw,10rem) clamp(1.25rem,5vw,4.5rem) clamp(4rem,7vw,6rem)', position: 'relative', zIndex: 2 };
const eyebrow: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.72rem', lineHeight: 1.2, letterSpacing: '.18em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 1rem' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-.055em', lineHeight: .88, fontSize: 'clamp(3.3rem,7.6vw,7.2rem)', textTransform: 'uppercase', margin: 0, maxWidth: '920px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,2vw,1.55rem)', lineHeight: 1.3, fontWeight: 700, maxWidth: '820px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem,1.45vw,1.18rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.78)', maxWidth: '900px', margin: '1rem 0 0' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '2rem' };
const primaryButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase' };
const secondaryButton: CSSProperties = { display: 'inline-block', background: 'transparent', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase', border: '1px solid rgba(255,241,45,.42)' };
const directSection: CSSProperties = { padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,6vw,6rem)', background: '#050505', borderBottom: '1px solid rgba(255,255,255,.08)' };
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
