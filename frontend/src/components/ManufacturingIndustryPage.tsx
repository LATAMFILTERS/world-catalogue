import Link from '@/components/LocalizedLink';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import { IndustryFilterCarousel } from './IndustryFilterCarousel';
import { VIDEO_HERO_TREATMENT } from '@/lib/hero-media';
import { manufacturingText } from '@/lib/manufacturing-i18n';
import type { PageLang } from '@/lib/localized-routes';

const BASE_URL = 'https://elimfilters.com';

const assets = [
  'Hydraulic Power Units',
  'Industrial Compressors',
  'Process Pumps',
  'Machine Tools',
  'Production Equipment',
  'Engine-Driven Plant Utilities',
] as const;

const productionPressures = [
  ['Continuous Duty', 'Production equipment may operate across long shifts where a filtration-related interruption can affect more than one machine or workstation.'],
  ['Hydraulic Sensitivity', 'Servo valves, pumps, actuators and precision hydraulic interfaces depend on controlled fluid cleanliness to support repeatable machine response.'],
  ['Plant Air + Particulate', 'Dust and airborne particulate can enter intake paths, housings and service interfaces across compressors, engines and production support equipment.'],
  ['Maintenance Windows', 'Plants often depend on planned shutdowns and scheduled service windows, so part identification and maintenance preparation must be resolved before the line is stopped.'],
] as const;

const pathways = [
  ['HYDRAULIC DEBRIS', 'Ingress + internal wear + service contamination', 'HYDRAULIC', 'NANOFORCE™', '/technologies/nanoforce/'],
  ['ENGINE INTAKE PARTICLES', 'Dust loading, intake seals and filter restriction on diesel-driven plant utilities', 'ENGINE AIR INTAKE', 'MACROCORE™', '/technologies/macrocore/'],
  ['ENGINE LUBRICANT CONTAMINATION', 'Wear debris, soot and contamination during engine servicing', 'ENGINE LUBRICATION', 'SYNTRAX™', '/technologies/syntrax/'],
  ['DIESEL PARTICLES', 'Particulate introduced during stored-diesel transfer and service', 'DIESEL FUEL', 'SYNTAPORE™', '/technologies/syntapore/'],
  ['FUEL + WATER', 'Condensation and free water in diesel storage and transfer', 'FUEL / WATER SEPARATION', 'HYDROCORE™', '/technologies/hydrocore/'],
] as const;

const serviceChecks: Record<string,string> = {
  'NANOFORCE™': 'Record hydraulic-fluid cleanliness against the asset OEM requirement; use clean sampling and review restriction or differential-pressure trends where instruments exist.',
  'MACROCORE™': 'Inspect the diesel-engine air-intake housing and seals, and evaluate restriction against the engine manufacturer limits. Not an industrial compressed-air filter.',
  'SYNTRAX™': 'Check diesel-engine lubricant condition, operating hours, service history and the approved oil-filter application; do not generalize to every industrial oil circuit.',
  'SYNTAPORE™': 'Review stored diesel, transfer cleanliness, particulate loading and the approved fuel-filter application for the specific engine.',
  'HYDROCORE™': 'Check diesel-tank water exposure, separator drainage and seals; use only the approved conventional non-turbine fuel/water separator configuration.'
};

const maintenanceRoles = [
  ['Plant owner / operations director', 'Define the cost of lost production, critical equipment and spare-part coverage. Prioritize the filtration risks that can affect throughput or utility availability.'],
  ['Maintenance manager', 'Plan contamination checks, inventory and isolation procedures before the shutdown window. Document work orders, equipment variants and return-to-service criteria.'],
  ['Reliability / maintenance engineer', 'Use fluid samples, particle-cleanliness targets, measured filter restriction, failure history and OEM limits to approve applications and diagnose repeat faults.'],
  ['Service technician', 'Follow lockout/tagout and machine isolation procedures, prevent dirt ingress during element replacement, verify seals and leaks, and record results before release to operation.']
] as const;

