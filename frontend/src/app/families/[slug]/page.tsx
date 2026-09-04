import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PRODUCT_FAMILY_LIST, getFamilyBySlug } from '@/lib/product-families-data';
import { getProtectionSystemBySlug } from '@/lib/protection-systems-data';
import { getTechnologyEngineering } from '@/lib/canonical-engineering';
import { FAILURE_KNOWLEDGE } from '@/lib/failure-knowledge';

const BASE_URL = 'https://elimfilters.com';
const displayFont = 'var(--font-display)';
const bodyFont = 'var(--font-body)';

interface Props {
  params: Promise<{ slug: string }>;
}

const PROTECTED_COMPONENTS: Record<string, readonly string[]> = {
  macrocore: ['Cylinders', 'Piston rings', 'Turbochargers', 'Combustion air path'],
  microkappa: ['Operator environment', 'HVAC airflow path', 'Cabin air quality'],
  intekcore: ['Element-to-housing seal', 'Intake boundary', 'Airflow path', 'Filter retention interface'],
  drycore: ['Pneumatic valves', 'Actuators', 'Brake air circuit', 'Compressed-air controls'],
  syntapore: ['High-pressure fuel pump', 'Injectors', 'Fuel metering components', 'Injection circuit'],
  hydrocore: ['Fuel transfer path', 'Water-sensitive fuel components', 'Injection-system feed'],
  turbocore: ['FH/FG turbine housing', 'Dedicated separator element', 'Bowl and drain assembly', 'Downstream fuel-system feed'],
  syntrax: ['Bearings', 'Journals', 'Lubricated interfaces', 'Engine oil circuit'],
  nanoforce: ['Hydraulic pumps', 'Control valves', 'Actuators', 'Servo controls'],
  thermacore: ['Coolant passages', 'Seals', 'Wet liners', 'Heat-transfer surfaces'],
};

const FIELD_QUESTIONS: Record<string, readonly string[]> = {
  'primary-air': ['What is the ambient dust load?', 'What restriction limit applies to the intake?', 'How is sealing verified after service?', 'What duty cycle determines inspection frequency?'],
  'secondary-air': ['Is the safety element intended as a final barrier rather than a routine dust-loading element?', 'Is the primary element serviced without contaminating the clean side?', 'Is element seating verified before restart?', 'Has the housing been inspected for bypass paths?'],
  'air-cleaner-housings': ['Is the housing correctly sized for required airflow?', 'Are inlet routing and restriction acceptable?', 'Does the element seat uniformly against the seal?', 'Are clamps, covers and interfaces structurally intact?'],
  'primary-fuel': ['What contamination enters from storage and transfer?', 'What flow and pressure-drop limits apply?', 'Is water also present in the fuel supply?', 'What downstream filtration stage must be protected?'],
  'secondary-fuel': ['What cleanliness level is required upstream of the injection circuit?', 'What flow and pressure-drop limits apply at final filtration?', 'Is upstream water separation effective?', 'Are service practices preventing clean-side contamination?'],
  'fuel-water-separators': ['Is contamination free water, emulsified water, particulate, or a combination?', 'What fuel flow must the separator support?', 'How is collected water inspected and drained?', 'Is installation orientation and service access correct?'],
  'fuel-turbine': ['Which approved FH or FG housing is installed?', 'Which dedicated 2010, 2020 or 2040-series replacement configuration applies?', 'What fuel flow, port arrangement and service condition must the turbine system support?', 'Are bowl, drain, seals and element orientation verified for the approved housing?'],
  'oil-filters': ['What engine duty and oil condition define the service interval?', 'What viscosity range and flow must be supported?', 'What contaminant loading is expected?', 'Are bypass and anti-drainback functions appropriate to the application?'],
  'hydraulic-filters': ['Which component has the tightest clearance?', 'What cleanliness target applies to the circuit?', 'What are system flow, pressure and temperature?', 'What collapse strength and duty cycle are required?'],
  'coolant-filters': ['What coolant chemistry is approved for the engine?', 'What contamination or corrosion products are present?', 'What flow and capacity are required?', 'How does the filter fit the cooling-system maintenance strategy?'],
  'cabin-filters': ['What contaminants are present in the operator environment?', 'What HVAC airflow and pressure-drop limits apply?', 'Is particulate-only or adsorption media required?', 'How often does the operating environment justify inspection?'],
  'air-dryer-filters': ['What is the compressor duty cycle?', 'What ambient moisture exposure is expected?', 'Is purge behavior operating correctly?', 'What replacement interval matches the pneumatic duty?'],
};

