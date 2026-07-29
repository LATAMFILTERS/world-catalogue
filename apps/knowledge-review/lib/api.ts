import { z } from 'zod';

const envSchema = z.object({
  KNOWLEDGE_CENTER_API_URL: z.string().url(),
  KNOWLEDGE_CENTER_API_KEY: z.string().min(12),
  KNOWLEDGE_CENTER_ACTOR_ID: z.string().uuid(),
  KNOWLEDGE_CENTER_ACTOR_ROLE: z.enum(['SUPPORT_REVIEWER','ENGINEERING_REVIEWER','APPROVER','PUBLISHER','ADMIN'])
});

let env: z.infer<typeof envSchema>;
let envLoaded = false;

function getEnv() {
  if (!envLoaded) {
    env = envSchema.parse(process.env);
    envLoaded = true;
  }
  return env;
}

export type ReviewCase = {
  id: string; external_id: string; status: string; priority: string;
  source_channel: string; protection_system?: string | null;
  symptom_summary: string; novelty_classification?: string | null;
  novelty_score?: number | null; created_at: string; due_at?: string | null;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const config = getEnv();
  const response = await fetch(`${config.KNOWLEDGE_CENTER_API_URL}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'content-type': 'application/json',
      'x-api-key': config.KNOWLEDGE_CENTER_API_KEY,
      'x-actor-id': config.KNOWLEDGE_CENTER_ACTOR_ID,
      'x-actor-role': config.KNOWLEDGE_CENTER_ACTOR_ROLE,
      ...(init?.headers ?? {})
    }
  });
  if (!response.ok) throw new Error(`Knowledge Center API ${response.status}`);
  return response.json() as Promise<T>;
}

export const knowledgeApi = {
  listCases: (limit = 50) => request<ReviewCase[]>(`/candidate-cases?limit=${limit}&offset=0`),
  getCase: (id: string) => request<Record<string, unknown>>(`/candidate-cases/${id}`),
  transition: (id: string, newStatus: string, reason: string) => request(`/candidate-cases/${id}/transitions`, { method: 'POST', body: JSON.stringify({ newStatus, reason }) }),
  decide: (id: string, decision: string, rationale: string, targetRecordId?: string) => request(`/candidate-cases/${id}/decisions`, { method: 'POST', body: JSON.stringify({ decision, rationale, targetRecordId }) })
};
