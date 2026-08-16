import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CANONICAL_TECHNOLOGY_LIST, getCanonicalTechnology, type TechnologySlug } from '@/lib/canonical-technologies';
import { getTechnologyEngineering } from '@/lib/canonical-engineering';
import { getProtectionSystemBySlug } from '@/lib/protection-systems-data';
import { getTechnologyEditorial } from '@/lib/technology-editorial';
import TechnologyEditorial from '@/components/TechnologyEditorial';
import MacrocoreConceptDiagram from '@/components/technologies/MacrocoreConceptDiagram';
import { EngineeringAssessmentCTA } from '@/components/technologies/EngineeringAssessmentCTA';
import { ApplicationCards } from '@/components/technologies/ApplicationCards';
import { MACROCORE_APPLICATIONS } from '@/lib/macrocore-applications';

interface Props {
  params: { slug: string };
}

const BASE_URL = 'https://elimfilters.com';

const TECHNOLOGY_ASSETS: Readonly<Record<TechnologySlug, string>> = {
  macrocore: '/assets/MACROCORE.avif',
  microkappa: '/assets/MICROKAPPA.avif',
  drycore: '/assets/DRYCORE.avif',
  intekcore: '/assets/INTEKCORE.avif',
  syntapore: '/assets/SYNTAPORE.avif',
  turbocore: '/assets/TURBOCORE.avif',
  syntrax: '/assets/SYNTRAX.avif',
  nanoforce: '/assets/NANOFORCE.avif',
  thermacore: '/assets/THERMACORE.avif',
  hydrocore: '/assets/HYDROCORE.avif',
};

const TECHNOLOGY_HERO_IMAGES: Readonly<Record<TechnologySlug, string>> = {
  macrocore: '/images/mecanica-air.avif',
  microkappa: '/images/cabin-hero.avif',
  drycore: '/images/airdryer-hero.avif',
  intekcore: '/images/intekcor-hero.avif',
  syntapore: '/images/hero-syntapore.avif',
  turbocore: '/images/TURBOCORE-hero.avif',
  syntrax: '/images/syntrax.avif',
  nanoforce: '/images/nanoforce-mecanico.avif',
  thermacore: '/images/THERMACORE-CAMION.avif',
  hydrocore: '/images/fuellseparator-hero.avif',
};

const APPLICATION_CONTEXT: Readonly<Record<TechnologySlug, string>> = {
  macrocore: 'Applied where engine intake air must be controlled through primary and secondary filtration before airborne contamination reaches the combustion system.',
  microkappa: 'Applied in operator and passenger HVAC systems where particulate control, airflow demand and cabin pressure-drop limits must be balanced.',
  drycore: 'Applied in compressed-air and pneumatic brake circuits where moisture must be controlled before it can affect valves, actuators and pneumatic controls.',
  intekcore: 'Applied at the air-cleaner housing and sealing boundary where housing geometry, element fit and seal loading determine whether unfiltered air can bypass the filtration element.',
  syntapore: 'Applied across approved primary, secondary and cartridge diesel-fuel filtration stages upstream of precision pumps and injectors.',
  turbocore: 'Applied specifically within approved Turbine Series FH and FG fuel-separation architectures requiring staged separation, filtration and service access.',
  syntrax: 'Applied in engine lubrication circuits where wear debris, soot agglomerates and lubricant contamination must be controlled across the service interval.',
  nanoforce: 'Applied in fluid-power systems where cleanliness targets are established around the tolerance requirements of the most sensitive hydraulic component.',
  thermacore: 'Applied in heavy-duty cooling circuits where coolant cleanliness, additive condition, flow and service interval must remain compatible with the approved cooling-system maintenance strategy.',
  hydrocore: 'Applied in standard spin-on and cartridge fuel/water separators where free and emulsified water must be removed ahead of the fuel-filtration stage.',
};

// MACROCORE-specific pre-sales copy. Sourced exclusively from
// docs/brand/TECHNOLOGY_REGISTRY.md, elimfilters-vault/01-technologies/active/MACROCORE.md (v2.0),
// canonical-engineering.ts and technology-editorial.ts. No figures, standards codes beyond ISO 5011,
// or architecture claims not already present in those sources.
const MACROCORE_H1 = 'Dust Does Not Need to Be Dramatic to Be Expensive.';

const MACROCORE_CAPABILITY_STRIP = [
  'Primary & Secondary Engine Air Filtration',
  'Air Intake & Airflow Protection System',
  'Evaluated Using ISO 5011 Test Methods',
  'Engineering-Matched Selection',
] as const;

