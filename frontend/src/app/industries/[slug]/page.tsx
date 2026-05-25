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
    video: '/images/Train.mp4',
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

const BASE_URL = 'https://elimfilters.com';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = getItemBySlug('industries', params.slug);
  if (!item) return { title: 'Not Found' };
  const url = `${BASE_URL}/industries/${params.slug}`;
  const title = item.title;
  return {
    title,
    description: item.description,
    keywords: [
      `${item.name.toLowerCase()} filtration`, `${item.name.toLowerCase()} filters`,
      `industrial filters ${item.name.toLowerCase()}`, 'ELIMFILTERS', 'asset protection filtration',
    ],
    alternates: {
      canonical: url,
      languages: { en: url, es: url, fr: url, it: url, nl: url, ru: url, zh: url, ja: url, ar: url, fa: url, pt: url },
    },
    openGraph: {
      title,
      description: item.description,
      url,
      type: 'website',
      siteName: 'ELIMFILTERS World Catalogue',
      images: [{ 
        url: industryMedia[item.name]?.image ? `https://elimfilters.com${industryMedia[item.name].image}` : 'https://elimfilters.com/assets/logo-elimfilters.png',
        width: 1200, 
        height: 630, 
        alt: `${item.name} Filtration Systems — ELIMFILTERS` 
      }],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: item.description,
      images: [industryMedia[item.name]?.image ? `https://elimfilters.com${industryMedia[item.name].image}` : 'https://elimfilters.com/assets/logo-elimfilters.png'],
    },
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
