import { PageHeader } from '@/components/PageHeader';
import styles from './IndustriesLanding.module.css';
import Link from '@/components/LocalizedLink';
import type { CSSProperties } from 'react';
import { VIDEO_HERO_TREATMENT } from '@/lib/hero-media';
import { industryText } from '@/lib/industries-i18n';
import { languageAlternates, type PageLang } from '@/lib/localized-routes';

const BASE_URL = 'https://elimfilters.com';

const INDUSTRIES = [
  { slug: 'mining', label: 'Mining', image: '/images/mineria-1.avif', summary: 'Mining filtration for equipment operating under abrasive dust, heavy hydraulic load, and severe production cycles.' },
  { slug: 'agriculture', label: 'Agriculture', image: '/images/agricultor-1.avif', summary: 'Agricultural equipment filtration for harvest dust, variable fuel quality, long service windows, and seasonal uptime.' },
  { slug: 'construction', label: 'Construction', image: '/images/chino-construction.avif', summary: 'Construction equipment filtration for dusty jobsites, hydraulic stress, idle time, and high-cost downtime.' },
  { slug: 'oil-gas', label: 'Oil & Gas', image: '/images/ingpetrolero.avif', summary: 'Oil and gas filtration for remote assets exposed to bulk-fuel contamination, fluid cleanliness demands, and harsh duty cycles.' },
  { slug: 'marine', label: 'Marine', image: '/images/ingmarine.avif', summary: 'Marine filtration for propulsion and auxiliary equipment exposed to moisture, fuel contamination, and corrosion-prone environments.' },
  { slug: 'power-generation', label: 'Power Generation', image: '/images/generatorsupervisor.avif', summary: 'Power-generation filtration for standby readiness, fuel stability, lubrication protection, and emergency uptime.' },
  { slug: 'trucks-fleets', label: 'Commercial Truck Fleets', image: '/images/transport.avif', summary: 'Commercial fleet filtration for route uptime, fuel economy, service discipline, and lifecycle cost control.' },
  { slug: 'manufacturing', label: 'Manufacturing', image: '/images/manufactura.avif', summary: 'Industrial filtration for plant continuity, compressed-air quality, hydraulic control, and process reliability.' },
  { slug: 'railway', label: 'Railway', image: '/images/ing-railway.avif', summary: 'Railway filtration for long operating cycles, diesel reliability, vibration exposure, and maintenance planning.' },
  { slug: 'waste-municipal', label: 'Waste & Municipal Fleets', image: '/images/wasted-municipal.avif', summary: 'Municipal fleet filtration for stop-start operation, dust ingestion, hydraulic load, and public-service uptime.' },
  { slug: 'bus-coach', label: 'Bus & Coach', image: '/images/bus-hero.avif', summary: 'Bus and coach filtration for passenger uptime, cabin-air quality, engine protection, and predictable route service.' },
  { slug: 'automotive', label: 'Automotive & Light Duty', image: '/images/Automotive-1.avif', summary: 'Light-duty filtration for service reliability, contamination control, and high-volume application coverage.' },
] as const;


const INDUSTRY_RISKS: Record<(typeof INDUSTRIES)[number]['slug'], string> = {
  mining: 'Abrasive dust · hydraulic cleanliness',
  agriculture: 'Harvest dust · seasonal duty',
  construction: 'Dust loading · hydraulic demand',
  'oil-gas': 'Bulk-fuel quality · remote service',
  marine: 'Fuel water · humid environments',
  'power-generation': 'Stored fuel · standby readiness',
  'trucks-fleets': 'Diesel cleanliness · route availability',
  manufacturing: 'Fluid cleanliness · plant continuity',
  railway: 'Vibration · extended service cycles',
  'waste-municipal': 'Stop-start duty · hydraulic load',
  'bus-coach': 'Cabin air · scheduled operations',
  automotive: 'OEM fit · service reliability',
};

