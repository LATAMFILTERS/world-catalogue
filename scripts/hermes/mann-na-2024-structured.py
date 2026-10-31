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
  # Use exact table data cells by vertical span below column headings.
  # Page screenshot: oil=47–59%, air=59–71%, cabin=71–83%, fuel=83–96%.
  for block in page.get_text('blocks'):
   if len(block)<5:continue
   x0,y0,x1,y1,txt=block[:5]
   if not (H*.15<y0<H*.95):continue
   family='oil' if .46<=x0/W<.59 else 'air' if .59<=x0/W<.71 else 'cabin' if .71<=x0/W<.83 else 'fuel' if .83<=x0/W<.96 else None
   if not family:continue
   for m in product_regex.finditer(txt):
    raw=' '.join(m.group().upper().split())
    # Token may carry catalog footnotes; don't claim model or engine linkage.
    rows.append({'mann_code':raw,'make':make,'filter_family':family,'pdf_page':n+1,'printed_page':n-1,
     'source_sha256':digest,'bbox':[round(v,1) for v in (x0,y0,x1,y1)],
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
save('na-2024-structured-summary.json',report)
print(json.dumps(report,indent=2))
