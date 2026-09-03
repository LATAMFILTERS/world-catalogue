#!/usr/bin/env python3
"""Classify historical GSC 404 examples against an evidence-backed recovery registry.

This script never invents redirects. A redirect is recommended only when the exact
legacy URL is present in historical-404-recovery-registry.csv with decision
SAFE_REDIRECT and the target is currently healthy according to the live SEO audit.
All other URLs remain KEEP_404 or MANUAL_EVIDENCE_REQUIRED.
"""
from __future__ import annotations
import argparse, csv
from pathlib import Path
from urllib.parse import urlparse

HOST='elimfilters.com'
URL_HEADERS=('url','URL','Página','Page','example','Example')

def norm(v:str)->str:
    v=(v or '').strip()
    if not v: return ''
    p=urlparse(v)
    if p.scheme not in {'http','https'}: return ''
    host=p.netloc.lower().split(':')[0]
    if host not in {HOST,'www.'+HOST}: return ''
    path=p.path or '/'
    if path!='/' and not path.endswith('/'): path+='/'
    return f'https://{HOST}{path}'

def detect(row):
    for k in URL_HEADERS:
        if k in row:
            u=norm(row.get(k,''))
            if u:return u
    for v in row.values():
        u=norm(v)
        if u:return u
    return ''

def load_examples(path:Path):
    with path.open(newline='',encoding='utf-8-sig') as f:
        return sorted({u for row in csv.DictReader(f) if (u:=detect(row))})

def load_registry(path:Path):
    out={}
    with path.open(newline='',encoding='utf-8-sig') as f:
        for row in csv.DictReader(f):
            u=norm(row.get('legacy_url',''))
            t=norm(row.get('canonical_target',''))
            if u: out[u]={**row,'legacy_url':u,'canonical_target':t}
    return out

def load_audit(path:Path|None):
    if not path or not path.exists():return {}
    out={}
    with path.open(newline='',encoding='utf-8-sig') as f:
        for row in csv.DictReader(f):
            u=norm(row.get('url') or row.get('URL') or '')
            if u:out[u]=row
    return out

def status(row):
    for k in ('status','status_code','http_status'):
        v=str((row or {}).get(k,'')).strip()
        if v.isdigit():return int(v)
    return None

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--examples',type=Path,required=True)
    ap.add_argument('--registry',type=Path,default=Path('seo-geo-audit-input/gsc/historical-404-recovery-registry.csv'))
    ap.add_argument('--audit',type=Path)
    ap.add_argument('--out-dir',type=Path,default=Path('seo-geo-audit-out'))
    a=ap.parse_args()
    examples=load_examples(a.examples); reg=load_registry(a.registry); audit=load_audit(a.audit)
    rows=[]
    for u in examples:
        current=audit.get(u); cur_status=status(current)
        if cur_status and cur_status < 400:
            rows.append({'legacy_url':u,'action':'RESOLVED_SINCE_GSC_SNAPSHOT','canonical_target':u,'reason':f'Current audit returns HTTP {cur_status}.'}); continue
        rule=reg.get(u)
        if rule and rule.get('decision')=='SAFE_REDIRECT':
            target=rule.get('canonical_target',''); target_status=status(audit.get(target))
            if target_status and target_status < 400:
                rows.append({'legacy_url':u,'action':'SAFE_REDIRECT','canonical_target':target,'reason':rule.get('evidence','')}); continue
            rows.append({'legacy_url':u,'action':'MANUAL_EVIDENCE_REQUIRED','canonical_target':target,'reason':'Registry target is not confirmed healthy in the current audit.'}); continue
        rows.append({'legacy_url':u,'action':'KEEP_404_OR_RESEARCH','canonical_target':'','reason':'No exact evidence-backed semantic successor is registered. Do not redirect to a generic hub or homepage.'})
    a.out_dir.mkdir(parents=True,exist_ok=True)
    out=a.out_dir/'gsc-404-recovery.csv'
    with out.open('w',newline='',encoding='utf-8') as f:
        w=csv.DictWriter(f,fieldnames=['legacy_url','action','canonical_target','reason']); w.writeheader(); w.writerows(rows)
    counts={}
    for r in rows:counts[r['action']]=counts.get(r['action'],0)+1
    md=a.out_dir/'gsc-404-recovery.md'
    lines=['# GSC historical 404 recovery','',f'URLs processed: **{len(rows)}**','']+[f'- `{k}`: {v}' for k,v in sorted(counts.items())]+['','Only exact `SAFE_REDIRECT` mappings may be implemented as permanent redirects. Generic homepage/hub redirects are prohibited.']
    md.write_text('\n'.join(lines)+'\n',encoding='utf-8')
    print(out); print(md)

if __name__=='__main__': main()
