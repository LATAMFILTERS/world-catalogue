/**
 * Translation Service - Translates incoming emails to English
 * Uses google-translate-free library (no API key required, local/free)
 */

const { translate } = require('google-translate-free');

class TranslationService {
  constructor() {
    this.enabled = true; // Always enabled, no API key needed
  }

  /**
   * Detect language of text using basic heuristics
   * google-translate-free auto-detects, but we'll use simple heuristics for speed
   * @param {string} text - Text to detect language for
   * @returns {Promise<string>} - Language code (e.g., 'es', 'en', 'fr')
   */
  async detectLanguage(text) {
    try {
      // Try to translate with auto-detect; if it doesn't change, likely already English
      const result = await translate({
        text: text.substring(0, 100), // Use first 100 chars for detection
        from: 'auto',
        to: 'en',
      });

      // If no translation occurred, language was already English
      if (result.text.toLowerCase().trim() === text.substring(0, 100).toLowerCase().trim()) {
        return 'en';
      }

      // For simplicity, return based on common patterns
      // This is a basic heuristic; google-translate-free doesn't expose detected language
      const text_lower = text.toLowerCase();
      if (text_lower.includes('gracias') || text_lower.includes('hola') || text_lower.includes('señor')) return 'es';
      if (text_lower.includes('merci') || text_lower.includes('bonjour')) return 'fr';
      if (text_lower.includes('danke') || text_lower.includes('guten')) return 'de';
      if (text_lower.includes('obrigado') || text_lower.includes('olá')) return 'pt';
      if (text_lower.includes('grazie') || text_lower.includes('ciao')) return 'it';

      return 'unknown';
    } catch (err) {
      console.warn('[translation] Failed to detect language:', err.message);
      return 'unknown';
    }
  }

  /**
   * Translate text to English
   * @param {string} text - Text to translate
   * @param {string} sourceLang - Source language code (optional, will auto-detect if not provided)
   * @returns {Promise<{translated: string, language: string}>} - Translated text and detected language
   */
  async translateToEnglish(text, sourceLang = null) {
    try {
      // If no source language provided, detect it first
      let sourceLanguage = sourceLang;
      if (!sourceLanguage) {
        sourceLanguage = await this.detectLanguage(text);
      }

      // If already English or unknown language, return as-is
      if (sourceLanguage === 'en' || sourceLanguage === 'unknown') {
        return { translated: text, language: sourceLanguage };
      }

      // Translate to English
      const result = await translate({
        text: text,
        from: sourceLanguage,
        to: 'en',
      });

      console.log(`[translation] Translated from ${sourceLanguage} to English`);

      return {
        translated: result.text,
        language: sourceLanguage,
      };
    } catch (err) {
      console.error('[translation] Failed to translate:', err.message);
      // Return original text if translation fails
      return { translated: text, language: sourceLang || 'unknown' };
    }
  }

  /**
   * Translate email body and subject to English
   * @param {string} subject - Email subject
   * @param {string} body - Email body
   * @returns {Promise<{subject: string, body: string, language: string}>} - Translated content
   */
  async translateEmailToEnglish(subject, body) {
    try {
      // Detect language from subject and body combined
      const combinedText = `${subject} ${body}`;
      const detectedLanguage = await this.detectLanguage(combinedText);

      // If already English or unknown, return as-is
      if (detectedLanguage === 'en' || detectedLanguage === 'unknown') {
        return {
          subject,
          body,
          language: detectedLanguage,
          translated: false,
        };
      }

      // Translate both subject and body in parallel
      const [subjectResult, bodyResult] = await Promise.all([
        this.translateToEnglish(subject, detectedLanguage),
        this.translateToEnglish(body, detectedLanguage),
      ]);

      console.log(
        `[translation] Email translated from ${detectedLanguage} to English`
      );

      return {
        subject: subjectResult.translated,
        body: bodyResult.translated,
        language: detectedLanguage,
        translated: true,
        originalSubject: subject,
        originalBody: body,
      };
    } catch (err) {
      console.error('[translation] Failed to translate email:', err.message);
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
