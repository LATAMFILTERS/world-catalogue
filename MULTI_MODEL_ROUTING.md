# 🔄 Multi-Model Routing Architecture para ELIMFILTERS

Implementación basada en **OpenClaude** para soporte de múltiples LLM providers con fallback automático y optimización de costos.

## 1. ProviderFactory Interface

### Estructura Base
```typescript
// services/providers/base.provider.ts
export interface Provider {
  id: 'groq' | 'openai' | 'gemini' | 'ollama' | 'deepseek'
  name: string
  baseUrl: string
  model: string
  apiKey?: string
  
  // Core methods
  health(): Promise<boolean>
  classify(code: string, desc: string): Promise<ClassifyResult>
  extract(html: string, code: string): Promise<ExtractResult>
  
  // Metrics
  recordLatency(ms: number): void
  recordError(error: string): void
  getScore(): number
}
```

### Scoring Strategy (EMA - Exponential Moving Average)
```javascript
score = (latency_weighted * 0.4) + (cost_weighted * 0.3) + (reliability * 0.3)
latency_ms = α * current + (1-α) * previous  // α=0.3 (recency bias)
```

## 2. Provider Implementations

### 2.1 GroqProvider (actual)
```javascript
// services/providers/groq.provider.js
class GroqProvider extends BaseProvider {
  async classify(code, desc) {
    const start = Date.now();
    try {
      const result = await this.groq.chat.completions.create({...});
      this.recordLatency(Date.now() - start);
      return result;
    } catch (err) {
      this.recordError(err.message);
      throw err;
    }
  }
}
```

**Ventajas:**
- ✅ Rápido (promedio 800ms)
- ✅ JSON mode con response_format
- ✅ Versátil (classify + extract)

**Costos:** ~$0.05 por 1M tokens

### 2.2 OpenAIProvider (fallback premium)
```javascript
class OpenAIProvider extends BaseProvider {
  model = "gpt-4o-mini" // o "gpt-4o" para tareas críticas
  
  async classify(code, desc) {
    // Mismo prompt que Groq, mapeo automático
  }
}
```

**Ventajas:**
- ✅ Mejor para reasoning complejo
- ✅ Vision API (si necesitamos procesar imágenes de filtros)

**Costos:** $0.15/M tokens (4x más caro que Groq)

### 2.3 OllamaProvider (local/offline)
```javascript
class OllamaProvider extends BaseProvider {
  model = "llama2:70b" // Ejecutado localmente
  baseUrl = "http://localhost:11434"
  
  // Sin API key requerida
  // Ideal para desarrollo y testing
}
```

**Ventajas:**
- ✅ Gratis (local)
- ✅ Sin riesgos de privacy (datos no salen del servidor)
- ✅ Sin latencia de red (si está en mismo machine)

**Desventajas:**
- ❌ Requiere más recursos
- ❌ Menos preciso que Groq/OpenAI

### 2.4 DeepSeekProvider (experimental)
```javascript
class DeepSeekProvider extends BaseProvider {
  model = "deepseek-chat"
  baseUrl = "https://api.deepseek.com/v1"
  
  // Similar a OpenAI-compatible
}
```

**Costos:** $0.14/M tokens (competitivo con OpenAI)

## 3. SmartRouter Implementation

```javascript
// services/router.js
class SmartRouter {
  constructor(providers) {
    this.providers = new Map()
    providers.forEach(p => this.providers.set(p.id, p))
    this.activeProvider = null
  }
  
  async selectProvider(task) {
    // Health check paralelo
    const health = await Promise.all([
      ...this.providers.values()
    ].map(p => p.health().catch(() => false)))
    
    const healthy = [...this.providers.values()].filter((p, i) => health[i])
    if (!healthy.length) throw new Error('No providers available')
    
    // Score-based selection
    const scores = healthy.map(p => ({
      provider: p,
      score: p.getScore(),
      taskOptimal: this.getTaskOptimal(p.id, task)
    }))
    
    // Ordenar por score + afinidad de tarea
    const selected = scores.sort((a, b) => 
      (b.score * b.taskOptimal) - (a.score * a.taskOptimal)
    )[0].provider
    
    return selected
  }
  
  getTaskOptimal(providerId, task) {
    // Mapeo de tareas → providers
    const affinity = {
      'groq': { classify: 1.0, extract: 0.9, chat: 0.8 },
      'openai': { classify: 0.95, extract: 1.0, chat: 1.0, vision: 1.0 },
      'ollama': { classify: 0.7, extract: 0.6, chat: 0.8 },
      'deepseek': { classify: 0.9, extract: 0.8, chat: 0.95 }
    }
    return affinity[providerId]?.[task] || 0.5
  }
}
```

## 4. Persistent Configuration

