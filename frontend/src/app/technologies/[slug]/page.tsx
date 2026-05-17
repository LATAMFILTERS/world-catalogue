import { catalogue, getSlug, getItemBySlug } from '@/lib/catalogue';
import { CategoryPage } from '@/components/CategoryPage';
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
    title: `${item.title} Technology | ELIMFILTERS World Catalogue`,
    description: item.description,
  };
}

export default function TechnologyPage({ params }: Props) {
  const item = getItemBySlug('technologies', params.slug);
  if (!item) return null;
  return <CategoryPage item={item} category="technologies" />;
}
