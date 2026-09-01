import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use | ELIMFILTERS',
  description: 'Terms governing access to and use of ELIMFILTERS digital properties, technical content, Product Intelligence and related services.',
  alternates: { canonical: 'https://elimfilters.com/legal/terms/' },
  robots: { index: true, follow: true },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
