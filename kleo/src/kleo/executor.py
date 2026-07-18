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

import hashlib
import shutil
import subprocess
import tempfile
import threading
from dataclasses import dataclass, field
from pathlib import Path


class ClaudeExecutableNotFound(RuntimeError):
    pass


class OpenCodeExecutableNotFound(RuntimeError):
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


def detect_opencode_executable(configured_path: str = "opencode") -> str:
    """Resolve the OpenCode executable from a file path or PATH."""
    candidate = Path(configured_path)
    if candidate.is_file():
        return str(candidate)

    search_names = [configured_path]
    if not configured_path.lower().endswith((".exe", ".cmd", ".ps1", ".bat")):
        search_names += [
            f"{configured_path}{ext}"
            for ext in (".exe", ".cmd", ".bat", ".ps1")
        ]

    for name in search_names:
        found = shutil.which(name)
        if found:
            return found

    raise OpenCodeExecutableNotFound(
        f"Could not find the OpenCode executable ('{configured_path}') on PATH. "
        "Set OPENCODE_PATH in .env or 'opencode_path' in config.json."
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


def _run_git_bytes(args: list[str], cwd: Path) -> bytes:
    try:
        proc = subprocess.run(
            ["git", *args],
            cwd=str(cwd),
            capture_output=True,
            timeout=30,
        )
        return proc.stdout
    except (OSError, subprocess.TimeoutExpired) as exc:
        return f"git unavailable: {exc}".encode("utf-8", errors="replace")


def repository_fingerprint(cwd: str | Path) -> str:
    """Fingerprint tracked modifications and untracked file contents.

    This lets KLEO distinguish a real repository mutation from a model that
    merely *claims* it changed something. Existing dirty state is allowed: the
    fingerprint is captured before and after each task and only the delta is
    considered evidence of work performed by that task.
    """
    root = Path(cwd)
    digest = hashlib.sha256()
    digest.update(_run_git_bytes(["diff", "--binary", "HEAD", "--"], root))

    untracked = _run_git_bytes(
        ["ls-files", "--others", "--exclude-standard", "-z"], root
    ).split(b"\0")
    for raw_name in sorted(name for name in untracked if name):
        digest.update(b"\0UNTRACKED\0")
        digest.update(raw_name)
        path = root / raw_name.decode("utf-8", errors="surrogateescape")
        try:
            digest.update(path.read_bytes())
        except OSError as exc:
            digest.update(f"<unreadable:{exc}>".encode("utf-8", errors="replace"))
    return digest.hexdigest()


def collect_git_summary(cwd: str | Path) -> tuple[str, str]:
    """Return (git status --porcelain, git diff --stat) for *cwd*. Used both
    by the executor after a Claude Code run and by the /gitstatus command."""
    cwd = Path(cwd)
    return _run_git(["status", "--porcelain"], cwd), _run_git(["diff", "--stat"], cwd)


def build_grounded_instruction(instruction: str) -> str:
    """Wrap a user task with non-negotiable evidence rules for Claude Code."""
    return f"""{instruction}

REGLAS OBLIGATORIAS DE KLEO:
1. Trabaja únicamente con archivos y comandos que existan realmente en el directorio actual.
2. No inventes rutas, funciones, resultados, pruebas, commits ni flujos de llamada.
3. Antes de afirmar que un archivo existe, verifícalo en disco. Antes de describir código, léelo.
4. Excluye node_modules y artefactos generados salvo que la tarea los solicite expresamente.
5. Si la tarea pide modificar el proyecto, realiza el cambio real y ejecuta una verificación apropiada.
6. Si no puedes comprobar una afirmación, escribe literalmente: NO VERIFICADO.
7. La salida final debe separar HECHOS VERIFICADOS, CAMBIOS REALES, PRUEBAS EJECUTADAS y LIMITACIONES.
8. Un exit code 0 solo significa que el proceso terminó; no autoriza a declarar que una tarea quedó completada sin evidencia.
"""


@dataclass
class ExecutionResult:
    exit_code: int | None
    stdout: str
    stderr: str
    timed_out: bool = False
    cancelled: bool = False
    git_status: str = ""
    git_diff_stat: str = ""
    repository_changed: bool = False


@dataclass
class TestResult:
    exit_code: int | None
    stdout: str
    stderr: str
    timed_out: bool = False

    @property
    def passed(self) -> bool:
        return not self.timed_out and self.exit_code == 0


def run_test_command(command: str, cwd: str | Path, timeout_seconds: int = 600) -> TestResult:
    """Runs *command* in *cwd* to verify a Claude Code change actually works
    before KLEO reports the task as completed. Uses ``shell=True``
    deliberately: unlike the Claude Code invocation (which embeds untrusted
    Telegram message text and must never go through a shell), this command
    string only ever comes from the operator's local config.json — never
    from a chat message."""
    try:
        proc = subprocess.run(
            command,
            shell=True,
            cwd=str(cwd),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout_seconds,
        )
        return TestResult(exit_code=proc.returncode, stdout=proc.stdout or "", stderr=proc.stderr or "")
    except subprocess.TimeoutExpired as exc:
        return TestResult(
            exit_code=None,
            stdout=(exc.stdout or "") if isinstance(exc.stdout, str) else "",
            stderr=(exc.stderr or "") if isinstance(exc.stderr, str) else "",
            timed_out=True,
        )


class AgentExecutor:
    """Base interface for all execution backends."""

    def run(
        self,
        project_path: str | Path,
        instruction: str,
        task_id: int | None = None,
        capture_git: bool = True,
    ) -> ExecutionResult:
        raise NotImplementedError

    def cancel(self, task_id: int) -> bool:
        raise NotImplementedError


class ClaudeCodeExecutor(AgentExecutor):
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
        before_fingerprint = repository_fingerprint(project_dir) if capture_git else ""
        grounded_instruction = build_grounded_instruction(instruction)
        args = [executable, "-p", grounded_instruction, *self.extra_args]

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
        after_fingerprint = repository_fingerprint(project_dir) if capture_git else ""

        return ExecutionResult(
            exit_code=proc.returncode,
            stdout=stdout or "",
            stderr=stderr or "",
            timed_out=timed_out,
            cancelled=cancelled,
            git_status=git_status,
            git_diff_stat=git_diff_stat,
            repository_changed=bool(capture_git and before_fingerprint != after_fingerprint),
        )


class OpenCodeExecutor(AgentExecutor):
    """Executes ``opencode run`` in a project directory."""

    def __init__(
        self,
        opencode_path: str = "opencode",
        extra_args: list[str] | None = None,
        timeout_seconds: int = 900,
    ):
        self.opencode_path = opencode_path
        self.extra_args = extra_args or []
        self.timeout_seconds = timeout_seconds
        self._lock = threading.Lock()
        self._processes: dict[int, subprocess.Popen] = {}
        self._cancel_requested: set[int] = set()

    def cancel(self, task_id: int) -> bool:
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
            raise FileNotFoundError(
                f"Project directory does not exist: {project_dir}"
            )

        executable = detect_opencode_executable(self.opencode_path)
        before_fingerprint = (
            repository_fingerprint(project_dir) if capture_git else ""
        )
        grounded_instruction = build_grounded_instruction(instruction)

        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            suffix=".md",
            prefix="kleo_opencode_",
            delete=False,
        ) as prompt_file:
            prompt_file.write(grounded_instruction)
            prompt_path = Path(prompt_file.name)

        args = [
            executable,
            "run",
            "Ejecuta exactamente la tarea contenida en el archivo adjunto.",
            "--file",
            str(prompt_path),
            *self.extra_args,
        ]

        try:
            proc = subprocess.Popen(
                args,
                cwd=str(project_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding="utf-8",
                errors="replace",
            )
        except Exception:
            prompt_path.unlink(missing_ok=True)
            raise

        if task_id is not None:
            with self._lock:
                self._processes[task_id] = proc

        timed_out = False
        try:
            stdout, stderr = proc.communicate(
                timeout=self.timeout_seconds
            )
        except subprocess.TimeoutExpired:
            proc.kill()
            stdout, stderr = proc.communicate()
            timed_out = True
        finally:
            if task_id is not None:
                with self._lock:
                    self._processes.pop(task_id, None)
            prompt_path.unlink(missing_ok=True)

        cancelled = False
        if task_id is not None:
            with self._lock:
                if task_id in self._cancel_requested:
                    self._cancel_requested.discard(task_id)
                    cancelled = True
                    timed_out = False

        git_status, git_diff_stat = (
            collect_git_summary(project_dir)
            if capture_git
            else ("", "")
        )
        after_fingerprint = (
            repository_fingerprint(project_dir) if capture_git else ""
        )

        return ExecutionResult(
            exit_code=proc.returncode,
            stdout=stdout or "",
            stderr=stderr or "",
            timed_out=timed_out,
            cancelled=cancelled,
            git_status=git_status,
            git_diff_stat=git_diff_stat,
            repository_changed=bool(
                capture_git
                and before_fingerprint != after_fingerprint
            ),
        )


@dataclass
class FakeExecutor(AgentExecutor):
    """Drop-in replacement for an executor used in tests. Never
    spawns a process; returns a scripted or default result so the queue,
    storage, and Telegram formatting can be exercised without a real
    ``claude`` binary."""

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
            repository_changed=False,
        )

    def cancel(self, task_id: int) -> bool:
        return True


def build_executor(config) -> AgentExecutor:
    """Create the executor selected by ``agent_backend``."""
    if config.agent_backend == "claude":
        return ClaudeCodeExecutor(
            claude_path=config.claude_path,
            extra_args=config.claude_extra_args,
            timeout_seconds=config.claude_timeout_seconds,
        )

    if config.agent_backend == "opencode":
        return OpenCodeExecutor(
            opencode_path=config.opencode_path,
            extra_args=config.opencode_extra_args,
            timeout_seconds=config.opencode_timeout_seconds,
        )

    raise ValueError(
        f"Unsupported agent backend: {config.agent_backend!r}"
    )
