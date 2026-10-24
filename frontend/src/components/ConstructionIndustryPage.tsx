import Link from '@/components/LocalizedLink';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import { IndustryFilterCarousel } from './IndustryFilterCarousel';
import { VIDEO_HERO_TREATMENT } from '@/lib/hero-media';
import { constructionText } from '@/lib/construction-i18n';
import type { PageLang } from '@/lib/localized-routes';

const BASE_URL = 'https://elimfilters.com';

const equipment = ['Excavators', 'Wheel Loaders', 'Bulldozers', 'Motor Graders', 'Compactors', 'Articulated Dump Trucks'] as const;

const jobsitePressures = [
  ['Abrasive Dust', 'Silica-rich dust, fine soil and demolition particulate can load air-intake systems quickly and challenge sealing integrity.'],
  ['Hydraulic Demand', 'Excavation, lifting, grading and steering depend on pumps, valves and actuators operating under pressure and repeated load changes.'],
  ['Fuel Handling', 'Mobile refueling, storage, transfer equipment and jobsite moisture can introduce particulate and water before fuel reaches sensitive engine interfaces.'],
  ['Start-Stop Duty', 'Frequent idle, restart, thermal cycling, vibration and short service windows change how contamination and maintenance interact.'],
] as const;

const protection = [
  ['SILICA + JOBSITE DUST', 'Airborne abrasive particulate', 'AIR INTAKE', 'MACROCORE™', '/technologies/macrocore/'],
  ['HYDRAULIC DEBRIS', 'Ingress + wear particles + service contamination', 'HYDRAULIC', 'NANOFORCE™', '/technologies/nanoforce/'],
  ['FUEL + MOISTURE', 'Bulk fuel storage, transfer and mobile refueling', 'FUEL', 'HYDROCORE™', '/technologies/hydrocore/'],
  ['FUEL PARTICULATE', 'Particles entering during refueling and handling', 'FUEL', 'SYNTAPORE™', '/technologies/syntapore/'],
  ['CABIN DUST', 'Airborne soil, demolition dust and site debris', 'CABIN AIR', 'MICROKAPPA™', '/technologies/microkappa/'],
  ['LUBE CONTAMINATION', 'Wear debris + soot + service ingress', 'LUBRICATION', 'SYNTRAX™', '/technologies/syntrax/'],
] as const;

const serviceChecks: Record<string, string> = {
  'AIR INTAKE': 'Inspect restriction indication, intake duct integrity and seals according to the machine manual.',
  'HYDRAULIC': 'Check fluid cleanliness requirements, hose couplings and clean handling during attachment changes.',
  'HYDROCORE™': 'Inspect storage and mobile refueling practices; check water drainage, sealing and the specified separator application.',
  'SYNTAPORE™': 'Review particulate contamination during storage and refueling, fuel-filter restriction and the specified fuel-filter application.'
  'LUBRICATION': 'Review oil condition, operating hours and the machine-specific filter and service requirements.',
  'CABIN AIR': 'Inspect cabin seals and the specified cabin filter; particulate filtration does not establish respiratory protection against hazardous dust.'
};

const ownership = [
  ['Equipment owner', 'Prioritize critical excavators, loaders and supporting machines by project dependency, operating hours and available replacement capacity.'],
  ['Maintenance contractor', 'Plan safe isolation, service access, correct parts, clean handling and documentation of installed references and completed work.'],
  ['Return to service', "Verify sealing, leaks, instrument indications and hydraulic response using the equipment manufacturer's procedure before releasing the machine to the jobsite."]
] as const;

const consequences = [
  ['Schedule Risk', 'A machine removed from service can affect crews, sequencing and the next dependent task on the jobsite.'],
  ['Hydraulic Response', 'Contamination can compromise the precision interfaces that control digging, lifting, grading and steering functions.'],
  ['Engine Protection', 'Air and fuel contamination can increase the burden on combustion-system protection during dusty, mobile operation.'],
  ['Service Predictability', 'Jobsite conditions should inform inspection and service decisions instead of relying on calendar intervals alone.'],
  ['Component Life', 'Contamination control helps protect pumps, valves, injectors, bearings and other high-value serviceable components.'],
  ['Fleet Availability', 'Consistent filtration discipline supports more predictable equipment availability across active projects.'],
] as const;

