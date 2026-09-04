const fs = require('fs');
const path = require('path');

describe('Keyword demand graph isolation', () => {
  const graphPath = path.join(process.cwd(), 'frontend/src/lib/knowledge-center/keyword-demand-graph.ts');
  const graph = fs.readFileSync(graphPath, 'utf8');

  test('keeps search-demand nodes non-public and non-indexable', () => {
    expect(graph).toContain('publicEntity: false');
    expect(graph).toContain('indexable: false');
    expect(graph).toContain('includeInCanonicalEntityNodes: false');
    expect(graph).toContain('includeInSitemap: false');
    expect(graph).toContain('createRoutesAutomatically: false');
  });

  test('connects every keyword to one owner and its graph parents', () => {
    expect(graph).toContain("type: 'owned-by' as const");
    expect(graph).toContain("type: 'supports-entity' as const");
    expect(graph).toContain('node.graphParents.map');
  });

  test('allows editorial and HERMES prioritization without publishing routes', () => {
    expect(graph).toContain('mayDriveEditorialReview: true');
    expect(graph).toContain('mayDriveHermesPrioritization: true');
  });
});
