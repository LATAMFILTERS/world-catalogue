import { KC_STANDARDS } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import StandardContent from './StandardContent';

export function generateStaticParams() {
  return KC_STANDARDS.map((s) => ({ standard: s.slug }));
}

export default function StandardPage({ params }: { params: { standard: string } }) {
  const std = KC_STANDARDS.find((s) => s.slug === params.standard);
  if (!std) return notFound();
  return <StandardContent std={std} />;
}
