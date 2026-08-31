import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import { IndustryFilterCarousel } from './IndustryFilterCarousel';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/industries/power-generation/`;

const equipment = [
  'Standby Generator Sets',
  'Prime Power Systems',
  'Emergency Power Systems',
  'Industrial Diesel Generators',
  'Remote Power Units',
  'Engine-Driven Generation Equipment',
] as const;

const readinessFactors = [
  ['Stored Fuel', 'Standby assets may sit for long periods while fuel is exposed to storage time, tank breathing, condensation and transfer contamination.'],
  ['Start Readiness', 'A generator can spend most of its life waiting, then be required to accept load immediately when utility power is unavailable.'],
  ['Thermal Control', 'Cooling-system condition becomes critical once the engine moves from standby to sustained load and heat rejection increases rapidly.'],
  ['Duty Transition', 'Prime-power and emergency sets can move between low utilization, testing and extended operation, changing filtration demand across the same asset.'],
] as const;

const protection = [
  ['FUEL + WATER', 'Stored fuel + tank breathing + condensation + transfer', 'FUEL / WATER SEPARATION', 'HYDROCORE™', '/technologies/hydrocore/'],
  ['AIRBORNE PARTICULATE', 'Ambient dust + enclosure ingress + engine air demand', 'AIR INTAKE', 'MACROCORE™', '/technologies/macrocore/'],
  ['LUBE CONTAMINATION', 'Wear debris + soot + oxidation byproducts + service ingress', 'LUBRICATION', 'SYNTRAX™', '/technologies/syntrax/'],
  ['COOLANT CONTAMINATION', 'Scale + corrosion debris + fluid degradation + service contamination', 'COOLING SYSTEM', 'THERMACORE™', '/technologies/thermacore/'],
] as const;

const consequences = [
  ['Starting Reliability', 'Fuel, air and lubrication condition influence whether the engine can transition from standby to stable operation when demanded.'],
  ['Load Acceptance', 'A generator must move from start-up into electrical load without contamination-related restrictions compromising protected engine systems.'],
  ['Fuel-System Integrity', 'Stored-fuel contamination can reach pumps and injectors before an emergency event exposes the weakness.'],
  ['Thermal Stability', 'Cooling-system cleanliness supports controlled heat rejection during sustained generator load.'],
  ['Maintenance Readiness', 'Inspection and service decisions should be completed before an outage turns maintenance access into an operating constraint.'],
  ['Power Availability', 'The filtration strategy supports the larger requirement: keeping the generating asset ready to deliver power when the facility depends on it.'],
] as const;

const questions = [
  ['What filtration systems are most important on generator sets?', 'Fuel and water separation, air intake, lubrication and cooling-system protection are common priorities on diesel generator sets. The correct priority depends on whether the unit is standby or prime power, fuel-storage conditions, environment, engine configuration, duty profile and maintenance access.'],
  ['Why is standby generator filtration different from continuously operated equipment?', 'A standby generator can remain idle for long periods while fuel, fluids, seals and environmental exposure continue to change. When called, the asset may have to start and accept load immediately. Filtration and maintenance planning should therefore account for stored-fluid condition and readiness, not only running hours.'],
  ['How can stored generator fuel become contaminated?', 'Fuel can acquire particulate or water through bulk storage, tank breathing, condensation, transfer equipment, maintenance activity and extended storage. The protection strategy should consider the complete fuel path before fuel reaches sensitive pumps and injectors.'],
  ['Why does cooling-system protection matter in power generation?', 'Generator engines can move rapidly from standby to sustained thermal load. Cooling-system contamination, scale, corrosion debris or degraded fluid condition can interfere with heat transfer and system stability, so coolant protection should be treated as part of asset readiness.'],
  ['Should generator filters be selected only by operating hours?', 'No. Running hours do not capture stored-fuel condition, calendar aging, environmental dust, fluid degradation, standby duration, testing frequency or the consequences of an emergency start. Selection and service planning should reflect the actual duty profile.'],
  ['What information is needed to identify the correct generator filter?', 'Use the generator-set or engine model, protected system, standby or prime-power duty, fuel-storage conditions, environment, OEM or existing part reference, dimensions when available and validated application evidence.'],
  ['Can ELIMFILTERS identify a generator filter from an OEM or part number?', 'Yes. If an OEM reference or current filter number is known, Part Search provides the fastest route to cross-reference and application information. For an engineering review, include the generator set, engine, protected system and operating duty.'],
] as const;

export function PowerGenerationIndustryPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#page`,
        url: PAGE_URL,
        name: 'Power Generation Filtration Systems',
        description: 'Power generation filtration systems for standby generators, prime-power systems and industrial diesel generator sets requiring fuel, air, lubrication and cooling-system protection.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Power generation filtration systems' },
          { '@type': 'Thing', name: 'Standby generator filtration' },
          { '@type': 'Thing', name: 'Prime power filtration' },
          { '@type': 'Thing', name: 'Stored fuel contamination' },
          { '@type': 'Thing', name: 'Generator cooling system protection' },
          { '@type': 'Thing', name: 'Emergency power readiness' },
        ],
        mentions: [
          { '@type': 'Thing', name: 'Fuel filtration and water separation' },
          { '@type': 'Thing', name: 'Air intake filtration' },
          { '@type': 'Thing', name: 'Lubrication filtration' },
          { '@type': 'Thing', name: 'Coolant filtration' },
          { '@type': 'Thing', name: 'HYDROCORE' },
          { '@type': 'Thing', name: 'MACROCORE' },
          { '@type': 'Thing', name: 'SYNTRAX' },
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
          { '@type': 'ListItem', position: 3, name: 'Power Generation Filtration Systems', item: PAGE_URL },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${PAGE_URL}#equipment`,
        name: 'Power generation equipment applications',
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
      <PageHeader currentPage="Power Generation" />

      <section style={hero}>
        <video autoPlay muted loop playsInline preload="auto" style={heroVideo}>
          <source src="/images/powergenerator-Video-1.mp4" type="video/mp4" />
        </video>
        <div style={heroShade} />
        <div style={heroInner}>
          <p style={eyebrow}>POWER GENERATION / READINESS PROTECTION</p>
          <h1 style={heroTitle}>Power Generation Filtration<br /><span style={yellow}>Systems</span></h1>
          <p style={heroPromise}>Protect the generator before the facility has to depend on it.</p>
          <p style={heroLead}>Fuel, air, lubrication and cooling-system contamination control for standby generators, prime-power systems and industrial engine-driven generation equipment operating across stored readiness, testing and sustained load.</p>
          <div style={actions}>
            <Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>IDENTIFY MY GENERATOR PROTECTION PATH</Link>
            <a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a>
          </div>
        </div>
      </section>

      <section style={directSection} aria-labelledby="power-direct-title">
        <div style={contentWidth}>
          <p style={eyebrow}>DIRECT ANSWER</p>
          <h2 id="power-direct-title" style={directTitle}>What defines the correct power-generation filtration strategy?</h2>
          <p style={directText}>Power-generation filtration starts with the generator set and its readiness requirement, then resolves stored-fuel condition, protected system, standby or prime-power duty, environmental exposure, maintenance access and validated application evidence. A filter should not be selected from running hours or generator category alone.</p>
        </div>
      </section>

      <section style={readinessSection} aria-labelledby="readiness-title">
        <div style={contentWidth}>
          <p style={eyebrow}>READINESS BEFORE RUNTIME</p>
          <h2 id="readiness-title" style={sectionTitle}>A standby generator can develop risk while it is not running.</h2>
          <p style={wideText}>Power-generation protection is unusual because the critical event may happen after long periods of low utilization. Stored fluids, environmental exposure and maintenance condition continue to matter while the hour meter barely moves.</p>
          <div style={readinessGrid}>{readinessFactors.map(([title, text]) => <article key={title} style={readinessCard}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={equipmentSection} aria-labelledby="equipment-title">
        <div style={equipmentGrid}>
          <div style={equipmentCopy}>
            <h2 id="equipment-title" style={sectionTitle}>Different power roles. Different readiness demands.</h2>
            <p style={wideText}>A hospital standby set, a remote prime-power unit and an industrial emergency generator may share similar engines while operating under very different fuel-storage, testing, loading and maintenance conditions.</p>
            <div role="list" aria-label="Power generation equipment applications" style={equipmentList}>{equipment.map((asset) => <div role="listitem" key={asset} style={equipmentRow}><span style={equipmentName}>{asset}</span></div>)}</div>
          </div>
          <div style={equipmentMedia}><img src="/images/power-generator.avif" alt="Industrial generator set used for standby and prime power applications" style={equipmentImage} /></div>
        </div>
      </section>

      <section style={section} aria-labelledby="path-title">
        <div style={contentWidth}>
          <p style={eyebrow}>READINESS PATHWAYS</p>
          <h2 id="path-title" style={sectionTitle}>Connect the failure source to the system that must respond on demand.</h2>
          <p style={wideText}>Selection should move from contamination source to protected system, then to the appropriate ELIMFILTERS technology and finally to a validated part.</p>
          <div style={pathwayGrid}>{protection.map(([source, detail, system, technology, href]) => <article key={system} style={pathwayCard}><div><span style={smallLabel}>CONTAMINATION SOURCE</span><strong style={pathwaySource}>{source}</strong><p style={smallText}>{detail}</p></div><div style={pathwayDivider} /><div><span style={smallLabel}>PROTECTION SYSTEM</span><strong style={pathwaySystem}>{system}</strong></div><Link href={href} style={technologyLink}><span style={smallLabelYellow}>ELIMFILTERS TECHNOLOGY</span><strong style={technologyName}>{technology}</strong><span style={technologyCta}>EXPLORE →</span></Link></article>)}</div>
        </div>
      </section>

      <section style={principleSection}>
        <div style={principle}><span style={principleLabel}>POWER GENERATION ENGINEERING PRINCIPLE</span><p style={principleText}>A generator filter decision must resolve readiness duty, stored-fluid condition, protected system, environmental exposure and application evidence before the product number is accepted.</p></div>
      </section>

      <IndustryFilterCarousel dutyClass="HD" industryName="Power Generation" />

      <section style={impactSection} aria-labelledby="impact-title">
        <div style={contentWidth}>
          <p style={eyebrow}>POWER AVAILABILITY</p>
          <h2 id="impact-title" style={sectionTitle}>The filtration consequence is measured when the generator is called.</h2>
          <p style={wideText}>For standby and emergency systems, the relevant question is not only whether the engine can run. It is whether the complete generating asset is ready to start, stabilize and carry the required duty when the site loses normal power.</p>
          <div style={impactGrid}>{consequences.map(([title, text]) => <article key={title} style={impactCard}><h3 style={impactTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={section} aria-labelledby="decision-title">
        <div style={contentWidth}>
          <p style={eyebrow}>FROM READINESS CONDITION TO PART</p>
          <h2 id="decision-title" style={sectionTitle}>Resolve the generator application in five decisions.</h2>
          <div style={decisionGrid}>{[
            ['Generator / Engine', 'Identify the generator set, engine family and protected subsystem.'],
            ['Readiness Duty', 'Define standby, emergency, prime-power or continuous operating responsibility.'],
            ['Stored Condition', 'Assess fuel storage, fluid age, environment, testing frequency and contamination exposure.'],
            ['Protection', 'Match the contamination mechanism to fuel, air intake, lubrication or cooling-system protection.'],
            ['Application Evidence', 'Validate the final filter using OEM reference, dimensions and documented application evidence.'],
          ].map(([title, text]) => <article key={title} style={decisionCard}><h3 style={cardTitle}>{title}</h3><p style={bodyText}>{text}</p></article>)}</div>
        </div>
      </section>

      <section style={evidenceSection} aria-labelledby="evidence-title">
        <div style={contentWidth}>
          <p style={eyebrow}>APPLICATION EVIDENCE</p>
          <h2 id="evidence-title" style={sectionTitle}>A generator cross-reference still has to match the actual set and duty.</h2>
          <p style={wideText}>Final identification should reconcile the known reference, generator-set or engine context, dimensions, protected system and operating responsibility. Where evidence is incomplete, the application should remain under review rather than be treated as confirmed.</p>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={contentWidth}>
          <p style={eyebrow}>POWER GENERATION FILTRATION QUESTIONS</p>
          <h2 id="faq-title" style={sectionTitle}>What facility, reliability and maintenance teams need to know.</h2>
          <div style={faqList}>{questions.map(([q, a]) => <article key={q} style={faqItem}><h3 style={faqQuestion}>{q}</h3><p style={faqAnswer}>{a}</p></article>)}</div>
        </div>
      </section>

      <section style={conversionSection}>
        <div style={conversionGrid}>
          <div><p style={eyebrow}>HAVE A GENERATOR OR READINESS PROBLEM?</p><h2 style={conversionTitle}>Identify the protection path before the next outage tests the asset.</h2><p style={conversionText}>Send the generator set or engine, protected system, standby or prime-power duty, fuel-storage conditions and any known OEM or filter reference.</p><Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>IDENTIFY MY GENERATOR PROTECTION PATH</Link></div>
          <div style={conversionSecondary}><div><p style={eyebrow}>ALREADY HAVE A PART NUMBER?</p><h3 style={conversionSubTitle}>Go directly to Part Search.</h3><a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>FIND MY FILTER</a></div><div style={divider} /><div><p style={eyebrow}>SERVE POWER-GENERATION CUSTOMERS?</p><h3 style={conversionSubTitle}>Evaluate distributor fit.</h3><Link href="/distributor-application/" style={secondaryButton}>BECOME A DISTRIBUTOR</Link></div></div>
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
const heroShade: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(0,0,0,.93),rgba(0,0,0,.6) 52%,rgba(0,0,0,.14)),linear-gradient(0deg,rgba(0,0,0,.72),transparent 58%)' };
const heroInner: CSSProperties = { width: '100%', maxWidth: '1180px', margin: '0 auto', padding: 'clamp(7rem,12vw,10rem) clamp(1.25rem,5vw,4.5rem) clamp(4rem,7vw,6rem)', position: 'relative', zIndex: 2 };
const eyebrow: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.72rem', lineHeight: 1.2, letterSpacing: '.18em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 1rem' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-.055em', lineHeight: .88, fontSize: 'clamp(3.1rem,7.2vw,6.9rem)', textTransform: 'uppercase', margin: 0, maxWidth: '1020px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,2vw,1.55rem)', lineHeight: 1.3, fontWeight: 700, maxWidth: '820px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem,1.45vw,1.18rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.78)', maxWidth: '900px', margin: '1rem 0 0' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '2rem' };
const primaryButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase' };
const secondaryButton: CSSProperties = { display: 'inline-block', background: 'transparent', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase', border: '1px solid rgba(255,241,45,.42)' };
const directSection: CSSProperties = { padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,6vw,6rem)', background: '#050505', borderBottom: '1px solid rgba(255,255,255,.08)' };
const contentWidth: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const directTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem,4vw,3.4rem)', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-.035em', margin: 0, maxWidth: '940px' };
const directText: CSSProperties = { fontSize: 'clamp(1.05rem,1.6vw,1.24rem)', lineHeight: 1.75, color: 'rgba(255,255,255,.82)', maxWidth: '980px', margin: '1.3rem 0 0' };
const section: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const readinessSection: CSSProperties = { ...section, background: 'radial-gradient(circle at 85% 0%,rgba(255,241,45,.055),transparent 30%),#030303' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.2rem,4.7vw,4.2rem)', lineHeight: .96, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0, maxWidth: '930px' };
const bodyText: CSSProperties = { fontSize: '1rem', lineHeight: 1.72, color: 'rgba(255,255,255,.66)', margin: 0 };
const wideText: CSSProperties = { ...bodyText, maxWidth: '890px', marginTop: '1.3rem' };
const readinessGrid: CSSProperties = { marginTop: '2.8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(240px,100%),1fr))', gap: '1px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.1)' };
const readinessCard: CSSProperties = { background: '#050505', padding: '1.55rem', minHeight: '220px' };
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
