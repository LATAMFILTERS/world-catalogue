import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'COLSAISA — ELIMFILTERS Distributor Partner, Colombia',
  description: 'COLSAISA, wholesale distributor partner that carried ELIMFILTERS into the Colombian market during the company’s early continental expansion.',
  alternates: { canonical: 'https://elimfilters.com/about/who-we-are/network/colsaisa' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
