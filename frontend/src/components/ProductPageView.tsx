import type { CSSProperties } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { getFamilyBySlug } from '@/lib/product-families-data';
import { BASE_URL, equivalenceLine, productHeading, productMetaDescription, productPath, type ProductPage } from '@/lib/product-pages';

const display = 'var(--font-display)';
const PART_SEARCH = 'https://part-search.elimfilters.com';

const UNIT_CODE: Record<string, string> = { Height: 'MMT', 'Outer diameter': 'MMT', 'Gasket outer diameter': 'MMT', 'Gasket inner diameter': 'MMT' };

function structuredData(p: ProductPage, familyName: string, familyUrl: string) {
  const url = `${BASE_URL}${productPath(p)}`;
  const additionalProperty = p.specs.map((s) => {
    const mm = UNIT_CODE[s.name] && /^[\d.]+ mm$/.test(s.value);
    return { '@type': 'PropertyValue', name: s.name, value: mm ? parseFloat(s.value) : s.value, ...(mm ? { unitCode: UNIT_CODE[s.name] } : {}) };
  });
  additionalProperty.push({ '@type': 'PropertyValue', name: 'Technology', value: `${p.technology}™` });
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${url}#product`,
      name: productHeading(p),
      description: productMetaDescription(p),
      url,
      sku: p.sku,
      mpn: p.sku,
      category: familyName,
      brand: { '@type': 'Brand', '@id': `${BASE_URL}/#brand`, name: 'ELIMFILTERS' },
      manufacturer: { '@type': 'Organization', '@id': `${BASE_URL}/#organization`, name: 'ELIMFILTERS' },
      additionalProperty,
      isRelatedTo: [...p.oem, ...p.crossRefs].map((r) => ({ '@type': 'Product', name: `${r.brand} ${r.code}`, mpn: r.code, brand: { '@type': 'Brand', name: r.brand } })),
      // Price and availability are not part of the catalogue record, so the Offer carries none.
      offers: { '@type': 'Offer', url, seller: { '@type': 'Organization', '@id': `${BASE_URL}/#organization`, name: 'ELIMFILTERS' } },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Product Families', item: `${BASE_URL}/families/` },
        { '@type': 'ListItem', position: 3, name: familyName, item: familyUrl },
        { '@type': 'ListItem', position: 4, name: p.sku, item: url },
      ],
    },
  ];
}

function Refs({ items }: { items: { brand: string; code: string }[] }) {
  return (
    <ul style={refList}>
      {items.map((r) => <li key={`${r.brand}-${r.code}`} style={refItem}><strong style={refBrand}>{r.brand}</strong> {r.code}</li>)}
    </ul>
  );
}

