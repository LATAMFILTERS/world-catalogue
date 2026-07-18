"""Telegram command dispatch. Pure functions of (text, chat_id, config,
storage) -> CommandResult so they're trivial to unit test without a real
Telegram connection."""

from __future__ import annotations

from dataclasses import dataclass

from kleo.config import Config
from kleo.executor import collect_git_summary
from kleo.security import requires_confirmation
from kleo.storage import Storage
from kleo.tasks import Task, TaskStatus

HELP_TEXT = """KLEO — puente Telegram <-> agente de código

Comandos disponibles:
/status - estado general de KLEO y del proyecto activo
/projects - lista de proyectos registrados
/activate <proyecto> - cambia el proyecto activo (alias: /project)
/tasks - últimas tareas y su estado
/gitstatus [proyecto] - git status y git diff --stat del proyecto
/cancel <task_id> - cancela una tarea en cola o en ejecución (si es posible)
/confirm <task_id> - autoriza una tarea bloqueada por contener un patrón destructivo
/help - muestra este mensaje

Cualquier otro mensaje se encola como una tarea para el agente configurado en el
proyecto activo."""


@dataclass
class CommandResult:
    reply: str
    task_created: Task | None = None
    cancelled_task_id: int | None = None


def handle_message(text: str, chat_id: int, config: Config, storage: Storage) -> CommandResult:
    text = (text or "").strip()
    if not text:
        return CommandResult(reply="(mensaje vacío ignorado)")
    if text.startswith("/"):
        return _handle_command(text, chat_id, config, storage)
    return _handle_plain_message(text, chat_id, config, storage)


def _handle_command(text: str, chat_id: int, config: Config, storage: Storage) -> CommandResult:
    parts = text.split(maxsplit=1)
    cmd = parts[0].lower().split("@", 1)[0]  # tolerate "/status@BotName"
    arg = parts[1].strip() if len(parts) > 1 else ""

    if cmd == "/status":
        return _cmd_status(chat_id, config, storage)
    if cmd == "/projects":
        return _cmd_projects(config)
    if cmd in ("/activate", "/project"):
        return _cmd_activate(arg, chat_id, config, storage)
    if cmd == "/tasks":
        return _cmd_tasks(chat_id, storage)
    if cmd == "/gitstatus":
        return _cmd_gitstatus(arg, chat_id, config, storage)
    if cmd == "/cancel":
        return _cmd_cancel(arg, storage)
    if cmd == "/confirm":
        return _cmd_confirm(arg, storage)
    if cmd == "/help":
        return CommandResult(reply=HELP_TEXT)
    return CommandResult(reply=f"Comando desconocido: {cmd}. Usa /help para ver los comandos disponibles.")


def _cmd_status(chat_id: int, config: Config, storage: Storage) -> CommandResult:
    active = storage.get_active_project(chat_id) or "(ninguno)"
    queued = storage.count_by_status(TaskStatus.QUEUED)
    running = storage.count_by_status(TaskStatus.RUNNING)
    blocked = storage.count_by_status(TaskStatus.BLOCKED)
    reply = (
        "KLEO status\n"
        f"Proyecto activo: {active}\n"
        f"Tareas en cola: {queued}\n"
        f"Tareas en ejecución: {running}\n"
        f"Tareas bloqueadas (esperando /confirm): {blocked}\n"
        f"Proyectos registrados: {', '.join(config.projects.keys()) or '(ninguno)'}"
    )
    return CommandResult(reply=reply)


def _cmd_projects(config: Config) -> CommandResult:
    if not config.projects.keys():
        return CommandResult(reply="No hay proyectos registrados en config.json.")
    lines = ["Proyectos registrados:"]
    for key in config.projects.keys():
        path = config.projects.resolve(key)
        exists = "OK" if path and path.is_dir() else "NO ENCONTRADO"
        lines.append(f"- {key}: {path} [{exists}]")
    return CommandResult(reply="\n".join(lines))


