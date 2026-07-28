/**
 * Language Detection Service - Detects incoming email language
 * Uses keyword-based detection (no external API calls, no Google blocking)
 * Forwards emails as-is, with language info for HQ team
 */

class TranslationService {
  constructor() {
    this.enabled = true; // Always enabled

    // Keyword patterns for language detection
    this.languageKeywords = {
      es: ['hola', 'gracias', 'señor', 'estimado', 'atentamente', 'cordialmente', 'quisiera', 'interés', 'necesito', 'problema', 'consulta', 'informe', 'cotización', 'pedido', 'distribuidor'],
      fr: ['bonjour', 'merci', 'monsieur', 'estimé', 'cordialement', 'nous', 'intéressé', 'besoin', 'problème', 'devis', 'commande'],
      de: ['hallo', 'danke', 'herr', 'geschätzt', 'mit freundlichen', 'wir', 'interessiert', 'benötigen', 'problem', 'angebot'],
      pt: ['olá', 'obrigado', 'senhor', 'estimado', 'atenciosamente', 'interessado', 'preciso', 'problema', 'cotação', 'pedido'],
      it: ['ciao', 'grazie', 'signore', 'stimato', 'cordiali', 'interessato', 'ho bisogno', 'problema', 'preventivo', 'ordine'],
      en: ['hello', 'thank', 'please', 'regards', 'interested', 'need', 'problem', 'quote', 'order', 'support'],
    };
  }

  /**
   * Detect language based on keyword matching
   * Returns language code (es, en, fr, de, pt, it) or 'unknown'
   */
  async detectLanguage(text) {
    const textLower = text.toLowerCase();
    const scores = {};

    // Score each language based on keyword matches
    for (const [lang, keywords] of Object.entries(this.languageKeywords)) {
      scores[lang] = keywords.filter(kw => textLower.includes(kw)).length;
    }

    // Find language with highest score
    const detected = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)[0];

    if (detected[1] > 0) {
      return detected[0];
    }
    return 'unknown';
  }

  /**
   * Get language name from code
   */
  getLanguageName(code) {
    const names = {
      es: 'Spanish',
      en: 'English',
      fr: 'French',
      de: 'German',
      pt: 'Portuguese',
      it: 'Italian',
      unknown: 'Unknown',
    };
    return names[code] || 'Unknown';
  }

  /**
   * Process email for language detection
   * Returns original content (no translation, but language info)
   */
  async translateEmailToEnglish(subject, body) {
    try {
      const combinedText = `${subject} ${body}`;
      const detectedLanguage = await this.detectLanguage(combinedText);

      console.log(`[language-detect] Detected language: ${detectedLanguage}`);

      return {
        subject,
        body,
        language: detectedLanguage,
        translated: false, // No translation, just detection
        languageName: this.getLanguageName(detectedLanguage),
      };
    } catch (err) {
      console.error('[language-detect] Detection failed:', err.message);
      return {
        subject,
        body,
        language: 'unknown',
        translated: false,
      };
    }
  }
}

module.exports = TranslationService;
