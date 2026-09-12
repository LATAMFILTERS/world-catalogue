#!/usr/bin/env node
import {
  diagnoseFramWidgetDns,
  loadPublicCatalogConfig,
  queryCatalog,
  parseFramSupplier,
  parsePartList
} from './lib/fram-usa-smtp-client.mjs';

const args = process.argv.slice(2);
const partIndex = args.indexOf('--part');
const probePart = partIndex >= 0 && args[partIndex + 1] ? args[partIndex + 1].trim().toUpperCase() : 'FS8A';

const dns = await diagnoseFramWidgetDns();
const config = await loadPublicCatalogConfig();
const supplierResponse = await queryCatalog('lookup=supplier&Supplier=Full', { config, limit: 500 });
const framSupplier = parseFramSupplier(supplierResponse.xml);
if (!framSupplier) throw new Error('FRAM supplier not present in ShowMeTheParts catalog response');

const partResponse = await queryCatalog(`lookup=partlist&partno=${encodeURIComponent(probePart)}`, { config, limit: 100 });
const parts = parsePartList(partResponse.xml);
const framParts = parts.filter(part => /^Fram Filters$/i.test(part.supplier || ''));
if (!framParts.length) throw new Error(`FRAM probe part ${probePart} did not return a FRAM record`);const report = {
  schema_version: '1.0.0',
  checked_at: new Date().toISOString(),
  fram_widget_dns: dns,
  root_cause: dns.classification === 'UPSTREAM_PUBLIC_DNS_RECORD_MISSING'
    ? 'FRAM_USA_HTML_REFERENCES_A_PUBLICLY_NONEXISTENT_APACATAPULT_HOSTNAME'
    : 'FRAM_WIDGET_DNS_CURRENTLY_RESOLVES',
  remediation: {
    unsafe_local_hosts_override: false,
    change_elimserver_dns: false,
    operational_route: 'SHOWMETHEPARTS_PUBLIC_CATALOG_BACKEND',
    backend: config.dataUrl,
    catalog_id: config.catalogId,
    transport_status: supplierResponse.status
  },
  fram_supplier: framSupplier,
  probe: {
    requested_part: probePart,
    response_status: partResponse.status,
    records: framParts
  },
  solution_status: 'OPERATIONAL_BYPASS_VERIFIED'
};

console.log(JSON.stringify(report, null, 2));