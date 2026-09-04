import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/systems/fuel-cleanliness/`;

const pathways = [
  ['PARTICULATE CONTROL', 'Hard particles + storage debris + transfer contamination', 'SYNTAPORE™', '/technologies/syntapore/'],
  ['FUEL / WATER SEPARATION', 'Free water + entrained moisture before sensitive fuel components', 'HYDROCORE™', '/technologies/hydrocore/'],
  ['TURBINE-SERIES SEPARATION', 'Multi-stage fuel conditioning in applicable FH / FG turbine systems', 'TURBOCORE™', '/technologies/turbocore/'],
] as const;

const protectedFunctions = [
  ['Fuel Supply Path', 'Primary and secondary filtration reduce particulate load before fuel reaches precision pumps and injectors.'],
  ['Water Control', 'Fuel/water separation addresses free water and moisture exposure before it enters downstream fuel-system components.'],
  ['Stored Fuel Integrity', 'Storage, transfer and condensation can introduce contamination before the engine is even started, making upstream control part of system protection.'],
  ['Injection-System Protection', 'Modern diesel fuel systems use tight clearances, so product selection has to reflect the actual engine, fuel path and validated application evidence.'],
] as const;

const families = [
  ['Primary Fuel Filters', 'primary-fuel', 'First-stage particulate control in applicable diesel fuel systems'],
  ['Secondary Fuel Filters', 'secondary-fuel', 'Downstream fine filtration where the application uses a secondary stage'],
  ['Fuel / Water Separators', 'fuel-water-separators', 'Water-separation protection for applicable diesel fuel systems'],
  ['Fuel Turbine Elements', 'fuel-turbine', 'Replacement elements for applicable FH / FG turbine-series fuel-separation systems'],
] as const;

const standards = [
  ['ASTM D6304', 'Water determination is used as evidence for fuel moisture condition and belongs to the applicable fuel-analysis context.'],
  ['ISO 12937', 'Water content in petroleum products is a distinct measurement domain that supports fuel-condition evaluation.'],
  ['ISO 16332', 'Fuel/water separation performance belongs to the applicable separator and product-family context rather than every fuel filter indiscriminately.'],
] as const;

const faqs = [
  ['What is Fuel Cleanliness Protection?', 'It is the ELIMFILTERS protection-system architecture for controlling particulate contamination and water before diesel fuel reaches sensitive pumps, injectors and downstream fuel components. The system addresses fuel contamination through three pathways: particulate control against hard particles, storage debris and transfer contamination; fuel/water separation against free water and entrained moisture before sensitive fuel components; and, in applicable systems, turbine-series separation for multi-stage fuel conditioning in FH/FG turbine architecture. These pathways connect to specific ELIMFILTERS technologies — SYNTAPORE™, HYDROCORE™ and TURBOCORE™ — each governing a distinct function rather than a single universal fuel filter. Fuel Cleanliness Protection also treats stored fuel integrity as part of the system, since storage, transfer and condensation can introduce contamination before the engine is even started. Because modern diesel fuel systems operate with tight injector clearances, product selection reflects the actual engine, fuel path and validated application evidence rather than a generic fuel-filter assumption.'],
  ['Which ELIMFILTERS technologies belong to Fuel Cleanliness Protection?', 'SYNTAPORE™ supports particulate fuel filtration, HYDROCORE™ supports fuel/water separation, and TURBOCORE™ supports applicable turbine-series fuel-separation systems. SYNTAPORE™ governs the particulate-control pathway, removing hard particles, storage debris and transfer contamination before fuel reaches the primary and secondary filtration stages. HYDROCORE™ governs the fuel/water separation pathway, addressing free water and entrained moisture before it can reach sensitive downstream components such as precision pumps and injectors. TURBOCORE™ is reserved specifically for applicable FH/FG turbine-series fuel-separation systems, covering the multi-stage fuel conditioning that turbine-style housings require, and is not used outside that dedicated product architecture. Because these three technologies address different contamination mechanisms — particulate, water and turbine-specific multi-stage conditioning — a fuel-cleanliness application typically uses the technology matched to its actual fuel-system configuration rather than treating any one of the three as a universal fuel-filtration answer.'],
  ['Is every fuel filter a fuel/water separator?', "No. Particulate filtration and fuel/water separation are different functions. The product family and application must confirm whether water separation is required. Particulate filtration, governed by SYNTAPORE™, is designed to remove hard particles, storage debris and transfer contamination from the fuel supply path — it does not address free water or entrained moisture. Fuel/water separation, governed by HYDROCORE™, is a distinct function built specifically to remove water and moisture before they reach sensitive fuel-system components; a filter without separator media will not perform this role even if it looks similar to a separator housing. The ELIMFILTERS product family — Primary Fuel Filters, Secondary Fuel Filters, Fuel/Water Separators and Fuel Turbine Elements — reflects this distinction directly, so identifying which family an application actually requires is part of confirming the correct filtration stage rather than assuming any fuel filter performs both particulate control and water separation."],
  ['Why does stored fuel matter?', 'Fuel can accumulate water, sediment and transfer contamination before it reaches the engine. Storage and handling conditions therefore form part of the contamination path. Bulk storage tanks are exposed to condensation as ambient temperature changes, which introduces free water into fuel before it is ever transferred to the vehicle or equipment. Sediment and particulate can also settle or accumulate in storage and transfer equipment over time, and this contamination moves downstream with the fuel during each transfer or refueling event. Because this contamination originates before the engine is started, ELIMFILTERS treats stored fuel integrity as an upstream extension of Fuel Cleanliness Protection rather than an issue the fuel system alone can resolve. Primary and secondary filtration, together with fuel/water separation where applicable, are engineered to intercept this accumulated contamination and moisture before it reaches precision pumps and injectors — but effective protection still depends on reasonable storage and handling practices upstream of the vehicle or equipment.'],
  ['Can a fuel filter be selected only from a cross reference?', 'A cross reference is evidence, not the entire application decision. Engine, fuel-system configuration, filtration stage, separator function, dimensions and validated application evidence should agree. A resolved cross reference confirms that a candidate ELIMFILTERS part matches a known OEM or competitor number, which is useful for narrowing the search, but it does not by itself confirm whether the application requires particulate filtration alone or fuel/water separation, or which filtration stage — primary or secondary — the position actually performs. Engine and fuel-system configuration determine injector clearance sensitivity and the appropriate filtration target, while dimensions confirm physical fit within the housing. Because SYNTAPORE™, HYDROCORE™ and TURBOCORE™ govern different functions within the same broader system, a cross-reference match that overlooks separator function or filtration stage risks installing a filter that fits but does not perform the role the fuel system actually needs, which is why ELIMFILTERS confirms these factors together before validating a part number.'],
  ['What information is useful for fuel-filter identification?', 'Vehicle or equipment, engine, fuel-system stage, existing filter or OEM number, dimensions, separator configuration and any known service conditions are useful inputs. Vehicle or equipment and engine establish the fuel-system architecture and injector sensitivity that determine which filtration target is appropriate. Fuel-system stage — whether primary or secondary filtration is required — determines which ELIMFILTERS product family applies, since primary and secondary filters serve different positions in the fuel supply path. An existing filter or OEM number accelerates identification through Part Search, though the match should still be confirmed against separator configuration, since not every position in the fuel system requires fuel/water separation. Dimensions confirm physical compatibility with the housing, and any known service conditions — such as recurring water contamination, storage practices or turbine-series equipment — help determine whether HYDROCORE™ separation or TURBOCORE™ turbine-series elements are relevant to the specific application, rather than defaulting to particulate filtration alone.'],
  ['Where does the turbine-series product line fit?', 'Applicable FH / FG turbine-series fuel-separation systems belong to Fuel Cleanliness Protection and use TURBOCORE™ replacement elements within that specific product architecture. Turbine-series housings perform multi-stage fuel conditioning distinct from standard fuel/water separators, which is why they are governed by TURBOCORE™ rather than the HYDROCORE™ technology used for standard non-turbine separation. Because turbine-series housings and their dedicated replacement elements follow their own approved configuration, they are not interchangeable with standard fuel/water separator or primary/secondary filter families even when dimensions appear similar. The Fuel Turbine Elements product family exists specifically to provide validated replacement elements for applicable FH/FG turbine-series systems, keeping the turbine-specific architecture separate from general particulate filtration and standard water separation. Identifying whether an application actually uses turbine-series equipment — rather than assuming standard fuel/water separation applies — is therefore an important early step in fuel-filter identification for equipment built around this product line.'],
] as const;

export function FuelCleanlinessSystemPage() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${PAGE_URL}#webpage`,
      name: 'Fuel Cleanliness Protection',
      url: PAGE_URL,
      description: 'Fuel cleanliness protection architecture for particulate filtration, fuel/water separation, stored-fuel contamination control and diesel injection-system protection.',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      publisher: { '@id': `${BASE_URL}/#organization` },
      about: [
        { '@type': 'Thing', name: 'Diesel fuel filtration' },
        { '@type': 'Thing', name: 'Fuel water separation' },
        { '@type': 'Thing', name: 'Stored fuel contamination' },
        { '@type': 'Thing', name: 'Diesel injection system protection' },
      ],
      mentions: [
        { '@type': 'Thing', name: 'SYNTAPORE' },
        { '@type': 'Thing', name: 'HYDROCORE' },
        { '@type': 'Thing', name: 'TURBOCORE' },
        { '@type': 'Thing', name: 'ASTM D6304' },
        { '@type': 'Thing', name: 'ISO 12937' },
        { '@type': 'Thing', name: 'ISO 16332' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Systems', item: `${BASE_URL}/systems/` },
        { '@type': 'ListItem', position: 3, name: 'Fuel Cleanliness Protection', item: PAGE_URL },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Fuel Cleanliness Protection product families',
      itemListElement: families.map((family, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: family[0],
        url: `${BASE_URL}/families/${family[1]}/`,
      })),
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

  return (
    <main style={main}>
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <PageHeader breadcrumbs={[{ label: 'Systems', href: '/systems/' }]} currentPage="Fuel Cleanliness Protection" />

      <section style={hero}>
        <img src="/images/turbine-plant.avif" alt="Fuel cleanliness protection system" style={heroMedia} />
        <div style={heroOverlay} />
        <div style={heroInner}>
          <p style={eyebrow}>DIESEL FUEL CONTAMINATION CONTROL</p>
          <h1 style={heroTitle}>Fuel Cleanliness<br /><span style={{ color: '#FFF12D' }}>Protection</span></h1>
          <p style={heroPromise}>Control particles and water before contaminated fuel reaches precision pumps, injectors and downstream fuel-system components.</p>
          <p style={heroLead}>ELIMFILTERS separates particulate filtration, fuel/water separation and applicable turbine-series fuel conditioning into distinct functions within one fuel-protection architecture. The correct path depends on the engine, fuel-system stage, contamination exposure and validated application evidence.</p>
          <div style={buttonRow}>
            <Link href="#fuel-path" style={yellowButton}>IDENTIFY THE FUEL PATH</Link>
            <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={darkButton}>FIND MY FILTER</a>
          </div>
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}>DIRECT ANSWER</p>
        <div style={twoCol}>
          <h2 style={h2}>Fuel cleanliness is a system decision, not a single-filter decision.</h2>
          <div>
            <p style={lead}>Fuel Cleanliness Protection organizes the filtration stages that control particulate contamination and water before diesel fuel reaches sensitive downstream components.</p>
            <p style={body}>Primary filtration, secondary filtration, fuel/water separation and turbine-series separation may exist in different combinations. They should not be treated as interchangeable simply because every component is installed in the fuel path.</p>
          </div>
        </div>
      </section>

      <section id="fuel-path" style={sectionAlt}>
        <p style={eyebrow}>PROTECTION PATHWAYS</p>
        <h2 style={h2}>Start with the contamination function the fuel system actually requires.</h2>
        <div style={grid3}>
          {pathways.map(([title, exposure, technology, href]) => (
            <article key={title} style={card}>
              <p style={cardLabel}>{title}</p>
              <p style={cardBody}>{exposure}</p>
              <div style={arrow}>↓</div>
              <Link href={href} style={techLink}>{technology}</Link>
            </article>
          ))}
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div>
            <p style={eyebrow}>ENGINEERING PRINCIPLE</p>
            <h2 style={h2}>Particles and water create different risks and require different protection mechanisms.</h2>
          </div>
          <div>
            <p style={lead}>A filter that captures particulate is not automatically a fuel/water separator. Likewise, a separator architecture should not be assumed from external dimensions or cross-reference similarity alone.</p>
            <p style={body}>ELIMFILTERS keeps the hierarchy explicit: fuel contamination problem → protection function → technology → product family → validated part number.</p>
          </div>
        </div>
      </section>

      <section style={sectionAlt}>
        <p style={eyebrow}>WHAT THE SYSTEM PROTECTS</p>
        <h2 style={h2}>Fuel cleanliness starts before the high-pressure circuit.</h2>
        <div style={grid2}>
          {protectedFunctions.map(([title, text]) => (
            <article key={title} style={lineCard}>
              <h3 style={h3}>{title}</h3>
              <p style={body}>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}>PRODUCT ARCHITECTURE</p>
        <h2 style={h2}>From fuel-protection function to physical filtration component.</h2>
        <div style={familyGrid}>
          {families.map(([name, slug, purpose]) => (
            <Link key={slug} href={`/families/${slug}/`} style={familyCard}>
              <h3 style={h3}>{name}</h3>
              <p style={body}>{purpose}</p>
              <span style={smallLink}>VIEW PRODUCT FAMILY →</span>
            </Link>
          ))}
        </div>
      </section>

      <section style={sectionAlt}>
        <p style={eyebrow}>VALIDATION CONTEXT</p>
        <h2 style={h2}>Keep measurement standards tied to the fuel function they actually describe.</h2>
        <p style={{ ...lead, maxWidth: '840px' }}>Water measurement, fuel-condition evidence and separator performance are related but not interchangeable. Standards should be applied at the correct product-family and test context.</p>
        <div style={grid3}>
          {standards.map(([name, text]) => (
            <article key={name} style={card}>
              <p style={cardLabel}>{name}</p>
              <p style={cardBody}>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}>FROM FUEL CONDITION TO PART</p>
        <h2 style={h2}>Resolve the application in a controlled sequence.</h2>
        <div className="decision-flow" style={decisionFlow}>
          {['1. EQUIPMENT / VEHICLE', '2. ENGINE + FUEL SYSTEM', '3. FILTRATION STAGE', '4. WATER-SEPARATION REQUIREMENT', '5. OEM / FILTER EVIDENCE', '6. VALIDATED ELIMFILTERS PART'].map((step, i) => (
            <div key={step} className="decision-step" style={decisionStep}><span className="decision-step-index">{String(i + 1).padStart(2, '0')}</span><span className="decision-step-label">{step.replace(/^\d+\.\s*/, '')}</span></div>
          ))}
        </div>
      </section>

      <section style={sectionAlt}>
        <p style={eyebrow}>FREQUENT QUESTIONS</p>
        <h2 style={h2}>Fuel Cleanliness Protection</h2>
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
          <p style={eyebrow}>HAVE A FUEL APPLICATION TO RESOLVE?</p>
          <h2 style={h2}>Identify the fuel-protection function before selecting the part.</h2>
          <p style={{ ...lead, maxWidth: '800px' }}>Use equipment, engine, fuel-system stage, separator configuration, operating conditions and available OEM or filter evidence to identify the correct ELIMFILTERS fuel-protection path.</p>
          <div style={buttonRow}>
            <a href="mailto:applications@elimfilters.com?subject=Fuel%20Cleanliness%20Application%20Support" style={yellowButton}>IDENTIFY MY FUEL PROTECTION PATH</a>
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
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,.94) 0%, rgba(0,0,0,.74) 54%, rgba(0,0,0,.34) 100%)' };
const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(3rem, 7vw, 6.8rem)', lineHeight: 0.9, letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0, maxWidth: '960px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(1.1rem, 2vw, 1.45rem)', lineHeight: 1.35, maxWidth: '840px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem, 1.6vw, 1.15rem)', lineHeight: 1.72, maxWidth: '850px', color: 'rgba(255,255,255,.72)', margin: '1.1rem 0 0' };
const section: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', maxWidth: '1320px', margin: '0 auto' };
const sectionAlt: CSSProperties = { ...section, maxWidth: 'none', background: 'rgba(255,255,255,.018)', borderTop: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const twoCol: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 'clamp(2rem,6vw,5rem)', alignItems: 'start' };
const eyebrow: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: '.72rem', letterSpacing: '.16em', color: '#FFF12D', textTransform: 'uppercase', margin: '0 0 1rem' };
const h2: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2rem,4.2vw,3.8rem)', lineHeight: .96, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0 };
const h3: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase', margin: '0 0 .7rem' };
const lead: CSSProperties = { fontSize: 'clamp(1.02rem,1.6vw,1.18rem)', lineHeight: 1.75, color: 'rgba(255,255,255,.78)', margin: 0 };
const body: CSSProperties = { fontSize: '.98rem', lineHeight: 1.72, color: 'rgba(255,255,255,.6)', margin: '1rem 0 0' };
const grid3: CSSProperties = { maxWidth: '1180px', margin: '2.4rem auto 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1px', background: 'rgba(255,255,255,.08)' };
const grid2: CSSProperties = { maxWidth: '1180px', margin: '2.4rem auto 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1px', background: 'rgba(255,255,255,.07)' };
const card: CSSProperties = { background: '#000', padding: '1.6rem', flex: '1 1 250px', maxWidth: '400px', minWidth: 0 };
const lineCard: CSSProperties = { background: '#000', padding: '1.7rem', flex: '1 1 300px', maxWidth: '480px', minWidth: 0 };
const cardLabel: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: '.76rem', letterSpacing: '.1em', color: '#FFF12D', margin: 0 };
const cardBody: CSSProperties = { fontSize: '.92rem', lineHeight: 1.65, color: 'rgba(255,255,255,.58)', margin: '.8rem 0 0' };
const arrow: CSSProperties = { color: 'rgba(255,255,255,.28)', fontSize: '1.4rem', margin: '1rem 0 .65rem' };
const techLink: CSSProperties = { fontFamily: displayFont, fontWeight: 700, color: '#fff', textDecoration: 'none', textTransform: 'uppercase', fontSize: '1.08rem' };
const familyGrid: CSSProperties = { maxWidth: '1180px', margin: '2.4rem auto 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1px', background: 'rgba(255,255,255,.07)' };
const familyCard: CSSProperties = { background: '#000', padding: '1.6rem', textDecoration: 'none', color: '#fff', display: 'block', flex: '1 1 240px', maxWidth: '380px', minWidth: 0 };
const smallLink: CSSProperties = { display: 'inline-block', marginTop: '1.2rem', fontFamily: displayFont, fontSize: '.66rem', fontWeight: 700, letterSpacing: '.12em', color: '#FFF12D' };
const decisionFlow: CSSProperties = { maxWidth: '1180px', margin: '2.2rem auto 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1px', background: 'rgba(255,255,255,.08)' };
const decisionStep: CSSProperties = { background: '#000', padding: '1.25rem', fontFamily: displayFont, fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', color: 'rgba(255,255,255,.72)', flex: '1 1 180px', maxWidth: '290px', minWidth: 0 };
const faqGrid: CSSProperties = { maxWidth: '1180px', margin: '2.2rem auto 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1px', background: 'rgba(255,255,255,.07)' };
const faqCard: CSSProperties = { background: '#000', padding: '1.6rem' };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: '1rem', lineHeight: 1.3, margin: 0 };
const finalCta: CSSProperties = { padding: 'clamp(5rem,9vw,8rem) clamp(1.25rem,6vw,6rem)', background: 'linear-gradient(180deg,#050505,#000)', borderTop: '1px solid rgba(255,241,45,.16)' };
const buttonRow: CSSProperties = { display: 'flex', gap: '.9rem', flexWrap: 'wrap', marginTop: '2rem' };
const yellowButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', padding: '.95rem 1.35rem', fontFamily: displayFont, fontWeight: 700, fontSize: '.76rem', letterSpacing: '.08em', textTransform: 'uppercase' };
const darkButton: CSSProperties = { ...yellowButton, background: 'rgba(255,255,255,.06)', color: '#fff', border: '1px solid rgba(255,255,255,.15)' };
