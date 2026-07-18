"""Verifies a project's on-disk repository state before KLEO lets Claude
Code touch it.

Runs before every task: confirms the configured path exists, is a real git
repository, points at the expected remote (when one is configured), and has
no merge/rebase/cherry-pick left mid-flight. A task never reaches Claude
Code unless every check passes — this is deliberately fail-closed.
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
    ``.ok`` is True."""
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

    ok, remote_url = _git(["remote", "get-url", "origin"], root)
    result.remote_url = remote_url if ok and remote_url else None
    if expected_remote:
        if not result.remote_url or _normalize_remote(result.remote_url) != _normalize_remote(expected_remote):
            result.error = (
                f"El remote origin ({result.remote_url or '(sin remote)'}) no coincide "
                f"con el esperado ({expected_remote})"
            )
            return result

    ok, branch = _git(["branch", "--show-current"], root)
    result.branch = branch if ok else ""

    ok, head = _git(["rev-parse", "HEAD"], root)
    if not ok or not head:
        result.error = f"No se pudo determinar HEAD en '{toplevel}'"
        return result
    result.head = head

    ok, status = _git(["status", "--porcelain"], root)
    result.status = status if ok else ""

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
