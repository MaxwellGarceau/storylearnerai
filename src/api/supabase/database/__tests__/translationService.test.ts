/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TranslationService, CreateTranslationData, UpdateTranslationData } from '../translationService'
import { supabase } from '../../client'

// Mock Supabase client
vi.mock('../../client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            data: [],
            error: null
          })),
          eq: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn()
      })),
      order: vi.fn(() => ({
        data: [],
        error: null
      })),
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null
        }))
      }))
    }))
  }
}))

describe('TranslationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
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

        const mockSupabase = supabase as any
        mockSupabase.from.mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockTranslation,
                error: null
              })
            })
          })
        })

        const translationData: CreateTranslationData = {
          story_id: 'story123',
          target_language: 'es',
          translated_content: 'Hola mundo'
        }

        const result = await TranslationService.createTranslation(translationData)

        expect(result).toEqual(mockTranslation)
        expect(mockSupabase.from).toHaveBeenCalledWith('translations')
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

         const mockSupabase = supabase as any
         mockSupabase.from.mockReturnValue({
           insert: vi.fn().mockReturnValue({
             select: vi.fn().mockReturnValue({
               single: vi.fn().mockResolvedValue({
                 data: mockTranslation,
                 error: null
               })
             })
           })
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

        const mockSupabase = supabase as any
        mockSupabase.from.mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockTranslation,
                  error: null
                })
              })
            })
          })
        })

        const updateData: UpdateTranslationData = {
          target_language: 'fr',
          translated_content: 'Bonjour le monde'
        }

        const result = await TranslationService.updateTranslation('trans123', updateData)

        expect(result).toEqual(mockTranslation)
      })

      it('should reject invalid translation ID', async () => {
        const updateData: UpdateTranslationData = {
          target_language: 'fr'
        }

        await expect(TranslationService.updateTranslation('', updateData)).rejects.toThrow('Invalid translation ID provided')
      })

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
        await expect(TranslationService.getTranslationById(null as any)).rejects.toThrow('Invalid translation ID provided')
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

      it('should return translation for valid parameters', async () => {
        const mockTranslation = {
          id: 'trans123',
          story_id: 'story123',
          target_language: 'es',
          translated_content: 'Hola mundo',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }

        const mockSupabase = supabase as any
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockTranslation,
                error: null
              })
            })
          })
        })

        const result = await TranslationService.getTranslationByStoryAndLanguage('story123', 'es')
        expect(result).toEqual(mockTranslation)
      })
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

    describe('getTranslations', () => {
      it('should reject invalid story ID in filters', async () => {
        await expect(TranslationService.getTranslations({ story_id: '' })).rejects.toThrow('Invalid story ID in filters')
      })

      it('should reject invalid target language in filters', async () => {
        await expect(TranslationService.getTranslations({ target_language: '' })).rejects.toThrow('Invalid target language in filters')
      })

      it('should reject invalid language code format in filters', async () => {
        await expect(TranslationService.getTranslations({ target_language: 'invalid' })).rejects.toThrow('Invalid language code format in filters (use ISO 639-1)')
      })

      it('should return translations with valid filters', async () => {
        const mockTranslations = [
          {
            id: 'trans123',
            story_id: 'story123',
            target_language: 'es',
            translated_content: 'Hola mundo',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]

        const mockSupabase = supabase as any
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockTranslations,
                error: null
              })
            })
          })
        })

        const result = await TranslationService.getTranslations({ story_id: 'story123', target_language: 'es' })
        expect(result).toEqual(mockTranslations)
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

      it('should return true when translation exists', async () => {
        const mockSupabase = supabase as any
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'trans123' },
                error: null
              })
            })
          })
        })

        const result = await TranslationService.translationExists('story123', 'es')
        expect(result).toBe(true)
      })

      it('should return false when translation does not exist', async () => {
        const mockSupabase = supabase as any
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
              })
            })
          })
        })

        const result = await TranslationService.translationExists('story123', 'es')
        expect(result).toBe(false)
      })
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

       const mockSupabase = supabase as any
       mockSupabase.from.mockReturnValue({
         insert: vi.fn().mockReturnValue({
           select: vi.fn().mockReturnValue({
             single: vi.fn().mockResolvedValue({
               data: mockTranslation,
               error: null
             })
           })
         })
       })

       const translationData: CreateTranslationData = {
         story_id: 'story123',
         target_language: 'es',
         translated_content: 'Hola mundo' // Valid content without malicious parts
       }

       const result = await TranslationService.createTranslation(translationData)

       expect(result).toEqual(mockTranslation)
       // Verify that the content was processed correctly
       expect(mockSupabase.from().insert).toHaveBeenCalledWith(
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

       const mockSupabase = supabase as any
       mockSupabase.from.mockReturnValue({
         insert: vi.fn().mockReturnValue({
           select: vi.fn().mockReturnValue({
             single: vi.fn().mockResolvedValue({
               data: mockTranslation,
               error: null
             })
           })
         })
       })

       const translationData: CreateTranslationData = {
         story_id: 'story123',
         target_language: 'es',
         translated_content: 'Hola mundo - esto es una prueba' // Valid content
       }

       const result = await TranslationService.createTranslation(translationData)

       expect(result).toEqual(mockTranslation)
       // Verify that valid content was preserved
       expect(mockSupabase.from().insert).toHaveBeenCalledWith(
         expect.objectContaining({
           translated_content: 'Hola mundo - esto es una prueba'
         })
       )
     })
   })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const mockSupabase = supabase as any
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection failed' }
            })
          })
        })
      })

      const translationData: CreateTranslationData = {
        story_id: 'story123',
        target_language: 'es',
        translated_content: 'Hola mundo'
      }

      await expect(TranslationService.createTranslation(translationData)).rejects.toThrow('Failed to create translation: Database connection failed')
    })

    it('should handle translation not found errors', async () => {
      const mockSupabase = supabase as any
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      })

      const result = await TranslationService.getTranslationById('nonexistent')
      expect(result).toBeNull()
    })
  })
}) 