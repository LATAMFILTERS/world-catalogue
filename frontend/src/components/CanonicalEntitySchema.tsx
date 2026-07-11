import {
  buildCanonicalEntitySchema,
  type SchemaEntityKind,
} from '@/lib/canonical-entity-schema';

interface Props {
  kind: SchemaEntityKind;
  slug: string;
}

export function CanonicalEntitySchema({ kind, slug }: Props) {
  const schema = buildCanonicalEntitySchema(kind, slug);
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
