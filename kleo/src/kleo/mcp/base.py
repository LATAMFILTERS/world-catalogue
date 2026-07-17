"""Base interface every MCP adapter implements.

An adapter is a thin, config-driven descriptor: it knows which environment
variables it needs and whether it is enabled, and it reports its own
readiness. It intentionally does not embed any credential value — those are
only ever read from the process environment at call time, never stored on
the adapter instance or written to disk.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field


@dataclass
class AdapterStatus:
    name: str
    enabled: bool
    configured: bool
    missing_env_vars: list[str] = field(default_factory=list)

    @property
    def ready(self) -> bool:
        return self.enabled and self.configured


class MCPAdapter:
    """Base class for a modular MCP integration adapter."""

    name: str = "base"
    required_env_vars: tuple[str, ...] = ()

    def __init__(self, enabled: bool, environ: dict | None = None):
        self.enabled = enabled
        self._environ = os.environ if environ is None else environ

    def missing_env_vars(self) -> list[str]:
        return [var for var in self.required_env_vars if not self._environ.get(var)]

    def status(self) -> AdapterStatus:
        missing = self.missing_env_vars()
        return AdapterStatus(
            name=self.name,
            enabled=self.enabled,
            configured=len(missing) == 0,
            missing_env_vars=missing,
        )

    def describe(self) -> str:
        st = self.status()
        if not st.enabled:
            return f"{self.name}: disabled"
        if not st.configured:
            return f"{self.name}: enabled but not configured (missing: {', '.join(st.missing_env_vars)})"
        return f"{self.name}: enabled and configured"

    def call(self, *args, **kwargs):
        """Invoke the underlying integration. Base implementation refuses to
        run unless the adapter is enabled and fully configured, and never
        fabricates a result."""
        st = self.status()
        if not st.enabled:
            raise RuntimeError(f"MCP adapter '{self.name}' is disabled in config.json")
        if not st.configured:
            raise RuntimeError(
                f"MCP adapter '{self.name}' is missing required environment "
                f"variables: {', '.join(st.missing_env_vars)}"
            )
        raise NotImplementedError(
            f"MCP adapter '{self.name}' has no call implementation wired up yet"
        )
