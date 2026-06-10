import type { Metadata } from 'next';
import { catalogue, getSlug } from '@/lib/catalogue';

const displayNames: Record<string, string> = {
  'Airfilter': 'Air Filter',
  'Hydrocore Series': 'Turbine Fuel Separator',
  'Cabin': 'Cabin Filter',
  'Coolant': 'Coolant Filter',
  'Dryer': 'Air Dryer',
  'Fuel': 'Fuel Filter',
  'Housing': 'Housing Filter',
  'Hydraulic': 'Hydraulic Filter',
  'Kits': 'Filter Kits',
  'Marine': 'Marine Filter',
  'Oil': 'Oil Filter',
  'Water': 'Fuel Separator',
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = catalogue.products.find(p => getSlug(p.name) === params.slug);

  if (!product) {
    return {
      title: 'System Not Found',
      description: 'The requested filtration system was not found.',
    };
  }

  const displayName = displayNames[product.name] || product.name;
  const title = `${displayName} Filtration System | ELIMFILTERS®`;
  const description = product.description.substring(0, 160);

  return {
    title,
    description,
    keywords: [
      displayName.toLowerCase(),
      `${displayName.toLowerCase()} filtration`,
      'industrial filtration',
      'filter systems',
      'ELIMFILTERS®',
      ...(product.techTags || []).map(tag => tag.toLowerCase()),
    ],
    alternates: {
      canonical: `https://elimfilters.com/systems/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://elimfilters.com/systems/${params.slug}`,
      type: 'website',
      siteName: 'ELIMFILTERS® World Catalogue',
      images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
      locale: 'en_US',
    },
    twitter: {
      title,
      description,
      card: 'summary_large_image',
      images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
    },
  };
}

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
