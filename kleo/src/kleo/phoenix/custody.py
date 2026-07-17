"""Append-only chain-of-custody log for PROJECT-PHOENIX evidence."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


class CustodyLog:
    """JSON-Lines append-only log. Never rewrites or deletes prior entries —
    each call only appends one line, preserving the chain of custody."""

    def __init__(self, path: str | Path):
        self.path = Path(path)

    def record_event(self, evidence_id: str, action: str, actor: str, details: str = "") -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "evidence_id": evidence_id,
            "action": action,
            "actor": actor,
            "details": details,
        }
        with self.path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(entry, ensure_ascii=False) + "\n")

    def read_events(self) -> list[dict]:
        if not self.path.is_file():
            return []
        events = []
        for line in self.path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line:
                events.append(json.loads(line))
        return events
