import type { Metadata } from 'next';

const ARTICLE_REDIRECTS: Record<string, string> = {
  'diesel-fuel-filtration': '/knowledge-center/engineering/diesel-fuel-filtration/',
  'contamination-control': '/knowledge-center/engineering/contamination-control/',
  'dust-holding-capacity': '/knowledge-center/engineering/dust-holding-capacity/',
  'filter-media-engineering': '/knowledge-center/engineering/filter-media-engineering/',
  'filter-media-science': '/knowledge-center/engineering/filter-media-science/',
  'fluid-cleanliness': '/knowledge-center/engineering/fluid-cleanliness/',
  'hpcr-fuel-system-cleanliness': '/knowledge-center/engineering/hpcr-fuel-system-cleanliness/',
  'service-intervals': '/knowledge-center/engineering/service-intervals/',
  'testing-and-validation': '/knowledge-center/engineering/testing-and-validation/',
  'water-contamination-fuel': '/knowledge-center/engineering/water-contamination-fuel/',
  'total-cost-of-ownership': '/knowledge-center/engineering/total-cost-of-ownership/',
};

export function generateStaticParams() {
  return Object.keys(ARTICLE_REDIRECTS).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const destination = ARTICLE_REDIRECTS[params.slug] || '/knowledge-center/engineering/';
  return {
    title: 'Engineering Article | ELIMFILTERS',
    description: 'This article is available in the ELIMFILTERS engineering knowledge library.',
    alternates: { canonical: `https://elimfilters.com${destination}` },
  };
}

export default function LegacyArticlePage({ params }: { params: { slug: string } }) {
  const destination = ARTICLE_REDIRECTS[params.slug] || '/knowledge-center/engineering/';
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <script dangerouslySetInnerHTML={{ __html: `window.location.replace('${destination}');` }} />
      <meta httpEquiv="refresh" content={`0;url=${destination}`} />
      <section style={{ textAlign: 'center' }}>
        <h1>This engineering article has moved.</h1>
        <a href={destination}>Open current article</a>
      </section>
    </main>
  );
}
