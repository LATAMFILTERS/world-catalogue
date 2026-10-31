#!/usr/bin/env python3
"""Read-only full-page audit of MANN NA 2024 LD applications.
Every page and all MANN-like codes are recorded regardless of vehicle origin.
No brand assignment without page evidence, no inferred US presence.
"""
import sys,re,json,hashlib
from pathlib import Path
try: import pymupdf
except ImportError: sys.exit("Install pymupdf: py -m pip install pymupdf")
if len(sys.argv)<2: sys.exit("Usage: py scripts/hermes/mann-na-2024-audit-all-pages.py path/to/catalog.pdf")
p=Path(sys.argv[1]).resolve()
if not p.is_file():sys.exit("PDF_NOT_FOUND "+str(p))
doc=pymupdf.open(p)
if len(doc)!=601:sys.exit(f"UNEXPECTED_PAGE_COUNT {len(doc)}; expected 601")
root=Path("out/hermes-mann-audit/mann-usa-european-ld");root.mkdir(parents=True,exist_ok=True)
digest=hashlib.sha256(p.read_bytes()).hexdigest()
# Strictly extract product-like tokens from each page, independently of make.
code=re.compile(r"(?<![A-Z0-9])(?:CUK|CU|FP|HU|WK|PU|CF|CP|C|H|W|P)\s*\d{2,6}(?:\s*[/.-]\s*\d{1,5})?(?:\s*\(\s*\d+\s*\))?(?![A-Z0-9])",re.I)
norm=lambda s:re.sub(r"[^A-Z0-9]","",s.upper())
pages=[];evidence=[];codes={}
for i in range(12,523):
 page=doc[i];txt=page.get_text("text",sort=True)
 hits=[];seen=set()
 for m in code.finditer(txt):
  raw=" ".join(m.group().upper().split());key=norm(raw)
  if key in seen:continue
  seen.add(key)
  item={"code":raw,"pdf_page":i+1,"printed_page":i-1,"pdf_sha256":digest,
    "status":"UNCLASSIFIED_PDF_CODE_CANDIDATE"}
  hits.append(item);evidence.append(item)
  d=codes.setdefault(key,{"mann_code":raw,"evidence_pages":[],"status":"UNCLASSIFIED_PDF_CODE_CANDIDATE"})
  d["evidence_pages"].append(i+1)
 # Extract header snippets solely for review, not for brand attribution.
 header=page.get_text("text",clip=pymupdf.Rect(0,0,page.rect.width,page.rect.height*0.23)).strip()
 pages.append({"pdf_page":i+1,"printed_page":i-1,"header_excerpt":header[:500],
   "code_candidates":len(hits),"status":"NEEDS_MAKE_AND_COLUMN_VALIDATION"})
for filename,data in {
 "na-2024-unclassified-all-page-evidence.json":evidence,
 "na-2024-unclassified-code-index.json":sorted(codes.values(),key=lambda r:norm(r["mann_code"])),
 "na-2024-full-page-audit.json":pages}.items():
 (root/filename).write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
report={"source_pdf_sha256":digest,"total_pdf_pages":len(doc),"ld_pages_visited":len(pages),
 "all_page_code_candidates":len(evidence),"distinct_unclassified_codes":len(codes),
 "pages_without_code_candidates":sum(not x["code_candidates"] for x in pages),
 "european_make_classification":"NOT_VERIFIED","current_usa_catalogue":"NOT_VERIFIED",
 "coverage_percent":None,"status":"REVIEW_REQUIRED","postgres_writes":0,"publication":False}
(root/"na-2024-full-page-audit-summary.json").write_text(json.dumps(report,indent=2)+"\n",encoding="utf8")
print(json.dumps(report,indent=2))
