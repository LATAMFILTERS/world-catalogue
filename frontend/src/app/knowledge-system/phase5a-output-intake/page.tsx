'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';

export default function Phase5AOutputIntakePage() {
  const [activeTab, setActiveTab] = useState('status');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback('Copied!');
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const PROMPT_1 = `Basándote en este documento técnico, extrae 20 preguntas frecuentes
que un ingeniero industrial, comprador de flota, o gerente de mantenimiento
haría sobre filtración industrial, contaminación y optimización de costos.

Formato de respuesta:
P1: [pregunta clara y específica]
R1: [respuesta técnica con: definición, fórmula si aplica, ejemplo cuantificado, referencia ISO/ASTM/SAE]

Continúa hasta P20.

Foco en:
- Preguntas sobre ISO 4406 y su impacto
- Preguntas sobre ROI y TCO
- Preguntas sobre selección de filtros
- Preguntas sobre impacto de agua/contaminación
- Preguntas sobre tecnologías ELIMFILTERS`;

  const PROMPT_2 = `Revisa la precisión técnica de TODAS las definiciones y fórmulas contra:
- ISO 19438 (factor eC de vida de cojinete)
- ISO 4406 (códigos de limpieza)
- ISO 16889 (eficiencia de filtro)
- ASTM D6304 (agua en combustible)

Identifica:
1. Cualquier inexactitud en números o rangos
2. Definiciones ambiguas o incompletas
3. Cálculos que necesitan clarificación
4. Métricas que faltan verificación
5. Aplicaciones donde los números no se alinean

Reporta en formato:
[ISSUE] | [SECCIÓN] | [HALLAZGO] | [CORRECCIÓN RECOMENDADA]

Sé crítico pero constructivo.`;

  const PROMPT_3 = `Crea un script de podcast de 15 minutos titulado:

"¿Por Qué la Filtración de Sistema Cuesta 87% Menos a 10 Años?"

Estructura exacta:
- INTRO (2 min): Hook emocional — "Una flota típica gasta €200K/año en fallos evitables"
- ACT 1 (4 min): Enfoque Commodity explicado con números reales
- ACT 2 (4 min): Enfoque Sistema explicado con números reales
- ACT 3 (3 min): Comparativa lado a lado (TCO, vida útil, downtime)
- CIERRE (2 min): Llamada a acción para ingenieros

Tono: Educativo, técnico pero accesible

Incluir:
- Códigos ISO específicos (16/14/11 vs 19/17/14)
- Factores eC (0.55 vs 0.20)
- Números de vida útil (8,000 hrs vs 22,000 hrs)
- Cálculos TCO reales (€180K vs €22K)
- Referencias a estándares ISO/ASTM
- 1-2 historias de caso reales

Formato:
[SEGMENT] [TIME]
SPEAKER: [Exact words to read]
[Technical callout if needed]`;

  const PROMPT_4 = `Basándote en todo lo que has analizado, sugiere:

1. Las 5 secciones más importantes que debería agregar al documento técnico
2. Las 3 áreas donde el documento es menos claro y necesita expansión
3. Los 5 conceptos técnicos más críticos que podrían causar confusión
4. Las 3 oportunidades de casos de uso adicionales
5. Los 5 estándares o referencias que están faltando

Formato:
[RECOMENDACIÓN] | [POR QUÉ] | [LÍNEAS DE ACCIÓN]`;

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
            // PHASE 5A EXECUTION CENTER
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
            Phase 5A: NotebookLM Validation
          </h1>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '600px',
              lineHeight: 1.6,
            }}
          >
            Execute 4 sequential NotebookLM prompts to generate technical FAQs, validate standards compliance, create podcast scripts, and gather improvement suggestions.
          </p>
        </motion.div>
      </section>

      {/* Tabs */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'clamp(2rem, 5vw, 4rem) 2rem' }}>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            borderBottom: '1px solid rgba(255,241,45,0.2)',
            flexWrap: 'wrap',
          }}
        >
          {['status', 'prompts', 'submit'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '1rem 1.5rem',
                background: activeTab === tab ? 'rgba(255,241,45,0.1)' : 'transparent',
                border: 'none',
                color: activeTab === tab ? '#FFF12D' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontFamily: 'JetBrains Mono, monospace',
                borderBottom: activeTab === tab ? '2px solid #FFF12D' : 'none',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {tab === 'status' && '01 / STATUS'}
              {tab === 'prompts' && '02 / PROMPTS'}
              {tab === 'submit' && '03 / SUBMIT OUTPUT'}
            </button>
          ))}
        </div>

        {/* STATUS TAB */}
        {activeTab === 'status' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <section style={{ marginBottom: '3rem' }}>
              <h2
                style={{
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  marginBottom: '1.5rem',
                  color: '#fff',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                Phase 5A Status & Timeline
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {[
                  { step: '0', label: 'SETUP', time: '5 min', status: '✓ Ready', desc: 'Create NotebookLM notebook' },
                  { step: '1', label: 'FAQS', time: '15 min', status: '○ Pending', desc: 'Extract 20 technical FAQs' },
                  { step: '2', label: 'VALIDATION', time: '10 min', status: '○ Pending', desc: 'Verify against ISO standards' },
                  { step: '3', label: 'PODCAST', time: '15 min', status: '○ Pending', desc: 'Generate 15-min script' },
                  { step: '4', label: 'IMPROVEMENTS', time: '5 min', status: '○ Pending', desc: 'Suggest doc enhancements' },
                  { step: '5', label: 'SUBMIT', time: '10 min', status: '○ Pending', desc: 'Report outputs here' },
                ].map((item) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Number(item.step) * 0.1 }}
                    style={{
                      background: 'rgba(255,241,45,0.03)',
                      border: '1px solid rgba(255,241,45,0.15)',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      borderLeft: item.status.includes('✓') ? '4px solid #7cb342' : '4px solid rgba(255,241,45,0.3)',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.65rem',
                        color: '#FFF12D',
                        textTransform: 'uppercase',
                        margin: '0 0 0.5rem 0',
                      }}
                    >
                      {item.step} / {item.label}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', margin: '0 0 0.5rem 0' }}>
                      {item.desc}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,241,45,0.7)', margin: '0 0 0.5rem 0' }}>
                      {item.time}
                    </p>
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: item.status.includes('✓') ? '#7cb342' : 'rgba(255,241,45,0.7)',
                        margin: 0,
                      }}
                    >
                      {item.status}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>

            <section>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace' }}>
                What Happens Next
              </h3>
              <ol
                style={{
                  lineHeight: 1.8,
                  color: 'rgba(255,255,255,0.8)',
                  paddingLeft: '1.5rem',
                }}
              >
                <li>Open NotebookLM at https://notebooklm.google.com</li>
                <li>Create notebook: "ELIMFILTERS Technical Knowledge System"</li>
                <li>Upload both markdown documents (from your scratchpad)</li>
                <li>Execute 4 prompts sequentially (see PROMPTS tab)</li>
                <li>Copy each output and save to text files</li>
                <li>Return here and submit all 4 outputs (SUBMIT tab)</li>
                <li>Automatic integration into Knowledge System</li>
              </ol>
            </section>
          </motion.div>
        )}

        {/* PROMPTS TAB */}
        {activeTab === 'prompts' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.5rem', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
                4 Sequential NotebookLM Prompts
              </h2>

              {[
                { num: 1, title: 'Extract 20 Technical FAQs', time: '15 min', prompt: PROMPT_1 },
                { num: 2, title: 'Validate Technical Accuracy', time: '10 min', prompt: PROMPT_2 },
                { num: 3, title: 'Generate Podcast Script (15 min)', time: '15 min', prompt: PROMPT_3 },
                { num: 4, title: 'Suggest Document Improvements', time: '5 min', prompt: PROMPT_4 },
              ].map((item) => (
                <motion.div
                  key={item.num}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (item.num - 1) * 0.1 }}
                  style={{
                    background: 'rgba(255,241,45,0.03)',
                    border: '1px solid rgba(255,241,45,0.15)',
                    borderRadius: '8px',
                    padding: '2rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                    <div>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#FFF12D', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
                        PROMPT {item.num}
                      </p>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
                        {item.title}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'rgba(255,241,45,0.8)', margin: 0 }}>
                        {item.time}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(item.prompt)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#FFF12D',
                        color: '#000',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,241,45,0.8)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#FFF12D')}
                    >
                      {copyFeedback && item === (activeTab === 'prompts' ? item : null) ? 'Copied!' : 'Copy Prompt'}
                    </button>
                  </div>

                  <div
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,241,45,0.1)',
                      borderRadius: '4px',
                      padding: '1.5rem',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.8rem',
                      lineHeight: 1.6,
                      color: 'rgba(255,255,255,0.8)',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                    }}
                  >
                    {item.prompt}
                  </div>
                </motion.div>
              ))}
            </section>
          </motion.div>
        )}

        {/* SUBMIT TAB */}
        {activeTab === 'submit' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <section>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.5rem', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
                Submit Phase 5A Outputs
              </h2>

              <div style={{ background: 'rgba(255,241,45,0.05)', border: '2px solid rgba(255,241,45,0.25)', borderRadius: '8px', padding: '2rem', marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  When you've completed all 4 prompts in NotebookLM and saved the outputs, copy the content from each file and send them as a single message in Claude Code:
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#FFF12D', marginBottom: '1rem', textTransform: 'uppercase' }}>
                  Message Format
                </p>

                <div
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,241,45,0.1)',
                    borderRadius: '4px',
                    padding: '1.5rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.75rem',
                    lineHeight: 1.6,
                    color: 'rgba(255,255,255,0.8)',
                    overflowX: 'auto',
                  }}
                >
                  {`Phase 5A completado.

[Pega aquí ELIMFILTERS_FAQs_Generated_Phase5A.txt]

---

[Pega aquí ELIMFILTERS_Technical_Validation_Phase5A.txt]

---

[Pega aquí ELIMFILTERS_Podcast_Script_Phase5A.md]

---

[Pega aquí ELIMFILTERS_Document_Improvement_Suggestions.txt - si completaste]`}
                </div>
              </div>

              <div style={{ background: 'rgba(255,241,45,0.05)', border: '1px solid rgba(255,241,45,0.15)', borderRadius: '8px', padding: '1.5rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.6 }}>
                  <strong>✓ After you submit:</strong> I will automatically integrate all outputs into the Knowledge System, populate the FAQ and podcast script pages, and generate the next implementation plan.
                </p>
              </div>
            </section>
          </motion.div>
        )}
      </div>
    </main>
  );
}
