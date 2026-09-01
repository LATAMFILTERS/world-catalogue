import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cross-Reference Data Policy | ELIMFILTERS',
  description: 'Policy governing ELIMFILTERS OEM and aftermarket cross-reference information, application validation and technical-use limitations.',
  alternates: { canonical: 'https://elimfilters.com/legal/cross-reference/' },
  robots: { index: true, follow: true },
};

export default function CrossReferenceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
