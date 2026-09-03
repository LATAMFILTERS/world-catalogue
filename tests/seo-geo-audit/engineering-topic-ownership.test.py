from pathlib import Path

PAGE = Path('frontend/src/app/knowledge-center/engineering/[topic]/page.tsx')
SOURCE = PAGE.read_text(encoding='utf-8')


def test_standard_topics_keep_standard_canonical_ownership():
    assert "'iso-16889': 'https://elimfilters.com/knowledge-center/standards/iso-16889/'" in SOURCE
    assert "'iso-4406': 'https://elimfilters.com/knowledge-center/standards/iso-4406/'" in SOURCE


def test_filter_media_science_consolidates_to_deep_engineering_owner():
    assert "'filter-media-science': 'https://elimfilters.com/knowledge-center/engineering/filter-media-engineering/'" in SOURCE


def test_consolidated_topics_are_noindex_follow():
    assert "robots: canonicalOwnerUrl ? { index: false, follow: true } : undefined" in SOURCE
