import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Industrial Filtration Technical Library | ELIMFILTERS',
  description: 'Technical resources for filtration selection, maintenance strategy, fleet reliability, contamination control, and total cost of ownership.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/technical-library' },
};

export default function TechnicalLibraryLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
