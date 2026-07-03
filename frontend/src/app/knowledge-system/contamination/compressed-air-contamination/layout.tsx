import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Compressed Air Contamination — ISO 8573-1 Failure Modes | ELIMFILTERS',
  },
  description: 'Compressed air contamination: oil carryover, moisture ingress, and particulate contamination mechanisms in pneumatic systems, classified per ISO 8573-1.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/contamination/compressed-air-contamination/',
  },
  openGraph: {
    title: 'Compressed Air Contamination — ISO 8573-1 Failure Modes | ELIMFILTERS',
    description: 'Compressed air contamination: oil carryover, moisture ingress, and particulate contamination mechanisms in pneumatic systems, classified per ISO 8573-1.',
    url: 'https://elimfilters.com/knowledge-system/contamination/compressed-air-contamination/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compressed Air Contamination — ISO 8573-1 Failure Modes | ELIMFILTERS',
    description: 'Compressed air contamination: oil carryover, moisture ingress, and particulate contamination mechanisms in pneumatic systems, classified per ISO 8573-1.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