const FIELD_CASES = [
  {
    slug: 'mining', label: 'Mining',
    exposure: 'Abrasive dust and suspended hydraulic particles',
    check: 'Air-intake restriction and fluid cleanliness against the equipment target',
    consequence: 'Premature wear of intake and hydraulic components',
  },
  {
    slug: 'trucks-fleets', label: 'Commercial Truck Fleets',
    exposure: 'Water and particulate contamination in diesel fuel',
    check: 'Fuel-system stages, separator drainage history and restriction symptoms',
    consequence: 'Fuel-system faults and unplanned vehicle downtime',
  },
  {
    slug: 'power-generation', label: 'Power Generation',
    exposure: 'Contamination during fuel storage and intermittent operation',
    check: 'Tank condition, fuel sampling records and readiness for starting',
    consequence: 'Failure to start or loss of availability when needed',
  },
  {
    slug: 'manufacturing', label: 'Manufacturing',
    exposure: 'Hydraulic particles and moisture in compressed-air systems',
    check: 'Fluid cleanliness per component requirements and air-treatment condition',
    consequence: 'Control faults, component wear and process interruption',
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

export const industriesMetadata = {
  title: 'Industrial Filtration by Industry | ELIMFILTERS',
  description: 'Industrial filtration and contamination-control strategies for mining, agriculture, construction, oil & gas, marine, power generation, commercial fleets, manufacturing, railway, municipal fleets, bus & coach, and automotive applications.',
  alternates: { canonical: `${BASE_URL}/industries/`, languages: languageAlternates('/industries') },
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

export function IndustriesLanding({ lang = 'en' }: { lang?: PageLang }) {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/industries/#page`,
        url: `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/industries/`,
        name: lang === 'es' ? 'Filtración industrial por industria' : lang === 'pt' ? 'Filtração industrial por setor' : 'Industrial Filtration by Industry',
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
        name: lang === 'es' ? 'Mercados industriales ELIMFILTERS' : lang === 'pt' ? 'Mercados industriais ELIMFILTERS' : 'ELIMFILTERS Industrial Markets',
        numberOfItems: INDUSTRIES.length,
        itemListElement: INDUSTRIES.map((industry, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'WebPage',
            name: industryText(lang, industry.label),
            description: industryText(lang, industry.summary),
            url: `${BASE_URL}${lang === 'en' ? '' : `/${lang}`}/industries/${industry.slug}/`,
          },
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${BASE_URL}/industries/#faq`,
        mainEntity: FAQS.map((item) => ({
          '@type': 'Question',
          name: industryText(lang, item.q),
          acceptedAnswer: { '@type': 'Answer', text: industryText(lang, item.a) },
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
          <h1 style={heroTitle}>{industryText(lang, "Industrial Filtration")}<br /><span style={{ color: '#FFF12D' }}>{industryText(lang, "By Industry")}</span></h1>
          <p style={heroPromise}>{industryText(lang, "Selection starts with the machine and its operating conditions.")}</p>
          <p style={heroLead}>{industryText(lang, "Dust, water, heat and service conditions create different failure risks. Explore the industry, identify the exposed systems and verify the OEM requirements before selecting a filter.")}</p>
          <div style={heroActions}>
            <Link href="/contact/" style={yellowButton}>{industryText(lang, "PROTECT MY EQUIPMENT")}</Link>
            <a href="https://part-search.elimfilters.com/" style={darkButton}>{industryText(lang, "FIND MY FILTER")}</a>
          </div>
        </div>
      </section>

      <section style={answerSection} aria-labelledby="industry-context-title">
        <div className={styles.introGrid}>
          <div>
            <p style={eyebrow}>{industryText(lang, "OPERATING CONTEXT")}</p>
            <h2 id="industry-context-title" style={sectionTitle}>{industryText(lang, "Different duty cycles. Different failure exposure.")}</h2>
          </div>
          <div>
            <p style={leadText}>{industryText(lang, "A mining loader, a marine engine, a standby generator, and a city waste truck may share filter categories, but they do not share the same operating reality.")}</p>
            <p style={bodyText}>{industryText(lang, "Before comparing elements, document the equipment and engine, service interval, contaminant source, current filter reference and consequence of a shutdown. Industry is the starting context, not proof of fit.")}</p>
          </div>
        </div>
      </section>

      <section style={marketSection} aria-labelledby="markets-title">
        <div style={wrapWide}>
          <div style={{ maxWidth: '1320px', margin: '0 auto 2.4rem' }}><p style={eyebrow}>{industryText(lang, "12 OPERATING MARKETS")}</p><h2 id="markets-title" style={sectionTitle}>{industryText(lang, "Select the industry. Understand the risk. Protect the asset.")}</h2></div>
          <div className={styles.marketGrid}>
            {INDUSTRIES.map((industry) => (
              <Link key={industry.slug} href={lang === 'en' ? `/industries/${industry.slug}/` : `/${lang}/industries/${industry.slug}/`} style={marketCard} className={styles.marketCard} aria-label={lang === 'es' ? `Explorar filtración y protección de activos: ${industryText(lang, industry.label)}` : lang === 'pt' ? `Explorar filtração e proteção de ativos: ${industryText(lang, industry.label)}` : `Explore ${industry.label} filtration and asset protection`}>
                <img src={industry.image} alt={`${industryText(lang, industry.label)} ${lang === 'es' ? 'equipo industrial' : lang === 'pt' ? 'equipamento industrial' : 'industrial equipment'}`} style={marketImage} loading="lazy" />
                <div style={marketOverlay} />
                <div style={marketContent}><h3 style={marketTitle}>{industryText(lang, industry.label)}</h3><p className={styles.marketRisk}>{industryText(lang, INDUSTRY_RISKS[industry.slug])}</p><span style={explore}>{industryText(lang, "EXPLORE INDUSTRY →")}</span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={riskCasesSection} aria-labelledby="field-cases-title">
        <div className={styles.sectionShell}>
          <p style={eyebrow}>{industryText(lang, "FIELD DECISION EXAMPLES")}</p>
          <h2 id="field-cases-title" style={{ ...sectionTitle, maxWidth: '950px' }}>{industryText(lang, "What should maintenance and risk teams verify?")}</h2>
          <p style={{ ...bodyText, maxWidth: '900px', marginTop: '1.25rem' }}>{industryText(lang, "Illustrative checkpoints, not universal specifications. Confirm targets and service limits with the equipment manufacturer and application data.")}</p>
          <div className={styles.caseGrid}>
            {FIELD_CASES.map((item) => (
              <article key={item.slug} className={styles.caseCard}>
                <div className={styles.caseTop}>
                  <h3 className={styles.caseTitle}>{industryText(lang, item.label)}</h3>
                  <Link className={styles.caseLink} href={lang === 'en' ? `/industries/${item.slug}/` : `/${lang}/industries/${item.slug}/`}>{industryText(lang, "EXPLORE INDUSTRY →")}</Link>
                </div>
                <dl className={styles.caseFacts}>
                  <div><dt>{industryText(lang, "Exposure")}</dt><dd>{industryText(lang, item.exposure)}</dd></div>
                  <div><dt>{industryText(lang, "Field check")}</dt><dd>{industryText(lang, item.check)}</dd></div>
                  <div><dt>{industryText(lang, "Operational consequence")}</dt><dd>{industryText(lang, item.consequence)}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={standardsSection}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <p style={eyebrow}>{industryText(lang, "ENGINEERING DECISION FACTORS")}</p>
          <h2 style={{ ...sectionTitle, marginBottom: '1.5rem', maxWidth: '980px' }}>{industryText(lang, "What actually changes the filtration decision?")}</h2>
          <p style={{ ...bodyText, maxWidth: '860px', marginBottom: '2rem' }}>{industryText(lang, "A cross-reference alone does not validate flow, restriction, sealing, bypass settings or service life. Use the following checks to define the requirement before approving a replacement.")}</p>
          <div style={standardGrid}>
            <div style={standardCard}><span style={factorNumber}>01</span><h3 style={standardTitle}>{industryText(lang, "Contamination Load")}</h3><p style={standardText}>{industryText(lang, "Particle size, concentration, water content, debris source, and ingestion rate determine what the filtration system must remove and how quickly its capacity can be consumed.")}</p></div>
            <div style={standardCard}><span style={factorNumber}>02</span><h3 style={standardTitle}>{industryText(lang, "Duty Cycle & Environment")}</h3><p style={standardText}>{industryText(lang, "Load, idle time, temperature, vibration, humidity, dust exposure, and operating hours change restriction growth, fluid condition, and the rate at which contamination reaches critical components.")}</p></div>
            <div style={standardCard}><span style={factorNumber}>03</span><h3 style={standardTitle}>{industryText(lang, "System Sensitivity")}</h3><p style={standardText}>{industryText(lang, "Injector clearances, hydraulic control surfaces, bearing films, pumps, and other precision interfaces determine how much contamination the protected system can tolerate before wear or performance loss accelerates.")}</p></div>
            <div style={standardCard}><span style={factorNumber}>04</span><h3 style={standardTitle}>{industryText(lang, "Maintenance Reality")}</h3><p style={standardText}>{industryText(lang, "Service interval, access, inventory discipline, technician practices, and replacement consistency determine whether a technically correct filtration strategy remains effective in real operation.")}</p></div>
          </div>
          <div style={engineeringPrinciple}><p style={engineeringPrincipleLabel}>{industryText(lang, "ENGINEERING PRINCIPLE")}</p><p style={engineeringPrincipleText}>{industryText(lang, "The correct filter is not selected by industry name alone. Industry establishes context; final selection must resolve the asset, protected system, contamination mechanism, duty cycle, service constraints, and validated performance requirement.")}</p></div>
        </div>
      </section>

      <section style={impactSection} aria-labelledby="impact-title">
        <div style={impactGrid}>
          <div>
            <p style={eyebrow}>{industryText(lang, "MAINTENANCE AND RISK CONTROL")}</p>
            <h2 id="impact-title" style={impactTitle}>{industryText(lang, "Track the condition. Document the decision.")}</h2>
          </div>
          <div>
            <p style={impactLead}>{industryText(lang, "Filter selection is only one control. Maintenance teams also need operating evidence to distinguish contamination from installation, component or service problems.")}</p>
            <div style={impactOutcomes}>
              <div style={impactOutcome}><span style={impactOutcomeLabel}>{industryText(lang, "Intake and fluid condition")}</span><p style={impactOutcomeText}>{industryText(lang, "Monitor air-filter restriction and, where required, fluid cleanliness against an application-specific target.")}</p></div>
              <div style={impactOutcome}><span style={impactOutcomeLabel}>{industryText(lang, "Fuel and recurring symptoms")}</span><p style={impactOutcomeText}>{industryText(lang, "Record water in separators, abnormal restriction and recurring contamination after service.")}</p></div>
              <div style={impactOutcome}><span style={impactOutcomeLabel}>{industryText(lang, "Asset availability")}</span><p style={impactOutcomeText}>{industryText(lang, "Connect inspections and interventions to operating hours, failure modes and the cost of an unexpected stop.")}</p></div>
            </div>
            <p style={{ ...bodyText, marginTop: '1.5rem' }}>{industryText(lang, 'For engineering-level detail on dust exposure, contamination mechanisms, and system-level technical guidance by industry, see the ')}<Link href="/knowledge-center/industries/" style={{ color: '#FFF12D', textDecoration: 'underline', textUnderlineOffset: '0.2em' }}>{industryText(lang, "Knowledge Center Industries reference")}</Link>.</p>
          </div>
        </div>
      </section>

      <section style={pathSection}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <p style={eyebrow}>{industryText(lang, "FROM OPERATING ENVIRONMENT TO PRODUCT")}</p>
          <h2 style={{ ...sectionTitle, maxWidth: '900px' }}>{industryText(lang, "Translate industry risk into the correct protection architecture.")}</h2>
          <div style={pathGrid} className={styles.pathGrid}>
            {[
              ['01', 'Industry', 'Establish the operating environment, equipment type, and duty cycle.'],
              ['02', 'Contamination Risk', 'Identify particles, water, thermal stress, bypass risk, or other failure mechanisms.'],
              ['03', 'Protection System', 'Connect the risk to air, fuel, lubrication, hydraulic, coolant, cabin, or compressed-air protection.'],
              ['04', 'Technology', 'Apply the ELIMFILTERS technology architecture engineered for that system.'],
              ['05', 'Product', 'Resolve the final part, OEM reference, dimensions, and application fit.'],
            ].map(([num, title, desc]) => (
              <div key={num} style={pathCard}><span style={pathNumber}>{num}</span><h3 style={pathTitle}>{industryText(lang, title)}</h3><p style={pathText}>{industryText(lang, desc)}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section style={conversionSection} aria-labelledby="conversion-title">
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <p style={eyebrow}>{industryText(lang, "CHOOSE YOUR NEXT STEP")}</p>
          <h2 id="conversion-title" style={{ ...sectionTitle, marginBottom: '2.25rem' }}>{industryText(lang, "What do you need to do?")}</h2>
          <div style={conversionGrid}>
            <div style={conversionCard}><h3 style={conversionTitle}>{industryText(lang, "Protect Equipment")}</h3><p style={conversionText}>{industryText(lang, "Tell us the equipment, engine, operating environment, or contamination problem. We will route the request to the correct protection path.")}</p><Link href="/contact/" style={yellowButton}>{industryText(lang, "PROTECT MY EQUIPMENT")}</Link></div>
            <div style={conversionCard}><h3 style={conversionTitle}>{industryText(lang, "Find a Part")}</h3><p style={conversionText}>{industryText(lang, "Already know the OEM reference or filter number? Go directly to cross-reference and application search.")}</p><a href="https://part-search.elimfilters.com/" style={yellowButton}>{industryText(lang, "FIND MY FILTER")}</a></div>
            <div style={conversionCard}><h3 style={conversionTitle}>{industryText(lang, "Represent ELIMFILTERS")}</h3><p style={conversionText}>{industryText(lang, "Tell us the industries, territory, and customer base your company serves so we can evaluate distributor fit.")}</p><Link href="/distributor-application/" style={yellowButton}>{industryText(lang, "BECOME A DISTRIBUTOR")}</Link></div>
          </div>
        </div>
      </section>

      <section style={faqSection} aria-labelledby="faq-title">
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <p style={eyebrow}>{industryText(lang, "INDUSTRY FILTRATION QUESTIONS")}</p>
          <h2 id="faq-title" style={{ ...sectionTitle, marginBottom: '2rem' }}>{industryText(lang, "Common questions about filtration by industry")}</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>{FAQS.map((item) => <article key={item.q} style={faqCard}><h3 style={faqQuestion}>{industryText(lang, item.q)}</h3><p style={faqAnswer}>{industryText(lang, item.a)}</p></article>)}</div>
        </div>
      </section>

      <section style={cta}>
        <div style={{ maxWidth: '980px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ ...sectionTitle, textAlign: 'center', maxWidth: '880px', marginLeft: 'auto', marginRight: 'auto' }}>{industryText(lang, "From operating conditions to a verified application.")}</h2>
          <p style={{ ...bodyText, maxWidth: '720px', margin: '1.4rem auto 0', textAlign: 'center' }}>{industryText(lang, "Have an OEM reference? Use Part Search. Need technical review? Share the equipment, duty cycle, contamination symptoms and maintenance history.")}</p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.9rem', marginTop: '2rem' }}><Link href="/systems/" style={yellowButton}>{industryText(lang, "PROTECTION SYSTEMS")}</Link><Link href="/technologies/" style={darkButton}>{industryText(lang, "TECHNOLOGIES")}</Link><a href="https://part-search.elimfilters.com/" style={darkButton}>{industryText(lang, "PART SEARCH")}</a></div>
        </div>
      </section>
    </main>
  );
}

const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';
const main: CSSProperties = { background: '#000', color: '#fff', minHeight: '100vh', fontFamily: bodyFont };
const hero: CSSProperties = { minHeight: '88vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: 'clamp(6rem, 10vw, 9rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const heroImage: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: VIDEO_HERO_TREATMENT.opacity };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: VIDEO_HERO_TREATMENT.overlayBackground };
const heroInner: CSSProperties = { maxWidth: '1320px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-0.055em', lineHeight: 0.9, fontSize: 'clamp(3.1rem, 7.2vw, 6.8rem)', maxWidth: '1050px', margin: 0, textTransform: 'uppercase' };
const heroPromise: CSSProperties = { margin: '1.45rem 0 0', maxWidth: '760px', color: '#fff', fontFamily: displayFont, fontSize: 'clamp(1.05rem, 1.8vw, 1.35rem)', lineHeight: 1.35, fontWeight: 700, letterSpacing: '-0.01em' };
const heroLead: CSSProperties = { marginTop: '0.9rem', maxWidth: '820px', color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(1rem, 1.7vw, 1.18rem)', lineHeight: 1.68, fontWeight: 500 };
const heroActions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginTop: '2rem' };
const eyebrow: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '0.72rem', lineHeight: 1, letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 1rem' };
const section: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)' };
const answerSection: CSSProperties = { ...section, borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.015)' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(2rem, 4vw, 3.6rem)', lineHeight: 1.05, letterSpacing: '-0.035em', margin: 0, textTransform: 'none', fontWeight: 700, textWrap: 'balance' };
const leadText: CSSProperties = { color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(1.08rem, 1.7vw, 1.35rem)', lineHeight: 1.72, fontWeight: 600, margin: '0 0 1.5rem' };
const bodyText: CSSProperties = { color: 'rgba(255,255,255,0.62)', fontSize: '1rem', lineHeight: 1.78, margin: 0 };
const wrapWide: CSSProperties = { maxWidth: '1320px', margin: '0 auto' };
const marketSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 4vw, 4rem)', borderTop: '1px solid rgba(255,255,255,0.06)' };
const marketCard: CSSProperties = { position: 'relative', overflow: 'hidden', textDecoration: 'none', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', background: '#050505' };
const marketImage: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.94, filter: 'brightness(0.96) contrast(1.03)' };
const marketOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.08) 48%, rgba(0,0,0,0.72) 100%)' };
const marketContent: CSSProperties = { position: 'absolute', inset: 0, padding: '1.45rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' };
const marketTitle: CSSProperties = { fontFamily: displayFont, fontSize: 'clamp(1.45rem, 2vw, 1.95rem)', lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0, textTransform: 'uppercase', fontWeight: 700, textShadow: '0 2px 18px rgba(0,0,0,0.8)' };
const explore: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.11em', fontSize: '0.68rem', marginTop: '0.8rem' };
const riskCasesSection: CSSProperties = { padding: 'clamp(4rem, 7vw, 6rem) clamp(1.25rem, 4vw, 4rem)', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.015)' };
const standardsSection: CSSProperties = { padding: 'clamp(4rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', background: 'rgba(255,241,45,0.025)', borderTop: '1px solid rgba(255,241,45,0.1)', borderBottom: '1px solid rgba(255,255,255,0.06)' };
const standardGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' };
const standardCard: CSSProperties = { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.09)', padding: '1.7rem', minHeight: '250px' };
const factorNumber: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em' };
const standardTitle: CSSProperties = { fontFamily: displayFont, color: '#fff', fontSize: '1.08rem', textTransform: 'uppercase', letterSpacing: '0.03em', margin: '1rem 0 0.75rem' };
const standardText: CSSProperties = { ...bodyText, fontSize: '0.94rem' };
const engineeringPrinciple: CSSProperties = { marginTop: '1.5rem', padding: '2rem 2.2rem', borderLeft: '4px solid #FFF12D', background: 'linear-gradient(90deg, rgba(255,241,45,0.08) 0%, rgba(255,241,45,0.03) 28%, rgba(255,255,255,0.02) 100%)', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' };
const engineeringPrincipleLabel: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '0.78rem', lineHeight: 1, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', margin: 0 };
const engineeringPrincipleText: CSSProperties = { fontFamily: bodyFont, color: 'rgba(255,255,255,0.9)', fontSize: 'clamp(1.18rem, 1.9vw, 1.55rem)', lineHeight: 1.65, letterSpacing: '-0.01em', textAlign: 'left', margin: 0, maxWidth: '100%' };
const impactSection: CSSProperties = { padding: 'clamp(4.5rem, 9vw, 8rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(135deg, rgba(255,241,45,0.08), rgba(255,255,255,0.015) 52%, rgba(0,0,0,0) 100%)' };
const impactGrid: CSSProperties = { maxWidth: '1320px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: 'clamp(2.5rem, 5vw, 5rem)', alignItems: 'start' };
const impactTitle: CSSProperties = { ...sectionTitle, fontSize: 'clamp(2.1rem, 4vw, 3.8rem)', maxWidth: '700px' };
const impactLead: CSSProperties = { ...leadText, fontSize: 'clamp(1.15rem, 1.8vw, 1.45rem)' };
const impactOutcomes: CSSProperties = { display: 'grid', gap: '0', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.12)' };
const impactOutcome: CSSProperties = { padding: '1.2rem 0', borderBottom: '1px solid rgba(255,255,255,0.12)', display: 'grid', gridTemplateColumns: 'minmax(0, 0.42fr) minmax(0, 1fr)', gap: '1rem' };
const impactOutcomeLabel: CSSProperties = { fontFamily: displayFont, color: '#FFF12D', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em' };
const impactOutcomeText: CSSProperties = { ...bodyText, color: 'rgba(255,255,255,0.78)', fontSize: '0.94rem' };
const pathSection: CSSProperties = { ...section, borderBottom: '1px solid rgba(255,255,255,0.06)' };
const pathGrid: CSSProperties = { background: 'rgba(255,255,255,0.08)', marginTop: '2.5rem', border: '1px solid rgba(255,255,255,0.08)' };
const pathCard: CSSProperties = { background: '#050505', padding: '1.5rem', minHeight: '210px', minWidth: 0 };
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
