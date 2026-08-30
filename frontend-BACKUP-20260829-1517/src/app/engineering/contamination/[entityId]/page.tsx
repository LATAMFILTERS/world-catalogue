import { listEntitiesWithProvenance } from '@/lib/services';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ContaminationExplorerClient } from './ContaminationExplorerClient';

interface Props {
  params: { entityId: string };
}

export function generateStaticParams() {
  return listEntitiesWithProvenance('CONTAMINATION').map(({ node }) => ({ entityId: node.entityId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entities = listEntitiesWithProvenance('CONTAMINATION');
  const entry = entities.find(({ node }) => node.entityId === params.entityId);
  if (!entry) return {};
  return {
    title: `${entry.node.label} — Contamination Analysis | ELIMFILTERS`,
    description: `Engineering reference for ${entry.node.label}.`,
    alternates: { canonical: `https://elimfilters.com/engineering/contamination/${params.entityId}` },
  };
}

export default function ExplorerPage({ params }: Props) {
  const entities = listEntitiesWithProvenance('CONTAMINATION');
  const entry = entities.find(({ node }) => node.entityId === params.entityId);
  if (!entry) return notFound();
  return <ContaminationExplorerClient entityId={params.entityId} />;
}
