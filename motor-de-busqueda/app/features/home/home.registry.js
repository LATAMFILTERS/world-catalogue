import { loadPlugin } from './plugin/loader';

export const homeRegistry = {
  feature: "home",
  mode: "plugin-engine",
  sections: [
    { key: 'hero', loader: () => loadPlugin('hero') },
    { key: 'industries', loader: () => loadPlugin('industries') },
    { key: 'technologies', loader: () => loadPlugin('technologies') },
    { key: 'stats', loader: () => loadPlugin('stats') },
    { key: 'cta', loader: () => loadPlugin('cta') }
  ]
};
