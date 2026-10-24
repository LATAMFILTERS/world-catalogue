import Link from '@/components/LocalizedLink';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import { IndustryFilterCarousel } from './IndustryFilterCarousel';
import { VIDEO_HERO_TREATMENT } from '@/lib/hero-media';
import { oilGasText } from '@/lib/oil-gas-i18n';
import type { PageLang } from '@/lib/localized-routes';

const BASE_URL = 'https://elimfilters.com';

const equipment = [
  'Drilling Rigs',
  'Pumping Units',
  'Compressors',
  'Hydraulic Power Units',
  'Engine-Driven Equipment',
  'Field Service Equipment',
] as const;

const operatingPressures = [
  ['Airborne Contamination', 'Dust, sand and fine particulate can load engine air-intake systems across drilling, production and field-service environments.'],
  ['Hydraulic Control', 'Drilling, lifting, pressure control and auxiliary functions depend on pumps, valves and actuators working with controlled fluid cleanliness.'],
  ['Fuel Handling', 'Bulk tanks, transfer equipment, mobile refueling, condensation and water exposure can contaminate fuel before it reaches the engine.'],
  ['Continuous Duty', 'Long operating periods, heat, vibration and limited maintenance windows increase the importance of predictable filtration performance and service planning.'],
] as const;

const protection = [
  ['DUST + SAND', 'Airborne particulate around drilling and field operations', 'AIR INTAKE', 'MACROCORE™', '/technologies/macrocore/'],
  ['HYDRAULIC DEBRIS', 'Ingress + internal wear + service contamination', 'HYDRAULIC', 'NANOFORCE™', '/technologies/nanoforce/'],
  ['FUEL + WATER', 'Diesel storage, transfer, condensation and field refueling', 'FUEL', 'HYDROCORE™', '/technologies/hydrocore/'],
  ['FUEL PARTICULATE', 'Particles entering diesel during storage, transfer and refueling', 'FUEL', 'SYNTAPORE™', '/technologies/syntapore/'],
  ['LUBE CONTAMINATION', 'Wear debris + soot + service ingress', 'LUBRICATION', 'SYNTRAX™', '/technologies/syntrax/'],
] as const;

const serviceChecks: Record<string, string> = {
  'MACROCORE™': 'Check intake restriction trends, ducts and sealing integrity against the equipment service procedure.',
  'NANOFORCE™': 'Review the specified hydraulic cleanliness target, sampling practice and differential pressure where measured.',
  'HYDROCORE™': 'Review fuel storage, water drainage, separator integrity and the approved diesel application.',
  'SYNTAPORE™': 'Review particulate ingress during transfer and refueling; monitor diesel-filter restriction when instrumentation exists.',
  'SYNTRAX™': 'Review lubricant condition, operating hours, service history and the specified filter application.'
};

const maintenanceWorkflow = [
  ['Condition monitoring', 'Use operating hours, fluid samples, restriction indication and differential-pressure trends where available to identify contamination or abnormal loading.'],
  ['Planned intervention', 'Confirm the part, fluid, connection geometry, seals, safe isolation method and available service window before replacing an element.'],
  ['Return to service', 'Use the equipment manufacturer commissioning procedure to verify sealing, leaks and system indications, then record the installed reference and findings.']
] as const;

const consequences = [
  ['Process Continuity', 'An engine, pump or compressor taken out of service can interrupt a larger operating sequence and constrain production support.'],
  ['Hydraulic Precision', 'Contamination can affect the precision interfaces responsible for pressure control, actuation and repeated hydraulic response.'],
  ['Engine Protection', 'Air, fuel and lubricant cleanliness influence the protection of combustion and lubricated interfaces under extended field duty.'],
  ['Maintenance Access', 'Remote sites and constrained service windows make application evidence and condition-aware maintenance especially important.'],
  ['Component Protection', 'Filtration protects higher-value pumps, valves, injectors, bearings, turbochargers and other serviceable components.'],
  ['Operating Predictability', 'A disciplined contamination-control path supports more predictable service planning across critical field equipment.'],
] as const;

