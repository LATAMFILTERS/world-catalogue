/**
 * ELIMFILTERS Knowledge API
 * Endpoints para que agentes IA accedan a información técnica de filtros
 *
 * Rutas:
 * GET  /api/knowledge/technologies           - Lista todas las tecnologías
 * GET  /api/knowledge/technologies/{id}      - Detalle de una tecnología
 * GET  /api/knowledge/search                 - Búsqueda por concepto/aplicación
 * GET  /api/knowledge/documents/{id}         - Contenido completo de un manual
 * GET  /api/knowledge/context/{technology}   - Contexto para prompt de IA
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();

// Cargar índice de conocimiento
const knowledgeIndexPath = path.join(__dirname, '../elimfilters-wiki/knowledge-index.json');
const knowledgeIndex = JSON.parse(fs.readFileSync(knowledgeIndexPath, 'utf8'));

// Función auxiliar para leer markdown
function readMarkdown(filename) {
  try {
    const filePath = path.join(__dirname, '../elimfilters-wiki', filename);
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return null;
  }
}

/**
 * GET /api/knowledge/technologies
 * Retorna lista de todas las tecnologías ELIMFILTERS
 */
router.get('/technologies', (req, res) => {
  const techs = knowledgeIndex.technologies.map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
    prefix: t.prefix,
    type: t.type,
    micron_range: t.micron_range || t.micron_range_oil || t.micron_range_air,
    duty: t.duty,
    key_concepts: t.key_concepts.slice(0, 3) // Primeros 3 conceptos
  }));

  res.json({
    success: true,
    total: techs.length,
    technologies: techs
  });
});

/**
 * GET /api/knowledge/technologies/:id
 * Retorna detalles completos de una tecnología
 */
router.get('/technologies/:id', (req, res) => {
  const tech = knowledgeIndex.technologies.find(t => t.id.toLowerCase() === req.params.id.toLowerCase());

  if (!tech) {
    return res.status(404).json({
      success: false,
      error: `Technology ${req.params.id} not found`,
      available: knowledgeIndex.technologies.map(t => t.id)
    });
  }

  res.json({
    success: true,
    technology: tech
  });
});

/**
 * GET /api/knowledge/search
 * Búsqueda por concepto, aplicación, tipo de fluido, etc.
 *
 * Query params:
 * - concept: concepto técnico (ej: "adsorcion", "permeabilidad")
 * - application: tipo de aplicación (ej: "minería", "autobús")
 * - duty: HD, LD, Marine, Industrial
 * - prefix: EL8, EA1, EF9, etc.
 * - max_temp: temperatura máxima (ej: 80)
 * - limit: número máximo de resultados (default: 10)
 */
router.get('/search', (req, res) => {
  const { concept, application, duty, prefix, max_temp, limit = 10 } = req.query;

  let results = [...knowledgeIndex.technologies];

  // Filtrar por concepto
  if (concept) {
    const conceptLower = concept.toLowerCase();
    results = results.filter(t =>
      t.key_concepts.some(c => c.toLowerCase().includes(conceptLower)) ||
      t.type?.toLowerCase().includes(conceptLower) ||
      t.category?.toLowerCase().includes(conceptLower)
    );
  }

  // Filtrar por aplicación
  if (application) {
    const appLower = application.toLowerCase();
    results = results.filter(t =>
      t.applications.some(a => a.toLowerCase().includes(appLower))
    );
  }

  // Filtrar por duty
  if (duty) {
    results = results.filter(t =>
      Array.isArray(t.duty) && t.duty.some(d => d === duty) ||
      t.duty === duty
    );
  }

  // Filtrar por prefijo
  if (prefix) {
    results = results.filter(t => {
      if (Array.isArray(t.prefix)) {
        return t.prefix.includes(prefix);
      }
      return t.prefix === prefix;
    });
  }

  // Filtrar por temperatura máxima
  if (max_temp) {
    const tempLimit = parseInt(max_temp);
    results = results.filter(t => {
      const maxT = t.max_temperature ? parseInt(t.max_temperature) : 999;
      return maxT <= tempLimit;
    });
  }

  // Limitar resultados
  results = results.slice(0, parseInt(limit));

  res.json({
    success: true,
    query: { concept, application, duty, prefix, max_temp },
    total_found: results.length,
    results: results.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      type: r.type,
      key_concepts: r.key_concepts
    }))
  });
});

