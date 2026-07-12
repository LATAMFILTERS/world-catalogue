import type { ReactNode } from 'react';
import { ServerKnowledgeConnections } from '@/components/ServerKnowledgeConnections';

export default function IndustryLayout({ children, params }: { children: ReactNode; params: { slug: string } }) {
  return <>{children}<ServerKnowledgeConnections kind="industry" slug={params.slug} /></>;
}
