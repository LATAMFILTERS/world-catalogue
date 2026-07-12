import type { ReactNode } from 'react';
import { ServerKnowledgeConnections } from '@/components/ServerKnowledgeConnections';

export default function FamilyLayout({ children, params }: { children: ReactNode; params: { slug: string } }) {
  return <>{children}<ServerKnowledgeConnections kind="family" slug={params.slug} /></>;
}
