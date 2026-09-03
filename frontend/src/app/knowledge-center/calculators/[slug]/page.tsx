import { notFound } from 'next/navigation';
import { KC_CALCULATORS, getCalculatorBySlug } from '@/lib/knowledge-center-data';
import type { Metadata } from 'next';
import CalculatorContent from './CalculatorContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return KC_CALCULATORS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const calc = getCalculatorBySlug(slug);
  if (!calc) return {};
  return {
    title: `${calc.title} | ELIMFILTERS Knowledge Center`,
    description: calc.formula.standard + ' — ' + calc.description,
    alternates: { canonical: `https://elimfilters.com/knowledge-center/calculators/${calc.slug}/` },
  };
}

export default async function CalculatorPage({ params }: PageProps) {
  const { slug } = await params;
  const calc = getCalculatorBySlug(slug);
  if (!calc) notFound();
  return <CalculatorContent calc={calc} />;
}
