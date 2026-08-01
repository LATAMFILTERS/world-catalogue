# NotebookLM Asset Protection Documentation

Integra **fuentes externas confiables** sobre protección de activos industriales, contaminación, y filtración para enriquecer el Knowledge Center de ELIMFILTERS.

## 🎯 Objetivo

NotebookLM analiza normativas (ISO, ASTM, SAE), papers académicos, y guías de fabricantes para generar documentación que:

1. **Valida** los estándares del Knowledge Center con fuentes externas
2. **Enriquece** con análisis de contaminación y degradación de activos
3. **Genera** reportes sobre protección mediante filtración
4. **Documenta** problemas reales de fiabilidad de equipos

## 📋 Fuentes Incluidas

### Normas Internacionales (ISO/ASTM/SAE)
- **ISO 16889** — Pruebas de filtros hidráulicos (Beta ratio)
- **ISO 4406** — Códigos de limpieza de aceite
- **ISO 5011** — Pruebas de filtros de aire de motor
- **ASTM D6304** — Agua en combustible diesel
- **SAE J1539** — Estándares de eficiencia de filtros

### Investigación Académica
- Mecanismos de desgarre por partículas
- Contaminación microbiana en sistemas diésel
- Fiabilidad hidráulica y control de contaminación

### Recursos de Fabricantes
- SKF — Vida útil de cojinetes y limpieza de aceite
- Cummins — Requisitos de filtración en diésel
- Parker — Guías de sistemas hidráulicos

### Análisis de Costos
- Costo total de propiedad (TCO)
- Correlación entre downtime y fallo de equipos

## 🚀 Configuración Inicial

### Paso 1: Instalar NotebookLM CLI

```bash
# Ya instalado en el entorno
notebooklm --version
```

### Paso 2: Autenticarse

```bash
# Login inicial
notebooklm login

# Verificar autenticación
notebooklm status
```

### Paso 3: Configurar el Sistema

```bash
cd /home/user/world-catalogue

# Exportar la lista de fuentes
python scripts/notebooklm_asset_protection.py --export-sources

# Ver el archivo generado
cat docs/external_sources.md
```

## 📖 Uso

### Crear Notebook de Protección de Activos

```bash
python scripts/notebooklm_asset_protection.py --create-notebook
```

Esto crea un notebook llamado "ELIMFILTERS Asset Protection - External Sources" donde se almacenarán todas las fuentes.

### Agregar Fuentes Externas

```bash
python scripts/notebooklm_asset_protection.py --add-sources
```

Agrega automáticamente:
- Estándares ISO/ASTM/SAE
- Papers académicos relevantes
- Guías de fabricantes
- Estudios de TCO

### Generar Reportes Analíticos

**Análisis de contaminación:**
```bash
python scripts/notebooklm_asset_protection.py --generate-report contamination
```

**Protección de cojinetes:**
```bash
python scripts/notebooklm_asset_protection.py --generate-report bearing_protection
```

**Sistemas hidráulicos:**
```bash
python scripts/notebooklm_asset_protection.py --generate-report hydraulic_systems
```

**Sistemas de combustible:**
```bash
python scripts/notebooklm_asset_protection.py --generate-report fuel_systems
```

**Filtración de aire:**
```bash
python scripts/notebooklm_asset_protection.py --generate-report air_intake
```

**Análisis comprehensivo:**
```bash
python scripts/notebooklm_asset_protection.py --generate-report all
```

Esto genera reportes Markdown en `docs/external_analysis_*.md`.

### Ver Notebooks Disponibles

```bash
python scripts/notebooklm_asset_protection.py --list
```

## 📊 Flujo de Integración Recomendado

```
1. Autenticarse
   notebooklm login

2. Crear notebook
   python scripts/notebooklm_asset_protection.py --create-notebook

3. Agregar todas las fuentes
   python scripts/notebooklm_asset_protection.py --add-sources

4. Generar análisis por dominio
   for domain in contamination bearing_protection hydraulic_systems fuel_systems air_intake; do
     python scripts/notebooklm_asset_protection.py --generate-report $domain
   done

5. Revisar y enriquecer Knowledge Center
   cat docs/external_analysis_*.md
   # Integrar hallazgos en /frontend/src/app/knowledge-system/

6. Commit a rama de desarrollo
   git add docs/external_analysis_*.md
   git commit -m "docs: Add external sources analysis from NotebookLM"
   git push -u origin claude/notebooklm-py-install-ox0qup
```

