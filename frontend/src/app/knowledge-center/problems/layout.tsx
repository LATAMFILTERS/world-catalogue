import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Problem Graph — Industrial Equipment Failure Problems | ELIMFILTERS',
  description:
    'Knowledge Graph of 15 canonical industrial equipment failure problems caused by contamination. Each problem maps to contamination sources, affected components, and filtration technologies.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-center/problems/',
  },
};

export default function ProblemsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
