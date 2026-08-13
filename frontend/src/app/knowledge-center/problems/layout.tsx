import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Industrial Failure Engineering | ELIMFILTERS Knowledge Center',
  description: 'Failure mechanisms organized by contamination source, affected component, detection method and protection strategy.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/problems/' },
  robots: { index: true, follow: true },
};

export default function ProblemsLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
