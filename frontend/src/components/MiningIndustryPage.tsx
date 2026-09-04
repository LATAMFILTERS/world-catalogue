import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/industries/mining/`;

const risks = [
  { number: '01', title: 'Abrasive Dust', text: 'Open-pit and underground operations continuously expose air-intake systems to fine mineral dust. Loading rate, particle size and service conditions determine how quickly restriction and contamination risk develop.' },
  { number: '02', title: 'Hydraulic Contamination', text: 'Excavation, loading, drilling and haulage depend on high-pressure hydraulic systems. Ingress, wear debris and service practices can compromise pumps, valves, actuators and precision control surfaces.' },
  { number: '03', title: 'Fuel Handling', text: 'Bulk storage, transfer, field refueling and moisture exposure can introduce particulate and water contamination before fuel reaches sensitive engine interfaces.' },
  { number: '04', title: 'Extended Duty', text: 'Long operating hours, vibration, thermal load and production pressure make filtration capacity, service discipline and maintenance access part of the protection decision.' },
] as const;

const equipment = [
  'Haul Trucks',
  'Hydraulic Excavators',
  'Wheel Loaders',
  'Rotary Drill Rigs',
  'Dozers',
  'Crushers & Processing',
  'Support Equipment',
] as const;

const protection = [
  { source: 'ABRASIVE DUST', pathway: 'Airborne mineral particulate', risk: 'Engine wear risk', system: 'AIR INTAKE', technology: 'MACROCORE™', href: '/technologies/macrocore/', target: 'Engine air path' },
  { source: 'HYDRAULIC DEBRIS', pathway: 'Ingress + internal wear particles', risk: 'Pump, valve & actuator sensitivity', system: 'HYDRAULIC', technology: 'NANOFORCE™', href: '/technologies/nanoforce/', target: 'Hydraulic circuit' },
  { source: 'FUEL CONTAMINATION', pathway: 'Bulk storage + transfer + moisture', risk: 'Injection-system exposure', system: 'FUEL', technology: 'HYDROCORE™', href: '/technologies/hydrocore/', target: 'Fuel system' },
  { source: 'LUBE CONTAMINATION', pathway: 'Wear debris + service ingress', risk: 'Bearing & lubricated-interface wear', system: 'LUBRICATION', technology: 'SYNTRAX™', href: '/technologies/syntrax/', target: 'Lubrication circuit' },
] as const;

const questions = [
  {
    q: 'What filtration systems are most critical on mining equipment?',
    a: 'The priority depends on the machine and duty cycle, but mining equipment commonly requires coordinated protection across air intake, hydraulic, fuel and lubrication systems. Each system faces a different contamination mechanism, so selection should be based on the protected asset and operating conditions rather than the industry label alone.',
  },
  {
    q: 'How does abrasive dust affect mining engines?',
    a: 'Abrasive mineral dust increases loading on the air-intake system. If contamination reaches protected engine interfaces, it can contribute to wear and loss of performance. Air-cleaner capacity, restriction growth, sealing integrity and service practice therefore matter together.',
  },
  {
    q: 'What failure mechanisms can mining dust create?',
    a: 'Dust can contribute to abrasive wear, rising restriction, impaired heat rejection and interference with sensors or exposed control components. The dominant mechanism depends on where contamination enters, which system carries it and which interface is vulnerable.',
  },
  {
    q: 'Why is hydraulic cleanliness important in excavators and haul trucks?',
    a: 'Mining hydraulic systems rely on pumps, valves, actuators and control surfaces operating under high load. Contamination can interfere with those precision interfaces, so hydraulic filtration must be selected around fluid cleanliness requirements, system sensitivity, operating pressure and service conditions.',
  },
  {
    q: 'How can fuel become contaminated before it reaches the machine?',
    a: 'Contamination can enter through bulk storage, transport, transfer equipment, field refueling, tank breathing and moisture exposure. For mining operations, fuel protection should therefore consider the complete handling path rather than only the final filter installed on the equipment.',
  },
  {
    q: 'How does filtration affect total cost of ownership in mining?',
    a: 'Filtration affects more than consumable cost. Contamination control influences component wear, service frequency, maintenance predictability and equipment availability. The relevant economic question is therefore what high-value component and operating consequence the filtration strategy is protecting.',
  },
  {
    q: 'Does the same filtration strategy apply to open-pit and underground mining?',
    a: 'No. The equipment may share filter categories, but dust loading, ventilation, moisture, temperature, duty cycle, access and maintenance conditions can differ substantially. Those variables change the protection architecture and service strategy.',
  },
  {
    q: 'Can ELIMFILTERS identify a mining filter from an OEM or part number?',
    a: 'Yes. If the OEM reference or current filter number is known, Part Search provides the fastest path to cross-reference and application information. For an engineering review, the machine, protected system and operating environment should also be provided.',
  },
] as const;

export function MiningIndustryPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#page`,
        url: PAGE_URL,
        name: 'Mining Filtration Systems',
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
        breadcrumb: { '@id': `${PAGE_URL}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: `${BASE_URL}/industries/` },
          { '@type': 'ListItem', position: 3, name: 'Mining', item: PAGE_URL },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${PAGE_URL}#equipment`,
        name: 'Mining equipment protected by ELIMFILTERS',
        itemListElement: equipment.map((name, index) => ({ '@type': 'ListItem', position: index + 1, name })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${PAGE_URL}#faq`,
        mainEntity: questions.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };

  return (
    <main id="main-content" style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHeader currentPage="Mining" />

      <section style={hero}>
        <video autoPlay muted loop playsInline preload="metadata" poster="/images/mineria.avif" style={heroVideo}>
          <source src="/images/Mina-Video-1.mp4" type="video/mp4" />
        </video>
        <div style={heroShade} />
        <div style={heroInner}>
          <p style={eyebrow}>MINING / SEVERE-DUTY FILTRATION</p>
          <h1 style={heroTitle}>Mining Filtration<br /><span style={yellow}>Systems</span></h1>
          <p style={heroPromise}>Asset protection for equipment that cannot stop when contamination gets aggressive.</p>
          <p style={heroLead}>Air intake, fuel, lubrication and hydraulic contamination control for haul trucks, excavators, loaders, drills and support equipment operating in open-pit and underground mining environments.</p>
          <p style={heroContext}>Operating reality: abrasive dust, heavy load, extended duty cycles and constrained service windows.</p>
          <div style={actions}>
            <Link href="/contact/" style={yellowButton} data-conversion-action="application-support">PROTECT MINING EQUIPMENT</Link>
            <a href="https://part-search.elimfilters.com/" style={darkButton} data-conversion-action="product-intelligence">FIND MY FILTER</a>
          </div>
        </div>
      </section>

      <section style={introSection} aria-labelledby="mining-why-title">
        <div style={introGrid}>
          <div>
            <p style={eyebrow}>WHY MINING CHANGES FILTRATION</p>
            <h2 id="mining-why-title" style={sectionTitle}>Four forces shape the protection strategy.</h2>
          </div>
          <div>
            <p style={leadText}>A mining machine combines abrasive airborne contamination, high hydraulic demand, field fuel handling and extended duty cycles. The filtration architecture must account for how those forces interact with the specific machine and protected system.</p>
            <p style={bodyText}>That is why an air cleaner, fuel filter, hydraulic element or lube filter cannot be selected correctly from the word “mining” alone. The operating environment establishes the context; component sensitivity, contamination mechanism, service interval and maintenance reality complete the decision.</p>
          </div>
        </div>
        <div style={riskGrid}>
          {risks.map((risk) => (
            <article key={risk.number} style={riskCard}>
              <span style={riskNumber}>{risk.number}</span>
              <h3 style={riskTitle}>{risk.title}</h3>
              <p style={riskText}>{risk.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={equipmentSection} aria-labelledby="equipment-title">
        <div style={equipmentInner}>
          <div style={equipmentHeader}>
            <div>
              <p style={eyebrowDark}>THE MACHINES BEHIND PRODUCTION</p>
              <h2 id="equipment-title" style={equipmentTitle}>Different assets. Different contamination exposure.</h2>
            </div>
            <p style={equipmentLead}>The same mine can place completely different demands on a haul truck, excavator, drill rig and processing asset. Equipment type narrows the protection problem before a product number is considered.</p>
          </div>
          <div style={equipmentList} role="list" aria-label="Mining equipment applications">
            {equipment.map((asset, index) => (
              <div key={asset} style={equipmentRow} role="listitem">
                <span style={equipmentIndex}>{String(index + 1).padStart(2, '0')}</span>
                <span style={equipmentName}>{asset}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={pathwaySection} aria-labelledby="pathway-title">
        <div style={pathwayHeader}>
          <p style={eyebrow}>CONTAMINATION PATHWAYS</p>
          <h2 id="pathway-title" style={sectionTitle}>See the threat first. Then engineer the protection.</h2>
          <p style={pathwayIntro}>Mining contamination does not begin at the filter. It begins in the operating environment. Each pathway connects a contamination source to the system at risk and then to the ELIMFILTERS technology engineered for that protection need.</p>
        </div>
        <div style={pathwayFlow}>
          {protection.map((item, index) => (
            <article key={item.system} style={pathwayRow}>
              <div style={pathwayIdentity}>
                <span style={pathwayIndex}>{String(index + 1).padStart(2, '0')}</span>
                <span style={stageLabel}>CONTAMINATION SOURCE</span>
                <strong style={sourceTitle}>{item.source}</strong>
                <p style={stageText}>{item.pathway}</p>
              </div>
              <div style={pathwayStage}>
                <span style={stageLabel}>WHAT IT THREATENS</span>
                <strong style={riskHeadline}>{item.risk}</strong>
                <p style={stageText}>{item.target}</p>
              </div>
              <div style={systemStage}>
                <span style={stageLabel}>PROTECTION SYSTEM</span>
                <strong style={systemName}>{item.system}</strong>
              </div>
              <Link href={item.href} style={technologyStage}>
                <span style={technologyLabel}>ELIMFILTERS TECHNOLOGY</span>
                <strong style={technologyName}>{item.technology}</strong>
                <span style={technologyCta}>EXPLORE TECHNOLOGY →</span>
              </Link>
            </article>
          ))}
        </div>
        <div style={principle}>
          <span style={principleLabel}>MINING ENGINEERING PRINCIPLE</span>
          <p style={principleText}>The correct filtration strategy is not determined by machine type alone. Dust loading, fluid cleanliness requirements, fuel handling, duty cycle, service interval and component sensitivity determine the protection architecture.</p>
        </div>
      </section>

      <section style={stakesSection}>
        <div style={stakesGrid}>
          <div>
            <p style={eyebrow}>WHAT CONTAMINATION PUTS AT RISK</p>
            <h2 style={impactTitle}>Protect the operating chain before contamination becomes downtime.</h2>
          </div>
          <div style={stakesList}>
            {[
              ['Component Wear', 'Limit abrasive contamination at bearings, pumps, valves and other precision interfaces.'],
              ['Airflow & Restriction', 'Manage particulate loading before rising restriction changes airflow or service demand.'],
              ['Hydraulic Reliability', 'Protect pumps, valves, actuators and control surfaces around the required fluid cleanliness.'],
              ['Fuel-System Integrity', 'Control particulate and water contamination across storage, transfer and field refueling.'],
              ['Thermal Control', 'Keep contamination from becoming an additional burden on cooling surfaces and heat rejection.'],
              ['Equipment Availability', 'Reduce avoidable contamination events that can remove productive assets from service.'],
            ].map(([title, text]) => (
              <div key={title} style={stakeRow}>
                <h3 style={stakeTitle}>{title}</h3>
                <p style={stakeText}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={tcoSection} aria-labelledby="mining-tco-title">
        <div style={tcoGrid}>
          <div>
            <p style={eyebrow}>AVAILABILITY & TOTAL COST OF OWNERSHIP</p>
            <h2 id="mining-tco-title" style={tcoTitle}>The filter is inexpensive. The component it protects is not.</h2>
            <p style={tcoIntro}>Mining filtration should be judged against component sensitivity, maintenance consequence and equipment availability—not filter price alone.</p>
          </div>
          <div>
            <p style={tcoLead}>A practical protection hierarchy separates long-life asset structures, high-value serviceable components and consumable protection elements. The categories are a decision aid: they show why a relatively low-cost filtration element can matter to much higher-value interfaces.</p>
            <div style={valueList}>
              {[
                ['Long-life asset structures', 'Frames, housings, major castings and structural assemblies intended to remain with the machine for long periods.'],
                ['High-value serviceable components', 'Turbochargers, injectors, pumps, valves, transmissions, final drives and other assemblies with significant service consequence.'],
                ['Consumable protection elements', 'Filters, seals and service fluids replaced through the lifecycle to control contamination before it reaches sensitive interfaces.'],
              ].map(([title, text], index) => (
                <article key={title} style={valueRow}>
                  <span style={valueNumber}>{String(index + 1).padStart(2, '0')}</span>
                  <div><h3 style={valueTitle}>{title}</h3><p style={valueText}>{text}</p></div>
                </article>
              ))}
            </div>
            <div style={tcoFlow} aria-label="Contamination to lifecycle cost pathway">
              {[
                ['01', 'Contamination ingress'],
                ['02', 'Wear / restriction / thermal load'],
                ['03', 'Component degradation'],
                ['04', 'Unplanned intervention'],
                ['05', 'Lower equipment availability'],
                ['06', 'Higher lifecycle cost'],
              ].map(([number, label]) => (
                <div key={number} style={tcoRow}>
                  <span style={tcoNumber}>{number}</span>
                  <strong style={tcoRowText}>{label}</strong>
                </div>
              ))}
            </div>
            <Link href="/knowledge-center/engineering/mining-contamination-tco/" style={tcoLink}>READ THE ENGINEERING GUIDE →</Link>
          </div>
        </div>
      </section>

      <section style={decisionSection} aria-labelledby="decision-title">
        <div style={decisionInner}>
          <p style={eyebrow}>FROM MACHINE TO PROTECTION</p>
          <h2 id="decision-title" style={{ ...sectionTitle, maxWidth: '900px' }}>The mining filtration decision in five steps.</h2>
          <div style={decisionGrid}>
            {[
              ['01', 'Machine', 'Identify the asset, engine and critical systems.'],
              ['02', 'Exposure', 'Define dust, water, fuel, debris and environmental contamination.'],
              ['03', 'Duty', 'Establish load, operating hours, service access and maintenance interval.'],
              ['04', 'Protection', 'Connect each contamination mechanism to the correct filtration system and technology.'],
              ['05', 'Part', 'Resolve the final product through OEM reference, dimensions and application evidence.'],
            ].map(([number, title, text]) => (
              <div key={number} style={decisionCard}>
                <span style={decisionNumber}>{number}</span>
                <h3 style={decisionTitle}>{title}</h3>
                <p style={decisionText}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={faqInner}>
          <div style={faqHeader}>
            <p style={eyebrow}>MINING FILTRATION QUESTIONS</p>
            <h2 id="faq-title" style={sectionTitle}>What mining operators and maintenance teams need to know.</h2>
          </div>
          <div style={faqList}>
            {questions.map((item, index) => (
              <article key={item.q} style={faqItem}>
                <span style={faqNumber}>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3 style={faqQuestion}>{item.q}</h3>
                  <p style={faqAnswer}>{item.a}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={conversionSection}>
        <div style={conversionGrid}>
          <div style={conversionPrimary}>
            <p style={eyebrowDark}>HAVE A MACHINE OR CONTAMINATION PROBLEM?</p>
            <h2 style={conversionTitle}>Protect mining equipment around the way it actually operates.</h2>
            <p style={conversionText}>Send the machine, engine, protected system, operating environment and any known OEM or filter reference. We will route the request through the correct protection path.</p>
            <Link href="/contact/" style={blackButton} data-conversion-action="application-support">PROTECT MINING EQUIPMENT</Link>
          </div>
          <div style={conversionSecondary}>
            <div>
              <p style={eyebrow}>ALREADY HAVE A PART NUMBER?</p>
              <h3 style={secondaryTitle}>Go directly to Part Search.</h3>
              <a href="https://part-search.elimfilters.com/" style={darkButton} data-conversion-action="product-intelligence">FIND MY FILTER</a>
            </div>
            <div style={secondaryDivider} />
            <div>
              <p style={eyebrow}>SERVE MINING CUSTOMERS?</p>
              <h3 style={secondaryTitle}>Evaluate distributor fit.</h3>
              <Link href="/distributor-application/" style={darkButton}>BECOME A DISTRIBUTOR</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';
const yellow = { color: '#FFF12D' };
const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont, overflowX: 'hidden' };
const hero: CSSProperties = { minHeight: '92vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const heroVideo: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.74 };
const heroShade: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.64) 50%, rgba(0,0,0,0.18) 100%), linear-gradient(0deg, rgba(0,0,0,0.68), transparent 58%)' };
const heroInner: CSSProperties = { width: '100%', maxWidth: '1180px', margin: '0 auto', padding: 'clamp(7rem, 12vw, 10rem) clamp(1.25rem, 5vw, 4.5rem) clamp(4rem, 7vw, 6rem)', position: 'relative', zIndex: 2 };
const eyebrow: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '0.72rem', lineHeight: 1.2, letterSpacing: '0.18em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 1rem' };
const eyebrowDark: CSSProperties = { ...eyebrow, color: '#111' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-0.055em', lineHeight: 0.86, fontSize: 'clamp(3.4rem, 8vw, 7.6rem)', textTransform: 'uppercase', margin: 0, maxWidth: '900px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem, 2vw, 1.55rem)', lineHeight: 1.3, fontWeight: 700, maxWidth: '760px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem, 1.45vw, 1.18rem)', lineHeight: 1.7, color: 'rgba(255,255,255,0.78)', maxWidth: '820px', margin: '1rem 0 0' };
const heroContext: CSSProperties = { color: 'rgba(255,255,255,0.58)', fontSize: '0.92rem', lineHeight: 1.55, margin: '0.85rem 0 0', maxWidth: '760px' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginTop: '2rem' };
const yellowButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.76rem', padding: '1rem 1.25rem', textTransform: 'uppercase' };
const darkButton: CSSProperties = { display: 'inline-block', background: 'rgba(0,0,0,0.62)', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.76rem', padding: '1rem 1.25rem', textTransform: 'uppercase', border: '1px solid rgba(255,241,45,0.42)' };
const blackButton: CSSProperties = { ...yellowButton, background: '#000', color: '#FFF12D' };
const introSection: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7.5rem) clamp(1.25rem, 6vw, 6rem)' };
const introGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 'clamp(2rem, 6vw, 5rem)' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.2rem, 4.7vw, 4.2rem)', lineHeight: 0.96, letterSpacing: '-0.04em', textTransform: 'uppercase', margin: 0 };
const leadText: CSSProperties = { fontSize: 'clamp(1.1rem, 1.7vw, 1.35rem)', fontWeight: 600, lineHeight: 1.65, color: 'rgba(255,255,255,0.86)', margin: '0 0 1.3rem', textAlign: 'left' };
const bodyText: CSSProperties = { fontSize: '1rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.64)', margin: 0, textAlign: 'left' };
const riskGrid: CSSProperties = { maxWidth: '1180px', margin: '3rem auto 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' };
const riskCard: CSSProperties = { background: '#050505', padding: '1.8rem', minHeight: '285px', minWidth: 0, maxWidth: '380px', flex: '1 1 240px' };
const riskNumber: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontSize: '0.7rem', letterSpacing: '0.15em', fontWeight: 700 };
const riskTitle: CSSProperties = { fontFamily: displayFont, fontSize: '1.25rem', textTransform: 'uppercase', margin: '1.2rem 0 0.9rem' };
const riskText: CSSProperties = { ...bodyText, fontSize: '0.94rem' };
const equipmentSection: CSSProperties = { background: '#FFF12D', color: '#111', padding: 'clamp(3.5rem, 6vw, 5.5rem) clamp(1.25rem, 6vw, 6rem)' };
const equipmentInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', minWidth: 0 };
const equipmentHeader: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 'clamp(2rem, 5vw, 4rem)', alignItems: 'start' };
const equipmentTitle: CSSProperties = { ...sectionTitle, color: '#080808' };
const equipmentLead: CSSProperties = { color: 'rgba(0,0,0,0.72)', fontSize: '1.02rem', lineHeight: 1.7, margin: 0, textAlign: 'left', maxWidth: '540px' };
const equipmentList: CSSProperties = { width: '100%', margin: '2.5rem auto 0', borderTop: '1px solid rgba(0,0,0,0.28)', borderBottom: '1px solid rgba(0,0,0,0.28)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(290px, 100%), 1fr))', columnGap: 'clamp(2rem, 5vw, 4rem)' };
const equipmentRow: CSSProperties = { minHeight: '84px', padding: '1rem 0', borderBottom: '1px solid rgba(0,0,0,0.2)', display: 'grid', gridTemplateColumns: '42px minmax(0, 1fr)', gap: '1rem', alignItems: 'center', minWidth: 0, background: 'transparent', color: '#050505' };
const equipmentIndex: CSSProperties = { fontFamily: displayFont, fontSize: '0.68rem', letterSpacing: '0.12em', fontWeight: 700, color: 'rgba(0,0,0,0.58)' };
const equipmentName: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem, 1.7vw, 1.45rem)', lineHeight: 1.05, textTransform: 'uppercase', fontWeight: 700, color: '#050505', overflowWrap: 'anywhere' };
const pathwaySection: CSSProperties = { padding: 'clamp(4.5rem, 9vw, 8rem) clamp(1.25rem, 5vw, 5rem)', background: 'radial-gradient(circle at 100% 0%, rgba(255,241,45,0.07), transparent 32%), #020202' };
const pathwayHeader: CSSProperties = { maxWidth: '1180px', margin: '0 auto 3rem' };
const pathwayIntro: CSSProperties = { ...bodyText, maxWidth: '820px', marginTop: '1.4rem', fontSize: '1.02rem' };
const pathwayFlow: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gap: '1rem' };
const pathwayRow: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(210px, 100%), 1fr))', border: '1px solid rgba(255,255,255,0.1)', background: '#050505', minWidth: 0, overflow: 'hidden' };
const pathwayIdentity: CSSProperties = { padding: '1.5rem', minWidth: 0, display: 'flex', flexDirection: 'column' };
const pathwayStage: CSSProperties = { padding: '1.5rem', minWidth: 0, borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'center' };
const systemStage: CSSProperties = { ...pathwayStage, background: 'rgba(255,255,255,0.025)' };
const pathwayIndex: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '0.68rem', letterSpacing: '0.12em', marginBottom: '1.5rem' };
const stageLabel: CSSProperties = { fontFamily: displayFont, color: 'rgba(255,255,255,0.38)', fontSize: '0.58rem', lineHeight: 1.25, letterSpacing: '0.14em', fontWeight: 700, marginBottom: '0.8rem' };
const sourceTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem, 1.8vw, 1.38rem)', lineHeight: 1.05, color: '#fff', overflowWrap: 'anywhere' };
const riskHeadline: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem, 1.8vw, 1.38rem)', lineHeight: 1.08, color: '#fff', overflowWrap: 'anywhere' };
const stageText: CSSProperties = { ...bodyText, fontSize: '0.82rem', lineHeight: 1.5, marginTop: '0.7rem', overflowWrap: 'anywhere' };
const systemName: CSSProperties = { fontFamily: displayFont, color: '#fff', fontSize: 'clamp(1.05rem, 1.8vw, 1.35rem)', lineHeight: 1.05, overflowWrap: 'anywhere' };
const technologyStage: CSSProperties = { padding: '1.5rem', background: '#FFF12D', color: '#050505', textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 };
const technologyLabel: CSSProperties = { fontFamily: displayFont, fontSize: '0.58rem', letterSpacing: '0.13em', fontWeight: 700, opacity: 0.62, marginBottom: '0.8rem' };
const technologyName: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.2rem, 2vw, 1.6rem)', lineHeight: 1, letterSpacing: '-0.02em', overflowWrap: 'anywhere' };
const technologyCta: CSSProperties = { fontFamily: displayFont, fontSize: '0.58rem', letterSpacing: '0.1em', fontWeight: 700, marginTop: '1rem' };
const principle: CSSProperties = { maxWidth: '1180px', margin: '1.5rem auto 0', borderLeft: '4px solid #FFF12D', background: 'linear-gradient(90deg, rgba(255,241,45,0.08), rgba(255,255,255,0.018))', padding: 'clamp(2rem, 4vw, 3rem)', display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 };
const principleLabel: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '0.76rem', letterSpacing: '0.16em', fontWeight: 700 };
const principleText: CSSProperties = { fontSize: 'clamp(1.2rem, 2vw, 1.55rem)', lineHeight: 1.55, color: 'rgba(255,255,255,0.9)', maxWidth: '1050px', margin: 0, textAlign: 'left' };
const stakesSection: CSSProperties = { padding: 'clamp(4.5rem, 9vw, 8rem) clamp(1.25rem, 6vw, 6rem)', background: 'radial-gradient(circle at 0% 0%, rgba(255,241,45,0.13), transparent 32%), #050505' };
const stakesGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 'clamp(3rem, 7vw, 7rem)' };
const impactTitle: CSSProperties = { ...sectionTitle, fontSize: 'clamp(2.6rem, 5.4vw, 5rem)' };
const stakesList: CSSProperties = { borderTop: '1px solid rgba(255,255,255,0.14)', minWidth: 0 };
const stakeRow: CSSProperties = { padding: '1.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.14)', display: 'grid', gridTemplateColumns: 'minmax(min(150px, 100%), 0.55fr) minmax(0, 1fr)', gap: '1.3rem' };
const stakeTitle: CSSProperties = { fontFamily: displayFont, fontSize: '0.82rem', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0, color: '#FFF12D' };
const stakeText: CSSProperties = { ...bodyText, fontSize: '0.92rem', color: 'rgba(255,255,255,0.75)' };
const tcoSection: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', background: 'radial-gradient(circle at 100% 0%, rgba(255,241,45,0.08), transparent 32%), #020202', color: '#fff', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const tcoGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 'clamp(2.5rem, 7vw, 6rem)', alignItems: 'start' };
const tcoTitle: CSSProperties = { ...sectionTitle, color: '#fff', fontSize: 'clamp(2.5rem, 5.2vw, 4.8rem)' };
const tcoIntro: CSSProperties = { ...bodyText, fontSize: '1rem', maxWidth: '560px', marginTop: '1.4rem', color: 'rgba(255,255,255,0.66)' };
const tcoLead: CSSProperties = { color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(1.05rem, 1.6vw, 1.28rem)', lineHeight: 1.65, fontWeight: 600, margin: 0, maxWidth: '650px' };
const valueList: CSSProperties = { borderTop: '1px solid rgba(255,255,255,0.14)', marginTop: '2rem' };
const valueRow: CSSProperties = { display: 'grid', gridTemplateColumns: '44px minmax(0,1fr)', gap: '1rem', padding: '1.25rem 0', borderBottom: '1px solid rgba(255,255,255,0.14)' };
const valueNumber: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '0.68rem', letterSpacing: '0.1em', paddingTop: '0.15rem' };
const valueTitle: CSSProperties = { fontFamily: displayFont, color: '#fff', fontSize: '0.95rem', textTransform: 'uppercase', margin: '0 0 0.45rem' };
const valueText: CSSProperties = { ...bodyText, fontSize: '0.9rem', color: 'rgba(255,255,255,0.62)' };
const tcoFlow: CSSProperties = { borderTop: '1px solid rgba(255,241,45,0.28)', marginTop: '2rem' };
const tcoRow: CSSProperties = { display: 'grid', gridTemplateColumns: '42px minmax(0,1fr)', gap: '1rem', alignItems: 'center', padding: '0.9rem 0', borderBottom: '1px solid rgba(255,241,45,0.18)' };
const tcoNumber: CSSProperties = { fontFamily: displayFont, fontSize: '0.66rem', letterSpacing: '0.1em', color: '#FFF12D' };
const tcoRowText: CSSProperties = { fontFamily: displayFont, fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.02em', color: '#fff' };
const tcoLink: CSSProperties = { display: 'inline-block', marginTop: '1.5rem', color: '#FFF12D', textDecoration: 'none', borderBottom: '1px solid rgba(255,241,45,0.6)', paddingBottom: '0.25rem', fontFamily: displayFont, fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em' };
const decisionSection: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)' };
const decisionInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const decisionGrid: CSSProperties = { marginTop: '2.8rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' };
const decisionCard: CSSProperties = { background: '#030303', minHeight: '230px', padding: '1.5rem', minWidth: 0, maxWidth: '300px', flex: '1 1 190px' };
const decisionNumber: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '0.7rem', letterSpacing: '0.15em', fontWeight: 700 };
const decisionTitle: CSSProperties = { fontFamily: displayFont, fontSize: '1.05rem', textTransform: 'uppercase', margin: '1.3rem 0 0.75rem' };
const decisionText: CSSProperties = { ...bodyText, fontSize: '0.9rem' };
const faqSection: CSSProperties = { padding: 'clamp(4.5rem, 9vw, 8rem) clamp(1.25rem, 6vw, 6rem)', background: '#070707' };
const faqInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const faqHeader: CSSProperties = { maxWidth: '880px', marginBottom: '2.5rem' };
const faqList: CSSProperties = { borderTop: '1px solid rgba(255,255,255,0.12)' };
const faqItem: CSSProperties = { display: 'grid', gridTemplateColumns: '52px minmax(0,1fr)', gap: '1.2rem', padding: '1.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.12)' };
const faqNumber: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '0.68rem', letterSpacing: '0.1em', paddingTop: '0.2rem' };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem, 1.8vw, 1.3rem)', lineHeight: 1.25, margin: '0 0 0.7rem' };
const faqAnswer: CSSProperties = { ...bodyText, maxWidth: '940px', fontSize: '0.96rem' };
const conversionSection: CSSProperties = { padding: 0 };
const conversionGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))' };
const conversionPrimary: CSSProperties = { background: '#FFF12D', color: '#080808', padding: 'clamp(3.5rem, 7vw, 6rem)', minHeight: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', minWidth: 0 };
const conversionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2.4rem, 5vw, 4.6rem)', lineHeight: 0.95, letterSpacing: '-0.04em', textTransform: 'uppercase', maxWidth: '760px', margin: 0 };
const conversionText: CSSProperties = { color: 'rgba(0,0,0,0.72)', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '680px', margin: '1.5rem 0 2rem', textAlign: 'left' };
const conversionSecondary: CSSProperties = { background: '#050505', padding: 'clamp(3.5rem, 7vw, 6rem)', minHeight: '500px', display: 'grid', alignContent: 'center', gap: '2.5rem', minWidth: 0 };
const secondaryDivider: CSSProperties = { height: '1px', background: 'rgba(255,255,255,0.12)' };
const secondaryTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)', textTransform: 'uppercase', margin: '0 0 1.5rem' };
