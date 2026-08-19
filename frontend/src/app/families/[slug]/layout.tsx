import type { ReactNode } from 'react';
import { ServerKnowledgeConnections } from '@/components/ServerKnowledgeConnections';

export const dynamicParams = false;

export default function FamilyLayout({ children, params }: { children: ReactNode; params: { slug: string } }) {
  return <>{children}<ServerKnowledgeConnections kind="family" slug={params.slug} /></>;
}
