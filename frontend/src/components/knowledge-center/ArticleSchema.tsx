export interface ArticleSchemaProps {
  data: Record<string, unknown>;
}

export default function ArticleSchema({ data }: ArticleSchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
