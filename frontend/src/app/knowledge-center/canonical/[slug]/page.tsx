import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCanonicalKnowledgeBySlug, listCanonicalKnowledge } from '@/lib/services/canonical-knowledge-service';

export function generateStaticParams() { return listCanonicalKnowledge().map(record => ({ slug: record.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const record = getCanonicalKnowledgeBySlug(slug);
  if (!record) return { title: 'Knowledge Record | ELIMFILTERS' };
  const canonical = `https://elimfilters.com/knowledge-center/canonical/${record.slug}/`;
  const description = record.technicalRelationships[0] || record.problems[0] || 'Approved ELIMFILTERS engineering knowledge.';
  return {
    title: `${record.title} | ELIMFILTERS Knowledge Center`,
    description,
    alternates: { canonical },
    openGraph: { title: record.title, description, url: canonical, type: 'article', siteName: 'ELIMFILTERS' },
    twitter: { card: 'summary', title: record.title, description },
  };
}
function Section({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return <section className="border-t border-slate-200 py-7"><h2 className="mb-4 text-xl font-semibold">{title}</h2><ul className="space-y-3 text-[15px] leading-7 text-slate-700">{items.map((item, i) => <li key={`${title}-${i}`} className="flex gap-3"><span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400"/><span>{item}</span></li>)}</ul></section>;
}
export default async function CanonicalRecordPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const record = getCanonicalKnowledgeBySlug(slug); if (!record) notFound();
  const url = `https://elimfilters.com/knowledge-center/canonical/${record.slug}/`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `${url}#article`,
    headline: record.title,
    name: record.title,
    url,
    description: record.technicalRelationships[0] || record.problems[0] || 'Approved ELIMFILTERS engineering knowledge.',
    about: [...record.systems, ...record.platforms, ...record.technologies].map((name) => ({ '@type': 'Thing', name })),
    author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
    publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
    isPartOf: { '@type': 'WebSite', '@id': 'https://elimfilters.com/#website', name: 'ELIMFILTERS', url: 'https://elimfilters.com/' },
  };
  return <main className="min-h-screen bg-white text-slate-950"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><article className="mx-auto max-w-4xl px-6 py-14 lg:px-8">
    <Link href="/knowledge-center/canonical/" className="text-sm font-medium text-slate-600 hover:text-slate-950">← Canonical Engineering Knowledge</Link>
    <div className="mt-8 border-b border-slate-300 pb-9"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">ELIMFILTERS Canonical Knowledge · Approved</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">{record.title}</h1><p className="mt-4 text-sm text-slate-500">{record.contentType} · {record.systems.join(' · ') || record.domain}</p>{record.platforms.length > 0 && <p className="mt-2 text-sm font-medium text-slate-700">Platform: {record.platforms.join(' · ')}</p>}{record.technologies.length > 0 && <p className="mt-2 text-sm font-medium text-slate-700">Technology: {record.technologies.join(' · ')}</p>}</div>
    <Section title="Engineering Relationships" items={record.technicalRelationships}/><Section title="Components" items={record.components}/><Section title="Problems" items={record.problems}/><Section title="Failure Modes" items={record.failureModes}/><Section title="Symptoms" items={record.symptoms}/><Section title="Root Causes" items={record.rootCauses}/><Section title="Diagnostic Methods" items={record.diagnosticMethods}/><Section title="Corrective Actions" items={record.correctiveActions}/><Section title="Maintenance Procedures" items={record.maintenanceProcedures}/><Section title="Service Procedure" items={record.procedures}/><Section title="Operating Conditions" items={record.operatingConditions}/><Section title="Standards" items={record.standards}/><Section title="Shared Engineering" items={record.sharedEngineering}/>
    <aside className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">This record is approved canonical ELIMFILTERS engineering knowledge. Product selection, SKU authority and cross-reference validation remain governed separately by the ELIMFILTERS catalog.</aside>
  </article></main>;
}
