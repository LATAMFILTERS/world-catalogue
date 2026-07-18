import subprocess
import sys

import pytest

from kleo.executor import (
    ClaudeCodeExecutor,
    ClaudeExecutableNotFound,
    FakeExecutor,
    build_grounded_instruction,
    detect_claude_executable,
    repository_fingerprint,
    run_test_command,
)


def test_detect_claude_executable_accepts_direct_file_path(tmp_path):
    fake = tmp_path / "fake_claude.cmd"
    fake.write_text("@echo off\r\necho hi\r\n", encoding="utf-8")
    assert detect_claude_executable(str(fake)) == str(fake)


def test_detect_claude_executable_raises_when_not_found():
    with pytest.raises(ClaudeExecutableNotFound):
        detect_claude_executable("definitely-not-a-real-claude-binary-xyz123")


@pytest.fixture
def fake_claude_cmd(tmp_path):
    """A .cmd shim standing in for a real 'claude' install (npm installs the
    real CLI as a .cmd shim on Windows too), so the executor's real
    subprocess/argument-passing code path gets exercised without needing
    Claude Code installed."""
    script = tmp_path / "fake_claude.cmd"
    script.write_text(
        "@echo off\r\n"
        "echo SIMULATED CLAUDE OUTPUT: %*\r\n"
        "exit /b 0\r\n",
        encoding="utf-8",
    )
    return script


def test_claude_code_executor_runs_and_captures_output(tmp_path, fake_claude_cmd):
    project_dir = tmp_path / "project"
    project_dir.mkdir()
    subprocess.run(["git", "init"], cwd=project_dir, capture_output=True)

    executor = ClaudeCodeExecutor(claude_path=str(fake_claude_cmd))
    result = executor.run(project_dir, "do the thing", task_id=1)

    assert result.exit_code == 0
    assert "SIMULATED CLAUDE OUTPUT" in result.stdout
    assert "do the thing" in result.stdout
    assert result.timed_out is False
    assert result.cancelled is False
    # git status/diff --stat were collected (empty repo -> empty strings, not errors)
    assert "git unavailable" not in result.git_status
    assert "git unavailable" not in result.git_diff_stat
    # the fake claude didn't touch the working tree, so no change is claimed
    assert result.repository_changed is False


def test_claude_code_executor_detects_repository_changed_when_files_are_modified(tmp_path):
    project_dir = tmp_path / "project_writer"
    project_dir.mkdir()
    subprocess.run(["git", "init"], cwd=project_dir, capture_output=True)

    script = tmp_path / "fake_claude_writer.cmd"
    script.write_text(
        "@echo off\r\n"
        "echo written by claude > new_file.txt\r\n"
        "exit /b 0\r\n",
        encoding="utf-8",
    )

    executor = ClaudeCodeExecutor(claude_path=str(script))
    result = executor.run(project_dir, "create a file", task_id=4)

    assert result.exit_code == 0
    assert result.repository_changed is True


def test_claude_code_executor_raises_for_missing_project_dir(tmp_path, fake_claude_cmd):
    executor = ClaudeCodeExecutor(claude_path=str(fake_claude_cmd))
    with pytest.raises(FileNotFoundError):
        executor.run(tmp_path / "does-not-exist", "instruction")


def test_claude_code_executor_never_uses_shell_true(monkeypatch, tmp_path, fake_claude_cmd):
    captured = {}
    real_popen = subprocess.Popen

    def spy_popen(args, **kwargs):
        captured["shell"] = kwargs.get("shell", False)
        captured["args"] = args
        return real_popen(args, **kwargs)

    monkeypatch.setattr(subprocess, "Popen", spy_popen)

    project_dir = tmp_path / "project2"
    project_dir.mkdir()
    executor = ClaudeCodeExecutor(claude_path=str(fake_claude_cmd))
    executor.run(project_dir, "instruction; rm -rf /", task_id=2)

    assert captured["shell"] is False
    assert isinstance(captured["args"], list)


def test_run_test_command_reports_success(tmp_path):
    result = run_test_command("echo all good", cwd=tmp_path)
    assert result.exit_code == 0
    assert result.passed is True
    assert "all good" in result.stdout


def test_run_test_command_reports_failure(tmp_path):
    result = run_test_command("exit 1", cwd=tmp_path)
    assert result.exit_code == 1
    assert result.passed is False
    assert result.timed_out is False


def test_run_test_command_reports_timeout(tmp_path):
    python = sys.executable
    result = run_test_command(f'"{python}" -c "import time; time.sleep(5)"', cwd=tmp_path, timeout_seconds=0.2)
    assert result.timed_out is True
    assert result.passed is False


def test_repository_fingerprint_changes_when_tracked_file_is_edited(tmp_path):
    subprocess.run(["git", "init", "-q"], cwd=tmp_path, capture_output=True)
    subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=tmp_path, capture_output=True)
    subprocess.run(["git", "config", "user.name", "Test"], cwd=tmp_path, capture_output=True)
    tracked = tmp_path / "tracked.txt"
    tracked.write_text("original\n", encoding="utf-8")
    subprocess.run(["git", "add", "tracked.txt"], cwd=tmp_path, capture_output=True)
    subprocess.run(["git", "commit", "-q", "-m", "init"], cwd=tmp_path, capture_output=True)

    before = repository_fingerprint(tmp_path)
    tracked.write_text("changed\n", encoding="utf-8")
    after = repository_fingerprint(tmp_path)

    assert before != after


def test_repository_fingerprint_changes_when_untracked_file_is_added(tmp_path):
    subprocess.run(["git", "init", "-q"], cwd=tmp_path, capture_output=True)

    before = repository_fingerprint(tmp_path)
    (tmp_path / "new_file.txt").write_text("hello\n", encoding="utf-8")
    after = repository_fingerprint(tmp_path)

    assert before != after


def test_repository_fingerprint_stable_when_nothing_changes(tmp_path):
    subprocess.run(["git", "init", "-q"], cwd=tmp_path, capture_output=True)
    (tmp_path / "tracked.txt").write_text("stable\n", encoding="utf-8")

    first = repository_fingerprint(tmp_path)
    second = repository_fingerprint(tmp_path)

    assert first == second


def test_build_grounded_instruction_wraps_task_with_evidence_rules():
    wrapped = build_grounded_instruction("fix the login bug")

    assert wrapped.startswith("fix the login bug")
    assert "NO VERIFICADO" in wrapped
    assert "HECHOS VERIFICADOS" in wrapped


def test_fake_executor_records_calls_and_returns_simulated_result():
    fake = FakeExecutor()
    result = fake.run("C:\\some\\project", "do something", task_id=99)
    assert result.exit_code == 0
    assert "simulated" in result.stdout.lower()
    assert fake.calls == [("C:\\some\\project", "do something", 99)]
