import { catalogue, getSlug, getItemBySlug } from '@/lib/catalogue';
import { CategoryPage } from '@/components/CategoryPage';
import { AirfilterPage } from '@/components/AirfilterPage';
import { HydrocorePage } from '@/components/HydrocorePage';
import { CabinPage } from '@/components/CabinPage';
import { CoolantPage } from '@/components/CoolantPage';
import { DryerPage } from '@/components/DryerPage';
import { FuelPage } from '@/components/FuelPage';
import { HousingPage } from '@/components/HousingPage';
import { HydraulicPage } from '@/components/HydraulicPage';
import { KitsPage } from '@/components/KitsPage';
import { MarinePage } from '@/components/MarinePage';
import { OilPage } from '@/components/OilPage';
import { FuelSeparatorPage } from '@/components/FuelSeparatorPage';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

// Map product names to image paths
const productMedia: Record<string, { image?: string; heroImage?: string }> = {
  'Airfilter': {
    image: '/images/air-filter1.avif',
    heroImage: '/images/air-filters-lab.avif',
  },
  // Add more products as images are provided
};

export function generateStaticParams() {
  return catalogue.products.map((item) => ({
    slug: getSlug(item.name),
  }));
}

const BASE_URL = 'https://elimfilters.com';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = getItemBySlug('products', params.slug);
  if (!item) return { title: 'Not Found' };
  const url = `${BASE_URL}/products/${params.slug}`;
  const title = `${item.name} Filter System | ELIMFILTERS®`;
  return {
    title,
    description: item.description,
    keywords: [
      `${item.name.toLowerCase()} filter`, `industrial ${item.name.toLowerCase()} filtration`,
      'ELIMFILTERS®', 'heavy duty filter', 'asset protection filtration',
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
      siteName: 'ELIMFILTERS® World Catalogue',
      images: [{ url: '/assets/logo-elimfilters.png', width: 800, height: 400, alt: `${item.name} Filter — ELIMFILTERS®` }],
    },
    twitter: { card: 'summary_large_image', title, description: item.description },
  };
}

export default function ProductPage({ params }: Props) {
  const item = getItemBySlug('products', params.slug);
  if (!item) return null;

  if (item.name === 'Airfilter') return <AirfilterPage />;
  if (item.name === 'Aquaguard Series') return <HydrocorePage />;
  if (item.name === 'Cabin') return <CabinPage />;
  if (item.name === 'Coolant') return <CoolantPage />;
  if (item.name === 'Dryer') return <DryerPage />;
  if (item.name === 'Fuel') return <FuelPage />;
  if (item.name === 'Housing') return <HousingPage />;
  if (item.name === 'Hydraulic') return <HydraulicPage />;
  if (item.name === 'Kits') return <KitsPage />;
  if (item.name === 'Marine') return <MarinePage />;
  if (item.name === 'Oil') return <OilPage />;
  if (item.name === 'Water') return <FuelSeparatorPage />;

  const media = productMedia[item.name] || {};

  return <CategoryPage item={item} category="products" industryImage={media.heroImage} />;
}
