export interface ArticleSchemaProps {
  data: Record<string, unknown>;
}

const KC_DYNAMIC_URL = /^https:\/\/elimfilters\.com\/knowledge-center\/(glossary|diagrams|engineering-reference|standards)\/[^/?#]+(?:[?#].*)?$/;

function normalizeKcEntityUrls(value: unknown): unknown {
  if (typeof value === 'string') {
    if (!KC_DYNAMIC_URL.test(value)) return value;

    const [beforeHash, hash] = value.split('#', 2);
    const [pathname, query] = beforeHash.split('?', 2);
    const normalizedPath = pathname.endsWith('/') ? pathname : `${pathname}/`;
    const withQuery = query ? `${normalizedPath}?${query}` : normalizedPath;
    return hash ? `${withQuery}#${hash}` : withQuery;
  }

  if (Array.isArray(value)) return value.map(normalizeKcEntityUrls);

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        normalizeKcEntityUrls(nested),
      ]),
    );
  }

  return value;
}

export default function ArticleSchema({ data }: ArticleSchemaProps) {
  const normalizedData = normalizeKcEntityUrls(data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(normalizedData) }}
    />
  );
}
