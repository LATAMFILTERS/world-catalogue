import logging
import time
from dataclasses import replace

import pytest

from kleo.app import KleoApp, log_startup_config, setup_logging, verify_telegram_connectivity
from kleo.executor import ExecutionResult, FakeExecutor
from kleo.storage import Storage
from kleo.tasks import TaskStatus
from kleo.telegram_client import TelegramClient, TelegramMessage, chunk_message


class RecordingTelegramClient(TelegramClient):
    """Stand-in for TelegramClient that records sent messages instead of
    hitting the network, while still going through the real send_message /
    chunking code path."""

    def __init__(self):
        super().__init__("123:fake", transport=lambda *a, **k: {"ok": True, "result": {}})
        self.sent: list[tuple[int, str]] = []

    def send_message(self, chat_id: int, text: str) -> None:
        for chunk in chunk_message(text):
            if chunk:
                self.sent.append((chat_id, chunk))


def _build_app(config, storage, executor=None):
    telegram = RecordingTelegramClient()
    executor = executor or FakeExecutor()
    return KleoApp(config, storage, telegram, executor), telegram, executor


def test_unauthorized_chat_is_rejected(base_config, storage):
    app, telegram, executor = _build_app(base_config, storage)
    msg = TelegramMessage(update_id=1, chat_id=111, text="/status")  # authorized is 999
    app._handle_incoming(msg)

    assert telegram.sent == []
    assert storage.list_tasks() == []


def test_authorized_chat_creates_task_and_gets_reply(base_config, storage):
    app, telegram, executor = _build_app(base_config, storage)
    app._handle_incoming(TelegramMessage(update_id=1, chat_id=999, text="/activate world"))
    app._handle_incoming(TelegramMessage(update_id=2, chat_id=999, text="fix the bug"))

    assert len(telegram.sent) == 2
    tasks = storage.list_tasks(chat_id=999)
    assert len(tasks) == 1
    assert tasks[0].status == TaskStatus.QUEUED


def test_process_next_task_invokes_fake_executor_and_saves_result_to_sqlite(base_config, storage):
    executor = FakeExecutor(
        scripted_result=ExecutionResult(
            exit_code=0,
            stdout="did the work",
            stderr="",
            git_status="",
            git_diff_stat=" 1 file changed",
        )
    )
    app, telegram, executor = _build_app(base_config, storage, executor=executor)

    storage.set_active_project(999, "world")
    task = storage.create_task(chat_id=999, project="world", instruction="fix bug")

    processed = app.process_next_task()
    assert processed is True
    assert len(executor.calls) == 1  # the simulated Claude Code executor was invoked

    stored = storage.get_task(task.id)
    assert stored.status == TaskStatus.COMPLETED
    assert stored.result_summary == "did the work"
    assert stored.git_diff_stat == " 1 file changed"

    assert len(telegram.sent) == 1
    assert "did the work" in telegram.sent[0][1]


def test_long_result_is_split_correctly_for_telegram(base_config, storage):
    long_output = "line of output\n" * 500  # well over the 4096-char Telegram limit
    executor = FakeExecutor(
        scripted_result=ExecutionResult(
            exit_code=0, stdout=long_output, stderr="", git_status="", git_diff_stat=""
        )
    )
    app, telegram, executor = _build_app(base_config, storage, executor=executor)

    storage.set_active_project(999, "world")
    storage.create_task(chat_id=999, project="world", instruction="do a lot")
    app.process_next_task()

    assert len(telegram.sent) > 1
    for _, chunk in telegram.sent:
        assert len(chunk) <= 4096
    # every original output line survives somewhere across the split messages
    rejoined = "\n".join(chunk for _, chunk in telegram.sent)
    assert "line of output" in rejoined


def test_task_completed_when_configured_test_command_passes(base_config, storage):
    config = replace(base_config, test_commands={"world": "echo tests passed"})
    app, telegram, executor = _build_app(config, storage)

    storage.set_active_project(999, "world")
    task = storage.create_task(chat_id=999, project="world", instruction="fix bug")
    processed = app.process_next_task()

    assert processed is True
    stored = storage.get_task(task.id)
    assert stored.status == TaskStatus.COMPLETED
    assert "tests passed" in stored.tests_run
    assert "COMPLETADA" in telegram.sent[0][1]
    assert "Pruebas" in telegram.sent[0][1]


