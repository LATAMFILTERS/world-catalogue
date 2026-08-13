import { CANONICAL_PUBLIC_SYSTEMS, CANONICAL_PUBLIC_SYSTEM_DETAILS } from '@/lib/public-systems';
import { notFound } from 'next/navigation';
import SystemContent from './SystemContent';

export function generateStaticParams() {
  return CANONICAL_PUBLIC_SYSTEMS.map((system) => ({ slug: system.slug }));
}

export default function SystemPage({ params }: { params: { slug: string } }) {
  const system = CANONICAL_PUBLIC_SYSTEMS.find((item) => item.slug === params.slug);
  if (!system) return notFound();
  const detail = CANONICAL_PUBLIC_SYSTEM_DETAILS[params.slug] ?? null;
  return <SystemContent system={system} detail={detail} />;
}
