import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import { IndustryFilterCarousel } from './IndustryFilterCarousel';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/industries/construction/`;

const equipment = ['Excavators', 'Wheel Loaders', 'Bulldozers', 'Motor Graders', 'Compactors', 'Articulated Dump Trucks'] as const;

const jobsitePressures = [
  ['Abrasive Dust', 'Silica-rich dust, fine soil and demolition particulate can load air-intake systems quickly and challenge sealing integrity.'],
  ['Hydraulic Demand', 'Excavation, lifting, grading and steering depend on pumps, valves and actuators operating under pressure and repeated load changes.'],
  ['Fuel Handling', 'Mobile refueling, storage, transfer equipment and jobsite moisture can introduce particulate and water before fuel reaches sensitive engine interfaces.'],
  ['Start-Stop Duty', 'Frequent idle, restart, thermal cycling, vibration and short service windows change how contamination and maintenance interact.'],
] as const;

const protection = [
  ['SILICA + JOBSITE DUST', 'Airborne abrasive particulate', 'AIR INTAKE', 'MACROCORE™', '/technologies/macrocore/'],
  ['HYDRAULIC DEBRIS', 'Ingress + wear particles + service contamination', 'HYDRAULIC', 'NANOFORCE™', '/technologies/nanoforce/'],
  ['FUEL CONTAMINATION', 'Storage + transfer + moisture exposure', 'FUEL', 'HYDROCORE™', '/technologies/hydrocore/'],
  ['LUBE CONTAMINATION', 'Wear debris + soot + service ingress', 'LUBRICATION', 'SYNTRAX™', '/technologies/syntrax/'],
] as const;

const consequences = [
  ['Schedule Risk', 'A machine removed from service can affect crews, sequencing and the next dependent task on the jobsite.'],
  ['Hydraulic Response', 'Contamination can compromise the precision interfaces that control digging, lifting, grading and steering functions.'],
  ['Engine Protection', 'Air and fuel contamination can increase the burden on combustion-system protection during dusty, mobile operation.'],
  ['Service Predictability', 'Jobsite conditions should inform inspection and service decisions instead of relying on calendar intervals alone.'],
  ['Component Life', 'Contamination control helps protect pumps, valves, injectors, bearings and other high-value serviceable components.'],
  ['Fleet Availability', 'Consistent filtration discipline supports more predictable equipment availability across active projects.'],
] as const;

const questions = [
  ['Why is construction filtration different from normal road service?', 'Construction equipment operates in concentrated dust, vibration, hydraulic load, repeated start-stop cycles and changing jobsite conditions. Those factors increase contamination exposure and make service access less predictable, so filtration should be selected around the actual duty cycle rather than a generic maintenance interval.'],
  ['Which filtration systems are most important on excavators and loaders?', 'Air intake, hydraulic, fuel and lubrication systems are usually central to construction equipment protection. The priority depends on the machine, jobsite contamination, hydraulic sensitivity, fuel-handling conditions and service schedule.'],
  ['How does silica dust affect construction equipment?', 'Fine silica-rich dust can load the air-intake system and challenge sealing interfaces. If particulate bypasses the intended protection path, it can reach sensitive engine surfaces and contribute to abrasive wear. Restriction trend, sealing integrity and service practice should therefore be evaluated together.'],
  ['Why is hydraulic cleanliness critical on construction machinery?', 'Excavators, loaders, dozers and graders rely on high-pressure pumps, valves and actuators. Contamination can interfere with those precision interfaces, so hydraulic filtration should be matched to fluid cleanliness requirements, pressure, duty cycle and component sensitivity.'],
  ['How can construction fuel become contaminated on a jobsite?', 'Fuel can pick up particulate or water through storage tanks, transfer equipment, mobile refueling, tank breathing and condensation. The protection strategy should consider the complete handling path before fuel reaches the engine.'],
  ['Can ELIMFILTERS identify a construction filter from an OEM or part number?', 'Yes. If the OEM reference or current filter number is known, Part Search provides the fastest route to cross-reference and application information. For an engineering review, include the machine, engine, protected system and jobsite conditions.'],
] as const;

export function ConstructionIndustryPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#page`,
        url: PAGE_URL,
        name: 'Construction Filtration Systems',
        description: 'Construction filtration systems and contamination-control architecture for excavators, loaders, dozers, graders, compactors and articulated dump trucks operating in abrasive jobsite conditions.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Construction filtration systems' },
          { '@type': 'Thing', name: 'Construction equipment contamination control' },
          { '@type': 'Thing', name: 'Excavator filtration' },
          { '@type': 'Thing', name: 'Hydraulic cleanliness in construction equipment' },
          { '@type': 'Thing', name: 'Jobsite dust contamination' },
        ],
        breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: `${BASE_URL}/industries/` },
          { '@type': 'ListItem', position: 3, name: 'Construction', item: PAGE_URL },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${PAGE_URL}#equipment`,
        name: 'Construction equipment applications',
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
      <PageHeader currentPage="Construction" />

      <section style={hero}>
        <video autoPlay muted loop playsInline preload="auto" style={heroVideo}>
          <source src="/images/construction-2.mp4" type="video/mp4" />
        </video>
        <div style={heroShade} />
        <div style={heroInner}>
          <p style={eyebrow}>CONSTRUCTION / JOBSITE ASSET PROTECTION</p>
          <h1 style={heroTitle}>Construction Filtration<br /><span style={yellow}>Systems</span></h1>
          <p style={heroPromise}>Protect the machines that keep the project moving.</p>
          <p style={heroLead}>Air intake, hydraulic, fuel and lubrication contamination control for excavators, loaders, dozers, graders, compactors and articulated dump trucks operating in abrasive dust, vibration, heat and severe off-road duty.</p>
          <div style={actions}>
            <Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>PROTECT CONSTRUCTION EQUIPMENT</Link>
            <a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a>
          </div>
        </div>
      </section>

      <section style={section} aria-labelledby="jobsite-title">
        <div style={contentWidth}>
          <p style={eyebrow}>JOBSITE REALITY</p>
          <h2 id="jobsite-title" style={sectionTitle}>The contamination load changes with the work being done.</h2>
          <p style={wideText}>Construction equipment moves between excavation, loading, grading, demolition, compaction and haulage. The machine may stay on one project while the contamination mechanism and duty cycle change several times.</p>
          <div style={pressureGrid}>{jobsitePressures.map(([title, text]) => <article key={title} style={pressureCard}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={equipmentSection} aria-labelledby="equipment-title">
        <div style={equipmentGrid}>
          <div style={equipmentCopy}>
            <h2 id="equipment-title" style={sectionTitle}>Different machines. Different jobsite exposure.</h2>
            <p style={wideText}>An excavator, loader and grader can operate yards apart and still require different filtration priorities because their airflow, hydraulic load, duty cycle and service access are not the same.</p>
            <div role="list" aria-label="Construction equipment applications" style={equipmentList}>{equipment.map((asset) => <div role="listitem" key={asset} style={equipmentRow}><span style={equipmentName}>{asset}</span></div>)}</div>
          </div>
          <div style={equipmentMedia}><img src="/images/construccion.avif" alt="Construction equipment operating in severe jobsite conditions" style={equipmentImage} /></div>
        </div>
      </section>

      <section style={section} aria-labelledby="protection-title">
        <div style={contentWidth}>
          <p style={eyebrow}>CONTAMINATION PATHWAYS</p>
          <h2 id="protection-title" style={sectionTitle}>Connect the jobsite threat to the system that must stay protected.</h2>
          <p style={wideText}>Construction filtration should begin with the contamination source and protected interface, then resolve the appropriate system, technology and final part.</p>
          <div style={pathwayGrid}>{protection.map(([source, detail, system, technology, href]) => <article key={system} style={pathwayCard}><div><span style={smallLabel}>CONTAMINATION SOURCE</span><strong style={pathwaySource}>{source}</strong><p style={smallText}>{detail}</p></div><div style={pathwayDivider} /><div><span style={smallLabel}>PROTECTION SYSTEM</span><strong style={pathwaySystem}>{system}</strong></div><Link href={href} style={technologyLink}><span style={smallLabelYellow}>ELIMFILTERS TECHNOLOGY</span><strong style={technologyName}>{technology}</strong><span style={technologyCta}>EXPLORE →</span></Link></article>)}</div>
        </div>
      </section>

      <section style={principleSection}>
        <div style={principle}><span style={principleLabel}>CONSTRUCTION ENGINEERING PRINCIPLE</span><p style={principleText}>The correct filter is determined by the machine, jobsite contamination, protected system, component sensitivity, duty cycle and service reality—not by equipment category alone.</p></div>
      </section>

      <IndustryFilterCarousel dutyClass="HD" industryName="Construction" />

      <section style={impactSection} aria-labelledby="impact-title">
        <div style={contentWidth}>
          <p style={eyebrow}>PROJECT CONTINUITY</p>
          <h2 id="impact-title" style={sectionTitle}>Protect the operating chain before contamination reaches the schedule.</h2>
          <p style={wideText}>A filtration problem on one machine can become a production problem for the crew, the next task and the project sequence. Contamination control therefore supports more than component protection.</p>
          <div style={impactGrid}>{consequences.map(([title, text]) => <article key={title} style={impactCard}><h3 style={impactTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={section} aria-labelledby="decision-title">
        <div style={contentWidth}>
          <p style={eyebrow}>FROM JOBSITE TO PART</p>
          <h2 id="decision-title" style={sectionTitle}>Resolve the construction application in five decisions.</h2>
          <div style={decisionGrid}>{[
            ['Machine', 'Identify the excavator, loader, dozer, grader, compactor or haul unit.'],
            ['Jobsite', 'Define dust, demolition debris, moisture, fuel handling, heat and vibration exposure.'],
            ['Duty', 'Establish operating hours, hydraulic demand, start-stop pattern and service access.'],
            ['Protection', 'Match the contamination mechanism to air intake, hydraulic, fuel or lubrication protection.'],
            ['Part', 'Resolve the product through OEM reference, dimensions and validated application evidence.'],
          ].map(([title, text]) => <article key={title} style={decisionCard}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={contentWidth}>
          <p style={eyebrow}>CONSTRUCTION FILTRATION QUESTIONS</p>
          <h2 id="faq-title" style={sectionTitle}>What fleet and maintenance teams need to know.</h2>
          <div style={faqList}>{questions.map(([q, a]) => <article key={q} style={faqItem}><h3 style={faqQuestion}>{q}</h3><p style={faqAnswer}>{a}</p></article>)}</div>
        </div>
      </section>

      <section style={conversionSection}>
        <div style={conversionGrid}>
          <div><p style={eyebrow}>HAVE A MACHINE OR JOBSITE CONTAMINATION PROBLEM?</p><h2 style={conversionTitle}>Build the protection path around the machine and the work it is doing.</h2><p style={conversionText}>Send the machine, engine, protected system, jobsite conditions and any known OEM or filter reference.</p><Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>REQUEST APPLICATION SUPPORT</Link></div>
          <div style={conversionSecondary}><div><p style={eyebrow}>ALREADY HAVE A PART NUMBER?</p><h3 style={conversionSubTitle}>Go directly to Part Search.</h3><a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a></div><div style={divider} /><div><p style={eyebrow}>SERVE CONSTRUCTION CUSTOMERS?</p><h3 style={conversionSubTitle}>Evaluate distributor fit.</h3><Link href="/distributor-application/" style={secondaryButton}>BECOME A DISTRIBUTOR</Link></div></div>
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
const heroShade: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(0,0,0,.92),rgba(0,0,0,.58) 52%,rgba(0,0,0,.14)),linear-gradient(0deg,rgba(0,0,0,.68),transparent 58%)' };
const heroInner: CSSProperties = { width: '100%', maxWidth: '1180px', margin: '0 auto', padding: 'clamp(7rem,12vw,10rem) clamp(1.25rem,5vw,4.5rem) clamp(4rem,7vw,6rem)', position: 'relative', zIndex: 2 };
const eyebrow: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.72rem', lineHeight: 1.2, letterSpacing: '.18em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 1rem' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-.055em', lineHeight: .88, fontSize: 'clamp(3.3rem,7.6vw,7.2rem)', textTransform: 'uppercase', margin: 0, maxWidth: '920px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,2vw,1.55rem)', lineHeight: 1.3, fontWeight: 700, maxWidth: '760px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem,1.45vw,1.18rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.78)', maxWidth: '840px', margin: '1rem 0 0' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '2rem' };
const primaryButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase' };
const secondaryButton: CSSProperties = { display: 'inline-block', background: 'transparent', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase', border: '1px solid rgba(255,241,45,.42)' };
const section: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const contentWidth: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.2rem,4.7vw,4.2rem)', lineHeight: .96, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0, maxWidth: '920px' };
const bodyText: CSSProperties = { fontSize: '1rem', lineHeight: 1.72, color: 'rgba(255,255,255,.66)', margin: 0 };
const wideText: CSSProperties = { ...bodyText, maxWidth: '860px', marginTop: '1.3rem' };
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
const decisionCard: CSSProperties = { background: '#030303', minHeight: '200px', padding: '1.5rem' };
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
