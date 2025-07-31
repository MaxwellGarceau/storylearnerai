import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SavedTranslationService } from '../savedTranslationService';
import type { CreateSavedTranslationRequest, UpdateSavedTranslationRequest } from '../../../../lib/types/database';

// Mock the sanitization utilities
vi.mock('../../../../lib/utils/sanitization', () => ({
  validateStoryText: vi.fn((input: string) => {
    if (input.includes('<script>')) {
      return {
        isValid: false,
        errors: ['Input contains potentially dangerous content'],
        sanitizedText: input.replace(/<script[^>]*>.*?<\/script>/gi, '')
      };
    }
    return {
      isValid: true,
      errors: [],
      sanitizedText: input
    };
  }),
  sanitizeText: vi.fn((input: string) => input.replace(/<script[^>]*>.*?<\/script>/gi, ''))
}));

// Mock Supabase client with minimal setup
vi.mock('../client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null, error: null }))
            }))
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null }))
        }))
      }))
    }))
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
      const invalidRequest = { ...validRequest, original_language_code: 'invalid' as any };
      await expect(service.createSavedTranslation(invalidRequest, 'test-user-id'))
        .rejects.toThrow('Validation failed: original_language_code: Original language code must be a valid ISO 639-1 code');
    });

    it('should throw error for invalid translated language code', async () => {
      const invalidRequest = { ...validRequest, translated_language_code: 'invalid' as any };
      await expect(service.createSavedTranslation(invalidRequest, 'test-user-id'))
        .rejects.toThrow('Validation failed: translated_language_code: Translated language code must be a valid ISO 639-1 code');
    });

    it('should throw error for invalid difficulty level code', async () => {
      const invalidRequest = { ...validRequest, difficulty_level_code: 'invalid' as any };
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

    it('should reject malicious content in title', async () => {
      const maliciousRequest = {
        ...validRequest,
        title: '<script>alert("xss")</script>Test Title'
      };
      
      await expect(service.createSavedTranslation(maliciousRequest, 'test-user-id'))
        .rejects.toThrow('Validation failed: title: Input contains potentially dangerous content');
    });

    it('should reject malicious content in notes', async () => {
      const maliciousRequest = {
        ...validRequest,
        notes: '<script>alert("xss")</script>Test notes'
      };
      
      await expect(service.createSavedTranslation(maliciousRequest, 'test-user-id'))
        .rejects.toThrow('Validation failed: notes: Input contains potentially dangerous content');
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

    it('should reject malicious content in title update', async () => {
      const maliciousUpdates = {
        title: '<script>alert("xss")</script>Updated Title'
      };
      
      await expect(service.updateSavedTranslation('1', 'test-user-id', maliciousUpdates))
        .rejects.toThrow('Validation failed: title: Input contains potentially dangerous content');
    });

    it('should reject malicious content in notes update', async () => {
      const maliciousUpdates = {
        notes: '<script>alert("xss")</script>Updated notes'
      };
      
      await expect(service.updateSavedTranslation('1', 'test-user-id', maliciousUpdates))
        .rejects.toThrow('Validation failed: notes: Input contains potentially dangerous content');
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
      await expect(service.deleteSavedTranslation('', 'test-user-id'))
        .rejects.toThrow('Valid translation ID is required');
    });

    it('should throw error for missing user ID', async () => {
      await expect(service.deleteSavedTranslation('1', ''))
        .rejects.toThrow('Valid user ID is required');
    });
  });

  describe('getSavedTranslations', () => {
    it('should throw error for missing user ID', async () => {
      await expect(service.getSavedTranslations('', {}))
        .rejects.toThrow('Valid user ID is required');
    });

    it('should throw error for invalid search parameter', async () => {
      await expect(service.getSavedTranslations('test-user-id', { search: 123 as any }))
        .rejects.toThrow('Search parameter must be a string');
    });
  });

  describe('getSavedTranslationsCount', () => {
    it('should throw error for missing user ID', async () => {
      await expect(service.getSavedTranslationsCount('', {}))
        .rejects.toThrow('Valid user ID is required');
    });

    it('should throw error for invalid search parameter', async () => {
      await expect(service.getSavedTranslationsCount('test-user-id', { search: 123 as any }))
        .rejects.toThrow('Search parameter must be a string');
    });
  });
}); 