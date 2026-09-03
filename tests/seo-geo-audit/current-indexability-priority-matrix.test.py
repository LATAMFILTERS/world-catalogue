import importlib.util
from pathlib import Path

MODULE = Path(__file__).resolve().parents[2] / 'scripts' / 'seo-geo-audit' / 'build_current_indexability_matrix.py'
spec = importlib.util.spec_from_file_location('current_indexability_matrix', MODULE)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def test_technical_404_is_p0():
    r = mod.classify({'url':'https://elimfilters.com/technologies/test/','status':'404'})
    assert r['priority'] == 'P0'
    assert r['action'] == 'TECHNICAL_REPAIR'


def test_utility_page_stays_concise():
    r = mod.classify({'url':'https://elimfilters.com/knowledge-center/calculators/test/','status':'200','canonical':'https://elimfilters.com/knowledge-center/calculators/test/','word_count':'80'})
    assert r['priority'] == 'P3'
    assert r['action'] == 'KEEP_CONCISE_REVIEW_CONTEXT'


def test_clean_thin_editorial_is_semantic_priority():
    r = mod.classify({'url':'https://elimfilters.com/knowledge-center/articles/test/','status':'200','canonical':'https://elimfilters.com/knowledge-center/articles/test/','word_count':'120','h1_count':'1'})
    assert r['priority'] in {'P0','P1'}
    assert r['action'] in {'SEMANTIC_REVIEW_FIRST','SEMANTIC_REVIEW'}


def test_noindex_is_not_semantic_expansion_target():
    r = mod.classify({'url':'https://elimfilters.com/legal/test/','status':'200','noindex':'true'})
    assert r['priority'] == 'P3'
    assert r['action'] == 'INTENTIONAL_EXCLUSION_REVIEW'
