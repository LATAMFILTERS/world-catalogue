import { catalogue, getSlug, getItemBySlug } from '@/lib/catalogue';
import { CategoryPage } from '@/components/CategoryPage';
import { AirfilterPage } from '@/components/AirfilterPage';
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

  // Use custom AirfilterPage for Airfilter product
  if (item.name === 'Airfilter') {
    return <AirfilterPage />;
  }

  const media = productMedia[item.name] || {};

  return <CategoryPage item={item} category="products" industryImage={media.heroImage} />;
}