const SERVICE_DISCIPLINE: Record<string, readonly string[]> = {
  macrocore: ['Inspect the complete intake boundary, not only the element.', 'Keep the clean side protected during element removal.', 'Verify element seating and seal contact before returning the asset to service.'],
  microkappa: ['Inspect airflow performance together with media condition.', 'Use the media configuration required by the operating environment.', 'Avoid introducing debris into the HVAC clean side during replacement.'],
  intekcore: ['Inspect housing geometry, covers, clamps and seal lands.', 'Correct any bypass path before installing a new element.', 'Confirm inlet routing and element retention after service.'],
  drycore: ['Treat moisture control as a pneumatic-system reliability function.', 'Confirm purge behavior and compressor duty when service life appears abnormal.', 'Inspect downstream evidence of moisture rather than replacing the element in isolation.'],
  syntapore: ['Protect the clean side of the fuel circuit during service.', 'Investigate storage or transfer contamination when filters load abnormally fast.', 'Verify the complete staged-filtration path rather than treating one element as the whole system.'],
  hydrocore: ['Drain collected water according to operating conditions.', 'Inspect seals, bowl condition and installation orientation.', 'Investigate the upstream fuel source when water loading becomes recurrent.'],
  turbocore: ['Service the FH/FG housing and dedicated element as one approved turbine-specific architecture.', 'Verify bowl, drain, seals, element orientation and flow path before returning the system to service.', 'Do not substitute standard non-turbine separator elements solely by dimensions or appearance.'],
  syntrax: ['Evaluate filter condition together with lubricant condition and engine duty.', 'Prevent contamination from entering during filter and oil service.', 'Investigate abnormal debris loading as a possible indicator of component wear.'],
  nanoforce: ['Set the filtration target from the most contamination-sensitive component.', 'Control contamination introduced during hose, cylinder and reservoir service.', 'Investigate abnormal differential pressure or debris loading before simply shortening intervals.'],
  thermacore: ['Keep filter selection aligned with approved coolant chemistry.', 'Inspect coolant condition and contamination sources when loading is abnormal.', 'Treat filtration as part of the complete cooling-system maintenance strategy.'],
};

export function generateStaticParams() {
  return PRODUCT_FAMILY_LIST.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fam = getFamilyBySlug(slug);
  if (!fam) return { title: 'Not Found' };

  const url = `${BASE_URL}/families/${fam.slug}/`;
  const title = `${fam.name} | Critical Asset Protection | ELIMFILTERS`;

  return {
    title,
    description: fam.purpose,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: fam.purpose,
      url,
      type: 'website',
      siteName: 'ELIMFILTERS',
      images: [{ url: fam.heroImage, alt: `${fam.name} asset protection` }],
    },
    twitter: { card: 'summary_large_image', title, description: fam.purpose, images: [fam.heroImage] },
  };
}

function standardHref(std: string) {
  const key = std.toLowerCase();
  if (key.includes('iso 16889')) return '/knowledge-center/standards/iso-16889/';
  if (key.includes('iso 4406')) return '/knowledge-center/standards/iso-4406/';
  if (key.includes('iso 5011')) return '/knowledge-center/standards/iso-5011/';
  if (key.includes('iso 16332')) return '/knowledge-center/standards/iso-16332/';
  if (key.includes('astm d6304')) return '/knowledge-center/standards/astm-d6304/';
  if (key.includes('iso 12937')) return '/knowledge-center/standards/iso-12937/';
  if (key.includes('nfpa t2.14')) return '/knowledge-center/standards/nfpa-t2-14/';
  if (key.includes('din 51524')) return '/knowledge-center/standards/din-51524/';
  if (key.includes('iso 11155-1')) return '/knowledge-center/standards/iso-11155-1/';
  if (key.includes('iso 8573-1')) return '/knowledge-center/standards/iso-8573-1/';
  return '/knowledge-center/standards/';
}

