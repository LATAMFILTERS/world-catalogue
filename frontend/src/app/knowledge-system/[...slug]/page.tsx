import Link from 'next/link';
import type { CSSProperties } from 'react';

const displayFont = 'Chakra Petch, Arial Narrow, monospace';
const bodyFont = 'Barlow, Arial, sans-serif';

type PageData = {
  title: string;
  lead: string;
  points: string[];
  anchors: { label: string; value: string }[];
};

const PAGE_DATA: Record<string, PageData> = {
  standards: {
    title: 'Standards Reference',
    lead: 'Technical standards provide the measurement language for contamination control, filtration performance, cleanliness targets, and system validation.',
    points: [
      'ISO 4406 classifies fluid cleanliness by solid-particle contamination code.',
      'ISO 16889 evaluates hydraulic filter element performance through multi-pass testing.',
      'ISO 5011 evaluates inlet air cleaning equipment for combustion engines and compressors.',
    ],
    anchors: [
      { label: 'Fluid cleanliness', value: 'ISO 4406' },
      { label: 'Hydraulic filter testing', value: 'ISO 16889' },
      { label: 'Air intake testing', value: 'ISO 5011' },
    ],
  },
  'standards/iso-16889': {
    title: 'ISO 16889',
    lead: 'ISO 16889 is the multi-pass method used to evaluate hydraulic filter element performance under controlled test conditions.',
    points: [
      'Measures filter efficiency through Beta ratio at defined particle sizes.',
      'Supports comparison of hydraulic filter performance under repeatable test conditions.',
      'Should be presented as a filter element performance test, not as a complete hydraulic system standard.',
    ],
    anchors: [
      { label: 'Test method', value: 'Multi-pass performance evaluation' },
      { label: 'Efficiency expression', value: 'Beta ratio' },
      { label: 'Example', value: 'B10(c) >= 200 approx. 99.5%' },
    ],
  },
  'standards/iso-4406': {
    title: 'ISO 4406',
    lead: 'ISO 4406 classifies hydraulic and lubrication fluid cleanliness using solid-particle contamination codes.',
    points: [
      'Cleanliness codes communicate particle concentration ranges in a fluid sample.',
      'Lower codes indicate cleaner fluid and lower particle exposure for sensitive components.',
      'Targets must be selected according to the most sensitive component in the circuit.',
    ],
    anchors: [
      { label: 'Reference', value: 'ISO 4406:2021' },
      { label: 'Application', value: 'Hydraulic and lube cleanliness coding' },
      { label: 'Purpose', value: 'Contamination control target language' },
    ],
  },
  'standards/iso-5011': {
    title: 'ISO 5011',
    lead: 'ISO 5011 defines test procedures for inlet air cleaning equipment used on internal combustion engines and compressors.',
    points: [
      'Supports evaluation of dust capture, restriction behavior, and air cleaner performance.',
      'Relevant to air intake protection in mining, agriculture, construction, power generation, and fleet operations.',
      'Connects filter performance to airflow integrity and engine asset protection.',
    ],
    anchors: [
      { label: 'System', value: 'Air Intake Protection' },
      { label: 'Standard', value: 'ISO 5011' },
      { label: 'Focus', value: 'Dust capture and restriction' },
    ],
  },
  contamination: {
    title: 'Contamination and Failure Mechanisms',
    lead: 'Contamination causes particle wear, water damage, varnish formation, corrosion, flow restriction, and system bypass events across industrial assets.',
    points: [
      'Particle contamination creates abrasive wear in pumps, valves, bearings, cylinders, and injectors.',
      'Water contamination damages fuel and lubrication systems through corrosion, micro-pitting, and oxidation.',
      'Silica ingestion through air intake systems accelerates cylinder, ring, turbocharger, and valve wear.',
    ],
    anchors: [
      { label: 'Particle control', value: 'Wear reduction' },
      { label: 'Water control', value: 'Fuel and lube protection' },
      { label: 'Air cleanliness', value: 'Dust ingestion control' },
    ],
  },
  'contamination/hydraulic-system': {
    title: 'Hydraulic System Contamination',
    lead: 'Hydraulic systems depend on controlled fluid cleanliness because pumps, servo valves, proportional valves, and cylinders operate with precision clearances.',
    points: [
      'Cleanliness targets should be set by the most sensitive component in the hydraulic circuit.',
      'Particle counts should be measured and trended through consistent oil analysis practices.',
      'Filter selection should connect Beta ratio, flow demand, pressure rating, bypass behavior, and duty cycle.',
    ],
    anchors: [
      { label: 'Cleanliness code', value: 'ISO 4406' },
      { label: 'Filter performance', value: 'ISO 16889' },
      { label: 'Technology', value: 'NANOFORCE' },
    ],
  },
  'contamination/particle-wear': {
    title: 'Particle Wear',
    lead: 'Particle wear occurs when hard particles enter lubricated or hydraulic interfaces and damage component surfaces through abrasion, cutting, and fatigue initiation.',
    points: [
      'Critical particles are often smaller than what is visible to the eye.',
      'Wear depends on particle hardness, size, concentration, flow path, and component clearance.',
      'Cleaner fluid reduces exposure to abrasive particles and supports longer component service life.',
    ],
    anchors: [
      { label: 'Mechanism', value: 'Abrasive wear' },
      { label: 'Control', value: 'Particle filtration' },
      { label: 'Reference', value: 'ISO 4406' },
    ],
  },
  'contamination/diesel-water': {
    title: 'Diesel Water Contamination',
    lead: 'Water in diesel fuel damages precision injection components and reduces fuel system reliability through corrosion, micro-pitting, and poor combustion quality.',
    points: [
      'Water can enter fuel through condensation, storage tanks, transfer processes, and handling practices.',
      'Fuel-water separation must address both free water and emulsified water depending on system demand.',
      'Water content can be evaluated through recognized laboratory methods such as Karl Fischer titration.',
    ],
    anchors: [
      { label: 'Water testing', value: 'ASTM D6304 / ISO 12937' },
      { label: 'System', value: 'Fuel Cleanliness Protection' },
      { label: 'Technology', value: 'HYDROCORE / SYNTEPORE' },
    ],
  },
  science: {
    title: 'Filtration Science',
    lead: 'Filtration science explains how particles are captured, how media structure affects performance, and why system-level contamination control must be engineered around real operating conditions.',
    points: [
      'Capture mechanisms include interception, inertial impaction, diffusion, and depth loading.',
      'Efficiency, dirt holding capacity, restriction, and service interval must be balanced together.',
      'Media choice must match contaminant type, fluid properties, duty cycle, and validation standard.',
    ],
    anchors: [
      { label: 'Capture', value: 'Interception / impaction / diffusion' },
      { label: 'Performance', value: 'Efficiency and capacity' },
      { label: 'Validation', value: 'ISO test methods' },
    ],
  },
  compare: {
    title: 'Protection System Evaluation',
    lead: 'Industrial filtration should be evaluated by contamination control performance, not by product appearance, catalog equivalence, or brand substitution alone.',
    points: [
      'A valid evaluation compares filtration efficiency, dirt capacity, bypass integrity, collapse strength, flow behavior, and application fit.',
      'Replacement selection must be connected to the asset, system, contaminant profile, and duty cycle.',
      'The correct question is not only whether a filter fits, but whether the protection strategy is adequate.',
    ],
    anchors: [
      { label: 'Evaluation', value: 'System-level fit' },
      { label: 'Risk', value: 'Bypass and under-specification' },
      { label: 'Outcome', value: 'Asset protection' },
    ],
  },
  'compare/evaluation-framework': {
    title: 'Evaluation Framework',
    lead: 'A filtration evaluation framework compares engineering performance, system compatibility, contamination risk, and operational outcome.',
    points: [
      'Confirm dimensional fit and sealing geometry before performance evaluation.',
      'Validate media efficiency, pressure rating, flow capacity, and bypass behavior against application demand.',
      'Map the selection to the contamination mechanism and protected asset.',
    ],
    anchors: [
      { label: 'Fit', value: 'Geometry and sealing' },
      { label: 'Performance', value: 'Efficiency and flow' },
      { label: 'Outcome', value: 'Reliability' },
    ],
  },
  'compare/oem-comparison': {
    title: 'OEM Comparison',
    lead: 'OEM comparison should focus on engineering requirements, system compatibility, and contamination-control performance rather than brand language.',
    points: [
      'Compare Beta ratio, media construction, collapse rating, bypass setting, gasket material, and duty-cycle suitability.',
      'Confirm whether the replacement maintains or improves the contamination boundary of the original system.',
      'Avoid unsupported claims unless test data or documented specifications support them.',
    ],
    anchors: [
      { label: 'Criteria', value: 'Specification-based comparison' },
      { label: 'Risk', value: 'Under-performing substitute' },
      { label: 'Standard', value: 'ISO 16889 / ISO 5011' },
    ],
  },
  'compare/system-vs-commodity': {
    title: 'System vs Commodity',
    lead: 'A commodity filter mindset focuses on replacement price. A system protection mindset focuses on the contamination threat and the asset consequence of failure.',
    points: [
      'System protection evaluates the full contamination path, not just the replaceable element.',
      'The protection decision connects standards, media, sealing, bypass behavior, and application severity.',
      'The objective is operational continuity, not only parts replacement.',
    ],
    anchors: [
      { label: 'Commodity view', value: 'Replacement part' },
      { label: 'System view', value: 'Protection architecture' },
      { label: 'Outcome', value: 'Continuity' },
    ],
  },
  fleet: {
    title: 'Fleet Optimization',
    lead: 'Fleet optimization connects contamination control to service discipline, oil analysis, condition-based maintenance, and reduced exposure to unplanned failures.',
    points: [
      'Track cleanliness, restriction, service intervals, failure modes, and component replacement patterns.',
      'Replace filters based on performance indicators and operating context, not calendar habits alone.',
      'Use contamination control as a reliability program, not only a maintenance purchase.',
    ],
    anchors: [
      { label: 'Fleet objective', value: 'Operational continuity' },
      { label: 'Method', value: 'Condition-based maintenance' },
      { label: 'Data', value: 'Oil analysis and restriction trends' },
    ],
  },
  'fleet/reducing-downtime': {
    title: 'Reducing Downtime',
    lead: 'Downtime reduction begins with identifying the contamination mechanisms that create failure risk before the asset stops operating.',
    points: [
      'Link failure history to contamination root causes, not only component replacement records.',
      'Measure fluid cleanliness, air restriction, water contamination, and bypass indicators where possible.',
      'Align filter selection and service intervals with the duty cycle of the fleet.',
    ],
    anchors: [
      { label: 'Risk', value: 'Unplanned stop' },
      { label: 'Control', value: 'Measured contamination' },
      { label: 'Outcome', value: 'Higher availability' },
    ],
  },
  'fleet/fuel-efficiency': {
    title: 'Fuel Efficiency',
    lead: 'Fuel efficiency is affected by air restriction, injector wear, fuel contamination, combustion quality, and maintenance discipline.',
    points: [
      'Air intake restriction can reduce combustion efficiency and increase engine stress.',
      'Fuel contamination can accelerate injector wear and degrade spray quality.',
      'Consistent filtration performance supports stable operating conditions across the service interval.',
    ],
    anchors: [
      { label: 'Air side', value: 'Restriction control' },
      { label: 'Fuel side', value: 'Injector protection' },
      { label: 'System', value: 'Air and fuel protection' },
    ],
  },
  'fleet/total-cost-ownership': {
    title: 'Total Cost of Ownership',
    lead: 'Total cost of ownership is shaped by downtime exposure, component wear, service intervals, labor, fluid condition, and asset availability.',
    points: [
      'Filter cost is only one part of the economic picture.',
      'Under-specified filtration can increase component wear and unplanned maintenance exposure.',
      'A system-level protection strategy evaluates cost through reliability and asset continuity.',
    ],
    anchors: [
      { label: 'Cost view', value: 'Lifecycle impact' },
      { label: 'Risk view', value: 'Failure exposure' },
      { label: 'Decision', value: 'System protection' },
    ],
  },
  bridges: {
    title: 'Knowledge Bridges',
    lead: 'Bridge pages connect search intent, technical education, system logic, and ELIMFILTERS protection architecture.',
    points: [
      'Bridge content should help users move from a problem to the correct protection system.',
      'The bridge is educational, not generic marketing copy.',
      'Each bridge should connect industry context, contamination mechanism, system selection, and operational outcome.',
    ],
    anchors: [
      { label: 'Function', value: 'Intent translation' },
      { label: 'Structure', value: 'Problem to system' },
      { label: 'Outcome', value: 'Clear navigation' },
    ],
  },
};

