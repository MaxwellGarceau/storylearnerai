import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SavedTranslationService } from '../savedTranslationService';
import { supabase } from '../../client';
import {
  CreateSavedTranslationRequest,
  UpdateSavedTranslationRequest,
  SavedTranslationFilters,
} from '../../../../lib/types/savedTranslations';

// Mock the Supabase client
vi.mock('../../client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockSupabase = supabase as any;

// Helper function to create a mock Supabase query builder
const createMockQueryBuilder = (returnValue: any) => {
  const mockBuilder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue(returnValue),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue(returnValue),
    single: vi.fn().mockResolvedValue(returnValue),
    count: vi.fn().mockResolvedValue(returnValue),
  };
  return mockBuilder;
};

describe('SavedTranslationService', () => {
  let service: SavedTranslationService;

  beforeEach(() => {
    service = new SavedTranslationService();
    vi.clearAllMocks();
  });

  describe('getLanguages', () => {
    it('should fetch languages successfully', async () => {
      const mockLanguages = [
        { id: '1', code: 'en', name: 'English', native_name: 'English', created_at: '2024-01-01' },
        { id: '2', code: 'es', name: 'Spanish', native_name: 'Español', created_at: '2024-01-01' },
      ];

      const mockBuilder = createMockQueryBuilder({ data: mockLanguages, error: null });
      mockSupabase.from.mockReturnValue(mockBuilder);

      const result = await service.getLanguages();

      expect(result).toEqual(mockLanguages);
      expect(mockSupabase.from).toHaveBeenCalledWith('languages');
    });

    it('should handle errors when fetching languages', async () => {
      const mockBuilder = createMockQueryBuilder({ data: null, error: { message: 'Database error' } });
      mockSupabase.from.mockReturnValue(mockBuilder);

      await expect(service.getLanguages()).rejects.toThrow('Failed to fetch languages: Database error');
    });
  });

  describe('getDifficultyLevels', () => {
    it('should fetch difficulty levels successfully', async () => {
      const mockDifficultyLevels = [
        { id: '1', code: 'beginner', name: 'Beginner', description: 'Simple vocabulary', created_at: '2024-01-01' },
        { id: '2', code: 'intermediate', name: 'Intermediate', description: 'Moderate complexity', created_at: '2024-01-01' },
      ];

      const mockBuilder = createMockQueryBuilder({ data: mockDifficultyLevels, error: null });
      mockSupabase.from.mockReturnValue(mockBuilder);

      const result = await service.getDifficultyLevels();

      expect(result).toEqual(mockDifficultyLevels);
      expect(mockSupabase.from).toHaveBeenCalledWith('difficulty_levels');
    });
  });

  describe('getLanguageByCode', () => {
    it('should fetch language by code successfully', async () => {
      const mockLanguage = { id: '1', code: 'en', name: 'English', native_name: 'English', created_at: '2024-01-01' };

      const mockBuilder = createMockQueryBuilder({ data: mockLanguage, error: null });
      mockSupabase.from.mockReturnValue(mockBuilder);

      const result = await service.getLanguageByCode('en');

      expect(result).toEqual(mockLanguage);
    });

    it('should return null when language not found', async () => {
      const mockBuilder = createMockQueryBuilder({ data: null, error: { code: 'PGRST116' } });
      mockSupabase.from.mockReturnValue(mockBuilder);

      const result = await service.getLanguageByCode('invalid');

      expect(result).toBeNull();
    });
  });

  describe('createSavedTranslation', () => {
    it('should create saved translation successfully', async () => {
      const mockLanguages = [
        { id: '1', code: 'en', name: 'English' },
        { id: '2', code: 'es', name: 'Spanish' },
      ];
      const mockDifficultyLevel = { id: '1', code: 'beginner', name: 'Beginner' };
      const mockSavedTranslation = {
        id: '1',
        user_id: 'user123',
        original_story: 'Hello world',
        translated_story: 'Hola mundo',
        original_language_id: '1',
        translated_language_id: '2',
        difficulty_level_id: '1',
        title: 'Test Translation',
        notes: 'Test notes',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        original_language: mockLanguages[0],
        translated_language: mockLanguages[1],
        difficulty_level: mockDifficultyLevel,
      };

      // Mock the language and difficulty level lookups
      const mockBuilder1 = createMockQueryBuilder({ data: mockLanguages[0], error: null });
      const mockBuilder2 = createMockQueryBuilder({ data: mockLanguages[1], error: null });
      const mockBuilder3 = createMockQueryBuilder({ data: mockDifficultyLevel, error: null });
      const mockBuilder4 = createMockQueryBuilder({ data: mockSavedTranslation, error: null });
      
      mockSupabase.from
        .mockReturnValueOnce(mockBuilder1)
        .mockReturnValueOnce(mockBuilder2)
        .mockReturnValueOnce(mockBuilder3)
        .mockReturnValueOnce(mockBuilder4);

      const request: CreateSavedTranslationRequest = {
        original_story: 'Hello world',
        translated_story: 'Hola mundo',
        original_language_code: 'en',
        translated_language_code: 'es',
        difficulty_level_code: 'beginner',
        title: 'Test Translation',
        notes: 'Test notes',
      };

      const result = await service.createSavedTranslation(request, 'user123');

      expect(result).toEqual(mockSavedTranslation);
    });

    it('should throw error when language not found', async () => {
      const mockBuilder = createMockQueryBuilder({ data: null, error: { code: 'PGRST116' } });
      mockSupabase.from.mockReturnValue(mockBuilder);

      const request: CreateSavedTranslationRequest = {
        original_story: 'Hello world',
        translated_story: 'Hola mundo',
        original_language_code: 'invalid',
        translated_language_code: 'es',
        difficulty_level_code: 'beginner',
      };

      await expect(service.createSavedTranslation(request, 'user123')).rejects.toThrow('Language not found: invalid');
    });
  });

  describe('getSavedTranslations', () => {
    it('should fetch saved translations with filters', async () => {
      const mockTranslations = [
        {
          id: '1',
          user_id: 'user123',
          original_story: 'Hello world',
          translated_story: 'Hola mundo',
          original_language_id: '1',
          translated_language_id: '2',
          difficulty_level_id: '1',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          original_language: { id: '1', code: 'en', name: 'English' },
          translated_language: { id: '2', code: 'es', name: 'Spanish' },
          difficulty_level: { id: '1', code: 'beginner', name: 'Beginner' },
        },
      ];

      // Create a mock builder that returns different values for different calls
      const mockLanguageBuilder = createMockQueryBuilder({ data: { id: '1', code: 'en' }, error: null });
      const mockTranslationsBuilder = createMockQueryBuilder({ data: mockTranslations, error: null });
      
      mockSupabase.from
        .mockReturnValueOnce(mockLanguageBuilder)
        .mockReturnValueOnce(mockTranslationsBuilder);

      const filters: SavedTranslationFilters = {
        original_language_code: 'en',
        limit: 10,
        offset: 0,
      };

      const result = await service.getSavedTranslations('user123', filters);

      expect(result).toEqual(mockTranslations);
    });
  });

  describe('updateSavedTranslation', () => {
    it('should update saved translation successfully', async () => {
      const mockUpdatedTranslation = {
        id: '1',
        user_id: 'user123',
        original_story: 'Hello world',
        translated_story: 'Hola mundo',
        original_language_id: '1',
        translated_language_id: '2',
        difficulty_level_id: '1',
        title: 'Updated Title',
        notes: 'Updated notes',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
        original_language: { id: '1', code: 'en', name: 'English' },
        translated_language: { id: '2', code: 'es', name: 'Spanish' },
        difficulty_level: { id: '1', code: 'beginner', name: 'Beginner' },
      };

      const mockBuilder = createMockQueryBuilder({ data: mockUpdatedTranslation, error: null });
      mockSupabase.from.mockReturnValue(mockBuilder);

      const updates: UpdateSavedTranslationRequest = {
        title: 'Updated Title',
        notes: 'Updated notes',
      };

      const result = await service.updateSavedTranslation('1', 'user123', updates);

      expect(result).toEqual(mockUpdatedTranslation);
    });
  });

  describe('deleteSavedTranslation', () => {
    it('should delete saved translation successfully', async () => {
      const mockBuilder = createMockQueryBuilder({ error: null });
      mockSupabase.from.mockReturnValue(mockBuilder);

      await expect(service.deleteSavedTranslation('1', 'user123')).resolves.not.toThrow();
    });

    it('should handle errors when deleting', async () => {
      const mockBuilder = createMockQueryBuilder({ error: { message: 'Delete failed' } });
      mockSupabase.from.mockReturnValue(mockBuilder);

      await expect(service.deleteSavedTranslation('1', 'user123')).rejects.toThrow('Failed to delete saved translation: Delete failed');
    });
  });

  describe('getSavedTranslationsCount', () => {
    it('should get count successfully', async () => {
      const mockBuilder = createMockQueryBuilder({ count: 5, error: null });
      mockSupabase.from.mockReturnValue(mockBuilder);

      const result = await service.getSavedTranslationsCount('user123');

      expect(result).toBe(5);
    });
  });
}); 