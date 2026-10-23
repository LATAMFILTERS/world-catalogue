import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About ELIMFILTERS: Industrial & Heavy Equipment Filtration",
  description: "Meet ELIMFILTERS: filtration engineering for industry, heavy equipment and automotive applications, with private-label manufacturing and Americas distribution.",
  alternates: {
    canonical: 'https://elimfilters.com/about',
  },
  openGraph: {
    title: 'About ELIMFILTERS — Industrial Filtration Engineering & Asset Protection',
    description: "ELIMFILTERS integrates filtration technologies, engineering, specialized knowledge and digital technical intelligence in an international platform for protecting industrial assets, heavy equipment and automotive applications.",
    url: 'https://elimfilters.com/about',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About ELIMFILTERS',
    description: "ELIMFILTERS integrates filtration technologies, engineering, specialized knowledge and digital technical intelligence in an international platform for protecting industrial assets, heavy equipment and automotive applications.",
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
