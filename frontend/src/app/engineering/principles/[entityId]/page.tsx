import { listEntitiesWithProvenance } from '@/lib/services';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PrincipleExplorerClient } from './PrincipleExplorerClient';

interface Props {
  params: Promise<{ entityId: string }>;
}

export function generateStaticParams() {
  return listEntitiesWithProvenance('ENGINEERING_PRINCIPLE').map(({ node }) => ({ entityId: node.entityId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { entityId } = await params;
  const entities = listEntitiesWithProvenance('ENGINEERING_PRINCIPLE');
  const entry = entities.find(({ node }) => node.entityId === entityId);
  if (!entry) return {};
  return {
    title: `${entry.node.label} — Engineering Principle | ELIMFILTERS`,
    description: `Engineering reference for ${entry.node.label}.`,
    alternates: { canonical: `https://elimfilters.com/engineering/principles/${entityId}` },
  };
}

export default async function ExplorerPage({ params }: Props) {
  const { entityId } = await params;
  const entities = listEntitiesWithProvenance('ENGINEERING_PRINCIPLE');
  const entry = entities.find(({ node }) => node.entityId === entityId);
  if (!entry) return notFound();
  return <PrincipleExplorerClient entityId={entityId} />;
}
