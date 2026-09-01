import type { ReactNode } from 'react';
import { ServerKnowledgeConnections } from '@/components/ServerKnowledgeConnections';
import './technology-detail.css';

export const dynamicParams = false;

export default async function TechnologyLayout({ children, params }: { children: ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <>
      <div className={`technology-detail technology-detail-${slug}`}>{children}</div>
      <ServerKnowledgeConnections kind="technology" slug={slug} />
    </>
  );
}
