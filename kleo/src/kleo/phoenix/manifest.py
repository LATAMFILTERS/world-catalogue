"""Evidence manifest: a JSON-backed register of every piece of evidence
KLEO has incorporated for PROJECT-PHOENIX."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path


@dataclass
class EvidenceRecord:
    evidence_id: str
    original_name: str
    original_path: str
    copy_path: str
    size_bytes: int
    date_observed: str
    date_incorporated: str
    source: str
    sha256: str
    operator: str
    notes: str = ""
    fact_type: str = "allegation"


class Manifest:
    """Append-and-load JSON manifest of EvidenceRecords, one file per
    PHOENIX evidence root."""

    def __init__(self, path: str | Path):
        self.path = Path(path)
        self._records: list[EvidenceRecord] = []
        self._load()

    def _load(self) -> None:
        if self.path.is_file():
            data = json.loads(self.path.read_text(encoding="utf-8"))
            self._records = [EvidenceRecord(**r) for r in data.get("records", [])]

    def _save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = {"records": [asdict(r) for r in self._records]}
        self.path.write_text(
            json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8"
        )

    def add_record(self, record: EvidenceRecord) -> None:
        self._records.append(record)
        self._save()

    def list_records(self) -> list[EvidenceRecord]:
        return list(self._records)

    def find_by_hash(self, sha256: str) -> EvidenceRecord | None:
        for record in self._records:
            if record.sha256 == sha256:
                return record
        return None

    def find_by_original_path(self, original_path: str) -> EvidenceRecord | None:
        for record in self._records:
            if record.original_path == original_path:
                return record
        return None

    def next_evidence_id(self, prefix: str = "PHX") -> str:
        return f"{prefix}-{len(self._records) + 1:04d}"
