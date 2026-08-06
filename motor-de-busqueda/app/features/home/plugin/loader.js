import manifest from './manifest.json';

export function loadPlugin(key) {
  const plugin = manifest.plugins.find(p => p.key === key);

  if (!plugin) return null;

  return import(./client/);
}

export function loadServerPlugin(key) {
  const plugin = manifest.plugins.find(p => p.key === key);

  if (!plugin) return null;

  return import(./server/);
}
