import type { Metadata } from 'next';
import Link from 'next/link';
import { catalogue, getSlug } from '@/lib/catalogue';
import SystemPageClient from './SystemPageClient';

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

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = catalogue.products.find(p => getSlug(p.name) === params.slug);
  if (!product) return {};
  const displayName = displayNames[product.name] || product.name;
  const desc = product.description.replace(/®|™/g, '').replace(/\s+/g, ' ').trim().slice(0, 155);
  return {
    title: `${displayName} Filtration System | ELIMFILTERS`,
    description: desc,
    alternates: { canonical: `https://elimfilters.com/systems/${params.slug}` },
    openGraph: {
      title: `${displayName} Filtration System | ELIMFILTERS`,
      description: desc,
      url: `https://elimfilters.com/systems/${params.slug}`,
      siteName: 'ELIMFILTERS',
      type: 'website',
    },
  };
}

export function generateStaticParams() {
  return catalogue.products.map(product => ({
    slug: getSlug(product.name),
  }));
}

export default function SystemPage({ params }: PageProps) {
  const product = catalogue.products.find(p => getSlug(p.name) === params.slug);

  if (!product) {
    return (
      <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>System Not Found</h1>
          <Link href="/systems" style={{ color: '#FFF12D', textDecoration: 'underline' }}>
            ← Back to Systems
          </Link>
        </div>
      </main>
    );
  }

  const systemCategories: Record<string, string[]> = {
    'Airfilter': ['Mining', 'Agriculture', 'Construction', 'Oil Gas'],
    'Hydrocore Series': ['Oil Gas', 'Marine', 'Power Generation'],
    'Cabin': ['Automotive', 'Bus Coach', 'Trucks Fleets'],
    'Coolant': ['Automotive', 'Manufacturing', 'Power Generation'],
    'Dryer': ['Manufacturing', 'Power Generation', 'Railway'],
    'Fuel': ['Trucks Fleets', 'Automotive', 'Oil Gas'],
    'Housing': ['Mining', 'Agriculture', 'Construction'],
    'Hydraulic': ['Construction', 'Manufacturing', 'Mining'],
    'Kits': ['Trucks Fleets', 'Automotive'],
    'Marine': ['Marine', 'Oil Gas'],
    'Oil': ['Trucks Fleets', 'Automotive', 'Power Generation'],
    'Water': ['Marine', 'Oil Gas', 'Power Generation'],
  };

  const displayName = displayNames[product.name] || product.name;
  const industries = systemCategories[product.name] || [];

  const breadcrumbData = [
    { position: 1, name: 'Home', item: 'https://elimfilters.com' },
    { position: 2, name: 'Systems', item: 'https://elimfilters.com/systems' },
    { position: 3, name: displayName, item: `https://elimfilters.com/systems/${params.slug}` },
  ];

  return (
    <>
      {/* JSON-LD Schemas */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbData,
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `${displayName} Filtration System`,
          description: product.description,
          url: `https://elimfilters.com/systems/${params.slug}`,
          datePublished: '2026-01-15',
          dateModified: '2026-05-25',
          author: { '@type': 'Organization', name: 'ELIMFILTERS' },
        })}
      </script>
      <SystemPageClient product={product} displayName={displayName} industries={industries} slug={params.slug} />
    </>
  );
}
