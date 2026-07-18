"""Verifies a project's on-disk repository state before KLEO lets Claude
Code touch it.

Runs before every task: confirms the configured path exists and is exactly
the root of a real git repository (not a subdirectory of one), that it
points at a mandatory expected remote, that HEAD resolves to a named branch
(never a detached HEAD), that ``git status`` can actually be read, and that
there is no merge/rebase/cherry-pick left mid-flight. A task never reaches
Claude Code unless every check passes — this is deliberately fail-closed:
anything that can't be positively confirmed blocks the task, it never falls
back to treating an unknown state as safe.
"""

from __future__ import annotations

import subprocess
from dataclasses import dataclass
from pathlib import Path


@dataclass
class RepoVerification:
    project: str
    configured_path: str
    git_root: str | None = None
    remote_url: str | None = None
    branch: str | None = None
    head: str | None = None
    status: str = ""
    error: str | None = None

    @property
    def ok(self) -> bool:
        return self.error is None


def _normalize_remote(url: str) -> str:
    return url.strip().rstrip("/").removesuffix(".git").lower()


def _git(args: list[str], cwd: Path) -> tuple[bool, str]:
    """Runs a git command; returns (success, stdout stripped). Never raises —
    a missing git binary, a non-repo path, or a timeout is just a failed
    check here, not a crash."""
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
        return proc.returncode == 0, proc.stdout.strip()
    except (OSError, subprocess.TimeoutExpired):
        return False, ""


def verify_repository(
    project: str, configured_path: str | Path, expected_remote: str | None = None
) -> RepoVerification:
    """Runs the full pre-flight check for *project* at *configured_path*.
    Returns a RepoVerification whose ``.ok`` is False (with ``.error`` set)
    the moment any check fails — callers must not run Claude Code unless
    ``.ok`` is True. Every check here is fail-closed: anything that can't be
    positively confirmed (an exact repo root, a configured remote, a named
    branch, a readable working-tree status) blocks the task rather than
    falling back to an assumption."""
    result = RepoVerification(project=project, configured_path=str(configured_path))
    path = Path(configured_path)

    if not path.is_dir():
        result.error = f"La ruta configurada no existe: {configured_path}"
        return result

    ok, toplevel = _git(["rev-parse", "--show-toplevel"], path)
    if not ok or not toplevel:
        result.error = f"'{configured_path}' no es un repositorio Git (no se pudo determinar la raíz)"
        return result
    result.git_root = toplevel
    root = Path(toplevel)

    if path.resolve() != root.resolve():
        result.error = (
            "La ruta configurada no es la raíz del repositorio "
            f"(ruta configurada: {path.resolve()}, raíz Git: {root.resolve()})"
        )
        return result

    if not expected_remote:
        result.error = (
            f"El proyecto '{project}' no tiene 'expected_remote' configurado en "
            "expected_remotes; es obligatorio para poder ejecutar tareas."
        )
        return result

    ok, remote_url = _git(["remote", "get-url", "origin"], root)
    result.remote_url = remote_url if ok and remote_url else None
    if not result.remote_url or _normalize_remote(result.remote_url) != _normalize_remote(expected_remote):
        result.error = (
            f"El remote origin ({result.remote_url or '(sin remote)'}) no coincide "
            f"con el esperado ({expected_remote})"
        )
        return result

    ok, branch = _git(["branch", "--show-current"], root)
    if not ok or not branch:
        result.error = (
            f"No se pudo determinar la rama actual en '{toplevel}' "
            "(HEAD podría estar en estado detached)"
        )
        return result
    result.branch = branch

    ok, head = _git(["rev-parse", "HEAD"], root)
    if not ok or not head:
        result.error = f"No se pudo determinar HEAD en '{toplevel}'"
        return result
    result.head = head

    ok, status = _git(["status", "--porcelain"], root)
    if not ok:
        result.error = f"No se pudo determinar el estado del repositorio en '{toplevel}' (git status falló)"
        return result
    result.status = status

    ok, git_dir = _git(["rev-parse", "--git-dir"], root)
    git_dir_path = (root / git_dir) if ok and git_dir else (root / ".git")
    if (git_dir_path / "MERGE_HEAD").exists():
        result.error = "Hay un merge en curso en el repositorio"
        return result
    if (git_dir_path / "CHERRY_PICK_HEAD").exists():
        result.error = "Hay un cherry-pick en curso en el repositorio"
        return result
    if (git_dir_path / "rebase-merge").exists() or (git_dir_path / "rebase-apply").exists():
        result.error = "Hay un rebase en curso en el repositorio"
        return result

    return result


def format_env_verified_message(verification: RepoVerification) -> str:
    """Builds the 'ENTORNO VERIFICADO' Telegram message KLEO sends before
    running Claude Code, so the operator sees exactly what was checked."""
    status_label = verification.status.strip() or "limpio"
    return (
        "ENTORNO VERIFICADO\n"
        f"Proyecto: {verification.project}\n"
        f"Ruta configurada: {verification.configured_path}\n"
        f"Raíz Git: {verification.git_root}\n"
        f"Remote origin: {verification.remote_url or '(sin remote)'}\n"
        f"Rama: {verification.branch or '(detached HEAD)'}\n"
        f"HEAD inicial: {verification.head}\n"
        f"Estado inicial: {status_label}"
    )
