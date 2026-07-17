from __future__ import annotations

from pathlib import Path

from kleo.config import ProjectRegistry
from kleo.mcp.base import MCPAdapter
from kleo.security import validate_path_in_registry


class FilesystemAdapter(MCPAdapter):
    """Local filesystem access, scoped to the registered project roots. No
    credentials required, but every path is validated against the project
    registry before any read happens."""

    name = "filesystem"
    required_env_vars = ()

    def __init__(self, enabled: bool, registry: ProjectRegistry, environ: dict | None = None):
        super().__init__(enabled=enabled, environ=environ)
        self.registry = registry

    def read_text(self, path: str | Path) -> str:
        st = self.status()
        if not st.enabled:
            raise RuntimeError("MCP adapter 'filesystem' is disabled in config.json")
        safe_path = validate_path_in_registry(path, self.registry)
        return safe_path.read_text(encoding="utf-8")