export function ProductPageView({ product: p }: { product: ProductPage }) {
  const family = getFamilyBySlug(p.family);
  const familyName = family?.name ?? 'Product Family';
  const familyUrl = `${BASE_URL}/families/${p.family}/`;
  const schemas = structuredData(p, familyName, familyUrl);
  const extraOem = p.oemTotal - p.oem.length;
  const extraCross = p.crossRefsTotal - p.crossRefs.length;

  return (
    <main style={main}>
      {schemas.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}
      <PageHeader breadcrumbs={[{ label: 'Product Families', href: '/families/' }, { label: familyName, href: `/families/${p.family}/` }]} currentPage={p.sku} />

      <header style={hero}>
        <span style={kicker}>{p.duty} · {familyName}</span>
        <h1 style={h1}>{productHeading(p)}</h1>
        <p style={lead}>{p.description} Equivalent to {equivalenceLine(p, 3)}.</p>
        <p style={meta}>Technology: <Link href={`/technologies/${p.technology.toLowerCase()}/`} style={link}>{p.technology}™</Link></p>
      </header>

      <section style={section} aria-labelledby="specs">
        <h2 id="specs" style={h2}>Specifications</h2>
        <table style={table}>
          <caption style={srOnly}>{p.sku} specifications</caption>
          <tbody>
            {p.specs.map((s) => (
              <tr key={s.name}><th scope="row" style={th}>{s.name}</th><td style={td}>{s.value}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={section} aria-labelledby="equivalences">
        <h2 id="equivalences" style={h2}>Equivalences</h2>
        {p.oem.length > 0 && (
          <>
            <h3 style={h3}>OEM references</h3>
            <p style={note}>Equivalent to:</p>
            <Refs items={p.oem} />
            {extraOem > 0 && <p style={note}>{extraOem} more OEM references are listed in <a href={`${PART_SEARCH}/part/${p.sku}/`} style={link}>Part Search</a>.</p>}
          </>
        )}
        {p.crossRefs.length > 0 && (
          <>
            <h3 style={h3}>Cross-references</h3>
            <Refs items={p.crossRefs} />
            {extraCross > 0 && <p style={note}>{extraCross} more cross-references are listed in <a href={`${PART_SEARCH}/part/${p.sku}/`} style={link}>Part Search</a>.</p>}
            <p style={note}>Third-party brand names are used only to identify equivalent part numbers. Fit and application must be confirmed for each asset.</p>
          </>
        )}
      </section>

      {p.applications.length > 0 && (
        <section style={section} aria-labelledby="applications">
          <h2 id="applications" style={h2}>Applications</h2>
          <ul style={refList}>{p.applications.map((a) => <li key={a} style={refItem}>{a}</li>)}</ul>
        </section>
      )}

      <section style={section}>
        <div style={actions}>
          <a href={`${PART_SEARCH}/part/${p.sku}/`} style={yellowButton}>VERIFY IN PART SEARCH</a>
          <Link href="/contact/" style={darkButton}>REQUEST TECHNICAL REVIEW</Link>
          <Link href={`/families/${p.family}/`} style={darkButton}>{familyName.toUpperCase()}</Link>
        </div>
        <p style={note}>Confirm dimensions, thread, interface and operating conditions against the equipment before installation. Performance values describe the catalogue test condition stated and do not replace physical validation or professional engineering judgment.</p>
      </section>
    </main>
  );
}

const main: CSSProperties = { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'var(--font-body)', paddingBottom: '4rem' };
const pad = 'clamp(1.25rem, 6vw, 6rem)';
const hero: CSSProperties = { padding: `8rem ${pad} 3rem`, borderBottom: '1px solid rgba(255,255,255,0.08)' };
const kicker: CSSProperties = { color: '#FFF12D', fontFamily: display, fontWeight: 700, letterSpacing: '0.16em', fontSize: '0.7rem', textTransform: 'uppercase' };
const h1: CSSProperties = { fontFamily: display, fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3.8rem)', lineHeight: 1.02, letterSpacing: '-0.03em', margin: '1rem 0 0', textTransform: 'uppercase', overflowWrap: 'anywhere' };
const lead: CSSProperties = { maxWidth: '760px', color: 'rgba(255,255,255,0.78)', fontSize: '1.1rem', lineHeight: 1.7, margin: '1.2rem 0 0' };
const meta: CSSProperties = { color: 'rgba(255,255,255,0.64)', margin: '1rem 0 0' };
const section: CSSProperties = { padding: `2.5rem ${pad} 0`, maxWidth: '1180px', margin: '0 auto' };
const h2: CSSProperties = { fontFamily: display, fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em', textTransform: 'uppercase', margin: '0 0 1rem' };
const h3: CSSProperties = { fontFamily: display, fontSize: '0.8rem', letterSpacing: '0.12em', color: '#FFF12D', textTransform: 'uppercase', margin: '1.5rem 0 0.5rem' };
const table: CSSProperties = { width: '100%', maxWidth: '760px', borderCollapse: 'collapse' };
const th: CSSProperties = { textAlign: 'left', padding: '0.75rem 1rem 0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.64)', fontWeight: 600, width: '45%', verticalAlign: 'top' };
const td: CSSProperties = { padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontWeight: 600 };
const refList: CSSProperties = { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: '0.5rem' };
const refItem: CSSProperties = { border: '1px solid rgba(255,255,255,0.16)', padding: '0.45rem 0.7rem', fontSize: '0.92rem' };
const refBrand: CSSProperties = { color: 'rgba(255,255,255,0.64)', fontWeight: 400 };
const note: CSSProperties = { color: 'rgba(255,255,255,0.6)', fontSize: '0.92rem', lineHeight: 1.65, margin: '0.8rem 0 0', maxWidth: '760px' };
const link: CSSProperties = { color: '#FFF12D' };
const actions: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: '0.75rem' };
const yellowButton: CSSProperties = { background: '#FFF12D', color: '#000', textDecoration: 'none', fontFamily: display, fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.78rem', padding: '1rem 1.15rem', textAlign: 'center' };
const darkButton: CSSProperties = { color: '#fff', textDecoration: 'none', fontFamily: display, fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.78rem', padding: '1rem 1.15rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.18)' };
const srOnly: CSSProperties = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' };