const questions = [
  ['What filtration systems are most important in oil and gas equipment?', 'Air intake, hydraulic, fuel and lubrication systems are common protection priorities across drilling rigs, compressors, pumps, hydraulic power units and engine-driven field equipment. The correct priority depends on the asset, contamination source, component sensitivity, duty cycle and service conditions.'],
  ['Why is filtration different in oil and gas field operations?', 'Oil and gas equipment may operate for extended periods in dust, sand, heat, vibration, remote locations and variable fuel-handling conditions. These factors can increase contamination exposure while reducing service flexibility, so filtration should be selected around the operating environment and protected system rather than equipment category alone.'],
  ['How can fuel become contaminated at an oil and gas site?', 'Fuel can acquire particulate or water through bulk storage, tank breathing, condensation, transfer equipment, mobile refueling and handling practices. The protection strategy should consider the complete path from storage to the engine.'],
  ['Why is hydraulic cleanliness important on drilling and production equipment?', 'Hydraulic systems rely on pumps, valves, actuators and control interfaces operating under pressure. Contamination can interfere with those precision surfaces, so filtration should be matched to cleanliness requirements, pressure, duty cycle and component sensitivity.'],
  ['Should oil and gas filters be selected only by service interval?', 'No. A calendar or hour interval does not describe contamination loading, fuel quality, hydraulic sensitivity, dust exposure, sealing condition or maintenance access. Service planning should be informed by the application and operating conditions.'],
  ['What information is needed to identify the correct filter?', 'Use the equipment, engine or power unit, protected system, operating environment, duty cycle, OEM or existing part reference, dimensions when available and validated application evidence.'],
  ['Can ELIMFILTERS identify an oil and gas filter from an OEM or part number?', 'Yes. If an OEM reference or current filter number is known, Part Search provides the fastest route to cross-reference and application information. For an engineering review, include the equipment, protected system and site conditions.'],
] as const;

