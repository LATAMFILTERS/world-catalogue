import Link from '@/components/LocalizedLink';
import type { CSSProperties } from 'react';
import { PageHeader } from './PageHeader';
import { IndustryFilterCarousel } from './IndustryFilterCarousel';
import { VIDEO_HERO_TREATMENT } from '@/lib/hero-media';
import { truckFleetText } from '@/lib/truck-fleets-i18n';
import type { PageLang } from '@/lib/localized-routes';

const BASE_URL = 'https://elimfilters.com';

const fleetProfiles = [
  ['Long-Haul', 'High annual mileage, extended engine runtime and route dependence make service planning and parts consistency central to fleet availability.'],
  ['Regional', 'Repeated delivery cycles, changing road conditions and frequent starts place different demands on fuel, lubrication, cooling and air systems.'],
  ['Vocational', 'Construction support, refuse, utility and severe-duty work can add dust, hydraulic demand, idling and contamination exposure beyond normal highway duty.'],
  ['Mixed Fleet', 'Different makes, engines and duty profiles increase the value of disciplined cross-reference, application evidence and fleet-wide part standardization.'],
] as const;

const equipment = [
  'Class 8 Tractors',
  'Regional Haul Trucks',
  'Vocational Trucks',
  'Delivery & Distribution Fleets',
  'Fleet Support Vehicles',
  'Engine-Driven Auxiliary Equipment',
] as const;

const protection = [
  ['ROAD DUST + AIRBORNE PARTICULATE', 'Highway + terminal + yard + vocational exposure', 'AIR INTAKE', 'MACROCORE™', '/technologies/macrocore/'],
  ['FUEL + WATER', 'Bulk storage, transfer, condensation and refueling', 'FUEL / WATER SEPARATION', 'HYDROCORE™', '/technologies/hydrocore/'],
  ['FUEL PARTICULATE', 'Particles introduced through storage, distribution and service handling', 'DIESEL FUEL', 'SYNTAPORE™', '/technologies/syntapore/'],
  ['LUBE CONTAMINATION', 'Wear debris + soot + service ingress', 'LUBRICATION', 'SYNTRAX™', '/technologies/syntrax/'],
  ['COOLANT CONTAMINATION', 'Cooling-circuit deposits and coolant condition only where an OEM-approved filter circuit exists', 'COOLING', 'THERMACORE™', '/technologies/thermacore/'],
  ['COMPRESSED-AIR MOISTURE', 'Moisture and contaminants in compressor-fed pneumatic systems with a specified air dryer', 'COMPRESSED AIR', 'DRYCORE™', '/technologies/drycore/'],
  ['CABIN PARTICULATE', 'Road dust + urban particulate + outside air intake', 'CABIN AIR', 'MICROKAPPA™', '/technologies/microkappa/'],
] as const;

const serviceChecks: Record<string, string> = {
  'MACROCORE™': 'Check air-filter restriction and intake-housing sealing under engine OEM limits; do not replace solely on appearance.',
  'HYDROCORE™': 'Inspect tank and transfer-water exposure, drainage and sealing of the specified conventional fuel/water separator; do not substitute a turbine-style element.',
  'SYNTAPORE™': 'Verify diesel particulate-filter application and restriction according to the engine fuel-system service procedure.',
  'SYNTRAX™': 'Review oil condition, soot or wear trends, duty hours and the engine-specific oil-filter service requirements.',
  'THERMACORE™': 'Use a coolant filter only if the vehicle/engine has an OEM-specified compatible coolant-filtration circuit and additive chemistry.',
  'DRYCORE™': 'Inspect the specified air-dryer cartridge and moisture-management system under the brake-system OEM procedure; this does not certify braking performance.',
  'MICROKAPPA™': 'Inspect the correct cabin filter and ventilation seals; particulate reduction does not establish respiratory protection against hazardous fumes.'
};

const maintenanceRoles = [
  ['Fleet owner', 'Track out-of-service units, route commitments, total cost per kilometer and spare coverage. Prioritize critical tractors and vocational vehicles by replacement capacity and service risk.'],
  ['Maintenance manager', 'Group units by verified engine, emissions configuration, filter interfaces and duty. Plan labor, inventory and service windows without forcing a part across incompatible variants.'],
  ['Fleet engineer', 'Investigate contamination using restriction or differential-pressure data where available, fuel and oil condition, failure history and OEM limits before setting the filtration specification.'],
  ['Service technician', 'Identify the exact vehicle and engine, follow safe isolation procedures, handle elements without introducing dirt, confirm seals and leaks, and record installed references before road release.']
] as const;

