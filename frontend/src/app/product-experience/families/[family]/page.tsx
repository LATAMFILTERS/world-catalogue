import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PEP_FAMILIES, PEP_SYSTEMS, getPEPFamily, getSystemByFamily } from '@/lib/pep-data';
import FamilyCenterContent from './FamilyCenterContent';

interface Props {
  params: { family: string };
}

export function generateStaticParams() {
  return PEP_FAMILIES.map((f) => ({ family: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const family = getPEPFamily(params.family);
  if (!family) return { title: 'Not Found' };
  const system = getSystemByFamily(params.family);
  return {
    title: `${family.name} | Product Family Center | ELIMFILTERS`,
    description: family.purpose.slice(0, 160),
    alternates: {
      canonical: `https://elimfilters.com/product-experience/families/${family.slug}`,
    },
  };
}

export default function FamilyCenterPage({ params }: Props) {
  const family = getPEPFamily(params.family);
  if (!family) notFound();

  const system = getSystemByFamily(params.family);
  if (!system) notFound();

  const currentIndex = PEP_FAMILIES.findIndex((f) => f.slug === family.slug);
  const familiesInSystem = PEP_FAMILIES.filter((f) => f.systemSlug === system.slug);
  const currentInSystem = familiesInSystem.findIndex((f) => f.slug === family.slug);
  const prevInSystem = currentInSystem > 0 ? familiesInSystem[currentInSystem - 1] : null;
  const nextInSystem = currentInSystem < familiesInSystem.length - 1 ? familiesInSystem[currentInSystem + 1] : null;

  return (
    <FamilyCenterContent
      family={family}
      system={system}
      prev={prevInSystem}
      next={nextInSystem}
    />
  );
}
