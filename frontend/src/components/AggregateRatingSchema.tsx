import { generateOrganizationWithRating } from '@/lib/ratings-metadata';

/**
 * AggregateRating Schema Component
 * Injects organizational rating data into JSON-LD for SERP display
 */
export default function AggregateRatingSchema() {
  const schema = generateOrganizationWithRating();

  return (
    <script
      id="aggregate-rating-schema"
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
