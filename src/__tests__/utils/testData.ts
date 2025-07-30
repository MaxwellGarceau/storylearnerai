import type { 
  Language, 
  DifficultyLevel, 
  User, 
  Story, 
  Translation, 
  SavedTranslation,
  SavedTranslationWithDetails 
} from '../../lib/types/database'
import type { TranslationResponse } from '../../lib/translationService';

// Dummy data for tests
export const dummyLanguages: Language[] = [
  {
    id: '1',
    code: 'en',
    name: 'English',
    native_name: 'English',
    created_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    code: 'es',
    name: 'Spanish',
    native_name: 'Español',
    created_at: '2023-01-01T00:00:00Z'
  }
]

export const dummyDifficultyLevels: DifficultyLevel[] = [
  {
    id: '1',
    code: 'beginner',
    name: 'Beginner',
    description: 'Simple vocabulary and grammar, suitable for language learners',
    created_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    code: 'intermediate',
    name: 'Intermediate',
    description: 'Moderate complexity with varied sentence structures',
    created_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '3',
    code: 'advanced',
    name: 'Advanced',
    description: 'Complex vocabulary and grammar, suitable for fluent speakers',
    created_at: '2023-01-01T00:00:00Z'
  }
]

export const dummyUser: User = {
  id: 'test-user-id',
  username: 'testuser',
  display_name: 'Test User',
  avatar_url: null,
  preferred_language: 'en',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

export const dummyStory: Story = {
  id: 'story-1',
  title: 'The Little Red Hen',
  content: 'Once upon a time, there was a little red hen who lived on a farm...',
  language: 'en',
  difficulty_level: 'beginner',
  user_id: null,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

export const dummyTranslation: Translation = {
  id: 'translation-1',
  story_id: 'story-1',
  target_language: 'es',
  translated_content: 'Érase una vez, había una pequeña gallina roja que vivía en una granja...',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

export const dummySavedTranslation: SavedTranslation = {
  id: 'saved-translation-1',
  user_id: 'test-user-id',
  original_story: 'Once upon a time, there was a little red hen...',
  translated_story: 'Érase una vez, había una pequeña gallina roja...',
  original_language_id: '1', // English
  translated_language_id: '2', // Spanish
  difficulty_level_id: '1', // Beginner
  title: 'My First Translation',
  notes: 'This is my first saved translation',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

export const dummySavedTranslationWithDetails: SavedTranslationWithDetails = {
  ...dummySavedTranslation,
  original_language: dummyLanguages[0], // English
  translated_language: dummyLanguages[1], // Spanish
  difficulty_level: dummyDifficultyLevels[0] // Beginner
}

// Helper functions for creating test data
export const createDummyLanguage = (overrides: Partial<Language> = {}): Language => ({
  id: 'test-lang-id',
  code: 'en',
  name: 'English',
  native_name: 'English',
  created_at: '2023-01-01T00:00:00Z',
  ...overrides
})

export const createDummyDifficultyLevel = (overrides: Partial<DifficultyLevel> = {}): DifficultyLevel => ({
  id: 'test-difficulty-id',
  code: 'beginner',
  name: 'Beginner',
  description: 'Simple vocabulary and grammar',
  created_at: '2023-01-01T00:00:00Z',
  ...overrides
})

export const createDummyUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-id',
  username: 'testuser',
  display_name: 'Test User',
  avatar_url: null,
  preferred_language: 'en',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides
})

export const createDummyStory = (overrides: Partial<Story> = {}): Story => ({
  id: 'test-story-id',
  title: 'Test Story',
  content: 'This is a test story content.',
  language: 'en',
  difficulty_level: 'beginner',
  user_id: null,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides
})

export const createDummyTranslation = (overrides: Partial<Translation> = {}): Translation => ({
  id: 'test-translation-id',
  story_id: 'test-story-id',
  target_language: 'es',
  translated_content: 'Este es el contenido de la historia de prueba.',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides
})

export const createDummySavedTranslation = (overrides: Partial<SavedTranslation> = {}): SavedTranslation => ({
  id: 'test-saved-translation-id',
  user_id: 'test-user-id',
  original_story: 'This is the original story.',
  translated_story: 'Esta es la historia original.',
  original_language_id: '1',
  translated_language_id: '2',
  difficulty_level_id: '1',
  title: 'Test Saved Translation',
  notes: 'Test notes',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides
})

export const createDummySavedTranslationWithDetails = (
  overrides: Partial<SavedTranslationWithDetails> = {}
): SavedTranslationWithDetails => ({
  ...createDummySavedTranslation(),
  original_language: createDummyLanguage(),
  translated_language: createDummyLanguage({ code: 'es', name: 'Spanish', native_name: 'Español' }),
  difficulty_level: createDummyDifficultyLevel(),
  ...overrides
}) 

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