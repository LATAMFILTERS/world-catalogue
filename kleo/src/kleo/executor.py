"""Runs Claude Code against a project's working directory and reports back
exactly what happened — no invented results.

Design notes:
- Never uses ``shell=True``: arguments are always passed as a list.
- The executable is located explicitly (config override or PATH lookup),
  never assumed.
- A ``FakeExecutor`` with the same interface is provided for tests so the
  real ``claude`` binary is never required to exercise the queue/app logic.
"""

from __future__ import annotations

import shutil
import subprocess
import threading
from dataclasses import dataclass, field
from pathlib import Path


class ClaudeExecutableNotFound(RuntimeError):
    pass


def detect_claude_executable(configured_path: str = "claude") -> str:
    """Resolve the Claude Code executable. Accepts an absolute/relative path
    to a file, or a bare command name to look up on PATH (trying common
    Windows extensions)."""
    candidate = Path(configured_path)
    if candidate.is_file():
        return str(candidate)

    search_names = [configured_path]
    if not configured_path.lower().endswith((".exe", ".cmd", ".ps1", ".bat")):
        search_names += [f"{configured_path}{ext}" for ext in (".exe", ".cmd", ".bat", ".ps1")]

    for name in search_names:
        found = shutil.which(name)
        if found:
            return found

    raise ClaudeExecutableNotFound(
        f"Could not find the Claude Code executable ('{configured_path}') on PATH. "
        "Set CLAUDE_CODE_PATH in .env or 'claude_path' in config.json."
    )


def _run_git(args: list[str], cwd: Path) -> str:
    try:
        proc = subprocess.run(
            ["git", *args],
            cwd=str(cwd),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=30,
        )
        return proc.stdout.strip()
    except (OSError, subprocess.TimeoutExpired) as exc:
        return f"(git unavailable: {exc})"


def collect_git_summary(cwd: str | Path) -> tuple[str, str]:
    """Return (git status --porcelain, git diff --stat) for *cwd*. Used both
    by the executor after a Claude Code run and by the /gitstatus command."""
    cwd = Path(cwd)
    return _run_git(["status", "--porcelain"], cwd), _run_git(["diff", "--stat"], cwd)


@dataclass
class ExecutionResult:
    exit_code: int | None
    stdout: str
    stderr: str
    timed_out: bool = False
    cancelled: bool = False
    git_status: str = ""
    git_diff_stat: str = ""


class ClaudeCodeExecutor:
    """Executes ``claude`` as a subprocess for a given project directory."""

    def __init__(
        self,
        claude_path: str = "claude",
        extra_args: list[str] | None = None,
        timeout_seconds: int = 900,
    ):
        self.claude_path = claude_path
        self.extra_args = extra_args or []
        self.timeout_seconds = timeout_seconds
        self._lock = threading.Lock()
        self._processes: dict[int, subprocess.Popen] = {}
        self._cancel_requested: set[int] = set()

    def cancel(self, task_id: int) -> bool:
        """Best-effort cancellation of a running task. Returns True if a
        live process for *task_id* was found and asked to terminate."""
        with self._lock:
            self._cancel_requested.add(task_id)
            proc = self._processes.get(task_id)
        if proc is None:
            return False
        proc.terminate()
        return True

    def run(
        self,
        project_path: str | Path,
        instruction: str,
        task_id: int | None = None,
        capture_git: bool = True,
    ) -> ExecutionResult:
        project_dir = Path(project_path)
        if not project_dir.is_dir():
            raise FileNotFoundError(f"Project directory does not exist: {project_dir}")

        executable = detect_claude_executable(self.claude_path)
        args = [executable, "-p", instruction, *self.extra_args]

        proc = subprocess.Popen(
            args,
            cwd=str(project_dir),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        if task_id is not None:
            with self._lock:
                self._processes[task_id] = proc

        timed_out = False
        try:
            stdout, stderr = proc.communicate(timeout=self.timeout_seconds)
        except subprocess.TimeoutExpired:
            proc.kill()
            stdout, stderr = proc.communicate()
            timed_out = True
        finally:
            if task_id is not None:
                with self._lock:
                    self._processes.pop(task_id, None)

        cancelled = False
        if task_id is not None:
            with self._lock:
                if task_id in self._cancel_requested:
                    self._cancel_requested.discard(task_id)
                    cancelled = True
                    timed_out = False

        git_status, git_diff_stat = collect_git_summary(project_dir) if capture_git else ("", "")

        return ExecutionResult(
            exit_code=proc.returncode,
            stdout=stdout or "",
            stderr=stderr or "",
            timed_out=timed_out,
            cancelled=cancelled,
            git_status=git_status,
            git_diff_stat=git_diff_stat,
        )


@dataclass
class FakeExecutor:
    """Drop-in replacement for ``ClaudeCodeExecutor`` used in tests. Never
    spawns a process; returns a scripted or default result so the queue,
    storage, and Telegram formatting can be exercised without a real
    Claude Code installation."""

    scripted_result: ExecutionResult | None = None
    calls: list[tuple] = field(default_factory=list)

    def run(self, project_path, instruction, task_id=None, capture_git=True) -> ExecutionResult:
        self.calls.append((str(project_path), instruction, task_id))
        if self.scripted_result is not None:
            return self.scripted_result
        return ExecutionResult(
            exit_code=0,
            stdout=f"[simulated] executed instruction for task {task_id}",
            stderr="",
            git_status="",
            git_diff_stat="",
        )

    def cancel(self, task_id: int) -> bool:
        return True
