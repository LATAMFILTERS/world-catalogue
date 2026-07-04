/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },

  // KC-01 — Single Source of Truth: Redirect Map
  // All knowledge-system/* routes receive permanent 301 redirects to knowledge-center/*.
  // These rules execute on Next.js server deployments (Vercel, Node.js server).
  // For purely static hosting, mirror these rules in your CDN or nginx configuration.
  // RULE: These redirects are NEVER removed — inbound links and AI crawlers may
  // reference legacy URLs indefinitely.
  async redirects() {
    return [
      // ── knowledge-system hub ─────────────────────────────────────────────
      { source: '/knowledge-system', destination: '/knowledge-center', permanent: true },
      { source: '/knowledge-system/index', destination: '/knowledge-center', permanent: true },
      { source: '/knowledge-system/science', destination: '/knowledge-center/engineering', permanent: true },

      // ── Standards domain ─────────────────────────────────────────────────
      { source: '/knowledge-system/standards', destination: '/knowledge-center/standards', permanent: true },
      { source: '/knowledge-system/standards/lube-oil-systems', destination: '/knowledge-center/systems/lubrication-protection', permanent: true },
      { source: '/knowledge-system/standards/hydraulic-systems', destination: '/knowledge-center/systems/hydraulic-protection', permanent: true },
      { source: '/knowledge-system/standards/air-intake-systems', destination: '/knowledge-center/systems/air-intake-protection', permanent: true },
      { source: '/knowledge-system/standards/fuel-systems', destination: '/knowledge-center/systems/fuel-cleanliness-protection', permanent: true },
      { source: '/knowledge-system/standards/cabin-safety-systems', destination: '/knowledge-center/systems/cabin-air-protection', permanent: true },
      { source: '/knowledge-system/standards/compressed-air-systems', destination: '/knowledge-center/standards/iso-8573-1', permanent: true },
      { source: '/knowledge-system/standards/iso-16889', destination: '/knowledge-center/standards/iso-16889', permanent: true },
      { source: '/knowledge-system/standards/iso-4406', destination: '/knowledge-center/standards/iso-4406', permanent: true },
      { source: '/knowledge-system/standards/iso-5011', destination: '/knowledge-center/standards/iso-5011', permanent: true },

      // ── Contamination domain ─────────────────────────────────────────────
      { source: '/knowledge-system/contamination', destination: '/knowledge-center/engineering', permanent: true },
      { source: '/knowledge-system/contamination/hydraulic-system', destination: '/knowledge-center/engineering/contamination-control', permanent: true },
      { source: '/knowledge-system/contamination/particle-wear', destination: '/knowledge-center/engineering/contamination-control', permanent: true },
      { source: '/knowledge-system/contamination/diesel-water', destination: '/knowledge-center/engineering/fluid-cleanliness', permanent: true },
      { source: '/knowledge-system/contamination/varnish-formation', destination: '/knowledge-center/engineering/contamination-control', permanent: true },
      { source: '/knowledge-system/contamination/fuel-injector-wear', destination: '/knowledge-center/engineering/fluid-cleanliness', permanent: true },
      { source: '/knowledge-system/contamination/compressed-air-contamination', destination: '/knowledge-center/standards/iso-8573-1', permanent: true },
      { source: '/knowledge-system/contamination/coolant-contamination', destination: '/knowledge-center/systems/cooling-system-protection', permanent: true },

      // ── Fleet optimization domain ─────────────────────────────────────────
      { source: '/knowledge-system/fleet', destination: '/knowledge-center/technical-library', permanent: true },
      { source: '/knowledge-system/fleet/reducing-downtime', destination: '/knowledge-center/technical-library', permanent: true },
      { source: '/knowledge-system/fleet/fuel-efficiency', destination: '/knowledge-center/technical-library', permanent: true },
      { source: '/knowledge-system/fleet/total-cost-ownership', destination: '/knowledge-center/engineering/total-cost-of-ownership', permanent: true },
      { source: '/knowledge-system/fleet/roi-calculator', destination: '/knowledge-center/technical-library', permanent: true },

      // ── Bridges domain ───────────────────────────────────────────────────
      { source: '/knowledge-system/bridges', destination: '/knowledge-center', permanent: true },
      { source: '/knowledge-system/bridges/industrial-filtration', destination: '/knowledge-center', permanent: true },
      { source: '/knowledge-system/bridges/aftermarket-selection', destination: '/knowledge-center', permanent: true },
      { source: '/knowledge-system/bridges/fleet-solutions', destination: '/knowledge-center/technical-library', permanent: true },
      { source: '/knowledge-system/bridges/oem-replacement', destination: '/knowledge-center', permanent: true },

      // ── Compare domain ───────────────────────────────────────────────────
      { source: '/knowledge-system/compare', destination: '/knowledge-center', permanent: true },
      { source: '/knowledge-system/compare/evaluation-framework', destination: '/knowledge-center/technical-library', permanent: true },
      { source: '/knowledge-system/compare/oem-comparison', destination: '/knowledge-center', permanent: true },
      { source: '/knowledge-system/compare/system-vs-commodity', destination: '/knowledge-center', permanent: true },
      { source: '/knowledge-system/compare/total-cost-ownership', destination: '/knowledge-center/engineering/total-cost-of-ownership', permanent: true },
    ];
  },
};

export default nextConfig;