export function OilGasIndustryPage({ lang = 'en' }: { lang?: PageLang }) {
  const pageUrl = `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/industries/oil-gas/`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: lang === 'es' ? 'Sistemas de filtración para petróleo y gas' : lang === 'pt' ? 'Sistemas de filtração para petróleo e gás' : 'Oil & Gas Filtration Systems',
        inLanguage: lang === 'pt' ? 'pt-BR' : lang,
        description: oilGasText(lang, 'Filtration engineering for maintenance teams protecting diesel, hydraulic and lubrication equipment in oil and gas operations.'),
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Oil and gas filtration systems' },
          { '@type': 'Thing', name: 'Oilfield equipment contamination control' },
          { '@type': 'Thing', name: 'Drilling rig filtration' },
          { '@type': 'Thing', name: 'Hydraulic cleanliness in oil and gas equipment' },
          { '@type': 'Thing', name: 'Oilfield fuel contamination' },
          { '@type': 'Thing', name: 'Oil and gas equipment reliability' },
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
          { '@type': 'ListItem', position: 3, name: lang === 'es' ? 'Petróleo y gas' : lang === 'pt' ? 'Petróleo e gás' : 'Oil & Gas', item: pageUrl },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#equipment`,
        name: oilGasText(lang, 'Oil and gas equipment applications'),
        itemListElement: equipment.map((name, index) => ({ '@type': 'ListItem', position: index + 1, name: oilGasText(lang, name) })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: questions.map(([q, a]) => ({ '@type': 'Question', name: oilGasText(lang, q), acceptedAnswer: { '@type': 'Answer', text: oilGasText(lang, a) } })),
      },
    ],
  };

  return (
    <main id="main-content" className="mining-industry-page oil-gas-industry-page" style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <style>{oilGasLayoutCss}</style>
      <PageHeader currentPage="Oil Gas" />

      <section style={hero}>
        <video className="miningHeroVideo" aria-hidden="true" autoPlay muted loop playsInline preload="auto" style={heroVideo}>
          <source src="/images/petro-gas-hero-h264.mp4" type="video/mp4" />
        </video>
        <div className="miningHeroShade" style={heroShade} />
        <div className="miningHeroContainer" style={heroInner}>
          <p style={eyebrow}>{oilGasText(lang, "OIL & GAS / MAINTENANCE ENGINEERING")}</p>
          <h1 style={heroTitle} className="miningHeroHeading">{oilGasText(lang, "FILTRATION FOR")}<br /><span style={yellow}>{oilGasText(lang, "OIL & GAS ASSETS")}</span></h1>
          <div className="miningHeroLower">
            <div className="miningHeroCopy">
              <p className="miningHeroPromise" style={heroPromise}>{oilGasText(lang, "Filtration engineering for maintenance teams responsible for asset reliability and controlled return to service.")}</p>
              <p style={heroLead}>{oilGasText(lang, "Contamination control and filter selection for engine air intake, hydraulic systems, diesel fuel and lubrication on drilling, production, compression and field-power equipment—based on operating duty, OEM requirements and application evidence.")}</p>
            </div>
            <div className="miningHeroActions" style={actions}>
              <Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>{oilGasText(lang, "REVIEW MAINTENANCE APPLICATION")}</Link>
              <a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>{oilGasText(lang, "FIND MY FILTER")}</a>
            </div>
          </div>
        </div>
      </section>

      <section style={directSection} aria-labelledby="direct-title">
        <div style={contentWidth} className="oilGasSplitHeader oilGasDirectGrid">
          <div className="oilGasSplitTitle">
            <p style={eyebrow}>{oilGasText(lang, "DIRECT ANSWER")}</p>
            <h2 id="direct-title" style={directTitle}>{oilGasText(lang, "What defines the correct oil & gas filtration strategy?")}</h2>
          </div>
          <div className="oilGasSplitCopy oilGasDirectContent">
            <p style={directText}>{oilGasText(lang, "The correct filtration strategy starts with the asset and contamination source, then resolves the protected system, component sensitivity, duty cycle, maintenance access and validated application evidence. Oil and gas equipment should not be selected by industry label or service interval alone.")}</p>
            <p style={wideText}>{oilGasText(lang, "Product scope: these ELIMFILTERS technologies protect equipment air intake, hydraulic circuits, diesel fuel and lubrication; they are not specifications for process-gas filtration or treatment.")}</p>
          </div>
        </div>
      </section>

      <section style={section} aria-labelledby="reality-title">
        <div style={contentWidth}>
          <div className="oilGasSplitHeader">
            <div className="oilGasSplitTitle">
              <p style={eyebrow}>{oilGasText(lang, "FIELD OPERATING REALITY")}</p>
              <h2 id="reality-title" style={sectionTitle}>{oilGasText(lang, "Contamination risk changes across the operating chain.")}</h2>
            </div>
            <div className="oilGasSplitCopy">
              <p style={wideText}>{oilGasText(lang, "Drilling, pumping, compression, hydraulic control and field power place different demands on filtration even when equipment operates at the same site.")}</p>
            </div>
          </div>
          <div style={pressureGrid} className="miningRiskGrid">{operatingPressures.map(([title, text]) => <article key={title} style={pressureCard} className="miningRiskCard"><h3 style={cardTitle}>{oilGasText(lang, title)}</h3><p style={bodyText}>{oilGasText(lang, text)}</p></article>)}</div>
        </div>
      </section>

      <section style={equipmentSection} aria-labelledby="equipment-title">
        <div style={equipmentGrid} className="miningEquipmentGrid">
          <div style={equipmentCopy}>
            <h2 id="equipment-title" style={sectionTitle}>{oilGasText(lang, "Different assets. Different protection priorities.")}</h2>
            <p style={wideText}>{oilGasText(lang, "A drilling rig, compressor and hydraulic power unit may share a site but not the same contamination mechanism, component sensitivity or service access.")}</p>
            <div role="list" aria-label={oilGasText(lang, "Oil and gas equipment applications")} style={equipmentList}>{equipment.map((asset) => <div role="listitem" key={asset} style={equipmentRow}><span style={equipmentName}>{oilGasText(lang, asset)}</span></div>)}</div>
          </div>
          <div style={equipmentMedia}><img src="/images/oil&gas.avif" alt={oilGasText(lang, "Oil and gas field equipment operating in demanding conditions")} style={equipmentImage} /></div>
        </div>
      </section>

      <section style={section} aria-labelledby="path-title">
        <div style={contentWidth}>
          <div className="oilGasSplitHeader">
            <div className="oilGasSplitTitle">
              <p style={eyebrow}>{oilGasText(lang, "CONTAMINATION PATHWAYS")}</p>
              <h2 id="path-title" style={sectionTitle}>{oilGasText(lang, "Connect the field threat to the system that must remain protected.")}</h2>
            </div>
            <div className="oilGasSplitCopy">
              <p style={wideText}>{oilGasText(lang, "Selection should move from contamination source to protected system, then to the appropriate ELIMFILTERS technology and finally to a validated part.")}</p>
            </div>
          </div>
          <div className="miningPathwayFlow" style={pathwayGrid}>{protection.map(([source, detail, system, technology, href]) => <article key={source} style={pathwayCard} className="miningPathwayRow"><div><span style={smallLabel}>{oilGasText(lang, "CONTAMINATION SOURCE")}</span><strong style={pathwaySource}>{oilGasText(lang, source)}</strong><p style={smallText}>{oilGasText(lang, detail)}</p></div><div><span style={smallLabel}>{oilGasText(lang, "PROTECTION SYSTEM")}</span><strong style={pathwaySystem}>{oilGasText(lang, system)}</strong></div><div><span style={smallLabel}>{oilGasText(lang, "MAINTENANCE CHECK")}</span><p style={smallText}>{oilGasText(lang, serviceChecks[technology])}</p></div><Link href={href} style={technologyLink} className="miningTechnologyCell"><span style={smallLabelYellow}>{oilGasText(lang, "ELIMFILTERS TECHNOLOGY")}</span><strong style={technologyName}>{technology}</strong><span style={technologyCta}>{oilGasText(lang, "EXPLORE →")}</span></Link></article>)}</div>
        </div>
      </section>

      <section style={principleSection}>
        <div style={principle} className="oilGasPrinciple"><span style={principleLabel}>{oilGasText(lang, "OIL & GAS ENGINEERING PRINCIPLE")}</span><p style={principleText}>{oilGasText(lang, "The filtration decision must resolve the equipment, contamination pathway, protected interface, operating duty and application evidence before a product number is accepted.")}</p></div>
      </section>

      <IndustryFilterCarousel dutyClass="HD" industryName="Oil Gas" lang={lang} />

      <section style={impactSection} aria-labelledby="impact-title">
        <div style={contentWidth}>
          <div className="oilGasSplitHeader">
            <div className="oilGasSplitTitle">
              <p style={eyebrow}>{oilGasText(lang, "OPERATING CONTINUITY")}</p>
              <h2 id="impact-title" style={sectionTitle}>{oilGasText(lang, "Protect the process before contamination becomes an interruption.")}</h2>
            </div>
            <div className="oilGasSplitCopy">
              <p style={wideText}>{oilGasText(lang, "Filtration supports more than the component itself. It protects the operating sequence around engines, pumps, compressors and hydraulic functions that other field activities may depend on.")}</p>
            </div>
          </div>
          <div style={impactGrid} className="miningStakesGrid">{consequences.map(([title, text]) => <article key={title} style={impactCard}><h3 style={impactTitle}>{oilGasText(lang, title)}</h3><p style={bodyText}>{oilGasText(lang, text)}</p></article>)}</div>
        </div>
      </section>

      <section style={section} aria-labelledby="maintenance-title">
        <div style={contentWidth}>
          <div className="oilGasSplitHeader">
            <div className="oilGasSplitTitle">
              <p style={eyebrow}>{oilGasText(lang, "MAINTENANCE ENGINEERING")}</p>
              <h2 id="maintenance-title" style={sectionTitle}>{oilGasText(lang, "From contamination diagnosis to verified return to service.")}</h2>
            </div>
            <div className="oilGasSplitCopy">
              <p style={wideText}>{oilGasText(lang, "For maintenance engineers, the decision extends beyond the replacement filter: identify operating evidence, confirm physical compatibility and document the intervention before restoring equipment to duty.")}</p>
            </div>
          </div>
          <div className="miningValueGrid" style={{ marginTop: "2rem" }}>
            {maintenanceWorkflow.map(([title, description]) => <article key={title} style={pressureCard}><h3 style={cardTitle}>{oilGasText(lang, title)}</h3><p style={bodyText}>{oilGasText(lang, description)}</p></article>)}
          </div>
        </div>
      </section>

      <section style={section} aria-labelledby="decision-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{oilGasText(lang, "FROM FIELD CONDITION TO PART")}</p>
          <h2 id="decision-title" style={sectionTitle}>{oilGasText(lang, "Resolve the oil & gas application in five decisions.")}</h2>
          <div style={decisionGrid} className="miningDecisionGrid">{[
            ['Asset', 'Identify the drilling rig, pump, compressor, hydraulic power unit or engine-driven equipment.'],
            ['Exposure', 'Define dust, sand, moisture, fuel handling, heat, vibration and environmental contamination.'],
            ['Duty', 'Establish load, operating hours, pressure, service access and maintenance constraints.'],
            ['Protection', 'Match the contamination mechanism to air intake, hydraulic, fuel or lubrication protection.'],
            ['Application Evidence', 'Validate the final filter using OEM reference, dimensions and documented application evidence.'],
          ].map(([title, text]) => <article key={title} style={decisionCard}><h3 style={cardTitle}>{oilGasText(lang, title)}</h3><p style={bodyText}>{oilGasText(lang, text)}</p></article>)}</div>
        </div>
      </section>

      <section style={evidenceSection} aria-labelledby="evidence-title">
        <div style={contentWidth}>
          <div className="oilGasSplitHeader">
            <div className="oilGasSplitTitle">
              <p style={eyebrow}>{oilGasText(lang, "APPLICATION EVIDENCE")}</p>
              <h2 id="evidence-title" style={sectionTitle}>{oilGasText(lang, "A plausible cross-reference is not enough.")}</h2>
            </div>
            <div className="oilGasSplitCopy">
              <p style={wideText}>{oilGasText(lang, "Final identification should reconcile the known reference, equipment or engine context, dimensions, protected system and operating conditions. Where evidence is incomplete, the application should remain under review rather than be treated as confirmed.")}</p>
            </div>
          </div>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{oilGasText(lang, "OIL & GAS FILTRATION QUESTIONS")}</p>
          <h2 id="faq-title" style={sectionTitle}>{oilGasText(lang, "What oil and gas maintenance engineers need to verify.")}</h2>
          <div style={faqList} className="miningFaqGrid">{questions.map(([q, a]) => <article key={q} style={faqItem} className="miningFaqItem"><h3 style={faqQuestion}>{oilGasText(lang, q)}</h3><p style={faqAnswer}>{oilGasText(lang, a)}</p></article>)}</div>
        </div>
      </section>

      <section style={conversionSection}>
        <div style={conversionGrid} className="miningConversionGrid">
          <div><p style={eyebrow}>{oilGasText(lang, "HAVE AN ASSET OR FIELD-CONTAMINATION PROBLEM?")}</p><h2 style={conversionTitle}>{oilGasText(lang, "Identify the protection path before selecting the part.")}</h2><p style={conversionText}>{oilGasText(lang, "Provide the equipment and engine or power unit model, operating hours, fluid and filter specifications, fault symptoms, restriction or pressure readings if available, OEM references and the planned shutdown or service window.")}</p><Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>{oilGasText(lang, "IDENTIFY MY PROTECTION PATH")}</Link></div>
          <div style={conversionSecondary}><div><p style={eyebrow}>{oilGasText(lang, "ALREADY HAVE A PART NUMBER?")}</p><h3 style={conversionSubTitle}>{oilGasText(lang, "Go directly to Part Search.")}</h3><a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>{oilGasText(lang, "FIND MY FILTER")}</a></div><div style={divider} /><div><p style={eyebrow}>{oilGasText(lang, "SERVE OIL & GAS OPERATIONS?")}</p><h3 style={conversionSubTitle}>{oilGasText(lang, "Evaluate distributor fit.")}</h3><Link href="/distributor-application/" style={secondaryButton}>{oilGasText(lang, "BECOME A DISTRIBUTOR")}</Link></div></div>
        </div>
      </section>
    </main>
  );
}


