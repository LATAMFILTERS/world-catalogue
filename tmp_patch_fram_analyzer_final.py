from pathlib import Path
p=Path(r'C:\Users\ELIMSERVER\world-catalogue\scripts\hermes\analyze-fram-ld-gaps.js')
s=p.read_text(encoding='utf-8')
old="""  const identities = (await client.query(`SELECT i.elimfilters_sku,i.canonical_brand,i.canonical_part_number,c.duty,c.filter_type FROM ld_catalog.ld_canonical_product_identity i JOIN public.elimfilters_catalog c ON c.sku=i.elimfilters_sku WHERE i.status='ACTIVE'`)).rows;\n  const catalogBySku = new Map(catalog.map(r => [r.sku,r]));\n  const directLd = new Map(), directHd = new Map(), refLd = new Map();"""
new="""  const identities = (await client.query(`SELECT i.elimfilters_sku,i.canonical_brand,i.canonical_part_number,c.duty,c.filter_type FROM ld_catalog.ld_canonical_product_identity i JOIN public.elimfilters_catalog c ON c.sku=i.elimfilters_sku WHERE i.status='ACTIVE'`)).rows;\n  const finalQuarantine = (await client.query(`SELECT authority_normalized,analyzer_status,final_reason,policy_version FROM ld_catalog.ld_fram_final_quarantine`)).rows;\n  const finalQuarantineByAuthority = new Map(finalQuarantine.map(r => [r.authority_normalized,r]));\n  const catalogBySku = new Map(catalog.map(r => [r.sku,r]));\n  const directLd = new Map(), directHd = new Map(), refLd = new Map();"""
if old not in s: raise SystemExit('patch1 target missing')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('PATCH1_OK')
s=p.read_text(encoding='utf-8')
old="""    if (hdOwners.length) { results.push({...h,status:'HD_REFERENCE_CONFLICT',hdOwners}); continue; }\n\n    const hits = new Map();"""
new="""    if (hdOwners.length) { results.push({...h,status:'HD_REFERENCE_CONFLICT',hdOwners}); continue; }\n    const finalQ = finalQuarantineByAuthority.get(h.authorityKey);\n    if (finalQ) { results.push({...h,status:'FINAL_QUARANTINE',finalReason:finalQ.final_reason,previousStatus:finalQ.analyzer_status,policyVersion:finalQ.policy_version}); continue; }\n\n    const hits = new Map();"""
if old not in s: raise SystemExit('patch2 target missing')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('PATCH2_OK')
s=p.read_text(encoding='utf-8')
old="""    existing_covered:results.filter(r=>r.status.startsWith('EXISTING_')).length,\n    variants:results.filter(r=>r.status==='VARIANT_OF_AUTHORITY').length,\n    create_safe:safe.length,\n    quarantine:results.filter(r=>!['EXISTING_DIRECT','EXISTING_MULTI_CROSS','VARIANT_OF_AUTHORITY','REAL_GAP_CREATE_SAFE'].includes(r.status)).length,"""
new="""    existing_covered:results.filter(r=>r.status.startsWith('EXISTING_')).length,\n    variants:results.filter(r=>r.status==='VARIANT_OF_AUTHORITY').length,\n    create_safe:safe.length,\n    final_quarantine:results.filter(r=>r.status==='FINAL_QUARANTINE').length,\n    open_pending:results.filter(r=>!['EXISTING_DIRECT','EXISTING_MULTI_CROSS','VARIANT_OF_AUTHORITY','REAL_GAP_CREATE_SAFE','FINAL_QUARANTINE'].includes(r.status)).length,\n    quarantine:results.filter(r=>!['EXISTING_DIRECT','EXISTING_MULTI_CROSS','VARIANT_OF_AUTHORITY','REAL_GAP_CREATE_SAFE','FINAL_QUARANTINE'].includes(r.status)).length,"""
if old not in s: raise SystemExit('patch3 target missing')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('PATCH3_OK')
