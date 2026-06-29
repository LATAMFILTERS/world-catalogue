import type { Metadata } from 'next';
import { KC_STANDARDS } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import StandardContent from './StandardContent';

export function generateStaticParams() {
  return KC_STANDARDS.map((s) => ({ standard: s.slug }));
}

export async function generateMetadata({ params }: { params: { standard: string } }): Promise<Metadata> {
  const std = KC_STANDARDS.find((s) => s.slug === params.standard);
  if (!std) return {};
  return {
    alternates: {
      canonical: `https://elimfilters.com/knowledge-center/standards/${params.standard}`,
    },
  };
}

export default function StandardPage({ params }: { params: { standard: string } }) {
  const std = KC_STANDARDS.find((s) => s.slug === params.standard);
  if (!std) return notFound();
  return <StandardContent std={std} />;
}
