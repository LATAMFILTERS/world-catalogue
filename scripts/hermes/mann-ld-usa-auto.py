#!/usr/bin/env python3
"""One-shot read-only MANN NA 2024 -> ELIMFILTERS LD reconciliation.
Runs existing extractor, audits its generated artifacts, exports CSV/JSON.
Never writes SQL/catalog products, nor declares physical equivalence.
"""
import sys,subprocess,json,csv,re,hashlib
from pathlib import Path
BASE=Path.cwd()
PDF=BASE/'out/mann-sources/mann-na-2024.pdf'
ROOT=BASE/'out/hermes-mann-audit/mann-usa-european-ld'
SCRIPT=BASE/'scripts/hermes/mann-na-2024-structured.py'
if not PDF.is_file():sys.exit('BLOCKED: OFFICIAL_MANN_PDF_NOT_PRESENT '+str(PDF))
for f in [SCRIPT,BASE/'out/hermes-mann-audit/technical-summary.json',BASE/'out/hermes-mann-recovered-technical/technical-summary-integrated.json']:
 if not f.is_file():sys.exit('BLOCKED: REQUIRED_SOURCE_MISSING '+str(f))
proc=subprocess.run([sys.executable,str(SCRIPT),str(PDF)],cwd=BASE,check=False)
if proc.returncode:sys.exit(proc.returncode)
summary=json.loads((ROOT/'na-2024-structured-summary.json').read_text(encoding='utf8'))
if summary['source_pdf_sha256'] if 'source_pdf_sha256' in summary else False: pass
rows=json.loads((ROOT/'na-2024-structured-european-candidates.json').read_text(encoding='utf8'))
pages=json.loads((ROOT/'na-2024-structured-page-audit.json').read_text(encoding='utf8'))
pdf_sha=hashlib.sha256(PDF.read_bytes()).hexdigest()
known_digest='a77d9ca8ce9fc21bd8842a973ca92471b48184d1eecc27727f3756e08b26a74c'
if pdf_sha!=known_digest:sys.exit('BLOCKED: PDF_HASH_UNEXPECTED '+pdf_sha)
if len(pages)!=511:sys.exit('BLOCKED: INCOMPLETE_PAGE_EXTRACTION')
if summary['european_unique_product_candidates']!=len(rows):sys.exit('BLOCKED: SUMMARY_CANDIDATE_COUNT_MISMATCH')
def norm(x):return re.sub('[^A-Z0-9]','',str(x or '').upper())
orig=json.loads((BASE/'out/hermes-mann-audit/technical-summary.json').read_text(encoding='utf8'))
rec=json.loads((BASE/'out/hermes-mann-recovered-technical/technical-summary-integrated.json').read_text(encoding='utf8'))['results']
ref={}
for r in orig+rec: ref.setdefault(norm(r.get('mann_part')) ,set()).add(r.get('sku'))
result=[]
for row in rows:
 matches=sorted(x for x in ref.get(norm(row['mann_code']),set()) if x)
 result.append({'mann_code':row['mann_code'],'brands':' | '.join(row['makes']),
  'families':' | '.join(row['families']),'pdf_pages':','.join(map(str,row['evidence_pages'])),
  'elimfilters_skus':' | '.join(matches),'comparison':'MATCHED_CODE_ONLY' if len(matches)==1 else 'NO_CODE_MATCH' if not matches else 'AMBIGUOUS',
  'status':'REVIEW_REQUIRED'})
(ROOT/'mann-na-2024-elimfilters-code-comparison.csv').parent.mkdir(parents=True,exist_ok=True)
with (ROOT/'mann-na-2024-elimfilters-code-comparison.csv').open('w',encoding='utf-8-sig',newline='') as f:
 writer=csv.DictWriter(f,fieldnames=list(result[0].keys()));writer.writeheader();writer.writerows(result)
unresolved=[p['pdf_page'] for p in pages if p['group'] in ('UNRESOLVED','CONFLICT')]
report={'pdf_sha256':pdf_sha,'catalogue':'MANN_NORTH_AMERICA_2024',
 'catalogue_pages_examined':len(pages),'unique_european_ld_candidate_codes':len(result),
 'literal_code_matches':sum(r['comparison']=='MATCHED_CODE_ONLY' for r in result),
 'unmatched_code_candidates':sum(r['comparison']=='NO_CODE_MATCH' for r in result),
 'unresolved_pages':unresolved,'completeness_certified':not bool(unresolved) and False,
 'market_usa_2026_verified':False,'physical_equivalence_verified':0,
 'coverage_percent':None,'postgres_writes':0,'publication':False,'status':'REVIEW_REQUIRED',
 'csv':str(ROOT/'mann-na-2024-elimfilters-code-comparison.csv')}
(ROOT/'mann-na-2024-automation-report.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
print(json.dumps(report,indent=2))
