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

interface GeoData {
  directAnswer: string;
  faq: { q: string; a: string }[];
  lastUpdated: string;
  schemas: object[];
}

const industryGeoData: Record<string, GeoData> = {
  'Agriculture': {
    lastUpdated: 'May 2026',
    directAnswer: 'ELIMFILTERS agricultural asset protection systems are engineered for tractors, combine harvesters, and self-propelled agricultural equipment operating in high-dust environments. During grain and corn harvest, ambient dust concentrations can exceed 1,500 mg/m³ — more than five times the 300 mg/m³ maximum defined in ISO 5011 air filter testing standards. Proprietary synthetic-cellulose protection media provides high contaminant retention capacity while maintaining sealing efficiency throughout extended service intervals. The system is designed to reduce contamination-related failures during critical harvest operations.',
    faq: [
      {
        q: 'What asset protection systems do combine harvesters require?',
        a: 'Combine harvesters require high-capacity air intake protection (MACROCORE™), hydraulic contamination control (NANOFORCE™), fuel system protection (AQUAGUARD™), and lube oil protection (SYNTRAX™). During grain harvest, dust concentrations can exceed 1,500 mg/m³ — more than five times ISO 5011 test limits. Each system must provide high contaminant retention capacity and complete sealing efficiency to prevent contamination events across 10–12 hour daily operating cycles.'
      },
      {
        q: 'Why do agricultural machines require specialized asset protection systems instead of standard OEM components?',
        a: 'Agricultural machines operate in environments with dust concentrations 5–10x higher than ISO 5011 test standards and temperatures ranging from -20°C to +55°C. Crop residue — chaff, grain dust, and pollen — creates multi-vector contamination across air intake, hydraulic, and fuel systems simultaneously. Standard OEM components are rated for controlled test conditions. Specialized agricultural asset protection systems use high-capacity synthetic-cellulose media, reinforced end caps, and extended service intervals engineered for continuous field operation.'
      },
      {
        q: 'How often should the air intake protection system be serviced during harvest season?',
        a: 'Air intake protection system service intervals depend on ambient dust concentration and daily operating hours. In standard conditions (under 500 mg/m³), ELIMFILTERS MACROCORE™ systems support 500–750 operating hour intervals. During heavy grain or cotton harvest (dust above 1,000 mg/m³), inspection at 250 hours and service at first restriction indicator activation is recommended. Service intervals should not be based on time alone — differential pressure monitoring is required to maintain sealing efficiency.'
      },
      {
        q: 'What does MACROCORE™ technology provide in agricultural asset protection applications?',
        a: 'MACROCORE™ is the primary air intake protection technology for high-dust agricultural environments. It combines a proprietary large-diameter cellulose-synthetic composite element with a radial seal design that maintains complete sealing efficiency under high particulate loads. In tractor and combine harvester applications, MACROCORE™ achieves 99.9% silica particle retention at dust concentrations exceeding 1,500 mg/m³. The oversized element geometry provides 40–60% more media surface area than standard OEM air intake components, enabling extended service intervals without efficiency degradation.'
      },
      {
        q: 'How does AQUAGUARD™ fuel system protection prevent water contamination failure?',
        a: 'AQUAGUARD™ is a turbine fuel separator system that removes free and emulsified water from diesel before it reaches high-pressure injection components. Agricultural diesel stored in field tanks accumulates water through condensation, particularly during temperature cycles between day and night operations. AQUAGUARD™ achieves 99.8% free water removal and 95% emulsified water reduction, protecting common-rail injectors from corrosion and stiction failure. A water collection bowl with automatic drain prevents bypass during water saturation events.'
      },
      {
        q: 'What are the financial consequences of contamination-related equipment failure during harvest?',
        a: 'Unplanned agricultural equipment downtime during harvest carries significant financial consequences due to narrow seasonal operating windows. Combine harvester downtime costs range from $2,000–$8,000 per day in lost harvesting capacity, depending on crop value and field size. Contamination-related engine failure requiring overhaul adds $15,000–$45,000 in parts and labor. Hydraulic system contamination (ISO 4406 cleanliness exceedances) causes proportional valve wear, with replacement costs of $3,000–$12,000 per valve bank. Effective contamination control eliminates the primary failure pathway driving these costs.'
      },
    ],
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Agricultural Asset Protection Systems',
        provider: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
        description: 'Agricultural asset protection systems engineered for tractors, combine harvesters, and self-propelled agricultural equipment operating in high-dust harvest environments with ambient dust concentrations exceeding 1,500 mg/m³.',
        areaServed: 'Global',
        serviceType: 'Industrial Contamination Control',
        dateModified: '2026-05-25',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
          { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://elimfilters.com/industries/' },
          { '@type': 'ListItem', position: 3, name: 'Agricultural Asset Protection Systems', item: 'https://elimfilters.com/industries/agriculture' },
        ],
      },
    ],
  },
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
  const description = item.name === 'Agriculture'
    ? 'Agricultural asset protection systems for tractors, combines, and harvesters operating in dust concentrations exceeding 1,500 mg/m³. Air intake, hydraulic, fuel, and lube oil protection engineered to ISO 5011 standards.'
    : item.description;
  return {
    title,
    description,
    keywords: [
      `${item.name.toLowerCase()} filtration`, `${item.name.toLowerCase()} filters`,
      `industrial filters ${item.name.toLowerCase()}`, 'ELIMFILTERS', 'asset protection filtration',
    ],
    alternates: {
      canonical: url,
      languages: { 'x-default': url, en: url, es: url, fr: url, it: url, nl: url, ru: url, zh: url, ja: url, ar: url, fa: url, pt: url },
    },
    openGraph: {
      title,
      description,
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
      description,
      images: [industryMedia[item.name]?.image ? `https://elimfilters.com${industryMedia[item.name].image}` : 'https://elimfilters.com/assets/logo-elimfilters.png'],
    },
  };
}

export default function IndustryPage({ params }: Props) {
  const item = getItemBySlug('industries', params.slug);
  if (!item) return null;

  const media = industryMedia[item.name] || {};
  const geoData = industryGeoData[item.name];

  return (
    <CategoryPage
      item={item}
      category="industries"
      industryImage={media.image}
      industryVideo={media.video}
      geoData={geoData}
    />
  );
}
