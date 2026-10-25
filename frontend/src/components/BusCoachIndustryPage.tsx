import Link from '@/components/LocalizedLink';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import { IndustryFilterCarousel } from './IndustryFilterCarousel';
import { VIDEO_HERO_TREATMENT } from '@/lib/hero-media';
import { busCoachText } from '@/lib/bus-coach-i18n';
import type { PageLang } from '@/lib/localized-routes';

const BASE_URL = 'https://elimfilters.com';

const fleetTypes = [
  'Urban Transit Buses',
  'Intercity Coaches',
  'School Buses',
  'Shuttle Fleets',
  'Touring Coaches',
  'Airport & Institutional Buses',
] as const;

const dutyFactors = [
  ['Stop-and-Go Duty', 'Frequent acceleration, braking, idling and low-speed operation change engine loading, thermal conditions and service demand throughout the route.'],
  ['Passenger Environment', 'Cabin air quality and HVAC filtration matter because the protected space is occupied continuously across repeated boarding and route cycles.'],
  ['Pneumatic Brake Dependence', 'Air-brake systems depend on controlled compressed-air quality and moisture management to support consistent pneumatic function.'],
  ['Route Availability', 'Transit and coach fleets work to fixed timetables, so maintenance planning must resolve parts and application fit before a vehicle leaves service.'],
] as const;

const pathways = [
  ['ROAD DUST + URBAN PARTICULATE', 'Road dust + traffic particulate + intake loading', 'AIR INTAKE', 'MACROCORE™', '/technologies/macrocore/'],
  ['DIESEL PARTICLES', 'Particles introduced by depot storage, transfer and fueling', 'DIESEL FUEL', 'SYNTAPORE™', '/technologies/syntapore/'],
  ['FUEL + WATER', 'Condensation and free water in fuel storage and vehicle fuel circuits', 'FUEL / WATER SEPARATION', 'HYDROCORE™', '/technologies/hydrocore/'],
  ['LUBE CONTAMINATION', 'Wear debris + soot + repeated duty cycling', 'LUBRICATION', 'SYNTRAX™', '/technologies/syntrax/'],
  ['MOISTURE IN COMPRESSED AIR', 'Humidity + compressor carryover + pneumatic-system exposure', 'COMPRESSED AIR', 'DRYCORE™', '/technologies/drycore/'],
  ['CABIN PARTICULATE', 'Traffic particulate + passenger loading + HVAC recirculation', 'CABIN AIR', 'MICROKAPPA™', '/technologies/microkappa/'],
  ['COOLANT CONTAMINATION', 'Coolant condition + thermal cycling + service contamination', 'COOLING', 'THERMACORE™', '/technologies/thermacore/'],
] as const;

const serviceChecks: Record<string,string> = {
  'MACROCORE™': 'Inspect intake-housing seals and measure engine air restriction when available. Follow the specific bus engine OEM limit and approved element fitment.',
  'SYNTAPORE™': 'Review depot diesel cleanliness, filter restriction or warnings and engine-specific particulate-filter location. Document the installed filter reference.',
  'HYDROCORE™': 'Check water accumulation and separator drainage, and confirm the approved conventional non-turbine fuel/water separator configuration for the engine.',
  'SYNTRAX™': 'Evaluate oil service hours, extended idling, soot or wear trends and the exact engine oil-filter application against OEM specifications.',
  'DRYCORE™': 'Inspect the OEM-specified air-dryer element and moisture-management system. Follow authorized pneumatic service procedures; this filter does not certify braking performance.',
  'MICROKAPPA™': 'Inspect the HVAC intake and cabin-filter condition, vehicle-specific airflow path and any bypass or seal gaps. This does not certify protection from hazardous exhaust gases.',
  'THERMACORE™': 'Verify coolant chemistry, OEM-specified coolant-filter position and compatible additives before changing an approved cooling-system filter.'
};

