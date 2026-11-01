import { PRODUCT_PAGES, BASE_URL, productPath } from '@/lib/product-pages';

// Static export uses the same public, governance-filtered snapshot as SKU pages.
// This endpoint does not publish raw catalogue evidence, OEM equivalence or fitment claims.
export const dynamic = 'force-static';

export function GET() {
  const products = PRODUCT_PAGES.map((p) => ({
    sku: p.sku,
    name: p.title,
    url: `${BASE_URL}${productPath(p)}`,
    family: p.family,
    duty: p.duty,
    technology: p.technology,
  }));
  return Response.json({
    version: 1,
    publisher: 'ELIMFILTERS',
    policy: 'SKU identifiers and product descriptions only. No equivalence or equipment compatibility is implied. Verify application evidence before fitment.',
    productCount: products.length,
    products,
  }, {
    headers: { 'Cache-Control': 'public, max-age=3600', 'X-Content-Type-Options': 'nosniff' },
  });
}
