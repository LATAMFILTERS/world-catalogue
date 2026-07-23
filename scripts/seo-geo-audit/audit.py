#!/usr/bin/env python3
"""
Production SEO/GEO audit for https://elimfilters.com.

Read-only. Makes HTTP GET/HEAD requests against the live site only —
never touches this repository's content, config, or any deploy target.

Standard library only (urllib, html.parser, xml.etree.ElementTree,
concurrent.futures, json, re, csv). No third-party packages, no
commercial tools, no credentials.

Usage:
    python3 scripts/seo-geo-audit/audit.py --out-dir ./seo-geo-audit-out

Exit code is always 0 unless the run itself cannot start (e.g. the
sitemap can't be downloaded at all) — per-URL failures are recorded as
findings, not process failures, so one broken page never aborts the
whole audit.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from xml.etree import ElementTree as ET

BASE_URL = "https://elimfilters.com"
SITEMAP_URL = f"{BASE_URL}/sitemap.xml"
USER_AGENT = "elimfilters-seo-geo-audit/1.0 (+https://github.com/LATAMFILTERS/world-catalogue)"
REQUEST_TIMEOUT = 20
MAX_REDIRECTS = 10
PAGE_FETCH_WORKERS = 4
PAGE_FETCH_DELAY = 0.15  # seconds between requests issued by each worker
LINK_CHECK_WORKERS = 5
LINK_CHECK_DELAY = 0.05
LINK_CHECK_CAP = 1200  # ceiling on number of *additional* internal links checked

TITLE_MIN_LEN = 15
TITLE_MAX_LEN = 60
DESC_MAX_LEN = 160
THIN_CONTENT_WORDS = 150
SLOW_RESPONSE_MS = 1500

STANDARD_PATTERN = re.compile(
    r"\b(ISO\s?\d{3,5}(-\d+)?|ASTM\s?D\d{3,5}|SAE\s?J\d{3,4}|NFPA\s?T?\d[\d.]*|DIN\s?\d{4,5}|NAS\s?1638)\b",
    re.IGNORECASE,
)

CATEGORY_PREFIXES = [
    ("/knowledge-center", "Knowledge Center"),
    ("/knowledge-system", "Knowledge System"),
    ("/systems", "Systems"),
    ("/technologies", "Technologies"),
    ("/industries", "Industries"),
    ("/search", "Product Search"),
    ("/part-search", "Product Search"),
    ("/legal", "Legal / Corporate"),
    ("/about", "Legal / Corporate"),
    ("/contact", "Legal / Corporate"),
    ("/warranty", "Legal / Corporate"),
    ("/distributor", "Legal / Corporate"),
    ("/commercial-lines", "Legal / Corporate"),
    ("/families", "Legal / Corporate"),
    ("/engineering", "Legal / Corporate"),
]

# Best-effort, documented heuristic mapping from page category to the
# repo source most likely responsible for its markup. This is NOT a
# guarantee of the exact file (dynamic routes serve many URLs from one
# template) — it is reported in the summary as a starting point for
# triage, always labeled as a heuristic.
CATEGORY_SOURCE_FILE = {
    "Homepage": "frontend/src/app/page.tsx",
    "Systems": "frontend/src/app/systems/[slug]/page.tsx",
    "Technologies": "frontend/src/app/technologies/[slug]/page.tsx",
    "Industries": "frontend/src/app/industries/[slug]/page.tsx",
    "Knowledge System": "frontend/src/app/knowledge-system/**/page.tsx",
    "Knowledge Center": "frontend/src/app/knowledge-center/**/page.tsx",
    "Product Search": "frontend/src/app/search/page.tsx or part-search/index.html",
    "Legal / Corporate": "frontend/src/app/{about,contact,warranty,distributor,...}/page.tsx",
    "Other": "unknown — not covered by the category heuristic",
}

# Cloudflare-managed paths that are never part of this app's own routing
# (email obfuscation, CDN internals, etc.). They are not pages this repo
# renders, so broken/odd behavior on them is not a finding here.
IGNORED_LINK_PREFIXES = ("/cdn-cgi/",)


def is_ignored_link(url: str) -> bool:
    path = urllib.parse.urlparse(url).path
    return any(path.startswith(p) for p in IGNORED_LINK_PREFIXES)


def categorize(path: str) -> str:
    if path in ("", "/"):
        return "Homepage"
    for prefix, label in CATEGORY_PREFIXES:
        if path == prefix or path.startswith(prefix + "/"):
            return label
    return "Other"


# ─────────────────────────────────────────────────────────────────────────
# HTTP fetch with manual, inspectable redirect handling
# ─────────────────────────────────────────────────────────────────────────

class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None  # never auto-follow; caller inspects the 3xx response itself


def fetch(url: str, method: str = "GET", max_redirects: int = MAX_REDIRECTS) -> dict:
    """Follows redirects manually, recording the full chain. Never raises —
    all failure modes are returned as a dict with an 'error' key."""
    opener = urllib.request.build_opener(NoRedirectHandler)
    chain = []
    current = url
    visited = set()
    start = time.time()

    for _ in range(max_redirects + 1):
        if current in visited:
            return {
                "status": None, "final_url": current, "chain": chain,
                "body": b"", "headers": {}, "elapsed_ms": (time.time() - start) * 1000,
                "error": "redirect_loop",
            }
        visited.add(current)
        req = urllib.request.Request(current, headers={"User-Agent": USER_AGENT}, method=method)
        try:
            resp = opener.open(req, timeout=REQUEST_TIMEOUT)
        except urllib.error.HTTPError as e:
            # 4xx/5xx surface as HTTPError even with our handler installed
            body = b""
            try:
                body = e.read()
            except Exception:
                pass
            return {
                "status": e.code, "final_url": current, "chain": chain,
                "body": body, "headers": dict(e.headers or {}),
                "elapsed_ms": (time.time() - start) * 1000, "error": None,
            }
        except Exception as e:
            return {
                "status": None, "final_url": current, "chain": chain,
                "body": b"", "headers": {}, "elapsed_ms": (time.time() - start) * 1000,
                "error": f"{type(e).__name__}: {e}",
            }

        status = resp.status
        headers = dict(resp.headers.items())
        if 300 <= status < 400:
            location = resp.headers.get("Location")
            if not location:
                return {
                    "status": status, "final_url": current, "chain": chain,
                    "body": b"", "headers": headers,
                    "elapsed_ms": (time.time() - start) * 1000,
                    "error": "redirect_without_location",
                }
            newurl = urllib.parse.urljoin(current, location)
            chain.append({"from": current, "status": status, "to": newurl})
            current = newurl
            continue

        body = resp.read() if method == "GET" else b""
        return {
            "status": status, "final_url": current, "chain": chain,
            "body": body, "headers": headers,
            "elapsed_ms": (time.time() - start) * 1000, "error": None,
        }

    return {
        "status": None, "final_url": current, "chain": chain, "body": b"",
        "headers": {}, "elapsed_ms": (time.time() - start) * 1000,
        "error": "too_many_redirects",
    }


# ─────────────────────────────────────────────────────────────────────────
# HTML parsing (stdlib html.parser only)
# ─────────────────────────────────────────────────────────────────────────

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = None
        self.meta_description = None
        self.canonical = None
        self.robots_meta = None
        self.html_lang = None
        self.h1s = []
        self.h2_count = 0
        self.h3_count = 0
        self.jsonld_blocks = []
        self.links = []
        self.text_parts = []

        self._in_title = False
        self._in_h1 = False
        self._h1_buf = []
        self._h1_hidden = False
        self._h1_depth = 0
        self._in_jsonld = False
        self._jsonld_buf = []
        self._skip_text_tags = {"script", "style", "noscript"}
        self._skip_depth = 0

    def handle_starttag(self, tag, attrs):
        attrs_d = dict(attrs)
        if tag == "html" and "lang" in attrs_d:
            self.html_lang = attrs_d.get("lang")
        elif tag == "title":
            self._in_title = True
        elif tag == "meta":
            name = (attrs_d.get("name") or "").lower()
            prop = (attrs_d.get("property") or "").lower()
            if name == "description":
                self.meta_description = attrs_d.get("content")
            elif name == "robots":
                self.robots_meta = attrs_d.get("content")
        elif tag == "link":
            rel = (attrs_d.get("rel") or "").lower()
            if rel == "canonical":
                self.canonical = attrs_d.get("href")
        elif tag == "h1":
            if self._in_h1:
                # Nested h1 (shouldn't happen in valid markup) — ignore the inner tag.
                self._h1_depth += 1
            else:
                self._in_h1 = True
                self._h1_depth = 1
                self._h1_buf = []
                # Next.js/React components (e.g. Framer Motion text-split
                # animations) sometimes render a visually-hidden duplicate
                # heading for accessibility (aria-hidden="true") alongside
                # the real one. Only the real, screen-reader-visible H1
                # should count for SEO purposes.
                self._h1_hidden = (attrs_d.get("aria-hidden") or "").lower() == "true"
        elif tag == "h2":
            self.h2_count += 1
        elif tag == "h3":
            self.h3_count += 1
        elif tag == "a":
            href = attrs_d.get("href")
            if href:
                self.links.append(href)
        elif tag == "script":
            script_type = (attrs_d.get("type") or "").lower()
            if script_type == "application/ld+json":
                self._in_jsonld = True
                self._jsonld_buf = []
        if tag in self._skip_text_tags:
            self._skip_depth += 1

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag == "h1":
            if self._h1_depth > 1:
                self._h1_depth -= 1
                return
            self._in_h1 = False
            text = "".join(self._h1_buf).strip()
            if text and not self._h1_hidden:
                self.h1s.append(text)
        elif tag == "script" and self._in_jsonld:
            self._in_jsonld = False
            self.jsonld_blocks.append("".join(self._jsonld_buf))
        if tag in self._skip_text_tags and self._skip_depth > 0:
            self._skip_depth -= 1

    def handle_data(self, data):
        if self._in_title:
            self.title = (self.title or "") + data
        if self._in_h1:
            self._h1_buf.append(data)
        if self._in_jsonld:
            self._jsonld_buf.append(data)
        if self._skip_depth == 0:
            stripped = data.strip()
            if stripped:
                self.text_parts.append(stripped)

    def visible_word_count(self) -> int:
        return len(" ".join(self.text_parts).split())

    def visible_text(self) -> str:
        return " ".join(self.text_parts)


def parse_html(body: bytes) -> PageParser:
    parser = PageParser()
    try:
        parser.feed(body.decode("utf-8", errors="replace"))
    except Exception:
        pass
    return parser


def analyze_jsonld(blocks: list[str]) -> dict:
    valid = []
    invalid = []
    types_seen = []
    for raw in blocks:
        raw_stripped = raw.strip()
        if not raw_stripped:
            continue
        try:
            parsed = json.loads(raw_stripped)
        except json.JSONDecodeError as e:
            invalid.append(str(e))
            continue
        valid.append(parsed)
        items = parsed if isinstance(parsed, list) else [parsed]
        for item in items:
            if isinstance(item, dict):
                if "@graph" in item and isinstance(item["@graph"], list):
                    for g in item["@graph"]:
                        if isinstance(g, dict) and "@type" in g:
                            types_seen.append(g["@type"])
                elif "@type" in item:
                    types_seen.append(item["@type"])

    duplicate_types = []
    seen = {}
    for t in types_seen:
        key = t if isinstance(t, str) else json.dumps(t, sort_keys=True)
        seen[key] = seen.get(key, 0) + 1
    duplicate_types = [k for k, v in seen.items() if v > 1]

    return {
        "count": len(blocks),
        "valid_count": len(valid),
        "invalid_count": len(invalid),
        "invalid_errors": invalid,
        "types": sorted(set(
            t if isinstance(t, str) else json.dumps(t, sort_keys=True) for t in types_seen
        )),
        "duplicate_types": duplicate_types,
        "raw": valid,
    }


# ─────────────────────────────────────────────────────────────────────────
# GEO heuristic criteria — explicit, deterministic, pattern-based signals.
# These are NOT a certified score. Each is a concrete, reproducible check
# against visible text / structured data. Documented in the summary.
# ─────────────────────────────────────────────────────────────────────────

def evaluate_geo(parser: PageParser, jsonld_info: dict) -> dict:
    text = parser.visible_text()
    text_lower = text.lower()
    word_count = len(text.split())

    first_500_words = " ".join(text.split()[:500])
    direct_answer = bool(re.search(r"\b(is a|is an|are|refers to|defines|means)\b", first_500_words, re.IGNORECASE)) and word_count >= 60

    entity_definition = bool(re.search(r"\b(definition|DEFINITION|canonical knowledge block)\b", text, re.IGNORECASE))

    semantic_headings = (parser.h2_count + parser.h3_count) >= 2

    has_faq_schema = any(
        (t == "FAQPage") for t in jsonld_info.get("types", [])
    )
    has_faq_text = bool(re.search(r"\bfaq\b|frequently asked questions", text_lower))
    faqs = has_faq_schema or has_faq_text

    standards_cited = bool(STANDARD_PATTERN.search(text))

    org_signals = any(
        t in ("Organization",) for t in jsonld_info.get("types", [])
    ) or "@id" in json.dumps(jsonld_info.get("raw", []))

    relation_terms = ["system", "technology", "industry", "problem", "contamination"]
    relation_hits = sum(1 for term in relation_terms if term in text_lower)
    relation_signals = relation_hits >= 2

    citable_fragments = entity_definition or has_faq_schema or standards_cited

    visible_sufficient = word_count >= THIN_CONTENT_WORDS

    criteria = {
        "direct_answer": direct_answer,
        "entity_definition": entity_definition,
        "semantic_headings": semantic_headings,
        "faqs": faqs,
        "standards_cited": standards_cited,
        "org_signals": org_signals,
        "relation_signals": relation_signals,
        "citable_fragments": citable_fragments,
        "visible_sufficient_content": visible_sufficient,
    }
    met = sum(1 for v in criteria.values() if v)
    return {"criteria": criteria, "criteria_met": met, "criteria_total": len(criteria)}


# ─────────────────────────────────────────────────────────────────────────
# Sitemap
# ─────────────────────────────────────────────────────────────────────────

def download_sitemap() -> list[str]:
    result = fetch(SITEMAP_URL)
    if result["error"] or result["status"] != 200:
        raise SystemExit(
            f"FATAL: could not download sitemap ({SITEMAP_URL}) — "
            f"status={result['status']} error={result['error']}"
        )
    root = ET.fromstring(result["body"])
    return [el.text.strip() for el in root.findall(".//{*}loc") if el.text]


# ─────────────────────────────────────────────────────────────────────────
# Per-page audit
# ─────────────────────────────────────────────────────────────────────────

def audit_page(url: str) -> dict:
    time.sleep(PAGE_FETCH_DELAY)
    result = fetch(url)
    record = {
        "url": url,
        "category": categorize(urllib.parse.urlparse(url).path),
        "status": result["status"],
        "final_url": result["final_url"],
        "redirect_chain": result["chain"],
        "elapsed_ms": round(result["elapsed_ms"], 1),
        "error": result["error"],
        "content_type": result["headers"].get("Content-Type", ""),
    }

    if result["error"] or result["status"] is None or result["status"] >= 400:
        record.update({
            "indexable_html": False, "title": None, "meta_description": None,
            "canonical": None, "robots_meta": None, "h1_count": 0, "h1s": [],
            "lang": None, "jsonld": {"count": 0, "valid_count": 0, "invalid_count": 0,
                                      "invalid_errors": [], "types": [], "duplicate_types": []},
            "internal_links": [], "internal_link_count": 0, "word_count": 0, "geo": None,
        })
        return record

    if "text/html" not in record["content_type"] and record["content_type"] != "":
        record.update({
            "indexable_html": False, "title": None, "meta_description": None,
            "canonical": None, "robots_meta": None, "h1_count": 0, "h1s": [],
            "lang": None, "jsonld": {"count": 0, "valid_count": 0, "invalid_count": 0,
                                      "invalid_errors": [], "types": [], "duplicate_types": []},
            "internal_links": [], "internal_link_count": 0, "word_count": 0, "geo": None,
        })
        return record

    parser = parse_html(result["body"])
    jsonld_info = analyze_jsonld(parser.jsonld_blocks)

    final_host = urllib.parse.urlparse(result["final_url"]).netloc
    internal_links = set()
    for href in parser.links:
        absolute = urllib.parse.urljoin(result["final_url"], href)
        parsed_href = urllib.parse.urlparse(absolute)
        if parsed_href.netloc == final_host and parsed_href.scheme in ("http", "https"):
            clean = absolute.split("#")[0]
            if is_ignored_link(clean):
                continue  # Cloudflare-managed paths (e.g. /cdn-cgi/l/email-protection), not app routes
            internal_links.add(clean)

    title = (parser.title or "").strip() or None
    robots_meta = (parser.robots_meta or "").lower()
    is_noindex = "noindex" in robots_meta

    record.update({
        "indexable_html": not is_noindex,
        "title": title,
        "title_len": len(title) if title else 0,
        "meta_description": parser.meta_description,
        "meta_description_len": len(parser.meta_description) if parser.meta_description else 0,
        "canonical": parser.canonical,
        "robots_meta": parser.robots_meta,
        "h1_count": len(parser.h1s),
        "h1s": parser.h1s,
        "lang": parser.html_lang,
        "jsonld": jsonld_info,
        "internal_links": sorted(internal_links),
        "internal_link_count": len(internal_links),
        "word_count": parser.visible_word_count(),
        "geo": evaluate_geo(parser, jsonld_info),
    })
    return record


def check_link(url: str) -> dict:
    time.sleep(LINK_CHECK_DELAY)
    result = fetch(url, method="HEAD")
    if result["status"] is None or result["error"]:
        # Some servers reject HEAD; retry with GET before declaring it broken.
        result = fetch(url, method="GET")
    return {
        "url": url,
        "status": result["status"],
        "final_url": result["final_url"],
        "error": result["error"],
    }


# ─────────────────────────────────────────────────────────────────────────
# Findings engine — deterministic rules over the collected records
# ─────────────────────────────────────────────────────────────────────────

IMPACT_CLASS = {
    "CRÍTICO": "ERROR",
    "ALTO": "ERROR",
    "MEDIO": "ADVERTENCIA",
    "BAJO": "OBSERVACIÓN",
}


def _normalized_path(url: str) -> str:
    return urllib.parse.urlparse(url).path.rstrip("/") or "/"


def build_findings(records: list[dict], broken_links: dict[str, dict]) -> list[dict]:
    findings = []
    base_host = urllib.parse.urlparse(BASE_URL).netloc

    def add(url, category, severity, code, message):
        findings.append({
            "url": url, "page_category": category, "severity": severity,
            "impact_class": IMPACT_CLASS[severity],
            "check": code, "message": message,
        })

    titles_seen: dict[str, list[str]] = {}
    descriptions_seen: dict[str, list[str]] = {}

    for r in records:
        url = r["url"]
        cat = r["category"]

        if r["error"]:
            add(url, cat, "CRÍTICO", "request_error", f"Request failed: {r['error']}")
            continue
        if r["status"] is None:
            add(url, cat, "CRÍTICO", "no_response", "No HTTP response obtained")
            continue
        if r["status"] >= 500:
            add(url, cat, "CRÍTICO", "5xx", f"HTTP {r['status']}")
        elif r["status"] >= 400:
            add(url, cat, "ALTO", "4xx", f"HTTP {r['status']}")

        if len(r["redirect_chain"]) >= 2:
            add(url, cat, "ALTO", "redirect_chain",
                f"{len(r['redirect_chain'])}-hop redirect chain: " +
                " -> ".join([h["from"] for h in r["redirect_chain"]] + [r["final_url"]]))
        elif len(r["redirect_chain"]) == 1 and r["redirect_chain"][0]["to"] != r["final_url"]:
            pass  # single clean redirect, not itself a finding

        if r["status"] and r["status"] < 400 and r.get("indexable_html") is False and r["url"] in [rr["url"] for rr in records]:
            add(url, cat, "ALTO", "unexpected_noindex",
                "Page is listed in sitemap.xml but serves a noindex robots meta tag")

        if r.get("indexable_html") is False or r["error"] or (r["status"] and r["status"] >= 400):
            continue  # remaining checks only make sense for indexable HTML pages

        if r.get("title") is None:
            add(url, cat, "ALTO", "missing_title", "No <title> tag found")
        else:
            t = r["title"]
            titles_seen.setdefault(t, []).append(url)
            if r["title_len"] > TITLE_MAX_LEN:
                add(url, cat, "MEDIO", "title_too_long", f"Title is {r['title_len']} chars (recommended <= {TITLE_MAX_LEN}): \"{t}\"")
            elif r["title_len"] < TITLE_MIN_LEN:
                add(url, cat, "MEDIO", "title_too_short", f"Title is {r['title_len']} chars (recommended >= {TITLE_MIN_LEN}): \"{t}\"")

        if not r.get("meta_description"):
            add(url, cat, "MEDIO", "missing_meta_description", "No meta description found")
        else:
            d = r["meta_description"]
            descriptions_seen.setdefault(d, []).append(url)
            if r["meta_description_len"] > DESC_MAX_LEN:
                add(url, cat, "MEDIO", "description_too_long", f"Meta description is {r['meta_description_len']} chars (recommended <= {DESC_MAX_LEN})")

        # Distinct visible H1 texts only — Next.js/React components (Framer
        # Motion split-text animations in particular) sometimes render the
        # same heading text through multiple nested/sibling elements that
        # still resolve to one real <h1>; aria-hidden duplicates are already
        # excluded during parsing (see PageParser.handle_endtag).
        distinct_h1_texts = list(dict.fromkeys(r["h1s"]))
        if len(distinct_h1_texts) == 0:
            add(url, cat, "ALTO", "missing_h1", "No H1 found")
        elif len(distinct_h1_texts) > 1:
            add(url, cat, "MEDIO", "multiple_h1",
                f"{len(distinct_h1_texts)} distinct H1 texts found: {distinct_h1_texts}")

        if not r.get("canonical"):
            add(url, cat, "ALTO", "missing_canonical", "No canonical link found")
        else:
            canon = r["canonical"]
            resolved_canon = urllib.parse.urljoin(r["final_url"], canon)
            canon_parsed = urllib.parse.urlparse(resolved_canon)

            if canon_parsed.netloc and canon_parsed.netloc != base_host:
                add(url, cat, "ALTO", "canonical_external",
                    f"Canonical points to a different domain: {canon}")
            elif _normalized_path(resolved_canon) in (_normalized_path(url), _normalized_path(r["final_url"])):
                pass  # canonical to self — correct
            elif _normalized_path(url).startswith(_normalized_path(resolved_canon) + "/"):
                # e.g. /knowledge-center/fuel/injector-stiction canonicalizing
                # to /knowledge-center/fuel — intentional hub consolidation,
                # not an error. Still reported as an observation for visibility.
                add(url, cat, "BAJO", "canonical_hub_consolidation",
                    f"Canonical intentionally points to parent hub: {canon}")
            else:
                add(url, cat, "ALTO", "canonical_mismatch",
                    f"Canonical points to an unrelated URL: {canon}")

        jl = r["jsonld"]
        if jl["invalid_count"] > 0:
            add(url, cat, "ALTO", "invalid_jsonld", f"{jl['invalid_count']} invalid JSON-LD block(s): {jl['invalid_errors']}")
        if jl["duplicate_types"]:
            add(url, cat, "MEDIO", "duplicate_jsonld_type", f"Duplicate/contradictory JSON-LD @type(s): {jl['duplicate_types']}")
        if jl["count"] == 0:
            add(url, cat, "BAJO", "no_jsonld", "No JSON-LD structured data found")

        if not r.get("lang"):
            add(url, cat, "BAJO", "missing_lang", "No lang attribute on <html>")

        if r["word_count"] < THIN_CONTENT_WORDS:
            add(url, cat, "MEDIO", "thin_content", f"Only {r['word_count']} visible words (recommended >= {THIN_CONTENT_WORDS})")

        if r["elapsed_ms"] > SLOW_RESPONSE_MS:
            add(url, cat, "BAJO", "slow_response", f"Response took {r['elapsed_ms']:.0f}ms (>{SLOW_RESPONSE_MS}ms)")

        for link in r["internal_links"]:
            bl = broken_links.get(link)
            if bl and (bl["error"] or (bl["status"] and bl["status"] >= 400)):
                add(url, cat, "ALTO", "broken_internal_link",
                    f"Internal link is broken: {link} (status={bl['status']}, error={bl['error']})")

    for title, urls in titles_seen.items():
        if len(urls) > 1:
            for u in urls:
                cat = next(r["category"] for r in records if r["url"] == u)
                add(u, cat, "ALTO", "duplicate_title", f"Title \"{title}\" is duplicated across {len(urls)} URLs: {urls}")

    for desc, urls in descriptions_seen.items():
        if len(urls) > 1:
            for u in urls:
                cat = next(r["category"] for r in records if r["url"] == u)
                add(u, cat, "MEDIO", "duplicate_description", f"Meta description duplicated across {len(urls)} URLs: {urls}")

    return findings


SEVERITY_WEIGHT = {"CRÍTICO": 15, "ALTO": 8, "MEDIO": 3, "BAJO": 1}


def compute_seo_score(findings: list[dict], records: list[dict]) -> dict:
    """Deterministic, documented formula — not an arbitrary number.

    Computed per page first (each page starts at 100, loses weight[severity]
    per finding on that page, floored at 0), then the site score is the mean
    of those per-page scores. Averaging instead of a single sitewide
    subtraction keeps the result meaningful as the number of audited pages
    grows: with the old sitewide-sum formula, findings from hundreds of
    pages accumulated into one deduction and collapsed the score to 0 long
    before the site was actually broken. A page's own score can still hit 0
    if it individually racks up enough weight, but one page's problems no
    longer wipe out every other page's contribution to the total."""
    findings_by_url: dict[str, list[dict]] = {}
    for f in findings:
        findings_by_url.setdefault(f["url"], []).append(f)

    page_scores: dict[str, int] = {}
    for r in records:
        url = r["url"]
        deduction = sum(SEVERITY_WEIGHT[f["severity"]] for f in findings_by_url.get(url, []))
        page_scores[url] = max(0, 100 - deduction)

    score = round(sum(page_scores.values()) / len(page_scores)) if page_scores else 0

    by_severity = {}
    by_impact_class = {}
    for f in findings:
        by_severity[f["severity"]] = by_severity.get(f["severity"], 0) + 1
        by_impact_class[f["impact_class"]] = by_impact_class.get(f["impact_class"], 0) + 1

    total_deduction = sum(SEVERITY_WEIGHT[f["severity"]] for f in findings)

    return {
        "score": score,
        "formula": (
            "Per page: 100 - sum(weight[severity] for each finding on that page), floored at 0; "
            "weights: CRÍTICO=15, ALTO=8, MEDIO=3, BAJO=1. "
            "Site score = mean(all per-page scores), rounded."
        ),
        "total_deduction": total_deduction,
        "findings_by_severity": by_severity,
        "findings_by_impact_class": by_impact_class,
        "total_findings": len(findings),
        "total_urls_audited": len(records),
        "page_scores": page_scores,
    }