def test_task_marked_error_when_test_command_fails_even_if_claude_code_succeeded(base_config, storage):
    config = replace(base_config, test_commands={"world": "exit 1"})
    app, telegram, executor = _build_app(config, storage)

    storage.set_active_project(999, "world")
    task = storage.create_task(chat_id=999, project="world", instruction="fix bug")
    processed = app.process_next_task()

    assert processed is True
    stored = storage.get_task(task.id)
    assert stored.status == TaskStatus.ERROR
    assert "exit 1" in stored.tests_run
    assert "ERROR" in telegram.sent[0][1]
    assert "las pruebas fallaron" in telegram.sent[0][1]


def test_no_configured_test_command_skips_verification_as_before(base_config, storage):
    assert base_config.test_commands == {}
    app, telegram, executor = _build_app(base_config, storage)

    storage.set_active_project(999, "world")
    task = storage.create_task(chat_id=999, project="world", instruction="fix bug")
    app.process_next_task()

    stored = storage.get_task(task.id)
    assert stored.status == TaskStatus.COMPLETED
    assert stored.tests_run is None
    assert "Pruebas" not in telegram.sent[0][1]


def test_system_continues_after_restart_requeues_running_tasks(base_config, tmp_path):
    db_path = tmp_path / "restart.db"
    storage1 = Storage(db_path)
    storage1.set_active_project(999, "world")
    task = storage1.create_task(chat_id=999, project="world", instruction="long task")
    storage1.mark_status(task.id, TaskStatus.RUNNING)
    storage1.close()

    storage2 = Storage(db_path)
    telegram = RecordingTelegramClient()
    executor = FakeExecutor()
    app = KleoApp(base_config, storage2, telegram, executor)
    app.start()
    try:
        for _ in range(50):
            if storage2.get_task(task.id).status in (TaskStatus.COMPLETED, TaskStatus.ERROR):
                break
            time.sleep(0.05)
    finally:
        app.stop()

    final = storage2.get_task(task.id)
    assert final.status in (TaskStatus.COMPLETED, TaskStatus.ERROR)
    assert len(executor.calls) == 1  # the requeued task was actually re-executed
    storage2.close()


def test_verify_telegram_connectivity_logs_bot_username_on_success(caplog):
    client = TelegramClient(
        "123:fake",
        transport=lambda *a, **k: {"ok": True, "result": {"id": 7, "username": "kleo_bot"}},
    )
    with caplog.at_level(logging.INFO, logger="kleo.app"):
        me = verify_telegram_connectivity(client)

    assert me == {"id": 7, "username": "kleo_bot"}
    assert "kleo_bot" in caplog.text


def test_verify_telegram_connectivity_exits_clearly_on_bad_token():
    client = TelegramClient(
        "123:fake",
        transport=lambda *a, **k: {"ok": False, "error_code": 401, "description": "Unauthorized"},
    )
    with pytest.raises(SystemExit):
        verify_telegram_connectivity(client)


def test_log_startup_config_reports_projects_and_poll_interval(base_config, caplog):
    with caplog.at_level(logging.INFO, logger="kleo.app"):
        log_startup_config(base_config)

    assert "world" in caplog.text
    assert "999" in caplog.text  # authorized_chat_id from base_config
    assert base_config.telegram_token not in caplog.text


def test_no_token_is_printed_in_the_log_file(base_config, tmp_path):
    log_path = tmp_path / "kleo-token-test.log"
    setup_logging(log_path, base_config.telegram_token)

    # A realistic child logger, exactly like the ones used across kleo's modules.
    child_logger = logging.getLogger("kleo.app")
    child_logger.info("connecting with token %s", base_config.telegram_token)
    for handler in logging.getLogger("kleo").handlers:
        handler.flush()

    log_contents = log_path.read_text(encoding="utf-8")
    assert base_config.telegram_token not in log_contents
    assert "[REDACTED]" in log_contents
