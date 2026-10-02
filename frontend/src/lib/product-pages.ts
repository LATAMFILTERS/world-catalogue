import snapshot from '@/data/product-pages.json';

export const BASE_URL = 'https://elimfilters.com';

export interface ProductPage {
  sku: string;
  slug: string;
  family: string;
  duty: string;
  title: string;
  technology: string;
  description: string;
  specs: { name: string; value: string }[];
  oem: { brand: string; code: string }[];
  oemTotal: number;
  crossRefs: { brand: string; code: string }[];
  crossRefsTotal: number;
  applications: string[];
  source: { kind: string; file?: string; seed?: string; table?: string };
}

const OPTIONS = snapshot.options as { showCrossReferences: boolean; showPerformanceSpecs: boolean };

// Performance values need approved product evidence before public use (CLAUDE.md); the switch lives
// in config/sku-sitemap-list.json so the auditor can turn them off without a code change.
const PERFORMANCE_FIELDS = new Set(['Filtration rating', 'Efficiency', 'Efficiency test method', 'Rated flow', 'Burst pressure']);

export const PRODUCT_PAGES: readonly ProductPage[] = (snapshot.products as ProductPage[]).map((p) => ({
  ...p,
  specs: p.specs.filter((s) => OPTIONS.showPerformanceSpecs || !PERFORMANCE_FIELDS.has(s.name)),
  crossRefs: OPTIONS.showCrossReferences ? p.crossRefs : [],
  crossRefsTotal: OPTIONS.showCrossReferences ? p.crossRefsTotal : 0,
}));

export const getProductPage = (slug: string) => PRODUCT_PAGES.find((p) => p.slug === slug.toLowerCase());
export const productsForFamily = (family: string) => PRODUCT_PAGES.filter((p) => p.family === family);
export const productPath = (p: Pick<ProductPage, 'slug'>) => `/products/${p.slug}/`;

export const productHeading = (p: ProductPage) => `${p.sku} – ${p.title}`;
export const productSeoTitle = (p: ProductPage) => `${productHeading(p)} | ELIMFILTERS`;

export function equivalenceLine(p: ProductPage, max = 2) {
  const pool = p.oem.length ? p.oem : p.crossRefs;
  return pool.slice(0, max).map((r) => `${r.brand} ${r.code}`).join(', ');
}

export function productMetaDescription(p: ProductPage) {
  const spec = (name: string) => p.specs.find((s) => s.name === name)?.value;
  const parts = [`${p.sku} ${p.title.toLowerCase()}`, spec('Thread') && `thread ${spec('Thread')}`, spec('Height') && `${spec('Height')} high`].filter(Boolean).join(', ');
  const cross = !p.oem.length ? '' : p.crossRefs[0] ? `; also ${p.crossRefs[0].brand} ${p.crossRefs[0].code}` : '';
  const base = `${parts}. Equivalent to ${equivalenceLine(p)}${cross}.`;
  const withTech = `${base} ${p.technology}™ technology.`;
  return withTech.length <= 160 ? withTech : base;
}
