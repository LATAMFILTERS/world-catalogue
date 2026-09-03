export const ENGINEERING_TOPIC_CANONICAL_OWNERS: Readonly<Record<string, string>> = {
  'iso-16889': 'https://elimfilters.com/knowledge-center/standards/iso-16889/',
  'iso-4406': 'https://elimfilters.com/knowledge-center/standards/iso-4406/',
  'filter-media-science': 'https://elimfilters.com/knowledge-center/engineering/filter-media-engineering/',
};

export function getEngineeringTopicCanonicalOwner(slug: string): string | undefined {
  return ENGINEERING_TOPIC_CANONICAL_OWNERS[slug];
}

export function isConsolidatedEngineeringTopic(slug: string): boolean {
  return Boolean(getEngineeringTopicCanonicalOwner(slug));
}
