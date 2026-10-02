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
  return familyMetadata(slug, 'pt');
}

export default async function PortugueseFamilyPage({ params }: Props) {
  const { slug } = await params;
  return <FamilyPageView slug={slug} lang="pt" />;
}
