"""KLEO main application: wires Telegram long-polling, the persistent task
queue, and the Claude Code executor together.

Entry point: ``python -m kleo.app`` (see kleo/scripts/start-kleo.ps1).
"""

from __future__ import annotations

import logging
import logging.handlers
import sys
import threading
import time
from pathlib import Path

from kleo.commands import handle_message
from kleo.config import Config, load_config
from kleo.executor import AgentExecutor, ExecutionResult, TestResult, build_executor, run_test_command
from kleo.repo_guard import format_env_verified_message, verify_repository
from kleo.security import SecretRedactor, install_redaction
from kleo.storage import Storage
from kleo.tasks import Task, TaskStatus, utcnow_iso
from kleo.telegram_client import TelegramApiError, TelegramClient, TelegramMessage

logger = logging.getLogger("kleo.app")


def setup_logging(log_path: Path, token: str | None) -> None:
    """Configures UTF-8 file + console logging and installs a filter that
    strips the bot token (and any Telegram-token-shaped string) from every
    log record before it is written."""
    log_path.parent.mkdir(parents=True, exist_ok=True)
    root = logging.getLogger("kleo")
    root.setLevel(logging.INFO)
    formatter = logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")

    file_handler = logging.handlers.RotatingFileHandler(
        str(log_path), maxBytes=5_000_000, backupCount=3, encoding="utf-8"
    )
    file_handler.setFormatter(formatter)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    root.addHandler(file_handler)
    root.addHandler(console_handler)

    redactor = SecretRedactor(secrets=(token,) if token else ())
    install_redaction(root, redactor)


def log_startup_config(config: Config) -> None:
    """Logs a one-line summary of the loaded configuration so an operator
    checking the log after startup can see what KLEO picked up, without
    exposing the token itself."""
    logger.info(
        "Config loaded: projects=%s poll_interval=%.1fs claude_path=%s "
        "authorized_chat_id=%s",
        config.projects.keys(),
        config.poll_interval_seconds,
        config.claude_path,
        config.authorized_chat_id if config.authorized_chat_id is not None else "(unrestricted)",
    )


def verify_telegram_connectivity(telegram: TelegramClient) -> dict:
    """Confirms the bot token is valid and Telegram is reachable before KLEO
    starts polling. Raises SystemExit with a clear message on failure instead
    of letting the poll loop retry silently forever."""
    try:
        me = telegram.get_me()
    except TelegramApiError as exc:
        raise SystemExit(
            f"No se pudo conectar con Telegram (revisa TELEGRAM_BOT_TOKEN): {exc}"
        ) from exc
    logger.info("Connected to Telegram as @%s (id=%s)", me.get("username", "?"), me.get("id"))
    return me


def format_result_message(
    task: Task, result: ExecutionResult, test_result: TestResult | None = None
) -> str:
    """Builds the Telegram reply for a finished task: real stdout/stderr,
    exit code, test results, and git status/diff --stat — never a fabricated
    summary. A task only reads as COMPLETADA if Claude Code exited 0, the
    project's configured test command (if any) also passed, *and* Git
    actually detected a change in the repository (``repository_changed``,
    computed from a before/after fingerprint — an exit code of 0 alone does
    not prove anything happened)."""
    lines = [f"Tarea #{task.id} — proyecto: {task.project}"]
    if result.cancelled:
        lines.append("Estado: CANCELADA")
    elif result.timed_out:
        lines.append("Estado: TIMEOUT")
    elif result.exit_code != 0:
        lines.append(f"Estado: ERROR (exit code {result.exit_code})")
    elif test_result is not None and not test_result.passed:
        if test_result.timed_out:
            lines.append("Estado: ERROR (las pruebas no terminaron a tiempo)")
        else:
            lines.append(f"Estado: ERROR (las pruebas fallaron, exit code {test_result.exit_code})")
    elif not result.repository_changed:
        lines.append("Estado: EJECUTADA — SIN CAMBIOS VERIFICABLES EN EL REPOSITORIO")
    else:
        lines.append("Estado: COMPLETADA")

    lines.append("\nSalida del agente (NO constituye evidencia por sí sola):")
    lines.append(result.stdout.strip() or "(sin salida)")

    if result.exit_code == 0 and not result.repository_changed:
        lines.append(
            "\nVerificación KLEO: el proceso terminó con exit code 0, pero Git no detectó "
            "ningún cambio producido durante esta tarea. No se certifica como completada."
        )

    if result.stderr.strip():
        lines.append("\nErrores (stderr):")
        lines.append(result.stderr.strip())

    if test_result is not None:
        status = "(timeout)" if test_result.timed_out else f"exit code {test_result.exit_code}"
        lines.append(f"\nPruebas ({status}):")
        combined = f"{test_result.stdout}\n{test_result.stderr}".strip()
        lines.append(combined or "(sin salida)")

    lines.append("\nEstado Git actual:")
    lines.append(result.git_status or "(sin cambios)")

    lines.append("\nDiferencias Git actuales (--stat):")
    lines.append(result.git_diff_stat or "(sin cambios)")

    return "\n".join(lines)