const PARAMETERS_QUALIFICATION =
  'Published product-level performance values should be tied to validated test data for the specific element or assembly rather than treated as universal values for the technology.';

function technologyUrl(slug: string) {
  return `${BASE_URL}/technologies/${slug}/`;
}

function technologyEntityUrl(slug: string) {
  return `${technologyUrl(slug)}#technology`;
}

export function generateStaticParams() {
  return CANONICAL_TECHNOLOGY_LIST.map((technology) => ({ slug: technology.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const canonical = getCanonicalTechnology(params.slug);
  const engineering = getTechnologyEngineering(params.slug);
  if (!canonical || !engineering) return { title: 'Not Found', robots: { index: false, follow: false } };

  const slug = canonical.slug as TechnologySlug;
  const url = technologyUrl(slug);
  const heroImage = `${BASE_URL}${TECHNOLOGY_HERO_IMAGES[slug]}`;
  const title = `${canonical.name} Proprietary Technology`;
  const socialTitle = `${canonical.name} | ELIMFILTERS Proprietary Technology`;

  return {
    title,
    description: engineering.definition,
    keywords: [canonical.name, `${canonical.name} filtration technology`, 'ELIMFILTERS technology', 'industrial filtration technology', 'asset protection'],
    alternates: { canonical: url },
    openGraph: {
      title: socialTitle,
      description: engineering.definition,
      url,
      type: 'website',
      siteName: 'ELIMFILTERS',
      images: [{ url: heroImage, width: 1200, height: 630, alt: `${canonical.name} technology` }],
    },
    twitter: { card: 'summary_large_image', title: socialTitle, description: engineering.definition, images: [heroImage] },
  };
}

function technologySchema(slug: TechnologySlug) {
  const canonical = getCanonicalTechnology(slug);
  const engineering = getTechnologyEngineering(slug);
  if (!canonical || !engineering) return null;
  const url = technologyUrl(slug);

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `${url}#article`,
    headline: canonical.name,
    name: canonical.name,
    description: engineering.definition,
    url,
    author: { '@type': 'Organization', '@id': `${BASE_URL}/#organization`, name: 'ELIMFILTERS' },
    publisher: { '@type': 'Organization', '@id': `${BASE_URL}/#organization`, name: 'ELIMFILTERS' },
    about: {
      '@type': 'DefinedTerm',
      '@id': technologyEntityUrl(slug),
      name: canonical.name,
      description: engineering.definition,
      url,
      inDefinedTermSet: `${BASE_URL}/technologies/`,
    },
    abstract: engineering.engineeringPrinciple,
    keywords: [canonical.name, 'industrial filtration technology', 'contamination control', 'asset protection', 'ELIMFILTERS'],
    isPartOf: { '@type': 'WebSite', '@id': `${BASE_URL}/#website`, name: 'ELIMFILTERS', url: `${BASE_URL}/` },
  };
}

function faqSchema(slug: TechnologySlug) {
  const editorial = getTechnologyEditorial(slug);
  if (!editorial) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: editorial.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

function breadcrumbSchema(name: string, slug: TechnologySlug) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Technologies', item: `${BASE_URL}/technologies/` },
      { '@type': 'ListItem', position: 3, name, item: technologyUrl(slug) },
    ],
  };
}

const sectionLabel = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.72rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: '#FFF12D',
  marginBottom: '0.9rem',
};

const sectionHeading = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(2rem, 4vw, 3.35rem)',
  lineHeight: 1.05,
  letterSpacing: '-0.035em',
  color: '#fff',
  margin: 0,
};

const bodyCopy = {
  fontFamily: 'var(--font-body)',
  fontSize: 'clamp(1rem, 1.35vw, 1.12rem)',
  lineHeight: 1.8,
  color: 'rgba(255,255,255,0.74)',
};

