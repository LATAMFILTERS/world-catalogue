import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import { IndustryFilterCarousel } from './IndustryFilterCarousel';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/industries/trucks-fleets/`;

const fleetProfiles = [
  ['Long-Haul', 'High annual mileage, extended engine runtime and route dependence make service planning and parts consistency central to fleet availability.'],
  ['Regional', 'Repeated delivery cycles, changing road conditions and frequent starts place different demands on fuel, lubrication, cooling and air systems.'],
  ['Vocational', 'Construction support, refuse, utility and severe-duty work can add dust, hydraulic demand, idling and contamination exposure beyond normal highway duty.'],
  ['Mixed Fleet', 'Different makes, engines and duty profiles increase the value of disciplined cross-reference, application evidence and fleet-wide part standardization.'],
] as const;

const equipment = [
  'Class 8 Tractors',
  'Regional Haul Trucks',
  'Vocational Trucks',
  'Delivery & Distribution Fleets',
  'Fleet Support Vehicles',
  'Engine-Driven Auxiliary Equipment',
] as const;

const protection = [
  ['ROAD DUST + AIRBORNE PARTICULATE', 'Highway + terminal + yard + vocational exposure', 'AIR INTAKE', 'MACROCORE™', '/technologies/macrocore/'],
  ['FUEL + WATER', 'Bulk storage + transfer + condensation + refueling', 'FUEL / WATER SEPARATION', 'HYDROCORE™', '/technologies/hydrocore/'],
  ['LUBE CONTAMINATION', 'Wear debris + soot + service ingress', 'LUBRICATION', 'SYNTRAX™', '/technologies/syntrax/'],
  ['COOLANT CONTAMINATION', 'Coolant condition + deposits + service contamination', 'COOLING', 'THERMACORE™', '/technologies/thermacore/'],
  ['COMPRESSED-AIR MOISTURE', 'Air-brake pneumatic system moisture + contaminants', 'COMPRESSED AIR', 'DRYCORE™', '/technologies/drycore/'],
  ['CABIN PARTICULATE', 'Road dust + urban particulate + outside air intake', 'CABIN AIR', 'MICROKAPPA™', '/technologies/microkappa/'],
] as const;

const consequences = [
  ['Route Availability', 'A filtration-related service event can remove a truck from a planned route and create replacement, rescheduling or recovery work.'],
  ['Fleet Standardization', 'A governed application path helps maintenance teams reduce ambiguity across makes, engines, duty profiles and replacement references.'],
  ['Fuel-System Protection', 'Fuel cleanliness and water control matter across bulk storage, transfer and final engine supply, not only at the filter head.'],
  ['Service Predictability', 'Filtration decisions should support planned maintenance around actual duty and contamination exposure rather than a generic interval alone.'],
  ['Driver Environment', 'Cabin filtration supports particulate control at the operator air intake without being confused with engine air filtration.'],
  ['Parts Readiness', 'Validated references and fleet-level application evidence reduce the risk of selecting a plausible but incorrect replacement during service.'],
] as const;

const questions = [
  ['What filtration systems matter most in a heavy-duty truck fleet?', 'Air intake, fuel and water separation, lubrication, cooling, compressed-air and cabin-air filtration are common priorities. Some vocational applications also use hydraulic filtration. The correct mix depends on vehicle configuration, engine, duty cycle, environment and protected system.'],
  ['How should filtration differ between long-haul, regional and vocational trucks?', 'Long-haul fleets emphasize route uptime and extended runtime, regional fleets see more repeated starts and delivery cycles, and vocational trucks may add dust, idling, hydraulic demand and severe-duty exposure. Filter selection should reflect the actual duty profile rather than the truck category alone.'],
  ['Why is fuel-water control important for diesel fleets?', 'Fuel can acquire water or particulate during bulk storage, tank breathing, condensation, transfer and refueling. A fleet protection strategy should therefore consider the full path from storage to the engine, not only the final filter position.'],
  ['Should fleet filters be selected only by mileage or service interval?', 'No. Mileage and hours are useful maintenance inputs, but they do not describe fuel quality, dust exposure, idling, loading, cooling demand, sealing condition or route environment. Selection and service planning should reflect the application and operating conditions.'],
  ['How can a fleet reduce part-number confusion across multiple truck makes?', 'Use a governed cross-reference process that combines the known OEM or current filter reference with vehicle, engine, protected system, dimensions where needed and validated application evidence before standardizing a replacement across the fleet.'],
  ['What information is needed to identify the correct truck filter?', 'Use the truck make and model, engine, year or configuration when available, protected system, duty cycle, known OEM or current filter number, dimensions where needed and validated application evidence.'],
  ['Can ELIMFILTERS identify a truck filter from an OEM or competitor reference?', 'If a known OEM or current filter reference is available, Part Search is the fastest route to cross-reference and application information. Final confirmation should still reconcile the vehicle or engine context and protected system.'],
] as const;

export function TrucksFleetsIndustryPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#page`,
        url: PAGE_URL,
        name: 'Truck Fleets Filtration Systems',
        description: 'Truck fleet filtration systems for long-haul, regional, vocational and mixed commercial fleets requiring air, fuel, lubrication, cooling, compressed-air and cabin protection.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Heavy-duty truck fleet filtration' },
          { '@type': 'Thing', name: 'Commercial fleet maintenance' },
          { '@type': 'Thing', name: 'Diesel fuel water separation' },
          { '@type': 'Thing', name: 'Truck fleet service standardization' },
          { '@type': 'Thing', name: 'Long-haul truck filtration' },
          { '@type': 'Thing', name: 'Vocational truck filtration' },
        ],
        mentions: [
          { '@type': 'Thing', name: 'Air intake filtration' },
          { '@type': 'Thing', name: 'Fuel filtration and water separation' },
          { '@type': 'Thing', name: 'Lubrication filtration' },
          { '@type': 'Thing', name: 'Cooling system filtration' },
          { '@type': 'Thing', name: 'Compressed air filtration' },
          { '@type': 'Thing', name: 'Cabin air filtration' },
          { '@type': 'Thing', name: 'MACROCORE' },
          { '@type': 'Thing', name: 'HYDROCORE' },
          { '@type': 'Thing', name: 'SYNTRAX' },
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
          { '@type': 'ListItem', position: 3, name: 'Truck Fleets Filtration Systems', item: PAGE_URL },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${PAGE_URL}#fleet-applications`,
        name: 'Truck fleet applications',
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
      <PageHeader currentPage="Trucks Fleets" />

      <section style={hero}>
        <video autoPlay muted loop playsInline preload="auto" style={heroVideo}>
          <source src="/images/Trucks&Feel-1.mp4" type="video/mp4" />
        </video>
        <div style={heroShade} />
        <div style={heroInner}>
          <p style={eyebrow}>TRUCK FLEETS / ROUTE UPTIME</p>
          <h1 style={heroTitle}>Truck Fleets<br /><span style={yellow}>Filtration Systems</span></h1>
          <p style={heroPromise}>Protect the truck, standardize the fleet and keep service decisions tied to the route.</p>
          <p style={heroLead}>Filtration architecture for long-haul, regional, vocational and mixed commercial fleets across air intake, fuel, lubrication, cooling, compressed-air and cabin systems.</p>
          <div style={actions}>
            <Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>IDENTIFY MY FLEET PROTECTION PATH</Link>
            <a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a>
          </div>
        </div>
      </section>

      <section style={directSection} aria-labelledby="direct-title">
        <div style={contentWidth}>
          <p style={eyebrow}>DIRECT ANSWER</p>
          <h2 id="direct-title" style={directTitle}>What defines the correct truck-fleet filtration strategy?</h2>
          <p style={directText}>The correct strategy resolves the vehicle and engine, protected system, route and duty profile, contamination exposure, service plan and validated application evidence. A fleet should not standardize a filter only because a cross-reference looks plausible or because two trucks appear similar.</p>
        </div>
      </section>

      <section style={section} aria-labelledby="fleet-model-title">
        <div style={contentWidth}>
          <p style={eyebrow}>FLEET OPERATING MODEL</p>
          <h2 id="fleet-model-title" style={sectionTitle}>The route changes the filtration problem.</h2>
          <p style={wideText}>A highway tractor, regional delivery truck and vocational unit can share an engine family while experiencing very different dust, fuel, idle, thermal and service conditions.</p>
          <div style={profileGrid}>{fleetProfiles.map(([title, text]) => <article key={title} style={profileCard}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={equipmentSection} aria-labelledby="equipment-title">
        <div style={equipmentGrid}>
          <div style={equipmentCopy}>
            <p style={eyebrow}>FLEET APPLICATIONS</p>
            <h2 id="equipment-title" style={sectionTitle}>Build one maintenance language across different trucks.</h2>
            <p style={wideText}>Fleet consistency starts by identifying which assets can truly share a protection path and which require application-specific parts.</p>
            <div role="list" aria-label="Truck fleet applications" style={equipmentList}>{equipment.map((asset) => <div role="listitem" key={asset} style={equipmentRow}><span style={equipmentName}>{asset}</span></div>)}</div>
          </div>
          <div style={equipmentMedia}><img src="/images/trucks-1.avif" alt="Heavy-duty commercial trucks in fleet operation" style={equipmentImage} /></div>
        </div>
      </section>

      <section style={section} aria-labelledby="path-title">
        <div style={contentWidth}>
          <p style={eyebrow}>PROTECTION PATHWAYS</p>
          <h2 id="path-title" style={sectionTitle}>Map each fleet risk to the system that keeps the truck available.</h2>
          <p style={wideText}>The selection path should move from operating exposure to protected system, then to the appropriate ELIMFILTERS technology and finally to a validated filter.</p>
          <div className="industry-pathway-grid" style={pathwayGrid}>{protection.map(([source, detail, system, technology, href]) => <article key={system} style={pathwayCard}><div><span style={smallLabel}>OPERATING EXPOSURE</span><strong style={pathwaySource}>{source}</strong><p style={smallText}>{detail}</p></div><div style={pathwayDivider} /><div><span style={smallLabel}>PROTECTION SYSTEM</span><strong style={pathwaySystem}>{system}</strong></div><Link href={href} style={technologyLink}><span style={smallLabelYellow}>ELIMFILTERS TECHNOLOGY</span><strong style={technologyName}>{technology}</strong><span style={technologyCta}>EXPLORE →</span></Link></article>)}</div>
        </div>
      </section>

      <section style={principleSection}>
        <div style={principle}><span style={principleLabel}>FLEET ENGINEERING PRINCIPLE</span><p style={principleText}>Standardize only after the application is validated. The goal is fewer ambiguous parts across the fleet, not one part forced across incompatible configurations.</p></div>
      </section>

      <IndustryFilterCarousel dutyClass="HD" industryName="Trucks Fleets" />

      <section style={availabilitySection} aria-labelledby="availability-title">
        <div style={contentWidth}>
          <p style={eyebrow}>ROUTE AVAILABILITY</p>
          <h2 id="availability-title" style={sectionTitle}>Protect the maintenance plan before a filter decision becomes a route problem.</h2>
          <p style={wideText}>Fleet filtration affects more than component protection. It influences service consistency, parts readiness and how confidently maintenance teams can release a truck back to operation.</p>
          <div style={impactGrid}>{consequences.map(([title, text]) => <article key={title} style={impactCard}><h3 style={impactTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={section} aria-labelledby="decision-title">
        <div style={contentWidth}>
          <p style={eyebrow}>FROM FLEET UNIT TO PART</p>
          <h2 id="decision-title" style={sectionTitle}>Resolve the fleet application in five decisions.</h2>
          <div style={decisionGrid}>{[
            ['Vehicle + Engine', 'Identify the truck, engine and relevant configuration before treating two units as equivalent.'],
            ['Duty Profile', 'Define long-haul, regional, vocational or mixed use, including idle time, dust and route environment.'],
            ['Protected System', 'Resolve air intake, fuel, lubrication, cooling, compressed air, cabin air or vocational hydraulic protection.'],
            ['Fleet Standardization', 'Determine whether the validated application can be safely standardized across additional fleet units.'],
            ['Application Evidence', 'Confirm the final part using OEM/current reference, dimensions where needed and documented application evidence.'],
          ].map(([title, text]) => <article key={title} style={decisionCard}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={evidenceSection} aria-labelledby="evidence-title">
        <div style={contentWidth}>
          <p style={eyebrow}>APPLICATION EVIDENCE</p>
          <h2 id="evidence-title" style={sectionTitle}>Cross-reference is the start of identification, not the end.</h2>
          <p style={wideText}>Final fleet standardization should reconcile the known reference with the truck or engine context, protected system and application evidence. If the evidence does not support equivalence, the units should remain separate in the fleet parts plan.</p>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={contentWidth}>
          <p style={eyebrow}>TRUCK FLEET FILTRATION QUESTIONS</p>
          <h2 id="faq-title" style={sectionTitle}>What fleet, maintenance and procurement teams need to know.</h2>
          <div style={faqList}>{questions.map(([q, a]) => <article key={q} style={faqItem}><h3 style={faqQuestion}>{q}</h3><p style={faqAnswer}>{a}</p></article>)}</div>
        </div>
      </section>

      <section style={conversionSection}>
        <div style={conversionGrid}>
          <div><p style={eyebrow}>NEED TO STANDARDIZE OR RESOLVE A FLEET APPLICATION?</p><h2 style={conversionTitle}>Identify the protection path before adding the part to the fleet standard.</h2><p style={conversionText}>Send the truck or fleet unit, engine, protected system, duty profile and any known OEM or current filter reference.</p><Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>IDENTIFY MY FLEET PROTECTION PATH</Link></div>
          <div style={conversionSecondary}><div><p style={eyebrow}>ALREADY HAVE A PART NUMBER?</p><h3 style={conversionSubTitle}>Go directly to Part Search.</h3><a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a></div><div style={divider} /><div><p style={eyebrow}>SERVE COMMERCIAL FLEETS?</p><h3 style={conversionSubTitle}>Evaluate distributor fit.</h3><Link href="/distributor-application/" style={secondaryButton}>BECOME A DISTRIBUTOR</Link></div></div>
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
const heroShade: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(0,0,0,.94),rgba(0,0,0,.62) 55%,rgba(0,0,0,.18)),linear-gradient(0deg,rgba(0,0,0,.72),transparent 58%)' };
const heroInner: CSSProperties = { width: '100%', maxWidth: '1180px', margin: '0 auto', padding: 'clamp(7rem,12vw,10rem) clamp(1.25rem,5vw,4.5rem) clamp(4rem,7vw,6rem)', position: 'relative', zIndex: 2 };
const eyebrow: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.72rem', lineHeight: 1.2, letterSpacing: '.18em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 1rem' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-.055em', lineHeight: .88, fontSize: 'clamp(3.2rem,7.4vw,7rem)', textTransform: 'uppercase', margin: 0, maxWidth: '980px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,2vw,1.55rem)', lineHeight: 1.3, fontWeight: 700, maxWidth: '860px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem,1.45vw,1.18rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.78)', maxWidth: '900px', margin: '1rem 0 0' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '2rem' };
const primaryButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase' };
const secondaryButton: CSSProperties = { display: 'inline-block', background: 'transparent', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase', border: '1px solid rgba(255,241,45,.42)' };
const directSection: CSSProperties = { padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,6vw,6rem)', background: '#050505', borderBottom: '1px solid rgba(255,255,255,.08)' };
const contentWidth: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const directTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem,4vw,3.4rem)', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-.035em', margin: 0, maxWidth: '920px' };
const directText: CSSProperties = { fontSize: 'clamp(1.05rem,1.6vw,1.24rem)', lineHeight: 1.75, color: 'rgba(255,255,255,.82)', maxWidth: '980px', margin: '1.3rem 0 0' };
const section: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.2rem,4.7vw,4.2rem)', lineHeight: .96, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0, maxWidth: '960px' };
const bodyText: CSSProperties = { fontSize: '1rem', lineHeight: 1.72, color: 'rgba(255,255,255,.66)', margin: 0 };
const wideText: CSSProperties = { ...bodyText, maxWidth: '900px', marginTop: '1.3rem' };
const profileGrid: CSSProperties = { marginTop: '2.8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(240px,100%),1fr))', gap: '1rem' };
const profileCard: CSSProperties = { borderTop: '2px solid #FFF12D', background: '#050505', padding: '1.55rem', minHeight: '220px' };
const cardTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem,1.8vw,1.35rem)', lineHeight: 1.05, textTransform: 'uppercase', color: '#fff', margin: '0 0 .8rem' };
const equipmentSection: CSSProperties = { ...section, background: '#050505' };
const equipmentGrid: CSSProperties = { ...contentWidth, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(340px,100%),1fr))', gap: 'clamp(2.5rem,6vw,5rem)', alignItems: 'center' };
const equipmentCopy: CSSProperties = { minWidth: 0 };
const equipmentMedia: CSSProperties = { minWidth: 0 };
const equipmentImage: CSSProperties = { width: '100%', height: 'auto', objectFit: 'contain', display: 'block', border: '1px solid rgba(255,255,255,.08)' };
const equipmentList: CSSProperties = { marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,.14)' };
const equipmentRow: CSSProperties = { padding: '.95rem 0', borderBottom: '1px solid rgba(255,255,255,.14)' };
const equipmentName: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(.95rem,1.3vw,1.25rem)', lineHeight: 1.08, textTransform: 'uppercase', fontWeight: 700, color: '#fff', overflowWrap: 'break-word' };
const pathwayGrid: CSSProperties = { marginTop: '2.8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(280px,100%),1fr))', gap: '1rem' };
const pathwayCard: CSSProperties = { border: '1px solid rgba(255,255,255,.1)', background: '#050505', padding: '1.5rem', minHeight: '275px', display: 'grid', gap: '1rem' };
const smallLabel: CSSProperties = { fontFamily: displayFont, fontSize: '.58rem', letterSpacing: '.13em', color: 'rgba(255,255,255,.4)', fontWeight: 700, display: 'block', marginBottom: '.7rem' };
const smallLabelYellow: CSSProperties = { ...smallLabel, color: '#FFF12D' };
const pathwaySource: CSSProperties = { fontFamily: displayFont, fontSize: '1.1rem', color: '#fff', textTransform: 'uppercase' };
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
const availabilitySection: CSSProperties = { ...section, background: '#050505' };
const impactGrid: CSSProperties = { marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(300px,100%),1fr))', gap: '1rem' };
const impactCard: CSSProperties = { borderTop: '1px solid rgba(255,255,255,.15)', padding: '1.25rem 0', minHeight: '150px' };
const impactTitle: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '1.05rem', textTransform: 'uppercase', margin: '0 0 .65rem' };
const decisionGrid: CSSProperties = { marginTop: '2.6rem', display: 'flex', flexWrap: 'wrap', gap: '1px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.1)' };
const decisionCard: CSSProperties = { background: '#030303', minHeight: '220px', padding: '1.5rem', flex: '1 1 210px', minWidth: 0 };
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
const divider: CSSProperties = { height: '1px', background: 'rgba(255,255,255,.12)' };
