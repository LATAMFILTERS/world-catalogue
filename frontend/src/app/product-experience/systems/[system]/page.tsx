import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PEP_SYSTEMS, getPEPSystem } from '@/lib/pep-data';
import ProtectionSystemContent from './ProtectionSystemContent';

interface Props {
  params: { system: string };
}

export function generateStaticParams() {
  return PEP_SYSTEMS.map((s) => ({ system: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const system = getPEPSystem(params.system);
  if (!system) return { title: 'Not Found' };
  return {
    title: `${system.name} | Engineering Center | ELIMFILTERS`,
    description: system.tagline,
    alternates: {
      canonical: `https://elimfilters.com/product-experience/systems/${system.slug}`,
    },
  };
}

export default function ProtectionSystemPage({ params }: Props) {
  const system = getPEPSystem(params.system);
  if (!system) notFound();

  const currentIndex = PEP_SYSTEMS.findIndex((s) => s.slug === system.slug);
  const prev = currentIndex > 0 ? PEP_SYSTEMS[currentIndex - 1] : null;
  const next = currentIndex < PEP_SYSTEMS.length - 1 ? PEP_SYSTEMS[currentIndex + 1] : null;

  return <ProtectionSystemContent system={system} prev={prev} next={next} />;
}
