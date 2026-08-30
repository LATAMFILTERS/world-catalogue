import { listEntitiesWithProvenance } from '@/lib/services';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PrincipleExplorerClient } from './PrincipleExplorerClient';

interface Props {
  params: { entityId: string };
}

export function generateStaticParams() {
  return listEntitiesWithProvenance('ENGINEERING_PRINCIPLE').map(({ node }) => ({ entityId: node.entityId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entities = listEntitiesWithProvenance('ENGINEERING_PRINCIPLE');
  const entry = entities.find(({ node }) => node.entityId === params.entityId);
  if (!entry) return {};
  return {
    title: `${entry.node.label} — Engineering Principle | ELIMFILTERS`,
    description: `Engineering reference for ${entry.node.label}.`,
    alternates: { canonical: `https://elimfilters.com/engineering/principles/${params.entityId}` },
  };
}

export default function ExplorerPage({ params }: Props) {
  const entities = listEntitiesWithProvenance('ENGINEERING_PRINCIPLE');
  const entry = entities.find(({ node }) => node.entityId === params.entityId);
  if (!entry) return notFound();
  return <PrincipleExplorerClient entityId={params.entityId} />;
}
