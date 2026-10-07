param(
  [string]$Model = "qwen3:8b",
  [string]$OllamaHost = "127.0.0.1:11434"
)

$ErrorActionPreference = "Stop"

function Test-Command($Name) {
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

Write-Host "=== HERMES LOCAL LLM / ZERO-COST SETUP ==="

if (-not (Test-Command "ollama")) {
  if (-not (Test-Command "winget")) {
    throw "Ollama is not installed and winget is unavailable. Install Ollama manually, then rerun this script."
  }
  Write-Host "Installing Ollama with winget..."
  winget install --id Ollama.Ollama --exact --accept-package-agreements --accept-source-agreements
}

$env:OLLAMA_HOST = $OllamaHost

Write-Host "Ensuring Ollama is reachable..."
try {
  Invoke-RestMethod -Method Get -Uri "http://$OllamaHost/api/tags" -TimeoutSec 3 | Out-Null
} catch {
  Write-Host "Starting Ollama..."
  Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
  Start-Sleep -Seconds 3
}

Write-Host "Pulling/verifying model $Model ..."
ollama pull $Model

[Environment]::SetEnvironmentVariable("HERMES_LOCAL_LLM_ENABLED", "true", "User")
[Environment]::SetEnvironmentVariable("HERMES_LOCAL_LLM_URL", "http://127.0.0.1:11434/v1/chat/completions", "User")
[Environment]::SetEnvironmentVariable("HERMES_LOCAL_LLM_MODEL", $Model, "User")
[Environment]::SetEnvironmentVariable("HERMES_ZERO_COST_REQUIRED", "true", "User")
[Environment]::SetEnvironmentVariable("HERMES_GROQ_FREE_TIER_CONFIRMED", "false", "User")

Write-Host "Testing local OpenAI-compatible endpoint..."
$payload = @{
  model = $Model
  temperature = 0
  max_tokens = 80
  response_format = @{ type = "json_object" }
  messages = @(
    @{ role = "system"; content = "Return JSON only." },
    @{ role = "user"; content = 'Return {"status":"ok","provider":"local"}.' }
  )
} | ConvertTo-Json -Depth 8

$response = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:11434/v1/chat/completions" -ContentType "application/json" -Body $payload -TimeoutSec 60

if (-not $response.choices[0].message.content) {
  throw "Local LLM endpoint responded without content."
}

Write-Host "HERMES local LLM is ready. Zero-cost mode is ON. Groq automatic fallback is OFF."
