import type { Metadata } from 'next';
import Link from 'next/link';
import { listCanonicalKnowledge, CANONICAL_KNOWLEDGE_COUNT } from '@/lib/services/canonical-knowledge-service';

export const metadata: Metadata = {
  title: 'Canonical Engineering Knowledge | ELIMFILTERS',
  description: 'Approved ELIMFILTERS engineering knowledge for filtration, diagnostics, service and asset protection.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/canonical/' },
};

export default function CanonicalKnowledgePage() {
  const records = listCanonicalKnowledge();
  const groups = new Map<string, typeof records>();
  for (const record of records) {
    const key = record.systems[0] || 'Shared Engineering Knowledge';
    groups.set(key, [...(groups.get(key) || []), record]);
  }
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Knowledge Center / Approved Authority</p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">Canonical Engineering Knowledge</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">Validated ELIMFILTERS engineering knowledge promoted through Nodal Center governance. Only approved canonical records are exposed here.</p>
          <div className="mt-8 text-sm text-slate-400">{CANONICAL_KNOWLEDGE_COUNT} approved records · source authority: ELIMFILTERS canonical knowledge</div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {[...groups.entries()].map(([group, items]) => (
          <div key={group} className="mb-12">
            <h2 className="mb-5 text-2xl font-semibold">{group}</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map(record => (
                <Link key={record.id} href={`/knowledge-center/canonical/${record.slug}/`} className="group rounded-xl border border-slate-200 p-5 transition hover:border-slate-400 hover:shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{record.contentType}</div>
                  <h3 className="mt-2 text-lg font-semibold group-hover:underline">{record.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{record.problems[0] || record.technicalRelationships[0] || 'Approved engineering reference.'}</p>
                  <div className="mt-4 text-xs text-slate-500">{record.technologies.join(' · ') || 'Shared Engineering'}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
