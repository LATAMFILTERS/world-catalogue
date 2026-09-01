import type { ReactNode } from 'react';
import { ServerKnowledgeConnections } from '@/components/ServerKnowledgeConnections';

export default async function KnowledgeDetailLayout({ children, params }: { children: ReactNode; params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const [section, detail] = slug;
  const kind = section === 'standards' && detail ? 'standard' : section === 'contamination' && detail ? 'failure' : null;
  return <>{children}{kind && detail ? <ServerKnowledgeConnections kind={kind} slug={detail} /> : null}</>;
}