const consequences = [
  ['Production Flow', 'A filtration problem can constrain the machine, utility or support system that a larger production sequence depends on.'],
  ['Machine Precision', 'Hydraulic and lubricated interfaces depend on controlled contamination levels to support consistent motion and repeatable response.'],
  ['Utility Availability', 'Compressors, pumps and engine-driven support equipment can become production bottlenecks when service or contamination interrupts their availability.'],
  ['Planned Maintenance', 'Correct application evidence before shutdown reduces the risk of discovering a mismatch after the maintenance window has already started.'],
  ['Component Protection', 'Filtration helps protect higher-value pumps, valves, bearings, actuators and engine interfaces from avoidable contamination exposure.'],
  ['Process Predictability', 'A disciplined contamination-control path supports more predictable service planning around production schedules and maintenance windows.'],
] as const;

const questions = [
  ['What filtration systems are most important in manufacturing plants?', 'Hydraulic, air intake, lubrication and fuel or water-separation systems are common priorities across hydraulic power units, compressors, process pumps, machine tools and engine-driven plant utilities. The correct priority depends on the machine, protected system, contamination source, duty cycle and maintenance access.'],
  ['Why is hydraulic cleanliness important in manufacturing equipment?', 'Hydraulic power units and machine systems rely on pumps, valves, actuators and precision control interfaces. Contamination can interfere with those surfaces, so filtration should be matched to component sensitivity, pressure, flow, duty and application requirements.'],
  ['How does filtration affect production continuity?', 'Filtration protects machines and utilities that may sit upstream of multiple production steps. The objective is not to claim that a filter alone prevents downtime, but to control contamination around assets whose loss of availability can disrupt planned production.'],
  ['Should manufacturing filters be selected only by service interval?', 'No. A fixed interval does not describe contamination loading, hydraulic sensitivity, fluid condition, machine duty, environment or shutdown access. Service planning should reflect the actual equipment and operating conditions.'],
  ['What information is needed to identify the correct manufacturing filter?', 'Use the machine or asset, protected system, fluid or air path, operating conditions, duty cycle, known OEM or existing filter reference, dimensions when available and validated application evidence.'],
  ['Why does application evidence matter before a planned shutdown?', 'A scheduled maintenance window is more effective when the correct part has already been validated. Equipment context, dimensions, protected system and known references should be reconciled before the machine is taken out of service.'],
  ['Can ELIMFILTERS identify a manufacturing filter from an OEM or part number?', 'A known OEM or installed-filter reference can identify candidate cross-references in Part Search. Final compatibility requires confirming the machine, system, physical interfaces and application evidence; a plausible match is not an approved installation.'],
] as const;