const ALIASES: Record<string, string> = {
  'standards/lube-oil-systems': 'standards',
  'standards/hydraulic-systems': 'contamination/hydraulic-system',
  'standards/air-intake-systems': 'standards/iso-5011',
  'standards/fuel-systems': 'contamination/diesel-water',
  'standards/cabin-safety-systems': 'standards',
  'standards/compressed-air-systems': 'standards',
  'contamination/varnish-formation': 'contamination',
  'contamination/fuel-injector-wear': 'contamination/diesel-water',
  'contamination/compressed-air-contamination': 'standards',
  'contamination/coolant-contamination': 'contamination',
  'fleet/roi-calculator': 'fleet/total-cost-ownership',
  'bridges/industrial-filtration': 'bridges',
  'bridges/aftermarket-selection': 'compare/oem-comparison',
  'bridges/fleet-solutions': 'fleet',
  'bridges/oem-replacement': 'compare/oem-comparison',
  'compare/total-cost-ownership': 'fleet/total-cost-ownership',
};

const STATIC_ROUTES = Array.from(new Set([...Object.keys(PAGE_DATA), ...Object.keys(ALIASES)]));

export function generateStaticParams() {
  return STATIC_ROUTES.map((route) => ({ slug: route.split('/') }));
}

function getPageData(slug: string): PageData {
  return PAGE_DATA[slug] || PAGE_DATA[ALIASES[slug]] || {
    title: slug.split('/').pop()?.replace(/-/g, ' ') || 'Knowledge Reference',
    lead: 'This knowledge reference connects contamination control, system protection, standards, technologies, and industrial asset reliability.',
    points: [
      'Identify the protected asset and operating context.',
      'Define the contamination mechanism and applicable standard.',
      'Select the correct protection system and validate the operational outcome.',
    ],
    anchors: [
      { label: 'Domain', value: 'Knowledge System' },
      { label: 'Method', value: 'Contamination control' },
      { label: 'Objective', value: 'Asset protection' },
    ],
  };
}

