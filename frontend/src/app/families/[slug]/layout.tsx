import type { ReactNode } from 'react';
import { ServerKnowledgeConnections } from '@/components/ServerKnowledgeConnections';

export const dynamicParams = false;

export default async function FamilyLayout({ children, params }: { children: ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <>{children}<ServerKnowledgeConnections kind="family" slug={slug} /></>;
}
