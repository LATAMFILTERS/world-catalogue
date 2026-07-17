# Comandos de Telegram — KLEO

KLEO solo responde al `chat_id` autorizado configurado en
`TELEGRAM_AUTHORIZED_CHAT_ID`. Cualquier otro chat es ignorado.

## Comandos

| Comando | Descripción |
|---|---|
| `/status` | Estado general: proyecto activo, tareas en cola/ejecución/bloqueadas, proyectos registrados. |
| `/projects` | Lista los proyectos registrados (`world`, `phoenix`, `marketing`, `commercial`, `mcp`, `kleo`, `elimfilters`, o los que definas en `config.json`) y si su ruta existe en disco. |
| `/activate <proyecto>` | Cambia el proyecto activo de este chat. Alias: `/project <proyecto>`. |
| `/project <proyecto>` | Alias de `/activate`. |
| `/tasks` | Muestra las últimas 10 tareas de este chat con su estado. |
| `/gitstatus [proyecto]` | Ejecuta `git status --porcelain` y `git diff --stat` sobre el proyecto indicado (o el activo si se omite). |
| `/cancel <task_id>` | Cancela una tarea en cola o intenta terminar una en ejecución. No siempre es posible cancelar una tarea ya en ejecución avanzada — es "mejor esfuerzo". |
| `/confirm <task_id>` | Autoriza explícitamente una tarea que quedó bloqueada por contener un patrón potencialmente destructivo (ver Seguridad). |
| `/help` | Muestra este resumen de comandos. |

## Mensajes normales

Cualquier mensaje que no empiece con `/` se convierte automáticamente en una
tarea para Claude Code, ejecutada en el directorio del **proyecto activo**
del chat (definido con `/activate`). Si no hay proyecto activo, KLEO
responde pidiendo que actives uno primero.

## Estados de una tarea

- `queued` — en cola, esperando ejecución
- `running` — Claude Code está ejecutándose sobre el proyecto
- `completed` — terminó con código de salida 0
- `error` — terminó con error (código de salida distinto de 0, timeout, o
  falla del propio ejecutor)
- `cancelled` — cancelada por `/cancel`
- `blocked_pending_confirmation` — la instrucción coincidió con un patrón
  destructivo y espera `/confirm <task_id>`

## Respuesta de una tarea completada

Cuando una tarea termina, KLEO responde por Telegram con:
- Estado final
- El stdout real de Claude Code (resumen del trabajo)
- stderr si lo hubo (errores)
- `git status --porcelain` del proyecto
- `git diff --stat` del proyecto

Los mensajes largos se dividen automáticamente en varios mensajes de
Telegram para respetar el límite de 4096 caracteres por mensaje.

## Seguridad

Si una instrucción coincide con un patrón considerado destructivo (por
ejemplo `rm -rf`, `Remove-Item`, `git reset --hard`, `git clean`,
`DROP DATABASE`, `del /s`, `format C:`), la tarea se crea con estado
`blocked_pending_confirmation` y **no se ejecuta** hasta que se responda
`/confirm <task_id>` desde el chat autorizado. KLEO nunca hace `git push`,
despliegues, ni acciones irreversibles por su cuenta.
