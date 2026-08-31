import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import { IndustryFilterCarousel } from './IndustryFilterCarousel';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/industries/waste-municipal/`;

const assets = [
  'Refuse Collection Trucks',
  'Street Sweepers',
  'Sewer & Vacuum Trucks',
  'Utility Service Vehicles',
  'Public Works Equipment',
  'Municipal Support Fleets',
] as const;

const operatingPressures = [
  ['Stop-Start Duty', 'Repeated starts, idling, acceleration and low-speed work change engine loading, thermal conditions and service demand across municipal routes.'],
  ['Dust + Debris', 'Street dust, refuse particulate and debris can increase contamination exposure around air intake, cooling and service interfaces.'],
  ['Hydraulic Work', 'Compactors, lifters, sweepers, booms and auxiliary functions depend on pumps, valves and actuators operating with controlled fluid cleanliness.'],
  ['Route Dependence', 'Public-service fleets work to fixed collection, sanitation and maintenance schedules, so an unavailable vehicle can create an immediate operational gap.'],
] as const;

const pathways = [
  ['DUST + DEBRIS', 'Street particulate + refuse dust + service ingress', 'AIR INTAKE', 'MACROCORE™', '/technologies/macrocore/'],
  ['HYDRAULIC DEBRIS', 'Ingress + internal wear + repeated auxiliary actuation', 'HYDRAULIC', 'NANOFORCE™', '/technologies/nanoforce/'],
  ['FUEL + WATER', 'Storage + transfer + condensation + municipal fueling', 'FUEL / WATER SEPARATION', 'HYDROCORE™', '/technologies/hydrocore/'],
  ['LUBE CONTAMINATION', 'Wear debris + soot + stop-start engine duty', 'LUBRICATION', 'SYNTRAX™', '/technologies/syntrax/'],
] as const;

const consequences = [
  ['Route Completion', 'Vehicle availability directly affects whether collection, sweeping, utility or public-works schedules can be completed as planned.'],
  ['Hydraulic Function', 'Auxiliary hydraulic circuits support lifting, compacting, sweeping, vacuum and utility operations that define the vehicle mission.'],
  ['Engine Protection', 'Air, fuel and lubrication cleanliness protect engine interfaces exposed to repeated urban duty and environmental contamination.'],
  ['Service Coordination', 'Fleet maintenance often has to align parts, labor and vehicle availability with route schedules and depot capacity.'],
  ['Fleet Standardization', 'Common platforms can support standardized service only when application compatibility is confirmed by engine, system and configuration.'],
  ['Public-Service Availability', 'A contamination-control strategy supports predictable fleet readiness across services that municipalities are expected to deliver consistently.'],
] as const;

const questions = [
  ['What filtration systems are most important in waste and municipal fleets?', 'Air intake, fuel-water separation, lubrication, hydraulic, cooling, compressed-air and cabin filtration can all be relevant depending on the vehicle and mission. Refuse trucks and public-works equipment often combine engine protection with hydraulic and auxiliary-system demands.'],
  ['Why is municipal fleet filtration different from normal highway service?', 'Municipal vehicles frequently operate with repeated starts, idling, low-speed work, urban dust, debris exposure and auxiliary hydraulic loads. Filter selection should reflect the actual route, vehicle configuration and protected system rather than highway mileage alone.'],
  ['Why is hydraulic cleanliness important on refuse and public-works equipment?', 'Compactors, lifters, sweepers, booms, vacuum systems and other auxiliary functions depend on hydraulic pumps, valves and actuators. Contamination can interfere with those precision interfaces and affect the vehicle mission even when the engine remains operational.'],
  ['How can fuel contamination affect municipal fleets?', 'Water and particulate can enter fuel through storage, condensation, transfer and handling. Because municipal fleets may refuel repeatedly from centralized infrastructure, the fuel path from storage to the engine should be considered as part of the protection strategy.'],
  ['Should municipal filters be selected only by mileage or service interval?', 'No. Mileage alone does not capture idle time, stop-start cycles, hydraulic use, dust exposure, fuel condition, route severity or maintenance access. Service planning should reflect the actual duty profile.'],
  ['Can a municipality standardize filters across similar vehicles?', 'Yes, but only where the engine, protected system, filter dimensions, specification and application evidence confirm compatibility. Vehicle appearance or shared fleet class is not enough to assume one filter fits every configuration.'],
  ['What information is needed to identify the correct municipal filter?', 'Use the vehicle or equipment model, engine, protected system, route duty, auxiliary equipment, known OEM or current filter reference, dimensions when available and validated application evidence.'],
  ['Can ELIMFILTERS identify a municipal fleet filter from an OEM or part number?', 'Yes. If an OEM reference or current filter number is known, Part Search is the fastest route to cross-reference and application information. For fleet standardization or difficult applications, include the vehicle, engine, protected system and operating duty.'],
] as const;

export function WasteMunicipalIndustryPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#page`,
        url: PAGE_URL,
        name: 'Waste & Municipal Filtration Systems',
        description: 'Waste and municipal filtration systems for refuse trucks, street sweepers, sewer and vacuum trucks, utility vehicles and public-works fleets operating under stop-start urban duty, dust, debris and hydraulic load.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Waste and municipal filtration systems' },
          { '@type': 'Thing', name: 'Refuse truck filtration' },
          { '@type': 'Thing', name: 'Municipal fleet contamination control' },
          { '@type': 'Thing', name: 'Public works equipment filtration' },
          { '@type': 'Thing', name: 'Municipal hydraulic cleanliness' },
          { '@type': 'Thing', name: 'Municipal fleet availability' },
        ],
        mentions: [
          { '@type': 'Thing', name: 'Air intake filtration' },
          { '@type': 'Thing', name: 'Fuel filtration and water separation' },
          { '@type': 'Thing', name: 'Lubrication filtration' },
          { '@type': 'Thing', name: 'Hydraulic filtration' },
          { '@type': 'Thing', name: 'Cooling system filtration' },
          { '@type': 'Thing', name: 'Compressed air filtration' },
          { '@type': 'Thing', name: 'Cabin air filtration' },
          { '@type': 'Thing', name: 'MACROCORE' },
          { '@type': 'Thing', name: 'HYDROCORE' },
          { '@type': 'Thing', name: 'SYNTRAX' },
          { '@type': 'Thing', name: 'NANOFORCE' },
          { '@type': 'Thing', name: 'THERMACORE' },
          { '@type': 'Thing', name: 'DRYCORE' },
          { '@type': 'Thing', name: 'MICROKAPPA' },
        ],
        breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Industry', item: `${BASE_URL}/industries/` },
          { '@type': 'ListItem', position: 3, name: 'Waste & Municipal Filtration Systems', item: PAGE_URL },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${PAGE_URL}#equipment`,
        name: 'Waste and municipal fleet applications',
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
      <PageHeader currentPage="Waste Municipal" />

      <section style={hero}>
        <video autoPlay muted loop playsInline preload="auto" style={heroVideo}>
          <source src="/images/wasted-2.mp4" type="video/mp4" />
        </video>
        <div style={heroShade} />
        <div style={heroInner}>
          <p style={eyebrow}>WASTE & MUNICIPAL / PUBLIC-SERVICE FLEET PROTECTION</p>
          <h1 style={heroTitle}>Waste & Municipal<br /><span style={yellow}>Filtration Systems</span></h1>
          <p style={heroPromise}>Protect the vehicles and auxiliary systems that keep public-service routes moving.</p>
          <p style={heroLead}>Air, fuel, lubrication, hydraulic, cooling, compressed-air and cabin protection for refuse trucks, sweepers, vacuum trucks, utility vehicles and public-works equipment operating under repeated urban duty.</p>
          <div style={actions}>
            <Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>IDENTIFY MY MUNICIPAL PROTECTION PATH</Link>
            <a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a>
          </div>
        </div>
      </section>

      <section style={directSection} aria-labelledby="direct-title">
        <div style={contentWidth}>
          <p style={eyebrow}>DIRECT ANSWER</p>
          <h2 id="direct-title" style={directTitle}>What makes municipal fleet filtration different?</h2>
          <p style={directText}>Municipal filtration has to account for the vehicle mission as well as the engine. Repeated stop-start duty, idling, urban dust, refuse debris, auxiliary hydraulics and route schedules change which systems are critical and how service should be planned.</p>
        </div>
      </section>

      <section style={section} aria-labelledby="reality-title">
        <div style={contentWidth}>
          <p style={eyebrow}>ROUTE OPERATING REALITY</p>
          <h2 id="reality-title" style={sectionTitle}>The route defines the duty cycle.</h2>
          <p style={wideText}>Waste collection, sweeping, sewer service and public works combine road travel with stationary or low-speed work. That operating pattern creates a filtration problem that is different from conventional highway duty.</p>
          <div style={pressureGrid}>{operatingPressures.map(([title, text]) => <article key={title} style={pressureCard}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={equipmentSection} aria-labelledby="equipment-title">
        <div style={equipmentGrid}>
          <div style={equipmentCopy}>
            <p style={eyebrow}>PUBLIC-SERVICE ASSETS</p>
            <h2 id="equipment-title" style={sectionTitle}>Different missions. Different protection priorities.</h2>
            <p style={wideText}>A refuse truck, street sweeper and vacuum truck may share a municipal depot while relying on very different auxiliary systems and contamination-control priorities.</p>
            <div role="list" aria-label="Waste and municipal fleet applications" style={equipmentList}>{assets.map((asset) => <div role="listitem" key={asset} style={equipmentRow}><span style={equipmentName}>{asset}</span></div>)}</div>
          </div>
          <div style={equipmentMedia}><img src="/images/wasted.avif" alt="Municipal service fleet equipment operating in urban duty" style={equipmentImage} /></div>
        </div>
      </section>

      <section style={section} aria-labelledby="path-title">
        <div style={contentWidth}>
          <p style={eyebrow}>CONTAMINATION PATHWAYS</p>
          <h2 id="path-title" style={sectionTitle}>Protect the engine and the equipment that performs the route mission.</h2>
          <p style={wideText}>Selection should connect the contamination source to the protected system, then to the appropriate ELIMFILTERS technology and finally to a validated part.</p>
          <div style={pathwayGrid}>{pathways.map(([source, detail, system, technology, href]) => <article key={system} style={pathwayCard}><div><span style={smallLabel}>CONTAMINATION SOURCE</span><strong style={pathwaySource}>{source}</strong><p style={smallText}>{detail}</p></div><div style={pathwayDivider} /><div><span style={smallLabel}>PROTECTION SYSTEM</span><strong style={pathwaySystem}>{system}</strong></div><Link href={href} style={technologyLink}><span style={smallLabelYellow}>ELIMFILTERS TECHNOLOGY</span><strong style={technologyName}>{technology}</strong><span style={technologyCta}>EXPLORE →</span></Link></article>)}</div>
        </div>
      </section>

      <section style={principleSection}>
        <div style={principle}><span style={principleLabel}>MUNICIPAL FLEET ENGINEERING PRINCIPLE</span><p style={principleText}>Do not standardize a filter simply because vehicles share a fleet class. Resolve the vehicle, engine, auxiliary equipment, contamination path, duty profile and application evidence before assigning the part.</p></div>
      </section>

      <IndustryFilterCarousel dutyClass="HD" industryName="Waste Municipal" />

      <section style={impactSection} aria-labelledby="impact-title">
        <div style={contentWidth}>
          <p style={eyebrow}>PUBLIC-SERVICE AVAILABILITY</p>
          <h2 id="impact-title" style={sectionTitle}>Protect the route before a component problem becomes a service gap.</h2>
          <p style={wideText}>Municipal fleet availability is operationally visible. Filtration supports the engine, hydraulic functions and service planning around vehicles that must return to scheduled work.</p>
          <div style={impactGrid}>{consequences.map(([title, text]) => <article key={title} style={impactCard}><h3 style={impactTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={section} aria-labelledby="decision-title">
        <div style={contentWidth}>
          <p style={eyebrow}>FROM ROUTE DUTY TO PART</p>
          <h2 id="decision-title" style={sectionTitle}>Resolve the municipal application in five decisions.</h2>
          <div style={decisionGrid}>{[
            ['Vehicle / Equipment', 'Identify the refuse truck, sweeper, vacuum truck, utility vehicle or public-works equipment.'],
            ['Mission', 'Define collection, sweeping, sewer, utility or support duty and the auxiliary equipment used.'],
            ['Exposure', 'Document dust, debris, fuel condition, idle time, hydraulic work and route environment.'],
            ['Protection', 'Map the exposure to engine, fuel, lubrication, hydraulic, cooling, compressed-air or cabin protection.'],
            ['Application Evidence', 'Validate the final filter using OEM reference, dimensions, configuration and documented application evidence.'],
          ].map(([title, text]) => <article key={title} style={decisionCard}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={evidenceSection} aria-labelledby="evidence-title">
        <div style={contentWidth}>
          <p style={eyebrow}>FLEET APPLICATION EVIDENCE</p>
          <h2 id="evidence-title" style={sectionTitle}>Standardization should follow confirmed compatibility.</h2>
          <p style={wideText}>A municipal fleet may contain similar-looking vehicles with different engines, hydraulic circuits, brake systems or filter specifications. Final identification should reconcile the known reference, vehicle configuration, dimensions and protected system before one SKU is standardized across multiple assets.</p>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={contentWidth}>
          <p style={eyebrow}>WASTE & MUNICIPAL FILTRATION QUESTIONS</p>
          <h2 id="faq-title" style={sectionTitle}>What fleet and public-works teams need to know.</h2>
          <div style={faqList}>{questions.map(([q, a]) => <article key={q} style={faqItem}><h3 style={faqQuestion}>{q}</h3><p style={faqAnswer}>{a}</p></article>)}</div>
        </div>
      </section>

      <section style={conversionSection}>
        <div style={conversionGrid}>
          <div><p style={eyebrow}>NEED TO RESOLVE A MUNICIPAL FLEET APPLICATION?</p><h2 style={conversionTitle}>Identify the protection path before standardizing the part.</h2><p style={conversionText}>Send the vehicle, engine, auxiliary equipment, protected system, route duty and any known OEM or filter reference.</p><Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>IDENTIFY MY MUNICIPAL PROTECTION PATH</Link></div>
          <div style={conversionSecondary}><div><p style={eyebrow}>ALREADY HAVE A PART NUMBER?</p><h3 style={conversionSubTitle}>Go directly to Part Search.</h3><a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a></div><div style={divider} /><div><p style={eyebrow}>SERVE MUNICIPAL FLEETS?</p><h3 style={conversionSubTitle}>Evaluate distributor fit.</h3><Link href="/distributor-application/" style={secondaryButton}>BECOME A DISTRIBUTOR</Link></div></div>
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
const heroShade: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(0,0,0,.94),rgba(0,0,0,.62) 54%,rgba(0,0,0,.16)),linear-gradient(0deg,rgba(0,0,0,.74),transparent 58%)' };
const heroInner: CSSProperties = { width: '100%', maxWidth: '1180px', margin: '0 auto', padding: 'clamp(7rem,12vw,10rem) clamp(1.25rem,5vw,4.5rem) clamp(4rem,7vw,6rem)', position: 'relative', zIndex: 2 };
const eyebrow: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.72rem', lineHeight: 1.2, letterSpacing: '.18em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 1rem' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-.055em', lineHeight: .88, fontSize: 'clamp(3.1rem,7.2vw,6.8rem)', textTransform: 'uppercase', margin: 0, maxWidth: '980px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,2vw,1.55rem)', lineHeight: 1.3, fontWeight: 700, maxWidth: '860px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem,1.45vw,1.18rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.78)', maxWidth: '930px', margin: '1rem 0 0' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '2rem' };
const primaryButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase' };
const secondaryButton: CSSProperties = { display: 'inline-block', background: 'transparent', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase', border: '1px solid rgba(255,241,45,.42)' };
const directSection: CSSProperties = { padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,6vw,6rem)', background: '#050505', borderBottom: '1px solid rgba(255,255,255,.08)' };
const contentWidth: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const directTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem,4vw,3.4rem)', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-.035em', margin: 0, maxWidth: '940px' };
const directText: CSSProperties = { fontSize: 'clamp(1.05rem,1.6vw,1.24rem)', lineHeight: 1.75, color: 'rgba(255,255,255,.82)', maxWidth: '980px', margin: '1.3rem 0 0' };
const section: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.2rem,4.7vw,4.2rem)', lineHeight: .96, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0, maxWidth: '940px' };
const bodyText: CSSProperties = { fontSize: '1rem', lineHeight: 1.72, color: 'rgba(255,255,255,.66)', margin: 0 };
const wideText: CSSProperties = { ...bodyText, maxWidth: '900px', marginTop: '1.3rem' };
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
const decisionGrid: CSSProperties = { marginTop: '2.6rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(205px,100%),1fr))', gap: '1px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.1)' };
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