/**
 * GET /api/knowledge/documents/:id
 * Retorna el contenido completo de un manual técnico
 *
 * IDs válidos: DURATECH, SINTRAX, NANOFORCE, MACROCORE, SYNTEPORE,
 *              INTEKCORE, MICROKAPPA, MARINECLEAN, COOLTECH, AQUAGUARD,
 *              DRYCORE, GASULTRA, BLUECLEAN, INDEX, TECHNICAL_FOUNDATIONS,
 *              MATERIALS_ENGINEERING
 */
router.get('/documents/:id', (req, res) => {
  // Buscar en tecnologías
  let tech = knowledgeIndex.technologies.find(t => t.id.toLowerCase() === req.params.id.toLowerCase());
  let filename = tech?.file;

  // Si no es tecnología, buscar en documentos de referencia
  if (!filename) {
    const refDoc = knowledgeIndex.reference_documents.find(d => d.id.toLowerCase() === req.params.id.toLowerCase());
    filename = refDoc?.file;
  }

  if (!filename) {
    return res.status(404).json({
      success: false,
      error: `Document ${req.params.id} not found`,
      available_docs: [
        ...knowledgeIndex.technologies.map(t => t.id),
        ...knowledgeIndex.reference_documents.map(d => d.id)
      ]
    });
  }

  const content = readMarkdown(filename);
  if (!content) {
    return res.status(500).json({
      success: false,
      error: `Could not read document ${filename}`
    });
  }

  res.json({
    success: true,
    document_id: req.params.id,
    filename: filename,
    content: content,
    format: 'markdown'
  });
});

/**
 * GET /api/knowledge/context/:technology
 * Retorna contexto formateado para pasar a un agente IA
 * Ideal para "system context" en prompts de IA
 */
router.get('/context/:technology', (req, res) => {
  const tech = knowledgeIndex.technologies.find(t => t.id.toLowerCase() === req.params.technology.toLowerCase());

  if (!tech) {
    return res.status(404).json({
      success: false,
      error: `Technology ${req.params.technology} not found`
    });
  }

  // Construir contexto formateado
  const context = `
# ${tech.name} Technical Context

## Overview
- Category: ${tech.category}
- Type: ${tech.type}
- Duty: ${Array.isArray(tech.duty) ? tech.duty.join(', ') : tech.duty}
- Prefix: ${Array.isArray(tech.prefix) ? tech.prefix.join(', ') : tech.prefix || 'N/A'}

## Filtration Performance
- Micron Range: ${tech.micron_range || tech.micron_range_oil || 'N/A'}
- Efficiency: ${tech.efficiency || tech.efficiency_particles || 'N/A'}
- Max Temperature: ${tech.max_temperature || 'N/A'}
- Pressure Rating: ${tech.pressure_rating || tech.max_pressure || 'N/A'}

## Key Concepts
${tech.key_concepts.map(c => `- ${c}`).join('\n')}

## Applications
${tech.applications.map(a => `- ${a}`).join('\n')}

## Service Intervals
${tech.service_interval ? `- Standard: ${tech.service_interval}` : ''}
${tech.service_interval_oil ? `- Oil: ${tech.service_interval_oil}` : ''}
${tech.service_interval_air ? `- Air: ${tech.service_interval_air}` : ''}
${tech.service_interval_fuel ? `- Fuel: ${tech.service_interval_fuel}` : ''}
${tech.service_interval_hydraulic ? `- Hydraulic: ${tech.service_interval_hydraulic}` : ''}

## Competitors
${tech.competitors ? tech.competitors.map(c => `- ${c}`).join('\n') : 'N/A'}
`;

  res.json({
    success: true,
    technology_id: tech.id,
    context: context,
    metadata: {
      name: tech.name,
      category: tech.category,
      type: tech.type,
      duty: tech.duty
    }
  });
});

