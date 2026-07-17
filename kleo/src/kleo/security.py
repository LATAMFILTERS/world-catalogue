"""Security layer: path containment, destructive-command blocking, and
secret redaction. Nothing here talks to Telegram or Claude Code directly —
it is pure validation logic so it stays easy to unit test.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from pathlib import Path

from kleo.config import ProjectRegistry, SecuritySettings


class PathOutsideRegistryError(PermissionError):
    """Raised when a path resolves outside every registered project root."""


class DestructiveActionBlocked(PermissionError):
    """Raised when an instruction matches a destructive-command pattern and
    has not been explicitly confirmed."""

    def __init__(self, matched_pattern: str):
        self.matched_pattern = matched_pattern
        super().__init__(
            f"Destructive action blocked (matched pattern: {matched_pattern}); "
            "explicit confirmation required."
        )


def validate_path_in_registry(path: str | Path, registry: ProjectRegistry) -> Path:
    """Resolve *path* and ensure it lives under one of the registered project
    roots. Raises PathOutsideRegistryError otherwise. Used to stop KLEO (or a
    Claude Code instruction acting on its behalf) from touching files outside
    the authorized project directories."""
    candidate = Path(path).resolve()
    for root in registry.paths.values():
        try:
            resolved_root = root.resolve()
        except OSError:
            continue
        if candidate == resolved_root or resolved_root in candidate.parents:
            return candidate
    raise PathOutsideRegistryError(
        f"Path '{candidate}' is not inside any registered project root."
    )


def find_destructive_pattern(text: str, security: SecuritySettings) -> str | None:
    """Return the first destructive pattern matched in *text*, or None."""
    for pattern in security.destructive_patterns:
        if re.search(pattern, text, flags=re.IGNORECASE):
            return pattern
    return None


def requires_confirmation(text: str, security: SecuritySettings) -> str | None:
    """Return the matched pattern if *text* needs explicit confirmation
    before being handed to the executor, else None."""
    if not security.require_confirmation:
        return None
    return find_destructive_pattern(text, security)


# --------------------------------------------------------------------------
# Secret redaction
# --------------------------------------------------------------------------

_TELEGRAM_TOKEN_RE = re.compile(r"\b\d{6,12}:[A-Za-z0-9_-]{30,}\b")


@dataclass
class SecretRedactor:
    """Holds a set of literal secret values to strip from any text before it
    is logged or sent back over Telegram."""

    secrets: tuple[str, ...] = ()

    def redact(self, text: str) -> str:
        if text is None:
            return text
        out = text
        for secret in self.secrets:
            if secret:
                out = out.replace(secret, "[REDACTED]")
        out = _TELEGRAM_TOKEN_RE.sub("[REDACTED_TOKEN]", out)
        return out


class RedactingLogFilter(logging.Filter):
    """A logging.Filter that redacts registered secrets from every record
    before it reaches a handler, so tokens never land in log files."""

    def __init__(self, redactor: SecretRedactor):
        super().__init__()
        self._redactor = redactor

    def filter(self, record: logging.LogRecord) -> bool:
        try:
            record.msg = self._redactor.redact(str(record.getMessage()))
            record.args = ()
        except Exception:  # pragma: no cover - defensive, never hide a log line
            pass
        return True


def install_redaction(logger: logging.Logger, redactor: SecretRedactor) -> None:
    """Attaches redaction to every handler on *logger*, not to the logger
    itself. Logger-level filters only run for records the logger directly
    originates; records from child loggers (e.g. ``kleo.app``,
    ``kleo.commands``) reach this logger's handlers via propagation without
    ever passing through this logger's own filter chain. Handler-level
    filters, by contrast, run for every record that reaches that handler
    regardless of which logger in the hierarchy created it."""
    filt = RedactingLogFilter(redactor)
    for handler in logger.handlers:
        handler.addFilter(filt)
