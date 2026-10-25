import Link from '@/components/LocalizedLink';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import { IndustryFilterCarousel } from './IndustryFilterCarousel';
import { VIDEO_HERO_TREATMENT } from '@/lib/hero-media';
import { automotiveText } from '@/lib/automotive-i18n';
import type { PageLang } from '@/lib/localized-routes';

const BASE_URL = 'https://elimfilters.com';

const applications = [
  'Passenger Vehicles',
  'Light Commercial Vehicles',
  'Delivery Fleets',
  'Service Vans',
  'Pickup Trucks',
  'Mixed Light-Duty Fleets',
] as const;

const operatingConditions = [
  ['Urban Duty', 'Short trips, repeated starts, idling and traffic exposure change how intake, lubrication and cabin systems accumulate contamination.'],
  ['Highway Duty', 'Longer sustained operation shifts the maintenance problem toward engine protection, loading history and application-correct service intervals.'],
  ['Seasonal Exposure', 'Dust, pollen, road debris, temperature changes and cabin-air demand vary by climate and route environment.'],
  ['Fleet Standardization', 'Shared platforms can simplify service only when engine, model year, system configuration and application evidence actually match.'],
] as const;

const pathways = [
  ['ROAD DUST + PARTICULATE', 'Ambient dust + road debris + intake loading', 'AIR INTAKE', 'MACROCORE™', '/technologies/macrocore/'],
  ['FUEL PARTICULATE / SYSTEM CONTAMINATION', 'Diesel particulate loading or gasoline-system contamination depending on the OEM-specified filter position', 'VEHICLE FUEL SYSTEM', 'APPLICATION-SPECIFIC FUEL PROTECTION', '/families/primary-fuel/'],
  ['LUBE CONTAMINATION', 'Wear debris + combustion byproducts + service ingress', 'LUBRICATION', 'SYNTRAX™', '/technologies/syntrax/'],
  ['CABIN PARTICULATE', 'Dust + pollen + urban airborne particulate', 'CABIN AIR', 'MICROKAPPA™', '/technologies/microkappa/'],
] as const;

const serviceChecks: Record<string,string> = {
  'MACROCORE™': 'Inspect intake housing, sealing surfaces and filter loading. Verify restriction where available and confirm geometry and engine-specific OEM fitment.',
  'APPLICATION-SPECIFIC FUEL PROTECTION': 'Identify gasoline or diesel system and OEM fuel-filter position. SYNTAPORE™ addresses approved diesel particulate applications only; do not assume interchangeability with gasoline-system filters.',
  'SYNTRAX™': 'Review oil grade and change history, engine type, service hours or mileage, deposits and the documented oil-filter application before installation.',
  'MICROKAPPA™': 'Inspect cabin HVAC intake, housing seals, airflow and filter dimensions; choose the element approved for the specific vehicle and HVAC system.'
};

const automotiveServiceRoles = [
  ['Vehicle owner / fleet operator', 'Report mileage, short-trip duty, warning indicators and service history. Select maintenance intervals using the vehicle OEM schedule and actual operating conditions.'],
  ['Independent workshop / service manager', 'Plan bay time, stock and confirmed filter references by year, make, model, engine and VIN where available. Prevent repeat service from incorrect parts.'],
  ['Automotive maintenance technician', 'Check dimensions, seals, oil and fuel connections, correct filter orientation and contamination controls. Document the installed part and perform OEM-prescribed post-service checks.'],
  ['Fleet reliability / maintenance engineer', 'Analyze repeat faults, engine variant differences, fuel-system configuration, wear trends and verified cross-reference evidence before consolidating parts across a mixed fleet.']
] as const;

