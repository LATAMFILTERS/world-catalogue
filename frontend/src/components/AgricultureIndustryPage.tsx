import Link from '@/components/LocalizedLink';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import { IndustryFilterCarousel } from './IndustryFilterCarousel';
import { VIDEO_HERO_TREATMENT } from '@/lib/hero-media';
import { agricultureText } from '@/lib/agriculture-i18n';
import type { PageLang } from '@/lib/localized-routes';

const BASE_URL = 'https://elimfilters.com';

const equipment = ['Tractors', 'Combines', 'Harvesters', 'Sprayers', 'Irrigation Engines', 'Field Support Equipment'] as const;

const seasonalWindows = [
  ['Pre-season', 'Inspection, fluid condition, sealing integrity and filter readiness before equipment enters critical field duty.'],
  ['Planting', 'Dust, long operating hours and hydraulic demand increase while schedule flexibility narrows.'],
  ['In-season', 'Service discipline must account for changing field conditions, heat, residue and fuel handling.'],
  ['Harvest', 'High particulate load and limited downtime make contamination control part of production continuity.'],
] as const;

const protection = [
  ['SOIL + CROP DUST', 'Airborne particulate and residue', 'AIR INTAKE', 'MACROCORE™', '/technologies/macrocore/'],
  ['HYDRAULIC DEBRIS', 'Ingress, wear particles and service contamination', 'HYDRAULIC', 'NANOFORCE™', '/technologies/nanoforce/'],
  ['FUEL + MOISTURE', 'Bulk storage, transfer and seasonal handling', 'FUEL', 'HYDROCORE™', '/technologies/hydrocore/'],
  ['FUEL PARTICULATE', 'Particles introduced during storage and refueling', 'FUEL', 'SYNTAPORE™', '/technologies/syntapore/'],
  ['LUBE CONTAMINATION', 'Wear debris, soot and service ingress', 'LUBRICATION', 'SYNTRAX™', '/technologies/syntrax/'],
  ['CABIN PARTICULATE', 'Dust, pollen and organic airborne debris', 'CABIN AIR', 'MICROKAPPA™', '/technologies/microkappa/'],
] as const;

const continuity = [
  ['Airflow', 'Control dust and organic debris before rising restriction changes engine breathing or service demand.'],
  ['Hydraulic Response', 'Protect pumps, valves and actuators that support steering, lifting, implements and precision controls.'],
  ['Fuel Integrity', 'Control particulate and water introduced through bulk storage, transfer and field refueling.'],
  ['Lubricated Components', 'Limit contamination that can accelerate wear across bearings and other lubricated interfaces.'],
  ['Operator Environment', 'Manage cabin particulate where enclosed equipment operates in dust, pollen and crop residue.'],
  ['Service Predictability', 'Use operating conditions and contamination load to plan service around real field demand.'],
] as const;

const serviceChecks: Record<string, string> = {
  "AIR INTAKE": "Inspect restriction indication, ducts and seals according to the machine manual.",
  "HYDRAULIC": "Use clean sampling and the machine's specified fluid and cleanliness requirements.",
  "FUEL": "Check storage practices, water separation and the specified fuel-filter application.",
  "LUBRICATION": "Review oil condition, service history and the specified lubrication filter.",
  "CABIN AIR": "Check cabin seals and the specified filter; particulate filtration does not establish pesticide protection."
};

const ownership = [
  [
    "Machine owner",
    "Prioritize critical machines before planting or harvest. Record operating hours, symptoms, service history and available backup capacity."
  ],
  [
    "Maintenance provider",
    "Plan access, safe isolation, clean handling and the correct parts. Record the machine serial number, installed references and work completed."
  ],
  [
    "Return to service",
    "Check sealing, leaks and system indications using the equipment manufacturer's procedure. Document findings and the next service criteria; do not impose a universal replacement interval."
  ]
];

