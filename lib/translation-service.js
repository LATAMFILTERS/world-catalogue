/**
 * Translation Service - Translates incoming emails to English for internal team
 * Uses Google Translate API
 */

const axios = require('axios');

class TranslationService {
  constructor() {
    this.apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    this.enabled = !!this.apiKey;
  }

  /**
   * Detect language of text
   * @param {string} text - Text to detect language for
   * @returns {Promise<string>} - Language code (e.g., 'es', 'en', 'fr')
   */
  async detectLanguage(text) {
    if (!this.enabled) {
      return 'unknown';
    }

    try {
      const response = await axios.post(
        'https://translation.googleapis.com/language/translate/v2/detect',
        { q: text },
        { params: { key: this.apiKey } }
      );

      const detection = response.data.detections[0][0];
      return detection.language;
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
    if (!this.enabled) {
      console.warn('[translation] Google Translate API not configured, returning original text');
      return { translated: text, language: 'unknown' };
    }

    try {
      // If no source language provided, detect it first
      let sourceLanguage = sourceLang;
      if (!sourceLanguage) {
        sourceLanguage = await this.detectLanguage(text);
      }

      // If already English, return as-is
      if (sourceLanguage === 'en') {
        return { translated: text, language: 'en' };
      }

      // Translate to English
      const response = await axios.post(
        'https://translation.googleapis.com/language/translate/v2',
        {
          q: text,
          source_language: sourceLanguage,
          target_language: 'en',
        },
        { params: { key: this.apiKey } }
      );

      const translatedText = response.data.data.translations[0].translatedText;
      console.log(`[translation] Translated from ${sourceLanguage} to English`);

      return {
        translated: translatedText,
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

      // If already English, return as-is
      if (detectedLanguage === 'en') {
        return {
          subject,
          body,
          language: 'en',
          translated: false,
        };
      }

      // Translate both subject and body
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