def _cmd_activate(arg: str, chat_id: int, config: Config, storage: Storage) -> CommandResult:
    if not arg:
        return CommandResult(reply="Uso: /activate <proyecto> (ver /projects)")
    key = arg.strip().lower()
    if not config.projects.is_known(key):
        return CommandResult(
            reply=f"Proyecto desconocido: '{key}'. Usa /projects para ver la lista de proyectos válidos."
        )
    storage.set_active_project(chat_id, key)
    return CommandResult(reply=f"Proyecto activo cambiado a: {key}")


def _cmd_tasks(chat_id: int, storage: Storage) -> CommandResult:
    tasks = storage.list_tasks(chat_id=chat_id, limit=10)
    if not tasks:
        return CommandResult(reply="No hay tareas registradas todavía.")
    lines = []
    for t in tasks:
        short = t.instruction if len(t.instruction) <= 60 else t.instruction[:57] + "..."
        lines.append(f"#{t.id} [{t.status.value}] ({t.project}) {short}")
    return CommandResult(reply="\n".join(lines))


def _cmd_gitstatus(arg: str, chat_id: int, config: Config, storage: Storage) -> CommandResult:
    key = arg.strip().lower() if arg else (storage.get_active_project(chat_id) or "")
    if not key:
        return CommandResult(reply="No hay proyecto activo. Usa /activate <proyecto> o /gitstatus <proyecto>.")
    if not config.projects.is_known(key):
        return CommandResult(reply=f"Proyecto desconocido: '{key}'.")
    path = config.projects.resolve(key)
    if not path or not path.is_dir():
        return CommandResult(reply=f"La ruta del proyecto '{key}' no existe en disco: {path}")
    status, diff_stat = collect_git_summary(path)
    reply = (
        f"git status ({key}):\n{status or '(sin cambios)'}\n\n"
        f"git diff --stat ({key}):\n{diff_stat or '(sin cambios)'}"
    )
    return CommandResult(reply=reply)


def _cmd_cancel(arg: str, storage: Storage) -> CommandResult:
    if not arg or not arg.isdigit():
        return CommandResult(reply="Uso: /cancel <task_id>")
    task_id = int(arg)
    task = storage.cancel_task(task_id)
    if task is None:
        return CommandResult(reply=f"No existe la tarea #{task_id}")
    if task.status == TaskStatus.CANCELLED:
        return CommandResult(reply=f"Tarea #{task_id} cancelada.", cancelled_task_id=task_id)
    return CommandResult(
        reply=f"Tarea #{task_id} no se pudo cancelar (estado actual: {task.status.value})."
    )


def _cmd_confirm(arg: str, storage: Storage) -> CommandResult:
    if not arg or not arg.isdigit():
        return CommandResult(reply="Uso: /confirm <task_id>")
    task_id = int(arg)
    task = storage.get_task(task_id)
    if task is None:
        return CommandResult(reply=f"No existe la tarea #{task_id}")
    if task.status != TaskStatus.BLOCKED:
        return CommandResult(
            reply=f"La tarea #{task_id} no está pendiente de confirmación (estado: {task.status.value})."
        )
    storage.mark_status(task_id, TaskStatus.QUEUED)
    return CommandResult(reply=f"Tarea #{task_id} confirmada y encolada para ejecución.")


def _handle_plain_message(text: str, chat_id: int, config: Config, storage: Storage) -> CommandResult:
    active = storage.get_active_project(chat_id)
    if not active:
        return CommandResult(
            reply="No hay proyecto activo. Usa /activate <proyecto> primero (ver /projects)."
        )
    if not config.projects.is_known(active):
        return CommandResult(
            reply=f"El proyecto activo '{active}' ya no está registrado. Usa /activate para elegir otro."
        )

    blocked_pattern = requires_confirmation(text, config.security)
    status = TaskStatus.BLOCKED if blocked_pattern else TaskStatus.QUEUED
    task = storage.create_task(chat_id=chat_id, project=active, instruction=text, status=status)

    if blocked_pattern:
        reply = (
            f"Tarea #{task.id} creada pero BLOQUEADA: la instrucción coincide con un patrón "
            f"potencialmente destructivo ({blocked_pattern}). Responde /confirm {task.id} "
            "para autorizarla explícitamente."
        )
    else:
        reply = f"Tarea #{task.id} encolada para el proyecto '{active}'."
    return CommandResult(reply=reply, task_created=task)
