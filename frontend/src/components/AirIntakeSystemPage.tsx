import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/systems/air-intake/`;

const domains = [
  ['ENGINE AIR INTAKE', 'Ambient dust + soot + fibers + airborne debris', 'MACROCORE™', '/technologies/macrocore/'],
  ['AIR-CLEANER HOUSING', 'Sealing + airflow routing + filter support', 'INTEKCORE™', '/technologies/intekcore/'],
  ['CABIN AIR', 'Operator-facing particulate and airborne contaminants', 'MICROKAPPA™', '/technologies/microkappa/'],
  ['COMPRESSED AIR DRYING', 'Moisture and contamination in pneumatic air paths', 'DRYCORE™', '/technologies/drycore/'],
] as const;

const assets = [
  ['Combustion Air Path', 'Primary and secondary air filtration protect the engine intake path before airborne contamination reaches internal components.'],
  ['Air-Cleaner Housing', 'Housing geometry, sealing interfaces and element support form part of the contamination boundary and must match the intended airflow path.'],
  ['Operator Cabin', 'Cabin filtration addresses particulate entering HVAC and ventilation paths where the application includes a filtered operator environment.'],
  ['Pneumatic Air System', 'Air-dryer protection controls moisture in applicable compressed-air systems and is selected separately from engine-intake filtration.'],
] as const;

const standards = [
  ['ISO 5011', 'Engine air-cleaner and intake-filter performance is evaluated at the applicable family level.'],
  ['ISO 11155', 'Cabin-air filtration belongs to a separate test domain from engine-intake filtration.'],
  ['ISO 8573-1', 'Compressed-air cleanliness is a distinct pneumatic-air domain and is not interchangeable with engine-intake standards.'],
] as const;

const faqs = [
  ['What is Air Intake & Airflow Protection?', 'It is the ELIMFILTERS protection-system domain that organizes engine intake filtration, air-cleaner housings, cabin-air filtration and applicable compressed-air drying around the airflow path they protect. Four distinct airflow domains sit within this system: engine air intake, which controls ambient dust, soot, fibers and airborne debris; air-cleaner housing, which governs sealing, airflow routing and filter support; cabin air, which addresses operator-facing particulate and airborne contaminants; and compressed air drying, which manages moisture and contamination in applicable pneumatic air paths. Each domain connects to a dedicated ELIMFILTERS technology — MACROCORE™, INTEKCORE™, MICROKAPPA™ and DRYCORE™ — rather than a single universal air filter covering every airflow path. Because these domains protect different assets with different contamination profiles, product selection follows the specific equipment, protected airflow path and housing configuration rather than assuming one air-filtration approach applies across engine intake, cabin and compressed-air systems alike.'],
  ['Is cabin-air filtration the same as engine air filtration?', 'No. Both belong to the Air Intake & Airflow Protection architecture, but they protect different airflow paths, use different product families and are evaluated against different application requirements. Engine air-intake filtration protects the combustion air path, where primary and secondary filtration prevent ambient dust, soot, fibers and airborne debris from reaching internal engine components, and is evaluated under ISO 5011 engine air-cleaner and intake-filter performance testing. Cabin-air filtration instead protects the operator cabin, addressing particulate entering HVAC and ventilation paths where the application includes a filtered operator environment, and is evaluated under the separate ISO 11155 cabin-air test domain. Because contamination exposure, airflow volume and filtration targets differ significantly between an engine\'s combustion air path and an operator\'s cabin ventilation system, MACROCORE™ engine-intake technology and MICROKAPPA™ cabin-air technology are not interchangeable, even when both fall under the same broader Air Intake & Airflow Protection system.'],
  ['Which ELIMFILTERS technology protects engine air intake?', "MACROCORE™ is the primary ELIMFILTERS technology for engine air-intake filtration within this protection system. It is engineered to protect the combustion air path — the primary and secondary filtration stages that prevent ambient dust, soot, fibers and other airborne debris from reaching internal engine components before combustion. Engine air-cleaner and intake-filter performance in this domain is evaluated under ISO 5011, a standard specific to engine-intake filtration and distinct from the cabin-air and compressed-air test domains used elsewhere in the Air Intake & Airflow Protection system. Because the air-cleaner housing itself — its sealing, airflow routing and filter support — forms part of the contamination boundary, MACROCORE™ identification is combined with the housing configuration governed by INTEKCORE™ and with the equipment's actual duty environment before a specific engine air-intake filter part number is validated, rather than relying on the technology name alone."],
  ['What role does INTEKCORE™ play?', 'INTEKCORE™ is associated with air-cleaner housings and the physical airflow architecture that supports sealing, routing and filter installation. Rather than filtering the incoming air directly, INTEKCORE™ governs the housing geometry, sealing interfaces and element support that determine whether an engine air-intake filter can actually perform as intended — a properly rated MACROCORE™ filter element still depends on correct housing sealing and airflow routing to prevent unfiltered air from bypassing the media. This distinction matters because air-cleaner housing issues can produce symptoms that resemble a filtration problem, such as reduced airflow or contamination reaching the engine, even when the filter element itself is correctly specified. Because housing configuration varies by equipment and installation, INTEKCORE™ identification is confirmed against the specific air-cleaner housing design and its sealing and routing requirements, working alongside MACROCORE™ engine-intake filtration rather than as a standalone filtration technology.'],
  ['Where do MICROKAPPA™ and DRYCORE™ fit?', 'MICROKAPPA™ supports cabin-air filtration. DRYCORE™ supports air-dryer filtration in applicable compressed-air systems. They are supporting technologies inside the broader Air Intake & Airflow Protection domain. MICROKAPPA™ protects the operator cabin by addressing particulate entering HVAC and ventilation paths, evaluated under the separate ISO 11155 cabin-air test domain rather than engine-intake standards. DRYCORE™ addresses a different airflow path entirely — moisture and contamination in applicable pneumatic air systems — evaluated under ISO 8573-1, a compressed-air cleanliness standard that is not interchangeable with engine-intake or cabin-air testing. Because compressed-air drying and cabin-air filtration serve operator comfort and pneumatic-system reliability rather than combustion air quality, applications involving MICROKAPPA™ or DRYCORE™ are selected independently from engine-intake filtration, based on the specific pneumatic air system or cabin ventilation architecture the equipment actually uses, rather than being treated as extensions of engine air-intake protection.'],
  ['How should an air filter be selected?', 'Selection should follow the equipment or vehicle, engine or protected airflow path, housing configuration, duty environment, dimensions and validated application or OEM evidence. Equipment or vehicle and the specific protected airflow path — engine intake, air-cleaner housing, cabin air or compressed-air drying — determine which of the four Air Intake & Airflow Protection domains and corresponding technology actually applies, since MACROCORE™, INTEKCORE™, MICROKAPPA™ and DRYCORE™ are not interchangeable across these domains. Housing configuration confirms that sealing, routing and element support match the intended installation, while duty environment — ambient dust load, operating conditions and contamination severity — affects how the filtration target should be specified. Dimensions confirm physical fit, and validated application or OEM evidence, including any existing filter or cross-reference, ties the selection to a real installation rather than an assumption based on appearance or a single matching criterion.'],
  ['Can one air filter be selected only by dimensions?', "Dimensions are useful evidence but are not sufficient by themselves. Sealing geometry, airflow requirement, housing fit, duty environment and application compatibility also matter. A filter that matches the housing dimensions can still fail to protect the intended airflow path if its sealing geometry does not create a complete boundary against the air-cleaner housing, allowing unfiltered air to bypass the media entirely. Airflow requirement and housing fit determine whether the filter can support the volume of air the engine, cabin or compressed-air system actually moves without introducing excessive restriction. Duty environment — the ambient dust, moisture or contamination severity the equipment operates in — affects whether a given filtration target provides adequate protection or requires a different media specification. Because Air Intake & Airflow Protection spans four distinct domains with different technologies and standards, ELIMFILTERS confirms these factors together with dimensional fit before validating a specific air-filter part number for any of the four protected airflow paths."],
] as const;

const families = [
  ['Primary Air Filters', 'primary-air', 'Engine intake / first-stage protection'],
  ['Secondary Air Filters', 'secondary-air', 'Safety-stage protection where the application uses a secondary element'],
  ['Air Cleaner Housings', 'air-cleaner-housings', 'Airflow routing, sealing and filter support'],
  ['Cabin Filters', 'cabin-filters', 'Operator HVAC and cabin-air filtration'],
  ['Air Dryer Filters', 'air-dryer-filters', 'Applicable compressed-air moisture-control systems'],
] as const;

export function AirIntakeSystemPage() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${PAGE_URL}#webpage`,
      name: 'Air Intake & Airflow Protection',
      url: PAGE_URL,
      description: 'Air intake and airflow protection architecture for engine intake, air-cleaner housings, cabin air and applicable compressed-air drying systems.',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      publisher: { '@id': `${BASE_URL}/#organization` },
      about: [
        { '@type': 'Thing', name: 'Engine air intake filtration' },
        { '@type': 'Thing', name: 'Air cleaner housings' },
        { '@type': 'Thing', name: 'Cabin air filtration' },
        { '@type': 'Thing', name: 'Compressed air drying' },
      ],
      mentions: [
        { '@type': 'Thing', name: 'MACROCORE' },
        { '@type': 'Thing', name: 'INTEKCORE' },
        { '@type': 'Thing', name: 'MICROKAPPA' },
        { '@type': 'Thing', name: 'DRYCORE' },
        { '@type': 'Thing', name: 'ISO 5011' },
        { '@type': 'Thing', name: 'ISO 11155' },
        { '@type': 'Thing', name: 'ISO 8573-1' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Systems', item: `${BASE_URL}/systems/` },
        { '@type': 'ListItem', position: 3, name: 'Air Intake & Airflow Protection', item: PAGE_URL },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Air Intake & Airflow Protection product families',
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

      <PageHeader breadcrumbs={[{ label: 'Systems', href: '/systems/' }]} currentPage="Air Intake & Airflow Protection" />

      <section style={hero}>
        <img src="/images/carcasa.jd.avif" alt="Air intake and airflow protection system" style={heroMedia} />
        <div style={heroOverlay} />
        <div style={heroInner}>
          <p style={eyebrow}>AIRFLOW CONTAMINATION CONTROL</p>
          <h1 style={heroTitle}>Air Intake &<br /><span style={{ color: '#FFF12D' }}>Airflow Protection</span></h1>
          <p style={heroPromise}>Control contamination at the airflow boundary before it reaches the engine, operator environment or applicable pneumatic system.</p>
          <p style={heroLead}>ELIMFILTERS organizes engine intake filtration, air-cleaner housings, cabin-air filtration and air-dryer protection as distinct airflow functions inside one system architecture. The protected airflow path determines the technology, product family and validation evidence required.</p>
          <div style={buttonRow}>
            <Link href="#protection-path" style={yellowButton}>IDENTIFY THE AIRFLOW PATH</Link>
            <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={darkButton}>FIND MY FILTER</a>
          </div>
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}>DIRECT ANSWER</p>
        <div style={twoCol}>
          <h2 style={h2}>One protection system. Four different airflow boundaries.</h2>
          <div>
            <p style={lead}>Air Intake & Airflow Protection is not a single filter category. It is the system-level architecture used to decide which airflow path is being protected before a technology or part number is selected.</p>
            <p style={body}>Engine intake, cabin ventilation, air-cleaner housings and compressed-air drying do not share the same function or validation standard. They are connected by airflow, but each must be resolved on its own application evidence.</p>
          </div>
        </div>
      </section>

      <section id="protection-path" style={sectionAlt}>
        <p style={eyebrow}>PROTECTION PATHWAYS</p>
        <h2 style={h2}>Start with the airflow path, not the filter shape.</h2>
        <div style={grid4}>
          {domains.map(([title, exposure, technology, href]) => (
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
            <h2 style={h2}>The contamination boundary includes the housing, seal and airflow path.</h2>
          </div>
          <div>
            <p style={lead}>Filtration performance depends on more than media. Air can bypass the intended protection path through an incorrect housing, damaged seal, poor element fit or a product selected for the wrong airflow function.</p>
            <p style={body}>That is why ELIMFILTERS keeps the hierarchy explicit: protected airflow path → technology → product family → validated part number.</p>
          </div>
        </div>
      </section>

      <section style={sectionAlt}>
        <p style={eyebrow}>WHAT THE SYSTEM PROTECTS</p>
        <h2 style={h2}>Different airflow functions protect different parts of the asset.</h2>
        <div style={grid2}>
          {assets.map(([title, text]) => (
            <article key={title} style={lineCard}>
              <h3 style={h3}>{title}</h3>
              <p style={body}>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}>PRODUCT ARCHITECTURE</p>
        <h2 style={h2}>From protection system to physical filtration component.</h2>
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
        <h2 style={h2}>Do not collapse different airflow domains into one standard.</h2>
        <p style={{ ...lead, maxWidth: '820px' }}>Standards belong to the product family and protected airflow path. Engine intake, cabin air and compressed air are separate engineering domains.</p>
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
        <p style={eyebrow}>FROM AIRFLOW CONDITION TO PART</p>
        <h2 style={h2}>Resolve the application in a controlled sequence.</h2>
        <div className="decision-flow" style={decisionFlow}>
          {['1. EQUIPMENT / VEHICLE', '2. PROTECTED AIRFLOW PATH', '3. HOUSING + SEAL CONFIGURATION', '4. DUTY ENVIRONMENT', '5. DIMENSIONS + OEM EVIDENCE', '6. VALIDATED ELIMFILTERS PART'].map((step, i) => (
            <div key={step} className="decision-step" style={decisionStep}><span className="decision-step-index">{String(i + 1).padStart(2, '0')}</span><span className="decision-step-label">{step.replace(/^\d+\.\s*/, '')}</span></div>
          ))}
        </div>
      </section>

      <section style={sectionAlt}>
        <p style={eyebrow}>FREQUENT QUESTIONS</p>
        <h2 style={h2}>Air Intake & Airflow Protection</h2>
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
          <p style={eyebrow}>HAVE AN AIRFLOW APPLICATION TO RESOLVE?</p>
          <h2 style={h2}>Identify the protected airflow path before selecting the part.</h2>
          <p style={{ ...lead, maxWidth: '780px' }}>Use equipment, engine, housing, airflow function, operating environment and available OEM or filter evidence to resolve the correct ELIMFILTERS protection path.</p>
          <div style={buttonRow}>
            <a href="mailto:applications@elimfilters.com?subject=Air%20Intake%20Application%20Support" style={yellowButton}>IDENTIFY MY AIRFLOW PROTECTION PATH</a>
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
const heroMedia: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%', opacity: 0.5 };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,.92) 0%, rgba(0,0,0,.72) 52%, rgba(0,0,0,.36) 100%)' };
const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(3rem, 7vw, 6.8rem)', lineHeight: 0.9, letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0, maxWidth: '960px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(1.1rem, 2vw, 1.45rem)', lineHeight: 1.35, maxWidth: '820px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem, 1.5vw, 1.15rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.72)', maxWidth: '820px', margin: '1.2rem 0 0' };
const eyebrow: CSSProperties = { fontFamily: displayFont, fontSize: '.72rem', fontWeight: 700, letterSpacing: '.16em', color: '#FFF12D', textTransform: 'uppercase', margin: '0 0 1rem' };
const section: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', maxWidth: '1320px', margin: '0 auto' };
const sectionAlt: CSSProperties = { ...section, maxWidth: 'none', margin: 0, background: '#080808', borderTop: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const twoCol: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(2rem, 6vw, 5rem)', alignItems: 'start' };
const h2: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3.8rem)', lineHeight: .98, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0 };
const h3: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase', margin: '0 0 .8rem' };
const lead: CSSProperties = { fontSize: 'clamp(1.05rem, 1.7vw, 1.22rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.82)', margin: 0 };
const body: CSSProperties = { fontSize: '.98rem', lineHeight: 1.72, color: 'rgba(255,255,255,.62)', margin: '1rem 0 0', textAlign: 'left' };
const grid4: CSSProperties = { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1px', background: 'rgba(255,255,255,.08)', marginTop: '2rem' };
const grid3: CSSProperties = { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1px', background: 'rgba(255,255,255,.08)', marginTop: '2rem' };
const grid2: CSSProperties = { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1px', background: 'rgba(255,255,255,.08)', marginTop: '2rem' };
const card: CSSProperties = { background: '#000', padding: '1.6rem', flex: '1 1 245px', maxWidth: '390px', minWidth: 0 };
const lineCard: CSSProperties = { background: '#000', padding: '1.6rem 1.8rem', borderLeft: '2px solid rgba(255,241,45,.55)', flex: '1 1 300px', maxWidth: '480px', minWidth: 0 };
const cardLabel: CSSProperties = { fontFamily: displayFont, fontSize: '.78rem', fontWeight: 700, letterSpacing: '.1em', color: '#FFF12D', textTransform: 'uppercase', margin: 0 };
const cardBody: CSSProperties = { fontSize: '.93rem', lineHeight: 1.6, color: 'rgba(255,255,255,.6)', margin: '.8rem 0 0' };
const arrow: CSSProperties = { color: 'rgba(255,255,255,.28)', margin: '1rem 0', fontSize: '1.2rem' };
const techLink: CSSProperties = { fontFamily: displayFont, color: '#fff', fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase' };
const familyGrid: CSSProperties = { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1px', background: 'rgba(255,255,255,.08)', marginTop: '2rem' };
const familyCard: CSSProperties = { background: '#050505', padding: '1.6rem', textDecoration: 'none', color: '#fff', display: 'block', flex: '1 1 260px', maxWidth: '420px', minWidth: 0 };
const smallLink: CSSProperties = { display: 'inline-block', marginTop: '1.2rem', fontFamily: displayFont, fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', color: '#FFF12D' };
const decisionFlow: CSSProperties = { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1px', marginTop: '2rem', background: 'rgba(255,255,255,.08)' };
const decisionStep: CSSProperties = { background: '#050505', padding: '1.2rem', fontFamily: displayFont, fontWeight: 700, fontSize: '.74rem', letterSpacing: '.08em', flex: '1 1 190px', maxWidth: '300px', minWidth: 0 };
const faqGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1px', background: 'rgba(255,255,255,.08)', marginTop: '2rem' };
const faqCard: CSSProperties = { background: '#000', padding: '1.6rem' };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontSize: '1rem', lineHeight: 1.35, margin: 0, textTransform: 'uppercase' };
const buttonRow: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.85rem', marginTop: '2rem' };
const yellowButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, fontSize: '.76rem', letterSpacing: '.09em', padding: '1rem 1.25rem', textTransform: 'uppercase' };
const darkButton: CSSProperties = { ...yellowButton, background: 'rgba(0,0,0,.45)', color: '#fff', border: '1px solid rgba(255,255,255,.28)' };
const finalCta: CSSProperties = { padding: 'clamp(5rem, 9vw, 8rem) clamp(1.25rem, 6vw, 6rem)', borderTop: '1px solid rgba(255,241,45,.18)', background: 'radial-gradient(circle at top right, rgba(255,241,45,.10), transparent 35%), #030303' };
