# Instalación de KLEO (Windows)

KLEO es el puente entre Telegram y Claude Code para las operaciones de
ELIMFILTERS: `Telegram -> KLEO -> Claude Code -> proyecto activo -> respuesta
por Telegram`.

## Requisitos

- Windows 10/11
- PowerShell (viene incluido en Windows)
- Python 3.11 o superior (https://www.python.org/downloads/) — durante la
  instalación de Python, marca "Add python.exe to PATH"
- Git
- [Claude Code](https://docs.claude.com/en/docs/claude-code) instalado y
  accesible en PATH (o con una ruta configurable, ver abajo)
- Un bot de Telegram creado con [@BotFather](https://t.me/BotFather) y tu
  `chat_id` numérico

## 1. Obtener el código

Este módulo vive dentro del repositorio `world-catalogue`, en la carpeta
`kleo/`. Clona o actualiza el repositorio normalmente; no se requiere nada
adicional para obtener el código de KLEO.

## 2. Instalar

Desde PowerShell, dentro de la carpeta `kleo/`:

```powershell
cd kleo
.\scripts\install-kleo.ps1
```

Este script:
- Verifica que Python 3.11+ esté disponible
- Crea un entorno virtual en `kleo\.venv`
- Instala las dependencias (`requirements.txt`) y el propio paquete `kleo`
  en modo editable
- Copia `.env.example` → `.env` (si no existe ya)
- Copia `config/config.example.json` → `config.json` (si no existe ya)
- Crea la carpeta `kleo\data\` para la base de datos SQLite y los logs

No sobreescribe `.env` ni `config.json` si ya existen.

## 3. Configurar secretos (`.env`)

Edita `kleo\.env` (nunca se sube a git — está en `.gitignore`):

```
TELEGRAM_BOT_TOKEN=<token de @BotFather>
TELEGRAM_AUTHORIZED_CHAT_ID=<tu chat_id numérico>
CLAUDE_CODE_PATH=claude
```

Para obtener tu `chat_id`, puedes escribirle a tu bot y consultar
`https://api.telegram.org/bot<TOKEN>/getUpdates` una vez, o usar un bot
auxiliar como @userinfobot.

## 4. Configurar proyectos (`config.json`)

Edita `kleo\config.json` y ajusta las rutas locales de cada área:

```json
{
  "projects": {
    "world": "C:\\Users\\VICTOR ABREU\\Documents\\world-catalogue",
    "phoenix": "C:\\Users\\VICTOR ABREU\\Documents\\PROJECT-PHOENIX",
    "marketing": "C:\\Users\\VICTOR ABREU\\Documents\\ELIMFILTERS-Marketing",
    "commercial": "C:\\Users\\VICTOR ABREU\\Documents\\ELIMFILTERS-Commercial",
    "mcp": "C:\\Users\\VICTOR ABREU\\Documents\\ELIMFILTERS-MCP",
    "kleo": "C:\\Users\\VICTOR ABREU\\Documents\\KleoOS",
    "elimfilters": "C:\\Users\\VICTOR ABREU\\Documents\\elimfilters"
  }
}
```

Cualquier ruta también puede sobreescribirse por variable de entorno
(`KLEO_PROJECT_WORLD`, `KLEO_PROJECT_PHOENIX`, etc.) en `.env`, lo cual tiene
prioridad sobre `config.json`.

El campo `mcp.enabled` en `config.json` controla qué integraciones MCP están
activas (GitHub, Gmail, Google Drive, Google Calendar, filesystem). Todas
empiezan deshabilitadas salvo `filesystem`.

## 5. Iniciar KLEO

```powershell
.\scripts\start-kleo.ps1
```

Esto arranca KLEO como proceso en segundo plano usando el entorno virtual,
guarda su PID en `kleo\kleo.pid`, y escribe logs en `kleo\data\kleo.log`
(rotativo, UTF-8) y `kleo\data\kleo-stdout.log` / `kleo-stderr.log`.

Al iniciar, KLEO valida la configuración cargada y llama a `getMe` de
Telegram para confirmar que el token es válido y la API es alcanzable; si
falla, termina de inmediato con un mensaje claro en vez de reintentar en
silencio. El script `start-kleo.ps1` espera unos segundos y verifica que el
proceso siga vivo — si murió justo al iniciar, imprime las últimas líneas de
`kleo-stderr.log` automáticamente en vez de reportar éxito.

## 6. Detener KLEO

```powershell
.\scripts\stop-kleo.ps1
```

## Reinicio y persistencia

La cola de tareas vive en `kleo\data\kleo.db` (SQLite). Si KLEO se detiene o
falla mientras una tarea está en `running`, al reiniciar esa tarea vuelve
automáticamente a `queued` — ningún trabajo se pierde silenciosamente.

## Ejecutar las pruebas

```powershell
cd kleo
.\.venv\Scripts\python.exe -m pytest
```

Todas las pruebas usan un ejecutor de Claude Code simulado (`FakeExecutor`)
y bases de datos SQLite temporales — no requieren un token de Telegram real
ni una instalación real de Claude Code.

## Notas de seguridad

- `.env` y `config.json` reales nunca deben subirse a git (ya están en
  `.gitignore`).
- KLEO solo responde al `chat_id` configurado en `TELEGRAM_AUTHORIZED_CHAT_ID`;
  cualquier otro chat es ignorado y registrado como no autorizado.
- Ninguna acción destructiva (`rm -rf`, `Remove-Item`, `git reset --hard`,
  `git clean`, `DROP DATABASE`, etc.) se ejecuta sin confirmación explícita
  vía `/confirm <task_id>`.
- KLEO nunca hace `git push`, despliegues, ni borra evidencia de
  PROJECT-PHOENIX por sí mismo.
