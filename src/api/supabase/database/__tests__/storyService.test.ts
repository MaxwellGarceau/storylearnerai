import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StoryService, CreateStoryData, UpdateStoryData } from '../storyService'


// Mock the entire supabase client module
vi.mock('../../client', () => {
  const mockFrom = vi.fn()
  return {
    supabase: {
      from: mockFrom,
    },
  }
})

// Import after mocking
import { supabase } from '../../client'

// Type the mocked supabase
const mockedSupabase = vi.mocked(supabase) as any

describe('StoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createStory', () => {
    it('should create a story successfully', async () => {
      const mockStory = {
        id: '1',
        title: 'Test Story',
        content: 'Test content',
        language: 'en',
        difficulty_level: 'beginner' as const,
        user_id: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockStory, error: null }),
      };

      mockedSupabase.from.mockReturnValue(mockQuery)

      const storyData: CreateStoryData = {
        title: 'Test Story',
        content: 'Test content',
        language: 'en',
        difficulty_level: 'beginner',
        user_id: 'user-1',
      }

      const result = await StoryService.createStory(storyData)

      expect(supabase.from).toHaveBeenCalledWith('stories')
      expect(mockQuery.insert).toHaveBeenCalledWith({
        title: 'Test Story',
        content: 'Test content',
        language: 'en',
        difficulty_level: 'beginner',
        user_id: 'user-1',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
      expect(mockQuery.select).toHaveBeenCalled()
      expect(mockQuery.single).toHaveBeenCalled()
      expect(result).toEqual(mockStory)
    })

    it('should throw error when story creation fails', async () => {
      const mockError = { message: 'Database error' }
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      const storyData: CreateStoryData = {
        title: 'Test Story',
        content: 'Test content',
        language: 'en',
        difficulty_level: 'beginner',
      }

      await expect(StoryService.createStory(storyData)).rejects.toThrow(
        'Failed to create story: Database error'
      )
    })
  })

  describe('getStoryById', () => {
    it('should return a story when found', async () => {
      const mockStory = {
        id: '1',
        title: 'Test Story',
        content: 'Test content',
        language: 'en',
        difficulty_level: 'beginner' as const,
        user_id: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockStory, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      const result = await StoryService.getStoryById('1')

      expect(supabase.from).toHaveBeenCalledWith('stories')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
      expect(mockQuery.single).toHaveBeenCalled()
      expect(result).toEqual(mockStory)
    })

    it('should return null when story not found', async () => {
      const mockError = { code: 'PGRST116', message: 'Not found' }
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      const result = await StoryService.getStoryById('999')

      expect(result).toBeNull()
    })

    it('should throw error for other database errors', async () => {
      const mockError = { message: 'Database error' }
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      await expect(StoryService.getStoryById('1')).rejects.toThrow(
        'Failed to fetch story: Database error'
      )
    })
  })

  describe('getStories', () => {
    it('should return all stories when no filters provided', async () => {
      const mockStories = [
        {
          id: '1',
          title: 'Story 1',
          content: 'Content 1',
          language: 'en',
          difficulty_level: 'beginner' as const,
          user_id: 'user-1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Story 2',
          content: 'Content 2',
          language: 'es',
          difficulty_level: 'intermediate' as const,
          user_id: 'user-2',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockStories, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      const result = await StoryService.getStories()

      expect(supabase.from).toHaveBeenCalledWith('stories')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockStories)
    })

    it('should apply language filter', async () => {
      const mockStories = [
        {
          id: '1',
          title: 'English Story',
          content: 'English content',
          language: 'en',
          difficulty_level: 'beginner' as const,
          user_id: 'user-1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockStories, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      const result = await StoryService.getStories({ language: 'en' })

      expect(mockQuery.eq).toHaveBeenCalledWith('language', 'en')
      expect(result).toEqual(mockStories)
    })

    it('should apply multiple filters', async () => {
      const mockStories: any[] = []
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockStories, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      await StoryService.getStories({
        language: 'en',
        difficulty_level: 'beginner',
        user_id: 'user-1',
      })

      expect(mockQuery.eq).toHaveBeenCalledWith('language', 'en')
      expect(mockQuery.eq).toHaveBeenCalledWith('difficulty_level', 'beginner')
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-1')
    })

    it('should return empty array when no stories found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      const result = await StoryService.getStories()

      expect(result).toEqual([])
    })

    it('should throw error when database query fails', async () => {
      const mockError = { message: 'Database error' }
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      await expect(StoryService.getStories()).rejects.toThrow(
        'Failed to fetch stories: Database error'
      )
    })
  })

  describe('updateStory', () => {
    it('should update a story successfully', async () => {
      const mockUpdatedStory = {
        id: '1',
        title: 'Updated Story',
        content: 'Updated content',
        language: 'en',
        difficulty_level: 'intermediate' as const,
        user_id: 'user-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdatedStory, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      const updateData: UpdateStoryData = {
        title: 'Updated Story',
        difficulty_level: 'intermediate',
      }

      const result = await StoryService.updateStory('1', updateData)

      expect(supabase.from).toHaveBeenCalledWith('stories')
      expect(mockQuery.update).toHaveBeenCalledWith({
        title: 'Updated Story',
        difficulty_level: 'intermediate',
        updated_at: expect.any(String),
      })
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
      expect(mockQuery.select).toHaveBeenCalled()
      expect(mockQuery.single).toHaveBeenCalled()
      expect(result).toEqual(mockUpdatedStory)
    })

    it('should throw error when story update fails', async () => {
      const mockError = { message: 'Update failed' }
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      const updateData: UpdateStoryData = {
        title: 'Updated Story',
      }

      await expect(StoryService.updateStory('1', updateData)).rejects.toThrow(
        'Failed to update story: Update failed'
      )
    })
  })

  describe('deleteStory', () => {
    it('should delete a story successfully', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      await StoryService.deleteStory('1')

      expect(supabase.from).toHaveBeenCalledWith('stories')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
    })

    it('should throw error when story deletion fails', async () => {
      const mockError = { message: 'Delete failed' }
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      await expect(StoryService.deleteStory('1')).rejects.toThrow(
        'Failed to delete story: Delete failed'
      )
    })
  })

  describe('searchStories', () => {
    it('should search stories by title or content', async () => {
      const mockStories = [
        {
          id: '1',
          title: 'Test Story',
          content: 'Test content',
          language: 'en',
          difficulty_level: 'beginner' as const,
          user_id: 'user-1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockStories, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      const result = await StoryService.searchStories('test')

      expect(supabase.from).toHaveBeenCalledWith('stories')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.or).toHaveBeenCalledWith('title.ilike.%test%,content.ilike.%test%')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockStories)
    })

    it('should return empty array when no search results found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      const result = await StoryService.searchStories('nonexistent')

      expect(result).toEqual([])
    })

    it('should throw error when search fails', async () => {
      const mockError = { message: 'Search failed' }
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      await expect(StoryService.searchStories('test')).rejects.toThrow(
        'Failed to search stories: Search failed'
      )
    })
  })

  describe('getStoriesByDifficulty', () => {
    it('should return stories filtered by difficulty level', async () => {
      const mockStories = [
        {
          id: '1',
          title: 'Beginner Story',
          content: 'Simple content',
          language: 'en',
          difficulty_level: 'beginner' as const,
          user_id: 'user-1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockStories, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      const result = await StoryService.getStoriesByDifficulty('beginner')

      expect(supabase.from).toHaveBeenCalledWith('stories')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('difficulty_level', 'beginner')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockStories)
    })

    it('should throw error when query fails', async () => {
      const mockError = { message: 'Query failed' }
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      await expect(StoryService.getStoriesByDifficulty('beginner')).rejects.toThrow(
        'Failed to fetch stories by difficulty: Query failed'
      )
    })
  })

  describe('getStoriesByLanguage', () => {
    it('should return stories filtered by language', async () => {
      const mockStories = [
        {
          id: '1',
          title: 'Spanish Story',
          content: 'Contenido en español',
          language: 'es',
          difficulty_level: 'intermediate' as const,
          user_id: 'user-1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockStories, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      const result = await StoryService.getStoriesByLanguage('es')

      expect(supabase.from).toHaveBeenCalledWith('stories')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('language', 'es')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockStories)
    })

    it('should throw error when query fails', async () => {
      const mockError = { message: 'Query failed' }
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      await expect(StoryService.getStoriesByLanguage('es')).rejects.toThrow(
        'Failed to fetch stories by language: Query failed'
      )
    })
  })
})