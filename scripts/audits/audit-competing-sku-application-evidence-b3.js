'use strict';

const { Client } = require('pg');

const SUMMARY_ONLY = process.argv.includes('--summary-only');
const norm = v => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const txt = v => String(v || '').trim().toUpperCase();
const appKey = row => [
  txt(row.make),
  txt(row.model_family),
  txt(row.model_type),
  String(row.year || ''),
  txt(row.engine_code),
  String(row.filter_type || '')
].join('|');

const VALIDATED_DISTINCT_OVERLAPS = new Map([
  ['EA33172|EA31721|air','FP3172 vs FP3172/1: distinct cabin-filter steering-position variants'],
  ['EL39364|EL39503|oil','W936/4 vs WD950/3: distinct oil-filter geometry/thread specifications'],
  ['EA31318|EA36200|air','C271318 vs C16200: primary/secondary air-element pairing'],
  ['EA36724|EA31882|air','FP6724 cabin filter vs C1882 engine air filter'],
  ['EA34436|EA31287|air','FP4436 cabin filter vs C1287 engine air filter'],
  ['EF34218|EF34217|fuel','WK842/18 vs WK842/17: distinct MANN fuel-filter variants'],
  ['EF39016|EF30034|fuel','WK9016 vs WK10034Z: VW Amarok production/application split'],
  ['EL32881|EL39066|oil','PH6355 vs W9066: distinct oil-filter specifications'],
  ['EL34021|EL39403|oil','W940/21 vs W940/3: distinct MANN oil-filter valve/application specifications'],
  ['EA37200|EA36752|air','CS17200 vs C26752: distinct paired air elements with different geometry'],
  ['EA36724|EA32589|air','FP6724 cabin filter vs C2589 engine air filter'],
  ['EA32544|EA37237|air','FP2544 biofunctional cabin filter vs C17237 engine air filter'],
  ['EA10776|EA31003|air','P130776 / CF6001 safety-secondary element vs C11003 primary air element'],
  ['EA34602|EA39009|air','C19460/2 vs C19009: distinct MANN air-filter identities with similar geometry/applications'],
  ['EA10260|EA30504|air','C9002 vs C100504: distinct MANN primary air-filter identities; different dimensions/secondary elements with overlapping compact-equipment applications'],
  ['EC39653|EC36010|cabin','FP26010 FreciousPlus vs CU26010/CUK26010 particulate/activated-carbon cabin identities; same fitment family but distinct functional products']
]);

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
    const apps = (await db.query(`
      SELECT
        v.elimfilters_sku,v.source_sku,v.source_origin,
        v.make,v.model_family,v.model_type,v.year,v.engine_code,
        lower(coalesce(c.filter_type,'')) AS filter_type
      FROM ld_catalog.ld_vehicle_applications v
      JOIN public.elimfilters_catalog c ON c.sku=v.elimfilters_sku
    `)).rows;

    const resolver = (await db.query(`
      SELECT code,sku,status
      FROM public.v_api_resolver_v7
      WHERE coalesce(status,'') ~* 'RESOLVED|CANONICAL'
    `)).rows;

    const parents = (await db.query(`
      SELECT elimfilters_sku AS sku,source_sku AS code
      FROM ld_catalog.ld_product_catalog
    `)).rows;

    const publicIds = (await db.query(`
      SELECT
        sku,codigo_base,canonical_source_code,canonical_source_status,
        enrichment_data,
        vehicle_applications,equipment_applications
      FROM public.elimfilters_catalog
    `)).rows;

    const canonical = (await db.query(`
      SELECT elimfilters_sku AS sku,canonical_part_number AS code
      FROM ld_catalog.ld_canonical_product_identity
      WHERE status='ACTIVE'
    `)).rows;

    const evidence = (await db.query(`
      SELECT sku,source_code AS code
      FROM public.catalog_identity_evidence
      WHERE verified=true
    `)).rows;

    const competitor = (await db.query(`
      SELECT elimfilters_sku AS sku,competitor_part_number AS code
      FROM ld_catalog.ld_competitor_cross_references
    `)).rows;

    const oem = (await db.query(`
      SELECT elimfilters_sku AS sku,oem_part_number AS code
      FROM ld_catalog.ld_oem_cross_references
    `)).rows;

    const hermesBacklog = (await db.query(`
      SELECT sku,gap_type,status
      FROM hermes_catalogue_backlog
      WHERE status IN ('OPEN','REVIEW_REQUIRED')
    `)).rows;
    const hermesBySku = new Map();
    for (const row of hermesBacklog) {
      if (!hermesBySku.has(row.sku)) hermesBySku.set(row.sku,[]);
      hermesBySku.get(row.sku).push({ gap_type:row.gap_type,status:row.status });
    }

    const resolverOwners = new Map();
    for (const row of resolver) {
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

    for (const row of parents) add(row.sku,row.code,'PARENT_SOURCE');
    for (const row of publicIds) {
      add(row.sku,row.codigo_base,'PUBLIC_BASE');
      add(row.sku,row.canonical_source_code,'PUBLIC_CANONICAL');
    }
    for (const row of canonical) add(row.sku,row.code,'CANONICAL');
    for (const row of evidence) add(row.sku,row.code,'VERIFIED_EVIDENCE');
    for (const row of competitor) add(row.sku,row.code,'COMPETITOR');
    for (const row of oem) add(row.sku,row.code,'OEM');

    const publicBySku = new Map(publicIds.map(row => [row.sku,row]));
    const canonicalBySku = new Map(canonical.map(row => [row.sku,norm(row.code)]));
    const isStrongCanonical = sku => {
      const pub = publicBySku.get(sku) || {};
      const state = pub.enrichment_data?.codigo_base_governance?.state || '';
      return canonicalBySku.has(sku)
        && pub.canonical_source_status === 'VERIFIED'
        && state === 'CANONICAL_VERIFIED';
    };
    const appsBySku = new Map();
    const groups = new Map();

    for (const row of apps) {
      const key = appKey(row);
      const enriched = {
        ...row,
        key,
        source_n:norm(row.source_sku)
      };

      if (!appsBySku.has(row.elimfilters_sku)) {
        appsBySku.set(row.elimfilters_sku,[]);
      }
      appsBySku.get(row.elimfilters_sku).push(enriched);

      if (!groups.has(key)) {
        groups.set(key,{ key,members:new Map(),sample:row });
      }
      const group = groups.get(key);
      if (!group.members.has(row.elimfilters_sku)) {
        group.members.set(row.elimfilters_sku,new Set());
      }
      if (enriched.source_n) {
        group.members.get(row.elimfilters_sku).add(enriched.source_n);
      }
    }

    const b3Groups = [];

    for (const group of groups.values()) {
      if (group.members.size !== 2) continue;

      const sample = group.sample;
      if (
        !txt(sample.make)
        || !txt(sample.model_family)
        || !txt(sample.model_type)
        || !String(sample.year || '')
        || !txt(sample.engine_code)
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

      const ownerSet = new Set(uniqueOwnerCodes.map(row => row.owner));
      if (ownerSet.size !== 1) continue;

      const owner = [...ownerSet][0];
      const peer = skus.find(sku => sku !== owner);
      const peerSources = group.members.get(peer);

      const peerToOwner = [...peerSources].filter(code => {
        const owners = resolverOwners.get(code);
        return owners
          && owners.size === 1
          && [...owners][0] === owner;
      });

      if (peerToOwner.length !== 0) continue;

      b3Groups.push({
        group_key:group.key,
        owner,
        peer,
        filter_type:String(sample.filter_type || '')
      });
    }

    const pairMap = new Map();
    for (const group of b3Groups) {
      const key = [group.owner,group.peer,group.filter_type].join('|');
      if (!pairMap.has(key)) {
        pairMap.set(key,{
          owner:group.owner,
          peer:group.peer,
          filter_type:group.filter_type,
          competing_groups:0
        });
      }
      pairMap.get(key).competing_groups++;
    }

    const results = [];

    for (const pair of pairMap.values()) {
      const ownerRows = appsBySku.get(pair.owner) || [];
      const peerRows = appsBySku.get(pair.peer) || [];

      const ownerKeys = new Set(ownerRows.map(row => row.key));
      const peerKeys = new Set(peerRows.map(row => row.key));

      const overlap = [...peerKeys].filter(key => ownerKeys.has(key)).length;
      const peerOnly = [...peerKeys].filter(key => !ownerKeys.has(key)).length;
      const ownerOnly = [...ownerKeys].filter(key => !peerKeys.has(key)).length;

      const peerSources = new Set(
        peerRows.map(row => row.source_n).filter(Boolean)
      );
      const ownerSources = new Set(
        ownerRows.map(row => row.source_n).filter(Boolean)
      );

      let peerOwnIdentity = false;
      const peerPrimary = [];

      for (const code of peerSources) {
        const evidenceTypes = direct.get(pair.peer + '|' + code);
        if (evidenceTypes?.size) {
          peerOwnIdentity = true;
          peerPrimary.push({
            code,
            types:[...evidenceTypes].sort()
          });
        }
      }

      const peerResolverTargets = {};
      let peerSourceResolvesElsewhere = false;

      for (const code of peerSources) {
        const owners = resolverOwners.get(code);
        if (owners?.size === 1) {
          const target = [...owners][0];
          peerResolverTargets[code] = target;
          if (target !== pair.peer) peerSourceResolvesElsewhere = true;
        }
      }

      const publicRow = publicBySku.get(pair.peer) || {};
      const vehicleJsonCount = Array.isArray(publicRow.vehicle_applications)
        ? publicRow.vehicle_applications.length
        : 0;
      const equipmentJsonCount = Array.isArray(publicRow.equipment_applications)
        ? publicRow.equipment_applications.length
        : 0;
      const publicApplicationCount = vehicleJsonCount + equipmentJsonCount;

      const overlapRatio = peerKeys.size ? overlap / peerKeys.size : 0;

      let validatedDistinctReason = VALIDATED_DISTINCT_OVERLAPS.get(
        [pair.owner,pair.peer,pair.filter_type].join('|')
      ) || null;

      if (
        !validatedDistinctReason
        && peerOwnIdentity
        && peerOnly > 0
        && overlapRatio <= 0.2
        && !peerSourceResolvesElsewhere
        && isStrongCanonical(pair.owner)
        && isStrongCanonical(pair.peer)
        && canonicalBySku.get(pair.owner) !== canonicalBySku.get(pair.peer)
      ) {
        validatedDistinctReason = 'AUTO_STRONG_CANONICAL_LOW_OVERLAP: both SKUs are CANONICAL_VERIFIED with distinct ACTIVE canonical identities, peer has unique applications, overlap <= 20%, and peer source codes do not resolve elsewhere';
      }

      let bucket;
      if (validatedDistinctReason) {
        bucket = 'VALIDATED_DISTINCT_IDENTITY_OVERLAP';
      } else if (peerOwnIdentity && peerOnly > 0) {
        bucket = 'PEER_IDENTITY_WITH_UNIQUE_APPLICATIONS';
      } else if (peerOwnIdentity && peerOnly === 0) {
        bucket = 'PEER_IDENTITY_FULLY_OVERLAPS_OWNER';
      } else if (
        !peerOwnIdentity
        && peerOnly === 0
        && overlapRatio === 1
        && publicApplicationCount === 0
      ) {
        bucket = 'CLONE_CANDIDATE_STRONG';
      } else if (
        !peerOwnIdentity
        && peerOnly === 0
        && overlapRatio === 1
      ) {
        bucket = 'CLONE_CANDIDATE_WITH_PUBLIC_EVIDENCE';
      } else if (!peerOwnIdentity && peerOnly > 0) {
        bucket = 'PEER_NO_IDENTITY_WITH_UNIQUE_APPLICATIONS';
      } else {
        bucket = 'MIXED_REVIEW';
      }

      const hermesCoverage = hermesBySku.get(pair.peer) || [];
      let automationLane;
      let laneAction;
      if (bucket === 'VALIDATED_DISTINCT_IDENTITY_OVERLAP') {
        automationLane = 'VALIDATED_DISTINCT';
        laneAction = 'NO_CATALOG_MUTATION';
      } else if (peerSourceResolvesElsewhere) {
        automationLane = 'RESOLVER_COLLISION';
        laneAction = 'REOWN_ONLY_AFTER_BOTH_GATEWAYS_PASS';
      } else if (peerSources.size > 1 || ownerSources.size > 1) {
        automationLane = 'MULTI_SOURCE';
        laneAction = hermesCoverage.some(x => x.gap_type === 'SOURCE')
          ? 'HERMES_SOURCE_RESEARCH'
          : hermesCoverage.some(x => x.gap_type === 'APPLICATIONS')
            ? 'HERMES_APPLICATION_RESEARCH'
            : 'HERMES_GAP_REVIEW';
      } else if (overlapRatio >= 0.8) {
        automationLane = 'HIGH_OVERLAP_REVIEW';
        laneAction = 'SPECIFIC_IDENTITY_OR_SUPERSESSION_REVIEW';
      } else if (overlapRatio <= 0.2) {
        automationLane = 'LOW_OVERLAP_REVIEW';
        laneAction = 'AUTO_VALIDATE_ONLY_WITH_STRONG_CANONICAL_RULE';
      } else {
        automationLane = 'STANDARD_REVIEW';
        laneAction = 'SPECIFIC_RELATION_REVIEW';
      }

      results.push({
        ...pair,
        automation_lane:automationLane,
        lane_action:laneAction,
        hermes_coverage:hermesCoverage,
        owner_application_keys:ownerKeys.size,
        peer_application_keys:peerKeys.size,
        overlap_keys:overlap,
        peer_only_keys:peerOnly,
        owner_only_keys:ownerOnly,
        overlap_ratio:Number(overlapRatio.toFixed(6)),
        peer_sources:[...peerSources].sort(),
        owner_sources:[...ownerSources].sort(),
        peer_origins:[
          ...new Set(peerRows.map(row => row.source_origin || '<NULL>'))
        ].sort(),
        peer_own_identity:peerOwnIdentity,
        peer_primary:peerPrimary,
        peer_source_resolves_elsewhere:peerSourceResolvesElsewhere,
        peer_resolver_targets:peerResolverTargets,
        public_application_count:publicApplicationCount,
        validated_distinct_reason:validatedDistinctReason || null,
        bucket
      });
    }

    const pairSummary = {};
    const groupSummary = {};
    const peerSummary = {};

    for (const row of results) {
      pairSummary[row.bucket] = (pairSummary[row.bucket] || 0) + 1;
      groupSummary[row.bucket]
        = (groupSummary[row.bucket] || 0) + row.competing_groups;

      if (!peerSummary[row.bucket]) peerSummary[row.bucket] = new Set();
      peerSummary[row.bucket].add(row.peer);
    }

    const peerCounts = {};
    for (const [bucket,peers] of Object.entries(peerSummary)) {
      peerCounts[bucket] = peers.size;
    }

    const laneSummary = {};
    const lanePeers = {};
    for (const row of results) {
      const lane = row.automation_lane || 'UNCLASSIFIED';
      laneSummary[lane] = (laneSummary[lane] || 0) + 1;
      if (!lanePeers[lane]) lanePeers[lane] = new Set();
      lanePeers[lane].add(row.peer);
    }
    const lanePeerCounts = Object.fromEntries(
      Object.entries(lanePeers).map(([lane,peers]) => [lane,peers.size])
    );

    const top_pairs = results
      .slice()
      .sort((a,b) => b.competing_groups - a.competing_groups)
      .slice(0,80);

    const report = {
      generated_at:new Date().toISOString(),
      readonly:true,
      b3_competing_groups:b3Groups.length,
      b3_pairs:results.length,
      pair_summary:pairSummary,
      competing_groups_by_bucket:groupSummary,
      unique_peers_by_bucket:peerCounts,
      lane_summary:laneSummary,
      unique_peers_by_lane:lanePeerCounts,
      top_pairs,
      pairs:results
    };

    console.log(JSON.stringify(
      SUMMARY_ONLY
        ? {
            generated_at:report.generated_at,
            readonly:true,
            b3_competing_groups:report.b3_competing_groups,
            b3_pairs:report.b3_pairs,
            pair_summary:report.pair_summary,
            competing_groups_by_bucket:report.competing_groups_by_bucket,
            unique_peers_by_bucket:report.unique_peers_by_bucket,
            lane_summary:report.lane_summary,
            unique_peers_by_lane:report.unique_peers_by_lane,
            top_pairs:report.top_pairs.slice(0,25)
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
