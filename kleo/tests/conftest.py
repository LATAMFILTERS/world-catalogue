import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

import pytest

from kleo.config import Config, McpAdapterSettings, ProjectRegistry, SecuritySettings
from kleo.storage import Storage

FAKE_TOKEN = "123456789:AAFakeTokenForTestsOnlyNotReal1234567890"


def init_git_repo(path: Path) -> None:
    """Real git init + initial commit — the repo verification step needs an
    actual repository (a resolvable HEAD, no merge/rebase in progress), not
    just a directory, so fixtures using this must produce one."""
    path.mkdir(parents=True, exist_ok=True)
    subprocess.run(["git", "init", "-q"], cwd=path, check=True)
    subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=path, check=True)
    subprocess.run(["git", "config", "user.name", "Test"], cwd=path, check=True)
    (path / "README.md").write_text("placeholder\n", encoding="utf-8")
    subprocess.run(["git", "add", "."], cwd=path, check=True)
    subprocess.run(["git", "commit", "-q", "-m", "initial"], cwd=path, check=True)


@pytest.fixture
def project_dirs(tmp_path):
    dirs = {}
    for key in ("world", "phoenix", "marketing", "commercial", "mcp", "kleo", "elimfilters"):
        d = tmp_path / key
        init_git_repo(d)
        dirs[key] = d
    return dirs


@pytest.fixture
def base_config(project_dirs, tmp_path):
    registry = ProjectRegistry(paths=dict(project_dirs))
    return Config(
        telegram_token=FAKE_TOKEN,
        authorized_chat_id=999,
        claude_path="claude",
        db_path=tmp_path / "unused-kleo.db",
        log_path=tmp_path / "unused-kleo.log",
        poll_interval_seconds=0.01,
        projects=registry,
        security=SecuritySettings(),
        mcp=McpAdapterSettings(enabled={"filesystem": True}),
        phoenix_root=project_dirs["phoenix"] / "08-EVIDENCE-MANAGEMENT",
    )


@pytest.fixture
def storage(tmp_path):
    st = Storage(tmp_path / "kleo-test.db")
    yield st
    st.close()
