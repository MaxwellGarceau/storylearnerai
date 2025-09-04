import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VocabularyService } from '../../lib/vocabularyService';
import { supabase } from '../../api/supabase/client';

// Mock types for Supabase query builder
type MockSupabaseResponse = Promise<{ data: unknown; error: null }>;
type MockSupabaseInsertFn = (data: unknown) => MockSupabaseQueryBuilder;
type MockSupabaseQueryBuilder = {
  upsert: (data: unknown, options?: unknown) => MockSupabaseQueryBuilder;
  insert: MockSupabaseInsertFn;
  select: (columns?: string) => MockSupabaseQueryBuilder;
  eq: (column: string, value: unknown) => MockSupabaseQueryBuilder;
  order: (
    column: string,
    options?: { ascending?: boolean }
  ) => MockSupabaseResponse;
  single: () => MockSupabaseResponse;
  update: (data: unknown) => MockSupabaseQueryBuilder;
  delete: () => MockSupabaseQueryBuilder;
};

// Mock Supabase client with specific method mocking
vi.mock('../../api/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({ data: { id: 1 }, error: null })
          ),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({ data: { id: 1 }, error: null })
          ),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn(() => ({
                    single: vi.fn(() =>
                      Promise.resolve({ data: { id: 1 }, error: null })
                    ),
                  })),
                })),
              })),
            })),
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: { id: 1 }, error: null })
            ),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
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

      const mockSupabaseChain: MockSupabaseQueryBuilder = {
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse),
          }),
          eq: vi.fn(),
          order: vi.fn(),
          single: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        }),
        insert: vi.fn(),
        select: vi.fn(),
        eq: vi.fn(),
        order: vi.fn(),
        single: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };

      vi.mocked(supabase.from).mockReturnValue(mockSupabaseChain);

      const result =
        await VocabularyService.saveVocabularyWord(mockVocabularyData);

      expect(supabase.from).toHaveBeenCalledWith('vocabulary');
      expect(mockSupabaseChain.upsert).toHaveBeenCalled();
      expect(mockSupabaseChain.upsert).toHaveBeenCalledWith(
        mockVocabularyData,
        expect.anything()
      );
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

      const mockSupabaseChain: MockSupabaseQueryBuilder = {
        upsert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse),
          }),
          eq: vi.fn(),
          order: vi.fn(),
          single: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        }),
        insert: vi.fn(),
        select: vi.fn(),
        eq: vi.fn(),
        order: vi.fn(),
        single: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };

      vi.mocked(supabase.from).mockReturnValue(mockSupabaseChain);

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

      const mockSupabaseChain: MockSupabaseQueryBuilder = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(mockResponse),
          }),
        }),
        insert: vi.fn(),
        eq: vi.fn(),
        order: vi.fn(),
        single: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };

      vi.mocked(supabase.from).mockReturnValue(mockSupabaseChain);

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

      // Simple mock that chains eq() calls and resolves on single()
      const mockQueryBuilder = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResponse),
      };

      const mockSupabaseChain: MockSupabaseQueryBuilder = {
        select: vi.fn().mockReturnValue(mockQueryBuilder),
        insert: vi.fn(),
        eq: vi.fn(),
        order: vi.fn(),
        single: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };

      vi.mocked(supabase.from).mockReturnValue(mockSupabaseChain);

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

      // Simple mock that chains eq() calls and resolves on single()
      const mockQueryBuilder = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResponse),
      };

      const mockSupabaseChain: MockSupabaseQueryBuilder = {
        select: vi.fn().mockReturnValue(mockQueryBuilder),
        insert: vi.fn(),
        eq: vi.fn(),
        order: vi.fn(),
        single: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };

      vi.mocked(supabase.from).mockReturnValue(mockSupabaseChain);

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
