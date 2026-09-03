import type { Metadata } from 'next';
import { KC_SYSTEMS, KC_SYSTEM_DETAILS } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import SystemContent from './SystemContent';

const SYSTEM_ALIASES: Record<string, string> = {
  'cabin-air-protection': 'air-intake-protection',
  'compressed-air-protection': 'air-intake-protection',
  'fuel-cleanliness': 'fuel-cleanliness-protection',
};

export function generateStaticParams() {
  return [
    ...KC_SYSTEMS.map((s) => ({ slug: s.slug })),
    ...Object.keys(SYSTEM_ALIASES).map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSlug = SYSTEM_ALIASES[slug] || slug;
  const system = KC_SYSTEMS.find((s) => s.slug === resolvedSlug);
  if (!system) return {};

  const isAlias = resolvedSlug !== slug;
  const url = `https://elimfilters.com/knowledge-center/systems/${resolvedSlug}/`;
  return {
    title: isAlias ? `${slug.replace(/-/g, ' ')} Legacy System` : `${system.title} System`,
    description: isAlias ? `Legacy protection-system route. Continue to the current ${system.title} page.` : system.description,
    alternates: { canonical: url },
    robots: isAlias ? { index: false, follow: true } : undefined,
    openGraph: {
      title: `${system.title} System | ELIMFILTERS`,
      description: system.description,
      url,
      type: 'article',
    },
  };
}

export default async function SystemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resolvedSlug = SYSTEM_ALIASES[slug] || slug;
  const system = KC_SYSTEMS.find((s) => s.slug === resolvedSlug);
  if (!system) return notFound();

  if (resolvedSlug !== slug) {
    const destination = `/knowledge-center/systems/${resolvedSlug}/`;
    return (
      <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
        <script dangerouslySetInnerHTML={{ __html: `window.location.replace('${destination}');` }} />
        <meta httpEquiv="refresh" content={`0;url=${destination}`} />
        <section style={{ textAlign: 'center' }}>
          <h1>This protection-system page has moved.</h1>
          <a href={destination}>Open current system page</a>
        </section>
      </main>
    );
  }

  const detail = KC_SYSTEM_DETAILS[resolvedSlug] ?? null;
  return <SystemContent system={system} detail={detail} />;
}
