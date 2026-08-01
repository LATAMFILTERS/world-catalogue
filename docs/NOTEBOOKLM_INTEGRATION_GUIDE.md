# Guía de Integración: NotebookLM + Knowledge Center

Cómo integrar análisis de fuentes externas (generados por NotebookLM) en el Knowledge System de ELIMFILTERS.

## 🔗 Flujo de Integración

```
Fuentes Externas
  ↓
NotebookLM (Análisis & Síntesis)
  ↓
docs/external_analysis_*.md (Reportes)
  ↓
Knowledge Center (Enriquecimiento)
  ↓
Git Commit (Control de versión)
```

## 📂 Estructura de Documentación

```
/home/user/world-catalogue/
├── docs/
│   ├── NOTEBOOKLM_SETUP.md              # Guía de configuración
│   ├── NOTEBOOKLM_INTEGRATION_GUIDE.md  # Este archivo
│   ├── external_sources.md              # Lista de todas las fuentes
│   ├── external_analysis_contamination.md
│   ├── external_analysis_bearing_protection.md
│   ├── external_analysis_hydraulic_systems.md
│   ├── external_analysis_fuel_systems.md
│   ├── external_analysis_air_intake.md
│   └── external_analysis_all.md
│
├── scripts/
│   ├── notebooklm_quickstart.sh
│   ├── notebooklm_asset_protection.py
│   └── ...
│
└── frontend/
    └── src/app/knowledge-system/
        ├── standards/
        ├── contamination/
        ├── fleet/
        └── technologies/
```

## 🎯 Casos de Integración

### Caso 1: Enriquecer Standards Pages

**Página:** `/frontend/src/app/knowledge-system/standards/lube-oil-systems/page.tsx`

**Sección a enriquecer:** "Punto 4 - Limitaciones del enfoque basado en productos"

**Fuente:** `docs/external_analysis_bearing_protection.md`

**Acciones:**
1. Generar análisis: `python3 scripts/notebooklm_asset_protection.py --generate-report bearing_protection`
2. Revisar `docs/external_analysis_bearing_protection.md`
3. Extraer hallazgos clave sobre:
   - Mecanismos de desgarre (abrasivo vs adhesivo)
   - Correlación limpieza ISO 4406 → vida útil
   - Fracaso del enfoque commodity
4. Agregar como "Research References" en la página

**Ejemplo de enriquecimiento:**

```typescript
// Sección 4: Limitaciones del enfoque basado en productos
<motion.section>
  <p style={{...}}>04 / LIMITACIONES DEL ENFOQUE COMMODITY</p>
  
  <h2>Por qué la selección de productos falla</h2>
  <p>
    El enfoque traditional selecciona filtros basado en especificaciones OEM 
    sin considerar los mecanismos reales de degradación...
  </p>
  
  {/* NUEVO: Agregado desde NotebookLM analysis */}
  <div style={{...}}>
    <h3>Investigación: Desgarre por Contaminación</h3>
    <p>
      Estudios académicos documentan dos mecanismos de desgarre:
      • Desgarre abrasivo: partículas duras crean micro-surcos
      • Desgarre adhesivo: contacto metálico causa soldadura microscópica
      
      En motores diesel típicos, con pobre control de limpieza (ISO 4406 20/18/15):
      - Aceleración de desgarre: +40-60% vs. óptimo (16/14/11)
      - Reducción vida útil: 5,000 hrs → 2,500-3,000 hrs
      - Incremento downtime: 1 overhaul cada 3 años vs. cada 10 años
    </p>
    <p style={{fontSize: '0.85rem', color: '#FFF12D'}}>
      Fuente: External research analysis (NotebookLM/ISO standards)
    </p>
  </div>
</motion.section>
```

### Caso 2: Enriquecer Contamination Pages

**Página:** `/frontend/src/app/knowledge-system/contamination/diesel-water/page.tsx`

**Sección:** "Mecanismos de contaminación por agua"

**Fuente:** `docs/external_analysis_fuel_systems.md`

**Acciones:**
1. Generar: `python3 scripts/notebooklm_asset_protection.py --generate-report fuel_systems`
2. Extraer detalles técnicos sobre:
   - Rutas de ingreso de agua (condensación, filtraciones, combustible adulterado)
   - Crecimiento microbiano (bacterias, hongos, algas)
   - Criterios de medición (Karl Fischer, ppm)
   - Consecuencias operativas (injector stiction, corrosión)

**Ejemplo:**

