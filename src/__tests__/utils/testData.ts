import type { TranslationResponse } from '../../lib/translationService';
import type { DatabaseStory } from '../../types/database';

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

// Test data creation utilities
const createDummyStory = (overrides: Partial<DatabaseStory> = {}): DatabaseStory => {
  const now = new Date().toISOString();
  return {
    id: 'test-story-id',
    title: 'Test Story',
    content: 'This is a test story content.',
    language: 'en',
    difficulty_level: 'a1',
    user_id: 'test-user-id',
    created_at: now,
    updated_at: now,
    ...overrides
  };
};