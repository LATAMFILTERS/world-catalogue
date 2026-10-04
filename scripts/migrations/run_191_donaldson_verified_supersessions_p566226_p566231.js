'use strict';

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { normalizeCode } = require('../../lib/donaldson-official-evidence');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const EXECUTE = process.argv.includes('--execute');

const BATCH = Object.freeze([
  Object.freeze({ sku:'EH66226', current:'P566226', predecessor:'P165584', relationship:'SUPERSESSION', reference_type:'SUPERSEDED' }),
  Object.freeze({ sku:'EH66227', current:'P566227', predecessor:'P165585', relationship:'SUPERSESSION', reference_type:'SUPERSEDED' }),
  Object.freeze({ sku:'EH66228', current:'P566228', predecessor:'P165586', relationship:'OFFICIAL_CROSS_REFERENCE', reference_type:'COMPETITOR', operator_confirmed:true }),
  Object.freeze({ sku:'EH66230', current:'P566230', predecessor:'P169436', relationship:'SUPERSESSION', reference_type:'SUPERSEDED' }),
  Object.freeze({ sku:'EH66231', current:'P566231', predecessor:'P165587', relationship:'SUPERSESSION', reference_type:'SUPERSEDED' }),
]);

function sourceUrl(predecessor) {
  return `https://shop.donaldson.com/store/en-us/search?Ntt=${encodeURIComponent(predecessor)}`;
}

