/**
 * Email Intent Classifier - Analyzes incoming emails and determines intent
 * Uses keyword matching and context to classify email type
 */

class EmailIntentClassifier {
  constructor() {
    this.intents = {
      distributor: {
        keywords: ['distribuidor', 'distributor', 'partner', 'reseller', 'wholesale', 'bulk', 'network', 'collaboration', 'business opportunity'],
        type: 'distributor',
        respondTo: 'distribution_network@elimfilters.com',
        userResponse: this.getDistributorResponse(),
        redirectUrl: 'https://elimfilters.com/distributor-application',
      },
      support: {
        keywords: ['soporte', 'support', 'problema', 'issue', 'error', 'technical', 'help', 'falla', 'no funciona', 'urgente', 'urgent'],
        type: 'support',
        respondTo: 'support@elimfilters.com',
        userResponse: this.getSupportResponse(),
        redirectUrl: 'https://elimfilters.com/contact',
      },
      sales: {
        keywords: ['venta', 'sale', 'precio', 'price', 'cotización', 'quote', 'compra', 'purchase', 'order', 'pedido'],
        type: 'sales',
        respondTo: 'info@elimfilters.com',
        userResponse: this.getSalesResponse(),
        redirectUrl: 'https://part-search.elimfilters.com',
      },
      partnerships: {
        keywords: ['alianza', 'partnership', 'colaboración', 'collaboration', 'estrategia', 'strategy', 'negocio', 'business', 'hardware', 'platform'],
        type: 'partnerships',
        respondTo: 'solutions@elimfilters.com',
        userResponse: this.getPartnershipsResponse(),
        redirectUrl: 'https://elimfilters.com/contact',
      },
      technical: {
        keywords: ['especificación', 'specification', 'spec', 'compatibilidad', 'compatibility', 'certificado', 'certified', 'estándar', 'standard', 'iso', 'norma'],
        type: 'technical',
        respondTo: 'support@elimfilters.com',
        userResponse: this.getTechnicalResponse(),
        redirectUrl: 'https://elimfilters.com/knowledge-system',
      },
      contact: {
        keywords: ['información', 'information', 'consulta', 'inquiry', 'general', 'hola', 'hello', 'buenos días'],
        type: 'contact',
        respondTo: 'info@elimfilters.com',
        userResponse: this.getContactResponse(),
        redirectUrl: 'https://elimfilters.com/contact',
      },
    };
  }

  /**
   * Classify email based on subject and content
   * Returns: { type, respondTo, userResponse, redirectUrl, confidence }
   */
  classify(subject = '', body = '') {
    const text = `${subject} ${body}`.toLowerCase();

    let bestMatch = null;
    let highestScore = 0;

    for (const [key, intent] of Object.entries(this.intents)) {
      let score = 0;

      // Count keyword matches
      for (const keyword of intent.keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          score += matches.length;
        }
      }

      // Boost score for perfect matches
      if (subject.toLowerCase().includes(intent.type)) {
        score += 3;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = {
          type: intent.type,
          respondTo: intent.respondTo,
          userResponse: intent.userResponse,
          redirectUrl: intent.redirectUrl,
          confidence: Math.min(score / 3, 1.0), // Normalize to 0-1
        };
      }
    }

    // Default to 'contact' if no strong match
    if (!bestMatch || highestScore === 0) {
      const defaultIntent = this.intents.contact;
      bestMatch = {
        type: 'contact',
        respondTo: defaultIntent.respondTo,
        userResponse: defaultIntent.userResponse,
        redirectUrl: defaultIntent.redirectUrl,
        confidence: 0.5,
      };
    }

