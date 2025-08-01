import type { TranslationResponse } from '../../lib/translationService';

// Test translation data for walkthrough testing
export const testWalkthroughTranslationData: TranslationResponse = {
  originalText: 'Esta es una historia de prueba para el walkthrough.',
  translatedText: 'This is a test story for the walkthrough.',
  fromLanguage: 'es',
  toLanguage: 'en',
  difficulty: 'a1',
  provider: 'test',
  model: 'test-model'
};