from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def test_glossary_cavitation_is_definition_intent():
    text = (ROOT / "frontend/src/app/knowledge-center/glossary/[term]/page.tsx").read_text()
    assert "Cavitation Definition" in text


def test_glossary_element_collapse_is_definition_intent():
    text = (ROOT / "frontend/src/app/knowledge-center/glossary/[term]/page.tsx").read_text()
    assert "Element Collapse Definition" in text
