import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import type { CSSProperties } from 'react';

const BASE_URL = 'https://elimfilters.com';

const INDUSTRIES = [
  {
    slug: 'mining',
    label: 'Mining',
    image: '/images/mineria-1.avif',
    summary: 'Mining filtration for equipment operating under abrasive dust, heavy hydraulic load, and severe production cycles.',
    risks: ['Abrasive dust', 'Hydraulic contamination', 'Fuel cleanliness'],
    systems: ['Air Intake', 'Fuel', 'Lube', 'Hydraulic'],
    assets: ['Haul trucks', 'Loaders', 'Excavators', 'Drills'],
  },
  {
    slug: 'agriculture',
    label: 'Agriculture',
    image: '/images/agricultor-1.avif',
    summary: 'Agricultural equipment filtration for harvest dust, variable fuel quality, long service windows, and seasonal uptime.',
    risks: ['Harvest dust', 'Fuel contamination', 'Long service intervals'],
    systems: ['Air Intake', 'Fuel', 'Lube', 'Cabin'],
    assets: ['Tractors', 'Combines', 'Sprayers', 'Harvesters'],
  },
  {
    slug: 'construction',
    label: 'Construction',
    image: '/images/chino-construction.avif',
    summary: 'Construction equipment filtration for dusty jobsites, hydraulic stress, idle time, and high-cost downtime.',
    risks: ['Jobsite dust', 'Hydraulic contamination', 'Idle-time loading'],
    systems: ['Air Intake', 'Fuel', 'Lube', 'Hydraulic'],
    assets: ['Excavators', 'Loaders', 'Dozers', 'Graders'],
  },
  {
    slug: 'oil-gas',
    label: 'Oil & Gas',
    image: '/images/ingpetrolero.avif',
    summary: 'Oil and gas filtration for remote assets exposed to bulk-fuel contamination, fluid cleanliness demands, and harsh duty cycles.',
    risks: ['Bulk-fuel contamination', 'Water ingress', 'Remote downtime'],
    systems: ['Fuel', 'Lube', 'Hydraulic', 'Air Intake'],
    assets: ['Field equipment', 'Compressors', 'Generators', 'Support fleets'],
  },
  {
    slug: 'marine',
    label: 'Marine',
    image: '/images/ingmarine.avif',
    summary: 'Marine filtration for propulsion and auxiliary equipment exposed to moisture, fuel contamination, and corrosion-prone environments.',
    risks: ['Water contamination', 'Fuel cleanliness', 'Moisture exposure'],
    systems: ['Fuel', 'Lube', 'Air Intake', 'Coolant'],
    assets: ['Main engines', 'Auxiliary engines', 'Generators', 'Workboats'],
  },
  {
    slug: 'power-generation',
    label: 'Power Generation',
    image: '/images/generatorsupervisor.avif',
    summary: 'Power-generation filtration for standby readiness, fuel stability, lubrication protection, and emergency uptime.',
    risks: ['Standby fuel degradation', 'Air restriction', 'Lube contamination'],
    systems: ['Air Intake', 'Fuel', 'Lube', 'Coolant'],
    assets: ['Generator sets', 'Standby units', 'Prime-power units', 'Rental fleets'],
  },
  {
    slug: 'trucks-fleets',
    label: 'Commercial Truck Fleets',
    image: '/images/transport.avif',
    summary: 'Commercial fleet filtration for route uptime, fuel economy, service discipline, and lifecycle cost control.',
    risks: ['Fuel contamination', 'Air restriction', 'Service variability'],
    systems: ['Air Intake', 'Fuel', 'Lube', 'Cabin'],
    assets: ['Class 8 trucks', 'Vocational trucks', 'Regional fleets', 'Line-haul fleets'],
  },
  {
    slug: 'manufacturing',
    label: 'Manufacturing',
    image: '/images/manufactura.avif',
    summary: 'Industrial filtration for plant continuity, compressed-air quality, hydraulic control, and process reliability.',
    risks: ['Hydraulic contamination', 'Compressed-air contamination', 'Process downtime'],
    systems: ['Hydraulic', 'Compressed Air', 'Lube', 'Air Intake'],
    assets: ['Production equipment', 'Compressors', 'Hydraulic systems', 'Plant utilities'],
  },
  {
    slug: 'railway',
    label: 'Railway',
    image: '/images/ing-railway.avif',
    summary: 'Railway filtration for long operating cycles, diesel reliability, vibration exposure, and maintenance planning.',
    risks: ['Long duty cycles', 'Fuel contamination', 'Airborne dust'],
    systems: ['Air Intake', 'Fuel', 'Lube', 'Coolant'],
    assets: ['Locomotives', 'Rail equipment', 'Maintenance units', 'Support equipment'],
  },
  {
    slug: 'waste-municipal',
    label: 'Waste & Municipal Fleets',
    image: '/images/wasted-municipal.avif',
    summary: 'Municipal fleet filtration for stop-start operation, dust ingestion, hydraulic load, and public-service uptime.',
    risks: ['Stop-start duty', 'Dust ingestion', 'Hydraulic load'],
    systems: ['Air Intake', 'Fuel', 'Lube', 'Hydraulic'],
    assets: ['Refuse trucks', 'Sweepers', 'Utility trucks', 'Municipal equipment'],
  },
  {
    slug: 'bus-coach',
    label: 'Bus & Coach',
    image: '/images/bus-hero.avif',
    summary: 'Bus and coach filtration for passenger uptime, cabin-air quality, engine protection, and predictable route service.',
    risks: ['Urban duty cycles', 'Cabin-air loading', 'Fuel contamination'],
    systems: ['Air Intake', 'Fuel', 'Lube', 'Cabin'],
    assets: ['Transit buses', 'Intercity coaches', 'School buses', 'Shuttle fleets'],
  },
  {
    slug: 'automotive',
    label: 'Automotive',
    image: '/images/Automotive-1.avif',
    summary: 'Light-duty filtration for service reliability, contamination control, and high-volume application coverage.',
    risks: ['Service variability', 'Airborne contamination', 'Fuel and lube cleanliness'],
    systems: ['Air Intake', 'Fuel', 'Lube', 'Cabin'],
    assets: ['Passenger vehicles', 'Light trucks', 'Vans', 'Service fleets'],
  },
] as const;