const consequences = [
  ['Route Availability', 'A filtration-related service event can remove a truck from a planned route and create replacement, rescheduling or recovery work.'],
  ['Fleet Standardization', 'A governed application path helps maintenance teams reduce ambiguity across makes, engines, duty profiles and replacement references.'],
  ['Fuel-System Protection', 'Fuel cleanliness and water control matter across bulk storage, transfer and final engine supply, not only at the filter head.'],
  ['Service Predictability', 'Filtration decisions should support planned maintenance around actual duty and contamination exposure rather than a generic interval alone.'],
  ['Driver Environment', 'Cabin filtration supports particulate control at the operator air intake without being confused with engine air filtration.'],
  ['Parts Readiness', 'Validated references and fleet-level application evidence reduce the risk of selecting a plausible but incorrect replacement during service.'],
] as const;

const questions = [
  ['What filtration systems matter most in a heavy-duty truck fleet?', 'Air intake, fuel and water separation, lubrication, cooling, compressed-air and cabin-air filtration are common priorities. Some vocational applications also use hydraulic filtration. The correct mix depends on vehicle configuration, engine, duty cycle, environment and protected system.'],
  ['How should filtration differ between long-haul, regional and vocational trucks?', 'Long-haul fleets emphasize route uptime and extended runtime, regional fleets see more repeated starts and delivery cycles, and vocational trucks may add dust, idling, hydraulic demand and severe-duty exposure. Filter selection should reflect the actual duty profile rather than the truck category alone.'],
  ['Why is fuel-water control important for diesel fleets?', 'Fuel can acquire water or particulate during bulk storage, tank breathing, condensation, transfer and refueling. A fleet protection strategy should therefore consider the full path from storage to the engine, not only the final filter position.'],
  ['Should fleet filters be selected only by mileage or service interval?', 'No. Mileage and hours are useful maintenance inputs, but they do not describe fuel quality, dust exposure, idling, loading, cooling demand, sealing condition or route environment. Selection and service planning should reflect the application and operating conditions.'],
  ['How can a fleet reduce part-number confusion across multiple truck makes?', 'Use a governed cross-reference process that combines the known OEM or current filter reference with vehicle, engine, protected system, dimensions where needed and validated application evidence before standardizing a replacement across the fleet.'],
  ['What information is needed to identify the correct truck filter?', 'Use the truck make and model, engine, year or configuration when available, protected system, duty cycle, known OEM or current filter number, dimensions where needed and validated application evidence.'],
  ['Can ELIMFILTERS identify a truck filter from an OEM or competitor reference?', 'If a known OEM or current filter reference is available, Part Search is the fastest route to cross-reference and application information. Final confirmation should still reconcile the vehicle or engine context and protected system.'],
] as const;

