import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Problem Graph — Industrial Equipment Failure Problems | ELIMFILTERS',
  description: 'Internal problem graph under engineering validation. Published technical problem pages are withheld from indexing until evidence review is complete.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/problems/' },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function ProblemsLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
