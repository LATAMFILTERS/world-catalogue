import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Who We Are — ELIMFILTERS Industrial Filtration Engineering',
  description: 'ELIMFILTERS is an industrial filtration engineering organization built around asset protection: application-based validation, system-level architecture, and a distributor-first commercial network.',
  alternates: { canonical: 'https://elimfilters.com/about/who-we-are' },
  openGraph: {
    title: 'Who We Are — ELIMFILTERS',
    description: 'Industrial filtration engineered around the asset. Four principles govern every ELIMFILTERS protection system.',
    url: 'https://elimfilters.com/about/who-we-are',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
  },
};

export default function WhoWeAreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
