import importlib.util
from pathlib import Path

MODULE = Path(__file__).resolve().parents[2] / "scripts" / "seo-geo-audit" / "triage_gsc_indexing_examples.py"
spec = importlib.util.spec_from_file_location("gsc_triage", MODULE)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def test_crawled_editorial_becomes_semantic_candidate():
    action, _ = mod.classify(
        {"url": "https://elimfilters.com/knowledge-center/articles/test/", "gsc_state": "CRAWLED_NOT_INDEXED"},
        {"status": "200", "canonical": "https://elimfilters.com/knowledge-center/articles/test/", "word_count": "300"},
    )
    assert action == "REVIEW_FOR_EXPANSION"


def test_discovered_editorial_is_crawl_priority_first():
    action, _ = mod.classify(
        {"url": "https://elimfilters.com/knowledge-center/articles/test/", "gsc_state": "DISCOVERED_NOT_INDEXED"},
        {"status": "200", "canonical": "https://elimfilters.com/knowledge-center/articles/test/"},
    )
    assert action == "CRAWL_DISCOVERY_PRIORITY"


def test_calculator_is_not_padded():
    action, _ = mod.classify(
        {"url": "https://elimfilters.com/knowledge-center/calculators/beta-ratio-efficiency/", "gsc_state": "CRAWLED_NOT_INDEXED"},
        {"status": "200", "canonical": "https://elimfilters.com/knowledge-center/calculators/beta-ratio-efficiency/"},
    )
    assert action == "KEEP_CONCISE_REVIEW_CONTEXT"


def test_technical_problem_precedes_semantic_review():
    action, _ = mod.classify(
        {"url": "https://elimfilters.com/knowledge-center/articles/test/", "gsc_state": "CRAWLED_NOT_INDEXED"},
        {"status": "404"},
    )
    assert action == "TECHNICAL_REPAIR"