export function TrucksFleetsIndustryPage({ lang = 'en' }: { lang?: PageLang }) {
  const pageUrl = `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/industries/trucks-fleets/`;
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#page`,
        url: pageUrl,
        name: lang === 'es' ? 'Sistemas de filtración para flotas de camiones' : lang === 'pt' ? 'Sistemas de filtração para frotas de caminhões' : 'Truck Fleets Filtration Systems',
        inLanguage: lang === 'pt' ? 'pt-BR' : lang,
        description: truckFleetText(lang, 'Technical filtration for truck fleet owners, maintenance managers, fleet engineers and technicians: validated diesel, air, lubrication and applicable cooling, air-dryer and cabin filters.'),
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: [
          { '@type': 'Thing', name: 'Heavy-duty truck fleet filtration' },
          { '@type': 'Thing', name: 'Commercial fleet maintenance' },
          { '@type': 'Thing', name: 'Diesel fuel water separation' },
          { '@type': 'Thing', name: 'Truck fleet service standardization' },
          { '@type': 'Thing', name: 'Long-haul truck filtration' },
          { '@type': 'Thing', name: 'Vocational truck filtration' },
        ],
        mentions: [
          { '@type': 'Thing', name: 'Air intake filtration' },
          { '@type': 'Thing', name: 'Fuel filtration and water separation' },
          { '@type': 'Thing', name: 'Lubrication filtration' },
          { '@type': 'Thing', name: 'Cooling system filtration' },
          { '@type': 'Thing', name: 'Compressed air filtration' },
          { '@type': 'Thing', name: 'Cabin air filtration' },
          { '@type': 'Thing', name: 'MACROCORE' },
          { '@type': 'Thing', name: 'HYDROCORE' },
          { '@type': 'Thing', name: 'SYNTAPORE' },
          { '@type': 'Thing', name: 'SYNTRAX' },
          { '@type': 'Thing', name: 'THERMACORE' },
          { '@type': 'Thing', name: 'DRYCORE' },
          { '@type': 'Thing', name: 'MICROKAPPA' },
        ],
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: lang === 'es' ? 'Inicio' : lang === 'pt' ? 'Início' : 'Home', item: `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/` },
          { '@type': 'ListItem', position: 2, name: lang === 'es' ? 'Industrias' : lang === 'pt' ? 'Indústrias' : 'Industries', item: `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/industries/` },
          { '@type': 'ListItem', position: 3, name: lang === 'es' ? 'Camiones y flotas' : lang === 'pt' ? 'Caminhões e frotas' : 'Trucks & Fleets', item: pageUrl },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#fleet-applications`,
        name: truckFleetText(lang, 'Truck fleet applications'),
        itemListElement: equipment.map((name, index) => ({ '@type': 'ListItem', position: index + 1, name: truckFleetText(lang, name) })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: questions.map(([q, a]) => ({ '@type': 'Question', name: truckFleetText(lang, q), acceptedAnswer: { '@type': 'Answer', text: truckFleetText(lang, a) } })),
      },
    ],
  };

  return (
    <main id="main-content" className="mining-industry-page truck-fleets-industry-page" style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <style>{truckFleetPageLayout}</style>
      <PageHeader currentPage="Trucks Fleets" />

      <section style={hero}>
        <video className="miningHeroVideo" aria-hidden="true" autoPlay muted loop playsInline preload="auto" style={heroVideo}>
          <source src="/images/truck-fleets-hero-h264.mp4" type="video/mp4" />
        </video>
        <div className="miningHeroShade" style={heroShade} />
        <div className="miningHeroContainer" style={heroInner}>
          <p style={eyebrow}>{truckFleetText(lang, "TRUCK FLEETS / MAINTENANCE & RELIABILITY")}</p>
          <h1 style={heroTitle} className="miningHeroHeading">{truckFleetText(lang, "FILTRATION FOR")}<br /><span style={yellow}>{truckFleetText(lang, "TRUCKS & FLEETS")}</span></h1>
          <div className="miningHeroLower">
            <div className="miningHeroCopy">
              <p className="miningHeroPromise" style={heroPromise}>{truckFleetText(lang, "Filtration decisions for fleet owners, maintenance managers, engineers and service technicians responsible for keeping trucks in service.")}</p>
              <p style={heroLead}>{truckFleetText(lang, "Control diesel fuel contamination, intake restriction, lubrication condition and specified air-dryer, cooling and cabin systems using actual route duty, OEM requirements and vehicle-level application evidence.")}</p>
            </div>
            <div className="miningHeroActions" style={actions}>
              <Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>{truckFleetText(lang, "REVIEW FLEET APPLICATION")}</Link>
              <a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>{truckFleetText(lang, "FIND MY FILTER")}</a>
            </div>
          </div>
        </div>
      </section>

      <section style={directSection} aria-labelledby="direct-title">
        <div style={contentWidth} className="truckFleetEditorialIntro">
          <div>
            <p style={eyebrow}>{truckFleetText(lang, "DIRECT ANSWER")}</p>
            <h2 id="direct-title" style={directTitle}>{truckFleetText(lang, "What defines the correct truck-fleet filtration strategy?")}</h2>
          </div>
          <div>
            <p style={directText}>{truckFleetText(lang, "The correct strategy resolves the vehicle and engine, protected system, route and duty profile, contamination exposure, service plan and validated application evidence. A fleet should not standardize a filter only because a cross-reference looks plausible or because two trucks appear similar.")}</p>
            <p style={directText} className="truckFleetScopeText">{truckFleetText(lang, "Scope: a correct filter cannot by itself certify emissions-system function, brake performance, cooling capacity or overall vehicle roadworthiness. Verify those separately under the vehicle manufacturer's procedures.")}</p>
          </div>
        </div>
      </section>

      <section style={section} aria-labelledby="fleet-model-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{truckFleetText(lang, "FLEET OPERATING MODEL")}</p>
          <h2 id="fleet-model-title" style={sectionTitle}>{truckFleetText(lang, "The route changes the filtration problem.")}</h2>
          <p style={wideText}>{truckFleetText(lang, "A highway tractor, regional delivery truck and vocational unit can share an engine family while experiencing very different dust, fuel, idle, thermal and service conditions.")}</p>
          <div style={profileGrid} className="miningRiskGrid">{fleetProfiles.map(([title, text]) => <article key={title} style={profileCard} className="miningRiskCard"><h3 style={cardTitle}>{truckFleetText(lang, title)}</h3><p style={bodyText}>{truckFleetText(lang, text)}</p></article>)}</div>
        </div>
      </section>

      <section style={equipmentSection} aria-labelledby="equipment-title">
        <div style={equipmentGrid} className="miningEquipmentGrid">
          <div style={equipmentCopy}>
            <p style={eyebrow}>{truckFleetText(lang, "FLEET APPLICATIONS")}</p>
            <h2 id="equipment-title" style={sectionTitle}>{truckFleetText(lang, "Build one maintenance language across different trucks.")}</h2>
            <p style={wideText}>{truckFleetText(lang, "Fleet consistency starts by identifying which assets can truly share a protection path and which require application-specific parts.")}</p>
            <div role="list" aria-label={truckFleetText(lang, "Truck fleet applications")} style={equipmentList}>{equipment.map((asset) => <div role="listitem" key={asset} style={equipmentRow}><span style={equipmentName}>{truckFleetText(lang, asset)}</span></div>)}</div>
          </div>
          <div style={equipmentMedia}><img src="/images/trucks-1.avif" alt={truckFleetText(lang, "Heavy-duty commercial trucks in fleet operation")} style={equipmentImage} /></div>
        </div>
      </section>

      <section style={section} aria-labelledby="path-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{truckFleetText(lang, "PROTECTION PATHWAYS")}</p>
          <h2 id="path-title" style={sectionTitle}>{truckFleetText(lang, "Map each fleet risk to the system that keeps the truck available.")}</h2>
          <p style={wideText}>{truckFleetText(lang, "The selection path should move from operating exposure to protected system, then to the appropriate ELIMFILTERS technology and finally to a validated filter.")}</p>
          <div className="miningPathwayFlow" style={pathwayGrid}>{protection.map(([source, detail, system, technology, href]) => <article key={source} style={pathwayCard} className="miningPathwayRow"><div><span style={smallLabel}>{truckFleetText(lang, "OPERATING EXPOSURE")}</span><strong style={pathwaySource}>{truckFleetText(lang, source)}</strong><p style={smallText}>{truckFleetText(lang, detail)}</p></div><div><span style={smallLabel}>{truckFleetText(lang, "PROTECTION SYSTEM")}</span><strong style={pathwaySystem}>{truckFleetText(lang, system)}</strong></div><div><span style={smallLabel}>{truckFleetText(lang, "SERVICE CHECK")}</span><p style={smallText}>{truckFleetText(lang, serviceChecks[technology])}</p></div><Link href={href} style={technologyLink} className="miningTechnologyCell"><span style={smallLabelYellow}>{truckFleetText(lang, "ELIMFILTERS TECHNOLOGY")}</span><strong style={technologyName}>{technology}</strong><span style={technologyCta}>{truckFleetText(lang, "EXPLORE →")}</span></Link></article>)}</div>
        </div>
      </section>

      <section style={principleSection}>
        <div style={principle}><span style={principleLabel}>{truckFleetText(lang, "FLEET ENGINEERING PRINCIPLE")}</span><p style={principleText}>{truckFleetText(lang, "Standardize only after the application is validated. The goal is fewer ambiguous parts across the fleet, not one part forced across incompatible configurations.")}</p></div>
      </section>

      <IndustryFilterCarousel dutyClass="HD" industryName="Trucks Fleets" lang={lang} />

      <section style={availabilitySection} aria-labelledby="availability-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{truckFleetText(lang, "ROUTE AVAILABILITY")}</p>
          <h2 id="availability-title" style={sectionTitle}>{truckFleetText(lang, "Protect the maintenance plan before a filter decision becomes a route problem.")}</h2>
          <p style={wideText}>{truckFleetText(lang, "Fleet filtration affects more than component protection. It influences service consistency, parts readiness and how confidently maintenance teams can release a truck back to operation.")}</p>
          <div style={impactGrid} className="miningStakesGrid">{consequences.map(([title, text]) => <article key={title} style={impactCard}><h3 style={impactTitle}>{truckFleetText(lang, title)}</h3><p style={bodyText}>{truckFleetText(lang, text)}</p></article>)}</div>
        </div>
      </section>

      <section style={section} aria-labelledby="fleet-roles-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{truckFleetText(lang, "FLEET MAINTENANCE RESPONSIBILITIES")}</p>
          <h2 id="fleet-roles-title" style={sectionTitle}>{truckFleetText(lang, "Four responsibilities behind every truck returned to the route.")}</h2>
          <p style={wideText}>{truckFleetText(lang, "Successful fleet maintenance combines owner economics, service planning, engineering evidence and technical execution. Standardization is valid only for confirmed vehicle and engine configurations.")}</p>
          <div style={profileGrid} className="miningRiskGrid">
            {maintenanceRoles.map(([role, instruction]) => <article key={role} style={profileCard} className="miningRiskCard"><h3 style={cardTitle}>{truckFleetText(lang, role)}</h3><p style={bodyText}>{truckFleetText(lang, instruction)}</p></article>)}
          </div>
        </div>
      </section>

      <section style={section} aria-labelledby="decision-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{truckFleetText(lang, "FROM FLEET UNIT TO PART")}</p>
          <h2 id="decision-title" style={sectionTitle}>{truckFleetText(lang, "Resolve the fleet application in five decisions.")}</h2>
          <div style={decisionGrid} className="miningDecisionGrid">{[
            ['Vehicle + Engine', 'Identify the truck, engine and relevant configuration before treating two units as equivalent.'],
            ['Duty Profile', 'Define long-haul, regional, vocational or mixed use, including idle time, dust and route environment.'],
            ['Protected System', 'Resolve air intake, fuel, lubrication, cooling, compressed air, cabin air or vocational hydraulic protection.'],
            ['Fleet Standardization', 'Determine whether the validated application can be safely standardized across additional fleet units.'],
            ['Application Evidence', 'Confirm the final part using OEM/current reference, dimensions where needed and documented application evidence.'],
          ].map(([title, text]) => <article key={title} style={decisionCard}><h3 style={cardTitle}>{truckFleetText(lang, title)}</h3><p style={bodyText}>{truckFleetText(lang, text)}</p></article>)}</div>
        </div>
      </section>

      <section style={evidenceSection} aria-labelledby="evidence-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{truckFleetText(lang, "APPLICATION EVIDENCE")}</p>
          <h2 id="evidence-title" style={sectionTitle}>{truckFleetText(lang, "Cross-reference is the start of identification, not the end.")}</h2>
          <p style={wideText}>{truckFleetText(lang, "Final fleet standardization should reconcile the known reference with the truck or engine context, protected system and application evidence. If the evidence does not support equivalence, the units should remain separate in the fleet parts plan.")}</p>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={contentWidth}>
          <p style={eyebrow}>{truckFleetText(lang, "TRUCK FLEET FILTRATION QUESTIONS")}</p>
          <h2 id="faq-title" style={sectionTitle}>{truckFleetText(lang, "What fleet, maintenance and procurement teams need to know.")}</h2>
          <div style={faqList} className="miningFaqGrid">{questions.map(([q, a]) => <article key={q} style={faqItem} className="miningFaqItem"><h3 style={faqQuestion}>{truckFleetText(lang, q)}</h3><p style={faqAnswer}>{truckFleetText(lang, a)}</p></article>)}</div>
        </div>
      </section>

      <section style={conversionSection}>
        <div style={conversionGrid} className="miningConversionGrid">
          <div><p style={eyebrow}>{truckFleetText(lang, "NEED TO STANDARDIZE OR RESOLVE A FLEET APPLICATION?")}</p><h2 style={conversionTitle}>{truckFleetText(lang, "Identify the protection path before adding the part to the fleet standard.")}</h2><p style={conversionText}>{truckFleetText(lang, "Send fleet unit/VIN or chassis, year, engine and emissions configuration, operating hours, mileage, duty and route, fault or restriction observations, current filter/OEM references, and next planned service window.")}</p><Link href="/contact/" data-conversion-action="application-support" style={primaryButton}>{truckFleetText(lang, "IDENTIFY MY FLEET PROTECTION PATH")}</Link></div>
          <div style={conversionSecondary}><div><p style={eyebrow}>{truckFleetText(lang, "ALREADY HAVE A PART NUMBER?")}</p><h3 style={conversionSubTitle}>{truckFleetText(lang, "Go directly to Part Search.")}</h3><a href="https://part-search.elimfilters.com/" data-conversion-action="product-intelligence" style={secondaryButton}>{truckFleetText(lang, "FIND MY FILTER")}</a></div><div style={divider} /><div><p style={eyebrow}>{truckFleetText(lang, "SERVE COMMERCIAL FLEETS?")}</p><h3 style={conversionSubTitle}>{truckFleetText(lang, "Evaluate distributor fit.")}</h3><Link href="/distributor-application/" style={secondaryButton}>{truckFleetText(lang, "BECOME A DISTRIBUTOR")}</Link></div></div>
        </div>
      </section>
    </main>
  );
}


