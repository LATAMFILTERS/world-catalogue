import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/systems/lubrication/`;

const contamination = [
  ['SOOT + COMBUSTION BYPRODUCTS', 'Combustion-derived contamination carried into the lubricant during engine operation.'],
  ['WEAR DEBRIS', 'Metallic and non-metallic particles generated at bearings, journals, gears and other lubricated interfaces.'],
  ['OXIDATION PRODUCTS', 'Thermal stress and lubricant degradation can create insoluble material that increases the contamination load.'],
  ['SERVICE INGRESS', 'External dirt can enter during oil changes, top-off, filter replacement or service work.'],
] as const;

const protectedComponents = [
  ['Bearings + Journals', 'Lubrication cleanliness helps protect loaded surfaces that depend on a stable oil film and controlled particle exposure.'],
  ['Turbocharger Lubrication', 'Oil supply to turbocharger bearings depends on correct flow, pressure behavior and contamination control.'],
  ['Valve-Train Interfaces', 'Cam, follower and valve-train contact surfaces operate under repeated load and depend on clean lubricant delivery.'],
  ['Oil Galleries + Passages', 'The filter must control contamination without creating unacceptable restriction in the engine lubrication circuit.'],
] as const;

const decision = [
  '1. EQUIPMENT / VEHICLE',
  '2. ENGINE',
  '3. LUBRICATION CIRCUIT',
  '4. DUTY + OIL CONDITION',
  '5. OEM / FILTER EVIDENCE',
  '6. VALIDATED ELIMFILTERS PART',
] as const;

const faqs = [
  ['What is Lubrication Protection?', "Lubrication Protection is the ELIMFILTERS system architecture for controlling lubricant contamination before circulating oil reaches critical bearings, journals, turbocharger interfaces and other lubricated components. It addresses four primary contamination sources: soot and combustion byproducts carried into the oil during engine operation, metallic and non-metallic wear debris generated at bearings and gears, oxidation products created by thermal stress and lubricant degradation, and external dirt introduced during service work such as oil changes or filter replacement. The system protects bearings and journals, turbocharger lubrication supply, valve-train interfaces, and oil galleries and passages, each of which depends on a stable oil film and controlled particle exposure. Lubrication Protection connects oil condition, engine duty, SYNTRAX™ filtration technology and the correct oil-filter family to validated application evidence before a part number is accepted, so filter selection reflects the actual lubrication circuit rather than dimensional similarity alone."],
  ['Which ELIMFILTERS technology is used for lubrication filtration?', "SYNTRAX™ is the primary ELIMFILTERS technology associated with the Lubrication Protection system. It is engineered to capture the contamination that circulates in engine oil — soot and combustion byproducts, metallic and non-metallic wear debris, oxidation products from thermal stress and lubricant degradation, and particulate introduced during service — without compromising the flow and pressure behavior the lubrication circuit depends on. SYNTRAX™ filtration must balance contamination control, holding capacity and structural integrity against changing viscosity, temperature and engine demand, since a lubrication filter that restricts flow can starve bearings, journals, turbocharger interfaces and valve-train surfaces of the stable oil film they require. Because SYNTRAX™ is tied specifically to lubrication rather than fuel, hydraulic or cooling protection, technology identification alone does not replace validated application evidence — filter selection still depends on the engine, duty condition and existing OEM or filter reference before ELIMFILTERS assigns a specific oil-filter part number."],
  ['What contaminants are found in engine oil?', 'Depending on the application and duty cycle, lubricant can carry soot, wear debris, oxidation products and externally introduced particulate. Soot and combustion byproducts are combustion-derived contamination carried into the lubricant during normal engine operation. Wear debris consists of metallic and non-metallic particles generated at bearings, journals, gears and other lubricated interfaces as surfaces experience normal operating load. Oxidation products form when thermal stress and lubricant degradation create insoluble material that increases the overall contamination load circulating in the oil. External dirt can also enter the lubrication circuit during service work itself — oil changes, top-off, filter replacement or other maintenance can introduce particulate that the system did not generate internally. Because these contamination types differ in origin, size and behavior, a lubrication filter must be engineered to capture the actual contamination profile the duty cycle produces, not a generic assumption about what oil typically carries.'],
  ['Is oil-filter selection based only on thread size and dimensions?', "No. Dimensions are useful evidence, but engine application, bypass and sealing configuration, duty, flow requirements and validated cross-reference evidence also matter. A lubrication filter that fits the mounting thread can still be the wrong filter if its bypass valve setting, sealing geometry or media configuration does not match the engine's actual lubrication circuit. Duty cycle affects contamination load and required holding capacity, while flow requirements determine how much restriction the filter can introduce before it compromises the oil pressure and delivery the engine depends on. Two engines that appear similar can still require different filter configurations once bypass behavior, sealing architecture or flow demand are considered. For that reason, ELIMFILTERS treats dimensional and thread-size compatibility as one input among several, and final selection is confirmed against validated cross-reference evidence and the specific engine application rather than visual or dimensional similarity alone."],
  ['Why does restriction matter in an oil filter?', 'The filter must remove contamination while allowing the lubrication circuit to maintain the flow and pressure behavior required by the engine. Excessive restriction — whether from undersized media area, an incorrect bypass valve setting, or a filter design mismatched to the application — can reduce oil delivery to bearings, journals, turbocharger interfaces and valve-train surfaces precisely when they most need a stable oil film. At the same time, a filter engineered only to minimize restriction, without sufficient holding capacity or media efficiency, allows soot, wear debris and oxidation products to keep circulating and accelerate wear. Lubrication Protection therefore treats contamination control and flow preservation as a single balanced requirement rather than two separate specifications, which is why SYNTRAX™ technology and the oil-filter family are selected together against the engine\'s actual duty and oil-condition profile, not against restriction or capacity in isolation.'],
  ['Can the same oil filter be assumed across similar engines?', 'No. Similar engine families or equipment platforms can use different filter configurations. Compatibility should be confirmed against the actual engine and application evidence. Two vehicles or machines that share an engine family designation, or even appear visually identical, can still require different oil filters once factors such as bypass valve setting, sealing configuration, oil gallery pressure requirements or regional production variants are considered. Assuming compatibility from equipment platform alone risks installing a filter that fits the mounting thread but does not match the lubrication circuit\'s actual flow, pressure or contamination-control requirements. ELIMFILTERS therefore validates the equipment or vehicle, the specific engine, the lubrication circuit configuration, duty and oil condition, and any existing OEM or filter evidence in sequence before accepting a part number — the same controlled process used for every lubrication application, rather than treating engine-family similarity as sufficient evidence on its own.'],
  ['Can ELIMFILTERS identify an oil filter from an OEM or competitor part number?', 'Part Search can be used as an identification path, but the final selection should remain tied to validated application evidence rather than assumed visual or dimensional equivalence. Given a known OEM or competitor filter reference, Part Search accelerates the process of locating a candidate ELIMFILTERS cross-reference, which is useful when the equipment or engine details are not immediately available. However, a part number match alone does not confirm that the candidate filter shares the correct bypass valve setting, sealing configuration, media specification or flow behavior for the actual lubrication circuit. For that reason, ELIMFILTERS treats a resolved cross-reference as one piece of application evidence among several — equipment, engine, duty, oil condition and OEM reference are still confirmed together before a validated ELIMFILTERS part number is accepted, keeping identification fast without bypassing the application-validation step that protects against an incorrect filter.'],
] as const;

export function LubricationSystemPage() {
  const schemas = [
    {
      '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${PAGE_URL}#webpage`,
      name: 'Lubrication Protection', url: PAGE_URL,
      description: 'Lubrication filtration architecture for controlling soot, wear debris, oxidation products and service contamination before oil reaches critical engine components.',
      isPartOf: { '@id': `${BASE_URL}/#website` }, publisher: { '@id': `${BASE_URL}/#organization` },
      about: [
        { '@type': 'Thing', name: 'Engine oil filtration' },
        { '@type': 'Thing', name: 'Lubricant contamination control' },
        { '@type': 'Thing', name: 'Bearing protection' },
        { '@type': 'Thing', name: 'Oil filter application identification' },
      ],
      mentions: [
        { '@type': 'Thing', name: 'SYNTRAX' },
        { '@type': 'Thing', name: 'Soot contamination' },
        { '@type': 'Thing', name: 'Wear debris' },
        { '@type': 'Thing', name: 'Oxidation byproducts' },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Systems', item: `${BASE_URL}/systems/` },
        { '@type': 'ListItem', position: 3, name: 'Lubrication Protection', item: PAGE_URL },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'ItemList', name: 'Lubrication Protection architecture',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Lubrication Protection', url: PAGE_URL },
        { '@type': 'ListItem', position: 2, name: 'SYNTRAX', url: `${BASE_URL}/technologies/syntrax/` },
        { '@type': 'ListItem', position: 3, name: 'Oil Filters', url: `${BASE_URL}/families/oil-filters/` },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
    },
  ];

  return (
    <main style={main}>
      {schemas.map((schema, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
      <PageHeader breadcrumbs={[{ label: 'Systems', href: '/systems/' }]} currentPage="Lubrication Protection" />

      <section style={hero}>
        <img src="/images/oil-hand.avif" alt="Lubrication protection and engine oil filtration" style={heroMedia} />
        <div style={heroOverlay} />
        <div style={heroInner}>
          <p style={eyebrow}>LUBRICANT CONTAMINATION CONTROL</p>
          <h1 style={heroTitle}>Lubrication<br /><span style={{ color: '#FFF12D' }}>Protection</span></h1>
          <p style={heroPromise}>Control contamination while preserving the oil flow and pressure behavior the engine depends on.</p>
          <p style={heroLead}>ELIMFILTERS Lubrication Protection connects oil condition, engine duty, SYNTRAX™ filtration technology and the correct oil-filter family to validated application evidence before a part number is accepted.</p>
          <div style={buttonRow}>
            <Link href="#lubrication-path" style={yellowButton}>IDENTIFY THE LUBRICATION PATH</Link>
            <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={darkButton}>FIND MY FILTER</a>
          </div>
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}>DIRECT ANSWER</p>
        <div style={twoCol}>
          <h2 style={h2}>Oil filtration is a flow-and-cleanliness decision, not only a filter-size decision.</h2>
          <div>
            <p style={lead}>Lubrication Protection controls contamination circulating in the oil while respecting the engine lubrication circuit's requirement for stable delivery.</p>
            <p style={body}>The engineering sequence is explicit: engine and duty condition → contamination exposure → lubrication circuit → SYNTRAX™ technology → oil-filter family → validated part number.</p>
          </div>
        </div>
      </section>

      <section id="lubrication-path" style={sectionAlt}>
        <p style={eyebrow}>CONTAMINATION PATHWAYS</p>
        <h2 style={h2}>The lubricant becomes contaminated while the engine is working.</h2>
        <div style={grid4}>{contamination.map(([title, text]) => <article key={title} style={card}><p style={cardLabel}>{title}</p><p style={cardBody}>{text}</p></article>)}</div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div><p style={eyebrow}>ENGINEERING PRINCIPLE</p><h2 style={h2}>Capture debris without compromising lubricant delivery.</h2></div>
          <div><p style={lead}>A lubrication filter must balance contamination control, holding capacity, structural integrity and restriction across changing viscosity, temperature and engine demand.</p><p style={body}>For that reason, visual similarity or dimensional fit alone cannot establish application compatibility.</p></div>
        </div>
      </section>

      <section style={sectionAlt}>
        <p style={eyebrow}>WHAT THE SYSTEM PROTECTS</p>
        <h2 style={h2}>Clean lubricant supports the interfaces carrying engine load.</h2>
        <div style={grid2}>{protectedComponents.map(([title, text]) => <article key={title} style={lineCard}><h3 style={h3}>{title}</h3><p style={body}>{text}</p></article>)}</div>
      </section>

      <section style={section}>
        <p style={eyebrow}>SYSTEM → TECHNOLOGY → FAMILY</p>
        <h2 style={h2}>One controlled architecture from oil condition to product.</h2>
        <div style={architecture}>
          <div style={architectureBox}><span style={cardLabel}>SYSTEM</span><strong>Lubrication Protection</strong></div>
          <div style={architectureArrow}>→</div>
          <Link href="/technologies/syntrax/" style={architectureLink}><span style={cardLabel}>TECHNOLOGY</span><strong>SYNTRAX™</strong></Link>
          <div style={architectureArrow}>→</div>
          <Link href="/families/oil-filters/" style={architectureLink}><span style={cardLabel}>PRODUCT FAMILY</span><strong>Oil Filters</strong></Link>
        </div>
      </section>

      <section style={sectionAlt}>
        <p style={eyebrow}>FROM OIL CONDITION TO PART</p>
        <h2 style={h2}>Resolve the application in a controlled sequence.</h2>
        <div className="decision-flow" style={decisionFlow}>{decision.map((step, i) => <div key={step} className="decision-step" style={decisionStep}><span className="decision-step-index">{String(i + 1).padStart(2, '0')}</span><span className="decision-step-label">{step.replace(/^\d+\.\s*/, '')}</span></div>)}</div>
      </section>

      <section style={section}>
        <p style={eyebrow}>APPLICATION EVIDENCE</p>
        <div style={twoCol}>
          <h2 style={h2}>A valid cross-reference must resolve more than dimensions.</h2>
          <div><p style={lead}>Useful evidence includes equipment or vehicle, engine, existing OEM or filter number, thread and seal configuration, dimensional data and the actual duty profile.</p><p style={body}>Part Search can accelerate identification, but compatibility remains an application decision.</p></div>
        </div>
      </section>

      <section style={sectionAlt}>
        <p style={eyebrow}>FREQUENT QUESTIONS</p><h2 style={h2}>Lubrication Protection</h2>
        <div className="faq-grid" style={faqGrid}>{faqs.map(([q, a]) => <article key={q} style={faqCard}><h3 style={faqQuestion}>{q}</h3><p style={body}>{a}</p></article>)}</div>
      </section>

      <section style={finalCta}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <p style={eyebrow}>HAVE AN OIL-FILTRATION APPLICATION TO RESOLVE?</p>
          <h2 style={h2}>Identify the engine and lubrication path before accepting the part number.</h2>
          <p style={{ ...lead, maxWidth: '780px' }}>Use engine, duty, oil-filter configuration and available OEM evidence to identify the appropriate ELIMFILTERS lubrication protection path.</p>
          <div style={buttonRow}>
            <a href="mailto:applications@elimfilters.com?subject=Lubrication%20Application%20Support" style={yellowButton}>IDENTIFY MY LUBRICATION PROTECTION PATH</a>
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
const hero: CSSProperties = { minHeight: '86vh', position: 'relative', display: 'flex', alignItems: 'center', padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,.08)' };
const heroMedia: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .5 };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,.94), rgba(0,0,0,.7) 55%, rgba(0,0,0,.3))' };
const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(3rem,7vw,6.8rem)', lineHeight: .9, letterSpacing: '-.05em', textTransform: 'uppercase', margin: 0 };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(1.1rem,2vw,1.45rem)', maxWidth: '800px', lineHeight: 1.35, margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem,1.5vw,1.13rem)', lineHeight: 1.75, color: 'rgba(255,255,255,.7)', maxWidth: '820px', marginTop: '1rem' };
const section: CSSProperties = { padding: 'clamp(4rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', maxWidth: '1320px', margin: '0 auto' };
const sectionAlt: CSSProperties = { ...section, maxWidth: 'none', background: 'rgba(255,255,255,.025)', borderTop: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const twoCol: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(2rem,6vw,5rem)' };
const eyebrow: CSSProperties = { fontFamily: displayFont, fontSize: '.7rem', letterSpacing: '.18em', fontWeight: 700, color: '#FFF12D', textTransform: 'uppercase', marginBottom: '1rem' };
const h2: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem,4vw,3.7rem)', lineHeight: .98, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0 };
const h3: CSSProperties = { fontFamily: displayFont, fontSize: '1.05rem', textTransform: 'uppercase', margin: 0 };
const lead: CSSProperties = { fontSize: '1.08rem', lineHeight: 1.75, color: 'rgba(255,255,255,.78)', margin: 0 };
const body: CSSProperties = { fontSize: '.98rem', lineHeight: 1.75, color: 'rgba(255,255,255,.6)' };
const grid4: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '1px', background: 'rgba(255,255,255,.08)', marginTop: '2rem' };
const grid2: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '1px', background: 'rgba(255,255,255,.08)', marginTop: '2rem' };
const card: CSSProperties = { background: '#000', padding: '1.6rem', flex: '1 1 220px', minWidth: 0 };
const lineCard: CSSProperties = { background: '#000', padding: '1.8rem', flex: '1 1 300px', minWidth: 0 };
const cardLabel: CSSProperties = { fontFamily: displayFont, fontSize: '.68rem', letterSpacing: '.13em', color: '#FFF12D', textTransform: 'uppercase' };
const cardBody: CSSProperties = { fontSize: '.92rem', lineHeight: 1.65, color: 'rgba(255,255,255,.58)' };
const architecture: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'stretch', marginTop: '2rem' };
const architectureBox: CSSProperties = { border: '1px solid rgba(255,255,255,.12)', padding: '1.4rem', minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '.6rem' };
const architectureLink: CSSProperties = { ...architectureBox, textDecoration: 'none', color: '#fff', borderColor: 'rgba(255,241,45,.28)' };
const architectureArrow: CSSProperties = { display: 'flex', alignItems: 'center', fontSize: '1.5rem', color: '#FFF12D' };
const decisionFlow: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '1px', background: 'rgba(255,255,255,.08)', marginTop: '2rem' };
const decisionStep: CSSProperties = { background: '#000', padding: '1.4rem', fontFamily: displayFont, fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', flex: '1 1 190px', minWidth: 0 };
const faqGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1px', background: 'rgba(255,255,255,.08)', marginTop: '2rem' };
const faqCard: CSSProperties = { background: '#000', padding: '1.7rem' };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontSize: '1rem', lineHeight: 1.35, margin: 0, textTransform: 'uppercase' };
const buttonRow: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '2rem' };
const yellowButton: CSSProperties = { background: '#FFF12D', color: '#000', textDecoration: 'none', padding: '.95rem 1.25rem', fontFamily: displayFont, fontSize: '.72rem', fontWeight: 800, letterSpacing: '.07em' };
const darkButton: CSSProperties = { ...yellowButton, background: 'rgba(0,0,0,.35)', color: '#fff', border: '1px solid rgba(255,255,255,.24)' };
const finalCta: CSSProperties = { padding: 'clamp(5rem,10vw,8rem) clamp(1.25rem,6vw,6rem)', borderTop: '1px solid rgba(255,241,45,.18)', background: 'radial-gradient(circle at top left, rgba(255,241,45,.08), transparent 35%)' };