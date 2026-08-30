import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Global Network — ELIMFILTERS Distributor & Logistics Partners',
  description: 'The distributor partners and logistics operations behind ELIMFILTERS’ international expansion across Panama, Colombia, the Dominican Republic, Venezuela, and China.',
  alternates: { canonical: 'https://elimfilters.com/about/who-we-are/network' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
