import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

/**
 * Public, unauthenticated HTTPS discovery agent.
 * Read-only; returns only existing canonical public resources.
 * It has no access to CRM, PostgreSQL, private agents or fitment data.
 */
const resources = Object.freeze({
  catalog: {
    rel: 'catalog',
    href: 'https://elimfilters.com/.well-known/ai-catalog.json',
    contentType: 'application/json',
  },
  documentation: {
    rel: 'documentation',
    href: 'https://elimfilters.com/llms.txt',
    contentType: 'text/plain',
  },
  sitemap: {
    rel: 'sitemap',
    href: 'https://elimfilters.com/sitemap-index.xml',
    contentType: 'application/xml',
  },
});

export function GET() {
  return NextResponse.json({
    schemaVersion: '1.0',
    agent: 'public-discovery',
    protocol: 'https',
    mode: 'read-only',
    description: 'Public ELIMFILTERS engineering and website resource discovery',
    capabilities: ['list-public-resources'],
    resources: Object.values(resources),
    restrictions: {
      noPrivateAgents: true,
      noCatalogFitmentAssertions: true,
      noDatabaseAccess: true,
      noMutations: true,
    },
  }, {headers: {'Cache-Control': 'public, max-age=300'}});
}

