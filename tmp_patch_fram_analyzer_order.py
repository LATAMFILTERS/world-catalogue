from pathlib import Path
p=Path(r'C:\Users\ELIMSERVER\world-catalogue\scripts\hermes\analyze-fram-ld-gaps.js')
s=p.read_text(encoding='utf-8')
old="""    if (ldOwners.length === 1) { results.push({...h,status:'EXISTING_DIRECT',resolvedSku:ldOwners[0],hdOwners}); continue; }\n    if (ldOwners.length === 0 && crossFamilyLdOwners.length) { results.push({...h,status:'CROSS_FAMILY_DIRECT_CONFLICT',owners:crossFamilyLdOwners,hdOwners}); continue; }\n    if (ldOwners.length > 1) { results.push({...h,status:'AMBIGUOUS_DIRECT',owners:ldOwners,hdOwners}); continue; }\n    if (hdOwners.length) { results.push({...h,status:'HD_REFERENCE_CONFLICT',hdOwners}); continue; }\n    const finalQ = finalQuarantineByAuthority.get(h.authorityKey);\n    if (finalQ) { results.push({...h,status:'FINAL_QUARANTINE',finalReason:finalQ.final_reason,previousStatus:finalQ.analyzer_status,policyVersion:finalQ.policy_version}); continue; }"""
new="""    if (ldOwners.length === 1) { results.push({...h,status:'EXISTING_DIRECT',resolvedSku:ldOwners[0],hdOwners}); continue; }\n    const finalQ = finalQuarantineByAuthority.get(h.authorityKey);\n    if (finalQ) { results.push({...h,status:'FINAL_QUARANTINE',finalReason:finalQ.final_reason,previousStatus:finalQ.analyzer_status,policyVersion:finalQ.policy_version}); continue; }\n    if (ldOwners.length === 0 && crossFamilyLdOwners.length) { results.push({...h,status:'CROSS_FAMILY_DIRECT_CONFLICT',owners:crossFamilyLdOwners,hdOwners}); continue; }\n    if (ldOwners.length > 1) { results.push({...h,status:'AMBIGUOUS_DIRECT',owners:ldOwners,hdOwners}); continue; }\n    if (hdOwners.length) { results.push({...h,status:'HD_REFERENCE_CONFLICT',hdOwners}); continue; }"""
if old not in s: raise SystemExit('order target missing')
s=s.replace(old,new,1)
old2="""console.log(JSON.stringify({report:out,harvested:report.harvested,counts:report.counts,by_family:report.by_family,existing_covered:report.existing_covered,variants:report.variants,create_safe:report.create_safe,quarantine:report.quarantine},null,2));"""
new2="""console.log(JSON.stringify({report:out,harvested:report.harvested,counts:report.counts,by_family:report.by_family,existing_covered:report.existing_covered,variants:report.variants,create_safe:report.create_safe,final_quarantine:report.final_quarantine,open_pending:report.open_pending,quarantine:report.quarantine},null,2));"""
if old2 not in s: raise SystemExit('console target missing')
s=s.replace(old2,new2,1)
p.write_text(s,encoding='utf-8')
print('ORDER_PATCH_OK')