function industryLabel(value: string) {
  return value
    .replace('trucks-fleets', 'Truck Fleets')
    .replace('oil-gas', 'Oil & Gas')
    .replace('bus-coach', 'Bus & Coach')
    .replace('power-generation', 'Power Generation')
    .replace('waste-municipal', 'Waste & Municipal')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function FamilyPage({ params }: Props) {
  const { slug } = await params;
  const fam = getFamilyBySlug(slug);
  if (!fam) notFound();

  const system = getProtectionSystemBySlug(fam.protectionSystem);
  const technology = getTechnologyEngineering(fam.primaryTechnology);
  const failures = Object.values(FAILURE_KNOWLEDGE).filter((failure) => failure.families.includes(fam.slug));
  const components = PROTECTED_COMPONENTS[fam.primaryTechnology] ?? [];
  const fieldQuestions = FIELD_QUESTIONS[fam.slug] ?? [];
  const serviceDiscipline = SERVICE_DISCIPLINE[fam.primaryTechnology] ?? [];
  const familyUrl = `${BASE_URL}/families/${fam.slug}/`;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Families', item: `${BASE_URL}/families/` },
      { '@type': 'ListItem', position: 3, name: fam.name, item: familyUrl },
    ],
  };

  const productGroupSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProductGroup',
    '@id': `${familyUrl}#productgroup`,
    name: fam.name,
    description: fam.purpose,
    url: familyUrl,
    brand: { '@type': 'Brand', '@id': `${BASE_URL}/#brand`, name: 'ELIMFILTERS' },
    manufacturer: { '@type': 'Organization', '@id': `${BASE_URL}/#organization`, name: 'ELIMFILTERS' },
    category: 'Industrial Filtration',
    variesBy: ['Duty Class'],
  };

  return (
    <main style={main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productGroupSchema) }} />

      <Link href="/families/" style={backButton}>FAMILIES</Link>

      <header style={hero}>
        <img src={fam.heroImage} alt={`${fam.name} filtration application`} fetchPriority="high" style={heroImage} />
        <div style={heroOverlay} />
        <div style={heroInner}>
          <span style={eyebrow}>CRITICAL ASSET PROTECTION</span>
          <h1 style={heroTitle}>{fam.name}</h1>
          <p style={heroLead}>{fam.purpose}</p>
          <div style={heroMeta}>
            {system && <Link href={`/systems/${system.slug}/`} style={metaLink}>{system.name}</Link>}
            {technology && <Link href={`/technologies/${fam.primaryTechnology}/`} style={metaLink}>{technology.name}</Link>}
            <span style={metaText}>{fam.dutyClass} DUTY</span>
          </div>
        </div>
      </header>

      <section style={introSection}>
        <div style={introGrid}>
          <div>
            <span style={sectionKicker}>WHY THIS FAMILY EXISTS</span>
            <h2 style={sectionTitle}>Protect the machine before contamination becomes damage.</h2>
          </div>
          <div>
            <p style={leadText}>{fam.engineering}</p>
            {technology && <p style={bodyText}>{technology.engineeringPrinciple}</p>}
          </div>
        </div>
      </section>

      <section style={assetSection}>
        <div style={wrap}>
          <div style={sectionHeadingRow}>
            <div>
              <span style={sectionKicker}>PROTECTED ASSET</span>
              <h2 style={sectionTitleSmall}>What sits behind the filter matters more than the filter itself.</h2>
            </div>
            {technology && <p style={headingNote}>{technology.operationalImpact}</p>}
          </div>

          <div style={componentGrid}>
            {components.map((component) => (
              <div key={component} style={componentCard}>
                <span style={componentName}>{component}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {failures.length > 0 && (
        <section style={riskSection}>
          <div style={wrap}>
            <span style={sectionKicker}>CONTAMINATION RISK</span>
            <h2 style={sectionTitleSmall}>What happens when the protection boundary is lost.</h2>
            <div style={riskGrid}>
              {failures.map((failure) => (
                <article key={failure.key} style={riskCard}>
                  <h3 style={cardTitle}>{failure.name}</h3>
                  <p style={cardBody}>{failure.mechanism}</p>
                  <div style={riskDivider} />
                  <p style={impactText}>{failure.operationalImpact}</p>
                  <Link href={failure.href} style={textLink}>READ CONTAMINATION GUIDANCE</Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={strategySection}>
        <div style={strategyGrid}>
          <div>
            <span style={sectionKicker}>PROTECTION STRATEGY</span>
            <h2 style={sectionTitleSmall}>Selection starts with the operating system, not a part number.</h2>
          </div>
          <div style={strategyStack}>
            {technology && (
              <div style={strategyItem}>
                <span style={strategyLabel}>Control strategy</span>
                <p style={strategyText}>{technology.controlStrategy}</p>
              </div>
            )}
            {system && (
              <div style={strategyItem}>
                <span style={strategyLabel}>System context</span>
                <p style={strategyText}>{system.engineeringPrinciple}</p>
              </div>
            )}
            <div style={strategyItem}>
              <span style={strategyLabel}>Family role</span>
              <p style={strategyText}>{fam.purpose}</p>
            </div>
          </div>
        </div>
      </section>

      {fieldQuestions.length > 0 && (
        <section style={selectionSection}>
          <div style={wrap}>
            <div style={selectionIntro}>
              <span style={sectionKicker}>BEFORE SELECTING A FILTER</span>
              <h2 style={sectionTitleSmall}>Questions the application should answer first.</h2>
              <p style={bodyText}>The correct element is defined by the protected asset, contamination exposure and operating duty. These are the questions that should be resolved before cross-reference or part selection.</p>
            </div>
            <div style={questionGrid}>
              {fieldQuestions.map((question, index) => (
                <div key={question} style={questionCard}>
                  <span style={questionNumber}>{String(index + 1).padStart(2, '0')}</span>
                  <p style={questionText}>{question}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {serviceDiscipline.length > 0 && (
        <section style={serviceSection}>
          <div style={serviceGrid}>
            <div>
              <span style={sectionKicker}>SERVICE DISCIPLINE</span>
              <h2 style={sectionTitleSmall}>A new element cannot correct a contaminated maintenance practice.</h2>
            </div>
            <div style={serviceList}>
              {serviceDiscipline.map((item, index) => (
                <div key={item} style={serviceItem}>
                  <span style={serviceNumber}>{String(index + 1).padStart(2, '0')}</span>
                  <p style={serviceText}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={standardsSection}>
        <div style={wrap}>
          <div style={standardsHeader}>
            <div>
              <span style={sectionKicker}>TECHNICAL CONTEXT</span>
              <h2 style={sectionTitleSmall}>Technology, system and applicable standards.</h2>
            </div>
            <p style={headingNote}>These references define the engineering context for the family. Final product selection still depends on the approved application and operating conditions.</p>
          </div>

          <div style={contextGrid}>
            {technology && (
              <Link href={`/technologies/${fam.primaryTechnology}/`} style={contextCardYellow}>
                <span style={contextLabel}>Technology</span>
                <strong style={contextTitle}>{technology.name}</strong>
                <span style={contextBody}>{technology.definition}</span>
              </Link>
            )}
            {system && (
              <Link href={`/systems/${system.slug}/`} style={contextCard}>
                <span style={contextLabel}>Protection system</span>
                <strong style={contextTitle}>{system.name}</strong>
                <span style={contextBody}>{system.overview}</span>
              </Link>
            )}
          </div>

          <div style={standardsBand}>
            <span style={contextLabel}>Applicable references</span>
            <div style={standardLinks}>
              {fam.applicableStandards.map((std) => (
                <Link key={std} href={standardHref(std)} style={standardLink}>{std}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {system && system.relatedIndustries.length > 0 && (
        <section style={industriesSection}>
          <div style={wrap}>
            <span style={sectionKicker}>OPERATING ENVIRONMENTS</span>
            <h2 style={sectionTitleSmall}>Where this protection system is applied.</h2>
            <div style={industryGrid}>
              {system.relatedIndustries.map((industry) => (
                <Link key={industry} href={`/industries/${industry}/`} style={industryLink}>{industryLabel(industry)}</Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={actionSection}>
        <div style={actionInner}>
          <div>
            <span style={sectionKicker}>FROM ENGINEERING TO PART IDENTIFICATION</span>
            <h2 style={actionTitle}>Protect the asset first. Then identify the part.</h2>
            <p style={actionBody}>Use Part Search when the application is known. Contact ELIMFILTERS when the operating condition, protection requirement or cross-reference needs technical review.</p>
          </div>
          <div style={actionLinks}>
            <Link href="https://part-search.elimfilters.com" style={yellowButton}>PART SEARCH</Link>
            <Link href="/contact/" style={darkButton}>TECHNICAL SUPPORT</Link>
            <Link href="/knowledge-center/" style={darkButton}>KNOWLEDGE CENTER</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const main: CSSProperties = { background: '#050505', color: '#fff', minHeight: '100vh', fontFamily: bodyFont };
const wrap: CSSProperties = { maxWidth: '1180px', margin: '0 auto' };
const backButton: CSSProperties = { position: 'fixed', top: '1rem', left: '1.2rem', zIndex: 50, background: 'rgba(0,0,0,0.72)', border: '1px solid rgba(255,255,255,0.16)', color: '#fff', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.14em', fontSize: '0.72rem', padding: '0.72rem 1rem', backdropFilter: 'blur(12px)' };
const hero: CSSProperties = { minHeight: '82vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: 'clamp(7rem, 12vw, 10rem) clamp(1.25rem, 6vw, 6rem) clamp(4rem, 8vw, 7rem)', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const heroImage: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'contrast(1.04) saturate(0.92)' };
const heroOverlay: CSSProperties = { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 18%, rgba(0,0,0,0.22) 48%, rgba(0,0,0,0.88) 100%)' };
const heroInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 };
const eyebrow: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.18em', fontSize: '0.72rem' };
const heroTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 0.9, fontSize: 'clamp(3.2rem, 7vw, 7rem)', maxWidth: '980px', margin: '0.8rem 0 0', textTransform: 'uppercase' };
const heroLead: CSSProperties = { margin: '1.5rem 0 0', maxWidth: '820px', color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(1.05rem, 1.55vw, 1.28rem)', lineHeight: 1.65, fontWeight: 500 };
const heroMeta: CSSProperties = { display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '1.7rem' };
const metaLink: CSSProperties = { color: '#fff', textDecoration: 'none', borderTop: '1px solid rgba(255,255,255,0.34)', paddingTop: '0.65rem', marginRight: '1.2rem', fontFamily: displayFont, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' };
const metaText: CSSProperties = { ...metaLink, color: 'rgba(255,255,255,0.58)' };
const introSection: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const introGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: 'clamp(2.5rem, 7vw, 6rem)' };
const sectionKicker: CSSProperties = { display: 'block', color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.7rem', marginBottom: '1rem' };
const sectionTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: 'clamp(2.4rem, 4.7vw, 4.8rem)', lineHeight: 0.97, letterSpacing: '-0.04em', margin: 0, maxWidth: '700px', textTransform: 'uppercase' };
const sectionTitleSmall: CSSProperties = { ...sectionTitle, fontSize: 'clamp(2rem, 3.8vw, 3.7rem)', maxWidth: '780px' };
const leadText: CSSProperties = { margin: 0, color: '#fff', fontSize: 'clamp(1.1rem, 1.65vw, 1.35rem)', lineHeight: 1.72, fontWeight: 600 };
const bodyText: CSSProperties = { margin: '1.2rem 0 0', color: 'rgba(255,255,255,0.64)', fontSize: '1rem', lineHeight: 1.78 };
const assetSection: CSSProperties = { padding: 'clamp(4rem, 7vw, 6rem) clamp(1.25rem, 6vw, 6rem)', background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const sectionHeadingRow: CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)', gap: 'clamp(2rem, 5vw, 5rem)', alignItems: 'end' };
const headingNote: CSSProperties = { margin: 0, color: 'rgba(255,255,255,0.62)', lineHeight: 1.7, fontSize: '0.98rem' };
const componentGrid: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '1px', marginTop: '3rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' };
const componentCard: CSSProperties = { background: '#0a0a0a', minHeight: '130px', padding: '1.4rem', display: 'flex', alignItems: 'flex-end', flex: '1 1 210px', minWidth: 0 };
const componentName: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em', textTransform: 'uppercase' };
const riskSection: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const riskGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '2.7rem' };
const riskCard: CSSProperties = { border: '1px solid rgba(255,255,255,0.12)', padding: '1.6rem', background: 'rgba(255,255,255,0.018)', minHeight: '330px', display: 'flex', flexDirection: 'column' };
const cardTitle: CSSProperties = { fontFamily: displayFont, fontWeight: 700, fontSize: '1.45rem', letterSpacing: '-0.025em', textTransform: 'uppercase', margin: 0 };
const cardBody: CSSProperties = { color: 'rgba(255,255,255,0.67)', lineHeight: 1.68, margin: '1rem 0 0' };
const riskDivider: CSSProperties = { height: '1px', background: 'rgba(255,241,45,0.35)', margin: '1.4rem 0' };
const impactText: CSSProperties = { color: '#fff', lineHeight: 1.65, margin: 0, fontWeight: 600 };
const textLink: CSSProperties = { color: '#FFF12D', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.12em', marginTop: 'auto', paddingTop: '1.4rem' };
const strategySection: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', background: '#0d0d0d', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const strategyGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: 'clamp(2.5rem, 7vw, 6rem)' };
const strategyStack: CSSProperties = { display: 'grid', gap: 0, borderTop: '1px solid rgba(255,255,255,0.14)' };
const strategyItem: CSSProperties = { padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.14)' };
const strategyLabel: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.13em', textTransform: 'uppercase' };
const strategyText: CSSProperties = { margin: '0.65rem 0 0', color: 'rgba(255,255,255,0.78)', lineHeight: 1.68, fontSize: '1.03rem' };
const selectionSection: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const selectionIntro: CSSProperties = { maxWidth: '850px' };
const questionGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '2.8rem' };
const questionCard: CSSProperties = { borderTop: '1px solid rgba(255,255,255,0.24)', paddingTop: '1rem', minHeight: '145px' };
const questionNumber: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.12em' };
const questionText: CSSProperties = { color: '#fff', fontWeight: 600, lineHeight: 1.55, margin: '1rem 0 0', fontSize: '1.03rem' };
const serviceSection: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const serviceGrid: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: 'clamp(2.5rem, 7vw, 6rem)' };
const serviceList: CSSProperties = { borderTop: '1px solid rgba(255,255,255,0.14)' };
const serviceItem: CSSProperties = { display: 'grid', gridTemplateColumns: '52px 1fr', gap: '1rem', padding: '1.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.14)' };
const serviceNumber: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em' };
const serviceText: CSSProperties = { margin: 0, color: 'rgba(255,255,255,0.8)', lineHeight: 1.62, fontWeight: 600 };
const standardsSection: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const standardsHeader: CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)', gap: 'clamp(2rem, 5vw, 5rem)', alignItems: 'end' };
const contextGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '2.8rem' };
const contextCard: CSSProperties = { color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)', padding: '1.5rem', minHeight: '230px', display: 'flex', flexDirection: 'column' };
const contextCardYellow: CSSProperties = { ...contextCard, borderColor: 'rgba(255,241,45,0.42)' };
const contextLabel: CSSProperties = { color: '#FFF12D', fontFamily: displayFont, fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.13em', textTransform: 'uppercase' };
const contextTitle: CSSProperties = { fontFamily: displayFont, fontSize: '1.55rem', marginTop: '1rem', textTransform: 'uppercase' };
const contextBody: CSSProperties = { color: 'rgba(255,255,255,0.64)', lineHeight: 1.62, marginTop: '1rem' };
const standardsBand: CSSProperties = { marginTop: '1rem', border: '1px solid rgba(255,255,255,0.12)', padding: '1.5rem' };
const standardLinks: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginTop: '1rem' };
const standardLink: CSSProperties = { color: '#fff', textDecoration: 'none', borderBottom: '1px solid rgba(255,241,45,0.45)', paddingBottom: '0.25rem', fontFamily: displayFont, fontWeight: 700, fontSize: '0.82rem' };
const industriesSection: CSSProperties = { padding: 'clamp(4rem, 7vw, 6rem) clamp(1.25rem, 6vw, 6rem)', background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.08)' };
const industryGrid: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.7rem', marginTop: '2rem' };
const industryLink: CSSProperties = { color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.16)', padding: '0.75rem 0.9rem', fontFamily: displayFont, fontWeight: 700, fontSize: '0.76rem', letterSpacing: '0.06em', textTransform: 'uppercase' };
const actionSection: CSSProperties = { padding: 'clamp(4.5rem, 8vw, 7rem) clamp(1.25rem, 6vw, 6rem)', background: 'linear-gradient(135deg, rgba(255,241,45,0.13), transparent 45%)' };
const actionInner: CSSProperties = { maxWidth: '1180px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(280px, 0.85fr)', gap: 'clamp(2.5rem, 7vw, 6rem)', alignItems: 'end' };
const actionTitle: CSSProperties = { ...sectionTitle, fontSize: 'clamp(2.4rem, 4.8vw, 4.8rem)' };
const actionBody: CSSProperties = { color: 'rgba(255,255,255,0.68)', maxWidth: '760px', lineHeight: 1.72, fontSize: '1.02rem', margin: '1.4rem 0 0' };
const actionLinks: CSSProperties = { display: 'grid', gap: '0.75rem' };
const yellowButton: CSSProperties = { background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.78rem', padding: '1rem 1.15rem', textAlign: 'center' };
const darkButton: CSSProperties = { color: '#fff', textDecoration: 'none', fontFamily: displayFont, fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.78rem', padding: '1rem 1.15rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.18)' };
