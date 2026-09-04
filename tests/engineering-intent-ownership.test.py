from pathlib import Path

TOPIC_PAGE = Path('frontend/src/app/knowledge-center/engineering/[topic]/page.tsx').read_text(encoding='utf-8')
OWNERSHIP = Path('frontend/src/lib/knowledge-center/canonical-article-ownership.ts').read_text(encoding='utf-8')


def test_deep_analysis_topics_keep_distinct_engineering_intent():
    assert "'airflow-engineering'" in TOPIC_PAGE
    assert 'Deep engineering analysis of air-filter restriction' in TOPIC_PAGE
    assert "'fluid-cleanliness'" in TOPIC_PAGE
    assert 'Deep technical analysis of ISO 4406 target codes' in TOPIC_PAGE


def test_consolidated_topics_have_single_canonical_owner_registry():
    assert "'iso-16889': 'https://elimfilters.com/knowledge-center/standards/iso-16889/'" in OWNERSHIP
    assert "'iso-4406': 'https://elimfilters.com/knowledge-center/standards/iso-4406/'" in OWNERSHIP
    assert "'filter-media-science': 'https://elimfilters.com/knowledge-center/engineering/filter-media-engineering/'" in OWNERSHIP
    assert 'getEngineeringTopicCanonicalOwner' in TOPIC_PAGE
