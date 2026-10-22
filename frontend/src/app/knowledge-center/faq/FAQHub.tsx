import { PublicReferenceLink } from '@/components/PublicReferenceLink';
import type { Metadata } from 'next';
import Link from '@/components/LocalizedLink';
import { getFAQCategories, type FAQRegistryEntry } from '@/lib/faq-registry';
import { translatedFAQ } from '@/lib/knowledge-center-data/i18n/articles';
import { languageAlternates } from '@/lib/localized-routes';

type Lang = 'en' | 'es' | 'pt';

const COPY = {
  en: {
    title: 'Technical FAQ — Filtration & Asset Protection | ELIMFILTERS',
    description: 'Technical frequently asked questions on filtration, contamination control, maintenance, protection systems and ELIMFILTERS technologies.',
    schemaName: 'ELIMFILTERS Technical FAQ',
    home: 'Home', kc: 'Knowledge Center', crumb: 'Technical FAQ', eyebrow: 'Engineering knowledge',
    h1: 'Technical Frequently Asked Questions',
    intro: 'One governed reference for recurring questions across protection systems, filtration technologies, contamination control and maintenance. Individual pages continue to show only the questions relevant to their subject.',
    governed: 'governed questions', systems: '5 protection systems', technologies: '10 technologies', demand: 'Search-demand signals included',
    blocks: [
      ['How this page is governed', 'Questions are aggregated from approved system and technology editorial sources plus validated search-demand topics.'],
      ['How page-level FAQ works', 'A system or technology page keeps only its context-specific questions. This hub provides the complete cross-site reference without forcing unrelated FAQ onto every page.'],
      ['How updates are handled', 'New search questions may be added only after the answer is supported by approved technical knowledge. Unsupported performance, certification or universal service claims are excluded.'],
    ],
    nav: 'FAQ categories', questions: 'questions', context: 'Related technical context', observed: 'Observed search demand',
  },
  es: {
    title: 'Preguntas técnicas frecuentes sobre filtración y protección de activos | ELIMFILTERS',
    description: 'Preguntas técnicas frecuentes sobre filtración, control de contaminación, mantenimiento, sistemas de protección y tecnologías ELIMFILTERS.',
    schemaName: 'Preguntas técnicas frecuentes de ELIMFILTERS',
    home: 'Inicio', kc: 'Centro de Conocimiento', crumb: 'Preguntas técnicas frecuentes', eyebrow: 'Conocimiento de ingeniería',
    h1: 'Preguntas técnicas frecuentes',
    intro: 'Una referencia controlada para las preguntas recurrentes sobre sistemas de protección, tecnologías de filtración, control de contaminación y mantenimiento. Cada página sigue mostrando solo las preguntas relacionadas con su tema.',
    governed: 'preguntas controladas', systems: '5 sistemas de protección', technologies: '10 tecnologías', demand: 'Incluye señales de demanda de búsqueda',
    blocks: [
      ['Cómo se controla esta página', 'Las preguntas se reúnen a partir de las fuentes editoriales aprobadas de sistemas y tecnologías, más temas de demanda de búsqueda validados.'],
      ['Cómo funcionan las preguntas de cada página', 'Una página de sistema o de tecnología conserva solo las preguntas de su contexto. Este centro ofrece la referencia completa de todo el sitio sin imponer preguntas ajenas en cada página.'],
      ['Cómo se manejan las actualizaciones', 'Solo se agregan nuevas preguntas de búsqueda cuando la respuesta está respaldada por conocimiento técnico aprobado. Se excluyen las afirmaciones sin respaldo sobre desempeño, certificación o servicio universal.'],
    ],
    nav: 'Categorías de preguntas', questions: 'preguntas', context: 'Contexto técnico relacionado', observed: 'Demanda de búsqueda observada',
  },
  pt: {
    title: 'Perguntas técnicas frequentes sobre filtração e proteção de ativos | ELIMFILTERS',
    description: 'Perguntas técnicas frequentes sobre filtração, controle de contaminação, manutenção, sistemas de proteção e tecnologias ELIMFILTERS.',
    schemaName: 'Perguntas técnicas frequentes da ELIMFILTERS',
    home: 'Início', kc: 'Centro de Conhecimento', crumb: 'Perguntas técnicas frequentes', eyebrow: 'Conhecimento de engenharia',
    h1: 'Perguntas técnicas frequentes',
    intro: 'Uma referência controlada para as perguntas recorrentes sobre sistemas de proteção, tecnologias de filtração, controle de contaminação e manutenção. Cada página continua mostrando apenas as perguntas relacionadas ao seu tema.',
    governed: 'perguntas controladas', systems: '5 sistemas de proteção', technologies: '10 tecnologias', demand: 'Inclui sinais de demanda de busca',
    blocks: [
      ['Como esta página é controlada', 'As perguntas são reunidas a partir das fontes editoriais aprovadas de sistemas e tecnologias, mais temas de demanda de busca validados.'],
      ['Como funcionam as perguntas de cada página', 'Uma página de sistema ou de tecnologia mantém apenas as perguntas do seu contexto. Este centro oferece a referência completa de todo o site sem impor perguntas alheias a cada página.'],
      ['Como as atualizações são tratadas', 'Novas perguntas de busca só são adicionadas quando a resposta é sustentada por conhecimento técnico aprovado. Afirmações sem respaldo sobre desempenho, certificação ou serviço universal são excluídas.'],
    ],
    nav: 'Categorias de perguntas', questions: 'perguntas', context: 'Contexto técnico relacionado', observed: 'Demanda de busca observada',
  },
} as const;

