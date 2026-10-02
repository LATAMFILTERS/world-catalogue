'use strict';

const { Client } = require('pg');

const SUMMARY_ONLY = process.argv.includes('--summary-only');
const norm = v => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const txt = v => String(v || '').trim().toUpperCase();

async function main() {
  const url = process.env.CATALOG_DATABASE_URL
    || process.env.ELIMFILTERS_DATABASE_URL
    || process.env.DATABASE_URL;
  if (!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');

  const db = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });
  await db.connect();

  try {
    const apps = await db.query(`
      SELECT
        v.id,v.elimfilters_sku,v.source_sku,
        v.make,v.model_family,v.model_type,v.year,v.engine_code,
        lower(coalesce(c.filter_type,'')) AS filter_type
      FROM ld_catalog.ld_vehicle_applications v
      JOIN public.elimfilters_catalog c ON c.sku=v.elimfilters_sku
    `);
    const resolver = await db.query(`
      SELECT code,sku,status
      FROM public.v_api_resolver_v7
      WHERE coalesce(status,'') ~* 'RESOLVED|CANONICAL'
    `);
    const canonical = await db.query(`
      SELECT elimfilters_sku AS sku,canonical_part_number AS code
      FROM ld_catalog.ld_canonical_product_identity
      WHERE status='ACTIVE'
    `);
    const competitor = await db.query(`
      SELECT elimfilters_sku AS sku,competitor_part_number AS code
      FROM ld_catalog.ld_competitor_cross_references
    `);
    const oem = await db.query(`
      SELECT elimfilters_sku AS sku,oem_part_number AS code
      FROM ld_catalog.ld_oem_cross_references
    `);
    const evidence = await db.query(`
      SELECT sku,source_code AS code
      FROM public.catalog_identity_evidence
      WHERE verified=true
    `);
    const parents = await db.query(`
      SELECT elimfilters_sku AS sku,source_sku AS code
      FROM ld_catalog.ld_product_catalog
    `);
    const publicIds = await db.query(`
      SELECT sku,codigo_base,canonical_source_code
      FROM public.elimfilters_catalog
    `);

    const resolverOwners = new Map();
    for (const row of resolver.rows) {
      const code = norm(row.code);
      if (!code) continue;
      if (!resolverOwners.has(code)) resolverOwners.set(code,new Set());
      resolverOwners.get(code).add(row.sku);
    }

    const direct = new Map();
    const add = (sku,code,type) => {
      code = norm(code);
      if (!code) return;
      const key = String(sku || '') + '|' + code;
      if (!direct.has(key)) direct.set(key,new Set());
      direct.get(key).add(type);
    };
    for (const r of canonical.rows) add(r.sku,r.code,'CANONICAL');
    for (const r of competitor.rows) add(r.sku,r.code,'COMPETITOR');
    for (const r of oem.rows) add(r.sku,r.code,'OEM');
    for (const r of evidence.rows) add(r.sku,r.code,'VERIFIED_EVIDENCE');
    for (const r of parents.rows) add(r.sku,r.code,'PARENT_SOURCE');
    for (const r of publicIds.rows) {
      add(r.sku,r.codigo_base,'PUBLIC_BASE');
      add(r.sku,r.canonical_source_code,'PUBLIC_CANONICAL');
    }

    const groups = new Map();
    for (const row of apps.rows) {
      const key = [
        txt(row.make),txt(row.model_family),txt(row.model_type),
        String(row.year || ''),txt(row.engine_code),String(row.filter_type || '')
      ].join('|');
      if (!groups.has(key)) {
        groups.set(key,{
          key,
          make:txt(row.make),
          model_family:txt(row.model_family),
          model_type:txt(row.model_type),
          year:String(row.year || ''),
          engine_code:txt(row.engine_code),
          filter_type:String(row.filter_type || ''),
          members:new Map()
        });
      }
      const group = groups.get(key);
      if (!group.members.has(row.elimfilters_sku)) {
        group.members.set(row.elimfilters_sku,[]);
      }
      group.members.get(row.elimfilters_sku).push({
        id:row.id,
        source:norm(row.source_sku),
        raw_source:row.source_sku
      });
    }

    const classified = [];
    for (const group of groups.values()) {
      if (group.members.size !== 2) continue;
      if (!group.make || !group.model_family || !group.model_type
        || !group.year || !group.engine_code) continue;

      const skus = [...group.members.keys()].sort();
      const sourcesBySku = new Map();
      for (const sku of skus) {
        sourcesBySku.set(
          sku,
          new Set(group.members.get(sku).map(x => x.source).filter(Boolean))
        );
      }

      const edges = [];
      for (const sku of skus) {
        for (const code of sourcesBySku.get(sku)) {
          const owners = resolverOwners.get(code);
          if (owners && owners.size === 1) {
            const owner = [...owners][0];
            if (skus.includes(owner) && owner !== sku) {
              edges.push({ code,owner,source_sku:sku });
            }
          }
        }
      }
      if (!edges.length) continue;

      const ownerSet = new Set(edges.map(x => x.owner));
      if (ownerSet.size !== 1) continue;
      const owner = [...ownerSet][0];
      const peer = skus.find(sku => sku !== owner);
      const peerSources = sourcesBySku.get(peer);
      const peerEdges = edges.filter(
        edge => edge.source_sku === peer && edge.owner === owner
      );
      if (!peerEdges.length) continue;

      const evidenceRows = [];
      let peerDirect = false;
      let ownerDirect = false;
      for (const code of peerSources) {
        const ownerEvidence = direct.get(owner + '|' + code);
        const peerEvidence = direct.get(peer + '|' + code);
        if (ownerEvidence?.size) {
          ownerDirect = true;
          evidenceRows.push({
            sku:owner,code,types:[...ownerEvidence].sort()
          });
        }
        if (peerEvidence?.size) {
          peerDirect = true;
          evidenceRows.push({
            sku:peer,code,types:[...peerEvidence].sort()
          });
        }
      }

      const resolvedPeerCodes = new Set(peerEdges.map(x => x.code));
      const allPeerCodesResolveToOwner = [...peerSources]
        .every(code => resolvedPeerCodes.has(code));

      let bucket = 'SAFE_REOWN';
      if (peerDirect) {
        bucket = 'HOLD_DUAL_EVIDENCE';
      } else if (
        peerSources.size !== 1
        || !allPeerCodesResolveToOwner
      ) {
        bucket = 'HOLD_PLATFORM_VARIANT';
      }

      classified.push({
        application_key:group.key,
        make:group.make,
        model_family:group.model_family,
        model_type:group.model_type,
        year:group.year,
        engine_code:group.engine_code,
        filter_type:group.filter_type,
        owner,
        peer,
        owner_sources:[...sourcesBySku.get(owner)].sort(),
        peer_sources:[...peerSources].sort(),
        resolver_codes:peerEdges.map(x => x.code).sort(),
        owner_direct:ownerDirect,
        peer_direct:peerDirect,
        evidence:evidenceRows,
        bucket
      });
    }

    const summary = {};
    const pairCounts = new Map();
    for (const row of classified) {
      summary[row.bucket] = (summary[row.bucket] || 0) + 1;
      const key = [row.bucket,row.owner,row.peer,row.filter_type].join('|');
      pairCounts.set(key,(pairCounts.get(key) || 0) + 1);
    }

    const top_pairs = [...pairCounts.entries()]
      .sort((a,b) => b[1] - a[1])
      .slice(0,50)
      .map(([key,groups]) => {
        const [bucket,owner,peer,filter_type] = key.split('|');
        return { bucket,owner,peer,filter_type,groups };
      });

    const report = {
      generated_at:new Date().toISOString(),
      readonly:true,
      classified_groups:classified.length,
      summary,
      top_pairs,
      groups:classified
    };

    console.log(JSON.stringify(
      SUMMARY_ONLY
        ? {
            generated_at:report.generated_at,
            readonly:true,
            classified_groups:report.classified_groups,
            summary:report.summary,
            top_pairs:report.top_pairs
          }
        : report,
      null,
      2
    ));
  } finally {
    await db.end();
  }
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
