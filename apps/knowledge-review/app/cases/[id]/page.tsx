import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { knowledgeApi } from '@/lib/api';

export const dynamic = 'force-dynamic';

async function transition(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  await knowledgeApi.transition(id, String(formData.get('newStatus')), String(formData.get('reason')));
  revalidatePath(`/cases/${id}`); revalidatePath('/');
}

async function decide(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  const target = String(formData.get('targetRecordId') ?? '').trim() || undefined;
  await knowledgeApi.decide(id, String(formData.get('decision')), String(formData.get('rationale')), target);
  revalidatePath(`/cases/${id}`); revalidatePath('/');
}

function Rows({ value }: { value: Record<string, unknown> }) {
  return <dl>{Object.entries(value).filter(([,v]) => v !== null && v !== undefined).map(([key,v]) =>
    <div className="kv" key={key}><dt>{key.replaceAll('_',' ')}</dt><dd>{typeof v === 'object' ? <pre>{JSON.stringify(v,null,2)}</pre> : String(v)}</dd></div>)}</dl>;
}

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data: Record<string, unknown>;
  try { data = await knowledgeApi.getCase(id); } catch { notFound(); }
  const record = (data!.candidate_case ?? data) as Record<string, unknown>;
  return <div className="container">
    <section className="hero"><div><Link href="/">← Review Queue</Link><h1>{String(record.external_id ?? 'Candidate Case')}</h1><p>{String(record.symptom_summary ?? '')}</p></div><span className="badge">{String(record.status ?? '')}</span></section>
    <div className="grid">
      <section className="panel section"><h2>Case Record</h2><Rows value={record}/><h2>Evidence and history</h2><Rows value={Object.fromEntries(Object.entries(data!).filter(([k]) => k !== 'candidate_case'))}/></section>
      <aside className="panel section actions"><h2>Controlled Actions</h2>
        <form action={transition}><input type="hidden" name="id" value={id}/><label>Move case to</label><select name="newStatus" required><option>INCOMPLETE</option><option>UNDER_ANALYSIS</option><option>CLUSTERED</option><option>DRAFTED</option><option>TECHNICAL_REVIEW</option></select><textarea name="reason" required minLength={10} placeholder="Reason for transition"/><button className="button secondary">Record transition</button></form>
        <form action={decide}><input type="hidden" name="id" value={id}/><label>Engineering decision</label><select name="decision" required><option>REQUEST_MORE_EVIDENCE</option><option>MERGE_EXISTING</option><option>CREATE_DIAGNOSTIC</option><option>RETURN_TO_DRAFT</option><option>APPROVE</option><option>REJECT</option></select><input name="targetRecordId" placeholder="Target record UUID when applicable"/><textarea name="rationale" required minLength={20} placeholder="Technical rationale and evidence basis"/><button className="button">Submit governed decision</button></form>
        <div className="notice">Publishing is intentionally separated from review. Approval does not automatically publish knowledge.</div>
      </aside>
    </div>
  </div>;
}
