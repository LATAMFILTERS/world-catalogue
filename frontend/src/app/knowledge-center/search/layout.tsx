import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Filtration Engineering Knowledge | ELIMFILTERS',
  description: 'Search ELIMFILTERS engineering articles, standards, technologies, systems, glossary terms, calculators, and technical resources.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/search/' },
};

export default function SearchLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
