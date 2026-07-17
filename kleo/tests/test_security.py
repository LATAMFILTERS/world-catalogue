import logging

import pytest

from kleo.config import ProjectRegistry, SecuritySettings
from kleo.security import (
    PathOutsideRegistryError,
    RedactingLogFilter,
    SecretRedactor,
    find_destructive_pattern,
    requires_confirmation,
    validate_path_in_registry,
)


def test_validate_path_in_registry_accepts_path_inside_root(tmp_path):
    project_root = tmp_path / "world"
    project_root.mkdir()
    inner_file = project_root / "sub" / "file.txt"
    inner_file.parent.mkdir()
    inner_file.write_text("hi", encoding="utf-8")

    registry = ProjectRegistry(paths={"world": project_root})
    resolved = validate_path_in_registry(inner_file, registry)
    assert resolved == inner_file.resolve()


def test_validate_path_in_registry_rejects_path_outside_every_root(tmp_path):
    project_root = tmp_path / "world"
    project_root.mkdir()
    outside = tmp_path / "somewhere-else" / "file.txt"
    outside.parent.mkdir()
    outside.write_text("hi", encoding="utf-8")

    registry = ProjectRegistry(paths={"world": project_root})
    with pytest.raises(PathOutsideRegistryError):
        validate_path_in_registry(outside, registry)


@pytest.mark.parametrize(
    "text",
    [
        "please run rm -rf /var/data",
        "Remove-Item -Recurse -Force C:\\data",
        "git reset --hard origin/main",
        "git clean -fdx",
        "DROP DATABASE production",
        "del /s /q C:\\temp",
    ],
)
def test_find_destructive_pattern_matches_known_dangerous_commands(text):
    security = SecuritySettings()
    assert find_destructive_pattern(text, security) is not None


def test_find_destructive_pattern_ignores_safe_text():
    security = SecuritySettings()
    assert find_destructive_pattern("update the README and run the tests", security) is None


def test_requires_confirmation_respects_require_confirmation_flag():
    security = SecuritySettings(require_confirmation=False)
    assert requires_confirmation("git reset --hard", security) is None


def test_secret_redactor_removes_registered_secret_value():
    redactor = SecretRedactor(secrets=("super-secret-token",))
    out = redactor.redact("the token is super-secret-token, keep it safe")
    assert "super-secret-token" not in out
    assert "[REDACTED]" in out


def test_secret_redactor_removes_telegram_token_shaped_strings():
    redactor = SecretRedactor()
    text = "token=123456789:AAHhqTGwHz-6DAvxx8XxaR2Bcd3Ef4GhIjK a message"
    out = redactor.redact(text)
    assert "123456789:AAHhqTGwHz" not in out


def test_redacting_log_filter_strips_token_before_it_reaches_the_handler(caplog):
    token = "super-secret-token-value"
    logger = logging.getLogger("kleo.test.redaction")
    logger.addFilter(RedactingLogFilter(SecretRedactor(secrets=(token,))))
    with caplog.at_level(logging.INFO, logger="kleo.test.redaction"):
        logger.info("token is %s", token)
    assert token not in caplog.text
    assert "[REDACTED]" in caplog.text
