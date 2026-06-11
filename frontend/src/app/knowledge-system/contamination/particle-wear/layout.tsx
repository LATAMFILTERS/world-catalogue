import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Particle Wear in Engines — Contamination Control Engineering | ELIMFILTERS',
  },
  description: 'Particle-induced wear in engines: abrasive and adhesive wear mechanisms, ISO 4406 contamination codes, bearing life reduction, and filtration strategies to extend engine component lifespan.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/contamination/particle-wear/',
  },
  openGraph: {
    title: 'Particle Wear in Engines — Contamination Control Engineering | ELIMFILTERS',
    description: 'Particle-induced wear in engines: abrasive and adhesive wear mechanisms, ISO 4406 contamination codes, bearing life reduction, and filtration strategies to extend engine component lifespan.',
    url: 'https://elimfilters.com/knowledge-system/contamination/particle-wear/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Particle Wear in Engines — Contamination Control Engineering | ELIMFILTERS',
    description: 'Particle-induced wear in engines: abrasive and adhesive wear mechanisms, ISO 4406 contamination codes, bearing life reduction, and filtration strategies to extend engine component lifespan.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
