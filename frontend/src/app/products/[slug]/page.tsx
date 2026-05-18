import { catalogue, getSlug, getItemBySlug } from '@/lib/catalogue';
import { CategoryPage } from '@/components/CategoryPage';
import { AirfilterPage } from '@/components/AirfilterPage';
import { AquaguardPage } from '@/components/AquaguardPage';
import { CabinPage } from '@/components/CabinPage';
import { CoolantPage } from '@/components/CoolantPage';
import { DryerPage } from '@/components/DryerPage';
import { FuelPage } from '@/components/FuelPage';
import { HousingPage } from '@/components/HousingPage';
import { HydraulicPage } from '@/components/HydraulicPage';
import { KitsPage } from '@/components/KitsPage';
import { MarinePage } from '@/components/MarinePage';
import { OilPage } from '@/components/OilPage';
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = getItemBySlug('products', params.slug);
  if (!item) return { title: 'Not Found' };
  return {
    title: `${item.name} Filter | ELIMFILTERS World Catalogue`,
    description: item.description,
  };
}

export default function ProductPage({ params }: Props) {
  const item = getItemBySlug('products', params.slug);
  if (!item) return null;

  if (item.name === 'Airfilter') return <AirfilterPage />;
  if (item.name === 'Aquaguard Series') return <AquaguardPage />;
  if (item.name === 'Cabin') return <CabinPage />;
  if (item.name === 'Coolant') return <CoolantPage />;
  if (item.name === 'Dryer') return <DryerPage />;
  if (item.name === 'Fuel') return <FuelPage />;
  if (item.name === 'Housing') return <HousingPage />;
  if (item.name === 'Hydraulic') return <HydraulicPage />;
  if (item.name === 'Kits') return <KitsPage />;
  if (item.name === 'Marine') return <MarinePage />;
  if (item.name === 'Oil') return <OilPage />;

  const media = productMedia[item.name] || {};

  return <CategoryPage item={item} category="products" industryImage={media.heroImage} />;
}