# ─────────────────────────────────────────────────────────────────────────
# Output writers
# ─────────────────────────────────────────────────────────────────────────

def write_csv_audit(records: list[dict], path: str):
    fields = [
        "url", "category", "status", "final_url", "redirect_hops", "elapsed_ms",
        "error", "content_type", "indexable_html", "title", "title_len",
        "meta_description", "meta_description_len", "canonical", "robots_meta",
        "h1_count", "lang", "jsonld_count", "jsonld_invalid_count",
        "internal_link_count", "word_count", "geo_criteria_met", "geo_criteria_total",
    ]
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for r in records:
            row = dict(r)
            row["redirect_hops"] = len(r.get("redirect_chain", []))
            jl = r.get("jsonld") or {}
            row["jsonld_count"] = jl.get("count", 0)
            row["jsonld_invalid_count"] = jl.get("invalid_count", 0)
            geo = r.get("geo") or {}
            row["geo_criteria_met"] = geo.get("criteria_met", "")
            row["geo_criteria_total"] = geo.get("criteria_total", "")
            writer.writerow(row)


def write_broken_links_csv(broken_links: dict[str, dict], referenced_by: dict[str, list[str]], path: str):
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["broken_link", "status", "error", "final_url", "referenced_by"])
        for link, info in broken_links.items():
            if info["error"] or (info["status"] and info["status"] >= 400):
                writer.writerow([
                    link, info["status"], info["error"], info["final_url"],
                    "; ".join(referenced_by.get(link, [])),
                ])


