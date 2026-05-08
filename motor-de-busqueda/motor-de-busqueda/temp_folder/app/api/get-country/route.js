export async function GET(request) {
  const country = request.headers.get('cf-ipcountry') || 'US';
  return Response.json({
    country: country,
    timestamp: new Date().toISOString(),
  });
}
