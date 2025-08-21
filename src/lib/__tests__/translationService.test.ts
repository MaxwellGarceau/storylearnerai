import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { llmServiceManager } from '../llm/LLMServiceManager';
import { EnvironmentConfig } from '../config/env';

// Mock dependencies before importing translationService
vi.mock('../llm/LLMServiceManager', () => ({
  llmServiceManager: {
    generateCompletion: vi.fn(),
    healthCheck: vi.fn(),
    getProvider: vi.fn(),
    getModel: vi.fn(),
  },
}));

vi.mock('../config/env', () => ({
  EnvironmentConfig: {
    isMockTranslationEnabled: vi.fn(),
    getLLMConfig: vi.fn(),
  },
}));

// Import after mocking
import { translationService } from '../translationService';

describe('translationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock EnvironmentConfig methods
    vi.mocked(EnvironmentConfig.isMockTranslationEnabled).mockReturnValue(
      false
    );
    vi.mocked(EnvironmentConfig.getLLMConfig).mockReturnValue({
      provider: 'gemini',
      apiKey: 'test-api-key',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta',
      model: 'gemini-1.5-flash',
      maxTokens: 2000,
      temperature: 0.7,
      projectId: 'test-project',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('translate', () => {
    it('should use mock translation when enabled', async () => {
      vi.mocked(EnvironmentConfig.isMockTranslationEnabled).mockReturnValue(
        true
      );

      const request = {
        text: 'Hello world',
        fromLanguage: 'en' as const,
        toLanguage: 'es' as const,
        difficulty: 'a1' as const,
      };

      const result = await translationService.translate(request);

      expect(result).toEqual({
        originalText: 'Hello world',
        translatedText: expect.stringContaining(
          '[TRANSLATED FROM SPANISH - a1 LEVEL]'
        ) as string,
        fromLanguage: 'en',
        toLanguage: 'es',
        difficulty: 'a1',
        provider: 'mock',
        model: 'mock-model',
      });
    });

    it('should use real translation when mock is disabled', async () => {
      vi.mocked(EnvironmentConfig.isMockTranslationEnabled).mockReturnValue(
        false
      );
      vi.mocked(llmServiceManager.generateCompletion).mockResolvedValue({
        content: 'Hola mundo',
        provider: 'gemini',
        model: 'gemini-1.5-flash',
      } as unknown as Awaited<
        ReturnType<typeof llmServiceManager.generateCompletion>
      >);

      const request = {
        text: 'Hello world',
        fromLanguage: 'en' as const,
        toLanguage: 'es' as const,
        difficulty: 'a1' as const,
      };

      const result = await translationService.translate(request);

      expect(result).toEqual({
        originalText: 'Hello world',
        translatedText: 'Hola mundo',
        fromLanguage: 'en',
        toLanguage: 'es',
        difficulty: 'a1',
        provider: 'gemini',
        model: 'gemini-1.5-flash',
      });
    });

    it('should handle translation errors', async () => {
      vi.mocked(EnvironmentConfig.isMockTranslationEnabled).mockReturnValue(
        false
      );
      vi.mocked(llmServiceManager.generateCompletion).mockRejectedValue(
        new Error('Translation failed')
      );

      const request = {
        text: 'Hello world',
        fromLanguage: 'en' as const,
        toLanguage: 'es' as const,
        difficulty: 'a1' as const,
      };

      await expect(translationService.translate(request)).rejects.toThrow(
        'Translation failed'
      );
    });
  });

  describe('isLLMServiceAvailable', () => {
    it('should return true when mock translation is enabled', async () => {
      vi.mocked(EnvironmentConfig.isMockTranslationEnabled).mockReturnValue(
        true
      );

      const result = await translationService.isLLMServiceAvailable();

      expect(result).toBe(true);
    });

    it('should check health when mock translation is disabled', async () => {
      vi.mocked(EnvironmentConfig.isMockTranslationEnabled).mockReturnValue(
        false
      );
      vi.mocked(llmServiceManager.healthCheck).mockResolvedValue(true);

      const result = await translationService.isLLMServiceAvailable();

      expect(result).toBe(true);
      expect(llmServiceManager.healthCheck).toHaveBeenCalled();
    });

    it('should return false when health check fails', async () => {
      vi.mocked(EnvironmentConfig.isMockTranslationEnabled).mockReturnValue(
        false
      );
      vi.mocked(llmServiceManager.healthCheck).mockRejectedValue(
        new Error('Service unavailable')
      );

      const result = await translationService.isLLMServiceAvailable();

      expect(result).toBe(false);
    });
  });

  describe('getLLMProviderInfo', () => {
    it('should return provider info', () => {
      vi.mocked(llmServiceManager.getProvider).mockReturnValue('gemini');
      vi.mocked(llmServiceManager.getModel).mockReturnValue('gemini-1.5-flash');

      const result = translationService.getLLMProviderInfo();

      expect(result).toEqual({
        provider: 'gemini',
        model: 'gemini-1.5-flash',
      });
    });
  });

  describe('isMockTranslationEnabled', () => {
    it('should return the value from EnvironmentConfig', () => {
      vi.mocked(EnvironmentConfig.isMockTranslationEnabled).mockReturnValue(
        true
      );
      expect(translationService.isMockTranslationEnabled()).toBe(true);

      vi.mocked(EnvironmentConfig.isMockTranslationEnabled).mockReturnValue(
        false
      );
      expect(translationService.isMockTranslationEnabled()).toBe(false);
    });
  });
});
