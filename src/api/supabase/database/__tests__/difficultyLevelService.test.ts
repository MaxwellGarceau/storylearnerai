import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DifficultyLevelService } from '../difficultyLevelService'
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

describe('DifficultyLevelService', () => {
  const service = new DifficultyLevelService()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDifficultyLevels', () => {
    it('returns mapped difficulty levels ordered by id', async () => {
      const mockRows = [
        { id: 1, code: 'a1', name: 'A1 (Beginner)', description: 'd1', created_at: 't1' },
        { id: 2, code: 'b2', name: 'B2 (Upper Intermediate)', description: 'd2', created_at: 't2' },
      ]
      const mockSupabase = vi.mocked(supabase)
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockRows, error: null })
        })
      } as ReturnType<typeof supabase.from>)

      const result = await service.getDifficultyLevels()
      expect(mockSupabase.from).toHaveBeenCalledWith('difficulty_levels')
      expect(result).toEqual([
        { id: 1, code: 'a1', name: 'A1 (Beginner)', description: 'd1', created_at: 't1' },
        { id: 2, code: 'b2', name: 'B2 (Upper Intermediate)', description: 'd2', created_at: 't2' },
      ])
    })

    it('throws on DB error', async () => {
      const mockSupabase = vi.mocked(supabase)
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: { message: 'oops' } })
        })
      } as ReturnType<typeof supabase.from>)

      await expect(service.getDifficultyLevels()).rejects.toThrow('Failed to fetch difficulty levels: oops')
    })
  })

  describe('getDifficultyLevelByCode', () => {
    it('returns mapped difficulty by code', async () => {
      const row = { id: 1, code: 'a1', name: 'A1 (Beginner)', description: 'd', created_at: 't' }
      const mockSupabase = vi.mocked(supabase)
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: row, error: null })
          })
        })
      } as ReturnType<typeof supabase.from>)

      const result = await service.getDifficultyLevelByCode('a1')
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
      } as ReturnType<typeof supabase.from>)

      const result = await service.getDifficultyLevelByCode('zz')
      expect(result).toBeNull()
    })

    it('throws on DB error', async () => {
      const mockSupabase = vi.mocked(supabase)
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'nope' } })
          })
        })
      } as ReturnType<typeof supabase.from>)

      await expect(service.getDifficultyLevelByCode('a1')).rejects.toThrow('Failed to fetch difficulty level: nope')
    })
  })

  describe('getDifficultyLevelName', () => {
    it('returns display name when found', async () => {
      const spy = vi.spyOn(service, 'getDifficultyLevelByCode').mockResolvedValue({
        id: 1, code: 'b2', name: 'B2 (Upper Intermediate)', description: 'd', created_at: 't'
      })

      const name = await service.getDifficultyLevelName('b2')
      expect(spy).toHaveBeenCalledWith('b2')
      expect(name).toBe('B2 (Upper Intermediate)')
    })

    it('falls back to code on error', async () => {
      vi.spyOn(service, 'getDifficultyLevelByCode').mockRejectedValue(new Error('down'))
      const name = await service.getDifficultyLevelName('a1')
      expect(name).toBe('a1')
    })
  })
})
