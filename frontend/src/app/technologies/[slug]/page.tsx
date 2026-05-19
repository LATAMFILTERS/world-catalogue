import { catalogue, getSlug, getItemBySlug } from '@/lib/catalogue';
import { CategoryPage } from '@/components/CategoryPage';
import { TechDetailPage } from '@/components/TechDetailPage';
import { TECH_PAGES } from './techPagesData';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return catalogue.technologies.map((item) => ({
    slug: getSlug(item.name),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = getItemBySlug('technologies', params.slug);
  if (!item) return { title: 'Not Found' };
  return {
    title: `${item.title} | ELIMFILTERS Technology`,
    description: item.description,
  };
}

export default function TechnologyPage({ params }: Props) {
  const item = getItemBySlug('technologies', params.slug);
  if (!item) return null;

  const slug = params.slug;

  // Aquaguard Series has its own dedicated product page
  // All other technologies use TechDetailPage if data exists, else CategoryPage fallback
  const techData = TECH_PAGES[slug];
  if (techData) {
    return <TechDetailPage data={techData} />;
  }

  // Fallback for any technology without a dedicated page
  return <CategoryPage item={item} category="technologies" />;
}
