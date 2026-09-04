import Link from 'next/link';
import type { CSSProperties } from 'react';
import { TechnologiesPortfolio } from '@/components/TechnologiesPortfolio';
import { PageHeader } from '@/components/PageHeader';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/technologies/`;

const canonicalTechnologies = [
  ['MACROCORE™', 'macrocore', 'Engine air contamination control and intake-system protection.', 'Air Intake & Airflow Protection'],
  ['MICROKAPPA™', 'microkappa', 'Cabin-air particulate and operator/passenger environment protection.', 'Air Intake & Airflow Protection'],
  ['DRYCORE™', 'drycore', 'Moisture control for applicable pneumatic and compressed-air systems.', 'Air Intake & Airflow Protection'],
  ['INTEKCORE™', 'intekcore', 'Air-cleaner housing, sealing and airflow-system integration.', 'Air Intake & Airflow Protection'],
  ['SYNTAPORE™', 'syntapore', 'Fuel particulate contamination control before precision fuel-system components.', 'Fuel Cleanliness Protection'],
  ['HYDROCORE™', 'hydrocore', 'Fuel-water separation for approved standard non-turbine separator architectures and applications.', 'Fuel Cleanliness Protection'],
  ['TURBOCORE™', 'turbocore', 'Turbine-style fuel-water separation for approved FH and FG series systems.', 'Fuel Cleanliness Protection'],
  ['SYNTRAX™', 'syntrax', 'Lubricant contamination control for protected engine and component interfaces.', 'Lubrication Protection'],
  ['NANOFORCE™', 'nanoforce', 'Hydraulic-fluid cleanliness control around pumps, valves and actuators.', 'Hydraulic Protection'],
  ['THERMACORE™', 'thermacore', 'Cooling-system cleanliness and coolant-circuit component protection.', 'Cooling System Protection'],
] as const;

const systemGroups = [
  {
    system: 'Air Intake & Airflow Protection',
    href: '/systems/air-intake/',
    technologies: ['MACROCORE™', 'INTEKCORE™', 'MICROKAPPA™', 'DRYCORE™'],
    description: 'Engine intake, housings, cabin air and applicable compressed-air drying are different airflow functions inside one protection system.',
  },
  {
    system: 'Fuel Cleanliness Protection',
    href: '/systems/fuel-cleanliness/',
    technologies: ['SYNTAPORE™', 'HYDROCORE™', 'TURBOCORE™'],
    description: 'Particulate control, standard non-turbine fuel-water separation and FH/FG turbine-style separation are distinct functions inside one fuel-cleanliness protection system.',
  },
  {
    system: 'Lubrication Protection',
    href: '/systems/lubrication/',
    technologies: ['SYNTRAX™'],
    description: 'Lubricant contamination control is tied to the protected oil circuit, engine context and validated product application.',
  },
  {
    system: 'Hydraulic Protection',
    href: '/systems/hydraulic/',
    technologies: ['NANOFORCE™'],
    description: 'Hydraulic filtration is selected around fluid cleanliness, pressure, flow, component tolerance and application evidence.',
  },
  {
    system: 'Cooling System Protection',
    href: '/systems/cooling-system/',
    technologies: ['THERMACORE™'],
    description: 'Cooling-system protection connects coolant condition and contamination control to the approved heavy-duty cooling application.',
  },
] as const;

const faqs = [
  ['What is an ELIMFILTERS filtration technology?', 'An ELIMFILTERS filtration technology is the engineering architecture assigned to a specific contamination-control function inside a defined protection system. It is not a generic product label and should not be selected independently of the protected system and application. Each technology — MACROCORE™, MICROKAPPA™, DRYCORE™, INTEKCORE™, SYNTAPORE™, HYDROCORE™, TURBOCORE™, SYNTRAX™, NANOFORCE™ and THERMACORE™ — governs a distinct contamination-control role. Because the hierarchy runs from protected system to technology to product family to validated part number, identifying a technology name is one step in application resolution, not the final answer. A customer who knows only that a filter uses SYNTRAX™ technology, for example, still needs the equipment, engine and duty context confirmed before ELIMFILTERS validates a specific oil-filter part number for that application.'],
  ['How are systems, technologies, product families and part numbers related?', 'The hierarchy is protected system first, technology second, product family third and validated part number last. This keeps technical selection tied to the function being protected instead of choosing a product only by appearance or cross-reference. A protected system — such as Lubrication Protection, Hydraulic Protection or Air Intake & Airflow Protection — defines which asset and contamination pathway matters for a given application. The technology assigned to that system, such as SYNTRAX™ for lubrication or NANOFORCE™ for hydraulic filtration, defines the engineering architecture used to control that contamination. The product family then defines the specific category of filter built around that technology, such as Oil Filters or Coolant Filters. Only after system, technology and product family are confirmed does ELIMFILTERS validate a specific part number against dimensional, application and cross-reference evidence — skipping any step in this sequence risks selecting a filter that fits physically but does not perform the protection function the application actually requires.'],
  ['How many ELIMFILTERS filtration technologies are presented on this page?', 'Ten technologies are presented here: MACROCORE™, MICROKAPPA™, DRYCORE™, INTEKCORE™, SYNTAPORE™, HYDROCORE™, TURBOCORE™, SYNTRAX™, NANOFORCE™ and THERMACORE™. They are organized inside five protection systems and each technology is scoped to a defined contamination-control function. Within Fuel Cleanliness Protection, SYNTAPORE™ governs particulate fuel filtration, HYDROCORE™ governs approved standard non-turbine fuel/water separator applications, and TURBOCORE™ is reserved for approved FH and FG turbine-style fuel/water separator systems. These three fuel technologies are related by the protected system but are not interchangeable.'],
  ['Which technology is used for engine air intake filtration?', 'MACROCORE™ is the primary ELIMFILTERS technology for engine air-intake filtration. INTEKCORE™ supports the air-cleaner housing architecture, while MICROKAPPA™ and DRYCORE™ serve separate cabin-air and compressed-air functions within the broader airflow protection system. MACROCORE™ specifically addresses the combustion air path, controlling ambient dust, soot, fibers and airborne debris before they reach internal engine components. INTEKCORE™ does not filter air directly; instead it governs the housing geometry, sealing interfaces and element support that determine whether a properly rated MACROCORE™ element can actually perform as intended, since housing sealing issues can allow unfiltered air to bypass the media even when the filter itself is correctly specified. MICROKAPPA™ and DRYCORE™ address entirely separate airflow paths — operator cabin ventilation and compressed-air drying, respectively — evaluated under their own test standards and selected independently from engine-intake filtration, since they are not extensions of MACROCORE™ but distinct technologies within the same broader Air Intake & Airflow Protection system.'],
  ['Which technologies are used for diesel fuel protection?', "Fuel Cleanliness Protection uses three governed technologies with distinct scopes. SYNTAPORE™ controls particulate contamination in diesel fuel. HYDROCORE™ governs approved standard non-turbine fuel/water separator applications, including applicable drain and transparent-bowl configurations. TURBOCORE™ is reserved exclusively for approved FH and FG turbine-style fuel/water separator systems and their dedicated replacement elements. The three technologies belong to the same protection system but are not interchangeable, so the correct path depends on whether the application requires particulate filtration, standard fuel/water separation, turbine-style separation, or an approved combination of functions."],
  ['Which technologies protect lubrication, hydraulic and cooling systems?', 'SYNTRAX™ supports lubrication filtration, NANOFORCE™ supports hydraulic filtration and THERMACORE™ supports cooling-system filtration. SYNTRAX™ is engineered to capture the contamination that circulates in engine oil — soot, wear debris, oxidation products and service-introduced particulate — without compromising the flow and pressure behavior the lubrication circuit depends on, protecting bearings, journals, turbocharger interfaces and valve-train surfaces. NANOFORCE™ addresses hydraulic contamination pathways including ingressed particulate, internal wear debris and reservoir contamination, protecting pumps, control valves, actuators and precision manifolds that operate with small internal clearances. THERMACORE™ addresses cooling-circuit contamination such as corrosion products, scale and mineral deposits, and coolant degradation, protecting wet liners, water pumps, heat-transfer surfaces and coolant-circuit seals. Because each technology is tied to a distinct system, fluid chemistry and set of protected components, they are not interchangeable across lubrication, hydraulic and cooling applications even where duty conditions or contamination symptoms appear superficially similar.'],
  ['Can a technology name alone identify the correct filter?', 'No. The technology identifies the engineering architecture. Final selection still requires the equipment or vehicle, protected system, duty context, product family and validated application evidence. Knowing that an application uses SYNTRAX™, NANOFORCE™ or any other ELIMFILTERS technology confirms which contamination-control architecture applies, but it does not confirm the specific bypass valve setting, sealing configuration, flow requirement, filtration target or dimensional fit a given engine, hydraulic circuit or cooling system actually needs. Two applications using the same technology can still require different filter configurations once equipment platform, duty cycle, existing OEM reference and installation-specific evidence are considered. For that reason, ELIMFILTERS treats technology identification as the second step in a controlled sequence — after confirming the protected system and before narrowing to product family and validated part number — rather than as a shortcut that bypasses the application-validation process every filtration decision depends on.'],
] as const;

export const metadata = {
  title: 'Industrial Filtration Technologies | Contamination Control | ELIMFILTERS®',
  description: 'Explore ten ELIMFILTERS filtration technologies organized inside five protection systems across air intake and airflow, fuel cleanliness, lubrication, hydraulic and cooling-system protection.',
  keywords: [
    'industrial filtration technologies',
    'filtration technology',
    'contamination control technology',
    'air intake filtration technology',
    'fuel filtration technology',
    'fuel water separation technology',
    'lubrication filtration technology',
    'hydraulic filtration technology',
    'cooling system filtration technology',
    'asset protection systems',
    'ELIMFILTERS',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Industrial Filtration Technologies | ELIMFILTERS',
    description: 'Ten ELIMFILTERS engineering technologies mapped to five protected systems, contamination risks, product families and validated applications.',
    url: PAGE_URL,
    type: 'website',
    siteName: 'ELIMFILTERS',
    images: [{ url: `${BASE_URL}/assets/logo-elimfilters.png`, width: 1200, height: 630, alt: 'ELIMFILTERS industrial filtration technologies' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Industrial Filtration Technologies | ELIMFILTERS',
    description: 'Ten filtration technologies organized inside five protection systems by contamination function and application path.',
    images: [`${BASE_URL}/assets/logo-elimfilters.png`],
  },
};

export default function TechnologiesPage() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${PAGE_URL}#collection`,
      name: 'ELIMFILTERS Industrial Filtration Technologies',
      url: PAGE_URL,
      description: 'Ten industrial filtration engineering technologies organized inside five protection systems by contamination-control function and product architecture.',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      publisher: { '@id': `${BASE_URL}/#organization` },
      about: [
        { '@type': 'Thing', name: 'Industrial filtration technology' },
        { '@type': 'Thing', name: 'Contamination control' },
        { '@type': 'Thing', name: 'Asset protection systems' },
      ],
      mentions: canonicalTechnologies.map(([name]) => ({ '@type': 'DefinedTerm', name })),
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: canonicalTechnologies.length,
        itemListElement: canonicalTechnologies.map(([name, slug, description, system], index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'DefinedTerm',
            '@id': `${BASE_URL}/technologies/${slug}/#technology`,
            name,
            description,
            url: `${BASE_URL}/technologies/${slug}/`,
            termCode: slug,
            inDefinedTermSet: { '@id': `${PAGE_URL}#collection` },
            subjectOf: { '@type': 'Thing', name: system },
          },
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Technologies', item: PAGE_URL },
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

  const renderSystemCard = (group: (typeof systemGroups)[number]) => (
    <article key={group.system} style={systemCard}>
      <Link href={group.href} style={systemName}>{group.system}</Link>
      <p style={bodyText}>{group.description}</p>
      <div style={technologyTags}>
        {group.technologies.map((technology) => (
          <span key={technology} style={technologyTag}>{technology}</span>
        ))}
      </div>
    </article>
  );

  return (
    <main className="technologies-page" style={main}>
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <PageHeader currentPage="Technologies" />

      <section style={hero}>
        <video autoPlay muted loop playsInline preload="auto" style={heroImage}>
          <source src="/images/Operator_enters_machine_cabin_20_tecnology.mp4" type="video/mp4" />
        </video>
        <div style={heroOverlay} />
        <div style={heroInner}>
          <p style={eyebrow}>FILTRATION ENGINEERING ARCHITECTURE</p>
          <h1 style={heroTitle}>
            Industrial Filtration
            <br />
            <span style={{ color: '#FFF12D' }}>Technologies</span>
          </h1>
          <p style={heroPromise}>Technology defines how contamination is controlled. The protected system defines where that technology belongs.</p>
          <p style={heroLead}>ELIMFILTERS® organizes ten filtration technologies across five protection systems: air intake and airflow, fuel cleanliness, lubrication, hydraulic and cooling-system protection. Each technology is connected to a defined contamination-control function, product family and validated application path.</p>
          <div style={buttonRow}>
            <a href="#technology-architecture" style={yellowButton}>SELECT A TECHNOLOGY</a>
            <Link href="/systems/" style={darkButton}>START WITH A PROTECTION SYSTEM</Link>
          </div>
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}>DIRECT ANSWER</p>
        <div style={twoCol}>
          <h2 style={{ ...sectionTitle, ...stickyHeading }}>A technology is not a filter family and not a part number.</h2>
          <div>
            <p style={leadText}>ELIMFILTERS technologies define the engineering architecture used to control a specific contamination pathway inside a protected system.</p>
            <p style={bodyText}>The decision sequence is explicit: protected system → contamination function → technology → product family → validated part number. This prevents technology names from being treated as interchangeable product categories.</p>
          </div>
        </div>
      </section>

      <section id="technology-architecture" style={sectionAlt}>
        <div style={systemSectionInner}>
          <p style={eyebrow}>SYSTEM → TECHNOLOGY</p>
          <h2 style={sectionTitle}>Ten technologies organized inside five protection systems.</h2>
          <div className="system-pyramid">
            <div className="system-pyramid-top">
              {systemGroups.slice(0, 3).map(renderSystemCard)}
            </div>
            <div className="system-pyramid-bottom">
              {systemGroups.slice(3).map(renderSystemCard)}
            </div>
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div style={stickyHeading}>
            <p style={eyebrow}>ENGINEERING PRINCIPLE</p>
            <h2 style={sectionTitle}>Do not start with the technology name. Start with the protected function.</h2>
          </div>
          <div>
            <p style={leadText}>Two technologies can belong to the same system while protecting different contamination boundaries. Air intake is the clearest example: engine intake, housing integrity, cabin air and compressed-air drying are related by airflow but remain separate engineering functions.</p>
            <p style={bodyText}>The same discipline applies across fuel, lubrication, hydraulic and cooling systems. Technology selection should follow the operating problem and application evidence, not marketing familiarity.</p>
          </div>
        </div>
      </section>

      <TechnologiesPortfolio />

      <section style={sectionAlt}>
        <p style={eyebrow}>FROM TECHNOLOGY TO PART</p>
        <h2 style={sectionTitle}>Use the technology to narrow the architecture, not to bypass application validation.</h2>
        <div className="decision-flow" style={decisionFlow}>
          {['1. ASSET / EQUIPMENT', '2. PROTECTED SYSTEM', '3. CONTAMINATION FUNCTION', '4. ELIMFILTERS TECHNOLOGY', '5. PRODUCT FAMILY', '6. VALIDATED PART NUMBER'].map((step, i) => (
            <div key={step} className="decision-step" style={decisionStep}><span className="decision-step-index">{String(i + 1).padStart(2, '0')}</span><span className="decision-step-label">{step.replace(/^\d+\.\s*/, '')}</span></div>
          ))}
        </div>
      </section>

      <section style={section}>
        <p style={eyebrow}>FREQUENT QUESTIONS</p>
        <h2 style={sectionTitle}>Industrial Filtration Technologies</h2>
        <div className="faq-grid" style={faqGrid}>
          {faqs.map(([question, answer]) => (
            <article key={question} style={faqCard}>
              <h3 style={faqQuestion}>{question}</h3>
              <p style={bodyText}>{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="technologies-final-cta" style={cta}>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <p style={eyebrow}>READY TO RESOLVE THE APPLICATION?</p>
          <h2 style={{ ...sectionTitle, textAlign: 'center', maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }}>Connect the protection system to the correct technology, family and part.</h2>
          <p style={{ ...bodyText, maxWidth: '760px', margin: '1.25rem auto 0' }}>Use Product Intelligence when you already have a reference or known application. Use Application Support when the protected system, duty conditions or technical fit still need to be resolved.</p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.9rem', marginTop: '2rem' }}>
            <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" data-conversion-action="product-intelligence" style={yellowButton}>FIND MY FILTER</a>
            <Link href="/contact/" data-conversion-action="application-support" style={darkButton}>IDENTIFY MY PROTECTION PATH</Link>
            <Link href="/systems/" style={darkButton}>EXPLORE PROTECTION SYSTEMS</Link>
          </div>
        </div>
      </section>

      <style>{`
        .system-pyramid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 2.2rem;
        }
        .system-pyramid-top {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }
        .system-pyramid-bottom {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
          width: calc((100% - 2rem) * 2 / 3 + 1rem);
          margin: 0 auto;
        }
        .system-pyramid-top > article,
        .system-pyramid-bottom > article {
          height: 100%;
          min-height: 285px;
          display: flex;
          flex-direction: column;
        }
        .system-pyramid-top > article > div:last-child,
        .system-pyramid-bottom > article > div:last-child {
          margin-top: auto !important;
          padding-top: 1.1rem;
        }
        @media (max-width: 900px) {
          .system-pyramid-top,
          .system-pyramid-bottom {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            width: 100%;
          }
        }
        @media (max-width: 620px) {
          .system-pyramid-top,
          .system-pyramid-bottom {
            grid-template-columns: 1fr;
          }
          .system-pyramid-top > article,
          .system-pyramid-bottom > article {
            min-height: 0;
          }
        }
      `}</style>
    </main>
  );
}

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';
const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont, overflowX: 'hidden' };
const hero: CSSProperties = { minHeight: '92vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const heroImage: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 1 };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.08)' };
const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-0.055em', lineHeight: 0.9, fontSize: 'clamp(3rem, 7vw, 6.8rem)', maxWidth: '1040px', margin: 0, textTransform: 'uppercase' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(1.08rem, 2vw, 1.45rem)', lineHeight: 1.35, maxWidth: '820px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { marginTop: '1rem', maxWidth: '860px', color: 'rgba(255,255,255,0.72)', fontSize: 'clamp(1rem, 1.6vw, 1.18rem)', lineHeight: 1.7, fontWeight: 500 };
const eyebrow: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 1rem' };
const section: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)' };
const sectionAlt: CSSProperties = { ...section, background: '#050505', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' };
const systemSectionInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const twoCol: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(2rem, 6vw, 5rem)' };
const stickyHeading: CSSProperties = { position: 'sticky', top: '7rem' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem, 4vw, 3.6rem)', lineHeight: 0.98, letterSpacing: '-0.035em', margin: 0, textTransform: 'uppercase', fontWeight: 700 };
const leadText: CSSProperties = { color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(1.08rem, 1.7vw, 1.3rem)', lineHeight: 1.7, fontWeight: 600, margin: 0 };
const bodyText: CSSProperties = { color: 'rgba(255,255,255,0.62)', fontSize: '1rem', lineHeight: 1.76, marginTop: '1rem' };
const buttonRow: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.9rem', marginTop: '2rem' };
const yellowButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.8rem', padding: '1rem 1.2rem' };
const darkButton: CSSProperties = { display: 'inline-block', background: 'rgba(0,0,0,0.5)', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.8rem', padding: '1rem 1.2rem', border: '1px solid rgba(255,241,45,0.4)' };
const systemCard: CSSProperties = { background: '#000', padding: '1.6rem', border: '1px solid rgba(255,255,255,0.08)' };
const systemName: CSSProperties = { color: '#fff', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, fontSize: '1.1rem', textTransform: 'uppercase' };
const technologyTags: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.1rem' };
const technologyTag: CSSProperties = { color: '#FFF12D', border: '1px solid rgba(255,241,45,0.28)', background: 'rgba(255,241,45,0.05)', padding: '0.45rem 0.6rem', fontFamily: displayFont, fontWeight: 700, fontSize: '0.66rem', letterSpacing: '0.08em' };
const decisionFlow: CSSProperties = { maxWidth: '1180px', margin: '2rem auto 0', display: 'flex', flexWrap: 'wrap', gap: '1px', background: 'rgba(255,255,255,0.08)' };
const decisionStep: CSSProperties = { background: '#000', padding: '1.2rem', fontFamily: displayFont, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: '#fff', flex: '1 1 190px', minWidth: 0 };
const faqGrid: CSSProperties = { maxWidth: '1180px', margin: '2.2rem auto 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.08)' };
const faqCard: CSSProperties = { background: '#050505', padding: '1.5rem' };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: '1rem', lineHeight: 1.3, margin: 0, color: '#fff' };
const cta: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderTop: '1px solid rgba(255,241,45,0.2)', background: 'radial-gradient(circle at 50% 0%, rgba(255,241,45,0.18), transparent 34%)' };
