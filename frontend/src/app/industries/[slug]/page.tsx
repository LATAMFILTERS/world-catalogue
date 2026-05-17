import { catalogue, getSlug, getItemBySlug } from '@/lib/catalogue';
import { CategoryPage } from '@/components/CategoryPage';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

// Map industry names to image and video paths
const industryMedia: Record<string, { image?: string; secondImage?: string; videos?: string[] }> = {
  'Agriculture': {
    image: '/images/agriculture.avif',
    secondImage: '/images/agriculture-2_converted.avif',
  },
  'Waste Municipal': {
    image: '/images/wasted.avif',
    secondImage: '/images/camion-bomberos.avif',
    videos: ['/images/wasted-2.mp4', '/images/bomberos.mp4'],
  },
  // Add more industries as images/videos are provided
};

export function generateStaticParams() {
  return catalogue.industries.map((item) => ({
    slug: getSlug(item.name),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = getItemBySlug('industries', params.slug);
  if (!item) return { title: 'Not Found' };
  return {
    title: `${item.name} Filtration | ELIMFILTERS World Catalogue`,
    description: item.description,
  };
}

export default function IndustryPage({ params }: Props) {
  const item = getItemBySlug('industries', params.slug);
  if (!item) return null;

  const media = industryMedia[item.name] || {};

  return (
    <CategoryPage
      item={item}
      category="industries"
      industryImage={media.image}
      industryVideos={media.videos}
    />
  );
}
