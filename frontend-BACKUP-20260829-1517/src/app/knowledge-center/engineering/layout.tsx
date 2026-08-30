import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Filtration Engineering Library | ELIMFILTERS',
  description: 'Engineering articles on contamination control, filtration science, asset protection, diagnostics, and industrial system reliability.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-center/engineering',
  },
};

export default function EngineeringLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
