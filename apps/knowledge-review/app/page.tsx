import Link from 'next/link';
import { knowledgeApi } from '@/lib/api';

export default async function ReviewQueuePage() {
  const cases = await knowledgeApi.listCases();
  const open = cases.filter((item) => !['APPROVED','REJECTED','PUBLISHED','DUPLICATE'].includes(item.status));
  const critical = cases.filter((item) => item.priority === 'CRITICAL').length;
  const review = cases.filter((item) => item.status === 'TECHNICAL_REVIEW').length;
  const incomplete = cases.filter((item) => item.status === 'INCOMPLETE').length;

  return <div className="container">
    <section className="hero"><div><h1>Review Queue</h1><p>Technical candidate cases awaiting controlled human action.</p></div><span className="badge">support@elimfilters.com</span></section>
    <div className="notice">Email notifications route reviewers here. Decisions and approvals are recorded only through this authenticated workspace.</div>
    <section className="stats">
      <div className="card"><strong>{open.length}</strong><span>Open cases</span></div>
      <div className="card"><strong>{critical}</strong><span>Critical priority</span></div>
      <div className="card"><strong>{review}</strong><span>Technical review</span></div>
      <div className="card"><strong>{incomplete}</strong><span>Evidence required</span></div>
    </section>
    <section className="panel">
      <div className="toolbar"><strong>Candidate Cases</strong><span>{cases.length} records</span></div>
      {cases.length === 0 ? <div className="empty">No candidate cases are currently queued.</div> :
      <table className="table"><thead><tr><th>Case</th><th>Status</th><th>Priority</th><th>System</th><th>Channel</th><th>Created</th></tr></thead><tbody>
        {cases.map((item) => <tr key={item.id}>
          <td><Link className="case-link" href={`/cases/${item.id}`}>{item.external_id}</Link><div>{item.symptom_summary.slice(0,90)}</div></td>
          <td><span className="badge">{item.status}</span></td>
          <td><span className={`badge priority-${item.priority}`}>{item.priority}</span></td>
          <td>{item.protection_system ?? 'Unclassified'}</td><td>{item.source_channel}</td>
          <td>{new Date(item.created_at).toLocaleDateString('en-US')}</td>
        </tr>)}
      </tbody></table>}
    </section>
  </div>;
}