def write_duplicate_metadata_csv(findings: list[dict], path: str):
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["type", "url", "message"])
        for f_ in findings:
            if f_["check"] in ("duplicate_title", "duplicate_description"):
                writer.writerow([f_["check"], f_["url"], f_["message"]])


def write_findings_json(records, findings, seo_score, geo_summary, path: str):
    payload = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "base_url": BASE_URL,
        "sitemap_url": SITEMAP_URL,
        "total_urls": len(records),
        "seo_score": seo_score,
        "geo_summary": geo_summary,
        "findings": findings,
        "pages": records,
    }
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, default=str)


def write_summary_md(records, findings, seo_score, geo_summary, category_stats, path: str):
    lines = []
    lines.append("# ELIMFILTERS — Production SEO/GEO Audit")
    lines.append("")
    lines.append(f"Generated: {time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime())}")
    lines.append(f"Target: {BASE_URL} (sitemap: {SITEMAP_URL})")
    lines.append("")
    lines.append("This audit was produced by an automated, read-only script "
                  "(`scripts/seo-geo-audit/audit.py`) run inside GitHub Actions. "
                  "It made real HTTP requests against production. No results below are invented.")
    lines.append("")

    lines.append("## SEO Score")
    lines.append("")
    lines.append(f"**{seo_score['score']} / 100** (mean of all per-page scores)")
    lines.append("")
    lines.append(f"Formula (deterministic, not arbitrary): {seo_score['formula']}")
    lines.append(f"Total deduction across all pages: {seo_score['total_deduction']} points from {seo_score['total_findings']} finding(s).")
    lines.append("")
    lines.append("| Severity | Count |")
    lines.append("|---|---|")
    for sev in ("CRÍTICO", "ALTO", "MEDIO", "BAJO"):
        lines.append(f"| {sev} | {seo_score['findings_by_severity'].get(sev, 0)} |")
    lines.append("")
    lines.append("### By impact class")
    lines.append("")
    lines.append("- **ERROR** (CRÍTICO + ALTO) — real problems that should be fixed.")
    lines.append("- **ADVERTENCIA** (MEDIO) — worth reviewing, not necessarily wrong.")
    lines.append("- **OBSERVACIÓN** (BAJO) — informational signal, no action implied by itself.")
    lines.append("")
    lines.append("| Impact class | Count |")
    lines.append("|---|---|")
    for cls in ("ERROR", "ADVERTENCIA", "OBSERVACIÓN"):
        lines.append(f"| {cls} | {seo_score['findings_by_impact_class'].get(cls, 0)} |")
    lines.append("")

    lines.append("## GEO Evaluation")
    lines.append("")
    lines.append("No single arbitrary GEO score is produced. Instead, each indexable page is "
                  "checked against 9 explicit, reproducible pattern-based criteria. These are "
                  "heuristic text/structured-data signals, not a certified GEO audit — a human "
                  "should still confirm citable-quality content.")
    lines.append("")
    lines.append("| Criterion | Pages meeting it | of indexable pages |")
    lines.append("|---|---|---|")
    for crit, count in geo_summary["criteria_counts"].items():
        lines.append(f"| {crit} | {count} | {geo_summary['indexable_pages']} |")
    lines.append("")
    lines.append(f"Average criteria met per indexable page: "
                  f"{geo_summary['avg_criteria_met']:.1f} / {geo_summary['criteria_total']}")
    lines.append("")

    lines.append("## Coverage")
    lines.append("")
    lines.append(f"- Total URLs in sitemap: {len(records)}")
    approved = sum(1 for r in records if r["url"] not in {f["url"] for f in findings if f["severity"] in ("CRÍTICO", "ALTO")})
    lines.append(f"- URLs with zero CRÍTICO/ALTO findings: {approved}")
    error_urls = len({f["url"] for f in findings if f["severity"] in ("CRÍTICO", "ALTO")})
    lines.append(f"- URLs with at least one CRÍTICO/ALTO finding: {error_urls}")
    lines.append("")

    lines.append("## By category")
    lines.append("")
    lines.append("| Category | URLs | CRÍTICO | ALTO | MEDIO | BAJO |")
    lines.append("|---|---|---|---|---|---|")
    for cat, stats in sorted(category_stats.items()):
        lines.append(f"| {cat} | {stats['urls']} | {stats['CRÍTICO']} | {stats['ALTO']} | {stats['MEDIO']} | {stats['BAJO']} |")
    lines.append("")

    lines.append("## Top 20 problems by impact")
    lines.append("")
    lines.append("Impact = weight[severity] × number of pages affected by that specific check. "
                  "\"Source file\" is a best-effort heuristic mapping from the affected pages' "
                  "category to the repo template most likely responsible — dynamic routes serve "
                  "many URLs from one template, so treat it as a starting point for triage, not "
                  "a confirmed root cause.")
    lines.append("")
    priority_by_severity = {"CRÍTICO": "P0", "ALTO": "P1", "MEDIO": "P2", "BAJO": "P3"}
    grouped: dict[str, dict] = {}
    for f in findings:
        g = grouped.setdefault(f["check"], {
            "severity": f["severity"], "impact_class": f["impact_class"],
            "urls": set(), "categories": set(),
        })
        g["urls"].add(f["url"])
        g["categories"].add(f["page_category"])
    impact_rows = []
    for check, g in grouped.items():
        impact = SEVERITY_WEIGHT[g["severity"]] * len(g["urls"])
        source_files = sorted({CATEGORY_SOURCE_FILE.get(c, "unknown") for c in g["categories"]})
        impact_rows.append({
            "check": check, "severity": g["severity"], "impact_class": g["impact_class"],
            "impact": impact, "affected_pages": len(g["urls"]),
            "source_files": source_files,
            "priority": priority_by_severity[g["severity"]],
            "sample_urls": sorted(g["urls"])[:3],
        })
    impact_rows.sort(key=lambda x: x["impact"], reverse=True)
    top20 = impact_rows[:20]
    lines.append("| Priority | Check | Severity | Impact class | Affected pages | Impact score | Likely source file(s) | Example URL(s) |")
    lines.append("|---|---|---|---|---|---|---|---|")
    for row in top20:
        sources = "; ".join(row["source_files"]).replace("|", "\\|")
        examples = "; ".join(row["sample_urls"]).replace("|", "\\|")
        lines.append(
            f"| {row['priority']} | {row['check']} | {row['severity']} | {row['impact_class']} | "
            f"{row['affected_pages']} | {row['impact']} | {sources} | {examples} |"
        )
    lines.append("")
    lines.append(f"Full findings ({len(findings)} total, every affected URL): see `seo-geo-findings.json`.")
    lines.append("")
    lines.append("## Files in this artifact")
    lines.append("")
    lines.append("- `seo-geo-audit.csv` — one row per URL with the full field set")
    lines.append("- `seo-geo-findings.json` — every finding + every page record, machine-readable")
    lines.append("- `seo-geo-summary.md` — this file")
    lines.append("- `broken-links.csv` — internal links found to be broken")
    lines.append("- `duplicate-metadata.csv` — duplicate title/description pairs")

    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


