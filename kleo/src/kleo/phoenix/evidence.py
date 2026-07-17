"""Evidence intake for PROJECT-PHOENIX.

Rules enforced here (see kleo/phoenix/__init__.py):
  * The original file is only ever opened for reading (to hash it and to
    copy it) — never opened for writing, never moved, never deleted.
  * After a successful copy, the original is marked read-only at the OS
    level as a second line of defense on top of the code-level checks.
  * ``write_to_original`` exists purely so this guarantee is directly
    testable: it always refuses, unconditionally.
"""

from __future__ import annotations

import enum
import hashlib
import os
import shutil
import stat
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from kleo.phoenix.custody import CustodyLog
from kleo.phoenix.manifest import EvidenceRecord, Manifest

_HASH_CHUNK_SIZE = 1024 * 1024


class EvidenceProtectionError(PermissionError):
    """Raised whenever anything tries to modify original evidence."""


class FactType(str, enum.Enum):
    """PROJECT-PHOENIX requires separating documented facts from
    allegations and inferences in every note attached to evidence."""

    VERIFIED_FACT = "verified_fact"
    ALLEGATION = "allegation"
    INFERENCE = "inference"


def compute_sha256(path: str | Path) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(_HASH_CHUNK_SIZE), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _mark_readonly(path: Path) -> None:
    try:
        os.chmod(path, stat.S_IREAD)
    except OSError:
        # Best-effort: code-level protection (EvidenceProtectionError) is
        # the primary guarantee; the OS flag is defense in depth.
        pass


@dataclass
class EvidenceStore:
    root: Path
    manifest: Manifest
    custody: CustodyLog

    @classmethod
    def open(cls, phoenix_root: str | Path) -> "EvidenceStore":
        root = Path(phoenix_root)
        manifest = Manifest(root / "evidence-manifest.json")
        custody = CustodyLog(root / "chain-of-custody.log")
        return cls(root=root, manifest=manifest, custody=custody)

    @property
    def working_copies_dir(self) -> Path:
        return self.root / "working-copies"

    def is_protected_original(self, path: str | Path) -> bool:
        resolved = str(Path(path).resolve())
        return self.manifest.find_by_original_path(resolved) is not None

    def write_to_original(self, path: str | Path, data: bytes) -> None:
        """Always refuses. There is no code path in KLEO that is permitted
        to write to an evidence original; this method exists to make that
        guarantee assertable in tests."""
        raise EvidenceProtectionError(
            f"PHOENIX policy violation: refused to write to original evidence "
            f"path '{path}'. Modify the working copy instead."
        )

    def ingest(
        self,
        original_path: str | Path,
        source: str,
        operator: str,
        date_observed: str = "DATE-UNKNOWN",
        notes: str = "",
        fact_type: FactType = FactType.ALLEGATION,
    ) -> EvidenceRecord:
        original = Path(original_path).resolve()
        if not original.is_file():
            raise FileNotFoundError(f"Evidence original not found: {original}")

        sha256 = compute_sha256(original)

        existing = self.manifest.find_by_hash(sha256)
        if existing is not None:
            self.custody.record_event(
                existing.evidence_id,
                "ingest-duplicate-skipped",
                operator,
                f"Duplicate content (SHA-256 match) offered again from: {original}",
            )
            return existing

        evidence_id = self.manifest.next_evidence_id()
        self.working_copies_dir.mkdir(parents=True, exist_ok=True)
        dest_path = self.working_copies_dir / f"{evidence_id}_{original.name}"
        if dest_path.exists():
            raise FileExistsError(f"Working-copy destination already exists: {dest_path}")

        # Copy — never move — so the original file is untouched on disk.
        shutil.copy2(original, dest_path)

        copy_hash = compute_sha256(dest_path)
        if copy_hash != sha256:
            raise IOError(
                f"Copy integrity check failed for {original}: "
                f"original sha256={sha256} copy sha256={copy_hash}"
            )

        record = EvidenceRecord(
            evidence_id=evidence_id,
            original_name=original.name,
            original_path=str(original),
            copy_path=str(dest_path),
            size_bytes=original.stat().st_size,
            date_observed=date_observed,
            date_incorporated=datetime.now(timezone.utc).isoformat(),
            source=source,
            sha256=sha256,
            operator=operator,
            notes=notes,
            fact_type=fact_type.value if isinstance(fact_type, FactType) else str(fact_type),
        )
        self.manifest.add_record(record)

        # Second line of defense: flip the OS read-only bit on the original
        # only after it has been safely copied and verified.
        _mark_readonly(original)

        self.custody.record_event(
            evidence_id,
            "ingest",
            operator,
            f"original={original} copy={dest_path} sha256={sha256} source={source}",
        )
        return record
