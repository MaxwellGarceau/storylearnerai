import { describe, it, expect, beforeEach } from 'vitest'
import { createDefaultTestClient } from '@/__tests__/test-utils/e2e/supabase-test-client'
import { getTestDatabase } from '@/__tests__/test-utils/e2e/test-setup'
import { StoryService } from '@/api/supabase/database/storyService'

// Import the test setup to ensure Supabase test instance is running
import '@/__tests__/test-utils/e2e/test-setup'

describe('Basic E2E Integration Test', () => {
  let testDb: ReturnType<typeof getTestDatabase>
  let supabaseClient: ReturnType<typeof createDefaultTestClient>

  beforeEach(async () => {
    testDb = getTestDatabase()
    supabaseClient = createDefaultTestClient()
    
    // Ensure clean state
    await testDb.clearAllData()
  })

  it('should save a new story to the database', async () => {
    // Arrange
    const newStory = {
      title: 'Test Story',
      content: 'This is a test story content.',
      language: 'en',
      difficulty_level: 'beginner' as const
    }

    // Act
    const result = await StoryService.createStory(newStory)

    // Assert
    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
    expect(result.title).toBe(newStory.title)
    expect(result.content).toBe(newStory.content)
    expect(result.language).toBe(newStory.language)
    expect(result.difficulty_level).toBe(newStory.difficulty_level)
    expect(result.created_at).toBeDefined()
    expect(result.updated_at).toBeDefined()

    // Verify the story was actually saved to the database
    const retrievedStory = await StoryService.getStoryById(result.id)
    expect(retrievedStory).toBeDefined()
    expect(retrievedStory?.id).toBe(result.id)
    expect(retrievedStory?.title).toBe(newStory.title)
  })
}) 