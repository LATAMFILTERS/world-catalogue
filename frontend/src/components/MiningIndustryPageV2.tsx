import Link from '@/components/LocalizedLink';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import { IndustryFilterCarousel } from './IndustryFilterCarousel';
import { VIDEO_HERO_TREATMENT } from '@/lib/hero-media';
import { miningText } from '@/lib/mining-i18n';
import type { PageLang } from '@/lib/localized-routes';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/industries/mining/`;

const equipment = [
  'Haul Trucks',
  'Hydraulic Excavators',
  'Wheel Loaders',
  'Rotary Drill Rigs',
  'Dozers',
  'Crushers & Processing',
  'Support Equipment',
] as const;

const risks = [
  ['Abrasive Dust', 'Open-pit and underground operations continuously expose air-intake systems to fine mineral dust. Loading rate, particle size and service conditions determine how quickly restriction and contamination risk develop.'],
  ['Hydraulic Contamination', 'Excavation, loading, drilling and haulage depend on high-pressure hydraulic systems. Ingress, wear debris and service practices can compromise pumps, valves, actuators and precision control surfaces.'],
  ['Fuel Handling', 'Bulk storage, transfer, field refueling and moisture exposure can introduce particulate and water contamination before fuel reaches sensitive engine interfaces.'],
  ['Extended Duty', 'Long operating hours, vibration, thermal load and production pressure make filtration capacity, service discipline and maintenance access part of the protection decision.'],
] as const;

const protection = [
  ['ABRASIVE DUST', 'Airborne mineral particulate', 'Engine wear risk', 'AIR INTAKE', 'MACROCORE™', '/technologies/macrocore/', 'Engine air path'],
  ['HYDRAULIC DEBRIS', 'Ingress + internal wear particles', 'Pump, valve & actuator sensitivity', 'HYDRAULIC', 'NANOFORCE™', '/technologies/nanoforce/', 'Hydraulic circuit'],
  ['FUEL CONTAMINATION', 'Bulk storage + transfer + moisture', 'Injection-system exposure', 'FUEL', 'HYDROCORE™', '/technologies/hydrocore/', 'Fuel system'],
  ['LUBE CONTAMINATION', 'Wear debris + service ingress', 'Bearing & lubricated-interface wear', 'LUBRICATION', 'SYNTRAX™', '/technologies/syntrax/', 'Lubrication circuit'],
] as const;

const stakes = [
  ['Component Wear', 'Limit abrasive contamination at bearings, pumps, valves and other precision interfaces.'],
  ['Airflow & Restriction', 'Manage particulate loading before rising restriction changes airflow or service demand.'],
  ['Hydraulic Reliability', 'Protect pumps, valves, actuators and control surfaces around the required fluid cleanliness.'],
  ['Fuel-System Integrity', 'Control particulate and water contamination across storage, transfer and field refueling.'],
  ['Thermal Control', 'Keep contamination from becoming an additional burden on cooling surfaces and heat rejection.'],
  ['Equipment Availability', 'Reduce avoidable contamination events that can remove productive assets from service.'],
] as const;

const valueHierarchy = [
  ['Long-life asset structures', 'Frames, housings, major castings and structural assemblies intended to remain with the machine for long periods.'],
  ['High-value serviceable components', 'Turbochargers, injectors, pumps, valves, transmissions, final drives and other assemblies with significant service consequence.'],
  ['Consumable protection elements', 'Filters, seals and service fluids replaced through the lifecycle to control contamination before it reaches sensitive interfaces.'],
] as const;

const lifecycle = [
  'Contamination ingress',
  'Wear / restriction / thermal load',
  'Component degradation',
  'Unplanned intervention',
  'Lower equipment availability',
  'Higher lifecycle cost',
] as const;

const questions = [
  ['What filtration systems are most critical on mining equipment?', 'The priority depends on the machine and duty cycle, but mining equipment commonly requires coordinated protection across air intake, hydraulic, fuel and lubrication systems. Each system faces a different contamination mechanism, so selection should be based on the protected asset and operating conditions rather than the industry label alone.'],
  ['How does abrasive dust affect mining engines?', 'Abrasive mineral dust increases loading on the air-intake system. If contamination reaches protected engine interfaces, it can contribute to wear and loss of performance. Air-cleaner capacity, restriction growth, sealing integrity and service practice therefore matter together.'],
  ['What failure mechanisms can mining dust create?', 'Dust can contribute to abrasive wear, rising restriction, impaired heat rejection and interference with sensors or exposed control components. The dominant mechanism depends on where contamination enters, which system carries it and which interface is vulnerable.'],
  ['Why is hydraulic cleanliness important in excavators and haul trucks?', 'Mining hydraulic systems rely on pumps, valves, actuators and control surfaces operating under high load. Contamination can interfere with those precision interfaces, so hydraulic filtration must be selected around fluid cleanliness requirements, system sensitivity, operating pressure and service conditions.'],
  ['How can fuel become contaminated before it reaches the machine?', 'Contamination can enter through bulk storage, transport, transfer equipment, field refueling, tank breathing and moisture exposure. For mining operations, fuel protection should therefore consider the complete handling path rather than only the final filter installed on the equipment.'],
  ['How does filtration affect total cost of ownership in mining?', 'Filtration affects more than consumable cost. Contamination control influences component wear, service frequency, maintenance predictability and equipment availability. The relevant economic question is therefore what high-value component and operating consequence the filtration strategy is protecting.'],
  ['Does the same filtration strategy apply to open-pit and underground mining?', 'No. The equipment may share filter categories, but dust loading, ventilation, moisture, temperature, duty cycle, access and maintenance conditions can differ substantially. Those variables change the protection architecture and service strategy.'],
  ['Can ELIMFILTERS identify a mining filter from an OEM or part number?', 'Yes. If the OEM reference or current filter number is known, Part Search provides the fastest path to cross-reference and application information. For an engineering review, the machine, protected system and operating environment should also be provided.'],
] as const;

export function MiningIndustryPageV2({ lang = 'en' }: { lang?: PageLang }) {
  const pageUrl = `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/industries/mining/`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: lang === 'es' ? 'Sistemas de filtración minera' : lang === 'pt' ? 'Sistemas de filtração para mineração' : 'Mining Filtration Systems',
        inLanguage: lang === 'pt' ? 'pt-BR' : lang,
        description: 'Mining filtration systems and contamination-control architecture for haul trucks, excavators, loaders, drills and severe-duty mining equipment.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Mining filtration systems' },
          { '@type': 'Thing', name: 'Mining equipment contamination control' },
          { '@type': 'Thing', name: 'Mining asset protection' },
          { '@type': 'Thing', name: 'Mining equipment availability' },
          { '@type': 'Thing', name: 'Mining equipment total cost of ownership' },
          { '@type': 'Thing', name: 'Mining dust failure mechanisms' },
        ],
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: `${BASE_URL}/industries/` },
          { '@type': 'ListItem', position: 3, name: 'Mining', item: pageUrl },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#equipment`,
        name: lang === 'es' ? 'Equipos mineros protegidos por ELIMFILTERS' : lang === 'pt' ? 'Equipamentos de mineração protegidos pela ELIMFILTERS' : 'Mining equipment protected by ELIMFILTERS',
        itemListElement: equipment.map((name, index) => ({ '@type': 'ListItem', position: index + 1, name: miningText(lang, name) })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: questions.map(([q, a]) => ({ '@type': 'Question', name: miningText(lang, q), acceptedAnswer: { '@type': 'Answer', text: miningText(lang, a) } })),
      },
    ],
  };

  return (
    <main id="main-content" className="mining-industry-page" style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHeader currentPage="Mining" />

      <section style={hero}>
        <video autoPlay muted loop playsInline preload="auto" style={heroVideo}>
          <source src="/images/Mina-Video-1.mp4" type="video/mp4" />
        </video>
        <div style={heroShade} />
        <div style={heroInner} className="miningHeroContainer">
          <p style={eyebrow}>{miningText(lang, "MINING / SEVERE-DUTY FILTRATION")}</p>
          <h1 style={heroTitle}>{miningText(lang, "Mining Filtration")}<br /><span style={yellowText}>{miningText(lang, "Systems")}</span></h1>
          <div className="miningHeroLower">
            <div className="miningHeroCopy">
              <p style={heroPromise} className="miningHeroPromise">{miningText(lang, "Asset protection for equipment that cannot stop when contamination gets aggressive.")}</p>
              <p style={heroLead}>{miningText(lang, "Air intake, fuel, lubrication and hydraulic contamination control for haul trucks, excavators, loaders, drills and support equipment operating in open-pit and underground mining environments.")}</p>
              <p style={heroContext}>{miningText(lang, "Operating reality: abrasive dust, heavy load, extended duty cycles and constrained service windows.")}</p>
            </div>
            <div style={actions} className="miningHeroActions">
              <Link href="/contact/" style={primaryButton} data-conversion-action="application-support">{miningText(lang, "PROTECT MINING EQUIPMENT")}</Link>
              <a href="https://part-search.elimfilters.com/" style={secondaryButton} data-conversion-action="product-intelligence">{miningText(lang, "FIND MY FILTER")}</a>
            </div>
          </div>
        </div>
      </section>

      <section style={section} aria-labelledby="mining-why-title">
        <div style={splitHeader} className="miningSplitHeader">
          <div><p style={eyebrow}>{miningText(lang, "WHY MINING CHANGES FILTRATION")}</p><h2 id="mining-why-title" style={sectionTitle}>{miningText(lang, "Four forces shape the protection strategy.")}</h2></div>
          <div><p style={leadText}>{miningText(lang, "A mining machine combines abrasive airborne contamination, high hydraulic demand, field fuel handling and extended duty cycles.")}</p><p style={bodyText}>{miningText(lang, "The operating environment establishes the context; component sensitivity, contamination mechanism, service interval and maintenance reality complete the decision.")}</p></div>
        </div>
        <div style={riskGrid} className="miningRiskGrid">{risks.map(([title, text]) => <article key={title} style={riskCard} className="miningRiskCard"><h3 style={cardTitle}>{miningText(lang, title)}</h3><p style={bodyText}>{miningText(lang, text)}</p></article>)}</div>
      </section>

      <section style={equipmentSection} aria-labelledby="equipment-title">
        <div style={equipmentGrid} className="miningEquipmentGrid">
          <div style={equipmentCopy}>
            <h2 id="equipment-title" style={sectionTitle}>{miningText(lang, "Different assets. Different contamination exposure.")}</h2>
            <p style={equipmentLead}>{miningText(lang, "The same mine can place completely different demands on a haul truck, excavator, drill rig and processing asset. Equipment type narrows the protection problem before a product number is considered.")}</p>
            <div style={equipmentList} role="list" aria-label="Mining equipment applications">
              {equipment.map((asset) => <div key={miningText(lang, asset)} style={equipmentRow} role="listitem"><span style={equipmentName}>{miningText(lang, asset)}</span></div>)}
            </div>
          </div>
          <div style={equipmentMedia}><img src="/images/mineria.avif" alt="Mining equipment operating in a severe-duty environment" style={equipmentImage} /></div>
        </div>
      </section>

      <section style={section} aria-labelledby="pathway-title">
        <div style={wideHeader} className="miningWideHeader"><p style={eyebrow}>{miningText(lang, "CONTAMINATION PATHWAYS")}</p><h2 id="pathway-title" style={sectionTitle}>{miningText(lang, "See the threat first. Then engineer the protection.")}</h2><p style={bodyWide}>{miningText(lang, "Mining contamination begins in the operating environment. Each pathway connects a contamination source to the system at risk and then to the ELIMFILTERS technology engineered for that protection need.")}</p></div>
        <div style={pathwayFlow} className="miningPathwayFlow">
          {protection.map(([source, pathway, risk, system, technology, href, target]) => (
            <article key={system} style={pathwayRow} className="miningPathwayRow">
              <div style={pathwayCell}><span style={stageLabel}>{miningText(lang, "CONTAMINATION SOURCE")}</span><strong style={pathwayTitle}>{miningText(lang, source)}</strong><p style={smallText}>{miningText(lang, pathway)}</p></div>
              <div style={pathwayCell}><span style={stageLabel}>{miningText(lang, "WHAT IT THREATENS")}</span><strong style={pathwayTitle}>{miningText(lang, risk)}</strong><p style={smallText}>{miningText(lang, target)}</p></div>
              <div style={pathwayCell}><span style={stageLabel}>{miningText(lang, "PROTECTION SYSTEM")}</span><strong style={pathwayTitle}>{miningText(lang, system)}</strong></div>
              <Link href={href} style={technologyCell} className="miningTechnologyCell"><span style={technologyLabel}>{miningText(lang, "ELIMFILTERS TECHNOLOGY")}</span><strong style={technologyName}>{technology}</strong><span style={technologyCta}>{miningText(lang, "EXPLORE TECHNOLOGY →")}</span></Link>
            </article>
          ))}
        </div>
        <div style={principle}><span style={principleLabel}>{miningText(lang, "MINING ENGINEERING PRINCIPLE")}</span><p style={principleText}>{miningText(lang, "The correct filtration strategy is not determined by machine type alone. Dust loading, fluid cleanliness requirements, fuel handling, duty cycle, service interval and component sensitivity determine the protection architecture.")}</p></div>
      </section>

      <IndustryFilterCarousel dutyClass="HD" industryName="Mining" lang={lang} />

      <section style={stakesSection} aria-labelledby="stakes-title">
        <div style={wideHeader} className="miningWideHeader"><p style={eyebrow}>{miningText(lang, "WHAT CONTAMINATION PUTS AT RISK")}</p><h2 id="stakes-title" style={sectionTitle}>{miningText(lang, "Protect the operating chain before contamination becomes downtime.")}</h2><p style={bodyWide}>{miningText(lang, "In mining, contamination can affect airflow, hydraulic cleanliness, fuel-system integrity, thermal control and overall equipment availability across the operating chain.")}</p></div>
        <div style={stakesGrid} className="miningStakesGrid">{stakes.map(([title, text]) => <article key={title} style={stakeCard}><h3 style={stakeTitle}>{miningText(lang, title)}</h3><p style={stakeText}>{miningText(lang, text)}</p></article>)}</div>
      </section>

      <section style={tcoSection} aria-labelledby="mining-tco-title">
        <div style={wideHeader} className="miningWideHeader"><p style={eyebrow}>{miningText(lang, "AVAILABILITY & TOTAL COST OF OWNERSHIP")}</p><h2 id="mining-tco-title" style={sectionTitle}>{miningText(lang, "The filter is inexpensive. The component it protects is not.")}</h2><p style={bodyWide}>{miningText(lang, "Mining filtration should be judged against component sensitivity, maintenance consequence and equipment availability—not filter price alone.")}</p></div>
        <p style={tcoLead}>{miningText(lang, "A practical protection hierarchy separates long-life asset structures, high-value serviceable components and consumable protection elements. The categories show why a relatively low-cost filtration element can matter to much higher-value interfaces.")}</p>
        <div style={valueGrid} className="miningValueGrid">{valueHierarchy.map(([title, text]) => <article key={title} style={valueCard}><h3 style={valueTitle}>{miningText(lang, title)}</h3><p style={valueText}>{miningText(lang, text)}</p></article>)}</div>
        <div style={lifecycleGrid} className="miningLifecycleGrid" aria-label="Contamination to lifecycle cost pathway">{lifecycle.map((item) => <div key={item} style={lifecycleItem}>{miningText(lang, item)}</div>)}</div>
        <Link href="/knowledge-center/engineering/mining-contamination-tco/" style={textLink}>{miningText(lang, "READ THE ENGINEERING GUIDE →")}</Link>
      </section>

      <section style={section} aria-labelledby="decision-title">
        <div style={wideHeader} className="miningWideHeader"><p style={eyebrow}>{miningText(lang, "FROM MACHINE TO PROTECTION")}</p><h2 id="decision-title" style={sectionTitle}>{miningText(lang, "The mining filtration decision in five steps.")}</h2></div>
        <div style={decisionGrid} className="miningDecisionGrid">{[
          ['Machine', 'Identify the asset, engine and critical systems.'],
          ['Exposure', 'Define dust, water, fuel, debris and environmental contamination.'],
          ['Duty', 'Establish load, operating hours, service access and maintenance interval.'],
          ['Protection', 'Connect each contamination mechanism to the correct filtration system and technology.'],
          ['Part', 'Resolve the final product through OEM reference, dimensions and application evidence.'],
        ].map(([title, text]) => <article key={title} style={decisionCard}><h3 style={cardTitle}>{miningText(lang, title)}</h3><p style={bodyText}>{miningText(lang, text)}</p></article>)}</div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={wideHeader} className="miningWideHeader"><p style={eyebrow}>{miningText(lang, "MINING FILTRATION QUESTIONS")}</p><h2 id="faq-title" style={sectionTitle}>{miningText(lang, "What mining operators and maintenance teams need to know.")}</h2></div>
        <div style={faqList} className="miningFaqGrid">{questions.map(([q, a]) => <article key={q} style={faqItem} className="miningFaqItem"><h3 style={faqQuestion}>{miningText(lang, q)}</h3><p style={faqAnswer}>{miningText(lang, a)}</p></article>)}</div>
      </section>

      <section style={conversionSection}>
        <div style={conversionGrid} className="miningConversionGrid">
          <div style={conversionPrimary}><p style={eyebrow}>{miningText(lang, "HAVE A MACHINE OR CONTAMINATION PROBLEM?")}</p><h2 style={conversionTitle}>{miningText(lang, "Protect mining equipment around the way it actually operates.")}</h2><p style={conversionText}>{miningText(lang, "Send the machine, engine, protected system, operating environment and any known OEM or filter reference. We will route the request through the correct protection path.")}</p><Link href="/contact/" style={primaryButton} data-conversion-action="application-support">{miningText(lang, "PROTECT MINING EQUIPMENT")}</Link></div>
          <div style={conversionSecondary}><div><p style={eyebrow}>{miningText(lang, "ALREADY HAVE A PART NUMBER?")}</p><h3 style={conversionSubTitle}>{miningText(lang, "Go directly to Part Search.")}</h3><a href="https://part-search.elimfilters.com/" style={secondaryButton} data-conversion-action="product-intelligence">{miningText(lang, "FIND MY FILTER")}</a></div><div style={divider} /><div><p style={eyebrow}>{miningText(lang, "SERVE MINING CUSTOMERS?")}</p><h3 style={conversionSubTitle}>{miningText(lang, "Evaluate distributor fit.")}</h3><Link href="/distributor-application/" style={secondaryButton}>{miningText(lang, "BECOME A DISTRIBUTOR")}</Link></div></div>
        </div>
      </section>
    </main>
  );
}

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';
const yellowText: CSSProperties = { color: '#FFF12D' };
const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont, overflowX: 'hidden' };
const hero: CSSProperties = { minHeight: '82vh', background: '#000', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const heroVideo: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: VIDEO_HERO_TREATMENT.opacity };
const heroShade: CSSProperties = { position: 'absolute', inset: 0, background: VIDEO_HERO_TREATMENT.overlayBackground };
const heroInner: CSSProperties = { width: '100%', maxWidth: '1560px', margin: '0 auto', padding: 'clamp(6.75rem,10vw,9rem) clamp(1rem,3.5vw,4.5rem) clamp(3.5rem,5.5vw,5rem)', position: 'relative', zIndex: 2 };
const eyebrow: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.72rem', letterSpacing: '.18em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 1rem' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-.055em', lineHeight: .86, fontSize: 'clamp(3.4rem,8vw,7.6rem)', textTransform: 'uppercase', margin: 0, maxWidth: '900px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,2vw,1.55rem)', lineHeight: 1.3, fontWeight: 700, maxWidth: '760px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1.125rem,1.35vw,1.35rem)', lineHeight: 1.64, color: 'rgba(255,255,255,.92)', maxWidth: '820px', margin: '1rem 0 0' };
const heroContext: CSSProperties = { color: 'rgba(255,255,255,.84)', fontSize: 'clamp(1.08rem,1.15vw,1.18rem)', lineHeight: 1.6, margin: '.85rem 0 0', maxWidth: '760px' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: 0 };
const primaryButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.76rem', padding: '1rem 1.25rem', textTransform: 'uppercase' };
const secondaryButton: CSSProperties = { display: 'inline-block', background: 'transparent', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.76rem', padding: '1rem 1.25rem', textTransform: 'uppercase', border: '1px solid rgba(255,241,45,.42)' };
const section: CSSProperties = { padding: 'clamp(3.5rem,6vw,6rem) clamp(1rem,3.5vw,4.5rem)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const splitHeader: CSSProperties = { maxWidth: '1560px', margin: '0 auto' };
const wideHeader: CSSProperties = { maxWidth: '1560px', margin: '0 auto 2.5rem' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.2rem,4.7vw,4.2rem)', lineHeight: .96, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0 };
const leadText: CSSProperties = { fontSize: 'clamp(1.21rem,1.5vw,1.42rem)', fontWeight: 500, lineHeight: 1.65, color: 'rgba(255,255,255,.86)', margin: '0 0 1.3rem' };
const bodyText: CSSProperties = { fontSize: 'clamp(1.125rem,1.24vw,1.2rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.87)', margin: 0 };
const bodyWide: CSSProperties = { ...bodyText, maxWidth: '820px', marginTop: '1.2rem' };
const riskGrid: CSSProperties = { maxWidth: '1560px', margin: '3rem auto 0' };
const riskCard: CSSProperties = { background: '#050505', padding: 'clamp(1.4rem,2.1vw,2rem)', minWidth: 0 };
const cardTitle: CSSProperties = { fontFamily: displayFont, fontSize: '1.2rem', textTransform: 'uppercase', color: '#fff', margin: '0 0 .85rem' };
const equipmentSection: CSSProperties = { padding: 'clamp(3.5rem,6vw,6rem) clamp(1rem,3.5vw,4.5rem)', background: 'radial-gradient(circle at 10% 0%,rgba(255,241,45,.05),transparent 30%),#050505', borderBottom: '1px solid rgba(255,255,255,.08)' };
const equipmentGrid: CSSProperties = { maxWidth: '1560px', margin: '0 auto', alignItems: 'center' };
const equipmentCopy: CSSProperties = { minWidth: 0 };
const equipmentLead: CSSProperties = { ...bodyText, color: 'rgba(255,255,255,.72)', marginTop: '1.25rem', maxWidth: '600px' };
const equipmentList: CSSProperties = { marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,.14)' };
const equipmentRow: CSSProperties = { padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,.14)' };
const equipmentName: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,1.9vw,1.55rem)', lineHeight: 1.08, textTransform: 'uppercase', fontWeight: 700, color: '#fff' };
const equipmentMedia: CSSProperties = { minWidth: 0 };
const equipmentImage: CSSProperties = { width: '100%', height: 'clamp(420px,46vw,620px)', objectFit: 'cover', display: 'block', border: '1px solid rgba(255,255,255,.08)' };
const pathwayFlow: CSSProperties = { maxWidth: '1560px', margin: '0 auto', display: 'grid', gap: '1rem' };
const pathwayRow: CSSProperties = { border: '1px solid rgba(255,255,255,.1)', background: '#050505', overflow: 'hidden' };
const pathwayCell: CSSProperties = { padding: '1.5rem', borderRight: '1px solid rgba(255,255,255,.08)', minWidth: 0 };
const stageLabel: CSSProperties = { fontFamily: displayFont, color: 'rgba(255,255,255,.7)', fontSize: '.72rem', letterSpacing: '.14em', fontWeight: 700, display: 'block', marginBottom: '.8rem' };
const pathwayTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem,1.8vw,1.38rem)', lineHeight: 1.08, color: '#fff' };
const smallText: CSSProperties = { ...bodyText, fontSize: 'clamp(1.125rem,1.17vw,1.18rem)', lineHeight: 1.6, marginTop: '.7rem' };
const technologyCell: CSSProperties = { padding: '1.5rem', textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 };
const technologyLabel: CSSProperties = { fontFamily: displayFont, fontSize: '.72rem', letterSpacing: '.13em', fontWeight: 700, opacity: .62, marginBottom: '.8rem' };
const technologyName: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.2rem,2vw,1.6rem)', lineHeight: 1 };
const technologyCta: CSSProperties = { fontFamily: displayFont, fontSize: '.72rem', letterSpacing: '.1em', fontWeight: 700, marginTop: '1rem' };
const principle: CSSProperties = { maxWidth: '1560px', margin: '1.5rem auto 0', borderLeft: '4px solid #FFF12D', background: 'linear-gradient(90deg,rgba(255,241,45,.08),rgba(255,255,255,.018))', padding: 'clamp(2rem,4vw,3rem)' };
const principleLabel: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.76rem', letterSpacing: '.16em', fontWeight: 700 };
const principleText: CSSProperties = { fontSize: 'clamp(1.2rem,2vw,1.55rem)', lineHeight: 1.55, color: 'rgba(255,255,255,.9)', margin: '1rem 0 0' };
const stakesSection: CSSProperties = { padding: 'clamp(3.5rem,6vw,6rem) clamp(1rem,3.5vw,4.5rem)', background: '#050505', borderBottom: '1px solid rgba(255,255,255,.08)' };
const stakesGrid: CSSProperties = { maxWidth: '1560px' };
const stakeCard: CSSProperties = { border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.012)', padding: '1.4rem', minHeight: '170px' };
const stakeTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,2vw,1.55rem)', lineHeight: 1.05, textTransform: 'uppercase', color: '#FFF12D', margin: 0 };
const stakeText: CSSProperties = { ...bodyText, color: 'rgba(255,255,255,.78)', marginTop: '.85rem' };
const tcoSection: CSSProperties = { padding: 'clamp(3.5rem,6vw,6rem) clamp(1rem,3.5vw,4.5rem)', background: 'radial-gradient(circle at 100% 0%,rgba(255,241,45,.06),transparent 32%),#020202', borderBottom: '1px solid rgba(255,255,255,.08)' };
const tcoLead: CSSProperties = { fontSize: 'clamp(1.16rem,1.5vw,1.35rem)', lineHeight: 1.65, fontWeight: 600, color: 'rgba(255,255,255,.82)', maxWidth: '940px', margin: '0 0 2rem' };
const valueGrid: CSSProperties = { maxWidth: '1560px' };
const valueCard: CSSProperties = { background: '#050505', padding: '1.5rem', minHeight: '190px', minWidth: 0 };
const valueTitle: CSSProperties = { fontFamily: displayFont, color: '#fff', fontSize: 'clamp(1.05rem,1.7vw,1.35rem)', textTransform: 'uppercase', margin: '0 0 .75rem' };
const valueText: CSSProperties = { ...bodyText, fontSize: 'clamp(1.125rem,1.2vw,1.18rem)' };
const lifecycleGrid: CSSProperties = { maxWidth: '1560px', borderTop: '1px solid rgba(255,241,45,.28)', borderBottom: '1px solid rgba(255,241,45,.18)', marginTop: '2rem' };
const lifecycleItem: CSSProperties = { fontFamily: displayFont, fontSize: '.82rem', textTransform: 'uppercase', padding: '1rem 1.1rem', borderRight: '1px solid rgba(255,241,45,.14)' };
const textLink: CSSProperties = { display: 'inline-block', marginTop: '1.6rem', color: '#FFF12D', textDecoration: 'none', borderBottom: '1px solid rgba(255,241,45,.55)', paddingBottom: '.25rem', fontFamily: displayFont, fontWeight: 700, fontSize: '.72rem', letterSpacing: '.1em' };
const decisionGrid: CSSProperties = { maxWidth: '1560px' };
const decisionCard: CSSProperties = { background: '#030303', minHeight: '210px', padding: '1.5rem', minWidth: 0 };
const faqSection: CSSProperties = { padding: 'clamp(3.5rem,6vw,6rem) clamp(1rem,3.5vw,4.5rem)', background: '#070707' };
const faqList: CSSProperties = { maxWidth: '1560px', borderTop: '1px solid rgba(255,255,255,.12)' };
const faqItem: CSSProperties = { padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,.12)' };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem,1.8vw,1.3rem)', lineHeight: 1.25, margin: '0 0 .65rem' };
const faqAnswer: CSSProperties = { ...bodyText, maxWidth: '940px', fontSize: 'clamp(1.125rem,1.2vw,1.18rem)' };
const conversionSection: CSSProperties = { padding: 'clamp(3.5rem,6vw,6rem) clamp(1rem,3.5vw,4.5rem)', background: '#020202', borderTop: '1px solid rgba(255,255,255,.08)' };
const conversionGrid: CSSProperties = { maxWidth: '1560px', margin: '0 auto', display: 'grid', alignItems: 'start' };
const conversionPrimary: CSSProperties = { minWidth: 0 };
const conversionSecondary: CSSProperties = { minWidth: 0, display: 'grid', gap: '2.2rem' };
const conversionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2.4rem,5vw,4.6rem)', lineHeight: .95, letterSpacing: '-.04em', textTransform: 'uppercase', maxWidth: '760px', margin: 0 };
const conversionText: CSSProperties = { ...bodyText, color: 'rgba(255,255,255,.72)', fontSize: 'clamp(1.125rem,1.24vw,1.2rem)', maxWidth: '680px', margin: '1.5rem 0 2rem' };
const conversionSubTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.5rem,2.8vw,2.2rem)', textTransform: 'uppercase', margin: '0 0 1.5rem' };
const divider: CSSProperties = { height: '1px', background: 'rgba(255,255,255,.12)' };
