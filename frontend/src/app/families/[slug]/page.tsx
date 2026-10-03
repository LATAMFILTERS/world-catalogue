import type { Metadata } from 'next';
import { FamilyPageView, familyMetadata, familySlugs } from '@/components/FamilyPageView';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return familySlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return familyMetadata(slug, 'en');
}

export default async function FamilyPage({ params }: Props) {
  const { slug } = await params;
  return <FamilyPageView slug={slug} lang="en" />;
}
