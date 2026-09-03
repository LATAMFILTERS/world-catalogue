from pathlib import Path

OWNERSHIP = Path('frontend/src/lib/knowledge-center/canonical-article-ownership.ts').read_text(encoding='utf-8')
SEARCH_INDEX = Path('frontend/src/lib/knowledge-center/search-index.ts').read_text(encoding='utf-8')


def test_consolidated_engineering_topics_are_centralized():
    assert "'iso-16889'" in OWNERSHIP
    assert "'iso-4406'" in OWNERSHIP
    assert "'filter-media-science'" in OWNERSHIP


def test_search_index_excludes_consolidated_engineering_aliases():
    assert ".filter(a => !isConsolidatedEngineeringTopic(a.slug))" in SEARCH_INDEX


def test_search_index_emits_trailing_slash_urls():
    assert "href:      `/knowledge-center/engineering/${a.slug}/`" in SEARCH_INDEX
    assert "href:      `/knowledge-center/standards/${s.slug}/`" in SEARCH_INDEX
    assert "href:      `/knowledge-center/systems/${s.slug}/`" in SEARCH_INDEX
