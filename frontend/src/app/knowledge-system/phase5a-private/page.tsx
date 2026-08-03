'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';

const VALID_TOKENS = ['phase5a-victor-2026'];

interface OutputState {
  faqs: string;
  validation: string;
  podcast: string;
  improvements: string;
}

interface SubmitResponse {
  success?: boolean;
  message?: string;
  stats?: {
    faqsIntegrated: number;
    validationIssuesFound: number;
    podcastScriptReceived: boolean;
    improvementsSuggested: number;
  };
  error?: string;
}

const PROMPTS = {
  faq: `Based on the ELIMFILTERS technical documentation, generate exactly 20 technical FAQs about industrial filtration systems.

Format each FAQ exactly as follows:
P1: First question about filtration?
R1: Detailed answer explaining the technical concept...

P2: Second question?
R2: Answer...

Continue for P3 through P20 with R3 through R20.

Focus on:
- ISO 4406, ISO 16889, ISO 19438 standards
- Asset protection through contamination control
- System-level vs commodity approaches
- Practical operational impact (hours, costs, downtime)
- Technology-to-contamination mappings`,

  validation: `Review the ELIMFILTERS Knowledge System documentation and identify 5-10 technical accuracy issues or areas needing clarification.

Format each finding exactly as follows:
[Finding Type] | [Knowledge System Section] | [Technical Finding] | [Recommended Action]

Example:
[Accuracy] | Standards/Lube Oil | ISO 4406 code 16/14/11 should clarify it targets engine bearing applications specifically | Specify equipment type context

[Clarity] | Technologies/MACROCORE | MACROCORE description could emphasize particle size range | Add micron rating threshold

Continue with additional findings...

Be specific and technical. Focus on industrial accuracy.`,

  podcast: `Create a 15-minute podcast script (approximately 2,800 words) about industrial filtration and asset protection.

Structure:
INTRO (2 min): Hook listeners with a real equipment failure scenario
ACT 1 (4 min): Traditional commodity filtration approach and limitations
ACT 2 (4 min): System-level contamination control strategy
ACT 3 (3 min): Real-world cost comparison and ROI
CIERRE (2 min): Call to action for asset protection

Use conversational language. Include specific metrics and standards references.
Make it engaging for industrial fleet managers and equipment operators.`,

  improvements: `Based on the ELIMFILTERS documentation, suggest 5-10 improvements for expanding the Knowledge System.

Format each suggestion exactly as follows:
[Improvement Area] | [Why This Matters] | [Specific Action Items]

Example:
[Predictive Analytics] | Enables fleet managers to anticipate contamination events before failure | Add section on condition-based monitoring intervals and particle count trending

[ESG Impact] | Demonstrates sustainability benefits of system approach | Quantify waste reduction, oil lifecycle extension, and carbon footprint

Continue with additional improvement suggestions...

Focus on scalability and practical implementation.`
};

const PROMPTS_ES = {
  faq: 'Prompt 1: Generar 20 FAQs técnicas',
  validation: 'Prompt 2: Validar precisión técnica',
  podcast: 'Prompt 3: Crear guión de podcast (15 min)',
  improvements: 'Prompt 4: Sugerir mejoras'
};

