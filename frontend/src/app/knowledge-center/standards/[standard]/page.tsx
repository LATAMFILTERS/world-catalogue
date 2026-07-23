import type { Metadata } from 'next';
import { KC_STANDARDS } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import StandardContent from './StandardContent';

const STANDARD_ALIASES: Record<string, string> = {
  'astm-d6210': 'iso-4406',
  'eu-dir-2019-130': 'iso-11155',
  'iso-11155': 'iso-29463',
  'iso-3724': 'iso-16889',
  'iso-4405': 'iso-4406',
};

export function generateStaticParams() {
  return [
    ...KC_STANDARDS.map((s) => ({ standard: s.slug })),
    ...Object.keys(STANDARD_ALIASES).map((standard) => ({ standard })),
  ];
}

export async function generateMetadata({ params }: { params: { standard: string } }): Promise<Metadata> {
  const resolvedSlug = STANDARD_ALIASES[params.standard] || params.standard;
  const std = KC_STANDARDS.find((s) => s.slug === resolvedSlug);
  if (!std) return {};

  const isAlias = resolvedSlug !== params.standard;
  const url = `https://elimfilters.com/knowledge-center/standards/${resolvedSlug}`;
  return {
    title: isAlias ? `${params.standard.toUpperCase()} Legacy Standard` : `${std.code}: ${std.title}`,
    description: isAlias ? `Legacy standards route. Continue to the current ${std.code} ELIMFILTERS reference.` : std.metaDescription,
    alternates: { canonical: url },
    robots: isAlias ? { index: false, follow: true } : undefined,
    openGraph: {
      title: `${std.code}: ${std.title} | ELIMFILTERS`,
      description: std.metaDescription,
      url,
      type: 'article',
    },
  };
}

export default function StandardPage({ params }: { params: { standard: string } }) {
  const resolvedSlug = STANDARD_ALIASES[params.standard] || params.standard;
  const std = KC_STANDARDS.find((s) => s.slug === resolvedSlug);
  if (!std) return notFound();

  if (resolvedSlug !== params.standard) {
    const destination = `/knowledge-center/standards/${resolvedSlug}/`;
    return (
      <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
        <script dangerouslySetInnerHTML={{ __html: `window.location.replace('${destination}');` }} />
        <meta httpEquiv="refresh" content={`0;url=${destination}`} />
        <section style={{ textAlign: 'center' }}>
          <h1>This standards reference has moved.</h1>
          <a href={destination}>Open current standard</a>
        </section>
      </main>
    );
  }

  return <StandardContent std={std} />;
}