class KleoApp:
    def __init__(
        self,
        config: Config,
        storage: Storage,
        telegram: TelegramClient,
        executor: AgentExecutor,
    ):
        self.config = config
        self.storage = storage
        self.telegram = telegram
        self.executor = executor
        self._offset: int | None = None
        self._stop = threading.Event()
        self._worker_thread: threading.Thread | None = None

    # -- lifecycle ---------------------------------------------------------

    def start(self) -> None:
        requeued = self.storage.requeue_interrupted_tasks()
        if requeued:
            logger.info(
                "Requeued %d interrupted task(s) left 'running' from a previous run: %s",
                len(requeued),
                requeued,
            )
        self._worker_thread = threading.Thread(
            target=self._worker_loop, daemon=True, name="kleo-worker"
        )
        self._worker_thread.start()

    def stop(self) -> None:
        self._stop.set()
        if self._worker_thread:
            self._worker_thread.join(timeout=10)

    # -- telegram polling ----------------------------------------------------

    def poll_once(self) -> None:
        messages = self.telegram.get_updates(offset=self._offset, poll_timeout=25)
        for msg in messages:
            self._offset = msg.update_id + 1
            self._handle_incoming(msg)

    def run_forever(self) -> None:
        self.start()
        try:
            while not self._stop.is_set():
                try:
                    self.poll_once()
                except Exception:
                    logger.exception("Error polling Telegram; retrying shortly")
                    time.sleep(min(self.config.poll_interval_seconds, 5))
        finally:
            self.stop()

    def _handle_incoming(self, msg: TelegramMessage) -> None:
        if not msg.chat_id or not msg.text:
            return
        if (
            self.config.authorized_chat_id is not None
            and msg.chat_id != self.config.authorized_chat_id
        ):
            logger.warning("Rejected message from unauthorized chat_id=%s", msg.chat_id)
            return
        result = handle_message(msg.text, msg.chat_id, self.config, self.storage)
        if result.reply:
            self.telegram.send_message(msg.chat_id, result.reply)
        if result.cancelled_task_id is not None:
            self.executor.cancel(result.cancelled_task_id)

    # -- task queue worker -------------------------------------------------

    def _worker_loop(self) -> None:
        while not self._stop.is_set():
            processed = self.process_next_task()
            if not processed:
                time.sleep(self.config.poll_interval_seconds)

    def process_next_task(self) -> bool:
        """Pop and run the oldest queued task, if any. Returns True if a
        task was processed (so the caller can loop again immediately)."""
        task = self.storage.next_queued_task()
        if task is None:
            return False

        project_path = self.config.projects.resolve(task.project)
        if project_path is None:
            self.storage.mark_status(
                task.id,
                TaskStatus.ERROR,
                error=f"El proyecto '{task.project}' no está configurado.",
                finished_at=utcnow_iso(),
            )
            self.telegram.send_message(
                task.chat_id,
                f"Tarea #{task.id} error: el proyecto '{task.project}' no está configurado.",
            )
            return True

        verification = verify_repository(
            task.project, project_path, self.config.expected_remotes.get(task.project)
        )
        if not verification.ok:
            logger.warning(
                "Repo verification failed for task #%s (project=%s): %s",
                task.id, task.project, verification.error,
            )
            self.storage.mark_status(
                task.id,
                TaskStatus.ERROR,
                started_at=utcnow_iso(),
                finished_at=utcnow_iso(),
                error=verification.error,
                env_verified=f"VERIFICACIÓN FALLIDA: {verification.error}",
            )
            self.telegram.send_message(
                task.chat_id, f"Tarea #{task.id} bloqueada antes de ejecutar — {verification.error}"
            )
            return True

        env_message = format_env_verified_message(verification)
        self.storage.mark_status(
            task.id, TaskStatus.RUNNING, started_at=utcnow_iso(), env_verified=env_message
        )
        self.telegram.send_message(task.chat_id, env_message)

        try:
            result = self.executor.run(project_path, task.instruction, task_id=task.id)
        except Exception as exc:  # executor/subprocess failure, not fabricated
            logger.exception("Executor failed for task #%s", task.id)
            self.storage.mark_status(
                task.id, TaskStatus.ERROR, error=str(exc), finished_at=utcnow_iso()
            )
            self.telegram.send_message(task.chat_id, f"Tarea #{task.id} error: {exc}")
            return True

        test_result: TestResult | None = None
        tests_run_summary: str | None = None
        if not result.cancelled and not result.timed_out and result.exit_code == 0:
            test_command = self.config.test_commands.get(task.project)
            if test_command:
                test_result = run_test_command(
                    test_command, project_path, timeout_seconds=self.config.test_timeout_seconds
                )
                status = "TIMEOUT" if test_result.timed_out else f"exit code {test_result.exit_code}"
                output = f"{test_result.stdout}\n{test_result.stderr}".strip()
                tests_run_summary = f"$ {test_command}\n{status}\n{output}"[:4000]

        if result.cancelled:
            final_status = TaskStatus.CANCELLED
        elif result.exit_code == 0 and not result.timed_out and (test_result is None or test_result.passed):
            final_status = TaskStatus.COMPLETED
        else:
            final_status = TaskStatus.ERROR

        self.storage.mark_status(
            task.id,
            final_status,
            finished_at=utcnow_iso(),
            result_summary=(result.stdout or "")[:4000],
            error=(result.stderr or "")[:4000] or None,
            exit_code=result.exit_code,
            git_status=(result.git_status or "")[:4000],
            git_diff_stat=(result.git_diff_stat or "")[:4000],
            tests_run=tests_run_summary,
        )
        updated_task = self.storage.get_task(task.id)
        self.telegram.send_message(
            task.chat_id, format_result_message(updated_task, result, test_result)
        )
        return True


def build_app(config_path: str | None = None, env_path: str | None = None) -> KleoApp:
    config = load_config(config_path=config_path, env_path=env_path)
    if not config.telegram_token:
        raise SystemExit(
            "TELEGRAM_BOT_TOKEN no está configurado (env o .env). Ver .env.example."
        )
    setup_logging(config.log_path, config.telegram_token)
    log_startup_config(config)
    storage = Storage(config.db_path)
    telegram = TelegramClient(config.telegram_token)
    verify_telegram_connectivity(telegram)
    executor = build_executor(config)
    return KleoApp(config, storage, telegram, executor)


def main() -> None:
    app = build_app()
    logger.info("KLEO ready: listening for Telegram messages")
    try:
        app.run_forever()
    except KeyboardInterrupt:
        logger.info("KLEO stopping (KeyboardInterrupt)")
        app.stop()


if __name__ == "__main__":
    main()
