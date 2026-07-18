"""Task model and state machine for the KLEO task queue."""

from __future__ import annotations

import enum
from dataclasses import dataclass, field
from datetime import datetime, timezone


class TaskStatus(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    ERROR = "error"
    CANCELLED = "cancelled"
    BLOCKED = "blocked_pending_confirmation"


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class Task:
    id: int | None
    chat_id: int
    project: str
    instruction: str
    status: TaskStatus = TaskStatus.QUEUED
    created_at: str = field(default_factory=utcnow_iso)
    started_at: str | None = None
    finished_at: str | None = None
    result_summary: str | None = None
    files_changed: str | None = None
    tests_run: str | None = None
    error: str | None = None
    exit_code: int | None = None
    git_status: str | None = None
    git_diff_stat: str | None = None
    env_verified: str | None = None

    def to_row(self) -> dict:
        return {
            "id": self.id,
            "chat_id": self.chat_id,
            "project": self.project,
            "instruction": self.instruction,
            "status": self.status.value,
            "created_at": self.created_at,
            "started_at": self.started_at,
            "finished_at": self.finished_at,
            "result_summary": self.result_summary,
            "files_changed": self.files_changed,
            "tests_run": self.tests_run,
            "error": self.error,
            "exit_code": self.exit_code,
            "git_status": self.git_status,
            "git_diff_stat": self.git_diff_stat,
            "env_verified": self.env_verified,
        }

    @classmethod
    def from_row(cls, row: dict) -> "Task":
        data = dict(row)
        data["status"] = TaskStatus(data["status"])
        return cls(**data)
