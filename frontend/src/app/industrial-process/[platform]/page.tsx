import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { IndustrialProcessPlatformStablePage } from '@/components/IndustrialProcessPlatformStablePage';
import {
  INDUSTRIAL_PROCESS_PLATFORMS,
  getIndustrialProcessPlatform,
  industrialProcessPlatformUrl,
} from '@/lib/industrial-process-architecture';

interface Props { params: Promise<{ platform: string }>; }
const BASE_URL = 'https://elimfilters.com';

export function generateStaticParams() {
  return INDUSTRIAL_PROCESS_PLATFORMS.map((platform) => ({ platform: platform.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { platform: platformSlug } = await params;
  const platform = getIndustrialProcessPlatform(platformSlug);
  if (!platform) return { title: 'Not Found', robots: { index: false, follow: false } };
  const url = `${BASE_URL}${industrialProcessPlatformUrl(platform.slug)}`;
  const title = `${platform.name} ${platform.descriptor} | ELIMFILTERS`;
  return {
    title,
    description: platform.summary,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: platform.summary,
      url,
      type: 'website',
      siteName: 'ELIMFILTERS',
      images: [{ url: `${BASE_URL}${platform.mediaImage ?? platform.heroImage}`, width: 1200, height: 630, alt: `${platform.name} ${platform.descriptor}` }],
    },
    twitter: { card: 'summary_large_image', title, description: platform.summary, images: [`${BASE_URL}${platform.mediaImage ?? platform.heroImage}`] },
  };
}

export default async function IndustrialProcessPlatformRoute({ params }: Props) {
  const { platform: platformSlug } = await params;
  const platform = getIndustrialProcessPlatform(platformSlug);
  if (!platform) notFound();
  const url = `${BASE_URL}${industrialProcessPlatformUrl(platform.slug)}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#platform`,
    url,
    name: `${platform.name} — ${platform.descriptor}`,
    description: platform.summary,
    isPartOf: { '@id': `${BASE_URL}/#website` },
    publisher: { '@id': `${BASE_URL}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: platform.technologies.length,
      itemListElement: platform.technologies.map((technology, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: technology.name,
        url: `${BASE_URL}/industrial-process/${platform.slug}/${technology.slug}/`,
      })),
    },
  };
  const videoSchema = platform.heroVideo ? {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${url}#hero-video`,
    name: `${platform.name} — ${platform.descriptor}`,
    description: platform.summary,
    contentUrl: `${BASE_URL}${platform.heroVideo}`,
    thumbnailUrl: [`${BASE_URL}${platform.mediaImage ?? platform.heroImage}`],
    isPartOf: { '@id': `${url}#platform` },
    publisher: { '@id': `${BASE_URL}/#organization` },
  } : null;
  return (
    <>
      <Navigation />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {videoSchema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }} /> : null}
      <IndustrialProcessPlatformStablePage platform={platform} />
    </>
  );
}
