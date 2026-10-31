#!/usr/bin/env python3
"""Extract European-make LD MANN numbers from official 2024 North American PDF.
Read-only. Uses visual column coordinates; no guessed mappings or certification.
Usage: py scripts/hermes/mann-na-2024-extract.py path/to/catalog.pdf
Install dependency: py -m pip install pymupdf
"""
import sys, re, json, hashlib
from pathlib import Path
try:
    import pymupdf as fitz
except ImportError:
    sys.exit("DEPENDENCY_MISSING: py -m pip install pymupdf")
if len(sys.argv)<2: sys.exit("USAGE: py scripts/hermes/mann-na-2024-extract.py PATH_TO_PDF")
pdf=Path(sys.argv[1]).resolve()
if not pdf.is_file(): sys.exit("PDF_NOT_FOUND "+str(pdf))
out=Path("out/hermes-mann-audit/mann-usa-european-ld")
out.mkdir(parents=True,exist_ok=True)
digest=hashlib.sha256(pdf.read_bytes()).hexdigest()
doc=fitz.open(pdf)
if len(doc)<590:sys.exit("UNEXPECTED_PDF_PAGE_COUNT")
# Printed page 11 starts on PDF page index 12 (front matter offset +1).
first,last=12,min(522,len(doc)-1)
brands={
"AUDI":"AUDI","BMW":"BMW","MERCEDES-BENZ":"MERCEDES-BENZ","MERCEDES BENZ":"MERCEDES-BENZ",
"VOLKSWAGEN":"VOLKSWAGEN","VW":"VOLKSWAGEN","PORSCHE":"PORSCHE","VOLVO":"VOLVO",
"MINI":"MINI","LAND ROVER":"LAND ROVER","RANGE ROVER":"LAND ROVER","JAGUAR":"JAGUAR",
"FIAT":"FIAT","ALFA ROMEO":"ALFA ROMEO","SAAB":"SAAB","SMART":"SMART",
"SKODA":"SKODA","ŠKODA":"SKODA","SEAT":"SEAT","CUPRA":"CUPRA",
"RENAULT":"RENAULT","PEUGEOT":"PEUGEOT","CITROEN":"CITROEN","CITROËN":"CITROEN",
"OPEL":"OPEL","VAUXHALL":"VAUXHALL","BENTLEY":"BENTLEY","ROLLS-ROYCE":"ROLLS-ROYCE",
"MASERATI":"MASERATI","FERRARI":"FERRARI","LAMBORGHINI":"LAMBORGHINI",
"ASTON MARTIN":"ASTON MARTIN","LOTUS":"LOTUS","POLESTAR":"POLESTAR"}
# Printed catalog headings are often BRAND (Cont'd/Suite), on different pages.
pattern=re.compile(r"(?<![A-Z])("+"|".join(re.escape(k) for k in sorted(brands,key=len,reverse=True))+r")(?:\s*\(Cont['’]?d/?Suite\))?(?![A-Z])",re.I)
code=re.compile(r"\b(?:C(?:U|UK|F|P|S)?|FP|H|HU|W|WK|PU|P|BFU|BF|MA|MC|MCF|LC|E)\s*\d{1,6}(?:\s*[/.-]\s*\d{1,4})?(?:\s*(?:-\s*\d+|\(\s*\d+\s*\)))?\b",re.I)
skip=re.compile(r"^(?:N/S|N\/A|—|-|–|none|no filter|see page|cont'd|continued)$",re.I)
evidence=[];pages=[];current_brand=None;errors=[]
for n in range(first,last+1):
    page=doc[n]
    words=page.get_text("words",sort=True)
    # Never carry a make from the previous page: a non-European section
    # must not silently inherit the preceding European manufacturer's name.
    blocks=page.get_text("blocks")
    header=" ".join(str(b[4]) for b in blocks if len(b)>=5 and b[1]<page.rect.height*.19).upper()
    # Publisher's running header includes e.g. "BMW 2023", "ACURA 2024-2020".
    # Require a brand immediately preceding a year in the running header.
    brand_in_header=re.search(r"\b([A-Z][A-Z& -]{1,28})\s+(?:19|20)\d{2}(?:\s*[-–]\s*(?:19|20)\d{2})?\b",header)
    current_brand=None
    if brand_in_header:
        label=brand_in_header.group(1).strip()
        for name in sorted(brands,key=len,reverse=True):
            if label==name or label.endswith(" "+name):
                current_brand=brands[name]
                break
    if current_brand is None:
        # On first pages the manufacturer is printed as a standalone heading
        # below the header; restrict search to exact standalone heading text.
        for b in blocks:
            if len(b)<5 or b[1]>page.rect.height*.27:continue
            t=str(b[4]).strip().upper()
            if t in brands:
                current_brand=brands[t]
                break
    if current_brand is None:
        pages.append({"pdf_page":n+1,"status":"NOT_EUROPEAN_OR_MAKE_UNCONFIRMED","rows":0})
        continue
    width=page.rect.width
    # Actual columns on catalogue page: engine code ~35-42%,
    # oil ~42-54%, air ~54-66%, cabin ~66-78%, fuel ~78-94%.
    # Read line fragments; preserve exact source coordinates for later review.
    rows=0
    for b in blocks:
        if len(b)<5:continue
        x0,y0,x1,y1,txt=b[:5]
        if y0<page.rect.height*.13 or y0>page.rect.height*.94:continue
        frac=x0/width
        if frac<.40:continue
        family=("oil" if frac<.54 else "air" if frac<.67 else "cabin" if frac<.80 else "fuel" if frac<.95 else "other")
        if family=="other":continue
        for m in code.finditer(txt):
            value=re.sub(r"\s+"," ",m.group(0)).strip().upper()
            # Evidence is a candidate when no full row/engine association is asserted.
            if not skip.search(value):
                evidence.append({"mann_code":value,"make":current_brand,"family_column":family,
                  "pdf_page":n+1,"printed_page":n-1,"pdf_sha256":digest,
                  "source_url":"https://content21.blob.core.windows.net/web-hosting/clients/mann-hummel/estore/catalogs/2024/2024%20Mann%20Filter%20Catalog.pdf",
                  "bbox":[round(x0,1),round(y0,1),round(x1,1),round(y1,1)],
                  "status":"EXTRACTED_REQUIRES_PAGE_VALIDATION"})
                rows+=1
    pages.append({"pdf_page":n+1,"make_context":current_brand,"rows":rows,"status":"PARSED" if rows else "NO_CODE_FOUND"})