export default function KnowledgeSystemInternalPage({ params }: { params: { slug: string[] } }) {
  const slug = params.slug.join('/');
  const data = getPageData(slug);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    name: `${data.title} | ELIMFILTERS Knowledge System`,
    description: data.lead,
    url: `https://elimfilters.com/knowledge-system/${slug}/`,
    publisher: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
  };

  return (
    <main style={main}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Chakra+Petch:wght@500;600;700&display=swap');`}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <Link href="/knowledge-system/" style={homeButton}>BACK TO KNOWLEDGE</Link>

      <section style={heroSection}>
        <div style={heroInner}>
          <h1 style={heroTitle}>{data.title}</h1>
          <p style={heroLead}>{data.lead}</p>
        </div>
      </section>

      <section style={contentSection}>
        <div style={twoCol}>
          <h2 style={sectionTitle}>Engineering context.</h2>
          <div>
            {data.points.map((point) => (
              <p key={point} style={bodyText}>{point}</p>
            ))}
          </div>
        </div>
      </section>

      <section style={anchorSection}>
        <div style={wrap}>
          <h2 style={sectionTitle}>Technical anchors.</h2>
          <div style={anchorGrid}>
            {data.anchors.map((item) => (
              <div key={item.label} style={anchorCard}>
                <span style={anchorLabel}>{item.label}</span>
                <strong style={anchorValue}>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={ctaSection}>
        <div style={ctaInner}>
          <h2 style={{ ...sectionTitle, textAlign: 'center' }}>Connect this reference to asset protection.</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.9rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            <Link href="/systems/" style={yellowButton}>VIEW SYSTEMS</Link>
            <Link href="/technologies/" style={darkButton}>VIEW TECHNOLOGIES</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont };

const homeButton: CSSProperties = {
  position: 'fixed', top: '1.1rem', right: '1.35rem', zIndex: 9999,
  background: 'rgba(0,0,0,0.78)', border: '1px solid rgba(255,241,45,0.45)',
  color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont,
  fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.78rem',
  padding: '0.8rem 1.15rem', backdropFilter: 'blur(14px)',
};

const heroSection: CSSProperties = {
  minHeight: '78vh', display: 'flex', alignItems: 'center',
  padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)',
  background: 'linear-gradient(180deg, rgba(255,241,45,0.07) 0%, rgba(0,0,0,0) 45%), radial-gradient(circle at top right, rgba(255,241,45,0.16), transparent 34%)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%' };

const heroTitle: CSSProperties = {
  fontFamily: displayFont, fontWeight: 700, letterSpacing: '-0.055em',
  lineHeight: 0.88, fontSize: 'clamp(3.1rem, 7.5vw, 7.2rem)',
  maxWidth: '1120px', margin: 0, textTransform: 'uppercase',
};

const heroLead: CSSProperties = {
  marginTop: '2rem', maxWidth: '820px', color: 'rgba(255,255,255,0.78)',
  fontSize: 'clamp(1rem, 1.6vw, 1.28rem)', lineHeight: 1.75, fontWeight: 600,
  borderLeft: '3px solid #FFF12D', paddingLeft: '1.4rem',
};

const contentSection: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const twoCol: CSSProperties = {
  maxWidth: '1180px', margin: '0 auto', display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: 'clamp(2rem, 6vw, 5rem)',
};

const sectionTitle: CSSProperties = {
  fontFamily: displayFont, fontSize: 'clamp(2rem, 4vw, 3.6rem)',
  lineHeight: 0.95, letterSpacing: '-0.035em', margin: 0,
  textTransform: 'uppercase', fontWeight: 700,
};

const bodyText: CSSProperties = {
  color: 'rgba(255,255,255,0.68)', fontSize: 'clamp(1rem, 1.5vw, 1.18rem)',
  lineHeight: 1.78, margin: '0 0 1.2rem', fontWeight: 500,
};

const anchorSection: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  background: 'rgba(255,255,255,0.018)', borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };

const anchorGrid: CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
  gap: '1rem', marginTop: '2.4rem',
};

