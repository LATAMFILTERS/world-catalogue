import data from '@/generated/canonical-knowledge.json';

export interface CanonicalKnowledgeRecord {
  id: string; slug: string; title: string; domain: string; contentType: string; confidence: string;
  industries: string[]; systems: string[]; technologies: string[]; components: string[]; problems: string[];
  failureModes: string[]; symptoms: string[]; rootCauses: string[]; diagnosticMethods: string[]; correctiveActions: string[];
  maintenanceProcedures: string[]; procedures: string[]; technicalRelationships: string[]; operatingConditions: string[];
  standards: string[]; sharedEngineering: string[]; keywords: string[];
}

const AUTHORITY = '13-canonical-knowledge' as const;
const records = Object.freeze((data.records as CanonicalKnowledgeRecord[]).map((record) => Object.freeze(record)));

function normalize(value: string): string {
  return String(value || '').toLowerCase().normalize('NFKD').replace(/™/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}
function entityTokens(value: string): string[] {
  const n=normalize(value); const stripped=n.replace(/^(tech|sys|system|failure|fail|cont|contamination|knowledge|kc)\s+/,'');
  return [...new Set([n,stripped,...stripped.split(' ').filter(x=>x.length>2)])].filter(Boolean);
}

export function getCanonicalKnowledgeAuthority(): typeof AUTHORITY { return AUTHORITY; }
export function listCanonicalKnowledge(): readonly CanonicalKnowledgeRecord[] { return records; }
export function getCanonicalKnowledgeById(id: string): CanonicalKnowledgeRecord | null { return records.find(r=>r.id===id) ?? null; }
export function getCanonicalKnowledgeBySlug(slug: string): CanonicalKnowledgeRecord | null { return records.find(r=>r.slug===slug) ?? null; }

export function searchCanonicalKnowledge(query: string, maxResults=20): CanonicalKnowledgeRecord[] {
  const terms=entityTokens(query); if(!terms.length)return [];
  return records.map(record=>{
    const title=normalize(record.title); const hay=normalize(record.keywords.join(' '));
    let score=0; for(const t of terms){if(title===t)score+=100;else if(title.includes(t))score+=30;if(hay.includes(t))score+=10;}
    return {record,score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.record.id.localeCompare(b.record.id)).slice(0,maxResults).map(x=>x.record);
}

export function resolveCanonicalKnowledgeForEntities(entityIds: readonly string[], maxResults=20): CanonicalKnowledgeRecord[] {
  const scores=new Map<string,{record:CanonicalKnowledgeRecord;score:number}>();
  for(const entityId of entityIds){
    const tokens=entityTokens(entityId);
    for(const record of records){
      const hay=normalize([record.id,record.title,...record.systems,...record.technologies,...record.components,...record.problems,...record.failureModes,...record.sharedEngineering].join(' '));
      const score=tokens.reduce((sum,t)=>sum+(hay.includes(t)?1:0),0);
      if(score>0 && score>(scores.get(record.id)?.score??0)) scores.set(record.id,{record,score});
    }
  }
  return [...scores.values()].sort((a,b)=>b.score-a.score||a.record.id.localeCompare(b.record.id)).slice(0,maxResults).map(x=>x.record);
}

export const CANONICAL_KNOWLEDGE_COUNT = records.length;
