import type { Metadata } from 'next';
import { KC_SYSTEMS, KC_SYSTEM_DETAILS } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import SystemContent from './SystemContent';

export function generateStaticParams() {
  return KC_SYSTEMS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const system = KC_SYSTEMS.find((s) => s.slug === params.slug);
  if (!system) return {};
  return {
    alternates: {
      canonical: `https://elimfilters.com/knowledge-center/systems/${params.slug}`,
    },
  };
}

export default function SystemPage({ params }: { params: { slug: string } }) {
  const system = KC_SYSTEMS.find((s) => s.slug === params.slug);
  if (!system) return notFound();
  const detail = KC_SYSTEM_DETAILS[params.slug] ?? null;
  return <SystemContent system={system} detail={detail} />;
}
