import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TranslationService, CreateTranslationData, UpdateTranslationData } from '../translationService'
import type { PostgrestQueryBuilder } from '@supabase/postgrest-js'

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
const mockedSupabase = vi.mocked(supabase)

describe('TranslationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createTranslation', () => {
    it('should create a translation successfully', async () => {
      const mockTranslation = {
        id: '1',
        story_id: 'story-1',
        target_language: 'es',
        translated_content: 'Contenido traducido',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTranslation, error: null }),
        }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      const translationData: CreateTranslationData = {
        story_id: 'story-1',
        target_language: 'es',
        translated_content: 'Contenido traducido',
      }

      const result = await TranslationService.createTranslation(translationData)

      expect(supabase.from).toHaveBeenCalledWith('translations')
      expect(mockQuery.insert).toHaveBeenCalledWith({
        story_id: 'story-1',
        target_language: 'es',
        translated_content: 'Contenido traducido',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
      expect(mockQuery.select).toHaveBeenCalled()
      expect(mockQuery.single).toHaveBeenCalled()
      expect(result).toEqual(mockTranslation)
    })

    it('should throw error when translation creation fails', async () => {
      const mockError = { message: 'Database error' }
      const mockQuery = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      const translationData: CreateTranslationData = {
        story_id: 'story-1',
        target_language: 'es',
        translated_content: 'Contenido traducido',
      }

      await expect(TranslationService.createTranslation(translationData)).rejects.toThrow(
        'Failed to create translation: Database error'
      )
    })
  })

  describe('getTranslationById', () => {
    it('should return a translation when found', async () => {
      const mockTranslation = {
        id: '1',
        story_id: 'story-1',
        target_language: 'es',
        translated_content: 'Contenido traducido',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTranslation, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      const result = await TranslationService.getTranslationById('1')

      expect(supabase.from).toHaveBeenCalledWith('translations')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
      expect(mockQuery.single).toHaveBeenCalled()
      expect(result).toEqual(mockTranslation)
    })

    it('should return null when translation not found', async () => {
      const mockError = { code: 'PGRST116', message: 'Not found' }
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      const result = await TranslationService.getTranslationById('999')

      expect(result).toBeNull()
    })

    it('should throw error for other database errors', async () => {
      const mockError = { message: 'Database error' }
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      await expect(TranslationService.getTranslationById('1')).rejects.toThrow(
        'Failed to fetch translation: Database error'
      )
    })
  })

  describe('getTranslationsByStoryId', () => {
    it('should return translations for a specific story', async () => {
      const mockTranslations = [
        {
          id: '1',
          story_id: 'story-1',
          target_language: 'es',
          translated_content: 'Contenido en español',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          story_id: 'story-1',
          target_language: 'fr',
          translated_content: 'Contenu en français',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockTranslations, error: null }),
        }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      const result = await TranslationService.getTranslationsByStoryId('story-1')

      expect(supabase.from).toHaveBeenCalledWith('translations')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('story_id', 'story-1')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockTranslations)
    })

    it('should return empty array when no translations found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      const result = await TranslationService.getTranslationsByStoryId('story-999')

      expect(result).toEqual([])
    })

    it('should throw error when database query fails', async () => {
      const mockError = { message: 'Database error' }
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      await expect(TranslationService.getTranslationsByStoryId('story-1')).rejects.toThrow(
        'Failed to fetch translations: Database error'
      )
    })
  })

  describe('getTranslationByStoryAndLanguage', () => {
    it('should return a translation when found', async () => {
      const mockTranslation = {
        id: '1',
        story_id: 'story-1',
        target_language: 'es',
        translated_content: 'Contenido traducido',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockTranslation, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      const result = await TranslationService.getTranslationByStoryAndLanguage('story-1', 'es')

      expect(supabase.from).toHaveBeenCalledWith('translations')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.eq).toHaveBeenCalledWith('story_id', 'story-1')
      expect(mockQuery.eq).toHaveBeenCalledWith('target_language', 'es')
      expect(mockQuery.single).toHaveBeenCalled()
      expect(result).toEqual(mockTranslation)
    })

    it('should return null when translation not found', async () => {
      const mockError = { code: 'PGRST116', message: 'Not found' }
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      const result = await TranslationService.getTranslationByStoryAndLanguage('story-1', 'fr')

      expect(result).toBeNull()
    })

    it('should throw error for other database errors', async () => {
      const mockError = { message: 'Database error' }
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      await expect(TranslationService.getTranslationByStoryAndLanguage('story-1', 'es')).rejects.toThrow(
        'Failed to fetch translation: Database error'
      )
    })
  })

  describe('updateTranslation', () => {
    it('should update a translation successfully', async () => {
      const mockUpdatedTranslation = {
        id: '1',
        story_id: 'story-1',
        target_language: 'es',
        translated_content: 'Contenido actualizado',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      }

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdatedTranslation, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      const updateData: UpdateTranslationData = {
        translated_content: 'Contenido actualizado',
      }

      const result = await TranslationService.updateTranslation('1', updateData)

      expect(supabase.from).toHaveBeenCalledWith('translations')
      expect(mockQuery.update).toHaveBeenCalledWith({
        translated_content: 'Contenido actualizado',
        updated_at: expect.any(String),
      })
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
      expect(mockQuery.select).toHaveBeenCalled()
      expect(mockQuery.single).toHaveBeenCalled()
      expect(result).toEqual(mockUpdatedTranslation)
    })

    it('should throw error when translation update fails', async () => {
      const mockError = { message: 'Update failed' }
      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      const updateData: UpdateTranslationData = {
        translated_content: 'Contenido actualizado',
      }

      await expect(TranslationService.updateTranslation('1', updateData)).rejects.toThrow(
        'Failed to update translation: Update failed'
      )
    })
  })

  describe('deleteTranslation', () => {
    it('should delete a translation successfully', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      await TranslationService.deleteTranslation('1')

      expect(supabase.from).toHaveBeenCalledWith('translations')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '1')
    })

    it('should throw error when translation deletion fails', async () => {
      const mockError = { message: 'Delete failed' }
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      await expect(TranslationService.deleteTranslation('1')).rejects.toThrow(
        'Failed to delete translation: Delete failed'
      )
    })
  })

  describe('deleteTranslationsByStoryId', () => {
    it('should delete all translations for a story successfully', async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      await TranslationService.deleteTranslationsByStoryId('story-1')

      expect(supabase.from).toHaveBeenCalledWith('translations')
      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('story_id', 'story-1')
    })

    it('should throw error when deletion fails', async () => {
      const mockError = { message: 'Delete failed' }
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: mockError }),
      } as unknown as PostgrestQueryBuilder<any, any, string, unknown>

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      await expect(TranslationService.deleteTranslationsByStoryId('story-1')).rejects.toThrow(
        'Failed to delete translations for story: Delete failed'
      )
    })
  })

  describe('getTranslations', () => {
    it('should return all translations when no filters provided', async () => {
      const mockTranslations = [
        {
          id: '1',
          story_id: 'story-1',
          target_language: 'es',
          translated_content: 'Contenido en español',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          story_id: 'story-2',
          target_language: 'fr',
          translated_content: 'Contenu en français',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockTranslations, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      const result = await TranslationService.getTranslations()

      expect(supabase.from).toHaveBeenCalledWith('translations')
      expect(mockQuery.select).toHaveBeenCalledWith('*')
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockTranslations)
    })

    it('should apply story_id filter', async () => {
      const mockTranslations = [
        {
          id: '1',
          story_id: 'story-1',
          target_language: 'es',
          translated_content: 'Contenido en español',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockTranslations, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      const result = await TranslationService.getTranslations({ story_id: 'story-1' })

      expect(mockQuery.eq).toHaveBeenCalledWith('story_id', 'story-1')
      expect(result).toEqual(mockTranslations)
    })

    it('should apply target_language filter', async () => {
      const mockTranslations = [
        {
          id: '1',
          story_id: 'story-1',
          target_language: 'es',
          translated_content: 'Contenido en español',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockTranslations, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      const result = await TranslationService.getTranslations({ target_language: 'es' })

      expect(mockQuery.eq).toHaveBeenCalledWith('target_language', 'es')
      expect(result).toEqual(mockTranslations)
    })

    it('should apply multiple filters', async () => {
      const mockTranslations: any[] = []
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockTranslations, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      await TranslationService.getTranslations({
        story_id: 'story-1',
        target_language: 'es',
      })

      expect(mockQuery.eq).toHaveBeenCalledWith('story_id', 'story-1')
      expect(mockQuery.eq).toHaveBeenCalledWith('target_language', 'es')
    })

    it('should return empty array when no translations found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      const result = await TranslationService.getTranslations()

      expect(result).toEqual([])
    })

    it('should throw error when database query fails', async () => {
      const mockError = { message: 'Database error' }
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      await expect(TranslationService.getTranslations()).rejects.toThrow(
        'Failed to fetch translations: Database error'
      )
    })
  })

  describe('translationExists', () => {
    it('should return true when translation exists', async () => {
      const mockData = { id: '1' }
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      const result = await TranslationService.translationExists('story-1', 'es')

      expect(supabase.from).toHaveBeenCalledWith('translations')
      expect(mockQuery.select).toHaveBeenCalledWith('id')
      expect(mockQuery.eq).toHaveBeenCalledWith('story_id', 'story-1')
      expect(mockQuery.eq).toHaveBeenCalledWith('target_language', 'es')
      expect(mockQuery.single).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should return false when translation does not exist', async () => {
      const mockError = { code: 'PGRST116', message: 'Not found' }
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      const result = await TranslationService.translationExists('story-1', 'fr')

      expect(result).toBe(false)
    })

    it('should throw error for other database errors', async () => {
      const mockError = { message: 'Database error' }
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      mockedSupabase.from.mockReturnValue(mockQuery as unknown as PostgrestQueryBuilder<any, any, string, unknown>)

      await expect(TranslationService.translationExists('story-1', 'es')).rejects.toThrow(
        'Failed to check translation existence: Database error'
      )
    })
  })
}) 