const anchorCard: CSSProperties = {
  background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.1)',
  padding: '1.35rem', minHeight: '170px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
};

const anchorLabel: CSSProperties = {
  color: 'rgba(255,255,255,0.42)', fontFamily: displayFont,
  fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700,
};

const anchorValue: CSSProperties = {
  display: 'block', fontFamily: displayFont, color: '#FFF12D',
  fontSize: 'clamp(1.15rem, 2vw, 1.6rem)', lineHeight: 1.05, textTransform: 'uppercase', marginTop: '1.4rem',
};

const ctaSection: CSSProperties = {
  padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)',
  background: 'radial-gradient(circle at 50% 0%, rgba(255,241,45,0.16), transparent 34%)',
};

const ctaInner: CSSProperties = { maxWidth: '980px', margin: '0 auto', textAlign: 'center' };

const yellowButton: CSSProperties = {
  display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none',
  fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.16em',
  fontSize: '0.82rem', padding: '1rem 1.25rem', textTransform: 'uppercase',
};

const darkButton: CSSProperties = {
  display: 'inline-block', background: 'rgba(0,0,0,0.5)', color: '#FFF12D',
  textDecoration: 'none', fontFamily: displayFont, fontWeight: 700,
  letterSpacing: '0.16em', fontSize: '0.82rem', padding: '1rem 1.25rem',
  border: '1px solid rgba(255,241,45,0.4)', textTransform: 'uppercase',
};