function Phase5APrivateContent() {
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTab, setCurrentTab] = useState<'status' | 'prompts' | 'submit'>('status');
  const [outputs, setOutputs] = useState<OutputState>({
    faqs: '',
    validation: '',
    podcast: '',
    improvements: ''
  });
  const [submitStatus, setSubmitStatus] = useState<SubmitResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token && VALID_TOKENS.includes(token)) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setIsLoaded(true);
  }, [searchParams]);

  const copyPrompt = async (promptKey: keyof typeof PROMPTS) => {
    try {
      await navigator.clipboard.writeText(PROMPTS[promptKey]);
      setCopiedPrompt(promptKey);
      setTimeout(() => setCopiedPrompt(null), 2000);
    } catch {
      console.error('Error copying prompt');
    }
  };

  const handleSubmit = async () => {
    if (!outputs.faqs && !outputs.validation && !outputs.podcast && !outputs.improvements) {
      alert('Por favor, pega al menos un output');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/phase5a-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outputs)
      });

      const data: SubmitResponse = await response.json();
      setSubmitStatus(data);

      if (data.success) {
        setTimeout(() => {
          setOutputs({ faqs: '', validation: '', podcast: '', improvements: '' });
        }, 2000);
      }
    } catch (error) {
      setSubmitStatus({ error: 'Error al submitter. Intenta de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.2rem' }}>Cargando...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>🔒 Acceso Privado Requerido</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>Este portal está protegido. Por favor verifica tu token de acceso.</p>
          <Link href="/" style={{ color: '#FFF12D', textDecoration: 'none' }}>Volver</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Navigation */}
      <Link
        href="/knowledge-system"
        style={{
          display: 'inline-block',
          margin: '2rem',
          color: '#FFF12D',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        ← KNOWLEDGE SYSTEM
      </Link>

      {/* Hero */}
      <section
        style={{
          padding: 'clamp(2rem, 5vw, 4rem)',
          background: 'linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(255,241,45,0.05) 100%)',
          borderBottom: '2px solid rgba(255,241,45,0.15)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(255,241,45,0.7)', marginBottom: '1rem' }}>
            // PHASE 5A CENTRO DE EJECUCIÓN PRIVADO
          </p>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              margin: '0 0 1rem 0',
              fontFamily: 'Outfit, sans-serif',
              lineHeight: 1.2,
            }}
          >
            Phase 5A: Validación NotebookLM
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', margin: '1rem 0 0 0' }}>
            Ejecuta 4 prompts secuenciales para generar FAQs técnicas, validar cumplimiento de estándares, crear scripts de podcast y recopilar mejoras.
          </p>
        </motion.div>
      </section>

      {/* Tabs */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid rgba(255,241,45,0.1)', marginBottom: '3rem' }}>
          {(['status', 'prompts', 'submit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                color: currentTab === tab ? '#FFF12D' : 'rgba(255,255,255,0.5)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.9rem',
                padding: '1rem 0',
                borderBottom: currentTab === tab ? '2px solid #FFF12D' : 'none',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {tab === 'status' && '01 / ESTADO'}
              {tab === 'prompts' && '02 / PROMPTS'}
              {tab === 'submit' && '03 / SUBMIT'}
            </button>
          ))}
        </div>

        {/* TAB: STATUS */}
        {currentTab === 'status' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 600 }}>Estado & Timeline</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              {[
                { step: '0 / SETUP', title: 'Crear notebook', time: '5 min', status: '✓ Listo' },
                { step: '1 / FAQS', title: 'Generar 20 FAQs', time: '15 min', status: '○ Pendiente' },
                { step: '2 / VALIDACIÓN', title: 'Verificar estándares', time: '10 min', status: '○ Pendiente' },
                { step: '3 / PODCAST', title: 'Generar script (15 min)', time: '15 min', status: '○ Pendiente' },
                { step: '4 / MEJORAS', title: 'Sugerir mejoras', time: '5 min', status: '○ Pendiente' },
                { step: '5 / SUBMIT', title: 'Reportar outputs', time: '10 min', status: '○ Pendiente' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  style={{
                    background: 'rgba(255,241,45,0.03)',
                    border: '1px solid rgba(255,241,45,0.15)',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#FFF12D', marginBottom: '0.5rem' }}>
                    {item.step}
                  </p>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>{item.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem' }}>{item.time}</p>
                  <p style={{ fontSize: '0.85rem', color: '#FFF12D' }}>{item.status}</p>
                </motion.div>
              ))}
            </div>

            <div style={{ background: 'rgba(255,241,45,0.05)', border: '1px solid rgba(255,241,45,0.2)', borderRadius: '8px', padding: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Qué Sucede Después</h3>
              <ol style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.8)', paddingLeft: '1.5rem' }}>
                <li>Abre NotebookLM en https://notebooklm.google.com</li>
                <li>Crea notebook: "ELIMFILTERS Technical Knowledge System"</li>
                <li>Sube ambos documentos markdown (desde scratchpad)</li>
                <li>Ejecuta 4 prompts secuencialmente (ver tab PROMPTS)</li>
                <li>Copia cada output y guarda en archivos de texto</li>
                <li>Vuelve aquí y submitte todos los 4 outputs (tab SUBMIT)</li>
                <li>Integración automática en Knowledge System</li>
              </ol>
            </div>
          </motion.div>
        )}

        {/* TAB: PROMPTS */}
        {currentTab === 'prompts' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 600 }}>4 Prompts NotebookLM</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
              {[
                { key: 'faq' as const, label: 'PROMPT 1: Generar 20 FAQs Técnicas', time: '15 min' },
                { key: 'validation' as const, label: 'PROMPT 2: Validar Precisión Técnica', time: '10 min' },
                { key: 'podcast' as const, label: 'PROMPT 3: Crear Script de Podcast (15 min)', time: '15 min' },
                { key: 'improvements' as const, label: 'PROMPT 4: Sugerir Mejoras', time: '5 min' },
              ].map((item) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    background: 'rgba(255,241,45,0.02)',
                    border: '1px solid rgba(255,241,45,0.12)',
                    borderRadius: '8px',
                    padding: '2rem',
                    borderLeft: '4px solid rgba(255,241,45,0.3)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{item.label}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,241,45,0.8)', fontFamily: 'JetBrains Mono, monospace' }}>~{item.time}</span>
                  </div>

                  <div
                    style={{
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,241,45,0.1)',
                      borderRadius: '4px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      fontSize: '0.85rem',
                      color: 'rgba(255,255,255,0.6)',
                      fontFamily: 'JetBrains Mono, monospace',
                      maxHeight: '200px',
                      overflow: 'auto',
                    }}
                  >
                    {PROMPTS[item.key].substring(0, 300)}...
                  </div>

                  <button
                    onClick={() => copyPrompt(item.key)}
                    style={{
                      background: copiedPrompt === item.key ? 'rgba(124,179,66,0.3)' : '#FFF12D',
                      color: copiedPrompt === item.key ? '#7CB342' : '#000',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.75rem 1.5rem',
                      fontWeight: 600,
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                  >
                    {copiedPrompt === item.key ? '✓ COPIADO' : 'COPIAR PROMPT'}
                  </button>
                </motion.div>
              ))}
            </div>

            <div style={{ background: 'rgba(255,241,45,0.05)', border: '1px solid rgba(255,241,45,0.2)', borderRadius: '8px', padding: '2rem', marginTop: '3rem' }}>
              <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Cómo Usar Los Prompts</h3>
              <ol style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.8)', paddingLeft: '1.5rem' }}>
                <li><strong>Copia el prompt:</strong> Click en botón [COPIAR PROMPT] para cada uno</li>
                <li><strong>Abre NotebookLM:</strong> https://notebooklm.google.com</li>
                <li><strong>Pega en "Ask Notebook":</strong> El textbox abajo de tus documentos cargados</li>
                <li><strong>Espera respuesta:</strong> NotebookLM tardará 3-5 minutos por prompt</li>
                <li><strong>Copia output completo:</strong> Selecciona todo (Ctrl+A) y copia (Ctrl+C)</li>
                <li><strong>Repite para los 4 prompts:</strong> FAQSM → Validación → Podcast → Mejoras</li>
              </ol>
            </div>
          </motion.div>
        )}

        {/* TAB: SUBMIT */}
        {currentTab === 'submit' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 600 }}>Submitter Outputs</h2>

            {submitStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: submitStatus.success ? 'rgba(124,179,66,0.1)' : 'rgba(200,60,60,0.1)',
                  border: submitStatus.success ? '1px solid rgba(124,179,66,0.3)' : '1px solid rgba(200,60,60,0.3)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                }}
              >
                <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: submitStatus.success ? '#7CB342' : '#c83c3c' }}>
                  {submitStatus.success ? '✓ Integración Exitosa' : '⚠️ Error'}
                </p>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>{submitStatus.message || submitStatus.error}</p>
                {submitStatus.stats && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,241,45,0.2)' }}>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                      ✓ {submitStatus.stats.faqsIntegrated} FAQs integradas<br />
                      ✓ {submitStatus.stats.validationIssuesFound} issues documentados<br />
                      ✓ Podcast script: {submitStatus.stats.podcastScriptReceived ? 'Recibido' : 'Pendiente'}<br />
                      ✓ {submitStatus.stats.improvementsSuggested} mejoras sugeridas
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              {[
                { key: 'faqs', label: 'FAQs (Prompt 1)', placeholder: 'Pega aquí el output de las 20 FAQs...' },
                { key: 'validation', label: 'Validación (Prompt 2)', placeholder: 'Pega aquí el output de validación...' },
                { key: 'podcast', label: 'Script Podcast (Prompt 3)', placeholder: 'Pega aquí el script del podcast...' },
                { key: 'improvements', label: 'Mejoras (Prompt 4)', placeholder: 'Pega aquí las mejoras sugeridas...' },
              ].map((field) => (
                <div key={field.key}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    {field.label}
                  </label>
                  <textarea
                    value={outputs[field.key as keyof OutputState]}
                    onChange={(e) => setOutputs({ ...outputs, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%',
                      minHeight: '150px',
                      padding: '1rem',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,241,45,0.15)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '1rem',
                background: isSubmitting ? 'rgba(255,241,45,0.3)' : '#FFF12D',
                color: isSubmitting ? '#999' : '#000',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.95rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {isSubmitting ? 'Submittiendo...' : 'SUBMITTER OUTPUTS'}
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}

export default function Phase5APrivatePage() {
  return (
    <Suspense fallback={<div style={{ background: '#000', minHeight: '100vh' }} />}>
      <Phase5APrivateContent />
    </Suspense>
  );
}
