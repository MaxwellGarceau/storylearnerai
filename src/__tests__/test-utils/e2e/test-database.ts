import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/api/supabase/client'
import { createDefaultTestAdminClient } from './supabase-test-client'

export interface TestStory {
  id?: string
  title: string
  content: string
  language: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  user_id?: string
}

export interface TestTranslation {
  id?: string
  story_id: string
  target_language: string
  translated_content: string
}

/**
 * Test database manager for E2E integration tests
 * Handles setup, teardown, and data seeding
 */
export class TestDatabase {
  private adminClient: SupabaseClient<Database>
  private testData: {
      stories: TestStory[]
      translations: TestTranslation[]
    } = {
      stories: [],
      translations: []
    }

  constructor(adminClient?: SupabaseClient<Database>) {
    this.adminClient = adminClient || createDefaultTestAdminClient()
  }

  /**
   * Clears all data from the test database
   * This ensures a clean state for each test
   */
  async clearAllData(): Promise<void> {
    try {
      // Delete in order to respect foreign key constraints
      await this.adminClient.from('translations').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await this.adminClient.from('stories').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      
      // Reset sequences if they exist
      await this.adminClient.rpc('reset_sequences')
    } catch (error) {
      console.warn('Error clearing test data:', error)
    }
  }

  /**
   * Seeds the database with test data
   * @param stories - Array of test stories to insert
   * @param translations - Array of test translations to insert
   */
  async seedTestData(stories: TestStory[] = [], translations: TestTranslation[] = []): Promise<void> {
    this.testData.stories = stories
    this.testData.translations = translations

    // Insert stories first
    if (stories.length > 0) {
      const { data: insertedStories, error: storiesError } = await this.adminClient
        .from('stories')
        .insert(stories)
        .select()

      if (storiesError) {
        throw new Error(`Failed to seed stories: ${storiesError.message}`)
      }

      // Update test data with actual IDs
      this.testData.stories = insertedStories || []
    }

    // Insert translations
    if (translations.length > 0) {
      const { error: translationsError } = await this.adminClient
        .from('translations')
        .insert(translations)

      if (translationsError) {
        throw new Error(`Failed to seed translations: ${translationsError.message}`)
      }
    }
  }

  /**
   * Gets the seeded test data
   */
  getTestData() {
    return this.testData
  }

  /**
   * Creates a test story with default values
   */
  createTestStory(overrides: Partial<TestStory> = {}): TestStory {
    return {
      title: 'Test Story',
      content: 'This is a test story content.',
      language: 'en',
      difficulty_level: 'beginner',
      ...overrides
    }
  }

  /**
   * Creates a test translation with default values
   */
  createTestTranslation(storyId: string, overrides: Partial<TestTranslation> = {}): TestTranslation {
    return {
      story_id: storyId,
      target_language: 'es',
      translated_content: 'Este es el contenido de la historia de prueba.',
      ...overrides
    }
  }

  /**
   * Sets up the database for a test
   * Clears existing data and optionally seeds new data
   */
  async setup(stories: TestStory[] = [], translations: TestTranslation[] = []): Promise<void> {
    await this.clearAllData()
    if (stories.length > 0 || translations.length > 0) {
      await this.seedTestData(stories, translations)
    }
  }

  /**
   * Cleans up the database after a test
   */
  async teardown(): Promise<void> {
    await this.clearAllData()
  }
}

/**
 * Factory function to create a test database instance
 */
export function createTestDatabase(adminClient?: SupabaseClient<Database>): TestDatabase {
  return new TestDatabase(adminClient)
}

/**
 * Default test stories for common test scenarios
 */
export const defaultTestStories: TestStory[] = [
  {
    title: 'The Test Story',
    content: 'This is a test story for integration testing.',
    language: 'en',
    difficulty_level: 'beginner'
  },
  {
    title: 'La Historia de Prueba',
    content: 'Esta es una historia de prueba para pruebas de integración.',
    language: 'es',
    difficulty_level: 'intermediate'
  }
]

/**
 * Default test translations for common test scenarios
 */
export const createDefaultTestTranslations = (storyIds: string[]): TestTranslation[] => [
  {
    story_id: storyIds[0],
    target_language: 'es',
    translated_content: 'Esta es una historia de prueba para pruebas de integración.'
  },
  {
    story_id: storyIds[0],
    target_language: 'fr',
    translated_content: 'Ceci est une histoire de test pour les tests d\'intégration.'
  }
] 