const passengerFleetRoles = [
  ['Transit operations / fleet director', 'Prioritize dispatched vehicles, reserve capacity, missed trips and maintenance windows. Evaluate service availability without assuming a filter replacement ensures route completion.'],
  ['Depot maintenance supervisor', 'Plan inspections using engine hours, idling, HVAC operation, brake-air-system maintenance and fuel exposure. Stage verified parts before a bus enters the workshop.'],
  ['Reliability / fleet engineer', 'Review fault recurrence, lubrication or diesel samples, air-intake restriction, cooling condition and documented OEM applications before approving substitutions.'],
  ['Bus / coach maintenance technician', 'Apply vehicle isolation and approved pneumatic-system procedures. Protect open filter housings from contamination, verify seals and inspect for leaks before release.'],
  ['Driver / route operator', 'Report engine warnings, loss of power, HVAC airflow issues, unusual air-system behavior and leaks through authorized defect-reporting channels; do not attempt unauthorized repairs.']
] as const;

const consequences = [
  ['Route Continuity', 'A bus removed from service affects vehicle assignment, headway planning and the capacity available to the route or passenger schedule.'],
  ['Engine Availability', 'Air, fuel, lubrication and cooling protection support the engine systems that must remain available through repeated daily duty.'],
  ['Brake-System Support', 'Compressed-air protection helps manage moisture and contamination in pneumatic systems used across many heavy bus and coach platforms.'],
  ['Passenger Environment', 'Cabin filtration supports the HVAC air path serving drivers and passengers in high-occupancy vehicles.'],
  ['Depot Planning', 'Correct application identification before scheduled service helps maintenance teams stage the right parts before the vehicle enters the bay.'],
  ['Fleet Standardization', 'Common platforms can support standardized maintenance only when engine, chassis, system and application compatibility are confirmed.'],
] as const;

const questions = [
  ['What filtration systems are most important for bus and coach fleets?', 'Air intake, fuel and water separation, lubrication, cooling, compressed-air and cabin filtration are common priorities. The exact requirement depends on the vehicle platform, engine, brake architecture, HVAC configuration, duty cycle and validated application evidence.'],
  ['How does urban stop-and-go duty affect filtration decisions?', 'Repeated acceleration, braking, idling and low-speed operation can change engine loading, thermal conditions, soot exposure and maintenance demand. Filter selection should reflect the actual route and duty profile rather than a generic vehicle category.'],
  ['Why is compressed-air filtration important on buses and coaches?', 'Many heavy bus and coach platforms use pneumatic systems for braking and other functions. Moisture and contamination management should therefore be considered as part of the vehicle protection architecture where an air-dryer position is specified.'],
  ['Why does cabin filtration matter in passenger fleets?', 'Passenger vehicles operate with continuous HVAC use, repeated door openings and high occupancy. Cabin filter selection should match the HVAC application, vehicle configuration and service environment.'],
  ['Can the same filter be standardized across an entire bus fleet?', 'Only when compatibility is confirmed. Similar-looking buses may use different engines, chassis, brake systems, HVAC configurations or filtration positions. Standardization should follow documented application evidence.'],
  ['Should bus and coach filters be selected only by service interval?', 'No. Service interval alone does not describe route duty, idling, ambient particulate, fuel condition, HVAC loading, engine configuration or pneumatic-system requirements.'],
  ['What information is needed to identify the correct bus or coach filter?', 'Use the vehicle make and model, model year, engine, chassis or VIN information when available, protected system, duty profile, OEM or current filter reference, dimensions where needed and validated application evidence.'],
  ['Can ELIMFILTERS identify a bus or coach filter from an OEM or part number?', 'A known OEM or fitted-filter reference can identify candidate cross-references in Part Search. Confirm bus chassis, installed engine, HVAC or pneumatic system where relevant, filter interfaces and documented application before approving a substitute.'],
] as const;

