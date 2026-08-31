import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import { IndustryFilterCarousel } from './IndustryFilterCarousel';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/industries/automotive/`;

const applications = [
  'Passenger Vehicles',
  'Light Commercial Vehicles',
  'Delivery Fleets',
  'Service Vans',
  'Pickup Trucks',
  'Mixed Light-Duty Fleets',
] as const;

const operatingConditions = [
  ['Urban Duty', 'Short trips, repeated starts, idling and traffic exposure change how intake, lubrication and cabin systems accumulate contamination.'],
  ['Highway Duty', 'Longer sustained operation shifts the maintenance problem toward engine protection, loading history and application-correct service intervals.'],
  ['Seasonal Exposure', 'Dust, pollen, road debris, temperature changes and cabin-air demand vary by climate and route environment.'],
  ['Fleet Standardization', 'Shared platforms can simplify service only when engine, model year, system configuration and application evidence actually match.'],
] as const;

const pathways = [
  ['ROAD DUST + PARTICULATE', 'Ambient dust + road debris + intake loading', 'AIR INTAKE', 'MACROCORE™', '/technologies/macrocore/'],
  ['FUEL CONTAMINATION', 'Storage + dispensing + vehicle fuel-system exposure', 'FUEL FILTRATION', 'APPLICATION-SPECIFIC FUEL PROTECTION', '/families/fuel-filters/'],
  ['LUBE CONTAMINATION', 'Wear debris + combustion byproducts + service ingress', 'LUBRICATION', 'SYNTRAX™', '/technologies/syntrax/'],
  ['CABIN PARTICULATE', 'Dust + pollen + urban airborne particulate', 'CABIN AIR', 'MICROKAPPA™', '/technologies/microkappa/'],
] as const;

const outcomes = [
  ['Engine Protection', 'Air, fuel and lubrication filtration protect the interfaces that determine engine cleanliness and service condition.'],
  ['Service Accuracy', 'Correct vehicle, engine and model-year identification reduces the risk of accepting a cross-reference that does not fit the actual application.'],
  ['Cabin Environment', 'Cabin filtration supports particulate control for the occupied vehicle environment and should be selected by the actual HVAC application.'],
  ['Fleet Consistency', 'Validated compatibility allows common vehicle groups to be serviced consistently without assuming all visually similar filters are interchangeable.'],
  ['Maintenance Planning', 'Application evidence supports repeatable service decisions across individual vehicles and light-duty fleets.'],
  ['Part Identification', 'Known OEM and filter references can accelerate identification, but final acceptance should still reconcile the vehicle application.'],
] as const;

const questions = [
  ['What filters are typically used in automotive and light-duty applications?', 'Common positions include engine air, fuel, lubrication and cabin-air filtration. The exact set depends on the vehicle, engine, fuel system, HVAC configuration, model year and application.'],
  ['Can the same filter be used across different model years?', 'Not automatically. A vehicle nameplate can span different engines, housings, fuel systems and HVAC configurations. Model year and application evidence should be checked before treating a reference as interchangeable.'],
  ['Why does vehicle duty matter when selecting filters?', 'Urban stop-start service, sustained highway operation, dusty roads, seasonal pollen and fleet utilization create different loading histories. Selection and maintenance planning should reflect the actual vehicle and operating environment.'],
  ['How should a fleet standardize automotive filters?', 'Group vehicles by confirmed platform, engine, system and application evidence. Standardization should follow verified compatibility rather than appearance, thread size or a single cross-reference alone.'],
  ['Is an OEM or current filter number enough to identify the correct replacement?', 'It is a strong starting point, but the final match should be reconciled with vehicle, engine, model year, dimensions and documented application evidence when available.'],
  ['What information helps ELIMFILTERS identify an automotive filter?', 'Provide year, make, model, engine, fuel type, protected system and any known OEM or current filter reference. Dimensions can help when application evidence is incomplete.'],
  ['Can ELIMFILTERS identify a filter from an existing part number?', 'Yes. Part Search is the fastest route when a known reference exists. For uncertain applications, include the vehicle and engine information so the cross-reference can be evaluated in context.'],
] as const;

export function AutomotiveIndustryPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#page`,
        url: PAGE_URL,
        name: 'Automotive Filtration Systems',
        description: 'Automotive filtration systems for passenger vehicles, light commercial vehicles, delivery fleets, service vans and mixed light-duty fleets requiring engine air, fuel, lubrication and cabin-air protection.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Automotive filtration systems' },
          { '@type': 'Thing', name: 'Light-duty vehicle filtration' },
          { '@type': 'Thing', name: 'Passenger vehicle engine filtration' },
          { '@type': 'Thing', name: 'Automotive cabin air filtration' },
          { '@type': 'Thing', name: 'Light commercial vehicle maintenance' },
        ],
        mentions: [
          { '@type': 'Thing', name: 'Engine air filtration' },
          { '@type': 'Thing', name: 'Fuel filtration' },
          { '@type': 'Thing', name: 'Lubrication filtration' },
          { '@type': 'Thing', name: 'Cabin air filtration' },
          { '@type': 'Thing', name: 'MACROCORE' },
          { '@type': 'Thing', name: 'SYNTRAX' },
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
          { '@type': 'ListItem', position: 3, name: 'Automotive Filtration Systems', item: PAGE_URL },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${PAGE_URL}#applications`,
        name: 'Automotive and light-duty applications',
        itemListElement: applications.map((name, index) => ({ '@type': 'ListItem', position: index + 1, name })),
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
      <PageHeader currentPage="Automotive" />

      <section style={hero}>
        <video autoPlay muted loop playsInline preload="auto" style={heroVideo}>
          <source src="/images/Autos-Vin4.mp4" type="video/mp4" />
        </video>
        <div style={heroShade} />
        <div style={heroInner}>
          <p style={eyebrow}>AUTOMOTIVE / LIGHT-DUTY ASSET PROTECTION</p>
          <h1 style={heroTitle}>Automotive Filtration<br /><span style={yellow}>Systems</span></h1>
          <p style={heroPromise}>Match the filter to the actual vehicle, engine and operating environment—not just the part number.</p>
          <p style={heroLead}>Engine air, fuel, lubrication and cabin-air filtration for passenger vehicles, light commercial vehicles, delivery fleets, service vans and mixed light-duty fleets.</p>
          <div style={actions}>
            <Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>IDENTIFY MY VEHICLE PROTECTION PATH</Link>
            <a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a>
          </div>
        </div>
      </section>

      <section style={directSection} aria-labelledby="auto-direct-title">
        <div style={contentWidth}>
          <p style={eyebrow}>DIRECT ANSWER</p>
          <h2 id="auto-direct-title" style={directTitle}>What defines the correct automotive filter?</h2>
          <p style={directText}>Correct automotive filtration starts with year, make, model, engine and protected system, then checks the operating environment, known reference, dimensions and application evidence. A cross-reference should not be accepted solely because a filter looks similar or shares one specification.</p>
        </div>
      </section>

      <section style={section} aria-labelledby="duty-title">
        <div style={contentWidth}>
          <p style={eyebrow}>VEHICLE DUTY PROFILE</p>
          <h2 id="duty-title" style={sectionTitle}>The same platform can live a very different service life.</h2>
          <p style={wideText}>A commuter vehicle, delivery van and service fleet can share components while accumulating contamination under very different operating conditions.</p>
          <div style={grid}>{operatingConditions.map(([title, text]) => <article key={title} style={card}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={applicationSection} aria-labelledby="applications-title">
        <div style={applicationGrid}>
          <div>
            <p style={eyebrow}>AUTOMOTIVE APPLICATIONS</p>
            <h2 id="applications-title" style={sectionTitle}>One light-duty market. Multiple operating profiles.</h2>
            <p style={wideText}>Vehicle class alone does not resolve the filtration requirement. Engine, system configuration and operating profile determine the application path.</p>
            <div role="list" aria-label="Automotive applications" style={applicationList}>{applications.map((asset) => <div role="listitem" key={asset} style={applicationRow}><span style={applicationName}>{asset}</span></div>)}</div>
          </div>
          <div><img src="/images/autos-02.avif" alt="Automotive and light-duty vehicle applications" style={applicationImage} /></div>
        </div>
      </section>

      <section style={section} aria-labelledby="path-title">
        <div style={contentWidth}>
          <p style={eyebrow}>PROTECTION PATHWAYS</p>
          <h2 id="path-title" style={sectionTitle}>Identify the contamination path before selecting the replacement filter.</h2>
          <div style={pathwayGrid}>{pathways.map(([source, detail, system, technology, href]) => <article key={system} style={pathwayCard}><div><span style={smallLabel}>CONTAMINATION SOURCE</span><strong style={pathwaySource}>{source}</strong><p style={smallText}>{detail}</p></div><div style={dividerLine} /><div><span style={smallLabel}>PROTECTION SYSTEM</span><strong style={pathwaySystem}>{system}</strong></div><Link href={href} style={technologyLink}><span style={smallLabelYellow}>ELIMFILTERS PROTECTION PATH</span><strong style={technologyName}>{technology}</strong><span style={technologyCta}>EXPLORE →</span></Link></article>)}</div>
        </div>
      </section>

      <section style={principleSection}><div style={principle}><span style={principleLabel}>AUTOMOTIVE ENGINEERING PRINCIPLE</span><p style={principleText}>Year, make and model identify the vehicle family; engine, system configuration and application evidence determine whether the filter is actually correct.</p></div></section>

      <IndustryFilterCarousel dutyClass="LD" industryName="Automotive" />

      <section style={impactSection} aria-labelledby="impact-title">
        <div style={contentWidth}>
          <p style={eyebrow}>SERVICE ACCURACY</p>
          <h2 id="impact-title" style={sectionTitle}>Protect the vehicle by getting the application right before the service starts.</h2>
          <div style={impactGrid}>{outcomes.map(([title, text]) => <article key={title} style={impactCard}><h3 style={impactTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={section} aria-labelledby="decision-title">
        <div style={contentWidth}>
          <p style={eyebrow}>FROM VEHICLE TO PART</p>
          <h2 id="decision-title" style={sectionTitle}>Resolve the automotive application in five decisions.</h2>
          <div style={decisionGrid}>{[
            ['Vehicle', 'Confirm year, make, model and vehicle class.'],
            ['Engine', 'Identify engine, fuel type and relevant system configuration.'],
            ['Duty', 'Define urban, highway, fleet and environmental exposure.'],
            ['Protection', 'Identify the air, fuel, lubrication or cabin-air position.'],
            ['Evidence', 'Validate with OEM reference, dimensions and documented application data.'],
          ].map(([title, text]) => <article key={title} style={decisionCard}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={evidenceSection} aria-labelledby="evidence-title">
        <div style={contentWidth}>
          <p style={eyebrow}>APPLICATION EVIDENCE</p>
          <h2 id="evidence-title" style={sectionTitle}>A cross-reference is useful evidence, not the whole application.</h2>
          <p style={wideText}>When a known part number exists, use it to accelerate identification. Final acceptance should still reconcile the actual vehicle, engine, model year, system position and available dimensional or application evidence.</p>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={contentWidth}>
          <p style={eyebrow}>AUTOMOTIVE FILTRATION QUESTIONS</p>
          <h2 id="faq-title" style={sectionTitle}>What vehicle owners, service teams and fleet managers need to know.</h2>
          <div style={faqList}>{questions.map(([q, a]) => <article key={q} style={faqItem}><h3 style={faqQuestion}>{q}</h3><p style={faqAnswer}>{a}</p></article>)}</div>
        </div>
      </section>

      <section style={conversionSection}>
        <div style={conversionGrid}>
          <div><p style={eyebrow}>HAVE A VEHICLE OR PART NUMBER?</p><h2 style={conversionTitle}>Identify the correct filtration path before the service decision becomes a mismatch.</h2><p style={conversionText}>Send the year, make, model, engine, protected system and any known OEM or current filter reference.</p><Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>IDENTIFY MY VEHICLE PROTECTION PATH</Link></div>
          <div style={conversionSecondary}><div><p style={eyebrow}>ALREADY HAVE A REFERENCE?</p><h3 style={conversionSubTitle}>Go directly to Part Search.</h3><a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a></div><div style={dividerLine} /><div><p style={eyebrow}>SERVE AUTOMOTIVE CUSTOMERS?</p><h3 style={conversionSubTitle}>Evaluate distributor fit.</h3><Link href="/distributor-application/" style={secondaryButton}>BECOME A DISTRIBUTOR</Link></div></div>
        </div>
      </section>
    </main>
  );
}

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';
const yellow: CSSProperties = { color: '#FFF12D' };
const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont, overflowX: 'hidden' };
const hero: CSSProperties = { minHeight: '92vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,.08)' };
const heroVideo: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .78 };
const heroShade: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(0,0,0,.93),rgba(0,0,0,.57) 55%,rgba(0,0,0,.1)),linear-gradient(0deg,rgba(0,0,0,.72),transparent 58%)' };
const heroInner: CSSProperties = { width: '100%', maxWidth: '1180px', margin: '0 auto', padding: 'clamp(7rem,12vw,10rem) clamp(1.25rem,5vw,4.5rem) clamp(4rem,7vw,6rem)', position: 'relative', zIndex: 2 };
const eyebrow: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.72rem', letterSpacing: '.18em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 1rem' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-.055em', lineHeight: .88, fontSize: 'clamp(3.3rem,7.6vw,7.2rem)', textTransform: 'uppercase', margin: 0, maxWidth: '950px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,2vw,1.55rem)', lineHeight: 1.3, fontWeight: 700, maxWidth: '850px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem,1.45vw,1.18rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.78)', maxWidth: '900px', margin: '1rem 0 0' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '2rem' };
const primaryButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase' };
const secondaryButton: CSSProperties = { display: 'inline-block', background: 'transparent', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase', border: '1px solid rgba(255,241,45,.42)' };
const contentWidth: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const directSection: CSSProperties = { padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,6vw,6rem)', background: '#050505', borderBottom: '1px solid rgba(255,255,255,.08)' };
const directTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem,4vw,3.4rem)', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-.035em', margin: 0, maxWidth: '900px' };
const directText: CSSProperties = { fontSize: 'clamp(1.05rem,1.6vw,1.24rem)', lineHeight: 1.75, color: 'rgba(255,255,255,.82)', maxWidth: '980px', margin: '1.3rem 0 0' };
const section: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.2rem,4.7vw,4.2rem)', lineHeight: .96, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0, maxWidth: '940px' };
const bodyText: CSSProperties = { fontSize: '1rem', lineHeight: 1.72, color: 'rgba(255,255,255,.66)', margin: 0 };
const wideText: CSSProperties = { ...bodyText, maxWidth: '880px', marginTop: '1.3rem' };
const grid: CSSProperties = { marginTop: '2.8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(240px,100%),1fr))', gap: '1px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.1)' };
const card: CSSProperties = { background: '#050505', padding: '1.55rem', minHeight: '210px' };
const cardTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem,1.8vw,1.35rem)', lineHeight: 1.05, textTransform: 'uppercase', margin: '0 0 .8rem' };
const applicationSection: CSSProperties = { ...section, background: '#050505' };
const applicationGrid: CSSProperties = { ...contentWidth, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(340px,100%),1fr))', gap: 'clamp(2.5rem,6vw,5rem)', alignItems: 'center' };
const applicationImage: CSSProperties = { width: '100%', height: 'auto', objectFit: 'contain', display: 'block', border: '1px solid rgba(255,255,255,.08)' };
const applicationList: CSSProperties = { marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,.14)' };
const applicationRow: CSSProperties = { padding: '.95rem 0', borderBottom: '1px solid rgba(255,255,255,.14)' };
const applicationName: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(.95rem,1.3vw,1.25rem)', textTransform: 'uppercase', fontWeight: 700 };
const pathwayGrid: CSSProperties = { marginTop: '2.8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(280px,100%),1fr))', gap: '1rem' };
const pathwayCard: CSSProperties = { border: '1px solid rgba(255,255,255,.1)', background: '#050505', padding: '1.5rem', minHeight: '265px', display: 'grid', gap: '1rem' };
const smallLabel: CSSProperties = { fontFamily: displayFont, fontSize: '.58rem', letterSpacing: '.13em', color: 'rgba(255,255,255,.4)', fontWeight: 700, display: 'block', marginBottom: '.7rem' };
const smallLabelYellow: CSSProperties = { ...smallLabel, color: '#FFF12D' };
const pathwaySource: CSSProperties = { fontFamily: displayFont, fontSize: '1.15rem', textTransform: 'uppercase' };
const pathwaySystem: CSSProperties = { fontFamily: displayFont, fontSize: '1.05rem', textTransform: 'uppercase' };
const smallText: CSSProperties = { ...bodyText, fontSize: '.86rem', lineHeight: 1.55, marginTop: '.6rem' };
const dividerLine: CSSProperties = { height: '1px', background: 'rgba(255,255,255,.1)' };
const technologyLink: CSSProperties = { textDecoration: 'none', borderTop: '1px solid rgba(255,241,45,.18)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' };
const technologyName: CSSProperties = { fontFamily: displayFont, fontSize: '1.16rem', color: '#FFF12D', textTransform: 'uppercase' };
const technologyCta: CSSProperties = { fontFamily: displayFont, fontSize: '.58rem', letterSpacing: '.1em', color: 'rgba(255,255,255,.6)', marginTop: '.65rem' };
const principleSection: CSSProperties = { padding: '0 clamp(1.25rem,6vw,6rem) clamp(4.5rem,8vw,7rem)' };
const principle: CSSProperties = { ...contentWidth, borderLeft: '4px solid #FFF12D', background: 'linear-gradient(90deg,rgba(255,241,45,.08),rgba(255,255,255,.018))', padding: 'clamp(2rem,4vw,3rem)' };
const principleLabel: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.74rem', letterSpacing: '.16em', fontWeight: 700 };
const principleText: CSSProperties = { fontSize: 'clamp(1.2rem,2vw,1.55rem)', lineHeight: 1.55, color: 'rgba(255,255,255,.9)', margin: '1rem 0 0', maxWidth: '1040px' };
const impactSection: CSSProperties = { ...section, background: '#050505' };
const impactGrid: CSSProperties = { marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(300px,100%),1fr))', gap: '1rem' };
const impactCard: CSSProperties = { borderTop: '1px solid rgba(255,255,255,.15)', padding: '1.25rem 0', minHeight: '145px' };
const impactTitle: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '1.05rem', textTransform: 'uppercase', margin: '0 0 .65rem' };
const decisionGrid: CSSProperties = { marginTop: '2.6rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(210px,100%),1fr))', gap: '1px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.1)' };
const decisionCard: CSSProperties = { background: '#030303', minHeight: '200px', padding: '1.5rem' };
const evidenceSection: CSSProperties = { ...section, background: 'linear-gradient(90deg,rgba(255,241,45,.045),#030303 38%)' };
const faqSection: CSSProperties = { ...section, background: '#070707' };
const faqList: CSSProperties = { marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,.12)' };
const faqItem: CSSProperties = { padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,.12)' };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem,1.8vw,1.3rem)', lineHeight: 1.25, margin: '0 0 .65rem' };
const faqAnswer: CSSProperties = { ...bodyText, maxWidth: '940px', fontSize: '.96rem' };
const conversionSection: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', background: '#020202', borderTop: '1px solid rgba(255,255,255,.08)' };
const conversionGrid: CSSProperties = { ...contentWidth, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(340px,100%),1fr))', gap: 'clamp(2.5rem,6vw,5rem)' };
const conversionSecondary: CSSProperties = { display: 'grid', gap: '2.2rem' };
const conversionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2.4rem,5vw,4.6rem)', lineHeight: .95, letterSpacing: '-.04em', textTransform: 'uppercase', maxWidth: '780px', margin: 0 };
const conversionText: CSSProperties = { ...bodyText, fontSize: '1.05rem', maxWidth: '680px', margin: '1.5rem 0 2rem' };
const conversionSubTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.5rem,2.8vw,2.2rem)', textTransform: 'uppercase', margin: '0 0 1.5rem' };
