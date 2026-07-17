from kleo.commands import handle_message
from kleo.tasks import TaskStatus

CHAT_ID = 999


def test_activate_world_changes_active_project(base_config, storage):
    result = handle_message("/activate world", CHAT_ID, base_config, storage)
    assert "world" in result.reply
    assert storage.get_active_project(CHAT_ID) == "world"


def test_activate_phoenix_changes_active_project(base_config, storage):
    result = handle_message("/activate phoenix", CHAT_ID, base_config, storage)
    assert "phoenix" in result.reply
    assert storage.get_active_project(CHAT_ID) == "phoenix"


def test_project_alias_behaves_like_activate(base_config, storage):
    handle_message("/project world", CHAT_ID, base_config, storage)
    assert storage.get_active_project(CHAT_ID) == "world"


def test_activate_unknown_project_is_rejected(base_config, storage):
    result = handle_message("/activate not-a-real-project", CHAT_ID, base_config, storage)
    assert "desconocido" in result.reply.lower()
    assert storage.get_active_project(CHAT_ID) is None


def test_plain_message_without_active_project_is_rejected(base_config, storage):
    result = handle_message("please fix the bug", CHAT_ID, base_config, storage)
    assert result.task_created is None
    assert "proyecto activo" in result.reply.lower()


def test_plain_message_creates_a_queued_task(base_config, storage):
    handle_message("/activate world", CHAT_ID, base_config, storage)
    result = handle_message("please fix the bug", CHAT_ID, base_config, storage)

    assert result.task_created is not None
    assert result.task_created.status == TaskStatus.QUEUED
    assert result.task_created.project == "world"

    stored = storage.get_task(result.task_created.id)
    assert stored.instruction == "please fix the bug"


def test_destructive_instruction_is_blocked_until_confirmed(base_config, storage):
    handle_message("/activate world", CHAT_ID, base_config, storage)
    result = handle_message("please run git reset --hard", CHAT_ID, base_config, storage)

    assert result.task_created.status == TaskStatus.BLOCKED
    assert "/confirm" in result.reply

    confirm_result = handle_message(
        f"/confirm {result.task_created.id}", CHAT_ID, base_config, storage
    )
    confirmed_task = storage.get_task(result.task_created.id)
    assert confirmed_task.status == TaskStatus.QUEUED
    assert "confirmada" in confirm_result.reply.lower()


def test_status_command_reports_active_project_and_counts(base_config, storage):
    handle_message("/activate world", CHAT_ID, base_config, storage)
    handle_message("do task one", CHAT_ID, base_config, storage)
    result = handle_message("/status", CHAT_ID, base_config, storage)
    assert "world" in result.reply
    assert "1" in result.reply


def test_tasks_command_lists_recent_tasks(base_config, storage):
    handle_message("/activate world", CHAT_ID, base_config, storage)
    handle_message("do task one", CHAT_ID, base_config, storage)
    result = handle_message("/tasks", CHAT_ID, base_config, storage)
    assert "do task one" in result.reply


def test_cancel_unknown_task_reports_not_found(base_config, storage):
    result = handle_message("/cancel 9999", CHAT_ID, base_config, storage)
    assert "no existe" in result.reply.lower()


def test_cancel_queued_task_marks_cancelled_and_signals_app(base_config, storage):
    handle_message("/activate world", CHAT_ID, base_config, storage)
    create_result = handle_message("do task one", CHAT_ID, base_config, storage)
    task_id = create_result.task_created.id

    cancel_result = handle_message(f"/cancel {task_id}", CHAT_ID, base_config, storage)
    assert cancel_result.cancelled_task_id == task_id
    assert storage.get_task(task_id).status == TaskStatus.CANCELLED


def test_projects_command_lists_all_registered_projects(base_config, storage):
    result = handle_message("/projects", CHAT_ID, base_config, storage)
    for key in ("world", "phoenix", "marketing", "commercial", "mcp", "kleo", "elimfilters"):
        assert key in result.reply


def test_unknown_command_returns_helpful_message(base_config, storage):
    result = handle_message("/not-a-real-command", CHAT_ID, base_config, storage)
    assert "desconocido" in result.reply.lower()