```typescript
<motion.section>
  <p style={{...}}>02 / MECANISMOS DE DEGRADACIÓN</p>
  
  <h3>Contaminación por Agua</h3>
  <p>
    El agua en combustible diesel causa dos procesos degradativos en paralelo:
  </p>
  
  <div style={{...}}>
    <h4>1. Crecimiento Microbiano</h4>
    <p>
      [Extraído de NotebookLM Analysis]
      
      Cuando la concentración de agua excede 200 ppm:
      • Interfase agua-combustible se vuelve viable para microorganismos
      • Bacterias (Bacillus, Clostridium) y hongos (Aspergillus) crecen exponencialmente
      • Biofilm se forma en fondo de tanque (sedimento marrón/negro)
      • Ácidos producidos (corrosión) dañan inyectores HPCR
      
      Prueba de crecimiento: Incubar muestra 7 días a 37°C
      Resultado positivo: > 1,000,000 CFU/mL (necesita drenaje + filtración)
    </p>
  </div>
  
  {/* Referencias */}
  <p style={{fontSize: '0.85rem', color: '#999'}}>
    Basado en: ASTM D6304, estudios académicos de contaminación diésel, 
    guías de Cummins/Parker
  </p>
</motion.section>
```

### Caso 3: Enriquecer Fleet Optimization

**Página:** `/frontend/src/app/knowledge-system/fleet/total-cost-ownership/page.tsx`

**Sección:** "Análisis económico de protección vs commodity"

**Fuente:** `docs/external_analysis_all.md`

**Acciones:**
1. Generar análisis comprehensivo: `python3 scripts/notebooklm_asset_protection.py --generate-report all`
2. Extraer datos de TCO que comparen:
   - Costo inicial de filtración
   - Costos de mantenimiento preventivo
   - Costos de downtime evitado
   - Costos de reemplazo de componentes (cojinetes, inyectores)

**Ejemplo de tabla TCO:**

```typescript
<div style={{overflowX: 'auto'}}>
  <table style={{width: '100%', borderCollapse: 'collapse'}}>
    <thead>
      <tr style={{borderBottom: '2px solid #FFF12D'}}>
        <th style={{padding: '1rem', textAlign: 'left'}}>Componente de Costo</th>
        <th style={{padding: '1rem', textAlign: 'center'}}>Enfoque Commodity</th>
        <th style={{padding: '1rem', textAlign: 'center'}}>Sistema ELIMFILTERS</th>
        <th style={{padding: '1rem', textAlign: 'center'}}>Ahorro 10 años</th>
      </tr>
    </thead>
    <tbody>
      <tr style={{borderBottom: '1px solid rgba(255,241,45,0.1)'}}>
        <td style={{padding: '1rem'}}>Costo de filtros</td>
        <td style={{padding: '1rem', textAlign: 'center'}}>$2,400</td>
        <td style={{padding: '1rem', textAlign: 'center'}}>$3,200</td>
        <td style={{padding: '1rem', textAlign: 'center'}}>-$800</td>
      </tr>
      <tr style={{borderBottom: '1px solid rgba(255,241,45,0.1)'}}>
        <td style={{padding: '1rem'}}>Reemplazos de cojinetes</td>
        <td style={{padding: '1rem', textAlign: 'center'}}>$8,500 (3x)</td>
        <td style={{padding: '1rem', textAlign: 'center'}}>$2,800 (1x)</td>
        <td style={{padding: '1rem', textAlign: 'center'}}>$5,700</td>
      </tr>
      <tr style={{borderBottom: '1px solid rgba(255,241,45,0.1)'}}>
        <td style={{padding: '1rem'}}>Downtime + labor</td>
        <td style={{padding: '1rem', textAlign: 'center'}}>$42,000</td>
        <td style={{padding: '1rem', textAlign: 'center'}}>$12,000</td>
        <td style={{padding: '1rem', textAlign: 'center'}}>$30,000</td>
      </tr>
      <tr style={{backgroundColor: 'rgba(255,241,45,0.1)', fontWeight: 'bold'}}>
        <td style={{padding: '1rem'}}>TOTAL 10 AÑOS</td>
        <td style={{padding: '1rem', textAlign: 'center'}}>$52,900</td>
        <td style={{padding: '1rem', textAlign: 'center'}}>$18,000</td>
        <td style={{padding: '1rem', textAlign: 'center'}}>$34,900 (66%)</td>
      </tr>
    </tbody>
  </table>
</div>

<p style={{fontSize: '0.85rem', color: '#FFF12D', marginTop: '1rem'}}>
  Fuente: External research analysis - Total Cost of Ownership Study
</p>
```