export function BusCoachIndustryPage({ lang = 'en' }: { lang?: PageLang }) {
  const pageUrl = `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/industries/bus-coach/`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: lang === 'es' ? 'Filtración para autobuses' : lang === 'pt' ? 'Filtração para ônibus' : 'Bus & Coach Filtration Systems',
        inLanguage: lang === 'pt' ? 'pt-BR' : lang,
        description: busCoachText(lang, 'Filtration maintenance for passenger transit operators, bus depot teams and fleet engineers protecting verified engine air, diesel fuel, oil, pneumatic air-dryer, HVAC and compatible cooling-filter applications.'),
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Bus and coach filtration systems' },
          { '@type': 'Thing', name: 'Transit bus filtration' },
          { '@type': 'Thing', name: 'Coach fleet maintenance' },
          { '@type': 'Thing', name: 'Bus compressed air filtration' },
          { '@type': 'Thing', name: 'Bus cabin air filtration' },
          { '@type': 'Thing', name: 'Passenger fleet contamination control' },
        ],
        mentions: [
          { '@type': 'Thing', name: 'Air intake filtration' },
          { '@type': 'Thing', name: 'Fuel filtration and water separation' },
          { '@type': 'Thing', name: 'Lubrication filtration' },
          { '@type': 'Thing', name: 'Compressed air filtration' },
          { '@type': 'Thing', name: 'Cabin air filtration' },
          { '@type': 'Thing', name: 'Cooling system filtration' },
          { '@type': 'Thing', name: 'MACROCORE' },
          { '@type': 'Thing', name: 'HYDROCORE' },
          { '@type': 'Thing', name: 'SYNTAPORE' },
          { '@type': 'Thing', name: 'SYNTRAX' },
          { '@type': 'Thing', name: 'DRYCORE' },
          { '@type': 'Thing', name: 'MICROKAPPA' },
          { '@type': 'Thing', name: 'THERMACORE' },
        ],
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: lang === 'es' ? 'Inicio' : lang === 'pt' ? 'Início' : 'Home', item: `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/` },
          { '@type': 'ListItem', position: 2, name: lang === 'es' ? 'Industrias' : lang === 'pt' ? 'Indústrias' : 'Industries', item: `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/industries/` },
          { '@type': 'ListItem', position: 3, name: lang === 'es' ? 'Autobuses' : lang === 'pt' ? 'Ônibus e rodoviários' : 'Bus & Coach', item: pageUrl },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#fleet-types`,
        name: busCoachText(lang, 'Bus and coach fleet applications'),
        itemListElement: fleetTypes.map((name, index) => ({ '@type': 'ListItem', position: index + 1, name: busCoachText(lang, name) })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: questions.map(([q, a]) => ({ '@type': 'Question', name: busCoachText(lang, q), acceptedAnswer: { '@type': 'Answer', text: busCoachText(lang, a) } })),
      },
    ],
  };

  return (
    <main id="main-content" className="mining-industry-page bus-coach-industry-page" style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <style>{busCoachLayoutCss}</style>
      <PageHeader currentPage="Bus Coach" />

      <section style={hero}>
        <video className="miningHeroVideo" aria-hidden="true" autoPlay muted loop playsInline preload="auto" style={heroVideo}>
          <source src="/images/buses-2.mp4" type="video/mp4" />
        </video>
        <div className="miningHeroShade" style={heroShade} />
        <div className="miningHeroContainer" style={heroInner}>
          <p style={eyebrow}>{busCoachText(lang, "BUS & COACH / PASSENGER SERVICE RELIABILITY")}</p>
          <h1 style={heroTitle} className="miningHeroHeading">{busCoachText(lang, "FILTRATION FOR")}<br /><span style={yellow}>{busCoachText(lang, "PASSENGER TRANSPORT FLEETS")}</span></h1>
          <div className="miningHeroLower">
            <div className="miningHeroCopy">
              <p className="miningHeroPromise" style={heroPromise}>{busCoachText(lang, "Filtration engineering for passenger transport operators, maintenance supervisors, reliability engineers and bus technicians.")}</p>
              <p style={heroLead}>{busCoachText(lang, "Align diesel fuel, engine air, lubrication, pneumatic moisture control, HVAC cabin air and approved coolant filtration with real route duty, depot maintenance and documented OEM fitment.")}</p>
            </div>
            <div className="miningHeroActions" style={actions}>
              <Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>{busCoachText(lang, "REVIEW BUS APPLICATION")}</Link>
              <a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>{busCoachText(lang, "FIND MY FILTER")}</a>
            </div>
          </div>
        </div>
      </section>

      <section style={directSection} aria-labelledby="bus-direct-title">
        <div style={contentWidth} className="busCoachEditorialIntro">
          <div>
            <p style={eyebrow}>{busCoachText(lang, "DIRECT ANSWER")}</p>
            <h2 id="bus-direct-title" style={directTitle}>{busCoachText(lang, "What defines the correct filtration strategy for a bus or coach fleet?")}</h2>
          </div>
          <div>
            <p style={directText}>{busCoachText(lang, "Start with the actual vehicle platform, engine and protected system. Then resolve route duty, passenger environment, compressed-air architecture, fuel condition, service windows and documented application evidence. A bus category or service interval alone is not enough to confirm the correct filter.")}</p>
            <p className="busCoachScope" style={directText}>{busCoachText(lang, "Technical boundary: an approved filter can support fluid and airflow cleanliness, but cannot certify brake performance, vehicle roadworthiness, HVAC ventilation adequacy or passenger safety. Those require OEM-approved inspection and release procedures.")}</p>
          </div>
        </div>
      </section>

      <section style={section} aria-labelledby="duty-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{busCoachText(lang, "PASSENGER-FLEET DUTY")}</p>
          <h2 id="duty-title" style={sectionTitle}>{busCoachText(lang, "The vehicle has to protect the route and the occupied environment at the same time.")}</h2>
          <p style={wideText}>{busCoachText(lang, "Bus and coach filtration decisions span propulsion, compressed air, cooling and HVAC. The operating context is different from a conventional truck fleet because passenger load, route frequency and depot schedules are part of the maintenance equation.")}</p>
          <div style={cardGrid} className="miningRiskGrid">{dutyFactors.map(([title, text]) => <article key={title} style={card} className="miningRiskCard"><h3 style={cardTitle}>{busCoachText(lang, title)}</h3><p style={bodyText}>{busCoachText(lang, text)}</p></article>)}</div>
        </div>
      </section>

      <section style={fleetSection} aria-labelledby="fleet-title">
        <div style={fleetGrid} className="miningEquipmentGrid">
          <div>
            <p style={eyebrow}>{busCoachText(lang, "FLEET APPLICATIONS")}</p>
            <h2 id="fleet-title" style={sectionTitle}>{busCoachText(lang, "One passenger sector. Multiple duty profiles.")}</h2>
            <p style={wideText}>{busCoachText(lang, "Urban transit, school transportation, intercity service and shuttle operations can share similar vehicle architecture while operating under very different route lengths, passenger cycles and maintenance windows.")}</p>
            <div style={fleetList} role="list" aria-label={busCoachText(lang, "Bus and coach fleet applications")}>{fleetTypes.map((item) => <div role="listitem" key={item} style={fleetRow}>{busCoachText(lang, item)}</div>)}</div>
          </div>
          <div style={fleetMedia}><img src="/images/bus-hero.avif" alt={busCoachText(lang, "Passenger-service bus fleet at work")} style={fleetImage} /></div>
        </div>
      </section>

      <section style={section} aria-labelledby="path-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{busCoachText(lang, "PROTECTION PATHWAYS")}</p>
          <h2 id="path-title" style={sectionTitle}>{busCoachText(lang, "Connect each contamination path to the system that keeps the vehicle in service.")}</h2>
          <p style={wideText}>{busCoachText(lang, "The protection architecture should identify the contamination source, the affected vehicle system, the appropriate ELIMFILTERS technology and then the validated part for that exact application.")}</p>
          <div className="miningPathwayFlow" style={pathwayGrid}>{pathways.map(([source, detail, system, technology, href]) => <article key={source} style={pathwayCard} className="miningPathwayRow"><div><span style={smallLabel}>{busCoachText(lang, "CONTAMINATION / CONDITION")}</span><strong style={pathwaySource}>{busCoachText(lang, source)}</strong><p style={smallText}>{busCoachText(lang, detail)}</p></div><div><span style={smallLabel}>{busCoachText(lang, "PROTECTED SYSTEM")}</span><strong style={pathwaySystem}>{busCoachText(lang, system)}</strong></div><div><span style={smallLabel}>{busCoachText(lang, "DEPOT MAINTENANCE CHECK")}</span><p style={smallText}>{busCoachText(lang, serviceChecks[technology])}</p></div><Link href={href} style={technologyLink} className="miningTechnologyCell"><span style={smallLabelYellow}>{busCoachText(lang, "ELIMFILTERS TECHNOLOGY")}</span><strong style={technologyName}>{technology}</strong><span style={technologyCta}>{busCoachText(lang, "EXPLORE →")}</span></Link></article>)}</div>
        </div>
      </section>

      <section style={principleSection}>
        <div style={principle} className="busCoachPrinciple"><span style={principleLabel}>{busCoachText(lang, "BUS & COACH ENGINEERING PRINCIPLE")}</span><p style={principleText}>{busCoachText(lang, "Passenger-fleet filtration should be resolved by vehicle platform, route duty, protected system and application evidence before fleet-wide standardization is accepted.")}</p></div>
      </section>

      <IndustryFilterCarousel dutyClass="HD" industryName="Bus Coach" lang={lang} />

      <section style={impactSection} aria-labelledby="impact-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{busCoachText(lang, "ROUTE AVAILABILITY")}</p>
          <h2 id="impact-title" style={sectionTitle}>{busCoachText(lang, "Protect the systems that determine whether the vehicle can stay assigned to service.")}</h2>
          <p style={wideText}>{busCoachText(lang, "A filtration decision affects more than an engine component. It can influence route continuity, brake-system support, HVAC service, depot planning and the ability to standardize maintenance across a mixed passenger fleet.")}</p>
          <div style={impactGrid} className="miningStakesGrid">{consequences.map(([title, text]) => <article key={title} style={impactCard}><h3 style={impactTitle}>{busCoachText(lang, title)}</h3><p style={bodyText}>{busCoachText(lang, text)}</p></article>)}</div>
        </div>
      </section>

      <section style={section} aria-labelledby="bus-coach-roles-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{busCoachText(lang, "PASSENGER SERVICE RESPONSIBILITIES")}</p>
          <h2 id="bus-coach-roles-title" style={sectionTitle}>{busCoachText(lang, "Five roles coordinating safe, dependable fleet availability.")}</h2>
          <p style={wideText}>{busCoachText(lang, "Passenger service depends on dispatch capacity, timely defect reports, correct workshop procedures and verified vehicle release. Filtration is one engineering control, not a replacement for operational safety checks.")}</p>
          <div className="busCoachRolesGrid">
            {passengerFleetRoles.map(([role, detail]) => <article key={role} style={card} className="miningRiskCard"><h3 style={cardTitle}>{busCoachText(lang, role)}</h3><p style={bodyText}>{busCoachText(lang, detail)}</p></article>)}
          </div>
        </div>
      </section>

      <section style={section} aria-labelledby="decision-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{busCoachText(lang, "FROM ROUTE PROFILE TO PART")}</p>
          <h2 id="decision-title" style={sectionTitle}>{busCoachText(lang, "Resolve the bus or coach application in six decisions.")}</h2>
          <div style={decisionGrid} className="miningDecisionGrid">{[
            ['Vehicle', 'Identify make, model, year, chassis and fleet configuration.'],
            ['Engine', 'Resolve the installed engine and any platform-specific engine variation.'],
            ['Route Duty', 'Define urban stop-start, school, shuttle, intercity, touring or mixed service.'],
            ['Protected System', 'Identify air intake, fuel, lubrication, cooling, compressed air or cabin HVAC.'],
            ['Service Context', 'Account for depot schedule, ambient particulate, passenger load and fueling conditions.'],
            ['Application Evidence', 'Validate the final filter using OEM reference, current part, dimensions and documented fitment evidence.'],
          ].map(([title, text]) => <article key={title} style={decisionCard}><h3 style={cardTitle}>{busCoachText(lang, title)}</h3><p style={bodyText}>{busCoachText(lang, text)}</p></article>)}</div>
        </div>
      </section>

      <section style={evidenceSection} aria-labelledby="evidence-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{busCoachText(lang, "DEPOT APPLICATION EVIDENCE")}</p>
          <h2 id="evidence-title" style={sectionTitle}>{busCoachText(lang, "A fleet standard is only useful when the underlying applications are actually compatible.")}</h2>
          <p style={wideText}>{busCoachText(lang, "Before consolidating part numbers across a bus or coach fleet, reconcile engine, chassis, protected system, OEM reference, dimensions and documented application evidence. Similar body styles do not prove identical filter positions.")}</p>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{busCoachText(lang, "BUS & COACH FILTRATION QUESTIONS")}</p>
          <h2 id="faq-title" style={sectionTitle}>{busCoachText(lang, "What fleet and maintenance teams need to know.")}</h2>
          <div style={faqList} className="miningFaqGrid">{questions.map(([q, a]) => <article key={q} style={faqItem} className="miningFaqItem"><h3 style={faqQuestion}>{busCoachText(lang, q)}</h3><p style={faqAnswer}>{busCoachText(lang, a)}</p></article>)}</div>
        </div>
      </section>

      <section style={conversionSection}>
        <div style={conversionGrid} className="miningConversionGrid">
          <div><p style={eyebrow}>{busCoachText(lang, "HAVE A BUS, COACH OR FLEET APPLICATION?")}</p><h2 style={conversionTitle}>{busCoachText(lang, "Identify the protection path before the next depot window.")}</h2><p style={conversionText}>{busCoachText(lang, "Provide bus make, model, year, VIN or chassis identification, installed engine, HVAC and pneumatic configuration, protected system, engine hours, idle exposure, route duty, OEM/filter reference and planned depot service window.")}</p><Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>{busCoachText(lang, "IDENTIFY MY BUS & COACH PROTECTION PATH")}</Link></div>
          <div style={conversionSecondary}><div><p style={eyebrow}>{busCoachText(lang, "ALREADY HAVE A PART NUMBER?")}</p><h3 style={conversionSubTitle}>{busCoachText(lang, "Go directly to Part Search.")}</h3><a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>{busCoachText(lang, "FIND MY FILTER")}</a></div><div style={divider} /><div><p style={eyebrow}>{busCoachText(lang, "SERVE TRANSIT OR COACH OPERATORS?")}</p><h3 style={conversionSubTitle}>{busCoachText(lang, "Evaluate distributor fit.")}</h3><Link href="/distributor-application/" style={secondaryButton}>{busCoachText(lang, "BECOME A DISTRIBUTOR")}</Link></div></div>
        </div>
      </section>
    </main>
  );
}


