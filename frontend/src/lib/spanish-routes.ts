import { PRODUCT_FAMILY_LIST } from './product-families-data';

// English paths (no trailing slash, '/' for home) that have a published Spanish twin at /es<path>/.
export const SPANISH_ROUTES: readonly string[] = [
  '/',
  '/contact',
  '/technologies/hydrocore',
  ...PRODUCT_FAMILY_LIST.map((family) => `/families/${family.slug}`),
];

export const spanishPath = (path: string) => (path === '/' ? '/es/' : `/es${path}/`);
