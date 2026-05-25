import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Industrial Filtration Knowledge Base | ELIMFILTERS',
  description: 'Deep technical resources on filtration science, ISO standards, contamination control, fleet maintenance, and OEM comparison — built for engineers and procurement teams.',
  openGraph: {
    title: 'Industrial Filtration Knowledge Base | ELIMFILTERS',
    description: 'Deep technical resources on filtration science, ISO standards, contamination control, and fleet optimization.',
    url: 'https://elimfilters.com/knowledge-system/',
    type: 'website',
  },
  twitter: {
    title: 'Industrial Filtration Knowledge Base',
    description: 'Deep technical resources on filtration science, ISO standards, contamination control, and fleet optimization.',
  },
};

export default function KnowledgeSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
