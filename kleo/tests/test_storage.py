from kleo.storage import Storage
from kleo.tasks import TaskStatus


def test_create_and_get_task_roundtrip(storage):
    task = storage.create_task(chat_id=1, project="world", instruction="do X")
    assert task.id is not None
    assert task.status == TaskStatus.QUEUED

    fetched = storage.get_task(task.id)
    assert fetched.instruction == "do X"
    assert fetched.project == "world"


def test_next_queued_task_returns_oldest_first(storage):
    first = storage.create_task(chat_id=1, project="world", instruction="first")
    storage.create_task(chat_id=1, project="world", instruction="second")

    next_task = storage.next_queued_task()
    assert next_task.id == first.id


def test_mark_status_persists_result_fields(storage):
    task = storage.create_task(chat_id=1, project="world", instruction="do X")
    updated = storage.mark_status(
        task.id,
        TaskStatus.COMPLETED,
        result_summary="all good",
        exit_code=0,
        git_status="",
        git_diff_stat=" 1 file changed",
    )
    assert updated.status == TaskStatus.COMPLETED

    reloaded = storage.get_task(task.id)
    assert reloaded.status == TaskStatus.COMPLETED
    assert reloaded.result_summary == "all good"
    assert reloaded.exit_code == 0
    assert reloaded.git_diff_stat == " 1 file changed"


def test_cancel_task_marks_cancelled(storage):
    task = storage.create_task(chat_id=1, project="world", instruction="do X")
    cancelled = storage.cancel_task(task.id)
    assert cancelled.status == TaskStatus.CANCELLED


def test_cancel_task_is_noop_for_already_finished_task(storage):
    task = storage.create_task(chat_id=1, project="world", instruction="do X")
    storage.mark_status(task.id, TaskStatus.COMPLETED)
    result = storage.cancel_task(task.id)
    assert result.status == TaskStatus.COMPLETED  # unchanged


def test_active_project_defaults_to_none_then_can_be_set(storage):
    assert storage.get_active_project(chat_id=1) is None
    storage.set_active_project(chat_id=1, project="phoenix")
    assert storage.get_active_project(chat_id=1) == "phoenix"


def test_count_by_status(storage):
    storage.create_task(chat_id=1, project="world", instruction="a")
    storage.create_task(chat_id=1, project="world", instruction="b")
    t3 = storage.create_task(chat_id=1, project="world", instruction="c")
    storage.mark_status(t3.id, TaskStatus.RUNNING)

    assert storage.count_by_status(TaskStatus.QUEUED) == 2
    assert storage.count_by_status(TaskStatus.RUNNING) == 1


def test_requeue_interrupted_tasks_after_restart(tmp_path):
    db_path = tmp_path / "restart.db"

    storage1 = Storage(db_path)
    task = storage1.create_task(chat_id=1, project="world", instruction="long running")
    storage1.mark_status(task.id, TaskStatus.RUNNING)
    storage1.close()

    # Simulate a fresh process opening the same DB after a crash/restart.
    storage2 = Storage(db_path)
    requeued_ids = storage2.requeue_interrupted_tasks()
    assert task.id in requeued_ids

    reloaded = storage2.get_task(task.id)
    assert reloaded.status == TaskStatus.QUEUED
    storage2.close()