const questions = [
  ['Why is construction filtration different from normal road service?', 'Construction equipment operates in concentrated dust, vibration, hydraulic load, repeated start-stop cycles and changing jobsite conditions. Those factors increase contamination exposure and make service access less predictable, so filtration should be selected around the actual duty cycle rather than a generic maintenance interval.'],
  ['Which filtration systems are most important on excavators and loaders?', 'Air intake, hydraulic, fuel and lubrication systems are usually central to construction equipment protection. The priority depends on the machine, jobsite contamination, hydraulic sensitivity, fuel-handling conditions and service schedule.'],
  ['How does silica dust affect construction equipment?', 'Fine silica-rich dust can load the air-intake system and challenge sealing interfaces. If particulate bypasses the intended protection path, it can reach sensitive engine surfaces and contribute to abrasive wear. Restriction trend, sealing integrity and service practice should therefore be evaluated together.'],
  ['Why is hydraulic cleanliness critical on construction machinery?', 'Excavators, loaders, dozers and graders rely on high-pressure pumps, valves and actuators. Contamination can interfere with those precision interfaces, so hydraulic filtration should be matched to fluid cleanliness requirements, pressure, duty cycle and component sensitivity.'],
  ['How can construction fuel become contaminated on a jobsite?', 'Fuel can pick up particulate or water through storage tanks, transfer equipment, mobile refueling, tank breathing and condensation. The protection strategy should consider the complete handling path before fuel reaches the engine.'],
  ['Should construction filters be selected by service interval alone?', 'No. Service interval is only one input. The final selection should also resolve the machine, protected system, contamination source, component sensitivity, duty cycle, sealing condition and available application evidence.'],
  ['What information is needed to identify the correct construction filter?', 'Provide the machine, engine or equipment model, protected system, duty conditions, any known OEM or current filter number, and relevant dimensions when available. This creates a stronger application-evidence path than selecting from equipment category alone.'],
  ['Can ELIMFILTERS identify a construction filter from an OEM or part number?', 'Yes. If the OEM reference or current filter number is known, Part Search provides the fastest route to cross-reference and application information. For an engineering review, include the machine, engine, protected system and jobsite conditions.'],
] as const;

