param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ClaudeArgs
)

$ErrorActionPreference = "Stop"

$backend = if ($env:KLEO_CLAUDE_BACKEND_PATH) {
    $env:KLEO_CLAUDE_BACKEND_PATH
} else {
    "fcc-claude"
}

$primaryModel = if ($env:KLEO_PRIMARY_MODEL) {
    $env:KLEO_PRIMARY_MODEL
} else {
    "meta/llama-3.3-70b-instruct"
}

$kimiModel = "moonshotai/kimi-k2.6"

$fallbackModel = if ($env:KLEO_FALLBACK_MODEL) {
    $env:KLEO_FALLBACK_MODEL
} else {
    "nvidia/nemotron-4-340b-instruct"
}

function Invoke-ClaudeModel {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Model
    )

    & $backend --model $Model @ClaudeArgs
    return $LASTEXITCODE
}

# 1. Intentar con Modelo Principal (Llama 3.3 70B - Código y Ejecución Rápida)
$primaryExitCode = Invoke-ClaudeModel -Model $primaryModel
if ($primaryExitCode -eq 0) {
    exit 0
}

[Console]::Error.WriteLine(
    "KLEO: modelo '$primaryModel' no disponible. Reintentando con Kimi ($kimiModel)..."
)

# 2. Reintentar con Kimi (Moonshot AI - Contexto Masivo y Documentos Largos)
$kimiExitCode = Invoke-ClaudeModel -Model $kimiModel
if ($kimiExitCode -eq 0) {
    exit 0
}

[Console]::Error.WriteLine(
    "KLEO: modelo Kimi '$kimiModel' no disponible. Reintentando con Nemotron ($fallbackModel)..."
)

# 3. Reintentar con Nemotron (NVIDIA 340B - Supermodelo de Respaldo)
$fallbackExitCode = Invoke-ClaudeModel -Model $fallbackModel
exit $fallbackExitCode
