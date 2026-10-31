#!/usr/bin/env python3
"""MANN North America 2024: conservative European LD extraction with physical page columns.
Source PDF only; independent of ELIMFILTERS; no SQL/publication/certification.
"""
import re,sys,json,hashlib
from pathlib import Path
try:import pymupdf
except ImportError:sys.exit("DEPENDENCY_MISSING pymupdf")
if len(sys.argv)<2:sys.exit("Usage: py scripts/hermes/mann-na-2024-structured.py out/mann-sources/mann-na-2024.pdf")
pdf=Path(sys.argv[1]);doc=pymupdf.open(pdf)
if len(doc)!=601:sys.exit("UNEXPECTED_PAGE_COUNT")
root=Path('out/hermes-mann-audit/mann-usa-european-ld');root.mkdir(parents=True,exist_ok=True)
digest=hashlib.sha256(pdf.read_bytes()).hexdigest()
eu='ALFA ROMEO|ASTON MARTIN|AUDI|BENTLEY|BMW|BUGATTI|CITROEN|CITROËN|CUPRA|FERRARI|FIAT|JAGUAR|LAMBORGHINI|LAND ROVER|LOTUS|MASERATI|MERCEDES BENZ|MERCEDES-BENZ|MINI|OPEL|PEUGEOT|POLESTAR|PORSCHE|RENAULT|ROLLS ROYCE|ROLLS-ROYCE|SAAB|SEAT|SKODA|ŠKODA|SMART|VOLKSWAGEN|VOLVO|VAUXHALL'.split('|')
other='ACURA|BUICK|CADILLAC|CHEVROLET|CHRYSLER|DODGE|FORD|GMC|HONDA|HYUNDAI|INFINITI|ISUZU|JEEP|KIA|LEXUS|LINCOLN|MAZDA|MITSUBISHI|NISSAN|RAM|SCION|SUBARU|SUZUKI|TOYOTA'.split('|')
allbrands=sorted(set(eu+other),key=len,reverse=True)
# Catalog's printed running headers follow the pattern "BMW 2017".
make_regex=re.compile(r'(?<![A-Z])('+'|'.join(re.escape(x) for x in allbrands)+r')\s+(?:19|20)\d{2}\b',re.I)
product_regex=re.compile(r'(?<![A-Z0-9])(?:CUK|CU|FP|HU|WK|PU|CF|CP|CS|C|H|W|P)\s*\d{2,6}(?:\s*[/.-]\s*\d{1,5})?(?:\s*[A-Z])?(?:\s*\(\s*\d+\s*\))?(?![A-Z0-9])',re.I)
norm=lambda s:re.sub('[^A-Z0-9]','',s.upper())
# Reuse existing header classifications instead of discarding their evidence.
# Disagreement between independent header readers is quarantined.
prior_file=root/'na-2024-header-page-classification.json'
if not prior_file.is_file():sys.exit('MISSING_PRIOR_PAGE_CLASSIFICATION')
prior={int(r['pdf_page']):r for r in json.loads(prior_file.read_text(encoding='utf8'))}
rows=[];pageaudit=[];conflicts=[]
for n in range(12,523):
 page=doc[n];W,H=page.rect.width,page.rect.height
 words=page.get_text('words',sort=True)
 # Restrict make detection to right upper header (not body rows).
 top=' '.join(w[4] for w in words if w[1]<H*.095 and w[0]>W*.65)
 makes=list({m.group(1).upper() for m in make_regex.finditer(top)})
 make=makes[0] if len(makes)==1 else None
 group='EU' if make in eu else 'NON_EU' if make in other else 'UNRESOLVED'
 previous=prior.get(n+1,{})
 previous_group=previous.get('group','UNRESOLVED')
 previous_make=previous.get('make')
 if group!='UNRESOLVED' and previous_group!='UNRESOLVED' and (group!=previous_group or norm(make)!=norm(previous_make)):
  conflicts.append({'pdf_page':n+1,'previous_make':previous_make,'new_make':make,'previous_group':previous_group,'new_group':group})
  make=None;group='CONFLICT'
 elif group=='UNRESOLVED' and previous_group in ('EU','NON_EU') and previous_make:
  make=previous_make;group=previous_group
 candidates=0
 if group=='EU':
  # Actual PDF table (confirmed on printed page 11):
  # Oil 46.6-58.6%, air 58.6-70.5%, cabin 70.5-82.5%, fuel 82.5-94%.
  # Use each word's X coordinate: text blocks may span multiple columns.
  cells={'oil':[],'air':[],'cabin':[],'fuel':[]}
  for w in words:
   x0,y0,x1,y1,token=w[:5]
   if not (H*.145 < y0 < H*.94):continue
   x=x0/W
   family='oil' if .465<=x<.585 else 'air' if .585<=x<.705 else 'cabin' if .705<=x<.825 else 'fuel' if .825<=x<.945 else None
   if family:cells[family].append((x0,y0,x1,y1,str(token)))
  for family,items in cells.items():
   # Collect tokens on identical baselines, avoiding cross-row joins.
   lines=[]
   for item in sorted(items,key=lambda z:(z[1],z[0])):
    target=next((line for line in lines if abs(line[0]-item[1])<=2.8),None)
    if target is None:lines.append([item[1],[item]])
    else:target[1].append(item)
   for y,line in lines:
    line.sort(key=lambda v:v[0])
    txt=' '.join(w[4] for w in line)
    for m in product_regex.finditer(txt):
     raw=' '.join(m.group().upper().split())
     first=line[0];last=line[-1]
     rows.append({'mann_code':raw,'make':make,'filter_family':family,'pdf_page':n+1,'printed_page':n-1,
      'source_sha256':digest,'bbox':[round(first[0],1),round(y,1),round(last[2],1),round(max(w[3] for w in line),1)],
      'status':'PDF_CANDIDATE_SOURCE_ROW_REVIEW_REQUIRED'})
     candidates+=1
 pageaudit.append({'pdf_page':n+1,'header_text':top[:160],'make':make,'group':group,'candidates':candidates,
                   'reason':None if make else 'HEADER_MAKE_NOT_UNAMBIGUOUS'})
