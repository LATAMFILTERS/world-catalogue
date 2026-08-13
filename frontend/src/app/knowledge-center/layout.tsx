import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Industrial Filtration Engineering & Asset Protection Intelligence | ELIMFILTERS',
  description: 'ELIMFILTERS Knowledge Center: canonical engineering knowledge for filtration systems, contamination, standards, failure mechanisms, industrial applications, diagrams and controlled terminology.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: 'https://elimfilters.com/knowledge-center/',
    title: 'ELIMFILTERS Knowledge Center',
    description: 'Industrial Filtration Engineering & Asset Protection Intelligence.',
  },
};

export default function KnowledgeCenterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
