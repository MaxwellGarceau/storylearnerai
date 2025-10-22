import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { SavedTranslationService } from '../savedTranslationService';
import type { SaveTranslationParams } from '../../../../types/app/translations';
import type { LanguageCode, DifficultyLevel } from '../../../../types/llm/prompts';

// Mock the sanitization utilities
vi.mock('../../../../lib/utils/sanitization', () => ({
  validateStoryText: vi.fn(),
  sanitizeText: vi.fn()
}));

// Mock the language and difficulty services
vi.mock('../languageService', () => ({
  LanguageService: vi.fn().mockImplementation(() => ({
    getLanguageByCode: vi.fn()
  }))
}));

vi.mock('../difficultyLevelService', () => ({
  DifficultyLevelService: vi.fn().mockImplementation(() => ({
    getDifficultyLevelByCode: vi.fn()
  }))
}));

// Create comprehensive mock query builder
const createMockQueryBuilder = () => {
  const mockBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
    count: vi.fn().mockResolvedValue({ count: 0, error: null }),
  };

  // Configure single() to return different data based on the table being queried
  mockBuilder.single.mockImplementation(() => {
    return Promise.resolve({
      data: {
        id: 1,
        code: 'en',
        name: 'English',
        user_id: 'test-user-id',
        from_text: 'Test story',
        to_text: 'Historia de prueba',
        from_language_id: 1,
        to_language_id: 2,
        difficulty_level_id: 1,
        title: 'Test Title',
        notes: 'Test notes',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        from_language: { id: 1, code: 'en', name: 'English' },
        to_language: { id: 2, code: 'es', name: 'Spanish' },
        difficulty_level: { id: 1, code: 'a1', name: 'Beginner' }
      },
      error: null
    });
  });

  // Make all methods chainable
  Object.keys(mockBuilder).forEach(key => {
    if (key !== 'single' && key !== 'count') {
      mockBuilder[key as keyof typeof mockBuilder] = vi.fn().mockReturnValue(mockBuilder);
    }
  });

  return mockBuilder;
};

// Mock Supabase client with comprehensive setup
vi.mock('../client', () => ({
  supabase: {
    from: vi.fn(() => createMockQueryBuilder())
  }
}));

describe('SavedTranslationService', () => {
  let service: SavedTranslationService;
  let mockLanguageService: unknown;
  let mockDifficultyLevelService: unknown;

  beforeEach(async () => {
    // Import the mocked services
    const { LanguageService } = await import('../languageService');
    const { DifficultyLevelService } = await import('../difficultyLevelService');

    mockLanguageService = new LanguageService();
    mockDifficultyLevelService = new DifficultyLevelService();

    // Configure language service mock
    (mockLanguageService as { getLanguageByCode: MockedFunction<(code: string) => unknown> }).getLanguageByCode.mockImplementation((code: string) => {
      if (code === 'en') return { id: 1, code: 'en', name: 'English' };
      if (code === 'es') return { id: 2, code: 'es', name: 'Spanish' };
      return null;
    });

    // Configure difficulty level service mock
    (mockDifficultyLevelService as { getDifficultyLevelByCode: MockedFunction<(code: string) => unknown> }).getDifficultyLevelByCode.mockImplementation((code: string) => {
      if (code === 'a1') return { id: 1, code: 'a1', name: 'A1' };
      return null;
    });
    service = new SavedTranslationService();
  });

  describe('saveTranslationWithTokens', () => {
    const validRequest: SaveTranslationParams = {
      userId: 'test-user-id',
      fromLanguage: 'en',
      toLanguage: 'es',
      fromText: 'This is a test story in English.',
      toText: 'Esta es una historia de prueba en español.',
      difficultyLevel: 'a1',
      title: 'Test Translation',
      notes: 'This is a test translation',
      tokens: []
    };

    it('should throw error for invalid language code', async () => {
      const invalidRequest = { ...validRequest, fromLanguage: 'invalid' as LanguageCode };
      await expect(service.saveTranslationWithTokens(invalidRequest))
        .rejects.toThrow('Language not found: invalid');
    });

    it('should throw error for invalid difficulty level', async () => {
      const invalidRequest = { ...validRequest, difficultyLevel: 'invalid' as DifficultyLevel };
      await expect(service.saveTranslationWithTokens(invalidRequest))
        .rejects.toThrow('Language not found: en');
    });
  });

  describe('getSavedTranslations', () => {
    it('should throw error for missing user ID', async () => {
      await expect(service.getSavedTranslations('', {}))
        .rejects.toThrow('Valid user ID is required');
    });

    it('should throw error for invalid search parameter', async () => {
      await expect(service.getSavedTranslations('test-user-id', { search: 123 as unknown as string }))
        .rejects.toThrow('Search parameter must be a string');
    });
  });

  describe('getSavedTranslationsCount', () => {
    it('should throw error for missing user ID', async () => {
      await expect(service.getSavedTranslationsCount('', {}))
        .rejects.toThrow('Valid user ID is required');
    });

    it('should throw error for invalid search parameter', async () => {
      await expect(service.getSavedTranslationsCount('test-user-id', { search: 123 as unknown as string }))
        .rejects.toThrow('Search parameter must be a string');
    });
  });

  describe('deleteSavedTranslation', () => {
    it('should throw error for missing translation ID', async () => {
      await expect(service.deleteSavedTranslation(0, 'test-user-id'))
        .rejects.toThrow('Valid translation ID is required');
    });

    it('should throw error for missing user ID', async () => {
      await expect(service.deleteSavedTranslation(1, ''))
        .rejects.toThrow('Valid user ID is required');
    });
  });
});
