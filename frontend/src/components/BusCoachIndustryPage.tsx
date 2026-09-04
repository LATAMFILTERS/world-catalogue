import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import { IndustryFilterCarousel } from './IndustryFilterCarousel';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/industries/bus-coach/`;

const fleetTypes = [
  'Urban Transit Buses',
  'Intercity Coaches',
  'School Buses',
  'Shuttle Fleets',
  'Touring Coaches',
  'Airport & Institutional Buses',
] as const;

const dutyFactors = [
  ['Stop-and-Go Duty', 'Frequent acceleration, braking, idling and low-speed operation change engine loading, thermal conditions and service demand throughout the route.'],
  ['Passenger Environment', 'Cabin air quality and HVAC filtration matter because the protected space is occupied continuously across repeated boarding and route cycles.'],
  ['Pneumatic Brake Dependence', 'Air-brake systems depend on controlled compressed-air quality and moisture management to support consistent pneumatic function.'],
  ['Route Availability', 'Transit and coach fleets work to fixed timetables, so maintenance planning must resolve parts and application fit before a vehicle leaves service.'],
] as const;

const pathways = [
  ['ROAD DUST + URBAN PARTICULATE', 'Road dust + traffic particulate + intake loading', 'AIR INTAKE', 'MACROCORE™', '/technologies/macrocore/'],
  ['FUEL + WATER', 'Storage + transfer + condensation + fueling exposure', 'FUEL / WATER SEPARATION', 'HYDROCORE™', '/technologies/hydrocore/'],
  ['LUBE CONTAMINATION', 'Wear debris + soot + repeated duty cycling', 'LUBRICATION', 'SYNTRAX™', '/technologies/syntrax/'],
  ['MOISTURE IN COMPRESSED AIR', 'Humidity + compressor carryover + pneumatic-system exposure', 'COMPRESSED AIR', 'DRYCORE™', '/technologies/drycore/'],
  ['CABIN PARTICULATE', 'Traffic particulate + passenger loading + HVAC recirculation', 'CABIN AIR', 'MICROKAPPA™', '/technologies/microkappa/'],
  ['COOLANT CONTAMINATION', 'Coolant condition + thermal cycling + service contamination', 'COOLING', 'THERMACORE™', '/technologies/thermacore/'],
] as const;

const consequences = [
  ['Route Continuity', 'A bus removed from service affects vehicle assignment, headway planning and the capacity available to the route or passenger schedule.'],
  ['Engine Availability', 'Air, fuel, lubrication and cooling protection support the engine systems that must remain available through repeated daily duty.'],
  ['Brake-System Support', 'Compressed-air protection helps manage moisture and contamination in pneumatic systems used across many heavy bus and coach platforms.'],
  ['Passenger Environment', 'Cabin filtration supports the HVAC air path serving drivers and passengers in high-occupancy vehicles.'],
  ['Depot Planning', 'Correct application identification before scheduled service helps maintenance teams stage the right parts before the vehicle enters the bay.'],
  ['Fleet Standardization', 'Common platforms can support standardized maintenance only when engine, chassis, system and application compatibility are confirmed.'],
] as const;

const questions = [
  ['What filtration systems are most important for bus and coach fleets?', 'Air intake, fuel and water separation, lubrication, cooling, compressed-air and cabin filtration are common priorities. The exact requirement depends on the vehicle platform, engine, brake architecture, HVAC configuration, duty cycle and validated application evidence.'],
  ['How does urban stop-and-go duty affect filtration decisions?', 'Repeated acceleration, braking, idling and low-speed operation can change engine loading, thermal conditions, soot exposure and maintenance demand. Filter selection should reflect the actual route and duty profile rather than a generic vehicle category.'],
  ['Why is compressed-air filtration important on buses and coaches?', 'Many heavy bus and coach platforms use pneumatic systems for braking and other functions. Moisture and contamination management should therefore be considered as part of the vehicle protection architecture where an air-dryer position is specified.'],
  ['Why does cabin filtration matter in passenger fleets?', 'Passenger vehicles operate with continuous HVAC use, repeated door openings and high occupancy. Cabin filter selection should match the HVAC application, vehicle configuration and service environment.'],
  ['Can the same filter be standardized across an entire bus fleet?', 'Only when compatibility is confirmed. Similar-looking buses may use different engines, chassis, brake systems, HVAC configurations or filtration positions. Standardization should follow documented application evidence.'],
  ['Should bus and coach filters be selected only by service interval?', 'No. Service interval alone does not describe route duty, idling, ambient particulate, fuel condition, HVAC loading, engine configuration or pneumatic-system requirements.'],
  ['What information is needed to identify the correct bus or coach filter?', 'Use the vehicle make and model, model year, engine, chassis or VIN information when available, protected system, duty profile, OEM or current filter reference, dimensions where needed and validated application evidence.'],
  ['Can ELIMFILTERS identify a bus or coach filter from an OEM or part number?', 'Yes. A known OEM or current filter reference can be used as a starting point in Part Search. Final confirmation should still reconcile the vehicle, engine, protected system and application evidence.'],
] as const;

export function BusCoachIndustryPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#page`,
        url: PAGE_URL,
        name: 'Bus & Coach Filtration Systems',
        description: 'Bus and coach filtration systems for transit buses, intercity coaches, school buses, shuttle fleets and passenger vehicles requiring air, fuel, lubrication, cooling, compressed-air and cabin protection.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Bus and coach filtration systems' },
          { '@type': 'Thing', name: 'Transit bus filtration' },
          { '@type': 'Thing', name: 'Coach fleet maintenance' },
          { '@type': 'Thing', name: 'Bus compressed air filtration' },
          { '@type': 'Thing', name: 'Bus cabin air filtration' },
          { '@type': 'Thing', name: 'Passenger fleet contamination control' },
        ],
        mentions: [
          { '@type': 'Thing', name: 'Air intake filtration' },
          { '@type': 'Thing', name: 'Fuel filtration and water separation' },
          { '@type': 'Thing', name: 'Lubrication filtration' },
          { '@type': 'Thing', name: 'Compressed air filtration' },
          { '@type': 'Thing', name: 'Cabin air filtration' },
          { '@type': 'Thing', name: 'Cooling system filtration' },
          { '@type': 'Thing', name: 'MACROCORE' },
          { '@type': 'Thing', name: 'HYDROCORE' },
          { '@type': 'Thing', name: 'SYNTRAX' },
          { '@type': 'Thing', name: 'DRYCORE' },
          { '@type': 'Thing', name: 'MICROKAPPA' },
          { '@type': 'Thing', name: 'THERMACORE' },
        ],
        breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Industry', item: `${BASE_URL}/industries/` },
          { '@type': 'ListItem', position: 3, name: 'Bus & Coach Filtration Systems', item: PAGE_URL },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${PAGE_URL}#fleet-types`,
        name: 'Bus and coach fleet applications',
        itemListElement: fleetTypes.map((name, index) => ({ '@type': 'ListItem', position: index + 1, name })),
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
      <PageHeader currentPage="Bus Coach" />

      <section style={hero}>
        <video autoPlay muted loop playsInline preload="auto" style={heroVideo}>
          <source src="/images/buses-2.mp4" type="video/mp4" />
        </video>
        <div style={heroShade} />
        <div style={heroInner}>
          <p style={eyebrow}>BUS & COACH / PASSENGER FLEET PROTECTION</p>
          <h1 style={heroTitle}>Bus & Coach<br /><span style={yellow}>Filtration Systems</span></h1>
          <p style={heroPromise}>Protect route availability, engine systems, compressed air and the passenger environment with application-specific filtration.</p>
          <p style={heroLead}>Filtration architecture for transit buses, intercity coaches, school buses, shuttle fleets and other passenger vehicles operating through stop-and-go duty, urban particulate, long daily service and scheduled depot maintenance.</p>
          <div style={actions}>
            <Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>IDENTIFY MY BUS & COACH PROTECTION PATH</Link>
            <a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a>
          </div>
        </div>
      </section>

      <section style={directSection} aria-labelledby="bus-direct-title">
        <div style={contentWidth}>
          <p style={eyebrow}>DIRECT ANSWER</p>
          <h2 id="bus-direct-title" style={directTitle}>What defines the correct filtration strategy for a bus or coach fleet?</h2>
          <p style={directText}>Start with the actual vehicle platform, engine and protected system. Then resolve route duty, passenger environment, compressed-air architecture, fuel condition, service windows and documented application evidence. A bus category or service interval alone is not enough to confirm the correct filter.</p>
        </div>
      </section>

      <section style={section} aria-labelledby="duty-title">
        <div style={contentWidth}>
          <p style={eyebrow}>PASSENGER-FLEET DUTY</p>
          <h2 id="duty-title" style={sectionTitle}>The vehicle has to protect the route and the occupied environment at the same time.</h2>
          <p style={wideText}>Bus and coach filtration decisions span propulsion, compressed air, cooling and HVAC. The operating context is different from a conventional truck fleet because passenger load, route frequency and depot schedules are part of the maintenance equation.</p>
          <div style={cardGrid}>{dutyFactors.map(([title, text]) => <article key={title} style={card}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={fleetSection} aria-labelledby="fleet-title">
        <div style={fleetGrid}>
          <div>
            <p style={eyebrow}>FLEET APPLICATIONS</p>
            <h2 id="fleet-title" style={sectionTitle}>One passenger sector. Multiple duty profiles.</h2>
            <p style={wideText}>Urban transit, school transportation, intercity service and shuttle operations can share similar vehicle architecture while operating under very different route lengths, passenger cycles and maintenance windows.</p>
            <div style={fleetList}>{fleetTypes.map((item) => <div key={item} style={fleetRow}>{item}</div>)}</div>
          </div>
          <div style={fleetMedia}><img src="/images/bus-hero.avif" alt="Bus and coach fleet operating in passenger service" style={fleetImage} /></div>
        </div>
      </section>

      <section style={section} aria-labelledby="path-title">
        <div style={contentWidth}>
          <p style={eyebrow}>PROTECTION PATHWAYS</p>
          <h2 id="path-title" style={sectionTitle}>Connect each contamination path to the system that keeps the vehicle in service.</h2>
          <p style={wideText}>The protection architecture should identify the contamination source, the affected vehicle system, the appropriate ELIMFILTERS technology and then the validated part for that exact application.</p>
          <div className="industry-pathway-grid" style={pathwayGrid}>{pathways.map(([source, detail, system, technology, href]) => <article key={system} style={pathwayCard}><div><span style={smallLabel}>CONTAMINATION / CONDITION</span><strong style={pathwaySource}>{source}</strong><p style={smallText}>{detail}</p></div><div style={pathwayDivider} /><div><span style={smallLabel}>PROTECTED SYSTEM</span><strong style={pathwaySystem}>{system}</strong></div><Link href={href} style={technologyLink}><span style={smallLabelYellow}>ELIMFILTERS TECHNOLOGY</span><strong style={technologyName}>{technology}</strong><span style={technologyCta}>EXPLORE →</span></Link></article>)}</div>
        </div>
      </section>

      <section style={principleSection}>
        <div style={principle}><span style={principleLabel}>BUS & COACH ENGINEERING PRINCIPLE</span><p style={principleText}>Passenger-fleet filtration should be resolved by vehicle platform, route duty, protected system and application evidence before fleet-wide standardization is accepted.</p></div>
      </section>

      <IndustryFilterCarousel dutyClass="HD" industryName="Bus Coach" />

      <section style={impactSection} aria-labelledby="impact-title">
        <div style={contentWidth}>
          <p style={eyebrow}>ROUTE AVAILABILITY</p>
          <h2 id="impact-title" style={sectionTitle}>Protect the systems that determine whether the vehicle can stay assigned to service.</h2>
          <p style={wideText}>A filtration decision affects more than an engine component. It can influence route continuity, brake-system support, HVAC service, depot planning and the ability to standardize maintenance across a mixed passenger fleet.</p>
          <div style={impactGrid}>{consequences.map(([title, text]) => <article key={title} style={impactCard}><h3 style={impactTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={section} aria-labelledby="decision-title">
        <div style={contentWidth}>
          <p style={eyebrow}>FROM ROUTE PROFILE TO PART</p>
          <h2 id="decision-title" style={sectionTitle}>Resolve the bus or coach application in six decisions.</h2>
          <div style={decisionGrid}>{[
            ['Vehicle', 'Identify make, model, year, chassis and fleet configuration.'],
            ['Engine', 'Resolve the installed engine and any platform-specific engine variation.'],
            ['Route Duty', 'Define urban stop-start, school, shuttle, intercity, touring or mixed service.'],
            ['Protected System', 'Identify air intake, fuel, lubrication, cooling, compressed air or cabin HVAC.'],
            ['Service Context', 'Account for depot schedule, ambient particulate, passenger load and fueling conditions.'],
            ['Application Evidence', 'Validate the final filter using OEM reference, current part, dimensions and documented fitment evidence.'],
          ].map(([title, text]) => <article key={title} style={decisionCard}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={evidenceSection} aria-labelledby="evidence-title">
        <div style={contentWidth}>
          <p style={eyebrow}>DEPOT APPLICATION EVIDENCE</p>
          <h2 id="evidence-title" style={sectionTitle}>A fleet standard is only useful when the underlying applications are actually compatible.</h2>
          <p style={wideText}>Before consolidating part numbers across a bus or coach fleet, reconcile engine, chassis, protected system, OEM reference, dimensions and documented application evidence. Similar body styles do not prove identical filter positions.</p>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={contentWidth}>
          <p style={eyebrow}>BUS & COACH FILTRATION QUESTIONS</p>
          <h2 id="faq-title" style={sectionTitle}>What fleet and maintenance teams need to know.</h2>
          <div style={faqList}>{questions.map(([q, a]) => <article key={q} style={faqItem}><h3 style={faqQuestion}>{q}</h3><p style={faqAnswer}>{a}</p></article>)}</div>
        </div>
      </section>

      <section style={conversionSection}>
        <div style={conversionGrid}>
          <div><p style={eyebrow}>HAVE A BUS, COACH OR FLEET APPLICATION?</p><h2 style={conversionTitle}>Identify the protection path before the next depot window.</h2><p style={conversionText}>Send the vehicle make, model, year, engine, chassis or VIN details when available, protected system, route duty and any known OEM or current filter reference.</p><Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>IDENTIFY MY BUS & COACH PROTECTION PATH</Link></div>
          <div style={conversionSecondary}><div><p style={eyebrow}>ALREADY HAVE A PART NUMBER?</p><h3 style={conversionSubTitle}>Go directly to Part Search.</h3><a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a></div><div style={divider} /><div><p style={eyebrow}>SERVE TRANSIT OR COACH OPERATORS?</p><h3 style={conversionSubTitle}>Evaluate distributor fit.</h3><Link href="/distributor-application/" style={secondaryButton}>BECOME A DISTRIBUTOR</Link></div></div>
        </div>
      </section>
    </main>
  );
}

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';
const yellow: CSSProperties = { color: '#FFF12D' };
const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont, overflowX: 'hidden' };
const contentWidth: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const hero: CSSProperties = { minHeight: '92vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', background: '#000', borderBottom: '1px solid rgba(255,255,255,.08)' };
const heroVideo: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: .75 };
const heroShade: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(0,0,0,.94),rgba(0,0,0,.6) 55%,rgba(0,0,0,.15)),linear-gradient(0deg,rgba(0,0,0,.72),transparent 55%)' };
const heroInner: CSSProperties = { ...contentWidth, width: '100%', padding: 'clamp(7rem,12vw,10rem) clamp(1.25rem,5vw,4.5rem) clamp(4rem,7vw,6rem)', position: 'relative', zIndex: 2 };
const eyebrow: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.72rem', lineHeight: 1.2, letterSpacing: '.18em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 1rem' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-.055em', lineHeight: .88, fontSize: 'clamp(3.2rem,7.3vw,7rem)', textTransform: 'uppercase', margin: 0, maxWidth: '980px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,2vw,1.5rem)', lineHeight: 1.32, fontWeight: 700, maxWidth: '860px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem,1.45vw,1.17rem)', lineHeight: 1.72, color: 'rgba(255,255,255,.78)', maxWidth: '920px', margin: '1rem 0 0' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '2rem' };
const primaryButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.72rem', padding: '1rem 1.15rem', textTransform: 'uppercase' };
const secondaryButton: CSSProperties = { display: 'inline-block', background: 'transparent', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.72rem', padding: '1rem 1.15rem', textTransform: 'uppercase', border: '1px solid rgba(255,241,45,.42)' };
const directSection: CSSProperties = { padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,6vw,6rem)', background: '#050505', borderBottom: '1px solid rgba(255,255,255,.08)' };
const directTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem,4vw,3.4rem)', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-.035em', margin: 0, maxWidth: '960px' };
const directText: CSSProperties = { fontSize: 'clamp(1.05rem,1.6vw,1.24rem)', lineHeight: 1.75, color: 'rgba(255,255,255,.82)', maxWidth: '980px', margin: '1.3rem 0 0' };
const section: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.2rem,4.7vw,4.1rem)', lineHeight: .96, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0, maxWidth: '960px' };
const bodyText: CSSProperties = { fontSize: '1rem', lineHeight: 1.72, color: 'rgba(255,255,255,.67)', margin: 0 };
const wideText: CSSProperties = { ...bodyText, maxWidth: '900px', marginTop: '1.3rem' };
const cardGrid: CSSProperties = { marginTop: '2.8rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.1)' };
const card: CSSProperties = { background: '#050505', padding: '1.55rem', minHeight: '220px', flex: '1 1 240px', maxWidth: '380px', minWidth: 0 };
const cardTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.03rem,1.7vw,1.3rem)', lineHeight: 1.08, textTransform: 'uppercase', color: '#fff', margin: '0 0 .8rem' };
const fleetSection: CSSProperties = { ...section, background: '#050505' };
const fleetGrid: CSSProperties = { ...contentWidth, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(340px,100%),1fr))', gap: 'clamp(2.5rem,6vw,5rem)', alignItems: 'center' };
const fleetList: CSSProperties = { marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,.14)' };
const fleetRow: CSSProperties = { padding: '.95rem 0', borderBottom: '1px solid rgba(255,255,255,.14)', fontFamily: displayFont, textTransform: 'uppercase', fontWeight: 700, fontSize: 'clamp(.95rem,1.3vw,1.2rem)' };
const fleetMedia: CSSProperties = { minWidth: 0 };
const fleetImage: CSSProperties = { width: '100%', height: 'auto', objectFit: 'contain', display: 'block', border: '1px solid rgba(255,255,255,.08)' };
const pathwayGrid: CSSProperties = { marginTop: '2.8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(300px,100%),1fr))', gap: '1rem' };
const pathwayCard: CSSProperties = { border: '1px solid rgba(255,255,255,.1)', background: '#050505', padding: '1.5rem', minHeight: '260px', display: 'grid', gap: '1rem' };
const smallLabel: CSSProperties = { fontFamily: displayFont, fontSize: '.58rem', letterSpacing: '.13em', color: 'rgba(255,255,255,.42)', fontWeight: 700, display: 'block', marginBottom: '.7rem' };
const smallLabelYellow: CSSProperties = { ...smallLabel, color: '#FFF12D' };
const pathwaySource: CSSProperties = { fontFamily: displayFont, fontSize: '1.12rem', color: '#fff', textTransform: 'uppercase' };
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
const decisionGrid: CSSProperties = { marginTop: '2.6rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.1)' };
const decisionCard: CSSProperties = { background: '#030303', minHeight: '205px', padding: '1.5rem', flex: '1 1 210px', maxWidth: '340px', minWidth: 0 };
const evidenceSection: CSSProperties = { ...section, background: 'linear-gradient(90deg,rgba(255,241,45,.045),#030303 38%)' };
const faqSection: CSSProperties = { ...section, background: '#070707' };
const faqList: CSSProperties = { marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,.12)' };
const faqItem: CSSProperties = { padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,.12)' };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem,1.8vw,1.3rem)', lineHeight: 1.25, margin: '0 0 .65rem' };
const faqAnswer: CSSProperties = { ...bodyText, maxWidth: '940px', fontSize: '.96rem' };
const conversionSection: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', background: '#020202', borderTop: '1px solid rgba(255,255,255,.08)' };
const conversionGrid: CSSProperties = { ...contentWidth, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(340px,100%),1fr))', gap: 'clamp(2.5rem,6vw,5rem)' };
const conversionSecondary: CSSProperties = { display: 'grid', gap: '2.2rem' };
const conversionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2.35rem,5vw,4.5rem)', lineHeight: .95, letterSpacing: '-.04em', textTransform: 'uppercase', maxWidth: '780px', margin: 0 };
const conversionText: CSSProperties = { ...bodyText, fontSize: '1.05rem', maxWidth: '700px', margin: '1.5rem 0 2rem' };
const conversionSubTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.5rem,2.8vw,2.2rem)', textTransform: 'uppercase', margin: '0 0 1.5rem' };
const divider: CSSProperties = { height: '1px', background: 'rgba(255,255,255,.12)' };