/**
 * GET /api/knowledge/comparison
 * Compara dos tecnologías
 *
 * Query params:
 * - tech1: ID de primera tecnología
 * - tech2: ID de segunda tecnología
 */
router.get('/comparison', (req, res) => {
  const { tech1, tech2 } = req.query;

  if (!tech1 || !tech2) {
    return res.status(400).json({
      success: false,
      error: 'Required parameters: tech1, tech2',
      example: '/api/knowledge/comparison?tech1=DURATECH&tech2=SINTRAX'
    });
  }

  const t1 = knowledgeIndex.technologies.find(t => t.id.toLowerCase() === tech1.toLowerCase());
  const t2 = knowledgeIndex.technologies.find(t => t.id.toLowerCase() === tech2.toLowerCase());

  if (!t1 || !t2) {
    return res.status(404).json({
      success: false,
      error: 'One or both technologies not found',
      requested: { tech1, tech2 }
    });
  }

  const comparison = {
    success: true,
    technologies: [
      {
        id: t1.id,
        name: t1.name,
        type: t1.type,
        micron_range: t1.micron_range || t1.micron_range_oil,
        efficiency: t1.efficiency || t1.efficiency_particles,
        max_temperature: t1.max_temperature,
        service_interval: t1.service_interval || t1.service_interval_oil
      },
      {
        id: t2.id,
        name: t2.name,
        type: t2.type,
        micron_range: t2.micron_range || t2.micron_range_oil,
        efficiency: t2.efficiency || t2.efficiency_particles,
        max_temperature: t2.max_temperature,
        service_interval: t2.service_interval || t2.service_interval_oil
      }
    ]
  };

  res.json(comparison);
});

/**
 * GET /api/knowledge/by-prefix/:prefix
 * Retorna todas las tecnologías asociadas a un prefijo ELIMFILTERS
 */
router.get('/by-prefix/:prefix', (req, res) => {
  const results = knowledgeIndex.technologies.filter(t => {
    if (Array.isArray(t.prefix)) {
      return t.prefix.includes(req.params.prefix.toUpperCase());
    }
    return t.prefix === req.params.prefix.toUpperCase();
  });

  if (results.length === 0) {
    return res.status(404).json({
      success: false,
      error: `No technologies found for prefix ${req.params.prefix}`,
      available_prefixes: [...new Set(
        knowledgeIndex.technologies
          .flatMap(t => Array.isArray(t.prefix) ? t.prefix : [t.prefix])
          .filter(p => p)
      )]
    });
  }

  res.json({
    success: true,
    prefix: req.params.prefix.toUpperCase(),
    total: results.length,
    technologies: results.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      type: r.type
    }))
  });
});

/**
 * GET /api/knowledge/concepts
 * Lista todos los conceptos técnicos disponibles
 */
router.get('/concepts', (req, res) => {
  const allConcepts = new Set();

  knowledgeIndex.technologies.forEach(t => {
    t.key_concepts.forEach(c => allConcepts.add(c));
  });

  if (knowledgeIndex.knowledge_topics && knowledgeIndex.knowledge_topics.physics) {
    knowledgeIndex.knowledge_topics.physics.forEach(c => allConcepts.add(c));
  }

  if (knowledgeIndex.knowledge_topics && knowledgeIndex.knowledge_topics.chemistry) {
    knowledgeIndex.knowledge_topics.chemistry.forEach(c => allConcepts.add(c));
  }

  res.json({
    success: true,
    total: allConcepts.size,
    concepts: Array.from(allConcepts).sort()
  });
});

/**
 * GET /api/knowledge/health
 * Endpoint de salud para verificar disponibilidad del servicio de conocimiento
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'ELIMFILTERS Knowledge API',
    version: '2.0',
    status: 'active',
    technologies_loaded: knowledgeIndex.technologies.length,
    documents_available: knowledgeIndex.reference_documents.length + knowledgeIndex.technologies.length
  });
});

module.exports = router;
