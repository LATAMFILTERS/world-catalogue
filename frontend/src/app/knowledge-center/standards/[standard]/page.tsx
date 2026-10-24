import type { Metadata } from 'next';
import { KC_STANDARDS } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import StandardContent from './StandardContent';
import StandardApplyCta from './StandardApplyCta';
import { languageAlternates } from '@/lib/localized-routes';
import { TRANSLATED_STANDARD_SLUGS } from '@/lib/knowledge-center-data/i18n/titles';

// Only exact semantic aliases belong here. Unrelated historical standards must
// resolve independently (or 404) rather than inherit another standard's entity.
const STANDARD_ALIASES: Record<string, string> = {
  'iso-11155': 'iso-11155-1',
};

function resolveStandardSlug(slug: string): string {
  const seen = new Set<string>();
  let current = slug;
  while (STANDARD_ALIASES[current] && !seen.has(current)) {
    seen.add(current);
    current = STANDARD_ALIASES[current];
  }
  return current;
}

const SEO_OVERRIDES: Record<string, { title: string; description: string }> = {
  'iso-16889': {
    title: 'ISO 16889 Multi-Pass Filter Test Method | ELIMFILTERS',
    description: 'Engineering reference for ISO 16889 multi-pass filter testing, beta ratio, filtration efficiency, contaminant loading and application interpretation.',
  },
  'iso-4406': {
    title: 'ISO 4406 Fluid Cleanliness Code — Standard Reference | ELIMFILTERS',
    description: 'Normative engineering reference for ISO 4406 fluid cleanliness coding, particle-count size channels and cleanliness class interpretation.',
  },
  'iso-8573-1': {
    title: 'ISO 8573-1 Compressed Air Purity Classes — Standard Reference | ELIMFILTERS',
    description: 'Normative engineering reference for ISO 8573-1 compressed-air purity classes covering particles, water and oil contamination limits.',
  },
  'iso-12937': {
    title: 'ISO 12937 Water in Petroleum Products | ELIMFILTERS',
    description: 'Engineering reference for ISO 12937 determination of water in petroleum products, test context, interpretation and contamination-control applications.',
  },
  'iso-3968': {
    title: 'ISO 3968 Filter Pressure Drop & Flow Test | ELIMFILTERS',
    description: 'Engineering reference for ISO 3968 pressure-drop and flow characteristics of hydraulic fluid power filters, including application interpretation.',
  },
  'sae-j726': {
    title: 'SAE J726 Air Cleaner Test Method | ELIMFILTERS',
    description: 'Engineering reference for SAE J726 air-cleaner testing, restriction, dust capacity, efficiency and air-intake application context.',
  },
  'din-51524': {
    title: 'DIN 51524 Hydraulic Fluids Standard | ELIMFILTERS',
    description: 'Engineering reference for DIN 51524 hydraulic fluids, classification context, fluid requirements and filtration-related application considerations.',
  },
};

const CTR_1_METADATA: Record<string, { title: string; description: string }> = {
  'iso-12937': {
    title: "ISO 12937: What Water-in-Oil Test Results Mean",
    description: "Interpret ISO 12937 water-in-oil results: what ppm means, how to assess action limits and how this Karl Fischer standard compares with ASTM D6304.",
  },
  'sae-j1858': {
    title: "SAE J1858: Selecting a Full-Flow Engine Oil Filter",
    description: "Selecting a full-flow oil filter? Understand SAE J1858 performance requirements and test methods for filters used in diesel and gasoline engines.",
  },
  'astm-d6304': {
    title: "ASTM D6304: Karl Fischer Water Test Method Explained",
    description: "Understand the ASTM D6304 coulometric Karl Fischer test for water in petroleum products: what the method measures and how it compares with ISO 12937.",
  },
};

export function generateStaticParams() {
  return [
    ...KC_STANDARDS.map((s) => ({ standard: s.slug })),
    ...Object.keys(STANDARD_ALIASES).map((standard) => ({ standard })),
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ standard: string }> }): Promise<Metadata> {
  const { standard } = await params;
  const resolvedSlug = resolveStandardSlug(standard);
  const std = KC_STANDARDS.find((s) => s.slug === resolvedSlug);
  if (!std) return {};

  const isAlias = resolvedSlug !== standard;
  const url = `https://elimfilters.com/knowledge-center/standards/${resolvedSlug}/`;
  const override = SEO_OVERRIDES[resolvedSlug];
  const title = isAlias ? `${standard.toUpperCase()} Legacy Standard` : override?.title || `${std.code}: ${std.title}`;
  const description = isAlias
    ? `Legacy standards route. Continue to the current ${std.code} ELIMFILTERS reference.`
    : override?.description || std.metaDescription;

  return {
    title: !isAlias ? CTR_1_METADATA[resolvedSlug]?.title ?? title : title,
    description: !isAlias ? CTR_1_METADATA[resolvedSlug]?.description ?? description : description,
    alternates: !isAlias && (TRANSLATED_STANDARD_SLUGS as readonly string[]).includes(resolvedSlug)
      ? { canonical: url, languages: languageAlternates(`/knowledge-center/standards/${resolvedSlug}`) }
      : { canonical: url },
    robots: isAlias ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url,
      type: 'article',
    },
  };
}

export default async function StandardPage({ params }: { params: Promise<{ standard: string }> }) {
  const { standard } = await params;
  const resolvedSlug = resolveStandardSlug(standard);
  const std = KC_STANDARDS.find((s) => s.slug === resolvedSlug);
  if (!std) return notFound();

  if (resolvedSlug !== standard) {
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

  return (
    <>
      <StandardContent std={std} />
      <StandardApplyCta />
    </>
  );
}
