import json

from kleo.config import ProjectRegistry, load_config, load_dotenv


def test_load_dotenv_does_not_override_real_environ(tmp_path):
    env_file = tmp_path / ".env"
    env_file.write_text("FOO=from_file\nBAR=also_from_file\n", encoding="utf-8")
    environ = {"FOO": "from_process"}
    load_dotenv(env_file, environ)
    assert environ["FOO"] == "from_process"  # real env wins
    assert environ["BAR"] == "also_from_file"  # file fills in the rest


def test_project_registry_env_override_takes_precedence(tmp_path):
    world_dir = tmp_path / "world-from-config"
    world_env_dir = tmp_path / "world-from-env"
    registry = ProjectRegistry.from_config(
        {"world": str(world_dir)},
        {"KLEO_PROJECT_WORLD": str(world_env_dir)},
    )
    assert registry.resolve("world") == world_env_dir


def test_load_config_full_integration(tmp_path):
    world_dir = tmp_path / "world-catalogue"
    phoenix_dir = tmp_path / "PROJECT-PHOENIX"
    world_dir.mkdir()
    phoenix_dir.mkdir()

    config_path = tmp_path / "config.json"
    config_path.write_text(
        json.dumps(
            {
                "projects": {"world": str(world_dir), "phoenix": str(phoenix_dir)},
                "claude_path": "claude",
                "db_path": "./data/kleo.db",
                "security": {"require_confirmation": True},
                "mcp": {"enabled": {"github": True}},
            }
        ),
        encoding="utf-8",
    )
    env_path = tmp_path / ".env"
    env_path.write_text(
        "TELEGRAM_BOT_TOKEN=123:abc\nTELEGRAM_AUTHORIZED_CHAT_ID=555\n", encoding="utf-8"
    )

    config = load_config(config_path=config_path, env_path=env_path, environ={})

    assert config.telegram_token == "123:abc"
    assert config.authorized_chat_id == 555
    assert config.projects.resolve("world") == world_dir
    assert config.projects.resolve("phoenix") == phoenix_dir
    assert config.security.require_confirmation is True
    assert config.mcp.is_enabled("github") is True
    assert config.mcp.is_enabled("gmail") is False


def test_load_config_missing_token_is_none(tmp_path):
    config = load_config(
        config_path=tmp_path / "does-not-exist.json",
        env_path=tmp_path / "does-not-exist.env",
        environ={},
    )
    assert config.telegram_token is None
    assert config.authorized_chat_id is None