const outcomes = [
  ['Engine Protection', 'Air, fuel and lubrication filtration protect the interfaces that determine engine cleanliness and service condition.'],
  ['Service Accuracy', 'Correct vehicle, engine and model-year identification reduces the risk of accepting a cross-reference that does not fit the actual application.'],
  ['Cabin Environment', 'Cabin filtration supports particulate control for the occupied vehicle environment and should be selected by the actual HVAC application.'],
  ['Fleet Consistency', 'Validated compatibility allows common vehicle groups to be serviced consistently without assuming all visually similar filters are interchangeable.'],
  ['Maintenance Planning', 'Application evidence supports repeatable service decisions across individual vehicles and light-duty fleets.'],
  ['Part Identification', 'Known OEM and filter references can accelerate identification, but final acceptance should still reconcile the vehicle application.'],
] as const;

const questions = [
  ['What filters are typically used in automotive and light-duty applications?', 'Common positions include engine air, fuel, lubrication and cabin-air filtration. The exact set depends on the vehicle, engine, fuel system, HVAC configuration, model year and application.'],
  ['Can the same filter be used across different model years?', 'Not automatically. A vehicle nameplate can span different engines, housings, fuel systems and HVAC configurations. Model year and application evidence should be checked before treating a reference as interchangeable.'],
  ['Why does vehicle duty matter when selecting filters?', 'Urban stop-start service, sustained highway operation, dusty roads, seasonal pollen and fleet utilization create different loading histories. Selection and maintenance planning should reflect the actual vehicle and operating environment.'],
  ['How should a fleet standardize automotive filters?', 'Group vehicles by confirmed platform, engine, system and application evidence. Standardization should follow verified compatibility rather than appearance, thread size or a single cross-reference alone.'],
  ['Is an OEM or current filter number enough to identify the correct replacement?', 'It is a strong starting point, but the final match should be reconciled with vehicle, engine, model year, dimensions and documented application evidence when available.'],
  ['What information helps ELIMFILTERS identify an automotive filter?', 'Provide year, make, model, engine, fuel type, protected system and any known OEM or current filter reference. Dimensions can help when application evidence is incomplete.'],
  ['Can ELIMFILTERS identify a filter from an existing part number?', 'A known reference can help locate candidate cross-references in Part Search. Confirm the vehicle, engine, fuel system, physical interfaces and documented fitment; an unverified cross-reference is not approval to install.'],
] as const;

