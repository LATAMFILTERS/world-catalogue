import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FPS — ELIMFILTERS Distributor Partner, Panama',
  description: 'FPS, one of the earliest ELIMFILTERS distributor partners in Panama during the company’s first years of continental expansion.',
  alternates: { canonical: 'https://elimfilters.com/about/who-we-are/network/fps' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