export function ManufacturingIndustryPage({ lang = 'en' }: { lang?: PageLang }) {
  const pageUrl = `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/industries/manufacturing/`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: lang === 'es' ? 'Sistemas de filtración industrial' : lang === 'pt' ? 'Sistemas de filtração industrial' : 'Manufacturing Filtration Systems',
        inLanguage: lang === 'pt' ? 'pt-BR' : lang,
        description: manufacturingText(lang, 'Filtration maintenance engineering for plant owners, technicians and reliability teams protecting approved hydraulic circuits, diesel engines and critical production support assets.'),
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Manufacturing filtration systems' },
          { '@type': 'Thing', name: 'Industrial hydraulic cleanliness' },
          { '@type': 'Thing', name: 'Manufacturing equipment contamination control' },
          { '@type': 'Thing', name: 'Production equipment filtration' },
          { '@type': 'Thing', name: 'Plant maintenance filtration planning' },
          { '@type': 'Thing', name: 'Manufacturing equipment availability' },
        ],
        mentions: [
          { '@type': 'Thing', name: 'Hydraulic filtration' },
          { '@type': 'Thing', name: 'Air intake filtration' },
          { '@type': 'Thing', name: 'Lubrication filtration' },
          { '@type': 'Thing', name: 'Fuel filtration and water separation' },
          { '@type': 'Thing', name: 'NANOFORCE' },
          { '@type': 'Thing', name: 'MACROCORE' },
          { '@type': 'Thing', name: 'SYNTRAX' },
          { '@type': 'Thing', name: 'HYDROCORE' },
          { '@type': 'Thing', name: 'SYNTAPORE' },
        ],
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: lang === 'es' ? 'Inicio' : lang === 'pt' ? 'Início' : 'Home', item: `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/` },
          { '@type': 'ListItem', position: 2, name: lang === 'es' ? 'Industrias' : lang === 'pt' ? 'Indústrias' : 'Industries', item: `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/industries/` },
          { '@type': 'ListItem', position: 3, name: lang === 'es' ? 'Manufactura' : lang === 'pt' ? 'Manufatura' : 'Manufacturing', item: pageUrl },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#equipment`,
        name: manufacturingText(lang, 'Manufacturing equipment applications'),
        itemListElement: assets.map((name, index) => ({ '@type': 'ListItem', position: index + 1, name: manufacturingText(lang, name) })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: questions.map(([q, a]) => ({ '@type': 'Question', name: manufacturingText(lang, q), acceptedAnswer: { '@type': 'Answer', text: manufacturingText(lang, a) } })),
      },
    ],
  };

  return (
    <main id="main-content" className="mining-industry-page manufacturing-industry-page" style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <style>{manufacturingPageLayout}</style>
      <PageHeader currentPage="Manufacturing" />

      <section style={hero}>
        <video className="miningHeroVideo" aria-hidden="true" autoPlay muted loop playsInline preload="auto" style={heroVideo}>
          <source src="/images/Manufacture-1.mp4" type="video/mp4" />
        </video>
        <div className="miningHeroShade" style={heroShade} />
        <div className="miningHeroContainer" style={heroInner}>
          <p style={eyebrow}>{manufacturingText(lang, "MANUFACTURING / PLANT RELIABILITY")}</p>
          <h1 style={heroTitle} className="miningHeroHeading">{manufacturingText(lang, "FILTRATION FOR")}<br /><span style={yellow}>{manufacturingText(lang, "MANUFACTURING ASSETS")}</span></h1>
          <div className="miningHeroLower">
            <div className="miningHeroCopy">
              <p className="miningHeroPromise" style={heroPromise}>{manufacturingText(lang, "Filtration decisions for plant owners, maintenance managers, reliability engineers and technicians protecting production availability.")}</p>
              <p style={heroLead}>{manufacturingText(lang, "Control contamination in specified hydraulic circuits, engine air intake, diesel fuel and engine lubrication. Select components by system requirements, duty, evidence and planned maintenance windows—not by industrial category alone.")}</p>
            </div>
            <div className="miningHeroActions" style={actions}>
              <Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>{manufacturingText(lang, "REVIEW PLANT APPLICATION")}</Link>
              <a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>{manufacturingText(lang, "FIND MY FILTER")}</a>
            </div>
          </div>
        </div>
      </section>

      <section style={directSection} aria-labelledby="manufacturing-direct-title">
        <div style={contentWidth} className="manufacturingEditorialIntro">
          <div>
            <p style={eyebrow}>{manufacturingText(lang, "DIRECT ANSWER")}</p>
            <h2 id="manufacturing-direct-title" style={directTitle}>{manufacturingText(lang, "What defines the correct manufacturing filtration strategy?")}</h2>
          </div>
          <div>
            <p style={directText}>{manufacturingText(lang, "Start with the machine or plant utility, identify the contamination source and protected system, then resolve component sensitivity, duty cycle, shutdown access and application evidence. Manufacturing filtration should support the production process around the asset, not be selected from equipment category or service interval alone.")}</p>
            <p className="manufacturingScope" style={directText}>{manufacturingText(lang, "Product scope: the listed ELIMFILTERS technologies address verified hydraulic, diesel-fuel, engine-air and engine-lubrication applications. They are not specifications for compressed process air, gas treatment or general process-fluid filtration.")}</p>
          </div>
        </div>
      </section>

      <section style={section} aria-labelledby="production-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{manufacturingText(lang, "THE PRODUCTION SYSTEM")}</p>
          <h2 id="production-title" style={sectionTitle}>{manufacturingText(lang, "A machine rarely operates in isolation.")}</h2>
          <p style={wideText}>{manufacturingText(lang, "Manufacturing plants connect machines, utilities and support systems into one operating sequence. The filtration decision should consider what happens to production when one hydraulic unit, compressor, pump or engine-driven utility is unavailable.")}</p>
          <div style={pressureGrid} className="miningRiskGrid">{productionPressures.map(([title, text]) => <article key={title} style={pressureCard} className="miningRiskCard"><h3 style={cardTitle}>{manufacturingText(lang, title)}</h3><p style={bodyText}>{manufacturingText(lang, text)}</p></article>)}</div>
        </div>
      </section>

      <section style={equipmentSection} aria-labelledby="equipment-title">
        <div style={equipmentGrid} className="miningEquipmentGrid">
          <div style={equipmentCopy}>
            <p style={eyebrow}>{manufacturingText(lang, "PLANT ASSETS")}</p>
            <h2 id="equipment-title" style={sectionTitle}>{manufacturingText(lang, "Different roles in the plant create different contamination priorities.")}</h2>
            <p style={wideText}>{manufacturingText(lang, "Hydraulic power, compressed-air support, pumping and machine operations can share the same facility while requiring different protection decisions and service evidence.")}</p>
            <div role="list" aria-label={manufacturingText(lang, "Manufacturing equipment applications")} style={equipmentList}>{assets.map((asset) => <div role="listitem" key={asset} style={equipmentRow}><span style={equipmentName}>{manufacturingText(lang, asset)}</span></div>)}</div>
          </div>
          <div style={equipmentMedia}><img src="/images/manufacture.avif" alt={manufacturingText(lang, "Industrial machinery in a manufacturing facility")} style={equipmentImage} /></div>
        </div>
      </section>

      <section style={section} aria-labelledby="path-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{manufacturingText(lang, "CONTAMINATION PATHWAYS")}</p>
          <h2 id="path-title" style={sectionTitle}>{manufacturingText(lang, "Map the contamination source to the protected production interface.")}</h2>
          <p style={wideText}>{manufacturingText(lang, "Selection should move from contamination source to protected system, then to the appropriate ELIMFILTERS technology and finally to a validated part.")}</p>
          <div className="miningPathwayFlow" style={pathwayGrid}>{pathways.map(([source, detail, system, technology, href]) => <article key={source} style={pathwayCard} className="miningPathwayRow"><div><span style={smallLabel}>{manufacturingText(lang, "CONTAMINATION SOURCE")}</span><strong style={pathwaySource}>{manufacturingText(lang, source)}</strong><p style={smallText}>{manufacturingText(lang, detail)}</p></div><div><span style={smallLabel}>{manufacturingText(lang, "PROTECTION SYSTEM")}</span><strong style={pathwaySystem}>{manufacturingText(lang, system)}</strong></div><div><span style={smallLabel}>{manufacturingText(lang, "MAINTENANCE CHECK")}</span><p style={smallText}>{manufacturingText(lang, serviceChecks[technology])}</p></div><Link href={href} style={technologyLink} className="miningTechnologyCell"><span style={smallLabelYellow}>{manufacturingText(lang, "ELIMFILTERS TECHNOLOGY")}</span><strong style={technologyName}>{technology}</strong><span style={technologyCta}>{manufacturingText(lang, "EXPLORE →")}</span></Link></article>)}</div>
        </div>
      </section>

      <section style={principleSection}>
        <div style={principle} className="manufacturingPrinciple"><span style={principleLabel}>{manufacturingText(lang, "MANUFACTURING ENGINEERING PRINCIPLE")}</span><p style={principleText}>{manufacturingText(lang, "The correct filter protects a production interface, not just a machine. Asset criticality, contamination pathway, component sensitivity, maintenance timing and application evidence must be resolved before the part number is accepted.")}</p></div>
      </section>

      <IndustryFilterCarousel dutyClass="HD" industryName="Manufacturing" lang={lang} />

      <section style={impactSection} aria-labelledby="continuity-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{manufacturingText(lang, "PRODUCTION CONTINUITY")}</p>
          <h2 id="continuity-title" style={sectionTitle}>{manufacturingText(lang, "Protect the bottleneck before it becomes a line constraint.")}</h2>
          <p style={wideText}>{manufacturingText(lang, "Filtration supports the machine and the production sequence around it. The greater the dependency on a shared hydraulic unit, compressor, pump or engine-driven utility, the more important correct contamination control and service preparation become.")}</p>
          <div style={impactGrid} className="miningStakesGrid">{consequences.map(([title, text]) => <article key={title} style={impactCard}><h3 style={impactTitle}>{manufacturingText(lang, title)}</h3><p style={bodyText}>{manufacturingText(lang, text)}</p></article>)}</div>
        </div>
      </section>

      <section style={section} aria-labelledby="manufacturing-roles-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{manufacturingText(lang, "PLANT MAINTENANCE RESPONSIBILITIES")}</p>
          <h2 id="manufacturing-roles-title" style={sectionTitle}>{manufacturingText(lang, "Four accountable decisions before a production asset returns to service.")}</h2>
          <p style={wideText}>{manufacturingText(lang, "Production availability depends on coordinated economic, planning, engineering and technical decisions. Filter installation alone does not certify mechanical, electrical, controls or process safety readiness.")}</p>
          <div style={pressureGrid} className="miningRiskGrid">
            {maintenanceRoles.map(([role, detail]) => <article key={role} style={pressureCard} className="miningRiskCard"><h3 style={cardTitle}>{manufacturingText(lang, role)}</h3><p style={bodyText}>{manufacturingText(lang, detail)}</p></article>)}
          </div>
        </div>
      </section>

      <section style={section} aria-labelledby="decision-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{manufacturingText(lang, "FROM PLANT CONDITION TO PART")}</p>
          <h2 id="decision-title" style={sectionTitle}>{manufacturingText(lang, "Resolve the manufacturing application in five decisions.")}</h2>
          <div style={decisionGrid} className="miningDecisionGrid">{[
            ['Asset', 'Identify the machine, hydraulic power unit, compressor, pump or engine-driven plant utility.'],
            ['Process Role', 'Establish what production step or shared utility depends on the asset.'],
            ['Exposure', 'Define particulate, fluid contamination, storage, service ingress and operating environment.'],
            ['Protection', 'Match the contamination mechanism to hydraulic, air intake, lubrication or fuel protection.'],
            ['Application Evidence', 'Validate the final filter using OEM reference, dimensions and documented equipment evidence before the maintenance window.'],
          ].map(([title, text]) => <article key={title} style={decisionCard}><h3 style={cardTitle}>{manufacturingText(lang, title)}</h3><p style={bodyText}>{manufacturingText(lang, text)}</p></article>)}</div>
        </div>
      </section>

      <section style={evidenceSection} aria-labelledby="evidence-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{manufacturingText(lang, "MAINTENANCE EVIDENCE")}</p>
          <h2 id="evidence-title" style={sectionTitle}>{manufacturingText(lang, "Validate the part before the shutdown starts.")}</h2>
          <p style={wideText}>{manufacturingText(lang, "Manufacturing maintenance often works inside defined windows. Final identification should reconcile the known reference, machine context, dimensions, protected system and operating conditions before the asset is taken out of service.")}</p>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{manufacturingText(lang, "MANUFACTURING FILTRATION QUESTIONS")}</p>
          <h2 id="faq-title" style={sectionTitle}>{manufacturingText(lang, "What plant engineering and maintenance teams need to know.")}</h2>
          <div style={faqList} className="miningFaqGrid">{questions.map(([q, a]) => <article key={q} style={faqItem} className="miningFaqItem"><h3 style={faqQuestion}>{manufacturingText(lang, q)}</h3><p style={faqAnswer}>{manufacturingText(lang, a)}</p></article>)}</div>
        </div>
      </section>

      <section style={conversionSection}>
        <div style={conversionGrid} className="miningConversionGrid">
          <div><p style={eyebrow}>{manufacturingText(lang, "HAVE A MACHINE OR PLANT-UTILITY APPLICATION?")}</p><h2 style={conversionTitle}>{manufacturingText(lang, "Identify the protection path before the maintenance window opens.")}</h2><p style={conversionText}>{manufacturingText(lang, "Provide the exact machine and power-unit identification, protected system, hydraulic fluid or diesel/oil specification, duty, contamination or restriction evidence, current OEM/filter reference and upcoming shutdown window.")}</p><Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>{manufacturingText(lang, "IDENTIFY MY PLANT PROTECTION PATH")}</Link></div>
          <div style={conversionSecondary}><div><p style={eyebrow}>{manufacturingText(lang, "ALREADY HAVE A PART NUMBER?")}</p><h3 style={conversionSubTitle}>{manufacturingText(lang, "Go directly to Part Search.")}</h3><a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>{manufacturingText(lang, "FIND MY FILTER")}</a></div><div style={divider} /><div><p style={eyebrow}>{manufacturingText(lang, "SERVE INDUSTRIAL CUSTOMERS?")}</p><h3 style={conversionSubTitle}>{manufacturingText(lang, "Evaluate distributor fit.")}</h3><Link href="/distributor-application/" style={secondaryButton}>{manufacturingText(lang, "BECOME A DISTRIBUTOR")}</Link></div></div>
        </div>
      </section>
    </main>
  );
}


