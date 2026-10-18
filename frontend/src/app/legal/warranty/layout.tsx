import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: 'https://elimfilters.com/legal/warranty/' },
};

export default function PublicPageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
