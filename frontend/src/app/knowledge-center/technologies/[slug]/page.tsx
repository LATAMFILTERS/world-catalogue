import { KC_TECHNOLOGIES } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import TechContent from './TechContent';

export function generateStaticParams() {
  return KC_TECHNOLOGIES.map((t) => ({ slug: t.slug }));
}

export default function TechPage({ params }: { params: { slug: string } }) {
  const tech = KC_TECHNOLOGIES.find((t) => t.slug === params.slug);
  if (!tech) return notFound();
  return <TechContent tech={tech} />;
}