### `~/.elimfilters.json`
```json
{
  "activeProviderId": "groq",
  "fallbackChain": ["groq", "openai", "ollama"],
  "enableAutoSwitch": true,
  "providers": {
    "groq": {
      "apiKey": "${GROQ_API_KEY}",
      "model": "llama-3.3-70b-versatile",
      "enabled": true,
      "priority": 1
    },
    "openai": {
      "apiKey": "${OPENAI_API_KEY}",
      "model": "gpt-4o-mini",
      "enabled": true,
      "priority": 2
    },
    "ollama": {
      "baseUrl": "http://localhost:11434",
      "model": "llama2:70b",
      "enabled": false,
      "priority": 3
    },
    "deepseek": {
      "apiKey": "${DEEPSEEK_API_KEY}",
      "model": "deepseek-chat",
      "enabled": false,
      "priority": 4
    }
  },
  "metrics": {
    "groq": { "latency": 850, "errors": 2, "calls": 145 },
    "openai": { "latency": 1200, "errors": 0, "calls": 12 }
  }
}
```

## 5. Integration Points

### 5.1 Endpoint Signature
```javascript
app.post('/api/classify', async (req, res) => {
  const { code, description, provider = 'auto' } = req.body
  
  const selectedProvider = provider === 'auto' 
    ? await router.selectProvider('classify')
    : providerMap.get(provider)
  
  try {
    const result = await selectedProvider.classify(code, description)
    res.json({ success: true, result, provider: selectedProvider.id })
  } catch (err) {
    if (router.activeProvider !== selectedProvider) {
      // Fallback automático
      return res.json({ error: 'Provider failed, retrying...' })
    }
    res.status(500).json({ error: err.message })
  }
})

// Query param override
// POST /api/classify?provider=openai
```

### 5.2 Streaming Response (SSE Anthropic-compatible)
```javascript
app.post('/api/chat/stream', async (req, res) => {
  const provider = await router.selectProvider('chat')
  
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  
  try {
    res.write('event: message_start\n')
    res.write(`data: ${JSON.stringify({ type: 'message_start' })}\n\n`)
    
    const stream = await provider.chatStream(req.body)
    for await (const chunk of stream) {
      res.write('event: content_block_delta\n')
      res.write(`data: ${JSON.stringify({ 
        type: 'content_block_delta',
        delta: { text: chunk }
      })}\n\n`)
    }
    
    res.write('event: message_stop\n')
    res.write(`data: ${JSON.stringify({ type: 'message_stop' })}\n\n`)
    res.end()
  } catch (err) {
    res.write(`event: error\n`)
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
    res.end()
  }
})
```

## 6. Implementation Roadmap

### Phase 1: Abstraction (1-2 días)
- [ ] Crear `BaseProvider` abstract class
- [ ] Extraer GroqService → GroqProvider
- [ ] Implementar ProviderFactory

### Phase 2: Additional Providers (2-3 días)
- [ ] OpenAIProvider
- [ ] OllamaProvider
- [ ] DeepSeekProvider (optional)

### Phase 3: SmartRouter (1-2 días)
- [ ] Health checks paralelos
- [ ] Scoring con EMA
- [ ] Task affinity mapping

### Phase 4: Configuration & Fallback (1 día)
- [ ] JSON config file
- [ ] Load/save metrics
- [ ] Automatic fallback chain

### Phase 5: Endpoint Refactor (1 día)
- [ ] Query param provider selection
- [ ] SSE streaming responses
- [ ] Error handling + retries

### Phase 6: Testing & Monitoring (1-2 días)
- [ ] Unit tests per provider
- [ ] Integration tests (happy path + fallback)
- [ ] Prometheus metrics (latency, cost, error rates)

## 7. Cost Optimization Strategy

### Current (Groq only)
- ~500 API calls/month
- ~100M tokens
- **Cost: ~$5/mes**

### With Smart Routing
- Route expensive tasks (vision, reasoning) to cheaper Groq
- Reserve OpenAI para fallback y vision
- **Projected: $3-4/mes** (20% reduction)

### Offline Option (Ollama)
- Develop/test sin consumir API credits
- Fallback a Groq si Ollama falla
- **Cost: Free (for local use)**

## 8. Monitoring & Alerting

```javascript
// services/metrics.js
class MetricsCollector {
  recordCall(providerId, task, latency, success) {
    // Prometheus metrics
    // histogram_provider_latency{provider="groq", task="classify"}
    // counter_provider_errors{provider="groq"}
  }
  
  isProviderDegraded(providerId) {
    const recent = this.last100Calls(providerId)
    const errorRate = recent.filter(c => !c.success).length / recent.length
    return errorRate > 0.05 // > 5% error rate = alert
  }
}
```

---

**Next Step:** Empezar Phase 1 con refactoring de GroqService → GroqProvider
