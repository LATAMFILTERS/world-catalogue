import { listEntitiesWithProvenance } from '@/lib/services';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { StandardExplorerClient } from './StandardExplorerClient';

interface Props {
  params: { entityId: string };
}

export function generateStaticParams() {
  return listEntitiesWithProvenance('STANDARD').map(({ node }) => ({ entityId: node.entityId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entities = listEntitiesWithProvenance('STANDARD');
  const entry = entities.find(({ node }) => node.entityId === params.entityId);
  if (!entry) return {};
  return {
    title: `${entry.node.label} — Standard Reference | ELIMFILTERS`,
    description: `Engineering reference for ${entry.node.label}.`,
    alternates: { canonical: `https://elimfilters.com/engineering/standards/${params.entityId}` },
  };
}

export default function ExplorerPage({ params }: Props) {
  const entities = listEntitiesWithProvenance('STANDARD');
  const entry = entities.find(({ node }) => node.entityId === params.entityId);
  if (!entry) return notFound();
  return <StandardExplorerClient entityId={params.entityId} />;
}
