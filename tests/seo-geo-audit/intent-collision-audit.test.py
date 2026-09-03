import csv
import importlib.util
from pathlib import Path
from urllib.parse import urlparse

SCRIPT = Path('scripts/seo-geo-audit/detect_intent_collisions.py')
spec = importlib.util.spec_from_file_location('intent_collision', SCRIPT)
module = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(module)


def row(url, title, description='Technical reference', indexable='true'):
    path = urlparse(url).path
    return {
        'url': url,
        'path': path,
        'family': module.family_for(path),
        'status': '200',
        'indexable_html': indexable,
        'title': title,
        'meta_description': description,
    }


def test_detects_likely_competing_engineering_and_reference_pages():
    rows = [
        row('https://elimfilters.com/knowledge-center/engineering/airflow-engineering/', 'Airflow Engineering'),
        row('https://elimfilters.com/knowledge-center/engineering-reference/airflow-engineering/', 'Airflow Engineering | Engineering Reference | ELIMFILTERS'),
    ]
    findings = module.detect(rows)
    assert findings
    assert findings[0]['classification'] in {'HIGH_COLLISION_REVIEW', 'MEDIUM_COLLISION_REVIEW'}
    assert findings[0]['action'] == 'REVIEW_ONLY'


def test_glossary_and_problem_overlap_is_role_review_not_auto_merge():
    rows = [
        row('https://elimfilters.com/knowledge-center/glossary/cavitation/', 'Cavitation Definition — Filtration Glossary'),
        row('https://elimfilters.com/knowledge-center/problems/cavitation/', 'Cavitation — Failure Analysis'),
    ]
    findings = module.detect(rows)
    assert findings
    assert findings[0]['classification'] == 'ROLE_OVERLAP_REVIEW'
    assert findings[0]['reason'] == 'definition_vs_failure_analysis'


def test_nonindexable_aliases_are_excluded_from_input(tmp_path):
    path = tmp_path / 'audit.csv'
    fields = ['url', 'status', 'indexable_html', 'title', 'meta_description']
    with path.open('w', newline='', encoding='utf-8') as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        raw = row('https://elimfilters.com/knowledge-center/engineering/iso-4406/', 'ISO 4406', indexable='false')
        writer.writerow({key: raw[key] for key in fields})
    assert module.load_rows(path) == []
