import subprocess

import pytest

from kleo.executor import (
    ClaudeCodeExecutor,
    ClaudeExecutableNotFound,
    FakeExecutor,
    detect_claude_executable,
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


def test_fake_executor_records_calls_and_returns_simulated_result():
    fake = FakeExecutor()
    result = fake.run("C:\\some\\project", "do something", task_id=99)
    assert result.exit_code == 0
    assert "simulated" in result.stdout.lower()
    assert fake.calls == [("C:\\some\\project", "do something", 99)]
