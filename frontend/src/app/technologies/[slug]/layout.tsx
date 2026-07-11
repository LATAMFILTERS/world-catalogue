import type { ReactNode } from 'react';
import { ServerKnowledgeConnections } from '@/components/ServerKnowledgeConnections';

export default function TechnologyLayout({ children, params }: { children: ReactNode; params: { slug: string } }) {
  return <>{children}<ServerKnowledgeConnections kind="technology" slug={params.slug} /></>;
}
