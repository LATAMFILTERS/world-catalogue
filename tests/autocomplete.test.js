const assert = require('assert');

const BASE_URL = process.env.AUTOCOMPLETE_BASE_URL || 'https://part-search.elimfilters.com';
const QUERIES = ['LF3', 'EL8', 'P55', '235', 'CUK', 'AF'];
const MAX_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 15000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAutocomplete(query, attempt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const url = `${BASE_URL}/api/autocomplete?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        'user-agent': 'ELIMFILTERS-CI-Autocomplete-Smoke-Test/1.0',
      },
      signal: controller.signal,
    });

    const body = await response.text();
    let data;

    try {
      data = JSON.parse(body);
    } catch (error) {
      throw new Error(
        `Query ${query} returned invalid JSON on attempt ${attempt}: status=${response.status}, body=${body.slice(0, 300)}`,
      );
    }

    return { response, data };
  } finally {
    clearTimeout(timeout);
  }
}

async function test(query) {
  let lastFailure = '';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const { response, data } = await fetchAutocomplete(query, attempt);
      const length = Array.isArray(data) ? data.length : -1;

      console.log(
        `[autocomplete] query=${query} attempt=${attempt}/${MAX_ATTEMPTS} status=${response.status} results=${length}`,
      );

      assert.equal(response.status, 200, `Query ${query} returned HTTP ${response.status}`);
      assert.ok(Array.isArray(data), `Query ${query} did not return an array`);

      if (data.length > 0) {
        console.log(`[autocomplete] OK query=${query} first=${JSON.stringify(data[0])}`);
        return;
      }

      lastFailure = `Query ${query} returned an empty array`;
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : String(error);
      console.error(`[autocomplete] attempt failed: ${lastFailure}`);
    }

    if (attempt < MAX_ATTEMPTS) {
      await sleep(attempt * 2000);
    }
  }

  assert.fail(`${lastFailure} after ${MAX_ATTEMPTS} attempts against ${BASE_URL}`);
}

(async () => {
  for (const query of QUERIES) {
    await test(query);
  }

  console.log('ALL AUTOCOMPLETE TESTS PASSED');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