const root = (lang: Lang) => `https://elimfilters.com/${lang === 'en' ? '' : `${lang}/`}`;
const canonical = (lang: Lang) => `${root(lang)}knowledge-center/faq/`;
// Anchors stay English in every language so shared #links keep working.
const anchor = (category: string) => category.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export function faqMetadata(lang: Lang): Metadata {
  const { title, description } = COPY[lang];
  const url = canonical(lang);
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates('/knowledge-center/faq') },
    robots: { index: true, follow: true },
    openGraph: { title, description, url, type: 'website', siteName: 'ELIMFILTERS', ...(lang === 'en' ? {} : { locale: lang === 'es' ? 'es_419' : 'pt_BR' }) },
    twitter: { card: 'summary_large_image', title, description },
  };
}

/** Registry grouped by category, with question, answer, topic and category label from the reviewed translation. */
export function localizedFAQCategories(lang: Lang): Array<{ category: string; label: string; entries: FAQRegistryEntry[] }> {
  const categories = getFAQCategories();
  if (lang === 'en') return categories.map((group) => ({ ...group, label: group.category }));
  const tr = translatedFAQ(lang);
  return categories.map(({ category, entries }) => ({
    category,
    label: tr.categories[category] ?? category,
    entries: entries.map((entry) => ({ ...entry, ...tr.questions[entry.id], topic: tr.topics[entry.topic] ?? entry.topic })),
  }));
}

export default function FAQHub({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const url = canonical(lang);
  const categories = localizedFAQCategories(lang);
  const entries = categories.flatMap((group) => group.entries);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faqpage`,
    url,
    name: t.schemaName,
    description: t.description,
    ...(lang === 'en' ? {} : { inLanguage: lang }),
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
      { '@type': 'ListItem', position: 1, name: t.home, item: root(lang) },
      { '@type': 'ListItem', position: 2, name: t.kc, item: `${root(lang)}knowledge-center/` },
      { '@type': 'ListItem', position: 3, name: t.crumb, item: url },
    ],
  };

  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <section className="border-b border-neutral-200 bg-neutral-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-neutral-400">
            <Link href="/knowledge-center/" className="hover:text-white">{t.kc}</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{t.crumb}</span>
          </nav>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-yellow-400">{t.eyebrow}</p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">{t.h1}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-300">{t.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-neutral-300">
            <span className="border border-neutral-700 px-3 py-2">{entries.length} {t.governed}</span>
            <span className="border border-neutral-700 px-3 py-2">{t.systems}</span>
            <span className="border border-neutral-700 px-3 py-2">{t.technologies}</span>
            <span className="border border-neutral-700 px-3 py-2">{t.demand}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="mb-12 grid gap-6 border-b border-neutral-200 pb-10 md:grid-cols-3">
          {t.blocks.map(([heading, body]) => (
            <div key={heading}>
              <h2 className="text-lg font-semibold">{heading}</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{body}</p>
            </div>
          ))}
        </div>

        <nav aria-label={t.nav} className="mb-14 flex flex-wrap gap-2">
          {categories.map(({ category, label }) => (
            <a key={category} href={`#${anchor(category)}`} className="border border-neutral-300 px-3 py-2 text-sm font-medium hover:border-neutral-950">
              {label}
            </a>
          ))}
        </nav>

        <div className="space-y-16">
          {categories.map(({ category, label, entries: categoryEntries }) => (
            <section key={category} id={anchor(category)} className="scroll-mt-24">
              <div className="mb-6 flex items-end justify-between gap-4 border-b border-neutral-900 pb-3">
                <h2 className="text-2xl font-semibold tracking-tight">{label}</h2>
                <span className="text-sm text-neutral-500">{categoryEntries.length} {t.questions}</span>
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
                        <PublicReferenceLink href={entry.sourceHref} className="font-medium text-neutral-800 underline underline-offset-4 hover:text-black">{t.context}</PublicReferenceLink>
                        {entry.demandSignal === 'gsc-observed' ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{t.observed}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
