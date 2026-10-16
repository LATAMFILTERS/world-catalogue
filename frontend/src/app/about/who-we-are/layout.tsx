import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Who We Are — ELIMFILTERS Industrial Filtration Engineering',
  description: "ELIMFILTERS integrates filtration technologies, engineering, specialized knowledge and digital technical intelligence in an international platform for protecting industrial assets, heavy equipment and automotive applications.",
  alternates: { canonical: 'https://elimfilters.com/about/who-we-are' },
  openGraph: {
    title: 'Who We Are — ELIMFILTERS',
    description: "ELIMFILTERS integrates filtration technologies, engineering, specialized knowledge and digital technical intelligence in an international platform for protecting industrial assets, heavy equipment and automotive applications.",
    url: 'https://elimfilters.com/about/who-we-are',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
  },
};

export default function WhoWeAreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
