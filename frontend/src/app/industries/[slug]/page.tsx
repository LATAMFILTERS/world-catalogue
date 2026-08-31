import { catalogue, getSlug, getItemBySlug } from '@/lib/catalogue';
import { CategoryPage } from '@/components/CategoryPage';
import { MiningIndustryPageV2 } from '@/components/MiningIndustryPageV2';
import { AgricultureIndustryPage } from '@/components/AgricultureIndustryPage';
import { ConstructionIndustryPage } from '@/components/ConstructionIndustryPage';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

const BASE_URL = 'https://elimfilters.com';

const industryMedia: Record<string, { image?: string; video?: string }> = {
  Agriculture: { image: '/images/agriculture-2_converted.avif', video: '/images/Agriculture-2.mp4' },
  Automotive: { image: '/images/autos-02.avif', video: '/images/Autos-Vin4.mp4' },
  'Bus Coach': { image: '/images/bus-hero.avif', video: '/images/buses-2.mp4' },
  Construction: { image: '/images/construccion.avif', video: '/images/construction-2.mp4' },
  Manufacturing: { image: '/images/manufacture.avif', video: '/images/Manufacture-1.mp4' },
  Marine: { image: '/images/marine-2_converted.avif', video: '/images/Marino-1.mp4' },
  Mining: { image: '/images/mineria.avif', video: '/images/Mina-Video-1.mp4' },
  'Oil Gas': { image: '/images/oil&gas.avif', video: '/images/Petro&Gas-1.mp4' },
  'Power Generation': { image: '/images/power-generator.avif', video: '/images/powergenerator-Video-1.mp4' },
  Railway: { image: '/images/trenes.avif', video: '/images/Train.mp4' },
  'Trucks Fleets': { image: '/images/trucks-1.avif', video: '/images/Trucks&Feel-1.mp4' },
  'Waste Municipal': { image: '/images/wasted.avif', video: '/images/wasted-2.mp4' },
};

const industryMetaDescription: Record<string, string> = {
  Agriculture: 'Agricultural filtration systems for tractors, combines, harvesters, sprayers, irrigation engines and field support equipment operating in soil dust, crop residue, heat and seasonal duty cycles.',
  Automotive: 'Asset-protection and contamination-control architecture for passenger vehicles, light commercial vehicles, delivery fleets, engines, fuel systems, lubrication circuits and cabin environments.',
  'Bus Coach': 'Asset-protection and contamination-control architecture for transit buses, school buses, coaches and passenger fleets operating under stop-and-go duty, urban particulate exposure and extended daily service.',
  Construction: 'Construction filtration systems for excavators, loaders, dozers, graders, compactors and articulated dump trucks operating in abrasive dust, hydraulic load, vibration and severe off-road duty.',
  Manufacturing: 'Asset-protection and contamination-control architecture for industrial engines, hydraulic power units, compressors, pumps and production equipment operating under continuous plant duty.',
  Marine: 'Asset-protection and contamination-control architecture for commercial vessels, workboats, marine engines and onboard equipment operating under moisture, salt atmosphere and extended marine duty.',
  Mining: 'Mining filtration systems for haul trucks, excavators, loaders, drill rigs and support equipment. Control air, fuel, lubrication and hydraulic contamination in severe-duty mining environments.',
  'Oil Gas': 'Asset-protection and contamination-control architecture for oil and gas equipment, engines, pumps, compressors and hydraulic assets operating in demanding energy environments.',
  'Power Generation': 'Asset-protection and contamination-control architecture for standby generators, prime power systems and industrial engine-driven generation equipment.',
  Railway: 'Asset-protection and contamination-control architecture for locomotives, auxiliary engines, pneumatic systems and railway support equipment operating under vibration and long duty cycles.',
  'Trucks Fleets': 'Asset-protection and contamination-control architecture for heavy-duty trucks, commercial fleets, diesel engines, fuel systems, lubrication circuits, cooling systems and cabin environments.',
  'Waste Municipal': 'Asset-protection and contamination-control architecture for refuse trucks, municipal service fleets, utility vehicles and public-works equipment operating under repeated urban duty cycles.',
};

export function generateStaticParams() {
  return catalogue.industries.map((item) => ({ slug: getSlug(item.name) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = getItemBySlug('industries', params.slug);
  if (!item) {
    return {
      title: 'Industry Not Found | ELIMFILTERS',
      robots: { index: false, follow: false },
    };
  }

  const url = `${BASE_URL}/industries/${params.slug}/`;
  const description = industryMetaDescription[item.name] || item.description;
  const title = item.name === 'Mining'
    ? 'Mining Filtration Systems | Heavy-Duty Equipment | ELIMFILTERS'
    : item.name === 'Agriculture'
      ? 'Agricultural Filtration Systems | Tractors & Combines | ELIMFILTERS'
      : item.name === 'Construction'
        ? 'Construction Filtration Systems | Heavy Equipment | ELIMFILTERS'
        : `${item.title} | ELIMFILTERS Asset Protection`;
  const image = industryMedia[item.name]?.image
    ? `${BASE_URL}${industryMedia[item.name].image}`
    : `${BASE_URL}/assets/logo-elimfilters.png`;

  return {
    title,
    description,
    keywords: [
      `${item.name.toLowerCase()} filtration`,
      `${item.name.toLowerCase()} asset protection`,
      `${item.name.toLowerCase()} contamination control`,
      'ELIMFILTERS',
      'industrial filtration engineering',
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'ELIMFILTERS',
      images: [{ url: image, width: 1200, height: 630, alt: `${item.title} — ELIMFILTERS` }],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default function IndustryPage({ params }: Props) {
  const item = getItemBySlug('industries', params.slug);
  if (!item) return null;

  if (item.name === 'Mining') {
    return <MiningIndustryPageV2 />;
  }

  if (item.name === 'Agriculture') {
    return <AgricultureIndustryPage />;
  }

  if (item.name === 'Construction') {
    return <ConstructionIndustryPage />;
  }

  const media = industryMedia[item.name] || {};
  const url = `${BASE_URL}/industries/${params.slug}/`;
  const description = industryMetaDescription[item.name] || item.description;

  const governedItem = {
    ...item,
    description,
    features: [
      'Application-specific contamination assessment',
      'Protection-system mapping by equipment duty',
      'Product identification through governed application evidence',
    ],
    benefits: [
      'Supports contamination-control planning around the protected asset',
      'Connects operating conditions to the appropriate protection system',
      'Keeps product and technology selection tied to documented application evidence',
    ],
    stats: {},
    cta: 'IDENTIFY THE APPLICATION PATH',
  };

  const governedGeo = {
    ctaTitle: `Identify the protection architecture for your ${item.name.toLowerCase()} application`,
    ctaDescription: 'Use the equipment, protected system, duty cycle and available application evidence to identify the appropriate ELIMFILTERS product and technology path.',
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${url}#industry-page`,
        name: item.title,
        url,
        description,
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        about: { '@type': 'Thing', name: `${item.name} industrial asset protection` },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: `${BASE_URL}/industries/` },
          { '@type': 'ListItem', position: 3, name: item.title, item: url },
        ],
      },
    ],
  };

  return (
    <CategoryPage
      item={governedItem}
      category="industries"
      industryImage={media.image}
      industryVideo={media.video}
      geoData={governedGeo}
    />
  );
}
