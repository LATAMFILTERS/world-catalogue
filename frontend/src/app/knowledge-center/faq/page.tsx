import type { Metadata } from 'next';
import Link from 'next/link';
import { getFAQCategories, getFAQRegistry } from '@/lib/faq-registry';

const CANONICAL = 'https://elimfilters.com/knowledge-center/faq/';
const DESCRIPTION = 'Technical frequently asked questions on filtration, contamination control, maintenance, protection systems and ELIMFILTERS technologies.';

export const metadata: Metadata = {
  title: 'Technical FAQ — Filtration & Asset Protection | ELIMFILTERS',
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Technical FAQ — Filtration & Asset Protection | ELIMFILTERS',
    description: DESCRIPTION,
    url: CANONICAL,
    type: 'website',
    siteName: 'ELIMFILTERS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Technical FAQ — Filtration & Asset Protection | ELIMFILTERS',
    description: DESCRIPTION,
  },
};

export default function FAQHubPage() {
  const entries = getFAQRegistry();
  const categories = getFAQCategories();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${CANONICAL}#faqpage`,
    url: CANONICAL,
    name: 'ELIMFILTERS Technical FAQ',
    description: DESCRIPTION,
    isPartOf: { '@id': 'https://elimfilters.com/#website' },
    publisher: { '@id': 'https://elimfilters.com/#organization' },
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com/' },
      { '@type': 'ListItem', position: 2, name: 'Knowledge Center', item: 'https://elimfilters.com/knowledge-center/' },
      { '@type': 'ListItem', position: 3, name: 'Technical FAQ', item: CANONICAL },
    ],
  };

  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="border-b border-neutral-200 bg-neutral-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-neutral-400">
            <Link href="/knowledge-center/" className="hover:text-white">Knowledge Center</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Technical FAQ</span>
          </nav>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-yellow-400">Engineering knowledge</p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">Technical Frequently Asked Questions</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-300">
            One governed reference for recurring questions across protection systems, filtration technologies, contamination control and maintenance. Individual pages continue to show only the questions relevant to their subject.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-neutral-300">
            <span className="border border-neutral-700 px-3 py-2">{entries.length} governed questions</span>
            <span className="border border-neutral-700 px-3 py-2">5 protection systems</span>
            <span className="border border-neutral-700 px-3 py-2">9 technologies</span>
            <span className="border border-neutral-700 px-3 py-2">Search-demand signals included</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="mb-12 grid gap-6 border-b border-neutral-200 pb-10 md:grid-cols-3">
          <div>
            <h2 className="text-lg font-semibold">How this page is governed</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">Questions are aggregated from approved system and technology editorial sources plus validated search-demand topics.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">How page-level FAQ works</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">A system or technology page keeps only its context-specific questions. This hub provides the complete cross-site reference without forcing unrelated FAQ onto every page.</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold">How updates are handled</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">New search questions may be added only after the answer is supported by approved technical knowledge. Unsupported performance, certification or universal service claims are excluded.</p>
          </div>
        </div>

        <nav aria-label="FAQ categories" className="mb-14 flex flex-wrap gap-2">
          {categories.map(({ category }) => (
            <a key={category} href={`#${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="border border-neutral-300 px-3 py-2 text-sm font-medium hover:border-neutral-950">
              {category}
            </a>
          ))}
        </nav>

        <div className="space-y-16">
          {categories.map(({ category, entries: categoryEntries }) => {
            const id = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return (
              <section key={category} id={id} className="scroll-mt-24">
                <div className="mb-6 flex items-end justify-between gap-4 border-b border-neutral-900 pb-3">
                  <h2 className="text-2xl font-semibold tracking-tight">{category}</h2>
                  <span className="text-sm text-neutral-500">{categoryEntries.length} questions</span>
                </div>
                <div className="divide-y divide-neutral-200 border-y border-neutral-200">
                  {categoryEntries.map((entry) => (
                    <details key={entry.id} className="group py-5">
                      <summary className="cursor-pointer list-none pr-8 text-base font-semibold leading-7 marker:hidden">
                        {entry.question}
                      </summary>
                      <div className="mt-3 max-w-4xl text-sm leading-7 text-neutral-700">
                        <p>{entry.answer}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                          <span>{entry.topic}</span>
                          <span aria-hidden="true">·</span>
                          <Link href={entry.sourceHref} className="font-medium text-neutral-800 underline underline-offset-4 hover:text-black">Related technical context</Link>
                          {entry.demandSignal === 'gsc-observed' ? (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>Observed search demand</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
}
