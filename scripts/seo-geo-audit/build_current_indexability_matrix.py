#!/usr/bin/env python3
"""Build a current-architecture indexability priority matrix.

Purpose:
- Work only from the current production audit universe.
- Exclude historical GoDaddy/legacy URLs by construction because the input is the
  current production sitemap audit.
- Rank current URLs by likelihood of deserving investigation when GSC reports
  Crawled - currently not indexed but detailed URL examples are unavailable.

This is a prioritization heuristic, not a substitute for GSC evidence.
"""
from __future__ import annotations

import argparse
import csv
from pathlib import Path
from urllib.parse import urlparse

UTILITY_PREFIXES = (
    '/contact', '/distributor-application', '/search', '/part-search',
    '/knowledge-center/calculators', '/knowledge-center/learning-paths',
    '/knowledge-center/diagrams', '/knowledge-center/dashboard',
    '/knowledge-center/graph', '/knowledge-center/coverage',
    '/knowledge-center/datasets', '/legal',
)

HIGH_VALUE_PREFIXES = (
    '/technologies/', '/systems/', '/industries/', '/knowledge-center/',
    '/families/', '/commercial-lines/',
)


def truthy(v: str) -> bool:
    return str(v or '').strip().lower() in {'1','true','yes','y','si','sí'}


def integer(row: dict[str,str], *keys: str) -> int | None:
    for key in keys:
        v = str(row.get(key,'')).strip()
        try:
            return int(float(v))
        except Exception:
            pass
    return None


def path_of(url: str) -> str:
    return urlparse(url).path or '/'


def classify(row: dict[str,str]) -> dict[str,str]:
    url = (row.get('url') or row.get('URL') or '').strip()
    path = path_of(url)
    status = integer(row, 'status','status_code','http_status')
    words = integer(row, 'word_count','words')
    canonical = (row.get('canonical') or row.get('canonical_url') or '').strip()
    robots = str(row.get('robots',''))
    noindex = truthy(row.get('noindex','')) or 'noindex' in robots.lower()

    if status is None or status >= 400:
        return {'priority':'P0','action':'TECHNICAL_REPAIR','reason':f'Current HTTP status is {status or "unknown"}.'}
    if noindex:
        return {'priority':'P3','action':'INTENTIONAL_EXCLUSION_REVIEW','reason':'Current page is noindex; not a semantic-expansion target.'}
    if canonical and canonical.rstrip('/') != url.rstrip('/'):
        return {'priority':'P1','action':'CANONICAL_INTENT_REVIEW','reason':'Canonical points to another URL; resolve intent before content work.'}
    if any(path == p or path.startswith(p + '/') for p in UTILITY_PREFIXES):
        return {'priority':'P3','action':'KEEP_CONCISE_REVIEW_CONTEXT','reason':'Purpose-driven utility/navigation page; do not pad content.'}

    # Clean indexable editorial/entity pages. Rank semantic review using only
    # reproducible audit signals, never pretending these are confirmed GSC rows.
    score = 0
    reasons: list[str] = []
    if any(path.startswith(p) for p in HIGH_VALUE_PREFIXES):
        score += 2
        reasons.append('strategic entity/editorial route')
    if words is not None and words < 250:
        score += 2
        reasons.append(f'~{words} visible words')
    if not (row.get('jsonld_types') or row.get('jsonld_count')):
        score += 1
        reasons.append('weak/absent structured-data signal in audit')
    h1_count = integer(row,'h1_count')
    if h1_count is not None and h1_count != 1:
        score += 1
        reasons.append(f'H1 count {h1_count}')
    geo_score = integer(row,'geo_score')
    if geo_score is not None and geo_score < 60:
        score += 1
        reasons.append(f'low GEO heuristic {geo_score}')

    if score >= 5:
        return {'priority':'P0','action':'SEMANTIC_REVIEW_FIRST','reason':'; '.join(reasons) or 'multiple weak signals'}
    if score >= 3:
        return {'priority':'P1','action':'SEMANTIC_REVIEW','reason':'; '.join(reasons) or 'moderate weak signals'}
    if score >= 1:
        return {'priority':'P2','action':'MONITOR_OR_LIGHT_REVIEW','reason':'; '.join(reasons) or 'limited weak signals'}
    return {'priority':'P3','action':'NO_CURRENT_DEFECT_SIGNAL','reason':'Current audit shows no obvious technical or semantic weakness.'}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('audit_csv', type=Path)
    ap.add_argument('--out-dir', type=Path, default=Path('seo-geo-audit-out'))
    args = ap.parse_args()

    with args.audit_csv.open(newline='', encoding='utf-8-sig') as f:
        rows = list(csv.DictReader(f))

    out_rows = []
    for row in rows:
        url = (row.get('url') or row.get('URL') or '').strip()
        if not url:
            continue
        result = classify(row)
        out_rows.append({
            'url': url,
            'priority': result['priority'],
            'action': result['action'],
            'reason': result['reason'],
            'status': row.get('status') or row.get('status_code') or '',
            'word_count': row.get('word_count') or '',
            'canonical': row.get('canonical') or row.get('canonical_url') or '',
        })

    order = {'P0':0,'P1':1,'P2':2,'P3':3}
    out_rows.sort(key=lambda r:(order.get(r['priority'],9), r['url']))
    args.out_dir.mkdir(parents=True, exist_ok=True)
    csv_path = args.out_dir / 'current-indexability-priority-matrix.csv'
    with csv_path.open('w', newline='', encoding='utf-8') as f:
        fields=['url','priority','action','reason','status','word_count','canonical']
        w=csv.DictWriter(f, fieldnames=fields); w.writeheader(); w.writerows(out_rows)

    counts={}
    actions={}
    for r in out_rows:
        counts[r['priority']] = counts.get(r['priority'],0)+1
        actions[r['action']] = actions.get(r['action'],0)+1
    md_path = args.out_dir / 'current-indexability-priority-matrix.md'
    lines=[
        '# Current Architecture Indexability Priority Matrix','',
        'Scope: current production sitemap/audit only. Historical GoDaddy URLs are excluded by construction.','',
        f'Current URLs analyzed: **{len(out_rows)}**','',
        '## Priority counts','',
    ]
    for p in ('P0','P1','P2','P3'):
        lines.append(f'- `{p}`: {counts.get(p,0)}')
    lines += ['', '## Action counts','']
    for action,count in sorted(actions.items()):
        lines.append(f'- `{action}`: {count}')
    lines += ['', 'This matrix is a current-site prioritization heuristic. It does not claim that a URL is inside GSC Crawled - currently not indexed until a detailed GSC example export confirms it.']
    md_path.write_text('\n'.join(lines)+'\n', encoding='utf-8')
    print(csv_path); print(md_path)

if __name__ == '__main__':
    main()
