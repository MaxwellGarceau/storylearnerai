import type { TranslationResponse } from '../../lib/translationService';
import { FallbackTokenGenerator } from '../../lib/llm/tokens';

// Test translation data for walkthrough testing
export const testWalkthroughTranslationData: TranslationResponse = {
  fromText: 'Esta es una historia de prueba para el walkthrough.',
  toText: 'This is a test story for the walkthrough.',
  tokens: FallbackTokenGenerator.generateTokens(
    'This is a test story for the walkthrough.'
  ),
  fromLanguage: 'es',
  toLanguage: 'en',
  difficulty: 'a1',
  provider: 'test',
  model: 'test-model',
  usedFallbackTokens: true,
};
