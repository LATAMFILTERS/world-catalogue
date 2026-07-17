import hashlib
import os
import stat

import pytest

from kleo.phoenix.evidence import (
    EvidenceProtectionError,
    EvidenceStore,
    FactType,
    compute_sha256,
)


@pytest.fixture
def phoenix_root(tmp_path):
    root = tmp_path / "08-EVIDENCE-MANAGEMENT"
    root.mkdir()
    return root


@pytest.fixture
def original_file(tmp_path):
    original = tmp_path / "inbox" / "invoice-flexport-0001.pdf"
    original.parent.mkdir(parents=True)
    original.write_bytes(b"this is the original evidence content, byte for byte")
    yield original
    # Best-effort cleanup: undo the read-only flag ingest() sets so
    # pytest's tmp_path teardown can delete the file on Windows.
    try:
        os.chmod(original, stat.S_IWRITE)
    except OSError:
        pass


def test_compute_sha256_matches_hashlib_reference(original_file):
    expected = hashlib.sha256(original_file.read_bytes()).hexdigest()
    assert compute_sha256(original_file) == expected


def test_ingest_copies_file_and_records_correct_sha256(phoenix_root, original_file):
    store = EvidenceStore.open(phoenix_root)
    record = store.ingest(
        original_file,
        source="Flexport correspondence inbox",
        operator="V. Abreu",
        date_observed="2026-03-01",
        notes="Alleged incorrect label notice",
        fact_type=FactType.ALLEGATION,
    )

    expected_hash = hashlib.sha256(b"this is the original evidence content, byte for byte").hexdigest()
    assert record.sha256 == expected_hash
    assert record.evidence_id == "PHX-0001"

    copy_path = phoenix_root / "working-copies" / f"{record.evidence_id}_{original_file.name}"
    assert copy_path.is_file()
    assert copy_path.read_bytes() == original_file.read_bytes()
    # The copy is a distinct file, not a hardlink/move of the original.
    assert copy_path != original_file


def test_ingest_never_moves_or_deletes_the_original(phoenix_root, original_file):
    store = EvidenceStore.open(phoenix_root)
    store.ingest(original_file, source="inbox", operator="tester")
    assert original_file.is_file()  # still exists, untouched, at its original path


def test_original_cannot_be_overwritten_after_ingest(phoenix_root, original_file):
    store = EvidenceStore.open(phoenix_root)
    original_bytes = original_file.read_bytes()
    store.ingest(original_file, source="inbox", operator="tester")

    with pytest.raises(EvidenceProtectionError):
        store.write_to_original(original_file, b"TAMPERED CONTENT")

    # Content on disk is exactly what it was before the (refused) write.
    assert original_file.read_bytes() == original_bytes


def test_original_is_marked_readonly_at_the_os_level_after_ingest(phoenix_root, original_file):
    store = EvidenceStore.open(phoenix_root)
    store.ingest(original_file, source="inbox", operator="tester")
    assert not os.access(original_file, os.W_OK)


def test_write_to_original_refuses_even_for_a_path_never_ingested(phoenix_root, tmp_path):
    store = EvidenceStore.open(phoenix_root)
    never_ingested = tmp_path / "not-tracked.txt"
    never_ingested.write_text("hi", encoding="utf-8")
    with pytest.raises(EvidenceProtectionError):
        store.write_to_original(never_ingested, b"anything")


def test_duplicate_content_is_deduplicated_by_hash(phoenix_root, original_file, tmp_path):
    store = EvidenceStore.open(phoenix_root)
    first = store.ingest(original_file, source="inbox", operator="tester")

    duplicate_path = tmp_path / "a-copy-with-different-name.pdf"
    duplicate_path.write_bytes(original_file.read_bytes())
    second = store.ingest(duplicate_path, source="inbox-again", operator="tester")

    assert second.evidence_id == first.evidence_id
    assert len(store.manifest.list_records()) == 1


def test_ingest_records_chain_of_custody_event(phoenix_root, original_file):
    store = EvidenceStore.open(phoenix_root)
    record = store.ingest(original_file, source="inbox", operator="V. Abreu")

    events = store.custody.read_events()
    assert len(events) == 1
    assert events[0]["evidence_id"] == record.evidence_id
    assert events[0]["action"] == "ingest"
    assert events[0]["actor"] == "V. Abreu"
    assert record.sha256 in events[0]["details"]


def test_manifest_persists_across_reopening_the_store(phoenix_root, original_file):
    store = EvidenceStore.open(phoenix_root)
    record = store.ingest(original_file, source="inbox", operator="tester")

    reopened = EvidenceStore.open(phoenix_root)
    reloaded_record = reopened.manifest.find_by_hash(record.sha256)
    assert reloaded_record is not None
    assert reloaded_record.evidence_id == record.evidence_id


def test_ingest_raises_for_missing_original(phoenix_root, tmp_path):
    store = EvidenceStore.open(phoenix_root)
    with pytest.raises(FileNotFoundError):
        store.ingest(tmp_path / "does-not-exist.pdf", source="inbox", operator="tester")