const questions = [
  ['What is the correct filtration strategy for agricultural equipment?', 'Start with the machine and field environment, identify where contamination enters, determine which system and component must remain protected, then validate the final filter using OEM reference, dimensions and application evidence. The correct strategy is driven by duty and contamination exposure, not equipment category alone.'],
  ['Why does agricultural filtration change during planting and harvest?', 'Planting and harvest concentrate long operating hours, dust exposure, crop residue and limited service windows into short periods. Filtration strategy should therefore account for seasonal duty, contamination load and maintenance access rather than relying on a generic calendar interval.'],
  ['Which filtration systems are most important on tractors and combines?', 'Air intake, hydraulic, fuel and lubrication systems are central to agricultural asset protection, while cabin air quality can also matter in enclosed operator environments. Priority depends on the machine, field conditions, duty cycle and protected component.'],
  ['How does crop dust affect agricultural engines?', 'Fine soil dust and organic residue can increase loading on the air-intake system. Restriction trend, sealing integrity, element capacity and service practice should be considered together because contamination risk increases when dust bypasses the intended protection path.'],
  ['Why is hydraulic cleanliness important in agricultural equipment?', 'Tractors, combines, sprayers and implements rely on pumps, valves, actuators and precision controls. Contamination can affect hydraulic response and component life, so filtration should be matched to system sensitivity, duty and service conditions.'],
  ['How can agricultural fuel become contaminated?', 'Fuel can pick up particulate or water through bulk storage, transfer equipment, tank breathing, condensation and field refueling. The protection strategy should therefore consider the complete fuel-handling path before fuel reaches the engine.'],
  ['Should an agricultural filter be selected only by service interval?', 'No. A calendar or hour interval does not describe contamination loading by itself. Selection and service planning should also consider dust, residue, moisture, duty cycle, restriction trend, system sensitivity and the real maintenance window.'],
  ['What information is needed to identify the correct agricultural filter?', 'Use the machine, engine, protected system, field conditions, duty cycle and any known OEM or current filter reference. Dimensions and validated application evidence should confirm the final product selection.'],
  ['Can ELIMFILTERS identify an agricultural filter from an OEM or part number?', 'Yes. If the OEM reference or current filter number is known, Part Search provides the fastest route to cross-reference and application information. For an engineering review, include the machine, engine, system and operating conditions.'],
] as const;

