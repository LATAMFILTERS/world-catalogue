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

$primaryExitCode = Invoke-ClaudeModel -Model $primaryModel
if ($primaryExitCode -eq 0) {
    exit 0
}

[Console]::Error.WriteLine(
    "KLEO: el modelo principal '$primaryModel' falló con exit code $primaryExitCode. Reintentando con '$fallbackModel'."
)

$fallbackExitCode = Invoke-ClaudeModel -Model $fallbackModel
exit $fallbackExitCode