const oilGasLayoutCss = `
  /* Oil & Gas only: all editorial introductions fill the existing 1560px container. */
  main.oil-gas-industry-page .oilGasSplitHeader {
    width: 100%;
    min-width: 0;
    display: grid;
    grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr);
    align-items: start;
    column-gap: clamp(1.5rem, 5vw, 5rem);
  }
  main.oil-gas-industry-page .oilGasSplitTitle,
  main.oil-gas-industry-page .oilGasSplitCopy { min-width: 0; }
  main.oil-gas-industry-page .oilGasSplitTitle h2 { max-width: 100% !important; }
  main.oil-gas-industry-page .oilGasSplitCopy > p {
    width: 100%;
    max-width: none !important;
    margin-top: 0 !important;
  }
  main.oil-gas-industry-page .oilGasDirectContent > p:first-child {
    font-size: clamp(1.125rem, 1.42vw, 1.28rem);
    color: rgba(255,255,255,.9);
  }
  main.oil-gas-industry-page .oilGasDirectContent > p + p {
    margin-top: clamp(1.25rem,2vw,1.8rem) !important;
    padding: .25rem 0 .25rem clamp(1rem,1.6vw,1.5rem);
    border-left: 3px solid #FFF12D;
  }
  main.oil-gas-industry-page .oilGasSplitHeader + .miningRiskGrid,
  main.oil-gas-industry-page .oilGasSplitHeader + .miningPathwayFlow,
  main.oil-gas-industry-page .oilGasSplitHeader + .miningStakesGrid,
  main.oil-gas-industry-page .oilGasSplitHeader + .miningValueGrid {
    margin-top: clamp(1.5rem,3vw,2.5rem) !important;
  }
  main.oil-gas-industry-page .oilGasPrinciple {
    display: grid;
    grid-template-columns: minmax(0, .52fr) minmax(0, 1.48fr);
    align-items: center;
    gap: clamp(1.5rem, 4vw, 4.5rem);
  }
  main.oil-gas-industry-page .oilGasPrinciple > p {
    max-width: none !important;
    margin: 0 !important;
  }
  main.oil-gas-industry-page > section:has(.filter-carousel-slide) > div:first-child {
    display: grid;
    grid-template-columns: minmax(0,.92fr) minmax(0,1.08fr);
    gap: clamp(1.5rem,5vw,5rem);
    align-items: start;
  }
  main.oil-gas-industry-page > section:has(.filter-carousel-slide) > div:first-child > p {
    max-width: none !important;
    min-width: 0;
    margin: 0 !important;
  }
  @media (max-width: 950px) {
    main.oil-gas-industry-page .oilGasSplitHeader,
    main.oil-gas-industry-page .oilGasPrinciple,
    main.oil-gas-industry-page > section:has(.filter-carousel-slide) > div:first-child {
      grid-template-columns: minmax(0,1fr);
      gap: clamp(1rem,3vw,1.5rem);
    }
    main.oil-gas-industry-page .oilGasSplitCopy > p { margin-top: 0 !important; }
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
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-.055em', lineHeight: .94, fontSize: 'clamp(2.7rem,5.1vw,5.7rem)', textTransform: 'uppercase', margin: 0, maxWidth: '980px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,2vw,1.55rem)', lineHeight: 1.3, fontWeight: 700, maxWidth: '780px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem,1.45vw,1.18rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.78)', maxWidth: '880px', margin: '1rem 0 0' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '2rem' };
const primaryButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase' };
const secondaryButton: CSSProperties = { display: 'inline-block', background: 'transparent', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase', border: '1px solid rgba(255,241,45,.42)' };
const section: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const contentWidth: CSSProperties = { maxWidth: '1560px', margin: '0 auto' };
const directSection: CSSProperties = { ...section, background: '#050505', paddingTop: 'clamp(3.25rem,5vw,5rem)', paddingBottom: 'clamp(3.25rem,5vw,5rem)' };
const directTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(1.8rem,3.4vw,3.1rem)', lineHeight: 1, textTransform: 'uppercase', maxWidth: '860px', margin: 0 };
const directText: CSSProperties = { fontSize: 'clamp(1.05rem,1.7vw,1.28rem)', lineHeight: 1.65, color: 'rgba(255,255,255,.82)', margin: 0 };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.2rem,4.7vw,4.2rem)', lineHeight: .96, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0, maxWidth: '950px' };
const bodyText: CSSProperties = { fontSize: 'clamp(1.125rem,1.24vw,1.2rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.82)', margin: 0 };
const wideText: CSSProperties = { ...bodyText, marginTop: '1.3rem' };
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
const technologyCta: CSSProperties = { fontFamily: displayFont, fontSize: '.58rem', letterSpacing: '.1em', color: 'rgba(255,255,255,.6)', marginTop: '.65rem' };
const principleSection: CSSProperties = { padding: '0 clamp(1.25rem,6vw,6rem) clamp(4.5rem,8vw,7rem)' };
const principle: CSSProperties = { ...contentWidth, borderLeft: '4px solid #FFF12D', background: 'linear-gradient(90deg,rgba(255,241,45,.08),rgba(255,255,255,.018))', padding: 'clamp(2rem,4vw,3rem)' };
const principleLabel: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.74rem', letterSpacing: '.16em', fontWeight: 700 };
const principleText: CSSProperties = { fontSize: 'clamp(1.2rem,2vw,1.55rem)', lineHeight: 1.55, color: 'rgba(255,255,255,.9)', margin: 0 };
const impactSection: CSSProperties = { ...section, background: '#050505' };
const impactGrid: CSSProperties = { width: '100%', marginTop: '2.5rem' };
const impactCard: CSSProperties = { borderTop: '1px solid rgba(255,255,255,.15)', padding: '1.25rem 0', minHeight: '150px' };
const impactTitle: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '1.05rem', textTransform: 'uppercase', margin: '0 0 .65rem' };
const decisionGrid: CSSProperties = { width: '100%', marginTop: '2.6rem' };
const decisionCard: CSSProperties = { background: '#030303', minHeight: '210px', padding: '1.5rem', minWidth: 0 };
const evidenceSection: CSSProperties = { ...section, background: 'linear-gradient(90deg,rgba(255,241,45,.045),transparent 55%),#030303' };
const faqSection: CSSProperties = { ...section, background: '#070707' };
const faqList: CSSProperties = { marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,.12)' };
const faqItem: CSSProperties = { padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,.12)' };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem,1.8vw,1.3rem)', lineHeight: 1.25, margin: '0 0 .65rem' };
const faqAnswer: CSSProperties = { ...bodyText, maxWidth: '960px', fontSize: '.96rem' };
const conversionSection: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', background: '#020202', borderTop: '1px solid rgba(255,255,255,.08)' };
const conversionGrid: CSSProperties = { width: '100%', display: 'grid', gap: 'clamp(2.5rem,6vw,5rem)' };
const conversionSecondary: CSSProperties = { display: 'grid', gap: '2.2rem' };
const conversionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2.4rem,5vw,4.6rem)', lineHeight: .95, letterSpacing: '-.04em', textTransform: 'uppercase', maxWidth: '760px', margin: 0 };
const conversionText: CSSProperties = { ...bodyText, fontSize: '1.05rem', maxWidth: '680px', margin: '1.5rem 0 2rem' };
const conversionSubTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.5rem,2.8vw,2.2rem)', textTransform: 'uppercase', margin: '0 0 1.5rem' };
const divider: CSSProperties = { height: '1px', background: 'rgba(255,255,255,.12)' };
