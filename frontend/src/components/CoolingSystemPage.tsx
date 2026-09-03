import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/systems/cooling-system/`;

const contamination = [
  ['CORROSION PRODUCTS', 'Oxides and corrosion debris can circulate through coolant passages and heat-transfer surfaces.'],
  ['SCALE + MINERAL DEPOSITS', 'Deposits can interfere with heat transfer and create localized thermal stress inside the circuit.'],
  ['DEGRADED COOLANT', 'Fluid condition changes over time and must be considered together with service history and maintenance evidence.'],
  ['SERVICE INGRESS', 'Maintenance, topping-off and component replacement can introduce particulate or incompatible fluid into the cooling circuit.'],
] as const;

const protectedComponents = [
  ['Wet Liners', 'Cooling-system condition affects liner surfaces and the fluid environment around high-load engine structures.'],
  ['Water Pumps', 'Clean coolant supports the passages, seals and rotating interfaces that depend on stable fluid condition.'],
  ['Heat-Transfer Surfaces', 'Radiators, jackets and passages depend on unobstructed coolant flow and controlled deposits.'],
  ['Seals + Passages', 'Particulate, corrosion products and incompatible coolant conditions can affect sealing and circulation paths.'],
] as const;

const faqs = [
  ['What is Cooling System Protection?', "Cooling System Protection is the ELIMFILTERS system domain for controlling particulate, corrosion products, scale and coolant condition in applicable heavy-duty cooling circuits. Contamination in the cooling circuit takes several forms: corrosion products and oxides that circulate through coolant passages and heat-transfer surfaces, scale and mineral deposits that interfere with heat transfer and create localized thermal stress, coolant degradation that changes fluid condition over time, and service ingress, where maintenance, topping-off or component replacement introduces particulate or incompatible fluid into the circuit. Left uncontrolled, these conditions affect wet liners and the fluid environment around high-load engine structures, water pumps and their passages, seals and rotating interfaces, heat-transfer surfaces such as radiators and jackets, and the seals and passages that depend on stable circulation. THERMACORE™ technology and the Coolant Filters product family are selected together against the engine's actual cooling-system configuration and coolant condition, connecting contamination control to the specific circuit rather than a generic coolant-system assumption."],
  ['Which ELIMFILTERS technology is used for cooling-system protection?', 'THERMACORE™ is the canonical ELIMFILTERS technology associated with coolant filtration and cooling-system protection. It is engineered to address the contamination types that circulate through heavy-duty cooling circuits — corrosion products and oxides, scale and mineral deposits that interfere with heat transfer, and particulate introduced through service ingress during maintenance or component replacement — while accounting for coolant condition changes that occur over the service interval. THERMACORE™ protection supports wet liners and the high-load engine structures around them, water pump passages and rotating interfaces, heat-transfer surfaces such as radiators and jackets, and the seals and passages that depend on stable coolant circulation. Because coolant chemistry, service strategy and cooling-system configuration vary by application, THERMACORE™ identification is combined with the Coolant Filters product family and validated application evidence — including thread, dimensions and gasket geometry — before a specific part number is confirmed, rather than relying on the technology name alone.'],
  ['What product family belongs to this system?', 'Coolant Filters are the governed product family within Cooling System Protection. This family is built specifically around THERMACORE™ technology to address the contamination profile of heavy-duty cooling circuits — corrosion products, scale and mineral deposits, coolant degradation and service-related particulate ingress — rather than serving as a generic filtration product applied across unrelated systems. Coolant Filters are engineered to protect wet liners, water pumps, heat-transfer surfaces and the seals and passages that depend on stable coolant flow, which means their construction, thread and gasket geometry reflect the actual cooling-system architecture rather than a universal fitting. Because not every cooling system uses a filterable coolant-filter architecture, confirming that an application falls within this product family — before evaluating thread, dimensions and coolant chemistry — is an early step in identifying whether Cooling System Protection applies to a given engine or equipment configuration.'],
  ['Is a coolant filter selected only by thread or dimensions?', "No. Thread, dimensions and gasket geometry are useful evidence, but coolant-system configuration, service strategy, chemistry and validated application compatibility also matter. A coolant filter that physically fits the mounting thread can still be incompatible if its chemistry does not match the coolant type in use, since coolant additive packages interact directly with corrosion inhibitors and scale-control chemistry inside the filter. Cooling-system configuration determines whether the circuit is designed around a filterable coolant-filter architecture at all, and service strategy — including maintenance interval and topping-off practices — affects how much service-related particulate and fluid-condition change the filter must accommodate. Because heat-transfer surfaces, water pumps, wet liners and coolant-circuit seals depend on stable, chemically compatible coolant, ELIMFILTERS confirms thread and dimensional fit together with coolant-system configuration and chemistry before validating a specific coolant-filter part number, rather than treating dimensional match as sufficient on its own."],
  ['What standard is associated with this system?', 'ASTM D6210 is used in the ELIMFILTERS knowledge model as a relevant heavy-duty coolant specification context. It does not replace application-specific validation. ASTM D6210 establishes performance requirements for fully-formulated glycol-base engine coolants used in heavy-duty engines, providing a reference point for coolant chemistry and additive performance relevant to corrosion protection, scale control and heat-transfer stability. Within Cooling System Protection, this standard informs how ELIMFILTERS evaluates coolant condition and compatibility alongside the physical requirements of the Coolant Filters product family, but it is one input among several rather than a substitute for confirming the actual engine, cooling-system configuration and service history. Because coolant chemistry and cooling-circuit design vary by manufacturer and application, ASTM D6210 context is combined with equipment-specific evidence — dimensions, thread, mounting details and current filter or OEM reference — before a specific coolant-filter part number is validated for a given application.'],
  ['Does every cooling system use a coolant filter?', 'No. Coolant filtration is application dependent. The engine or equipment configuration must support the filter architecture before a part is selected. Some heavy-duty cooling circuits are designed with a dedicated coolant-filter mounting position intended to address corrosion products, scale and mineral deposits, coolant degradation and service-related particulate; others are not built around a filterable coolant-filter architecture at all, and rely instead on coolant chemistry, maintenance intervals and system design to manage these contamination types. Attempting to add coolant filtration to a system not engineered for it, or assuming a coolant filter exists where the actual cooling-system configuration does not support one, risks both incompatibility and unnecessary service complexity. Confirming whether the specific engine or equipment configuration includes a coolant-filter position — before evaluating thread, dimensions or coolant chemistry — is therefore an early and necessary step in Cooling System Protection identification, rather than an assumption that applies uniformly across all heavy-duty cooling circuits.'],
  ['What information helps identify the correct coolant filter?', "Equipment or vehicle, engine, current filter or OEM reference, dimensions, thread or mounting details, coolant-system configuration and available application evidence are useful inputs. Equipment or vehicle and engine establish whether the cooling-system architecture includes a coolant-filter position at all, since coolant filtration is application dependent rather than universal. A current filter or OEM reference accelerates identification through Part Search, though the match should still be confirmed against coolant-system configuration and coolant chemistry rather than accepted on cross-reference alone. Dimensions and thread or mounting details confirm physical compatibility with the housing and gasket geometry, while broader application evidence — including service strategy, coolant type and any known corrosion, scale or degradation history — helps confirm that a candidate THERMACORE™ filter will actually address the contamination profile the specific wet liners, water pump, heat-transfer surfaces and coolant-circuit seals are exposed to, rather than a generic coolant-filter assumption."],
] as const;

const schemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${PAGE_URL}#webpage`,
    name: 'Cooling System Protection',
    url: PAGE_URL,
    description: 'Cooling-system contamination control for heavy-duty engines using THERMACORE™ coolant filtration and application-specific part validation.',
    isPartOf: { '@id': `${BASE_URL}/#website` },
    publisher: { '@id': `${BASE_URL}/#organization` },
    about: [
      { '@type': 'Thing', name: 'Cooling system filtration' },
      { '@type': 'Thing', name: 'Coolant contamination control' },
      { '@type': 'Thing', name: 'Heavy-duty engine cooling systems' },
    ],
    mentions: [
      { '@type': 'Thing', name: 'THERMACORE' },
      { '@type': 'Thing', name: 'Coolant Filters' },
      { '@type': 'Thing', name: 'ASTM D6210' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Systems', item: `${BASE_URL}/systems/` },
      { '@type': 'ListItem', position: 3, name: 'Cooling System Protection', item: PAGE_URL },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Cooling System Protection architecture',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Cooling System Protection' },
      { '@type': 'ListItem', position: 2, name: 'THERMACORE technology' },
      { '@type': 'ListItem', position: 3, name: 'Coolant Filters product family' },
      { '@type': 'ListItem', position: 4, name: 'Validated ELIMFILTERS part number' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  },
];

