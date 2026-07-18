import subprocess

import kleo.repo_guard as repo_guard_module
from kleo.repo_guard import format_env_verified_message, verify_repository

REMOTE = "https://git.example.internal/latamfilters/world-catalogue.git"


def _init_repo(path, remote=None):
    path.mkdir(parents=True, exist_ok=True)
    subprocess.run(["git", "init", "-q"], cwd=path, check=True)
    subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=path, check=True)
    subprocess.run(["git", "config", "user.name", "Test"], cwd=path, check=True)
    (path / "README.md").write_text("placeholder\n", encoding="utf-8")
    subprocess.run(["git", "add", "."], cwd=path, check=True)
    subprocess.run(["git", "commit", "-q", "-m", "initial"], cwd=path, check=True)
    if remote:
        subprocess.run(["git", "remote", "add", "origin", remote], cwd=path, check=True)


def test_verify_repository_passes_for_a_valid_repo_with_matching_remote(tmp_path):
    repo = tmp_path / "repo"
    _init_repo(repo, remote=REMOTE)

    result = verify_repository("world", repo, expected_remote=REMOTE)

    assert result.ok is True
    assert result.error is None
    assert result.git_root is not None
    assert result.remote_url == REMOTE
    assert result.branch
    assert result.head
    assert result.status == ""


def test_verify_repository_fails_when_expected_remote_is_not_configured(tmp_path):
    """expected_remote is mandatory for every executable project — an empty
    or missing entry must block the task, never fall back to skipping the
    remote check."""
    repo = tmp_path / "repo"
    _init_repo(repo, remote=REMOTE)

    result = verify_repository("world", repo, expected_remote=None)

    assert result.ok is False
    assert "expected_remote" in result.error
    assert "obligatorio" in result.error


def test_verify_repository_fails_when_path_does_not_exist(tmp_path):
    result = verify_repository("world", tmp_path / "does-not-exist", expected_remote=REMOTE)

    assert result.ok is False
    assert "no existe" in result.error


def test_verify_repository_fails_when_not_a_git_repo(tmp_path):
    plain_dir = tmp_path / "plain"
    plain_dir.mkdir()

    result = verify_repository("world", plain_dir, expected_remote=REMOTE)

    assert result.ok is False
    assert "no es un repositorio Git" in result.error


def test_verify_repository_fails_when_configured_path_is_a_subdirectory_of_the_repo(tmp_path):
    """The configured path must be the exact Git root, not any subdirectory
    of a valid repository — otherwise KLEO could operate against a narrower
    (or unexpected) scope than what was actually verified."""
    repo = tmp_path / "repo"
    _init_repo(repo, remote=REMOTE)
    subdir = repo / "subdir"
    subdir.mkdir()

    result = verify_repository("world", subdir, expected_remote=REMOTE)

    assert result.ok is False
    assert "no es la raíz del repositorio" in result.error


def test_verify_repository_fails_on_remote_mismatch(tmp_path):
    repo = tmp_path / "repo"
    _init_repo(repo, remote="https://git.example.internal/someone-else/other-repo.git")

    result = verify_repository("world", repo, expected_remote=REMOTE)

    assert result.ok is False
    assert "no coincide" in result.error


def test_verify_repository_fails_when_expected_remote_set_but_no_origin_configured(tmp_path):
    repo = tmp_path / "repo"
    _init_repo(repo)  # no remote at all

    result = verify_repository("world", repo, expected_remote=REMOTE)

    assert result.ok is False
    assert "sin remote" in result.error


def test_verify_repository_fails_on_detached_head(tmp_path):
    repo = tmp_path / "repo"
    _init_repo(repo, remote=REMOTE)
    head_sha = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=repo, capture_output=True, text=True, check=True
    ).stdout.strip()
    subprocess.run(["git", "checkout", "-q", "--detach", head_sha], cwd=repo, check=True)

    result = verify_repository("world", repo, expected_remote=REMOTE)

    assert result.ok is False
    assert "rama" in result.error.lower()


def test_verify_repository_fails_when_git_status_fails(tmp_path, monkeypatch):
    """A git status failure must never be interpreted as 'repository clean' —
    it has to block the task just like any other unverifiable state."""
    repo = tmp_path / "repo"
    _init_repo(repo, remote=REMOTE)
    real_git = repo_guard_module._git

    def fake_git(args, cwd):
        if args[:2] == ["status", "--porcelain"]:
            return False, ""
        return real_git(args, cwd)

    monkeypatch.setattr(repo_guard_module, "_git", fake_git)

    result = verify_repository("world", repo, expected_remote=REMOTE)

    assert result.ok is False
    assert "estado del repositorio" in result.error.lower()


def test_verify_repository_fails_during_merge_in_progress(tmp_path):
    repo = tmp_path / "repo"
    _init_repo(repo, remote=REMOTE)
    (repo / ".git" / "MERGE_HEAD").write_text("deadbeef\n", encoding="utf-8")

    result = verify_repository("world", repo, expected_remote=REMOTE)

    assert result.ok is False
    assert "merge" in result.error.lower()


def test_verify_repository_fails_during_rebase_in_progress(tmp_path):
    repo = tmp_path / "repo"
    _init_repo(repo, remote=REMOTE)
    (repo / ".git" / "rebase-merge").mkdir()

    result = verify_repository("world", repo, expected_remote=REMOTE)

    assert result.ok is False
    assert "rebase" in result.error.lower()


def test_verify_repository_fails_during_cherry_pick_in_progress(tmp_path):
    repo = tmp_path / "repo"
    _init_repo(repo, remote=REMOTE)
    (repo / ".git" / "CHERRY_PICK_HEAD").write_text("deadbeef\n", encoding="utf-8")

    result = verify_repository("world", repo, expected_remote=REMOTE)

    assert result.ok is False
    assert "cherry-pick" in result.error.lower()


def test_verify_repository_passes_with_exact_root_matching_remote_and_valid_branch(tmp_path):
    """The full happy path: exact Git root, matching remote, a real (non-
    detached) branch — execution must be allowed."""
    repo = tmp_path / "repo"
    _init_repo(repo, remote=REMOTE)
    subprocess.run(["git", "checkout", "-q", "-b", "main"], cwd=repo, check=True)

    result = verify_repository("world", repo, expected_remote=REMOTE)

    assert result.ok is True
    assert result.error is None
    assert result.branch == "main"


def test_format_env_verified_message_includes_all_required_fields(tmp_path):
    repo = tmp_path / "repo"
    _init_repo(repo, remote=REMOTE)
    result = verify_repository("world", repo, expected_remote=REMOTE)

    message = format_env_verified_message(result)

    assert message.startswith("ENTORNO VERIFICADO")
    assert "Proyecto: world" in message
    assert f"Ruta configurada: {repo}" in message
    assert f"Raíz Git: {result.git_root}" in message
    assert f"Remote origin: {REMOTE}" in message
    assert f"HEAD inicial: {result.head}" in message
    assert "Estado inicial: limpio" in message
