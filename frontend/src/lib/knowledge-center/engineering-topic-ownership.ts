export const CONSOLIDATED_ENGINEERING_TOPICS: Record<string, string> = {
  'iso-16889': '/knowledge-center/standards/iso-16889/',
  'iso-4406': '/knowledge-center/standards/iso-4406/',
  'filter-media-science': '/knowledge-center/engineering/filter-media-engineering/',
};

export function isCanonicalEngineeringTopic(slug: string): boolean {
  return !Object.prototype.hasOwnProperty.call(CONSOLIDATED_ENGINEERING_TOPICS, slug);
}
