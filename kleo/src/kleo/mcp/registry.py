"""Instantiates MCP adapters according to config.json's mcp.enabled map."""

from __future__ import annotations

from kleo.config import Config
from kleo.mcp.base import MCPAdapter
from kleo.mcp.filesystem_adapter import FilesystemAdapter
from kleo.mcp.gcalendar_adapter import GoogleCalendarAdapter
from kleo.mcp.gdrive_adapter import GoogleDriveAdapter
from kleo.mcp.github_adapter import GitHubAdapter
from kleo.mcp.gmail_adapter import GmailAdapter

ADAPTER_CLASSES = {
    "github": GitHubAdapter,
    "gmail": GmailAdapter,
    "gdrive": GoogleDriveAdapter,
    "gcalendar": GoogleCalendarAdapter,
}


def build_adapters(config: Config, environ: dict | None = None) -> dict[str, MCPAdapter]:
    adapters: dict[str, MCPAdapter] = {}
    for key, cls in ADAPTER_CLASSES.items():
        enabled = config.mcp.is_enabled(key)
        adapters[key] = cls(enabled=enabled, environ=environ)
    adapters["filesystem"] = FilesystemAdapter(
        enabled=config.mcp.is_enabled("filesystem"),
        registry=config.projects,
        environ=environ,
    )
    return adapters


def describe_adapters(adapters: dict[str, MCPAdapter]) -> str:
    return "\n".join(a.describe() for a in adapters.values())
