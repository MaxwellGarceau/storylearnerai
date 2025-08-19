import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SavedTranslationService } from '../savedTranslationService';
import type { CreateSavedTranslationRequest, UpdateSavedTranslationRequest } from '../../../../types/database';

// Import the actual validation functions for direct testing
import { validateStoryText } from '../../../../lib/utils/sanitization';

// Mock the sanitization utilities for service tests, but use real ones for direct validation tests
vi.mock('../../../../lib/utils/sanitization', async () => {
  const actual = await vi.importActual('../../../../lib/utils/sanitization');
  return {
    ...actual,
    // Keep the real functions for direct testing
    validateStoryText: actual.validateStoryText,
    sanitizeText: actual.sanitizeText
  };
});

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
        original_story: 'Test story',
        translated_story: 'Historia de prueba',
        original_language_id: 1,
        translated_language_id: 2,
        difficulty_level_id: 1,
        title: 'Test Title',
        notes: 'Test notes',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        original_language: { id: 1, code: 'en', name: 'English' },
        translated_language: { id: 2, code: 'es', name: 'Spanish' },
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

  beforeEach(() => {
    service = new SavedTranslationService();
  });

  describe('createSavedTranslation', () => {
    const validRequest: CreateSavedTranslationRequest = {
      original_story: 'This is a test story in English.',
      translated_story: 'Esta es una historia de prueba en español.',
      original_language_code: 'en',
      translated_language_code: 'es',
      difficulty_level_code: 'a1',
      title: 'Test Translation',
      notes: 'This is a test translation'
    };

    it('should throw error for missing user ID', async () => {
      await expect(service.createSavedTranslation(validRequest, ''))
        .rejects.toThrow('Validation failed: user_id: Valid user ID is required');
    });

    it('should throw error for missing original story', async () => {
      const invalidRequest = { ...validRequest, original_story: '' };
      await expect(service.createSavedTranslation(invalidRequest, 'test-user-id'))
        .rejects.toThrow('Validation failed: original_story: Original story is required');
    });

    it('should throw error for missing translated story', async () => {
      const invalidRequest = { ...validRequest, translated_story: '' };
      await expect(service.createSavedTranslation(invalidRequest, 'test-user-id'))
        .rejects.toThrow('Validation failed: translated_story: Translated story is required');
    });

    it('should throw error for invalid original language code', async () => {
      const invalidRequest = { ...validRequest, original_language_code: 'invalid' as 'en' | 'es' };
      await expect(service.createSavedTranslation(invalidRequest, 'test-user-id'))
        .rejects.toThrow('Validation failed: original_language_code: Original language code must be a valid ISO 639-1 code');
    });

    it('should throw error for invalid translated language code', async () => {
      const invalidRequest = { ...validRequest, translated_language_code: 'invalid' as 'en' | 'es' };
      await expect(service.createSavedTranslation(invalidRequest, 'test-user-id'))
        .rejects.toThrow('Validation failed: translated_language_code: Translated language code must be a valid ISO 639-1 code');
    });

    it('should throw error for invalid difficulty level code', async () => {
      const invalidRequest = { ...validRequest, difficulty_level_code: 'invalid' as 'a1' | 'a2' | 'b1' | 'b2' };
      await expect(service.createSavedTranslation(invalidRequest, 'test-user-id'))
        .rejects.toThrow('Validation failed: difficulty_level_code: Difficulty level code must be a valid CEFR level (a1, a2, b1, b2)');
    });

    it('should reject malicious content in original story', async () => {
      const maliciousRequest = {
        ...validRequest,
        original_story: '<script>alert("xss")</script>This is a test story.'
      };
      
      await expect(service.createSavedTranslation(maliciousRequest, 'test-user-id'))
        .rejects.toThrow('Validation failed: original_story: Input contains potentially dangerous content');
    });

    it('should reject malicious content in translated story', async () => {
      const maliciousRequest = {
        ...validRequest,
        translated_story: '<script>alert("xss")</script>Esta es una historia de prueba.'
      };
      
      await expect(service.createSavedTranslation(maliciousRequest, 'test-user-id'))
        .rejects.toThrow('Validation failed: translated_story: Input contains potentially dangerous content');
    });

    it('should reject malicious content in title', () => {
      const maliciousTitle = '<script>alert("xss")</script>Test Title';
      const validation = validateStoryText(maliciousTitle);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Input contains potentially dangerous content');
    });

    it('should reject malicious content in notes', () => {
      const maliciousNotes = '<script>alert("xss")</script>Test notes';
      const validation = validateStoryText(maliciousNotes);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Input contains potentially dangerous content');
    });
  });

  describe('updateSavedTranslation', () => {
    const validUpdates: UpdateSavedTranslationRequest = {
      title: 'Updated Title',
      notes: 'Updated notes'
    };

    it('should throw error for missing translation ID', async () => {
      await expect(service.updateSavedTranslation('', 'test-user-id', validUpdates))
        .rejects.toThrow('Valid translation ID is required');
    });

    it('should throw error for missing user ID', async () => {
      await expect(service.updateSavedTranslation('1', '', validUpdates))
        .rejects.toThrow('Valid user ID is required');
    });

    it('should reject malicious content in title update', () => {
      const maliciousTitle = '<script>alert("xss")</script>Updated Title';
      const validation = validateStoryText(maliciousTitle);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Input contains potentially dangerous content');
    });

    it('should reject malicious content in notes update', () => {
      const maliciousNotes = '<script>alert("xss")</script>Updated notes';
      const validation = validateStoryText(maliciousNotes);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Input contains potentially dangerous content');
    });
  });

  describe('getSavedTranslation', () => {
    it('should throw error for missing translation ID', async () => {
      await expect(service.getSavedTranslation('', 'test-user-id'))
        .rejects.toThrow('Valid translation ID is required');
    });

    it('should throw error for missing user ID', async () => {
      await expect(service.getSavedTranslation('1', ''))
        .rejects.toThrow('Valid user ID is required');
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
}); 