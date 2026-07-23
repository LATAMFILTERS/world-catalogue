import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Filtration Standards Library | ELIMFILTERS',
  description: 'Technical guidance for ISO, SAE, ASTM, DIN, NFPA, and related filtration and contamination-control standards.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-center/standards',
  },
};

export default function StandardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
