import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VocabularyService } from '../../lib/vocabularyService';

// Mock Supabase client
vi.mock('../../lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

describe('VocabularyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveVocabularyWord', () => {
    it('should save a vocabulary word successfully', async () => {
      const mockVocabularyData = {
        user_id: 'test-user-id',
        original_word: 'hello',
        translated_word: 'hola',
        translated_language_id: 2,
        from_language_id: 1,
        original_word_context: 'Hello, how are you?',
        translated_word_context: 'Hola, ¿cómo estás?',
        definition: 'A greeting',
        part_of_speech: 'interjection',
        frequency_level: 'common',
      };

      const mockResponse = {
        data: { id: 1, ...mockVocabularyData },
        error: null,
      };

      const mockSupabaseChain = {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      };

      (supabase.from as any).mockReturnValue(mockSupabaseChain);

      const result =
        await VocabularyService.saveVocabularyWord(mockVocabularyData);

      expect(supabase.from).toHaveBeenCalledWith('vocabulary');
      expect(mockSupabaseChain.insert).toHaveBeenCalledWith(mockVocabularyData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw an error when save fails', async () => {
      const mockVocabularyData = {
        user_id: 'test-user-id',
        original_word: 'hello',
        translated_word: 'hola',
        translated_language_id: 2,
        from_language_id: 1,
      };

      const mockResponse = {
        data: null,
        error: { message: 'Database error' },
      };

      const mockSupabaseChain = {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      };

      (supabase.from as any).mockReturnValue(mockSupabaseChain);

      await expect(
        VocabularyService.saveVocabularyWord(mockVocabularyData)
      ).rejects.toThrow('Failed to save vocabulary word: Database error');
    });
  });

  describe('getUserVocabulary', () => {
    it('should fetch user vocabulary successfully', async () => {
      const mockVocabularyList = [
        {
          id: 1,
          user_id: 'test-user-id',
          original_word: 'hello',
          translated_word: 'hola',
          translated_language_id: 2,
          from_language_id: 1,
          translated_language: {
            id: 2,
            code: 'es',
            name: 'Spanish',
            native_name: 'Español',
          },
          from_language: {
            id: 1,
            code: 'en',
            name: 'English',
            native_name: 'English',
          },
        },
      ];

      const mockResponse = {
        data: mockVocabularyList,
        error: null,
      };

      const mockSupabaseChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
      };

      (supabase.from as any).mockReturnValue(mockSupabaseChain);

      const result = await VocabularyService.getUserVocabulary('test-user-id');

      expect(supabase.from).toHaveBeenCalledWith('vocabulary');
      expect(result).toEqual(mockVocabularyList);
    });
  });

  describe('checkVocabularyExists', () => {
    it('should return true when vocabulary exists', async () => {
      const mockResponse = {
        data: { id: 1 },
        error: null,
      };

      const mockSupabaseChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(mockResponse),
                }),
              }),
            }),
          }),
        }),
      };

      (supabase.from as any).mockReturnValue(mockSupabaseChain);

      const result = await VocabularyService.checkVocabularyExists(
        'test-user-id',
        'hello',
        'hola',
        1,
        2
      );

      expect(result).toBe(true);
    });

    it('should return false when vocabulary does not exist', async () => {
      const mockResponse = {
        data: null,
        error: { code: 'PGRST116' }, // Not found error
      };

      const mockSupabaseChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(mockResponse),
                }),
              }),
            }),
          }),
        }),
      };

      (supabase.from as any).mockReturnValue(mockSupabaseChain);

      const result = await VocabularyService.checkVocabularyExists(
        'test-user-id',
        'hello',
        'hola',
        1,
        2
      );

      expect(result).toBe(false);
    });
  });
});
