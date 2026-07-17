import pytest

from kleo.mcp.filesystem_adapter import FilesystemAdapter
from kleo.mcp.github_adapter import GitHubAdapter
from kleo.mcp.registry import build_adapters
from kleo.security import PathOutsideRegistryError


def test_adapter_disabled_by_default_reports_not_ready():
    adapter = GitHubAdapter(enabled=False, environ={})
    status = adapter.status()
    assert status.enabled is False
    assert status.ready is False


def test_adapter_enabled_but_missing_credentials_is_not_ready():
    adapter = GitHubAdapter(enabled=True, environ={})
    status = adapter.status()
    assert status.enabled is True
    assert status.configured is False
    assert "GITHUB_TOKEN" in status.missing_env_vars


def test_adapter_enabled_with_credentials_is_ready():
    adapter = GitHubAdapter(enabled=True, environ={"GITHUB_TOKEN": "ghp_fake"})
    assert adapter.status().ready is True


def test_disabled_adapter_call_is_refused():
    adapter = GitHubAdapter(enabled=False, environ={})
    with pytest.raises(RuntimeError):
        adapter.call()


def test_build_adapters_respects_config_enabled_map(base_config):
    base_config.mcp.enabled = {"github": True, "gmail": False}
    adapters = build_adapters(base_config, environ={"GITHUB_TOKEN": "x"})
    assert adapters["github"].enabled is True
    assert adapters["gmail"].enabled is False
    assert "filesystem" in adapters


def test_filesystem_adapter_reads_file_inside_registered_project(base_config, project_dirs):
    target = project_dirs["world"] / "note.txt"
    target.write_text("hello", encoding="utf-8")
    adapter = FilesystemAdapter(enabled=True, registry=base_config.projects)
    assert adapter.read_text(target) == "hello"


def test_filesystem_adapter_rejects_path_outside_registry(base_config, tmp_path):
    outside = tmp_path.parent / "outside-file.txt"
    adapter = FilesystemAdapter(enabled=True, registry=base_config.projects)
    with pytest.raises(PathOutsideRegistryError):
        adapter.read_text(outside)
