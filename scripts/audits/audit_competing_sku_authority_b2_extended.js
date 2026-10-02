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
        v.elimfilters_sku,v.source_sku,
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
    const parents = await db.query(`
      SELECT elimfilters_sku AS sku,source_sku AS code
      FROM ld_catalog.ld_product_catalog
    `);
    const publicIds = await db.query(`
      SELECT sku,codigo_base,canonical_source_code
      FROM public.elimfilters_catalog
    `);
    const canonical = await db.query(`
      SELECT elimfilters_sku AS sku,canonical_part_number AS code
      FROM ld_catalog.ld_canonical_product_identity
      WHERE status='ACTIVE'
    `);
    const evidence = await db.query(`
      SELECT sku,source_code AS code
      FROM public.catalog_identity_evidence
      WHERE verified=true
    `);

    const resolverOwners = new Map();
    for (const row of resolver.rows) {
      const code = norm(row.code);
      if (!code) continue;
      if (!resolverOwners.has(code)) resolverOwners.set(code,new Set());
      resolverOwners.get(code).add(row.sku);
    }

    const primary = new Map();
    const addPrimary = (sku,code,type) => {
      code = norm(code);
      if (!code) return;
      const key = String(sku || '') + '|' + code;
      if (!primary.has(key)) primary.set(key,new Set());
      primary.get(key).add(type);
    };
    for (const row of parents.rows) addPrimary(row.sku,row.code,'PARENT_SOURCE');
    for (const row of publicIds.rows) {
      addPrimary(row.sku,row.codigo_base,'PUBLIC_BASE');
      addPrimary(row.sku,row.canonical_source_code,'PUBLIC_CANONICAL');
    }
    for (const row of canonical.rows) addPrimary(row.sku,row.code,'CANONICAL');
    for (const row of evidence.rows) addPrimary(row.sku,row.code,'VERIFIED_EVIDENCE');

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
        group.members.set(row.elimfilters_sku,new Set());
      }
      const source = norm(row.source_sku);
      if (source) group.members.get(row.elimfilters_sku).add(source);
    }

    const classified = [];
    for (const group of groups.values()) {
      if (group.members.size < 2) continue;
      if (
        !group.make || !group.model_family || !group.model_type
        || !group.year || !group.engine_code
      ) continue;

      const skus = [...group.members.keys()].sort();
      const sourceUnion = new Set();
      for (const sources of group.members.values()) {
        for (const code of sources) sourceUnion.add(code);
      }

      const uniqueOwnerCodes = [];
      for (const code of sourceUnion) {
        const owners = resolverOwners.get(code);
        if (owners && owners.size === 1) {
          const owner = [...owners][0];
          if (skus.includes(owner)) uniqueOwnerCodes.push({ code,owner });
        }
      }
      if (!uniqueOwnerCodes.length) continue;

      let bucket;
      let detail = {};

      if (skus.length > 2) {
        bucket = 'GT2_SKUS';
        detail = {
          sku_count:skus.length,
          owners:[...new Set(uniqueOwnerCodes.map(x => x.owner))].sort()
        };
      } else {
        const ownerSet = new Set(uniqueOwnerCodes.map(x => x.owner));
        if (ownerSet.size > 1) {
          bucket = 'MULTI_OWNER_WITHIN_GROUP';
          detail = {
            owners:[...ownerSet].sort(),
            codes:uniqueOwnerCodes
          };
        } else {
          const owner = [...ownerSet][0];
          const peer = skus.find(sku => sku !== owner);
          const peerSources = group.members.get(peer);
          const ownerSources = group.members.get(owner);

          const peerToOwner = [...peerSources].filter(code => {
            const owners = resolverOwners.get(code);
            return owners && owners.size === 1 && [...owners][0] === owner;
          });
          const ownerSelf = [...ownerSources].filter(code => {
            const owners = resolverOwners.get(code);
            return owners && owners.size === 1 && [...owners][0] === owner;
          });

          const peerPrimary = [];
          for (const code of peerSources) {
            const ev = primary.get(peer + '|' + code);
            if (ev?.size) {
              peerPrimary.push({ code,types:[...ev].sort() });
            }
          }

          if (peerSources.size > 1) {
            bucket = 'MULTI_SOURCE_PEER';
            detail = {
              owner,peer,
              peer_sources:[...peerSources].sort(),
              peer_to_owner:peerToOwner.sort(),
              peer_primary:peerPrimary
            };
          } else if (peerToOwner.length === 0) {
            bucket = 'OWNER_SIGNAL_COMES_FROM_OWNER_SIDE';
            detail = {
              owner,peer,
              peer_sources:[...peerSources].sort(),
              owner_sources:[...ownerSources].sort(),
              owner_self_codes:ownerSelf.sort()
            };
          } else if (peerPrimary.length) {
            bucket = 'PRIMARY_IDENTITY_CONFLICT';
            detail = {
              owner,peer,
              peer_sources:[...peerSources].sort(),
              peer_primary:peerPrimary
            };
          } else if (peerToOwner.length === peerSources.size) {
            bucket = 'STRICT_SAFE_CANDIDATE';
            detail = {
              owner,peer,
              peer_sources:[...peerSources].sort()
            };
          } else {
            bucket = 'PARTIAL_PEER_RESOLUTION';
            detail = {
              owner,peer,
              peer_sources:[...peerSources].sort(),
              peer_to_owner:peerToOwner.sort()
            };
          }
        }
      }

      classified.push({
        application_key:group.key,
        make:group.make,
        model_family:group.model_family,
        model_type:group.model_type,
        year:group.year,
        engine_code:group.engine_code,
        filter_type:group.filter_type,
        skus,
        bucket,
        ...detail
      });
    }

    const summary = {};
    const pairCounts = new Map();
    for (const row of classified) {
      summary[row.bucket] = (summary[row.bucket] || 0) + 1;
      if (row.owner && row.peer) {
        const key = [row.bucket,row.owner,row.peer,row.filter_type].join('|');
        pairCounts.set(key,(pairCounts.get(key) || 0) + 1);
      }
    }

    const top_pairs = [...pairCounts.entries()]
      .sort((a,b) => b[1] - a[1])
      .slice(0,100)
      .map(([key,groups]) => {
        const [bucket,owner,peer,filter_type] = key.split('|');
        return { bucket,owner,peer,filter_type,groups };
      });

    const report = {
      generated_at:new Date().toISOString(),
      readonly:true,
      b1_unique_resolver_groups:classified.length,
      summary,
      top_pairs,
      groups:classified
    };

    console.log(JSON.stringify(
      SUMMARY_ONLY
        ? {
            generated_at:report.generated_at,
            readonly:true,
            b1_unique_resolver_groups:report.b1_unique_resolver_groups,
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
