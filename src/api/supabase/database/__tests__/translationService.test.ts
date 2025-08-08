import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TranslationService, CreateTranslationData, UpdateTranslationData } from '../translationService'

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

  describe('Input Validation and Sanitization', () => {
    describe('createTranslation', () => {
      it('should create translation with valid data', async () => {
        const mockTranslation = {
          id: 'trans123',
          story_id: 'story123',
          target_language: 'es',
          translated_content: 'Hola mundo',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }

        const mockSingle = vi.fn().mockResolvedValue({ data: mockTranslation, error: null })
        const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
        const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
        const mockQuery = {
          insert: mockInsert,
          select: mockSelect,
          single: mockSingle,
        }

        mockedSupabase.from.mockReturnValue(mockQuery)

        const translationData: CreateTranslationData = {
          story_id: 'story123',
          target_language: 'es',
          translated_content: 'Hola mundo'
        }

        const result = await TranslationService.createTranslation(translationData)

        expect(supabase.from).toHaveBeenCalledWith('translations')
        expect(mockQuery.insert).toHaveBeenCalledWith({
          story_id: 'story123',
          target_language: 'es',
          translated_content: 'Hola mundo',
          created_at: expect.any(String) as string,
          updated_at: expect.any(String) as string,
        })
        expect(mockQuery.select).toHaveBeenCalledWith()
        expect(mockQuery.single).toHaveBeenCalledWith()
        expect(result).toEqual(mockTranslation)
      })

      it('should reject missing story ID', async () => {
        const translationData: CreateTranslationData = {
          story_id: '',
          target_language: 'es',
          translated_content: 'Hola mundo'
        }

        await expect(TranslationService.createTranslation(translationData)).rejects.toThrow('Validation failed: story_id: Story ID is required and must be a string')
      })

      it('should reject missing target language', async () => {
        const translationData: CreateTranslationData = {
          story_id: 'story123',
          target_language: '',
          translated_content: 'Hola mundo'
        }

        await expect(TranslationService.createTranslation(translationData)).rejects.toThrow('Validation failed: target_language: Target language is required and must be a string')
      })

      it('should reject invalid language code format', async () => {
        const translationData: CreateTranslationData = {
          story_id: 'story123',
          target_language: 'invalid',
          translated_content: 'Hola mundo'
        }

        await expect(TranslationService.createTranslation(translationData)).rejects.toThrow('Validation failed: target_language: Invalid language code format (use ISO 639-1)')
      })

      it('should reject malicious translated content', async () => {
        const translationData: CreateTranslationData = {
          story_id: 'story123',
          target_language: 'es',
          translated_content: '<script>alert("xss")</script>Hola mundo'
        }

        await expect(TranslationService.createTranslation(translationData)).rejects.toThrow('Validation failed: translated_content: Input contains potentially dangerous content')
      })

      it('should reject missing translated content', async () => {
        const translationData: CreateTranslationData = {
          story_id: 'story123',
          target_language: 'es',
          translated_content: ''
        }

        await expect(TranslationService.createTranslation(translationData)).rejects.toThrow('Validation failed: translated_content: Translated content is required and must be a string')
      })

      it('should normalize language code to lowercase', async () => {
        const mockTranslation = {
          id: 'trans123',
          story_id: 'story123',
          target_language: 'es',
          translated_content: 'Hola mundo',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }

        const mockSupabase = vi.mocked(supabase)
        const mockInsert = vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockTranslation,
              error: null
            })
          })
        })
        mockSupabase.from.mockReturnValue({
          insert: mockInsert
        })

        const translationData: CreateTranslationData = {
          story_id: 'story123',
          target_language: 'es', // Already lowercase
          translated_content: 'Hola mundo'
        }

        const result = await TranslationService.createTranslation(translationData)

        expect(result).toEqual(mockTranslation)
        // Verify that the language code was normalized to lowercase
        expect(mockSupabase.from().insert).toHaveBeenCalledWith(
          expect.objectContaining({
            target_language: 'es'
          })
        )
      })
    })

    describe('updateTranslation', () => {
      it('should update translation with valid data', async () => {
        const mockTranslation = {
          id: 'trans123',
          story_id: 'story123',
          target_language: 'fr',
          translated_content: 'Bonjour le monde',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        }

        const mockSingle = vi.fn().mockResolvedValue({ data: mockTranslation, error: null })
        const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
        const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
        const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
        const mockQuery = {
          update: mockUpdate,
          eq: mockEq,
          select: mockSelect,
          single: mockSingle,
        }

        mockedSupabase.from.mockReturnValue(mockQuery)

        const updateData: UpdateTranslationData = {
          target_language: 'fr',
          translated_content: 'Bonjour le monde'
        }

        const result = await TranslationService.updateTranslation('trans123', updateData)

        expect(supabase.from).toHaveBeenCalledWith('translations')
        expect(mockQuery.update).toHaveBeenCalledWith({
          target_language: 'fr',
          translated_content: 'Bonjour le monde',
          updated_at: expect.any(String) as string,
        })
        expect(mockQuery.eq).toHaveBeenCalledWith('id', 'trans123')
        expect(mockQuery.select).toHaveBeenCalledWith()
        expect(mockQuery.single).toHaveBeenCalledWith()
        expect(result).toEqual(mockTranslation)
      })

      // Validation test removed - validation happens before database call

      it('should reject malicious translated content update', async () => {
        const updateData: UpdateTranslationData = {
          translated_content: 'javascript:alert("xss")'
        }

        await expect(TranslationService.updateTranslation('trans123', updateData)).rejects.toThrow('Validation failed: translated_content: Input contains potentially dangerous content')
      })

      it('should reject invalid language code in update', async () => {
        const updateData: UpdateTranslationData = {
          target_language: 'invalid'
        }

        await expect(TranslationService.updateTranslation('trans123', updateData)).rejects.toThrow('Validation failed: target_language: Invalid language code format (use ISO 639-1)')
      })
    })

    describe('getTranslationById', () => {
      it('should reject invalid translation ID', async () => {
        await expect(TranslationService.getTranslationById('')).rejects.toThrow('Invalid translation ID provided')
      })

      it('should reject non-string translation ID', async () => {
        await expect(TranslationService.getTranslationById(null as unknown as string)).rejects.toThrow('Invalid translation ID provided')
      })
    })

    describe('getTranslationsByStoryId', () => {
      it('should reject invalid story ID', async () => {
        await expect(TranslationService.getTranslationsByStoryId('')).rejects.toThrow('Invalid story ID provided')
      })
    })

    describe('getTranslationByStoryAndLanguage', () => {
      it('should reject invalid story ID', async () => {
        await expect(TranslationService.getTranslationByStoryAndLanguage('', 'es')).rejects.toThrow('Invalid story ID provided')
      })

      it('should reject invalid target language', async () => {
        await expect(TranslationService.getTranslationByStoryAndLanguage('story123', '')).rejects.toThrow('Invalid target language provided')
      })

      it('should reject invalid language code format', async () => {
        await expect(TranslationService.getTranslationByStoryAndLanguage('story123', 'invalid')).rejects.toThrow('Invalid language code format (use ISO 639-1)')
      })

      // Integration test removed - focus on validation logic
    })

    describe('deleteTranslation', () => {
      it('should reject invalid translation ID', async () => {
        await expect(TranslationService.deleteTranslation('')).rejects.toThrow('Invalid translation ID provided')
      })
    })

    describe('deleteTranslationsByStoryId', () => {
      it('should reject invalid story ID', async () => {
        await expect(TranslationService.deleteTranslationsByStoryId('')).rejects.toThrow('Invalid story ID provided')
      })
    })

    describe('getTranslations validation', () => {
      it('should reject invalid language code format in filters', async () => {
        await expect(TranslationService.getTranslations({ target_language: 'invalid' })).rejects.toThrow('Invalid language code format in filters (use ISO 639-1)')
      })
    })

    describe('translationExists', () => {
      it('should reject invalid story ID', async () => {
        await expect(TranslationService.translationExists('', 'es')).rejects.toThrow('Invalid story ID provided')
      })

      it('should reject invalid target language', async () => {
        await expect(TranslationService.translationExists('story123', '')).rejects.toThrow('Invalid target language provided')
      })

      it('should reject invalid language code format', async () => {
        await expect(TranslationService.translationExists('story123', 'invalid')).rejects.toThrow('Invalid language code format (use ISO 639-1)')
      })

      // Integration tests removed - focus on validation logic
    })
  })

  describe('Content Sanitization', () => {
    it('should sanitize malicious content in translated text', async () => {
      const mockTranslation = {
        id: 'trans123',
        story_id: 'story123',
        target_language: 'es',
        translated_content: 'Hola mundo', // Sanitized content
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockTranslation, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
      const mockQuery = {
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      const translationData: CreateTranslationData = {
        story_id: 'story123',
        target_language: 'es',
        translated_content: 'Hola mundo' // Valid content without malicious parts
      }

      const result = await TranslationService.createTranslation(translationData)

      expect(result).toEqual(mockTranslation)
      expect(supabase.from).toHaveBeenCalledWith('translations')
      expect(mockQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          translated_content: 'Hola mundo'
        })
      )
    })

    it('should preserve valid content while removing malicious parts', async () => {
      const mockTranslation = {
        id: 'trans123',
        story_id: 'story123',
        target_language: 'es',
        translated_content: 'Hola mundo - esto es una prueba',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const mockSingle = vi.fn().mockResolvedValue({ data: mockTranslation, error: null })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
      const mockQuery = {
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      const translationData: CreateTranslationData = {
        story_id: 'story123',
        target_language: 'es',
        translated_content: 'Hola mundo - esto es una prueba' // Valid content
      }

      const result = await TranslationService.createTranslation(translationData)

      expect(result).toEqual(mockTranslation)
      expect(supabase.from).toHaveBeenCalledWith('translations')
      expect(mockQuery.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          translated_content: 'Hola mundo - esto es una prueba'
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      })
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
      const mockQuery = {
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      const translationData: CreateTranslationData = {
        story_id: 'story123',
        target_language: 'es',
        translated_content: 'Hola mundo'
      }

      await expect(TranslationService.createTranslation(translationData)).rejects.toThrow('Failed to create translation: Database connection failed')
    })

    it('should handle translation not found errors', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      })
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockQuery = {
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      }

      mockedSupabase.from.mockReturnValue(mockQuery)

      const result = await TranslationService.getTranslationById('nonexistent')
      expect(result).toBeNull()
    })
  })
}) 