# ─────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out-dir", default="seo-geo-audit-out")
    args = parser.parse_args()

    import os
    os.makedirs(args.out_dir, exist_ok=True)

    print(f"[audit] downloading sitemap: {SITEMAP_URL}")
    urls = download_sitemap()
    print(f"[audit] {len(urls)} URLs found in sitemap")

    records = []
    with ThreadPoolExecutor(max_workers=PAGE_FETCH_WORKERS) as pool:
        futures = {pool.submit(audit_page, u): u for u in urls}
        done = 0
        for fut in as_completed(futures):
            try:
                records.append(fut.result())
            except Exception as e:
                records.append({
                    "url": futures[fut], "category": categorize(urllib.parse.urlparse(futures[fut]).path),
                    "status": None, "final_url": futures[fut], "redirect_chain": [],
                    "elapsed_ms": 0, "error": f"unhandled: {e}", "content_type": "",
                    "indexable_html": False, "title": None, "meta_description": None,
                    "canonical": None, "robots_meta": None, "h1_count": 0, "h1s": [],
                    "lang": None, "jsonld": {"count": 0, "valid_count": 0, "invalid_count": 0,
                                              "invalid_errors": [], "types": [], "duplicate_types": []},
                    "internal_links": [], "internal_link_count": 0, "word_count": 0, "geo": None,
                })
            done += 1
            if done % 25 == 0 or done == len(urls):
                print(f"[audit] pages audited: {done}/{len(urls)}")

    sitemap_url_set = set(urls)
    all_internal_links = set()
    referenced_by: dict[str, list[str]] = {}
    for r in records:
        for link in r.get("internal_links", []):
            all_internal_links.add(link)
            referenced_by.setdefault(link, []).append(r["url"])

    links_to_check = sorted(all_internal_links - sitemap_url_set)[:LINK_CHECK_CAP]
    print(f"[audit] checking {len(links_to_check)} additional internal links "
          f"(of {len(all_internal_links - sitemap_url_set)} not already in sitemap; capped at {LINK_CHECK_CAP})")

    broken_links: dict[str, dict] = {}
    with ThreadPoolExecutor(max_workers=LINK_CHECK_WORKERS) as pool:
        futures = {pool.submit(check_link, u): u for u in links_to_check}
        done = 0
        for fut in as_completed(futures):
            u = futures[fut]
            try:
                broken_links[u] = fut.result()
            except Exception as e:
                broken_links[u] = {"url": u, "status": None, "final_url": u, "error": str(e)}
            done += 1
            if done % 100 == 0 or done == len(links_to_check):
                print(f"[audit] links checked: {done}/{len(links_to_check)}")

    for r in records:
        rec_status = r.get("status")
        broken_links.setdefault(r["url"], {
            "url": r["url"], "status": rec_status, "final_url": r.get("final_url"),
            "error": r.get("error"),
        })

    print("[audit] computing findings")
    findings = build_findings(records, broken_links)

    seo_score = compute_seo_score(findings, records)

    indexable = [r for r in records if r.get("geo")]
    criteria_names = list(indexable[0]["geo"]["criteria"].keys()) if indexable else []
    criteria_counts = {c: sum(1 for r in indexable if r["geo"]["criteria"].get(c)) for c in criteria_names}
    avg_met = (sum(r["geo"]["criteria_met"] for r in indexable) / len(indexable)) if indexable else 0
    geo_summary = {
        "indexable_pages": len(indexable),
        "criteria_total": len(criteria_names),
        "criteria_counts": criteria_counts,
        "avg_criteria_met": avg_met,
    }

    category_stats: dict[str, dict] = {}
    for r in records:
        cat = r["category"]
        category_stats.setdefault(cat, {"urls": 0, "CRÍTICO": 0, "ALTO": 0, "MEDIO": 0, "BAJO": 0})
        category_stats[cat]["urls"] += 1
    for f in findings:
        category_stats[f["page_category"]][f["severity"]] += 1

    write_csv_audit(records, f"{args.out_dir}/seo-geo-audit.csv")
    write_broken_links_csv(broken_links, referenced_by, f"{args.out_dir}/broken-links.csv")
    write_duplicate_metadata_csv(findings, f"{args.out_dir}/duplicate-metadata.csv")
    write_findings_json(records, findings, seo_score, geo_summary, f"{args.out_dir}/seo-geo-findings.json")
    write_summary_md(records, findings, seo_score, geo_summary, category_stats, f"{args.out_dir}/seo-geo-summary.md")

    print("")
    print(f"[audit] DONE — {len(records)} URLs, SEO score {seo_score['score']}/100, "
          f"{len(findings)} findings "
          f"(CRÍTICO={seo_score['findings_by_severity'].get('CRÍTICO', 0)}, "
          f"ALTO={seo_score['findings_by_severity'].get('ALTO', 0)}, "
          f"MEDIO={seo_score['findings_by_severity'].get('MEDIO', 0)}, "
          f"BAJO={seo_score['findings_by_severity'].get('BAJO', 0)})")


if __name__ == "__main__":
    main()
