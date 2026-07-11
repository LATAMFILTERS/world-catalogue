import type { SchemaEntityKind } from '@/lib/canonical-entity-schema';
import { buildKnowledgeGraphSchema } from '@/lib/knowledge-graph-schema';

interface Props {
  kind: SchemaEntityKind;
  slug: string;
}

export function CanonicalEntitySchema({ kind, slug }: Props) {
  const schema = buildKnowledgeGraphSchema({ kind, slug });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
