const baseUrl = process.env.KNOWLEDGE_CENTER_BASE_URL ?? 'http://127.0.0.1:10000';
const rawKeys = process.env.KNOWLEDGE_API_KEYS ?? '';
const apiKey = rawKeys.split(',').map((value) => value.trim()).find(Boolean);

if (!apiKey) {
  console.error('SMOKE_FAIL: KNOWLEDGE_API_KEYS is empty');
  process.exit(1);
}

const externalId = `SMOKE-${Date.now()}`;
const payload = {
  externalId,
  sourceChannel: 'SYSTEM',
  priority: 'NORMAL',
  symptomSummary: 'Automated staging smoke test',
  assetSummary: {},
  structuredIntake: { smokeTest: true }
};

const response = await fetch(`${baseUrl}/api/knowledge-center/v1/candidate-cases`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-api-key': apiKey,
    'x-actor-id': 'system.smoke-test',
    'x-actor-role': 'SYSTEM'
  },
  body: JSON.stringify(payload)
});

const body = await response.text();

if (response.status !== 201) {
  console.error(`SMOKE_FAIL: HTTP ${response.status}`);
  console.error(body);
  process.exit(1);
}

console.log(`SMOKE_OK: HTTP ${response.status}`);
console.log(body);
