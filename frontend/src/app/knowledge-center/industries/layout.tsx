import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-center/industries',
  },
};

export default function IndustriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