export function AutomotiveIndustryPage({ lang = 'en' }: { lang?: PageLang }) {
  const pageUrl = `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/industries/automotive/`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: lang === 'es' ? 'Sistemas de filtración automotriz' : lang === 'pt' ? 'Sistemas de filtração automotiva' : 'Automotive Filtration Systems',
        inLanguage: lang === 'pt' ? 'pt-BR' : lang,
        description: automotiveText(lang, 'Automotive filtration for vehicle owners, independent workshops, fleet service managers and technicians who verify engine air, fuel, lubrication and cabin applications by vehicle identification and OEM evidence.'),
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Automotive filtration systems' },
          { '@type': 'Thing', name: 'Light-duty vehicle filtration' },
          { '@type': 'Thing', name: 'Passenger vehicle engine filtration' },
          { '@type': 'Thing', name: 'Automotive cabin air filtration' },
          { '@type': 'Thing', name: 'Light commercial vehicle maintenance' },
        ],
        mentions: [
          { '@type': 'Thing', name: 'Engine air filtration' },
          { '@type': 'Thing', name: 'Fuel filtration' },
          { '@type': 'Thing', name: 'Lubrication filtration' },
          { '@type': 'Thing', name: 'Cabin air filtration' },
          { '@type': 'Thing', name: 'MACROCORE' },
          { '@type': 'Thing', name: 'SYNTRAX' },
          { '@type': 'Thing', name: 'MICROKAPPA' },
          { '@type': 'Thing', name: 'SYNTAPORE for approved diesel fuel applications' },
        ],
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: lang === 'es' ? 'Inicio' : lang === 'pt' ? 'Início' : 'Home', item: `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/` },
          { '@type': 'ListItem', position: 2, name: lang === 'es' ? 'Industrias' : lang === 'pt' ? 'Indústrias' : 'Industries', item: `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/industries/` },
          { '@type': 'ListItem', position: 3, name: lang === 'es' ? 'Automotriz' : lang === 'pt' ? 'Automotivo' : 'Automotive', item: pageUrl },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#applications`,
        name: automotiveText(lang, 'Automotive and light-duty applications'),
        itemListElement: applications.map((name, index) => ({ '@type': 'ListItem', position: index + 1, name: automotiveText(lang, name) })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: questions.map(([q, a]) => ({ '@type': 'Question', name: automotiveText(lang, q), acceptedAnswer: { '@type': 'Answer', text: automotiveText(lang, a) } })),
      },
    ],
  };

  return (
    <main id="main-content" className="mining-industry-page automotive-industry-page" style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <style>{automotivePageLayout}</style>
      <PageHeader currentPage="Automotive" />

      <section style={hero}>
        <video className="miningHeroVideo" aria-hidden="true" autoPlay muted loop playsInline preload="auto" style={heroVideo}>
          <source src="/images/Autos-Vin4.mp4" type="video/mp4" />
        </video>
        <div className="miningHeroShade" style={heroShade} />
        <div className="miningHeroContainer" style={heroInner}>
          <p style={eyebrow}>{automotiveText(lang, "AUTOMOTIVE / VEHICLE SERVICE ENGINEERING")}</p>
          <h1 style={heroTitle} className="miningHeroHeading">{automotiveText(lang, "FILTRATION FOR")}<br /><span style={yellow}>{automotiveText(lang, "AUTOMOTIVE ASSETS")}</span></h1>
          <div className="miningHeroLower">
            <div className="miningHeroCopy">
              <p className="miningHeroPromise" style={heroPromise}>{automotiveText(lang, "Application-specific filtration for vehicle owners, independent workshops, service technicians and light-duty fleet operators.")}</p>
              <p style={heroLead}>{automotiveText(lang, "Protect engine intake, approved fuel systems, lubrication and cabin HVAC. Confirm the exact vehicle, engine, model year and filter position before choosing a replacement.")}</p>
            </div>
            <div className="miningHeroActions" style={actions}>
              <Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>{automotiveText(lang, "REVIEW AUTOMOTIVE APPLICATION")}</Link>
              <a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>{automotiveText(lang, "FIND MY FILTER")}</a>
            </div>
          </div>
        </div>
      </section>

      <section style={directSection} aria-labelledby="auto-direct-title">
        <div style={contentWidth} className="automotiveEditorialIntro">
          <div>
            <p style={eyebrow}>{automotiveText(lang, "DIRECT ANSWER")}</p>
            <h2 id="auto-direct-title" style={directTitle}>{automotiveText(lang, "What defines the correct automotive filter?")}</h2>
          </div>
          <div>
            <p style={directText}>{automotiveText(lang, "Correct automotive filtration starts with year, make, model, engine and protected system, then checks the operating environment, known reference, dimensions and application evidence. A cross-reference should not be accepted solely because a filter looks similar or shares one specification.")}</p>
            <p className="automotiveScope" style={directText}>{automotiveText(lang, "Fuel technology scope: gasoline and diesel fuel systems require their own approved filter designs. SYNTAPORE™ applies to verified diesel particulate applications, not every passenger-car fuel filter. A catalogue cross-reference must be confirmed before installation.")}</p>
          </div>
        </div>
      </section>

      <section style={section} aria-labelledby="duty-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{automotiveText(lang, "VEHICLE DUTY PROFILE")}</p>
          <h2 id="duty-title" style={sectionTitle}>{automotiveText(lang, "The same platform can live a very different service life.")}</h2>
          <p style={wideText}>{automotiveText(lang, "A commuter vehicle, delivery van and service fleet can share components while accumulating contamination under very different operating conditions.")}</p>
          <div style={grid} className="miningRiskGrid">{operatingConditions.map(([title, text]) => <article key={title} style={card} className="miningRiskCard"><h3 style={cardTitle}>{automotiveText(lang, title)}</h3><p style={bodyText}>{automotiveText(lang, text)}</p></article>)}</div>
        </div>
      </section>

      <section style={applicationSection} aria-labelledby="applications-title">
        <div style={applicationGrid} className="miningEquipmentGrid">
          <div>
            <p style={eyebrow}>{automotiveText(lang, "AUTOMOTIVE APPLICATIONS")}</p>
            <h2 id="applications-title" style={sectionTitle}>{automotiveText(lang, "One light-duty market. Multiple operating profiles.")}</h2>
            <p style={wideText}>{automotiveText(lang, "Vehicle class alone does not resolve the filtration requirement. Engine, system configuration and operating profile determine the application path.")}</p>
            <div role="list" aria-label={automotiveText(lang, "Automotive and light-duty applications")} style={applicationList}>{applications.map((asset) => <div role="listitem" key={asset} style={applicationRow}><span style={applicationName}>{automotiveText(lang, asset)}</span></div>)}</div>
          </div>
          <div><img src="/images/autos-02.avif" alt={automotiveText(lang, "Automotive and light-duty vehicles in daily use")} style={applicationImage} /></div>
        </div>
      </section>

      <section style={section} aria-labelledby="path-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{automotiveText(lang, "PROTECTION PATHWAYS")}</p>
          <h2 id="path-title" style={sectionTitle}>{automotiveText(lang, "Identify the contamination path before selecting the replacement filter.")}</h2>
          <div className="miningPathwayFlow" style={pathwayGrid}>{pathways.map(([source, detail, system, technology, href]) => <article key={source} style={pathwayCard} className="miningPathwayRow"><div><span style={smallLabel}>{automotiveText(lang, "CONTAMINATION SOURCE")}</span><strong style={pathwaySource}>{automotiveText(lang, source)}</strong><p style={smallText}>{automotiveText(lang, detail)}</p></div><div><span style={smallLabel}>{automotiveText(lang, "PROTECTION SYSTEM")}</span><strong style={pathwaySystem}>{automotiveText(lang, system)}</strong></div><div><span style={smallLabel}>{automotiveText(lang, "WORKSHOP SERVICE CHECK")}</span><p style={smallText}>{automotiveText(lang, serviceChecks[technology])}</p></div><Link href={href} style={technologyLink} className="miningTechnologyCell"><span style={smallLabelYellow}>{automotiveText(lang, "ELIMFILTERS PROTECTION PATH")}</span><strong style={technologyName}>{technology}</strong><span style={technologyCta}>{automotiveText(lang, "EXPLORE →")}</span></Link></article>)}</div>
        </div>
      </section>

      <section style={principleSection}><div style={principle} className="automotivePrinciple"><span style={principleLabel}>{automotiveText(lang, "AUTOMOTIVE ENGINEERING PRINCIPLE")}</span><p style={principleText}>{automotiveText(lang, "Year, make and model identify the vehicle family; engine, system configuration and application evidence determine whether the filter is actually correct.")}</p></div></section>

      <IndustryFilterCarousel dutyClass="LD" industryName="Automotive" lang={lang} />

      <section style={impactSection} aria-labelledby="impact-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{automotiveText(lang, "SERVICE ACCURACY")}</p>
          <h2 id="impact-title" style={sectionTitle}>{automotiveText(lang, "Protect the vehicle by getting the application right before the service starts.")}</h2>
          <div style={impactGrid} className="miningStakesGrid">{outcomes.map(([title, text]) => <article key={title} style={impactCard}><h3 style={impactTitle}>{automotiveText(lang, title)}</h3><p style={bodyText}>{automotiveText(lang, text)}</p></article>)}</div>
        </div>
      </section>

      <section style={section} aria-labelledby="automotive-roles-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{automotiveText(lang, "WORKSHOP AND FLEET SERVICE RESPONSIBILITIES")}</p>
          <h2 id="automotive-roles-title" style={sectionTitle}>{automotiveText(lang, "Four decisions connecting the driver, workshop and fleet engineer.")}</h2>
          <p style={wideText}>{automotiveText(lang, "Reliable service requires correct vehicle identification, part verification, contamination control and documented post-service inspection—not a match based on appearance alone.")}</p>
          <div style={grid} className="miningRiskGrid">
            {automotiveServiceRoles.map(([role, detail]) => <article key={role} style={card} className="miningRiskCard"><h3 style={cardTitle}>{automotiveText(lang, role)}</h3><p style={bodyText}>{automotiveText(lang, detail)}</p></article>)}
          </div>
        </div>
      </section>

      <section style={section} aria-labelledby="decision-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{automotiveText(lang, "FROM VEHICLE TO PART")}</p>
          <h2 id="decision-title" style={sectionTitle}>{automotiveText(lang, "Resolve the automotive application in five decisions.")}</h2>
          <div style={decisionGrid} className="miningDecisionGrid">{[
            ['Vehicle', 'Confirm year, make, model and vehicle class.'],
            ['Engine', 'Identify engine, fuel type and relevant system configuration.'],
            ['Duty', 'Define urban, highway, fleet and environmental exposure.'],
            ['Protection', 'Identify the air, fuel, lubrication or cabin-air position.'],
            ['Evidence', 'Validate with OEM reference, dimensions and documented application data.'],
          ].map(([title, text]) => <article key={title} style={decisionCard}><h3 style={cardTitle}>{automotiveText(lang, title)}</h3><p style={bodyText}>{automotiveText(lang, text)}</p></article>)}</div>
        </div>
      </section>

      <section style={evidenceSection} aria-labelledby="evidence-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{automotiveText(lang, "APPLICATION EVIDENCE")}</p>
          <h2 id="evidence-title" style={sectionTitle}>{automotiveText(lang, "A cross-reference is useful evidence, not the whole application.")}</h2>
          <p style={wideText}>{automotiveText(lang, "When a known part number exists, use it to accelerate identification. Final acceptance should still reconcile the actual vehicle, engine, model year, system position and available dimensional or application evidence.")}</p>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{automotiveText(lang, "AUTOMOTIVE FILTRATION QUESTIONS")}</p>
          <h2 id="faq-title" style={sectionTitle}>{automotiveText(lang, "What vehicle owners, service teams and fleet managers need to know.")}</h2>
          <div style={faqList} className="miningFaqGrid">{questions.map(([q, a]) => <article key={q} style={faqItem} className="miningFaqItem"><h3 style={faqQuestion}>{automotiveText(lang, q)}</h3><p style={faqAnswer}>{automotiveText(lang, a)}</p></article>)}</div>
        </div>
      </section>

      <section style={conversionSection}>
        <div style={conversionGrid} className="miningConversionGrid">
          <div><p style={eyebrow}>{automotiveText(lang, "HAVE A VEHICLE OR PART NUMBER?")}</p><h2 style={conversionTitle}>{automotiveText(lang, "Identify the correct filtration path before the service decision becomes a mismatch.")}</h2><p style={conversionText}>{automotiveText(lang, "Provide vehicle year, make, model, VIN or engine code, fuel type, exact filter position, OEM or installed reference, measurements if required, vehicle duty and service history.")}</p><Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>{automotiveText(lang, "IDENTIFY MY VEHICLE PROTECTION PATH")}</Link></div>
          <div style={conversionSecondary}><div><p style={eyebrow}>{automotiveText(lang, "ALREADY HAVE A REFERENCE?")}</p><h3 style={conversionSubTitle}>{automotiveText(lang, "Go directly to Part Search.")}</h3><a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>{automotiveText(lang, "FIND MY FILTER")}</a></div><div style={dividerLine} /><div><p style={eyebrow}>{automotiveText(lang, "SERVE AUTOMOTIVE CUSTOMERS?")}</p><h3 style={conversionSubTitle}>{automotiveText(lang, "Evaluate distributor fit.")}</h3><Link href="/distributor-application/" style={secondaryButton}>{automotiveText(lang, "BECOME A DISTRIBUTOR")}</Link></div></div>
        </div>
      </section>
    </main>
  );
}


