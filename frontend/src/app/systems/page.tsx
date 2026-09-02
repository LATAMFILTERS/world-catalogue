import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { PROTECTION_SYSTEM_LIST } from '@/lib/protection-systems-data';

const BASE_URL = 'https://elimfilters.com';
const PAGE_URL = `${BASE_URL}/systems/`;

const SYSTEM_IMAGES: Record<string, string> = {
  'air-intake': '/images/air-filters-lab.avif',
  'fuel-cleanliness': '/images/syntapore_mecanico_camion.avif',
  lubrication: '/images/oil-hand.avif',
  hydraulic: '/images/hidraulic.avif',
  'cooling-system': '/images/coolant-filters.avif',
};

const SYSTEM_DECISIONS: Record<string, { exposure: string; protects: string; technologies: string }> = {
  'air-intake': { exposure: 'Airborne particulate, operator-air contamination and pneumatic moisture', protects: 'Engine intake, airflow paths, cabin air and compressed-air drying functions', technologies: 'MACROCORE™ · MICROKAPPA™ · DRYCORE™ · INTEKCORE™' },
  'fuel-cleanliness': { exposure: 'Fuel particulate, free water, emulsified water and storage-related contamination', protects: 'Fuel supply paths, pumps, injectors and downstream precision components', technologies: 'HYDROCORE™ plus application-specific fuel filtration architecture' },
  lubrication: { exposure: 'Wear debris, soot, oxidation byproducts and service ingress', protects: 'Bearings, journals and other lubricated interfaces', technologies: 'SYNTRAX™' },
  hydraulic: { exposure: 'Ingress, internal wear debris and service-generated contamination', protects: 'Pumps, valves, actuators and precision hydraulic controls', technologies: 'NANOFORCE™' },
  'cooling-system': { exposure: 'Scale debris, corrosion products and coolant-condition contamination', protects: 'Heat-transfer surfaces, coolant passages, seals and wet-liner environments', technologies: 'THERMACORE™' },
};

const faq = [
  ['What are the five ELIMFILTERS protection systems?', 'ELIMFILTERS organizes contamination control around Air Intake & Airflow Protection, Fuel Cleanliness Protection, Lubrication Protection, Hydraulic Protection and Cooling System Protection. Each system represents a protected operating domain rather than a single filter type.'],
  ['Why organize filtration by protected system instead of only by filter type?', 'The protected system determines the contamination pathway, component sensitivity, operating duty and evidence required for correct part selection. Filter families and technologies are then connected to that system-level requirement.'],
  ['Are cabin filters and air-dryer filters separate protection systems?', 'No. Cabin-air filtration and pneumatic moisture control are functions within the Air Intake & Airflow Protection architecture rather than separate core protection systems.'],
  ['How do ELIMFILTERS technologies relate to protection systems?', 'Technologies sit below the system level. A system defines what is being protected and from which contamination path; the applicable technology supports the filtration function required within that system.'],
  ['How should a fleet or plant identify the correct protection path?', 'Start with the asset, identify the protected system, define the contamination exposure and duty cycle, then validate the application using vehicle, engine, equipment, OEM or dimensional evidence before selecting the physical part.'],
  ['Can ELIMFILTERS identify a filter from an OEM or known part number?', 'Part Search can use known reference data as an identification starting point, but final application selection should remain tied to the protected system and available application evidence rather than cross-reference alone.'],
] as const;

export const metadata: Metadata = {
  title: 'Industrial Filtration & Asset Protection Systems | ELIMFILTERS',
  description: 'Explore the five ELIMFILTERS industrial asset protection systems for air intake and airflow, fuel cleanliness, lubrication, hydraulic and cooling-system contamination control.',
  keywords: ['industrial filtration systems', 'asset protection systems', 'contamination control systems', 'air intake filtration system', 'fuel cleanliness system', 'lubrication filtration system', 'hydraulic filtration system', 'cooling system filtration', 'ELIMFILTERS'],
  alternates: { canonical: PAGE_URL },
  openGraph: { title: 'Industrial Filtration & Asset Protection Systems | ELIMFILTERS', description: 'Five system-level contamination-control architectures connecting operating exposure to filtration technology, product family and validated part identification.', url: PAGE_URL, type: 'website', siteName: 'ELIMFILTERS', images: [{ url: `${BASE_URL}/images/sistems-hero.avif`, width: 1200, height: 630, alt: 'ELIMFILTERS industrial asset protection systems' }], locale: 'en_US' },
  twitter: { card: 'summary_large_image', title: 'Industrial Filtration & Asset Protection Systems | ELIMFILTERS', description: 'Five system-level contamination-control architectures for industrial asset protection.', images: [`${BASE_URL}/images/sistems-hero.avif`] },
};

