export function track(event, payload = {}) {
  const data = {
    event,
    payload,
    timestamp: Date.now(),
    feature: 'home'
  };

  console.log('[telemetry]', data);

  // future: send to endpoint
  // fetch('/api/telemetry', { method: 'POST', body: JSON.stringify(data) });
}

export function trackError(error, context) {
  console.error('[error]', error, context);

  track('error', {
    message: error?.message || error,
    context
  });
}
