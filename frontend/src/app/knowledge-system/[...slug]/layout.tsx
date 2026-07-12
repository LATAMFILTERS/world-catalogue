import type { ReactNode } from 'react';
import { ServerKnowledgeConnections } from '@/components/ServerKnowledgeConnections';

export default function KnowledgeDetailLayout({ children, params }: { children: ReactNode; params: { slug: string[] } }) {
  const [section, detail] = params.slug;
  const kind = section === 'standards' && detail ? 'standard' : section === 'contamination' && detail ? 'failure' : null;
  return <>{children}{kind && detail ? <ServerKnowledgeConnections kind={kind} slug={detail} /> : null}</>;
}