## 🔗 Integración con Knowledge Center

Los reportes generados pueden enriquecer:

1. **Standards Pages** (`/knowledge-system/standards/`)
   - Agregar secciones de "Research References"
   - Validar códigos ISO con fuentes académicas

2. **Contamination Pages** (`/knowledge-system/contamination/`)
   - Incluir mecanismos de fallo detallados
   - Referenciar estudios de correlación

3. **Fleet Optimization** (`/knowledge-system/fleet/`)
   - Datos cuantitativos de TCO
   - Casos de estudio de downtime

4. **Technologies** (`/technologies/`)
   - Validar claims con papers académicos
   - Mapear a normas ISO

## 🎓 Casos de Uso

### Caso 1: Validar ISO 16889 en Sistemas Hidráulicos
```bash
# NotebookLM analiza ISO 16889 + papers académicos
python scripts/notebooklm_asset_protection.py --generate-report hydraulic_systems

# Resultado: Documento que valida el uso correcto de Beta ratio
# Se puede referenciar en /knowledge-system/standards/hydraulic-systems/
```

### Caso 2: Documentar Contaminación Microbiana en Diésel
```bash
python scripts/notebooklm_asset_protection.py --generate-report fuel_systems

# NotebookLM genera análisis de:
# - Rutas de ingreso de agua
# - Crecimiento de bacterias/hongos
# - Pruebas Karl Fischer
# - Prevención
```

### Caso 3: TCO Analysis para Documentación de Flota
```bash
python scripts/notebooklm_asset_protection.py --generate-report all

# Incluye comparativas de:
# - Vida útil de equipos (sistema vs commodity)
# - Costos de downtime
# - ROI de filtración optimizada
```

## 🔄 Actualización Periódica

Para mantener las fuentes actualizadas:

```bash
# Cada mes, regenerar análisis
0 0 1 * * cd /home/user/world-catalogue && \
  python scripts/notebooklm_asset_protection.py --generate-report all && \
  git add docs/ && git commit -m "docs: Update external sources analysis" && \
  git push origin claude/notebooklm-py-install-ox0qup
```

## ⚙️ Opciones Avanzadas

### Profile Personalizado
```bash
notebooklm profile create elimfilters-research

python scripts/notebooklm_asset_protection.py \
  --profile elimfilters-research \
  --create-notebook
```

### Agregar Fuentes Personalizadas
Edita `scripts/notebooklm_asset_protection.py`:

```python
EXTERNAL_SOURCES = {
    "Custom_Research": [
        {
            "title": "Tu investigación",
            "url": "https://...",
            "category": "Categoría",
            "description": "Descripción"
        }
    ]
}
```

## 🐛 Troubleshooting

### NotebookLM no detecta autenticación
```bash
# Verificar estado
notebooklm doctor

# Re-login si es necesario
notebooklm login
```

### No se pueden agregar fuentes
```bash
# Verificar que el notebook está seleccionado
notebooklm status

# Establecer notebook activo
notebooklm use [notebook-id]
```

### Errores de red
```bash
# Reintentar con verbose
python scripts/notebooklm_asset_protection.py \
  --add-sources \
  -v
```

## 📝 Notas

- NotebookLM es un cliente **no oficial** — los cambios en Google pueden afectar la API
- Las fuentes se guardan en el notebook de NotebookLM, no en el repositorio
- Los reportes generados se exportan como Markdown para control de versión
- Usa `--profile` para mantener separados diferentes análisis

## 🔐 Privacidad

- Los datos se almacenan en NotebookLM/Google
- No incluya información sensible en las fuentes
- Para datos internos, usa un profile separado

---

**¿Preguntas?** Revisa `CLAUDE.md` o ejecuta `python scripts/notebooklm_asset_protection.py --help`