## 📝 Workflow de Integración Paso a Paso

### 1️⃣ Generar Análisis

```bash
cd /home/user/world-catalogue

# Generar para dominio específico
python3 scripts/notebooklm_asset_protection.py --generate-report contamination

# O generar todos
python3 scripts/notebooklm_asset_protection.py --generate-report all
```

### 2️⃣ Revisar Documento Generado

```bash
# Ver análisis generado
cat docs/external_analysis_contamination.md

# Tomar notas de hallazgos clave
# - Mecanismos técnicos
# - Estándares relevantes
# - Datos cuantitativos
# - Referencias académicas
```

### 3️⃣ Editar Página del Knowledge System

```bash
# Abrir página a enriquecer
vim frontend/src/app/knowledge-system/standards/[sistema]/page.tsx

# O usar VS Code
code frontend/src/app/knowledge-system/standards/[sistema]/page.tsx
```

### 4️⃣ Agregar Sección de Investigación

Insertar nueva `<motion.section>` o `<div>` que incluya:

```typescript
{/* INVESTIGACIÓN EXTERNA - NotebookLM Analysis */}
<motion.section style={{
  background: 'rgba(255,241,45,0.03)',
  border: '1px solid rgba(255,241,45,0.15)',
  borderRadius: '8px',
  padding: '2rem',
  marginTop: '2rem'
}}>
  <h3 style={{color: '#FFF12D', marginBottom: '1rem'}}>
    📚 Hallazgos de Investigación Externa
  </h3>
  
  <p>
    {/* Contenido extraído de docs/external_analysis_*.md */}
  </p>
  
  <p style={{
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '1rem',
    fontStyle: 'italic'
  }}>
    Fuente: Análisis de investigación externa (NotebookLM/ISO estándares/papers académicos)
  </p>
</motion.section>
```

### 5️⃣ Construir y Probar Localmente

```bash
cd frontend

# Construir
npm run build

# Servir localmente
npx serve@latest -l 3000 -s out

# Visitar http://localhost:3000/knowledge-system/standards/[sistema]
# Verificar que el contenido se vea bien
```

### 6️⃣ Commit a Git

```bash
git add frontend/src/app/knowledge-system/
git add docs/external_analysis_*.md
git add docs/external_sources.md

git commit -m "docs: Enriquecer [Sistema] con análisis externo

- Agregado análisis de fuentes externas via NotebookLM
- Incluye mecanismos de degradación documentados
- Valida estándares ISO con papers académicos
- Datos cuantitativos de fiabilidad y TCO

Dominio: [contamination/bearing_protection/hydraulic/fuel/air_intake/all]
Fuente: NotebookLM analysis de fuentes confiables (ISO/ASTM/papers)"

git push -u origin claude/notebooklm-py-install-ox0qup
```

## 🏆 Mejores Prácticas

### ✅ Hacer

- Referenciar específicamente de qué documento se extrajo cada dato
- Incluir códigos ISO/ASTM/SAE cuando sea relevante
- Mantener números/métricas verificables
- Agregar nota de "Fuente: Investigación externa"
- Actualizar regularmente con nuevos análisis

### ❌ No Hacer

- Copiar-pegar sin contexto
- Presentar como hallazgos propios de ELIMFILTERS
- Incluir marketing o claims no verificables
- Mezclar análisis con tonalidad comercial
- Dejar referencias rotas o vagas

## 📊 Formato de Referencias

Todas las referencias a fuentes externas deben incluir:

```
[Contenido técnico]

Fuente: [Tipo de fuente]
- Estándar: ISO XXXX, ASTM XXXX (si aplica)
- Análisis: NotebookLM external research
- Referencia: docs/external_analysis_[dominio].md
```

## 🔄 Ciclo de Actualización

Mantener análisis actualizados:

```bash
# Mensualmente
python3 scripts/notebooklm_asset_protection.py --generate-report all

# Revisar qué cambió
git diff docs/external_analysis_*.md

# Identificar nuevos hallazgos que impacten Knowledge Center
# Actualizar páginas relevantes
# Commit y push
```

## 📞 Soporte

Para problemas:
1. Revisar `docs/NOTEBOOKLM_SETUP.md`
2. Ejecutar: `python3 scripts/notebooklm_asset_protection.py --help`
3. Verificar autenticación: `notebooklm doctor`

---

**¿Preguntas?** Revisa `NOTEBOOKLM_SETUP.md` o consulta con el equipo de desarrollo.
