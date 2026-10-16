import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Global Network — ELIMFILTERS Distributor & Logistics Partners',
  description: "The distributor partners and logistics operations supporting ELIMFILTERS international market presence and technical application support.",
  alternates: { canonical: 'https://elimfilters.com/about/who-we-are/network' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
