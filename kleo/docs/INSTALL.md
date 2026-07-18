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

Actualmente `world`, `phoenix`, `marketing`, `commercial`, `mcp`, `kleo` y
`elimfilters` son áreas lógicas del mismo repositorio verificado:
`LATAMFILTERS/world-catalogue`. Por eso todas deben apuntar a la raíz local
exacta de `world-catalogue`; KLEO usa la clave del proyecto para seleccionar
el contexto de trabajo, no para asumir que existe un repositorio separado.

```json
{
  "projects": {
    "world": "C:\\Users\\VICTOR ABREU\\Documents\\world-catalogue",
    "phoenix": "C:\\Users\\VICTOR ABREU\\Documents\\world-catalogue",
    "marketing": "C:\\Users\\VICTOR ABREU\\Documents\\world-catalogue",
    "commercial": "C:\\Users\\VICTOR ABREU\\Documents\\world-catalogue",
    "mcp": "C:\\Users\\VICTOR ABREU\\Documents\\world-catalogue",
    "kleo": "C:\\Users\\VICTOR ABREU\\Documents\\world-catalogue",
    "elimfilters": "C:\\Users\\VICTOR ABREU\\Documents\\world-catalogue"
  }
}
```

Cualquier ruta también puede sobreescribirse por variable de entorno
(`KLEO_PROJECT_WORLD`, `KLEO_PROJECT_PHOENIX`, etc.) en `.env`, lo cual tiene
prioridad sobre `config.json`.

El campo `mcp.enabled` en `config.json` controla qué integraciones MCP están
activas (GitHub, Gmail, Google Drive, Google Calendar, filesystem). Todas
empiezan deshabilitadas salvo `filesystem`.

### Validación obligatoria del repositorio (fail-closed)

Antes de ejecutar Claude Code para cualquier tarea, KLEO valida el estado
real del repositorio del proyecto en disco. Cada chequeo es fail-closed:
si no se puede confirmar positivamente, la tarea se bloquea — nunca se
asume un estado seguro por defecto.

- la ruta configurada existe,
- es **exactamente** la raíz de un repositorio Git — `Path(ruta).resolve()
  == Path(git_root).resolve()`; un subdirectorio de un repo válido no basta
  y bloquea con "La ruta configurada no es la raíz del repositorio",
- el proyecto tiene una entrada en `expected_remotes` — **es obligatoria**,
- el remote `origin` coincide exactamente con `expected_remotes[proyecto]`,
- `git branch --show-current` devuelve una rama real,
- `git status --porcelain` se ejecuta correctamente,
- no hay un merge, rebase o cherry-pick a medias.

Si cualquiera de estas validaciones falla, **la tarea se bloquea antes de
llamar a Claude Code**. Si todo pasa, KLEO manda a Telegram un mensaje
`ENTORNO VERIFICADO` con la ruta, raíz Git, remote, rama, HEAD inicial y
estado (`git status --porcelain`) antes de arrancar Claude Code, y guarda
esos mismos datos en la tarea (`env_verified`) para auditoría.

Todos los proyectos lógicos comparten el remote real verificado:

```json
{
  "expected_remotes": {
    "world": "https://github.com/LATAMFILTERS/world-catalogue.git",
    "phoenix": "https://github.com/LATAMFILTERS/world-catalogue.git",
    "marketing": "https://github.com/LATAMFILTERS/world-catalogue.git",
    "commercial": "https://github.com/LATAMFILTERS/world-catalogue.git",
    "mcp": "https://github.com/LATAMFILTERS/world-catalogue.git",
    "kleo": "https://github.com/LATAMFILTERS/world-catalogue.git",
    "elimfilters": "https://github.com/LATAMFILTERS/world-catalogue.git"
  }
}
```

No configures remotes como `PROJECT-PHOENIX`, `ELIMFILTERS-Marketing`,
`ELIMFILTERS-Commercial`, `ELIMFILTERS-MCP`, `KleoOS` o `elimfilters` mientras
no existan repositorios Git reales con esos nombres. La organización
`LATAMFILTERS` actualmente expone `world-catalogue` y `elimfilters-crm`; las
áreas anteriores permanecen dentro del monorepo.

### Verificación automática con pruebas (`test_commands`)

Por cada proyecto en `test_commands`, KLEO corre ese comando después de que
Claude Code termina (solo si Claude Code salió con éxito) y **solo marca la
tarea como COMPLETADA si las pruebas también pasan** — si fallan, la tarea
queda en ERROR y el mensaje de Telegram incluye la salida de las pruebas.
Un proyecto sin entrada en `test_commands` se reporta como antes, sin este
paso adicional.

```json
{
  "test_commands": {
    "kleo": "cd kleo && .venv\\Scripts\\python.exe -m pytest",
    "world": "cd frontend && npm run lint && npm run type-check"
  },
  "test_timeout_seconds": 600
}
```

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
