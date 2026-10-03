import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductPageView } from '@/components/ProductPageView';
import { BASE_URL, PRODUCT_PAGES, getProductPage, productMetaDescription, productPath, productSeoTitle } from '@/lib/product-pages';

interface Props {
  params: Promise<{ sku: string }>;
}

export const dynamicParams = false;

// `output: export` needs at least one route. While no SKU passes the VERIFIED-only policy, a sentinel
// route is generated; it renders the not-found page and is never linked or listed in the sitemap.
export function generateStaticParams() {
  return PRODUCT_PAGES.length ? PRODUCT_PAGES.map((p) => ({ sku: p.slug })) : [{ sku: '_none' }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductPage((await params).sku);
  if (!product) return { title: 'Not Found' };
  const title = productSeoTitle(product);
  const description = productMetaDescription(product);
  const url = `${BASE_URL}${productPath(product)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title, description, url, type: 'website', siteName: 'ELIMFILTERS', locale: 'en_US', images: [{ url: `${BASE_URL}/assets/logo-elimfilters.png`, width: 1200, height: 630 }] },
    twitter: { card: 'summary', title, description },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = getProductPage((await params).sku);
  if (!product) notFound();
  return <ProductPageView product={product} />;
}
