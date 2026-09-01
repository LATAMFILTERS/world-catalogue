import { listEntitiesWithProvenance } from '@/lib/services';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { FailureModeExplorerClient } from './FailureModeExplorerClient';

interface Props {
  params: Promise<{ entityId: string }>;
}

export function generateStaticParams() {
  return listEntitiesWithProvenance('FAILURE_MODE').map(({ node }) => ({ entityId: node.entityId }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { entityId } = await params;
  const entities = listEntitiesWithProvenance('FAILURE_MODE');
  const entry = entities.find(({ node }) => node.entityId === entityId);
  if (!entry) return {};
  return {
    title: `${entry.node.label} — Failure Mode Analysis | ELIMFILTERS`,
    description: `Engineering reference for ${entry.node.label}.`,
    alternates: { canonical: `https://elimfilters.com/engineering/failure-modes/${entityId}` },
  };
}

export default async function ExplorerPage({ params }: Props) {
  const { entityId } = await params;
  const entities = listEntitiesWithProvenance('FAILURE_MODE');
  const entry = entities.find(({ node }) => node.entityId === entityId);
  if (!entry) return notFound();
  return <FailureModeExplorerClient entityId={entityId} />;
}
