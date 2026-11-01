import { PRODUCT_PAGES, BASE_URL, productPath } from '@/lib/product-pages';
import { getFamilyBySlug } from '@/lib/product-families-data';

// Static export uses the same public, governance-filtered snapshot as SKU pages.
// This endpoint does not publish raw catalogue evidence, OEM equivalence or fitment claims.
export const dynamic = 'force-static';

export function GET() {
  const products = PRODUCT_PAGES.map((p) => ({
    sku: p.sku,
    name: p.title,
    familyName: getFamilyBySlug(p.family)?.name ?? p.family,
    nameRequiresReview: /^(?:cartridge|water(?:\s+spin[- ]?on)?\s+filter|water\s+filter)$/i.test(p.title.trim()),
    url: `${BASE_URL}${productPath(p)}`,
    family: p.family,
    duty: p.duty,
    technology: p.technology,
  }));
  return Response.json({
    version: 1,
    publisher: 'ELIMFILTERS',
    policy: 'Names requiring review are retained verbatim. familyName identifies the existing published product family; it does not prove filter construction, geometry or equipment fitment. No equivalence or compatibility is implied.',
    productCount: products.length,
    products,
  }, {
    headers: { 'Cache-Control': 'public, max-age=3600', 'X-Content-Type-Options': 'nosniff' },
  });
}
