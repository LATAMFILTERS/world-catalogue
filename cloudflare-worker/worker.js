export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Proxy to Railway with elimfilters.com Host header preserved
    // Using resolveOverride to connect to Railway's IP while keeping original Host
    const targetUrl = url.origin + url.pathname + url.search;
    
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      cf: {
        resolveOverride: 'world-catalogue-production-a151.up.railway.app'
      }
    });
    
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  }
};
