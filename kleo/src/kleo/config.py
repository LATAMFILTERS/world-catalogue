"""Configuration and project registry loading for KLEO.

Secrets (the Telegram bot token, the authorized chat id) are only ever read
from environment variables or a local, git-ignored ``.env`` file — never from
``config.json``, which is safe to commit.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from pathlib import Path

KNOWN_PROJECT_KEYS = (
    "world",
    "phoenix",
    "marketing",
    "commercial",
    "mcp",
    "kleo",
    "elimfilters",
)


class ConfigError(ValueError):
    """Raised when configuration is missing or invalid."""


def load_dotenv(path: Path, environ: dict) -> None:
    """Minimal .env loader: KEY=VALUE per line, '#' comments, no expansion.

    Only fills keys not already present in *environ* so real process
    environment variables always take precedence over the file.
    """
    if not path.is_file():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in environ:
            environ[key] = value


@dataclass
class ProjectRegistry:
    """Maps project keys (world, phoenix, ...) to local filesystem roots."""

    paths: dict[str, Path] = field(default_factory=dict)

    @classmethod
    def from_config(cls, projects_cfg: dict, environ: dict) -> "ProjectRegistry":
        paths: dict[str, Path] = {}
        for key in KNOWN_PROJECT_KEYS:
            env_key = f"KLEO_PROJECT_{key.upper()}"
            raw = environ.get(env_key) or projects_cfg.get(key)
            if raw:
                paths[key] = Path(raw)
        # Allow custom, non-standard project keys defined only in config.json.
        for key, raw in projects_cfg.items():
            if key not in paths and raw:
                paths[key] = Path(raw)
        return cls(paths=paths)

    def keys(self) -> list[str]:
        return sorted(self.paths.keys())

    def resolve(self, key: str) -> Path | None:
        return self.paths.get(key)

    def is_known(self, key: str) -> bool:
        return key in self.paths


@dataclass
class SecuritySettings:
    require_confirmation: bool = True
    destructive_patterns: tuple[str, ...] = (
        r"\brm\s+-rf\b",
        r"\brmdir\b",
        r"\bdel\s+/[sfq]",
        r"\bRemove-Item\b",
        r"\bgit\s+reset\s+--hard\b",
        r"\bgit\s+clean\b",
        r"\bDROP\s+DATABASE\b",
        r"\bformat\s+[a-zA-Z]:\b",
    )

    @classmethod
    def from_config(cls, cfg: dict) -> "SecuritySettings":
        patterns = cfg.get("destructive_patterns")
        kwargs = {}
        if patterns:
            kwargs["destructive_patterns"] = tuple(patterns)
        if "require_confirmation" in cfg:
            kwargs["require_confirmation"] = bool(cfg["require_confirmation"])
        return cls(**kwargs)


@dataclass
class McpAdapterSettings:
    enabled: dict[str, bool] = field(default_factory=dict)

    @classmethod
    def from_config(cls, cfg: dict) -> "McpAdapterSettings":
        return cls(enabled=dict(cfg.get("enabled", {})))

    def is_enabled(self, name: str) -> bool:
        return bool(self.enabled.get(name, False))


@dataclass
class Config:
    telegram_token: str | None
    authorized_chat_id: int | None
    claude_path: str
    db_path: Path
    log_path: Path
    poll_interval_seconds: float
    projects: ProjectRegistry
    security: SecuritySettings
    mcp: McpAdapterSettings
    phoenix_root: Path | None
    claude_extra_args: list[str] = field(default_factory=list)
    claude_timeout_seconds: int = 900


def _load_json(path: Path) -> dict:
    if not path.is_file():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ConfigError(f"Invalid JSON in {path}: {exc}") from exc


def load_config(
    config_path: str | Path | None = None,
    env_path: str | Path | None = None,
    environ: dict | None = None,
) -> Config:
    """Load configuration from config.json + environment/.env.

    ``environ`` defaults to a copy of ``os.environ`` so callers (tests) can
    pass an isolated dict without mutating the real process environment.
    """
    environ = dict(os.environ) if environ is None else environ

    env_file = Path(env_path) if env_path else Path(".env")
    load_dotenv(env_file, environ)

    cfg_file = Path(config_path) if config_path else Path("config.json")
    raw = _load_json(cfg_file)

    projects = ProjectRegistry.from_config(raw.get("projects", {}), environ)
    security = SecuritySettings.from_config(raw.get("security", {}))
    mcp = McpAdapterSettings.from_config(raw.get("mcp", {}))

    token = environ.get("TELEGRAM_BOT_TOKEN") or raw.get("telegram_token") or None
    chat_id_raw = environ.get("TELEGRAM_AUTHORIZED_CHAT_ID") or raw.get(
        "authorized_chat_id"
    )
    authorized_chat_id = int(chat_id_raw) if chat_id_raw not in (None, "") else None

    claude_path = environ.get("CLAUDE_CODE_PATH") or raw.get("claude_path") or "claude"

    db_path = Path(environ.get("KLEO_DB_PATH") or raw.get("db_path") or "./data/kleo.db")
    log_path = Path(
        environ.get("KLEO_LOG_PATH") or raw.get("log_path") or "./data/kleo.log"
    )

    poll_interval = float(
        environ.get("KLEO_POLL_INTERVAL_SECONDS") or raw.get("poll_interval_seconds") or 2.0
    )

    phoenix_root_raw = projects.resolve("phoenix")
    phoenix_root = phoenix_root_raw / "08-EVIDENCE-MANAGEMENT" if phoenix_root_raw else None

    return Config(
        telegram_token=token,
        authorized_chat_id=authorized_chat_id,
        claude_path=claude_path,
        db_path=db_path,
        log_path=log_path,
        poll_interval_seconds=poll_interval,
        projects=projects,
        security=security,
        mcp=mcp,
        phoenix_root=phoenix_root,
        claude_extra_args=list(raw.get("claude_extra_args", [])),
        claude_timeout_seconds=int(
            environ.get("KLEO_CLAUDE_TIMEOUT_SECONDS")
            or raw.get("claude_timeout_seconds")
            or 900
        ),
    )