const automotivePageLayout = `
  main.automotive-industry-page .automotiveEditorialIntro {
    display:grid;width:100%;grid-template-columns:minmax(0,.94fr) minmax(0,1.06fr);
    gap:clamp(2rem,5vw,5rem);align-items:start;
  }
  main.automotive-industry-page .automotiveEditorialIntro > div { min-width:0; }
  main.automotive-industry-page .automotiveScope {
    margin-top:clamp(1.3rem,2vw,2rem) !important;
    padding-left:clamp(1rem,2vw,1.5rem);border-left:3px solid #FFF12D;
  }
  main.automotive-industry-page .automotivePrinciple {
    display:grid;grid-template-columns:minmax(0,.55fr) minmax(0,1.45fr);
    gap:clamp(1.5rem,4vw,4rem);align-items:center;
  }
  main.automotive-industry-page .automotivePrinciple > p { margin:0;max-width:none; }
  main.automotive-industry-page .miningHeroHeading { max-width:min(100%,1500px) !important; }
  @media(max-width:950px) {
    main.automotive-industry-page .automotiveEditorialIntro,
    main.automotive-industry-page .automotivePrinciple {
      grid-template-columns:minmax(0,1fr);gap:1.5rem;
    }
  }
`;

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';
const yellow: CSSProperties = { color: '#FFF12D' };
const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont, overflowX: 'hidden' };
const hero: CSSProperties = { minHeight: '82vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,.08)' };
const heroVideo: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: VIDEO_HERO_TREATMENT.opacity };
const heroShade: CSSProperties = { position: 'absolute', inset: 0, zIndex: 2, background: VIDEO_HERO_TREATMENT.overlayBackground };
const heroInner: CSSProperties = { width: '100%', maxWidth: '1560px', margin: '0 auto', padding: 'clamp(6.75rem,10vw,9rem) clamp(1rem,3.5vw,4.5rem) clamp(3.5rem,5.5vw,5rem)', position: 'relative', zIndex: 3 };
const eyebrow: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.72rem', letterSpacing: '.18em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 1rem' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-.055em', lineHeight: .94, fontSize: 'clamp(2.7rem,5.15vw,5.85rem)', textTransform: 'uppercase', margin: 0 };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,2vw,1.55rem)', lineHeight: 1.3, fontWeight: 700, maxWidth: '850px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem,1.45vw,1.18rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.78)', maxWidth: '900px', margin: '1rem 0 0' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '2rem' };
const primaryButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase' };
const secondaryButton: CSSProperties = { display: 'inline-block', background: 'transparent', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase', border: '1px solid rgba(255,241,45,.42)' };
const contentWidth: CSSProperties = { maxWidth: '1560px', margin: '0 auto' };
const directSection: CSSProperties = { padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,6vw,6rem)', background: '#050505', borderBottom: '1px solid rgba(255,255,255,.08)' };
const directTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem,3.4vw,3.2rem)', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-.035em', margin: 0 };
const directText: CSSProperties = { fontSize: 'clamp(1.05rem,1.5vw,1.22rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.85)', margin: 0 };
const section: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.2rem,4.7vw,4.2rem)', lineHeight: .96, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0, maxWidth: '940px' };
const bodyText: CSSProperties = { fontSize: 'clamp(1.08rem,1.18vw,1.2rem)', lineHeight: 1.68, color: 'rgba(255,255,255,.84)', margin: 0 };
const wideText: CSSProperties = { ...bodyText, maxWidth: '100%', marginTop: '1.3rem' };
const grid: CSSProperties = { width: '100%', marginTop: '2rem' };
const card: CSSProperties = { background: '#050505', padding: '1.55rem', minHeight: '195px', minWidth: 0 };
const cardTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem,1.8vw,1.35rem)', lineHeight: 1.05, textTransform: 'uppercase', margin: '0 0 .8rem' };
const applicationSection: CSSProperties = { ...section, background: '#050505' };
const applicationGrid: CSSProperties = { width: '100%', margin: '2rem auto 0', alignItems: 'center' };
const applicationImage: CSSProperties = { width: '100%', height: 'auto', objectFit: 'contain', display: 'block', border: '1px solid rgba(255,255,255,.08)' };
const applicationList: CSSProperties = { marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,.14)' };
const applicationRow: CSSProperties = { padding: '.95rem 0', borderBottom: '1px solid rgba(255,255,255,.14)' };
const applicationName: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(.95rem,1.3vw,1.25rem)', textTransform: 'uppercase', fontWeight: 700 };
const pathwayGrid: CSSProperties = { width: '100%', marginTop: '2rem', display: 'grid', gap: '1rem' };
const pathwayCard: CSSProperties = { border: '1px solid rgba(255,255,255,.1)', background: '#050505', padding: '1.5rem', minHeight: '265px', display: 'grid', gap: '1rem' };
const smallLabel: CSSProperties = { fontFamily: displayFont, fontSize: '.72rem', letterSpacing: '.13em', color: 'rgba(255,255,255,.72)', fontWeight: 700, display: 'block', marginBottom: '.7rem' };
const smallLabelYellow: CSSProperties = { ...smallLabel, color: '#FFF12D' };
const pathwaySource: CSSProperties = { fontFamily: displayFont, fontSize: '1.15rem', textTransform: 'uppercase' };
const pathwaySystem: CSSProperties = { fontFamily: displayFont, fontSize: '1.05rem', textTransform: 'uppercase' };
const smallText: CSSProperties = { ...bodyText, fontSize: '1.08rem', lineHeight: 1.55, marginTop: '.6rem' };
const dividerLine: CSSProperties = { height: '1px', background: 'rgba(255,255,255,.12)' };
const technologyLink: CSSProperties = { textDecoration: 'none', borderTop: '1px solid rgba(255,241,45,.18)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' };
const technologyName: CSSProperties = { fontFamily: displayFont, fontSize: '1.16rem', color: '#FFF12D', textTransform: 'uppercase' };
const technologyCta: CSSProperties = { fontFamily: displayFont, fontSize: '.72rem', letterSpacing: '.1em', color: 'rgba(255,255,255,.6)', marginTop: '.65rem' };
const principleSection: CSSProperties = { padding: '0 clamp(1.25rem,6vw,6rem) clamp(4.5rem,8vw,7rem)' };
const principle: CSSProperties = { ...contentWidth, borderLeft: '4px solid #FFF12D', background: 'linear-gradient(90deg,rgba(255,241,45,.08),rgba(255,255,255,.018))', padding: 'clamp(2rem,4vw,3rem)' };
const principleLabel: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.74rem', letterSpacing: '.16em', fontWeight: 700 };
const principleText: CSSProperties = { fontSize: 'clamp(1.2rem,2vw,1.55rem)', lineHeight: 1.55, color: 'rgba(255,255,255,.9)', margin: '1rem 0 0', maxWidth: '1040px' };
const impactSection: CSSProperties = { ...section, background: '#050505' };
const impactGrid: CSSProperties = { width: '100%', marginTop: '2rem' };
const impactCard: CSSProperties = { borderTop: '1px solid rgba(255,255,255,.15)', padding: '1.25rem 0', minHeight: '145px' };
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
const conversionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2.4rem,5vw,4.6rem)', lineHeight: .95, letterSpacing: '-.04em', textTransform: 'uppercase', maxWidth: '780px', margin: 0 };
const conversionText: CSSProperties = { ...bodyText, fontSize: '1.05rem', maxWidth: '680px', margin: '1.5rem 0 2rem' };
const conversionSubTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.5rem,2.8vw,2.2rem)', textTransform: 'uppercase', margin: '0 0 1.5rem' };
