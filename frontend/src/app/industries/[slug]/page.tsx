import { catalogue, getSlug, getItemBySlug } from '@/lib/catalogue';
import { CategoryPage } from '@/components/CategoryPage';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

// Map industry names to image and video paths
const industryMedia: Record<string, { image?: string; video?: string }> = {
  'Agriculture': {
    image: '/images/agriculture.avif',
    video: '/images/Agriculture-2.mp4',
  },
  'Automotive': {
    image: '/images/autos-02.avif',
    video: '/images/Autos-Vin4.mp4',
  },
  'Bus Coach': {
    image: '/images/bus-hero.avif',
    video: '/images/buses-2.mp4',
  },
  'Construction': {
    image: '/images/construccion.avif',
    video: '/images/construction-2.mp4',
  },
  'Manufacturing': {
    image: '/images/manufacture.avif',
    video: '/images/Manufacture-1.mp4',
  },
  'Marine': {
    image: '/images/marine-2_converted.avif',
    video: '/images/Marino-1.mp4',
  },
  'Mining': {
    image: '/images/mineria.avif',
    video: '/images/Mina-Video-1.mp4',
  },
  'Oil Gas': {
    image: '/images/oil&gas.avif',
    video: '/images/Petro&Gas-1.mp4',
  },
  'Power Generation': {
    image: '/images/power-generator.avif',
    video: '/images/powergenerator-Video-1.mp4',
  },
  'Railway': {
    image: '/images/trenes.avif',
    video: '/images/train-2.mp4',
  },
  'Trucks Fleets': {
    image: '/images/trucks-1.avif',
    video: '/images/Trucks&Feel-1.mp4',
  },
  'Waste Municipal': {
    image: '/images/wasted.avif',
    video: '/images/wasted-2.mp4',
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
      industryVideo={media.video}
    />
  );
}
