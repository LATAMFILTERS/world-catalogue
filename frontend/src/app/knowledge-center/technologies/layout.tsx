import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-center/technologies',
  },
};

export default function TechnologiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
