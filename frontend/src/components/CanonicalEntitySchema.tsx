import type { SchemaEntityKind } from '@/lib/canonical-entity-schema';
import { buildAICitationRecord } from '@/lib/ai-citation-layer';
import { buildRichResultsGraph } from '@/lib/rich-results-schema';

interface Props {
  kind: SchemaEntityKind;
  slug: string;
}

export function CanonicalEntitySchema({ kind, slug }: Props) {
  const schema = buildRichResultsGraph(kind, slug);
  const citation = buildAICitationRecord(kind, slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {citation && (
        <script
          type="application/json"
          data-ai-citation="canonical"
          data-citation-id={citation.citationId}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(citation) }}
        />
      )}
    </>
  );
}
