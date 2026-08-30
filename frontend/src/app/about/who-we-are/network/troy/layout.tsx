import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TROY — ELIMFILTERS Exclusive Distributor, Dominican Republic',
  description: 'TROY, the exclusive ELIMFILTERS distributor for the Dominican Republic as the company extended its network into the Caribbean.',
  alternates: { canonical: 'https://elimfilters.com/about/who-we-are/network/troy' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
