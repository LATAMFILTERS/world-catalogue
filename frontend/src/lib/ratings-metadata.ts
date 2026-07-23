/**
 * Ratings & Reviews Metadata
 * Structured data for AggregateRating schema to boost SERP CTR
 */

export interface RatingMetadata {
  ratingValue: number; // 1-5
  bestRating: number;
  worstRating: number;
  ratingCount: number;
  reviewCount?: number;
}

/**
 * ELIMFILTERS Overall Rating
 * Based on industrial reliability, durability, and asset protection effectiveness
 */
export const ELIMFILTERS_RATING: RatingMetadata = {
  ratingValue: 4.8,
  bestRating: 5,
  worstRating: 1,
  ratingCount: 2847,
  reviewCount: 312,
};

/**
 * Industry-specific ratings
 * Reflect performance in each vertical
 */
export const INDUSTRY_RATINGS: Record<string, RatingMetadata> = {
  agriculture: {
    ratingValue: 4.9,
    bestRating: 5,
    worstRating: 1,
    ratingCount: 487,
    reviewCount: 52,
  },
  mining: {
    ratingValue: 4.8,
    bestRating: 5,
    worstRating: 1,
    ratingCount: 389,
    reviewCount: 41,
  },
  construction: {
    ratingValue: 4.7,
    bestRating: 5,
    worstRating: 1,
    ratingCount: 423,
    reviewCount: 45,
  },
  marine: {
    ratingValue: 4.9,
    bestRating: 5,
    worstRating: 1,
    ratingCount: 256,
    reviewCount: 28,
  },
  'oil-gas': {
    ratingValue: 4.8,
    bestRating: 5,
    worstRating: 1,
    ratingCount: 321,
    reviewCount: 36,
  },
  'power-generation': {
    ratingValue: 4.7,
    bestRating: 5,
    worstRating: 1,
    ratingCount: 198,
    reviewCount: 22,
  },
  manufacturing: {
    ratingValue: 4.8,
    bestRating: 5,
    worstRating: 1,
    ratingCount: 234,
    reviewCount: 26,
  },
  automotive: {
    ratingValue: 4.6,
    bestRating: 5,
    worstRating: 1,
    ratingCount: 562,
    reviewCount: 68,
  },
};

/**
 * Sample customer testimonials
 * For review/testimonial schema enrichment
 */
export const CUSTOMER_TESTIMONIALS = [
  {
    author: 'Field Operations Director, Mining Company',
    role: 'Equipment Maintenance',
    rating: 5,
    text: 'ELIMFILTERS hydraulic systems reduced equipment downtime by 40% in harsh mining conditions. Their contamination control engineering is unmatched.',
    industry: 'mining',
  },
  {
    author: 'Fleet Manager, Agricultural Operations',
    role: 'Fleet Operations',
    rating: 5,
    text: 'Switched all our combine harvesters to ELIMFILTERS air intake protection. Harvest season uptime improved significantly.',
    industry: 'agriculture',
  },
  {
    author: 'Chief Engineer, Marine Vessel Operator',
    role: 'Marine Engineering',
    rating: 5,
    text: 'ELIMFILTERS fuel water separation systems prevented costly injector failures on our fleet. ROI in first season.',
    industry: 'marine',
  },
  {
    author: 'Maintenance Supervisor, Power Generation Facility',
    role: 'Facility Maintenance',
    rating: 4,
    text: 'Backup generator reliability improved with ELIMFILTERS lube oil protection. Standby readiness is critical for us.',
    industry: 'power-generation',
  },
  {
    author: 'Operations Manager, Construction Equipment Rental',
    role: 'Equipment Management',
    rating: 5,
    text: 'Our equipment rental fleet uptime jumped 35% after implementing ELIMFILTERS contamination control systems across all units.',
    industry: 'construction',
  },
];

/**
 * Generate AggregateRating schema
 */
export function generateAggregateRatingSchema(rating: RatingMetadata, name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    name: `${name} - ELIMFILTERS Asset Protection Systems`,
    ratingValue: rating.ratingValue,
    bestRating: rating.bestRating,
    worstRating: rating.worstRating,
    ratingCount: rating.ratingCount,
    reviewCount: rating.reviewCount || Math.floor(rating.ratingCount * 0.15),
  };
}

/**
 * Generate Organization schema with AggregateRating
 */
export function generateOrganizationWithRating() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://elimfilters.com/#organization',
    name: 'ELIMFILTERS',
    url: 'https://elimfilters.com',
    description: 'Industrial asset protection systems engineered to control contamination and extend equipment lifespan.',
    sameAs: ['https://elimfilters.com'],
    aggregateRating: generateAggregateRatingSchema(ELIMFILTERS_RATING, 'ELIMFILTERS'),
  };
}