export function CoolingSystemPage() {
  return (
    <main style={main}>
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <PageHeader breadcrumbs={[{ label: 'Systems', href: '/systems/' }]} currentPage="Cooling System Protection" />

      <section style={hero}>
        <img src="/images/thermacore_mecnico.jpg" alt="Cooling system protection" style={heroMedia} />
        <div style={heroOverlay} />
        <div style={heroInner}>
          <p style={eyebrow}>THERMAL SYSTEM CONTAMINATION CONTROL</p>
          <h1 style={heroTitle}>Cooling System<br /><span style={{ color: '#FFF12D' }}>Protection</span></h1>
          <p style={heroPromise}>Protect coolant circulation, heat-transfer surfaces and heavy-duty engine components before contamination becomes a thermal-system problem.</p>
          <p style={heroLead}>ELIMFILTERS Cooling System Protection connects coolant condition, contamination exposure and equipment configuration to THERMACORE™ technology, the Coolant Filters family and a validated part number.</p>
          <div style={buttonRow}>
            <Link href="#protection-path" style={yellowButton}>IDENTIFY THE COOLING PATH</Link>
            <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={darkButton}>FIND MY FILTER</a>
          </div>
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}>DIRECT ANSWER</p>
        <div style={twoCol}>
          <h2 style={h2}>Cooling-system protection is fluid-condition control tied to the actual engine architecture.</h2>
          <div>
            <p style={lead}>A coolant filter is not a universal add-on. It belongs to a specific cooling-system configuration and must be matched to the engine, service strategy, mounting architecture and validated application evidence.</p>
            <p style={body}>The ELIMFILTERS hierarchy is explicit: Cooling System Protection → THERMACORE™ → Coolant Filters → validated ELIMFILTERS part number.</p>
          </div>
        </div>
      </section>

      <section id="protection-path" style={sectionAlt}>
        <p style={eyebrow}>CONTAMINATION PATHWAYS</p>
        <h2 style={h2}>Control what circulates through the thermal circuit.</h2>
        <div style={grid4}>
          {contamination.map(([title, text]) => (
            <article key={title} style={card}>
              <p style={cardLabel}>{title}</p>
              <p style={cardBody}>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div>
            <p style={eyebrow}>ENGINEERING PRINCIPLE</p>
            <h2 style={h2}>Cooling performance depends on fluid condition, circulation and clean heat-transfer surfaces.</h2>
          </div>
          <div>
            <p style={lead}>The filter must support the intended cooling-system strategy without being treated as a substitute for correct coolant chemistry, service practice or application validation.</p>
            <p style={body}>THERMACORE™ is the canonical technology for this system. Product selection remains tied to the actual equipment configuration and evidence.</p>
          </div>
        </div>
      </section>

      <section style={sectionAlt}>
        <p style={eyebrow}>WHAT THE SYSTEM PROTECTS</p>
        <h2 style={h2}>The cooling circuit protects more than engine temperature.</h2>
        <div style={grid2}>
          {protectedComponents.map(([title, text]) => (
            <article key={title} style={lineCard}>
              <h3 style={h3}>{title}</h3>
              <p style={body}>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}>SYSTEM ARCHITECTURE</p>
        <h2 style={h2}>From protected system to physical component.</h2>
        <div style={architecture}>
          <div style={architectureCard}><span style={smallLabel}>SYSTEM</span><strong>Cooling System Protection</strong></div>
          <div style={arrow}>→</div>
          <Link href="/technologies/thermacore/" style={architectureLink}><span style={smallLabel}>TECHNOLOGY</span><strong>THERMACORE™</strong></Link>
          <div style={arrow}>→</div>
          <Link href="/families/coolant-filters/" style={architectureLink}><span style={smallLabel}>PRODUCT FAMILY</span><strong>Coolant Filters</strong></Link>
          <div style={arrow}>→</div>
          <div style={architectureCard}><span style={smallLabel}>APPLICATION</span><strong>Validated Part</strong></div>
        </div>
      </section>

      <section style={sectionAlt}>
        <p style={eyebrow}>VALIDATION CONTEXT</p>
        <h2 style={h2}>Use standards as engineering context, not as a shortcut around application validation.</h2>
        <div style={twoCol}>
          <div style={card}>
            <p style={cardLabel}>ASTM D6210</p>
            <p style={cardBody}>Relevant heavy-duty coolant specification context for engine cooling systems. It supports technical understanding but does not prove that a specific filter fits a specific engine.</p>
          </div>
          <div>
            <p style={lead}>Selection should reconcile engine configuration, coolant-system architecture, current reference, mounting details, service strategy and available application evidence.</p>
          </div>
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}>FROM COOLING CIRCUIT TO PART</p>
        <h2 style={h2}>Resolve the application in a controlled sequence.</h2>
        <div className="decision-flow" style={decisionFlow}>
          {['1. EQUIPMENT / VEHICLE', '2. ENGINE', '3. COOLING-SYSTEM CONFIGURATION', '4. COOLANT + SERVICE CONTEXT', '5. OEM / FILTER EVIDENCE', '6. VALIDATED ELIMFILTERS PART'].map((step, i) => (
            <div key={step} className="decision-step" style={decisionStep}><span className="decision-step-index">{String(i + 1).padStart(2, '0')}</span><span className="decision-step-label">{step.replace(/^\d+\.\s*/, '')}</span></div>
          ))}
        </div>
      </section>

      <section style={sectionAlt}>
        <p style={eyebrow}>FREQUENT QUESTIONS</p>
        <h2 style={h2}>Cooling System Protection</h2>
        <div className="faq-grid" style={faqGrid}>
          {faqs.map(([question, answer]) => (
            <article key={question} style={faqCard}>
              <h3 style={faqQuestion}>{question}</h3>
              <p style={body}>{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={finalCta}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <p style={eyebrow}>HAVE A COOLING-SYSTEM APPLICATION TO RESOLVE?</p>
          <h2 style={h2}>Confirm the cooling architecture before selecting the coolant filter.</h2>
          <p style={{ ...lead, maxWidth: '780px' }}>Provide the equipment, engine, current filter or OEM reference, mounting details and cooling-system evidence so the application can be resolved correctly.</p>
          <div style={buttonRow}>
            <a href="mailto:applications@elimfilters.com?subject=Cooling%20System%20Application%20Support" style={yellowButton}>IDENTIFY MY COOLING PROTECTION PATH</a>
            <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={darkButton}>PART SEARCH</a>
          </div>
        </div>
      </section>
    </main>
  );
}

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';
const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont, overflowX: 'hidden' };
const hero: CSSProperties = { minHeight: '86vh', position: 'relative', display: 'flex', alignItems: 'center', padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const heroMedia: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.48 };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,.94) 0%, rgba(0,0,0,.74) 54%, rgba(0,0,0,.36) 100%)' };
const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(3rem, 7vw, 6.8rem)', lineHeight: 0.9, letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0, maxWidth: '960px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(1.1rem, 2vw, 1.45rem)', lineHeight: 1.35, maxWidth: '820px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { maxWidth: '820px', color: 'rgba(255,255,255,.72)', lineHeight: 1.72, fontSize: '1rem', marginTop: '1.1rem' };
const eyebrow: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', letterSpacing: '.16em', fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' };
const section: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', maxWidth: '1320px', margin: '0 auto' };
const sectionAlt: CSSProperties = { ...section, maxWidth: 'none', background: 'rgba(255,255,255,.025)', borderTop: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const twoCol: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(2rem,6vw,5rem)', alignItems: 'start' };
const h2: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem,4vw,3.6rem)', lineHeight: .98, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0 };
const h3: CSSProperties = { fontFamily: displayFont, fontSize: '1.05rem', textTransform: 'uppercase', margin: '0 0 .7rem' };
const lead: CSSProperties = { fontSize: 'clamp(1.02rem,1.5vw,1.15rem)', lineHeight: 1.75, color: 'rgba(255,255,255,.82)', margin: 0 };
const body: CSSProperties = { fontSize: '.98rem', lineHeight: 1.72, color: 'rgba(255,255,255,.62)', margin: '1rem 0 0' };
const grid4: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1px', background: 'rgba(255,255,255,.08)', marginTop: '2.2rem' };
const grid2: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1px', background: 'rgba(255,255,255,.07)', marginTop: '2rem' };
const card: CSSProperties = { background: '#050505', padding: '1.5rem' };
const lineCard: CSSProperties = { background: '#000', padding: '1.5rem 1.7rem' };
const cardLabel: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontWeight: 700, fontSize: '.8rem', letterSpacing: '.08em', margin: 0 };
const cardBody: CSSProperties = { color: 'rgba(255,255,255,.62)', lineHeight: 1.65, fontSize: '.94rem', marginTop: '.7rem' };
const architecture: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: '.7rem', marginTop: '2rem' };
const architectureCard: CSSProperties = { minWidth: '190px', flex: '1 1 190px', border: '1px solid rgba(255,255,255,.1)', padding: '1.3rem', display: 'flex', flexDirection: 'column', gap: '.4rem' };
const architectureLink: CSSProperties = { ...architectureCard, textDecoration: 'none', color: '#fff', borderColor: 'rgba(255,241,45,.28)' };
const smallLabel: CSSProperties = { fontFamily: displayFont, fontSize: '.62rem', letterSpacing: '.13em', color: 'rgba(255,255,255,.4)' };
const arrow: CSSProperties = { alignSelf: 'center', color: '#FFF12D', fontSize: '1.3rem', padding: '.2rem' };
const decisionFlow: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '1px', background: 'rgba(255,255,255,.07)', marginTop: '2rem' };
const decisionStep: CSSProperties = { background: '#050505', padding: '1.25rem', fontFamily: displayFont, fontWeight: 700, fontSize: '.78rem', letterSpacing: '.06em' };
const faqGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1px', background: 'rgba(255,255,255,.06)', marginTop: '2rem' };
const faqCard: CSSProperties = { background: '#000', padding: '1.5rem' };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontSize: '1rem', lineHeight: 1.3, margin: 0 };
const buttonRow: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '2rem' };
const yellowButton: CSSProperties = { background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, fontSize: '.78rem', letterSpacing: '.06em', padding: '.95rem 1.2rem' };
const darkButton: CSSProperties = { border: '1px solid rgba(255,255,255,.22)', color: '#fff', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, fontSize: '.78rem', letterSpacing: '.06em', padding: '.95rem 1.2rem' };
const finalCta: CSSProperties = { padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderTop: '1px solid rgba(255,241,45,.18)', background: 'radial-gradient(circle at top left,rgba(255,241,45,.08),transparent 35%),#000' };