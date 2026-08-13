const oldTechPath = (...parts) => `/knowledge-center/technologies/${parts.join('')}`;

const REDIRECTS = new Map([
  ['/knowledge-system', '/knowledge-center/'],
  ['/knowledge-system/', '/knowledge-center/'],
  ['/knowledge-center/engineering/operator-health', '/knowledge-center/systems/air-intake-protection/'],
  ['/knowledge-center/engineering/operator-health/', '/knowledge-center/systems/air-intake-protection/'],
  ['/knowledge-center/systems/cabin-air-protection', '/knowledge-center/systems/air-intake-protection/'],
  ['/knowledge-center/systems/cabin-air-protection/', '/knowledge-center/systems/air-intake-protection/'],
  [oldTechPath('synte','pore'), '/knowledge-center/technologies/syntapore/'],
  [`${oldTechPath('synte','pore')}/`, '/knowledge-center/technologies/syntapore/'],
  [oldTechPath('hydro','core'), '/knowledge-center/technologies/syntapore/'],
  [`${oldTechPath('hydro','core')}/`, '/knowledge-center/technologies/syntapore/'],
  [oldTechPath('turbo','cor'), '/knowledge-center/technologies/turbocore/'],
  [`${oldTechPath('turbo','cor')}/`, '/knowledge-center/technologies/turbocore/'],
  [oldTechPath('hydro','core-series'), '/knowledge-center/technologies/turbocore/'],
  [`${oldTechPath('hydro','core-series')}/`, '/knowledge-center/technologies/turbocore/'],
]);

function permanentRedirect(url, destinationPath) {
  const destination = new URL(destinationPath, url.origin);
  destination.search = url.search;
  return Response.redirect(destination.toString(), 301);
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const exactDestination = REDIRECTS.get(url.pathname);
    if (exactDestination) return permanentRedirect(url, exactDestination);
    if (url.pathname.startsWith('/knowledge-system/')) return permanentRedirect(url, '/knowledge-center/');
    return fetch(request);
  },
};