export function ConstructionIndustryPage({ lang = 'en' }: { lang?: PageLang }) {
  const pageUrl = `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/industries/construction/`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: lang === 'es' ? 'Sistemas de filtración para construcción' : lang === 'pt' ? 'Sistemas de filtração para construção' : 'Construction Filtration Systems',
        inLanguage: lang === 'pt' ? 'pt-BR' : lang,
        description: 'Construction filtration systems and contamination-control architecture for excavators, loaders, dozers, graders, compactors and articulated dump trucks operating in abrasive jobsite conditions.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Construction filtration systems' },
          { '@type': 'Thing', name: 'Construction equipment contamination control' },
          { '@type': 'Thing', name: 'Excavator filtration' },
          { '@type': 'Thing', name: 'Hydraulic cleanliness in construction equipment' },
          { '@type': 'Thing', name: 'Jobsite dust contamination' },
          { '@type': 'Thing', name: 'Construction equipment fuel contamination' },
          { '@type': 'Thing', name: 'Construction fleet availability' },
        ],
        mentions: [
          { '@type': 'Thing', name: 'Air intake filtration' },
          { '@type': 'Thing', name: 'Hydraulic filtration' },
          { '@type': 'Thing', name: 'Fuel filtration and water separation' },
          { '@type': 'Thing', name: 'Lubrication filtration' },
          { '@type': 'Thing', name: 'MACROCORE' },
          { '@type': 'Thing', name: 'NANOFORCE' },
          { '@type': 'Thing', name: 'HYDROCORE' },
          { '@type': 'Thing', name: 'SYNTAPORE' },
          { '@type': 'Thing', name: 'MICROKAPPA' },
          { '@type': 'Thing', name: 'SYNTRAX' },
        ],
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: lang === 'es' ? 'Inicio' : lang === 'pt' ? 'Início' : 'Home', item: `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/` },
          { '@type': 'ListItem', position: 2, name: lang === 'es' ? 'Industrias' : lang === 'pt' ? 'Indústrias' : 'Industries', item: `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/industries/` },
          { '@type': 'ListItem', position: 3, name: lang === 'es' ? 'Construcción' : lang === 'pt' ? 'Construção' : 'Construction', item: pageUrl },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#equipment`,
        name: 'Construction equipment applications',
        itemListElement: equipment.map((name, index) => ({ '@type': 'ListItem', position: index + 1, name: constructionText(lang, name) })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: questions.map(([q, a]) => ({ '@type': 'Question', name: constructionText(lang, q), acceptedAnswer: { '@type': 'Answer', text: constructionText(lang, a) } })),
      },
    ],
  };

  return (
    <main id="main-content" className="mining-industry-page construction-industry-page" style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHeader currentPage="Construction" />

      <section style={hero}>
        <video className="miningHeroVideo" aria-hidden="true" autoPlay muted loop playsInline preload="auto" style={heroVideo}><source src="/images/construction-2.mp4" type="video/mp4" /></video>
        <div className="miningHeroShade" style={heroShade} />
        <div className="miningHeroContainer" style={heroInner}>
          <p style={eyebrow}>{constructionText(lang, "CONSTRUCTION / JOBSITE ASSET PROTECTION")}</p>
          <h1 style={heroTitle} className="miningHeroHeading">{constructionText(lang, "FILTRATION FOR")}<br /><span style={yellow}>{constructionText(lang, "CONSTRUCTION EQUIPMENT")}</span></h1>
          <div className="miningHeroLower">
            <div className="miningHeroCopy">
              <p style={heroPromise} className="miningHeroPromise">{constructionText(lang, "Technical protection for construction equipment owners, fleet managers and maintenance contractors.")}</p>
              <p style={heroLead}>{constructionText(lang, "Air intake, hydraulic, fuel and lubrication contamination control for excavators, loaders, dozers, graders, compactors and articulated dump trucks operating in abrasive dust, vibration, heat and severe off-road duty.")}</p>
            </div>
            <div style={actions} className="miningHeroActions">
              <Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>{constructionText(lang, "PLAN CONSTRUCTION MAINTENANCE")}</Link>
              <a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>{constructionText(lang, "FIND MY FILTER")}</a>
            </div>
          </div>
        </div>
      </section>

      <section style={directAnswerSection} aria-labelledby="direct-answer-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{constructionText(lang, "DIRECT ANSWER")}</p>
          <h2 id="direct-answer-title" style={directAnswerTitle}>{constructionText(lang, "What should a construction filtration strategy protect?")}</h2>
          <p style={directAnswerText}>{constructionText(lang, "A construction filtration strategy should protect the machine systems most exposed to jobsite contamination: engine air intake, hydraulic circuits, fuel handling and delivery, and lubrication. Final filter selection should then be resolved from the machine, contamination source, component sensitivity, duty cycle, service conditions and validated application evidence.")}</p>
        </div>
      </section>

      <section style={section} aria-labelledby="jobsite-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{constructionText(lang, "JOBSITE REALITY")}</p>
          <h2 id="jobsite-title" style={sectionTitle}>{constructionText(lang, "The contamination load changes with the work being done.")}</h2>
          <p style={wideText}>{constructionText(lang, "Construction equipment moves between excavation, loading, grading, demolition, compaction and haulage. The machine may stay on one project while the contamination mechanism and duty cycle change several times.")}</p>
          <div style={pressureGrid} className="miningRiskGrid">{jobsitePressures.map(([title, text]) => <article key={title} style={pressureCard} className="miningRiskCard"><h3 style={cardTitle}>{constructionText(lang, title)}</h3><p style={bodyText}>{constructionText(lang, text)}</p></article>)}</div>
        </div>
      </section>

      <section style={equipmentSection} aria-labelledby="equipment-title">
        <div style={equipmentGrid} className="miningEquipmentGrid">
          <div style={equipmentCopy}>
            <h2 id="equipment-title" style={sectionTitle}>{constructionText(lang, "Different machines. Different jobsite exposure.")}</h2>
            <p style={wideText}>{constructionText(lang, "An excavator, loader and grader can operate yards apart and still require different filtration priorities because their airflow, hydraulic load, duty cycle and service access are not the same.")}</p>
            <div role="list" aria-label="Construction equipment applications" style={equipmentList}>{equipment.map((asset) => <div role="listitem" key={asset} style={equipmentRow}><span style={equipmentName}>{constructionText(lang, asset)}</span></div>)}</div>
          </div>
          <div style={equipmentMedia}><img src="/images/construccion.avif" alt="Construction equipment operating in severe jobsite conditions" style={equipmentImage} /></div>
        </div>
      </section>

      <section style={section} aria-labelledby="protection-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{constructionText(lang, "CONTAMINATION PATHWAYS")}</p>
          <h2 id="protection-title" style={sectionTitle}>{constructionText(lang, "Connect the jobsite threat to the system that must stay protected.")}</h2>
          <p style={wideText}>{constructionText(lang, "Construction filtration should begin with the contamination source and protected interface, then resolve the appropriate system, technology and final part.")}</p>
          <div className="miningPathwayFlow" style={pathwayGrid}>{protection.map(([source, detail, system, technology, href]) => <article key={source} style={pathwayCard} className="miningPathwayRow"><div><span style={smallLabel}>{constructionText(lang, "CONTAMINATION SOURCE")}</span><strong style={pathwaySource}>{constructionText(lang, source)}</strong><p style={smallText}>{constructionText(lang, detail)}</p></div><div><span style={smallLabel}>{constructionText(lang, "PROTECTION SYSTEM")}</span><strong style={pathwaySystem}>{constructionText(lang, system)}</strong></div><div><span style={smallLabel}>{constructionText(lang, "SERVICE CHECK")}</span><p style={smallText}>{constructionText(lang, serviceChecks[technology] ?? serviceChecks[system])}</p></div><Link href={href} style={technologyLink} className="miningTechnologyCell"><span style={smallLabelYellow}>{constructionText(lang, "ELIMFILTERS TECHNOLOGY")}</span><strong style={technologyName}>{technology}</strong><span style={technologyCta}>{constructionText(lang, "EXPLORE →")}</span></Link></article>)}</div>
        </div>
      </section>

      <section style={principleSection}>
        <div style={principle}><span style={principleLabel}>{constructionText(lang, "CONSTRUCTION ENGINEERING PRINCIPLE")}</span><p style={principleText}>{constructionText(lang, "The correct filter is determined by the machine, jobsite contamination, protected system, component sensitivity, duty cycle and service reality—not by equipment category alone.")}</p></div>
      </section>

      <IndustryFilterCarousel dutyClass="HD" industryName="Construction" lang={lang} />

      <section style={impactSection} aria-labelledby="impact-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{constructionText(lang, "PROJECT CONTINUITY")}</p>
          <h2 id="impact-title" style={sectionTitle}>{constructionText(lang, "Protect the operating chain before contamination reaches the schedule.")}</h2>
          <p style={wideText}>{constructionText(lang, "A filtration problem on one machine can become a production problem for the crew, the next task and the project sequence. Contamination control therefore supports more than component protection.")}</p>
          <div style={impactGrid} className="miningStakesGrid">{consequences.map(([title, text]) => <article key={title} style={impactCard}><h3 style={impactTitle}>{constructionText(lang, title)}</h3><p style={bodyText}>{constructionText(lang, text)}</p></article>)}</div>
        </div>
      </section>

      <section style={section} aria-labelledby="construction-tco-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{constructionText(lang, "AVAILABILITY & OWNERSHIP COST")}</p>
          <h2 id="construction-tco-title" style={sectionTitle}>{constructionText(lang, "Protect the machine. Control maintenance risk. Keep the project moving.")}</h2>
          <p style={wideText}>{constructionText(lang, "The price of a filter is only part of a service decision. Downtime can affect paid crews, rented equipment, subcontractor sequencing, field travel and the date a machine returns to productive work.")}</p>
          <div className="miningValueGrid" style={{ marginTop: '2rem' }}>
            {ownership.map(([title, description]) => <article key={title} style={pressureCard}><h3 style={cardTitle}>{constructionText(lang, title)}</h3><p style={bodyText}>{constructionText(lang, description)}</p></article>)}
          </div>
        </div>
      </section>

      <section style={section} aria-labelledby="decision-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{constructionText(lang, "FROM JOBSITE TO PART")}</p>
          <h2 id="decision-title" style={sectionTitle}>{constructionText(lang, "Resolve the construction application in five decisions.")}</h2>
          <div style={decisionGrid} className="miningDecisionGrid">{[
            ['Machine', 'Identify the excavator, loader, dozer, grader, compactor or haul unit.'],
            ['Jobsite', 'Define dust, demolition debris, moisture, fuel handling, heat and vibration exposure.'],
            ['Duty', 'Establish operating hours, hydraulic demand, start-stop pattern and service access.'],
            ['Protection', 'Match the contamination mechanism to air intake, hydraulic, fuel or lubrication protection.'],
            ['Part', 'Resolve the product through OEM reference, dimensions and validated application evidence.'],
          ].map(([title, text]) => <article key={title} style={decisionCard}><h3 style={cardTitle}>{constructionText(lang, title)}</h3><p style={bodyText}>{constructionText(lang, text)}</p></article>)}</div>
        </div>
      </section>

      <section style={evidenceSection} aria-labelledby="evidence-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{constructionText(lang, "APPLICATION EVIDENCE")}</p>
          <h2 id="evidence-title" style={sectionTitle}>{constructionText(lang, "Selection should end with evidence, not assumption.")}</h2>
          <p style={wideText}>{constructionText(lang, "A construction application becomes stronger when the equipment identity, protected system and operating reality are checked against available OEM references, current filter numbers, dimensions and documented application evidence before the final product is selected.")}</p>
          <div style={evidenceGrid} className="miningValueGrid">
            <article style={evidenceCard}><h3 style={cardTitle}>{constructionText(lang, "Identify the asset")}</h3><p style={bodyText}>{constructionText(lang, "Machine, engine, model and protected system establish the technical context.")}</p></article>
            <article style={evidenceCard}><h3 style={cardTitle}>{constructionText(lang, "Define the exposure")}</h3><p style={bodyText}>{constructionText(lang, "Dust, moisture, fuel handling, hydraulic demand, vibration and service access define the operating reality.")}</p></article>
            <article style={evidenceCard}><h3 style={cardTitle}>{constructionText(lang, "Validate the part")}</h3><p style={bodyText}>{constructionText(lang, "OEM references, current filter numbers, dimensions and application evidence support final product identification.")}</p></article>
          </div>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{constructionText(lang, "CONSTRUCTION FILTRATION QUESTIONS")}</p>
          <h2 id="faq-title" style={sectionTitle}>{constructionText(lang, "What fleet and maintenance teams need to know.")}</h2>
          <div style={faqList} className="miningFaqGrid">{questions.map(([q, a]) => <article key={q} style={faqItem} className="miningFaqItem"><h3 style={faqQuestion}>{constructionText(lang, q)}</h3><p style={faqAnswer}>{constructionText(lang, a)}</p></article>)}</div>
        </div>
      </section>

      <section style={conversionSection}>
        <div style={conversionGrid} className="miningConversionGrid">
          <div><p style={eyebrow}>{constructionText(lang, "NEED TO RESOLVE A CONSTRUCTION APPLICATION?")}</p><h2 style={conversionTitle}>{constructionText(lang, "Identify the protection path before choosing the part.")}</h2><p style={conversionText}>{constructionText(lang, "Send machine model and serial number, engine, operating hours, protected system, site conditions, symptoms, service history and current filter references. Include the project's planned maintenance window.")}</p><Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>{constructionText(lang, "IDENTIFY MY PROTECTION PATH")}</Link></div>
          <div style={conversionSecondary}><div><p style={eyebrow}>{constructionText(lang, "ALREADY HAVE A PART NUMBER?")}</p><h3 style={conversionSubTitle}>{constructionText(lang, "Go directly to Part Search.")}</h3><a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>{constructionText(lang, "FIND MY FILTER")}</a></div><div style={divider} /><div><p style={eyebrow}>{constructionText(lang, "SERVE CONSTRUCTION CUSTOMERS?")}</p><h3 style={conversionSubTitle}>{constructionText(lang, "Evaluate distributor fit.")}</h3><Link href="/distributor-application/" style={secondaryButton}>{constructionText(lang, "BECOME A DISTRIBUTOR")}</Link></div></div>
        </div>
      </section>
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
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-.055em', lineHeight: .94, fontSize: 'clamp(2.7rem,5.1vw,5.7rem)', textTransform: 'uppercase', margin: 0, maxWidth: '920px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,2vw,1.55rem)', lineHeight: 1.3, fontWeight: 700, maxWidth: '760px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem,1.45vw,1.18rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.78)', maxWidth: '840px', margin: '1rem 0 0' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '2rem' };
const primaryButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase' };
const secondaryButton: CSSProperties = { display: 'inline-block', background: 'transparent', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase', border: '1px solid rgba(255,241,45,.42)' };
const directAnswerSection: CSSProperties = { padding: 'clamp(3rem,5vw,4.5rem) clamp(1.25rem,6vw,6rem)', background: '#030303', borderBottom: '1px solid rgba(255,255,255,.08)' };
const directAnswerTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(1.8rem,3.4vw,3rem)', lineHeight: 1, letterSpacing: '-.03em', textTransform: 'uppercase', margin: 0, maxWidth: '900px' };
const directAnswerText: CSSProperties = { fontSize: 'clamp(1.02rem,1.6vw,1.2rem)', lineHeight: 1.75, color: 'rgba(255,255,255,.82)', maxWidth: '980px', margin: '1.25rem 0 0' };
const section: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const contentWidth: CSSProperties = { maxWidth: '1560px', margin: '0 auto' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.2rem,4.7vw,4.2rem)', lineHeight: .96, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0, maxWidth: '920px' };
const bodyText: CSSProperties = { fontSize: 'clamp(1.125rem,1.24vw,1.2rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.82)', margin: 0 };
const wideText: CSSProperties = { ...bodyText, maxWidth: '860px', marginTop: '1.3rem' };
const pressureGrid: CSSProperties = { width: '100%', marginTop: '2rem' };
const pressureCard: CSSProperties = { background: '#050505', padding: '1.55rem', minHeight: '190px', minWidth: 0 };
const cardTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem,1.8vw,1.35rem)', lineHeight: 1.05, textTransform: 'uppercase', color: '#fff', margin: '0 0 .8rem' };
const equipmentSection: CSSProperties = { ...section, background: '#050505' };
const equipmentGrid: CSSProperties = { width: '100%', margin: '2rem auto 0', alignItems: 'center' };
const equipmentCopy: CSSProperties = { minWidth: 0 };
const equipmentMedia: CSSProperties = { minWidth: 0 };
const equipmentImage: CSSProperties = { width: '100%', height: 'auto', objectFit: 'contain', display: 'block', border: '1px solid rgba(255,255,255,.08)' };
const equipmentList: CSSProperties = { marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,.14)' };
const equipmentRow: CSSProperties = { padding: '.95rem 0', borderBottom: '1px solid rgba(255,255,255,.14)' };
const equipmentName: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(.95rem,1.3vw,1.25rem)', lineHeight: 1.08, textTransform: 'uppercase', fontWeight: 700, color: '#fff', overflowWrap: 'break-word' };
const pathwayGrid: CSSProperties = { width: '100%', marginTop: '2rem', display: 'grid', gap: '1rem' };
const pathwayCard: CSSProperties = { border: '1px solid rgba(255,255,255,.1)', background: '#050505', padding: '1.5rem', minHeight: '260px', display: 'grid', gap: '1rem' };
const smallLabel: CSSProperties = { fontFamily: displayFont, fontSize: '.58rem', letterSpacing: '.13em', color: 'rgba(255,255,255,.4)', fontWeight: 700, display: 'block', marginBottom: '.7rem' };
const smallLabelYellow: CSSProperties = { ...smallLabel, color: '#FFF12D' };
const pathwaySource: CSSProperties = { fontFamily: displayFont, fontSize: '1.15rem', color: '#fff', textTransform: 'uppercase' };
const pathwaySystem: CSSProperties = { fontFamily: displayFont, fontSize: '1.05rem', color: '#fff', textTransform: 'uppercase' };
const smallText: CSSProperties = { ...bodyText, fontSize: '1.1rem', lineHeight: 1.55, marginTop: '.6rem' };
const technologyLink: CSSProperties = { textDecoration: 'none', borderTop: '1px solid rgba(255,241,45,.18)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' };
const technologyName: CSSProperties = { fontFamily: displayFont, fontSize: '1.25rem', color: '#FFF12D' };
const technologyCta: CSSProperties = { fontFamily: displayFont, fontSize: '.72rem', letterSpacing: '.1em', color: 'rgba(255,255,255,.6)', marginTop: '.65rem' };
const principleSection: CSSProperties = { padding: '0 clamp(1.25rem,6vw,6rem) clamp(4.5rem,8vw,7rem)' };
const principle: CSSProperties = { ...contentWidth, borderLeft: '4px solid #FFF12D', background: 'linear-gradient(90deg,rgba(255,241,45,.08),rgba(255,255,255,.018))', padding: 'clamp(2rem,4vw,3rem)' };
const principleLabel: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.74rem', letterSpacing: '.16em', fontWeight: 700 };
const principleText: CSSProperties = { fontSize: 'clamp(1.2rem,2vw,1.55rem)', lineHeight: 1.55, color: 'rgba(255,255,255,.9)', margin: '1rem 0 0', maxWidth: '1040px' };
const impactSection: CSSProperties = { ...section, background: '#050505' };
const impactGrid: CSSProperties = { width: '100%', marginTop: '2.5rem' };
const impactCard: CSSProperties = { borderTop: '1px solid rgba(255,255,255,.15)', padding: '1.25rem 0', minHeight: '150px' };
const impactTitle: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '1.05rem', textTransform: 'uppercase', margin: '0 0 .65rem' };
const decisionGrid: CSSProperties = { width: '100%', marginTop: '2.6rem' };
const decisionCard: CSSProperties = { background: '#030303', minHeight: '200px', padding: '1.5rem', minWidth: 0 };
const evidenceSection: CSSProperties = { ...section, background: '#020202' };
const evidenceGrid: CSSProperties = { width: '100%', marginTop: '2.5rem' };
const evidenceCard: CSSProperties = { borderTop: '2px solid rgba(255,241,45,.7)', background: '#060606', padding: '1.5rem', minHeight: '170px' };
const faqSection: CSSProperties = { ...section, background: '#070707' };
const faqList: CSSProperties = { marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,.12)' };
const faqItem: CSSProperties = { padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,.12)' };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem,1.8vw,1.3rem)', lineHeight: 1.25, margin: '0 0 .65rem' };
const faqAnswer: CSSProperties = { ...bodyText, maxWidth: '940px', fontSize: '.96rem' };
const conversionSection: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', background: '#020202', borderTop: '1px solid rgba(255,255,255,.08)' };
const conversionGrid: CSSProperties = { width: '100%', display: 'grid', gap: 'clamp(2.5rem,6vw,5rem)' };
const conversionSecondary: CSSProperties = { display: 'grid', gap: '2.2rem' };
const conversionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2.4rem,5vw,4.6rem)', lineHeight: .95, letterSpacing: '-.04em', textTransform: 'uppercase', maxWidth: '760px', margin: 0 };
const conversionText: CSSProperties = { ...bodyText, fontSize: '1.05rem', maxWidth: '680px', margin: '1.5rem 0 2rem' };
const conversionSubTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.5rem,2.8vw,2.2rem)', textTransform: 'uppercase', margin: '0 0 1.5rem' };
const divider: CSSProperties = { height: '1px', background: 'rgba(255,255,255,.12)' };
