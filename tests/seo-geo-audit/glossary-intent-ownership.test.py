from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def test_engineering_glossary_consolidates_to_canonical_glossary():
    text = (ROOT / "frontend/src/app/knowledge-center/engineering-reference/[section]/page.tsx").read_text()
    assert "engineering-glossary" in text
    assert "https://elimfilters.com/knowledge-center/glossary/" in text
    assert "index: false" in text


def test_beta_ratio_glossary_is_definition_intent():
    text = (ROOT / "frontend/src/app/knowledge-center/glossary/[term]/page.tsx").read_text()
    assert "'beta-ratio'" in text
    assert "Beta Ratio Definition" in text
