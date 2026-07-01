import { listEntitiesWithProvenance } from '@/lib/services';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MediaExplorerClient } from './MediaExplorerClient';

interface Props {
  params: { entityId: string };
}

export function generateStaticParams() {
  return listEntitiesWithProvenance('PROTECTION_MEDIA').map(({ node }) => ({ entityId: node.entityId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entities = listEntitiesWithProvenance('PROTECTION_MEDIA');
  const entry = entities.find(({ node }) => node.entityId === params.entityId);
  if (!entry) return {};
  return {
    title: `${entry.node.label} — Protection Media | ELIMFILTERS`,
    description: `Engineering reference for ${entry.node.label}.`,
    alternates: { canonical: `https://elimfilters.com/engineering/media/${params.entityId}` },
  };
}

export default function ExplorerPage({ params }: Props) {
  const entities = listEntitiesWithProvenance('PROTECTION_MEDIA');
  const entry = entities.find(({ node }) => node.entityId === params.entityId);
  if (!entry) return notFound();
  return <MediaExplorerClient entityId={params.entityId} />;
}
