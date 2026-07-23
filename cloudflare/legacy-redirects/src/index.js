const REDIRECTS = new Map([
  ["/knowledge-system", "/knowledge-center/"],
  ["/knowledge-system/", "/knowledge-center/"],
  ["/knowledge-system/contamination", "/knowledge-center/engineering/"],
  ["/knowledge-system/contamination/", "/knowledge-center/engineering/"],
  ["/knowledge-system/contamination/particle-wear", "/knowledge-center/engineering/contamination-control/"],
  ["/knowledge-system/contamination/particle-wear/", "/knowledge-center/engineering/contamination-control/"],
  ["/knowledge-system/contamination/diesel-water", "/knowledge-center/engineering/fluid-cleanliness/"],
  ["/knowledge-system/contamination/diesel-water/", "/knowledge-center/engineering/fluid-cleanliness/"],
  ["/knowledge-system/contamination/hydraulic-system", "/knowledge-center/engineering/contamination-control/"],
  ["/knowledge-system/contamination/hydraulic-system/", "/knowledge-center/engineering/contamination-control/"],
  ["/knowledge-system/standards", "/knowledge-center/standards/"],
  ["/knowledge-system/standards/", "/knowledge-center/standards/"],
  ["/knowledge-system/standards/iso-16889", "/knowledge-center/standards/iso-16889/"],
  ["/knowledge-system/standards/iso-16889/", "/knowledge-center/standards/iso-16889/"],
  ["/knowledge-system/standards/iso-4406", "/knowledge-center/standards/iso-4406/"],
  ["/knowledge-system/standards/iso-4406/", "/knowledge-center/standards/iso-4406/"],
  ["/knowledge-system/standards/astm-d6304", "/knowledge-center/standards/astm-d6304/"],
  ["/knowledge-system/standards/astm-d6304/", "/knowledge-center/standards/astm-d6304/"],
  ["/knowledge-system/standards/iso-12937", "/knowledge-center/standards/iso-12937/"],
  ["/knowledge-system/standards/iso-12937/", "/knowledge-center/standards/iso-12937/"],
  ["/knowledge-system/standards/iso-5011", "/knowledge-center/standards/iso-5011/"],
  ["/knowledge-system/standards/iso-5011/", "/knowledge-center/standards/iso-5011/"],
  ["/knowledge-system/standards/din-51524", "/knowledge-center/standards/din-51524/"],
  ["/knowledge-system/standards/din-51524/", "/knowledge-center/standards/din-51524/"],
  ["/knowledge-system/standards/iso-16332", "/knowledge-center/standards/iso-16332/"],
  ["/knowledge-system/standards/iso-16332/", "/knowledge-center/standards/iso-16332/"],
  ["/knowledge-system/standards/nfpa-t2-14", "/knowledge-center/standards/nfpa-t2-14/"],
  ["/knowledge-system/standards/nfpa-t2-14/", "/knowledge-center/standards/nfpa-t2-14/"],
  ["/knowledge-system/standards/astm-d6210", "/knowledge-center/standards/astm-d6210/"],
  ["/knowledge-system/standards/astm-d6210/", "/knowledge-center/standards/astm-d6210/"],
  ["/knowledge-system/standards/eu-dir-2019-130", "/knowledge-center/standards/eu-dir-2019-130/"],
  ["/knowledge-system/standards/eu-dir-2019-130/", "/knowledge-center/standards/eu-dir-2019-130/"],
  ["/knowledge-system/standards/iso-11155", "/knowledge-center/standards/iso-11155/"],
  ["/knowledge-system/standards/iso-11155/", "/knowledge-center/standards/iso-11155/"],
  ["/knowledge-system/standards/iso-8573-1", "/knowledge-center/standards/iso-8573-1/"],
  ["/knowledge-system/standards/iso-8573-1/", "/knowledge-center/standards/iso-8573-1/"],
  ["/knowledge-system/standards/sae-j1539", "/knowledge-center/standards/sae-j1539/"],
  ["/knowledge-system/standards/sae-j1539/", "/knowledge-center/standards/sae-j1539/"],
  ["/knowledge-center/engineering/operator-health", "/knowledge-center/systems/cabin-air-protection/"],
  ["/knowledge-center/engineering/operator-health/", "/knowledge-center/systems/cabin-air-protection/"],
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

    if (exactDestination) {
      return permanentRedirect(url, exactDestination);
    }

    // Safety net: no legacy /knowledge-system URL is allowed to reach Render
    // and become a 404. Unknown legacy paths go to the Knowledge Center root.
    if (url.pathname.startsWith("/knowledge-system/")) {
      return permanentRedirect(url, "/knowledge-center/");
    }

    return fetch(request);
  },
};