export default function SystemsPage() {
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${PAGE_URL}#webpage`, url: PAGE_URL, name: 'Industrial Filtration & Asset Protection Systems', description: metadata.description, isPartOf: { '@id': `${BASE_URL}/#website` }, publisher: { '@id': `${BASE_URL}/#organization` }, about: [{ '@type': 'Thing', name: 'Industrial filtration systems' }, { '@type': 'Thing', name: 'Asset protection systems' }, { '@type': 'Thing', name: 'Contamination control' }], mentions: [...PROTECTION_SYSTEM_LIST.map((system) => ({ '@type': 'Thing', name: system.name })), { '@type': 'Thing', name: 'MACROCORE filtration technology' }, { '@type': 'Thing', name: 'HYDROCORE filtration technology' }, { '@type': 'Thing', name: 'SYNTRAX filtration technology' }, { '@type': 'Thing', name: 'NANOFORCE filtration technology' }, { '@type': 'Thing', name: 'THERMACORE filtration technology' }] },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` }, { '@type': 'ListItem', position: 2, name: 'Asset Protection Systems', item: PAGE_URL }] },
    { '@context': 'https://schema.org', '@type': 'ItemList', '@id': `${PAGE_URL}#systems`, name: 'ELIMFILTERS Protection Systems', numberOfItems: PROTECTION_SYSTEM_LIST.length, itemListElement: PROTECTION_SYSTEM_LIST.map((system, index) => ({ '@type': 'ListItem', position: index + 1, item: { '@type': 'WebPage', name: system.name, url: `${BASE_URL}/systems/${system.slug}/`, description: system.tagline } })) },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ];

  return (
    <main style={main}>
      {schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
      <PageHeader currentPage="Systems" />

      <section style={hero}>
        <video autoPlay muted loop playsInline preload="metadata" style={heroVideo}><source src="/images/Robotic_arm_replacing_filtration_system.mp4" type="video/mp4" /></video>
        <div style={heroOverlay} />
        <div style={heroInner}>
          <p style={eyebrow}>INDUSTRIAL FILTRATION / ASSET PROTECTION ARCHITECTURE</p>
          <h1 style={heroTitle}>Industrial Filtration & Asset Protection Systems</h1>
          <p style={heroPromise}>Start with the system you need to protect—not the filter you happen to recognize.</p>
          <p style={heroLead}>ELIMFILTERS organizes contamination control around five protected operating domains: air intake and airflow, fuel cleanliness, lubrication, hydraulic and cooling. Each domain connects contamination exposure to the appropriate technology, product family and validated application path.</p>
          <div style={heroActions}><Link href="#systems" style={yellowButton}>SELECT A PROTECTION SYSTEM</Link><a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={secondaryButton}>FIND MY FILTER</a></div>
        </div>
      </section>

      <section style={section}>
        <div style={answerGrid}>
          <div style={decisionHeading}><p style={eyebrow}>DIRECT ANSWER</p><h2 style={sectionTitle}>What is a protection system?</h2></div>
          <div><p style={leadText}>A protection system is the operating domain that must stay clean enough for the asset to perform its intended function. It defines the contamination pathway, the components at risk and the filtration decisions that follow.</p><p style={bodyText}>The decision sequence is <strong style={{ color: '#fff' }}>asset → protected system → contamination exposure → duty cycle → filtration technology → product family → validated part number.</strong></p></div>
        </div>
      </section>

      <section id="systems" style={systemsSection}>
        <div style={wrap}>
          <p style={eyebrow}>THE FIVE PROTECTION DOMAINS</p><h2 style={sectionTitle}>Choose the system before you choose the filter.</h2><p style={{ ...bodyText, maxWidth: '800px' }}>Each system page explains the protected components, contamination mechanisms, applicable technologies and product families for that operating domain.</p>
          <div style={systemGrid}>
            {PROTECTION_SYSTEM_LIST.map((system, index) => { const details = SYSTEM_DECISIONS[system.slug]; return (
              <Link key={system.key} href={`/systems/${system.slug}/`} style={systemCard}>
                <div style={systemMediaWrap}><img src={SYSTEM_IMAGES[system.slug] || '/images/sistems-hero.avif'} alt={`${system.name} filtration system`} style={systemImage} /><div style={systemMediaOverlay} /><span style={systemIndex}>0{index + 1}</span></div>
                <div style={systemContent}><h3 style={systemTitle}>{system.name}</h3><p style={systemTagline}>{system.tagline}</p>
                  <div style={systemFact}><span style={factLabel}>CONTAMINATION PATH</span><span style={factText}>{details?.exposure}</span></div>
                  <div style={systemFact}><span style={factLabel}>PROTECTED COMPONENTS</span><span style={factText}>{details?.protects}</span></div>
                  <div style={systemFact}><span style={factLabel}>TECHNOLOGY PATH</span><span style={factText}>{details?.technologies}</span></div>
                  <span style={explore}>EXPLORE SYSTEM →</span>
                </div>
              </Link>
            ); })}
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={decisionShell}>
          <div style={decisionHeading}><p style={eyebrow}>SYSTEM-LEVEL ENGINEERING</p><h2 style={sectionTitle}>Why system-first selection reduces identification risk.</h2></div>
          <div style={decisionSteps}>{[
            ['1', 'Identify the asset', 'Vehicle, machine, engine, generator, vessel, locomotive or plant equipment.'],
            ['2', 'Locate the protected system', 'Airflow, fuel, lubrication, hydraulic or cooling.'],
            ['3', 'Define exposure and duty', 'Contaminant source, environment, operating cycle, fluid condition and service pattern.'],
            ['4', 'Map the filtration architecture', 'Technology and product family are selected according to the system requirement.'],
            ['5', 'Validate the physical part', 'Use OEM references, dimensions, equipment data and application evidence before final selection.'],
          ].map(([n, title, copy]) => <div key={n} style={decisionStep}><span style={stepNumber}>{n}</span><div><h3 style={stepTitle}>{title}</h3><p style={stepCopy}>{copy}</p></div></div>)}</div>
        </div>
      </section>

      <section style={evidenceSection}>
        <div style={evidenceGrid}><div><img src="/images/banco-pruebas-filtros.png" alt="Filtration engineering test bench" style={evidenceImage} /></div><div><p style={eyebrow}>APPLICATION EVIDENCE</p><h2 style={sectionTitle}>Specifications matter only when they match the actual system.</h2><p style={{ ...leadText, marginTop: '1.5rem' }}>Efficiency, flow, pressure drop, contaminant capacity and structural requirements are meaningful only in the context of the system and duty they are intended to serve.</p><p style={bodyText}>ELIMFILTERS therefore treats reference numbers and dimensions as evidence inside a broader application decision—not as substitutes for understanding what the asset is protecting.</p><Link href="/knowledge-center/" style={{ ...textLink, marginTop: '1.5rem' }}>EXPLORE ENGINEERING KNOWLEDGE →</Link></div></div>
      </section>

      <section style={conversionSection}>
        <div style={conversionGrid}><div><p style={eyebrow}>FROM SYSTEM TO PART</p><h2 style={sectionTitle}>Already know the system? Move directly to identification.</h2><p style={{ ...bodyText, maxWidth: '680px' }}>If you have an OEM number, existing filter reference, vehicle or equipment information, use Part Search. If the contamination problem or protected system is still unclear, start with application support.</p></div><div style={conversionActions}><a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={yellowButton}>FIND MY FILTER</a><Link href="/contact/?intent=application-support" style={secondaryButton}>IDENTIFY MY PROTECTION PATH</Link><Link href="/families/" style={textLink}>Browse Product Families →</Link></div></div>
      </section>

      <section style={section}><div style={wrapNarrow}><p style={eyebrow}>SYSTEMS FAQ</p><h2 style={sectionTitle}>Questions engineers and fleet teams ask before selecting filtration.</h2><div style={faqWrap}>{faq.map(([q, a]) => <div key={q} style={faqItem}><h3 style={faqQuestion}>{q}</h3><p style={faqAnswer}>{a}</p></div>)}</div></div></section>

      <section style={finalCta}><div style={wrapNarrow}><p style={eyebrow}>NEED A SYSTEM-LEVEL RECOMMENDATION?</p><h2 style={sectionTitle}>Identify the contamination path before choosing the replacement part.</h2><p style={{ ...bodyText, maxWidth: '700px' }}>Provide the asset, protected system, operating environment, duty cycle and any known OEM or filter reference. ELIMFILTERS can use that evidence to direct the application toward the correct protection architecture.</p><div style={heroActions}><Link href="/contact/?intent=application-support" style={yellowButton}>IDENTIFY MY PROTECTION PATH</Link><a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={secondaryButton}>PART SEARCH</a></div></div></section>
    </main>
  );
}

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';
const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont, overflowX: 'hidden' };
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const wrapNarrow: CSSProperties = { maxWidth: '980px', margin: '0 auto' };
const section: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7.5rem) clamp(1.25rem, 6vw, 6rem)' };
const eyebrow: CSSProperties = { margin: 0, color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.74rem', textTransform: 'uppercase' };
const hero: CSSProperties = { minHeight: '88vh', position: 'relative', display: 'flex', alignItems: 'center', padding: 'clamp(7rem, 11vw, 10rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' };
const heroVideo: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.46 };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,.9) 0%, rgba(0,0,0,.68) 54%, rgba(0,0,0,.42) 100%), linear-gradient(0deg, #000 0%, transparent 24%)' };
const heroInner: CSSProperties = { position: 'relative', zIndex: 2, maxWidth: '1180px', width: '100%', margin: '0 auto' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(3rem, 7vw, 6.8rem)', lineHeight: 0.92, letterSpacing: '-0.055em', textTransform: 'uppercase', maxWidth: '1050px', margin: '1rem 0 0' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.2rem, 2.4vw, 1.8rem)', lineHeight: 1.3, color: '#fff', fontWeight: 700, maxWidth: '800px', margin: '1.8rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem, 1.5vw, 1.18rem)', lineHeight: 1.72, color: 'rgba(255,255,255,.72)', maxWidth: '820px', margin: '1.2rem 0 0' };
const heroActions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center', marginTop: '2rem' };
const yellowButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.11em', padding: '1rem 1.35rem', textTransform: 'uppercase' };
const secondaryButton: CSSProperties = { display: 'inline-block', border: '1px solid rgba(255,255,255,.28)', color: '#fff', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.11em', padding: '0.95rem 1.3rem', textTransform: 'uppercase', background: 'rgba(0,0,0,.28)' };
const textLink: CSSProperties = { display: 'inline-block', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.08em', textTransform: 'uppercase' };
const answerGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(2rem, 6vw, 5rem)' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.2rem, 4.6vw, 4rem)', lineHeight: 0.98, letterSpacing: '-0.045em', textTransform: 'uppercase', margin: '0.8rem 0 0' };
const leadText: CSSProperties = { margin: 0, fontSize: 'clamp(1.08rem, 1.6vw, 1.3rem)', lineHeight: 1.72, color: 'rgba(255,255,255,.86)' };
const bodyText: CSSProperties = { margin: '1rem 0 0', fontSize: '1rem', lineHeight: 1.78, color: 'rgba(255,255,255,.64)' };
const systemsSection: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7.5rem) clamp(1.25rem, 6vw, 6rem)', background: '#070707', borderTop: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const systemGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1rem', marginTop: '2.6rem' };
const systemCard: CSSProperties = { display: 'block', color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,.1)', background: '#0b0b0b', minWidth: 0 };
const systemMediaWrap: CSSProperties = { position: 'relative', aspectRatio: '16 / 8.5', overflow: 'hidden', background: '#111' };
const systemImage: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
const systemMediaOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,.78), rgba(0,0,0,.04) 65%)' };
const systemIndex: CSSProperties = { position: 'absolute', left: '1rem', bottom: '0.8rem', fontFamily: displayFont, color: '#FFF12D', fontWeight: 700, letterSpacing: '0.1em' };
const systemContent: CSSProperties = { padding: 'clamp(1.4rem, 3vw, 2rem)' };
const systemTitle: CSSProperties = { margin: 0, fontFamily: displayFont, fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)', lineHeight: 1.05, textTransform: 'uppercase' };
const systemTagline: CSSProperties = { color: 'rgba(255,255,255,.65)', lineHeight: 1.65, margin: '0.85rem 0 1.4rem' };
const systemFact: CSSProperties = { display: 'grid', gap: '0.35rem', padding: '0.9rem 0', borderTop: '1px solid rgba(255,255,255,.07)' };
const factLabel: CSSProperties = { fontFamily: displayFont, fontSize: '0.68rem', letterSpacing: '0.12em', color: '#FFF12D', fontWeight: 700 };
const factText: CSSProperties = { color: 'rgba(255,255,255,.68)', fontSize: '0.92rem', lineHeight: 1.55 };
const explore: CSSProperties = { display: 'inline-block', color: '#fff', fontFamily: displayFont, fontWeight: 700, fontSize: '0.74rem', letterSpacing: '0.1em', marginTop: '1.2rem' };
const decisionShell: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 'clamp(2.5rem, 6vw, 5rem)', alignItems: 'start' };
const decisionHeading: CSSProperties = { position: 'sticky', top: '7rem' };
const decisionSteps: CSSProperties = { borderTop: '1px solid rgba(255,255,255,.12)' };
const decisionStep: CSSProperties = { display: 'grid', gridTemplateColumns: '44px 1fr', gap: '1rem', padding: '1.25rem 0', borderBottom: '1px solid rgba(255,255,255,.1)' };
const stepNumber: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontWeight: 700, fontSize: '1.1rem' };
const stepTitle: CSSProperties = { margin: 0, fontFamily: displayFont, fontSize: '1.15rem', textTransform: 'uppercase' };
const stepCopy: CSSProperties = { margin: '0.4rem 0 0', color: 'rgba(255,255,255,.62)', lineHeight: 1.6 };
const evidenceSection: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7.5rem) clamp(1.25rem, 6vw, 6rem)', background: '#080808' };
const evidenceGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 'clamp(2rem, 6vw, 5rem)', alignItems: 'center' };
const evidenceImage: CSSProperties = { width: '100%', height: 'auto', display: 'block', border: '1px solid rgba(255,255,255,.1)' };
const conversionSection: CSSProperties = { padding: 'clamp(4rem, 7vw, 6rem) clamp(1.25rem, 6vw, 6rem)', borderTop: '1px solid rgba(255,241,45,.14)', borderBottom: '1px solid rgba(255,241,45,.14)', background: 'rgba(255,241,45,.035)' };
const conversionGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '2.5rem', alignItems: 'center' };
const conversionActions: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.9rem' };
const faqWrap: CSSProperties = { marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,.12)' };
const faqItem: CSSProperties = { padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,.1)' };
const faqQuestion: CSSProperties = { margin: 0, fontFamily: displayFont, fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', lineHeight: 1.25 };
const faqAnswer: CSSProperties = { margin: '0.75rem 0 0', color: 'rgba(255,255,255,.64)', lineHeight: 1.72, maxWidth: '860px' };
const finalCta: CSSProperties = { padding: 'clamp(5rem, 9vw, 8rem) clamp(1.25rem, 6vw, 6rem)', background: '#050505', borderTop: '1px solid rgba(255,255,255,.08)' };
