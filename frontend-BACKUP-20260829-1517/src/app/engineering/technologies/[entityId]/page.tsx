import { listEntitiesWithProvenance } from '@/lib/services';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { TechnologyExplorerClient } from './TechnologyExplorerClient';

interface Props {
  params: { entityId: string };
}

export function generateStaticParams() {
  return listEntitiesWithProvenance('TECHNOLOGY_ARCHITECTURE').map(({ node }) => ({ entityId: node.entityId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entities = listEntitiesWithProvenance('TECHNOLOGY_ARCHITECTURE');
  const entry = entities.find(({ node }) => node.entityId === params.entityId);
  if (!entry) return {};
  return {
    title: `${entry.node.label} — Engineering Technology | ELIMFILTERS`,
    description: `Engineering analysis of ${entry.node.label}: contamination control mechanism, applicable standards, and failure modes prevented.`,
    alternates: { canonical: `https://elimfilters.com/engineering/technologies/${params.entityId}` },
  };
}

export default function TechnologyExplorerPage({ params }: Props) {
  const entities = listEntitiesWithProvenance('TECHNOLOGY_ARCHITECTURE');
  const entry = entities.find(({ node }) => node.entityId === params.entityId);
  if (!entry) return notFound();
  return <TechnologyExplorerClient entityId={params.entityId} label={entry.node.label} />;
}
