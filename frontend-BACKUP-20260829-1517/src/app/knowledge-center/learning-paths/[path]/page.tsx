import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { KC_LEARNING_PATHS } from '@/lib/knowledge-center/learning-paths-registry';
import LearningPathContent from './LearningPathContent';

export function generateStaticParams() {
  return KC_LEARNING_PATHS.map((p) => ({ path: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ path: string }> }
): Promise<Metadata> {
  const { path: pathSlug } = await params;
  const lp = KC_LEARNING_PATHS.find((p) => p.slug === pathSlug);
  if (!lp) return {};
  return {
    title: `${lp.title} | ELIMFILTERS Knowledge Center`,
    description: lp.description,
  };
}

export default async function LearningPathPage(
  { params }: { params: Promise<{ path: string }> }
) {
  const { path: pathSlug } = await params;
  const lp = KC_LEARNING_PATHS.find((p) => p.slug === pathSlug);
  if (!lp) notFound();
  return <LearningPathContent path={lp} />;
}