    return bestMatch;
  }

  // ─────────────────────────────────────────────────────────────────────
  // User Response Templates
  // ─────────────────────────────────────────────────────────────────────

  getDistributorResponse() {
    return {
      en: `Thank you for your interest in becoming an ELIMFILTERS distributor!

We appreciate your inquiry and would love to explore a partnership with you. To proceed with your application, please visit:

👉 https://elimfilters.com/distributor-application

Simply fill out the form with your business details, and our team will review your application. We'll be in touch within 2-3 business days to discuss the next steps.

If you have any questions in the meantime, feel free to reach out.

Best regards,
ELIMFILTERS Team`,

      es: `¡Gracias por tu interés en ser distribuidor de ELIMFILTERS!

Apreciamos tu consulta y nos encantaría explorar una asociación contigo. Para proceder con tu solicitud, por favor visita:

👉 https://elimfilters.com/distributor-application

Simplemente completa el formulario con los detalles de tu negocio, y nuestro equipo revisará tu aplicación. Nos comunicaremos contigo en 2-3 días hábiles para discutir los próximos pasos.

Si tienes alguna pregunta en el meantime, no dudes en comunicarte.

Cordialmente,
Equipo ELIMFILTERS`,
    };
  }

  getSupportResponse() {
    return {
      en: `Thank you for contacting ELIMFILTERS support!

We understand you need technical assistance. Our support team is here to help. Please visit our support page or reply with:

- Your issue description
- Product or part number (if applicable)
- Steps you've already taken
- Your location/timezone

Our technical support team will get back to you within 24 hours.

👉 https://elimfilters.com/contact

Best regards,
Technical Support Team`,

      es: `¡Gracias por contactar al soporte técnico de ELIMFILTERS!

Entendemos que necesitas asistencia técnica. Nuestro equipo está aquí para ayudarte. Por favor, visita:

👉 https://elimfilters.com/contact

O proporciona:
- Descripción del problema
- Número de producto o pieza (si aplica)
- Pasos que ya has intentado
- Tu ubicación/zona horaria

Nuestro equipo de soporte técnico te responderá en 24 horas.

Cordialmente,
Equipo de Soporte Técnico`,
    };
  }

  getSalesResponse() {
    return {
      en: `Thank you for your interest in ELIMFILTERS products!

For pricing, availability, and quotations, please use our product search tool:

👉 https://part-search.elimfilters.com

You can search by:
- Part number (SKU)
- OEM code
- Vehicle/equipment type
- Application

Our sales team will provide quotes within 24 hours of your inquiry.

Need help? Contact us at: info@elimfilters.com

Best regards,
Sales Team`,

      es: `¡Gracias por tu interés en los productos ELIMFILTERS!

Para precios, disponibilidad y cotizaciones, utiliza nuestra herramienta de búsqueda:

👉 https://part-search.elimfilters.com

Puedes buscar por:
- Número de parte (SKU)
- Código OEM
- Tipo de vehículo/equipo
- Aplicación

Nuestro equipo de ventas proporcionará cotizaciones en 24 horas.

¿Necesitas ayuda? Contáctanos en: info@elimfilters.com

Cordialmente,
Equipo de Ventas`,
    };
  }

  getPartnershipsResponse() {
    return {
      en: `Thank you for exploring a partnership opportunity with ELIMFILTERS!

We're excited about the potential to collaborate. Our partnerships team will review your proposal and get back to you shortly.

In the meantime, you can learn more about our solutions at:
👉 https://elimfilters.com

Our solutions team will contact you within 2-3 business days to discuss next steps.

Best regards,
ELIMFILTERS Partnerships Team`,

      es: `¡Gracias por explorar una oportunidad de asociación con ELIMFILTERS!

Estamos emocionados por el potencial de colaboración. Nuestro equipo de alianzas revisará tu propuesta y se pondrá en contacto contigo pronto.

Mientras tanto, puedes aprender más sobre nuestras soluciones en:
👉 https://elimfilters.com

Nuestro equipo de soluciones te contactará en 2-3 días hábiles para discutir los próximos pasos.

Cordialmente,
Equipo de Asociaciones ELIMFILTERS`,
    };
  }

  getTechnicalResponse() {
    return {
      en: `Thank you for your technical inquiry!

For detailed specifications, compliance information, and technical documentation, please visit our Knowledge System:

👉 https://elimfilters.com/knowledge-system

You'll find:
- ISO standards compliance
- Technical specifications
- Performance data
- Industry documentation

For specific technical questions, our engineering team is available at: support@elimfilters.com

Best regards,
Technical Team`,

      es: `¡Gracias por tu consulta técnica!

Para especificaciones detalladas, información de cumplimiento y documentación técnica, visita nuestro Sistema de Conocimiento:

👉 https://elimfilters.com/knowledge-system

Encontrarás:
- Cumplimiento de normas ISO
- Especificaciones técnicas
- Datos de rendimiento
- Documentación industrial

Para preguntas técnicas específicas, nuestro equipo de ingeniería está disponible en: support@elimfilters.com

Cordialmente,
Equipo Técnico`,
    };
  }

  getContactResponse() {
    return {
      en: `Thank you for contacting ELIMFILTERS!

We appreciate your message and will get back to you as soon as possible. Our team typically responds within 24 hours.

If you need immediate assistance, you can also visit:
👉 https://elimfilters.com/contact

Best regards,
ELIMFILTERS Team`,

      es: `¡Gracias por contactar a ELIMFILTERS!

Apreciamos tu mensaje y nos pondremos en contacto lo antes posible. Nuestro equipo generalmente responde en 24 horas.

Si necesitas asistencia inmediata, también puedes visitar:
👉 https://elimfilters.com/contact

Cordialmente,
Equipo ELIMFILTERS`,
    };
  }
}

module.exports = EmailIntentClassifier;