export function AgricultureIndustryPage({ lang = 'en' }: { lang?: PageLang }) {
  const pageUrl = `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/industries/agriculture/`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: lang === 'es' ? 'Sistemas de filtración agrícola' : lang === 'pt' ? 'Sistemas de filtração agrícola' : 'Agricultural Filtration Systems',
        inLanguage: lang === 'pt' ? 'pt-BR' : lang,
        description: 'Agricultural filtration systems and contamination-control architecture for tractors, combines, harvesters, sprayers, irrigation engines and field support equipment.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Agricultural filtration systems' },
          { '@type': 'Thing', name: 'Agricultural equipment contamination control' },
          { '@type': 'Thing', name: 'Seasonal equipment uptime' },
          { '@type': 'Thing', name: 'Tractor filtration' },
          { '@type': 'Thing', name: 'Combine filtration' },
          { '@type': 'Thing', name: 'Agricultural hydraulic cleanliness' },
          { '@type': 'Thing', name: 'Agricultural fuel contamination' },
          { '@type': 'Thing', name: 'Crop dust engine protection' },
        ],
        mentions: [
          { '@type': 'Thing', name: 'Air intake filtration' },
          { '@type': 'Thing', name: 'Hydraulic filtration' },
          { '@type': 'Thing', name: 'Fuel filtration and water separation' },
          { '@type': 'Thing', name: 'Lubrication filtration' },
          { '@type': 'Thing', name: 'Cabin air filtration' },
          { '@type': 'Thing', name: 'MACROCORE technology' },
          { '@type': 'Thing', name: 'NANOFORCE technology' },
          { '@type': 'Thing', name: 'HYDROCORE technology' },
          { '@type': 'Thing', name: 'SYNTRAX technology' },
          { '@type': 'Thing', name: 'MICROKAPPA technology' },
        ],
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: lang === 'es' ? 'Inicio' : lang === 'pt' ? 'Início' : 'Home', item: `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/` },
          { '@type': 'ListItem', position: 2, name: lang === 'es' ? 'Industrias' : lang === 'pt' ? 'Indústrias' : 'Industries', item: `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/industries/` },
          { '@type': 'ListItem', position: 3, name: lang === 'es' || lang === 'pt' ? 'Agricultura' : 'Agriculture', item: pageUrl },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#equipment`,
        name: 'Agricultural equipment applications',
        itemListElement: equipment.map((name, index) => ({ '@type': 'ListItem', position: index + 1, name: agricultureText(lang, name) })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: questions.map(([q, a]) => ({ '@type': 'Question', name: agricultureText(lang, q), acceptedAnswer: { '@type': 'Answer', text: agricultureText(lang, a) } })),
      },
    ],
  };

  return (
    // Reuse the established mining editorial layout without changing its shared rules.
    <main id="main-content" className="mining-industry-page agriculture-industry-page" style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHeader currentPage="Agriculture" />

      <section style={hero}>
        <video className="miningHeroVideo" aria-hidden="true" autoPlay muted loop playsInline preload="auto" style={heroVideo}><source src="/images/Agriculture-2.mp4" type="video/mp4" /></video>
        <div style={heroShade} className="miningHeroShade" />
        <div style={heroInner} className="miningHeroContainer">
          <p style={eyebrow}>{agricultureText(lang, "AGRICULTURE / SEASONAL ASSET PROTECTION")}</p>
          <h1 style={heroTitle} className="miningHeroHeading">{agricultureText(lang, "FILTRATION FOR")}<br /><span style={yellow}>{agricultureText(lang, "AGRICULTURAL EQUIPMENT")}</span></h1>
          <div className="miningHeroLower"><div className="miningHeroCopy"><p style={heroPromise} className="miningHeroPromise">{agricultureText(lang, "Technical protection for machine owners and agricultural asset maintenance teams.")}</p>
          <p style={heroLead}>{agricultureText(lang, "Contamination control for tractors, combines, harvesters, sprayers, irrigation engines and support equipment operating through soil dust, crop residue, heat, fuel handling and long seasonal duty cycles.")}</p>
          </div><div style={actions} className="miningHeroActions">
            <Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>{agricultureText(lang, "PLAN AGRICULTURAL MAINTENANCE")}</Link>
            <a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>{agricultureText(lang, "FIND MY FILTER")}</a>
          </div>
        </div></div>
      </section>


      <section style={seasonSection} aria-labelledby="season-title"><div style={contentWidth}><p style={eyebrow}>{agricultureText(lang, "SEASONAL UPTIME")}</p><h2 id="season-title" style={sectionTitle}>{agricultureText(lang, "The protection strategy changes with the work cycle.")}</h2><p style={wideText}>{agricultureText(lang, "Agriculture concentrates risk into short operating windows. A filter decision that is acceptable during light service may be inadequate once dust loading, crop residue, heat and operating hours increase together.")}</p><div style={seasonGrid} className="miningRiskGrid">{seasonalWindows.map(([title, text]) => <article key={title} style={seasonCard} className="miningRiskCard"><h3 style={cardTitle}>{agricultureText(lang, title)}</h3><p style={bodyText}>{agricultureText(lang, text)}</p></article>)}</div></div></section>

      <section style={equipmentSection} aria-labelledby="equipment-title"><div style={equipmentGrid} className="miningEquipmentGrid"><div style={equipmentCopy}><h2 id="equipment-title" style={sectionTitle}>{agricultureText(lang, "Different machines. Different field exposure.")}</h2><p style={wideText}>{agricultureText(lang, "A tractor, combine, sprayer and irrigation engine may work on the same farm but face very different contamination loads, service access and operating intensity.")}</p><div role="list" aria-label="Agricultural equipment applications" style={equipmentList}>{equipment.map((asset) => <div role="listitem" key={asset} style={equipmentRow}><span style={equipmentName}>{agricultureText(lang, asset)}</span></div>)}</div></div><div style={equipmentMedia}><img src="/images/agriculture-2_converted.avif" alt="Agricultural equipment operating in field conditions" style={equipmentImage} /></div></div></section>

      <section style={section} aria-labelledby="exposure-title"><div style={contentWidth}><p style={eyebrow}>{agricultureText(lang, "FIELD EXPOSURE")}</p><h2 id="exposure-title" style={sectionTitle}>{agricultureText(lang, "Contamination pathways and service checks for agricultural assets.")}</h2><p style={wideText}>{agricultureText(lang, "The useful question is not simply which filter fits the machine. It is where contamination enters, which system is exposed and what component must remain protected through the seasonal duty cycle.")}</p><div className="miningPathwayFlow" style={pathwayGrid}>{protection.map(([source, detail, system, technology, href]) => <article key={source} style={pathwayCard} className="miningPathwayRow"><div><span style={smallLabel}>{agricultureText(lang, "CONTAMINATION SOURCE")}</span><strong style={pathwaySource}>{agricultureText(lang, source)}</strong><p style={smallText}>{agricultureText(lang, detail)}</p></div><div><span style={smallLabel}>{agricultureText(lang, "PROTECTION SYSTEM")}</span><strong style={pathwaySystem}>{agricultureText(lang, system)}</strong></div><div><span style={smallLabel}>{agricultureText(lang, "SERVICE CHECK")}</span><p style={smallText}>{agricultureText(lang, serviceChecks[system])}</p></div><Link href={href} style={technologyLink} className="miningTechnologyCell"><span style={smallLabelYellow}>{agricultureText(lang, "ELIMFILTERS TECHNOLOGY")}</span><strong style={technologyName}>{technology}</strong><span style={technologyCta}>{agricultureText(lang, "EXPLORE →")}</span></Link></article>)}</div></div></section>

      <section style={principleSection}><div style={principle}><span style={principleLabel}>{agricultureText(lang, "AGRICULTURE ENGINEERING PRINCIPLE")}</span><p style={principleText}>{agricultureText(lang, "Agricultural filtration should be selected around the field environment, machine duty, contamination source, protected system and service window—not by equipment category alone.")}</p></div></section>

      <IndustryFilterCarousel dutyClass="HD" industryName="Agriculture" lang={lang} />

      <section style={continuitySection} aria-labelledby="continuity-title"><div style={contentWidth}><p style={eyebrow}>{agricultureText(lang, "FIELD CONTINUITY")}</p><h2 id="continuity-title" style={sectionTitle}>{agricultureText(lang, "When the season is moving, maintenance flexibility disappears.")}</h2><div style={continuityGrid} className="miningStakesGrid">{continuity.map(([title, text]) => <article key={title} style={continuityCard}><h3 style={continuityTitle}>{agricultureText(lang, title)}</h3><p style={bodyText}>{agricultureText(lang, text)}</p></article>)}</div></div></section>

      <section style={section} aria-labelledby="agriculture-tco-title"><div style={contentWidth}><p style={eyebrow}>{agricultureText(lang, "AVAILABILITY & OWNERSHIP COST")}</p><h2 id="agriculture-tco-title" style={sectionTitle}>{agricultureText(lang, "Protect the machine. Plan the maintenance. Preserve the working window.")}</h2><p style={wideText}>{agricultureText(lang, "A service decision affects more than the price of a filter: labor, travel, parts availability and the loss of productive hours must be evaluated for each asset.")}</p><div className="miningValueGrid" style={{ marginTop: '2rem' }}>{ownership.map(([title, text]) => <article key={title} style={seasonCard}><h3 style={cardTitle}>{agricultureText(lang, title)}</h3><p style={bodyText}>{agricultureText(lang, text)}</p></article>)}</div></div></section>

      <section style={section} aria-labelledby="decision-title"><div style={contentWidth}><p style={eyebrow}>{agricultureText(lang, "FROM FIELD CONDITION TO PART")}</p><h2 id="decision-title" style={sectionTitle}>{agricultureText(lang, "Resolve the application in five decisions.")}</h2><div style={decisionGrid} className="miningDecisionGrid">{[
        ['Machine', 'Identify the tractor, combine, sprayer, irrigation engine or support asset.'],
        ['Field Condition', 'Define dust, crop residue, moisture, fuel handling, heat and operating intensity.'],
        ['Duty & Service', 'Establish seasonal hours, loading, service access and maintenance window.'],
        ['Protected System', 'Determine whether the primary risk is air intake, hydraulic, fuel, lubrication or cabin air.'],
        ['Application Evidence', 'Confirm the final filter through OEM reference, dimensions and validated application data.'],
      ].map(([title, text]) => <article key={title} style={decisionCard}><h3 style={cardTitle}>{agricultureText(lang, title)}</h3><p style={bodyText}>{agricultureText(lang, text)}</p></article>)}</div></div></section>


      <section style={faqSection} aria-labelledby="faq-title"><div style={contentWidth}><p style={eyebrow}>{agricultureText(lang, "AGRICULTURAL FILTRATION QUESTIONS")}</p><h2 id="faq-title" style={sectionTitle}>{agricultureText(lang, "What operators and maintenance teams need to know.")}</h2><div style={faqList} className="miningFaqGrid">{questions.map(([q, a]) => <article key={q} style={faqItem} className="miningFaqItem"><h3 style={faqQuestion}>{agricultureText(lang, q)}</h3><p style={faqAnswer}>{agricultureText(lang, a)}</p></article>)}</div></div></section>

      <section style={conversionSection}><div style={conversionGrid} className="miningConversionGrid"><div><p style={eyebrow}>{agricultureText(lang, "HAVE A MACHINE OR FIELD-DUTY PROBLEM?")}</p><h2 style={conversionTitle}>{agricultureText(lang, "Identify the protection path before choosing the part.")}</h2><p style={conversionText}>{agricultureText(lang, "Send machine model and serial number, engine, operating hours, protected system, symptoms, service history and current filter references. Include the planned work window.")}</p><Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>{agricultureText(lang, "PLAN AGRICULTURAL MAINTENANCE")}</Link></div><div style={conversionSecondary}><div><p style={eyebrow}>{agricultureText(lang, "ALREADY HAVE A PART NUMBER?")}</p><h3 style={conversionSubTitle}>{agricultureText(lang, "Go directly to Part Search.")}</h3><a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>{agricultureText(lang, "FIND MY FILTER")}</a></div><div style={divider} /><div><p style={eyebrow}>{agricultureText(lang, "SERVE AGRICULTURAL CUSTOMERS?")}</p><h3 style={conversionSubTitle}>{agricultureText(lang, "Evaluate distributor fit.")}</h3><Link href="/distributor-application/" style={secondaryButton}>{agricultureText(lang, "BECOME A DISTRIBUTOR")}</Link></div></div></div></section>
    </main>
  );
}

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';
const yellow: CSSProperties = { color: '#FFF12D' };
const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont, overflowX: 'hidden' };
const hero: CSSProperties = { minHeight: '82vh', background: '#000', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,.08)' };
const heroVideo: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: VIDEO_HERO_TREATMENT.opacity };
const heroShade: CSSProperties = { position: 'absolute', inset: 0, zIndex: 2, background: VIDEO_HERO_TREATMENT.overlayBackground };
const heroInner: CSSProperties = { width: '100%', maxWidth: '1560px', margin: '0 auto', padding: 'clamp(6.75rem,10vw,9rem) clamp(1rem,3.5vw,4.5rem) clamp(3.5rem,5.5vw,5rem)', position: 'relative', zIndex: 3 };
const eyebrow: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.72rem', lineHeight: 1.2, letterSpacing: '.18em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 1rem' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-.055em', lineHeight: .94, fontSize: 'clamp(2.8rem,5.6vw,6.1rem)', textTransform: 'uppercase', margin: 0, maxWidth: '920px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,2vw,1.55rem)', lineHeight: 1.3, fontWeight: 700, maxWidth: '760px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem,1.45vw,1.18rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.78)', maxWidth: '830px', margin: '1rem 0 0' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '2rem' };
const primaryButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.08em', fontSize: '.72rem', padding: '1rem 1.2rem', textTransform: 'uppercase' };
const secondaryButton: CSSProperties = { display: 'inline-block', background: 'transparent', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase', border: '1px solid rgba(255,241,45,.42)' };
const section: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const contentWidth: CSSProperties = { maxWidth: '1560px', margin: '0 auto' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.2rem,4.7vw,4.2rem)', lineHeight: .96, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0, maxWidth: '920px' };
const bodyText: CSSProperties = { fontSize: 'clamp(1.125rem,1.24vw,1.2rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.87)', margin: 0 };
const wideText: CSSProperties = { ...bodyText, maxWidth: '860px', marginTop: '1.3rem' };
const seasonSection: CSSProperties = { ...section, background: 'radial-gradient(circle at 85% 0%,rgba(255,241,45,.06),transparent 30%),#030303' };
const seasonGrid: CSSProperties = { width: '100%', margin: '2rem auto 0' };
const seasonCard: CSSProperties = { background: '#050505', padding: '1.55rem', minHeight: '210px', minWidth: 0 };
const cardTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem,1.8vw,1.35rem)', lineHeight: 1.05, textTransform: 'uppercase', color: '#fff', margin: '0 0 .8rem' };
const equipmentSection: CSSProperties = { ...section, background: '#050505' };
const equipmentGrid: CSSProperties = { width: '100%', margin: '2rem auto 0' };
const equipmentMedia: CSSProperties = { minWidth: 0 };
const equipmentImage: CSSProperties = { width: '100%', height: 'auto', objectFit: 'contain', display: 'block', border: '1px solid rgba(255,255,255,.08)' };
const equipmentCopy: CSSProperties = { minWidth: 0 };
const equipmentList: CSSProperties = { marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,.14)' };
const equipmentRow: CSSProperties = { padding: '.95rem 0', borderBottom: '1px solid rgba(255,255,255,.14)' };
const equipmentName: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(.95rem,1.3vw,1.25rem)', lineHeight: 1.08, textTransform: 'uppercase', fontWeight: 700, color: '#fff', overflowWrap: 'break-word' };
const pathwayGrid: CSSProperties = { marginTop: '2.8rem', display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' };
const pathwayCard: CSSProperties = { border: '1px solid rgba(255,255,255,.1)', background: '#050505', padding: '1.5rem', minHeight: '260px', display: 'grid', gap: '1rem' };
const smallLabel: CSSProperties = { fontFamily: displayFont, fontSize: '.72rem', letterSpacing: '.13em', color: 'rgba(255,255,255,.72)', fontWeight: 700, display: 'block', marginBottom: '.7rem' };
const smallLabelYellow: CSSProperties = { ...smallLabel, color: '#FFF12D' };
const pathwaySource: CSSProperties = { fontFamily: displayFont, fontSize: '1.15rem', color: '#fff', textTransform: 'uppercase' };
const pathwaySystem: CSSProperties = { fontFamily: displayFont, fontSize: '1.05rem', color: '#fff', textTransform: 'uppercase' };
const smallText: CSSProperties = { ...bodyText, fontSize: '1.125rem', lineHeight: 1.55, marginTop: '.6rem' };
const technologyLink: CSSProperties = { textDecoration: 'none', borderTop: '1px solid rgba(255,241,45,.18)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' };
const technologyName: CSSProperties = { fontFamily: displayFont, fontSize: '1.25rem', color: '#FFF12D' };
const technologyCta: CSSProperties = { fontFamily: displayFont, fontSize: '.72rem', letterSpacing: '.1em', color: 'rgba(255,255,255,.6)', marginTop: '.65rem' };
const principleSection: CSSProperties = { padding: '0 clamp(1.25rem,6vw,6rem) clamp(4.5rem,8vw,7rem)' };
const principle: CSSProperties = { ...contentWidth, borderLeft: '4px solid #FFF12D', background: 'linear-gradient(90deg,rgba(255,241,45,.08),rgba(255,255,255,.018))', padding: 'clamp(2rem,4vw,3rem)' };
const principleLabel: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.74rem', letterSpacing: '.16em', fontWeight: 700 };
const principleText: CSSProperties = { fontSize: 'clamp(1.2rem,2vw,1.55rem)', lineHeight: 1.55, color: 'rgba(255,255,255,.9)', margin: '1rem 0 0', maxWidth: '1040px' };
const continuitySection: CSSProperties = { ...section, background: '#050505' };
const continuityGrid: CSSProperties = { width: '100%', margin: '2rem auto 0' };
const continuityCard: CSSProperties = { borderTop: '1px solid rgba(255,255,255,.15)', padding: '1.25rem 0', minHeight: '150px' };
const continuityTitle: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '1.05rem', textTransform: 'uppercase', margin: '0 0 .65rem' };
const decisionGrid: CSSProperties = { width: '100%', margin: '2rem auto 0' };
const decisionCard: CSSProperties = { background: '#030303', minHeight: '205px', padding: '1.5rem', minWidth: 0 };
const faqSection: CSSProperties = { ...section, background: '#070707' };
const faqList: CSSProperties = { width: '100%', margin: '2rem auto 0' };
const faqItem: CSSProperties = { minWidth: 0 };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem,1.8vw,1.3rem)', lineHeight: 1.25, margin: '0 0 .65rem' };
const faqAnswer: CSSProperties = { ...bodyText, maxWidth: '940px', fontSize: 'clamp(1.125rem,1.2vw,1.18rem)' };
const conversionSection: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', background: '#020202', borderTop: '1px solid rgba(255,255,255,.08)' };
const conversionGrid: CSSProperties = { display: 'grid', width: '100%', margin: '2rem auto 0' };
const conversionSecondary: CSSProperties = { display: 'grid', gap: '2.2rem' };
const conversionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2.4rem,5vw,4.6rem)', lineHeight: .95, letterSpacing: '-.04em', textTransform: 'uppercase', maxWidth: '760px', margin: 0 };
const conversionText: CSSProperties = { ...bodyText, fontSize: '1.05rem', maxWidth: '680px', margin: '1.5rem 0 2rem' };
const conversionSubTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.5rem,2.8vw,2.2rem)', textTransform: 'uppercase', margin: '0 0 1.5rem' };
const divider: CSSProperties = { height: '1px', background: 'rgba(255,255,255,.12)' };
