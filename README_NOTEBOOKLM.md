# NotebookLM Asset Protection Documentation

**Sistema de documentación externa que alimenta fuentes confiables (ISO, ASTM, papers académicos) al Knowledge Center de ELIMFILTERS mediante Google NotebookLM.**

## 🎯 Objetivo

Enriquecer el Knowledge Center con análisis de fuentes externas confiables sobre:
- Protección de activos industriales
- Mecanismos de degradación por contaminación
- Estándares ISO/ASTM/SAE
- Estudios académicos de fiabilidad
- Datos de TCO y downtime

## ✅ Estado

- ✓ Instalado: `notebooklm-py` v0.8.0rc1
- ✓ Scripts automatizados listos
- ✓ 15+ fuentes externas confiables catalogadas
- ✓ Documentación completa en `/docs/NOTEBOOKLM_*.md`

## 🚀 Inicio Rápido

### 1. Autenticar

```bash
notebooklm login
# Abre navegador → completa login con Google
```

### 2. Configuración automática (opción recomendada)

```bash
bash scripts/notebooklm_quickstart.sh
# Configuración interactiva que:
# ✓ Crea notebook
# ✓ Agrega fuentes
# ✓ Genera lista de fuentes
```

### 3. Generar análisis

```bash
# Análisis de contaminación
python3 scripts/notebooklm_asset_protection.py --generate-report contamination

# O todos los análisis
python3 scripts/notebooklm_asset_protection.py --generate-report all
```

### 4. Revisar resultados

```bash
cat docs/external_analysis_contamination.md
cat docs/external_sources.md
```

### 5. Enriquecer Knowledge Center

Ver: `docs/NOTEBOOKLM_INTEGRATION_GUIDE.md` para ejemplos de cómo integrar.

## 📚 Documentación

| Archivo | Propósito |
|---------|-----------|
| `docs/NOTEBOOKLM_SETUP.md` | Guía completa de instalación y configuración |
| `docs/NOTEBOOKLM_INTEGRATION_GUIDE.md` | Cómo integrar análisis en Knowledge Center |
| `docs/external_sources.md` | Listado de 15+ fuentes confiables |

## 📋 Fuentes Incluidas

- **ISO Standards** (3): ISO 16889, ISO 4406, ISO 5011
- **Academic Research** (3): Tribology, microbial contamination, hydraulic reliability
- **Industry Bodies** (3): ISO/TC 131, SAE, ASTM
- **OEM Resources** (3): SKF, Cummins, Parker
- **Economics** (2): TCO analysis, downtime prevention

## 🔧 Operaciones Disponibles

```bash
# Ver todas las opciones
python3 scripts/notebooklm_asset_protection.py --help

# Crear notebook
python3 scripts/notebooklm_asset_protection.py --create-notebook

# Listar notebooks
python3 scripts/notebooklm_asset_protection.py --list

# Agregar fuentes
python3 scripts/notebooklm_asset_protection.py --add-sources

# Generar reportes por dominio
python3 scripts/notebooklm_asset_protection.py --generate-report [dominio]

# Exportar listado de fuentes
python3 scripts/notebooklm_asset_protection.py --export-sources
```

## 📊 Análisis Disponibles

| Dominio | Comando | Genera |
|---------|---------|--------|
| Contaminación | `contamination` | Mecanismos de degradación |
| Cojinetes | `bearing_protection` | Desgarre por partículas |
| Hidráulica | `hydraulic_systems` | Fiabilidad & limpieza |
| Combustible | `fuel_systems` | Agua + microbios |
| Aire | `air_intake` | Eficiencia volumétrica |
| Todo | `all` | Análisis comprehensivo |

## 🔗 Integración con Knowledge Center

Para enriquecer una página (ej: `/knowledge-system/standards/lube-oil-systems/`):

1. Generar análisis relevante
2. Revisar `docs/external_analysis_*.md`
3. Extraer hallazgos clave
4. Agregar sección con referencias en React component
5. Testear localmente: `npm run build && npx serve -l 3000 -s out`
6. Commit y push

Ver ejemplos completos: `docs/NOTEBOOKLM_INTEGRATION_GUIDE.md`

## 🌐 Fuentes por Categoría

### Estándares Internacionales
- ISO 16889 — Beta Ratio Hydraulic Filter Testing
- ISO 4406 — Oil Cleanliness Code Classification  
- ISO 5011 — Air Intake Filter Testing
- ASTM D6304 — Water in Diesel Fuel
- SAE J1539 — Engine Air Filter Standards