const busCoachLayoutCss = `
  main.bus-coach-industry-page .busCoachEditorialIntro {
    display:grid; width:100%; grid-template-columns:minmax(0,.94fr) minmax(0,1.06fr);
    gap:clamp(2rem,5vw,5rem); align-items:start;
  }
  main.bus-coach-industry-page .busCoachEditorialIntro > div { min-width:0; }
  main.bus-coach-industry-page .busCoachScope {
    margin-top:clamp(1.3rem,2vw,2rem) !important;
    padding-left:clamp(1rem,2vw,1.5rem); border-left:3px solid #FFF12D;
  }
  main.bus-coach-industry-page .busCoachPrinciple {
    display:grid; grid-template-columns:minmax(0,.55fr) minmax(0,1.45fr);
    gap:clamp(1.5rem,4vw,4rem); align-items:center;
  }
  main.bus-coach-industry-page .busCoachPrinciple > p {margin:0;max-width:none;}
  main.bus-coach-industry-page .busCoachRolesGrid {
    display:grid; width:100%; margin-top:2rem;
    grid-template-columns:repeat(6,minmax(0,1fr)); gap:1rem;
  }
  main.bus-coach-industry-page .busCoachRolesGrid > article { grid-column:span 2; min-width:0; }
  main.bus-coach-industry-page .busCoachRolesGrid > article:nth-last-child(-n+2) { grid-column:span 3; }
  main.bus-coach-industry-page .miningHeroHeading { max-width:min(100%,1500px) !important; }
  @media(max-width:950px) {
    main.bus-coach-industry-page .busCoachEditorialIntro,
    main.bus-coach-industry-page .busCoachPrinciple { grid-template-columns:minmax(0,1fr);gap:1.5rem; }
    main.bus-coach-industry-page .busCoachRolesGrid { grid-template-columns:repeat(2,minmax(0,1fr)); }
    main.bus-coach-industry-page .busCoachRolesGrid > article,
    main.bus-coach-industry-page .busCoachRolesGrid > article:nth-last-child(-n+2) { grid-column:span 1; }
  }
  @media(max-width:650px) {
    main.bus-coach-industry-page .busCoachRolesGrid { grid-template-columns:minmax(0,1fr); }
  }
`;

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';
const yellow: CSSProperties = { color: '#FFF12D' };
const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont, overflowX: 'hidden' };
const contentWidth: CSSProperties = { maxWidth: '1560px', margin: '0 auto' };
const hero: CSSProperties = { minHeight: '82vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', background: '#000', borderBottom: '1px solid rgba(255,255,255,.08)' };
const heroVideo: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: VIDEO_HERO_TREATMENT.opacity };
const heroShade: CSSProperties = { position: 'absolute', inset: 0, zIndex: 2, background: VIDEO_HERO_TREATMENT.overlayBackground };
const heroInner: CSSProperties = { ...contentWidth, width: '100%', padding: 'clamp(6.75rem,10vw,9rem) clamp(1rem,3.5vw,4.5rem) clamp(3.5rem,5.5vw,5rem)', position: 'relative', zIndex: 3 };
const eyebrow: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.72rem', lineHeight: 1.2, letterSpacing: '.18em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 1rem' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-.055em', lineHeight: .94, fontSize: 'clamp(2.45rem,4.8vw,5.7rem)', textTransform: 'uppercase', margin: 0 };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,2vw,1.5rem)', lineHeight: 1.32, fontWeight: 700, maxWidth: '860px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem,1.45vw,1.17rem)', lineHeight: 1.72, color: 'rgba(255,255,255,.78)', maxWidth: '920px', margin: '1rem 0 0' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '2rem' };
const primaryButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.72rem', padding: '1rem 1.15rem', textTransform: 'uppercase' };
const secondaryButton: CSSProperties = { display: 'inline-block', background: 'transparent', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.72rem', padding: '1rem 1.15rem', textTransform: 'uppercase', border: '1px solid rgba(255,241,45,.42)' };
const directSection: CSSProperties = { padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,6vw,6rem)', background: '#050505', borderBottom: '1px solid rgba(255,255,255,.08)' };
const directTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem,3.4vw,3.2rem)', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-.035em', margin: 0 };
const directText: CSSProperties = { fontSize: 'clamp(1.05rem,1.5vw,1.22rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.85)', margin: 0 };
const section: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.2rem,4.7vw,4.1rem)', lineHeight: .96, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0, maxWidth: '960px' };
const bodyText: CSSProperties = { fontSize: 'clamp(1.08rem,1.18vw,1.2rem)', lineHeight: 1.68, color: 'rgba(255,255,255,.84)', margin: 0 };
const wideText: CSSProperties = { ...bodyText, maxWidth: '100%', marginTop: '1.3rem' };
const cardGrid: CSSProperties = { width: '100%', marginTop: '2rem' };
const card: CSSProperties = { background: '#050505', padding: '1.55rem', minHeight: '195px', minWidth: 0 };
const cardTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.03rem,1.7vw,1.3rem)', lineHeight: 1.08, textTransform: 'uppercase', color: '#fff', margin: '0 0 .8rem' };
const fleetSection: CSSProperties = { ...section, background: '#050505' };
const fleetGrid: CSSProperties = { width: '100%', margin: '2rem auto 0', alignItems: 'center' };
const fleetList: CSSProperties = { marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,.14)' };
const fleetRow: CSSProperties = { padding: '.95rem 0', borderBottom: '1px solid rgba(255,255,255,.14)', fontFamily: displayFont, textTransform: 'uppercase', fontWeight: 700, fontSize: 'clamp(.95rem,1.3vw,1.2rem)' };
const fleetMedia: CSSProperties = { minWidth: 0 };
const fleetImage: CSSProperties = { width: '100%', height: 'auto', objectFit: 'contain', display: 'block', border: '1px solid rgba(255,255,255,.08)' };
const pathwayGrid: CSSProperties = { width: '100%', marginTop: '2rem', display: 'grid', gap: '1rem' };
const pathwayCard: CSSProperties = { border: '1px solid rgba(255,255,255,.1)', background: '#050505', padding: '1.5rem', minHeight: '260px', display: 'grid', gap: '1rem' };
const smallLabel: CSSProperties = { fontFamily: displayFont, fontSize: '.72rem', letterSpacing: '.13em', color: 'rgba(255,255,255,.72)', fontWeight: 700, display: 'block', marginBottom: '.7rem' };
const smallLabelYellow: CSSProperties = { ...smallLabel, color: '#FFF12D' };
const pathwaySource: CSSProperties = { fontFamily: displayFont, fontSize: '1.12rem', color: '#fff', textTransform: 'uppercase' };
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
const conversionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2.35rem,5vw,4.5rem)', lineHeight: .95, letterSpacing: '-.04em', textTransform: 'uppercase', maxWidth: '780px', margin: 0 };
const conversionText: CSSProperties = { ...bodyText, fontSize: '1.05rem', maxWidth: '700px', margin: '1.5rem 0 2rem' };
const conversionSubTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.5rem,2.8vw,2.2rem)', textTransform: 'uppercase', margin: '0 0 1.5rem' };
const divider: CSSProperties = { height: '1px', background: 'rgba(255,255,255,.12)' };
