import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mercofilter — ELIMFILTERS Distributor Partner, Venezuela',
  description: 'Mercofilter, part of the founding network of ELIMFILTERS distributor partners in Venezuela.',
  alternates: { canonical: 'https://elimfilters.com/about/who-we-are/network/mercofilter' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
