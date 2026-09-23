import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { IndustrialProcessTechnologyStablePage } from '@/components/IndustrialProcessTechnologyStablePage';
import {
  INDUSTRIAL_PROCESS_PLATFORMS,
  getIndustrialProcessPlatform,
  getIndustrialProcessTechnology,
  industrialProcessMetaDescription,
  industrialProcessTechnologyUrl,
} from '@/lib/industrial-process-architecture';

interface Props { params: Promise<{ platform: string; technology: string }>; }
const BASE_URL = 'https://elimfilters.com';

export function generateStaticParams() {
  return INDUSTRIAL_PROCESS_PLATFORMS.flatMap((platform) =>
    platform.technologies.map((technology) => ({ platform: platform.slug, technology: technology.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { platform: platformSlug, technology: technologySlug } = await params;
  const platform = getIndustrialProcessPlatform(platformSlug);
  const technology = getIndustrialProcessTechnology(platformSlug, technologySlug);
  if (!platform || !technology) return { title: 'Not Found', robots: { index: false, follow: false } };
  const url = `${BASE_URL}${industrialProcessTechnologyUrl(platform.slug, technology.slug)}`;
  const suffix = technology.name === technology.title ? '' : ` ${technology.title}`;
  const title = `${technology.name}${suffix} | ELIMFILTERS`;
  return {
    title,
    description: industrialProcessMetaDescription(technology.summary),
    alternates: { canonical: url },
    openGraph: {
      title,
      description: industrialProcessMetaDescription(technology.summary),
      url,
      type: 'article',
      siteName: 'ELIMFILTERS',
      images: [{ url: `${BASE_URL}${technology.mediaImage}`, width: 1200, height: 630, alt: `${technology.name} ${technology.title}` }],
    },
    twitter: { card: 'summary_large_image', title, description: industrialProcessMetaDescription(technology.summary), images: [`${BASE_URL}${technology.mediaImage}`] },
  };
}

export default async function IndustrialProcessTechnologyRoute({ params }: Props) {
  const { platform: platformSlug, technology: technologySlug } = await params;
  const platform = getIndustrialProcessPlatform(platformSlug);
  const technology = getIndustrialProcessTechnology(platformSlug, technologySlug);
  if (!platform || !technology) notFound();
  return (
    <>
      <Navigation />
      <IndustrialProcessTechnologyStablePage platform={platform} technology={technology} />
    </>
  );
}
