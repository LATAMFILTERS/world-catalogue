import manifest from '../../../scripts/seo-geo-audit/recrawl-priority-manifest.json';

export type RecrawlTier = 'P0' | 'P1' | 'P2' | 'EXCLUDED';

type TierConfig = {
  priority: number;
  changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  exactPaths: string[];
  prefixes: string[];
};

function normalizePath(path: string): string {
  if (!path || path === '/') return '/';
  return `/${path.replace(/^\/+|\/+$/g, '')}`;
}

function matches(path: string, exactPaths: readonly string[], prefixes: readonly string[]): boolean {
  const normalized = normalizePath(path);
  if (exactPaths.some((candidate) => normalizePath(candidate) === normalized)) return true;
  return prefixes.some((prefix) => normalized.startsWith(normalizePath(prefix) + '/'));
}

export function getRecrawlTier(path: string): RecrawlTier {
  const normalized = normalizePath(path);
  const excluded = manifest.excluded;
  if (matches(normalized, excluded.exactPaths, excluded.prefixes)) return 'EXCLUDED';

  for (const tier of ['P0', 'P1', 'P2'] as const) {
    const config = manifest.tiers[tier] as TierConfig;
    if (matches(normalized, config.exactPaths, config.prefixes)) return tier;
  }

  return 'P2';
}

export function getRecrawlConfig(path: string): { tier: Exclude<RecrawlTier, 'EXCLUDED'>; priority: number; changeFrequency: TierConfig['changeFrequency'] } | undefined {
  const tier = getRecrawlTier(path);
  if (tier === 'EXCLUDED') return undefined;
  const config = manifest.tiers[tier] as TierConfig;
  return {
    tier,
    priority: config.priority,
    changeFrequency: config.changeFrequency,
  };
}

export const RECRAWL_EXCLUDED_PATHS = manifest.excluded.exactPaths.map(normalizePath);
export const RECRAWL_P0_PATHS = manifest.tiers.P0.exactPaths.map(normalizePath);
export const RECRAWL_MANIFEST_VERSION = manifest.version;
