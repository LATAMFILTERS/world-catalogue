import type { Metadata } from 'next';
import { KC_TECHNOLOGIES } from '@/lib/knowledge-center-data';
import { notFound } from 'next/navigation';
import TechContent from './TechContent';

const BASE_URL = 'https://elimfilters.com';

function knowledgeTechnologyUrl(slug: string) {
  return `${BASE_URL}/knowledge-center/technologies/${slug}/`;
}

function canonicalTechnologyEntityUrl(slug: string) {
  return `${BASE_URL}/technologies/${slug}/#technology`;
}

export function generateStaticParams() {
  return KC_TECHNOLOGIES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tech = KC_TECHNOLOGIES.find((t) => t.slug === slug);
  if (!tech) return {};

  const url = knowledgeTechnologyUrl(slug);
  return {
    title: `${tech.name} Filtration Technology`,
    description: tech.tagline,
    alternates: { canonical: url },
    openGraph: {
      title: `${tech.name} Filtration Technology | ELIMFILTERS`,
      description: tech.tagline,
      url,
      type: 'article',
      siteName: 'ELIMFILTERS',
    },
  };
}

export default async function TechPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tech = KC_TECHNOLOGIES.find((t) => t.slug === slug);
  if (!tech) return notFound();

  const url = knowledgeTechnologyUrl(slug);
  const technologyEntity = canonicalTechnologyEntityUrl(slug);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `${url}#article`,
    headline: tech.name,
    name: `${tech.name} Filtration Technology`,
    description: tech.tagline,
    url,
    mainEntityOfPage: url,
    about: {
      '@type': 'DefinedTerm',
      '@id': technologyEntity,
      name: tech.name,
      description: tech.tagline,
      inDefinedTermSet: `${BASE_URL}/technologies/`,
    },
    author: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'ELIMFILTERS',
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'ELIMFILTERS',
    },
    isPartOf: {
      '@type': 'CollectionPage',
      '@id': `${BASE_URL}/knowledge-center/#collection`,
      name: 'ELIMFILTERS Knowledge Center',
      url: `${BASE_URL}/knowledge-center/`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <TechContent tech={tech} />
    </>
  );
}
