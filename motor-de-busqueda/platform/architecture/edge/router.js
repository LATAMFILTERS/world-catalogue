export class EdgeRouter {
  route(request) {
    const country = request.geo || 'global';

    if (country === 'US') return 'edge-us';
    if (country === 'EU') return 'edge-eu';
    if (country === 'LATAM') return 'edge-latam';

    return 'edge-global';
  }
}