const FAQS = [
  {
    q: 'Why do filtration requirements change by industry?',
    a: 'Filtration requirements change with dust concentration, water exposure, fuel quality, system sensitivity, temperature, load cycle, idle time, and service interval. The same filter category can therefore face very different contamination loads and failure risks in mining, marine, power generation, or urban fleet service.',
  },
  {
    q: 'What filtration systems are most important in severe-duty equipment?',
    a: 'The critical systems depend on the asset and operating environment, but severe-duty equipment commonly requires coordinated protection across air intake, fuel, lubrication, hydraulic, coolant, cabin, and compressed-air systems.',
  },
  {
    q: 'How does ELIMFILTERS select protection for an industry?',
    a: 'Selection begins with the asset, operating environment, contamination mechanism, duty cycle, service conditions, and cost of downtime. The protection architecture is then connected to the appropriate system, technology, and product family.',
  },
  {
    q: 'Can I search by part number instead of industry?',
    a: 'Yes. If you already know an OEM reference or part number, Part Search provides the fastest path to cross-reference and application information without navigating the industry structure first.',
  },
];

export const metadata = {
  title: 'Industrial Filtration by Industry | ELIMFILTERS',
  description: 'Industrial filtration and contamination-control strategies for mining, agriculture, construction, oil & gas, marine, power generation, commercial fleets, manufacturing, railway, municipal fleets, bus & coach, and automotive applications.',
  alternates: { canonical: `${BASE_URL}/industries/` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Industrial Filtration by Industry | ELIMFILTERS',
    description: 'Explore industry-specific contamination risks, protection systems, equipment applications, and filtration strategies across 12 markets.',
    url: `${BASE_URL}/industries/`,
    type: 'website',
    siteName: 'ELIMFILTERS',
    images: [{ url: `${BASE_URL}/assets/logo-elimfilters.png`, width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Industrial Filtration by Industry | ELIMFILTERS',
    description: 'Industry-specific contamination control and asset protection across 12 operating markets.',
    images: [`${BASE_URL}/assets/logo-elimfilters.png`],
  },
};

export default function IndustriesPage() {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${BASE_URL}/industries/#page`,
        url: `${BASE_URL}/industries/`,
        name: 'Industrial Filtration by Industry',
        description: 'Industry-specific industrial filtration and contamination-control strategies across 12 operating markets.',
        mainEntity: { '@id': `${BASE_URL}/industries/#industries` },
        breadcrumb: { '@id': `${BASE_URL}/industries/#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${BASE_URL}/industries/#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: `${BASE_URL}/industries/` },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${BASE_URL}/industries/#industries`,
        name: 'ELIMFILTERS Industrial Markets',
        numberOfItems: INDUSTRIES.length,
        itemListElement: INDUSTRIES.map((industry, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'WebPage',
            name: industry.label,
            description: industry.summary,
            url: `${BASE_URL}/industries/${industry.slug}/`,
          },
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${BASE_URL}/industries/#faq`,
        mainEntity: FAQS.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };

  return (
    <main id="main-content" style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      <PageHeader currentPage="Industries" />

      <section style={hero}>
        <video autoPlay muted loop playsInline preload="metadata" style={{ ...heroImage, objectFit: 'cover', objectPosition: 'center' }}>
          <source src="/images/Engineer_walking_home_industrias.mp4" type="video/mp4" />
        </video>
        <div style={heroOverlay} />
        <div style={heroInner}>
          <p style={eyebrow}>INDUSTRIAL ASSET PROTECTION</p>
          <h1 style={heroTitle}>
            Industrial Filtration
            <br />
            <span style={{ color: '#FFF12D' }}>By Industry</span>
          </h1>
          <p style={heroLead}>
            ELIMFILTERS structures contamination control around the equipment, operating environment, duty cycle, and cost of downtime—not a generic application assumption.
          </p>
          <div style={heroActions}>
            <Link href="/contact/" style={yellowButton}>PROTECT MY EQUIPMENT</Link>
            <a href="https://part-search.elimfilters.com/" style={darkButton}>FIND MY FILTER</a>
          </div>
        </div>
      </section>

      <section style={answerSection} aria-labelledby="industries-answer-title">
        <div style={answerGrid}>
          <div>
            <p style={eyebrow}>DIRECT ANSWER</p>
            <h2 id="industries-answer-title" style={sectionTitle}>What industries does ELIMFILTERS support?</h2>
          </div>
          <div>
            <p style={leadText}>
              ELIMFILTERS provides industrial filtration and contamination-control architectures for 12 markets: mining, agriculture, construction, oil &amp; gas, marine, power generation, commercial truck fleets, manufacturing, railway, waste and municipal fleets, bus and coach operations, and automotive applications.
            </p>
            <p style={bodyText}>
              Filtration requirements change with dust concentration, water exposure, fuel quality, temperature, load cycle, system sensitivity, idle time, and service interval. Industry is therefore the first context layer—not the final product selection.
            </p>
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={twoCol}>
          <div>
            <p style={eyebrow}>WHY INDUSTRY MATTERS</p>
            <h2 style={industryRiskTitle}>The same filter does not face the same failure risk.</h2>
          </div>
          <div>
            <p style={leadText}>
              A mining loader, a marine engine, a standby generator, and a city waste truck may share filter categories, but they do not share the same operating reality.
            </p>
            <p style={bodyText}>
              The correct protection strategy connects the contamination mechanism to the system being protected, the equipment duty cycle, the maintenance environment, and the consequence of failure.
            </p>
          </div>
        </div>
      </section>

      <section style={marketSection} aria-labelledby="markets-title">
        <div style={wrapWide}>
          <div style={{ maxWidth: '1180px', margin: '0 auto 2.4rem' }}>
            <p style={eyebrow}>12 OPERATING MARKETS</p>
            <h2 id="markets-title" style={sectionTitle}>Select the industry. Understand the risk. Protect the asset.</h2>
          </div>

          <div style={marketGrid}>
            {INDUSTRIES.map((industry) => (
              <Link key={industry.slug} href={`/industries/${industry.slug}/`} style={marketCard} aria-label={`Explore ${industry.label} filtration and asset protection`}>
                <img src={industry.image} alt={`${industry.label} industrial equipment`} style={marketImage} loading="lazy" />
                <div style={marketOverlay} />
                <div style={marketContent}>
                  <h3 style={marketTitle}>{industry.label}</h3>
                  <p style={marketLine}>{industry.summary}</p>
                  <div style={dataRow}><span style={dataLabel}>RISKS</span><span>{industry.risks.join(' · ')}</span></div>
                  <div style={dataRow}><span style={dataLabel}>PROTECT</span><span>{industry.systems.join(' · ')}</span></div>
                  <div style={dataRow}><span style={dataLabel}>ASSETS</span><span>{industry.assets.join(' · ')}</span></div>
                  <span style={explore}>EXPLORE {industry.label.toUpperCase()} PROTECTION →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={standardsSection}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <p style={eyebrow}>ENGINEERING CONTEXT</p>
          <h2 style={{ ...sectionTitle, marginBottom: '1.5rem' }}>Industry-specific contamination control</h2>
          <p style={{ ...bodyText, maxWidth: '820px', marginBottom: '2rem' }}>
            Industry changes the contamination load; engineering standards help define how the relevant system is measured. The standard must match the failure mechanism and filtration domain rather than being used as a generic industry label.
          </p>

          <div style={standardGrid}>
            <div style={standardCard}>
              <h3 style={standardTitle}>Mining &amp; Construction</h3>
              <p style={standardText}>Air-intake performance: ISO 5011. Hydraulic filter multi-pass performance: ISO 16889. Fluid cleanliness coding: ISO 4406.</p>
            </div>
            <div style={standardCard}>
              <h3 style={standardTitle}>Marine &amp; Oil &amp; Gas</h3>
              <p style={standardText}>Fuel-filter performance: ISO 19438. Water-content determination in fuel: ISO 12937 where applicable. Corrosion and salt exposure are treated as separate environmental considerations.</p>
            </div>
            <div style={standardCard}>
              <h3 style={standardTitle}>Power Generation &amp; Manufacturing</h3>
              <p style={standardText}>Air-intake performance: ISO 5011 where engine or compressor intake applies. Hydraulic and lubrication filter performance: ISO 16889 where applicable.</p>
            </div>
          </div>

          <Link href="/knowledge-center/industries/" style={{ ...yellowButton, marginTop: '2rem' }}>
            EXPLORE INDUSTRY TECHNICAL STRATEGIES
          </Link>
        </div>
      </section>

      <section style={pathSection}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <p style={eyebrow}>FROM OPERATING ENVIRONMENT TO PRODUCT</p>
          <h2 style={{ ...sectionTitle, maxWidth: '900px' }}>Translate industry risk into the correct protection architecture.</h2>
          <div style={pathGrid}>
            {[
              ['01', 'Industry', 'Establish the operating environment, equipment type, and duty cycle.'],
              ['02', 'Contamination Risk', 'Identify particles, water, thermal stress, bypass risk, or other failure mechanisms.'],
              ['03', 'Protection System', 'Connect the risk to air, fuel, lubrication, hydraulic, coolant, cabin, or compressed-air protection.'],
              ['04', 'Technology', 'Apply the ELIMFILTERS technology architecture engineered for that system.'],
              ['05', 'Product', 'Resolve the final part, OEM reference, dimensions, and application fit.'],
            ].map(([num, title, desc]) => (
              <div key={num} style={pathCard}>
                <span style={pathNumber}>{num}</span>
                <h3 style={pathTitle}>{title}</h3>
                <p style={pathText}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={conversionSection} aria-labelledby="conversion-title">
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <p style={eyebrow}>CHOOSE YOUR NEXT STEP</p>
          <h2 id="conversion-title" style={{ ...sectionTitle, marginBottom: '2.25rem' }}>What do you need to do?</h2>
          <div style={conversionGrid}>
            <div style={conversionCard}>
              <h3 style={conversionTitle}>Protect Equipment</h3>
              <p style={conversionText}>Tell us the equipment, engine, operating environment, or contamination problem. We will route the request to the correct protection path.</p>
              <Link href="/contact/" style={yellowButton}>GET TECHNICAL SUPPORT</Link>
            </div>
            <div style={conversionCard}>
              <h3 style={conversionTitle}>Find a Part</h3>
              <p style={conversionText}>Already know the OEM reference or filter number? Go directly to cross-reference and application search.</p>
              <a href="https://part-search.elimfilters.com/" style={yellowButton}>OPEN PART SEARCH</a>
            </div>
            <div style={conversionCard}>
              <h3 style={conversionTitle}>Represent ELIMFILTERS</h3>
              <p style={conversionText}>Tell us the industries, territory, and customer base your company serves so we can evaluate distributor fit.</p>
              <Link href="/distributor-application/" style={yellowButton}>DISTRIBUTOR REVIEW</Link>
            </div>
          </div>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <p style={eyebrow}>INDUSTRY FILTRATION QUESTIONS</p>
          <h2 id="faq-title" style={{ ...sectionTitle, marginBottom: '2rem' }}>Common questions about filtration by industry</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {FAQS.map((item) => (
              <article key={item.q} style={faqCard}>
                <h3 style={faqQuestion}>{item.q}</h3>
                <p style={faqAnswer}>{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={cta}>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ ...sectionTitle, textAlign: 'center', maxWidth: '880px', marginLeft: 'auto', marginRight: 'auto' }}>
            Start with the operating reality. End with the right protection.
          </h2>
          <p style={{ ...bodyText, maxWidth: '720px', margin: '1.4rem auto 0', textAlign: 'center' }}>
            Move from industry context to protection system, technology, and product identification without treating every duty cycle as the same application.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.9rem', marginTop: '2rem' }}>
            <Link href="/systems/" style={yellowButton}>PROTECTION SYSTEMS</Link>
            <Link href="/technologies/" style={darkButton}>TECHNOLOGIES</Link>
            <a href="https://part-search.elimfilters.com/" style={darkButton}>PART SEARCH</a>
          </div>
        </div>
      </section>
    </main>
  );
}

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';

const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont };
const hero: CSSProperties = { minHeight: '88vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const heroImage: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.48 };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.76) 0%, rgba(0,0,0,0.48) 52%, rgba(0,0,0,0.18) 100%), radial-gradient(circle at top right, rgba(255,241,45,0.18), transparent 38%)' };
const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-0.055em', lineHeight: 0.9, fontSize: 'clamp(3.1rem, 7.2vw, 6.8rem)', maxWidth: '1050px', margin: 0, textTransform: 'uppercase' };
const heroLead: CSSProperties = { marginTop: '2rem', maxWidth: '800px', color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(1.05rem, 2vw, 1.28rem)', lineHeight: 1.68, fontWeight: 500 };
const heroActions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginTop: '2rem' };
const eyebrow: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '0.72rem', lineHeight: 1, letterSpacing: '0.2em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 1rem' };
const section: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)' };
const answerSection: CSSProperties = { ...section, borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.015)' };
const answerGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.85fr) minmax(0, 1.15fr)', gap: 'clamp(2rem, 6vw, 5rem)' };
const twoCol: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: 'clamp(2rem, 6vw, 5rem)' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem, 4vw, 3.6rem)', lineHeight: 0.98, letterSpacing: '-0.035em', margin: 0, textTransform: 'uppercase', fontWeight: 700 };
const industryRiskTitle: CSSProperties = { ...sectionTitle, fontSize: 'clamp(2.3rem, 4.6vw, 4.14rem)' };
const leadText: CSSProperties = { color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(1.08rem, 1.7vw, 1.35rem)', lineHeight: 1.72, fontWeight: 600, margin: '0 0 1.5rem' };
const bodyText: CSSProperties = { color: 'rgba(255,255,255,0.62)', fontSize: '1rem', lineHeight: 1.78, margin: 0 };
const wrapWide: CSSProperties = { maxWidth: '1320px', margin: '0 auto' };
const marketSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 4vw, 4rem)', borderTop: '1px solid rgba(255,255,255,0.06)' };
const marketGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1rem' };
const marketCard: CSSProperties = { minHeight: '520px', position: 'relative', overflow: 'hidden', textDecoration: 'none', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', background: '#050505' };
const marketImage: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.82, filter: 'brightness(0.9) contrast(1.04)' };
const marketOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.34) 38%, rgba(0,0,0,0.94) 84%, rgba(0,0,0,0.98) 100%)' };
const marketContent: CSSProperties = { position: 'absolute', inset: 0, padding: '1.45rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' };
const marketTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.45rem, 2vw, 1.95rem)', lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase', fontWeight: 700 };
const marketLine: CSSProperties = { color: 'rgba(255,255,255,0.78)', fontSize: '0.94rem', lineHeight: 1.55, margin: '0.8rem 0 1rem', maxWidth: '420px' };
const dataRow: CSSProperties = { display: 'grid', gridTemplateColumns: '72px 1fr', gap: '0.65rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', lineHeight: 1.45, marginTop: '0.45rem' };
const dataLabel: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.66rem' };
const explore: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.11em', fontSize: '0.68rem', marginTop: '1.25rem' };
const standardsSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', background: 'rgba(255,241,45,0.025)', borderTop: '1px solid rgba(255,241,45,0.1)', borderBottom: '1px solid rgba(255,255,255,0.06)' };
const standardGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' };
const standardCard: CSSProperties = { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.09)', padding: '1.6rem' };
const standardTitle: CSSProperties = { fontFamily: displayFont, color: '#fff', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.03em', margin: '0 0 0.75rem' };
const standardText: CSSProperties = { ...bodyText, fontSize: '0.94rem' };
const pathSection: CSSProperties = { ...section, borderBottom: '1px solid rgba(255,255,255,0.06)' };
const pathGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.08)', marginTop: '2.5rem', border: '1px solid rgba(255,255,255,0.08)' };
const pathCard: CSSProperties = { background: '#050505', padding: '1.5rem', minHeight: '210px' };
const pathNumber: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em' };
const pathTitle: CSSProperties = { fontFamily: displayFont, textTransform: 'uppercase', fontSize: '1.05rem', margin: '1.2rem 0 0.65rem' };
const pathText: CSSProperties = { ...bodyText, fontSize: '0.9rem' };
const conversionSection: CSSProperties = { ...section, background: 'rgba(255,255,255,0.018)' };
const conversionGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' };
const conversionCard: CSSProperties = { border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' };
const conversionTitle: CSSProperties = { fontFamily: displayFont, textTransform: 'uppercase', fontSize: '1.35rem', margin: 0 };
const conversionText: CSSProperties = { ...bodyText, margin: '1rem 0 1.5rem', flex: 1 };
const faqSection: CSSProperties = { ...section, borderTop: '1px solid rgba(255,255,255,0.06)' };
const faqCard: CSSProperties = { border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.02)', padding: '1.5rem' };
const faqQuestion: CSSProperties = { fontFamily: displayFont, fontSize: '1.05rem', lineHeight: 1.3, margin: '0 0 0.65rem', color: '#fff' };
const faqAnswer: CSSProperties = { ...bodyText, fontSize: '0.96rem' };
const cta: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderTop: '1px solid rgba(255,241,45,0.2)', background: 'radial-gradient(circle at 50% 0%, rgba(255,241,45,0.18), transparent 36%)' };
const yellowButton: CSSProperties = { display: 'inline-block', background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.78rem', padding: '1rem 1.25rem', textTransform: 'uppercase' };
const darkButton: CSSProperties = { display: 'inline-block', background: 'rgba(0,0,0,0.55)', color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.78rem', padding: '1rem 1.25rem', border: '1px solid rgba(255,241,45,0.4)', textTransform: 'uppercase' };