async function fetchSupersessionEvidence(item) {
  const url = sourceUrl(item.predecessor);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, { redirect:'follow', signal:controller.signal });
    if (!response.ok) return { ok:false, reason:`HTTP_${response.status}`, url };
    const html = await response.text();
    const normalized = normalizeCode(html);
    const oldCode = normalizeCode(item.predecessor);
    const currentCode = normalizeCode(item.current);
    const oldPresent = normalized.includes(oldCode);
    const currentPresent = normalized.includes(currentCode);
    if (item.relationship === 'SUPERSESSION' && (!oldPresent || !currentPresent)) {
      return { ok:false, reason:'OFFICIAL_SUPERSESSION_RESULT_DID_NOT_CONTAIN_BOTH_CODES', url:response.url || url };
    }
    if (item.relationship === 'OFFICIAL_CROSS_REFERENCE' && (!oldPresent || item.operator_confirmed !== true)) {
      return { ok:false, reason:'OFFICIAL_CROSS_REFERENCE_NOT_CONFIRMED', url:response.url || url };
    }
    return {
      ok:true,
      url:response.url || url,
      hash:crypto.createHash('sha256').update(html).digest('hex'),
      current_present:currentPresent,
      operator_confirmed:item.operator_confirmed === true,
    };
  } catch (error) {
    return { ok:false, reason:error?.name === 'AbortError' ? 'FETCH_TIMEOUT' : 'FETCH_FAILED', url };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB_URL_MISSING');
  const parsed = new URL(url);
  const loopback = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost';
  const allowedPort = parsed.port === '5432' || parsed.port === '5441';
  if (!loopback || !allowedPort || parsed.pathname !== '/catalogo_elimfilters') {
    throw new Error('REFUSE_NON_CANONICAL_DB');
  }

  const db = new Client({ connectionString:url, ssl:{ rejectUnauthorized:false } });
  await db.connect();

  const report = {
    migration:'191_DONALDSON_VERIFIED_SUPERSESSIONS_P566226_P566231',
    mode:EXECUTE ? 'execute' : 'dry-run',
    selected:BATCH.length,
    verified:0,
    unresolved:0,
    mutations:{ sku:0, codigo_base:0, alternates:0, supersession:0, official_cross_reference:0, exact_reference:0, constraint_extension:0 },
    details:[],
  };

  try {
    const typeConstraint = await db.query(`
      SELECT pg_get_constraintdef(oid) AS definition
      FROM pg_constraint
      WHERE conrelid='public.exact_part_reference'::regclass
        AND conname='exact_part_reference_reference_type_check'
    `);
    if (typeConstraint.rowCount !== 1) throw new Error('EXACT_REFERENCE_TYPE_CONSTRAINT_MISSING');
    const typeDefinition = String(typeConstraint.rows[0].definition || '');
    const supersededAllowed = typeDefinition.includes('SUPERSEDED');

    if (EXECUTE && !supersededAllowed) {
      await db.query('BEGIN');
      try {
        await db.query(`
          ALTER TABLE public.exact_part_reference
          DROP CONSTRAINT exact_part_reference_reference_type_check
        `);
        await db.query(`
          ALTER TABLE public.exact_part_reference
          ADD CONSTRAINT exact_part_reference_reference_type_check
          CHECK (reference_type IN ('OEM','COMPETITOR','SUPERSEDED'))
        `);
        await db.query('COMMIT');
        report.mutations.constraint_extension = 1;
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    }

    for (const item of BATCH) {
      const beforeResult = await db.query(
        `SELECT * FROM public.elimfilters_catalog WHERE sku=$1`,
        [item.sku],
      );
      if (beforeResult.rowCount !== 1) throw new Error(`SKU_NOT_UNIQUE:${item.sku}`);
      const before = beforeResult.rows[0];
      const gov = before.enrichment_data?.codigo_base_governance || {};

      const baselineOk =
        before.duty === 'HEAVY_DUTY' &&
        before.filter_type === 'hydraulic' &&
        before.canonical_source_brand === 'DONALDSON' &&
        before.canonical_source_status === 'VERIFIED' &&
        normalizeCode(before.codigo_base) === normalizeCode(item.current) &&
        normalizeCode(before.canonical_source_code) === normalizeCode(item.current) &&
        gov.state === 'CANONICAL_VERIFIED' &&
        gov.primary_manufacturer_verified === true;

      if (!baselineOk) {
        report.unresolved += 1;
        report.details.push({ sku:item.sku, status:'UNRESOLVED', reason:'BASELINE_CHANGED' });
        continue;
      }

      const conflicts = await db.query(
        `SELECT id,reference_type,brand,part_number,sku,source
           FROM public.exact_part_reference
          WHERE upper(regexp_replace(part_number,'[^A-Z0-9]','','g'))=$1
            AND upper(brand)='DONALDSON'
          ORDER BY id`,
        [normalizeCode(item.predecessor)],
      );
      const otherSku = conflicts.rows.find((row) => row.sku !== item.sku);
      if (otherSku) {
        report.unresolved += 1;
        report.details.push({
          sku:item.sku,
          status:'UNRESOLVED',
          reason:'PREDECESSOR_ALREADY_RESOLVES_TO_DIFFERENT_SKU',
          conflict:otherSku,
        });
        continue;
      }

      const evidence = await fetchSupersessionEvidence(item);
      if (!evidence.ok) {
        report.unresolved += 1;
        report.details.push({ sku:item.sku, status:'UNRESOLVED', reason:evidence.reason, evidence_url:evidence.url });
        continue;
      }

      const now = new Date().toISOString();
      const relationEvidence = {
        part_number:item.predecessor,
        relationship:item.relationship === 'SUPERSESSION' ? 'REPLACES' : 'OFFICIAL_CROSS_REFERENCE',
        manufacturer:'DONALDSON',
        status:'VERIFIED',
        evidence_authority:item.relationship === 'SUPERSESSION'
          ? 'OFFICIAL_DONALDSON_SHOP'
          : 'OPERATOR_CONFIRMED_DONALDSON_SEARCH',
        evidence_kind:item.relationship === 'SUPERSESSION'
          ? 'OFFICIAL_SUPERSESSION_SEARCH_RESULT'
          : 'OFFICIAL_SEARCH_RESULT_OPERATOR_CONFIRMED',
        source_url:evidence.url,
        evidence_hash:evidence.hash,
        verified_at:now,
        operator_confirmed:item.operator_confirmed === true || item.relationship === 'SUPERSESSION',
      };

      const nextData = { ...(before.enrichment_data || {}) };
      if (item.relationship === 'SUPERSESSION') {
        const priorSupersession =
          nextData.supersession && typeof nextData.supersession === 'object' && !Array.isArray(nextData.supersession)
            ? nextData.supersession
            : {};
        const priorPredecessors = Array.isArray(priorSupersession.predecessors)
          ? priorSupersession.predecessors
          : [];
        nextData.supersession = {
          ...priorSupersession,
          policy_version:'2026-10-04-v1',
          relationship_type:'SUPERSESSION',
          manufacturer:'DONALDSON',
          current_part:item.current,
          status:'VERIFIED',
          predecessors:[
            ...priorPredecessors.filter((p) => normalizeCode(p?.part_number) !== normalizeCode(item.predecessor)),
            relationEvidence,
          ],
        };
      } else {
        const priorRelationships =
          nextData.reference_relationships && typeof nextData.reference_relationships === 'object' && !Array.isArray(nextData.reference_relationships)
            ? nextData.reference_relationships
            : {};
        const priorCrosses = Array.isArray(priorRelationships.official_cross_references)
          ? priorRelationships.official_cross_references
          : [];
        nextData.reference_relationships = {
          ...priorRelationships,
          policy_version:'2026-10-04-v1',
          official_cross_references:[
            ...priorCrosses.filter((p) => normalizeCode(p?.part_number) !== normalizeCode(item.predecessor)),
            relationEvidence,
          ],
        };
      }

      const gateway = assertGovernedCatalogPatch(before, { enrichment_data:nextData });
      if (gateway.valid !== true) throw new Error(`GATEWAY_REJECTED:${item.sku}`);

      report.verified += 1;
      report.details.push({
        sku:item.sku,
        status:'READY',
        current_part:item.current,
        relationship:item.relationship,
        related_part:item.predecessor,
        evidence_url:evidence.url,
      });

      if (!EXECUTE) continue;

      await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
      try {
        const lockedResult = await db.query(
          `SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE`,
          [item.sku],
        );
        if (lockedResult.rowCount !== 1) throw new Error(`LOCK_FAILED:${item.sku}`);
        const locked = lockedResult.rows[0];
        const lockedGov = locked.enrichment_data?.codigo_base_governance || {};

        if (
          normalizeCode(locked.codigo_base) !== normalizeCode(item.current) ||
          locked.canonical_source_brand !== 'DONALDSON' ||
          locked.canonical_source_status !== 'VERIFIED' ||
          lockedGov.state !== 'CANONICAL_VERIFIED' ||
          lockedGov.primary_manufacturer_verified !== true
        ) {
          throw new Error(`EXECUTION_BASELINE_CHANGED:${item.sku}`);
        }

        const lockedData = { ...(locked.enrichment_data || {}) };
        if (item.relationship === 'SUPERSESSION') {
          const prior = lockedData.supersession && typeof lockedData.supersession === 'object' && !Array.isArray(lockedData.supersession)
            ? lockedData.supersession
            : {};
          const priorPredecessors = Array.isArray(prior.predecessors) ? prior.predecessors : [];
          lockedData.supersession = {
            ...prior,
            policy_version:'2026-10-04-v1',
            relationship_type:'SUPERSESSION',
            manufacturer:'DONALDSON',
            current_part:item.current,
            status:'VERIFIED',
            predecessors:[
              ...priorPredecessors.filter((p) => normalizeCode(p?.part_number) !== normalizeCode(item.predecessor)),
              relationEvidence,
            ],
          };
        } else {
          const prior = lockedData.reference_relationships && typeof lockedData.reference_relationships === 'object' && !Array.isArray(lockedData.reference_relationships)
            ? lockedData.reference_relationships
            : {};
          const priorCrosses = Array.isArray(prior.official_cross_references) ? prior.official_cross_references : [];
          lockedData.reference_relationships = {
            ...prior,
            policy_version:'2026-10-04-v1',
            official_cross_references:[
              ...priorCrosses.filter((p) => normalizeCode(p?.part_number) !== normalizeCode(item.predecessor)),
              relationEvidence,
            ],
          };
        }
        assertGovernedCatalogPatch(locked, { enrichment_data:lockedData });

        const existingConflict = await db.query(
          `SELECT id,sku
             FROM public.exact_part_reference
            WHERE upper(regexp_replace(part_number,'[^A-Z0-9]','','g'))=$1
              AND upper(brand)='DONALDSON'
              AND sku<>$2
            LIMIT 1
            FOR UPDATE`,
          [normalizeCode(item.predecessor), item.sku],
        );
        if (existingConflict.rowCount) throw new Error(`EXACT_REFERENCE_CONFLICT:${item.predecessor}`);

        const updated = await db.query(
          `UPDATE public.elimfilters_catalog
              SET enrichment_data=$1::jsonb
            WHERE sku=$2
              AND codigo_base IS NOT DISTINCT FROM $3
              AND canonical_source_status='VERIFIED'
            RETURNING sku,codigo_base,enrichment_data`,
          [JSON.stringify(lockedData), item.sku, locked.codigo_base],
        );
        if (updated.rowCount !== 1) throw new Error(`CATALOG_CAS_FAILED:${item.sku}`);

        const existing = await db.query(
          `SELECT id,reference_type,sku
             FROM public.exact_part_reference
            WHERE upper(regexp_replace(part_number,'[^A-Z0-9]','','g'))=$1
              AND upper(brand)='DONALDSON'
              AND sku=$2
            ORDER BY id DESC
            LIMIT 1`,
          [normalizeCode(item.predecessor), item.sku],
        );

        const referenceSource = item.relationship === 'SUPERSESSION'
          ? 'DONALDSON_OFFICIAL_SUPERSESSION'
          : 'DONALDSON_OFFICIAL_CROSS_REFERENCE_OPERATOR_CONFIRMED';

        if (existing.rowCount === 0) {
          const inserted = await db.query(
            `INSERT INTO public.exact_part_reference
               (reference_type,brand,part_number,sku,source)
             VALUES ($1,'DONALDSON',$2,$3,$4)
             RETURNING id`,
            [item.reference_type, item.predecessor, item.sku, referenceSource],
          );
          if (inserted.rowCount !== 1) throw new Error(`EXACT_REFERENCE_INSERT_FAILED:${item.sku}`);
          report.mutations.exact_reference += 1;
        } else if (
          existing.rows[0].reference_type !== item.reference_type ||
          existing.rows[0].source !== referenceSource
        ) {
          const changed = await db.query(
            `UPDATE public.exact_part_reference
                SET reference_type=$1,
                    source=$2
              WHERE id=$3
              RETURNING id`,
            [item.reference_type, referenceSource, existing.rows[0].id],
          );
          if (changed.rowCount !== 1) throw new Error(`EXACT_REFERENCE_RECLASSIFY_FAILED:${item.sku}`);
          report.mutations.exact_reference += 1;
        }

        const post = updated.rows[0];
        let relationshipVerified = false;
        if (item.relationship === 'SUPERSESSION') {
          const postSupersession = post.enrichment_data?.supersession || {};
          relationshipVerified =
            normalizeCode(postSupersession.current_part) === normalizeCode(item.current) &&
            postSupersession.status === 'VERIFIED' &&
            Array.isArray(postSupersession.predecessors) &&
            postSupersession.predecessors.some((p) =>
              normalizeCode(p?.part_number) === normalizeCode(item.predecessor) &&
              p?.relationship === 'REPLACES' &&
              p?.status === 'VERIFIED'
            );
        } else {
          const refs = post.enrichment_data?.reference_relationships?.official_cross_references;
          relationshipVerified =
            Array.isArray(refs) &&
            refs.some((p) =>
              normalizeCode(p?.part_number) === normalizeCode(item.predecessor) &&
              p?.relationship === 'OFFICIAL_CROSS_REFERENCE' &&
              p?.status === 'VERIFIED'
            );
        }
        if (
          normalizeCode(post.codigo_base) !== normalizeCode(item.current) ||
          !relationshipVerified
        ) {
          throw new Error(`POSTCHECK_FAILED:${item.sku}`);
        }

        if (item.relationship === 'SUPERSESSION') report.mutations.supersession += 1;
        else report.mutations.official_cross_reference += 1;
        await db.query('COMMIT');
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    }

    return report;
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  main()
    .then((report) => console.log(JSON.stringify(report,null,2)))
    .catch((error) => { console.error(error.stack || error.message); process.exit(1); });
}

module.exports = { BATCH, sourceUrl, fetchSupersessionEvidence, main };
