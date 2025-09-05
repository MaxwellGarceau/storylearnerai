import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LanguageService } from '../languageService'
import { supabase } from '../../client'

vi.mock('../../client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(),
        eq: vi.fn(() => ({ single: vi.fn() }))
      }))
    }))
  }
}))

describe('LanguageService', () => {
  const service = new LanguageService()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getLanguages', () => {
    it('returns mapped languages and orders by name', async () => {
      const mockRows = [
        { id: 2, code: 'es', name: 'Spanish', native_name: 'Español', created_at: 't2' },
        { id: 1, code: 'en', name: 'English', native_name: 'English', created_at: 't1' },
      ]
      const mockSupabase = vi.mocked(supabase)
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockRows, error: null })
        })
      } as unknown as any)

      const result = await service.getLanguages()

      expect(mockSupabase.from).toHaveBeenCalledWith('languages')
      expect(result).toEqual([
        { id: 2, code: 'es', name: 'Spanish', native_name: 'Español', created_at: 't2' },
        { id: 1, code: 'en', name: 'English', native_name: 'English', created_at: 't1' },
      ])
    })

    it('throws on DB error', async () => {
      const mockSupabase = vi.mocked(supabase)
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: { message: 'boom' } })
        })
      } as unknown as any)

      await expect(service.getLanguages()).rejects.toThrow('Failed to fetch languages: boom')
    })
  })

  describe('getLanguageByCode', () => {
    it('returns mapped language by code', async () => {
      const row = { id: 1, code: 'en', name: 'English', native_name: 'English', created_at: 't1' }
      const mockSupabase = vi.mocked(supabase)
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: row, error: null })
          })
        })
      } as unknown as any)

      const result = await service.getLanguageByCode('en')
      expect(result).toEqual(row)
    })

    it('returns null when not found', async () => {
      const mockSupabase = vi.mocked(supabase)
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
          })
        })
      } as unknown as any)

      const result = await service.getLanguageByCode('xx' as any)
      expect(result).toBeNull()
    })

    it('throws on DB error', async () => {
      const mockSupabase = vi.mocked(supabase)
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'fail' } })
          })
        })
      } as unknown as any)

      await expect(service.getLanguageByCode('en')).rejects.toThrow('Failed to fetch language: fail')
    })
  })

  describe('getLanguageName', () => {
    it('returns English name for known code', async () => {
      const spy = vi.spyOn(service, 'getLanguageByCode').mockResolvedValue({
        id: 1, code: 'es', name: 'Spanish', native_name: 'Español', created_at: 't'
      })

      const name = await service.getLanguageName('es')
      expect(spy).toHaveBeenCalledWith('es')
      expect(name).toBe('Spanish')
    })

    it('falls back to language name defaults when fetch fails', async () => {
      vi.spyOn(service, 'getLanguageByCode').mockRejectedValue(new Error('db down'))
      const name = await service.getLanguageName('en')
      expect(name).toBe('English')
    })
  })
})