### Investigación Académica
- Tribological analysis de desgarre por partículas
- Microbial growth en sistemas diésel
- Hydraulic system reliability vs contamination

### Fabricantes (OEM)
- SKF — Bearing lifespan & oil cleanliness correlation
- Cummins — Diesel engine filtration requirements
- Parker — Hydraulic contamination control guide

### Análisis Económicos
- Total Cost of Ownership (TCO) en flota
- Downtime prevention & equipment failure correlation

## 📝 Tipos de Reportes Generados

Cada análisis genera un documento Markdown que incluye:

✓ **Mecanismos técnicos** — Cómo/por qué falla
✓ **Estándares relevantes** — ISO/ASTM/SAE códigos
✓ **Datos cuantitativos** — Números verificables
✓ **Referencias académicas** — Fuentes citables
✓ **Prevención/Soluciones** — Control strategies

## 🎓 Caso de Uso Ejemplo

**Escenario:** Enriquecer página de Lube Oil Filtration

```
1. Generar análisis:
   python3 scripts/notebooklm_asset_protection.py --generate-report bearing_protection

2. NotebookLM analiza:
   - ISO 16889 (Beta ratio testing)
   - ISO 4406 (Cleanliness codes)
   - Papers académicos de desgarre
   - Guías de SKF sobre vida útil

3. Resultado:
   docs/external_analysis_bearing_protection.md
   
   Contiene:
   - Mecanismos de desgarre (abrasivo vs adhesivo)
   - Datos: ISO 16/14/11 → +250% vida vs 20/18/15
   - Correlaciones cuantitativas
   - Referencias verificables

4. Enriquecer página React:
   <motion.section>
     <h3>Investigación Externa</h3>
     <p>[Contenido extraído + referencias]</p>
   </motion.section>

5. Commit:
   git add docs/external_analysis_bearing_protection.md
   git add frontend/src/app/knowledge-system/standards/lube-oil-systems/page.tsx
   git commit -m "docs: Enriquecer Lube Oil con análisis externo"
```

## ⚙️ Configuración Avanzada

### Profile Personalizado
```bash
notebooklm profile create research
python3 scripts/notebooklm_asset_protection.py --profile research --create-notebook
```

### Agregar Fuentes Personalizadas
Edita `scripts/notebooklm_asset_protection.py`:
```python
EXTERNAL_SOURCES = {
    "Custom_Research": [
        {"title": "Tu paper", "url": "...", "category": "...", "description": "..."}
    ]
}
```

### Actualización Periódica
```bash
# Mensual: regenerar todos los análisis
python3 scripts/notebooklm_asset_protection.py --generate-report all

# Revisar cambios
git diff docs/external_analysis_*.md

# Actualizar Knowledge Center si hay nuevos hallazgos
# Commit y push
```

## 🐛 Troubleshooting

### No autenticado
```bash
notebooklm doctor  # Verificar estado
notebooklm login   # Re-login
```

### Script falla
```bash
python3 scripts/notebooklm_asset_protection.py --help
python3 scripts/notebooklm_asset_protection.py -v --add-sources  # Verbose
```

### No se agregan fuentes
```bash
notebooklm status  # Ver notebook activo
notebooklm use [id]  # Establecer notebook
```

## 📞 Soporte

1. Revisar documentación completa: `docs/NOTEBOOKLM_SETUP.md`
2. Ver ejemplos de integración: `docs/NOTEBOOKLM_INTEGRATION_GUIDE.md`
3. Consultar options: `python3 scripts/notebooklm_asset_protection.py --help`

## 🔐 Privacidad & Seguridad

- Los notebooks se almacenan privados en tu cuenta Google
- Los reportes exportados se versionan en git
- No incluyas información sensible en prompts
- Usa perfiles separados para proyectos diferentes

## 📈 Próximas Mejoras

- [ ] Agentes AI personalizados para dominios específicos
- [ ] Importación automática de papers desde arxiv/scholar
- [ ] Dashboard de seguimiento de análisis
- [ ] Integración con CI/CD para regeneración automática

## 🎉 ¡Listo!

Sistema completamente funcional y listo para:
1. Alimentar NotebookLM con fuentes confiables
2. Generar análisis de protección de activos
3. Enriquecer Knowledge Center con datos verificables
4. Mantener documentación actualizada

**Próximo paso:** `bash scripts/notebooklm_quickstart.sh`

---

Rama: `claude/notebooklm-py-install-ox0qup`  
Commit: `5b1815b`  
Documentación: `/docs/NOTEBOOKLM_*.md`
