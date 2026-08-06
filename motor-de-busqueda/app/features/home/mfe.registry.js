import { loadRemote } from './mfe/runtime/loader';

export const mfeRegistry = {
  feature: "home",
  mode: "distributed",
  load: loadRemote,
  apps: [
    { scope: 'hero', version: '1.0.0', entry: 'https://cdn.example.com/home/Hero/remoteEntry.js' },
    { scope: 'industries', version: '1.0.0', entry: 'https://cdn.example.com/home/Industries/remoteEntry.js' },
    { scope: 'technologies', version: '1.0.0', entry: 'https://cdn.example.com/home/Technologies/remoteEntry.js' },
    { scope: 'stats', version: '1.0.0', entry: 'https://cdn.example.com/home/Stats/remoteEntry.js' },
    { scope: 'cta', version: '1.0.0', entry: 'https://cdn.example.com/home/CTA/remoteEntry.js' }
  ]
};