keys={}
for row in rows:
 key=norm(row['mann_code'])
 if not key:continue
 rec=keys.setdefault(key,{'mann_code':row['mann_code'],'makes':set(),'families':set(),'pages':set()})
 rec['makes'].add(row['make']);rec['families'].add(row['filter_family']);rec['pages'].add(row['pdf_page'])
baseline=[{'mann_code':v['mann_code'],'makes':sorted(v['makes']),'families':sorted(v['families']),
 'evidence_pages':sorted(v['pages']),'status':'PDF_CANDIDATE_NOT_2026_USA_VERIFIED'} for v in keys.values()]
baseline.sort(key=lambda x:norm(x['mann_code']))
def save(name,data):(root/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
save('na-2024-structured-page-conflicts.json',conflicts)
save('na-2024-structured-row-evidence.json',rows)
save('na-2024-structured-page-audit.json',pageaudit)
save('na-2024-structured-european-candidates.json',baseline)
report={'pdf_pages_examined':len(pageaudit),'european_pages':sum(p['group']=='EU' for p in pageaudit),
 'non_european_pages':sum(p['group']=='NON_EU' for p in pageaudit),
 'unresolved_pages':sum(p['group']=='UNRESOLVED' for p in pageaudit),
 'classification_conflict_pages':len(conflicts),
 'european_source_candidates':len(rows),'european_unique_product_candidates':len(baseline),
 'all_pages_classified':all(p['group'] not in ('UNRESOLVED','CONFLICT') for p in pageaudit),
 '2026_usa_coverage_verified':False,'coverage_percent':None,'status':'REVIEW_REQUIRED','postgres_writes':0,'publication':False}
# Compare by MANN code only; internal candidate claims cannot verify equivalence.
internal_files=[
 Path('out/hermes-mann-audit/technical-summary.json'),
 Path('out/hermes-mann-recovered-technical/technical-summary-integrated.json')]
internal={}
for f in internal_files:
 if not f.exists():sys.exit('MISSING_INTERNAL_EVIDENCE '+str(f))
 source=json.loads(f.read_text(encoding='utf8'))
 entries=source if isinstance(source,list) else source.get('results',[])
 for item in entries:
  k=norm(str(item.get('mann_part') or ''))
  if k:internal.setdefault(k,[]).append(item.get('sku'))
matched=[];missing=[];ambiguous=[]
for row in baseline:
 hits=sorted(set(str(s) for s in internal.get(norm(row['mann_code']),[]) if s))
 outrow={**row,'elimfilters_skus':hits,'match_type':'MANN_CODE_LITERAL_ONLY','equivalence':'UNVERIFIED'}
 if len(hits)==1:matched.append(outrow)
 elif not hits:missing.append(outrow)
 else:ambiguous.append(outrow)
save('na-2024-structured-present-by-code.json',matched)
save('na-2024-structured-unmatched-codes.json',missing)
save('na-2024-structured-ambiguous-codes.json',ambiguous)
report.update({'matched_code_only':len(matched),'not_in_internal_mann_claims':len(missing),
 'ambiguous_code_claims':len(ambiguous),'coverage_percent':None,
 'reliability_note':'Candidate tokens on 14 unclassified pages and source-row verification remain outstanding.'})
save('na-2024-structured-summary.json',report)
print(json.dumps(report,indent=2))
