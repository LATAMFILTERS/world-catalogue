import subprocess

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
    assert result.head
    assert result.status == ""


def test_verify_repository_passes_when_no_remote_is_expected(tmp_path):
    repo = tmp_path / "repo"
    _init_repo(repo)  # no remote configured at all

    result = verify_repository("world", repo)  # no expected_remote given either

    assert result.ok is True
    assert result.remote_url is None


def test_verify_repository_fails_when_path_does_not_exist(tmp_path):
    result = verify_repository("world", tmp_path / "does-not-exist")

    assert result.ok is False
    assert "no existe" in result.error


def test_verify_repository_fails_when_not_a_git_repo(tmp_path):
    plain_dir = tmp_path / "plain"
    plain_dir.mkdir()

    result = verify_repository("world", plain_dir)

    assert result.ok is False
    assert "no es un repositorio Git" in result.error


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


def test_verify_repository_fails_during_merge_in_progress(tmp_path):
    repo = tmp_path / "repo"
    _init_repo(repo)
    (repo / ".git" / "MERGE_HEAD").write_text("deadbeef\n", encoding="utf-8")

    result = verify_repository("world", repo)

    assert result.ok is False
    assert "merge" in result.error.lower()


def test_verify_repository_fails_during_rebase_in_progress(tmp_path):
    repo = tmp_path / "repo"
    _init_repo(repo)
    (repo / ".git" / "rebase-merge").mkdir()

    result = verify_repository("world", repo)

    assert result.ok is False
    assert "rebase" in result.error.lower()


def test_verify_repository_fails_during_cherry_pick_in_progress(tmp_path):
    repo = tmp_path / "repo"
    _init_repo(repo)
    (repo / ".git" / "CHERRY_PICK_HEAD").write_text("deadbeef\n", encoding="utf-8")

    result = verify_repository("world", repo)

    assert result.ok is False
    assert "cherry-pick" in result.error.lower()


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
