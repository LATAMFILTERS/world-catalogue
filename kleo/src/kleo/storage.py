"""SQLite persistence layer for the KLEO task queue and chat state.

Uses only the stdlib ``sqlite3`` module — no external DB dependency. WAL mode
is enabled so the queue survives process restarts without corruption.
"""

from __future__ import annotations

import sqlite3
import threading
from pathlib import Path

from kleo.tasks import Task, TaskStatus, utcnow_iso

SCHEMA = """
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    project TEXT NOT NULL,
    instruction TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    started_at TEXT,
    finished_at TEXT,
    result_summary TEXT,
    files_changed TEXT,
    tests_run TEXT,
    error TEXT,
    exit_code INTEGER,
    git_status TEXT,
    git_diff_stat TEXT
);

CREATE TABLE IF NOT EXISTS chat_state (
    chat_id INTEGER PRIMARY KEY,
    active_project TEXT,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
"""


class Storage:
    """Synchronous SQLite wrapper shared by the Telegram-polling thread and
    the worker thread. A single ``sqlite3.Connection`` is not safe for
    unsynchronized concurrent use even with ``check_same_thread=False``
    (that flag only lifts the same-thread restriction, it does not add
    locking), so every public method here serializes on ``self._lock``."""

    def __init__(self, db_path: str | Path):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.RLock()
        self._conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._conn.execute("PRAGMA journal_mode=WAL;")
        self._conn.execute("PRAGMA foreign_keys=ON;")
        self._conn.executescript(SCHEMA)
        self._conn.commit()

    def close(self) -> None:
        self._conn.close()

    def __enter__(self) -> "Storage":
        return self

    def __exit__(self, *exc) -> None:
        self.close()

    # -- tasks ---------------------------------------------------------

    def create_task(self, chat_id: int, project: str, instruction: str,
                     status: TaskStatus = TaskStatus.QUEUED) -> Task:
        with self._lock:
            cur = self._conn.execute(
                """INSERT INTO tasks (chat_id, project, instruction, status, created_at)
                   VALUES (?, ?, ?, ?, ?)""",
                (chat_id, project, instruction, status.value, utcnow_iso()),
            )
            self._conn.commit()
            return self.get_task(cur.lastrowid)

    def get_task(self, task_id: int) -> Task | None:
        with self._lock:
            row = self._conn.execute(
                "SELECT * FROM tasks WHERE id = ?", (task_id,)
            ).fetchone()
            return Task.from_row(dict(row)) if row else None

    def next_queued_task(self) -> Task | None:
        with self._lock:
            row = self._conn.execute(
                "SELECT * FROM tasks WHERE status = ? ORDER BY created_at ASC, id ASC LIMIT 1",
                (TaskStatus.QUEUED.value,),
            ).fetchone()
            return Task.from_row(dict(row)) if row else None

    def list_tasks(self, chat_id: int | None = None, limit: int = 20) -> list[Task]:
        with self._lock:
            if chat_id is None:
                rows = self._conn.execute(
                    "SELECT * FROM tasks ORDER BY id DESC LIMIT ?", (limit,)
                ).fetchall()
            else:
                rows = self._conn.execute(
                    "SELECT * FROM tasks WHERE chat_id = ? ORDER BY id DESC LIMIT ?",
                    (chat_id, limit),
                ).fetchall()
            return [Task.from_row(dict(r)) for r in rows]

    def update_task(self, task: Task) -> None:
        with self._lock:
            row = task.to_row()
            row.pop("id")
            columns = ", ".join(f"{k} = ?" for k in row)
            self._conn.execute(
                f"UPDATE tasks SET {columns} WHERE id = ?",
                (*row.values(), task.id),
            )
            self._conn.commit()

    def mark_status(self, task_id: int, status: TaskStatus, **fields) -> Task | None:
        with self._lock:
            task = self.get_task(task_id)
            if task is None:
                return None
            task.status = status
            for key, value in fields.items():
                setattr(task, key, value)
            self.update_task(task)
            return task

    def requeue_interrupted_tasks(self) -> list[int]:
        """On startup: any task left 'running' from a previous crash goes back
        to 'queued' so no work is silently lost, and the system keeps
        functioning correctly after a restart."""
        with self._lock:
            rows = self._conn.execute(
                "SELECT id FROM tasks WHERE status = ?", (TaskStatus.RUNNING.value,)
            ).fetchall()
            ids = [r["id"] for r in rows]
            if ids:
                self._conn.execute(
                    "UPDATE tasks SET status = ? WHERE status = ?",
                    (TaskStatus.QUEUED.value, TaskStatus.RUNNING.value),
                )
                self._conn.commit()
            return ids

    def count_by_status(self, status: TaskStatus) -> int:
        with self._lock:
            row = self._conn.execute(
                "SELECT COUNT(*) AS c FROM tasks WHERE status = ?", (status.value,)
            ).fetchone()
            return row["c"]

    def cancel_task(self, task_id: int) -> Task | None:
        with self._lock:
            task = self.get_task(task_id)
            if task is None:
                return None
            if task.status not in (TaskStatus.QUEUED, TaskStatus.RUNNING, TaskStatus.BLOCKED):
                return task
            task.status = TaskStatus.CANCELLED
            task.finished_at = utcnow_iso()
            self.update_task(task)
            return task

    # -- chat state ------------------------------------------------------

    def set_active_project(self, chat_id: int, project: str) -> None:
        with self._lock:
            self._conn.execute(
                """INSERT INTO chat_state (chat_id, active_project, updated_at)
                   VALUES (?, ?, ?)
                   ON CONFLICT(chat_id) DO UPDATE SET
                       active_project = excluded.active_project,
                       updated_at = excluded.updated_at""",
                (chat_id, project, utcnow_iso()),
            )
            self._conn.commit()

    def get_active_project(self, chat_id: int) -> str | None:
        with self._lock:
            row = self._conn.execute(
                "SELECT active_project FROM chat_state WHERE chat_id = ?", (chat_id,)
            ).fetchone()
            return row["active_project"] if row else None