norm=lambda s:re.sub(r"[^A-Z0-9]","",s)
by_code={}
for e in evidence:
    k=norm(e["mann_code"])
    if not k:continue
    d=by_code.setdefault(k,{"mann_code":e["mann_code"],"makes":set(),"families":set(),"evidence_pages":set(),"evidence_rows":0,"status":"2024_NA_PDF_CANDIDATE_REQUIRES_VALIDATION"})
    d["makes"].add(e["make"]);d["families"].add(e["family_column"]);d["evidence_pages"].add(e["pdf_page"]);d["evidence_rows"]+=1
baseline=[dict(v,makes=sorted(v["makes"]),families=sorted(v["families"]),evidence_pages=sorted(v["evidence_pages"])) for v in by_code.values()]
baseline.sort(key=lambda v:norm(v["mann_code"]))
(out/"na-2024-european-ld-evidence.json").write_text(json.dumps(evidence,indent=2,ensure_ascii=False),encoding="utf8")
(out/"na-2024-european-ld-candidates.json").write_text(json.dumps(baseline,indent=2,ensure_ascii=False),encoding="utf8")
(out/"na-2024-page-audit.json").write_text(json.dumps(pages,indent=2),encoding="utf8")
summary={"pdf_pages":len(doc),"pages_examined":len(pages),"candidate_rows":len(evidence),
 "candidate_unique_mann_codes":len(baseline),"pages_without_codes":sum(p["rows"]==0 for p in pages),
 "source_pdf_sha256":digest,"coverage":"HISTORICAL_2024_NORTH_AMERICA_NOT_CURRENT_USA",
 "page_validation_complete":False,"usa_current_presence_verified":False,"status":"REVIEW_REQUIRED",
 "certified":0,"postgres_writes":0,"publication":False}
(out/"na-2024-extraction-summary.json").write_text(json.dumps(summary,indent=2),encoding="utf8")
print(json.dumps(summary,indent=2))