export default function TechnologyPage({ params }: Props) {
  const canonical = getCanonicalTechnology(params.slug);
  const engineering = getTechnologyEngineering(params.slug);
  const editorial = getTechnologyEditorial(params.slug);
  if (!canonical || !engineering || !editorial) notFound();

  const slug = canonical.slug as TechnologySlug;
  const technologyAsset = TECHNOLOGY_ASSETS[slug];
  const technologyHero = TECHNOLOGY_HERO_IMAGES[slug];
  const system = getProtectionSystemBySlug(canonical.domain);
  const isMacrocore = slug === 'macrocore';

  const articleSchema = technologySchema(slug);
  const questionsSchema = faqSchema(slug);
  const breadcrumbs = breadcrumbSchema(canonical.name, slug);

  return (
    <main style={{ background: '#000', color: '#fff' }}>
      {articleSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />}
      {questionsSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(questionsSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <section
        aria-label={`${canonical.name} technology hero`}
        style={{
          position: 'relative',
          minHeight: 'clamp(560px, 82vh, 860px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundImage: `url(${technologyHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {slug === 'hydrocore' ? (
          <div
            aria-hidden="true"
            style={{
              position: 'relative',
              zIndex: 2,
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3.2rem, 8vw, 7rem)',
              fontWeight: 700,
              letterSpacing: '-0.035em',
              lineHeight: 0.95,
              color: '#fff',
              textAlign: 'center',
              textShadow: '0 3px 18px rgba(0,0,0,0.75)',
            }}
          >
            {canonical.name}
          </div>
        ) : (
          <img
            src={technologyAsset}
            alt={canonical.name}
            style={{
              position: 'relative',
              zIndex: 2,
              width: 'min(520px, 48vw)',
              height: 'auto',
              display: 'block',
              mixBlendMode: 'screen',
              filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.5))',
            }}
          />
        )}
      </section>

      <nav aria-label="Breadcrumb" style={{ borderTop: '1px solid rgba(255,241,45,0.14)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', gap: '0.7rem', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>HOME</Link>
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
          <Link href="/technologies/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>TECHNOLOGIES</Link>
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>/</span>
          <span style={{ color: '#FFF12D' }}>{canonical.name}</span>
        </div>
      </nav>

      <section style={{ padding: '6.5rem 2rem 5.5rem' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 0.82fr) minmax(0, 1.18fr)', gap: 'clamp(3rem, 7vw, 7rem)', alignItems: 'start' }} className="technology-intro-grid">
          <div>
            <div style={sectionLabel}>{isMacrocore ? `ELIMFILTERS PROPRIETARY TECHNOLOGY — ${canonical.name}` : 'ELIMFILTERS PROPRIETARY TECHNOLOGY'}</div>
            <h1 style={{ ...sectionHeading, fontSize: isMacrocore ? 'clamp(2.2rem, 4.4vw, 3.6rem)' : 'clamp(2.8rem, 6vw, 5.2rem)' }}>
              {isMacrocore ? MACROCORE_H1 : canonical.name}
            </h1>
            <p style={{ ...bodyCopy, marginTop: '1.3rem', color: '#fff', fontWeight: 600 }}>{canonical.role}</p>
          </div>
          <div>
            <p style={{ ...bodyCopy, fontSize: 'clamp(1.1rem, 1.8vw, 1.34rem)', color: 'rgba(255,255,255,0.9)', marginTop: 0 }}>{engineering.definition}</p>
            <p style={{ ...bodyCopy, marginTop: '1.5rem' }}>{APPLICATION_CONTEXT[slug]}</p>

            {isMacrocore && (
              <>
                <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', margin: '1.75rem 0 0', padding: 0, listStyle: 'none' }}>
                  {MACROCORE_CAPABILITY_STRIP.map((item) => (
                    <li
                      key={item}
                      style={{
                        border: '1px solid rgba(255,241,45,0.25)',
                        background: 'rgba(255,241,45,0.04)',
                        color: 'rgba(255,255,255,0.85)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                        letterSpacing: '0.04em',
                        padding: '0.55rem 0.85rem',
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginTop: '2rem' }}>
                  <EngineeringAssessmentCTA />
                  <a
                    href="https://part-search.elimfilters.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      textDecoration: 'none',
                      textAlign: 'center',
                      padding: '1rem 1.35rem',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Find an OEM Equivalent
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {isMacrocore && (
        <section style={{ padding: '5.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.07)', background: '#050505' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,0.72fr) minmax(0,1.28fr)', gap: 'clamp(2.5rem, 7vw, 7rem)', alignItems: 'start' }} className="technology-editorial-chapter">
            <div>
              <div style={sectionLabel}>HOW MACROCORE™ IS EVALUATED</div>
              <h2 style={sectionHeading}>Airflow and separation have to coexist.</h2>
            </div>
            <div>
              <p style={{ ...bodyCopy, marginTop: 0, color: 'rgba(255,255,255,0.9)' }}>{engineering.engineeringPrinciple}</p>
              <p style={{ ...bodyCopy, marginTop: '1.2rem' }}>{engineering.controlStrategy}</p>
              <div style={{ marginTop: '2.5rem' }}>
                <MacrocoreConceptDiagram />
              </div>
            </div>
          </div>
        </section>
      )}

      {isMacrocore && (
        <section style={{ padding: '5.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,0.72fr) minmax(0,1.28fr)', gap: 'clamp(2.5rem, 7vw, 7rem)', alignItems: 'start' }} className="technology-editorial-chapter">
            <div>
              <div style={sectionLabel}>PARAMETERS AN ENGINEERING REVIEW CONSIDERS</div>
              <h2 style={sectionHeading}>{editorial.parameters.title}</h2>
            </div>
            <div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.7rem' }}>
                {[...editorial.parameters.items, ...editorial.selection.items].map((item) => (
                  <li key={item} style={{ ...bodyCopy, margin: 0, display: 'grid', gridTemplateColumns: '18px 1fr', gap: '0.7rem', alignItems: 'start' }}>
                    <span aria-hidden="true" style={{ color: '#FFF12D', lineHeight: 1.8 }}>—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p style={{ ...bodyCopy, marginTop: '1.75rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.55)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
                {PARAMETERS_QUALIFICATION}
              </p>
            </div>
          </div>
        </section>
      )}

      {isMacrocore && (
        <section style={{ padding: '5.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.07)', background: '#050505' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={sectionLabel}>OPERATING ENVIRONMENTS</div>
            <h2 style={{ ...sectionHeading, marginBottom: '2rem' }}>Where MACROCORE™ is evaluated for air-intake protection.</h2>
            <ApplicationCards applications={MACROCORE_APPLICATIONS} />
            <Link
              href="/industries/"
              style={{
                display: 'inline-block',
                marginTop: '2rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                letterSpacing: '0.08em',
                color: '#FFF12D',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,241,45,0.45)',
                paddingBottom: '0.25rem',
              }}
            >
              EXPLORE ALL INDUSTRIES →
            </Link>
          </div>
        </section>
      )}

      <TechnologyEditorial editorial={editorial} />

      {system && (
        <section style={{ padding: '6rem 2rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={sectionLabel}>SYSTEM INTEGRATION</div>
            <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 'clamp(3rem, 7vw, 7rem)', alignItems: 'start' }} className="technology-system-grid">
              <div>
                <h2 style={sectionHeading}>{system.name}</h2>
                <Link href={`/systems/${system.slug}/`} style={{ display: 'inline-block', marginTop: '1.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.08em', color: '#FFF12D', textDecoration: 'none', borderBottom: '1px solid rgba(255,241,45,0.45)', paddingBottom: '0.25rem' }}>EXPLORE PROTECTION SYSTEM</Link>
              </div>
              <div>
                <p style={{ ...bodyCopy, marginTop: 0, color: 'rgba(255,255,255,0.9)' }}>{system.overview}</p>
                <p style={{ ...bodyCopy, marginTop: '1.4rem' }}>{system.engineeringPrinciple}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section style={{ padding: '5.5rem 2rem', borderTop: '1px solid rgba(255,241,45,0.18)', background: 'linear-gradient(180deg, rgba(255,241,45,0.035), #000)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }} className="technology-cta-grid">
          <div>
            <div style={sectionLabel}>APPLICATION SUPPORT</div>
            <h2 style={{ ...sectionHeading, maxWidth: '760px' }}>Bring us the application, duty cycle and failure pattern — not just the part number.</h2>
            <p style={{ ...bodyCopy, maxWidth: '780px', marginTop: '1.2rem' }}>Use Part Search when the application is already known. When the issue is repeated contamination, short service life, component exposure or uncertain filtration architecture, use the Knowledge Center as the technical path into an application review.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', minWidth: '220px' }}>
            {isMacrocore && <EngineeringAssessmentCTA label="REQUEST AN ENGINEERING ASSESSMENT" />}
            <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={{ background: isMacrocore ? 'transparent' : '#FFF12D', color: isMacrocore ? '#FFF12D' : '#000', border: isMacrocore ? '1px solid rgba(255,241,45,0.4)' : 'none', textDecoration: 'none', textAlign: 'center', padding: '1rem 1.35rem', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em' }}>{isMacrocore ? 'FIND AN OEM EQUIVALENT' : 'FIND MY PART'}</a>
            <Link href="/knowledge-center/" style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#fff', textDecoration: 'none', textAlign: 'center', padding: '1rem 1.35rem', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em' }}>TECHNICAL REVIEW PATH</Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .technology-intro-grid,
          .technology-system-grid,
          .technology-cta-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
