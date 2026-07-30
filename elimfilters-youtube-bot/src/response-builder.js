/**
 * Technical-Commercial Response Builder
 *
 * Generates structured responses in the format:
 * ✅ PROTECCIÓN DE ACTIVOS: RECOMENDACIÓN TÉCNICA
 *
 * SKU: EL82100
 * Aplicación: [application]
 * Tipo de filtración: [filter type]
 * Especificación técnica: [description]
 */

export function buildProductResponse(product, context) {
  if (!product) {
    return buildFallbackResponse(context);
  }

  // Extract homologations (OEM codes)
  const homologations = product.oem_codes
    ? (Array.isArray(product.oem_codes)
        ? product.oem_codes.map(o => typeof o === 'object' ? o.code : o).join(', ')
        : String(product.oem_codes).replace(/[\[\]"']/g, ''))
    : '';

  // Build response
  let response = `✅ PROTECCIÓN DE ACTIVOS: RECOMENDACIÓN TÉCNICA\n\n`;
  response += `SKU ELIMFILTERS: ${product.sku}\n`;
  response += `Aplicación: ${product.product_name}\n`;
  response += `Tipo de filtración: ${product.filter_type}\n`;

  if (homologations) {
    response += `Homologación: ${homologations}\n`;
  }

  response += `\n¿POR QUÉ LO RECOMENDAMOS?\n`;

  // Technical specification
  const techSpecs = [];
  if (product.beta_ratio) {
    techSpecs.push(`Beta ${product.beta_ratio} efficiency`);
  }
  if (product.micron_rating) {
    techSpecs.push(`${product.micron_rating}µm absolute rating`);
  }
  if (product.dirt_capacity_grams) {
    techSpecs.push(`${product.dirt_capacity_grams}g dirt capacity`);
  }

  if (techSpecs.length > 0) {
    response += `Especificaciones: ${techSpecs.join(' • ')}\n`;
  }

  response += `\nNuestra media filtrante patentada está desarrollada bajo formulaciones avanzadas, asegurando:\n`;
  response += `• Reducción del desgarre abrasivo en componentes del motor\n`;
  response += `• Prolongación de la vida útil del activo\n`;
  response += `• Cumplimiento con normas ISO 16889 y especificaciones del fabricante\n`;

  if (product.description) {
    response += `\nEspecificación técnica: ${product.description}\n`;
  }

  response += `\nIMPORTANTE: Esta recomendación se basa en especificaciones que exige el fabricante del motor.\n`;
  response += `Verificar siempre el manual del fabricante para políticas de mantenimiento.\n\n`;
  response += `¿Necesitas detalles técnicos adicionales o cotización?`;

  return response;
}

export function buildFallbackResponse(context) {
  let message = '¡Hola! Bienvenido a ELIMFILTERS.\n\n';

  if (context?.brand || context?.motor_code) {
    message += `Detectamos: ${[context.brand, context.motor_code].filter(Boolean).join(' ')}\n\n`;
  }

  message += `Puedo ayudarte a encontrar filtros compatibles. Comparte:\n`;
  message += `• Código OEM o modelo del filtro que usas\n`;
  message += `• Marca/modelo de tu equipo (ej: Freightliner, Mack)\n`;
  message += `• Motor (ej: DD60, C13, MP8, ISX)\n`;
  message += `• Tipo de sistema (aire, combustible, lubricante, hidráulico)\n\n`;
  message += `¿Cuál es tu consulta?`;

  return message;
}

export function buildNoMatchResponse(context) {
  let message = '⚠️ No encontramos ese modelo en nuestro catálogo.\n\n';

  if (context?.brand && context?.motor_code) {
    message += `Buscamos: ${context.brand} ${context.motor_code}\n\n`;
  }

  message += `Opciones:\n`;
  message += `1. Confirma el código OEM exacto del filtro\n`;
  message += `2. Verifica la marca/modelo del motor (ej: "Volvo D13")\n`;
  message += `3. Consulta directamente: info@elimfilters.com\n\n`;
  message += `Estamos listos para ayudarte.`;

  return message;
}

export function buildGreetingResponse() {
  return `¡Hola! 👋 Bienvenido a ELIMFILTERS.\n\n` +
    `Soy tu asistente técnico. Puedo ayudarte a encontrar el filtro exacto para tu equipo.\n\n` +
    `¿Qué necesitas hoy?`;
}