const manufacturingPageLayout = `
  /* Scoped to Manufacturing. Existing shared industry layouts are reused unchanged. */
  main.manufacturing-industry-page .manufacturingEditorialIntro {
    display:grid;
    width:100%;
    grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);
    gap:clamp(2rem,5vw,5rem);
    align-items:start;
  }
  main.manufacturing-industry-page .manufacturingEditorialIntro > div { min-width:0; }
  main.manufacturing-industry-page .manufacturingScope {
    margin-top:clamp(1.25rem,2vw,2rem) !important;
    padding-left:clamp(1rem,2vw,1.5rem);
    border-left:3px solid #FFF12D;
  }
  main.manufacturing-industry-page .manufacturingPrinciple {
    display:grid;
    grid-template-columns:minmax(0,.52fr) minmax(0,1.48fr);
    align-items:center;
    gap:clamp(1.5rem,4vw,4rem);
  }
  main.manufacturing-industry-page .manufacturingPrinciple > p { margin:0; max-width:none; }
  main.manufacturing-industry-page .miningHeroHeading { max-width:min(100%,1500px) !important; }
  @media (max-width:950px) {
    main.manufacturing-industry-page .manufacturingEditorialIntro,
    main.manufacturing-industry-page .manufacturingPrinciple {
      grid-template-columns:minmax(0,1fr);
      gap:1.5rem;
    }
  }
`;

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';
const yellow: CSSProperties = { color: '#FFF12D' };
const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont, overflowX: 'hidden' };
const hero: CSSProperties = { minHeight: '82vh', background: '#000', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,.08)' };
const heroVideo: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: VIDEO_HERO_TREATMENT.opacity };
const heroShade: CSSProperties = { position: 'absolute', inset: 0, zIndex: 2, background: VIDEO_HERO_TREATMENT.overlayBackground };
const heroInner: CSSProperties = { width: '100%', maxWidth: '1560px', margin: '0 auto', padding: 'clamp(6.75rem,10vw,9rem) clamp(1rem,3.5vw,4.5rem) clamp(3.5rem,5.5vw,5rem)', position: 'relative', zIndex: 3 };
const eyebrow: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.72rem', lineHeight: 1.2, letterSpacing: '.18em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 1rem' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-.055em', lineHeight: .94, fontSize: 'clamp(2.65rem,4.9vw,5.65rem)', textTransform: 'uppercase', margin: 0, maxWidth: '1000px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,2vw,1.55rem)', lineHeight: 1.3, fontWeight: 700, maxWidth: '820px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem,1.45vw,1.18rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.78)', maxWidth: '900px', margin: '1rem 0 0' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '2rem' };
const primaryButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase' };
const secondaryButton: CSSProperties = { display: 'inline-block', background: 'transparent', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase', border: '1px solid rgba(255,241,45,.42)' };
const directSection: CSSProperties = { padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,6vw,6rem)', background: '#050505', borderBottom: '1px solid rgba(255,255,255,.08)' };
const contentWidth: CSSProperties = { maxWidth: '1560px', margin: '0 auto' };
const directTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem,3.3vw,3.2rem)', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-.035em', margin: 0 };
const directText: CSSProperties = { fontSize: 'clamp(1.05rem,1.5vw,1.22rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.85)', margin: 0 };
const section: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.2rem,4.7vw,4.2rem)', lineHeight: .96, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0, maxWidth: '980px' };
const bodyText: CSSProperties = { fontSize: 'clamp(1.08rem,1.18vw,1.2rem)', lineHeight: 1.68, color: 'rgba(255,255,255,.83)', margin: 0 };
const wideText: CSSProperties = { ...bodyText, maxWidth: '100%', marginTop: '1.3rem' };
const pressureGrid: CSSProperties = { width: '100%', marginTop: '2rem' };
const pressureCard: CSSProperties = { background: '#050505', padding: '1.55rem', minHeight: '195px', minWidth: 0 };
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
const smallLabel: CSSProperties = { fontFamily: displayFont, fontSize: '.72rem', letterSpacing: '.13em', color: 'rgba(255,255,255,.72)', fontWeight: 700, display: 'block', marginBottom: '.7rem' };
const smallLabelYellow: CSSProperties = { ...smallLabel, color: '#FFF12D' };
const pathwaySource: CSSProperties = { fontFamily: displayFont, fontSize: '1.15rem', color: '#fff', textTransform: 'uppercase' };
const pathwaySystem: CSSProperties = { fontFamily: displayFont, fontSize: '1.05rem', color: '#fff', textTransform: 'uppercase' };
const smallText: CSSProperties = { ...bodyText, fontSize: '1.08rem', lineHeight: 1.55, marginTop: '.6rem' };
const technologyLink: CSSProperties = { textDecoration: 'none', borderTop: '1px solid rgba(255,241,45,.18)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' };
const technologyName: CSSProperties = { fontFamily: displayFont, fontSize: '1.25rem', color: '#FFF12D' };
const technologyCta: CSSProperties = { fontFamily: displayFont, fontSize: '.72rem', letterSpacing: '.1em', color: 'rgba(255,255,255,.6)', marginTop: '.65rem' };
const principleSection: CSSProperties = { padding: '0 clamp(1.25rem,6vw,6rem) clamp(4.5rem,8vw,7rem)' };
const principle: CSSProperties = { ...contentWidth, borderLeft: '4px solid #FFF12D', background: 'linear-gradient(90deg,rgba(255,241,45,.08),rgba(255,255,255,.018))', padding: 'clamp(2rem,4vw,3rem)' };
const principleLabel: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.74rem', letterSpacing: '.16em', fontWeight: 700 };
const principleText: CSSProperties = { fontSize: 'clamp(1.2rem,2vw,1.55rem)', lineHeight: 1.55, color: 'rgba(255,255,255,.9)', margin: '1rem 0 0', maxWidth: '1040px' };
const impactSection: CSSProperties = { ...section, background: '#050505' };
const impactGrid: CSSProperties = { width: '100%', marginTop: '2rem' };
const impactCard: CSSProperties = { borderTop: '1px solid rgba(255,255,255,.15)', padding: '1.25rem 0', minHeight: '150px' };
const impactTitle: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '1.05rem', textTransform: 'uppercase', margin: '0 0 .65rem' };
const decisionGrid: CSSProperties = { width: '100%', marginTop: '2rem' };
const decisionCard: CSSProperties = { background: '#030303', minHeight: '205px', padding: '1.5rem', minWidth: 0 };
const evidenceSection: CSSProperties = { ...section, background: 'linear-gradient(90deg,rgba(255,241,45,.045),#030303 38%)' };
const faqSection: CSSProperties = { ...section, background: '#070707' };
const faqList: CSSProperties = { width: '100%', marginTop: '2rem' };
const faqItem: CSSProperties = { minWidth: 0 };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem,1.8vw,1.3rem)', lineHeight: 1.25, margin: '0 0 .65rem' };
const faqAnswer: CSSProperties = { ...bodyText, maxWidth: '100%', fontSize: 'clamp(1.04rem,1.15vw,1.18rem)' };
const conversionSection: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', background: '#020202', borderTop: '1px solid rgba(255,255,255,.08)' };
const conversionGrid: CSSProperties = { width: '100%', display: 'grid', margin: '2rem auto 0' };
const conversionSecondary: CSSProperties = { display: 'grid', gap: '2.2rem' };
const conversionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2.4rem,5vw,4.6rem)', lineHeight: .95, letterSpacing: '-.04em', textTransform: 'uppercase', maxWidth: '760px', margin: 0 };
const conversionText: CSSProperties = { ...bodyText, fontSize: '1.05rem', maxWidth: '680px', margin: '1.5rem 0 2rem' };
const conversionSubTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.5rem,2.8vw,2.2rem)', textTransform: 'uppercase', margin: '0 0 1.5rem' };
const divider: CSSProperties = { height: '1px', background: 'rgba(255,255,255,.12)' };