import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CANONICAL_TECHNOLOGY_LIST, getCanonicalTechnology, type TechnologySlug } from '@/lib/canonical-technologies';
import { getTechnologyEngineering } from '@/lib/canonical-engineering';
import { PRODUCT_FAMILY_LIST } from '@/lib/product-families-data';
import { getProtectionSystemBySlug } from '@/lib/protection-systems-data';

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
  // TODO: no dedicated HYDROCORE logo asset exists yet -- reusing SYNTAPORE's
  // (its closest fuel-domain relative) until a real HYDROCORE.avif is supplied.
  hydrocore: '/assets/SYNTAPORE.avif',
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
  // TODO: no dedicated HYDROCORE hero photo exists yet -- reusing SYNTAPORE's
  // until a real one is supplied.
  hydrocore: '/images/hero-syntapore.avif',
};

const PROTECTED_ELEMENTS: Readonly<Record<TechnologySlug, readonly string[]>> = {
  macrocore: ['Cylinders', 'Piston rings', 'Turbochargers', 'Combustion-system air path'],
  microkappa: ['Operator cabin', 'Passenger cabin', 'HVAC airflow path', 'Cabin-air environment'],
  drycore: ['Pneumatic brake valves', 'Actuators', 'Pneumatic controls', 'Compressed-air circuit'],
  intekcore: ['Air-cleaner housing', 'Element-to-housing seal', 'Element retention', 'Intake airflow boundary'],
  syntapore: ['Primary fuel-filtration stage', 'Secondary fuel-filtration stage', 'High-pressure pump', 'Precision injectors'],
  turbocore: ['Turbine Series FH assemblies', 'Turbine Series FG assemblies', 'Fuel-separation stage', 'Downstream fuel-system components'],
  syntrax: ['Bearings', 'Journals', 'Lubricated interfaces', 'Engine lubrication circuit'],
  nanoforce: ['Hydraulic pumps', 'Valves', 'Actuators', 'Servo controls'],
  thermacore: ['Coolant passages', 'Seals', 'Wet liners', 'Heat-transfer surfaces'],
  hydrocore: ['Injectors', 'High-pressure pump', 'Downstream fuel-system components', 'Water-separation bowl/element'],
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
  hydrocore: 'Applied in standard (non-turbine) spin-on and cartridge fuel/water separators where free and emulsified water must be removed ahead of the fuel-filtration stage.',
};

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
  const canonical = getCanonicalTechnology(slug);
  const engineering = getTechnologyEngineering(slug);
  if (!canonical || !engineering) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: `What is ${canonical.name}?`, acceptedAnswer: { '@type': 'Answer', text: engineering.definition } },
      { '@type': 'Question', name: `How does ${canonical.name} work?`, acceptedAnswer: { '@type': 'Answer', text: engineering.engineeringPrinciple } },
      { '@type': 'Question', name: `What does ${canonical.name} protect?`, acceptedAnswer: { '@type': 'Answer', text: engineering.operationalImpact } },
    ],
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
  if (!canonical || !engineering) notFound();

  const slug = canonical.slug as TechnologySlug;
  const technologyAsset = TECHNOLOGY_ASSETS[slug];
  const technologyHero = TECHNOLOGY_HERO_IMAGES[slug];
  const system = getProtectionSystemBySlug(canonical.domain);
  const families = PRODUCT_FAMILY_LIST.filter((family) => family.primaryTechnology === slug);
  const protectedElements = PROTECTED_ELEMENTS[slug];

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
            <div style={sectionLabel}>ELIMFILTERS PROPRIETARY TECHNOLOGY</div>
            <h1 style={{ ...sectionHeading, fontSize: 'clamp(2.8rem, 6vw, 5.2rem)' }}>{canonical.name}</h1>
            <p style={{ ...bodyCopy, marginTop: '1.3rem', color: '#fff', fontWeight: 600 }}>{canonical.role}</p>
          </div>
          <div>
            <p style={{ ...bodyCopy, fontSize: 'clamp(1.1rem, 1.8vw, 1.34rem)', color: 'rgba(255,255,255,0.9)', marginTop: 0 }}>{engineering.definition}</p>
            <p style={{ ...bodyCopy, marginTop: '1.5rem' }}>{APPLICATION_CONTEXT[slug]}</p>
          </div>
        </div>
      </section>

      <section style={{ borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#050505', padding: '5.5rem 2rem' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={sectionLabel}>HOW THE TECHNOLOGY WORKS</div>
          <h2 style={{ ...sectionHeading, maxWidth: '760px' }}>Engineering logic, not a marketing label.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.08)', marginTop: '3.2rem' }} className="technology-three-grid">
            {[
              ['Engineering principle', engineering.engineeringPrinciple],
              ['Control strategy', engineering.controlStrategy],
              ['Protected outcome', engineering.operationalImpact],
            ].map(([title, copy]) => (
              <article key={title} style={{ background: '#080808', padding: '2.2rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.08rem', color: '#fff', margin: '0 0 1rem' }}>{title}</h3>
                <p style={{ ...bodyCopy, fontSize: '0.98rem', margin: 0 }}>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '6rem 2rem' }} id="supported-families">
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={sectionLabel}>WHAT IT SUPPORTS</div>
          <h2 style={{ ...sectionHeading, maxWidth: '780px' }}>Product families built around {canonical.name}.</h2>
          <p style={{ ...bodyCopy, maxWidth: '800px', marginTop: '1.35rem' }}>These are the ELIMFILTERS product families whose primary technology relationship is assigned to {canonical.name} in the canonical portfolio architecture.</p>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(Math.max(families.length, 1), 3)}, minmax(0, 1fr))`, gap: '1.25rem', marginTop: '3rem' }} className="technology-family-grid">
            {families.map((family) => (
              <Link key={family.slug} href={`/families/${family.slug}/`} style={{ textDecoration: 'none', color: 'inherit', border: '1px solid rgba(255,255,255,0.1)', background: '#050505', padding: '2rem', minHeight: '260px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.14em', color: '#FFF12D', marginBottom: '0.9rem' }}>{family.dutyClass}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', lineHeight: 1.15, margin: 0, color: '#fff' }}>{family.name}</h3>
                <p style={{ ...bodyCopy, fontSize: '0.94rem', marginTop: '1rem' }}>{family.purpose}</p>
                <span style={{ marginTop: 'auto', paddingTop: '1.3rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', color: '#FFF12D' }}>VIEW PRODUCT FAMILY</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '5.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.07)', background: '#050505' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: '0.78fr 1.22fr', gap: 'clamp(3rem, 7vw, 7rem)' }} className="technology-elements-grid">
          <div>
            <div style={sectionLabel}>PROTECTED ELEMENTS</div>
            <h2 style={sectionHeading}>Where the protection matters.</h2>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            {protectedElements.map((element, index) => (
              <div key={element} style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: '1rem', padding: '1.2rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,241,45,0.72)', fontSize: '0.72rem' }}>{String(index + 1).padStart(2, '0')}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '1.08rem', color: 'rgba(255,255,255,0.9)' }}>{element}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

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
            <h2 style={{ ...sectionHeading, maxWidth: '760px' }}>Match the technology to the correct equipment and filtration position.</h2>
            <p style={{ ...bodyCopy, maxWidth: '780px', marginTop: '1.2rem' }}>Use Part Search for application identification, or continue into the Knowledge Center for contamination-control and system-level engineering guidance.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', minWidth: '220px' }}>
            <a href="https://part-search.elimfilters.com" target="_blank" rel="noopener noreferrer" style={{ background: '#FFF12D', color: '#000', textDecoration: 'none', textAlign: 'center', padding: '1rem 1.35rem', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em' }}>FIND MY PART</a>
            <Link href="/knowledge-center/" style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#fff', textDecoration: 'none', textAlign: 'center', padding: '1rem 1.35rem', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em' }}>KNOWLEDGE CENTER</Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .technology-intro-grid,
          .technology-elements-grid,
          .technology-system-grid,
          .technology-cta-grid { grid-template-columns: 1fr !important; }
          .technology-three-grid,
          .technology-family-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