const truckFleetPageLayout = `
  /* Scoped layout matching Agriculture and Marine; no shared industry changes. */
  main.truck-fleets-industry-page .truckFleetEditorialIntro {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(2,minmax(0,1fr));
    gap: clamp(2rem,5vw,5rem);
    align-items: start;
  }
  main.truck-fleets-industry-page .truckFleetEditorialIntro > * { min-width: 0; }
  main.truck-fleets-industry-page .truckFleetScopeText {
    margin-top: clamp(1.25rem,2vw,2rem) !important;
    padding-left: clamp(1rem,2vw,1.5rem);
    border-left: 3px solid #FFF12D;
  }
  main.truck-fleets-industry-page .miningHeroHeading { max-width: min(100%,1500px) !important; }
  main.truck-fleets-industry-page > section:has(.filter-carousel-slide) > div {
    width: 100%; max-width: 1560px; margin-left: auto; margin-right: auto;
  }
  @media (max-width: 950px) {
    main.truck-fleets-industry-page .truckFleetEditorialIntro {
      grid-template-columns: minmax(0,1fr);
      gap: 1.5rem;
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
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-.055em', lineHeight: .94, fontSize: 'clamp(2.75rem,5.1vw,5.7rem)', textTransform: 'uppercase', margin: 0, maxWidth: '980px' };
const heroPromise: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.1rem,2vw,1.55rem)', lineHeight: 1.3, fontWeight: 700, maxWidth: '860px', margin: '1.6rem 0 0' };
const heroLead: CSSProperties = { fontSize: 'clamp(1rem,1.45vw,1.18rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.78)', maxWidth: '900px', margin: '1rem 0 0' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '.8rem', marginTop: '2rem' };
const primaryButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase' };
const secondaryButton: CSSProperties = { display: 'inline-block', background: 'transparent', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '.1em', fontSize: '.74rem', padding: '1rem 1.2rem', textTransform: 'uppercase', border: '1px solid rgba(255,241,45,.42)' };
const directSection: CSSProperties = { padding: 'clamp(3.5rem,6vw,5.5rem) clamp(1.25rem,6vw,6rem)', background: '#050505', borderBottom: '1px solid rgba(255,255,255,.08)' };
const contentWidth: CSSProperties = { maxWidth: '1560px', margin: '0 auto' };
const directTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem,3.6vw,3.2rem)', lineHeight: 1, textTransform: 'uppercase', letterSpacing: '-.035em', margin: 0 };
const directText: CSSProperties = { fontSize: 'clamp(1.05rem,1.45vw,1.2rem)', lineHeight: 1.7, color: 'rgba(255,255,255,.85)', margin: 0 };
const section: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', borderBottom: '1px solid rgba(255,255,255,.06)' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.2rem,4.7vw,4.2rem)', lineHeight: .96, letterSpacing: '-.04em', textTransform: 'uppercase', margin: 0, maxWidth: '960px' };
const bodyText: CSSProperties = { fontSize: 'clamp(1.08rem,1.18vw,1.2rem)', lineHeight: 1.68, color: 'rgba(255,255,255,.83)', margin: 0 };
const wideText: CSSProperties = { ...bodyText, maxWidth: '100%', marginTop: '1.3rem' };
const profileGrid: CSSProperties = { width: '100%', marginTop: '2rem' };
const profileCard: CSSProperties = { borderTop: '2px solid #FFF12D', background: '#050505', padding: '1.55rem', minHeight: '200px', minWidth: 0 };
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
const pathwayCard: CSSProperties = { border: '1px solid rgba(255,255,255,.1)', background: '#050505', padding: '1.5rem', minHeight: '275px', display: 'grid', gap: '1rem' };
const smallLabel: CSSProperties = { fontFamily: displayFont, fontSize: '.7rem', letterSpacing: '.12em', color: 'rgba(255,255,255,.68)', fontWeight: 700, display: 'block', marginBottom: '.7rem' };
const smallLabelYellow: CSSProperties = { ...smallLabel, color: '#FFF12D' };
const pathwaySource: CSSProperties = { fontFamily: displayFont, fontSize: '1.1rem', color: '#fff', textTransform: 'uppercase' };
const pathwaySystem: CSSProperties = { fontFamily: displayFont, fontSize: '1.05rem', color: '#fff', textTransform: 'uppercase' };
const smallText: CSSProperties = { ...bodyText, fontSize: '1.08rem', lineHeight: 1.55, marginTop: '.6rem' };
const technologyLink: CSSProperties = { textDecoration: 'none', borderTop: '1px solid rgba(255,241,45,.18)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' };
const technologyName: CSSProperties = { fontFamily: displayFont, fontSize: '1.25rem', color: '#FFF12D' };
const technologyCta: CSSProperties = { fontFamily: displayFont, fontSize: '.72rem', letterSpacing: '.1em', color: 'rgba(255,255,255,.6)', marginTop: '.65rem' };
const principleSection: CSSProperties = { padding: '0 clamp(1.25rem,6vw,6rem) clamp(4.5rem,8vw,7rem)' };
const principle: CSSProperties = { ...contentWidth, borderLeft: '4px solid #FFF12D', background: 'linear-gradient(90deg,rgba(255,241,45,.08),rgba(255,255,255,.018))', padding: 'clamp(2rem,4vw,3rem)' };
const principleLabel: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '.74rem', letterSpacing: '.16em', fontWeight: 700 };
const principleText: CSSProperties = { fontSize: 'clamp(1.2rem,2vw,1.55rem)', lineHeight: 1.55, color: 'rgba(255,255,255,.9)', margin: '1rem 0 0', maxWidth: '1040px' };
const availabilitySection: CSSProperties = { ...section, background: '#050505' };
const impactGrid: CSSProperties = { width: '100%', marginTop: '2rem' };
const impactCard: CSSProperties = { borderTop: '1px solid rgba(255,255,255,.15)', padding: '1.25rem 0', minHeight: '150px' };
const impactTitle: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '1.05rem', textTransform: 'uppercase', margin: '0 0 .65rem' };
const decisionGrid: CSSProperties = { width: '100%', marginTop: '2rem' };
const decisionCard: CSSProperties = { background: '#030303', minHeight: '190px', padding: '1.5rem', minWidth: 0 };
const evidenceSection: CSSProperties = { ...section, background: 'linear-gradient(90deg,rgba(255,241,45,.045),#030303 38%)' };
const faqSection: CSSProperties = { ...section, background: '#070707' };
const faqList: CSSProperties = { marginTop: '2rem', width: '100%' };
const faqItem: CSSProperties = { minWidth: 0 };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.05rem,1.8vw,1.3rem)', lineHeight: 1.25, margin: '0 0 .65rem' };
const faqAnswer: CSSProperties = { ...bodyText, maxWidth: '100%', fontSize: 'clamp(1.04rem,1.15vw,1.18rem)' };
const conversionSection: CSSProperties = { padding: 'clamp(4.5rem,8vw,7rem) clamp(1.25rem,6vw,6rem)', background: '#020202', borderTop: '1px solid rgba(255,255,255,.08)' };
const conversionGrid: CSSProperties = { width: '100%', display: 'grid', margin: '2rem auto 0' };
const conversionSecondary: CSSProperties = { display: 'grid', gap: '2.2rem' };
const conversionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2.4rem,5vw,4.6rem)', lineHeight: .95, letterSpacing: '-.04em', textTransform: 'uppercase', maxWidth: '780px', margin: 0 };
const conversionText: CSSProperties = { ...bodyText, fontSize: '1.05rem', maxWidth: '680px', margin: '1.5rem 0 2rem' };
const conversionSubTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.5rem,2.8vw,2.2rem)', textTransform: 'uppercase', margin: '0 0 1.5rem' };
const divider: CSSProperties = { height: '1px', background: 'rgba(255,255,255,.12)' };
