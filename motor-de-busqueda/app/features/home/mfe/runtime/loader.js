const manifest = require('../manifests/manifest.json');

const cache = {};

export async function loadRemote(scope) {
  if (cache[scope]) return cache[scope];

  const app = manifest.apps.find(a => a.scope === scope);
  if (!app) throw new Error('Remote not found: ' + scope);

  // Dynamic remote loading (CDN / federation style)
  await __webpack_init_sharing__('default');

  const container = window[scope];

  if (!container) {
    await loadScript(app.entry);
  }

  const module = await window[scope].get('./App');
  cache[scope] = module;

  return module;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
