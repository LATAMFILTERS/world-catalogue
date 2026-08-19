import type { ReactNode } from 'react';
import { ServerKnowledgeConnections } from '@/components/ServerKnowledgeConnections';
import './technology-detail.css';

export const dynamicParams = false;

export default function TechnologyLayout({ children, params }: { children: ReactNode; params: { slug: string } }) {
  return (
    <>
      <div className={`technology-detail technology-detail-${params.slug}`}>{children}</div>
      <ServerKnowledgeConnections kind="technology" slug={params.slug} />
    </>
  );
}
